const fs = require('fs');

function getNextUserID() {
    
    const file = fs.readFileSync('./database/users.json');

    let dataBase = JSON.parse(file);
    
    let replaceableIndex = dataBase.findIndex( user => { 
        return user === null;
    });

    if (replaceableIndex !== -1)
        return replaceableIndex;
    else
        return  dataBase.length;

}

module.exports = getNextUserID;