#include "plugin.h"

// #include <std::string> <-- prepend namespace ... you can also add namespace to our path with "using"
// std::string var1;

std::map<int, Plugin*> Plugin::protoTable; // here we put it on sys
// new[] <-- check what does it do
// smart pointers, smart weak pointers, outer pointers
// scott myers: effective modern c++
// move operator

bool Plugin::hasType(int type) {
    return protoTable.count(type) == 1;
}

Plugin* Plugin::getPluginInstance(int type)
{
    ESP_LOGD("PLUGIN", "loading plugin instance");
    Plugin* proto = protoTable[type];
    ESP_LOGD("PLUGIN", "found plugin instance");
    ESP_LOGD("PLUGIN", "calling clone 0x%08x", (unsigned)proto);
    return proto->clone();
}

Plugin* Plugin::addPrototype(int type, Plugin* p)
{
    ESP_LOGD("PLUGIN", "registering plugin %i on 0x%08x", type, (unsigned)p);
    protoTable[type] = p;
    return p;
}