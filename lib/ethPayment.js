// lib/ethPayment.js
import { ethers } from "ethers";

/**
 * Send Ethereum (ETH) or ERC20 token payment using a Wagmi/Ethers signer.
 *
 * @param {Function} getSignerFn - async function that returns an ethers Signer (e.g. from your provider: getSigner()).
 * @param {string|number} amount - Amount in human-readable token units (e.g. "1.5" ETH or "12.345" tokens).
 * @param {Object} options
 *   - recipient (string) REQUIRED: destination address
 *   - tokenAddress (string|null) optional: ERC20 token contract address. If null, send native ETH.
 *   - tokenSymbol (string) optional: readable token name (for logging / UI).
 *   - tokenDecimals (number|undefined) optional: force decimals (otherwise will call contract.decimals()).
 *   - rpcExplorerBase (string) optional: explorer tx url base (default etherscan mainnet).
 *   - signerTimeoutMs (number) optional: timeout for obtaining signer (default 10_000ms).
 *   - confirmTimeoutMs (number) optional: timeout waiting for tx confirmation (default 60_000ms desktop, 120_000ms mobile).
 *
 * @returns {Promise<Object>} { success: boolean, txHash?, paymentData?, error?, redirected?, message? }
 */
export const sendEthereumPayment = async (getSignerFn, amount, options = {}) => {
  const {
    recipient,
    tokenAddress = null,
    tokenSymbol = tokenAddress ? "TOKEN" : "ETH",
    tokenDecimals,
    rpcExplorerBase = "https://etherscan.io/tx/",
    signerTimeoutMs = 10000,
    confirmTimeoutMsMobile = 120000,
    confirmTimeoutMsDesktop = 60000,
  } = options;

  // Helpers
  const isMobile = () => {
    if (typeof navigator === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const isInMetaMaskBrowser = () => {
    if (typeof navigator === "undefined") return false;
    // MetaMask mobile dapp browser adds "MetaMask" to userAgent sometimes.
    return /MetaMask/i.test(navigator.userAgent) || (window?.ethereum && window.ethereum.isMetaMask && window.ethereum.isMetaMask === true && /MetaMask/i.test(navigator.userAgent));
  };

  const formatError = (e) => {
    try {
      return e?.message || String(e);
    } catch {
      return String(e);
    }
  };

  try {
    // Basic option validation
    if (!recipient) throw new Error("Recipient address is required (options.recipient).");
    if (!amount && amount !== 0) throw new Error("Amount is required.");

    // Validate amount presence
    if (amount === "" || amount === null || amount === undefined) {
      throw new Error("Payment amount cannot be empty.");
    }

    // Normalize and validate amount string
    const rawAmountStr = String(amount).trim();
    if (!rawAmountStr || rawAmountStr === "null" || rawAmountStr === "undefined") {
      throw new Error("Invalid payment amount format. Please refresh and try again.");
    }

    const parsedAmount = parseFloat(rawAmountStr.replace(/,/g, "")); // remove thousands commas if any
    if (isNaN(parsedAmount) || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error(`Invalid payment amount: ${rawAmountStr}`);
    }

    // If mobile and not inside MetaMask dapp browser, propose deep link to MetaMask mobile
    if (isMobile() && !isInMetaMaskBrowser()) {
      const proceed = typeof window !== "undefined" && window.confirm(
        `To complete this transaction, you'll be redirected to MetaMask mobile app (dApp browser). Continue?`
      );
      if (proceed) {
        // Save intent to resume later
        const intent = {
          type: tokenAddress ? "erc20_payment" : "eth_payment",
          recipient,
          amount: parsedAmount,
          tokenAddress,
          tokenSymbol,
          timestamp: Date.now(),
        };
        try { localStorage.setItem("pending_payment_intent", JSON.stringify(intent)); } catch (e) { /* ignore */ }

        // Deep-link to MetaMask mobile dapp browser using current host
        try {
          const host = typeof window !== "undefined" ? window.location.host : "dapp";
          const deepLink = `https://metamask.app.link/dapp/${host}`;
          window.location.href = deepLink;
          return { success: false, redirected: true, message: "Redirected to MetaMask mobile dApp browser" };
        } catch (err) {
          return { success: false, error: "Failed to open MetaMask deep link", details: formatError(err) };
        }
      } else {
        return { success: false, error: "Payment cancelled by user" };
      }
    }

    // Obtain signer with timeout
    if (!getSignerFn || typeof getSignerFn !== "function") {
      throw new Error("getSignerFn must be a function that returns a Signer.");
    }

    let signer;
    try {
      const signerPromise = getSignerFn();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Signer acquisition timeout")), signerTimeoutMs)
      );
      signer = await Promise.race([signerPromise, timeoutPromise]);
    } catch (err) {
      throw new Error("Failed to get wallet signer. Please reconnect your wallet and try again.");
    }

    if (!signer) throw new Error("Signer not available.");

    // Ensure signer has getAddress and sendTransaction / ability to interact
    if (typeof signer.getAddress !== "function") {
      // sometimes wagmi returns provider-like object; try to wrap with ethers.BrowserProvider
      throw new Error("Invalid signer object returned. Ensure getSignerFn returns an ethers Signer.");
    }
    const fromAddress = await signer.getAddress();

    console.log("🔔 Ethereum payment starting", { from: fromAddress, to: recipient, amount: parsedAmount, tokenAddress });

    // Prepare tx
    let txResponse;
    let tokenAmountBigInt;

    if (!tokenAddress) {
      // Native ETH payment
      let valueBigInt;
      try {
        // parseEther returns bigint
        valueBigInt = ethers.parseEther(parsedAmount.toString());
      } catch (err) {
        // fallback manual BigInt (rare)
        try {
          const parts = parsedAmount.toString().split(".");
          const whole = BigInt(parts[0] || "0");
          const fraction = parts[1] ? parts[1].padEnd(18, "0").slice(0, 18) : "0".repeat(18);
          const fracBig = BigInt(fraction);
          const multiplier = BigInt(10) ** BigInt(18);
          valueBigInt = whole * multiplier + fracBig;
        } catch (err2) {
          throw new Error("Failed to parse ETH amount for sending.");
        }
      }

      if (valueBigInt <= 0n) throw new Error("ETH amount must be greater than zero.");

      // send transaction
      try {
        txResponse = await signer.sendTransaction({
          to: recipient,
          value: valueBigInt
        });
      } catch (sendErr) {
        const em = formatError(sendErr);
        if (em.includes("insufficient funds")) {
          throw new Error("Insufficient ETH balance to complete this transaction (including gas).");
        }
        throw new Error(`Failed to send ETH: ${em}`);
      }
    } else {
      // ERC20 token payment
      const ERC20_ABI = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      // create contract connected to signer
      let tokenContract;
      try {
        tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      } catch (err) {
        throw new Error("Failed to create token contract instance.");
      }

      // determine decimals
      let decimals = tokenDecimals;
      if (decimals === undefined || decimals === null) {
        try {
          const d = await tokenContract.decimals();
          decimals = Number(d);
          if (!Number.isInteger(decimals) || decimals < 0 || decimals > 77) {
            throw new Error("Invalid token decimals returned from contract");
          }
        } catch (err) {
          console.warn("Failed to read token decimals from contract, defaulting to 18", err);
          decimals = 18;
        }
      }

      // parse token amount to smallest units (bigint)
      try {
        tokenAmountBigInt = ethers.parseUnits(parsedAmount.toString(), decimals);
      } catch (parseErr) {
        // fallback: manual BigInt conversion
        try {
          const multiplier = BigInt(10) ** BigInt(decimals);
          const wholePart = BigInt(Math.floor(parsedAmount));
          const decimalPart = BigInt(Math.round((parsedAmount - Math.floor(parsedAmount)) * Number(multiplier)));
          tokenAmountBigInt = wholePart * multiplier + decimalPart;
        } catch (fallbackErr) {
          const msg = formatError(parseErr);
          if (msg.includes("BigNumberish") || msg.includes("invalid BigNumber")) {
            throw new Error("Invalid token amount format. Please try again.");
          }
          throw new Error("Failed to parse token amount.");
        }
      }

      if (!tokenAmountBigInt || tokenAmountBigInt <= 0n) {
        throw new Error("Token amount must be greater than zero.");
      }

      // Execute transfer
      try {
        txResponse = await tokenContract.transfer(recipient, tokenAmountBigInt);
      } catch (transferErr) {
        const em = formatError(transferErr);
        if (em.includes("insufficient funds") || em.includes("insufficient balance")) {
          throw new Error("Insufficient token balance or insufficient ETH to pay gas.");
        }
        if (em.includes("BigNumberish") || em.includes("invalid BigNumber")) {
          throw new Error("Token amount processing failed. Try refreshing and re-entering the amount.");
        }
        throw new Error(`Transfer failed: ${em}`);
      }
    }

    if (!txResponse || !txResponse.hash) {
      throw new Error("Transaction was not initiated correctly.");
    }

    // Wait for confirmation with timeout
    const confirmationTimeoutMs = isMobile() ? confirmTimeoutMsMobile : confirmTimeoutMsDesktop;
    let receipt;
    try {
      const waitPromise = txResponse.wait();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Transaction confirmation timeout")), confirmationTimeoutMs)
      );
      receipt = await Promise.race([waitPromise, timeoutPromise]);
    } catch (waitErr) {
      // Timeout - still return success but mark pending
      if (String(waitErr)?.toLowerCase()?.includes("timeout")) {
        const pendingData = {
          blockchain: "ethereum",
          token: tokenAddress ? tokenSymbol : "ETH",
          from: fromAddress,
          to: recipient,
          amount: parsedAmount,
          txHash: txResponse.hash,
          timestamp: new Date().toISOString(),
          explorerUrl: `${rpcExplorerBase}${txResponse.hash}`,
          status: "pending_confirmation"
        };
        try { localStorage.setItem(`eth_payment_${txResponse.hash}`, JSON.stringify(pendingData)); } catch (e){/* ignore */ }

        return {
          success: true,
          txHash: txResponse.hash,
          paymentData: pendingData,
          warning: "Transaction sent but confirmation timed out. Check the explorer to verify.",
        };
      }
      throw new Error(`Error waiting for confirmation: ${formatError(waitErr)}`);
    }

    // Confirmed
    const paymentData = {
      blockchain: "ethereum",
      token: tokenAddress ? tokenSymbol : "ETH",
      from: fromAddress,
      to: recipient,
      amount: parsedAmount,
      txHash: txResponse.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : undefined,
      timestamp: new Date().toISOString(),
      explorerUrl: `${rpcExplorerBase}${txResponse.hash}`,
      status: "confirmed"
    };
    try { localStorage.setItem(`eth_payment_${txResponse.hash}`, JSON.stringify(paymentData)); } catch (e){/* ignore */ }

    return { success: true, txHash: txResponse.hash, paymentData };
  } catch (error) {
    console.error("Ethereum payment failed:", error);
    return { success: false, error: error?.message || String(error) };
  }
};

