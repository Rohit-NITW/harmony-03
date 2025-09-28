import { Link } from 'react-router-dom'
import SafeImage from '../components/SafeImage'
import { useScrollAnimation, useStaggeredScrollAnimation } from '../hooks/useScrollAnimation'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { currentUser, userData } = useAuth()
  const heroAnimation = useScrollAnimation({ threshold: 0.2 })
  const featuresAnimation = useStaggeredScrollAnimation(6, { threshold: 0.1 })
  const valuesAnimation = useStaggeredScrollAnimation(3, { threshold: 0.1 })
  const ctaAnimation = useScrollAnimation({ threshold: 0.3 })

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-20" ref={heroAnimation.elementRef}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className={`text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight animate-on-scroll ${
                heroAnimation.isVisible ? 'animate-slide-in-left' : ''
              }`}>
                Your Mental Health Matters
              </h1>
              <p className={`text-xl text-slate-600 leading-relaxed max-w-lg animate-on-scroll ${
                heroAnimation.isVisible ? 'animate-fade-in-up animate-delay-200' : ''
              }`}>
                A comprehensive digital platform providing mental health support, resources, and professional guidance specifically designed for higher education students.
              </p>
              <div className={`flex flex-col sm:flex-row gap-4 pt-4 animate-on-scroll ${
                heroAnimation.isVisible ? 'animate-fade-in-up animate-delay-400' : ''
              }`}>
                {currentUser ? (
                  <Link 
                    to={userData?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} 
                    className="btn-dark"
                  >
                    Go to Dashboard →
                  </Link>
                ) : (
                  <Link to="/login" className="btn-dark">Get Started →</Link>
                )}
                <Link to="/crisis" className="btn-help">Need Help Now? ☎</Link>
              </div>
            </div>
            <div className={`relative animate-on-scroll ${
              heroAnimation.isVisible ? 'animate-slide-in-right animate-delay-300' : ''
            }`}>
              <SafeImage 
                src="/assets/hero-mental-health.svg" 
                alt="Mental health campus illustration" 
                className="w-full h-96 object-contain rounded-xl shadow-xl bg-white" 
                fallbackSrc="/assets/hero-campus.jpg"
              />
              <div className={`absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-slate-200 animate-on-scroll ${
                heroAnimation.isVisible ? 'animate-float animate-delay-600' : ''
              }`}>
                <div className="text-2xl font-bold text-slate-900">75%</div>
                <div className="text-sm text-slate-600 leading-tight">of college students report mental health challenges</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6 animate-on-scroll animate-fade-in-up">Comprehensive Mental Health Support</h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed animate-on-scroll animate-fade-in animate-delay-200">
              Access a complete suite of tools and resources designed to support your mental wellness journey throughout your academic career.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" ref={featuresAnimation.elementRef}>
            {[
              {icon: "🧠", title: "Mental Health Assessment", desc: "Take confidential assessments to understand your mental health status", color: "bg-blue-50 text-blue-600", image: "/assets/feature-assessment.svg", link: "/assessment"},
              {icon: "📖", title: "Resource Library", desc: "Access articles, videos, and tools for mental wellness", color: "bg-emerald-50 text-emerald-600", image: "/assets/feature-library.svg", link: "/resources"},
              {icon: "👥", title: "Peer To Peer Interaction", desc: "Connect with fellow peers while being anonymous", color: "bg-violet-50 text-violet-600", image: "/assets/feature-support.svg", link: "/groups"},
              {icon: "👤", title: "Find Professionals", desc: "Connect with licensed mental health professionals", color: "bg-orange-50 text-orange-600", image: "/assets/feature-professionals.svg", link: "/find-help"},
              {icon: "📊", title: "Track Progress", desc: "Monitor your mental health journey over time", color: "bg-indigo-50 text-indigo-600", image: "/assets/feature-progress.svg", link: "/progress"},
              {icon: "☎", title: "Crisis Support", desc: "24/7 emergency resources and immediate help", color: "bg-red-50 text-red-600", image: "/assets/feature-crisis.svg", link: "/crisis"},
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`bg-white p-8 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:border-blue-100 animate-on-scroll ${
                  featuresAnimation.visibleItems[index] ? 'animate-scale-in' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Feature Image */}
                <div className="mb-6 overflow-hidden rounded-lg">
                  <SafeImage 
                    src={feature.image} 
                    alt={`${feature.title} illustration`}
                    className="w-full h-32 object-contain transition-transform duration-300 hover:scale-105"
                    fallbackSrc="/assets/hero-placeholder.svg"
                  />
                </div>
                
                {/* Icon Badge */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl mb-6 ${feature.color} transition-transform duration-300 hover:scale-110`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{feature.desc}</p>
                <Link to={feature.link} className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-all duration-300 hover:translate-x-1 group">
                  Learn More <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center" ref={valuesAnimation.elementRef}>
            {[
              {icon: "🛡", title: "Confidential & Secure", desc: "Your privacy is our priority. All data is encrypted and HIPAA compliant.", color: "bg-emerald-50 text-emerald-600"},
              {icon: "🕒", title: "Available 24/7", desc: "Access support and resources whenever you need them, day or night.", color: "bg-blue-50 text-blue-600"},
              {icon: "❤️", title: "Evidence-Based", desc: "All tools and resources are based on proven mental health practices.", color: "bg-red-50 text-red-600"},
            ].map((value, index) => (
              <div 
                key={index} 
                className={`space-y-4 animate-on-scroll ${
                  valuesAnimation.visibleItems[index] ? 'animate-fade-in-up' : ''
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto ${value.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}>
                  {value.icon}
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0b0b17] text-white" ref={ctaAnimation.elementRef}>
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className={`text-4xl lg:text-5xl font-bold mb-6 animate-on-scroll ${
            ctaAnimation.isVisible ? 'animate-fade-in-up' : ''
          }`}>Ready to Prioritize Your Mental Health?</h2>
          <p className={`text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-on-scroll ${
            ctaAnimation.isVisible ? 'animate-fade-in animate-delay-200' : ''
          }`}>
            Take the first step towards better mental wellness with our comprehensive assessment.
          </p>
          <div className={`animate-on-scroll ${
            ctaAnimation.isVisible ? 'animate-scale-in animate-delay-400' : ''
          }`}>
            {currentUser ? (
              <Link 
                to={userData?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} 
                className="btn-primary"
              >
                Go to Your Dashboard →
              </Link>
            ) : (
              <Link to="/login" className="btn-primary">
                Start Your Journey →
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}