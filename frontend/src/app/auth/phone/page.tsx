'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Lock, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { testUsers, getTestUserByPhone, simulateTestLogin } from '@/lib/test-users'

export default function PhoneAuthPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [errorReason, setErrorReason] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorReason('')

    // Format phone number - add +1 for US numbers if not provided
    let formattedPhone = phoneNumber.trim()
    
    // Remove any non-digit characters except +
    formattedPhone = formattedPhone.replace(/[^\d+]/g, '')
    
    // If it's a 10-digit US number, add +1
    if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = '+1' + formattedPhone
    }
    // If it's 11 digits starting with 1, add +
    else if (/^1\d{10}$/.test(formattedPhone)) {
      formattedPhone = '+' + formattedPhone
    }
    // If it doesn't start with +, assume it needs +1
    else if (/^\d{11,}$/.test(formattedPhone) && !formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone
    }
    
    console.log('Formatted phone:', formattedPhone)
    
    // Store formatted phone number in state
    setFormattedPhoneNumber(formattedPhone)

    // Check if this is a test user
    const testUser = getTestUserByPhone(formattedPhone)
    if (testUser) {
      // Test user - go directly to demo mode
      setDemoMode(true)
      sessionStorage.setItem('demo_phone', formattedPhone)
      sessionStorage.setItem('demo_user', JSON.stringify(testUser))
      sessionStorage.setItem('demo_reason', 'Test user login')
      
      toast.success(`Demo Mode: ${testUser.name} (${testUser.role}) - Use OTP 123456`)
      setStep('otp')
      setIsLoading(false)
      return
    }

    try {
      // Try Supabase auth first
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) {
        // If Supabase fails, determine the reason and use demo mode
        console.log('Supabase SMS error:', error.message)
        
        let reason = 'Unknown configuration issue'
        if (error.message.includes('phone_provider_not_setup')) {
          reason = 'SMS provider not configured in Supabase'
        } else if (error.message.includes('phone_rate_limit_exceeded')) {
          reason = 'Rate limit exceeded - too many attempts'
        } else if (error.message.includes('phone_not_confirmed')) {
          reason = 'Phone number not confirmed'
        } else if (error.message.includes('invalid_phone')) {
          reason = 'Invalid phone number format'
        } else {
          reason = `Supabase error: ${error.message}`
        }
        
        setErrorReason(reason)
        setDemoMode(true)
        
        // Store phone number for demo
        sessionStorage.setItem('demo_phone', formattedPhone)
        sessionStorage.setItem('demo_reason', reason)
        
        toast.success('Demo Mode: Use OTP 123456')
        setStep('otp')
      } else {
        toast.success('OTP sent successfully!')
        setStep('otp')
      }
    } catch (error: any) {
      // Fallback to demo mode
      console.log('Network or other error:', error.message)
      const reason = `Connection error: ${error.message}`
      setErrorReason(reason)
      setDemoMode(true)
      
      sessionStorage.setItem('demo_phone', formattedPhone)
      sessionStorage.setItem('demo_reason', reason)
      
      toast.success('Demo Mode: Use OTP 123456')
      setStep('otp')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if we're in demo mode
      const demoPhone = sessionStorage.getItem('demo_phone')
      const demoUser = sessionStorage.getItem('demo_user')
      
      if (demoPhone && (otp === '123456' || otp === '000000')) {
        // Demo mode verification
        let userData
        
        if (demoUser) {
          // Test user login
          userData = JSON.parse(demoUser)
          simulateTestLogin(userData.phone)
        } else {
          // Generic demo user
          userData = {
            id: 'demo-' + Date.now(),
            phone: phoneNumber,
            username: 'user_' + phoneNumber.replace(/\D/g, '').slice(-4),
            full_name: 'Demo User',
            role: 'owner',
            restaurant_id: null,
            is_active: true,
            created_at: new Date().toISOString()
          }
        }
        
        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData))
        sessionStorage.removeItem('demo_phone')
        sessionStorage.removeItem('demo_user')
        sessionStorage.removeItem('demo_reason')
        
        toast.success(`Demo login successful! Welcome ${userData.name || 'Demo User'}`)
        router.push('/setup')
      } else {
        // Try real Supabase verification
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phoneNumber,
          token: otp,
          type: 'sms'
        })

        if (error) throw error

        // Check if user exists in our users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('phone', phoneNumber)
          .single()

        if (userData) {
          // Existing user - redirect based on role
          localStorage.setItem('currentUser', JSON.stringify(userData))
          router.push('/')
        } else {
          // New user - redirect to setup
          router.push('/setup')
        }
      }
    } catch (error: any) {
      const demoPhone = sessionStorage.getItem('demo_phone')
      if (demoPhone) {
        toast.error('Invalid OTP. For demo mode, use 123456')
      } else {
        toast.error('Invalid OTP. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Check if we're in demo mode on OTP step
  const isDemoMode = typeof window !== 'undefined' && step === 'otp' && sessionStorage.getItem('demo_phone')
  const storedReason = typeof window !== 'undefined' ? sessionStorage.getItem('demo_reason') : null
  const demoUser = typeof window !== 'undefined' ? sessionStorage.getItem('demo_user') : null
  const currentDemoUser = demoUser ? JSON.parse(demoUser) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 'phone' ? 'Enter Your Phone Number' : 'Verify OTP'}
            </h1>
            <p className="text-gray-600 mt-2">
              {step === 'phone' 
                ? 'We\'ll send you a verification code' 
                : `Code sent to ${phoneNumber}`}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Test Users Quick Access */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Users (Demo Mode)</h3>
                <div className="space-y-2">
                  {testUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setPhoneNumber(user.phone)
                        setFormattedPhoneNumber(user.phone)
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                    >
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-gray-600">{user.phone} • {user.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !phoneNumber}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit OTP
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-bold tracking-widest"
                    disabled={isLoading}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setDemoMode(false)
                  setErrorReason('')
                  sessionStorage.removeItem('demo_phone')
                  sessionStorage.removeItem('demo_user')
                  sessionStorage.removeItem('demo_reason')
                }}
                className="w-full text-gray-600 hover:text-gray-800 text-sm"
              >
                Change phone number
              </button>
            </form>
          )}
          
          {/* Demo Mode Notice */}
          {isDemoMode && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Demo Mode Active</h4>
                  {currentDemoUser ? (
                    <p className="text-sm text-amber-700 mt-1">
                      Logging in as <strong>{currentDemoUser.name}</strong> ({currentDemoUser.role})
                    </p>
                  ) : (
                    <p className="text-sm text-amber-700 mt-1">
                      {storedReason || 'Demo mode enabled'}
                    </p>
                  )}
                  <p className="text-sm text-amber-600 mt-2">
                    Use OTP: <strong>123456</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 