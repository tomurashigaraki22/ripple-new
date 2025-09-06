"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Wallet } from "lucide-react"
import { Button } from "../components/ui/button"
import { Clipboard } from "lucide-react";
import { Card, CardContent } from "../components/ui/card"
import { useXRPL } from "../contexts/XRPLContext" // adjust path
import { useMetamask } from "../contexts/MetaMaskContext"
import copy from "copy-to-clipboard"
import { usePhantom } from "../contexts/PhantomContext"
import { useSui } from "../contexts/SuiContext"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
// Remove this import: import { ConnectButton } from "@mysten/dapp-kit"


export default function XRPLWalletConnect() {
  const { connectXrpWallet, xrpWalletAddress, xrpBalance, xrpbBalance, disconnectXrpWallet } = useXRPL()
  const [connecting, setConnecting] = useState(false)
  const [copied, setCopied] = useState(false);
  const [suiCopied, setSuiCopied] = useState(false);
  const [phantomCopied, setPhantomCopied] = useState(false);
  const {
    publicKey,
    connected,
    connecting: phantomConnecting,
    balance,
    disconnect,
  } = usePhantom();

  const handleCopyPhantom = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setPhantomCopied(true);
      setTimeout(() => setPhantomCopied(false), 2000);
    }
  };

  const {
    metamaskWalletAddress,
    ethBalance,
    usdtBalance,
    isConnected,
    connectMetamaskWallet,
    switchToChain,
    disconnectMetamaskWallet,
    connecting: metMaskConnecting,
  } = useMetamask();
  
  // Sui wallet context
  const {
    connected: suiConnected,
    connecting: suiConnecting,
    suiAddress,
    balance: suiBalance,
    connect: connectSui,
    disconnect: disconnectSui
  } = useSui();

