"use client"

import React, { createContext, useContext, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { custom, defineChain } from 'viem';
import { metaMask, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import { BrowserProvider, ethers } from 'ethers';

const MetamaskContext = createContext(null);

// Define XRPL EVM Sidechain Testnet with CORRECT configuration
const xrplEvmMainnet = defineChain({
  id: 1440000, // XRPL EVM Testnet chain ID
  name: 'XRPL EVM Sidechain Mainnet',
  network: 'xrpl-evm-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XRP',
    symbol: 'XRP',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.xrplevm.org'],
    },
    public: {
      http: ['https://rpc.xrplevm.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'XRPL EVM Explorer',
      url: 'https://explorer.xrplevm.org',
    },
  },
});

const xrplEvmTestnet = defineChain({
  id: 1449000,
  name: 'XRPL EVM Sidechain Testnet',
  network: 'xrpl-evm-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XRP',
    symbol: 'XRP',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.xrplevm.org'],
    },
    public: {
      http: ['https://rpc.testnet.xrplevm.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'XRPL EVM Testnet Explorer',
      url: 'https://explorer.testnet.xrplevm.org',
    },
  },
});


// Helper function to detect mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Simplified Wagmi configuration - only injected connector
const config = createConfig({
  chains: [xrplEvmTestnet, xrplEvmMainnet],
  connectors: [metaMask()],
  transports: {
    [xrplEvmTestnet.id]: http("https://rpc.testnet.xrplevm.org"),  // ✅ explicit RPC
    [xrplEvmMainnet.id]: http("https://rpc.xrplevm.org"),          // ✅ explicit RPC
  },
});

const queryClient = new QueryClient();


// Inner component that uses Wagmi hooks
const MetamaskProviderInner = ({ children }) => {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  // Auto-switch to XRPL EVM when connected but on wrong network
  useEffect(() => {
    if (isConnected && address && chain && chain.id !== 1440000) {
      console.log('Connected to wrong network, switching to XRPL EVM testnet...: ', chain.id);
      switchToXRPLEVM();
    }
  }, [isConnected, address, chain]);

const connectMetamaskWallet = async () => {
  try {
    const preferredConnector = connectors.find((c) => c.id === 'metaMaskSDK');

    if (!preferredConnector) {
      throw new Error('No suitable connector found');
    }

    connect({ connector: preferredConnector });
  } catch (error) {
    console.error("Connection error:", error);
    alert(`Failed to connect wallet: ${error.message || error}`);
    throw error;
  }
};


const switchToXRPLEVM = async () => {
  try {
    const chainIdHex = "0x161c28"; // XRPL-EVM Testnet (1449000)
    // const chainIdHex = "0x15f900"; // XRPL-EVM Mainnet (1440000)

    if (switchChain) {
      await switchChain({ chainId: parseInt(chainIdHex, 16) }); 
      console.log("Switched to XRPL-EVM Testnet via Wagmi");
      return;
    }

    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
        console.log("Successfully switched to XRPL-EVM Testnet");
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: chainIdHex,
              chainName: "XRPL EVM Sidechain Testnet",
              nativeCurrency: {
                name: "XRP",
                symbol: "XRP",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.testnet.xrplevm.org"],  // ✅ FIXED
              blockExplorerUrls: ["https://explorer.testnet.xrplevm.org"],
            }],
          });
          console.log("Added + switched to XRPL-EVM Testnet");
        } else {
          throw switchError;
        }
      }
    }
  } catch (error) {
    console.error("Failed to switch:", error);
    alert("Please switch manually in your wallet.");
  }
};


  const disconnectMetamaskWallet = () => {
    disconnect();
  };

  // Create ethers signer from wallet client

const getSigner = async () => {
  // First check if we have a wallet client from Wagmi
  if (!walletClient) {
    console.log('No wallet client from Wagmi, checking direct connection...');
    
    // Fallback: Check if MetaMask is available directly
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access if needed
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          // Try to connect if no accounts
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        
        // Create provider directly from window.ethereum
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        console.log('Created signer via direct ethereum provider');
        return signer;
      } catch (error) {
        console.error('Direct ethereum provider failed:', error);
      }
    }
    
    throw new Error('Wallet not connected - please connect your wallet first');
  }

  try {
    // Convert viem WalletClient to ethers provider
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    console.error('Failed to create signer from wallet client:', error);
    
    // Fallback to direct ethereum provider
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return signer;
      } catch (fallbackError) {
        console.error('Fallback provider also failed:', fallbackError);
      }
    }
    
    throw new Error('Unable to create signer - wallet connection issue');
  }
};

  const value = {
    metamaskWalletAddress: address,
    evmWallet: address,
    isConnected,
    connecting: isConnecting,
    currentChain: chain,
    isXRPLEVM: chain?.id === 1440000 || chain?.id === 1449000,
    connectMetamaskWallet,
    disconnectMetamaskWallet,
    switchToXRPLEVM,
    getSigner,
    switchChain,
    walletClient,
  };

  return (
    <MetamaskContext.Provider value={value}>
      {children}
    </MetamaskContext.Provider>
  );
};

export const MetamaskProvider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MetamaskProviderInner>
          {children}
        </MetamaskProviderInner>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const useMetamask = () => {
  const context = useContext(MetamaskContext);
  if (!context) {
    throw new Error('useMetamask must be used within a MetamaskProvider');
  }
  return context;
};
