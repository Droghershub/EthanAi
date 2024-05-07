btoApp.run(function ($rootScope, CONFIG) {
    var getRickGaugeCharConfigtData = function () {
        var result = {
            min: 0,
            max: 30,
            gaps: [
                [20, 12],
                [20, 8]
            ],
            specialValues: {
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
    };

    $rootScope.dynamicConponent = {
        incomeExpenseBar: {
            type: 'double_bar',
            params: ['income_today', 'expense_today'],
            config: {
                color: '#36A747',
                topColor: '#28a4c9',
                topColorReachMax: '#F11F1F',
                bottomColor: '#428bca',
                toolTipTopText: "Drag or double click to change current income",
                toolTipBottomText: "Drag or double click to change current expense",
                toolTipTopReverseText: "Drag or double click to change current expense",
                toolTipBottomReverseText: "Drag or double click to change current income",
            }
        },
        riskChart: {
            type: 'speedometer',
            params: 'volatility',
            config: {
                label: 'Risk',
                chart_data: getRickGaugeCharConfigtData()
            }
        },
        riskTableChart: {
            type: 'table_chart',
            params: ['volatility', 'risk_return'],
            config: {
                label: 'Risk and expected return',
                chart_data: {
                    min: 30,
                    max: 30,
                    specialValues: getRickGaugeCharConfigtData().specialValues,
                    x_title: 'Risk',
                    y_title: 'Expected return',
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
            }
        },
        expenseAtRetirementBar: {
            type: 'single_bar',
            params: 'expense_at_retirement',
            config: {
                color: '#5cb85c',
                topColor: '#b3d54d',
                topColorReachMax: '#F11F1F',
                bottomColor: '#86B404',
                toolTipPosition: 'top',
                toolTipTopText: '',
                toolTipBottomText: "Drag or double click to change expense at retirement",
                toolTipTopReverseText: "Drag or double click to change expense at retirement",
                toolTipBottomReverseText: '',
            }
        },
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
        numberOfTrials: {
            type: 'select_box',
            params: 'number_trials',
            config: {}
        },
        top_value: {
            type: 'select_box',
            params: 'mc_top_value',
            config: {}
        },
        bottom_value: {
            type: 'select_box',
            params: 'mc_bottom_value',
            config: {}
        },
        inflaction: {
            type: 'range_box',
            params: 'inflation',
            config: {}
        },
        salaryEvolution: {
            type: 'range_box',
            params: 'salary_evolution',
            config: {}
        }
    };
    CONFIG.CHART = {
        LIQUID: {
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
            colorMedian:'#0000FF',
            colorBottom: '#FF0000',
            colorTop:  '#008000',
            colorZeroReturn:  '#000000',
            colorNegative: '#FF0000',
            isNegativeColor: true,

            //scaleGridLineColor: "rgba(0,0,0,.05)",
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

            colorMedian:  '#0000FF',
            colorBottom: '#008000',
            colorTop:  '#0000FF',
            colorZeroReturn:'#000000',
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
        }
    }
});