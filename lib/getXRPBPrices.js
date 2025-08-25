import axios from "axios";

/**
 * Get XRPB price from Solana using the new API
 */
export const getXRPBPriceFromSolana = async () => {
    try {
      const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/FJLz7hP4EXVMVnRBtP77V4k55t2BfXuajKQp1gcwpump');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.pairs && Array.isArray(data.pairs) && data.pairs.length > 0) {
          const pair = data.pairs[0];
          
          if (pair.priceUsd) {
            const priceValue = parseFloat(pair.priceUsd);
            
            if (priceValue && priceValue > 0) {
              console.log('✅ XRPB price from DexScreener (Solana):', priceValue);
              return priceValue;
            }
          }
        }
      }
      
      console.warn('⚠️ Could not fetch XRPB price from DexScreener API');
      return null;
    } catch (error) {
      console.error('❌ Error fetching XRPB price from DexScreener API:', error);
      return null;
    }
};

/**
 * Get XRPB price from XRPL using internal proxy API (returns price in USD)
 */
export const getXRPBPriceFromXRPL = async () => {
    try {
      const response = await axios.get('/api/xrpb-price', {
        timeout: 10000
      });
      
      if (response.status === 200 && response.data.success) {
        console.log('✅ XRPB price from proxy API (USD):', response.data.price);
        return response.data.price;
      }
      
      console.warn('⚠️ Could not fetch XRPB price from proxy API');
      return null;
    } catch (error) {
      console.error('❌ Error fetching XRPB price from proxy API:', error);
      return null;
    }
  };
  
  /**
   * Get XRPB price from XRPL EVM - simplified without CoinGecko
   */
      export const getXRPBPriceFromXRPLEVM = async () => {
        try {
          console.log('🔄 Fetching XRPB price from XRiSE33 API...');
          
          const response = await fetch('https://api.xrise33.com/tokens?limit=1&page=10');
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Extract the XRPB token data
          if (data.data && data.data.length > 0) {
            const xrpbToken = data.data[0];
            
            // Verify this is the correct XRPB token
            if (xrpbToken.symbol === 'XRPB' && xrpbToken.address.toLowerCase() === '0x6d8630d167458b337a2c8b6242c354d2f4f75d96') {
              const usdPrice = parseFloat(xrpbToken.usdPerToken);
              console.log(`✅ XRPB Price from XRiSE33: $${usdPrice}`);
              return usdPrice;
            } else {
              throw new Error('XRPB token not found in API response');
            }
          } else {
            throw new Error('No token data found in API response');
          }
        } catch (error) {
          console.error('❌ Error fetching XRPB price from XRiSE33 API:', error);
          // Fallback to previous method or return null
          console.log('⚠️ Falling back to previous price calculation method...');
          return null;
        }
      };
  

/**
 * Get all XRPB prices from different chains using individual API calls only
 */
export const getAllXRPBPrices = async () => {
    try {
      console.log('🔄 Fetching XRPB prices from all chains using individual API calls...');
      
      // Use individual API calls only (no combined endpoint)
      const [solanaPrice, xrplPrice, xrplEvmPrice] = await Promise.allSettled([
        getXRPBPriceFromSolana(),
        getXRPBPriceFromXRPL(),
        getXRPBPriceFromXRPLEVM()
      ]);
      
      const results = {
        solana: solanaPrice.status === 'fulfilled' ? solanaPrice.value : null,
        xrpl: xrplPrice.status === 'fulfilled' ? xrplPrice.value : null,
        xrplEvm: xrplEvmPrice.status === 'fulfilled' ? xrplEvmPrice.value : null
      };
      
      console.log('✅ All XRPB prices fetched (individual calls only):', results);
      return results;
    } catch (error) {
      console.error('❌ Error fetching all XRPB prices:', error);
      return {
        solana: null,
        xrpl: null,
        xrplEvm: null
      };
    }
  };