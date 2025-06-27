import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { Providers } from '../providers'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import SessionGate from '../components/SessionGate'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RestMan - Professional Restaurant Management System',
  description: 'Complete restaurant management system for inventory, recipes, orders, and RestMan-powered insights. Built for US restaurants.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RestMan',
  },
  formatDetection: {
    telephone: false,
  },
  keywords: ['restaurant management', 'inventory', 'recipes', 'POS system', 'restaurant software'],
  authors: [{ name: 'RestMan Team' }],
  category: 'Restaurant Management',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f97316', // Orange theme color
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="restman">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icon-96x96.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icon-128x128.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="384x384" href="/icon-384x384.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RestMan" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="RestMan" />
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <Providers>
          <SessionGate>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <BottomNav />
          </SessionGate>
        </Providers>
      </body>
    </html>
  )
} 