btoApp.controller('liquidIlliquidAssetController', [
       '$scope', 'personaplanService', '$timeout', '$rootScope', 'timelineService', '$templateCache', 'ultilService', '$window',
function ($scope, personaplanService, $timeout, $rootScope, timelineService, $templateCache, ultilService, $window) {
    $scope.controllerName = 'liquidIlliquidAssetController';
    
           $templateCache.remove('/Home/LiquidIlliquidAsset');
           $rootScope.spinner.on();
           $rootScope.tabType = 'liquidIlliquidAsset';
           $scope.listModel = {
                   Top: false,
                   Median: true,
                   Bottom: true,
                   Zero: true
           }

            // check if is playing back or sharing
           if ($rootScope.playBackPlayerData.data == null) {
               personaplanService.CalculateEquityCurveAsyncFalse($rootScope.PersonaPlan).then(
                     function (obj) {
                         if (obj != null) {
                             $rootScope.MainResult = obj.data.basic;
                             $rootScope.EquityCurveChart = obj.data;
                             InitdrawChartLiquid($scope, $timeout, $rootScope);
                             $rootScope.spinner.off();
                             $rootScope.SendingScreenSharingDataObject(obj.data, 'tab', 'open', 'LiquidIlliquidAsset');
                         }
                     }
               );
           } else {
               $timeout(function () {
                   $rootScope.MainResult = $rootScope.playBackPlayerData.data.basic;
                   $rootScope.EquityCurveChart = $rootScope.playBackPlayerData.data;
                   InitdrawChartLiquid($scope, $timeout, $rootScope);
                   $rootScope.playBackPlayerData.data = null;
                   $rootScope.spinner.off();
               }, 500);
           }
           $scope.callfromOutsite = function () {
                updatedrawChartLiquid($scope, $timeout, $rootScope);
                $scope.isChangeRickReturn = true;
                $scope.rickValue = Math.round((angular.copy($rootScope.PersonaPlan.volatility) * 100) * 100) / 100;
                $scope.rickReturn = Math.round((angular.copy($rootScope.PersonaPlan.risk_return) * 100) * 100) / 100;
           };
           $scope.callfromOutsiteForSelectItem = function (obj) {               
               $scope.ShowHideLineChart(obj.value, obj.typeAction);
           };

    /*BEGIN integrate rick and rick return*/
    // Risk and Expected Return
    $scope.rickGaugeChartData = ultilService.getRickGaugeCharConfigtData();
    $scope.rickTableChartData = ultilService.getRickAndRickReturnTableCharConfigtData();
    $scope.getRiskReturn = function (value) {
        //return $scope.rickTableChartData.line.linearPortion * value;
        var result = $scope.rickTableChartData.line.linearPortion * value;
        return parseFloat(result.toFixed(4));
    }

    $scope.rickValue = Math.round((angular.copy($rootScope.PersonaPlan.volatility) * 100) * 100) / 100;
    $scope.rickReturn = Math.round((angular.copy($rootScope.PersonaPlan.risk_return) * 100) * 100) / 100;
    $scope.isChangeRickReturn = true;
    $scope.isResizeWindow = false;
    $scope.currentTimeout = null;



    $scope.rickChangeValue = function (data) {        
        if (!$scope.isChangeRickReturn && !$scope.isResizeWindow) {
            $rootScope.PersonaPlan.volatility = data.modelData / 100;
            $rootScope.PersonaPlan.risk_return = $scope.getRiskReturn($rootScope.PersonaPlan.volatility);
            if (data.isMoveNeedle) {
                $rootScope.Settings.isInstantRequest = false;
                $rootScope.SetEventActionTypeForShare('liquid_gauge_chart', 'begin');
            } else {
                $rootScope.Settings.isInstantRequest = true;
                $rootScope.SetEventActionTypeForShare('liquid_gauge_chart', 'end');
            }
            $scope.rickValue = data.modelData
            $scope.rickReturn = $scope.getRiskReturn(data.modelData);            
            $rootScope.requestSaveAndUpdateScreen();
            
        } else {
            $timeout.cancel($scope.currentTimeout);
            if ($scope.isResizeWindow) {
                $scope.currentTimeout = $timeout(function () {
                    $scope.isChangeRickReturn = false;
                    $scope.isResizeWindow = false;
                }, 500);
            } else {
                $scope.currentTimeout = $timeout(function () {
                    $scope.isChangeRickReturn = false;
                    $scope.isResizeWindow = false;
                }, 50);
            }
        }
        
    }

    $scope.rickExpectedReturnChangeValue = function (data) {        
        $scope.isChangeRickReturn = true;
        $scope.rickValue = data.modelDataX;
        $scope.rickReturn = data.modelDataY;
        $rootScope.PersonaPlan.volatility = data.modelDataX / 100;
        $rootScope.PersonaPlan.risk_return = data.modelDataY / 100;
        if (data.isMoveCircle) {
            $rootScope.Settings.isInstantRequest = false;
            $rootScope.SetEventActionTypeForShare('liquid_gauge_chart', 'begin');
        } else {
            $rootScope.Settings.isInstantRequest = true;
            $rootScope.SetEventActionTypeForShare('liquid_gauge_chart', 'end');
        }
        $rootScope.scopeApply($scope, true);
        
        $rootScope.requestSaveAndUpdateScreen();
        $scope.isChangeRickReturn = false;
    }

    angular.element($window).bind('resize', function () {
        $scope.isResizeWindow = true;
        $scope.isChangeRickReturn = true;
    });

    /*End integrate rick and rick return*/
           var chartLiquidSetting = {
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
               colorMedian: '#0000FF',
               colorBottom: '#FF0000',
               colorTop: '#008000',
               colorZeroReturn: '#000000',
               colorNegative: '#FF0000',
               isNegativeColor: true,
           };
           function InitdrawChartLiquid($scope, $timeout, $rootScope) {
               $scope.spinner.on();
               $scope.start_age = parseInt($rootScope.PersonaPlan.start_age);
               var labels = [];
               var max = parseInt($rootScope.PersonaPlan.death_age) - parseInt($rootScope.PersonaPlan.start_age) +1;
               for (var i = 0 ; i <= max ; i++) {
                   labels[i] = ($rootScope.PersonaPlan.start_age - 1 + i);
               
               }
               $rootScope.labels = labels;
               $rootScope.EquityCurveChartData = InitData($rootScope);
               InitLiquidChart($scope, $timeout, $rootScope);
               $scope.spinner.off();
           }

           function updatedrawChartLiquid($scope, $timeout, $rootScope) {
                if (parseInt($rootScope.PersonaPlan.start_age) != parseInt($scope.start_age))
                {
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
           function updateShowHideChart(value, typeAction)
           { 
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
               $rootScope.scopeApply($scope);
             
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
               $rootScope.scopeApply($scope);
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
           function InitColors()
           {
               var colors = [];
               if ($scope.listModel.Top == true)
                   colors[colors.length] =  {
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
           function InitSeries()
           { 
               var series = [];
               if ($scope.listModel.Top == true)
                   series[series.length] = ultilService.translate("Top equity curve");
               if ($scope.listModel.Median == true)
                   series[series.length] = ultilService.translate("Medium equity curve");
               if ($scope.listModel.Bottom == true)
                   series[series.length] = ultilService.translate("Bottom equity curve");
               if ($scope.listModel.Zero == true)
                   series[series.length] = ultilService.translate("Zero return"); 
               return series;
           }
           $rootScope.currentScope = $scope;
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