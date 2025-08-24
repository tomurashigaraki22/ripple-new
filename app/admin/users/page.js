"use client"
import { useState, useEffect, useMemo } from "react"
import { Users, Trash2, Shield, CheckCircle, XCircle, Search } from "lucide-react"
import AdminLayout from "../components/AdminLayout"
import { useAuth } from "../../contexts/AuthContext"

const API_BASE = "https://ripple-flask-server.pxxl.pro"

export default function AdminUsers() {
  const { token, user, loading } = useAuth()
  const [users, setUsers] = useState([])
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [actionLoading, setActionLoading] = useState({}) // Track loading per user

  // Fetch users from API
  const fetchUsers = async () => {
    if (!token) return
    setLoadingUsers(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        role: roleFilter,
        search: searchText || "", // Ensure empty string works
        all: "true"
      })
      const res = await fetch(`${API_BASE}/admin/get/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      } else {
        console.error("Failed to fetch users")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (!loading && user && token) fetchUsers()
  }, [statusFilter, roleFilter, searchText, user, loading, token])

  // Actions: suspend, reactivate, make-admin, delete
  const handleAction = async (id, action) => {
    if (!token) return
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`${API_BASE}/admin/get/users/${id}/${action}`, {
        method: action === "delete" ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        await fetchUsers() // Refresh list after action
      } else {
        console.error(`Failed to ${action} user`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  // Filtered users for search input (optional since API supports search)
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesText =
        u.username.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase())
      const matchesStatus = statusFilter === "all" || u.status === statusFilter
      const matchesRole = roleFilter === "all" || u.role === roleFilter
      return matchesText && matchesStatus && matchesRole
    })
  }, [users, searchText, statusFilter, roleFilter])

  return (
    <AdminLayout>
      <div className="space-y-8 text-white mt-20">
        <h1 className="text-3xl font-bold">Manage Users</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center bg-[#111111]/50 border border-white/10 rounded-lg p-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-transparent outline-none text-white placeholder-gray-400 w-full"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#111111]/50 border border-white/10 rounded-lg p-2 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#111111]/50 border border-white/10 rounded-lg p-2 text-white"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto bg-[#111111]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
            <table className="min-w-full table-auto text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">
                      {user.status === "active" ? (
                        <span className="text-green-400 font-medium flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="text-red-400 font-medium flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end space-x-2">
                      {user.status === "active" ? (
                        <button
                          disabled={actionLoading[user.id]}
                          onClick={() => handleAction(user.id, "suspend")}
                          className="px-2 py-1 text-sm bg-red-600/30 hover:bg-red-600/50 rounded-md transition"
                        >
                          {actionLoading[user.id] ? "Processing..." : "Suspend"}
                        </button>
                      ) : (
                        <button
                          disabled={actionLoading[user.id]}
                          onClick={() => handleAction(user.id, "reactivate")}
                          className="px-2 py-1 text-sm bg-green-600/30 hover:bg-green-600/50 rounded-md transition"
                        >
                          {actionLoading[user.id] ? "Processing..." : "Reactivate"}
                        </button>
                      )}
                      {user.role !== "admin" && (
                        <button
                          disabled={actionLoading[user.id]}
                          onClick={() => handleAction(user.id, "make-admin")}
                          className="px-2 py-1 text-sm bg-yellow-600/30 hover:bg-yellow-600/50 rounded-md transition flex items-center gap-1"
                        >
                          <Shield className="w-4 h-4" /> {actionLoading[user.id] ? "Processing..." : "Make Admin"}
                        </button>
                      )}
                      <button
                        disabled={actionLoading[user.id]}
                        onClick={() => handleAction(user.id, "delete")}
                        className="px-2 py-1 text-sm bg-red-500/30 hover:bg-red-500/50 rounded-md transition flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> {actionLoading[user.id] ? "Processing..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-6">
                      {loadingUsers ? "Loading..." : "No users found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
