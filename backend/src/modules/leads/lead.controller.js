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
