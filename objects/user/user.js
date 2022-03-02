const crypto = require('crypto');
const getNextUserID = require('./library/next-id-checker.js');

class User {
    constructor(name, email, password) {
        this.id = getNextUserID(),
        this.name = name,
        this.email = email,
        this.salt = crypto.randomBytes(64).toString('hex'),
        this.hash = crypto.pbkdf2Sync(password, this.salt, 1024, 64, `sha512`).toString(`hex`);
    }
}

module.exports = User;