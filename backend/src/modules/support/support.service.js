import { SupportTicket } from '../../models/SupportTicket.js';
import { SupportMessage } from '../../models/SupportMessage.js';
import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { getIO } from '../../config/socket.js';
import mongoose from 'mongoose';

export class SupportService {
  static async getDashboardKPIs() {
    const [openTickets, resolvedToday, highPriority, agentsCount] = await Promise.all([
      SupportTicket.countDocuments({ status: { $in: ['Open', 'In-Progress'] } }),
      SupportTicket.countDocuments({ 
        status: 'Resolved', 
        updatedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
      }),
      SupportTicket.countDocuments({ priority: { $in: ['High', 'Urgent'] }, status: { $ne: 'Closed' } }),
      User.countDocuments({ role: { $in: ['admin', 'designer'] } })
    ]);
    return { openTickets, resolvedToday, highPriority, agentsCount };
  }

  static async getTickets(query) {
    const { status, priority, category, search, page = 1, limit = 20 } = query;
    const matchStage = {};

    if (status) matchStage.status = status;
    if (priority) matchStage.priority = priority;
    if (category) matchStage.category = category;
    if (search) {
      matchStage.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const tickets = await SupportTicket.find(matchStage)
      .populate('client', 'fullName email profileImage')
      .populate('assignedAdmin', 'fullName profileImage')
      .populate('assignedDesigner', 'fullName profileImage')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupportTicket.countDocuments(matchStage);

    return { tickets, total, pages: Math.ceil(total / limit) };
  }

  static async getTicketById(ticketId) {
    const ticket = await SupportTicket.findById(ticketId)
      .populate('client', 'fullName email mobile profileImage')
      .populate('assignedAdmin', 'fullName profileImage')
      .populate('assignedDesigner', 'fullName profileImage')
      .populate('relatedProject')
      .populate('timeline.performedBy', 'fullName role');

    if (!ticket) throw new ApiError(404, 'Ticket not found');
    return ticket;
  }

  static async createTicket(userId, data) {
    // Auto-routing logic
    let assignedDesigner = null;
    let priority = data.priority || 'Medium';

    if (data.category === 'Project' && data.relatedProject) {
      const Project = mongoose.model('Project');
      const project = await Project.findById(data.relatedProject);
      if (project && project.assignedDesigner) {
        assignedDesigner = project.assignedDesigner;
      }
    }

    const ticket = new SupportTicket({
      client: userId,
      subject: data.subject,
      category: data.category || 'General',
      priority,
      status: 'Open',
      assignedDesigner,
      relatedProject: data.relatedProject,
      tags: data.tags || [],
      timeline: [{ action: 'Created', description: 'Ticket created by client', performedBy: userId }]
    });

    await ticket.save();

    if (data.initialMessage) {
      await SupportMessage.create({
        ticket: ticket._id,
        sender: userId,
        message: data.initialMessage,
        attachments: data.attachments || []
      });
    }

    try {
      const populatedTicket = await SupportTicket.findById(ticket._id).populate('client', 'fullName profileImage');
      getIO().emit('ticket_created', populatedTicket);
    } catch(e) {}

    return ticket;
  }

  static async updateTicket(ticketId, updateData, adminId) {
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const oldStatus = ticket.status;
    const oldAssignee = ticket.assignedDesigner?.toString();

    if (updateData.status && updateData.status !== oldStatus) {
      ticket.timeline.push({ action: 'Status Changed', description: `Status changed to ${updateData.status}`, performedBy: adminId });
    }
    if (updateData.assignedDesigner && updateData.assignedDesigner !== oldAssignee) {
      ticket.timeline.push({ action: 'Reassigned', description: 'Assigned Designer changed', performedBy: adminId });
    }

    Object.assign(ticket, updateData);
    await ticket.save();

    try {
      getIO().emit('ticket_updated', ticket);
    } catch(e) {}

    return ticket;
  }

  static async getMessages(ticketId) {
    const messages = await SupportMessage.find({ ticket: ticketId })
      .populate('sender', 'fullName role profileImage')
      .populate('replyTo')
      .sort({ createdAt: 1 });
    return messages;
  }

  static async sendMessage(ticketId, senderId, data) {
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const message = new SupportMessage({
      ticket: ticketId,
      sender: senderId,
      message: data.message,
      attachments: data.attachments || [],
      isInternalNote: data.isInternalNote || false,
      replyTo: data.replyTo || null
    });

    await message.save();

    const sender = await User.findById(senderId);
    if (sender.role === 'client') {
      ticket.status = 'Open';
    } else if (sender.role === 'admin' || sender.role === 'designer') {
      ticket.status = 'Pending Client';
    }
    ticket.timeline.push({ action: 'Message Sent', description: `Message sent by ${sender.role}`, performedBy: senderId });
    await ticket.save();

    const populatedMessage = await SupportMessage.findById(message._id)
      .populate('sender', 'fullName role profileImage')
      .populate('replyTo');

    try {
      getIO().emit(`message_sent_${ticketId}`, populatedMessage);
      getIO().emit('ticket_updated', ticket);
    } catch(e) {}

    return populatedMessage;
  }
}
