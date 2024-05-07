btoApp.service('ultilService', function ($rootScope, $q, $timeout, $filter) {
    this.translate = function (text, valueObj) {
        return $filter('translate')(text, valueObj);
    }
    this.showSuccessMessageObj = null;
    this.showSuccessMessage = function (message, timeout) {
        $timeout.cancel(this.showSuccessMessageObj);
        var timeoutTime = 3000;
        if (angular.isDefined(timeout)) timeoutTime = timeout;
        $rootScope.successMessage.show = true;
        $rootScope.successMessage.message = message;
        this.showSuccessMessageObj = $timeout(function () {
            $rootScope.successMessage.show = false;
            /*
            $timeout(function () {
                $rootScope.successMessage.message = '';
            }, 1000);
            */
        }, timeoutTime);
    }
    this.showErrorMessageObj = null;
    this.showErrorMessage = function (message, timeout) {
        $timeout.cancel(this.showErrorMessageObj);
        $rootScope.errorMessage.show = true;
        $rootScope.errorMessage.message = message;
        var timeoutTime = 3000;
        if (angular.isDefined(timeout)) timeoutTime = timeout;
        this.showErrorMessageObj = $timeout(function () {
            $rootScope.errorMessage.show = false;
        }, timeoutTime);
    }
    this.showWarningMessageObj = null;
    this.showWarningMessage = function (message) {
        $timeout.cancel(this.showWarningMessageObj);
        $rootScope.warningMessage.show = true;
        $rootScope.warningMessage.message = message;
        $timeout.cancel(this.showWarningMessageObj);
        this.showWarningMessageObj = $timeout(function () {
            $rootScope.warningMessage.show = false;
        }, 3000);
    },
    this.ShowDialog = function ($rootScope, title, content, messenge, callback, customeBody, CancelText, OkText, cancelCallBack) {
        $rootScope.confirmdialog = {};
        $rootScope.confirmdialog.title = title;
        $rootScope.confirmdialog.content = content;
        $rootScope.confirmdialog.messenger = messenge;
        $rootScope.confirmdialog.cancelText = 'Cancel';
        if ((CancelText != undefined) && (CancelText != ''))
            $rootScope.confirmdialog.cancelText = CancelText;
        $rootScope.confirmdialog.OkText = 'Ok';
        if ((OkText != undefined) && (OkText != ''))
            $rootScope.confirmdialog.OkText = OkText;
        $('#confirmdialog').attr('aria-hidden', true);
        $('#confirmdialog').modal({ backdrop: 'static', keyboard: false });
        $('#confirmdialogbodyContent').html(customeBody);
        $('#OkConfirm').bind('click', function () {
            if (callback != undefined)
                callback();
            utils.UnbindControl();
        });
        $('#CancelConfirm').bind('click', function () {
            if (cancelCallBack != undefined)
                cancelCallBack();
            utils.UnbindControl(); 
        });
        $('#Okbtndialog').bind('click', function () {
            utils.UnbindControl(); 
        });
    }
    this.callApiByAjax = function (method, url, data, callbackSuccess, callbackFail, callbackError) {
        var self = this; 
        $.ajax({
            method: method, async: false, url: url, data: data, success: function (response) {
                console.log(response);
                if (response && response != null && response.status == 408)
                    window.location.href = '/Account/LogOff';
                if (angular.isDefined(callbackSuccess))
                    callbackSuccess(response);
            }
        });
    }
    this.UnbindControl = function () {
        $('#Okbtndialog').unbind('click');
        $('#OkConfirm').unbind('click');
        $('#CancelConfirm').unbind('click');
        $('#input_rename_unit_work').val('');
        $('#confirmdialogbodyContent').html('');
        $('#input_rename_unit_work').removeAttr('placeholder');

    }

});