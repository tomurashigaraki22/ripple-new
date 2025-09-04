"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, X, Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import StorefrontSidebar from "../../../components/StoreFrontSidebar"
import { useRouter } from "next/navigation"

export default function AddListingPage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    price_usd: "",
    stock_quantity: 1,
    condition: "",
    description: "",
    type: "physical",
    chain: "XRP Ledger",
    listingType: "buy_now",
    auction_duration: 7,
    starting_bid: "",
    tags: "",
    images: [],
    variations: [],
    attributes: {},
    shipping: {
      worldwide: true,
      cost: 0,
    },
    // Add shipping address for physical items
    shippingAddress: {
      country: "",
      state: "",
      city: "",
      zipCode: "",
      street: "",
      phone: "",
    },
  })

  const [toggleSections, setToggleSections] = useState({
    brandInfo: false,
    modelInfo: false,
    colorSpec: false,
    sizeInfo: false,
    materialInfo: false,
    yearInfo: false,
    productIds: false,
    keyFeatures: false,
  })

  const [uploadedImages, setUploadedImages] = useState([])
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  // Add state for shipping address dropdowns
  const [availableCountries, setAvailableCountries] = useState([])
  const [availableStates, setAvailableStates] = useState([])
  const [availableCities, setAvailableCities] = useState([])
  const [availableZipCodes, setAvailableZipCodes] = useState([])
  
  // Add loading states
  const [loadingStates, setLoadingStates] = useState({
    countries: false,
    states: false,
    cities: false,
    zipCodes: false
  })

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/shipengine/countries')
        const data = await response.json()
        setAvailableCountries(data.countries || [])
      } catch (error) {
        console.error('Error fetching countries:', error)
      }
    }
    fetchCountries()
  }, [])

  // Handle country change with loading
  const handleCountryChange = async (countryCode) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        country: countryCode,
        state: '',
        city: '',
        zipCode: ''
      }
    }))

    // Reset dependent dropdowns
    setAvailableStates([])
    setAvailableCities([])
    setAvailableZipCodes([])

    if (countryCode) {
      setLoadingStates(prev => ({ ...prev, states: true }))
      try {
        const response = await fetch(`/api/shipengine/countries?country=${countryCode}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Fetched states:', data.states)
        
        // Transform states - if it's an object, convert to array with proper keys
        let statesArray = []
        if (Array.isArray(data.states)) {
          statesArray = data.states
        } else if (data.states && typeof data.states === 'object') {
          statesArray = Object.entries(data.states).map(([code, name]) => ({
            code: code,
            name: name
          }))
        }
        
        console.log('Transformed states:', statesArray)
        setAvailableStates(statesArray)
      } catch (error) {
        console.error('Error fetching states:', error)
        setAvailableStates([]) // Ensure it's always an array on error
      } finally {
        setLoadingStates(prev => ({ ...prev, states: false }))
      }
    }
  }

  // Handle state change with loading
  const handleStateChange = async (stateCode) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        state: stateCode,
        city: '',
        zipCode: ''
      }
    }))

    // Reset dependent dropdowns
    setAvailableCities([])
    setAvailableZipCodes([])

    if (stateCode && formData.shippingAddress.country) {
      setLoadingStates(prev => ({ ...prev, cities: true }))
      try {
        const response = await fetch(`/api/shipengine/countries?country=${formData.shippingAddress.country}&state=${stateCode}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Fetched cities:', data.cities)
        
        // Handle cities - they might be an array or object
        let citiesArray = []
        if (Array.isArray(data.cities)) {
          citiesArray = data.cities
        } else if (data.cities && typeof data.cities === 'object') {
          // If cities come as object, transform them to array with unique keys
          citiesArray = Object.entries(data.cities).map(([code, name]) => ({
            code: code,
            name: name
          }))
        }
        
        console.log('Transformed cities:', citiesArray)
        setAvailableCities(citiesArray)
      } catch (error) {
        console.error('Error fetching cities:', error)
        setAvailableCities([]) // Ensure it's always an array on error
      } finally {
        setLoadingStates(prev => ({ ...prev, cities: false }))
      }
    }
  }

  // Handle city change with loading
  const handleCityChange = async (cityName) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        city: cityName,
        zipCode: ''
      }
    }))

    // Reset zip codes
    setAvailableZipCodes([])

    if (cityName && formData.shippingAddress.country && formData.shippingAddress.state) {
      setLoadingStates(prev => ({ ...prev, zipCodes: true }))
      try {
        const response = await fetch(`/api/shipengine/countries?country=${formData.shippingAddress.country}&state=${formData.shippingAddress.state}&city=${cityName}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Fetched zip codes:', data.zipCodes)
        
        // Transform zip codes - if it's an object, convert to array with proper keys
        let zipCodesArray = []
        if (Array.isArray(data.zipCodes)) {
          zipCodesArray = data.zipCodes
        } else if (data.zipCodes && typeof data.zipCodes === 'object') {
          zipCodesArray = Object.entries(data.zipCodes).map(([code, name]) => ({
            code: code,
            name: name
          }))
        }
        
        console.log('Transformed zip codes:', zipCodesArray)
        setAvailableZipCodes(zipCodesArray)
      } catch (error) {
        console.error('Error fetching zip codes:', error)
        setAvailableZipCodes([]) // Ensure it's always an array on error
      } finally {
        setLoadingStates(prev => ({ ...prev, zipCodes: false }))
      }
    }
  }

  // Handle zip code change
  const handleZipCodeChange = (zipCode) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        zipCode: zipCode
      }
    }))
  }




  const categories = { NFT: ["Art","Mythical","Gaming","Music","Collectibles","Avatars","Virtual Land","Sports","Memes"], Physical: ["Electronics","Fashion","Jewelry","Collectibles","Art","Beauty","Food & Drink","Accessories","Toys","Furniture","Books","Home & Garden"], Digital: ["Art","Music","Software","Wellness","Education","Templates","Ebooks","Courses","3D Models","Photos","Fonts","Design Assets"] };


  const conditions = [
    "New - Brand new, never used",
    "Like New - Minimal wear, excellent condition",
    "Good - Some wear, fully functional",
    "Fair - Noticeable wear, works properly",
    "Vintage - Collectible condition",
  ]

  const blockchains = [
    { label: "XRP Ledger", value: "xrp" },
    { label: "XRPL EVM", value: "evm" },
    { label: "Solana", value: "solana" }
  ];
  
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
  
    setIsUploading(true);
    const uploaded = [];
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
  
      try {
        // Upload to Cloudinary using signed upload
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = "ripple-marketplace/listings";
        const params = {
          timestamp,
          folder,
          public_id: `listing_${timestamp}_${Math.random().toString(36).substring(7)}`,
        };
  
        const signatureRes = await fetch("https://ripple-flask-server.onrender.com/cloudinary/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        const { signature, api_key } = await signatureRes.json();
  
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", api_key);
        form.append("timestamp", timestamp);
        form.append("signature", signature);
        form.append("folder", folder);
        form.append("public_id", params.public_id);
  
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: form }
        );
  
        const data = await uploadRes.json();
        uploaded.push({ id: Date.now() + Math.random(), url: data.secure_url, publicId: data.public_id, name: file.name });
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        alert(`Failed to upload image ${file.name}`);
      }
    }
  
    setUploadedImages((prev) => [...prev, ...uploaded]);
    setIsUploading(false);
  };
  

  const removeImage = (imageId) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  }
  

  const addVariation = () => {
    const newVariation = {
      id: Date.now(),
      name: "",
      price_modifier: 1,
      stock: 0,
    }
    setFormData((prev) => ({
      ...prev,
      variations: [...prev.variations, newVariation],
    }))
  }

  const updateVariation = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    }))
  }

  const removeVariation = (id) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.filter((v) => v.id !== id),
    }))
  }

  const toggleSection = (section) => {
    setToggleSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleShippingAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const payload = {
        ...formData,
        images: uploadedImages.map((img) => img.url),
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        isPhysical: formData.type === "physical" ? 1 : 0,
        is_auction: formData.listingType === "auction",
        starting_bid: formData.listingType === "auction" ? formData.starting_bid : undefined,
        auction_end_date:
          formData.listingType === "auction"
            ? new Date(Date.now() + formData.auction_duration * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
        price: formData.price_usd,
        shipping: { ...formData.shipping },
        variations: [...formData.variations],
        attributes: { ...formData.attributes },
        // Include shipping address for physical items
        address: formData.type === "physical" ? {
          street: formData.shippingAddress.street,
          city: formData.shippingAddress.city,
          state: formData.shippingAddress.state,
          zipCode: formData.shippingAddress.zipCode,
          country: formData.shippingAddress.country,
          phone: formData.shippingAddress.phone
        } : undefined,
      };
  
      const token = localStorage.getItem("token");
      const res = await fetch("https://ripple-flask-server.onrender.com/storefront/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create listing");
  
      alert("Listing created successfully!");
      router.push("/storefront/listings");
    } catch (err) {
      console.error("Listing creation error:", err);
      alert(err.message || "An error occurred while creating the listing");
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <StorefrontSidebar />

      <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 mt-30 md:mt-30">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/storefront/listings" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Listings
            </Link>
            <h1 className="text-3xl font-bold text-white">Create New Listing</h1>
            <p className="text-gray-400 mt-2">Add a comprehensive listing to your storefront</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter listing title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="bg-[#1a1a1a] border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-gray-700">
                        {Object.keys(categories).map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-white hover:bg-gray-700">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
  <label className="block text-sm font-medium text-white mb-2">
    Subcategory <span className="text-red-500">*</span>
  </label>
  <Select
    value={formData.subcategory}
    onValueChange={(value) => handleInputChange("subcategory", value)}
    disabled={!formData.category}
  >
    <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
      <SelectValue placeholder={formData.category ? "Select a subcategory" : "Select a category first"} />
    </SelectTrigger>
    <SelectContent className="bg-[#1a1a1a] border-gray-700">
      {formData.category &&
        categories[formData.category].map((sub) => (
          <SelectItem key={sub} value={sub} className="text-white hover:bg-gray-700">
            {sub}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
</div>


                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price_usd}
                        onChange={(e) => handleInputChange("price_usd", e.target.value)}
                        className="bg-[#1a1a1a] border-gray-700 text-white pl-8"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.stock_quantity}
                      onChange={(e) => handleInputChange("stock_quantity", Number.parseInt(e.target.value))}
                      className="bg-[#1a1a1a] border-gray-700 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Low Stock Alert</label>
                    <Input type="number" min="0" placeholder="5" className="bg-[#1a1a1a] border-gray-700 text-white" />
                    <p className="text-sm text-gray-400 mt-1">Get notified when stock falls below this number</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                      <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-gray-700">
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition} className="text-white hover:bg-gray-700">
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe your item in detail"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full h-32 px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            {/* Images */}
            <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader>
                <CardTitle className="text-white">Images</CardTitle>
            </CardHeader>
            <CardContent>
                <label className="block border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer w-full">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">Click or tap to upload images</p>
                <p className="text-gray-400 text-sm">PNG, JPG, GIF up to 10MB each</p>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                />
                </label>

                {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                    {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                        <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                        <X className="w-4 h-4" />
                        </button>
                    </div>
                    ))}
                </div>
                )}
            </CardContent>
            </Card>


            {/* Item Details */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Item Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="digital"
                        checked={formData.type === "digital"}
                        onChange={(e) => handleInputChange("type", e.target.value)}
                        className="mr-2 text-green-500"
                      />
                      <span className="text-white">Digital</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="physical"
                        checked={formData.type === "physical"}
                        onChange={(e) => handleInputChange("type", e.target.value)}
                        className="mr-2 text-green-500"
                      />
                      <span className="text-white">Physical</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Blockchain <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.chain} onValueChange={(value) => handleInputChange("chain", value)}>
                    <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-gray-700">
                      {blockchains.map((chain) => (
                        <SelectItem key={chain.value} value={chain.value} className="text-white hover:bg-gray-700">
                          {chain.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggleable Sections */}
                {/* Toggleable Sections */}
                {Object.entries({
                  brandInfo: "Brand Information",
                  modelInfo: "Model Information",
                  colorSpec: "Color Specification",
                  sizeInfo: "Size Information",
                  materialInfo: "Material Information",
                  yearInfo: "Year Information",
                  productIds: "Product Identifiers",
                  keyFeatures: "Key Features",
                }).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-white">{label}</span>
                      <button
                        type="button"
                        onClick={() => toggleSection(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          toggleSections[key] ? "bg-green-500" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            toggleSections[key] ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Render input when toggle is on */}
                    {toggleSections[key] && (
                      <Input
                        placeholder={`Enter ${label}`}
                        value={formData.attributes[key] || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            attributes: { ...prev.attributes, [key]: e.target.value },
                          }))
                        }
                        className="bg-[#1a1a1a] border-gray-700 text-white"
                      />
                    )}
                  </div>
                ))}

              </CardContent>
            </Card>

            {formData.type === "physical" && (
              <Card className="bg-[#1a1a1a] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Shipping From Address</CardTitle>
                  <p className="text-gray-400 text-sm">Enter the address where this item will be shipped from</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.shippingAddress.country} 
                  onValueChange={handleCountryChange}
                  disabled={loadingStates.countries}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
                    <SelectValue placeholder="Select country" />
                    {loadingStates.countries && <Loader2 className="h-4 w-4 animate-spin" />}
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-gray-700">
                    {Array.isArray(availableCountries) && availableCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code} className="text-white hover:bg-gray-700">
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.shippingAddress.country && (
                  <p className="text-xs text-gray-400 mt-1">
                    Next: Select a state/province to see available cities
                  </p>
                )}
              </div>

                    {/* State/Province Selection */}
              {formData.shippingAddress.country && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.shippingAddress.state} 
                    onValueChange={handleStateChange}
                    disabled={loadingStates.states}
                  >
                    <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
                      <SelectValue placeholder={loadingStates.states ? "Loading states..." : "Select state/province"} />
                      {loadingStates.states && <Loader2 className="h-4 w-4 animate-spin" />}
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-gray-700">
                      {Array.isArray(availableStates) && availableStates.map((state) => (
                      <SelectItem key={state.code || state} value={state.code || state} className="text-white hover:bg-gray-700">
                        {state.name || state}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                  {loadingStates.states && (
                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading states...
                    </p>
                  )}
                  {!loadingStates.states && availableStates.length === 0 && formData.shippingAddress.country && (
                    <p className="text-xs text-yellow-400 mt-1">
                      No states available for selected country
                    </p>
                  )}
                  {formData.shippingAddress.state && (
                    <p className="text-xs text-gray-400 mt-1">
                      Next: Select a city to see available ZIP codes
                    </p>
                  )}
                </div>
              )}

                    {/* City Selection */}
              {formData.shippingAddress.state && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.shippingAddress.city} 
                    onValueChange={handleCityChange}
                    disabled={loadingStates.cities}
                  >
                    <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
                      <SelectValue placeholder={loadingStates.cities ? "Loading cities..." : "Select city"} />
                      {loadingStates.cities && <Loader2 className="h-4 w-4 animate-spin" />}
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-gray-700">
                      {Array.isArray(availableCities) && availableCities.map((city) => (
                        <SelectItem key={city.code || city} value={city.name || city} className="text-white hover:bg-gray-700">
                          {city.name || city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingStates.cities && (
                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading cities...
                    </p>
                  )}
                  {!loadingStates.cities && availableCities.length === 0 && formData.shippingAddress.state && (
                    <p className="text-xs text-yellow-400 mt-1">
                      No cities available for selected state
                    </p>
                  )}
                </div>
              )}

                    {/* ZIP/Postal Code Selection */}
              {formData.shippingAddress.city && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    ZIP/Postal Code <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.shippingAddress.zipCode} 
                    onValueChange={handleZipCodeChange}
                    disabled={loadingStates.zipCodes}
                  >
                    <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
                      <SelectValue placeholder={loadingStates.zipCodes ? "Loading ZIP codes..." : "Select ZIP/Postal code"} />
                      {loadingStates.zipCodes && <Loader2 className="h-4 w-4 animate-spin" />}
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-gray-700">
                      {Array.isArray(availableZipCodes) && availableZipCodes.map((zipCode) => (
                        <SelectItem key={zipCode.code || zipCode} value={zipCode.name || zipCode} className="text-white hover:bg-gray-700">
                          {zipCode.name || zipCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingStates.zipCodes && (
                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading ZIP codes...
                    </p>
                  )}
                  {!loadingStates.zipCodes && availableZipCodes.length === 0 && formData.shippingAddress.city && (
                    <p className="text-xs text-yellow-400 mt-1">
                      No ZIP codes available for selected city
                    </p>
                  )}
                </div>
              )}

                    {/* Street Address */}
                    {formData.shippingAddress.zipCode && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white mb-2">
                          Street Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="Enter street address"
                          value={formData.shippingAddress.street}
                          onChange={(e) => handleShippingAddressChange("street", e.target.value)}
                          className="bg-[#1a1a1a] border-gray-700 text-white"
                          required
                        />
                      </div>
                    )}

                    {/* Phone Number */}
                    {formData.shippingAddress.street && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="Enter phone number"
                          value={formData.shippingAddress.phone}
                          onChange={(e) => handleShippingAddressChange("phone", e.target.value)}
                          className="bg-[#1a1a1a] border-gray-700 text-white"
                          required
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Product Variations */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Product Variations
                  <Button type="button" onClick={addVariation} className="bg-green-500 hover:bg-green-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variation
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.variations.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No variations added yet</p>
                ) : (
                  <div className="space-y-4">
                    {formData.variations.map((variation) => (
                      <div key={variation.id} className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-white mb-2">Variation Name</label>
                          <Input
                            placeholder="e.g., Golden Edition, Large Size"
                            value={variation.name}
                            onChange={(e) => updateVariation(variation.id, "name", e.target.value)}
                            className="bg-[#1a1a1a] border-gray-700 text-white"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-sm font-medium text-white mb-2">Price Modifier</label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="1.0"
                            value={variation.price_modifier}
                            onChange={(e) =>
                              updateVariation(variation.id, "price_modifier", Number.parseFloat(e.target.value))
                            }
                            className="bg-[#1a1a1a] border-gray-700 text-white"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-sm font-medium text-white mb-2">Stock</label>
                          <Input
                            type="number"
                            min="0"
                            value={variation.stock}
                            onChange={(e) => updateVariation(variation.id, "stock", Number.parseInt(e.target.value))}
                            className="bg-[#1a1a1a] border-gray-700 text-white"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeVariation(variation.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags & Keywords */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Tags & Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tags</label>
                  <Input
                    placeholder="Enter tags separated by commas (e.g. vintage, rare, collectible)"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    className="bg-white border-gray-700 text-black"
                  />
                  <p className="text-gray-400 text-sm mt-1">Add relevant keywords to help buyers find your listing</p>
                </div>
              </CardContent>
            </Card>

            {/* Listing Type */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Listing Type</CardTitle>
                <p className="text-gray-400">How would you like to sell this item?</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.listingType === "buy_now"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    onClick={() => handleInputChange("listingType", "buy_now")}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="listingType"
                        value="buy_now"
                        checked={formData.listingType === "buy_now"}
                        onChange={(e) => handleInputChange("listingType", e.target.value)}
                        className="mr-3 text-blue-500"
                      />
                      <span className="text-white font-medium">Buy Now</span>
                    </div>
                    <p className="text-gray-400 text-sm">Sell at a fixed price</p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.listingType === "auction"
                        ? "border-green-500 bg-green-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    onClick={() => handleInputChange("listingType", "auction")}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="listingType"
                        value="auction"
                        checked={formData.listingType === "auction"}
                        onChange={(e) => handleInputChange("listingType", e.target.value)}
                        className="mr-3 text-green-500"
                      />
                      <span className="text-white font-medium">Auction</span>
                    </div>
                    <p className="text-gray-400 text-sm">Let buyers bid on your item</p>
                  </div>
                </div>

                {formData.listingType === "auction" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Starting Bid (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.01"
                          value={formData.starting_bid}
                          onChange={(e) => handleInputChange("starting_bid", e.target.value)}
                          className="bg-[#1a1a1a] border-gray-700 text-white pl-8"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Auction Duration (Days)</label>
                      <Select
                        value={formData.auction_duration.toString()}
                        onValueChange={(value) => handleInputChange("auction_duration", Number.parseInt(value))}
                      >
                        <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700">
                          {[1, 3, 5, 7, 10, 14].map((days) => (
                            <SelectItem key={days} value={days.toString()} className="text-white hover:bg-gray-700">
                              {days} {days === 1 ? "day" : "days"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-[#1a1a1a] bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                Create Listing
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

}