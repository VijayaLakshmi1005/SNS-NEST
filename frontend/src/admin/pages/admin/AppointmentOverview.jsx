import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Calendar as CalendarIcon, Clock, Video, User, Check, X, RefreshCw, AlertCircle, BarChart3, Users, CalendarCheck, CalendarX, Zap, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const parseTimeSlot = (dateString, timeSlot) => {
  try {
    const [startStr, endStr] = timeSlot.split(' - ');
    const start = moment(`${dateString} ${startStr}`, 'YYYY-MM-DD hh:mm A').toDate();
    const end = moment(`${dateString} ${endStr}`, 'YYYY-MM-DD hh:mm A').toDate();
    return { start, end };
  } catch (err) {
    return { start: new Date(), end: new Date() };
  }
};

const formatTimeSlot = (start, end) => {
  return `${moment(start).format('hh:mm A')} - ${moment(end).format('hh:mm A')}`;
};

export default function AppointmentOverview() {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  useEffect(() => {
    const socket = io(API_URL.replace('/api', ''), { withCredentials: true, transports: ['websocket', 'polling'] });
    
    socket.on('appointmentCreated', (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      setActivityFeed(prev => [{ id: Date.now(), msg: `New booking by ${data.client?.fullName}`, time: new Date() }, ...prev].slice(0, 10));
    });
    
    socket.on('appointmentUpdated', (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      setActivityFeed(prev => [{ id: Date.now(), msg: `Status updated to ${data.status}`, time: new Date() }, ...prev].slice(0, 10));
      if (selectedEvent?.id === data._id) {
        setSelectedEvent(prev => ({ ...prev, resource: data, start: parseTimeSlot(data.date, data.timeSlot).start, end: parseTimeSlot(data.date, data.timeSlot).end }));
      }
    });

    return () => socket.disconnect();
  }, [queryClient, selectedEvent]);

  const { data: appointments = [], isLoading, refetch: refetchAppts } = useQuery({
    queryKey: ['all-appointments'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/appointments`, { withCredentials: true, transports: ['websocket', 'polling'] });
      return res.data.data;
    }
  });

  const { data: upcomingAppts = [], refetch: refetchUpcoming } = useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/appointments/upcoming`, { withCredentials: true, transports: ['websocket', 'polling'] });
      return res.data.data;
    }
  });

  const { data: analytics = {}, refetch: refetchAnalytics } = useQuery({
    queryKey: ['appointment-analytics'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/appointments/analytics`, { withCredentials: true, transports: ['websocket', 'polling'] });
      return res.data.data;
    }
  });

  const events = appointments.map(appt => {
    const { start, end } = parseTimeSlot(appt.date, appt.timeSlot);
    return {
      id: appt._id,
      title: `${appt.client?.fullName || 'Client'} - ${appt.type}`,
      start,
      end,
      resource: appt,
    };
  });

  const handleUpdateStatus = async (id, status, meetingLink = '') => {
    try {
      await axios.patch(`${API_URL}/appointments/${id}/status`, { status, meetingLink }, { withCredentials: true, transports: ['websocket', 'polling'] });
    } catch (err) {
      showToast('Failed to update status.');
    }
  };

  const onEventDrop = useCallback(async ({ event, start, end }) => {
    const dateStr = moment(start).format('YYYY-MM-DD');
    const timeSlotStr = formatTimeSlot(start, end);
    try {
      await axios.patch(`${API_URL}/appointments/${event.id}/reschedule`, { date: dateStr, timeSlot: timeSlotStr }, { withCredentials: true, transports: ['websocket', 'polling'] });
      showToast('Appointment rescheduled successfully.');
    } catch(err) {
      showToast(err.response?.data?.message || 'Reschedule failed due to conflict.');
    }
  }, []);

  const eventStyleGetter = (event) => {
    let backgroundColor = '#fcfbf9';
    let borderColor = '#e5e0d8';
    let color = '#2d2a26';
    let background = '';

    const status = event.resource.status;
    if (status === 'Confirmed') {
      background = '#e5e0d8';
      borderColor = '#d4cfc5';
      color = '#2d2a26';
    } else if (status === 'Pending Approval') {
      background = '#f5f2eb';
      borderColor = '#e5e0d8';
      color = '#8b8175';
    } else if (status === 'Cancelled' || status === 'No Show') {
      background = '#fafafa';
      borderColor = '#f5f2eb';
      color = '#a8a29e';
    } else if (status === 'Completed') {
      background = '#d4cfc5';
      borderColor = '#b4aca0';
      color = '#2d2a26';
    } else if (status === 'Rescheduled') {
      background = '#fcfbf9';
      borderColor = '#8b8175';
      color = '#2d2a26';
    }

    return {
      style: {
        background: background || backgroundColor,
        borderColor, borderWidth: '1px', borderStyle: 'solid',
        color, borderRadius: '8px', opacity: 0.95, display: 'block',
        fontWeight: '700', fontSize: '0.75rem', padding: '6px 10px',
      }
    };
  };

  const miniEventStyleGetter = () => {
    return {
      style: {
        backgroundColor: '#d97706',
        borderRadius: '50%',
        width: '6px',
        height: '6px',
        color: 'transparent',
        border: 'none',
        display: 'inline-block',
        margin: '1px'
      }
    };
  };

  return (
    <div className="space-y-6 pb-12 overflow-x-hidden relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 bg-black/90 backdrop-blur-xl text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm border border-white/10"
          >
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-ring relative z-10" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fcfbf9]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#e5e0d8] shadow-sm sticky top-0 z-40">
        <div>
          <h1 className="text-3xl font-nav-style font-extrabold text-[#2d2a26]">Command Center</h1>
          <p className="text-[#8b8175] mt-1 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Realtime Appointment Engine Live
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => {
              showToast('Syncing latest real-time data across all nodes...');
              refetchAppts();
              refetchAnalytics();
              refetchUpcoming();
            }}
            className="flex items-center gap-2 bg-[#2d2a26] text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-[#1a1816] transition-colors shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Engine
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left/Center Column: Main Calendar & Next Up */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Main Calendar View */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="h-[700px] glass-panel rounded-[2rem] shadow-sm p-6 overflow-hidden flex flex-col luxury-card-hover">
            <div className="flex-1 luxury-calendar">
              <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onEventDrop={onEventDrop}
                onEventResize={({ event, start, end }) => onEventDrop({ event, start, end })}
                resizable
                selectable
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                onSelectEvent={event => setSelectedEvent(event)}
                eventPropGetter={eventStyleGetter}
                defaultView="week"
                views={['month', 'week', 'day']}
                step={60}
                timeslots={1}
                min={new Date(2000, 0, 1, 8, 0, 0)} 
                max={new Date(2000, 0, 1, 20, 0, 0)}
                popup
              />
            </div>
          </motion.div>

          {/* Coming Up Next Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <h3 className="font-extrabold text-xl text-[#2d2a26] flex items-center gap-2">
              Coming Up Next <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingAppts.slice(0, 3).map((appt, idx) => (
                <div key={appt._id} className="glass-panel p-5 rounded-3xl luxury-card-hover flex flex-col justify-between h-[180px]">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                        appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                        appt.status === 'Rescheduled' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {appt.status}
                      </span>
                      <span className="text-xs font-bold text-[#8b8175] bg-[#fcfbf9] px-2 py-1 rounded-lg border border-[#e5e0d8]">
                        T- {idx === 0 ? '45m' : (idx + 2) + 'h'}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#2d2a26] text-lg leading-tight truncate">{appt.client?.fullName}</h4>
                    <p className="text-[#8b8175] text-xs mt-1 font-medium">{appt.type}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-[#2d2a26] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {appt.timeSlot.split(' - ')[0]}</p>
                    {appt.meetingLink ? (
                      <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors shadow-sm"><Video className="w-4 h-4"/></a>
                    ) : (
                      <button onClick={() => showToast('Meeting link pending approval')} className="bg-[#fcfbf9] border border-[#e5e0d8] text-[#8b8175] p-2 rounded-xl"><CalendarIcon className="w-4 h-4"/></button>
                    )}
                  </div>
                </div>
              ))}
              {upcomingAppts.length === 0 && (
                <div className="col-span-3 glass-panel p-8 rounded-3xl flex items-center justify-center text-[#8b8175] font-medium border-dashed border-2 border-[#e5e0d8]">
                  No upcoming meetings in the queue.
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Mini Calendar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-5 rounded-[2rem] shadow-sm luxury-calendar">
            <h4 className="font-bold text-[#2d2a26] mb-4 text-sm uppercase tracking-wider">Mini Map</h4>
            <div className="h-[300px]">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={['month']}
                defaultView="month"
                toolbar={false}
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                eventPropGetter={miniEventStyleGetter}
              />
            </div>
          </motion.div>

          {/* Today Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-[2rem] shadow-sm">
            <h4 className="font-bold text-[#2d2a26] mb-5 text-sm uppercase tracking-wider">Today's Pulse</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#fcfbf9] p-3 rounded-2xl border border-[#e5e0d8]">
                <div className="flex items-center gap-3"><CalendarCheck className="w-5 h-5 text-blue-600" /><span className="text-sm font-bold text-[#8b8175]">Total Load</span></div>
                <span className="text-xl font-extrabold text-[#2d2a26]">{analytics.todayAppointments || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-[#fcfbf9] p-3 rounded-2xl border border-[#e5e0d8]">
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-amber-500" /><span className="text-sm font-bold text-[#8b8175]">Pending</span></div>
                <span className="text-xl font-extrabold text-[#2d2a26]">{analytics.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-[#fcfbf9] p-3 rounded-2xl border border-[#e5e0d8]">
                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-green-600" /><span className="text-sm font-bold text-[#8b8175]">Completed</span></div>
                <span className="text-xl font-extrabold text-[#2d2a26]">{analytics.completed || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Event Details Context (Replaces empty state logic) */}
          <AnimatePresence mode="wait">
            {selectedEvent && (
              <motion.div 
                key="event-details"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#2d2a26] rounded-[2rem] shadow-xl overflow-hidden shrink-0 text-white relative luxury-card-hover"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-green-400 to-blue-400"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-3 py-1.5 rounded-full bg-white/10">
                      {selectedEvent.resource.status}
                    </span>
                    <button onClick={() => setSelectedEvent(null)} className="text-white/50 hover:text-white transition-colors p-1 bg-white/5 rounded-full"><X className="w-4 h-4"/></button>
                  </div>
                  <h3 className="text-xl font-bold mt-5">{selectedEvent.resource.type}</h3>
                  <p className="text-white/70 text-sm flex items-center gap-2 mt-2 font-medium">
                    <Clock className="w-4 h-4 text-white/50" /> {selectedEvent.resource.timeSlot}
                  </p>
                  <p className="text-white/70 text-sm flex items-center gap-2 mt-1 font-medium">
                    <CalendarIcon className="w-4 h-4 text-white/50" /> {moment(selectedEvent.start).format('MMMM Do YYYY')}
                  </p>
                </div>

                <div className="p-6 bg-white/5 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><User className="w-5 h-5"/></div>
                    <div>
                      <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Client</h4>
                      <p className="text-white font-bold text-sm">{selectedEvent.resource.client?.fullName}</p>
                    </div>
                  </div>
                  
                  {selectedEvent.resource.requirements && (
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Requirements</h4>
                      {selectedEvent.resource.requirements.roomType && <p className="text-xs text-white/90 mb-1">Room: {selectedEvent.resource.requirements.roomType}</p>}
                      {selectedEvent.resource.requirements.notes && <p className="text-xs text-white/70 mt-2 italic border-l-2 border-white/20 pl-2 py-1">"{selectedEvent.resource.requirements.notes}"</p>}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    {selectedEvent.resource.status === 'Pending Approval' && (
                      <>
                        <button 
                          onClick={() => {
                            const link = prompt("Enter video link (Meet/Zoom):");
                            if (link) handleUpdateStatus(selectedEvent.id, 'Confirmed', link);
                          }}
                          className="w-full bg-white text-[#2d2a26] py-3 rounded-xl text-sm font-bold hover:bg-[#fcfbf9] transition-all flex justify-center items-center gap-2 shadow-sm"
                        >
                          <Check className="w-4 h-4" /> Approve & Link
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(selectedEvent.id, 'Cancelled')}
                          className="w-full bg-white/10 text-red-400 py-3 rounded-xl text-sm font-bold hover:bg-white/20 transition-all shadow-sm"
                        >
                          Decline Request
                        </button>
                      </>
                    )}
                    {selectedEvent.resource.status === 'Confirmed' && selectedEvent.resource.meetingLink && (
                      <a 
                        href={selectedEvent.resource.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-blue-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all flex justify-center items-center gap-2 shadow-sm"
                      >
                        <Video className="w-4 h-4" /> Join Video Meeting
                      </a>
                    )}
                    {selectedEvent.resource.status === 'Confirmed' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedEvent.id, 'Completed')}
                        className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl text-sm font-bold hover:bg-white/20 transition-all shadow-sm mt-2"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
