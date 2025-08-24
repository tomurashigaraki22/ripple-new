"use client"
import { useState, useEffect } from "react"
import { Users, Package, CreditCard, TrendingUp, Clock, DollarSign } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import AdminLayout from "../components/AdminLayout"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingListings: 0,
    activeMemberships: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const { user, token, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || !token) {
        router.push('/admin/login')
        return
      }
      fetchDashboardData()
    }
  }, [user, loading, router])
  

  const fetchDashboardData = async () => {
    try {
      
      if (!token  && !loading) {
        router.push('/admin/login')
        return
      }

      const response = await fetch("https://ripple-flask-server.pxxl.pro/admin/metrics/dashboard", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/admin/login')
        }
        throw new Error("Failed to fetch dashboard data")
      }

      const data = await response.json()
      setStats(data.stats)
      setRecentActivity(data.recentActivity)
    } catch (err) {
      console.error(err)
    }
  }

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: <Users className="w-8 h-8" />, color: "from-blue-500 to-blue-600" },
    { title: "Total Listings", value: stats.totalListings, icon: <Package className="w-8 h-8" />, color: "from-green-500 to-green-600" },
    { title: "Total Orders", value: stats.totalOrders, icon: <CreditCard className="w-8 h-8" />, color: "from-purple-500 to-purple-600" },
    { title: "Revenue (XRPB)", value: stats.totalRevenue, icon: <DollarSign className="w-8 h-8" />, color: "from-yellow-500 to-yellow-600" },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8 text-white mt-20">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-gray-400 mt-2">Welcome back, {user?.username}</p>
          </div>
          <div className="text-right text-gray-400 text-sm">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-[#111111]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#39FF14]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value.toLocaleString()}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111111]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#39FF14]" /> Recent Activity
          </h3>
          <div className="space-y-4 overflow-y-auto"
              style={{ maxHeight: '50vh' /* adjust as needed for desktop */, minHeight: '200px' }}>
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 bg-[#111111]/30 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'user' ? 'bg-blue-500/20 text-blue-400' :
                  activity.type === 'listing' ? 'bg-green-500/20 text-green-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {activity.type === 'user' ? <Users className="w-5 h-5" /> :
                  activity.type === 'listing' ? <Package className="w-5 h-5" /> :
                  <CreditCard className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.description}</p>
                  <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
