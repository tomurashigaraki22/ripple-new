"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, Calendar, User, Activity, Filter, Eye, Download } from "lucide-react"
import AdminLayout from "../components/AdminLayout"
import { useAuth } from "../../contexts/AuthContext"

const API_BASE = "https://ripple-flask-server.onrender.com/admin"

export default function AdminAuditTrail() {
  const { token, loading: authLoading, user } = useAuth()
  // fallback to localStorage key you've used elsewhere

  const [auditLogs, setAuditLogs] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [filterDate, setFilterDate] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  // Build query params and fetch logs
  const fetchAuditLogs = useCallback(async (opts = {}) => {
    if (!token) return
    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const signal = controller.signal

    try {
      const params = new URLSearchParams()
      params.set("page", opts.page ?? page)
      params.set("limit", opts.limit ?? limit)

      if (filterAction && filterAction !== "all") params.set("action", filterAction)
      if (filterDate) params.set("start_date", filterDate)

      const url = `${API_BASE}/audit/audit-trail?${params.toString()}`
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        },
        signal
      })

      if (!res.ok) {
        const t = await res.json().catch(() => null)
        throw new Error(t?.error || `Failed to fetch (${res.status})`)
      }

      const data = await res.json()
      // API returns { logs, pagination: { page, limit, total, totalPages } }
      setAuditLogs(Array.isArray(data.logs) ? data.logs : [])
      setPage(data.pagination?.page ?? (opts.page ?? page))
      setLimit(data.pagination?.limit ?? (opts.limit ?? limit))
      setTotalRecords(data.pagination?.total ?? 0)
      setTotalPages(data.pagination?.totalPages ?? 1)
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Failed to fetch audit logs:", err)
        setError(err.message || "Failed to fetch audit logs")
      }
    } finally {
      setLoading(false)
    }

    return () => controller.abort()
  }, [token, page, limit, filterAction, filterDate])

  // initial + when filters change (except search which is client-side)
  useEffect(() => {
    if (!authLoading) fetchAuditLogs({ page: 1 })
    // reset page when filters change
    setPage(1)
  }, [filterAction, filterDate, authLoading]) // search not included: it's client-side

  // paginate
  useEffect(() => {
    // whenever page changes, fetch
    if (!authLoading) fetchAuditLogs({ page })
  }, [page])

  // client-side filtered logs (search)
  const filteredLogs = useMemo(() => {
    if (!debouncedSearch) return auditLogs
    const q = debouncedSearch.toLowerCase()
    return auditLogs.filter(log => {
      return (
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.admin_username && log.admin_username.toLowerCase().includes(q)) ||
        (log.target_id && String(log.target_id).toLowerCase().includes(q)) ||
        (log.target_type && String(log.target_type).toLowerCase().includes(q))
      )
    })
  }, [auditLogs, debouncedSearch])

  // Export CSV (current filtered logs)
  const exportCSV = () => {
    if (filteredLogs.length === 0) return
    setExporting(true)
    try {
      const header = ["Timestamp", "Admin", "Action", "Target Type", "Target ID", "Details"]
      const rows = filteredLogs.map(l => [
        l.created_at,
        l.admin_username || "",
        l.action || "",
        l.target_type || "",
        l.target_id || "",
        typeof l.details === "object" ? JSON.stringify(l.details).replace(/"/g, '""') : String(l.details || "")
      ])
      const csv = [header, ...rows].map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `audit_trail_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Export failed", e)
      alert("Failed to export CSV")
    } finally {
      setExporting(false)
    }
  }

  // small helpers for visual bits
  const getActionIcon = (action) => {
    switch (action) {
      case 'admin_escrow_release': return <Activity className="w-4 h-4 text-red-400" />
      case 'user_login': return <User className="w-4 h-4 text-green-400" />
      case 'listing_approved': return <Eye className="w-4 h-4 text-blue-400" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }
  const getActionColor = (action) => {
    switch (action) {
      case 'admin_escrow_release': return 'text-red-400 bg-red-400/10'
      case 'user_login': return 'text-green-400 bg-green-400/10'
      case 'listing_approved': return 'text-blue-400 bg-blue-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  // small UI: previous/next
  const prevDisabled = page <= 1 || loading
  const nextDisabled = page >= totalPages || loading

  return (
    <AdminLayout>
      <div className="p-6 mt-15">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Audit Trail</h1>
            <p className="text-gray-400 max-w-xl">Track administrative actions and system events. Server-side paging & filtering, quick client-side search.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              disabled={exporting || filteredLogs.length === 0}
              className="px-4 py-2 bg-[#39FF14] text-black rounded-lg hover:bg-[#39FF14]/80 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exporting..." : `Export (${filteredLogs.length})`}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search logs (action, admin, target id)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#39FF14]/50"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#39FF14]/50"
          >
            <option value="all">All Actions</option>
            <option value="admin_escrow_release">Escrow Release</option>
            <option value="user_login">User Login</option>
            <option value="listing_approved">Listing Approved</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#39FF14]/50"
          />

          <div className="flex items-center justify-end text-gray-400">
            <Filter className="w-4 h-4 mr-2" />
            <div className="text-sm">
              <div>{totalRecords.toLocaleString()} records</div>
              <div className="text-xs">Page {page} of {totalPages}</div>
            </div>
          </div>
        </div>

        {/* Logs List - fixed height and scrollable */}
        <div className="space-y-4">
          <div className="bg-black/50 border border-white/10 rounded-lg p-4">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-black/40 rounded-md" />
                ))}
              </div>
            ) : error ? (
              <div className="text-red-400 p-4">{error}</div>
            ) : (
              <div className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="bg-black/60 border border-white/6 rounded-lg p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getActionIcon(log.action)}</div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                            {String(log.action || "").replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-gray-400 text-sm">by {log.admin_username || "—"}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-400 flex items-center gap-3">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                          {log.target_type && (
                            <span className="ml-3">• Target: <span className="font-mono ml-1">{String(log.target_type)} {log.target_id ? `(${String(log.target_id).slice(0, 20)}...)` : ""}</span></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedLog(log); setShowDetailsModal(true) }}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No audit logs found</h3>
                    <p className="text-gray-500">Try clearing filters or changing the date range.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              Showing {Math.min((page - 1) * limit + 1, totalRecords || 0)} - {Math.min(page * limit, totalRecords || 0)} of {totalRecords.toLocaleString()}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={prevDisabled}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-black/40 border border-white/10 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <div className="px-3 py-1 text-sm text-gray-300 bg-black/30 rounded">
                {page}
              </div>
              <button
                disabled={nextDisabled}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-black/40 border border-white/10 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Audit Log Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1">Action</label>
                <p className="text-white">{selectedLog.action}</p>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Admin</label>
                <p className="text-white">{selectedLog.admin_username} ({selectedLog.admin_email})</p>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Timestamp</label>
                <p className="text-white">{new Date(selectedLog.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Target</label>
                <p className="text-white">{selectedLog.target_type}: {selectedLog.target_id}</p>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Details</label>
                <pre className="text-white bg-black/50 p-3 rounded border border-white/10 text-sm overflow-x-auto">
                  {typeof selectedLog.details === "object" ? JSON.stringify(selectedLog.details, null, 2) : String(selectedLog.details)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
