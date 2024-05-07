btoApp.run(function ($rootScope, startService, CONFIG, utilService, $timeout, personalPlanService) {
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

            colorIncomeFromSalary:  '#00c851',
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
            type: 'currency_number_box',
            params: 'volatility',
            config: {}
        },
        com_risk_return: {
            type: 'currency_number_box',
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
        incomeExpense: {
            type: 'slider_range',
            params: ['income_today', 'expense_today'],
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

    // Overrid notification message
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
})
