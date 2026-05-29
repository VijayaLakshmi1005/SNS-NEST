import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { apiRequest } from '../utils/api'

const THEME = {
  light: {
    bg: 'bg-[#F5EBE0]',
    card: 'bg-[#E3D5CA]/80 backdrop-blur-xl border-[#D6CCC2]/60',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    input: 'bg-[#F5EBE0]/50 border-[#D6CCC2]/80 focus:border-[#2B2B2B]',
    button: 'bg-[#2B2B2B] text-[#F5EBE0] hover:bg-black',
  },
  dark: {
    bg: 'bg-[#1E1A17]',
    card: 'bg-[#2A241F]/80 backdrop-blur-xl border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    input: 'bg-[#1E1A17]/50 border-[#3A312B] focus:border-[#F5EBE0]',
    button: 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white',
  }
}

export default function ForgotPassword() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Email, 2: New Password
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSendLink = (e) => {
    e.preventDefault()
    if (!email) return;
    // Simulate sending email/OTP
    setStep(2)
  }

  const handleReset = (e) => {
    e.preventDefault()
    if (!newPassword) return;
    // Simulate password reset success
    setIsSuccess(true)
    setTimeout(() => {
      navigate('/auth/login')
    }, 2000)
  }

  return (
    <div className={`min-h-screen w-full flex ${theme.bg}`}>
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200"
          alt="Luxury Interior"
          className="absolute inset-0 w-full h-full object-cover grayscale-[30%]"
        />
        <div className="absolute bottom-12 left-12 z-20">
          <h2 className="text-4xl font-extrabold text-white tracking-wider mb-2">SNS NEST</h2>
          <p className="text-white/80 font-light tracking-widest text-sm uppercase">Secure Account Recovery</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-md p-8 sm:p-12 rounded-4xl border ${theme.card} shadow-2xl relative z-10`}
        >
          {isSuccess ? (
            <div className="text-center py-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className={`text-2xl font-extrabold ${theme.text} mb-3 font-nav-style`}>Password Reset!</h1>
              <p className={`text-sm ${theme.textMuted}`}>You can now login with your new password. Redirecting...</p>
            </div>
          ) : step === 1 ? (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h1 className={`text-3xl font-extrabold ${theme.text} mb-3 font-nav-style`}>Forgot Password</h1>
                <p className={`text-sm ${theme.textMuted}`}>Enter your email to reset your account password.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSendLink} noValidate>
                <div className="space-y-2">
                  <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted}`}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@snsnest.com"
                    className={`w-full px-5 py-4 rounded-xl border ${theme.input} text-sm transition-colors outline-none`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${theme.button}`}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h1 className={`text-3xl font-extrabold ${theme.text} mb-3 font-nav-style`}>New Password</h1>
                <p className={`text-sm ${theme.textMuted}`}>Create a secure password with the eye icon below to check it.</p>
              </div>

              <form className="space-y-6" onSubmit={handleReset} noValidate>
                <div className="space-y-2 relative">
                  <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted}`}>New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-5 py-4 rounded-xl border ${theme.input} text-sm transition-colors outline-none`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.textMuted} hover:opacity-80 transition-opacity`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-amber-600" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${theme.button}`}
                >
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {!isSuccess && (
            <div className="mt-8 text-center">
              <p className={`text-sm ${theme.textMuted}`}>
                Remembered your password?{' '}
                <Link to="/auth/login" className={`font-bold hover:underline ${theme.text}`}>Sign In</Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
