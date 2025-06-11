/**
* @file virtual_sensors.h
*
* @brief See the source file.
* 
* COPYRIGHT NOTICE: (c) 2025
* All rights reserved.
*/

#ifndef __VIRTUAL_SENSORS_H__
#define __VIRTUAL_SENSORS_H__

#ifdef __cplusplus
extern "C" {
#endif

//--------------------------------- INCLUDES ----------------------------------

#include "mqtt_client.h"

//---------------------------------- MACROS -----------------------------------

#define VIRTUAL_SENSOR_WATER_LEVEL_BASE            (2.0f)     
#define VIRTUAL_SENSOR_WATER_LEVEL_VARIATION       (0.2f)     
#define VIRTUAL_SENSOR_WATER_LEVEL_MQTT_PUB_TOPIC  "smartpool/1/sensor/water_level"
#define VIRTUAL_SENSOR_WATER_LEVEL_PERIOD_MS       (10000)

#define VIRTUAL_SENSOR_CHLORINE_BASE               (2.0f)     
#define VIRTUAL_SENSOR_CHLORINE_VARIATION          (0.3f) 
#define VIRTUAL_SENSOR_CHLORINE_MQTT_PUB_TOPIC     "smartpool/1/sensor/chlorine"
#define VIRTUAL_SENSOR_CHLORINE_PERIOD_MS          (20000)

#define VIRTUAL_SENSOR_WATER_TEMP_DEFAULT          (15.0f)
#define VIRTUAL_SENSOR_WATER_TEMP_MIN              (5.0f)     
#define VIRTUAL_SENSOR_WATER_TEMP_HEATING_RATE     (2.5f)     
#define VIRTUAL_SENSOR_WATER_TEMP_COOLING_RATE     (1.0f)  
#define VIRTUAL_SENSOR_WATER_TEMP_MQTT_PUB_TOPIC   "smartpool/1/sensor/water_temp"
#define VIRTUAL_SENSOR_WATER_TEMP_PERIOD_MS        (5000)

//-------------------------------- DATA TYPES ---------------------------------

//---------------------- PUBLIC FUNCTION PROTOTYPES --------------------------

void virtual_sensors_init(esp_mqtt_client_handle_t mqtt_client);

void virtual_sensors_water_temp_start_heating();
void virtual_sensors_water_temp_stop_heating();

#ifdef __cplusplus
}
#endif

#endif // __VIRTUAL_SENSORS_H__
