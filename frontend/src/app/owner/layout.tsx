import Link from 'next/link'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-blue-700">Owner Panel</div>
        <nav className="space-x-4">
          <Link href="/owner/analytics" className="text-gray-700 hover:text-blue-700 font-medium">Analytics</Link>
          <Link href="/owner/branches" className="text-gray-700 hover:text-blue-700 font-medium">Branches</Link>
          <Link href="/owner/snapshot" className="text-gray-700 hover:text-blue-700 font-medium">Snapshot</Link>
        </nav>
      </header>
      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
} 