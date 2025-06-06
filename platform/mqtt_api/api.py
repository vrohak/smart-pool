from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Home Assistant postavke
HA_BASE_URL = "http://homeassistant:8123"
HA_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI3NDEzMWM1YjJkNDQ0YWIwYjI2MGNlYTg2NTkxMWVhOCIsImlhdCI6MTc0OTIzNzk1OSwiZXhwIjoyMDY0NTk3OTU5fQ.t6RHS4Uidwf79NHikvapLmzvBOG2ciapTun-WoTIwIs"

HEADERS = {
    "Authorization": f"Bearer {HA_TOKEN}",
    "Content-Type": "application/json"
}

@app.route('/grijac', methods=['POST'])
def control_heater():
    data = request.get_json()
    state = data.get("state", "").upper()

    if state not in ("ON", "OFF"):
        return jsonify({"error": "State must be 'ON' or 'OFF'"}), 400

    service = "turn_on" if state == "ON" else "turn_off"
    url = f"{HA_BASE_URL}/api/services/switch/{service}"
    payload = {"entity_id": "switch.grijac_bazena"}

    try:
        response = requests.post(url, headers=HEADERS, json=payload)
        if response.status_code == 200:
            return jsonify({"status": f"Heater turned {state} via Home Assistant"}), 200
        else:
            return jsonify({"error": f"HA API failed. Status: {response.status_code}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

