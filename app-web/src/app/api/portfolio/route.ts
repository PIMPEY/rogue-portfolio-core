import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  console.log('Fetching portfolio from:', `${BACKEND_URL}/api/portfolio`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/portfolio`, {
      cache: 'no-store'
    });
    
    console.log('Backend response status:', response.status);
    
    if (response.ok) {
      const portfolio = await response.json();
      console.log('Portfolio data:', portfolio);
      // Ensure we always return an array
      return NextResponse.json(Array.isArray(portfolio) ? portfolio : []);
    }
    
    const errorText = await response.text();
    console.error('Backend returned error:', response.status, errorText);
  } catch (error) {
    console.error('Backend not available:', error);
  }
  
  console.log('Returning empty array');
  return NextResponse.json([]);
}
