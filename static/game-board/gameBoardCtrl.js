wsRoomApp.controller('gameBoardCtrl', function ($scope, $socket, $location, $routeParams, Games) {
    $scope.gameSize = '15';
    $scope.gameBoard = [];

    var gameId = $routeParams['id'];

    $socket.emit('games:connect', gameId, function (data) {
        $scope.gameBoard = data.gameBoard;
    });

    $scope.turn = function (cell) {
        var data = {
            gameId: gameId,
            cell: cell
        };
        $socket.emit('games:turn', data, function (data) {
            $scope.gameBoard = data.gameBoard;
        })
    };

    $socket.on('games:turn', function (data) {
        $scope.gameBoard = data.gameBoard;
    });
});