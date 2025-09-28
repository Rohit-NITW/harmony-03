import React, { useState, useEffect } from 'react'
import { auth, db } from '../config/firebase'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'

export default function SimpleConnectionTest() {
  const [status, setStatus] = useState('Testing...')
  const [details, setDetails] = useState<string[]>([])

  const addDetail = (message: string) => {
    setDetails(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const testConnection = async () => {
      try {
        addDetail('🔥 Starting Firebase connection test...')
        
        // Test 1: Basic Firebase app initialization
        addDetail(`✅ Firebase app initialized successfully`)
        addDetail(`📋 Project ID: ${auth.app.options.projectId}`)
        addDetail(`📋 Auth Domain: ${auth.app.options.authDomain}`)
        
        // Test 2: Check if we can access Firestore
        addDetail('🔍 Testing Firestore connection...')
        
        try {
          // Try to read a simple document (this will work even if document doesn't exist)
          const testDocRef = doc(db, 'test', 'connection')
          const docSnapshot = await getDoc(testDocRef)
          addDetail('✅ Firestore connection successful!')
          addDetail(`📋 Document exists: ${docSnapshot.exists()}`)
          
          // Test 3: Try to write to Firestore
          addDetail('💾 Testing Firestore write...')
          await setDoc(doc(db, 'connectionTest', 'test'), {
            timestamp: new Date(),
            message: 'Connection test successful!',
            userAgent: navigator.userAgent
          })
          addDetail('✅ Firestore write successful!')
          
          setStatus('🎉 All tests passed! Firebase is working correctly.')
          
        } catch (firestoreError: any) {
          addDetail(`❌ Firestore error: ${firestoreError.message}`)
          addDetail(`🔍 Error code: ${firestoreError.code}`)
          
          if (firestoreError.code === 'permission-denied') {
            addDetail('🚨 SOLUTION: Check your Firestore security rules!')
          } else if (firestoreError.code === 'unavailable') {
            addDetail('🚨 SOLUTION: Check your internet connection!')
          } else if (firestoreError.code === 'unauthenticated') {
            addDetail('🚨 SOLUTION: User needs to be authenticated first!')
          }
          
          setStatus('❌ Firestore connection failed - see details above')
        }
        
      } catch (error: any) {
        addDetail(`❌ Firebase initialization error: ${error.message}`)
        setStatus('❌ Firebase initialization failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Simple Firebase Connection Test</h2>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Current Status:</h3>
        <p className="text-lg">{status}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-slate-800">Test Details:</h3>
        <div className="bg-slate-100 p-4 rounded-lg max-h-96 overflow-y-auto">
          {details.map((detail, index) => (
            <div key={index} className="text-sm font-mono text-slate-700 py-1">
              {detail}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">🔧 Common Issues & Solutions:</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>Permission Denied:</strong> Go to Firebase Console → Firestore → Rules → Make sure rules allow read/write</p>
          <p><strong>Project Not Found:</strong> Check the projectId in firebase.ts matches your Firebase project</p>
          <p><strong>Network Error:</strong> Check your internet connection and Firebase project status</p>
          <p><strong>API Key Invalid:</strong> Make sure the apiKey in firebase.ts is correct</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">✅ If All Tests Pass:</h3>
        <p className="text-sm text-green-700">
          Your Firebase connection is working! You can proceed to test the chat functionality.
          Go to the "Chat System Test" tab and try creating a test volunteer.
        </p>
      </div>
    </div>
  )
}