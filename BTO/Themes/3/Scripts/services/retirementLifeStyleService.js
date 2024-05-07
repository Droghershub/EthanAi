btoApp.service('retirementLifeStyleService', function ($rootScope, utilService, $timeout, CONFIG, $filter) {
    var chartretirement = null;
    var zoomStartIndex = null, zoomEndIndex = null, isValidateData = false, zoomedEvent = null,isCumulative_inflation = true;
    $rootScope.retirementLifeClassName = [{
        id: 1,
        imageClass: "fa fa-bicycle"
    }, {
        id: 2,       
        imageClass: "fa fa-car"
    }, {
        id: 3,        
        imageClass: "fa fa-plane"
    }];
    $rootScope.retirementLife = [];
    $rootScope.chartObject = {
        age: 0,
        incomefromsocial: 0,
        incomefromsaving: 0,
        incomesource: 0,
        annualexpense: 0
    };
    
    /*if ($rootScope.selectedretirementLife == null) {
        $rootScope.selectedretirementLife = $rootScope.retirementLife[1];
        $rootScope.PersonaPlan.expense_at_retirement = $rootScope.selectedretirementLife.value;
        $rootScope.actionService.updateData();
    };*/
    this.applyChangeForPlayback = function (item) {
        $rootScope.selectedretirementLife = item;
        $rootScope.PersonaPlan.retirement_lifestyle = item.id;
        $rootScope.PersonaPlan.expense_at_retirement = item.value;
    }
    this.ChooseLifeStyle = function (item) {
        if (item.id != $rootScope.selectedretirementLife.id) {
            $rootScope.selectedretirementLife = item;
            $rootScope.PersonaPlan.retirement_lifestyle = item.id;
            $rootScope.PersonaPlan.expense_at_retirement = $rootScope.selectedretirementLife.value;
            $rootScope.actionService.updateData();
            $rootScope.actionService.calculateData();
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan.expense_at_retirement, 'changeExpenseRetirementCard', 'PersonaPlan.expense_at_retirement', 'expense_at_retirement');
            try {
                if (angular.isDefined(inline_manual_player)) {
                    if ($rootScope.isShowManual) {
                        inline_manual_player.goToStep(inline_manual_player.current_step + 1);
                    }
                }
            } catch (ex) { }
        }
    }
    this.initDataForProvider = function () {
        var data = [], temp;
        var indextemp = parseInt($rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age);
        if ($rootScope.IncomeData.income_from_social_security != null) {
            for (var i = indextemp; i < $rootScope.IncomeData.income_from_social_security.length; i++) {
                var total_expense = parseFloat($rootScope.ExpenseData.recurring_expense[i])
                    + $rootScope.savingRate.getMortageRepayment(i)
                    + $rootScope.savingRate.getExpensesFromProperty(i)
                    + parseFloat($rootScope.ExpenseData.insufficient_funds[i]);
                var savingtemp = total_expense > parseFloat($rootScope.IncomeData.income_from_social_security[i]) ? total_expense - parseFloat($rootScope.IncomeData.income_from_social_security[i]) : 0;
                savingtemp =  savingtemp / (isCumulative_inflation === true ?$rootScope.Cumulative_inflation[i] : 1);
                temp = {
                    "year": parseInt($rootScope.PersonaPlan.start_age) + i,
                    "incomefromsocial": parseFloat($rootScope.IncomeData.income_from_social_security[i])/(isCumulative_inflation === true ?$rootScope.Cumulative_inflation[i]:1),
                    "incomefromsaving": savingtemp,
                    "annualexpense": total_expense / (isCumulative_inflation === true ? $rootScope.Cumulative_inflation[i] : 1),
                    "colorIncome": "#46C2FF",
                    "colorSaving": "#039BE4",
                    "colorExpense": "#323232"
                }
                data[i - indextemp] = temp;
            }
        }
        return data;
    },
    this.init = function () {        
        var self = this;
        var dataProvider = self.initDataForProvider();
        chartretirement = AmCharts.makeChart("chartRetirement", {
            "theme": "light",
            "type": "serial",
            "dataProvider": dataProvider,
            "pathToImages": "/Themes/" + version_id + "/Scripts/amcharts/images/",
            "graphs": [
              {
                  id: "social",
                  "balloonText": utilService.translate("Income from Social Annuities") + ": <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                  "fillAlphas": 0.9,
                  "lineAlpha": 0.2,
                  "title": utilService.translate("Income from Social Annuities"),
                  "type": "column",
                  "valueField": "incomefromsocial",
                  "colorField": "colorIncome",
                  "listeners": [{
                      "event": "rollOverItem",
                      "method": function (event) {
                          alert('version');
                      }
                  }],
                  "balloonFunction": function (graphDataItem, graph) {
                      var dataContext = graphDataItem.dataContext;
                      var str = utilService.translate("Income from Social Annuities") + ": <span style='font-size:11px; color:#000000;'><b>" +  $filter('number')(dataContext.incomefromsocial,2) + "</b></span>";
                      str += "<br />";
                      str += utilService.translate("Income from Savings") + ": <span style='font-size:11px; color:#000000;'><b>" +  $filter('number')(dataContext.incomefromsaving,2) + "</b></span>";
                      str += "<br />";
                      str += utilService.translate("Annual Expense") + ": <span style='font-size:11px; color:#000000;'><b>" +  $filter('number')(dataContext.annualexpense,2) + "</b></span>";
                      return str;
                  }
              }, {
                  id: "Retirement_saving",
                  "balloonText": utilService.translate("Income from Savings") + ": <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                  "fillAlphas": 0.9,
                  "lineAlpha": 0.2,
                  "title": utilService.translate("Income from Savings"),
                  "type": "column",
                  "valueField": "incomefromsaving",
                  "colorField": "colorSaving",
                  "balloonFunction": function (graphDataItem, graph) {
                      var dataContext = graphDataItem.dataContext;
                      var str = utilService.translate("Income from Social Annuities") + ": <span style='font-size:11px; color:#000000;'><b>" +  $filter('number')(dataContext.incomefromsocial,2) + "</b></span>";
                      str += "<br />";
                      str += utilService.translate("Income from Savings") + ": <span style='font-size:11px; color:#000000;'><b>" +  $filter('number')(dataContext.incomefromsaving,2) + "</b></span>";
                      str += "<br />";
                      str += utilService.translate("Annual Expense") + ": <span style='font-size:11px; color:#000000;'><b>" +  $filter('number')(dataContext.annualexpense,2) + "</b></span>";
                      return str;
                  }
              }
              , {
                  id: "Annual_expense",
                  "balloonText": utilService.translate("Annual Expense") + ": <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                  "fillAlphas": 0,
                  "lineAlpha": 1,
                  "title": utilService.translate("Annual Expense"),                  
                  "bullet": "square",
                  "lineThickness": 2,
                  "type": "smoothedLine",
                  "bulletSize": 7,
                  "bulletBorderAlpha": 0,
                  "bulletColor": "#323232",
                  "lineColor": "#9c9c9b",
                  "useLineColorForBulletBorder": true,
                  "bulletBorderThickness": 1,
                  "valueField": "annualexpense",
                  "colorField": "colorExpense",
                  "balloonFunction": function (graphDataItem, graph) {
                      var dataContext = graphDataItem.dataContext;
                      var str = utilService.translate("Income from Social Annuities") + ": <span style='font-size:11px; color:#000000;'><b>" +  $filter('number')(dataContext.incomefromsocial,2) + "</b></span>";
                      str += "<br />";
                      str += utilService.translate("Income from Savings") + ": <span style='font-size:11px; color:#000000;'><b>" +  $filter('number')(dataContext.incomefromsaving,2) + "</b></span>";
                      str += "<br />";
                      str += utilService.translate("Annual Expense") + ": <span style='font-size:11px; color:#000000;'><b>" +  $filter('number')(dataContext.annualexpense,2) + "</b></span>";
                      return str;
                  }
              }
            ],
            //"plotAreaFillAlphas": 0.1,
            "categoryField": "year",
            "categoryAxis": {              
                "axisColor": "#DADADA",
                "gridAlpha": 0.07,
                "title": utilService.translate("Age"),
                "guides": [{
                    category:  $rootScope.PersonaPlan.retirement_age,
                    lineColor: "red",
                    above: true,
                    lineAlpha: 1,
                    dashLength: 2,
                    inside: true,
                    labelRotation: 90,
                    label: utilService.translate("Retirement Age")
                }]
            },
            "valueAxes": [{
                "stackType": "regular",
                "gridAlpha": 0.07,
                "position": "left",
                "title": ""
            }],
            //"chartCursor": {
            //    "cursorAlpha": 0,
            //    "categoryBalloonEnabled": false
            //},
            "chartScrollbar": {},
            //"plotAreaFillAlphas": 0.1,
            //"startDuration": 1,
            addClassNames: true,
            "legend": {
                "enabled": true,
                "align": "center",
                "position": "bottom",
                "data":
                    [{ title: utilService.translate("Income from Social Annuities"), color: "#46C2FF", backgroundColor: "#2EFE2E" },
                     { title: utilService.translate("Income from Savings"), color: "#039BE4", backgroundColor: "#FF0000" },
                     { title: utilService.translate("Annual Expense"), color: "#323232", backgroundColor: "#FF0000" }]
            },
            "allLabels": [],
            "export": {
                "enabled": false
            }

        });
        var startIndex = 0;
        zoomedEvent = null;
        chartretirement.addListener("zoomed", function (event) {
            if (!isValidateData || zoomedEvent == null) {
                zoomEndIndex = event.endIndex;
                zoomStartIndex = event.startIndex;
                zoomedEvent = true;
            }
            startIndex = event.startIndex;
            var objsending = { datatype: 'zoomed', objecttype: 'dev_detaillifeStype', startIndex: event.startIndex, endIndex: event.endIndex };
            $rootScope.SendingScreenSharingDataObject(objsending, 'zoomed', 'chartRetirement', 'dev_detaillifeStype');
        });

        chartretirement.addListener("rollOverGraphItem", function (event) {

            var saving = $("g.amcharts-graph-Retirement_saving").find("path");
            saving.css({ "opacity": "0.1" });

            saving[event.index - startIndex].style.opacity = 0.9;
            var social = $("g.amcharts-graph-social").find("path");
            social.css({ "opacity": "0.1" });
            social[event.index - startIndex].style.opacity = 0.9;
            var annualexpense = $(".amcharts-graph-Annual_expense").find(".amcharts-graph-bullet");
            annualexpense.css({ "opacity": "0.1" });            
            annualexpense[event.index - startIndex].style.opacity = 0.9;            
            self.bindingDataForView(event.index);
            var objsending = { datatype: 'rollOverGraphItem', objecttype: 'rollOverGraphItem', index: event.index - startIndex };
            $rootScope.SendingScreenSharingDataObject(objsending, 'hover', 'rollOverGraphItem', 'dev_detaillifeStype');
        });
        $("#chartRetirement").mouseleave(function (event) {
            self.resetValueForChart(); 
            var objsending = { datatype: 'leaveItem', objecttype: 'leaveItem' };
            $rootScope.SendingScreenSharingDataObject(objsending, 'hover', 'leaveItem', 'dev_detaillifeStype');
        });
        self.bindingDataForView(0);
        this.zoomChart();
    }
    this.zoomChart = function () { 
        if (isValidateData && zoomEndIndex != null && zoomStartIndex != null) {
            chartretirement.zoomToIndexes(zoomStartIndex, zoomEndIndex);
            isValidateData = false;
            return;
        }
        var index = chartretirement.dataProvider.length;
        for (var i = 0; i < index; i++) {
            if (chartretirement.dataProvider[i].year == "80")
                index = i;
        }
        chartretirement.zoomToIndexes(0, index); 
    }
    this.resetValueForChart = function () {
        var saving = $("g.amcharts-graph-Retirement_saving").find("path");
        saving.css({ "opacity": "0.9" });
        var social = $("g.amcharts-graph-social").find("path");
        social.css({ "opacity": "0.9" });
        var expense = $("g.amcharts-graph-Annual_expense").find("path");
        expense.css({ "opacity": "0.9" });
        this.bindingDataForView(0);
    }
    this.changeZoomToIndex = function (begin, end) {
        chartretirement.zoomToIndexes(begin, end);
    };
    this.bingdingDataForSharing = function (index) {
        var saving = $("g.amcharts-graph-Retirement_saving").find("path");
        saving.css({ "opacity": "0.1" });

        saving[index].style.opacity = 0.9;
        var social = $("g.amcharts-graph-social").find("path");
        social.css({ "opacity": "0.1" });

        social[index].style.opacity = 0.9;

        var annualexpense = $(".amcharts-graph-Annual_expense").find(".amcharts-graph-bullet");
        annualexpense.css({ "opacity": "0.1" });
        annualexpense[index].style.opacity = 0.9;
        this.bindingDataForView(index);
    }
    this.bindingDataForView = function (index) {        
        var distance = parseInt($rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age);
        var total_expense = parseFloat($rootScope.ExpenseData.recurring_expense[index + distance])
                    + $rootScope.savingRate.getMortageRepayment(index + distance)
                    + $rootScope.savingRate.getExpensesFromProperty(index + distance)
                    + parseFloat($rootScope.ExpenseData.insufficient_funds[index + distance]);
        if ($rootScope.IncomeData.income_from_social_security != null) {
            var saving = total_expense > parseFloat($rootScope.IncomeData.income_from_social_security[index + distance]) ? total_expense - parseFloat($rootScope.IncomeData.income_from_social_security[index + distance]) : parseFloat(0);
            saving = saving / (isCumulative_inflation === true ? $rootScope.Cumulative_inflation[index + distance] : 1);
            $rootScope.chartObject = {
                age: index + $rootScope.PersonaPlan.retirement_age,
                incomefromsocial: parseFloat($rootScope.IncomeData.income_from_social_security[index + distance])/ (isCumulative_inflation === true ? $rootScope.Cumulative_inflation[index + distance] : 1),
                incomefromsaving: saving,
                incomesource: parseFloat($rootScope.IncomeData.income_from_social_security[index + distance])/ (isCumulative_inflation === true ? $rootScope.Cumulative_inflation[index + distance] : 1) + saving,
                annualexpense: total_expense / (isCumulative_inflation === true ? $rootScope.Cumulative_inflation[index + distance] : 1)
            }
            $timeout(function () {
                $rootScope.$apply();
            }, 50);
        }
    };
    this.isBindingDataForChart = false;
    this.updateChart = function () {
        if (chartretirement == null) {
            isValidateData = true;
            this.init();
        }
        if (angular.isDefined(chartretirement.dataProvider)) chartretirement.dataProvider.shift();
        chartretirement.dataProvider = this.initDataForProvider();
        this.isBindingDataForChart = true;
        isValidateData = true;
        if (chartretirement.categoryAxis.guides && chartretirement.categoryAxis.guides.length > 0) {
            chartretirement.categoryAxis.guides[0].category = $rootScope.PersonaPlan.retirement_age;
        }
        
        this.zoomChart();
    }

    this.showChart = function () {
        if (this.isBindingDataForChart) {
            chartretirement.validateData();
            this.zoomChart();
            this.isBindingDataForChart = false;
        }
    }

    this.changeInflattion = function (status) {
        isCumulative_inflation = status;
        this.updateChart();
        this.showChart();
        $rootScope.SendingScreenSharingDataObject(status, 'retirementLifeStyle', 'changeInflattion');
        //chartretirement.validateData();
    }
    this.UpdateControlForShareScreen = function (obj) {
        switch (obj.actionEvent) {
            case 'changeInflattion':
                if (obj.newValue == true) {
                    $('#retirerates-btn1').click();
                } else {
                    $('#retirerates-btn2').click();
                }
                this.changeInflattion(obj.newValue);
                break;
            case 'clickOnSavingRate':
                $("*[parent='" + obj.newValue + "']").slideToggle('slow');
                break;
            default:
        }
    }
    return this;
});