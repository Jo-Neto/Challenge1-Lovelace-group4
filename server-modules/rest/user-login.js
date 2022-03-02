const crypto = require('crypto');
const fs = require('fs');


function userLogin(data, res) {  //safety

    let uFile = fs.readFileSync('./database/users.json');
    let pFile = JSON.parse(uFile);

    let userIndex = pFile.findIndex(user => {
        return (data.id === user.name || data.id === user.email);
    });

    if (userIndex === -1) {  //usuario nao encontrado
        res.send("Usuário e/ou senha invalida");
        return false;
    }

    else {
        let hash = crypto.pbkdf2Sync(data.password, pFile[userIndex].salt, 2048, 128, `sha512`).toString(`hex`);

        if (pFile[userIndex].hash === hash) {
            if (pFile[userIndex].active = false)
                res.send("Esta conta foi deletada");
            else {
                //TODO: mete o cookie de user no browser do user, e sobrescreve
                res.send("Bem vindo " + pFile[userIndex].name);
            }
        }

        else { //senha errada
            res.send("Usuário e/ou senha invalida");
        }
        return true;
    }

}

module.exports = userLogin;