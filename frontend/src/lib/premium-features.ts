// Premium Features Management System
// This service manages feature flags and access control for premium customers

export interface PremiumFeature {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  isEnabled: boolean
  requiresApproval: boolean
  estimatedTime: string
}

export interface PremiumSubscription {
  id: string
  restaurantId: string
  features: string[] // Array of feature IDs
  status: 'active' | 'pending' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  totalCost: number
  customizations: CustomizationRequest[]
}

export interface CustomizationRequest {
  id: string
  restaurantId: string
  featureId: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed'
  description: string
  budget: number
  timeline: string
  createdAt: string
  updatedAt: string
  estimatedCost: number
  estimatedTime: string
}

// Available premium features
export const AVAILABLE_FEATURES: PremiumFeature[] = [
  {
    id: 'custom-branding',
    name: 'Custom Branding & Theming',
    description: 'Complete visual customization with your restaurant\'s brand colors, logos, and styling',
    category: 'Visual',
    basePrice: 299,
    isEnabled: true,
    requiresApproval: true,
    estimatedTime: '1-2 weeks'
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics Dashboard',
    description: 'Comprehensive reporting and analytics with custom metrics and insights',
    category: 'Analytics',
    basePrice: 499,
    isEnabled: true,
    requiresApproval: true,
    estimatedTime: '2-3 weeks'
  },
  {
    id: 'multi-location',
    name: 'Multi-Location Management',
    description: 'Manage multiple restaurant locations from a single dashboard',
    category: 'Operations',
    basePrice: 399,
    isEnabled: true,
    requiresApproval: true,
    estimatedTime: '3-4 weeks'
  },
  {
    id: 'custom-integrations',
    name: 'Custom Integrations',
    description: 'Integrate with your existing POS, accounting, or delivery systems',
    category: 'Integration',
    basePrice: 599,
    isEnabled: true,
    requiresApproval: true,
    estimatedTime: '2-4 weeks'
  },
  {
    id: 'advanced-security',
    name: 'Advanced Security Features',
    description: 'Enhanced security with custom access controls and compliance features',
    category: 'Security',
    basePrice: 399,
    isEnabled: true,
    requiresApproval: true,
    estimatedTime: '1-2 weeks'
  },
  {
    id: 'custom-workflows',
    name: 'Custom Workflows',
    description: 'Tailored business processes and workflow automation',
    category: 'Operations',
    basePrice: 449,
    isEnabled: true,
    requiresApproval: true,
    estimatedTime: '2-3 weeks'
  },
  {
    id: 'custom-reports',
    name: 'Custom Reports',
    description: 'Tailored reporting templates and automated report generation',
    category: 'Reporting',
    basePrice: 299,
    isEnabled: true,
    requiresApproval: true,
    estimatedTime: '1-2 weeks'
  },
  {
    id: 'ai-menu-suggestions',
    name: 'AI Menu Suggestions',
    description: 'Advanced AI-powered menu recommendations and optimization',
    category: 'AI',
    basePrice: 199,
    isEnabled: true,
    requiresApproval: false,
    estimatedTime: '1 week'
  },
  {
    id: 'advanced-inventory',
    name: 'Advanced Inventory Management',
    description: 'Advanced inventory tracking with predictive analytics',
    category: 'Inventory',
    basePrice: 349,
    isEnabled: true,
    requiresApproval: true,
    estimatedTime: '2-3 weeks'
  },
  {
    id: 'customer-loyalty',
    name: 'Customer Loyalty Program',
    description: 'Custom loyalty program with points, rewards, and customer tracking',
    category: 'Customer',
    basePrice: 249,
    isEnabled: true,
    requiresApproval: true,
    estimatedTime: '2-3 weeks'
  }
]

class PremiumFeaturesService {
  private subscriptions: PremiumSubscription[] = []
  private customizationRequests: CustomizationRequest[] = []

  constructor() {
    this.loadData()
  }

  private loadData() {
    // Load from localStorage
    const savedSubscriptions = localStorage.getItem('premiumSubscriptions')
    const savedRequests = localStorage.getItem('customizationRequests')
    
    if (savedSubscriptions) {
      this.subscriptions = JSON.parse(savedSubscriptions)
    }
    
    if (savedRequests) {
      this.customizationRequests = JSON.parse(savedRequests)
    }
  }

  private saveData() {
    localStorage.setItem('premiumSubscriptions', JSON.stringify(this.subscriptions))
    localStorage.setItem('customizationRequests', JSON.stringify(this.customizationRequests))
  }

  // Check if a restaurant has access to a specific feature
  hasFeatureAccess(restaurantId: string, featureId: string): boolean {
    const subscription = this.subscriptions.find(sub => 
      sub.restaurantId === restaurantId && 
      sub.status === 'active' &&
      sub.features.includes(featureId)
    )
    
    return !!subscription
  }

