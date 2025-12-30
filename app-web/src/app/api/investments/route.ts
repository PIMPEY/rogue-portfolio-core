import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/investments`);
    if (response.ok) {
      const investments = await response.json();
      return NextResponse.json(investments);
    }
    console.error('Backend returned error:', response.status);
  } catch (error) {
    console.error('Backend not available:', error);
  }
  
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
