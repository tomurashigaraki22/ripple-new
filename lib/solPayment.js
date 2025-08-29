import {
    PublicKey,
    Transaction,
    SystemProgram
  } from "@solana/web3.js";
  
  import {
    getAssociatedTokenAddress,
    getOrCreateAssociatedTokenAccount,
    createTransferInstruction,
    TOKEN_PROGRAM_ID
  } from "@solana/spl-token";
  
  /**
   * Solana Payment Function
   * Supports: 
   *  - xrpb-sol (SPL token)
   *  - solana (native SOL)
   *
   * @param {Object} wallet - Connected Solana wallet
   * @param {number} amount - Amount in human-readable units
   * @param {Connection} connection - Solana connection object
   * @param {"xrpb-sol"|"solana"} type - Payment type
   */
  export const sendSolanaPayment = async (wallet, amount, connection, type = "xrpb-sol") => {
    try {
      if (!wallet) throw new Error("❌ Wallet object is null or undefined");
      if (!wallet.connected) throw new Error("❌ Solana wallet not connected");
      if (!wallet.publicKey) throw new Error("❌ Wallet public key is not available");
  
      console.log(`🟣 SOLANA PAYMENT INITIATED (${type.toUpperCase()})`);
  
      const recipient = new PublicKey(PAYMENT_RECIPIENTS.solana);
      let transaction, signature, paymentData;
  
      if (type === "solana") {
        // --- Native SOL transfer ---
        const lamports = amount * 1e9; // Convert SOL → lamports
        transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: recipient,
            lamports
          })
        );
        console.log("💸 Native SOL Transfer:", lamports, "lamports");
      } else if (type === "xrpb-sol") {
        // --- SPL Token transfer ---
        const tokenInfo = XRPB_TOKENS.solana;
        const mintAddress = new PublicKey(tokenInfo.mint);
  
        // Sender ATA
        const senderTokenAccount = await getAssociatedTokenAddress(
          mintAddress,
          wallet.publicKey
        );
  
        // Check balance
        const senderTokenAccountInfo = await connection.getTokenAccountBalance(senderTokenAccount);
        const currentBalance = senderTokenAccountInfo.value.uiAmount || 0;
        if (currentBalance < amount) {
          throw new Error(`❌ Insufficient XRBP-SOL balance. Required: ${amount}, Available: ${currentBalance}`);
        }
  
        // Recipient ATA
        const recipientTokenAccountInfo = await getOrCreateAssociatedTokenAccount(
          connection,
          wallet.publicKey, // payer
          mintAddress,
          recipient
        );
  
        const recipientTokenAccount = recipientTokenAccountInfo.address;
        const tokenAmount = amount * Math.pow(10, tokenInfo.decimals);
  
        // Transfer instruction
        const transferInstruction = createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          wallet.publicKey,
          tokenAmount,
          [],
          TOKEN_PROGRAM_ID
        );
  
        transaction = new Transaction().add(transferInstruction);
      } else {
        throw new Error(`❌ Unsupported payment type: ${type}`);
      }
  
      // Fetch blockhash
      const latest = await connection.getLatestBlockhashAndContext("finalized");
      const blockhash = latest.value.blockhash;
      const lastValidBlockHeight = latest.value.lastValidBlockHeight;
  
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
  
      // Send transaction
      if (wallet.sendTransaction && typeof wallet.sendTransaction === "function") {
        signature = await wallet.sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: "finalized",
        });
      } else {
        throw new Error("❌ sendTransaction method not available on wallet");
      }
  
      // Confirm
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
  
      console.log("✅ Transaction confirmed:", signature);
  
      paymentData = {
        blockchain: "Solana",
        token: type.toUpperCase(),
        from: wallet.publicKey.toString(),
        to: recipient.toString(),
        amount,
        signature,
        explorerUrl: `https://solscan.io/tx/${signature}`,
        network: "mainnet-beta",
        timestamp: new Date().toISOString(),
      };
  
      localStorage.setItem(`solana_${type}_payment_${signature}`, JSON.stringify(paymentData));
  
      return { success: true, signature, paymentData };
    } catch (error) {
      console.error("❌ Solana Payment Failed:", error);
      return { success: false, error: error.message };
    }
  };
  