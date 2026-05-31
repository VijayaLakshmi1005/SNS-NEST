import { ProjectModular } from './project.model.js';
import { ProjectActivity } from './project-activity.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../config/socket.js';
import * as projectService from './project.service.js';

// Helper to log activities
const logActivity = async (projectId, userId, action, type, details = '') => {
  const activity = await ProjectActivity.create({
    project: projectId,
    user: userId,
    action,
    type,
    details
  });

  // Emit Real-time WebSocket Event
  try {
    const io = getIO();
    io.to(`project_${projectId}`).emit('newActivity', activity);
  } catch (err) {
    console.error('Socket.io error during logActivity:', err);
  }
};

export const createProject = catchAsync(async (req, res) => {
  const { title, clientId, budget, estimatedCompletion, projectType, priority } = req.body;
  if (!title || !clientId) throw new ApiError(400, 'Title and Client ID are required');

  const project = await ProjectModular.create({
    title,
    client: clientId,
    budget,
    estimatedCompletion,
    projectType: projectType || 'Residential',
    priority: priority || 'Medium',
    status: 'Draft'
  });

  await logActivity(project._id, req.user._id, 'Project Created', 'system', `Project drafted with budget ${budget}`);

  return res.status(201).json(new ApiResponse(201, project, 'Project created successfully'));
});

export const getProjects = catchAsync(async (req, res) => {
  const query = {};
  if (req.user.role === 'client') query.client = req.user._id;

  const projects = await ProjectModular.find(query)
    .populate('client', 'fullName email mobile')
    .populate('designer', 'name email specialization');
  
  return res.status(200).json(new ApiResponse(200, projects, 'Projects fetched'));
});

export const getProjectById = catchAsync(async (req, res) => {
  const project = await ProjectModular.findById(req.params.id)
    .populate('client', 'fullName email mobile')
    .populate('designer', 'name email specialization');
  
  if (!project) throw new ApiError(404, 'Project not found');
  return res.status(200).json(new ApiResponse(200, project, 'Project fetched'));
});

export const updateProject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const project = await ProjectModular.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!project) throw new ApiError(404, 'Project not found');

  await logActivity(id, req.user._id, 'Project Updated', 'system', 'Project details were updated by admin');
  
  return res.status(200).json(new ApiResponse(200, project, 'Project updated successfully'));
});

export const deleteProject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const project = await ProjectModular.findByIdAndDelete(id);
  
  if (!project) throw new ApiError(404, 'Project not found');
  
  // Optionally clean up related tasks/activities here
  await ProjectActivity.deleteMany({ project: id });
  
  return res.status(200).json(new ApiResponse(200, null, 'Project deleted successfully'));
});

import { Project } from '../../models/Project.js';

export const getCurrentProject = catchAsync(async (req, res) => {
  const query = {};
  if (req.user.role === 'client') query.client = req.user._id;

  const project = await Project.findOne(query).sort({ createdAt: -1 })
    .populate('client', 'fullName email mobile')
    .populate('designer', 'fullName email');
  
  if (!project) {
    return res.status(200).json(new ApiResponse(200, null, 'No active project found'));
  }
  return res.status(200).json(new ApiResponse(200, project, 'Current project fetched'));
});

export const getProjectAnalytics = catchAsync(async (req, res) => {
  const analytics = await projectService.getProjectAnalytics();
  res.status(200).json(new ApiResponse(200, analytics, 'Analytics fetched successfully'));
});

export const updateProjectProgress = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;
  const updated = await projectService.updateProjectProgress(id, progress);
  await logActivity(id, req.user._id, 'Progress Updated', 'progress', `Progress updated to ${progress}%`);
  res.status(200).json(new ApiResponse(200, updated, 'Progress updated'));
});

export const getProjectTasks = catchAsync(async (req, res) => {
  const { id } = req.params;
  const tasks = await projectService.getTasksForProject(id);
  res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched'));
});

export const createProjectTask = catchAsync(async (req, res) => {
  const { id } = req.params;
  const task = await projectService.createTask(id, req.body);
  await logActivity(id, req.user._id, 'Task Created', 'task', `Task added: ${task.title}`);
  res.status(201).json(new ApiResponse(201, task, 'Task created'));
});

