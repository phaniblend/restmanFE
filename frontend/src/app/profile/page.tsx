'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Mail, Shield, Calendar, Edit2, Save, ArrowRight } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth-context'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({ name: '', mobile: '' })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setEditedData({ name: currentUser.name, mobile: currentUser.mobile })
    }
    setIsLoading(false)
  }, [])

  const handleSave = () => {
    // In real app, this would update the user data
    setUser({ ...user, ...editedData })
    setIsEditing(false)
  }

  const getRoleIcon = (role: string) => {
    const icons: { [key: string]: any } = {
      owner: '👑',
      manager: '🛡️',
      chef: '👨‍🍳',
      waiter: '🍽️'
    }
    return icons[role] || '👤'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )
  }

  // Show setup prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Profile Found</h2>
            <p className="text-gray-600 mb-8">
              Please complete the restaurant setup first to create your profile.
            </p>
            <Link href="/setup">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center mx-auto space-x-2">
                <span>Go to Restaurant Setup</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your account information</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-4xl">
                {getRoleIcon(user.role)}
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-orange-500 focus:outline-none"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                )}
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'owner' ? 'bg-yellow-100 text-yellow-800' :
                  user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                  user.role === 'chef' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {user.role.toUpperCase()}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <Phone className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="tel"
                  value={editedData.mobile}
                  onChange={(e) => setEditedData({ ...editedData, mobile: e.target.value })}
                  className="flex-1 border-b border-gray-300 focus:border-orange-500 focus:outline-none"
                />
              ) : (
                <span>{user.mobile}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-gray-700">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{user.email || 'Not provided'}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-700">
              <Shield className="w-5 h-5 text-gray-400" />
              <span>Role: {user.role}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-700">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>Member since: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">28</p>
            <p className="text-sm text-gray-600">Days Active</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">156</p>
            <p className="text-sm text-gray-600">Actions Taken</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">94%</p>
            <p className="text-sm text-gray-600">Efficiency</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">4.8</p>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Email Notifications</span>
              <input type="checkbox" className="toggle toggle-orange" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">SMS Alerts</span>
              <input type="checkbox" className="toggle toggle-orange" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Push Notifications</span>
              <input type="checkbox" className="toggle toggle-orange" />
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
} 