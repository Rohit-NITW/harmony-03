import React, { useState } from 'react'
import ChatTester from '../components/ChatTester'
import FirebaseDiagnostic from '../components/FirebaseDiagnostic'
import SimpleConnectionTest from '../components/SimpleConnectionTest'

export default function ChatTestPage() {
  const [activeTab, setActiveTab] = useState<'simple' | 'diagnostic' | 'chat'>('simple')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Firebase & Chat Testing Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Diagnose Firebase connection and test chat functionality
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab('simple')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'simple'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              🚨 Connection Test
            </button>
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'diagnostic'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              🔧 Detailed Diagnostic
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-green-600 text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              💬 Chat Test
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'simple' ? (
          <SimpleConnectionTest />
        ) : activeTab === 'diagnostic' ? (
          <FirebaseDiagnostic />
        ) : (
          <ChatTester />
        )}
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🔧 How to Test:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. <strong>Create Test Volunteer</strong> - Creates a volunteer user in Firebase</li>
            <li>2. <strong>Test Get Volunteers</strong> - Verifies volunteer data retrieval</li>
            <li>3. <strong>Test Create Chat & Send Message</strong> - Tests full chat workflow</li>
          </ol>
          
          <div className="mt-4 pt-3 border-t border-yellow-300">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> Make sure your Firebase rules allow read/write access to the collections:
              <code className="bg-yellow-200 px-1 rounded text-xs ml-1">users, chatList, chatMessages</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}