"use client"
import { useEffect, useMemo, useState } from "react"
import {
  Search, Shield, DollarSign, Calendar, Clock, CheckCircle, AlertTriangle, XCircle,
  ExternalLink, Wallet, Copy, X
} from "lucide-react"
import AdminLayout from "../components/AdminLayout"

const dummyEscrows = [
  {
    id: "ESC-10001-2a9f3c",
    order_id: "ORD-98001",
    amount: 512.345678,
    status: "funded",
    seller: "rSELLER_1x93K8f2n4hA7vPqB3LmN9tY2ZxC5D1",
    buyer:  "rBUYER__9f21M7s4QaL8yZpX6KdH3gT0VcB2Qe",
    escrow_wallet: "rESCROW_WALLET_a1b2c3d4e5",
    transaction_hash: "0x9b77ac1f4b3e9f...d28c",
    created_at: "2025-08-03T14:12:00Z",
    updated_at: "2025-08-04T09:41:00Z",
    chain: "XRPL",
    release_condition: "Auto-release after delivery confirmation",
    dispute_deadline: "2025-08-10T00:00:00Z"
  },
  {
    id: "ESC-10002-6b7e1d",
    order_id: "ORD-98002",
    amount: 99.000001,
    status: "pending",
    seller: "rSELLER_7h1QxP0Lm4Na2Sk5D9VtG3Jw8RbCeF",
    buyer:  "rBUYER__1n0MxQ2Lp5Sa7Dj9VtKcG3Hw8RbYeF",
    escrow_wallet: "rESCROW_WALLET_z9y8x7w6v5",
    transaction_hash: "",
    created_at: "2025-08-05T08:05:00Z",
    updated_at: "2025-08-05T08:05:00Z",
    chain: "XRPL",
    release_condition: "Funds lock until seller ships",
    dispute_deadline: "2025-08-12T00:00:00Z"
  },
  {
    id: "ESC-10003-0c5ad2",
    order_id: "ORD-98003",
    amount: 1200.5,
    status: "released",
    seller: "rSELLER_4z7YpL2Qc9Va3Tn6KdH1gW8Rb0CeFs",
    buyer:  "rBUYER__7k5MpQ1Lp3Sa9Dj2VtKcH6Hw1RbYeG",
    escrow_wallet: "rESCROW_WALLET_q1w2e3r4t5",
    transaction_hash: "0x12aa41cf55b2aa...09f3",
    created_at: "2025-08-01T10:22:00Z",
    updated_at: "2025-08-02T12:10:00Z",
    chain: "XRPL",
    release_condition: "Manual release by buyer",
    dispute_deadline: "2025-08-08T00:00:00Z"
  },
  {
    id: "ESC-10004-9ef1aa",
    order_id: "ORD-98004",
    amount: 350.75,
    status: "disputed",
    seller: "rSELLER_8n4QxP0Lm2Na7Sk5D3VtG9Jw6RbCeF",
    buyer:  "rBUYER__9n0MxQ2Lp5Sa3Dj7VtKcG1Hw4RbYeF",
    escrow_wallet: "rESCROW_WALLET_m9n8b7v6c5",
    transaction_hash: "0x77c19df0b43abc...ae11",
    created_at: "2025-08-06T19:42:00Z",
    updated_at: "2025-08-07T11:03:00Z",
    chain: "XRPL",
    release_condition: "Awaiting admin resolution",
    dispute_deadline: "2025-08-13T00:00:00Z"
  }
]

