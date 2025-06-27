'use client'

import { useRouter } from 'next/navigation'
import { UserPlus, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SignupPage() {
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
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Get Started with RestMan</h1>
            <p className="text-gray-600 mt-2">Create your restaurant account</p>
          </div>

          {/* Signup Options */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/auth/phone')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Sign up with Phone</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600">
                  Login
                </Link>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-semibold mb-3">What you'll get:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                AI-powered recipe suggestions
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Real-time inventory tracking
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Multi-role staff management
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Smart wastage alerts
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 