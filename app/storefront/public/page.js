"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, X, Music, Play, Pause, Volume2, VolumeX, ChevronDown, ChevronUp, Heart, ShoppingCart, Eye, Star } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

const ITEMS_PER_PAGE = 16

// Background music data
const backgroundTracks = [
  { id: 1, name: "Ambient Waves", artist: "Digital Dreams", duration: "3:45", isPlaying: false },
  { id: 2, name: "Neon Nights", artist: "Cyber Sounds", duration: "4:12", isPlaying: false },
  { id: 3, name: "Glass Reflections", artist: "Modern Vibes", duration: "3:28", isPlaying: false },
  { id: 4, name: "Digital Horizon", artist: "Future Bass", duration: "4:55", isPlaying: false },
]

// Static background options
const backgroundOptions = [
  { id: 1, name: "Gradient Purple", class: "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" },
  { id: 2, name: "Neon Green", class: "bg-gradient-to-br from-green-900 via-teal-900 to-cyan-900" },
  { id: 3, name: "Sunset Orange", class: "bg-gradient-to-br from-orange-900 via-red-900 to-pink-900" },
  { id: 4, name: "Deep Ocean", class: "bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" },
]

export default function PublicStorefrontPage() {
  const [listings, setListings] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriceRange, setSelectedPriceRange] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [showFilters, setShowFilters] = useState(false)
  
  // Background music state
  const [showMusicPanel, setShowMusicPanel] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  
  // Background customization
  const [selectedBackground, setSelectedBackground] = useState(backgroundOptions[0])
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch listings
  const fetchListings = async () => {
    setLoading(true)
    try {
      const res = await fetch(`https://ripple-flask-server.onrender.com/marketplace/listings?page=1&limit=100`)
      const data = await res.json()
      setListings(data.listings || [])
      setFilteredListings(data.listings || [])
    } catch (err) {
      console.error("Failed to fetch listings", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  // Filter and search logic
  useEffect(() => {
    let filtered = [...listings]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(listing => listing.category === selectedCategory)
    }

    // Price range filter
    if (selectedPriceRange !== "all") {
      const [min, max] = selectedPriceRange.split("-").map(Number)
      filtered = filtered.filter(listing => {
        const price = parseFloat(listing.price)
        if (max) {
          return price >= min && price <= max
        } else {
          return price >= min
        }
      })
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        // Recent (default)
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    setFilteredListings(filtered)
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE))
    setCurrentPage(1)
  }, [listings, searchTerm, selectedCategory, selectedPriceRange, sortBy])

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredListings.slice(startIndex, endIndex)
  }

  // Music controls
  const playTrack = (track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Format functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatCategory = (category) => {
    if (!category) return ""
    return category
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-")
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "digital":
        return "bg-blue-500"
      case "physical":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const categories = ["all", ...new Set(listings.map(l => l.category))]
  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under $50", value: "0-50" },
    { label: "$50 - $200", value: "50-200" },
    { label: "$200 - $500", value: "200-500" },
    { label: "$500 - $1000", value: "500-1000" },
    { label: "Over $1000", value: "1000-99999" },
  ]

  return (
    <div className={`min-h-screen ${selectedBackground.class} relative overflow-hidden`}>
      {/* Glassy overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      {/* Background Music Panel */}
      <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${showMusicPanel ? 'w-80' : 'w-12'}`}>
        <div className="glass-effect-darker rounded-lg border border-gray-700/50">
          {/* Music Toggle Button */}
          <Button
            onClick={() => setShowMusicPanel(!showMusicPanel)}
            className="w-12 h-12 bg-transparent hover:bg-white/10 border-0 text-white"
          >
            <Music className="w-5 h-5" />
          </Button>
          
          {/* Expanded Music Panel */}
          {showMusicPanel && (
            <div className="p-4 pt-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">Background Music</h3>
                <Button
                  onClick={() => setShowMusicPanel(false)}
                  className="w-6 h-6 bg-transparent hover:bg-white/10 border-0 text-gray-400 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Current Track */}
              {currentTrack && (
                <div className="glass-effect p-3 rounded-lg mb-3 border border-gray-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white text-sm font-medium">{currentTrack.name}</p>
                      <p className="text-gray-400 text-xs">{currentTrack.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={togglePlayPause}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-black p-0"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={toggleMute}
                        className="w-8 h-8 bg-transparent hover:bg-white/10 border border-gray-600 text-white p-0"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              )}
              
              {/* Track List */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {backgroundTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                    onClick={() => playTrack(track)}
                  >
                    <div>
                      <p className="text-white text-sm">{track.name}</p>
                      <p className="text-gray-400 text-xs">{track.artist}</p>
                    </div>
                    <span className="text-gray-400 text-xs">{track.duration}</span>
                  </div>
                ))}
              </div>
              
              {/* Background Selection */}
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <p className="text-white text-sm font-medium mb-2">Background</p>
                <div className="grid grid-cols-2 gap-2">
                  {backgroundOptions.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBackground(bg)}
                      className={`h-8 rounded-lg border-2 transition-all ${
                        selectedBackground.id === bg.id ? 'border-green-500' : 'border-gray-600/50'
                      } ${bg.class}`}
                      title={bg.name}
                    >
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="glass-effect-darker border-b border-gray-700/50 pt-25">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Public <span className="text-green-400">Storefront</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Discover amazing digital and physical items from our curated marketplace
              </p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search for amazing items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-black/20 backdrop-blur-sm border border-gray-600/50 focus:border-green-500 focus:ring-0 text-white placeholder-gray-400 text-lg"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 px-6 bg-white/10 backdrop-blur-sm border border-gray-600/50 hover:bg-white/20 text-white"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                  {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </Button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="glass-effect p-6 rounded-lg border border-gray-600/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="bg-black/20 border-gray-600/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                              {category === "all" ? "All Categories" : formatCategory(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                      <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                        <SelectTrigger className="bg-black/20 border-gray-600/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700">
                          {priceRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value} className="text-white hover:bg-gray-700">
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="bg-black/20 border-gray-600/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700">
                          <SelectItem value="recent" className="text-white hover:bg-gray-700">Most Recent</SelectItem>
                          <SelectItem value="price-low" className="text-white hover:bg-gray-700">Price: Low to High</SelectItem>
                          <SelectItem value="price-high" className="text-white hover:bg-gray-700">Price: High to Low</SelectItem>
                          <SelectItem value="name" className="text-white hover:bg-gray-700">Name A-Z</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-600/30">
                    <p className="text-gray-300">
                      Showing {filteredListings.length} of {listings.length} items
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCategory("all")
                        setSelectedPriceRange("all")
                        setSortBy("recent")
                      }}
                      className="bg-transparent hover:bg-white/10 text-gray-300 border border-gray-600/50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="glass-effect-darker p-8 rounded-lg inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                <p className="text-gray-300 text-lg">Loading amazing items...</p>
              </div>
            </div>
          ) : getCurrentPageItems().length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getCurrentPageItems().map((listing) => (
                  <Link key={listing.id} href={`/storefront/public/${listing.id}`}>
                    <Card className="glass-effect border border-gray-600/30 hover:border-green-500/50 transition-all duration-300 group cursor-pointer h-full">
                      <CardContent className="p-0 h-full flex flex-col">
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden rounded-t-lg">
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                              <div className="flex space-x-2">
                                <Button size="sm" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0">
                                  <Heart className="w-4 h-4" />
                                </Button>
                              </div>
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black">
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="absolute top-3 left-3">
                            <Badge className={`${getTypeColor(listing.type)} text-white text-xs`}>
                              {formatCategory(listing.category)}
                            </Badge>
                          </div>
                          
                          {listing.stock_quantity <= 5 && listing.stock_quantity > 0 && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-red-500 text-white text-xs animate-pulse">
                                Only {listing.stock_quantity} left!
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
                            {listing.title}
                          </h3>
                          
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2 flex-1">
                            {listing.description}
                          </p>

                          {/* Attributes */}
                          {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {Object.entries(listing.attributes)
                                .slice(0, 2)
                                .map(([key, value]) => (
                                  <Badge key={key} variant="outline" className="text-xs border-gray-600/50 text-gray-300 bg-white/5">
                                    {key}: {value}
                                  </Badge>
                                ))}
                            </div>
                          )}

                          {/* Price and Rating */}
                          <div className="flex items-center justify-between mt-auto">
                            <div className="text-2xl font-bold text-green-400">
                              {formatPrice(listing.price)}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-gray-300 text-sm">4.8</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="bg-white/10 backdrop-blur-sm border border-gray-600/50 hover:bg-white/20 text-white disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 ${
                            currentPage === pageNum
                              ? 'bg-green-500 text-black'
                              : 'bg-white/10 backdrop-blur-sm border border-gray-600/50 hover:bg-white/20 text-white'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-white/10 backdrop-blur-sm border border-gray-600/50 hover:bg-white/20 text-white disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="glass-effect-darker p-8 rounded-lg inline-block">
                <div className="text-gray-400 text-xl mb-4">No items found</div>
                <p className="text-gray-500">Try adjusting your search terms or filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}