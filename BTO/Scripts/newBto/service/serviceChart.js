btoApp.factory('chartService',
function ($rootScope) {
    // This server will be implement later
    this.initIncomeExpenseChartSetting = function (utilService) {
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
            colorRecurringIncomes: "#FFCC99",

            colorExpensePriorRetirement: '#808080',
            colorExpenseAtRetirement: '#0000FF',
            colorExpenseSaving: '#008000',
            colorExpensesaving_at_retirement: '#1E90FF',
            colorExpenseInsufficientFunds: '#FF0000',
            colorExpenseRecurring: '#FFCC99',

            sizeOfScaleForRenderXLabel: 5,
        };
        var incomeChart = {
            options: chartSetting,
            labels: $rootScope.labels,
            type: 'StackedBar',
            data: [],
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
    return this;
})