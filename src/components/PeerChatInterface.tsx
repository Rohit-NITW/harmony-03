import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  getChatMessages, 
  sendChatMessage, 
  subscribeToChatMessages 
} from '../services/firebase'

interface Message {
  id: string
  chatId: string
  senderId: string
  senderType: 'student' | 'volunteer'
  content: string
  timestamp: any
  isRead: boolean
}

interface PeerChatInterfaceProps {
  chatId: string
  userType: 'student' | 'volunteer'
  userId: string
}

export default function PeerChatInterface({ 
  chatId, 
  userType, 
  userId 
}: PeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chatId) return

    console.log('PeerChatInterface: Setting up chat for chatId:', chatId)
    setError('')
    setConnected(false)

    // Subscribe to real-time messages
    const unsubscribe = subscribeToChatMessages(chatId, (messageList) => {
      console.log('PeerChatInterface: Received messages:', messageList.length)
      setMessages(messageList)
      setLoading(false)
      setConnected(true)
      setError('')
      
      // Auto-scroll to bottom for new messages
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    })

    // Handle potential connection errors
    const errorTimeout = setTimeout(() => {
      if (!connected && loading) {
        setError('Connection timeout. Please check your internet connection.')
        setLoading(false)
      }
    }, 30000) // 30 second timeout for debugging

    return () => {
      unsubscribe()
      clearTimeout(errorTimeout)
    }
  }, [chatId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    console.log('PeerChatInterface: Sending message:', { chatId, userId, userType, content: newMessage.trim() })
    setSending(true)
    setError('')
    
    try {
      const result = await sendChatMessage(
        chatId,
        userId,
        newMessage.trim(),
        userType
      )

      console.log('PeerChatInterface: Send result:', result)

      if (result.success) {
        setNewMessage('')
        // Messages will be updated via real-time subscription
      } else {
        setError('Failed to send message. Please try again.')
        console.error('Send message failed:', result.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('An error occurred while sending your message.')
    } finally {
      setSending(false)
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const today = new Date()
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    
    return date.toLocaleDateString()
  }

  const shouldShowDateSeparator = (currentMsg: Message, previousMsg: Message | null) => {
    if (!previousMsg) return true
    
    const currentDate = currentMsg.timestamp?.toDate ? 
      currentMsg.timestamp.toDate() : new Date(currentMsg.timestamp)
    const previousDate = previousMsg.timestamp?.toDate ? 
      previousMsg.timestamp.toDate() : new Date(previousMsg.timestamp)
    
    return currentDate.toDateString() !== previousDate.toDateString()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">Loading conversation...</p>
          <p className="text-xs text-slate-400 mt-2">Chat ID: {chatId}</p>
        </div>
      </div>
    )
  }

  if (error && !connected) {
    return (
      <div className="bg-white rounded-xl shadow-sm border h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Connection Error</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border h-[600px] flex flex-col">
      
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">
              {userType === 'volunteer' ? 'Peer Support Chat' : 'Chat with Volunteer'}
            </h3>
            <p className="text-sm text-slate-500">
              {userType === 'volunteer' 
                ? 'Providing anonymous peer support' 
                : 'Anonymous and confidential conversation'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-400 animate-pulse' : 
              loading ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
            }`}></div>
            <span className="text-sm text-slate-500">
              {connected ? 'Connected' : loading ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">💬</div>
            <h4 className="font-semibold text-slate-700 mb-2">Start the Conversation</h4>
            <p className="text-slate-500 text-sm">
              {userType === 'volunteer' 
                ? 'Wait for the student to send the first message, or send a friendly greeting.'
                : 'Feel free to share what\'s on your mind. This is a safe, anonymous space.'}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null
            const showDateSeparator = shouldShowDateSeparator(message, previousMessage)
            const isOwnMessage = message.senderType === userType
            
            return (
              <div key={message.id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex items-center justify-center py-2">
                    <div className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full">
                      {formatDate(message.timestamp)}
                    </div>
                  </div>
                )}

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-12'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm mr-12'
                  }`}>
                    
                    {/* Sender Label for Volunteers */}
                    {!isOwnMessage && userType === 'volunteer' && (
                      <div className="text-xs opacity-70 mb-1 font-medium">
                        Student
                      </div>
                    )}
                    
                    {!isOwnMessage && userType === 'student' && (
                      <div className="text-xs opacity-70 mb-1 font-medium">
                        Volunteer
                      </div>
                    )}

                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    
                    <p className={`text-xs mt-2 ${
                      isOwnMessage ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>

                    {/* Message tail */}
                    <div className={`absolute top-3 ${
                      isOwnMessage 
                        ? '-right-1 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 transform rotate-45'
                        : '-left-1 w-3 h-3 bg-white border-l border-b border-slate-200 transform rotate-45'
                    }`}></div>
                  </div>
                </motion.div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        
        {/* Error Alert */}
        {error && connected && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                userType === 'volunteer' 
                  ? "Type your supportive response..." 
                  : "Share what's on your mind..."
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-12 text-sm"
              disabled={sending}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            
            {/* Character count */}
            {newMessage.length > 0 && (
              <div className="absolute bottom-1 right-12 text-xs text-slate-400">
                {newMessage.length}/500
              </div>
            )}
          </div>
          
          <motion.button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[60px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {sending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </form>
        
        {/* Safe Space Reminder */}
        <div className="mt-2 text-xs text-slate-500 text-center">
          {userType === 'volunteer' ? (
            "Remember: Listen, support, and escalate if needed. Maintain anonymity."
          ) : (
            "🔒 This is a safe, anonymous space. Your identity is protected."
          )}
        </div>
      </div>
    </div>
  )
}