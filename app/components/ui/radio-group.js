// components/ui/radio-group.js
import React from "react"
import clsx from "clsx"

export function RadioGroup({ children, value, onChange, className }) {
  return (
    <div className={clsx("space-y-2", className)}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          checked: value === child.props.value,
          onChange: () => onChange(child.props.value),
        })
      )}
    </div>
  )
}

export function RadioGroupItem({ value, label, checked, onChange }) {
  return (
    <label
      className={clsx(
        "flex items-center gap-2 cursor-pointer rounded-lg border p-2 transition",
        checked
          ? "border-green-500 bg-green-600/20"
          : "border-gray-700 hover:border-green-500/50"
      )}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio text-green-500 focus:ring-green-500"
      />
      <span className="text-sm text-white">{label}</span>
    </label>
  )
}
