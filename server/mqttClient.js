require('dotenv').config()

const mqtt = require('mqtt')
const client = mqtt.connect({
  host: process.env.MQTT_HOST,
  port: process.env.MQTT_PORT,
})
const topic = process.env.TOPIC

client.on('connect', () => {
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log('Subscribed to topic')
    } else {
      console.error(err)
    }
  })
})

client.on('message', (topic, message) => {
  console.log(message.toString())
})

module.exports = client