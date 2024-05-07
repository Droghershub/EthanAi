btoApp.factory('invitationService',
function ($rootScope, $timeout, userService, utilService) {
    $rootScope.invitationData = [];
    
    this.defaultInviationData = null;

    this.initInviationData = function () {
        $rootScope.invitationData = [
            angular.copy(this.defaultInviationData),
            angular.copy(this.defaultInviationData)
        ];
    }

    this.ininitDefaultIviationData = function () {
        var self = this;
        userService.getDefaultInvitation(function (data) {
            self.defaultInviationData = data;
        })
    }
    this.ininitDefaultIviationData();
    this.showInvitation = function () {
        this.initInviationData();
        $timeout(function () {
            $rootScope.utilService.scopeApply();
            $rootScope.SendingScreenSharingDataObject($rootScope.invitationData, 'invitationService', 'invitation');
            $('#share-modal').modal('show');
        }, 300);
    }

    this.savingInvitation = function () {
        userService.saveInvitation(function (data) {
            $('#share-modal').modal('hide');
            utilService.showSuccessMessage(utilService.translate('Sharing was sent successfully.'))
            $rootScope.SendingScreenSharingDataObject($rootScope.invitationData, 'invitationService', 'savingInvitation');
        })
    }

    this.addMoreInvitation = function () {
        $rootScope.invitationData.push(angular.copy(this.defaultInviationData));
    }

    this.deleteInvitation = function (index) {
        if (index > 0) {
            $rootScope.invitationData.splice(index, 1);
        }
    }

    this.cancelInvitation = function () {
        
    }

    this.enterKey = function (index) {
        if ($rootScope.invitationData.length == 0) {
            this.addMoreInvitation();
        } else if (index == $rootScope.invitationData.length - 1) {
            this.addMoreInvitation();
        } else {
            $('#share-email-' + (index + 1)).focus();
        }
    }
    
    return this;
})

