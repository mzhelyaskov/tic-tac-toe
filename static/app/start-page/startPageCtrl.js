wsRoomApp.controller('startPageCtrl', function ($scope, $location, $rootScope, UserService) {
        $scope.isFieldValid = function (fieldName, validator) {
            var form = $scope.signInForm;
            var field = form[fieldName];
            return !form.$submitted || (validator ? !field.$error[validator] : field.$valid);
        };

        $scope.loginUser = function (user) {
            if ($scope.signInForm.$invalid) return;
            UserService.login({username: user.username})
                .then(
                    function (user) {
                        $scope.$emit('userUpdate', user);
                        $location.path('/games')
                    },
                    function (errorMessage) {
                        $scope.message = errorMessage;
                    }
                );
        };
    });