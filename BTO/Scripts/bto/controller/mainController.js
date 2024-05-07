
btoApp.controller('mainController', ['$scope', '$rootScope', '$interval', '$timeout', '$templateCache', '$window', 'ultilService', 
    function ($scope, $rootScope, $interval, $timeout, $templateCache, $window, ultilService) {
        $scope.controllerName = 'mainController';
        
        $templateCache.remove('/Home/Main');
        $rootScope.tabType = 'MainTable';
        var item = {
            action: 'tab',
            type: 'main', 
        }
        if ($rootScope.playBackPlayerData.data != null) {
            $rootScope.MainResult = $rootScope.playBackPlayerData.data;
        }
        $rootScope.SendingScreenSharingDataObject(item, 'tab', 'open', 'Main');
        $scope.initProgressBar = function () {
            $rootScope.progressBarValue = {
                nameWillChange: '',
                changeProgressData: 0,
            }
            
            // Income Data
            $scope.incomeDataProgressBar = {
                'modelData': angular.copy($rootScope.PersonaPlan.expense_today),
                'maxValue': angular.copy($rootScope.PersonaPlan.income_today),
                'btoProgressData': {
                    color: '#36A747',
                    topColor: '#28a4c9',
                    topColorReachMax: '#F11F1F',
                    bottomColor: '#428bca',
                    toolTipTopText: ultilService.translate("Drag or double click to change current income"),
                    toolTipBottomText: ultilService.translate("Drag or double click to change current expense"),
                    toolTipTopReverseText: ultilService.translate("Drag or double click to change current expense"),
                    toolTipBottomReverseText: ultilService.translate("Drag or double click to change current income"),
                }
            }
            
            $scope.incomeProgressBarChangeData = function (data) {
                $rootScope.PersonaPlan.income_today = data.maxValue;
                $rootScope.PersonaPlan.expense_today = data.modelData;
                $rootScope.Settings.isInstantRequest = false;
                var needIncome = 0;
                if (data.isReachMax) {
                    needIncome = data.modelData - data.maxValue;
                }
                $rootScope.SetEventActionTypeForShare('incomeExpensebar', 'begin');
                $rootScope.requestSaveAndUpdateScreen();
            }
            $scope.incomeProgressBarEnd = function () { 
                $rootScope.Settings.isInstantRequest = true;
                $rootScope.SetEventActionTypeForShare('incomeExpensebar','end');
                $rootScope.requestSaveAndUpdateScreen();
            }
            $scope.incomeDoubleClick = function (data) {
                if (data.isChangeModel) {
                    $rootScope.progressBarValue.nameWillChange = 'current_expense';
                    $rootScope.progressBarValue.changeProgressData = angular.copy($scope.incomeDataProgressBar.modelData);
                } else {
                    $rootScope.progressBarValue.nameWillChange = 'current_income';
                    $rootScope.progressBarValue.changeProgressData = angular.copy($scope.incomeDataProgressBar.maxValue);
                }
                $scope.callChangeValueOfProgressBar();
                var item = {
                    datatype: 'change-value',
                    newValue: $rootScope.progressBarValue,
                }
                $rootScope.SendingScreenSharingDataObject(item, 'edit', 'open', 'changeValueDialog');
            }
            // Retirement Data
            $scope.retirementDataProgressBar = {
                'modelData': $rootScope.PersonaPlan.expense_at_retirement,
                'maxValue': $rootScope.MainResult.social_security,
                'btoProgressData': {
                    id: 2,
                    color: '#5cb85c',
                    topColor: '#b3d54d',
                    topColorReachMax: '#F11F1F',
                    bottomColor: '#86B404',
                    isOnlyChangeModel: true,
                    toolTipPosition: 'top',
                    toolTipTopText: '',
                    toolTipBottomText: ultilService.translate("Drag or double click to change expense at retirement"),
                    toolTipTopReverseText: ultilService.translate("Drag or double click to change expense at retirement"),
                    toolTipBottomReverseText: '',
                }
            }
            $rootScope.$watch('PersonaPlan.expense_today', function () {
                $scope.incomeProgressBarChangeData.maxValue = $rootScope.PersonaPlan.expense_today;
            });
            $rootScope.$watch('PersonaPlan.income_today', function () {
                $scope.incomeProgressBarChangeData.modelData = $rootScope.PersonaPlan.income_today;
            });
            $rootScope.$watch('MainResult.social_security', function () {
                $scope.retirementDataProgressBar.maxValue = $rootScope.MainResult.social_security;
            });
            $rootScope.$watch('PersonaPlan.expense_at_retirement', function () {
                $scope.retirementDataProgressBar.modelData = $rootScope.PersonaPlan.expense_at_retirement;
            });

            $scope.retirementProgressBarChangeData = function (data) {
                $rootScope.PersonaPlan.expense_at_retirement = data.modelData;
                $rootScope.Settings.isInstantRequest = false;
                $rootScope.SetEventActionTypeForShare('expenseAtRetirement', 'begin');
                $rootScope.requestSaveAndUpdateScreen();
            }

            $scope.retirementProgressBarEnd = function () {
                $rootScope.SetEventActionTypeForShare('expenseAtRetirement', 'end');
                $rootScope.Settings.isInstantRequest = true;
                $rootScope.requestSaveAndUpdateScreen();
            }
            $scope.retirementDoubleClick = function (data) {
                if (data.isChangeModel) {
                    $rootScope.progressBarValue.nameWillChange = 'retirement_expense';
                    $rootScope.progressBarValue.changeProgressData = angular.copy($scope.retirementDataProgressBar.modelData);
                    $scope.callChangeValueOfProgressBar();
                    var item = {
                        datatype: 'change-value',
                        newValue: $rootScope.progressBarValue,
                    };
                    $rootScope.SendingScreenSharingDataObject(item, 'edit', 'open', 'changeValueDialog');
                }
            }

            $rootScope.applyDataChangedForChangeValueDialog = function()
            {
                if ($rootScope.progressBarValue.nameWillChange == 'retirement_expense') {
                    $scope.retirementDataProgressBar.modelData = parseInt($rootScope.progressBarValue.changeProgressData);
                    $rootScope.PersonaPlan.expense_at_retirement = $scope.retirementDataProgressBar.modelData;
                } else if ($rootScope.progressBarValue.nameWillChange == 'current_expense') {
                    $scope.incomeDataProgressBar.modelData = parseInt($rootScope.progressBarValue.changeProgressData);
                    $rootScope.PersonaPlan.expense_today = $scope.incomeDataProgressBar.modelData;
                } else if ($rootScope.progressBarValue.nameWillChange == 'current_income') {
                    $scope.incomeDataProgressBar.maxValue = parseInt($rootScope.progressBarValue.changeProgressData);
                    $rootScope.PersonaPlan.income_today = $scope.incomeDataProgressBar.maxValue;
                }
            }
            $scope.callChangeValueOfProgressBar = function () {
                $timeout(function () { 
                    $('#changeValueDialog').modal({ backdrop: 'static', keyboard: false })
                    .one('click', '#saveValueOfProgressBar', function () {
                        $rootScope.applyDataChangedForChangeValueDialog();
                        $rootScope.Settings.isInstantRequest = true;
                        $rootScope.requestSaveAndUpdateScreen();
                        $rootScope.scopeApply($scope, true);
                        
                        var item = {
                            datatype: 'change-value',
                            newValue: $rootScope.progressBarValue,
                        };
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'ok', 'changeValueDialog');
                    })
                    .one('click', '#cancelChangeValueOfProgressBar', function () {
                        $rootScope.progressBarValue.changeProgressData = 0;
                        var item = {
                            datatype: 'change-value',
                            newValue: $rootScope.progressBarValue,
                        };
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'cancel', 'changeValueDialog');
                    });
                }, 300);
            }
        }
        $scope.ChangeValueOfProgressBars = function (personalPlan) {
            $scope.incomeDataProgressBar.modelData = personalPlan.expense_today;
            $scope.incomeDataProgressBar.maxValue = personalPlan.income_today;
        };
        $scope.initProgressBar();
        $rootScope.isResetData = false;
        $scope.callfromOutsite = function (personalPlan) {
            $rootScope.PersonaPlan.expense_today = personalPlan.expense_today;
            $rootScope.PersonaPlan.income_today = personalPlan.income_today;
            $rootScope.MCTopValue.selected = ($rootScope.PersonaPlan.mc_top_value * 100) + '%';
            $rootScope.MCBottomValue.selected = (rootScope.PersonaPlan.mc_bottom_value * 100) + '%';
            $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
            $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;

            $scope.isChangeRickReturn = true;
            $scope.rickValue = Math.round((angular.copy($rootScope.PersonaPlan.volatility) * 100) * 100) / 100;
            $scope.rickReturn = Math.round((angular.copy($rootScope.PersonaPlan.risk_return) * 100) * 100) / 100;            
            $scope.ChangeValueOfProgressBars(personalPlan);
        };


        // Risk and Expected Return
        $scope.rickGaugeChartData = ultilService.getRickGaugeCharConfigtData();
        $scope.rickTableChartData = ultilService.getRickAndRickReturnTableCharConfigtData();
        $scope.getRiskReturn = function (value) {
            var result = $scope.rickTableChartData.line.linearPortion * value;
            return parseFloat(result.toFixed(4));
        }

        $scope.rickValue = Math.round((angular.copy($rootScope.PersonaPlan.volatility) * 100) * 100) / 100;
        $scope.rickReturn = Math.round((angular.copy($rootScope.PersonaPlan.risk_return) * 100) * 100) / 100;
        $scope.isChangeRickReturn = true;
        $scope.isResizeWindow = false;
        $scope.currentTimeout = null;
        
        

        $scope.rickChangeValue = function (data) { 
            if (!$scope.isChangeRickReturn && !$scope.isResizeWindow) {
                $rootScope.PersonaPlan.volatility = data.modelData / 100;
                $rootScope.PersonaPlan.risk_return = $scope.getRiskReturn($rootScope.PersonaPlan.volatility);
                if (data.isMoveNeedle) {
                    $rootScope.Settings.isInstantRequest = false;
                    $rootScope.SetEventActionTypeForShare('gauge_chart', 'begin');
                } else {
                    $rootScope.Settings.isInstantRequest = true;
                    $rootScope.SetEventActionTypeForShare('gauge_chart', 'end');
                }
                $scope.rickValue = data.modelData
                $scope.rickReturn = $scope.getRiskReturn($scope.rickValue); 
                $rootScope.requestSaveAndUpdateScreen();
            } else {
                $timeout.cancel($scope.currentTimeout);
                if ($scope.isResizeWindow) {
                    $scope.currentTimeout = $timeout(function () {
                        $scope.isChangeRickReturn = false;
                        $scope.isResizeWindow = false;
                    }, 500);
                } else {
                    $scope.currentTimeout = $timeout(function () {
                        $scope.isChangeRickReturn = false;
                        $scope.isResizeWindow = false;
                    }, 50);
                }
            }
        }

        $scope.rickExpectedReturnChangeValue = function (data) {
            $scope.isChangeRickReturn = true;
            $scope.rickValue = data.modelDataX;
            $scope.rickReturn = data.modelDataY;
            $rootScope.PersonaPlan.volatility = data.modelDataX / 100;
            $rootScope.PersonaPlan.risk_return = data.modelDataY / 100;
            if (data.isMoveCircle) {
                $rootScope.Settings.isInstantRequest = false;
                $rootScope.SetEventActionTypeForShare('gauge_chart', 'begin');
            } else {
                $rootScope.Settings.isInstantRequest = true;
                $rootScope.SetEventActionTypeForShare('gauge_chart', 'end');
            }
            $rootScope.scopeApply($scope, true);
           
            $rootScope.requestSaveAndUpdateScreen();
            $scope.isChangeRickReturn = false;
        }

        angular.element($window).bind('resize', function () {
            $scope.isResizeWindow = true;
            $scope.isChangeRickReturn = true;
        });

        //$scope.ShareScreenData = function () { 
           
          
        //        var hub = $.connection.controllerHub;
        //        hub.server.sendtransferData($rootScope.PersonaPlan);
              
        //};
        //$scope.ResetDataTranfer = function (obj) {
        //    $rootScope.ResetDataTranfer(obj);
        // //   ultilService.LoadByUser(personalPlan.user_id);
        //};
        $rootScope.currentScope = $scope;
    }]);

function resetValueForBars(personalPlan) {
    if (document.getElementById('incomeExpensebar') != undefined) {
        angular.element(document.getElementById('incomeExpensebar')).scope().callfromOutsite(personalPlan);
    }
}
//function ResetDataTranfer(personalPlan) {
//    if (document.getElementById('incomeExpensebar') != undefined) {
//        angular.element(document.getElementById('incomeExpensebar')).scope().ResetDataTranfer(personalPlan);
//    }
//}
//function TranferScreenData() { 
//    if (document.getElementById('incomeExpensebar') != undefined)
//        angular.element(document.getElementById('incomeExpensebar')).scope().ShareScreenData();
//}


