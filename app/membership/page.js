"use client"

import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { RefreshCw, TrendingUp, Clock } from "lucide-react"
import { Check, Star, Crown } from "lucide-react"
import {sendEthereumPayment} from "../../lib/ethPayment"
import {getAllXRPBPrices} from '../../lib/getXRPBPrices'
import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import PaymentModal from '../components/PaymentModal'
import { useXRPL } from "../contexts/XRPLContext"
import ChainSelectModal from "../components/ChainSelectModal"
import { useMetamask } from "../contexts/MetaMaskContext"

export default function MembershipPage() {
  const [xrpbPrices, setXrpbPrices] = useState({
    solana: null,      // GeckoTerminal Solana price
    xrpl: null,        // XRPL order book price
    xrplEvm: null      // XRPL EVM DEX price
  })
  const [showChainModal, setShowChainModal] = useState(false)
const [selectedChain, setSelectedChain] = useState(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const {xrpWalletAddress} = useXRPL()
const [selectedTier, setSelectedTier] = useState(null)
const { currentChain, switchChain } = useMetamask()

  const [priceLoadingStates, setPriceLoadingStates] = useState({
    solana: true,
    xrpl: true,
    xrplEvm: true
  });
  const [currentMembership, setCurrentMembership] = useState(null)
const [loadingMembership, setLoadingMembership] = useState(true)

  const [lastPriceUpdate, setLastPriceUpdate] = useState(null);
  const { token } = useAuth()

  const [xrpbPrice, setXrpbPrice] = useState(null) // Main XRPB price
  const tokenPrices = [
    {
      id: "solana",
      name: "Solana",
      network: "SOL Network",
      price: xrpbPrices.solana,
      source: "GeckoTerminal",
      icon: "⚪", // Solana icon placeholder
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
    },
    {
      id: "xrpl",
      name: "XRPL",
      network: "XRP Ledger",
      price: xrpbPrices.xrpl,
      source: "Order Book",
      icon: "⚡", // XRPL icon placeholder
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
    },
    {
      id: "xrpl-evm",
      name: "XRPL EVM",
      network: "EVM Sidechain",
      price: xrpbPrices.xrplEvm,
      source: "DEX Pool",
      icon: "🔗", // EVM icon placeholder
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
    },
  ]

  function formatDate(dateStr) {
    if (!dateStr) return "--"
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  }
  

  const fetchCurrentMembership = async () => {
    setLoadingMembership(true)
    try {
      const res = await fetch("https://ripple-flask-server.onrender.com/membership/info", {
        headers: {
          "Authorization": `Bearer ${token}` // or wherever you store JWT
        }
      })
      const data = await res.json()
      if (res.ok) {
        setCurrentMembership(data.currentMembership)
      } else {
        console.error("Error fetching membership:", data.error)
        setCurrentMembership(null)
      }
    } catch (err) {
      console.error("Error fetching membership:", err)
      setCurrentMembership(null)
    } finally {
      setLoadingMembership(false)
    }
  }





  const membershipTiers = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "/month",
      listings: "5 listings",
      fee: "3.5%",
      icon: <Check className="w-6 h-6" />,
      color: "text-gray-400",
      bgColor: "bg-gray-500/20",
      borderColor: "border-gray-500/30",
      buttonText: "Get Started",
      buttonStyle: "bg-gray-600 hover:bg-gray-700",
      features: ["Up to 5 active listings", "Basic marketplace access", "Standard support", "3.5% transaction fee"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$25",
      period: "/month",
      listings: "Unlimited listings",
      fee: "2.5%",
      icon: <Star className="w-6 h-6" />,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30",
      buttonText: "Upgrade to Pro",
      buttonStyle: "bg-green-600 hover:bg-green-700",
      popular: true,
      features: [
        "Unlimited active listings",
        "Priority marketplace placement",
        "Advanced analytics",
        "2.5% transaction fee",
        "Priority support",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: "$50",
      period: "/month",
      listings: "Unlimited listings",
      fee: "1.5%",
      icon: <Crown className="w-6 h-6" />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30",
      buttonText: "Go Premium",
      buttonStyle: "bg-yellow-600 hover:bg-yellow-700",
      features: [
        "Unlimited active listings",
        "Featured marketplace placement",
        "Advanced analytics & insights",
        "1.5% transaction fee",
        "Dedicated storefront logins",
        "Early access to new features",
      ],
    },
  ]


  const fetchAllXRPBPrices = async () => {
    console.log('🔄 Fetching XRPB prices from all chains...');
    
    setPriceLoadingStates({
      solana: true,
      xrpl: true,
      xrplEvm: true
    });
    
    try {
      const prices = await getAllXRPBPrices();
      
      setXrpbPrices({
        solana: prices.solana || 0.0001, // Fallback price
        xrpl: prices.xrpl || 0.0001,
        xrplEvm: prices.xrplEvm || 0.0001
      });
      
      // Set main price to the first available price
      const mainPrice = prices.solana || prices.xrpl || prices.xrplEvm || 3.10;
      setXrpbPrice(mainPrice);
      setLastPriceUpdate(new Date());
      
      console.log('✅ All XRPB prices fetched:', prices);
    } catch (error) {
      console.error('❌ Error fetching XRPB prices:', error);
      // Set fallback prices
      setXrpbPrices({
        solana: 0.0001,
        xrpl: 0.0001,
        xrplEvm: 0.0001
      });
    } finally {
      setPriceLoadingStates({
        solana: false,
        xrpl: false,
        xrplEvm: false
      });
    }
  }


  function formatNumber(num) {
    if (num === null || num === undefined) return "--";
  
    const absNum = Math.abs(num);
  
    if (absNum >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, "") + "B";
    } else if (absNum >= 1_000_000) {
      return (num / 1_000_000).toFixed(2).replace(/\.00$/, "") + "M";
    } else if (absNum >= 1_000) {
      return (num / 1_000).toFixed(2).replace(/\.00$/, "") + "K";
    } else {
      return num.toString();
    }
  }
  
  

  const tokenPriceColor = (chain) => {
    switch(chain) {
      case "solana": return "text-purple-400";
      case "xrpl": return "text-blue-400";
      case "xrplEvm": return "text-orange-400";
      default: return "text-white";
    }
  };
  

  useEffect(() => {
    fetchAllXRPBPrices()
    // Set up interval to refresh prices every 30 seconds
    const interval = setInterval(fetchAllXRPBPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (token !== null) fetchCurrentMembership()
  }, [token])


  const handleRefreshPrices = async () => {
    // Simulate price refresh
    console.log("[v0] Refreshing token prices...")
    await fetchAllXRPBPrices()
  }

  return (
    <div className="min-h-screen bg-[#111111] mt-30">

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
            XRPB Membership Tiers
          </h1>

          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Affordable USD pricing, paid with <span className="text-green-400 font-semibold">XRPB tokens</span> across
            multiple chains
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-gray-400 text-lg">Select the perfect membership tier for your marketplace needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {membershipTiers.map((tier) => (
              <Card
              key={tier.id}
              className={`relative bg-gray-900/50 ${tier.borderColor} border backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300
                ${
                  currentMembership && currentMembership.tier.name.toLowerCase() === tier.id
                    ? "ring-4 ring-yellow-400/50" // highlight Pro or Premium
                    : tier.popular
                    ? "ring-2 ring-green-500/50"
                    : ""
                }
              `}
            >
                {tier.popular && !(currentMembership && currentMembership.tier.name.toLowerCase() === tier.id) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}

                {currentMembership && currentMembership.tier.name.toLowerCase() === tier.id && (
                  <Badge className="bg-yellow-500 text-white px-3 py-1 mb-2">Current Plan</Badge>
                )}


                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div
                      className={`w-16 h-16 rounded-xl ${tier.bgColor} flex items-center justify-center mx-auto mb-4`}
                    >
                      <div className={tier.color}>{tier.icon}</div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">{tier.name}</h3>

                    {currentMembership && currentMembership.tier.name.toLowerCase() === tier.id && (
                      <div className="flex flex-col items-center mb-">
                        <span className="text-sm text-gray-300">
                          Expires: {formatDate(currentMembership.membership.expiresAt)}
                        </span>
                      </div>
                    )}

                    <div className="mb-4 space-y-1">
                      {["solana", "xrpl", "xrplEvm"].map((chain) => (
                        <div key={chain} className="flex justify-center gap-2 items-baseline">
                          <span className="text-sm text-gray-400 capitalize">{chain}:</span>
                          <span className={`text-2xl font-bold ${tokenPriceColor(chain)}`}>
                            {xrpbPrices[chain]
                              ? formatNumber(parseFloat(tier?.price?.replace("$", "")) / xrpbPrices[chain])
                              : "--"}{" "}
                            XRPB
                          </span>
                        </div>
                      ))}
                    </div>

                    



                    <div className="space-y-2 mb-6">
                      <Badge variant="outline" className="text-gray-300 border-gray-600">
                        {tier.listings}
                      </Badge>
                      <Badge variant="outline" className="text-gray-300 border-gray-600 ml-2">
                        {tier.fee} fee
                      </Badge>
                      <Badge variant="outline" className="text-gray-300 border-gray-600 ml-2">
                        {tier.price} /month
                      </Badge>
                    </div>
                  </div>

                  

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${tier.buttonStyle} text-white py-3 rounded-lg font-semibold transition-colors duration-200`}
                    onClick={() => {
                      setSelectedTier(tier)
                      setShowChainModal(true)
                    }}
                    disabled={currentMembership && currentMembership.tier.name.toLowerCase() === tier.id}
                  >
                    {currentMembership?.tier?.name.toLowerCase() === tier?.id ? "Current Plan" : tier?.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Live Prices Section */}
        <div className="max-w-6xl mx-auto glass-effect">
          <Card className="bg-[#1a1a1a] border-green-500/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <h2 className="text-3xl font-bold text-white">Live XRPB Token Prices</h2>
                </div>
                <p className="text-gray-400 mb-2">Real-time prices across different blockchain networks</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    Last updated: {lastPriceUpdate ? lastPriceUpdate.toLocaleTimeString() : "--:--:--"}
                  </span>
                </div>
              </div>

              {/* Price Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {tokenPrices.map((token) => (
                  <Card
                    key={token.id}
                    className={`bg-[#101010] ${token.borderColor} glass-effect-darker border backdrop-blur-sm hover:bg-gray-100 transition-all duration-300`}
                  >
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-16 h-16 rounded-xl ${token.bgColor} flex items-center justify-center mx-auto mb-4`}
                      >
                        <span className="text-2xl">{token.icon}</span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">{token.name}</h3>
                      <Badge variant="outline" className="mb-4 text-gray-400 border-gray-600">
                        {token.source}
                      </Badge>

                      {priceLoadingStates[token.id] ? (
                        <div className="h-10 bg-gray-700 rounded mx-auto mb-2 w-1/2 animate-pulse"></div>
                      ) : (
                      <div className={`text-3xl font-bold mb-2 ${token.color}`}>
                        {Number(token.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 })}
                      </div>
                      )}

                      <p className="text-sm text-gray-400">{token.network}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Refresh Button */}
              <div className="text-center">
                <Button
                  onClick={handleRefreshPrices}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh Prices
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <ChainSelectModal
  open={showChainModal}
  onClose={() => setShowChainModal(false)}
  onSelect={(chain) => setSelectedChain(chain)}
/>

        {selectedChain && (
  <PaymentModal
    open={true}
    onClose={() => setSelectedChain(null)}
    tier={selectedTier}
    xrpWalletAddress={xrpWalletAddress}
    fetchCurrentMembership={fetchCurrentMembership}
    paymentMethod={selectedChain}
    chain={currentChain}
    switchChain={switchChain}
  />
)}

      </main>
    </div>
  )
}
