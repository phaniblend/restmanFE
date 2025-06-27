'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutGrid, Users, Clock, DollarSign, Plus, X, 
  ShoppingCart, Check, Coffee, UtensilsCrossed, 
  ChefHat, AlertCircle 
} from 'lucide-react'
import { orderService } from '@/lib/order-service'
import { supabase } from '@/lib/supabase'
import { authService } from '@/lib/auth-service'
import toast from 'react-hot-toast'

interface Table {
  id: string
  table_number: number
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING'
  current_order_id?: string
  customer_count?: number
  seated_at?: string
}

interface Order {
  id: string
  table_id: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID'
  total_amount: number
  created_at: string
  items: OrderItem[]
}

interface OrderItem {
  id: string
  menu_item_name: string
  quantity: number
  price: number
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED'
  special_instructions?: string
}

interface CustomerRequest {
  id: string
  table_id: string
  request_type: 'WATER' | 'NAPKINS' | 'UTENSILS' | 'BILL' | 'SPECIAL_REQUEST'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  description?: string
  created_at: string
}

export default function WaiterTablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [newRequest, setNewRequest] = useState('')
  const [requestType, setRequestType] = useState<CustomerRequest['request_type']>('WATER')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const userProfile = await authService.getUserProfile()
      if (!userProfile?.restaurant_id) return

      // Fetch tables
      const { data: tablesData } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', userProfile.restaurant_id)
        .order('table_number')

      // Fetch active orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('restaurant_id', userProfile.restaurant_id)
        .in('status', ['PENDING', 'PREPARING', 'READY', 'SERVED'])

      // Fetch customer requests
      const { data: requestsData } = await supabase
        .from('customer_requests')
        .select('*')
        .eq('restaurant_id', userProfile.restaurant_id)
        .in('status', ['PENDING', 'IN_PROGRESS'])
        .order('created_at', { ascending: false })

      setTables(tablesData || [])
      setOrders(ordersData || [])
      setCustomerRequests(requestsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTableStatus = async (tableId: string, status: Table['status'], customerCount?: number) => {
    try {
      const updateData: any = { status }
      if (status === 'OCCUPIED') {
        updateData.customer_count = customerCount
        updateData.seated_at = new Date().toISOString()
      } else if (status === 'AVAILABLE') {
        updateData.customer_count = null
        updateData.seated_at = null
        updateData.current_order_id = null
      }

      await supabase
        .from('tables')
        .update(updateData)
        .eq('id', tableId)

      await fetchData()
    } catch (error) {
      console.error('Error updating table status:', error)
    }
  }

  const createOrder = async (tableId: string) => {
    try {
      const userProfile = await authService.getUserProfile()
      if (!userProfile?.restaurant_id) return

      const { data: order } = await supabase
        .from('orders')
        .insert([{
          restaurant_id: userProfile.restaurant_id,
          table_id: tableId,
          status: 'PENDING',
          total_amount: 0,
          created_by: userProfile.id
        }])
        .select()
        .single()

      if (order) {
        // Update table with order reference
        await supabase
          .from('tables')
          .update({ current_order_id: order.id })
          .eq('id', tableId)

        await fetchData()
      }
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }

  const addItemToOrder = async (orderId: string, menuItemId: string, quantity: number = 1) => {
    try {
      // Get menu item details
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('name, price')
        .eq('id', menuItemId)
        .single()

      if (!menuItem) return

      await supabase
        .from('order_items')
        .insert([{
          order_id: orderId,
          menu_item_id: menuItemId,
          menu_item_name: menuItem.name,
          quantity,
          price: menuItem.price,
          status: 'PENDING'
        }])

      // Update order total
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('price, quantity')
        .eq('order_id', orderId)

      const total = orderItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0

      await supabase
        .from('orders')
        .update({ total_amount: total })
        .eq('id', orderId)

      await fetchData()
    } catch (error) {
      console.error('Error adding item to order:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      await fetchData()
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const createCustomerRequest = async (tableId: string) => {
    try {
      const userProfile = await authService.getUserProfile()
      if (!userProfile?.restaurant_id) return

      await supabase
        .from('customer_requests')
        .insert([{
          restaurant_id: userProfile.restaurant_id,
          table_id: tableId,
          request_type: requestType,
          status: 'PENDING',
          description: newRequest,
          created_by: userProfile.id
        }])

      setNewRequest('')
      await fetchData()
    } catch (error) {
      console.error('Error creating customer request:', error)
    }
  }

  const updateRequestStatus = async (requestId: string, status: CustomerRequest['status']) => {
    try {
      await supabase
        .from('customer_requests')
        .update({ status })
        .eq('id', requestId)

      await fetchData()
    } catch (error) {
      console.error('Error updating request status:', error)
    }
  }

  const getTableOrder = (tableId: string) => {
    return orders.find(order => order.table_id === tableId)
  }

  const getTableRequests = (tableId: string) => {
    return customerRequests.filter(request => request.table_id === tableId)
  }

  if (loading) {
    return <div className="p-6 text-center">Loading tables...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Table Management</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Tables</h3>
            <p className="text-3xl font-bold text-blue-600">{tables.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Occupied</h3>
            <p className="text-3xl font-bold text-orange-600">
              {tables.filter(t => t.status === 'OCCUPIED').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Active Orders</h3>
            <p className="text-3xl font-bold text-green-600">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
            <p className="text-3xl font-bold text-red-600">
              {customerRequests.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tables Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Tables</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tables.map(table => {
                    const tableOrder = getTableOrder(table.id)
                    const tableRequests = getTableRequests(table.id)
                    const pendingRequests = tableRequests.filter(r => r.status === 'PENDING')

                    return (
                      <div
                        key={table.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          table.status === 'OCCUPIED'
                            ? 'border-orange-300 bg-orange-50'
                            : table.status === 'RESERVED'
                            ? 'border-purple-300 bg-purple-50'
                            : table.status === 'CLEANING'
                            ? 'border-red-300 bg-red-50'
                            : 'border-green-300 bg-green-50'
                        }`}
                        onClick={() => setSelectedTable(table)}
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">Table {table.table_number}</div>
                          <div className="text-sm text-gray-600">Capacity: {table.capacity}</div>
                          <div className={`text-sm font-semibold mt-2 ${
                            table.status === 'OCCUPIED'
                              ? 'text-orange-700'
                              : table.status === 'RESERVED'
                              ? 'text-purple-700'
                              : table.status === 'CLEANING'
                              ? 'text-red-700'
                              : 'text-green-700'
                          }`}>
                            {table.status}
                          </div>
                          {table.customer_count && (
                            <div className="text-sm text-gray-600 mt-1">
                              {table.customer_count} customers
                            </div>
                          )}
                          {tableOrder && (
                            <div className="text-sm font-semibold text-blue-600 mt-1">
                              Order: ${tableOrder.total_amount}
                            </div>
                          )}
                          {pendingRequests.length > 0 && (
                            <div className="text-sm font-semibold text-red-600 mt-1">
                              {pendingRequests.length} requests
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Customer Requests</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {customerRequests.map(request => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Table {tables.find(t => t.id === request.table_id)?.table_number}
                        </div>
                        <div className="text-sm text-gray-600">{request.request_type}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        request.status === 'PENDING'
                          ? 'bg-red-100 text-red-800'
                          : request.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    {request.description && (
                      <div className="text-sm text-gray-700 mb-3">{request.description}</div>
                    )}
                    <div className="flex gap-2">
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateRequestStatus(request.id, 'IN_PROGRESS')}
                            className="bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => updateRequestStatus(request.id, 'COMPLETED')}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Complete
                          </button>
                        </>
                      )}
                      {request.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => updateRequestStatus(request.id, 'COMPLETED')}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {customerRequests.length === 0 && (
                  <div className="text-center text-gray-500 py-8">No pending requests</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table Details Modal */}
        {selectedTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Table {selectedTable.table_number} Details
                  </h2>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Table Status */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Table Status</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            const count = prompt('Number of customers:')
                            if (count) {
                              updateTableStatus(selectedTable.id, 'OCCUPIED', parseInt(count))
                              createOrder(selectedTable.id)
                            }
                          }}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                        >
                          Seat Customers
                        </button>
                        <button
                          onClick={() => updateTableStatus(selectedTable.id, 'AVAILABLE')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Clear Table
                        </button>
                        <button
                          onClick={() => updateTableStatus(selectedTable.id, 'RESERVED')}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                          Reserve
                        </button>
                        <button
                          onClick={() => updateTableStatus(selectedTable.id, 'CLEANING')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Needs Cleaning
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Current Order */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Current Order</h3>
                    {getTableOrder(selectedTable.id) ? (
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">Order #{getTableOrder(selectedTable.id)?.id.slice(-8)}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              getTableOrder(selectedTable.id)?.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : getTableOrder(selectedTable.id)?.status === 'PREPARING'
                                ? 'bg-blue-100 text-blue-800'
                                : getTableOrder(selectedTable.id)?.status === 'READY'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {getTableOrder(selectedTable.id)?.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Total: ${getTableOrder(selectedTable.id)?.total_amount}
                          </div>
                          <div className="space-y-2">
                            {getTableOrder(selectedTable.id)?.items.map(item => (
                              <div key={item.id} className="flex justify-between items-center text-sm">
                                <span>{item.quantity}x {item.menu_item_name}</span>
                                <span>${item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => updateOrderStatus(getTableOrder(selectedTable.id)!.id, 'PAID')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => updateOrderStatus(getTableOrder(selectedTable.id)!.id, 'SERVED')}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Mark Served
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">No active order</div>
                    )}
                  </div>
                </div>

                {/* Customer Request Form */}
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-900 mb-4">New Customer Request</h3>
                  <div className="flex gap-4">
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value as CustomerRequest['request_type'])}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="WATER">Water</option>
                      <option value="NAPKINS">Napkins</option>
                      <option value="UTENSILS">Utensils</option>
                      <option value="BILL">Bill</option>
                      <option value="SPECIAL_REQUEST">Special Request</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newRequest}
                      onChange={(e) => setNewRequest(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <button
                      onClick={() => createCustomerRequest(selectedTable.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Submit Request
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