"use client"
import { useState, useEffect } from "react"
import { Trash2, CheckCircle, XCircle } from "lucide-react"
import AdminLayout from "../components/AdminLayout"
import { useAuth } from "../../contexts/AuthContext"

const API_BASE = "https://ripple-flask-server.pxxl.pro/admin/fetch"

export default function AdminListings() {
  const { token, user, loading } = useAuth()
  const [listings, setListings] = useState([])
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState({})
  const [loadingListings, setLoadingListings] = useState(false)

  const fetchListings = async () => {
    if (!token) return
    setLoadingListings(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        search: searchText,
        all: "true"
      })
      const res = await fetch(`${API_BASE}/listings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setListings(
          (data.listings || []).map(listing => ({
            ...listing,
            images: typeof listing.images === "string" ? JSON.parse(listing.images) : listing.images,
            description: listing.description || ""
          }))
        )
      } else {
        console.error("Failed to fetch listings")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingListings(false)
    }
  }

  useEffect(() => {
    if (!loading && user && token) fetchListings()
  }, [statusFilter, searchText, user, loading, token])

  const handleAction = async (id, action) => {
    if (!token) return
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      const method = action === "delete" ? "DELETE" : "POST"
      const res = await fetch(`${API_BASE}/listings/${id}/${action}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        fetchListings()
      } else {
        console.error(`Failed to ${action} listing`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const filteredListings = listings.filter(l =>
    (l.title.toLowerCase().includes(searchText.toLowerCase()) ||
      l.seller.toLowerCase().includes(searchText.toLowerCase())) &&
    (statusFilter === "all" || l.status === statusFilter)
  )

  return (
    <AdminLayout>
      <div className="space-y-8 text-white mt-20">
        <h1 className="text-3xl font-bold">Manage Listings</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center bg-[#111111]/50 border border-white/10 rounded-lg p-2">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-transparent outline-none text-white placeholder-gray-400 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111111]/50 border border-white/10 rounded-lg p-2 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingListings ? (
            <p className="text-center col-span-full">Loading...</p>
          ) : filteredListings.length === 0 ? (
            <p className="text-center col-span-full">No listings found</p>
          ) : (
            filteredListings.map(listing => (
              <div key={listing.id} className="bg-[#111111]/50 border border-white/10 rounded-2xl p-4 flex flex-col space-y-3">
                {/* Main image */}
                <img
                  src={listing.images && listing.images.length > 0 ? listing.images[0] : "/placeholder.png"}
                  alt={listing.title}
                  className="w-full h-40 object-cover rounded-lg"
                />

                <h2 className="font-semibold text-lg">{listing.title}</h2>
                <p className="text-gray-300 text-sm line-clamp-3">{listing.description}</p>
                <p className="text-gray-400 text-sm">Owner: {listing.seller}</p>

                {/* Status */}
                <span className={`font-medium flex items-center gap-1 ${
                  listing.status === "approved" ? "text-green-400" :
                  listing.status === "rejected" ? "text-red-400" :
                  "text-yellow-400"
                }`}>
                  {listing.status === "approved" && <CheckCircle className="w-4 h-4" />}
                  {listing.status === "rejected" && <XCircle className="w-4 h-4" />}
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </span>

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  {listing.status === "pending" && (
                    <>
                      <button
                        disabled={actionLoading[listing.id]}
                        onClick={() => handleAction(listing.id, "approve")}
                        className="px-2 py-1 text-sm bg-green-600/30 hover:bg-green-600/50 rounded-md transition flex-1"
                      >
                        {actionLoading[listing.id] ? "Processing..." : "Approve"}
                      </button>
                      <button
                        disabled={actionLoading[listing.id]}
                        onClick={() => handleAction(listing.id, "reject")}
                        className="px-2 py-1 text-sm bg-red-600/30 hover:bg-red-600/50 rounded-md transition flex-1"
                      >
                        {actionLoading[listing.id] ? "Processing..." : "Reject"}
                      </button>
                    </>
                  )}
                  <button
                    disabled={actionLoading[listing.id]}
                    onClick={() => handleAction(listing.id, "delete")}
                    className="px-2 py-1 text-sm bg-red-500/30 hover:bg-red-500/50 rounded-md transition flex-1"
                  >
                    {actionLoading[listing.id] ? "Processing..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
