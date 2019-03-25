#ifndef ESP_PLUGIN_011_H
#define ESP_PLUGIN_011_H

#include "plugin.h"
#include "../lib/controller.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "mqtt_client.h"
#include <functional>
#include <sstream>
#include <bits/stdc++.h> 

struct subscribe_info {
    std::regex re;
    char topic[48];
    int8_t device_id_group = -1;
    int8_t value_id_group = -1;
};

class MQTTPlugin: public Plugin {
    private:
        int value = 0;
        
    public:
        bool connected = false;

        esp_mqtt_client_config_t mqtt_cfg = {};
        esp_mqtt_client_handle_t client = {};
        std::map<char*,std::function<void(char*,char*)>> registeredTopics;
        struct subscribe_info info = {};

        DEFINE_PLUGIN(MQTTPlugin);

        void subscribe(char *topic, std::function<void(char*,char*)> handler);
        void handler(char*, int, char*);
};

#endif