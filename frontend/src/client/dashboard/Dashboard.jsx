import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { apiRequest } from '../utils/api'
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  CreditCard,
  Building2,
  CalendarDays,
  Loader2,
  Bell,
  Check,
  MessageSquare
} from 'lucide-react'

// Common styling to respect the theme system
const THEME = {
  light: {
    card: 'bg-[#E3D5CA]/50 border-[#D6CCC2]/40',
    cardInner: 'bg-[#F5EBE0]/50 border-[#D6CCC2]/20',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    accent: 'bg-[#C9B7A7]/50 text-[#2B2B2B]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  },
  dark: {
    card: 'bg-[#2A241F]/60 border-[#3A312B]',
    cardInner: 'bg-[#1E1A17]/50 border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    accent: 'bg-[#3A312B] text-[#F5EBE0]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function Dashboard() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light
  const navigate = useNavigate()

  // Core API State Variables
  const [headerData, setHeaderData] = useState(null)
  const [projectData, setProjectData] = useState(null)
  const [meetingData, setMeetingData] = useState(null)
  const [paymentData, setPaymentData] = useState(null)
  const [inspirationData, setInspirationData] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch welcome header greeting
        const headerRes = await apiRequest('/dashboard/header')
        setHeaderData(headerRes.data)

        // Fetch current active project details
        const projectRes = await apiRequest('/projects/current')
        setProjectData(projectRes.data)

        // Fetch upcoming design meetings
        const meetingsRes = await apiRequest('/dashboard/meetings')
        if (meetingsRes.data && meetingsRes.data.length > 0) {
          // Find the first upcoming or scheduled meeting
          const activeMeeting = meetingsRes.data.find(m => m.status === 'Scheduled') || meetingsRes.data[0];
          setMeetingData(activeMeeting)
        }

        // Fetch invoice budget & payments
        const paymentRes = await apiRequest('/payments/status')
        setPaymentData(paymentRes.data)

        // Fetch curated Unsplash inspirations
        const inspirationsRes = await apiRequest('/wishlist/recent')
        setInspirationData(inspirationsRes.data || [])

        // Fetch unread notifications
        const notificationsRes = await apiRequest('/notifications')
        if (notificationsRes.data) {
          // Filter to show unread notifications on the dashboard
          setNotifications(notificationsRes.data.filter(n => !n.isRead))
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleJoinMeeting = () => {
    if (meetingData) {
      const roomName = `SNS-NEST-${meetingData._id || 'Consultation'}`;
      const meetUrl = `https://meet.jit.si/${roomName}`;
      window.open(meetUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback Jitsi room
      window.open('https://meet.jit.si/SNS-NEST-Consultation', '_blank', 'noopener,noreferrer');
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className={`w-10 h-10 animate-spin ${theme.text}`} />
        <p className={`text-sm tracking-widest uppercase ${theme.textMuted}`}>Sourcing Luxury Details...</p>
      </div>
    )
  }

  // Calculate project percentage progress dynamically from milestones completed
  const getProgressPercentage = () => {
    if (!projectData || !projectData.timeline) return 60
    const completedCount = projectData.timeline.filter(item => item.completed).length
    return Math.round((completedCount / projectData.timeline.length) * 100)
  }

  const progress = getProgressPercentage()

  return (
    <div className="w-full h-full pb-20">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 lg:mb-12"
      >
        <div>
          <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${theme.text} mb-2 font-nav-style`}>
            Welcome back, {headerData?.name || 'Client'}.
          </h1>
          <p className={`text-sm lg:text-base ${theme.textMuted} max-w-xl`}>
            Your {headerData?.projectName || 'Scandinavian Villa'} project is currently in the {headerData?.currentPhase || 'Material Procurement'} phase.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/client/tracking')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-md border ${theme.card} ${theme.shadow} hover:scale-105 transition-transform duration-300 font-semibold text-sm`}
        >
          <span>View Master Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8"
      >
        
        {/* Main Project Status Card (Spans 8 columns on desktop) */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-12 lg:col-span-8 rounded-3xl p-6 lg:p-8 backdrop-blur-md border ${theme.card} ${theme.shadow} relative overflow-hidden`}>
          {/* Subtle lighting gradient */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none`}></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.accent} mb-4`}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                In Progress
              </div>
              <h2 className={`text-2xl font-bold ${theme.text}`}>{projectData?.title || 'Scandinavian Villa'}</h2>
              <p className={`text-sm ${theme.textMuted} flex items-center gap-1.5 mt-2`}>
                <MapPin className="w-4 h-4" /> Seattle Estate & Design Site
              </p>
            </div>
            <div className={`text-right hidden sm:block`}>
              <div className="text-3xl font-light">{progress}%</div>
              <div className={`text-xs uppercase tracking-wider ${theme.textMuted}`}>Completed</div>
            </div>
          </div>

          {/* Elegant Progress Bar */}
          <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden mb-8 relative z-10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full rounded-full ${isNight ? 'bg-[#D5BDAF]' : 'bg-[#4A4340]'}`}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
            {(projectData?.timeline || [
              { status: 'Consultation Completed', completed: true },
              { status: 'Design Approved', completed: true },
              { status: 'Material Procurement', completed: true },
              { status: 'Execution Started', completed: false },
              { status: 'Final Delivery', completed: false }
            ]).map((step, i) => (
              <div 
                key={i} 
                onClick={() => navigate('/client/tracking')}
                className={`p-4 rounded-2xl border ${theme.cardInner} flex flex-col gap-2 cursor-pointer hover:scale-[1.02] transition-transform duration-300`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500/80" />
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 border-dashed ${theme.textMuted} opacity-30`} />
                )}
                <span className={`text-[10px] font-semibold tracking-wide mt-auto ${!step.completed ? 'opacity-40' : ''}`}>
                  {step.status.replace('Completed', '').replace('Started', '').trim()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Meeting Card (Spans 4 columns) */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-6 lg:col-span-4 rounded-3xl p-6 lg:p-8 backdrop-blur-md border ${theme.card} ${theme.shadow} flex flex-col`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold ${theme.text}`}>Next Meeting</h3>
            <button 
              onClick={() => navigate('/client/booking')}
              className={`p-2 rounded-full ${theme.cardInner} hover:scale-105 transition-transform`}
              title="Schedule consultation"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full bg-linear-to-br from-[#D6CCC2] to-[#817773] p-1`}>
                <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-serif text-xl italic">
                    {meetingData?.designer?.fullName ? meetingData.designer.fullName.charAt(0) : 'J'}
                  </span>
                </div>
              </div>
              <div>
                <h4 className={`font-bold ${theme.text}`}>{meetingData?.designer?.fullName || 'John Designer'}</h4>
                <p className={`text-xs ${theme.textMuted}`}>Lead Interior Architect</p>
              </div>
              
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme.cardInner} text-sm font-medium mt-4`}>
                <Clock className="w-4 h-4" />
                {meetingData?.dateTime ? new Date(meetingData.dateTime).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'No meeting scheduled'}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleJoinMeeting}
            className={`w-full mt-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'}`}
          >
            Join Video Call
          </button>
        </motion.div>

        {/* Quick Stats / Payments (Spans 4 columns) */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-6 lg:col-span-4 rounded-3xl p-6 backdrop-blur-md border ${theme.card} ${theme.shadow} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${theme.textMuted}`}>Payment Status</h3>
              <CreditCard className={`w-5 h-5 ${theme.textMuted}`} />
            </div>
            <div className="space-y-1 mb-6">
              <div className={`text-3xl font-light ${theme.text}`}>
                ₹{(paymentData?.pendingAmount || 1960000).toLocaleString('en-IN')}
              </div>
              <div className={`text-xs ${theme.textMuted}`}>
                Next milestone due in {paymentData?.nextDueDate ? Math.max(0, Math.ceil((new Date(paymentData.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))) : 14} days
              </div>
            </div>
            <div className="w-full bg-black/10 rounded-full h-1.5 mb-2 overflow-hidden">
              <div 
                style={{ width: `${((paymentData?.paidAmount || 980000) / (paymentData?.totalAmount || 2940000)) * 100}%` }}
                className={`h-full rounded-full ${isNight ? 'bg-[#D5BDAF]' : 'bg-[#4A4340]'}`}
              />
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider opacity-60">
              <span>Paid: ₹{(paymentData?.paidAmount || 980000).toLocaleString('en-IN')}</span>
              <span>Total: ₹{(paymentData?.totalAmount || 2940000).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/client/payment')}
            className={`w-full mt-6 py-2.5 rounded-2xl font-semibold text-xs border ${theme.cardInner} hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
          >
            Manage Invoices & Payments
          </button>
        </motion.div>

        {/* Recent Notifications Card (Spans 8 columns) */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-12 lg:col-span-8 rounded-3xl p-6 backdrop-blur-md border ${theme.card} ${theme.shadow} flex flex-col`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${theme.text}`} />
              <h3 className={`text-lg font-bold ${theme.text}`}>Recent Notifications</h3>
            </div>
            {notifications.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white animate-pulse">
                {notifications.length} New
              </span>
            )}
          </div>
          
          <div className="flex-1 flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500/80 mb-2" />
                <p className={`text-sm font-medium ${theme.text}`}>You are all caught up!</p>
                <p className={`text-xs ${theme.textMuted} mt-1`}>No unread notifications at the moment.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                return (
                  <div 
                    key={notif._id} 
                    className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all ${theme.cardInner} border-[#D6CCC2]/60 dark:border-[#3A312B]/60 shadow-sm`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 ${theme.text} shrink-0`}>
                        {notif.type === 'project' && <Building2 className="w-4 h-4" />}
                        {notif.type === 'payment' && <CreditCard className="w-4 h-4" />}
                        {notif.type === 'consultation' && <CalendarDays className="w-4 h-4" />}
                        {notif.type === 'chat' && <MessageSquare className="w-4 h-4" />}
                        {!['project', 'payment', 'consultation', 'chat'].includes(notif.type) && <Bell className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${theme.text}`}>{notif.title}</h4>
                        <p className={`text-xs ${theme.textMuted} mt-1`}>{notif.message}</p>
                        <span className={`text-[9px] uppercase tracking-wider ${theme.textMuted} opacity-60 block mt-2`}>
                          {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className={`p-2 rounded-xl hover:bg-green-500/10 hover:text-green-500 transition-colors ${theme.textMuted}`}
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Saved Designs Snippet (Spans 12 columns) */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-12 rounded-3xl p-6 backdrop-blur-md border ${theme.card} ${theme.shadow}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold ${theme.text}`}>Recent Inspiration</h3>
            <button 
              onClick={() => navigate('/client/designs')}
              className={`text-xs uppercase tracking-widest font-semibold hover:underline ${theme.textMuted}`}
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(inspirationData.length > 0 ? inspirationData.slice(0, 4) : [
              { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400&h=300' },
              { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400&h=300' },
              { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=400&h=300' },
              { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=400&h=300' }
            ]).map((item, i) => (
              <div key={i} className="group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer" onClick={() => navigate('/client/designs')}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                <img 
                  src={item.url} 
                  alt="Interior Inspiration"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </motion.div>
        
      </motion.div>
    </div>
  )
}
