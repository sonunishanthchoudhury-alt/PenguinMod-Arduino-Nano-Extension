# Arduino Nano Bluetooth + USB Extension for PenguinMod

A PenguinMod extension for controlling Arduino boards through:

- USB Serial
- Bluetooth (HC-05 / HC-06)
- Android Bluetooth bridge for macOS

---

# Load Extension

Paste this URL into PenguinMod's:

`Extensions → Load Extension From URL`

```text
https://raw.githubusercontent.com/sonunishanthchoudhury-alt/PenguinMod-Arduino-Nano-Extension/refs/heads/main/Arduino_Nano_Ver_3.0.js
```
Click on 'Run extension without sandbox'
---

# Downloads

Latest releases:

[Firmware and Bridge Releases](https://github.com/sonunishanthchoudhury-alt/PenguinMod-Arduino-Nano-USB/releases/tag/v1.0)


Releases include:
- Bridge.apk
- firmware.ino

---

# Features

- USB Serial support
- Bluetooth support
- Android Bluetooth bridge
- Analog read
- Digital read/write
- PWM output
- Servo control
- Ultrasonic sensor support
- Pulse output
- Cross-platform support

---

# Supported Boards

- Arduino Nano
- Arduino Uno
- Arduino Mega

---

# Supported Bluetooth Modules

- HC-05
- HC-06

---

# Supported Platforms

## USB Mode

- Windows
- macOS
- Linux

## Bluetooth Mode

### Windows
Native COM port support

### macOS
Requires Android bridge app

### Linux
May work natively depending on browser support

---

# IMPORTANT

Pins 10 and 11 are reserved in Bluetooth mode.

Do NOT use:
- D10
- D11

because SoftwareSerial uses them for the Bluetooth module.

---

# Repository Files

## Extension
`Arduino_Nano_Ver_3.0.js`

## Firmware
`firmware.ino`

## Android Bridge
`Bridge.apk`

---

# FIRMWARE INSTALLATION

## 1. Install Arduino IDE

https://www.arduino.cc/en/software

---

## 2. Open firmware

Open:
`firmware.ino`

---

## 3. Select board

Tools → Board → Arduino Nano

---

## 4. Select processor

ATmega328P

---

## 5. Select correct COM port

---

## 6. Upload firmware

---

# HC-05 / HC-06 WIRING

## HC-05 Wiring

HC-05 TX → Arduino D10  
HC-05 RX → Arduino D11 through voltage divider  
HC-05 GND → GND  
HC-05 VCC → 5V  

---

## HC-06 Wiring

HC-06 TX → Arduino D10  
HC-06 RX → Arduino D11 through voltage divider  
HC-06 GND → GND  
HC-06 VCC → 5V  

---

# IMPORTANT

Do NOT directly connect Arduino TX to HC-05/HC-06 RX.

Use a voltage divider:

Arduino TX → 1K resistor → HC RX  
HC RX → 2K resistor → GND  

---

# DEFAULT BAUD RATES

Most modules use:

`9600 baud`

Recommended speed:

`38400 baud`

---

# CHANGING HC-05 BAUD RATE TO 38400

## Entering AT Mode

1. Disconnect HC-05 TX/RX wires
2. Hold the small button on the HC-05
3. While holding the button, power the module
4. Keep holding for about 2 seconds
5. LED should blink slowly (about once every 2 seconds)

That means HC-05 entered AT mode.

---

## Temporary Arduino AT Firmware

```cpp
#include <SoftwareSerial.h>

SoftwareSerial BT(10, 11);

void setup() {

    Serial.begin(38400);

    BT.begin(38400);

    Serial.println("AT MODE READY");
}

void loop() {

    if (Serial.available()) {
        BT.write(Serial.read());
    }

    if (BT.available()) {
        Serial.write(BT.read());
    }
}
```

---

## Open Serial Monitor

Settings:
- Baud: 38400
- Line ending: Both NL & CR

Send:

```text
AT
```

Expected response:

```text
OK
```

Then send:

```text
AT+UART=38400,0,0
```

Expected response:

```text
OK
```

Power cycle the HC-05.

Now the module uses:
`38400 baud`

---

# IMPORTANT

Change the real firmware from:

```cpp
BT.begin(9600);
```

to:

```cpp
BT.begin(38400);
```

---

# CHANGING HC-06 BAUD RATE TO 38400

## IMPORTANT

HC-06 AT mode works differently from HC-05.

HC-06 automatically accepts AT commands when NOT connected.

---

## Temporary Arduino AT Firmware

```cpp
#include <SoftwareSerial.h>

SoftwareSerial BT(10, 11);

void setup() {

    Serial.begin(9600);

    BT.begin(9600);

    Serial.println("HC-06 AT READY");
}

void loop() {

    if (Serial.available()) {
        BT.write(Serial.read());
    }

    if (BT.available()) {
        Serial.write(BT.read());
    }
}
```

---

## Open Serial Monitor

Settings:
- Baud: 9600
- Line ending: No line ending

Send:

```text
AT
```

Expected response:

```text
OK
```

Then send:

```text
AT+BAUD6
```

Expected response:

```text
OK38400
```

Now HC-06 uses:
`38400 baud`

---

# IMPORTANT

Change the real firmware from:

```cpp
BT.begin(9600);
```

to:

```cpp
BT.begin(38400);
```

---

# RECOMMENDED BAUD RATES

| Baud Rate | Notes |
|---|---|
| 9600 | Most compatible, slowest |
| 38400 | Recommended |
| 57600 | Faster but may become unstable |
| 115200 | Not recommended with SoftwareSerial |

---

# USING USB MODE

1. Connect Arduino using USB
2. Open PenguinMod
3. Load extension
4. Click:
   `Connect Arduino through USB`
5. Select Arduino serial port
6. Start using blocks

---

# USING BLUETOOTH MODE ON WINDOWS

## 1. Pair HC-05 or HC-06

Windows Settings → Bluetooth & devices

PIN is usually:
- `1234`
- or `0000`

---

## 2. Windows creates COM port automatically

Example:
`COM7`

---

## 3. Open PenguinMod

Load extension.

---

## 4. Click

`Connect Arduino through Bluetooth`

---

## 5. Select HC-05/HC-06 COM port

Use blocks normally.

---

# USING BLUETOOTH MODE ON macOS

macOS does not allow direct Web Serial access to HC-05/HC-06 modules.

An Android phone is required as a Bluetooth bridge.

---

# Requirements

- Android phone
- USB cable
- ADB installed on Mac
- Bridge.apk installed on Android

---

# Setup

## 1. Install Bridge.apk on Android

---

## 2. Enable Developer Options

---

## 3. Enable USB Debugging

---

## 4. Connect Android phone to Mac using USB

---

## 5. Open Bridge app

---

## 6. Grant permissions

---

## 7. Wait for:

```text
Bluetooth connected
SERVER STARTED
```

---

## 8. Run on Mac terminal

```bash
adb forward --remove-all
adb forward tcp:9001 tcp:9001
```

---

## 9. Open PenguinMod

---

## 10. Load extension

---

## 11. Click

`Connect Arduino through Bluetooth`

---

## 12. Use blocks normally

---

# TROUBLESHOOTING

## HC-05 / HC-06 not connecting

- Verify baud rate
- Verify wiring
- Verify voltage divider
- Make sure pins 10 and 11 are unused

---

## Bluetooth slow

- Increase baud rate to 38400
- Reduce debug logging

---

## No serial port

- Reconnect USB
- Restart browser
- Restart Arduino

---

## NaN values

- Check Bluetooth connection
- Verify firmware uploaded correctly

---

## Android app stuck on "Starting server"

- Ensure INTERNET permission exists
- Reinstall app

---

## Extension not loading

- Check the latest extension line at top of this file

---

# License

MIT License

This project is open source.
You are free to use, modify, and distribute it.
