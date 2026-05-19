import { catchAsync } from '../../utils/catchAsync.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as chatService from './chat.service.js';

export const getConversations = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const conversations = await chatService.getConversations(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, conversations, 'Conversations list loaded successfully'));
});

export const getMessages = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const { limit, skip } = req.query;

  const messages = await chatService.getMessages(
    conversationId,
    userId,
    limit ? parseInt(limit) : 50,
    skip ? parseInt(skip) : 0
  );

  return res
    .status(200)
    .json(new ApiResponse(200, messages, 'Chat message logs retrieved successfully'));
});

export const sendMessage = catchAsync(async (req, res) => {
  const { conversationId, text, attachments, replyTo } = req.body;
  const userId = req.user._id;

  const message = await chatService.sendMessage(conversationId, text, attachments, replyTo, userId);
  if (!message) {
    throw new ApiError(404, 'Conversation not found');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, message, 'Message dispatched successfully'));
});

export const editMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  const message = await chatService.editMessage(id, text, userId);
  if (!message) {
    throw new ApiError(403, 'Unauthorized action: Unable to edit this message');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, message, 'Message edited successfully'));
});

export const deleteMessageForMe = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await chatService.deleteMessageForMe(id, userId);
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Message deleted for you successfully'));
});

export const deleteMessageForEveryone = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const message = await chatService.deleteMessageForEveryone(id, userId);
  if (!message) {
    throw new ApiError(403, 'Unauthorized action: Unable to delete this message');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, message, 'Message deleted for everyone successfully'));
});

export const reactToMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  const message = await chatService.reactToMessage(id, emoji, userId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, message, 'Reaction updated successfully'));
});

// Mockup Upload for instant MERN document sharing
export const uploadChatAttachment = catchAsync(async (req, res) => {
  const fileUrl = req.body.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  const name = req.body.name || 'Layout Signoff.pdf';
  const type = req.body.type || 'file';

  return res
    .status(201)
    .json(new ApiResponse(201, {
      type,
      url: fileUrl,
      name,
      size: 154000
    }, 'Chat attachment uploaded and simulated successfully'));
});
