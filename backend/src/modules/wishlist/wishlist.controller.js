import { catchAsync } from '../../utils/catchAsync.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as wishlistService from './wishlist.service.js';

export const getWishlist = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const items = await wishlistService.getWishlist(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, items, 'Wishlist fetched successfully'));
});

export const saveWishlistItem = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const item = await wishlistService.saveWishlistItem(userId, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, item, 'Design successfully saved to inspiration vault'));
});

export const removeWishlistItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const item = await wishlistService.removeWishlistItem(id, userId);
  
  if (!item) {
    throw new ApiError(404, 'Saved item not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, item, 'Design removed from wishlist successfully'));
});

export const createCollection = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const collection = await wishlistService.createCollection(userId, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, collection, 'New inspirational collection created'));
});

export const updateCollection = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const collection = await wishlistService.updateCollection(id, userId, req.body);

  if (!collection) {
    throw new ApiError(404, 'Collection not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, collection, 'Collection details updated successfully'));
});

export const deleteCollection = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const collection = await wishlistService.deleteCollection(id, userId);

  if (!collection) {
    throw new ApiError(404, 'Collection not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, collection, 'Collection deleted and designs moved to general pool'));
});

export const addDesignToCollection = catchAsync(async (req, res) => {
  const { id } = req.params; // collectionId
  const { designId } = req.body;
  const userId = req.user._id;

  const item = await wishlistService.addDesignToCollection(id, userId, designId);
  return res
    .status(200)
    .json(new ApiResponse(200, item, 'Design linked to collection successfully'));
});

export const updateNotes = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const userId = req.user._id;

  const item = await wishlistService.updateNotes(id, userId, notes);
  if (!item) {
    throw new ApiError(404, 'Saved item not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, item, 'Wishlist notes updated successfully'));
});

export const getRecentSaves = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const items = await wishlistService.getRecentSaves(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, items, 'Recently bookmarked designs loaded'));
});

export const getSharedInspirations = catchAsync(async (req, res) => {
  const items = await wishlistService.getSharedInspirations();
  return res
    .status(200)
    .json(new ApiResponse(200, items, 'Curated designer recommendations loaded'));
});
