#!/usr/bin/env python3

import time
import random
import threading
import paho.mqtt.client as mqtt

MQTT_BROKER     = "host.docker.internal" # ili "localhost"
MQTT_PORT       = 1883
PUBLISH_INTERVAL = 10

TOPIC_WATER_TEMP   = "smartpool/1/sensor/water_temp"
TOPIC_WATER_LEVEL  = "smartpool/1/sensor/water_level"
TOPIC_CHLORINE     = "smartpool/1/sensor/chlorine"
TOPIC_AIR_TEMP     = "smartpool/1/sensor/air_temp"
TOPIC_HEATER_STATE = "smartpool/1/heater/state"
TOPIC_HEATER_SET   = "smartpool/1/heater/set"

class FakePoolDevice:
    def __init__(self, client: mqtt.Client):
        self.client = client
        self.heater_state = "OFF"
        self.publish_heater_state(retain=True)
        self.client.on_message = self.on_message
        self.client.subscribe(TOPIC_HEATER_SET, qos=1)
        self._stop_event = threading.Event()
        self.publisher_thread = threading.Thread(target=self._publish_loop, daemon=True)
        self.publisher_thread.start()

    def on_message(self, client, userdata, msg):
        payload = msg.payload.decode().upper().strip()
        if payload in ("ON", "OFF"):
            if payload != self.heater_state:
                print(f"[INFO] Heater command received: {payload}. Updating state.")
                self.heater_state = payload
                self.publish_heater_state(retain=True)
            else:
                print(f"[INFO] Heater already {self.heater_state}. No change.")
        else:
            print(f"[WARNING] Received invalid heater payload: '{payload}'")

    def publish_heater_state(self, retain: bool = False):
        self.client.publish(TOPIC_HEATER_STATE, self.heater_state, qos=1, retain=retain)
        print(f"[PUBLISH] {TOPIC_HEATER_STATE} → {self.heater_state} (retain={retain})")

    def _publish_loop(self):
        while not self._stop_event.is_set():
            water_temp = round(random.uniform(0.0, 30.0), 1)
            self.client.publish(TOPIC_WATER_TEMP, water_temp, qos=1)
            print(f"[PUBLISH] {TOPIC_WATER_TEMP} → {water_temp} °C")

            water_level = round(random.uniform(0, 100), 1)
            self.client.publish(TOPIC_WATER_LEVEL, water_level, qos=1)
            print(f"[PUBLISH] {TOPIC_WATER_LEVEL} → {water_level} %")

            chlorine = round(random.uniform(0.5, 3.0), 2)
            self.client.publish(TOPIC_CHLORINE, chlorine, qos=1)
            print(f"[PUBLISH] {TOPIC_CHLORINE} → {chlorine} mg/L")

            air_temp = round(random.uniform(0.0, 40.0), 1)
            self.client.publish(TOPIC_AIR_TEMP, air_temp, qos=1)
            print(f"[PUBLISH] {TOPIC_AIR_TEMP} → {air_temp} °C")

            time.sleep(PUBLISH_INTERVAL)

    def stop(self):
        self._stop_event.set()
        self.publisher_thread.join()

def main():
    client = mqtt.Client(client_id="fake_mqtt_device_2")
    client.will_set(TOPIC_HEATER_STATE, payload="OFF", qos=1, retain=True)

    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            # connected
            return
        else:
            print(f"[ERROR] Failed to connect to MQTT broker. RC={rc}")

    client.on_connect = on_connect
    client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
    client.loop_start()
    fake_device = FakePoolDevice(client)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[INFO] Stopping fake device...")
    finally:
        fake_device.stop()
        client.loop_stop()
        client.disconnect()
        print("[INFO] Disconnected. Exiting.")

if __name__ == "__main__":
    main()
