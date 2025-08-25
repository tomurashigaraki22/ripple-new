"use client"

import { useState, useEffect, useRef } from "react"
import Modal from './ui/modal'
import { Button } from "../components/ui/button"
import { getAllXRPBPrices } from "../../lib/getXRPBPrices"
import { sendXRPLXRPBPayment, monitorXRPLXRPBTransactions } from "../../lib/productPaymentHelper"
import { sendEthereumPayment } from "../../lib/ethPayment"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { useAuth } from "../contexts/AuthContext"
import PaymentProcessingModal from "./PaymentProcessingModal"
import { useMetamask } from "../contexts/MetaMaskContext"

export default function PaymentModal({ 
  open, 
  onClose, 
  tier, 
  xrpWalletAddress, 
  fetchCurrentMembership, 
  paymentMethod = "xrpl" // "xrpl" | "ethereum"
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
  const countdownRef = useRef(null)

  useEffect(() => {
    if (!open) return
    if (paymentMethod === "xrpl") {
      const fetchPrice = async () => {
        setLoading(true)
        try {
          const prices = await getAllXRPBPrices()
          setXrpbPrice(prices.xrpl || 0.0001)
        } catch (err) {
          console.error("Error fetching XRPB price:", err)
        } finally {
          setLoading(false)
        }
      }
      fetchPrice()
    } else {
      setLoading(false) // ETH doesn't need XRPB price
    }
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
  const handleEthPayment = async () => {
    if (!tier || !user) {
      console.log("Tier and User: ", tier, user)
      return
    }
    setIsProcessing(true)
    setPaymentResult({ pending: true, message: "Confirm the transaction in MetaMask..." })

    try {
      // convert fiat to ETH — replace with a proper ETH price fetch
      const ethAmount = (fiatAmount / 3000).toFixed(6)

      const result = await sendEthereumPayment(
        async () => await getSigner(),
        ethAmount,
        {
          recipient: process.env.NEXT_PUBLIC_ETH_ESCROW_ADDRESS,
          tokenAddress: null,
          tokenSymbol: "ETH",
          rpcExplorerBase: "https://etherscan.io/tx/",
        }
      )

      if (result.success) {
        await finalizePayment("ethereum", result.txHash, fiatAmount)
      } else {
        setPaymentResult({ success: false, error: result.error })
        seterrMessage(result.error)
      }
    } catch (err) {
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
        : `https://etherscan.io/tx/${txHash}`,
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
        <div className="max-w-full sm:max-w-md mx-auto p-4 sm:p-6 bg-[#111111] rounded-2xl relative">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">
            Pay for {tier?.name} Plan
          </h2>

          {loading ? (
            <p className="text-gray-400 text-center">
              {paymentMethod === "xrpl" ? "Fetching XRPB price..." : "Loading..."}
            </p>
          ) : (
            <>
              <div className="mb-4 text-center">
                {paymentMethod === "xrpl" ? (
                  <>
                    <p className="text-gray-200">
                      Amount: <span className="font-bold">{formatNumber(fiatAmount / xrpbPrice)} XRPB</span>
                    </p>
                    <p className="text-gray-400 text-sm">1 XRPB = ${xrpbPrice.toFixed(6)}</p>
                  </>
                ) : (
                  <p className="text-gray-200">
                    Amount: <span className="font-bold">~{(fiatAmount / 3000).toFixed(6)} ETH</span>
                  </p>
                )}
                {isProcessing && <p className="text-yellow-400 text-sm">Time left: {formatTime(timeLeft)}</p>}
              </div>

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

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg mt-3"
                onClick={paymentMethod === "xrpl" ? handleXRPLPayment : handleEthPayment}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : paymentMethod === "xrpl" ? "Pay with XRPL" : "Pay with Ethereum"}
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
      />
    </>
  )
}
