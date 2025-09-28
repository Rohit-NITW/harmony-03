import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center p-8'

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`${sizeClasses[size]} mx-auto mb-4 relative`}>
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          {/* Inner pulsing dot */}
          <div className="absolute inset-2 rounded-full bg-blue-500 animate-pulse opacity-20"></div>
        </div>
        {message && (
          <p className="text-gray-600 text-sm font-medium animate-pulse">{message}</p>
        )}
      </div>
    </div>
  )
}