import React, { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { 
  getVolunteerProfiles,
  createChatSession,
  sendChatMessage,
  getChatMessages
} from '../services/firebase'

export default function ChatTester() {
  const [status, setStatus] = useState('')
  const [testResults, setTestResults] = useState<any[]>([])

  const addTestResult = (result: any) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }])
  }

  const createTestVolunteer = async () => {
    setStatus('Creating test volunteer...')
    
    try {
      const volunteerId = 'test-volunteer-' + Date.now()
      
      await setDoc(doc(db, 'users', volunteerId), {
        uid: volunteerId,
        email: 'volunteer.test@harmony.edu',
        name: 'Test Volunteer',
        role: 'volunteer',
        bio: 'Test volunteer for peer support system',
        specialties: ['Anxiety', 'Academic Stress'],
        isAvailableForChat: true,
        volunteerSince: serverTimestamp(),
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      })

      addTestResult({
        action: 'Create Test Volunteer',
        success: true,
        data: { volunteerId }
      })
      
      setStatus('Test volunteer created successfully!')
    } catch (error) {
      addTestResult({
        action: 'Create Test Volunteer',
        success: false,
        error: error
      })
      setStatus('Error creating test volunteer: ' + error)
    }
  }

  const testGetVolunteers = async () => {
    setStatus('Testing getVolunteerProfiles...')
    
    try {
      const result = await getVolunteerProfiles()
      addTestResult({
        action: 'Get Volunteer Profiles',
        success: result.success,
        data: result.data,
        error: result.error
      })
      
      setStatus(`Found ${result.data?.length || 0} volunteers`)
    } catch (error) {
      addTestResult({
        action: 'Get Volunteer Profiles',
        success: false,
        error: error
      })
      setStatus('Error getting volunteers: ' + error)
    }
  }

  const testCreateChat = async () => {
    setStatus('Testing chat creation...')
    
    try {
      // First get volunteers
      const volunteersResult = await getVolunteerProfiles()
      if (!volunteersResult.success || volunteersResult.data.length === 0) {
        throw new Error('No volunteers available')
      }

      const testStudentId = 'test-student-' + Date.now()
      const volunteerId = volunteersResult.data[0].id

      const chatResult = await createChatSession(testStudentId, volunteerId)
      addTestResult({
        action: 'Create Chat Session',
        success: chatResult.success,
        data: chatResult,
        error: chatResult.error
      })
      
      if (chatResult.success) {
        setStatus(`Chat created! ID: ${chatResult.chatId}`)
        
        // Test sending a message
        const messageResult = await sendChatMessage(
          chatResult.chatId,
          testStudentId,
          'Hello, this is a test message from student!',
          'student'
        )
        
        addTestResult({
          action: 'Send Test Message',
          success: messageResult.success,
          data: messageResult,
          error: messageResult.error
        })
        
        // Get messages to verify
        const messagesResult = await getChatMessages(chatResult.chatId)
        addTestResult({
          action: 'Get Chat Messages',
          success: messagesResult.success,
          data: messagesResult.data,
          error: messagesResult.error
        })
        
      } else {
        setStatus('Chat creation failed: ' + chatResult.error)
      }
    } catch (error) {
      addTestResult({
        action: 'Test Chat Creation',
        success: false,
        error: error
      })
      setStatus('Error testing chat: ' + error)
    }
  }

  const clearResults = () => {
    setTestResults([])
    setStatus('')
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chat System Tester 🧪</h2>
      
      <div className="space-y-3 mb-6">
        <button
          onClick={createTestVolunteer}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          1. Create Test Volunteer
        </button>
        
        <button
          onClick={testGetVolunteers}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ml-2"
        >
          2. Test Get Volunteers
        </button>
        
        <button
          onClick={testCreateChat}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 ml-2"
        >
          3. Test Create Chat & Send Message
        </button>
        
        <button
          onClick={clearResults}
          className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 ml-2"
        >
          Clear Results
        </button>
      </div>

      {status && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-800">{status}</p>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Test Results:</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{result.action}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.success
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                }`}>
                  {result.success ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
              
              <div className="text-sm text-slate-600">
                <p>Time: {new Date(result.timestamp).toLocaleTimeString()}</p>
                
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Data</summary>
                    <pre className="bg-slate-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
                
                {result.error && (
                  <div className="mt-2">
                    <p className="font-medium text-red-600">Error:</p>
                    <p className="text-red-600 text-xs">{JSON.stringify(result.error)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}