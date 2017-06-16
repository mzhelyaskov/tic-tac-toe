var wsRoomApp = angular.module('ws_room', [
    'ngResource',
    'ngRoute'
])
.constant('baseUrl', '/api')
.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.
        when('/login', {
            templateUrl: 'app/login-page/loginPage.html',
            controller: 'loginCtrl'
        }).
        when('/games', {
            templateUrl: 'app/games-list/gamesList.html',
            controller: 'gamesListCtrl'
        }).
        when('/games/:id', {
            templateUrl: 'app/game-board/gameBoard.html',
            controller: 'gameBoardCtrl'
        }).otherwise({
            redirectTo: '/login'
        });
});