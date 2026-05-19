import { Project } from '../models/Project.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';

export const getProjects = catchAsync(async (req, res) => {
  const projects = await Project.find({ client: req.user._id })
    .populate('designer', 'fullName email mobile profileImage')
    .sort({ updatedAt: -1 });

  return res.status(200).json(new ApiResponse(200, projects, 'Projects fetched successfully'));
});

export const getProjectById = catchAsync(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, client: req.user._id })
    .populate('designer', 'fullName email mobile profileImage');

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return res.status(200).json(new ApiResponse(200, project, 'Project details fetched successfully'));
});

export const updateProjectMilestoneStatus = catchAsync(async (req, res) => {
  const { status, comments } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  project.status = status;
  project.timeline.push({
    status,
    comments,
    completed: true,
    updatedAt: new Date()
  });

  await project.save();

  return res.status(200).json(new ApiResponse(200, project, 'Project timeline milestone status updated successfully'));
});

export const uploadSitePhotos = catchAsync(async (req, res) => {
  const { caption } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (!req.file) {
    throw new ApiError(400, 'Site photo image file is required');
  }

  const uploadResult = await uploadToCloudinary(req.file.buffer, 'project-site-photos');

  project.sitePhotos.push({
    url: uploadResult.secure_url,
    caption: caption || 'Site progress update',
    uploadedAt: new Date()
  });

  await project.save();

  return res.status(200).json(new ApiResponse(200, project, 'Site photo uploaded successfully'));
});

export const getCurrentProject = catchAsync(async (req, res) => {
  const project = await Project.findOne({ client: req.user._id })
    .populate('designer', 'fullName email mobile profileImage')
    .sort({ updatedAt: -1 });

  if (!project) {
    throw new ApiError(404, 'No active project found for this user');
  }

  return res.status(200).json(new ApiResponse(200, project, 'Current project fetched successfully'));
});

export const getProjectMilestones = catchAsync(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, client: req.user._id });

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return res.status(200).json(new ApiResponse(200, project.timeline, 'Project milestones fetched successfully'));
});

