'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ChefHat, Package, MessageSquare, User } from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Recipes', href: '/recipes', icon: ChefHat },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Support', href: '/support', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User }
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 ${
                isActive 
                  ? 'text-orange-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
} 