const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { query } = require('./db');
const mqttClient = require('./mqttClient');
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

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.get('/data', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const result = await query(
    'SELECT * FROM vehicle_heights ORDER BY timestamp DESC LIMIT $1 OFFSET $2',
    [limit, offset],
  );
  res.json(result.rows);
})

wss.on('connection', (ws) => {
  ws.send(latestMessage)
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})