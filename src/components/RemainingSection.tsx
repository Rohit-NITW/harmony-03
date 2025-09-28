import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import SafeImage from './SafeImage'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import AppointmentBooking from './AppointmentBooking'
import StudentAppointments from './StudentAppointments'

// Support Groups Component
export function SupportGroups() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const supportGroups = [
    {
      name: 'Depression Support Circle',
      category: 'depression',
      schedule: 'Wednesdays 7:00 PM',
      format: 'In-person & Virtual',
      description: 'A safe space to share experiences and coping strategies for managing depression.',
      members: 12,
      facilitator: 'Dr. Sarah Chen, LCSW'
    },
    {
      name: 'Anxiety Management Group',
      category: 'anxiety',
      schedule: 'Mondays 6:00 PM',
      format: 'Virtual',
      description: 'Learn and practice anxiety management techniques with peers.',
      members: 8,
      facilitator: 'Mark Thompson, LPC'
    },
    {
      name: 'Student Stress Support',
      category: 'stress',
      schedule: 'Fridays 5:00 PM',
      format: 'In-person',
      description: 'Addressing academic stress, time management, and work-life balance.',
      members: 15,
      facilitator: 'Dr. Emily Rodriguez, PhD'
    },
    {
      name: 'LGBTQ+ Mental Health',
      category: 'identity',
      schedule: 'Thursdays 7:30 PM',
      format: 'Virtual',
      description: 'Support group focused on LGBTQ+ specific mental health challenges.',
      members: 10,
      facilitator: 'Alex Kim, LMFT'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Groups', count: supportGroups.length },
    { id: 'depression', name: 'Depression', count: supportGroups.filter(g => g.category === 'depression').length },
    { id: 'anxiety', name: 'Anxiety', count: supportGroups.filter(g => g.category === 'anxiety').length },
    { id: 'stress', name: 'Stress', count: supportGroups.filter(g => g.category === 'stress').length },
    { id: 'identity', name: 'Identity', count: supportGroups.filter(g => g.category === 'identity').length }
  ]

  const filteredGroups = selectedCategory === 'all' 
    ? supportGroups 
    : supportGroups.filter(group => group.category === selectedCategory)

  return (
    <section id="groups" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Support Groups</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Connect with peers who understand your journey. Join supportive communities led by licensed professionals.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {filteredGroups.map((group, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-slate-900">{group.name}</h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  {group.members} members
                </span>
              </div>
              
              <p className="text-slate-600 mb-6">{group.description}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-lg">📅</span>
                  {group.schedule}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-lg">💻</span>
                  {group.format}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-lg">👨‍⚕️</span>
                  Led by {group.facilitator}
                </div>
              </div>
              
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Request to Join
              </button>
            </div>
          ))}
        </div>

        {/* Join Information */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">How to Join a Support Group</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">1</div>
              <h4 className="font-bold text-slate-900 mb-2">Browse Groups</h4>
              <p className="text-slate-600">Explore different support groups and find ones that match your needs.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">2</div>
              <h4 className="font-bold text-slate-900 mb-2">Request Access</h4>
              <p className="text-slate-600">Submit a request to join. All groups are moderated for safety and support.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">3</div>
              <h4 className="font-bold text-slate-900 mb-2">Participate</h4>
              <p className="text-slate-600">Join meetings, share your experience, and support others in their journey.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Progress Tracking Component
export function ProgressTracking() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  return (
    <section id="progress" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Track Your Progress</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Monitor your mental health journey with personalized insights and data-driven feedback.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Mood Tracker */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl">😊</div>
              <h3 className="text-xl font-bold text-slate-900">Daily Mood</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">7.2/10</div>
            <p className="text-slate-600 mb-4">Average this week</p>
            <div className="flex gap-2 mb-4">
              {['😢', '😔', '😐', '😊', '😃'].map((emoji, index) => (
                <button
                  key={index}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    index === 3 ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Log Today's Mood
            </button>
          </div>

          {/* Sleep Tracker */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center text-2xl">😴</div>
              <h3 className="text-xl font-bold text-slate-900">Sleep Quality</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">6.8 hrs</div>
            <p className="text-slate-600 mb-4">Average sleep time</p>
            <div className="bg-white rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Sleep Quality</span>
                <span>Good</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Log Sleep
            </button>
          </div>

          {/* Stress Level */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center text-2xl">😰</div>
              <h3 className="text-xl font-bold text-slate-900">Stress Level</h3>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">4.2/10</div>
            <p className="text-slate-600 mb-4">Lower than last week</p>
            <div className="bg-white rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Trend</span>
                <span className="text-green-600">↓ Improving</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-2/5"></div>
              </div>
            </div>
            <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors">
              Log Stress
            </button>
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-slate-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Your Goals</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-900">Exercise 3x per week</h4>
                <span className="text-green-600 font-bold">2/3</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                <div className="bg-green-600 h-2 rounded-full w-2/3"></div>
              </div>
              <p className="text-sm text-slate-600">Great progress! You're almost there.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-900">Meditation daily</h4>
                <span className="text-blue-600 font-bold">5/7</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                <div className="bg-blue-600 h-2 rounded-full w-5/7"></div>
              </div>
              <p className="text-sm text-slate-600">Excellent consistency this week!</p>
            </div>
          </div>
          
          <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Add New Goal
          </button>
        </div>
      </div>
    </section>
  )
}

// Find Help Component
export function FindHelp() {
  const { currentUser } = useAuth()
  const [showBookingModal, setShowBookingModal] = React.useState(false)
  const [success, setSuccess] = React.useState('')

  const handleBookingSuccess = () => {
    setShowBookingModal(false)
    setSuccess('Appointment booked successfully! You will receive an email once it\'s approved.')
    setTimeout(() => setSuccess(''), 5000)
  }

  return (
    <section id="find-help" className="py-20 bg-gradient-to-br from-green-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Find Professional Help</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Book appointments with licensed mental health professionals. All providers are vetted and specialize in student mental health.
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 text-center">
            {success}
          </div>
        )}

        {/* My Appointments Section - Only show for logged in users */}
        {currentUser && (
          <div className="mb-12">
            <StudentAppointments showBookingButton={false} />
          </div>
        )}

        {/* Book Appointment Section */}
        {currentUser && (
          <div className="mb-12 text-center">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Book an Appointment</h3>
              <p className="text-slate-600 mb-6">Schedule a session with our licensed mental health professionals</p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 font-medium shadow-lg text-lg"
              >
                Book New Appointment
              </button>
            </div>
          </div>
        )}

        {/* Emergency Notice */}
        <div className="mt-12 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-red-800 mb-2">Need Immediate Help?</h3>
          <p className="text-red-700 mb-4">
            If you're experiencing a mental health emergency, don't wait for an appointment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/crisis" className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              Crisis Resources
            </Link>
            <a href="tel:988" className="border border-red-600 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
              Call 988
            </a>
          </div>
        </div>

        {/* Booking Modal */}
        <AnimatePresence>
          {showBookingModal && (
            <AppointmentBooking
              onClose={() => setShowBookingModal(false)}
              onSuccess={handleBookingSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// About Component
export function About() {
  return (
    <section id="about" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">About Harmony</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Empowering students with comprehensive mental health support, resources, and professional guidance throughout their academic journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h3>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Harmony was created to bridge the gap between students and mental health resources. We believe that mental health support should be accessible,
              comprehensive, and tailored to the unique challenges of academic life.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Our platform combines evidence-based assessments, professional resources, peer support, and crisis intervention to create a holistic 
              approach to student mental wellness.
            </p>
          </div>
          <div className="relative">
            <SafeImage
              src="/assets/hero-mental-health.svg"
              alt="About Harmony illustration"
              className="w-full h-80 object-contain bg-white rounded-xl shadow-lg"
              fallbackSrc="/assets/hero-placeholder.svg"
            />
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: '🔒',
              title: 'Privacy First',
              description: 'All data is encrypted and HIPAA compliant. Your privacy and confidentiality are our top priorities.'
            },
            {
              icon: '🎓',
              title: 'Student-Focused',
              description: 'Designed specifically for the unique mental health challenges faced by college and university students.'
            },
            {
              icon: '🌟',
              title: 'Evidence-Based',
              description: 'All tools and resources are based on proven psychological principles and therapeutic approaches.'
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center shadow-md">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Get in Touch</h3>
            <p className="text-slate-600">
              Have questions about our platform? Need support? We're here to help.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">📧</div>
              <h4 className="font-bold text-slate-900 mb-1">Email Support</h4>
              <p className="text-slate-600">support@harmony.edu</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📞</div>
              <h4 className="font-bold text-slate-900 mb-1">Phone Support</h4>
              <p className="text-slate-600">1-800-HARMONY</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🕒</div>
              <h4 className="font-bold text-slate-900 mb-1">Hours</h4>
              <p className="text-slate-600">Mon-Fri 9AM-5PM EST</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}