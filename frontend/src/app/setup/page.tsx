'use client'

import { useState, useEffect } from 'react'
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
  X,
  Edit3,
  Save,
  UserPlus,
  Shield,
  Crown,
  UserCheck,
  Clock
} from 'lucide-react'

interface RestaurantData {
  name: string
  address: string
  phone: string
  email: string
  cuisines: string[]
  ownerName: string
}

interface MenuCategory {
  id: string
  name: string
  icon: string
  suggestions: string[]
  selected: string[]
}

interface Recipe {
  id: string
  name: string
  category: string
  ingredients: Ingredient[]
  instructions: string[]
  prepTime: number
  servings: number
  difficulty: string
  estimatedCost: number
  chefApproved: boolean
  chefModified: boolean
}

interface Ingredient {
  name: string
  quantity: string
  unit: string
  isCustom?: boolean
}

interface User {
  id: string
  name: string
  mobile: string
  role: 'owner' | 'manager' | 'chef' | 'waiter'
  createdAt: string
  isActive: boolean
}

export default function RestaurantSetupPage() {
  const [step, setStep] = useState(1)
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    cuisines: [],
    ownerName: ''
  })

  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState({ name: '', mobile: '', role: 'chef' as User['role'] })
  const [isSetupCompleted, setIsSetupCompleted] = useState(false)
  const [customDishInputs, setCustomDishInputs] = useState<{[key: string]: string}>({})

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

  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  // Check if setup is already completed
  useEffect(() => {
    const setupData = localStorage.getItem('restaurantSetup')
    if (setupData) {
      const parsed = JSON.parse(setupData)
      setIsSetupCompleted(parsed.setupCompleted || false)
      if (parsed.restaurantData) {
        setRestaurantData(parsed.restaurantData)
      }
      if (parsed.users) {
        setUsers(parsed.users)
      }
    }
  }, [])

  const cuisineTypes = [
    { id: 'indian', name: 'Indian', icon: '🇮🇳', desc: 'Spicy, flavorful curries & traditional dishes' },
    { id: 'chinese', name: 'Chinese', icon: '🇨🇳', desc: 'Stir-fries, noodles & authentic flavors' },
    { id: 'italian', name: 'Italian', icon: '🇮🇹', desc: 'Pasta, pizza & Mediterranean cuisine' },
    { id: 'mexican', name: 'Mexican', icon: '🇲🇽', desc: 'Tacos, burritos & spicy specialties' },
    { id: 'continental', name: 'Continental', icon: '🍽️', desc: 'Classic European dishes' },
    { id: 'thai', name: 'Thai', icon: '🇹🇭', desc: 'Sweet, sour & spicy Thai favorites' },
    { id: 'american', name: 'American', icon: '🇺🇸', desc: 'Burgers, steaks & classic American food' },
    { id: 'indo_chinese', name: 'Indo-Chinese', icon: '🥢', desc: 'Fusion of Indian and Chinese flavors' }
  ]

  // Enhanced RestMan menu suggestions based on cuisines
  const menuSuggestions: { [key: string]: { [key: string]: string[] } } = {
    indian: {
      main_course: [
        'Butter Chicken', 'Chicken Biryani', 'Dal Makhani', 'Paneer Tikka Masala', 
        'Chicken Curry', 'Palak Paneer', 'Rogan Josh', 'Chole Bhature',
        'Fish Curry', 'Mutton Korma', 'Kadai Chicken', 'Rajma Rice'
      ],
      appetizers: [
        'Samosa', 'Pakora', 'Paneer Tikka', 'Chicken 65', 'Aloo Tikki', 
        'Seekh Kebab', 'Papadum', 'Dhokla', 'Chaat', 'Spring Rolls'
      ],
      beverages: [
        'Masala Chai', 'Sweet Lassi', 'Mango Lassi', 'Fresh Lime Soda', 
        'Buttermilk', 'Filter Coffee', 'Kulfi Shake', 'Thandai'
      ],
      desserts: [
        'Gulab Jamun', 'Rasgulla', 'Rice Kheer', 'Kulfi', 'Jalebi', 
        'Gajar Halwa', 'Ras Malai', 'Laddu', 'Barfi'
      ]
    },
    chinese: {
      main_course: [
        'Chicken Fried Rice', 'Veg Chow Mein', 'Sweet & Sour Chicken', 
        'Kung Pao Chicken', 'Manchurian', 'Szechuan Chicken', 'Hakka Noodles'
      ],
      appetizers: [
        'Spring Rolls', 'Chicken Momos', 'Veg Momos', 'Chicken Wings', 
        'Crispy Honey Chilli Potato', 'Chicken Lollipop'
      ],
      beverages: [
        'Green Tea', 'Iced Tea', 'Fresh Juice', 'Chinese Herbal Tea', 'Hot & Sour Soup'
      ],
      desserts: [
        'Honey Noodles', 'Date Pancakes', 'Sesame Balls', 'Fortune Cookies'
      ]
    },
    american: {
      main_course: [
        'Cheeseburger', 'BBQ Ribs', 'Grilled Chicken', 'Mac & Cheese', 
        'Buffalo Wings', 'Pulled Pork Sandwich', 'Steak', 'Fish & Chips'
      ],
      appetizers: [
        'Mozzarella Sticks', 'Onion Rings', 'Chicken Wings', 'Nachos', 
        'Loaded Potato Skins', 'Jalapeno Poppers'
      ],
      beverages: [
        'Coca Cola', 'Root Beer', 'Iced Tea', 'Lemonade', 'Milkshake', 'Coffee'
      ],
      desserts: [
        'Apple Pie', 'Cheesecake', 'Brownies', 'Ice Cream Sundae', 'Donuts'
      ]
    },
    indo_chinese: {
      main_course: [
        'Chicken Manchurian', 'Gobi Manchurian', 'Chilli Chicken', 'Chicken Lollipop',
        'Szechuan Fried Rice', 'Chicken 65', 'Honey Chilli Potato'
      ],
      appetizers: [
        'Chicken Lollipop', 'Veg Spring Rolls', 'Chicken Spring Rolls', 
        'Honey Chilli Cauliflower', 'Chilli Paneer'
      ],
      beverages: [
        'Hot & Sour Soup', 'Sweet Corn Soup', 'Green Tea', 'Iced Tea'
      ],
      desserts: [
        'Date Pancakes', 'Honey Noodles', 'Fried Ice Cream'
      ]
    },
    italian: {
      main_course: [
        'Pasta Carbonara', 'Margherita Pizza', 'Chicken Alfredo', 'Lasagna', 
        'Risotto', 'Penne Arrabbiata', 'Spaghetti Bolognese'
      ],
      appetizers: [
        'Bruschetta', 'Garlic Bread', 'Caprese Salad', 'Antipasto Platter', 
        'Arancini', 'Calamari Rings'
      ],
      beverages: [
        'Espresso', 'Cappuccino', 'Italian Soda', 'Lemonade', 'Iced Coffee'
      ],
      desserts: [
        'Tiramisu', 'Gelato', 'Cannoli', 'Panna Cotta', 'Affogato'
      ]
    }
  }

  const getMenuSuggestions = (cuisines: string[]) => {
    const suggestions = {
      indian: {
        main_course: [
          'Butter Chicken', 'Chicken Biryani', 'Dal Makhani', 'Paneer Tikka Masala', 
          'Chicken Curry', 'Palak Paneer', 'Rogan Josh', 'Chole Bhature',
          'Fish Curry', 'Mutton Korma', 'Kadai Chicken', 'Rajma Rice'
        ],
        appetizers: [
          'Samosa', 'Pakora', 'Paneer Tikka', 'Chicken 65', 'Aloo Tikki', 
          'Seekh Kebab', 'Papadum', 'Dhokla', 'Chaat', 'Spring Rolls'
        ],
        beverages: [
          'Masala Chai', 'Sweet Lassi', 'Mango Lassi', 'Fresh Lime Soda', 
          'Buttermilk', 'Filter Coffee', 'Kulfi Shake', 'Thandai'
        ],
        desserts: [
          'Gulab Jamun', 'Rasgulla', 'Rice Kheer', 'Kulfi', 'Jalebi', 
          'Gajar Halwa', 'Ras Malai', 'Laddu', 'Barfi'
        ]
      },
      chinese: {
        main_course: [
          'Chicken Fried Rice', 'Veg Chow Mein', 'Sweet & Sour Chicken', 
          'Kung Pao Chicken', 'Manchurian', 'Szechuan Chicken', 'Hakka Noodles'
        ],
        appetizers: [
          'Spring Rolls', 'Chicken Momos', 'Veg Momos', 'Chicken Wings', 
          'Crispy Honey Chilli Potato', 'Chicken Lollipop'
        ],
        beverages: [
          'Green Tea', 'Iced Tea', 'Fresh Juice', 'Chinese Herbal Tea', 'Hot & Sour Soup'
        ],
        desserts: [
          'Honey Noodles', 'Date Pancakes', 'Sesame Balls', 'Fortune Cookies'
        ]
      },
      american: {
        main_course: [
          'Cheeseburger', 'BBQ Ribs', 'Grilled Chicken', 'Mac & Cheese', 
          'Buffalo Wings', 'Pulled Pork Sandwich', 'Steak', 'Fish & Chips'
        ],
        appetizers: [
          'Mozzarella Sticks', 'Onion Rings', 'Chicken Wings', 'Nachos', 
          'Loaded Potato Skins', 'Jalapeno Poppers'
        ],
        beverages: [
          'Coca Cola', 'Root Beer', 'Iced Tea', 'Lemonade', 'Milkshake', 'Coffee'
        ],
        desserts: [
          'Apple Pie', 'Cheesecake', 'Brownies', 'Ice Cream Sundae', 'Donuts'
        ]
      },
      indo_chinese: {
        main_course: [
          'Chicken Manchurian', 'Gobi Manchurian', 'Chilli Chicken', 'Chicken Lollipop',
          'Szechuan Fried Rice', 'Chicken 65', 'Honey Chilli Potato'
        ],
        appetizers: [
          'Chicken Lollipop', 'Veg Spring Rolls', 'Chicken Spring Rolls', 
          'Honey Chilli Cauliflower', 'Chilli Paneer'
        ],
        beverages: [
          'Hot & Sour Soup', 'Sweet Corn Soup', 'Green Tea', 'Iced Tea'
        ],
        desserts: [
          'Date Pancakes', 'Honey Noodles', 'Fried Ice Cream'
        ]
      },
      italian: {
        main_course: [
          'Pasta Carbonara', 'Margherita Pizza', 'Chicken Alfredo', 'Lasagna', 
          'Risotto', 'Penne Arrabbiata', 'Spaghetti Bolognese'
        ],
        appetizers: [
          'Bruschetta', 'Garlic Bread', 'Caprese Salad', 'Antipasto Platter', 
          'Arancini', 'Calamari Rings'
        ],
        beverages: [
          'Espresso', 'Cappuccino', 'Italian Soda', 'Lemonade', 'Iced Coffee'
        ],
        desserts: [
          'Tiramisu', 'Gelato', 'Cannoli', 'Panna Cotta', 'Affogato'
        ]
      }
    }
    
    // Combine suggestions from all selected cuisines
    const combinedSuggestions = {
      main_course: [] as string[],
      appetizers: [] as string[],
      beverages: [] as string[],
      desserts: [] as string[]
    }

    cuisines.forEach(cuisine => {
      const cuisineSuggestions = suggestions[cuisine as keyof typeof suggestions]
      if (cuisineSuggestions) {
        Object.keys(combinedSuggestions).forEach(category => {
          combinedSuggestions[category as keyof typeof combinedSuggestions].push(
            ...cuisineSuggestions[category as keyof typeof cuisineSuggestions]
          )
        })
      }
    })

    // Remove duplicates
    Object.keys(combinedSuggestions).forEach(category => {
      const categoryKey = category as keyof typeof combinedSuggestions
      const uniqueItems = Array.from(new Set(combinedSuggestions[categoryKey]))
      combinedSuggestions[categoryKey] = uniqueItems
    })

    return combinedSuggestions
  }

  const handleCuisineToggle = (cuisine: string) => {
    setRestaurantData(prev => {
      const newCuisines = prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
      
      // Update menu suggestions when cuisines change
      const suggestions = getMenuSuggestions(newCuisines)
      setMenuCategories(prevCategories => 
        prevCategories.map(category => ({
          ...category,
          suggestions: suggestions[category.id as keyof typeof suggestions] || []
        }))
      )
      
      return { ...prev, cuisines: newCuisines }
    })
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

  const addCustomDish = (categoryId: string) => {
    const customDish = customDishInputs[categoryId]?.trim()
    if (!customDish) return
    
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
    
    // Clear the input
    setCustomDishInputs(prev => ({ ...prev, [categoryId]: '' }))
  }

  const addUser = () => {
    if (!newUser.name.trim() || !newUser.mobile.trim()) return
    
    const user: User = {
      id: `user_${Date.now()}`,
      name: newUser.name.trim(),
      mobile: newUser.mobile.trim(),
      role: newUser.role,
      createdAt: new Date().toISOString(),
      isActive: true
    }
    
    setUsers(prev => [...prev, user])
    setNewUser({ name: '', mobile: '', role: 'chef' })
  }

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  const generateRecipes = async () => {
    setIsGenerating(true)
    
    // Get all selected dishes
    const allSelectedDishes = menuCategories.flatMap(cat => 
      cat.selected.map(dish => ({
        name: dish,
        category: cat.name,
        categoryId: cat.id
      }))
    )
    
    // Simulate RestMan recipe generation with realistic data
    const recipes = allSelectedDishes.map((dish, index) => ({
      id: `recipe_${index}`,
      name: dish.name,
      category: dish.category,
      ingredients: generateMockIngredients(dish.name, restaurantData.cuisines),
      instructions: generateMockInstructions(dish.name),
      prepTime: Math.floor(Math.random() * 60) + 15,
      servings: Math.floor(Math.random() * 8) + 2,
      difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
      estimatedCost: Math.floor(Math.random() * 200) + 50,
      chefApproved: false,
      chefModified: false
    }))
    
    // Simulate API delay
    setTimeout(() => {
      setGeneratedRecipes(recipes)
      setIsGenerating(false)
      setStep(4)
    }, 3000)
  }

  const generateMockIngredients = (dish: string, cuisines: string[]): Ingredient[] => {
    const recipeIngredients: { [key: string]: Ingredient[] } = {
      // Indian Main Course
      'Butter Chicken': [
        { name: 'Chicken (boneless)', quantity: '500', unit: 'grams' },
        { name: 'Butter', quantity: '50', unit: 'grams' },
        { name: 'Tomato puree', quantity: '200', unit: 'ml' },
        { name: 'Heavy cream', quantity: '100', unit: 'ml' },
        { name: 'Onions', quantity: '2', unit: 'pieces' },
        { name: 'Garlic paste', quantity: '1', unit: 'tbsp' },
        { name: 'Ginger paste', quantity: '1', unit: 'tbsp' },
        { name: 'Garam masala', quantity: '1', unit: 'tsp' },
        { name: 'Kasuri methi', quantity: '1', unit: 'tsp' },
        { name: 'Salt', quantity: 'To taste', unit: 'as needed' }
      ],
      'Chicken Biryani': [
        { name: 'Basmati rice', quantity: '2', unit: 'cups' },
        { name: 'Chicken', quantity: '500', unit: 'grams' },
        { name: 'Yogurt', quantity: '1', unit: 'cup' },
        { name: 'Onions (fried)', quantity: '1', unit: 'cup' },
        { name: 'Saffron', quantity: '1', unit: 'pinch' },
        { name: 'Mint leaves', quantity: '1/2', unit: 'cup' },
        { name: 'Whole spices', quantity: '2', unit: 'tbsp' },
        { name: 'Ghee', quantity: '3', unit: 'tbsp' }
      ],
      'Dal Makhani': [
        { name: 'Black lentils', quantity: '1', unit: 'cup' },
        { name: 'Kidney beans', quantity: '1/4', unit: 'cup' },
        { name: 'Butter', quantity: '4', unit: 'tbsp' },
        { name: 'Heavy cream', quantity: '1/2', unit: 'cup' },
        { name: 'Tomato puree', quantity: '1', unit: 'cup' },
        { name: 'Ginger-garlic paste', quantity: '2', unit: 'tbsp' },
        { name: 'Spices', quantity: '2', unit: 'tbsp' }
      ],
      // Indian Desserts
      'Gulab Jamun': [
        { name: 'Milk powder', quantity: '1', unit: 'cup' },
        { name: 'All-purpose flour', quantity: '3', unit: 'tbsp' },
        { name: 'Baking soda', quantity: '1/4', unit: 'tsp' },
        { name: 'Milk', quantity: '3', unit: 'tbsp' },
        { name: 'Sugar', quantity: '2', unit: 'cups' },
        { name: 'Water', quantity: '2', unit: 'cups' },
        { name: 'Cardamom powder', quantity: '1/2', unit: 'tsp' },
        { name: 'Rose water', quantity: '1', unit: 'tsp' },
        { name: 'Ghee (for frying)', quantity: '2', unit: 'cups' }
      ],
      'Rice Kheer': [
        { name: 'Rice', quantity: '1/4', unit: 'cup' },
        { name: 'Milk', quantity: '1', unit: 'liter' },
        { name: 'Sugar', quantity: '1/2', unit: 'cup' },
        { name: 'Cardamom powder', quantity: '1/2', unit: 'tsp' },
        { name: 'Almonds (sliced)', quantity: '2', unit: 'tbsp' },
        { name: 'Cashews', quantity: '2', unit: 'tbsp' },
        { name: 'Raisins', quantity: '1', unit: 'tbsp' },
        { name: 'Saffron', quantity: '1', unit: 'pinch' }
      ],
      'Kheer': [
        { name: 'Rice', quantity: '1/4', unit: 'cup' },
        { name: 'Milk', quantity: '1', unit: 'liter' },
        { name: 'Sugar', quantity: '1/2', unit: 'cup' },
        { name: 'Cardamom powder', quantity: '1/2', unit: 'tsp' },
        { name: 'Almonds (sliced)', quantity: '2', unit: 'tbsp' },
        { name: 'Cashews', quantity: '2', unit: 'tbsp' },
        { name: 'Raisins', quantity: '1', unit: 'tbsp' },
        { name: 'Saffron', quantity: '1', unit: 'pinch' }
      ],
      // Chinese Main Course
      'Chicken Fried Rice': [
        { name: 'Cooked rice', quantity: '3', unit: 'cups' },
        { name: 'Chicken (diced)', quantity: '200', unit: 'grams' },
        { name: 'Eggs', quantity: '2', unit: 'pieces' },
        { name: 'Spring onions', quantity: '1/2', unit: 'cup' },
        { name: 'Carrots (diced)', quantity: '1/4', unit: 'cup' },
        { name: 'Soy sauce', quantity: '2', unit: 'tbsp' },
        { name: 'Sesame oil', quantity: '1', unit: 'tsp' },
        { name: 'Garlic (minced)', quantity: '1', unit: 'tbsp' }
      ],
      'Veg Chow Mein': [
        { name: 'Noodles', quantity: '200', unit: 'grams' },
        { name: 'Mixed vegetables', quantity: '2', unit: 'cups' },
        { name: 'Soy sauce', quantity: '2', unit: 'tbsp' },
        { name: 'Vinegar', quantity: '1', unit: 'tbsp' },
        { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
        { name: 'Spring onions', quantity: '1/2', unit: 'cup' },
        { name: 'Oil', quantity: '3', unit: 'tbsp' }
      ],
      // Beverages
      'Masala Chai': [
        { name: 'Tea leaves', quantity: '2', unit: 'tsp' },
        { name: 'Milk', quantity: '1', unit: 'cup' },
        { name: 'Water', quantity: '1', unit: 'cup' },
        { name: 'Sugar', quantity: '2', unit: 'tsp' },
        { name: 'Ginger', quantity: '1', unit: 'inch' },
        { name: 'Cardamom', quantity: '2', unit: 'pods' },
        { name: 'Cinnamon', quantity: '1', unit: 'small stick' }
      ],
      'Mango Lassi': [
        { name: 'Mango pulp', quantity: '1', unit: 'cup' },
        { name: 'Yogurt', quantity: '1', unit: 'cup' },
        { name: 'Sugar', quantity: '2', unit: 'tbsp' },
        { name: 'Cardamom powder', quantity: '1/4', unit: 'tsp' },
        { name: 'Ice cubes', quantity: '4-5', unit: 'pieces' }
      ]
    }
    
    // Return specific ingredients if available
    if (recipeIngredients[dish]) {
      return recipeIngredients[dish]
    }
    
    // Category-based generic ingredients
    const dishLower = dish.toLowerCase()
    
    // Desserts - no onions!
    if (dishLower.includes('kheer') || dishLower.includes('halwa') || dishLower.includes('jamun') || 
        dishLower.includes('pudding') || dishLower.includes('cake') || dishLower.includes('ice cream')) {
      return [
        { name: 'Main ingredient', quantity: '1', unit: 'cup' },
        { name: 'Milk/Cream', quantity: '500', unit: 'ml' },
        { name: 'Sugar', quantity: '1/2', unit: 'cup' },
        { name: 'Cardamom powder', quantity: '1/2', unit: 'tsp' },
        { name: 'Nuts (mixed)', quantity: '2', unit: 'tbsp' }
      ]
    }
    
    // Beverages
    if (dishLower.includes('tea') || dishLower.includes('coffee') || dishLower.includes('lassi') || 
        dishLower.includes('juice') || dishLower.includes('shake')) {
      return [
        { name: 'Main ingredient', quantity: '2', unit: 'cups' },
        { name: 'Sugar/Sweetener', quantity: '2', unit: 'tbsp' },
        { name: 'Flavoring', quantity: '1', unit: 'tsp' },
        { name: 'Ice/Water', quantity: 'As needed', unit: 'as needed' }
      ]
    }
    
    // Generic main course
    return [
      { name: 'Main ingredient', quantity: '500', unit: 'grams' },
      { name: 'Onions', quantity: '2', unit: 'pieces' },
      { name: 'Tomatoes', quantity: '2', unit: 'pieces' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Oil/Ghee', quantity: '2', unit: 'tbsp' },
      { name: 'Spices', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'To taste', unit: 'as needed' }
    ]
  }

  const generateMockInstructions = (dish: string): string[] => [
    'Prepare and clean all ingredients',
    'Heat oil/ghee in a heavy-bottomed pan',
    'Add whole spices and let them splutter',
    'Add onions and cook until golden brown',
    'Add ginger-garlic paste and sauté',
    'Add main ingredients and spice powders',
    'Cook on medium heat until tender',
    'Adjust seasoning and garnish',
    'Serve hot with accompaniments'
  ]

  const updateRecipeIngredient = (recipeId: string, ingredientIndex: number, field: keyof Ingredient, value: string) => {
    setGeneratedRecipes(prev =>
      prev.map(recipe => {
        if (recipe.id === recipeId) {
          const updatedIngredients = [...recipe.ingredients]
          updatedIngredients[ingredientIndex] = {
            ...updatedIngredients[ingredientIndex],
            [field]: value
          }
          return {
            ...recipe,
            ingredients: updatedIngredients,
            chefModified: true
          }
        }
        return recipe
      })
    )
  }

  const addIngredientToRecipe = (recipeId: string) => {
    setGeneratedRecipes(prev =>
      prev.map(recipe => {
        if (recipe.id === recipeId) {
          return {
            ...recipe,
            ingredients: [
              ...recipe.ingredients,
              { name: '', quantity: '', unit: 'grams', isCustom: true }
            ],
            chefModified: true
          }
        }
        return recipe
      })
    )
  }

  const approveRecipe = (recipeId: string) => {
    setGeneratedRecipes(prev =>
      prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, chefApproved: true }
          : recipe
      )
    )
  }

  const nextStep = () => {
    if (step < 5) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const getTotalSelectedDishes = () => {
    return menuCategories.reduce((total, cat) => total + cat.selected.length, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Progress Bar */}
      <div className="glass border-b border-white/20 shadow-xl safe-area-top">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold gradient-text">Restaurant Setup</h1>
            <span className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full">
              Step {step} of 5
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex items-center">
                <button
                  onClick={() => isSetupCompleted ? setStep(num) : null}
                  disabled={!isSetupCompleted && num > step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= num 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                      : 'bg-white/50 text-gray-500'
                  } ${isSetupCompleted ? 'hover:scale-110 cursor-pointer' : ''} ${!isSetupCompleted && num > step ? 'cursor-not-allowed' : ''}`}
                >
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </button>
                {num < 5 && (
                  <div className={`w-8 h-1 mx-2 rounded-full transition-all duration-300 ${
                    step > num ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {isSetupCompleted && (
            <p className="text-xs text-orange-600 mt-2 font-medium">
              ✨ Setup completed! Click any step number to jump directly to it
            </p>
          )}
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
              className="space-y-6 px-4 sm:px-6 lg:px-8"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Utensils className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to RestMan!</h2>
                <p className="text-gray-600 text-lg">Let's set up your restaurant profile</p>
              </div>

              <div className="space-y-5">
                <div className="mobile-card">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant Name *</label>
                  <input
                    type="text"
                    value={restaurantData.name}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, name: e.target.value }))}
                    className="mobile-input focus-ring"
                    placeholder="Enter your restaurant name"
                  />
                </div>

                <div className="mobile-card">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Address (Unique ID) *</label>
                  <textarea
                    value={restaurantData.address}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, address: e.target.value }))}
                    className="mobile-input focus-ring resize-none"
                    rows={3}
                    placeholder="Complete restaurant address with area, city, state, pincode"
                  />
                  <p className="text-xs text-orange-600 mt-2 font-medium">
                    📍 This address will be your unique restaurant identifier
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mobile-card">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={restaurantData.phone}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mobile-input focus-ring"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="mobile-card">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={restaurantData.email}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, email: e.target.value }))}
                      className="mobile-input focus-ring"
                      placeholder="restaurant@example.com"
                    />
                  </div>
                </div>

                <div className="mobile-card">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Name *</label>
                  <input
                    type="text"
                    value={restaurantData.ownerName}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="mobile-input focus-ring"
                    placeholder="Restaurant owner full name"
                  />
                </div>
              </div>

              <button
                onClick={nextStep}
                disabled={!restaurantData.name || !restaurantData.address || !restaurantData.ownerName}
                className="btn-premium w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg"
              >
                <span>Continue Setup</span>
                <ArrowRight className="w-5 h-5" />
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
              className="space-y-6 px-4 sm:px-6 lg:px-8"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <ChefHat className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Cuisine</h2>
                <p className="text-gray-600 text-lg">Select your restaurant's primary cuisine type</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cuisineTypes.map((cuisine) => (
                  <motion.button
                    key={cuisine.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCuisineToggle(cuisine.id)}
                    className={`p-6 rounded-3xl border-2 transition-all duration-300 text-left ${
                      restaurantData.cuisines.includes(cuisine.id)
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-xl'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-5xl">{cuisine.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">{cuisine.name}</h3>
                        <p className="text-sm text-gray-600">{cuisine.desc}</p>
                      </div>
                      {restaurantData.cuisines.includes(cuisine.id) && (
                        <Check className="w-6 h-6 text-orange-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={prevStep}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 font-semibold"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={nextStep}
                  disabled={restaurantData.cuisines.length === 0}
                  className="flex-1 btn-premium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 py-4 text-lg"
                >
                  <span>Generate Smart Menu</span>
                  <Sparkles className="w-5 h-5" />
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
              className="space-y-6 px-4 sm:px-6 lg:px-8"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Smart Menu Selection</h2>
                <p className="text-gray-600 text-lg">RestMan-curated {restaurantData.cuisines.join(', ')} menu items</p>
                <div className="mt-3 inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
                  <span className="font-bold">{getTotalSelectedDishes()}</span>
                  <span>dishes selected</span>
                </div>
              </div>

              {menuCategories.map((category) => (
                <div key={category.id} className="mobile-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">Choose from RestMan suggestions</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-3 py-2 rounded-full text-sm font-bold">
                      {category.selected.length} selected
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {category.suggestions.map((dish) => (
                      <motion.button
                        key={dish}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleDishSelection(category.id, dish)}
                        className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                          category.selected.includes(dish)
                            ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 text-orange-800 shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{dish}</span>
                          {category.selected.includes(dish) && (
                            <Check className="w-4 h-4 ml-2 text-orange-600" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex space-x-3 pt-3 border-t border-gray-100">
                    <input
                      type="text"
                      value={customDishInputs[category.id] || ''}
                      onChange={(e) => setCustomDishInputs(prev => ({ ...prev, [category.id]: e.target.value }))}
                      placeholder="Add your custom dish..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addCustomDish(category.id)
                        }
                      }}
                    />
                    <button 
                      onClick={() => addCustomDish(category.id)}
                      className="px-4 py-3 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-xl hover:from-orange-200 hover:to-red-200 transition-all font-medium"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex space-x-4">
                <button
                  onClick={prevStep}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 font-semibold"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={generateRecipes}
                  disabled={getTotalSelectedDishes() === 0}
                  className="flex-1 btn-premium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 py-4 text-lg"
                >
                  <span>Generate RestMan Recipes</span>
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Recipe Review & Chef Finalization */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 px-4 sm:px-6 lg:px-8"
            >
              {isGenerating ? (
                <div className="text-center py-16">
                  <div className="loading-spinner mx-auto mb-6"></div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Generating RestMan Recipes...</h3>
                  <p className="text-gray-600 text-lg">Creating personalized recipes for your {restaurantData.cuisines.join(', ')} menu</p>
                  <div className="mt-6 text-sm text-orange-600">
                    ⚡ Analyzing ingredients, cooking methods, and cost optimization
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                      <ChefHat className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Chef Recipe Finalization</h2>
                    <p className="text-gray-600 text-lg">Review and customize RestMan-generated recipes</p>
                    <div className="mt-3 text-sm text-orange-600 font-medium">
                      Chef can modify ingredients • Owner gets notified of changes
                    </div>
                  </div>

                  <div className="space-y-6">
                    {generatedRecipes.map((recipe, index) => (
                      <div key={recipe.id} className="mobile-card">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900">{recipe.name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {recipe.category}
                              </span>
                              <span className="text-sm text-gray-600">{recipe.prepTime} min</span>
                              <span className="text-sm font-bold text-green-600">${recipe.estimatedCost}/serving</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {recipe.chefModified && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                Modified
                              </span>
                            )}
                            {recipe.chefApproved && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Approved
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-800">Ingredients (Chef can modify):</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                💡 <strong>Edit:</strong> Quick inline changes • <strong>Modify:</strong> Full ingredient management
                              </p>
                            </div>
                            <button
                              onClick={() => setEditingRecipe(editingRecipe === recipe.id ? null : recipe.id)}
                              className="text-orange-600 hover:text-orange-700 flex items-center space-x-1 text-sm font-medium"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>{editingRecipe === recipe.id ? 'Save' : 'Edit'}</span>
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {recipe.ingredients.map((ingredient, idx) => (
                              <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                {editingRecipe === recipe.id ? (
                                  <>
                                    <input
                                      type="text"
                                      value={ingredient.name}
                                      onChange={(e) => updateRecipeIngredient(recipe.id, idx, 'name', e.target.value)}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="Ingredient name"
                                    />
                                    <input
                                      type="text"
                                      value={ingredient.quantity}
                                      onChange={(e) => updateRecipeIngredient(recipe.id, idx, 'quantity', e.target.value)}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="Qty"
                                    />
                                    <select
                                      value={ingredient.unit}
                                      onChange={(e) => updateRecipeIngredient(recipe.id, idx, 'unit', e.target.value)}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      <option value="grams">grams</option>
                                      <option value="kg">kg</option>
                                      <option value="ml">ml</option>
                                      <option value="liter">liter</option>
                                      <option value="pieces">pieces</option>
                                      <option value="cups">cups</option>
                                      <option value="tbsp">tbsp</option>
                                      <option value="tsp">tsp</option>
                                      <option value="as needed">as needed</option>
                                    </select>
                                  </>
                                ) : (
                                  <>
                                    <span className="flex-1 text-sm font-medium">{ingredient.name}</span>
                                    <span className="text-sm text-gray-600">
                                      {ingredient.quantity} {ingredient.unit}
                                    </span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>

                          {editingRecipe === recipe.id && (
                            <button
                              onClick={() => addIngredientToRecipe(recipe.id)}
                              className="mt-2 w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-orange-300 hover:text-orange-600 transition-colors flex items-center justify-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Custom Ingredient</span>
                            </button>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => approveRecipe(recipe.id)}
                            disabled={recipe.chefApproved}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                              recipe.chefApproved
                                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {recipe.chefApproved ? '✓ Approved' : 'Approve Recipe'}
                          </button>
                          <button
                            onClick={() => setEditingRecipe(editingRecipe === recipe.id ? null : recipe.id)}
                            className="flex-1 px-4 py-3 bg-orange-100 text-orange-800 rounded-xl hover:bg-orange-200 transition-colors font-semibold"
                          >
                            {editingRecipe === recipe.id ? 'Save Changes' : 'Modify Ingredients'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={prevStep}
                      className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 font-semibold"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Back to Menu</span>
                    </button>
                    <button 
                      className="flex-1 btn-premium flex items-center justify-center space-x-2 py-4 text-lg"
                      onClick={nextStep}
                    >
                      <span>Setup Users</span>
                      <Users className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 5: User Management */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 px-4 sm:px-6 lg:px-8"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
                <p className="text-gray-600 text-lg">Add staff members with role-based access</p>
                <div className="mt-3 text-sm text-orange-600 font-medium">
                  Only Owner can add users • Different roles have different access levels
                </div>
              </div>

              {/* Role Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="mobile-card">
                  <div className="flex items-center space-x-3 mb-3">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    <div>
                      <h3 className="font-bold text-gray-900">Owner</h3>
                      <p className="text-xs text-gray-600">Full Access</p>
                    </div>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• All system alerts</li>
                    <li>• User management</li>
                    <li>• Financial reports</li>
                    <li>• Complete control</li>
                  </ul>
                </div>

                <div className="mobile-card">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="font-bold text-gray-900">Manager</h3>
                      <p className="text-xs text-gray-600">Operations</p>
                    </div>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Daily operations alerts</li>
                    <li>• Staff scheduling</li>
                    <li>• Customer feedback</li>
                    <li>• Performance reports</li>
                  </ul>
                </div>

                <div className="mobile-card">
                  <div className="flex items-center space-x-3 mb-3">
                    <ChefHat className="w-8 h-8 text-orange-500" />
                    <div>
                      <h3 className="font-bold text-gray-900">Chef</h3>
                      <p className="text-xs text-gray-600">Kitchen Only</p>
                    </div>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Inventory alerts</li>
                    <li>• Recipe management</li>
                    <li>• Usage tracking</li>
                    <li>• Kitchen notifications</li>
                  </ul>
                </div>

                <div className="mobile-card">
                  <div className="flex items-center space-x-3 mb-3">
                    <UserCheck className="w-8 h-8 text-purple-500" />
                    <div>
                      <h3 className="font-bold text-gray-900">Waiter</h3>
                      <p className="text-xs text-gray-600">Service</p>
                    </div>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Table management</li>
                    <li>• Order taking</li>
                    <li>• Customer service</li>
                    <li>• Billing system</li>
                  </ul>
                </div>
              </div>

              {/* Add User Form */}
              <div className="mobile-card">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Add New User</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      className="mobile-input focus-ring"
                      placeholder="Enter staff member's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number *</label>
                    <input
                      type="tel"
                      value={newUser.mobile}
                      onChange={(e) => setNewUser(prev => ({ ...prev, mobile: e.target.value }))}
                      className="mobile-input focus-ring"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                      className="mobile-input focus-ring"
                    >
                      <option value="chef">Chef - Kitchen & Inventory Access</option>
                      <option value="waiter">Waiter - Table & Customer Service</option>
                      <option value="manager">Manager - Operations & Reports</option>
                      <option value="owner">Owner - Full System Access</option>
                    </select>
                  </div>

                  <button
                    onClick={addUser}
                    disabled={!newUser.name.trim() || !newUser.mobile.trim()}
                    className="w-full btn-premium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 py-3"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              {/* Users List */}
              {users.length > 0 && (
                <div className="mobile-card">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Added Users ({users.length})</h3>
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            {user.role === 'owner' && <Crown className="w-5 h-5 text-white" />}
                            {user.role === 'manager' && <Shield className="w-5 h-5 text-white" />}
                            {user.role === 'chef' && <ChefHat className="w-5 h-5 text-white" />}
                            {user.role === 'waiter' && <UserCheck className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.mobile} • {user.role}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeUser(user.id)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-6">
                <button
                  onClick={prevStep}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 font-semibold"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Recipes</span>
                </button>
                <button 
                  className="flex-1 btn-premium flex items-center justify-center space-x-2 py-4 text-lg"
                  onClick={() => {
                    // Save setup data and navigate to dashboard
                    localStorage.setItem('restaurantSetup', JSON.stringify({
                      restaurantData,
                      users,
                      generatedRecipes,
                      setupCompleted: true,
                      setupDate: new Date().toISOString()
                    }))
                    window.location.href = '/'
                  }}
                >
                  <span>Complete Setup</span>
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 