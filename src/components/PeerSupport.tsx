import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import PeerChatInterface from './PeerChatInterface'
import { 
  getVolunteerProfiles, 
  getStudentChats,
  createChatSession 
} from '../services/firebase'

interface Volunteer {
  id: string
  name: string
  email: string
  bio?: string
  specialties?: string[]
  isAvailableForChat: boolean
  volunteerSince?: any
  profileImage?: string
}

interface Chat {
  id: string
  studentId: string
  volunteerId: string
  studentAnonymousId: string
  status: 'active' | 'ended' | 'escalated'
  createdAt: any
  updatedAt: any
  volunteerInfo?: any
}

export default function PeerSupport() {
  const { userData } = useAuth()
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [activeChats, setActiveChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'browse' | 'chat'>('browse')

  useEffect(() => {
    if (userData?.uid) {
      loadData()
    }
  }, [userData?.uid])

  const loadData = async () => {
    setLoading(true)
    try {
      const [volunteersResult, chatsResult] = await Promise.all([
        getVolunteerProfiles(),
        getStudentChats(userData!.uid)
      ])

      if (volunteersResult.success) {
        setVolunteers(volunteersResult.data)
      }

      if (chatsResult.success) {
        setActiveChats(chatsResult.data)
        // If there's an active chat, switch to chat view
        const activeChat = chatsResult.data.find(chat => chat.status === 'active')
        if (activeChat) {
          setSelectedChatId(activeChat.id)
          setView('chat')
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async (volunteerId: string) => {
    if (!userData?.uid) return

    try {
      const result = await createChatSession(userData.uid, volunteerId)
      if (result.success) {
        setSelectedChatId(result.chatId)
        setView('chat')
        // Refresh chats to include the new one
        loadData()
      }
    } catch (error) {
      console.error('Error starting chat:', error)
    }
  }

  const getTimeSince = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays} days ago`
    const diffMonths = Math.floor(diffDays / 30)
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">Loading peer support...</p>
        </div>
      </div>
    )
  }

  if (view === 'chat' && selectedChatId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              setView('browse')
              setSelectedChatId(null)
            }}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Volunteers
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Peer Support Chat</h2>
        </div>
        
        <PeerChatInterface 
          chatId={selectedChatId} 
          userType="student"
          userId={userData?.uid || ''}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Connect with Peer Volunteers 🤝
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Chat anonymously with trained student volunteers who understand what you're going through. 
          Get peer support in a safe, confidential environment.
        </p>
      </div>

      {/* Active Chats */}
      {activeChats.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Your Active Conversations</h3>
          <div className="grid gap-4">
            {activeChats.map((chat) => (
              <motion.div
                key={chat.id}
                className="bg-white rounded-lg p-4 border border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedChatId(chat.id)
                  setView('chat')
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {chat.volunteerInfo?.name?.charAt(0) || 'V'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        Chat with {chat.volunteerInfo?.name || 'Volunteer'}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {chat.status === 'active' ? 'Active conversation' : 
                         chat.status === 'escalated' ? 'Escalated to admin' : 'Ended'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      chat.status === 'active' ? 'bg-green-100 text-green-700' :
                      chat.status === 'escalated' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {getTimeSince(chat.updatedAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Volunteers */}
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Available Peer Volunteers</h3>
        
        {volunteers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <div className="text-4xl mb-4">🤝</div>
            <h4 className="text-xl font-semibold text-slate-700 mb-2">No Volunteers Available</h4>
            <p className="text-slate-500">
              Our peer volunteers are currently offline. Please check back later or use our crisis support resources if you need immediate help.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteers.map((volunteer) => (
              <motion.div
                key={volunteer.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl text-white font-bold">
                      {volunteer.name.charAt(0)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-lg mb-1">
                    {volunteer.name}
                  </h4>
                  <div className="flex items-center justify-center gap-1 text-sm text-green-600 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Available to chat
                  </div>
                </div>

                {volunteer.bio && (
                  <p className="text-slate-600 text-sm mb-4 text-center">
                    {volunteer.bio}
                  </p>
                )}

                {volunteer.specialties && volunteer.specialties.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-700 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {volunteer.specialties.slice(0, 3).map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {volunteer.specialties.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          +{volunteer.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {volunteer.volunteerSince && (
                  <p className="text-xs text-slate-500 text-center mb-4">
                    Volunteering since {getTimeSince(volunteer.volunteerSince)}
                  </p>
                )}

                <button
                  onClick={() => handleStartChat(volunteer.id)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Start Anonymous Chat
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Information */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="font-semibold text-slate-800 mb-3">🔒 Your Safety & Privacy</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <p>• All conversations are completely anonymous</p>
            <p>• Volunteers are trained student peers, not professionals</p>
            <p>• Chats are monitored for safety purposes</p>
          </div>
          <div>
            <p>• Your identity is never shared with volunteers</p>
            <p>• Urgent cases can be escalated to professional staff</p>
            <p>• Available 24/7 for peer support and guidance</p>
          </div>
        </div>
      </div>
    </div>
  )
}