'use strict';

wsRoomApp.service('UserService', function (Users) {

    this.getLoggedIn = function (callback) {
        return Users.getLoggedIn().$promise.then(function (user) {
            callback(user.id ? user.toJSON() : null);
        });
    };
});