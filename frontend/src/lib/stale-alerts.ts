import { supabase } from './supabase'
import { authService } from './auth-service'
import { differenceInDays } from 'date-fns'
import { notificationService } from './notification-service'

export interface StaleAlert {
  id: string
  grocery_id: string
  grocery_name: string
  alert_type: 'APPROACHING_EXPIRY' | 'STALE_RISK' | 'EXPIRED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  quantity_at_risk: number
  days_until_expiry: number
  estimated_loss: number
  created_at: string
}

export class StaleAlertService {
  // Get all stale alerts for a restaurant
  async getStaleAlerts(): Promise<StaleAlert[]> {
    try {
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) return []

      const { data, error } = await supabase
        .from('stale_alerts')
        .select(`
          *,
          grocery:groceries(name)
        `)
        .eq('restaurant_id', restaurant.id)
        .eq('resolved', false)
        .order('severity', { ascending: false })
        .order('days_until_expiry', { ascending: true })

      if (error) throw error

      return (data || []).map(alert => ({
        id: alert.id,
        grocery_id: alert.grocery_id,
        grocery_name: alert.grocery?.name || 'Unknown',
        alert_type: alert.alert_type,
        severity: alert.severity,
        quantity_at_risk: alert.quantity_at_risk,
        days_until_expiry: alert.days_until_expiry,
        estimated_loss: alert.estimated_loss,
        created_at: alert.created_at
      }))
    } catch (error) {
      console.error('Error fetching stale alerts:', error)
      return []
    }
  }

  // Get critical stale alerts (expiring within 1-2 days)
  async getCriticalStaleAlerts(): Promise<StaleAlert[]> {
    const allAlerts = await this.getStaleAlerts()
    return allAlerts.filter(alert => 
      alert.severity === 'CRITICAL' || 
      alert.days_until_expiry <= 2
    )
  }

  // Check for new stale risks and create alerts
  async checkForStaleRisks() {
    try {
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) return

      // Get all perishable groceries with expiry dates
      const { data: groceries, error } = await supabase
        .from('groceries')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_perishable', true)
        .not('expiry_date', 'is', null)
        .gt('current_amt', 0) // Only items with stock

      if (error) throw error

      for (const grocery of groceries || []) {
        if (!grocery.expiry_date) continue

        const daysUntilExpiry = differenceInDays(new Date(grocery.expiry_date), new Date())
        
        // Check if we need to create an alert
        if (daysUntilExpiry <= 3 && grocery.current_amt > 0) {
          const severity = this.getSeverity(daysUntilExpiry, grocery.current_amt, grocery.minimum_amt || 0)
          const alertType = this.getAlertType(daysUntilExpiry)
          
          // Check if alert already exists
          const { data: existingAlert } = await supabase
            .from('stale_alerts')
            .select('id')
            .eq('grocery_id', grocery.id)
            .eq('alert_type', alertType)
            .eq('resolved', false)
            .single()

          if (!existingAlert) {
            const estimatedLoss = this.calculateEstimatedLoss(grocery.current_amt, grocery.category)
            
            await this.createStaleAlert(grocery.id, {
              alert_type: alertType,
              severity,
              quantity_at_risk: grocery.current_amt,
              days_until_expiry: Math.max(0, daysUntilExpiry),
              estimated_loss: estimatedLoss
            })
          }
        }
      }
    } catch (error) {
      console.error('Error checking for stale risks:', error)
    }
  }

  // Create a new stale alert
  async createStaleAlert(groceryId: string, alertData: {
    alert_type: 'APPROACHING_EXPIRY' | 'STALE_RISK' | 'EXPIRED'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    quantity_at_risk: number
    days_until_expiry: number
    estimated_loss: number
  }) {
    try {
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) return null

      const { data, error } = await supabase
        .from('stale_alerts')
        .insert([{
          restaurant_id: restaurant.id,
          grocery_id: groceryId,
          alert_type: alertData.alert_type,
          severity: alertData.severity,
          quantity_at_risk: alertData.quantity_at_risk,
          days_until_expiry: alertData.days_until_expiry,
          estimated_loss: alertData.estimated_loss,
          notify_manager: true,
          notify_chef: true
        }])
        .select()
        .single()

      if (error) throw error

      // Send notifications for critical alerts
      if (alertData.severity === 'CRITICAL' || alertData.severity === 'HIGH') {
        // Get grocery details for notification
        const { data: grocery } = await supabase
          .from('groceries')
          .select('name')
          .eq('id', groceryId)
          .single()

        if (grocery) {
          const notificationAlert: StaleAlert = {
            id: data.id,
            grocery_id: groceryId,
            grocery_name: grocery.name,
            alert_type: alertData.alert_type,
            severity: alertData.severity,
            quantity_at_risk: alertData.quantity_at_risk,
            days_until_expiry: alertData.days_until_expiry,
            estimated_loss: alertData.estimated_loss,
            created_at: data.created_at
          }

          // Send SMS/email notifications
          await notificationService.sendStaleAlert(notificationAlert)
        }
      }

      return data
    } catch (error) {
      console.error('Error creating stale alert:', error)
      return null
    }
  }

  // Mark alert as resolved
  async resolveAlert(alertId: string, resolutionAction: string) {
    try {
      const userProfile = await authService.getUserProfile()
      
      const { error } = await supabase
        .from('stale_alerts')
        .update({
          resolved: true,
          resolved_by: userProfile?.id,
          resolved_at: new Date().toISOString(),
          resolution_action: resolutionAction
        })
        .eq('id', alertId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error resolving alert:', error)
      return false
    }
  }

  private getSeverity(daysUntilExpiry: number, currentAmt: number, minimumAmt: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (daysUntilExpiry <= 0) return 'CRITICAL'
    if (daysUntilExpiry <= 1) return 'CRITICAL'
    if (daysUntilExpiry <= 2) return 'HIGH'
    if (daysUntilExpiry <= 3) return 'MEDIUM'
    return 'LOW'
  }

  private getAlertType(daysUntilExpiry: number): 'APPROACHING_EXPIRY' | 'STALE_RISK' | 'EXPIRED' {
    if (daysUntilExpiry <= 0) return 'EXPIRED'
    if (daysUntilExpiry <= 2) return 'STALE_RISK'
    return 'APPROACHING_EXPIRY'
  }

  private calculateEstimatedLoss(quantity: number, category: string): number {
    // Estimated cost per unit by category (in INR)
    const estimatedCosts: { [key: string]: number } = {
      'FROZEN_MEAT': 400,
      'FRESH_MEAT': 500,
      'FROZEN_FISH': 600,
      'FRESH_FISH': 800,
      'MILK': 60,
      'CHEESE': 300,
      'YOGURT': 80,
      'EGGS': 120,
      'BUTTER': 500,
      'CREAM': 200,
      'FRESH_VEGETABLES': 40,
      'ROOT_VEGETABLES': 30,
      'LEAFY_GREENS': 50,
      'TOMATOES': 60,
      'ONIONS': 20,
      'POTATOES': 25,
      'FRESH_FRUITS': 80,
      'BANANAS': 40,
      'CITRUS_FRUITS': 60,
      'APPLES': 120,
      'RICE': 50,
      'WHEAT_FLOUR': 40,
      'PULSES': 80,
      'SUGAR': 45,
      'SALT': 20,
      'OIL': 120,
      'WHOLE_SPICES': 200,
      'GROUND_SPICES': 300,
      'CHILI_POWDER': 150,
      'GARAM_MASALA': 400,
      'TURMERIC': 200,
      'CANNED_TOMATOES': 80,
      'CANNED_BEANS': 60,
      'PICKLES': 150,
      'JAM': 200,
      'TEA': 300,
      'COFFEE': 500,
      'JUICE': 100,
      'SODA': 50,
      'BREAD': 40,
      'PASTA': 80,
      'NUTS': 400,
      'DRIED_FRUITS': 300,
      'OTHER': 100
    }
    
    return quantity * (estimatedCosts[category] || 100)
  }

  // Get alerts for specific role
  async getAlertsForRole(role: 'owner' | 'manager' | 'chef' | 'waiter'): Promise<StaleAlert[]> {
    const allAlerts = await this.getStaleAlerts()
    
    switch (role) {
      case 'owner':
        return allAlerts // Owner sees all alerts
      case 'manager':
        return allAlerts.filter(alert => 
          alert.severity === 'HIGH' || 
          alert.severity === 'CRITICAL' ||
          alert.alert_type === 'STALE_RISK'
        )
      case 'chef':
        return allAlerts.filter(alert => 
          alert.severity === 'HIGH' || 
          alert.severity === 'CRITICAL'
        )
      case 'waiter':
        return [] // Waiters don't see stale alerts
      default:
        return []
    }
  }

  // Get menu suggestions for expiring items
  getMenuSuggestions(groceryName: string, category: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      'FROZEN_MEAT': [
        `${groceryName} Special Curry`,
        `Grilled ${groceryName} Platter`,
        `${groceryName} Biryani Special`,
        `Chef's ${groceryName} Stir Fry`
      ],
      'FRESH_MEAT': [
        `${groceryName} Curry`,
        `${groceryName} Fry`,
        `${groceryName} Masala`,
        `${groceryName} Tikka`
      ],
      'FRESH_FISH': [
        `Fresh ${groceryName} Curry`,
        `${groceryName} Fry Special`,
        `Coastal ${groceryName} Masala`,
        `${groceryName} Tikka`
      ],
      'FRESH_VEGETABLES': [
        `Garden Fresh ${groceryName} Curry`,
        `${groceryName} Stir Fry`,
        `Mixed Vegetable with ${groceryName}`,
        `${groceryName} Sabzi Special`
      ],
      'DAIRY': [
        `${groceryName} Based Dessert`,
        `Creamy ${groceryName} Sauce`,
        `${groceryName} Lassi Special`,
        `${groceryName} Paneer Curry`
      ],
      'FRESH_FRUITS': [
        `Fresh ${groceryName} Juice`,
        `${groceryName} Fruit Salad`,
        `${groceryName} Smoothie`,
        `${groceryName} Dessert Special`
      ]
    }
    
    return suggestions[category] || [`Special ${groceryName} Dish`]
  }
}

export const staleAlertService = new StaleAlertService() 