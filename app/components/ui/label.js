// components/ui/label.js
import React from "react"
import clsx from "clsx"

export function Label({ children, className, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        "block text-sm font-medium text-gray-300 mb-1",
        className
      )}
    >
      {children}
    </label>
  )
}
