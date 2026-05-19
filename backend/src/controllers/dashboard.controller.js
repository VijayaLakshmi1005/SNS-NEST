import { Project } from '../models/Project.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getDashboardOverview = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const ongoingProjects = await Project.find({ client: userId }).populate('designer', 'fullName profileImage');
  const consultationBookings = await Booking.find({ client: userId }).populate('designer', 'fullName profileImage');
  const recentPayments = await Payment.find({ client: userId }).sort({ createdAt: -1 }).limit(5);
  const notifications = await Notification.find({ recipient: userId, isRead: false }).sort({ createdAt: -1 }).limit(5);

  const overview = {
    ongoingProjectsCount: ongoingProjects.length,
    ongoingProjects,
    consultationsCount: consultationBookings.length,
    consultationBookings,
    recentPayments,
    notifications
  };

  return res
    .status(200)
    .json(new ApiResponse(200, overview, 'Dashboard overview data fetched successfully'));
});

export const getDashboardProjects = catchAsync(async (req, res) => {
  const projects = await Project.find({ client: req.user._id }).populate('designer', 'fullName email mobile profileImage');
  return res.status(200).json(new ApiResponse(200, projects, 'Projects fetched successfully'));
});

export const getDashboardMeetings = catchAsync(async (req, res) => {
  const meetings = await Booking.find({ client: req.user._id }).populate('designer', 'fullName email mobile profileImage');
  return res.status(200).json(new ApiResponse(200, meetings, 'Meetings/Bookings fetched successfully'));
});

export const getDashboardNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, notifications, 'Notifications fetched successfully'));
});

export const getDashboardHeader = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const project = await Project.findOne({ client: userId }).sort({ updatedAt: -1 });

  let currentPhase = 'Material Procurement';
  if (project) {
    if (project.timeline && project.timeline.length > 0) {
      const incompleteMilestone = project.timeline.find(item => !item.completed);
      if (incompleteMilestone) {
        currentPhase = incompleteMilestone.status;
      } else {
        currentPhase = project.timeline[project.timeline.length - 1].status;
      }
    } else {
      currentPhase = project.status;
    }
  }

  const headerInfo = {
    name: req.user.fullName || req.user.email.split('@')[0],
    projectName: project ? project.title : 'Scandinavian Villa',
    currentPhase: currentPhase
  };

  return res
    .status(200)
    .json(new ApiResponse(200, headerInfo, 'Dashboard header data fetched successfully'));
});

export const getDashboardActivity = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(10);
  
  const activities = notifications.map(notif => ({
    id: notif._id,
    type: notif.type || 'notification',
    message: notif.message,
    createdAt: notif.createdAt
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, activities, 'Dashboard activity data fetched successfully'));
});

