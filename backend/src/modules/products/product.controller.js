import { Product } from './product.model.js';
import { ProductCategory } from './category.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../config/socket.js';

export const getProducts = catchAsync(async (req, res) => {
  const { category, style, search } = req.query;
  
  let query = { status: 'Active' };
  
  if (category) query.category = category;
  if (style) query.style = style;
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, products, 'Products fetched successfully'));
});

export const getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug');
    
  if (!product) throw new ApiError(404, 'Product not found');

  // Increment views
  product.stats.views += 1;
  await product.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, product, 'Product profile fetched'));
});

export const createProduct = catchAsync(async (req, res) => {
  const product = await Product.create(req.body);

  try {
    const io = getIO();
    io.emit('productAdded', product);
  } catch (err) {}

  return res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

export const updateInventory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { inStock } = req.body;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');

  product.inventory.inStock = inStock;
  
  if (inStock === 0) product.inventory.status = 'Out of Stock';
  else if (inStock <= product.inventory.lowStockThreshold) product.inventory.status = 'Low Stock';
  else product.inventory.status = 'In Stock';

  await product.save();

  try {
    const io = getIO();
    io.emit('inventoryUpdated', { productId: product._id, inventory: product.inventory });
  } catch (err) {}

  return res.status(200).json(new ApiResponse(200, product, 'Inventory updated'));
});

export const getCategories = catchAsync(async (req, res) => {
  const categories = await ProductCategory.find({ isActive: true });
  return res.status(200).json(new ApiResponse(200, categories, 'Categories fetched'));
});

export const seedCategories = catchAsync(async (req, res) => {
  // Utility for initial setup
  const cats = [
    { name: 'Sofas', slug: 'sofas' },
    { name: 'Beds', slug: 'beds' },
    { name: 'Lighting', slug: 'lighting' },
    { name: 'Decor', slug: 'decor' },
  ];
  await ProductCategory.insertMany(cats);
  return res.status(201).json(new ApiResponse(201, cats, 'Categories seeded'));
});
