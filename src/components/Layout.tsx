import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SafeImage from './SafeImage'
import { useHeaderScroll } from '../hooks/useHeaderScroll'
import { useAuth } from '../contexts/AuthContext'
import { ChatbotToggleMini } from './ChatbotControl'
import ChatbotControl from './ChatbotControl'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isHeaderScrolled = useHeaderScroll(100)
  const location = useLocation()
  const { currentUser, userData, logout } = useAuth()

  const navigation = currentUser && userData?.role === 'student' ? [
    { href: '/student/dashboard', label: 'Dashboard' },
    { href: '/assessment', label: 'Assessment' },
    { href: '/resources', label: 'Resources' },
    { href: '/crisis', label: 'Crisis Support' },
    { href: '/groups', label: 'Support Groups' },
    { href: '/progress', label: 'Progress' },
    { href: '/find-help', label: 'Find Help' },
    { href: '/about', label: 'About' }
  ] : [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/crisis', label: 'Crisis Support' }
  ]

  return (
    <div className="min-h-screen text-slate-900">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-black text-white px-3 py-2 rounded">Skip to content</a>
      
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isHeaderScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b shadow-lg' 
          : 'bg-white border-b shadow-sm'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SafeImage 
              src="/assets/harmony-logo-compact.svg"
              alt="Harmony Logo"
              className="w-10 h-10"
              fallbackSrc="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><rect width='40' height='40' rx='8' fill='%233b82f6'/><text x='20' y='26' text-anchor='middle' font-size='16' fill='white' font-family='Arial' font-weight='bold'>H</text></svg>"
            />
            <Link to="/" className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Harmony</Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:block flex-1 mx-8">
            <ul className="flex items-center justify-center gap-2 list-none m-0 p-0">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link 
                    to={item.href}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 whitespace-nowrap ${
                      location.pathname === item.href
                        ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-slate-700 hover:text-blue-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'}`}></span>
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'mb-1'}`}></span>
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>

          <div className="flex items-center gap-6">
            {currentUser ? (
              <div className="flex items-center gap-4">
                {/* Chatbot Toggle for Students */}
                {userData?.role === 'student' && (
                  <div className="hidden sm:block">
                    <ChatbotToggleMini />
                  </div>
                )}
                <div className="hidden lg:flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {userData?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="whitespace-nowrap">Hello, {userData?.name || 'User'}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <span>🚪</span>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Sign In
              </Link>
            )}
            <div className="flex items-center gap-2 text-red-600 font-semibold border-l border-slate-200 pl-6">
              <span className="text-lg">☎</span>
              <Link to="/crisis" className="hover:text-red-700 transition-colors text-sm whitespace-nowrap">
                Crisis: 988
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="px-6 pb-6 bg-white border-b border-slate-200">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                      location.pathname === item.href
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {currentUser && (
                <>
                  {/* Chatbot Control for Mobile - Students Only */}
                  {userData?.role === 'student' && (
                    <li className="mt-4 pt-4 border-t border-slate-200">
                      <div className="px-4 py-2">
                        <ChatbotControl showLabel={true} className="w-full justify-center" />
                      </div>
                    </li>
                  )}
                  <li className="mt-4 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        logout()
                      }}
                      className="block w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors"
                    >
                      <span className="mr-2">🚪</span>
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">
        {children}
      </main>
    </div>
  )
}