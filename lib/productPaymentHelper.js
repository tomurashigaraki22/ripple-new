// MAINNET XRPB Token Addresses
const XRPB_TOKENS = {
    solana: {
      mint: 'FJLz7hP4EXVMVnRBtP77V4k55t2BfXuajKQp1gcwpump', // Correct mainnet mint
      decimals: 6,
      network: 'mainnet-beta' // Changed to mainnet
    },
    xrpl: {
      currency: 'XRPB',
      issuer: 'rsEaYfqdZKNbD3SK55xzcjPm3nDrMj4aUT',
      network: 'mainnet',
      currencyDeets: '5852504200000000000000000000000000000000'
    },
    xrplEvm: {
      address: '0x6d8630D167458b337A2c8b6242c354d2f4f75D96',
      decimals: 18,
      network: 'mainnet',
      chainId: 1440000,
      rpcUrl: 'https://rpc.xrplevm.org'
    }
  };
  
  // Payment recipient addresses (mainnet)
  const PAYMENT_RECIPIENTS = {
    solana: 'H3Xri4JAdrz645q5iCaqK1BX4sVK6iZLGmKXKYEVUz3A', // Updated to your mainnet address
    xrpl: 'rpeh58KQ7cs76Aa2639LYT2hpw4D6yrSDq', 
    xrplEvm: '0x5716dD191878F342A72633665F852bd0534B9Bc1'
  };

/**
 * Send XRPL XRPB Payment via Xaman Wallet
 * @param {object} wallet - XRPL wallet object { account: string }
 * @param {string} destinationAddress - Destination XRPL address
 * @param {number|string} amount - Amount to send
 * @param {string} currency - Token currency hex or code
 * @param {string} issuer - Token issuer address
 */
export const sendXRPLXRPBPayment = async (wallet, destinationAddress, amount, currency, issuer) => {
    try {
      if (!wallet || !wallet.account) {
        throw new Error("XRPL Wallet not connected");
      }
  
      console.log("🔵 XRPL XRPB PAYMENT INITIATED (MAINNET)");
      console.log("From:", wallet.account);
      console.log("To:", destinationAddress);
      console.log("Amount:", amount, currency);
      console.log("Issuer:", issuer);
  
      // Build Xaman deep link payment request
      const paymentUrl = `https://xaman.app/detect/request:${destinationAddress}?amount=${amount}&currency=${currency}&issuer=${issuer}&network=mainnet`;
      console.log("🔗 Xaman Payment URL:", paymentUrl);
  
      // Open Xaman for signing
      if (typeof window !== "undefined") {
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  
        if (isIOS) {
          const userConfirmed = confirm(
            "You will be redirected to Xaman app to complete the payment. Continue?"
          );
          if (!userConfirmed) throw new Error("Payment cancelled by user");
          window.location.href = paymentUrl;
        } else {
          const newWindow = window.open(paymentUrl, "_blank");
          if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
            const userConfirmed = confirm(
              "Popup was blocked. Open payment page in current tab?"
            );
            if (!userConfirmed) throw new Error("Payment cancelled by user");
            window.location.href = paymentUrl;
          }
        }
      }
  
      console.log("⏳ Monitoring for XRPB payment completion...");
      
      // Monitor the XRPL for this payment
      const monitoringResult = await monitorXRPLXRPBTransactions(
        destinationAddress,
        parseFloat(amount),
        currency,
        issuer,
        300 // timeout in seconds
      );
  
      if (!monitoringResult.success) {
        throw new Error(monitoringResult.error || "XRPB payment monitoring failed");
      }
  
      console.log("✅ XRPL XRPB Payment Successful!");
      console.log("Transaction Hash:", monitoringResult.txHash);
  
      // Send tx info to backend for verification
      await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: monitoringResult.txHash,
          from: wallet.account,
          to: destinationAddress,
          amount: monitoringResult.actualAmount,
          currency: monitoringResult.currency,
          issuer: monitoringResult.issuer,
        }),
      });
  
      const explorerUrl = `https://livenet.xrpl.org/transactions/${monitoringResult.txHash}`;
      console.log("View on XRPL Explorer:", explorerUrl);
  
      return {
        success: true,
        txHash: monitoringResult.txHash,
        amount: monitoringResult.actualAmount,
        explorerUrl,
        paymentUrl,
      };
    } catch (error) {
      console.error("❌ XRPL XRPB Payment Failed:", error);
      return { success: false, error: error.message };
    }
  };
  /**
 * Monitor XRPL XRPB Token Transactions
 * @param {string} destinationAddress - Address to monitor
 * @param {number} expectedAmount - Expected payment amount
 * @param {string} currency - Token currency code
 * @param {string} issuer - Token issuer address
 * @param {number} timeoutSeconds - Monitoring timeout in seconds
 */
