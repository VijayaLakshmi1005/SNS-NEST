import * as designerService from './designer.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const createDesigner = catchAsync(async (req, res) => {
  const result = await designerService.createDesigner(req.body);
  res.status(201).json(new ApiResponse(201, result, 'Designer created successfully'));
});

export const getDesigners = catchAsync(async (req, res) => {
  const designers = await designerService.getAllDesigners();
  res.status(200).json(new ApiResponse(200, designers, 'Designers fetched successfully'));
});

export const updateStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await designerService.updateDesignerStatus(id, status);
  // Realtime notification happens here or via socket
  res.status(200).json(new ApiResponse(200, updated, 'Status updated successfully'));
});

export const getAnalytics = catchAsync(async (req, res) => {
  const analytics = await designerService.getDesignerAnalytics();
  res.status(200).json(new ApiResponse(200, analytics, 'Analytics fetched successfully'));
});

// Placeholder for other endpoints
export const getDesignerById = catchAsync(async (req, res) => { res.send('Not implemented yet'); });
export const getDesignerAnalytics = catchAsync(async (req, res) => {
  const analytics = await designerService.getDesignerAnalytics();
  res.status(200).json(new ApiResponse(200, analytics, 'Analytics fetched successfully'));
});
export const updateDesigner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await designerService.updateDesigner(id, req.body);
  res.status(200).json(new ApiResponse(200, updated, 'Designer updated successfully'));
});
export const deleteDesigner = catchAsync(async (req, res) => { res.send('Not implemented yet'); });
export const assignProject = catchAsync(async (req, res) => { res.send('Not implemented yet'); });
export const sendMessage = catchAsync(async (req, res) => { res.send('Not implemented yet'); });
export const uploadProfile = catchAsync(async (req, res) => { res.send('Not implemented yet'); });
export const uploadPortfolio = catchAsync(async (req, res) => { res.send('Not implemented yet'); });
export const getWorkload = catchAsync(async (req, res) => { res.send('Not implemented yet'); });
export const getSchedules = catchAsync(async (req, res) => { res.send('Not implemented yet'); });
