import { Ticket, SupportMessage } from './support.model.js';
import { getIO } from '../../config/socket.js';

// Auto-seed for MVP
const seedSupportSystem = async () => {
  try {
    const count = await Ticket.countDocuments();
    if (count === 0) {
      const ticket1 = await Ticket.create({
        ticketNumber: 'TKT-1001',
        clientName: 'Aarav Patel',
        subject: 'Delay in Italian Marble delivery',
        category: 'Project Issue',
        priority: 'High',
        status: 'Open'
      });
      const ticket2 = await Ticket.create({
        ticketNumber: 'TKT-1002',
        clientName: 'Priya Sharma',
        subject: 'Payment failed for 3D Visualizer',
        category: 'Payment',
        priority: 'Medium',
        status: 'In Progress'
      });

      await SupportMessage.create([
        { ticketId: ticket1._id, senderName: 'Aarav Patel', senderRole: 'client', message: 'Hi, the marble for my living room was supposed to arrive yesterday.' },
        { ticketId: ticket1._id, senderName: 'Support Agent', senderRole: 'admin', message: 'Hello Aarav, checking with our procurement team right away!' },
        { ticketId: ticket2._id, senderName: 'Priya Sharma', senderRole: 'client', message: 'I was charged twice for the AI consultation.' }
      ]);
      console.log('Seeded luxury support tickets');
    }
  } catch (error) {
    console.error('Support Seed Error:', error);
  }
};

seedSupportSystem();

export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ updatedAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTicketMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find({ ticketId: req.params.id }).sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, isInternalNote } = req.body;

    const newMessage = await SupportMessage.create({
      ticketId,
      senderName: 'Admin', // Hardcoded for Phase 1 MVP Dashboard
      senderRole: 'admin',
      message,
      isInternalNote: isInternalNote || false
    });

    await Ticket.findByIdAndUpdate(ticketId, { status: 'Waiting for Client', updatedAt: new Date() });

    try {
      getIO().emit('supportUpdated', { ticketId, message: newMessage });
    } catch (e) {
      console.error('Socket emission failed silently', e.message);
    }

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });

    try {
      getIO().emit('supportUpdated', { ticketId, status });
    } catch (e) {}

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
