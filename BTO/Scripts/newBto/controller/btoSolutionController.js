 btoApp.controller('SolutionController', [
       '$scope', 'personalPlanService', '$timeout', '$rootScope',  '$templateCache', 'utilService','CONFIG',
       function ($scope, personalPlanService, $timeout, $rootScope,  $templateCache, utilService,CONFIG) {
           $rootScope.solutionScope = $scope;
           $templateCache.remove('/Home/ManageSolution');
           $rootScope.spinner.on();
           $scope.rowCollection = [];
           $rootScope.renamedialog = {};
           $scope.displayedCollection = [].concat($scope.rowCollection);
           $scope.itemsByPage = 10;
           $scope.predicates = ["", utilService.translate("Automatic"), utilService.translate("Manual")];
           $timeout(function () {
               $scope.predicates = ["", utilService.translate("Automatic"), utilService.translate("Manual")];
              // $rootScope.apply();
           }, 4000);
           $scope.selectedPredicate = $scope.predicates[0];
           //$scope.lastTimeRequestUpdate = Date.now();
           //$scope.timeDelay = 1000 * 60 * 10;
           $scope.timeSetInterval = 1000 * 60;

           $scope.LoadSolutionCallBack = function (obj) {
               if (obj.success == true) { 
                       utilService.LoadByUser(obj.results); 
                       $rootScope.spinner.off();
                       utilService.showSuccessMessage(utilService.translate("Backup has been loaded!"));
               }
               else {
                   utilService.showErrorMessage(obj.errcode);
                   $rootScope.spinner.off();
               }
           }
           $scope.LoadUnitOfWorkBack = function () {
               var obj = GetListSelected();
               if (obj != null && obj != undefined && obj.length == 1) {
                   $rootScope.spinner.on();
                   obj = obj[0].id;
                  $rootScope.SendingScreenSharingDataObject('', 'tab', 'loadsolution_success', 'Solution');
                   personalPlanService.LoadSolution(obj, $scope.LoadSolutionCallBack);
               }
           }
           $scope.LoadUnitOfWork = function (data) {
               var obj = GetListSelected();
               if ($rootScope.playBackPlayerData.isPlaying && angular.isDefined(data)) {
                   var id = data.id;
                   for (var i = 0; i < $scope.rowCollection.length; i++) {
                       if (id == $scope.rowCollection[i].id) {
                           obj = [$scope.rowCollection[i]];
                           break;
                       }
                   }
               }

               if (obj != null && obj != undefined && obj.length == 1) {
                   var content = utilService.translate("Name : {{name}}  Version: {{version}}", { name: obj[0].name, version: obj[0].version });
                  
                   utilService.ShowDialog($rootScope, utilService.translate("Load backup"), content + '<br/>'+utilService.translate("Do you want to load this backup?"), utilService.translate("Yes"), $scope.LoadUnitOfWorkBack, utilService.translate("No"));

                 $rootScope.SendingScreenSharingDataObject(content, 'tab', 'loadsolution_open', 'Solution');
               } else {                  
                   utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one backup!"), utilService.translate("Ok"), $scope.CloseConfirmOKDialog);
                 $rootScope.SendingScreenSharingDataObject('', 'tab', 'loadsolution_error', 'Solution');
               }
           }
         //  setInterval(SaveUnitOfWorkAuto, $scope.timeSetInterval);

           $scope.CloseConfirmOKDialog = function () {
               $rootScope.SendingScreenSharingDataObject('', 'tab', 'loadsolution_close', 'Solution');
           }
           $scope.callfromOutsite = function () {
               $('#manageSolution').modal({ backdrop: 'static', keyboard: false });
               $rootScope.SendingScreenSharingDataObject('', 'tab', 'showdialog', 'Solution');
               $scope.GetSolution();
           };
           $scope.GetAllSolutionCallBack = function (obj) {
               if (obj != null) {
                   if (obj.length == 0) {
                       $('.isDisablebtn').attr('disabled', 'disabled');
                   } else {
                       $('.isDisablebtn').removeAttr('disabled');
                   }
                   $scope.rowCollection = obj;
                   $timeout(function () {
                       $rootScope.spinner.off();
                    $rootScope.SendingScreenSharingDataObject($scope.rowCollection, 'tab', 'open', 'Solution');
                   }, 500);
               }
           }
           $scope.GetSolution = function () {
               if ($rootScope.playBackPlayerData.isPlaying) {
                   $scope.rowCollection = $rootScope.playBackPlayerData.data;
                   $rootScope.spinner.off();
               } else {
                   personalPlanService.GetAllSolution($rootScope.PersonaPlan.user_id, $scope.GetAllSolutionCallBack);
               }
           }
           $scope.UpdateNameSolutionCallBack = function (obj) {
               var item = GetListSelected()[0];
               if (obj.success == true) {
                   if (obj != null) {
                       for (var i = ($scope.rowCollection.length - 1) ; i >= 0; i--) {
                           if (($scope.rowCollection[i].isSelected != undefined) && $scope.rowCollection[i].isSelected == true) {
                               $scope.rowCollection[i].name = item.name;
                               $scope.rowCollection[i].isSelected = false;
                               $scope.rename = '';
                               utilService.showSuccessMessage(utilService.translate("Renamed!"));
                               var itemdata = {
                                   name: item.name,
                                   i: i,
                               };
                          $rootScope.SendingScreenSharingDataObject(itemdata, 'tab', 'remember_success', 'Solution');
                           }
                       }
                   }
               }
               else {
                   utilService.showErrorMessage(obj.errcode);
               }
           }
           $scope.RenameUnitWorkCallBack = function () {
               var item = GetListSelected()[0];
               item.name = $('#input_rename_unit_work').val();
               personalPlanService.UpdateNameSolution(item, $scope.UpdateNameSolutionCallBack);
             //$rootScope.scopeApply($scope);
               utilService.scopeApply();
           }
           $scope.RenameUnitWork = function (data) {
               var listDelete = GetListSelected();
               
               if ($rootScope.playBackPlayerData.isPlaying && angular.isDefined(data)) {
                   var id = data.id;
                   for (var i = 0; i < $scope.rowCollection.length; i++) {
                       // console.log(id, $scope.rowCollection[i].id);
                       if (id == $scope.rowCollection[i].id) {
                           listDelete = [$scope.rowCollection[i]];
                           if ($rootScope.playBackPlayerData.isBackward) {
                               listDelete[0].name = data.oldName;
                           } else {
                               data.oldName = angular.copy($scope.rowCollection[i].name);
                               listDelete[0].name = $scope.rowCollection[i].name;
                               $scope.rowCollection[i].name = data.name;
                           }
                           //$rootScope.scopeApply($scope);
                           utilService.scopeApply();
                           break;
                       }
                   }
               }
               if (listDelete.length == 1) {
                   $scope.rename = listDelete[0].name;
                   $('#input_rename_unit_work').val($scope.rename);
                   $timeout(function () {
                     //  $scope.dialog_form.$setPristine();
                       utilService.ShowDialogRename($rootScope, utilService.translate("Rename Backup"),
                           utilService.translate("Please enter new name:"),
                           $scope.RenameUnitWorkCallBack);
                     $rootScope.SendingScreenSharingDataObject($scope.rename, 'tab', 'remember_open', 'Solution');
                   }, 1);

                   $timeout(function () {
                       var focusEle = angular.element(document.querySelector('#input_rename_unit_work'));
                       focusEle.focus();
                   }, 800);

               }
               else {               
                   utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one backup!"), utilService.translate("Ok"), $scope.CloseConfirmOKDialog);
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'remember_error', 'Solution');
               }
           }
           $scope.DeleteSolutionCallBack = function (obj) {
               if (obj.success == true) {
                   if (obj != null && obj.results == true) {
                       //$scope.GetSolution();                              
                   }
                   else {
                       $scope.GetSolution();//we need to load solution again when delete not success
                   }
                   $rootScope.spinner.off();
                   utilService.showSuccessMessage(utilService.translate("Successfully deleted!"));
                $rootScope.SendingScreenSharingDataObject($scope.rowCollection, 'tab', 'remove_success', 'Solution');
               }
               else {
                   utilService.showErrorMessage(obj.errcode);
                   $rootScope.spinner.off();
               }
           }
           $scope.RemoveUnitAt = function () {
               var listDelete = [];
               for (var i = ($scope.rowCollection.length - 1) ; i >= 0; i--) {
                   if (($scope.rowCollection[i].isSelected != undefined) && $scope.rowCollection[i].isSelected == true) {
                       listDelete[listDelete.length] = $scope.rowCollection[i].id;
                       $scope.rowCollection.splice(i, 1);
                   }
               }
               utilService.scopeApply();
               $rootScope.spinner.on();
               personalPlanService.DeleteSolution(listDelete, $scope.DeleteSolutionCallBack);              
           }
           $scope.RemoveUnitWork = function (data) {               
               var listDelete = GetListSelected();

               if ($rootScope.playBackPlayerData.isPlaying && angular.isDefined(data)) {
                   var id = data.id;
                   for (var i = 0; i < $scope.rowCollection.length; i++) {
                       if (id == $scope.rowCollection[i].id) {
                           data.oldName = angular.copy($scope.rowCollection[i].name);
                           listDelete = [$scope.rowCollection[i]];
                           $scope.rowCollection.splice(i, 1);
                           utilService.scopeApply();
                           //$rootScope.scopeApply($scope);
                           break;
                       }
                   }
               }
               //console.log(listDelete, data);
               if (listDelete.length > 0) {
                   var content = "";
                   for (var i = 0; i < listDelete.length; i++) {
                       content += "" + listDelete[i].name + "\n";
                   }
                 
                   utilService.ShowDialog($rootScope, utilService.translate("Delete"), content + '<br/>' + utilService.translate("Do you want to delete this backup?"), utilService.translate("Yes"), $scope.RemoveUnitAt, utilService.translate("No"));

                   $timeout(function () {
                    $rootScope.SendingScreenSharingDataObject(content, 'tab', 'remove', 'Solution');
                   }, 10);
               } else {                 
                   utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one backup!"), utilService.translate("Ok"), $scope.CloseConfirmOKDialog);
                   $timeout(function () {
                    $rootScope.SendingScreenSharingDataObject('', 'tab', 'remove_error', 'Solution');
                   }, 10);
               }

           };
           function SaveUnitOfWorkAuto() {
               //var date = Date.now();
               //if (date >= ($scope.lastTimeRequestUpdate + $scope.timeDelay)){
               if ($rootScope.isBeginShared != true) {
                   $scope.SaveAutomatic();
               }
               //}
           }
           $scope.SaveCurrentSolutionCallBack = function (obj) {
               if (obj.success == true) {
                   if (obj != null && obj.results != undefined) {
                       //$scope.GetSolution();
                       if (obj.results.length == 0) {
                           $('.isDisablebtn').attr('disabled', 'disabled');
                       } else {
                           $('.isDisablebtn').removeAttr('disabled');
                       }
                       $scope.rowCollection = obj.results;
                       utilService.showSuccessMessage(utilService.translate("Saved!"));
                       var item = {
                           rowCollection: $scope.rowCollection,
                           name: $('#input_rename_unit_work').val()
                       };
                       $timeout(function () {
                           $rootScope.spinner.off();
                        $rootScope.SendingScreenSharingDataObject(item, 'tab', 'save_success', 'Solution');
                       }, 1000);

                   }
               }
               else {
                   utilService.showErrorMessage(obj.errcode);
                   $rootScope.spinner.off();
               }
           }
           $scope.SaveUnitOfWorkCallBack = function () {
               $rootScope.spinner.on(); 
               var Solution = {
                   user_id: $rootScope.PersonaPlan.user_id,
                   name: $('#input_rename_unit_work').val()
               };
               personalPlanService.SaveCurrentSolution(Solution, $scope.SaveCurrentSolutionCallBack);
           }
           $scope.SaveAutomatic = function () {
               var Solution = {
                   user_id: $rootScope.PersonaPlan.user_id,

               }; 
               personalPlanService.SaveAutomatic(Solution, function (obj) {
                   if (obj != null && obj.user_id != undefined) {
                   }
                   else {
                       // utilService.showErrorMessage(obj.data); 
                   }
               });
           }
           $scope.SaveUnitOfWork = function (data) {
               //var solution = $scope.rowCollection[0];
               $scope.rename = '';
               if ($rootScope.playBackPlayerData.isPlaying && angular.isDefined(data)) {
                   $scope.rename = data.name;
                   if ($rootScope.playBackPlayerData.isBackward) {
                       $scope.rename = data.oldName;
                   }
               }               
               utilService.scopeApply();
               utilService.ShowDialogRename($rootScope, utilService.translate("Save Backup"), utilService.translate("Please enter name for backup:"), $scope.SaveUnitOfWorkCallBack);
               $rootScope.SendingScreenSharingDataObject('', 'tab', 'save_open', 'Solution');
               $timeout(function () {
                   var focusEle = angular.element(document.querySelector('#input_rename_unit_work'));
                   focusEle.focus();
               }, 500);
           }
           $scope.CloseSolution = function () {
               personalPlanService.CloseSolution(
                  function (obj) {                     
                  }
               );
               $timeout(function () {
               $rootScope.SendingScreenSharingDataObject('', 'tab', 'close', 'Solution');
               }, 100);
           }
           function GetListSelected() {               
               var Selected = [];
               for (var i = 0; i < $scope.rowCollection.length; i++) {
                   if (($scope.rowCollection[i].isSelected != undefined) && $scope.rowCollection[i].isSelected == true) {
                       Selected[Selected.length] = $scope.rowCollection[i];
                   }
               }
               return Selected;
           }
           $scope.triggerHandler = function () {
               console.log('clickSelectBox');
               $('#searchType').triggerHandler($.Event('input'));
           }

           $scope.callfromOutsiteForSharing = function (actionEvent, obj) {
               switch (actionEvent) {
                   case 'showdialog':
                       $timeout(function () {
                           $('#manageSolution').modal({ backdrop: 'static', keyboard: false });
                       }, 10);
                       break;
                   case 'open': 
                       $timeout(function () {
                           $scope.rowCollection = obj;
                           utilService.scopeApply($scope);
                           $timeout(function () {
                               $rootScope.spinner.off();
                           }, 100);
                       }, 10);
                       break;
                   case 'save_open':
                       $rootScope.spinner.on();
                       $timeout(function () {
                           utilService.ShowDialogRename($rootScope, utilService.translate("Save Backup"), utilService.translate("Please enter name for backup:"), '');
                           $rootScope.spinner.off();
                       }, 100);

                       break;
                   case 'save_success':
                       $rootScope.spinner.on();
                       $timeout(function () {
                           $('#input_rename_unit_work').val(obj.name);
                       }, 10);

                       $timeout(function () {
                           $('#CancelRename').click();
                           $scope.rowCollection = obj.rowCollection;
                           $rootScope.spinner.off();
                           utilService.showSuccessMessage(utilService.translate("Saved!"));
                       }, 1000);
                       break;
                   case 'close':
                       $timeout(function () {
                           $('#manageSolution').modal('hide');
                       }, 10);
                       break;
                   case 'close_sub_dialog':
                       $timeout(function () {
                           $('#CancelRename').click();
                           $rootScope.spinner.off();
                       }, 100);
                       break;
                   case 'remove_error':
                       $timeout(function () {                          
                           utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one backup!"), utilService.translate("Ok"));
                       }, 100);
                       break;
                   case 'remove': 
                       $timeout(function () {
                           utilService.ShowDialog($rootScope,
                           utilService.translate("Delete"),
                           obj + '<br/>' + utilService.translate("Do you want to delete this backup?"),
                           utilService.translate("Yes"), function () { }, utilService.translate("No"));
                       }, 100);
                       break;
                   case 'remove_success':
                       $timeout(function () {
                           $('#CancelConfirm').click();
                           utilService.showSuccessMessage(utilService.translate("Successfully deleted!"));
                       }, 10);
                       $timeout(function () {
                           $scope.rowCollection = obj;
                          // $rootScope.scopeApply($scope);
                           utilService.scopeApply();
                           $rootScope.spinner.off();
                       }, 1000);
                       break;
                   case 'remember_open':
                       $timeout(function () {
                           $('#input_rename_unit_work').val(obj);
                           utilService.ShowDialogRename($rootScope, utilService.translate("Rename Backup"),
                          utilService.translate("Please enter new name:"),
                           function () { });
                           $rootScope.spinner.off();
                       }, 100);
                       break;
                   case 'remember_error':
                       $timeout(function () {                         
                           utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one backup!"), utilService.translate("Ok"));
                       }, 100);
                       break;
                   case 'remember_success':
                       $timeout(function () {
                           $('#input_rename_unit_work').val(obj.name);
                           $scope.rowCollection[obj.i].isSelected = true;
                       }, 1);
                       $timeout(function () {
                           $('#CancelRename').click();
                           $scope.rowCollection[obj.i].name = obj.name;
                           $scope.rowCollection[obj.i].isSelected = false;
                           utilService.showSuccessMessage(utilService.translate("Renamed!"));
                       }, 1000);

                       break;
                   case 'loadsolution_open':
                       $timeout(function () {                         
                           utilService.ShowDialog($rootScope, utilService.translate("Load backup"), obj + '<br/>' + utilService.translate("Do you want to load this backup?"), utilService.translate("Yes"), function () { }, utilService.translate("No"));

                       }, 100);

                       break;
                   case 'loadsolution_error':
                       $timeout(function () {
                           utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one backup!"), utilService.translate("Ok"));

                       }, 100);
                       break;
                   case 'loadsolution_close':
                       $timeout(function () {
                           $('#OkConfirm').click();
                       }, 100);
                       break;
                   case 'loadsolution_success':
                       $timeout(function () {
                           $('#CancelConfirm').click();
                       }, 100);
                       break;
                   case 'loadsolution_reload':
                       $rootScope.spinner.on();
                       $timeout(function () {
                           $rootScope.currentPlan = obj.currentplan;
                           $rootScope.newPlan = obj.newplan;
                           $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
                           personalPlanService.updateConvertDataOfPersonalPlan();
                           //$rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                           //$rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                           $rootScope.MainResult = obj.result;
                           $rootScope.ReloadShareScreen();
                           utilService.showSuccessMessage(utilService.translate("Backup has been loaded!"));
                           $rootScope.spinner.off();
                       }, 100);
                       break;
               }
           };

           $scope.HideRenameDialog = function () {
               $('#renamedialog').modal('hide');
           }

           $scope.HideDialog = function () {
               $('#confirmdialog').modal('hide');
           }

       }]
 );