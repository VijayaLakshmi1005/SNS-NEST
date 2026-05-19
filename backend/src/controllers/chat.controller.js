import { Message } from '../models/Message.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getConversationsList = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Aggregate user messages to find unique chat threads
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $gt: ['$sender', '$recipient'] },
            { sender: '$sender', recipient: '$recipient' },
            { sender: '$recipient', recipient: '$sender' }
          ]
        },
        lastMessage: { $first: '$$ROOT' }
      }
    }
  ]);

  return res.status(200).json(new ApiResponse(200, conversations, 'Conversations threads fetched successfully'));
});

export const getMessagesBetweenUsers = catchAsync(async (req, res) => {
  const currentUserId = req.user._id;
  const partnerId = req.params.id;

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, recipient: partnerId },
      { sender: partnerId, recipient: currentUserId }
    ]
  }).sort({ createdAt: 1 });

  return res.status(200).json(new ApiResponse(200, messages, 'Chat messages history fetched successfully'));
});
