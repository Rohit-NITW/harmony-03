import React, { useState } from 'react'
import { bookAppointment, getAdminAppointments, getAvailableTimeSlots, getStudentBookings, getMentorBookings } from '../services/firebase'
import { auth, db } from '../config/firebase'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

export default function AppointmentDebugger() {
  const { currentUser, userData } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    console.log('AppointmentDebugger:', message)
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testBookAppointment = async () => {
    setLoading(true)
    addLog('Starting appointment booking test...')
    
    try {
      const testAppointmentData = {
        studentId: 'test_student_123',
        adminId: 'admin_001',
        date: '2024-01-15',
        timeSlot: '10:00-11:00',
        sessionType: 'individual' as const,
        notes: 'Debug test appointment',
        studentName: 'Test Student',
        studentEmail: 'test@student.com',
        studentPhone: '123-456-7890'
      }
      
      addLog(`Booking appointment with data: ${JSON.stringify(testAppointmentData, null, 2)}`)
      
      const result = await bookAppointment(testAppointmentData)
      
      if (result.success) {
        addLog(`✅ Appointment booked successfully! ID: ${result.id}`)
      } else {
        addLog(`❌ Failed to book appointment: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Exception during booking: ${error}`)
    }
    
    setLoading(false)
  }

  const testGetAppointments = async () => {
    setLoading(true)
    addLog('Starting appointment retrieval test...')
    
    try {
      const adminId = 'admin_001'
      
      addLog(`Getting appointments for admin: ${adminId}`)
      
      const result = await getAdminAppointments(adminId)
      
      if (result.success) {
        addLog(`✅ Retrieved ${result.data.length} appointments`)
        result.data.forEach((apt, index) => {
          addLog(`   ${index + 1}. ID: ${apt.id}, Student: ${apt.studentInfo?.name || 'Unknown'}, Date: ${apt.date}, Status: ${apt.status}`)
        })
      } else {
        addLog(`❌ Failed to get appointments: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Exception during retrieval: ${error}`)
    }
    
    setLoading(false)
  }

  const testFullFlow = async () => {
    addLog('=== Starting Full Flow Test ===')
    await testBookAppointment()
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
    await testGetAppointments()
    addLog('=== Full Flow Test Complete ===')
  }

  const testAvailableSlots = async () => {
    setLoading(true)
    addLog('=== Testing Available Time Slots ===')
    
    try {
      const testDate = '2024-01-15'
      const sessionType = 'individual'
      
      addLog(`Testing getAvailableTimeSlots for date: ${testDate}, sessionType: ${sessionType}`)
      
      const result = await getAvailableTimeSlots(testDate, sessionType)
      addLog(`getAvailableTimeSlots result:`, JSON.stringify(result, null, 2))
      
      if (result.success) {
        addLog(`✅ Found ${result.data.length} available slots`)
        result.data.forEach((slot, index) => {
          addLog(`  ${index + 1}. Time: ${slot.timeSlot}, MentorId: ${slot.mentorId}, Date: ${slot.date}`)
        })
      } else {
        addLog(`❌ Failed to get available slots: ${result.error}`)
      }
      
    } catch (error) {
      addLog(`❌ Exception during slot testing: ${error}`)
    }
    
    setLoading(false)
  }

  const testFirebaseBookings = async () => {
    setLoading(true)
    addLog('=== Checking Firebase Bookings Collection Directly ===')
    
    try {
      addLog('Querying all documents in bookings collection...')
      const bookingsRef = collection(db, 'bookings')
      const allBookingsQuery = query(bookingsRef)
      const snapshot = await getDocs(allBookingsQuery)
      
      addLog(`Found ${snapshot.size} total documents in bookings collection`)
      
      if (snapshot.size === 0) {
        addLog('❌ No bookings found in Firebase - try booking an appointment first')
      } else {
        addLog('All bookings in database:')
        snapshot.forEach((doc, index) => {
          const data = doc.data()
          addLog(`  ${index + 1}. ID: ${doc.id}`)
          addLog(`      MentorId: ${data.mentorId}`)
          addLog(`      StudentId: ${data.studentId}`)
          addLog(`      Date: ${data.date}`)
          addLog(`      TimeSlot: ${data.timeSlot}`)
          addLog(`      ApprovalStatus: ${data.approvalStatus}`)
          addLog(`      Created: ${data.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}`)
          addLog(`      StudentInfo: ${JSON.stringify(data.studentInfo)}`)
        })
        
        // Test specific query for admin_001
        addLog('\n--- Testing query for mentorId: admin_001 ---')
        const adminQuery = query(bookingsRef, where('mentorId', '==', 'admin_001'))
        const adminSnapshot = await getDocs(adminQuery)
        addLog(`Found ${adminSnapshot.size} bookings for mentorId: admin_001`)
        
        // Test query for pending status
        addLog('\n--- Testing query for pending status ---')
        const pendingQuery = query(bookingsRef, where('approvalStatus', '==', 'pending'))
        const pendingSnapshot = await getDocs(pendingQuery)
        addLog(`Found ${pendingSnapshot.size} bookings with pending status`)
      }
      
    } catch (error) {
      addLog(`❌ Error checking Firebase bookings: ${error}`)
    }
    
    setLoading(false)
  }

  const testBookingConflicts = async () => {
    setLoading(true)
    addLog('=== Testing Booking Conflict Prevention ===')
    
    try {
      const baseAppointmentData = {
        adminId: 'admin_001',
        date: '2024-01-20',
        timeSlot: '10:00-11:00',
        notes: 'Conflict test appointment',
        studentName: 'Test Student 1',
        studentEmail: 'test1@student.com'
      }
      
      // Test 1: Book first individual appointment
      addLog('Test 1: Booking first individual appointment...')
      const booking1 = await bookAppointment({
        ...baseAppointmentData,
        studentId: 'test_student_001',
        sessionType: 'individual'
      })
      
      if (booking1.success) {
        addLog('✅ First individual appointment booked successfully')
      } else {
        addLog(`❌ First booking failed: ${booking1.error}`)
      }
      
      // Test 2: Try to book same slot with different student (should fail)
      addLog('Test 2: Trying to book same individual slot with different student (should fail)...')
      const booking2 = await bookAppointment({
        ...baseAppointmentData,
        studentId: 'test_student_002',
        sessionType: 'individual',
        studentName: 'Test Student 2',
        studentEmail: 'test2@student.com'
      })
      
      if (!booking2.success) {
        addLog(`✅ Correctly prevented double booking: ${booking2.error}`)
      } else {
        addLog('❌ ERROR: Double booking was allowed!')
      }
      
      // Test 3: Try to book group session on same slot (should fail)
      addLog('Test 3: Trying to book group session on same slot as individual (should fail)...')
      const booking3 = await bookAppointment({
        ...baseAppointmentData,
        studentId: 'test_student_003',
        sessionType: 'group',
        studentName: 'Test Student 3',
        studentEmail: 'test3@student.com'
      })
      
      if (!booking3.success) {
        addLog(`✅ Correctly prevented group booking over individual: ${booking3.error}`)
      } else {
        addLog('❌ ERROR: Group booking over individual was allowed!')
      }
      
      // Test 4: Try same student booking same slot again (should fail)
      addLog('Test 4: Same student trying to book same slot again (should fail)...')
      const booking4 = await bookAppointment({
        ...baseAppointmentData,
        studentId: 'test_student_001', // Same student as Test 1
        sessionType: 'individual'
      })
      
      if (!booking4.success) {
        addLog(`✅ Correctly prevented duplicate booking: ${booking4.error}`)
      } else {
        addLog('❌ ERROR: Duplicate booking by same student was allowed!')
      }
      
      addLog('=== Conflict Testing Complete ===')
      
    } catch (error) {
      addLog(`❌ Conflict test failed with error: ${error}`)
    }
    
    setLoading(false)
  }

  const testFirebaseConnection = async () => {
    setLoading(true)
    addLog('=== Testing Firebase Connection ===')
    
    try {
      // Test auth connection
      addLog(`Auth user: ${currentUser ? currentUser.uid : 'Not logged in'}`)
      addLog(`User data: ${userData ? JSON.stringify(userData) : 'No user data'}`)
      
      // Test basic Firestore connection
      addLog('Testing Firestore connection...')
      const testCollection = collection(db, 'test')
      addLog('✅ Firestore connection successful')
      
      // Test reading appointments collection
      addLog('Testing appointments collection access...')
      const appointmentsRef = collection(db, 'appointments')
      const allAppointmentsQuery = query(appointmentsRef)
      const snapshot = await getDocs(allAppointmentsQuery)
      addLog(`✅ Found ${snapshot.size} total appointments in database`)
      
      // Test specific admin query using our fixed function
      addLog('Testing admin-specific query using getAdminAppointments function...')
      const adminResult = await getAdminAppointments('admin_001')
      if (adminResult.success) {
        addLog(`✅ getAdminAppointments function returned ${adminResult.data.length} appointments for admin_001`)
      } else {
        addLog(`❌ getAdminAppointments function failed: ${adminResult.error}`)
      }
      
      // List all appointments
      if (snapshot.size > 0) {
        addLog('All appointments in database:')
        snapshot.forEach((doc) => {
          const data = doc.data()
          addLog(`  - ID: ${doc.id}, AdminId: ${data.adminId}, StudentId: ${data.studentId}, Status: ${data.status}, Date: ${data.date}`)
        })
      } else {
        addLog('No appointments found in database')
      }
      
    } catch (error: any) {
      addLog(`❌ Firebase connection error: ${error.message}`)
      addLog(`❌ Error code: ${error.code || 'unknown'}`)
      addLog(`❌ Full error: ${JSON.stringify(error, null, 2)}`)
    }
    
    setLoading(false)
  }

  const testSimpleWrite = async () => {
    setLoading(true)
    addLog('=== Testing Simple Write Operation ===')
    
    try {
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Debug test document'
      }
      
      addLog('Attempting to write test document...')
      const docRef = await addDoc(collection(db, 'debug_test'), testData)
      addLog(`✅ Test document created with ID: ${docRef.id}`)
      
    } catch (error: any) {
      addLog(`❌ Write operation failed: ${error.message}`)
      addLog(`❌ Error code: ${error.code || 'unknown'}`)
    }
    
    setLoading(false)
  }

  const testUnifiedBookingSystem = async () => {
    setLoading(true)
    addLog('=== Testing Unified Booking System ===')
    
    try {
      // Test 1: Book appointment
      addLog('Step 1: Testing appointment booking...')
      const testBookingData = {
        studentId: 'test_student_unified',
        adminId: 'admin_001',
        date: '2024-01-20',
        timeSlot: '10:00-11:00',
        sessionType: 'individual',
        notes: 'Unified system test booking',
        studentName: 'Test Student',
        studentEmail: 'test@unified.com'
      }
      
      const bookingResult = await bookAppointment(testBookingData)
      if (bookingResult.success) {
        addLog(`✅ Booking created with ID: ${bookingResult.bookingId || bookingResult.id}`)
        
        // Test 2: Check student can see their booking
        addLog('Step 2: Testing student booking retrieval...')
        const studentResult = await getStudentBookings('test_student_unified')
        if (studentResult.success) {
          addLog(`✅ Student can see ${studentResult.data.length} bookings`)
          studentResult.data.forEach((booking, index) => {
            addLog(`   ${index + 1}. Status: ${booking.approvalStatus}, Date: ${booking.date}, Time: ${booking.timeSlot}`)
          })
        } else {
          addLog(`❌ Student retrieval failed: ${studentResult.error}`)
        }
        
        // Test 3: Check admin can see the booking
        addLog('Step 3: Testing admin booking retrieval...')
        const adminResult = await getMentorBookings('admin_001')
        if (adminResult.success) {
          addLog(`✅ Admin can see ${adminResult.data.length} bookings`)
          const testBooking = adminResult.data.find(b => b.studentId === 'test_student_unified')
          if (testBooking) {
            addLog(`✅ Found test booking - Status: ${testBooking.approvalStatus}, Student: ${testBooking.studentInfo.name}`)
          } else {
            addLog('❌ Test booking not found in admin results')
          }
        } else {
          addLog(`❌ Admin retrieval failed: ${adminResult.error}`)
        }
        
        addLog('=== Unified Booking System Test Complete ===')
      } else {
        addLog(`❌ Booking failed: ${bookingResult.error}`)
      }
    } catch (error) {
      addLog(`❌ Test failed with exception: ${error}`)
    }
    
    setLoading(false)
  }

  const clearLogs = () => {
    setTestResults([])
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Firebase Appointment Debugger</h2>
        <p className="text-gray-600">Test appointment booking and retrieval functions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testFirebaseConnection}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Firebase Connection'}
        </button>
        
        <button
          onClick={testSimpleWrite}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Simple Write'}
        </button>
        
        <button
          onClick={testBookAppointment}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Book Appointment'}
        </button>
        
        <button
          onClick={testGetAppointments}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Get Appointments'}
        </button>
        
        <button
          onClick={testFullFlow}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Full Flow'}
        </button>
        
        <button
          onClick={testBookingConflicts}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Booking Conflicts'}
        </button>
        
        <button
          onClick={testAvailableSlots}
          disabled={loading}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Available Slots'}
        </button>
        
        <button
          onClick={testFirebaseBookings}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Check Firebase Bookings'}
        </button>
        
        <button
          onClick={testUnifiedBookingSystem}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Unified System'}
        </button>
        
        <button
          onClick={clearLogs}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Results:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500 italic">No tests run yet. Click a button above to start testing.</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-2 rounded text-sm font-mono ${
                  result.includes('✅') ? 'bg-green-100 text-green-800' :
                  result.includes('❌') ? 'bg-red-100 text-red-800' :
                  result.includes('===') ? 'bg-blue-100 text-blue-800 font-bold' :
                  'bg-white text-gray-700'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}