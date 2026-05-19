import { Conversation } from './conversation.model.js';
import { Message } from './message.model.js';
import { User } from '../../models/User.js';
import { getIO, getOnlineUsers } from '../../config/socket.js';
import mongoose from 'mongoose';

/**
 * Ensures at least one premium conversation exists for the user on first access
 */
export const ensureConversationsSeeded = async (userId) => {
  const count = await Conversation.countDocuments({ participants: userId });
  if (count > 0) return;

  console.log(`Seeding dynamic conversations and message history for user: ${userId}`);

  // Find John Designer or seed if missing
  let designer = await User.findOne({ role: 'designer' });
  if (!designer) {
    designer = new User({
      fullName: 'John Designer',
      email: 'designer@snsnest.com',
      mobile: '9876543210',
      password: 'designer123',
      role: 'designer',
      isVerified: true
    });
    await designer.save();
  }

  // Check if they are the same user
  if (designer._id.toString() === userId.toString()) {
    // If user is the designer, find the client to seed
    const client = await User.findOne({ role: 'client' });
    if (client) {
      designer = client;
    } else {
      return; // Skip seeding if no other user
    }
  }

  // 1. Create Conversation
  const conversation = new Conversation({
    participants: [userId, designer._id],
    unreadCounts: new Map([[userId.toString(), 2], [designer._id.toString(), 0]]),
    pinnedBy: []
  });
  await conversation.save();

  // 2. Create Message History
  const messagesData = [
    {
      senderId: designer._id,
      text: "Welcome to your luxury interior design suite! Let's collaborate in real time on the Scandinavian Villa details.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      senderId: designer._id,
      text: "I have uploaded the initial 3D concept render for the master bedroom. Please review the veneer and lighting options.",
      attachments: [{
        type: 'image',
        url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
        name: 'Master Bedroom Render.jpg',
        size: 245000
      }],
      createdAt: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
      senderId: userId,
      text: "I absolutely love this mood! The organic textures feel incredibly warm and Scandi.",
      reactions: [{ userId: designer._id, emoji: '❤️' }],
      createdAt: new Date(Date.now() - 20 * 60 * 1000)
    },
    {
      senderId: userId,
      text: "Can we use premium fluted walnut paneling for the bed back wall? Like we saw in the reference.",
      createdAt: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      senderId: designer._id,
      text: "Yes, fluted walnut will look pristine! I've recorded a voice note detailing our material procurement forecast for it.",
      attachments: [{
        type: 'audio',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        name: 'Material Forecast.mp3',
        duration: 18
      }],
      createdAt: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      senderId: designer._id,
      text: "Here is the layout plan document for the villa layout. Check page 3 for bedroom dimensions.",
      attachments: [{
        type: 'file',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        name: 'Scandinavian Villa Layout.pdf',
        size: 154000
      }],
      createdAt: new Date(Date.now() - 5 * 60 * 1000)
    }
  ];

  const messages = [];
  for (const m of messagesData) {
    const msg = new Message({
      conversationId: conversation._id,
      senderId: m.senderId === 'userId' ? userId : m.senderId,
      text: m.text,
      attachments: m.attachments || [],
      reactions: m.reactions || [],
      seenBy: [m.senderId],
      status: 'sent',
      createdAt: m.createdAt
    });
    await msg.save();
    messages.push(msg);
  }

  // Link last message
  conversation.lastMessage = messages[messages.length - 1]._id;
  await conversation.save();
};

/**
 * Fetch conversations with participants populated
 */
export const getConversations = async (userId) => {
  await ensureConversationsSeeded(userId);

  const list = await Conversation.find({ participants: userId })
    .populate({
      path: 'participants',
      select: 'fullName email role profileImage mobile'
    })
    .populate({
      path: 'lastMessage'
    })
    .sort({ updatedAt: -1 });

  return list;
};

/**
 * Fetch messages inside a conversation with unread cleanup and Socket notification triggers
 */
