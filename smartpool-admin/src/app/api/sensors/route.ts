import { NextResponse } from 'next/server';

const INFLUX_URL    = process.env.INFLUX_URL!;
const INFLUX_TOKEN  = process.env.INFLUX_TOKEN!;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const poolId = searchParams.get('poolId');
  const sensor = searchParams.get('sensor');
  let date     = searchParams.get('date') || (new Date().toISOString().slice(0,10));

  if (!poolId || !sensor) {
    return NextResponse.json({ error: 'poolId and sensor are required' }, { status: 400 });
  }

  const start = `${date}T00:00:00Z`;
  const next  = new Date(new Date(start).getTime() + 24*3600*1000)
                    .toISOString().slice(0,19) + 'Z';

  const sql = `
    SELECT time, value
    FROM sensor_data
    WHERE pool_id='${poolId}'
      AND sensor='${sensor}'
      AND time >= '${start}'
      AND time <  '${next}'
    ORDER BY time ASC
  `;

  const res = await fetch(`${INFLUX_URL}/api/v3/query_sql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${INFLUX_TOKEN}`,
      'Content-Type':  'application/json',
      'Accept':        'application/json',
    },
    body: JSON.stringify({
      db:     INFLUX_BUCKET,
      q:      sql.trim(),
      format: 'json',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ error: body }, { status: res.status });
  }

  const points = await res.json() as Array<{ time: string, value: number }>;

  return NextResponse.json(points);
}