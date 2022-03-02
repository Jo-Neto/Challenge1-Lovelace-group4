const User = require('../user.js');
const storeUsr = require('./db-writer.js');

function usrReg(req, res) {
    //TODO: deny invalid name, mail and pass, and 'Clasher' username
    storeUsr(new User(req.body.name, req.body.email, req.body.password));
}

module.exports = usrReg;