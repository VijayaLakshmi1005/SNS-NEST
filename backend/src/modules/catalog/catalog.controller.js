import { CatalogItem } from './catalog.model.js';
import { Wishlist } from './wishlist.model.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { processCatalogMedia } from './upload.engine.js';
import { getIO } from '../../config/socket.js';

export const getAllCatalogItems = catchAsync(async (req, res) => {
  const { category, style, search, minPrice, maxPrice, type, tier, format } = req.query;
  
  let query = {};
  let andConditions = [];
  
  if (format) {
    const formatRegex = new RegExp(format, 'i');
    andConditions.push({ $or: [{ format: formatRegex }, { type: formatRegex }] });
  }

  if (category) {
    const catRegex = new RegExp(category, 'i');
    andConditions.push({ $or: [{ category: catRegex }, { styles: { $regex: catRegex } }, { type: catRegex }] });
  }
  if (type) {
    // Make the type matching more flexible (e.g. "Living Room Design" -> matches "Living Room")
    const baseType = type.replace(/ Design/i, '').replace(/ Interiors/i, '').replace(/ Area/i, '');
    const typeRegex = new RegExp(baseType, 'i');
    andConditions.push({ $or: [{ type: typeRegex }, { roomTypes: { $regex: typeRegex } }, { category: typeRegex }] });
  }
  if (tier) {
    const tierRegex = new RegExp(tier, 'i');
    andConditions.push({ tier: tierRegex });
  }
  if (style) {
    const styleRegex = new RegExp(style, 'i');
    andConditions.push({ styles: { $regex: styleRegex } });
  }
  
  if (search) {
    andConditions.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'images.extractedText': { $regex: search, $options: 'i' } }
      ]
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  if (minPrice || maxPrice) {
    query['pricing.basePrice'] = {};
    if (minPrice) query['pricing.basePrice'].$gte = Number(minPrice);
    if (maxPrice) query['pricing.basePrice'].$lte = Number(maxPrice);
  }

  const items = await CatalogItem.find(query).sort({ createdAt: -1 }).populate('designerRecommendations', 'fullName avatar');
  
  return res.status(200).json(new ApiResponse(200, items, 'Catalog retrieved successfully'));
});

export const getCatalogItem = catchAsync(async (req, res) => {
  const item = await CatalogItem.findById(req.params.id).populate('designerRecommendations', 'fullName avatar');
  if (!item) return res.status(404).json(new ApiResponse(404, null, 'Item not found'));
  
  // Update view count
  item.stats.views += 1;
  await item.save();
  
  // Realtime notification of active viewing
  const io = getIO();
  if (io) {
    io.emit('catalog:item_viewed', { itemId: item._id, views: item.stats.views });
  }

  return res.status(200).json(new ApiResponse(200, item, 'Item retrieved'));
});

export const uploadToCatalog = catchAsync(async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'No files provided for upload'));
  }

  // AI OCR Engine Processing
  const aiData = await processCatalogMedia(files);

  const parsedBody = req.body.data ? JSON.parse(req.body.data) : req.body;
  
  const newItem = await CatalogItem.create({
    title: parsedBody.title || 'Untitled Design',
    slug: (parsedBody.title || 'untitled').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    type: parsedBody.type || 'Service',
    format: parsedBody.format || 'Service',
    category: parsedBody.category || 'Uncategorized',
    tier: parsedBody.tier || 'Standard',
    description: parsedBody.description || aiData.extractedText,
    pricing: {
      basePrice: parsedBody.basePrice || 0,
    },
    styles: aiData.autoTags.styles,
    roomTypes: aiData.autoTags.roomTypes,
    materials: aiData.autoTags.materials,
    images: aiData.processedImages,
    uploadedBy: req.user ? req.user.id : null
  });

  const io = getIO();
  if (io) io.emit('catalog:new_upload', newItem);

  return res.status(201).json(new ApiResponse(201, newItem, 'Media uploaded and processed by AI successfully'));
});

export const toggleWishlist = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }

  const existingIndex = wishlist.items.findIndex(item => item.catalogItem.toString() === id);
  const catalogItem = await CatalogItem.findById(id);

  if (existingIndex > -1) {
    wishlist.items.splice(existingIndex, 1);
    catalogItem.stats.wishlistSaves = Math.max(0, catalogItem.stats.wishlistSaves - 1);
  } else {
    wishlist.items.push({ catalogItem: id });
    catalogItem.stats.wishlistSaves += 1;
  }

  await wishlist.save();
  await catalogItem.save();

  const io = getIO();
  if (io) {
    io.emit('catalog:wishlist_update', { itemId: id, saves: catalogItem.stats.wishlistSaves });
  }

  return res.status(200).json(new ApiResponse(200, { isSaved: existingIndex === -1 }, 'Wishlist updated'));
});

export const getMyWishlist = catchAsync(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  const ids = wishlist ? wishlist.items.map(i => i.catalogItem) : [];
  return res.status(200).json(new ApiResponse(200, ids, 'Wishlist retrieved'));
});

export const getAnalytics = catchAsync(async (req, res) => {
  const totalItems = await CatalogItem.countDocuments();
  const trending = await CatalogItem.find().sort({ 'stats.views': -1, 'stats.wishlistSaves': -1 }).limit(5);
  const recent = await CatalogItem.find().sort({ createdAt: -1 }).limit(5);
  
  return res.status(200).json(new ApiResponse(200, {
    totalItems,
    activeCollections: 12,
    totalSaves: await CatalogItem.aggregate([{ $group: { _id: null, total: { $sum: '$stats.wishlistSaves' } } }]).then(r => r[0]?.total || 0),
    trending,
    recent
  }, 'Analytics retrieved'));
});

export const updateCatalogItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const item = await CatalogItem.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) return res.status(404).json(new ApiResponse(404, null, 'Item not found'));
  
  const io = getIO();
  if (io) io.emit('catalog:item_updated', item);
  
  return res.status(200).json(new ApiResponse(200, item, 'Item updated successfully'));
});

export const deleteCatalogItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  await CatalogItem.findByIdAndDelete(id);
  
  const io = getIO();
  if (io) io.emit('catalog:item_deleted', { itemId: id });

  return res.status(200).json(new ApiResponse(200, null, 'Item deleted'));
});
