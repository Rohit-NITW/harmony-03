import React, { useState, useEffect } from 'react'
import { auth, db } from '../config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'

export default function FirebaseDiagnostic() {
  const [tests, setTests] = useState<any[]>([])
  const [running, setRunning] = useState(false)

  const addTest = (name: string, success: boolean, details?: any, error?: any) => {
    setTests(prev => [...prev, {
      name,
      success,
      details,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    }])
  }

  const runDiagnostics = async () => {
    setRunning(true)
    setTests([])

    // Test 1: Firebase Auth Connection
    try {
      addTest('Firebase Auth Connection', true, { 
        currentUser: auth.currentUser?.uid || 'No user logged in',
        authDomain: auth.app.options.authDomain 
      })
    } catch (error) {
      addTest('Firebase Auth Connection', false, null, error)
    }

    // Test 2: Firestore Connection
    try {
      const testDoc = doc(db, 'test', 'connection')
      await getDoc(testDoc) // This will fail if no connection
      addTest('Firestore Connection', true, { projectId: db.app.options.projectId })
    } catch (error) {
      addTest('Firestore Connection', false, null, error)
    }

    // Test 3: Firestore Write Test
    try {
      const testCollection = collection(db, 'diagnostics')
      const docRef = await addDoc(testCollection, {
        test: 'connection',
        timestamp: new Date(),
        success: true
      })
      addTest('Firestore Write Test', true, { docId: docRef.id })
    } catch (error) {
      addTest('Firestore Write Test', false, null, error)
    }

    // Test 4: Check Firebase Config
    const config = {
      apiKey: auth.app.options.apiKey?.substring(0, 10) + '...',
      authDomain: auth.app.options.authDomain,
      projectId: auth.app.options.projectId
    }
    addTest('Firebase Config Check', true, config)

    setRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🔧 Firebase Connection Diagnostics</h2>
        <button
          onClick={runDiagnostics}
          disabled={running}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {running ? 'Running Tests...' : 'Run Tests Again'}
        </button>
      </div>

      <div className="space-y-3">
        {tests.map((test, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${
              test.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{test.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                test.success
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              }`}>
                {test.success ? '✅ PASS' : '❌ FAIL'}
              </span>
            </div>

            {test.details && (
              <div className="mb-2">
                <h4 className="text-sm font-medium text-slate-700 mb-1">Details:</h4>
                <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(test.details, null, 2)}
                </pre>
              </div>
            )}

            {test.error && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-1">Error:</h4>
                <p className="text-sm text-red-600 bg-red-100 p-2 rounded">
                  {test.error}
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500 mt-2">
              {new Date(test.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      {tests.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Quick Fix Guide:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            {tests.some(t => !t.success && t.name.includes('Auth')) && (
              <p>🔸 <strong>Auth Connection Failed:</strong> Check your Firebase API key and auth domain in firebase.ts</p>
            )}
            {tests.some(t => !t.success && t.name.includes('Firestore')) && (
              <p>🔸 <strong>Firestore Connection Failed:</strong> Check your project ID and make sure Firestore is enabled</p>
            )}
            {tests.some(t => !t.success && t.name.includes('Write')) && (
              <p>🔸 <strong>Write Test Failed:</strong> Check your Firestore security rules</p>
            )}
            {tests.every(t => t.success) && (
              <p className="text-green-700">🎉 <strong>All tests passed!</strong> Your Firebase connection is working correctly.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}