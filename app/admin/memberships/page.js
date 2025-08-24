"use client"
import { useState, useEffect, useMemo } from "react"
import { Trash2, CheckCircle, XCircle, Search, PlusCircle } from "lucide-react"
import AdminLayout from "../components/AdminLayout"
import { useAuth } from "../../contexts/AuthContext"

const API_BASE = "https://ripple-flask-server.pxxl.pro/admin" // Adjust Flask API

export default function AdminMemberships() {
  const { token, user, loading } = useAuth()
  const [memberships, setMemberships] = useState([])
  const [searchText, setSearchText] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [grantEmail, setGrantEmail] = useState("")
  const [grantTier, setGrantTier] = useState("pro")
  const [grantMonths, setGrantMonths] = useState(1)
  const [actionLoading, setActionLoading] = useState(false)
  const [loadingMemberships, setLoadingMemberships] = useState(false)

  const fetchMemberships = async () => {
    if (!token) return
    setLoadingMemberships(true)
    try {
      const params = new URLSearchParams({
        tier: tierFilter,
        status: statusFilter,
        search: searchText,
        limit: 50,
        offset: 0
      })
      const res = await fetch(`${API_BASE}/memberships?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setMemberships(data.memberships || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMemberships(false)
    }
  }

  useEffect(() => {
    if (!loading && user && token) fetchMemberships()
  }, [tierFilter, statusFilter, searchText, user, loading, token])

  const handleGrantMembership = async () => {
    if (!grantEmail || !grantTier || !grantMonths) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/memberships`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: grantEmail,
          tierName: grantTier,
          months: grantMonths
        })
      })
      const data = await res.json()
      console.log(data)
      fetchMemberships()
      setGrantEmail("")
      setGrantMonths(1)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8 text-white mt-20 bg-[#111111] p-6 rounded-xl">
        <h1 className="text-3xl font-bold">Manage Memberships</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-lg p-2 flex-1">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search memberships..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-transparent outline-none text-white placeholder-gray-400 w-full"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-white"
            >
              <option value="all">All Tiers</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Grant Membership */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg flex flex-col md:flex-row md:items-center gap-2">
          <input
            type="email"
            placeholder="Enter user email"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            className="bg-[#111111] p-2 rounded-lg outline-none flex-1 text-white"
          />
          <select
            value={grantTier}
            onChange={(e) => setGrantTier(e.target.value)}
            className="bg-[#111111] p-2 rounded-lg text-white"
          >
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
          <input
            type="number"
            min={1}
            max={120}
            value={grantMonths}
            onChange={(e) => setGrantMonths(Number(e.target.value))}
            className="bg-[#111111] p-2 rounded-lg text-white w-24"
          />
          <button
            onClick={handleGrantMembership}
            disabled={actionLoading}
            className="bg-green-600/50 hover:bg-green-600/70 px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" /> {actionLoading ? "Processing..." : "Grant"}
          </button>
        </div>

        {/* Memberships Table */}
        <div className="overflow-x-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
          <div className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
            <table className="min-w-full table-auto text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">Tier</th>
                  <th className="px-4 py-2">Expires</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {memberships.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">{m.user_email}</td>
                    <td className="px-4 py-3">{m.username}</td>
                    <td className="px-4 py-3">{m.tier_name.toUpperCase()}</td>
                    <td className="px-4 py-3">{new Date(m.expires_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {m.is_active ? (
                        <span className="text-green-400 font-medium flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="text-red-400 font-medium flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Expired
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {memberships.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-6">
                      {loadingMemberships ? "Loading..." : "No memberships found"}
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
