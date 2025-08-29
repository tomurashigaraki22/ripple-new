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
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function XRPLWalletConnect() {
  const { connectXrpWallet, xrpWalletAddress, xrpBalance, xrpbBalance, disconnectXrpWallet } = useXRPL()
  const [connecting, setConnecting] = useState(false)
  const [copied, setCopied] = useState(false);
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
  

  const handleCopy = () => {
    if (xrpWalletAddress) {
      copy(xrpWalletAddress);
      alert("Copied!");
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
          <h1 className="text-4xl font-bold text-white mb-4">Connect XRPL Wallet</h1>
          <p className="text-gray-400 text-lg">
            Connect your Xaman/XUMM wallet to manage XRP and XRPB tokens.
          </p>
        </div>
      </div>

      {/* XRPL Wallet Card */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      alt="Phantom"
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
                  disabled={metMaskConnecting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-black font-medium"
                >
                  {metMaskConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </CardContent>

            {/* Glassy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>

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
                  {/* <p className="text-gray-200 text-sm">ETH Balance: {ethBalance}</p>
                  <p className="text-gray-200 text-sm">USDT Balance: {usdtBalance}</p>
                  <Button
                    onClick={() => switchToChain("0x15f900")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium mt-4"
                  >
                    Switch To XRPL Testnet (EVM)
                  </Button> */}
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
                  disabled={connecting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  {connecting ? "Connecting..." : "Connect MetaMask"}
                </Button>
              )}
            </CardContent>

            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>

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

      {/* MetaMask Wallet Card */}
      {/* <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        </div>

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
              Your MetaMask connection is encrypted and secure. RippleBids never
              stores your private keys or seed phrases.
            </p>
          </div>
        </div>
      </div> */}

    </div>
  )
}
