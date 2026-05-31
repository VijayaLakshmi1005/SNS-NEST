import { Project } from '../../models/Project.js';
import { User } from '../../models/User.js';
import { Milestone, Activity, SiteUpdate, Procurement, ProjectProgress } from './tracking.model.js';
import { getIO } from '../../config/socket.js';

/**
 * Helper to dynamically seed tracking details for a project if not exists
 */
export const ensureProjectTrackingData = async (project, clientUserId) => {
  let progress = await ProjectProgress.findOne({ projectId: project._id });
  
  if (!progress) {
    console.log(`Seeding dynamic project tracking dashboard details for project: ${project.title}`);
    
    const designer = await User.findById(project.designer) || {
      fullName: 'Unassigned',
      email: '',
      mobile: '',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'
    };

    progress = new ProjectProgress({
      projectId: project._id,
      overallProgress: project.progress || 0,
      roomProgress: [], // Can be populated dynamically later
      team: {
        designer: {
          name: designer.fullName,
          email: designer.email,
          mobile: designer.mobile,
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'
        },
        projectManager: {
          name: 'Unassigned',
          mobile: ''
        },
        installationLead: {
          name: 'Unassigned',
          mobile: ''
        }
      },
      documents: (project.uploads || []).map(u => ({
        name: u.fileName,
        category: u.fileType,
        url: u.fileUrl
      }))
    });
    await progress.save();

    // Create Milestones dynamically from Project timeline
    if (project.timeline && project.timeline.length > 0) {
      const milestonesData = project.timeline.map((step, index) => {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + (index * 7)); // Spread out by 1 week each
        return {
          projectId: project._id,
          title: step.status,
          status: step.completed ? 'completed' : 'pending',
          notes: step.comments || '',
          originalDate: futureDate,
          revisedDate: futureDate,
          completionDate: step.completed ? today : null
        };
      });
      await Milestone.insertMany(milestonesData);
    }
  }

  return progress;
};

/**
 * Fetch the client's current active project with full real-time tracking dashboard statistics
 */
export const getCurrentTracking = async (userId) => {
  // Find project where user is client
  let project = await Project.findOne({ client: userId }).sort({ createdAt: -1 });
  
  if (!project) {
    // If no project, create a default Mock project for vj@123.com to look at
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

    project = new Project({
      title: 'Scandinavian Villa',
      client: userId,
      designer: designer._id,
      budget: 2940000,
      status: 'Execution Started',
      timeline: [
        { status: 'Consultation Completed', completed: true },
        { status: 'Design Approved', completed: true },
        { status: 'Material Procurement', completed: true },
        { status: 'Execution Started', completed: true },
        { status: 'Final Delivery', completed: false }
      ]
    });
    await project.save();
  }

  // Ensure tracking documents exist in the relational tracking schema
  const progressDetails = await ensureProjectTrackingData(project, userId);

  // Fetch all related tracking data
  const milestones = await Milestone.find({ projectId: project._id }).sort({ originalDate: 1 });
  const activities = await Activity.find({ projectId: project._id }).sort({ createdAt: -1 });
  const siteUpdates = await SiteUpdate.find({ projectId: project._id }).sort({ createdAt: -1 });
  const procurement = await Procurement.find({ projectId: project._id });

  // Override old dummy data with live project details
  const designer = await User.findById(project.designer);
  const liveTeam = {
    designer: {
      name: designer?.fullName || 'Unassigned',
      email: designer?.email || '',
      mobile: designer?.mobile || '',
      profileImage: designer?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'
    },
    projectManager: { name: 'Unassigned', mobile: '' },
    installationLead: { name: 'Unassigned', mobile: '' }
  };

  const liveDocuments = (project.uploads || []).map(u => ({
    name: u.fileName,
    category: u.fileType,
    url: u.fileUrl
  }));

  return {
    project: {
      _id: project._id,
      title: project.title,
      projectType: 'Bespoke Residential',
      location: 'Indiranagar, Bangalore',
      status: project.status,
      budget: project.budget,
      startDate: project.createdAt,
      estimatedCompletion: new Date(new Date(project.createdAt).setDate(new Date(project.createdAt).getDate() + 30))
    },
    overallProgress: progressDetails.overallProgress,
    roomProgress: progressDetails.roomProgress,
    team: liveTeam,
    documents: liveDocuments,
    milestones,
    activities,
    siteUpdates,
    procurement
  };
};

