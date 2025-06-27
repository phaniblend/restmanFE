'use client'

import { useRouter } from 'next/navigation'
import { Phone, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()

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
            <h1 className="text-2xl font-bold text-gray-900">Welcome to RestMan</h1>
            <p className="text-gray-600 mt-2">Restaurant Management Made Simple</p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/auth/phone')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Login with Phone</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-orange-500 font-semibold hover:text-orange-600">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Access */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              For demo access, use phone: +1234567890
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 