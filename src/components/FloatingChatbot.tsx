import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { chatbotService, ChatMessage } from '../services/chatbotService'

export default function FloatingChatbot() {
  const { userData } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  // Initialize conversation ID
  useEffect(() => {
    if (!conversationId) {
      setConversationId(chatbotService.generateConversationId())
    }
  }, [conversationId])

  // Check if backend is available on first open
  useEffect(() => {
    if (isOpen && chatHistory.length === 0) {
      checkBackendAndInitialize()
    }
  }, [isOpen, chatHistory.length, userData?.name])

  const checkBackendAndInitialize = async () => {
    try {
      // Try to check if backend is available
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 3000 
      } as any)
      
      if (response.ok) {
        // Backend is available, show welcome message
        setChatHistory([{
          sender: 'ai',
        text: `Hello ${userData?.name || 'there'}! I'm your Harmony AI assistant. I'm here to help you with mental health questions, provide support, and guide you through our platform. How can I assist you today?`,
          timestamp: new Date()
        }])
      } else {
        throw new Error('Backend not healthy')
      }
    } catch (error) {
      // Backend is not available, show offline message
      setChatHistory([{
        sender: 'ai',
        text: `Hi ${userData?.name || 'there'}! I'm your Harmony AI assistant, but I'm currently offline. \n\nTo use me, please:\n1. Install Python from python.org\n2. Run the chatbot backend server\n3. Refresh this page\n\nIn the meantime, you can:\n• Use the Crisis Support page for immediate help\n• Browse our Resources section\n• Book an appointment with our counselors`,
        timestamp: new Date()
      }])
      setError('Chatbot backend is not running. Please start the server to use AI assistance.')
    }
  }

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault()

    if (message.trim() === '' || !conversationId) return

    setLoading(true)
    setError('')

    // Add user message to chat
    const userMessage: ChatMessage = {
      sender: 'user',
      text: message,
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, userMessage])

    try {
      const data = await chatbotService.sendMessage({
        message,
        conversation_id: conversationId,
      })
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        sender: 'ai',
        text: data.response,
        timestamp: new Date()
      }

      setChatHistory(prev => [...prev, aiMessage])
      setMessage('')
      
    } catch (error: any) {
      console.error('Chatbot Error:', error)
      setError('Sorry, I encountered an error. Please try again.')
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        sender: 'ai',
        text: 'Sorry, I encountered an error connecting to my servers. Please try again in a moment.',
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (error) setError('')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-40 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">AI</span>
                </div>
                <div>
                  <h3 className="font-semibold">Harmony Assistant</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs opacity-75">Online</span>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border-b border-red-200 p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {chatHistory.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs p-3 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-4' 
                      : 'bg-white text-gray-800 border border-gray-200 mr-4 shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-2 ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-xs p-3 rounded-2xl bg-white text-gray-800 border border-gray-200 mr-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={loading}
                />
                <motion.button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}