'use client'

import { useState, useEffect } from 'react'
import { 
  Crown, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings, 
  Star,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  Eye,
  Check,
  X
} from 'lucide-react'
import { premiumFeaturesService } from '@/lib/premium-features'
import { getCurrentUser } from '@/lib/auth-context'
import toast from 'react-hot-toast'

export default function AdminCustomizationsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [customizationRequests, setCustomizationRequests] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed'>('all')

  useEffect(() => {
    setCurrentUser(getCurrentUser())
    loadCustomizationRequests()
  }, [])

  const loadCustomizationRequests = () => {
    const requests = premiumFeaturesService.getAllCustomizationRequests()
    setCustomizationRequests(requests)
  }

  const handleStatusUpdate = (requestId: string, newStatus: string) => {
    const success = premiumFeaturesService.updateCustomizationStatus(requestId, newStatus as any)
    if (success) {
      loadCustomizationRequests()
      toast.success(`Request ${newStatus} successfully`)
    } else {
      toast.error('Failed to update request status')
    }
  }

  const filteredRequests = customizationRequests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

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
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'completed': return <Star className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusCount = (status: string) => {
    return customizationRequests.filter(req => req.status === status).length
  }

  // Check if user is admin (owner or manager)
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'manager')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only owners and managers can access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Customization Requests</h1>
          </div>
          <p className="text-orange-100 text-lg">
            Manage and review restaurant customization requests
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{getStatusCount('pending')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Reviewing</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{getStatusCount('reviewing')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">Approved</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{getStatusCount('approved')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{getStatusCount('rejected')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{getStatusCount('completed')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          {['all', 'pending', 'reviewing', 'approved', 'rejected', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:text-orange-600 border border-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'No customization requests have been submitted yet.'
                  : `No ${filter} requests found.`
                }
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {premiumFeaturesService.getFeatureById(request.featureId)?.name || 'Unknown Feature'}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{request.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
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

                {/* Action Buttons */}
                {request.status === 'pending' && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'reviewing')}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Start Review</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'approved')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'rejected')}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {request.status === 'reviewing' && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'approved')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'rejected')}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'completed')}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </button>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                    <span>ID: {request.id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Feature Requested</h3>
                  <p className="text-gray-600">
                    {premiumFeaturesService.getFeatureById(selectedRequest.featureId)?.name || 'Unknown Feature'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Budget</h3>
                    <p className="text-gray-600">${selectedRequest.budget}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
                    <p className="text-gray-600">{selectedRequest.timeline}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Estimated Cost</h3>
                    <p className="text-gray-600">${selectedRequest.estimatedCost}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Estimated Time</h3>
                    <p className="text-gray-600">{selectedRequest.estimatedTime}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span className="capitalize">{selectedRequest.status}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Timestamps</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Created: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(selectedRequest.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 