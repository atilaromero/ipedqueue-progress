'use strict'

const EventSource = require('eventsource')
const config = require('config')
const mongodb = require('mongodb')
const assert = require('assert')

const start = new Date()
const url = config.EVENTS_URL + '?stream=true&since=' + start.toISOString()
console.log(url)
const events = new EventSource(url)

const mongoUrl = config.MONGO_URL
const mongoClient = new mongodb.MongoClient()

mongoClient.connect(mongoUrl, (err, db) => {
  assert.equal(null, err)
  const collection = db.collection(config.COLLECTION)
  events.onany = (channel, message) => {
    const data = message.data && JSON.parse(message.data)
    if (data && 'evidence' in data) {
      const text = data.date + ' ' + data.type
      collection.update(
        {_id: mongodb.ObjectId(data.evidence)},
        {$set: {progress: text}}
      )
    }
  }
})
