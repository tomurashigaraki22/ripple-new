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
        console.log("Tokenn is", token)

      const res = await fetch(`https://ripple-flask-server.pxxl.pro/storefront/orders-list?${query.toString()}`, {
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
        fetchOrders() // refresh list
      }
    } catch (err) {
      console.error("Error marking delivered:", err)
    }
  }

  const handleChatWithBuyer = (order) => {
    console.log("USER: ", user)
    setChatOrder(order)
    setShowChatModal(true)
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.listing_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer_username.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="flex min-h-screen bg-[#111111]">
      <StorefrontSidebar />

      <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 md:mt-20 mt-0">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Orders & Shipping</h1>
            <p className="text-gray-400">Manage your customer orders and shipping</p>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-[#1a1a1a] border-gray-700 text-white">
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
                    <div className="flex items-center justify-between">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-white">{order.listing_title}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-gray-400 mb-2">Order {order.id}</div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1 max-w-[120px] truncate">
                            👤 {order.buyer_id}
                          </span>
                          <span className="flex items-center gap-1">📅 {new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="flex-1 px-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Shipping Address</h4>
                        <div className="text-sm text-gray-400 whitespace-pre-line">
                          {order.shipping_address ? JSON.stringify(order.shipping_address.address, null, 2) : "N/A"}
                        </div>
                      </div>

                      {/* Amount and Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">Amount</div>
                          <div className="text-lg font-semibold text-green-400">{(order.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })} XRPB</div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChatWithBuyer(order)}
                            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
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
                                className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Delivered
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateTracking(order)}
                                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
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
