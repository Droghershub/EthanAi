btoApp.factory('zoomService',
function ($rootScope, $timeout) {
    this.changeMin = function (age) {
       
    }

    this.changeMax = function (age) {      
        $rootScope.reRenderTimelineObject();
        $timeout(function () {
            $rootScope.SendingScreenSharingDataObject($rootScope.zoomData.isShow, 'zoom', 'changeMax');
        }, 100);
    }
    this.changeMinAge = function (age) {
        $rootScope.reRenderTimelineObject();
        $timeout(function () {
            $rootScope.SendingScreenSharingDataObject($rootScope.zoomData.minAge, 'zoom', 'changeMinAge');
        }, 100);
    }

    this.changeMaxAge = function (age) {
        $rootScope.reRenderTimelineObject();
        $timeout(function () {
            $rootScope.SendingScreenSharingDataObject($rootScope.zoomData.maxAge, 'zoom', 'changeMaxAge');
        }, 100);
    }

    this.changeIsShow = function () {
        this.resetZoomData();
        $rootScope.reRenderTimelineObject();
        
        $timeout(function () {
            $rootScope.SendingScreenSharingDataObject($rootScope.zoomData.isShow, 'zoom', 'changeIsShow');
        }, 100);
    }

    this.resetZoomData = function () {
        $rootScope.zoomData.min = angular.copy($rootScope.PersonaPlan.start_age);
        $rootScope.zoomData.minAge = angular.copy($rootScope.PersonaPlan.start_age);
        $rootScope.zoomData.max = angular.copy($rootScope.PersonaPlan.death_age);
        $rootScope.zoomData.maxAge = angular.copy($rootScope.PersonaPlan.death_age);
    }
    $rootScope.zoomService = this;
    return this;
})