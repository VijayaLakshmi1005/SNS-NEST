import { Wishlist } from '../models/Wishlist.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getWishlist = catchAsync(async (req, res) => {
  const wishlist = await Wishlist.findOne({ client: req.user._id }).populate('designs');
  return res.status(200).json(new ApiResponse(200, wishlist || { client: req.user._id, designs: [] }, 'Wishlist fetched successfully'));
});
