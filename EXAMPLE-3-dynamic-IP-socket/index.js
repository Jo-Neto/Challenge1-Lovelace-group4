//+------------------------------------------------------------------+
//|                        DEDEPENDENCIES                            |
//+------------------------------------------------------------------+
const express = require('express');
const WebSocket = require('ws');
const url = require('url');
//const cors = require('cors');
//const helmet = require('helmet');
//const morgan = require('morgan');



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                       ARBITRATY PORTS                            |
//+------------------------------------------------------------------+
const frontPort = 80;
const gameSocketPort = null; //currently unused;
const waitLineSocketPort = null; //currently unused;
const chatSocketPort = null; //currently unused;
const restPort = null; //currently unused;
const envPort = process.env.PORT; //environment port, currently unused;



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|              MIDDLEWARES AND SERVER INITIALIZATION               |
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
//|                    GAME SESSION OBJECT                           |
//+------------------------------------------------------------------+
const handCardNum = 3; //currently unused
const deckCardNum = 14;

class CardGameSession {
   constructor() {
      this.player1Handshake = {  //first object sent to player 1, sent only once
         gameSessionID: Number(currSessionID),
         whichPlayer: 1,
         firstToPlay: null,
         initialDeck = []
      };
      this.player2Handshake = { //first object sent to player 2, sent only once
         gameSessionID: Number(currSessionID),
         whichPlayer: 2,
         firstToPlay: null,
         initialDeck = []
      };
      this.serverSide = {  //info about the session, server only
         gameSessionID: Number(currSessionID), //just for safety
         player1turn: null,
         passTurn: null,
         tradedObject: { //this object will be sent and received, player-server communication
            gameSessionID: null,
            whichCardPlayed: '',
            enemyGaveUp: false
         },
         gameState: {
            currTurn: 0,
            fieldCards: []
         },
         player1: {  //server side only, data about player 1
            hand: [],
            deck: [],
            ip: null,
            lineWs: null,  //CAREFULL WITH RECONNECTIONS!!!
            gameWs: null,  //CAREFULL WITH RECONNECTIONS!!!
            chatWs: null  //CAREFULL WITH RECONNECTIONS!!!
         },
         player2: {  //server side only, data about player 2
            hand: [],
            deck: [],
            ip: null,
            lineWs: null,  //CAREFULL WITH RECONNECTIONS!!!
            gameWs: null,  //CAREFULL WITH RECONNECTIONS!!!
            chatWs: null  //CAREFULL WITH RECONNECTIONS!!!
         }
      };
   }
   /* agua = a, 4un
      fogo = f, 4un
      planta = p, 4un
      eter = e 2un        */

