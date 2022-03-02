const CardGameSession = require('../../objects/card-game-session/constructor.js');
const Active = require('./ws-message.js');  //imports active game sessions array && game sockets array (array stores sockets currently playing)

const waitSockArr = [];  //store sockets waiting for other players

function wsStart(ws) {
    ws.isAlive = true; //assures the connection is alive, set to true on pong, set to false on timer
    ws.timeout = 10;  //gives a timer to close AFK players
    isClientReconnecting(ws);
}

function isClientReconnecting(ws) {
    if (ws.aID) //if client belongs to an active session, finish logic here
        return;
    waitSockArr.push(ws); //goes to end of waiting line and...
    waitLineChecker();  //is passed to the function below
}

function waitLineChecker() {
    if (waitSockArr.length >= 2) { //2 or more players, create a match

        Active.gameArr.push(waitSockArr.shift(), waitSockArr.shift()); //puts first 2 players on the line into the end of the game socket array
        
        let sessionIndex;
        
        let replaceableIndex = Active.sessArr.findIndex(session => { //see if there's an available place in the active games array
            return session === null;
        });


        if (replaceableIndex !== -1) { //if yes, replace the finished match in the array
            Active.sessArr[replaceableIndex] = new CardGameSession(Active.gameArr[Active.gameArr.length - 2], Active.gameArr[Active.gameArr.length - 1]);
            sessionIndex = replaceableIndex;
        } else {  //if not, push the array with a new session
            Active.sessArr.push(new CardGameSession(Active.gameArr[Active.gameArr.length - 2], Active.gameArr[Active.gameArr.length - 1]));
            sessionIndex = Active.sessArr.length - 1;
        }

        console.log("sessionIndex = "+sessionIndex);
        
        Active.sessArr[sessionIndex].player1.ws.aID = sessionIndex; //assign the sockets the access index for faster performance
        Active.sessArr[sessionIndex].player2.ws.aID = sessionIndex;
        
        Active.sessArr[sessionIndex].player1.ws.send("p1"); //tell front-end game is ready, which players it is, player hand, and gameState
        Active.sessArr[sessionIndex].player1.ws.send(Active.sessArr[sessionIndex].player1.hand);
        Active.sessArr[sessionIndex].player1.ws.send(Active.sessArr[sessionIndex].gameState); 
        
        Active.sessArr[sessionIndex].player2.ws.send("p2");
        Active.sessArr[sessionIndex].player2.ws.send(Active.sessArr[sessionIndex].player2.hand);
        Active.sessArr[sessionIndex].player2.ws.send(Active.sessArr[sessionIndex].gameState)

        console.log(Active.sessArr[sessionIndex]);
        
        waitLineChecker(); //try again in case there's more players

    } else
        return; //keep waiting
}

module.exports = wsStart;