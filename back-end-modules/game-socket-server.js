//+------------------------------------------------------------------+
//|                    DEDEPENDENCIES/MODULES                        |
//+------------------------------------------------------------------+
const WebSocket = require('ws');

const ServMod = require('../server.js');
const ServerLib = require('../back-end-libs/disconnector-lib.js');



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                  SOCKET SERVERS INITIALIZERS                     |
//+------------------------------------------------------------------+
const gameSockServ = new WebSocket.Server({ noServer: true, clientTracking: true }); //create serverless socket for multisocket server
gameSockServ.on('error', (error) => { console.log('GAMESOCK: gameSockServ error: '); console.log(error); }); //SocketServer error print
gameSockServ.on('connection', gameConnec);  //called at socket creation, at a new game session
gameSockServ.on('close', () => { console.log("GAMESOCK: closed gameSockServ"); clearInterval(sockServInterval); }); //clear connection checker 

function gameConnec(ws) {  //socket initialiazers
    ws.on('error', (error) => { console.log('GAMESOCK: gameWebSock error: '); console.log(error); });  //WebSocket error print
    ws.on('close', () => gameClose(ws));
    ws.on('message', (data, isBinary) => gameMessage(data, isBinary, ws));
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true }); //pong received = connection alive
    gameOpen(ws);//ws.on('open', () => gameOpen(ws));  FUCK THE DOCUMENTATION?!
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                 TIMEOUT & DISCONNECTION LOGIC                    | //TODO: NEEDS SIMULTANEOUS SESSIONS TEST
//+------------------------------------------------------------------+
const sockServInterval = setInterval(() => {
    console.log("GAMESOCK: gameSockServ interval called");
    gameSockServ.clients.forEach((ws) => { //loops trough all the server connections
        if (ws.isAlive === false) { //socket is not alive
            console.log("GAMESOCK: socket address: " + ws._socket.remoteAddress + " did not respond a ping, terminating");
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 60995); //60995 for possible desync

function gameClose(ws) { //regular disconnect socket
    console.log("GAMESOCK: ws address: " + ws._socket.remoteAddress + " closed");
    ServMod.SessArr.forEach((Session) => {
        if (!Session.isFinished) {
            if (Session.serverSide.player1.gameWs === ws) {
                Session.serverSide.player1.waitingReconec = 1;
            } else if (Session.serverSide.player2.gameWs === ws) {
                Session.serverSide.player2.waitingReconec = 1;
            }
        }
    });
}

const lineHangChecker = setInterval(() => { //check if someone disconnected
    ServerLib.connectCheckerGame(ServMod.SessArr);
}, 10973); //93333 for possible desync



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+ 
//|                       "HANDSHAKE" LOGIC                          | 
//+------------------------------------------------------------------+ 
function gameOpen(ws) {
    //console.log("GAMESOCK: gameOpen(fn) --> socket ip: " + ws._socket.remoteAddress);
    ServMod.SessArr.forEach((Session, index) => {  //loops trough all active games
        //console.log("GAMESOCK: gameOpen(fn) --> starting");
        console.log("GAMESOCK: gameOpen(fn) --> P1 IP: " + Session.serverSide.player1.ip + ",  on index: " + index + ",  session id: " + Session.serverSide.gameState.sID);
        console.log("GAMESOCK: gameOpen(fn) --> P2 IP: " + Session.serverSide.player2.ip + ",  on index: " + index + ",  session id: " + Session.serverSide.gameState.sID);
        console.log("GAMESOCK: opened socket addres(fn) --> " + ws._socket.remoteAddress);
        console.log("=================================================================================================");
        if (!Session.isFinished) {
            console.log("GAMESOCK: gameOpen(fn) --> active session foundn on index: " + index);
            if (ws._socket.remoteAddress === Session.serverSide.player1.ip) { //player 1 waiting handshake or reconnecting
                console.log("GAMESOCK: gameOpen(fn) --> checking P1 on index: " + index);
                Session.serverSide.player1.gameWs = ws; //assign socket to P1
                if (Session.serverSide.player1.waitingReconec > 1) { //reconnecting
                    console.log("GAMESOCK: gameOpen(fn) --> socket ip: " + ws._socket.remoteAddress + " -P1-reconnecting,  on index: " + index);
                    Session.serverSide.player1.waitingReconec = 0;
                    console.log("GAMESOCK: gameMessage(fn) P2 reconnecting --> reconnec score p1: " + Session.serverSide.gameState.scoreP1 +"reconnec score p2: "+ Session.serverSide.gameState.scoreP2+"turn num: "+Session.serverSide.gameState.currTurn);
                    ws.send(JSON.stringify({
                        msgType: 'reconnection',
                        sID: Session.serverSide.gameState.sID,
                        board: [Session.serverSide.gameState.board[0], Session.serverSide.gameState.board[1]], //regular board for p1
                        hand: Session.serverSide.player1.hand,  //recebe a nova mão com a carta comprada
                        myTurn: Session.serverSide.player1turn,  //recebe feedback de acordo com resultado do round
                        scoreP1: Session.serverSide.gameState.scoreP1,
                        scoreP2: Session.serverSide.gameState.scoreP2,
                        whichPlayer: 1
                    }));
                }
                else //waiting handshake
                    ws.send(JSON.stringify(Session.player1Handshake));  //send first match data
                console.log("GAMESOCK: sent gamesession to p1, ws address: " + ws._socket.remoteAddress + ",  on index: " + index);
            } else if (ws._socket.remoteAddress === Session.serverSide.player2.ip) { //player 2 waiting handshake or reconnecting
                console.log("GAMESOCK: gameOpen(fn) --> checking P2 on index: " + index);
                Session.serverSide.player2.gameWs = ws;  //assign socket to P2
                if (Session.serverSide.player2.waitingReconec > 1) { //reconnecting
                    console.log("GAMESOCK: gameOpen(fn) --> socket ip: " + ws._socket.remoteAddress + " -P2-reconnecting,  on index: " + index);
                    Session.serverSide.player2.waitingReconec = 0;
                    console.log("GAMESOCK: gameMessage(fn) P2 reconnecting --> reconnec score p1: " + Session.serverSide.gameState.scoreP1 +"reconnec score p2: "+ Session.serverSide.gameState.scoreP2+"turn num: "+Session.serverSide.gameState.currTurn);
                    ws.send(JSON.stringify({
                        msgType: 'reconnection',
                        sID: Session.serverSide.gameState.sID,
                        board: [Session.serverSide.gameState.board[1], Session.serverSide.gameState.board[0]], //inverted board for p2
                        hand: Session.serverSide.player2.hand,  //recebe a nova mão com a carta comprada
                        myTurn: !Session.serverSide.player1turn,  //recebe feedback de acordo com resultado do round
                        scoreP1: Session.serverSide.gameState.scoreP1,
                        scoreP2: Session.serverSide.gameState.scoreP2,
                        whichPlayer: 2
                    }));
                }
                else //waiting handshake
                    ws.send(JSON.stringify(Session.player2Handshake)); //send first match data
                console.log("GAMESOCK: sent gamesession to p2, ws address: " + ws._socket.remoteAddress + ",  on index: " + index);

            } 
        }
    });
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                       PLAYER DATA EXCHANGE                       | 
//+------------------------------------------------------------------+ 
function gameMessage(data, isBinary, ws) {
    /*
    OBJECT RECEIVED FROM FRONT:
    sID: gameState.sID,           
    cardPlayed: ui.draggable.attr('value'),
    cardPlayedIndex: Number(ui.draggable.attr("id").slice(-1))
    */

    let tData = {};  //data received from player
    try { tData = JSON.parse(data); }

    catch (e) { console.log("GAMESOCK: gameMessage(fn) --> received non-parsable DATA --> " + e); return; }
    try {
        if (ServMod.SessArr[tData.sID] === undefined) {
            console.log("GAMESOCK: gameMessage(fn) --> if 1");
            ws.close(1008, 'tried accesing invalid game session');
            ws.terminate();
            return;
        } else if (!(tData.cardPlayed === 'w' || tData.cardPlayed === 'f' || tData.cardPlayed === 'p' || tData.cardPlayed === 'e')) {
            console.log("GAMESOCK: gameMessage(fn) --> if 2");
            ws.close(1008, 'tried sending a non-existent card');
            ws.terminate();
            return;
        } else if (!(tData.cardPlayedIndex >= 1 && tData.cardPlayedIndex <= 3)) {
            console.log("GAMESOCK: gameMessage(fn) --> if 3");
            ws.close(1008, 'tried sending an invalid card index');
            ws.terminate();
            return;
        }
    }
    catch (e) { console.log("GAMESOCK: gameMessage(fn) --> non comparable tData --> " + e); return; }

    let enemyFakeGameState = { board: [] }; //safety obj clean
    let feedbackFakeGameState = { board: [] }; //instant feedback object
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    if ( ServMod.SessArr[tData.sID].serverSide.player1.gameWs === ws || ServMod.SessArr[tData.sID].serverSide.player2.gameWs === ws ) {
    
    }else if (ServMod.SessArr[tData.sID].serverSide.player2.gameWs === ws) {
            if (ServMod.SessArr[tData.sID].serverSide.player1turn)
    */
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //console.log("p1 hand: " + ServMod.SessArr[tData.sID].serverSide.player1.hand);
    //console.log("p1 deck: " + ServMod.SessArr[tData.sID].serverSide.player1.deck);
    //console.log("p2 hand: " + ServMod.SessArr[tData.sID].serverSide.player2.hand);
    //console.log("p2 deck: " + ServMod.SessArr[tData.sID].serverSide.player2.deck);
    if (ServMod.SessArr[tData.sID].serverSide.player1.gameWs === ws) { //p1 message
        if (ServMod.SessArr[tData.sID].serverSide.player1turn) { //p1 turn
            ServMod.SessArr[tData.sID].serverSide.player1turn = null; //safety, prevent players from playing

            ///ANTI-CHEAT AGAINST P1/////////////////////////////
            if (ServMod.SessArr[tData.sID].serverSide.player1.hand[tData.cardPlayedIndex - 1] !== tData.cardPlayed) {
                console.log("GAMESOCK: gameMessage(fn) --> p2 cheated --> Session id: " + tData.sID);
                ServMod.SessArr[tData.sID].serverSide.player1.gameWs.send("cheat detected, you lost");
                ServMod.SessArr[tData.sID].serverSide.player1.gameWs.close(1008, 'player cheated');
                ServMod.SessArr[tData.sID].serverSide.player1.gameWs.terminate();
                ServMod.SessArr[tData.sID].serverSide.gameState.hasCheated = true;
                if (ServMod.SessArr[tData.sID].serverSide.player2.waitingReconec === 0) {
                    ServMod.SessArr[tData.sID].serverSide.player2.gameWs.send("cheat");
                    ServMod.SessArr[tData.sID].serverSide.player2.gameWs.close(4008, 'the other player cheated');
                    ServMod.SessArr[tData.sID].serverSide.player2.gameWs.terminate();
                    ServMod.SessArr[tData.sID].storeOnDatabase('p2');
                    return;
                } else {
                    ServMod.SessArr[tData.sID].storeOnDatabase('p2');
                    return;
                }
            }
            ///////////////////////////////////////////////////////////


            ///SAVING P1 MOVE IN SERVER

            ServMod.SessArr[tData.sID].serverSide.lastPlayed = 1;
            ServMod.SessArr[tData.sID].serverSide.gameState.board[0] = tData.cardPlayed;
            ServMod.SessArr[tData.sID].serverSide.player1.hand[tData.cardPlayedIndex - 1] = ServMod.SessArr[tData.sID].serverSide.player1.deck.shift();
            //console.log("p1 shift index: " + (tData.cardPlayedIndex - 1));
            //console.log("p1 hand: " + ServMod.SessArr[tData.sID].serverSide.player1.hand);
            //console.log("p1 deck: " + ServMod.SessArr[tData.sID].serverSide.player1.deck);


            ///IF PLAYER 2 IS DC & PLAYER 1 IS WAITING
            if (ServMod.SessArr[tData.sID].serverSide.player2.waitingReconec != 0) {
                console.log("GAMESOCK: gameMessage(fn) --> p1 waiting p2 reconnec --> Session id: " + tData.sID);
                if (ServMod.SessArr[tData.sID].roundCheck())
                    return;
                console.log("GAMESOCK: gameMessage(fn) P2 reconnecting --> reconnec score p1: " + ServMod.SessArr[tData.sID].serverSide.gameState.scoreP1 +"reconnec score p2: "+ ServMod.SessArr[tData.sID].serverSide.gameState.scoreP2+"turn num: "+ServMod.SessArr[tData.sID].serverSide.gameState.currTurn);
                ServMod.SessArr[tData.sID].serverSide.player2.gameWs.send(JSON.stringify({
                    msgType: 'reconnection',
                    newHand: ServMod.SessArr[tData.sID].serverSide.player1.hand,
                    board: [ServMod.SessArr[tData.sID].serverSide.gameState.board[0], ServMod.SessArr[tData.sID].serverSide.gameState.board[1]],
                    myTurn: !ServMod.SessArr[tData.sID].serverSide.player1turn,
                    scoreP1: ServMod.SessArr[tData.sID].serverSide.gameState.scoreP1,
                    scoreP2: ServMod.SessArr[tData.sID].serverSide.gameState.scoreP2,
                    turnNum: ServMod.SessArr[tData.sID].serverSide.gameState.currTurn

                  
                }));
                return;
            }
            //////////////////////////////////////////

            enemyFakeGameState.msgType = 'waitingFeedback';
            enemyFakeGameState.sID = tData.sID;
            enemyFakeGameState.hand = [...ServMod.SessArr[tData.sID].serverSide.player2.hand];
            if (ServMod.SessArr[tData.sID].serverSide.gameState.board[0] !== '' && ServMod.SessArr[tData.sID].serverSide.gameState.board[1] !== '') { //makeshift for front-end, both players have cards in board
                enemyFakeGameState.board[0] = ServMod.SessArr[tData.sID].serverSide.gameState.board[1];
                enemyFakeGameState.board[1] = ServMod.SessArr[tData.sID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[0] = ServMod.SessArr[tData.sID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[1] = ServMod.SessArr[tData.sID].serverSide.gameState.board[1];
                if (ServMod.SessArr[tData.sID].roundCheck())
                    return;

            } else {
                if (ServMod.SessArr[tData.sID].roundCheck())
                    return;
                enemyFakeGameState.board[0] = ServMod.SessArr[tData.sID].serverSide.gameState.board[1];
                enemyFakeGameState.board[1] = ServMod.SessArr[tData.sID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[0] = ServMod.SessArr[tData.sID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[1] = ServMod.SessArr[tData.sID].serverSide.gameState.board[1];
            }

          
            enemyFakeGameState.myTurn = !ServMod.SessArr[tData.sID].serverSide.player1turn;
            enemyFakeGameState.scoreP1 = ServMod.SessArr[tData.sID].serverSide.gameState.scoreP1;
            enemyFakeGameState.scoreP2 = ServMod.SessArr[tData.sID].serverSide.gameState.scoreP2;
            enemyFakeGameState.turnNum = ServMod.SessArr[tData.sID].serverSide.gameState.currTurn;



            //////////---INSTANT FEEDBACK OBJECT---////////////////////
            feedbackFakeGameState = {
                msgType: 'instantFeedback',
                newHand: ServMod.SessArr[tData.sID].serverSide.player1.hand,
                board: [ServMod.SessArr[tData.sID].serverSide.gameState.board[0], ServMod.SessArr[tData.sID].serverSide.gameState.board[1]],
                myTurn: ServMod.SessArr[tData.sID].serverSide.player1turn,
                scoreP1: ServMod.SessArr[tData.sID].serverSide.gameState.scoreP1,
                scoreP2: ServMod.SessArr[tData.sID].serverSide.gameState.scoreP2,
                turnNum: ServMod.SessArr[tData.sID].serverSide.gameState.currTurn
            };
            ////////////////////////////////////////////////////////////////
            //////////////////////////////////////////
            //sending proccessed message to both players

            ServMod.SessArr[tData.sID].serverSide.player1.gameWs.send(JSON.stringify(feedbackFakeGameState));
            ServMod.SessArr[tData.sID].serverSide.player2.gameWs.send(JSON.stringify(enemyFakeGameState)); //send message to p2


        }
        else {
            ws.send("not your turn, front-end error or cheat");
            console.log("ERROR: GAMESOCK: gameMessage(fn) --> wrong player message");
        }

    } else if (ServMod.SessArr[tData.sID].serverSide.player2.gameWs === ws) { //p2 message
        if (!ServMod.SessArr[tData.sID].serverSide.player1turn) { //p2 turn
            ServMod.SessArr[tData.sID].serverSide.player1turn = null; //safety, prevent players from playing

            ///ANTI-CHEAT AGAINST P2///////////////////////////////
            if (ServMod.SessArr[tData.sID].serverSide.player2.hand[tData.cardPlayedIndex - 1] !== tData.cardPlayed) {
                console.log("GAMESOCK: gameMessage(fn) --> p2 cheated --> Session id: " + tData.sID);
                ServMod.SessArr[tData.sID].serverSide.player2.gameWs.send("cheat detected, you lost");
                ServMod.SessArr[tData.sID].serverSide.player2.gameWs.close(1008, 'player cheated');
                ServMod.SessArr[tData.sID].serverSide.player2.gameWs.terminate();
                ServMod.SessArr[tData.sID].serverSide.gameState.hasCheated = true;
                if (ServMod.SessArr[tData.sID].serverSide.player1.waitingReconec === 0) {
                    ServMod.SessArr[tData.sID].serverSide.player1.gameWs.send("cheat");
                    ServMod.SessArr[tData.sID].serverSide.player1.gameWs.close(4008, 'the other player cheated');
                    ServMod.SessArr[tData.sID].serverSide.player1.gameWs.terminate();
                    ServMod.SessArr[tData.sID].storeOnDatabase('p1');
                    return;
                } else {
                    ServMod.SessArr[tData.sID].storeOnDatabase('p1');
                    return;
                }
            }
            /////////////////////////////////////////////////////////////


            ///SAVING P2 MOVE IN SERVER

            ServMod.SessArr[tData.sID].serverSide.lastPlayed = 2;
            ServMod.SessArr[tData.sID].serverSide.gameState.board[1] = tData.cardPlayed;
            ServMod.SessArr[tData.sID].serverSide.player2.hand[tData.cardPlayedIndex - 1] = ServMod.SessArr[tData.sID].serverSide.player2.deck.shift();
            //console.log("p2 shift index: " + (tData.cardPlayedIndex - 1));
            //console.log("p2 hand: " + ServMod.SessArr[tData.sID].serverSide.player2.hand);
            //console.log("p2 deck: " + ServMod.SessArr[tData.sID].serverSide.player2.deck);


            ///IF PLAYER 1 IS DC & PLAYER 2 IS WAITING////////////////////
            if (ServMod.SessArr[tData.sID].serverSide.player1.waitingReconec != 0) {
                console.log("GAMESOCK: gameMessage(fn) P1 reconnecting --> reconnec score p1: " + ServMod.SessArr[tData.sID].serverSide.gameState.scoreP1 +"reconnec score p2: "+ ServMod.SessArr[tData.sID].serverSide.gameState.scoreP2+"turn num: "+ServMod.SessArr[tData.sID].serverSide.gameState.currTurn);
                if (ServMod.SessArr[tData.sID].roundCheck())
                    return;
                ServMod.SessArr[tData.sID].serverSide.player1.gameWs.send(JSON.stringify({
                    msgType: 'reconnection',
                    newHand: ServMod.SessArr[tData.sID].serverSide.player2.hand,
                    board: [ServMod.SessArr[tData.sID].serverSide.gameState.board[1], ServMod.SessArr[tData.sID].serverSide.gameState.board[0]],
                    myTurn: ServMod.SessArr[tData.sID].serverSide.player1turn,
                    scoreP1: ServMod.SessArr[tData.sID].serverSide.gameState.scoreP1,
                    scoreP2: ServMod.SessArr[tData.sID].serverSide.gameState.scoreP2,
                    turnNum: ServMod.SessArr[tData.sID].serverSide.gameState.currTurn

                }));
                return;
            }
            ////////////////////////////////////////////////////////////////

            enemyFakeGameState.msgType = 'waitingFeedback';
            enemyFakeGameState.sID = tData.sID;
            enemyFakeGameState.hand = [...ServMod.SessArr[tData.sID].serverSide.player1.hand];
            if (ServMod.SessArr[tData.sID].serverSide.gameState.board[0] !== '' && ServMod.SessArr[tData.sID].serverSide.gameState.board[1] !== '') { //makeshift for front-end, both players have cards in board
                enemyFakeGameState.board[0] = ServMod.SessArr[tData.sID].serverSide.gameState.board[0];
                enemyFakeGameState.board[1] = ServMod.SessArr[tData.sID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[0] = ServMod.SessArr[tData.sID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[1] = ServMod.SessArr[tData.sID].serverSide.gameState.board[0];
                if (ServMod.SessArr[tData.sID].roundCheck())
                    return;

            } else {
                if (ServMod.SessArr[tData.sID].roundCheck())
                    return;
                enemyFakeGameState.board[0] = ServMod.SessArr[tData.sID].serverSide.gameState.board[0];
                enemyFakeGameState.board[1] = ServMod.SessArr[tData.sID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[0] = ServMod.SessArr[tData.sID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[1] = ServMod.SessArr[tData.sID].serverSide.gameState.board[0];
            }

            enemyFakeGameState.myTurn = ServMod.SessArr[tData.sID].serverSide.player1turn;
            enemyFakeGameState.scoreP1 = ServMod.SessArr[tData.sID].serverSide.gameState.scoreP1;
            enemyFakeGameState.scoreP2 = ServMod.SessArr[tData.sID].serverSide.gameState.scoreP2;
            enemyFakeGameState.turnNum = ServMod.SessArr[tData.sID].serverSide.gameState.currTurn;


            //////////---INSTANT FEEDBACK OBJECT---////////////////////
            feedbackFakeGameState = {
                msgType: 'instantFeedback',
                newHand: ServMod.SessArr[tData.sID].serverSide.player2.hand,
                board: [ServMod.SessArr[tData.sID].serverSide.gameState.board[1], ServMod.SessArr[tData.sID].serverSide.gameState.board[0]],
                myTurn: !ServMod.SessArr[tData.sID].serverSide.player1turn,
                scoreP1: ServMod.SessArr[tData.sID].serverSide.gameState.scoreP1,
                scoreP2: ServMod.SessArr[tData.sID].serverSide.gameState.scoreP2,
                turnNum: ServMod.SessArr[tData.sID].serverSide.gameState.currTurn
            };
            //////////////////////////////////////////
            //sending proccessed message to both players

            ServMod.SessArr[tData.sID].serverSide.player2.gameWs.send(JSON.stringify(feedbackFakeGameState));
            ServMod.SessArr[tData.sID].serverSide.player1.gameWs.send(JSON.stringify(enemyFakeGameState));


        } else {
            ws.send("not your turn, front-end error or cheat");
            console.log("ERROR: GAMESOCK: gameMessage(fn) --> wrong player message");
        }
    }
    else { //ws doesn't belong to session, check possible reconnection trial
        ServMod.SessArr.forEach((Session) => {
            if (!Session.isFinished) {
                if (ws._socket.remoteAddress === Session.serverSide.player1.ip) { //p1 trying to reconnect
                    Session.serverSide.player1.gameWs = ws; //redefine websocket
                    Session.serverSide.player1.waitingReconec = 0;
                    console.log("ERROR: GAMESOCK: gameMessage(fn) --> final else - player 1 reconec");
                } else if (ws._socket.remoteAddress === Session.serverSide.player2.ip) { //p2 trying to reconnect
                    Session.serverSide.player2.gameWs = ws; //redefine websocket
                    Session.serverSide.player2.waitingReconec = 0;
                    console.log("ERROR: GAMESOCK: gameMessage(fn) --> final else - player 2 reconec");
                } else
                    console.log("ERROR: GAMESOCK: gameMessage(fn) --> final else - ws && IP does not belong to session");
            }
        });
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                            EXPORTS                               |
//+------------------------------------------------------------------+
module.exports.gameSockServ = gameSockServ;