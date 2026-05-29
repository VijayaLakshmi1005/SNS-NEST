import { Notification } from './notification.model.js';
import { getIO } from '../../config/socket.js';

// Auto-seed for MVP is disabled to prevent crashes and hardcoded data

// Trigger a global notification (Internal Use inside other controllers)
export const triggerNotification = async (type, title, message, roleScope = 'admin', link = null, userId = null) => {
  try {
    const notif = await Notification.create({ type, title, message, roleScope, link, userId });
    // Emit dynamically to specific roles or users
    if (userId) {
      getIO().to(userId.toString()).emit('newNotification', notif);
    } else {
      getIO().emit('newNotification', notif);
    }
    return notif;
  } catch (error) {
    console.error('Failed to trigger notification:', error.message);
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    // For admin MVP, fetch admin scoped notifications
    const notifications = await Notification.find({ roleScope: 'admin' }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ roleScope: 'admin', isRead: false });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ roleScope: 'admin', isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
