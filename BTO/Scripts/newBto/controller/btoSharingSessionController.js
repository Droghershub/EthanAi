btoApp.controller('sharingSessionController', 
function ($scope, sharingService, $timeout, $rootScope, timelineService, $templateCache, CONFIG) {
    $rootScope.scope = $scope;
    $scope.title = "Sharing session";
    $scope.name = CONFIG.TAB.SHARING_SESSION;           
});


