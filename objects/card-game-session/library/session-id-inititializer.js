//+------------------------------------------------------------------+
//|         GET FIRST AVAILABLE MATCH ID ON SERVER INIT              |
//+------------------------------------------------------------------+
const fs = require('fs');

let nextID = fs.readFile('./database/game-sessions.json', (err, readData) => {
    if (err) {
        console.log("SESSION-ID-INIT: ERROR: reading file:");
        throw console.log(err);
    }
    let dataBase = JSON.parse(readData);
    nextID = dataBase.length;
    return nextID;
});

module.exports = nextID;