import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import WellnessScoreTrend from '../../components/WellnessScoreTrend'
import AdminAvailabilityManager from '../../components/AdminAvailabilityManager'
import SimpleAdminBookings from '../../components/SimpleAdminBookings'
import UrgentCareAlerts from '../../components/UrgentCareAlerts'
import { 
  getWellnessScoresLast4Weeks,
  getAllUsers,
  getRecentUserActivities,
  getAllAppointments,
  getConfirmedAppointments
} from '../../services/firebase'

interface Metric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: string
}

interface UserActivity {
  id: string
  name: string
  email: string
  lastActive: string
  status: 'online' | 'offline'
  riskLevel: 'low' | 'medium' | 'high'
}

interface WellnessMetrics {
  totalStudents: number
  averageWellnessScore: number
  highRiskStudents: number
  trendsData: any[]
}

export default function AdminDashboard() {
  const { userData, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('urgent-alerts')
  const [wellnessMetrics, setWellnessMetrics] = useState<WellnessMetrics | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [confirmedAppointments, setConfirmedAppointments] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load wellness metrics for the last 4 weeks
      const wellnessResult = await getWellnessScoresLast4Weeks()
      if (wellnessResult.success) {
        const allAssessments = wellnessResult.data.allAssessments || []
        const userLatestScores = wellnessResult.data.userLatestScores || []
        
        const totalStudents = userLatestScores.length
        const averageWellnessScore = userLatestScores.length > 0 
          ? Math.round(userLatestScores.reduce((sum: number, item: any) => sum + item.wellnessScore, 0) / userLatestScores.length)
          : 0
        const highRiskStudents = userLatestScores.filter((item: any) => item.wellnessScore < 40).length
        
        // Add user names to the assessment data for display
        const enrichedTrendsData = allAssessments.map((assessment: any) => ({
          ...assessment,
          userName: `Student ${assessment.userId.slice(-4)}`, // Use last 4 chars of userId as display name
          date: assessment.createdAt?.toDate ? assessment.createdAt.toDate() : new Date(assessment.createdAt),
          riskLevel: assessment.wellnessScore >= 70 ? 'Low' : assessment.wellnessScore >= 40 ? 'Moderate' : 'High'
        }))
        
        setWellnessMetrics({
          totalStudents,
          averageWellnessScore,
          highRiskStudents,
          trendsData: enrichedTrendsData
        })
      }
      
      // Load all users
      const usersResult = await getAllUsers()
      if (usersResult.success) {
        setUsers(usersResult.data || [])
      }
      
      // Load recent user activities
      const activitiesResult = await getRecentUserActivities(20)
      if (activitiesResult.success) {
        setRecentActivities(activitiesResult.data || [])
      }
      
      // Load all appointments
      const appointmentsResult = await getAllAppointments()
      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.data || [])
      }
      
      // Load confirmed appointments
      const confirmedResult = await getConfirmedAppointments()
      if (confirmedResult.success) {
        setConfirmedAppointments(confirmedResult.data || [])
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setTimeout(() => setLoading(false), 1000)
    }
  }

  const metrics: Metric[] = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      change: '+12%',
      trend: 'up',
      icon: '👥'
    },
    {
      title: 'Total Appointments',
      value: appointments.length.toString(),
      change: '+5%',
      trend: 'up',
      icon: '📅'
    },
    {
      title: 'High Risk Students',
      value: wellnessMetrics ? wellnessMetrics.highRiskStudents.toString() : '0',
      change: wellnessMetrics?.highRiskStudents === 0 ? '0' : '-2',
      trend: wellnessMetrics?.highRiskStudents === 0 ? 'neutral' : 'down',
      icon: '🚨'
    },
    {
      title: 'Avg. Wellness Score',
      value: wellnessMetrics ? `${wellnessMetrics.averageWellnessScore}%` : '0%',
      change: '+3%',
      trend: 'up',
      icon: '💚'
    }
  ]

  // Get recent active users from activities and user data
  const getRecentActiveUsers = (): UserActivity[] => {
    if (users.length === 0 || recentActivities.length === 0) {
      return []
    }

    // Create a map of the most recent activities by user
    const userActivitiesMap = new Map()
    
    recentActivities.forEach((activity) => {
      if (!userActivitiesMap.has(activity.userId) || 
          (activity.timestamp && 
           userActivitiesMap.get(activity.userId).timestamp < activity.timestamp)) {
        userActivitiesMap.set(activity.userId, activity)
      }
    })
    
    // Create UserActivity objects for each user with recent activity
    const activeUsers = Array.from(userActivitiesMap.entries())
      .map(([userId, activity]) => {
        const user = users.find(u => u.id === userId)
        if (!user) return null
        
        // Calculate how long ago was the activity
        let lastActive = ''
        if (activity.timestamp) {
          const activityTime = activity.timestamp.toDate ? 
            activity.timestamp.toDate() : new Date(activity.timestamp)
          
          const now = new Date()
          const diffMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))
          
          if (diffMinutes < 1) lastActive = 'Just now'
          else if (diffMinutes < 60) lastActive = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
          else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60)
            lastActive = `${hours} hour${hours !== 1 ? 's' : ''} ago`
          } else {
            const days = Math.floor(diffMinutes / 1440)
            lastActive = `${days} day${days !== 1 ? 's' : ''} ago`
          }
        } else {
          lastActive = 'Unknown'
        }
        
        // Determine online status (online if active within last 15 minutes)
        const isOnline = activity.timestamp && 
          ((new Date().getTime() - activity.timestamp.toDate().getTime()) < (15 * 60 * 1000))
        
        // Determine risk level from wellness score if available
        let riskLevel: 'low' | 'medium' | 'high' = 'low'
        if (user.latestWellnessScore) {
          if (user.latestWellnessScore < 40) riskLevel = 'high'
          else if (user.latestWellnessScore < 70) riskLevel = 'medium'
        }
        
        return {
          id: user.id,
          name: user.name || user.displayName || 'Anonymous User',
          email: user.email || 'No email provided',
          lastActive: lastActive,
          status: isOnline ? 'online' : 'offline',
          riskLevel: riskLevel
        }
      })
      .filter(Boolean) // Remove null entries
      .slice(0, 5) // Limit to 5 most recent users
    
    return activeUsers as UserActivity[]
  }
  
  const recentUsers = getRecentActiveUsers()

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading admin dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back, {userData?.name || 'Administrator'}. Here's what's happening with Harmony today.
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    System Status: Operational
                  </span>
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
              
              {/* Admin Profile & Logout */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {userData?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{userData?.name || 'Administrator'}</p>
                      <p className="text-sm text-gray-500">{userData?.email}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to logout?')) {
                      logout()
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              className="bg-white rounded-lg shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">{metric.icon}</span>
                </div>
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
              <p className="text-gray-600 text-sm">{metric.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'urgent-alerts', label: '🚨 Urgent Alerts' },
                { id: 'bookings', label: 'Student Appointments' },
                { id: 'overview', label: 'Overview' },
                { id: 'availability', label: 'My Schedule' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'users', label: 'User Management' },
                { id: 'settings', label: 'Settings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content based on selected tab */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {selectedTab === 'urgent-alerts' && (
            <UrgentCareAlerts />
          )}

          {selectedTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Recent User Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent User Activity</h3>
                <div className="space-y-4">
                  {recentUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-3">📊</div>
                      <p className="text-lg font-medium mb-1">No Recent Activity</p>
                      <p className="text-sm">User activity will appear here once users become active on the platform.</p>
                    </div>
                  ) : (
                    recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                            <span className="text-xs text-gray-500">{user.lastActive}</span>
                          </div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(user.riskLevel)}`}>
                            {user.riskLevel} risk
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Send Platform Announcement', icon: '📢', color: 'bg-blue-500' },
                    { label: 'Export User Data', icon: '📊', color: 'bg-green-500' },
                    { label: 'Review Crisis Alerts', icon: '🚨', color: 'bg-red-500' },
                    { label: 'Update Resources', icon: '📚', color: 'bg-purple-500' },
                    { label: 'Manage Support Groups', icon: '👥', color: 'bg-indigo-500' }
                  ].map((action, index) => (
                    <motion.button
                      key={action.label}
                      className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                        <span>{action.icon}</span>
                      </div>
                      <span className="font-medium text-gray-900">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'bookings' && (
            <SimpleAdminBookings />
          )}

          {selectedTab === 'availability' && (
            <AdminAvailabilityManager />
          )}

          {selectedTab === 'users' && (
            <div className="space-y-8">
              {/* User Management Table */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <p className="text-gray-600 mt-1">Manage student accounts and monitor their activity</p>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              <div className="text-4xl mb-3">👥</div>
                              <p className="text-lg font-medium mb-1">No Users Found</p>
                              <p className="text-sm">User data will appear here once users register and become active.</p>
                            </td>
                          </tr>
                        ) : (
                          users.slice(0, 20).map((user) => {
                          // Find this user's most recent activity
                          const userActivity = recentActivities.find(a => a.userId === user.id)
                          
                          // Calculate last active time
                          let lastActive = 'Never'
                          let isOnline = false
                          
                          if (userActivity?.timestamp) {
                            const activityTime = userActivity.timestamp.toDate ? 
                              userActivity.timestamp.toDate() : new Date(userActivity.timestamp)
                            const now = new Date()
                            const diffMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))
                            
                            if (diffMinutes < 1) lastActive = 'Just now'
                            else if (diffMinutes < 60) lastActive = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
                            else if (diffMinutes < 1440) {
                              const hours = Math.floor(diffMinutes / 60)
                              lastActive = `${hours} hour${hours !== 1 ? 's' : ''} ago`
                            } else {
                              const days = Math.floor(diffMinutes / 1440)
                              lastActive = `${days} day${days !== 1 ? 's' : ''} ago`
                            }
                            
                            isOnline = diffMinutes < 15
                          }
                          
                          // Determine risk level
                          let riskLevel = 'low'
                          if (user.latestWellnessScore) {
                            if (user.latestWellnessScore < 40) riskLevel = 'high'
                            else if (user.latestWellnessScore < 70) riskLevel = 'medium'
                          }
                          
                          return (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                      {(user.name || user.displayName || 'U').charAt(0)}
                                    </span>
                                  </div>
                                  <div className="ml-3">
                                    <p className="font-medium text-gray-900">{user.name || user.displayName || 'Anonymous User'}</p>
                                    <p className="text-sm text-gray-600">{user.email || 'No email provided'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                  <span className="text-sm text-gray-900 capitalize">{isOnline ? 'online' : 'offline'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskLevel)}`}>
                                  {riskLevel}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {lastActive}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          )
                        }))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Individual Wellness Trend Examples */}
              <div className="grid lg:grid-cols-2 gap-8">
                {wellnessMetrics && wellnessMetrics.trendsData.length > 0 ? (
                  // Show wellness trends for the first few students as examples
                  wellnessMetrics.trendsData
                    .slice(0, 4)
                    .filter((item, index, array) => array.findIndex(t => t.userId === item.userId) === index) // Unique users only
                    .slice(0, 2) // Limit to 2 students
                    .map((studentData, index) => (
                      <WellnessScoreTrend
                        key={studentData.userId}
                        userId={studentData.userId}
                        userName={studentData.userName}
                      />
                    ))
                ) : (
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8">
                    <div className="text-center">
                      <div className="text-4xl mb-3">📊</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Wellness Data Available</h4>
                      <p className="text-gray-500">Student wellness trends will appear here once assessments are completed.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="grid gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Analytics</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {users.length}
                    </div>
                    <p className="text-gray-600">Total Users</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {appointments.length}
                    </div>
                    <p className="text-gray-600">Total Appointments</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      wellnessMetrics?.averageWellnessScore >= 70 ? 'text-green-600' :
                      wellnessMetrics?.averageWellnessScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {wellnessMetrics ? `${wellnessMetrics.averageWellnessScore}%` : '0%'}
                    </div>
                    <p className="text-gray-600">Avg Wellness Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {wellnessMetrics ? wellnessMetrics.highRiskStudents : 0}
                    </div>
                    <p className="text-gray-600">High Risk Students</p>
                  </div>
                </div>
              </div>
              
              {/* Appointment Analytics */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Appointment Statistics</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {confirmedAppointments.length}
                    </div>
                    <p className="text-blue-800 font-medium">Confirmed</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      {appointments.filter((apt: any) => apt.status === 'pending').length}
                    </div>
                    <p className="text-yellow-800 font-medium">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {appointments.filter((apt: any) => apt.status === 'completed').length}
                    </div>
                    <p className="text-green-800 font-medium">Completed</p>
                  </div>
                </div>
              </div>
              
              {/* Recent Appointments */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h4>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-3">📅</div>
                      <p className="text-lg font-medium mb-1">No Appointments</p>
                      <p className="text-sm">Appointment data will appear here once bookings are made.</p>
                    </div>
                  ) : (
                    appointments
                      .sort((a: any, b: any) => {
                        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
                        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
                        return dateB.getTime() - dateA.getTime()
                      })
                      .slice(0, 8)
                      .map((appointment: any, index: number) => {
                        const appointmentDate = appointment.date ? new Date(appointment.date) : null
                        const user = users.find(u => u.id === appointment.studentId)
                        
                        return (
                          <motion.div
                            key={appointment.id || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                appointment.status === 'confirmed' ? 'text-blue-600 bg-blue-100' :
                                appointment.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                                appointment.status === 'completed' ? 'text-green-600 bg-green-100' :
                                'text-red-600 bg-red-100'
                              }`}>
                                {appointment.status === 'confirmed' ? '✓' :
                                 appointment.status === 'pending' ? '⏳' :
                                 appointment.status === 'completed' ? '✅' : '❌'}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">
                                  {user?.name || user?.displayName || 'Student'}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {appointmentDate ? appointmentDate.toLocaleDateString() : 'Date not set'} 
                                  {appointment.timeSlot && ` at ${appointment.timeSlot}`}
                                </p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed' ? 'text-blue-700 bg-blue-100' :
                              appointment.status === 'pending' ? 'text-yellow-700 bg-yellow-100' :
                              appointment.status === 'completed' ? 'text-green-700 bg-green-100' :
                              'text-red-700 bg-red-100'
                            }`}>
                              {appointment.status || 'Unknown'}
                            </div>
                          </motion.div>
                        )
                      })
                  )}
                </div>
              </div>
              
              {/* Wellness Score Trends for All Students */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Platform Wellness Overview</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-green-800">Students with Excellent Wellness</p>
                        <p className="text-sm text-green-600">Score 70% and above</p>
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {wellnessMetrics ? wellnessMetrics.trendsData.filter(item => item.wellnessScore >= 70).length : 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-yellow-800">Students with Good Wellness</p>
                        <p className="text-sm text-yellow-600">Score 40-69%</p>
                      </div>
                      <div className="text-2xl font-bold text-yellow-700">
                        {wellnessMetrics ? wellnessMetrics.trendsData.filter(item => item.wellnessScore >= 40 && item.wellnessScore < 70).length : 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-red-800">Students Needing Attention</p>
                        <p className="text-sm text-red-600">Score below 40%</p>
                      </div>
                      <div className="text-2xl font-bold text-red-700">
                        {wellnessMetrics ? wellnessMetrics.highRiskStudents : 0}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Individual Student Wellness Trends */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Student Assessments</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {wellnessMetrics && wellnessMetrics.trendsData.length > 0 ? (
                      wellnessMetrics.trendsData
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 8)
                        .map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                item.wellnessScore >= 70 ? 'text-green-600 bg-green-100' :
                                item.wellnessScore >= 40 ? 'text-yellow-600 bg-yellow-100' :
                                'text-red-600 bg-red-100'
                              }`}>
                                {item.wellnessScore}%
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{item.userName}</p>
                                <p className="text-sm text-slate-500">{new Date(item.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.riskLevel === 'Low' ? 'text-green-700 bg-green-100' :
                              item.riskLevel === 'Moderate' || item.riskLevel === 'Mild' ? 'text-yellow-700 bg-yellow-100' :
                              'text-red-700 bg-red-100'
                            }`}>
                              {item.riskLevel} Risk
                            </div>
                          </motion.div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">📊</div>
                        <p className="text-slate-500">No assessment data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                  <input 
                    type="text" 
                    defaultValue="Harmony"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crisis Hotline Number</label>
                  <input 
                    type="text" 
                    defaultValue="988"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Send email alerts for high-risk users</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Save Changes
                  </button>
                  
                  <div className="border-l border-gray-200 pl-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Account Actions</h4>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to logout from the admin dashboard?')) {
                          logout()
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors font-medium border border-red-200"
                    >
                      <span>🚪</span>
                      Logout Admin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}