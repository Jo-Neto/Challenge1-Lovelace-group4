//+------------------------------------------------------------------+
//|                     STORES USER ON DATABASE                      |
//+------------------------------------------------------------------+
const fs = require('fs');


module.exports = function (User) { 
    
    fs.readFile('./database/users.json', (err, readData) => { 
        if (err) { console.log("ERROR: SessionNum:" + User.id + "on reading database: "); throw console.log(err); }
        
        let dataBase = JSON.parse(readData);
        
        dataBase.push({
            id: User.id,
            active: User.active,
            name: User.name,
            email: User.email,
            salt: User.salt,
            hash: User.hash
        });
        
        let toWrite = JSON.stringify(dataBase);
        
        fs.writeFile('./database/users.json', toWrite, (err, out) => {
            if (err) { console.log("ERROR: SessionNum:" + User.id + "on writing database: "); throw console.log(err) };
        });
        console.log("User ID: " + User.id + ' registered on database');
    
    });

}