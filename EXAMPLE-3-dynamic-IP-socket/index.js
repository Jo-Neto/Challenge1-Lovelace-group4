//necessário para rodar
const express = require('express');
const WebSocket = require('ws');
//
//n foi usado pos é para https
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

//arrays para as mensages
const usuarios = [];
const mensagens = [];


//comportamento do server para caso o cliente envie algum erro
function onError(ws, err) {
    console.error(`onError: ${err.message}`);
}

//comportamento do server para mensagens enviadas pelo cliente
function onMessage(ws, data) {
   console.log(`onMessage: ${data}`);
   const msg = JSON.parse(data);//traduzindo a mensagem
   if (!usuarios.includes(msg.id)) usuarios.push(msg.id); //verificando se existe algum usuário 
   mensagens.push(`<strong>${msg.id}</strong>:${msg.text}`);//add mensagem à lista
   ws.send(`${JSON.stringify(mensagens)}`); //enviando a mensagem d volta ao usuário
}

//comportamento do server quando um cliente pedir para conectar
function onConnection(ws, req) {
   console.log(req.socket.remoteAddress);
   //registrando ações do usuario e resposta do server
   ws.on('message', data => onMessage(ws, data));
   ws.on('error', error => onError(ws, error));
   console.log(`onConnection`);
}

//função que envia algo a todos os clientes conectados no servidor
function broadcast() {
   if (!this.clients) return;
   //percorre a lista de clientes e envia uma mensagem
   this.clients.forEach(client => {
       if (client.readyState === WebSocket.OPEN) {
           client.send(JSON.stringify(mensagens));
       }
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
//inicialização da aplicação

//aplicação normal
const app = express();
 
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
 
app.use(helmet());
 
app.use(express.json());
 
app.use(morgan('dev'));

//criando o server
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`App Express is running!`);
})

//fazendo ele ter websocket
const wss = (server) => {
   const wss = new WebSocket.Server({
      server,
      //verifyClient
   });

   wss.on('connection', onConnection);
   wss.broadcast = broadcast;

   console.log(`App Web Socket Server is running!`);
   return wss;
}

//colocando intervalo de broadcast
setInterval(() => {
    wss.broadcast();
}, 1000)