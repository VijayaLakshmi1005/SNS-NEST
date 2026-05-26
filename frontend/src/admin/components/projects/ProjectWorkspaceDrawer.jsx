import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MessageSquare, Briefcase, Paperclip, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

function ProjectTimeline({ projectId }) {
  const queryClient = useQueryClient();
  
  const { data: activityQuery } = useQuery({
    queryKey: ['admin-project-activity', projectId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects/${projectId}/activity`, { withCredentials: true });
      return res.data;
    },
    enabled: !!projectId
  });
  
  const activities = activityQuery?.data || [];

  useEffect(() => {
    const socket = io(API_URL.replace('/api', ''), { withCredentials: true, transports: ['websocket', 'polling'] });
    socket.emit('joinProjectRoom', projectId);
    socket.on('newActivity', () => queryClient.invalidateQueries(['admin-project-activity', projectId]));
    return () => socket.disconnect();
  }, [projectId, queryClient]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold font-nav-style text-[#2d2a26] mb-4">Project Timeline & Activity</h3>
      <div className="relative border-l-2 border-[#e5e0d8] ml-4 space-y-8 pb-4">
        {activities.map((activity, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={activity._id} 
            className="relative pl-6"
          >
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-[#2d2a26]" />
            <div className="bg-white p-4 rounded-xl border border-[#e5e0d8] shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-[#2d2a26]">{activity.action}</h4>
                <span className="text-xs text-[#8b8175]">
                  {new Date(activity.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <p className="text-sm text-[#8b8175]">{activity.details}</p>
              {activity.user && (
                <p className="text-xs text-[#d4cecb] mt-2 font-medium">By: {activity.user.fullName || 'System'}</p>
              )}
            </div>
          </motion.div>
        ))}
        {activities.length === 0 && (
          <p className="pl-6 text-sm text-[#8b8175]">No activity recorded yet.</p>
        )}
      </div>
    </div>
  );
}

function TaskBoard({ projectId }) {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  const { data: tasksQuery } = useQuery({
    queryKey: ['admin-project-tasks', projectId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects/${projectId}/tasks`, { withCredentials: true });
      return res.data;
    },
    enabled: !!projectId
  });
  const tasks = tasksQuery?.data || [];

  useEffect(() => {
    const socket = io(API_URL.replace('/api', ''), { withCredentials: true, transports: ['websocket', 'polling'] });
    socket.emit('joinProjectRoom', projectId);
    
    socket.on('taskUpdated', () => queryClient.invalidateQueries(['admin-project-tasks', projectId]));
    socket.on('taskDeleted', () => queryClient.invalidateQueries(['admin-project-tasks', projectId]));
    
    return () => socket.disconnect();
  }, [projectId, queryClient]);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    try {
      await axios.patch(`${API_URL}/projects/${projectId}/tasks/${taskId}/status`, { status }, { withCredentials: true });
      queryClient.invalidateQueries(['admin-project-tasks', projectId]);
      queryClient.invalidateQueries(['admin-project', projectId]);
    } catch (err) {}
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await axios.post(`${API_URL}/projects/${projectId}/tasks`, { title: newTaskTitle, status: 'Todo', priority: 'Medium' }, { withCredentials: true });
      setNewTaskTitle('');
      queryClient.invalidateQueries(['admin-project-tasks', projectId]);
      queryClient.invalidateQueries(['admin-project', projectId]);
    } catch (err) {}
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`${API_URL}/projects/${projectId}/tasks/${taskId}`, { withCredentials: true });
      queryClient.invalidateQueries(['admin-project-tasks', projectId]);
      queryClient.invalidateQueries(['admin-project', projectId]);
    } catch (err) {}
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
  };

  const handleSaveEdit = async (taskId) => {
    if (!editTitle.trim()) {
      setEditingTaskId(null);
      return;
    }
    try {
      await axios.patch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, { title: editTitle }, { withCredentials: true });
      setEditingTaskId(null);
      queryClient.invalidateQueries(['admin-project-tasks', projectId]);
    } catch (err) {}
  };

  const columns = ['Todo', 'In Progress', 'In Review', 'Completed'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-nav-style text-[#2d2a26]">Kanban Execution Board</h3>
      </div>
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full pb-4 min-w-max">
          {columns.map(status => (
            <div 
              key={status} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              className="w-80 flex flex-col bg-[#fcfbf9] border border-[#e5e0d8] rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="p-4 border-b border-[#e5e0d8] bg-white font-semibold text-sm text-[#2d2a26] flex justify-between items-center">
                {status}
                <span className="bg-[#e5e0d8] text-[#8b8175] text-xs px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {status === 'Todo' && (
                  <form onSubmit={handleAddTask} className="mb-4">
                    <input 
                      type="text" 
                      placeholder="+ Quick add task..." 
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-white border border-[#e5e0d8] rounded-xl focus:outline-none focus:border-[#2d2a26]"
                    />
                  </form>
                )}
                <AnimatePresence>
                  {tasks.filter(t => t.status === status).map(task => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={task._id}
                      draggable={editingTaskId !== task._id}
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className="group relative p-4 bg-white border border-[#e5e0d8] rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-[#d4cecb] transition-colors"
                    >
                      {editingTaskId === task._id ? (
                        <div className="mb-2">
                          <input 
                            autoFocus
                            type="text" 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveEdit(task._id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task._id)}
                            className="w-full text-sm font-semibold text-[#2d2a26] px-2 py-1 bg-[#fcfbf9] border border-[#e5e0d8] rounded focus:outline-none focus:border-[#2d2a26]"
                          />
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-[#2d2a26] mb-2 pr-8">{task.title}</p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                          task.priority === 'High' ? 'bg-red-50 text-red-700' :
                          task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Hover Actions */}
                      {editingTaskId !== task._id && (
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button onClick={() => startEditing(task)} className="p-1.5 text-[#8b8175] hover:text-[#2d2a26] hover:bg-[#fcfbf9] rounded-md transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteTask(task._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectWorkspaceDrawer({ projectId, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: projectQuery, refetch: refetchProject } = useQuery({
    queryKey: ['admin-project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await axios.get(`${API_URL}/projects/${projectId}`, { withCredentials: true });
      return res.data;
    },
    enabled: !!projectId
  });

  const project = projectQuery?.data;

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const socket = io(API_URL.replace('/api', ''), {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.emit('joinProjectRoom', projectId);

    socket.on('projectUpdated', () => {
      refetchProject();
    });

    return () => socket.disconnect();
  }, [isOpen, projectId, refetchProject]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#2d2a26]/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-4xl bg-[#fcfbf9] h-full shadow-2xl border-l border-[#e5e0d8] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#e5e0d8] bg-white flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {project?.status || 'Loading...'}
                </span>
                <span className="text-xs font-medium text-[#8b8175] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {project ? new Date(project.startDate).toLocaleDateString() : ''}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold font-nav-style text-[#2d2a26]">{project?.title || 'Loading Workspace...'}</h2>
              <p className="text-[#8b8175] text-sm mt-1">Client: {project?.client?.fullName || 'N/A'}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white border border-[#e5e0d8] hover:bg-[#fcfbf9] rounded-xl text-[#8b8175] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-[#e5e0d8] bg-white flex items-center gap-6 overflow-x-auto">
            {['overview', 'timeline', 'tasks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-semibold capitalize transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[#2d2a26] text-[#2d2a26]'
                    : 'border-transparent text-[#8b8175] hover:text-[#2d2a26]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#fcfbf9]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* execution progress bar */}
                <div className="bg-white p-6 rounded-2xl border border-[#e5e0d8] shadow-sm">
                  <h3 className="text-sm font-semibold text-[#8b8175] uppercase tracking-wider mb-4">Execution Progress</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-full bg-[#e5e0d8] rounded-full h-3">
                      <div className="bg-[#2d2a26] h-3 rounded-full transition-all duration-1000" style={{ width: `${project?.progress || 0}%` }}></div>
                    </div>
                    <span className="text-xl font-bold font-nav-style text-[#2d2a26]">{project?.progress || 0}%</span>
                  </div>
                </div>

                {/* More premium overview widgets would go here */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#e5e0d8] shadow-sm">
                     <h3 className="text-sm font-semibold text-[#8b8175] uppercase tracking-wider mb-2">Budget Allocation</h3>
                     <p className="text-2xl font-bold text-[#2d2a26]">₹{(project?.budget || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#e5e0d8] shadow-sm">
                     <h3 className="text-sm font-semibold text-[#8b8175] uppercase tracking-wider mb-2">Payment Status</h3>
                     <p className="text-2xl font-bold text-[#2d2a26]">{project?.paymentStatus || 'Unpaid'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'timeline' && (
              <ProjectTimeline projectId={projectId} />
            )}

            {activeTab === 'tasks' && (
              <TaskBoard projectId={projectId} />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
