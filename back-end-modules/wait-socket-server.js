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
    ws.timeoutCount = 20;
    ws.on('pong', () => { ws.isAlive = true }); //pong received = connection alive
    ws.on('message', (data, isBinary) => waitMessage(data, isBinary, ws));
    lineConnec(ws);
});  //called at socket creation, when players start looking for a match
waitSockServ.on('close', () => { console.log("WAITSOCK: closed waitSockServ"); clearInterval(sockServInterval); }); //clear connection checker 

let nextSessionID = fs.readFile('./database/game-sessions.json', (err, readData) => {
    if (err) { console.log("ERROR: WAITSOCK: updateSessionID(fn), reading file:" + err); throw console.log(err); }
    let dataBase = JSON.parse(readData);
    console.log("WAITSOCK: updateSessionID(fn), dataBase length:" + dataBase.length);
    nextSessionID = dataBase.length;
});

//access database to get available session ID



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|      TIMEOUT & DISCONNECTION LOGIC && MATCH CREATION LOGIC       | //TODO: NEEDS SIMULTANEOUS SESSIONS TEST
//+------------------------------------------------------------------+
const sockServInterval = setInterval(() => {
    console.log("WAITSOCK: waitSockServ.client num -->> " + waitSockServ.clients.size);
    if (waitSockServ.clients.size !== 0) {
        let futureP1 = null;
        waitSockServ.clients.forEach((ws, index) => {
            console.log("ws.playerName-->>" + ws.playerName);
            console.log("wfutureP1-->>" + futureP1);
            if (ws.readyState === WebSocket.OPEN && ws.playerName) {
                if (futureP1) {
                    console.log("WAITSOCK: waitSockServ(fn) --> STORING P2 INFO");
                    ws.timeoutCount = 20;
                    ServerModule.CardGameSessionArray[nextSessionID] = new CardGameSessionClass(nextSessionID);
                    ServerModule.CardGameSessionArray[nextSessionID].serverSide.player2.ip = ws._socket.remoteAddress; //assing ip for safety
                    ServerModule.CardGameSessionArray[nextSessionID].serverSide.player2.lineWs = ws; //assing socket, for future implementations
                    ServerModule.CardGameSessionArray[nextSessionID].serverSide.player2.name = ws.playerName;
                    ws.send("partida encontrada");
                    ws.close(1000, 'redirect to game streaming socket');
                    ws.terminate(); //safety
                    futureP1.timeoutCount = 20;
                    console.log("WAITSOCK: waitSockServ(fn) --> STORING P1 INFO");
                    ServerModule.CardGameSessionArray[nextSessionID].serverSide.player1.ip = futureP1._socket.remoteAddress; //assing ip for safety
                    ServerModule.CardGameSessionArray[nextSessionID].serverSide.player1.lineWs = futureP1; //assing socket, for future implementations
                    ServerModule.CardGameSessionArray[nextSessionID].serverSide.player1.name = futureP1.playerName;
                    nextSessionID++;
                    futureP1.send("partida encontrada");
                    futureP1.close(1000, 'redirect to game streaming socket');
                    futureP1.terminate(); //safety
                    return;
                } else
                    futureP1 = ws;
            } else if (ws.readyState === WebSocket.OPEN && !ws.playerName) {
                ws.send('Escolha um nome ou faça seu login');
                ws.timeoutCount--;
            } else if (ws.timeoutCount === 0) {
                ws.send("Não há outros jogadores ativos no momento");
                ws.close(4100, 'not enough player right now');
                ws.terminate(); //safety
            } else
                console.log("WAITSOCK: waitSockServ(fn) -->> FINAL ELSE !!!!!!");
        });
    }
}, 10777); //15777 for possible desync

function waitMessage(data, isBinary, ws) {
    tempData = {};
    try { tempData = JSON.parse(data); }
    catch (e) { console.log("WAITSOCK: waitMessage(fn) --> received non-parsable DATA --> " + e); return; }
    ws.playerName = tempData;
    console.log(ws.playerName);
}

function waitClose(ws) { //connection was closed regularly
    console.log("WAITSOCK: ws address: " + ws._socket.remoteAddress + " closed");
    ws.isAlive = false;
    ws.terminate(); //safety
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                     RECONNECTION ALGORITHM                       |
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
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                            EXPORTS                               |
//+------------------------------------------------------------------+

module.exports.waitSockServ = waitSockServ;