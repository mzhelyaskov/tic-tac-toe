wsRoomApp.service('UserService', function (Users, $q) {

    this.login = function (loginParams) {
        return Users.login(loginParams).$promise
            .then(function (data) {
                if (data.message) {
                    return $q.reject(data.message);
                }
                return data.user;
            });
    };
});