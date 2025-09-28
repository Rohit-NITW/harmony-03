import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { motion } from 'framer-motion'
import LoadingSpinner from '../../components/LoadingSpinner'
import SafeImage from '../../components/SafeImage'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate(from, { replace: true })
    } catch (error: any) {
      setError('Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Branding */}
        <motion.div 
          className="hidden lg:flex lg:flex-col lg:justify-center lg:items-center lg:h-full lg:px-12 text-white"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12 max-w-lg">
            <motion.h1 
              className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Harmony
              <span className="block text-4xl mt-2">Admin Portal</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Secure administrative access to monitor, manage, and support student mental health initiatives.
            </motion.p>
          </div>
            
          <motion.div 
            className="space-y-8 max-w-md w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Analytics & Insights</h3>
                <p className="text-slate-300 text-sm leading-relaxed">Monitor platform usage, track student engagement, and analyze mental health trends</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">User Management</h3>
                <p className="text-slate-300 text-sm leading-relaxed">Manage student accounts, review support requests, and ensure user safety</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Content Management</h3>
                <p className="text-slate-300 text-sm leading-relaxed">Update resources, manage support groups, and maintain platform content</p>
              </div>
            </div>
          </motion.div>
          
          {/* Security badges */}
          <motion.div 
            className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🛡️</span>
              <span>Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔍</span>
              <span>Monitored</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-10 max-w-md mx-auto w-full lg:max-w-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-10">
            <motion.div 
              className="w-24 h-24 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-4xl text-white">🔐</span>
            </motion.div>
            <h2 className="text-4xl font-bold text-slate-800 mb-3">Admin Access</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Secure login to the administrative dashboard.<br/>
              <span className="text-sm text-slate-500">Authorized personnel only</span>
            </p>
          </div>

          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                placeholder="Enter admin email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                placeholder="Enter admin password"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-3 rounded-lg font-semibold hover:from-slate-800 hover:to-slate-950 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <LoadingSpinner size="sm" message="" /> : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Different role?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Student Login
              </Link>
              {' | '}
              <Link to="/volunteer/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Volunteer Login
              </Link>
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-4 text-center text-xs text-slate-500">
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">🛡️</span>
                <span>Admin Only Access</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">📊</span>
                <span>Activity Monitored</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}