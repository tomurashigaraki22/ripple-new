"use client"

import { useState, useEffect } from "react"
import StorefrontSidebar from "../../components/StoreFrontSidebar"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Search, MessageCircle, Package, CheckCircle } from "lucide-react"
import { ShippingUpdateModal } from "../../components/ShippingUpdateModal"
import { ChatModal } from "../../components/ChatModal"
import { useAuth } from "../../contexts/AuthContext"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showShippingModal, setShowShippingModal] = useState(false)
  const { token, user } = useAuth()
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatOrder, setChatOrder] = useState(null)

  useEffect(() => {
    if (token !== null){
      fetchOrders()
    }
  }, [statusFilter, token])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (statusFilter !== "all") query.append("status", statusFilter)
      const res = await fetch(`https://ripple-flask-server.onrender.com/storefront/orders-list?${query.toString()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
      } else {
        console.error("Error fetching orders:", data.error)
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: "Completed", className: "bg-gray-600 text-white" },
      delivered: { label: "Delivered", className: "bg-green-600 text-white" },
      shipped: { label: "Shipped", className: "bg-blue-600 text-white" },
      pending: { label: "Pending", className: "bg-yellow-600 text-black" },
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge className={`${config.className} text-xs px-2 py-1`}>{config.label}</Badge>
  }

  const handleUpdateTracking = (order) => {
    setSelectedOrder(order)
    setShowShippingModal(true)
  }

  const handleMarkDelivered = async (orderId) => {
    try {
      const res = await fetch(`/storefront/orders/${orderId}/mark-delivered`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        fetchOrders()
      }
    } catch (err) {
      console.error("Error marking delivered:", err)
    }
  }

  const handleChatWithBuyer = (order) => {
    setChatOrder(order)
    setShowChatModal(true)
  }

  const filteredOrders = orders.filter((order) => {
    const q = (searchTerm || "").toLowerCase()
    const title = (order.listing_title || "").toLowerCase()
    const idText = String(order.id || "").toLowerCase()
    const buyerUser = (order.buyer_username || "").toLowerCase()
    return title.includes(q) || idText.includes(q) || buyerUser.includes(q)
  })

  return (
    <div className="flex min-h-screen bg-[#111111] overflow-hidden">
      <StorefrontSidebar />

      {/* Main content: no horizontal overflow, adds left padding only on lg when sidebar is visible */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 lg:pl-64 md:mt-20 mt-30">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 truncate">Orders & Shipping</h1>
            <p className="text-gray-400">Manage your customer orders and shipping</p>
          </div>

          {/* Search and Filters: stack on mobile */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 mb-8 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-400 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#1a1a1a] border-gray-700 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-700">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-400">Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="bg-[#1a1a1a] border-gray-700">
                  <CardContent className="p-6">
                    {/* Stack vertically on small, 3-column on md+ */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white truncate">{order.listing_title}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-gray-400 mb-2 break-words">Order {order.id}</div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1 min-w-0">
                            <span className="truncate max-w-[180px]">👤 {order.buyer_username || order.buyer_id}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            📅 {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
                          </span>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="flex-1 md:px-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Shipping Address</h4>
                        <div className="text-xs sm:text-sm text-gray-400 whitespace-pre-wrap break-words">
                          {order.shipping_address
                            ? JSON.stringify(order.shipping_address.address, null, 2)
                            : "N/A"}
                        </div>
                      </div>

                      {/* Amount and Actions */}
                      <div className="w-full md:w-auto flex flex-col md:items-end gap-3">
                        <div className="text-left md:text-right">
                          <div className="text-sm text-gray-400 mb-1">Amount</div>
                          <div className="text-lg font-semibold text-green-400">
                            {(order.amount)?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })} XRPB
                          </div>
                        </div>

                        {/* Buttons: row on mobile, column on md+ */}
                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChatWithBuyer(order)}
                            className="w-full md:w-auto border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat with Buyer
                          </Button>

                          {order.status === "shipped" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkDelivered(order.id)}
                                className="w-full md:w-auto border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Delivered
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateTracking(order)}
                                className="w-full md:w-auto border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                              >
                                <Package className="w-4 h-4 mr-2" />
                                Update Tracking
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShippingUpdateModal
        isOpen={showShippingModal}
        onClose={() => setShowShippingModal(false)}
        order={selectedOrder}
      />

      {showChatModal && chatOrder && user && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          order={chatOrder}
          userType={user.userId === chatOrder.buyer_id ? 'buyer' : 'seller'}
          userId={user.userId}
          user={user}
        />
      )}
    </div>
  )
}
