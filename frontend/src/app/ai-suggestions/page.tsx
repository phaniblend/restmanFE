'use client'

import { useState, useEffect } from 'react'
import { ChefHat, Clock, DollarSign, Users, CheckCircle, XCircle, Edit3, AlertCircle, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

interface AISuggestion {
  id: string
  menu_item_name: string
  cuisine_type: string
  dish_category: string
  suggested_recipe: {
    name: string
    description: string
    prep_time_minutes: number
    cook_time_minutes: number
    difficulty_level: string
    serving_size: number
    instructions: string[]
    tips: string[]
  }
  suggested_ingredients: Array<{
    grocery_id: string | null
    grocery_name: string
    ai_suggested_qty: number
    unit: string
    estimated_cost: number
    is_critical: boolean
    procurement_needed?: boolean
  }>
  estimated_cost: number
  estimated_prep_time: number
  chef_status: 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED'
  chef_feedback: string | null
  created_at: string
}

export default function AISuggestionsPage() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED'>('PENDING')
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null)

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const [isGenerating, setIsGenerating] = useState(false)
  const [generationForm, setGenerationForm] = useState({
    menuItem: '',
    cuisine: 'INDIAN',
    restrictions: [] as string[]
  })

  const generateNewRecipe = async () => {
    if (!generationForm.menuItem) {
      toast.error('Please enter a menu item name')
      return
    }

    setIsGenerating(true)
    try {
      console.log('Calling /api/generate-recipe with:', generationForm)
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generationForm)
      })

      const data = await response.json()
      console.log('API response:', data)
      
      if (data.success) {
        // Track whether we're in demo mode
        setIsDemoMode(data.demo)
        
        // Convert API response to suggestion format
        const newSuggestion: AISuggestion = {
          id: Date.now().toString(),
          menu_item_name: data.recipe.name,
          cuisine_type: data.recipe.cuisine_type,
          dish_category: 'MAIN_COURSE',
          suggested_recipe: {
            ...data.recipe,
            instructions: data.recipe.instructions,
            tips: data.recipe.tips
          },
          suggested_ingredients: data.recipe.ingredients.map((ing: any) => ({
            grocery_id: null,
            grocery_name: ing.name,
            ai_suggested_qty: ing.quantity,
            unit: ing.unit,
            estimated_cost: ing.quantity * 0.1, // Simple cost estimation
            is_critical: ing.is_critical,
            procurement_needed: true
          })),
          estimated_cost: data.recipe.estimated_cost_per_serving * data.recipe.serving_size,
          estimated_prep_time: data.recipe.prep_time_minutes + data.recipe.cook_time_minutes,
          chef_status: 'PENDING',
          chef_feedback: null,
          created_at: new Date().toISOString()
        }

        setSuggestions(prev => [newSuggestion, ...prev])
        toast.success(data.demo ? 'Demo recipe generated!' : 'AI recipe generated successfully!')
        setGenerationForm({ menuItem: '', cuisine: 'INDIAN', restrictions: [] })
      }
    } catch (error) {
      toast.error('Failed to generate recipe')
    } finally {
      setIsGenerating(false)
    }
  }

  const fetchSuggestions = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching AI suggestions...')
      // Start with some example suggestions
      const mockSuggestions: AISuggestion[] = [
        {
          id: '1',
          menu_item_name: 'Chicken Biryani',
          cuisine_type: 'INDIAN',
          dish_category: 'MAIN_COURSE',
          suggested_recipe: {
            name: 'Chicken Biryani',
            description: 'AI-generated Chicken Biryani recipe with aromatic spices',
            prep_time_minutes: 45,
            cook_time_minutes: 60,
            difficulty_level: 'HARD',
            serving_size: 4,
            instructions: [
              'Soak basmati rice for 30 minutes',
              'Marinate chicken with yogurt and spices',
              'Cook rice until 70% done',
              'Layer rice and chicken in pot',
              'Cook on dum for 45 minutes'
            ],
            tips: [
              'Use aged basmati rice for best results',
              'Saffron soaked in warm milk adds color',
              'Rest the biryani for 10 minutes before serving'
            ]
          },
          suggested_ingredients: [
            {
              grocery_id: '1',
              grocery_name: 'Basmati Rice',
              ai_suggested_qty: 2,
              unit: 'kg',
              estimated_cost: 180,
              is_critical: true
            },
            {
              grocery_id: '2',
              grocery_name: 'Chicken',
              ai_suggested_qty: 1.5,
              unit: 'kg',
              estimated_cost: 450,
              is_critical: true
            },
            {
              grocery_id: null,
              grocery_name: 'Biryani Masala',
              ai_suggested_qty: 0.1,
              unit: 'kg',
              estimated_cost: 0,
              is_critical: true,
              procurement_needed: true
            }
          ],
          estimated_cost: 120,
          estimated_prep_time: 105,
          chef_status: 'PENDING',
          chef_feedback: null,
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          menu_item_name: 'Vegetable Fried Rice',
          cuisine_type: 'CHINESE',
          dish_category: 'MAIN_COURSE',
          suggested_recipe: {
            name: 'Vegetable Fried Rice',
            description: 'AI-generated Vegetable Fried Rice with mixed vegetables',
            prep_time_minutes: 15,
            cook_time_minutes: 20,
            difficulty_level: 'EASY',
            serving_size: 2,
            instructions: [
              'Heat oil in wok',
              'Add garlic and ginger',
              'Add vegetables and stir-fry',
              'Add cooked rice and sauces',
              'Toss everything together'
            ],
            tips: [
              'Use day-old rice for better texture',
              'High heat is essential for wok hei',
              'Add soy sauce gradually'
            ]
          },
          suggested_ingredients: [
            {
              grocery_id: '1',
              grocery_name: 'Rice',
              ai_suggested_qty: 1,
              unit: 'kg',
              estimated_cost: 50,
              is_critical: true
            },
            {
              grocery_id: '3',
              grocery_name: 'Mixed Vegetables',
              ai_suggested_qty: 0.3,
              unit: 'kg',
              estimated_cost: 30,
              is_critical: false
            }
          ],
          estimated_cost: 45,
          estimated_prep_time: 35,
          chef_status: 'PENDING',
          chef_feedback: null,
          created_at: '2024-01-15T11:00:00Z'
        }
      ]
      
      setSuggestions(mockSuggestions)
      console.log('Mock suggestions loaded:', mockSuggestions)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      toast.error('Failed to fetch RestMan suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionAction = async (suggestionId: string, action: 'ACCEPT' | 'MODIFY' | 'REJECT', feedback?: string) => {
    try {
      // In real implementation, this would call Supabase
      setSuggestions(prev => 
        prev.map(s => 
          s.id === suggestionId 
            ? { ...s, chef_status: action === 'ACCEPT' ? 'ACCEPTED' : action === 'MODIFY' ? 'MODIFIED' : 'REJECTED', chef_feedback: feedback || null }
            : s
        )
      )
      
      const actionMessages = {
        ACCEPT: 'Recipe accepted! It will be added to your recipe collection.',
        MODIFY: 'Recipe marked for modification. You can now customize it.',
        REJECT: 'Recipe rejected. Feedback sent to improve future suggestions.'
      }
      
      toast.success(actionMessages[action])
      
      if (action === 'MODIFY') {
        // Redirect to recipe editor
        window.location.href = `/recipes/edit/${suggestionId}`
      }
    } catch (error) {
      toast.error('Failed to update suggestion')
    }
  }

  const filteredSuggestions = suggestions.filter(s => 
    filter === 'ALL' || s.chef_status === filter
  )

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'EASY': return 'text-success'
      case 'MEDIUM': return 'text-warning'
      case 'HARD': return 'text-error'
      default: return 'text-neutral'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle className="w-5 h-5 text-success" />
      case 'REJECTED': return <XCircle className="w-5 h-5 text-error" />
      case 'MODIFIED': return <Edit3 className="w-5 h-5 text-info" />
      default: return <AlertCircle className="w-5 h-5 text-warning" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-primary text-primary-content p-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">AI Recipe Generator</h1>
            <p className="text-sm opacity-90">Generate restaurant-quality recipes with AI</p>
          </div>
          <ChefHat className="w-8 h-8" />
        </div>
      </div>

      {/* Recipe Generation Form */}
      <div className="bg-base-200 p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Generate New Recipe</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Menu Item Name</label>
              <input
                type="text"
                placeholder="e.g., Butter Chicken, Pad Thai, Margherita Pizza"
                value={generationForm.menuItem}
                onChange={(e) => setGenerationForm(prev => ({ ...prev, menuItem: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Cuisine Type</label>
              <select
                value={generationForm.cuisine}
                onChange={(e) => setGenerationForm(prev => ({ ...prev, cuisine: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="INDIAN">Indian</option>
                <option value="CHINESE">Chinese</option>
                <option value="ITALIAN">Italian</option>
                <option value="MEXICAN">Mexican</option>
                <option value="THAI">Thai</option>
                <option value="AMERICAN">American</option>
                <option value="JAPANESE">Japanese</option>
                <option value="MEDITERRANEAN">Mediterranean</option>
              </select>
            </div>

            <button
              onClick={generateNewRecipe}
              disabled={isGenerating || !generationForm.menuItem}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate AI Recipe</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mt-3 p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-800">
              <strong>Note:</strong> {isDemoMode === null ? 'Ready to generate recipes' : isDemoMode ? 'Demo mode - Using curated recipes' : 'Using OpenAI GPT-3.5 for authentic recipes'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-base-200 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {['ALL', 'PENDING', 'ACCEPTED', 'MODIFIED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-ghost'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="p-4 space-y-4">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-8">
            <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-base-content/60">No RestMan suggestions found</p>
            <p className="text-sm text-base-content/40 mt-2">Scan items in inventory to get suggestions</p>
          </div>
        ) : (
          filteredSuggestions.map(suggestion => (
            <div key={suggestion.id} className="mobile-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{suggestion.menu_item_name}</h3>
                  <p className="text-sm text-base-content/60">{suggestion.cuisine_type} • {suggestion.dish_category}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(suggestion.chef_status)}
                  <span className={`text-sm font-medium ${getDifficultyColor(suggestion.suggested_recipe.difficulty_level)}`}>
                    {suggestion.suggested_recipe.difficulty_level}
                  </span>
                </div>
              </div>

              {/* Recipe Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-base-content/60">Prep Time</p>
                  <p className="text-sm font-medium">{suggestion.suggested_recipe.prep_time_minutes}min</p>
                </div>
                <div className="text-center">
                  <DollarSign className="w-4 h-4 mx-auto mb-1 text-success" />
                  <p className="text-xs text-base-content/60">Est. Cost</p>
                  <p className="text-sm font-medium">${suggestion.estimated_cost}</p>
                </div>
                <div className="text-center">
                  <Users className="w-4 h-4 mx-auto mb-1 text-info" />
                  <p className="text-xs text-base-content/60">Serving</p>
                  <p className="text-sm font-medium">{suggestion.suggested_recipe.serving_size}</p>
                </div>
              </div>

              {/* Ingredients Preview */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Key Ingredients:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.suggested_ingredients.slice(0, 3).map((ingredient, index) => (
                    <span
                      key={index}
                      className={`badge ${ingredient.procurement_needed ? 'badge-warning' : 'badge-primary'}`}
                    >
                      {ingredient.grocery_name} ({ingredient.ai_suggested_qty}{ingredient.unit})
                    </span>
                  ))}
                  {suggestion.suggested_ingredients.length > 3 && (
                    <span className="badge badge-ghost">+{suggestion.suggested_ingredients.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {suggestion.chef_status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSuggestionAction(suggestion.id, 'ACCEPT')}
                    className="btn btn-success btn-sm flex-1"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleSuggestionAction(suggestion.id, 'MODIFY')}
                    className="btn btn-info btn-sm flex-1"
                  >
                    Customize
                  </button>
                  <button
                    onClick={() => handleSuggestionAction(suggestion.id, 'REJECT', 'Not suitable for our kitchen')}
                    className="btn btn-error btn-sm flex-1"
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* Feedback */}
              {suggestion.chef_feedback && (
                <div className="mt-3 p-3 bg-base-300 rounded-lg">
                  <p className="text-sm font-medium mb-1">Chef's Feedback:</p>
                  <p className="text-sm text-base-content/80">{suggestion.chef_feedback}</p>
                </div>
              )}

              {/* Detailed View Button */}
              <button
                onClick={() => setSelectedSuggestion(suggestion)}
                className="btn btn-ghost btn-sm w-full mt-2"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-base-100 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-base-300">
              <h2 className="text-lg font-bold">{selectedSuggestion.menu_item_name}</h2>
              <p className="text-sm text-base-content/60">{selectedSuggestion.suggested_recipe.description}</p>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Instructions */}
              <div>
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  {selectedSuggestion.suggested_recipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm">{instruction}</li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              <div>
                <h3 className="font-semibold mb-2">Chef's Tips:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedSuggestion.suggested_recipe.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-base-content/80">{tip}</li>
                  ))}
                </ul>
              </div>

              {/* All Ingredients */}
              <div>
                <h3 className="font-semibold mb-2">Complete Ingredient List:</h3>
                <div className="space-y-2">
                  {selectedSuggestion.suggested_ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-base-200 rounded">
                      <div>
                        <span className="font-medium">{ingredient.grocery_name}</span>
                        {ingredient.procurement_needed && (
                          <span className="badge badge-warning badge-sm ml-2">Need to buy</span>
                        )}
                      </div>
                      <span className="text-sm">
                        {ingredient.ai_suggested_qty}{ingredient.unit}
                        {ingredient.estimated_cost > 0 && (
                          <span className="text-base-content/60 ml-2">${ingredient.estimated_cost}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-base-300">
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="btn btn-ghost w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Space */}
      <div className="h-20"></div>
    </div>
  )
} 