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

const pinState = [
    { name: 'Default', value: 0 },
    { name: 'Low', value: 1 },
    { name: 'High', value: 2 },
    { name: 'Input', value: 3 },
];

export const getTasks = () => {
    return settings.get('plugins').filter(p => p).map((p, i) => ({ value: p.id, name: p.name }));
};

export const getTaskValues = (config) => {
    const selectedTask = config.params.device;
    const task = settings.get('plugins').find(p => p.id === selectedTask);
    if (!task || !task.state || !task.state.values) return [];
    return task.state.values.filter(val => val).map((val, i) => ({ value: i, name: val.name }));
};


class IO_PINS {
    constructor() {
        this.digitalPins = [{ name: '-- select --', value: 255, capabilities: ['digital_in', 'analog_in', 'digital_out', 'analog_out'], configs: {}}];
        for (let i = 0; i < 40; i++) {
            const pin = {
                name: `ESP32 GPIO${i}`,
                value: i,
                capabilities: ['core', 'digital_in'],
                configs: {},
            };
            if (pin.value < 32) {
                pin.configs.pull_up = { name: `Pin ${pin.value} pull up`, type: 'checkbox' };
                pin.configs.boot_state = { name: `Pin ${pin.value} boot state`, type: 'select', options: pinState, var: `ROOT.hardware.gpio.${pin.value}` };
                pin.capabilities.push('digital_out');
            } else {
                pin.capabilities.push('analog_in');
            }
            this.digitalPins.push(pin);
        }
        
    }

    setUsedPins(allPins) {
        const resetPin = settings.get('hardware.reset.pin');
        if (resetPin) allPins.find(ap => ap.value == resetPin).disabled = "RESET";

        const ledPin = settings.get('hardware.led.gpio');
        if (ledPin) allPins.find(ap => ap.value == ledPin).disabled = "LED";

        const i2c = settings.get('hardware.i2c');
        if (i2c && i2c["enabled"]) {
            allPins.find(ap => ap.value == i2c["scl"]).disabled = "I2C";
            allPins.find(ap => ap.value == i2c["sda"]).disabled = "I2C";
        }
        const plugins = settings.get('plugins');
        plugins.filter(p => p).forEach(cur => {
            const plugin = devices.find(d => d.value === cur.type).fields;
            if (plugin.getDeviceUsedPins) {
                const pins = plugin.getDeviceUsedPins(cur);
                pins.forEach(p => {
                    allPins.find(ap => ap.value == p).disabled = cur.name;
                });
            }
        }, []);
    }

    getInterruptPins() {
        const hwpins = settings.get('hardware.gpio') || [];
        return this.digitalPins.filter((p) => hwpins[p.value] && hwpins[p.value].interrupt && hwpins[p.value].mode == 3);
    }

    getPins(capabilities) {
        if (capabilities === 'interrupt') return this.getInterruptPins();
        const plugins = settings.get('plugins');
        const startPins = copy(this.digitalPins);
        let lastNr = startPins[startPins.length-1].value;
        const pins = plugins.reduce((acc, cur, i) => {
            if (!cur) return acc;
            const plugin = devices.find(d => d.value === cur.type).fields;
            if (plugin.getDevicePins) {
                const pins = plugin.getDevicePins(cur, i);
                pins.forEach(p => {
                    p.value = ++lastNr;
                    acc.push(p);
                });
            }
            return acc;
        }, [...startPins]);
        this.setUsedPins(pins);
        const cs = Array.isArray(capabilities) ? capabilities : [capabilities];
        return pins.filter(pin => cs.every(c => pin.capabilities.includes(c)));
    }

}

export const ioPins = window.io_pins = new IO_PINS();

export const pins = window.pins = () => {
    return ioPins.getPins(['digital_in', 'digital_out']);
};