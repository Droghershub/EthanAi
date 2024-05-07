btoApp.controller('ScenarioController', [
       '$scope', 'personalPlanService', '$timeout', '$rootScope',  '$templateCache', 'utilService','CONFIG',
       function ($scope, personalPlanService, $timeout, $rootScope, $templateCache, utilService,CONFIG) {
           $rootScope.scenarioScope = $scope;
           
           $templateCache.remove('/Home/ManageScenarios');
           $scope.listScenario = [];
           $rootScope.spinner.on();
           $rootScope.renamedialog = {};
           $scope.displayedScenarios = [].concat($scope.listScenario);
           $scope.itemsByPage = 10; 
           $scope.makeCurrentPlayback = function (data) {
               var index = -1, currentIndex = -1;
               for (var i = 0; i < $scope.listScenario.length; i++) {
                   if ($scope.listScenario[i].status == 0) {
                       currentIndex = i;
                       $scope.listScenario[i].status = null;
                       $scope.listScenario[i].statusDisplay = "";
                   }
                   if (data.id == $scope.listScenario[i].id) {
                       index = i;
                       $scope.listScenario[i].status = 0;
                       $scope.listScenario[i].statusDisplay = "Current";
                   }
               }

               $scope.swapListScenario(index, currentIndex);
               $scope.listScenario = angular.copy($scope.listScenario);
               $scope.displayedScenarios = [].concat($scope.listScenario);
           }

           $scope.makeNewPlayback = function (data) {
               var index = -1, currentIndex = -1;
               for (var i = 0; i < $scope.listScenario.length; i++) {
                   if ($scope.listScenario[i].status == 1) {
                       currentIndex = i;
                       $scope.listScenario[i].status = null;
                       $scope.listScenario[i].statusDisplay = "";
                   }
                   if (data.id == $scope.listScenario[i].id) {
                       index = i;
                       $scope.listScenario[i].status = 1;
                       $scope.listScenario[i].statusDisplay = "New";
                   }
               }

               $scope.swapListScenario(index, currentIndex);
               $scope.listScenario = angular.copy($scope.listScenario);
               $scope.displayedScenarios = [].concat($scope.listScenario);
           }

           $scope.swapListScenario = function (x, y) {
               var temp = $scope.listScenario[x];
               $scope.listScenario[x] = $scope.listScenario[y];
               $scope.listScenario[y] = temp;
           }
           $scope.Delele = function () {
           }
           $scope.callBackReciveData = function(obj)
           {              
               if (obj != null) {
                   $scope.listScenario = obj;
                   $timeout(function () {
                       $rootScope.spinner.off();                   
                       $rootScope.SendingScreenSharingDataObject($scope.listScenario, 'tab', 'open', 'Scenario');
                   }, 100);
               }
           }
           $scope.GetScenario = function () {              
               if ($rootScope.playBackPlayerData.isPlaying) {
                   $scope.listScenario = $rootScope.playBackPlayerData.data;
                   $rootScope.spinner.off();
               } else {
                   $rootScope.spinner.on();
                   personalPlanService.GetScenario($rootScope.PersonaPlan.user_id, $scope.callBackReciveData);
               }
           };

           $scope.callfromOutsite = function () {              
               $rootScope.SendingScreenSharingDataObject('', 'tab', 'showdialog', 'Scenario');
               $scope.GetScenario();
           };
           $scope.callfromOutsiteForSharing = function (actionEvent, obj) {
               switch (actionEvent) {
                   case 'showdialog':
                       $timeout(function () {
                           $rootScope.spinner.on();
                           $('#manageScenario').modal({ backdrop: 'static', keyboard: false });
                       }, 10);
                       break;
                   case 'open':
                       $rootScope.spinner.on();
                       $timeout(function () {
                           $('#manageScenario').modal({ backdrop: 'static', keyboard: false });
                           $scope.listScenario = obj;
                           utilService.scopeApply($scope);
                           $timeout(function () {
                               $rootScope.spinner.off();
                           }, 100);
                       }, 200);
                       break;
                   case 'Rename_success':
                   case 'NewScenario_success':
                   case 'Delete_success':
                   case 'Duplicate':
                       $rootScope.spinner.on();
                       $timeout(function () {
                           $rootScope.spinner.off();
                           switch (actionEvent) {
                               case 'NewScenario_success':
                               case 'Rename_success':
                                   $scope.name = obj.name;
                                   $('#input_rename_unit_work').val(obj.name);
                                   break;
                           }

                       }, 10);
                       $timeout(function () {
                           $scope.listScenario = obj.listScenario;
                           utilService.scopeApply($scope);
                           $rootScope.spinner.off();
                           $('#CancelRename').click();
                           $('#CancelConfirm').click();

                           switch (actionEvent) {
                               case 'Rename_success':
                                   utilService.showSuccessMessage(utilService.translate("Renamed your scenario {{name}} successful!", { name: obj.name }));
                                   break;
                               case 'NewScenario_success':
                                   utilService.showSuccessMessage(utilService.translate("Your scenario:  {{name}} was successfully created!", { name: obj.name }));
                                   break;
                               case 'Delete_success':
                                   utilService.showSuccessMessage(utilService.translate("Deleted {{length}} row(s) successful!", { length: obj.length }));
                                   break;
                               case 'Duplicate':
                                   utilService.showSuccessMessage(utilService.translate("Duplicated {{length}} row(s) successful!", { length: obj.length }));
                                   break;
                           }

                       }, 1000);
                       break;
                   case 'MakeNew':
                       $rootScope.spinner.on();
                       $timeout(function () {
                           $rootScope.currentPlan = obj.currentPlan;
                           $rootScope.newPlan = obj.newPlan;
                           $scope.listScenario = obj.listScenario;
                           utilService.scopeApply($scope); 
                           utilService.showSuccessMessage(utilService.translate("Your scenario: {{name}} was marked as new scenario!", { name: obj.listSelected[0].name }));
                           $rootScope.spinner.off();
                       }, 100);

                       break;
                   case 'MakeCurrent':
                       $rootScope.spinner.on();
                       $timeout(function () {
                           $rootScope.currentPlan = obj.currentPlan;
                           $rootScope.newPlan = obj.newPlan;
                           $scope.listScenario = obj.listScenario;
                           utilService.scopeApply($scope); 
                           utilService.showSuccessMessage(utilService.translate("Your scenario: {{name}} was marked as current scenario!", { name: obj.listSelected[0].name }));
                           $rootScope.spinner.off();
                       }, 100);
                       break;
                   case 'close':
                       $timeout(function () {
                           $('#manageScenario').modal('hide');
                           $rootScope.ReloadScenarios(true);

                       }, 10);

                       break;
                   case 'NewScenario':
                       $timeout(function () {
                           $scope.name = "";
                           utilService.scopeApply($scope);
                           $('#input_rename_unit_work').val($scope.name);
                           //utilService.ShowDialog($rootScope, utilService.translate("Save new scenario"), '', '', '', $('#renameScenario').html());
                           utilService.ShowDialogRename($rootScope, utilService.translate("Save new scenario"), utilService.translate("Please enter name:"));
                       }, 100);
                       break;
                   case 'Rename_Open':
                       $timeout(function () {
                           $scope.name = obj;
                           utilService.scopeApply($scope);
                           $('#input_rename_unit_work').val($scope.name);
                           utilService.ShowDialogRename($rootScope, utilService.translate("Rename"), utilService.translate("Please enter new name:"), '');
                       }, 10);
                       break;
                   case 'CancelConfirm':
                       $timeout(function () {
                           $('#CancelRename').click();
                           $('#CancelConfirm').click();
                       }, 100);
                       break;
                   case 'Rename_Eror':
                       $timeout(function () {
                           utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one scenario only!"), utilService.translate("Ok"), $scope.OkCallBack);
                       }, 100);
                       break;
                   case 'Okbtndialog':
                       $timeout(function () {
                           $('#Okbtndialog').click();
                       }, 100);
                       break;
                   case 'Delete_error_current_new':
                       $timeout(function () {                           
                           utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Can’t delete current and new scenarios!"), utilService.translate("Ok"));
                       }, 100);
                       break;
                   case 'Delete_error':
                       $timeout(function () {                          
                           utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select at least one scenario!"), utilService.translate("Ok"));
                       }, 100);
                       break;
                   case 'Duplicate_error':
                       $timeout(function () {                          
                           utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select at least one scenario!"), utilService.translate("Ok"));
                       }, 100);
                       break;
                   case 'Delete':
                       $timeout(function () {
                           utilService.ShowDialog($rootScope, utilService.translate("Confirm"), utilService.translate("Do you want to delete {{length}} row(s)", { length: obj }), utilService.translate("Yes"), function () { }, utilService.translate("No"));
                          // utilService.ShowDialog($rootScope, utilService.translate("Confirm"), utilService.translate("Do you want to delete {{length}} row(s)", { length: listSelected.length }), utilService.translate("Yes"), $scope.DeleteScenariosCallback, utilService.translate("No"));
                       }, 100);
                       break;
                   case 'MakeCurrent_error':
                       $timeout(function () {                          
                           utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one scenario only!"), utilService.translate("Ok"));
                       }, 100);
                       break;
                   case 'MakeNew_error':
                       $timeout(function () {                           
                           utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one scenario only!"), utilService.translate("Ok"));
                       }, 100);

                       break;
                   case 'dialog_close'  :
                       $timeout(function () {
                           $('#OkConfirm').click();
                       }, 100);
                       break;
               }
           };
           $scope.RenameScenario = function (data) {
               var listSelected = GetListScenarioSelected();
               if (angular.isDefined(data)) {
                   // Find object to rename
                   for (var i = 0; i < $scope.listScenario.length; i++) {
                       if (data.id == $scope.listScenario[i].id) {
                           listSelected = [$scope.listScenario[i]];
                           if ($rootScope.playBackPlayerData.isBackward) {
                               listSelected[0].name = data.oldName;
                           } else {
                               data.oldName = angular.copy($scope.listScenario[i].name);
                               listSelected[0].name = data.name;
                           }
                           $rootScope.rename = listSelected[0].name;
                           break;
                       }
                   }
               }
               if (listSelected.length == 1) {
                   $scope.name = listSelected[0].name;
                   $('#input_rename_unit_work').val(listSelected[0].name)
                   $timeout(function () {
                       utilService.ShowDialogRename($rootScope, utilService.translate("Rename"),
                            utilService.translate("Please enter new name:"),
                            $scope.RenameScenarioCallBack);
                       //utilService.ShowDialog($rootScope, utilService.translate("Rename"), '', '', $scope.RenameScenarioCallBack, $('#renameScenario').html());
                       $rootScope.SendingScreenSharingDataObject(listSelected[0].name, 'tab', 'Rename_Open', 'Scenario');
                   }, 200);
                   $timeout(function () {
                       var focusEle = angular.element(document.querySelector('#input_rename_unit_work'));
                       focusEle.focus();
                   }, 800);
               }
               else {                  
                   utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one scenario only!"), utilService.translate("Ok"), $scope.OkCallBack);
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'Rename_Eror', 'Scenario');
               }
           };
           $scope.OkCallBack = function () {
               $rootScope.SendingScreenSharingDataObject('', 'tab', 'dialog_close', 'Scenario');
           }
           $scope.RenameCallBack = function (obj) {
               var item = GetListScenarioSelected()[0];
               if (obj.success == true) {
                   if (obj != null) {
                       $scope.listScenario = obj.results;
                       $timeout(function () {
                           $rootScope.spinner.off();
                       }, 100);
                       utilService.showSuccessMessage(utilService.translate("Renamed your scenario {{name}} successful!", { name: item.name }));
                       var itemdata = {
                           listScenario: $scope.listScenario,
                           name: item.name,
                       };
                       $rootScope.SendingScreenSharingDataObject(itemdata, 'tab', 'Rename_success', 'Scenario');
                   }
               }
               else {
                   $rootScope.spinner.off();
                   utilService.showErrorMessage(obj.errcode);
               }
           }
           $scope.RenameScenarioCallBack = function () {
               var item = GetListScenarioSelected()[0];
               item.name = $('#input_rename_unit_work').val();
               $rootScope.spinner.on();
               personalPlanService.UpdateScenario(item, $scope.RenameCallBack);
           };
           $scope.UpdateStatusScenario = function (obj) {
               var listSelected = GetListScenarioSelected();
               if (obj.success == true) {
                   if (obj != null) {
                       $rootScope.currentPlan = obj.results.currentplan;
                       $rootScope.newPlan = obj.results.newplan;
                       $scope.listScenario = obj.results.listScenario;
                       $timeout(function () {
                           $rootScope.spinner.off();
                       }, 100);
                       utilService.showSuccessMessage(utilService.translate("Your scenario: {{name}} was marked as current scenario!", { name: listSelected[0].name }));
                       $timeout(function () {
                           var item = {
                               listSelected: listSelected,
                               currentPlan: $rootScope.currentPlan,
                               newPlan: $rootScope.newPlan,
                               listScenario: $scope.listScenario
                           };
                           $rootScope.SendingScreenSharingDataObject(item, 'tab', 'MakeCurrent', 'Scenario');

                       }, 10);
                   }
               }
               else {
                   $rootScope.spinner.off();
                   utilService.showErrorMessage(obj.errcode);
               }
           }
           $scope.MakeCurrentScenario = function (data) {
               var listSelected = GetListScenarioSelected();
               if (angular.isDefined(data)) {
                   // Find object to rename
                   for (var i = 0; i < $scope.listScenario.length; i++) {
                       if (data.id == $scope.listScenario[i].id) {
                           listSelected = [$scope.listScenario[i]];
                       } else {
                           if ($scope.listScenario[i].status == 1) {
                               $scope.listScenario[i].status = 0;
                               $scope.listScenario[i].statusDisplay = "";
                           }
                       }
                   }
               }
               if (listSelected.length == 1) {
                   if (listSelected[0].status != 0) {
                       listSelected[0].status = 0;
                       $rootScope.spinner.on();
                       personalPlanService.UpdateStatusScenario(listSelected[0], $scope.UpdateStatusScenario);
                   }
               }
               else {                   
                   utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one scenario only!"), utilService.translate("Ok"), $scope.OkCallBack);
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'MakeCurrent_error', 'Scenario');
               }
           };

           $scope.MakeNewScenarioCallBack = function (obj) {
               var listSelected = GetListScenarioSelected();
               if (obj.success == true) {
                   if (obj != null) {
                       $rootScope.currentPlan = obj.results.currentplan;
                       $rootScope.newPlan = obj.results.newplan;
                       $scope.listScenario = obj.results.listScenario;
                       $timeout(function () {
                           $rootScope.spinner.off();
                       }, 10);
                       utilService.showSuccessMessage(utilService.translate("Your scenario: {{name}} was marked as new scenario!", { name: listSelected[0].name }));
                       $timeout(function () {
                           var item = {
                               currentPlan: $rootScope.currentPlan,
                               newPlan: $rootScope.newPlan,
                               listScenario: $scope.listScenario,
                               listSelected: listSelected,
                           };
                           $rootScope.SendingScreenSharingDataObject(item, 'tab', 'MakeNew', 'Scenario');
                       }, 100);
                   }
               }
               else {
                   $rootScope.spinner.off();
                   utilService.showErrorMessage(obj.errcode);
               }
           }

           $scope.MakeNewScenario = function () {
               var listSelected = GetListScenarioSelected();
               if (listSelected.length == 1) {
                   if (listSelected[0].status != 1) {
                       listSelected[0].status = 1;
                       $rootScope.spinner.on();
                       personalPlanService.UpdateStatusScenario(listSelected[0], $scope.MakeNewScenarioCallBack);
                   }
               }
               else {                  
                   utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select one scenario only!"), utilService.translate("Ok"), $scope.OkCallBack);
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'MakeNew_error', 'Scenario');
               }
           };
           $scope.NewScenario = function (data) {
               $rootScope.rename = "";
               if ($rootScope.playBackPlayerData.isPlaying && angular.isDefined(data)) {
                   $scope.name = angular.copy(data.name);
                   $rootScope.rename = data.name;
                   $('#input_rename_unit_work').val(data.name);
               }
               else {
                   $rootScope.rename = "";
                   $('#input_rename_unit_work').val("");
               }
               $timeout(function () {
                   utilService.ShowDialogRename($rootScope, utilService.translate("Save new scenario"),
                           utilService.translate("Please enter name:"),
                           $scope.NewScenarioCallBack);
                   //utilService.ShowDialog($rootScope, utilService.translate("Save new scenario"), '', '', $scope.NewScenarioCallBack, $('#renameScenario').html());
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'NewScenario', 'Scenario');
               }, 1);
               $timeout(function () {
                   var focusEle = angular.element(document.querySelector('#input_rename_unit_work'));
                   focusEle.focus();
               }, 800);
           };
           $scope.CreateNewScenarioCallBack = function (obj) {
               if (obj.success == true) {
                   if (obj != null) {
                       $scope.listScenario = obj.results;
                       $timeout(function () {
                           $rootScope.spinner.off();
                       }, 100);
                       utilService.showSuccessMessage(utilService.translate("Your scenario:  {{name}} was successfully created!", { name: name }));
                       $timeout(function () {
                           var item = {
                               listScenario: $scope.listScenario,
                               name: name,
                           }

                           $rootScope.SendingScreenSharingDataObject(item, 'tab', 'NewScenario_success', 'Scenario');
                       }, 10);
                   }
               }
               else {
                   $rootScope.spinner.off();
                   utilService.showErrorMessage(obj.errcode);
               }
           }
           $scope.NewScenarioCallBack = function () {
               var name = $('#input_rename_unit_work').val();
               var object = { id: $rootScope.PersonaPlan.id, name: name, user_id: $rootScope.PersonaPlan.user_id };
               $rootScope.spinner.on();
               personalPlanService.CreateNewScenario(object, $scope.CreateNewScenarioCallBack);
           };
           $scope.DuplicateScenariosCallBack = function (obj) {
               var listSelected = GetListScenarioSelected();
               if (obj.success == true) {
                   if (obj != null) {
                       $scope.listScenario = obj.results;
                       $timeout(function () {
                           $rootScope.spinner.off();
                       }, 100);
                       utilService.showSuccessMessage(utilService.translate("Duplicated {{length}} row(s) successful!", { length: listSelected.length }));
                       $timeout(function () {
                           var item = {
                               listScenario: $scope.listScenario,
                               length: listSelected.length,
                           };
                           $rootScope.SendingScreenSharingDataObject(item, 'tab', 'Duplicate', 'Scenario');
                       }, 10);
                   }
               }
               else {
                   $rootScope.spinner.off();
                   utilService.showErrorMessage(obj.errcode);
               }
           }
           $scope.DuplicateScenarios = function () {
               var listSelected = GetListScenarioSelected();
               if (listSelected.length > 0) {
                   $rootScope.spinner.on();
                   personalPlanService.DuplicateScenarios(listSelected, $scope.DuplicateScenariosCallBack);
               }
               else {                   
                   utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select at least one scenario!"), utilService.translate("Ok"), $scope.OkCallBack);
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'Duplicate_error', 'Scenario');
               }
           };
           $scope.DeleteScenarios = function () {
               var listSelected = GetListScenarioSelected();
               if (listSelected.length > 0) {
                   var canDelete = true;
                   for (var i = 0; i < listSelected.length; i++) {
                       if (listSelected[i].status == 0 || listSelected[i].status == 1) {
                           canDelete = false;
                           break;
                       } 
                   }
                   if (canDelete) {
                       $timeout(function () {
                           utilService.ShowDialog($rootScope, utilService.translate("Confirm"), utilService.translate("Do you want to delete {{length}} row(s)", { length: listSelected.length }), utilService.translate("Yes"), $scope.DeleteScenariosCallback, utilService.translate("No"));
                           $rootScope.SendingScreenSharingDataObject(listSelected.length, 'tab', 'Delete', 'Scenario');
                       }, 1);
                   }
                   else {
                       utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Can’t delete current and new scenarios!"), utilService.translate("Ok"), $scope.OkCallBack);
                       $rootScope.SendingScreenSharingDataObject('', 'tab', 'Delete_error_current_new', 'Scenario');
                   }

               }
               else {
                   utilService.ShowDialog($rootScope, utilService.translate("Error"), utilService.translate("Please select at least one scenario!"), utilService.translate("Ok"), $scope.OkCallBack);
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'Delete_error', 'Scenario');
               }
           };
           $scope.DeleteScenariosCallbackSuccess = function (obj) {
                    var listSelected = GetListScenarioSelected();
                   if (obj.success == true) {
                       if (obj != null) {
                           $scope.listScenario = obj.results;
                           $timeout(function () {
                               $rootScope.spinner.off();
                           }, 100);
                           utilService.showSuccessMessage(utilService.translate("Deleted {{length}} row(s) successful!", { length: listSelected.length }));
                           $timeout(function () {
                               var item = {
                                   listScenario: $scope.listScenario,
                                   length: listSelected.length,
                               }
                               $rootScope.SendingScreenSharingDataObject(item, 'tab', 'Delete_success', 'Scenario');
                           }, 10);
                       }
                   }
                   else {
                       $rootScope.spinner.off();
                       utilService.showErrorMessage(obj.errcode);
                   } 
           }

           $scope.DeleteScenariosCallback = function () {
               $rootScope.spinner.on();
               var listSelected = GetListScenarioSelected();
               personalPlanService.DeleteScenarios(listSelected,$scope.DeleteScenariosCallbackSuccess);
           };

           $rootScope.ReloadScenarios = function (isSharing) {              
               if ($rootScope.PersonaPlan.status == 0) {
                   $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
                   personalPlanService.updateConvertDataOfPersonalPlan();                   
               }
               else if ($rootScope.PersonaPlan.status == 1) {
                   $rootScope.PersonaPlan = angular.copy($rootScope.newPlan);
                   personalPlanService.updateConvertDataOfPersonalPlan();                   
               }              
               $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
               $rootScope.MCTopValue = {
                   selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
               }
               $rootScope.MCBottomValue = {
                   selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
               }            
           }

           $scope.CloseAndLoadScenario = function () {
               $rootScope.ReloadScenarios();
               personalPlanService.CloseScenario($rootScope.PersonaPlan,
                   function (obj) { //console.log("Finish Close scenario dialog") 
                   }
                   );
               $timeout(function () {
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'close', 'Scenario');
               }, 100);

           };
           function GetListScenarioSelected() {
               var Selected = [];
               for (var i = 0; i < $scope.listScenario.length; i++) {
                   if (($scope.listScenario[i].isSelected != undefined) && $scope.listScenario[i].isSelected == true) {
                       Selected[Selected.length] = $scope.listScenario[i];
                   }
               }
               return Selected;
           }

           $scope.HideRenameDialog = function () {
               $('#renamedialog').modal('hide');
           }

           $scope.HideDialog = function () {
               $('#confirmdialog').modal('hide');
           }

           $scope.HideScenarioDialog = function () {
               $('#manageScenario').modal('hide');
           }

       }]
       );


