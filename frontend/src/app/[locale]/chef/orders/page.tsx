'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChefHat, 
  Users, 
  DollarSign,
  Play,
  Pause,
  Check,
  X,
  RefreshCw,
  Bell
} from 'lucide-react'
import { orderService } from '@/lib/order-service'
import { supabase } from '@/lib/supabase'
import { authService } from '@/lib/auth-service'
import toast from 'react-hot-toast'

interface Order {
  id: string
  table_number: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  total_amount: number
  created_at: string
  waiter: {
    full_name: string
  }
  order_items: {
    id: string
    quantity: number
    notes?: string
    menu_item: {
      name: string
      price: number
    }
  }[]
}

export default function ChefOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    loadOrders()
    // Set up real-time subscription for new orders
    const channel = supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) return

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          waiter:users(full_name),
          order_items(
            id,
            quantity,
            notes,
            menu_item:menu_items(name, price)
          )
        `)
        .eq('restaurant_id', restaurant.id)
        .in('status', ['PENDING', 'PREPARING'])
        .order('created_at', { ascending: true })

      if (error) throw error
      setOrders(data || [])
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: 'PREPARING' | 'READY') => {
    try {
      setIsUpdating(true)
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ))

      // If order is ready, show notification
      if (status === 'READY') {
        const order = orders.find(o => o.id === orderId)
        if (order) {
          toast.success(`Order for Table ${order.table_number} is ready!`)
          // In production, this would trigger a notification to the waiter
        }
      }

      toast.success(`Order status updated to ${status}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PREPARING': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'READY': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5" />
      case 'PREPARING': return <ChefHat className="w-5 h-5" />
      case 'READY': return <CheckCircle className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
  }

  const getOrderDuration = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    return diffMins
  }

  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const preparingOrders = orders.filter(o => o.status === 'PREPARING')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
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
              <h1 className="text-xl font-bold gradient-text">Kitchen Orders</h1>
              <p className="text-sm text-gray-600">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            
            <button
              onClick={loadOrders}
              disabled={isLoading}
              className="btn-premium flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.header>

      <div className="mobile-container py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="mobile-card text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</span>
            </div>
            <p className="text-sm text-gray-600">Pending Orders</p>
          </div>

          <div className="mobile-card text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <ChefHat className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{preparingOrders.length}</span>
            </div>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
        </div>

        {/* Pending Orders */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-yellow-500 mr-2" />
            Pending Orders ({pendingOrders.length})
          </h2>
          
          <AnimatePresence>
            {pendingOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mobile-card mb-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Table {order.table_number}</h3>
                      <p className="text-sm text-gray-600">
                        Waiter: {order.waiter?.full_name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getOrderDuration(order.created_at)}m ago
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium">{item.menu_item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} • ${item.menu_item.price.toFixed(2)} each
                        </p>
                        {item.notes && (
                          <p className="text-sm text-orange-600">Note: {item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${(item.quantity * item.menu_item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                    disabled={isUpdating}
                    className="flex-1 btn-premium flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Cooking</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {pendingOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No pending orders! Kitchen is caught up.</p>
            </div>
          )}
        </motion.div>

        {/* Preparing Orders */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ChefHat className="w-5 h-5 text-blue-500 mr-2" />
            In Progress ({preparingOrders.length})
          </h2>
          
          <AnimatePresence>
            {preparingOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mobile-card mb-4 border-2 border-blue-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Table {order.table_number}</h3>
                      <p className="text-sm text-gray-600">
                        Waiter: {order.waiter?.full_name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getOrderDuration(order.created_at)}m ago
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-blue-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium">{item.menu_item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} • ${item.menu_item.price.toFixed(2)} each
                        </p>
                        {item.notes && (
                          <p className="text-sm text-orange-600">Note: {item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${(item.quantity * item.menu_item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'READY')}
                    disabled={isUpdating}
                    className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark Ready</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {preparingOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Pause className="w-12 h-12 mx-auto mb-2 text-blue-500" />
              <p>No orders in progress.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 