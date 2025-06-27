'use client'

import { useState } from 'react'
import { 
  Crown, 
  Sparkles, 
  BarChart3, 
  Palette, 
  Globe, 
  Shield, 
  Users, 
  FileText,
  Zap,
  Star,
  CheckCircle,
  Lock
} from 'lucide-react'
import PremiumFeature, { PremiumBadge, PremiumFeatureList } from '@/components/PremiumFeature'
import { premiumFeaturesService } from '@/lib/premium-features'
import { getCurrentUser } from '@/lib/auth-context'

export default function DemoPremiumPage() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const restaurantId = currentUser?.restaurantId || 'demo-restaurant'

  // Demo data for premium features
  const demoAnalytics = {
    revenue: 52430,
    orders: 156,
    customers: 89,
    profitMargin: 23.5
  }

  const demoBranding = {
    primaryColor: '#f97316',
    secondaryColor: '#dc2626',
    logo: '/logo.png',
    fontFamily: 'Inter'
  }

  const demoMultiLocation = [
    { name: 'Downtown Branch', revenue: 28450, orders: 89 },
    { name: 'Mall Location', revenue: 23980, orders: 67 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Premium Features Demo</h1>
          </div>
          <p className="text-orange-100 text-lg">
            See how premium features enhance your restaurant management experience
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current User Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Current Restaurant: {currentUser?.name || 'Demo Restaurant'}
              </h2>
              <p className="text-gray-600">
                Role: {currentUser?.role || 'Demo User'} • 
                Restaurant ID: {restaurantId}
              </p>
            </div>
            <div className="text-right">
              <PremiumBadge featureId="custom-branding" />
              <p className="text-sm text-gray-500 mt-1">
                {premiumFeaturesService.getAvailableFeatures(restaurantId).length} premium features active
              </p>
            </div>
          </div>
        </div>

        {/* Premium Features Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Advanced Analytics Dashboard */}
          <PremiumFeature featureId="advanced-analytics">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Advanced Analytics Dashboard</h3>
                <PremiumBadge featureId="advanced-analytics" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm font-medium">Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">${demoAnalytics.revenue.toLocaleString()}</p>
                  <p className="text-blue-100 text-sm">+12.5% vs last month</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Orders</span>
                  </div>
                  <p className="text-2xl font-bold">{demoAnalytics.orders}</p>
                  <p className="text-green-100 text-sm">Today's total</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Profit Margin</span>
                  <span className="font-semibold text-green-600">{demoAnalytics.profitMargin}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-semibold text-blue-600">4.8/5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-semibold text-purple-600">$336.09</span>
                </div>
              </div>
            </div>
          </PremiumFeature>

          {/* Custom Branding */}
          <PremiumFeature featureId="custom-branding">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Custom Branding</h3>
                <PremiumBadge featureId="custom-branding" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Brand Colors</h4>
                  <div className="flex space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: demoBranding.primaryColor }}
                    />
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: demoBranding.secondaryColor }}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Logo</h4>
                  <img 
                    src={demoBranding.logo} 
                    alt="Restaurant Logo" 
                    className="w-16 h-16 object-contain border border-gray-200 rounded-lg"
                  />
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Typography</h4>
                  <p className="text-lg" style={{ fontFamily: demoBranding.fontFamily }}>
                    Custom font: {demoBranding.fontFamily}
                  </p>
                </div>
              </div>
            </div>
          </PremiumFeature>

          {/* Multi-Location Management */}
          <PremiumFeature featureId="multi-location">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Multi-Location Management</h3>
                <PremiumBadge featureId="multi-location" />
              </div>
              
              <div className="space-y-4">
                {demoMultiLocation.map((location, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{location.name}</h4>
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Revenue:</span>
                        <p className="font-medium">${location.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Orders:</span>
                        <p className="font-medium">{location.orders}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PremiumFeature>

          {/* Advanced Security */}
          <PremiumFeature featureId="advanced-security">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Advanced Security</h3>
                <PremiumBadge featureId="advanced-security" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Enabled for all users</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">Role-Based Access</p>
                    <p className="text-sm text-gray-600">Granular permissions</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-900">Audit Logging</p>
                    <p className="text-sm text-gray-600">Complete activity tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </PremiumFeature>
        </div>

        {/* Premium Features List */}
        <div className="mt-12">
          <PremiumFeatureList restaurantId={restaurantId} />
        </div>

        {/* Upgrade CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-white text-center">
          <Crown className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to Upgrade?</h2>
          <p className="text-orange-100 text-lg mb-6 max-w-2xl mx-auto">
            Unlock the full potential of RestMan with premium customizations tailored to your restaurant's unique needs.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a
              href="/customizer"
              className="px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Premium Features
            </a>
            <a
              href="/admin/customizations"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Manage Requests
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 