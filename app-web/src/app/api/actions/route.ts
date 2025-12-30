import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://rogue-portfolio-backend-production.up.railway.app';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = new URL(`${BACKEND_URL}/api/actions`);
    searchParams.forEach((value, key) => url.searchParams.set(key, value));
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Backend request failed');
    }
    const actions = await response.json();
    return NextResponse.json(actions);
  } catch (error) {
    console.error('Error fetching actions:', error);
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('Backend request failed');
    }
    const action = await response.json();
    return NextResponse.json(action);
  } catch (error) {
    console.error('Error creating action:', error);
    return NextResponse.json({ error: 'Failed to create action' }, { status: 500 });
  }
}
