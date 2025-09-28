import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import PeerChatInterface from '../../components/PeerChatInterface'
import { 
  getVolunteerChats, 
  subscribeToVolunteerChats,
  escalateChatToAdmin,
  endChatSession 
} from '../../services/firebase'

interface Chat {
  id: string
  studentId: string
  volunteerId: string
  studentAnonymousId: string
  status: 'active' | 'ended' | 'escalated'
  createdAt: any
  updatedAt: any
  lastMessage?: string
  lastMessageBy?: 'student' | 'volunteer'
  lastMessageAt?: any
  messageCount: number
  isUrgent: boolean
  escalatedToAdmin: boolean
}

export default function VolunteerDashboard() {
  const { userData, logout } = useAuth()
  const [activeChats, setActiveChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [escalationReason, setEscalationReason] = useState('')
  const [showEscalationModal, setShowEscalationModal] = useState(false)
  const [chatToEscalate, setChatToEscalate] = useState<string | null>(null)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userData?.uid) return

    // Debug: Log user data to see what's being received
    console.log('VolunteerDashboard userData:', userData)
    console.log('User role:', userData.role)
    console.log('User name:', userData.name)

    // Load initial chats
    loadChats()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToVolunteerChats(userData.uid, (chats) => {
      setActiveChats(chats)
    })

    return () => unsubscribe()
  }, [userData?.uid])

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

  const loadChats = async () => {
    if (!userData?.uid) return

    try {
      const result = await getVolunteerChats(userData.uid)
      if (result.success) {
        setActiveChats(result.data)
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEscalateChat = async (chatId: string) => {
    setChatToEscalate(chatId)
    setShowEscalationModal(true)
  }

  const confirmEscalation = async () => {
    if (!chatToEscalate || !userData?.uid || !escalationReason.trim()) return

    try {
      const result = await escalateChatToAdmin(
        chatToEscalate, 
        userData.uid, 
        escalationReason
      )

      if (result.success) {
        setShowEscalationModal(false)
        setEscalationReason('')
        setChatToEscalate(null)
        // Refresh chats to show updated status
        loadChats()
      }
    } catch (error) {
      console.error('Error escalating chat:', error)
    }
  }

  const handleEndChat = async (chatId: string) => {
    if (confirm('Are you sure you want to end this chat session?')) {
      try {
        const result = await endChatSession(chatId)
        if (result.success) {
          // Remove from active chats
          setActiveChats(chats => chats.filter(chat => chat.id !== chatId))
          if (selectedChatId === chatId) {
            setSelectedChatId(null)
          }
        }
      } catch (error) {
        console.error('Error ending chat:', error)
      }
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getTimeSince = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading volunteer dashboard..." />
  }

  // Check if user is actually a volunteer
  if (userData && userData.role !== 'volunteer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">
            You are logged in as a <strong>{userData.role}</strong> but trying to access the volunteer dashboard.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Current user: {userData.name} ({userData.email})
          </p>
          <button
            onClick={() => {
              if (confirm('Logout and return to login page?')) {
                logout()
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div
          className="mb-8 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ zIndex: 10 }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 relative overflow-visible">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100 to-transparent rounded-full -mr-16 -mt-16" style={{ zIndex: 1 }}></div>
            <div className="relative" style={{ zIndex: 20 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    Volunteer Dashboard 🤝
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Welcome, {userData?.name}! Thank you for volunteering to support fellow students.
                  </p>
                </div>
                
                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef} style={{ zIndex: 50 }}>
                  <motion.button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-50 transition-colors"
                    style={{ zIndex: 10 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-lg">
                        {userData?.name?.charAt(0)?.toUpperCase() || 'V'}
                      </span>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-slate-800 text-sm">{userData?.name || 'Volunteer'}</p>
                      <p className="text-xs text-slate-500">Volunteer</p>
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
                        className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-3"
                        style={{
                          zIndex: 9999,
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
                          <p className="font-semibold text-slate-800 text-base">
                            {userData?.name || 'Volunteer'}
                            {userData?.role && userData.role !== 'volunteer' && (
                              <span className="text-xs text-red-600 ml-2">(Role: {userData.role})</span>
                            )}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">{userData?.email}</p>
                          <p className="text-xs text-purple-600 mt-1">
                            {userData?.role === 'volunteer' ? 'Peer Support Volunteer' : `Logged in as ${userData?.role}`}
                          </p>
                          {userData?.bio && (
                            <p className="text-xs text-slate-500 mt-1 italic">{userData.bio}</p>
                          )}
                        </div>
                        
                        <div className="py-2">
                          <div className="px-5 py-3 text-slate-600 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-sm">
                              <span>🤝</span>
                              <span>Helping {activeChats.length} student{activeChats.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm mt-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span>Online & Available</span>
                            </div>
                          </div>
                          
                          <div className="border-t border-slate-200 mt-2 pt-2">
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
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Online & Available
                </span>
                <span>Active Chats: {activeChats.length}</span>
                <span>Today: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Chat List Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-sm border h-[600px] flex flex-col">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Active Chat Sessions</h3>
                <p className="text-sm text-slate-500">Students seeking peer support</p>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {activeChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="text-4xl mb-3">💬</div>
                    <h4 className="font-semibold text-slate-700 mb-2">No Active Chats</h4>
                    <p className="text-sm text-slate-500">
                      Students will appear here when they request peer support
                    </p>
                  </div>
                ) : (
                  activeChats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                        selectedChatId === chat.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedChatId(chat.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {chat.studentAnonymousId.slice(-2)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800">
                              {chat.studentAnonymousId}
                            </h4>
                            <div className="flex items-center gap-1">
                              {chat.status === 'escalated' && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                  Escalated
                                </span>
                              )}
                              {chat.isUrgent && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {getTimeSince(chat.updatedAt)}
                        </div>
                      </div>
                      
                      {chat.lastMessage && (
                        <p className="text-sm text-slate-600 truncate mb-1">
                          {chat.lastMessageBy === 'volunteer' && '💬 '} {chat.lastMessage}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                          Started {getTimeSince(chat.createdAt)}
                        </span>
                        <div className="flex gap-1">
                          {chat.status === 'active' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEscalateChat(chat.id)
                                }}
                                className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                              >
                                🚨 Escalate
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEndChat(chat.id)
                                }}
                                className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                              >
                                End
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {selectedChatId ? (
              <PeerChatInterface 
                chatId={selectedChatId} 
                userType="volunteer"
                userId={userData?.uid || ''}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    Select a Chat Session
                  </h3>
                  <p className="text-slate-500">
                    Choose a student from the left to start providing peer support
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Escalation Modal */}
        {showEscalationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                🚨 Escalate to Admin
              </h3>
              <p className="text-slate-600 mb-4">
                This will alert administrators that this student needs immediate professional attention.
              </p>
              <textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Please describe why this case needs admin attention..."
                className="w-full p-3 border border-slate-300 rounded-lg resize-none h-24 mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={confirmEscalation}
                  disabled={!escalationReason.trim()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Escalate Now
                </button>
                <button
                  onClick={() => {
                    setShowEscalationModal(false)
                    setEscalationReason('')
                    setChatToEscalate(null)
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Volunteer Guidelines */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="font-semibold text-slate-800 mb-3">💡 Volunteer Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <p>• Listen actively and show empathy</p>
              <p>• Ask open-ended questions</p>
              <p>• Validate their feelings and experiences</p>
            </div>
            <div>
              <p>• Know your limits - escalate when needed</p>
              <p>• Maintain student anonymity always</p>
              <p>• Refer to crisis resources if necessary</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}