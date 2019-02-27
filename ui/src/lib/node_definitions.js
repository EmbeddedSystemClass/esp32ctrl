export const nodes = [
    // TRIGGERS
    {
        group: 'TRIGGERS',
        type: 'timer',
        inputs: [],
        outputs: [1],
        config: [{
            name: 'timer',
            type: 'select',
            values: [1, 2, 3, 4, 5, 6, 7, 8],
        }],
        indent: true,
        toString: function () { return `timer ${this.config[0].value}`; },
        toDsl: function () { return [`\xFF\xFE\x00\xFF\x02${String.fromCharCode(this.config[0].value)}`]; }
    }, {
        group: 'TRIGGERS',
        type: 'event',
        inputs: [],
        outputs: [1],
        config: [{
            name: 'name',
            type: 'text',
        }],
        indent: true,
        toString: function () { return `event ${this.config[0].value}`; },
        toDsl: function ({ events }) { 
            const event = events.find(e => e.name === this.config[0].value);
            if (!event) return null;
            return [`\xFF\xFE\x00\xFF\x01${String.fromCharCode(event.value)}`]; 
        }
    }, {
        group: 'TRIGGERS',
        type: 'clock',
        inputs: [],
        outputs: [1],
        config: [],
        indent: true,
        toString: () => { return 'clock'; },
        toDsl: () => { return [`\xFF\xFE\x00\xFF\x03\x00`]; }
    }, {
        group: 'TRIGGERS',
        type: 'system boot',
        inputs: [],
        outputs: [1],
        config: [],
        indent: true,
        toString: function() {
            return `on boot`;
        },
        toDsl: function() {
            return [`\xFF\xFE\x00\xFF\x03\x01`];
        }
    },
    // LOGIC
    {
        group: 'LOGIC',
        type: 'if/else',
        inputs: [1],
        outputs: [1, 2],
        config: [{
            name: 'state',
            type: 'select',
            values: [],
        },{
            name: 'equality',
            type: 'select',
            values: ['changed', '=', '<', '>', '<=', '>=', '!=']
        },{
            name: 'value',
            type: 'text',
        }],
        indent: true,
        toString: function() {
            const val = this.config[0].values.find(v => v.value == this.config[0].value);
            return `IF ${val ? val.name : ''}${this.config[1].value}${this.config[2].value}`;
        },
        toDsl: function() {
            const eq = this.config[1].values.findIndex(v => v === this.config[1].value);
            const devprop = this.config[0].value.split('-').map(v => String.fromCharCode(v)).join('');
            return [`\xFC\x01${devprop}${String.fromCharCode(eq)}\x01${String.fromCharCode(this.config[2].value)}%%output%%`, `\xFD%%output%%\xFE`];
        }
    }, {
        group: 'LOGIC',
        type: 'delay',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'delay',
            type: 'number',
        }],
        toString: function() {
            return `delay: ${this.config[0].value}`;
        },
        toDsl: function() {
            return [`\xF4${String.fromCharCode(this.config[0].value)}`];
        }
    },
    // ACTIONS
    {
        group: 'ACTIONS',
        type: 'set state',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'state',
            type: 'select',
            values: [],
        }, {
            name: 'value',
            type: 'select',
            values: [0, 1],
        }],
        toString: function() {
            const val = this.config[0].values.find(v => v.value == this.config[0].value);
            return `SET ${val ? val.name : ''} = ${this.config[1].value}`;
        },
        toDsl: function() {
            const devprop = this.config[0].value.split('-').map(v => String.fromCharCode(v)).join('');
            return [`\xF0${devprop}\x01${String.fromCharCode(this.config[1].value)}`];
        }
    },
    {
        group: 'ACTIONS',
        type: 'GPIO',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'gpio',
            type: 'select',
            values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        }, {
            name: 'value',
            type: 'select',
            values: [0, 1],
        }],
        toString: function() {
            return `GPIO ${this.config[0].value}, ${this.config[1].value}`;
        },
        toDsl: function() {
            return [`GPIO,${this.config[0].value},${this.config[1].value}\n`];
        }
    }, {
        group: 'ACTIONS',
        type: 'Pulse',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'gpio',
            type: 'select',
            values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            value: 0
        }, {
            name: 'value',
            type: 'select',
            values: [0, 1],
            value: 1
        }, {
            name: 'unit',
            type: 'select',
            values: ['s', 'ms'],
            value: 'ms',
        }, {
            name: 'duration',
            type: 'number',
            value: 1000
        }],
        toString: function() {
            return `Pulse ${this.config[0].value}=${this.config[1].value} for ${this.config[3].value}${this.config[2].value}`;
        },
        toDsl: function() {
            const fn = this.config[2].value === 's' ? 'LongPulse' : 'Pulse';
            return [`${fn},${this.config[0].value},${this.config[1].value},${this.config[2].value}\n`];
        }
    }, {
        group: 'ACTIONS',
        type: 'PWM',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'gpio',
            type: 'select',
            values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            value: 0
        }, {
            name: 'value',
            type: 'number',
            value: 1023,
        }],
        toString: function() {
            return `PWM.GPIO${this.config[0].value} = ${this.config[1].value}`;
        },
        toDsl: function() {
            return [`PWM,${this.config[0].value},${this.config[1].value}\n`];
        }
    }, {
        group: 'ACTIONS',
        type: 'SERVO',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'gpio',
            type: 'select',
            values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            value: 0
        }, {
            name: 'servo',
            type: 'select',
            values: [1, 2],
            value: 0
        }, {
            name: 'position',
            type: 'number',
            value: 90,
        }],
        toString: function() {
            return `SERVO.GPIO${this.config[0].value} = ${this.config[2].value}`;
        },
        toDsl: function() {
            return [`Servo,${this.config[1].value},${this.config[0].value},${this.config[2].value}\n`];
        }
    }, {
        group: 'ACTIONS',
        type: 'fire event',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'name',
            type: 'select',
            values: (chart) => {
                const events = chart.renderedNodes.filter(node => node.type === 'event');
                return events.map((event, i) => ({
                    value: event.config[0].value, name: event.config[0].value
                }));
            }
        }],
        toString: function() {
            return `event ${this.config[0].value}`;
        },
        toDsl: function({events}) {
            const event = events.find(e => e.name === this.config[0].value);
            if (!event) return '';
            return [`\xF2${String.fromCharCode(event.value)}`];
        }
    }, {
        group: 'ACTIONS',
        type: 'settimer',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'timer',
            type: 'select',
            values: [1, 2, 3, 4, 5, 6, 7, 8],
        }, {
            name: 'value',
            type: 'number'
        }],
        toString: function() {
            return `timer${this.config[0].value} = ${this.config[1].value}`;
        },
        toDsl: function() {
            return [`\xF3${String.fromCharCode(this.config[0].value)}${String.fromCharCode(this.config[1].value)}`];
        }
    }, {
        group: 'ACTIONS',
        type: 'MQTT',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'topic',
            type: 'text',
        }, {
            name: 'command',
            type: 'text',
        }],
        toString: function() {
            return `mqtt ${this.config[1].value}`;
        },
        toDsl: function() {
            return [`Publish ${this.config[0].value},${this.config[1].value}\n`];
        }
    }, {
        group: 'ACTIONS',
        type: 'UDP',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'ip',
            type: 'text',
        }, {
            name: 'port',
            type: 'number',
        }, {
            name: 'command',
            type: 'text',
        }],
        toString: function() {
            return `UDP ${this.config[1].value}`;
        },
        toDsl: function() {
            return [`SendToUDP ${this.config[0].value},${this.config[1].value},${this.config[2].value}\n`];
        }
    }, {
        group: 'ACTIONS',
        type: 'HTTP',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'host',
            type: 'text',
        }, {
            name: 'port',
            type: 'number',
            value: 80
        }, {
            name: 'url',
            type: 'text',
        }],
        toString: function() {
            return `HTTP ${this.config[2].value}`;
        },
        toDsl: function() {
            return [`SentToHTTP ${this.config[0].value},${this.config[1].value},${this.config[2].value}\n`];
        }
    }, {
        group: 'ACTIONS',
        type: 'ESPEASY',
        inputs: [1],
        outputs: [1],
        config: [{
            name: 'device',
            type: 'number',
        }, {
            name: 'command',
            type: 'text',
        }],
        toString: function() {
            return `mqtt ${this.config[1].value}`;
        },
        toDsl: function() {
            return [`SendTo ${this.config[0].value},${this.config[1].value}\n`];
        }
    }
]