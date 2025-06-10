import time
import random
import json
import paho.mqtt.client as mqtt

# OVO JE MOCK UREĐAJ KOJI PREDSTAVLJA BAZEN 2
# SENZORI:
# TEMPERATURA VODE - mqtt topic "smartpool/2/sensor/water_temp"
# RAZINA VODE - mqtt topic "smartpool/2/sensor/water_level"

PUBLISH_INTERVAL = 10 # svakih toliko sekundi se salju metrike na mqtt

# MQTT_BROKER_HOST = "localhost"
MQTT_BROKER_HOST = "mosquitto"
MQTT_BROKER_PORT = 1883

client = mqtt.Client()
# client.connect("localhost", 1883, 60) # ako ne radi, staviti host.docker.internal umjesto localhost
client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)

while True:
    client.publish("smartpool/2/sensor/water_temp", round(random.uniform(25, 30), 2))
    client.publish("smartpool/2/sensor/water_level", round(random.uniform(0.5, 0.9), 1))
    print("Metrike poslane.")
    time.sleep(PUBLISH_INTERVAL)

