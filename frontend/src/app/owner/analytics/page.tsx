"use client"

import { useEffect, useState } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface IngredientDetail {
  name: string
  expectedUsage: number
  actualUsed: number
  costPerUnit: number
  investedForIngredient: number
  wastageForIngredient: number
  discrepancyForIngredient: number
}

interface MenuAnalytics {
  menu_item: string
  category: string
  invested: string
  expected_yield: number
  actual_sales: number
  wastage: number
  discrepancy: string
  alert: string
  ingredientDetails: IngredientDetail[]
}

export default function OwnerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<MenuAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/inventory-analytics')
      const data = await res.json()
      if (data.success) {
        setAnalytics(data.summary)
      } else {
        setError(data.error || 'Failed to fetch analytics')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Extract critical/high alerts
  const criticalAlerts = analytics.filter(item => item.alert && (item.alert.toLowerCase().includes('critical') || item.alert.toLowerCase().includes('urgent') || item.alert.toLowerCase().includes('high')))

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Owner Analytics Dashboard</h1>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>
      {criticalAlerts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
            <span className="text-lg font-semibold text-red-700">Critical Alerts</span>
          </div>
          <ul className="space-y-1 ml-8">
            {criticalAlerts.map((item, idx) => (
              <li key={idx} className="text-red-700 font-medium">
                {item.menu_item}: {item.alert}
              </li>
            ))}
          </ul>
        </div>
      )}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading analytics...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <div className="space-y-8">
          {analytics.map((item, idx) => (
            <div key={idx} className={`bg-white rounded-xl shadow p-6 border ${item.alert && (item.alert.toLowerCase().includes('critical') || item.alert.toLowerCase().includes('urgent')) ? 'border-red-400' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{item.menu_item}</h2>
                  <p className="text-sm text-gray-500">Category: {item.category}</p>
                </div>
                {item.alert && (
                  <span className={`px-3 py-1 rounded-full font-medium text-sm animate-pulse ${item.alert.toLowerCase().includes('critical') || item.alert.toLowerCase().includes('urgent') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>{item.alert}</span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500">Invested</div>
                  <div className="font-bold text-lg text-blue-700">${item.invested}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Expected Yield</div>
                  <div className="font-bold text-lg">{item.expected_yield}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Actual Sales</div>
                  <div className="font-bold text-lg">{item.actual_sales}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Wastage</div>
                  <div className="font-bold text-lg text-red-600">{item.wastage}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Discrepancy</div>
                  <div className={`font-bold text-lg ${Math.abs(Number(item.discrepancy)) > 0 ? 'text-orange-600' : 'text-green-700'}`}>{item.discrepancy}</div>
                </div>
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-blue-600">Ingredient Breakdown</summary>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {item.ingredientDetails.map((ing, i) => (
                    <div key={i} className="bg-gray-50 rounded p-3 border border-gray-100">
                      <div className="font-medium text-gray-800">{ing.name}</div>
                      <div className="text-xs text-gray-500">Expected Usage: {ing.expectedUsage}</div>
                      <div className="text-xs text-gray-500">Actual Used: {ing.actualUsed}</div>
                      <div className="text-xs text-gray-500">Cost/Unit: ${ing.costPerUnit}</div>
                      <div className="text-xs text-gray-500">Invested: ${ing.investedForIngredient.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Wastage: {ing.wastageForIngredient}</div>
                      <div className={`text-xs font-semibold ${Math.abs(ing.discrepancyForIngredient) > 0 ? 'text-orange-600' : 'text-green-700'}`}>Discrepancy: {ing.discrepancyForIngredient}</div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 