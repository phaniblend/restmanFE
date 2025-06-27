import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching menu items...')
    const { data: menuItems, error: menuError } = await supabase.from('menu_items').select('*')
    if (menuError) throw menuError
    console.log('Menu items:', menuItems)

    console.log('Fetching recipes...')
    const { data: recipes, error: recipeError } = await supabase.from('recipes').select('*')
    if (recipeError) throw recipeError
    console.log('Recipes:', recipes)

    console.log('Fetching order items...')
    const { data: orderItems, error: orderItemsError } = await supabase.from('order_items').select('*')
    if (orderItemsError) throw orderItemsError
    console.log('Order items:', orderItems)

    console.log('Fetching recipe-grocery map...')
    const { data: recipeGroceryMap, error: rgmError } = await supabase.from('recipe_grocery_map').select('*')
    if (rgmError) throw rgmError
    console.log('Recipe-grocery map:', recipeGroceryMap)

    console.log('Fetching groceries...')
    const { data: groceries, error: groceryError } = await supabase.from('groceries').select('*')
    if (groceryError) throw groceryError
    console.log('Groceries:', groceries)

    // Build analytics per menu item
    const summary = menuItems.map(menuItem => {
      // Find recipe for this menu item
      const recipe = recipes.find(r => r.id === menuItem.recipe_id)
      if (!recipe) return { menu_item: menuItem.name, error: 'No recipe linked' }

      // Find all order_items for this menu item
      const itemsSold = orderItems.filter(oi => oi.menu_item_id === menuItem.id)
      const actual_sales = itemsSold.reduce((sum, oi) => sum + (oi.quantity || 0), 0)

      // Find all ingredients for this recipe
      const ingredients = recipeGroceryMap.filter(rgm => rgm.recipe_id === recipe.id)

      // For each ingredient, calculate expected usage and invested
      let invested = 0
      let expected_yield = 0
      let wastage = 0
      let discrepancy = 0
      let ingredientDetails = []
      for (const ing of ingredients) {
        // Find grocery details
        const grocery = groceries.find(g => g.id === ing.grocery_id)
        const qtyPerOrder = ing.quantity_per_order || 0
        const expectedUsage = actual_sales * qtyPerOrder
        const costPerUnit = grocery?.cost_per_unit || 0
        const investedForIngredient = expectedUsage * costPerUnit
        invested += investedForIngredient
        expected_yield += expectedUsage
        // Wastage for this ingredient
        const wastageForIngredient = grocery?.wastage_amt || 0
        wastage += wastageForIngredient
        // Discrepancy: expected usage vs. (initial_amt - current_amt - wastage_amt)
        const actualUsed = (grocery?.initial_amt || 0) - (grocery?.current_amt || 0) - (grocery?.wastage_amt || 0)
        const discrepancyForIngredient = expectedUsage - actualUsed
        discrepancy += discrepancyForIngredient
        ingredientDetails.push({
          name: grocery?.name || 'Unknown',
          expectedUsage,
          actualUsed,
          costPerUnit,
          investedForIngredient,
          wastageForIngredient,
          discrepancyForIngredient
        })
      }
      // Generate alert if discrepancy or wastage is high
      let alert = ''
      if (Math.abs(discrepancy) > expected_yield * 0.2) {
        alert = '⚠️ Significant discrepancy in ingredient usage!'
      } else if (wastage > expected_yield * 0.1) {
        alert = '⚠️ High wastage detected!'
      }
      return {
        menu_item: menuItem.name,
        category: menuItem.category,
        invested: invested.toFixed(2),
        expected_yield,
        actual_sales,
        wastage,
        discrepancy: discrepancy.toFixed(2),
        alert,
        ingredientDetails
      }
    })

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error('Error in inventory analytics:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
} 