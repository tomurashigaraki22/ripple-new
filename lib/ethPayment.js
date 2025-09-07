// lib/ethPayment.js
import { ethers } from "ethers";

/**
 * Send ETH/ERC20 payment on XRPL EVM (mainnet/testnet).
 *
 * @param {Function} getSignerFn - async function that returns an ethers Signer.
 * @param {string|number} amount - Amount in human-readable units.
 * @param {Object} options
 *   - recipient (string) REQUIRED: destination address
 *   - tokenAddress (string|null) optional: ERC20 token contract
 *   - tokenSymbol (string) optional: symbol
 *   - tokenDecimals (number) optional: decimals
 *   - network ("xrpl-evm-mainnet" | "xrpl-evm-testnet") REQUIRED
 *   - signerTimeoutMs (number) optional
 *   - confirmTimeoutMs (number) optional
 * @param {number} shippingFee - Shipping fee in USD
 *
 * @returns {Promise<Object>}
 */
export const sendEthereumPayment = async (getSignerFn, amount, options = {}, shippingFee = 0) => {
  const {
    recipient,
    tokenAddress = null,
    tokenSymbol = tokenAddress ? "TOKEN" : "ETH",
    tokenDecimals,
    network = "xrpl-evm-mainnet",
    signerTimeoutMs = 10000,
    confirmTimeoutMsMobile = 120000,
    confirmTimeoutMsDesktop = 60000,
  } = options;

  // XRPL EVM config
  const NETWORK_CONFIG = {
    "xrpl-evm-mainnet": {
      rpcUrl: "https://rpc.xrplevm.org",
      explorerBase: "https://explorer.xrplevm.org/tx/",
    },
    "ethereum-mainnet": {
      rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
      explorerBase: "https://etherscan.io/tx/",
    },
    "xrpl-evm-testnet": {
      rpcUrl: "https://rpc.testnet.xrplevm.org", // adjust if different
      explorerBase: "https://explorer.testnet.xrplevm.org/tx/",
    },
  };

  if (!NETWORK_CONFIG[network]) {
    throw new Error(`Unsupported XRPL EVM network: ${network}`);
  }

  const { explorerBase } = NETWORK_CONFIG[network];

  const isMobile = () =>
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const isInMetaMaskBrowser = () =>
    typeof navigator !== "undefined" &&
    (/MetaMask/i.test(navigator.userAgent) ||
      (window?.ethereum &&
        window.ethereum.isMetaMask &&
        /MetaMask/i.test(navigator.userAgent)));

  const formatError = (e) => {
    try {
      return e?.message || String(e);
    } catch {
      return String(e);
    }
  };

  try {
    if (!recipient) throw new Error("Recipient address is required.");
    if (!amount && amount !== 0) throw new Error("Amount is required.");

    const rawAmountStr = String(amount).trim();
    const parsedAmount = parseFloat(rawAmountStr.replace(/,/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error(`Invalid amount: ${rawAmountStr}`);
    }

    if (isMobile() && !isInMetaMaskBrowser()) {
      const proceed =
        typeof window !== "undefined" &&
        window.confirm(
          `To complete this transaction, you'll be redirected to MetaMask. Continue?`
        );
      if (proceed) {
        const intent = {
          type: tokenAddress ? "erc20_payment" : "eth_payment",
          recipient,
          amount: parsedAmount,
          tokenAddress,
          tokenSymbol,
          timestamp: Date.now(),
        };
        try {
          localStorage.setItem("pending_payment_intent", JSON.stringify(intent));
        } catch {}

        const host =
          typeof window !== "undefined" ? window.location.host : "dapp";
        window.location.href = `https://metamask.app.link/dapp/${host}`;
        return {
          success: false,
          redirected: true,
          message: "Redirected to MetaMask mobile dApp browser",
        };
      } else {
        return { success: false, error: "Payment cancelled by user" };
      }
    }

    // Acquire signer
    let signer;
    try {
      const signerPromise = getSignerFn();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Signer acquisition timeout")), signerTimeoutMs)
      );
      signer = await Promise.race([signerPromise, timeoutPromise]);
    } catch {
      throw new Error("Failed to get wallet signer. Reconnect wallet and try again.");
    }
    if (!signer) throw new Error("Signer not available.");
    if (typeof signer.getAddress !== "function") {
      throw new Error("Invalid signer object returned.");
    }
    const fromAddress = await signer.getAddress();

    console.log("🔔 Payment starting", {
      from: fromAddress,
      to: recipient,
      amount: parsedAmount,
      tokenAddress,
      network,
      shippingFee
    });

    let txResponse;

    if (!tokenAddress) {
      // Native XRPL-EVM ETH payment
      const valueBigInt = ethers.parseEther(parsedAmount.toString());
      txResponse = await signer.sendTransaction({
        to: recipient,
        value: valueBigInt,
      });
    } else {
      // ERC20 token payment
      const ERC20_ABI = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ];
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

      let decimals = tokenDecimals;
      if (!decimals) {
        try {
          decimals = Number(await tokenContract.decimals());
        } catch {
          decimals = 18;
        }
      }
      const tokenAmountBigInt = ethers.parseUnits(parsedAmount.toString(), decimals);
      txResponse = await tokenContract.transfer(recipient, tokenAmountBigInt);
    }

    if (!txResponse || !txResponse.hash) {
      throw new Error("Transaction initiation failed.");
    }

    // Confirmation wait
    const confirmationTimeoutMs = isMobile()
      ? confirmTimeoutMsMobile
      : confirmTimeoutMsDesktop;

    let receipt;
    try {
      const waitPromise = txResponse.wait();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Confirmation timeout")), confirmationTimeoutMs)
      );
      receipt = await Promise.race([waitPromise, timeoutPromise]);
    } catch (waitErr) {
      if (String(waitErr).toLowerCase().includes("timeout")) {
        return {
          success: true,
          txHash: txResponse.hash,
          paymentData: {
            blockchain: "xrpl-evm",
            network,
            from: fromAddress,
            to: recipient,
            amount: parsedAmount,
            txHash: txResponse.hash,
            blockNumber: receipt.blockNumber,
            status: "confirmed",
            explorerUrl: `${explorerBase}${txResponse.hash}`,
            shipping_info: {
              fee: shippingFee,
              currency: "USD"
            }
          },
        };
      }
      throw waitErr;
    }

    return {
      success: true,
      txHash: txResponse.hash,
      paymentData: {
        blockchain: "xrpl-evm",
        network,
        from: fromAddress,
        to: recipient,
        amount: parsedAmount,
        txHash: txResponse.hash,
        blockNumber: receipt.blockNumber,
        status: "confirmed",
        explorerUrl: `${explorerBase}${txResponse.hash}`,
      },
    };
  } catch (error) {
    console.error("Payment failed:", error);
    return { success: false, error: error?.message || String(error) };
  }
};
