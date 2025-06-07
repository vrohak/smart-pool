from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Home Assistant postavke
HA_BASE_URL = "http://homeassistant:8123"
HA_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI5MDA0NDY5OGUyMjc0NTU2OGQ1MTdmY2I1MjE3ZTFjOSIsImlhdCI6MTc0OTAwMDExNywiZXhwIjoyMDY0MzYwMTE3fQ.CaTlgR_PrQ4fc6cBd6ijfzntn4phyx9zQmVZOJEsUiQ"

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
    payload = {"entity_id": "switch.pool1_heater"}

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

