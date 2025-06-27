export interface User {
  id: string
  name: string
  mobile: string
  email?: string
  role: 'owner' | 'manager' | 'chef' | 'waiter'
  isActive?: boolean
  restaurantId?: string
}

export interface RestaurantSetup {
  restaurantData: {
    name: string
    address: string
    phone: string
    email: string
    cuisines: string[]
    ownerName: string
  }
  users: User[]
  setupCompleted: boolean
  setupDate: string
}

// Mock current user - in real app, this would come from authentication
export const getCurrentUser = (): User | null => {
  // Check localStorage for current user
  const userStr = localStorage.getItem('currentUser')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } else {
    localStorage.removeItem('currentUser')
  }
}

// Check if user has permission for specific features
export const hasPermission = (user: User | null, feature: string): boolean => {
  if (!user) return false
  
  const permissions = {
    owner: [
      // Business oversight
      'daily_business_snapshot',
      'weekly_business_reports',
      'real_time_theft_alerts',
      'approve_big_purchases',
      'multi_branch_comparison',
      'compliance_hygiene_logs',
      'revenue_analytics',
      'wastage_percentage_alerts',
      'remote_approvals',
      'manage_users',
      'system_settings'
    ],
    manager: [
      // Operations management
      'procurement_usage_dashboard',
      'approve_stock_requisitions',
      'deny_stock_requisitions',
      'audit_logs_monitoring',
      'investigate_abnormal_activity',
      'wastage_reports_download',
      'staff_leaderboard',
      'supplier_ratings',
      'inventory_oversight',
      'cost_analysis',
      'vendor_management'
    ],
    chef: [
      // Kitchen operations
      'start_shift_dashboard',
      'live_stock_warnings',
      'wastage_logging',
      'burnt_overcooked_tracking',
      'returned_items_log',
      'calculate_possible_orders',
      'signature_dish_planning',
      'one_tap_manager_request',
      'low_items_alerts',
      'restman_surplus_suggestions',
      'todays_special_restman',
      'kitchen_efficiency_tracking'
    ],
    waiter: [
      // Front-of-house operations
      'table_management',
      'order_taking',
      'menu_knowledge',
      'customer_service',
      'bill_generation',
      'payment_processing',
      'table_status_updates',
      'special_requests',
      'allergen_information',
      'order_status_tracking'
    ]
  }
  
  return permissions[user.role].includes(feature)
}

// Get alerts based on user role
export const getUserAlerts = (user: User | null): string[] => {
  if (!user) return []
  
  const alerts = {
    owner: [
      // Business snapshot alerts
      '📊 Daily Revenue: $52,300 (Target: $50,000) ✅',
      '⚠️ Wastage Alert: 8.5% today (Target: <5%)',
      '🚨 Possible Theft: 2kg chicken missing from inventory',
      '💰 Big Purchase Request: $25,000 for new equipment',
      '📈 Branch Comparison: Main branch outperforming by 15%',
      '🧹 Hygiene Reminder: Deep cleaning due tomorrow',
      '📱 Mobile Alert: Unusual activity detected at 2:30 AM',
      '💡 Cost Optimization: Switch to bulk rice supplier saves $5,000/month'
    ],
    manager: [
      // Operations management alerts
      '📋 Procurement vs Usage: Rice usage 120% of projected',
      '✋ Stock Requisition: Chef requesting 5kg chicken (Pending approval)',
      '🔍 Audit Alert: Unusual wastage pattern detected - investigate',
      '📄 Wastage Report: Last month data ready for download',
      '🏆 Staff Performance: Chef Raj leading efficiency (94%)',
      '⭐ Supplier Rating: Vegetable vendor dropped to 3.2/5',
      '📊 Cost Analysis: Food cost increased 3% this week',
      '🚛 Vendor Issue: Late delivery from spice supplier'
    ],
    chef: [
      // Kitchen operations alerts
      '🔄 Shift Started: Live stock dashboard updated',
      '⚠️ Stock Warning: Basmati rice - 2kg remaining (reorder needed)',
      '🗑️ Wastage Log: 3 burnt rotis, 1 returned biryani to record',
      '🍛 Signature Dish: Can make 12 more Butter Chicken with current stock',
      '📱 Quick Request: Tap to request low stock items from manager',
      '🤖 RestMan Suggestion: Make Veg Pulao with surplus vegetables',
      '⭐ Today\'s Special: RestMan recommends Chicken Curry (high margin)',
      '📈 Kitchen Efficiency: 91% today (Great job!)'
    ],
    waiter: [
      // Front-of-house alerts
      '🍽️ Table 5: Ready for order taking',
      '⏰ Table 12: Waiting 15+ minutes for food',
      '💳 Table 8: Payment pending - check on them',
      '🌟 VIP Guest: Table 3 - provide extra attention',
      '🍜 Special Request: Table 7 - no onions in curry',
      '⚠️ Allergy Alert: Table 2 - peanut allergy mentioned',
      '📋 Order Ready: Table 9 - collect from kitchen',
      '🔔 Customer Feedback: Table 15 wants to speak with manager'
    ]
  }
  
  return alerts[user.role] || []
}

