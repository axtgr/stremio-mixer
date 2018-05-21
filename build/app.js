"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const stremio_addons_1 = require("stremio-addons");
const express = require("express");
const env = require("common-env");
const chalk_1 = require("chalk");
const request_ip_1 = require("request-ip");
const Mixer_1 = require("./Mixer");
const Logger_1 = require("./Logger");
// tslint:disable-next-line:no-var-requires
const pkg = require('../package.json');
const config = env().getOrElseAll({
    stremio_mixer: {
        client_id: '',
        address: 'http://localhost',
        port: process.env.PORT || 80,
        cache: true,
        announce: false,
        email: '',
        log: 1,
    },
}).stremio_mixer;
if (!config.client_id) {
    throw new Error('Mixer Client ID is required');
}
const MANIFEST = {
    name: 'Mixer',
    id: 'org.stremio.mixera',
    version: pkg.version,
    description: pkg.description,
    email: config.email,
    contactEmail: config.email,
    types: ['tv'],
    idProperty: 'mixer_id',
    dontAnnounce: !config.announce,
    isFree: true,
    sorts: [
        {
            prop: 'popularities.mixer',
            name: 'Mixer',
            types: ['tv'],
        },
    ],
    endpoint: `${config.address}/stremioget/stremio/v1`,
    logo: `${config.address}/logo.png`,
    background: `${config.address}/background.jpg`,
    // OBSOLETE: used in pre-4.0 stremio instead of idProperty/types
    filter: {
        'query.mixer_id': { $exists: true },
        'query.type': { $in: ['tv'] },
    },
};
let logger = new Logger_1.default({ level: config.log });
let mixer = new Mixer_1.default({
    clientId: config.client_id,
    idProperty: MANIFEST.idProperty,
    cache: config.cache,
});
let methods = {
    'meta.get': (req, cb) => {
        logger.log('info', 'meta.get', req);
        return mixer.getChannel(req).then((res) => cb(null, res), (err) => {
            logger.log('error', 'error', err);
            cb(err);
        });
    },
    'meta.find': (req, cb) => {
        logger.log('info', 'meta.find', req);
        return mixer.findChannels(req).then((res) => cb(null, res), (err) => {
            logger.log('error', 'error', err);
            cb(err);
        });
    },
    'meta.search': (req, cb) => {
        logger.log('info', 'meta.search', req);
        return mixer.findChannels(req).then((res) => cb(null, res), (err) => {
            logger.log('error', 'error', err);
            cb(err);
        });
    },
    'stream.find': (req, cb) => {
        logger.log('info', 'stream.find', req);
        return mixer.getStreams(req).then((res) => cb(null, res), (err) => {
            logger.log('error', 'error', err);
            cb(err);
        });
    },
};
let addon = new stremio_addons_1.Server(methods, MANIFEST);
// If this is the entry module, run the addon
if (require.main === module) {
    let app = express();
    app.use((req, res, next) => {
        logger.log('debug', 'request', request_ip_1.getClientIp(req), req.method, req.url);
        next();
    });
    app.use(express.static('public'));
    app.use(addon.middleware);
    app.listen(config.port, () => {
        // Prints "mixer" ASCII art in its brand colors
        // and the endpoint address
        // tslint:disable-next-line:no-console
        console.log(`\
${chalk_1.default.white('            _')}
${chalk_1.default.white('           (_)')}
${chalk_1.default.white(' _ __ ___   _ __ ')}${chalk_1.default.cyan(' __  ___  _ __')}
${chalk_1.default.white("| '_ ` _ \\ | |\\ \\")}${chalk_1.default.cyan("/ / / _ \\| '__|")}
${chalk_1.default.white('| | | | | || | > ')}${chalk_1.default.cyan(' < |  __/| |')}
${chalk_1.default.white('|_| |_| |_||_|/_/')}${chalk_1.default.cyan('\\_\\ \\___||_|')}



${chalk_1.default.cyan(MANIFEST.endpoint)}

`);
    });
}
exports.default = addon;
//# sourceMappingURL=app.js.map