btoApp.controller('SolutionController', [
       '$scope', 'personaplanService', '$timeout', '$rootScope', 'timelineService', '$templateCache','ultilService',
       function ($scope, personaplanService, $timeout, $rootScope, timelineService, $templateCache, ultilService) {
           $rootScope.solutionScope = $scope;
           $templateCache.remove('/Home/ManageSolution');
           $rootScope.spinner.on();
           $scope.rowCollection = [];
           $rootScope.renamedialog = {};
           $scope.displayedCollection = [].concat($scope.rowCollection);
           $scope.itemsByPage = 10;
           $scope.predicates = ["", ultilService.translate("Automatic"), ultilService.translate("Manual")];
           $timeout(function () {
               $scope.predicates = ["", ultilService.translate("Automatic"), ultilService.translate("Manual")];
               $rootScope.apply();
           }, 4000);
           $scope.selectedPredicate = $scope.predicates[0];
           //$scope.lastTimeRequestUpdate = Date.now();
           //$scope.timeDelay = 1000 * 60 * 10;
           $scope.timeSetInterval = 1000 * 60;

           $scope.LoadUnitOfWorkBack = function () {
               var obj = GetListSelected();
               if (obj != null && obj != undefined && obj.length == 1) {
                   $rootScope.spinner.on();
                   obj = obj[0].id;
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'loadsolution_success', 'Solution');
                   personaplanService.LoadSolution(obj).then(
                          function (data) {
                              if (data.data.success == true) {
                                  if (data != null) {
                                      ultilService.LoadByUser(data.data.results);
                                      $rootScope.spinner.off();
                                      ultilService.showSuccessMessage(ultilService.translate("Backup has been loaded!"));
                                  }
                              }
                              else
                              {
                                  ultilService.showErrorMessage(data.data.errcode);
                                  $rootScope.spinner.off();
                              }
                          },
                            function (error) {
                                ultilService.showErrorMessage(error.data.Message);
                            }
                    );
               }
           }
           $scope.LoadUnitOfWork = function(data)
           { 
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
                   var content = ultilService.translate("Name : {{name}}  Version: {{version}}", {name: obj[0].name, version: obj[0].version}) ;
                   utils.ShowDialog(
                       $rootScope,
                       ultilService.translate("Load backup"),
                       content,
                       ultilService.translate("Do you want to load this backup?"),
                       $scope.LoadUnitOfWorkBack, '',
                       ultilService.translate("No"),
                       ultilService.translate("Yes"));
                   $rootScope.SendingScreenSharingDataObject(content, 'tab', 'loadsolution_open', 'Solution');
               } else { 
                   utils.ShowDialog($rootScope,
                       ultilService.translate("Error"),
                       '',
                       ultilService.translate("Please select one backup!"));
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'loadsolution_error', 'Solution');
               }
           }
           setInterval(SaveUnitOfWorkAuto, $scope.timeSetInterval);
          

           $scope.callfromOutsite = function () {
               $('#manageSolution').modal({ backdrop: 'static', keyboard: false });
               $scope.GetSolution();
           };

           $scope.GetSolution = function ()
           {
               if ($rootScope.playBackPlayerData.isPlaying) {
                   $scope.rowCollection = $rootScope.playBackPlayerData.data;
                   $rootScope.spinner.off();
               } else {
               personaplanService.GetAllSolution($rootScope.PersonaPlan.user_id).then(
                       function (obj) {
                           if (obj != null) { 
                                   if (obj.data.length == 0) {
                                   $('.isDisablebtn').attr('disabled', 'disabled');
                               } else {
                                 $('.isDisablebtn').removeAttr('disabled');
                                }
                               $scope.rowCollection = obj.data;
                               $timeout(function () {
                               $rootScope.spinner.off();
                                   $rootScope.SendingScreenSharingDataObject($scope.rowCollection, 'tab', 'open', 'Solution');
                               }, 500);
                           }
                       }
                 );
           }
           }
           $scope.RenameUnitWorkCallBack = function(){ 
               var item = GetListSelected()[0];
               item.name = $('#input_rename_unit_work').val();
               personaplanService.UpdateNameSolution(item).then(
                      function (obj) {
                          if (obj.data.success == true) {
                              if (obj != null) {
                                  for (var i = ($scope.rowCollection.length - 1) ; i >= 0; i--) {
                                      if (($scope.rowCollection[i].isSelected != undefined) && $scope.rowCollection[i].isSelected == true) {
                                          $scope.rowCollection[i].name = item.name;
                                          $scope.rowCollection[i].isSelected = false;
                                          $scope.rename = '';
                                          ultilService.showSuccessMessage(ultilService.translate("Renamed!"));
                                          var itemdata = {
                                              name: item.name,
                                              i: i,
                                          };
                                          $rootScope.SendingScreenSharingDataObject(itemdata, 'tab', 'remember_success', 'Solution');
                                      }
                                  }
                              }
                          }
                          else
                          {
                              ultilService.showErrorMessage(obj.data.errcode);
                          }
                      }
                );
               $rootScope.scopeApply($scope);
           } 
           $scope.RenameUnitWork = function(data)
           {
               var listDelete = GetListSelected();
               if ($rootScope.playBackPlayerData.isPlaying && angular.isDefined(data)) {
                   var id = data.id;
                   for (var i = 0; i < $scope.rowCollection.length; i++) {
                       if (id == $scope.rowCollection[i].id) {
                           listDelete = [$scope.rowCollection[i]];
                           if ($rootScope.playBackPlayerData.isBackward) {
                               listDelete[0].name = data.oldName;
                           } else {
                               data.oldName = angular.copy($scope.rowCollection[i].name);
                               listDelete[0].name = $scope.rowCollection[i].name;
                               $scope.rowCollection[i].name = data.name;
                           }
                           $rootScope.scopeApply($scope);
                           break;
                       }
                   }
                   
               }
               if (listDelete.length == 1)
               { 
                   $scope.rename = listDelete[0].name;
                   $('#input_rename_unit_work').val($scope.rename);
                   $timeout(function () {
                       $scope.dialog_form.$setPristine();
                       utils.ShowDialogRename($rootScope,ultilService.translate("Rename Backup"),
                           ultilService.translate("Please enter new name:"),
                           $scope.RenameUnitWorkCallBack);
                       $rootScope.SendingScreenSharingDataObject($scope.rename, 'tab', 'remember_open', 'Solution');
                   }, 1);
                  
                   $timeout(function () {
                       var focusEle = angular.element(document.querySelector('#input_rename_unit_work'));
                       focusEle.focus();
                   }, 800);
                   
               }
               else { 
                   utils.ShowDialog($rootScope, ultilService.translate("Error"),
                       '',
                       ultilService.translate("Please select one backup!"));
                   $rootScope.SendingScreenSharingDataObject('', 'tab', 'remember_error', 'Solution');
               } 
           }

           $scope.RemoveUnitAt = function()
           {
               var listDelete = [];
               for (var i = ($scope.rowCollection.length - 1); i >= 0; i--) {
                   if (($scope.rowCollection[i].isSelected != undefined) && $scope.rowCollection[i].isSelected == true) {
                       listDelete[listDelete.length] = $scope.rowCollection[i].id;
                       $scope.rowCollection.splice(i, 1);
                   }
               }
               $rootScope.scopeApply($scope);
               $rootScope.spinner.on();
               personaplanService.DeleteSolution(listDelete).then(
                      function (obj) {
                          if (obj.data.success == true) {
                              if (obj != null && obj.data.results == true) {
                                  //$scope.GetSolution();                              
                              }
                              else {
                                  $scope.GetSolution();//we need to load solution again when delete not success
                              }
                              $rootScope.spinner.off();
                              $rootScope.SendingScreenSharingDataObject($scope.rowCollection, 'tab', 'remove_success', 'Solution');
                          }
                          else
                          {
                              ultilService.showErrorMessage(obj.data.errcode);
                              $rootScope.spinner.off();
                          }
                      }
                ); 
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
                           $rootScope.scopeApply($scope);
                           break;
                       }
                   }
               }               
               if (listDelete.length > 0) {
                   var content = "";
                   for (var i = 0; i < listDelete.length; i++) {
                       content += "" + listDelete[i].name + "\n";
                   }
                   utils.ShowDialog($rootScope, 
                       ultilService.translate("Delete"),
                       content,
                       ultilService.translate("Do you want to delete this backup?"),
                       $scope.RemoveUnitAt, '',
                       ultilService.translate("No"),
                       ultilService.translate("Yes"));
                   $timeout(function () {
                       $rootScope.SendingScreenSharingDataObject(content, 'tab', 'remove', 'Solution');
                   }, 10);
               } else { 
                   utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select one backup!"));
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
           $scope.SaveUnitOfWorkCallBack = function () {
               $rootScope.spinner.on();
               //$scope.lastTimeRequestUpdate = Date.now();
               var Solution = {
                   user_id: $rootScope.PersonaPlan.user_id,
                   name : $('#input_rename_unit_work').val()
               }; 
               personaplanService.SaveCurrentSolution(Solution).then(
                           function (obj) {
                               if (obj.data.success == true) {
                                   if (obj != null && obj.data.results != undefined) {
                                       //$scope.GetSolution();
                                       if (obj.data.results.length == 0) {
                                           $('.isDisablebtn').attr('disabled', 'disabled');
                                       } else {
                                           $('.isDisablebtn').removeAttr('disabled');
                                       }
                                       $scope.rowCollection = obj.data.results;
                                       ultilService.showSuccessMessage(ultilService.translate("Saved!"));
                                       var item = {
                                           rowCollection: $scope.rowCollection,
                                           name: Solution.name
                                       };
                                       $timeout(function () {
                                           $rootScope.spinner.off();
                                           $rootScope.SendingScreenSharingDataObject(item, 'tab', 'save_success', 'Solution');
                                       }, 1000);

                                   }
                               }
                               else
                               {
                                   ultilService.showErrorMessage(obj.data.errcode);
                                   $rootScope.spinner.off();
                               }
                           }
                     );
           }
           $scope.SaveAutomatic = function(){
               var Solution = {
                   user_id: $rootScope.PersonaPlan.user_id,

               };
               //$scope.lastTimeRequestUpdate = Date.now();
               personaplanService.SaveAutomatic(Solution).then(
                   function (obj) { 
                       if (obj != null && obj.data.user_id !=  undefined) { 
                       }
                       else { 
                          // ultilService.showErrorMessage(obj.data); 
                       }
                   }
                  );
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
               //if (solution != null || solution != undefined) {
                    $scope.dialog_form.$setPristine();
                    utils.ShowDialogRename($rootScope, ultilService.translate("Save Backup"), ultilService.translate("Please enter name for backup:"), $scope.SaveUnitOfWorkCallBack);
                    $rootScope.SendingScreenSharingDataObject('', 'tab', 'save_open', 'Solution');
                   $timeout(function () {
                       var focusEle = angular.element(document.querySelector('#input_rename_unit_work'));
                       focusEle.focus(); 
                   }, 500);
               //}
           }
           $scope.CloseSolution = function () {
               personaplanService.CloseSolution().then(
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

           
           $scope.callfromOutsiteForSharing = function (actionEvent, obj) {
               switch (actionEvent) {
                   case 'open':
                       $timeout(function () {
                           $('#manageSolution').modal({ backdrop: 'static', keyboard: false });
                       }, 10);
                       $timeout(function () { 
                           $scope.rowCollection = obj;
                           $rootScope.scopeApply($scope);
                           $timeout(function () {
                               $rootScope.spinner.off();
                           }, 100);
                       }, 500);
                       break; 
                   case 'save_open':
                       $rootScope.spinner.on();
                       $timeout(function () { 
                           utils.ShowDialogRename($rootScope, ultilService.translate("Save Backup"), ultilService.translate("Please enter name for backup:"), '');
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
                           ultilService.showSuccessMessage(ultilService.translate("Saved!"));
                       },1000); 
                       break;
                   case 'close':
                       $timeout(function () {
                           $('#manageSolution').modal('hide'); 
                       }, 10); 
                       break;
                   case 'close_sub_dialog':
                       $timeout(function () {
                           $('#CancelRename').click();
                       }, 100); 
                       break;
                   case 'remove_error':
                       $timeout(function () {
                           utils.ShowDialog($rootScope, ultilService.translate("Error"), '', ultilService.translate("Please select one backup!"));
                       }, 100);
                       break;
                   case 'remove':
                       $timeout(function () {
                               utils.ShowDialog($rootScope,
                               ultilService.translate("Delete"),
                               obj,
                               ultilService.translate("Do you want to delete this backup?"),
                               '', '',
                               ultilService.translate("No"),
                               ultilService.translate("Yes")); 
                       }, 100);
                               break;
                   case 'remove_success':
                       $timeout(function () {
                            $('#CancelConfirm').click();
                        }, 10);
                       $timeout(function () {
                           $scope.rowCollection = obj;
                           $rootScope.scopeApply($scope);
                       }, 1000);
                       break;
                   case 'remember_open':
                       $timeout(function () {
                           $('#input_rename_unit_work').val(obj);
                           utils.ShowDialogRename($rootScope, ultilService.translate("Rename Backup"),
                              ultilService.translate("Please enter new name:"),
                              '');
                       }, 100);
                       break;
                   case 'remember_error':
                       $timeout(function () {
                                 utils.ShowDialog($rootScope, ultilService.translate("Error"),
                               '',
                               ultilService.translate("Please select one backup!"));
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
                           ultilService.showSuccessMessage(ultilService.translate("Renamed!")); 
                       }, 1000);
                      
                       break;
                   case 'loadsolution_open':
                       $timeout(function () {
                           utils.ShowDialog(
                          $rootScope,
                          ultilService.translate("Load backup"),
                          obj,
                          ultilService.translate("Do you want to load this backup?"),
                          '', '',
                          ultilService.translate("No"),
                          ultilService.translate("Yes"));
                       }, 100);
                       
                       break;
                   case 'loadsolution_error':
                       $timeout(function () {
                           utils.ShowDialog($rootScope,
                           ultilService.translate("Error"),
                           '',
                           ultilService.translate("Please select one backup!"));
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
                           $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                           $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                           $rootScope.MainResult = obj.result; 
                           $rootScope.ReloadShareScreen();
                           ultilService.showSuccessMessage(ultilService.translate("Backup has been loaded!"));
                           $rootScope.spinner.off();
                       }, 100);
                       break;
               }
           };
       }]
 );
