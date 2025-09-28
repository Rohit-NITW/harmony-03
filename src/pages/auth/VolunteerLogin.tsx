import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { motion } from 'framer-motion'
import LoadingSpinner from '../../components/LoadingSpinner'
import SafeImage from '../../components/SafeImage'

export default function VolunteerLogin() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [bio, setBio] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/volunteer/dashboard'

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
        
        // Create volunteer document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: email,
          name: name,
          role: 'volunteer',
          bio: bio || '',
          specialties: specialties ? specialties.split(',').map(s => s.trim()) : [],
          isAvailableForChat: true,
          volunteerSince: serverTimestamp(),
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
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
              Volunteer with
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">Harmony</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Make a difference in your peers' mental health journey. Help create a supportive community.
            </motion.p>
          </div>
          
          <div className="relative flex-1 max-w-lg w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <SafeImage
                src="/assets/volunteer-login-illustration.svg"
                alt="Volunteers supporting mental health"
                className="w-full h-80 object-contain mx-auto"
                fallbackSrc="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'><defs><linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23faf5ff'/><stop offset='100%' stop-color='%23f3e8ff'/></linearGradient></defs><rect width='320' height='240' rx='12' fill='url(%23bg)'/><circle cx='120' cy='80' r='25' fill='%23a855f7' opacity='0.8'/><circle cx='200' cy='80' r='25' fill='%23ec4899' opacity='0.8'/><path d='M120,120 Q160,140 200,120' stroke='%23a855f7' stroke-width='4' fill='none' opacity='0.6'/><rect x='130' y='160' width='60' height='8' rx='4' fill='%23a855f7' opacity='0.6'/><rect x='140' y='175' width='40' height='6' rx='3' fill='%23ec4899' opacity='0.4'/><text x='160' y='210' text-anchor='middle' font-size='14' fill='%23a855f7' font-family='Arial'>Volunteer Portal</text></svg>"
              />
            </motion.div>
            
            {/* Floating badges */}
            <motion.div
              className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-full shadow-lg border border-purple-100"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-purple-700">Peer Support</span>
              </div>
            </motion.div>
            
            <motion.div
              className="absolute -bottom-4 -left-4 bg-white px-4 py-2 rounded-full shadow-lg border border-pink-100"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-pink-700">Anonymous Help</span>
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
              <span>🤝</span>
              <span>Supportive</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌟</span>
              <span>Impactful</span>
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
              className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-3xl text-white">🤝</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              {isSignUp ? 'Become a Volunteer' : 'Welcome Back'}
            </h2>
            <p className="text-slate-600 text-lg">
              {isSignUp ? 'Join our volunteer community and help support your peers' : 'Sign in to continue helping your community'}
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
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bio (Optional)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                    placeholder="Tell others about yourself and why you want to volunteer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Specialties (Optional)</label>
                  <input
                    type="text"
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="e.g., Anxiety, Depression, Academic Stress (comma separated)"
                  />
                  <p className="text-xs text-slate-500 mt-1">Separate multiple specialties with commas</p>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                isSignUp ? 'Become a Volunteer' : 'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Want to volunteer? Create an account'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Different role?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Student Login
              </Link>
              {' | '}
              <Link to="/admin/login" className="text-red-600 hover:text-red-700 font-medium">
                Admin Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}