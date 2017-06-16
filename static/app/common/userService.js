'use strict';

wsRoomApp.service('UserService', function (Users) {

    this.getLoggedIn = function () {
        return Users.loggedIn().$promise.then(function (user) {
            return user.id ? user.toJSON() : null;
        });
    };
});