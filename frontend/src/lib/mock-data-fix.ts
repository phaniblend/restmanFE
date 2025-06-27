// Centralized Mock Data Exports for RestMan
// This fixes any import/export issues with mock data

export const mockUsers = [
  {
    id: '1',
    email: 'owner@restaurant.com',
    role: 'owner',
    name: 'Restaurant Owner',
    phone: '+91-9876543210'
  },
  {
    id: '2', 
    email: 'manager@restaurant.com',
    role: 'manager',
    name: 'Kitchen Manager',
    phone: '+91-9876543211'
  },
  {
    id: '3',
    email: 'chef@restaurant.com', 
    role: 'chef',
    name: 'Head Chef',
    phone: '+91-9876543212'
  }
]

export const mockInventory = [
  {
    id: '1',
    name: 'Basmati Rice',
    category: 'grains',
    current_stock: 25,
    unit: 'kg',
    cost_per_unit: 120,
    expiry_date: '2024-07-15',
    supplier: 'Local Supplier',
    last_updated: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Chicken Breast',
    category: 'meat',
    current_stock: 15,
    unit: 'kg', 
    cost_per_unit: 280,
    expiry_date: '2024-06-20',
    supplier: 'Fresh Meat Co',
    last_updated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Tomatoes',
    category: 'vegetables',
    current_stock: 8,
    unit: 'kg',
    cost_per_unit: 40,
    expiry_date: '2024-06-18',
    supplier: 'Veggie Market',
    last_updated: new Date().toISOString()
  }
]

export const mockRecipes = [
  {
    id: '1',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with spiced chicken',
    ingredients: [
      { ingredient_id: '1', quantity: 0.5, unit: 'kg' },
      { ingredient_id: '2', quantity: 0.3, unit: 'kg' }
    ],
    prep_time: 45,
    cook_time: 60,
    servings: 4,
    cost_per_serving: 85,
    category: 'main_course'
  },
  {
    id: '2',
    name: 'Tomato Curry',
    description: 'Rich and flavorful tomato-based curry',
    ingredients: [
      { ingredient_id: '3', quantity: 1, unit: 'kg' }
    ],
    prep_time: 15,
    cook_time: 30,
    servings: 6,
    cost_per_serving: 25,
    category: 'curry'
  }
]

export const mockAlerts = [
  {
    id: '1',
    type: 'STALE_RISK',
    title: 'Chicken Expiring Soon',
    message: 'Chicken Breast expires in 2 days. Consider using in today\'s specials.',
    priority: 'high',
    created_at: new Date().toISOString(),
    resolved: false,
    affected_items: ['2']
  },
  {
    id: '2',
    type: 'LOW_STOCK',
    title: 'Low Stock Alert',
    message: 'Tomatoes running low. Current stock: 8kg',
    priority: 'medium',
    created_at: new Date().toISOString(),
    resolved: false,
    affected_items: ['3']
  }
]

export const mockBatches = [
  {
    id: '1',
    recipe_id: '1',
    quantity_made: 20,
    date_prepared: new Date().toISOString(),
    chef_id: '3',
    actual_cost: 340,
    estimated_cost: 320,
    yield_variance: 6.25,
    status: 'completed'
  }
]

// Export everything as a single object for compatibility
export const mockData = {
  users: mockUsers,
  inventory: mockInventory,
  recipes: mockRecipes,
  alerts: mockAlerts,
  batches: mockBatches
}

// Default export for backward compatibility
export default mockData

// Named exports that might be expected
export const mockMockups = mockData // Fix for the specific error mentioned
export const mockServices = mockData
export const apiData = mockData 