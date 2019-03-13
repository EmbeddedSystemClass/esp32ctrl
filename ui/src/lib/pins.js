import { settings } from "./settings";
import { devices } from "../devices";

function copy(o) {
    var output, v, key;
    output = Array.isArray(o) ? [] : {};
    for (key in o) {
        v = o[key];
        output[key] = (typeof v === "object") ? copy(v) : v;
    }
    return output;
}

class IO_PINS {
    constructor() {
        this.digitalPins = [];
        this.analogPins = [];

        for (let i = 0; i < 40; i++) {
            const pin = {
                name: `ESP32 GPIO${i}`,
                value: i,
                capabilities: ['digital_in'],
            };
            if (pin.value < 32) {
                pin.capabilities.push('digital_out');
                this.digitalPins.push(pin);
            } else {
                pin.capabilities.push('analog_in');
                this.analogPins.push(pin);
            }
            
        }

        for (let i = 0; i < 16; i++) {
            this.analogPins.push({
                name: `ESP32 A${i}`,
                value: i,
            });
        }
    }

    setUsedPins(allPins) {
        const resetPin = settings.get('hardware.reset.pin');
        if (resetPin) allPins.find(ap => ap.value == resetPin).disabled = "RESET";

        const ledPin = settings.get('hardware.led.gpio');
        if (ledPin) allPins.find(ap => ap.value == ledPin).disabled = "LED";

        const i2c = settings.get('hardware.i2c');
        if (i2c["enabled"]) {
            allPins.find(ap => ap.value == i2c["scl"]).disabled = "I2C";
            allPins.find(ap => ap.value == i2c["sda"]).disabled = "I2C";
        }
        const plugins = settings.get('plugins');
        plugins.forEach(cur => {
            const plugin = devices.find(d => d.value === cur.type).fields;
            if (plugin.getDeviceUsedPins) {
                const pins = plugin.getDeviceUsedPins(cur);
                pins.forEach(p => {
                    allPins.find(ap => ap.value === p).disabled = cur.name;
                });
            }
        }, []);
    }

    getPins(capabilities) {
        const plugins = settings.get('plugins');
        const startPins = copy(this.digitalPins);
        const pins = plugins.reduce((acc, cur) => {
            const plugin = devices.find(d => d.value === cur.type).fields;
            if (plugin.getDeviceDigitalPins) {
                const pins = plugin.getDeviceDigitalPins(cur);
                const start = acc.length;
                pins.forEach(p => {
                    p.value += start;
                    acc.push(p);
                });
            }
            return acc;
        }, [...startPins]);
        this.setUsedPins(pins);
        const cs = Array.isArray(capabilities) ? capabilities : [capabilities];
        return pins.filter(pin => cs.every(c => pin.capabilities.includes(c)));
    }

    getAnalogPins(capabilities) {
        const plugins = settings.get('plugins');
        const startPins = copy(this.analogPins);
        const pins = plugins.reduce((acc, cur) => {
            const plugin = devices.find(d => d.value === cur.type).fields;
            if (plugin.getDeviceAnalogPins) {
                const pins = plugin.getDeviceAnalogPins(cur);
                const start = acc.length;
                pins.forEach(p => {
                    p.value += start;
                    acc.push(p);
                });
            }
            return acc;
        }, [...startPins]);
        //this.setUsedPins(pins);
        return pins;
        const cs = Array.isArray(capabilities) ? capabilities : [capabilities];
        return pins.filter(pin => cs.every(c => pin.capabilities.includes(c)));
    }

}

export const ioPins = window.io_pins = new IO_PINS();

export const pins = window.pins = () => {
    return ioPins.getPins(['digital_in', 'digital_out']);
};