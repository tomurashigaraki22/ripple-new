// app/layout.jsx (or app/layout.js)
import { Space_Grotesk, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import MaintenanceBanner from "./components/Maintenance"; // client component
import SmoothScrollProvider from "./components/SmoothScroll";
import { XRPLProvider } from "./contexts/XRPLContext";
import { MetamaskProvider } from "./contexts/MetaMaskContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const sourceCode = Source_Code_Pro({
  variable: "--font-source-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "RippleBids | Web3 Marketplace",
  description: "A decentralized marketplace for buying and selling",
  keywords: ["marketplace", "web3", "blockchain", "crypto"],
};

const SETTINGS_URL = "https://ripple-flask-server.onrender.com/admin/settings/api/admin/settings/status";

export default async function RootLayout({ children }) {
  let isMaintenance = false;

  try {
    // server-side fetch; use no-store so toggles are reflected immediately
    const res = await fetch(SETTINGS_URL, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      isMaintenance = !!data.is_maintenance;
    } else {
      console.warn("Maintenance status fetch returned", res.status);
    }
  } catch (err) {
    console.error("Error fetching maintenance status:", err);
  }

  
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${sourceCode.variable} antialiased`}>
        <AuthProvider>
          <XRPLProvider>
            <MetamaskProvider>
          {/* <SmoothScrollProvider> */}
            {/* Banner rendered server-side (component is client but receives prop) */}
            <MaintenanceBanner isActive={isMaintenance} />
            <Navbar />
            {children}
            <Footer />
          {/* </SmoothScrollProvider> */}
          </MetamaskProvider>
          </XRPLProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
