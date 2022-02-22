//+------------------------------------------------------------------+
//|                    DEDEPENDENCIES/MODULES                        |
//+------------------------------------------------------------------+
const WebSocket = require('ws');

const ServerModule = require('../server.js');
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
    ws.isAlive = false;
    ws.terminate();
}

const lineHangChecker = setInterval(() => {
    ServerLib.connectCheckerGame(ServerModule.CardGameSessionArray);
}, 10973); //93333 for possible desync



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+  TODO: reconnecting logic
//|                       "HANDSHAKE" LOGIC                          | 
//+------------------------------------------------------------------+ 
function gameOpen(ws) {
    console.log("GAMESOCK: gameOpen(fn) --> socket ip: " + ws._socket.remoteAddress);
    ServerModule.CardGameSessionArray.forEach((Session) => {  //loops trough all active games
        if ((ws._socket.remoteAddress === Session.serverSide.player1.ip)) { //player 1 waiting handshake or reconnecting
            Session.serverSide.player1.gameWs = ws; //assing socket to P1
            if (Session.serverSide.player1.waitingReconec) { //reconnecting
                Session.serverSide.player1.waitingReconec = false;
                //TODO: send game state
            }
            else //waiting handshake
                ws.send(JSON.stringify(Session.player1Handshake));  //send first match data
            console.log("GAMESOCK: sent gamesession to p1, ws address: " + ws._socket.remoteAddress);
        } else if ((ws._socket.remoteAddress === Session.serverSide.player2.ip)) { //player 2 waiting handshake or reconnecting
            Session.serverSide.player2.gameWs = ws;  //assing socket to P2
            if (Session.serverSide.player2.waitingReconec) { //reconnecting
                Session.serverSide.player2.waitingReconec = false;
                //TODO: send game state
            }
            ws.send(JSON.stringify(Session.player2Handshake)); //send first match data
            console.log("GAMESOCK: sent gamesession to p2, ws address: " + ws._socket.remoteAddress);
        } else {
            console.log("GAMESOCK: player does not belong to session, terminating");
            ws.close(4004, `you don't belong to any ongoing matches`);
            //TODO: REDIRECT TO HOME PAGE
            ws.terminate(); //safety
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
    gameSessionID: gameState.gameSessionID,           
    cardPlayed: ui.draggable.attr('value'),
    cardPlayedIndex: Number(ui.draggable.attr("id").slice(-1))
    */
    let tempData = JSON.parse(data); //data received from player
    let enemyFakeGameState = { board: [] }; //safety obj clean
    let feedbackFakeGameState = { board: [] }; //instant feedback object
    //console.log("p1 hand: " + ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand);
    //console.log("p1 deck: " + ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck);
    //console.log("p2 hand: " + ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand);
    //console.log("p2 deck: " + ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck);
    if (ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs === ws) { //p1 message
        if (ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn) { //p1 turn
            //TODO: CHECK PLAYER 2 CONNECTION, IF NOT CONNECTED, SAVE P1 PLAY, DISABLE P1 TURN, WAIT FOR P2,
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn = null; //safety, prevent players from playing
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.lastPlayed = 1;
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0] = tempData.cardPlayed;
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand[tempData.cardPlayedIndex - 1] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck.shift();
            //console.log("p1 shift index: " + (tempData.cardPlayedIndex - 1));
            //console.log("p1 hand: " + ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand);
            //console.log("p1 deck: " + ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck);
            enemyFakeGameState.msgType = 'waitingFeedback';
            enemyFakeGameState.gameSessionID = tempData.gameSessionID;
            enemyFakeGameState.hand = [...ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand];
            if (ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0] !== '' && ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1] !== '') { //makeshift for front-end, both players have cards in board
                enemyFakeGameState.board[0] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                enemyFakeGameState.board[1] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[0] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[1] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                if (ServerModule.CardGameSessionArray[tempData.gameSessionID].roundCheck())
                    return;

            } else {
                if (ServerModule.CardGameSessionArray[tempData.gameSessionID].roundCheck())
                    return;
                enemyFakeGameState.board[0] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                enemyFakeGameState.board[1] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[0] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[1] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
            }
            enemyFakeGameState.myTurn = !ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn;
            enemyFakeGameState.scoreP1 = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1;
            enemyFakeGameState.scoreP2 = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2;
            //////////---FEEDBACK---////////////////////
            feedbackFakeGameState = {
                msgType: 'instantFeedback',
                newHand: ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand,
                board: [ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0], ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1]],
                myTurn: ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn,
                scoreP1: ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1,
                scoreP2: ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2
            };
            //////////////////////////////////////////
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs.send(JSON.stringify(feedbackFakeGameState));
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs.send(JSON.stringify(enemyFakeGameState)); //send message to p2
        }
        else {
            ws.send("not your turn, front-end error or cheat");
            console.log("GAMESOCK: wrong player message");
        }
    } else if (ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs === ws) { //p2 message
        if (!ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn) { //p2 turn
            //TODO: CHECK PLAYER 1 CONNECTION, IF NOT CONNECTED, SAVE P2 PLAY, DISABLE P2 TURN, WAIT FOR P1, 
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn = null; //safety, prevent players from playing
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.lastPlayed = 2;
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1] = tempData.cardPlayed;
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand[tempData.cardPlayedIndex - 1] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck.shift();
            //console.log("p2 shift index: " + (tempData.cardPlayedIndex - 1));
            //console.log("p2 hand: " + ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand);
            //console.log("p2 deck: " + ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck);
            enemyFakeGameState.msgType = 'waitingFeedback';
            enemyFakeGameState.gameSessionID = tempData.gameSessionID;
            enemyFakeGameState.hand = [...ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand];
            if (ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0] !== '' && ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1] !== '') { //makeshift for front-end, both players have cards in board
                enemyFakeGameState.board[0] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                enemyFakeGameState.board[1] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[0] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[1] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                if (ServerModule.CardGameSessionArray[tempData.gameSessionID].roundCheck())
                    return;

            } else {
                if (ServerModule.CardGameSessionArray[tempData.gameSessionID].roundCheck())
                    return;
                enemyFakeGameState.board[0] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                enemyFakeGameState.board[1] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[0] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[1] = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
            }
            enemyFakeGameState.myTurn = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn;
            enemyFakeGameState.scoreP1 = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1;
            enemyFakeGameState.scoreP2 = ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2;
            //////////---FEEDBACK---////////////////////
            feedbackFakeGameState = {
                msgType: 'instantFeedback',
                newHand: ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand,
                board: [ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1], ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0]],
                myTurn: !ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn,
                scoreP1: ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1,
                scoreP2: ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2
            };
            //////////////////////////////////////////
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs.send(JSON.stringify(feedbackFakeGameState));
            ServerModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs.send(JSON.stringify(enemyFakeGameState));
        } else {
            ws.send("not your turn, front-end error or cheat");
            console.log("GAMESOCK: wrong player message");
        }
    }
    else { //ws doesn't belong to session, check possible reconnection trial
        ServerModule.CardGameSessionArray.forEach( (Session) => {
            if (ws._socket.remoteAddress === Session.serverSide.player1.ip) { //p1 trying to reconnect
                Session.serverSide.player1.gameWs = ws; //redefine websocket
                //TODO: SEND GAME STATE TO P1
            } else if (ws._socket.remoteAddress === Session.serverSide.player2.ip) { //p2 trying to reconnect
                Session.serverSide.player2.gameWs = ws; //redefine websocket
                //TODO: SEND GAME STATE TO P2
            }
        });
    }
}

module.exports.gameSockServ = gameSockServ;