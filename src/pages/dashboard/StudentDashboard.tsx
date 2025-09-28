import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import SafeImage from '../../components/SafeImage'
import LoadingSpinner from '../../components/LoadingSpinner'
import { getUserActivityStats, trackUserActivity } from '../../services/firebase'
import ActivitySummary from '../../components/ActivitySummary'

interface QuickAction {
  title: string
  description: string
  icon: string
  color: string
  link: string
  gradient: string
}

interface RecentActivity {
  type: string
  title: string
  time: string
  icon: string
  color: string
}

interface ActivityStats {
  activityStreak: number
  daysActive: number
  lastActiveDate: string | null
  activityCounts: {
    assessments: number
    resourcesRead: number
    peerChats: number
    totalActivities: number
  }
  recentActivities: any[]
}

export default function StudentDashboard() {
  const { userData, currentUser, logout } = useAuth()
  const [greeting, setGreeting] = useState('')
  const [loading, setLoading] = useState(true)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeDashboard = async () => {
      const hour = new Date().getHours()
      if (hour < 12) setGreeting('Good morning')
      else if (hour < 18) setGreeting('Good afternoon')
      else setGreeting('Good evening')
      
      // Track login activity if user is available
      if (currentUser?.uid) {
        try {
          // Track login activity
          await trackUserActivity(currentUser.uid, 'login', {
            timestamp: new Date().toISOString(),
            source: 'dashboard_visit'
          })
          
          // Load activity stats
          const statsResult = await getUserActivityStats(currentUser.uid)
          if (statsResult.success) {
            setActivityStats(statsResult.data)
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error)
        }
      }
      
      setTimeout(() => setLoading(false), 1000)
    }
    
    initializeDashboard()
  }, [currentUser])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const quickActions: QuickAction[] = [
    {
      title: 'Mental Health Assessment',
      description: 'Check your current mental wellness',
      icon: '🧠',
      color: 'from-blue-500 to-cyan-500',
      link: '/assessment',
      gradient: 'bg-gradient-to-r from-blue-50 to-cyan-50'
    },
    {
      title: 'Browse Resources',
      description: 'Articles, videos, and tools',
      icon: '📚',
      color: 'from-emerald-500 to-teal-500',
      link: '/resources',
      gradient: 'bg-gradient-to-r from-emerald-50 to-teal-50'
    },
    {
      title: 'Peer Support Chat',
      description: 'Anonymous chat with volunteers',
      icon: '🤝',
      color: 'from-purple-500 to-pink-500',
      link: '/peer-support',
      gradient: 'bg-gradient-to-r from-purple-50 to-pink-50'
    },
    {
      title: 'Track Progress',
      description: 'Monitor your wellness journey',
      icon: '📊',
      color: 'from-indigo-500 to-purple-500',
      link: '/progress',
      gradient: 'bg-gradient-to-r from-indigo-50 to-purple-50'
    },
    {
      title: 'Find Professional Help',
      description: 'Connect with licensed therapists',
      icon: '👨‍⚕️',
      color: 'from-orange-500 to-red-500',
      link: '/find-help',
      gradient: 'bg-gradient-to-r from-orange-50 to-red-50'
    },
    {
      title: 'Crisis Support',
      description: '24/7 emergency assistance',
      icon: '🆘',
      color: 'from-red-500 to-pink-500',
      link: '/crisis',
      gradient: 'bg-gradient-to-r from-red-50 to-pink-50'
    }
  ]

  // Generate recent activities from activity stats
  const generateRecentActivities = (): RecentActivity[] => {
    if (!activityStats?.recentActivities || activityStats.recentActivities.length === 0) {
      return [
        {
          type: 'Welcome',
          title: 'Welcome to Harmony!',
          time: 'Just now',
          icon: '👋',
          color: 'text-blue-600'
        },
        {
          type: 'Tip',
          title: 'Take your first wellness assessment',
          time: 'Start now',
          icon: '🌟',
          color: 'text-green-600'
        }
      ]
    }
    
    return activityStats.recentActivities.slice(0, 3).map(activity => {
      const date = new Date(activity.timestamp?.toDate ? activity.timestamp.toDate() : activity.timestamp)
      const timeAgo = getTimeAgo(date)
      
      switch (activity.activityType) {
        case 'assessment':
          return {
            type: 'Assessment',
            title: 'Completed wellness check-in',
            time: timeAgo,
            icon: '✅',
            color: 'text-green-600'
          }
        case 'resource_read':
          return {
            type: 'Resource',
            title: `Read "${activity.details?.title || 'Resource'}"`,
            time: timeAgo,
            icon: '📚',
            color: 'text-blue-600'
          }
        case 'peer_chat':
          return {
            type: 'Chat',
            title: 'Started peer support chat',
            time: timeAgo,
            icon: '🤝',
            color: 'text-purple-600'
          }
        case 'login':
          return {
            type: 'Login',
            title: 'Logged into Harmony',
            time: timeAgo,
            icon: '🔑',
            color: 'text-indigo-600'
          }
        default:
          return {
            type: 'Activity',
            title: 'Platform activity',
            time: timeAgo,
            icon: '✨',
            color: 'text-slate-600'
          }
      }
    })
  }
  
  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }
  
  const recentActivities = generateRecentActivities()

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 relative overflow-visible">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {greeting}, {userData?.name || 'Student'}! 👋
              </h1>
              <p className="text-slate-600 text-lg mb-4">
                Welcome back to your mental wellness dashboard
              </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  You're doing great!
                </span>
                <span>Last login: {new Date().toLocaleDateString()}</span>
              </div>
              
              {/* User Profile Dropdown */}
              <div className="relative overflow-visible" ref={dropdownRef}>
                <motion.button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors z-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-lg">
                      {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-slate-800 text-sm">{userData?.name || 'User'}</p>
                    <p className="text-xs text-slate-500">Student</p>
                  </div>
                  <motion.svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: isProfileDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 z-[99999] overflow-visible"
                      style={{
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                        <p className="font-semibold text-slate-800 text-base">{userData?.name || 'User'}</p>
                        <p className="text-sm text-slate-500 mt-1">{userData?.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-4 px-5 py-4 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border-b border-transparent hover:border-blue-100"
                        >
                          <span className="w-6 h-6 flex items-center justify-center text-lg">⚙️</span>
                          <span className="font-medium text-base">Manage Profile</span>
                        </Link>
                        
                        <Link
                          to="/progress"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-4 px-5 py-4 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border-b border-transparent hover:border-blue-100"
                        >
                          <span className="w-6 h-6 flex items-center justify-center text-lg">📈</span>
                          <span className="font-medium text-base">View Progress</span>
                        </Link>
                        
                        <div className="border-t border-slate-200 my-2 mx-2"></div>
                        
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false)
                            if (confirm('Are you sure you want to logout?')) {
                              logout()
                            }
                          }}
                          className="w-full flex items-center gap-4 px-5 py-4 text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                        >
                          <span className="w-6 h-6 flex items-center justify-center text-lg">🚪</span>
                          <span className="text-base">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {[
            { 
              label: 'Wellness Score', 
              value: userData?.latestWellnessScore ? `${userData.latestWellnessScore}%` : '--', 
              icon: '💚', 
              color: userData?.latestWellnessScore 
                ? (userData.latestWellnessScore >= 70 ? 'text-green-600' : userData.latestWellnessScore >= 40 ? 'text-yellow-600' : 'text-red-600')
                : 'text-slate-400',
              subtitle: userData?.latestWellnessScore 
                ? (userData.latestWellnessScore >= 70 ? 'Excellent' : userData.latestWellnessScore >= 40 ? 'Good' : 'Needs attention')
                : 'Take assessment'
            },
            { 
              label: 'Activity Streak', 
              value: activityStats ? `${activityStats.activityStreak}` : '--', 
              icon: '🔥', 
              color: activityStats && activityStats.activityStreak > 0 ? 'text-orange-600' : 'text-slate-400',
              subtitle: activityStats && activityStats.activityStreak > 0 
                ? `${activityStats.activityStreak} day${activityStats.activityStreak > 1 ? 's' : ''} in a row!`
                : 'Start your streak'
            },
            { 
              label: 'Resources Read', 
              value: activityStats ? activityStats.activityCounts.resourcesRead.toString() : '--', 
              icon: '📚', 
              color: activityStats && activityStats.activityCounts.resourcesRead > 0 ? 'text-blue-600' : 'text-slate-400',
              subtitle: 'Last 30 days'
            },
            { 
              label: 'Peer Chats', 
              value: activityStats ? activityStats.activityCounts.peerChats.toString() : '--', 
              icon: '🤝', 
              color: activityStats && activityStats.activityCounts.peerChats > 0 ? 'text-purple-600' : 'text-slate-400',
              subtitle: 'Anonymous conversations'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Special animation for streak */}
              {stat.label === 'Activity Streak' && activityStats?.activityStreak > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 opacity-50"></div>
              )}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
                <p className="text-slate-800 font-medium text-sm mb-1">{stat.label}</p>
                <p className="text-slate-500 text-xs">{stat.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={action.link}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 h-full"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{action.title}</h3>
                  <p className="text-slate-600">{action.description}</p>
                  <div className="mt-4 flex items-center text-blue-600 font-medium">
                    <span>Get started</span>
                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity & Tips */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Recent Activity */}
          <motion.div
            className="bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex-shrink-0">
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-slate-800">{activity.title}</p>
                    <p className="text-sm text-slate-600">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Activity Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ActivitySummary 
              activityStats={activityStats} 
              loading={loading}
            />
          </motion.div>
        </div>

        {/* Emergency Support Banner */}
        <motion.div
          className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🆘</span>
              </div>
              <div>
                <h4 className="font-semibold text-red-800">Need immediate help?</h4>
                <p className="text-red-600">Crisis support is available 24/7</p>
              </div>
            </div>
            <Link
              to="/crisis"
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Get Help Now
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}