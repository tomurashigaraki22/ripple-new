// app/components/Maintenance.jsx
"use client";

import { usePathname } from "next/navigation";

export default function MaintenanceBanner({ isActive }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null; // Exclude admin routes
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/50">
      <div className="bg-[#111111] text-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-white/10">
        <svg
          className="w-12 h-12 text-[#39FF14] mx-auto mb-4"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 2v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 6l1.5 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="text-xl font-semibold mb-2">🚧 Site Under Maintenance</h2>
        <p className="text-gray-400 text-sm mb-4">
          Some features may be temporarily unavailable. <br />
          We’ll be back shortly.
        </p>
        <div className="text-sm text-gray-400">
          Status:{" "}
          <span className="ml-1 font-medium text-[#39FF14]">Maintenance</span>
        </div>
      </div>
    </div>
  );
}
