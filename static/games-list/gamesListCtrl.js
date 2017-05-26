wsRoomApp.controller('gamesListCtrl', function ($scope, $socket, $location, Games) {
    $scope.game = {
        size: '15'
    };

    $socket.on('games:createdNew', function (newGame) {
        $scope.availableGames[newGame.id] = newGame;
    });

    $scope.availableGames = Games.query();

    $scope.createNewGame = function (game) {
        var gameParams = {
            password: game.password,
            size: +game.size
        };
        Games.create(gameParams, function (params) {
            $location.path('/games/' + params.gameId);
        });
    };

    $scope.connectToGame = function (gameId) {
        $location.path('/games/' + gameId);
    }
});