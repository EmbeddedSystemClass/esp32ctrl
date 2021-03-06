#ifndef EspalexaDevice_h
#define EspalexaDevice_h

#include "esp_log.h"
#include <string>
#include <math.h>  
#include <functional>

#define constrain(amt,low,high) ((amt)<(low)?(low):((amt)>(high)?(high):(amt)))

typedef class EspalexaDevice;

typedef void (*BrightnessCallbackFunction) (uint8_t b);
typedef void (*DeviceCallbackFunction) (EspalexaDevice* d);
typedef void (*ColorCallbackFunction) (uint8_t br, uint32_t col);

enum class EspalexaColorMode : uint8_t { none = 0, ct = 1, hs = 2, xy = 3 };
enum class EspalexaDeviceType : uint8_t { onoff = 0, dimmable = 1, whitespectrum = 2, color = 3, extendedcolor = 4 };
enum class EspalexaDeviceProperty : uint8_t { none = 0, on = 1, off = 2, bri = 3, hs = 4, ct = 5, xy = 6 };

class EspalexaDevice {
private:
  std::string _deviceName;
  std::function<void(void*,uint8_t)> _callback = nullptr;
  uint8_t _val, _val_last, _sat = 0;
  uint16_t _hue = 0, _ct = 0;
  float _x = 0.5, _y = 0.5;
  uint32_t _rgb = 0;
  uint8_t _id = 0;
  EspalexaDeviceType _type;
  EspalexaDeviceProperty _changed = EspalexaDeviceProperty::none;
  EspalexaColorMode _mode = EspalexaColorMode::xy;
  
public:
  EspalexaDevice();
  ~EspalexaDevice();
  EspalexaDevice(std::string deviceName, std::function<void(void*,uint8_t)> dcb, EspalexaDeviceType t =EspalexaDeviceType::dimmable, uint8_t initialValue =0);
  
  std::string getName();
  uint8_t getId();
  EspalexaDeviceProperty getLastChangedProperty();
  uint8_t getValue();
  uint8_t getPercent();
  uint8_t getDegrees();
  uint16_t getHue();
  uint8_t getSat();
  uint16_t getCt();
  uint32_t getKelvin();
  float getX();
  float getY();
  uint32_t getRGB();
  uint8_t getR();
  uint8_t getG();
  uint8_t getB();
  EspalexaColorMode getColorMode();
  EspalexaDeviceType getType();
  
  void setId(uint8_t id);
  void setPropertyChanged(EspalexaDeviceProperty p);
  void setValue(uint8_t bri);
  void setPercent(uint8_t perc);
  void setName(std::string name);
  void setColor(uint16_t ct);
  void setColor(uint16_t hue, uint8_t sat);
  void setColorXY(float x, float y);
  void setColor(uint8_t r, uint8_t g, uint8_t b);
  
  void doCallback();
  
  uint8_t getLastValue(); //last value that was not off (1-255)
};

#endif