'use strict';

wsRoomApp.controller('mainCtrl', function ($scope, $location, $rootScope, AuthService, UserService) {
    $rootScope.globals = {};

    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        UserService.getLoggedIn().then(function (loggedIn) {
            $rootScope.globals.user = loggedIn;
            var restrictedPage = $.inArray($location.path(), ['/login']) === -1;
            if (restrictedPage && !loggedIn) {
                $location.path('/login');
                return;
            }
            if (!restrictedPage && loggedIn) {
                $location.path('/games');
            }
        });
    });

    $rootScope.$watch('globals.user', function (user) {
        $scope.user = user;
    });

    $scope.logout = function () {
        AuthService.logout();
    };

    $rootScope.$on('userUpdate', function (event, user) {
        $scope.user = user;
    });
});