import { catchAsync } from '../../utils/catchAsync.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { SupportService } from './support.service.js';

export const getDashboardKPIs = catchAsync(async (req, res) => {
  const kpis = await SupportService.getDashboardKPIs();
  res.status(200).json(new ApiResponse(200, kpis, 'Dashboard KPIs fetched successfully'));
});

export const getTickets = catchAsync(async (req, res) => {
  const result = await SupportService.getTickets(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Tickets fetched successfully'));
});

export const getTicketById = catchAsync(async (req, res) => {
  const ticket = await SupportService.getTicketById(req.params.id);
  res.status(200).json(new ApiResponse(200, ticket, 'Ticket fetched successfully'));
});

export const createTicket = catchAsync(async (req, res) => {
  const ticket = await SupportService.createTicket(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, ticket, 'Ticket created successfully'));
});

export const updateTicket = catchAsync(async (req, res) => {
  const ticket = await SupportService.updateTicket(req.params.id, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, ticket, 'Ticket updated successfully'));
});

export const getTicketMessages = catchAsync(async (req, res) => {
  const messages = await SupportService.getMessages(req.params.id);
  res.status(200).json(new ApiResponse(200, messages, 'Messages fetched successfully'));
});

export const sendMessage = catchAsync(async (req, res) => {
  const message = await SupportService.sendMessage(req.params.id, req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, message, 'Message sent successfully'));
});
