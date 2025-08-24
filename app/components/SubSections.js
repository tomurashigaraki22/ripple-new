"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"

// --- Shared Section Wrapper ---
function SectionWrapper({ title, description, children, preview }) {
  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
        <p className="text-gray-400">{description}</p>
      </div>

      {/* Controls */}
      <div className="space-y-3">{children}</div>

      {/* Live Preview */}
      <Card className="bg-[#1a1a1a]/70 border border-gray-800 rounded-xl shadow-md">
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold text-green-400 mb-3">Live Preview</h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-40 rounded-lg border border-green-600/30 overflow-hidden"
          >
            {preview}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Mock Storefront Preview (shared) ---
function StorefrontPreview({ background, themeColor, font, logo }) {
  return (
    <div
      className="w-full h-full flex flex-col justify-between p-4 text-white"
      style={{
        background:
          background.type === "solid"
            ? background.value
            : background.type === "gradient"
            ? `linear-gradient(to right, ${background.value[0]}, ${background.value[1]})`
            : `url(${background.value}) center/cover`,
        fontFamily: font,
      }}
    >
      {/* Logo */}
      <div className="text-xl font-bold">{logo || "My Store"}</div>

      {/* Listings */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-md flex items-center justify-center"
            style={{ backgroundColor: themeColor }}
          >
            Item {i}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------- Sections ----------------

export function ColorsAndThemes() {
  const [themeColor, setThemeColor] = useState("#22c55e")

  return (
    <SectionWrapper
      title="Colors & Themes"
      description="Customize your storefront's appearance"
      preview={
        <StorefrontPreview
          background={{ type: "solid", value: "#111" }}
          themeColor={themeColor}
          font="sans-serif"
          logo="Store"
        />
      }
    >
      <Label className="text-white text-sm">Theme Color</Label>
      <Input
        type="color"
        value={themeColor}
        onChange={(e) => setThemeColor(e.target.value)}
        className="w-20 h-10 p-1"
      />
    </SectionWrapper>
  )
}

export function BackgroundThemes() {
  const [background, setBackground] = useState({ type: "solid", value: "#000000" })

  return (
    <SectionWrapper
      title="Background & Themes"
      description="Set the background and theme for your storefront"
      preview={
        <StorefrontPreview
          background={background}
          themeColor="#22c55e"
          font="sans-serif"
          logo="Store"
        />
      }
    >
      <Label className="text-white text-sm">Background Type</Label>
      <RadioGroup
        defaultValue="solid"
        onValueChange={(val) => setBackground({ type: val, value: background.value })}
        className="flex gap-4 text-white"
      >
        <div>
          <RadioGroupItem value="solid" id="solid" />
          <Label htmlFor="solid" className="ml-2">Solid</Label>
        </div>
        <div>
          <RadioGroupItem value="gradient" id="gradient" />
          <Label htmlFor="gradient" className="ml-2">Gradient</Label>
        </div>
        <div>
          <RadioGroupItem value="image" id="image" />
          <Label htmlFor="image" className="ml-2">Image</Label>
        </div>
      </RadioGroup>

      {background.type === "solid" && (
        <Input
          type="color"
          value={background.value}
          onChange={(e) => setBackground({ type: "solid", value: e.target.value })}
          className="w-20 h-10 p-1"
        />
      )}

      {background.type === "gradient" && (
        <div className="flex gap-2">
          <Input
            type="color"
            defaultValue="#9333ea"
            onChange={(e) =>
              setBackground({ type: "gradient", value: [e.target.value, "#3b82f6"] })
            }
            className="w-20 h-10 p-1"
          />
          <Input
            type="color"
            defaultValue="#3b82f6"
            onChange={(e) =>
              setBackground({ type: "gradient", value: ["#9333ea", e.target.value] })
            }
            className="w-20 h-10 p-1"
          />
        </div>
      )}

      {background.type === "image" && (
        <Input
          placeholder="Enter image URL"
          onChange={(e) => setBackground({ type: "image", value: e.target.value })}
        />
      )}
    </SectionWrapper>
  )
}

export function LayoutAndEffects() {
  const [layout, setLayout] = useState("grid")

  return (
    <SectionWrapper
      title="Layout & Effects"
      description="Customize the layout and effects of your storefront"
      preview={
        <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center">
          {layout === "grid" ? "🔲 Grid Layout" : "📜 List Layout"}
        </div>
      }
    >
      <RadioGroup
        defaultValue="grid"
        onValueChange={setLayout}
        className="flex gap-4 text-white"
      >
        <div>
          <RadioGroupItem value="grid" id="grid" />
          <Label htmlFor="grid" className="ml-2">Grid</Label>
        </div>
        <div>
          <RadioGroupItem value="list" id="list" />
          <Label htmlFor="list" className="ml-2">List</Label>
        </div>
      </RadioGroup>
    </SectionWrapper>
  )
}

export function Typography() {
  const [font, setFont] = useState("sans-serif")

  return (
    <SectionWrapper
      title="Typography"
      description="Choose the fonts and typography for your storefront"
      preview={
        <StorefrontPreview
          background={{ type: "solid", value: "#111" }}
          themeColor="#22c55e"
          font={font}
          logo="Store"
        />
      }
    >
      <Label className="text-white text-sm">Font Family</Label>
      <select
        value={font}
        onChange={(e) => setFont(e.target.value)}
        className="bg-[#1a1a1a] text-white p-2 rounded-md border border-gray-700"
      >
        <option value="sans-serif">Sans Serif</option>
        <option value="serif">Serif</option>
        <option value="monospace">Monospace</option>
        <option value="cursive">Cursive</option>
      </select>
    </SectionWrapper>
  )
}

export function SpotifyIntegration() {
  const [connected, setConnected] = useState(false)

  return (
    <SectionWrapper
      title="Spotify Integration"
      description="Connect your Spotify account to showcase your music"
      preview={
        connected ? (
          <div className="text-green-400 font-medium">🎶 Spotify Playlist Connected</div>
        ) : (
          <div className="text-gray-400">No Spotify account linked</div>
        )
      }
    >
      <Button
        onClick={() => setConnected(!connected)}
        className="bg-green-600 hover:bg-green-500"
      >
        {connected ? "Disconnect Spotify" : "Connect Spotify"}
      </Button>
    </SectionWrapper>
  )
}

export function LogoAndBranding() {
  const [logo, setLogo] = useState("My Store")

  return (
    <SectionWrapper
      title="Logo & Branding"
      description="Upload your logo and set branding options"
      preview={
        <StorefrontPreview
          background={{ type: "solid", value: "#111" }}
          themeColor="#22c55e"
          font="sans-serif"
          logo={logo}
        />
      }
    >
      <Label className="text-white text-sm">Store Name / Logo</Label>
      <Input
        placeholder="Enter store name"
        value={logo}
        onChange={(e) => setLogo(e.target.value)}
      />
    </SectionWrapper>
  )
}

// --- Export grouped
export default {
  ColorsAndThemes,
  BackgroundThemes,
  LayoutAndEffects,
  Typography,
  SpotifyIntegration,
  LogoAndBranding,
}
