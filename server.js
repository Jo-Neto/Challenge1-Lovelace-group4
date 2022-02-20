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
            board: ['', ''],  // [player1, player2]
            scoreP1: 0,
            scoreP2: 0,
            enemyGaveUp: false,
            isFinished: false
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
      this.serverSide.player1.hand = this.serverSide.player1.deck.splice(0, 3);
      this.serverSide.player2.hand = this.serverSide.player2.deck.splice(0, 3);
      this.player1Handshake.hand = this.serverSide.player1.hand;
      this.player2Handshake.hand = this.serverSide.player2.hand;
   }
   randFirstToPlay() {  //randomize which player plays first, 
      this.serverSide.player1turn = Boolean(Math.round(Math.random()));
      this.player1Handshake.firstToPlay = this.serverSide.player1turn;
      this.player2Handshake.firstToPlay = !this.serverSide.player1turn;

   }
   shuffleDeck() { //shuffle deck 
      this.serverSide.player1.deck = shuffle(unordDeck);
      this.serverSide.player2.deck = shuffle(unordDeck);
   }
   roundCheck() {
      console.log("P1 board = " + this.serverSide.gameState.board[0]);
      console.log("P2 board = " + this.serverSide.gameState.board[1]);
      if ((this.serverSide.gameState.board[0] === '') || (this.serverSide.gameState.board[1] === '')) //p1 não jogou ou p2 não jogou ainda
         if (!(this.serverSide.gameState.board[0] === this.serverSide.gameState.board[1])) {//mas ambos não jogaram ainda
            console.log("round unfinished");
            if (this.serverSide.gameState.board[0] === '') {
               console.log("passing turn to P1");
               this.serverSide.player1turn = true;
            }
            else if (this.serverSide.gameState.board[1] === '') {
               console.log("passing turn to P2");
               this.serverSide.player1turn = false;
            } else
               console.log("logical error, roundcheck(fn), passing turn");
            return; //XOR return, //só um jogou, o outro não
         } else
            console.log("XOR ELSE");
      else if (this.serverSide.gameState.board[0] === this.serverSide.gameState.board[1]) { //empate 
         console.log("roundCheck(fn) --> draw");
      } else if (this.serverSide.gameState.board[0] == 'e' && this.serverSide.gameState.board[1] != 'e') {
         this.serverSide.gameState.scoreP1++;
         this.serverSide.player1turn = true;
      } else if (this.serverSide.gameState.board[1] == 'e' && this.serverSide.gameState.board[0] != 'e') {
         this.serverSide.gameState.scoreP2++;
         this.serverSide.player1turn = false;
      } else if (this.serverSide.gameState.board[0] == 'w' && this.serverSide.gameState.board[1] == 'f') {
         this.serverSide.gameState.scoreP1++;
         this.serverSide.player1turn = true;
      } else if (this.serverSide.gameState.board[0] == 'w' && this.serverSide.gameState.board[1] == 'p') {
         this.serverSide.gameState.scoreP2++;
         this.serverSide.player1turn = false;
      } else if (this.serverSide.gameState.board[0] == 'f' && this.serverSide.gameState.board[1] == 'w') {
         this.serverSide.gameState.scoreP2++;
         this.serverSide.player1turn = false;
      } else if (this.serverSide.gameState.board[0] == 'f' && this.serverSide.gameState.board[1] == 'p') {
         this.serverSide.gameState.scoreP1++;
         this.serverSide.player1turn = true;
      } else if (this.serverSide.gameState.board[0] == 'p' && this.serverSide.gameState.board[1] == 'w') {
         this.serverSide.gameState.scoreP1++;
         this.serverSide.player1turn = true;
      } else if (this.serverSide.gameState.board[0] == 'p' && this.serverSide.gameState.board[1] == 'f') {
         this.serverSide.gameState.scoreP2++;
         this.serverSide.player1turn = false;
      } else
         console.log("logical error, CardGameSession -> roundCheck method, final else condition");
      
      if (this.serverSide.gameState.scoreP1 === 5) {
         console.log("P1 wins the match");
         this.serverSide.gameState.isFinished = true;
         this.serverSide.player1.gameWs.send("voce ganhou");
         this.serverSide.player1.gameWs.close(1000, 'match has finished');
         this.serverSide.player2.gameWs.send("voce perdeu");
         this.serverSide.player2.gameWs.close(1000, 'match has finished');
         this.serverSide.player1.gameWs.terminate();
         this.serverSide.player2.gameWs.terminate();
         return;
      } else if (this.serverSide.gameState.scoreP2 === 5) {
         console.log("P2 wins the match");
         this.serverSide.gameState.isFinished = true;
         this.serverSide.player2.gameWs.send("voce ganhou");
         this.serverSide.player2.gameWs.close(1000, 'match has finished');
         this.serverSide.player1.gameWs.send("voce perdeu");
         this.serverSide.player1.gameWs.close(1000, 'match has finished');
         this.serverSide.player2.gameWs.terminate();
         this.serverSide.player1.gameWs.terminate();
         return;
      }
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
   CardGameSessionArray.forEach((Session) => {
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
   ws.on('message', (data, isBinary) => gameMessage(data, isBinary, ws));
   gameOpen(ws);  //ws.on('open', () => gameOpen(ws));  FUCK THE DOCUMENTATION?!
   //ws.on('pong', { isAlive: true });
}

function gameOpen(ws) {
   console.log("gameOpen -- socket ip: " + ws._socket.remoteAddress);
   CardGameSessionArray.forEach((Session) => {
      console.log("gameOpen -- p1 IP=" + Session.serverSide.player1.ip);
      console.log("gameOpen -- p2 IP=" + Session.serverSide.player2.ip);
      if ((ws._socket.remoteAddress === Session.serverSide.player1.ip)) { //player 1 waiting handshake or reconnecting
         Session.serverSide.player1.gameWs = ws;
         console.log("sent gamesession to p1");
         ws.send(JSON.stringify(Session.player1Handshake));
      } else if ((ws._socket.remoteAddress === Session.serverSide.player2.ip)) { //player 2 waiting handshake or reconnecting
         Session.serverSide.player2.gameWs = ws;
         console.log("sent gamesession to p2");
         ws.send(JSON.stringify(Session.player2Handshake));
      } else {
         console.log("player not belong to session, terminating");
         ws.close(4004, `you don't belong to any ongoing matches`);
         //redirect to home page
         ws.terminate(); //safety
      }
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
   console.log("p1 hand: " + CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand);
   console.log("p1 deck: " + CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck);
   console.log("p2 hand: " + CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand);
   console.log("p2 deck: " + CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck);
   let fakeGameState = {
      board: []
   }; //safety
   if (CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs === ws) {//p1 message 
      if (CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn) { //p1 turn
         //CHECK PLAYER 2 CONNECTION, IF NOT CONNECTED, SAVE P1 PLAY, DISABLE P1 TURN, WAIT FOR P2,
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn = null; //safety, nobody can't play yet
         CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0] = tempData.cardPlayed;
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand[tempData.cardPlayedIndex - 1] = CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck.shift();
         console.log("p1 shift index: " + (tempData.cardPlayedIndex - 1));
         console.log("p1 hand: " + CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand);
         console.log("p1 deck: " + CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck);
         fakeGameState.gameSessionID = tempData.gameSessionID;
         fakeGameState.hand = [...CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand];
         fakeGameState.msgType = 'waitingFeedback';
         CardGameSessionArray[tempData.gameSessionID].roundCheck();
         fakeGameState.board[0] = CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1]; //send board to p2
         fakeGameState.board[1] = CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
         fakeGameState.myTurn = !CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn;
         fakeGameState.scoreP1 = CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1;
         fakeGameState.scoreP2 = CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2;
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs.send(JSON.stringify({
            msgType: 'instantFeedback',
            board: [CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0], CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1]],
            newHand: CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand,
            myTurn: CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn,
            scoreP1: CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1,
            scoreP2: CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2
         })); //send new p1 and turn feedback
         CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs.send(JSON.stringify(fakeGameState)); //send message to p2
      }
      else
         ws.send("not your turn, front-end error or cheat");
   }
   else if (CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs === ws) {//p2 message
      if (!CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn) { //p2 turn
         //CHECK PLAYER 1 CONNECTION, IF NOT CONNECTED, SAVE P2 PLAY, DISABLE P2 TURN, WAIT FOR P1, 
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn = null; //safety, nobody can't play yet
         CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1] = tempData.cardPlayed;
         CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand[tempData.cardPlayedIndex - 1] = CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck.shift();
         console.log("p2 shift index: " + (tempData.cardPlayedIndex - 1));
         console.log("p2 hand: " + CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand);
         console.log("p2 deck: " + CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck);
         fakeGameState.gameSessionID = tempData.gameSessionID;
         fakeGameState.hand = [...CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand];
         fakeGameState.msgType = 'waitingFeedback';
         CardGameSessionArray[tempData.gameSessionID].roundCheck();
         fakeGameState.board[0] = CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];  //send board to p1
         fakeGameState.board[1] = CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
         fakeGameState.myTurn = CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn;
         fakeGameState.scoreP1 = CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1;
         fakeGameState.scoreP2 = CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2;
         CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs.send(JSON.stringify({
            msgType: 'instantFeedback',
            board: [CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1], CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0]],
            newHand: CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand,
            myTurn: !CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn,
            scoreP1: CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1,
            scoreP2: CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2
         })); //send new p2 and turn feedback
         CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs.send(JSON.stringify(fakeGameState)); //send message to p1
      } else
         ws.send("not your turn, front-end error or cheat");
   }
   else //ws doesn't belong to session, check possible reconnection trial
      CardGameSessionArray.forEach((Session) => {
         if ((ws._socket.remoteAddress === Session.serverSide.player1.ip)) { //p1 trying to reconnect
            Session.serverSide.player1.gameWs = ws; //redefine websocket
            //TODO SEND GAME STATE TO P1
         }
         else if ((ws._socket.remoteAddress === Session.serverSide.player2.ip)) { //p2 trying to reconnect
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