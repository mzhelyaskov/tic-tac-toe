wsRoomApp.factory('Users', function ($resource) {
    return $resource('/users/:id:controller', {}, {
        login: {
            method: 'POST',
            params: {
                controller: 'login'
            }
        },
        getLoggedIn: {
            method: 'GET',
            params: {
                controller: 'logged-in'
            }
        }
    });
});