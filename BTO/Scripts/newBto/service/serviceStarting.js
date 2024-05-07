btoApp.factory('startService',
function ($rootScope, $filter, $http, utilService, personalPlanService, userService, profileService, timelineService, $timeout, actionService, accountService) {
    $timeout(function () {
        $rootScope.$watch('MainResult.broken_age', function () {
            $rootScope.timelineService.renderBrokenAge();
        });
        $rootScope.$watch('MaxStartAge', function () {
            $rootScope.listStartAge = $rootScope.utilService.range($rootScope.MinStartAge, $rootScope.MaxStartAge);
        });
        
        $rootScope.$watch('zoomData.minAge', function (newValue) {
            //console.log(newValue);
            $rootScope.setVisibleRangeOfTimeLine();
            //$rootScope.timelineService.renderTimeLine();
            if ($rootScope.PersonaPlan.start_age != $rootScope.zoomData.minAge) {
                $rootScope.timeline.unselectItem();
                if (angular.isDefined($rootScope.timelineService.cancelHighlight)) {
                    $rootScope.timelineService.cancelHighlight();
                }
            }
            //if (angular.isDefined($rootScope.timelineService.timelineChart)) {
                $rootScope.timelineService.zoomTimelineChart();
            //}
            $rootScope.SendingScreenSharingDataObject($rootScope.zoomData.minAge, 'zoom', 'changeMinAge', ''); 
        });        
        $rootScope.$watch('zoomData.maxAge', function (newValue) {
            
            $rootScope.setVisibleRangeOfTimeLine();
            if ($rootScope.PersonaPlan.death_age != $rootScope.zoomData.maxAge) {
                $rootScope.timeline.unselectItem();
                if (angular.isDefined($rootScope.timelineService.cancelHighlight)) {
                    $rootScope.timelineService.cancelHighlight();
                }
            }
          //  if (angular.isDefined($rootScope.timelineService.timelineChart)) {
                $rootScope.timelineService.zoomTimelineChart();
           // }
            //$rootScope.timelineService.renderTimeLine();
            $rootScope.SendingScreenSharingDataObject($rootScope.zoomData.maxAge, 'zoom', 'changeMaxAge', '');
        });
    }, 10);
    this.initData = function () {
        //console.log('begin loadListFunctionPermission');
        //console.timeEnd('btoApp');
        userService.loadListFunctionPermission(user_id, function () {
            //console.log('End loadListFunctionPermission');
            //console.timeEnd('btoApp');
                profileService.initProfile(user_id, function () {
                    //console.log('End initProfile');
                    //console.timeEnd('btoApp');
                    // Get Personal Plan after load profile
                    personalPlanService.getPersonalPlan(user_id, function () {
                        //console.log('finish get PersonaPlan')
                        //console.timeEnd('btoApp');
                        //if (angular.isDefined($rootScope.savingRate)) {
                        //    //console.log('load cashFlow after loading personal plan');

                        //    //$rootScope.cashFlow = angular.copy(cashFlow);
                        //    //$rootScope.savingRate.isLoadCashFlow = true;
                        //    //$rootScope.savingRate.updateCashFlow();
                        //    /*
                        //    $rootScope.savingRate.convertCashFlowFromYearlyToMonthly();
                        //    $rootScope.savingRate.updateIncomeExpenseAndSavingFromCashflow();
                        //    */
                        //}
                    });
                    $rootScope.isFirstLoadProfile = true;
                    if (angular.isDefined($rootScope.savingRate)) {
                        //console.log('load cashFlow after loading profile');
                        //$rootScope.PersonaPlan.return_cashFlow = true;
                        $rootScope.savingRate.updateCashFlow();
                        //var cashFlowStr = JSON.stringify($rootScope.cashFlow);
                        //console.log('tracking cashFlow after load profile ', cashFlowStr);
                    }
                    $timeout(function () {
                        self.registerWatchValueEventForTheme();
                    }, 500);
                    $timeout(function () {
                        $rootScope.playbackService.doPlaybackFromCookie();
                    }, 5000);
                    // after get personal plan and function access and profilce success, it will build timeline                    
                    
                });
            });
            //userService.getRatingOfUser(function (data) {
            //    if (data.length > 0) {
            //        angular.forEach(data, function (item) {
            //            $rootScope.ratingData.data[item.sectionId] = item.rating;
            //        });
            //        $rootScope.SendingScreenSharingDataObject($rootScope.ratingData, 'ratingService', 'getrating');
            //        console.log("userService.getRatingOfUser");
            //        console.log($rootScope.ratingData);
            //    }
            //})
        
        personalPlanService.getListDreamType(user_id, personalPlanService.getListDreamTypeCallback);
        accountService.loadUserInfo();
        profileService.loadCountry();        
        /*           
        personalPlanService.getPersonalPlan(user_id);
        personalPlanService.getListDreamType(user_id, personalPlanService.getListDreamTypeCallback);
        userService.loadListFunctionPermission(user_id);
        accountService.loadUserInfo();
        profileService.loadCountry();
        profileService.initProfile(user_id);
        timelineService.timelineObj = timelineService.initTimeline();
        */
    }

    // This function will be overide for each theme
    this.registerWatchValueEventForTheme = function () {
        
        $timeout(function () {
            $rootScope.$watch('convertDataOfPersonalPlan.salaryEvolution', function (newValue) {
                if (!$rootScope.convertDataOfPersonalPlan.isFirstConvert) {
                    $rootScope.PersonaPlan.salary_evolution = parseFloat(newValue) / 100;
                    $rootScope.PersonaPlan.salary_evolution = parseFloat($rootScope.PersonaPlan.salary_evolution.toFixed(4));
                    actionService.callServerToUpdateResult();
                }
                $timeout(function () {
                    $rootScope.convertDataOfPersonalPlan.isFirstConvert = false;
                }, 200);
            });
            
            $rootScope.$watch('convertDataOfPersonalPlan.inflaction', function (newValue) {
                if (!$rootScope.convertDataOfPersonalPlan.isFirstConvert) {
                    $rootScope.PersonaPlan.inflation = parseFloat(newValue) / 100;
                    $rootScope.PersonaPlan.inflation = parseFloat($rootScope.PersonaPlan.inflation.toFixed(4));
                    actionService.callServerToUpdateResult();
                }
                $timeout(function () {
                    $rootScope.convertDataOfPersonalPlan.isFirstConvert = false;
                }, 200);
            });
            $rootScope.$watch('zoomData.minAge', function (newValue) {
                $rootScope.zoomService.changeMinAge(newValue);
            });
            $rootScope.$watch('zoomData.isShow', function () {
                $rootScope.zoomService.changeIsShow();
            });
            $rootScope.$watch('zoomData.maxAge', function (newValue) {
                $rootScope.zoomService.changeMaxAge(newValue);
            });

        }, 1000)
    }

    this.registerValueForTheme = function () {
        $rootScope.progressBarValue = {
            nameWillChange: '',
            changeProgressData: 0
        }
    }
    var self = this;
    return this;
})