export const monitorXRPLXRPBTransactions = async (destinationAddress, expectedAmount, currency, issuer, timeoutSeconds = 300) => {
    try {
      console.log('🔍 Starting XRPL XRPB transaction monitoring...');
      console.log('Destination:', destinationAddress);
      console.log('Expected Amount:', expectedAmount, currency);
      console.log('Issuer:', issuer);
      
      const startTime = Date.now();
      const timeoutMs = timeoutSeconds * 1000;
      const checkInterval = 10000; // 10 seconds
      
      const rpcEndpoint = 'https://xrplcluster.com/';
      console.log('📡 Using XRPL mainnet endpoint:', rpcEndpoint);
      
      const monitorStartTime = new Date();
      
      while (Date.now() - startTime < timeoutMs) {
        try {
          console.log('🔄 Checking for new XRPB transactions...');
          
          const rpcRequest = {
            method: 'account_tx',
            params: [{
              account: destinationAddress,
              ledger_index_min: -1,
              ledger_index_max: -1,
              limit: 20,
              forward: false
            }]
          };
          
          const response = await fetch(rpcEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rpcRequest)
          });
          
          if (!response.ok) {
            console.log(`⚠️ XRPL request failed: ${response.status}`);
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            continue;
          }
          
          const data = await response.json();
          
          if (data.error) {
            console.log('⚠️ XRPL error:', data.error);
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            continue;
          }
          
          const transactions = data.result?.transactions || [];
          console.log("Transactions: ", transactions)
          console.log(`📋 Found ${transactions.length} recent transactions`);
          
          for (const txData of transactions) {
            const tx = txData.tx;
            const meta = txData.meta;
            
            if (!tx || tx.TransactionType !== 'Payment') continue;
            if (tx.Destination !== destinationAddress) continue;
            if (!meta || meta.TransactionResult !== 'tesSUCCESS') continue;
            
            // Check if this is an XRPB token payment or native XRP payment
            let deliveredAmount = 0;
            let isValidPayment = false;
            let paymentType = 'unknown';
            
            console.log('🔍 Analyzing transaction:', {
              hash: tx.hash,
              delivered_amount: meta.delivered_amount,
              tx_Amount: tx.Amount,
              expected_currency: currency,
              expected_currencyDeets: XRPB_TOKENS.xrpl.currencyDeets,
              expected_issuer: issuer
            });
            
            // First check for XRPB token in delivered_amount (object format)
            if (meta.delivered_amount && typeof meta.delivered_amount === 'object') {
              const delivered = meta.delivered_amount;
              console.log('📦 Object delivered_amount:', delivered);
              // Check using currencyDeets hex value for proper XRPB identification
              if ((delivered.currency === XRPB_TOKENS.xrpl.currencyDeets || delivered.currency === currency) && delivered.issuer === issuer) {
                deliveredAmount = parseFloat(delivered.value);
                isValidPayment = true;
                paymentType = 'XRPB_TOKEN';
                console.log('✅ Found XRPB in delivered_amount object');
              }
            } 
            // Then check for XRPB token in tx.Amount (object format)
            else if (tx.Amount && typeof tx.Amount === 'object') {
              const amount = tx.Amount;
              console.log('📦 Object tx.Amount:', amount);
              // Check using currencyDeets hex value for proper XRPB identification
              if ((amount.currency === XRPB_TOKENS.xrpl.currencyDeets || amount.currency === currency) && amount.issuer === issuer) {
                deliveredAmount = parseFloat(amount.value);
                isValidPayment = true;
                paymentType = 'XRPB_TOKEN';
                console.log('✅ Found XRPB in tx.Amount object');
              }
            }
            // Handle string delivered_amount (could be XRP or XRPB)
            else if (typeof meta.delivered_amount === 'string') {
              console.log('⚠️ String delivered_amount detected, analyzing...');
              
              // Check AffectedNodes for XRPB-related RippleState changes
              const affectedNodes = meta.AffectedNodes || [];
              let foundXRPBNode = false;
              
              for (const node of affectedNodes) {
                const nodeData = node.ModifiedNode || node.CreatedNode || node.DeletedNode;
                if (nodeData && nodeData.LedgerEntryType === 'RippleState') {
                  const finalFields = nodeData.FinalFields || nodeData.NewFields;
                  if (finalFields) {
                    console.log('🔍 Checking RippleState node:', finalFields);
                    // Check for XRPB using currencyDeets or issuer
                    const hasXRPBCurrency = (finalFields.LowLimit && 
                      (finalFields.LowLimit.currency === XRPB_TOKENS.xrpl.currencyDeets || finalFields.LowLimit.issuer === issuer)) ||
                      (finalFields.HighLimit && 
                      (finalFields.HighLimit.currency === XRPB_TOKENS.xrpl.currencyDeets || finalFields.HighLimit.issuer === issuer));
                    
                    if (hasXRPBCurrency) {
                      foundXRPBNode = true;
                      console.log('✅ Found XRPB RippleState node with currencyDeets');
                      break;
                    }
                  }
                }
              }
              
              if (foundXRPBNode) {
                // This is actually an XRPB transaction disguised as XRP
                deliveredAmount = parseFloat(meta.delivered_amount) / 1000000;
                isValidPayment = true;
                paymentType = 'XRPB_DISGUISED';
                console.log('✅ Confirmed XRPB payment via RippleState analysis using currencyDeets');
              } else {
                // This is a native XRP payment - accept it
                deliveredAmount = parseFloat(meta.delivered_amount) / 1000000; // Convert drops to XRP
                isValidPayment = true;
                paymentType = 'NATIVE_XRP';
                console.log('✅ Processing as native XRP payment');
              }
            }
            
            console.log('📊 Payment analysis result:', {
              isValidPayment,
              paymentType,
              deliveredAmount,
              expectedAmount,
              currency,
              currencyDeets: XRPB_TOKENS.xrpl.currencyDeets,
              issuer
            });
            
            if (!isValidPayment) {
              console.log('⏭️ Skipping invalid transaction');
              continue;
            }
            
            // Parse transaction timestamp
            let txTime = new Date();
            if (tx.date && typeof tx.date === 'number') {
              txTime = new Date((tx.date + 946684800) * 1000);
            }
            
            // Only consider recent transactions
            const bufferTime = new Date(monitorStartTime.getTime() - 60000);
            if (txTime < bufferTime) continue;
            
            console.log('📥 Found XRPB transaction:', {
              hash: tx.hash,
              amount: deliveredAmount,
              expected: expectedAmount,
              currency: currency,
              issuer: issuer
            });
            
            // Check if amount matches
            const tolerance = Math.max(0.001, expectedAmount * 0.09);
            const amountDifference = Math.abs(deliveredAmount - expectedAmount);
            
            if (amountDifference <= tolerance) {
              console.log('✅ XRPB payment verified!');
              return {
                success: true,
                txHash: tx.hash,
                actualAmount: deliveredAmount,
                expectedAmount: expectedAmount,
                currency: currency,
                issuer: issuer,
                timestamp: txTime.toISOString(),
                transaction: tx,
                metadata: meta
              };
            }
          }
          
        } catch (error) {
          console.log('❌ Error checking XRPB transactions:', error.message);
        }
        
        console.log(`⏳ Waiting ${checkInterval/1000} seconds before next check...`);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
      
      return {
        success: false,
        error: 'XRPB payment monitoring timeout'
      };
      
    } catch (error) {
      console.error('❌ XRPL XRPB Transaction Monitoring Failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };



  