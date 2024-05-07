btoApp.controller('illiquidAssetController', [
       '$scope', 'personalPlanService', '$timeout', '$rootScope','$templateCache', 'utilService', 'CONFIG', 'actionService',
       function ($scope, personalPlanService, $timeout, $rootScope, $templateCache, utilService, CONFIG, actionService) {
           // No remove
           $rootScope.scope = $scope;
           $scope.title = "Illiquid Page";
           $scope.name = CONFIG.TAB.ILLIQUID_ASSET;
           // End No remove

           $rootScope.spinner.on();
           // check if is playing back or sharing
           $scope.callBackReciveData = function (obj) { 
               $rootScope.MainResult = obj.basic;
               $rootScope.IlliquidCurveChart = obj;
               InitdrawChartIlliquid($scope, $timeout, $rootScope);
               $rootScope.spinner.off();
               // $rootScope.SendingScreenSharingDataObject(obj.data, 'tab', 'open', 'IlliquidAsset');
           }
           // $rootScope.playBackPlayerData = {};
           if ($rootScope.playBackPlayerData.data == null) {
               // personalPlanService.calculateIlliquidCurve($rootScope.PersonaPlan, $scope.callBackReciveData);
               actionService.calculateData();
           } else {
               $timeout(function () {
                   utilService.updateMainResultFromPlayerData();
                   $rootScope.IlliquidCurveChart = $rootScope.playBackPlayerData.data;
                   InitdrawChartIlliquid($scope, $timeout, $rootScope);
                   $rootScope.playBackPlayerData.data = null;
                   $rootScope.spinner.off();
                   $scope.updatedrawChartIlliquid();
               }, 500);
           }

           $scope.callfromOutsite = function () {
               if ($rootScope.playBackPlayerData.data != null) {
                   $timeout(function () {
                       utilService.updateMainResultFromPlayerData();
                       $rootScope.IlliquidCurveChart = $rootScope.playBackPlayerData.data;
                       InitdrawChartIlliquid($scope, $timeout, $rootScope);
                       $rootScope.playBackPlayerData.data = null;
                       $rootScope.spinner.off();
                       $scope.updatedrawChartIlliquid();
                   }, 500);
               } else {
                   $scope.updatedrawChartIlliquid();
               }               
           };

           var chartIlLiquidSetting = CONFIG.CHART.ILLIQUID;
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
           $scope.updatedrawChartIlliquid = function(){
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
                        utilService.translate("Asset Value"),
                        utilService.translate("Net Equity"),
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
           $rootScope.sharingActionData.action = 'SWITCH_TAB';
       }
]);
function repaintchartIlliquid() {
    if (document.getElementById('IlliquidAssetChart') != undefined) {
        angular.element(document.getElementById('IlliquidAssetChart')).scope().callfromOutsite();
    }
}

