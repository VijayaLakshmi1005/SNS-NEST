import { Wishlist } from '../models/Wishlist.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getWishlist = catchAsync(async (req, res) => {
  const wishlist = await Wishlist.findOne({ client: req.user._id }).populate('designs');
  return res.status(200).json(new ApiResponse(200, wishlist || { client: req.user._id, designs: [] }, 'Wishlist fetched successfully'));
});

export const getRecentWishlist = catchAsync(async (req, res) => {
  const wishlist = await Wishlist.findOne({ client: req.user._id }).populate('designs');
  const designsList = wishlist ? wishlist.designs : [];
  
  const recentItems = [];
  designsList.forEach(design => {
    if (design.images && design.images.length > 0) {
      recentItems.push({
        _id: design._id,
        title: design.title,
        url: design.images[0]
      });
    }
  });

  return res.status(200).json(new ApiResponse(200, recentItems.slice(0, 3), 'Recent wishlist items fetched successfully'));
});

