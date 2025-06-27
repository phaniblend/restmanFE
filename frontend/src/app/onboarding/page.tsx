'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  ChefHat, 
  Users, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Utensils,
  Coffee,
  Cake,
  Plus,
  X
} from 'lucide-react'

interface RestaurantData {
  name: string
  address: string
  phone: string
  email: string
  cuisine: string
  ownerName: string
}

interface MenuCategory {
  id: string
  name: string
  icon: string
  suggestions: string[]
  selected: string[]
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    cuisine: '',
    ownerName: ''
  })

  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([
    {
      id: 'main_course',
      name: 'Main Course',
      icon: '🍛',
      suggestions: [],
      selected: []
    },
    {
      id: 'appetizers',
      name: 'Appetizers',
      icon: '🥗',
      suggestions: [],
      selected: []
    },
    {
      id: 'beverages',
      name: 'Beverages',
      icon: '☕',
      suggestions: [],
      selected: []
    },
    {
      id: 'desserts',
      name: 'Desserts',
      icon: '🍰',
      suggestions: [],
      selected: []
    }
  ])

  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const cuisineTypes = [
    { id: 'indian', name: 'Indian', icon: '🇮🇳' },
    { id: 'chinese', name: 'Chinese', icon: '🇨🇳' },
    { id: 'italian', name: 'Italian', icon: '🇮🇹' },
    { id: 'mexican', name: 'Mexican', icon: '🇲🇽' },
    { id: 'continental', name: 'Continental', icon: '🍽️' },
    { id: 'thai', name: 'Thai', icon: '🇹🇭' }
  ]

  // Mock RestMan menu suggestions based on cuisine
  const menuSuggestions: { [key: string]: { [key: string]: string[] } } = {
    indian: {
      main_course: ['Butter Chicken', 'Biryani', 'Dal Makhani', 'Paneer Tikka Masala', 'Chicken Curry', 'Palak Paneer', 'Rogan Josh', 'Chole Bhature'],
      appetizers: ['Samosa', 'Pakora', 'Paneer Tikka', 'Chicken 65', 'Aloo Tikki', 'Kebabs', 'Papadum', 'Dhokla'],
      beverages: ['Masala Chai', 'Lassi', 'Fresh Lime Soda', 'Mango Shake', 'Buttermilk', 'Filter Coffee', 'Kulfi Shake'],
      desserts: ['Gulab Jamun', 'Rasgulla', 'Kheer', 'Kulfi', 'Jalebi', 'Halwa', 'Ras Malai', 'Laddu']
    },
    chinese: {
      main_course: ['Fried Rice', 'Chow Mein', 'Sweet & Sour Chicken', 'Kung Pao Chicken', 'Mapo Tofu', 'Orange Chicken', 'Beef Broccoli'],
      appetizers: ['Spring Rolls', 'Dumplings', 'Wontons', 'Chicken Wings', 'Pot Stickers', 'Crab Rangoon'],
      beverages: ['Green Tea', 'Oolong Tea', 'Fresh Juice', 'Chinese Herbal Tea', 'Bubble Tea'],
      desserts: ['Fortune Cookies', 'Sesame Balls', 'Mango Pudding', 'Red Bean Ice Cream', 'Almond Cookies']
    },
    italian: {
      main_course: ['Pasta Carbonara', 'Margherita Pizza', 'Lasagna', 'Risotto', 'Osso Buco', 'Chicken Parmigiana', 'Fettuccine Alfredo'],
      appetizers: ['Bruschetta', 'Antipasto Platter', 'Caprese Salad', 'Arancini', 'Calamari', 'Prosciutto'],
      beverages: ['Espresso', 'Cappuccino', 'Italian Soda', 'Wine Selection', 'Limoncello', 'Aperol Spritz'],
      desserts: ['Tiramisu', 'Gelato', 'Cannoli', 'Panna Cotta', 'Affogato', 'Biscotti']
    }
  }

  const handleCuisineSelect = (cuisine: string) => {
    setRestaurantData(prev => ({ ...prev, cuisine }))
    
    // Generate menu suggestions
    const suggestions = menuSuggestions[cuisine as keyof typeof menuSuggestions] || menuSuggestions.indian
    setMenuCategories(prev => 
      prev.map(category => ({
        ...category,
        suggestions: suggestions[category.id as keyof typeof suggestions] || []
      }))
    )
  }

  const toggleDishSelection = (categoryId: string, dish: string) => {
    setMenuCategories(prev =>
      prev.map(category => {
        if (category.id === categoryId) {
          const isSelected = category.selected.includes(dish)
          return {
            ...category,
            selected: isSelected 
              ? category.selected.filter(d => d !== dish)
              : [...category.selected, dish]
          }
        }
        return category
      })
    )
  }

  const addCustomDish = (categoryId: string, customDish: string) => {
    if (!customDish.trim()) return
    
    setMenuCategories(prev =>
      prev.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            suggestions: [...category.suggestions, customDish],
            selected: [...category.selected, customDish]
          }
        }
        return category
      })
    )
  }

  const generateRecipes = async () => {
    setIsGenerating(true)
    
    // Simulate RestMan recipe generation
    const allSelectedDishes = menuCategories.flatMap(cat => cat.selected)
    
    // Mock recipe generation with realistic data
    const mockRecipes = allSelectedDishes.map(dish => ({
      name: dish,
      category: menuCategories.find(cat => cat.selected.includes(dish))?.name,
      ingredients: generateMockIngredients(dish),
      instructions: generateMockInstructions(dish),
      prepTime: Math.floor(Math.random() * 60) + 15,
      servings: Math.floor(Math.random() * 8) + 2,
      difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
      estimatedCost: Math.floor(Math.random() * 200) + 50
    }))
    
    setTimeout(() => {
      setGeneratedRecipes(mockRecipes)
      setIsGenerating(false)
      setStep(4)
    }, 3000)
  }

  const generateMockIngredients = (dish: string) => {
    const commonIngredients = {
      'Butter Chicken': [
        { name: 'Chicken (boneless)', quantity: '500g', unit: 'grams' },
        { name: 'Butter', quantity: '50g', unit: 'grams' },
        { name: 'Tomato puree', quantity: '200ml', unit: 'ml' },
        { name: 'Heavy cream', quantity: '100ml', unit: 'ml' },
        { name: 'Onions', quantity: '2', unit: 'pieces' },
        { name: 'Garlic paste', quantity: '1 tbsp', unit: 'tbsp' },
        { name: 'Ginger paste', quantity: '1 tbsp', unit: 'tbsp' },
        { name: 'Garam masala', quantity: '1 tsp', unit: 'tsp' },
        { name: 'Cumin powder', quantity: '1 tsp', unit: 'tsp' }
      ],
      'Biryani': [
        { name: 'Basmati rice', quantity: '2 cups', unit: 'cups' },
        { name: 'Chicken/Mutton', quantity: '500g', unit: 'grams' },
        { name: 'Yogurt', quantity: '1 cup', unit: 'cup' },
        { name: 'Onions (fried)', quantity: '1 cup', unit: 'cup' },
        { name: 'Saffron', quantity: '1 pinch', unit: 'pinch' },
        { name: 'Mint leaves', quantity: '1/2 cup', unit: 'cup' },
        { name: 'Coriander leaves', quantity: '1/2 cup', unit: 'cup' }
      ]
    }
    
    return commonIngredients[dish as keyof typeof commonIngredients] || [
      { name: 'Main ingredient', quantity: '500g', unit: 'grams' },
      { name: 'Spices mix', quantity: '2 tbsp', unit: 'tbsp' },
      { name: 'Oil', quantity: '2 tbsp', unit: 'tbsp' },
      { name: 'Salt', quantity: 'To taste', unit: 'as needed' }
    ]
  }

  const generateMockInstructions = (dish: string) => [
    'Prepare and clean all ingredients',
    'Heat oil in a heavy-bottomed pan',
    'Add spices and sauté until fragrant',
    'Add main ingredients and cook until tender',
    'Season with salt and garnish',
    'Serve hot with accompaniments'
  ]

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold gradient-text">Restaurant Setup</h1>
            <span className="text-sm text-gray-600">Step {step} of 4</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= num 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 4 && (
                  <div className={`w-8 h-1 mx-2 ${
                    step > num ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mobile-container py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Restaurant Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to RestMan!</h2>
                <p className="text-gray-600">Let's set up your restaurant profile</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    value={restaurantData.name}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, name: e.target.value }))}
                    className="mobile-input focus-ring"
                    placeholder="Enter restaurant name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address (Unique ID)</label>
                  <input
                    type="text"
                    value={restaurantData.address}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, address: e.target.value }))}
                    className="mobile-input focus-ring"
                    placeholder="Complete restaurant address"
                  />
                  <p className="text-xs text-gray-500 mt-1">This address will be your unique restaurant identifier</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={restaurantData.phone}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, phone: e.target.value }))}
                    className="mobile-input focus-ring"
                    placeholder="Restaurant contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={restaurantData.email}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, email: e.target.value }))}
                    className="mobile-input focus-ring"
                    placeholder="Restaurant email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                  <input
                    type="text"
                    value={restaurantData.ownerName}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="mobile-input focus-ring"
                    placeholder="Restaurant owner name"
                  />
                </div>
              </div>

              <button
                onClick={nextStep}
                disabled={!restaurantData.name || !restaurantData.address || !restaurantData.ownerName}
                className="btn-premium w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Cuisine Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Cuisine</h2>
                <p className="text-gray-600">Select your restaurant's primary cuisine type</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {cuisineTypes.map((cuisine) => (
                  <motion.button
                    key={cuisine.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCuisineSelect(cuisine.id)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      restaurantData.cuisine === cuisine.id
                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{cuisine.icon}</div>
                    <h3 className="font-semibold text-gray-900">{cuisine.name}</h3>
                  </motion.button>
                ))}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={prevStep}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={nextStep}
                  disabled={!restaurantData.cuisine}
                  className="flex-1 btn-premium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>Generate Menu</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Menu Selection */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Menu</h2>
                <p className="text-gray-600">Choose dishes for your {restaurantData.cuisine} restaurant</p>
              </div>

              {menuCategories.map((category) => (
                <div key={category.id} className="mobile-card">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      {category.selected.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {category.suggestions.map((dish) => (
                      <motion.button
                        key={dish}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleDishSelection(category.id, dish)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          category.selected.includes(dish)
                            ? 'border-orange-500 bg-orange-50 text-orange-800'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                        }`}
                      >
                        {dish}
                        {category.selected.includes(dish) && (
                          <Check className="w-4 h-4 inline ml-2" />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add custom dish..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addCustomDish(category.id, e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex space-x-4">
                <button
                  onClick={prevStep}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={generateRecipes}
                  disabled={menuCategories.every(cat => cat.selected.length === 0)}
                  className="flex-1 btn-premium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>Generate Recipes</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Recipe Review */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {isGenerating ? (
                <div className="text-center py-12">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating RestMan Recipes...</h3>
                  <p className="text-gray-600">Creating personalized recipes for your menu</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review RestMan Recipes</h2>
                    <p className="text-gray-600">Customize ingredients and instructions as needed</p>
                  </div>

                  <div className="space-y-4">
                    {generatedRecipes.map((recipe, index) => (
                      <div key={index} className="mobile-card">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{recipe.name}</h3>
                            <p className="text-sm text-gray-500">{recipe.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{recipe.prepTime} min</p>
                            <p className="text-sm font-bold text-green-600">${recipe.estimatedCost}/serving</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Ingredients (Chef can modify):</h4>
                          <div className="space-y-2">
                            {recipe.ingredients.map((ingredient: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm">{ingredient.name}</span>
                                <span className="text-sm font-medium text-gray-600">
                                  {ingredient.quantity} {ingredient.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                            Approve Recipe
                          </button>
                          <button className="flex-1 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium">
                            Modify Ingredients
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={prevStep}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button className="flex-1 btn-premium flex items-center justify-center space-x-2">
                      <span>Complete Setup</span>
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 