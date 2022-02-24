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
    //+------------------------------------------------------------------+ 
    //|  THIS FUNCTION HANDLES DISCONNECTION ON THE GAME SOCKET SERVER,  | 
    //|                BOTH REGULAR DISCONNECTIONS OR...                 | 
    //|         FORCED DISCONNECTIONS TRIGGERED BY PING-PONG             |
    //+------------------------------------------------------------------+
    connectCheckerGame: (SessArr) => {
        console.log("SERVER-LIB: connectCheckerGame(fn) -STARTING");
        SessArr.forEach((Session) => { //loops trough all active game sessions
            //console.log("SERVER-LIB: connectCheckerGame(fn) is finished --> " + Session.isFinished + ", for Session Num: " + Session.serverSide.gameState.sID);
            if (!Session.isFinished) {  //don't check finished games
                if (Session.serverSide.player1.gameWs === null || Session.serverSide.player2.gameWs === null) {
                    console.log("SERVER-LIB: connectCheckerGame(fn) ---> calling --> lineHangChecker(fn), Session Num: " + Session.serverSide.gameState.sID);
                    module.exports.lineHangChecker(SessArr);
                    return;
                }
                if (Session.serverSide.player1.gameWs.readyState === WebSocket.OPEN && Session.serverSide.player2.gameWs.readyState === WebSocket.CLOSED) {
                    console.log("SERVER-LIB: connectCheckerGame(fn) -  P1-ON - P2-CLOSED, Session Num: " + Session.serverSide.gameState.sID);
                    module.exports.finishWinOneDC(Session, Session.serverSide.player1.gameWs, 'p1');
                } else if (Session.serverSide.player1.gameWs.readyState === WebSocket.CLOSED && Session.serverSide.player2.gameWs.readyState === WebSocket.OPEN) {
                    console.log("SERVER-LIB: connectCheckerGame(fn) -  P1-CLOSED - P2-ON, Session Num: " + Session.serverSide.gameState.sID);
                    module.exports.finishWinOneDC(Session, Session.serverSide.player2.gameWs, 'p2');
                } else if (Session.serverSide.player1.gameWs.readyState === WebSocket.CLOSED && Session.serverSide.player2.gameWs.readyState === WebSocket.CLOSED) {
                    console.log("SERVER-LIB: connectCheckerGame(fn) both players left the game, Session Num: " + Session.serverSide.gameState.sID);
                    module.exports.finishWinBothDC(Session);
                }
                //else
                    //console.log("SERVER-LIB: connectCheckerGame(fn) ---> FINAL ELSE MAIN, Session Num: " + Session.serverSide.gameState.sID);
            }
        });
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //+------------------------------------------------------------------+
    //|      THIS FUNCTION HANDLES PLAYERS THAT DISCONNECTED BEFORE      |
    //|    GETTING INTO THE MATCH BUT THE SESSION WAS ALREADY CREATED    |
    //+------------------------------------------------------------------+
    lineHangChecker: (SessArr) => {
        console.log("SERVER-LIB: lineHangChecker(fn) -STARTING");
        SessArr.forEach((Session) => {
            if (!Session.isFinished) { //don't check finished games
                //console.log("SERVER-LIB: lineHangChecker(fn) is finished --> " + Session.isFinished + ", for Session Num: " + Session.serverSide.gameState.sID);
                if (Session.serverSide.player1.gameWs !== null) { //p1 exists on game
                    console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 1 - 1, Session Num: " + Session.serverSide.gameState.sID);
                    if (Session.serverSide.player1.gameWs.readyState === WebSocket.OPEN) { //p1 is in the game
                        console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 1 - 2, Session Num: " + Session.serverSide.gameState.sID);
                        if (Session.serverSide.player2.gameWs === null) { //p2 gamews didn't even load
                            console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 1 - 3, Session Num: " + Session.serverSide.gameState.sID);
                            if (Session.serverSide.player2.lineWs === null) { // p2 line didn't even load too
                                console.log("SERVER-LIB: lineHangChecker(fn) - FATAL - game started but P2 did not have a line socket, Session Num: " + Session.serverSide.gameState.sID);
                                module.exports.finishNoWin(Session, Session.serverSide.player1.gameWs);
                            } else if (Session.serverSide.player2.lineWs.readyState === WebSocket.CLOSED && Session.serverSide.player2.gameWs === null) { //p2 gamews did not load but line closed, probably DC'ed
                                console.log("SERVER-LIB: lineHangChecker(fn) - P1 ON, P2 HANG ON CLOSED, Session Num: " + Session.serverSide.gameState.sID);
                                module.exports.finishNoWin(Session, Session.serverSide.player1.gameWs);
                            }
                        }
                    }
                } else if (Session.serverSide.player2.gameWs !== null) { //p2 exists on game
                    console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 2 - 1, Session Num: " + Session.serverSide.gameState.sID);
                    if (Session.serverSide.player2.gameWs.readyState === WebSocket.OPEN) { //p2 is in the game
                        console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 2 - 2, Session Num: " + Session.serverSide.gameState.sID);
                        if (Session.serverSide.player1.gameWs === null) { //p1 gamews didn't even load
                            console.log("SERVER-LIB: lineHangChecker(fn) --> CHECK 2 - 3, Session Num: " + Session.serverSide.gameState.sID);
                            if (Session.serverSide.player1.lineWs === null) { // p1 line didn't even load too
                                console.log("SERVER-LIB: lineHangChecker(fn) - FATAL - game started but P1 did not have a line socket, Session Num: " + Session.serverSide.gameState.sID);
                                module.exports.finishNoWin(Session, Session.serverSide.player2.gameWs);
                            } else if (Session.serverSide.player1.lineWs.readyState === WebSocket.CLOSED && Session.serverSide.player1.gameWs === null) { //p1 gamews did not load but line closed, probably DC'ed
                                console.log("SERVER-LIB: lineHangChecker(fn) - P2 ON, P1 HANG ON CLOSED, Session Num: " + Session.serverSide.gameState.sID);
                                module.exports.finishNoWin(Session, Session.serverSide.player2.gameWs);
                            }
                        }
                    }
                } //else
                    //console.log("SERVER-LIB: lineHangChecker(fn) ---> - FINAL ELSE, Session Num: " + Session.serverSide.gameState.sID);
            }
        });
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    finishNoWin: (Session, ws) => {
        console.log("SERVER-LIB: finishNoWin(fn), Session Num: " + Session.serverSide.gameState.sID);
        if (ws === Session.serverSide.player1.gameWs && Session.serverSide.player2.waitingReconec < 3) { //p1 is the future winner, when it gets to 2
            Session.serverSide.player2.waitingReconec++;
            return;
        } else if (ws === Session.serverSide.player2.gameWs && Session.serverSide.player1.waitingReconec < 3) { //p2 is the future winner, when it gets to 2
            Session.serverSide.player1.waitingReconec++;
            return;
        }
        ws.send("O oponente saiu antes do inicio da partida");
        ws.close(4200, 'player disconnected before match was ready');
        ws.terminate();
        Session.serverSide.gameState.disconnec = true;
        Session.storeOnDatabase('none');
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    finishWinOneDC: (Session, ws, winString) => {
        console.log("SERVER-LIB: finishWinOneDC(fn), Session Num: " + Session.serverSide.gameState.sID);
        if (winString === 'p2' && Session.serverSide.player1.waitingReconec < 3) { //p2 is the future winner, when it gets to 2
            Session.serverSide.player1.waitingReconec++;
            return;
        } else if (winString === 'p1' && Session.serverSide.player2.waitingReconec < 3) { //p1 is the future winner, when it gets to 2
            Session.serverSide.player2.waitingReconec++;
            return;
        }
        ws.send("Voce Ganhou! O oponenete desconectou");
        ws.close(4000, 'the other player disconnected');
        ws.terminate();
        Session.serverSide.gameState.disconnec = true;
        Session.storeOnDatabase(winString);
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    finishWinBothDC: (Session) => {
        console.log("SERVER-LIB: finishWinBothDC(fn), Session Num: " + Session.serverSide.gameState.sID);
        if ( Session.serverSide.player1.waitingReconec < 4 && Session.serverSide.player2.waitingReconec < 4 ) { //p1 and p2 DC counter should be 2
            Session.serverSide.player1.waitingReconec++;
            Session.serverSide.player2.waitingReconec++;
            return;
        }
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