// Get filtered navigation items based on role
export const getNavigationItems = (user: User | null) => {
  if (!user) return []
  
  const baseItems = [
    { name: 'Dashboard', href: '/', icon: 'Home' }
  ]

  switch (user.role) {
    case 'owner':
      return [
        ...baseItems,
        { name: 'Menu & Pricing', href: '/menu', icon: 'ChefHat' },
        { name: 'Inventory', href: '/inventory', icon: 'Package' },
        { name: 'Recipes', href: '/recipes', icon: 'ChefHat' },
        { name: 'Staff', href: '/staff', icon: 'User' },
        { name: 'Analytics', href: '/analytics', icon: 'Settings' },
        { name: 'AI Suggestions', href: '/ai-suggestions', icon: 'Sparkles' },
        { name: 'Customizer', href: '/customizer', icon: 'Crown' },
        { name: 'Premium Demo', href: '/demo-premium', icon: 'Star' },
        { name: 'Admin Customizations', href: '/admin/customizations', icon: 'Settings' }
      ]
    
    case 'manager':
      return [
        ...baseItems,
        { name: 'Menu & Pricing', href: '/menu', icon: 'ChefHat' },
        { name: 'Inventory', href: '/inventory', icon: 'Package' },
        { name: 'Recipes', href: '/recipes', icon: 'ChefHat' },
        { name: 'Reports', href: '/reports', icon: 'Settings' },
        { name: 'AI Suggestions', href: '/ai-suggestions', icon: 'Sparkles' },
        { name: 'Customizer', href: '/customizer', icon: 'Crown' },
        { name: 'Premium Demo', href: '/demo-premium', icon: 'Star' },
        { name: 'Admin Customizations', href: '/admin/customizations', icon: 'Settings' }
      ]
    
    case 'chef':
      return [
        ...baseItems,
        { name: 'Recipes', href: '/recipes', icon: 'ChefHat' },
        { name: 'Inventory', href: '/inventory', icon: 'Package' },
        { name: 'Orders', href: '/chef/orders', icon: 'Settings' },
        { name: 'AI Suggestions', href: '/ai-suggestions', icon: 'Sparkles' },
        { name: 'Premium Demo', href: '/demo-premium', icon: 'Star' }
      ]
    
    case 'waiter':
      return [
        ...baseItems,
        { name: 'Tables', href: '/waiter/tables', icon: 'Settings' },
        { name: 'Menu', href: '/menu', icon: 'ChefHat' },
        { name: 'Orders', href: '/orders', icon: 'Package' },
        { name: 'Premium Demo', href: '/demo-premium', icon: 'Star' }
      ]
    
    default:
      return baseItems
  }
} 