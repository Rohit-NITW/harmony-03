import React, { useState } from 'react'
import { 
  getAvailableTimeSlots,
  getMentorBookings,
  updateBookingStatus,
  createBooking
} from '../services/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

export default function BookingSystemDebug() {
  const { userData } = useAuth()
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testDate, setTestDate] = useState('2024-01-15')
  const [testMentorId, setTestMentorId] = useState(userData?.uid || '')

  const testAvailableSlots = async () => {
    setLoading(true)
    try {
      console.log('Testing available slots for:', { date: testDate, mentorId: testMentorId })
      const result = await getAvailableTimeSlots(testDate, 'individual', testMentorId)
      console.log('Available slots result:', result)
      setResults({
        type: 'Available Slots (Specific Mentor)',
        data: {
          ...result,
          requestParams: { date: testDate, mentorId: testMentorId }
        },
        timestamp: new Date().toLocaleTimeString()
      })
    } catch (error) {
      console.error('Error testing slots:', error)
      setResults({
        type: 'Error',
        data: { error: error.message },
        timestamp: new Date().toLocaleTimeString()
      })
    }
    setLoading(false)
  }

  const testAllAvailableSlots = async () => {
    setLoading(true)
    try {
      console.log('Testing available slots for all mentors on:', testDate)
      const result = await getAvailableTimeSlots(testDate, 'individual') // No mentor ID = all mentors
      console.log('All mentors slots result:', result)
      setResults({
        type: 'Available Slots (All Mentors)',
        data: {
          ...result,
          requestParams: { date: testDate, mentorId: 'all' }
        },
        timestamp: new Date().toLocaleTimeString()
      })
    } catch (error) {
      console.error('Error testing all slots:', error)
      setResults({
        type: 'Error',
        data: { error: error.message },
        timestamp: new Date().toLocaleTimeString()
      })
    }
    setLoading(false)
  }

  const testMentorBookings = async (status?: string) => {
    setLoading(true)
    try {
      console.log('Testing mentor bookings for:', testMentorId, 'status:', status)
      const result = await getMentorBookings(testMentorId, status)
      console.log('Mentor bookings result:', result)
      setResults({
        type: `Mentor Bookings (${status || 'all'})`,
        data: result,
        timestamp: new Date().toLocaleTimeString()
      })
    } catch (error) {
      console.error('Error testing bookings:', error)
      setResults({
        type: 'Error',
        data: { error: error.message },
        timestamp: new Date().toLocaleTimeString()
      })
    }
    setLoading(false)
  }

  const testCreateBooking = async () => {
    setLoading(true)
    try {
      const bookingData = {
        studentId: 'test_student_123',
        mentorId: testMentorId,
        date: testDate,
        timeSlot: '10:00-11:00',
        sessionType: 'individual' as const,
        notes: 'Test booking from debug component',
        studentInfo: {
          name: 'Test Student',
          email: 'test@student.com',
          phone: '123-456-7890'
        }
      }
      
      console.log('Testing create booking:', bookingData)
      const result = await createBooking(bookingData)
      console.log('Create booking result:', result)
      setResults({
        type: 'Create Booking Test',
        data: result,
        timestamp: new Date().toLocaleTimeString()
      })
    } catch (error) {
      console.error('Error creating test booking:', error)
      setResults({
        type: 'Error',
        data: { error: error.message },
        timestamp: new Date().toLocaleTimeString()
      })
    }
    setLoading(false)
  }

  const testUpdateStatus = async () => {
    setLoading(true)
    try {
      // First get bookings to find one to update
      const bookingsResult = await getMentorBookings(testMentorId, 'pending')
      if (bookingsResult.success && bookingsResult.data && bookingsResult.data.length > 0) {
        const bookingToUpdate = bookingsResult.data[0]
        console.log('Testing status update for booking:', bookingToUpdate.id)
        
        const result = await updateBookingStatus(bookingToUpdate.id, 'confirmed', 'Test approval from debug')
        console.log('Update status result:', result)
        setResults({
          type: 'Update Status Test',
          data: { updateResult: result, originalBooking: bookingToUpdate },
          timestamp: new Date().toLocaleTimeString()
        })
      } else {
        setResults({
          type: 'Update Status Test',
          data: { error: 'No pending bookings found to update' },
          timestamp: new Date().toLocaleTimeString()
        })
      }
    } catch (error) {
      console.error('Error testing status update:', error)
      setResults({
        type: 'Error',
        data: { error: error.message },
        timestamp: new Date().toLocaleTimeString()
      })
    }
    setLoading(false)
  }

  const testMentorRoles = async () => {
    setLoading(true)
    try {
      console.log('Testing mentor role lookup...')
      
      // Test the same query used in getAvailableTimeSlots
      const usersRef = collection(db, 'users')
      const mentorsQuery = query(
        usersRef,
        where('role', 'in', ['admin', 'mentor', 'teacher'])
      )
      
      const mentorsSnapshot = await getDocs(mentorsQuery)
      const mentors = mentorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      console.log('Found mentors:', mentors)
      
      setResults({
        type: 'Mentor Roles Lookup',
        data: {
          totalFound: mentors.length,
          mentors: mentors,
          mentorIds: mentors.map(m => m.id),
          testMentorIncluded: mentors.some(m => m.id === testMentorId)
        },
        timestamp: new Date().toLocaleTimeString()
      })
    } catch (error) {
      console.error('Error testing mentor roles:', error)
      setResults({
        type: 'Error',
        data: { error: error.message },
        timestamp: new Date().toLocaleTimeString()
      })
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking System Debug</h2>
      
      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Date</label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mentor ID</label>
          <input
            type="text"
            value={testMentorId}
            onChange={(e) => setTestMentorId(e.target.value)}
            placeholder="Enter mentor/admin ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <button
          onClick={testAvailableSlots}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Test Slots (Specific Mentor)
        </button>
        
        <button
          onClick={testAllAvailableSlots}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
        >
          Test Slots (All Mentors)
        </button>
        
        <button
          onClick={() => testMentorBookings()}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Test All Bookings
        </button>
        
        <button
          onClick={() => testMentorBookings('pending')}
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
        >
          Test Pending Bookings
        </button>
        
        <button
          onClick={() => testMentorBookings('confirmed')}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          Test Confirmed Bookings
        </button>
        
        <button
          onClick={testCreateBooking}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Test Create Booking
        </button>
        
        <button
          onClick={testUpdateStatus}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          Test Update Status
        </button>
        
        <button
          onClick={testMentorRoles}
          disabled={loading}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
        >
          Test Mentor Roles
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Running test...</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{results.type}</h3>
            <span className="text-sm text-gray-500">{results.timestamp}</span>
          </div>
          <div className="bg-white rounded border p-3">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(results.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {/* Current User Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Current User Info:</h4>
        <div className="text-sm text-blue-800">
          <p>User ID: {userData?.uid || 'Not logged in'}</p>
          <p>Name: {userData?.name || 'Unknown'}</p>
          <p>Email: {userData?.email || 'Unknown'}</p>
          <p>Role: {userData?.role || 'Unknown'}</p>
        </div>
      </div>
    </div>
  )
}