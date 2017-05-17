const uuid = require('uuid/v1');

var userList = {};

var User = function (username) {
    this.id = uuid();
    this.username = username;
    userList[username] = this;
};

User.findOne = function (username) {
    return userList[username] || null;
};

exports.User = User;



