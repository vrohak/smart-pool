/**
* @file DHT11.h
*
* @brief See the source file.
* 
* COPYRIGHT NOTICE: (c) 2025
* All rights reserved.
*/

#ifndef __DHT11_H__
#define __DHT11_H__

#ifdef __cplusplus
extern "C" {
#endif

//--------------------------------- INCLUDES ----------------------------------

#include "mqtt_client.h"

//---------------------------------- MACROS -----------------------------------

#define DHT11_TAG             "DHT11_HANDLER"

#define DHT11_GPIO            (15)
#define DTH11_SLEEP_PERIOD_MS (10000)

#define DHT11_MQTT_PUB_TOPIC  "smartpool/1/sensor/air_temp"

//-------------------------------- DATA TYPES ---------------------------------

//---------------------- PUBLIC FUNCTION PROTOTYPES --------------------------

void dht_init(esp_mqtt_client_handle_t mqtt_client);

#ifdef __cplusplus
}
#endif

#endif // __DHT11_H__
