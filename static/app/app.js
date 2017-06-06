var wsRoomApp = angular.module('ws_room', [
    'ngResource',
    'ngRoute'
])
.constant('baseUrl', '/api')
.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.
        when('/', {
            templateUrl: 'app/start-page/startPage.html',
            controller: 'startPageCtrl'
        }).
        when('/games', {
            templateUrl: 'app/games-list/gamesList.html',
            controller: 'gamesListCtrl'
        }).
        when('/games/:id', {
            templateUrl: 'app/game-board/gameBoard.html',
            controller: 'gameBoardCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });
});

wsRoomApp.factory('$socket', function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});