"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname()


  // if pathname includes "storefront", don’t render footer
  if (pathname?.includes("storefront")) return null;
  if (pathname?.includes("admin")) return null;
  return (
    <footer className="bg-[#111111] text-white py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#39FF14]">RippleBids</h3>
            <p className="text-gray-400">
              The next generation decentralized marketplace for assets.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/marketplace" className="text-gray-400 hover:text-[#39FF14]">Marketplace</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-[#39FF14]">About</Link></li>
              <li><Link href="/auth/login" className="text-gray-400 hover:text-[#39FF14]">Sign In</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/legal/terms" className="text-gray-400 hover:text-[#39FF14]">Terms Of Service</Link></li>
              <li><Link href="/legal/token" className="text-gray-400 hover:text-[#39FF14]">Token Allocation</Link></li>
              <li><Link href="/faqs" className="text-gray-400 hover:text-[#39FF14]">FAQ</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Community</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-[#39FF14]">Discord</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#39FF14]">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#39FF14]">Telegram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} RippleBids. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;