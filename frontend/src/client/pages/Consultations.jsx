import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Video, User, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

// Generates next 14 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const TIME_SLOTS = ["10:00 AM - 11:00 AM", "11:30 AM - 12:30 PM", "02:00 PM - 03:00 PM", "04:00 PM - 05:00 PM"];
const CONSULTATION_TYPES = ['Video Consultation', 'Home Visit', 'Office Meeting', 'Design Discussion', 'Budget Consultation'];

export default function Consultations() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ designerId: '', type: 'Video Consultation', date: '', timeSlot: '', requirements: { roomType: '', budget: '', notes: '' } });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: designers = [] } = useQuery({
    queryKey: ['available-designers'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/appointments/designers`, { withCredentials: true, transports: ['websocket', 'polling'] });
      return res.data.data;
    }
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/appointments`, { withCredentials: true, transports: ['websocket', 'polling'] });
      return res.data.data;
    }
  });

  const handleBook = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/appointments`, formData, { withCredentials: true, transports: ['websocket', 'polling'] });
      queryClient.invalidateQueries(['my-appointments']);
      setStep(4); // Success step
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book consultation. Slot might be taken.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-nav-style font-extrabold text-[#2d2a26]">Consultations</h1>
        <p className="text-[#8b8175] mt-2">Book a one-on-one session with our lead designers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Wizard */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-[#e5e0d8] shadow-sm">
            <CardContent className="p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#2d2a26] mb-4">Step 1: Choose Designer & Type</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {designers.map(designer => (
                      <div 
                        key={designer._id}
                        onClick={() => setFormData({...formData, designerId: designer._id})}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.designerId === designer._id ? 'border-[#2d2a26] bg-[#fcfbf9]' : 'border-[#e5e0d8] hover:border-[#8b8175]'}`}
                      >
                        <User className="w-8 h-8 text-[#8b8175] mb-2" />
                        <h4 className="font-bold text-[#2d2a26]">{designer.fullName}</h4>
                        <p className="text-xs text-[#8b8175]">Lead Designer</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Consultation Type</label>
                    <select 
                      className="w-full border border-[#e5e0d8] rounded-lg p-3 text-[#2d2a26]"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      {CONSULTATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <button 
                    disabled={!formData.designerId}
                    onClick={() => setStep(2)}
                    className="w-full mt-6 bg-[#2d2a26] text-white py-3 rounded-xl font-bold hover:bg-[#1a1816] disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    Next: Pick a Time <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#2d2a26] mb-4 flex items-center gap-2">
                    <button onClick={() => setStep(1)} className="text-[#8b8175] hover:text-[#2d2a26]">← Back</button> 
                    Step 2: Schedule
                  </h3>
                  
                  <div>
                    <label className="text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-3 block">Select Date</label>
                    <div className="flex gap-3 overflow-x-auto pb-4">
                      {generateDates().map(date => {
                        const d = new Date(date);
                        return (
                          <div 
                            key={date}
                            onClick={() => setFormData({...formData, date, timeSlot: ''})}
                            className={`min-w-[80px] p-3 rounded-xl border text-center cursor-pointer transition-all ${formData.date === date ? 'bg-[#2d2a26] text-white border-[#2d2a26]' : 'bg-white border-[#e5e0d8] text-[#2d2a26] hover:border-[#8b8175]'}`}
                          >
                            <div className="text-xs opacity-80">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div className="text-xl font-bold">{d.getDate()}</div>
                            <div className="text-xs opacity-80">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {formData.date && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <label className="text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-3 block">Select Time Slot</label>
                      <div className="grid grid-cols-2 gap-3">
                        {TIME_SLOTS.map(slot => (
                          <div 
                            key={slot}
                            onClick={() => setFormData({...formData, timeSlot: slot})}
                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${formData.timeSlot === slot ? 'border-[#656d4a] bg-[#656d4a]/10 text-[#656d4a] font-bold' : 'border-[#e5e0d8] text-[#8b8175] hover:border-[#656d4a]'}`}
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    disabled={!formData.date || !formData.timeSlot}
                    onClick={() => setStep(3)}
                    className="w-full mt-6 bg-[#2d2a26] text-white py-3 rounded-xl font-bold hover:bg-[#1a1816] disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    Next: Requirements <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#2d2a26] mb-4 flex items-center gap-2">
                    <button onClick={() => setStep(2)} className="text-[#8b8175] hover:text-[#2d2a26]">← Back</button> 
                    Step 3: Requirements
                  </h3>
                  
                  <div className="space-y-4">
                    <input type="text" placeholder="Room Type (e.g. Master Bedroom)" className="w-full border border-[#e5e0d8] rounded-lg p-3" onChange={e => setFormData({...formData, requirements: {...formData.requirements, roomType: e.target.value}})} />
                    <input type="text" placeholder="Estimated Budget" className="w-full border border-[#e5e0d8] rounded-lg p-3" onChange={e => setFormData({...formData, requirements: {...formData.requirements, budget: e.target.value}})} />
                    <textarea placeholder="Tell us about your vision..." rows={4} className="w-full border border-[#e5e0d8] rounded-lg p-3 resize-none" onChange={e => setFormData({...formData, requirements: {...formData.requirements, notes: e.target.value}})} />
                  </div>

                  <button 
                    onClick={handleBook}
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#656d4a] text-white py-3 rounded-xl font-bold hover:bg-[#5a6142] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2d2a26]">Request Submitted!</h3>
                  <p className="text-[#8b8175] max-w-md mx-auto">Your consultation request has been sent to the designer. We will notify you once it is approved.</p>
                  <button onClick={() => { setStep(1); setFormData({ designerId: '', type: 'Video Consultation', date: '', timeSlot: '', requirements: { roomType: '', budget: '', notes: '' } }); }} className="mt-8 text-[#656d4a] font-bold hover:underline">
                    Book another session
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Appointments Sidebar */}
        <div>
          <h3 className="text-xl font-bold text-[#2d2a26] mb-4">My Schedule</h3>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#e5e0d8] rounded-xl text-[#8b8175]">No upcoming consultations.</div>
            ) : (
              appointments.map(appt => (
                <Card key={appt._id} className="bg-white border-[#e5e0d8] shadow-sm relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${appt.status === 'Confirmed' ? 'bg-green-500' : appt.status === 'Cancelled' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                  <CardContent className="p-5 pl-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${appt.status === 'Confirmed' ? 'bg-green-50 text-green-700' : appt.status === 'Cancelled' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                        {appt.status}
                      </span>
                      {appt.type === 'Video Consultation' && <Video className="w-4 h-4 text-blue-500" />}
                    </div>
                    <h4 className="font-bold text-[#2d2a26] mb-1">With {appt.designer.fullName}</h4>
                    <p className="text-sm text-[#8b8175] flex items-center gap-2 mb-1"><Calendar className="w-3 h-3" /> {new Date(appt.date).toLocaleDateString()}</p>
                    <p className="text-sm text-[#8b8175] flex items-center gap-2"><Clock className="w-3 h-3" /> {appt.timeSlot}</p>
                    
                    {appt.meetingLink && appt.status === 'Confirmed' && (
                      <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="mt-4 block w-full text-center bg-blue-50 text-blue-600 font-bold py-2 rounded-lg text-xs hover:bg-blue-100 transition-colors">
                        Join Meeting
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
