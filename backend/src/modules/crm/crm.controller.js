import * as crmService from './crm.service.js';

export const getClients = async (req, res) => {
  try {
    const result = await crmService.getClients(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClientDetails = async (req, res) => {
  try {
    const result = await crmService.getClientDetails(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

import { getIO } from '../../config/socket.js';

export const updateClientStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const client = await crmService.updateClientStatus(req.params.id, status, req.user._id);
    
    // Broadcast CRM update
    const io = getIO();
    io.to('admin_dashboard').emit('crm:client_updated', { clientId: client._id, status: client.clientStatus });
    
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignDesigner = async (req, res) => {
  try {
    const { designerId } = req.body;
    const client = await crmService.assignDesigner(req.params.id, designerId, req.user._id);
    
    // Broadcast CRM update
    const io = getIO();
    io.to('admin_dashboard').emit('crm:client_updated', { clientId: client._id, assignedDesigner: designerId });

    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addNote = async (req, res) => {
  try {
    const { note, isPinned } = req.body;
    const newNote = await crmService.addNote(req.params.id, note, req.user._id, isPinned);
    
    // Broadcast new activity
    const io = getIO();
    io.to('admin_dashboard').emit('crm:new_note', { clientId: req.params.id, note: newNote });

    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const analytics = await crmService.getCRMAnalytics();
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const newClient = await crmService.createClient(req.body, req.user._id);
    const io = getIO();
    io.to('admin_dashboard').emit('crm:client_created', { client: newClient });
    res.status(201).json({ success: true, data: newClient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const updatedClient = await crmService.updateClient(req.params.id, req.body, req.user._id);
    const io = getIO();
    io.to('admin_dashboard').emit('crm:client_updated', { clientId: updatedClient._id, client: updatedClient });
    res.status(200).json({ success: true, data: updatedClient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    await crmService.deleteClient(req.params.id);
    const io = getIO();
    io.to('admin_dashboard').emit('crm:client_deleted', { clientId: req.params.id });
    res.status(200).json({ success: true, message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
