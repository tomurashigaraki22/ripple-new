"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Store,
  LayoutDashboard,
  Package,
  Plus,
  ShoppingCart,
  Shield,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const sidebarItems = [
  { name: "Dashboard", href: "/storefront/dashboard", icon: LayoutDashboard },
  { name: "My Listings", href: "/storefront/listings", icon: Package },
  { name: "Add Listing", href: "/storefront/listings/add", icon: Plus },
  { name: "Orders", href: "/storefront/orders", icon: ShoppingCart },
  { name: "Escrows", href: "/storefront/escrows", icon: Shield },
  { name: "Analytics", href: "/storefront/analytics", icon: BarChart3 },
  { name: "Profile", href: "/storefront/profile", icon: User },
  { name: "Settings", href: "/storefront/settings", icon: Settings },
]

export default function StorefrontSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-24 left-4 z-50 p-2 rounded-lg bg-[#111111] text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-24 left-0 h-[90%] w-64 bg-[#111111] border-r border-gray-800 flex flex-col z-40
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Storefront Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Storefront</h2>
              <p className="text-gray-400 text-sm">RippleBids</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                onClick={() => setIsOpen(false)} // close on mobile after clicking
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-gray-800 space-y-4">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">devtomiwa9</p>
              <p className="text-green-400 text-xs">Pro Member</p>
            </div>
          </div>

          <Link
            href="/storefront/login"
            className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </Link>
        </div>
      </div>
    </>
  )
}
