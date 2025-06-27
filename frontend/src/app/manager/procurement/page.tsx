'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  Package, 
  Plus, 
  Minus,
  DollarSign,
  Send,
  RefreshCw,
  Search,
  Calendar,
  Thermometer,
  Clock
} from 'lucide-react'
import { procurementService, type ProductCategory } from '@/lib/procurement-service'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'
import { authService } from '../../../lib/auth-service'

interface OrderBagItem {
  name: string
  category: ProductCategory
  quantity: number
  unit: string
  cost_per_unit: number
  supplier_name?: string
}

interface PurchaseRequest {
  id: string
  requested_by: string
  requested_by_name: string
  items: PurchaseItem[]
  total_amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED' | 'RECEIVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  created_at: string
  approved_by?: string
  approved_at?: string
  notes?: string
}

interface PurchaseItem {
  id: string
  grocery_name: string
  quantity: number
  estimated_cost: number
  supplier?: string
  urgency: 'NORMAL' | 'URGENT'
}

interface Supplier {
  id: string
  name: string
  contact_person: string
  phone: string
  email: string
  rating: number
  delivery_time: number
  payment_terms: string
  categories: string[]
}

interface InventoryAlert {
  id: string
  grocery_name: string
  current_amt: number
  minimum_amt: number
  alert_type: 'LOW_STOCK' | 'EXPIRING' | 'OVERSTOCK'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  created_at: string
}

interface StaffPerformance {
  user_id: string
  name: string
  role: string
  orders_processed: number
  efficiency_score: number
  wastage_percentage: number
  customer_rating: number
  last_shift: string
}

