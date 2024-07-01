const express = require('express');
const http = require('http')
const WebSocket = require('ws')
const mqttClient = require('./mqttClient')
const path = require('path');

const app = express()
const port = 3000
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

let latestMessage = ''

mqttClient.on('message', (topic, message) => {
  latestMessage = message.toString()
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(latestMessage)
    }
  })
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
})

wss.on('connection', (ws) => {
  ws.send(latestMessage)
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})