export const getMessages = async (conversationId, userId, limit = 50, skip = 0) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return [];

  // Reset unread count for user in DB
  const unreadKey = `unreadCounts.${userId}`;
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: { [unreadKey]: 0 }
  });

  // Fetch messages
  const messages = await Message.find({
    conversationId,
    deletedFor: { $ne: userId }
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Reverse list to chronological order for client display
  const chatHistory = messages.reverse();

  // Mark all unread messages as read / seen
  const unreadIds = chatHistory
    .filter(m => m.senderId.toString() !== userId.toString() && !m.seenBy.includes(userId))
    .map(m => m._id);

  if (unreadIds.length > 0) {
    await Message.updateMany(
      { _id: { $in: unreadIds } },
      {
        $addToSet: { seenBy: userId },
        $set: { status: 'seen' }
      }
    );

    // Socket: Broadcast message-seen update to participants in room
    try {
      const io = getIO();
      io.to(conversationId.toString()).emit('message-seen', {
        conversationId,
        seenBy: userId,
        messageIds: unreadIds
      });
    } catch (socketErr) {
      console.warn('Realtime saw update skipped:', socketErr.message);
    }
  }

  return chatHistory;
};

/**
 * Commit a message, identify if recipient is online, and emit socket alerts
 */
export const sendMessage = async (conversationId, text, attachments = [], replyTo = null, userId) => {
  // Validate conversation exists
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return null;

  // Check if recipient is online to set dynamic double-tick (delivered) status
  const onlineUsers = getOnlineUsers();
  const recipients = conversation.participants.filter(p => p.toString() !== userId.toString());
  
  let initialStatus = 'sent';
  const anyOnline = recipients.some(r => onlineUsers.has(r.toString()));
  if (anyOnline) {
    initialStatus = 'delivered'; // double ticks in real-time
  }

  const message = new Message({
    conversationId,
    senderId: userId,
    text,
    attachments,
    replyTo,
    seenBy: [userId],
    status: initialStatus
  });
  await message.save();

  // Update Conversation pointers & unread indices
  conversation.lastMessage = message._id;
  recipients.forEach(r => {
    const key = r.toString();
    const currentVal = conversation.unreadCounts.get(key) || 0;
    conversation.unreadCounts.set(key, currentVal + 1);
  });
  await conversation.save();

  // Socket: Dispatch realtime event
  try {
    const io = getIO();
    // Fetch fresh conversaton details for sidebar updates
    const populatedConv = await Conversation.findById(conversationId)
      .populate('participants', 'fullName email role profileImage mobile')
      .populate('lastMessage');

    io.to(conversationId.toString()).emit('receive-message', {
      message,
      conversation: populatedConv
    });
  } catch (socketErr) {
    console.error('Socket messaging push failed, falling back to REST response:', socketErr.message);
  }

  return message;
};

/**
 * Edit messages dynamically
 */
export const editMessage = async (messageId, text, userId) => {
  const msg = await Message.findById(messageId);
  if (!msg || msg.senderId.toString() !== userId.toString()) return null;

  msg.text = text;
  msg.edited = true;
  await msg.save();

  try {
    const io = getIO();
    io.to(msg.conversationId.toString()).emit('message-edit', {
      messageId,
      text,
      edited: true
    });
  } catch (socketErr) {
    console.error(socketErr);
  }

  return msg;
};

/**
 * Delete for me
 */
export const deleteMessageForMe = async (messageId, userId) => {
  return await Message.findByIdAndUpdate(messageId, {
    $addToSet: { deletedFor: userId }
  }, { new: true });
};

/**
 * Delete for everyone
 */
export const deleteMessageForEveryone = async (messageId, userId) => {
  const msg = await Message.findById(messageId);
  if (!msg || msg.senderId.toString() !== userId.toString()) return null;

  msg.text = "This message was deleted";
  msg.deletedForEveryone = true;
  msg.attachments = [];
  await msg.save();

  try {
    const io = getIO();
    io.to(msg.conversationId.toString()).emit('message-delete', {
      messageId,
      deletedForEveryone: true
    });
  } catch (socketErr) {
    console.error(socketErr);
  }

  return msg;
};

/**
 * Toggle emoji reactions
 */
export const reactToMessage = async (messageId, emoji, userId) => {
  const msg = await Message.findById(messageId);
  if (!msg) return null;

  // Search if user has reacted already
  const reactIdx = msg.reactions.findIndex(r => r.userId.toString() === userId.toString());
  if (reactIdx > -1) {
    // If same emoji, remove it (toggle). If different, change it.
    if (msg.reactions[reactIdx].emoji === emoji) {
      msg.reactions.splice(reactIdx, 1);
    } else {
      msg.reactions[reactIdx].emoji = emoji;
    }
  } else {
    msg.reactions.push({ userId, emoji });
  }

  await msg.save();

  try {
    const io = getIO();
    io.to(msg.conversationId.toString()).emit('reaction-added', {
      messageId,
      reactions: msg.reactions
    });
  } catch (socketErr) {
    console.error(socketErr);
  }

  return msg;
};
