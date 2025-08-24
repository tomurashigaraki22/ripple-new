"use client"

import { useState, useEffect } from "react"
import { Camera } from "lucide-react"
import StorefrontSidebar from "../../components/StoreFrontSidebar"
import { useAuth } from "../../contexts/AuthContext"

export default function StorefrontProfile() {
  const { token } = useAuth()
  const [profile, setProfile] = useState({
    picture: null,
    username: "",
    btc: "",
    eth: "",
    xrpbEvm: "",
    xrpbSol: "",
    xrpbXrpl: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("https://ripple-flask-server.pxxl.pro/storefront/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success && data.profile) setProfile(data.profile)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchProfile()
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const generateSignature = async (params) => {
    const res = await fetch("https://ripple-flask-server.pxxl.pro/cloudinary/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
    if (!res.ok) throw new Error("Failed to generate signature")
    return res.json()
  }

  const uploadToCloudinary = async (file) => {
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = "storefront/profile"
    const params = { timestamp, folder, public_id: `profile_${timestamp}_${Math.random().toString(36).substring(7)}` }
    const { signature, api_key } = await generateSignature(params)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("api_key", api_key)
    formData.append("timestamp", timestamp)
    formData.append("signature", signature)
    formData.append("folder", folder)
    formData.append("public_id", params.public_id)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    })
    if (!res.ok) throw new Error("Failed to upload image")
    const data = await res.json()
    return data.secure_url
  }

  const handlePictureChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const url = await uploadToCloudinary(file)
      setProfile((prev) => ({ ...prev, picture: url }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("https://ripple-flask-server.pxxl.pro/storefront/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#111111] text-white">
      <StorefrontSidebar />
      <div className="flex-1 ml-0 lg:ml-64 p-6 md:p-10 lg:p-12">
        <h1 className="text-3xl font-bold mb-8 text-white">Storefront Profile</h1>
        {loading ? (
          <div>Loading profile...</div>
        ) : (
          <>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Profile Details</h2>
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gray-900 border border-gray-700 shadow-md">
                  {profile.picture ? (
                    <img src={profile.picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <Camera size={40} />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePictureChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-sm text-gray-400">Click to upload a picture</p>
              </div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Storefront Username</label>
              <input type="text" name="username" value={profile.username} onChange={handleChange} className="w-full bg-[#111111] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Wallet Addresses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["btc", "eth", "xrpbEvm", "xrpbSol", "xrpbXrpl"].map((name) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{name.toUpperCase()}</label>
                    <input type="text" name={name} value={profile[name] || ""} onChange={handleChange} className="w-full bg-[#111111] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold shadow-md transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
