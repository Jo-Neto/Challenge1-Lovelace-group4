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

//user database alteration files
const usrReg = require('./objects/user/library/register.js');
const userChange = require('./objects/user/library/change-data.js');

app.delete('/delete', (req, res) => userChange(req.body, res, true)); //delete account
app.patch('/patch', (req, res) => userChange(req.body, res, false)); //change account properties

app.post('/register', (req, res) => usrReg(req.body, res)); //register

//+-----------------------------------------------------------------------------------------------+
//+-----------------------------------------------------------------------------------------------+

//login and logout files
const userLogout = require('./server-modules/rest/user-logout.js');
const userLogin = require('./server-modules/rest/user-login.js');

//middlewares
const loginMW = require('./server-modules/middlewares/login.js');
const logoutMW = require('./server-modules/middlewares/logout.js');

app.post('/login', /*loginMW,*/ (req, res) => userLogin(req.body, res, false));
app.post('/logout', /*logoutMW,*/ (req, res) => userLogout(req.session, res));

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