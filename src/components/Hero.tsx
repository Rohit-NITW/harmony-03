import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SafeImage from './SafeImage'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full">
        <SafeImage 
          src="/assets/hero-background.svg"
          alt="Mental wellness background"
          className="w-full h-full object-cover opacity-20"
          fallbackSrc="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='%23f8fafc'/></svg>"
        />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-purple-200/30 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-blue-200/30 rounded-full blur-lg"
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-24 h-24 bg-emerald-200/30 rounded-full blur-xl"
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Brand Logo Animation */}
            <motion.div 
              className="flex items-center justify-center lg:justify-start gap-3 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SafeImage 
                src="/assets/harmony-logo.svg"
                alt="Harmony Logo"
                className="w-16 h-16"
                fallbackSrc="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' rx='16' fill='%233b82f6'/><text x='32' y='40' text-anchor='middle' font-size='24' fill='white' font-family='Arial' font-weight='bold'>H</text></svg>"
              />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                Harmony
              </h1>
            </motion.div>

            <motion.h2
              className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Your Mental Health
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Matters
              </span>
            </motion.h2>

            <motion.p
              className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              A comprehensive digital wellness platform providing mental health support, resources, 
              and professional guidance specifically designed for higher education students.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link 
                to="/assessment"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Your Journey
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-lg"
                >
                  →
                </motion.span>
              </Link>
              <Link 
                to="/crisis"
                className="group px-8 py-4 bg-red-50 text-red-600 rounded-xl font-semibold border-2 border-red-200 hover:border-red-300 hover:bg-red-100 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="text-lg">☎</span>
                Need Help Now?
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 gap-6 mt-12 pt-8 border-t border-slate-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">75%</div>
                <div className="text-sm text-slate-500">of students report mental health challenges</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">24/7</div>
                <div className="text-sm text-slate-500">crisis support availability</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Main Illustration */}
            <div className="relative">
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-purple-200 via-blue-200 to-teal-200 rounded-3xl blur-3xl opacity-30"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <SafeImage 
                src="/assets/wellness-decoration.svg"
                alt="Mental wellness illustration"
                className="relative w-full max-w-lg mx-auto h-96 object-contain bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8"
                fallbackSrc="/assets/hero-placeholder.svg"
              />
            </div>

            {/* Floating Cards */}
            <motion.div
              className="absolute -top-6 -left-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <div>
                  <div className="font-semibold text-slate-800">AI Support</div>
                  <div className="text-xs text-slate-500">Always available</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤝</span>
                <div>
                  <div className="font-semibold text-slate-800">Peer Support</div>
                  <div className="text-xs text-slate-500">Connect & share</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute top-1/2 -right-12 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-slate-700">Safe Space</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Harmony Abstract Background */}
      <div className="absolute bottom-0 left-0 w-full opacity-10 pointer-events-none">
        <SafeImage 
          src="/assets/harmony-abstract.svg"
          alt="Harmony abstract design"
          className="w-full h-40 object-cover object-top"
          fallbackSrc="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23f1f5f9'/></svg>"
        />
      </div>
    </section>
  )
}