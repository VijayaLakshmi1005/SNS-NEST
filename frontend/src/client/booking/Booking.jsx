import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { apiRequest } from '../utils/api'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Video, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Star, 
  Award, 
  BookOpen, 
  ExternalLink, 
  MessageSquare,
  Bell,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react'

const THEME = {
  light: {
    card: 'bg-[#E3D5CA]/50 border-[#D6CCC2]/40',
    cardInner: 'bg-[#F5EBE0]/80 border-[#D6CCC2]/20',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    accent: 'bg-[#C9B7A7]/50 text-[#2B2B2B]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    activeCard: 'border-[#2B2B2B] bg-[#E3D5CA]',
  },
  dark: {
    card: 'bg-[#2A241F]/60 border-[#3A312B]',
    cardInner: 'bg-[#1E1A17]/80 border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    accent: 'bg-[#3A312B] text-[#F5EBE0]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
    activeCard: 'border-[#F5EBE0] bg-[#3A312B]',
  }
}

// Inline Custom Calendar Component
const CustomCalendar = ({ selectedDate, onChange, theme }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);
    onChange(clickedDate);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={`p-6 rounded-2xl border ${theme.cardInner}`}>
      <div className="flex justify-between items-center mb-6">
        <h4 className={`font-bold ${theme.text} text-sm`}>{monthNames[month]} {year}</h4>
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={prevMonth} 
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${theme.text}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            type="button" 
            onClick={nextMonth} 
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${theme.text}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className={`font-bold ${theme.textMuted} opacity-60`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(year, month, day);
          const isSelected = selectedDate && selectedDate.toDateString() === dateObj.toDateString();
          const isPast = dateObj < today;
          const isToday = today.toDateString() === dateObj.toDateString();

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => handleDateClick(day)}
              className={`p-2 w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs transition-all ${
                isSelected 
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md scale-105' 
                  : isPast 
                    ? 'opacity-20 cursor-not-allowed' 
                    : isToday 
                      ? 'border border-[#C9B7A7] font-bold' 
                      : `hover:bg-black/5 dark:hover:bg-white/5 ${theme.text}`
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function Booking() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light
  const navigate = useNavigate()

  // API State Variables
  const [designers, setDesigners] = useState([])
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [historyMeetings, setHistoryMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  // Booking Wizard States
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1) // 1: Type, 2: Slots, 3: Confirm, 4: Success
  const [selectedDesigner, setSelectedDesigner] = useState(null)
  const [consultationType, setConsultationType] = useState('Video Call')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [notes, setNotes] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Rescheduling state
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleMeetingId, setRescheduleMeetingId] = useState(null)

  // Detailed profile modal state
  const [selectedProfileDesigner, setSelectedProfileDesigner] = useState(null)

  // Fetch initial dashboard and designers list
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [designersRes, upcomingRes, historyRes] = await Promise.all([
        apiRequest('/designers'),
        apiRequest('/consultations/upcoming'),
        apiRequest('/consultations/history')
      ]);

      setDesigners(designersRes.data || [])
      setUpcomingMeetings(upcomingRes.data || [])
      setHistoryMeetings(historyRes.data || [])
    } catch (error) {
      console.error('Error fetching consultation module data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Fetch availability slots when date or designer changes in wizard
  useEffect(() => {
    if (showWizard && selectedDesigner && selectedDate) {
      const fetchSlots = async () => {
        try {
          setLoadingSlots(true)
          setSelectedSlot(null)
          const formattedDate = selectedDate.toISOString().split('T')[0]
          const res = await apiRequest(`/designers/${selectedDesigner._id}/availability?date=${formattedDate}`)
          setAvailableSlots(res.data.slots || [])
        } catch (error) {
          console.error('Error fetching designer availability:', error)
        } finally {
          setLoadingSlots(false)
        }
      }
      fetchSlots()
    }
  }, [selectedDate, selectedDesigner, showWizard])

  const handleOpenBooking = (designer) => {
    setSelectedDesigner(designer)
    setConsultationType('Video Call')
    setSelectedDate(new Date())
    setSelectedSlot(null)
    setNotes('')
    setIsRescheduling(false)
    setRescheduleMeetingId(null)
    setWizardStep(1)
    setShowWizard(true)
  }

  const handleOpenReschedule = (meeting) => {
    setSelectedDesigner(meeting.designer)
    setConsultationType(meeting.consultationType)
    setSelectedDate(new Date(meeting.date))
    setSelectedSlot(meeting.time)
    setNotes(meeting.notes || '')
    setIsRescheduling(true)
    setRescheduleMeetingId(meeting._id)
    setWizardStep(2) // Jump directly to Slot Selection
    setShowWizard(true)
  }

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return
    try {
      setBookingSubmitLoading(true)
      setErrorMsg('')

      if (isRescheduling) {
        // Reschedule Call
        await apiRequest('/consultations/reschedule', {
          method: 'PATCH',
          data: {
            consultationId: rescheduleMeetingId,
            date: selectedDate,
            time: selectedSlot
          }
        });
      } else {
        // New Booking Call
        await apiRequest('/consultations/book', {
          method: 'POST',
          data: {
            designerId: selectedDesigner._id,
            date: selectedDate,
            time: selectedSlot,
            consultationType,
            notes
          }
        });
      }

      setWizardStep(4) // Move to success page
      fetchDashboardData() // Refresh dashboard items
    } catch (error) {
      setErrorMsg(error.message || 'Slot reservation conflict. Please pick another time slot.')
    } finally {
      setBookingSubmitLoading(false)
    }
  }

  const getCountdownString = (meetingDate, meetingTime) => {
    const meetingDateTime = new Date(meetingDate);
    const [timeVal, modifier] = meetingTime.split(' ');
    let [hours, minutes] = timeVal.split(':');
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    meetingDateTime.setHours(hours, minutes, 0, 0);

    const diff = meetingDateTime - new Date();
    if (diff < 0) return 'Meeting in progress or finished';
    
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `Starts in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `Starts in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    
    const diffMins = Math.floor((diff / (1000 * 60)) % 60);
    return `Starts in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  }

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className={`w-10 h-10 animate-spin ${theme.text}`} />
        <p className={`text-sm tracking-widest uppercase ${theme.textMuted}`}>Opening Consultation Desk...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-10 lg:mb-14">
        <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${theme.text} mb-2 font-nav-style`}>
          Design Consultations
        </h1>
        <p className={`text-sm lg:text-base ${theme.textMuted} max-w-xl`}>
          Book and manage one-on-one sessions with our elite Scandinavian designers and interior architects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Upcoming meetings + Past history (Spans 7 columns) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Upcoming consultations */}
          <div className={`p-6 lg:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <h3 className={`text-lg font-bold ${theme.text} mb-6 flex items-center gap-2`}>
              <CalendarIcon className="w-5 h-5 opacity-70" /> Upcoming Consultations
            </h3>

            {upcomingMeetings.length === 0 ? (
              <div className={`p-10 rounded-2xl border ${theme.cardInner} text-center space-y-4`}>
                <Clock className={`w-10 h-10 mx-auto ${theme.textMuted} opacity-40`} />
                <div>
                  <h4 className={`font-bold ${theme.text}`}>No upcoming consultations</h4>
                  <p className={`text-xs ${theme.textMuted} mt-1`}>Browse our elite designers to book your first design session.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting._id} className={`p-5 rounded-2xl border ${theme.cardInner} flex flex-col sm:flex-row justify-between gap-4 transition-all duration-300 hover:scale-[1.01]`}>
                    <div className="flex gap-4 items-start">
                      <img 
                        src={meeting.designer?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'} 
                        alt={meeting.designer?.name} 
                        className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0" 
                      />
                      <div>
                        <h4 className={`font-bold ${theme.text}`}>{meeting.designer?.name}</h4>
                        <p className={`text-xs ${theme.textMuted} mb-2`}>{meeting.designer?.specialization}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${theme.text}`}>
                            <CalendarIcon className="w-3.5 h-3.5 opacity-60" /> 
                            {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${theme.text}`}>
                            <Clock className="w-3.5 h-3.5 opacity-60" /> {meeting.time}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${theme.accent}`}>
                            {meeting.consultationType === 'Video Call' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {meeting.consultationType}
                          </span>
                        </div>

                        {meeting.notes && (
                          <p className={`text-xs italic ${theme.textMuted} mt-3 max-w-md border-l-2 border-black/10 dark:border-white/10 pl-2`}>
                            "{meeting.notes}"
                          </p>
                        )}
                        
                        <span className="text-[10px] text-orange-500 font-bold tracking-wide mt-3 block">
                          {getCountdownString(meeting.date, meeting.time)}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                      {meeting.consultationType === 'Video Call' && meeting.meetingLink && (
                        <button 
                          onClick={() => window.open(meeting.meetingLink, '_blank', 'noopener,noreferrer')}
                          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'}`}
                        >
                          <span>Join call</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenReschedule(meeting)}
                        className={`px-4 py-2 rounded-xl border ${theme.card} text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consultation History */}
          <div className={`p-6 lg:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <h3 className={`text-lg font-bold ${theme.text} mb-6 flex items-center gap-2`}>
              <Award className="w-5 h-5 opacity-70" /> Consultation History
            </h3>

            {historyMeetings.length === 0 ? (
              <p className={`text-xs ${theme.textMuted} text-center py-6`}>No past consultations recorded.</p>
            ) : (
              <div className="space-y-3">
                {historyMeetings.map((meeting) => (
                  <div key={meeting._id} className="p-4 rounded-xl border border-dashed border-black/10 dark:border-white/10 flex justify-between items-center opacity-70">
                    <div className="flex gap-3 items-center">
                      <img 
                        src={meeting.designer?.profileImage} 
                        alt={meeting.designer?.name} 
                        className="w-10 h-10 rounded-full object-cover shrink-0" 
                      />
                      <div>
                        <h4 className={`text-sm font-bold ${theme.text}`}>{meeting.designer?.name}</h4>
                        <p className={`text-[10px] ${theme.textMuted}`}>{meeting.designer?.specialization}</p>
                        <span className={`text-[10px] ${theme.textMuted} block mt-0.5`}>
                          {new Date(meeting.date).toLocaleDateString()} at {meeting.time} • {meeting.consultationType}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      meeting.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {meeting.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Browse Designers Grid (Spans 5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-6 lg:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <div className="mb-6">
              <h3 className={`text-lg font-bold ${theme.text} flex items-center gap-2`}>
                <User className="w-5 h-5 opacity-70" /> Our Elite Designers
              </h3>
              <p className={`text-xs ${theme.textMuted} mt-1`}>Choose a master architect to book a session.</p>
            </div>

            <div className="space-y-4">
              {designers.map((d) => (
                <div 
                  key={d._id} 
                  className={`p-5 rounded-2xl border ${theme.cardInner} flex flex-col gap-4 transition-all duration-300 hover:scale-[1.01]`}
                >
                  <div className="flex gap-4">
                    <img 
                      src={d.profileImage} 
                      alt={d.name} 
                      className="w-16 h-16 rounded-full object-cover shadow-md shrink-0 cursor-pointer" 
                      onClick={() => setSelectedProfileDesigner(d)}
                    />
                    <div className="min-w-0">
                      <h4 
                        className={`font-bold ${theme.text} hover:underline cursor-pointer flex items-center gap-1.5`}
                        onClick={() => setSelectedProfileDesigner(d)}
                      >
                        {d.name}
                        <span className="flex items-center text-[11px] font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" /> {d.rating}
                        </span>
                      </h4>
                      <p className={`text-xs ${theme.textMuted} font-semibold`}>{d.specialization}</p>
                      <p className={`text-[10px] ${theme.textMuted} uppercase tracking-wider font-bold mt-1`}>
                        {d.experience} Years Experience
                      </p>
                    </div>
                  </div>

                  <p className={`text-xs ${theme.textMuted} line-clamp-2`}>
                    {d.bio}
                  </p>

                  <div className="flex gap-2 border-t border-black/5 dark:border-white/5 pt-3">
                    <button 
                      onClick={() => setSelectedProfileDesigner(d)}
                      className={`flex-1 py-2 rounded-xl border ${theme.card} text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all`}
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => handleOpenBooking(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'}`}
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 1. BOOKING WIZARD MODAL            */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {showWizard && selectedDesigner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWizard(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={`w-full max-w-lg rounded-4xl p-6 sm:p-8 border ${theme.card} ${theme.shadow} backdrop-blur-xl z-10 relative overflow-hidden`}
            >
              <button 
                onClick={() => setShowWizard(false)}
                className={`absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${theme.textMuted}`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Booking wizard title */}
              <div className="mb-6">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>
                  {isRescheduling ? 'Reschedule Session' : 'New Consultation Booking'}
                </span>
                <h3 className={`text-xl font-bold ${theme.text} mt-1`}>
                  {isRescheduling ? 'Reschedule with ' : 'Book '} {selectedDesigner.name}
                </h3>
              </div>

              {/* Step Indicators */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((stepNum) => (
                  <div 
                    key={stepNum} 
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      stepNum <= wizardStep 
                        ? (isNight ? 'bg-[#F5EBE0]' : 'bg-[#1E1A17]')
                        : 'bg-black/10 dark:bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* WIZARD STEPS CONTENT */}
              <div className="min-h-[280px]">
                
                {/* STEP 1: Select Consultation Type */}
                {wizardStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <h4 className={`text-sm font-bold ${theme.text} mb-2`}>Select Consultation Mode:</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedDesigner.consultationTypes.map(cType => (
                        <div 
                          key={cType}
                          onClick={() => setConsultationType(cType)}
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-4 items-center transition-all ${
                            consultationType === cType 
                              ? theme.activeCard 
                              : `${theme.cardInner} hover:scale-[1.01]`
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl ${consultationType === cType ? 'bg-black/5 dark:bg-white/5' : ''}`}>
                            {cType === 'Video Call' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                          </div>
                          <div>
                            <h5 className={`font-bold ${theme.text} text-sm`}>{cType}</h5>
                            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                              {cType === 'Video Call' 
                                ? 'Consult online via high-quality video call' 
                                : 'Meet in person at our design studio office'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Choose Date & Time Slot */}
                {wizardStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Custom Calendar */}
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted} block mb-2`}>Choose Date</span>
                        <CustomCalendar selectedDate={selectedDate} onChange={setSelectedDate} theme={theme} />
                      </div>

                      {/* Right: Real-time time slots */}
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted} block mb-2`}>Available Time Slots</span>
                        {loadingSlots ? (
                          <div className="flex-1 flex flex-col items-center justify-center py-10">
                            <Loader2 className={`w-6 h-6 animate-spin ${theme.textMuted} mb-2`} />
                            <span className={`text-xs ${theme.textMuted}`}>Updating slots...</span>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-1">
                            {availableSlots.length === 0 ? (
                              <p className={`text-xs ${theme.textMuted} text-center py-10 italic`}>
                                No slots available on this day. Please select another date.
                              </p>
                            ) : (
                              availableSlots.map(({ time, available }) => (
                                <button
                                  key={time}
                                  type="button"
                                  disabled={!available}
                                  onClick={() => setSelectedSlot(time)}
                                  className={`w-full p-3 text-left rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                                    !available 
                                      ? 'opacity-20 cursor-not-allowed bg-transparent' 
                                      : selectedSlot === time 
                                        ? theme.activeCard 
                                        : `${theme.cardInner} hover:bg-black/5 dark:hover:bg-white/5`
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 opacity-60" /> {time}
                                  </span>
                                  {!available && <span className="text-[9px] uppercase tracking-wide">Booked</span>}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Confirm Booking Summary */}
                {wizardStep === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <h4 className={`text-sm font-bold ${theme.text} mb-3`}>Confirm booking details:</h4>
                    
                    <div className={`p-5 rounded-2xl border ${theme.cardInner} space-y-3`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`${theme.textMuted}`}>Designer</span>
                        <span className={`font-bold ${theme.text}`}>{selectedDesigner.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`${theme.textMuted}`}>Date</span>
                        <span className={`font-bold ${theme.text}`}>{selectedDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`${theme.textMuted}`}>Time</span>
                        <span className={`font-bold ${theme.text}`}>{selectedSlot}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`${theme.textMuted}`}>Meeting Type</span>
                        <span className={`font-bold ${theme.text}`}>{consultationType}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`${theme.textMuted}`}>Duration</span>
                        <span className={`font-bold ${theme.text}`}>45 Minutes</span>
                      </div>
                    </div>

                    {!isRescheduling && (
                      <div className="space-y-1.5 mt-2">
                        <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted}`}>
                          Design Notes / Project Scope (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="E.g., Discussing kitchen layout designs or marble material selection."
                          className={`w-full p-3 rounded-xl border text-xs outline-none focus:border-[#C9B7A7] min-h-[80px] bg-transparent ${theme.text}`}
                        />
                      </div>
                    )}

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex gap-2 items-center text-red-500 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 4: Success Confirmation */}
                {wizardStep === 4 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${isNight ? 'bg-[#F5EBE0]' : 'bg-[#1E1A17]'}`}>
                      <Check className={`w-8 h-8 ${isNight ? 'text-[#1E1A17]' : 'text-[#F5EBE0]'}`} />
                    </div>
                    <div>
                      <h4 className={`text-2xl font-extrabold ${theme.text} font-nav-style`}>
                        {isRescheduling ? 'Rescheduled Confirmed' : 'Consultation Scheduled'}
                      </h4>
                      <p className={`text-xs ${theme.textMuted} mt-2 max-w-xs mx-auto`}>
                        Your appointment with {selectedDesigner.name} has been set for {selectedDate.toLocaleDateString()} at {selectedSlot}. An confirmation email and reminder have been scheduled.
                      </p>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Wizard Footer Actions */}
              <div className="flex justify-between border-t border-black/5 dark:border-white/5 pt-5 mt-6">
                {wizardStep === 4 ? (
                  <button
                    onClick={() => setShowWizard(false)}
                    className={`w-full py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                      isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]'
                    }`}
                  >
                    Return to Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={wizardStep === 1 || (isRescheduling && wizardStep === 2)}
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold border ${theme.card} ${
                        (wizardStep === 1 || (isRescheduling && wizardStep === 2)) ? 'opacity-0 pointer-events-none' : theme.text
                      }`}
                    >
                      Back
                    </button>

                    {wizardStep < 3 ? (
                      <button
                        type="button"
                        disabled={wizardStep === 2 && !selectedSlot}
                        onClick={() => setWizardStep(prev => prev + 1)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          (wizardStep === 2 && !selectedSlot) 
                            ? 'opacity-40 cursor-not-allowed bg-black/10 dark:bg-white/10' 
                            : isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]'
                        }`}
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={bookingSubmitLoading}
                        onClick={handleConfirmBooking}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                          isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]'
                        }`}
                      >
                        {bookingSubmitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>{isRescheduling ? 'Confirm Reschedule' : 'Confirm & Book'}</span>
                      </button>
                    )}
                  </>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 2. DESIGNER PROFILE MODAL          */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {selectedProfileDesigner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfileDesigner(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={`w-full max-w-md rounded-4xl p-6 sm:p-8 border ${theme.card} ${theme.shadow} backdrop-blur-xl z-10 relative`}
            >
              <button 
                onClick={() => setSelectedProfileDesigner(null)}
                className={`absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${theme.textMuted}`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4">
                <img 
                  src={selectedProfileDesigner.profileImage} 
                  alt={selectedProfileDesigner.name} 
                  className="w-24 h-24 rounded-full mx-auto object-cover shadow-lg border-2 border-[#C9B7A7]" 
                />
                
                <div>
                  <h3 className={`text-xl font-extrabold ${theme.text} font-nav-style`}>{selectedProfileDesigner.name}</h3>
                  <p className={`text-xs ${theme.textMuted} font-semibold mt-1`}>{selectedProfileDesigner.specialization}</p>
                  
                  <div className="flex justify-center items-center gap-4 mt-3">
                    <span className="flex items-center text-xs font-bold text-amber-500">
                      <Star className="w-4 h-4 fill-current mr-1" /> {selectedProfileDesigner.rating} Rating
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isNight ? 'bg-white/20' : 'bg-black/20'}`} />
                    <span className={`text-xs font-bold ${theme.textMuted}`}>
                      {selectedProfileDesigner.experience} Years Exp
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border text-left ${theme.cardInner}`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${theme.text} mb-1 flex items-center gap-1.5`}>
                    <BookOpen className="w-3.5 h-3.5 opacity-60" /> Biography
                  </h4>
                  <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
                    {selectedProfileDesigner.bio}
                  </p>
                </div>

                <div className="flex gap-2 w-full pt-4">
                  <button 
                    onClick={() => {
                      setSelectedProfileDesigner(null)
                      // Dynamic link to chat
                      navigate('/client/chat')
                    }}
                    className={`flex-1 py-3 rounded-xl border ${theme.card} text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-1.5`}
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                  <button 
                    onClick={() => {
                      const designer = selectedProfileDesigner;
                      setSelectedProfileDesigner(null)
                      handleOpenBooking(designer)
                    }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                      isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'
                    }`}
                  >
                    Book Session
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
