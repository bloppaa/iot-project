require('dotenv').config();

const { SerialPort } = require('serialport');
const { ReadlineParser} = require('@serialport/parser-readline');
const mqtt = require('mqtt');

const port = new SerialPort({path: 'COM10', baudRate: 115200, });

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const client = mqtt.connect({
  host: process.env.MQTT_HOST,
  port: process.env.MQTT_PORT,
});
const topic = process.env.TOPIC;

client.on('connect', () => {
  console.log('Conectado al broker MQTT');
});

parser.on('data', (data) => {
  const height = data.trim();
  client.publish(topic, height);
  console.log(`Altura publicada: ${height}`);

  if (height >= 15) {
    client.publish('danger', height);
    console.log('Peligro publicado');
  }
});

port.on('open', () => {
  console.log('Puerto serial abierto');
});

port.on('error', (err) => {
  console.error('Error en el puerto serial:', err.message);
})