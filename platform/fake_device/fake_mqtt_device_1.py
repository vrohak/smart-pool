import time
import random
import json
import paho.mqtt.client as mqtt

client = mqtt.Client()
client.connect("localhost", 1883, 60) # ako ne radi, onda staviti host.docker.internal umjesto localhost
# client.connect("host.docker.internal", 1883, 60) # pošalji samo jednom na početku

while True:
    client.publish("smartpool/1/sensor/water_temp", round(random.uniform(25, 30), 2))
    client.publish("smartpool/1/sensor/air_temp", round(random.uniform(26, 32), 2))
    client.publish("smartpool/1/sensor/chlorine", round(random.uniform(1.0, 3.0), 2))
    client.publish("smartpool/1/sensor/water_level", round(random.uniform(70, 100), 1))
    client.publish("smartpool/1/heater/state", "off")

 # inicijalno stanje grijača
    print("Lazne metrike poslane.")
    time.sleep(10)

