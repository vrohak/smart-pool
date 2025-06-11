/**
* @file heater.c
*
* @brief 
*
* COPYRIGHT NOTICE: (c) 2025
* All rights reserved.
*/

//--------------------------------- INCLUDES ----------------------------------
#include "heater.h"

#include <stdio.h>
#include "esp_log.h"

#include "virtual_sensors.h"

//---------------------------------- MACROS -----------------------------------

//-------------------------------- DATA TYPES ---------------------------------

//---------------------- PRIVATE FUNCTION PROTOTYPES --------------------------

//------------------------- STATIC DATA & CONSTANTS ---------------------------

static esp_mqtt_client_handle_t local_mqtt_client;
static led_strip_handle_t heater_led_handle;

//------------------------------- GLOBAL DATA ---------------------------------

//------------------------------ PUBLIC FUNCTIONS -----------------------------

void heater_init(esp_mqtt_client_handle_t mqtt_client)
{
    // LED general initialization, according to your led board design
    led_strip_config_t strip_config = {
        .strip_gpio_num = HEATER_LED_CTRL_GPIO_NUM,
        .max_leds = 1,
        .color_component_format = HEATER_LED_CTRL_LED_FORMAT,
        .led_model = HEATER_LED_MODEL,
        .flags.invert_out = false,
    };

    // LED backend configuration: RMT
    led_strip_rmt_config_t rmt_config = {
        .clk_src = RMT_CLK_SRC_DEFAULT,
        .resolution_hz = HEATER_LED_RMT_RES_HZ,
        .flags.with_dma = false,
    };

    // LED object handle
    led_strip_new_rmt_device(&strip_config, &rmt_config, &heater_led_handle);

    local_mqtt_client = mqtt_client;
    esp_mqtt_client_publish(local_mqtt_client, HEATER_MQTT_PUB_TOPIC, "OFF", 0, 0, 0);
}

void heater_turn_on()
{
    led_strip_set_pixel(heater_led_handle, 0, HEATER_LED_ON_COLOR);
    led_strip_refresh(heater_led_handle);

    virtual_sensors_water_temp_start_heating();
    esp_mqtt_client_publish(local_mqtt_client, HEATER_MQTT_PUB_TOPIC, "ON", 0, 0, 0);

    ESP_LOGI(HEATER_TAG, "Heater turned on!");
}

void heater_turn_off()
{
    led_strip_set_pixel(heater_led_handle, 0, HEATER_LED_OFF_COLOR);
    led_strip_refresh(heater_led_handle);

    virtual_sensors_water_temp_stop_heating();
    esp_mqtt_client_publish(local_mqtt_client, HEATER_MQTT_PUB_TOPIC, "OFF", 0, 0, 0);

    ESP_LOGI(HEATER_TAG, "Heater turned off!");
}

//---------------------------- PRIVATE FUNCTIONS ------------------------------

//---------------------------- INTERRUPT HANDLERS -----------------------------


