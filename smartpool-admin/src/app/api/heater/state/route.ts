import { NextResponse } from 'next/server';
import { connect as mqttConnect, MqttClient } from 'mqtt';

const brokerUrl = process.env.MQTT_BROKER_URL!;
const client: MqttClient = mqttConnect(brokerUrl);

const stateCache: Record<string, 'on' | 'off'> = {};

client.on('connect', () => {
  client.subscribe('smartpool/+/heater/state', { qos: 0 });
});

client.on('message', (topic, message) => {
  const parts = topic.split('/');
  if (parts.length === 4) {
    const poolId = parts[1];
    const payload = message.toString().toLowerCase();
    if (payload === 'on' || payload === 'off') {
      stateCache[poolId] = payload;
    }
  }
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const poolId = searchParams.get('poolId');
  if (!poolId) {
    return NextResponse.json({ error: 'poolId query param is required' }, { status: 400 });
  }
  const state = stateCache[poolId] ?? 'off';
  return NextResponse.json({ poolId, state });
}