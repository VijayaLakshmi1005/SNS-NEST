import { Inquiry } from '../models/Inquiry.js';
import { Project } from '../models/Project.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { getIO } from '../config/socket.js';

export const createInquiry = catchAsync(async (req, res) => {
  const { selectedDesigns, estimationDetails } = req.body;
  
  let floorPlanUrl = null;
  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'inquiries-floor-plans');
    floorPlanUrl = uploadResult.secure_url;
  }

  const inquiry = await Inquiry.create({
    client: req.user._id,
    selectedDesigns: selectedDesigns ? JSON.parse(selectedDesigns) : [],
    floorPlanUrl: floorPlanUrl || '',
    estimationDetails: estimationDetails ? JSON.parse(estimationDetails) : {}
  });

  // Notify Admins
  const notification = await Notification.create({
    recipient: null, // Global or specific admin
    type: 'project',
    title: 'New Client Inquiry',
    message: `${req.user.fullName} submitted a floor plan & estimation request.`,
    link: `/admin/inquiries`
  });

  const io = getIO();
  io.to('admin_dashboard').emit('notification_created', notification);
  io.to('admin_dashboard').emit('inquiry_created', { inquiry });

  return res.status(201).json(new ApiResponse(201, inquiry, 'Inquiry submitted successfully. Awaiting Admin review.'));
});

export const getClientInquiry = catchAsync(async (req, res) => {
  // A client usually only has one active pre-project inquiry
  const inquiry = await Inquiry.findOne({ client: req.user._id }).sort({ createdAt: -1 });
  
  // Return null without error if none exists
  return res.status(200).json(new ApiResponse(200, inquiry, 'Inquiry fetched successfully'));
});

export const getAllInquiries = catchAsync(async (req, res) => {
  const inquiries = await Inquiry.find().populate('client', 'fullName email mobile').sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, inquiries, 'All inquiries fetched successfully'));
});

export const sendProposal = catchAsync(async (req, res) => {
  const { finalQuotation, assignedDesigner, estimationDetails } = req.body;
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) throw new ApiError(404, 'Inquiry not found');

  if (req.files && req.files['model3D'] && req.files['model3D'][0]) {
    const uploadResult = await uploadToCloudinary(req.files['model3D'][0].buffer, 'inquiries-3d-models');
    inquiry.admin3DModelUrl = uploadResult.secure_url;
  }

  if (req.files && req.files['pdfQuotation'] && req.files['pdfQuotation'][0]) {
    const uploadResult = await uploadToCloudinary(req.files['pdfQuotation'][0].buffer, 'inquiries-pdfs');
    inquiry.pdfQuotationUrl = uploadResult.secure_url;
  }

  inquiry.finalQuotation = Number(finalQuotation);
  if (assignedDesigner) inquiry.assignedDesigner = assignedDesigner;
  if (estimationDetails) inquiry.estimationDetails = JSON.parse(estimationDetails);
  inquiry.status = 'Proposal Sent';

  await inquiry.save();

  // Notify Client
  const notification = await Notification.create({
    recipient: inquiry.client,
    type: 'project',
    title: 'Proposal Received',
    message: 'Admin has mapped your 3D model and sent a final quotation. Please review and accept.',
    link: `/client/dashboard`
  });

  const io = getIO();
  io.to(inquiry.client.toString()).emit('notification_created', notification);
  io.to(inquiry.client.toString()).emit('inquiry_updated', { inquiry });

  return res.status(200).json(new ApiResponse(200, inquiry, 'Proposal sent to client successfully'));
});

export const acceptProposal = catchAsync(async (req, res) => {
  const inquiry = await Inquiry.findOne({ _id: req.params.id, client: req.user._id });
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');

  inquiry.status = 'Client Accepted';
  await inquiry.save();

  // Auto-create Project
  const uploads = [
    {
      fileName: 'Initial Floor Plan',
      fileUrl: inquiry.floorPlanUrl,
      fileType: 'Floor Plan',
      status: 'Approved',
      uploadedBy: req.user._id
    }
  ];

  if (inquiry.admin3DModelUrl) {
    uploads.push({
      fileName: 'Admin 3D Mapping',
      fileUrl: inquiry.admin3DModelUrl,
      fileType: '3D Render',
      status: 'Approved',
      uploadedBy: inquiry.assignedDesigner || req.user._id
    });
  }

  const project = await Project.create({
    title: `${req.user.fullName}'s Residence`,
    client: inquiry.client,
    designer: inquiry.assignedDesigner || req.user._id, // fallback
    status: 'consultation phase',
    budget: inquiry.finalQuotation,
    projectType: 'Residential Interior Design',
    uploads,
    timeline: [
      { status: 'consultation phase', completed: true, comments: 'Proposal accepted by client.' },
      { status: 'design approval', completed: false }
    ]
  });

  // Notify Admin
  const notification = await Notification.create({
    recipient: null,
    type: 'project',
    title: 'Proposal Accepted!',
    message: `${req.user.fullName} accepted the quotation. Project timeline has started.`,
    link: `/admin/projects/${project._id}`
  });

  const io = getIO();
  io.to('admin_dashboard').emit('notification_created', notification);
  io.to('admin_dashboard').emit('project_created', { project });
  io.to(req.user._id.toString()).emit('project_created', { project });

  return res.status(200).json(new ApiResponse(200, project, 'Proposal accepted! Welcome to your new project workspace.'));
});

export const deleteInquiry = catchAsync(async (req, res) => {
  console.log(`Attempting to delete inquiry with ID: ${req.params.id}`);
  
  if (!req.params.id) {
    throw new ApiError(400, 'Inquiry ID is required');
  }

  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) {
    console.log(`Inquiry ${req.params.id} not found.`);
    throw new ApiError(404, 'Inquiry not found');
  }
  
  console.log(`Inquiry deleted successfully, emitting socket event.`);
  try {
    const io = getIO();
    io.to('admin_dashboard').emit('inquiry_deleted', { _id: req.params.id });
  } catch (socketError) {
    console.error('Socket error during delete:', socketError.message);
  }

  return res.status(200).json(new ApiResponse(200, null, 'Inquiry deleted successfully'));
});
