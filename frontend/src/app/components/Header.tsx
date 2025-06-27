'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  ChefHat,
  Crown,
  UserCheck,
  Shield,
  Home,
  Package,
  Sparkles,
  MessageCircle
} from 'lucide-react'
import { getCurrentUser, getNavigationItems, type User as UserType } from '@/lib/auth-context'
import LanguageSelector from '../../components/LanguageSelector'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  // Extract current locale from pathname
  const getCurrentLocale = () => {
    const pathSegments = pathname.split('/')
    const locale = pathSegments[1]
    return locale && locale.length === 2 || locale === 'en-US' ? locale : 'en-US'
  }

  const handleLogout = () => {
    // Clear all user session data
    localStorage.removeItem('restaurantSetup')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userSession')
    
    // Force a hard redirect to completely reload the page
    // This ensures all React state is cleared
    window.location.href = '/setup'
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'manager': return <Shield className="w-4 h-4 text-blue-500" />
      case 'chef': return <ChefHat className="w-4 h-4 text-green-500" />
      case 'waiter': return <UserCheck className="w-4 h-4 text-purple-500" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'chef': return 'bg-green-100 text-green-800 border-green-200'
      case 'waiter': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const navigationItems = currentUser ? getNavigationItems(currentUser) : []

  // Default navigation items when not logged in
  const defaultNavItems = [
    { name: 'Home', href: '/', icon: 'Home' },
    { name: 'Recipes', href: '/recipes', icon: 'ChefHat' },
    { name: 'Inventory', href: '/inventory', icon: 'Package' },
    { name: 'RestMan Menu', href: '/ai-suggestions', icon: 'Sparkles' },
    { name: 'Support', href: '/support', icon: 'MessageCircle' }
  ]

  const displayNavItems = currentUser ? navigationItems : defaultNavItems

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img 
            src="/logo.png" 
            alt="RestMan Logo" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-white font-bold text-lg">RestMan</span>
        </Link>

        {/* User Info, Language Selector & Menu Toggle */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <LanguageSelector 
            currentLocale={getCurrentLocale()} 
            className="hidden sm:block"
          />
          
          {currentUser && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(currentUser.role)}`}>
              <div className="flex items-center space-x-1">
                {getRoleIcon(currentUser.role)}
                <span className="capitalize">{currentUser.role}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-orange-200">
          <div className="max-h-96 overflow-y-auto">
            {/* User Info Section */}
            {currentUser && (
              <div className="px-4 py-3 border-b border-gray-100 bg-orange-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                    {getRoleIcon(currentUser.role)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{currentUser.name}</p>
                    <p className="text-sm text-gray-600">{currentUser.mobile}</p>
                    <p className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getRoleColor(currentUser.role)}`}>
                      {currentUser.role.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Language Selector for Mobile */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-700 mb-2">Language</div>
              <LanguageSelector currentLocale={getCurrentLocale()} />
            </div>

            {/* Navigation Items */}
            <div className="py-2">
              {displayNavItems.map((item, index) => {
                // Map icon names to actual icon components
                const iconMap: { [key: string]: any } = {
                  Home: Home,
                  ChefHat: ChefHat,
                  Package: Package,
                  Sparkles: Sparkles,
                  MessageCircle: MessageCircle,
                  User: User,
                  Settings: Settings
                }
                const IconComponent = iconMap[item.icon] || ChefHat
                
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <IconComponent className="w-5 h-5 text-gray-500" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              {/* Setup Access - Always Available */}
              <Link
                href="/setup"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Restaurant Setup</span>
              </Link>

              {/* Profile Link - Only if no user logged in */}
              {!currentUser && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5 rotate-180" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Sign Up</span>
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                </>
              )}

              {/* Logout Button */}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 