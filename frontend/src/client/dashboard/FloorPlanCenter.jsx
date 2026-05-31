import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { apiRequest } from '../utils/api'
import { io } from 'socket.io-client'
import { UploadCloud, FileText, CheckCircle2, XCircle, Clock, Loader2, ArrowRight } from 'lucide-react'

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

export default function FloorPlanCenter() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [fileToUpload, setFileToUpload] = useState(null)
  const fileInputRef = useRef(null)

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileToUpload(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!fileToUpload || !project) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', fileToUpload)
    formData.append('fileType', 'Floor Plan')

    try {
      await apiRequest(`/projects/${project._id}/uploads`, {
        method: 'POST',
        body: formData,
        isFormData: true
      })
      setFileToUpload(null)
      fetchProject()
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className={`w-10 h-10 animate-spin ${theme.text}`} />
        <p className={`text-sm tracking-widest uppercase ${theme.textMuted}`}>Loading Workspace...</p>
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

  const floorPlans = (project.uploads || []).filter(u => u.fileType === 'Floor Plan')

  return (
    <div className="w-full h-full pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 lg:mb-12">
        <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${theme.text} mb-2 font-nav-style`}>
          Master Plan Workspace
        </h1>
        <p className={`text-sm lg:text-base ${theme.textMuted} max-w-xl`}>
          Upload your property layout, site measurements, and floor plans. Your Admin will review them instantly.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-8 border ${theme.card} ${theme.shadow} flex flex-col items-center text-center`}>
          <div 
            className={`w-full border-2 border-dashed ${fileToUpload ? 'border-green-500 bg-green-500/5' : `border-[#D6CCC2] dark:border-[#3A312B] ${theme.cardInner}`} rounded-2xl p-10 transition-colors cursor-pointer`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.dwg,.zip" />
            
            {fileToUpload ? (
              <div className="flex flex-col items-center">
                <FileText className="w-12 h-12 text-green-500 mb-4" />
                <h4 className={`font-bold ${theme.text}`}>{fileToUpload.name}</h4>
                <p className={`text-xs ${theme.textMuted} mt-2`}>{(fileToUpload.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className={`w-12 h-12 ${theme.textMuted} opacity-50 mb-4`} />
                <h4 className={`font-bold ${theme.text}`}>Click or Drag to Upload</h4>
                <p className={`text-xs ${theme.textMuted} mt-2`}>Supported: PDF, PNG, JPG, DWG, ZIP (Max 15MB)</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {fileToUpload && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={handleUpload}
                disabled={uploading}
                className={`mt-6 w-full py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${theme.accent} flex items-center justify-center gap-2 disabled:opacity-70`}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload & Notify Admin'}
                {!uploading && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Upload History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`rounded-3xl p-8 border ${theme.card} ${theme.shadow}`}>
          <h3 className={`text-lg font-bold ${theme.text} mb-6`}>Uploaded Documents</h3>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {floorPlans.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <FileText className={`w-10 h-10 mx-auto mb-3 ${theme.textMuted}`} />
                <p className={`text-sm ${theme.textMuted}`}>No floor plans uploaded yet.</p>
              </div>
            ) : (
              floorPlans.map(plan => (
                <div key={plan._id} className={`p-4 rounded-2xl border ${theme.cardInner} flex items-center justify-between gap-4`}>
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl shrink-0">
                      <FileText className={`w-6 h-6 ${theme.text}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-semibold text-sm truncate ${theme.text}`}>{plan.fileName}</h4>
                      <p className={`text-xs ${theme.textMuted} mt-1 flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        {new Date(plan.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2">
                    {plan.status === 'Approved' && <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3"/> Approved</span>}
                    {plan.status === 'Pending Approval' && <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold uppercase tracking-wider"><Clock className="w-3 h-3"/> Pending</span>}
                    {plan.status === 'Revision Requested' && <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider"><XCircle className="w-3 h-3"/> Revision</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
