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
  const project = await Project.findOne({ client: userId }).sort({ updatedAt: -1 }).populate('designer', 'fullName');

  let currentPhase = 'Draft';
  let completedMilestones = 0;
  let totalMilestones = 0;
  
  if (project) {
    if (project.timeline && project.timeline.length > 0) {
      totalMilestones = project.timeline.length;
      completedMilestones = project.timeline.filter(t => t.completed).length;
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

  const completionPercentage = totalMilestones === 0 ? 0 : Math.round((completedMilestones / totalMilestones) * 100);

  const headerInfo = {
    name: req.user.fullName || req.user.email.split('@')[0],
    projectName: project ? project.title : 'N/A',
    projectType: project ? project.projectType : 'N/A',
    currentPhase: currentPhase,
    completionPercentage: completionPercentage,
    assignedAdmin: project?.designer?.fullName || 'Not Assigned',
    lastUpdated: project ? project.updatedAt : null,
    expectedCompletion: project ? project.expectedCompletion : null
  };

  return res
    .status(200)
    .json(new ApiResponse(200, headerInfo, 'Dashboard header data fetched successfully'));
});

export const getDashboardActivity = catchAsync(async (req, res) => {
  const userId = req.user._id;
  // We need to fetch Activity records for the client's current project.
  // First, find the project
  const project = await Project.findOne({ client: userId }).sort({ createdAt: -1 });
  
  if (!project) {
    return res.status(200).json(new ApiResponse(200, [], 'No active project found'));
  }

  // Now import Activity from the tracking model
  const { Activity } = await import('../modules/project-tracking/tracking.model.js');
  
  const activities = await Activity.find({ projectId: project._id }).sort({ createdAt: -1 }).limit(10);

  const mappedActivities = activities.map(act => ({
    id: act._id,
    type: act.type,
    message: act.message,
    createdAt: act.createdAt
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, mappedActivities, 'Dashboard activity data fetched successfully'));
});

