btoApp.controller('RankingDreamController', [
       '$scope', 'personaplanService', '$timeout', '$rootScope', 'timelineService', '$templateCache', 'ultilService',
       function ($scope, personaplanService, $timeout, $rootScope, timelineService, $templateCache, ultilService) {
           $scope.controllerName = 'RankingDreamController';

           $templateCache.remove('/Home/RankingDreams');
           // Update Timeline
           $scope.loadTimeLineBar = function () {
               $rootScope.isLoading = false;
               $rootScope.friends = [];
               var requestToServer = null;
               var requestCalculator = null;
               if ($rootScope.isFirstTime) {
                   timelineService.initTimeLineBar(requestToServer, requestCalculator);
               }
               $rootScope.isFirstTime = false;
           }
           var item = {
               action: 'tab',
               type: 'main',
           }
           $rootScope.SendingScreenSharingDataObject(item, 'tab', 'open', 'RankingDreams');
           $scope.loadTimeLineBar();
           $rootScope.spinner.on();
           $rootScope.tabType = 'Ranking_Dream';
           $rootScope.spinner.off();
           $scope.callfromOutsite = function () {
               UpdateRankingDream();
               setNotChecked();
               $rootScope.isNeedSendEventForListRanking = false;
               $rootScope.countRequest = 0;
           };
           $scope.callfromOutsiteForSharing = function (actionEvent, obj) {
               if (actionEvent == 'reorder') {
                   $scope.listRanking = obj;
                   $rootScope.scopeApply($scope);
                   setNotChecked();
               } else if (actionEvent == 'result') {
                   $scope.rankingResults = obj;
                   $rootScope.scopeApply($scope);
               }
           };
           var obj = {
               id: null,
               age: null,
               type: null,
               label: null,
               index: null,
           }

           InitRankingDream();
           setNotChecked();

           $scope.sortableOptions = {
               containment: '#sortable-container'
           };
           $rootScope.countRequest = -1;
           $scope.$watch('listRanking', function (models) {
               $rootScope.countRequest += 1;
               if (models[0].type != 'Retirement') {
                   for (var i = 1; i < models.length; i++) {
                       if (models[i].type == 'Retirement') {
                           var temp = models[i];
                           models[i] = models[0];
                           models[0] = temp;
                       }

                   }

               }
               for (var i = 1; i < models.length; i++) {
                   models[i].index = (i);
               }
               if ($rootScope.isNeedSendEventForListRanking == false) {
                   $rootScope.isNeedSendEventForListRanking = true;
               } else {
                   if ($rootScope.countRequest >= 2) {
                       $rootScope.SetEventActionTypeForShare('listRanking', 'showing');
                       $rootScope.countRequest = 0;
                   }
               }

               $rootScope.SendingScreenSharingDataObject(models, 'tab', 'reorder', 'RankingDreams');
               setNotChecked();
           }, true);

           function setNotChecked() {
               var rankingResults = [];
               for (var j = 0; j < $scope.listRanking.length; j++) {
                   rankingResults[rankingResults.length] = { label: "Not checked" };
               }
               $scope.rankingResults = rankingResults;
           }

           $scope.simulate = function () {
               if ($rootScope.functionAccess.SIMULATE_RANKING_DREAM == 0) {
                   $rootScope.functionAccess.showErrorMessage();
                   return;
               }
               var list = $scope.listRanking;
               for (var i = 0; i < list.length; i++) {
                   if (list[i].type == 'lifeevent') {
                       for (var t = 0; t < $rootScope.PersonaPlan.lifeEvent.length; t++) {
                           if ($rootScope.PersonaPlan.lifeEvent[t].id == list[i].id) {
                               $rootScope.PersonaPlan.lifeEvent[t].ranking_index = list[i].index;
                           }
                       }
                   }
                   else if (list[i].type == 'dream') {
                       for (var t = 0; t < $rootScope.PersonaPlan.dreams.length; t++) {
                           if ($rootScope.PersonaPlan.dreams[t].id == list[i].id) {
                               $rootScope.PersonaPlan.dreams[t].ranking_index = list[i].index;
                           }
                       }
                   }
               }
               var rankingResults = [];
               var label = "";
               $rootScope.SetEventActionTypeForShare('listrankingresult', 'showing');
               personaplanService.CalculateRanking($rootScope.PersonaPlan).then(
                       function (obj) {
                           if (obj.data.success == true) {
                               if (obj != null) {
                                   var isStill = "";
                                   for (var j = 0; j < obj.data.results.length; j++) {
                                       if (parseInt(obj.data.results[j]) <= parseInt($rootScope.PersonaPlan.death_age)) {                                          
                                           label = "Bankrupt in {{year}}";
                                           if (isStill == label) {                                              
                                               label = "Still bankrupt in {{year}}";
                                           }
                                           else {
                                               isStill = label;
                                           }
                                       }
                                       else {
                                           label = "Ok !";
                                           isStill = label;
                                       }

                                       rankingResults[rankingResults.length] = {
                                           label: label,
                                           year: obj.data.results[j]
                                       };
                                   }
                                   $scope.rankingResults = rankingResults;
                                   $rootScope.SendingScreenSharingDataObject(rankingResults, 'tab', 'result', 'RankingDreams');
                               }
                           }
                           else {
                               $rootScope.spinner.off();
                               ultilService.showErrorMessage(obj.data.errcode);
                           }
                       }
                   );
           }

           function InitRankingDream() {
               $scope.listRanking = GetListDream();
               $rootScope.spinner.off();
           }
           function GetListDream() {
               var dreams = [];
               var i, j = 0;
               obj = {
                   id: 0,
                   age: $rootScope.PersonaPlan.retirement_age,
                   year: $rootScope.PersonaPlan.retirement_age,
                   label: "Retirement in {{year}}",
                   type: 'Retirement',
                   name: "Retirement"
               };
               dreams[dreams.length] = obj;
               var listdream = $rootScope.PersonaPlan.dreams;
               for (i = 0; i < listdream.length; i++) {
                   obj = {
                       id: listdream[i].id,
                       age: listdream[i].purchase_age,
                       label: "{{name}} in {{year}}",
                       type: 'dream',
                       name: listdream[i].name,
                       year: listdream[i].purchase_age
                   };
                   dreams[dreams.length] = obj;
               }
               var listEvent = $rootScope.PersonaPlan.lifeEvent;
               for (i = 0; i < listEvent.length; i++) {
                   obj = {
                       id: listEvent[i].id,
                       age: listEvent[i].starting_age,
                       label: "{{name}} in {{year}}",
                       type: 'lifeevent',
                       name: listEvent[i].name,
                       year: listEvent[i].starting_age
                   };
                   dreams[dreams.length] = obj;
               }
               var length = dreams.length;
               var temp = null;
               for (i = 0; i < length ; i++) {
                   for (j = 0; j < length ; j++) {
                       if ((dreams[i].age != null && dreams[j].age != null) && (parseInt(dreams[i].age) < parseInt(dreams[j].age))) {
                           temp = dreams[i];
                           dreams[i] = dreams[j];
                           dreams[j] = temp;
                       }
                   }
               }
               for (i = 0; i < length ; i++) {
                   if (dreams[i].age == null) {
                       dreams[i].index = (i + 1);
                   }
               }
               return dreams;
           }

           function UpdateRankingDream() {
               var dreams = GetListDream();
               var listRanking = $scope.listRanking;
               if (dreams.length == listRanking.length) {
                   for (var i = 0; i < dreams.length; i++) {
                       for (var j = 0; j < listRanking.length; j++) {
                           if (dreams[i].id == listRanking[j].id && dreams[i].age != listRanking[j].age) {
                               listRanking[j].age = dreams[i].age;
                               listRanking[j].name = dreams[i].name;
                               listRanking[j].year = dreams[i].year;
                               listRanking[j].label = "{{name}} in {{year}}";
                           }
                       }
                   }
               } else listRanking = dreams;
               $scope.listRanking = listRanking;
               $scope.listRankingOld = $scope.listRanking;
               $rootScope.spinner.off();
           }
           $rootScope.currentScope = $scope;
       }
]);
function ReUpdateForControlById(controlId) {
    if (document.getElementById(controlId) != undefined)
        angular.element(document.getElementById(controlId)).scope().callfromOutsite();
}
function ReUpdateForControlByIdForSharing(controlId, actionEvent, obj) {
    if (document.getElementById(controlId) != undefined)
        angular.element(document.getElementById(controlId)).scope().callfromOutsiteForSharing(actionEvent, obj);
}
