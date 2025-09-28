import { useState } from 'react'
import { Link } from 'react-router-dom'
import SafeImage from '../components/SafeImage'

const crisisResources = [
  {
    title: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: '24/7, free and confidential support for people in distress, prevention and crisis resources.',
    availability: '24/7',
    type: 'National Hotline',
    urgent: true
  },
  {
    title: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free, 24/7 support for those in crisis. Text with a trained Crisis Counselor.',
    availability: '24/7',
    type: 'Text Support',
    urgent: true
  },
  {
    title: 'National Alliance on Mental Illness (NAMI)',
    phone: '1-800-950-6264',
    description: 'Information, support groups, and advocacy for individuals and families affected by mental illness.',
    availability: 'Mon-Fri 10am-10pm ET',
    type: 'Support & Information',
    urgent: false
  },
  {
    title: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    description: 'Treatment referral and information service for mental health and substance use disorders.',
    availability: '24/7',
    type: 'Treatment Referral',
    urgent: false
  }
]

const safetyPlanSteps = [
  {
    step: 1,
    title: 'Warning Signs',
    description: 'List your personal warning signs that a crisis may be developing',
    examples: ['Feeling hopeless', 'Isolating from others', 'Increased anxiety', 'Sleep problems']
  },
  {
    step: 2,
    title: 'Coping Strategies',
    description: 'Identify coping strategies you can use on your own',
    examples: ['Deep breathing', 'Listen to music', 'Take a walk', 'Journal writing']
  },
  {
    step: 3,
    title: 'Social Support',
    description: 'List people and social settings that provide distraction',
    examples: ['Call a friend', 'Visit family', 'Go to a coffee shop', 'Attend a support group']
  },
  {
    step: 4,
    title: 'Professional Contacts',
    description: 'List professionals or agencies you can contact during a crisis',
    examples: ['Therapist', 'Doctor', 'Case manager', 'Crisis hotline']
  },
  {
    step: 5,
    title: 'Safe Environment',
    description: 'Make your environment safe by removing means of harm',
    examples: ['Remove sharp objects', 'Ask someone to hold medications', 'Avoid alcohol/drugs']
  },
  {
    step: 6,
    title: 'Emergency Contacts',
    description: 'The one thing most important to your survival',
    examples: ['Call 911', 'Go to emergency room', 'Call crisis hotline', 'Contact emergency contact']
  }
]

