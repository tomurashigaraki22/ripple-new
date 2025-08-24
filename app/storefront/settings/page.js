"use client"

import React, { useState, useEffect } from "react"
import { User, LayoutDashboard, Bell, Package, Gift, PaintBucket, Type, Image, Music } from "lucide-react"
import { useRouter } from "next/navigation"
import StorefrontSidebar from "../../components/StoreFrontSidebar"
import { Button } from "../../components/ui/button"
import { Card, CardTitle } from "../../components/ui/card"
import { SelectItem, SelectTrigger, SelectContent, SelectValue, Select } from "../../components/ui/select"
import { useAuth } from "../../contexts/AuthContext"
import { BackgroundThemes, ColorsAndThemes, LayoutAndEffects, LogoAndBranding, SpotifyIntegration, Typography } from "../../components/SubSections"

export default function StorefrontSettings() {
  const [activeTab, setActiveTab] = useState("account")
  const [activeOption, setActiveOption] = useState("colors")
  const { token, user } = useAuth()
  const [settings, setSettings] = useState({
    low_stock_alert: true,
    promotional_email_alert: true,
    new_order_alerts: true,
    storefront_design: {}
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const storefrontOptions = [
    { id: "background", label: "Background", icon: PaintBucket },
    { id: "typography", label: "Typography", icon: Type },
    { id: "layout", label: "Layout & Effects", icon: LayoutDashboard },
    { id: "spotify", label: "Spotify", icon: Music },
    { id: "branding", label: "Logo & Branding", icon: Image },
  ]

  const renderActiveComponent = () => {
    switch (activeOption) {
      case "colors": return <ColorsAndThemes settings={settings} setSettings={setSettings} />
      case "background": return <BackgroundThemes settings={settings} setSettings={setSettings} />
      case "layout": return <LayoutAndEffects settings={settings} setSettings={setSettings} />
      case "typography": return <Typography settings={settings} setSettings={setSettings} />
      case "spotify": return <SpotifyIntegration settings={settings} setSettings={setSettings} />
      case "branding": return <LogoAndBranding settings={settings} setSettings={setSettings} />
      default: return null
    }
  }

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`https://ripple-flask-server.onrender.com/storefront/me/settings/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success && data.settings) setSettings(data.settings)
      } catch (err) {
        console.error("Failed to fetch settings:", err)
      } finally {
        setLoading(false)
      }
    }
    if (token && user) fetchSettings()
  }, [token])

  const handleToggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`https://ripple-flask-server.onrender.com/storefront/me/settings/${user.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (!data.success) console.error("Failed to save settings:", data.message)
    } catch (err) {
      console.error("Error saving settings:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-white p-8">Loading settings...</div>

  return (
    <div className="flex">
      <StorefrontSidebar />
      <div className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 md:p-8 mt-30 md:mt-30 lg:mt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Settings</h1>
            <p className="text-gray-400">Change your storefront and account settings</p>
          </div>
          <div className="flex gap-4">
            <Button
              className={`flex items-center gap-2 px-4 py-2 ${activeTab === "account" ? "bg-green-500" : "bg-gray-500"}`}
              onClick={() => setActiveTab("account")}
            ><User size={18} />Account Settings</Button>

            <Button
              className={`flex items-center gap-2 px-4 py-2 ${activeTab === "storefront" ? "bg-green-500" : "bg-gray-500"}`}
              onClick={() => setActiveTab("storefront")}
            ><LayoutDashboard size={18} />Storefront Design</Button>
          </div>
        </div>

        {activeTab === "account" ? (
          <Card className="border border-gray-800 bg-[#1a1a1a]/70 backdrop-blur-lg text-white rounded-2xl shadow-xl p-6 mb-8">
            <CardTitle className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-green-500" />Email Notifications
            </CardTitle>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { field: "low_stock_alert", label: "Low Stock Alerts", icon: Package },
                { field: "promotional_email_alert", label: "Promotional Emails", icon: Gift },
                { field: "new_order_alerts", label: "New Orders", icon: Bell }
              ].map(({ field, label, icon: Icon }) => (
                <div key={field} className="bg-[#111111] border border-gray-700 rounded-xl p-4 hover:border-green-500/40 transition">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <Icon className="w-4 h-4 text-green-400" />{label}
                  </label>
                  <Select value={settings[field] ? "enabled" : "disabled"} onValueChange={() => handleToggle(field)}>
                    <SelectTrigger className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 transition">
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] text-white border border-gray-700 rounded-lg shadow-lg">
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {storefrontOptions.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveOption(id)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all shadow-sm
                    ${activeOption === id ? "bg-green-600 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]" : "bg-[#1a1a1a] border-gray-800 hover:border-green-500/50 hover:shadow-[0_0_8px_rgba(34,197,94,0.4)]"}`}
                >
                  <Icon size={20} className="text-white" />
                  <span className="text-xs font-medium text-white">{label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-[#1a1a1a]/60 border border-gray-800 shadow-lg">
              {renderActiveComponent()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
