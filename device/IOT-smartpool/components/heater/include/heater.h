/**
* @file heater.h
*
* @brief See the source file.
* 
* COPYRIGHT NOTICE: (c) 2025
* All rights reserved.
*/

#ifndef __HEATER_H__
#define __HEATER_H__

#ifdef __cplusplus
extern "C" {
#endif

//--------------------------------- INCLUDES ----------------------------------

#include "led_strip.h"
#include "mqtt_client.h"

//---------------------------------- MACROS -----------------------------------

#define HEATER_TAG                 "HEATER"
#define HEATER_LED_CTRL_GPIO_NUM   (8)
#define HEATER_LED_CTRL_LED_FORMAT LED_STRIP_COLOR_COMPONENT_FMT_GRB
#define HEATER_LED_MODEL           LED_MODEL_WS2812
#define HEATER_LED_RMT_RES_HZ      (10 * 1000 * 1000)

// In "R, G, B" format 
#define HEATER_LED_ON_COLOR          4, 0, 0 
#define HEATER_LED_OFF_COLOR         0, 0, 0

#define HEATER_MQTT_SUB_TOPIC       "smartpool/1/heater/set"
#define HEATER_MQTT_PUB_TOPIC       "smartpool/1/heater/state"

//-------------------------------- DATA TYPES ---------------------------------

//---------------------- PUBLIC FUNCTION PROTOTYPES --------------------------

void heater_init(esp_mqtt_client_handle_t mqtt_client);

void heater_turn_on();

void heater_turn_off();


#ifdef __cplusplus
}
#endif

#endif // __HEATER_H__
