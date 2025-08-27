"use client"

import { useState, useEffect, useRef } from "react"
import Modal from './ui/modal'
import { Button } from "../components/ui/button"
import { getAllXRPBPrices } from "../../lib/getXRPBPrices"
import { sendXRPLXRPBPayment, monitorXRPLXRPBTransactions } from "../../lib/productPaymentHelper"
import { generateBTCQRCode, monitorBTCPayment, getBTCExplorerUrl } from "../../lib/btcPaymentHelper"
import { sendEthereumPayment } from "../../lib/ethPayment"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { ethers } from "ethers"
import { useAuth } from "../contexts/AuthContext"
import PaymentProcessingModal from "./PaymentProcessingModal"
import { useMetamask } from "../contexts/MetaMaskContext"
import { useAccount } from "wagmi"

export default function PaymentModal({ 
  open, 
  onClose, 
  tier, 
  xrpWalletAddress, 
  fetchCurrentMembership, 
  paymentMethod = "xrpl", // "xrpl" | "ethereum"
  chain,
  switchChain
}) {
  const [xrpbPrice, setXrpbPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const {getSigner} = useMetamask()
  const { user } = useAuth()
  const [errMessage, seterrMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(600)

  const fiatAmount = parseFloat(tier?.price?.replace("$", ""))
  const paymentMonitorRef = useRef(null)
  const [btcPrice, setBtcPrice] = useState(0)

  const countdownRef = useRef(null)

// Fetch prices when modal opens
useEffect(() => {
  if (!open) return

  const fetchPrice = async () => {
    setLoading(true)
    try {
      if (paymentMethod === "xrpl") {
        const prices = await getAllXRPBPrices()
        setXrpbPrice(prices.xrpl || 0.0001)
      } else if (paymentMethod === "btc") {
        // ✅ Fetch BTC price from CoinGecko
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        )
        if (!res.ok) throw new Error("Failed to fetch BTC price")
        const data = await res.json()
        setBtcPrice(data.bitcoin.usd)
      }
    } catch (err) {
      console.error("Error fetching price:", err)
    } finally {
      setLoading(false)
    }
  }

  fetchPrice()
}, [open, paymentMethod])


  useEffect(() => {
    if (open) {
      setTimeLeft(600)
    } else {
      clearInterval(countdownRef.current)
      clearInterval(paymentMonitorRef.current)
    }
  }, [open])

  const formatNumber = (num) => {
    if (!num) return "--"
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B"
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M"
    if (num >= 1_000) return (num / 1_000).toFixed(2) + "K"
    return num.toFixed(6)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // 🔹 XRPL Handler
  const handleXRPLPayment = async () => {
    if (!tier || !user) return
    setIsProcessing(true)
    setPaymentResult({ pending: true, message: "Please complete the XRPB payment in Xaman..." })

    try {

      if (!xrpWalletAddress){
        setPaymentResult({ success: false, error: "XRP Wallet is not connected" })
        return
      }
      const xrpbAmount = (fiatAmount / xrpbPrice).toFixed(6)

      const result = await sendXRPLXRPBPayment(
        { account: xrpWalletAddress },
        process.env.NEXT_PUBLIC_ESCROW_XRPL_WALLET,
        xrpbAmount,
        "5852504200000000000000000000000000000000",
        "rsEaYfqdZKNbD3SK55xzcjPm3nDrMj4aUT"
      )

      if (!result.success) {
        setPaymentResult(result)
        setIsProcessing(false)
        return
      }

      setPaymentResult({ pending: true, message: "Monitoring XRPB payment..." })

      // Start countdown
      countdownRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current)
            clearInterval(paymentMonitorRef.current)
            setIsProcessing(false)
            setPaymentResult({ success: false, error: "Payment timeout (10 minutes elapsed)." })
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Monitor XRPL
      paymentMonitorRef.current = setInterval(async () => {
        const monitorResult = await monitorXRPLXRPBTransactions(
          process.env.NEXT_PUBLIC_XRPB_DESTINATION_ADDRESS,
          parseFloat(xrpbAmount),
          process.env.NEXT_PUBLIC_XRPB_CURRENCY,
          process.env.NEXT_PUBLIC_XRPB_ISSUER,
          600
        )

        if (monitorResult.success) {
          clearInterval(paymentMonitorRef.current)
          clearInterval(countdownRef.current)
          await finalizePayment("xrpl", monitorResult.txHash, fiatAmount, result.paymentUrl)
        }
      }, 10000)
    } catch (err) {
      console.log("Error: ", err)
      setPaymentResult({ success: false, error: err.message })
      setIsProcessing(false)
    }
  }

  // 🔹 Ethereum Handler
  const handleEthPayment = async (network = "xrpl-evm-mainnet") => {
    if (!tier || !user) {
      console.log("Tier and User: ", tier, user);
      return;
    }
  
    alert(`Chain: ${chain?.name || "unknown"} (ID: ${chain?.id || "N/A"})`);
    setIsProcessing(true);
    setPaymentResult({
      pending: true,
      message: "Confirm the transaction in MetaMask...",
    });
  
    try {
      // Convert fiat → token amount
      const ethAmount = fiatAmount / xrpbPrice;
  
      // XRPL-EVM config
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
  
      if (!NETWORK_CONFIG[network]) {
        throw new Error(`Unsupported XRPL-EVM network: ${network}`);
      }
  
      const { explorerBase, tokenAddress, chainId } = NETWORK_CONFIG[network];
  
      // ✅ If current chain doesn’t match → switch it
      if (chain?.id !== chainId) {
        await switchChain({ chainId });
        throw new Error(`Switched to correct chain: ${network}. Please retry payment.`);
      }
  
      // ✅ Get signer
      const signer = await getSigner();
      const address = await signer.getAddress();
  
      // ✅ ERC20 ABI for balance check
      const ERC20_ABI = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
      ];
  
      // ✅ Load token contract
      const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  
      let balance, decimals, symbol;
      try {
        balance = await erc20.balanceOf(address);
        decimals = await erc20.decimals();
        symbol = await erc20.symbol();
      } catch (err) {
        throw new Error("Token contract not available on this chain");
      }
  
      // ✅ Convert ethAmount into smallest unit
      const amountInWei = ethers.parseUnits(ethAmount.toString(), decimals);
  
      if (balance <= 0n) {
        throw new Error(`Insufficient funds. You have 0 ${symbol}`);
      }
  
      if (balance < amountInWei) {
        throw new Error(
          `Insufficient funds. Required: ${ethAmount} ${symbol}, Available: ${ethers.formatUnits(balance, decimals)} ${symbol}`
        );
      }
  
      // ✅ If balance ok → proceed with payment
      const result = await sendEthereumPayment(
        async () => signer,
        ethAmount,
        {
          recipient: process.env.NEXT_PUBLIC_ETH_ESCROW_ADDRESS,
          tokenAddress,
          tokenSymbol: symbol,
          network,
          rpcExplorerBase: explorerBase,
        }
      );
  
      if (result.success) {
        await finalizePayment("xrpl-evm", result.txHash, fiatAmount);
      } else {
        setPaymentResult({ success: false, error: result.error });
        seterrMessage(result.error);
      }
    } catch (err) {
      setPaymentResult({ success: false, error: err.message });
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBTCPayment = async (network = "mainnet") => {
    if (!tier || !user) return
  
    setIsProcessing(true)
    setPaymentResult({ pending: true, message: "Send BTC to the address shown..." })
  
    try {
      // 🔹 Fetch BTC price from CoinGecko
      const priceRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      )
      let btcPrice = 113230 // fallback
      if (priceRes.ok) {
        const data = await priceRes.json()
        btcPrice = data.bitcoin.usd
      }
  
      const btcAmount = (fiatAmount / btcPrice).toFixed(8)
  
      // 🔹 Use different env vars for mainnet/testnet
      const btcAddress =
        network === "testnet"
          ? process.env.NEXT_PUBLIC_BTC_TESTNET_ESCROW_ADDRESS
          : process.env.NEXT_PUBLIC_BTC_ESCROW_ADDRESS
  
      const qrCode = await generateBTCQRCode(btcAddress, btcAmount)
  
      setPaymentResult({
        pending: true,
        showQR: true,
        btcAddress,
        btcAmount,
        qrCode,
        message: `Waiting for BTC ${network} transaction confirmation...`
      })
  
      // ⏱ Countdown
      countdownRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current)
            clearInterval(paymentMonitorRef.current)
            setIsProcessing(false)
            setPaymentResult({
              success: false,
              error: "Payment timeout (10 minutes elapsed)."
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
  
      // 🔎 Monitor BTC network
      paymentMonitorRef.current = setInterval(async () => {
        const result = await monitorBTCPayment(
          network,
          btcAddress,
          parseFloat(btcAmount)
        )
        if (result.success) {
          clearInterval(paymentMonitorRef.current)
          clearInterval(countdownRef.current)
          await finalizePayment(
            "btc",
            result.txid,
            fiatAmount,
            getBTCExplorerUrl(network, result.txid)
          )
        }
      }, 15000)
    } catch (err) {
      console.error("BTC error:", err)
      setPaymentResult({ success: false, error: err.message })
    } finally {
      setIsProcessing(false)
    }
  }
  

  // 🔹 Shared finalize (backend verification + membership activation)
  const finalizePayment = async (method, txHash, amount, paymentUrl = null) => {
    setPaymentResult({
      success: true,
      txHash,
      explorerUrl: method === "xrpl"
        ? `https://livenet.xrpl.org/transactions/${txHash}`
        : `https://explorer.testnet.xrplevm.org.io/tx/${txHash}`,
      paymentUrl,
      message: "Payment successful!"
    })

    const token = localStorage.getItem("token")
    const res = await fetch("https://ripple-flask-server.onrender.com/membership/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        tierName: tier.name,
        transactionHash: txHash,
        paymentMethod: method,
        amount,
        currency: "USD",
        paymentUrl,
        verified: true
      })
    })

    const membershipResult = await res.json()
    if (res.ok && membershipResult.success) {
      setPaymentResult(prev => ({
        ...prev,
        membershipActivated: true,
        membershipData: membershipResult.membership,
        storefrontCredentials: membershipResult.storefrontCredentials,
        emailSent: membershipResult.emailSent
      }))
      await fetchCurrentMembership()
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose}>
{/* inside Modal content */}
      <div className="max-w-full sm:max-w-md mx-auto p-4 sm:p-6 bg-[#111111] rounded-2xl relative">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">
          Pay for {tier?.name} Plan
        </h2>

        {/* 🔹 Payment Method Selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button
            className={`w-full ${paymentMethod === "xrpl" ? "bg-green-600" : "bg-gray-700"} text-white`}
            onClick={() => setPaymentResult(null) || seterrMessage("") || (window.paymentMethod = "xrpl")}
          >
            XRPL
          </Button>
          <Button
            className={`w-full ${paymentMethod === "ethereum" ? "bg-green-600" : "bg-gray-700"} text-white`}
            onClick={() => setPaymentResult(null) || (window.paymentMethod = "ethereum")}
          >
            Ethereum
          </Button>
          <Button
            className={`w-full ${paymentMethod === "btc" ? "bg-green-600" : "bg-gray-700"} text-white`}
            onClick={() => setPaymentResult(null) || (window.paymentMethod = "btc")}
          >
            Bitcoin
          </Button>
        </div>

        {/* 🔹 Payment Details */}
        {loading ? (
          <p className="text-gray-400 text-center">
            Loading {paymentMethod.toUpperCase()} price...
          </p>
        ) : (
          <>
            <div className="mb-4 text-center">
              {paymentMethod === "xrpl" && (
                <>
                  <p className="text-gray-200">
                    Amount: <span className="font-bold">{formatNumber(fiatAmount / xrpbPrice)} XRPB</span>
                  </p>
                  <p className="text-gray-400 text-sm">1 XRPB = ${xrpbPrice.toFixed(6)}</p>
                </>
              )}

              {paymentMethod === "ethereum" && (
                <p className="text-gray-200">
                  Amount: <span className="font-bold">~{(fiatAmount / xrpbPrice).toFixed(6)} ETH</span>
                </p>
              )}

              {paymentMethod === "btc" && (
                <p className="text-gray-200">
                  Amount: <span className="font-bold">
                    ≈ {(fiatAmount / btcPrice).toFixed(6)} BTC
                  </span>
                  <span className="block text-gray-400 text-sm">
                    1 BTC = ${btcPrice.toLocaleString()}
                  </span>
                </p>
              )}


              {isProcessing && <p className="text-yellow-400 text-sm">Time left: {formatTime(timeLeft)}</p>}
            </div>

            {/* 🔹 Payment Status Messages */}
            {paymentResult?.pending && (
              <p className="text-yellow-400 text-center mb-2">{paymentResult.message}</p>
            )}

            {paymentResult?.success && (
              <p className="text-green-400 text-center mb-2">Payment successful!</p>
            )}

            {paymentResult?.success === false && paymentResult?.error && (
              <p className="text-red-500 text-center mb-2">Payment failed: {paymentResult.error}</p>
            )}

            {paymentResult?.membershipActivated && (
              <p className="text-green-400 text-center text-sm mt-2">
                Membership activated successfully!
              </p>
            )}

            {/* 🔹 Dynamic Pay Button */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg mt-3"
              onClick={
                paymentMethod === "xrpl"
                  ? handleXRPLPayment
                  : paymentMethod === "ethereum"
                  ? () => handleEthPayment("xrpl-evm-mainnet")
                  : () => handleBTCPayment("mainnet")
              }
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : paymentMethod === "xrpl"
                ? "Pay with XRPL"
                : paymentMethod === "ethereum"
                ? "Pay with XRPL EVM"
                : "Pay with Bitcoin"}
            </Button>

            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-2xl">
                <AiOutlineLoading3Quarters className="animate-spin text-white text-4xl mb-2" />
                <p className="text-white text-center">Waiting for payment completion...</p>
              </div>
            )}
          </>
        )}
      </div>

      </Modal>

      {/* Unified status modal */}
      <PaymentProcessingModal
        open={!!paymentResult}
        onClose={() => setPaymentResult(null)}
        status={
          paymentResult?.pending
            ? "processing"
            : paymentResult?.success
              ? "success"
              : paymentResult?.success === false
                ? "failed"
                : null
        }
        error={paymentResult?.error}
        paymentResult={paymentResult}
      />

    </>
  )
}
