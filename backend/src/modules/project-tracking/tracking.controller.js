import { catchAsync } from '../../utils/catchAsync.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as trackingService from './tracking.service.js';

export const getCurrentTracking = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const trackingData = await trackingService.getCurrentTracking(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, trackingData, 'Current luxury project tracking metrics loaded successfully'));
});

export const getProjectTracking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const trackingData = await trackingService.getProjectTracking(id, userId);

  if (!trackingData) {
    throw new ApiError(404, 'Interior project tracking not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, trackingData, 'Project tracking metrics loaded successfully'));
});

export const getMilestones = catchAsync(async (req, res) => {
  const { id } = req.params;
  const milestones = await trackingService.getMilestones(id);
  return res
    .status(200)
    .json(new ApiResponse(200, milestones, 'Milestone timelines retrieved successfully'));
});

export const getActivities = catchAsync(async (req, res) => {
  const { id } = req.params;
  const activities = await trackingService.getActivities(id);
  return res
    .status(200)
    .json(new ApiResponse(200, activities, 'Project execution activity logs retrieved successfully'));
});

export const getSiteUpdates = catchAsync(async (req, res) => {
  const { id } = req.params;
  const siteUpdates = await trackingService.getSiteUpdates(id);
  return res
    .status(200)
    .json(new ApiResponse(200, siteUpdates, 'Daily site progress photos retrieved successfully'));
});

export const getProcurement = catchAsync(async (req, res) => {
  const { id } = req.params;
  const procurement = await trackingService.getProcurement(id);
  return res
    .status(200)
    .json(new ApiResponse(200, procurement, 'Material logistics tracking list retrieved successfully'));
});

export const addSiteUpdate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { caption, images } = req.body;
  const userId = req.user._id;

  const result = await trackingService.addSiteUpdate(id, caption, images, userId);
  return res
    .status(201)
    .json(new ApiResponse(201, result, 'New daily site progress update uploaded and synchronized successfully'));
});

export const addActivity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { type, message } = req.body;
  const userId = req.user._id;

  const activity = await trackingService.addActivity(id, type, message, userId);
  return res
    .status(201)
    .json(new ApiResponse(201, activity, 'Manual activity feed record added and synchronized successfully'));
});
