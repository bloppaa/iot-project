require('dotenv').config();
const mqtt = require('mqtt');
const { query } = require('./db');

const client = mqtt.connect({
  host: process.env.MQTT_HOST,
  port: process.env.MQTT_PORT,
});
const topic = process.env.TOPIC;

client.on('connect', () => {
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log('Subscribed to topic')
    } else {
      console.error(err)
    }
  })
});

client.on('message', async (topic, message) => {
  const height = parseFloat(message.toString());
  await query('INSERT INTO vehicle_heights (height) VALUES ($1)', [height]);
})

module.exports = client;