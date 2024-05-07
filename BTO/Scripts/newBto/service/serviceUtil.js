btoApp.service('pendingRequests', function ($rootScope) {
    var pending = [];
    this.get = function () {
        return pending;
    };
    this.add = function (request) {
        pending.push(request);
    };
    this.remove = function (request) {
        pending = _.filter(pending, function (p) {
            return p.url !== request;
        });
    };
    this.cancelAll = function () {
       
        angular.forEach(pending, function (p) {
            if (p.url.indexOf('/api/common/') == 0 && p.url.indexOf('signalr') < 0) {
                //console.log('cancel request url: ' + p.url);
                p.canceller.resolve();
                //p.canceller.reject();
            } else if (p.url.indexOf( $rootScope.Scheme + '://'+ $rootScope.APIJavaEngine) == 0) {
                //console.log('cancel request url: ' + p.url);
                p.canceller.resolve();
                //p.canceller.reject();
            }
        });
        pending.length = 0;      
    };
})
Array.prototype.diff = function (a) {
    return this.filter(function (i) { return a.indexOf(i) < 0; });
};
btoApp.factory('utilService',
function ($rootScope, $filter, $http, $localStorage, $translate, $locale, $state, $timeout, $q, pendingRequests, $state, $interval) {
    this.mappingObject = {
        "start_age": "_c_age_main",
        "retirement_age": "_c_retirement_main",
        "social_security_age": "age_payout_main",
        "child_age": "_c_age_child_",
        "ind_child_age": "_c_ind_child_",
        "child_gender": "_c_gender_child_",
        "member_size": "_c_household_size",
        "working_size": "_c_household_working",
        "main_gender": "_c_gender_main",
        "main_occupation": "_c_occupation_main",
        "spouse_age": "_c_age_spouse",
        "spouse_gender": "_c_gender_spouse",
        "spouse_occupation": "_c_occupation_spouse"
    }
    this.getProfileMapping = function () {
        var objectMapping = {};
        objectMapping[$rootScope.utilService.mappingObject.start_age] = $rootScope.PersonaPlan.start_age;
        objectMapping[$rootScope.utilService.mappingObject.retirement_age] = $rootScope.PersonaPlan.retirement_age;
        objectMapping[$rootScope.utilService.mappingObject.social_security_age] = $rootScope.PersonaPlan.social_security_age;
        objectMapping[$rootScope.utilService.mappingObject.main_gender] = $rootScope.profile.client.gender ;
        objectMapping[$rootScope.utilService.mappingObject.main_occupation] = $rootScope.profile.client.occupation;
        
        objectMapping["married_status"] = $rootScope.profile.client.married_status;
        objectMapping["number_of_child"] = $rootScope.profile.children.childrens.length;
        var house_size = 1 + $rootScope.profile.children.childrens.length;
        var house_working = 1;
        if ($rootScope.profile.client.married_status > 0) {
            objectMapping[$rootScope.utilService.mappingObject.spouse_occupation] = $rootScope.profile.spouse.occupation == "" ? 0 : parseInt($rootScope.profile.spouse.occupation);
            objectMapping[$rootScope.utilService.mappingObject.spouse_age] = $rootScope.profile.spouse.age;
            objectMapping[$rootScope.utilService.mappingObject.spouse_gender] = $rootScope.profile.spouse.gender ;
            house_size += 1;
            if (objectMapping[$rootScope.utilService.mappingObject.spouse_occupation] > 0) {
                house_working += 1;
            }            
        }
        objectMapping[$rootScope.utilService.mappingObject.member_size] = house_size;
        objectMapping[$rootScope.utilService.mappingObject.working_size] = house_working;
        for (var i = 0; i < $rootScope.profile.children.childrens.length; i++) {
            objectMapping[$rootScope.utilService.mappingObject.child_age + (i + 1)] = $rootScope.profile.children.childrens[i].age;
            objectMapping[$rootScope.utilService.mappingObject.child_gender + (i + 1)] = $rootScope.profile.children.childrens[i].gender ;
            var dependent_reference = "child_" + $rootScope.profile.children.childrens[i].id;
            var lvdepentdent = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.dependent_reference == dependent_reference; });           
            if (lvdepentdent && lvdepentdent.length > 0) {
                objectMapping[$rootScope.utilService.mappingObject.ind_child_age + (i + 1)] = $rootScope.profile.children.childrens[i].age + lvdepentdent[0].starting_age - $rootScope.PersonaPlan.start_age;
            }
        }
        return objectMapping;
    }
    this.translate = function (text, valueObj) {
        // return $filter('translate')(text, valueObj);
        // console.log(text);
        if ($rootScope.translateData) {
            var result = $rootScope.translateData[text];
            return (result === undefined) ? $filter('translate')(text, valueObj) : result.replaceObj(valueObj).toString();
        } else {
            return text.replaceObj(valueObj).toString();
        }
        //return $filter('translate')(text, valueObj);
        
    }
    this.capitalise = function (str) {
        var pieces = str.split(" ");
        for (var i = 0; i < pieces.length; i++) {
            var j = pieces[i].charAt(0).toUpperCase();
            pieces[i] = j + pieces[i].substr(1);
        }
        return pieces.join(" ");
    }
    this.LoadByUser = function (user_id) {
        if (user_id.length > 1) {
            $.ajax({
                method: 'GET',
                async: false,
                url: '/api/PersonaPlan/GET/' + user_id,
                success: function (pl) {
                    $rootScope.currentPlan = pl.currentplan;
                    $rootScope.newPlan = pl.newplan;
                    $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
                    $rootScope.salaryEvolutionAndInflaction = {
                        salaryEvolution: 2.6,
                        inflaction: 2
                    }
                    $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                    $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                    $rootScope.MainResult = pl.result;
                    $rootScope.zoomData.maxAge = $rootScope.PersonaPlan.death_age;
                    $rootScope.zoomData.minAge = $rootScope.PersonaPlan.start_age;
                    $rootScope.zoomData.max = angular.copy($rootScope.PersonaPlan.death_age);
                    $rootScope.zoomData.min = angular.copy($rootScope.PersonaPlan.start_age);
                  
                    $rootScope.ReloadSolutionWork();
                    if ($rootScope.isRefresh != true) {
                        $rootScope.SendingScreenSharingDataObject(pl, 'tab', 'loadsolution_reload', 'Solution');
                    }
                    else $rootScope.isRefresh = false;

                }
            })
        }
    }
    $rootScope.successMessage = {
        show: false,
        message: ''
    }
    // warning message
    $rootScope.warningMessage = {
        show: false,
        message: ''
    }
    // error message
    $rootScope.errorMessage = {
        show: false,
        message: ''
    }
    // error message
    $rootScope.infoMessage = {
        show: false,
        message: ''
    }
    this.loadData = function ($rootScope) {
        if ($rootScope.PersonaPlan.user_id.length > 1) {
            $.ajax({
                method: 'GET',
                async: false,
                url: '/api/PersonaPlan/GET/' + $rootScope.PersonaPlan.user_id,
                success: function (pl) {
                    $rootScope.currentPlan = pl.currentplan;
                    $rootScope.newPlan = pl.newplan;
                    $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
                    $rootScope.zoomData.maxAge = $rootScope.PersonaPlan.death_age;
                    $rootScope.zoomData.minAge = $rootScope.PersonaPlan.start_age;
                    $rootScope.zoomData.max = angular.copy($rootScope.PersonaPlan.death_age);
                    $rootScope.zoomData.min = angular.copy($rootScope.PersonaPlan.start_age);
                    $rootScope.MCTopValue = {
                        selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
                    }
                    $rootScope.MCBottomValue = {
                        selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
                    }
                    $rootScope.salaryEvolutionAndInflaction = {
                        salaryEvolution: 2.6,
                        inflaction: 2
                    }
                    $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                    $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                    $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
                    $rootScope.MainResult = pl.result;
                }
            })
        }
    }

    this.compareTimeWithDelay = function (compare1, compare2, timedelay) {
        if (compare1 != undefined) {
            var currentDate = parseFloat(compare2.valueOf());
            var previousTime = parseFloat(compare1.valueOf()) + parseFloat(timedelay);
            if (currentDate > previousTime) {
                return true;
            }
        }
        else return true;
        return false;
    }
    this.range = function (min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    }

    this.stateReload = function () {
        $state.reload();
    }

    this.stateGo = function (stateName, stateParams) {
        $state.go(stateName);
    }
    this.timeoutScopeApply = null;
    this.scopeApply = function (id) {
        var self = this;
        if (angular.isUndefined(id)) {
            $timeout.cancel(this.timeoutScopeApply);
            this.timeoutScopeApply = $timeout(function () {
                $timeout(function () {
                    $rootScope.$apply();
                }, 100);
                $timeout(function () {
                    if ($rootScope.scope != null)
                        $rootScope.scope.$apply();
                }, 300)
                self.timeoutScopeApply = null;
            }, 500)
        } else {
           $timeout.cancel(this.timeoutScopeApply);
            this.timeoutScopeApply = $timeout(function () {
                var element = angular.element(document.querySelector('#' + id));
                var scope = angular.element(element).scope();
                if(scope) scope.$apply();
                self.timeoutScopeApply = null;
            }, 100);
        }
    } 
    this.UnbindControl =  function () {
        $('#Okbtndialog').unbind('click');
        $('#OkConfirm').unbind('click');
        $('#CancelConfirm, #CancelConfirmSymbol').unbind('click');
        $('#input_rename_unit_work').val('');
        $('#confirmdialogbodyContent').html('');
        $('#input_rename_unit_work').removeAttr('placeholder');
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
    }

    this.showInfoMessageObj = null;
    this.showInfoMessage = function (message) {       
        $timeout.cancel(this.showInfoMessageObj);
        $rootScope.infoMessage.show = true;
        $rootScope.infoMessage.message = message;
        $timeout.cancel(this.showInfoMessageObj);
        this.showInfoMessageObj = $timeout(function () {
            $rootScope.infoMessage.show = false;
        }, 3000);
    }
           
    this.callApi = function (method, url, header, data, callbackSuccess, callbackFail, callbackError) {
        var canceller = $q.defer();
        pendingRequests.add({
            url: url,
            canceller: canceller
        });
        var self = this;
        this.showLoading();
        $http({
            method: method, url: url, header: header, data: data, timeout: canceller.promise
        }).then(function (response) {          
            if (response.status == 408)
                window.location.href = '/Account/LogOff';
            if (angular.isDefined(callbackSuccess)) callbackSuccess(response.data, response.headers);
            //if (angular.isDefined(callbackFail)) callbackFail({ });
        }, function (response) {
            if (response.status == 408 && response.data == 'BTOAPIActionFilter')
                window.location.href = '/Account/LogOff';
            self.hideLoading();
            if (angular.isDefined(callbackError)) callbackError(response);
        }).finally(function () {
            pendingRequests.remove(url);
        });
    }
    this.callEngineConfig = {
        interval: null,
        isCallApi: false,
        requests: []
    };
    this.callEngineApi = function (method, url, header, data, callbackSuccess, callbackFail, callbackError) {
        var self = this;
        console.log('callEngineApi :');
        this.callEngineConfig.requests.unshift({
            'method': method,
            'url': $rootScope.Scheme + '://' + $rootScope.APIJavaEngine + url,
            'header': header,
            'data': data,
            'callbackSuccess': callbackSuccess,
            'callbackFail': callbackFail,
            'callbackError': callbackError
        });
        if (this.callEngineConfig.interval == null) {
            this.callEngineConfig.interval = $interval(function () {
                //console.log('Interval to send request');
                if (self.callEngineConfig.requests.length > 0 && !self.callEngineConfig.isCallApi) {
                    var requestData = self.callEngineConfig.requests.shift();
                    // Call API
                    self.showLoading();
                    self.callEngineConfig.isCallApi = true;
                    $http({
                        method: requestData.method,
                        url: requestData.url,
                        header: requestData.header,
                        data: requestData.data
                    }).then(function (response) {
                        self.callEngineConfig.isCallApi = false;
                        if (angular.isDefined(requestData.callbackSuccess)) requestData.callbackSuccess(response.data, response.headers);
                    }, function (response) {
                        self.hideLoading();
                        self.callEngineConfig.isCallApi = false;
                        if (angular.isDefined(requestData.callbackError)) requestData.callbackError(response);
                    });
                    $interval.cancel(self.callEngineConfig.interval);
                    self.callEngineConfig.interval = null;
                    self.callEngineConfig.requests = [];
                }
            }, 200)
        }
    }

    this.callApiByAjax = function (method, url, data, callbackSuccess, callbackFail, callbackError) {
        var self = this;
        this.showLoading();
        $.ajax({
            method: method, async: false, url: url, data: data, success: function (response) {
                if (response.status == 408)
                    window.location.href = '/Account/LogOff';
                if (angular.isDefined(callbackSuccess))
                    callbackSuccess(response);
            }
        });
    }

    this.showLoading = function () {
      
    }
    this.hideLoading = function () {
       
    }

    this.changeCurrency = function (currency) {
        
    }

    this.listLanguage = [
        { "code": "en", "name": "English", "currency": "SGD" },
        { "code": "ma", "name": "Mandarin", "currency": "CNY" },
        { "code": "hi", "name": "Hindu", "currency": "INR" },
        { "code": "ml", "name": "Malay", "currency": "MYR" },
        { "code": "sp", "name": "Spanish", "currency": "EUR" },
        { "code": "fr", "name": "French", "currency": "EUR" },
        { "code": "ge", "name": "German", "currency": "EUR" }
    ];
    this.selectedLanguage = { "code": "ma", "name": "Mandarin", "currency": "CNY" };
    $localStorage.languageCode = (($localStorage.languageCode == 'undefined') ? 'en' : $localStorage.languageCode);
    this.selectedLanguage.code = $localStorage.languageCode;

    this.changeLanguage = function (language) {        
        $translate.use(language.code);        
    }
        
    this.changeLanguageSuccess = function (language) {
        // console.log('changeLanguageSuccess');
        var self = this;
        $localStorage.languageCode = language.language;
        angular.forEach(this.listLanguage, function (item) {          
            if (item.code == language.language) {
                self.selectedLanguage = item;             
            }
        });
        // Change language of chart on theme 3
        $timeout(function () {
            try { $rootScope.savingRate.changeLanguageOfChart(); } catch (ex) { }
            try { $rootScope.investment.changeLanguageOfChart(); } catch (ex) { }
            try { $rootScope.illiquidAsset.changeLanguageOfChart(); } catch (ex) { }
            //try { $rootScope.timelineService.renderTimeLine(); } catch (ex) { }
            try { $rootScope.quickSettingService.changeLanguage(); } catch (ex) { }
        }, 2000);
        var callbackOK = function () {
            //$rootScope.Settings.isAjaxInstantRequest = true;
            //$rootScope.requestSaveAndUpdateScreen();
            $rootScope.PersonaPlan.currency_code = angular.copy(self.selectedLanguage.currency);
            $locale.NUMBER_FORMATS.CURRENCY_SYM = self.selectedLanguage.currency + ' ';
            $timeout(function () {

                //$state.reload();
                //$rootScope.$apply();
                self.stateReload();
                self.scopeApply();

                $rootScope.utilService.showSuccessMessage($rootScope.utilService.translate("Currency has been changed!"));
            }, 2000)
        };

        if ($rootScope.languageFirstLoad == false) {
            if (self.selectedLanguage.currency != $rootScope.PersonaPlan.currency_code) {
                this.ShowDialog($rootScope, this.translate("Confirm"),
                    this.translate("Language was changed successful." +'<br/>'+this.translate("After change language, do you want to change currency to {{currency}} ?",
                    self.selectedLanguage)), this.translate("Yes"), callbackOK, this.translate("No"));
              //$state.reload();               
              self.stateReload();
              }

            //$timeout(function () {
            $rootScope.timelineService.changeTextOfTimeline();
            //}, 500);
        } else {
            //$timeout(function () {            
            $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.PersonaPlan.currency_code + ' ';
            $rootScope.timelineService.changeTextOfTimeline();
            //}, 500);
        }

        $rootScope.languageFirstLoad = false;
        //console.timeEnd('btoApp');
    }

    this.loadCurrentLanguage = function () {
        var self = this;
        angular.forEach(this.listLanguage, function (item) {
            if (item.code == $localStorage.languageCode) {
                self.selectedLanguage = item;
            }
        });       
                $translate.use(self.selectedLanguage.code);        
    }
    /*
 Begin  Delete


 just push here for display control, and will delete after Nghia finished his task  
*/
    this.getRickGaugeCharConfigtData = function () {
        var result = {
            min: 0,
            max: 30,
            gaps: [
                [20, 12],
                [20, 8]
            ],
            specialValues: {
                16: { text: this.translate('US STOCKS – 16%'), color: '#C62828' },
                18: { text: this.translate('FOREIGN DEVELOPED STOCKS – 18%'), color: '#C62828' },
                24: { text: this.translate('EMERGING MARKET STOCKS – 24%'), color: '#C62828' },
                14: { text: this.translate('DIVIDEND GROWTH STOCKS – 14%'), color: '#C62828' },
                5: { text: this.translate('US GOVERNMENT BONDS – 5%'), color: '#C62828' },
                5: { text: this.translate('CORPORATE BONDS – 5%'), color: '#C62828' },
                7: { text: this.translate('EMERGING MARKET BONDS– 7%'), color: '#C62828' },
                5: { text: this.translate('MUNICIPAL BONDS – 5%'), color: '#C62828' },
                5: { text: this.translate('TIPS – 5% (Treasury Inflation Protected Securities)'), color: '#C62828' },
                18: { text: this.translate('REAL ESTATE – 18%'), color: '#C62828' },
                22: { text: this.translate('NATURAL RESOURCES – 22%'), color: '#C62828' }
            },
            colors: {
                0: '#9E9E9E',
                16.67: '#FFC107',
                33.33: '#2196F3',
                50: '#009688',
                66.67: '#9C27B0',
                83.333: '#F44336'
            },
            angles: [
                150,
                390
            ],
            lineWidth: 10,
            arrowWidth: 20,
            arrowColor: '#4FC3F7',
            inset: true
        };
        return result;
    }

    this.getRickAndRickReturnTableCharConfigtData = function () {
        var rickConfigData = this.getRickGaugeCharConfigtData();
        var result = {
            min: rickConfigData.min,
            max: rickConfigData.max,
            specialValues: rickConfigData.specialValues,
            x_title: this.translate('Risk'),
            y_title: this.translate('Expected return'),
            line: {
                linearPortion: 0.4082,
                lineWidth: 8,
                lineColor: '#1976D2'
            },
            rect: {
                fillColor: '#CFD8DC',
                borderWidth: 1,
                borderColor: '#616161'
            },
            valueData: {
                color: '#33691E',
                width: 14
            }
        }
        return result;
    }

    this.UpdatePurchaseAgeExistanceDream = function ($rootScope) {
        //this function used only when change start age of PersonaPlan
        angular.forEach($rootScope.PersonaPlan.dreams, function (dream) {
            if (dream.existant == true) {
                dream.purchase_age = $rootScope.PersonaPlan.start_age;
            }
        });
    }
    this.UpdateDreamLifeEventToExisting = function ($rootScope,currentAge) {
        angular.forEach($rootScope.PersonaPlan.dreams, function (dream) {
            if (dream.purchase_age < currentAge) {
                dream.purchase_age = currentAge;
                dream.existant = true;
            }
        });
        angular.forEach($rootScope.PersonaPlan.lifeEvent, function (lifeEvent) { 
            if (lifeEvent.starting_age < currentAge) {
                lifeEvent.starting_age = currentAge;
                lifeEvent.existant = true;
            }
        });
    }
    //for timeline themes 1
    this.updateDefaultValueOfDream = function ($rootScope,isExistant) {
        console.log('updateDefaultValueOfDream');
        $rootScope.DreamTypes = angular.copy($rootScope.backupDreamType);
        angular.forEach($rootScope.DreamTypes, function (dream) {
            angular.forEach(dream.dreamTypeConfig, function (config) {
                if (config.datatype.indexOf('decimal') >= 0) {
                    config.value = parseFloat(config.default_value);
                }
                else if (config.datatype.indexOf('bit') >= 0) {
                    config.value = (config.default_value === 'true');                    
                    if (config.field_name == 'existant' && isExistant==true) {
                        config.value = isExistant;                        
                    }
                    $rootScope.selectedDream.existant = config.value;
                }
                else {
                    config.value = config.default_value;
                }

                if (config.dream_type_id == 1 && config.field_name == 'total_cost') {
                    $rootScope.dreamOrLifeData.residence_purchase_total_cost = config.value;
                } else if (config.dream_type_id == 4 && config.field_name == 'value') {
                    $rootScope.dreamOrLifeData.residence_sale_value = config.value;
                }
            })
        });
    }
    this.updateSelectedDreamType = function (type, isUpdate) {
        var _self = this;
        // get dream type
        if (angular.isUndefined(isUpdate) || isUpdate == false) {
            $rootScope.selectedDreamtype = null;
            var dream_type_length = $rootScope.DreamTypes == null ? 0 : $rootScope.DreamTypes.length;
            for (var i = 0; i < dream_type_length; i++) {
                if ($rootScope.DreamTypes[i].type == type) {
                    $rootScope.selectedDreamtype = $rootScope.DreamTypes[i];
                    break;
                }
            }
        }

        // Update title and star age or purchage age
        angular.forEach($rootScope.DreamTypes, function (dream) {
            var count = 1;
            var max_id = 0;
            angular.forEach($rootScope.PersonaPlan.dreams, function (item) {
                if (item.dream_type.id == dream.id) {
                    var name = item.name;
                    name = name.substr(item.dream_type.dream_name.length + 1);
                    try {
                        name = parseInt(name);
                        if (name > max_id) { max_id = name; }
                    } catch (ex) { }
                }
            });
            angular.forEach($rootScope.PersonaPlan.lifeEvent, function (item) {
                if (item.dream_type.id == dream.id) {
                    var name = item.name;
                    name = name.substr(item.dream_type.dream_name.length + 1);
                    try {
                        name = parseInt(name);
                        if (name > max_id) { max_id = name; }
                    } catch (ex) { }
                }
            });
            max_id++;

            angular.forEach(dream.dreamTypeConfig, function (item) {
                if (item.field_name == 'name') {
                    if (angular.isUndefined(isUpdate) || isUpdate == false) {
                        item.value = item.value + ' ' + max_id;
                    }
                } else if (item.field_name == 'purchase_age') {
                    if (angular.isUndefined(isUpdate) || isUpdate == false) {
                        item.value = $rootScope.timelineDropYear;
                    }
                } else if (item.field_name == 'starting_age') {
                    if (angular.isUndefined(isUpdate) || isUpdate == false) {
                        item.value = $rootScope.timelineDropYear;
                    }
                } else if (item.field_name == 'selected_residence') {
                    if (angular.isDefined(isUpdate) && isUpdate == true) {
                        _self.updateResidenceSale(dream.dreamTypeConfig, undefined, true);
                    } else {
                        _self.updateResidenceSale(dream.dreamTypeConfig, $rootScope.timelineDropYear, false);
                    }
                }
            });
        });
    }
    this.updateResidenceSale = function (residenceSale, isUpdateMode) {
        var self = this;
        var starting_age = residenceSale.starting_age;
        if (angular.isUndefined(residenceSale.config_data)) {
            residenceSale.config_data = {};
        }
        if (angular.isDefined(isUpdateMode) && isUpdateMode == true) {
            residenceSale.config_data['is_edit'] = true;
        } else {
            residenceSale.config_data['is_edit'] = false;
        }
        
        var listResidence = [], iCountExisting = 0, idExistDream;
        angular.forEach($rootScope.PersonaPlan.dreams, function (item) {
            // if residence purchase
            if (item.dream_type_id == 1) {
                if (item.purchase_age <= starting_age) {
                    var residence = {
                        'id': item.id,
                        'label': item.name
                    };
                    // check residence purchase was saled
                    var isResidenceWasSaled = false;
                    angular.forEach($rootScope.PersonaPlan.lifeEvent, function (event) {
                        if (item.id == event.dream_id) {
                            if (!residenceSale.config_data.is_edit || item.id != residenceSale.dream_id) {
                                isResidenceWasSaled = true;
                            }
                        }
                    });
                    if (!isResidenceWasSaled) {
                        // Check existing and not rent
                        if (item.existant == true && item.is_rent == false) {
                            iCountExisting += 1;
                            idExistDream = item.id;
                        }
                        listResidence[listResidence.length] = residence;
                    }
                }
            }
        });
        // If have only one exist and not rent then remove this item
        if (iCountExisting == 1) {
            for (var i = 0; i < listResidence.length; i++) {
                if (listResidence[i].id == idExistDream) {
                    listResidence.splice(i, 1);
                    break;
                }
            }
        }
        residenceSale.config_data['resident_purchase_list'] = listResidence;
        if (!residenceSale.config_data.is_edit) {
            if (listResidence.length > 0) {
                residenceSale.selected_residence = listResidence[0].id;
            } else {
                residenceSale.selected_residence = null;
            }
        } else {
            if (listResidence.length > 0) {
                // check residence select is on list of residence purchase
                var check_exist = false;
                angular.forEach(listResidence, function (item) {
                    if (item.id == residenceSale.selected_residence) {
                        check_exist = true;
                    }
                })
                if (!check_exist) {
                    residenceSale.selected_residence = listResidence[0].id;
                }
            } else {
                residenceSale.selected_residence = null;
            }
        }
    }
    
    this.updateChildIndependent = function (childIndependent, isUpdateMode) {
        var self = this;
        var starting_age = childIndependent.starting_age;
        if (angular.isUndefined(childIndependent.config_data)) {
            childIndependent.config_data = {};
        }
        if (angular.isDefined(isUpdateMode) && isUpdateMode == true) {
            childIndependent.config_data['is_edit'] = true;
        } else {
            childIndependent.config_data['is_edit'] = false;
        }
        // Get all child not independent
        var childMembersFilter = [];
        var countChild = 0;
        angular.forEach($rootScope.profile.children.childrens, function (child) {
            countChild++;
            var childData = angular.copy(child);
            childData.index = countChild;
            childData.id = 'child_' + childData.id;
            if (childData.name == null || childData.name == '') {
                childData.childName = 'Child ' + countChild;
            } else {
                childData.childName = childData.name;
            }
            if (!childData.independent) {
                childMembersFilter.push(childData);
            }
            
        });
        
        // check child member filter have child independent
        if (childMembersFilter.length > 0) {
            angular.forEach($rootScope.PersonaPlan.lifeEvent, function (lifeEvent) {
                if (lifeEvent.dependent_reference != null && lifeEvent.dependent_reference.indexOf('child_') >= 0) {
                    for (var i = childMembersFilter.length - 1 ; i >= 0; i--) {
                        if (childMembersFilter[i].id == lifeEvent.dependent_reference) {
                            if (childIndependent.config_data.is_edit && childIndependent.dependent_reference == lifeEvent.dependent_reference) {
                            } else {
                                childMembersFilter.splice(i, 1);
                            }
                        }
                    }
                }
            });
        }
        childIndependent.config_data['childMembers'] = childMembersFilter;

        if (!childIndependent.config_data.is_edit) {
            if (childMembersFilter.length > 0) {
                // Update Default value
                childIndependent.dependent_reference = childMembersFilter[0].id;
                this.selectChildMemberInChildIndependent(childIndependent);
            }
        } else {
            if (childMembersFilter.length > 0) {
                var index = null;
                for (var i = 0; i < childMembersFilter.length; i++) {
                    if (childMembersFilter[i].id == childIndependent.dependent_reference) {
                        index = i;
                        break;
                    }
                }
                if (index != null) {
                    //console.log(childIndependent.starting_age);
                    if (childIndependent.starting_age != 200) {
                        var age_dependent = 0;
                        childIndependent.age_dependent = childIndependent.starting_age - $rootScope.PersonaPlan.start_age + childMembersFilter[index].age;
                    } else {
                        childIndependent.age_dependent = null;
                    }
                    childIndependent.yearly_cost_reduction = this.calculateExpenseOfChild(childMembersFilter[index].index) * 12;
                    childIndependent.config_data.ageRange = this.range(Math.max(16, childMembersFilter[index].age), 25);
                }
            }
        }
    }

    this.selectChildMemberInChildIndependent = function (childIndependent) {
        console.log(childIndependent);
        if (childIndependent.config_data.childMembers.length > 0) {
            for (var i = 0; i < childIndependent.config_data.childMembers.length; i++) {
                if (childIndependent.config_data.childMembers[i].id == childIndependent.dependent_reference) {
                    if (!childIndependent.config_data.is_edit) {
                        if (childIndependent.config_data.childMembers[i].name != null && childIndependent.config_data.childMembers[i].name != '') {
                            if (!childIndependent.config_data.is_change_value) {
                                childIndependent.name = childIndependent.config_data.childMembers[i].childName + ' Independent';
                            }
                        }
                    }
                    var childIndex = childIndependent.config_data.childMembers[i].index;
                    eval("childIndependent.age_dependent = $rootScope.cashFlow.parameter._c_ind_child_" + childIndex + ";");
                    childIndependent.starting_age = $rootScope.PersonaPlan.start_age + childIndependent.age_dependent - childIndependent.config_data.childMembers[i].age;                    
                    childIndependent.yearly_cost_reduction = this.calculateExpenseOfChild(childIndex) * 12;
                    childIndependent.config_data.ageRange = this.range(Math.max(16, childIndependent.config_data.childMembers[i].age), 25);
                    break;
                }
            }
        }
    }

    this.extractDreamOrLifeEvent = function (dreamOrLifeEvent) {
        delete dreamOrLifeEvent['orginal_name'];
        delete dreamOrLifeEvent['config_data'];
        delete dreamOrLifeEvent['dream_type'];
        if (dreamOrLifeEvent.dream_type_id == 4) {
            dreamOrLifeEvent.dream_id = dreamOrLifeEvent.selected_residence;
            delete dreamOrLifeEvent['selected_residence'];
        }
    }
    
    this.updateEducation = function (educationDream, isUpdateMode) {
        var self = this;
        var purchase_age = educationDream.purchase_age;
        if (angular.isUndefined(educationDream.config_data)) {
            educationDream.config_data = {};
        }
        if (angular.isDefined(isUpdateMode) && isUpdateMode == true) {
            educationDream.config_data['is_edit'] = true;
        } else {
            educationDream.config_data['is_edit'] = false;
        }
        // Update family member and duration
        educationDream.config_data.familyMembers = $rootScope.familyMembers;
        educationDream.config_data.durationRange = this.range(1, 30);

    }

    this.updateResidencePurchase = function (residencePurchase, isUpdateMode) {
        var self = this;
        var purchase_age = residencePurchase.purchase_age;
        if (angular.isUndefined(residencePurchase.config_data)) {
            residencePurchase.config_data = {};
        }
        if (angular.isDefined(isUpdateMode) && isUpdateMode == true) {
            residencePurchase.config_data['is_edit'] = true;
        } else {
            residencePurchase.config_data['is_edit'] = false;
        }
        // Update  duration residence type
        residencePurchase.config_data.durationRange = this.range(0, 30);
        residencePurchase.config_data.residentialTypes = angular.copy($rootScope.residentialType);
        
        residencePurchase.config_data.isShowDreamRental = false;
        if (angular.isDefined(isUpdateMode) && isUpdateMode) {
            //console.log('enable or disable rental check box');
        } else {
            if (residencePurchase.config_data.residentialTypes.length > 0) {
                //console.log(residencePurchase.residential_type, residencePurchase.name);
                if (angular.isUndefined(residencePurchase.config_data.is_duplicate)) {
                    residencePurchase.name = this.initNameOfDreamOrLifeEvent(residencePurchase.dream_type_id, residencePurchase.config_data.residentialTypes[0].name);
                }
            }
        }
        
    }

    this.HideDialog = function () {
        $('#confirmdialog').modal('hide');
    }
    this.HideRenameDialog = function () {
        $('#renamedialog').modal('hide');
    }
    this.HideScenarioDialog = function () {
        $('#manageScenario').modal('hide');
    }
    this.ShowDialog = function ($rootScope, title, content, OkText, okcallback, CancelText, callbackCancel) {
        
        var self = this;
        $rootScope.confirmdialog = {};
        $rootScope.confirmdialog.title = title.toString();
        $rootScope.confirmdialog.content = content.toString();
      
        $('#OkConfirm').hide();
        $('#CancelConfirm').hide();
        $rootScope.confirmdialog.cancelText = '';
        if ((CancelText != undefined) && (CancelText != '')) {
            $rootScope.confirmdialog.cancelText = CancelText.toString();
            $('#CancelConfirm').show();
        }
        else
            $rootScope.confirmdialog.cancelText = '';
        $rootScope.confirmdialog.OkText = '';
        if ((OkText != undefined) && (OkText != '')) {
            $rootScope.confirmdialog.OkText = OkText.toString();
            $('#OkConfirm').show();
        }
        else
            $rootScope.confirmdialog.OkText = '';
        $('#confirmdialog').attr('aria-hidden', true);
        $('#confirmdialog').modal({ backdrop: 'static', keyboard: false });
        $('#confirmdialogbodyContent').html(content);
        $('#OkConfirm').bind('click', function () {
            if (okcallback != undefined)
                okcallback();
            self.UnbindControl();
        });
        $('#CancelConfirm, #CancelConfirmSymbol').bind('click', function () {
            if (callbackCancel != undefined)
                callbackCancel();
            self.UnbindControl();
            $rootScope.SendingScreenSharingDataObject('', 'tab', 'CancelConfirm', 'Scenario');
        });       
    }
    this.ShowDialogRename = function ($rootScope,title, messenge, callback) {
        //$rootScope.renamedialog = {};
        $rootScope.renamedialog.title = title.toString();
        $rootScope.renamedialog.messenger = messenge.toString();
        $('#renamedialog').modal({ backdrop: 'static', keyboard: false });
        //$('#renamedialog').modal({ backdrop: 'static'});
        $('#OkRename').bind('click', function () {
            if (callback != undefined)
                callback();
            $('#OkRename').unbind('click');
            $('#CancelRename').unbind('click');
        });
        $('#CancelRename').bind('click', function () {
            $('#OkRename').unbind('click');
            $('#CancelRename').unbind('click');
            $rootScope.SendingScreenSharingDataObject('', 'tab', 'close_sub_dialog', 'Solution');
        });
    }
    this.UnbindControl = function () {
        $('#Okbtndialog').unbind('click');
        $('#OkConfirm').unbind('click');
        $('#CancelConfirm, #CancelConfirmSymbol').unbind('click');
        
        $('#input_rename_unit_work').val('');
        $('#confirmdialogbodyContent').html('');
        $('#input_rename_unit_work').removeAttr('placeholder');
    }
    this.addHighLightClassforProgressbar = function(id){
        $('#' + id).find('.bto-bar-wrapper').addClass('activeBorder');
    }
    this.removeHighLightClassforProgressbar = function (id) {
        $('#' + id).find('.bto-bar-wrapper').removeClass('activeBorder');
    }
    this.addHighLightClassforDirectId = function(id){
        $('#' + id).addClass('activeBorder');
    }
    this.removeHighLightClassforDirectId = function (id) {
        $('#' + id).removeClass('activeBorder');
    }
    this.removeAllHighLightClassWhenFinish = function(){
        this.removeHighLightClassforProgressbar('incomeExpensebar');
        this.removeHighLightClassforProgressbar('expenseAtRetirement');
    }
    this.leep = function (milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }
    this.getMaxStartAge = function($rootScope) {
        var max = 70;//default;
        if (max > $rootScope.PersonaPlan.retirement_age)
            max = $rootScope.PersonaPlan.retirement_age;
        if (max > $rootScope.PersonaPlan.social_security_age) {
            max = $rootScope.PersonaPlan.social_security_age;
        }
        for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
            if (max > $rootScope.PersonaPlan.dreams[i].purchase_age && $rootScope.PersonaPlan.dreams[i].existant==false)
                max = $rootScope.PersonaPlan.dreams[i].purchase_age;
        }
        for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
            if (max > $rootScope.PersonaPlan.lifeEvent[i].starting_age)
                max = $rootScope.PersonaPlan.lifeEvent[i].starting_age;
        }
        return max;
    }

    this.findObjById = function (id) {
        var target = angular.element('#' + id);
        return target;
    }

    this.findKeyOfParamenter = function (param_id) {
        var keys = Object.keys($rootScope.dynamicConponent);
        var resultKeys = [];
        angular.forEach(keys, function (key) {
            var comData = $rootScope.dynamicConponent[key];            
            if (comData.params == param_id || (angular.isArray(comData.params) && comData.params.indexOf(param_id) > -1)) {
                resultKeys.push(key);
            }
        });
        return resultKeys;
    }

    this.updateMainResultFromPlayerData = function () {       
        if ($rootScope.playBackPlayerData.data!= null && angular.isDefined($rootScope.playBackPlayerData.data.basic)) {
            $rootScope.MainResult = $rootScope.playBackPlayerData.data.basic;
        } else if ($rootScope.playBackPlayerData.data != null && angular.isDefined($rootScope.playBackPlayerData.data.broken_age)) {
            $rootScope.MainResult = $rootScope.playBackPlayerData.data;
        }
    }

    this.roundNumber = function (number, decimal) {
        if (angular.isUndefined(decimal)) decimal = 2;
        var result = parseFloat(number);
        if (isNaN(result)) {
            return 0;
        } else {
            result = result.toFixed(decimal);
            result = parseFloat(result);
            return result;
        }
    }

    this.calculateExpenseOfChild = function (childIndex) {
        var result = 0;
        var recursiveFunction = function (expense) {
            var recResult = 0;
            if (expense.name.indexOf('child_' + childIndex) >= 0 && (expense.children == null || expense.children.length == 0)) {
                
                recResult += expense.value;
            }
            for (var i = 0; i < expense.children.length; i++) {
                recResult += recursiveFunction(expense.children[i])
            }
            return recResult;
        }
        //var json = JSON.stringify($rootScope.cashFlow.expense[1]);
        //console.log(json);
        for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
            result += recursiveFunction($rootScope.cashFlow.expense[i]);
        }
        // console.log(childIndex, result);
        return result;
    }

    this.checkEqualLifeEvent = function (lifeEvent1, lifeEvent2) {
        var keys = Object.keys(lifeEvent1);
        var exclude = ['dream_type', 'dream_type_id', 'persona_plan_id', 'dependent_reference', 'dream_id', 'starting_year', 'ranking_index', '$$hashKey', 'photo_path', 'photoContent', 'yearly_cost_reduction'];
        var checkFields = keys.diff(exclude);
        var result = true;
        angular.forEach(checkFields, function (key) {            
            if (lifeEvent1[key] != lifeEvent2[key]) {
                result = false;
            }
        });
        return result;
    }

    this.checkEqualDream = function (dream1, dream2) {
        var keys = Object.keys(dream1);
        var exclude = ['dream_type', 'dream_type_id', 'persona_plan_id', 'is_living', 'residential_type', 'dependent_reference', 'purchase_year', 'sell_year', 'sell_age', 'ranking_index', '$$hashKey', 'photo_path', 'photoContent'];
        var checkFields = keys.diff(exclude);        
        var result = true;
        angular.forEach(checkFields, function (key) {            
            if (dream1[key] != dream2[key]) {                
                result = false;
            }
        });
        return result;
    }

    this.checkEqualProfile = function (profile1, profile2) {
        var result = true;

        // check client
        var keys = Object.keys(profile1.client);
        var exludeFields = ['avatar', 'email', 'first_name', 'isChanged', 'isChangedStartAge', 'last_name', 'nationality', 'phone_code', 'phone_number', 'spouse_avatar', 'viewed_tutorial'];
        var checkFields = keys.diff(exludeFields);
        var result = true;
        angular.forEach(checkFields, function (key) {
            if (profile1.client[key] != profile2.client[key]) {
                result = false;
            }
        });
        if (!result) return result;

        // check spouse
        keys = Object.keys(profile1.spouse);
        exludeFields = ['first_name', 'last_name', 'nationality'];
        checkFields = keys.diff(exludeFields);
        var result = true;
        angular.forEach(checkFields, function (key) {
            if (profile1.spouse[key] != profile2.spouse[key]) {
                result = false;
            }
        });
        if (!result) return result;

        // check children
        if (profile1.children.number_of_child != profile2.children.number_of_child) {
            return false;
        } else if (profile1.children.number_of_child > 0) {
            for (var i = 0; i < profile1.children.number_of_child; i++) {
                keys = Object.keys(profile1.children.childrens[i]);
                exludeFields = ['handicapped', 'independent', 'name'];
                checkFields = keys.diff(exludeFields);
                angular.forEach(checkFields, function (key) {
                    if (profile1.children.childrens[i][key] != profile2.children.childrens[i][key]) {
                        result = false;
                    }
                });
            }
        }        
        return result;
    }
    this.calculateData = {
        isCalculating: false,
        isFinished: false
    }
    this.hideMonteCarloProgressBarTimeout = null;
    this.hideSuccessProgressBarTimeout = null;
    this.ShowMonteCarloProgressBar = function () {
        //var self = this;
        $timeout.cancel(this.hideMonteCarloProgressBarTimeout);
        $timeout.cancel(this.hideSuccessProgressBarTimeout);
        this.calculateData.isCalculating = true;
        //$timeout(function () {
        //    self.calculateData.isCalculating = true;
        //    /*
        //    if ($('#progress-popup').css('display') === 'none') {
        //        $("#progress-popup .progress").removeClass("success");
        //        $("#progress-popup").slideToggle();
        //        $('.progress-bar').width(0);
        //    }
        //    */
        //}, 500);
    }
    this.HideMonteCarloProgressBar = function () {
        //console.log('HideMonteCarloProgressBar');
        var self = this;
        /*
        if ($('#progress-popup').css('display') === 'none') {
            return;
        }
        $("#progress-popup .progress").addClass("success");
        */
        this.hideMonteCarloProgressBarTimeout = $timeout(function () {
            //console.log('Start HideMonteCarloProgressBar');
            //$("#progress-popup").slideUp();
            self.calculateData.isCalculating = false;
            self.calculateData.isFinished = true;
            self.hideSuccessProgressBarTimeout = $timeout(function () {
                self.calculateData.isFinished = false;
            }, 2000);
        }, 200);
    }
    $rootScope.headerMessageData = {
        title: {
            message: null,
            jsonObj: null
        },
        description: {
            message: null,
            jsonObj: null
        },
        //message: null,
        //jsonObj: null,
        /* type can be: 
            1.     Critical or high alerts and errors
            2.     Benefits or consequences
            3.     Quick help
            4.     Medium or low alerts and errors
            5.     News or updates
        */
        type: null,
        quickHelpId: null,
        
    }
    this.timeoutUpdateHeaderMessage = null;
    this.updateHeaderMessage = function (titleData, descriptionData, type) {
        $timeout(function () {
            $('#navbar-message-description').tooltip();
        }, 5000)
        
        var self = this;
        $timeout.cancel(this.timeoutHildeQuickHep);
        $timeout.cancel(this.timeoutUpdateHeaderMessage);
        $rootScope.headerMessageData.quickHelpId = null;
        this.timeoutUpdateHeaderMessage = $timeout(function () {
            $rootScope.headerMessageData.title.message = titleData.message;
            $rootScope.headerMessageData.title.jsonObj = titleData.jsonObj;
            if (angular.isDefined(descriptionData) && descriptionData != null) {
                if (angular.isDefined(descriptionData.message)) {
                    $rootScope.headerMessageData.description.message = descriptionData.message;
                } else {
                    $rootScope.headerMessageData.description.message = null;
                }
                if (angular.isDefined(descriptionData.jsonObj)) {
                    $rootScope.headerMessageData.description.jsonObj = descriptionData.jsonObj;
                }
            }
            $rootScope.headerMessageData.type = type;
            self.scopeApply(); 
        }, 300);
        $rootScope.SendingScreenSharingDataObject($rootScope.headerMessageData, 'utilService', 'updateHeaderMessage');
    }

    this.showQuickHelpMessage = function (message, jsonObj, quickHelpId) {
        $timeout.cancel(this.timeoutHildeQuickHep);
        if ($rootScope.headerMessageData.quickHelpId != quickHelpId) {
            $rootScope.backupHeaderMessageData = angular.copy($rootScope.headerMessageData);
            this.updateHeaderMessage({ message: message, jsonObj: jsonObj }, null, 3);
            $rootScope.headerMessageData.quickHelpId = quickHelpId;
        }
    }
    this.timeoutHildeQuickHep = null;
    this.hideQuickHelpMessage = function () {
        var self = this;
        console.log('hideQuickHelpMessage');
        this.timeoutHildeQuickHep = $timeout(function () {
            $rootScope.headerMessageData = angular.copy($rootScope.backupHeaderMessageData);
            self.scopeApply();
        }, 5000)
    }
    this.UpdateControlShareScreen = function (obj) {
        switch (obj.actionEvent) {
            case 'updateHeaderMessage':
                this.updateHeaderMessage(obj.newValue.title, obj.newValue.description, obj.newValue.type);
                break;
            default:
                break;
        }
        
    }

    this.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    this.initDefaultDataOfDreamOrLifeEvent = function (id) {
        var result = null;
        angular.forEach($rootScope.DreamTypes, function (item) {
            if (item.id == id) {
                result = {};
                angular.forEach(item.dreamTypeConfig, function (config) {
                    var value = config.default_value;
                    if (config.datatype.indexOf('bit') >= 0) {                        
                        value = (value.toLowerCase() === 'true');                        
                    } else if (config.datatype.indexOf('decimal') >= 0) {
                        value = value == null || isNaN(value) ? null : parseFloat(value);
                    } else if (config.datatype.indexOf('int') >= 0) {
                        value = value == null || isNaN(value) ? null : parseInt(value);
                    }
                    result[config.field_name] = value;
                });
                result['id'] = null;
                result['persona_plan_id'] = $rootScope.PersonaPlan.id;
                result['dream_type_id'] = id;
                result['config_data'] = {};
            }
        })
        return result;
    }

    this.initNameOfDreamOrLifeEvent = function (id, defaultName) {
        var result = angular.isUndefined(defaultName) ? '' : defaultName;
        var max_id = 0;
        
        angular.forEach($rootScope.PersonaPlan.dreams, function (item) {
            if (item.dream_type_id == id) {
                var name = item.name;
                name = name.substr(result.length + 1);
                try {
                    name = parseInt(name);
                    if (!isNaN(name) && name > max_id) { max_id = name; }
                } catch (ex) { }
            }
        });
        angular.forEach($rootScope.PersonaPlan.lifeEvent, function (item) {
            if (item.dream_type_id == id) {
                var name = item.name;
                name = name.substr(result.length + 1);
                try {
                    name = parseInt(name);                    
                    if (!isNaN(name) && name > max_id) { max_id = name; }
                } catch (ex) { }
            }
        });
        max_id++;
        result += ' ' + max_id;
        return result;
    }

    

    return this;
})

