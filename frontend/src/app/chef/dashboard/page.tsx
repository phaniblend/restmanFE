'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Package, 
  AlertTriangle, 
  Calculator, 
  MessageSquare, 
  Sparkles,
  TrendingUp,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Send
} from 'lucide-react'
import Link from 'next/link'
import { staleAlertService, type StaleAlert } from '@/lib/stale-alerts'
import { toast } from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'
import { authService } from '../../../lib/auth-service'

interface StockItem {
  id: string
  name: string
  current: number
  unit: string
  minimum: number
  status: 'good' | 'low' | 'critical'
  lastUsed: string
}

interface WastageItem {
  id: string
  item: string
  quantity: number
  reason: 'burnt' | 'overcooked' | 'returned' | 'expired'
  time: string
  cost: number
}

interface SignatureDish {
  name: string
  possibleOrders: number
  missingIngredients: string[]
}

interface Recipe {
  id: string
  name: string
  category: string
  ingredients: string[]
  instructions: string
  prep_time: number
  cook_time: number
  difficulty: string
  yield: number
}

interface Ingredient {
  id: string
  name: string
  current_amt: number
  minimum_amt: number
  category: string
  is_perishable: boolean
  expiry_date?: string
}

interface BatchProduction {
  id: string
  recipe_name: string
  batch_size: number
  actual_yield: number
  expected_yield: number
  variance_percentage: number
  created_at: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
}

