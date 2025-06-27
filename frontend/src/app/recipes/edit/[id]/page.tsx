'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Clock, 
  Users, 
  DollarSign,
  ChefHat,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  cost: number
  isOptional: boolean
}

interface Recipe {
  id: string
  name: string
  description: string
  category: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  ingredients: Ingredient[]
  instructions: string[]
  notes: string[]
  estimatedCost: number
  aiGenerated: boolean
  chefModified: boolean
}

export default function RecipeEditPage() {
  const params = useParams()
  const recipeId = params.id as string
  
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: 0,
    unit: 'grams',
    cost: 0,
    isOptional: false
  })
  const [newInstruction, setNewInstruction] = useState('')
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockRecipe: Recipe = {
      id: recipeId,
      name: 'Chicken Biryani',
      description: 'RestMan-generated aromatic chicken biryani with traditional spices',
      category: 'Main Course',
      prepTime: 45,
      cookTime: 60,
      servings: 4,
      difficulty: 'Hard',
      ingredients: [
        {
          id: '1',
          name: 'Basmati Rice',
          quantity: 2,
          unit: 'cups',
          cost: 80,
          isOptional: false
        },
        {
          id: '2',
          name: 'Chicken',
          quantity: 1,
          unit: 'kg',
          cost: 300,
          isOptional: false
        },
        {
          id: '3',
          name: 'Yogurt',
          quantity: 1,
          unit: 'cup',
          cost: 30,
          isOptional: false
        },
        {
          id: '4',
          name: 'Saffron',
          quantity: 1,
          unit: 'pinch',
          cost: 50,
          isOptional: true
        }
      ],
      instructions: [
        'Soak basmati rice for 30 minutes',
        'Marinate chicken with yogurt and spices for 2 hours',
        'Cook rice until 70% done',
        'Layer rice and chicken in heavy-bottomed pot',
        'Cook on dum for 45 minutes on low heat'
      ],
      notes: [
        'Use aged basmati rice for best results',
        'Saffron soaked in warm milk adds color and aroma',
        'Let the biryani rest for 10 minutes before serving'
      ],
      estimatedCost: 460,
      aiGenerated: true,
      chefModified: false
    }
    
    setTimeout(() => {
      setRecipe(mockRecipe)
      setIsLoading(false)
    }, 1000)
  }, [recipeId])

  const updateRecipe = (field: keyof Recipe, value: any) => {
    if (!recipe) return
    setRecipe(prev => prev ? { ...prev, [field]: value, chefModified: true } : null)
  }

  const updateIngredient = (ingredientId: string, field: keyof Ingredient, value: any) => {
    if (!recipe) return
    setRecipe(prev => prev ? {
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === ingredientId ? { ...ing, [field]: value } : ing
      ),
      chefModified: true
    } : null)
  }

  const addIngredient = () => {
    if (!recipe || !newIngredient.name.trim()) return
    
    const ingredient: Ingredient = {
      id: `ing_${Date.now()}`,
      name: newIngredient.name.trim(),
      quantity: newIngredient.quantity,
      unit: newIngredient.unit,
      cost: newIngredient.cost,
      isOptional: newIngredient.isOptional
    }
    
    setRecipe(prev => prev ? {
      ...prev,
      ingredients: [...prev.ingredients, ingredient],
      chefModified: true
    } : null)
    
    setNewIngredient({
      name: '',
      quantity: 0,
      unit: 'grams',
      cost: 0,
      isOptional: false
    })
  }

  const removeIngredient = (ingredientId: string) => {
    if (!recipe) return
    setRecipe(prev => prev ? {
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== ingredientId),
      chefModified: true
    } : null)
  }

  const addInstruction = () => {
    if (!recipe || !newInstruction.trim()) return
    setRecipe(prev => prev ? {
      ...prev,
      instructions: [...prev.instructions, newInstruction.trim()],
      chefModified: true
    } : null)
    setNewInstruction('')
  }

  const updateInstruction = (index: number, value: string) => {
    if (!recipe) return
    setRecipe(prev => prev ? {
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst),
      chefModified: true
    } : null)
  }

  const removeInstruction = (index: number) => {
    if (!recipe) return
    setRecipe(prev => prev ? {
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
      chefModified: true
    } : null)
  }

  const addNote = () => {
    if (!recipe || !newNote.trim()) return
    setRecipe(prev => prev ? {
      ...prev,
      notes: [...prev.notes, newNote.trim()],
      chefModified: true
    } : null)
    setNewNote('')
  }

  const removeNote = (index: number) => {
    if (!recipe) return
    setRecipe(prev => prev ? {
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index),
      chefModified: true
    } : null)
  }

  const saveRecipe = async () => {
    if (!recipe) return
    setIsSaving(true)
    
    // Mock save - in real app, send to API
    setTimeout(() => {
      setIsSaving(false)
      alert('Recipe saved successfully! Owner has been notified of modifications.')
    }, 2000)
  }

  const calculateTotalCost = () => {
    if (!recipe) return 0
    return recipe.ingredients.reduce((total, ing) => total + ing.cost, 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Found</h2>
          <p className="text-gray-600 mb-4">The recipe you're looking for doesn't exist.</p>
          <Link href="/recipes" className="btn-premium">
            Back to Recipes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-b border-white/20 shadow-xl safe-area-top"
      >
        <div className="mobile-container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/ai-suggestions" className="interactive p-2 rounded-xl">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-xl font-bold gradient-text">Edit Recipe</h1>
                <p className="text-sm text-gray-600">
                  {recipe.aiGenerated && 'RestMan Generated'} 
                  {recipe.chefModified && ' • Modified by Chef'}
                </p>
              </div>
            </div>
            
            <button
              onClick={saveRecipe}
              disabled={isSaving}
              className="btn-premium flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </motion.header>

      <div className="mobile-container py-6">
        {/* Recipe Basic Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mobile-card mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recipe Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Recipe Name</label>
              <input
                type="text"
                value={recipe.name}
                onChange={(e) => updateRecipe('name', e.target.value)}
                className="mobile-input focus-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={recipe.description}
                onChange={(e) => updateRecipe('description', e.target.value)}
                className="mobile-input focus-ring resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time (min)</label>
                <input
                  type="number"
                  value={recipe.prepTime}
                  onChange={(e) => updateRecipe('prepTime', parseInt(e.target.value))}
                  className="mobile-input focus-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cook Time (min)</label>
                <input
                  type="number"
                  value={recipe.cookTime}
                  onChange={(e) => updateRecipe('cookTime', parseInt(e.target.value))}
                  className="mobile-input focus-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Servings</label>
                <input
                  type="number"
                  value={recipe.servings}
                  onChange={(e) => updateRecipe('servings', parseInt(e.target.value))}
                  className="mobile-input focus-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  value={recipe.difficulty}
                  onChange={(e) => updateRecipe('difficulty', e.target.value)}
                  className="mobile-input focus-ring"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ingredients */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mobile-card mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Ingredients</h2>
            <div className="text-sm text-gray-600">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
              {recipe.aiGenerated && 'RestMan Generated'}
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {recipe.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(ingredient.id, 'quantity', parseFloat(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="grams">grams</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="liter">liter</option>
                  <option value="cups">cups</option>
                  <option value="pieces">pieces</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                  <option value="pinch">pinch</option>
                </select>
                <input
                  type="number"
                  value={ingredient.cost}
                  onChange={(e) => updateIngredient(ingredient.id, 'cost', parseFloat(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="$"
                />
                <button
                  onClick={() => removeIngredient(ingredient.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Ingredient */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Add Ingredient</h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Ingredient name"
              />
              <input
                type="number"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Qty"
              />
              <select
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="grams">grams</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="liter">liter</option>
                <option value="cups">cups</option>
                <option value="pieces">pieces</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
                <option value="pinch">pinch</option>
              </select>
              <input
                type="number"
                value={newIngredient.cost}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="$"
              />
              <button
                onClick={addIngredient}
                className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mobile-card mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
          
          <div className="space-y-3 mb-4">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  {index + 1}
                </div>
                <textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  rows={2}
                />
                <button
                  onClick={() => removeInstruction(index)}
                  className="text-red-600 hover:text-red-700 p-1 mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Instruction */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                {recipe.instructions.length + 1}
              </div>
              <textarea
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={2}
                placeholder="Add new instruction..."
              />
              <button
                onClick={addInstruction}
                className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors mt-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Chef Notes */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mobile-card"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Chef Notes & Tips</h2>
          
          <div className="space-y-3 mb-4">
            {recipe.notes.map((note, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="text-yellow-600 mt-1">💡</div>
                <div className="flex-1 text-sm text-gray-700">{note}</div>
                <button
                  onClick={() => removeNote(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Note */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600 mt-3">💡</div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={2}
                placeholder="Add chef tip or note..."
              />
              <button
                onClick={addNote}
                className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors mt-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 