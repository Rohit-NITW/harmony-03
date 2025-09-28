import React from 'react'
import { motion } from 'framer-motion'
import { useChatbot } from '../contexts/ChatbotContext'

interface ChatbotControlProps {
  className?: string
  showLabel?: boolean
}

export default function ChatbotControl({ className = '', showLabel = false }: ChatbotControlProps) {
  const { isGlobalChatbotVisible, toggleGlobalChatbot } = useChatbot()

  return (
    <motion.button
      onClick={toggleGlobalChatbot}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isGlobalChatbotVisible 
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={isGlobalChatbotVisible ? 'Hide AI Assistant' : 'Show AI Assistant'}
    >
      <span className="text-lg">
        {isGlobalChatbotVisible ? '🤖' : '🤖'}
      </span>
      {showLabel && (
        <span className="text-sm font-medium">
          AI Assistant {isGlobalChatbotVisible ? 'On' : 'Off'}
        </span>
      )}
    </motion.button>
  )
}

// Mini version for header/navigation
export function ChatbotToggleMini() {
  const { isGlobalChatbotVisible, toggleGlobalChatbot } = useChatbot()

  return (
    <motion.button
      onClick={toggleGlobalChatbot}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
        isGlobalChatbotVisible 
          ? 'bg-blue-100 text-blue-600' 
          : 'bg-gray-100 text-gray-500'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={isGlobalChatbotVisible ? 'Hide AI Assistant' : 'Show AI Assistant'}
    >
      <span className="text-sm">🤖</span>
    </motion.button>
  )
}