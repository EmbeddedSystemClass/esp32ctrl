#include <sys/param.h>
#include "esp_event_loop.h"
#include "esp_log.h"
#include "esp_system.h"
#include "nvs_flash.h"

//#include "Arduino.h"

static const char *TAG = "MAIN";

#include "lib/config.h"
#include "lib/spiffs.h"
#include "lib/file_server.h"
#include "lib/rule_engine.h"
#include "lib/logging.h"
#include "lib/io.h"
#include "plugins/plugin.h"
#include "plugins/c001_i2c.h"
#include "plugins/c002_ntp.h"
#include "plugins/c003_wifi.h"
#include "plugins/c005_hue.h"
#include "plugins/p001_switch.h"
#include "plugins/p002_dht.h"
#include "plugins/p003_bmp280.h"
#include "plugins/p004_ds18x20.h"
#include "plugins/p005_regulator.h"
#include "plugins/p006_analog.h"
#include "plugins/p007_ads111x.h"
#include "plugins/p008_mcp23017.h"
#include "plugins/p009_pcf8574.h"
#include "plugins/p010_pca9685.h"
#include "plugins/p011_mqtt.h"

// global config object
Config *cfg;
Plugin *active_plugins[10];
I2CPlugin *i2c_plugin;
NTPPlugin *ntp_plugin;
WiFiPlugin *wifi_plugin;
HueEmulatorPlugin *hue_plugin;

IO io;

Plugin* SwitchPlugin_myProtoype = Plugin::addPrototype(1, new SwitchPlugin);
Plugin* DHTPlugin_myProtoype = Plugin::addPrototype(2, new DHTPlugin);
Plugin* BMP280Plugin_myProtoype = Plugin::addPrototype(3, new BMP280Plugin);
Plugin* DS18x20Plugin_myProtoype = Plugin::addPrototype(4, new DS18x20Plugin);
Plugin* RegulatorPlugin_myProtoype = Plugin::addPrototype(5, new RegulatorPlugin);
Plugin* AnalogPlugin_myProtoype = Plugin::addPrototype(6, new AnalogPlugin);
Plugin* ADS111xPlugin_myProtoype = Plugin::addPrototype(7, new ADS111xPlugin);
Plugin* MCP23017Plugin_myProtoype = Plugin::addPrototype(8, new MCP23017Plugin);
Plugin* PCF8574Plugin_myProtoype = Plugin::addPrototype(9, new PCF8574Plugin);
Plugin* PCA9685Plugin_myProtoype = Plugin::addPrototype(10, new PCA9685Plugin);
Plugin* MQTTPlugin_myProtoype = Plugin::addPrototype(11, new MQTTPlugin);

uint8_t ledPin;
bool ledInverted;

extern "C" void app_main()
{
    //initArduino();
    ESP_ERROR_CHECK(nvs_flash_init());
    tcpip_adapter_init();

    /* Initialize file storage */
    ESP_ERROR_CHECK(spiffs_init());

    /* Start the web server */
    ESP_ERROR_CHECK(start_file_server("/spiffs"));

    // load configuration
    cfg = new Config();
    JsonObject& cfgObject = cfg->getConfig();
    ESP_LOGI(TAG, "loaded configuration");

    uint8_t resetPin = cfgObject["hardware"]["reset"]["pin"] | 255;
    ledPin = cfgObject["hardware"]["led"]["gpio"] | 255;
    ledInverted = cfgObject["hardware"]["led"]["inverted"] | false;

    JsonObject &wifi_config = cfgObject["wifi"];
    wifi_plugin = new WiFiPlugin();
    wifi_plugin->init(wifi_config);

    //JsonObject &io_cfg = cfgObject["io"];
    struct IO_DIGITAL_PINS pins;
    pins.set_direction = new ESP_set_direction();
    pins.digital_read = new ESP_digital_read();
    pins.digital_write = new ESP_digital_write();
    pins.analog_read = new ESP_analog_read();
    io.addDigitalPins(40, &pins);

    if (cfgObject["hardware"]["i2c"]["enabled"]) {
        JsonObject &i2c_conf = cfgObject["hardware"]["i2c"];
        i2c_plugin = new I2CPlugin();
        int i2cerr = i2c_plugin->init(i2c_conf);
        if (i2cerr != ESP_OK) {
            ESP_LOGE(TAG, "i2c init: error %x", i2cerr);
        };
    }

    if (cfgObject["ntp"]["enabled"]) {
        JsonObject &ntp_conf = cfgObject["ntp"];
        ntp_plugin = new NTPPlugin();
        ntp_plugin->init(ntp_conf);
    }

    if (cfgObject["alexa"]["enabled"]) {
        JsonObject &hue_conf = cfgObject["alexa"];
        hue_plugin = new HueEmulatorPlugin();
        hue_plugin->init(hue_conf);
    }

    JsonArray &plugins = cfgObject["plugins"];
    int pi = 0;
    for (auto plugin : plugins){
        if (!plugin["enabled"]) continue;
        ESP_LOGI(TAG, "initializing plugin '%s' type: %i", plugin["name"].as<char*>(), (int)plugin["type"]);
        active_plugins[pi] = Plugin::getPluginInstance((int)plugin["type"]);
        active_plugins[pi]->name = plugin["name"].as<char*>();
        active_plugins[pi]->id = pi;
        active_plugins[pi]->init(plugin);
        pi++;
    }

    long rule_length;
    uint8_t *rules = (uint8_t*)spiffs_read_file("/spiffs/rules.dat", &rule_length);
    if (rules != NULL && rule_length > 0) {
        ESP_LOGI(TAG, "parsing rule file of size: %ld", rule_length);
        parse_rules(rules, rule_length);
    }

    init_logging();

    i2c_plugin->scan();

    for(;;) {
        // if (resetPin < 32 && gpio_get_level((gpio_num_t)resetPin) == 0) {
        //     ESP_LOGI(TAG, "reset button pressed");
        //     esp_restart();
        // }
        ESP_LOGD(TAG, "executing rule engine");
        run_rules();
        vTaskDelay( 100 / portTICK_PERIOD_MS);
    }
}

// when configuration is updated: (how to detect it ?) easiest way is to reboot ... web endpoint to save config (thru Config object), somewhere along the way we check what needs to be updated
// - reload config object ? 
// - if wifi config updated, reconnect (call initialize_wifi again)
// - stop all services and restart them