   shuffle() {  //shuffle before sending deck, deck = 10 cartas;   >>>>>>>  deckCardNum;
      this.player1Handshake.initialDeck = [];
      this.player2Handshake.initialDeck = [];
   }
   randFirstToPlay() {  //randomize which player plays first, 
      this.player1Handshake.firstToPlay = null;
      this.player2Handshake.firstToPlay = null;
   }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                  SOCKET SERVERS INITIALIZERS                     |
//+------------------------------------------------------------------+
const waitSockServ = new WebSocket.Server({ noServer: true, clientTracking: true });
waitSockServ.on('error', (error) => { console.log('waitSockServ error: '); console.log(error); });
waitSockServ.on('connection', lineConnec);
//waitSockServ.on('close', () => { clearInterval( waitSockServInterval ); });

const gameSockServ = new WebSocket.Server({ noServer: true, clientTracking: true });
gameSockServ.on('error', (error) => { console.log('gameSockServ error: '); console.log(error); });
gameSockServ.on('connection', gameConnec);



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                      SOCKET PATH RESOLVER                        |
//+------------------------------------------------------------------+
HTTPserver.on('upgrade', function upgrade(request, socket, head) {
   const { pathname } = url.parse(request.url);
   if (pathname === '/line') {
      waitSockServ.handleUpgrade(request, socket, head, (ws) => { waitSockServ.emit('connection', ws); });
   } else if (pathname === '/gamestream') {
      gameSockServ.handleUpgrade(request, socket, head, (ws) => { gameSockServ.emit('connection', ws, request); });
   } else if (pathname === '/chat') {
      socket.destroy(); //currently unused
   }
});



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|     GAMESESSION OBJECT CREATION && PLAYER FINDER ALGHORITHM      |  TODO: detect on database the last ID
//+------------------------------------------------------------------+

let CardGameSessionArray = [];  //Arr to store ACTIVE card game sessions
let currSessionID = 0;  //next session ID,

function lineConnec(ws) {  //called if player is reconnecting to a match
   ws.on('error', (error) => { console.log('waitSock error: '); console.log(error); });
   //ws.isAlive = true;
   //s.on('pong', (ws) => ws.isAlive = true );
   CardGameSessionArray.forEach((Session) => {
      if ((ws._socket.remoteAddress === Session.serverSide.player1.ip)) {  //player 1 reconnecting;
         Session.serverSide.player1.ip = ws._socket.remoteAddress;
         Session.serverSide.player1.lineWs = ws;
         client.send("reconectando");
         client.close(1000, 'redirect to game streaming socket');
      }
      else if ((ws._socket.remoteAddress === Session.serverSide.player2.ip)) { //player 2 reconnecting;
         Session.serverSide.player2.ip = ws._socket.remoteAddress;
         Session.serverSide.player2.lineWs = ws;
         client.send("reconectando");
         client.close(1000, 'redirect to game streaming socket');
      }
      else
         lineConnecNew(ws);
   })
}

function lineConnecNew(ws) {  //called if player is not reconnecting to a match
   if (waitSockServ.clients.size >= 2) {
      let count = 0;
      waitSockServ.clients.forEach(client => {
         if (client.readyState === WebSocket.OPEN) {
            console.log(client);
            if (count <= 1) {
               if (count === 0) {
                  CardGameSessionArray[currSessionID] = new CardGameSession;
                  CardGameSessionArray[currSessionID].serverSide.player1.ip = client._socket.remoteAddress;
                  CardGameSessionArray[currSessionID].serverSide.player1.lineWs = client;
                  //console.log("first player data sent");
                  //console.log("SENT OBJECT <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
                  //console.log(CardGameSessionArray[currSessionID]);
               } else {
                  CardGameSessionArray[currSessionID].serverSide.player2.ip = client._socket.remoteAddress;
                  CardGameSessionArray[currSessionID].serverSide.player2.lineWs = client;
                  //console.log("second player data sent");
                  //console.log("SENT OBJECT <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
                  //console.log(CardGameSessionArray[currSessionID]);
                  currSessionID++;
               }
               count++;
               //console.log("=================================================================================================");
               client.send("partida encontrada");
               client.close(1000, 'redirect to game streaming socket');
            } else
               lineConnecNew(ws);
         }
      });
   } else
      ws.send("searching for players");
}
/*
const waitSockServInterval = setInterval( () => {
   waitSockServ.clients.forEach( client => {
      if ( client.isAlive === false ) 
         return client.terminate();
      client.isAlive = false;
      client.ping();
   })
}, 15000 ) //timeout timer
*/


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                   PLAYER GAME DATA EXCHANGE                      |  TODO: timer for timeout && connection checker
//+------------------------------------------------------------------+  REJEIÇÃO CASO NÃO TENHA HANDSHAKE DO WAITSOCKET

function gameConnec(ws) {
   ws.on('close', gameClose);
   ws.on('error', (error) => { console.log('gameSock error: '); console.log(error); });
   ws.on('message', (data, isBinary, ws) => gameMessage(data, isBinary, ws));
   ws.on('open', gameOpen(ws));
   ws.on('pong', { isAlive: true });
}

function gameClose() {
   console.log("game ws closing <<<<<<<<<<<<<<");
}

function gameMessage(data, isBinary, ws) {
   console.log("game ws sent message <<<<<<<<<<<<<<");
   
   //receive sessionID on message       
      //check if ws belongs to sessionID, 
         //if yes
            //sefety ip check maybe
               //if yes send message to other player ws
            //if not fatal error
         //if not go below                               
            //check if IP belongs to any active sessionID, 
               //if yes remake ws, 
               //if not fatal error
   console.log(data);
   console.log(isBinary);
}

function gameOpen(ws) {
   CardGameSessionArray.forEach((Session) => {
      if ((ws._socket.remoteAddress === Session.serverSide.player1.ip)) { //player 1 waiting handshake or reconnecting
         Session.serverSide.player1.gameWs = ws;
         ws.send(JSON.stringify(Session.player1Handshake));
      } else if ((ws._socket.remoteAddress === Session.serverSide.player2.ip)) { //player 2 waiting handshake or reconnecting
         Session.serverSide.player2.gameWs = ws;
         ws.send(JSON.stringify(Session.player2Handshake));
      } else  
         ws.close(4004, 'you have no ongoing matches');
   });
}


/*setInterval(() => {
   waitSockServ.broadcast();
}, 5000)*/

function pingBroadcast(sockServ) {
   
}

function closeBroadcast(sockServ, code, reason) {
   sockServ.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN)
         client.close(code, reason);
   });
}

function msgBroadcast(sockServ, msg) {
   sockServ.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN)
         client.send(msg);
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