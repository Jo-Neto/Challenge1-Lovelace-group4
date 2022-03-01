const roundChecker = require('../../objects/card-game-session/library/round-checker.js');

const gameSockArr = [];  //store sockets currently on game sessions
const SessionArr = [];  //store ACTIVE game sessions, inactive game sessions go to database

function message(data, isBinary, ws) {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //+------------------------------------------------------------------+
    //|                      READING IF MSG IS VALID                     | 
    //+------------------------------------------------------------------+ 
    
    if (ws.aID === undefined) //deny messages from socket that do not belong to any session
      return;
    
    try { parsedData = JSON.parse(data); }
    catch (e) { console.log("WS-MESSAGE ERROR: message(fn) --> received non-parsable DATA --> " + e); return; }

    if ( typeof parsedData !== 'number' ) //deny messages that are not number
        return;
    
    if ( typeof parsedData < 1 || typeof parsedData > 3) //deny invalid card indexes
        return;

    console.log("typeof parsed data = " + typeof parsedData);
    console.log("parsed data = " + parsedData);

/*
    console.log("typeof data = "+ typeof parsedData );
    console.log("data = "+ parsedData );
    console.log("ws.aID = "+ ws.aID );

    console.log("=============================================================================" );
    console.log(SessionArr[ws.aID].gameState);
    console.log("=============================================================================" );


    try {
        if (!(parsedData >= 1 && parsedData <= 3)) {
            console.log("WS-MESSAGE: message(fn) --> valid card index");
            ws.close(1008, 'tried playing an invalid card index');
            ws.terminate();
            return;
        }
    }
    catch (e) { console.log("WS-MESSAGE: message(fn) --> invalid card index --> " + e); return; }


    try {
        if (typeof parsedData !== 'number') {
            console.log("WS-MESSAGE: message(fn) -->  non number type");
            ws.close(1008, 'tried sending a non number type');
            ws.terminate();
            return;
        }
    }
    catch (e) { console.log("WS-MESSAGE: message(fn) --> non number type --> " + e); return; }
*/
    
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //+------------------------------------------------------------------+
    //|                            PLAYER 1                              | 
    //+------------------------------------------------------------------+ 
    if (SessionArr[ws.aID].player1.ws === ws) { //player 1 msg  
        
        if ( !SessionArr[ws.aID].gameState.player1turn ) //not p1 turn
            return;
        
        else {
            console.log("p1 played = "+ SessionArr[ws.aID].player1.hand[ parsedData - 1] );
            SessionArr[ws.aID].gameState.board[0] = SessionArr[ws.aID].player1.hand[ parsedData - 1];
            SessionArr[ws.aID].player1.hand[ parsedData - 1] = SessionArr[ws.aID].player1.deck.shift();
            roundChecker(SessionArr[ws.aID]);
        }

        SessionArr[ws.aID].player1.ws.send(SessionArr[ws.aID].player1.hand);

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //+------------------------------------------------------------------+
    //|                        PLAYER 2, SAME LOGIC                      | 
    //+------------------------------------------------------------------+ 
    
    else if (SessionArr[ws.aID].player2.ws === ws) { //player 2 msg
        
        if ( SessionArr[ws.aID].gameState.player1turn )  //not p2 turn
            return;
        
        else {
            console.log("p2 played = "+ SessionArr[ws.aID].player2.hand[ parsedData - 1] );
            SessionArr[ws.aID].gameState.board[1] = SessionArr[ws.aID].player2.hand[ parsedData - 1];
            SessionArr[ws.aID].player2.hand[ parsedData - 1] = SessionArr[ws.aID].player2.deck.shift();
            roundChecker(SessionArr[ws.aID]);
        }

        SessionArr[ws.aID].player2.ws.send(SessionArr[ws.aID].player2.hand);
    
    }
    else
        console.log("WS-MESSAGE: FATAL ERROR --> message(fn) --> WRONGLY ASSIGNED SOCKET ACCESS ID --> ");

}

module.exports = {
    gameArr: gameSockArr,
    sessArr: SessionArr,
    msg: message
}