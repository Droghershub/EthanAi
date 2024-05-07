btoApp.run(function ($rootScope, startService, CONFIG, utilService, $timeout, personalPlanService, illiquidAssetService, investmentService, retirementLifeStyleService, savingRateService, $http, $websocket, manageAvatarService, smallTimelineService, $interval, summaryCardService, quickSettingService, parameterService, $filter) {
    $rootScope.summaryCardService = summaryCardService;
    $rootScope.calculateWebSocket = null;
    $rootScope.isfirstload = true;
    // Init websocket to call websocket calculate1
    $rootScope.initWebSocketCalculateMonteCarlo = function () {
        var socketUrl = '';
        /*
        if ($rootScope.Scheme == 'http')
            socketUrl = 'ws://' + $rootScope.APIJavaEngine + '/calculate';
        else if ($rootScope.Scheme == 'https')
            socketUrl = 'wss://' + $rootScope.APIJavaEngine + '/calculate';
        */
        //console.log('init websocket calcualtion');
        socketUrl = 'wss://' + $rootScope.APIJavaEngine + '/calculate';

        /*
        if (window.location.protocol == 'https:') {
            socketUrl = 'wss://zymi.cloudapp.net/calculate';
        }
        */
        if ($rootScope.calculateWebSocket == null) {
            $rootScope.calculateWebSocket = $websocket.$new({

                lazy: true,
                //enqueue: true
                //url: 'ws://localhost:8084/BTOAPI/calculate',
                reconnect: true,
                reconnectInterval: 5000,
                //mock: false		
                url: socketUrl
            });
            $rootScope.calculateWebSocket.$open();
            $rootScope.calculateWebSocket.$on('$open', function () {
                $rootScope.calculateWebSocket.$emit('get_session', {});
            });

        }
         
        $rootScope.calculateWebSocket.$on('$message', function (data) {
            var jsonData = JSON.parse(data);
            if (jsonData.type == 'get_session') {
                $rootScope.sessionId = jsonData.data;
                //console.log('$rootScope.sessionId :', jsonData.data);
            } else { 
                jsonData.is_from_calculate_web_socket = true;
                $rootScope.ApplyAllData(jsonData);
            }
        })
    }
    //$rootScope.initWebSocketCalculateMonteCarlo();
    $rootScope.illiquidAsset = illiquidAssetService;
    $rootScope.investment = investmentService;
    $rootScope.retirementLifeStyle = retirementLifeStyleService;
    //  $rootScope.taxOptimization = taxOptimizationService;
    $rootScope.manageAvatarService = manageAvatarService;
    $rootScope.smallTimelineService = smallTimelineService;
    $rootScope.quickSettingService = quickSettingService;
    //$rootScope.quickHelpService = quickHelpService;
    //  $rootScope.newsService = newsService;
    $rootScope.parameterService = parameterService;
    $rootScope.existingDrForIncomeCash = [];
    $rootScope.existingDrForExpenseCash = [];
    $rootScope.sumExpenseProperty = { id: 0, display: 'Property expenses', value: 0 };
    CONFIG.CHART = {
        LIQUID: {
            animation: true,
            animationSteps: 15,
            responsive: true,
            datasetFill: true,
            // Array - Array of string names to attach tooltip events
            //    tooltipEvents: ["mousemove", "touchstart", "touchmove"],
            //scaleFontColor: "#ff0000",
            bezierCurve: false,
            pointDot: false,
            scaleShowLabels: true,
            colorMedian: '#33b5e5',
            colorBottom: '#ff4444',
            colorTop: '#00c851',
            colorZeroReturn: '#ffbb33',
            colorNegative: '#FF0000',
            //      isNegativeColor: true,

            scaleGridLineColor: "rgba(0,0,0,.05)",


            ///Boolean - Whether grid lines are shown across the chart
            scaleShowGridLines: true,

            //String - Colour of the grid lines
            scaleGridLineColor: "rgba(0,0,0,.05)",

            //Number - Width of the grid lines
            scaleGridLineWidth: 1,

            //Boolean - Whether to show horizontal lines (except X axis)
            scaleShowHorizontalLines: true,

            //Boolean - Whether to show vertical lines (except Y axis)
            scaleShowVerticalLines: true,

            //Boolean - Whether the line is curved between points
            bezierCurve: true,

            //Number - Tension of the bezier curve between points
            bezierCurveTension: 0.4,

            //Boolean - Whether to show a dot for each point
            //pointDot: true,

            ////Number - Radius of each point dot in pixels
            //pointDotRadius: 4,

            ////Number - Pixel width of point dot stroke
            //pointDotStrokeWidth: 1,

            //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
            pointHitDetectionRadius: 20,

            //Boolean - Whether to show a stroke for datasets
            datasetStroke: true,

            //Number - Pixel width of dataset stroke
            datasetStrokeWidth: 2,

            //Boolean - Whether to fill the dataset with a colour
            datasetFill: true,

        },
        ILLIQUID: {
            animation: true,
            animationSteps: 15,

            responsive: true,
            datasetFill: false,
            // Array - Array of string names to attach tooltip events
            //    tooltipEvents: ["mousemove", "touchstart", "touchmove"],
            //scaleFontColor: "#ff0000",
            bezierCurve: false,
            pointDot: false,
            scaleShowLabels: true,
            //Number - Pixel width of the bar stroke
            barStrokeWidth: 2,

            //Number - Spacing between each of the X value sets
            barValueSpacing: 1,

            //Number - Spacing between data sets within X values
            barDatasetSpacing: 1,

            colorMedian: '#0000FF',
            colorBottom: '#33b5e5',
            colorTop: '#00c851',
            colorZeroReturn: '#000000',
            colorNegative: '#FF0000',
            isNegativeColor: true,
        },
        INCOME_EXPENSE: {
            animation: true,
            animationSteps: 5,
            //scaleBeginAtZero: false,

            ////Boolean - Whether grid lines are shown across the chart
            // scaleShowGridLines: true,

            ////String - Colour of the grid lines
            //scaleGridLineColor: "rgba(0,0,0,.05)",

            ////Number - Width of the grid lines
            scaleGridLineWidth: 0,

            ////Boolean - Whether to show horizontal lines (except X axis)
            scaleShowHorizontalLines: true,

            ////Boolean - Whether to show vertical lines (except Y axis)
            scaleShowVerticalLines: true,

            ////Boolean - If there is a stroke on each bar
            barShowStroke: false,

            ////Number - Pixel width of the bar stroke
            //barStrokeWidth: 2,

            //Number - Spacing between each of the X value sets
            barValueSpacing: 1,
            showXLabels: 10,
            ////Number - Spacing between data sets within X values
            //barDatasetSpacing: 1,

            ////String - A legend template
            //  legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\">aaaa<% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",

            colorIncomeFromSalary: '#00c851',
            colorIncomeFromSocialSecurity: '#ffbb33',
            colorOtherIncome: '#b0bec5',
            colorIncomeFromInvesment: '#ff4444',
            colorIncomeAnity: "#ADFF2F",
            colorIncomesExceptional: "#33b5e5",
            colorRecurringIncomes: "#ffbb33",

            colorExpensePriorRetirement: '#ff4444',
            colorExpenseAtRetirement: '#b0bec5',
            colorExpenseSaving: '#007e33',
            colorExpensesaving_at_retirement: '#ffbb33',
            colorExpenseInsufficientFunds: '#33b5e5',
            colorExpenseRecurring: '#ffbb33',

            sizeOfScaleForRenderXLabel: 5,
        }
    }
    // Override function
    startService.registerWatchValueEventForTheme = function () {

    }
    var specialValues = {
        16: { text: 'US STOCKS – 16%', color: '#C62828' },
        18: { text: 'FOREIGN DEVELOPED STOCKS – 18%', color: '#C62828' },
        24: { text: 'EMERGING MARKET STOCKS – 24%', color: '#C62828' },
        14: { text: 'DIVIDEND GROWTH STOCKS – 14%', color: '#C62828' },
        5: { text: 'US GOVERNMENT BONDS – 5%', color: '#C62828' },
        5: { text: 'CORPORATE BONDS – 5%', color: '#C62828' },
        7: { text: 'EMERGING MARKET BONDS– 7%', color: '#C62828' },
        5: { text: 'MUNICIPAL BONDS – 5%', color: '#C62828' },
        5: { text: 'TIPS – 5% (Treasury Inflation Protected Securities)', color: '#C62828' },
        18: { text: 'REAL ESTATE – 18%', color: '#C62828' },
        22: { text: 'NATURAL RESOURCES – 22%', color: '#C62828' }
    }
    $rootScope.dynamicConponent = {
        com_currency: {
            type: "dropdown_menu",
            params: 'currency_code',
            config: {}
        },

        com_current_saving: {
            type: "currency_number_box",
            params: 'current_saving',
            config: {}
        },
        com_current_income: {
            type: "currency_number_box",
            params: 'income_today',
            config: {}
        },
        com_current_expense: {
            type: "currency_number_box",
            params: 'expense_today',
            config: {}
        },
        com_expense_at_retirement: {
            type: "currency_number_box",
            params: 'expense_at_retirement',
            config: {}
        },
        com_risk: {
            type: 'number_box',
            params: 'volatility',
            config: {}
        },
        com_risk_return: {
            type: 'number_box',
            params: 'risk_return',
            config: {}
        },
        numberOfTrials: {
            type: 'material_select_box',
            params: 'number_trials',
            config: {}
        },
        top_value: {
            type: 'material_select_box',
            params: 'mc_top_value',
            config: {}
        },
        bottom_value: {
            type: 'material_select_box',
            params: 'mc_bottom_value',
            config: {}
        },
        inflaction: {
            type: 'slider_range',
            params: 'inflation',
            config: {
                lineColor: '#CBCBCB',
                trackColor: '#00C851',
                reachMaxColor: '#AABBCC',
                boxBackgroundColor: '#00c851',
                boxColor: '#FAFCFD',
                min: 0,
                max: 10
            }
        },
        salaryEvolution: {
            type: 'slider_range',
            params: 'salary_evolution',
            config: {
                lineColor: '#CBCBCB',
                trackColor: '#039BE5',

                boxBackgroundColor: '#039BE5',
                boxColor: '#FAFCFD',
                min: 0,
                max: 10
            }
        },
        risk: {
            type: 'slider_range',
            params: 'volatility',
            config: {
                specialValues: specialValues,
                lineColor: '#CBCBCB',
                trackColor: '#00C851',
                boxBackgroundColor: '#00C851',
                boxColor: '#FAFCFD',
                min: 0,
                max: 30
            }
        },
        riskReturn: {
            type: 'slider_range',
            params: 'risk_return',
            config: {
                lineColor: '#CBCBCB',
                trackColor: '#00C851',
                boxBackgroundColor: '#00C851',
                boxColor: '#FAFCFD',
                min: 0,
                max: 30
            }
        },
        income: {
            type: 'slider_range',
            params: 'income_today',
            config: {
                lineColor: '#CBCBCB',
                trackColor: '#039BE5',
                reachMaxColor: '#FF0000',
                reachMaxTrackColor: '#E1F15B',
                boxBackgroundColor: '#039BE5',
                boxColor: '#FAFCFD',
                textChangeModelData: 'Drag to change expense',
                textChangeMaxData: 'Drag to change income'
            }
        },
        expense: {
            type: 'slider_range',
            params: 'expense_today',
            config: {
                lineColor: '#CBCBCB',
                trackColor: '#039BE5',
                reachMaxColor: '#FF0000',
                reachMaxTrackColor: '#E1F15B',
                boxBackgroundColor: '#039BE5',
                boxColor: '#FAFCFD',
                textChangeModelData: 'Drag to change expense',
                textChangeMaxData: 'Drag to change income'
            }
        },
        incomeExpenseAtRetirement: {
            type: 'slider_range',
            params: 'expense_at_retirement',
            config: {
                lineColor: '#CBCBCB',
                trackColor: '#FF4444',
                reachMaxColor: '#FF0000',
                reachMaxTrackColor: '#62D074',
                boxBackgroundColor: '#FF4444',
                boxColor: '#FAFCFD',
                textChangeModelData: 'Drag to change expense at retirement'
            }
        }
    };
    $rootScope.changeFieldValueOfPersonalPlan = function (fieldName, fieldValue) {
        if (angular.isNumber(fieldValue)) {
            eval("$rootScope.PersonaPlan." + fieldName + "=" + fieldValue + ";");
        } else if (angular.isString(fieldValue)) {
            eval("$rootScope.PersonaPlan." + fieldName + "='" + fieldValue + "';");
        }
        personalPlanService.updateConvertDataOfPersonalPlan();
    }

    // Override servicePersonalPlan
    var isKeepCashFlowData = false;
    $rootScope.getDataforCalculate = function (paramItems) {
        //console.log('Begin calculation');
        //console.timeEnd('btoApp');
        $rootScope.timelineService.changeBeforeCalculationOnTimeline();
        $rootScope.dataBeforeCalculationChanged = $rootScope.collectDataForCompareChange();
        var cashFlowData = {};
        var leafCashFlowData = {};
        var getLeafCashFlowData = function (item) {
            if (angular.isDefined(item.children) && angular.isArray(item.children) && item.children.length > 0) {
                for (var i = 0; i < item.children.length; i++) {
                    getLeafCashFlowData(item.children[i]);
                }
            }
            else {
                leafCashFlowData[item.name] = item.value * 0.012;
            }
        }
        if ($rootScope.isResetPlan || $rootScope.isFirstLoadProfile) {
            leafCashFlowData = {};
        }
        else {
            for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                getLeafCashFlowData($rootScope.cashFlow.income[i]);
            }
            for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                getLeafCashFlowData($rootScope.cashFlow.expense[i]);
            }
        }
        if (!angular.isDefined($rootScope.PersonaPlan.return_cashFlow)) {
            $rootScope.PersonaPlan.return_cashFlow = false;
        }
        if (defaultCashFlow == null) {
            var defaultCashFlow = {};

            var UpdateCashFlowDefaultData = function (item) {
                defaultCashFlow[item.name] = item.default_value;
                if (angular.isDefined(item.children) && angular.isArray(item.children) && item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        UpdateCashFlowDefaultData(item.children[i]);
                    }
                }
            }
            if (angular.isDefined($rootScope.cashFlow)) {
                for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                    UpdateCashFlowDefaultData($rootScope.cashFlow.income[i]);
                }
                for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                    UpdateCashFlowDefaultData($rootScope.cashFlow.expense[i]);
                }
                for (var i = 0; i < $rootScope.cashFlow.investment_start.length; i++) {
                    UpdateCashFlowDefaultData($rootScope.cashFlow.investment_start[i]);
                }
            }
        }
        var data = {
            "nationality": 1,
            "lifeStyle": $rootScope.PersonaPlan.retirement_lifestyle,
            "current_age": $rootScope.PersonaPlan.start_age,
            "number_trials": $rootScope.PersonaPlan.number_trials,
            //"mc_top_value": $rootScope.PersonaPlan.mc_top_value,
            //"mc_bottom_value": $rootScope.PersonaPlan.mc_bottom_value,
            "retirement_age": $rootScope.PersonaPlan.retirement_age,
            "social_security_age": $rootScope.PersonaPlan.social_security_age,
            "death_age": $rootScope.PersonaPlan.death_age,
            "old_CashFlow": leafCashFlowData,
            "cashFlow": {},
            //"liquidAsset": {},
            "dreams": [],
            "lifeEvent": [],
            "profile": $rootScope.utilService.getProfileMapping()
            /*"profile": {
                "married_status": $rootScope.profile.client.married_status,
                "number_of_child": $rootScope.profile.children.childrens.length,
                "spouse_occupation": $rootScope.profile.spouse.occupation == "" ? 0 : parseInt($rootScope.profile.spouse.occupation)
            }*/
        };
        var dfValue = {
            name: '',
            value: ''
        };
        // Update cashflow
        if (!angular.isDefined(paramItems) || !angular.isArray(paramItems)) {
            paramItems = [];
            paramItems[0] = dfValue;
        }
        if (angular.isDefined(paramItems) && angular.isArray(paramItems) && isKeepCashFlowData == false) {
            var GetNewChange = function () {
                for (var j = 0; j < paramItems.length; j++) {
                    if (angular.isDefined(paramItems[j].isSended) && paramItems[j].isSended == false) {
                        return paramItems[j];
                    }
                }
                return dfValue;
            }
            var itemChangeLocal = GetNewChange();

            var GetTreeRalativeWithNewChange = function (item, itemChanged) {
                if (itemChanged.name == item.name) {
                    return itemChanged.name;
                }
                if (angular.isDefined(item.children) && angular.isArray(item.children) && item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        var str = GetTreeRalativeWithNewChange(item.children[i], itemChanged);
                        if (str != "") {
                            str += "," + item.name;
                            return str;
                        }
                    }
                }
                return "";
            };
            var strVariables = "";
            var GetStrVariables = function (arraylist) {
                for (var i = 0; i < arraylist.length; i++) {
                    strVariables = GetTreeRalativeWithNewChange(arraylist[i], itemChangeLocal);
                    if (strVariables != "")
                        return strVariables;
                }
                return "";
            }
            var checkExistNameinParamItem = function (name) {
                for (var i = 0; i < paramItems.length; i++) {
                    if (paramItems[i].name == name)
                        return paramItems[i];
                }
                return null;
            }
            var tem = null;
            var updateCashFlowData = function (item) {
                //if (utilService.roundNumber(defaultCashFlow[item.name]) != utilService.roundNumber(parseFloat(item.value) * 0.012)) {
                tem = checkExistNameinParamItem(item.name);
                var indexOfItem = 0;
                if (angular.isDefined(strVariables) && tem != null) {
                    indexOfItem = strVariables.indexOf(item.name);
                }
                if (tem != null && (indexOfItem <= 0)) {
                    cashFlowData[item.name] = item.value * 0.012;
                    tem.isSended = true;
                    return;
                }
                if (angular.isDefined(item.children) && angular.isArray(item.children) && item.children.length == 0) {
                    cashFlowData[item.name] = item.value * 0.012;
                }
                //}
                if (angular.isDefined(item.children) && angular.isArray(item.children) && item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        updateCashFlowData(item.children[i]);
                    }
                }
            }
            if ($rootScope.isResetPlan) {
                cashFlowData = angular.copy(defaultCashFlow);
            }
            else {
                var changeIncome = checkExistNameinParamItem('recurring_income');

                if (changeIncome != null && changeIncome.isSended == false) {
                    cashFlowData["recurring_income"] = parseFloat(changeIncome.value) * 0.012;
                    changeIncome.isSended = true;
                } else {

                    if (angular.isDefined($rootScope.cashFlow)) {
                        strVariables += GetStrVariables($rootScope.cashFlow.income);
                        for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                            updateCashFlowData($rootScope.cashFlow.income[i]);
                        }
                    }
                }
                var changeExpense = checkExistNameinParamItem('recurring_expenses');
                if (changeExpense != null && changeExpense.isSended == false) {
                    cashFlowData["recurring_expenses"] = parseFloat(changeExpense.value) * 0.012;
                    changeExpense.isSended = true;
                } else {
                    if (angular.isDefined($rootScope.cashFlow)) {
                        strVariables += GetStrVariables($rootScope.cashFlow.expense);
                        for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                            updateCashFlowData($rootScope.cashFlow.expense[i]);
                        }
                    }
                }
                var getDataForInvestmentParam = $rootScope.investment.getCashflowData($rootScope.cpfInvestment);
                for (var i = 0; i < getDataForInvestmentParam.length; i++) {
                    cashFlowData[getDataForInvestmentParam[i].variable] = getDataForInvestmentParam[i].value;
                }
                for (var i = 0; i < $rootScope.cashFlow.investment_start.length; i++) {
                    if ($rootScope.cashFlow.investment_start[i].name != 'cpf_start') {
                        cashFlowData[$rootScope.cashFlow.investment_start[i].name] = parseFloat($rootScope.cashFlow.investment_start[i].value);
                    }
                }
            }

            // investment


            for (var t = 0; t < paramItems.length; t++) {
                paramItems[t].isSended = true;
            }
        }
        data.cashFlow = angular.copy(cashFlowData);

        isKeepCashFlowData = true;
        // Update dream
        if (angular.isDefined($rootScope.PersonaPlan.dreams) && $rootScope.PersonaPlan.dreams.length > 0) {
            for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
                var total_cost = $rootScope.PersonaPlan.dreams[i].total_cost;
                var dream = angular.copy($rootScope.PersonaPlan.dreams[i]);
                delete dream['dream_type'];
                delete dream['photoContent'];
                if (typeof dream.total_cost != 'undefined' || dream.total_cost != null) {
                    dream.total_cost = dream.total_cost / 1000;
                }
                if (typeof dream.value != 'undefined' || dream.value != null) {
                    dream.value = dream.value / 1000;
                }
                // Check absolute of down_payment
                if (typeof dream.down_payment != 'undefined' || dream.down_payment != null) {
                    if (dream.is_absolute_dream_down_payment) {
                        dream.down_payment = dream.down_payment / 1000;
                    } else {
                        dream.down_payment = (dream.down_payment * total_cost) / 1000;
                    }
                }

                // Check absolute of transaction_cost
                if (typeof dream.transaction_cost != 'undefined' || dream.transaction_cost != null) {
                    if (dream.is_absolute_dream_transaction_cost) {
                        dream.transaction_cost = dream.transaction_cost / total_cost;
                    }
                }

                // Check absolute of yearly_expenses
                if (typeof dream.yearly_expenses != 'undefined' || dream.yearly_expenses != null) {
                    if (dream.is_absolute_dream_yearly_expenses) {
                        dream.yearly_expenses = dream.yearly_expenses / total_cost;
                    }
                }

                // Check absolute of rental_net_income
                if (typeof dream.rental_net_income != 'undefined' || dream.rental_net_income != null) {
                    if (dream.is_absolute_dream_rental_net_income) {
                        dream.rental_net_income = dream.rental_net_income / total_cost;
                    }
                }

                if (dream.dream_type_id == 1 && dream.payment_duration == 0) {
                    dream.payment_duration = 1;
                }

                if (dream.dream_type_id == 2 && dream.total_cost != null) {
                    dream.total_cost = dream.total_cost * dream.payment_duration;
                }
                data.dreams.push(dream);
            }
        }
        // Update lifeEvent
        if (angular.isDefined($rootScope.PersonaPlan.lifeEvent) && $rootScope.PersonaPlan.lifeEvent.length > 0) {
            for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
                var total_cost = $rootScope.PersonaPlan.lifeEvent[i].value;
                var dream = angular.copy($rootScope.PersonaPlan.lifeEvent[i]);
                delete dream['dream_type'];
                delete dream['photoContent'];
                if (typeof dream.total_cost != 'undefined' || dream.total_cost != null) {
                    dream.total_cost = dream.total_cost / 1000;
                }
                if (typeof dream.value != 'undefined' || dream.value != null) {
                    dream.value = dream.value / 1000;
                }
                if (typeof dream.yearly_cost_reduction != 'undefined' || dream.yearly_cost_reduction != null) {
                    dream.yearly_cost_reduction = dream.yearly_cost_reduction / 1000;
                }
                // Check absolute of transaction_cost
                if (typeof dream.transaction_cost != 'undefined' || dream.transaction_cost != null) {
                    if (dream.is_absolute_lifeevent_transaction_cost) {
                        dream.transaction_cost = dream.transaction_cost / total_cost;
                    }
                }
                // Check absolute of transaction_tax
                if (typeof dream.transaction_tax != 'undefined' || dream.transaction_tax != null) {
                    if (dream.is_absolute_lifeevent_transaction_tax) {
                        dream.transaction_tax = dream.transaction_tax / total_cost;
                    }
                }
                data.lifeEvent.push(dream);
            }
        }
        data.return_cashFlow = $rootScope.PersonaPlan.return_cashFlow;
        if ($rootScope.planService.is_reset_persona_Plan) {
            $rootScope.removeFormulaParameter(data);
            $timeout(function () {
                $rootScope.planService.is_reset_persona_Plan = false;
            }, 1000)
        }
        return data;
    }

    $rootScope.removeFormulaParameter = function (data) {
        var keys = Object.keys($rootScope.cashFlow.formula_parameter);
        angular.forEach(keys, function (key) {
            if ($rootScope.cashFlow.formula_parameter[key]) {
                delete data.cashFlow[key];
                delete data.old_CashFlow[key];
                delete data.profile[key];
            }
        });
    }
    $rootScope.planService.requestCalculation = function (paramItem) {
        $rootScope.utilService.calculateData.isCalculating = true;
        $rootScope.utilService.calculateData.isFinished = false
        $rootScope.utilService.scopeApply();
        var data = $rootScope.getDataforCalculate(paramItem);
        var dataSend = { "sessionId": $rootScope.sessionId, "data": data }; 
        utilService.callApi("POST", "/api/common/calculate_engine", "", dataSend, function (response) {
                //console.log('response data :', response);
            },
            function (ex) {
                //console.log('fail data :', ex);
            },
            function (ex) {
                //console.log('exception data :', ex);
            });
        //$rootScope.planService.calculateAll($rootScope.PersonaPlan, paramItem);
    }
    $rootScope.planService.calculateAll = function (personalPlan, paramItems, callback) {
        //console.log(' /api/common/calculate_engine');
        //var data = $rootScope.getDataforCalculate(paramItems);
        //var dataSend = {
        //    "sessionId" : $rootScope.sessionId,
        //    "data": data
        //};
        //console.log('data send :', dataSend);
        //utilService.callApi('POST', '/api/common/calculate_engine', '', dataSend, function (response) {
        //    var data = response;
        //    console.log('response data :', response);
        //},
        //function () {
        //    // callback failed
        //},
        //function () {
        //    // callback error
        //});

        //var headers = {
        //    'Content-Type': 'application/json;charset=UTF-8',
        //    'Access-Control-Allow-Origin': '*',
        //    'Access-Control-Request-Method': 'POST',
        //    'Access-Control-Request-Headers': '*'
        //}
        //$timeout.cancel($rootScope.actionService.calculateDataOnWebSocket);
        //$rootScope.actionService.calculateDataOnWebSocket = $timeout(function () {
        //    try {
        //        isKeepCashFlowData = false;
        //        var data = $rootScope.getDataforCalculate(paramItems);
        //        utilService.ShowMonteCarloProgressBar();
        //        console.log(' $rootScope.calculateWebSocket.$emit 3');
        //        $rootScope.calculateWebSocket.$emit('calculate', data);
        //    } catch (ex) {
        //        //console.log(ex);
        //    }
        //}, 300);
    }

    $rootScope.calWebSocketData = null;

    $rootScope.planService.calculateAfter = function (personalPlan, paramItems, callback) {
        var headers = {
            'Content-Type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': '*'
        }
        var data = $rootScope.getDataforCalculate(paramItems);
        //$rootScope.calWebSocketData = data;
        // console.log(headers);
        // utilService.callEngineApi('POST', '/calculate1', headers, data, callback);
        // send via calculate websocket

    }
    // Override notification message
    $rootScope.utilService.notify_options = {
        "closeButton": true,
        "debug": false,
        "positionClass": "toast-top-right", /* toast-top-left, toast-bottom-right, toast-bottom-left */
        "onclick": null,
        "showDuration": "500",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
    $rootScope.utilService.showSuccessMessageObj = null;
    $rootScope.utilService.showSuccessMessage = function (message, timeout) {
        toastr.success($rootScope.utilService.translate(message), $rootScope.utilService.translate("Success"), $rootScope.utilService.notify_options);
    }

    $rootScope.utilService.showErrorMessageObj = null;
    $rootScope.utilService.showErrorMessage = function (message, timeout) {
        toastr.error($rootScope.utilService.translate(message), $rootScope.utilService.translate("Error"), $rootScope.utilService.notify_options);
    }

    $rootScope.utilService.showWarningMessageObj = null;
    $rootScope.utilService.showWarningMessage = function (message) {
        toastr.warning($rootScope.utilService.translate(message), $rootScope.utilService.translate("Warning"), $rootScope.utilService.notify_options);
    }

    $rootScope.utilService.showInfoMessageObj = null;
    $rootScope.utilService.showInfoMessage = function (message) {
        toastr.info($rootScope.utilService.translate(message), $rootScope.utilService.translate("Info"), $rootScope.utilService.notify_options);
    }
    $rootScope.scrollTop = null;
    $rootScope.sessionId = null;
    $rootScope.actionService.calculateData = function (response, paramItem) {
        //console.log('call calculateData');
        //console.timeEnd("btoApp")
        if (response != null) {
            $rootScope.ApplyAllData(response);
            return;
        }
        if (!$rootScope.actionService.isCalculateData) {
            $rootScope.actionService.isCalculateData = true;
            if ($rootScope.isFirstLoadProfile) { 
                $rootScope.initWebSocketCalculateMonteCarlo();
               // $rootScope.actionService.getSessionId();
                $timeout(function () {
                    utilService.ShowMonteCarloProgressBar();
                  //  var data = $rootScope.getDataforCalculate(paramItem); 
                    if ($rootScope.browserClass.indexOf('FF') >= 0) {
                        if ($rootScope.calculateWebSocket.$status() != $rootScope.calculateWebSocket.$OPEN) {
                            $rootScope.calculateWebSocket.$open();
                        }
                        var sendInterval = $interval(function () {
                            if ($rootScope.calculateWebSocket.$status() == $rootScope.calculateWebSocket.$OPEN) {
                              //  $rootScope.calculateWebSocket.$emit('calculate', data);
                            
                                $rootScope.planService.requestCalculation(paramItem);
                                
                                $rootScope.isFirstLoadProfile = false;
                                $interval.cancel(sendInterval);
                            }
                        }, 2000);
                    } else {
                        // console.log(' $rootScope.calculateWebSocket.$emit 2');
                        // $rootScope.calculateWebSocket.$emit('get_session', {});
                        $timeout(function () {
                            $rootScope.planService.requestCalculation(paramItem);
                            // utilService.callApi("POST", "/api/common/calculate_engine", "", { "sessionId": "12", "data": data });
                            //  $rootScope.calculateWebSocket.$emit('calculate', data);
                             
                        }, 500);
                        $rootScope.isFirstLoadProfile = false;
                    }
                }, 1000);
            } else {
                console.log('cal alll----------------------'); 
                $timeout(function () {
                    $rootScope.planService.requestCalculation(paramItem); 
                }, 10); 
            }
            $timeout(function () {
                $rootScope.actionService.isCalculateData = false;
            }, 150);
        }
    }

    $rootScope.IncomeData = {};
    $rootScope.ExpenseData = {};
    $rootScope.EquityCurveChart = {};
    $rootScope.IlliquidCurveChart = {};
    $rootScope.InvestmentCPF = {};
    $rootScope.updateChartTimeoutFromCalculateSocket = null;
    $rootScope.ProcessingInvestmentCPF = function (data) {
        $rootScope.InvestmentCPF = angular.copy(data);
        var listname = ["cpf_oa", "cpf_ms", "cpf_sa", "cpf_ra"];
        for (var i = 0; i < listname.length; i++) {
            var temp = $.grep(data, function (e) { return e.name.indexOf(listname[i]) == 0 });
            if (temp && temp.length > 0) {
                var tempPlus = angular.copy(temp[0]);
                tempPlus.name = listname[i];
                for (var j = 0; j < tempPlus.top.length; j++) {
                    tempPlus.top[j] += parseFloat(temp[1].top[j]);
                    tempPlus.bottom[j] += parseFloat(temp[1].bottom[j]);
                    tempPlus.average[j] += parseFloat(temp[1].average[j]);
                }
                $rootScope.InvestmentCPF[$rootScope.InvestmentCPF.length] = tempPlus;
            }
        }
    }
    $rootScope.ApplyAllData = function (responseData) {
        //console.log('Apply data');
        //console.timeEnd('btoApp');
        var response = angular.copy(responseData);
        var cashFlowDataResult = {};
        var dataCash = {};
        if (response.expense) {
            dataCash.expense = angular.copy(response.expense);
        }
        if (response.income) {
            dataCash.income = angular.copy(response.income);
        }
        cashFlowDataResult = dataCash;
        if (responseData.life_style_group != null && responseData.life_style_group.length > 0) {
            for (var i = 0; i < responseData.life_style_group.length; i++) {

                $rootScope.retirementLife[i] = {
                    id: i,
                    name: responseData.life_style_group[i].name,
                    //value: responseData.life_style_group[i].default_value != 0 ? Math.abs(responseData.life_style_group[i].default_value) * 1000 / 12 : item.value,
                    value: responseData.life_style_group[i].default_value != 0 ? Math.abs(responseData.life_style_group[i].default_value) * 1000 / 12 : 0,
                    imageClass: $rootScope.retirementLifeClassName[i] ? $rootScope.retirementLifeClassName[i].imageClass : "fa fa-bicycle"
                }

                if (parseInt(responseData.lifeStyle) == i) {
                    $rootScope.selectedretirementLife = angular.copy($rootScope.retirementLife[i]);
                }
            }
        }
        if (responseData.saving_rate_group != null && responseData.saving_rate_group.length > 0) {
            var savingGroupData = {};
            var recursiveItem = function (item, callback) {
                if (angular.isDefined(callback)) {
                    callback(item);
                }
                if (item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        recursiveItem(item.children[i], callback);
                    }
                }
            }
            for (var i = 0; i < responseData.saving_rate_group.length; i++) {
                recursiveItem(responseData.saving_rate_group[i], function (item) {
                    savingGroupData[item.name] = item.default_value;
                });
            }
            for (var i = 0; i < responseData.saving_rate_group.length; i++) {
                recursiveItem(responseData.saving_rate_group[i], function (item) {
                    savingGroupData[item.name] = item.default_value;
                });
                var item = responseData.saving_rate_group[i];
                var findItem = null;
                for (var j = 0; j < $rootScope.cashFlow.cpf.length; j++) {
                    if ($rootScope.cashFlow.cpf[j].name == item.name) {
                        findItem = $rootScope.cashFlow.cpf[j];
                        break;
                    }
                }
                if (findItem == null) {
                    if (item.name == 'contingency_household' || item.name == 'trading_household' || item.name == 'bank_household') {
                        item.value = item.default_value;
                        $rootScope.cashFlow.cpf.push(item);
                    } else if (item.name == 'cpf_employer_contribution') {
                        var mainItem = $rootScope.cashFlow.cpf[0].children[0];
                        if (angular.isDefined(mainItem) && mainItem.children.length == 0) {
                            mainItem.children.push(item.children[0]);
                        }
                        var spouseItem = $rootScope.cashFlow.cpf[0].children[1];
                        if (angular.isDefined(spouseItem) && spouseItem.children.length == 0) {
                            spouseItem.children.push(item.children[1]);
                        }
                    } else {
                        recursiveItem(item, function (dataItem) {
                            if (angular.isDefined(savingGroupData[dataItem.name])) {
                                dataItem.value = savingGroupData[dataItem.name] * 1000 / 12;
                                dataItem.value = utilService.roundNumber(dataItem.value);
                            }
                        });
                        $rootScope.cashFlow.cpf.push(item);
                    }
                } else {
                    if (item.name == 'contingency_household' || item.name == 'trading_household' || item.name == 'bank_household') {
                        findItem.value = item.default_value;
                    } else {
                        recursiveItem(findItem, function (dataItem) {
                            if (angular.isDefined(savingGroupData[dataItem.name])) {
                                dataItem.value = savingGroupData[dataItem.name] * 1000 / 12;
                                dataItem.value = utilService.roundNumber(dataItem.value);
                            }
                        });
                    }
                }
            }
        }

        if (angular.isDefined(response.is_from_calculate_web_socket) && response.is_from_calculate_web_socket) {
            var percent = (response.endIndex / ($rootScope.PersonaPlan.death_age - rootScope.PersonaPlan.start_age)) * 100;
            if (response.endIndex >= ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) {
                $rootScope.playBackPlayerData.playAction = null;
                $rootScope.playBackPlayerData.isPlayAction = false;
                $timeout(function () {
                    utilService.HideMonteCarloProgressBar();
                    $rootScope.SendingScreenSharingDataObject(response, 'AllData', 'AllData', '');
                }, 500);
                if (response.basic != null) $rootScope.MainResult = response.basic;
            }
        } else {
            if (response.basic != null) $rootScope.MainResult = response.basic;

        }
        // Update chart

        if (response.income_from_investment != null) $rootScope.IncomeData.income_from_investment = parseToRoundThousands(response.income_from_investment);
        // console.log($rootScope.IncomeData.income_from_investment);
        //if (response.total_incomes != null) $rootScope.IncomeData.total_incomes = parseToRoundThousands(response.total_incomes);
        //   if (response.other_income != null) $rootScope.IncomeData.other_income = parseToRound(response.other_income);
        if (response.exceptional_incomes != null) $rootScope.IncomeData.exceptional_incomes = parseToRoundThousands(response.exceptional_incomes);
        if (response.recurring_incomes != null) $rootScope.IncomeData.recurring_incomes = parseToRoundThousands(response.recurring_incomes);
        if (response.income_from_social_security != null) $rootScope.IncomeData.income_from_social_security = parseToRoundThousands(response.income_from_social_security);
        if (response.income_from_salary != null) $rootScope.IncomeData.income_from_salary = parseToRoundThousands(response.income_from_salary);
        //console.log($rootScope.IncomeData);

        if (response.saving != null) $rootScope.ExpenseData.saving = parseToRoundThousands(response.saving);
        if (response.saving_at_retirement != null) $rootScope.ExpenseData.saving_at_retirement = parseToRoundThousands(response.saving_at_retirement);
        if (response.insufficient_funds != null) $rootScope.ExpenseData.insufficient_funds = parseToRoundThousands(response.insufficient_funds);
        if (response.recurring_expense != null) $rootScope.ExpenseData.recurring_expense = parseToRoundThousands(response.recurring_expense);
        if (response.expenses_at_retirement != null) $rootScope.ExpenseData.expenses_at_retirement = parseToRoundThousands(response.expenses_at_retirement);
        if (response.expenses_prior_retirement != null) $rootScope.ExpenseData.expenses_prior_retirement = parseToRoundThousands(response.expenses_prior_retirement);
        if (response.total_expenses != null) $rootScope.ExpenseData.total_expenses = parseToRoundThousands(response.total_expenses);
        if (response.tax_main != null) $rootScope.ExpenseData.tax_main = Math.abs(response.tax_main) * 1000 / 12;
        else $rootScope.ExpenseData.tax_main = 0;
        if (response.tax_spouse != null) $rootScope.ExpenseData.tax_spouse = Math.abs(response.tax_spouse) * 1000 / 12;
        else $rootScope.ExpenseData.tax_spouse = 0;
        $rootScope.ExpenseData.tax_total = $rootScope.ExpenseData.tax_main + $rootScope.ExpenseData.tax_spouse;
        if (response.net_cpf_contribute != null) {
            $rootScope.net_cpf_contribute = response.net_cpf_contribute;
            $rootScope.Monthly_net_cpf_contribute = parseFloat(response.net_cpf_contribute[0]) * 1000 / 12;
        }
        if (response.illiquidAsset !== null) $rootScope.IlliquidCurveChart.illiquidAsset = response.illiquidAsset;
        if (response.cumulative_inflation != null) $rootScope.Cumulative_inflation = response.cumulative_inflation;
        if (response.investment != null) $rootScope.investmentData = response.investment;
        if (response.cpf_return != null) {
            $rootScope.ProcessingInvestmentCPF(response.cpf_return);
        }
        utilService.scopeApply();
        //$timeout(function () {            
        var incomeObject;
        if (angular.isDefined(response.illiquidAsset) && angular.isArray(response.illiquidAsset)) {
            $rootScope.sumExpenseProperty.value = utilService.roundNumber($rootScope.sumExpenseProperty.value * 1000 / 12);
            incomeObject = $.grep(response.illiquidAsset, function (e) { return e.existant === true && e.dream_type_id == 1 && e.income[0] != 0 });
        }
        if (incomeObject && incomeObject.length > 0) {

            for (var i = 0; i < incomeObject.length; i++) {
                var iobj = $.grep($rootScope.existingDrForIncomeCash, function (e) { return e.name.indexOf(incomeObject[i].name) > -1 });
                if (iobj && iobj.length > 0) {
                    iobj[0].income = parseFloat(incomeObject[i].income[0]) * 1000 / 12;
                }
                else {
                    var temp = {};
                    var dr = $.grep($rootScope.PersonaPlan.dreams, function (e) { return e.name.indexOf(incomeObject[i].name) > -1 });
                    temp.id = dr[0].id;
                    temp.name = incomeObject[i].name;
                    temp.display = "Income from " + incomeObject[i].name;
                    temp.income = parseFloat(incomeObject[i].income[0]) * 1000 / 12;
                    $rootScope.existingDrForIncomeCash.push(temp);
                }
            }
            var nl = $rootScope.existingDrForIncomeCash.length - 1;
            for (var i = nl; i >= 0; i--) {
                var tempIndex = false;
                for (var j = 0; j < incomeObject.length; j++) {
                    if ($rootScope.existingDrForIncomeCash[i].name == incomeObject[j].name) {
                        tempIndex = true;
                    }
                }
                if (tempIndex == false) {
                    $rootScope.existingDrForIncomeCash.splice(i, 1);
                }
            }
        }
        else {
            $rootScope.existingDrForIncomeCash = [];
        }
        var expenseObject;
        if (angular.isDefined(response.illiquidAsset) && angular.isArray(response.illiquidAsset)) {
            expenseObject = $.grep(response.illiquidAsset, function (e) { return e.existant === true && e.dream_type_id == 1 && (parseFloat(e.repayment[0]) !== 0 || parseFloat(e.expenses[0]) !== 0) });
        }
        if (expenseObject && expenseObject.length > 0) {
            for (var i = 0; i < expenseObject.length; i++) {
                var dr = $.grep($rootScope.PersonaPlan.dreams, function (e) { return e.existant === true && e.name == expenseObject[i].name });
                if (dr && dr.length > 0) {
                    var iobj = $.grep($rootScope.existingDrForExpenseCash, function (e) { return e.name.indexOf(expenseObject[i].name) > -1 });
                    if (iobj && iobj.length > 0) {
                        iobj[0].repayment = Math.abs(parseFloat(expenseObject[i].repayment[0]) * 1000 / 12);
                        iobj[0].expenses = Math.abs(parseFloat(expenseObject[i].expenses[0]) * 1000 / 12);
                    }
                    else {
                        var temp1 = {};
                        temp1.id = dr[0].id;
                        temp1.name = expenseObject[i].name;
                        temp1.display = expenseObject[i].name + " payments";
                        temp1.repayment = Math.abs(parseFloat(expenseObject[i].repayment[0]) * 1000 / 12);
                        temp1.expenses = Math.abs(parseFloat(expenseObject[i].expenses[0]) * 1000 / 12);
                        $rootScope.existingDrForExpenseCash.push(temp1);
                    }
                }
            }
            var nl = $rootScope.existingDrForExpenseCash.length - 1;
            for (var i = nl; i >= 0; i--) {
                var tempIndex = false;
                for (var j = 0; j < expenseObject.length; j++) {
                    if ($rootScope.existingDrForExpenseCash[i].name == expenseObject[j].name) {
                        tempIndex = true;
                    }
                }
                if (tempIndex == false) {
                    $rootScope.existingDrForExpenseCash.splice(i, 1);
                }
            }
        }
        else {
            $rootScope.existingDrForExpenseCash = [];
        }
        //console.log('End calculation');
        //console.timeEnd('btoApp');
        if (angular.isDefined(response.is_from_calculate_web_socket) && response.is_from_calculate_web_socket) {

            $timeout.cancel($rootScope.updateChartTimeoutFromCalculateSocket);
            $rootScope.updateChartTimeoutFromCalculateSocket = $timeout(function () {
                $rootScope.illiquidAsset.updateChart();
                $rootScope.retirementLifeStyle.updateChart();
                $rootScope.savingRate.updateChart();
                $rootScope.investment.updateChart();
                // $rootScope.taxOptimization.updateChart();
                $rootScope.updateChartWhenScroll();
            }, 300);
        } else {
            $rootScope.illiquidAsset.updateChart();
            $rootScope.retirementLifeStyle.updateChart();
            $rootScope.savingRate.updateChart();
            $rootScope.investment.updateChart();
            //  $rootScope.taxOptimization.updateChart();
            $rootScope.updateChartWhenScroll();
        }
        $rootScope.timelineService.updateChartOnTimeline(response.bottom_values);
        if (response.endIndex >= ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) {
            //console.log('$rootScope.timelineService.updateChartOnTimeline(response.bottom_values)');
            $rootScope.timelineService.updateFinishChartOnTimeline(response.bottom_values);
            $rootScope.savingRate.updateIncomeExpenseAndSavingFromCashflow();
            if (cashFlowDataResult.income && cashFlowDataResult.income.length > 0) {
                $rootScope.savingRate.updateCashFlow(cashFlowDataResult);
            }
            if (response.investment_start != null) {
                $rootScope.investment.updateCashFlowData(response.investment_start);
            }
            $rootScope.summaryCardService.updateRetirement();
            $rootScope.calculationChange();
        }
    }
    $rootScope.calculationChange = function () {
        var minUnit = 30;
        var defaulPercentCompare = 1;
        var defaultRateWorthUnit = 1000;

        if ($rootScope.dataBeforeCalculationChanged == null) {
            //console.log("First time init change");
            return;
        }

        $rootScope.dataAfterCalculationChanged = $rootScope.collectDataForCompareChange();
        //console.log('Before: ', $rootScope.dataBeforeCalculationChanged);
        //console.log('After: ', $rootScope.dataAfterCalculationChanged);        

        var caseLevel = 0, message = '', average = 0;
        var messageDescription = null;
        // case  today 
        var compareSavingChange = function (valueBefore, valueAfter, isNetWorth, totalLength) {

            var data = {
                'value': 0,
                'percent': 0,
                'negative_change': false,
                'isChange': false
            };
            if ($rootScope.MainResult.broken_age <= $rootScope.PersonaPlan.death_age) {
                data.isChange = false;
                return data;
            }
            if (valueBefore == 0 && Math.abs(valueAfter) > minUnit) {
                data.percent = 11;
                data.value = valueAfter;
                data.isChange = true;
                return data;
            }
            if (valueAfter < valueBefore)
                data.negative_change = true;
            data.value = Math.abs(valueAfter - valueBefore);
            data.percent = (100 * data.value) / Math.abs(valueAfter);
            if (data.value > minUnit && data.percent > 1)
                data.isChange = true;
            return data;
        }
        var cash_from = $rootScope.dataBeforeCalculationChanged.income[0] - $rootScope.dataBeforeCalculationChanged.expense[0];
        var cash_to = $rootScope.dataAfterCalculationChanged.income[0] - $rootScope.dataAfterCalculationChanged.expense[0];
        var compareToday = compareSavingChange(cash_from / 12, cash_to / 12);
        var dataDisplay = {};
        if (compareToday.isChange == true) {
            dataDisplay = {
                'deltaChange': $filter('currency')(compareToday.value, $rootScope.PersonaPlan.currency_code + ' ', 0)
            }
            if (!compareToday.negative_change) {
                if (compareToday.percent >= 1 && compareToday.percent < 5)
                    message = "Good Achievement! Additionnal {{deltaChange}} are available now";
                else if (compareToday.percent >= 5 && compareToday.percent < 10)
                    message = "Excellent Achievement! Additionnal {{deltaChange}} are available now";
                else
                    message = "Fantastic Achievement! Additionnal {{deltaChange}} are available now";

            }
            else {
                if (compareToday.percent > 1 && compareToday.percent <= 5)
                    message = "Tiny decrease! Reduction of {{deltaChange}} affect you now";
                else if (compareToday.percent > 5 && compareToday.percent <= 10)
                    message = "Significant Decrease! Reduction of {{deltaChange}} affect you now";
                else
                    message = "Unsustainable Decrease! Reduction of {{deltaChange}} affect you now";
            }
            $rootScope.utilService.updateHeaderMessage({ message: message, jsonObj: dataDisplay }, { message: messageDescription, jsonObj: dataDisplay }, 2);
            return;

        }
        var retirement_index = $rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age;
        cash_from = $rootScope.dataBeforeCalculationChanged.income[retirement_index] - $rootScope.dataBeforeCalculationChanged.expense[retirement_index];
        cash_to = $rootScope.dataAfterCalculationChanged.income[retirement_index] - $rootScope.dataAfterCalculationChanged.expense[retirement_index];
        var compareRetiment = compareSavingChange(cash_from / 12, cash_to / 12);
        if (compareRetiment.isChange == true) {
            dataDisplay = {
                'deltaChange': $filter('currency')(compareRetiment.value, $rootScope.PersonaPlan.currency_code + ' ', 0)
            }
            if (!compareRetiment.negative_change) {
                if (compareRetiment.percent >= 1 && compareRetiment.percent < 5)
                    message = "Good Achievement! Additionnal {{deltaChange}} are available at retirement";
                else if (compareRetiment.percent >= 5 && compareRetiment.percent < 10)
                    message = "Excellent Achievement! Additionnal {{deltaChange}} are available at retirement";
                else
                    message = "Fantastic Achievement! Additionnal {{deltaChange}} are available at retirement";

            }
            else {
                if (compareRetiment.percent > 1 && compareRetiment.percent <= 5)
                    message = "Tiny decrease! Reduction of {{deltaChange}} will affect you at retirement";
                else if (compareRetiment.percent > 5 && compareRetiment.percent <= 10)
                    message = "Significant Decrease! Reduction of {{deltaChange}} will affect you at retirement";
                else
                    message = "Unsustainable Decrease! Reduction of {{deltaChange}} will affect you at retirement";
            }
            $rootScope.utilService.updateHeaderMessage({ message: message, jsonObj: dataDisplay }, { message: messageDescription, jsonObj: dataDisplay }, 2);
            return;
        }
        $rootScope.utilService.updateHeaderMessage({ message: '', jsonObj: null }, 2);
        /*var compareTodaySaving = compareSavingChange($rootScope.dataBeforeCalculationChanged.saving[0]/12, $rootScope.dataAfterCalculationChanged.saving[0]/12);
        var dataDisplay = {};
        var deltaNetWorthToday = ($rootScope.dataAfterCalculationChanged.NetWorth[0] - $rootScope.dataBeforeCalculationChanged.NetWorth[0]) / ($rootScope.Cumulative_inflation[0]);
        if (compareTodaySaving.isChange == true) {
            dataDisplay = {
                'deltaMonthlySavings': $filter('currency')(compareTodaySaving.value, $rootScope.PersonaPlan.currency_code + ' ', 0),
                'deltaAverageNetWorth': $filter('currency')(deltaNetWorthToday, $rootScope.PersonaPlan.currency_code + ' ', 0)
            };
            //  message = "Your monthly available cash has change by " + $filter('currency')(compareTodaySaving.value, $rootScope.PersonaPlan.currency_code + ' ', 0) + " and your average net worth has changed by " + $filter('currency')(deltaNetWorthToday, $rootScope.PersonaPlan.currency_code + ' ', 0) + " in today’s dollar value.";
            message = "Your monthly available cash has change by {{deltaMonthlySavings}} and your average net worth has changed by {{deltaAverageNetWorth}} in today’s dollar value.";
            // "Your monthly available cash has change by <delta monthly savings> and your average net worth has changed by <delta average net worth> in today’s dollar value";
            caseLevel = 1;
        }
         
        // case future
        var ageWhenFirstDifferrent = $rootScope.PersonaPlan.start_age, deltaNetWorth = 0, deltaSaving = 0;
        if (caseLevel == 0) {
            for (var i = 1; i < length; i++) {
                compareTodaySaving = compareSavingChange($rootScope.dataBeforeCalculationChanged.saving[i]/12, $rootScope.dataAfterCalculationChanged.saving[i]/12);
                if (compareTodaySaving.isChange == true) {
                    ageWhenFirstDifferrent = $rootScope.PersonaPlan.start_age + i;
                    deltaNetWorth = ($rootScope.dataAfterCalculationChanged.NetWorth[i] - $rootScope.dataBeforeCalculationChanged.NetWorth[i]) / ($rootScope.Cumulative_inflation[i]);
                    deltaSaving = (compareTodaySaving.value) / ($rootScope.Cumulative_inflation[i]);
                    dataDisplay = {
                        'age': ageWhenFirstDifferrent,
                        'deltaMonthlySavings': $filter('currency')(compareTodaySaving.value, $rootScope.PersonaPlan.currency_code + ' ', 0),
                        'deltaMonthlySavingWithInflation': $filter('currency')(deltaSaving, $rootScope.PersonaPlan.currency_code + ' ', 0),
                        'deltaNetWorth': $filter('currency')(deltaNetWorth, $rootScope.PersonaPlan.currency_code + ' ', 0)
                    };
                    message = "Your monthly available cash from age {{age}} has change {{deltaMonthlySavings}} or {{deltaMonthlySavingWithInflation}} in today’s dollar value.";
                    messageDescription = "Your monthly available cash from age {{age}} has change {{deltaMonthlySavings}} or {{deltaMonthlySavingWithInflation}} in today’s dollar value. Your average net worth has changed by {{deltaNetWorth}} in today’s dollar value."
                    caseLevel = 2;
                    break;
                }
            }
        }
        if (caseLevel == 0) {
            var totalChange = compareSavingChange($rootScope.dataBeforeCalculationChanged.totalNetWorthAdjust, $rootScope.dataAfterCalculationChanged.totalNetWorthAdjust, defaultRateWorthUnit, $rootScope.dataAfterCalculationChanged.NetWorth.length);
            if (totalChange.isChange == true) {
                dataDisplay = {
                    'deltaNetWorth': $filter('currency')(totalChange.value, $rootScope.PersonaPlan.currency_code + ' ', 0)
                };
                // message = "Your average net worth has changed by " + $filter('currency')(totalChange.value, $rootScope.PersonaPlan.currency_code + ' ', 0) + " in today’s dollar value.";
                message = "Your average net worth has changed by {{deltaNetWorth}} in today’s dollar value.";
                caseLevel = 3;
            }
        }
        $rootScope.utilService.updateHeaderMessage({ message: message, jsonObj: dataDisplay }, { message: messageDescription, jsonObj: dataDisplay }, 2);
        */
    }
    $rootScope.collectDataForCompareChange = function () {
        var data = {
            'income': [],
            'expense': []
        };
        if (!angular.isDefined($rootScope.IncomeData.recurring_incomes))
            return null;
        var income_from_properties = 0;
        var exceptional_incomes = 0;
        var income_from_social_security = 0;
        var income_from_salary = 0;

        var recurring_expense = 0;
        var MortageRepayment = 0;
        var expenses_from_properties = 0;
        var exception_expenses = 0;
        var length = $rootScope.IncomeData.recurring_incomes.length;
        for (var i = 0; i < length; i++) {
            income_from_properties = $rootScope.savingRate.getIncomeFrom(i, 'income_from_properties');
            exceptional_incomes = $rootScope.IncomeData.exceptional_incomes[i];
            income_from_social_security = $rootScope.IncomeData.income_from_social_security[i];
            income_from_salary = $rootScope.IncomeData.income_from_salary[i];
            data.income[i] = (income_from_properties + exceptional_incomes + income_from_social_security + income_from_salary) / $rootScope.Cumulative_inflation[i];

            recurring_expense = $rootScope.ExpenseData.recurring_expense[i];
            MortageRepayment = $rootScope.savingRate.getMortageRepayment(i);
            expenses_from_properties = $rootScope.savingRate.getExpensesFromProperty(i);
            exception_expenses = $rootScope.ExpenseData.insufficient_funds[i];

            data.expense[i] = (recurring_expense + MortageRepayment + expenses_from_properties + exception_expenses) / $rootScope.Cumulative_inflation[i];
        }

        /*var properties = $rootScope.illiquidAsset.getDataForChart(0);
        var totalCPF = $rootScope.investment.getTotalCPF();
        for (var i = 0; i < length; i++) {
            data.saving[i] = $rootScope.savingRate.getDataByIndex(i,true).MonthlySaving.saving;
            data.property[i] = properties[i].net;
            data.CPF[i] = totalCPF[i].bottom;
            data.NetWorth[i] = (data.property[i] + data.CPF[i]) / $rootScope.Cumulative_inflation[i];
          //  data.totalNetWorth += data.NetWorth[i];
            data.totalNetWorthAdjust += data.NetWorth[i];
        }  */
        return data;
    }
    // tracking scroll 
    function isInView(elem) {
        return $(elem).offset().top - $(window).scrollTop() < $(elem).height();
    }

    function isScrolledIntoView(elem) {
        var docViewTop = $(window).scrollTop(),
            docViewBottom = docViewTop + $(window).height(),
            elemTop = $(elem).offset().top,
         elemBottom = elemTop + $(elem).height();
        //Is more than half of the element visible
        return ((elemTop + ((elemBottom - elemTop) / 2)) >= docViewTop && ((elemTop + ((elemBottom - elemTop) / 2)) <= docViewBottom));
    }
    function parseToRoundThousands(array) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            var value = parseFloat(array[i]);
            if (isNaN(value)) {
                //array[i] = 0;
                result.push(0);
            } else {
                if (array[i] <= 0) {
                    //array[i] = 0;
                    result.push(0);
                } else {

                    value = value * 1000;
                    value = parseFloat(value.toFixed(2));
                    //console.log(value);
                    result.push(value);
                }
            }
        }
        //console.log(result);
        return result;
    }
    // Create map of component and session of page
    $rootScope.componentMap = [
        {
            'session': 'div_Investment',
            'components': ['risk', 'com_risk', 'riskReturn', 'com_risk_return']
        },
        {
            'session': 'div_SavingRate',
            'components': ['com_current_income', 'com_current_expense']
        },
        {
            'session': 'div_LifeStyle',
            'components': ['com_expense_at_retirement']
        }
    ];

   

   

    $rootScope.showTooltip = function () {
        $('#summary_card .card.summary-card').tooltip();
    }



});
function RoundToFixed2(number) {
    return Number(number).toFixed(2);
}