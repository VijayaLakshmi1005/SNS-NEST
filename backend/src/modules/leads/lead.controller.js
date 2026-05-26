import { LeadModular } from './lead.model.js';
import { LeadActivity } from './lead-activity.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../config/socket.js';

const logLeadActivity = async (leadId, userId, action, type, details = '') => {
  const activity = await LeadActivity.create({
    lead: leadId,
    user: userId,
    action,
    type,
    details
  });

  try {
    const io = getIO();
    io.emit('leadActivity', activity);
  } catch (err) {
    console.error('Socket.io error during logLeadActivity:', err);
  }
};

export const createLead = catchAsync(async (req, res) => {
  const leadData = req.body;
  
  const lead = await LeadModular.create(leadData);
  await logLeadActivity(lead._id, req.user?._id || null, 'Lead Created', 'system', `Source: ${lead.source}`);

  // Emit to all admins
  try {
    const io = getIO();
    io.to('admin_dashboard').emit('newLead', lead);
  } catch (err) {}

  return res.status(201).json(new ApiResponse(201, lead, 'Lead captured successfully'));
});

export const getLeads = catchAsync(async (req, res) => {
  const leads = await LeadModular.find()
    .populate('assignedToAdmin', 'firstName lastName')
    .populate('assignedToDesigner', 'name')
    .sort({ createdAt: -1 });
    
  return res.status(200).json(new ApiResponse(200, leads, 'Leads fetched'));
});

export const getLeadById = catchAsync(async (req, res) => {
  const lead = await LeadModular.findById(req.params.id)
    .populate('assignedToAdmin', 'firstName lastName')
    .populate('assignedToDesigner', 'name');
    
  if (!lead) throw new ApiError(404, 'Lead not found');
  
  const activities = await LeadActivity.find({ lead: req.params.id })
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { lead, activities }, 'Lead profile fetched'));
});

export const updateLeadStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const lead = await LeadModular.findById(id);
  if (!lead) throw new ApiError(404, 'Lead not found');

  const oldStatus = lead.status;
  lead.status = status;
  
  // Increase probability score based on status
  if (status === 'Contacted') lead.probabilityScore = Math.max(lead.probabilityScore, 30);
  if (status === 'Interested') lead.probabilityScore = Math.max(lead.probabilityScore, 50);
  if (status === 'Consultation Scheduled') lead.probabilityScore = Math.max(lead.probabilityScore, 70);
  if (status === 'Converted') lead.probabilityScore = 100;

  await lead.save();

  await logLeadActivity(id, req.user._id, 'Status Updated', 'status_change', `Moved from ${oldStatus} to ${status}`);

  try {
    const io = getIO();
    io.emit('leadUpdated', lead);
  } catch (err) {}

  return res.status(200).json(new ApiResponse(200, lead, 'Lead status updated'));
});

export const assignLead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { adminId, designerId } = req.body;

  const lead = await LeadModular.findById(id);
  if (!lead) throw new ApiError(404, 'Lead not found');

  if (adminId) lead.assignedToAdmin = adminId;
  if (designerId) lead.assignedToDesigner = designerId;

  await lead.save();
  await logLeadActivity(id, req.user._id, 'Lead Assigned', 'system', 'Assigned team members updated');

  try {
    const io = getIO();
    io.emit('leadUpdated', lead);
  } catch (err) {}

  return res.status(200).json(new ApiResponse(200, lead, 'Lead assigned'));
});

export const addFollowUp = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { date, notes } = req.body;

  const lead = await LeadModular.findById(id);
  if (!lead) throw new ApiError(404, 'Lead not found');

  lead.followUpDate = new Date(date);
  if (notes) lead.notes = (lead.notes ? lead.notes + '\n' : '') + `Follow-up set: ${notes}`;
  
  await lead.save();
  await logLeadActivity(id, req.user._id, 'Follow-up Scheduled', 'follow_up', `Scheduled for ${new Date(date).toLocaleDateString()}: ${notes}`);

  try {
    const io = getIO();
    io.emit('leadUpdated', lead);
  } catch (err) {}

  return res.status(200).json(new ApiResponse(200, lead, 'Follow-up added'));
});

