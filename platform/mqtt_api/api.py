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

POOL_ENTITIES = {
    "pool1": "switch.pool1_heater",
    "pool2": "switch.pool2_heater",
    # dodavati nove bazene ako je potrebno
}

@app.route('/grijac/<poolID>', methods=['POST'])
def control_heater(poolID):
    data = request.get_json()
    state = data.get("state", "").upper()

    if state not in ("ON", "OFF"):
        return jsonify({"error": "State must be 'ON' or 'OFF'"}), 400

    entity_id = POOL_ENTITIES.get(poolID)
    if not entity_id:
        return jsonify({"error": f"Unknown poolID: {poolID}"}), 404

    service = "turn_on" if state == "ON" else "turn_off"
    url = f"{HA_BASE_URL}/api/services/switch/{service}"
    payload = {"entity_id": entity_id}

    try:
        response = requests.post(url, headers=HEADERS, json=payload)
        if response.status_code == 200:
            return jsonify({"status": f"Heater for {poolID} turned {state} via Home Assistant"}), 200
        else:
            return jsonify({"error": f"HA API failed. Status: {response.status_code}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

