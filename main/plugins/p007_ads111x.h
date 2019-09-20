#ifndef ESP_PLUGIN_007_H
#define ESP_PLUGIN_007_H

#include "plugin_defs.h"
#include "../../components/i2c_devices/others/ADS1115/include/ADS1115.h"

class ADS111xPlugin: public Plugin {
    private:
        int value = 0;
        Type value_t = Type::integer;
        ADS1115 *adc0;
        uint8_t addr;
        struct IO_DIGITAL_PINS pins;
    public:
        DEFINE_PPLUGIN(ADS111xPlugin, 7);
};

#endif