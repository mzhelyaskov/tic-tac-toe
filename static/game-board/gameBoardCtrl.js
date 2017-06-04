wsRoomApp.controller('gameBoardCtrl', function ($scope, $socket, $location, $routeParams, Games, UserService) {
    UserService.getLoggedIn().then(function (user) {
        if (user.id) $scope.user = user;
    });
    var gameId = $routeParams['id'];
    Games.get({id: gameId}, function (game) {
        $scope.game = game;
    });

    $scope.turn = function (cell) {
        var data = {
            gameId: gameId,
            playerId: $scope.user.id,
            row: cell.row,
            col: cell.col
        };
        $scope.game.boardBlocked = true;
        $socket.emit('games:turn', data, function (data) {
            $scope.game.board = data.board;
        })
    };

    $socket.on('games:turn', function (data) {
        $scope.game.board = data.board;
        $scope.game.boardBlocked = false;
    });
});