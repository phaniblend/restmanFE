import { supabase } from './supabase'
import { authService } from './auth-service'
import { addDays } from 'date-fns'

// Product categories with their shelf life in days
export const PRODUCT_SHELF_LIFE = {
  // Meat & Fish
  'FROZEN_MEAT': 90,      // 3 months
  'FRESH_MEAT': 7,        // 1 week
  'FROZEN_FISH': 60,      // 2 months
  'FRESH_FISH': 3,        // 3 days
  
  // Dairy & Eggs
  'MILK': 7,              // 1 week
  'CHEESE': 21,           // 3 weeks
  'YOGURT': 14,           // 2 weeks
  'EGGS': 28,             // 4 weeks
  'BUTTER': 30,           // 1 month
  'CREAM': 7,             // 1 week
  
  // Vegetables
  'FRESH_VEGETABLES': 7,  // 1 week
  'ROOT_VEGETABLES': 14,  // 2 weeks
  'LEAFY_GREENS': 5,      // 5 days
  'TOMATOES': 7,          // 1 week
  'ONIONS': 30,           // 1 month
  'POTATOES': 21,         // 3 weeks
  
  // Fruits
  'FRESH_FRUITS': 7,      // 1 week
  'BANANAS': 5,           // 5 days
  'CITRUS_FRUITS': 14,    // 2 weeks
  'APPLES': 21,           // 3 weeks
  
  // Grains & Staples
  'RICE': 1095,           // 3 years
  'WHEAT_FLOUR': 730,     // 2 years
  'PULSES': 1095,         // 3 years
  'SUGAR': 1095,          // 3 years
  'SALT': 1095,           // 3 years
  'OIL': 730,             // 2 years
  
  // Spices & Condiments
  'WHOLE_SPICES': 730,    // 2 years
  'GROUND_SPICES': 365,   // 1 year
  'CHILI_POWDER': 365,    // 1 year
  'GARAM_MASALA': 365,    // 1 year
  'TURMERIC': 365,        // 1 year
  
  // Canned & Preserved
  'CANNED_TOMATOES': 730, // 2 years
  'CANNED_BEANS': 730,    // 2 years
  'PICKLES': 1095,        // 3 years
  'JAM': 730,             // 2 years
  
  // Beverages
  'TEA': 730,             // 2 years
  'COFFEE': 365,          // 1 year
  'JUICE': 7,             // 1 week
  'SODA': 365,            // 1 year
  
  // Other
  'BREAD': 7,             // 1 week
  'PASTA': 730,           // 2 years
  'NUTS': 365,            // 1 year
  'DRIED_FRUITS': 730,    // 2 years
  'OTHER': 30             // Default 1 month
} as const

export type ProductCategory = keyof typeof PRODUCT_SHELF_LIFE

interface OrderBagItem {
  name: string
  category: ProductCategory
  quantity: number
  unit: string
  cost_per_unit: number
  supplier_name?: string
}

interface ProcurementOrder {
  id: string
  items: OrderBagItem[]
  total_cost: number
  supplier_name?: string
  order_date: string
  expected_delivery?: string
  status: 'PENDING' | 'ORDERED' | 'DELIVERED' | 'CANCELLED'
}

export class ProcurementService {
  // Calculate expiry date based on product category and purchase date
  calculateExpiryDate(category: ProductCategory, purchaseDate: Date): Date {
    const shelfLifeDays = PRODUCT_SHELF_LIFE[category] || PRODUCT_SHELF_LIFE.OTHER
    return addDays(purchaseDate, shelfLifeDays)
  }

  // Check if item is perishable based on category
  isPerishable(category: ProductCategory): boolean {
    const shelfLife = PRODUCT_SHELF_LIFE[category] || PRODUCT_SHELF_LIFE.OTHER
    return shelfLife <= 30 // Items with shelf life <= 30 days are considered perishable
  }

