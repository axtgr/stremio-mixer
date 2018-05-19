"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const SCOPES = {
    error: {
        color: chalk_1.default.red,
        method: 'error',
        minLevel: 1,
    },
    info: {
        color: chalk_1.default.cyan,
        method: 'log',
        minLevel: 2,
    },
    debug: {
        color: chalk_1.default.green,
        method: 'log',
        minLevel: 3,
    },
};
exports.SCOPES = SCOPES;
class Logger {
    constructor(options) {
        this.level = 0;
        if (options) {
            this.level = options.level;
        }
    }
    log(scopeName, label, ...message) {
        let { color, method, minLevel } = SCOPES[scopeName];
        if (this.level < minLevel) {
            return;
        }
        let date = new Date();
        let timestamp = chalk_1.default.gray(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`);
        // tslint:disable-next-line:no-console
        console[method](timestamp, color(label), ...message);
    }
}
exports.default = Logger;
//# sourceMappingURL=Logger.js.map