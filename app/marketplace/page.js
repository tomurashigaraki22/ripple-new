"use client"

import { useState, useEffect } from "react"
import { SearchFilterBar } from "../components/SearchFilterBar"
import { ListingCard } from "../components/ListingCard"
import { Pagination } from "../components/Pagination"

const ITEMS_PER_PAGE = 12

export default function MarketplacePage() {
  const [listings, setListings] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: ITEMS_PER_PAGE,
  })
  const [loading, setLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: "all",
    sortBy: "recent",
  })

  const fetchListings = async (page = 1) => {
    setLoading(true)

    const params = new URLSearchParams({
      page,
      limit: ITEMS_PER_PAGE,
      search: searchTerm,
      category: filters.category,
      sortBy: filters.sortBy,
    })

    try {
      const res = await fetch(`http://172.20.10.2:1234/marketplace/listings?${params.toString()}`)
      const data = await res.json()

      setListings(data.listings || [])
      setPagination(data.pagination || pagination)
    } catch (err) {
      console.error("Failed to fetch listings", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings(1)
  }, [searchTerm, filters])

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setFilters({
      category: "all",
      priceRange: "all",
      sortBy: "recent",
    })
  }

  const handlePageChange = (page) => {
    fetchListings(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#111111] mt-30">
      <SearchFilterBar
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={filters}
        onClearFilters={handleClearFilters}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#111111]">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-[#111111]">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No items found</div>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        )}
      </main>
    </div>
  )
}
