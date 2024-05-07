btoApp.controller('OtherActionController', ['$scope', 'parameterService', '$rootScope', '$timeout', 'ultilService', '$http', 'roleService',
function ($scope, parameterService, $rootScope, $timeout, ultilService, $http, roleService) {
    $rootScope.scope = $scope;
    $scope.name = 'OtherActionController';
    $scope.getStaticRule = function (id) {
        return $http({
            method: 'GET',
            async: false,
            url: '/api/cashflow/getStaticRule/' + id
        }).then(function (response) {
            ultilService.showSuccessMessage('Update Rule Success!',2000);
        }).catch(function (data) { ultilService.showErrorMessage('Update Rule Fail!', 2000); });
    }
}]);