  // Get all features available to a restaurant
  getAvailableFeatures(restaurantId: string): PremiumFeature[] {
    const subscription = this.subscriptions.find(sub => 
      sub.restaurantId === restaurantId && 
      sub.status === 'active'
    )
    
    if (!subscription) {
      return []
    }
    
    return AVAILABLE_FEATURES.filter(feature => 
      subscription.features.includes(feature.id)
    )
  }

  // Get all premium features (for display)
  getAllFeatures(): PremiumFeature[] {
    return AVAILABLE_FEATURES
  }

  // Request a customization
  requestCustomization(
    restaurantId: string,
    featureId: string,
    description: string,
    budget: number,
    timeline: string
  ): CustomizationRequest {
    const feature = AVAILABLE_FEATURES.find(f => f.id === featureId)
    
    const request: CustomizationRequest = {
      id: `req-${Date.now()}`,
      restaurantId,
      featureId,
      status: 'pending',
      description,
      budget,
      timeline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedCost: feature?.basePrice || 0,
      estimatedTime: feature?.estimatedTime || '2-4 weeks'
    }
    
    this.customizationRequests.push(request)
    this.saveData()
    
    return request
  }

  // Get customization requests for a restaurant
  getCustomizationRequests(restaurantId: string): CustomizationRequest[] {
    return this.customizationRequests.filter(req => req.restaurantId === restaurantId)
  }

  // Update customization request status (admin function)
  updateCustomizationStatus(requestId: string, status: CustomizationRequest['status']): boolean {
    const request = this.customizationRequests.find(req => req.id === requestId)
    if (request) {
      request.status = status
      request.updatedAt = new Date().toISOString()
      this.saveData()
      return true
    }
    return false
  }

  // Subscribe to premium features
  subscribeToFeatures(
    restaurantId: string,
    featureIds: string[],
    totalCost: number
  ): PremiumSubscription {
    const subscription: PremiumSubscription = {
      id: `sub-${Date.now()}`,
      restaurantId,
      features: featureIds,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      totalCost,
      customizations: []
    }
    
    this.subscriptions.push(subscription)
    this.saveData()
    
    return subscription
  }

  // Get subscription for a restaurant
  getSubscription(restaurantId: string): PremiumSubscription | null {
    return this.subscriptions.find(sub => 
      sub.restaurantId === restaurantId && 
      sub.status === 'active'
    ) || null
  }

  // Cancel subscription
  cancelSubscription(restaurantId: string): boolean {
    const subscription = this.subscriptions.find(sub => 
      sub.restaurantId === restaurantId && 
      sub.status === 'active'
    )
    
    if (subscription) {
      subscription.status = 'cancelled'
      this.saveData()
      return true
    }
    
    return false
  }

  // Get feature by ID
  getFeatureById(featureId: string): PremiumFeature | null {
    return AVAILABLE_FEATURES.find(f => f.id === featureId) || null
  }

  // Check if feature requires approval
  requiresApproval(featureId: string): boolean {
    const feature = AVAILABLE_FEATURES.find(f => f.id === featureId)
    return feature?.requiresApproval || false
  }

  // Get all customization requests (admin function)
  getAllCustomizationRequests(): CustomizationRequest[] {
    return this.customizationRequests
  }

  // Get all subscriptions (admin function)
  getAllSubscriptions(): PremiumSubscription[] {
    return this.subscriptions
  }

  // Reset data (for testing)
  resetData() {
    this.subscriptions = []
    this.customizationRequests = []
    this.saveData()
  }
}

// Create singleton instance
export const premiumFeaturesService = new PremiumFeaturesService()

// Feature flag hooks and utilities
export const usePremiumFeature = (restaurantId: string, featureId: string): boolean => {
  return premiumFeaturesService.hasFeatureAccess(restaurantId, featureId)
}

export const getFeatureAccess = (restaurantId: string, featureId: string): boolean => {
  return premiumFeaturesService.hasFeatureAccess(restaurantId, featureId)
}

// Feature categories
export const FEATURE_CATEGORIES = [
  'Visual',
  'Analytics', 
  'Operations',
  'Integration',
  'Security',
  'Reporting',
  'AI',
  'Inventory',
  'Customer'
]

// Pricing tiers
export const PRICING_TIERS = {
  BASIC: {
    name: 'Basic',
    price: 0,
    features: ['ai-menu-suggestions']
  },
  PREMIUM: {
    name: 'Premium',
    price: 299,
    features: ['custom-branding', 'advanced-analytics', 'ai-menu-suggestions']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 999,
    features: AVAILABLE_FEATURES.map(f => f.id)
  }
} 