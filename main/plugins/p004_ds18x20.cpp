#include "p004_ds18x20.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

const char *P004_TAG = "DS18x20Plugin";

PLUGIN_CONFIG(DS18x20Plugin, interval, gpio)
PLUGIN_STATS(DS18x20Plugin, sensor_count, temperature[0])

void DS18x20Plugin::task(void * pvParameters)
{
    DS18x20Plugin* s = (DS18x20Plugin*)pvParameters;
    JsonObject &cfg = *(s->cfg);

    ESP_LOGI(P004_TAG, "main task: %i:%i", (unsigned)s, unsigned(s->cfg));
    for( ;; )
    {
        int interval = cfg["interval"] | 60;
        int gpio = cfg["gpio"] | 255;

        if (gpio != 255) {
            if (ds18x20_measure_and_read_multi((gpio_num_t)gpio, s->addrs, s->sensor_count, s->temperature) == ESP_OK)
                ESP_LOGI(P004_TAG, "Sensors read");
            else
                printf(P004_TAG, "Could not read data from sensor");
        }

        vTaskDelay(interval * 1000 / portTICK_PERIOD_MS);
    }
}

bool DS18x20Plugin::init(JsonObject &params) {
    cfg = &params;

    if (params["gpio"] != 255) {
        sensor_count = ds18x20_scan_devices((gpio_num_t)params["gpio"].as<int>(), addrs, 16);
    }

    xTaskCreatePinnedToCore(this->task, P004_TAG, 4096, this, 5, NULL, 1);
    return true;
}
