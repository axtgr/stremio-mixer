import 'source-map-support/register'
import {
  Server as StremioServer,
  Request,
  SearchRequest,
  Method,
} from 'stremio-addons'
import express = require('express')

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

let app = express()
let addon = new StremioServer({}, MANIFEST)

app.use(addon.middleware)
app.listen(80, () => {
  // tslint:disable-next-line:no-console
  console.log('Stremio Mixer listening on port 80')
})
