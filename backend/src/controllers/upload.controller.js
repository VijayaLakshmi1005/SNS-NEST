import { Project } from '../models/Project.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { getIO } from '../config/socket.js';
import { Notification } from '../models/Notification.js';

export const uploadProjectFile = catchAsync(async (req, res) => {
  const { fileType } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (!req.file) {
    throw new ApiError(400, 'File is required');
  }

  // Upload to Cloudinary
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'project-files');

  const newUpload = {
    fileName: req.file.originalname,
    fileUrl: uploadResult.secure_url,
    fileType: fileType || 'Other',
    status: req.user.role === 'admin' ? 'Approved' : 'Pending Approval',
    uploadedBy: req.user._id,
    uploadedAt: new Date()
  };

  project.uploads.push(newUpload);
  
  // If floor plan uploaded by client, update timeline automatically if pending
  if (fileType === 'Floor Plan' && req.user.role === 'client') {
     const floorPlanStage = project.timeline.find(t => t.status === 'Floor Plan Uploaded');
     if (floorPlanStage && !floorPlanStage.completed) {
         floorPlanStage.completed = true;
         floorPlanStage.updatedAt = new Date();
     }
  }

  await project.save();

  // Create Notifications and emit sockets
  const io = getIO();
  io.to(`project_${project._id}`).emit('project_updated', { project });
  
  if (req.user.role === 'client') {
    // Notify admin
    const notification = await Notification.create({
      recipient: project.designer,
      type: 'project',
      title: 'New File Uploaded',
      message: `Client ${req.user.fullName} uploaded a ${fileType}`,
      link: `/admin/projects/${project._id}`
    });
    io.to('admin_dashboard').emit('notification_created', notification);
  } else {
    // Notify client
    const notification = await Notification.create({
      recipient: project.client,
      type: 'project',
      title: 'New Design Uploaded',
      message: `Admin uploaded a new ${fileType} for your review`,
      link: `/client/dashboard`
    });
    io.to(project.client.toString()).emit('notification_created', notification);
  }

  return res.status(200).json(new ApiResponse(200, project, 'File uploaded successfully'));
});

export const updateUploadStatus = catchAsync(async (req, res) => {
  const { status, feedback } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) throw new ApiError(404, 'Project not found');

  const upload = project.uploads.id(req.params.uploadId);
  if (!upload) throw new ApiError(404, 'Upload not found');

  upload.status = status;
  if (feedback) upload.feedback = feedback;

  await project.save();

  // Emit sockets and notify
  const io = getIO();
  io.to(`project_${project._id}`).emit('project_updated', { project });

  if (req.user.role === 'admin') {
     const notification = await Notification.create({
      recipient: project.client,
      type: 'project',
      title: 'Design Review Update',
      message: `Admin marked your ${upload.fileType} as ${status}`,
      link: `/client/dashboard`
    });
    io.to(project.client.toString()).emit('notification_created', notification);
  } else {
     const notification = await Notification.create({
      recipient: project.designer,
      type: 'project',
      title: 'Client Review',
      message: `Client marked ${upload.fileType} as ${status}`,
      link: `/admin/projects/${project._id}`
    });
    io.to('admin_dashboard').emit('notification_created', notification);
  }

  return res.status(200).json(new ApiResponse(200, project, 'Upload status updated successfully'));
});
