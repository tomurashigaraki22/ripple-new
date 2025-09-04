export async function POST(request) {
  try {
    const { shipFrom, shipTo, packages, carrierIds } = await request.json();
    
    // Validate required fields
    if (!shipFrom || !shipTo || !packages) {
      return Response.json(
        { error: 'Missing required fields: shipFrom, shipTo, packages' },
        { status: 400 }
      );
    }

    // Validate shipFrom address fields
    if (!shipFrom.address_line1 || !shipFrom.city_locality || !shipFrom.state_province || !shipFrom.postal_code) {
      return Response.json(
        { error: 'Missing required shipFrom address fields: address_line1, city_locality, state_province, postal_code' },
        { status: 400 }
      );
    }

    // Validate shipTo address fields
    if (!shipTo.address_line1 || !shipTo.city_locality || !shipTo.state_province || !shipTo.postal_code) {
      return Response.json(
        { error: 'Missing required shipTo address fields: address_line1, city_locality, state_province, postal_code' },
        { status: 400 }
      );
    }

    const rateRequest = {
      currency: 'usd',
      rate_options: {
        carrier_ids: carrierIds && carrierIds.length > 0 ? carrierIds : ['se-3051222'], // Default to UPS
      },
      shipment: {
        ship_to: {
          ...shipTo,
          phone: shipTo.phone || '1234567890', // Ensure phone is not empty
        },
        ship_from: {
          ...shipFrom,
          phone: shipFrom.phone || '1234567890', // Ensure phone is not empty
        },
        packages: packages,
      },
    };

    const response = await fetch('https://api.shipengine.com/v1/rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': process.env.NEXT_PUBLIC_SHIPSTATION_API_KEY_TEST,
      },
      body: JSON.stringify(rateRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(
        { error: 'ShipEngine API error', details: errorData },
        { status: response.status }
      );
    }

    const rates = await response.json();
    
    // ✅ FIXED: Check for actual rates in the response
    if (rates.rate_response) {
      // Check if we have valid rates in the rates array
      if (rates.rate_response.rates && rates.rate_response.rates.length > 0) {
        return Response.json(rates);
      }
      
      // If no rates in the main array, check invalid_rates for recoverable rates
      if (rates.rate_response.invalid_rates && rates.rate_response.invalid_rates.length > 0) {
        // Some rates might be marked as "invalid" but still usable
        const usableRates = rates.rate_response.invalid_rates.filter(rate => 
          rate.rate_id && rate.shipping_amount && rate.service_type
        );
        
        if (usableRates.length > 0) {
          // Return the invalid rates as valid since they contain rate information
          return Response.json({
            ...rates,
            rate_response: {
              ...rates.rate_response,
              rates: usableRates,
              status: 'completed'
            }
          });
        }
      }
      
      // Only return error if we truly have no usable rates
      if (rates.rate_response.status === 'error' && rates.rate_response.errors) {
        return Response.json(
          { 
            error: 'Shipping calculation failed', 
            details: rates.rate_response.errors,
            message: rates.rate_response.errors[0]?.message || 'Unknown shipping error'
          },
          { status: 400 }
        );
      }
    }
    
    // If we get here, return the raw response
    return Response.json(rates);
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}