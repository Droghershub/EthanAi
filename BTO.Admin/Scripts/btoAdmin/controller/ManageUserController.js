btoApp.controller('ManageUserController', ['$scope', 'parameterService', '$rootScope', '$timeout', 'ultilService', '$http', '$filter',
    function ($scope, parameterService, $rootScope, $timeout, ultilService, $http, $filter) {
        $rootScope.scope = $scope;
        $scope.user_userData = {
            email: '',
            password:""
        }
        $scope.name = 'ExtractDataController';
        $rootScope.spinner.off();
        $scope.itemsByPage = 10;
        $scope.rowCollection = [];
        $scope.displayedCollection = [].concat($scope.rowCollection);
        $scope.canExtractSession = false;
    $scope.manageUserTable = {
        isLoading: false,
        startIndex: 0,
        number: 10,
        numberOfPages: 0,
        email: '',
        displayed: [],
        tableState: null,
        callServer: function (tableState) {
            $scope.manageUserTable.tableState = tableState;
            $scope.manageUserTable.isLoading = true;
            var pagination = tableState.pagination;
            $scope.manageUserTable.startIndex = pagination.start || 0;
            $scope.manageUserTable.number = pagination.number || 10;
            if (angular.isDefined(tableState.search.predicateObject) && angular.isDefined(tableState.search.predicateObject.email)) {
                $scope.manageUserTable.email = tableState.search.predicateObject.email || '';
            }
            //tableState.pagination.numberOfPages = 0;
            $scope.manageUserTable.getSession($scope.manageUserTable.startIndex,
                $scope.manageUserTable.number,
                $scope.manageUserTable.email,
                tableState, function (result) {
                    tableState.pagination.numberOfPages = result.numberOfPages;
                    $scope.manageUserTable.numberOfPages = result.numberOfPages;
                    $scope.manageUserTable.displayed = result.data
                    $scope.manageUserTable.isLoading = false;
                });
        },
        getSession: function (start, number, email, tableState, callbackSuccess) {
            $http({ method: 'POST', url: '/api/ManageUser/getSession', data: { start: start, number: number, email: email } }).then(function (response) {
                if (angular.isDefined(callbackSuccess)) callbackSuccess(response.data);
            });
        }
    };
    $scope.selectedUser = null;
    $scope.forceResetPassword = function (userItem) {
        $scope.selectedUser = userItem;
        ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Do you want to force this user to reset password?"), $scope.forceResetPasswordCallback, null);
    }
    $scope.forceResetPasswordCallback = function () {
        //console.log('OK-ForceResetPassword');
        $http({method:'POST', url: '/api/ManageUser/ForceResetPassword', data: $scope.selectedUser}).then(function (response) {           
            if (response.data == 'Success') {
                ultilService.showSuccessMessage(ultilService.translate('User was forced to reset password successful!'));
            } else {
                ultilService.showErrorMessage(ultilService.translate('Failed to force reset user password'));
            }
        });
    }
    $scope.activeUser = function (userItem) {
        $scope.selectedUser = userItem;
        ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Do you want to active user?"), $scope.activeUserCallback, null);
    }
    $scope.activeUserCallback = function () {
        
        $http({ method: 'POST', url: '/api/ManageUser/ActivationUser', data: $scope.selectedUser }).then(function (response) {
            $scope.selectedUser = response.data;
            $scope.updateDisplayData(response.data);
            ultilService.showSuccessMessage(ultilService.translate('User was actived successful!'));
            $scope.manageUserTable.callServer($scope.manageUserTable.tableState);
            
        });
    }
    $scope.deActiveUser = function (userItem) {
        $scope.selectedUser = userItem;
        ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Do you want to deactive user?"), $scope.deActiveUserCallback, null);
    }

    $scope.deActiveUserCallback = function () {
        $http({ method: 'POST', url: '/api/ManageUser/DeActivationUser', data: $scope.selectedUser }).then(function (response) {
            $scope.selectedUser = response.data;
            $scope.updateDisplayData(response.data);
            ultilService.showSuccessMessage(ultilService.translate('User was deactived successful!'));
            $scope.manageUserTable.callServer($scope.manageUserTable.tableState);
            
        });
    }
    $scope.updateDisplayData = function (item) {
        for (var i = 0; i < $scope.manageUserTable.displayed.length; i++) {
            if ($scope.manageUserTable.displayed[i].id == item.id) {
                $scope.manageUserTable.displayed[i] = item;
                break;
            }
        }
    }



    $scope.user_createNewUser = function () {
        console.log('user_createNewUser');
        console.log($scope.user_userData);
        $http({ method: 'POST', url: '/api/ManageUser/CreateAccount', data: $scope.user_userData }).then(function (response) {
            var data = response.data;
            console.log(data);
            if (data.success) {
                $scope.user_userData = {
                    email: "",
                    password: ""
                }
                ultilService.showSuccessMessage(ultilService.translate('User was created successful!'));
                $scope.manageUserTable.callServer($scope.manageUserTable.tableState);
            } else {
                ultilService.showErrorMessage(data.errmessage);
            }

        });
    }
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
        }, function (exception) {
            console.log('Error : ', exception);
            $rootScope.spinner.off();
        });
        $timeout(function () {
            $scope.canExtractSession = true;
            $scope.LinkDownloadInYourEmail = 'LinkDownloadInYourEmail';
            ultilService.showSuccessMessage(ultilService.translate('LinkDownloadInYourEmail'));
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
        var A = [['UserId', 'Email', 'IP', 'Name', 'Browser', 'BrowserPlatform', 'BrowserVersion', 'Begin Time', 'End Time', 'UrlReferrer', 'Userlanguages', 'UIVersion', 'UserAgent']];
        for (var j = 1; j <= dataExport.length; ++j) {
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


 