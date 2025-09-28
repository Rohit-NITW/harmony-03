import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { motion } from 'framer-motion'
import LoadingSpinner from '../../components/LoadingSpinner'
import SafeImage from '../../components/SafeImage'

export default function StudentLogin() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/student/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: email,
          name: name,
          role: 'student',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        })
        
        navigate(from, { replace: true })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        navigate(from, { replace: true })
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Image and branding */}
        <motion.div 
          className="hidden lg:flex lg:flex-col lg:justify-center lg:items-center lg:h-full lg:px-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12 max-w-lg">
            <motion.h1 
              className="text-5xl font-bold text-slate-800 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Welcome to
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">Harmony</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Your mental health journey starts here. Join thousands of students taking control of their wellness.
            </motion.p>
          </div>
          
          <div className="relative flex-1 max-w-lg w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <SafeImage
                src="/assets/student-login-illustration.svg"
                alt="Students supporting mental health"
                className="w-full h-80 object-contain mx-auto"
                fallbackSrc="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'><defs><linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23dbeafe'/><stop offset='100%' stop-color='%23bfdbfe'/></linearGradient></defs><rect width='320' height='240' rx='12' fill='url(%23bg)'/><circle cx='160' cy='100' r='40' fill='%233b82f6' opacity='0.8'/><rect x='130' y='140' width='60' height='8' rx='4' fill='%233b82f6' opacity='0.6'/><rect x='140' y='155' width='40' height='6' rx='3' fill='%236366f1' opacity='0.4'/><text x='160' y='190' text-anchor='middle' font-size='14' fill='%233b82f6' font-family='Arial'>Student Portal</text></svg>"
              />
            </motion.div>
            
            {/* Floating badges */}
            <motion.div
              className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-full shadow-lg border border-green-100"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">Safe Space</span>
              </div>
            </motion.div>
            
            <motion.div
              className="absolute -bottom-4 -left-4 bg-white px-4 py-2 rounded-full shadow-lg border border-blue-100"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-blue-700">24/7 Support</span>
              </div>
            </motion.div>
          </div>
          
          {/* Trust indicators */}
          <motion.div 
            className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌟</span>
              <span>Trusted</span>
            </div>
            <div className="flex items-center gap-1">
              <span>❤️</span>
              <span>Caring</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto w-full lg:max-w-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-3xl text-white">🎓</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              {isSignUp ? 'Join Harmony' : 'Welcome Back'}
            </h2>
            <p className="text-slate-600 text-lg">
              {isSignUp ? 'Create your student account and start your wellness journey' : 'Sign in to continue your mental health journey'}
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
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </motion.div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm your password"
                  required
                />
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <LoadingSpinner size="sm" message="" /> : (isSignUp ? 'Create Account' : 'Sign In')}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Different role?{' '}
              <Link to="/volunteer/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Volunteer Login
              </Link>
              {' | '}
              <Link to="/admin/login" className="text-red-600 hover:text-red-700 font-medium">
                Admin Login
              </Link>
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-500">
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">🔒</span>
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">🌐</span>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">❤️</span>
                <span>Always Confidential</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}