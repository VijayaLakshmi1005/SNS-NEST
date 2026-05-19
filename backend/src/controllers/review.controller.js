import { Review } from '../models/Review.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createReview = catchAsync(async (req, res) => {
  const { designerId, rating, comment, images } = req.body;

  const review = new Review({
    client: req.user._id,
    designer: designerId,
    rating,
    comment,
    images
  });

  await review.save();

  return res.status(201).json(new ApiResponse(201, review, 'Review created successfully'));
});

export const getReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find().populate('client', 'fullName profileImage');
  return res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched successfully'));
});
