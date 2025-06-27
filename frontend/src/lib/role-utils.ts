import { Database } from './database.types'
import { differenceInDays, format } from 'date-fns'

type UserRole = 'owner' | 'manager' | 'chef' | 'waiter'
type User = Database['public']['Tables']['users']['Row']

// Define permissions for each role
const ownerPermissions = {
  viewFinancials: true,
  editMenu: true,
  manageStaff: true,
  viewAllData: true,
  exportData: true,
  deleteRecords: true,
  modifyPricing: true,
  viewCostAnalysis: true,
  approveRecipes: true,
  manageIntegrations: true,
  accessAIInsights: true,
  modifyRecipes: true,
  viewCosts: true,
  accessRestManInsights: true,
  viewProfitMargins: true,
  viewRevenueData: true,
  manageUsers: true
} as const

const managerPermissions = {
  viewFinancials: true,
  editMenu: true,
  manageStaff: false,
  viewAllData: true,
  exportData: true,
  deleteRecords: false,
  modifyPricing: true,
  viewCostAnalysis: true,
  approveRecipes: true,
  manageIntegrations: true,
  accessAIInsights: true,
  modifyRecipes: false,
  viewCosts: true,
  accessRestManInsights: true,
  viewProfitMargins: true,
  viewRevenueData: true,
  manageUsers: false
} as const

const chefPermissions = {
  viewFinancials: false,
  editMenu: true,
  manageStaff: false,
  viewAllData: false,
  exportData: false,
  deleteRecords: false,
  modifyPricing: false,
  viewCostAnalysis: false,
  approveRecipes: true,
  manageIntegrations: false,
  accessAIInsights: true,
  modifyRecipes: true,
  viewCosts: false, // Chefs can't see costs
  accessRestManInsights: true,
  viewProfitMargins: false, // Chefs can't see profit margins
  viewRevenueData: false, // Chefs can't see revenue data
  manageUsers: false
} as const

const waiterPermissions = {
  viewFinancials: false,
  editMenu: false,
  manageStaff: false,
  viewAllData: false,
  exportData: false,
  deleteRecords: false,
  modifyPricing: false,
  viewCostAnalysis: false,
  approveRecipes: false,
  manageIntegrations: false,
  accessAIInsights: false,
  modifyRecipes: false,
  viewCosts: false,
  accessRestManInsights: false,
  viewProfitMargins: false,
  viewRevenueData: false,
  manageUsers: false,
  // Waiter-specific permissions
  enterOrders: true,
  viewMenuItems: true,
  manageTableOrders: true,
  viewOrderStatus: true,
  processPayments: true,
  updateOrderStatus: true,
  showCostAnalysis: false,
  showRestManSuggestions: false,
  showCompliance: false
} as const

// Define all possible permissions as a union type
type AllPermissions = 
  | keyof typeof ownerPermissions
  | keyof typeof managerPermissions
  | keyof typeof chefPermissions
  | keyof typeof waiterPermissions

export const rolePermissions = {
  owner: ownerPermissions,
  manager: managerPermissions,
  chef: chefPermissions,
  waiter: waiterPermissions
} as const

export const alertRouting = {
  STALE_RISK: {
    notify_owner: false,
    notify_manager: true,
    notify_chef: true,
    priority: 'HIGH'
  },
  YIELD_VARIANCE: {
    notify_owner: true, // Financial impact
    notify_manager: true,
    notify_chef: true,
    priority: 'CRITICAL'
  },
  LOW_STOCK: {
    notify_owner: false,
    notify_manager: true,
    notify_chef: false,
    priority: 'MEDIUM'
  },
  RECIPE_MODIFICATION: {
    notify_owner: true, // Need to know about changes
    notify_manager: true,
    notify_chef: false,
    priority: 'INFO'
  },
  COST_VARIANCE: {
    notify_owner: true,
    notify_manager: true,
    notify_chef: false,
    priority: 'HIGH'
  },
  SPOILAGE_ALERT: {
    notify_owner: true,
    notify_manager: true,
    notify_chef: true,
    priority: 'CRITICAL'
  },
  SECURITY_ANOMALY: {
    notify_owner: true,
    notify_manager: true,
    notify_chef: true,
    priority: 'CRITICAL'
  }
}

