const tape = require('tape')
const express = require('express')
const { Client } = require('stremio-addons')
const addon = require('../build/app').default


let server = express().use(addon.middleware).listen(80)
let client = new Client()
let someChannel


tape('initializes properly', (t) => {
  client.add('http://localhost')
  client.on('addon-ready', ({ manifest }) => {
    t.ok(manifest, 'has manifest')
    t.ok(manifest.name, 'has name')
    t.ok(manifest.methods.length, 'has methods')
    t.ok(manifest.methods.includes('stream.find'), 'has stream.find method')
    t.ok(manifest.methods.includes('meta.find'), 'has meta.find method')
    t.ok(manifest.methods.includes('meta.search'), 'has meta.search method')
    t.ok(manifest.methods.includes('meta.get'), 'has meta.get method')
    t.end()
  })
})

tape('meta.find', (t) => {
  let req = { query: {}, limit: 5 }
  client.meta.find(req, (err, res) => {
    t.notOk(err, 'has error')
    t.ok(res, 'has res object')
    t.ok(res.length, 'has results')
    t.ok(res.length == 5, 'has 5 results')
    t.ok(res[0].poster, 'has poster')
    t.ok(res[0].name, 'has name')
    t.equal(res[0].type, 'tv', 'type is tv')
    t.end()
    someChannel = res[0]
  })
})

tape('meta.search', (t) => {
  let req = { query: 'a', limit: 5 }
  client.meta.find(req, (err, res) => {
    t.notOk(err, 'has error')
    t.ok(res, 'has res object')
    t.ok(res.length <= 5, 'results are limited to 5')
    t.end()
  })
})

tape('meta.get', (t) => {
  let req = { query: { mixer_id: someChannel.id.split(':')[1] } }
  client.meta.get(req, (err, res) => {
    t.notOk(err, 'has error')
    t.equal(res.id, someChannel.id, 'id matches')
    t.ok(res.poster, 'has poster')
    t.ok(res.name, 'has name')
    t.equal(res.type, 'tv', 'type is tv')
    t.end()
  })
})

tape('stream.find', (t) => {
  let req = { query: { twitch_id: someChannel.id.split(':')[1] } }
  client.stream.find(req, (err, res) => {
    t.notOk(err, 'has error')
    t.ok(res, 'has res object')
    t.ok(res.length, 'has results')
    t.ok(res[0].url, 'has url for first result')
    t.ok(res[0].availability, 'has availability for first result')
    t.end()
  })
})


tape.onFinish(() => {
  server.close()
})
