#ifndef ESP_PLUGIN_009_H
#define ESP_PLUGIN_009_H

#include "plugin.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "pcf8574.h"

class PCF8574Plugin: public Plugin {
    private:
        int value = 0;
        struct IO_DIGITAL_PINS pins;
    public:
        DEFINE_PLUGIN(PCF8574Plugin);
};

#endif