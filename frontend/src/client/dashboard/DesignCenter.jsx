import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { apiRequest } from '../utils/api'
import { io } from 'socket.io-client'
import { Image as ImageIcon, CheckCircle2, XCircle, Clock, Loader2, MessageSquare, Download } from 'lucide-react'

const THEME = {
  light: {
    bg: 'bg-[#F5EBE0]',
    card: 'bg-[#E3D5CA]/50 border-[#D6CCC2]/40',
    cardInner: 'bg-[#F5EBE0]/50 border-[#D6CCC2]/20',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    accent: 'bg-[#1A1210] text-[#E3D5CA]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  },
  dark: {
    bg: 'bg-[#1E1A17]',
    card: 'bg-[#2A241F]/60 border-[#3A312B]',
    cardInner: 'bg-[#1E1A17]/50 border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    accent: 'bg-[#E3D5CA] text-[#1A1210]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
  }
}

export default function DesignCenter() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [selectedDesign, setSelectedDesign] = useState(null)

  useEffect(() => {
    fetchProject()

    const token = localStorage.getItem('token')
    if (token) {
      const socket = io('http://localhost:5000', { auth: { token } })
      socket.on('project_updated', () => {
        fetchProject()
      })
      return () => socket.disconnect()
    }
  }, [])

  const fetchProject = async () => {
    try {
      const res = await apiRequest('/projects/current')
      setProject(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (uploadId, newStatus) => {
    setUpdatingId(uploadId)
    try {
      await apiRequest(`/projects/${project._id}/upload/${uploadId}/approve`, {
        method: 'PATCH',
        body: { status: newStatus, feedback: feedback }
      })
      setSelectedDesign(null)
      setFeedback('')
      fetchProject()
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className={`w-10 h-10 animate-spin ${theme.text}`} />
        <p className={`text-sm tracking-widest uppercase ${theme.textMuted}`}>Loading Designs...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className={`w-full p-8 rounded-3xl border ${theme.card} text-center mt-10`}>
        <h3 className={`text-lg font-bold ${theme.text}`}>No Active Project</h3>
        <p className={`text-sm ${theme.textMuted} mt-2`}>Your assigned Admin will initialize the workspace soon.</p>
      </div>
    )
  }

  // Filter out Floor Plans, keep Designs and Renders
  const designs = (project.uploads || []).filter(u => u.fileType !== 'Floor Plan')

  return (
    <div className="w-full h-full pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 lg:mb-12">
        <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${theme.text} mb-2 font-nav-style`}>
          Design Center
        </h1>
        <p className={`text-sm lg:text-base ${theme.textMuted} max-w-xl`}>
          Review, approve, or request revisions on 2D layouts, 3D renders, and material boards uploaded by your Admin.
        </p>
      </motion.div>

      {designs.length === 0 ? (
        <div className={`w-full p-12 rounded-3xl border ${theme.card} flex flex-col items-center justify-center text-center opacity-70`}>
          <ImageIcon className={`w-16 h-16 mb-4 ${theme.textMuted}`} />
          <h3 className={`text-lg font-bold ${theme.text}`}>No Designs Yet</h3>
          <p className={`text-sm ${theme.textMuted} mt-2 max-w-md`}>
            Your admin hasn't uploaded any designs for review yet. You'll receive a notification here when they do.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map(design => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              key={design._id} 
              className={`rounded-3xl border ${theme.card} overflow-hidden ${theme.shadow} flex flex-col`}
            >
              <div className="w-full aspect-video bg-black/5 dark:bg-white/5 relative group">
                {design.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <img src={design.fileUrl} alt={design.fileName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ImageIcon className={`w-12 h-12 ${theme.textMuted} opacity-30`} />
                    <span className={`text-xs mt-2 font-semibold ${theme.textMuted}`}>{design.fileType}</span>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  {design.status === 'Approved' && <span className="px-3 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">Approved</span>}
                  {design.status === 'Pending Approval' && <span className="px-3 py-1 rounded-full bg-yellow-500 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">Pending</span>}
                  {design.status === 'Revision Requested' && <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">Revision</span>}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h4 className={`font-bold text-lg truncate ${theme.text}`} title={design.fileName}>{design.fileName}</h4>
                <div className={`flex items-center justify-between mt-2 mb-6`}>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${theme.cardInner} ${theme.textMuted}`}>{design.fileType}</span>
                  <span className={`text-[10px] uppercase tracking-wider ${theme.textMuted}`}>
                    {new Date(design.uploadedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-auto space-y-3">
                  <a 
                    href={design.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`w-full py-2.5 rounded-xl border ${theme.cardInner} text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
                  >
                    <Download className="w-4 h-4" /> Download / View
                  </a>

                  {design.status === 'Pending Approval' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleUpdateStatus(design._id, 'Approved')}
                        disabled={updatingId === design._id}
                        className="py-2.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white transition-colors text-xs font-bold flex justify-center items-center gap-2"
                      >
                        {updatingId === design._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Approve
                      </button>
                      <button 
                        onClick={() => setSelectedDesign(design._id)}
                        disabled={updatingId === design._id}
                        className="py-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-colors text-xs font-bold flex justify-center items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Revision Modal */}
      <AnimatePresence>
        {selectedDesign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedDesign(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-md p-8 rounded-3xl ${theme.bg} ${theme.shadow} border ${theme.border} z-10`}
            >
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Request Revision</h3>
              <p className={`text-sm ${theme.textMuted} mb-6`}>Please explain what changes you'd like the Admin to make.</p>
              
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="E.g., Can we make the kitchen island slightly larger?..."
                className={`w-full h-32 p-4 rounded-xl border ${theme.border} bg-transparent ${theme.text} focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 resize-none mb-6 text-sm`}
              />
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedDesign(null)}
                  className={`flex-1 py-3 rounded-xl border ${theme.border} text-sm font-semibold`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedDesign, 'Revision Requested')}
                  disabled={!feedback.trim() || updatingId === selectedDesign}
                  className={`flex-1 py-3 rounded-xl ${theme.accent} text-sm font-semibold flex justify-center items-center disabled:opacity-50`}
                >
                  {updatingId === selectedDesign ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Feedback'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
