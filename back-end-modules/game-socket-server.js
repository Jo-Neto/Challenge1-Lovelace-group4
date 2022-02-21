//+------------------------------------------------------------------+
//|                    DEDEPENDENCIES/MODULES                        |
//+------------------------------------------------------------------+
const WebSocket = require('ws');
const serverModule = require('../server.js');



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                  SOCKET SERVERS INITIALIZERS                     |
//+------------------------------------------------------------------+
const gameSockServ = new WebSocket.Server({ noServer: true, clientTracking: true }); //create serverless socket for multisocket server
gameSockServ.on('error', (error) => { console.log('gameSockServ error: '); console.log(error); }); //socket error print
gameSockServ.on('connection', gameConnec);  //called at socket creation, at a new game session

function gameConnec(ws) {  //socket initialiazers
    console.log("gameConnec");
    ws.on('close', () => gameClose);
    ws.on('error', (error) => { console.log('gameSock error: '); console.log(error); });  //socket error print
    ws.on('message', (data, isBinary) => gameMessage(data, isBinary, ws));
    gameOpen(ws);  //ws.on('open', () => gameOpen(ws));  FUCK THE DOCUMENTATION?!
    //ws.on('pong', { isAlive: true });
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+  TODO: reconnecting logic
//|                   PLAYER GAME DATA EXCHANGE                      |  TODO: timer for timeout && connection checker
//+------------------------------------------------------------------+  REJEIÇÃO CASO NÃO TENHA PARTIDA PRONTA

function gameOpen(ws) {
    console.log("gameOpen -- socket ip: " + ws._socket.remoteAddress);
    serverModule.CardGameSessionArray.forEach((Session) => {  //loops trough all active games
        console.log("gameOpen -- p1 IP=" + Session.serverSide.player1.ip);
        console.log("gameOpen -- p2 IP=" + Session.serverSide.player2.ip);
        if ((ws._socket.remoteAddress === Session.serverSide.player1.ip)) { //player 1 waiting handshake or reconnecting
            Session.serverSide.player1.gameWs = ws; //assing socket to P1
            console.log("sent gamesession to p1");
            ws.send(JSON.stringify(Session.player1Handshake));  //send first match data
        } else if ((ws._socket.remoteAddress === Session.serverSide.player2.ip)) { //player 2 waiting handshake or reconnecting
            Session.serverSide.player2.gameWs = ws;  //assing socket to P2
            console.log("sent gamesession to p2");
            ws.send(JSON.stringify(Session.player2Handshake)); //send first match data
        } else {
            console.log("player does not belong to session, terminating");
            ws.close(4004, `you don't belong to any ongoing matches`);
            //TODO: REDIRECT TO HOME PAGE
            ws.terminate(); //safety
        }
    });
}

function gameClose() {
    console.log("gameClose");
}


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
    //console.log("p1 hand: " + serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand);
    //console.log("p1 deck: " + serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck);
    //console.log("p2 hand: " + serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand);
    //console.log("p2 deck: " + serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck);
    if (serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs === ws) { //p1 message
        if (serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn) { //p1 turn
            //TODO: CHECK PLAYER 2 CONNECTION, IF NOT CONNECTED, SAVE P1 PLAY, DISABLE P1 TURN, WAIT FOR P2,
            serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn = null; //safety, prevent players from playing
            serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0] = tempData.cardPlayed;
            serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand[tempData.cardPlayedIndex - 1] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck.shift();
            //console.log("p1 shift index: " + (tempData.cardPlayedIndex - 1));
            //console.log("p1 hand: " + serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand);
            //console.log("p1 deck: " + serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.deck);
            enemyFakeGameState.msgType = 'waitingFeedback';
            enemyFakeGameState.gameSessionID = tempData.gameSessionID;
            enemyFakeGameState.hand = [...serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand];
            if (serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0] !== '' && serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1] !== '') { //makeshift for front-end, both players have cards in board
                enemyFakeGameState.board[0] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                enemyFakeGameState.board[1] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[0] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[1] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                serverModule.CardGameSessionArray[tempData.gameSessionID].roundCheck();

            } else {
                serverModule.CardGameSessionArray[tempData.gameSessionID].roundCheck();
                enemyFakeGameState.board[0] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                enemyFakeGameState.board[1] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[0] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                feedbackFakeGameState.board[1] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
            }
            enemyFakeGameState.myTurn = !serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn;
            enemyFakeGameState.scoreP1 = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1;
            enemyFakeGameState.scoreP2 = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2;
            //////////---FEEDBACK---////////////////////
            feedbackFakeGameState = {
                msgType: 'instantFeedback',
                newHand: serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand,
                board: [serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0], serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1]],
                myTurn: serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn,
                scoreP1: serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1,
                scoreP2: serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2
            };
            //////////////////////////////////////////
            serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs.send(JSON.stringify(feedbackFakeGameState));
            serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs.send(JSON.stringify(enemyFakeGameState)); //send message to p2
        }
        else
            ws.send("not your turn, front-end error or cheat");
    }
    else if (serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs === ws) { //p2 message
        if (!serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn) { //p2 turn
            //TODO: CHECK PLAYER 1 CONNECTION, IF NOT CONNECTED, SAVE P2 PLAY, DISABLE P2 TURN, WAIT FOR P1, 
            serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn = null; //safety, prevent players from playing
            serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1] = tempData.cardPlayed;
            serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand[tempData.cardPlayedIndex - 1] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck.shift();
            //console.log("p2 shift index: " + (tempData.cardPlayedIndex - 1));
            //console.log("p2 hand: " + serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand);
            //console.log("p2 deck: " + serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.deck);
            enemyFakeGameState.msgType = 'waitingFeedback';
            enemyFakeGameState.gameSessionID = tempData.gameSessionID;
            enemyFakeGameState.hand = [...serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.hand];
            if (serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0] !== '' && serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1] !== '') { //makeshift for front-end, both players have cards in board
                enemyFakeGameState.board[0] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                enemyFakeGameState.board[1] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[0] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[1] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                serverModule.CardGameSessionArray[tempData.gameSessionID].roundCheck();

            } else {
                serverModule.CardGameSessionArray[tempData.gameSessionID].roundCheck();
                enemyFakeGameState.board[0] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
                enemyFakeGameState.board[1] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[0] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1];
                feedbackFakeGameState.board[1] = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0];
            } 
            enemyFakeGameState.myTurn = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn;
            enemyFakeGameState.scoreP1 = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1;
            enemyFakeGameState.scoreP2 = serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2;
            //////////---FEEDBACK---////////////////////
            feedbackFakeGameState = {
                msgType: 'instantFeedback',
                newHand: serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.hand,
                board: [serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[1], serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.board[0]],
                myTurn: !serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1turn,
                scoreP1: serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP1,
                scoreP2: serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.gameState.scoreP2
            };
            //////////////////////////////////////////
            serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player2.gameWs.send(JSON.stringify(feedbackFakeGameState));
            serverModule.CardGameSessionArray[tempData.gameSessionID].serverSide.player1.gameWs.send(JSON.stringify(enemyFakeGameState));
        } else
            ws.send("not your turn, front-end error or cheat");
    }
    else //ws doesn't belong to session, check possible reconnection trial
        serverModule.CardGameSessionArray.forEach( (Session) => {
            if ((ws._socket.remoteAddress === Session.serverSide.player1.ip)) { //p1 trying to reconnect
                Session.serverSide.player1.gameWs = ws; //redefine websocket
                //TODO: SEND GAME STATE TO P1
            }
            else if ((ws._socket.remoteAddress === Session.serverSide.player2.ip)) { //p2 trying to reconnect
                Session.serverSide.player2.gameWs = ws; //redefine websocket
                //TODO: SEND GAME STATE TO P2
            }
        })
}

module.exports.gameSockServ = gameSockServ;