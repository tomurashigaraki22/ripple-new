"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Wallet, ExternalLink } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"

const walletOptions = {
  BTC: [
    { name: "Electrum", icon: "⚡", description: "Lightweight Bitcoin wallet" },
    { name: "Exodus", icon: "🚀", description: "Multi-currency wallet" },
    { name: "Trust Wallet", icon: "🛡️", description: "Secure mobile wallet" },
  ],
  ETH: [
    { name: "MetaMask", icon: "🦊", description: "Most popular Ethereum wallet" },
    { name: "WalletConnect", icon: "🔗", description: "Connect any wallet" },
    { name: "Coinbase Wallet", icon: "🔵", description: "Self-custody wallet" },
  ],
  XRP: [
    { name: "XUMM", icon: "💎", description: "Official XRPL wallet" },
    { name: "Ledger", icon: "🔐", description: "Hardware wallet support" },
    { name: "Toast Wallet", icon: "🍞", description: "Simple XRP wallet" },
  ],
  "XRPL EVM": [
    { name: "MetaMask", icon: "🦊", description: "For XRPL EVM sidechain" },
    { name: "WalletConnect", icon: "🔗", description: "Universal connection" },
    { name: "Trust Wallet", icon: "🛡️", description: "Mobile EVM support" },
  ],
  SOLANA: [
    { name: "Phantom", icon: "👻", description: "Leading Solana wallet" },
    { name: "Solflare", icon: "☀️", description: "Full-featured wallet" },
    { name: "Sollet", icon: "🌟", description: "Web-based wallet" },
  ],
}

export default function WalletConnect() {
  const [selectedChain, setSelectedChain] = useState("ETH")
  const [connecting, setConnecting] = useState(null)

  const handleConnect = async (walletName) => {
    setConnecting(walletName)
    // Simulate connection process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log(`Connecting to ${walletName}...`)
    setConnecting(null)
    // Here you would implement actual wallet connection logic
  }

  return (
    <div className="min-h-screen p-4 md:p-8 mt-30">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/marketplace" className="inline-flex items-center text-green-400 hover:text-green-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 text-lg">Choose your preferred wallet to start trading on RippleBids</p>
        </div>

        {/* Chain Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.keys(walletOptions).map((chain) => (
            <Button
              key={chain}
              variant={selectedChain === chain ? "default" : "outline"}
              onClick={() => setSelectedChain(chain)}
              className={`${
                selectedChain === chain
                  ? "bg-green-500 hover:bg-green-600 text-black"
                  : "border-gray-600 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {chain}
            </Button>
          ))}
        </div>
      </div>

      {/* Wallet Options */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {walletOptions[selectedChain].map((wallet) => (
            <Card
              key={wallet.name}
              className="group relative overflow-hidden border-gray-700 hover:border-green-500/50 transition-all duration-300 glass-effect-dark"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{wallet.icon}</div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{wallet.name}</h3>
                      <p className="text-gray-400 text-sm">{wallet.description}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" />
                </div>

                <Button
                  onClick={() => handleConnect(wallet.name)}
                  disabled={connecting === wallet.name}
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-medium"
                >
                  {connecting === wallet.name ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4" />
                      <span>Connect</span>
                    </div>
                  )}
                </Button>
              </CardContent>

              {/* Glassy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center glass-effect-dark p-6 rounded-lg">
          <div
            className="inline-block p-6 rounded-lg border border-gray-700"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <h3 className="text-white font-semibold mb-2">Secure Connection</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Your wallet connection is encrypted and secure. RippleBids never stores your private keys or seed phrases.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
