"use client"

import { useState, useEffect } from "react"
import { Search, Bell } from "lucide-react"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import StorefrontSidebar from "../../components/StoreFrontSidebar"
import EscrowDetailsModal from "../../components/EscrowDetailsModal"
import { useAuth } from "../../contexts/AuthContext"

export default function EscrowsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [escrows, setEscrows] = useState([])
  const [selectedEscrow, setSelectedEscrow] = useState(null)
  const {token} = useAuth()
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEscrows = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: 50,
        offset: 0,
        status: statusFilter !== "all" ? statusFilter : ""
      })
      const res = await fetch(`https://ripple-flask-server.onrender.com/storefront/escrows?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch escrows: ${res.status}`)
      }
      const data = await res.json()
      setEscrows(data.escrows || [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token !== null){
      fetchEscrows()
    }
  }, [statusFilter, token])


  const filteredEscrows = escrows.filter((escrow) => {
    const matchesSearch =
      escrow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrow.buyer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || escrow.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (escrow) => {
    setSelectedEscrow(escrow)
    setIsDetailsModalOpen(true)
  }

  const handleReleaseEscrow = async (escrowId) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/storefront/escrows/release/${escrowId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to release escrow")
      alert("Escrow released successfully!")
      fetchEscrows() // Refresh list
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "released":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "funded":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "disputed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="flex">
        <StorefrontSidebar />

        <main className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 mt-30 lg:mt-10">
        {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Escrow Management</h1>
              <p className="text-gray-400">Monitor and manage all your escrow transactions</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by escrow ID, buyer, or seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1a1a1a]/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-[#1a1a1a]/50 border-gray-700 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && <p className="text-gray-400 text-center py-12">Loading escrows...</p>}
          {error && <p className="text-red-400 text-center py-12">{error}</p>}

          {/* Escrow List */}
          {!loading && !error && filteredEscrows.length > 0 && (
            <div className="space-y-4">
              {filteredEscrows.map((escrow) => (
                <div
                  key={escrow.id}
                  className="bg-[#1a1a1a]/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 md:p-6 hover:bg-[#1a1a1a]/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-white">Escrow #{escrow.id}</h3>
                        </div>
                        <Badge className={getStatusBadgeClass(escrow.status)}>{escrow.status}</Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Amount</p>
                          <p className="text-white font-medium">
                            {escrow.amount} {escrow.currency}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-400 mb-1">Buyer</p>
                          <p className="text-white font-mono text-xs truncate">{escrow.buyer}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Created</p>
                          <p className="text-white">{escrow.created_at}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-gray-400 text-xs mb-1">Transaction Hash</p>
                        <p className="text-green-400 font-mono text-xs break-all">{escrow.transaction_hash}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                      <Button
                        onClick={() => handleViewDetails(escrow)}
                        variant="outline"
                        className="border-gray-600 text-white hover:bg-gray-700 w-full"
                      >
                        View Details
                      </Button>
                      {escrow.status.toLowerCase() === "funded" && (
                        <Button
                          onClick={() => handleReleaseEscrow(escrow.id)}
                          className="bg-green-600 hover:bg-green-700 text-white w-full"
                        >
                          Release Escrow
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredEscrows.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No escrow transactions found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </main>
      </div>

      <EscrowDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        escrow={selectedEscrow}
      />
    </div>
  )
}
