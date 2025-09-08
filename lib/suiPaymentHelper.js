import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';

// Sui network configuration
const NETWORK = 'mainnet'; // Change to 'mainnet' for production
const suiClient = new SuiClient({ url: getFullnodeUrl(NETWORK) });

// Validation functions
export const validateSuiAddress = (address) => {
  try {
    const normalized = normalizeSuiAddress(address);
    return {
      isValid: true,
      normalizedAddress: normalized,
      error: null
    };
  } catch (error) {
    return {
      isValid: false,
      normalizedAddress: null,
      error: error.message
    };
  }
};

export const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return {
      isValid: false,
      error: 'Amount must be a valid number'
    };
  }
  
  if (numAmount <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than 0'
    };
  }
  
  if (numAmount < 0.000000001) { // Minimum 1 MIST
    return {
      isValid: false,
      error: 'Amount too small (minimum 0.000000001 SUI)'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

// Transaction creation functions
export const createTransferTransaction = (recipient, amount, sender) => {
  try {
    const tx = new TransactionBlock();
    
    // Validate inputs
    const addressValidation = validateSuiAddress(recipient);
    if (!addressValidation.isValid) {
      throw new Error(`Invalid recipient address: ${addressValidation.error}`);
    }
    
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      throw new Error(`Invalid amount: ${amountValidation.error}`);
    }
    
    // Convert SUI to MIST (1 SUI = 1e9 MIST)
    const amountInMist = Math.floor(parseFloat(amount) * 1e9);
    
    // Split coins and transfer
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(amountInMist)]);
    tx.transferObjects([coin], tx.pure(addressValidation.normalizedAddress));
    
    // Set sender if provided
    if (sender) {
      tx.setSender(sender);
    }
    
    return {
      success: true,
      transaction: tx,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      transaction: null,
      error: error.message
    };
  }
};

// Payment processing functions
export const processPayment = async ({
  walletContext,
  recipient,
  amount,
  description = '',
  shippingFee = 0,
  onProgress = () => {},
  onSuccess = () => {},
  onError = () => {}
}) => {
  try {
    onProgress('Validating payment details...');
    
    // Validate wallet connection
    if (!walletContext.connected || !walletContext.address) {
        console.log("Wallet context: ",  walletContext)
      throw new Error('Wallet not connected (SUI)');
    }
    
    // Validate recipient and amount
    const addressValidation = validateSuiAddress(recipient);
    if (!addressValidation.isValid) {
      throw new Error(`Invalid recipient address: ${addressValidation.error}`);
    }
    
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      throw new Error(`Invalid amount: ${amountValidation.error}`);
    }
    
    // Check balance
    onProgress('Checking balance...');
    if (walletContext.balance < parseFloat(amount)) {
      throw new Error('Insufficient balance');
    }
    
    // Create transaction
    onProgress('Creating transaction...');
    const txResult = createTransferTransaction(
      recipient, 
      amount, 
      walletContext.address
    );
    
    if (!txResult.success) {
      throw new Error(txResult.error);
    }
    
    // Execute transaction
    onProgress('Executing transaction...');
    const result = await walletContext.executeTransaction(txResult.transaction);
    
    // Verify transaction success
    if (result.effects?.status?.status !== 'success') {
      throw new Error('Transaction failed: ' + (result.effects?.status?.error || 'Unknown error'));
    }
    
    console.log('Processing Sui payment with shipping fee:', shippingFee);
    
    const paymentResult = {
      success: true,
      transactionDigest: result.digest,
      effects: result.effects,
      balanceChanges: result.balanceChanges,
      objectChanges: result.objectChanges,
      timestamp: Date.now(),
      amount: parseFloat(amount),
      recipient: addressValidation.normalizedAddress,
      sender: walletContext.address,
      description,
      shipping_info: {
        fee: shippingFee,
        currency: "USD"
      }
    };
    
    onProgress('Payment completed successfully!');
    onSuccess(paymentResult);
    
    return paymentResult;
    
  } catch (error) {
    console.error('Payment processing failed:', error);
    const errorResult = {
      success: false,
      error: error.message,
      timestamp: Date.now()
    };
    
    onError(errorResult);
    return errorResult;
  }
};

// Utility functions
export const formatSuiAmount = (amount, decimals = 4) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals).replace(/\.?0+$/, '');
};

export const convertMistToSui = (mist) => {
  return parseFloat(mist) / 1e9;
};

export const convertSuiToMist = (sui) => {
  return Math.floor(parseFloat(sui) * 1e9);
};

// Transaction status checking
export const getTransactionStatus = async (digest) => {
  try {
    const result = await suiClient.getTransactionBlock({
      digest,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    });
    
    return {
      success: true,
      transaction: result,
      status: result.effects?.status?.status,
      error: result.effects?.status?.error
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const estimateGas = async (transaction) => {
  try {
    const dryRunResult = await suiClient.dryRunTransactionBlock({
      transactionBlock: await transaction.build({ client: suiClient })
    });
    
    return {
      success: true,
      gasUsed: dryRunResult.effects.gasUsed,
      gasCost: dryRunResult.effects.gasUsed.computationCost + dryRunResult.effects.gasUsed.storageCost,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      gasUsed: null,
      gasCost: null,
      error: error.message
    };
  }
};

export default {
  validateSuiAddress,
  validateAmount,
  createTransferTransaction,
  processPayment,
  formatSuiAmount,
  convertMistToSui,
  convertSuiToMist,
  getTransactionStatus,
  estimateGas
};