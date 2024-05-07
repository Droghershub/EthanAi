btoApp.service('quickSettingService', function ($rootScope, utilService) {
    this.changeLanguage = function () {
        $('span.need-translate').attr
        var x = $('.btn-translate')
        angular.forEach(x, function (t) { var item = $(t); item.attr('data-original-title', utilService.translate(item.attr('data-original-title-not-translate'))) })
    }

    //this.sharing = function () {
    //    var $panel_headers = $('.collapsible-header');
    //    $panel_headers.on('click.collapse', function (e) {
    //        var element = $(e.target);
    //        var data = { id: element.attr('id'), class: element.attr('class') };
    //        $rootScope.SendingScreenSharingDataObject(data, 'quickSettingService', 'click-collapsible-header');
    //    });
    //    var $icon_quickseting = $('#qs-module');
    //    $icon_quickseting.on('click', function (e) {    
    //        var element = $(e.target);
    //        $('#sidenav-overlay').on('click', function (e) {
    //            var element = $(e.target);
    //            $rootScope.SendingScreenSharingDataObject(element.attr('id'), 'quickSettingService', 'click');
    //        });
    //        $rootScope.SendingScreenSharingDataObject(element.attr('id'), 'quickSettingService', 'click');
    //    });

    //    $("#side-nav-close").on('click', function (e) {
    //        var element = $(e.target);
    //        $rootScope.SendingScreenSharingDataObject(element.attr('id'), 'quickSettingService', 'click');
    //    });

    //    $("#side-nav-panels-saving-rate").on('click', function (e) {           
    //        $rootScope.SendingScreenSharingDataObject('side-nav-panels-saving-rate', 'quickSettingService', 'click');
    //    });
    //    $("#side-nav-panels-retirement-lifestyle").on('click', function (e) {
    //        $rootScope.SendingScreenSharingDataObject('side-nav-panels-retirement-lifestyle', 'quickSettingService', 'click');
    //    });
    //    $("#side-nav-panels-investments").on('click', function (e) {
    //        $rootScope.SendingScreenSharingDataObject('side-nav-panels-investments', 'quickSettingService', 'click');
    //    });
    //}
    this.shareAction = function (controlId) {
        $rootScope.SendingScreenSharingDataObject(controlId, 'quickSettingService', 'click');
    }

    this.UpdateControlShareScreen = function (obj) {
        switch (obj.actionEvent) {
            case 'click-collapsible-header':
                $('#' + obj.newValue.id).click()
                break;
            case 'click':
                $('#' + obj.newValue).click();
                break;
        }
    }
    this.showQuickSetting = function () {

    }

    return this;
});