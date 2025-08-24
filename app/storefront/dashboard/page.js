"use client"

import { useEffect, useState } from "react"
import { Eye, Package, TrendingUp, DollarSign, Menu } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import StorefrontSidebar from "../../components/StoreFrontSidebar"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"

export default function StorefrontDashboard() {
  const router = useRouter()
  const { token } = useAuth()

  const [publicUrl] = useState("https://ripplebids.com/storefront/public/8966824e-28e4-4829-afb6-663ac276b7ad")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentListings, setRecentListings] = useState([])
  const [recentOrders, setRecentOrders] = useState([])

  const formatNumber = (n) => Number(n || 0).toLocaleString()
  const formatAmount = (n) => `${formatNumber(n)} XRPB`

  const fetchDashboardData = async () => {
    try {
      if (!token) {
        setLoading(false)
        return
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
      console.log("Token: ", token)

      // Stats
      const statsResponse = await fetch("https://ripple-flask-server.onrender.com/storefront/stats", { headers: headers })
      console.log("StatsR: ", statsResponse)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      } else if (statsResponse.status === 401) {
        router.push("/storefront/login")
        return
      }

      // Recent listings (limit 5)
      const listingsResponse = await fetch("https://ripple-flask-server.onrender.com/storefront/listings?limit=5", { headers: headers })
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json()
        setRecentListings(Array.isArray(listingsData.listings) ? listingsData.listings : [])
      }

      // Recent orders (limit 5)
      const ordersResponse = await fetch("https://ripple-flask-server.onrender.com/storefront/orders?limit=5", { headers: headers })
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setRecentOrders(Array.isArray(ordersData.orders) ? ordersData.orders : [])
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const copyToClipboard = () => navigator.clipboard.writeText(publicUrl)

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
      case "completed":
      case "delivered":
        return "bg-green-500/20 text-green-400"
      case "sold":
        return "bg-red-500/20 text-red-400"
      case "shipped":
        return "bg-blue-500/20 text-blue-400"
      case "paid":
        return "bg-emerald-500/20 text-emerald-400"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const statCards = [
    { title: "Total Listings", value: formatNumber(stats?.totalListings ?? 0), icon: Package, color: "text-green-400" },
    { title: "Active Listings", value: formatNumber(stats?.activeListings ?? 0), icon: TrendingUp, color: "text-green-400" },
    { title: "Total Views", value: formatNumber(stats?.totalViews ?? 0), icon: Eye, color: "text-blue-400" },
    { title: "Total Earnings", value: formatNumber(stats?.totalEarnings ?? 0), icon: DollarSign, color: "text-green-400", currency: "XRPB" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111] text-gray-300">
        Loading dashboard…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#111111] mt-20">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden sm:block">
        <StorefrontSidebar />
      </div>

      {/* Mobile sidebar toggle */}
      <div className="sm:hidden absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Overlay mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 sm:hidden" onClick={() => setSidebarOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-64 bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <StorefrontSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 mt-0 md:mt-8">

        {/* Public Storefront Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-2xl font-bold text-white">Public Storefront</h2>
            <Eye className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-2">
            <p className="text-gray-400 text-sm">Your Public Storefront URL</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
                <p className="text-gray-300 text-sm font-mono truncate">{publicUrl}</p>
              </div>
              <Button onClick={copyToClipboard} className="bg-green-500 hover:bg-green-600 text-black font-medium w-full sm:w-auto">
                Copy Link
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back to your storefront</p>
          </div>
          <Button className="bg-green-500 hover:bg-green-600 text-black font-medium w-full sm:w-auto">
            <Package className="w-4 h-4 mr-2" />
            New Listing
          </Button>
        </div>

        {/* Stats Grid (live data) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.title}</p>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                        {stat.currency && <span className="text-green-400 text-sm font-medium">{stat.currency}</span>}
                      </div>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Listings (live data) */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Listings</CardTitle>
              <Button variant="ghost" className="text-green-400 hover:text-green-300">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentListings.length === 0 && (
                <p className="text-gray-400 text-sm">No listings yet.</p>
              )}
              {recentListings.map((listing) => {
                const Icon = Package
                return (
                  <div key={listing.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-800/30 rounded-lg gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{listing.title}</p>
                        <p className="text-gray-400 text-sm">{formatAmount(listing.price)}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-gray-300 text-sm">{formatNumber(listing.views)} views</p>
                      <Badge className={getStatusColor(listing.status)}>{listing.status}</Badge>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Recent Orders (live data) */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Orders</CardTitle>
              <Button variant="ghost" className="text-green-400 hover:text-green-300">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentOrders.length === 0 && (
                <p className="text-gray-400 text-sm">No orders yet.</p>
              )}
              {recentOrders.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-800/30 rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {order.listing_title || order.name || "Order"}
                      </p>
                      <p className="text-gray-400 text-sm">#{String(order.id).slice(0, 10)}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-green-400 font-medium">{formatAmount(order.amount)}</p>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
