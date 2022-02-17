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
app.use('/', express.static('./front-end/home'));
app.use('/game', express.static('./front-end/game-board'));
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
            ip: null
         },
         player2: {  //server side only, data about player 2
            ip: null
         }
      };
   }
/* agua = a, 4un
   fogo = f, 4un
   planta = p, 4un
   eter = e 2un        */
   
   shuffle() {  //shuffle before sending deck, deck = 10 cartas;   >>>>>>>  deckCardNum;
      this.dataPublicPlayer1.initialDeck = [];
      this.dataPublicPlayer2.initialDeck = [];
   }
   randFirstToPlay() {
      //randomize which player plays first, 
      this.dataPublicPlayer1.firstToPlay = null;
      this.dataPublicPlayer2.firstToPlay = null;
   }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                SOCKET SERVERS INITIALIZERS                       |
//+------------------------------------------------------------------+

const waitSockServ = new WebSocket.Server({ noServer: true, clientTracking: true });
waitSockServ.on('error', (error) => { console.log('waitSockServ error: '); console.log(error); });
waitSockServ.on('connection', lineConnec);

const gameSockServ = new WebSocket.Server({ noServer: true, clientTracking: true });
gameSockServ.on('connection', gameConnec);
gameSockServ.on('error', (error) => { console.log('gameSockServ error: '); console.log(error); }); 



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                      SOCKET PATH RESOLVER                        |
//+------------------------------------------------------------------+
HTTPserver.on('upgrade', function upgrade(request, socket, head) {
   const { pathname } = url.parse(request.url);
   if (pathname === '/line') {
      waitSockServ.handleUpgrade(request, socket, head, (ws) => { waitSockServ.emit('connection', ws); });
   } else if (pathname === '/gamestream'){
      gameSockServ.handleUpgrade(request, socket, head, (ws) => { gameSockServ.emit('connection', ws, request); });
   } else if(pathname === '/chat'){
      socket.destroy(); //currently unused
   }
});



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|     GAMESESSION OBJECT CREATION && PLAYER FINDER ALGHORITHM      |
//+------------------------------------------------------------------+
let GameSessionArray = [];  //Arr to store sessions
let currSessionID = 0;  //next session ID

function lineConnec(ws) {
   if (waitSockServ.clients.size >= 2) {
      let count=0;
      waitSockServ.clients.forEach(client => {
         if (client.readyState === WebSocket.OPEN) {
            if (count <= 1) {
               if (count === 0) {
                  GameSessionArray[currSessionID] = new GameSession;
                  GameSessionArray[currSessionID].serverSide.player1.ip = client._socket.remoteAddress;
                  client.send(JSON.stringify(GameSessionArray[currSessionID]))
                  //console.log("first player data sent");
                  //console.log("SENT OBJECT <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
                  //console.log(GameSessionArray[currSessionID]);
               } else {
                  GameSessionArray[currSessionID].serverSide.player2.ip = client._socket.remoteAddress;
                  client.send(JSON.stringify(GameSessionArray[currSessionID]));
                  //console.log("second player data sent");
                  //console.log("SENT OBJECT <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
                  //console.log(GameSessionArray[currSessionID]);
                  currSessionID++;
               }
               count++;
               //console.log("=================================================================================================");
               client.send("partida encontrada");
               client.close(1000, 'connecting to game streaming socket');
            } else 
               lineConnec(waitSockServ);
         }
      });
   } else 
      ws.send("searching for players");
}  



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                   PLAYER GAME DATA EXCHANGE                      |
//+------------------------------------------------------------------+

function gameConnec(ws) {
   ws.on('close', gameOpen);
   ws.on('error', (error) => { console.log('waitSock error: '); console.log(error); });
   ws.on('message', (data, isBinary) => gameOpen(data , isBinary));
   ws.on('open', gameOpen);
}

function gameOpen(data , isBinary) {
   //console.log(this);
}

/*setInterval(() => {
   waitSockServ.broadcast();
}, 5000)*/

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