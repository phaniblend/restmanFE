'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  AlertTriangle,
  Calendar,
  Clock,
  ChefHat,
  ShoppingCart,
  PieChart,
  BarChart3,
  Activity
} from 'lucide-react'

interface Metric {
  label: string
  value: string
  change: number
  icon: any
  color: string
}

export default function BusinessSnapshotPage() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today')
  const [metrics, setMetrics] = useState<Metric[]>([])

  useEffect(() => {
    // Mock data - in real app, this would come from your API
    const mockMetrics: Metric[] = [
      { 
        label: 'Revenue', 
        value: '$52,300', 
        change: 12.5, 
        icon: DollarSign, 
        color: 'text-green-600' 
      },
      { 
        label: 'Orders', 
        value: '156', 
        change: 8.3, 
        icon: ShoppingCart, 
        color: 'text-blue-600' 
      },
      { 
        label: 'Kitchen Efficiency', 
        value: '94%', 
        change: 2.1, 
        icon: ChefHat, 
        color: 'text-purple-600' 
      },
      { 
        label: 'Customer Satisfaction', 
        value: '4.8/5', 
        change: 0.2, 
        icon: Users, 
        color: 'text-orange-600' 
      }
    ]
    setMetrics(mockMetrics)
  }, [dateRange])

  const criticalAlerts = [
    { type: 'wastage', message: 'Wastage at 8.5% - exceeds 5% target', severity: 'high' },
    { type: 'stock', message: '3 items critically low in inventory', severity: 'medium' },
    { type: 'cost', message: 'Food cost increased by 3% this week', severity: 'medium' },
    { type: 'theft', message: 'Unusual inventory variance detected', severity: 'critical' }
  ]

  const performanceData = {
    topDishes: [
      { name: 'Butter Chicken', orders: 45, revenue: '$13,500' },
      { name: 'Biryani', orders: 38, revenue: '$11,400' },
      { name: 'Paneer Tikka', orders: 32, revenue: '$8,000' }
    ],
    staffPerformance: [
      { name: 'Chef Raj', efficiency: '96%', rating: 4.9 },
      { name: 'Chef Priya', efficiency: '94%', rating: 4.8 },
      { name: 'Manager Amit', efficiency: '92%', rating: 4.7 }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Snapshot</h1>
                <p className="text-sm text-gray-600 mt-1">Real-time business performance overview</p>
              </div>
              
              {/* Date Range Selector */}
              <div className="flex space-x-2">
                {(['today', 'week', 'month'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      dateRange === range
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
                <div className={`flex items-center space-x-1 text-sm ${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
              <p className="text-sm text-gray-600">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Critical Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Critical Alerts
          </h3>
          <div className="space-y-3">
            {criticalAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'critical' 
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : alert.severity === 'high'
                    ? 'bg-orange-50 border-orange-200 text-orange-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}
              >
                <p className="font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Dishes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 text-orange-500 mr-2" />
              Top Performing Dishes
            </h3>
            <div className="space-y-3">
              {performanceData.topDishes.map((dish, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{dish.name}</p>
                    <p className="text-sm text-gray-600">{dish.orders} orders</p>
                  </div>
                  <span className="font-bold text-green-600">{dish.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
              Top Staff Performance
            </h3>
            <div className="space-y-3">
              {performanceData.staffPerformance.map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{staff.name}</p>
                    <p className="text-sm text-gray-600">Efficiency: {staff.efficiency}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold text-gray-900">{staff.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-shadow">
            View Full Report
          </button>
          <button className="bg-white border-2 border-orange-500 text-orange-600 p-4 rounded-xl font-semibold hover:bg-orange-50 transition-colors">
            Download PDF
          </button>
          <button className="bg-white border-2 border-blue-500 text-blue-600 p-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
            Compare Branches
          </button>
          <button className="bg-white border-2 border-green-500 text-green-600 p-4 rounded-xl font-semibold hover:bg-green-50 transition-colors">
            Set Targets
          </button>
        </div>
      </div>
    </div>
  )
} 