"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, Clock, CreditCard, DollarSign } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import PaymentProcessingModal from "./PaymentProcessingModal"
import { useMetamask } from "../contexts/MetaMaskContext"
import { useXRPL } from "../contexts/XRPLContext"
import { useAuth } from "../contexts/AuthContext"
import { usePhantom } from "../contexts/PhantomContext"
import { ethers } from "ethers"
import { sendEthereumPayment } from "../../lib/ethPayment"
import { sendXRPLXRPBPayment } from "../../lib/productPaymentHelper"
import { getAllXRPBPrices } from "../../lib/getXRPBPrices"
import { sendSolanaPayment } from "../../lib/solPayment"

export default function ListingDetail({ listing }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [xrpbPrice, setXrpbPrice] = useState(null)
  const [validationError, setValidationError] = useState("");

  const [orderProcessing, setOrderProcessing] = useState(false)
  const [solPrice, setsolPrice] = useState(null)
  const [ethPrice, setEthPrice] = useState(null)

  const { user } = useAuth()
  const [priceLoadingStates, setPriceLoadingStates]= useState({
    solana: false,
    xrpl: false,
    xrplEvm: false
  })
  const [xrpbPrices, setXrpbPrices] = useState({
    solana: null,
    xrpl: null,
    xrplEvm: null
  })
  const [showShippingForm, setshowShippingForm] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [modalStatus, setModalStatus] = useState(null) // "processing" | "success" | "failed"
  const [modalError, setModalError] = useState("")
  const [paymentResult, setPaymentResult] = useState(null)
  const {
    metamaskWalletAddress: address,
    evmWallet,
    connecting: isConnecting,
    currentChain: chain,
    connectMetamaskWallet,
    isXRPLEVM,
    switchChain,
    isConnected,
    getSigner
  } = useMetamask()
  const {
    publicKey,
    connected,
    connection,
    connecting: phantomConnecting,
    balance,
    disconnect,
    sendTransaction
  } = usePhantom();
  const {
    xrpWalletAddress,
    xrplWallet,
    xrpBalance,
    xrpbBalance,
    connectXrpWallet,
    disconnectXrpWallet,
  } = useXRPL()


  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const prices = await getAllXRPBPrices()
        setXrpbPrices({
          solana: prices.solana || null,
          xrpl: prices.xrpl || null,
          xrplEvm: prices.xrplEvm || null
        })
        // fetch ETH/USD from Coingecko
        const ethResp = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
        const ethData = await ethResp.json()
        setEthPrice(ethData.ethereum.usd)
      } catch (err) {
        console.error(err)
      }
    }
    const fetchSolanaPriceUSD = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/solana?tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setsolPrice(json.market_data.current_price.usd)
        return json.market_data.current_price.usd;
      } catch (err) {
        console.error("❌ Failed to fetch SOL price:", err);
        return null;
      }
    };
    fetchPrices()
    fetchSolanaPriceUSD()
  }, [])
  

  
  // derive this AFTER destructuring
  
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  function formatCategory(category) {
    if (!category) return "";
    return category
      .split("-") // split words by dash
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
      .join("-");
  }

  // useEffect(() => {
  //   if (!listing) return
  //   console.log("Listing: ", listing)
  // }, [listing])

  const handleShippingSubmit = async () => {
    // ✅ Step 1: Local validation
    const requiredFields = ['address', 'city', 'state', 'zipCode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field]?.trim());
  
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
  
    try {
      // ✅ Step 2: Call ShipEngine API for validation
      const baseUrl = process.env.NEXT_PUBLIC_API_URL; // must end with /v1
      const response = await fetch(`${baseUrl}/addresses/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API-Key": process.env.NEXT_PUBLIC_SHIPSTATION_API_KEY_TEST,
        },
        body: JSON.stringify([
          {
            address_line1: shippingInfo.address,
            city_locality: shippingInfo.city,
            state_province: shippingInfo.state,
            postal_code: shippingInfo.zipCode,
            country_code: shippingInfo.country,
          },
        ]),
      });

      if (validationResult.status !== "verified") {
        setValidationError("Address could not be verified. Please check your details.");
        return;
      }
      

      
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to validate address");
      }
  
      const [validationResult] = data;
  
      if (validationResult.status === "verified" || validationResult.status === "unverified") {
        // ✅ ShipEngine may suggest corrections
        const suggested = validationResult.matched_address || validationResult.normalized_address;
  
        if (suggested) {
          // Update form fields with validated/corrected values
          setShippingInfo(prev => ({
            ...prev,
            address: suggested.address_line1 || prev.address,
            city: suggested.city_locality || prev.city,
            state: suggested.state_province || prev.state,
            zipCode: suggested.postal_code || prev.zipCode,
            country: suggested.country_code || prev.country,
          }));
        }
  
        // If fully verified → proceed
        if (validationResult.status === "verified") {
          setshowShippingForm(false);
          setShowPaymentModal(true);
        } 
      } else {
        alert("Invalid address. Please double-check your details.");
      }
    } catch (err) {
      console.error("Validation Error:", err);
      alert("Something went wrong while validating the address. Please try again.");
    }
  };
  

  // Build available payment options dynamically

  
  const handleBuyNow = async () => {
    if (listing.is_physical) {
      setshowShippingForm(true)
    } else {
      setShowPaymentModal(true)
    }
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

  // Returns the XRPB amount needed for a listing depending on the chain
// Fetch Solana price from CoinGecko


const getPaymentAmount = (usdPrice, chainType) => {
  if (!usdPrice || isNaN(usdPrice) || usdPrice <= 0) return 0;

  let rate = 0;

  switch (chainType) {
    case "solana": {
      // Fetch live SOL price from CoinGecko
      rate = solPrice
      break;
    }
    case "xrpb-sol":
      rate = xrpbPrices.solana;
      break;
    case "xrpl":
      rate = xrpbPrices.xrpl;
      break;
    case "evm":
    case "xrpl_evm":
      rate = xrpbPrices.xrplEvm;
      break;
    case "ethereum":
      rate = ethPrice;
      break;
    default:
      console.warn(`Unsupported chain type: ${chainType}`);
      rate = 1;
  }

  return usdPrice / rate;
};


  const handlePaymentConfirm = async () => {
    if (!user) {
      alert('Please log in to continue')
      router.push('/login?redirect=/marketplace')
      return
    }
  
    if (!selectedPaymentMethod) {
      alert('Please select a payment method!')
      return
    }

    setOrderProcessing(true)
    setModalStatus("processing")
    setModalError("")
    setPaymentResult({ message: "Initializing payment..." })

    try {
      const primaryWallet = selectedPaymentMethod
      const chainType = primaryWallet.type === 'xrpl_evm' ? 'evm' : primaryWallet.type
      let amount
      try {
        const listingPrice = parseFloat(listing.price)
        if (!listingPrice || listingPrice <= 0 || isNaN(listingPrice)) throw new Error('Invalid listing price')
        amount = getPaymentAmount(listingPrice, chainType)
      } catch (error) {
        throw new Error(`Payment calculation error: ${error.message}`)
      }

      let walletForPayment
      if (chainType === 'xrpl') walletForPayment = xrplWallet
      else if (chainType === 'evm') walletForPayment = getSigner
      else if (chainType === 'ethereum') walletForPayment = getSigner
      else if (chainType === 'solana' || chainType === 'xrpb-sol') {
        // ✅ From Phantom / Solana context
        walletForPayment = { connection, publicKey, connected, sendTransaction };
      }
      else throw new Error(`Unsupported chain type: ${chainType}`)

      setPaymentResult({ message: "Sending payment..." })

      let paymentResp
      const mappedChain = chainType === 'evm' ? 'xrpl_evm' : 'xrpl'

      if (chainType === 'xrpl') {
        paymentResp = await sendXRPLXRPBPayment({account: xrpWalletAddress}, process.env.NEXT_PUBLIC_ESCROW_XRPL_WALLET, amount, "5852504200000000000000000000000000000000",
        "rsEaYfqdZKNbD3SK55xzcjPm3nDrMj4aUT")
      } else if (chainType === 'xrpl_evm' || chainType === "evm") {

        const NETWORK_CONFIG = {
          "xrpl-evm-mainnet": {
            explorerBase: "https://explorer.xrplevm.org/tx/",
            tokenAddress: "0x6d8630D167458b337A2c8b6242c354d2f4f75D96",
            chainId: 1440000, // 👈 XRPL-EVM mainnet chainId (example, update with real)
          },
          "xrpl-evm-testnet": {
            explorerBase: "https://explorer.testnet.xrplevm.org/tx/",
            tokenAddress: "0x2557C801144b11503BB524C5503AcCd48E5F54fE",
            chainId: 1449000, // 👈 XRPL-EVM testnet chainId (example, update with real)
          },
        };

        const { explorerBase, tokenAddress, chainId } = NETWORK_CONFIG['xrpl-evm-mainnet']
          // ✅ If current chain doesn’t match → switch it
        if (chain?.id !== chainId) {
          await switchChain({ chainId });
          throw new Error(`Switched to correct chain with id: ${chainId}. Please retry payment from ${chain?.id}.`);
        }
        
        const signer = await getSigner()
        const address = await signer.getAddress()

        const ERC20_ABI = [
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function symbol() view returns (string)",
        ];
        const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        let balance, decimals, symbol;
        try{
          balance = await erc20.balanceOf(address);
          decimals = await erc20.decimals()
          symbol = await erc20.symbol();
        } catch (err){
          throw new Error("Token contract not available on this chain")
        }

         const amountInWei = ethers.parseUnits(amount.toString(), decimals);
          if (balance <= 0n) {
            throw new Error(`Insufficient funds. You have 0 ${symbol}`);
          }
      
          if (balance < amountInWei) {
            throw new Error(
              `Insufficient funds. Required: ${amount} ${symbol}, Available: ${ethers.formatUnits(balance, decimals)} ${symbol}`
            );
          }
        

        paymentResp = await sendEthereumPayment(walletForPayment, amountInWei, {
          recipient: process.env.NEXT_PUBLIC_ETH_ESCROW_ADDRESS,
          tokenAddress,
          tokenSymbol: symbol,
          network: "xrpl-evm-mainnet",
          rpcExplorerBase: explorerBase
        })
      }
      else if (chainType === "ethereum") {
        const signer = await getSigner()
        const provider = signer.provider
      
        const network = await provider.getNetwork()
      
        // ✅ Ensure we're on Ethereum mainnet (chainId = 1)
        if (network.chainId !== 1n) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x1" }], // hex chainId for mainnet
            })
            throw new Error("Switched to Ethereum Mainnet. Please try payment again.")
          } catch (switchError) {
            throw new Error("Failed to switch to Ethereum Mainnet. Please switch manually in MetaMask.")
          }
        }
      
        // ✅ amount conversion (use parseUnits instead of parseEther for safety)
        const formattedAmount = ethers.parseUnits(
          parseFloat(amount).toFixed(18), 
          18
        )
              
        const balance = await provider.getBalance(await signer.getAddress())
        alert(`Eth Balance: ${balance}`)
        if (balance < formattedAmount) {
          throw new Error("Insufficient ETH balance")
        }
      
        // ✅ proceed with payment
        paymentResp = await sendEthereumPayment(signer, formattedAmount, {
          recipient: process.env.NEXT_PUBLIC_ETH_ESCROW_ADDRESS,
          tokenSymbol: "ETH",
          network: "ethereum-mainnet",
          rpcExplorerBase: "https://etherscan.io/tx/"
        })
      } else if (chainType === "solana") {
        // ✅ Native SOL payment
        paymentResp = await sendSolanaPayment(
          {
            publicKey,
            connected,
            sendTransaction,   // coming from your Phantom context
          },
          amount,
          connection,
          "solana" // 👈 type is explicitly "solana"
        );
      } else if (chainType === "xrpb-sol") {
        // ✅ XRBP-SOL SPL token payment
        paymentResp = await sendSolanaPayment(
          {
            publicKey,
            connected,
            sendTransaction,   // from Phantom context
          },
          amount,
          connection,
          "xrpb-sol" // 👈 type is explicitly "xrpb-sol"
        );
      }
      
      

      if (!paymentResp.success) throw new Error(paymentResp.error || 'Payment failed')
      setPaymentResult({ message: "Payment successful!", txHash: paymentResp.txHash || paymentResp.signature, showQR: paymentResp.showQR, qrCode: paymentResp.qrCode, btcAddress: paymentResp.btcAddress, btcAmount: paymentResp.btcAmount })

      // Create escrow
      setPaymentResult({ message: "Creating escrow..." })
      const escrowResponse = await fetch('https://ripple-flask-server.onrender.com/escrows/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          seller: listing.seller.wallets.find(w => w.chain === chainType)?.address || '',
          buyer: primaryWallet.address,
          amount,
          chain: mappedChain,
          conditions: {
            delivery_required: true,
            satisfactory_condition: true,
            auto_release_days: 20
          },
          listingId: listing.id,
          transactionHash: paymentResp.txHash || paymentResp.signature,
          paymentVerified: true
        })
      })

      const escrowData = await escrowResponse.json()
      if (!escrowData.success) throw new Error(escrowData.error || 'Escrow creation failed')

      setModalStatus("success")
      setPaymentResult({ ...paymentResult, message: `Payment & escrow created!\nEscrow ID: ${escrowData.escrowId}` })
    } catch (err) {
      console.error(err)
      setModalStatus("failed")
      setModalError(err.message || "Payment/Escrow failed")
    } finally {
      setOrderProcessing(false)
    }
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
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleBuyNow}>
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
  
      {showShippingForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Shipping Information</h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Street Address"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-400"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="px-3 py-2 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                  className="px-3 py-2 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={shippingInfo.zipCode}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                  className="px-3 py-2 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={shippingInfo.country}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                  className="px-3 py-2 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                />
              </div>

              <input
                type="tel"
                placeholder="Phone Number"
                value={shippingInfo.phone}
                onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-400"
              />

              {/* 🔴 Show validation error if any */}
              {validationError && (
                <p className="text-red-500 text-sm mt-2">{validationError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setshowShippingForm(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleShippingSubmit}
                className="flex-1 px-4 py-2 bg-[#39FF14] text-black rounded-lg hover:bg-[#39FF14]/90"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------
          Payment Modal (glassy + blurred backdrop)
          Renders ONLY when showPaymentModal === true
         --------------------------- */}
      {showPaymentModal && (() => {
        // compute payment options only when modal is visible
        const paymentOptions = []

        console.log("Recomputing payment options for modal", { evmWallet, isConnected, isXRPLEVM, xrplWallet, xrpWalletAddress })
  
        if (evmWallet && isConnected) {
          paymentOptions.push({
            type: "evm",
            name: "XRPB (EVM)",
            currency: "XRPB",
            address: evmWallet,
            icon: "🟢",
          })
          paymentOptions.push({
            type: "ethereum",
            name: "Ethereum (Mainnet)",
            currency: "ETH",
            address: evmWallet,
            icon: "⚪",
          })
        }

        if (publicKey && connected && connection) {
          paymentOptions.push({
            type: "solana",
            name: "Solana (SOL)",
            currency: "SOL",
            address: publicKey.toString(),
            icon: "🟣",
          })
          paymentOptions.push({
            type: "xrpb-sol",
            name: "XRPB-SOL (SOL)",
            currency: "XRPB-SOL",
            address: publicKey.toString(),
            icon: "🟣",
          })
        }
  
        if (xrplWallet && xrpWalletAddress) {
          paymentOptions.push({
            type: "xrpl",
            name: "XRPB (XRPL)",
            currency: "XRPB",
            address: xrpWalletAddress,
            icon: "🔵",
          })

          // if (address && isConnected) {

          // }
        }
        
  
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-gray-900/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* close button */}
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedPaymentMethod(null)
                }}
                className="absolute top-3 right-3 text-gray-300 hover:text-white rounded-md p-1"
                aria-label="Close payment modal"
              >
                ✕
              </button>
  
              <h3 className="text-xl font-semibold text-white mb-4">Choose Payment Method</h3>
  
              {/* Select Wallet */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-[#39FF14]" />
                  Select Wallet
                </h4>
  
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {paymentOptions.length === 0 ? (
                    <div className="p-4 rounded-lg border border-gray-700 bg-black/40 text-center">
                      <p className="text-gray-300 mb-3">No connected wallets available.</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            // metamask connect if available
                            if (connectMetamaskWallet) connectMetamaskWallet()
                          }}
                          className="px-3 py-2 border border-gray-600 rounded-md text-sm text-white hover:bg-gray-800"
                        >
                          Connect Metamask
                        </button>
                        <button
                          onClick={() => {
                            if (connectXrpWallet) connectXrpWallet()
                          }}
                          className="px-3 py-2 bg-[#39FF14] text-black rounded-md text-sm hover:bg-[#39FF14]/90"
                        >
                          Connect XRPL Wallet
                        </button>
                      </div>
                    </div>
                  ) : (
                    paymentOptions.map((wallet) => {
                      const amountRaw = getPaymentAmount(parseFloat(listing.price), wallet.type)
                      // guard amount formatting
                      const amountStr = typeof amountRaw === "number" ? amountRaw.toFixed(6) : amountRaw
                      return (
                        <div
                          key={wallet.type}
                          onClick={() => setSelectedPaymentMethod(wallet)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                            selectedPaymentMethod?.type === wallet.type
                              ? 'border-[#39FF14] bg-[#39FF14]/10 shadow-[0_0_20px_rgba(57,255,20,0.15)]'
                              : 'border-gray-600 bg-black/40 hover:border-[#39FF14]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{wallet.icon}</span>
                              <div>
                                <p className="text-white font-semibold text-sm">{wallet.name}</p>
                                <p className="text-gray-400 text-xs font-mono">
                                  {wallet.address?.slice(0, 8)}...{wallet.address?.slice(-6)}
                                </p>
                                {wallet.type === "evm" && !isXRPLEVM && (
                                  <p className="text-yellow-400 text-xs">⚠️ Network switch required</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[#39FF14] font-bold text-sm">
                                {amountStr} {wallet.currency}
                              </p>
                              <p className="text-gray-400 text-xs">≈ ${listing?.price} USD</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
  
              {selectedPaymentMethod && (
                <div className="mb-6 p-4 bg-gradient-to-r from-[#39FF14]/8 to-emerald-400/8 rounded-lg border border-[#39FF14]/20 max-h-64 overflow-y-auto">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center sticky top-0 bg-transparent pb-2">
                    <DollarSign className="w-5 h-5 mr-2 text-[#39FF14]" />
                    Payment Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Item:</span>
                      <span className="text-white font-semibold">{listing.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">USD Price:</span>
                      <span className="text-white">${listing.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Shipping Fee:</span>
                      <span className="text-white">$10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total USD:</span>
                      <span className="text-white">${(parseFloat(listing.price) + 10).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">XRPB Price:</span>
                      <span className="text-[#39FF14]">
                        {xrpbPrice
                          ? getPaymentAmount(parseFloat(listing.price) + 10, selectedPaymentMethod.type).toFixed(6)
                          : "N/A"}
                      </span>
                    </div>
                    ...
                    <div className="flex justify-between font-semibold border-t border-gray-600 pt-2">
                      <span className="text-gray-300">Total:</span>
                      <span className="text-[#39FF14]">
                        {(
                          getPaymentAmount(parseFloat(listing.price) + 10, selectedPaymentMethod.type) *
                          (1 +
                            (user.membership_tier_id === 1
                              ? 0.035
                              : user.membership_tier_id === 2
                              ? 0.025
                              : 0.015))
                        ).toFixed(6)}{' '}
                        XRPB
                      </span>
                    </div>
                  </div>
                </div>
              )}

  
              {/* Escrow Protection Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="text-sm space-y-1">
                  <p className="text-blue-400 font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Escrow Protection Active
                  </p>
                  <p className="text-gray-300">Your payment will be held securely until delivery is confirmed or 20 days pass.</p>
                </div>
              </div>
  
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedPaymentMethod(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  disabled={orderProcessing || !selectedPaymentMethod}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    orderProcessing || !selectedPaymentMethod
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-[#39FF14] text-black hover:bg-[#39FF14]/90'
                  }`}
                >
                  {orderProcessing ? 'Creating Escrow...' : 'Confirm Escrow Purchase'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

       {/* Payment Modal */}
       {showPaymentModal && (
        <PaymentProcessingModal
          open={modalStatus !== null}
          status={modalStatus}
          error={modalError}
          paymentResult={paymentResult}
          onClose={() => {
            setModalStatus(null)
            setShowPaymentModal(false)
            setSelectedPaymentMethod(null)
          }}
        />
      )}
  
    </div>
  )
  
}
