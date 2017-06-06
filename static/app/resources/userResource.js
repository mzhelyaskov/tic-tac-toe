wsRoomApp.factory('Users', function ($resource, baseUrl) {
    return $resource(baseUrl + '/users/:id:controller', {}, {
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