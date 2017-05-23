wsRoomApp.factory('Games', function ($resource) {
    return $resource('/games/:id:controller', {id: '@id'}, {
        create: {
            method: 'POST',
            params: {controller: 'create'}
        },
        reset: {
            method: 'GET',
            params: {controller: 'reset'}
        },
        query: {
            method: 'GET',
            isArray: true
        }
    });
});