// Real-time Chat / Note logging
export const addLeadNote = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  
  const lead = await LeadModular.findById(id);
  if (!lead) throw new ApiError(404, 'Lead not found');
  
  await logLeadActivity(id, req.user._id, 'Message', 'message', text);
  
  // Update response time/engagement score
  lead.lastContactedAt = new Date();
  lead.probabilityScore = Math.min(lead.probabilityScore + 2, 99); // Boost score for engagement
  await lead.save();

  try {
    const io = getIO();
    io.emit('leadUpdated', lead);
  } catch (err) {}

  return res.status(200).json(new ApiResponse(200, lead, 'Message sent'));
});

// Conversion workflow
import { User } from '../../models/User.js';
import { ProjectModular } from '../projects/project.model.js';

export const convertLead = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const lead = await LeadModular.findById(id);
  if (!lead) throw new ApiError(404, 'Lead not found');
  if (lead.status === 'Converted') throw new ApiError(400, 'Lead is already converted');

  // 1. Create User (Client)
  let user = await User.findOne({ email: lead.email });
  if (!user && lead.email) {
    user = await User.create({
      fullName: lead.name,
      email: lead.email,
      mobile: lead.mobile,
      role: 'client',
      password: 'TempPassword123!', // They would reset this later via email workflow
      isVerified: true,
      clientStatus: 'Active Client'
    });
  }

  // 2. Create Project Workspace
  const project = await ProjectModular.create({
    title: `${lead.name}'s ${lead.propertyType || 'Project'}`,
    client: user ? user._id : null,
    projectType: lead.propertyType || 'Residential Interior Design',
    status: 'In Progress',
    budget: lead.budget,
    startDate: new Date(),
    progress: 0
  });

  // 3. Update Lead
  lead.status = 'Converted';
  lead.probabilityScore = 100;
  if (user) lead.convertedToClient = user._id;
  lead.convertedToProject = project._id;
  await lead.save();

  await logLeadActivity(id, req.user._id, 'Lead Converted', 'conversion', `Converted to client and created project workspace.`);

  try {
    const io = getIO();
    io.emit('leadUpdated', lead);
    io.to('admin_dashboard').emit('projectUpdated', project);
  } catch (err) {}

  return res.status(200).json(new ApiResponse(200, { lead, project, user }, 'Lead successfully converted to client'));
});

// Delete lead
export const deleteLead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const lead = await LeadModular.findByIdAndDelete(id);
  if (!lead) throw new ApiError(404, 'Lead not found');
  
  await LeadActivity.deleteMany({ lead: id });
  
  try {
    const io = getIO();
    io.emit('leadDeleted', id);
  } catch (err) {}

  return res.status(200).json(new ApiResponse(200, null, 'Lead deleted successfully'));
});

// Schedule Consultation
export const scheduleConsultation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { date, notes } = req.body;
  
  const lead = await LeadModular.findById(id);
  if (!lead) throw new ApiError(404, 'Lead not found');
  
  lead.status = 'Consultation Scheduled';
  lead.probabilityScore = Math.max(lead.probabilityScore, 70);
  await lead.save();
  
  await logLeadActivity(id, req.user._id, 'Consultation Scheduled', 'consultation', `Scheduled for ${new Date(date).toLocaleString()}: ${notes}`);
  
  try {
    const io = getIO();
    io.emit('leadUpdated', lead);
  } catch (err) {}

  return res.status(200).json(new ApiResponse(200, lead, 'Consultation scheduled successfully'));
});

// Send Proposal
export const sendProposal = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { value, link } = req.body;
  
  const lead = await LeadModular.findById(id);
  if (!lead) throw new ApiError(404, 'Lead not found');
  
  lead.status = 'Proposal Sent';
  if (value) lead.budget = value;
  await lead.save();
  
  await logLeadActivity(id, req.user._id, 'Proposal Sent', 'proposal', `Proposal sent. Value: ₹${value}. Link: ${link}`);
  
  try {
    const io = getIO();
    io.emit('leadUpdated', lead);
  } catch (err) {}

  return res.status(200).json(new ApiResponse(200, lead, 'Proposal sent successfully'));
});

// Analytics
export const getLeadAnalytics = catchAsync(async (req, res) => {
  const leads = await LeadModular.find();
  
  const analytics = {
    total: leads.length,
    converted: leads.filter(l => l.status === 'Converted').length,
    active: leads.filter(l => !['Converted', 'Closed Lost'].includes(l.status)).length,
    revenuePotential: leads.filter(l => l.status !== 'Closed Lost').reduce((sum, l) => sum + (l.budget || 0), 0),
    bySource: leads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {})
  };
  
  return res.status(200).json(new ApiResponse(200, analytics, 'Lead analytics fetched'));
});