export const updateProjectTaskStatus = catchAsync(async (req, res) => {
  const { id, taskId } = req.params;
  const { status } = req.body;
  const task = await projectService.updateTaskStatus(taskId, status);
  await logActivity(id, req.user._id, 'Task Updated', 'task', `Task '${task.title}' moved to ${status}`);
  res.status(200).json(new ApiResponse(200, task, 'Task status updated'));
});

export const updateProjectTask = catchAsync(async (req, res) => {
  const { id, taskId } = req.params;
  const task = await projectService.updateTask(taskId, req.body);
  await logActivity(id, req.user._id, 'Task Edited', 'task', `Task '${task.title}' was edited`);
  res.status(200).json(new ApiResponse(200, task, 'Task updated'));
});

export const deleteProjectTask = catchAsync(async (req, res) => {
  const { id, taskId } = req.params;
  const task = await projectService.deleteTask(taskId);
  if (task) {
    await logActivity(id, req.user._id, 'Task Deleted', 'task', `Task '${task.title}' was deleted`);
  }
  res.status(200).json(new ApiResponse(200, null, 'Task deleted'));
});

// Preserved old functions (assignUsers, addMilestone, updateMilestoneStatus, uploadDocument, approveDocument, getActivityFeed)
export const assignUsers = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { designerId } = req.body;
  
  const project = await ProjectModular.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  if (designerId) {
    project.designer = designerId;
    project.status = 'Consultation';
    await logActivity(id, req.user._id, 'Designer Assigned', 'system', 'Admin assigned a designer to the project.');
  }

  await project.save();
  return res.status(200).json(new ApiResponse(200, project, 'Users assigned'));
});

export const addMilestone = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, dueDate } = req.body;

  const project = await ProjectModular.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  project.milestones.push({ title, dueDate });
  await project.save();

  await logActivity(id, req.user._id, 'Milestone Added', 'milestone', `Added milestone: ${title}`);
  return res.status(200).json(new ApiResponse(200, project, 'Milestone added'));
});

export const updateMilestoneStatus = catchAsync(async (req, res) => {
  const { id, milestoneId } = req.params;
  const { status, comments } = req.body;

  const project = await ProjectModular.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  const milestone = project.milestones.id(milestoneId);
  if (!milestone) throw new ApiError(404, 'Milestone not found');

  milestone.status = status;
  if (comments) milestone.comments = comments;
  if (status === 'Completed') milestone.completedAt = new Date();

  await project.save();
  await logActivity(id, req.user._id, 'Milestone Updated', 'milestone', `Milestone '${milestone.title}' marked as ${status}`);

  return res.status(200).json(new ApiResponse(200, project, 'Milestone updated'));
});

export const uploadDocument = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { fileName, fileUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg', fileType, requiresApproval } = req.body;

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  const status = requiresApproval ? 'Pending Approval' : 'No Approval Needed';
  project.uploads.push({ fileName, fileUrl, fileType, status, uploadedBy: req.user._id });
  
  await project.save();
  await logActivity(id, req.user._id, 'File Uploaded', 'upload', `Uploaded ${fileType}: ${fileName}`);

  return res.status(200).json(new ApiResponse(200, project, 'Document uploaded'));
});

export const approveDocument = catchAsync(async (req, res) => {
  const { id, uploadId } = req.params;
  const { status, feedback } = req.body;

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  const upload = project.uploads.id(uploadId);
  if (!upload) throw new ApiError(404, 'Document not found');

  upload.status = status;
  if (feedback) upload.feedback = feedback;

  await project.save();
  await logActivity(id, req.user._id, `Document ${status}`, 'approval', `Feedback: ${feedback || 'None'}`);

  return res.status(200).json(new ApiResponse(200, project, `Document marked as ${status}`));
});

export const getActivityFeed = catchAsync(async (req, res) => {
  const { id } = req.params;
  const activities = await ProjectActivity.find({ project: id })
    .sort({ createdAt: -1 })
    .populate('user', 'fullName profileImage role');
    
  return res.status(200).json(new ApiResponse(200, activities, 'Activity feed fetched'));
});

export const addProjectMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!message) throw new ApiError(400, 'Message content is required');

  const project = await ProjectModular.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  await logActivity(id, req.user._id, 'Message Posted', 'message', message);
  
  return res.status(201).json(new ApiResponse(201, null, 'Message posted successfully'));
});
