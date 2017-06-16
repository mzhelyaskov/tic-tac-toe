wsRoomApp.directive("messageChat", function () {
    return {
        scope: {
            player: '=',
            chat: '='
        },
        replace: true,
        templateUrl: 'app/chat/chat.html',
        controller: function ($scope, $socket, $routeParams, $element, $timeout) {
            var gameId = $routeParams['id'];

            $scope.isRival = function (messageBox) {
                return messageBox.sender === $scope.player.username;
            };

            $scope.sendMessage = function ($event) {
                if (!$scope.text || ($event && $event.key !== 'Enter')) {
                    return;
                }
                var params = {
                    gameId: gameId,
                    text: $scope.text
                };
                $socket.emit('chat:message', params, function (chat) {
                    updateChat(chat);
                });
            };

            $socket.on('chat:message', function (chat) {
                updateChat(chat);
            });

            function updateChat(chat) {
                $scope.text = '';
                $scope.chat = angular.copy(chat);
                $timeout(function () {
                    var chatElem = $element.find('.chat')[0];
                    chatElem.scrollTop = chatElem.scrollHeight;
                });
            }
        }
    };
});