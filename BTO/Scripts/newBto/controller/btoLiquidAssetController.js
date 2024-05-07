btoApp.controller('liquidAssetController', ['$scope', 'personalPlanService', '$timeout', '$rootScope','utilService', '$window', 'CONFIG', 'actionService',
function ($scope, personalPlanService, $timeout, $rootScope, utilService, $window, CONFIG, actionService) {
    // No remove
    $rootScope.scope = $scope;
    $scope.title = "Liquid";
    $scope.name = CONFIG.TAB.LIQUID_ASSET;
    
    // End No remove
    
    $rootScope.spinner.on();
    
    $scope.listModel = {
        Top: false,
        Median: true,
        Bottom: true,
        Zero: true
    }
    // check if is playing back or sharing
    $scope.callbackReciveData = function (obj) {
        $rootScope.MainResult = obj.basic;
        $rootScope.EquityCurveChart = obj;
        InitdrawChartLiquid($scope, $timeout, $rootScope);
        $rootScope.spinner.off();
     //   $rootScope.SendingScreenSharingDataObject(obj.data, 'tab', 'open', 'LiquidIlliquidAsset');
    }
    //$rootScope.playBackPlayerData = {};
    if ($rootScope.playBackPlayerData.data == null) {
        // personalPlanService.calculateEquityCurve($rootScope.PersonaPlan, $scope.callbackReciveData);
        actionService.calculateData();
    } else {
        $timeout(function () {
            utilService.updateMainResultFromPlayerData();
            $rootScope.EquityCurveChart = $rootScope.playBackPlayerData.data;
            InitdrawChartLiquid($scope, $timeout, $rootScope);
            $rootScope.playBackPlayerData.data = null;
            $rootScope.spinner.off();
            $scope.updatedrawChartLiquid();
        }, 500);
    }

    $scope.callfromOutsite = function () {
        if ($rootScope.playBackPlayerData.data == null) {
            $scope.updatedrawChartLiquid();
        } else {
            $timeout(function () {
                utilService.updateMainResultFromPlayerData();
                $rootScope.EquityCurveChart = $rootScope.playBackPlayerData.data;
                InitdrawChartLiquid($scope, $timeout, $rootScope);
                $rootScope.playBackPlayerData.data = null;
                $rootScope.spinner.off();
                $scope.updatedrawChartLiquid();
            }, 500);
        }
    };

    $scope.callfromOutsiteForSelectItem = function (obj) {
        console.log(obj);
        $scope.ShowHideLineChart(obj.value, obj.typeAction);
    };

    var chartLiquidSetting = CONFIG.CHART.LIQUID;
    function InitdrawChartLiquid($scope, $timeout, $rootScope) {
        $scope.spinner.on();
        $scope.start_age = parseInt($rootScope.PersonaPlan.start_age);
        var labels = [];
        var max = parseInt($rootScope.PersonaPlan.death_age) - parseInt($rootScope.PersonaPlan.start_age) + 1;
        for (var i = 0 ; i <= max ; i++) {
            labels[i] = ($rootScope.PersonaPlan.start_age - 1 + i);

        }
        $rootScope.labels = labels;
        $rootScope.EquityCurveChartData = InitData($rootScope);
        InitLiquidChart($scope, $timeout, $rootScope);
        $scope.spinner.off();
    }

    $scope.updatedrawChartLiquid = function () {
        if (parseInt($rootScope.PersonaPlan.start_age) != parseInt($scope.start_age)) {
            InitdrawChartLiquid($scope, $timeout, $rootScope);
            $scope.start_age = parseInt($rootScope.PersonaPlan.start_age);
        }
        else {
            var data = InitData($rootScope);
            $scope.liquidChart.isneedrender = true;
            $scope.liquidChart.data = data;
        }
    }
    var isfrist = 0;
    $scope.ShowHideLineChart = function (value, typeAction) {
        updateShowHideChart(value, typeAction);
        InitdrawChartLiquid($scope, $timeout, $rootScope);
        var item = {
            value: value,
            typeAction: typeAction
        };
        $rootScope.SendingScreenSharingDataObject(item, 'tab', 'select', 'LiquidIlliquidAsset');
    }
    function updateShowHideChart(value, typeAction) {
        if (typeAction == 'Top') {
            if (value == false) {
                $scope.listModel.Top = true;
            } else $scope.listModel.Top = false;
        }
        if (typeAction == 'Median') {
            if (value == false) {
                $scope.listModel.Median = true;
            } else $scope.listModel.Median = false
        }

        if (typeAction == 'Bottom') {
            if (value == false) {
                $scope.listModel.Bottom = true;
            } else $scope.listModel.Bottom = false;
        }
        if (typeAction == 'Zero') {
            if (value == false) {
                $scope.listModel.Zero = true;
            } else $scope.listModel.Zero = false;
        }
        utilService.scopeApply($scope);

    }
    function InitLiquidChart($scope, $timeout, $rootScope) {
        $scope.liquidChart = {
            options: chartLiquidSetting,
            labels: $rootScope.labels,
            type: 'Line',
            data: $rootScope.EquityCurveChartData,
            series: InitSeries(),
            colours: InitColors()
        };
        utilService.scopeApply($scope);
    }
    function InitData($rootScope) {
        var data = [];
        if ($scope.listModel.Top == true)
            data[data.length] = parseToRound($rootScope.EquityCurveChart.top_equity_curve);
        if ($scope.listModel.Median == true)
            data[data.length] = parseToRound($rootScope.EquityCurveChart.average_equity_curve);
        if ($scope.listModel.Bottom == true)
            data[data.length] = parseToRound($rootScope.EquityCurveChart.bottom_equity_curve);
        if ($scope.listModel.Zero == true)
            data[data.length] = parseToRound($rootScope.EquityCurveChart.zero_return);
        return data;
    }
    function InitColors() {
        var colors = [];
        if ($scope.listModel.Top == true)
            colors[colors.length] = {
                strokeColor: chartLiquidSetting.colorTop,
                fillColor: chartLiquidSetting.colorTop,
                pointStrokeColor: chartLiquidSetting.colorTop,
                pointColor: chartLiquidSetting.colorTop,
            };
        if ($scope.listModel.Median == true)
            colors[colors.length] = {
                strokeColor: chartLiquidSetting.colorMedian,
                fillColor: chartLiquidSetting.colorMedian,
                pointStrokeColor: chartLiquidSetting.colorMedian,
                pointColor: chartLiquidSetting.colorMedian,
            };
        if ($scope.listModel.Bottom == true)
            colors[colors.length] = {
                strokeColor: chartLiquidSetting.colorBottom,
                fillColor: chartLiquidSetting.colorBottom,
                pointStrokeColor: chartLiquidSetting.colorBottom,
                pointColor: chartLiquidSetting.colorBottom,
            };
        if ($scope.listModel.Zero == true)
            colors[colors.length] = {
                strokeColor: chartLiquidSetting.colorZeroReturn,
                fillColor: chartLiquidSetting.colorZeroReturn,
                pointStrokeColor: chartLiquidSetting.colorZeroReturn,
                pointColor: chartLiquidSetting.colorZeroReturn,
            };
        return colors;
    }
    function InitSeries() {
        var series = [];
        if ($scope.listModel.Top == true)
            series[series.length] = utilService.translate("Top equity curve");
        if ($scope.listModel.Median == true)
            series[series.length] = utilService.translate("Medium equity curve");
        if ($scope.listModel.Bottom == true)
            series[series.length] = utilService.translate("Bottom equity curve");
        if ($scope.listModel.Zero == true)
            series[series.length] = utilService.translate("Zero return curve");
        return series;
    }
    

    $rootScope.sharingActionData.data = $scope.name;
    $rootScope.sharingActionData.action = 'SWITCH_TAB';
}
]);


function repaintchartEquid() {
    if (document.getElementById('LiquidIlliquidAssetChart') != undefined)
        angular.element(document.getElementById('LiquidIlliquidAssetChart')).scope().callfromOutsite();
}
function repaintchartEquidForSelectItem(obj) {
    if (document.getElementById('LiquidIlliquidAssetChart') != undefined)
        angular.element(document.getElementById('LiquidIlliquidAssetChart')).scope().callfromOutsiteForSelectItem(obj);
}
function parseToRound(array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] <= 0)
            array[i] = 0;
        else
            array[i] = Number(array[i]).toFixed(2);
    }
    return array;
}