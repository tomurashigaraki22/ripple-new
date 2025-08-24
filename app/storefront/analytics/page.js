"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import StorefrontSidebar from "../../components/StoreFrontSidebar"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Eye, Box, DollarSign } from "lucide-react"
import ResponsiveGraph from "../../components/ResponsiveGraph"
import { useAuth } from "../../contexts/AuthContext"

export default function StorefrontAnalytics() {
  const router = useRouter()
  const { token } = useAuth() // Assumes JWT stored in context
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(
          "http://172.20.10.2:1234/storefront/analytics/metrics?range=30d",
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        if (res.ok) setAnalytics(data.analytics)
        else console.error("Error fetching analytics:", data.error)
      } catch (err) {
        console.error("Failed to fetch analytics:", err)
      } finally {
        setLoading(false)
      }
    }

    if (token) fetchAnalytics()
  }, [token])

  const renderTopCards = overview => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
      <Card className="bg-[#1a1a1a] border-gray-700 text-white py-4 rounded-lg shadow-lg group hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]">
        <CardContent className="flex flex-row items-center justify-between w-full">
          <div>
            <h2 className="text-xl text-gray-400">Total Views</h2>
            <p className="text-2xl font-bold">{overview?.totalViews || 0}</p>
          </div>
          <Eye color="#fffe27" size={25} className="inline-block mr-2" />
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-gray-700 text-white py-4 rounded-lg shadow-lg group hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]">
        <CardContent className="flex flex-row items-center justify-between w-full">
          <div>
            <h2 className="text-xl text-gray-400">Total Earnings</h2>
            <p className="text-2xl font-bold">{overview?.totalEarnings || 0}</p>
          </div>
          <p className="text-[#fffe27]">XRPB</p>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-gray-700 text-white py-4 rounded-lg shadow-lg group hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]">
        <CardContent className="flex flex-row items-center justify-between w-full">
          <div>
            <h2 className="text-xl text-gray-400">Active Listings</h2>
            <p className="text-2xl font-bold">{overview?.totalListings || 0}</p>
          </div>
          <Box color="#fffe27" size={25} className="inline-block mr-2" />
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-gray-700 text-white py-4 rounded-lg shadow-lg group hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]">
        <CardContent className="flex flex-row items-center justify-between w-full">
          <div>
            <h2 className="text-xl text-gray-400">Conversion Rate</h2>
            <p className="text-2xl font-bold">
              {overview?.conversionRate
                ? (parseFloat(overview.conversionRate) * 100).toFixed(2)
                : 0}{" "}
              %
            </p>
          </div>
          <DollarSign color="#fffe27" size={20} className="inline-block mr-2" />
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#111111]">
      <StorefrontSidebar />
      <div className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 md:p-8 mt-30 md:mt-30 lg:mt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Analytics</h1>
            <p className="text-gray-400">See how your listings are performing</p>
          </div>
          <Button
            className="bg-green-500 hover:bg-green-600 text-black font-medium"
            onClick={() => router.push("/storefront")}
          >
            <span className="mr-2">+</span>
            Return To Dashboard
          </Button>
        </div>

        {/* Loading or no data */}
        {loading && <div className="text-white p-8">Loading analytics...</div>}
        {!loading && !analytics && <div className="text-white p-8">No analytics data available</div>}

        {/* Analytics Content */}
        {!loading && analytics && (
          <>
            {renderTopCards(analytics.overview)}

            {/* Revenue Chart */}
            <div className="space-y-6 sm:space-y-8">
              <ResponsiveGraph
                title="Revenue Analytics"
                data={analytics.monthlyData?.map(d => ({ date: d.month, revenue: d.earnings })) || []}
                xData="date"
                yData="revenue"
                timeframe="monthly"
                chartType="area"
                className="w-full"
              />
            </div>

            {/* Top Listings */}
            {analytics.topListings?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-white text-xl mb-4">Top Listings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.topListings.map(listing => (
                    <Card key={listing.id} className="bg-[#1a1a1a] border-gray-700 text-white p-4">
                      <CardContent>
                        <h3 className="font-bold">{listing.title}</h3>
                        <p>Views: {listing.views}</p>
                        <p>Earnings: {listing.earnings}</p>
                        <p>Orders: {listing.orders}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Category Performance */}
            {analytics.categoryPerformance?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-white text-xl mb-4">Category Performance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.categoryPerformance.map(cat => (
                    <Card key={cat.name} className="bg-[#1a1a1a] border-gray-700 text-white p-4">
                      <CardContent>
                        <h3 className="font-bold capitalize">{cat.name}</h3>
                        <p>Listings: {cat.listings}</p>
                        <p>Views: {cat.views}</p>
                        <p>Earnings: {cat.earnings}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
