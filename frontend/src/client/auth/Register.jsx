import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
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

export default function Register() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (!name || !email || !mobile || !password || !location) {
        throw new Error('Please fill in all fields')
      }

      // 1. Try to register the user on the backend
      const regRes = await apiRequest('/auth/register', {
        method: 'POST',
        data: { fullName: name, email, mobile, password, location, role: 'client' }
      });

      if (!regRes.success && regRes.message) {
        throw new Error(regRes.message)
      }

      // 2. Immediately log in with the credentials
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        data: { email, password }
      });

      if (res && res.data && res.data.accessToken) {
        localStorage.setItem('token', res.data.accessToken);
        navigate('/client/dashboard');
      } else {
        throw new Error('Registration successful, but failed to log in automatically.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen w-full flex ${theme.bg}`}>
      {/* Right side - Image (Flipped for Register) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden order-2">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200"
          alt="Luxury Architecture"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-12 right-12 text-right z-20">
          <h2 className="text-4xl font-extrabold text-white tracking-wider mb-2">SNS NEST</h2>
          <p className="text-white/80 font-light tracking-widest text-sm uppercase">Crafting Your Vision</p>
        </div>
      </div>

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative order-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-md p-8 sm:p-12 rounded-4xl border ${theme.card} shadow-2xl relative z-10`}
        >
          <div className="mb-8 text-center lg:text-left">
            <h1 className={`text-3xl font-extrabold ${theme.text} mb-3 font-nav-style`}>Create Account</h1>
            <p className={`text-sm ${theme.textMuted}`}>Begin your premium interior design journey.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister} noValidate>
            <div className="space-y-2">
              <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted}`}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Designer"
                className={`w-full px-5 py-3.5 rounded-xl border ${theme.input} text-sm transition-colors outline-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted}`}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@..."
                  className={`w-full px-5 py-3.5 rounded-xl border ${theme.input} text-sm transition-colors outline-none`}
                />
              </div>
              <div className="space-y-2">
                <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted}`}>Mobile</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765..."
                  className={`w-full px-5 py-3.5 rounded-xl border ${theme.input} text-sm transition-colors outline-none`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted}`}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                className={`w-full px-5 py-3.5 rounded-xl border ${theme.input} text-sm transition-colors outline-none`}
              />
            </div>

            <div className="space-y-2 relative">
              <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted}`}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-5 py-3.5 rounded-xl border ${theme.input} text-sm transition-colors outline-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.textMuted} hover:opacity-80`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${theme.button} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span>{loading ? 'Creating Account...' : 'Join Now'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className={`text-sm ${theme.textMuted}`}>
              Already have an account?{' '}
              <Link to="/auth/login" className={`font-bold hover:underline ${theme.text}`}>Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
