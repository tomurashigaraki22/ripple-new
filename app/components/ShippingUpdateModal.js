"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { X } from "lucide-react"

export function ShippingUpdateModal({ isOpen, onClose, order }) {
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippingNotes, setShippingNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[v0] Updating shipping info:", {
      orderId: order?.id,
      carrier,
      trackingNumber,
      shippingNotes,
    })

    setIsLoading(false)
    onClose()

    // Reset form
    setCarrier("")
    setTrackingNumber("")
    setShippingNotes("")
  }

  const carriers = ["FedEx", "UPS", "DHL", "USPS", "GIG Logistics", "Jumia Logistics", "Kwik Delivery", "Other"]

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Update Shipping Information</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shipping Carrier */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Carrier</label>
            <Select value={carrier} onValueChange={setCarrier} required>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select Carrier" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {carriers.map((carrierOption) => (
                  <SelectItem key={carrierOption} value={carrierOption.toLowerCase()}>
                    {carrierOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tracking Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tracking Number</label>
            <Input
              type="text"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Shipping Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Notes (Optional)</label>
            <textarea
              placeholder="Add any shipping notes..."
              value={shippingNotes}
              onChange={(e) => setShippingNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading || !carrier || !trackingNumber}
            >
              {isLoading ? "Updating..." : "Ship Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
