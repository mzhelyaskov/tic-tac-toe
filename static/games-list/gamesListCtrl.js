wsRoomApp.controller('gamesListCtrl', function ($scope, $socket, $location, Games) {

    $scope.games = Games.query();
    $scope.waitingForOpponents = false;
    $scope.newGameParams= {
        size: '15'
    };

    $socket.on('games:createdNew', function (newGame) {
        $scope.games.push(newGame);
    });

    $socket.on('games:start', function (data) {
        $location.path('/games/' + data.gameId);
    });

    $scope.createNewGame = function () {
        $socket.emit('games:create', $scope.newGameParams, function () {
            $scope.waitingForOpponents = true;
        });
    };

    $scope.connectToGame = function (gameId) {
        $socket.emit('games:connect', gameId, function (data) {
            $scope.message = data.message;
        });
    };
});