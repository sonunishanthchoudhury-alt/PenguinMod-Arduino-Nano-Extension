(function(Scratch) {
    'use strict';

    class ArduinoNanoExtension {
        constructor() {
            this.port = null;
            this.reader = null;
            this.writer = null;
            this.socket = null;

            this.mode = null;
            this.usbData = {};
			this.pending = [];
        }
		
		isPinBlocked(pin) {
        return this.mode === "bt" && (pin == 10 || pin == 11);
}

        getInfo() {
            return {
                id: 'arduinonano',
                name: 'Arduino Nano',

                color1: '#268891',
                color2: '#000000',

                blocks: [
                    // ---- CONNECTION ----
                    { opcode: 'connectUSB', blockType: Scratch.BlockType.COMMAND, text: 'connect Arduino through USB' },
                    { opcode: 'connectBluetooth', blockType: Scratch.BlockType.COMMAND, text: 'connect Arduino through Bluetooth (If on Mac with HC-05)' },

                    // ---- PIN MODE ----
                    {
                        opcode: 'pinMode',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set pin [PIN] mode [MODE]',
                        arguments: {
                            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 },
                            MODE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'pinModes'
                            }
                        }
                    },

                    // ---- READ ----
                    {
                        opcode: 'readAnalog',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'analog read [PIN]',
                        arguments: { PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 } }
                    },
                    {
                        opcode: 'readDigital',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'digital read [PIN]',
                        arguments: { PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 } }
                    },

                    // ---- WRITE ----
                    {
                        opcode: 'digitalWrite',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set pin [PIN] to [VALUE]',
                        arguments: {
                            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 9 },
                            VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'pwm',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'PWM pin [PIN] value [VALUE]',
                        arguments: {
                            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 9 },
                            VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 255 }
                        }
                    },
                    {
                        opcode: 'servo',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'servo pin [PIN] angle [ANGLE]',
                        arguments: {
                            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 9 },
                            ANGLE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 }
                        }
                    },

                    // ---- ULTRASONIC ----
                    {
                        opcode: 'ultrasonic',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'ultrasonic trig [TRIG] echo [ECHO]',
                        arguments: {
                            TRIG: { type: Scratch.ArgumentType.NUMBER, defaultValue: 7 },
                            ECHO: { type: Scratch.ArgumentType.NUMBER, defaultValue: 8 }
                        }
                    },

                    // ---- PULSE ----
                    {
                        opcode: 'pulseOut',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'pulse pin [PIN] for [TIME] microseconds',
                        arguments: {
                            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 },
                            TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
                        }
                    },
                    {
                        opcode: 'pulseIn',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'read pulse on pin [PIN]',
                        arguments: {
                            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 }
                        }
                    }
                ],

                menus: {
                    pinModes: {
                        acceptReporters: true,
                        items: ['INPUT', 'INPUT_PULLUP', 'OUTPUT']
                    }
                }
            };
        }

        // ---------------- CONNECTION ----------------
        async connectUSB() {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: 115200 });

            this.writer = this.port.writable.getWriter();
            this.reader = this.port.readable.getReader();

            this.mode = "usb";
            this.readUSBLoop();
        }

        // ---------------- BLUETOOTH ----------------
connectBluetooth() {
    this.socket = new WebSocket("ws://127.0.0.1:9001");

    this.mode = "bt";
    console.log("✅ Mode set to BT");

    this.socket.onopen = () => {
        console.log("✅ WebSocket OPEN");
        this.socket.send("BT\n");
    };

    this.socket.onmessage = (e) => {
        console.log("📥 From App:", e.data);

        if (this.pending.length > 0) {
            const resolve = this.pending.shift();
            resolve(Number(e.data));
        }
    };
}

// 🔥 FIXED send function
sendBT(cmd) {
    return new Promise((resolve) => {

        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.log("⚠️ Socket not ready");
            resolve(0);
            return;
        }

        console.log("📤 Sending to App:", cmd);

        this.pending.push(resolve);
        this.socket.send(cmd + "\n");
    });
}

        async readUSBLoop() {
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await this.reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split("\n");

                for (let line of lines) {
                    let parts = line.trim().split(" ");
                    if (parts.length === 3) {
                        this.usbData[parts[0] + parts[1]] = parts[2];
                    }
                }
            }
        }


        // ---------------- PIN MODE ----------------
        pinMode(args) {
            if (this.mode === "bt") {
                this.socket.send(`PMODE${args.PIN} ${args.MODE}\n`);
            }
        }

        // ---------------- READ ----------------
        readAnalog(args) {

    if (this.mode === "bt") {
        return this.sendBT(`AREAD${args.PIN}`);
    }
	
	if (this.isPinBlocked(args.PIN)) {
        console.log("⚠️ Pin blocked in Bluetooth mode:", pin);
        return 0;
    }

    if (this.mode === "usb") {
        return Number(this.usbData["A" + args.PIN] || 0);
    }

    return 0;
}

        readDigital(args) {
            if (this.mode === "usb") return Number(this.usbData["D" + args.PIN] || 0);
            if (this.mode === "bt") return this.sendBT(`DREAD${args.PIN}`);
			if (this.isPinBlocked(args.PIN)) {
        console.log("⚠️ Pin blocked in Bluetooth mode:", pin);
        return 0;
    }
            return 0;
        }

        // ---------------- WRITE ----------------
        digitalWrite(args) {
            if (this.mode === "bt") this.socket.send(`DWRITE${args.PIN} ${args.VALUE}\n`);
			if (this.isPinBlocked(args.PIN)) {
        console.log("⚠️ Pin blocked in Bluetooth mode:", pin);
        return;
    }
        }

        pwm(args) {
            if (this.mode === "bt") this.socket.send(`PWM${args.PIN} ${args.VALUE}\n`);
			if (this.isPinBlocked(args.PIN)) {
        console.log("⚠️ Pin blocked in Bluetooth mode:", pin);
        return;
    }
        }

        servo(args) {
            if (this.mode === "bt") this.socket.send(`SERVO${args.PIN} ${args.ANGLE}\n`);
			if (this.isPinBlocked(args.PIN)) {
        console.log("⚠️ Pin blocked in Bluetooth mode:", pin);
        return;
    }
        }

        ultrasonic(args) {
            if (this.mode === "bt") return this.sendBT(`ULTRA${args.TRIG}${args.ECHO}`);
			if (
                this.isPinBlocked(args.TRIG) ||
                this.isPinBlocked(args.ECHO)
) {
        console.log("⚠️ Pin blocked in Bluetooth mode:", pin);
        return;
    }
            return 0;
        }

        // ---------------- PULSE ----------------
        pulseOut(args) {
            if (this.mode === "bt") {
                this.socket.send(`PULSEOUT${args.PIN} ${args.TIME}\n`);
				if (this.isPinBlocked(args.PIN)) {
        console.log("⚠️ Pin blocked in Bluetooth mode:", pin);
        return;
    }
            }
        }

        pulseIn(args) {
            if (this.mode === "bt") {
                return this.sendBT(`PULSEIN${args.PIN}`);
				
            }
            return 0;
        }
    }

    Scratch.extensions.register(new ArduinoNanoExtension());

})(Scratch);
