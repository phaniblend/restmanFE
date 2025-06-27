import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

export const supabase = createClientComponentClient<Database>()

// Database utility functions
export const db = {
  // Groceries
  async getGroceries() {
    const { data, error } = await supabase
      .from('groceries')
      .select('*')
      .order('name')
    return { data, error }
  },

  async getGroceryById(id: string) {
    const { data, error } = await supabase
      .from('groceries')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createGrocery(grocery: any) {
    const { data, error } = await supabase
      .from('groceries')
      .insert(grocery)
      .select()
      .single()
    return { data, error }
  },

  async updateGrocery(id: string, updates: any) {
    const { data, error } = await supabase
      .from('groceries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Recipes
  async getRecipes() {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_grocery_map (
          quantity_per_order,
          groceries (*)
        )
      `)
      .order('name')
    return { data, error }
  },

  async getRecipeById(id: string) {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_grocery_map (
          quantity_per_order,
          groceries (*)
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Batch Production (Yield Tracking)
  async getBatchProduction() {
    const { data, error } = await supabase
      .from('batch_production')
      .select(`
        *,
        recipes (name),
        users (username)
      `)
      .order('batch_date', { ascending: false })
    return { data, error }
  },

  async createBatchProduction(batch: any) {
    const { data, error } = await supabase
      .from('batch_production')
      .insert(batch)
      .select()
      .single()
    return { data, error }
  },

  // Stale Alerts
  async getStaleAlerts() {
    const { data, error } = await supabase
      .from('stale_alerts')
      .select(`
        *,
        groceries (name, expiry_date, current_amt)
      `)
      .eq('resolved', false)
      .order('alert_date', { ascending: false })
    return { data, error }
  },

  async createStaleAlert(alert: any) {
    const { data, error } = await supabase
      .from('stale_alerts')
      .insert(alert)
      .select()
      .single()
    return { data, error }
  },

  // Analytics
  async getInventoryStats() {
    const { data, error } = await supabase
      .from('groceries')
      .select('category, current_amt, initial_amt')
    return { data, error }
  },

  async getYieldVarianceStats() {
    const { data, error } = await supabase
      .from('batch_production')
      .select('expected_yield, actual_yield, variance_percentage, batch_date')
      .gte('batch_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    return { data, error }
  }
}

// Real-time subscriptions
export const subscriptions = {
  onGroceriesChange(callback: (payload: any) => void) {
    return supabase
      .channel('groceries-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'groceries' }, 
        callback
      )
      .subscribe()
  },

  onStaleAlertsChange(callback: (payload: any) => void) {
    return supabase
      .channel('stale-alerts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stale_alerts' }, 
        callback
      )
      .subscribe()
  }
} 