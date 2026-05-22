import { ProjectModular } from './project.model.js';
import { ProjectActivity } from './project-activity.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../config/socket.js';

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
  const { title, clientId, budget, estimatedCompletion } = req.body;
  if (!title || !clientId) throw new ApiError(400, 'Title and Client ID are required');

  const project = await ProjectModular.create({
    title,
    client: clientId,
    budget,
    estimatedCompletion,
    status: 'Draft'
  });

  await logActivity(project._id, req.user._id, 'Project Created', 'system', `Project drafted with budget ${budget}`);

  return res.status(201).json(new ApiResponse(201, project, 'Project created successfully'));
});

export const getProjects = catchAsync(async (req, res) => {
  // Can add filters based on req.user.role (e.g., if client, only fetch their projects)
  const query = {};
  if (req.user.role === 'client') query.client = req.user._id;

  const projects = await ProjectModular.find(query)
    .populate('client', 'firstName lastName email profileImage')
    .populate('designer', 'name email profileImage');
  
  return res.status(200).json(new ApiResponse(200, projects, 'Projects fetched'));
});

export const getProjectById = catchAsync(async (req, res) => {
  const project = await ProjectModular.findById(req.params.id)
    .populate('client', 'firstName lastName email profileImage')
    .populate('designer', 'name email profileImage');
  
  if (!project) throw new ApiError(404, 'Project not found');
  return res.status(200).json(new ApiResponse(200, project, 'Project fetched'));
});

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
  const { fileName, fileUrl, fileType, requiresApproval } = req.body;

  const project = await ProjectModular.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  const status = requiresApproval ? 'Pending Approval' : 'No Approval Needed';
  project.uploads.push({ fileName, fileUrl, fileType, status, uploadedBy: req.user._id });
  
  await project.save();
  await logActivity(id, req.user._id, 'File Uploaded', 'upload', `Uploaded ${fileType}: ${fileName}`);

  return res.status(200).json(new ApiResponse(200, project, 'Document uploaded'));
});

export const approveDocument = catchAsync(async (req, res) => {
  const { id, uploadId } = req.params;
  const { status, feedback } = req.body; // status: 'Approved' or 'Revision Requested'

  const project = await ProjectModular.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  const upload = project.uploads.id(uploadId);
  if (!upload) throw new ApiError(404, 'Document not found');

  upload.status = status;
  if (feedback) upload.clientFeedback = feedback;

  await project.save();
  await logActivity(id, req.user._id, `Document ${status}`, 'approval', `Feedback: ${feedback || 'None'}`);

  return res.status(200).json(new ApiResponse(200, project, `Document marked as ${status}`));
});

export const getActivityFeed = catchAsync(async (req, res) => {
  const { id } = req.params;
  const activities = await ProjectActivity.find({ project: id })
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName profileImage role');
    
  return res.status(200).json(new ApiResponse(200, activities, 'Activity feed fetched'));
});
