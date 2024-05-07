var utils = {
    compareTimeWithDelay: function (compare1, compare2, timedelay) {
        if (compare1 != undefined) {
            var currentDate = parseFloat(compare2.valueOf());
            var previousTime = parseFloat(compare1.valueOf()) + parseFloat(timedelay);
            if (currentDate > previousTime) {
                return true;
            }
        }
        else return true;
        return false;
    },
    HideDialog: function () {
        $('#confirmdialog').modal('hide');
    },
    HideRenameDialog: function () {
        $('#renamedialog').modal('hide');
    },
    HideScenarioDialog: function () {
        $('#manageScenario').modal('hide');
    },
    ShowDialog: function ($rootScope, title, content, messenge, callback, customeBody, CancelText, OkText) {
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
        $('#confirmdialogbodyContent').innerHTML = customeBody;
        $('#OkConfirm').bind('click', function () {
            if (callback != undefined)
                callback();
            utils.UnbindControl();
        });
        $('#CancelConfirm').bind('click', function () {
            utils.UnbindControl();
            $rootScope.SendingScreenSharingDataObject('', 'tab', 'CancelConfirm', 'Scenario');
        });
        $('#Okbtndialog').bind('click', function () {
            utils.UnbindControl();
            $rootScope.SendingScreenSharingDataObject('', 'tab', 'Okbtndialog', 'Scenario');
        });
    },
    ShowDialogRename: function ($rootScope,title, messenge, callback) {
        //$rootScope.renamedialog = {};
        $rootScope.renamedialog.title = title;
        $rootScope.renamedialog.messenger = messenge;
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
    },
    UnbindControl: function () {
        $('#Okbtndialog').unbind('click');
        $('#OkConfirm').unbind('click');
        $('#CancelConfirm').unbind('click');
        $('#input_rename_unit_work').val('');
        $('#confirmdialogbodyContent').html('');
        $('#input_rename_unit_work').removeAttr('placeholder');

    },
    addHighLightClassforProgressbar :function(id){
        $('#' + id).find('.bto-bar-wrapper').addClass('activeBorder');
    },
    removeHighLightClassforProgressbar: function (id) {
        $('#' + id).find('.bto-bar-wrapper').removeClass('activeBorder');
    },
    addHighLightClassforDirectId: function(id){
        $('#' + id).addClass('activeBorder');
    },
    removeHighLightClassforDirectId: function (id) {
        $('#' + id).removeClass('activeBorder');
    },
    removeAllHighLightClassWhenFinish : function(){
        utils.removeHighLightClassforProgressbar('incomeExpensebar');
        utils.removeHighLightClassforProgressbar('expenseAtRetirement');
    },
    sleep: function (milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }
} 
btoApp.service('ultilService', function ($rootScope, commonService, $q, $timeout, $filter) {
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

    this.parseJSONFromString = function (str) {
        var jsonString = str.replaceAll('\r', '');
        jsonString = str.replaceAll('\n', '');
        jsonString = str.replaceAll('  ', '');
        return JSON.parse(jsonString);
    }
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
                24: { text: this.translate('EMERGING MARKET STOCKS – 18%'), color: '#C62828' },
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

    this.checkUserCookie = function ($rootScope) {
        var guid = $('#userKeyId').val();
        if (guid == "")
            guid = this.GenerateGUID().new();
        var now = new Date();
        var time = now.getTime();
        var expireTime = time + 365 * 24 * 60 * 60 * 1000;
        now.setTime(expireTime);
        document.cookie = "username=" + guid + ";expires=" + now.toGMTString() + ';path=/';
        $rootScope.PersonaPlan.user_id = guid; 
    }

    this.getCookie = function (cookie_name) {
        var re = new RegExp(cookie_name + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : '';
    }

    this.GenerateGUID = function () {
        var svc = {
            new: function () {
                function _p8(s) {
                    var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                    return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
                }
                return _p8() + _p8(true) + _p8(true) + _p8();
            },

            empty: function () {
                return '00000000-0000-0000-0000-000000000000';
            }
        };
        return svc;
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
                    $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                    $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                    $rootScope.MainResult = pl.result;
                    $rootScope.zoomData.maxAge = $rootScope.PersonaPlan.death_age;
                    $rootScope.zoomData.minAge = $rootScope.PersonaPlan.start_age;
                    $rootScope.zoomData.max = angular.copy($rootScope.PersonaPlan.death_age);
                    $rootScope.zoomData.min = angular.copy($rootScope.PersonaPlan.start_age);
                    console.log('HERE: ' + $rootScope.zoomData);
                    $rootScope.apply();
                    $rootScope.ReloadSolutionWork();
                    if ($rootScope.isRefresh != true)
                        $rootScope.SendingScreenSharingDataObject(pl, 'tab', 'loadsolution_reload', 'Solution');
                    else $rootScope.isRefresh = false;
                    
                }
            })
        }
    }
    this.LoadDataByUserForShareScreen = function (user_id) {
        if (user_id.length > 1) {
            $.ajax({
                method: 'GET',
                async: false,
                url: '/api/PersonaPlan/GET/' + user_id,
                success: function (pl) {
                    $rootScope.currentPlan = pl.currentplan;
                    $rootScope.newPlan = pl.newplan;
                    $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
                    $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                    $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                    $rootScope.zoomData.maxAge = $rootScope.PersonaPlan.death_age;
                    $rootScope.zoomData.minAge = $rootScope.PersonaPlan.start_age;
                    $rootScope.zoomData.max = angular.copy($rootScope.PersonaPlan.death_age);
                    $rootScope.zoomData.min = angular.copy($rootScope.PersonaPlan.start_age);
                    $rootScope.MainResult = pl.result;
                    $rootScope.ReloadShareScreen();
                }
            })
        }
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
                    $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                    $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                    $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
                    $rootScope.MainResult = pl.result;
                }
            })
        }
    }
    this.AddDream = function ($rootScope, objDream) {
        if (objDream.persona_plan_id > 0) {
            $.ajax({
                method: 'POST',
                async: false,
                url: '/api/PersonaPlan/adddream/',
                data: objDream,
                success: function (pl) {
                    $rootScope.selectedDream.id = parseInt(pl);
                }
            })
        }
    }
    this.AddLifeEvent = function ($rootScope, objLifeEvent) {
        //console.log(objLifeEvent);
        if (objLifeEvent.persona_plan_id > 0) {
            $.ajax({
                method: 'POST',
                async: false,
                url: '/api/PersonaPlan/addLifeEvent/',
                data: objLifeEvent,
                success: function (pl) {
                    $rootScope.selectedLifeEvent.id = parseInt(pl);
                }
            })
        }
    }
    this.RemoveDream = function (dream_id) {
        commonService.DeleteDream(dream_id).then(
             function (obj) {
                 
             },
             function (errorMessage) {
                 $rootScope.isLoading = false;
             }
        );
    }
    this.RemoveLifeEvent = function (lifeEvent_id) {
        commonService.DeleteLifeEvent(lifeEvent_id).then(
             function (obj) {
                 
             },
             function (errorMessage) {
                 $rootScope.isLoading = false;
             }
        );
    }
    this.LoadDreamType = function ($rootScope) {
        commonService.getListDreamType($rootScope.PersonaPlan.user_id).then(
        function (obj) {
            if (obj != null) {
                $rootScope.DreamTypes = obj.data.dreamtype;
                $rootScope.DreamListType = [];
                $rootScope.DreamListLifeEvent = [];
                var j = 0; p = 0;
                for (var i = 0; i < $rootScope.DreamTypes.length; i++) {
                    if ($rootScope.DreamTypes[i].type == 'dream') {
                        $rootScope.DreamListType[j] = $rootScope.DreamTypes[i];
                        j = j + 1;
                    } else {
                        $rootScope.DreamListLifeEvent[p] = $rootScope.DreamTypes[i];
                        p = p + 1;
                    }
                }
                $rootScope.backupDreamType = angular.copy(obj.data.dreamtype);
                $rootScope.selectedDream = obj.data.dream;
                $rootScope.backupselectedDream = angular.copy(obj.data.dream);
                $rootScope.selectedDreamtype = $rootScope.DreamTypes[0];
                //for life event
                $rootScope.selectedLifeEvent = obj.data.lifeevent;
                $rootScope.backupselectedLifeEvent = angular.copy(obj.data.lifeevent);
            }
        },

        function (errorMessage) {
            $rootScope.isLoading = false;
        });
    }
    this.updateDefaultValueOfDream = function ($rootScope) {

        $rootScope.DreamTypes = angular.copy($rootScope.backupDreamType);
        angular.forEach($rootScope.DreamTypes, function (dream) {
            angular.forEach(dream.dreamTypeConfig, function (config) {
                if (config.datatype.indexOf('decimal') >= 0) {
                    config.value = parseFloat(config.default_value);
                } else {
                    config.value = config.default_value;
                }
            })
        });
    }

    this.updateResidenceSale = function (dreamConfig, age, isNeedUpdateValue) {
        var self = this;
        var dreamAge = angular.copy(age);
        // Calculate dreamAge if edit
        if (angular.isDefined(isNeedUpdateValue) && isNeedUpdateValue == true) {
            angular.forEach(dreamConfig, function (itemField) {
                if (itemField.field_name == 'starting_age') {
                    dreamAge = angular.copy(itemField.value);
                }
            });
        }
        angular.forEach(dreamConfig, function (itemField) {
            if (itemField.field_name == 'selected_residence') {
                if (itemField.value == null) itemField.value = -1;
                var listResidence = [];
                angular.forEach($rootScope.PersonaPlan.dreams, function (item) {

                    // if residence purchase
                    if (item.dream_type.id == 1) {
                        // Not drop item -> edit dream
                        if (item.purchase_age <= dreamAge) {
                            //console.log(item);
                            var residence = {
                                'id': item.id,
                                'label': item.name
                            };
                            // check residence purchase was saled
                            var isResidenceWasSaled = false;
                            if (angular.isDefined(isNeedUpdateValue) && isNeedUpdateValue == true) {
                                if (itemField.value != item.id) {
                                    // check this dream was sale or not sale
                                    angular.forEach($rootScope.PersonaPlan.lifeEvent, function (event) {                                        
                                        if (item.id == event.dream_id) {
                                            isResidenceWasSaled = true;
                                        }
                                    });
                                }
                            } else {
                                // check this dream was sale or not sale
                                angular.forEach($rootScope.PersonaPlan.lifeEvent, function (event) {
                                    if (item.id == event.dream_id) {
                                        isResidenceWasSaled = true;
                                    }
                                });
                            }
                            if (!isResidenceWasSaled) {
                                listResidence[listResidence.length] = residence;
                            }
                        }
                    }
                });
                
                listResidence[listResidence.length] = {
                    'id': -1,
                    'label': self.translate('Other residence')
                }
                if (angular.isDefined(isNeedUpdateValue) && isNeedUpdateValue == true) {
                    var dreamId = angular.copy(itemField.value);
                    if (listResidence.length == 1) {

                        itemField.value = listResidence[0].id;
                        angular.forEach($rootScope.PersonaPlan.lifeEvent, function (event) {
                            if (event.dream_id == dreamId) {
                                event.dream_id = null;
                            }
                        });
                    } else {
                        var checkInListHaveDream = false;
                        angular.forEach(listResidence, function (residence) {
                            if (residence.id == dreamId) {
                                checkInListHaveDream = true;
                            }
                        });
                        if (!checkInListHaveDream) {
                            itemField.value = listResidence[0].id;
                            angular.forEach($rootScope.PersonaPlan.lifeEvent, function (event) {
                                if (event.dream_id == dreamId) {
                                    event.dream_id = null;
                                }
                            });
                        }
                    }
                } else {
                    itemField.value = listResidence[0].id;
                }
                itemField.selectBoxData = listResidence;
            }
        });
    }

    this.managerRequest = function (request, deferredAbort) {
        var promise = request.then(
           function (response) {
               return (response.data);
           },
           function (response) {
               return ($q.reject("Something went wrong"));
           }
       );

        promise.abort = function () {
            deferredAbort.resolve();
        };
        promise.finally(
            function () {
                promise.abort = angular.noop;
                deferredAbort = request = promise = null;
            }
        );
        return (promise);
    },

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


    this.requestKeepSessionAlive = function () {
        $.get("/home/KeepAlive", {}, { cache: false }, function (result) { });
    };
    this.keepSessionAlive = function(){
        setInterval(requestKeepSessionAlive, 300000);
    };
})