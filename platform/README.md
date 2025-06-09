POKRETANJE:
1) pokrenuti docker engine
2) pozicionirati se u ovaj direktorij u naredbenom retku i pokrenuti:
docker compose up -d --build


## Uređaji

Ukoliko je pravi uređaj spojen na bazenu 1, potrebno ga je samo umrežiti na mosquitto mqtt broker.
Za simulaciju uređaja na bazenu 1, u pythonu pokrenite fake_mqtt_device_1.py ili fake_mqtt_device_2.py

Za virtualni uređaj na bazenu 2, pokrenite virtual_device.py


## Home Assistant

Provjerite Entity ID na svakom od senzora i aktuatora i ukoliko vam nisu u ovom obliku, promijenite ručno u takav oblik (<poolID>_<naziv>):
pool1_chlorine
pool1_heater
pool2_water_level
...

Ako želite resetirati povijest metrika u home assistant, dovoljno je obrisati bazu podataka 
(homeassistant_config/home-assistant_v2.db) i ponovno pokrenuti home assistant.


## InfluxDB

Sudionici ovog projekta su dobili tajni token i bez njega nije moguć pristup bazi.
Ukoliko nemate token, možete ga kreirati sa naredbom: influxdb3 create token --admin

No tada morate ponovno konfigurirati token u Node-RED, jer inače on ne može pisati u InfluxDB:
"Write to InfluxDB3" node -> Server / edit ikonica -> Stavi novi token u Token polje -> Deploy


Kad se koristite influxdb3 naredbama, potrebno je na kraju svake dodati --token <token>
Rješenje za to je da postavite sistemsku varijablu ovako:

export INFLUXDB3_AUTH_TOKEN=<token>

I to je potrebno raditi prilikom svakog pokretanja kontejnera.
Ta varijabla s tokenom se mogla postaviti u docker-compose.yml kako ovo sve ne bi bilo potrebno, ali iz sigurnosnih razloga to nije napravljeno.

NAPOMENA: influx baza nece biti pronadena ako jos niti jedan state nije objavljen jer influx formira tablice tek kad primi prvi podatak


Primjeri CLI naredbi za InfluxDB koje se mogu pokretati unutar docker kontejnera:

influxdb3 query --database smartpool "SELECT * FROM sensor_data ORDER BY time DESC LIMIT 50;"
influxdb3 query --database smartpool "SELECT * FROM heater_state ORDER BY time DESC LIMIT 50;"

influxdb3 query --database smartpool "SELECT time,value FROM sensor_data WHERE pool_id='pool2' ORDER BY time DESC LIMIT 50;"

influxdb3 delete table sensor_data --database smartpool
influxdb3 delete table heater_state --database smartpool
