import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { 
  getAdminProfiles, 
  getAvailableTimeSlots, 
  bookAppointment 
} from '../services/firebase'

interface Admin {
  id: string
  name: string
  email: string
  specialization?: string
  bio?: string
  profileImage?: string
  experience?: string
}

interface TimeSlot {
  availabilityId: string
  adminId: string
  timeSlot: string
  sessionType: string
  date: string
}

interface AppointmentBookingProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AppointmentBooking({ onClose, onSuccess }: AppointmentBookingProps) {
  const { userData, currentUser } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [error, setError] = useState('')

  // Form data
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [sessionType, setSessionType] = useState<'individual' | 'group'>('individual')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [notes, setNotes] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    setLoading(true)
    try {
      const result = await getAdminProfiles()
      if (result.success && result.data && result.data.length > 0) {
        setAdmins(result.data)
      } else {
        // Fallback data for testing if no admins are found - using admin_001 to match default mentor
        const fallbackAdmins = [
          {
            id: 'admin_001',
            name: 'Dr. Sarah Mitchell',
            email: 'sarah@harmony.edu',
            specialization: 'Clinical Psychology',
            bio: 'Specializing in cognitive behavioral therapy and trauma-informed care.',
            experience: '15+ years experience'
          },
          {
            id: 'admin_002', 
            name: 'Dr. Michael Rodriguez',
            email: 'michael@harmony.edu',
            specialization: 'Psychiatry',
            bio: 'Board-certified psychiatrist focusing on medication management.',
            experience: '12+ years experience'
          }
        ]
        setAdmins(fallbackAdmins)
      }
    } catch (error) {
      console.error('Error loading admins:', error)
      setError('Failed to load available professionals')
    }
    setLoading(false)
  }

  const loadAvailableSlots = async () => {
    if (!selectedDate || !sessionType) return
    
    setLoading(true)
    setError('')
    
    try {
      console.log('Loading available slots for:', {
        date: selectedDate, 
        sessionType, 
        selectedAdminId: selectedAdmin?.id,
        selectedAdminInfo: selectedAdmin
      })
      
      // Pass the selected admin's ID as mentorId for slot checking
      const result = await getAvailableTimeSlots(selectedDate, sessionType, selectedAdmin?.id)
      console.log('Available slots result:', {
        success: result.success,
        dataLength: result.data?.length || 0,
        data: result.data,
        error: result.error
      })
      
      if (result.success && result.data && result.data.length > 0) {
        console.log('Processing raw slots from Firebase:', result.data)
        
        // Filter slots to only show ones for the selected admin
        let adminSlots = result.data.filter(slot => 
          slot.mentorId === selectedAdmin?.id
        )
        
        console.log('Slots filtered for selected admin:', {
          selectedAdminId: selectedAdmin?.id,
          rawSlots: result.data.length,
          filteredSlots: adminSlots.length,
          adminSlots
        })
        
        // Map the slots to have adminId for compatibility
        const mappedSlots = adminSlots.map(slot => ({
          availabilityId: slot.availabilityId || `default_${slot.timeSlot}`,
          adminId: slot.mentorId || slot.adminId, // Convert mentorId to adminId
          timeSlot: slot.timeSlot,
          sessionType: slot.sessionType,
          date: slot.date
        }))
        
        console.log('Final mapped slots for UI:', mappedSlots)
        setAvailableSlots(mappedSlots)
      } else {
        console.log('No slots returned from Firebase, using fallback slots for admin:', selectedAdmin?.id)
        // Fallback time slots for testing - using the selected admin's ID
        const fallbackSlots = [
          {
            availabilityId: 'fallback-1',
            adminId: selectedAdmin?.id || 'unknown_admin',
            timeSlot: '09:00-10:00',
            sessionType,
            date: selectedDate
          },
          {
            availabilityId: 'fallback-2', 
            adminId: selectedAdmin?.id || 'unknown_admin',
            timeSlot: '10:00-11:00',
            sessionType,
            date: selectedDate
          },
          {
            availabilityId: 'fallback-3',
            adminId: selectedAdmin?.id || 'unknown_admin',
            timeSlot: '11:00-12:00',
            sessionType,
            date: selectedDate
          },
          {
            availabilityId: 'fallback-4',
            adminId: selectedAdmin?.id || 'unknown_admin',
            timeSlot: '14:00-15:00',
            sessionType,
            date: selectedDate
          },
          {
            availabilityId: 'fallback-5',
            adminId: selectedAdmin?.id || 'unknown_admin',
            timeSlot: '15:00-16:00',
            sessionType,
            date: selectedDate
          }
        ]
        setAvailableSlots(fallbackSlots)
        setError('Using default time slots for testing - check console for details')
      }
    } catch (error) {
      console.error('Error loading available slots:', error)
      // Still provide fallback data even on error for testing
      const fallbackSlots = [
        {
          availabilityId: 'error-fallback-1',
          adminId: selectedAdmin?.id || 'unknown_admin',
          timeSlot: '09:00-10:00',
          sessionType,
          date: selectedDate
        },
        {
          availabilityId: 'error-fallback-2',
          adminId: selectedAdmin?.id || 'unknown_admin',
          timeSlot: '14:00-15:00',
          sessionType,
          date: selectedDate
        }
      ]
      setAvailableSlots(fallbackSlots)
      setError('Error loading slots, using fallback data')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (selectedDate && sessionType && selectedAdmin) {
      loadAvailableSlots()
    }
  }, [selectedDate, sessionType, selectedAdmin])

  // Reset selected time slot when date or admin changes
  useEffect(() => {
    setSelectedTimeSlot('')
  }, [selectedDate, selectedAdmin])

  const handleBookAppointment = async () => {
    if (!selectedAdmin || !selectedDate || !selectedTimeSlot || !currentUser) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('Booking appointment with data:', {
        studentId: currentUser.uid,
        adminId: selectedAdmin.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        sessionType,
        notes,
        studentName: userData?.name || 'Student',
        studentEmail: userData?.email || currentUser.email,
        studentPhone: phone
      })
      console.log('Selected admin details:', selectedAdmin)
      console.log('This adminId will become mentorId:', selectedAdmin.id)
      
      const result = await bookAppointment({
        studentId: currentUser.uid,
        adminId: selectedAdmin.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        sessionType,
        notes,
        studentName: userData?.name || 'Student',
        studentEmail: userData?.email || currentUser.email || 'student@example.com',
        studentPhone: phone
      })

      console.log('Booking result:', result)
      
      if (result.success) {
        alert('Appointment booked successfully! You will receive an email once approved.')
        onSuccess()
      } else {
        setError(result.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      setError('Network error - please try again')
    }
    
    setLoading(false)
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30) // 30 days in advance
    return maxDate.toISOString().split('T')[0]
  }

  const formatTimeSlot = (timeSlot: string) => {
    const [start, end] = timeSlot.split('-')
    return `${start} - ${end}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Book an Appointment</h2>
              <p className="text-blue-100">Schedule a session with our trained professionals</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 flex items-center space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-white text-blue-600' : 'bg-blue-500 text-blue-200'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > stepNum ? 'bg-white' : 'bg-blue-500'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Select Session Type & Professional</h3>
                
                {/* Session Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Session Type</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setSessionType('individual')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        sessionType === 'individual'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">👤</div>
                      <h4 className="font-semibold">Individual Session</h4>
                      <p className="text-sm text-slate-600">One-on-one counseling</p>
                    </button>
                    
                    <button
                      onClick={() => setSessionType('group')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        sessionType === 'group'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">👥</div>
                      <h4 className="font-semibold">Group Session</h4>
                      <p className="text-sm text-slate-600">Group counseling session</p>
                    </button>
                  </div>
                </div>

                {/* Professional Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Select Professional</label>
                  {loading && !admins.length ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {admins.map((admin) => (
                        <button
                          key={admin.id}
                          onClick={() => setSelectedAdmin(admin)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            selectedAdmin?.id === admin.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {admin.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{admin.name}</h4>
                              <p className="text-sm text-slate-600">{admin.specialization || 'Mental Health Professional'}</p>
                              {admin.experience && (
                                <p className="text-xs text-slate-500">{admin.experience}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Select Date & Time</h3>
                
                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Available Time Slots */}
                {selectedDate && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Available Time Slots</label>
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedTimeSlot(slot.timeSlot)}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              selectedTimeSlot === slot.timeSlot
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="text-sm font-semibold">
                              {formatTimeSlot(slot.timeSlot)}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-slate-50 rounded-lg">
                        <div className="text-4xl mb-2">📅</div>
                        <p className="text-slate-600">No available slots for this date</p>
                        <p className="text-sm text-slate-500">Please try another date</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Confirm Your Appointment</h3>
                
                {/* Appointment Summary */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-3">Appointment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Professional:</span>
                      <span className="font-medium">{selectedAdmin?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Session Type:</span>
                      <span className="font-medium capitalize">{sessionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Date:</span>
                      <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Time:</span>
                      <span className="font-medium">{formatTimeSlot(selectedTimeSlot)}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific concerns or topics you'd like to discuss..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (step > 1) {
                setStep(step - 1)
                setError('')
              } else {
                onClose()
              }
            }}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
          >
            {step > 1 ? 'Previous' : 'Cancel'}
          </button>

          <button
            onClick={() => {
              setError('')
              
              if (step < 3) {
                // Validation for step 1
                if (step === 1) {
                  if (!sessionType) {
                    setError('Please select a session type')
                    return
                  }
                  if (!selectedAdmin) {
                    setError('Please select a professional')
                    return
                  }
                }
                
                // Validation for step 2
                if (step === 2) {
                  if (!selectedDate) {
                    setError('Please select a date')
                    return
                  }
                  if (!selectedTimeSlot) {
                    setError('Please select a time slot')
                    return
                  }
                }
                
                setStep(prev => prev + 1)
              } else {
                handleBookAppointment()
              }
            }}
            disabled={loading || (step === 1 && (!sessionType || !selectedAdmin))}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {step === 3 ? 'Booking...' : 'Loading...'}
              </div>
            ) : (
              step === 3 ? 'Book Appointment' : 'Next'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}