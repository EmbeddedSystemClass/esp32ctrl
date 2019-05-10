#ifndef ESP_PLUGIN_004_H
#define ESP_PLUGIN_004_H

#include "plugin_defs.h"
#include "ds18x20.h"

class DS18x20Plugin: public Plugin {
    private:
        float temperature[16];
        Type temperature_t[16];
        ds18x20_addr_t addrs[16];
        int sensor_count = 0;
        TaskHandle_t task_h;
    public:
        DEFINE_PPLUGIN(DS18x20Plugin, 4);
        static void task(void *pvParameters);
};

#endif