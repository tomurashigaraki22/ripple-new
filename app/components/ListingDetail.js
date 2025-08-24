"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, Clock } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"

export default function ListingDetail({ listing }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  function formatCategory(category) {
    if (!category) return "";
    return category
      .split("-") // split words by dash
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
      .join("-");
  }
  

  if (!listing) return null

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white mt-30">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={listing.images[selectedImageIndex] || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            {listing.images.length > 1 && (
              <div className="flex gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? "border-green-500" : "border-gray-700"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                  {formatCategory(listing.category)}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  {listing.subcategory}
                </Badge>
                {listing.condition && (
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    {listing.condition}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <p className="text-gray-400 text-lg">{listing.description}</p>
            </div>

            {/* Price and Stock */}
            <div className="space-y-4">
              <div className="text-4xl font-bold text-green-500">{formatPrice(listing.price)}</div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Listed {formatDate(listing.created_at)}
                </div>
                {listing.stock_quantity > 0 && <div className="text-green-400">{listing.stock_quantity} in stock</div>}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              {listing.type === "physical" && listing.stock_quantity > 1 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-400">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white"
                  >
                    {[...Array(Math.min(listing.stock_quantity, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                 Buy Item
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-600 text-gray-400 hover:bg-gray-800 bg-transparent"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-600 text-gray-400 hover:bg-gray-800 bg-transparent"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            {listing.shipping && (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Shipping Information</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div>Cost: {formatPrice(listing.shipping.cost)}</div>
                    <div>
                      Available: {listing.shipping.worldwide ? "Worldwide" : listing.shipping.regions?.join(", ")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blockchain Info for NFTs */}
            {listing.type === "digital" && listing.chain && (
              <Card className="glass-effect-darker shadow-lg border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Blockchain Details</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div>Chain: {listing.chain}</div>
                    {listing.creator && <div>Creator: {listing.creator}</div>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attributes */}
            {listing.attributes && (
              <Card className="glass-effect-darker shadow-lg border-gray-700">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(listing.attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{key.replace("_", " ")}:</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specs for Electronics */}
            {listing.specs && (
              <Card className="glass-effect-darker shadow-lg border-gray-700">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Technical Specifications</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(listing.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400 uppercase">{key}:</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
