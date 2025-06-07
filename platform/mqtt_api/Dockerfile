FROM python:3.10
WORKDIR /app
COPY . .
RUN pip install requests flask paho-mqtt
CMD ["python", "api.py"]

