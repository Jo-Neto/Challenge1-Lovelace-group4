//necessário para rodar
const express = require('express');
const WebSocket = require('ws');

const port = 3000;
const app = express();
app.use(express.json());
app.use('/', express.static('front_fabricio'))

//n foi usado pos é para https

//const cors = require('cors');
//const helmet = require('helmet');
//const morgan = require('morgan');

//app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
//app.use(morgan('dev'));
//app.use(helmet());

//arrays para as mensages
const usuarios = [];
const mensagens = [];


//comportamento do server para caso o cliente envie algum erro
function onError(ws, err) {
    console.error(`onError: ${err.message}`);
}

//comportamento do server para mensagens enviadas pelo cliente
function onMessage(ws, data, req) {
   console.log(`onMessage: ${data}`);
   const msg = JSON.parse(data);//traduzindo a mensagem
   if (!usuarios.includes(msg.id)) usuarios.push(msg.id); //verificando se existe algum usuário 
   mensagens.push(`<strong>${msg.id}</strong>:${msg.text}`);//add mensagem à lista
   console.log(req.socket.remoteAddress+'LLLLLLLLLLLLLLLLLLLLLLLLLLL');
   ws.send(`${JSON.stringify(mensagens)}`); //enviando a mensagem d volta ao usuário
   //console.log("WS ON MESSAGE: <<<<<<<<<<<<<<<<<");
   //console.log(ws);
   //console.log("===============================================================================================");
   //console.log("REQ ON MESSAGE: <<<<<<<<<<<<<<<<<");
   //console.log("===============================================================================================");
}

//comportamento do server quando um cliente pedir para conectar
function onConnection(ws, req) {
   console.log(req.socket.remoteAddress);
   //registrando ações do usuario e resposta do server
   ws.on('message', data => onMessage(ws, data, req));
   ws.on('error', error => onError(ws, error));
   //console.log("WS ON CONNECTION: <<<<<<<<<<<<<<<<<");
   //console.log(ws);
   //console.log("===============================================================================================");
   //console.log("REQ ON CONNECTION: <<<<<<<<<<<<<<<<<");
   //console.log(req.socket.address);
  // console.log("===============================================================================================");
}

//função que envia algo a todos os clientes conectados no servidor
function broadcast() {
   //percorre a lista de clientes e envia uma mensagem
   //this.clients == every connected client
   // console.log("WebSocket: <<<<<<<<<<<<<<<<<");
   // console.log(WebSocket);
   // console.log("===============================================================================================");
   // console.log("THIS: <<<<<<<<<<<<<<<<<");
   // console.log(this);
   // console.log("===============================================================================================");
   // console.log("CLIENT: <<<<<<<<<<<<<<<<<");
   // console.log(this.clients);
   // console.log("===============================================================================================");
   this.clients.forEach(client => {
       console.log(client.readyState);
   });
}

//segurança
/* function corsValidation(origin) {
    return process.env.CORS_ORIGIN === '*' || process.env.CORS_ORIGIN.startsWith(origin);
}
 
 function verifyClient(info, callback) {
   if (!corsValidation(info.origin)) return callback(false);
 
   const token = info.req.url.split('token=')[1];
 
   if (token) {
      if (token === '123456')
         return callback(true);
   }
 
   return callback(false);
} */

//criando o server
//process.env.PORT
const server = app.listen( port, () => {
    console.log(`App Express is running!`);
})

//fazendo ele ter websocket
const socketCreator = (server) => {
   const wss = new WebSocket.Server({
      server,
      //verifyClient
   });

   wss.on('connection', onConnection);
   wss.on('close', onConnection);
   wss.broadcast = broadcast;

   console.log(wss);
   console.log("===============================================================================================");
   console.log('App Web Socket Server is running!');
   return wss;
}

const wss = socketCreator(server);

//colocando intervalo de broadcast
setInterval(() => {
    wss.broadcast();
}, 10000)