'use client'

import { useState, useEffect } from 'react'
import { 
  Crown, 
  Sparkles, 
  Settings, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Star,
  Palette,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Users,
  FileText,
  Send,
  ArrowRight,
  X
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth-context'
import toast from 'react-hot-toast'

interface CustomizationRequest {
  id: string
  restaurantName: string
  contactEmail: string
  contactPhone: string
  feature: string
  description: string
  budget: number
  timeline: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed'
  createdAt: string
  estimatedCost: number
  estimatedTime: string
}

interface PremiumFeature {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  icon: any
  benefits: string[]
  popular: boolean
  estimatedTime: string
}

export default function CustomizerPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'features' | 'request' | 'status'>('features')
  const [selectedFeature, setSelectedFeature] = useState<PremiumFeature | null>(null)
  const [requestForm, setRequestForm] = useState({
    restaurantName: '',
    contactEmail: '',
    contactPhone: '',
    feature: '',
    description: '',
    budget: '',
    timeline: '2-4 weeks'
  })
  const [userRequests, setUserRequests] = useState<CustomizationRequest[]>([])

  useEffect(() => {
    setCurrentUser(getCurrentUser())
    loadUserRequests()
  }, [])

  const loadUserRequests = () => {
    const saved = localStorage.getItem('customizationRequests')
    if (saved) {
      setUserRequests(JSON.parse(saved))
    }
  }

  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'custom-branding',
      name: 'Custom Branding & Theming',
      description: 'Complete visual customization with your restaurant\'s brand colors, logos, and styling',
      category: 'Visual',
      basePrice: 299,
      icon: Palette,
      benefits: [
        'Custom color schemes and themes',
        'Brand logo integration',
        'Custom typography',
        'Personalized UI elements',
        'Brand consistency across all screens'
      ],
      popular: true,
      estimatedTime: '1-2 weeks'
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics Dashboard',
      description: 'Comprehensive reporting and analytics with custom metrics and insights',
      category: 'Analytics',
      basePrice: 499,
      icon: BarChart3,
      benefits: [
        'Custom KPI tracking',
        'Advanced reporting tools',
        'Data visualization',
        'Export capabilities',
        'Real-time insights'
      ],
      popular: true,
      estimatedTime: '2-3 weeks'
    },
    {
      id: 'multi-location',
      name: 'Multi-Location Management',
      description: 'Manage multiple restaurant locations from a single dashboard',
      category: 'Operations',
      basePrice: 399,
      icon: Globe,
      benefits: [
        'Centralized management',
        'Location-specific settings',
        'Cross-location reporting',
        'Inventory synchronization',
        'Staff management across locations'
      ],
      popular: false,
      estimatedTime: '3-4 weeks'
    },
    {
      id: 'custom-integrations',
      name: 'Custom Integrations',
      description: 'Integrate with your existing POS, accounting, or delivery systems',
      category: 'Integration',
      basePrice: 599,
      icon: Zap,
      benefits: [
        'Third-party system integration',
        'API customization',
        'Data synchronization',
        'Automated workflows',
        'Custom webhooks'
      ],
      popular: false,
      estimatedTime: '2-4 weeks'
    },
    {
      id: 'advanced-security',
      name: 'Advanced Security Features',
      description: 'Enhanced security with custom access controls and compliance features',
      category: 'Security',
      basePrice: 399,
      icon: Shield,
      benefits: [
        'Custom access controls',
        'Advanced authentication',
        'Audit logging',
        'Compliance features',
        'Data encryption'
      ],
      popular: false,
      estimatedTime: '1-2 weeks'
    },
    {
      id: 'custom-workflows',
      name: 'Custom Workflows',
      description: 'Tailored business processes and workflow automation',
      category: 'Operations',
      basePrice: 449,
      icon: Users,
      benefits: [
        'Custom approval processes',
        'Automated workflows',
        'Role-based permissions',
        'Custom notifications',
        'Process optimization'
      ],
      popular: false,
      estimatedTime: '2-3 weeks'
    },
    {
      id: 'custom-reports',
      name: 'Custom Reports',
      description: 'Tailored reporting templates and automated report generation',
      category: 'Reporting',
      basePrice: 299,
      icon: FileText,
      benefits: [
        'Custom report templates',
        'Automated scheduling',
        'Multiple export formats',
        'Custom calculations',
        'Branded reports'
      ],
      popular: false,
      estimatedTime: '1-2 weeks'
    }
  ]

  const handleFeatureSelect = (feature: PremiumFeature) => {
    setSelectedFeature(feature)
    setRequestForm(prev => ({
      ...prev,
      feature: feature.name
    }))
    setActiveTab('request')
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!requestForm.restaurantName || !requestForm.contactEmail || !requestForm.contactPhone) {
      toast.error('Please fill in all required fields')
      return
    }

    const newRequest: CustomizationRequest = {
      id: `req-${Date.now()}`,
      restaurantName: requestForm.restaurantName,
      contactEmail: requestForm.contactEmail,
      contactPhone: requestForm.contactPhone,
      feature: requestForm.feature,
      description: requestForm.description,
      budget: parseFloat(requestForm.budget) || 0,
      timeline: requestForm.timeline,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedCost: selectedFeature?.basePrice || 0,
      estimatedTime: selectedFeature?.estimatedTime || '2-4 weeks'
    }

    const updatedRequests = [...userRequests, newRequest]
    setUserRequests(updatedRequests)
    localStorage.setItem('customizationRequests', JSON.stringify(updatedRequests))

    // Reset form
    setRequestForm({
      restaurantName: '',
      contactEmail: '',
      contactPhone: '',
      feature: '',
      description: '',
      budget: '',
      timeline: '2-4 weeks'
    })
    setSelectedFeature(null)
    setActiveTab('status')

    toast.success('Customization request submitted successfully!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'reviewing': return <Settings className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      case 'completed': return <Star className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-8 h-8" />
            <h1 className="text-3xl font-bold">RestMan Customizer</h1>
          </div>
          <p className="text-orange-100 text-lg">
            Transform your restaurant management with premium customizations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 mb-8 shadow-sm">
          <button
            onClick={() => setActiveTab('features')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'features'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Premium Features</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'request'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Request Customization</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'status'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Request Status</span>
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Premium Customization Features
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Enhance your RestMan experience with custom features tailored to your restaurant's unique needs. 
                Our expert team will work with you to implement the perfect solution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all hover:shadow-md cursor-pointer ${
                    feature.popular ? 'border-orange-200 ring-2 ring-orange-100' : 'border-gray-200'
                  }`}
                  onClick={() => handleFeatureSelect(feature)}
                >
                  {feature.popular && (
                    <div className="flex items-center space-x-1 mb-3">
                      <Star className="w-4 h-4 text-orange-500 fill-current" />
                      <span className="text-xs font-medium text-orange-600">Most Popular</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                      <p className="text-sm text-gray-500">{feature.category}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>

                  <div className="space-y-2 mb-4">
                    {feature.benefits.slice(0, 3).map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">${feature.basePrice}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{feature.estimatedTime}</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2">
                    <span>Request This Feature</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'request' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Customization</h2>
              
              {selectedFeature && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-orange-900">{selectedFeature.name}</h3>
                      <p className="text-sm text-orange-700">Base Price: ${selectedFeature.basePrice}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleRequestSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={requestForm.restaurantName}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, restaurantName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Your restaurant name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      value={requestForm.contactEmail}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={requestForm.contactPhone}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Description
                  </label>
                  <textarea
                    value={requestForm.description}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe your specific requirements and how you'd like to customize this feature..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range (USD)
                    </label>
                    <input
                      type="number"
                      value={requestForm.budget}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeline
                    </label>
                    <select
                      value={requestForm.timeline}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, timeline: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="2-4 weeks">2-4 weeks</option>
                      <option value="1-2 months">1-2 months</option>
                      <option value="2-3 months">2-3 months</option>
                      <option value="3+ months">3+ months</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Customization Request</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Customization Requests
              </h2>
              <p className="text-gray-600">
                Track the status of your customization requests and get updates from our team.
              </p>
            </div>

            {userRequests.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-600 mb-6">
                  Submit your first customization request to get started.
                </p>
                <button
                  onClick={() => setActiveTab('features')}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Browse Features
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.feature}</h3>
                        <p className="text-sm text-gray-600">{request.restaurantName}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{request.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Budget:</span>
                        <p className="font-medium">${request.budget}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Timeline:</span>
                        <p className="font-medium">{request.timeline}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Est. Cost:</span>
                        <p className="font-medium">${request.estimatedCost}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Est. Time:</span>
                        <p className="font-medium">{request.estimatedTime}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                        <span>ID: {request.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 