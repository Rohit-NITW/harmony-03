import { useState } from 'react'
import { Link } from 'react-router-dom'
import SafeImage from '../components/SafeImage'
import { useAuth } from '../contexts/AuthContext'
import { saveAssessmentResult } from '../services/firebase'
import { motion } from 'framer-motion'

const assessmentQuestions = [
  {
    id: 'mood',
    title: 'Mood Assessment (PHQ-9)',
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling/staying asleep or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself or that you are a failure',
      'Trouble concentrating on things',
      'Moving/speaking slowly or being fidgety/restless',
      'Thoughts that you would be better off dead'
    ],
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'anxiety',
    title: 'Anxiety Assessment (GAD-7)',
    questions: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it\'s hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen'
    ],
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'stress',
    title: 'Stress Level Assessment',
    questions: [
      'How often have you felt stressed about academic work?',
      'How often have you felt overwhelmed by responsibilities?',
      'How often have you had trouble managing your time?',
      'How often have you felt isolated from others?',
      'How often have you had financial worries?'
    ],
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Rarely' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Often' },
      { value: 4, label: 'Very often' }
    ]
  }
]

export default function Assessment() {
  const { currentUser } = useAuth()
  const [currentSection, setCurrentSection] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [showResults, setShowResults] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleAnswer = (questionIndex: number, value: number) => {
    const sectionId = assessmentQuestions[currentSection].id
    setAnswers(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [questionIndex]: value
      }
    }))
  }

  const getCurrentSectionScore = () => {
    const sectionId = assessmentQuestions[currentSection].id
    const sectionAnswers = answers[sectionId] || {}
    return Object.values(sectionAnswers).reduce((sum, val) => sum + val, 0)
  }

  const getTotalScores = () => {
    const scores = {}
    assessmentQuestions.forEach(section => {
      const sectionAnswers = answers[section.id] || {}
      scores[section.id] = Object.values(sectionAnswers).reduce((sum, val) => sum + val, 0)
    })
    return scores
  }

  const calculateWellnessScore = (scores) => {
    const { mood = 0, anxiety = 0, stress = 0 } = scores
    
    // Calculate maximum possible scores for each section
    const maxMoodScore = 27 // 9 questions × 3 max points
    const maxAnxietyScore = 21 // 7 questions × 3 max points  
    const maxStressScore = 20 // 5 questions × 4 max points
    
    // Convert to percentages (lower scores = better wellness)
    const moodPercentage = Math.max(0, 100 - (mood / maxMoodScore * 100))
    const anxietyPercentage = Math.max(0, 100 - (anxiety / maxAnxietyScore * 100))
    const stressPercentage = Math.max(0, 100 - (stress / maxStressScore * 100))
    
    // Calculate weighted wellness score
    const wellnessScore = Math.round(
      (moodPercentage * 0.4) + // 40% weight for mood
      (anxietyPercentage * 0.35) + // 35% weight for anxiety  
      (stressPercentage * 0.25) // 25% weight for stress
    )
    
    return Math.min(100, Math.max(0, wellnessScore))
  }

  const getRecommendation = (scores) => {
    const { mood = 0, anxiety = 0, stress = 0 } = scores
    
    if (mood >= 15 || anxiety >= 15 || stress >= 15) {
      return {
        level: 'High',
        color: 'text-red-600 bg-red-50 border-red-200',
        recommendation: 'We recommend speaking with a mental health professional soon. Your responses suggest you may benefit from additional support.',
        actions: ['Contact crisis support if needed', 'Schedule with a counselor', 'Reach out to support groups']
      }
    } else if (mood >= 10 || anxiety >= 10 || stress >= 10) {
      return {
        level: 'Moderate',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        recommendation: 'Consider connecting with mental health resources and implementing self-care strategies.',
        actions: ['Explore our resource library', 'Consider counseling', 'Practice stress management techniques']
      }
    } else if (mood >= 5 || anxiety >= 5 || stress >= 5) {
      return {
        level: 'Mild',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        recommendation: 'Some areas of concern identified. Self-care and monitoring would be beneficial.',
        actions: ['Use our self-help resources', 'Monitor your mood regularly', 'Consider lifestyle changes']
      }
    } else {
      return {
        level: 'Low',
        color: 'text-green-600 bg-green-50 border-green-200',
        recommendation: 'Your responses suggest you\'re managing well currently. Keep up the good work!',
        actions: ['Continue healthy habits', 'Stay connected with support', 'Monitor for changes']
      }
    }
  }

  const nextSection = async () => {
    if (currentSection < assessmentQuestions.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      setSaving(true)
      
      // Save results to Firebase if user is logged in
      if (currentUser) {
        const scores = getTotalScores()
        const recommendation = getRecommendation(scores)
        const wellnessScore = calculateWellnessScore(scores)
        
        await saveAssessmentResult(currentUser.uid, {
          answers,
          scores,
          recommendation,
          wellnessScore,
          completedAt: new Date().toISOString()
        })
      }
      
      setSaving(false)
      setShowResults(true)
    }
  }

  const resetAssessment = () => {
    setCurrentSection(0)
    setAnswers({})
    setShowResults(false)
  }

  if (showResults) {
    const scores = getTotalScores()
    const recommendation = getRecommendation(scores)
    const wellnessScore = calculateWellnessScore(scores)

    return (
      <section id="assessment" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Assessment Results</h2>
            <p className="text-xl text-slate-600">Based on your responses, here's your personalized feedback</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
            {/* Wellness Score Display */}
            <div className="text-center mb-8">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={wellnessScore >= 70 ? '#10b981' : wellnessScore >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(wellnessScore / 100) * 351.86} 351.86`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      wellnessScore >= 70 ? 'text-green-600' : 
                      wellnessScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {wellnessScore}%
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Wellness Score</h3>
              <p className="text-slate-600 mb-6">
                {wellnessScore >= 70 ? 'Excellent! You\'re managing your mental health well.' :
                 wellnessScore >= 40 ? 'Good progress, but there\'s room for improvement.' :
                 'Your mental health may need attention. Consider seeking support.'}
              </p>
            </div>

            <div className={`p-6 rounded-xl border-2 ${recommendation.color} mb-8`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">📊</div>
                <h3 className="text-2xl font-bold">Risk Level: {recommendation.level}</h3>
              </div>
              <p className="text-lg mb-4">{recommendation.recommendation}</p>
              <div className="space-y-2">
                <h4 className="font-semibold">Recommended Actions:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {recommendation.actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {assessmentQuestions.map(section => (
                <div key={section.id} className="bg-slate-50 p-6 rounded-xl">
                  <h4 className="font-bold text-lg mb-2 capitalize">{section.id}</h4>
                  <div className="text-3xl font-bold text-blue-600">{scores[section.id] || 0}</div>
                  <div className="text-sm text-slate-600">out of {section.questions.length * (section.options.length - 1)}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetAssessment}
                className="px-8 py-3 bg-slate-600 text-white rounded-full font-semibold hover:bg-slate-700 transition-colors"
              >
                Take Assessment Again
              </button>
              <Link
                to="/crisis"
                className="px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors text-center"
              >
                Get Immediate Help
              </Link>
              <Link
                to="/find-help"
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Find Professional Help
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const currentAssessment = assessmentQuestions[currentSection]
  const progress = ((currentSection + 1) / assessmentQuestions.length) * 100

  return (
    <section id="assessment" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Mental Health Assessment</h2>
          <p className="text-xl text-slate-600 mb-8">
            A confidential questionnaire to help understand your current mental health status
          </p>
          
          {/* Progress bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <motion.div 
          className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{currentAssessment.title}</h3>
            <p className="text-slate-600">
              Over the last 2 weeks, how often have you been bothered by the following problems?
            </p>
          </div>

          <div className="space-y-6">
            {currentAssessment.questions.map((question, qIndex) => (
              <div key={qIndex} className="p-6 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-slate-900 mb-4">{question}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {currentAssessment.options.map((option, oIndex) => (
                    <button
                      key={oIndex}
                      onClick={() => handleAnswer(qIndex, option.value)}
                      className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                        answers[currentAssessment.id]?.[qIndex] === option.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-slate-600">
              Section {currentSection + 1} of {assessmentQuestions.length}
            </div>
            
            <div className="flex gap-4">
              {currentSection > 0 && (
                <button
                  onClick={() => setCurrentSection(currentSection - 1)}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-300 transition-colors"
                >
                  Previous
                </button>
              )}
              
              <motion.button
                onClick={nextSection}
                disabled={!answers[currentAssessment.id] || Object.keys(answers[currentAssessment.id]).length < currentAssessment.questions.length || saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {saving ? 'Saving...' : (currentSection === assessmentQuestions.length - 1 ? 'View Results' : 'Next Section')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}