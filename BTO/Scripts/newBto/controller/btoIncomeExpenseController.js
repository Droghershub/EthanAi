btoApp.controller('incomeExpenseController', [
        '$scope', 'personalPlanService', '$timeout', '$rootScope','utilService', 'CONFIG', 'actionService',
        function ($scope, personalPlanService, $timeout, $rootScope, utilService, CONFIG, actionService) {
            // No remove
            $rootScope.scope = $scope;
            $scope.title = "Income and Expense";
            $scope.name = CONFIG.TAB.INCOME_EXPENSE;
            
            // End No remove
            
            $rootScope.spinner.on();
            //$rootScope.playBackPlayerData = {};
            // check if is playing back or sharing 
            $scope.applyData = function (obj) { 
                $rootScope.MainResult = obj.basic;
                $rootScope.IncomeExpenseChart = obj;
                InitdrawChart();
                 $rootScope.spinner.off();
            }
            //console.log($rootScope.playBackPlayerData.data);
            if ($rootScope.playBackPlayerData.data == null) {
                // personalPlanService.calculateIncomeAndExpense($rootScope.PersonaPlan, $scope.applyData);
                actionService.calculateData();
            } else {
                $timeout(function () {
                    utilService.updateMainResultFromPlayerData();
                    $rootScope.IncomeExpenseChart = angular.copy($rootScope.playBackPlayerData.data);
                    InitdrawChart();    
                    //$rootScope.playBackPlayerData.data = null;
                    $rootScope.spinner.off();
                    $scope.updatedrawChart();
                }, 400);
            }
            
            $scope.callfromOutsite = function () {
                console.log('callfromOutsite');
                if ($rootScope.playBackPlayerData.data == null) {
                    $scope.updatedrawChart();
                } else {
                    $timeout(function () {
                        utilService.updateMainResultFromPlayerData();
                        $rootScope.IncomeExpenseChart = $rootScope.playBackPlayerData.data;
                        InitdrawChart();
                        $rootScope.playBackPlayerData.data = null;
                        $rootScope.spinner.off();
                        $scope.updatedrawChart();
                    }, 500);
                }
                
            };
            $scope.callfromOutsiteforSharing = function ($rootScope) {
                $scope.updatedrawChart($scope, $timeout, $rootScope);
            }; 
            var chartSetting = CONFIG.CHART.INCOME_EXPENSE;
            function InitdrawChart() {
                var labels = [];
                var str = "";
                var max = parseInt($rootScope.PersonaPlan.death_age) - parseInt($rootScope.PersonaPlan.start_age);
                if ($rootScope.PersonaPlan.start_year == null)
                    $rootScope.PersonaPlan.start_year = new Date().getFullYear();
                for (var i = 0 ; i <= max ; i++) {
                    labels[i] = (parseInt($rootScope.PersonaPlan.start_year) + i);
                }
                $rootScope.labels = labels;
                //console.log($rootScope.IncomeExpenseChart);
                $rootScope.IncomeData = [
                     parseToRound($rootScope.IncomeExpenseChart.income_from_investment),
                     parseToRound($rootScope.IncomeExpenseChart.other_income),
                     parseToRound($rootScope.IncomeExpenseChart.exceptional_incomes),
                     parseToRound($rootScope.IncomeExpenseChart.recurring_incomes),
                     parseToRound($rootScope.IncomeExpenseChart.income_from_social_security),
                     parseToRound($rootScope.IncomeExpenseChart.income_from_salary)
                ];
                $rootScope.ExpenseData = [
                        parseToRound($rootScope.IncomeExpenseChart.saving),
                        parseToRound($rootScope.IncomeExpenseChart.saving_at_retirement),
                        parseToRound($rootScope.IncomeExpenseChart.insufficient_funds),
                        parseToRound($rootScope.IncomeExpenseChart.recurring_expense),
                        parseToRound($rootScope.IncomeExpenseChart.expenses_at_retirement),
                        parseToRound($rootScope.IncomeExpenseChart.expenses_prior_retirement)

                ];

                InitIncomeChart($scope, $timeout, $rootScope);
                InitExpenseChart($scope, $timeout, $rootScope);
            }

            $scope.updatedrawChart = function () {
                if (parseInt($rootScope.PersonaPlan.start_age) != parseInt($scope.start_age)) {
                    InitdrawChart();
                    $scope.start_age = parseInt($rootScope.PersonaPlan.start_age);
                }
                else {
                    var data = [
                         parseToRound($rootScope.IncomeExpenseChart.income_from_investment),
                         parseToRound($rootScope.IncomeExpenseChart.other_income),
                         parseToRound($rootScope.IncomeExpenseChart.exceptional_incomes),
                         parseToRound($rootScope.IncomeExpenseChart.recurring_incomes),
                         parseToRound($rootScope.IncomeExpenseChart.income_from_social_security),
                         parseToRound($rootScope.IncomeExpenseChart.income_from_salary)
                    ];
                    var data2 = [
                            parseToRound($rootScope.IncomeExpenseChart.saving),
                            parseToRound($rootScope.IncomeExpenseChart.saving_at_retirement),
                            parseToRound($rootScope.IncomeExpenseChart.insufficient_funds),
                            parseToRound($rootScope.IncomeExpenseChart.recurring_expense),
                            parseToRound($rootScope.IncomeExpenseChart.expenses_at_retirement),
                            parseToRound($rootScope.IncomeExpenseChart.expenses_prior_retirement)
                    ];
                    $scope.incomeChart.data = data;
                    $scope.expenseChart.data = data2;
                }
            }
            function InitIncomeChart($scope, $timeout, $rootScope) {
                $scope.incomeChart = {
                    options: chartSetting,
                    labels: $rootScope.labels,
                    type: 'StackedBar',
                    data: $rootScope.IncomeData,
                    series: [
                        utilService.translate("Income from investment"),
                        utilService.translate("Other Income"),
                        utilService.translate("Exceptional Income"),
                        utilService.translate("Recurring Income"),
                        utilService.translate("Income from social security"),
                        utilService.translate("Income from salary")
                    ],
                    colours:
                    [
                        { fillColor: chartSetting.colorIncomeFromInvesment },
                        { fillColor: chartSetting.colorOtherIncome },
                        { fillColor: chartSetting.colorIncomesExceptional },
                        { fillColor: chartSetting.colorRecurringIncomes },
                        { fillColor: chartSetting.colorIncomeFromSocialSecurity },
                        { fillColor: chartSetting.colorIncomeFromSalary }
                    ]
                }
            }

            function InitExpenseChart($scope, $timeout, $rootScope) {
                $scope.expenseChart = {
                    options: chartSetting,
                    labels: $rootScope.labels,
                    type: 'StackedBar',
                    data: $rootScope.ExpenseData,
                    series: [
                        utilService.translate("Savings during active life"),
                        utilService.translate("Savings during retirement life"),
                        utilService.translate("Exceptional expenses"),
                        utilService.translate("Recurring Expense"),
                        utilService.translate("Expenses during retirement life"),
                        utilService.translate("Expenses during active life")
                    ],
                    colours: [
                        { fillColor: chartSetting.colorExpenseSaving },
                        { fillColor: chartSetting.colorExpensesaving_at_retirement },
                        { fillColor: chartSetting.colorExpenseInsufficientFunds },
                        { fillColor: chartSetting.colorExpenseRecurring },
                        { fillColor: chartSetting.colorExpenseAtRetirement },
                        { fillColor: chartSetting.colorExpensePriorRetirement }

                    ]
                }
            }
            $rootScope.sharingActionData.data = $scope.name;
            $rootScope.sharingActionData.action = 'SWITCH_TAB';
        }
]);

function repaintchart() {
    if (document.getElementById('incomeExpeneseChart') != undefined)
        angular.element(document.getElementById('incomeExpeneseChart')).scope().callfromOutsite();
}
function repaintchartSharing(obj) {
    if (document.getElementById('incomeExpeneseChart') != undefined)
        angular.element(document.getElementById('incomeExpeneseChart')).scope().callfromOutsiteforSharing(obj);
}
function parseToRound(array) {
    for (var i = 0; i < array.length; i++) {
        array[i] = Number(array[i]).toFixed(2);
    }
    return array;
}