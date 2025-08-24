"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import StorefrontSidebar from "../../components/StoreFrontSidebar"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"

export default function MyListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Fetch listings from Flask API
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token") // Or wherever you store JWT
        const params = new URLSearchParams({
          limit: 50, // optional, adjust as needed
          offset: 0,
          status: statusFilter,
          category: categoryFilter,
        })
        const res = await fetch(`https://ripple-flask-server.onrender.com/storefront/listings?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to fetch listings")
        }
        const data = await res.json()
    
        // ✅ Format images and tags
        const formattedListings = data.listings.map((listing) => {
          let images = []
          let tags = []
          try {
            images = typeof listing.images === "string" ? JSON.parse(listing.images) : listing.images
          } catch (e) {
            images = []
          }
          try {
            tags = typeof listing.tags === "string" ? JSON.parse(listing.tags) : listing.tags
          } catch (e) {
            tags = []
          }
    
          return {
            ...listing,
            images,
            tags,
          }
        })
    
        setListings(formattedListings)
      } catch (err) {
        console.error("Error fetching listings:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    

    fetchListings()
  }, [statusFilter, categoryFilter]) // refetch on filter change

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter
    const matchesCategory = categoryFilter === "all" || listing.category.toLowerCase() === categoryFilter.toLowerCase()
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "sold":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="flex min-h-screen bg-[#111111]">
      <StorefrontSidebar />

      <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 mt-0 md:mt-30">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Listings</h1>
            <p className="text-gray-400">Manage your marketplace listings</p>
          </div>
          <Button className="bg-green-500 hover:bg-green-600 text-black font-medium">
            <span className="mr-2">-</span>
            New Listing
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700 text-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="nft">NFT</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading listings...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No listings found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="bg-[#111111] border-[#1a1a1a] hover:border-green-500 transition ease duration-500 overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={listing.images?.[0] || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-3 right-3 ${getStatusColor(listing.status)}`}>{listing.status}</Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-2 truncate">{listing.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{listing.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-green-400 font-bold text-lg">${listing.price}</span>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>{listing.views}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
