'use client'

import { Phone, Mail, MessageCircle, HelpCircle, Book, Video } from 'lucide-react'

export default function SupportPage() {
  const supportOptions = [
    {
      icon: Phone,
      title: 'Call Support',
      description: 'Talk to our support team',
      action: '+91 1800-123-4567',
      color: 'bg-green-100 text-green-700'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: '24-48 hour response time',
      action: 'support@restman.app',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with us now',
      action: 'Start Chat',
      color: 'bg-purple-100 text-purple-700'
    }
  ]

  const resources = [
    { icon: Book, title: 'User Guide', description: 'Complete documentation' },
    { icon: Video, title: 'Video Tutorials', description: 'Learn with videos' },
    { icon: HelpCircle, title: 'FAQs', description: 'Common questions answered' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
            <p className="text-sm text-gray-600 mt-1">How can we help you today?</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {supportOptions.map((option, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center mb-4`}>
                <option.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{option.description}</p>
              <button className="text-orange-600 font-semibold hover:text-orange-700">
                {option.action} →
              </button>
            </div>
          ))}
        </div>

        {/* Help Resources */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Help Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((resource, index) => (
              <button
                key={index}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
              >
                <resource.icon className="w-8 h-8 text-orange-500 mb-3" />
                <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Common Issues</h2>
          <div className="space-y-3">
            <details className="border-b border-gray-200 pb-3">
              <summary className="cursor-pointer font-semibold text-gray-900 hover:text-orange-600">
                How do I add multiple cuisines?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                During setup, simply click on multiple cuisine types. The system will generate a combined menu with dishes from all selected cuisines.
              </p>
            </details>
            <details className="border-b border-gray-200 pb-3">
              <summary className="cursor-pointer font-semibold text-gray-900 hover:text-orange-600">
                What's the difference between Edit and Modify Ingredients?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                "Edit" allows quick inline changes to existing ingredients. "Modify Ingredients" provides full ingredient management including adding/removing items.
              </p>
            </details>
            <details className="border-b border-gray-200 pb-3">
              <summary className="cursor-pointer font-semibold text-gray-900 hover:text-orange-600">
                How do I switch between users?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Click the menu icon in the header and use the Logout button. This clears the session and allows another user to log in.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
} 