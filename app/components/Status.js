"use client"

import { useEffect } from "react"
import Modal from './ui/modal'

export default function PaymentProcessingModal({ open, onClose, status }) {
  // status can be: "processing", "success", "failed"

  const renderContent = () => {
    switch (status) {
      case "processing":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg sm:text-xl font-medium">Processing your payment...</p>
          </div>
        )
      case "success":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-full text-white text-2xl">
              ✓
            </div>
            <p className="text-green-400 text-lg sm:text-xl font-semibold">Payment Successful!</p>
            <p className="text-gray-300 text-center text-sm sm:text-base">
              Thank you for your payment. You can now access your plan.
            </p>
          </div>
        )
      case "failed":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-full text-white text-2xl">
              ✕
            </div>
            <p className="text-red-400 text-lg sm:text-xl font-semibold">Payment Failed!</p>
            <p className="text-gray-300 text-center text-sm sm:text-base">
              There was an issue with your payment. Please try again.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="max-w-xs sm:max-w-sm w-full mx-auto bg-[#111111] rounded-2xl p-6 sm:p-8 flex flex-col items-center space-y-4">
        {renderContent()}

        {(status === "success" || status === "failed") && (
          <button
            onClick={onClose}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-xl font-semibold text-base sm:text-lg transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </Modal>
  )
}
