import React from "react"
import { motion } from "framer-motion"

// 🟢 ChartContainer
export function ChartContainer({ className = "", children }) {
  return (
    <div
      className={`relative w-full h-full bg-[#111111] border border-gray-800 rounded-xl p-4 shadow-md ${className}`}
    >
      {children}
    </div>
  )
}

// 🟢 ChartTooltip wrapper
export function ChartTooltip({ children }) {
  return (
    <div className="bg-[#111111] border border-gray-800 rounded-md shadow-lg text-sm text-gray-200 px-3 py-2">
      {children}
    </div>
  )
}

// 🟢 ChartTooltipContent
export function ChartTooltipContent({ label, value, labelClassName = "", valueClassName = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col"
    >
      {label && (
        <span className={`text-gray-400 text-xs mb-1 ${labelClassName}`}>
          {label}
        </span>
      )}
      {value && (
        <span className={`text-green-400 font-semibold ${valueClassName}`}>
          {value}
        </span>
      )}
    </motion.div>
  )
}
