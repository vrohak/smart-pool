FROM python:3.10
WORKDIR /app
COPY . .
RUN pip install requests flask paho-mqtt
CMD ["python", "fake_mqtt_device_2.py"]

