////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                    DEDEPENDENCIES/MODULES                        |
//+------------------------------------------------------------------+
const WebSocket = require('ws');
const fs = require('fs');



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                     EXPORTED FUNCTIONS                           |
//+------------------------------------------------------------------+
module.exports = {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //+------------------------------------------------------------------+ //BAD ALGORITHM IF THERE'S DOZENS OF PLAYERS DISCONNECTED
    //|  THIS FUNCTION HANDLES DISCONNECTION ON THE GAME SOCKET SERVER,  | //SOME WILL ENDUP WAITING FOR SEVERAL MINUTES
    //|                BOTH REGULAR DISCONNECTIONS OR...                 | 
    //|         FORCED DISCONNECTIONS TRIGGERED BY PING-PONG             |
    //+------------------------------------------------------------------+
    connectCheckerGame: (CardGameSessionArray) => { // WS = DISCONNECTED SOCKET
        console.log("SERVER-LIB: connectCheckerGame(fn) -STARTING");
        CardGameSessionArray.forEach((Session) => { //loops trough all active game sessions
            console.log("SERVER-LIB: connectCheckerGame(fn) is finished --> " + Session.isFinished);
            if (!Session.isFinished) {  //don't check finished games
                // console.log(Session.serverSide.player1.gameWs);
                // console.log("P1 LINE SOCK STATE" + typeof Session.serverSide.player1.lineWs.readyState);
                // console.log("P2 LINE SOCK STATE" + typeof Session.serverSide.player2.lineWs.readyState);
                // console.log("P1 TYPEOF GAME SOCK" + typeof Session.serverSide.player1.gameWs);
                // console.log("P2 TYPEOF GAME SOCK" + typeof Session.serverSide.player2.gameWs);
                // console.log("P1 GAME SOCK STATE" + typeof Session.serverSide.player1.gameWs.readyState);
                // console.log("P2 GAME SOCK STATE" + typeof Session.serverSide.player2.gameWs.readyState);
                if (Session.serverSide.player1.gameWs === null || Session.serverSide.player2.gameWs === null) {
                    console.log("SERVER-LIB: connectCheckerGame(fn) ---> calling --> lineHangChecker(fn)");
                    module.exports.lineHangChecker(CardGameSessionArray);
                    return;
                }
                if (Session.serverSide.player1.gameWs.readyState === WebSocket.OPEN && Session.serverSide.player2.gameWs.readyState === WebSocket.CLOSED) {
                    console.log("SERVER-LIB: connectCheckerGame(fn) -  P1-ON - P2-CLOSED");
                    module.exports.finishWinOneDC(Session, Session.serverSide.player1.gameWs, 'p1');
                } else if (Session.serverSide.player1.gameWs.readyState === WebSocket.CLOSED && Session.serverSide.player2.gameWs.readyState === WebSocket.OPEN) { 
                    console.log("SERVER-LIB: connectCheckerGame(fn) -  P1-CLOSED - P2-ON");
                    module.exports.finishWinOneDC(Session, Session.serverSide.player2.gameWs, 'p2');
                } else if (Session.serverSide.player1.gameWs.readyState === WebSocket.CLOSED && Session.serverSide.player2.gameWs.readyState === WebSocket.CLOSED) {
                    console.log("SERVER-LIB: connectCheckerGame(fn) both players left the game");
                    module.exports.finishWinBothDC(Session);
                }
                else
                    console.log("SERVER-LIB: connectCheckerGame(fn) ---> INAL ELSE MAIN");
            }
        });
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //+------------------------------------------------------------------+
    //|      THIS FUNCTION HANDLES PLAYERS THAT DISCONNECTED BEFORE      |
    //|    GETTING INTO THE MATCH BUT THE SESSION WAS ALREADY CREATED    |
    //+------------------------------------------------------------------+
    lineHangChecker: (CardGameSessionArray) => { // IF GAMEWS ON DC'ED SOCKET EXIT, CALL FUNCTION ABOVE
        console.log("SERVER-LIB: lineHangChecker(fn) -STARTING");
        CardGameSessionArray.forEach((Session) => {
            console.log("SERVER-LIB: lineHangChecker(fn) is finished -->" + Session.isFinished);
            if (!Session.isFinished) { //don't check finished games
                if (Session.serverSide.player1.gameWs !== null) { //p1 exists on game
                    console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 1 - 1");
                    if (Session.serverSide.player1.gameWs.readyState === WebSocket.OPEN) { //p1 is in the game
                        console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 1 - 2");
                        if (Session.serverSide.player2.gameWs === null) { //p2 gamews didn't even load
                            console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 1 - 3");
                            if (Session.serverSide.player2.lineWs === null) { // p2 line didn't even load too
                                console.log("SERVER-LIB: lineHangChecker(fn) - FATAL - game started but P2 did not have a line socket");
                                module.exports.finishNoWin(Session, Session.serverSide.player1.gameWs);
                            } else if (Session.serverSide.player2.lineWs.readyState === WebSocket.CLOSED) { //p2 gamews did not load but line closed, probably DC'ed
                                console.log("SERVER-LIB: lineHangChecker(fn) - P1 ON, P2 HANG ON CLOSED");
                                module.exports.finishNoWin(Session, Session.serverSide.player1.gameWs);
                            }
                        }
                    }
                } else if (Session.serverSide.player2.gameWs !== null) { //p2 exists on game
                    console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 2 - 1");
                    if (Session.serverSide.player2.gameWs.readyState === WebSocket.OPEN) { //p2 is in the game
                        console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 2 - 2");
                        if (Session.serverSide.player1.gameWs === null) { //p1 gamews didn't even load
                            console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 2 - 3");
                            if (Session.serverSide.player1.lineWs === null) { // p1 line didn't even load too
                                console.log("SERVER-LIB: lineHangChecker(fn) - FATAL - game started but P1 did not have a line socket");
                                module.exports.finishNoWin(Session, Session.serverSide.player2.gameWs);
                            } else if (Session.serverSide.player1.lineWs.readyState === WebSocket.CLOSED) { //p1 gamews did not load but line closed, probably DC'ed
                                console.log("SERVER-LIB: lineHangChecker(fn) - P2 ON, P1 HANG ON CLOSED");
                                module.exports.finishNoWin(Session, Session.serverSide.player2.gameWs);
                            }
                        }
                    }
                } else
                    console.log("SERVER-LIB: lineHangChecker(fn) ---> LOGICAL ERROR - FINAL ELSE");
            }
        });
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    finishNoWin: (Session, ws) => {
        console.log("SERVER-LIB: finishNoWin(fn)");
        ws.send("O oponente saiu antes do inicio da partida");
        ws.close(4200, 'player disconnected before match was ready');
        ws.terminate();
        Session.serverSide.gameState.disconnec = true;
        Session.storeOnDatabase('none');
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    finishWinOneDC: (Session, ws, winString) => {
        console.log("SERVER-LIB: finishWinOneDC(fn)");
        ws.send("Voce Ganhou! O oponenete desconectou");
        ws.close(4000, 'the other player disconnected');
        ws.terminate();
        Session.serverSide.gameState.disconnec = true;
        Session.storeOnDatabase(winString);
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    finishWinBothDC: (Session) => {
        console.log("SERVER-LIB: finishWinBothDC(fn)");
        Session.serverSide.gameState.disconnec = true;
        if (Session.serverSide.gameState.scoreP1 > Session.serverSide.gameState.scoreP2)
            Session.storeOnDatabase('p1');
        else if (Session.serverSide.gameState.scoreP1 < Session.serverSide.gameState.scoreP2)
            Session.storeOnDatabase('p2');
        else if (Session.serverSide.gameState.scoreP1 === Session.serverSide.gameState.scoreP2)
            Session.storeOnDatabase('draw');
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}