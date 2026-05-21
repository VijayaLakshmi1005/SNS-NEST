import { catchAsync } from '../../utils/catchAsync.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { DashboardService } from './dashboard.service.js';

export const getOverview = catchAsync(async (req, res) => {
  const metrics = await DashboardService.getOverviewMetrics();
  res.status(200).json(new ApiResponse(200, metrics, 'Overview metrics fetched successfully'));
});

export const getRevenue = catchAsync(async (req, res) => {
  const data = await DashboardService.getRevenueAnalytics();
  res.status(200).json(new ApiResponse(200, data, 'Revenue analytics fetched successfully'));
});

export const getLeads = catchAsync(async (req, res) => {
  const data = await DashboardService.getLeadAnalytics();
  res.status(200).json(new ApiResponse(200, data, 'Lead analytics fetched successfully'));
});

export const getProjects = catchAsync(async (req, res) => {
  const data = await DashboardService.getProjectDistribution();
  res.status(200).json(new ApiResponse(200, data, 'Project analytics fetched successfully'));
});

export const getDesigners = catchAsync(async (req, res) => {
  const data = await DashboardService.getTopDesigners();
  res.status(200).json(new ApiResponse(200, data, 'Top designers fetched successfully'));
});

export const getPayments = catchAsync(async (req, res) => {
  const data = await DashboardService.getRecentPayments();
  res.status(200).json(new ApiResponse(200, data, 'Recent payments fetched successfully'));
});

export const getActivities = catchAsync(async (req, res) => {
  const data = await DashboardService.getActivities();
  res.status(200).json(new ApiResponse(200, data, 'Recent activities fetched successfully'));
});