const handleCopy = () => {
  if (xrpWalletAddress) {
    copy(xrpWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
};
  
  const handleCopySui = () => {
    if (suiAddress) {
      copy(suiAddress);
      setSuiCopied(true);
      setTimeout(() => setSuiCopied(false), 2000);
    }
  };
  
  const handleConnect = async () => {
    setConnecting(true)
    try {
      await connectXrpWallet()
    } catch (error) {
      console.error("XRPL Wallet connection failed:", error)
    } finally {
      setConnecting(false)
    }
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
          <h1 className="text-4xl font-bold text-white mb-4">Connect Wallets</h1>
          <p className="text-gray-400 text-lg">
            Connect your preferred wallet to manage your digital assets.
          </p>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* XRPL Wallet Card */}
          <Card
            className="group relative overflow-hidden border-gray-700 hover:border-blue-500/50 transition-all duration-300 glass-effect-dark"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex flex-col items-center space-x-3">
                <div className="w-12 h-12 mb-2">
                    <img
                      src="https://cdn.prod.website-files.com/614c99cf4f23700c8aa3752a/6776d776ea74135b0ecab4e9_Xaman.png"
                      alt="Xaman"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Xaman/XUMM</h3>
                    <p className="text-gray-400 text-sm">Official XRPL wallet</p>
                  </div>
                </div>
              </div>

              {xrpWalletAddress ? (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-gray-200 text-sm">
      <p className="truncate overflow-hidden whitespace-nowrap">
        Connected: {xrpWalletAddress}
      </p>
      <button
        onClick={handleCopy}
        className="p-1 rounded hover:bg-gray-700 transition-colors"
        title="Copy address"
      >
        <Clipboard className={`w-4 h-4 ${copied ? "text-blue-400" : "text-gray-400"}`} />
      </button>
      {copied && <span className="text-blue-400 text-xs">Copied!</span>}
    </div>
                  <p className="text-gray-200 text-sm">XRP Balance: {xrpBalance}</p>
                  <p className="text-gray-200 text-sm">XRPB Balance: {xrpbBalance}</p>
                  <Button
                    onClick={disconnectXrpWallet}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium mt-4"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-black font-medium"
                >
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </CardContent>

            {/* Glassy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>

          {/* MetaMask Wallet Card */}
          <Card
            className="group relative overflow-hidden border-gray-700 hover:border-orange-500/50 transition-all duration-300 glass-effect-dark"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex flex-col items-center space-x-3">
                  <div className="w-12 h-12 mb-2">
                    <img
                      src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/metamask-icon.png"
                      alt="MetaMask"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-lg">MetaMask Wallet</h3>
                    <p className="text-gray-400 text-sm">Official Ethereum wallet</p>
                  </div>
                </div>
              </div>

              {isConnected && metamaskWalletAddress ? (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-gray-200 text-sm">
                    <p className="truncate overflow-hidden whitespace-nowrap">
                      Connected: {metamaskWalletAddress}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                      title="Copy address"
                    >
                      <Clipboard
                        className={`w-4 h-4 ${
                          copied ? "text-green-400" : "text-gray-400"
                        }`}
                      />
                    </button>
                    {copied && (
                      <span className="text-green-400 text-xs">Copied!</span>
                    )}
                  </div>
                  <Button
                    onClick={disconnectMetamaskWallet}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium mt-4"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectMetamaskWallet}
                  disabled={metMaskConnecting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  {metMaskConnecting ? "Connecting..." : "Connect MetaMask"}
                </Button>
              )}
            </CardContent>

            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>

          {/* Phantom Wallet Card */}
          <Card
            className="group relative overflow-hidden border-gray-700 hover:border-purple-500/50 transition-all duration-300 glass-effect-dark"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex flex-col items-center space-x-3">
                  <div className="w-12 h-12 mb-2">
                    <img
                      src="https://play-lh.googleusercontent.com/obRvW02OTYLzJuvic1ZbVDVXLXzI0Vt_JGOjlxZ92XMdBF_i3kqU92u9SgHvJ5pySdM"
                      alt="Phantom"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-lg">Phantom Wallet</h3>
                    <p className="text-gray-400 text-sm">Official Solana wallet</p>
                  </div>
                </div>
              </div>

              <div className='flex flex-col items-center justify-center space-y-4'>
                <div className="wallet-adapter-button-trigger-wrapper">
                  <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !border-0 !rounded-xl !font-medium !px-8 !py-3 hover:!shadow-lg hover:!shadow-purple-500/25 !transition-all !duration-300" />
                </div>
                </div>
            </CardContent>

            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>

          {/* Sui Wallet Card */}
          <Card
            className="group relative overflow-hidden border-gray-700 hover:border-cyan-500/50 transition-all duration-300 glass-effect-dark"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex flex-col items-center space-x-3">
                  <div className="w-12 h-12 mb-2">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiWm1KZXfEwz-MXrPsoAMqH88zDDKO96VB7Q&s"
                      alt="Sui"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-lg">Sui Wallet</h3>
                    <p className="text-gray-400 text-sm">Official Sui wallet</p>
                  </div>
                </div>
              </div>

              {/* In the Sui Wallet Card section, replace the ConnectButton with: */}
              {suiConnected && suiAddress ? (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-gray-200 text-sm">
                    <p className="truncate overflow-hidden whitespace-nowrap">
                      Connected: {suiAddress}
                    </p>
                    <button
                      onClick={handleCopySui}
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                      title="Copy address"
                    >
                      <Clipboard
                        className={`w-4 h-4 ${
                          suiCopied ? "text-cyan-400" : "text-gray-400"
                        }`}
                      />
                    </button>
                    {suiCopied && (
                      <span className="text-cyan-400 text-xs">Copied!</span>
                    )}
                  </div>
                  <p className="text-gray-200 text-sm">SUI Balance: {suiBalance?.toFixed(4) || '0'}</p>
                  <Button
                    onClick={disconnectSui}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium mt-4"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Button
                    onClick={connectSui}
                    disabled={suiConnecting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 border-0 rounded-xl font-medium px-8 py-3 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 text-white"
                  >
                    {suiConnecting ? "Connecting..." : "Connect Sui Wallet"}
                  </Button>
                </div>
              )}
            </CardContent>

            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>

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
              Your wallet connections are encrypted and secure. RippleBids never stores your private keys or seed phrases.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}