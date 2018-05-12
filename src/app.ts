import 'source-map-support/register'
import {
  Server as StremioServer,
  Request,
  SearchRequest,
  Methods,
} from 'stremio-addons'
import express = require('express')
import env = require('common-env')
import Mixer from './Mixer'

// tslint:disable-next-line:no-var-requires
const pkg = require('../package.json')
const config = env().getOrElseAll({
  stremio_mixer: {
    host: 'localhost',
    port: 80,
    cache: true,
    announce: false,
    email: '',
  },
}).stremio_mixer

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
  endpoint: `http://${config.host}:${config.port}/stremio/v1`,
  logo: `http://${config.host}:${config.port}/logo.png`,
  background: `http://${config.host}:${config.port}/background.jpg`,
}

let mixer = new Mixer({
  idProperty: MANIFEST.idProperty,
  cache: config.cache,
})
let methods: Methods = {
  'meta.get': (req: Request, cb) => {
    return mixer.getChannel(req).then(
      (res) => cb(null, res),
      (err) => {
        // tslint:disable-next-line:no-console
        console.error(err)
        cb(err)
      }
    )
  },
  'meta.find': (req: Request, cb) => {
    return mixer.findChannels(req).then(
      (res) => cb(null, res),
      (err) => {
        // tslint:disable-next-line:no-console
        console.error(err)
        cb(err)
      }
    )
  },
  'meta.search': (req: SearchRequest, cb) => {
    return mixer.findChannels(req).then(
      (res) => cb(null, res),
      (err) => {
        // tslint:disable-next-line:no-console
        console.error(err)
        cb(err)
      }
    )
  },
  'stream.find': (req: Request, cb) => {
    return mixer.getStreams(req).then(
      (res) => cb(null, res),
      (err) => {
        // tslint:disable-next-line:no-console
        console.error(err)
        cb(err)
      }
    )
  },
}

let app = express()
let addon = new StremioServer(methods, MANIFEST)

app.use(express.static('public'))
app.use(addon.middleware)
app.listen(config.port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Stremio Mixer listening on http://${config.host}:${config.port}`)
})