export default function ChefDashboardPage() {
  const [shiftStarted, setShiftStarted] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null)
  const [quickRequestMessage, setQuickRequestMessage] = useState('')
  const [staleAlerts, setStaleAlerts] = useState<StaleAlert[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [batchHistory, setBatchHistory] = useState<BatchProduction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [batchSize, setBatchSize] = useState(1)
  const [currentBatch, setCurrentBatch] = useState<BatchProduction | null>(null)

  // Mock data - in real app, fetch from API
  const [liveStock] = useState<StockItem[]>([
    {
      id: '1',
      name: 'Basmati Rice',
      current: 2,
      unit: 'kg',
      minimum: 5,
      status: 'critical',
      lastUsed: '2 hours ago'
    },
    {
      id: '2',
      name: 'Chicken (Boneless)',
      current: 8,
      unit: 'kg',
      minimum: 10,
      status: 'low',
      lastUsed: '30 min ago'
    },
    {
      id: '3',
      name: 'Tomatoes',
      current: 15,
      unit: 'kg',
      minimum: 5,
      status: 'good',
      lastUsed: '1 hour ago'
    },
    {
      id: '4',
      name: 'Onions',
      current: 20,
      unit: 'kg',
      minimum: 8,
      status: 'good',
      lastUsed: '45 min ago'
    }
  ])

  const [todaysWastage, setTodaysWastage] = useState<WastageItem[]>([
    {
      id: '1',
      item: 'Roti',
      quantity: 3,
      reason: 'burnt',
      time: '10:30 AM',
      cost: 15
    },
    {
      id: '2',
      item: 'Chicken Biryani',
      quantity: 1,
      reason: 'returned',
      time: '12:15 PM',
      cost: 180
    }
  ])

  const [signatureDishes] = useState<SignatureDish[]>([
    {
      name: 'Butter Chicken',
      possibleOrders: 12,
      missingIngredients: [],
    },
    {
      name: 'Chicken Biryani',
      possibleOrders: 6,
      missingIngredients: ['Saffron'],
    },
    {
      name: 'Dal Makhani',
      possibleOrders: 0,
      missingIngredients: ['Black Dal', 'Cream'],
    }
  ])

  const [aiSuggestions] = useState([
    {
      dish: 'Vegetable Pulao',
      reason: 'Surplus vegetables available',
      margin: '68%',
      orders: 15
    },
    {
      dish: 'Chicken Curry',
      reason: 'High demand today',
      margin: '62%',
      orders: 20
    }
  ])

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Load stale alerts
    loadStaleAlerts()

    fetchData()

    return () => clearInterval(timer)
  }, [])

  const loadStaleAlerts = async () => {
    try {
      const alerts = await staleAlertService.getCriticalStaleAlerts()
      setStaleAlerts(alerts)
    } catch (error) {
      console.error('Error loading stale alerts:', error)
    }
  }

  const fetchData = async () => {
    try {
      const userProfile = await authService.getUserProfile()
      if (!userProfile?.restaurant_id) return

      // Fetch recipes
      const { data: recipesData } = await supabase
        .from('recipes')
        .select('*')
        .eq('restaurant_id', userProfile.restaurant_id)

      // Fetch ingredients
      const { data: ingredientsData } = await supabase
        .from('groceries')
        .select('*')
        .eq('restaurant_id', userProfile.restaurant_id)
        .gt('current_amt', 0)

      // Fetch batch history
      const { data: batchData } = await supabase
        .from('batch_production')
        .select('*')
        .eq('restaurant_id', userProfile.restaurant_id)
        .order('created_at', { ascending: false })
        .limit(10)

      setRecipes(recipesData || [])
      setIngredients(ingredientsData || [])
      setBatchHistory(batchData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startShift = () => {
    setShiftStarted(true)
    setShiftStartTime(new Date())
  }

  const getShiftDuration = () => {
    if (!shiftStartTime || !currentTime) return '00:00:00'
    const diff = currentTime.getTime() - shiftStartTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200'
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const sendQuickRequest = () => {
    if (!quickRequestMessage.trim()) return
    
    // Mock send to manager
    alert(`Request sent to manager: "${quickRequestMessage}"`)
    setQuickRequestMessage('')
  }

  const addWastageItem = (item: string, quantity: number, reason: WastageItem['reason']) => {
    const newWastage: WastageItem = {
      id: `waste_${Date.now()}`,
      item,
      quantity,
      reason,
      time: currentTime?.toLocaleTimeString() || '',
      cost: quantity * 50 // Mock cost calculation
    }
    setTodaysWastage(prev => [...prev, newWastage])
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const resolveAlert = async (alertId: string, action: string) => {
    try {
      await staleAlertService.resolveAlert(alertId, action)
      await loadStaleAlerts() // Refresh alerts
      toast.success('Alert resolved')
    } catch (error) {
      console.error('Error resolving alert:', error)
      toast.error('Failed to resolve alert')
    }
  }

  const startBatch = async (recipe: Recipe) => {
    try {
      const userProfile = await authService.getUserProfile()
      if (!userProfile?.restaurant_id) return

      const expectedYield = recipe.yield * batchSize
      
      const { data: batch } = await supabase
        .from('batch_production')
        .insert([{
          restaurant_id: userProfile.restaurant_id,
          recipe_name: recipe.name,
          batch_size: batchSize,
          expected_yield: expectedYield,
          actual_yield: 0,
          variance_percentage: 0,
          status: 'IN_PROGRESS',
          created_by: userProfile.id
        }])
        .select()
        .single()

      if (batch) {
        setCurrentBatch(batch)
        setSelectedRecipe(null)
        await fetchData()
      }
    } catch (error) {
      console.error('Error starting batch:', error)
    }
  }

  const completeBatch = async (actualYield: number) => {
    if (!currentBatch) return

    try {
      const variance = ((currentBatch.expected_yield - actualYield) / currentBatch.expected_yield) * 100
      
      await supabase
        .from('batch_production')
        .update({
          actual_yield: actualYield,
          variance_percentage: variance,
          status: 'COMPLETED'
        })
        .eq('id', currentBatch.id)

      setCurrentBatch(null)
      await fetchData()
    } catch (error) {
      console.error('Error completing batch:', error)
    }
  }

  const logWastage = async (ingredientId: string, quantity: number, reason: string) => {
    try {
      const userProfile = await authService.getUserProfile()
      if (!userProfile?.restaurant_id) return

      await supabase
        .from('grocery_usage_log')
        .insert([{
          restaurant_id: userProfile.restaurant_id,
          grocery_id: ingredientId,
          quantity_used: quantity,
          used_by: userProfile.id,
          purpose: 'WASTAGE',
          notes: reason
        }])

      // Update ingredient amount
      const ingredient = ingredients.find(i => i.id === ingredientId)
      if (ingredient) {
        await supabase
          .from('groceries')
          .update({ current_amt: Math.max(0, ingredient.current_amt - quantity) })
          .eq('id', ingredientId)
      }

      await fetchData()
    } catch (error) {
      console.error('Error logging wastage:', error)
    }
  }

  const getLowStockIngredients = () => {
    return ingredients.filter(ing => ing.current_amt <= ing.minimum_amt)
  }

  const getExpiringIngredients = () => {
    const today = new Date()
    return ingredients.filter(ing => {
      if (!ing.expiry_date || !ing.is_perishable) return false
      const expiryDate = new Date(ing.expiry_date)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 3
    })
  }

  if (loading) {
    return <div className="p-6 text-center">Loading chef dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-b border-white/20 shadow-xl safe-area-top"
      >
        <div className="mobile-container">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-bold gradient-text">Chef Dashboard</h1>
              <p className="text-sm text-gray-600">
                {currentTime ? currentTime.toLocaleTimeString() : '--:--:--'}
                {shiftStarted && ` • Shift: ${getShiftDuration()}`}
              </p>
            </div>
            
            {!shiftStarted ? (
              <button
                onClick={startShift}
                className="btn-premium flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Start Shift</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Shift Active</span>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        {!shiftStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Clock className="w-20 h-20 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start Your Shift?</h2>
            <p className="text-gray-600 mb-6">Click "Start Shift" to access live kitchen dashboard</p>
          </motion.div>
        ) : (
          <>
            {/* Critical Stale Date Warnings */}
            {staleAlerts.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    Critical Stale Date Warnings ({staleAlerts.length})
                  </h2>
                  <button
                    onClick={loadStaleAlerts}
                    className="text-orange-600 text-sm font-medium"
                  >
                    Refresh →
                  </button>
                </div>
                
                <div className="space-y-3">
                  {staleAlerts.map((alert) => (
                    <div key={alert.id} className="mobile-card border-2 border-red-200 bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{alert.grocery_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">₹{alert.estimated_loss.toFixed(2)}</div>
                          <div className="text-xs text-gray-600">Potential Loss</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Quantity at Risk:</span>
                          <p className="font-semibold text-gray-900">{alert.quantity_at_risk} kg</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Days Until Expiry:</span>
                          <p className={`font-semibold ${alert.days_until_expiry <= 1 ? 'text-red-600' : 'text-orange-600'}`}>
                            {alert.days_until_expiry} day{alert.days_until_expiry !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => resolveAlert(alert.id, 'USED_IN_COOKING')}
                          className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          Used in Cooking
                        </button>
                        <button
                          onClick={() => resolveAlert(alert.id, 'DISCARDED')}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          Discarded
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Live Stock Warnings */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Live Stock Warnings</h2>
                <Link href="/chef/stock" className="text-orange-600 text-sm font-medium">
                  View All Stock →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveStock.filter(item => item.status !== 'good').map((item) => (
                  <div key={item.id} className="mobile-card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current: {item.current} {item.unit}</span>
                      <span className="text-gray-600">Min: {item.minimum} {item.unit}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">Last used: {item.lastUsed}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/chef/wastage">
                  <div className="mobile-card text-center hover:shadow-lg transition-shadow">
                    <Package className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">Log Wastage</h3>
                    <p className="text-xs text-gray-600">Burnt/Returned</p>
                  </div>
                </Link>

                <Link href="/chef/calculator">
                  <div className="mobile-card text-center hover:shadow-lg transition-shadow">
                    <Calculator className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">Order Calculator</h3>
                    <p className="text-xs text-gray-600">Check Possible</p>
                  </div>
                </Link>

                <Link href="/chef/requests">
                  <div className="mobile-card text-center hover:shadow-lg transition-shadow">
                    <MessageSquare className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">Request Stock</h3>
                    <p className="text-xs text-gray-600">One-tap Manager</p>
                  </div>
                </Link>

                <Link href="/chef/ai-specials">
                  <div className="mobile-card text-center hover:shadow-lg transition-shadow">
                    <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">RestMan Specials</h3>
                    <p className="text-xs text-gray-600">Smart suggestions</p>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Signature Dishes Status */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Signature Dishes - Possible Orders</h2>
              <div className="space-y-3">
                {signatureDishes.map((dish, index) => (
                  <div key={index} className="mobile-card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">{dish.possibleOrders}</span>
                        <span className="text-sm text-gray-600">orders</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      {dish.missingIngredients.length > 0 && (
                        <span className="text-red-600">Missing: {dish.missingIngredients.join(', ')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* One-tap Manager Request */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Manager Request</h2>
              <div className="mobile-card">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={quickRequestMessage}
                    onChange={(e) => setQuickRequestMessage(e.target.value)}
                    placeholder="Need 5kg chicken urgently..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    onKeyPress={(e) => e.key === 'Enter' && sendQuickRequest()}
                  />
                  <button
                    onClick={sendQuickRequest}
                    disabled={!quickRequestMessage.trim()}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* RestMan Suggestions for Today's Special */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">RestMan Suggestions - Today's Special</h2>
              <div className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="mobile-card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-gray-900">{suggestion.dish}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">{suggestion.margin} margin</div>
                        <div className="text-xs text-gray-600">{suggestion.orders} orders possible</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Today's Wastage Summary */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Today's Wastage</h2>
                <Link href="/chef/wastage" className="text-orange-600 text-sm font-medium">
                  Add Entry →
                </Link>
              </div>
              
              <div className="space-y-3">
                {todaysWastage.map((waste) => (
                  <div key={waste.id} className="mobile-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{waste.item}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Qty: {waste.quantity}</span>
                          <span>Reason: {waste.reason}</span>
                          <span>Time: {waste.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">${waste.cost}</div>
                        <div className="text-xs text-gray-600">Loss</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {todaysWastage.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No wastage recorded today! Great job!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Current Batch */}
            {currentBatch && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Current Batch: {currentBatch.recipe_name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-blue-700">Batch Size:</span>
                    <div className="font-semibold">{currentBatch.batch_size}</div>
                  </div>
                  <div>
                    <span className="text-sm text-blue-700">Expected Yield:</span>
                    <div className="font-semibold">{currentBatch.expected_yield}</div>
                  </div>
                  <div>
                    <span className="text-sm text-blue-700">Status:</span>
                    <div className="font-semibold text-blue-600">In Progress</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      const actualYield = prompt('Enter actual yield:')
                      if (actualYield) completeBatch(parseInt(actualYield))
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Complete Batch
                  </button>
                  <button
                    onClick={() => setCurrentBatch(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">Total Recipes</h3>
                <p className="text-3xl font-bold text-blue-600">{recipes.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">Active Ingredients</h3>
                <p className="text-3xl font-bold text-green-600">{ingredients.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">Low Stock</h3>
                <p className="text-3xl font-bold text-orange-600">{getLowStockIngredients().length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">Expiring Soon</h3>
                <p className="text-3xl font-bold text-red-600">{getExpiringIngredients().length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recipe Management */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Recipe Management</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recipes.map(recipe => (
                      <div key={recipe.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                          <span className="text-sm text-gray-500">{recipe.category}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Prep: {recipe.prep_time}min | Cook: {recipe.cook_time}min | Yield: {recipe.yield}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedRecipe(recipe)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => startBatch(recipe)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Start Batch
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ingredient Status */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Ingredient Status</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {ingredients.map(ingredient => (
                      <div key={ingredient.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{ingredient.name}</h3>
                          <span className={`text-sm px-2 py-1 rounded ${
                            ingredient.current_amt <= ingredient.minimum_amt 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {ingredient.current_amt}kg
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Category: {ingredient.category}
                          {ingredient.expiry_date && (
                            <span className="ml-4">
                              Expires: {new Date(ingredient.expiry_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const quantity = prompt('Enter wastage quantity (kg):')
                              const reason = prompt('Enter reason for wastage:')
                              if (quantity && reason) {
                                logWastage(ingredient.id, parseFloat(quantity), reason)
                              }
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Log Wastage
                          </button>
                          {ingredient.current_amt <= ingredient.minimum_amt && (
                            <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700">
                              Request Stock
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Batch History */}
            <div className="bg-white rounded-lg shadow mt-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Batch History</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Recipe</th>
                        <th className="text-left py-2">Batch Size</th>
                        <th className="text-left py-2">Expected</th>
                        <th className="text-left py-2">Actual</th>
                        <th className="text-left py-2">Variance</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchHistory.map(batch => (
                        <tr key={batch.id} className="border-b border-gray-100">
                          <td className="py-2">{batch.recipe_name}</td>
                          <td className="py-2">{batch.batch_size}</td>
                          <td className="py-2">{batch.expected_yield}</td>
                          <td className="py-2">{batch.actual_yield}</td>
                          <td className={`py-2 font-semibold ${
                            Math.abs(batch.variance_percentage) > 15 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {batch.variance_percentage.toFixed(1)}%
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              batch.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800'
                                : batch.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {batch.status}
                            </span>
                          </td>
                          <td className="py-2 text-sm text-gray-500">
                            {new Date(batch.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recipe Details Modal */}
            {selectedRecipe && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">{selectedRecipe.name}</h2>
                      <button
                        onClick={() => setSelectedRecipe(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <span className="text-sm text-gray-500">Category</span>
                        <div className="font-semibold">{selectedRecipe.category}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Difficulty</span>
                        <div className="font-semibold">{selectedRecipe.difficulty}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Prep Time</span>
                        <div className="font-semibold">{selectedRecipe.prep_time} minutes</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Cook Time</span>
                        <div className="font-semibold">{selectedRecipe.cook_time} minutes</div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-gray-700">{ingredient}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                      <div className="text-gray-700 whitespace-pre-wrap">{selectedRecipe.instructions}</div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setSelectedRecipe(null)
                          startBatch(selectedRecipe)
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Start Batch
                      </button>
                      <button
                        onClick={() => setSelectedRecipe(null)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 