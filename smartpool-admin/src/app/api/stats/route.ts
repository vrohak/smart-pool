import { NextResponse } from 'next/server';

const INFLUX_URL    = process.env.INFLUX_URL!;
const INFLUX_TOKEN  = process.env.INFLUX_TOKEN!;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET!

async function querySingleSQL(sql: string, alias: string): Promise<number> {
  const params = new URLSearchParams({
    db:     INFLUX_BUCKET,
    q:      sql.trim(),
    format: 'jsonl',
  });
  const url = `${INFLUX_URL}/api/v3/query_sql?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${INFLUX_TOKEN}`,
      'Accept':        'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`InfluxDB error (${res.status}): ${body}`);
  }

  const text = await res.text();
  const first = text.trim().split('\n')[0];
  if (!first) return NaN;
  const obj = JSON.parse(first) as Record<string, any>;
  return typeof obj[alias] === 'number' ? obj[alias] : NaN;
}

export async function GET(request: Request) {
  const poolId = new URL(request.url).searchParams.get('poolId');
  if (!poolId) {
    return NextResponse.json({ error: 'poolId query param is required' }, { status: 400 });
  }

  const timeFilter = `time >= NOW() - INTERVAL '1 DAY'`;

  const sqlAvgWater = `
    SELECT MEAN(value) AS avgWaterTemp
    FROM sensor_data
    WHERE pool_id='${poolId}'
      AND sensor='water_temp'
      AND ${timeFilter}
  `;

  const sqlMinAir = `
    SELECT MIN(value) AS minAirTemp
    FROM sensor_data
    WHERE pool_id='${poolId}'
      AND sensor='air_temp'
      AND ${timeFilter}
  `;

  const sqlUptime = `
    SELECT MEAN(state) AS uptimeRatio
    FROM heater_state
    WHERE ${timeFilter}
  `;

  try {
    const [avgWaterTemp, minAirTemp, uptimeRatio] = await Promise.all([
      querySingleSQL(sqlAvgWater, 'avgWaterTemp').catch(() => NaN),
      querySingleSQL(sqlMinAir,   'minAirTemp').catch(() => NaN),
      querySingleSQL(sqlUptime,   'uptimeRatio').catch(() => NaN),
    ]);

    return NextResponse.json({
      poolId,
      avgWaterTemp,
      minAirTemp,
      uptimeRatio,
    });
  } catch (err: any) {
    console.error('Stats API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}