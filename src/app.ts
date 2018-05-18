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

const ADDRESS = `http://${config.host}:${config.port}`
const MANIFEST = {
  name: 'Mixer',
  id: 'org.stremio.mixer',
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
  endpoint: `${ADDRESS}/stremioget/stremio/v1`,
  logo: `${ADDRESS}/logo.png`,
  background: `${ADDRESS}/background.jpg`,
  // OBSOLETE: used in pre-4.0 stremio instead of idProperty/types
  filter: {
    'query.mixer_id': { $exists: true },
    'query.type': { $in: ['tv'] },
  },
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
let addon = new StremioServer(methods, MANIFEST)

// If this is the entry module, run the addon
if (require.main === module) {
  let app = express()
  app.use(express.static('public'))
  app.use(addon.middleware)
  app.listen(config.port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Stremio Mixer listening on ${ADDRESS}`)

    if (!MANIFEST.dontAnnounce) {
      // tslint:disable-next-line:no-console
      console.log('Announcing the endpoint to Stremio tracker')
    }
  })
}

export default addon
