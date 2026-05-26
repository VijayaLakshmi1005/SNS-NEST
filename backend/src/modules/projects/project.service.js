import { ProjectModular } from './project.model.js';
import { ProjectTask } from './task.model.js';
import { getIO } from '../../config/socket.js';

export const getProjectAnalytics = async () => {
  const total = await ProjectModular.countDocuments();
  const active = await ProjectModular.countDocuments({ status: { $in: ['Consultation', 'In Design', 'Execution', 'Procurement', 'Installation'] } });
  const completed = await ProjectModular.countDocuments({ status: 'Completed' });
  const delayed = await ProjectModular.countDocuments({ status: 'Delayed' });

  // Optional aggregations for payments, consultations, etc.
  const totalRevenueData = await ProjectModular.aggregate([
    { $group: { _id: null, totalBudget: { $sum: "$budget" } } }
  ]);
  const totalBudget = totalRevenueData.length > 0 ? totalRevenueData[0].totalBudget : 0;

  return { total, active, completed, delayed, totalBudget };
};

export const createTask = async (projectId, data) => {
  const task = await ProjectTask.create({ project: projectId, ...data });
  try {
    getIO().to(`project_${projectId}`).emit('taskUpdated', task);
  } catch (err) { }
  return task;
};

export const getTasksForProject = async (projectId) => {
  return await ProjectTask.find({ project: projectId }).populate('assignedTo', 'fullName email profileImage').sort({ createdAt: -1 });
};

export const updateTaskStatus = async (taskId, status) => {
  const task = await ProjectTask.findByIdAndUpdate(
    taskId,
    { status, ...(status === 'Completed' ? { completedAt: new Date() } : {}) },
    { new: true }
  );
  
  if (task) {
    try {
      getIO().to(`project_${task.project}`).emit('taskUpdated', task);
      
      // Automatically calculate and update project progress
      const allTasks = await ProjectTask.find({ project: task.project });
      if (allTasks.length > 0) {
        const completedCount = allTasks.filter(t => t.status === 'Completed').length;
        const progress = Math.round((completedCount / allTasks.length) * 100);
        
        const project = await ProjectModular.findByIdAndUpdate(
          task.project,
          { progress },
          { new: true }
        );
        
        getIO().to(`project_${task.project}`).emit('projectUpdated', project);
        getIO().emit('projectAnalyticsUpdated');
      }
    } catch (err) { }
  }
  
  return task;
};

export const updateTask = async (taskId, updateData) => {
  const task = await ProjectTask.findByIdAndUpdate(taskId, updateData, { new: true });
  if (task) {
    try {
      getIO().to(`project_${task.project}`).emit('taskUpdated', task);
    } catch (err) {}
  }
  return task;
};

export const deleteTask = async (taskId) => {
  const task = await ProjectTask.findByIdAndDelete(taskId);
  if (task) {
    try {
      getIO().to(`project_${task.project}`).emit('taskDeleted', taskId);
      
      // Recalculate progress after deletion
      const allTasks = await ProjectTask.find({ project: task.project });
      const completedCount = allTasks.filter(t => t.status === 'Completed').length;
      const progress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;
      
      const project = await ProjectModular.findByIdAndUpdate(
        task.project,
        { progress },
        { new: true }
      );
      
      getIO().to(`project_${task.project}`).emit('projectUpdated', project);
      getIO().emit('projectAnalyticsUpdated');
    } catch (err) {}
  }
  return task;
};

export const updateProjectProgress = async (id, progress) => {
  const project = await ProjectModular.findByIdAndUpdate(id, { progress }, { new: true });
  try {
    getIO().to(`project_${id}`).emit('projectUpdated', project);
    getIO().emit('projectAnalyticsUpdated'); // Triggers dashboard refresh globally
  } catch (err) { }
  return project;
};
