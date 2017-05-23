const crypto = require('crypto');
var numberUtils = require('./numberUtils');

module.exports = {
    makeSalt: function () {
        var saltLength = numberUtils.randomInteger(8, 12);
        return crypto.randomBytes(saltLength).toString('hex');
    },
    encryptPassword: function (password, salt) {
        return crypto.createHmac('sha1', salt).update(password).digest('hex');
    }
};