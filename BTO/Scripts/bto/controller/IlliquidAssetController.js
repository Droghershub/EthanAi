btoApp.controller('IlliquidAssetController', [
       '$scope', 'personaplanService', '$timeout', '$rootScope', 'timelineService', '$templateCache', 'ultilService',
       function ($scope, personaplanService, $timeout, $rootScope, timelineService, $templateCache, ultilService) {
           $scope.controllerName = 'IlliquidAssetController';
           
           $templateCache.remove('/Home/IlliquidAsset');
           $rootScope.spinner.on();
           $rootScope.tabType = 'IlliquidAsset';
           // check if is playing back or sharing
           if ($rootScope.playBackPlayerData.data == null) {
               personaplanService.CalculateIlliquidCurveAsyncFalse($rootScope.PersonaPlan).then(
                     function (obj) {
                         if (obj != null) {
                             $rootScope.MainResult = obj.data.basic;
                             $rootScope.IlliquidCurveChart = obj.data;
                             InitdrawChartIlliquid($scope, $timeout, $rootScope);
                             $rootScope.spinner.off();
                             $rootScope.SendingScreenSharingDataObject(obj.data, 'tab', 'open', 'IlliquidAsset');
                         }
                     }
               );
           } else {
               $timeout(function () {
                   $rootScope.MainResult = $rootScope.playBackPlayerData.data.basic;
                   $rootScope.IlliquidCurveChart = $rootScope.playBackPlayerData.data;
                   InitdrawChartIlliquid($scope, $timeout, $rootScope);
                   $rootScope.playBackPlayerData.data = null;
                   $rootScope.spinner.off();
               }, 500);

           }
           $scope.callfromOutsite = function () {
               updatedrawChartIlliquid($scope, $timeout, $rootScope);
           };
           var chartIlLiquidSetting = {
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
               colorBottom: '#008000',
               colorTop: '#0000FF',
               colorZeroReturn: '#000000',
               colorNegative: '#FF0000',
               isNegativeColor: true,
           };
           function InitdrawChartIlliquid($scope, $timeout, $rootScope) {
               var labels = [];
               var max = parseInt($rootScope.PersonaPlan.death_age) - parseInt($rootScope.PersonaPlan.start_age);
               for (var i = 0 ; i <= max ; i++) {
                   labels[i] = ($rootScope.PersonaPlan.start_age + i);
               }
               $rootScope.labels = labels;
               $rootScope.IlliquidCurveChartData = InitData($rootScope);
               InitLiquidChart($scope, $timeout, $rootScope); 
           }
           function InitData($rootScope) { 
               var data = [
                  parseToRound($rootScope.IlliquidCurveChart.illiquid_asset),
                  parseToRound($rootScope.IlliquidCurveChart.net_equity)
               ];
               return data;
           }
           function updatedrawChartIlliquid($scope, $timeout, $rootScope) {
               if (parseInt($rootScope.PersonaPlan.start_age) != parseInt($scope.start_age)) {
                   InitdrawChartIlliquid($scope, $timeout, $rootScope);
                   $scope.start_age = parseInt($rootScope.PersonaPlan.start_age);
               }
               else {
                   var data = InitData($rootScope);
                   $scope.illiquidChart.data = data;
               }
           }
           function InitLiquidChart($scope, $timeout, $rootScope) {
               $scope.illiquidChart = {
                   options: chartIlLiquidSetting,
                   labels: $rootScope.labels,
                   type: 'Bar',
                   data: $rootScope.IlliquidCurveChartData,
                   series: [
                        ultilService.translate("Asset Value"),
                        ultilService.translate("Net Equity"),
                   ],
                   colours: [
                        {
                            strokeColor: chartIlLiquidSetting.colorTop,
                            fillColor: chartIlLiquidSetting.colorTop,
                            pointStrokeColor: chartIlLiquidSetting.colorTop,
                            pointColor: chartIlLiquidSetting.colorTop,
                        }, 
                        {
                            strokeColor: chartIlLiquidSetting.colorBottom,
                            fillColor: chartIlLiquidSetting.colorBottom,
                            pointStrokeColor: chartIlLiquidSetting.colorBottom,
                            pointColor: chartIlLiquidSetting.colorBottom,
                        }
                   ]

               }
           }
           $rootScope.sharingActionData.data = $scope.name;
           $rootScope.sharingActionData.name = 'SWITCH_TAB';
       }
]);


function repaintchartIlliquid() {
    if (document.getElementById('IlliquidAssetChart') != undefined) {
        angular.element(document.getElementById('IlliquidAssetChart')).scope().callfromOutsite();
    }
}
 