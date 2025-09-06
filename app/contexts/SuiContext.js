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

function SuiContextContent({ children }) {
  const [address, setAddress] = useState(null);
  const wallet = useSuietWallet();

  useEffect(() => {
    if (wallet.connected) {
      setAddress(wallet.account?.address || null);
    } else {
      setAddress(null);
    }
  }, [wallet.connected, wallet.account]);

  const connect = async () => {
    try {
      await wallet.select("Slush");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
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
    connect,
    disconnect,
    // Keep compatibility with existing code
    suiClient: wallet.adapter,
    executeTransaction: wallet.signAndExecuteTransactionBlock,
    transferSui: async (recipient, amount) => {
      // Implementation would depend on wallet capabilities
      throw new Error("Transfer function needs to be implemented based on wallet adapter");
    },
    getOwnedObjects: async (objectType = null) => {
      // Implementation would depend on wallet capabilities  
      throw new Error("getOwnedObjects function needs to be implemented based on wallet adapter");
    },
    getTransactionHistory: async (limit = 10) => {
      // Implementation would depend on wallet capabilities
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