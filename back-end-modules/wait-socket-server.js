//+------------------------------------------------------------------+
//|                    DEDEPENDENCIES/MODULES                        |
//+------------------------------------------------------------------+
const fs = require('fs');
const WebSocket = require('ws');
const serverModule = require('../server.js');
const CardGameSessionClass = require('../back-end-objects/card-game-session');



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                  SOCKET SERVERS INITIALIZERS                     |
//+------------------------------------------------------------------+
fs.readFile('./database/game-sessions.json', getnextSessionID); //access database to get next available session ID
function getnextSessionID(err, readData) {
    let dataBase = JSON.parse(readData);
    nextSessionID = dataBase.length;
}

const waitSockServ = new WebSocket.Server({ noServer: true, clientTracking: true }); //create serverless socket for multisocket server
waitSockServ.on('error', (error) => { console.log('waitSockServ error: '); console.log(error); }); //socket error print
waitSockServ.on('connection', lineConnec);  //called at socket creation, when players start looking for a match
//waitSockServ.on('close', () => { clearInterval( waitSockServInterval ); });



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+TODO: timer for timeout && connection checker
//|     GAMESESSION OBJECT CREATION && PLAYER FINDER ALGHORITHM      |TODO: reconnecting logic
//+------------------------------------------------------------------+

function lineConnec(ws) {  //called when new socket connecting to waitSockServ
    console.log("lineConnec");
    ws.on('error', (error) => { console.log('waitSock error: '); console.log(error); }); //socket error print
    //ws.isAlive = true;
    //ws.on('pong', (ws) => ws.isAlive = true );
    serverModule.CardGameSessionArray.forEach((Session) => { //loops trough all active game sessions
        console.log("serverModule.CardGameSessionArray");
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
    if (waitSockServ.clients.size >= 2) { //if there are 2 or more waiting players and...
        let count = 0; //reset player counter
        waitSockServ.clients.forEach(client => { //loops trough all open sockets on this socket server and...
            if (client.readyState === WebSocket.OPEN) {  //socket is open, client is active then...
                if (count <= 1) {
                    if (count === 0) { //get the first player
                        serverModule.CardGameSessionArray[nextSessionID] = new CardGameSessionClass(nextSessionID); //create a game session
                        serverModule.CardGameSessionArray[nextSessionID].serverSide.player1.ip = client._socket.remoteAddress; //assing ip for safety
                        serverModule.CardGameSessionArray[nextSessionID].serverSide.player1.lineWs = client; //assing socket, for future implementations
                    } else { //get a second player
                        serverModule.CardGameSessionArray[nextSessionID].serverSide.player2.ip = client._socket.remoteAddress; //assing ip for safety
                        serverModule.CardGameSessionArray[nextSessionID].serverSide.player2.lineWs = client; //assing socket, for future implementations
                        nextSessionID++; //
                    }
                    count++; //next player
                    client.send("partida encontrada");
                    client.close(1000, 'redirect to game streaming socket');
                    client.terminate(); //safety
                } else
                    lineConnecNew(ws); //if there's already 2 players, keep waiting
            }
        });
    } else
        ws.send("searching for players");
}

module.exports.waitSockServ = waitSockServ;