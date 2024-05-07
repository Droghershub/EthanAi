var btoApp = angular.module('btoApp', ['ui.router', 'ngMessages', 'chart.js', 'ng-currency', 'ui.utils.masks',
'treasure-overlay-spinner', 'ngAnimate', 'ui.sortable', "smart-table", 'pascalprecht.translate', 'ngCookies', 'ngStorage', 'ui-rangeSlider']);
btoApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider.state('main', {
        url: "/main",
        templateUrl: '/Home/Main',
        controller: 'mainController'
    })
    $stateProvider.state('playback_main', {
        url: "/playback_main",
        templateUrl: '/Home/Main?playback=1',
        controller: 'mainController'
    })
    .state('income_expenses', {
        url: "/income_expenses",
        templateUrl: '/Home/IncomeExpenses'
    })
    .state('playback_income_expenses', {
        url: "/playback_income_expenses",
        templateUrl: '/Home/IncomeExpenses?playback=1'
    })
    .state('liquid_illiquid_asset', {
        url: "/Liquid_Asset",
        templateUrl: '/Home/LiquidIlliquidAsset'
    })
    .state('playback_liquid_illiquid_asset', {
        url: "/playback_Liquid_Asset",
        templateUrl: '/Home/LiquidIlliquidAsset?playback=1'
    })
    .state('illiquid_asset', {
        url: "/Illiquid_Asset",
        templateUrl: '/Home/IlliquidAsset',
    })
    .state('playback_illiquid_asset', {
        url: "/playback_Illiquid_Asset",
        templateUrl: '/Home/IlliquidAsset?playback=1',
    })
    .state('ranking_dreams', {
        url: '/Ranking_Dreams',
        templateUrl: '/Home/RankingDreams'
    })
    .state('playback_ranking_dreams', {
        url: '/playback_Ranking_Dreams',
        templateUrl: '/Home/RankingDreams?playback=1'
    })
    .state('sharing_session', {
        url: '/sharing_session',
        templateUrl: '/Home/SharingSession'
    })
    .state('sharing_session_only_view', {
        url: '/sharing_session_only_view',
        templateUrl: '/Home/SharingSessionOnlyView'
    })
    .state('manage_solution', {
        url: '/Manage_Work',
        templateUrl: '/Home/ManageSolution'
    });
    $urlRouterProvider.otherwise("/main");
}]);


