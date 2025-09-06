"use client";

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect
} from "react";
import { WalletProvider, useWallet as useSuietWallet } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";

const SuiContext = createContext(null);

// Mobile detection utility
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if we're in Slush wallet's dapp browser
const isInSlushWallet = () => {
  if (typeof window === 'undefined') return false;
  return window.navigator.userAgent.includes('SlushWallet') || 
         window.location.href.includes('slush') ||
         window.suiWallet !== undefined;
};

function SuiContextContent({ children }) {
  const [address, setAddress] = useState(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isInWalletBrowser, setIsInWalletBrowser] = useState(false);
  const wallet = useSuietWallet();

  useEffect(() => {
    setIsMobileDevice(isMobile());
    setIsInWalletBrowser(isInSlushWallet());
  }, []);

  useEffect(() => {
    if (wallet.connected) {
      setAddress(wallet.account?.address || null);
    } else {
      setAddress(null);
    }
  }, [wallet.connected, wallet.account]);

  const connect = async () => {
    try {
      // If on mobile and not in wallet browser, redirect to Slush wallet
      if (isMobileDevice && !isInWalletBrowser) {
        const currentUrl = encodeURIComponent(window.location.href);
        const slushDeepLink = `slush://dapp?url=${currentUrl}`;
        const slushWebLink = `https://slush.so/dapp?url=${currentUrl}`;
        
        // Try deep link first, fallback to web link
        window.location.href = slushDeepLink;
        
        // Fallback after a short delay
        setTimeout(() => {
          window.open(slushWebLink, '_blank');
        }, 1000);
        
        return;
      }
      
      // Normal wallet connection for desktop or when in wallet browser
      await wallet.select("Slush");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      
      // If wallet selection fails on mobile, try alternative approach
      if (isMobileDevice) {
        const currentUrl = encodeURIComponent(window.location.href);
        const slushWebLink = `https://slush.so/dapp?url=${currentUrl}`;
        window.open(slushWebLink, '_blank');
      }
    }
  };

  const disconnect = () => {
    try {
      wallet.disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const value = {
    address,
    suiAddress: address,
    connected: wallet.connected,
    isConnected: wallet.connected,
    connecting: wallet.connecting,
    balance: wallet.balance || 0,
    account: wallet.account,
    isMobileDevice,
    isInWalletBrowser,
    connect,
    disconnect,
    // Keep compatibility with existing code
    suiClient: wallet.adapter,
    executeTransaction: wallet.signAndExecuteTransactionBlock,
    transferSui: async (recipient, amount) => {
      throw new Error("Transfer function needs to be implemented based on wallet adapter");
    },
    getOwnedObjects: async (objectType = null) => {
      throw new Error("getOwnedObjects function needs to be implemented based on wallet adapter");
    },
    getTransactionHistory: async (limit = 10) => {
      throw new Error("getTransactionHistory function needs to be implemented based on wallet adapter");
    }
  };

  return (
    <SuiContext.Provider value={value}>{children}</SuiContext.Provider>
  );
}

export function SuiProvider({ children }) {
  return (
    <WalletProvider>
      <SuiContextContent>{children}</SuiContextContent>
    </WalletProvider>
  );
}

export const useSui = () => {
  const context = useContext(SuiContext);
  if (!context) {
    throw new Error("useSui must be used within a SuiProvider");
  }
  return context;
};

export default SuiContext;