import React, { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { apiRequest } from '../utils/api'
import { 
  Calculator, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  MapPin, 
  Building2, 
  Sliders, 
  Info, 
  CreditCard,
  History,
  TrendingUp,
  Bookmark,
  Check,
  Percent,
  FileDown,
  Loader2,
  Send
} from 'lucide-react'

import SendInquiryModal from './SendInquiryModal'

const THEME = {
  light: {
    card: 'bg-[#E3D5CA]/50 border-[#D6CCC2]/40',
    cardInner: 'bg-[#F5EBE0]/80 border-[#D6CCC2]/20',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    accent: 'bg-[#C9B7A7]/50 text-[#2B2B2B]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  },
  dark: {
    card: 'bg-[#2A241F]/60 border-[#3A312B]',
    cardInner: 'bg-[#1E1A17]/80 border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    accent: 'bg-[#3A312B] text-[#F5EBE0]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
  }
}

// Standard Room Icons Mapping
const ROOM_ICONS = {
  'Living Room': '🛋️',
  'Bedroom': '🛏️',
  'Modular Kitchen': '🍳',
  'Wardrobes': '🚪',
  'Dining Area': '🍽️',
  'False Ceiling': '💡',
  'Bathroom Vanity': '🚿',
  'TV Unit': '📺',
  'Study Room': '📚',
  'Office Space': '💼'
}

export default function Estimate({ initialConfig, adminMode }) {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light
  
  const fileInputRef = useRef(null)
  const [adminFile, setAdminFile] = useState(null)
  const [adminDesigner, setAdminDesigner] = useState('')

  // 1. Backend Config States (Retrieved dynamically, NOT hardcoded)
  const [packages, setPackages] = useState([])
  const [materials, setMaterials] = useState([])
  const [history, setHistory] = useState([])
  const [loadingConfig, setLoadingConfig] = useState(true)

  // 2. Interactive Input States
  const [propertyType, setPropertyType] = useState(initialConfig?.propertyType || 'Apartment')
  const [bhkType, setBhkType] = useState(initialConfig?.bhkType || '2 BHK')
  const [squareFeet, setSquareFeet] = useState(initialConfig?.homeSize || 1000)
  const [city, setCity] = useState(initialConfig?.city || 'Bangalore')
  const [selectedRooms, setSelectedRooms] = useState(initialConfig?.selectedRooms || ['Living Room', 'Bedroom', 'Modular Kitchen'])
  const safePackageType = ['Essential', 'Premium', 'Luxury'].includes(initialConfig?.packageType || initialConfig?.quality) 
    ? (initialConfig?.packageType || initialConfig?.quality) 
    : 'Premium';

  const [packageType, setPackageType] = useState(safePackageType)
  const [materialQuality, setMaterialQuality] = useState(initialConfig?.materialQuality || 'Standard')

  // EMI Sub-state
  const [downPayment, setDownPayment] = useState(200000)
  const [tenureMonths, setTenureMonths] = useState(12)
  const [interestRate, setInterestRate] = useState(10.5)

  // 3. API Calculation Response States
  const [calculationResult, setCalculationResult] = useState(null)
  const [calculating, setCalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingStatus, setSavingStatus] = useState('')
  const [activeTab, setActiveTab] = useState('calculator') // 'calculator' | 'packages' | 'history'
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [manualBaseAmount, setManualBaseAmount] = useState('')
  const [manualRoomCosts, setManualRoomCosts] = useState({})

  useEffect(() => {
    if (calculationResult?.rooms) {
      setManualRoomCosts(prev => {
        const next = { ...prev };
        let changed = false;
        calculationResult.rooms.forEach(r => {
          if (next[r.name] === undefined) {
            next[r.name] = r.cost;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [calculationResult?.rooms])

  useEffect(() => {
    if (calculationResult?.subtotal) {
      // Only set it if it's currently empty, to not override admin's manual input if they are actively editing
      setManualBaseAmount(prev => prev === '' ? calculationResult.subtotal.toString() : prev);
    }
  }, [calculationResult?.subtotal])

  // Supported cities list
  const cities = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Others']

  // Initial Configuration Fetching
  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        setLoadingConfig(true)
        const [pkgRes, matRes, histRes] = await Promise.all([
          apiRequest('/estimator/packages'),
          apiRequest('/estimator/materials'),
          apiRequest('/estimator/history')
        ])
        setPackages(pkgRes.data || [])
        setMaterials(matRes.data || [])
        setHistory(histRes.data || [])
      } catch (err) {
        console.error('Error fetching estimator config:', err)
      } finally {
        setLoadingConfig(false)
      }
    }
    fetchConfiguration()
  }, [])

  // Dynamic Live Calculation trigger whenever any input parameter changes (NO frontend-side math!)
  useEffect(() => {
    const triggerCalculation = async () => {
      setCalculating(true)
      try {
        const payload = {
          propertyType,
          bhkType,
          squareFeet,
          city,
          rooms: selectedRooms,
          packageType,
          materialQuality,
          emiDetails: {
            downPayment,
            tenureMonths,
            interestRate
          }
        }
        const res = await apiRequest('/estimator/calculate', {
          method: 'POST',
          body: payload
        })
        setCalculationResult(res.data)
      } catch (err) {
        console.error('Calculation failed:', err)
      } finally {
        setCalculating(false)
      }
    }

    if (selectedRooms.length > 0) {
      const delayDebounceFn = setTimeout(() => {
        triggerCalculation()
      }, 300)
      return () => clearTimeout(delayDebounceFn)
    }
  }, [
    propertyType,
    bhkType,
    squareFeet,
    city,
    selectedRooms,
    packageType,
    materialQuality,
    downPayment,
    tenureMonths,
    interestRate
  ])

  // Calculated derived display values
  const displaySubtotal = adminMode && calculationResult?.rooms
    ? calculationResult.rooms.reduce((sum, r) => sum + Number(manualRoomCosts[r.name] !== undefined ? manualRoomCosts[r.name] : r.cost), 0)
    : (calculationResult?.subtotal || 0);

  const displayGst = displaySubtotal * 0.18;
  const displayTotal = displaySubtotal + displayGst;

  // Adjust standard Square Feet when BHK shifts to keep inputs realistic
  const handleBhkChange = (bhk) => {
    setBhkType(bhk)
    const defaults = {
      '1 BHK': 600,
      '2 BHK': 1000,
      '3 BHK': 1500,
      '4 BHK': 2000,
      'Villa': 3000,
      'Office': 1200
    }
    setSquareFeet(defaults[bhk] || 1000)
  }

  // Toggle selected rooms list
  const handleRoomToggle = (room) => {
    if (selectedRooms.includes(room)) {
      if (selectedRooms.length > 1) {
        setSelectedRooms(prev => prev.filter(r => r !== room))
      }
    } else {
      setSelectedRooms(prev => [...prev, room])
    }
  }

  // Save quotation to backend database and update local history
  const handleSaveQuotation = async () => {
    setSaving(true)
    setSavingStatus('securing')
    try {
      const payload = {
        propertyType,
        bhkType,
        squareFeet,
        city,
        rooms: selectedRooms,
        packageType,
        materialQuality,
        saveEstimate: true,
        emiDetails: {
          downPayment,
          tenureMonths,
          interestRate
        }
      }
      const res = await apiRequest('/estimator/calculate', {
        method: 'POST',
        body: payload
      })
      
      setSavingStatus('success')
      // Refresh History list
      const histRes = await apiRequest('/estimator/history')
      setHistory(histRes.data || [])
      
      setTimeout(() => {
        setSavingStatus('')
      }, 3000)
    } catch (err) {
      console.error('Failed to save estimate:', err)
      setSavingStatus('error')
      setTimeout(() => {
        setSavingStatus('')
      }, 3000)
    } finally {
      setSaving(false)
    }
  }

  // Download PDF quotation
  const handleDownloadPDF = async (savedId = null) => {
    try {
      const payload = savedId 
        ? { estimateId: savedId }
        : {
            propertyType,
            bhkType,
            squareFeet,
            city,
            rooms: selectedRooms,
            packageType,
            materialQuality,
            subtotal: displaySubtotal,
            gst: displayGst,
            totalAmount: displayTotal,
            manualRoomCosts
          }

      // We make a custom request with axios to specify blob type
      const response = await apiRequest('/estimator/download-pdf', {
        method: 'POST',
        body: payload,
        responseType: 'blob'
      })

      // Convert to blob and trigger direct browser download
      const blob = new Blob([response], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `SNS_NEST_Estimate_${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('PDF download error:', err)
    }
  }

  // Format currency helper for beautiful Indian formatting
  const formatINR = (val) => {
    if (!val) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  // Convert big values to Lakhs/Crores readable format
  const formatFriendlyINR = (val) => {
    if (!val) return '₹0'
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs`
    }
    return formatINR(val)
  }

  const generatePdfBlob = async () => {
    try {
      const payload = {
        propertyType,
        bhkType,
        squareFeet,
        city,
        rooms: selectedRooms,
        packageType,
        materialQuality,
        subtotal: displaySubtotal,
        gst: displayGst,
        totalAmount: displayTotal,
        manualRoomCosts
      };
      const response = await apiRequest('/estimator/download-pdf', {
        method: 'POST',
        body: payload,
        responseType: 'blob'
      });
      return new Blob([response], { type: 'application/pdf' });
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  if (loadingConfig) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className={`w-10 h-10 animate-spin ${theme.text}`} />
        <p className={`text-sm tracking-widest uppercase ${theme.textMuted}`}>Calibrating Luxury Index...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full pb-20 max-w-7xl mx-auto px-4 md:px-6">
      
      {/* Top Banner & Editorial Intro */}
      <div className="text-center mb-10">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.accent} mb-4`}>
          <Sparkles className="w-3.5 h-3.5" />
          Fintech Estimator
        </div>
        <h1 className={`text-4xl lg:text-6xl font-extrabold tracking-tight ${theme.text} mb-3 font-nav-style`}>
          Cost Estimation Module
        </h1>
        <p className={`text-xs md:text-sm ${theme.textMuted} max-w-2xl mx-auto leading-relaxed`}>
          Intelligent, production-grade estimation tailored for the Indian Market. Compare package configurations, analyze dynamic local pricing multipliers, and configure live room specifications.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 mb-10 items-stretch sm:items-center max-w-md sm:max-w-2xl mx-auto">
        {['calculator', 'packages', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex-1 text-center ${
              activeTab === tab
                ? `${isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]'} shadow-lg scale-[1.02]`
                : `${theme.cardInner} hover:bg-black/5 dark:hover:bg-white/5 ${theme.text}`
            }`}
          >
            {tab === 'calculator' && 'Interactive Estimator'}
            {tab === 'packages' && 'Package & Material Specs'}
            {tab === 'history' && `Saved Quotations (${history.length})`}
          </button>
        ))}
      </div>

      {/* Dynamic Content Rendering */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: THE INTERACTIVE ESTIMATOR */}
        {activeTab === 'calculator' && (
          <motion.div
            key="calculator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Control Column (Property Details, Rooms, Quality) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Card 1: Property Specs */}
              <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className={`w-5 h-5 ${theme.text}`} />
                  <h3 className={`text-lg font-bold ${theme.text}`}>Property Blueprint</h3>
                </div>

                <div className="space-y-6">
                  {/* Property Type Choice */}
                  <div>
                    <label className={`text-[10px] uppercase tracking-widest font-bold ${theme.textMuted} block mb-3`}>Property classification</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Apartment', 'Villa', 'Office'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setPropertyType(type)}
                          className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                            propertyType === type
                              ? `${isNight ? 'bg-[#3A312B] border-white text-white' : 'bg-[#E3D5CA] border-black text-black'}`
                              : `${theme.cardInner} ${theme.text} hover:scale-[1.02]`
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BHK Configuration Choice */}
                  <div>
                    <label className={`text-[10px] uppercase tracking-widest font-bold ${theme.textMuted} block mb-3`}>Room layout</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Office'].map((bhk) => (
                        <button
                          key={bhk}
                          onClick={() => handleBhkChange(bhk)}
                          className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                            bhkType === bhk
                              ? `${isNight ? 'bg-[#3A312B] border-white text-white' : 'bg-[#E3D5CA] border-black text-black'}`
                              : `${theme.cardInner} ${theme.text} hover:scale-[1.02]`
                          }`}
                        >
                          {bhk}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Square Footage Slider */}
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <label className={`text-[10px] uppercase tracking-widest font-bold ${theme.textMuted}`}>Square feet area</label>
                      <span className={`text-base font-bold ${theme.text}`}>{squareFeet.toLocaleString('en-IN')} SQ.FT</span>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="10000"
                      step="50"
                      value={squareFeet}
                      onChange={(e) => setSquareFeet(Number(e.target.value))}
                      className="w-full h-2 bg-stone-300 dark:bg-stone-700 rounded-full appearance-none cursor-pointer accent-stone-800 dark:accent-stone-200"
                    />
                  </div>

                  {/* City Selection */}
                  <div className="pt-4 border-t border-black/10 dark:border-white/10">
                    <div>
                      <label className={`text-[10px] uppercase tracking-widest font-bold ${theme.textMuted} block mb-2`}>Execution city</label>
                      <div className="relative max-w-xs">
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold outline-none cursor-pointer ${theme.cardInner} ${theme.text}`}
                        >
                          {['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Others'].map((c) => (
                            <option key={c} value={c} className="bg-stone-900 text-stone-200">{c}</option>
                          ))}
                        </select>
                        <MapPin className={`absolute right-3 top-3 w-4 h-4 ${theme.textMuted} pointer-events-none`} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Card 2: Selected Rooms checklist */}
              <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Sliders className={`w-5 h-5 ${theme.text}`} />
                    <h3 className={`text-lg font-bold ${theme.text}`}>Room Wise Customizations</h3>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${theme.accent}`}>
                    {selectedRooms.length} Selected
                  </span>
                </div>

                <p className={`text-xs ${theme.textMuted} mb-6`}>
                  Toggle room spaces below. Each space calculates modular woodwork, fittings, and finishes dynamically according to the chosen package and room configurations.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(ROOM_ICONS).map((room) => {
                    const isSelected = selectedRooms.includes(room)
                    return (
                      <button
                        key={room}
                        onClick={() => handleRoomToggle(room)}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          isSelected
                            ? `${isNight ? 'bg-[#3A312B]/90 border-white' : 'bg-[#E3D5CA]/90 border-black'} shadow-sm`
                            : `${theme.cardInner} opacity-70 hover:opacity-100 hover:scale-[1.02]`
                        }`}
                      >
                        <span className="text-xl shrink-0">{ROOM_ICONS[room]}</span>
                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold ${theme.text} truncate`}>{room}</h4>
                          <span className={`text-[8px] uppercase font-semibold ${theme.textMuted}`}>
                            {isSelected ? 'Activated' : 'Click to add'}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Card 3: Material & Package Selections */}
              <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
                <div className="flex items-center gap-3 mb-6">
                  <Layers className={`w-5 h-5 ${theme.text}`} />
                  <h3 className={`text-lg font-bold ${theme.text}`}>Package Tier & Finishes</h3>
                </div>

                <div className="space-y-6">
                  {/* Select Package Type */}
                  <div>
                    <label className={`text-[10px] uppercase tracking-widest font-bold ${theme.textMuted} block mb-3`}>Selected Design Tier</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Essential', 'Premium', 'Luxury'].map((pkg) => (
                        <button
                          key={pkg}
                          onClick={() => setPackageType(pkg)}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            packageType === pkg
                              ? `${isNight ? 'bg-[#3A312B] border-white text-white' : 'bg-[#E3D5CA] border-black text-black'}`
                              : `${theme.cardInner} ${theme.text} hover:scale-[1.02]`
                          }`}
                        >
                          <h4 className="text-xs font-bold uppercase tracking-wider mb-1">{pkg}</h4>
                          <span className={`text-[8px] opacity-75`}>
                            {pkg === 'Essential' ? '5 Yr Warranty' : pkg === 'Premium' ? '10 Yr Warranty' : '15 Yr Warranty'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Material Quality */}
                  <div>
                    <label className={`text-[10px] uppercase tracking-widest font-bold ${theme.textMuted} block mb-3`}>Material Specification quality</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Basic', 'Standard', 'Premium', 'Luxury'].map((grade) => (
                        <button
                          key={grade}
                          onClick={() => setMaterialQuality(grade)}
                          className={`py-2.5 px-2 rounded-lg border text-center transition-all ${
                            materialQuality === grade
                              ? `${isNight ? 'bg-[#3A312B] border-white text-white' : 'bg-[#E3D5CA] border-black text-black'}`
                              : `${theme.cardInner} ${theme.text} text-[10px] font-bold hover:scale-[1.02]`
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Cost Panel Column */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className={`sticky top-8 p-6 md:p-8 rounded-3xl border ${isNight ? 'bg-[#1E1A17] border-[#3A312B] text-stone-200' : 'bg-[#E3D5CA]/70 border-[#D6CCC2]/70 text-[#2B2B2B]'} shadow-2xl transition-all duration-350`}>
                
                {/* Header info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Calculator className={`w-5 h-5 ${isNight ? 'text-[#E3D5CA]' : 'text-[#4A4340]'}`} />
                    <h3 className={`text-base font-bold uppercase tracking-wider ${isNight ? 'text-[#F5EBE0]' : 'text-[#2B2B2B]'}`}>Financial Summary</h3>
                  </div>
                  {calculating && (
                    <div className={`flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold ${isNight ? 'text-[#C9B7A7]' : 'text-[#4A4340]/80'}`}>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Live Recalculating...
                    </div>
                  )}
                </div>

                {/* Subtotals & Taxes */}
                <div className={`space-y-3.5 mb-6 text-sm border-b ${isNight ? 'border-stone-850' : 'border-[#D6CCC2]/50'} pb-5`}>
                  <div className={`flex justify-between items-center ${isNight ? 'text-stone-400' : 'text-[#4A4340]/90'}`}>
                    <span>Base Room Subtotal</span>
                    <span className="font-semibold">{formatINR(displaySubtotal)}</span>
                  </div>

                  {/* Room Wise Breakdown Dropdown list */}
                  <div className={`pl-3 border-l ${isNight ? 'border-stone-800' : 'border-[#D6CCC2]/50'} space-y-2 py-1 text-xs ${isNight ? 'text-stone-500' : 'text-[#4A4340]/80'}`}>
                    {calculationResult?.rooms?.map((r) => (
                      <div key={r.name} className="flex justify-between items-center">
                        <span>{r.name}</span>
                        {adminMode ? (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[10px]">₹</span>
                            <input
                              type="number"
                              value={manualRoomCosts[r.name] !== undefined ? manualRoomCosts[r.name] : r.cost}
                              onChange={(e) => setManualRoomCosts(prev => ({...prev, [r.name]: e.target.value}))}
                              className={`w-20 px-1 py-0.5 bg-transparent border-b text-right font-semibold focus:outline-none ${isNight ? 'border-stone-600 focus:border-white' : 'border-stone-400 focus:border-black'}`}
                            />
                          </div>
                        ) : (
                          <span className="font-medium">{formatINR(r.cost)}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className={`flex justify-between ${isNight ? 'text-stone-400' : 'text-[#4A4340]/90'}`}>
                    <span>Taxes & GST (18%)</span>
                    <span className="font-semibold">{formatINR(displayGst)}</span>
                  </div>
                </div>

                {/* grand total */}
                <div className={`p-5 rounded-2xl ${isNight ? 'bg-stone-900/60 border border-stone-850' : 'bg-[#F5EBE0] border border-[#D6CCC2]/60'} mb-6`}>
                  <span className={`text-[10px] uppercase tracking-widest font-bold block mb-1 ${isNight ? 'text-stone-400' : 'text-[#4A4340]/80'}`}>Estimated Grand Total (INR)</span>
                  <div className={`text-3xl font-extrabold font-mono tracking-tight flex items-baseline gap-2 ${isNight ? 'text-[#F5EBE0]' : 'text-[#2B2B2B]'}`}>
                    {formatINR(displayTotal)}
                    <span className={`text-xs font-normal ${isNight ? 'text-stone-500' : 'text-[#4A4340]/60'}`}>
                      ({formatFriendlyINR(displayTotal)})
                    </span>
                  </div>
                  <p className={`text-[10px] mt-2 ${isNight ? 'text-stone-500' : 'text-[#4A4340]/60'}`}>
                    *Comprehensive pricing including designer consultations, modular materials, accessories & execution logistics.
                  </p>
                </div>

                {/* Budget Comparison Upgrades */}
                {calculationResult?.recommendations?.length > 0 && (
                  <div className={`mb-6 p-4 rounded-xl text-xs ${isNight ? 'bg-[#3A312B]/40 border border-[#817773]/30 text-[#E3D5CA]' : 'bg-[#F5EBE0]/60 border border-[#D6CCC2]/40 text-[#4A4340]'}`}>
                    <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider">
                      <Sparkles className={`w-3.5 h-3.5 ${isNight ? 'text-yellow-400' : 'text-amber-600'}`} />
                      Smart Advisory Suggestions
                    </div>
                    {calculationResult.recommendations.map((rec, i) => (
                      <div key={i} className="mb-2 last:mb-0">
                        <span className={`font-bold block ${isNight ? 'text-white' : 'text-[#2B2B2B]'}`}>{rec.title}</span>
                        <span className={`mt-0.5 block leading-relaxed ${isNight ? 'text-stone-450' : 'text-[#4A4340]/90'}`}>{rec.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* EMI Estimator Removed as per client request */}

                {/* Action buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleDownloadPDF()}
                    className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'}`}
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Quotation
                  </button>

                  <button
                    onClick={handleSaveQuotation}
                    disabled={saving}
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all border active:scale-95 ${
                      savingStatus === 'success'
                        ? 'bg-green-600 text-white border-green-600'
                        : isNight
                        ? 'bg-transparent text-stone-300 border-stone-800 hover:bg-stone-900'
                        : 'bg-transparent text-[#2B2B2B] border-[#D6CCC2] hover:bg-[#D6CCC2]/20'
                    }`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving Quote...
                      </>
                    ) : savingStatus === 'success' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Saved in Database!
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        Save Calculation
                      </>
                    )}
                  </button>

                  {/* Action: Send to Admin or Send Final Proposal (Admin Mode) */}
                  {adminMode ? (
                    <div className="space-y-4 pt-4 border-t border-[#D6CCC2]/50">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4A4340] mb-2">Mapped 3D Model (Optional)</label>
                        <div 
                          className={`w-full border-2 border-dashed ${adminFile ? 'border-emerald-500 bg-emerald-50' : 'border-[#e5e5e0]'} rounded-xl p-4 text-center cursor-pointer`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => setAdminFile(e.target.files[0])} accept=".png,.jpg,.jpeg,.pdf,.zip" />
                          {adminFile ? (
                            <span className="font-bold text-emerald-600 text-xs">{adminFile.name}</span>
                          ) : (
                            <span className="text-[#8b8175] text-xs font-semibold flex items-center justify-center gap-2">Click to upload 3D render</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4A4340] mb-2">Assign Designer</label>
                        <select 
                          value={adminDesigner}
                          onChange={(e) => setAdminDesigner(e.target.value)}
                          className="w-full p-2.5 text-xs font-semibold border border-[#e5e5e0] rounded-xl outline-none focus:border-[#1c1c1c] bg-transparent"
                        >
                          <option value="">-- Select Designer --</option>
                          {adminMode.designers?.map(d => (
                            <option key={d._id} value={d._id}>{d.fullName}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={async () => {
                          const pdfBlob = await generatePdfBlob();
                          adminMode.onSendProposal(adminFile, adminDesigner, displayTotal, pdfBlob, manualRoomCosts, { subtotal: displaySubtotal, gst: displayGst });
                        }}
                        className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${isNight ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                      >
                        <Send className="w-4 h-4" />
                        Send Proposal & PDF Quote
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${isNight ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                    >
                      <Send className="w-4 h-4" />
                      Send Request to Admin
                    </button>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: PACKAGES COMPARISON TABLE */}
        {activeTab === 'packages' && (
          <motion.div
            key="packages"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12"
          >
            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div 
                  key={pkg.name}
                  className={`p-6 rounded-3xl border ${
                    packageType === pkg.name 
                      ? `${isNight ? 'bg-[#3A312B]/40 border-white' : 'bg-[#E3D5CA]/50 border-black'}`
                      : `${theme.card} backdrop-blur-md`
                  } flex flex-col justify-between`}
                >
                  <div>
                    <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${theme.accent}`}>
                      {pkg.warranty}
                    </span>
                    <h3 className={`text-xl font-bold ${theme.text} mt-4`}>{pkg.name} Package</h3>
                    <p className={`text-xs ${theme.textMuted} mt-1 mb-6 italic`}>{pkg.tagline}</p>

                    <div className="space-y-4 text-xs">
                      <div>
                        <span className={`font-bold block ${theme.text}`}>Base Materials</span>
                        <span className={`block ${theme.textMuted} mt-0.5`}>{pkg.materials}</span>
                      </div>
                      <div>
                        <span className={`font-bold block ${theme.text}`}>Furniture Standards</span>
                        <span className={`block ${theme.textMuted} mt-0.5`}>{pkg.furniture}</span>
                      </div>
                      <div>
                        <span className={`font-bold block ${theme.text}`}>Decorative Finishes</span>
                        <span className={`block ${theme.textMuted} mt-0.5`}>{pkg.decor}</span>
                      </div>
                      <div>
                        <span className={`font-bold block ${theme.text}`}>Installation Services</span>
                        <span className={`block ${theme.textMuted} mt-0.5`}>{pkg.installation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-black/10 dark:border-white/10">
                    <button
                      onClick={() => {
                        setPackageType(pkg.name)
                        setActiveTab('calculator')
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        packageType === pkg.name
                          ? `${isNight ? 'bg-white text-black' : 'bg-black text-white'}`
                          : `${theme.cardInner} ${theme.text} border border-transparent hover:border-current`
                      }`}
                    >
                      {packageType === pkg.name ? 'Active Choice' : 'Select for Estimate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Materials Detail Cards */}
            <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
              <div className="flex items-center gap-3 mb-6">
                <Layers className={`w-5 h-5 ${theme.text}`} />
                <h3 className={`text-lg font-bold ${theme.text}`}>Dynamic Material Library Specifications</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {materials.map((cat) => (
                  <div key={cat.category} className={`p-4 rounded-2xl ${theme.cardInner} space-y-4`}>
                    <h4 className={`text-sm font-bold uppercase tracking-wider border-b border-black/10 dark:border-white/10 pb-2 ${theme.text}`}>
                      {cat.category}
                    </h4>
                    <div className="space-y-3.5">
                      {cat.options.map((opt) => (
                        <div key={opt.grade} className="text-xs">
                          <span className={`font-bold inline-flex items-center gap-1.5 uppercase tracking-wider ${
                            materialQuality === opt.grade ? 'text-amber-500' : theme.text
                          }`}>
                            {opt.grade} Quality
                            {materialQuality === opt.grade && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                          </span>
                          <p className={`mt-0.5 ${theme.textMuted} leading-relaxed`}>{opt.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ESTIMATION HISTORY */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {history.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
                <History className={`w-12 h-12 mx-auto ${theme.textMuted} mb-4 opacity-50`} />
                <h3 className={`text-lg font-bold ${theme.text}`}>No Quotations Saved Yet</h3>
                <p className={`text-xs ${theme.textMuted} max-w-sm mx-auto mt-2 leading-relaxed`}>
                  Once you configure details in the Interactive Estimator tab and click "Save Calculation", they will be securely stored here in the database.
                </p>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="mt-6 px-6 py-2.5 rounded-full bg-stone-850 hover:bg-stone-900 transition-colors text-xs font-bold uppercase tracking-wider text-stone-200"
                >
                  Start Estimating Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {history.map((item) => (
                  <div key={item._id} className={`p-6 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${theme.accent}`}>
                            {item.city} Multiplier Factor
                          </span>
                          <h4 className={`text-base font-bold ${theme.text} mt-2`}>
                            {item.propertyType} - {item.bhkType}
                          </h4>
                          <span className={`text-[10px] ${theme.textMuted}`}>
                            Saved on {new Date(item.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${theme.text} font-mono block`}>
                            {formatINR(item.totalAmount)}
                          </span>
                          <span className={`text-[9px] uppercase tracking-wider ${theme.textMuted}`}>
                            {item.packageType} Tier
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-3 border-t border-b border-black/10 dark:border-white/10 my-4">
                        <div>
                          <span className={`text-[10px] ${theme.textMuted} block`}>Area sq.ft</span>
                          <span className={`font-bold ${theme.text}`}>{item.squareFeet} sq.ft</span>
                        </div>
                        <div>
                          <span className={`text-[10px] ${theme.textMuted} block`}>Material Quality</span>
                          <span className={`font-bold ${theme.text}`}>{item.materialQuality} Grade</span>
                        </div>
                        <div className="col-span-2 pt-1.5">
                          <span className={`text-[10px] ${theme.textMuted} block mb-1`}>Included Spaces</span>
                          <div className="flex flex-wrap gap-1">
                            {item.rooms.map((r) => (
                              <span key={r.name} className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded text-[9px] font-semibold text-stone-600 dark:text-stone-400">
                                {r.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-2">
                      <button
                        onClick={() => {
                          setPropertyType(item.propertyType)
                          setBhkType(item.bhkType)
                          setSquareFeet(item.squareFeet)
                          setCity(item.city)
                          setSelectedRooms(item.rooms.map(r => r.name))
                          setPackageType(item.packageType)
                          setMaterialQuality(item.materialQuality)
                          if (item.emiDetails) {
                            setDownPayment(item.emiDetails.downPayment || 200000)
                            setTenureMonths(item.emiDetails.tenureMonths || 12)
                            setInterestRate(item.emiDetails.interestRate || 10.5)
                          }
                          setActiveTab('calculator')
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${theme.cardInner} ${theme.text} hover:scale-[1.02] transition-transform text-center`}
                      >
                        Restore Inputs
                      </button>

                      <button
                        onClick={() => handleDownloadPDF(item._id)}
                        className="py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-stone-850 hover:bg-stone-900 text-stone-100 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        PDF Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      <SendInquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        estimationDetails={{
          squareFeet,
          bhkType,
          totalAmount: calculationResult?.totalAmount,
          materialQuality,
          packageType,
          propertyType,
          city,
          selectedRooms
        }}
      />

    </div>
  )
}
