btoApp.controller('ExtractDataController', ['$scope', 'reportService', '$rootScope', '$timeout', 'ultilService', '$http', 'roleService','$filter',
function ($scope, reportService, $rootScope, $timeout, ultilService, $http, roleService, $filter) {
    $rootScope.scope = $scope;
    $scope.name = 'ExtractDataController';
    $rootScope.spinner.off();
    $scope.itemsByPage = 10;
    $scope.rowCollection = [];
    $scope.displayedCollection = [].concat($scope.rowCollection);
    $scope.canExtractSession = false;
    $scope.extractReferalList = function () {
        var startDate = $('#txtReferal_startDate').val();
        var endDate = $('#txtReferal_endDate').val();
        if (startDate == '') {
            ultilService.showErrorMessage(ultilService.translate('Please select start date!'));
            return;
        }
        if (endDate == '') {
            ultilService.showErrorMessage(ultilService.translate('Please select end date!'));
            return;
        }
        var dataSend = {
            startdate: startDate,
            enddate: endDate
        };
      
        ultilService.callApiByAjax('POST', '/api/invitation/getReportList', dataSend, function (response) {
            $scope.dataUageSession = response;
            $scope.exportReferalFile($scope.dataUageSession);
        }, function (exception) {
            console.log('Error : ', exception);
        });
    }
    $scope.extractSection = function () {
        $scope.LinkDownloadInYourEmail = '';
        var startDate = $('#txtstartDate').val();
        var endDate = $('#txtendDate').val();
        if (startDate == '') {
            ultilService.showErrorMessage(ultilService.translate('Please select start date!'));
            return;
        }
        if (endDate == '') {
            ultilService.showErrorMessage(ultilService.translate('Please select end date!'));
            return;
        }
        var dataSend = {
            startdate: startDate,
            enddate: endDate
        };
       // $rootScope.spinner.on();
        ultilService.callApiByAjax('POST', '/api/report/gettrackingclient', dataSend, function (response) {
           // $scope.rowCollection = response;
           // $scope.exportFile($scope.rowCollection);
            $rootScope.spinner.off();
        }, function(exception){
            console.log('Error : ', exception);
            $rootScope.spinner.off();
        });
        $timeout(function () {
            $scope.canExtractSession = true;
            $scope.LinkDownloadInYourEmail = 'LinkDownloadInYourEmail';
        }, 500);
    }
    $scope.extractCsvFileSection = function () {
        $rootScope.spinner.on();
        $scope.exportFile($scope.rowCollection);
        $rootScope.spinner.off();
    }
    $scope.exportReferalFile = function (dataExport) {
        var A = [['Email', 'Name', 'UserEmail', 'DateTime', 'IP']];
        for (var j = 1; j <= dataExport.length; ++j) {
            console.log('dataExport[j+1]', dataExport[j - 1]);
            A.push([
                dataExport[j - 1].Email,
                dataExport[j - 1].Name,
                dataExport[j - 1].UserEmail,
               $filter('date')(dataExport[j - 1].DateTime, 'yyyy-MM-dd HH:mm'),
                dataExport[j - 1].IP,
            ]);
        }

        var csvRows = [];

        for (var i = 0, l = A.length; i < l; ++i) {
            csvRows.push(A[i].join(','));
        }

        var csvString = csvRows.join("%0A");
        var a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,' + csvString;
        a.target = '_blank';
        a.download = 'ReferalList.csv';

        document.body.appendChild(a);
        a.click();
    }
    $scope.exportFile = function (dataExport) {
        var A = [['UserId', 'Email', 'IP', 'Name', 'Browser', 'BrowserPlatform', 'BrowserVersion', 'Begin Time','End Time', 'UrlReferrer', 'Userlanguages','UIVersion', 'UserAgent']];
        for (var j = 1; j <= dataExport.length; ++j){ 
            A.push([
                dataExport[j - 1].UserId,
                dataExport[j - 1].Email,
                dataExport[j - 1].IP,
                dataExport[j - 1].Name,
                dataExport[j - 1].Browser,
                dataExport[j - 1].BrowserPlatform,
                dataExport[j - 1].BrowserVersion,
                $filter('date')(dataExport[j - 1].DateTime, 'yyyy-MM-dd HH:mm'),
                 $filter('date')(dataExport[j - 1].EndTime, 'yyyy-MM-dd HH:mm'),                
                dataExport[j - 1].UrlReferrer,
                dataExport[j - 1].Userlanguages,
                 dataExport[j - 1].UIVersion,
                dataExport[j - 1].UserAgent
                
            ]);
        }
       

        var csvRows = [];
        for (var i = 0, l = A.length; i < l; ++i) {
            csvRows.push(A[i].join(','));
        }
        var csvString = csvRows.join("%0A");
        var a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,' + csvString;
        a.target = '_blank';
        a.download = 'UsageSession.csv';

        document.body.appendChild(a);
        a.click();
    }
}]);