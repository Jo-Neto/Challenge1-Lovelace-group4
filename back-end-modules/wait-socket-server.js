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
const waitSockServ = new WebSocket.Server({ noServer: true, clientTracking: true }); //create serverless socket for multisocket server
waitSockServ.on('error', (error) => { console.log('WAITSOCK: waitSockServ error: '); console.log(error); }); //SocketServer error print
waitSockServ.on('connection', (ws, req) => { //called at socket creation, when players start looking for a match
    ws.on('error', (error) => { console.log('WAITSOCK: waitWebSock error: '); console.log(error); }); //WebSocket error print
    ws.on('close', () => waitClose(ws));
    ws.isAlive = true;  //create property is alive for this socket
    ws.on('pong', () => { ws.isAlive = true }); //pong received = connection alive
    ws.on('message', (data, isBinary) => waitMessage(data, isBinary, ws));
    lineConnec(ws);
});  //called at socket creation, when players start looking for a match
waitSockServ.on('close', () => { console.log("WAITSOCK: closed waitSockServ"); clearInterval(sockServInterval); }); //clear connection checker 

let nextSessionID;
function updateSessionID() { //access database to get available session ID
    console.log( "updateSessionID(fn) running" );
    fs.readFile('./database/game-sessions.json', (err, readData) => {
        if (err) { console.log("ERROR: WAITSOCK: updateSessionID(fn), reading file:" + err); throw console.log(err); }
        let dataBase = JSON.parse(readData);
        console.log("updateSessionID(fn) --> DBlength = "+ dataBase.length );
        nextSessionID = dataBase.length;
        console.log("updateSessionID(fn) --> nextSessionID = "+nextSessionID );
    });
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                 TIMEOUT & DISCONNECTION LOGIC                    | //TODO: NEEDS SIMULTANEOUS SESSIONS TEST
//+------------------------------------------------------------------+
let count = 12;
const sockServInterval = setInterval(() => {
    console.log("WAITSOCK: waitSockServ interval timeout  -->> " + count);
    console.log("WAITSOCK: waitSockServ.client num -->> " + waitSockServ.clients.size);
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
    console.log("WAITSOCK: ws address: " + ws._socket.remoteAddress + " closed");
    ws.isAlive = false;
    ws.terminate(); //safety
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|     GAME CREATION & PLAYER FINDER & RECONNECTION ALGORITHM       |
//+------------------------------------------------------------------+
function lineConnec(ws) {  //called when new socket connecting to waitSockServ
    console.log("WAITSOCK: lineConnec(fn)");
    //ws.isAlive = true;
    //ws.on('pong', (ws) => ws.isAlive = true );
    ServerModule.CardGameSessionArray.forEach((Session) => { //loops trough all active game sessions
        if (!Session.isFinished) {
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
        }
    });
    lineConnecNew(); //if no active session, go to waiting line
}

function lineConnecNew() {  //called if player is not reconnecting to a match
    console.log("WAITSOCK: lineConnecNew(fn)");
    if (waitSockServ.clients.size === 2) { //if there are 2 or more waiting players and...
        let count = 0;
        let p1done = false;
        waitSockServ.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN)
                count++;
            if (count === 2) {
                waitSockServ.clients.forEach(client => { //loops trough all open sockets on this socket server and...
                    if (!p1done) { //get a first player
                        updateSessionID();
                        console.log("WAITSOCK: lineConnecNew(fn) --> nextSessionID: " +nextSessionID);
                        ServerModule.CardGameSessionArray[nextSessionID] = new CardGameSessionClass(nextSessionID); //create a game session
                        ServerModule.CardGameSessionArray[nextSessionID].serverSide.player1.ip = client._socket.remoteAddress; //assing ip for safety
                        ServerModule.CardGameSessionArray[nextSessionID].serverSide.player1.lineWs = client; //assing socket, for future implementations
                        ServerModule.CardGameSessionArray[nextSessionID].serverSide.player1.name = client.playerName;
                        p1done = true;
                    } else { //get a second player
                        ServerModule.CardGameSessionArray[nextSessionID].serverSide.player2.ip = client._socket.remoteAddress; //assing ip for safety
                        ServerModule.CardGameSessionArray[nextSessionID].serverSide.player2.lineWs = client; //assing socket, for future implementations
                        ServerModule.CardGameSessionArray[nextSessionID].serverSide.player2.name = client.playerName;
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

function waitMessage(data, isBinary, ws) {
    console.log("WAITSOCK: waitMessage(fn) --> received binary data");
    tempData = {};
    try { tempData = JSON.parse(data); console.log("tried --> " + tempData); }
    catch (e) { console.log("WAITSOCK: waitMessage(fn) --> received non-parsable DATA --> " + e); return; }
    ws.playerName = tempData;
    console.log(ws.playerName);
}

module.exports.waitSockServ = waitSockServ;