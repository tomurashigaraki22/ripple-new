"use client"

import React, { createContext, useContext, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { custom, defineChain } from 'viem';
import { metaMask, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import { BrowserProvider, ethers } from 'ethers';
import { mainnet } from 'wagmi/chains'; // Add this import

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

// Updated Wagmi configuration - include Ethereum mainnet
const config = createConfig({
  chains: [mainnet, xrplEvmTestnet, xrplEvmMainnet], // Add mainnet here
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(), // Add Ethereum mainnet transport
    [xrplEvmTestnet.id]: http("https://rpc.testnet.xrplevm.org"),
    [xrplEvmMainnet.id]: http("https://rpc.xrplevm.org"),
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

  // Auto-switch to XRPL EVM when connected but on wrong network (only for XRPL EVM payments)
  useEffect(() => {
    // Remove auto-switching logic as it interferes with Ethereum payments
    // Users should manually select the correct network for their payment method
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

  // Add function to switch to Ethereum mainnet
  const switchToEthereumMainnet = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: 1 }); // Ethereum mainnet chain ID
        console.log("Switched to Ethereum Mainnet via Wagmi");
        return;
      }

      // Fallback to direct MetaMask call
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }], // Ethereum mainnet
        });
        console.log("Successfully switched to Ethereum Mainnet");
      }
    } catch (error) {
      console.error("Failed to switch to Ethereum Mainnet:", error);
      throw new Error("Failed to switch to Ethereum Mainnet. Please switch manually in MetaMask.");
    }
  };

  const switchToXRPLEVM = async () => {
    try {
      const chainIdHex = "0x161c28"; // XRPL-EVM Testnet (1449000)
      // const chainIdHex = "0x15f900"; // XRPL-EVM Mainnet (1440000)

      if (switchChain) {
        await switchChain({ chainId: 1440000 }); 
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
                rpcUrls: ["https://rpc.testnet.xrplevm.org"],
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
    try {
      if (walletClient) {
        // Convert viem WalletClient -> ethers provider
        const provider = new ethers.BrowserProvider(walletClient.transport);
        const signer = await provider.getSigner();
        console.log("Signer created from walletClient");
        return signer;
      }

      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        console.log("Signer created from window.ethereum");
        return signer;
      }

      throw new Error("Wallet not connected");
    } catch (err) {
      console.error("getSigner failed:", err);
      throw err;
    }
  };

  const value = {
    metamaskWalletAddress: address,
    evmWallet: address,
    isConnected,
    connecting: isConnecting,
    currentChain: chain,
    isXRPLEVM: chain?.id === 1440000 || chain?.id === 1449000,
    isEthereumMainnet: chain?.id === 1,
    connectMetamaskWallet,
    disconnectMetamaskWallet,
    switchToXRPLEVM,
    switchToEthereumMainnet, // Add this new function
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
