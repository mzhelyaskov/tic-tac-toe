'use strict';

wsRoomApp.service('AuthService', function (Users, $location, $rootScope) {

    this.login = function (username, callback) {
        var credentials = {username: username};
        Users.login(credentials, function (response) {
            callback(response);
        });
    };

    this.logout = function () {
        Users.logout(function () {
            $rootScope.globals = {};
            $location.path('/login');
        });
    };

    this.isAuthorized = function (callback) {
        UserService.getLoggedIn(callback);
    };
});