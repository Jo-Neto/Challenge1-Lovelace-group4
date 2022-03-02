const User = require('../user.js');
const storeUsr = require('./db-writer.js');

function usrReg(data, res) {
    //TODO: deny invalid name, mail and pass, and 'Clasher' username
    storeUsr(new User(data.name, data.email, data.password));
}

module.exports = usrReg;