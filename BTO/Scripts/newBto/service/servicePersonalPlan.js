btoApp.factory('personalPlanService',
function ($rootScope, $filter, $http, utilService, accountService, $timeout) {
    this.getPersonalPlan = function (user_id, callbackSuccess) {
        var self = this;
        utilService.callApiByAjax('GET', '/api/PersonaPlan/GET/' + user_id, '', function (pl) {
            //console.log('Get Personal Plan success');
            $rootScope.currentPlan = pl.currentplan;
           // $rootScope.newPlan = pl.newplan;
            
            
            //self.updateAgeDependentOfChildIndependent($rootScope.newPlan);

            $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
            try {
                self.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan);
            } catch (e) { }                  
            $rootScope.zoomData = {};
            $rootScope.zoomData.maxAge = $rootScope.PersonaPlan.death_age;
            $rootScope.zoomData.minAge = $rootScope.PersonaPlan.start_age;
            $rootScope.zoomData.max = angular.copy($rootScope.PersonaPlan.death_age);
            $rootScope.zoomData.min = angular.copy($rootScope.PersonaPlan.start_age);

            self.updateConvertDataOfPersonalPlan();
            if (angular.isDefined(callbackSuccess)) callbackSuccess();

            
            $timeout(function () {
                if (angular.isDefined($rootScope.savingRate)) {
                    self.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan);
                    $rootScope.savingRate.updateYearlyCostReduction();
                }
            }, 3000);
            accountService.getListParameter();
            //console.log('start render timeline');
            //console.timeEnd('btoApp');
            // $rootScope.timelineService.timelineObj = $rootScope.timelineService.initTimeline();
            $rootScope.timelineService.initTimeline();
            accountService.initData();
            utilService.callApiByAjax('GET', '/api/PersonaPlan/TrackingGet/' + user_id, '', function (pl) {
            });
            
            
        });
    },

    this.updateAgeDependentOfChildIndependent = function (plan, listChild) {
        var childList = [];
        if (angular.isDefined(listChild) && angular.isArray(listChild) && listChild.length > 0) {
            angular.forEach(listChild, function (item) {
                childList.push({
                    id: item.id,
                    age: item.age,
                    name: item.full_name
                })
            });
        } else {
            childList = $rootScope.profile.children.childrens;
        }
        if (angular.isDefined(plan.lifeEvent) && angular.isArray(plan.lifeEvent) && plan.lifeEvent.length > 0) {
            angular.forEach(plan.lifeEvent, function (lifeEvent) {
                if (lifeEvent.dream_type_id == 5 && lifeEvent.dependent_reference != null && lifeEvent.dependent_reference != undefined && lifeEvent.dependent_reference.indexOf('child') >= 0) {
                    // find child
                    var child = null;
                    if (childList.length > 0) {
                        for (var i = 0 ; i < childList.length; i++) {
                            if (('child_' + childList[i].id) == lifeEvent.dependent_reference) {
                                child = childList[i];
                                break;
                            }
                        }
                    }
                    if (child != null) {
                        var main_age = plan.start_age;
                        if (angular.isDefined($rootScope.profile.client.age)) {
                            main_age = parseInt($rootScope.profile.client.age);
                        } 
                        if (lifeEvent.starting_age != 200) {
                            var age_dependent = lifeEvent.starting_age + child.age - main_age;
                            lifeEvent.age_dependent = age_dependent; 
                        } else {
                            lifeEvent.age_dependent = null;
                        }
                    } 
                } 
            });
        }
    },

    this.updateStarAgeOfChildIndependent = function () {
        angular.forEach($rootScope.PersonaPlan.lifeEvent, function (event) {
            if (event.dream_type_id == 5) {
                var age_of_child = null;
                if ($rootScope.profile.children.childrens.length > 0) {
                    for (var i = 0; i < $rootScope.profile.children.childrens.length; i++) {
                        if (('child_' + $rootScope.profile.children.childrens[i].id) == event.dependent_reference) {
                            age_of_child = $rootScope.profile.children.childrens[i].age;
                        }
                    }
                }
                if (age_of_child != null) {
                    event.starting_age
                    event.starting_age = $rootScope.PersonaPlan.start_age + event.age_dependent - age_of_child;
                }
            }
        })
    }
    this.updateConvertDataOfPersonalPlan = function () {
        $rootScope.convertDataOfPersonalPlan = {
            isFirstConvert: true,
            risk: $rootScope.PersonaPlan.volatility * 100,
            risk_return: $rootScope.PersonaPlan.risk_return * 100,
            mc_bottom_value: $rootScope.PersonaPlan.mc_bottom_value * 100 + '%',
            mc_top_value: $rootScope.PersonaPlan.mc_top_value * 100 + '%',
            salaryEvolution: $rootScope.PersonaPlan.salary_evolution * 100,
            inflaction : $rootScope.PersonaPlan.inflation * 100
        }
    },
    this.AddDream = function (objDream, callback) {
        console.log(objDream);
        if (objDream.dream_type_id != 1) objDream.existant = false;
        utilService.callApiByAjax('POST', '/api/PersonaPlan/adddream/', objDream, function (pl) {
            if (angular.isDefined(callback)) { callback(pl) };
            /*
            $rootScope.selectedDream.id = parseInt(pl.id);
            $rootScope.selectedDream.photo_path = pl.photo_path;
            $rootScope.selectedDream.photoContent = pl.photoContent;
            */
        });
    }
    this.AddLifeEvent = function (objLifeEvent, callback) {
        //console.log(objLifeEvent);
        if (objLifeEvent.dream_type_id != 1) objLifeEvent.existant = false;
        utilService.callApiByAjax('POST', '/api/PersonaPlan/addLifeEvent/', objLifeEvent, function (pl) {
            if (angular.isDefined(callback)) { callback(pl) };
            /*
            console.log('selectedLifeEvent :', $rootScope.selectedLifeEvent);
            $rootScope.selectedLifeEvent.id = parseInt(pl.id);
            $rootScope.selectedLifeEvent.photo_path = pl.photo_path;
            $rootScope.selectedLifeEvent.photoContent = pl.photoContent;
            */
        });
    }
    this.RemoveDream = function (dream_id,callback) {
        utilService.callApi('POST', '/api/PersonaPlan/deleteDream', '', dream_id, callback);
    }
    this.RemoveLifeEvent = function (lifeEvent_id, callback) {
        utilService.callApi('POST', '/api/PersonaPlan/deleteLifeEvent', '', lifeEvent_id, callback);
    }
    this.getListDreamType = function (user_id,callback) {
        utilService.callApi('GET', '/api/dream/GET/' + user_id, '', '', callback);
    }
    this.getListDreamTypeCallback = function (obj) {
        if (obj != null) {
            $rootScope.DreamTypes = obj.dreamtype;
            $rootScope.backupDreamType = angular.copy(obj.dreamtype);
            $rootScope.selectedDream = obj.dream;
            $rootScope.backupselectedDream = angular.copy(obj.dream);
            $rootScope.selectedDreamtype = $rootScope.DreamTypes[0];
            //for life event
            $rootScope.selectedLifeEvent = obj.lifeevent;
            $rootScope.backupselectedLifeEvent = angular.copy(obj.lifeevent);

            $rootScope.DreamListType = [];
            $rootScope.DreamListLifeEvent = [];
            var j = 0; p = 0;
            for (var i = 0; i < $rootScope.DreamTypes.length; i++) {
                if ($rootScope.DreamTypes[i].type == 'dream') {
                    $rootScope.DreamListType[j] = $rootScope.DreamTypes[i];
                    j = j + 1;
                } else {
                    $rootScope.DreamListLifeEvent[p] = $rootScope.DreamTypes[i];
                    p = p + 1;
                }
            } 
        }
    }
    this.resetPersonalPlan = function (user_id, status, callback) {
        var user = { user_id: user_id, status: status };
        utilService.callApi('POST', '/api/PersonaPlan/resetplan', '', user, callback);
    }

    this.is_reset_persona_Plan = false;
    this.resetPersonalPlanWithCashFlow = function (user_id, retirement_age, social_security_age, status, callback) {
        var user = { user_id: user_id, retirement_age: retirement_age, social_security_age: social_security_age, status: status };
        utilService.callApi('POST', '/api/PersonaPlan/resetplan', '', user, callback);
        this.is_reset_persona_Plan = true;
    }
    this.updatePersonalPlan = function (personalPlan, callback) {
        if (!$rootScope.playBackPlayerData.isPlaying) {
            utilService.callApi('POST', '/api/PersonaPlan', '', personalPlan, function (response) {  });
        }
    }
    this.changeToCurrentPlan = function (personalPlan, callback) {
        utilService.callApi('POST', '/api/PersonaPlan/changeToCurrentPlan/', '', personalPlan, callback);
    }
    this.changeToNewPlan = function (personalPlan, callback) {
        utilService.callApi('POST', '/api/PersonaPlan/changeToNewPlan/', '', personalPlan, callback);
            }
    this.calculateBasic = function (personalPlan, callback) {
        utilService.callApi('POST', '/api/common/calculate_basic/', '', personalPlan, callback);
    }
    this.calculateAll = function (personalPlan, callback) {
        utilService.callApi('POST', '/api/common/calculateAll/', '', personalPlan, callback);
    }
    this.calculateIncomeAndExpense = function (personalPlan, callback) {
        utilService.callApi('POST', '/api/common/calculate_income_expense/', '', personalPlan, callback);
            }
    this.calculateEquityCurve = function (personalPlan, callback) {
        utilService.callApi('POST', '/api/common/calculate_equity_curve/', '', personalPlan, callback);
    }
    this.calculateIlliquidCurve = function (personalPlan, callback) {
        utilService.callApi('POST', '/api/common/calculate_illiquid_curve/', '', personalPlan, callback);
    }
    this.CalculateRanking = function (personalPlan, callback) {
        utilService.callApi('POST', '/api/common/calculate_ranking/', '', personalPlan, callback);
    }
   
    //Solution Scope
    this.GetAllSolution = function (user_id, callback) {
        utilService.callApi('GET', '/api/Solution/GET/' + user_id, '', '', callback);
            }
    this.calculateIlliquidCurve = function (personalPlan, callback) {
        utilService.callApi('POST', '/api/common/calculate_illiquid_curve/', '', personalPlan,callback);
    }
    this.DeleteSolution = function (list, callback) {
        utilService.callApi('POST', '/api/Solution/DeleteList/', '', list, callback);
    }
    this.showDreamDialog = function () {
        $('#dreamdialog').modal('show');
    }

    this.hideDreamDialog = function () {
        $('#dreamdialog').modal('hide');
    }

    this.showLifeEventDialog = function () {
        $('#lifeeventdialog').modal('show');
    }

    this.hideLifeEventDialog = function () {
        $('#lifeeventdialog').modal('hide');
    }

    this.showScenarioManagement = function () {
        if ($rootScope.PersonaPlan.status == 0) {
            $rootScope.currentPlan = angular.copy($rootScope.PersonaPlan);
        }
        else if ($rootScope.PersonaPlan.status == 1) {
            $rootScope.newPlan = angular.copy($rootScope.PersonaPlan);
        }
        $timeout(function () {
            $rootScope.scenarioScope.GetScenario();
            $rootScope.spinner.on();
            $('#manageScenario').modal({ backdrop: 'static', keyboard: false });
            $rootScope.spinner.off();         
        }, 10);
    }

    this.showManageSolution = function () {
       // $rootScope.solutionScope.GetSolution();
        //$timeout(function () {
        //    $('#manageSolution').modal({ backdrop: 'static', keyboard: false });
        //}, 500);
        ReUpdateForControlById('manageSolution');
    }
    this.GetScenario = function (user_id, callback)
    {
        utilService.callApi('GET', '/api/PersonaPlan/GetScenario/'+ user_id, '', '', callback);
    }
    this.UpdateScenario = function (item,callback) {
        utilService.callApi('POST', '/api/PersonaPlan/UpdateScenario/', '', item, callback); 
    }
    this.UpdateStatusScenario = function (item,callback) {
        utilService.callApi('POST', '/api/PersonaPlan/UpdateStatusScenario/', '', item, callback);
    }
    this.CreateNewScenario = function (item,callback) {
        utilService.callApi('POST', '/api/PersonaPlan/CreateNewScenario/', '', item, callback);
    }
    this.DuplicateScenarios = function (item,callback) {
        utilService.callApi('POST', '/api/PersonaPlan/DuplicateScenarios/', '', item, callback);
    }
    this.DeleteScenarios = function (item,callback) {
        utilService.callApi('POST', '/api/PersonaPlan/DeleteScenarios/', '', item, callback); 
    }
    this.CloseScenario = function (item,callback) {
        utilService.callApi('POST', '/api/PersonaPlan/CloseScenario/', '', item, callback); 
    }
    this.SaveCurrentSolution = function(item,callback)
    {
        utilService.callApi('POST','/api/Solution/Savesolution','',item,callback);
    }
    this.LoadSolution = function(item,callback)
    {
        utilService.callApi('POST','/api/Solution/Loadsolution','',item,callback); 
    }
    this.UpdateNameSolution = function (item, callback)
    {
        utilService.callApi('POST', '/api/Solution/UpdateName', '', item, callback);
    }
    this.CloseSolution = function (callback) {
        utilService.callApi('POST', '/api/Solution/CloseSolution', '', '', callback);
    }
    this.SaveAutomatic = function (item,callback) {
        utilService.callApi('POST','/api/Solution/SaveAutomatic','',item,callback); 
    }
    this.ChangeTab = function (tabName,callback) {
        utilService.callApi('GET', '/api/PersonaPlan/ChangeTab/' + tabName, '', '', callback);
    }
    this.ChangeSession = function (sessionName, callback) {
        utilService.callApi('GET', '/api/PersonaPlan/ChangeSession/' + sessionName, '', '', callback);
    }
    return this;
});