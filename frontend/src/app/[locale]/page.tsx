'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  ChefHat, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  DollarSign,
  Clock,
  Users,
  Zap,
  BarChart3,
  ShoppingCart,
  Calendar,
  Bell,
  Star,
  Target,
  Flame,
  Menu,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  Timer,
  Award,
  Eye,
  Globe,
  ChevronDown,
  Home,
  Settings,
  MessageSquare,
  User as UserIcon,
  ArrowUp,
  Percent,
  AlertCircle,
  Brain,
  Activity,
  Building2,
  Phone,
  Database,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { getCurrentUser, type User } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('EN')
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [restaurantName, setRestaurantName] = useState('RestMan Restaurant')
  const [isCheckingConnection, setIsCheckingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    // Set initial time after component mounts to avoid hydration mismatch
    setCurrentTime(new Date())
    setIsHydrated(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    checkSupabaseConnection()
    
    // Get restaurant name from localStorage
    const setupData = localStorage.getItem('restaurantSetup')
    if (setupData) {
      try {
        const setup = JSON.parse(setupData)
        if (setup.restaurantData?.name) {
          setRestaurantName(setup.restaurantData.name)
        }
      } catch (error) {
        console.error('Error parsing setup data:', error)
      }
    }
  }, [])

  const languages = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'ES', name: 'Español', flag: '🇪🇸' },
    { code: 'ZH', name: '中文', flag: '🇨🇳' },
    { code: 'IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'HI', name: 'हिंदी', flag: '🇮🇳' }
  ]

  const checkSupabaseConnection = async () => {
    setIsCheckingConnection(true)
    try {
      // Test connection by trying to fetch from a table
      const { error } = await supabase.from('restaurants').select('id').limit(1)
      setConnectionStatus(error ? 'disconnected' : 'connected')
    } catch {
      setConnectionStatus('disconnected')
    } finally {
      setIsCheckingConnection(false)
    }
  }

  const clearLocalData = () => {
    if (confirm('This will clear all local data and redirect to login. Continue?')) {
      localStorage.clear()
      window.location.href = '/login'
    }
  }

  // If not hydrated yet, return a static version
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 pb-20">
          <div className="text-center py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">RestMan</h1>
            <p className="text-sm text-gray-500">Professional Restaurant Management</p>
          </div>
          
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="relative h-64">
              <img 
                src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&h=400&fit=crop&crop=center" 
                alt="Professional Chef" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-xl font-bold mb-1">Good Morning, Chef!</h2>
                <p className="text-sm opacity-90">Kitchen running smoothly today</p>
              </div>
            </div>
            
            <div className="p-4">
              <div className="text-center">
                <h3 className="text-orange-600 font-semibold text-lg mb-2">Restaurant Analytics</h3>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Live Updates • Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 pb-20">
        {/* RestMan Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center py-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-1">RestMan</h1>
          <p className="text-sm text-gray-500">Professional Restaurant Management</p>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <div className={`rounded-xl p-4 ${
            connectionStatus === 'connected' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className={`w-5 h-5 ${
                  connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
                }`} />
                <div>
                  <p className={`font-semibold ${
                    connectionStatus === 'connected' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {connectionStatus === 'connected' 
                      ? 'Connected to Database' 
                      : 'Database Disconnected'}
                  </p>
                  <p className={`text-sm ${
                    connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {connectionStatus === 'connected' 
                      ? 'All data is syncing with Supabase' 
                      : 'Running in demo mode - data not saved'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {connectionStatus === 'disconnected' && (
                  <Link href="/login">
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
                      Connect Now
                    </button>
                  </Link>
                )}
                <button
                  onClick={clearLocalData}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear Data
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Section with Chef Image */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
        >
          <div className="relative h-64">
            <img 
              src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&h=400&fit=crop&crop=center" 
              alt="Professional Chef" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-xl font-bold mb-1">Good Morning, Chef!</h2>
              <p className="text-sm opacity-90">Kitchen running smoothly today</p>
            </div>
          </div>
          
          <div className="p-4">
            <div className="text-center">
              <h3 className="text-orange-600 font-semibold text-lg mb-2">Restaurant Analytics</h3>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Live Updates • {currentTime ? currentTime.toLocaleTimeString() : '--:--:--'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          {/* Orders Today */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-orange-600 text-sm font-medium">+12% vs yesterday</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-1">Orders Today</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">941</div>
              <div className="flex items-center text-xs text-gray-500">
                <Eye className="w-3 h-3 mr-1" />
                <span>890 ⏰ Processed</span>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-orange-600 text-sm font-medium">+8% increase</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-1">Revenue Today</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">904</div>
              <div className="flex items-center text-xs text-gray-500">
                <DollarSign className="w-3 h-3 mr-1" />
                <span>$18,430 Total</span>
              </div>
            </div>
          </div>

          {/* Kitchen Efficiency */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-orange-600 text-sm font-medium">+5% efficiency</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-1">Kitchen Efficiency</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">89</div>
              <div className="flex items-center text-xs text-gray-500">
                <Timer className="w-3 h-3 mr-1" />
                <span>Avg 12min prep</span>
              </div>
            </div>
            <div className="mt-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Kitchen optimization started!')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-xl text-sm font-medium shadow-sm"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Optimize Kitchen</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">8</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-orange-600 text-sm font-medium">+0.2 rating</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-1">Customer Rating</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">4.8</div>
              <div className="flex items-center text-xs text-gray-500">
                <Star className="w-3 h-3 mr-1 text-yellow-500" />
                <span>234 reviews today</span>
              </div>
            </div>
            <div className="mt-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Opening customer reviews...')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-xl text-sm font-medium shadow-sm"
              >
                <div className="flex items-center justify-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>View Reviews</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">12</span>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/inventory">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg"
              >
                <Package className="w-8 h-8 mb-3" />
                <h4 className="font-semibold mb-1">Inventory</h4>
                <p className="text-sm opacity-90">Manage stock levels</p>
              </motion.div>
            </Link>

            <Link href="/recipes">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg"
              >
                <ChefHat className="w-8 h-8 mb-3" />
                <h4 className="font-semibold mb-1">Recipes</h4>
                <p className="text-sm opacity-90">Create & manage</p>
              </motion.div>
            </Link>

            <Link href="/ai-suggestions">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-4 rounded-2xl shadow-lg"
              >
                <Sparkles className="w-8 h-8 mb-3" />
                <h4 className="font-semibold mb-1">RestMan Menu</h4>
                <p className="text-sm opacity-90">Smart suggestions</p>
              </motion.div>
            </Link>

            <Link href="/setup">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-lg"
              >
                <Settings className="w-8 h-8 mb-3" />
                <h4 className="font-semibold mb-1">Setup</h4>
                <p className="text-sm opacity-90">Configure restaurant</p>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Today's Highlights */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Highlights</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=200&fit=crop&crop=center" 
                  alt="Butter Chicken" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Butter Chicken</h4>
                <p className="text-sm text-gray-600 mb-1">Most ordered today</p>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                    4.9
                  </span>
                  <span>89 orders</span>
                  <span className="text-green-600">+15%</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">$1,602</div>
                <div className="text-xs text-gray-500">Revenue</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">Peak Hour</div>
                <div className="text-xs text-gray-600">7:30 PM</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">Avg Time</div>
                <div className="text-xs text-gray-600">12 min</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">Success Rate</div>
                <div className="text-xs text-gray-600">98.5%</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 