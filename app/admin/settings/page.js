"use client"
import { useState, useEffect } from "react"
import AdminLayout from "../components/AdminLayout"
import { Power, Loader } from "lucide-react"
import { logAudit } from "../../../lib/auditHelper"
import { useAuth } from "../../contexts/AuthContext"

export default function AdminSettings() {
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { token, user, loading: authLoading } = useAuth()

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch("https://ripple-flask-server.onrender.com/admin/settings/api/admin/settings/status", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setIsMaintenance(data.is_maintenance)
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleMaintenance = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch("https://ripple-flask-server.onrender.com/admin/settings/api/admin/settings/toggle", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_maintenance: !isMaintenance }),
      })
      const data = await res.json()
      if (data.success) {
        setIsMaintenance(data.is_maintenance)

        // ✅ log audit trail
        await logAudit(
          "update_settings",
          "site",
          "settings_maintenance",
          { maintenance_enabled: data.is_maintenance }
        )
      }
    } catch (err) {
      console.error("Failed to update settings:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-12 h-12 animate-spin text-[#39FF14]" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 mt-20">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Settings</h1>
        <p className="text-gray-400 mb-6">Manage global site settings</p>

        <div className="bg-[#111111] border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Site Maintenance Mode
            </h2>
            <p className="text-gray-400 text-sm max-w-md">
              Enable this switch to put the entire site into maintenance mode.
              Normal users won’t be able to access while it’s active.
            </p>
          </div>

          <button
            onClick={toggleMaintenance}
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
              isMaintenance
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-[#39FF14] hover:bg-[#39FF14]/80 text-black"
            } ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {saving ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Power className="w-5 h-5" />
            )}
            {isMaintenance ? "Disable Maintenance" : "Enable Maintenance"}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