// Check if user has specific permission
export function hasPermission(user: User | null, permission: AllPermissions): boolean {
  if (!user) return false
  const rolePerms = rolePermissions[user.role as UserRole]
  if (!rolePerms) return false
  const permValue = (rolePerms as any)[permission]
  return typeof permValue === 'boolean' ? permValue : Boolean(permValue)
}

// Get role-specific dashboard configuration
export function getDashboardConfig(userRole: UserRole) {
  const baseConfig = {
    showQuickStats: true,
    showRecentActivity: true,
    showCriticalAlerts: true
  }

  const roleSpecificConfig = {
    owner: {
      ...baseConfig,
      showFinancialMetrics: true,
      showProfitAnalysis: true,
      showStaffPerformance: true,
      showStrategicInsights: true,
      alertTypes: ['ALL']
    },
    manager: {
      ...baseConfig,
      showOperationalMetrics: true,
      showInventoryOverview: true,
      showStaffActivity: true,
      showProcurementAlerts: true,
      alertTypes: ['STALE_RISK', 'YIELD_VARIANCE', 'LOW_STOCK', 'RECIPE_MODIFICATION']
    },
    chef: {
      ...baseConfig,
      showRecipePerformance: true,
      showIngredientStatus: true,
      showBatchHistory: true,
      showAISuggestions: true,
      alertTypes: ['STALE_RISK', 'YIELD_VARIANCE']
    },
    waiter: {
      ...baseConfig,
      showTableStatus: true,
      showActiveOrders: true,
      showMenuAvailability: true,
      showCustomerRequests: true,
      alertTypes: ['TABLE_STATUS', 'ORDER_READY', 'CUSTOMER_REQUEST']
    }
  }

  return roleSpecificConfig[userRole]
}

// Get role-specific menu items
export function getMenuItems(userRole: UserRole) {
  const baseItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3', path: '/' }
  ]

  const roleSpecificItems = {
    owner: [
      ...baseItems,
      { id: 'menu', label: 'Menu & Pricing', icon: 'DollarSign', path: '/menu' },
      { id: 'analytics', label: 'Analytics', icon: 'TrendingUp', path: '/analytics' },
      { id: 'financials', label: 'Financials', icon: 'DollarSign', path: '/financials' },
      { id: 'inventory', label: 'Inventory', icon: 'Package', path: '/inventory' },
      { id: 'recipes', label: 'Recipes', icon: 'ChefHat', path: '/recipes' },
      { id: 'staff', label: 'Staff', icon: 'Users', path: '/staff' },
      { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
      { id: 'restman-suggestions', label: 'RestMan Suggestions', icon: 'Brain', path: '/restman-suggestions' },
      { id: 'users', label: 'Users', icon: 'Users', path: '/users' }
    ],
    manager: [
      ...baseItems,
      { id: 'menu', label: 'Menu & Pricing', icon: 'DollarSign', path: '/menu' },
      { id: 'inventory', label: 'Inventory', icon: 'Package', path: '/inventory' },
      { id: 'recipes', label: 'Recipes', icon: 'ChefHat', path: '/recipes' },
      { id: 'planning', label: 'Planning', icon: 'Calendar', path: '/planning' },
      { id: 'alerts', label: 'Alerts', icon: 'AlertTriangle', path: '/alerts' },
      { id: 'reports', label: 'Reports', icon: 'FileText', path: '/reports' },
      { id: 'restman-suggestions', label: 'RestMan Suggestions', icon: 'Brain', path: '/restman-suggestions' },
      { id: 'users', label: 'Users', icon: 'Users', path: '/users' }
    ],
    chef: [
      ...baseItems,
      { id: 'recipes', label: 'My Recipes', icon: 'ChefHat', path: '/recipes' },
      { id: 'batches', label: 'Batch Tracking', icon: 'Clipboard', path: '/batches' },
      { id: 'ai-suggestions', label: 'AI Suggestions', icon: 'Brain', path: '/ai-suggestions' },
      { id: 'ingredients', label: 'Ingredients', icon: 'Apple', path: '/ingredients' },
      { id: 'restman-suggestions', label: 'RestMan Suggestions', icon: 'Brain', path: '/restman-suggestions' },
      { id: 'users', label: 'Users', icon: 'Users', path: '/users' }
    ],
    waiter: [
      ...baseItems,
      { id: 'tables', label: 'Tables', icon: 'Grid3x3', path: '/waiter/tables' },
      { id: 'orders', label: 'Orders', icon: 'ClipboardList', path: '/waiter/orders' },
      { id: 'menu', label: 'Menu', icon: 'Book', path: '/waiter/menu' },
      { id: 'billing', label: 'Billing', icon: 'Receipt', path: '/waiter/billing' },
      { id: 'restman-suggestions', label: 'RestMan Suggestions', icon: 'Brain', path: '/restman-suggestions' },
      { id: 'users', label: 'Users', icon: 'Users', path: '/users' }
    ]
  }

  return roleSpecificItems[userRole]
}