export default function AdminEscrows() {
  const [escrows, setEscrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [selected, setSelected] = useState(null)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [releaseAddress, setReleaseAddress] = useState("")
  const [releasing, setReleasing] = useState(false)

  useEffect(() => {
    // simulate fetch
    const t = setTimeout(() => {
      setEscrows(dummyEscrows)
      setLoading(false)
    }, 700)
    return () => clearTimeout(t)
  }, [])

  const getStatusPill = (s) => {
    const map = {
      pending: "text-yellow-400 bg-yellow-400/10",
      funded: "text-green-400 bg-green-400/10",
      conditions_met: "text-blue-400 bg-blue-400/10",
      released: "text-emerald-400 bg-emerald-400/10",
      disputed: "text-red-400 bg-red-400/10",
      cancelled: "text-gray-400 bg-gray-400/10",
    }
    return map[s] || "text-gray-400 bg-gray-400/10"
  }

  const getStatusIcon = (s) => {
    switch (s) {
      case "pending": return <Clock className="w-4 h-4" />
      case "funded": return <CheckCircle className="w-4 h-4" />
      case "conditions_met": return <Shield className="w-4 h-4" />
      case "released": return <CheckCircle className="w-4 h-4" />
      case "disputed": return <AlertTriangle className="w-4 h-4" />
      case "cancelled": return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const copyToClipboard = (val) => {
    navigator.clipboard?.writeText(val)
  }

  const filtered = useMemo(() => {
    return escrows.filter(e => {
      const q = search.trim().toLowerCase()
      const match =
        e.id.toLowerCase().includes(q) ||
        e.order_id.toLowerCase().includes(q) ||
        e.seller.toLowerCase().includes(q) ||
        e.buyer.toLowerCase().includes(q)
      const statusOk = status === "all" || e.status === status
      return match && statusOk
    })
  }, [escrows, search, status])

  const handleOpenDetails = (e) => setSelected(e)

  const handleAdminRelease = async () => {
    if (!releaseAddress.trim()) return
    setReleasing(true)
    // simulate success
    setTimeout(() => {
      setReleasing(false)
      setShowReleaseModal(false)
      setReleaseAddress("")
      alert("✅ (demo) Escrow released successfully.")
    }, 900)
  }

  return (
    <AdminLayout>
      <div className="mt-20 p-6 bg-[#111111] text-white rounded-xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Escrows</h1>
          <p className="text-gray-400">Monitor and manage escrow transactions</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-lg p-2 flex-1">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              className="bg-transparent outline-none text-white placeholder-gray-400 w-full"
              placeholder="Search escrow ID, order ID, buyer, seller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="funded">Funded</option>
            <option value="conditions_met">Conditions Met</option>
            <option value="released">Released</option>
            <option value="disputed">Disputed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Scrollable list (fixed height) */}
        <div className="overflow-x-hidden bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-t-emerald-400 border-white/20 rounded-full animate-spin"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-14 h-14 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300">No escrows found</h3>
                <p className="text-gray-500">Try adjusting your filters or search.</p>
              </div>
            ) : (
              filtered.map((e) => (
                <div key={e.id} className="bg-black/40 border border-white/10 rounded-xl p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusPill(e.status)}`}>
                          {getStatusIcon(e.status)} {e.status.replace("_", " ")}
                        </span>
                        <span className="text-gray-400 text-sm">Escrow: <span className="font-mono">{e.id.slice(0, 10)}...</span></span>
                        <span className="text-gray-400 text-sm">Order: <span className="font-mono">{e.order_id}</span></span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Amount</p>
                          <p className="text-white font-semibold flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            {e.amount.toFixed(6)} XRPB
                          </p>
                        </div>
                        <div className="truncate">
                          <p className="text-gray-400 text-sm mb-1">Seller</p>
                          <p className="text-white font-mono text-sm flex items-center gap-2">
                            <span className="truncate">{e.seller}</span>
                            <button onClick={() => copyToClipboard(e.seller)} className="text-gray-400 hover:text-white">
                              <Copy className="w-3 h-3" />
                            </button>
                          </p>
                        </div>
                        <div className="truncate">
                          <p className="text-gray-400 text-sm mb-1">Buyer</p>
                          <p className="text-white font-mono text-sm flex items-center gap-2">
                            <span className="truncate">{e.buyer}</span>
                            <button onClick={() => copyToClipboard(e.buyer)} className="text-gray-400 hover:text-white">
                              <Copy className="w-3 h-3" />
                            </button>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {new Date(e.created_at).toLocaleString()}
                        </span>
                        {e.transaction_hash && (
                          <span className="flex items-center gap-1">
                            <ExternalLink className="w-4 h-4" />
                            TX: <span className="font-mono">{e.transaction_hash.slice(0, 12)}...</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenDetails(e)}
                        className="px-4 py-2 bg-blue-600/60 hover:bg-blue-600/80 text-white rounded-lg transition"
                      >
                        View Details
                      </button>
                      {(e.status === "funded" || e.status === "conditions_met") && (
                        <button
                          onClick={() => { setSelected(e); setShowReleaseModal(true) }}
                          className="px-4 py-2 bg-red-600/70 hover:bg-red-600/90 text-white rounded-lg transition flex items-center gap-2"
                        >
                          <Wallet className="w-4 h-4" /> Admin Release
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-3xl p-6 relative">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Escrow Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <Detail label="Escrow ID" value={selected.id} copy />
                  <Detail label="Order ID" value={selected.order_id} copy />
                  <Detail label="Status" value={selected.status.replace("_", " ")} />
                  <Detail label="Amount" value={`${selected.amount.toFixed(6)} XRPB`} />
                  <Detail label="Chain" value={selected.chain} />
                  <Detail label="Created" value={new Date(selected.created_at).toLocaleString()} />
                  <Detail label="Updated" value={new Date(selected.updated_at).toLocaleString()} />
                </div>
                <div className="space-y-2">
                  <Detail label="Seller" value={selected.seller} mono copy />
                  <Detail label="Buyer" value={selected.buyer} mono copy />
                  <Detail label="Escrow Wallet" value={selected.escrow_wallet} mono copy />
                  <Detail label="Tx Hash" value={selected.transaction_hash || "—"} mono copy={!!selected.transaction_hash} />
                  <Detail label="Release Condition" value={selected.release_condition} />
                  <Detail label="Dispute Deadline" value={new Date(selected.dispute_deadline).toLocaleString()} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Release Modal (demo) */}
        {showReleaseModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-3">Admin Release Escrow</h3>
              <p className="text-gray-400 text-sm mb-4">
                You are about to release <span className="text-white font-semibold">{selected?.amount.toFixed(6)} XRPB</span> from
                escrow <span className="font-mono">{selected?.id}</span>.
              </p>
              <label className="block text-gray-300 text-sm mb-2">Withdrawal Address</label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none text-white"
                placeholder="Enter wallet address…"
                value={releaseAddress}
                onChange={(e) => setReleaseAddress(e.target.value)}
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => { setShowReleaseModal(false); setReleaseAddress("") }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminRelease}
                  disabled={!releaseAddress.trim() || releasing}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg"
                >
                  {releasing ? "Releasing…" : "Release Funds"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function Detail({ label, value, mono, copy }) {
  const onCopy = () => navigator.clipboard?.writeText(String(value || ""))
  return (
    <div>
      <p className="text-gray-400">{label}</p>
      <p className={`text-white mt-0.5 break-all ${mono ? "font-mono text-[13px]" : ""}`}>
        {value || "—"}
        {copy && value && (
          <button onClick={onCopy} className="ml-2 inline-flex text-gray-400 hover:text-white" title="Copy">
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </p>
    </div>
  )
}
