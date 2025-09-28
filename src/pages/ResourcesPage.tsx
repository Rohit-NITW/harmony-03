import { useState } from 'react'
import { Link } from 'react-router-dom'
import SafeImage from '../components/SafeImage'

const resourceCategories = [
  {
    id: 'articles',
    name: 'Articles & Guides',
    icon: '📰',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    resources: [
      {
        title: 'Understanding Depression in College Students',
        description: 'A comprehensive guide to recognizing and managing depression during your academic journey.',
        type: 'Article',
        duration: '8 min read',
        tags: ['Depression', 'College Life', 'Self-Help']
      },
      {
        title: 'Managing Academic Stress and Anxiety',
        description: 'Practical strategies for handling the pressures of academic life and maintaining mental wellness.',
        type: 'Guide',
        duration: '12 min read',
        tags: ['Anxiety', 'Stress Management', 'Study Tips']
      },
      {
        title: 'Building Healthy Sleep Habits',
        description: 'Learn how proper sleep hygiene can dramatically improve your mental health and academic performance.',
        type: 'Article',
        duration: '6 min read',
        tags: ['Sleep', 'Wellness', 'Health']
      }
    ]
  },
  {
    id: 'videos',
    name: 'Video Resources',
    icon: '🎥',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    resources: [
      {
        title: 'Mindfulness Meditation for Beginners',
        description: 'A guided introduction to mindfulness practices that can help reduce stress and improve focus.',
        type: 'Video',
        duration: '15 minutes',
        tags: ['Mindfulness', 'Meditation', 'Beginner']
      },
      {
        title: 'Breathing Exercises for Anxiety',
        description: 'Learn powerful breathing techniques to manage anxiety attacks and daily stress.',
        type: 'Video',
        duration: '10 minutes',
        tags: ['Anxiety', 'Breathing', 'Quick Relief']
      },
      {
        title: 'Time Management for Better Mental Health',
        description: 'Discover how effective time management can reduce stress and improve your overall wellbeing.',
        type: 'Video',
        duration: '20 minutes',
        tags: ['Time Management', 'Productivity', 'Stress']
      }
    ]
  },
  {
    id: 'tools',
    name: 'Interactive Tools',
    icon: '🛠️',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    resources: [
      {
        title: 'Mood Tracking Journal',
        description: 'Track your daily mood, activities, and thoughts to identify patterns and triggers.',
        type: 'Tool',
        duration: 'Daily use',
        tags: ['Mood Tracking', 'Journal', 'Self-Awareness']
      },
      {
        title: 'Stress Level Calculator',
        description: 'Assess your current stress levels and get personalized coping strategies.',
        type: 'Assessment',
        duration: '5 minutes',
        tags: ['Stress', 'Assessment', 'Coping']
      },
      {
        title: 'Goal Setting Worksheet',
        description: 'Set and track meaningful mental health and wellness goals with our structured approach.',
        type: 'Worksheet',
        duration: '15 minutes',
        tags: ['Goals', 'Planning', 'Progress']
      }
    ]
  },
  {
    id: 'podcasts',
    name: 'Podcasts & Audio',
    icon: '🎧',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    resources: [
      {
        title: 'Student Mental Health Podcast Series',
        description: 'Weekly episodes covering various mental health topics relevant to student life.',
        type: 'Podcast',
        duration: '30-45 min episodes',
        tags: ['Student Life', 'Mental Health', 'Weekly']
      },
      {
        title: 'Guided Sleep Meditations',
        description: 'Relaxing audio sessions to help you unwind and achieve better sleep quality.',
        type: 'Audio',
        duration: '20-60 minutes',
        tags: ['Sleep', 'Meditation', 'Relaxation']
      },
      {
        title: 'Confidence Building Affirmations',
        description: 'Daily positive affirmations to boost self-esteem and confidence.',
        type: 'Audio',
        duration: '10 minutes',
        tags: ['Confidence', 'Affirmations', 'Self-Esteem']
      }
    ]
  }
]

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('articles')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const currentCategory = resourceCategories.find(cat => cat.id === activeCategory)
  
  // Get all unique tags
  const allTags = Array.from(new Set(
    resourceCategories.flatMap(cat => 
      cat.resources.flatMap(resource => resource.tags)
    )
  ))

  // Filter resources based on search and tags
  const filteredResources = currentCategory?.resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => resource.tags.includes(tag))
    return matchesSearch && matchesTags
  }) || []

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <section id="resources" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Mental Health Resources</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Access our comprehensive library of evidence-based mental health resources, tools, and educational materials 
            designed specifically for students.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 text-lg border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-14"
            />
            <div className="absolute left-5 top-5 text-slate-400 text-xl">🔍</div>
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {resourceCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all border-2 ${
                activeCategory === category.id
                  ? category.color
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredResources.map((resource, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {resource.type}
                  </span>
                  <span className="text-sm text-slate-500">{resource.duration}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                {resource.title}
              </h3>

              <p className="text-slate-600 mb-4 line-clamp-3">
                {resource.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {resource.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Access Resource
              </button>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No resources found</h3>
            <p className="text-slate-600">
              Try adjusting your search terms or clearing filters to see more resources.
            </p>
          </div>
        )}

        {/* Quick Access Section */}
        <div className="mt-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Need Immediate Help?</h3>
            <p className="text-lg text-slate-600">
              If you're experiencing a mental health crisis, don't wait. Get help right now.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/crisis"
              className="bg-red-600 text-white p-6 rounded-xl text-center hover:bg-red-700 transition-colors group"
            >
              <div className="text-4xl mb-3">🆘</div>
              <h4 className="text-lg font-bold mb-2">Crisis Support</h4>
              <p className="text-sm opacity-90">24/7 emergency resources</p>
            </Link>

            <Link
              to="/assessment"
              className="bg-blue-600 text-white p-6 rounded-xl text-center hover:bg-blue-700 transition-colors group"
            >
              <div className="text-4xl mb-3">📋</div>
              <h4 className="text-lg font-bold mb-2">Take Assessment</h4>
              <p className="text-sm opacity-90">Understand your mental health</p>
            </Link>

            <Link
              to="/find-help"
              className="bg-green-600 text-white p-6 rounded-xl text-center hover:bg-green-700 transition-colors group"
            >
              <div className="text-4xl mb-3">👨‍⚕️</div>
              <h4 className="text-lg font-bold mb-2">Find Professional</h4>
              <p className="text-sm opacity-90">Connect with therapists</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}