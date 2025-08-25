"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { metaMask } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { ethers } from "ethers";

const MetamaskContext = createContext(null);

// ✅ ERC20 ABI (for USDT balance)
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// ✅ Define Ethereum Mainnet
const ethereumMainnet = defineChain({
  id: 1,
  name: "Ethereum Mainnet",
  network: "ethereum",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://eth-mainnet.g.alchemy.com/v2/demo"],
    },
    public: {
      http: ["https://cloudflare-eth.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
  },
});

// Wagmi config
const config = createConfig({
  chains: [ethereumMainnet],
  connectors: [metaMask()],
  transports: {
    [ethereumMainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

const MetamaskProviderInner = ({ children }) => {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  // ✅ State for balances
  const [ethBalance, setEthBalance] = useState("0");
  const [usdtBalance, setUsdtBalance] = useState("0");

  // Auto-switch to Ethereum if on wrong network
  useEffect(() => {
    if (isConnected && address && chain && chain.id !== 1) {
      switchToEthereum();
    }
  }, [isConnected, address, chain]);

  // ✅ Fetch balances whenever wallet changes
  useEffect(() => {
    if (isConnected && address) {
      fetchBalances(address);
    } else {
      setEthBalance("0");
      setUsdtBalance("0");
    }
  }, [isConnected, address]);

  const fetchBalances = async (walletAddress) => {
    try {
      const provider = new ethers.JsonRpcProvider("https://cloudflare-eth.com");

      // ETH Balance
      const balance = await provider.getBalance(walletAddress);
      setEthBalance(ethers.formatEther(balance));

      // USDT Balance (mainnet contract address)
      const usdtContract = new ethers.Contract(
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        ERC20_ABI,
        provider
      );

      const decimals = await usdtContract.decimals();
      const rawBalance = await usdtContract.balanceOf(walletAddress);
      setUsdtBalance(Number(rawBalance) / 10 ** decimals);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const connectMetamaskWallet = async () => {
    try {
      const preferredConnector =
        connectors.find((c) => c.id === "metaMaskSDK") || connectors[0];
      if (!preferredConnector) throw new Error("No suitable connector found");
      connect({ connector: preferredConnector });
    } catch (error) {
      console.error("Connection error:", error);
      alert(`Failed to connect wallet: ${error.message || error}`);
    }
  };

  const switchToEthereum = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: 1 });
        return;
      }
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }],
        });
      }
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

  const disconnectMetamaskWallet = () => disconnect();

  const getSigner = async () => {
    if (!walletClient) throw new Error("Wallet not connected");
    const provider = new ethers.BrowserProvider(walletClient);
    return await provider.getSigner();
  };

  const value = {
    metamaskWalletAddress: address,
    evmWallet: address,
    isConnected,
    connecting: isConnecting,
    currentChain: chain,
    isEthereum: chain?.id === 1,
    connectMetamaskWallet,
    disconnectMetamaskWallet,
    switchToEthereum,
    getSigner,
    walletClient,
    ethBalance, // ✅ now available
    usdtBalance, // ✅ now available
  };

  return (
    <MetamaskContext.Provider value={value}>
      {children}
    </MetamaskContext.Provider>
  );
};

export const MetamaskProvider = ({ children }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <MetamaskProviderInner>{children}</MetamaskProviderInner>
    </QueryClientProvider>
  </WagmiProvider>
);

export const useMetamask = () => {
  const context = useContext(MetamaskContext);
  if (!context) {
    throw new Error("useMetamask must be used within a MetamaskProvider");
  }
  return context;
};
