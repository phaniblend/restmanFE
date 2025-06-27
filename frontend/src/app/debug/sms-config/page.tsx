'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Settings, Phone, Key } from 'lucide-react'
import { SMSConfigChecker, SMSConfigStatus } from '@/lib/sms-config-checker'

export default function SMSConfigDebugPage() {
  const [configStatus, setConfigStatus] = useState<SMSConfigStatus | null>(null)
  const [envVars, setEnvVars] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    setIsLoading(true)
    try {
      const [status, vars] = await Promise.all([
        SMSConfigChecker.checkConfiguration(),
        SMSConfigChecker.checkEnvironmentVariables()
      ])
      setConfigStatus(status)
      setEnvVars(vars)
    } catch (error) {
      console.error('Error checking configuration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking SMS configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">SMS Configuration Debug</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Configuration Status */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>SMS Status</span>
              </h2>
              
              {configStatus && (
                <div className={`p-4 rounded-lg border ${getStatusColor(configStatus.canSendSMS)}`}>
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(configStatus.canSendSMS)}
                    <div>
                      <p className="font-medium">
                        {configStatus.canSendSMS ? 'SMS Configured' : 'SMS Not Configured'}
                      </p>
                      <p className="text-sm mt-1">
                        {configStatus.reason}
                      </p>
                      
                      {configStatus.suggestions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Suggestions:</p>
                          <ul className="text-sm space-y-1">
                            {configStatus.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Environment Variables */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>Environment Variables</span>
              </h2>
              
              <div className="space-y-2">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className={`p-3 rounded-lg border ${getStatusColor(value)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{key}</span>
                      {getStatusIcon(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Setup Instructions</span>
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              {SMSConfigChecker.getSetupInstructions().map((instruction, index) => (
                <div key={index} className={instruction.trim() === '' ? 'h-2' : ''}>
                  {instruction.trim() !== '' && (
                    <p className={instruction.startsWith('   ') ? 'ml-4' : ''}>{instruction}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={checkConfiguration}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Recheck Configuration
            </button>
            <a
              href="/auth/phone"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Test Phone Auth
            </a>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Common Issues & Solutions</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h3 className="font-medium text-gray-800">Demo Mode Always Active</h3>
              <p className="text-sm text-gray-600 mt-1">
                This usually means your Supabase phone authentication is not configured with an SMS provider. 
                Go to your Supabase dashboard and set up Twilio as your SMS provider.
              </p>
            </div>

            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-medium text-gray-800">Environment Variables Missing</h3>
              <p className="text-sm text-gray-600 mt-1">
                Make sure all required environment variables are set in your <code className="bg-gray-100 px-1 rounded">.env.local</code> 
                or <code className="bg-gray-100 px-1 rounded">.env.production</code> file.
              </p>
            </div>

            <div className="border-l-4 border-blue-400 pl-4">
              <h3 className="font-medium text-gray-800">SMS Not Received</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check that your Twilio phone number is verified and has SMS capabilities. 
                Also verify that your phone number format includes the country code (e.g., +1234567890).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 