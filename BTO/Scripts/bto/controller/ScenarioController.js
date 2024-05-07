btoApp.controller('ScenarioController', [
       '$scope', 'personaplanService', '$timeout', '$rootScope', 'timelineService', '$templateCache', 'ultilService',
       function ($scope, personaplanService, $timeout, $rootScope, timelineService, $templateCache, ultilService) {
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
           $scope.GetScenario = function () {
               if ($rootScope.playBackPlayerData.isPlaying) {
                   $scope.listScenario = $rootScope.playBackPlayerData.data;
                   $rootScope.spinner.off();
               } else {
                   $rootScope.spinner.on();
                   personaplanService.GetScenario($rootScope.PersonaPlan.user_id).then(
                           function (obj) {
                               if (obj != null) {
                                   $scope.listScenario = obj.data;
                                   $timeout(function () {
                                       $rootScope.spinner.off();
                                       $rootScope.SendingScreenSharingDataObject($scope.listScenario, 'tab', 'open', 'Scenario');
                                   }, 100);
                               }
                           }
                       );

               }
           };

           $scope.callfromOutsite = function () {
               $scope.GetScenario();
           };
           $scope.callfromOutsiteForSharing = function (actionEvent, obj) {
               switch (actionEvent) {
                   case 'open':
                       $timeout(function () {
                           $('#manageScenario').modal({ backdrop: 'static', keyboard: false });
                           $scope.listScenario = obj;
                           $rootScope.scopeApply($scope);
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

                           switch (actionEvent) {
                               case 'NewScenario_success':
                               case 'Rename_success':
                                   $scope.name = obj.name;
                                   $('#input_rename_unit_work').val(obj.name);
                                   break;
                           }

                       }, 10);
                       $timeout(function () {
                           $rootScope.spinner.on();
                           $scope.listScenario = obj.listScenario;
                           $rootScope.scopeApply($scope);
                           $rootScope.spinner.off();
                           $('#CancelRename').click();
                           $('#CancelConfirm').click();

                           switch (actionEvent) {
                               case 'Rename_success':
                                   ultilService.showSuccessMessage(ultilService.translate("Renamed your scenario {{name}} successful!", { name: obj.name }));
                                   break;
                               case 'NewScenario_success':
                                   ultilService.showSuccessMessage(ultilService.translate("Your scenario:  {{name}} was successfully created!", { name: obj.name }));
                                   break;
                               case 'Delete_success':
                                   ultilService.showSuccessMessage(ultilService.translate("Deleted {{length}} row(s) successful!", { length: obj.length }));
                                   break;
                               case 'Duplicate':
                                   ultilService.showSuccessMessage(ultilService.translate("Duplicated {{length}} row(s) successful!", { length: obj.length }));
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
                           $rootScope.scopeApply($scope);
                           $rootScope.apply();
                           ultilService.showSuccessMessage(ultilService.translate("Your scenario: {{name}} was marked as new scenario!", { name: obj.listSelected[0].name }));
                           $rootScope.spinner.off();
                       }, 100);

                       break;
                   case 'MakeCurrent':
                       $rootScope.spinner.on();
                       $timeout(function () {
                           $rootScope.currentPlan = obj.currentPlan;
                           $rootScope.newPlan = obj.newPlan;
                           $scope.listScenario = obj.listScenario;
                           $rootScope.scopeApply($scope);
                           $rootScope.apply();
                           ultilService.showSuccessMessage(ultilService.translate("Your scenario: {{name}} was marked as current scenario!", { name: obj.listSelected[0].name }));
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
                           //  utils.ShowDialog($rootScope, ultilService.translate("Save new scenario"), '', '', '', $('#renameScenario').html());
                           utils.ShowDialogRename($rootScope, ultilService.translate("Save new scenario"), ultilService.translate("Please enter name:"));
                       }, 100);
                       break;
                   case 'Rename_Open':
                       $timeout(function () {
                           $scope.name = obj;
                           $rootScope.scopeApply($scope);
                           $('#input_rename_unit_work').val($scope.name);
                           utils.ShowDialogRename($rootScope, ultilService.translate("Rename"), ultilService.translate("Please enter new name:"), '');
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
                           utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select one scenario only!"));
                       }, 100);
                       break;
                   case 'Okbtndialog':
                       $timeout(function () {
                           $('#Okbtndialog').click();
                       }, 100);
                       break;
                   case 'Delete_error_current_new':
                       $timeout(function () {
                           utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Can’t delete current and new scenarios!"));
                       }, 100);
                       break;
                   case 'Delete_error':
                       $timeout(function () {
                           utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select at least one scenario!"));
                       }, 100);
                       break;
                   case 'Duplicate_error':
                       $timeout(function () {
                           utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select at least one scenario!"));
                       }, 100);
                       break;
                   case 'Delete':
                       $timeout(function () {
                           utils.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Do you want to delete {{length}} row(s)", { length: obj }), null, null);
                       }, 100);
                       break;
                   case 'MakeCurrent_error':
                       $timeout(function () {
                           utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select one scenario only!"));
                       }, 100);
                       break;
                   case 'MakeNew_error':
                       $timeout(function () {
                           utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select one scenario only!"));
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
                       utils.ShowDialogRename($rootScope, ultilService.translate("Rename"),
                            ultilService.translate("Please enter new name:"),
                            $scope.RenameScenarioCallBack);
                       //utils.ShowDialog($rootScope, ultilService.translate("Rename"), '', '', $scope.RenameScenarioCallBack, $('#renameScenario').html());
                       $rootScope.SendingScreenSharingDataObject(listSelected[0].name, 'tab', 'Rename_Open', 'Scenario');
                   }, 200);
                   $timeout(function () {
                       var focusEle = angular.element(document.querySelector('#input_rename_unit_work'));
                       focusEle.focus();
                   }, 800);
               }
               else {
                   utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select one scenario only!"));
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'Rename_Eror', 'Scenario');
               }
           };
           $scope.RenameScenarioCallBack = function () {
               var item = GetListScenarioSelected()[0];
               item.name = $('#input_rename_unit_work').val();
               $rootScope.spinner.on();
               personaplanService.UpdateScenario(item).then(
                   function (obj) {
                       if (obj.data.success == true) {
                           if (obj != null) {
                               $scope.listScenario = obj.data.results;
                               $timeout(function () {
                                   $rootScope.spinner.off();
                               }, 100);
                               ultilService.showSuccessMessage(ultilService.translate("Renamed your scenario {{name}} successful!", { name: item.name }));
                               var itemdata = {
                                   listScenario: $scope.listScenario,
                                   name: item.name,
                               };
                               $rootScope.SendingScreenSharingDataObject(itemdata, 'tab', 'Rename_success', 'Scenario');
                           }
                       }
                       else {
                           $rootScope.spinner.off();
                           ultilService.showErrorMessage(obj.data.errcode);
                       }
                   }
                );
           };
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
                       personaplanService.UpdateStatusScenario(listSelected[0]).then(
                           function (obj) {
                               if (obj.data.success == true) {
                                   if (obj != null) {
                                       $rootScope.currentPlan = obj.data.results.currentplan;
                                       $rootScope.newPlan = obj.data.results.newplan;
                                       $scope.listScenario = obj.data.results.listScenario;
                                       $timeout(function () {
                                           $rootScope.spinner.off();
                                       }, 100);
                                       ultilService.showSuccessMessage(ultilService.translate("Your scenario: {{name}} was marked as current scenario!", { name: listSelected[0].name }));
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
                                   ultilService.showErrorMessage(obj.data.errcode);
                               }
                           }
                        );
                   }
               }
               else {
                   utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select one scenario only!"));
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'MakeCurrent_error', 'Scenario');
               }
           };
           $scope.MakeNewScenario = function () {
               var listSelected = GetListScenarioSelected();
               if (listSelected.length == 1) {
                   if (listSelected[0].status != 1) {
                       listSelected[0].status = 1;
                       $rootScope.spinner.on();
                       personaplanService.UpdateStatusScenario(listSelected[0]).then(
                           function (obj) {
                               if (obj.data.success == true) {
                                   if (obj != null) {
                                       $rootScope.currentPlan = obj.data.results.currentplan;
                                       $rootScope.newPlan = obj.data.results.newplan;
                                       $scope.listScenario = obj.data.results.listScenario;
                                       $timeout(function () {
                                           $rootScope.spinner.off();
                                       }, 10);
                                       ultilService.showSuccessMessage(ultilService.translate("Your scenario: {{name}} was marked as new scenario!", { name: listSelected[0].name }));
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
                                   ultilService.showErrorMessage(obj.data.errcode);
                               }
                           }
                        );

                   }
               }
               else {
                   utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select one scenario only!"));
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
                   utils.ShowDialogRename($rootScope, ultilService.translate("Save new scenario"),
                           ultilService.translate("Please enter name:"),
                           $scope.NewScenarioCallBack);
                   //utils.ShowDialog($rootScope, ultilService.translate("Save new scenario"), '', '', $scope.NewScenarioCallBack, $('#renameScenario').html());
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'NewScenario', 'Scenario');
               }, 1);
               $timeout(function () {
                   var focusEle = angular.element(document.querySelector('#input_rename_unit_work'));
                   focusEle.focus();
               }, 800);
           };
           $scope.NewScenarioCallBack = function () {
               var name = $('#input_rename_unit_work').val();
               var object = { id: $rootScope.PersonaPlan.id, name: name, user_id: $rootScope.PersonaPlan.user_id };
               $rootScope.spinner.on();
               personaplanService.CreateNewScenario(object).then(
                   function (obj) {
                       if (obj.data.success == true) {
                           if (obj != null) {
                               $scope.listScenario = obj.data.results;
                               $timeout(function () {
                                   $rootScope.spinner.off();
                               }, 100);
                               ultilService.showSuccessMessage(ultilService.translate("Your scenario:  {{name}} was successfully created!", { name: name }));
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
                           ultilService.showErrorMessage(obj.data.errcode);
                       }
                   }
                );

           };
           $scope.DuplicateScenarios = function () {
               var listSelected = GetListScenarioSelected();
               if (listSelected.length > 0) {
                   $rootScope.spinner.on();
                   personaplanService.DuplicateScenarios(listSelected).then(
                       function (obj) {
                           if (obj.data.success == true) {
                               if (obj != null) {
                                   $scope.listScenario = obj.data.results;
                                   $timeout(function () {
                                       $rootScope.spinner.off();
                                   }, 100);
                                   ultilService.showSuccessMessage(ultilService.translate("Duplicated {{length}} row(s) successful!", { length: listSelected.length }));
                                   $timeout(function () {
                                       var item = {
                                           listScenario: $scope.listScenario,
                                           length: listSelected.length,
                                       }
                                       $rootScope.SendingScreenSharingDataObject(item, 'tab', 'Duplicate', 'Scenario');
                                   }, 10);
                               }
                           }
                           else {
                               $rootScope.spinner.off();
                               ultilService.showErrorMessage(obj.data.errcode);
                           }

                       }
                   );

               }
               else {
                   utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select at least one scenario!"));
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
                           utils.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Do you want to delete {{length}} row(s)", { length: listSelected.length }), $scope.DeleteScenariosCallback, null);
                           $rootScope.SendingScreenSharingDataObject(listSelected.length, 'tab', 'Delete', 'Scenario');
                       }, 1);
                   }
                   else {
                       utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Can’t delete current and new scenarios!"));
                       $rootScope.SendingScreenSharingDataObject('', 'tab', 'Delete_error_current_new', 'Scenario');
                   }

               }
               else {
                   utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select at least one scenario!"));
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'Delete_error', 'Scenario');
               }
           };
           $scope.DeleteScenariosCallback = function () {
               $rootScope.spinner.on();
               var listSelected = GetListScenarioSelected();
               personaplanService.DeleteScenarios(listSelected).then(
                   function (obj) {
                       if (obj.data.success == true) {
                           if (obj != null) {
                               $scope.listScenario = obj.data.results;
                               $timeout(function () {
                                   $rootScope.spinner.off();
                               }, 100);
                               ultilService.showSuccessMessage(ultilService.translate("Deleted {{length}} row(s) successful!", { length: listSelected.length }));
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
                           ultilService.showErrorMessage(obj.data.errcode);
                       }
                   }
               );


           };
           $scope.CloseAndLoadScenario = function () {
               $rootScope.ReloadScenarios();
               personaplanService.CloseScenario($rootScope.PersonaPlan).then(
                   function (obj) { });
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
       }]
       );