// Filter alerts based on user role
export function filterAlertsForRole(alerts: any[], userRole: UserRole) {
  const config = getDashboardConfig(userRole)
  
  if (config.alertTypes.includes('ALL')) {
    return alerts
  }
  
  return alerts.filter(alert => 
    config.alertTypes.includes(alert.alert_type) ||
    config.alertTypes.includes(alert.type)
  )
}

// Generate role-specific notifications
export function generateRoleNotification(alertType: keyof typeof alertRouting, data: any, userRole: UserRole) {
  const routing = alertRouting[alertType]
  const shouldNotify = routing[`notify_${userRole}` as keyof typeof routing] as boolean
  
  if (!shouldNotify) return null

  const roleSpecificMessages = {
    owner: {
      YIELD_VARIANCE: `⚠️ Yield issue detected: ${data.recipe_name} - ${data.variance}% variance. Financial impact: $${data.estimated_loss}`,
      RECIPE_MODIFICATION: `📝 Chef ${data.chef_name} modified ${data.recipe_name}. Review changes for cost impact.`,
      COST_VARIANCE: `💰 Cost variance alert: ${data.item_name} - Budget exceeded by $${data.excess_cost}`,
      SPOILAGE_ALERT: `🗑️ Spoilage: ${data.item_name} - ${data.quantity}kg wasted. Value: ${data.cost}`,
      SECURITY_ANOMALY: `🔍 Security: Unusual activity detected with ${data.item_name}. ${data.details}`
    },
    manager: {
      STALE_RISK: `🚨 Urgent: ${data.item_name} (${data.quantity}kg) expires in ${data.days_left} days. Take action to prevent $${data.estimated_loss} loss.`,
      YIELD_VARIANCE: `⚠️ Kitchen efficiency alert: ${data.recipe_name} yield variance ${data.variance}%. Investigate with ${data.chef_name}.`,
      LOW_STOCK: `📦 Reorder needed: ${data.item_name} running low (${data.remaining}kg left). Expected to run out in ${data.days_until_empty} days.`,
      SECURITY_ANOMALY: `🔍 Security: Unusual activity detected with ${data.item_name}. ${data.details}`
    },
    chef: {
      STALE_RISK: `⏰ ${data.item_name} expiring soon! ${data.quantity}kg expires in ${data.days_left} days. Consider: ${data.menu_suggestions.join(', ')}`,
      YIELD_VARIANCE: `📊 Your ${data.recipe_name} batch: Expected ${data.expected}, got ${data.actual}. Please check recipe execution.`,
      RESTMAN_SUGGESTION: `🤖 RestMan suggestion: ${data.recipe_name} - ${data.suggestion}`,
      COST_VARIANCE: `💰 Cost variance alert: ${data.item_name} - Budget exceeded by $${data.excess_cost}`
    },
    waiter: {
      TABLE_STATUS: `🍽️ Table ${data.table_number}: ${data.status}`,
      ORDER_READY: `🔔 Order ready for table ${data.table_number}`,
      CUSTOMER_REQUEST: `📋 Customer at table ${data.table_number} needs assistance`,
      PAYMENT_PENDING: `💳 Payment pending for table ${data.table_number}`,
      SPOILAGE_ALERT: `🗑️ Spoilage: ${data.item_name} - ${data.quantity}kg wasted. Value: ${data.cost}`,
      SECURITY_ANOMALY: `🔍 Security: Unusual activity detected with ${data.item_name}. ${data.details}`
    }
  }

  const userMessages = roleSpecificMessages[userRole] || {}
  return (userMessages as any)[alertType] || null
}

