import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { updateUserProfile, getUserAssessments } from '../services/firebase'
import LoadingSpinner from '../components/LoadingSpinner'

interface UserPreferences {
  emailNotifications: boolean
  reminderFrequency: 'daily' | 'weekly' | 'monthly'
  privacyLevel: 'private' | 'anonymous' | 'public'
}

export default function ProfilePage() {
  const { currentUser, userData, refreshUserData, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [recentAssessments, setRecentAssessments] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    bio: userData?.bio || '',
    university: userData?.university || '',
    year: userData?.year || '',
    major: userData?.major || ''
  })
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: userData?.preferences?.emailNotifications || true,
    reminderFrequency: userData?.preferences?.reminderFrequency || 'weekly',
    privacyLevel: userData?.preferences?.privacyLevel || 'private'
  })

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        bio: userData.bio || '',
        university: userData.university || '',
        year: userData.year || '',
        major: userData.major || ''
      })
      setPreferences({
        emailNotifications: userData.preferences?.emailNotifications || true,
        reminderFrequency: userData.preferences?.reminderFrequency || 'weekly',
        privacyLevel: userData.preferences?.privacyLevel || 'private'
      })
    }
  }, [userData])

  useEffect(() => {
    if (activeTab === 'history' && currentUser) {
      loadAssessmentHistory()
    }
  }, [activeTab, currentUser])

  const loadAssessmentHistory = async () => {
    if (!currentUser) return
    setLoading(true)
    const result = await getUserAssessments(currentUser.uid, 10)
    if (result.success) {
      setRecentAssessments(result.data)
    }
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const saveProfile = async () => {
    if (!currentUser) return
    setSaving(true)
    
    const result = await updateUserProfile(currentUser.uid, {
      ...formData,
      preferences
    })
    
    if (result.success) {
      await refreshUserData()
    }
    
    setSaving(false)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'history', label: 'Assessment History', icon: '📊' },
    { id: 'progress', label: 'Progress', icon: '📈' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Profile</h1>
          <p className="text-slate-600">Manage your account settings and track your wellness journey</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white font-bold">
                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">{userData?.name || 'User'}</h3>
                <p className="text-sm text-slate-600">{userData?.email}</p>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Active Member
                  </span>
                </div>
              </div>
              
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
                
                {/* Logout Button */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to logout?')) {
                        logout()
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50"
                  >
                    <span className="text-lg">🚪</span>
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile Information</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">University</label>
                      <input
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your university name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Year of Study</label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Graduate">Graduate</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Major</label>
                      <input
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your field of study"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tell us a bit about yourself..."
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Preferences</h2>
                  <div className="space-y-6">
                    
                    <div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-3">Notifications</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                            className="mr-3"
                          />
                          <span className="text-slate-700">Receive email notifications</span>
                        </label>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Frequency</label>
                          <select
                            value={preferences.reminderFrequency}
                            onChange={(e) => handlePreferenceChange('reminderFrequency', e.target.value)}
                            className="w-full max-w-xs px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-3">Privacy</h3>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Privacy Level</label>
                        <select
                          value={preferences.privacyLevel}
                          onChange={(e) => handlePreferenceChange('privacyLevel', e.target.value)}
                          className="w-full max-w-xs px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="private">Private</option>
                          <option value="anonymous">Anonymous</option>
                          <option value="public">Public</option>
                        </select>
                        <p className="text-sm text-slate-600 mt-2">
                          Controls how your information appears in support groups and community features
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Assessment History</h2>
                  {loading ? (
                    <LoadingSpinner />
                  ) : recentAssessments.length > 0 ? (
                    <div className="space-y-4">
                      {recentAssessments.map((assessment, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-slate-800">
                              Assessment #{recentAssessments.length - index}
                            </h4>
                            <span className="text-sm text-slate-600">
                              {formatDate(assessment.createdAt)}
                            </span>
                          </div>
                          {assessment.result && (
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-slate-600">Overall Level:</span>
                                <div className={`font-semibold ${
                                  assessment.result.recommendation?.level === 'Low' ? 'text-green-600' :
                                  assessment.result.recommendation?.level === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {assessment.result.recommendation?.level || 'N/A'}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-600">Mood Score:</span>
                                <div className="font-semibold">{assessment.result.scores?.mood || 0}</div>
                              </div>
                              <div>
                                <span className="text-slate-600">Anxiety Score:</span>
                                <div className="font-semibold">{assessment.result.scores?.anxiety || 0}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold text-slate-600 mb-2">No assessments yet</h3>
                      <p className="text-slate-500 mb-4">Take your first assessment to start tracking your mental wellness</p>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Take Assessment
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'progress' && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Progress</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                      <h4 className="font-semibold text-slate-800 mb-2">Wellness Journey</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-1">12 Days</div>
                      <p className="text-slate-600 text-sm">Active on platform</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                      <h4 className="font-semibold text-slate-800 mb-2">Resources Accessed</h4>
                      <div className="text-3xl font-bold text-green-600 mb-1">8</div>
                      <p className="text-slate-600 text-sm">Articles and tools used</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-600">🎯</span>
                        <h4 className="font-semibold text-yellow-800">Next Milestone</h4>
                      </div>
                      <p className="text-yellow-700">Complete 3 more assessments to unlock progress insights</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}