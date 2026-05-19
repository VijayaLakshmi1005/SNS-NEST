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
    
    // Find designer or fallback to John Designer
    const designer = await User.findById(project.designer) || {
      fullName: 'John Designer',
      email: 'designer@snsnest.com',
      mobile: '9876543210',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'
    };

    // 1. Create Project Progress details
    progress = new ProjectProgress({
      projectId: project._id,
      overallProgress: 65,
      roomProgress: [
        { name: 'Modular Kitchen', progress: 80 },
        { name: 'Master Bedroom', progress: 60 },
        { name: 'Walk-in Wardrobe', progress: 100 },
        { name: 'False Ceiling & Lighting', progress: 45 }
      ],
      team: {
        designer: {
          name: designer.fullName,
          email: designer.email,
          mobile: designer.mobile,
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'
        },
        projectManager: {
          name: 'Anand Kumar',
          mobile: '9123456789'
        },
        installationLead: {
          name: 'Ramesh Singh',
          mobile: '9876541230'
        }
      },
      documents: [
        { name: 'Scandinavian Villa Layout Plan.pdf', category: 'Floor Plan', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { name: 'Bespoke Statutario Marble Signoff.pdf', category: 'Agreement', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { name: 'Execution Agreement Phase 2.pdf', category: 'Agreement', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
      ]
    });
    await progress.save();

    // 2. Create Milestones
    const today = new Date();
    const subDays = (d) => { const n = new Date(); n.setDate(today.getDate() - d); return n; };
    const addDays = (d) => { const n = new Date(); n.setDate(today.getDate() + d); return n; };

    const milestonesData = [
      { title: 'Consultation Completed', status: 'completed', completionDate: subDays(12), notes: 'Initial consulting and luxury brief compiled.', originalDate: subDays(12), revisedDate: subDays(12) },
      { title: 'Design Approved', status: 'completed', completionDate: subDays(7), notes: 'Scandinavian aesthetic layout plan & 3D renders signed off.', originalDate: subDays(7), revisedDate: subDays(7) },
      { title: 'Material Procurement', status: 'completed', completionDate: subDays(3), notes: 'Raw Statutario stones, water-resistant ply, and premium hardware ordered.', originalDate: subDays(3), revisedDate: subDays(3) },
      { title: 'Site Preparation', status: 'completed', completionDate: subDays(1), notes: 'Dismantling of existing woodwork, wall plastering & leveling completed.', originalDate: subDays(1), revisedDate: subDays(1) },
      { title: 'Execution Started', status: 'current', notes: 'Modular kitchen assembly, plumbing rework, false ceiling aluminum channels framework in progress.', originalDate: today, revisedDate: today },
      { title: 'Furniture Installation', status: 'pending', notes: 'Installation of custom walk-in wardrobe and bedroom panels.', delayed: true, delayReason: 'Germany walnut timber shipment transit delay', originalDate: addDays(5), revisedDate: addDays(10) },
      { title: 'False Ceiling Installation', status: 'pending', notes: 'Gypboard screw fixing, joint taping & luxury paint coating.', originalDate: addDays(12), revisedDate: addDays(12) },
      { title: 'Final Styling', status: 'pending', notes: 'Bespoke pendant lighting setup, custom rug laying & luxury styling checks.', originalDate: addDays(18), revisedDate: addDays(18) },
      { title: 'Final Delivery', status: 'pending', notes: 'Deep cleaning, professional sanitization and official key handover.', originalDate: addDays(24), revisedDate: addDays(29) }
    ];

    await Milestone.insertMany(milestonesData.map(m => ({ ...m, projectId: project._id })));

    // 3. Create Material Procurements
    const procurementsData = [
      { name: 'Water-resistant Marine Plywood', status: 'delivered', deliveryForecast: subDays(2) },
      { name: 'Bespoke Statutario Marble Slab', status: 'delivered', deliveryForecast: subDays(3) },
      { name: 'Imported Walnut Timber Panels', status: 'shipped', deliveryForecast: addDays(10), delayReason: 'Suez Canal shipping delay' },
      { name: 'Ambient Dimmable LED Spotlights', status: 'ordered', deliveryForecast: addDays(5) }
    ];

    await Procurement.insertMany(procurementsData.map(p => ({ ...p, projectId: project._id })));

    // 4. Create Site Photo Updates
    const siteUpdatesData = [
      {
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'],
        caption: 'Aluminum grid framing completed for modern living room false ceiling layout.',
        uploadedBy: designer._id,
        uploadedByName: designer.fullName || 'John Designer'
      },
      {
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800'],
        caption: 'Custom walnut wardrobe base framework dry assembly in Master Bedroom.',
        uploadedBy: designer._id,
        uploadedByName: designer.fullName || 'John Designer'
      }
    ];

    await SiteUpdate.insertMany(siteUpdatesData.map(s => ({ ...s, projectId: project._id })));

    // 5. Create Activity Logs
    const activitiesData = [
      { type: 'upload', message: 'Designer uploaded 2 new site photos showing false ceiling framing and bedroom wardrobe assembly.', createdBy: designer._id, createdByName: designer.fullName },
      { type: 'milestone', message: 'Milestone "Site Preparation" marked as COMPLETED by installation lead Ramesh Singh.', createdBy: designer._id, createdByName: 'Ramesh Singh' },
      { type: 'procurement', message: 'Statutario Marble blocks successfully delivered to site logistics compound.', createdBy: designer._id, createdByName: 'System Logistics' },
      { type: 'delay', message: 'Milestone "Furniture Installation" delayed by 5 days due to Germany walnut shipment customs clearance.', createdBy: designer._id, createdByName: 'Anand Kumar' }
    ];

    await Activity.insertMany(activitiesData.map(a => ({ ...a, projectId: project._id })));
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
    team: progressDetails.team,
    documents: progressDetails.documents,
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
    team: progressDetails?.team || {},
    documents: progressDetails?.documents || [],
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
    uploadedByName: user?.fullName || 'John Designer'
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
