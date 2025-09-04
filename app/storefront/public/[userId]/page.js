"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Store,
  Calendar,
  Eye,
  Package,
  Star,
  Award,
  TrendingUp,
  Heart,
  Share2,
  ExternalLink,
  Music,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useAuth } from "../../../contexts/AuthContext"

export default function PublicStorefront() {
  const params = useParams()
  const { userId } = params
  const {token} = useAuth()

  const [storefront, setStorefront] = useState(null)
  const [allListings, setAllListings] = useState([]) // Store all listings
  const [displayedListings, setDisplayedListings] = useState([]) // Currently displayed listings
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [storefrontSettings, setStorefrontSettings] = useState(null)
  
  // Frontend pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6
  
  // Enhanced music state
  const [showMusicPanel, setShowMusicPanel] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  
  // Enhanced background options
  const [selectedBackground, setSelectedBackground] = useState({
    id: 1,
    name: "Neon Cyber",
    class: "bg-gradient-to-br from-black via-purple-900/50 to-green-900/30",
    overlay: "bg-black/40"
  })

  const backgroundOptions = [
    {
      id: 1,
      name: "Neon Cyber",
      class: "bg-gradient-to-br from-black via-purple-900/50 to-green-900/30",
      overlay: "bg-black/40"
    },
    {
      id: 2,
      name: "Electric Blue",
      class: "bg-gradient-to-br from-blue-900 via-cyan-900/60 to-black",
      overlay: "bg-blue-900/20"
    },
    {
      id: 3,
      name: "Sunset Glow",
      class: "bg-gradient-to-br from-orange-900/80 via-red-900/60 to-black",
      overlay: "bg-orange-900/30"
    },
    {
      id: 4,
      name: "Deep Ocean",
      class: "bg-gradient-to-br from-indigo-900 via-blue-900/70 to-black",
      overlay: "bg-indigo-900/25"
    },
    {
      id: 5,
      name: "Matrix Green",
      class: "bg-gradient-to-br from-green-900/80 via-emerald-900/60 to-black",
      overlay: "bg-green-900/30"
    }
  ]

  // Enhanced music tracks
  const backgroundTracks = [
    { id: 1, name: "Cyberpunk Vibes", artist: "Neon Dreams", duration: "4:23", url: "https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC" },
    { id: 2, name: "Digital Horizon", artist: "Synthwave Collective", duration: "3:45", url: "https://open.spotify.com/embed/track/1A2tKUQC4uLU6hMCjMI75M" },
    { id: 3, name: "Glass Reflections", artist: "Future Bass", duration: "5:12", url: "https://open.spotify.com/embed/track/2tKUQC4uLU6hMCjMI75M1A" },
    { id: 4, name: "Neon Nights", artist: "Cyber Sounds", duration: "4:08", url: "https://open.spotify.com/embed/track/3KUQCuLU6hMCjMI75M1A2t" }
  ]

  useEffect(() => {
    if (userId) {
      fetchStorefront()
      fetchStorefrontSettings()
    }
  }, [userId])

  // Update displayed listings when filters change
  useEffect(() => {
    updateDisplayedListings()
  }, [allListings, searchTerm, selectedCategory, sortBy, currentPage])

  // Fetch storefront customization settings
  const fetchStorefrontSettings = async () => {
    try {
      const response = await fetch(`https://ripple-flask-server.onrender.com/storefront/me/settings/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setStorefrontSettings(data.settings)
      }
    } catch (error) {
      console.error("Failed to fetch storefront settings:", error)
    }
  }

  const fetchStorefront = async () => {
    try {
      setLoading(true)
      const authToken = localStorage.getItem("token")
      
      const response = await fetch(`https://ripple-flask-server.onrender.com/storefront/listings`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Create mock storefront object
        const mockStorefront = {
          username: userId,
          stats: {
            totalListings: data.listings?.length || 0,
            totalViews: data.listings?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0
          }
        }
        
        setStorefront(mockStorefront)
        setAllListings(data.listings || [])
      } else if (response.status === 404) {
        setStorefront(null)
      }
    } catch (error) {
      console.error("Failed to fetch storefront:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter, sort and paginate listings on frontend
  const updateDisplayedListings = () => {
    let filteredListings = [...allListings]

    // Apply search filter
    if (searchTerm) {
      filteredListings = filteredListings.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filteredListings = filteredListings.filter(listing => listing.category === selectedCategory)
    }

    // Apply sorting
    filteredListings.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at)
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at)
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price)
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price)
        case "views":
          return (b.views || 0) - (a.views || 0)
        default:
          return 0
      }
    })

    // Apply pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedListings = filteredListings.slice(startIndex, endIndex)

    setDisplayedListings(paginatedListings)
  }

  // Calculate total pages
  const getTotalPages = () => {
    let filteredCount = allListings.length

    if (searchTerm) {
      filteredCount = allListings.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      ).length
    }

    if (selectedCategory) {
      filteredCount = allListings.filter(listing => {
        const matchesSearch = !searchTerm || 
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch && listing.category === selectedCategory
      }).length
    }

    return Math.ceil(filteredCount / ITEMS_PER_PAGE)
  }

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    const totalPages = getTotalPages()
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, sortBy])

  const shareStorefront = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${storefront.username}'s Storefront`,
          text: `Check out ${storefront.username}'s amazing listings!`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Enhanced music controls
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

  const categories = [...new Set(allListings.map((listing) => listing.category))]

  // Enhanced glassmorphism classes
  const getGlassmorphismClasses = (intensity = 'medium', blur = 'md') => {
    const intensityMap = {
      'low': 'bg-white/5 bg-opacity-5',
      'medium': 'bg-white/10 bg-opacity-10',
      'high': 'bg-white/15 bg-opacity-15'
    }
    
    const blurMap = {
      'sm': 'backdrop-blur-sm',
      'md': 'backdrop-blur-md',
      'lg': 'backdrop-blur-lg',
      'xl': 'backdrop-blur-xl'
    }
    
    return `${intensityMap[intensity] || intensityMap.medium} ${blurMap[blur] || blurMap.md} border border-white/20 shadow-2xl`
  }

  // Enhanced Pagination Component
  const PaginationComponent = () => {
    const totalPages = getTotalPages()
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i)
          pages.push('...')
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(totalPages)
        }
      }
      
      return pages
    }

    return (
      <div className={`${getGlassmorphismClasses('medium', 'lg')} p-6 rounded-2xl mt-12`}>
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, allListings.length)} of {allListings.length} listings
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all duration-300 ${
                currentPage === 1 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-[#39FF14] hover:bg-[#39FF14]/20 hover:scale-110'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={index} className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <button
                  key={index}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-[#39FF14] text-black font-bold'
                      : 'text-gray-300 hover:text-[#39FF14] hover:bg-[#39FF14]/20'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-all duration-300 ${
                currentPage === totalPages 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-[#39FF14] hover:bg-[#39FF14]/20 hover:scale-110'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Spotify Widget Component
  const SpotifyWidget = () => {
    const [isMinimized, setIsMinimized] = useState(true)
    
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`${getGlassmorphismClasses('high', 'xl')} rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-[#39FF14]/30 ${
          isMinimized ? 'p-0' : 'p-4'
        }`}>
          {/* Minimized state */}
          {isMinimized && (
            <button
              onClick={() => setIsMinimized(false)}
              className="p-4 flex items-center space-x-3 text-[#39FF14] hover:text-[#39FF14]/80 transition-all duration-300 group hover:bg-[#39FF14]/10 rounded-2xl"
              title="Expand Music Player"
            >
              <Music className="w-6 h-6 group-hover:scale-110 transition-transform animate-pulse" />
              <span className="text-sm font-bold tracking-wide">VIBES</span>
              {isPlaying && (
                <div className="w-3 h-3 bg-[#39FF14] rounded-full animate-bounce"></div>
              )}
            </button>
          )}

          {/* Expanded state */}
          {!isMinimized && (
            <div className="w-80">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 text-[#39FF14]">
                  <Music className="w-6 h-6 animate-pulse" />
                  <span className="text-lg font-bold tracking-wide">CYBER VIBES</span>
                  {isPlaying && (
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-[#39FF14] rounded-full animate-pulse"></div>
                      <div className="w-1 h-6 bg-[#39FF14] rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-3 bg-[#39FF14] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  title="Minimize Player"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Track List */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
                {backgroundTracks.map((track) => (
                  <div
                    key={track.id}
                    className={`p-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/10 ${
                      currentTrack?.id === track.id ? 'bg-[#39FF14]/20 border border-[#39FF14]/40' : 'bg-white/5'
                    }`}
                    onClick={() => playTrack(track)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{track.name}</p>
                        <p className="text-gray-400 text-xs">{track.artist}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">{track.duration}</span>
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="w-4 h-4 text-[#39FF14]" />
                        ) : (
                          <Play className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlayPause}
                    className="p-2 rounded-full bg-[#39FF14]/20 hover:bg-[#39FF14]/30 transition-all duration-300 hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-[#39FF14]" />
                    ) : (
                      <Play className="w-5 h-5 text-[#39FF14]" />
                    )}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full hover:bg-white/10 transition-all duration-300"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Volume Slider */}
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Enhanced Background Selector
  const BackgroundSelector = () => {
    const [showSelector, setShowSelector] = useState(false)
    
    return (
      <div className="fixed top-6 right-6 z-999">
        <div className={`${getGlassmorphismClasses('medium', 'lg')} rounded-2xl transition-all duration-500 hover:scale-105`}>
          {!showSelector ? (
            <button
              onClick={() => setShowSelector(true)}
              className="p-3 text-[#39FF14] hover:text-[#39FF14]/80 transition-all duration-300 hover:bg-[#39FF14]/10 rounded-2xl"
              title="Change Background"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-green-500 animate-pulse"></div>
            </button>
          ) : (
            <div className="p-4 w-64">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold text-sm">Background</span>
                <button
                  onClick={() => setShowSelector(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {backgroundOptions.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setSelectedBackground(bg)
                      setShowSelector(false)
                    }}
                    className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                      selectedBackground.id === bg.id ? 'ring-2 ring-[#39FF14]' : ''
                    }`}
                  >
                    <div className={`w-full h-12 rounded-lg ${bg.class} ${bg.overlay}`}></div>
                    <p className="text-xs text-gray-300 mt-1 text-center">{bg.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${selectedBackground.class} flex items-center justify-center`}>
        <div className={`absolute inset-0 ${selectedBackground.overlay}`}></div>
        <div className="relative text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-800 mx-auto border-t-[#39FF14]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Store className="w-8 h-8 text-[#39FF14] animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-white/80 animate-pulse">
            Loading storefront...
          </p>
        </div>
      </div>
    )
  }

  if (!storefront && !loading) {
    return (
      <div className={`min-h-screen ${selectedBackground.class} flex items-center justify-center`}>
        <div className={`absolute inset-0 ${selectedBackground.overlay}`}></div>
        <div className="relative text-center max-w-md mx-auto px-6">
          <div className={`${getGlassmorphismClasses('high', 'xl')} p-12 rounded-3xl hover:scale-105 transition-all duration-500`}>
            <Store className="w-20 h-20 mx-auto mb-6 text-[#39FF14] animate-pulse" />
            <h1 className="text-3xl font-bold mb-4 text-white">
              Storefront Not Found
            </h1>
            <p className="mb-6 leading-relaxed text-gray-300">
              The storefront you're looking for doesn't exist or is not active.
            </p>
            <Link href="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#39FF14] text-black font-semibold rounded-xl hover:bg-[#39FF14]/90 transition-all duration-300 hover:scale-105">
              <ExternalLink className="w-5 h-5" />
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${selectedBackground.class} relative`}>
      {/* Background Overlay */}
      <div className={`absolute inset-0 ${selectedBackground.overlay}`}></div>
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2339FF14" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
          animation: 'float 20s ease-in-out infinite'
        }}></div>
      </div>

      {/* Widgets */}
      <SpotifyWidget />
      <BackgroundSelector />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Enhanced Header Card */}
            <div className={`${getGlassmorphismClasses('high', 'xl')} rounded-3xl p-8 mb-12 hover:scale-[1.02] transition-all duration-500 hover:shadow-[#39FF14]/30 mt-10`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Enhanced Logo */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#39FF14] to-green-400 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
                      <Store className="w-8 h-8 text-black" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#39FF14] rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Enhanced Store Name */}
                  <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white via-[#39FF14] to-white bg-clip-text text-transparent">
                      {storefront.username}'s Storefront Store
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 tracking-wide">PREMIUM DIGITAL MARKETPLACE</p>
                  </div>
                </div>
                
                {/* Enhanced Stats */}
                <div className="flex space-x-4">
                  <div className={`${getGlassmorphismClasses('medium', 'md')} px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300`}>
                    <span className="text-[#39FF14] font-bold text-lg">{storefront.stats?.totalListings || allListings.length}</span>
                    <p className="text-gray-400 text-xs">ITEMS</p>
                  </div>
                  <div className={`${getGlassmorphismClasses('medium', 'md')} px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300`}>
                    <span className="text-blue-400 font-bold text-lg">{storefront.stats?.totalViews?.toLocaleString() || '0'}</span>
                    <p className="text-gray-400 text-xs">VIEWS</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6 mb-5">
              <button onClick={shareStorefront}
                      className={`${getGlassmorphismClasses('medium', 'lg')} px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 hover:bg-white/20 flex items-center gap-3 text-white font-semibold`}>
                <Share2 className="w-5 h-5" />
                SHARE STORE
              </button>
              <Link href="/marketplace"
                    className="px-8 py-4 bg-[#39FF14] text-black font-bold rounded-2xl hover:bg-[#39FF14]/90 transition-all duration-300 hover:scale-105 flex items-center gap-3 shadow-2xl hover:shadow-[#39FF14]/50">
                <ExternalLink className="w-5 h-5" />
                BROWSE ALL
              </Link>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="max-w-7xl mx-auto px-6 pb-5">
          {/* Enhanced Search and Filter Bar */}
          <div className={`${getGlassmorphismClasses('high', 'xl')} p-8 mb-12 rounded-3xl hover:scale-[1.01] transition-all duration-500 hover:shadow-[#39FF14]/30`}>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-transparent transition-all duration-300"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-transparent transition-all duration-300"
              >
                <option value="" className="bg-gray-800">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-gray-800">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-transparent transition-all duration-300"
              >
                <option value="newest" className="bg-gray-800">Newest First</option>
                <option value="oldest" className="bg-gray-800">Oldest First</option>
                <option value="price-low" className="bg-gray-800">Price: Low to High</option>
                <option value="price-high" className="bg-gray-800">Price: High to Low</option>
                <option value="views" className="bg-gray-800">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          {displayedListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {displayedListings.map((listing) => (
                  <div key={listing.id} className={`${getGlassmorphismClasses('medium', 'lg')} rounded-3xl overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-[#39FF14]/30 group`}>
                    {/* Listing Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={JSON.parse(listing.images)[0]?.replace(/`/g, '') || '/placeholder-image.jpg'}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          listing.status === 'approved' ? 'bg-[#39FF14] text-black' :
                          listing.status === 'sold' ? 'bg-red-500 text-white' :
                          'bg-yellow-500 text-black'
                        }`}>
                          {listing.status.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Chain Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white">
                          {listing.chain.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Views */}
                      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">{listing.views || 0}</span>
                      </div>
                    </div>
                    
                    {/* Listing Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-[#39FF14] transition-colors duration-300 line-clamp-2">
                          {listing.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {listing.description}
                      </p>
                      
                      {/* Tags */}
                      {JSON.parse(listing.tags).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {JSON.parse(listing.tags).slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-white/10 rounded-lg text-xs text-gray-300">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-[#39FF14]">
                            {parseFloat(listing.price).toFixed(2)}
                          </span>
                          <span className="text-gray-400 text-sm ml-1">{listing.chain.toUpperCase()}</span>
                        </div>
                        
                        <Link href={`/marketplace/${listing.id}`}
                              className="px-4 py-2 bg-[#39FF14] text-black font-semibold rounded-xl hover:bg-[#39FF14]/90 transition-all duration-300 hover:scale-105">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <PaginationComponent />
            </>
          ) : (
            <div className={`${getGlassmorphismClasses('medium', 'lg')} p-12 rounded-3xl text-center`}>
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-white mb-2">No Listings Found</h3>
              <p className="text-gray-400">
                {searchTerm || selectedCategory ? 'Try adjusting your search or filters.' : 'This storefront has no listings yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}