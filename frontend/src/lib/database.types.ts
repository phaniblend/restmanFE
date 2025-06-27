export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          username: string | null
          full_name: string
          role: 'owner' | 'manager' | 'chef' | 'waiter'
          restaurant_id: string | null
          phone: string
          avatar_url: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          username?: string | null
          full_name: string
          role?: 'owner' | 'manager' | 'chef' | 'waiter'
          restaurant_id?: string | null
          phone: string
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          username?: string | null
          full_name?: string
          role?: 'owner' | 'manager' | 'chef' | 'waiter'
          restaurant_id?: string | null
          phone?: string
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          cuisine_type: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          cuisine_type?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          cuisine_type?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      groceries: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          unit: string
          category: 'MEAT' | 'FISH' | 'DAIRY' | 'VEGETABLES' | 'FRUITS' | 'GRAINS' | 'SPICES' | 'OTHER'
          procured_date: string
          expiry_date: string | null
          initial_amt: number
          current_amt: number
          wastage_amt: number
          wastage_reason: string | null
          cost_per_unit: number
          supplier_name: string | null
          is_perishable: boolean
          shelf_life_days: number | null
          temperature_storage: 'FROZEN' | 'REFRIGERATED' | 'ROOM_TEMP'
          usage_velocity: number | null
          reorder_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          unit?: string
          category?: 'MEAT' | 'FISH' | 'DAIRY' | 'VEGETABLES' | 'FRUITS' | 'GRAINS' | 'SPICES' | 'OTHER'
          procured_date: string
          expiry_date?: string | null
          initial_amt?: number
          current_amt?: number
          wastage_amt?: number
          wastage_reason?: string | null
          cost_per_unit?: number
          supplier_name?: string | null
          is_perishable?: boolean
          shelf_life_days?: number | null
          temperature_storage?: 'FROZEN' | 'REFRIGERATED' | 'ROOM_TEMP'
          usage_velocity?: number | null
          reorder_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          unit?: string
          category?: 'MEAT' | 'FISH' | 'DAIRY' | 'VEGETABLES' | 'FRUITS' | 'GRAINS' | 'SPICES' | 'OTHER'
          procured_date?: string
          expiry_date?: string | null
          initial_amt?: number
          current_amt?: number
          wastage_amt?: number
          wastage_reason?: string | null
          cost_per_unit?: number
          supplier_name?: string | null
          is_perishable?: boolean
          shelf_life_days?: number | null
          temperature_storage?: 'FROZEN' | 'REFRIGERATED' | 'ROOM_TEMP'
          usage_velocity?: number | null
          reorder_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          category: string
          cuisine_type: string | null
          prep_time_minutes: number
          cook_time_minutes: number
          serving_size: number
          difficulty_level: 'EASY' | 'MEDIUM' | 'HARD'
          price: number
          is_ai_generated: boolean
          original_ai_recipe: any | null
          chef_modifications: any | null
          last_modified_by: string | null
          modification_reason: string | null
          popularity_score: number
          avg_rating: number
          total_orders: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string | null
          category?: string
          cuisine_type?: string | null
          prep_time_minutes?: number
          cook_time_minutes?: number
          serving_size?: number
          difficulty_level?: 'EASY' | 'MEDIUM' | 'HARD'
          price?: number
          is_ai_generated?: boolean
          original_ai_recipe?: any | null
          chef_modifications?: any | null
          last_modified_by?: string | null
          modification_reason?: string | null
          popularity_score?: number
          avg_rating?: number
          total_orders?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          category?: string
          cuisine_type?: string | null
          prep_time_minutes?: number
          cook_time_minutes?: number
          serving_size?: number
          difficulty_level?: 'EASY' | 'MEDIUM' | 'HARD'
          price?: number
          is_ai_generated?: boolean
          original_ai_recipe?: any | null
          chef_modifications?: any | null
          last_modified_by?: string | null
          modification_reason?: string | null
          popularity_score?: number
          avg_rating?: number
          total_orders?: number
          created_at?: string
          updated_at?: string
        }
      }
      recipe_grocery_map: {
        Row: {
          id: string
          recipe_id: string
          grocery_id: string
          ai_suggested_qty: number | null
          chef_custom_qty: number | null
          quantity_per_order: number
          is_critical_ingredient: boolean
          substitution_options: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          grocery_id: string
          ai_suggested_qty?: number | null
          chef_custom_qty?: number | null
          quantity_per_order: number
          is_critical_ingredient?: boolean
          substitution_options?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          grocery_id?: string
          ai_suggested_qty?: number | null
          chef_custom_qty?: number | null
          quantity_per_order?: number
          is_critical_ingredient?: boolean
          substitution_options?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          recipe_id: string | null
          name: string
          description: string | null
          category: string
          price: number
          is_available: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          recipe_id?: string | null
          name: string
          description?: string | null
          category?: string
          price: number
          is_available?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          recipe_id?: string | null
          name?: string
          description?: string | null
          category?: string
          price?: number
          is_available?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          table_number: string
          waiter_id: string | null
          status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          table_number: string
          waiter_id?: string | null
          status?: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          table_number?: string
          waiter_id?: string | null
          status?: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          quantity: number
          price: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id?: string | null
          quantity?: number
          price: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string | null
          quantity?: number
          price?: number
          notes?: string | null
          created_at?: string
        }
      }
      batch_production: {
        Row: {
          id: string
          recipe_id: string
          batch_date: string
          expected_yield: number
          actual_yield: number
          variance_percentage: number
          chef_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          batch_date: string
          expected_yield: number
          actual_yield: number
          variance_percentage: number
          chef_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          batch_date?: string
          expected_yield?: number
          actual_yield?: number
          variance_percentage?: number
          chef_id?: string
          notes?: string | null
          created_at?: string
        }
      }
      stale_alerts: {
        Row: {
          id: string
          grocery_id: string
          alert_type: 'APPROACHING_EXPIRY' | 'STALE_RISK' | 'EXPIRED'
          quantity_at_risk: number
          days_until_expiry: number
          predicted_usage: number
          alert_date: string
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          grocery_id: string
          alert_type: 'APPROACHING_EXPIRY' | 'STALE_RISK' | 'EXPIRED'
          quantity_at_risk: number
          days_until_expiry: number
          predicted_usage: number
          alert_date: string
          resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          grocery_id?: string
          alert_type?: 'APPROACHING_EXPIRY' | 'STALE_RISK' | 'EXPIRED'
          quantity_at_risk?: number
          days_until_expiry?: number
          predicted_usage?: number
          alert_date?: string
          resolved?: boolean
          created_at?: string
        }
      }
      monthly_plan: {
        Row: {
          id: string
          recipe_id: string
          planned_orders: number
          month_year: string
          allocation_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          planned_orders: number
          month_year: string
          allocation_percentage: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          planned_orders?: number
          month_year?: string
          allocation_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          recipe_id: string
          orders_sold: number
          orders_returned: number
          wastage: number
          sale_date: string
          revenue: number
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          orders_sold: number
          orders_returned?: number
          wastage?: number
          sale_date: string
          revenue: number
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          orders_sold?: number
          orders_returned?: number
          wastage?: number
          sale_date?: string
          revenue?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 