"use client";

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect
} from "react";
import { WalletProvider, useWallet as useSuietWallet } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

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
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const wallet = useSuietWallet();
  
  // Initialize Sui client
  const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

  useEffect(() => {
    setIsMobileDevice(isMobile());
    setIsInWalletBrowser(isInSlushWallet());
  }, []);

  useEffect(() => {
    if (wallet.connected) {
      setAddress(wallet.account?.address || null);
      fetchBalance();
    } else {
      setAddress(null);
      setBalance(0);
    }
  }, [wallet.connected, wallet.account]);

  const fetchBalance = async () => {
    if (!wallet.account?.address) return;
    
    try {
      const balance = await suiClient.getBalance({
        owner: wallet.account.address,
      });
      setBalance(parseInt(balance.totalBalance) / 1000000000); // Convert from MIST to SUI
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

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

  // Transfer SUI tokens
  const transferSui = async (recipient, amount) => {
    if (!wallet.connected || !wallet.account?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      const tx = new TransactionBlock();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount * 1000000000)]); // Convert SUI to MIST
      tx.transferObjects([coin], tx.pure.address(recipient));

      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      await fetchBalance(); // Refresh balance after transaction
      return result;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Execute a custom transaction
  const executeTransaction = async (transaction) => {
    if (!wallet.connected || !wallet.account?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      const result = await wallet.signAndExecuteTransaction({
        transaction,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      await fetchBalance(); // Refresh balance after transaction
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Move call function for smart contract interactions
  const moveCall = async (packageId, module, functionName, args = [], typeArgs = []) => {
    if (!wallet.connected || !wallet.account?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::${module}::${functionName}`,
        arguments: args,
        typeArguments: typeArgs,
      });

      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      await fetchBalance(); // Refresh balance after transaction
      return result;
    } catch (error) {
      console.error('Move call failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get owned objects
  const getOwnedObjects = async (objectType = null) => {
    if (!wallet.account?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const options = {
        owner: wallet.account.address,
        options: {
          showType: true,
          showContent: true,
          showOwner: true,
        },
      };

      if (objectType) {
        options.filter = { StructType: objectType };
      }

      const result = await suiClient.getOwnedObjects(options);
      return result.data;
    } catch (error) {
      console.error('Error fetching owned objects:', error);
      throw error;
    }
  };

  // Get transaction history
  const getTransactionHistory = async (limit = 10) => {
    if (!wallet.account?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await suiClient.queryTransactionBlocks({
        filter: {
          FromAddress: wallet.account.address,
        },
        limit,
        options: {
          showEffects: true,
          showInput: true,
        },
      });
      return result.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  };

  // Create a payment transaction for marketplace
  const createPaymentTransaction = async (recipient, amount, memo = '') => {
    const tx = new Transaction();
    
    if (memo) {
      // Add memo as a move call or object if needed
      // This depends on your specific marketplace contract
    }
    
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount * 1000000000)]);
    tx.transferObjects([coin], tx.pure.address(recipient));
    
    return tx;
  };

  // Execute payment with marketplace-specific logic
  const executePayment = async (recipient, amount, memo = '') => {
    try {
      const tx = await createPaymentTransaction(recipient, amount, memo);
      return await executeTransaction(tx);
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  };

  const value = {
    address,
    suiAddress: address,
    connected: wallet.connected,
    isConnected: wallet.connected,
    connecting: wallet.connecting,
    balance,
    account: wallet.account,
    isMobileDevice,
    isInWalletBrowser,
    loading,
    connect,
    disconnect,
    suiClient,
    executeTransaction,
    transferSui,
    moveCall,
    getOwnedObjects,
    getTransactionHistory,
    createPaymentTransaction,
    executePayment,
    fetchBalance,
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