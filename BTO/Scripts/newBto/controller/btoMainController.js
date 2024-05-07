btoApp.controller('mainController', function ($scope, $rootScope, CONFIG, utilService, $timeout) {
    // No remove
    $rootScope.scope = $scope;
    $scope.title = "Main";
    $scope.name = CONFIG.TAB.MAIN;
    // End No remove
    $scope.callfromOutsite = function () {
        console.log('callfromOutsite');
        if ($rootScope.playBackPlayerData.data != null) {
            $timeout(function () {
                console.log($rootScope.playBackPlayerData.data);
                utilService.updateMainResultFromPlayerData();
                $rootScope.playBackPlayerData.data = null;
            }, 100);
        }
    }

    $rootScope.sharingActionData.data = $scope.name;
    $rootScope.sharingActionData.action = 'SWITCH_TAB';
    // $rootScope.sharingActionData.result = $rootScope.MainResult;
    $rootScope.sharingService.sendingSharingActionData();
});