  // Submit procurement order and create groceries with auto-calculated expiry
  async submitProcurementOrder(orderBag: OrderBagItem[]): Promise<boolean> {
    try {
      const restaurant = await authService.getUserRestaurant()
      const userProfile = await authService.getUserProfile()
      
      if (!restaurant || !userProfile) {
        throw new Error('Restaurant or user not found')
      }

      const purchaseDate = new Date()
      const totalCost = orderBag.reduce((sum, item) => sum + (item.cost_per_unit * item.quantity), 0)

      // Create procurement order record
      const { data: order, error: orderError } = await supabase
        .from('procurement_orders')
        .insert([{
          restaurant_id: restaurant.id,
          ordered_by: userProfile.id,
          total_cost: totalCost,
          supplier_name: orderBag[0]?.supplier_name || 'General Supplier',
          order_date: purchaseDate.toISOString(),
          status: 'ORDERED'
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Create groceries for each item with auto-calculated expiry
      const groceriesToInsert = orderBag.map(item => {
        const expiryDate = this.calculateExpiryDate(item.category, purchaseDate)
        
        return {
          restaurant_id: restaurant.id,
          name: item.name,
          category: item.category,
          unit: item.unit,
          procured_date: purchaseDate.toISOString().split('T')[0],
          expiry_date: expiryDate.toISOString().split('T')[0],
          initial_amt: item.quantity,
          current_amt: item.quantity,
          cost_per_unit: item.cost_per_unit,
          supplier_name: item.supplier_name,
          is_perishable: this.isPerishable(item.category),
          shelf_life_days: PRODUCT_SHELF_LIFE[item.category] || PRODUCT_SHELF_LIFE.OTHER,
          temperature_storage: this.getTemperatureStorage(item.category)
        }
      })

      const { error: groceriesError } = await supabase
        .from('groceries')
        .insert(groceriesToInsert)

      if (groceriesError) throw groceriesError

      return true
    } catch (error) {
      console.error('Error submitting procurement order:', error)
      return false
    }
  }

  // Get temperature storage recommendation based on category
  private getTemperatureStorage(category: ProductCategory): 'FROZEN' | 'REFRIGERATED' | 'ROOM_TEMP' {
    const frozenItems = ['FROZEN_MEAT', 'FROZEN_FISH']
    const refrigeratedItems = [
      'FRESH_MEAT', 'FRESH_FISH', 'MILK', 'CHEESE', 'YOGURT', 'EGGS', 
      'BUTTER', 'CREAM', 'FRESH_VEGETABLES', 'LEAFY_GREENS', 'TOMATOES',
      'FRESH_FRUITS', 'BANANAS', 'CITRUS_FRUITS', 'APPLES', 'BREAD', 'JUICE'
    ]

    if (frozenItems.includes(category)) return 'FROZEN'
    if (refrigeratedItems.includes(category)) return 'REFRIGERATED'
    return 'ROOM_TEMP'
  }

  // Get suggested categories for common items
  getSuggestedCategory(itemName: string): ProductCategory {
    const name = itemName.toLowerCase()
    
    // Meat & Fish
    if (name.includes('chicken') || name.includes('mutton') || name.includes('beef')) {
      return name.includes('frozen') ? 'FROZEN_MEAT' : 'FRESH_MEAT'
    }
    if (name.includes('fish') || name.includes('prawn') || name.includes('shrimp')) {
      return name.includes('frozen') ? 'FROZEN_FISH' : 'FRESH_FISH'
    }
    
    // Dairy
    if (name.includes('milk')) return 'MILK'
    if (name.includes('cheese')) return 'CHEESE'
    if (name.includes('yogurt') || name.includes('curd')) return 'YOGURT'
    if (name.includes('egg')) return 'EGGS'
    if (name.includes('butter')) return 'BUTTER'
    if (name.includes('cream')) return 'CREAM'
    
    // Vegetables
    if (name.includes('tomato')) return 'TOMATOES'
    if (name.includes('onion')) return 'ONIONS'
    if (name.includes('potato')) return 'POTATOES'
    if (name.includes('spinach') || name.includes('lettuce') || name.includes('cabbage')) {
      return 'LEAFY_GREENS'
    }
    if (name.includes('carrot') || name.includes('beetroot')) return 'ROOT_VEGETABLES'
    if (name.includes('vegetable')) return 'FRESH_VEGETABLES'
    
    // Fruits
    if (name.includes('banana')) return 'BANANAS'
    if (name.includes('apple')) return 'APPLES'
    if (name.includes('orange') || name.includes('lemon') || name.includes('lime')) {
      return 'CITRUS_FRUITS'
    }
    if (name.includes('fruit')) return 'FRESH_FRUITS'
    
    // Grains & Staples
    if (name.includes('rice')) return 'RICE'
    if (name.includes('wheat') || name.includes('flour')) return 'WHEAT_FLOUR'
    if (name.includes('dal') || name.includes('pulse') || name.includes('lentil')) return 'PULSES'
    if (name.includes('sugar')) return 'SUGAR'
    if (name.includes('salt')) return 'SALT'
    if (name.includes('oil')) return 'OIL'
    
    // Spices
    if (name.includes('spice')) return 'WHOLE_SPICES'
    if (name.includes('chili') || name.includes('chilli')) return 'CHILI_POWDER'
    if (name.includes('garam masala')) return 'GARAM_MASALA'
    if (name.includes('turmeric')) return 'TURMERIC'
    
    // Beverages
    if (name.includes('tea')) return 'TEA'
    if (name.includes('coffee')) return 'COFFEE'
    if (name.includes('juice')) return 'JUICE'
    if (name.includes('soda') || name.includes('cola')) return 'SODA'
    
    // Other
    if (name.includes('bread')) return 'BREAD'
    if (name.includes('pasta') || name.includes('noodle')) return 'PASTA'
    if (name.includes('nut')) return 'NUTS'
    if (name.includes('dried')) return 'DRIED_FRUITS'
    
    return 'OTHER'
  }

  // Get shelf life info for display
  getShelfLifeInfo(category: ProductCategory): { days: number; description: string } {
    const days = PRODUCT_SHELF_LIFE[category] || PRODUCT_SHELF_LIFE.OTHER
    
    if (days >= 365) {
      const years = Math.floor(days / 365)
      return { days, description: `${years} year${years > 1 ? 's' : ''}` }
    } else if (days >= 30) {
      const months = Math.floor(days / 30)
      return { days, description: `${months} month${months > 1 ? 's' : ''}` }
    } else {
      return { days, description: `${days} day${days > 1 ? 's' : ''}` }
    }
  }

  // Get all available categories for dropdown
  getAvailableCategories(): { value: ProductCategory; label: string; shelfLife: string }[] {
    return Object.entries(PRODUCT_SHELF_LIFE).map(([category, days]) => {
      const info = this.getShelfLifeInfo(category as ProductCategory)
      return {
        value: category as ProductCategory,
        label: category.replace(/_/g, ' '),
        shelfLife: info.description
      }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }
}

export const procurementService = new ProcurementService() 