//+------------------------------------------------------------------+
//|                    DEDEPENDENCIES/MODULES                        |
//+------------------------------------------------------------------+
const WebSocket = require('ws');

const wsStartModule = require('./server-modules/websocket/ws-start.js');
const wsMsgModule = require('./server-modules/websocket/ws-message.js');
const wsCloseModule = require('./server-modules/websocket/ws-close.js');


const wss = new WebSocket.Server({
    noServer: true,  //server-less socket server
    clientTracking: true
});


wss.on('error', (error) => { //if error, caught first hand
    console.log('SOCKET SERVER ERROR: ');
    console.log(error);
});


wss.on('close', () => { //clear timer if socket server closes
    console.log("SOCKET SERVER CLOSED");
    clearInterval(wssTimer);
});

/*
//TODO: use here to check cookies
wss.on('headers', (headers, req) => {
    console.log(headers);
    console.log(req);
});*/


wss.on('connection', (ws, req) => {
    console.log("connection server event triggered");
    ws.on('error', (error) => { console.log('wss: WS error: '); console.log(error); });  //if error, caught first hand  
    ws.on('pong', () => { ws.isAlive = true }); //on pong, we are sure socket is alive
    ws.on('close', () => wsCloseModule.close(ws));
    
    wsStartModule(ws, req); //run this function before setting socket up to exchange messages
    
    ws.on('message', (data, isBinary) => wsMsgModule.msg(data, isBinary, ws));
});

//exporting the server
module.exports = wss;