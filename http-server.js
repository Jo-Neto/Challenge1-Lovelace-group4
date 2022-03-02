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
//|          MIDDLEWARES, ROUTES AND SERVER INITIALIZATION           |
//+------------------------------------------------------------------+
const usrDel = require('./objects/user/library/login.js');
const usrLogin = require('./objects/user/library/login.js');
const usrLogout = require('./objects/user/library/login.js');
const usrReg = require('./objects/user/library/register.js');

const app = express();

app.use(express.json());

app.use('/', express.static('front-end/'));
app.use('/board1', express.static('front-end/scripts/board-script.js'));
app.use('/board2', express.static('front-end/scripts/manipulate-cards.js'));
app.use('/leader', express.static('front-end/scripts/leader-script.js'));

app.delete('/delete', (req, res) => usrDel(req, res));
app.post('/login', (req, res) => usrLogin(req, res));
app.post('/logout', (req, res) => usrLogout(req, res));
app.post('/register', (req, res) => usrReg(req, res));


const HTTPserver = app.listen(frontPort, () => { console.log(`App listening on port: ${frontPort}`); });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                          SOCKET PATH                             |
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