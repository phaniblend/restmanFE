// Enhanced RestMan Integration for Production RestMan
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class EnhancedRestManEngine {
  
  // Generate sophisticated recipes using RestMan
  async generateAdvancedRecipe(menuItem: string, cuisine: string, restrictions: string[] = []) {
    try {
      const prompt = `
        Generate a professional restaurant recipe for "${menuItem}" in ${cuisine} cuisine.
        ${restrictions.length > 0 ? `Dietary restrictions: ${restrictions.join(', ')}` : ''}
        
        Provide:
        1. Detailed ingredient list with exact quantities (in metric)
        2. Step-by-step cooking instructions
        3. Prep time and cook time
        4. Cost estimation for US market
        5. Yield information (number of servings)
        6. Chef's tips and variations
        7. Plating and presentation notes
        8. Storage and shelf-life information
        
        Format as JSON with clear structure.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional chef and restaurant consultant with expertise in various cuisines and restaurant operations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      return {
        success: true,
        recipe: JSON.parse(completion.choices[0].message.content || '{}'),
        tokens_used: completion.usage?.total_tokens || 0
      }
    } catch (error) {
      console.error('RestMan recipe generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: this.getFallbackRecipe(menuItem, cuisine)
      }
    }
  }

  // Analyze yield variance with RestMan insights
  async analyzeYieldVariance(yieldData: any[]) {
    try {
      const prompt = `
        Analyze this restaurant yield variance data and provide insights:
        ${JSON.stringify(yieldData, null, 2)}
        
        Provide:
        1. Root cause analysis for variances
        2. Specific recommendations for improvement
        3. Training needs identification
        4. Process optimization suggestions
        5. Cost impact assessment
        6. Prevention strategies
        
        Focus on actionable insights for restaurant management.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system", 
            content: "You are a restaurant operations expert specializing in kitchen efficiency and cost optimization."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      return {
        success: true,
        analysis: completion.choices[0].message.content,
        recommendations: this.parseRecommendations(completion.choices[0].message.content || '')
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Analysis failed' }
    }
  }

  // Smart menu optimization based on inventory
  async optimizeMenuForInventory(inventory: any[], currentMenu: any[]) {
    try {
      const prompt = `
        Based on this restaurant inventory and current menu, suggest optimizations:
        
        INVENTORY:
        ${JSON.stringify(inventory, null, 2)}
        
        CURRENT MENU:
        ${JSON.stringify(currentMenu, null, 2)}
        
        Provide:
        1. Dishes to promote (using excess inventory)
        2. Dishes to temporarily remove (missing ingredients)
        3. New dish suggestions using available ingredients
        4. Pricing optimization recommendations
        5. Cross-utilization opportunities
        6. Waste reduction strategies
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a restaurant menu consultant with expertise in inventory optimization and profitability."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1800
      })

      return {
        success: true,
        optimization: JSON.parse(completion.choices[0].message.content || '{}')
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Optimization failed' }
    }
  }

  // Predict demand using RestMan
  async predictDemand(historicalSales: any[], externalFactors: any = {}) {
    try {
      const prompt = `
        Predict restaurant demand based on historical data and external factors:
        
        HISTORICAL SALES:
        ${JSON.stringify(historicalSales.slice(-30), null, 2)}
        
        EXTERNAL FACTORS:
        ${JSON.stringify(externalFactors, null, 2)}
        
        Provide predictions for:
        1. Next 7 days demand by dish
        2. Peak hours and slow periods
        3. Seasonal adjustments
        4. Special event impacts
        5. Recommended inventory levels
        6. Staff scheduling suggestions
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a restaurant analytics expert specializing in demand forecasting and operational planning."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })

      return {
        success: true,
        predictions: JSON.parse(completion.choices[0].message.content || '{}')
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Prediction failed' }
    }
  }

  // Generate smart alerts with context
  async generateSmartAlert(alertData: any, restaurantContext: any) {
    try {
      const prompt = `
        Generate a contextual alert message for restaurant staff:
        
        ALERT DATA:
        ${JSON.stringify(alertData, null, 2)}
        
        RESTAURANT CONTEXT:
        ${JSON.stringify(restaurantContext, null, 2)}
        
        Create role-specific messages for:
        1. Owner (focus on financial impact)
        2. Manager (focus on operational actions)
        3. Chef (focus on immediate kitchen actions)
        
        Make messages actionable, urgent but not alarming, and include next steps.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a restaurant communication specialist creating effective operational alerts."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      })

      return {
        success: true,
        alerts: JSON.parse(completion.choices[0].message.content || '{}')
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Alert generation failed' }
    }
  }

  // Fallback recipe when RestMan generation fails
  private getFallbackRecipe(menuItem: string, cuisine: string) {
    return {
      name: menuItem,
      cuisine,
      description: `Traditional ${menuItem} recipe - RestMan enhanced version temporarily unavailable`,
      ingredients: [
        { name: 'Main ingredient', quantity: '500g', notes: 'Adjust based on requirements' }
      ],
      instructions: [
        'Prepare ingredients according to standard procedures',
        'Follow traditional cooking methods',
        'Adjust seasoning to taste',
        'Serve hot'
      ],
      prep_time: 30,
      cook_time: 45,
      servings: 4,
      estimated_cost: 100
    }
  }

  // Parse RestMan recommendations into structured format
  private parseRecommendations(content: string) {
    const lines = content.split('\n')
    const recommendations = []
    
    for (const line of lines) {
      if (line.includes('Recommendation:') || line.includes('Suggest:') || line.includes('Action:')) {
        recommendations.push(line.trim())
      }
    }
    
    return recommendations.length > 0 ? recommendations : ['Review operational procedures', 'Monitor performance closely']
  }
}

// Voice Commands Integration
export class VoiceCommandProcessor {
  private recognition: any = null

  constructor() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = 'en-IN' // Indian English
    }
  }

  async startListening(onResult: (command: any) => void) {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported')
    }

    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase()
        const processedCommand = this.processVoiceCommand(command)
        onResult(processedCommand)
        resolve(processedCommand)
      }

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`))
      }

      this.recognition.start()
    })
  }

  private processVoiceCommand(command: string) {
    // Common kitchen voice commands
    const commandMappings = {
      'add inventory': { action: 'ADD_INVENTORY', path: '/inventory/add' },
      'log batch': { action: 'LOG_BATCH', path: '/batches/add' },
      'check alerts': { action: 'VIEW_ALERTS', path: '/alerts' },
      'view recipes': { action: 'VIEW_RECIPES', path: '/recipes' },
      'mark waste': { action: 'MARK_WASTE', path: '/inventory/waste' },
      'complete batch': { action: 'COMPLETE_BATCH', path: '/batches/complete' }
    }

    for (const [phrase, mapping] of Object.entries(commandMappings)) {
      if (command.includes(phrase)) {
        return mapping
      }
    }

    return { action: 'UNKNOWN', command, path: '/' }
  }
}

// Real-time Analytics Engine
export class RealTimeAnalytics {
  private eventQueue: any[] = []
  private batchSize = 10
  private flushInterval = 5000 // 5 seconds

  constructor() {
    if (typeof window !== 'undefined') {
      setInterval(() => this.flushEvents(), this.flushInterval)
    }
  }

  trackEvent(event: string, data: any, userId?: string) {
    this.eventQueue.push({
      event,
      data,
      userId,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    })

    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents()
    }
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      // Send to analytics service
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      })
    } catch (error) {
      console.error('Analytics flush failed:', error)
      // Re-queue events for retry
      this.eventQueue.unshift(...events)
    }
  }

  private getSessionId() {
    if (typeof window === 'undefined') return 'server'
    
    let sessionId = sessionStorage.getItem('restman_session')
    if (!sessionId) {
      sessionId = Date.now().toString()
      sessionStorage.setItem('restman_session', sessionId)
    }
    return sessionId
  }
}

export const enhancedRestMan = new EnhancedRestManEngine()
export const voiceProcessor = new VoiceCommandProcessor()
export const analytics = new RealTimeAnalytics() 