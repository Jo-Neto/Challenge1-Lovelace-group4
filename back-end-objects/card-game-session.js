////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+this object has internal variables for each game session
//|                    GAME SESSION OBJECT                           |and methods for controlling each game session independently
//+------------------------------------------------------------------+and methods for storing the matches in the database
const fs = require('fs');

const unordDeck = ['w', 'w', 'w', 'w', 'f', 'f', 'f', 'f', 'p', 'p', 'p', 'p', 'e', 'e']; //unshuffled deck

class CardGameSession {
   constructor(nID) {
      this.isFinished = false;
      this.player1Handshake = {  //first object sent to player 1, sent only once
         sID: Number(nID),
         whichPlayer: 1,
         firstToPlay: null,
         hand: []
      };
      this.player2Handshake = { //first object sent to player 2, sent only once
         sID: Number(nID),
         whichPlayer: 2,
         firstToPlay: null,
         hand: []
      };
      this.serverSide = {  //info about the session, server only
         player1turn: null,
         lastPlayed: null,
         gameState: {
            sID: Number(nID),
            currTurn: 0,
            board: ['', ''],  // [player1, player2]
            scoreP1: 0,
            scoreP2: 0,
            enemyGaveUp: false,
            disconnec: false,
            hasCheated: false
         },
         player1: {  //server side only, data about player 1
            name: 'non-named player',
            hand: [],
            indexToReplace: null,
            deck: null,
            ip: null,
            waitingReconec: 0,
            lineWs: null,  //CAREFULL WITH RECONNECTIONS!!!
            gameWs: null,  //CAREFULL WITH RECONNECTIONS!!!
            chatWs: null  //CAREFULL WITH RECONNECTIONS!!!
         },
         player2: {  //server side only, data about player 2
            name: 'non-named player',
            hand: [],
            indexToReplace: null,
            deck: null,
            ip: null,
            waitingReconec: 0,
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
      if ((this.serverSide.gameState.board[0] === '') || (this.serverSide.gameState.board[1] === '')) //p1 não jogou ou p2 não jogou ainda
         if (!(this.serverSide.gameState.board[0] === this.serverSide.gameState.board[1])) { //mas ambos não jogaram ainda
            if (this.serverSide.gameState.board[0] === '') { //p2 jogou
               this.serverSide.player1turn = true;
            } else if (this.serverSide.gameState.board[1] === '') { //p2 jogou
               this.serverSide.player1turn = false;
            } else
               console.log("CardGameSession object --> roundcheck(fn), logical error, on passing turn(first check), Session Num: " + this.serverSide.gameState.sID);
            return false; //XOR return, //só um jogou, o outro não
         } else
            console.log("CardGameSession object --> roundCheck(fn) --> XOR ELSE, Session Num: " + this.serverSide.gameState.sID);
      else if (this.serverSide.gameState.board[0] === this.serverSide.gameState.board[1]) { //empate 
         //console.log("CardGameSession object --> roundCheck(fn) --> " + "Session Num: " + this.serverSide.gameState.sID + " draw");
         if (this.serverSide.lastPlayed === 1) //if draw, play again
            this.serverSide.player1turn = false;
         else  
            this.serverSide.player1turn = true;
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
         console.log("CardGameSession object --> logical error, CardGameSession -> roundCheck method, final else condition");
      if (this.serverSide.gameState.scoreP1 === 5) {
         this.serverSide.player1.gameWs.send("voce ganhou");
         this.serverSide.player1.gameWs.close(1000, 'match has finished');
         this.serverSide.player2.gameWs.send("voce perdeu");
         this.serverSide.player2.gameWs.close(1000, 'match has finished');
         this.serverSide.player1.gameWs.terminate();
         this.serverSide.player2.gameWs.terminate();
         this.storeOnDatabase('p1');
         return true;
      } else if (this.serverSide.gameState.scoreP2 === 5) {
         this.serverSide.player2.gameWs.send("voce ganhou");
         this.serverSide.player2.gameWs.close(1000, 'match has finished');
         this.serverSide.player1.gameWs.send("voce perdeu");
         this.serverSide.player1.gameWs.close(1000, 'match has finished');
         this.serverSide.player2.gameWs.terminate();
         this.serverSide.player1.gameWs.terminate();
         this.storeOnDatabase('p2');
         return true;
      }
      this.serverSide.gameState.currTurn++;
      this.serverSide.gameState.board[0] = '';
      this.serverSide.gameState.board[1] = '';
   }
   storeOnDatabase(winner) {
      console.log("CardGameSession object --> storeOnDatabase(fn) --> SessionNum:" + this.serverSide.gameState.sID);
      this.isFinished = true;
      this.serverSide.player1.lineWs = null;
      this.serverSide.player1.gameWs = null;
      this.serverSide.player1.chatWs = null;
      this.serverSide.player2.lineWs = null;
      this.serverSide.player2.gameWs = null;
      this.serverSide.player2.chatWs = null;
      fs.readFile('./database/game-sessions.json', (err, readData) => {
         if (err) { console.log("ERROR: SessionNum:" + this.serverSide.gameState.sID + "on reading database: "); throw console.log(err);}
         let dataBase = JSON.parse(readData);
         dataBase.push({
            sessionID: this.serverSide.gameState.sID,
            turnNum: this.serverSide.gameState.currTurn,
            disconnec: this.serverSide.gameState.disconnec, 
            hasGivenUp: this.serverSide.gameState.enemyGaveUp,
            nameP1: this.serverSide.player1.name,
            nameP2: this.serverSide.player2.name,
            scoreP1: this.serverSide.gameState.scoreP1,
            scoreP2: this.serverSide.gameState.scoreP2,
            hasCheated: this.serverSide.gameState.hasCheated,
            winner: winner
         });
         let toWrite = JSON.stringify(dataBase);
         fs.writeFile('./database/game-sessions.json', toWrite, (err, out) => {
            if (err) { console.log("ERROR: SessionNum:" + this.serverSide.gameState.sID + "on writing database: "); throw console.log(err) };
         });
         console.log("game session num: " + this.serverSide.gameState.sID + ' registered on database');
      });
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
//|                            EXPORTS                               |
//+------------------------------------------------------------------+
module.exports = CardGameSession;