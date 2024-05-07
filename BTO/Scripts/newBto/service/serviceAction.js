btoApp.factory('actionService',
function ($rootScope, accountService, utilService, CONFIG, $timeout, $http, pendingRequests) {
    this.onChangeDropDownMenu = function (data, com_id) {
        this.doAction(data, com_id);
    }
    this.onDoubleBarChange = function (data, com_id) {
        this.doAction(data, com_id);
    }

    this.onChangeDoubleBarEnd = function (com_id) {
        this.doAction(null, com_id);
    }
    
    this.onDoubleClickDoubleBar = function (data, com_id) {
        var comObj = this.getComponentNameByComId(com_id);
        var key = comObj.params[1];
        if (!data.isChangeModel) {
            key = comObj.params[0];
        }
        
        if (key == 'income_today') {
            $rootScope.progressBarValue.nameWillChange = 'current_income';
            $rootScope.progressBarValue.changeProgressData = angular.copy($rootScope.PersonaPlan.income_today);
            $('#changeValueDialog').modal('show');
        } else if (key == 'expense_today') {
            $rootScope.progressBarValue.nameWillChange = 'current_expense';
            $rootScope.progressBarValue.changeProgressData = angular.copy($rootScope.PersonaPlan.expense_today);
            $('#changeValueDialog').modal('show');
        }
    }

    this.onDoubleClickSingleBar = function (data, com_id) {
        var comObj = this.getComponentNameByComId(com_id);
        if (comObj.params == 'expense_at_retirement') {
            $rootScope.progressBarValue.nameWillChange = 'retirement_expense';
            $rootScope.progressBarValue.changeProgressData = angular.copy($rootScope.PersonaPlan.expense_at_retirement);
            $('#changeValueDialog').modal('show');
        }
    }

    this.doActionUpdateValueOfPersonalPlanOnPopup = function () {
        if ($rootScope.progressBarValue.nameWillChange == 'retirement_expense') {
            $rootScope.PersonaPlan.expense_at_retirement = angular.copy($rootScope.progressBarValue.changeProgressData)
        } else if ($rootScope.progressBarValue.nameWillChange == 'current_expense') {
            $rootScope.PersonaPlan.expense_today = angular.copy($rootScope.progressBarValue.changeProgressData)
        } else if ($rootScope.progressBarValue.nameWillChange == 'current_income') {
            $rootScope.PersonaPlan.income_today = angular.copy($rootScope.progressBarValue.changeProgressData)
        }
        this.updatePersonalPlanOnServer();
    }

    this.onChangeSingleBar = function (data, com_id) {
        this.doAction(data, com_id);
    }

    this.onChangeSingleBarEnd = function (com_id) {
        this.doAction(null, com_id);
    }

    this.onChangeCurrencyBox = function (com_id) {
        this.doAction(null, com_id);
    }

    this.onChangeGaugeChart = function (data, com_id) {
        this.doAction(data, com_id);
    }

    this.onChangeTableChart = function (data, com_id) {
        this.doAction(data, com_id);
    }

    this.onChangeSelectBox = function (com_id) {
        this.doAction(null, com_id);
    }

    this.onUpRangeSlide = function (com_id) {
        this.doAction(null, com_id);
    }


    this.onChangeSlider = function (com_id) {       
        this.doAction({}, com_id);
    }
    this.onEndChangeSlider = function (com_id) {        
        this.doAction(null, com_id);
        
    }
    this.getComponentNameByComId = function (com_id) {
        var obj = $rootScope.dynamicConponent[com_id];
        if (angular.isDefined(obj)) {
            return obj;
        } else {
            return null;
        }
    }

    
    this.doAction = function (data, com_id) {        
        //return;
        var comObj = this.getComponentNameByComId(com_id);        
        if (comObj != null) {
            if (!angular.isArray(comObj.params)) {
                if (comObj.type == 'single_bar') {
                    this.doActionChangeOnSingleBar(data);
                } else if (comObj.type == 'currency_number_box') {
                    this.doActionChangeOnCurrencyNumberBox(comObj.params);
                } else if (comObj.type == 'select_box' || comObj.type == 'material_select_box') {
                    this.doActionChangeOnSelectBox(comObj.params);
                } else if (comObj.type == 'slider_range') {
                    if (com_id == 'risk' || com_id == 'riskReturn') {
                        if ($('#div_Investment').length > 0) {
                            //$rootScope.scrollTop = $('#div_Investment').offset().top;
                            console.log(' $rootScope.scrollTop :', $rootScope.scrollTop);
                        }
                    }
                    this.doActionChangeRangeSlide(data, comObj.params);
                } else if (comObj.params == 'currency_code') {                    
                    this.doActionChangeCurrency(data);
                } else if (comObj.params == 'volatility') {                    
                    this.doActionChangeRiskThenChangeRiskReturn(data)
                } else if (comObj.params == 'risk_return') {                   
                    this.doActionChangeRiskReturn();
                } else {
                    this.updatePersonalPlanOnServer();
                }
            } else {                
                //check if change table chart with risk and risk return
                if (comObj.type == 'table_chart' && comObj.params[0] == 'volatility' && comObj.params[1] == 'risk_return') {
                    this.doActionChangeRiskAndRiskReturn(data);
                } else if (comObj.type == 'double_bar' && comObj.params[0] == 'income_today' && comObj.params[1] == 'expense_today') {
                    this.doActionChangeIncomeAndExpenseToday(data);
                } else if (comObj.type == 'double_bar') {
                    this.doActionChangeDoubleBar(data);
                } else if (comObj.type == 'slider_range') {
                    if (com_id == 'risk' || com_id == 'riskReturn') {
                        //$rootScope.scrollTop = $('#div_Investment').offset().top;
                        //console.log(' $rootScope.scrollTop :', $rootScope.scrollTop);
                    }
                    this.doActionChangeRangeSlide(data, comObj.params);
                } else {
                    this.updatePersonalPlanOnServer();
                }
            }             
        }
       
        this.sendSharingAction(com_id);
    }

    this.currencyBoxTimeout = null;
    this.doActionChangeOnCurrencyNumberBox = function (param) {
        if (param == 'volatility') {
            $rootScope.PersonaPlan.volatility = $rootScope.convertDataOfPersonalPlan.risk / 100;
            $rootScope.PersonaPlan.volatility = parseFloat($rootScope.PersonaPlan.volatility.toFixed(4));
            this.calRiskReturnFromRisk();
        } else if (param == 'risk_return') {
            $rootScope.PersonaPlan.risk_return = $rootScope.convertDataOfPersonalPlan.risk_return / 100;
            $rootScope.PersonaPlan.risk_return = parseFloat($rootScope.PersonaPlan.risk_return.toFixed(4));
        }        
        var self = this;
        if (param != null && angular.isString(param)) {            
            $timeout.cancel(this.currencyBoxTimeout);
            this.currencyBoxTimeout = $timeout(function () {               
                self.updatePersonalPlanOnServer();
                $timeout(function () {
                    self.callServerToUpdateResult();
                }, 1500);                
            }, 1000);
            self.callServerToUpdateResult();            
        }
    }


    this.sendSharingAction = function (com_id) {
        $timeout(function () { 
            // Update data to sharing
            $rootScope.sharingActionData.action = 'CHANGE_COMPONENT_' + com_id;
            $rootScope.sharingActionData.data = angular.copy($rootScope.PersonaPlan);
            $rootScope.sharingActionData.result = null;
            $rootScope.sharingActionData.isUpdate = false;
            delete $rootScope.sharingActionData.data.dreams;
            delete $rootScope.sharingActionData.data.ClientActionType;
            delete $rootScope.sharingActionData.data.lifeEvent;
            delete $rootScope.sharingActionData.data.name;
            delete $rootScope.sharingActionData.data.time_create;
            delete $rootScope.sharingActionData.data.user_id;
            delete $rootScope.sharingActionData.current_state;
            $rootScope.sharingService.sendingSharingActionData();
        }, 200)
    }

    this.doActionChangeRangeSlide = function (data, param) {        
        if (param == 'inflation') {
            $rootScope.PersonaPlan.inflation = $rootScope.convertDataOfPersonalPlan.inflaction / 100;
            $rootScope.PersonaPlan.inflation = parseFloat($rootScope.PersonaPlan.inflation.toFixed(4));
        } else if (param == 'salary_evolution') {
            $rootScope.PersonaPlan.salary_evolution = $rootScope.convertDataOfPersonalPlan.salaryEvolution / 100;
            $rootScope.PersonaPlan.salary_evolution = parseFloat($rootScope.PersonaPlan.salary_evolution.toFixed(4));
        } else if (param == 'volatility') {            
            $rootScope.PersonaPlan.volatility = $rootScope.convertDataOfPersonalPlan.risk / 100;
            $rootScope.PersonaPlan.volatility = parseFloat($rootScope.PersonaPlan.volatility.toFixed(4));
            //check if change risk return
            if (angular.isDefined($rootScope.functionAccess.CHANGE_VOLATILITY_EXPERT) && $rootScope.functionAccess.CHANGE_VOLATILITY_EXPERT == 1){
                this.calRiskReturnFromRisk();
            }
        } else if (param == 'risk_return') {        
            $rootScope.PersonaPlan.risk_return = parseFloat(($rootScope.convertDataOfPersonalPlan.risk_return / 100).toFixed(4));
            //check if change risk return
            if (angular.isDefined($rootScope.functionAccess.CHANGE_VOLATILITY_EXPERT) && $rootScope.functionAccess.CHANGE_VOLATILITY_EXPERT == 1){
                //this.calRiskReturnFromRisk();
            }
        }
        if (data == null) {           
            //update personal plan
             this.updatePersonalPlanOnServer();
        } else {
            //Only not update personal plan            
            this.callServerToUpdateResult();
        }
    }

    this.doActionChangeOnSelectBox = function (param) {
        //Update value of top and bottom        
        if (param == 'mc_top_value') {
            var value = $rootScope.convertDataOfPersonalPlan.mc_top_value.substr(0, $rootScope.convertDataOfPersonalPlan.mc_top_value.length - 1);
            value = parseFloat(value) / 100;
            $rootScope.PersonaPlan.mc_top_value = value;
        } else if (param == 'mc_bottom_value') {
            var value = $rootScope.convertDataOfPersonalPlan.mc_bottom_value.substr(0, $rootScope.convertDataOfPersonalPlan.mc_bottom_value.length - 1);
            value = parseFloat(value) / 100;
            $rootScope.PersonaPlan.mc_bottom_value = value;
        }
        //update personal plan
        this.updatePersonalPlanOnServer();
    }
    this.doActionChangeDoubleBar = function (data) {
        if (data == null) {
            //update personal plan
            this.updatePersonalPlanOnServer();
        } else {
            //Only not update personal plan
            this.callServerToUpdateResult();
        }
    }

    this.doActionChangeOnSingleBar = function (data) {
        if (data == null) {
            //update personal plan
            this.updatePersonalPlanOnServer();
        } else {
            //Only not update personal plan
            this.callServerToUpdateResult();
        }
    }

    this.doActionChangeIncomeAndExpenseToday = function (data) {
        if (data == null) {
            //update personal plan
            this.updatePersonalPlanOnServer();
        } else {
            //Only not update personal plan
            this.callServerToUpdateResult();
        }
    }
    this.doActionChangeRiskReturn = function () {
        $rootScope.PersonaPlan.risk_return = $rootScope.convertDataOfPersonalPlan.risk_return / 100;
        $rootScope.PersonaPlan.risk_return = parseFloat($rootScope.PersonaPlan.risk_return.toFixed(4));
        this.updatePersonalPlanOnServer();
    }
    this.doActionChangeRiskAndRiskReturn = function (data) {
        
        $rootScope.convertDataOfPersonalPlan.risk = data.modelDataX;
        $rootScope.convertDataOfPersonalPlan.risk_return = data.modelDataY;

        $rootScope.PersonaPlan.volatility = data.modelDataX / 100;
        $rootScope.PersonaPlan.volatility = parseFloat($rootScope.PersonaPlan.volatility.toFixed(4));
        $rootScope.PersonaPlan.risk_return = data.modelDataY / 100;
        $rootScope.PersonaPlan.risk_return = parseFloat($rootScope.PersonaPlan.risk_return.toFixed(4));       
        if (data.isMoveCircle) {
            //Only not update personal plan
            this.callServerToUpdateResult();
        } else {
            //update personal plan
            this.updatePersonalPlanOnServer();
        }
    }
    this.doActionChangeCurrency = function (data) {
        this.updatePersonalPlanOnServer();
        accountService.changeCurrency(data);
    }

    this.calRiskReturnFromRisk = function () {
        $rootScope.PersonaPlan.risk_return = $rootScope.PersonaPlan.volatility * 0.4082;
        $rootScope.PersonaPlan.risk_return = parseFloat($rootScope.PersonaPlan.risk_return.toFixed(4));
        $rootScope.PersonaPlan.volatility = parseFloat($rootScope.PersonaPlan.volatility.toFixed(4));
        $rootScope.convertDataOfPersonalPlan.risk_return = $rootScope.PersonaPlan.risk_return * 100;
    }

    this.doActionChangeRiskThenChangeRiskReturn = function (data) {
        if (data == null) {
            $rootScope.PersonaPlan.volatility = $rootScope.convertDataOfPersonalPlan.risk / 100;
            $rootScope.PersonaPlan.volatility = parseFloat($rootScope.PersonaPlan.volatility.toFixed(4));
            this.calRiskReturnFromRisk();
            this.updatePersonalPlanOnServer();
        }
        else {
            $rootScope.convertDataOfPersonalPlan.risk = data.modelData;
            $rootScope.PersonaPlan.volatility = data.modelData / 100;
            this.calRiskReturnFromRisk();
            if (data.isMoveNeedle) {
                // Only not update personal plan
                this.callServerToUpdateResult();
            } else {
                // Update personal plan
                this.updatePersonalPlanOnServer();
            }
        }
    }
    this.canSaveAndUpdateScreen = function () {

    }

    this.isCalculateData = false;
    this.calculateData = function () {
        try { 
            if (!this.isCalculateData) {
                var self = this;
                this.isCalculateData = true;
                $rootScope.sharingActionData.current_state = $rootScope.scope.name;
                switch ($rootScope.scope.name) {
                case CONFIG.TAB.INCOME_EXPENSE:
                    $rootScope.planService.calculateIncomeAndExpense($rootScope.PersonaPlan,
                         function (obj) {
                             if (obj != null) {
                                 $rootScope.MainResult = obj.basic;
                                 $rootScope.IncomeExpenseChart = angular.copy(obj);
                                 delete $rootScope.IncomeExpenseChart.basic;
                                 $rootScope.spinner.off();
                                 if (angular.isFunction($rootScope.scope.updatedrawChart)) {
                                     $rootScope.scope.updatedrawChart();
                                 }
                                 $rootScope.sharingActionData.result = obj;
                                 $rootScope.sharingService.sendingSharingActionData();
                             }
                         },
                         function (errorMessage) {
                             //$rootScope.isLoading = false;
                         }
                    );
                    break;
                case CONFIG.TAB.LIQUID_ASSET:
                    $rootScope.planService.calculateEquityCurve($rootScope.PersonaPlan,
                         function (obj) {
                             if (obj != null) {
                                 $rootScope.MainResult = obj.basic;
                                 $rootScope.EquityCurveChart = angular.copy(obj);
                                 delete $rootScope.EquityCurveChart.basic;
                                 $rootScope.spinner.off();
                                 if (angular.isFunction($rootScope.scope.updatedrawChartLiquid)) {
                                     $rootScope.scope.updatedrawChartLiquid();
                                 }
                                 $rootScope.sharingActionData.result = obj;
                                 $rootScope.sharingService.sendingSharingActionData();
                             }
                         },
                         function (errorMessage) {
                            //$rootScope.isLoading = false;
                         }
                    );
                    break;
                case CONFIG.TAB.ILLIQUID_ASSET:
                    $rootScope.planService.calculateIlliquidCurve($rootScope.PersonaPlan,
                         function (obj) {
                             if (obj != null) {
                                 $rootScope.MainResult = obj.basic;
                                 $rootScope.IlliquidCurveChart = angular.copy(obj);
                                 delete $rootScope.IlliquidCurveChart.basic;
                                 $rootScope.spinner.off();
                                 if (angular.isFunction($rootScope.scope.updatedrawChartIlliquid)) {
                                     $rootScope.scope.updatedrawChartIlliquid();
                                 }
                                 $rootScope.sharingActionData.result = obj;
                                 $rootScope.sharingService.sendingSharingActionData();
                             
                             }
                         },
                         function (errorMessage) {
                             //$rootScope.isLoading = false;
                         }
                    );
                    break;
                    case CONFIG.TAB.RANKING_DREAM:
                        $rootScope.planService.calculateBasic($rootScope.PersonaPlan,
                        function (obj) {
                            if (obj != null) {
                                $rootScope.MainResult = obj;
                                $rootScope.IncomeExpenseChart = null;
                                $rootScope.EquityCurveChart = null;
                                $rootScope.spinner.off();
                                if (angular.isFunction($rootScope.scope.UpdateRankingDream)) {
                                    $rootScope.scope.UpdateRankingDream();
                                }
                                $rootScope.sharingActionData.result = obj;
                                $rootScope.sharingService.sendingSharingActionData();
                            }
                        },
                        function (errorMessage) {
                            //$rootScope.isLoading = false;
                        });
                    
                    break;
                default:
                    $rootScope.planService.calculateBasic($rootScope.PersonaPlan, function (obj) {
                        if (obj != null) {
                            $rootScope.MainResult = obj;
                            $rootScope.IncomeExpenseChart = null;
                            $rootScope.EquityCurveChart = null;
                            $rootScope.spinner.off();
                        
                            $rootScope.sharingActionData.result = obj;
                            $rootScope.sharingService.sendingSharingActionData();
                        
                        }
                    },
                    function (errorMessage) {
                        //$rootScope.isLoading = false;
                    });
                    break;
                }
        
                $timeout(function () {
                    self.isCalculateData = false;
                }, 250)
        
            }
        } catch (ex) { }
    }
    this.callServerToUpdateResult = function () {
        //console.log('calculate result');
        // console.log('call server to update result with current tab is [' + $rootScope.scope.name + ']');
        try {
            this.calculateData();
        } catch (ex) { }
    }

    this.calculateDataOnWebSocket = null;

    this.updateData = function () {
        //console.log('update data');
        pendingRequests.cancelAll();
        // Update personal plan
        $timeout(function () {
            //console.log('update personal plan');
            $rootScope.planService.updatePersonalPlan($rootScope.PersonaPlan,
                function (data) {
                    if (data) {
                        $rootScope.PersonaPlan = data;
                        utilService.scopeApply();
                    }
                    $rootScope.PersonaPlan.ClientActionType = null;
                    $rootScope.isLoading = false;
                    $rootScope.sharingActionData.isUpdate = true;
                    $rootScope.sharingService.sendingSharingActionData();
                },
                function (errorMessage) {
                    $rootScope.isLoading = false;
                }
            );
        }, 400)
        if (version_id == '1' || version_id == '2') {
            
            var self = this;
            // Request to calculate data after 300
            $timeout(function () {
                try {
                    self.calculateData();
                } catch (ex) { }
            }, 300);            
        }
    }
    this.updatePersonalPlanOnServer = function () {
        //console.log('updatePersonalPlanOnServer');
        try {
            this.updateData();
        } catch (ex) { }
    }
    return this;
})