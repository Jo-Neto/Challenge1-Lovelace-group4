//+------------------------------------------------------------------+
//|                        DEDEPENDENCIES                            |
//+------------------------------------------------------------------+
const express = require('express');
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
//|                      SOCKET PATH RESOLVER                        |
//+------------------------------------------------------------------+
const waitSockModule = require('./back-end-modules/wait-socket-server');
const gameSockServModule = require('./back-end-modules/game-socket-server');

HTTPserver.on('upgrade', function upgrade(request, socket, head) {
   const { pathname } = url.parse(request.url);
   if (pathname === '/line') {
      waitSockModule.waitSockServ.handleUpgrade(request, socket, head, (ws) => { waitSockModule.waitSockServ.emit('connection', ws) });
   } else if (pathname === '/gamestream') {
      gameSockServModule.gameSockServ.handleUpgrade(request, socket, head, (ws) => { gameSockServModule.gameSockServ.emit('connection', ws) });
   } else if (pathname === '/chat') {
      socket.destroy();
   } 
});

let CardGameSessionArray = [];  //Arr to store card game sessions
exports.CardGameSessionArray = CardGameSessionArray;