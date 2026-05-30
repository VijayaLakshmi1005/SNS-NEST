import mongoose from 'mongoose';
import { ProjectProgress, Milestone, Activity, SiteUpdate, Procurement } from './backend/src/modules/project-tracking/tracking.model.js';
import { Project } from './backend/src/models/Project.js';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/sreen/Desktop/SNS-NEST/backend/.env' });

async function wipeMockData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // We want to delete tracking data that was seeded incorrectly.
    const deletedProgress = await ProjectProgress.deleteMany({});
    console.log('Deleted progress:', deletedProgress.deletedCount);
    
    const deletedMilestones = await Milestone.deleteMany({});
    console.log('Deleted milestones:', deletedMilestones.deletedCount);
    
    const deletedActivities = await Activity.deleteMany({});
    console.log('Deleted activities:', deletedActivities.deletedCount);
    
    const deletedUpdates = await SiteUpdate.deleteMany({});
    console.log('Deleted site updates:', deletedUpdates.deletedCount);
    
    const deletedProc = await Procurement.deleteMany({});
    console.log('Deleted procurements:', deletedProc.deletedCount);
    
    // Also delete any project that has "Scandinavian Villa" just in case they hit the fallback
    const deletedProjects = await Project.deleteMany({ title: 'Scandinavian Villa' });
    console.log('Deleted Scandinavian Villa projects:', deletedProjects.deletedCount);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

wipeMockData();
