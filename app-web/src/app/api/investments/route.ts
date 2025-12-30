import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  console.log('Fetching investments from:', `${BACKEND_URL}/api/investments`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/investments`, {
      cache: 'no-store'
    });
    
    console.log('Backend response status:', response.status);
    
    if (response.ok) {
      const investments = await response.json();
      console.log('Investments data:', investments);
      return NextResponse.json(investments);
    }
    
    const errorText = await response.text();
    console.error('Backend returned error:', response.status, errorText);
  } catch (error) {
    console.error('Backend not available:', error);
  }
  
  console.log('Returning empty array');
  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/investments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const investment = await response.json();
      return NextResponse.json(investment);
    }
    console.error('Backend returned error:', response.status);
  } catch (error) {
    console.error('Backend not available:', error);
  }
  
  return NextResponse.json(
    { error: 'Backend not available' },
    { status: 503 }
  );
}
