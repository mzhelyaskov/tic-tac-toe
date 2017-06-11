wsRoomApp.factory('Games', ['$resource', 'baseUrl', function ($resource, baseUrl) {
    return $resource(baseUrl + '/games/:controller/:id', {id: '@id'}, {
        create: {
            method: 'POST',
            params: {controller: 'create'}
        },
        reset: {
            method: 'GET',
            params: {controller: 'reset'}
        },
        connect: {
            method: 'GET',
            params: {
                controller: 'connect'
            }
        }
    });
}]);