import { SupportTicket } from '../models/SupportTicket.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createTicket = catchAsync(async (req, res) => {
  const { subject, message } = req.body;

  const ticket = new SupportTicket({
    client: req.user._id,
    subject,
    messages: [{
      sender: req.user._id,
      message
    }]
  });

  await ticket.save();

  return res.status(201).json(new ApiResponse(201, ticket, 'Support ticket created successfully'));
});

export const getTickets = catchAsync(async (req, res) => {
  const tickets = await SupportTicket.find({ client: req.user._id });
  return res.status(200).json(new ApiResponse(200, tickets, 'Support tickets fetched successfully'));
});

export const getFaqs = catchAsync(async (req, res) => {
  const faqs = [
    { q: 'How do I book a consultation?', a: 'Go to the Consultation booking page, select your preferred designer and slot, and confirm.' },
    { q: 'What is the refund policy?', a: 'Milestone payments are final, but refunds can be requested before materials are procured.' },
    { q: 'How long does visualizer generation take?', a: 'AI visualizer modifications take about 5-10 seconds to generate.' }
  ];
  return res.status(200).json(new ApiResponse(200, faqs, 'FAQs retrieved successfully'));
});
