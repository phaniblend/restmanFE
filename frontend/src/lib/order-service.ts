import { supabase } from './supabase'
import { authService } from './auth-service'
import { notificationService } from './notification-service'
import { Database } from './database.types'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

export class OrderService {
  private static instance: OrderService
  
  private constructor() {}
  
  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService()
    }
    return OrderService.instance
  }

  // Create a new order
  async createOrder(tableNumber: string, items: { menuItemId: string, quantity: number, notes?: string }[]) {
    try {
      const restaurant = await authService.getUserRestaurant()
      const userProfile = await authService.getUserProfile()
      
      if (!restaurant || !userProfile) {
        throw new Error('Restaurant or user not found')
      }

      // Calculate total amount
      let totalAmount = 0
      const menuItemIds = items.map(item => item.menuItemId)
      
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, price')
        .in('id', menuItemIds)

      if (menuError) throw menuError

      const priceMap = new Map(menuItems?.map(item => [item.id, item.price]) || [])
      
      items.forEach(item => {
        const price = priceMap.get(item.menuItemId) || 0
        totalAmount += price * item.quantity
      })

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          restaurant_id: restaurant.id,
          table_number: tableNumber,
          waiter_id: userProfile.id,
          status: 'PENDING',
          total_amount: totalAmount
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        price: priceMap.get(item.menuItemId) || 0,
        notes: item.notes || null
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Process inventory deduction
      await this.processInventoryDeduction(order.id)

      return order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  // Process inventory deduction for an order
  async processInventoryDeduction(orderId: string) {
    try {
      // Get order items with menu and recipe details
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          *,
          menu_item:menu_items(
            *,
            recipe:recipes(
              id,
              name,
              recipe_grocery_map(
                grocery_id,
                quantity_per_order
              )
            )
          )
        `)
        .eq('order_id', orderId)

      if (error) throw error

      // Calculate total grocery requirements
      const groceryDeductions = new Map<string, number>()
      
      orderItems?.forEach(orderItem => {
        const recipe = orderItem.menu_item?.recipe
        if (recipe?.recipe_grocery_map) {
          recipe.recipe_grocery_map.forEach((mapping: any) => {
            const currentAmount = groceryDeductions.get(mapping.grocery_id) || 0
            const deductionAmount = mapping.quantity_per_order * orderItem.quantity
            groceryDeductions.set(mapping.grocery_id, currentAmount + deductionAmount)
          })
        }
      })

      // Update grocery quantities
      const groceryEntries = Array.from(groceryDeductions.entries())
      for (const [groceryId, deductionAmount] of groceryEntries) {
        // Get current grocery amount
        const { data: grocery, error: groceryError } = await supabase
          .from('groceries')
          .select('current_amt, name')
          .eq('id', groceryId)
          .single()

        if (groceryError) {
          console.error(`Error fetching grocery ${groceryId}:`, groceryError)
          continue
        }

        if (grocery) {
          const newAmount = Math.max(0, grocery.current_amt - deductionAmount)
          
          // Update grocery amount
          const { error: updateError } = await supabase
            .from('groceries')
            .update({ current_amt: newAmount })
            .eq('id', groceryId)

          if (updateError) {
            console.error(`Error updating grocery ${grocery.name}:`, updateError)
          }

          // Create usage log
          const userProfile = await authService.getUserProfile()
          if (userProfile) {
            await supabase
              .from('grocery_usage_log')
              .insert([{
                restaurant_id: userProfile.restaurant_id,
                grocery_id: groceryId,
                quantity_used: deductionAmount,
                used_by: userProfile.id,
                purpose: 'COOKING'
              }])
          }

          // Check if we need to create a low stock alert
          if (newAmount < 10) { // Threshold can be made dynamic
            await this.createLowStockAlert(groceryId, grocery.name, newAmount)
          }
        }
      }
    } catch (error) {
      console.error('Error processing inventory deduction:', error)
      // Don't throw - we don't want to fail the order if inventory update fails
    }
  }

  // Create low stock alert
  async createLowStockAlert(groceryId: string, groceryName: string, currentAmount: number) {
    try {
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) return

      // Check if alert already exists
      const { data: existingAlert } = await supabase
        .from('stale_alerts')
        .select('id')
        .eq('grocery_id', groceryId)
        .eq('alert_type', 'LOW_STOCK')
        .eq('resolved', false)
        .single()

      if (!existingAlert) {
        await supabase
          .from('stale_alerts')
          .insert([{
            restaurant_id: restaurant.id,
            grocery_id: groceryId,
            alert_type: 'LOW_STOCK' as any, // Type workaround
            severity: currentAmount < 5 ? 'HIGH' : 'MEDIUM',
            quantity_at_risk: currentAmount,
            days_until_expiry: 0,
            predicted_usage: 0,
            notify_manager: true,
            notify_chef: true
          }])

        // Send SMS/email notifications for low stock
        await notificationService.sendLowStockAlert(groceryName, currentAmount)
      }
    } catch (error) {
      console.error('Error creating low stock alert:', error)
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  // Get orders for a restaurant
  async getOrders(filters?: { 
    status?: Order['status'][], 
    tableNumber?: string,
    date?: Date 
  }) {
    try {
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) throw new Error('No restaurant found')

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            menu_item:menu_items(
              name,
              price
            )
          ),
          waiter:users(
            full_name
          )
        `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })

      if (filters?.status?.length) {
        query = query.in('status', filters.status)
      }

      if (filters?.tableNumber) {
        query = query.eq('table_number', filters.tableNumber)
      }

      if (filters?.date) {
        const startOfDay = new Date(filters.date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(filters.date)
        endOfDay.setHours(23, 59, 59, 999)
        
        query = query
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  // Get active orders count
  async getActiveOrdersCount(): Promise<number> {
    try {
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) return 0

      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)
        .in('status', ['PENDING', 'PREPARING'])

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error counting active orders:', error)
      return 0
    }
  }

  // Get today's revenue
  async getTodayRevenue(): Promise<number> {
    try {
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) return 0

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('restaurant_id', restaurant.id)
        .eq('status', 'DELIVERED')
        .gte('created_at', today.toISOString())

      if (error) throw error
      
      return data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    } catch (error) {
      console.error('Error calculating revenue:', error)
      return 0
    }
  }
}

// Export singleton instance
export const orderService = OrderService.getInstance() 