btoApp.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);
var rootScope = null;
btoApp.run(function ($rootScope, ultilService, timelineService, profileService, playbackService, $sce, $http, $translate, $cookies, $state, $localStorage, $timeout, $locale, zoomService, commonService) {
    $rootScope.isFirstLoadView = false;
    /*
    -- Begin Apply check perrmission function accesss
    */
    $rootScope.functionAccess = {};
    $rootScope.functionAccess.errorMessage = "This action is not permitted";
    $rootScope.functionAccess.deniedMessage = "This action is not permitted";
    $rootScope.functionAccess.showErrorMessage = function () {
        $timeout(function () {
            ultilService.showErrorMessage(ultilService.translate($rootScope.functionAccess.errorMessage));
        }, 100);
    };
    $rootScope.functionAccess.showDeniedMessage = function () {
        $timeout(function () {
            ultilService.showErrorMessage(ultilService.translate($rootScope.functionAccess.deniedMessage));
        }, 100);
    };
    GetUserPermissionOnAction = function (list, actionName) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].name == actionName) {
                return list[i].action;
            }
        }
        return -1;
    };
    $rootScope.SetPermissionFunctionAccess = function (listfunctionRole) {
        for (var i = 0; i < listfunctionRole.length; i++) {
            $rootScope.functionAccess[listfunctionRole[i].name] = GetUserPermissionOnAction(listfunctionRole, listfunctionRole[i].name);
        } 
    };
    $rootScope.listFunctionPermission = [];
    $rootScope.loadListFunctionPermission = function () {
        $.ajax({
            method: 'GET', async: false, url: '/api/usermanagement/get_all_functions_for_user/' + document.getElementById('userKeyId').getAttribute('value'), success: function (response) {
                if (response != null) {
                    $rootScope.listFunctionPermission = response;
                    $rootScope.SetPermissionFunctionAccess($rootScope.listFunctionPermission); 
                }
            }
        });
    }; 
    $rootScope.loadListFunctionPermission(); 
    $rootScope.ChangePassword = function () {
        var obj = {};
        obj.OldPassword = 'Asd@1234';
        obj.NewPassword = 'Asd@123';
        obj.ConfirmPassword = 'Asd@123';
        return $http({
            method: 'POST',
            //  async: false,
            url: '/api/ManageUser/ChangePassword',
            data: obj
        });
    }
    /*
   -- Begin End check perrmission function accesss
   */

    $rootScope.selectDreamOrLifeEvent = function () {
        if (typeof ($rootScope.timelineControl.selectedItemOnTimelineId) != 'undefined' && $rootScope.timelineControl.selectedItemOnTimelineId != null && $rootScope.timelineControl.selectedItemOnTimelineId != "") {
            $rootScope.displayObjectByName($rootScope.timelineControl.selectedItemOnTimelineId);
            if (typeof ($rootScope.curent_dream_id_selected) != 'undefined' && $rootScope.curent_dream_id_selected != null) {
                $rootScope.removeHighlightCanvasObject($rootScope.curent_dream_id_selected);
            }
            $rootScope.highlightCanvasObject($rootScope.timelineControl.selectedItemOnTimelineId);
            $rootScope.curent_dream_id_selected = $rootScope.timelineControl.selectedItemOnTimelineId;
            var selected = $rootScope.curent_dream_id_selected;
            $rootScope.SendingScreenSharingDataObject($rootScope.timelineControl.selectedItemOnTimelineId, 'changedropdownlist', 'changed');
            $timeout(function () {
                $rootScope.removeHighlightCanvasObject(selected);
            }, 1500);
        }
    }
   $rootScope.apply = function () {
        $timeout(function () {
            $rootScope.$apply();
        }, 10)
    }

   $rootScope.scopeApply = function (scope, isNeedTimeout) {
       if (angular.isDefined(isNeedTimeout) && isNeedTimeout == true) {
           scope.$apply();
       } else {
           $timeout(function () {
               scope.$apply();
           }, 10)
       }
    }

    $rootScope.showSelectedDreamOrLifeEvent = function () {
        try {
            var result = false;
            $rootScope.timelineControl.timelineItemList = [];
            if ($rootScope.PersonaPlan.retirement_age >= $rootScope.zoomData.minAge && $rootScope.PersonaPlan.retirement_age <= $rootScope.zoomData.maxAge) {
                $rootScope.timelineControl.timelineItemList.push({
                    id: 'retirement_age',
                    name: 'Retirement age'
                });
                result = true;
            }
            angular.forEach($rootScope.PersonaPlan.dreams, function (item) {
                if (item.purchase_age >= $rootScope.zoomData.minAge && item.purchase_age <= $rootScope.zoomData.maxAge) {
                    $rootScope.timelineControl.timelineItemList.push({
                        id: 'dream_'+item.id,
                        name: item.name
                    });                    
                    result = true;
                }
            });
            angular.forEach($rootScope.PersonaPlan.lifeEvent, function (item) {
                if (item.starting_age >= $rootScope.zoomData.minAge && item.starting_age <= $rootScope.zoomData.maxAge) {
                    $rootScope.timelineControl.timelineItemList.push({
                        id: 'lifeevent_' + item.id,
                        name: item.name
                    });
                    result = true;
                }
            });
            var haveTimelineItemInList = false;
            angular.forEach($rootScope.timelineControl.timelineItemList, function (item) {
                if ($rootScope.timelineControl.selectedItemOnTimelineId == item.id) {
                    haveTimelineItemInList = true;
                }
            });
            if (!haveTimelineItemInList) {
                $rootScope.timelineControl.selectedItemOnTimelineId = null;
            }
            $rootScope.timelineControl.isShowItemOnTimeline = result;
        } catch (ex) { };
    }
    
    // <option value="-1" ng-if="$root.PersonaPlan.retirement_age >= $root.zoomData.minAge && $root.PersonaPlan.retirement_age >= $root.zoomData.maxAge">{{'Retirement age'}}</option>
    $rootScope.zoomData = {
        isShow: false,
        min: 0,
        max: 0,
        maxAge: 81,
        minAge: 18
    }

    $rootScope.$watch('PersonaPlan.start_age', function (newValue) {
        if ($rootScope.zoomData.isShow) {
            $rootScope.zoomData.min = angular.copy(newValue);
            $rootScope.zoomData.minAge = angular.copy(newValue);
            $rootScope.zoomData.max = angular.copy($rootScope.PersonaPlan.death_age);
            $rootScope.zoomData.maxAge = angular.copy($rootScope.PersonaPlan.death_age);
        } else {
            $rootScope.zoomData.min = angular.copy(newValue);
            $rootScope.zoomData.minAge = angular.copy(newValue);
        }
    });
    $rootScope.$watch('zoomData.minAge', function (newValue) {
        zoomService.changeMinAge(newValue);
    });
    $rootScope.$watch('zoomData.isShow', function () {
        zoomService.changeIsShow();
    });
    $rootScope.$watch('zoomData.maxAge', function (newValue) {
        zoomService.changeMaxAge(newValue);
    });

    $rootScope.translate = function (text, valueObj) {
        return ultilService.translate(text, valueObj);
    }

    $rootScope.salaryEvolutionAndInflaction = {
        salaryEvolution: 2.6,
        inflaction: 2
    }
    $rootScope.isTakeOver = false;
    // success message
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
    var keepSessionAlive = null;
    // Profile
    $rootScope.profile = null;
    $rootScope.countries = null;
    profileService.initProfile();
    profileService.loadCountry();
    $rootScope.saveProfile = function () {
        profileService.saveProfile();
    }
    $rootScope.showProfileDialog = function () {
        profileService.showProfileDialog();
    },
    $rootScope.initialPlayBack = function () {
        playbackService.initialPlayBack();
    },
    $rootScope.startPlay = function () {
        if (!$rootScope.playBackPlayerData.isPlaying) {
            playbackService.startPlay();
            $rootScope.setRequestSessionAlive();
        }
    },
    $rootScope.stopPlayback = function () {
        playbackService.stopPlayback();
        $rootScope.removeRequestSessionAlive();
        
    },
    $rootScope.changeSpeed = function () {
        playbackService.changeSpeed();
    },
    $rootScope.playBack = function () {
        if (!$rootScope.playBackPlayerData.isPlaying) {
            playbackService.playBack();
            $rootScope.setRequestSessionAlive();
        }
    },
    $rootScope.pausePlayBackward = function () {
        playbackService.pausePlayBackward();
    }

    $rootScope.pausePlayForward = function () {
        playbackService.pausePlayForward();
    },

    $rootScope.playbackHoverProgress = function (event) {
        playbackService.playbackHoverProgress(event);
    },

    $rootScope.playbackMouseOutProgressBar = function (event) {
        playbackService.playbackMouseOutProgressBar(event);
    }

    $rootScope.profileChangeNumberOfChild = function () {
        profileService.changeNumberOfChild();
    },

    $rootScope.profileChangeNumberOfDependent = function () {
        profileService.changeNumberOfDependent();
    },

    $rootScope.textCountryCode = function (code, name) {
        //return $sce.trustAsHtml( '<b>' + code + '</b>' + ' ' + name);
        return name;
    }

    $rootScope.range = function (min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    };
    $rootScope.PersonaPlan = {
        id: 0,
        user_id: '',
    }
    $rootScope.isFirstTime = true;
    // Build PersonaPlan
    $rootScope.RightColumnControls = {};
    $rootScope.RightColumnControls = {
        Trials: [1000, 5000, 10000],
        Mc_Top_Value: ['1%'],
        Mc_Bottom_value: ["1%"]
    }
    $rootScope.listCurrency = [];

    $rootScope.genderList = [
                    {
                        id: 0,
                        name: 'Male1'
                    },
                    {
                        id: 1,
                        name: 'Female1'
                    }
    ];

    $rootScope.residencyStatusList = [
                    {
                        id: 0,
                        name: 'Singaporean / PR'
                    },
                    {
                        id: 1,
                        name: 'Foreigner'
                    }
    ];

    $rootScope.maritalStatusList = [
                    {
                        id: 0,
                        name: 'Single'
                    },
                    {
                        id: 1,
                        name: 'Married'
                    }
    ];

    $rootScope.occupationList = [
                    {
                        id: 0,
                        name: 'Not-employed'
                    },
                    {
                        id: 1,
                        name: 'Employed'
                    },
                    {
                        id: 2,
                        name: 'Self-employed'
                    },
                    {
                        id: 3,
                        name: 'Retired'
                    }
    ];
    $rootScope.relationshipList = [
                    {
                        id: 0,
                        name: ''
                    }
    ];

    $rootScope.loadParametter = function () {
        $http({ method: 'get', url: 'api/parameter/get_list_item_of_parameter' }).then(function (response) {
            $rootScope.listItemOfParameter = response.data;
            $http({ method: 'get', url: 'api/parameter/get_parameter' }).then(function (response) {
                $rootScope.listParameter = response.data;
                angular.forEach($rootScope.listParameter, function (item) {
                    if (item.name === 'persona_plan.currency_code') {
                        $rootScope.listCurrency = [];
                        angular.forEach($rootScope.listItemOfParameter, function (detail) {

                            if (detail.parameter_id === item.id)
                                $rootScope.listCurrency.push(detail);
                        })
                    }
                    else if (item.name === 'persona_plan.mc_top_value') {
                        $rootScope.RightColumnControls.Mc_Top_Value = [];                        
                        angular.forEach($rootScope.listItemOfParameter, function (detail) {
                            if (detail.parameter_id === item.id)
                                $rootScope.RightColumnControls.Mc_Top_Value.push(detail.name);
                        })
                    }

                    else if (item.name === 'persona_plan.mc_bottom_value') {
                        $rootScope.RightColumnControls.Mc_Bottom_value = [];
                        angular.forEach($rootScope.listItemOfParameter, function (detail) {
                            if (detail.parameter_id === item.id)
                                $rootScope.RightColumnControls.Mc_Bottom_value.push(detail.name);
                        })
                    }
                    else if (item.name === 'persona_plan.number_trials') {
                        $rootScope.RightColumnControls.Trials = [];
                        angular.forEach($rootScope.listItemOfParameter, function (detail) {
                            if (detail.parameter_id === item.id)
                                $rootScope.RightColumnControls.Trials.push(parseInt(detail.name));
                        })
                    }
                    else if (item.name === 'user_profile.gender') {
                        $rootScope.genderList = [];
                        angular.forEach($rootScope.listItemOfParameter, function (detail) {
                            if (detail.parameter_id === item.id)
                                $rootScope.genderList.push({ id: parseInt(detail.value), name: detail.name });
                        })
                    }

                    else if (item.name === 'user_profile.residency_status') {
                        $rootScope.residencyStatusList = [];
                        angular.forEach($rootScope.listItemOfParameter, function (detail) {
                            if (detail.parameter_id === item.id)
                                $rootScope.residencyStatusList.push({ id: parseInt(detail.value), name: detail.name });
                        })
                    }

                    else if (item.name === 'user_profile.married_status') {
                        $rootScope.maritalStatusList = [];
                        angular.forEach($rootScope.listItemOfParameter, function (detail) {
                            if (detail.parameter_id === item.id)
                                $rootScope.maritalStatusList.push({ id: parseInt(detail.value), name: detail.name });
                        })
                    }
                    else if (item.name === 'user_profile.occupation') {
                        $rootScope.occupationList = [];
                        angular.forEach($rootScope.listItemOfParameter, function (detail) {
                            if (detail.parameter_id === item.id)
                                $rootScope.occupationList.push({ id: parseInt(detail.value), name: detail.name });
                        })
                    }
                    else if (item.name === 'user_profile.relationship') {
                        $rootScope.relationshipList = [];
                        angular.forEach($rootScope.listItemOfParameter, function (detail) {
                            if (detail.parameter_id === item.id)
                                $rootScope.relationshipList.push({ id: parseInt(detail.value), name: detail.name });
                        })
                    }
                });
               
            });
        });

    }
    $rootScope.loadParametter();

    ultilService.checkUserCookie($rootScope);
    ultilService.loadData($rootScope);
    ultilService.LoadDreamType($rootScope);
    $rootScope.backupDreamType = null;
    rootScope = $rootScope;
    $rootScope.spinner = {
        active: false,
        on: function () {
            this.active = true;
        },
        off: function () {
            this.active = false;
        }
    };
    // init timeline bar
    $rootScope.loadTimeLineBar = function () {
        $rootScope.isLoading = false;
        $rootScope.friends = [];
        var requestToServer = null;
        var requestCalculator = null;
        if ($rootScope.isFirstTime) {
            timelineService.initTimeLineBar(requestToServer, requestCalculator);
        }
        $rootScope.isFirstTime = false;
    }
    $rootScope.loadTimeLineBar();

    // Change starting age
    $rootScope.timelineChangeStartingAge = function (age) {
        // update list listResidence
        if ($rootScope.selectedDreamtype.id == 4) {           
            if ($rootScope.timelineDropYear == -1) {
                ultilService.updateResidenceSale($rootScope.selectedDreamtype.dreamTypeConfig, age, true);
            } else {
                ultilService.updateResidenceSale($rootScope.selectedDreamtype.dreamTypeConfig, age, false);
            }
        }

    }
    
    $rootScope.listTutorial = [];

    $rootScope.loadTutorial = function () {
        $http({ method: 'get', url: 'api/tutorial/GetAll' }).then(function (response) {
            $rootScope.listTutorial = response.data;
            var userID = document.getElementById('userKeyId').getAttribute('value');
            $http({ method: 'get', url: 'api/tutorial/GetTutorialOfUser/' + userID }).then(function (userTutorialResponse) {
                if (userTutorialResponse.data.length > 0) {
                    var tutorialKey = '';
                    angular.forEach(userTutorialResponse.data, function (item) {
                        tutorialKey += tutorialKey + ',' + item.keyid;
                    });
                    angular.forEach($rootScope.listTutorial, function (item) {
                        if (tutorialKey.indexOf(item.keyid) >= 0) {

                            item.wasShow = true;
                        }
                    });
                }
            });
        });

    }
    //$rootScope.loadTutorial();
    /*
    $rootScope.getListUserPlayBack = function (callbackSuccess) {
        $http({ method: 'get', url: 'api/clientTracking/GetAll' }).then(function (response) {
            if (angular.isDefined(callbackSuccess)) callbackSuccess(response.data);
        });
    }
    */
    //$rootScope.getPlaybackData(36020);
    // Currency
    
    $rootScope.isFirstLoadCurrentcyForSharing = true;
    $rootScope.changeCurrency = function (currency) {       
        var isChangeCurrency = true;
        if ($rootScope.PersonaPlan.currency_code == currency)
            isChangeCurrency = false;
        $rootScope.PersonaPlan.currency_code = angular.copy(currency);
        $locale.NUMBER_FORMATS.CURRENCY_SYM = currency + ' ';
        $rootScope.SetEventActionTypeForShare('currencyId', 'showing');
        
        
        $timeout(function () {
            $cookies.put('reload', 'true');
            $state.reload();
            $rootScope.$apply();
            if (localStorage.isSharing == "true" && $rootScope.isFirstLoadCurrentcyForSharing == true) {
                $rootScope.isFirstLoadCurrentcyForSharing = false;
            } else if (isChangeCurrency) {
                ultilService.showSuccessMessage(ultilService.translate("Currency has been changed!"));
            }
            $rootScope.SendingScreenSharingDataObject(currency, 'tab', 'change', 'currency');
            $timeout(function () {
                $cookies.remove('reload');
            }, 100);
        }, 100);
        if (isChangeCurrency) {
            $rootScope.Settings.isAjaxInstantRequest = true;
            $rootScope.requestSaveAndUpdateScreen();
        }
    };

    $rootScope.selectedLanguage = {
        "code": "en",
        "name": "English"
    }

    $rootScope.listLanguage = [
        { "code": "en", "name": "English", "currency": "USD" },
        { "code": "ma", "name": "Mandarin", "currency": "CNY" },
        { "code": "hi", "name": "Hindu", "currency": "INR" },
        { "code": "ml", "name": "Malay", "currency": "MYR" },
        { "code": "sp", "name": "Spanish", "currency": "EUR" },
        { "code": "fr", "name": "French", "currency": "EUR" },
        { "code": "ge", "name": "German", "currency": "EUR" }
    ];

    $rootScope.changeLanguage = function (language) {
        $cookies.put('_culture', language.code);
        $translate.use(language.code); 
    }
    $rootScope.changeLanguage($rootScope.selectedLanguage);

    var languageCode = $localStorage.languageCode;
    if (angular.isUndefined(languageCode)) {
        $rootScope.changeLanguage($rootScope.selectedLanguage);
    } else {
        angular.forEach($rootScope.listLanguage, function (item) {
            if (item.code == languageCode) {
                $rootScope.selectedLanguage = item;
            }
        });
        $rootScope.changeLanguage($rootScope.selectedLanguage);
    }
    $rootScope.currentController = null;
    var isFirstLoad = true;
    $rootScope.$on('$translateChangeSuccess', function (data, language) {
        $localStorage.languageCode = language.language;
        angular.forEach($rootScope.listLanguage, function (item) {
            if (item.code == language.language) {
                $rootScope.selectedLanguage = item;
            }
        });
        
        if (isFirstLoad == false) {
            if ($rootScope.selectedLanguage.currency != $rootScope.PersonaPlan.currency_code) {
                utils.ShowDialog($rootScope, ultilService.translate("Confirm"),
                    ultilService.translate("After change language, do you want to change currency to {{currency}} ?",
                    $rootScope.selectedLanguage), ultilService.translate("Language was changed successful."),
                    function () {
                        $rootScope.Settings.isAjaxInstantRequest = true;
                        $rootScope.requestSaveAndUpdateScreen();
                        $rootScope.PersonaPlan.currency_code = angular.copy($rootScope.selectedLanguage.currency);
                        $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.selectedLanguage.currency + ' ';
                        $timeout(function () {
                            $cookies.put('reload', 'true');
                            $state.reload();
                            $rootScope.$apply();
                            $cookies.remove('reload');
                            ultilService.showSuccessMessage(ultilService.translate("Currency has been changed!"));
                            $timeout(function () {
                                $cookies.remove('reload');
                            }, 2000);
                        }, 2000)
                    }, null);
                $cookies.put('reload', 'true');
                $state.reload();
                $timeout(function () {
                    $cookies.remove('reload');
                }, 2000);
            }
            
            //$timeout(function () {
            timelineService.changeTextOfTimeline();
            //}, 500);
        } else {
            //$timeout(function () {            
            $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.PersonaPlan.currency_code + ' ';
            timelineService.changeTextOfTimeline();
            //}, 500);
        }

        isFirstLoad = false;
    });



    $rootScope.inflactionChangeUp = function () {
        $rootScope.SetEventActionTypeForShare('inflaction', 'end');
        $rootScope.Settings.isInstantRequest = true;
        $rootScope.requestSaveAndUpdateScreen();
    }

    $rootScope.salaryEvolutionChangeUp = function () {
        $rootScope.SetEventActionTypeForShare('salaryEvolution', 'end');
        $rootScope.Settings.isInstantRequest = true;
        $rootScope.requestSaveAndUpdateScreen();
    }
    $rootScope.icountsalaryEvolution = 0;
    $rootScope.$watch('salaryEvolutionAndInflaction.salaryEvolution', function (newValue, oldValue) {
        if ($rootScope.icountsalaryEvolution > 0) {
            $rootScope.SetEventActionTypeForShare('salaryEvolution', 'begin');
        } else {
            $rootScope.icountsalaryEvolution = $rootScope.icountsalaryEvolution + 1;
        }

        $rootScope.PersonaPlan.salary_evolution = newValue / 100;
        $rootScope.Settings.isInstantRequest = false;
        $rootScope.requestSaveAndUpdateScreen();
    });
    $rootScope.icountinflaction = 0;
    $rootScope.$watch('salaryEvolutionAndInflaction.inflaction', function (newValue, oldValue) {
        $rootScope.PersonaPlan.inflation = newValue / 100;
        $rootScope.Settings.isInstantRequest = false;
        if ($rootScope.icountinflaction > 0) {
            $rootScope.SetEventActionTypeForShare('inflaction', 'begin');
        } else {
            $rootScope.icountinflaction = $rootScope.icountinflaction + 1;
        }
        $rootScope.requestSaveAndUpdateScreen();
    });

    $rootScope.getPlaybackData = function (client_profile_id, callbackSuccess) {
        
        $http({ method: 'POST', url: 'api/clientTracking/GetUserSession', data: client_profile_id }).then(function (response) {
            
            if (angular.isDefined(callbackSuccess)) callbackSuccess(response.data);
        });
    }

    $rootScope.playbackLoadSession = function (dataSession) {
        //console.log(data);
        ultilService.showWarningMessage('Started loading session', 2000);
        // data.id 37352 37352 37453
        $rootScope.getPlaybackData(dataSession.id, function (data) {
            $rootScope.playbackActionListFromServer = data;
            if ($rootScope.playbackActionListFromServer.length > 2) {
                $('#playbackSessionDialog').modal('hide');
                $rootScope.playBackPlayerData.session = dataSession;
                playbackService.initialPlaybackSession();
            } else {
                ultilService.showErrorMessage('No action by the user', 6000);
            }
        });
    };

    $rootScope.playbackSessionTable = {
        isLoading: false,
        startIndex: 0,
        number: 10,
        numberOfPages: 0,
        email: '',
        displayed: [],
        tableState: null,
        callServer: function (tableState) {
            $rootScope.playbackSessionTable.tableState = tableState;
            $rootScope.playbackSessionTable.isLoading = true;
            var pagination = tableState.pagination;
            $rootScope.playbackSessionTable.startIndex = pagination.start || 0;
            $rootScope.playbackSessionTable.number = pagination.number || 10;
            if (angular.isDefined(tableState.search.predicateObject) && angular.isDefined(tableState.search.predicateObject.email)) {
                $rootScope.playbackSessionTable.email = tableState.search.predicateObject.email || '';
            }
            //tableState.pagination.numberOfPages = 0;
            $rootScope.playbackSessionTable.getSession($rootScope.playbackSessionTable.startIndex,
                $rootScope.playbackSessionTable.number,
                $rootScope.playbackSessionTable.email,
                tableState, function (result) {
                tableState.pagination.numberOfPages = result.numberOfPages;
                $rootScope.playbackSessionTable.numberOfPages = result.numberOfPages;
                $rootScope.playbackSessionTable.displayed = result.data
                $rootScope.playbackSessionTable.isLoading = false;
            });
        },
        getSession: function (start, number, email, tableState, callbackSuccess) {
            $http({ method: 'POST', url: 'api/clientTracking/getSession', data: { start: start, number: number, email: email } }).then(function (response) {
                if (angular.isDefined(callbackSuccess)) callbackSuccess(response.data);
            });
        }
    };
   
    $rootScope.setRequestSessionAlive = function() {
        keepSessionAlive = setInterval(ultilService.requestKeepSessionAlive, 300000);
    };
    $rootScope.removeRequestSessionAlive = function() {
        clearInterval(keepSessionAlive);
    };
    $rootScope.changePasswordData = {
        OldPassword: "",
        NewPassword: "",
        ConfirmPassword: ""
    }
    $rootScope.isShowChangePassword = false;
    $rootScope.listLogins = [];
    var loadExternalLoginProvider = function () {
        // Get External login
        commonService.GetExternalLoginProviders().then(function (response) {
            $rootScope.listLogins = response.data;
            // check is show change password
            var check = false;
            angular.forEach($rootScope.listLogins, function (item) {
                if (item.name == 'Basic Login') {
                    check = true;
                }
            });
            $rootScope.isShowChangePassword = check;
        });
    }
    $rootScope.showManageAccountDialog = function () {
        $rootScope.isShowChangePassword = false;
        // Reset info of password
        $rootScope.changePasswordData = {
            OldPassword: "",
            NewPassword: "",
            ConfirmPassword: ""
        }
        loadExternalLoginProvider();
        $timeout(function () {
            $('#OldPasswordInput').focus();
            $('#manageAccountDialog').modal();
        }, 500)
    }

    $rootScope.submitChangePassword = function () {
        commonService.ChangePassword($rootScope.changePasswordData).then(function (response) {
            var data = response.data;
            if (data.success) {
                ultilService.showSuccessMessage(ultilService.translate("Password has been changed successfully"));
                $rootScope.changePasswordData = {
                    OldPassword: "",
                    NewPassword: "",
                    ConfirmPassword: ""
                }
                $rootScope.form_change_password.$setPristine();
                $timeout(function () {
                    $rootScope.$apply();
                }, 500);
            } else {
                ultilService.showErrorMessage(data.errcode);
            }
        })
    }

    $rootScope.disableLogin = function (item) {
        // check can disable account
        var count = 0;
        angular.forEach($rootScope.listLogins, function (item) {
            if (!item.status) {
                count++;
            }
        });
        if (count >= 2) {
            utils.ShowDialog($rootScope, ultilService.translate("Confirm"),
                ultilService.translate("Do you want to disable login {{type}}", { type: item.name }), "",
                function () {
                    commonService.DisableLoginProvider(item).then(function (response) {
                        var data = response.data;
                        if (data.success) {
                            ultilService.showSuccessMessage(ultilService.translate("Your login was disabled successfully"));
                            loadExternalLoginProvider();
                            $timeout(function () {
                                $rootScope.$apply();
                            }, 500);
                        } else {
                            ultilService.showErrorMessage(data.errcode);
                        }
                    });
                }   
            );
        } else {
            ultilService.showErrorMessage(ultilService.translate("You can not disable this login"));
        }
    }
    $rootScope.enableLogin = function (item) {
        utils.ShowDialog($rootScope, ultilService.translate("Confirm"),
            ultilService.translate("Do you want to enable login {{type}}", { type: item.name }), "",
            function () {
                commonService.EnableLoginProvider(item).then(function (response) {
                    var data = response.data;
                    if (data.success) {
                        ultilService.showSuccessMessage(ultilService.translate("Your login was enabled successfully"));
                        loadExternalLoginProvider();
                        $timeout(function () {
                            $rootScope.$apply();
                        }, 500);
                    } else {
                        ultilService.showErrorMessage(data.errcode);
                    }
                });
            }
        );
    }

    $rootScope.initChangePasswordForm = function (obj) {
        $timeout(function () { 
            $rootScope.form_change_password = obj.form_change_password;
        }, 500)
    }

    $rootScope.isFirstLoadView = true;
});

btoApp.config(function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
        url: '',
        prefix: 'Content/translates/',
        suffix: '.json'
    });
    //$translateProvider.preferredLanguage('en');



});
