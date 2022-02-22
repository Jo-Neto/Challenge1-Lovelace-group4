//+------------------------------------------------------------------+
//|                    DEDEPENDENCIES/MODULES                        |
//+------------------------------------------------------------------+
const WebSocket = require('ws');
const fs = require('fs');

const ServerModule = require('../server.js');
const CardGameSessionClass = require('../back-end-objects/card-game-session');



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                  SOCKET SERVERS INITIALIZERS                     |
//+------------------------------------------------------------------+
fs.readFile('./database/game-sessions.json', getnextSessionID); //access database to get available session ID
function getnextSessionID(err, readData) {
    let dataBase = JSON.parse(readData);
    nextSessionID = dataBase.length;
}

const waitSockServ = new WebSocket.Server({ noServer: true, clientTracking: true }); //create serverless socket for multisocket server
waitSockServ.on('error', (error) => { console.log('waitSockServ error: '); console.log(error); }); //SocketServer error print
waitSockServ.on('connection', (ws, req) => { //called at socket creation, when players start looking for a match
    ws.on('error', (error) => { console.log('waitSock error: '); console.log(error); }); //WebSocket error print
    ws.on('close', () => waitClose(ws));
    ws.isAlive = true;  //create property is alive for this socket
    ws.on('pong', () => { ws.isAlive = true }); //pong received = connection alive
    lineConnec(ws);
});  //called at socket creation, when players start looking for a match
waitSockServ.on('close', () => { console.log("closed waitSockServ"); clearInterval(sockServInterval); }); //clear connection checker 



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                 TIMEOUT & DISCONNECTION LOGIC                    | //TODO: NEEDS SIMULTANEOUS SESSIONS TEST
//+------------------------------------------------------------------+
let count = 12;
const sockServInterval = setInterval(() => {
    console.log("waitSockServ interval timeout  -->> " + count);
    console.log("waitSockServ.clients -->> " + waitSockServ.clients.size);
    if (waitSockServ.clients.size === 1) {
        if (count === 0) {
            waitSockServ.clients.forEach((ws) => {
                ws.send("Não há outros jogadores no momento, tente novamente mais tarde");
                ws.close(4100, 'not enough players');
                ws.terminate();
            });
            count = 12;
        } else
            count--;
    }
}, 10777); //15777 for possible desync


function waitClose(ws) { //connection was closed regularly
    console.log("waitClose");
    ws.terminate(); //safety
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+ TODO: reconnecting logic
//|     GAME CREATION & PLAYER FINDER & RECONNECTION ALGORITHM       |
//+------------------------------------------------------------------+
function lineConnec(ws) {  //called when new socket connecting to waitSockServ
    console.log("lineConnec");
    //ws.isAlive = true;
    //ws.on('pong', (ws) => ws.isAlive = true );
    ServerModule.CardGameSessionArray.forEach((Session) => { //loops trough all active game sessions
        console.log("ServerModule.CardGameSessionArray");
        if (ws._socket.remoteAddress === Session.serverSide.player1.ip && !Session.isFinished) {  //player 1 reconnecting;
            Session.serverSide.player1.ip = ws._socket.remoteAddress;
            Session.serverSide.player1.lineWs = ws;
            ws.send("reconectando");
            ws.close(4000, 'redirect to game streaming socket');
            ws.terminate();  //safety
            return true;
        } else if (ws._socket.remoteAddress === Session.serverSide.player2.ip && !Session.isFinished) { //player 2 reconnecting;
            Session.serverSide.player2.ip = ws._socket.remoteAddress;
            Session.serverSide.player2.lineWs = ws;
            ws.send("reconectando");
            ws.close(4000, 'redirect to game streaming socket');
            ws.terminate(); //safety
            return true;
        }
    });
    lineConnecNew(); //if no active session, go to waiting line
}

function lineConnecNew() {  //called if player is not reconnecting to a match
    console.log("lineConnecNew");
    if (waitSockServ.clients.size === 2) { //if there are 2 or more waiting players and...
        let count = 0;
        let p1done = false;
        waitSockServ.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN)
                count++;
            if (count === 2) {
                waitSockServ.clients.forEach(client => { //loops trough all open sockets on this socket server and...
                    if (!p1done) { //get a first player
                        ServerModule.CardGameSessionArray[nextSessionID] = new CardGameSessionClass(nextSessionID); //create a game session
                        ServerModule.CardGameSessionArray[nextSessionID].serverSide.player1.ip = client._socket.remoteAddress; //assing ip for safety
                        ServerModule.CardGameSessionArray[nextSessionID].serverSide.player1.lineWs = client; //assing socket, for future implementations
                        p1done = true;
                    } else { //get a second player
                        ServerModule.CardGameSessionArray[nextSessionID].serverSide.player2.ip = client._socket.remoteAddress; //assing ip for safety
                        ServerModule.CardGameSessionArray[nextSessionID].serverSide.player2.lineWs = client; //assing socket, for future implementations
                        nextSessionID++; //next session
                        p1done = false;
                    }
                    client.send("partida encontrada");
                    client.close(1000, 'redirect to game streaming socket');
                    client.terminate(); //safety
                });
                count = 0;
            }
        });
    }
}

module.exports.waitSockServ = waitSockServ;