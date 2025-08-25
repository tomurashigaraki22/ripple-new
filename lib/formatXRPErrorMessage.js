const formatErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred. Please try again.';
    
    const errorStr = error.toLowerCase();
    
    // Handle specific error types
    if (errorStr.includes('missing revert data') || errorStr.includes('call_exception')) {
      return 'Transaction failed. This could be due to insufficient balance, network issues, or gas problems. Please check your wallet balance and try again.';
    }
    
    if (errorStr.includes('insufficient funds') || errorStr.includes('insufficient balance')) {
      return 'Insufficient funds in your wallet. Please add more funds and try again.';
    }
    
    if (errorStr.includes('user rejected') || errorStr.includes('user denied')) {
      return 'Transaction was cancelled by user.';
    }
    
    if (errorStr.includes('network') || errorStr.includes('connection')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (errorStr.includes('gas') || errorStr.includes('out of gas')) {
      return 'Transaction failed due to gas issues. Please try again with higher gas settings.';
    }
    
    if (errorStr.includes('nonce')) {
      return 'Transaction nonce error. Please refresh the page and try again.';
    }
    
    if (errorStr.includes('timeout')) {
      return 'Transaction timed out. Please try again.';
    }
    
    // For any other technical errors, provide a generic user-friendly message
    if (error.length > 100 || errorStr.includes('0x') || errorStr.includes('revert')) {
      return 'Transaction failed due to a technical issue. Please try again or contact support if the problem persists.';
    }
    
    // Return the original error if it's already user-friendly
    return error;
  };