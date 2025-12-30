import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/portfolio`);
    if (response.ok) {
      const portfolio = await response.json();
      return NextResponse.json(portfolio);
    }
    console.error('Backend returned error:', response.status);
  } catch (error) {
    console.error('Backend not available:', error);
  }
  
  return NextResponse.json([]);
}
