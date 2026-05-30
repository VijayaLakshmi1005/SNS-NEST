import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../../store/useAuthStore'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

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

import { apiRequest } from '../utils/api'

export default function Login() {
  const { isNight } = useThemeStore()
  const login = useAuthStore(state => state.login)
  const theme = isNight ? THEME.dark : THEME.light
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        data: { email, password }
      });
      if (res && res.data && res.data.accessToken) {
        login(res.data.user, res.data.accessToken);
        navigate(res.data.redirectPath || '/client/dashboard');
      } else {
        setError('Login failed: Invalid server response.');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    }
  }

  return (
    <div className={`min-h-screen w-full flex ${theme.bg}`}>
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200"
          alt="Luxury Interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20">
          <h2 className="text-4xl font-extrabold text-white tracking-wider mb-2">SNS NEST</h2>
          <p className="text-white/80 font-light tracking-widest text-sm uppercase">Find & Design Solutions</p>
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
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 flex flex-col items-center">
            <h2 className={`text-2xl font-extrabold tracking-wider ${theme.text}`}>SNS NEST</h2>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className={`text-3xl font-extrabold ${theme.text} mb-3 font-nav-style`}>Welcome Back</h1>
            <p className={`text-sm ${theme.textMuted}`}>Enter your credentials to access your luxury spaces.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin} noValidate>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted}`}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@snsnest.com"
                className={`w-full px-5 py-4 rounded-xl border ${theme.input} text-sm transition-colors outline-none`}
              />
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted}`}>Password</label>
                <Link to="/auth/forgot" className={`text-xs font-semibold hover:underline ${theme.textMuted}`}>Forgot?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-5 py-4 rounded-xl border ${theme.input} text-sm transition-colors outline-none`}
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
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${theme.button}`}
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className={`text-sm ${theme.textMuted}`}>
              Don't have an account?{' '}
              <Link to="/auth/register" className={`font-bold hover:underline ${theme.text}`}>Sign Up</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
