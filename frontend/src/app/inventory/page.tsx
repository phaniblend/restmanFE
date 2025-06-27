'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Package, 
  Search,
  Filter,
  Plus,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  ArrowLeft,
  Zap,
  Eye,
  RefreshCw,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Home,
  ChefHat,
  MessageSquare,
  User,
  Settings
} from 'lucide-react'
import { db } from '@/lib/supabase'

interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  minStock: number
  unit: string
  costPerUnit: number
  supplier: string
  lastUpdated: string
  status: 'good' | 'low' | 'critical' | 'out'
  trend: 'up' | 'down' | 'stable'
  image: string
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true)
      const { data, error } = await db.getGroceries()
      if (error) {
        setInventoryItems([])
      } else {
        // Map Supabase fields to InventoryItem interface if needed
        setInventoryItems((data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          currentStock: item.current_amt,
          minStock: item.initial_amt,
          unit: item.unit,
          costPerUnit: item.cost_per_unit,
          supplier: item.supplier,
          lastUpdated: item.updated_at || '',
          status: item.status || 'good',
          trend: item.trend || 'stable',
          image: item.image_url || ''
        })))
      }
      setIsLoading(false)
    }
    fetchInventory()
  }, [])

  const categories = ['all', 'Meat & Poultry', 'Vegetables', 'Dairy', 'Grains & Rice', 'Oils & Condiments']

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50'
      case 'low': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      case 'out': return 'text-red-700 bg-red-100'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4" />
      case 'low': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'out': return <XCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />
    }
  }

  const criticalItems = inventoryItems.filter(item => item.status === 'critical' || item.status === 'out').length
  const lowStockItems = inventoryItems.filter(item => item.status === 'low').length
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 relative"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">Inventory</h1>
              <p className="text-sm text-white/80">Stock Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="px-4 pb-20">
        {/* Stats Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 py-4"
        >
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
            <div className="text-xs text-red-600">Critical</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
            <div className="text-xs text-orange-600">Low Stock</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(0)}</div>
            <div className="text-xs text-green-600">Total Value</div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="flex space-x-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl">
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-blue-50'
                      }`}
                    >
                      {category === 'all' ? 'All Items' : category}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Inventory Items */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(item.trend)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{item.currentStock}</span>
                        <span className="text-gray-500">/{item.minStock} {item.unit}</span>
                      </div>
                      
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${(item.currentStock * item.costPerUnit).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${item.costPerUnit}/{item.unit}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{item.supplier}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.lastUpdated}</span>
                    </div>
                  </div>
                  
                  {/* Stock Level Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item.status === 'good' ? 'bg-green-500' :
                          item.status === 'low' ? 'bg-orange-500' :
                          item.status === 'critical' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}
                        style={{ 
                          width: `${Math.min((item.currentStock / item.minStock) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              {(item.status === 'low' || item.status === 'critical' || item.status === 'out') && (
                <div className="mt-4 flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-xl text-sm font-medium"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Reorder</span>
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-xl text-sm font-medium hover:bg-gray-200"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions FAB */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
          className="fixed bottom-24 right-4"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom"
      >
        <div className="flex items-center justify-around">
          <Link href="/">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center space-y-1 p-2"
            >
              <Home className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Home</span>
            </motion.button>
          </Link>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <ChefHat className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Recipes</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Inventory</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <MessageSquare className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Support</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <User className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Profile</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
} 