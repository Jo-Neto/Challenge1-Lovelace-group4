//+------------------------------------------------------------------+
//|                        DEDEPENDENCIES                            |
//+------------------------------------------------------------------+
const express = require('express');
const url = require('url');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|       ARBITRATY PORTS, MIDDLEWARES, SERVER INITIALIZATION        |
//+------------------------------------------------------------------+
const frontPort = 80;
const restPort = null; //currently unused;

const app = express();
app.use(express.json());

const HTTPserver = app.listen(frontPort, () => { console.log(`App listening on port: ${frontPort}`); });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                             ROUTES                               |
//+------------------------------------------------------------------+

//user registration and deletion files
const usrDel = require('./objects/user/library/delete.js');
const usrReg = require('./objects/user/library/register.js');

app.delete('/delete', (req, res) => usrDel(req, res));
app.post('/register', (req, res) => usrReg(req.body, res));

//+-----------------------------------------------------------------------------------------------+
//+-----------------------------------------------------------------------------------------------+

//login and logout files
const usrLogin = require('./server-modules/rest/user-login.js');
const usrLogout = require('./server-modules/rest/user-logout.js');

app.post('/login', (req, res) => usrLogin(req.body, res));
app.post('/logout', (req, res) => usrLogout(req, res));

//+-----------------------------------------------------------------------------------------------+
//+-----------------------------------------------------------------------------------------------+

//first served file and its assets
app.use('/', express.static('front-end/'));

//dynamically served scripts on SPA display change, assets are already loaded dynamically
app.use('/board1', express.static('front-end/scripts/board-script.js'));
app.use('/board2', express.static('front-end/scripts/manipulate-cards.js'));
app.use('/leader', express.static('front-end/scripts/leader-script.js'));



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                          SOCKET PATH                             |
//+------------------------------------------------------------------+
const wss = require('./socket-server.js');

HTTPserver.on('upgrade', (request, socket, head) => {
   const { pathname } = url.parse(request.url);
   if (pathname === '/') {
      //TODO: check cookies, tie user to socket if registered
      wss.handleUpgrade(request, socket, head, (ws) => {
         wss.emit('connection', ws, request);
      });
   }
});