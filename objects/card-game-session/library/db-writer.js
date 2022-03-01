//+------------------------------------------------------------------+
//|               METHOD STORES MATCH ON DATABASE                    |
//+------------------------------------------------------------------+
const fs = require('fs');

//function stores session on database and sends message to players who have an OPEN socket

//TODO: don't send message to closed/inexistent sockets

module.exports = function (Session, winner) { //IMPORTANT, ONLY ACCEPTS 'draw', 'p1' OR 'p2' STRING TYPES, LOWERCASE
    console.log("CardGameSession object --> storeOnDatabase(fn) --> SessionNum:" + Session.gameState.sID);
    Session.player1.key = null; //clear reconnection keys
    Session.player2.key = null;
    if (winner === 'p1') { 
        Session.player1.ws.send("Voce ganhou!");
        Session.player2.ws.send("Voce perdeu");
    } else if (winner === 'p2') {
        Session.player1.ws.send("Voce ganhou!");
        Session.player2.ws.send("Voce perdeu");
    } else if (winner === 'draw') {
        Session.player1.ws.send("Empate!");
        Session.player2.ws.send("Empate!");
    } else
        console.log("CardGameSession object --> storeOnDatabase(fn) --> INVALID WINNER STRING --> SessionNum: " + Session.gameState.sID);
    Session.player1.ws.close(1000, 'match has finished'); //close socket and warn front that everything is fine
    Session.player2.ws.close(1000, 'match has finished');
    Session.player1.ws.terminate(); //safety 
    Session.player2.ws.terminate(); //safety
    fs.readFile('./database/game-sessions.json', (err, readData) => { //save match data on database
        if (err) { console.log("ERROR: SessionNum:" + Session.gameState.sID + "on reading database: "); throw console.log(err); }
        let dataBase = JSON.parse(readData);
        dataBase.push({
            sessiomID: Session.gameState.sID,
            winner: winner,
            player1: {
                score: Session.gameState.scoreP1,
                name: Session.player1.name,
                account: Session.player1.account,
            },
            player2: {
                score: Session.gameState.scoreP2,
                name: Session.player2.name,
                account: Session.player2.account,
            },
            turnNum: Session.gameState.turnNum,
            disconnec: Session.gameState.disconnec,
            hasGivenUp: Session.gameState.hasGivenUp,
            hasCheated: Session.gameState.hasCheated
        });
        let toWrite = JSON.stringify(dataBase);
        fs.writeFile('./database/game-sessions.json', toWrite, (err, out) => {
            if (err) { console.log("ERROR: SessionNum:" + Session.gameState.sID + "on writing database: "); throw console.log(err) };
        });
        console.log("CardGameSession object --> storeOnDatabase(fn) --> session num: " + Session.gameState.sID + ' registered on database');
    });
    Session = null; //nullify session for it to be replaced on the active game sessions array
}