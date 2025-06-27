'use client'

import { Building2, TrendingUp, MapPin, Users } from 'lucide-react'

export default function BranchesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Multi-Branch Management</h1>
            <p className="text-sm text-gray-600 mt-1">Compare performance across all branches</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Multi-Branch Feature Coming Soon!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Manage multiple restaurant locations, compare performance metrics, and optimize operations across all your branches.
          </p>
          <button className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors">
            Get Notified When Available
          </button>
        </div>
      </div>
    </div>
  )
} 