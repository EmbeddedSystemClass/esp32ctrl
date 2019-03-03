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
        JsonObject *cfg;
        uint8_t addr;
        struct IO_DIGITAL_PINS pins;
    public:
        Plugin* clone() const {
            return new PCF8574Plugin;
        }

        bool init(JsonObject &params);
        bool setState(JsonObject &params);
        bool setConfig(JsonObject &params);
        bool getState(JsonObject& );
        bool getConfig(JsonObject& );
        static void task(void *pvParameters);
        void* getStatePtr(uint8_t );
        void setStatePtr(uint8_t, uint8_t*);

        static esp_err_t setDirection(uint8_t, uint8_t);
        static esp_err_t digitalWrite(uint8_t, uint8_t);
        static uint8_t digitalRead(uint8_t);
};

#endif