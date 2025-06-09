import { NextResponse } from 'next/server';
import { connect as mqttConnect } from 'mqtt';

const brokerUrl = process.env.MQTT_BROKER_URL!;
const client = mqttConnect(brokerUrl);

export async function POST(request: Request) {
  try {
    const { poolId, target } = (await request.json()) as {
      poolId: string;
      target: number;
    };

    const client = mqttConnect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => resolve());
      client.on('error', (err) => reject(err));
    });

    const payload = JSON.stringify({
      poolId,
      target,
      timestamp: new Date().toISOString(),
    });
    client.publish('smartpool/heater/set', payload);

    client.end();

    return NextResponse.json({ message: 'Komanda je poslana' });
  } catch (err: any) {
    console.error('MQTT error:', err);
    return NextResponse.json({ error: err.message || 'Greška na serveru' }, { status: 500 });
  }
}