export default function ManagerProcurementPage() {
  const [orderBag, setOrderBag] = useState<OrderBagItem[]>([])
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'OTHER' as ProductCategory,
    quantity: 1,
    unit: 'kg',
    cost_per_unit: 0,
    supplier_name: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([])
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null)
  const [newRequest, setNewRequest] = useState<PurchaseItem[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  const addToOrderBag = () => {
    if (!newItem.name.trim() || newItem.cost_per_unit <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    const item: OrderBagItem = {
      name: newItem.name.trim(),
      category: newItem.category,
      quantity: newItem.quantity,
      unit: newItem.unit,
      cost_per_unit: newItem.cost_per_unit,
      supplier_name: newItem.supplier_name || undefined
    }

    setOrderBag(prev => [...prev, item])
    
    // Reset form
    setNewItem({
      name: '',
      category: 'OTHER',
      quantity: 1,
      unit: 'kg',
      cost_per_unit: 0,
      supplier_name: ''
    })
    
    toast.success(`Added ${item.name} to order bag`)
  }

  const updateOrderBagQuantity = (index: number, quantity: number) => {
    if (quantity === 0) {
      setOrderBag(prev => prev.filter((_, i) => i !== index))
    } else {
      setOrderBag(prev => prev.map((item, i) => 
        i === index ? { ...item, quantity } : item
      ))
    }
  }

  const clearOrderBag = () => {
    setOrderBag([])
    toast.success('Order bag cleared')
  }

  const submitProcurementOrder = async () => {
    if (orderBag.length === 0) {
      toast.error('Order bag is empty')
      return
    }

    setIsSubmitting(true)
    try {
      const success = await procurementService.submitProcurementOrder(orderBag)
      
      if (success) {
        toast.success('Procurement order submitted successfully!')
        setOrderBag([])
      } else {
        toast.error('Failed to submit procurement order')
      }
    } catch (error) {
      console.error('Error submitting procurement order:', error)
      toast.error('Failed to submit procurement order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTotalCost = () => {
    return orderBag.reduce((sum, item) => sum + (item.cost_per_unit * item.quantity), 0)
  }

  const getShelfLifeInfo = (category: ProductCategory) => {
    return procurementService.getShelfLifeInfo(category)
  }

  const getTemperatureStorage = (category: ProductCategory) => {
    const shelfLife = procurementService.getShelfLifeInfo(category).days
    if (shelfLife <= 7) return 'REFRIGERATED'
    if (shelfLife <= 30) return 'REFRIGERATED'
    return 'ROOM_TEMP'
  }

  const categories = procurementService.getAvailableCategories()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const userProfile = await authService.getUserProfile()
      if (!userProfile?.restaurant_id) return

      // Fetch purchase requests
      const { data: requestsData } = await supabase
        .from('purchase_requests')
        .select(`
          *,
          purchase_items (*),
          users!purchase_requests_requested_by_fkey (name)
        `)
        .eq('restaurant_id', userProfile.restaurant_id)
        .order('created_at', { ascending: false })

      // Fetch suppliers
      const { data: suppliersData } = await supabase
        .from('suppliers')
        .select('*')
        .eq('restaurant_id', userProfile.restaurant_id)

      // Fetch inventory alerts
      const { data: alertsData } = await supabase
        .from('inventory_alerts')
        .select('*')
        .eq('restaurant_id', userProfile.restaurant_id)
        .in('status', ['ACTIVE'])
        .order('severity', { ascending: false })

      // Fetch staff performance (mock data for now)
      const mockStaffPerformance: StaffPerformance[] = [
        {
          user_id: '1',
          name: 'Chef Raj',
          role: 'Chef',
          orders_processed: 45,
          efficiency_score: 94,
          wastage_percentage: 2.1,
          customer_rating: 4.8,
          last_shift: '2024-01-15'
        },
        {
          user_id: '2',
          name: 'Waiter Priya',
          role: 'Waiter',
          orders_processed: 32,
          efficiency_score: 88,
          wastage_percentage: 1.5,
          customer_rating: 4.6,
          last_shift: '2024-01-15'
        }
      ]

      setPurchaseRequests(requestsData || [])
      setSuppliers(suppliersData || [])
      setInventoryAlerts(alertsData || [])
      setStaffPerformance(mockStaffPerformance)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const approvePurchaseRequest = async (requestId: string, approved: boolean, notes?: string) => {
    try {
      const userProfile = await authService.getUserProfile()
      if (!userProfile?.restaurant_id) return

      await supabase
        .from('purchase_requests')
        .update({
          status: approved ? 'APPROVED' : 'REJECTED',
          approved_by: userProfile.id,
          approved_at: new Date().toISOString(),
          notes
        })
        .eq('id', requestId)

      await fetchData()
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const createPurchaseRequest = async () => {
    try {
      const userProfile = await authService.getUserProfile()
      if (!userProfile?.restaurant_id || newRequest.length === 0) return

      const totalAmount = newRequest.reduce((sum, item) => sum + item.estimated_cost, 0)

      const { data: request } = await supabase
        .from('purchase_requests')
        .insert([{
          restaurant_id: userProfile.restaurant_id,
          requested_by: userProfile.id,
          total_amount: totalAmount,
          status: 'PENDING',
          priority: 'MEDIUM'
        }])
        .select()
        .single()

      if (request) {
        // Add purchase items
        await supabase
          .from('purchase_items')
          .insert(newRequest.map(item => ({
            purchase_request_id: request.id,
            grocery_name: item.grocery_name,
            quantity: item.quantity,
            estimated_cost: item.estimated_cost,
            urgency: item.urgency
          })))

        setNewRequest([])
        await fetchData()
      }
    } catch (error) {
      console.error('Error creating purchase request:', error)
    }
  }

  const addItemToRequest = () => {
    const itemName = prompt('Item name:')
    const quantity = prompt('Quantity:')
    const cost = prompt('Estimated cost per unit:')
    
    if (itemName && quantity && cost) {
      setNewRequest([...newRequest, {
        id: Date.now().toString(),
        grocery_name: itemName,
        quantity: parseFloat(quantity),
        estimated_cost: parseFloat(cost),
        urgency: 'NORMAL'
      }])
    }
  }

  const getPriorityColor = (priority: PurchaseRequest['priority']) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: PurchaseRequest['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'ORDERED': return 'bg-blue-100 text-blue-800'
      case 'RECEIVED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading procurement dashboard...</div>
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
              <h1 className="text-xl font-bold gradient-text">Procurement</h1>
              <p className="text-sm text-gray-600">Order supplies with auto-expiry calculation</p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="mobile-container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add New Item */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Item</h2>
            
            <div className="mobile-card space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Chicken Breast, Basmati Rice"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as ProductCategory }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label} ({category.shelfLife})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">L</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cost per Unit (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.cost_per_unit}
                  onChange={(e) => setNewItem(prev => ({ ...prev, cost_per_unit: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier (Optional)</label>
                <input
                  type="text"
                  value={newItem.supplier_name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, supplier_name: e.target.value }))}
                  placeholder="e.g., ABC Suppliers"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Shelf Life Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Shelf Life Info</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Shelf Life:</span>
                    <p className="font-semibold text-gray-900">
                      {getShelfLifeInfo(newItem.category).description}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Storage:</span>
                    <p className="font-semibold text-gray-900">
                      {getTemperatureStorage(newItem.category)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={addToOrderBag}
                className="w-full btn-premium flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Order Bag</span>
              </button>
            </div>
          </motion.div>

          {/* Order Bag */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Order Bag ({orderBag.length})</h2>
              {orderBag.length > 0 && (
                <button
                  onClick={clearOrderBag}
                  className="text-red-600 text-sm hover:text-red-800"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="mobile-card">
              {orderBag.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Your order bag is empty</p>
                  <p className="text-sm">Add items from the left to create a procurement order</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {orderBag.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.category.replace(/_/g, ' ')} • ₹{item.cost_per_unit.toFixed(2)} per {item.unit}
                          </p>
                          <p className="text-xs text-blue-600">
                            Shelf: {getShelfLifeInfo(item.category).description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateOrderBagQuantity(index, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateOrderBagQuantity(index, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-gray-900">₹{(item.cost_per_unit * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold mb-4">
                      <span>Total Cost</span>
                      <span className="text-orange-600">₹{getTotalCost().toFixed(2)}</span>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-green-800">
                        <Calendar className="w-4 h-4" />
                        <span>Expiry dates will be auto-calculated based on purchase date</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={submitProcurementOrder}
                      disabled={isSubmitting}
                      className="w-full btn-premium flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Procurement Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Procurement Management</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {purchaseRequests.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Active Suppliers</h3>
            <p className="text-3xl font-bold text-blue-600">{suppliers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
            <p className="text-3xl font-bold text-red-600">{inventoryAlerts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Staff</h3>
            <p className="text-3xl font-bold text-green-600">{staffPerformance.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Purchase Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Purchase Requests</h2>
                <button
                  onClick={() => setNewRequest([])}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  New Request
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {purchaseRequests.map(request => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            Request by {request.requested_by_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Total: ${request.total_amount} | Items: {request.items?.length || 0}
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => approvePurchaseRequest(request.id, true)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => approvePurchaseRequest(request.id, false)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {purchaseRequests.length === 0 && (
                    <div className="text-center text-gray-500 py-8">No purchase requests</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Inventory Alerts</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {inventoryAlerts.map(alert => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900">{alert.grocery_name}</div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Current: {alert.current_amt}kg | Minimum: {alert.minimum_amt}kg
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {alert.alert_type}
                    </div>
                  </div>
                ))}
                {inventoryAlerts.length === 0 && (
                  <div className="text-center text-gray-500 py-8">No active alerts</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Staff Performance</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Orders</th>
                    <th className="text-left py-2">Efficiency</th>
                    <th className="text-left py-2">Wastage</th>
                    <th className="text-left py-2">Rating</th>
                    <th className="text-left py-2">Last Shift</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerformance.map(staff => (
                    <tr key={staff.user_id} className="border-b border-gray-100">
                      <td className="py-2 font-semibold">{staff.name}</td>
                      <td className="py-2">{staff.role}</td>
                      <td className="py-2">{staff.orders_processed}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          staff.efficiency_score >= 90 ? 'bg-green-100 text-green-800' :
                          staff.efficiency_score >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {staff.efficiency_score}%
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          staff.wastage_percentage <= 2 ? 'bg-green-100 text-green-800' :
                          staff.wastage_percentage <= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {staff.wastage_percentage}%
                        </span>
                      </td>
                      <td className="py-2">{staff.customer_rating}/5</td>
                      <td className="py-2 text-sm text-gray-500">
                        {new Date(staff.last_shift).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* New Purchase Request Modal */}
        {newRequest.length >= 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">New Purchase Request</h2>
                  <button
                    onClick={() => setNewRequest([])}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {newRequest.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{item.grocery_name}</div>
                          <div className="text-sm text-gray-600">
                            {item.quantity} units × ${item.estimated_cost} = ${item.quantity * item.estimated_cost}
                          </div>
                        </div>
                        <button
                          onClick={() => setNewRequest(newRequest.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addItemToRequest}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800"
                  >
                    + Add Item
                  </button>

                  {newRequest.length > 0 && (
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={createPurchaseRequest}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Submit Request
                      </button>
                      <button
                        onClick={() => setNewRequest([])}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Requested by:</span>
                    <div className="font-semibold">{selectedRequest.requested_by_name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Date:</span>
                    <div>{new Date(selectedRequest.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total Amount:</span>
                    <div className="font-semibold text-lg">${selectedRequest.total_amount}</div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Items:</span>
                    <div className="space-y-2 mt-2">
                      {selectedRequest.items?.map(item => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">{item.grocery_name}</div>
                              <div className="text-sm text-gray-600">
                                {item.quantity} units × ${item.estimated_cost}
                              </div>
                            </div>
                            <div className="font-semibold">
                              ${item.quantity * item.estimated_cost}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => approvePurchaseRequest(selectedRequest.id, true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => approvePurchaseRequest(selectedRequest.id, false)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 