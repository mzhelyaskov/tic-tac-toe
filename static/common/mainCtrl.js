wsRoomApp.controller('mainCtrl', function ($scope, $rootScope, $location, UserService) {
    UserService.getLoggedIn().then(function (user) {
        if (user.id) {
            $scope.user = user;
            $location.path('/games');
        }
    });

    $rootScope.$on('userUpdate', function (event, user) {
        $scope.user = user;
    });
});