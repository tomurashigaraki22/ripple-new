"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Store, Eye, EyeOff } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"   // ✅ useAuth hook

export default function StorefrontLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()   // ✅ from context

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("https://ripple-flask-server.pxxl.pro/storefront/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        // ✅ Call login from context with user, token, and loginType=2
        login(data.user, data.token, 2)
        router.push("/storefront/dashboard")
      } else {
        alert(data.message || "Invalid email or password")
      }
    } catch (error) {
      console.error("Login failed:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
      {/* Back to Main Site Link */}
      <div className="w-full max-w-md mb-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Main Site
        </Link>
      </div>

      {/* Main Login Form */}
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <Store className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Storefront Login</h1>
            <p className="text-gray-400 mt-2">Access your seller dashboard</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-white text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your storefront email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-green-500 text-white placeholder:text-gray-500 focus:border-green-400 focus:ring-green-400/20"
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your generated password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-gray-600 text-white placeholder:text-gray-500 focus:border-green-400 focus:ring-green-400/20 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium text-base transition-all duration-200"
          >
            {isLoading ? "Signing In..." : "Sign In to Storefront"}
          </Button>
        </form>

        {/* Information Note */}
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <span className="font-medium">Note:</span> Storefront credentials are automatically generated when you
            purchase a membership. Check your membership confirmation or contact support if you need assistance.
          </p>
        </div>

        {/* Purchase Membership Link */}
        <div className="text-center">
          <p className="text-gray-400">
            Don't have a membership?{" "}
            <Link href="/membership" className="text-green-500 hover:text-green-400 font-medium transition-colors">
              Purchase Membership
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
