btoApp.factory('userService',
function ($rootScope, $filter, $http, utilService) {
    var self = this;
    this.loadListFunctionPermission = function (user_id, callbackSuccess) {
        $rootScope.functionAccess = {};
        $rootScope.functionAccess.errorMessage = "This action is not permitted";
        $rootScope.functionAccess.deniedMessage = "This action is not permitted";
        utilService.callApiByAjax('GET', '/api/usermanagement/get_all_functions_for_user/' + user_id, '', function (response) {
            if (response != null) {
                $rootScope.listFunctionPermission = response;
                self.SetPermissionFunctionAccess($rootScope.listFunctionPermission);
                if (angular.isDefined(callbackSuccess)) callbackSuccess();
                
            }
        });
    }

    this.SetPermissionFunctionAccess = function (listfunctionRole) {
        for (var i = 0; i < listfunctionRole.length; i++) {
            $rootScope.functionAccess[listfunctionRole[i].name] = self.GetUserPermissionOnAction(listfunctionRole, listfunctionRole[i].name);
        }
    }
    this.GetUserPermissionOnAction = function (list, actionName) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].name == actionName) {
                return list[i].action;
            }
        }
        return -1;
    }

    this.ChangePassword = function (obj) {
        utilService.callApi('POST', '/api/ManageUser/ChangePassword' , '',obj, function (response) {
            
        });
    }

    this.getRatingOfUser = function (callback) {
        utilService.callApi('GET', '/api/userrating/GetUserRatingOfUser', '', null, function (response) {
            if (angular.isDefined(callback)) callback(response);
        });
    }

    this.getRatingOfUser = function (callback) {
        utilService.callApi('GET', '/api/userrating/GetUserRatingOfUser', '', null, function (response) {
            if (angular.isDefined(callback)) callback(response);
        });
    }

    this.submitRating = function (callback) {
        var submitData = angular.copy($rootScope.ratingData);
        delete submitData['data'];
        delete submitData['oldValue'];
        utilService.callApi('POST', '/api/userrating/PostUserRating', '', submitData, function (response) {
            if (angular.isDefined(callback)) callback(response);
        });
    }
    this.submitFeedback = function (data,callback) {
        utilService.callApi('POST', '/api/userfeedback/savefeedback', '', data, function (response) {
            if (angular.isDefined(callback)) callback(response);
        });
    }

    this.getDefaultInvitation = function (callback) {
        utilService.callApi('GET', '/api/invitation/getInvitationDefault', '', null, function (response) {
            if (angular.isDefined(callback)) callback(response);
        });
    }

    this.saveInvitation = function (callback) {
        var submitData = [];
        if ($rootScope.invitationData.length > 0) {
            angular.forEach($rootScope.invitationData, function (inviation) {
                if (inviation.email != null && inviation.email != '') {
                    submitData.push(inviation);
                }
            })
        }
            
        utilService.callApi('POST', '/api/invitation/saveInviteList', '', submitData, function (response) {
            if (angular.isDefined(callback)) callback(response);
        });
    }

    return this;
})