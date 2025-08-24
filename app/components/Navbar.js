"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useIsLoggedIn, useLoginStatus } from "../contexts/AuthContext";
import { useEffect } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const route = useRouter();
  const {logout, user, token} = useAuth()
  const pathname = usePathname()
  const { status, loginType } = useLoginStatus()

  const { isLoggedIn, loading } = useIsLoggedIn();

  // useEffect(() => {
  //   const checkLoginStatus = () => {
  //     if (!status) return;
  
  //     // Logged out users -> only home page or login pages
  //     if (status === "loggedOut") {
  //       if (pathname !== "/" && !pathname.endsWith("/login")) {
  //         route.push("/");
  //       }
  //     } 
  //     // Regular user -> cannot access admin/storefront pages
  //     else if (status === "user") {
  //       const isForbiddenPage =
  //         (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) ||
  //         (pathname.startsWith("/storefront") && !pathname.startsWith("/storefront/login"));
  
  //       if (isForbiddenPage) {
  //         route.push("/marketplace");
  //       }
  //     } 
  //     // Storefront user -> cannot access anything outside /storefront, except login
  //     else if (status === "storefront") {
  //       const isOutsideStorefront = !pathname.startsWith("/storefront");
  //       if (isOutsideStorefront) {
  //         route.push("/storefront/dashboard");
  //       }
  //     } 
  //     // Admin user -> cannot access anything outside /admin, except login
  //     else if (status === "admin") {
  //       const isOutsideAdmin = !pathname.startsWith("/admin");
  //       if (isOutsideAdmin) {
  //         route.push("/admin/dashboard");
  //       }
  //     }
  //   };
  
  //   checkLoginStatus();
  // }, [status, pathname, route]);
  
  

  const navLinks = [
    { href: "/storefront/login", label: "Storefront" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/wallet", label: "Wallet" },
    { href: "/membership", label: "Membership" },
    { href: "/about", label: "About" },
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
      <div className="relative">
        {/* Glassy Container */}
        <nav className="relative flex items-center justify-between py-4 px-6 lg:px-8 rounded-full glass-effect">
          {/* Logo and Brand */}
          <Link
            href="/"
            className="text-white text-xl font-bold flex items-center gap-3 hover:text-[#39FF14] transition-colors duration-300"
          >
            <Image
              src="/logo.jpg"
              alt="RippleBids Logo"
              width={45}
              height={45}
              className="rounded-full border-2 border-transparent hover:border-[#39FF14]"
            />
            <span className="font-[var(--font-space-grotesk)]">RippleBids</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-[#39FF14] transition-all duration-300 hover:shadow-[0_0_10px_#39FF14] px-3 py-1 rounded-md"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Button - Desktop */}
          {!loading && (
            <button
              className="hidden lg:block bg-[#1a1a1a]/50 text-[#39FF14] px-6 py-2 rounded-full border border-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-all duration-300 hover:shadow-[0_0_15px_#39FF14] font-[var(--font-space-grotesk)]"
              onClick={() => {
                if (isLoggedIn) {
                  logout();
                  route.push("/auth/login");
                } else {
                  route.push("/auth/login");
                }
              }}
            >
              {isLoggedIn ? "Logout" : "Sign In"}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2"
          >
            {isOpen ? (
              <span className="text-2xl">×</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </nav>

        {/* Mobile Menu - Floating Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-[90%] mt-4 rounded-2xl glass-effect-darker py-4 px-6 lg:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-white hover:text-[#39FF14] transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Button - Mobile */}
            {!loading && (
              <button
                className="w-full mt-4 bg-[#1a1a1a]/50 text-[#39FF14] px-6 py-2 rounded-full border border-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-all duration-300"
                onClick={() => {
                  setIsOpen(false);
                  if (isLoggedIn) {
                    logout();
                    route.push("/auth/login");
                  } else {
                    route.push("/auth/login");
                  }
                }}
              >
                {isLoggedIn ? "Logout" : "Sign In"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
