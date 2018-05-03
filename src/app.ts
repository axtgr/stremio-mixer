import 'source-map-support/register'
import {
  Server as StremioServer,
  Request,
  SearchRequest,
  Methods,
} from 'stremio-addons'
import express = require('express')
import Mixer from './Mixer'

const MANIFEST = {
  name: 'Mixer',
  id: 'org.stremio.mixer',
  version: '0.0.0',
  description: `Watch live streams from Mixer.com`,
  types: ['tv'],
  idProperty: 'mixer_id',
  dontAnnounce: true,
  isFree: true,
  sorts: [
    {
      prop: 'popularities.mixer',
      name: 'Mixer',
      types: ['tv'],
    },
  ],
}

let mixer = new Mixer({ idProperty: MANIFEST.idProperty })
let methods: Methods = {
  'meta.get': (request: Request, callback) => {
    return mixer
      .getChannel(request)
      .then((response) => callback(null, response), callback)
  },
  'meta.find': (request: Request, callback) => {
    return mixer
      .findChannels(request)
      .then((response) => callback(null, response), callback)
  },
  'meta.search': (request: SearchRequest, callback) => {
    return mixer
      .findChannels(request)
      .then((response) => callback(null, response), callback)
  },
  'stream.find': (request: Request, callback) => {
    return mixer
      .getStreams(request)
      .then((response) => callback(null, response), callback)
  },
}

let app = express()
let addon = new StremioServer(methods, MANIFEST)

app.use(addon.middleware)
app.listen(80, () => {
  // tslint:disable-next-line:no-console
  console.log('Stremio Mixer listening on port 80')
})
