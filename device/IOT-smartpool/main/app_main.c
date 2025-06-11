/**
* @file app_main.c
*
* @brief 
*
* COPYRIGHT NOTICE: (c) 2025
* All rights reserved.
*/

//--------------------------------- INCLUDES ----------------------------------

#include "app_main.h"

#include "DHT11.h"
#include "heater.h"
#include "virtual_sensors.h"

//---------------------------------- MACROS -----------------------------------

// Broker URI example -> mqtt://username:password@192.168.1.100:1883
#define MQTT_BROKER_URI "mqtt://192.168.167.70:1883"

//-------------------------------- DATA TYPES ---------------------------------

//---------------------- PRIVATE FUNCTION PROTOTYPES --------------------------

static void log_error_if_nonzero(const char *message, int error_code);

static void mqtt_topic_init();
static void mqtt_app_start();
static void mqtt_handle_received_data(esp_mqtt_event_handle_t event);
static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data);

//------------------------- STATIC DATA & CONSTANTS ---------------------------

static const char *TAG = "MAIN";
static esp_mqtt_client_handle_t client;

//------------------------------- GLOBAL DATA ---------------------------------

//------------------------------ PUBLIC FUNCTIONS -----------------------------

void app_main(void)
{
    ESP_LOGI(TAG, "[APP] Startup..");
    ESP_LOGI(TAG, "[APP] Free memory: %" PRIu32 " bytes", esp_get_free_heap_size());
    ESP_LOGI(TAG, "[APP] IDF version: %s", esp_get_idf_version());

    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // Connect to Wifi
    ESP_ERROR_CHECK(example_connect());

    // Start MQTT service
    mqtt_app_start();

    // Init heater (led) module
    heater_init(client);

    // Init DHT (air temperature) sensor
    dht_init(client);

    // Init virtual sensors
    virtual_sensors_init(client);
}

//---------------------------- PRIVATE FUNCTIONS ------------------------------

static void log_error_if_nonzero(const char *message, int error_code)
{
    if (error_code != 0) {
        ESP_LOGE(TAG, "Last error %s: 0x%x", message, error_code);
    }
}

static void mqtt_topic_init()
{
    // HEATER
    int msg_id = esp_mqtt_client_subscribe(client, HEATER_MQTT_SUB_TOPIC, 1);
    ESP_LOGI(TAG, "Sent subscribe successful, msg_id=%d", msg_id);
}

static void mqtt_handle_received_data(esp_mqtt_event_handle_t event)
{
    if(strncmp(event->topic, HEATER_MQTT_SUB_TOPIC, event->topic_len) == 0)
    {
        if(strncmp(event->data, "ON", event->data_len) == 0)
        {
            heater_turn_on();
        }
        else if(strncmp(event->data, "OFF", event->data_len) == 0)
        {
            heater_turn_off();
        }
        else
        {
            ESP_LOGE(TAG, "Undefined HEATER action");
        }
    }
}

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)
{
    ESP_LOGD(TAG, "Event dispatched from event loop base=%s, event_id=%" PRIi32 "", base, event_id);
    
    esp_mqtt_event_handle_t event = event_data;
    
    switch ((esp_mqtt_event_id_t)event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(TAG, "MQTT_EVENT_CONNECTED");
            mqtt_topic_init();
            break;
        case MQTT_EVENT_DISCONNECTED:
            ESP_LOGI(TAG, "MQTT_EVENT_DISCONNECTED");
            break;
        case MQTT_EVENT_SUBSCRIBED:
            ESP_LOGI(TAG, "MQTT_EVENT_SUBSCRIBED, msg_id=%d", event->msg_id);
            break;
        case MQTT_EVENT_UNSUBSCRIBED:
            ESP_LOGI(TAG, "MQTT_EVENT_UNSUBSCRIBED, msg_id=%d", event->msg_id);
            break;
        case MQTT_EVENT_PUBLISHED:
            ESP_LOGI(TAG, "MQTT_EVENT_PUBLISHED, msg_id=%d", event->msg_id);
            break;
        case MQTT_EVENT_DATA:
            ESP_LOGI(TAG, "MQTT_EVENT_DATA");
            
            printf("TOPIC=%.*s\r\n", event->topic_len, event->topic);
            printf("DATA=%.*s\r\n", event->data_len, event->data);

            mqtt_handle_received_data(event);
            break;
        case MQTT_EVENT_ERROR:
            ESP_LOGI(TAG, "MQTT_EVENT_ERROR");
            if (event->error_handle->error_type == MQTT_ERROR_TYPE_TCP_TRANSPORT) {
                log_error_if_nonzero("reported from esp-tls", event->error_handle->esp_tls_last_esp_err);
                log_error_if_nonzero("reported from tls stack", event->error_handle->esp_tls_stack_err);
                log_error_if_nonzero("captured as transport's socket errno",  event->error_handle->esp_transport_sock_errno);
                ESP_LOGI(TAG, "Last errno string (%s)", strerror(event->error_handle->esp_transport_sock_errno));
            }
            break;
        default:
            ESP_LOGI(TAG, "Other event id:%d", event->event_id);
            break;
    }
}

static void mqtt_app_start()
{   
    esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = MQTT_BROKER_URI,
    };

    client = esp_mqtt_client_init(&mqtt_cfg);

    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    esp_mqtt_client_start(client);
}

//---------------------------- INTERRUPT HANDLERS -----------------------------


