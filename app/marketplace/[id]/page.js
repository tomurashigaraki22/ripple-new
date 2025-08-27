import { notFound } from "next/navigation"
import ListingDetail from "../../components/ListingDetail"

const BASE_URL = "https://ripple-flask-server.onrender.com"

export default async function ListingPage({ params }) {
  let listing = null

  try {
    const res = await fetch(`${BASE_URL}/marketplace/listings/${params.id}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60s
    })

    if (!res.ok) {
      notFound()
    }

    const data = await res.json()
    listing = data.listing
  } catch (err) {
    console.error("Error fetching listing:", err)
    notFound()
  }

  if (!listing) {
    notFound()
  }

  return <ListingDetail listing={listing} />
}

// If you don’t have all IDs ahead of time, you can skip static params
// and fallback to dynamic rendering
export async function generateStaticParams() {
  try {
    const res = await fetch(`${BASE_URL}/marketplace/listings`)
    if (!res.ok) return []

    const data = await res.json()
    return data.listings.map((listing) => ({
      id: listing.id.toString(),
    }))
  } catch (err) {
    console.error("Error fetching listings for static params:", err)
    return []
  }
}

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${BASE_URL}/marketplace/${params.id}`)
    if (!res.ok) {
      return { title: "Listing Not Found" }
    }

    const { listing } = await res.json()

    return {
      title: `${listing.title} - RippleBids Marketplace`,
      description: listing.description,
      openGraph: {
        title: listing.title,
        description: listing.description,
        images: listing.images && listing.images.length > 0 ? [listing.images[0]] : [],
      },
    }
  } catch (err) {
    console.error("Error generating metadata:", err)
    return {
      title: "Listing Not Found",
    }
  }
}
