"use client"
import { useState, useEffect } from "react"
import { Eye, Search } from "lucide-react"
import AdminLayout from "../components/AdminLayout"
import { useAuth } from "../../contexts/AuthContext"

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading2, setLoading2] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { token, user, loading } = useAuth()
  const [page, setPage] = useState(1)
  const [limit] = useState(50)
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = async () => {
    setLoading2(true)
    try {
      const query = new URLSearchParams({
        page,
        limit,
        status: statusFilter,
        search: searchText
      })
      const res = await fetch(`http://172.20.10.2:1234/admin/admin/orders?${query.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders)
        setTotalPages(data.pagination.pages)
      } else {
        console.error("Error fetching orders:", data.error)
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
    } finally {
      setLoading2(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter, searchText])

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "bg-yellow-500/30 text-yellow-400",
      paid: "bg-blue-500/30 text-blue-400",
      shipped: "bg-indigo-500/30 text-indigo-400",
      delivered: "bg-green-500/30 text-green-400",
      cancelled: "bg-red-500/30 text-red-400",
    }
    return statusMap[status.toLowerCase()] || "bg-gray-500/30 text-gray-400"
  }

  return (
    <AdminLayout>
      <div className="mt-20 p-6 bg-[#111111] text-white rounded-xl space-y-6">
        <h1 className="text-3xl font-bold">Orders</h1>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-lg p-2 flex-1">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-transparent outline-none text-white placeholder-gray-400 w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
          <div className="max-h-[60vh] overflow-y-auto">
            {loading2 ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-t-green-400 border-white/20 rounded-full animate-spin"></div>
              </div>
            ) : (
              <table className="min-w-full text-left table-auto">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-2">Order ID</th>
                    <th className="px-4 py-2">Buyer</th>
                    <th className="px-4 py-2">Seller</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Created At</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono">{order.id}</td>
                      <td className="px-4 py-3">{order.buyer_username}</td>
                      <td className="px-4 py-3">{order.seller_username}</td>
                      <td className="px-4 py-3">{order.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button className="bg-blue-600/50 hover:bg-blue-600/70 px-3 py-1 rounded-lg flex items-center gap-1 transition">
                          <Eye className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-400 py-6">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-end gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-[#222222] rounded hover:bg-[#333333]"
          >
            Prev
          </button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-[#222222] rounded hover:bg-[#333333]"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
