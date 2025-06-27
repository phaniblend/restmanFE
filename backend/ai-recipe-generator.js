// AI Recipe Generator for RestMan
// This module generates initial recipes based on menu items
// Chefs can then customize these recipes according to their preferences

const { createClient } = require('@supabase/supabase-js');

class AIRecipeGenerator {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Base recipe knowledge for Indian cuisine
    this.recipeDatabase = {
      'RICE': {
        'Fried Rice': {
          base_ingredients: ['rice', 'oil', 'onion', 'garlic', 'soy_sauce', 'vegetables'],
          estimated_quantities: { rice: 1, oil: 0.05, onion: 0.1, garlic: 0.02, vegetables: 0.3 },
          prep_time: 15,
          cook_time: 20,
          difficulty: 'EASY',
          estimated_cost_per_serving: 45
        },
        'Biryani': {
          base_ingredients: ['rice', 'meat', 'onion', 'yogurt', 'spices', 'ghee'],
          estimated_quantities: { rice: 1, meat: 0.8, onion: 0.2, yogurt: 0.1, spices: 0.05, ghee: 0.03 },
          prep_time: 45,
          cook_time: 60,
          difficulty: 'HARD',
          estimated_cost_per_serving: 120
        }
      },
      'CURRY': {
        'Chicken Curry': {
          base_ingredients: ['chicken', 'onion', 'tomato', 'ginger_garlic', 'spices', 'oil'],
          estimated_quantities: { chicken: 0.8, onion: 0.15, tomato: 0.2, ginger_garlic: 0.02, spices: 0.03, oil: 0.04 },
          prep_time: 20,
          cook_time: 35,
          difficulty: 'MEDIUM',
          estimated_cost_per_serving: 95
        },
        'Dal Curry': {
          base_ingredients: ['lentils', 'onion', 'tomato', 'turmeric', 'oil', 'garlic'],
          estimated_quantities: { lentils: 0.6, onion: 0.1, tomato: 0.15, turmeric: 0.005, oil: 0.02, garlic: 0.01 },
          prep_time: 10,
          cook_time: 25,
          difficulty: 'EASY',
          estimated_cost_per_serving: 35
        }
      },
      'SNACKS': {
        'Samosa': {
          base_ingredients: ['flour', 'potato', 'peas', 'spices', 'oil'],
          estimated_quantities: { flour: 0.1, potato: 0.3, peas: 0.1, spices: 0.02, oil: 0.05 },
          prep_time: 30,
          cook_time: 15,
          difficulty: 'MEDIUM',
          estimated_cost_per_serving: 25
        }
      }
    };
  }

  // Generate recipe suggestion based on menu item
  async generateRecipe(menuItem, cuisineType = 'INDIAN', restaurantId) {
    try {
      const suggestion = this.findBestMatch(menuItem, cuisineType);
      
      if (!suggestion) {
        // Fallback to basic recipe structure
        return this.generateBasicRecipe(menuItem, cuisineType);
      }

      // Get available groceries for the restaurant
      const { data: groceries } = await this.supabase
        .from('groceries')
        .select('*')
        .eq('restaurant_id', restaurantId);

      // Map suggested ingredients to available groceries
      const mappedIngredients = this.mapIngredientsToGroceries(
        suggestion.base_ingredients,
        suggestion.estimated_quantities,
        groceries
      );

      const aiRecipe = {
        menu_item_name: menuItem,
        cuisine_type: cuisineType,
        dish_category: this.categorizedish(menuItem),
        suggested_recipe: {
          name: menuItem,
          description: `AI-generated ${menuItem} recipe`,
          prep_time_minutes: suggestion.prep_time,
          cook_time_minutes: suggestion.cook_time,
          difficulty_level: suggestion.difficulty,
          serving_size: 1,
          instructions: this.generateInstructions(menuItem, suggestion),
          tips: this.generateTips(menuItem, suggestion)
        },
        suggested_ingredients: mappedIngredients,
        estimated_cost: suggestion.estimated_cost_per_serving,
        estimated_prep_time: suggestion.prep_time + suggestion.cook_time
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('ai_recipe_suggestions')
        .insert({
          restaurant_id: restaurantId,
          ...aiRecipe
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        suggestion: data,
        message: `AI recipe generated for ${menuItem}. Chef can review and customize.`
      };

    } catch (error) {
      console.error('Error generating recipe:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Find best matching recipe template
  findBestMatch(menuItem, cuisineType) {
    const item = menuItem.toLowerCase();
    
    // Search through recipe database
    for (const [category, recipes] of Object.entries(this.recipeDatabase)) {
      for (const [recipeName, recipeData] of Object.entries(recipes)) {
        if (item.includes(recipeName.toLowerCase()) || 
            recipeName.toLowerCase().includes(item)) {
          return recipeData;
        }
      }
    }

    // Try keyword matching
    if (item.includes('rice')) return this.recipeDatabase.RICE['Fried Rice'];
    if (item.includes('curry')) return this.recipeDatabase.CURRY['Chicken Curry'];
    if (item.includes('dal')) return this.recipeDatabase.CURRY['Dal Curry'];
    
    return null;
  }

  // Generate basic recipe structure for unknown items
  generateBasicRecipe(menuItem, cuisineType) {
    return {
      base_ingredients: ['main_ingredient', 'onion', 'oil', 'spices'],
      estimated_quantities: { main_ingredient: 0.5, onion: 0.1, oil: 0.03, spices: 0.02 },
      prep_time: 20,
      cook_time: 30,
      difficulty: 'MEDIUM',
      estimated_cost_per_serving: 60
    };
  }

  // Map AI ingredients to actual grocery items
  mapIngredientsToGroceries(ingredients, quantities, availableGroceries) {
    const mapped = [];
    
    for (const ingredient of ingredients) {
      // Find matching grocery item
      const matchingGrocery = availableGroceries.find(grocery => 
        grocery.name.toLowerCase().includes(ingredient.toLowerCase()) ||
        ingredient.toLowerCase().includes(grocery.name.toLowerCase())
      );

      if (matchingGrocery) {
        mapped.push({
          grocery_id: matchingGrocery.id,
          grocery_name: matchingGrocery.name,
          ai_suggested_qty: quantities[ingredient] || 0.1,
          unit: matchingGrocery.unit,
          estimated_cost: (quantities[ingredient] || 0.1) * (matchingGrocery.cost_per_unit || 0),
          is_critical: ['main_ingredient', 'rice', 'chicken', 'meat'].includes(ingredient)
        });
      } else {
        // Ingredient not available - suggest procurement
        mapped.push({
          grocery_id: null,
          grocery_name: ingredient,
          ai_suggested_qty: quantities[ingredient] || 0.1,
          unit: 'kg',
          estimated_cost: 0,
          is_critical: true,
          procurement_needed: true
        });
      }
    }

    return mapped;
  }

  // Generate cooking instructions
  generateInstructions(menuItem, suggestion) {
    const instructions = {
      'Fried Rice': [
        '1. Heat oil in a large pan or wok',
        '2. Add chopped onions and garlic, sauté until fragrant',
        '3. Add vegetables and stir-fry for 3-4 minutes',
        '4. Add cooked rice and mix well',
        '5. Add soy sauce and seasonings',
        '6. Stir-fry for 5-7 minutes until well combined',
        '7. Garnish and serve hot'
      ],
      'Chicken Curry': [
        '1. Heat oil in a heavy-bottomed pan',
        '2. Add onions and sauté until golden brown',
        '3. Add ginger-garlic paste and cook for 2 minutes',
        '4. Add tomatoes and cook until soft',
        '5. Add spices and cook for 1 minute',
        '6. Add chicken pieces and cook until sealed',
        '7. Add water, bring to boil, then simmer for 20-25 minutes',
        '8. Adjust seasoning and serve with rice'
      ]
    };

    return instructions[menuItem] || [
      '1. Prepare all ingredients',
      '2. Heat oil in a pan',
      '3. Add aromatics (onion, garlic, ginger)',
      '4. Add main ingredients',
      '5. Add spices and seasonings',
      '6. Cook until done',
      '7. Adjust seasoning and serve'
    ];
  }

  // Generate cooking tips
  generateTips(menuItem, suggestion) {
    return [
      'Taste and adjust seasonings before serving',
      'Ensure all ingredients are fresh',
      'Maintain proper cooking temperature',
      `Estimated cooking time: ${suggestion.cook_time} minutes`,
      'Can be customized based on local preferences'
    ];
  }

  // Categorize dish type
  categorizedish(menuItem) {
    const item = menuItem.toLowerCase();
    
    if (item.includes('rice') || item.includes('biryani')) return 'MAIN_COURSE';
    if (item.includes('curry') || item.includes('dal')) return 'MAIN_COURSE';
    if (item.includes('samosa') || item.includes('pakora')) return 'SNACKS';
    if (item.includes('lassi') || item.includes('juice')) return 'BEVERAGES';
    if (item.includes('sweet') || item.includes('dessert')) return 'DESSERTS';
    
    return 'MAIN_COURSE';
  }

  // Generate recipes for a complete menu
  async generateMenuRecipes(menuItems, restaurantId, cuisineType = 'INDIAN') {
    const results = [];
    
    for (const menuItem of menuItems) {
      const result = await this.generateRecipe(menuItem, cuisineType, restaurantId);
      results.push(result);
      
      // Add delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Get pending recipe suggestions for a restaurant
  async getPendingSuggestions(restaurantId) {
    const { data, error } = await this.supabase
      .from('ai_recipe_suggestions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('chef_status', 'PENDING')
      .order('created_at', { ascending: false });

    return { data, error };
  }

  // Update chef response to AI suggestion
  async updateChefResponse(suggestionId, status, feedback, finalRecipeId = null) {
    const { data, error } = await this.supabase
      .from('ai_recipe_suggestions')
      .update({
        chef_status: status,
        chef_feedback: feedback,
        final_recipe_id: finalRecipeId
      })
      .eq('id', suggestionId)
      .select()
      .single();

    return { data, error };
  }
}

module.exports = AIRecipeGenerator;

// Usage example:
/*
const generator = new AIRecipeGenerator(supabaseUrl, supabaseKey);

// Generate recipe for a single menu item
const result = await generator.generateRecipe('Chicken Biryani', 'INDIAN', restaurantId);

// Generate recipes for complete menu
const menuItems = ['Chicken Biryani', 'Dal Curry', 'Vegetable Fried Rice', 'Samosa'];
const results = await generator.generateMenuRecipes(menuItems, restaurantId);
*/ 