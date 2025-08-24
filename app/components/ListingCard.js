import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import Link from "next/link"
import { Button } from "./ui/button"
import { Heart, ShoppingCart, Eye } from "lucide-react"

export function ListingCard({ listing }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  function formatCategory(category) {
    if (!category) return "";
    return category
      .split("-") // split words by dash
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
      .join("-");
  }
  

  const getTypeColor = (type) => {
    switch (type) {
      case "digital":
        return "bg-blue-500"
      case "physical":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getChainBadge = (chain) => {
    if (!chain) return null
    return (
      <Badge variant="outline" className="text-xs border-green-500 text-green-400">
        {chain}
      </Badge>
    )
  }

  return (
    <Link href={`/marketplace/${listing.id}`}>
    <Card className="bg-[#111111] glass-effect border-gray-800 hover:border-gray-700 transition-all duration-200 group">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={`${listing.images[0]}`}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />

          {/* Overlay Actions */}
          <div className="absolute inset-0 group-hover:backdrop-blur-md bg-opacity-50 group-hover:bg-opacity-80 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" className="bg-white text-black hover:bg-gray-200">
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="bg-white text-black hover:bg-gray-200">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={`${getTypeColor(listing.type)} text-white text-xs`}>{formatCategory(listing.category)}</Badge>
          </div>

          {/* Chain Badge */}
          {listing.chain && <div className="absolute top-2 right-2">{getChainBadge(listing.chain)}</div>}

          {/* Stock Indicator */}
          {listing.stock_quantity <= 5 && listing.stock_quantity > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="destructive" className="text-xs">
                Only {listing.stock_quantity} left
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{listing.description}</p>

          {/* Attributes */}
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.attributes &&
              Object.entries(listing.attributes)
                .slice(0, 2)
                .map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {key}: {value}
                  </Badge>
                ))}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-green-400 font-bold text-xl">{formatPrice(listing.price)}</span>
              {listing.shipping && (
                <p className="text-gray-500 text-xs">+ {formatPrice(listing.shipping.cost)} shipping</p>
              )}
            </div>

            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-black font-medium"
              disabled={listing.stock_quantity === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {listing.stock_quantity === 0 ? "Sold Out" : "Buy Now"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}
