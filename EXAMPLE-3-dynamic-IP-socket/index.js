//+------------------------------------------------------------------+
//| DEDEPENDENCIES                                                   |
//+------------------------------------------------------------------+
const express = require('express');
const WebSocket = require('ws');
//const cors = require('cors');
//const helmet = require('helmet');
//const morgan = require('morgan');


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//| ARBITRATY PORTS                                                  |
//+------------------------------------------------------------------+
const frontPort = 80;
const gameSocketPort = frontPort;
const apiPort = null; //currently unused;
const chatSocketPort = null; //currently unused;
const envPort = process.env.PORT; //environment port, currently unused;



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//| MIDDLEWARES AND SERVER INITIALIZATION                            |
//+------------------------------------------------------------------+
const app = express();
app.use(express.json());
app.use('/', express.static('front_fabricio'));
//app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
//app.use(morgan('dev'));
//app.use(helmet());
const HTTPserver = app.listen(frontPort, () => { console.log(`App listening on port: ${frontPort}`); });



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//| GAME SESSION OBJECT                                              |
//+------------------------------------------------------------------+

const handCardNum = 3; //currently unused
const deckCardNum = 14;

class GameSession {
   constructor() {
      this.dataPublicPlayer1 = {  //player 1 info, player 1 and server only, this is also the first object sent to player 1
         gameSessionID: Number(currSessionID),
         whichPlayer: 1,
         firstToPlay: null,
         initialDeck: []
      };
      this.dataPublicPlayer2 = {   //player 2 info, player 2 and server only, this is also the first object sent to player 2
         gameSessionID: Number(currSessionID),
         whichPlayer: 2,
         firstToPlay: null,
         initialDeck: []
      };
      this.serverSide = {  //info about the session, server only
         gameSessionID: Number(currSessionID), //just for safety
         player1turn: null,
         passTurn: null,
         tradedObject: { //this object will be sent and received, player-server communication
            whichCardPlayed: '',
            enemyQuit: false,
            enemyGaveUp: false
         },
         gameState: {
         },
         player1: {  //server side only, data about player 1
            socket: null
         },
         player2: {  //server side only, data about player 2
            socket: null
         }
      };
   }
   /*
   agua = a, 4un
   fogo = f, 4un
   planta = p, 4un
   eter = e 2un
   */
   shuffle() {
      //shuffle before sending deck, deck = 10 cartas;
      //GameSession.dataPublicPlayer = shuffled deck, before sending;
      this.dataPublicPlayer1.initialDeck = [];
      this.dataPublicPlayer2.initialDeck = [];
      deckCardNum;
   }
   randFirstToPlay() {
      //randomize which player plays first, 
      this.dataPublicPlayer1.firstToPlay = null;
      this.dataPublicPlayer2.firstToPlay = null;
   }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//| SOCKET SERVERS INITIALIZERS                                      |
//+------------------------------------------------------------------+

const gameSocketCreator = (HTTPserver) => {
   const gameSocketServer = new WebSocket.Server({ server: HTTPserver, clientTracking: true, path: '/stream' });
   gameSocketServer.on('connection', onConnection);
   //gameSocketServer.on('error', () => { console.log("constructor error") });
   //gameSocketServer.on('close', () => { console.log("constructor close") });
   //gameSocketServer.on('header', () => { console.log("constructor headers") });
   gameSocketServer.on('listening', () => { console.log("constructor listening") });
   //gameSocketServer.on('header', () => { console.log("constructor headers") });
   gameSocketServer.broadcast = broadcast;
   return gameSocketServer;
}

// const chatSocketCreator = (HTTPserver) => { 
//    const chatSocketServer = new WebSocket.Server({server: HTTPserver, clientTracking: true, path: '/chat', port: chatSocketPort });
//    chatSocketServer.on('connection', () => { console.log("connected chat") });
//    chatSocketServer.on('close', () => { console.log("closed chat") });
//    chatSocketServer.on('open', () => { console.log("opened chat") });
//    chatSocketServer.on('disconnect', () => { console.log("disconnected chat") });
//    chatSocketServer.broadcastChat = broadcastChat;
//    return chatSocketServer;
// }

// const userSocketCreator = (HTTPserver) => { 
//    const userSocketCreator = new WebSocket.Server({server: HTTPserver, clientTracking: true, path: '/session', port: chatSocketPort });
//    userSocketCreator.on('connection', () => { console.log("connected chat") });
//    userSocketCreator.on('close', () => { console.log("closed chat") });
//    userSocketCreator.on('open', () => { console.log("opened chat") });
//    userSocketCreator.on('disconnect', () => { console.log("disconnected chat") });
//    userSocketCreator.broadcastChat = broadcastChat;
//    return userSocketCreator;
// }

//const waitingLineSocket = gameSocketCreator(HTTPserver);

const gameSocketServer = new WebSocket.Server({ server: HTTPserver, clientTracking: true, path: '/line' });
gameSocketServer.on('connection', onConnectionLine);
gameSocketServer.on('listening', () => { console.log("constructor listening") });
gameSocketServer.on('error', () => { console.log("constructor error") });
gameSocketServer.on('close', () => { console.log("constructor close") });
gameSocketServer.on('header', () => { console.log("constructor headers") });
gameSocketServer.broadcast = broadcast;

// const chatSocketServer = chatSocketCreator(HTTPserver); 
// const userSocketServer = userSocketCreator(HTTPserver); 



//+------------------------------------------------------------------+
//| GAME SESSION CREATION AND PLAYER CONNECTION                      |
//+------------------------------------------------------------------+
let GameSessionArray = [];  //Arr to store sessions
let currSessionID = 0;  //next session ID

function onConnectionLine(ws, req) {
   let p1socket = null;
   if (gameSocketServer.clients.size === 2) {
      console.log("handshake ready");
      ws.send("match ready p2");
      ws.close();
      p1socket.send("match ready p1");
      p1socket.close();
      p1socket = null;
   } else
      p1socket = ws;
}


function onMessageLine(data, isBinary, ws) {
   ws.send(`sent by server, onmessage function`);
}

function onError(arg1, arg2, arg3) {
   console.log('onerror function fired by >>>>');
   //ws.send(`sent by server, on error function`); 
}

function onOpen(arg1, arg2, arg3) {
   console.log('onopen function fired by >>>>');
   //ws.send(`sent by server, onopen  function`); 
}

function onClose(arg1, arg2, arg3) {
   console.log('onclose function fired by >>>>');
   console.log(arg1)
   console.log('i ===' + i);
}


setInterval(() => {
gameSocketServer.broadcast();
}, 5000)

function broadcast() {
   //this.clients == every connected client
   //console.log("WebSocket: <<<<<<<<<<<<<<<<<");
   //console.log(WebSocket);
   //console.log("===============================================================================================");
   //console.log("THIS: <<<<<<<<<<<<<<<<<");
   //console.log(this);
   //console.log("===============================================================================================");
   //console.log("CLIENT: <<<<<<<<<<<<<<<<<");
   //console.log(this.clients);
   //console.log("===============================================================================================");
   console.log(gameSocketServer.clients.size);
   //this.clients.forEach(client => {
   //console.log(client);  //client.readyState === WebSocket.OPEN
   //client.send('hello, Im the server!, and this is a broadcast');
   //});
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