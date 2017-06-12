'use strict';

wsRoomApp.controller('loginCtrl', function ($scope, $location, $rootScope, AuthService) {

        $scope.isFieldValid = function (fieldName, validator) {
            var form = $scope.signInForm;
            var field = form[fieldName];
            return !form.$submitted || (validator ? !field.$error[validator] : field.$valid);
        };

        $scope.login = function (user) {
            if ($scope.signInForm.$invalid) return;
            $scope.message = undefined;
            AuthService.login(user.username, function (response) {
                if (response.success) {
                    $rootScope.globals.user = angular.copy(response.user);
                    $location.path('/games');
                } else {
                    $scope.message = response.message;
                }
            });
        };
    });