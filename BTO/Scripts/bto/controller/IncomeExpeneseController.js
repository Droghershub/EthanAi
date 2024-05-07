function randomScalingFactor() { return Math.round(Math.random() * 255) };

btoApp.controller('IncomeExpeneseController', [
        '$scope', 'personaplanService', '$timeout', '$rootScope', 'timelineService', '$templateCache', 'ultilService',
        function ($scope, personaplanService, $timeout, $rootScope, timelineService, $templateCache, ultilService) {
            $scope.controllerName = 'IncomeExpeneseController';
            
            $templateCache.remove('/Home/IncomeExpenses');
            $rootScope.spinner.on();
            $rootScope.tabType = 'IncomeExpense';
            
            // check if is playing back or sharing
            if ($rootScope.playBackPlayerData.data == null) {
                personaplanService.calculateIncomeAndExpenseAsyncFalse($rootScope.PersonaPlan).then(
                    function (obj) {
                        if (obj != null) {
                            $rootScope.MainResult = obj.data.basic;
                            $rootScope.IncomeExpenseChart = obj.data;
                            InitdrawChart();
                            $rootScope.spinner.off();
                            $rootScope.SendingScreenSharingDataObject(obj.data, 'tab', 'open', 'IncomeExpenses');
                        }
                    }
                );
            } else {
                $timeout(function () {
                    $rootScope.MainResult = $rootScope.playBackPlayerData.data.basic;
                    $rootScope.IncomeExpenseChart = $rootScope.playBackPlayerData.data;
                    InitdrawChart();
                    $rootScope.playBackPlayerData.data = null;
                    $rootScope.spinner.off();
                }, 500);
                
            }

            $scope.callfromOutsite = function () {
                updatedrawChart($scope, $timeout, $rootScope);
            };
            $scope.callfromOutsiteforSharing = function ($rootScope) {
                updatedrawChart($scope, $timeout, $rootScope);
            };
            var chartSetting = {
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

                colorIncomeFromSalary: '#008000',
                colorIncomeFromSocialSecurity: '#0000FF',
                colorOtherIncome: '#FFFF00',
                colorIncomeFromInvesment: '#696969',
                colorIncomeAnity: "#ADFF2F",
                colorIncomesExceptional: "#1E90FF",
                colorRecurringIncomes : "#FFCC99",

                colorExpensePriorRetirement: '#808080',
                colorExpenseAtRetirement: '#0000FF',
                colorExpenseSaving: '#008000',
                colorExpensesaving_at_retirement: '#1E90FF',
                colorExpenseInsufficientFunds: '#FF0000',
                colorExpenseRecurring: '#FFCC99',

                sizeOfScaleForRenderXLabel: 5,
            };
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

            function updatedrawChart($scope, $timeout, $rootScope) {
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
                        ultilService.translate("Income from investment"),
                        ultilService.translate("Other Income"),
                        ultilService.translate("Exceptional Income"),
                        ultilService.translate("Recurring Income"),
                        ultilService.translate("Income from social security"),
                        ultilService.translate("Income from salary") 
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
                        ultilService.translate("Savings during active life"),
                        ultilService.translate("Savings during retirement life"),
                        ultilService.translate("Exceptional expenses"),
                        ultilService.translate("Recurring Expense"),
                        ultilService.translate("Expenses during retirement life"),
                        ultilService.translate("Expenses during active life")
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
            $rootScope.currentScope = $scope;
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