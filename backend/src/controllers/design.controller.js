import { Design } from '../models/Design.js';
import { Wishlist } from '../models/Wishlist.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ApiError } from '../utils/ApiError.js';

export const getDesigns = catchAsync(async (req, res) => {
  const { style, roomType, budgetRange, search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (style) query.style = style;
  if (roomType) query.roomType = roomType;
  if (budgetRange) query.budgetRange = budgetRange;

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const designs = await Design.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 });

  const totalDesigns = await Design.countDocuments(query);

  return res.status(200).json(new ApiResponse(200, {
    designs,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalDesigns / limit),
    totalCount: totalDesigns
  }, 'Designs fetched successfully'));
});

export const getDesignById = catchAsync(async (req, res) => {
  const design = await Design.findById(req.params.id);
  if (!design) {
    throw new ApiError(404, 'Design not found');
  }
  return res.status(200).json(new ApiResponse(200, design, 'Design details fetched successfully'));
});

export const saveDesignToWishlist = catchAsync(async (req, res) => {
  const { designId } = req.body;
  const clientId = req.user._id;

  const design = await Design.findById(designId);
  if (!design) {
    throw new ApiError(404, 'Design not found');
  }

  let wishlist = await Wishlist.findOne({ client: clientId });
  if (!wishlist) {
    wishlist = new Wishlist({ client: clientId, designs: [] });
  }

  if (wishlist.designs.includes(designId)) {
    return res.status(200).json(new ApiResponse(200, wishlist, 'Design is already saved to your wishlist'));
  }

  wishlist.designs.push(designId);
  await wishlist.save();

  return res.status(200).json(new ApiResponse(200, wishlist, 'Design saved to wishlist successfully'));
});

export const removeDesignFromWishlist = catchAsync(async (req, res) => {
  const { id } = req.params;
  const clientId = req.user._id;

  const wishlist = await Wishlist.findOne({ client: clientId });
  if (!wishlist) {
    throw new ApiError(404, 'Wishlist not found');
  }

  wishlist.designs = wishlist.designs.filter(d => d.toString() !== id);
  await wishlist.save();

  return res.status(200).json(new ApiResponse(200, wishlist, 'Design removed from wishlist successfully'));
});
