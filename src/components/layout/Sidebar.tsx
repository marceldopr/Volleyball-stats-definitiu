import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  Trophy,
  BarChart3,
  Settings,
  Download,
  Info,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/stores/authStore'

// Full navigation for director_tecnic
const fullNavigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Jugadoras', href: '/players', icon: Users },
  { name: 'Equipos', href: '/teams', icon: Users },
  { name: 'Partidos', href: '/matches', icon: Trophy },
  { name: 'Análisis', href: '/analytics', icon: BarChart3 },
  { name: 'Exportaciones', href: '/exports', icon: Download },
  { name: 'Configuración', href: '/settings', icon: Settings },
  { name: 'Sobre la App', href: '/about', icon: Info },
]

// Reduced navigation for entrenador
const reducedNavigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Jugadoras', href: '/players', icon: Users },
  { name: 'Equipos', href: '/teams', icon: Users },
  { name: 'Partidos', href: '/matches', icon: Trophy },
  { name: 'Configuración', href: '/settings', icon: Settings },
  { name: 'Sobre la App', href: '/about', icon: Info },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, logout } = useAuthStore()

  // Determine navigation based on role
  const navigation = profile?.role === 'entrenador' ? reducedNavigation : fullNavigation

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-14 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-lg bg-gray-900 shadow-lg text-white hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex flex-col items-center justify-center h-20 px-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary-500" />
            <h1 className="text-white font-bold text-lg">Volleyball Stats</h1>
          </div>
          <p className="text-gray-400 text-xs mt-1">Pro Analytics</p>
        </div>

        {/* User info */}
        {profile && (
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-white text-sm font-medium truncate">{profile.full_name}</p>
            <p className="text-gray-400 text-xs capitalize">
              {profile.role === 'director_tecnic' ? 'Director Técnico' : 'Entrenador'}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={clsx(
                      'nav-link',
                      isActive && 'active'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="nav-icon" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
          <div className="text-center mt-3">
            <p className="text-gray-500 text-xs">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}