import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { poolId, state } = (await request.json()) as {
      poolId: string;
      state: 'on' | 'off';
    };

    const apiUrl = process.env.IOT_API_URL!;
    const res = await fetch(
      `${apiUrl}/grijac/${encodeURIComponent(poolId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`IoT API error (${res.status}): ${text}`);
    }

    const body = await res.json();
    return NextResponse.json(body);
  } catch (err: any) {
    console.error('Error setting heater state:', err);
    return NextResponse.json(
      { error: err.message || 'Greška na serveru' },
      { status: 500 }
    );
  }
}