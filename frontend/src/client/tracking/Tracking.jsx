import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import api from '../utils/api.js';
import { io } from 'socket.io-client';
import {
  CheckCircle2,
  CircleDashed,
  Hammer,
  Package,
  PenTool,
  Truck,
  Home,
  Calendar,
  MapPin,
  User,
  FileText,
  Phone,
  MessageSquare,
  AlertTriangle,
  Download,
  Plus,
  Eye,
  Loader2,
  ArrowRight,
  TrendingUp,
  Maximize2,
  X
} from 'lucide-react';

const THEME = {
  light: {
    card: 'bg-[#E3D5CA]/50 border-[#D6CCC2]/40',
    cardInner: 'bg-[#F5EBE0]/80 border-[#D6CCC2]/20',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    accent: 'bg-[#C9B7A7]/50 text-[#2B2B2B]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    input: 'bg-white border-[#D6CCC2] text-[#2B2B2B]',
    goldText: 'text-[#8C7A6B]',
    badgeCompleted: 'bg-[#D6CCC2] text-[#2B2B2B] border-[#D6CCC2]/60',
    badgeCurrent: 'bg-[#1E1A17] text-[#F5EBE0]',
    badgePending: 'bg-black/5 text-[#4A4340] border-black/10'
  },
  dark: {
    card: 'bg-[#2A241F]/60 border-[#3A312B]',
    cardInner: 'bg-[#1E1A17]/80 border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    accent: 'bg-[#3A312B] text-[#F5EBE0]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
    input: 'bg-[#1E1A17] border-[#3A312B] text-[#F5EBE0]',
    goldText: 'text-[#C9B7A7]',
    badgeCompleted: 'bg-[#3A312B] text-[#F5EBE0] border-[#3A312B]/80',
    badgeCurrent: 'bg-[#F5EBE0] text-[#1E1A17]',
    badgePending: 'bg-white/5 text-[#E3D5CA]/70 border-white/5'
  }
};

const MILESTONE_ICONS = {
  'Consultation Completed': PenTool,
  'Design Approved': CheckCircle2,
  'Material Procurement': Package,
  'Site Preparation': Hammer,
  'Execution Started': Hammer,
  'Furniture Installation': Home,
  'False Ceiling Installation': CircleDashed,
  'Final Styling': PenTool,
  'Final Delivery': Home
};

export default function Tracking() {
  const { isNight } = useThemeStore();
  const theme = isNight ? THEME.dark : THEME.light;

  // Real-time State from Backend APIs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [roomProgress, setRoomProgress] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activities, setActivities] = useState([]);
  const [siteUpdates, setSiteUpdates] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [team, setTeam] = useState({});
  const [documents, setDocuments] = useState([]);

  // UI Interactive States
  const [activeGalleryTab, setActiveGalleryTab] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [activityInput, setActivityInput] = useState('');
  const [sitePhotoInput, setSitePhotoInput] = useState('');
  const [siteCaptionInput, setSiteCaptionInput] = useState('');
  const [submittingPhoto, setSubmittingPhoto] = useState(false);
  const [submittingActivity, setSubmittingActivity] = useState(false);
  const [realtimeNotify, setRealtimeNotify] = useState(null);

  // References
  const socketRef = useRef(null);

  // 1. Fetch data on mount
  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tracking/current');
        const data = res.data.data;
        
        setProject(data.project);
        setOverallProgress(data.overallProgress);
        setRoomProgress(data.roomProgress);
        setMilestones(data.milestones);
        setActivities(data.activities);
        setSiteUpdates(data.siteUpdates);
        setProcurements(data.procurement);
        setTeam(data.team);
        setDocuments(data.documents);
        setError(null);
        
        // 2. Initialize Socket.io Connection
        let token = localStorage.getItem('token');
        if (!token) {
          const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
          token = authStorage?.state?.token;
        }
        
        if (token && data.project?._id) {
          const socketUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://sns-nest-backend.onrender.com');
          const socket = io(socketUrl, {
            auth: { token }
          });

          socketRef.current = socket;

          socket.on('connect', () => {
            console.log('Realtime socket client bound successfully to SNS tracking grid.');
            socket.emit('join:room', data.project._id);
          });

          // Live activity listener
          socket.on('activity:added', (newActivity) => {
            setActivities((prev) => [newActivity, ...prev]);
            showToastNotification('New project activity synchronized.');
          });

          // Live site progress photo listener
          socket.on('site-update:added', ({ siteUpdate, activity }) => {
            setSiteUpdates((prev) => [siteUpdate, ...prev]);
            setActivities((prev) => [activity, ...prev]);
            showToastNotification('New progress site execution photos uploaded!');
          });

          socket.on('connect_error', (err) => {
            console.warn('Socket client auth handshake deferred:', err.message);
          });
        }
      } catch (err) {
        console.error('Failed to load tracking command center:', err);
        setError(err.message || 'Unable to retrieve your luxury project timeline.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Unmounted socket connection.');
      }
    };
  }, []);

  const showToastNotification = (msg) => {
    setRealtimeNotify(msg);
    setTimeout(() => {
      setRealtimeNotify(null);
    }, 4500);
  };

  // Trigger site photos upload simulated hook
  const handleAddSitePhoto = async (e) => {
    e.preventDefault();
    if (!siteCaptionInput || !sitePhotoInput) return;
    try {
      setSubmittingPhoto(true);
      const res = await api.post(`/tracking/${project._id}/site-updates`, {
        caption: siteCaptionInput,
        images: [sitePhotoInput]
      });
      
      // Update local state (in case socket callback deferred or missed)
      const data = res.data.data;
      setSiteUpdates((prev) => [data.siteUpdate, ...prev]);
      setActivities((prev) => [data.activity, ...prev]);
      
      setSitePhotoInput('');
      setSiteCaptionInput('');
      showToastNotification('Execution photo uploaded successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPhoto(false);
    }
  };

  // Trigger activity feed add
  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activityInput) return;
    try {
      setSubmittingActivity(true);
      const res = await api.post(`/tracking/${project._id}/activities`, {
        type: 'milestone',
        message: activityInput
      });
      
      setActivities((prev) => [res.data.data, ...prev]);
      setActivityInput('');
      showToastNotification('Activity posted.');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingActivity(false);
    }
  };

  // Format Helper for Indian Date Currency
  const formatFriendlyDate = (dateString) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className={`w-10 h-10 animate-spin ${theme.goldText}`} />
        <span className={`text-xs uppercase tracking-widest font-bold ${theme.textMuted}`}>
          Configuring luxury command center...
        </span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle className="w-12 h-12 text-amber-600 mb-4" />
        <h3 className={`text-lg font-bold ${theme.text} mb-2`}>No Active Project Found</h3>
        <p className={`text-xs ${theme.textMuted} max-w-md`}>
          We couldn't retrieve any project metrics for your account. Please consult with your assigned interior architect.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-20 max-w-7xl mx-auto px-4 md:px-6 relative">
      
      {/* Toast Notification for real-time events */}
      <AnimatePresence>
        {realtimeNotify && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md transition-all ${
              isNight ? 'bg-[#1E1A17] border-[#3A312B] text-[#F5EBE0]' : 'bg-[#E3D5CA] border-[#D6CCC2]/70 text-[#2B2B2B]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-500 animate-bounce" />
            <div className="text-xs">
              <span className="font-bold uppercase tracking-wider block">Real-Time Update Received</span>
              <span className="opacity-90">{realtimeNotify}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Overview Banner Card */}
      <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md mb-8`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Title info */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${theme.accent}`}>
                {project.projectType}
              </span>
              <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-600/10 text-emerald-600 border border-emerald-500/20`}>
                Live Tracking Active
              </span>
            </div>

            <div>
              <h1 className={`text-3xl md:text-5xl font-extrabold tracking-tight ${theme.text} font-nav-style mb-1`}>
                {project.title}
              </h1>
              <p className={`text-xs md:text-sm ${theme.textMuted} flex items-center gap-1.5`}>
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {project.location} • Established {formatFriendlyDate(project.startDate)}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
              <div>
                <span className={`text-[9px] uppercase tracking-widest font-bold ${theme.textMuted} block`}>
                  Assigned Architect
                </span>
                <span className={`text-xs font-bold ${theme.text}`}>
                  {team?.designer?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className={`text-[9px] uppercase tracking-widest font-bold ${theme.textMuted} block`}>
                  Project Manager
                </span>
                <span className={`text-xs font-bold ${theme.text}`}>
                  {team?.projectManager?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className={`text-[9px] uppercase tracking-widest font-bold ${theme.textMuted} block`}>
                  Target Delivery
                </span>
                <span className={`text-xs font-bold ${theme.text}`}>
                  {formatFriendlyDate(project.estimatedCompletion)}
                </span>
              </div>
              <div>
                <span className={`text-[9px] uppercase tracking-widest font-bold ${theme.textMuted} block`}>
                  Current Status
                </span>
                <span className={`text-xs font-extrabold ${theme.goldText} uppercase tracking-wider`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          {/* Radial progress ring display */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 border-l border-black/5 dark:border-white/5">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer circular progress SVG */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke={isNight ? '#3A312B' : '#D6CCC2'}
                  strokeWidth="8"
                  fill="transparent"
                  className="opacity-40"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke={isNight ? '#F5EBE0' : '#1E1A17'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  initial={{ strokeDashoffset: 2 * Math.PI * 62 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 62 * (1 - overallProgress / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-black ${theme.text} font-mono`}>
                  {overallProgress}%
                </span>
                <span className={`text-[8px] uppercase tracking-widest font-bold ${theme.textMuted}`}>
                  Overall Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: milestones and room tracking */}
        <div className="lg:col-span-7 space-y-8 col-span-1 min-w-0">
          
          {/* Milestone timeline */}
          <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${theme.text}`} />
                <h3 className={`text-lg font-bold uppercase tracking-wider ${theme.text}`}>Execution Timeline</h3>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${theme.textMuted}`}>
                Dynamic Forecast
              </span>
            </div>

            {/* Timelines container */}
            <div className="relative pl-6 border-l border-black/10 dark:border-white/10 space-y-8 py-2">
              {milestones.map((item, index) => {
                const Icon = MILESTONE_ICONS[item.title] || CircleDashed;
                const isCompleted = item.status === 'completed';
                const isCurrent = item.status === 'current';
                const isDelayed = item.delayed;

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={item._id}
                    className="relative group"
                  >
                    {/* Ring dot handle */}
                    <div className={`absolute left-[-35px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : isCurrent 
                        ? 'bg-amber-600 border-amber-600 text-white animate-pulse'
                        : `bg-transparent ${isNight ? 'border-[#3A312B]' : 'border-[#D6CCC2]'} group-hover:scale-110`
                    }`}>
                      {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${
                      isCurrent 
                        ? 'bg-[#1E1A17] border-[#3A312B] text-stone-200 shadow-xl' 
                        : `${theme.cardInner} border-transparent`
                    }`}>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-sm leading-tight">{item.title}</h4>
                        
                        {/* Status label */}
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${
                          isCompleted 
                            ? theme.badgeCompleted 
                            : isCurrent 
                            ? theme.badgeCurrent 
                            : theme.badgePending
                        }`}>
                          {isCompleted ? 'Completed' : isCurrent ? 'Active Execution' : 'Upcoming'}
                        </span>
                      </div>

                      <p className={`text-xs mb-3 leading-relaxed ${isCurrent ? 'text-stone-300' : theme.textMuted}`}>
                        {item.notes}
                      </p>

                      {/* Display targeted dates */}
                      <div className="flex flex-wrap items-center gap-4 text-[10px]">
                        <span className={isCurrent ? 'text-stone-400' : theme.textMuted}>
                          Scheduled: {formatFriendlyDate(item.originalDate)}
                        </span>
                        
                        {isDelayed && (
                          <div className="flex items-center gap-1 text-amber-500 font-bold uppercase tracking-wide">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Revised: {formatFriendlyDate(item.revisedDate)}
                          </div>
                        )}
                      </div>

                      {/* Display warning banner if delayed */}
                      {isDelayed && (
                        <div className={`mt-3 p-3 rounded-lg border text-xs flex gap-2 items-start ${
                          isCurrent 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                            : 'bg-amber-600/5 border-amber-500/10 text-amber-600'
                        }`}>
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                          <div>
                            <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">Timeline Advisory Delays</span>
                            <span>{item.delayReason}</span>
                          </div>
                        </div>
                      )}

                      {/* Dynamic nested progress ring for active items */}
                      {isCurrent && (
                        <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                          <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                            <span>Stage Progression</span>
                            <span>75%</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-[#E3D5CA] rounded-full" />
                          </div>
                        </div>
                      )}

                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

          {/* Room-wise breakdown */}
          <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className={`w-5 h-5 ${theme.text}`} />
              <h3 className={`text-lg font-bold uppercase tracking-wider ${theme.text}`}>Room Progression</h3>
            </div>

            <div className="space-y-4">
              {roomProgress.map((room) => (
                <div key={room.name} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className={`text-xs font-bold ${theme.text}`}>{room.name}</span>
                    <span className={`text-xs font-mono font-bold ${theme.goldText}`}>{room.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${room.progress}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full ${
                        room.progress === 100 
                          ? 'bg-emerald-600' 
                          : isNight 
                          ? 'bg-[#F5EBE0]' 
                          : 'bg-[#1E1A17]'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents locker */}
          <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <div className="flex items-center gap-2 mb-6">
              <FileText className={`w-5 h-5 ${theme.text}`} />
              <h3 className={`text-lg font-bold uppercase tracking-wider ${theme.text}`}>Shared Agreements & Plans</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${theme.cardInner} flex items-center justify-between gap-3`}>
                  <div className="min-w-0">
                    <span className={`text-[8px] uppercase tracking-widest font-extrabold block text-amber-700 dark:text-amber-500 mb-0.5`}>
                      {doc.category}
                    </span>
                    <h5 className={`text-xs font-bold truncate ${theme.text}`}>{doc.name}</h5>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-2 rounded-xl border ${theme.accent} hover:scale-[1.05] transition-all`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: site photos, activity feeds, logistics */}
        <div className="lg:col-span-5 space-y-8 col-span-1 min-w-0">
          
          {/* Site photos progression gallery */}
          <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold uppercase tracking-wider ${theme.text}`}>Site Photo Updates</h3>
              <span className={`text-[10px] font-bold ${theme.textMuted}`}>{siteUpdates.length} snap updates</span>
            </div>

            {/* Simulated uploader UI for Admin/Designers */}
            <form onSubmit={handleAddSitePhoto} className="mb-6 p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-3">
              <span className="text-[9px] uppercase tracking-widest font-bold block mb-1">Developer Execution Snap Uploader</span>
              <input
                type="text"
                placeholder="Unsplash / Cloudinary image URL..."
                value={sitePhotoInput}
                onChange={(e) => setSitePhotoInput(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border outline-none ${theme.input}`}
              />
              <input
                type="text"
                placeholder="Caption describing site work..."
                value={siteCaptionInput}
                onChange={(e) => setSiteCaptionInput(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border outline-none ${theme.input}`}
              />
              <button
                type="submit"
                disabled={submittingPhoto}
                className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'
                }`}
              >
                {submittingPhoto ? <Loader2 className="w-3 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add Execution Snap
              </button>
            </form>

            <div className="grid grid-cols-2 gap-3">
              {siteUpdates.map((update, i) => (
                <div
                  key={update._id || i}
                  onClick={() => setSelectedImage(update)}
                  className="aspect-square rounded-2xl overflow-hidden group relative cursor-pointer border border-black/5 dark:border-white/5"
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors z-10" />
                  <img
                    src={update.images[0]}
                    alt={update.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                  />
                  <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[8px] text-white font-bold uppercase tracking-wider">
                      {formatFriendlyDate(update.createdAt).split(',')[0]}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded p-1.5">
                    <Maximize2 className="w-3 h-3 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Material Logistics Procurement */}
          <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <div className="flex items-center gap-2 mb-6">
              <Truck className={`w-5 h-5 ${theme.text}`} />
              <h3 className={`text-lg font-bold uppercase tracking-wider ${theme.text}`}>Procurement Tracker</h3>
            </div>

            <div className="space-y-4">
              {procurements.map((item) => {
                const isDelivered = item.status === 'delivered';
                const isShipped = item.status === 'shipped';
                const isOrdered = item.status === 'ordered';

                return (
                  <div key={item._id} className={`p-4 rounded-2xl border ${theme.cardInner} space-y-2`}>
                    <div className="flex justify-between items-start gap-2">
                      <h5 className={`text-xs font-bold leading-tight ${theme.text}`}>{item.name}</h5>
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${
                        isDelivered 
                          ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-500/20'
                          : isShipped
                          ? 'bg-blue-600/10 text-blue-600 border border-blue-500/20'
                          : 'bg-amber-600/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[10px] pt-1 border-t border-black/5 dark:border-white/5">
                      <span className={theme.textMuted}>
                        Target Delivery: {formatFriendlyDate(item.deliveryForecast)}
                      </span>
                    </div>

                    {item.delayReason && (
                      <div className="mt-1 flex items-start gap-1 text-[9px] text-amber-600 font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                        <span>Logistics warning: {item.delayReason}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Logs feed */}
          <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <div className="flex items-center gap-2 mb-6">
              <PenTool className={`w-5 h-5 ${theme.text}`} />
              <h3 className={`text-lg font-bold uppercase tracking-wider ${theme.text}`}>Command Activity Feed</h3>
            </div>

            {/* Posting feed uploader simulated */}
            <form onSubmit={handleAddActivity} className="mb-6 flex gap-2">
              <input
                type="text"
                placeholder="Log a new installation detail..."
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                className={`flex-1 text-xs p-2.5 rounded-xl border outline-none ${theme.input}`}
              />
              <button
                type="submit"
                disabled={submittingActivity}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center ${
                  isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'
                }`}
              >
                {submittingActivity ? <Loader2 className="w-3 animate-spin" /> : 'Log'}
              </button>
            </form>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {activities.map((item, idx) => (
                <div key={item._id || idx} className="flex gap-3 items-start text-xs border-b border-black/5 dark:border-white/5 pb-3 last:border-b-0 last:pb-0">
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] ${theme.accent}`}>
                    {item.createdByName ? item.createdByName[0] : 'S'}
                  </div>
                  <div>
                    <p className={`font-bold ${theme.text} mb-0.5`}>
                      {item.createdByName || 'System Designer'}
                    </p>
                    <p className={theme.textMuted}>{item.message}</p>
                    <span className="text-[8px] opacity-60 block mt-1">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Architect Contact actions */}
          <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#C9B7A7]/50">
                <img
                  src={team?.designer?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'}
                  alt={team?.designer?.name || 'Unassigned'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className={`text-sm font-black ${theme.text}`}>{team?.designer?.name || 'Unassigned'}</h4>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${theme.goldText}`}>
                  Lead Interior Architect
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${team?.designer?.mobile || '9876543210'}`}
                className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 text-center ${
                  isNight
                    ? 'bg-transparent border-[#3A312B] text-stone-300 hover:bg-stone-900'
                    : 'bg-transparent border-[#D6CCC2] text-[#2B2B2B] hover:bg-[#D6CCC2]/20'
                }`}
              >
                <Phone className="w-4 h-4" />
                Call Architect
              </a>
              <button
                className={`py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 text-center ${
                  isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Live Chat PM
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Image zoom lightbox Modal overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-5xl w-full max-h-[80vh] flex flex-col items-center justify-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.images[0]}
                alt={selectedImage.caption}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="text-center text-white max-w-2xl px-4">
                <p className="text-sm font-bold tracking-wide">{selectedImage.caption}</p>
                <span className="text-[10px] text-stone-400 mt-1 block uppercase tracking-wider">
                  Uploaded by {selectedImage.uploadedByName} on {formatFriendlyDate(selectedImage.createdAt)}
                </span>
                
                {/* Download trigger */}
                <a
                  href={selectedImage.images[0]}
                  download={`SNS_NEST_Progress_${selectedImage._id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 py-1.5 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Progress Snap
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
