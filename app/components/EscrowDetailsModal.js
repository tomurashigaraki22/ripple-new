"use client"

import { X } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

export default function EscrowDetailsModal({ isOpen, onClose, escrow }) {
  if (!isOpen || !escrow) return null

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
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

  // Parse conditions safely
  let conditions = {}
  try {
    conditions = typeof escrow.conditions === "string" ? JSON.parse(escrow.conditions) : escrow.conditions
  } catch (e) {
    conditions = {}
  }

  // Format timestamps
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleString()
    } catch {
      return dateStr
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Escrow Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-400 text-sm">Escrow ID</label>
              <p className="text-white font-mono text-sm mt-1 break-all">{escrow.id}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Status</label>
              <div className="mt-1">
                <Badge className={getStatusBadgeClass(escrow.status)}>{escrow.status}</Badge>
              </div>
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-400 text-sm">Amount</label>
              <p className="text-white font-semibold text-lg mt-1">
                {escrow.amount} {escrow.currency || escrow.chain}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Fee</label>
              <p className="text-white font-semibold text-lg mt-1">{escrow.fee}</p>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Buyer Address</label>
              <div className="bg-gray-700/50 rounded p-3 mt-1">
                <p className="text-white font-mono text-sm break-all">{escrow.buyer}</p>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Seller Address</label>
              <div className="bg-gray-700/50 rounded p-3 mt-1">
                <p className="text-white font-mono text-sm break-all">{escrow.seller || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Transaction Hash */}
          <div>
            <label className="text-gray-400 text-sm">Transaction Hash</label>
            <div className="bg-gray-700/50 rounded p-3 mt-1">
              <p className="text-green-400 font-mono text-sm break-all">{escrow.transaction_hash || escrow.release_hash || "N/A"}</p>
            </div>
          </div>

          {/* Listing Info */}
          {escrow.listing_title && (
            <div>
              <label className="text-gray-400 text-sm">Listing</label>
              <p className="text-white mt-1 font-medium">{escrow.listing_title}</p>
              <p className="text-gray-400 text-sm">Price: {escrow.listing_price}</p>
              {escrow.listing_images && Array.isArray(escrow.listing_images) && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {escrow.listing_images.map((img, idx) => (
                    <img key={idx} src={img} alt="Listing" className="h-16 w-16 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conditions */}
          <div>
            <label className="text-gray-400 text-sm">Conditions</label>
            <div className="bg-gray-900/50 rounded p-4 mt-1">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(conditions, null, 2)}
              </pre>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-400 text-sm">Created</label>
              <p className="text-white mt-1">{formatDate(escrow.created_at)}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Updated</label>
              <p className="text-white mt-1">{formatDate(escrow.updated_at)}</p>
            </div>
          </div>

          {/* Dispute */}
          {escrow.dispute_reason && (
            <div>
              <label className="text-gray-400 text-sm">Dispute Reason</label>
              <p className="text-red-400 mt-1">{escrow.dispute_reason}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
          >
            Close
          </Button>
          {escrow.status?.toLowerCase() === "funded" && (
            <Button className="bg-green-600 hover:bg-green-700 text-white">Release Escrow</Button>
          )}
        </div>
      </div>
    </div>
  )
}
