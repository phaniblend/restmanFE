'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChefHat, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Users,
  DollarSign,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface Recipe {
  id: string
  name: string
  category: string
  prepTime: number
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  costPerServing: number
  popularity: number
  ingredients: string[]
  instructions: string[]
  aiGenerated: boolean
  rating: number
  image: string
}

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAIModal, setShowAIModal] = useState(false)
  
  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: '1',
      name: 'Butter Chicken',
      category: 'Main Course',
      prepTime: 45,
      servings: 4,
      difficulty: 'Medium',
      costPerServing: 120,
      popularity: 95,
      ingredients: ['Chicken', 'Butter', 'Tomatoes', 'Cream', 'Spices'],
      instructions: ['Marinate chicken', 'Cook in butter', 'Add tomato sauce', 'Simmer with cream'],
      aiGenerated: false,
      rating: 4.8,
      image: '🍛'
    },
    {
      id: '2',
      name: 'Vegetable Biryani',
      category: 'Main Course',
      prepTime: 60,
      servings: 6,
      difficulty: 'Hard',
      costPerServing: 80,
      popularity: 88,
      ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Yogurt', 'Spices'],
      instructions: ['Soak rice', 'Cook vegetables', 'Layer rice and vegetables', 'Dum cook'],
      aiGenerated: true,
      rating: 4.6,
      image: '🍚'
    },
    {
      id: '3',
      name: 'Masala Chai',
      category: 'Beverages',
      prepTime: 10,
      servings: 2,
      difficulty: 'Easy',
      costPerServing: 15,
      popularity: 92,
      ingredients: ['Tea leaves', 'Milk', 'Sugar', 'Cardamom', 'Ginger'],
      instructions: ['Boil water with spices', 'Add tea leaves', 'Add milk and sugar', 'Strain and serve'],
      aiGenerated: false,
      rating: 4.9,
      image: '☕'
    },
    {
      id: '4',
      name: 'Paneer Tikka',
      category: 'Appetizers',
      prepTime: 30,
      servings: 4,
      difficulty: 'Medium',
      costPerServing: 90,
      popularity: 85,
      ingredients: ['Paneer', 'Yogurt', 'Bell Peppers', 'Onions', 'Spices'],
      instructions: ['Marinate paneer', 'Thread on skewers', 'Grill until golden', 'Serve hot'],
      aiGenerated: true,
      rating: 4.7,
      image: '🧀'
    }
  ])

  const categories = ['all', 'Main Course', 'Appetizers', 'Beverages', 'Desserts', 'Snacks']

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    totalRecipes: recipes.length,
    aiGenerated: recipes.filter(r => r.aiGenerated).length,
    avgRating: (recipes.reduce((sum, r) => sum + r.rating, 0) / recipes.length).toFixed(1),
    avgCost: Math.round(recipes.reduce((sum, r) => sum + r.costPerServing, 0) / recipes.length)
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
              <Link href="/" className="interactive p-2 rounded-xl">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">Recipe Management</h1>
                  <p className="text-sm text-gray-600">Create and manage your recipes</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/setup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 animate-shimmer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Restaurant Setup</span>
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-premium flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Recipe</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="mobile-container py-6">
        {/* Stats Cards */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <div className="dashboard-card animate-fade-scale">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-float">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Recipes</p>
              <p className="text-2xl font-bold gradient-text">{stats.totalRecipes}</p>
            </div>
          </div>
          
          <div className="dashboard-card animate-fade-scale">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-float">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">RestMan Generated</p>
              <p className="text-2xl font-bold text-purple-600">{stats.aiGenerated}</p>
            </div>
          </div>
          
          <div className="dashboard-card animate-fade-scale">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-float">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}</p>
            </div>
          </div>
          
          <div className="dashboard-card animate-fade-scale">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-float">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Cost</p>
              <p className="text-2xl font-bold text-green-600">${stats.avgCost}</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mobile-card mb-6"
        >
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mobile-input pl-12 focus-ring"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mobile-input focus-ring flex-1"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Recipes Grid */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="premium-card p-6 cursor-pointer relative overflow-hidden"
            >
              {recipe.aiGenerated && (
                <div className="absolute top-4 right-4 bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI</span>
                </div>
              )}
              
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{recipe.image}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{recipe.name}</h3>
                <p className="text-sm text-gray-500">{recipe.category}</p>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Prep Time
                  </span>
                  <span className="font-medium">{recipe.prepTime} min</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Servings
                  </span>
                  <span className="font-medium">{recipe.servings}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Difficulty</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cost/Serving</span>
                  <span className="font-bold text-green-600">${recipe.costPerServing}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{recipe.rating}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">{recipe.popularity}% popular</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredRecipes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>

      {/* RestMan Recipe Generation Modal */}
      {showAIModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAIModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">RestMan Recipe Generator</h3>
              <p className="text-gray-600">Let RestMan create amazing recipes based on your available ingredients</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Ingredients</label>
                <textarea
                  placeholder="Enter ingredients you have (e.g., chicken, rice, tomatoes, onions...)"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                <select className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option>Indian</option>
                  <option>Chinese</option>
                  <option>Continental</option>
                  <option>Italian</option>
                  <option>Mexican</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Generate</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 