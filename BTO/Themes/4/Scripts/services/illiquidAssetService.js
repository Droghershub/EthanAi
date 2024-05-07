var swiperIliquid = null;
btoApp.service('illiquidAssetService', function ($rootScope, utilService, $timeout, CONFIG, $filter) {
    var chart = null, isShowAll = 1, zoomStartIndex = null, zoomEndIndex = null, isValidateData = false, zoomedEvent = null;
    var listOrderDiplay = ["total_cost", "down_payment", "payment_duration", "mortage_interest_rate", "rental_net_income", "yearly_expenses", ]
    this.initDataForProvider = function () {
        return this.getDataForChart(this.isShowAll);
    },
    this.carouselIndex = 0;
    $rootScope.illiquidAssetView = { year: 0, asset: 0, net: 0, individual: true };
    $rootScope.SwiperDreams = [];
    this.getDataForChart = function (mode) {
        var data = [];
        if (mode == 1) {
            var illiquidSelected = null;
            if ($rootScope.selectedDreamSwiper != null) {
                if ($rootScope.IlliquidCurveChart.illiquidAsset != null) {
                    for (var j = 0; j < $rootScope.IlliquidCurveChart.illiquidAsset.length; j++) {
                        if ($rootScope.selectedDreamSwiper.name == $rootScope.IlliquidCurveChart.illiquidAsset[j].name) {
                            illiquidSelected = $rootScope.IlliquidCurveChart.illiquidAsset[j];
                            break;
                        }
                    }
                }
            }
            if (illiquidSelected != null) {
                for (var t = 0; t < illiquidSelected.asset.length; t++) {
                    data[t] = {
                        "year": 0,
                        "asset": 0,
                        "net": 0,
                        "colorAsset": "#0079B2",
                        "colorNet": "#00ACFE"
                    }
                }
                for (var i = 0; i < illiquidSelected.asset.length; i++) {
                    data[i] = {
                        "year": parseInt($rootScope.PersonaPlan.start_age) + i,
                        "asset": 0,
                        "net": 0,
                        "colorAsset": "#0079B2",
                        "colorNet": "#00ACFE"
                    }
                    if (illiquidSelected.debt[i] == "NaN")
                        illiquidSelected.debt[i] = 0;
                    if (illiquidSelected.asset[i] == "NaN")
                        illiquidSelected.asset[i] = 0;
                    data[i].year = parseInt($rootScope.PersonaPlan.start_age) + i;
                    data[i].asset = parseFloat(illiquidSelected.asset[i]);
                    data[i].net = parseFloat(illiquidSelected.asset[i]) + parseFloat(illiquidSelected.debt[i]);
                }
            }
        } else {
            if ($rootScope.IlliquidCurveChart.illiquidAsset.length > 0) {
                for (var t = 0; t < $rootScope.IlliquidCurveChart.illiquidAsset[0].asset.length; t++) {
                    data[t] = {
                        "year": 0,
                        "asset": 0,
                        "net": 0,
                        "colorAsset": "#0079B2",
                        "colorNet": "#00ACFE"
                    }
                }
                for (var j = 0; j < $rootScope.IlliquidCurveChart.illiquidAsset.length; j++) {
                    for (var i = 0; i < $rootScope.IlliquidCurveChart.illiquidAsset[j].asset.length; i++) {
                        if ($rootScope.IlliquidCurveChart.illiquidAsset[j].dream_type_id == 1) {
                            if ($rootScope.IlliquidCurveChart.illiquidAsset[j].debt[i] == "NaN")
                                $rootScope.IlliquidCurveChart.illiquidAsset[j].debt[i] = 0;
                            if ($rootScope.IlliquidCurveChart.illiquidAsset[j].asset[i] == "NaN")
                                $rootScope.IlliquidCurveChart.illiquidAsset[j].asset[i] = 0;
                            data[i].year = parseInt($rootScope.PersonaPlan.start_age) + i;
                            data[i].asset = data[i].asset + $rootScope.IlliquidCurveChart.illiquidAsset[j].asset[i];
                            data[i].net = data[i].net + $rootScope.IlliquidCurveChart.illiquidAsset[j].asset[i] + $rootScope.IlliquidCurveChart.illiquidAsset[j].debt[i];
                        }
                    }
                }
            }
        }
        for (var t = 0; t < data.length; t++) {
            data[t].asset = parseFloat(Number(data[t].asset * 1000).toFixed(2));
            data[t].net = parseFloat(Number(data[t].net * 1000).toFixed(2));
        }
        return data;
    }
    this.changeValueAndValidate = function (fieldname) {
        var self = this;
        var item = $rootScope.selectedDreamSwiper[fieldname];
        $timeout.cancel(this.timeoutObj);
        this.timeoutObj = $timeout(function () {
            if (angular.isUndefined(item) || item == '' || typeof (item) == undefined) {
                $rootScope.selectedDreamSwiper[fieldname] = 0;
            }
            self.saveChangeDream();
        }, 1000);
    },
    this.InitPercentForDreamDisplay = function (dream) {
        var itemReturn = angular.copy(dream);
        itemReturn['mortage_interest_rate'] = dream['mortage_interest_rate'] * 100;
        itemReturn['mortage_interest_rate'] = dream['mortage_interest_rate'] * 100;
        itemReturn['rental_net_income'] = dream['rental_net_income'] * 100;
        itemReturn['yearly_expenses'] = dream['yearly_expenses'] * 100;
        return itemReturn;
    },
    this.GetSwiperDream = function (dream) {
        var itemReturn = angular.copy(dream);
        itemReturn['mortage_interest_rate'] = dream['mortage_interest_rate'] / 100;
        itemReturn['mortage_interest_rate'] = dream['mortage_interest_rate'] / 100;
        itemReturn['rental_net_income'] = dream['rental_net_income'] / 100;
        itemReturn['yearly_expenses'] = dream['yearly_expenses'] / 100;
        return itemReturn;
    },
    this.focusChangeDreamValue = null;
    this.saveChangeDream = function (totalCost) {
        this.updateDream();
        if (this.focusChangeDreamValue != totalCost) {
            $rootScope.actionService.updateData();
        }
        this.focusChangeDreamValue = null;
    },
    this.updateDream = function () {
        if ($rootScope.selectedDreamSwiper != null) {
            for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
                if ($rootScope.PersonaPlan.dreams[i].id == $rootScope.selectedDreamSwiper.id) {
                    var itemValue = this.GetSwiperDream($rootScope.selectedDreamSwiper);
                    $rootScope.PersonaPlan.dreams[i] = itemValue;
                    $('.dream_income_' + $rootScope.selectedDreamSwiper.id).html($rootScope.PersonaPlan.currency_code + ' ' + $filter('number')($rootScope.selectedDreamSwiper.total_cost, 2));
                    break;
                }
            }
        }
    },
    this.saveChangeDreamSelect = function () {
        this.updateDream();
        $rootScope.actionService.updateData();
    }
    this.focusChangeDream = function (totalCost) {
        this.focusChangeDreamValue = angular.copy(totalCost);
    },
    this.showCard = function () {
        var dreamLength = $rootScope.SwiperDreams.length;
        var dream = null;
        if (this.carouselIndex == 0)
            dream = $rootScope.SwiperDreams[dreamLength - 1];
        else if (this.carouselIndex == (dreamLength + 1))
            dream = $rootScope.SwiperDreams[0];
        else dream = $rootScope.SwiperDreams[this.carouselIndex - 1];
        if (dream != null) {
            $rootScope.selectedDreamSwiper = this.InitPercentForDreamDisplay(dream);
        } else {
            $rootScope.selectedDreamSwiper = null;
        }
        this.updateChart();
        utilService.scopeApply();
    },
    this.SelectedSwiperDream = function (index) {
        $rootScope.selectedDreamSwiper = null;
        if (index == null || typeof (index) == undefined) {
            if ($rootScope.SwiperDreams.length > 0)
                $rootScope.selectedDreamSwiper = this.InitPercentForDreamDisplay($rootScope.SwiperDreams[0]);
        } else {
            var slideIndex = $rootScope.SwiperDreams.indexOf(index);
            $rootScope.selectedDreamSwiper = this.InitPercentForDreamDisplay($rootScope.SwiperDreams[slideIndex]);
        }
        utilService.scopeApply();
    },
    this.InitSwiperDreams = function () {
        $rootScope.SwiperDreams = [];
        for (var j = 0; j < $rootScope.PersonaPlan.dreams.length; j++) {
            if ($rootScope.PersonaPlan.dreams[j].dream_type_id == 1)
                $rootScope.SwiperDreams[$rootScope.SwiperDreams.length] = $rootScope.PersonaPlan.dreams[j];
        }
        if ($rootScope.SwiperDreams.length > 0)
            this.SelectedSwiperDream($rootScope.SwiperDreams[0]);
    },
    this.UpdateSwiperDreams = function (dream) {
        if (dream.dream_type_id == 1) {
            for (var i = 0; i < $rootScope.SwiperDreams.length; i++) {
                if ($rootScope.SwiperDreams[i].id == dream.id) {
                    $rootScope.SwiperDreams[i] = angular.copy(dream);
                    if ($rootScope.selectedDreamSwiper.id == dream.id) {
                        $rootScope.selectedDreamSwiper = this.InitPercentForDreamDisplay(dream);
                    }
                    break;
                }
            }
            $rootScope.SendingScreenSharingDataObject(dream, 'illiquidAsset', 'UpdateSwiperDreams', '');
        }
    }
    this.AddSwiperDreams = function (dream) {
        if (dream.dream_type_id == 1) {
            if ($rootScope.SwiperDreams.length > 0) {
                $rootScope.SwiperDreams[$rootScope.SwiperDreams.length] = dream;
            } else {
                $rootScope.SwiperDreams[0] = dream;
            }
            this.carouselIndex = $rootScope.SwiperDreams.length - 1;
            this.showCard();
            $rootScope.SendingScreenSharingDataObject(dream, 'illiquidAsset', 'AddSwiperDreams', '');
        }
    },
    this.RemoveSwiperDreams = function (dream) {
        if (dream.dream_type_id == 1) {
            var slideIndex = $rootScope.SwiperDreams.indexOf(dream);
            this.carouselIndex = 0;
            $rootScope.SwiperDreams.splice(slideIndex, 1);
            if (dream.id == $rootScope.selectedDreamSwiper.id) {
                this.showCard();
            }
            if ($rootScope.SwiperDreams.length == 0) {
                this.resetAllSwiper();
            }
            $rootScope.SendingScreenSharingDataObject(dream, 'illiquidAsset', 'RemoveSwiperDreams', '');
        }
    },
    this.resetAllSwiper = function () {
        $rootScope.SwiperDreams = [];
        $rootScope.selectedDreamSwiper = null;
        $rootScope.SendingScreenSharingDataObject('', 'illiquidAsset', 'resetAllSwiper', '');
    },
    this.makeChart = function () {
        var dataProvider = this.getDataForChart(isShowAll);
        chart = AmCharts.makeChart("chartIlliquid", {
            "type": "serial",
            "theme": "light",
            "marginRight": 15,
            "dataProvider": dataProvider,
            "pathToImages": "/Themes/" + version_id + "/Scripts/amcharts/images/",
            "valueAxes": [{
                "stackType": "regular",
                "gridAlpha": 0.07,
                "position": "left",
                "title": utilService.translate("Illiquid Assets")
            }],
            "graphs": [{
                "balloonText": utilService.translate("Asset Value") + " <span style='font-size:11px;'><b> " + $rootScope.PersonaPlan.currency_code + " [[value]]</b></span>",
                "fillAlphas": 1,
                "lineAlpha": 0.2,
                "title": utilService.translate("Asset Value"),
                "valueField": "asset",
                "fillColorsField": "colorAsset"
            }, {
                "balloonText": utilService.translate("Net Value") + " <span style='font-size:11px;'><b> " + $rootScope.PersonaPlan.currency_code + " [[value]]</b></span>",
                "fillAlphas": 1,
                "lineAlpha": 0.2,
                "stackable": false,
                "title": utilService.translate("Net Value"),
                "valueField": "net",
                "fillColorsField": "colorNet",
            }],
            "plotAreaBorderAlpha": 0,
            "marginTop": 10,
            "marginLeft": 0,
            "marginBottom": 0,
            "chartScrollbar": {},
            "chartCursor": {
                "cursorAlpha": 0
            },
            "legend": {
                "align": "center",
                "position": "top",
                "equalWidths": true,
                "data":
                    [{ title: utilService.translate("Asset Value"), color: "#0079B2", backgroundColor: "#2EFE2E" },
                     { title: utilService.translate("Net Value"), color: "#00ACFE", backgroundColor: "#FF0000" }]
            },
            "categoryField": "year",
            "categoryAxis": {
                "startOnAxis": true,
                "axisColor": "#DADADA",
                "gridAlpha": 0.07,
                "title": utilService.translate("Age"),
                "guides": [{
                    category: $rootScope.PersonaPlan.retirement_age,
                    above: true,
                    lineColor: "#CC0000",
                    lineAlpha: 1,
                    dashLength: 2,
                    inside: true,
                    labelRotation: 90,
                    label: utilService.translate("Retirement Age")
                }]
            },
            //"export": {
            //    "enabled": true
            //}
        });
        zoomedEvent = null;
        $rootScope.illiquidAsset.bindingDataForView(0, true);
        chart.addListener("changed", function (event) {
            if (typeof (event.index) != 'undefined') {
                $rootScope.illiquidAsset.bindingDataForView(event.index);
                $rootScope.SendingScreenSharingDataObject(event.index, 'illiquidAsset', 'bindingDataForView');
            }
        });
        chart.addListener("zoomed", function (event) {
            if (!isValidateData || zoomedEvent == null) {
                zoomEndIndex = event.endIndex;
                zoomStartIndex = event.startIndex;
                zoomedEvent = true;
            }
            startIndex = event.startIndex;
            var objsending = { datatype: 'zoomed', objecttype: 'div_IlliquidAsset', startIndex: event.startIndex, endIndex: event.endIndex };
            $rootScope.SendingScreenSharingDataObject(objsending, 'zoomed', 'chartIlliquid', 'div_IlliquidAsset');
        });
        $("#chartIlliquid").mouseleave(function (event) {
            $rootScope.illiquidAsset.bindingDataForView(0, true);
            $rootScope.SendingScreenSharingDataObject(0, 'illiquidAsset', 'mouseleave');
        });
        this.zoomChart();
    }
    this.init = function () {
        this.InitSwiperDreams();

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
    this.bindingDataForView = function (index, isPurchaseAge) {
        if (chart.dataProvider && chart.dataProvider.length > 0) {
            if (angular.isDefined(isPurchaseAge)) {
                if ($rootScope.illiquidAssetView.individual == true) {
                    $rootScope.illiquidAssetView.year = $rootScope.selectedDreamSwiper.purchase_age;
                    index = $rootScope.selectedDreamSwiper.purchase_age - $rootScope.PersonaPlan.start_age;
                } else {
                    var minAge = $rootScope.PersonaPlan.death_age;
                    for (var i = 0; i < $rootScope.SwiperDreams.length; i++) {
                        if ($rootScope.SwiperDreams[i].purchase_age < minAge) {
                            minAge = $rootScope.SwiperDreams[i].purchase_age;
                        }
                    }
                    $rootScope.illiquidAssetView.year = minAge;
                    index = minAge - $rootScope.PersonaPlan.start_age;
                }
                if (angular.isDefined(chart.dataProvider[index])) {
                    $rootScope.illiquidAssetView.asset = chart.dataProvider[index].asset;
                    $rootScope.illiquidAssetView.net = chart.dataProvider[index].net;
                }
            } else {
                if (angular.isDefined(chart.dataProvider[index])) {
                    $rootScope.illiquidAssetView.year = chart.dataProvider[index].year;
                    $rootScope.illiquidAssetView.asset = chart.dataProvider[index].asset;
                    $rootScope.illiquidAssetView.net = chart.dataProvider[index].net;
                }
            }
            $rootScope.utilService.scopeApply();
        }
    }
    this.changeLanguageOfChart = function () {
        chart.graphs[0].balloonText = utilService.translate("Asset Value") + " <span style='font-size:11px;'><b> " + $rootScope.PersonaPlan.currency_code + " [[value]]</b></span>";
        chart.graphs[0].title = utilService.translate("Asset Value");
        chart.graphs[1].balloonText = utilService.translate("Net Value") + " <span style='font-size:11px;'><b> " + $rootScope.PersonaPlan.currency_code + " [[value]]</b></span>";
        chart.graphs[1].title = utilService.translate("Net Value");
        chart.valueAxes[0].title = utilService.translate("Illiquid Assets")
        chart.categoryAxis.title = utilService.translate("Age");
        chart.categoryAxis.guides[0].label = utilService.translate("Retirement Age");
        isValidateData = true;
        chart.validateData();
    }
    this.isBindingDataForChart = false;
    this.updateChart = function (mode) {
        if (chart == null) {
            isValidateData = true;
            this.InitSwiperDreams();
            this.makeChart();
        }
        var checkIlliquidChart = ($('#chartIlliquid').children().length == 0);
        if (chart.chartCreated === false || checkIlliquidChart) {
            this.makeChart();
        }
        chart.dataProvider.shift();
        if (mode != null && typeof (mode) != undefined) {
            isShowAll = mode;
            chart.dataProvider = this.getDataForChart(mode);
        } else {
            chart.dataProvider = this.getDataForChart(isShowAll);
        }
        this.isBindingDataForChart = true;
        isValidateData = true;
        if (chart.categoryAxis.guides && chart.categoryAxis.guides.length > 0) {
            chart.categoryAxis.guides[0].category = $rootScope.PersonaPlan.retirement_age;
        }
    },

    this.showChart = function () {
        if (this.isBindingDataForChart) {
            chart.validateData();
            this.zoomChart();
            this.isBindingDataForChart = false;
        }
    },

    this.enterKey = function (name) {
        var findIndex = -1;
        for (var i = 0; i < listOrderDiplay.length; i++) {
            if (listOrderDiplay[i] == name) {
                findIndex = i;
            }
        }
        if (findIndex < 0 || findIndex > listOrderDiplay.length) {
            var objTmp = $('#illiquid-asset-header-' + name);
            var parentObj = objTmp.parent();
            if (parentObj.hasClass('panel') && parentObj.hasClass('panel-default')) {
                parentObj.removeClass('active');
            };
            $timeout(function () {
                objTmp.trigger('click');
            }, 150);
        } else {
            this.expandControl(listOrderDiplay[findIndex + 1]);
        }

    }
    this.expandControl = function (key) {
        var obj = $('#illiquid-asset-header-' + key);
        var expandOrCollapse = obj.attr('aria-expanded');
        if (angular.isUndefined(expandOrCollapse) || expandOrCollapse == 'false') {
            var parentObj = obj.parent();
            if (parentObj.hasClass('panel') && parentObj.hasClass('panel-default')) {
                var accordionPanel = $('#illiquid .accordion .panel');
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
                    }
                }, 150);
                if (key != '') {
                    $timeout(function () {
                        var obj = angular.element('#asset_' + key);
                        obj.focus();
                        obj.select();
                    }, 500)
                }
            } catch (ex) { };
        }
    },
     this.SharingForCardShow = function (index) {
         if (index == null || typeof index == "undefined") {
             this.carouselIndex = 0;
         } else {
             this.carouselIndex = parseInt(index);
         }
         $rootScope.illiquidAsset.SelectedSwiperDream($rootScope.SwiperDreams[this.carouselIndex]);
         $rootScope.illiquidAsset.updateChart();
         $rootScope.utilService.scopeApply();
     },
     this.expandOrCollapse = function (key) {
         $timeout(function () {
             var obj = $('#illiquid-asset-header-' + key);
             var parentObj = obj.parent();
             if (obj.attr('aria-expanded') == 'true') {
                 parentObj.addClass('active');
             } else {
                 parentObj.removeClass('active');
             }
             $rootScope.SendingScreenSharingDataObject(key, 'changeIlliquidAssetCardSwiper', 'expand_key', key);
         }, 200);
     },
    $rootScope.viewTotalLiquidAsset = function () {
        $rootScope.illiquidAssetView.individual = false;
        $rootScope.illiquidAsset.updateChart(0);
        $rootScope.illiquidAsset.showChart();
        $rootScope.SendingScreenSharingDataObject(0, 'illiquidAsset', 'viewTotalLiquidAsset', 'activeIndex');
    }
    $rootScope.viewIndividualLiquidAsset = function () {
        $rootScope.illiquidAssetView.individual = true;
        $rootScope.illiquidAsset.updateChart(1);
        $rootScope.illiquidAsset.showChart();
        $rootScope.illiquidAsset.bindingDataForView(0, true);
        $rootScope.SendingScreenSharingDataObject(0, 'illiquidAsset', 'ViewIndividual');
    }
    $rootScope.$watch('illiquidAsset.carouselIndex', function () {
        if ($rootScope.SwiperDreams.length > 0) {
            $rootScope.illiquidAsset.SelectedSwiperDream($rootScope.SwiperDreams[$rootScope.illiquidAsset.carouselIndex]);
            $rootScope.illiquidAsset.updateChart();
            $rootScope.illiquidAsset.showChart();
            $rootScope.illiquidAsset.bindingDataForView(0, true);
            $rootScope.SendingScreenSharingDataObject($rootScope.illiquidAsset.carouselIndex, 'changeIlliquidAssetCardSwiper', 'showCard', 'activeIndex');
        }
    })
    this.UpdateControlForShareScreen = function (obj) {
        switch (obj.actionEvent) {
            //case 'changeInflattion':
            //    if (obj.newValue == true) {
            //        $('#assets-btn1').click();
            //    } else {
            //        $('#assets-btn2').click();
            //    }
            //    this.changeInflattion(obj.newValue);
            //    break;
            case 'ViewIndividual':
                $('#assets-btn1').click();
                $rootScope.viewIndividualLiquidAsset();
                break;
            case 'viewTotalLiquidAsset':
                $('#assets-btn2').click();
                $rootScope.viewTotalLiquidAsset();
                break;
            case 'AddSwiperDreams':
                this.AddSwiperDreams(obj.newValue);
                break;
            case 'UpdateSwiperDreams':
                this.UpdateSwiperDreams(obj.newValue);
                break;
            case 'RemoveSwiperDreams':
                this.RemoveSwiperDreams(obj.newValue);
                break;
            case 'resetAllSwiper':
                this.resetAllSwiper(obj.newValue);
                break;
            case 'OpenAddExistingAssetDialog':
                $rootScope.timelineService.OpenAddExistingAssetDialog();
                break;
            case 'OKOpenAddExistingAssetDialog':
                $rootScope.editDreamAtViewing(obj);
                break;
            case 'cancelOpenAddExistingAssetDialog':
                $('#' + obj.controlID).modal('hide');
                break;
            case 'bindingDataForView':
                $rootScope.illiquidAsset.bindingDataForView(obj.newValue);
                break;
            case 'mouseleave':
                $rootScope.illiquidAsset.bindingDataForView(0, true);
                break;
            default:
        }
    }
    return this;
});