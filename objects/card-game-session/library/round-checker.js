//+------------------------------------------------------------------------------+
//|    TAKES CARES OF GAME RULES & CALL DATABASE-STORE WHEN GAME IS FINISHED     |
//+------------------------------------------------------------------------------+
const dbStore = require('./db-writer.js');

module.exports = function (Session) {


    if (Session.isLocked) //check if it's locked, maybe unnecessary
        return;

    Session.isLocked = true; //safety lock. function unlocked at the end



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //+-------------------------------------------------------------------+
    //|                      TURN DID NOT END YET                         |
    //+-------------------------------------------------------------------+
    if ((Session.gameState.board[0] === '' || Session.gameState.board[1] === '') //either player haven't played but...
        &&
        (Session.gameState.board[0] !== Session.gameState.board[1])) {   //both of'em haven't played
        if (Session.gameState.board[0] === '') { //only p2 played
            Session.gameState.player1turn = true;
        } else if (Session.gameState.board[1] === '') { //only p1 played
            Session.gameState.player1turn = false;
        } else
            console.log("CardGameSession object --> roundcheck(fn), logical error, on passing turn(first check), Session Num: " + Session.gameState.sID);
        Session.player1.ws.send(JSON.stringify(Session.gameState)); //update board for both players
        Session.player2.ws.send(JSON.stringify(Session.gameState));
        return;
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //+------------------------------------------------------------------+
    //|                      DRAW IS CHECKED FIRST                       |
    //+------------------------------------------------------------------+
    if (Session.gameState.board[0] === Session.gameState.board[1]) {
        if (Session.gameState.board[0] !== 'm') //if its not dark matter draw
            Session.gameState.player1turn = !Session.gameState.player1turn; //keep order            
    }



    switch (Session.gameState.board[0]) {
       

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //+------------------------------------------------------------------+
        //|                    DRAW ON BLACK MATTER CARD                     |
        //+------------------------------------------------------------------+
        case 'm':

            if (Session.gameState.board[1] === 'e' || Session.gameState.board[1] === 'v')  //and enemy draws v or e
                Session.gameState.player1turn = true; //player is first to play         
            else  //otherwise is last to play
                Session.gameState.player1turn = false; //enemy plays first
            break;



        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //+------------------------------------------------------------------+
        //|                ETER CASE --- DRAW IS CHECKED FIRST               |
        //+------------------------------------------------------------------+
        case 'e':
            switch (Session.gameState.board[1]) {
                case 'm': //draw on dark matter
                    Session.gameState.player1turn = false; //enemy players first
                    break;
                case 'e': //draw on eter
                    Session.gameState.player1turn = !Session.gameState.player1turn; //keep order
                    break;
                case 'v': //enemy wins
                    Session.gameState.player1turn = false;
                    Session.gameState.scoreP2++;
                    break;
                default: //player wins
                    Session.gameState.player1turn = true;
                    Session.gameState.scoreP1++;
                    break;
            }
            break;



        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //+------------------------------------------------------------------+
        //|                 VOID CASE --- DRAW IS CHECKED FIRST              |
        //+------------------------------------------------------------------+
        case 'v':
            switch (Session.gameState.board[1]) {
                case 'm': //draw on dark matter
                    Session.gameState.player1turn = false; //enemy players first
                    break;
                case 'v': //draw on void
                    Session.gameState.player1turn = !Session.gameState.player1turn; //keep order
                    break;
                case 'e': //players wins
                    Session.gameState.player1turn = true;
                    Session.gameState.scoreP1++;
                    break;
                default: //enemy wins
                    Session.gameState.player1turn = false;
                    Session.gameState.scoreP2++;
                    break;
            }
            break;



        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //+------------------------------------------------------------------+
        //|                           OTHER CARDS                            |
        //+------------------------------------------------------------------+
        case 'w':
            switch (Session.gameState.board[1]) {
                case 'w': //same element draw
                    Session.gameState.player1turn = !Session.gameState.player1turn; //keep order
                    break;
                case 'm': //draw dark matter
                    Session.gameState.player1turn = true;
                    break;
                case 'e':  //players loses for eter
                    Session.gameState.scoreP2++;
                    Session.gameState.player1turn = false;
                    break;
                case 'p': //loses for this element
                    Session.gameState.scoreP2++;
                    Session.gameState.player1turn = false;
                    break;
                case 'f': //wins against this element
                    Session.gameState.scoreP1++;
                    Session.gameState.player1turn = true;
                    break;
                case 'v': //wins against void
                    Session.gameState.scoreP1++;
                    Session.gameState.player1turn = true;
                    break;
            }
            break;



        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        case 'p':
            switch (Session.gameState.board[1]) {
                case 'p': //same element draw
                    Session.gameState.player1turn = !Session.gameState.player1turn; //keep order
                    break;
                case 'm': //draw dark matter
                    Session.gameState.player1turn = true;
                    break;
                case 'e':  //players loses for eter
                    Session.gameState.scoreP2++;
                    Session.gameState.player1turn = false;
                    break;
                case 'f': //loses for this element
                    Session.gameState.scoreP2++;
                    Session.gameState.player1turn = false;
                    break;
                case 'w': //wins against this element
                    Session.gameState.scoreP1++;
                    Session.gameState.player1turn = true;
                    break;
                case 'v': //wins against void
                    Session.gameState.scoreP1++;
                    Session.gameState.player1turn = true;
                    break;
            }
            break;



        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        case 'f':
            switch (Session.gameState.board[1]) {
                case 'f': //same element draw
                    Session.gameState.player1turn = !Session.gameState.player1turn; //keep order
                    break;
                case 'm': //draw dark matter
                    Session.gameState.player1turn = true;
                    break;
                case 'e':  //players loses for eter
                    Session.gameState.scoreP2++;
                    Session.gameState.player1turn = false;
                    break;
                case 'w': //loses for this element
                    Session.gameState.scoreP2++;
                    Session.gameState.player1turn = false;
                    break;
                case 'p': //wins against this element
                    Session.gameState.scoreP1++;
                    Session.gameState.player1turn = true;
                    break;
                case 'v': //wins against void
                    Session.gameState.scoreP1++;
                    Session.gameState.player1turn = true;
                    break;
            }
            break;
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //+------------------------------------------------------------------+
    //|                    CHECKING IF GAME IS OVER                      |
    //+------------------------------------------------------------------+
    if (Session.gameState.scoreP1 === 5 || (Session.gameState.turnNum === 13 && (Session.gameState.scoreP1 > Session.gameState.scoreP2))) {
        dbStore.writer('p1', Session);
        return true;
    } else if (Session.gameState.scoreP2 === 5 || (Session.gameState.turnNum === 13 && (Session.gameState.scoreP2 > Session.gameState.scoreP1))) {
        dbStore.writer('p2', Session);
        return true;
    } else if (Session.gameState.turnNum === 13 && (Session.gameState.scoreP1 === Session.gameState.scoreP2)) {
        dbStore.writer('draw', Session);
        return true;
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //+------------------------------------------------------------------+
    //|                       PREPARING FOR NEXT TURN                    |
    //+------------------------------------------------------------------+
    Session.gameState.turnNum++;  //turn has ended, next turn
    
    Session.gameState.board[0] = ''; //clean board for next round
    Session.gameState.board[1] = '';
    
    Session.player1.ws.send(JSON.stringify(Session.gameState)); //send game state for both players
    Session.player2.ws.send(JSON.stringify(Session.gameState));

    Session.isLocked = false;  //safety unlock

}

exports.roundChecker;