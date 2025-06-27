import { Database } from './database.types'
import { differenceInDays, format } from 'date-fns'

type Grocery = Database['public']['Tables']['groceries']['Row']
type BatchProduction = Database['public']['Tables']['batch_production']['Row']

// Perishable food categories and their characteristics
export const perishableCategories = {
  MEAT: { shelfLife: 3, alertThreshold: 0.7, urgencyMultiplier: 1.5 },
  FISH: { shelfLife: 2, alertThreshold: 0.8, urgencyMultiplier: 2.0 },
  DAIRY: { shelfLife: 7, alertThreshold: 0.6, urgencyMultiplier: 1.2 },
  VEGETABLES: { shelfLife: 5, alertThreshold: 0.7, urgencyMultiplier: 1.3 },
  FRUITS: { shelfLife: 4, alertThreshold: 0.8, urgencyMultiplier: 1.4 },
  GRAINS: { shelfLife: 365, alertThreshold: 0.2, urgencyMultiplier: 0.5 },
  SPICES: { shelfLife: 180, alertThreshold: 0.3, urgencyMultiplier: 0.7 },
  OTHER: { shelfLife: 7, alertThreshold: 0.6, urgencyMultiplier: 1.0 }
}

// Yield Variance Analysis
export const yieldAnalysis = {
  calculateVariance(expected: number, actual: number) {
    const variance = ((expected - actual) / expected) * 100
    return {
      variance: Number(variance.toFixed(2)),
      severity: this.getVarianceSeverity(variance),
      alert: Math.abs(variance) > 15
    }
  },

  getVarianceSeverity(variance: number) {
    const absVariance = Math.abs(variance)
    if (absVariance < 10) return 'NORMAL'
    if (absVariance < 20) return 'MONITOR'
    if (absVariance < 40) return 'URGENT'
    return 'CRITICAL'
  },

  analyzeYieldTrends(batches: BatchProduction[]) {
    const recentBatches = batches.slice(0, 10) // Last 10 batches
    const avgVariance = recentBatches.reduce((sum, batch) => sum + batch.variance_percentage, 0) / recentBatches.length
    
    return {
      averageVariance: Number(avgVariance.toFixed(2)),
      trend: avgVariance > 15 ? 'DETERIORATING' : avgVariance < -15 ? 'IMPROVING' : 'STABLE',
      recommendation: this.getYieldRecommendation(avgVariance)
    }
  },

  getYieldRecommendation(avgVariance: number) {
    if (avgVariance > 25) return 'URGENT: Investigate recipe execution or ingredient quality'
    if (avgVariance > 15) return 'Review cooking procedures and staff training'
    if (avgVariance > 5) return 'Monitor closely and document best practices'
    return 'Performance within acceptable range'
  }
}

