"use client"

import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { CheckCircle, XCircle } from "lucide-react"

export default function PaymentProcessingModal({ open, onClose, status, error, paymentResult }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 w-full max-w-md text-center animate-fadeIn">
        
        {/* Processing */}
        {status === "processing" && (
          <div className="flex flex-col items-center gap-4">
            <AiOutlineLoading3Quarters className="animate-spin text-white text-5xl" />
            <h2 className="text-lg font-semibold text-white">Processing Payment...</h2>
            <p className="text-gray-400 text-sm">
              {paymentResult?.message || "Please confirm your transaction."}
            </p>

            {/* 🔹 BTC QR Code & Address */}
            {paymentResult?.showQR && (
              <div className="flex flex-col items-center gap-2 mt-4">
                <img src={paymentResult.qrCode} alt="BTC QR" className="w-40 h-40 rounded-lg border border-gray-700" />
                <p className="text-white text-sm break-all">
                  <strong>Address:</strong> {paymentResult.btcAddress}
                </p>
                <p className="text-white text-sm">
                  <strong>Amount:</strong> {paymentResult.btcAmount} BTC
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="text-green-500 w-14 h-14" />
            <h2 className="text-lg font-semibold text-white">Payment Successful</h2>
            <p className="text-gray-400 text-sm">Your membership has been activated 🎉</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              Continue
            </button>
          </div>
        )}

        {/* Failed */}
        {status === "failed" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="text-red-500 w-14 h-14" />
            <h2 className="text-lg font-semibold text-white">Payment Failed</h2>
            <p className="text-gray-400 text-sm">
              {error || "Something went wrong. Please try again."}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
