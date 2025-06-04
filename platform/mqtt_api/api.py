from flask import Flask, request, jsonify
import paho.mqtt.client as mqtt

app = Flask(__name__)

# MQTT postavke
MQTT_BROKER = "mosquitto"  # ako je u docker-compose mreži
MQTT_PORT = 1883
MQTT_TOPIC_SET = "smartpool/1/heater/set"
MQTT_TOPIC_STATE = "smartpool/1/heater/state"

# Postavljanje MQTT klijenta
mqtt_client = mqtt.Client()
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()  # Omogućava asinkrono slanje poruka

@app.route('/grijac', methods=['POST'])
def control_heater():
    data = request.get_json()
    state = data.get("state")

    if state not in ["ON", "OFF"]:
        return jsonify({"error": "Invalid state. Use 'ON' or 'OFF'."}), 400

    # Pošalji komandu
    mqtt_client.publish(MQTT_TOPIC_SET, state)
    # Odmah pošalji i stanje koje će HA pročitati (važno!)
    mqtt_client.publish(MQTT_TOPIC_STATE, state, retain=True)

    return jsonify({"status": f"Heater set to {state}"}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

