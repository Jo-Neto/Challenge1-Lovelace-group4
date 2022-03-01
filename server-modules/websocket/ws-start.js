const CardGameSession = require('../../objects/card-game-session/constructor.js');
const Active = require('./ws-message.js');  //imports active game sessions array && game sockets array (array stores sockets currently playing)

const waitSockArr = [];  //store sockets waiting for other players

function wsStart(ws) {
    ws.isAlive = true; //assures the connection is alive, set to true on pong, set to false on timer
    ws.timeout = 10;  //gives a timer to close AFK players
    isClientReconnecting(ws);
}

function isClientReconnecting(ws) {
    if (ws.sID) //if client belongs to an active session, finish logic here
        return;
    waitSockArr.push(ws); //goes to end of waiting line and...
    waitLineChecker();  //is passed to the function below
}

function waitLineChecker() {
    if (waitSockArr.length >= 2) { //2 or more players, create a match

        Active.gameArr.push(waitSockArr.shift(), waitSockArr.shift()); //puts first 2 players on the line into the end of the game socket array
        
        let replaceableIndex = Active.sessArr.findIndex(session => { //see if there's an available place in the active games array
            return session === null;
        });

        if (replaceableIndex !== -1) { //if yes, replace the finished match in the array
            Active.sessArr[replaceableIndex] = new CardGameSession(Active.gameArr[Active.gameArr.length - 2], Active.gameArr[Active.gameArr.length - 1]);
        } else {  //if not, push the array with a new session
            Active.sessArr.push(new CardGameSession(Active.gameArr[Active.gameArr.length - 2], Active.gameArr[Active.gameArr.length - 1]));
        }

        Active.sessArr[Active.sessArr.length - 1].player1.ws.aID = Active.sessArr.length - 1; //assign the sockets the access index for faster performance
        Active.sessArr[Active.sessArr.length - 1].player2.ws.aID = Active.sessArr.length - 1;
        
        Active.sessArr[Active.sessArr.length - 1].player1.ws.send("p1"); //tell front-end game is ready
        Active.sessArr[Active.sessArr.length - 1].player2.ws.send("p2");
        
        waitLineChecker(); //try again in case there's more players

    } else
        return; //keep waiting
}

module.exports = wsStart;