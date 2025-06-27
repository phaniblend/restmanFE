'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { locales } from '../../i18n'
import { getLanguageName } from '../lib/i18n-utils'

interface LanguageSelectorProps {
  currentLocale: string
  className?: string
}

export default function LanguageSelector({ currentLocale, className = '' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (locale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '')
    
    // Navigate to the new locale
    router.push(`/${locale}${pathWithoutLocale}`)
    setIsOpen(false)
  }

  const currentLanguage = getLanguageName(currentLocale)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white/90 transition-all duration-200 shadow-sm"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{currentLanguage}</span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            <div className="p-2 max-h-80 overflow-y-auto">
              {/* US English (Primary) */}
              <div className="mb-2">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Primary Market
                </div>
                <button
                  onClick={() => handleLanguageChange('en-US')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentLocale === 'en-US'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🇺🇸</span>
                    <div className="text-left">
                      <div className="font-medium">English (US)</div>
                      <div className="text-xs text-gray-500">Primary market</div>
                    </div>
                  </div>
                  {currentLocale === 'en-US' && <Check className="w-4 h-4 text-orange-600" />}
                </button>
              </div>

              {/* Major Languages */}
              <div className="mb-2">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Major Languages
                </div>
                {['en-GB', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'].map((locale: string) => (
                  <button
                    key={locale}
                    onClick={() => handleLanguageChange(locale)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentLocale === locale
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getFlagEmoji(locale)}</span>
                      <span className="font-medium">{getLanguageName(locale)}</span>
                    </div>
                    {currentLocale === locale && <Check className="w-4 h-4 text-orange-600" />}
                  </button>
                ))}
              </div>

              {/* Other Languages */}
              <div>
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Other Languages
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {locales.filter((locale: string) => !['en-US', 'en-GB', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'].includes(locale)).map((locale: string) => (
                    <button
                      key={locale}
                      onClick={() => handleLanguageChange(locale)}
                      className={`flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                        currentLocale === locale
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{getFlagEmoji(locale)}</span>
                        <span className="truncate">{getLanguageName(locale)}</span>
                      </div>
                      {currentLocale === locale && <Check className="w-3 h-3 text-orange-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-3 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                All prices in USD • US market primary
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Helper function to get flag emoji for locale
function getFlagEmoji(locale: string): string {
  const flagMap: { [key: string]: string } = {
    'en-US': '🇺🇸',
    'en-GB': '🇬🇧',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'it': '🇮🇹',
    'pt': '🇵🇹',
    'ru': '🇷🇺',
    'zh': '🇨🇳',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'ar': '🇸🇦',
    'hi': '🇮🇳',
    'bn': '🇧🇩',
    'ur': '🇵🇰',
    'tr': '🇹🇷',
    'nl': '🇳🇱',
    'sv': '🇸🇪',
    'no': '🇳🇴',
    'da': '🇩🇰',
    'fi': '🇫🇮',
    'pl': '🇵🇱',
    'cs': '🇨🇿',
    'sk': '🇸🇰',
    'hu': '🇭🇺',
    'ro': '🇷🇴',
    'bg': '🇧🇬',
    'hr': '🇭🇷',
    'sl': '🇸🇮',
    'et': '🇪🇪',
    'lv': '🇱🇻',
    'lt': '🇱🇹',
    'el': '🇬🇷',
    'he': '🇮🇱',
    'th': '🇹🇭',
    'vi': '🇻🇳',
    'id': '🇮🇩',
    'ms': '🇲🇾',
    'fa': '🇮🇷',
    'uk': '🇺🇦',
    'be': '🇧🇾',
    'ka': '🇬🇪',
    'am': '🇪🇹',
    'sw': '🇹🇿',
    'yo': '🇳🇬',
    'ig': '🇳🇬',
    'zu': '🇿🇦',
    'af': '🇿🇦',
    'is': '🇮🇸',
    'mt': '🇲🇹',
    'cy': '🇬🇧',
    'ga': '🇮🇪',
    'gd': '🇬🇧',
    'eu': '🇪🇸',
    'ca': '🇪🇸',
    'gl': '🇪🇸',
    'ast': '🇪🇸',
    'oc': '🇫🇷',
    'br': '🇫🇷',
    'co': '🇫🇷',
    'fur': '🇮🇹',
    'lad': '🇪🇸',
    'rm': '🇨🇭',
    'vec': '🇮🇹',
    'lmo': '🇮🇹',
    'pms': '🇮🇹',
    'sc': '🇮🇹',
    'scn': '🇮🇹',
    'nap': '🇮🇹'
  }
  
  return flagMap[locale] || '🌐'
} 