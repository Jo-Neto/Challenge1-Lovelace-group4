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
const frontPort = 443;
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
app.use('/', express.static('front-end/home'));
app.use('/game', express.static('front-end/game-board'));
//app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
//app.use(morgan('dev'));
//app.use(helmet());
const HTTPserver = app.listen(frontPort, () => { console.log(`App listening on port: ${frontPort}`); });



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                    GAME SESSION OBJECT                           |
//+------------------------------------------------------------------+
const unordDeck = ['w', 'w', 'w', 'w', 'f', 'f', 'f', 'f', 'p', 'p', 'p', 'p', 'e', 'e'];

class CardGameSession {
   constructor() {
      this.player1Handshake = {  //first object sent to player 1, sent only once
         gameSessionID: Number(currSessionID),
         whichPlayer: 1,
         firstToPlay: null,
         hand: []
      };
      this.player2Handshake = { //first object sent to player 2, sent only once
         gameSessionID: Number(currSessionID),
         whichPlayer: 2,
         firstToPlay: null,
         hand: []
      };
      this.serverSide = {  //info about the session, server only
         player1turn: null,
         gameState: {
            gameSessionID: Number(currSessionID),
            currTurn: 0,
            myTurn: null,
            board: ['',''],  // [player1, player2]
            scoreP1: 0,
            scoreP2: 0,
            enemyGaveUp: false
         },
         player1: {  //server side only, data about player 1
            hand: [],
            indexToReplace: null,
            deck: null,
            ip: null,
            lineWs: null,  //CAREFULL WITH RECONNECTIONS!!!
            gameWs: null,  //CAREFULL WITH RECONNECTIONS!!!
            chatWs: null  //CAREFULL WITH RECONNECTIONS!!!
         },
         player2: {  //server side only, data about player 2
            hand: [],
            indexToReplace: null,
            deck: null,
            ip: null,
            lineWs: null,  //CAREFULL WITH RECONNECTIONS!!!
            gameWs: null,  //CAREFULL WITH RECONNECTIONS!!!
            chatWs: null  //CAREFULL WITH RECONNECTIONS!!!
         }
      };
      this.randFirstToPlay();
      this.shuffleDeck();
      this.serverSide.player1.hand = this.serverSide.player1.deck.splice(0,3);
      this.serverSide.player2.hand = this.serverSide.player2.deck.splice(0,3);
      this.player1Handshake.hand = this.serverSide.player1.hand;
      this.player2Handshake.hand = this.serverSide.player2.hand;
   }
   randFirstToPlay() {  //randomize which player plays first, 
      this.serverSide.player1turn = true /* Boolean(Math.round(Math.random())); */
      this.player1Handshake.firstToPlay = this.serverSide.player1turn;
      this.player2Handshake.firstToPlay = !this.serverSide.player1turn;

   }
   shuffleDeck() { //shuffle deck 
      this.serverSide.player1.deck = shuffle(unordDeck);
      this.serverSide.player2.deck = shuffle(unordDeck);
   }
   roundCheck(wsP1, wsP2) {
      console.log(this.serverSide.gameState.board[0]);
      console.log(this.serverSide.gameState.board[1]);
      if(this.serverSide.gameState.scoreP1 === 5) {
         wsP1.send("voce ganhou");
         wsP1.close(1000, 'match has finished');
         wsP2.terminate();
      }
      if(this.serverSide.gameState.scoreP2 === 5) {
         wsP2.send("voce ganhou");
         wsP2.close(1000, 'match has finished');
         wsP2.terminate();
      }
      if( ( (this.serverSide.gameState.board[0] ==='') || (this.serverSide.gameState.board[1] ==='') ) && //p1 jogou ou p2 jogou
         ( !( (this.serverSide.gameState.board[0] === this.serverSide.gameState.board[1]) ) ) ) {//mas ambos não jogaram
            this.serverSide.player1turn = !this.serverSide.player1turn;
            return;
         } //XOR return, //só um jogou, o outro não
      else if( this.serverSide.gameState.board[0] === this.serverSide.gameState.board[1] ) { //empate 

      } 
      else if(this.serverSide.gameState.board[0] == 'e' && this.serverSide.gameState.board[1] != 'e'){
         this.serverSide.gameState.scoreP1++;
         this.serverSide.gameState.player1turn = true;
      } else if(this.serverSide.gameState.board[1] == 'e' && this.serverSide.gameState.board[0] != 'e'){
         this.serverSide.gameState.scoreP2++; 
         this.serverSide.gameState.player1turn = false;           
      } else if(this.serverSide.gameState.board[0] == 'w' && this.serverSide.gameState.board[1] == 'f'){
         this.serverSide.gameState.scoreP1++;
         this.serverSide.gameState.player1turn = true;
      } else if(this.serverSide.gameState.board[0] == 'w' && this.serverSide.gameState.board[1] == 'p'){
         this.serverSide.gameState.scoreP2++;
         this.serverSide.gameState.player1turn = false;
      } else if(this.serverSide.gameState.board[0] == 'f' && this.serverSide.gameState.board[1] == 'w'){
         this.serverSide.gameState.scoreP2++;
         this.serverSide.gameState.player1turn = false;
      } else if(this.serverSide.gameState.board[0] == 'f' && this.serverSide.gameState.board[1] == 'p'){
         this.serverSide.gameState.scoreP1++;
         this.serverSide.gameState.player1turn = true;
      } else if(this.serverSide.gameState.board[0] == 'p' && this.serverSide.gameState.board[1] == 'w'){
         this.serverSide.gameState.scoreP1++;
         this.serverSide.gameState.player1turn = true;
      } else if(this.serverSide.gameState.board[0] == 'p' && this.serverSide.gameState.board[1] == 'f'){            
         this.serverSide.gameState.scoreP2++;   
         this.serverSide.gameState.player1turn = false;
      } else 
         console.log("logical error, CardGameSession -> roundCheck method");
      this.serverSide.gameState.currTurn++;
      this.serverSide.gameState.board[0] = '';
      this.serverSide.gameState.board[1] = '';
   }
}

