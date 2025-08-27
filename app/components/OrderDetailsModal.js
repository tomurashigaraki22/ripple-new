"use client"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

export function OrderDetailsModal({ isOpen, onClose, orderId, token }) {
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen || !orderId) return

    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        setOrderDetails(null)

        const res = await fetch(`https://ripple-flask-server.onrender.com/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        })
        if (!res.ok) throw new Error("Failed to fetch order details")
        const data = await res.json()
        setOrderDetails(data)
      } catch (err) {
        setError(err.message || "Error fetching order")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [isOpen, orderId, token])

  if (!isOpen) return null

  const renderShippingAddress = (addr) => {
    if (!addr) return "N/A"
    return (
      <div className="space-y-1 text-gray-300">
        <p><span className="font-semibold text-purple-400">Address:</span> {addr.address}</p>
        <p><span className="font-semibold text-purple-400">City:</span> {addr.city}</p>
        <p><span className="font-semibold text-purple-400">State:</span> {addr.state}</p>
        <p><span className="font-semibold text-purple-400">Country:</span> {addr.country}</p>
        <p><span className="font-semibold text-purple-400">ZIP:</span> {addr.zipCode}</p>
        <p><span className="font-semibold text-purple-400">Phone:</span> {addr.phone}</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] border border-gray-800 rounded-3xl w-full max-w-3xl p-6 relative shadow-xl">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="w-6 h-6 text-gray-400 hover:text-purple-500 transition-colors" />
        </button>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="text-gray-100 space-y-6">
            {/* Header */}
            <h2 className="text-2xl font-bold text-purple-400">{orderDetails.listing_title}</h2>

            {/* Main Info Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-800 pb-4">
              <div className="space-y-2">
                <p>
                  <span className="font-semibold text-gray-400">Order ID:</span>{" "}
                  <span className="text-purple-400">{orderDetails.id}</span>
                </p>
                <p>
                  <span className="font-semibold text-gray-400">Amount:</span>{" "}
                  <span className="text-indigo-400">{orderDetails.amount} XRPB</span>
                </p>
                <p>
                  <span className="font-semibold text-gray-400">Status:</span>{" "}
                  <span className="text-yellow-400">{orderDetails.status.replace("_", " ")}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold text-gray-400">Seller:</span>{" "}
                  <span className="text-pink-400">{orderDetails.seller_username}</span>
                </p>
                <p>
                  <span className="font-semibold text-gray-400">Listing Price:</span>{" "}
                  <span className="text-purple-400">$ {parseFloat(orderDetails.listing_price).toFixed(4)}</span>
                </p>
              </div>
            </div>

            {/* Shipping Section */}
            <div className="border border-gray-800 rounded-2xl p-4 bg-[#1f1f1f]/50">
              <h3 className="font-semibold text-lg text-purple-400 mb-2">Shipping Address</h3>
              {renderShippingAddress(orderDetails.shipping_address)}
            </div>

            {/* Images Section */}
            {orderDetails.listing_images?.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-2">
                {orderDetails.listing_images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Listing ${idx}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
