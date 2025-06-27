import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
import { Database } from './database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

export class AuthService {
  private static instance: AuthService
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Get current authenticated user from Supabase
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Get user profile from our users table
  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    try {
      const currentUser = await this.getCurrentUser()
      const id = userId || currentUser?.id
      
      if (!id) return null

      // First try to get by auth id
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      // If not found by id, try by phone
      if (!data && currentUser?.phone) {
        const phoneResult = await supabase
          .from('users')
          .select('*')
          .eq('phone', currentUser.phone)
          .single()
        
        data = phoneResult.data
        error = phoneResult.error
      }

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return null
    }
  }

  // Sign in with phone OTP
  async signInWithOTP(phone: string) {
    return await supabase.auth.signInWithOtp({
      phone: phone,
    })
  }

  // Verify OTP
  async verifyOTP(phone: string, token: string) {
    return await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: 'sms'
    })
  }

  // Create user profile after first authentication
  async createUserProfile(data: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const currentUser = await this.getCurrentUser()
      if (!currentUser) throw new Error('No authenticated user')

      const { data: profile, error } = await supabase
        .from('users')
        .insert([{
          ...data,
          phone: currentUser.phone || data.phone,
        }])
        .select()
        .single()

      if (error) throw error
      return profile
    } catch (error) {
      console.error('Error creating user profile:', error)
      return null
    }
  }

  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const currentUser = await this.getCurrentUser()
      if (!currentUser) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUser.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return !!user
  }

  // Check if user has specific role
  async hasRole(role: string): Promise<boolean> {
    const profile = await this.getUserProfile()
    return profile?.role === role
  }

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
    // Clear any cached data
    localStorage.removeItem('currentUser')
    localStorage.removeItem('restaurantSetup')
  }

  // Get restaurant for current user
  async getUserRestaurant() {
    const profile = await this.getUserProfile()
    if (!profile?.restaurant_id) return null

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', profile.restaurant_id)
      .single()

    if (error) {
      console.error('Error fetching restaurant:', error)
      return null
    }

    return data
  }

  // Listen for auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }

  // Create demo user for testing
  async createDemoUser() {
    // Check if demo restaurant exists
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('name', 'Demo Restaurant')
      .single()

    let restaurantId = existingRestaurant?.id

    // Create demo restaurant if it doesn't exist
    if (!restaurantId) {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert([{
          name: 'Demo Restaurant',
          address: '123 Demo Street, Demo City, DC 12345',
          phone: '+1234567890',
          email: 'demo@restman.com',
          cuisine_type: 'Multi-Cuisine'
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating demo restaurant:', error)
        return null
      }
      restaurantId = restaurant.id
    }

    // Create demo owner user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        phone: '+1234567890',
        username: 'demo_owner',
        full_name: 'Demo Owner',
        role: 'owner',
        restaurant_id: restaurantId,
        is_active: true
      }])
      .select()
      .single()

    if (error && error.code !== '23505') { // Ignore duplicate key error
      console.error('Error creating demo user:', error)
      return null
    }

    // Update restaurant owner_id
    if (user) {
      await supabase
        .from('restaurants')
        .update({ owner_id: user.id })
        .eq('id', restaurantId)
    }

    return user
  }
}

// Export singleton instance
export const authService = AuthService.getInstance() 