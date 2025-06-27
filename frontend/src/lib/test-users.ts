// Test Users for RestMan System
// These users are for testing multi-user scenarios and role-based access

export interface TestUser {
  id: string
  name: string
  phone: string
  role: 'owner' | 'manager' | 'chef' | 'waiter'
  restaurant_id: string
  is_active: boolean
  created_at: string
  last_login?: string
  mobile: string
  email: string
  restaurantId: string
}

export const testUsers: TestUser[] = [
  // Owner - Full system access
  {
    id: 'owner-001',
    name: 'Restaurant Owner',
    phone: '+1234567890',
    role: 'owner',
    restaurant_id: 'rest-001',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    mobile: '+1234567890',
    email: 'owner@restaurant.com',
    restaurantId: 'rest-001'
  },

  // Manager - Operations management
  {
    id: 'manager-001',
    name: 'Kitchen Manager',
    phone: '+1234567891',
    role: 'manager',
    restaurant_id: 'rest-001',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    mobile: '+1234567891',
    email: 'manager@restaurant.com',
    restaurantId: 'rest-001'
  },

  // Chef - Kitchen operations
  {
    id: 'chef-001',
    name: 'Head Chef',
    phone: '+1234567892',
    role: 'chef',
    restaurant_id: 'rest-001',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    mobile: '+1234567892',
    email: 'chef@restaurant.com',
    restaurantId: 'rest-001'
  },

  // Waiter 1 - Front of house
  {
    id: 'waiter-001',
    name: 'Waiter John',
    phone: '+1234567893',
    role: 'waiter',
    restaurant_id: 'rest-001',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    mobile: '+1234567893',
    email: 'waiter1@restaurant.com',
    restaurantId: 'rest-001'
  },

  // Waiter 2 - Front of house (for testing table conflicts)
  {
    id: 'waiter-002',
    name: 'Waiter Sarah',
    phone: '+1234567894',
    role: 'waiter',
    restaurant_id: 'rest-001',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    mobile: '+1234567894',
    email: 'waiter2@restaurant.com',
    restaurantId: 'rest-001'
  }
]

// Test restaurant data
export const testRestaurant = {
  id: 'rest-001',
  name: 'Test Restaurant',
  address: '123 Test Street, Test City, TC 12345',
  phone: '+1234567890',
  email: 'test@restaurant.com',
  cuisine_type: 'Multi-Cuisine',
  owner_id: 'owner-001',
  created_at: '2024-01-01T00:00:00Z'
}

