idf_component_register(SRCS "heater.c"
                    INCLUDE_DIRS "include"
                    REQUIRES log led_strip mqtt virtual_sensors)
