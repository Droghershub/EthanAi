btoApp.factory('reportService',function ($rootScope, $timeout, $http) {
    //this.getAllReferal = function () {
    //    return $http({
    //            method: 'GET',
    //            async: false,
    //            url: 'api/clientTracking/gettrackingclient'
    //        });
    //}

    this.getAllReferal = function (data) {
        return $http({
            method: 'POST',
            async: false,
            url: '/api/report/gettrackingclient',
            data: data
        });
    }
    return this;
});