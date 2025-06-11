/**
* @file virtual_sensors.c
*
* @brief 
*
* COPYRIGHT NOTICE: (c) 2025
* All rights reserved.
*/

//--------------------------------- INCLUDES ----------------------------------

#include "virtual_sensors.h"

#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include <math.h>
#include <time.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "esp_log.h"

//---------------------------------- MACROS -----------------------------------

//-------------------------------- DATA TYPES ---------------------------------

typedef struct {
    float current_temp;
    bool is_heating;
} water_temp_state_t;

//---------------------- PRIVATE FUNCTION PROTOTYPES --------------------------

static void virtual_water_level_sensor_task(void *arg);
static void virtual_chlorine_sensor_task(void *arg);
static void virtual_water_temp_level_task(void *arg);

//------------------------- STATIC DATA & CONSTANTS ---------------------------

static esp_mqtt_client_handle_t local_mqtt_client;
static water_temp_state_t water_temp_state = {
    .current_temp = VIRTUAL_SENSOR_WATER_TEMP_DEFAULT,
    .is_heating = false
};

//------------------------------- GLOBAL DATA ---------------------------------

//------------------------------ PUBLIC FUNCTIONS -----------------------------

void virtual_sensors_init(esp_mqtt_client_handle_t mqtt_client)
{
    local_mqtt_client = mqtt_client;

    xTaskCreate(&virtual_water_level_sensor_task, "Virtual_water_level_task", 5 * 1024, NULL, 5, NULL);
    xTaskCreate(&virtual_chlorine_sensor_task, "Virtual_chlorine_task", 5 * 1024, NULL, 5, NULL);
    xTaskCreate(&virtual_water_temp_level_task, "Virtual_water_temp_task", 5 * 1024, NULL, 5, NULL);
}

void virtual_sensors_water_temp_start_heating()
{
    water_temp_state.is_heating = true;
}

void virtual_sensors_water_temp_stop_heating()
{
    water_temp_state.is_heating = false;
}

//---------------------------- PRIVATE FUNCTIONS ------------------------------

void virtual_water_level_sensor_task(void *arg)
{
    srand(time(NULL));
    
    while (1) 
    {
        // Generate water level with oscillation around the base
        float variation = ((rand() % 200) - 100) / 100.0f * VIRTUAL_SENSOR_WATER_LEVEL_VARIATION;
        float water_level = VIRTUAL_SENSOR_WATER_LEVEL_BASE + variation;
        
        // Publish to MQTT
        char message[10];
        snprintf(message, sizeof(message), "%.2f", water_level);
        esp_mqtt_client_publish(local_mqtt_client, VIRTUAL_SENSOR_WATER_LEVEL_MQTT_PUB_TOPIC, message, 0, 0, 0);
        
        vTaskDelay(VIRTUAL_SENSOR_WATER_LEVEL_PERIOD_MS / portTICK_PERIOD_MS);
    }
}

void virtual_chlorine_sensor_task(void *arg)
{
    srand(time(NULL) + 1); // Different seed for different random sequence
    
    while (1) 
    {
        // Generate chlorine level with oscillation around the base
        float variation = ((rand() % 200) - 100) / 100.0f * VIRTUAL_SENSOR_CHLORINE_VARIATION;
        float chlorine_level = VIRTUAL_SENSOR_CHLORINE_BASE + variation;
        
        // Publish to MQTT
        char message[10];
        snprintf(message, sizeof(message), "%.2f", chlorine_level);
        esp_mqtt_client_publish(local_mqtt_client, VIRTUAL_SENSOR_CHLORINE_MQTT_PUB_TOPIC, message, 0, 0, 0);
        
        vTaskDelay(VIRTUAL_SENSOR_CHLORINE_PERIOD_MS / portTICK_PERIOD_MS);
    }
}

void virtual_water_temp_level_task(void *arg)
{   
    while (1) 
    {
        if (water_temp_state.is_heating) 
        {
            water_temp_state.current_temp += VIRTUAL_SENSOR_WATER_TEMP_HEATING_RATE;
        } 
        else 
        {
            water_temp_state.current_temp -= VIRTUAL_SENSOR_WATER_TEMP_COOLING_RATE;
            if (water_temp_state.current_temp < VIRTUAL_SENSOR_WATER_TEMP_MIN) 
            {
                water_temp_state.current_temp = VIRTUAL_SENSOR_WATER_TEMP_MIN;
            }
        }
        
        // Publish to MQTT
        char message[5];
        snprintf(message, sizeof(message), "%.2f", water_temp_state.current_temp);
        esp_mqtt_client_publish(local_mqtt_client, VIRTUAL_SENSOR_WATER_TEMP_MQTT_PUB_TOPIC, message, 0, 0, 0);
        
        vTaskDelay(VIRTUAL_SENSOR_WATER_TEMP_PERIOD_MS / portTICK_PERIOD_MS);
    }
}

//---------------------------- INTERRUPT HANDLERS -----------------------------