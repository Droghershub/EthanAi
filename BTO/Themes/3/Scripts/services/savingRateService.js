var swiper = null;
btoApp.service('savingRateService', function ($rootScope, utilService, $timeout, CONFIG, $filter) {
    var chart = null;
    var listItemChanged = [];
    $rootScope.Math = window.Math;
    var zoomStartIndex = null, zoomEndIndex = null, isValidateData = false, zoomedEvent = null, isCumulative_inflation = true;
    $rootScope.MonthlyIncome = {
        income_from_investment: 0,
        other_income: 0,
        exceptional_incomes : 0,
        recurring_incomes: 0,
        income_from_social_security: 0,
        income_from_salary: 0,
        income : 0,
        age:0
    };
    $rootScope.MonthlyExpense = {
            recurring_expense:0,
            expenses_at_retirement: 0,
            expenses_prior_retirement: 0,
            expenses: 0,
            other_expenses: 0,
            exception_expenses: 0,          
    };
    $rootScope.MonthlySaving = {
        net_cpf_contribution: 0,
        own_saving: 0,
        saving: 0,
        monthlyRate:0
    }
    $rootScope.savingRate = this;
    this.initDataForProvider = function () {
        var data = [], temp;
        if ($rootScope.IncomeData.recurring_incomes != null) {
            for (var i = 0; i < $rootScope.IncomeData.recurring_incomes.length; i++) {
                var income_property = this.getIncomeFrom(i, 'income_from_properties');
                var total_income = income_property
                    + parseFloat($rootScope.IncomeData.recurring_incomes[i])
                    + parseFloat($rootScope.IncomeData.exceptional_incomes[i])
                    + parseFloat($rootScope.IncomeData.income_from_social_security[i]);
                var total_expense = parseFloat($rootScope.ExpenseData.recurring_expense[i])
                    + this.getMortageRepayment(i)
                    + this.getExpensesFromProperty(i)
                    + parseFloat($rootScope.ExpenseData.insufficient_funds[i]);
                temp = {
                    "year": parseInt($rootScope.PersonaPlan.start_age) + i,
                    "income": isCumulative_inflation ? total_income / $rootScope.Cumulative_inflation[i] : total_income,
                    "expense": isCumulative_inflation ? total_expense / $rootScope.Cumulative_inflation[i] : total_expense,
                    "colorIncome": "#46C2FF",
                    "colorExpense": "#039BE4"
                }                
                data[i] = temp;
            }
        }
        return data;
    },
    this.SharingForCardShow = function (index) {
        if (index == null || typeof index == "undefined") {
            this.carouselIndex = 0;
        } else {
            this.carouselIndex = parseInt(index);
        }
        $rootScope.utilService.scopeApply()
    }
    this.showCard = function (index) {
        this.carouselIndex = index;
        var temp = parseInt(swiper.activeIndex);
        console.log('swiper.activeIndex : ', swiper.activeIndex);
        $rootScope.SendingScreenSharingDataObject(temp, 'changeCardSwiper', 'showCard', 'activeIndex');
        return;
            } 
    this.UpdateChangeCard = function (field_id) {
        if (field_id == 'PersonaPlan.income_today') {
            if ($rootScope.PersonaPlan.income_today < 0 || isNaN($rootScope.PersonaPlan.income_today))
                $rootScope.PersonaPlan.income_today = 0;
            $rootScope.PersonaPlan.saving_today = utilService.roundNumber($rootScope.PersonaPlan.income_today - $rootScope.PersonaPlan.expense_today);
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan.income_today, 'changeCard', field_id, 'income_today');
            return;
        }
        if (field_id == 'PersonaPlan.expense_today') {
            if ($rootScope.PersonaPlan.expense_today < 0 || isNaN($rootScope.PersonaPlan.expense_today))
                $rootScope.PersonaPlan.expense_today = 0;
            $rootScope.PersonaPlan.saving_today = utilService.roundNumber($rootScope.PersonaPlan.income_today - $rootScope.PersonaPlan.expense_today);
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan.expense_today, 'changeCard', field_id, 'expense_today');
            return;
        }
        if (field_id == 'PersonaPlan.saving_today') {
            if ($rootScope.PersonaPlan.saving_today > $rootScope.PersonaPlan.income_today)
            {
                $rootScope.PersonaPlan.saving_today = utilService.roundNumber($rootScope.PersonaPlan.income_today);
                $rootScope.utilService.showWarningMessage('You can not save more money then you earned.');
            }
            if (isNaN($rootScope.PersonaPlan.saving_today)){
                $rootScope.PersonaPlan.saving_today =0;
            }
            $rootScope.PersonaPlan.expense_today = $rootScope.PersonaPlan.income_today - parseFloat($rootScope.PersonaPlan.saving_today);
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan.saving_today, 'changeCard', field_id, 'saving_today');
            return;
        }
    }
    this.savingRateDonut = null;
    this.updateValueOnSwipe = function () {
    }
    this.calculateCashflow = function (item) {
    var result = 0;
        if (angular.isDefined(item.children) && item.children.length > 0) {
            for (var i = 0; i < item.children.length; i++) {
                var val = this.calculateCashflow(item.children[i]);
                if (item.children[i].isSummable) {
                    result += val;
                }
            }
            item.value = Math.abs(result);
        } else {
            result = item.value * (item.isPosistive ? 1: -1);
        }
        return result;
    }
    this.updateIncomeExpenseAndSavingFromCashflow = function () {
        $rootScope.PersonaPlan.income_today = 0;
        for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
            $rootScope.PersonaPlan.income_today += this.calculateCashflow($rootScope.cashFlow.income[i]);
        }
        $rootScope.PersonaPlan.income_today = Math.abs($rootScope.PersonaPlan.income_today);
        $rootScope.PersonaPlan.expense_today = 0;
        for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
            var val = this.calculateCashflow($rootScope.cashFlow.expense[i]);
            if ($rootScope.cashFlow.expense[i].isSummable){
                $rootScope.PersonaPlan.expense_today += val;
            }
        }        
        var net_cpf = $rootScope.net_cpf_contribute ? $rootScope.net_cpf_contribute[0]*1000 : 0;        
        $rootScope.PersonaPlan.income_today = utilService.roundNumber($rootScope.PersonaPlan.income_today);
        $rootScope.PersonaPlan.expense_today = Math.abs(utilService.roundNumber($rootScope.PersonaPlan.expense_today));
        $rootScope.PersonaPlan.saving_today = utilService.roundNumber(($rootScope.MonthlyIncome.income - $rootScope.MonthlyExpense.expenses - net_cpf)/12);
        this.updateValueOnSwipe();
    }

    this.resetIncomeAndExpense = function (item) {
        item.value = item.default_value * 1000 / 12;
        if (angular.isDefined(item.children) && item.children.length > 0) {
            for (var i = 0; i < item.children.length; i++) {
                this.resetIncomeAndExpense(item.children[i]);
            }
        }
    }
    this.deleteCashFlow = function () {
        var self = this;
        cashFlow = $rootScope.CashFlowRuleConfig;      
        this.resetCashFlowSwipper();
        if (!$rootScope.playBackPlayerData.isPlaying) {
            utilService.callApi('GET', '/api/cashflow/delete_cashflow/' + user_id, '', '', function (response) { });
        }
       
    }
    this.resetCashflow = function () {       
        $rootScope.isResetPlan = true;
        $rootScope.PersonaPlan.return_cashFlow = true;
        $rootScope.actionService.calculateData();        
    }
    this.convertCashFlowFromYearlyToMonthly = function (option) {
        var convertYearlyToMonthly = function (item) {
            if (typeof (item.value) == 'undefined') {
                item.value = item.default_value * 1000 / 12;
            } else {
                item.value = item.value * 1000 / 12;
            }
            item.value = parseFloat(item.value);

            if (angular.isDefined(item.children) && item.children.length > 0) {
                for (var i = 0; i < item.children.length; i++) {
                    convertYearlyToMonthly(item.children[i]);
                }
            }
        }
        for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
            convertYearlyToMonthly($rootScope.cashFlow.income[i]);
        }
        for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
            convertYearlyToMonthly($rootScope.cashFlow.expense[i]);
        }
        for (var i = 0; i < $rootScope.cashFlow.cpf.length; i++) {
            convertYearlyToMonthly($rootScope.cashFlow.cpf[i]);
        }
        utilService.scopeApply();
    },
    this.RemoveSpouseFromCashFlow = function (items) {
        for (var i = items.length - 1; i >= 0; i--) {
            if (items[i].name.indexOf("_spouse") >= 0) {
                items.splice(i, 1);
            }
            else if (items[i].children != null && items[i].children.length > 0) {
                this.RemoveSpouseFromCashFlow(items[i].children);
            }
        }
    },
    this.RemoveSalarySpouseFromCashFlow = function (items) {
        for (var i = items.length - 1; i >= 0; i--) {
            if (items[i].name == "salary_spouse") {
                items.splice(i, 1);
            }
            else if (items[i].children != null && items[i].children.length > 0) {
                this.RemoveSalarySpouseFromCashFlow(items[i].children);
            }
        }
    },
    this.RemoveChildFromCashFlow = function (items, childTotal) {
        for (var k = childTotal + 1; k < 20; k++) {
            for (var i = items.length - 1; i >= 0; i--) {
                if (items[i].name.indexOf("_child_" + k.toString()) >= 0) {
                    items.splice(i, 1);
                }
                else if (items[i].children != null && items[i].children.length > 0) {
                    this.RemoveChildFromCashFlow(items[i].children, childTotal);
                }
            }
        }
    },
    this.updateCashFlowValue = function (data, name, isUpdate) {
        var listObject = [];
        var getListItem = function (item) {
            listObject.push(item);
            if (item.children.length > 0) {
                for (var i = 0; i < item.children.length; i++) {
                    getListItem(item.children[i]);
                }
            }
        }
        for (var i = 0; i < data.income.length; i++) {
            getListItem(data.income[i]);
        }
        for (var i = 0; i < data.expense.length; i++) {
            getListItem(data.expense[i]);
        }
        var updateCashflowData = function (item, data) {
            if (item.name == data.name && item.name != name) {
                if (angular.isDefined(isUpdate) && isUpdate == true) {
                    item.value = data.value;
                } else {
                    item.value = data.default_value * 1000 / 12;
                }
                item.value = utilService.roundNumber(item.value);
            }
            if (item.children.length > 0) {
                for (var i = 0; i < item.children.length; i++) {
                    updateCashflowData(item.children[i], data);
                }
            }
        }
        if (listObject.length > 0) {
            angular.forEach(listObject, function (data) {
                for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                    updateCashflowData($rootScope.cashFlow.income[i], data);
                }
                for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                    updateCashflowData($rootScope.cashFlow.expense[i], data);
                }
                for (var i = 0; i < $rootScope.cashFlow.cpf.length; i++) {
                    updateCashflowData($rootScope.cashFlow.cpf[i], data);
                }
            });
        }
    },

    this.hideAccordion = function () {
        $('#cardSalary .accordion').hide();
        $('#cardExpense .accordion').hide();
        $('#cardSaving .accordion').hide();
    },

    this.showAccordion = function () {
        $('#cardSalary .accordion').show();
        $('#cardExpense .accordion').show();
        $('#cardSaving .accordion').show();
    },

    this.resetCashFlowSwipper = function () {
        var self = this;
        $rootScope.cashFlow.income = [];
        $rootScope.cashFlow.expense = [];
        $rootScope.cashFlow.cpf = [];
        $rootScope.utilService.scopeApply();
        this.hideAccordion();
        var cashFlowTemp = angular.copy(cashFlow);
        if ($rootScope.profile.client.married_status == null || $rootScope.profile.client.married_status == 0) {
            this.RemoveSpouseFromCashFlow(cashFlowTemp.income);
            this.RemoveSpouseFromCashFlow(cashFlowTemp.expense);
            this.RemoveSpouseFromCashFlow(cashFlowTemp.cpf);
        }

        if (typeof ($rootScope.profile.spouse) !== "undefined" && $rootScope.profile.spouse.occupation == 0) {
            this.RemoveSalarySpouseFromCashFlow(cashFlowTemp.income);
            this.RemoveSalarySpouseFromCashFlow(cashFlowTemp.expense);
            this.RemoveSalarySpouseFromCashFlow(cashFlowTemp.cpf);
        }

        this.RemoveChildFromCashFlow(cashFlowTemp.income, $rootScope.profile.children.childrens.length);
        this.RemoveChildFromCashFlow(cashFlowTemp.expense, $rootScope.profile.children.childrens.length);
        this.RemoveChildFromCashFlow(cashFlowTemp.cpf, $rootScope.profile.children.childrens.length);

        var cashFlowDataTmp = angular.copy($rootScope.cashFlow);
        if (angular.isDefined(cashFlowDataTmp)) {
            // Update value of cashFlowTemp
            var convertYearlyToMonthly = function (item) {
                item.value = item.default_value * 1000 / 12;

                item.value = utilService.roundNumber(item.value);
                if (angular.isDefined(item.children) && item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        convertYearlyToMonthly(item.children[i]);
                    }
                }
            }
            for (var i = 0; i < cashFlowTemp.income.length; i++) {
                convertYearlyToMonthly(cashFlowTemp.income[i]);
            }
            for (var i = 0; i < cashFlowTemp.expense.length; i++) {
                convertYearlyToMonthly(cashFlowTemp.expense[i]);
            }
            for (var i = 0; i < cashFlowTemp.cpf.length; i++) {
                convertYearlyToMonthly(cashFlowTemp.cpf[i]);
            }
            
            $rootScope.cashFlow = cashFlowTemp;
            
            $timeout(function () {
                self.showAccordion();
            }, 1500);
        }
    },

    this.updateCashFlow = function (cashFlowData) {       
        $rootScope.PersonaPlan.return_cashFlow = false;
        var self = this;
        if (angular.isDefined(cashFlowData) && cashFlowData != null) {
            if ($rootScope.isResetPlan) {
                this.itemParam = null;
            }
            if (this.itemParam == null) {
                this.updateCashFlowValue(cashFlowData, '');
            } else {
                this.updateCashFlowValue(cashFlowData, this.itemParam.name);
            }
            self.updateIncomeExpenseAndSavingFromCashflow();
            if ($rootScope.isResetPlan) {
                $rootScope.actionService.updatePersonalPlanOnServer();
                $rootScope.isResetPlan = false;
            }
            if (isSharing != true )
                this.SavingCashFlowData(cashFlowData);
            return;
        } else {           
            
            var cashFlowTemp = angular.copy(cashFlow);
            //$rootScope.cashFlow = angular.copy(cashFlow);

            if (angular.isUndefined($rootScope.cashFlow)) {
                $rootScope.isUpdateSavingGroup = false;
                // Add only cpf_total_contribution
                var cpf_total_contribution = null;
                angular.forEach(cashFlowTemp.cpf, function (item) {
                    if (item.name == 'cpf_total_contribution') {
                        cpf_total_contribution = item;
                    }
                });
                cashFlowTemp.cpf = [];
                if (cpf_total_contribution != null) {
                    cashFlowTemp.cpf.push(cpf_total_contribution);
                }
            }

            if ($rootScope.profile.client.married_status == null || $rootScope.profile.client.married_status == 0) {
                this.RemoveSpouseFromCashFlow(cashFlowTemp.income);
                this.RemoveSpouseFromCashFlow(cashFlowTemp.expense);
                this.RemoveSpouseFromCashFlow(cashFlowTemp.cpf);
            }

            if (typeof ($rootScope.profile.spouse) !== "undefined" && $rootScope.profile.spouse.occupation == 0) {
                this.RemoveSalarySpouseFromCashFlow(cashFlowTemp.income);
                this.RemoveSalarySpouseFromCashFlow(cashFlowTemp.expense);
                this.RemoveSalarySpouseFromCashFlow(cashFlowTemp.cpf);
            }

            this.RemoveChildFromCashFlow(cashFlowTemp.income, $rootScope.profile.children.childrens.length);
            this.RemoveChildFromCashFlow(cashFlowTemp.expense, $rootScope.profile.children.childrens.length);
            this.RemoveChildFromCashFlow(cashFlowTemp.cpf, $rootScope.profile.children.childrens.length);

            var cashFlowDataTmp = angular.copy($rootScope.cashFlow);
            if (angular.isDefined(cashFlowDataTmp)) {
                // Update value of cashFlowTemp
                var convertYearlyToMonthly = function (item) {
                    item.value = item.default_value * 1000 / 12;
                     
                    item.value = utilService.roundNumber(item.value);
                    if (angular.isDefined(item.children) && item.children.length > 0) {
                        for (var i = 0; i < item.children.length; i++) {
                            convertYearlyToMonthly(item.children[i]);
                        }
                    }
                }
                for (var i = 0; i < cashFlowTemp.income.length; i++) {
                    convertYearlyToMonthly(cashFlowTemp.income[i]);
                }
                for (var i = 0; i < cashFlowTemp.expense.length; i++) {
                    convertYearlyToMonthly(cashFlowTemp.expense[i]);
                }
                for (var i = 0; i < cashFlowTemp.cpf.length; i++) {
                    convertYearlyToMonthly(cashFlowTemp.cpf[i]);
                }
                $rootScope.cashFlow.income = [];
                $rootScope.cashFlow.expense = [];
                $rootScope.cashFlow.cpf = [];
                $rootScope.utilService.scopeApply();
                self.hideAccordion();
                
                $rootScope.cashFlow = cashFlowTemp;
                self.updateCashFlowValue(cashFlowDataTmp, '', true);
                self.updateIncomeExpenseAndSavingFromCashflow();
                $timeout(function () {
                    self.showAccordion();
                }, 1500);
                
            } else {
                $rootScope.utilService.scopeApply();
                $rootScope.cashFlow = cashFlowTemp;
                this.convertCashFlowFromYearlyToMonthly(true);
                self.updateIncomeExpenseAndSavingFromCashflow();
            }
        }
    },
    this.SavingCashFlowData = function (cashFlowData) {
        var self = this;
        var arrayData = [];
        var GetAllChildData = function (item) {
            if (angular.isDefined(item) && (angular.isDefined(item.children))) {
                if (item.children.length == 0) {
                    arrayData[arrayData.length] = {
                        user_id: user_id,
                        variable: item.name,
                        value: parseFloat(item.default_value)
                    };
                } else if (item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        GetAllChildData(item.children[i]);
                    }
                }
            } else if (angular.isDefined(item) && !angular.isDefined(item.children)) {
                for (var i = 0; i < item.length; i++) {
                    GetAllChildData(item[i]);
                }
            } 
        }
        var GetDataFromArray = function (arrayData) {
            for (var i = 0; i < arrayData.length; i++) {
                GetAllChildData(arrayData[i]);
            }
        }
        GetAllChildData(cashFlowData.income); // Income
        GetAllChildData(cashFlowData.expense); // Expense
        GetAllChildData(cashFlowData.cpf); // Expense
        GetAllChildData(cashFlowData.investment_start); // Expense

        var jsonObj = JSON.stringify(arrayData);
        
        if (!$rootScope.playBackPlayerData.isPlaying) {
            $timeout.cancel(this.timeoutUpdateCashFlowToDatabase);
            this.timeoutUpdateCashFlowToDatabase = $timeout(function () {
                //console.log('Saving Cashflow');
                utilService.callApi('POST', '/api/cashflow/update', '', jsonObj, function (response) {
                    self.updateYearlyCostReduction();
                });
            }, 300);
        }
    }

    this.timeoutUpdateCashFlowToDatabase = null;
   

    this.updateYearlyCostReduction = function () {
        console.log('yearly_cost_reduction');
        if ($rootScope.PersonaPlan.lifeEvent.length > 0) {
            var childIndependentNameWasUpdate = null;
            angular.forEach($rootScope.PersonaPlan.lifeEvent, function (lifeEvent) {
                if (lifeEvent.dream_type_id == 5 && lifeEvent.dependent_reference.indexOf('child_') == 0) {
                    var findIndex = null;
                    if ($rootScope.profile.children.childrens.length > 0) {
                        for (var i = 0; i < $rootScope.profile.children.childrens.length ; i++) {
                            if (('child_' + $rootScope.profile.children.childrens[i].id) == lifeEvent.dependent_reference) {
                                findIndex = i + 1;
                                break;
                            }
                        }
                    }
                    if (findIndex != null) {
                        var yearReductionCost = utilService.calculateExpenseOfChild(findIndex) * 12;
                        if (yearReductionCost.toFixed(0) != lifeEvent.yearly_cost_reduction.toFixed(0)) {
                            if (childIndependentNameWasUpdate == null) {
                                childIndependentNameWasUpdate = lifeEvent.name;
                            } else {
                                childIndependentNameWasUpdate += ', ' + lifeEvent.name;
                            }
                            lifeEvent.yearly_cost_reduction = yearReductionCost;
                        }
                    }
                }
            });
            console.log(childIndependentNameWasUpdate);
            if (childIndependentNameWasUpdate != null) {
                $rootScope.actionService.updatePersonalPlanOnServer();
                // utilService.ShowDialog($rootScope, utilService.translate('Updating the yearly cost reduction of life event: {{name}}', { name: childIndependentNameWasUpdate }));
            }
        }
    }

    this.initCashFlow = function () {
        $timeout(function () {
            $(selector).on('click', function () {
                parentDiv = upTo(this, 'DIV');
                if ($(this).hasClass('active')) {
                    $(selector).removeClass('active');
                    $(".popout .panel").removeClass('active');

                } else {
                    $(selector).removeClass('active');
                    $(".popout .panel").removeClass('active');
                    $(this).addClass('active');
                    $(parentDiv).addClass('active');
                }
            });
            $(function () {
                var active = true;
                $('#accordion').on('show.bs.collapse', function () {
                    if (active) $('#accordion .in').collapse('hide');
                });
                $('#accordion2').on('show.bs.collapse', function () {
                    if (active) $('#accordion2 .in').collapse('hide');
                });

                $('#accordion3').on('show.bs.collapse', function () {
                    if (active) $('#accordion3 .in').collapse('hide');
                });

                $('#accordion4').on('show.bs.collapse', function () {
                    if (active) $('#accordion4 .in').collapse('hide');
                });
            });
        }, 1000)
    }
    this.carouselIndex = 0;
    this.init = function () {
        this.initCashFlow();
        var self = this;
        var dataProvider = this.initDataForProvider();
        chart = AmCharts.makeChart("chartdiv", {
            "theme": "light",
            "type": "serial",
            "dataProvider": dataProvider,
            "pathToImages": "/Themes/" + version_id + "/Scripts/amcharts/images/",
            "graphs": [
              {
                  id:"income",
                  "fillAlphas": 0.9,
                  "lineAlpha": 0.2,
                  "title": utilService.translate("Annual Income"),
                  "type": "column",
                  "valueField": "income",
                  "colorField": "colorIncome",
                  "listeners": [{
                      "event": "rollOverItem",
                      "method": function (event) {
                          alert('version');
                      }
                  }],
                  "balloonFunction": function (graphDataItem, graph) { 
                      var dataContext = graphDataItem.dataContext;
                      var str = utilService.translate("Annual Income") + ": <span style='font-size:11px; color:#000000;'><b>" + $filter('number')(dataContext.income,0) + "</b></span>";
                      str += "<br />";
                      str += utilService.translate("Annual Expense") + ": <span style='font-size:11px; color:#000000;'><b>" + $filter('number')(dataContext.expense, 0) + "</b></span>";
                      return str;
                  }
              }, {
                  id: "expense",
                  "fillAlphas": 0.9,
                  "lineAlpha": 0.2,
                  "title": utilService.translate("Annual Expense"),
                  "type": "column",
                  "clustered": false,
                  "columnWidth": 0.5,
                  "valueField": "expense",
                  "colorField": "colorExpense",
                  "balloonFunction": function (graphDataItem, graph) {
                      var dataContext = graphDataItem.dataContext;
                      var str = utilService.translate("Annual Income") + ": <span style='font-size:11px; color:#000000;'><b>" + $filter('number')(dataContext.income, 0) + "</b></span>";
                      str += "<br />";
                      str += utilService.translate("Annual Expense") + ": <span style='font-size:11px; color:#000000;'><b>" +  $filter('number')(dataContext.expense,0)+ "</b></span>";
                      return str;
                  }
              }
            ],
            "categoryField": "year", 
            "categoryAxis": {              
                "axisColor": "#DADADA",
                "gridAlpha": 0.07,
                "title": utilService.translate("Age"),
                "guides": [{
                    category: $rootScope.PersonaPlan.retirement_age,
                    lineColor: "red",
                    above: true,
                    lineAlpha: 1,
                    dashLength: 2,
                    inside: true,
                    labelRotation: 90,
                    label: utilService.translate("Retirement Age")
                }]
            },
            "chartScrollbar": {},
            "startDuration": 1,
            addClassNames: true,
            "legend": {
                "enabled": true,
                "align": "center",
                "position": "bottom",
                "data":
                    [{ title: utilService.translate("Annual Income"), color: "#46C2FF", backgroundColor: "#2EFE2E" },
                     { title: utilService.translate("Annual Expense"), color: "#039BE4", backgroundColor: "#FF0000" }]
            },
            "allLabels": [],
            "export": {
                "enabled": false
            }

        });

        var startIndex = 0;
        zoomedEvent = null;
        chart.addListener("zoomed", function (event) {
            if (!isValidateData || zoomedEvent == null) {
                zoomEndIndex = event.endIndex;
                zoomStartIndex = event.startIndex;
                zoomedEvent = true;
            }
            startIndex = event.startIndex;
            var objsending = { datatype: 'zoomed', objecttype: 'dev_detailSavingRate', startIndex: event.startIndex, endIndex: event.endIndex };
            $rootScope.SendingScreenSharingDataObject(objsending, 'zoomed', 'savingRate', 'dev_detailSavingRate');
        });
        chart.addListener("rollOverGraphItem", function (event) {
            var expense = $("g.amcharts-graph-expense").find("path");
            expense.css({ "opacity": "0.1" });
            expense[event.index - startIndex].style.opacity = 0.9;
            var income = $("g.amcharts-graph-income").find("path");
            income.css({ "opacity": "0.1" });
            income[event.index - startIndex].style.opacity = 0.9;
            self.bindingDataForView(event.index);
            var objsending = { datatype: 'rollOverGraphItem', objecttype: 'rollOverGraphItem', index: event.index - startIndex };
            $rootScope.SendingScreenSharingDataObject(objsending, 'hover', 'rollOverGraphItem', 'chartdiv');
        }); 
        this.bingdingDataForSharing = function (index) {
            var expense = $("g.amcharts-graph-expense").find("path");
            expense.css({ "opacity": "0.1" });
            expense[index].style.opacity = 0.9;
            var income = $("g.amcharts-graph-income").find("path");
            income.css({ "opacity": "0.1" });
            income[index].style.opacity = 0.9;
            self.bindingDataForView(index);
        }; 
        $("#chartdiv").mouseleave(function (event) {
            self.resetValueForChart();
            var objsending = { datatype: 'leaveItem', objecttype: 'leaveItem' };
            $rootScope.SendingScreenSharingDataObject(objsending, 'hover', 'leaveItem', 'chartdiv');
        }); 
        self.bindingDataForView(0);
        this.chart = chart;
        var percentage = $rootScope.MonthlyExpense.monthlyRate;
        var dataProvider = [{
            "title": utilService.translate("Monthly Expense"),
            "value": $rootScope.MonthlyIncome.income
        }, {
            "title": utilService.translate("Monthly Saving"),
            "value": $rootScope.MonthlyIncome.income - $rootScope.MonthlyExpense.expenses
        }];
        var colors = ["#00A6FB", "#45C2FF"];
        if (percentage <= 0) {
            percentage = 0;
            dataProvider = [{
                "title": utilService.translate("Monthly Expense"),
                "value": $rootScope.MonthlyExpense.expenses

            }];
            colors = ["#FF5656"];
        }
        
        this.savingRateDonut = AmCharts.makeChart("savingRateDonut", {
            "type": "pie",
            "theme": "none",
            "allLabels": [{
                "text": $filter('number')(percentage, 2) + '%',
                "align": "center",
                "bold": true,
                "y": 70
            }],
            "dataProvider": dataProvider,
            "colors":colors,
            "titleField": "title",
            "valueField": "value",
            "labelRadius": -130,

            
            "radius": "42%",
            "innerRadius": "60%",
            
            /*
            "innerRadius": "60%",
            "pullOutRadius": "0%",
            "radius": "42%",
            "pullOutDuration": 0,
            "pullOutEffect": "none",
            "startEffect": "none",
            */

            "labelText": "",
            "balloon": {
                "maxWidth": 100
            },
            "balloonFunction": function (graphDataItem, graph) {
                return utilService.translate(graphDataItem.title);
            }
        });
        this.zoomChart();
    }
    this.zoomChart = function () {
        if (isValidateData && zoomEndIndex != null && zoomStartIndex != null) {
            chart.zoomToIndexes(zoomStartIndex, zoomEndIndex);
            isValidateData = false;
            return;
        }
        var index = chart.dataProvider.length;
        for (var i = 0; i < index; i++) {
            if (chart.dataProvider[i].year == "80")
                index = i;
        }
        chart.zoomToIndexes(0, index);
    }
    this.changeZoomToIndex = function (begin, end) {
        chart.zoomToIndexes(begin, end);
    };
    this.changeLanguageOfChart = function () {
        chart.legend.data[0].title = utilService.translate("Income");
        chart.legend.data[1].title = utilService.translate("Expense");
        isValidateData = true;
        chart.validateData();
    },
    this.getIncomeFrom = function (index, name) {
        var totalValue = 0;
        if (name === 'income_from_properties' && angular.isArray($rootScope.IlliquidCurveChart.illiquidAsset) && $rootScope.IlliquidCurveChart.illiquidAsset.length >0) {
            for (var i = 0; i < $rootScope.IlliquidCurveChart.illiquidAsset.length; i++) {
                totalValue += $rootScope.IlliquidCurveChart.illiquidAsset[i].income[index];
            }
        }
        return totalValue*1000;
    }
    this.getMortageRepayment = function (index) {
        var totalValue = 0;
        if ($rootScope.IlliquidCurveChart && angular.isArray($rootScope.IlliquidCurveChart.illiquidAsset) && $rootScope.IlliquidCurveChart.illiquidAsset.length > 0) {
            for (var i = 0; i < $rootScope.IlliquidCurveChart.illiquidAsset.length; i++) {
                totalValue += Math.abs($rootScope.IlliquidCurveChart.illiquidAsset[i].interest[index]);
                totalValue += Math.abs($rootScope.IlliquidCurveChart.illiquidAsset[i].principal[index]);
            }
        }
        return totalValue * 1000;
    }
    this.getExpensesFromProperty = function (index) {
        var totalValue = 0;
        if (angular.isArray($rootScope.IlliquidCurveChart.illiquidAsset) && $rootScope.IlliquidCurveChart.illiquidAsset.length > 0) {
            for (var i = 0; i < $rootScope.IlliquidCurveChart.illiquidAsset.length; i++) {
                totalValue += Math.abs($rootScope.IlliquidCurveChart.illiquidAsset[i].expenses[index]);                
            }
        }
        return totalValue * 1000;
    }    
    this.bindingDataForView = function (index) {
        if ($rootScope.IncomeData.recurring_incomes != null) {
            $rootScope.MonthlyIncome.age = $rootScope.PersonaPlan.start_age + index;
            $rootScope.MonthlyIncome.income_from_properties = this.getIncomeFrom(index,'income_from_properties');
            $rootScope.MonthlyIncome.income_from_properties = isCumulative_inflation ? $rootScope.MonthlyIncome.income_from_properties / $rootScope.Cumulative_inflation[index] : $rootScope.MonthlyIncome.income_from_properties;
            //$rootScope.MonthlyIncome.income_from_investment = isCumulative_inflation ? $rootScope.IncomeData.income_from_investment[index] / $rootScope.Cumulative_inflation[index] : $rootScope.IncomeData.income_from_investment[index];
            $rootScope.MonthlyIncome.exceptional_incomes = isCumulative_inflation ? $rootScope.IncomeData.exceptional_incomes[index] / $rootScope.Cumulative_inflation[index] : $rootScope.IncomeData.exceptional_incomes[index];
            $rootScope.MonthlyIncome.recurring_incomes = isCumulative_inflation ? $rootScope.IncomeData.recurring_incomes[index] / $rootScope.Cumulative_inflation[index] : $rootScope.IncomeData.recurring_incomes[index];
            $rootScope.MonthlyIncome.income_from_social_security = isCumulative_inflation ? $rootScope.IncomeData.income_from_social_security[index] / $rootScope.Cumulative_inflation[index] : $rootScope.IncomeData.income_from_social_security[index];
            $rootScope.MonthlyIncome.income_from_salary = isCumulative_inflation ? $rootScope.IncomeData.income_from_salary[index] / $rootScope.Cumulative_inflation[index] : $rootScope.IncomeData.income_from_salary[index];
            //$rootScope.MonthlyIncome.income = isCumulative_inflation ? $rootScope.IncomeData.total_incomes[index] / $rootScope.Cumulative_inflation[index] : parseFloat($rootScope.IncomeData.total_incomes[index]);

            $rootScope.MonthlyIncome.income = $rootScope.MonthlyIncome.income_from_salary + $rootScope.MonthlyIncome.income_from_properties + $rootScope.MonthlyIncome.exceptional_incomes + $rootScope.MonthlyIncome.income_from_social_security;

            $rootScope.MonthlyExpense.recurring_expense = isCumulative_inflation ? $rootScope.ExpenseData.recurring_expense[index] / $rootScope.Cumulative_inflation[index] : $rootScope.ExpenseData.recurring_expense[index];
            //$rootScope.MonthlyExpense.expenses_at_retirement = isCumulative_inflation ? $rootScope.ExpenseData.expenses_at_retirement[index] / $rootScope.Cumulative_inflation[index] : $rootScope.ExpenseData.expenses_at_retirement[index];
            //$rootScope.MonthlyExpense.expenses_prior_retirement = isCumulative_inflation ? $rootScope.ExpenseData.expenses_prior_retirement[index] / $rootScope.Cumulative_inflation[index] : $rootScope.ExpenseData.expenses_prior_retirement[index];
            //$rootScope.MonthlyExpense.expenses = isCumulative_inflation ? $rootScope.ExpenseData.total_expenses[index] / $rootScope.Cumulative_inflation[index] : parseFloat($rootScope.ExpenseData.total_expenses[index]);
            $rootScope.MonthlyExpense.MortageRepayment = isCumulative_inflation ? this.getMortageRepayment(index) / $rootScope.Cumulative_inflation[index] : this.getMortageRepayment(index);
            $rootScope.MonthlyExpense.expenses_from_properties = isCumulative_inflation ? this.getExpensesFromProperty(index) / $rootScope.Cumulative_inflation[index] : this.getExpensesFromProperty(index);

            //$rootScope.MonthlyExpense.other_expenses = 0;
            
            $rootScope.MonthlyExpense.exception_expenses = isCumulative_inflation ? $rootScope.ExpenseData.insufficient_funds[index] / $rootScope.Cumulative_inflation[index] : parseFloat($rootScope.ExpenseData.insufficient_funds[index]);
            $rootScope.MonthlyExpense.expenses = $rootScope.MonthlyExpense.recurring_expense + $rootScope.MonthlyExpense.MortageRepayment + $rootScope.MonthlyExpense.expenses_from_properties + $rootScope.MonthlyExpense.exception_expenses;
            $rootScope.MonthlySaving.net_cpf_contribution = $rootScope.net_cpf_contribute[index] * 1000;
            $rootScope.MonthlySaving.own_saving = Math.max(0, $rootScope.MonthlyIncome.income - $rootScope.MonthlyExpense.expenses - $rootScope.MonthlySaving.net_cpf_contribution);
            $rootScope.MonthlySaving.saving = Math.max(0,$rootScope.MonthlySaving.net_cpf_contribution + $rootScope.MonthlySaving.own_saving);
            
            if ($rootScope.MonthlyIncome.income == 0)
                $rootScope.MonthlySaving.monthlyRate = 0;
            else
                $rootScope.MonthlySaving.monthlyRate = $rootScope.MonthlySaving.own_saving / $rootScope.MonthlyIncome.income * 100;

            
            this.updateSavingRateDonutChart();
            $timeout(function () {
                $rootScope.$apply();
            }, 50);
        }
    }
    this.updateSavingRateDonutChart = function () {
        
        var percentage = $rootScope.MonthlySaving.monthlyRate;
        var dataProvider = [];
        var color = [];
        if ($rootScope.MonthlySaving.own_saving > 0) {
            percentage = 100 * ($rootScope.MonthlySaving.own_saving + $rootScope.MonthlySaving.net_cpf_contribution) / $rootScope.MonthlyIncome.income;
            dataProvider = [{
                "title": utilService.translate("Monthly expenses") + ': <br>' + $rootScope.PersonaPlan.currency_code + ' ' + $filter('number')(($rootScope.MonthlyExpense.expenses)  / 12, 0),
                "value": ($rootScope.MonthlyExpense.expenses ) / 12
            }, {
                "title": utilService.translate("Monthly own saving and net cpf") + ': <br>' + $rootScope.PersonaPlan.currency_code + ' ' + $filter('number')(($rootScope.MonthlySaving.own_saving + $rootScope.MonthlySaving.net_cpf_contribution) / 12, 0),
                "value": ($rootScope.MonthlySaving.own_saving + $rootScope.MonthlySaving.net_cpf_contribution) / 12
            }];
            colors = ["#00A6FB", "#45C2FF"];
        } else{        
            percentage = Math.abs($rootScope.MonthlyIncome.income -($rootScope.MonthlyExpense.expenses + $rootScope.MonthlySaving.net_cpf_contribution)) / ($rootScope.MonthlyExpense.expenses + $rootScope.MonthlySaving.net_cpf_contribution) * 100;
            dataProvider = [{
                "title": utilService.translate("Monthly income") + ': <br>' + $rootScope.PersonaPlan.currency_code + ' ' + $filter('number')($rootScope.MonthlyIncome.income / 12, 0),
                "value": $rootScope.MonthlyIncome.income / 12

            },{
                "title": utilService.translate("Monthly unsecured debt") + ': <br>' + $rootScope.PersonaPlan.currency_code + ' ' + $filter('number')(Math.abs($rootScope.MonthlyIncome.income - ($rootScope.MonthlyExpense.expenses + $rootScope.MonthlySaving.net_cpf_contribution)) / 12, 0),
                "value": Math.abs($rootScope.MonthlyIncome.income - ($rootScope.MonthlyExpense.expenses + $rootScope.MonthlySaving.net_cpf_contribution)) / 12
            }];
            colors = ["#45C2FF", "#FF5656"];
        }
        if (this.savingRateDonut != null) { 
            this.savingRateDonut.dataProvider = dataProvider;
            this.savingRateDonut.colors = colors;
            this.savingRateDonut.allLabels[0].text = $filter('number')(percentage, 2) + '%';
            this.savingRateDonut.validateData();
        }
    }
    this.isBindingDataForChart = false;
    this.updateChart = function () {
        
        if (chart == null) {
            isValidateData = true;
            this.init();
        }
        if (angular.isDefined(chart.dataProvider)) chart.dataProvider.shift();
        chart.dataProvider.shift();
        chart.dataProvider = this.initDataForProvider();
        this.isBindingDataForChart = true;
        isValidateData = true;
        if (chart.categoryAxis.guides && chart.categoryAxis.guides.length > 0) {
            chart.categoryAxis.guides[0].category = $rootScope.PersonaPlan.retirement_age;
        }
        
        // chart.validateData();
        // this.zoomChart();
        // this.updateIncomeExpenseAndSavingFromCashflow();
        this.bindingDataForView(0);
        this.updateSavingRateDonutChart();
        
    }

    this.showChart = function () {
        if (this.isBindingDataForChart) {
            chart.validateData();
            this.savingRateDonut.validateData();
            this.zoomChart();
            this.isBindingDataForChart = false;
        }
    }

    this.resetValueForChart = function () {
        var expense = $("g.amcharts-graph-expense").find("path");
        expense.css({ "opacity": "0.9" });
        var income = $("g.amcharts-graph-income").find("path");
        income.css({ "opacity": "0.9" });
        this.bindingDataForView(0);
    }
    this.timeoutObj = null;
    this.changeIncome = function (item) {
        var itemParam = {
            name: 'recurring_income',
            value: $rootScope.PersonaPlan.income_today
        };        
        var net_cpf = $rootScope.net_cpf_contribute ? $rootScope.net_cpf_contribute[0] * 1000  : 0;

        $rootScope.PersonaPlan.saving_today = utilService.roundNumber(($rootScope.MonthlyIncome.income - $rootScope.MonthlyExpense.expenses - net_cpf)/12);
        var self = this;
        var incomeToday = $rootScope.PersonaPlan.income_today;
        $timeout.cancel(this.timeoutObj);
        this.timeoutObj = $timeout(function () {
            if ($rootScope.PersonaPlan.income_today.toFixed(2) == incomeToday.toFixed(2)) {
                self.updateCashFlowParam(itemParam);
    }
        }, 1500);
    }
    this.changeParent = function (item) {
        var itemDataValue = item.value;
        var self = this;
        $timeout.cancel(this.timeoutObj);
        this.timeoutObj = $timeout(function () {
            if (item.value.toFixed(2) == itemDataValue.toFixed(2)) {
                self.updateCashFlowParam(item);
            }
        }, 1500);        
    },
    this.changeSavingParent = function (item) {        
        var net_cpf = $rootScope.net_cpf_contribute ? $rootScope.net_cpf_contribute[0] * 1000 : 0;
        var mortage = this.getMortageRepayment(0);
        var expense = $rootScope.MonthlyIncome.income - 12 * $rootScope.PersonaPlan.saving_today - mortage - net_cpf;
        if (expense <= 0) {
            utilService.showErrorMessage(utilService.translate("Savings must be lower than your total income"));
            $timeout(function () {
                $rootScope.PersonaPlan.saving_today = utilService.roundNumber(($rootScope.MonthlyIncome.income - $rootScope.MonthlyExpense.expenses - net_cpf) / 12);
            }, 50);
        } else {
            $rootScope.PersonaPlan.expense_today = expense/12;
            this.changeExpense();
        }
    },
    this.changeExpense = function (item) {
        var itemParam = {
            name: 'recurring_expenses',
            value: $rootScope.PersonaPlan.expense_today
        };
        var mortage = this.getMortageRepayment(0) ;
        var net_cpf = $rootScope.net_cpf_contribute ? $rootScope.net_cpf_contribute[0] * 1000: 0;

        $rootScope.PersonaPlan.saving_today = utilService.roundNumber(($rootScope.MonthlyIncome.income - $rootScope.PersonaPlan.expense_today * 12 - mortage - net_cpf) / 12);        
        var self = this;
        var expense_today = $rootScope.PersonaPlan.expense_today;
        $timeout.cancel(this.timeoutObj);
        this.timeoutObj = $timeout(function () {
            if ($rootScope.PersonaPlan.expense_today.toFixed(2) == expense_today.toFixed(2)) {
                self.updateCashFlowParam(itemParam);
                self.updateValueOnSwipe();
            }
        }, 1500);
    },
    this.AddItimeToListItemChanged = function (item) {
        item.isSended = false;
        var isAdded = false;
        for (var i = 0; i < listItemChanged.length; i++) {
            if (listItemChanged[i].name == item.name) {
                listItemChanged[i] = item;
                isAdded = true;
                break;
            }
        }
        if (!isAdded) {
            listItemChanged[listItemChanged.length] = item;
        }
        return listItemChanged;
    },
    this.updateCashFlowParam = function (item) {
        var self = this;
        $timeout.cancel(this.timeoutObj);
        if (!angular.isUndefined(item)) {
            this.timeoutObj = $timeout(function () {
                if (angular.isUndefined(item.value) || item.value == '') {
                    item.value = 0;
                }
                $rootScope.SendingScreenSharingDataObject({ itemData: item, cashFlow: $rootScope.cashFlow }, 'change_income_or_expense_value', 'change_value', item.name);
                $rootScope.PersonaPlan.return_cashFlow = true;
                listItemChanged = self.AddItimeToListItemChanged(item);
                $rootScope.actionService.calculateData(null, listItemChanged);
                listItemChanged =[];
                $rootScope.actionService.updatePersonalPlanOnServer();
                if (!$rootScope.playBackPlayerData.isPlaying) {
                    utilService.callApi('POST', '/api/cashflow/update_main_item', '', item, function (response) {
                    });
                }
                self.bindingDataForView(0);
            }, 1000);
        } else {
            this.timeoutObj = $timeout(function () {
                $rootScope.PersonaPlan.return_cashFlow = true;
                $rootScope.actionService.calculateData();
                $rootScope.actionService.updatePersonalPlanOnServer();
                self.bindingDataForView(0);
            }, 1000);
        }
    },
    this.expandControlSharing = function (key) {
        var self = this;
        var obj = $('#income_expense_header_' + key);
        var parentObj = obj.parent();
        var expended = obj.attr('aria-expanded');
        if (obj.attr('aria-expanded') == 'true') {         
            self.expandAllControl(key);
        } else {            
            self.collapseAllControl(key);
        }
    }
    this.expandControl = function (key) { 
        var obj = $('#income_expense_header_' + key);
        var expandOrCollapse = obj.attr('aria-expanded');
        if (angular.isUndefined(expandOrCollapse) || expandOrCollapse == 'false') {
            var parentObj = obj.parent();
            if (parentObj.hasClass('panel') && parentObj.hasClass('panel-default')) {
                var accordionPanel = $('#savings .accordion .panel');
                angular.forEach(accordionPanel, function (panel) {
                    var Panel = $(panel);
                    Panel.removeClass('active'); 
                });
            };
            try {
                $timeout(function () {
                    var parentObj = obj.parent();
                    if (parentObj.hasClass('panel') && parentObj.hasClass('panel-default')) {
                        parentObj.addClass('active');
                        obj.trigger('click');
                    } else {
                    }
                    
                }, 150);
                
            } catch (ex) { };
        } else if (expandOrCollapse == 'true') {
            //obj.trigger('click');
        }
    }
    this.expandOrCollapse = function (key) {
        console.log('expandOrCollapse '+ key);
        var listPanel = $('#div_SavingRate .panel.panel-default');
        var self = this;
        $timeout(function () {
            var obj = $('#income_expense_header_' + key);
            var parentObj = obj.parent();
            var expended = obj.attr('aria-expanded');
            if (obj.attr('aria-expanded') == 'true') {
                console.log('addClass');
                parentObj.addClass('active');
                $rootScope.SendingScreenSharingDataObject(key, 'savingRate', 'saving_rate_expand_key', key);
            } else {
                console.log('removeClass');
                parentObj.removeClass('active');
                $rootScope.SendingScreenSharingDataObject(key, 'savingRate', 'saving_rate_collapse_key', key);
            }
            
        }, 300)
        
    }
    this.expandAllControl = function (key) { 
        var obj = $('#income_expense_header_' + key);
        var parentObj = obj.parent();        
        if (parentObj.hasClass('panel') && parentObj.hasClass('panel-default')) {
            parentObj.addClass('active');
        }
        $(obj).removeClass('collapsed').attr('aria-expanded', 'true');
        $(obj.children[0]).addClass('active');
        $('#collapse-' + key).addClass('active').addClass('in').attr('aria-expanded', 'true').attr('style', '');        
    }
    this.collapseAllControl = function (key) { 
        var obj = $('#income_expense_header_' + key);
        var expandOrCollapse = obj.attr('aria-expanded');
        var parentObj = obj.parent();
        if (parentObj.hasClass('panel') && parentObj.hasClass('panel-default')) {
            parentObj.removeClass('active');
        }
        $(obj).addClass('collapsed').attr('aria-expanded', 'false');
        $(obj.children[0]).removeClass('active');
        $('#collapse-' + key).removeClass('active').removeClass('in').attr('aria-expanded', 'false').attr('style', 'height: 0px;');
        
    }
    this.showAllDetails = function () {
        var self = this;
        switch ($rootScope.savingRate.carouselIndex) {
            case 0:
                for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                    this.expandAllControl($rootScope.cashFlow.income[i].name);
                }
                 
                break;
            case 1:
                for (var i = 0; i < $rootScope.cashFlow.cpf.length; i++) {
                    this.expandAllControl($rootScope.cashFlow.cpf[i].name);
                }
                break;
            case 2:
                for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                    this.expandAllControl($rootScope.cashFlow.expense[i].name);
                }
                angular.forEach($rootScope.existingDrForExpenseCash, function (dream) {
                    self.expandAllControl(dream.id);
                });
                this.expandAllControl('other_tax');
                break;
             
            default: 
        }
        $rootScope.SendingScreenSharingDataObject($rootScope.savingRate.carouselIndex, 'savingRate', 'showAllDetails', '');
    }
    this.collapseAll = function () {
        var self = this;
        switch ($rootScope.savingRate.carouselIndex) {
            case 0:
                for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                    this.collapseAllControl($rootScope.cashFlow.income[i].name);
                }

                break;
            case 1:
                for (var i = 0; i < $rootScope.cashFlow.cpf.length; i++) {
                    this.collapseAllControl($rootScope.cashFlow.cpf[i].name);
                }
                break;
            case 2:
                for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                    this.collapseAllControl($rootScope.cashFlow.expense[i].name);
                }
                angular.forEach($rootScope.existingDrForExpenseCash, function (dream) {
                    self.collapseAllControl(dream.id);
                });
                this.collapseAllControl('other_tax');
                break;
            
            default:
        }
        $rootScope.SendingScreenSharingDataObject($rootScope.savingRate.carouselIndex, 'savingRate', 'collapseAll', '');
    },
    this.UpdateControlForShareScreen = function (obj) {
        switch (obj.actionEvent) {
            case 'change_value':
                if (obj.newValue.itemData.name === 'recurring_income') {
                    $rootScope.PersonaPlan.income_today = obj.newValue.itemData.value;
                } else if (obj.newValue.itemData.name === 'recurring_expenses') {
                    $rootScope.PersonaPlan.expense_today = obj.newValue.itemData.value;
                } else if (obj.newValue.itemData.name === 'saving_today') {
                    $rootScope.PersonaPlan.saving_today = obj.newValue.itemData.value;
                } else {
                    this.updateByKeyForCashflow(obj.newValue.itemData);
                }
                this.itemParam = obj.newValue.itemData;
                utilService.scopeApply();
                break; 
            case 'changeInflattion':
                if (obj.newValue == true) {
                    $('#savrates-btn1').click();
                } else {
                    $('#savrates-btn2').click();
                }
                this.changeInflattion(obj.newValue);
                break;
            case 'showAllDetails':
                this.showAllDetails();
                break;
            case 'collapseAll':
                this.collapseAll();
                break;
            case 'saving_rate_expand_key':
                this.collapseAll();
                this.expandAllControl(obj.newValue);
                break;
            case 'saving_rate_collapse_key':
                this.collapseAllControl(obj.newValue);
                break;
            default:
        }

    },
    this.updateByKeyForCashflow = function (item) {
        $timeout(function () {
            $rootScope.utilService.scopeApply();
        }, 300);
        var updateKeyValue = function (keyValueItem) {
            if (keyValueItem.name == item.name) {
                if (name == 'recurring_income') {
                    $rootScope.PersonaPlan.income_today = item.value;
                } else if (name == 'recurring_expenses') {
                    $rootScope.PersonaPlan.expense_today = item.value;
                } else if (name == 'saving_today') {
                    $rootScope.PersonaPlan.saving_today = item.value;
                } else {
                    keyValueItem.value = item.value;
                }
            } else {
                if (angular.isDefined(keyValueItem.children) && angular.isArray(keyValueItem.children) && keyValueItem.children.length > 0) {
                    for (var i = 0; i < keyValueItem.children.length; i++) {
                        updateKeyValue(keyValueItem.children[i]);
                    }
                }
            }
        }
        if (angular.isDefined(playBackCashFlow)) {
            $rootScope.PersonaPlan.return_cashFlow = true;
        } else {
            for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                updateKeyValue($rootScope.cashFlow.income[i]);
            }
            for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                updateKeyValue($rootScope.cashFlow.expense[i]);
            }
            for (var i = 0; i < $rootScope.cashFlow.cpf.length; i++) {
                updateKeyValue($rootScope.cashFlow.cpf[i]);
            }
        }
    }
    this.updateIncomeOrExpenseValue = function (item, playBackCashFlow) {
        this.updateByKeyForCashflow(item); 
        this.updateIncomeExpenseAndSavingFromCashflow();        
    }
    this.expenseAdd = function (item) {
    }
    this.expenseRemove = function (item) {
    }

    this.enterKey = function (name) {
        var key = '';
        if (name == 'income_today') {
            key = $rootScope.cashFlow.income[0].name;
            this.expandControl(key);
            key = 'income_expense_' + key;
        } else if (name == 'expense_today') {
            key = $rootScope.cashFlow.expense[0].name;
            this.expandControl(key);
            key = 'income_expense_' + key;
        } else if (name == 'saving_today') {
            key = $rootScope.cashFlow.cpf[0].name;
            this.expandControl(key);
            //key = 'income_expense_' + key;
        } else {
            // if name is key_name of income or expense
            var obj = null;
            this.searchTreeResult = [];
            this.searchTreeResultTmp = [];
            for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                if ($rootScope.cashFlow.income[i].name == name) {
                    this.searchTreeResult.push($rootScope.cashFlow.income[i]);
                } else {
                    this.searchTreeResultTmp = [];
                    this.searchOnTree($rootScope.cashFlow.income[i], name);
                }
            }
            for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                if ($rootScope.cashFlow.expense[i].name == name) {
                    this.searchTreeResult.push($rootScope.cashFlow.expense[i]);
                } else {
                    this.searchTreeResultTmp = [];
                    this.searchOnTree($rootScope.cashFlow.expense[i], name);
                }
            }
            for (var i = 0; i < $rootScope.cashFlow.cpf.length; i++) {
                if ($rootScope.cashFlow.cpf[i].name == name) {
                    this.searchTreeResult.push($rootScope.cashFlow.cpf[i]);
                } else {
                    this.searchTreeResultTmp = [];
                    this.searchOnTree($rootScope.cashFlow.cpf[i], name);
                }
            }
            var self = this;
            var findAtLevel1 = function () {
                obj = self.searchTreeResult[0];
                // Find next item
                var findIndex = -1;
                for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                    if ($rootScope.cashFlow.income[i].name == obj.name) {
                        findIndex = i;
                        break;
                    }
                }
                if (findIndex == -1) {
                    // Find on expense
                    for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                        if ($rootScope.cashFlow.expense[i].name == obj.name) {
                            findIndex = i;
                            break;
                        }
                    }
                    if (findIndex != -1) {
                        // Find on expense
                        var resultIndex = findIndex + 1;
                        if (resultIndex < $rootScope.cashFlow.expense.length) {
                            var objTmp = $rootScope.cashFlow.expense[resultIndex];
                            self.expandControl(objTmp.name);
                            key = 'income_expense_' + objTmp.name;
                        } else {
                            var objTmp = $rootScope.cashFlow.expense[$rootScope.cashFlow.expense.length - 1];
                            var objTmp = $('#income_expense_header_' + objTmp.name);
                            var parentObj = objTmp.parent();
                            if (parentObj.hasClass('panel') && parentObj.hasClass('panel-default')) {
                                parentObj.removeClass('active');
                            };
                            $timeout(function () {
                                objTmp.trigger('click');
                            }, 150);
                            
                        }
                    }
                } else {
                    // Find on income
                    var resultIndex = findIndex + 1;
                    if (resultIndex < $rootScope.cashFlow.income.length) {
                        var obj = $('#income_expense_header_' + name);
                        
                        var parentObj = obj.parent();
                        if (parentObj.hasClass('panel') && parentObj.hasClass('panel-default')) {
                            var accordionPanel = $('#savings .accordion .panel');
                            angular.forEach(accordionPanel, function (panel) {
                                var Panel = $(panel);
                                Panel.removeClass('active');
                            });
                        };
                        var objTmp = $rootScope.cashFlow.income[resultIndex];
                        self.expandControl(objTmp.name);
                        key = 'income_expense_' + objTmp.name;
                        
                    } else {
                        
                        var objTmp = $rootScope.cashFlow.income[$rootScope.cashFlow.income.length - 1];
                        var objTmp = $('#income_expense_header_' + objTmp.name);
                        
                        var parentObj = objTmp.parent();
                        if (parentObj.hasClass('panel') && parentObj.hasClass('panel-default')) {
                            parentObj.removeClass('active');
                        };
                        $timeout(function () {
                            objTmp.trigger('click');
                        }, 150);
                }
            }
                }
            var findAtLevel = function (level) {
                if (level == 1) {
                    findAtLevel1();
                } else {
                    obj = self.searchTreeResult[level - 2];
                    var findIndex = -1;
                    for (var i = 0; i < obj.children.length; i++) {
                        if (obj.children[i].name == name) {
                            findIndex = i;
                            break;
                        }
                    }
                    var resultIndex = findIndex + 1;
                    if (findIndex != -1){
                        if (resultIndex < obj.children.length) {
                            var objTmp = obj.children[resultIndex];
                            self.expandControl(objTmp.name);
                            key = 'income_expense_' + objTmp.name;
                        } else {
                            findAtLevel(level - 1);
                        }
                    } else {
                        findAtLevel(level - 1);
                    }
                }
            }
            if (this.searchTreeResult.length == 1) {
                findAtLevel1();
            } else {
                findAtLevel(this.searchTreeResult.length);
            }
            
        }
        if (key != '') {
            $timeout(function () {
                var obj = angular.element('#' + key);
                obj.focus();
                obj.select();
            }, 500)
        }
    }
    this.searchTreeResult = [];
    this.searchTreeResultTmp = [];
    this.searchOnTree = function (item, name) {
        this.searchTreeResultTmp.push(item);
        if (item.children.length == 0) {
            this.searchTreeResultTmp.pop();
        } else {
            for (var i = 0; i < item.children.length; i++) {
                if (item.children[i].name == name) {
                    this.searchTreeResult = angular.copy(this.searchTreeResultTmp);
                    this.searchTreeResult.push(item.children[i]);
                } else {
                    this.searchOnTree(item.children[i], name);
                }
            }
        }
    }
    this.focusValue = null;
    this.itemParam = null;
    this.onFocus = function (name, item) {
        var self = this;
        $timeout(function () {
            this.focusValue = null;
            if (name == 'income_today') {
                self.focusValue = $rootScope.PersonaPlan.income_today;
            } else if (name == 'expense_today') {
                self.focusValue = $rootScope.PersonaPlan.expense_today;
            } else if (name == 'saving_today') {
                self.focusValue = $rootScope.PersonaPlan.saving_today;
            } else {
                self.focusValue = item.value;
            }
        }, 300);
    }
    this.onBlur = function (name, item) {
        var newValue = null;
        var nameValue = null;
        if (name == 'income_today') {
            newValue = $rootScope.PersonaPlan.income_today;
            nameValue = 'recurring_income';
            if ($rootScope.isShowManual) {
                $rootScope.backupPersonaPlan = angular.copy($rootScope.PersonaPlan);
            }
        } else if (name == 'expense_today') {
            newValue = $rootScope.PersonaPlan.expense_today;
            nameValue = 'recurring_expenses';
        } else if (name == 'saving_today') {
            newValue = $rootScope.PersonaPlan.saving_today;
            nameValue = 'saving_today';
        } else {
            newValue = item.value;
            nameValue = name;
        }
        if ($rootScope.isShowManual) {
            $rootScope.backupPersonaPlan = angular.copy($rootScope.PersonaPlan);
        }
        var self = this;
        $timeout(function () {
            if (self.focusValue != null && newValue != null && self.focusValue != newValue) {
                
                if (nameValue == 'saving_today') {
                    self.changeSavingParent();
                } else {

                    self.itemParam = {
                        name: nameValue,
                        value: newValue
                    };
                    console.log(self.itemParam);
                    self.updateCashFlowParam(self.itemParam);
                    self.updateValueOnSwipe();
                }
            }
        }, 100)
    }

    this.changeIncomeAndExpenseWhenPlayBack = function (obj) {
    }

    this.showPopupEmergencySaving = function () {
        var dialog = $('#EmergencySavingDialog');
        dialog.modal('show');
    }

    this.saveEmergencySaving = function () {
        dialog.modal('hide');
    }

    $rootScope.$watch('savingRate.carouselIndex', function () {       
        $rootScope.SendingScreenSharingDataObject($rootScope.savingRate.carouselIndex, 'changeCardSwiper', 'showCard', 'activeIndex');

    })
    this.changeInflattion = function (status) {
        isCumulative_inflation = status;
        this.updateChart();
        this.showChart();
        $rootScope.SendingScreenSharingDataObject(status, 'savingRate', 'changeInflattion', 'activeIndex');
    }
    this.enterTab = function (element) { 
        $('#hidden_input').focus();
    }
    return this;
});
