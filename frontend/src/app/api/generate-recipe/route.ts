import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  let menuItem = ''
  let cuisine = ''
  
  try {
    const body = await request.json()
    menuItem = body.menuItem
    cuisine = body.cuisine
    const restrictions = body.restrictions || []

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // Return a high-quality demo recipe if no API key
      return NextResponse.json({
        success: true,
        recipe: generateDemoRecipe(menuItem, cuisine),
        demo: true
      })
    }

    const openai = new OpenAI({ apiKey })

    const prompt = `
      Generate a professional restaurant recipe for "${menuItem}" in ${cuisine} cuisine.
      ${restrictions.length > 0 ? `Dietary restrictions: ${restrictions.join(', ')}` : ''}
      
      Return a JSON object with exactly this structure:
      {
        "name": "Recipe name",
        "description": "Brief description",
        "cuisine_type": "${cuisine}",
        "prep_time_minutes": number,
        "cook_time_minutes": number,
        "difficulty_level": "EASY" | "MEDIUM" | "HARD",
        "serving_size": number,
        "estimated_cost_per_serving": number (in USD),
        "instructions": ["step 1", "step 2", ...],
        "tips": ["tip 1", "tip 2", ...],
        "ingredients": [
          {
            "name": "ingredient name",
            "quantity": number,
            "unit": "kg" | "g" | "l" | "ml" | "pieces" | "tbsp" | "tsp",
            "category": "MEAT" | "VEGETABLES" | "DAIRY" | "GRAINS" | "SPICES" | "OTHER",
            "is_critical": boolean,
            "notes": "optional notes"
          }
        ]
      }
    `

    console.log('Attempting to call OpenAI with API key:', apiKey.substring(0, 7) + '...')

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional chef creating restaurant-quality recipes. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    console.log('OpenAI response received')
    const responseContent = completion.choices[0].message.content || '{}'
    console.log('Response content:', responseContent.substring(0, 100) + '...')
    
    const recipeData = JSON.parse(responseContent)

    return NextResponse.json({
      success: true,
      recipe: recipeData,
      demo: false
    })

  } catch (error) {
    console.error('Recipe generation error - Full details:', error)
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown')
    
    // Return demo recipe on error
    return NextResponse.json({
      success: true,
      recipe: generateDemoRecipe(menuItem || 'Chicken Curry', cuisine || 'Indian'),
      demo: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

function generateDemoRecipe(menuItem: string, cuisine: string) {
  // High-quality demo recipes based on the request
  const recipes: Record<string, any> = {
    'Hakka Noodles': {
      name: 'Hakka Noodles',
      description: 'Indo-Chinese style stir-fried noodles with vegetables',
      cuisine_type: 'Chinese',
      prep_time_minutes: 20,
      cook_time_minutes: 15,
      difficulty_level: 'MEDIUM',
      serving_size: 4,
      estimated_cost_per_serving: 3.50,
      instructions: [
        'Boil noodles according to package instructions until al dente',
        'Heat oil in a wok on high heat',
        'Add minced garlic and ginger, stir for 30 seconds',
        'Add julienned vegetables - carrots, cabbage, bell peppers',
        'Stir fry on high heat for 2-3 minutes',
        'Add boiled noodles and toss well',
        'Add soy sauce, vinegar, and chili sauce',
        'Toss everything together for 2 minutes',
        'Garnish with spring onions and serve hot'
      ],
      tips: [
        'Use day-old cooked noodles for better texture',
        'Keep the heat high throughout for the authentic wok hei flavor',
        'Don\'t overcook vegetables - they should remain crunchy'
      ],
      ingredients: [
        {
          name: 'Hakka Noodles',
          quantity: 400,
          unit: 'g',
          category: 'GRAINS',
          is_critical: true,
          notes: 'Fresh or dried both work'
        },
        {
          name: 'Cabbage',
          quantity: 200,
          unit: 'g',
          category: 'VEGETABLES',
          is_critical: false,
          notes: 'Finely shredded'
        },
        {
          name: 'Carrots',
          quantity: 150,
          unit: 'g',
          category: 'VEGETABLES',
          is_critical: false,
          notes: 'Julienned'
        },
        {
          name: 'Bell Peppers',
          quantity: 150,
          unit: 'g',
          category: 'VEGETABLES',
          is_critical: false,
          notes: 'Mixed colors preferred'
        },
        {
          name: 'Spring Onions',
          quantity: 50,
          unit: 'g',
          category: 'VEGETABLES',
          is_critical: false,
          notes: 'For garnish'
        },
        {
          name: 'Garlic',
          quantity: 20,
          unit: 'g',
          category: 'VEGETABLES',
          is_critical: true,
          notes: 'Minced'
        },
        {
          name: 'Ginger',
          quantity: 15,
          unit: 'g',
          category: 'VEGETABLES',
          is_critical: true,
          notes: 'Minced'
        },
        {
          name: 'Soy Sauce',
          quantity: 60,
          unit: 'ml',
          category: 'OTHER',
          is_critical: true,
          notes: 'Dark and light mixed'
        },
        {
          name: 'Vegetable Oil',
          quantity: 45,
          unit: 'ml',
          category: 'OTHER',
          is_critical: true,
          notes: 'High smoke point oil'
        }
      ]
    }
  }

  // Return requested recipe or a generic one
  return recipes[menuItem] || {
    name: menuItem,
    description: `Authentic ${cuisine} style ${menuItem}`,
    cuisine_type: cuisine,
    prep_time_minutes: 30,
    cook_time_minutes: 45,
    difficulty_level: 'MEDIUM',
    serving_size: 4,
    estimated_cost_per_serving: 5.00,
    instructions: [
      'Prepare all ingredients as per standard mise en place',
      'Heat cooking vessel to appropriate temperature',
      'Add base aromatics and cook until fragrant',
      'Add primary ingredients in order of cooking time',
      'Season to taste with appropriate spices',
      'Cook until desired doneness is achieved',
      'Adjust final seasoning and consistency',
      'Garnish and serve immediately'
    ],
    tips: [
      'Fresh ingredients always yield better results',
      'Taste and adjust seasoning throughout cooking',
      'Proper temperature control is key to success'
    ],
    ingredients: [
      {
        name: 'Primary Protein/Base',
        quantity: 500,
        unit: 'g',
        category: 'OTHER',
        is_critical: true,
        notes: 'Main ingredient'
      },
      {
        name: 'Aromatics (Onions, Garlic, etc)',
        quantity: 200,
        unit: 'g',
        category: 'VEGETABLES',
        is_critical: true,
        notes: 'For flavor base'
      },
      {
        name: 'Spices and Seasonings',
        quantity: 30,
        unit: 'g',
        category: 'SPICES',
        is_critical: true,
        notes: 'As per cuisine requirements'
      }
    ]
  }
} 