// Test menu items
export const testMenuItems = [
  // Indian Cuisine
  {
    id: 'menu-001',
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken',
    category: 'MAIN_COURSE',
    price: 18.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-002',
    name: 'Chicken Biryani',
    description: 'Fragrant rice dish with spices and chicken',
    category: 'MAIN_COURSE',
    price: 16.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-003',
    name: 'Dal Makhani',
    description: 'Creamy black lentils slow-cooked overnight',
    category: 'MAIN_COURSE',
    price: 12.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-004',
    name: 'Naan Bread',
    description: 'Soft leavened flatbread',
    category: 'APPETIZER',
    price: 3.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-005',
    name: 'Gulab Jamun',
    description: 'Sweet milk solids in sugar syrup',
    category: 'DESSERT',
    price: 6.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  // Thai Cuisine
  {
    id: 'menu-006',
    name: 'Pad Thai',
    description: 'Stir-fried rice noodles with eggs, tofu, and peanuts',
    category: 'MAIN_COURSE',
    price: 15.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-007',
    name: 'Green Curry',
    description: 'Spicy coconut curry with vegetables and choice of protein',
    category: 'MAIN_COURSE',
    price: 17.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-008',
    name: 'Tom Yum Soup',
    description: 'Hot and sour soup with lemongrass and lime',
    category: 'APPETIZER',
    price: 8.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-009',
    name: 'Mango Sticky Rice',
    description: 'Sweet sticky rice with fresh mango',
    category: 'DESSERT',
    price: 7.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  // Italian Cuisine
  {
    id: 'menu-010',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    category: 'MAIN_COURSE',
    price: 16.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-011',
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with eggs, cheese, and pancetta',
    category: 'MAIN_COURSE',
    price: 18.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-012',
    name: 'Bruschetta',
    description: 'Toasted bread topped with tomatoes and herbs',
    category: 'APPETIZER',
    price: 6.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-013',
    name: 'Tiramisu',
    description: 'Coffee-flavored Italian dessert',
    category: 'DESSERT',
    price: 8.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  // Mexican Cuisine
  {
    id: 'menu-014',
    name: 'Chicken Tacos',
    description: 'Soft corn tortillas with grilled chicken and salsa',
    category: 'MAIN_COURSE',
    price: 13.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-015',
    name: 'Beef Burrito',
    description: 'Large flour tortilla filled with beef, rice, and beans',
    category: 'MAIN_COURSE',
    price: 14.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-016',
    name: 'Guacamole & Chips',
    description: 'Fresh avocado dip with crispy tortilla chips',
    category: 'APPETIZER',
    price: 7.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-017',
    name: 'Churros',
    description: 'Crispy fried dough with cinnamon sugar',
    category: 'DESSERT',
    price: 6.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  // American Cuisine
  {
    id: 'menu-018',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheese, lettuce, and tomato',
    category: 'MAIN_COURSE',
    price: 15.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-019',
    name: 'BBQ Ribs',
    description: 'Slow-cooked ribs with tangy barbecue sauce',
    category: 'MAIN_COURSE',
    price: 22.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-020',
    name: 'Buffalo Wings',
    description: 'Crispy chicken wings with hot sauce',
    category: 'APPETIZER',
    price: 11.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-021',
    name: 'Apple Pie',
    description: 'Classic American dessert with vanilla ice cream',
    category: 'DESSERT',
    price: 7.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  // Chinese Cuisine
  {
    id: 'menu-022',
    name: 'Kung Pao Chicken',
    description: 'Spicy stir-fried chicken with peanuts and vegetables',
    category: 'MAIN_COURSE',
    price: 16.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-023',
    name: 'Sweet & Sour Pork',
    description: 'Crispy pork in tangy sweet and sour sauce',
    category: 'MAIN_COURSE',
    price: 17.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-024',
    name: 'Spring Rolls',
    description: 'Crispy vegetable rolls with sweet chili sauce',
    category: 'APPETIZER',
    price: 5.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-025',
    name: 'Fortune Cookies',
    description: 'Crispy cookies with fortune messages',
    category: 'DESSERT',
    price: 3.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  // Beverages
  {
    id: 'menu-026',
    name: 'Masala Chai',
    description: 'Spiced Indian tea with milk',
    category: 'BEVERAGE',
    price: 3.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-027',
    name: 'Thai Iced Tea',
    description: 'Sweetened tea with condensed milk',
    category: 'BEVERAGE',
    price: 4.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-028',
    name: 'Italian Soda',
    description: 'Sparkling water with flavored syrup',
    category: 'BEVERAGE',
    price: 4.49,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-029',
    name: 'Horchata',
    description: 'Mexican rice drink with cinnamon',
    category: 'BEVERAGE',
    price: 4.99,
    is_available: true,
    restaurant_id: 'rest-001'
  },
  {
    id: 'menu-030',
    name: 'Lemonade',
    description: 'Fresh squeezed lemonade',
    category: 'BEVERAGE',
    price: 3.99,
    is_available: true,
    restaurant_id: 'rest-001'
  }
]

// Test inventory items
export const testInventoryItems = [
  {
    id: 'inv-001',
    name: 'Chicken Breast',
    category: 'MEAT',
    current_stock: 15.5,
    unit: 'kg',
    min_stock: 10,
    cost_per_unit: 8.50,
    supplier: 'Fresh Meats Co.',
    restaurant_id: 'rest-001'
  },
  {
    id: 'inv-002',
    name: 'Basmati Rice',
    category: 'GRAINS',
    current_stock: 25.0,
    unit: 'kg',
    min_stock: 20,
    cost_per_unit: 3.25,
    supplier: 'Rice Suppliers Inc.',
    restaurant_id: 'rest-001'
  },
  {
    id: 'inv-003',
    name: 'Tomatoes',
    category: 'VEGETABLES',
    current_stock: 8.0,
    unit: 'kg',
    min_stock: 5,
    cost_per_unit: 2.50,
    supplier: 'Fresh Produce Co.',
    restaurant_id: 'rest-001'
  },
  {
    id: 'inv-004',
    name: 'Onions',
    category: 'VEGETABLES',
    current_stock: 12.0,
    unit: 'kg',
    min_stock: 8,
    cost_per_unit: 1.75,
    supplier: 'Fresh Produce Co.',
    restaurant_id: 'rest-001'
  },
  {
    id: 'inv-005',
    name: 'Cream',
    category: 'DAIRY',
    current_stock: 5.0,
    unit: 'L',
    min_stock: 3,
    cost_per_unit: 4.50,
    supplier: 'Dairy Farm Co.',
    restaurant_id: 'rest-001'
  }
]

// Test tables for waiter testing
export const testTables = [
  { id: 'table-01', number: 'T01', seats: 2, status: 'available' },
  { id: 'table-02', number: 'T02', seats: 4, status: 'available' },
  { id: 'table-03', number: 'T03', seats: 6, status: 'available' },
  { id: 'table-04', number: 'T04', seats: 4, status: 'available' },
  { id: 'table-05', number: 'T05', seats: 8, status: 'available' },
  { id: 'table-06', number: 'T06', seats: 2, status: 'available' },
  { id: 'table-07', number: 'T07', seats: 4, status: 'available' },
  { id: 'table-08', number: 'T08', seats: 6, status: 'available' }
]

// Helper function to get test user by phone
export function getTestUserByPhone(phone: string): TestUser | undefined {
  return testUsers.find(user => user.phone === phone)
}

// Helper function to get test user by role
export function getTestUsersByRole(role: 'owner' | 'manager' | 'chef' | 'waiter'): TestUser[] {
  return testUsers.filter(user => user.role === role)
}

// Helper function to simulate login
export function simulateTestLogin(phone: string): TestUser | null {
  const user = getTestUserByPhone(phone)
  if (user) {
    // Update last login
    user.last_login = new Date().toISOString()
    return user
  }
  return null
}

// Test scenarios for multi-user testing
export const testScenarios = {
  // Test waiter table allocation conflicts
  waiterTableConflict: {
    description: 'Test if waiter1 allocates table, waiter2 sees it as occupied',
    steps: [
      'Login as Waiter John (+1234567893)',
      'Allocate Table T01 to a customer',
      'Login as Waiter Sarah (+1234567894)',
      'Verify Table T01 shows as occupied'
    ]
  },

  // Test chef receiving waiter orders
  chefOrderReceipt: {
    description: 'Test if chef receives orders from specific waiters/tables',
    steps: [
      'Login as Waiter John (+1234567893)',
      'Place order for Table T01',
      'Login as Chef (+1234567892)',
      'Verify order shows with waiter and table info'
    ]
  },

  // Test role-based access
  roleAccessTest: {
    description: 'Test financial data access restrictions',
    steps: [
      'Login as Chef (+1234567892)',
      'Verify no profit margins or costs shown',
      'Login as Manager (+1234567891)',
      'Verify profit margins and costs are visible',
      'Login as Owner (+1234567890)',
      'Verify full financial access'
    ]
  }
}

// Demo mode configuration
export const demoModeConfig = {
  enabled: true,
  demoOTP: '123456',
  testUsers: testUsers,
  autoLogin: false, // Set to true to auto-login with test users
  defaultUser: 'owner-001'
} 