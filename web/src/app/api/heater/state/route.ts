import { NextResponse } from 'next/server';

const INFLUX_URL    = process.env.INFLUX_URL!;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET!;
const INFLUX_TOKEN  = process.env.INFLUX_TOKEN!;

async function queryLastState(poolId: string): Promise<'on' | 'off'> {
  const sql = `
    SELECT state AS lastState 
    FROM heater_state 
    WHERE pool_id='${poolId}'
    ORDER BY time DESC 
    LIMIT 1
  `;
  const res = await fetch(
    `${INFLUX_URL}/api/v3/query_sql`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INFLUX_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ db: INFLUX_BUCKET, q: sql.trim(), format: 'jsonl' })
    }
  );
  if (!res.ok) {
    throw new Error(`InfluxDB error (${res.status})`);
  }
  const text = await res.text();
  const line = text.trim().split('\n')[0];
  if (!line) return 'off';
  const obj = JSON.parse(line) as { laststate?: number };
  const val = (obj.laststate || '');
  return val === 1 ? 'on' : 'off';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const poolId = searchParams.get('poolId');
  if (!poolId) {
    return NextResponse.json({ error: 'poolId query param is required' }, { status: 400 });
  }
  try {
    const state = await queryLastState(poolId);
    return NextResponse.json({ poolId, state });
  } catch (err: any) {
    console.error('Error fetching heater state from InfluxDB:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch heater state' },
      { status: 500 }
    );
  }
}