#include <SoftwareSerial.h>
#include <Servo.h>

// 🔵 Bluetooth
SoftwareSerial BT(10, 11); // RX, TX

// 🔵 Servo support (up to 4 servos)
Servo servos[4];
int servoPins[4] = {-1, -1, -1, -1};


bool streaming = false;

String cmd = "";

void setup() {
  Serial.begin(115200);
  BT.begin(38400);

  pinMode(LED_BUILTIN, OUTPUT);
}

// 🔥 Attach servo dynamically
void attachServo(int pin) {
  for (int i = 0; i < 4; i++) {
    if (servoPins[i] == pin) return; // already attached
    if (servoPins[i] == -1) {
      servos[i].attach(pin);
      servoPins[i] = pin;
      return;
    }
  }
}

// 🔥 Handle commands
void handleCommand(String cmd) {
  cmd.trim();

  // 🔵 ANALOG READ
  if (cmd.startsWith("AREAD")) {
    int pin = cmd.substring(5).toInt();
    int val = analogRead(pin);
    Serial.println(val);
    BT.println(val);
  }

  // 🔵 DIGITAL READ
  else if (cmd.startsWith("DREAD")) {
    int pin = cmd.substring(5).toInt();
    pinMode(pin, INPUT);
    int val = digitalRead(pin);
    Serial.println(val);
    BT.println(val);
  }

  // 🔵 DIGITAL WRITE
  else if (cmd.startsWith("DWRITE")) {
    int s = cmd.indexOf(' ');
    int pin = cmd.substring(6, s).toInt();
    int val = cmd.substring(s + 1).toInt();

    pinMode(pin, OUTPUT);
    digitalWrite(pin, val);
  }

  // 🔵 PWM
  else if (cmd.startsWith("PWM")) {
    int s = cmd.indexOf(' ');
    int pin = cmd.substring(3, s).toInt();
    int val = cmd.substring(s + 1).toInt();

    pinMode(pin, OUTPUT);
    analogWrite(pin, val);
  }

  // 🔵 PIN MODE
  else if (cmd.startsWith("PMODE")) {
    int s = cmd.indexOf(' ');
    int pin = cmd.substring(5, s).toInt();
    String mode = cmd.substring(s + 1);

    if (mode == "INPUT") pinMode(pin, INPUT);
    else if (mode == "INPUT_PULLUP") pinMode(pin, INPUT_PULLUP);
    else if (mode == "OUTPUT") pinMode(pin, OUTPUT);
  }

  // 🔵 SERVO WRITE → SERVO9 90
  else if (cmd.startsWith("SERVO")) {
    int s = cmd.indexOf(' ');
    int pin = cmd.substring(5, s).toInt();
    int angle = cmd.substring(s + 1).toInt();

    attachServo(pin);

    for (int i = 0; i < 4; i++) {
      if (servoPins[i] == pin) {
        servos[i].write(angle);
      }
    }
  }

  // 🔵 ULTRASONIC → ULTRA trig echo
  else if (cmd.startsWith("ULTRA")) {
    int s1 = cmd.indexOf(' ');
    int s2 = cmd.indexOf(' ', s1 + 1);

    int trig = cmd.substring(s1 + 1, s2).toInt();
    int echo = cmd.substring(s2 + 1).toInt();

    pinMode(trig, OUTPUT);
    pinMode(echo, INPUT);

    digitalWrite(trig, LOW);
    delayMicroseconds(2);

    digitalWrite(trig, HIGH);
    delayMicroseconds(10);
    digitalWrite(trig, LOW);

    long duration = pulseIn(echo, HIGH, 30000); // timeout 30ms
    int distance = duration * 0.034 / 2;

    Serial.println(distance);
    BT.println(distance);
  }

  // 🔵 PULSE OUT
  else if (cmd.startsWith("PULSEOUT")) {
    int s = cmd.indexOf(' ');
    int pin = cmd.substring(8, s).toInt();
    int dur = cmd.substring(s + 1).toInt();

    pinMode(pin, OUTPUT);
    digitalWrite(pin, HIGH);
    delayMicroseconds(dur);
    digitalWrite(pin, LOW);
  }

  // 🔵 PULSE IN
  else if (cmd.startsWith("PULSEIN")) {
    int pin = cmd.substring(7).toInt();

    pinMode(pin, INPUT);
    long dur = pulseIn(pin, HIGH);

    Serial.println(dur);
    BT.println(dur);
  }

  // 🔵 STREAM
  else if (cmd == "ST") streaming = true;
  else if (cmd == "SP") streaming = false;
}

void loop() {

  // 🔥 Bluetooth first
  if (BT.available()) {
    cmd = BT.readStringUntil('\n');
    handleCommand(cmd);
    Serial.print("ECHO:");
    Serial.println(cmd);
  }

  // 🔥 USB
  if (Serial.available()) {
    cmd = Serial.readStringUntil('\n');
    handleCommand(cmd);
  }

  // 🔥 streaming (non-blocking)
  static unsigned long last = 0;

  if (millis() - last > 50) {
    last = millis();
  }
}
