import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { apiRequest } from '../utils/api'
import { X, UploadCloud, FileText, Loader2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SendInquiryModal({ isOpen, onClose, estimationDetails }) {
  const { isNight } = useThemeStore()
  const theme = isNight ? {
    bg: 'bg-[#1E1A17]', text: 'text-[#F5EBE0]', textMuted: 'text-[#E3D5CA]/70', border: 'border-[#3A312B]', accent: 'bg-[#E3D5CA] text-[#1A1210]'
  } : {
    bg: 'bg-[#F5EBE0]', text: 'text-[#2B2B2B]', textMuted: 'text-[#4A4340]', border: 'border-[#D6CCC2]/40', accent: 'bg-[#1A1210] text-[#E3D5CA]'
  }

  const navigate = useNavigate()
  const [fileToUpload, setFileToUpload] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

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

  const handleSubmit = async () => {
    setSubmitting(true)
    const formData = new FormData()
    if (fileToUpload) {
      formData.append('floorPlan', fileToUpload)
    }
    formData.append('estimationDetails', JSON.stringify({
      homeSize: estimationDetails.squareFeet,
      bhkType: estimationDetails.bhkType,
      totalEstimatedCost: estimationDetails.totalAmount,
      materialQuality: estimationDetails.materialQuality,
      packageType: estimationDetails.packageType,
      propertyType: estimationDetails.propertyType,
      city: estimationDetails.city,
      selectedRooms: estimationDetails.selectedRooms
    }))
    // We can also append selectedDesigns if we have a state for it

    try {
      await apiRequest(`/inquiries`, {
        method: 'POST',
        body: formData,
        isFormData: true
      })
      onClose()
      navigate('/client/dashboard')
    } catch (error) {
      console.error('Failed to submit inquiry:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full max-w-lg p-8 rounded-3xl ${theme.bg} border ${theme.border} shadow-2xl z-10 overflow-hidden`}
      >
        <button onClick={onClose} className={`absolute top-6 right-6 ${theme.textMuted} hover:${theme.text} transition-colors`}>
          <X className="w-6 h-6" />
        </button>

        <h3 className={`text-2xl font-bold ${theme.text} mb-2 font-nav-style`}>Request Final Quotation</h3>
        <p className={`text-sm ${theme.textMuted} mb-6 leading-relaxed`}>
          Send your configured estimate to our Admin. Please upload your floor plan so our team can map it to a 3D model and provide a final customized quotation.
        </p>

        <div 
          className={`w-full border-2 border-dashed ${fileToUpload ? 'border-emerald-500 bg-emerald-500/5' : `border-black/20 dark:border-white/20`} rounded-2xl p-8 transition-colors cursor-pointer text-center mb-6`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.dwg" />
          
          {fileToUpload ? (
            <div className="flex flex-col items-center">
              <FileText className="w-10 h-10 text-emerald-500 mb-3" />
              <h4 className={`font-bold text-sm ${theme.text} truncate max-w-[250px]`}>{fileToUpload.name}</h4>
              <p className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted} mt-2`}>{(fileToUpload.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className={`w-10 h-10 ${theme.textMuted} opacity-50 mb-3`} />
              <h4 className={`font-bold text-sm ${theme.text}`}>Upload Floor Plan (Optional)</h4>
              <p className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted} mt-2`}>PDF, PNG, JPG, DWG (Max 15MB)</p>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${theme.accent} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...</>
          ) : (
            <>Send Request to Admin <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

      </motion.div>
    </div>
  )
}
