'use strict';

const session = require('express-session');
const express = require('express');
const https = require('https');
const uuid = require('uuid');
const fs = require('fs')

const WebSocket = require("ws");

const app = express();
const map = new Map();

const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false
});


app.use(express.static('public'));
app.use(sessionParser);

app.post('/login', function (req, res) {
 
  const id = uuid.v4();

  console.log(`Atualizando a sessão para o usuario ${id}`);
  req.session.userId = id;
  res.send({ result: 'OK', message: 'Sessçao Atualizada' });
});

app.delete('/logout', function (request, response) {
  const ws = map.get(request.session.userId);

  console.log('Destruindo sessão');
  request.session.destroy(function () {
    if (ws) ws.close();

    response.send({ result: 'OK', message: 'sessão Destruida' });
  });
});


const server = https.createServer({
   key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem'),
  },
  app);

const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on('upgrade', function (request, socket, head) {
  console.log('Analisando sessão da requisição...');

  sessionParser(request, {}, () => {
    if (!request.session.userId) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    console.log('Sessão analisada!');

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

wss.on('connection', function (ws, request) {
  const userId = request.session.userId;

  map.set(userId, ws);

  ws.on('message', function (message) {
    console.log(`Mensagem recebida ${message} do usuário ${userId}`);
  });

  ws.on('close', function () {
    map.delete(userId);
  });
});

server.listen(8080, function () {
  console.log('Listening on http://localhost:8080');
});