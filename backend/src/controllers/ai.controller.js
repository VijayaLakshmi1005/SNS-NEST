import { processAiRoomVisualizer } from '../services/ai.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const generateAiDesign = catchAsync(async (req, res) => {
  const { style, roomType } = req.body;
  
  if (!req.file) {
    throw new ApiError(400, 'Original room image file is required');
  }

  const result = await processAiRoomVisualizer(
    req.file.buffer,
    style || 'Scandinavian',
    roomType || 'Living Room'
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'AI design modified layout generated successfully'));
});
