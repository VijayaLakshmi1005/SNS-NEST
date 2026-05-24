import { User } from '../../models/User.js';
import { CRMNote, CRMActivity } from './crm.model.js';
import { ROLES } from '../../constants/roles.js';
import mongoose from 'mongoose';

export const getClients = async (query = {}) => {
  const { page = 1, limit = 20, search, status, designerId, sort = '-createdAt' } = query;
  
  const filter = { role: ROLES.CLIENT };
  
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) filter.clientStatus = status;
  if (designerId) filter.assignedDesigner = designerId;
  
  const skip = (page - 1) * limit;
  
  const [clients, total] = await Promise.all([
    User.find(filter)
      .populate('assignedDesigner', 'fullName email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-password -__v -otp -internalNotes'),
    User.countDocuments(filter)
  ]);
  
  return {
    clients,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getClientDetails = async (clientId) => {
  const client = await User.findById(clientId)
    .populate('assignedDesigner', 'fullName email')
    .select('-password -__v -otp');
    
  if (!client || client.role !== ROLES.CLIENT) {
    throw new Error('Client not found');
  }
  
  const notes = await CRMNote.find({ client: clientId }).populate('addedBy', 'fullName').sort('-isPinned -createdAt');
  const activities = await CRMActivity.find({ client: clientId }).populate('performedBy', 'fullName').sort('-timestamp').limit(50);
  
  return {
    client,
    notes,
    activities
  };
};

export const updateClientStatus = async (clientId, status, adminId) => {
  const client = await User.findByIdAndUpdate(clientId, { clientStatus: status, lastActivityAt: Date.now() }, { new: true }).select('-password');
  
  await CRMActivity.create({
    client: clientId,
    actionType: 'STATUS_CHANGED',
    description: `Status changed to ${status}`,
    performedBy: adminId
  });
  
  return client;
};

export const assignDesigner = async (clientId, designerId, adminId) => {
  const designer = await User.findOne({ _id: designerId, role: ROLES.DESIGNER });
  if (!designer) throw new Error('Designer not found');

  const client = await User.findByIdAndUpdate(clientId, { assignedDesigner: designerId, lastActivityAt: Date.now() }, { new: true }).select('-password');
  
  await CRMActivity.create({
    client: clientId,
    actionType: 'DESIGNER_ASSIGNED',
    description: `Assigned designer ${designer.fullName}`,
    performedBy: adminId
  });
  
  return client;
};

export const addNote = async (clientId, noteText, adminId, isPinned = false) => {
  const note = await CRMNote.create({
    client: clientId,
    note: noteText,
    addedBy: adminId,
    isPinned
  });
  
  await User.findByIdAndUpdate(clientId, { lastActivityAt: Date.now() });
  
  return note.populate('addedBy', 'fullName');
};

export const getCRMAnalytics = async () => {
  const totalClients = await User.countDocuments({ role: ROLES.CLIENT });
  const activeClients = await User.countDocuments({ role: ROLES.CLIENT, clientStatus: { $in: ['Active Client', 'Project Active', 'Consultation Ongoing', 'VIP'] } });
  const highValueClients = await User.countDocuments({ role: ROLES.CLIENT, clientStatus: 'VIP' });
  
  // Aggregate total revenue
  const revenueAgg = await User.aggregate([
    { $match: { role: ROLES.CLIENT } },
    { $group: { _id: null, total: { $sum: '$totalRevenue' } } }
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
  
  return {
    totalClients,
    activeClients,
    highValueClients,
    totalRevenue,
    activeProjects: Math.floor(activeClients * 0.4), // placeholder until actual project integration
    pendingConsultations: Math.floor(activeClients * 0.1), // placeholder
    unreadMessages: 12, // placeholder
    pendingPayments: 5, // placeholder
    supportTickets: 3 // placeholder
  };
};

export const createClient = async (data, adminId) => {
  const { fullName, email, mobile, password, clientStatus } = data;
  const newClient = await User.create({
    fullName,
    email,
    mobile,
    password: password || 'defaultPassword123!',
    role: ROLES.CLIENT,
    clientStatus: clientStatus || 'New Lead'
  });
  
  await CRMActivity.create({
    client: newClient._id,
    actionType: 'STATUS_CHANGED',
    description: `Lead created`,
    performedBy: adminId
  });
  
  return newClient;
};

export const updateClient = async (clientId, data, adminId) => {
  const client = await User.findByIdAndUpdate(clientId, { ...data, lastActivityAt: Date.now() }, { new: true }).select('-password');
  
  await CRMActivity.create({
    client: clientId,
    actionType: 'STATUS_CHANGED',
    description: `Client details updated`,
    performedBy: adminId
  });
  
  return client;
};

export const deleteClient = async (clientId) => {
  await CRMActivity.deleteMany({ client: clientId });
  await CRMNote.deleteMany({ client: clientId });
  await User.findByIdAndDelete(clientId);
  return true;
};
