import { calculateHomeEstimate } from '../services/estimate.service.js';
import { Estimate } from '../models/Estimate.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getEstimateCostBreakdown = catchAsync(async (req, res) => {
  const { homeSize, bhkType, quality, rooms } = req.body;

  const estimate = await calculateHomeEstimate(
    homeSize,
    bhkType,
    quality,
    rooms,
    req.user
  );

  return res
    .status(200)
    .json(new ApiResponse(200, estimate, 'Dynamic luxury cost breakdown calculated successfully'));
});

export const getEstimateById = catchAsync(async (req, res) => {
  const estimate = await Estimate.findOne({ _id: req.params.id, client: req.user._id });
  if (!estimate) {
    throw new ApiError(404, 'Estimate calculation not found');
  }
  return res.status(200).json(new ApiResponse(200, estimate, 'Estimate fetched successfully'));
});
