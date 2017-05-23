wsRoomApp.controller('gameBoardCtrl', function ($scope, $socket, $location, $routeParams, Games) {
    $scope.gameSize = '15';
    $scope.gameBoard = [];

    var gameId = $routeParams['id'];

    $socket.emit('games:connect', gameId, function (data) {
        $scope.gameBoard = data.gameBoard;
    });
});