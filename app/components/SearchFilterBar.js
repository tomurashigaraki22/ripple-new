"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Search, Filter, X } from "lucide-react"

export function SearchFilterBar({ onSearch, onFilter, filters, onClearFilters }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleFilterChange = (key, value) => {
    onFilter(key, value)
  }

  const categories = ["All", "NFT", "Physical", "Digital"]
  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under $50", value: "0-50" },
    { label: "$50 - $200", value: "50-200" },
    { label: "$200 - $500", value: "200-500" },
    { label: "$500 - $1000", value: "500-1000" },
    { label: "Over $1000", value: "1000+" },
  ]

  return (
    <div className="bg-[#111111] border-b border-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative glass-effect-darker">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search marketplace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1a1a1a] border border-gray-800 focus:border-gray-800 focus:ring-0 text-gray-100 placeholder-gray-400"
            />
          </div>
          <Button type="submit" className="bg-green-500 hover:bg-green-600 text-black">
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </form>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-[#111111] rounded-lg">
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-300">Category</label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-gray-600">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-300">Price Range</label>
              <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange("priceRange", value)}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value} className="text-white hover:bg-gray-600">
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-300">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="newest" className="text-white hover:bg-gray-600">
                    Newest
                  </SelectItem>
                  <SelectItem value="oldest" className="text-white hover:bg-gray-600">
                    Oldest
                  </SelectItem>
                  <SelectItem value="price-low" className="text-white hover:bg-gray-600">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-high" className="text-white hover:bg-gray-600">
                    Price: High to Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={onClearFilters}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
