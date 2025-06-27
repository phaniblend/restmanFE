'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Plus, Edit2, Trash2, Search, Filter, Save, X, ChefHat } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { authService } from '@/lib/auth-service'
import toast from 'react-hot-toast'

interface MenuItem {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  is_available: boolean
  recipe_id: string | null
  recipe?: {
    name: string
    prep_time_minutes: number
    cook_time_minutes: number
  }
}

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Categories
  const categories = ['ALL', 'APPETIZER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE', 'SPECIAL']

  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    setIsLoading(true)
    try {
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) {
        setMenuItems([])
        setIsLoading(false)
        toast('No restaurant found for user', { icon: '⚠️' })
        return
      }
      const { data, error } = await supabase
        .from('menu_items')
        .select(`*, recipe:recipes(name, prep_time_minutes, cook_time_minutes)`)
        .eq('restaurant_id', restaurant.id)
        .order('category', { ascending: true })
        .order('name', { ascending: true })
      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Error loading menu items:', error)
      toast.error('Failed to load menu items')
      setMenuItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveItem = async (item: Partial<MenuItem>) => {
    try {
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) {
        // Demo mode - just update local state
        if (editingItem?.id) {
          setMenuItems(menuItems.map(mi => 
            mi.id === editingItem.id 
              ? { ...mi, ...item } as MenuItem
              : mi
          ))
          toast.success('Menu item updated (demo mode)')
        } else {
          const newItem: MenuItem = {
            id: Date.now().toString(),
            name: item.name || '',
            description: item.description || null,
            category: item.category || 'MAIN_COURSE',
            price: item.price || 0,
            is_available: item.is_available ?? true,
            recipe_id: item.recipe_id || null
          }
          setMenuItems([...menuItems, newItem])
          toast.success('Menu item added (demo mode)')
        }
        setEditingItem(null)
        setIsAddingNew(false)
        return
      }

      if (editingItem?.id) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            is_available: item.is_available,
            recipe_id: item.recipe_id
          })
          .eq('id', editingItem.id)

        if (error) throw error
        toast.success('Menu item updated successfully')
      } else {
        // Create new item
        const { error } = await supabase
          .from('menu_items')
          .insert([{
            restaurant_id: restaurant.id,
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            is_available: item.is_available,
            recipe_id: item.recipe_id
          }])

        if (error) throw error
        toast.success('Menu item added successfully')
      }

      loadMenuItems()
      setEditingItem(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving menu item:', error)
      toast.error('Failed to save menu item')
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      const restaurant = await authService.getUserRestaurant()
      if (!restaurant) {
        // Demo mode - just update local state
        setMenuItems(menuItems.filter(item => item.id !== id))
        toast.success('Menu item deleted (demo mode)')
        return
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Menu item deleted successfully')
      loadMenuItems()
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast.error('Failed to delete menu item')
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-2">Set prices and manage your menu items</p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        console.log('Editing item:', item)
                        setEditingItem(item)
                      }}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="text-sm font-medium">{item.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="text-lg font-bold text-orange-600">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.is_available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  {item.recipe && (
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                      <ChefHat className="w-4 h-4 mr-1" />
                      <span>{item.recipe.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Add Modal */}
      {(editingItem || isAddingNew) && (
        <EditMenuItemModal
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => {
            setEditingItem(null)
            setIsAddingNew(false)
          }}
        />
      )}
    </div>
  )
}

// Edit/Add Modal Component
function EditMenuItemModal({ 
  item, 
  onSave, 
  onClose 
}: { 
  item: MenuItem | null
  onSave: (item: Partial<MenuItem>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || 'MAIN_COURSE',
    price: item?.price || 0,
    is_available: item?.is_available ?? true,
    recipe_id: item?.recipe_id || null
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || formData.price <= 0) {
      toast.error('Please fill in all required fields')
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="APPETIZER">Appetizer</option>
              <option value="MAIN_COURSE">Main Course</option>
              <option value="DESSERT">Dessert</option>
              <option value="BEVERAGE">Beverage</option>
              <option value="SPECIAL">Special</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
              Available for ordering
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
} 