idf_component_register(SRCS "app_main.c"
                    INCLUDE_DIRS "."
                    PRIV_REQUIRES virtual_sensors heater DHT11 esp_wifi esp_system nvs_flash esp_event esp_netif freertos lwip log mqtt protocol_examples_common)