// Stale Food Risk Assessment
export const staleAnalysis = {
  calculateSpoilageRisk(grocery: Grocery) {
    if (!grocery.expiry_date || !grocery.is_perishable) {
      return { riskLevel: 'LOW', alert: false, actions: [] }
    }

    const daysUntilExpiry = differenceInDays(new Date(grocery.expiry_date), new Date())
    const usageRate = grocery.usage_velocity || 0
    const remainingQuantity = grocery.current_amt
    const predictedUsage = usageRate * Math.max(daysUntilExpiry, 0)
    
    const excessQuantity = remainingQuantity - predictedUsage
    const riskScore = excessQuantity / remainingQuantity
    
    return {
      daysUntilExpiry,
      remainingQuantity,
      predictedUsage: Number(predictedUsage.toFixed(2)),
      excessQuantity: Number(excessQuantity.toFixed(2)),
      riskScore: Number(riskScore.toFixed(2)),
      riskLevel: this.getRiskLevel(riskScore, daysUntilExpiry),
      alert: this.shouldAlert(riskScore, daysUntilExpiry),
      actions: this.getRecommendedActions(riskScore, daysUntilExpiry, grocery),
      estimatedLoss: this.calculateEstimatedLoss(excessQuantity, grocery.category)
    }
  },

  getRiskLevel(riskScore: number, daysUntilExpiry: number) {
    if (daysUntilExpiry <= 0) return 'EXPIRED'
    if (riskScore > 0.8 || daysUntilExpiry <= 1) return 'CRITICAL'
    if (riskScore > 0.6 || daysUntilExpiry <= 2) return 'HIGH'
    if (riskScore > 0.4 || daysUntilExpiry <= 3) return 'MEDIUM'
    return 'LOW'
  },

  shouldAlert(riskScore: number, daysUntilExpiry: number) {
    return riskScore > 0.4 || daysUntilExpiry <= 2
  },

  getRecommendedActions(riskScore: number, daysUntilExpiry: number, grocery: Grocery) {
    const actions = []
    
    if (daysUntilExpiry <= 0) {
      actions.push('REMOVE_FROM_INVENTORY')
      actions.push('DOCUMENT_WASTE')
    } else if (riskScore > 0.8 || daysUntilExpiry <= 1) {
      actions.push('DISCOUNT_IMMEDIATE')
      actions.push('CREATE_SPECIAL_MENU')
      actions.push('CONTACT_FOOD_BANK')
    } else if (riskScore > 0.6 || daysUntilExpiry <= 2) {
      actions.push('PROMOTE_DISHES')
      actions.push('APPLY_DISCOUNT')
      actions.push('ALERT_KITCHEN_STAFF')
    } else if (riskScore > 0.4) {
      actions.push('MONITOR_CLOSELY')
      actions.push('PLAN_USAGE')
    }
    
    return actions
  },

  calculateEstimatedLoss(excessQuantity: number, category: keyof typeof perishableCategories) {
    // Estimated cost per unit by category (in INR)
    const estimatedCosts = {
      MEAT: 400,
      FISH: 500,
      DAIRY: 60,
      VEGETABLES: 40,
      FRUITS: 80,
      GRAINS: 50,
      SPICES: 200,
      OTHER: 100
    }
    
    return Number((excessQuantity * estimatedCosts[category]).toFixed(2))
  }
}

// Smart Procurement Suggestions
export const procurementAI = {
  optimizePurchasing(groceries: Grocery[], historicalUsage: any[]) {
    return groceries.map(grocery => {
      const avgUsage = this.calculateAverageUsage(grocery.id, historicalUsage)
      const currentStock = grocery.current_amt
      const daysOfStock = avgUsage > 0 ? currentStock / avgUsage : 0
      
      return {
        id: grocery.id,
        name: grocery.name,
        currentStock,
        avgDailyUsage: Number(avgUsage.toFixed(2)),
        daysOfStock: Number(daysOfStock.toFixed(1)),
        recommendation: this.getProcurementRecommendation(daysOfStock, grocery),
        suggestedOrderQuantity: this.calculateSuggestedOrder(avgUsage, grocery)
      }
    })
  },

  calculateAverageUsage(groceryId: string, historicalUsage: any[]) {
    const relevantUsage = historicalUsage.filter(usage => usage.grocery_id === groceryId)
    if (relevantUsage.length === 0) return 0
    
    const totalUsage = relevantUsage.reduce((sum, usage) => sum + usage.quantity_used, 0)
    return totalUsage / relevantUsage.length
  },

  getProcurementRecommendation(daysOfStock: number, grocery: Grocery) {
    const category = perishableCategories[grocery.category]
    const minDays = category.shelfLife * 0.3 // 30% of shelf life as minimum
    const maxDays = category.shelfLife * 0.7 // 70% of shelf life as maximum
    
    if (daysOfStock <= minDays) return 'ORDER_URGENT'
    if (daysOfStock <= maxDays) return 'ORDER_SOON'
    if (daysOfStock > category.shelfLife) return 'REDUCE_ORDER'
    return 'MAINTAIN_CURRENT'
  },

  calculateSuggestedOrder(avgDailyUsage: number, grocery: Grocery) {
    const category = perishableCategories[grocery.category]
    const optimalDays = Math.floor(category.shelfLife * 0.6) // 60% of shelf life
    return Number((avgDailyUsage * optimalDays).toFixed(2))
  }
}

