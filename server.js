'use strict'

const EventSource = require('eventsource')
const config = require('config')
const mongodb = require('mongodb')
const assert = require('assert')

const urlStream = config.EVENTS_URL + '?stream=true'

const mongoUrl = config.MONGO_URL
const mongoClient = new mongodb.MongoClient()

mongoClient.connect(mongoUrl, (err, db) => {
  assert.equal(null, err)
  const collection = db.collection(config.COLLECTION)
  const events = new EventSource(urlStream)
  events.onany = (channel, message) => {
    const data = message.data && JSON.parse(message.data)
    updateProgress(collection, data)
  }
})

function updateProgress (collection, data) {
  if (data && 'evidence' in data) {
    const text = data.date + ' ' + data.type
    let id = data.evidence
    try {
      id = mongodb.ObjectId(data.evidence)
    } catch (err) {
    }
    // console.log(
    collection.update(
      {_id: id},
      {$set: {progress: text}}
    )
  }
}
