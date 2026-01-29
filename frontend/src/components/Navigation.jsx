import { Link, useLocation } from 'react-router-dom'
import { Home, MessageCircle, BookOpen, Sparkles } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/activities', icon: Sparkles, label: 'Activities' },
]

export default function Navigation() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-pink-100 px-4 py-2 z-50">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                isActive
                  ? 'text-primary-500 bg-pink-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
