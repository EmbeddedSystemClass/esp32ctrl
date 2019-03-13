#include "io.h"

std::list<struct IO_DIGITAL_PINS*> IO::io_d_pins;

void IO::addDigitalPins(uint8_t number, struct IO_DIGITAL_PINS *pins) {
    pins->start = io_d_pins.empty() ? 0 : io_d_pins.back()->end + 1;
    pins->end = pins->start + number - 1;
    io_d_pins.push_back(pins);
}

struct IO_DIGITAL_PINS* IO::getDigitalPin(uint8_t pin_nr) {
    ESP_LOGI("IO", "getting digital pin %d", pin_nr);
    for (struct IO_DIGITAL_PINS *pin: io_d_pins) {
        if (pin_nr >= pin->start && pin_nr <= pin->end) {
            ESP_LOGI("IO", "found pin %d, %p, %p ,%p", pin->start, pin->digital_read, pin->digital_write, pin->set_direction);
            return pin;
        }
    }
    return NULL;
}

uint8_t IO::digitalRead(uint8_t pin) {
    return (*(getDigitalPin(pin)->digital_read))(pin);
}

esp_err_t IO::digitalWrite(uint8_t pin, bool value) {
    return (*(getDigitalPin(pin)->digital_write))(pin, value);
}

uint16_t IO::analogRead(uint8_t pin) {
    return (*(getDigitalPin(pin)->analog_read))(pin);
}

esp_err_t IO::analogWrite(uint8_t pin, uint16_t value) {
    return (*(getDigitalPin(pin)->analog_write))(pin, value);
}

esp_err_t IO::setDirection(uint8_t pin, uint8_t direction) {
    return (*(getDigitalPin(pin)->set_direction))(pin, direction);
}