"use client"

import React, { useState, useEffect } from "react"
import { User, LayoutDashboard, Bell, Package, Gift, UserCircle, Briefcase, Link, Palette, Eye, Plus, Edit, Trash2, Save, X, Upload, Camera, Award, Star, GripVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import StorefrontSidebar from "../../components/StoreFrontSidebar"
import { Button } from "../../components/ui/button"
import { Card, CardTitle, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { SelectItem, SelectTrigger, SelectContent, SelectValue, Select } from "../../components/ui/select"
import { useAuth } from "../../contexts/AuthContext"

const API_BASE_URL = 'https://ripple-flask-server.onrender.com'

export default function StorefrontSettings() {
  const [activeTab, setActiveTab] = useState("account")
  const [activeOption, setActiveOption] = useState("profile")
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const router = useRouter()
    const [skills, setSkills] = useState([])


  const [uploading, setUploading] = useState(false)
  // Account settings state
  const [accountSettings, setAccountSettings] = useState({
    low_stock_alert: true,
    promotional_email_alert: true,
    new_order_alerts: true
  })
  const [editingSkill, setEditingSkill] = useState(null)


  const uploadToCloudinary = (file, type = 'avatar') => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
      formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
      
      fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.secure_url) {
          resolve(data.secure_url)
        } else {
          reject(new Error('Upload failed'))
        }
      })
      .catch(error => reject(error))
    })
  }

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const imageUrl = await uploadToCloudinary(file, type)
      
      if (type === 'avatar') {
        setProfile(prev => ({ ...prev, avatar: imageUrl }))
      } else if (type === 'cover') {
        setProfile(prev => ({ ...prev, cover_image: imageUrl }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Storefront data states
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    avatar: '',
    cover_image: '',
    location: '',
    email: '',
    phone: ''
  })

  const [services, setServices] = useState([])
  const [socialLinks, setSocialLinks] = useState([])
  const [themes, setThemes] = useState([])
  const [activeTheme, setActiveTheme] = useState(null)

  // Form states
  const [editingService, setEditingService] = useState(null)
  const [editingSocial, setEditingSocial] = useState(null)
  const [newTheme, setNewTheme] = useState({
    name: '',
    primary_color: '#1a1a2e',
    secondary_color: '#16213e',
    accent_color: '#39FF14'
  })

  const storefrontOptions = [
    { id: "profile", label: "Profile", icon: UserCircle },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Award },
    { id: "social", label: "Social Links", icon: Link },
    { id: "themes", label: "Themes", icon: Palette },
  ]

  // Fetch all storefront data
  useEffect(() => {
    const fetchStorefrontData = async () => {
      if (!token || !user) return
      
      try {
        setLoading(true)
        
        // Fetch account settings
        const accountRes = await fetch(`${API_BASE_URL}/storefront/me/settings/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (accountRes.ok) {
          const accountData = await accountRes.json()
          if (accountData.success && accountData.settings) {
            setAccountSettings(accountData.settings)
          }
        }

        // Fetch storefront profile data
        const profileRes = await fetch(`${API_BASE_URL}/storefronts/profile/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.profile) setProfile(profileData.profile)
          if (profileData.services) setServices(profileData.services)
          if (profileData.social_links) setSocialLinks(profileData.social_links)
          if (profileData.theme) setActiveTheme(profileData.theme)
        }

        const skillsRes = await fetch(`${API_BASE_URL}/storefronts/skills/${user.userId}`)
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json()
          if (skillsData.skills) setSkills(skillsData.skills)
        }
      console.log("Skills res: ", skillsRes)

      } catch (err) {
        console.error("Failed to fetch storefront data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStorefrontData()
  }, [token, user])

  // Account settings handlers
  const handleAccountToggle = (field) => {
    setAccountSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleAccountSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/storefront/me/settings/${user.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(accountSettings)
      })
      const data = await res.json()
      if (!data.success) console.error("Failed to save account settings:", data.message)
    } catch (err) {
      console.error("Error saving account settings:", err)
    } finally {
      setSaving(false)
    }
  }

  // Profile handlers
  // Profile handlers - Fixed to handle creation
  const handleProfileSave = async () => {
    setSaving(true)
    try {
      // First try to update (PUT)
      let res = await fetch(`${API_BASE_URL}/storefronts/profile/${user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile)
      })
      
      // If profile doesn't exist (404), create it (POST)
      if (res.status === 404) {
        res = await fetch(`${API_BASE_URL}/storefronts/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...profile, owner_id: user.userId, storefront_id: user.userId })
        })
      }
      
      const data = await res.json()
      if (data.message || data.success) {
        console.log("Profile saved successfully")
      } else {
        console.error("Failed to save profile:", data.message)
      }
    } catch (err) {
      console.error("Error saving profile:", err)
    } finally {
      setSaving(false)
    }
  }

    // Skills handlers
  const handleSkillSave = async (skillData) => {
    setSaving(true)
    try {
      if (skillData.id) {
        // Update existing skill
        const res = await fetch(`${API_BASE_URL}/storefronts/skills/${skillData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(skillData)
        })
        const data = await res.json()
        if (data.success || res.ok) {
          setSkills(prev => prev.map(skill => skill.id === skillData.id ? { ...skillData } : skill))
          setEditingSkill(null)
        }
      } else {
        // Create new skill
        const res = await fetch(`${API_BASE_URL}/storefronts/skills`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ 
            ...skillData, 
            owner_id: user.userId, 
            storefront_id: user.userId 
          })
        })
        const data = await res.json()
        if (data.skill_id || data.id) {
          const newSkill = { ...skillData, id: data.skill_id || data.id }
          setSkills(prev => [...prev, newSkill])
          setEditingSkill(null)
        }
      }
    } catch (err) {
      console.error("Error saving skill:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleSkillDelete = async (skillId) => {
    if (!confirm('Are you sure you want to delete this skill?')) return
    
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/storefronts/skills/${skillId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setSkills(prev => prev.filter(skill => skill.id !== skillId))
      }
    } catch (err) {
      console.error("Error deleting skill:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleSkillsReorder = async (reorderedSkills) => {
    try {
      const skillsWithOrder = reorderedSkills.map((skill, index) => ({
        id: skill.id,
        display_order: index + 1
      }))
      
      const res = await fetch(`${API_BASE_URL}/storefronts/skills/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ skills: skillsWithOrder })
      })
      
      if (res.ok) {
        setSkills(reorderedSkills)
      }
    } catch (err) {
      console.error("Error reordering skills:", err)
    }
  }




    const renderSkillsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Your Skills</h3>
        <Button 
          onClick={() => setEditingSkill({ 
            skill_name: '', 
            skill_level: 50, 
            category: '', 
            years_experience: 1, 
            is_featured: false 
          })}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Skill
        </Button>
      </div>
      
      {editingSkill && (
        <Card className="bg-[#1a1a1a] border-gray-700 p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Skill Name *</label>
                <Input
                  value={editingSkill.skill_name}
                  onChange={(e) => setEditingSkill(prev => ({ ...prev, skill_name: e.target.value }))}
                  className="bg-[#111] border-gray-600 text-white"
                  placeholder="e.g., Python, React, Design"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Category</label>
                <Input
                  value={editingSkill.category}
                  onChange={(e) => setEditingSkill(prev => ({ ...prev, category: e.target.value }))}
                  className="bg-[#111] border-gray-600 text-white"
                  placeholder="e.g., Programming, Design, Marketing"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Skill Level: {editingSkill.skill_level}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingSkill.skill_level}
                  onChange={(e) => setEditingSkill(prev => ({ ...prev, skill_level: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Years of Experience</label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={editingSkill.years_experience}
                  onChange={(e) => setEditingSkill(prev => ({ ...prev, years_experience: parseInt(e.target.value) }))}
                  className="bg-[#111] border-gray-600 text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={editingSkill.is_featured}
                onChange={(e) => setEditingSkill(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
              />
              <label htmlFor="is_featured" className="text-white text-sm">
                Feature this skill (show prominently on profile)
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSkillSave(editingSkill)} 
                disabled={saving || !editingSkill.skill_name}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Skill"}
              </Button>
              <Button 
                onClick={() => setEditingSkill(null)} 
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="grid gap-4">
        {skills.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No skills added yet. Add your first skill to showcase your expertise!</p>
          </div>
        ) : (
          skills.map((skill, index) => (
            <Card key={skill.id || index} className="bg-[#1a1a1a] border-gray-700 p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-semibold">{skill.skill_name}</h4>
                    {skill.is_featured && (
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{skill.category}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>{skill.years_experience} years experience</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${skill.skill_level}%` }}
                        />
                      </div>
                      <span>{skill.skill_level}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setEditingSkill(skill)} 
                    variant="outline" 
                    size="sm"
                    className="border-gray-600 text-white hover:bg-gray-800"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={() => handleSkillDelete(skill.id)} 
                    variant="outline" 
                    size="sm"
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      
      {skills.length > 1 && (
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            💡 Tip: You can drag and drop skills to reorder them (feature coming soon)
          </p>
        </div>
      )}
    </div>
  )
  // Service handlers
  const handleServiceSave = async (serviceData) => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/storefronts/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          ...serviceData, 
          owner_id: user.userId, 
          storefront_id: user.userId 
        })
      })
      const data = await res.json()
      if (data.service_id) {
        setServices(prev => [...prev, { ...serviceData, id: data.service_id }])
        setEditingService(null)
      }
    } catch (err) {
      console.error("Error saving service:", err)
    } finally {
      setSaving(false)
    }
  }

  // Theme handlers
  const handleThemeSave = async (themeData) => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/storefronts/themes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          ...themeData, 
          owner_id: user.userId, 
          storefront_id: user.userId,
          is_active: true
        })
      })
      const data = await res.json()
      if (data.theme_id) {
        setActiveTheme({ ...themeData, id: data.theme_id })
        setNewTheme({ name: '', primary_color: '#1a1a2e', secondary_color: '#16213e', accent_color: '#39FF14' })
      }
    } catch (err) {
      console.error("Error saving theme:", err)
    } finally {
      setSaving(false)
    }
  }

  // Render different sections
  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Profile Images</h4>
        
        {/* Avatar Upload */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-white text-sm font-medium">Profile Picture</label>
            <div className="flex gap-2">
              <Button
                onClick={() => document.getElementById('avatar-upload').click()}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Change Avatar'}
              </Button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'avatar')}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-400">Recommended: Square image, max 5MB</p>
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="block text-white text-sm font-medium">Cover Image</label>
          <div className="relative">
            <div className="w-[40%] h-32 rounded-lg overflow-hidden bg-gray-700 border-2 border-gray-600">
              {profile.cover_image ? (
                <img 
                  src={profile.cover_image} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => document.getElementById('cover-upload').click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Change Cover'}
            </Button>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'cover')}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-400">Recommended: 16:9 aspect ratio, max 5MB</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white text-sm font-medium mb-2">Name *</label>
          <Input
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            className="bg-[#1a1a1a] border-gray-700 text-white"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">Title</label>
          <Input
            value={profile.title}
            onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
            className="bg-[#1a1a1a] border-gray-700 text-white"
            placeholder="Your professional title"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-white text-sm font-medium mb-2">Bio</label>
          <Textarea
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            className="bg-[#1a1a1a] border-gray-700 text-white"
            placeholder="Tell visitors about yourself"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">Location</label>
          <Input
            value={profile.location}
            onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
            className="bg-[#1a1a1a] border-gray-700 text-white"
            placeholder="City, Country"
          />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">Email</label>
          <Input
            value={profile.email}
            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
            className="bg-[#1a1a1a] border-gray-700 text-white"
            placeholder="contact@example.com"
          />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">Phone</label>
          <Input
            value={profile.phone}
            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
            className="bg-[#1a1a1a] border-gray-700 text-white"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
      <Button onClick={handleProfileSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  )

  const renderServicesSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Your Services</h3>
        <Button 
          onClick={() => setEditingService({ title: '', description: '', price_text: '', starting_price: '', features: [], category: '' })}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>
      
      {editingService && (
        <Card className="bg-[#1a1a1a] border-gray-700 p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Service Title *</label>
                <Input
                  value={editingService.title}
                  onChange={(e) => setEditingService(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-[#111] border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Category</label>
                <Input
                  value={editingService.category}
                  onChange={(e) => setEditingService(prev => ({ ...prev, category: e.target.value }))}
                  className="bg-[#111] border-gray-600 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Description *</label>
              <Textarea
                value={editingService.description}
                onChange={(e) => setEditingService(prev => ({ ...prev, description: e.target.value }))}
                className="bg-[#111] border-gray-600 text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Price Text</label>
                <Input
                  value={editingService.price_text}
                  onChange={(e) => setEditingService(prev => ({ ...prev, price_text: e.target.value }))}
                  className="bg-[#111] border-gray-600 text-white"
                  placeholder="Starting at $99"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Starting Price</label>
                <Input
                  type="number"
                  value={editingService.starting_price}
                  onChange={(e) => setEditingService(prev => ({ ...prev, starting_price: e.target.value }))}
                  className="bg-[#111] border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleServiceSave(editingService)} 
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Service"}
              </Button>
              <Button 
                onClick={() => setEditingService(null)} 
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="grid gap-4">
        {services.map((service, index) => (
          <Card key={index} className="bg-[#1a1a1a] border-gray-700 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-semibold">{service.title}</h4>
                <p className="text-gray-400 text-sm mt-1">{service.description}</p>
                <p className="text-green-400 text-sm mt-2">{service.price_text}</p>
              </div>
              <Button 
                onClick={() => setEditingService(service)} 
                variant="outline" 
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderThemesSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Current Theme</h3>
        {activeTheme && (
          <Card className="bg-[#1a1a1a] border-gray-700 p-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: activeTheme.primary_color }} />
                <div className="w-8 h-8 rounded" style={{ backgroundColor: activeTheme.secondary_color }} />
                <div className="w-8 h-8 rounded" style={{ backgroundColor: activeTheme.accent_color }} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{activeTheme.name}</h4>
                <p className="text-gray-400 text-sm">Active Theme</p>
              </div>
            </div>
          </Card>
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Create New Theme</h3>
        <Card className="bg-[#1a1a1a] border-gray-700 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Theme Name</label>
              <Input
                value={newTheme.name}
                onChange={(e) => setNewTheme(prev => ({ ...prev, name: e.target.value }))}
                className="bg-[#111] border-gray-600 text-white"
                placeholder="My Custom Theme"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newTheme.primary_color}
                    onChange={(e) => setNewTheme(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-16 h-10 p-1 bg-[#111] border-gray-600"
                  />
                  <Input
                    value={newTheme.primary_color}
                    onChange={(e) => setNewTheme(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="bg-[#111] border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Secondary Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newTheme.secondary_color}
                    onChange={(e) => setNewTheme(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-16 h-10 p-1 bg-[#111] border-gray-600"
                  />
                  <Input
                    value={newTheme.secondary_color}
                    onChange={(e) => setNewTheme(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="bg-[#111] border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newTheme.accent_color}
                    onChange={(e) => setNewTheme(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="w-16 h-10 p-1 bg-[#111] border-gray-600"
                  />
                  <Input
                    value={newTheme.accent_color}
                    onChange={(e) => setNewTheme(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="bg-[#111] border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-gray-600" style={{
              background: `linear-gradient(135deg, ${newTheme.primary_color} 0%, ${newTheme.secondary_color} 50%, ${newTheme.primary_color} 100%)`
            }}>
              <p className="text-white text-center">Theme Preview</p>
            </div>
            <Button 
              onClick={() => handleThemeSave(newTheme)} 
              disabled={saving || !newTheme.name}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? "Saving..." : "Save & Activate Theme"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderSocialSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Social Media Links</h3>
        <Button 
          onClick={() => setEditingSocial({ platform: '', url: '', username: '' })}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Social Link
        </Button>
      </div>
      
      {editingSocial && (
        <Card className="bg-[#1a1a1a] border-gray-700 p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Platform</label>
                <Select value={editingSocial.platform} onValueChange={(value) => setEditingSocial(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger className="bg-[#111] border-gray-600 text-white">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-gray-600">
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Username</label>
                <Input
                  value={editingSocial.username}
                  onChange={(e) => setEditingSocial(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-[#111] border-gray-600 text-white"
                  placeholder="@username"
                />
              </div>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">URL</label>
              <Input
                value={editingSocial.url}
                onChange={(e) => setEditingSocial(prev => ({ ...prev, url: e.target.value }))}
                className="bg-[#111] border-gray-600 text-white"
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setSocialLinks(prev => [...prev, editingSocial])
                  setEditingSocial(null)
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" /> Save Link
              </Button>
              <Button 
                onClick={() => setEditingSocial(null)} 
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="grid gap-4">
        {socialLinks.map((link, index) => (
          <Card key={index} className="bg-[#1a1a1a] border-gray-700 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-white font-semibold capitalize">{link.platform}</h4>
                <p className="text-gray-400 text-sm">{link.username}</p>
                <p className="text-blue-400 text-sm">{link.url}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setEditingSocial(link)} 
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => setSocialLinks(prev => prev.filter((_, i) => i !== index))} 
                  variant="outline" 
                  size="sm"
                  className="border-red-600 text-red-400 hover:bg-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderActiveComponent = () => {
    switch (activeOption) {
      case "profile": return renderProfileSection()
      case "services": return renderServicesSection()
      case "skills": return renderSkillsSection()
      case "social": return renderSocialSection()
      case "themes": return renderThemesSection()
      default: return null
    }
  }

  if (loading) return <div className="text-white p-8">Loading settings...</div>

  return (
    <div className="flex min-h-screen bg-[#111111] overflow-hidden">
      <StorefrontSidebar />

      <div className="flex-1 ml-0 lg:ml-64 mt-0 lg:mt-20 p-4 sm:p-6 md:p-8 overflow-x-hidden overflow-y-auto md:mt-30">
        <div className="w-full max-w-7xl mx-auto min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-white mb-1 truncate">Storefront Settings</h1>
              <p className="text-gray-400">Manage your storefront and account settings</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                className={`w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 ${
                  activeTab === "account" ? "bg-green-500" : "bg-gray-500"
                }`}
                onClick={() => setActiveTab("account")}
              >
                <User size={18} />
                Account Settings
              </Button>

              <Button
                className={`w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 ${
                  activeTab === "storefront" ? "bg-green-500" : "bg-gray-500"
                }`}
                onClick={() => setActiveTab("storefront")}
              >
                <LayoutDashboard size={18} />
                Storefront Design
              </Button>
              
              {activeTab === "storefront" && (
                <Button
                  className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye size={18} />
                  {showPreview ? "Hide" : "Show"} Preview
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            {/* Main Content */}
            <div className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
              {activeTab === "account" ? (
                <Card className="border border-gray-800 bg-[#1a1a1a]/70 backdrop-blur-lg text-white rounded-2xl shadow-xl p-4 sm:p-6 mb-8">
                  <CardTitle className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-green-500" />
                    Email Notifications
                  </CardTitle>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {[
                      { field: "low_stock_alert", label: "Low Stock Alerts", icon: Package },
                      { field: "promotional_email_alert", label: "Promotional Emails", icon: Gift },
                      { field: "new_order_alerts", label: "New Orders", icon: Bell }
                    ].map(({ field, label, icon: Icon }) => (
                      <div key={field} className="bg-[#111111] border border-gray-700 rounded-xl p-4 hover:border-green-500/40 transition min-w-0">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                          <Icon className="w-4 h-4 text-green-400" />
                          <span className="truncate">{label}</span>
                        </label>
                        <Select value={accountSettings[field] ? "enabled" : "disabled"} onValueChange={() => handleAccountToggle(field)}>
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
                    <Button onClick={handleAccountSave} disabled={saving} className="w-full sm:w-auto">
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-8">
                  {/* Storefront Options */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {storefrontOptions.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveOption(id)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all shadow-sm min-w-0
                          ${
                            activeOption === id
                              ? "bg-green-600 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]"
                              : "bg-[#1a1a1a] border-gray-800 hover:border-green-500/50 hover:shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                          }`}
                      >
                        <Icon size={20} className="text-white shrink-0" />
                        <span className="text-xs font-medium text-white truncate">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Section */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-[#1a1a1a]/60 border border-gray-800 shadow-lg overflow-hidden">
                    {renderActiveComponent()}
                  </div>
                </div>
              )}
            </div>

            {/* Live Preview */}
            {showPreview && activeTab === "storefront" && (
              <div className="w-1/2">
                <Card className="bg-[#1a1a1a] border-gray-700 p-4 sticky top-4">
                  <CardTitle className="text-white mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Live Preview
                  </CardTitle>
                  <div className="border border-gray-600 rounded-lg overflow-hidden">
                    <iframe
                      src={`/storefront/public/${user.userId}`}
                      className="w-full h-96 bg-white"
                      title="Storefront Preview"
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-2 text-center">
                    Toggle Hide/Show Preview to see latest changes
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
