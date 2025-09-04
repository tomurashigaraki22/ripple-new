export async function POST(request) {
  try {
    const addresses = await request.json();
    
    // Validate input
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return Response.json(
        { error: 'Invalid input: expected array of addresses' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.shipengine.com/v1/addresses/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': process.env.NEXT_PUBLIC_SHIPSTATION_API_KEY_TEST,
      },
      body: JSON.stringify(addresses),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(
        { error: 'ShipEngine API error', details: errorData },
        { status: response.status }
      );
    }

    const validationResults = await response.json();
    return Response.json(validationResults);
  } catch (error) {
    console.error('Address validation error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}