"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Package, Clock, CheckCircle, XCircle, Truck, Eye, MessageSquare } from "lucide-react"
import Image from "next/image"
import { useAuth } from "../../contexts/AuthContext"
import { ChatModal } from "../../components/ChatModal"
import { OrderDetailsModal } from "../../components/OrderDetailsModal"

export default function MyOrdersPage() {
  const { token, user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0 })
  const [selectedOrderForChat, setSelectedOrderForChat] = useState(null)

  const fetchOrders = async () => {
    console.log("Tokn and usr: ", token, user)
    if (!token || !user) return setLoading(false)
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "10"
      })
      if (selectedStatus !== "all") params.append("status", selectedStatus)

      const res = await fetch(`https://ripple-flask-server.onrender.com/orders/get?${params}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      })
      if (!res.ok) throw new Error("Failed to fetch orders")
      const data = await res.json()
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token || !user) return
    fetchOrders() }, [selectedStatus, pagination.page, token, user])

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "paid": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "shipped": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "delivered": return "bg-green-600/20 text-green-300 border-green-600/30"
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "escrow_funded": return "bg-blue-400/20 text-blue-300 border-blue-400/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />
      case "paid": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "shipped": return <Truck className="w-4 h-4 text-blue-500" />
      case "delivered": return <CheckCircle className="w-4 h-4 text-green-600" />
      case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />
      case "escrow_funded": return <Package className="w-4 h-4 text-blue-400" />
      default: return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "escrow_funded", label: "Escrow Funded" }
  ]

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-400 mb-4">Please log in to view your orders</p>
          <Link href="/login" className="px-6 py-3 bg-[#39FF14] text-black font-semibold rounded-xl">Log In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white p-6 sm:p-12 relative mt-30">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="mb-6 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white"
      >
        {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39FF14]"></div>
        </div>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 hover:border-[#39FF14]/50 transition-all">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gray-700/50">
                <Image
                  src={order.listing_images?.[0] || '/placeholder-image.jpg'}
                  alt={order.listing_title}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-white">{order.listing_title}</h3>
                  <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full border text-xs ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">Order #{order.id.slice(0, 8)}</p>
                <p className="text-gray-400 text-sm">Seller: {order.seller_username}</p>
                <p className="text-[#39FF14] font-bold mt-1">{order.amount} XRPB</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setSelectedOrderForChat(order)} className="bg-blue-600/70 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> Chat
                  </button>
                    <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="bg-gray-800/50 px-3 py-1 rounded-lg text-sm"
                        >
                        Order Details
                    </button>   
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {selectedOrderForChat && (
        <ChatModal
          isOpen={!!selectedOrderForChat}
          onClose={() => setSelectedOrderForChat(null)}
          order={selectedOrderForChat}
          userType="buyer"
          userId={user.id}
          user={user}
        />
      )}

      {/* Render modal */}
        <OrderDetailsModal
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
        token={token}
        />
    </div>
  )
}