function shuffle(array) {
   let arrCpy = [...array];
   let currentIndex = arrCpy.length;  
   let randomIndex;
   while (currentIndex != 0) {   // While there remain elements to shuffle...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--; // Pick a remaining element...
      [arrCpy[currentIndex], arrCpy[randomIndex]] =  // And swap it with the current element.
      [arrCpy[randomIndex], arrCpy[currentIndex]];
   }
   return arrCpy;
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
      gameSockServ.handleUpgrade(request, socket, head, (ws) => { gameSockServ.emit('connection', ws); });
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

function lineConnec(ws) {  //called when new connecting to waitSockServ
   console.log("lineConnec");
   ws.on('error', (error) => { console.log('waitSock error: '); console.log(error); });
   //ws.isAlive = true;
   //ws.on('pong', (ws) => ws.isAlive = true );
   CardGameSessionArray.forEach( (Session) => {
      console.log("CardGameSessionArray");
      if ((ws._socket.remoteAddress === Session.serverSide.player1.ip)) {  //player 1 reconnecting;
         Session.serverSide.player1.ip = ws._socket.remoteAddress;
         Session.serverSide.player1.lineWs = ws;
         client.send("reconectando");
         client.close(1000, 'redirect to game streaming socket');
         client.terminate();  //safety
         return true;
      }
      else if ((ws._socket.remoteAddress === Session.serverSide.player2.ip)) { //player 2 reconnecting;
         Session.serverSide.player2.ip = ws._socket.remoteAddress;
         Session.serverSide.player2.lineWs = ws;
         client.send("reconectando");
         client.close(1000, 'redirect to game streaming socket');
         client.terminate(); //safety
         return true;
      }
      else {  //player does not belong to any match
         lineConnecNew(ws);
         return true;
      }
   });
   lineConnecNew(ws);
}

function lineConnecNew(ws) {  //called if player is not reconnecting to a match
   console.log("lineConnecNew");
   if (waitSockServ.clients.size >= 2) {
      let count = 0;
      waitSockServ.clients.forEach(client => {
         if (client.readyState === WebSocket.OPEN) {
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
               client.terminate(); //safety
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
//+------------------------------------------------------------------+  TODO: reconnecting logic
//|                   PLAYER GAME DATA EXCHANGE                      |  TODO: timer for timeout && connection checker
//+------------------------------------------------------------------+  REJEIÇÃO CASO NÃO TENHA PARTIDA PRONTA

function gameConnec(ws) {
   console.log("gameConnec");
   ws.on('close', () => gameClose);
   ws.on('error', (error) => { console.log('gameSock error: '); console.log(error); });
   ws.on('message', (data, isBinary) => gameMessage(data, isBinary, ws) );
   gameOpen(ws);  //ws.on('open', (ws) => gameOpen(ws));  FUCK THE DOCUMENTATION?!
   //ws.on('pong', { isAlive: true });
}

function gameOpen(ws) {
   CardGameSessionArray.forEach( (Session) => {
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

function gameClose() {
   console.log("gameClose");
}


function gameMessage(data, isBinary, ws) {
   /*
   gameSessionID: gameState.gameSessionID,
   cardPlayed: ui.draggable.attr('value'),
   cardPlayedIndex: Number(ui.draggable.attr("id").slice(-1))
   */
   let tempData = JSON.parse(data);
   console.log("p1 hand: "+CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand);
   console.log("p1 deck: "+CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck);
   console.log("p2 hand: "+CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand);
   console.log("p2 deck: "+CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck);
   let fakeGameState = { ...CardGameSessionArray[tempData.gameSessionID].serverSide.gameState }  //safety
//    fakeGameState = CardGameSessionArray[tempData.gameSessionID].serverSide.gameState;
    fakeGameState.board = CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board.slice();

   if (CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs === ws) {//p1 message
      if (CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn) { //p1 turn
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn = null; //safety, p2 can't play yet
         CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0] = tempData.cardPlayed;
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand[tempData.cardPlayedIndex-1] = CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck.shift();
         console.log("p1 shift index: "+(tempData.cardPlayedIndex-1));
         console.log("p1 hand: "+CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand);
         console.log("p1 deck: "+CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck);
         fakeGameState.board[1] = tempData.cardPlayed;
         fakeGameState.myTurn = true;
         fakeGameState.hand = CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand;
         CardGameSessionArray[tempData.gameSessionID].roundCheck(CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs, CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs);
         CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs.send(JSON.stringify(fakeGameState)); //send message to p2
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn = false;  //now p2 can play
         //MAYBE IP CHECK???
      }
      else 
         ws.send("not your turn");
   }     
   else if (CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs === ws) {//p2 message
      if (!CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn) { //p2 turn
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn = null; //safety, p1 can't play yet
         CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1] = tempData.cardPlayed;
         CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand[tempData.cardPlayedIndex-1] = CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck.shift();
         console.log("p2 shift index: "+(tempData.cardPlayedIndex-1));
         console.log("p2 hand: "+CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand);
         console.log("p2 deck: "+CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck);
         fakeGameState.board[1] = tempData.cardPlayed;
         fakeGameState.myTurn = true;
         fakeGameState.hand = CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand;
         CardGameSessionArray[tempData.gameSessionID].roundCheck(CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs, CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs);
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs.send(JSON.stringify(fakeGameState)); //send message to p1
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn = true;
         //MAYBE IP CHECK???
      } else
         ws.send("not your turn");
   }   
   else //ws doesn't belong to session, check possible reconnection trial
      CardGameSessionArray.forEach( (Session) => {
         if ((ws._socket.remoteAddress === Session.serverSide.player1.ip)) { //p1 trying to reconnect
            Session.serverSide.player1.gameWs = ws; //redefine websocket
            //TODO SEND GAME STATE TO P1
         }
         else if ((ws._socket.remoteAddress === Session.serverSide.player2.ip)){ //p2 trying to reconnect
            Session.serverSide.player2.gameWs = ws; //redefine websocket
            //TODO SEND GAME STATE TO P2
         }
      })
}



/*setInterval(() => {
   waitSockServ.broadcast();
}, 5000)*/
/*
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
}*/

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