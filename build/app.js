"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const stremio_addons_1 = require("stremio-addons");
const express = require("express");
const env = require("common-env");
const Mixer_1 = require("./Mixer");
// tslint:disable-next-line:no-var-requires
const pkg = require('../package.json');
const config = env().getOrElseAll({
    stremio_mixer: {
        host: 'localhost',
        port: 80,
        cache: true,
        announce: false,
        email: '',
    },
}).stremio_mixer;
const ADDRESS = `http://${config.host}:${config.port}`;
const MANIFEST = {
    name: 'Mixer',
    id: 'org.stremio.mixer',
    version: pkg.version,
    description: pkg.description,
    email: config.email,
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
    endpoint: `${ADDRESS}/stremioget/stremio/v1`,
    logo: `${ADDRESS}/logo.png`,
    background: `${ADDRESS}/background.jpg`,
};
let mixer = new Mixer_1.default({
    idProperty: MANIFEST.idProperty,
    cache: config.cache,
});
let methods = {
    'meta.get': (req, cb) => {
        return mixer.getChannel(req).then((res) => cb(null, res), (err) => {
            // tslint:disable-next-line:no-console
            console.error(err);
            cb(err);
        });
    },
    'meta.find': (req, cb) => {
        return mixer.findChannels(req).then((res) => cb(null, res), (err) => {
            // tslint:disable-next-line:no-console
            console.error(err);
            cb(err);
        });
    },
    'meta.search': (req, cb) => {
        return mixer.findChannels(req).then((res) => cb(null, res), (err) => {
            // tslint:disable-next-line:no-console
            console.error(err);
            cb(err);
        });
    },
    'stream.find': (req, cb) => {
        return mixer.getStreams(req).then((res) => cb(null, res), (err) => {
            // tslint:disable-next-line:no-console
            console.error(err);
            cb(err);
        });
    },
};
let addon = new stremio_addons_1.Server(methods, MANIFEST);
// If this is the entry module, run the addon
if (require.main === module) {
    let app = express();
    app.use(express.static('public'));
    app.use(addon.middleware);
    app.listen(config.port, () => {
        // tslint:disable-next-line:no-console
        console.log(`Stremio Mixer listening on ${ADDRESS}`);
        if (!MANIFEST.dontAnnounce) {
            // tslint:disable-next-line:no-console
            console.log('Announcing the endpoint to Stremio tracker');
        }
    });
}
exports.default = addon;
//# sourceMappingURL=app.js.map