// Check if user can modify specific recipe
export function canModifyRecipe(user: User | null, recipeData: any): boolean {
  if (!user) return false
  
  // Owner and Manager can modify any recipe
  if (['owner', 'manager'].includes(user.role)) return true
  
  // Chef can modify recipes they created or RestMan suggestions assigned to them
  if (user.role === 'chef') {
    return recipeData.created_by === user.id || 
           recipeData.last_modified_by === user.id ||
           recipeData.is_restman_generated
  }
  
  return false
}

// Get role-specific recipe actions
export function getRecipeActions(user: User | null, recipeData: any) {
  if (!user) return []
  
  const baseActions = ['view']
  
  if (canModifyRecipe(user, recipeData)) {
    baseActions.push('edit', 'duplicate')
  }
  
  const roleSpecificActions = {
    owner: [...baseActions, 'delete', 'archive', 'cost_analysis'],
    manager: [...baseActions, 'archive', 'performance_review'],
    chef: [...baseActions, 'customize_ingredients', 'add_notes', 'mark_favorite'],
    waiter: baseActions
  }
  
  return roleSpecificActions[user.role as UserRole] || baseActions
}

// Recipe modification tracking
export function trackRecipeModification(originalRecipe: any, modifiedRecipe: any, userId: string) {
  const changes = []
  
  // Track ingredient changes
  if (JSON.stringify(originalRecipe.ingredients) !== JSON.stringify(modifiedRecipe.ingredients)) {
    changes.push({
      type: 'INGREDIENT_CHANGE',
      field: 'ingredients',
      original: originalRecipe.ingredients,
      modified: modifiedRecipe.ingredients
    })
  }
  
  // Track quantity changes
  const originalQty = originalRecipe.total_quantity || 0
  const modifiedQty = modifiedRecipe.total_quantity || 0
  if (originalQty !== modifiedQty) {
    changes.push({
      type: 'QUANTITY_CHANGE',
      field: 'total_quantity',
      original: originalQty,
      modified: modifiedQty,
      variance_percentage: ((modifiedQty - originalQty) / originalQty * 100).toFixed(2)
    })
  }
  
  // Track process changes
  if (originalRecipe.instructions !== modifiedRecipe.instructions) {
    changes.push({
      type: 'PROCESS_CHANGE',
      field: 'instructions',
      original: originalRecipe.instructions,
      modified: modifiedRecipe.instructions
    })
  }
  
  return {
    modification_summary: changes,
    modified_by: userId,
    modification_timestamp: new Date().toISOString(),
    requires_notification: changes.length > 0
  }
}

// Get role-appropriate yield data
export function getYieldDataForRole(yieldData: any[], userRole: UserRole, userId: string) {
  switch (userRole) {
    case 'owner':
    case 'manager':
      // Can see all yield data
      return yieldData
      
    case 'chef':
      // Can only see their own batches
      return yieldData.filter(batch => batch.chef_id === userId)
      
    default:
      return []
  }
}

// Role-based alert prioritization
export function prioritizeAlertsForRole(alerts: any[], userRole: UserRole) {
  const priorityWeights = {
    owner: { COST_VARIANCE: 10, YIELD_VARIANCE: 8, RECIPE_MODIFICATION: 6, STALE_RISK: 4 },
    manager: { STALE_RISK: 10, YIELD_VARIANCE: 8, LOW_STOCK: 6, RECIPE_MODIFICATION: 4 },
    chef: { YIELD_VARIANCE: 10, STALE_RISK: 8, RESTMAN_SUGGESTION: 6 },
    waiter: { TABLE_STATUS: 10, ORDER_READY: 8, CUSTOMER_REQUEST: 6 }
  }
  
  const weights = priorityWeights[userRole] || {}
  
  return alerts.sort((a, b) => {
    const aWeight = (weights as any)[a.alert_type] || 0
    const bWeight = (weights as any)[b.alert_type] || 0
    return bWeight - aWeight
  })
} 