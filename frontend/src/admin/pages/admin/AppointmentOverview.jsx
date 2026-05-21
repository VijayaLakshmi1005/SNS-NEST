import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Calendar as CalendarIcon, Clock, Video, User, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

// Helper to convert date + time slot string (e.g. "10:00 AM - 11:00 AM") to Date objects
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

  // Real-time socket connection
  useEffect(() => {
    const socket = io('http://localhost:5000', { withCredentials: true });
    socket.on('appointmentCreated', () => queryClient.invalidateQueries(['all-appointments']));
    socket.on('appointmentUpdated', () => queryClient.invalidateQueries(['all-appointments']));
    return () => socket.disconnect();
  }, [queryClient]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['all-appointments'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/appointments`, { withCredentials: true });
      return res.data.data;
    }
  });

  // Map backend appointments to Calendar format
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
      await axios.patch(`${API_URL}/appointments/${id}/status`, { status, meetingLink }, { withCredentials: true });
      queryClient.invalidateQueries(['all-appointments']);
      if (selectedEvent && selectedEvent.id === id) {
        setSelectedEvent(prev => ({ ...prev, resource: { ...prev.resource, status } }));
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  // Drag and drop reschedule
  const onEventDrop = useCallback(async ({ event, start, end }) => {
    const dateStr = moment(start).format('YYYY-MM-DD');
    const timeSlotStr = formatTimeSlot(start, end);

    // Call backend to reschedule (requires a new endpoint or using update endpoint if it supports date/time changes)
    try {
      // Assuming we have a reschedule endpoint or we just patch the date and timeSlot.
      // Wait, we need an endpoint for this or just pass date/time to PATCH /status. 
      // Let's assume we can hit a generic update or we'll create a dedicated one.
      // For safety, we will just alert that feature needs backend wiring if it crashes.
      alert(`Rescheduled to ${dateStr} at ${timeSlotStr}. (Backend endpoint wiring required for drag drop)`);
    } catch(err) {
      alert('Reschedule failed due to conflict.');
    }
  }, []);

  const onEventResize = useCallback(({ event, start, end }) => {
    const dateStr = moment(start).format('YYYY-MM-DD');
    const timeSlotStr = formatTimeSlot(start, end);
    alert(`Extended to ${dateStr} at ${timeSlotStr}. (Backend endpoint wiring required)`);
  }, []);

  // Custom event styles based on status
  const eventStyleGetter = (event) => {
    let backgroundColor = '#fcfbf9';
    let borderColor = '#e5e0d8';
    let color = '#2d2a26';

    const status = event.resource.status;
    if (status === 'Confirmed') {
      backgroundColor = '#f0fdf4'; // Muted green
      borderColor = '#bbf7d0';
      color = '#166534';
    } else if (status === 'Pending Approval') {
      backgroundColor = '#fffbeb'; // Warm amber
      borderColor = '#fde68a';
      color = '#92400e';
    } else if (status === 'Cancelled') {
      backgroundColor = '#fef2f2'; // Muted red
      borderColor = '#fecaca';
      color = '#991b1b';
    } else if (status === 'Completed') {
      backgroundColor = '#f3f4f6'; // Elegant gray
      borderColor = '#e5e7eb';
      color = '#374151';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        color,
        borderRadius: '8px',
        opacity: 0.9,
        display: 'block',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        padding: '2px 6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-nav-style font-extrabold text-[#2d2a26]">Command Center</h1>
          <p className="text-[#8b8175]">Luxury interactive scheduling ecosystem.</p>
        </div>
        {isLoading && <RefreshCw className="w-5 h-5 text-[#8b8175] animate-spin" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Calendar View */}
        <div className="lg:col-span-3 h-[75vh] bg-white rounded-2xl shadow-sm border border-[#e5e0d8] p-4 overflow-hidden">
          {/* We wrap the calendar in a div where we can inject custom CSS variables or target classes via standard CSS */}
          <div className="h-full luxury-calendar">
            <DnDCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onEventDrop={onEventDrop}
              onEventResize={onEventResize}
              resizable
              selectable
              onSelectEvent={event => setSelectedEvent(event)}
              eventPropGetter={eventStyleGetter}
              defaultView="week"
              views={['month', 'week', 'day', 'agenda']}
              step={30}
              timeslots={2}
              popup
            />
          </div>
        </div>

        {/* Side Panel: Event Details */}
        <div className="lg:col-span-1">
          {selectedEvent ? (
            <Card className="bg-white border-[#e5e0d8] shadow-lg animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="border-b border-[#e5e0d8] bg-[#fcfbf9] rounded-t-xl pb-4">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
                    selectedEvent.resource.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                    selectedEvent.resource.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedEvent.resource.status}
                  </span>
                  <button onClick={() => setSelectedEvent(null)} className="text-[#8b8175] hover:text-[#2d2a26]"><X className="w-4 h-4"/></button>
                </div>
                <CardTitle className="text-xl mt-3 text-[#2d2a26]">{selectedEvent.resource.type}</CardTitle>
                <p className="text-[#8b8175] text-sm flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3" /> {selectedEvent.resource.timeSlot}
                </p>
                <p className="text-[#8b8175] text-sm flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" /> {moment(selectedEvent.start).format('MMMM Do YYYY')}
                </p>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[#8b8175] uppercase tracking-wider mb-1">Client</h4>
                  <p className="flex items-center gap-2 text-[#2d2a26] font-medium"><User className="w-4 h-4 text-[#8b8175]" /> {selectedEvent.resource.client?.fullName}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-[#8b8175] uppercase tracking-wider mb-1">Assigned Designer</h4>
                  <p className="text-[#2d2a26]">{selectedEvent.resource.designer?.fullName}</p>
                </div>

                {selectedEvent.resource.requirements && (
                  <div className="bg-[#fcfbf9] p-3 rounded-lg border border-[#e5e0d8]">
                    <h4 className="text-xs font-bold text-[#8b8175] uppercase tracking-wider mb-2">Requirements</h4>
                    {selectedEvent.resource.requirements.roomType && <p className="text-sm text-[#2d2a26]"><span className="text-[#8b8175]">Room:</span> {selectedEvent.resource.requirements.roomType}</p>}
                    {selectedEvent.resource.requirements.budget && <p className="text-sm text-[#2d2a26]"><span className="text-[#8b8175]">Budget:</span> {selectedEvent.resource.requirements.budget}</p>}
                    {selectedEvent.resource.requirements.notes && <p className="text-sm text-[#2d2a26] mt-2 italic">"{selectedEvent.resource.requirements.notes}"</p>}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-[#e5e0d8] flex flex-col gap-2">
                  {selectedEvent.resource.status === 'Pending Approval' && (
                    <>
                      <button 
                        onClick={() => {
                          const link = prompt("Enter video link (Meet/Zoom):");
                          if (link) handleUpdateStatus(selectedEvent.id, 'Confirmed', link);
                        }}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex justify-center items-center gap-2 shadow-sm"
                      >
                        <Check className="w-4 h-4" /> Approve & Send Link
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedEvent.id, 'Cancelled')}
                        className="w-full bg-white border border-red-200 text-red-600 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors shadow-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {selectedEvent.resource.status === 'Confirmed' && selectedEvent.resource.meetingLink && (
                    <a 
                      href={selectedEvent.resource.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors flex justify-center items-center gap-2 shadow-sm"
                    >
                      <Video className="w-4 h-4" /> Join Video Meeting
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full bg-[#fcfbf9] border border-dashed border-[#d4cfc5] rounded-xl flex flex-col items-center justify-center p-6 text-center text-[#8b8175]">
              <AlertCircle className="w-8 h-8 mb-4 opacity-50" />
              <p className="font-medium">No appointment selected</p>
              <p className="text-sm mt-2">Click any appointment block on the calendar to view details, approve, or manage video links.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
