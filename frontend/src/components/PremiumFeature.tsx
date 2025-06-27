'use client'

import { ReactNode } from 'react'
import { Crown, Lock, Sparkles } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth-context'
import { premiumFeaturesService } from '@/lib/premium-features'
import Link from 'next/link'

interface PremiumFeatureProps {
  featureId: string
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
  className?: string
}

export default function PremiumFeature({ 
  featureId, 
  children, 
  fallback,
  showUpgradePrompt = true,
  className = ''
}: PremiumFeatureProps) {
  const currentUser = getCurrentUser()
  const restaurantId = currentUser?.restaurantId || 'demo-restaurant'
  
  const hasAccess = premiumFeaturesService.hasFeatureAccess(restaurantId, featureId)
  const feature = premiumFeaturesService.getFeatureById(featureId)

  if (hasAccess) {
    return <div className={className}>{children}</div>
  }

  if (fallback) {
    return <div className={className}>{fallback}</div>
  }

  if (!showUpgradePrompt) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
      
      {/* Premium overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg border-2 border-orange-200 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Premium Feature
          </h3>
          
          {feature && (
            <p className="text-gray-600 mb-4 max-w-sm">
              {feature.name} - {feature.description}
            </p>
          )}
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">
              Starting at ${feature?.basePrice || 199}
            </span>
          </div>
          
          <Link
            href="/customizer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade Now</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Simple premium badge component
export function PremiumBadge({ featureId, className = '' }: { featureId: string; className?: string }) {
  const currentUser = getCurrentUser()
  const restaurantId = currentUser?.restaurantId || 'demo-restaurant'
  
  const hasAccess = premiumFeaturesService.hasFeatureAccess(restaurantId, featureId)
  
  if (hasAccess) {
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium ${className}`}>
        <Crown className="w-3 h-3" />
        <span>Premium</span>
      </div>
    )
  }
  
  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium ${className}`}>
      <Lock className="w-3 h-3" />
      <span>Premium</span>
    </div>
  )
}

// Premium feature list component
export function PremiumFeatureList({ restaurantId }: { restaurantId: string }) {
  const availableFeatures = premiumFeaturesService.getAvailableFeatures(restaurantId)
  const allFeatures = premiumFeaturesService.getAllFeatures()
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Your Premium Features</h3>
      
      {availableFeatures.length === 0 ? (
        <div className="text-center py-8">
          <Crown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No premium features activated yet</p>
          <Link
            href="/customizer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Premium Features</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableFeatures.map((feature) => (
            <div key={feature.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{feature.name}</h4>
                <PremiumBadge featureId={feature.id} />
              </div>
              <p className="text-sm text-gray-600">{feature.description}</p>
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                <span>Category: {feature.category}</span>
                <span>Est. Time: {feature.estimatedTime}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {availableFeatures.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Available Upgrades</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allFeatures
              .filter(feature => !availableFeatures.find(af => af.id === feature.id))
              .slice(0, 4)
              .map((feature) => (
                <div key={feature.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{feature.name}</h4>
                    <PremiumBadge featureId={feature.id} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">${feature.basePrice}</span>
                    <Link
                      href="/customizer"
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Request →
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
} 