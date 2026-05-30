import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { apiRequest } from '../utils/api'
import { io } from 'socket.io-client'
import { 
  ArrowRight, Clock, MapPin, CheckCircle2, CreditCard, Building2, CalendarDays, Loader2, Bell, Check, MessageSquare, ListTodo
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
  const [activities, setActivities] = useState([])
  const [inquiryData, setInquiryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acceptingQuote, setAcceptingQuote] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Fetch Header
      try {
        const headerRes = await apiRequest('/dashboard/header')
        setHeaderData(headerRes.data)
      } catch (error) {
        console.error('Header fetch error:', error.message || error)
      }

      // 2. Fetch Project
      try {
        const projectRes = await apiRequest('/projects/current')
        setProjectData(projectRes.data)
      } catch (error) {
        if (error?.statusCode !== 404) {
          console.error('Project fetch error:', error.message || error)
        }
      }

      // 3. Fetch Meetings
      try {
        const meetingsRes = await apiRequest('/dashboard/meetings')
        if (meetingsRes.data && meetingsRes.data.length > 0) {
          const activeMeeting = meetingsRes.data.find(m => m.status === 'Scheduled') || meetingsRes.data[0];
          setMeetingData(activeMeeting)
        }
      } catch (error) {
        console.error('Meetings fetch error:', error.message || error)
      }

      // 4. Fetch Payments
      try {
        const paymentRes = await apiRequest('/payments/status')
        setPaymentData(paymentRes.data)
      } catch (error) {
        console.error('Payments fetch error:', error.message || error)
      }

      // 5. Fetch Inspirations (Catalog items)
      try {
        const inspirationsRes = await apiRequest('/wishlist/recent')
        setInspirationData(inspirationsRes.data || [])
      } catch (error) {
        console.error('Inspirations fetch error:', error.message || error)
      }

      // 6. Fetch Notifications
      try {
        const notificationsRes = await apiRequest('/notifications')
        if (notificationsRes.data) {
          setNotifications(notificationsRes.data.filter(n => !n.isRead))
        }
      } catch (error) {
        console.error('Notifications fetch error:', error.message || error)
      }

      // 7. Fetch Activity Feed
      try {
        const activityRes = await apiRequest('/dashboard/activity')
        if (activityRes.data) {
          setActivities(activityRes.data)
        }
      } catch (error) {
        console.error('Activity fetch error:', error.message || error)
      }

      // 8. Fetch Inquiry if no project
      try {
        const inqRes = await apiRequest('/inquiries/current')
        setInquiryData(inqRes.data)
      } catch (error) {
        // Normal if no inquiry exists
      }

      setLoading(false)
    }

    fetchDashboardData()

    // Socket.io Realtime connection
    const token = localStorage.getItem('token')
    if (token) {
      const socket = io('http://localhost:5000', {
        auth: { token }
      })

      socket.on('connect', () => {
        console.log('Connected to realtime workspace')
      })

      socket.on('project_updated', (data) => {
        // Automatically refresh project data on update
        apiRequest('/projects/current').then(res => setProjectData(res.data)).catch(console.error)
        apiRequest('/dashboard/header').then(res => setHeaderData(res.data)).catch(console.error)
      })

      socket.on('notification_created', (notif) => {
        setNotifications(prev => [notif, ...prev])
      })

      socket.on('inquiry_updated', (data) => {
        setInquiryData(data.inquiry)
      })

      socket.on('newActivity', (activity) => {
        setActivities(prev => [activity, ...prev])
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && projectData?._id) {
      const socket = io('http://localhost:5000', { auth: { token } })
      socket.emit('joinProjectRoom', projectData._id)
      return () => socket.disconnect()
    }
  }, [projectData?._id])

  const handleAcceptProposal = async () => {
    if (!inquiryData?._id) return
    setAcceptingQuote(true)
    try {
      await apiRequest(`/inquiries/${inquiryData._id}/accept`, { method: 'POST' })
      // Reload page to enter project workspace
      window.location.reload()
    } catch (err) {
      console.error(err)
      setAcceptingQuote(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleJoinMeeting = () => {
    if (meetingData && meetingData.meetingLink) {
      window.open(meetingData.meetingLink, '_blank', 'noopener,noreferrer');
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

  // Fallback for new clients with no project
  if (!projectData) {
    if (inquiryData && inquiryData.status !== 'Client Accepted') {
      return (
        <div className="w-full h-full pb-20 max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 lg:mb-12">
            <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${theme.text} mb-2 font-nav-style`}>
              Quotation Tracker
            </h1>
            <p className={`text-sm lg:text-base ${theme.textMuted}`}>
              Track your ongoing inquiry and final quotation proposal.
            </p>
          </motion.div>
          
          <div className={`w-full p-8 rounded-3xl border ${theme.card} shadow-xl`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-bold ${theme.text}`}>Status: {inquiryData.status}</h3>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                inquiryData.status === 'Pending Admin Review' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {inquiryData.status}
              </span>
            </div>

            {inquiryData.status === 'Pending Admin Review' ? (
              <div className="text-center py-10">
                <Loader2 className={`w-12 h-12 mx-auto mb-4 animate-spin text-orange-500`} />
                <h4 className={`text-lg font-bold ${theme.text}`}>Awaiting Admin Mapping</h4>
                <p className={`text-sm ${theme.textMuted} mt-2 max-w-md mx-auto`}>
                  We received your floor plan and estimate (₹{inquiryData.estimationDetails?.totalEstimatedCost?.toLocaleString()}). Our admins are mapping it to a 3D model to provide a final quotation.
                </p>
              </div>
            ) : inquiryData.status === 'Proposal Sent' ? (
              <div className="space-y-6">
                {inquiryData.admin3DModelUrl && (
                  <div className={`p-6 rounded-2xl border ${theme.cardInner}`}>
                    <h4 className={`text-sm font-bold uppercase tracking-wider ${theme.textMuted} mb-4`}>Admin 3D Model Proposal</h4>
                    <a href={inquiryData.admin3DModelUrl} target="_blank" rel="noreferrer" className="block w-full aspect-video rounded-xl overflow-hidden bg-black/5 group relative">
                      <img src={inquiryData.admin3DModelUrl} alt="3D Proposal" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold tracking-wider">Click to Enlarge</span>
                      </div>
                    </a>
                  </div>
                )}

                <div className={`p-6 rounded-2xl border ${theme.cardInner} flex justify-between items-center`}>
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wider ${theme.textMuted}`}>Final Approved Quotation</h4>
                    <p className={`text-3xl font-bold font-mono ${theme.text} mt-1`}>₹{inquiryData.finalQuotation?.toLocaleString()}</p>
                    {inquiryData.pdfQuotationUrl && (
                      <a href={inquiryData.pdfQuotationUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-500 hover:text-blue-600 hover:underline mt-2 inline-flex items-center gap-1">
                        📄 Download Detailed PDF Quotation
                      </a>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleAcceptProposal}
                    disabled={acceptingQuote}
                    className="px-8 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                  >
                    {acceptingQuote ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle2 className="w-5 h-5"/>}
                    Accept & Start Project
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )
    }

    return (
      <div className="w-full h-full pb-20">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 lg:mb-12">
          <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${theme.text} mb-2 font-nav-style`}>
            Welcome back, {headerData?.name || 'Client'}.
          </h1>
          <p className={`text-sm lg:text-base ${theme.textMuted} max-w-xl`}>
            Your luxury interior design journey is about to begin.
          </p>
        </motion.div>
        
        <div className={`w-full p-12 rounded-3xl border ${theme.card} text-center`}>
          <Building2 className={`w-16 h-16 mx-auto mb-4 ${theme.textMuted} opacity-50`} />
          <h3 className={`text-2xl font-bold ${theme.text}`}>Ready to start your project?</h3>
          <p className={`text-sm ${theme.textMuted} mt-4 max-w-md mx-auto leading-relaxed`}>
            Use our interactive estimation module to select your package, customize rooms, upload your floor plan, and request a final quotation from our admins.
          </p>
          <button 
            onClick={() => navigate('/client/estimate')}
            className={`mt-8 px-8 py-3 rounded-xl font-bold uppercase tracking-wider ${theme.accent} hover:scale-105 transition-transform`}
          >
            Go to Estimator
          </button>
        </div>
      </div>
    )
  }

  const completionPercentage = headerData?.completionPercentage || 0
  const totalBudget = projectData.budget || 0
  const paidAmount = paymentData?.paidAmount || 0
  const pendingAmount = Math.max(0, totalBudget - paidAmount)
  const paymentProgress = totalBudget > 0 ? (paidAmount / totalBudget) * 100 : 0
  const daysRemaining = projectData.expectedCompletion ? Math.max(0, Math.ceil((new Date(projectData.expectedCompletion) - new Date()) / (1000 * 60 * 60 * 24))) : 0

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
            Your {headerData?.projectName || 'Project'} is currently in the {headerData?.currentPhase || 'Draft'} phase. 
            Last updated on {headerData?.lastUpdated ? new Date(headerData.lastUpdated).toLocaleDateString() : 'recently'}.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/client/master-plan')}
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
          <div className={`absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none`}></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.accent} mb-4`}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                {projectData.status}
              </div>
              <h2 className={`text-2xl font-bold ${theme.text}`}>{projectData.title}</h2>
              <p className={`text-sm ${theme.textMuted} flex items-center gap-1.5 mt-2`}>
                <MapPin className="w-4 h-4" /> {headerData?.projectType || 'Residential Design'} 
                {daysRemaining > 0 && ` • ${daysRemaining} days remaining`}
              </p>
            </div>
            <div className={`text-right hidden sm:block`}>
              <div className="text-3xl font-light">{completionPercentage}%</div>
              <div className={`text-xs uppercase tracking-wider ${theme.textMuted}`}>Completed</div>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden mb-8 relative z-10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full rounded-full ${isNight ? 'bg-[#D5BDAF]' : 'bg-[#4A4340]'}`}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
            {(projectData.timeline && projectData.timeline.length > 0 ? projectData.timeline : []).slice(0, 5).map((step, i) => (
              <div 
                key={i} 
                onClick={() => navigate('/client/master-plan')}
                className={`p-4 rounded-2xl border ${theme.cardInner} flex flex-col gap-2 cursor-pointer hover:scale-[1.02] transition-transform duration-300`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500/80" />
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 border-dashed ${theme.textMuted} opacity-30`} />
                )}
                <span className={`text-[10px] font-semibold tracking-wide mt-auto ${!step.completed ? 'opacity-40' : ''}`}>
                  {step.status}
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
            {meetingData ? (
              <div className="text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full bg-linear-to-br from-[#D6CCC2] to-[#817773] p-1`}>
                  <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white font-serif text-xl italic">
                      {headerData?.assignedAdmin.charAt(0)}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className={`font-bold ${theme.text}`}>{headerData?.assignedAdmin}</h4>
                  <p className={`text-xs ${theme.textMuted}`}>Project Admin</p>
                </div>
                
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme.cardInner} text-sm font-medium mt-4`}>
                  <Clock className="w-4 h-4" />
                  {new Date(meetingData.dateTime).toLocaleString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CalendarDays className={`w-12 h-12 mx-auto mb-4 ${theme.textMuted} opacity-30`} />
                <p className={`text-sm ${theme.textMuted}`}>No upcoming meetings.</p>
              </div>
            )}
          </div>
          
          {meetingData ? (
            <button 
              onClick={handleJoinMeeting}
              disabled={!meetingData?.meetingLink}
              className={`w-full mt-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {meetingData?.meetingLink 
                ? meetingData.meetingLink.includes('meet.google') ? 'Join Google Meet' 
                  : meetingData.meetingLink.includes('zoom.us') ? 'Join Zoom' 
                  : meetingData.meetingLink.includes('jitsi') ? 'Join Jitsi' 
                  : 'Join Video Call'
                : 'No Link Available'
              }
            </button>
          ) : (
            <button 
              onClick={() => navigate('/client/booking')}
              className={`w-full mt-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'}`}
            >
              Schedule a Meeting
            </button>
          )}
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
                ₹{pendingAmount.toLocaleString('en-IN')}
              </div>
              <div className={`text-xs ${theme.textMuted}`}>
                Pending Amount
              </div>
            </div>
            <div className="w-full bg-black/10 rounded-full h-1.5 mb-2 overflow-hidden">
              <div 
                style={{ width: `${paymentProgress}%` }}
                className={`h-full rounded-full ${isNight ? 'bg-[#D5BDAF]' : 'bg-[#4A4340]'}`}
              />
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider opacity-60 mb-4">
              <span>Paid: ₹{paidAmount.toLocaleString('en-IN')}</span>
              <span>Total: ₹{totalBudget.toLocaleString('en-IN')}</span>
            </div>
            {paymentData?.nextDueDate && (
              <div className={`mt-4 p-3 rounded-xl border ${theme.cardInner} flex justify-between items-center text-xs`}>
                <span className={`${theme.textMuted}`}>Next Milestone</span>
                <span className={`font-bold ${theme.text}`}>
                  {new Date(paymentData.nextDueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {paymentData?.invoiceCount > 0 && (
              <div className={`mt-2 p-3 rounded-xl border ${theme.cardInner} flex justify-between items-center text-xs`}>
                <span className={`${theme.textMuted}`}>Invoices / Transactions</span>
                <span className={`font-bold ${theme.text}`}>{paymentData.invoiceCount} Generated</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate('/client/payment')}
            className={`w-full mt-6 py-2.5 rounded-2xl font-semibold text-xs border ${theme.cardInner} hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
          >
            Manage Invoices & Payments
          </button>
        </motion.div>

        {/* Project Activity Timeline (Spans 4 columns) - NEW */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-6 lg:col-span-4 rounded-3xl p-6 backdrop-blur-md border ${theme.card} ${theme.shadow} flex flex-col`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold ${theme.text}`}>Activity Feed</h3>
            <ListTodo className={`w-5 h-5 ${theme.textMuted}`} />
          </div>
          
          <div className="flex-1 flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1">
            <AnimatePresence>
              {activities.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className={`text-xs ${theme.textMuted}`}>No recent activity.</p>
                </div>
              ) : (
                activities.map((act) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={act.id} 
                    className="flex gap-4 relative border-l border-[#D6CCC2]/40 dark:border-[#3A312B] ml-2 pl-4 pb-4 last:pb-0"
                  >
                    <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-black/20 dark:bg-white/20 border-2 border-[#E3D5CA] dark:border-[#2A241F]`} />
                    <div>
                      <p className={`text-xs font-semibold ${theme.text}`}>{act.message}</p>
                      <span className={`text-[10px] ${theme.textMuted}`}>
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Recent Notifications Card (Spans 4 columns) */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-12 lg:col-span-4 rounded-3xl p-6 backdrop-blur-md border ${theme.card} ${theme.shadow} flex flex-col`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${theme.text}`} />
              <h3 className={`text-lg font-bold ${theme.text}`}>Notifications</h3>
            </div>
            {notifications.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white animate-pulse">
                {notifications.length} New
              </span>
            )}
          </div>
          
          <div className="flex-1 flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500/80 mb-2" />
                  <p className={`text-sm font-medium ${theme.text}`}>You are all caught up!</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={notif._id} 
                    className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all ${theme.cardInner} border-[#D6CCC2]/60 dark:border-[#3A312B]/60 shadow-sm`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 ${theme.text} shrink-0`}>
                        {notif.type === 'project' && <Building2 className="w-4 h-4" />}
                        {notif.type === 'payment' && <CreditCard className="w-4 h-4" />}
                        {notif.type === 'consultation' && <CalendarDays className="w-4 h-4" />}
                        {!['project', 'payment', 'consultation'].includes(notif.type) && <Bell className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${theme.text}`}>{notif.title}</h4>
                        <p className={`text-xs ${theme.textMuted} mt-1`}>{notif.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className={`p-2 rounded-xl hover:bg-green-500/10 hover:text-green-500 transition-colors ${theme.textMuted}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Saved Designs Snippet (Spans 12 columns) */}
        {inspirationData.length > 0 && (
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
              {inspirationData.slice(0, 4).map((item, i) => (
                <div key={item._id || i} className="group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer" onClick={() => navigate('/client/designs')}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                  <img 
                    src={item.url || item.imageUrl} 
                    alt="Interior Inspiration"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
      </motion.div>
    </div>
  )
}
