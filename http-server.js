//+------------------------------------------------------------------+
//|                        DEDEPENDENCIES                            |
//+------------------------------------------------------------------+
const express = require('express');
const url = require('url');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                       ARBITRATY PORTS                            |
//+------------------------------------------------------------------+
const frontPort = 80;
const restPort = null; //currently unused;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|              MIDDLEWARES AND SERVER INITIALIZATION               |
//+------------------------------------------------------------------+
const app = express();
app.use(express.json());
app.use('/', express.static('front-end/'));
app.use('/script2', express.static('front-end/scripts/manipulate-cards.js'))

const HTTPserver = app.listen(frontPort, () => { console.log(`App listening on port: ${frontPort}`); });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                      SOCKET PATH RESOLVER                        |
//+------------------------------------------------------------------+
const wss = require('./socket-server.js');

HTTPserver.on('upgrade', (request, socket, head) => {
   const { pathname } = url.parse(request.url); 
   if (pathname === '/') {
      wss.handleUpgrade(request, socket, head, (ws) => { 
         wss.emit('connection', ws);
      });
   } 
});