/**
 * Fetch project details by ID
 */
export const getProjectTracking = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  await ensureProjectTrackingData(project, userId);

  const progressDetails = await ProjectProgress.findOne({ projectId });
  const milestones = await Milestone.find({ projectId }).sort({ originalDate: 1 });
  const activities = await Activity.find({ projectId }).sort({ createdAt: -1 });
  const siteUpdates = await SiteUpdate.find({ projectId }).sort({ createdAt: -1 });
  const procurement = await Procurement.find({ projectId });

  // Override old dummy data with live project details
  const designer = await User.findById(project.designer);
  const liveTeam = {
    designer: {
      name: designer?.fullName || 'Unassigned',
      email: designer?.email || '',
      mobile: designer?.mobile || '',
      profileImage: designer?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'
    },
    projectManager: { name: 'Unassigned', mobile: '' },
    installationLead: { name: 'Unassigned', mobile: '' }
  };

  const liveDocuments = (project.uploads || []).map(u => ({
    name: u.fileName,
    category: u.fileType,
    url: u.fileUrl
  }));

  return {
    project: {
      _id: project._id,
      title: project.title,
      projectType: 'Bespoke Residential',
      location: 'Indiranagar, Bangalore',
      status: project.status,
      budget: project.budget,
      startDate: project.createdAt
    },
    overallProgress: progressDetails?.overallProgress || 0,
    roomProgress: progressDetails?.roomProgress || [],
    team: liveTeam,
    documents: liveDocuments,
    milestones,
    activities,
    siteUpdates,
    procurement
  };
};

/**
 * Fetch list of milestones
 */
export const getMilestones = async (projectId) => {
  return await Milestone.find({ projectId }).sort({ originalDate: 1 });
};

/**
 * Fetch activities feed
 */
export const getActivities = async (projectId) => {
  return await Activity.find({ projectId }).sort({ createdAt: -1 });
};

/**
 * Fetch site photo updates
 */
export const getSiteUpdates = async (projectId) => {
  return await SiteUpdate.find({ projectId }).sort({ createdAt: -1 });
};

/**
 * Fetch materials procurement list
 */
export const getProcurement = async (projectId) => {
  return await Procurement.find({ projectId });
};

/**
 * Add a site photo update from designer, with real-time Socket push notifications
 */
export const addSiteUpdate = async (projectId, caption, images, userId) => {
  const user = await User.findById(userId);
  const siteUpdate = new SiteUpdate({
    projectId,
    images,
    caption,
    uploadedBy: userId,
    uploadedByName: user?.fullName || 'Unassigned'
  });
  await siteUpdate.save();

  // Insert Activity record
  const activity = new Activity({
    projectId,
    type: 'upload',
    message: `${user?.fullName || 'Designer'} uploaded a new site update: "${caption}"`,
    createdBy: userId,
    createdByName: user?.fullName || 'Designer'
  });
  await activity.save();

  // Socket.io Real-Time Broadcast!
  try {
    const io = getIO();
    // Emit new site update directly to the project tracking socket room
    io.to(projectId.toString()).emit('site-update:added', {
      siteUpdate,
      activity
    });
    console.log(`Realtime socket broadcast dispatched for project room: ${projectId}`);
  } catch (socketErr) {
    console.error('Socket realtime push failed, falling back to db entry:', socketErr.message);
  }

  return { siteUpdate, activity };
};

/**
 * Add manual activity feed record, with real-time Socket push
 */
export const addActivity = async (projectId, type, message, userId) => {
  const user = await User.findById(userId);
  const activity = new Activity({
    projectId,
    type,
    message,
    createdBy: userId,
    createdByName: user?.fullName || 'System Admin'
  });
  await activity.save();

  // Trigger realtime socket push
  try {
    const io = getIO();
    io.to(projectId.toString()).emit('activity:added', activity);
    console.log(`Realtime activity socket push sent for project room: ${projectId}`);
  } catch (socketErr) {
    console.error('Socket realtime push failed:', socketErr.message);
  }

  return activity;
};
