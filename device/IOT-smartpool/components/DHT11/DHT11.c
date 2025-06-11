/**
* @file DHT11.c
*
* @brief 
*
* COPYRIGHT NOTICE: (c) 2025
* All rights reserved.
*/

//--------------------------------- INCLUDES ----------------------------------

#include "DHT11.h"

#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "esp_log.h"

#include "dht.h"

//---------------------------------- MACROS -----------------------------------

//-------------------------------- DATA TYPES ---------------------------------

//---------------------- PRIVATE FUNCTION PROTOTYPES --------------------------

static void dht_task(void *arg);

//------------------------- STATIC DATA & CONSTANTS ---------------------------

static esp_mqtt_client_handle_t local_mqtt_client;

//------------------------------- GLOBAL DATA ---------------------------------

//------------------------------ PUBLIC FUNCTIONS -----------------------------

void dht_init(esp_mqtt_client_handle_t mqtt_client)
{   
    // Just a dummy first read so that error clears and sensor initalises

    float dht11_temp, dht11_humid;
    dht_read_float_data(DHT_TYPE_DHT11, (gpio_num_t)DHT11_GPIO, &dht11_humid, &dht11_temp);

    local_mqtt_client = mqtt_client;

    xTaskCreate(&dht_task, "DHT11_task", 5 * 1024, NULL, 5, NULL);
}

//---------------------------- PRIVATE FUNCTIONS ------------------------------

void dht_task(void *arg)
{
    while(1)
    {
        float dht11_temp, dht11_humid;
        esp_err_t err = dht_read_float_data(DHT_TYPE_DHT11, (gpio_num_t)DHT11_GPIO, &dht11_humid, &dht11_temp);
        if(err == ESP_OK)
        {
            ESP_LOGI(DHT11_TAG, "DHT11 -> temp: %.2f, humidity: %.2f", dht11_temp, dht11_humid);
            
            char dht_str_buf[6];
            snprintf(dht_str_buf, 6, "%.2f", dht11_temp);
            esp_mqtt_client_publish(local_mqtt_client, DHT11_MQTT_PUB_TOPIC, dht_str_buf, 0, 0, 0);
        }

        vTaskDelay(DTH11_SLEEP_PERIOD_MS / portTICK_PERIOD_MS); 
    }
}

//---------------------------- INTERRUPT HANDLERS -----------------------------