// Menu Optimization AI
export const menuOptimizationAI = {
  generateStalePreventionMenus(atRiskGroceries: Grocery[]) {
    const suggestions = []
    
    for (const grocery of atRiskGroceries) {
      const menuSuggestions = this.getMenuSuggestionsByCategory(grocery)
      suggestions.push({
        grocery: grocery.name,
        quantity: grocery.current_amt,
        expiryDays: differenceInDays(new Date(grocery.expiry_date!), new Date()),
        suggestions: menuSuggestions
      })
    }
    
    return suggestions
  },

  getMenuSuggestionsByCategory(grocery: Grocery) {
    const suggestions: { [key: string]: string[] } = {
      MEAT: [
        `${grocery.name} Special Curry`,
        `Grilled ${grocery.name} Platter`,
        `${grocery.name} Biryani Special`,
        `Chef's ${grocery.name} Stir Fry`
      ],
      FISH: [
        `Fresh ${grocery.name} Curry`,
        `${grocery.name} Fry Special`,
        `Coastal ${grocery.name} Masala`,
        `${grocery.name} Tikka`
      ],
      VEGETABLES: [
        `Garden Fresh ${grocery.name} Curry`,
        `${grocery.name} Stir Fry`,
        `Mixed Vegetable with ${grocery.name}`,
        `${grocery.name} Sabzi Special`
      ],
      DAIRY: [
        `${grocery.name} Based Dessert`,
        `Creamy ${grocery.name} Sauce`,
        `${grocery.name} Lassi Special`,
        `${grocery.name} Paneer Curry`
      ],
      FRUITS: [
        `Fresh ${grocery.name} Juice`,
        `${grocery.name} Fruit Salad`,
        `${grocery.name} Smoothie`,
        `${grocery.name} Dessert Special`
      ]
    }
    
    return suggestions[grocery.category] || [`Special ${grocery.name} Dish`]
  }
}

// Alert Generation
export const alertGenerator = {
  generateYieldAlert(batch: BatchProduction, variance: number) {
    const severity = yieldAnalysis.getVarianceSeverity(variance)
    
    return {
      type: 'YIELD_VARIANCE',
      severity,
      title: `Yield variance detected: ${Math.abs(variance)}%`,
      message: `Expected ${batch.expected_yield} dishes, got ${batch.actual_yield}`,
      actions: this.getYieldAlertActions(severity),
      timestamp: new Date().toISOString()
    }
  },

  generateStaleAlert(grocery: Grocery, riskData: any) {
    return {
      type: 'STALE_RISK',
      severity: riskData.riskLevel,
      title: `${grocery.name} at risk of spoilage`,
      message: `${riskData.excessQuantity}kg may spoil in ${riskData.daysUntilExpiry} days`,
      estimatedLoss: riskData.estimatedLoss,
      actions: riskData.actions,
      timestamp: new Date().toISOString()
    }
  },

  getYieldAlertActions(severity: string) {
    const actions: { [key: string]: string[] } = {
      CRITICAL: ['INVESTIGATE_IMMEDIATELY', 'REVIEW_RECIPE', 'CHECK_INGREDIENTS', 'STAFF_MEETING'],
      URGENT: ['INVESTIGATE_TODAY', 'REVIEW_PROCESS', 'DOCUMENT_ISSUES'],
      MONITOR: ['TRACK_NEXT_BATCH', 'BRIEF_KITCHEN_STAFF'],
      NORMAL: ['CONTINUE_MONITORING']
    }
    
    return actions[severity] || actions.NORMAL
  }
} 