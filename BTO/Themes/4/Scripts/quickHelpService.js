btoApp.service('quickHelpService', function ($rootScope, utilService) {
    this.showMoreHelp = function (quickHelpId) {
        if (angular.isDefined(quickHelpId) && quickHelpId != null) {
            console.log('showMoreHelp: ' + quickHelpId);
        }
    }
    return this;
});