export default function CrisisSupport() {
  const [showSafetyPlan, setShowSafetyPlan] = useState(false)
  const [safetyPlanData, setSafetyPlanData] = useState({})

  const updateSafetyPlan = (step: number, value: string) => {
    setSafetyPlanData(prev => ({
      ...prev,
      [step]: value
    }))
  }

  return (
    <section id="crisis" className="py-20 bg-red-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Emergency Alert */}
        <div className="bg-red-600 text-white p-6 rounded-xl mb-12 text-center">
          <div className="text-4xl mb-4">🚨</div>
          <h2 className="text-3xl font-bold mb-4">Crisis Support - Get Help Now</h2>
          <p className="text-xl mb-6">
            If you're having thoughts of suicide or self-harm, please reach out for help immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:988"
              className="bg-white text-red-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-red-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              📞 Call 988
            </a>
            <a 
              href="sms:741741?&body=HOME"
              className="bg-red-700 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-red-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              💬 Text HOME to 741741
            </a>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">24/7 Crisis Resources</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            You're not alone. These resources are available anytime you need support, guidance, or someone to talk to.
          </p>
        </div>

        {/* Crisis Hotlines */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {crisisResources.map((resource, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-8 border-2 ${
                resource.urgent 
                  ? 'border-red-300 shadow-lg shadow-red-100' 
                  : 'border-slate-200 shadow-md'
              } hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  resource.urgent
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {resource.type}
                </div>
                {resource.urgent && (
                  <div className="text-red-600 text-2xl animate-pulse">⚡</div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {resource.title}
              </h3>

              <div className={`text-3xl font-bold mb-4 ${
                resource.urgent ? 'text-red-600' : 'text-blue-600'
              }`}>
                {resource.phone}
              </div>

              <p className="text-slate-600 mb-4">
                {resource.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-lg">🕒</span>
                {resource.availability}
              </div>

              <div className="mt-6 flex gap-3">
                {resource.phone.startsWith('Text') ? (
                  <a
                    href="sms:741741?&body=HOME"
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
                  >
                    Send Text
                  </a>
                ) : (
                  <a
                    href={`tel:${resource.phone.replace(/\D/g, '')}`}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                  >
                    Call Now
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Safety Planning */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Personal Safety Plan</h3>
            <p className="text-lg text-slate-600">
              Create a personalized safety plan to help you stay safe during difficult times.
            </p>
          </div>

          {!showSafetyPlan ? (
            <div className="text-center">
              <SafeImage
                src="/assets/feature-crisis.svg"
                alt="Safety planning illustration"
                className="w-64 h-48 mx-auto mb-6"
                fallbackSrc="/assets/hero-placeholder.svg"
              />
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                A safety plan is a personalized, practical plan that can help you avoid dangerous situations and 
                know how to react when you're having thoughts of suicide.
              </p>
              <button
                onClick={() => setShowSafetyPlan(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                Create My Safety Plan
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {safetyPlanSteps.map((planStep, index) => (
                <div key={index} className="bg-slate-50 p-6 rounded-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {planStep.step}
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">{planStep.title}</h4>
                  </div>
                  
                  <p className="text-slate-600 mb-4">{planStep.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 mb-2">Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {planStep.examples.map((example, exIndex) => (
                        <span
                          key={exIndex}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <textarea
                    placeholder={`Add your personal ${planStep.title.toLowerCase()}...`}
                    value={safetyPlanData[planStep.step] || ''}
                    onChange={(e) => updateSafetyPlan(planStep.step, e.target.value)}
                    className="w-full p-4 border border-slate-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              
              <div className="text-center pt-6 border-t">
                <button
                  onClick={() => {
                    const planText = Object.entries(safetyPlanData)
                      .map(([step, value]) => `Step ${step}: ${safetyPlanSteps[parseInt(step) - 1].title}\n${value}\n`)
                      .join('\n')
                    
                    const element = document.createElement('a')
                    const file = new Blob([`My Personal Safety Plan\n\n${planText}`], { type: 'text/plain' })
                    element.href = URL.createObjectURL(file)
                    element.download = 'my-safety-plan.txt'
                    document.body.appendChild(element)
                    element.click()
                    document.body.removeChild(element)
                  }}
                  className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors mr-4"
                >
                  Download My Plan
                </button>
                <button
                  onClick={() => setShowSafetyPlan(false)}
                  className="bg-slate-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Resources */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="text-4xl mb-4">🏥</div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Emergency Services</h4>
            <p className="text-slate-600 mb-4">
              If you're in immediate danger, call 911 or go to your nearest emergency room.
            </p>
            <a
              href="tel:911"
              className="block w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
            >
              Call 911
            </a>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="text-4xl mb-4">💬</div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Online Chat Support</h4>
            <p className="text-slate-600 mb-4">
              Connect with a trained counselor through online chat when you can't talk on the phone.
            </p>
            <button className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center">
              Start Chat
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Find Local Help</h4>
            <p className="text-slate-600 mb-4">
              Locate mental health professionals, treatment facilities, and support groups in your area.
            </p>
            <Link
              to="/find-help"
              className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
            >
              Find Help
            </Link>
          </div>
        </div>

        {/* Warning Signs */}
        <div className="mt-16 bg-yellow-50 border border-yellow-200 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-yellow-600">⚠️</span>
            Warning Signs to Watch For
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Emotional Warning Signs:</h4>
              <ul className="space-y-2 text-slate-700">
                <li>• Feeling hopeless or worthless</li>
                <li>• Extreme mood swings</li>
                <li>• Overwhelming anxiety or panic</li>
                <li>• Feeling trapped or in unbearable pain</li>
                <li>• Increased irritability or anger</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Behavioral Warning Signs:</h4>
              <ul className="space-y-2 text-slate-700">
                <li>• Withdrawing from friends and activities</li>
                <li>• Sleeping too much or too little</li>
                <li>• Increased use of alcohol or drugs</li>
                <li>• Talking about death or suicide</li>
                <li>• Giving away possessions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}