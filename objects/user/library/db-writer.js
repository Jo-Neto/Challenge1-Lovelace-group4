//+------------------------------------------------------------------+
//|                     STORES USER ON DATABASE                      |
//+------------------------------------------------------------------+
const fs = require('fs');

module.exports = function (User) { //IMPORTANT, ONLY ACCEPTS 'draw', 'p1' OR 'p2' STRING TYPES, LOWERCASE
    
    fs.readFile('./database/game-sessions.json', (err, readData) => { //save match data on database
        if (err) { console.log("ERROR: SessionNum:" + User.id + "on reading database: "); throw console.log(err); }
        let dataBase = JSON.parse(readData);
        dataBase.push({
            id: User.id,
            name: User.name,
            email: User.email,
            salt: User.salt,
            hash: User.hash
        });
        let toWrite = JSON.stringify(dataBase);
        fs.writeFile('./database/game-sessions.json', toWrite, (err, out) => {
            if (err) { console.log("ERROR: SessionNum:" + User.id + "on writing database: "); throw console.log(err) };
        });
        console.log("User ID: " + User.id + ' registered on database');
    });

}