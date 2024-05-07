
btoApp.factory('playbackService',
    function ($rootScope, $http, $timeout, $q, ultilService, timelineService, $interval, $state, $locale) {
        $rootScope.playBackPlayerData = {
            isPlaying: false,
            isPause: true,
            isPlayAction: false,
            actionSpeed: 1000,
            forwardSpeed: 1,
            playInterval: null,
            currentTime: 0,
            actionCurrentTime: 0,
            timeLength: 0,
            playAction: null,
            isForward: true,
            isBackward: false,
            isPlayBack: false,
            isFinishPlayBack: true,
            data: null,
            tooltipMessage: '',
            tooltipOptions: 0,
            playForwardActionList: [],
            playBackActionList: [],
            session: null
        };
        $rootScope.playbackSessionList = [];
        $rootScope.playbackActionListFromServer = [];
        return {
            
            initialPlayBack: function () {
                $rootScope.playbackSessionTable.callServer($rootScope.playbackSessionTable.tableState);
                $('#playbackSessionDialog').modal({
                    backdrop: 'static', keyboard: false
                });
                /*
                $interval(function () {
                    console.log($rootScope.playBackPlayerData.isBackward + " --- Forward: " + $rootScope.playBackPlayerData.playForwardActionList.length + ' --- Backward: ' + $rootScope.playBackPlayerData.playBackActionList.length);
                }, 1500);
                */
            },

            initialPlaybackSession: function () {
                //console.log('initial Play back');
                $rootScope.playBackPlayerData.isPlayBack = true;
                $rootScope.playBackPlayerData.isFinishPlayBack = true;

                $('#playback').css({ 'z-index': '10000', 'display': 'block' });
                $('.overlay').css({ 'height': $(document).height(), 'z-index': '9999' });

                this.orignialData = angular.copy($rootScope.PersonaPlan);
                this.orginalMainResult = angular.copy($rootScope.MainResult);
                this.initData();
            },

            playBackInitialData: null,
            startAction: null,

            playbackHoverProgress: function (event) {
                //$('#playback_progressbar').tooltip('hide');
                var playback_progressbar = angular.element(document.querySelector('#playback_progressbar'));
                var playback_progressbar_tooltip = angular.element(document.querySelector('#playback_progressbar_tooltip'));
                
                var width = playback_progressbar.width();
                var left = playback_progressbar.offset().left;
                var currentPosition = event.screenX;
                var currentTime = ((currentPosition - left) / width) * $rootScope.playBackPlayerData.timeLength;
                
                var actionData = null;
                for (var i = 0; i < $rootScope.playBackPlayerData.playBackActionListData.length; i++) {
                    if (currentTime >= $rootScope.playBackPlayerData.playBackActionListData[i].start_time ){//+ $rootScope.playBackPlayerData.playBackActionListData[i].duration/2) {
                        actionData = $rootScope.playBackPlayerData.playBackActionListData[i];
                        //break;
                    }
                }
                //console.log(currentTime, actionData);
                if (actionData != null) {
                    $rootScope.playBackPlayerData.tooltipMessage = ultilService.translate(actionData.action_description);
                    var tooltipLeft = left + ((currentTime / $rootScope.playBackPlayerData.timeLength) * width);
                    tooltipLeft -= playback_progressbar_tooltip.width() / 2;
                    $rootScope.playBackPlayerData.tooltipOptions = {
                        "position": "fixed",
                        "left": tooltipLeft + "px",
                        "bottom": "24px"
                    }
                }
                
            },

            playbackMouseOutProgressBar: function (event) {
                
                $rootScope.playBackPlayerData.tooltipMessage = '';
                //$rootScope.$apply();
            },

            reloadSession: function () {
                $rootScope.PersonaPlan = angular.copy(this.playBackInitialData);
                $rootScope.MainResult = angular.copy(this.playBackInitialMainResult);
                $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                $rootScope.playBackPlayerData.playForwardActionList = angular.copy($rootScope.playBackPlayerData.playBackActionListData);
                $rootScope.playBackPlayerData.currentTime = 0;
                $rootScope.playBackPlayerData.actionCurrentTime = 0;
                $rootScope.playBackPlayerData.playAction = null;
                this.actionSwitchTab(this.startAction);
                $rootScope.playBackPlayerData.playBackActionList = [];
                utils.removeAllHighLightClassWhenFinish();
            },
            initData: function () {
                
                var loadSessionData = $rootScope.playbackActionListFromServer.shift();
                
                $rootScope.playBackPlayerData.isPlaying = false;                
                $rootScope.playBackPlayerData.isPause = false;
                this.playBackInitialMainResult = angular.copy(loadSessionData.dataCalculate);
                this.playBackInitialData = angular.copy(loadSessionData.data);
                var firstAction = $rootScope.playbackActionListFromServer[0];
                if (firstAction.action_name == 'TAB_CLICK') {
                    this.startAction = $rootScope.playbackActionListFromServer.shift();
                } else {
                    this.startAction = {
                        action_description: "Click tab {{name}}",
                        action_name: "TAB_CLICK",
                        data: { Name: "Main" },
                        start_time: 2000,
                        dataCalculate: this.playBackInitialMainResult
                    }
                }
                this.reloadSession();
                

                var self = this;
                $rootScope.playBackPlayerData.playBackActionListData = [];
                // Update each session
                var count = 1;
                var new_broken_age = 0, old_broken_age = 0;
                var startTime = 0;
                angular.forEach($rootScope.playbackActionListFromServer, function (action) {
                    // calculate broken age
                    old_broken_age = angular.copy($rootScope.MainResult.broken_age);
                    new_broken_age = angular.copy($rootScope.MainResult.broken_age);
                    //console.log('X1');
                    try {
                        if (angular.isDefined(action.dataCalculate) && angular.isDefined(action.dataCalculate.broken_age) && action.dataCalculate != null && action.dataCalculate.broken_age != null)
                            new_broken_age = action.dataCalculate.broken_age;
                    } catch (ex) {}
                    //console.log('X2');
                    var playAction = angular.copy(action);
                    playAction.new_broken_age = new_broken_age;
                    playAction.old_broken_age = old_broken_age;
                    if (playAction.start_time > 8000) {
                        startTime = startTime + 8000;
                    } else {
                        startTime = startTime + playAction.start_time;
                    }
                    if (playAction.action_name == 'TAB_CLICK') {
                        switch (playAction.data.Name) {
                            case 'Main':
                                playAction.action_description = 'Switch to main tab';
                                break;
                            case 'IncomeExpenses':
                                playAction.action_description = 'Switch to income and expense tab';
                                break;
                            case 'LiquidIlliquidAsset':
                                playAction.action_description = 'Switch to liquid asset tab';
                                break;
                            case 'IlliquidAsset':
                                playAction.action_description = 'Switch to illiquid asset tab';
                                break;
                            case 'RankingDreams':
                                playAction.action_description = 'Switch ranking dream main tab';
                                break;
                        }
                    }
                    //startTime = startTime + 4000;
                    playAction.duration = 2500;
                    
                    playAction.start_time = angular.copy(startTime);
                    $rootScope.playBackPlayerData.playBackActionListData[$rootScope.playBackPlayerData.playBackActionListData.length] = playAction;
                    playAction.order = angular.copy(count);
                    count++;
                    
                });
                var lastAction = $rootScope.playBackPlayerData.playBackActionListData[$rootScope.playBackPlayerData.playBackActionListData.length - 1];
                $rootScope.playBackPlayerData.timeLength = lastAction.start_time + lastAction.duration;

                this.renderPlan();
                $rootScope.apply();

            },
            
            swithToMainTab: function () {
                ultilService.showWarningMessage('switch to main tab to start play back');
                $state.go('main');
            },
            
            renderPlan: function () {
                this.renderTimeLine();
                deleteAllArrowButton(oCanvas.canvasList[0]);
                this.renderInputComponentOfMainTab();
            },

            renderTimeLine: function () {
                $rootScope.RemoveAllDreamAndEventInTimeline();
                reRenderTimelineObject(timelineService.timelineObj.canvas, $rootScope);
                $rootScope.InsertDreamAndLifeEvent();
            },
           
            renderInputComponentOfMainTab: function () {
                // Trail - Top - Bottom Value
                $timeout(function () {
                    $rootScope.MCTopValue.selected = ($rootScope.PersonaPlan.mc_top_value * 100) + '%';
                    $rootScope.MCBottomValue.selected = ($rootScope.PersonaPlan.mc_bottom_value * 100) + '%';
                }, 500);
                
                
            },
           
            startPlay: function () {
                
                if ($rootScope.playBackPlayerData.isFinishPlayBack) {
                    this.reloadSession();
                }
                $rootScope.playBackPlayerData.isForward = true;
                $rootScope.playBackPlayerData.isBackward = false;
                $rootScope.playBackPlayerData.isPlaying = true;
                $rootScope.playBackPlayerData.isPause == false
                this.createPlayInterval();
            },

            stopPlayback: function () {
                var self = this;
                $timeout(function () {
                    $rootScope.playBackPlayerData.isPlaying = false;
                    $rootScope.playBackPlayerData.isPause = false;
                    $rootScope.playBackPlayerData.isPlayBack = false;
                    $rootScope.playBackPlayerData.isFinishPlayBack = true;
                    $interval.cancel($rootScope.playBackPlayerData.playInterval);
                    $('#playback').css({ 'z-index': '10000', 'display': 'none' });
                    $('.overlay').css({ 'height': $(document).height(), 'z-index': '-1' });
                    $('.modal').modal('hide');
                    $rootScope.PersonaPlan = angular.copy(self.orignialData);
                    $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                    $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                    $rootScope.playBackPlayerData.data = null;
                    self.renderPlan();
                    $rootScope.OrderCanvasItem();
                    $state.go('main');
                }, 1500);
            },

            changeSpeed: function () {
                $rootScope.playBackPlayerData.forwardSpeed = $rootScope.playBackPlayerData.forwardSpeed * 2;
                if ($rootScope.playBackPlayerData.forwardSpeed > 8) {
                    $rootScope.playBackPlayerData.forwardSpeed = 1;
                }
                ultilService.showSuccessMessage(ultilService.translate('Play at speed {{speed}}x',{speed: $rootScope.playBackPlayerData.forwardSpeed}));
                if ($rootScope.playBackPlayerData.isPlaying) {
                    $interval.cancel($rootScope.playBackPlayerData.playInterval);
                    $rootScope.playBackPlayerData.currentTime = angular.copy($rootScope.playBackPlayerData.actionCurrentTime);
                    if ($rootScope.playBackPlayerData.isForward) {
                        this.createPlayInterval();
                    } else {
                        this.createPlayBackwardInterval();
                    }
                }
            },

            playBack: function () {
                $rootScope.playBackPlayerData.isBackward = true;
                $rootScope.playBackPlayerData.isPlaying = true;
                $rootScope.playBackPlayerData.isForward = false;
                ultilService.showSuccessMessage(ultilService.translate('Play backward at speed {{speed}}x', {speed: $rootScope.playBackPlayerData.forwardSpeed }));
                //if ($rootScope.playBackPlayerData.isPlaying) {
                $interval.cancel($rootScope.playBackPlayerData.playInterval);
                $rootScope.playBackPlayerData.currentTime = angular.copy($rootScope.playBackPlayerData.actionCurrentTime + 2000);
                //}
                var self = this;
                $timeout(function () {
                    self.createPlayBackwardInterval();
                }, 2000);
            },

            pausePlayBackward: function () {
                $rootScope.playBackPlayerData.isPause = true;
                $rootScope.playBackPlayerData.isPlaying = false;
                $interval.cancel($rootScope.playBackPlayerData.playInterval);
            },

            pausePlayForward: function () {
                $rootScope.playBackPlayerData.isPause = true;
                $rootScope.playBackPlayerData.isPlaying = false;
                $interval.cancel($rootScope.playBackPlayerData.playInterval);
            },

            createPlayBackwardInterval: function () {
                var self = this;
                $rootScope.playBackPlayerData.playInterval = $interval(function () {
                    $rootScope.playBackPlayerData.currentTime -= ($rootScope.playBackPlayerData.actionSpeed * $rootScope.playBackPlayerData.forwardSpeed);
                    if ($rootScope.playBackPlayerData.playBackActionList.length == 0 && $rootScope.playBackPlayerData.playAction == null) {
                        $rootScope.playBackPlayerData.isPlaying = false;
                        $rootScope.playBackPlayerData.isPause = true;
                        if ($rootScope.playBackPlayerData.playAction == null) {
                            $interval.cancel($rootScope.playBackPlayerData.playInterval);
                            $timeout(function () {
                                self.actionSwitchTab(self.startAction);
                                ultilService.showSuccessMessage('Finished play backward action');
                                $rootScope.playBackPlayerData.isFinishPlayBack = true;
                                $rootScope.playBackPlayerData.actionCurrentTime = 0;
                            }, 3000);
                        }
                    }
                    if ($rootScope.playBackPlayerData.playAction == null) {
                        $rootScope.playBackPlayerData.isFinishPlayBack = false;
                        $rootScope.playBackPlayerData.playAction = $rootScope.playBackPlayerData.playBackActionList.pop();
                    }
                    var duration = 1000;
                    try {
                        if (angular.isDefined($rootScope.playBackPlayerData.playAction.duration)) duration = $rootScope.playBackPlayerData.playAction.duration;
                    } catch (e1) { }
                    if ($rootScope.playBackPlayerData.playAction != null && $rootScope.playBackPlayerData.playAction.start_time >= $rootScope.playBackPlayerData.currentTime) {
                        if ($rootScope.playBackPlayerData.isPlayAction == false) {
                            $rootScope.playBackPlayerData.actionCurrentTime = $rootScope.playBackPlayerData.playAction.start_time;
                            self.performBackwardAction($rootScope.playBackPlayerData.playAction);
                            $rootScope.playBackPlayerData.isPlayAction = true;
                            
                            $timeout(function () {
                                $rootScope.playBackPlayerData.playAction = null;
                                $rootScope.playBackPlayerData.isPlayAction = false;
                        
                            }, duration);
                        }
                    }
                }, $rootScope.playBackPlayerData.actionSpeed / $rootScope.playBackPlayerData.forwardSpeed);
            },

            createPlayInterval: function () {
                var self = this;
                $rootScope.playBackPlayerData.playInterval = $interval(function () {
                    $rootScope.playBackPlayerData.currentTime += ($rootScope.playBackPlayerData.actionSpeed * $rootScope.playBackPlayerData.forwardSpeed);                    
                    if ($rootScope.playBackPlayerData.playForwardActionList.length == 0 && $rootScope.playBackPlayerData.playAction == null) {
                        
                        $rootScope.playBackPlayerData.isPlaying = false;
                        $rootScope.playBackPlayerData.isPause = true;
                        if ($rootScope.playBackPlayerData.playAction == null) {
                            $interval.cancel($rootScope.playBackPlayerData.playInterval);
                            $timeout(function () {
                                ultilService.showSuccessMessage('Finished playback action');
                                $rootScope.playBackPlayerData.actionCurrentTime = angular.copy($rootScope.playBackPlayerData.timeLength);
                                $rootScope.playBackPlayerData.isFinishPlayBack = true;
                            }, 3000);
                        }
                        
                    }
                    if ($rootScope.playBackPlayerData.playAction == null) {
                        $rootScope.playBackPlayerData.isFinishPlayBack = false;
                        $rootScope.playBackPlayerData.playAction = $rootScope.playBackPlayerData.playForwardActionList.shift();
                    }
                    
                    if ($rootScope.playBackPlayerData.playAction != null && $rootScope.playBackPlayerData.playAction.start_time <= $rootScope.playBackPlayerData.currentTime) {
                        if ($rootScope.playBackPlayerData.isPlayAction == false) {
                            $rootScope.playBackPlayerData.actionCurrentTime = angular.copy($rootScope.playBackPlayerData.playAction.start_time);
                            self.performForwardAction($rootScope.playBackPlayerData.playAction);
                            $rootScope.playBackPlayerData.isPlayAction = true;
                            var duration = 1000;
                            try {
                                if (angular.isDefined($rootScope.playBackPlayerData.playAction.duration)) duration = $rootScope.playBackPlayerData.playAction.duration;
                            } catch (e1) { }
                            $timeout(function () {
                                $rootScope.playBackPlayerData.playAction = null;
                                $rootScope.playBackPlayerData.isPlayAction = false;
                            }, duration);
                        }
                    }
                    
                }, $rootScope.playBackPlayerData.actionSpeed / $rootScope.playBackPlayerData.forwardSpeed);
            },

            performBackwardAction: function (playAction) {
                try {                    
                    $('.modal-backdrop').hide();
                    try {
                        var new_broken_age = playAction.dataCalculate.broken_age != null ? playAction.dataCalculate.broken_age : (playAction.dataCalculate.basic != null ? playAction.dataCalculate.basic.broken_age : $rootScope.MainResult.broken_age);
                        $rootScope.MainResult.broken_age = new_broken_age
                        
                        var project_value = playAction.dataCalculate.project_value != null ? playAction.dataCalculate.project_value : (playAction.dataCalculate.basic != null ? playAction.dataCalculate.basic.project_value : $rootScope.MainResult.project_value);
                        var saving_at_retirement = playAction.dataCalculate.saving_at_retirement != null ? playAction.dataCalculate.saving_at_retirement : (playAction.dataCalculate.basic != null ? playAction.dataCalculate.basic.saving_at_retirement : $rootScope.MainResult.saving_at_retirement);

                        $rootScope.MainResult.project_value = angular.copy(project_value);
                        $rootScope.MainResult.saving_at_retirement = angular.copy(saving_at_retirement);

                    } catch (ex1) { }
                    if (playAction.dataCalculate != null) $rootScope.playBackPlayerData.data = null;
                    
                    //if (playAction.action_name != 'TAB_CLICK') {
                        var action_description = playAction.action_description;
                        ultilService.showWarningMessage(ultilService.translate("Play backward: {{order}}. {{action_description}}", { order: playAction.order, action_description: ultilService.translate(action_description) }));
                    //}
                    
                    $rootScope.playBackPlayerData.playForwardActionList.push(playAction);
                    switch (playAction.action_name) {
                        case 'TAB_CLICK':
                            this.backwardActionSwitchTab(playAction);
                            break;
                        case "CHANGE_NUMBER_TRIALS":
                            this.backwardActionChangeTrialNumber(playAction);
                            break;
                        case "CHANGE_MC_TOP_VALUE":
                            this.backwardActionChangeTopValue(playAction);
                            break;
                        case "CHANGE_MC_TOP_VALUE":
                            this.backwardActionChangeTopValue(playAction);
                            break;
                        case "CHANGE_MC_BOTTOM_VALUE":
                            this.backwardActionChangeBottomValue(playAction);
                            break;
                        case "CHANGE_INFLATION":
                            this.backwardActionChangeInflaction(playAction);
                            break;
                        case "CHANGE_SALARY_EVOLUTION":
                            this.backwardActionChangeSalaryEvolution(playAction);
                            break;
                        case "CHANGE_EXPENSE_TODAY":
                            this.backwardActionChangeExpenseToday(playAction);
                            break;
                        case "CHANGE_INCOME_TODAY":
                            this.backwardActionChangeIncomeToday(playAction);
                            break;
                        case "CHANGE_CURRENT_SAVING":
                            this.backwardActionChangeCurrentSaving(playAction);
                            break;
                        case "CHANGE_EXPENSE_AT_RETIREMENT":
                            this.backwardActionChangeExpenseAtRetirement(playAction);
                            break;
                        case "CHANGE_RISK_RETURN":
                            this.backwardActionRiskAndRiskReturnValue(playAction);
                            break;
                        case "SIMULATE_RANKING_DREAM":
                            this.backwardActionSimulateRankingDream(playAction);
                            break;
                        case "CHANGE_RETIREMENT_AGE":
                            this.backwardActionChangeRetirementAge(playAction);                                                       
                            break;
                        case "CHANGE_SOCIAL_SECURITY_AGE":
                            this.backwardActionChangeSocialSecurityAge(playAction);
                            break;
                        case "MOVE_DREAM_PURCHAGE":
                            this.backwardActionMoveDreamPurchage(playAction);
                            break;
                        case "MOVE_LIFEEVENT_PURCHAGE":
                            this.backwardActionMoveLifeEventPurchage(playAction);
                            break;
                        case "ADD_DREAM":
                            this.backwardActionAddDream(playAction);
                            break;
                        case "ADD_LIFEEVENT":
                            this.backwardActionAddLifeEventNew(playAction);
                            break;
                        case "EDIT_DREAM":
                            this.backwardActionEditDream(playAction);
                            break;
                        case "EDIT_LIFEEVENT":
                            this.backwardActionEditLifeEventNew(playAction);
                            break;
                        case "CHANGE_START_AGE":
                            this.backwardActionChangeStartAge(playAction);
                            break;
                        case "NEW_SCENARIO_BUTTON":
                            this.backwardActionChangePersonaPlanToNew(playAction);
                            break;
                        case "CURRENT_SCENARIO_BUTTON":
                            this.backwardActionChangePersonaPlanToCurrent(playAction);
                            break;
                        case "RESET_PLAN_BUTTON":
                            this.backwardActionResetPlan(playAction);
                            break;
                        case "REMOVE_LIFEEVENT":
                            this.backwardActionRemoveLifEvent(playAction);
                            break;
                        case "REMOVE_DREAM":
                            this.backwardActionRemoveDream(playAction);
                            break;
                        case "MANAGE_SOLUTION":
                            this.backwardActionManageSolution(playAction);
                            break;
                        case "CLOSE_SOLUTION":
                            this.backwardActionCloseSolution(playAction);
                            break;
                        case "DELETE_SOLUTION":
                            this.backwardActionDeleteSolution(playAction);
                            break;
                        case "RENAME_SOLUTION":
                            this.backwardActionRenameSolution(playAction);
                            break;
                        case "SAVE_SOLUTION":
                            this.backwardActionSaveSolution(playAction);
                            break; 
                        case "LOAD_SOLUTION":
                            this.backwardActionLoadSolution(playAction);
                            break;
                        case "MANAGE_SCENARIO":
                            this.backwardActionManageScenario(playAction);
                            break;
                        case "NEW_SCENARIO":
                            this.backwardActionNewScenario(playAction);
                            break;
                        case "DUPLICATE_SCENARIO":
                            this.backwardActionDuplicateScenario(playAction);
                            break; 
                        case "RENAME_SCENARIO":
                            this.backwardActionRenameScenario(playAction);
                            break;
                        case "MAKE_CURRENT_SCENARIO":
                            this.backwardActionMakeCurrentScenario(playAction);
                            break;
                        case "MAKE_NEW_SCENARIO":
                            this.backwardActionMakeNewScenario(playAction);
                            break;
                        case "DELETE_SCENARIO":
                            this.backwardActionDeleteScenario(playAction);
                            break;
                        case "CLOSE_SCENARIOS":
                            this.backwardActionCloseScenario(playAction);
                            break;
                        case "CHANGE_CURRENCY_CODE":
                            this.backwardActionChangeCurrency(playAction);
                            break;
                    };
                } catch (ex) {
                    
                }
                $('.overlay').css({ 'height': $(document).height(), 'z-index': '9999' });
            },

            performForwardAction: function (playAction) {
                try {
                    $('.modal-backdrop').hide();
                    try {
                        var new_broken_age = playAction.dataCalculate.broken_age != null ? playAction.dataCalculate.broken_age : (playAction.dataCalculate.basic != null ? playAction.dataCalculate.basic.broken_age : $rootScope.MainResult.broken_age);
                        
                        $rootScope.old_broken_age = $rootScope.MainResult.broken_age;
                        $rootScope.MainResult.broken_age = new_broken_age;
                        
                        var project_value = playAction.dataCalculate.project_value != null ? playAction.dataCalculate.project_value : (playAction.dataCalculate.basic != null ? playAction.dataCalculate.basic.project_value : $rootScope.MainResult.project_value);
                        var saving_at_retirement = playAction.dataCalculate.saving_at_retirement != null ? playAction.dataCalculate.saving_at_retirement : (playAction.dataCalculate.basic != null ? playAction.dataCalculate.basic.saving_at_retirement : $rootScope.MainResult.saving_at_retirement);
                       
                        $rootScope.MainResult.project_value = angular.copy(project_value);
                        $rootScope.MainResult.saving_at_retirement = angular.copy(saving_at_retirement);                       
                    } catch (ex1) {}
                                       
                    $rootScope.playBackPlayerData.data = null;
                    //if (playAction.action_name != 'TAB_CLICK') {
                        var action_description = playAction.action_description;
                        ultilService.showWarningMessage(ultilService.translate("Play forward: {{order}}. {{action_description}}", { order: playAction.order, action_description: ultilService.translate(action_description) }));
                    //}
                    //ultilService.showWarningMessage(playAction.order +  ". " + playAction.action_description);
                    $rootScope.playBackPlayerData.playBackActionList.push(playAction);
                    switch (playAction.action_name) {
                        case 'TAB_CLICK':
                            this.actionSwitchTab(playAction);
                            break;
                        case "CHANGE_NUMBER_TRIALS":
                            this.actionChangeTrialNumber(playAction);
                            break;
                        case "CHANGE_MC_TOP_VALUE":
                            this.actionChangeTopValue(playAction);
                            break;
                        case "CHANGE_MC_BOTTOM_VALUE":
                            this.actionChangeBottomValue(playAction);
                            break;
                        case "CHANGE_INFLATION":
                            this.actionChangeInflaction(playAction);
                            break;
                        case "CHANGE_SALARY_EVOLUTION":
                            this.actionChangeSalaryEvolution(playAction);
                            break;
                        case "CHANGE_EXPENSE_TODAY":
                            this.actionChangeExpenseToday(playAction);
                            break;
                        case "CHANGE_INCOME_TODAY":
                            this.actionChangeIncomeToday(playAction);
                            break;
                        case "CHANGE_CURRENT_SAVING":
                            this.actionChangeCurrentSaving(playAction);
                            break;
                        case "CHANGE_EXPENSE_AT_RETIREMENT":
                            this.actionChangeExpenseAtRetirement(playAction);
                            break;
                        case "CHANGE_RISK_RETURN":
                            this.actionRiskAndRiskReturnValue(playAction);
                            break;
                        case "SIMULATE_RANKING_DREAM":
                            this.actionSimulateRankingDream(playAction);
                            break;
                        case "CHANGE_RETIREMENT_AGE":
                            this.actionChangeRetirementAge(playAction);
                            break;
                        case "CHANGE_SOCIAL_SECURITY_AGE":
                            this.actionChangeSocialSecurityAge(playAction);
                            break;
                        case "MOVE_DREAM_PURCHAGE":
                            this.actionMoveDreamPurchage(playAction);
                            break;
                        case "MOVE_LIFEEVENT_PURCHAGE":
                            this.actionMoveLifeEventPurchage(playAction);
                            break;
                        case "ADD_DREAM":
                            this.actionAddDream(playAction);
                            break;
                        case "ADD_LIFEEVENT":
                            this.actionAddLifeEventNew(playAction);
                            break;
                        case "CHANGE_START_AGE":
                            this.actionChangeStartAge(playAction);
                            break;
                        case "EDIT_DREAM":
                            this.actionEditDream(playAction);
                            break;
                        case "EDIT_LIFEEVENT":
                            this.actionEditLifeEventNew(playAction);
                            break;
                        case "NEW_SCENARIO_BUTTON":
                            this.actionChangePersonaPlanToNew(playAction);
                            break;
                        case "CURRENT_SCENARIO_BUTTON":
                            this.actionChangePersonaPlanToCurrent(playAction);
                            break;
                        case "RESET_PLAN_BUTTON":
                            this.actionResetPlan(playAction);
                            break;
                        case "REMOVE_LIFEEVENT":
                            this.actionRemoveLifEvent(playAction);
                            break;
                        case "REMOVE_DREAM":
                            this.actionRemoveDream(playAction);
                            break;
                        case "MANAGE_SOLUTION":
                            this.actionManageSolution(playAction);
                            break;
                        case "CLOSE_SOLUTION" :
                            this.actionCloseSolution(playAction);
                            break;
                        case "DELETE_SOLUTION":
                            this.actionDeleteSolution(playAction);
                            break;
                        case "RENAME_SOLUTION":
                            this.actionRenameSolution(playAction);
                            break;
                        case "SAVE_SOLUTION":
                            this.actionSaveSolution(playAction);
                            break;
                        case "LOAD_SOLUTION":
                            this.actionLoadSolution(playAction);
                            break;
                        case "MANAGE_SCENARIO":
                            this.actionManageScenario(playAction);
                            break;
                        case "NEW_SCENARIO":
                            this.actionNewScenario(playAction);
                            break;
                        case "DUPLICATE_SCENARIO":
                            this.actionDuplicateScenario(playAction);
                            break;
                        case "RENAME_SCENARIO":
                            this.actionRenameScenario(playAction);
                            break;
                        case "MAKE_CURRENT_SCENARIO":
                            this.actionMakeCurrentScenario(playAction);
                            break;
                        case "MAKE_NEW_SCENARIO":
                            this.actionMakeNewScenario(playAction);
                            break;
                        case "DELETE_SCENARIO":
                            this.actionDeleteScenario(playAction);
                            break;
                        case "CLOSE_SCENARIOS":
                            this.actionCloseScenario(playAction);
                            break;
                        case "CHANGE_CURRENCY_CODE":
                            this.actionChangeCurrency(playAction);
                            break;
                    };
                } catch (ex) { console.log(ex); }
                $('.overlay').css({ 'height': $(document).height(), 'z-index': '9999' });
            }, 
            actionSwitchTab: function (playAction) {
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                //var action_description = playAction.action_description;
                
                playAction.oldState = $state.current.name;
                switch (playAction.data.Name) {
                    case 'Main':
                        //action_description = 'Switch to main tab';
                        $state.go('playback_main');
                        break;
                    case 'IncomeExpenses':
                        //action_description = 'Switch to income and expense tab';
                        $state.go('playback_income_expenses');
                        break;
                    case 'LiquidIlliquidAsset':
                        //action_description = 'Switch to liquid asset tab';
                        $state.go('playback_liquid_illiquid_asset');
                        break;
                    case 'IlliquidAsset':
                        //action_description = 'Switch to illiquid asset tab';
                        $state.go('playback_illiquid_asset');
                        break;
                    case 'RankingDreams':
                        //action_description = 'Switch ranking dream main tab';
                        $state.go('playback_ranking_dreams');
                        break;
                }
                //playAction.action_description = action_description;
                //ultilService.showWarningMessage(ultilService.translate("Play backward: {{order}}. {{action_description}}", { order: playAction.order, action_description:action_description = ultilService.translate(action_description) }));
            },

            backwardActionSwitchTab: function (playAction) {               
                /*
                var self = this;
                $timeout(function () {
                    self.reloadPlaybackCurrentStateWithCalculateData();
                }, 1500);
                */
                if ($rootScope.playBackPlayerData.playBackActionList.length > 0) {
                    var actionData = $rootScope.playBackPlayerData.playBackActionList[$rootScope.playBackPlayerData.playBackActionList.length - 1];
                    $rootScope.playBackPlayerData.data = actionData.dataCalculate;
                    $state.go(playAction.oldState);
                } else {
                    this.reloadSession();
                }
                
            },
            // Income today
            actionChangeIncomeToday: function (playAction) {
                var fromvalue = this.parseStringToFloat(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToFloat(playAction.data[0].tovalue);
                
                $rootScope.currentScope.incomeDataProgressBar.maxValue = fromvalue;
                var numberStep = parseInt(playAction.duration / 100);
                var valueChange = tovalue - fromvalue;
                var count = 1;
                var self = this;
                utils.addHighLightClassforProgressbar('incomeExpensebar');
                for (var i = 1; i <= numberStep; i++) {
                    $timeout(function () {
                        var newValue = fromvalue + (valueChange * parseFloat(count / numberStep));
                        if (newValue > tovalue) {
                            newValue = tovalue;
                            
                        }
                        $rootScope.currentScope.incomeDataProgressBar.maxValue = newValue;
                        $rootScope.PersonaPlan.income_today = newValue;
                        count++;
                        if (count >= numberStep) {
                            self.reloadCurrentStateWithCalculateData(playAction);
                        }
                    }, (100 / $rootScope.playBackPlayerData.forwardSpeed) * i);
                }
            },
            
            backwardActionChangeIncomeToday: function (playAction) {
                var fromvalue = this.parseStringToFloat(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToFloat(playAction.data[0].tovalue);

                $rootScope.currentScope.incomeDataProgressBar.maxValue = playAction.newValue;
                var numberStep = parseInt(playAction.duration / 100);
                var valueChange = fromvalue - tovalue;
                var count = 1;
                var self = this;
                utils.addHighLightClassforProgressbar('incomeExpensebar');
                for (var i = 1; i <= numberStep; i++) {
                    $timeout(function () {
                        var newValue = tovalue + (valueChange * parseFloat(count / numberStep));
                        $rootScope.currentScope.incomeDataProgressBar.maxValue = newValue;
                        $rootScope.PersonaPlan.income_today = newValue;
                        count++;
                        if (count >= numberStep) {
                            $rootScope.currentScope.incomeDataProgressBar.maxValue = fromvalue;
                            $rootScope.PersonaPlan.income_today = newValue;
                            self.reloadPlaybackCurrentStateWithCalculateData();
                        }
                    }, (100 / $rootScope.playBackPlayerData.forwardSpeed) * i);
                }
            },

            // Expense today
            actionChangeExpenseToday: function (playAction) {
                var fromvalue = this.parseStringToFloat(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToFloat(playAction.data[0].tovalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
                $rootScope.currentScope.incomeDataProgressBar.modelData = fromvalue;

                var numberStep = parseInt(playAction.duration / 100);
                var valueChange = tovalue - fromvalue;
                var count = 1;
                var self = this;
                utils.addHighLightClassforProgressbar('incomeExpensebar');
                for (var i = 1; i <= numberStep; i++) {
                    $timeout(function () {
                        var newValue = fromvalue + (valueChange * parseFloat(count / numberStep));
                        if (newValue > tovalue) {
                            newValue = tovalue;
                            
                        }
                        if (angular.isDefined($rootScope.currentScope.incomeDataProgressBar.modelData)) {
                            $rootScope.currentScope.incomeDataProgressBar.modelData = newValue;
                            $rootScope.PersonaPlan.expense_today = newValue;
                        }
                        
                        count++;
                        if (count >= numberStep) {
                            $rootScope.PersonaPlan.expense_today = newValue;
                            self.reloadCurrentStateWithCalculateData(playAction);
                            self.reloadPlaybackCurrentStateWithCalculateData();
                        }
                    }, (100 / $rootScope.playBackPlayerData.forwardSpeed) * i);
                }
            },

            backwardActionChangeExpenseToday: function (playAction) {
                var fromvalue = this.parseStringToFloat(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToFloat(playAction.data[0].tovalue);
                $rootScope.currentScope.incomeDataProgressBar.modelData = tovalue;
                var numberStep = parseInt(playAction.duration / 100);
                var valueChange = fromvalue - tovalue
                var count = 1;
                var self = this;
                utils.addHighLightClassforProgressbar('incomeExpensebar');
                for (var i = 1; i <= numberStep; i++) {
                    $timeout(function () {
                        var newValue = tovalue + (valueChange * parseFloat(count / numberStep));
                        $rootScope.currentScope.incomeDataProgressBar.modelData = newValue;
                        $rootScope.PersonaPlan.expense_today = newValue;
                        count++;
                        if (count >= numberStep) {
                            $rootScope.currentScope.incomeDataProgressBar.modelData = fromvalue;
                            $rootScope.PersonaPlan.expense_today = fromvalue;
                            self.reloadPlaybackCurrentStateWithCalculateData();
                        }
                    }, (100 / $rootScope.playBackPlayerData.forwardSpeed) * i);
                }
            },

            // Expense at retirement
            actionChangeExpenseAtRetirement: function (playAction) {
                var fromvalue = this.parseStringToFloat(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToFloat(playAction.data[0].tovalue);
                
                if (angular.isDefined($rootScope.currentScope.retirementDataProgressBar)) $rootScope.currentScope.retirementDataProgressBar.modelData = fromvalue;
                var numberStep = parseInt(playAction.duration / 100);
                var valueChange = tovalue - fromvalue;
                var count = 1;
                var self = this;
                utils.addHighLightClassforProgressbar('expenseAtRetirement');
                for (var i = 1; i <= numberStep; i++) {
                    $timeout(function () {
                        var newValue = fromvalue + (valueChange * parseFloat(count / numberStep));
                        if (newValue > tovalue) {
                            newValue = tovalue;
                            //self.reloadCurrentStateWithCalculateData(playAction);
                        }
                        if (angular.isDefined($rootScope.currentScope.retirementDataProgressBar)) {
                            $rootScope.currentScope.retirementDataProgressBar.modelData = newValue;
                            $rootScope.PersonaPlan.expense_at_retirement = newValue;
                        }
                            
                        count++;
                        if (count >= numberStep) {
                            $rootScope.currentScope.retirementDataProgressBar.modelData = newValue;
                            $rootScope.PersonaPlan.expense_at_retirement = newValue;
                            self.reloadPlaybackCurrentStateWithCalculateData();
                        }
                    }, (100 / $rootScope.playBackPlayerData.forwardSpeed) * i);
                }
            },

            backwardActionChangeExpenseAtRetirement: function (playAction) {
                var fromvalue = this.parseStringToFloat(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToFloat(playAction.data[0].tovalue);
                if (angular.isDefined($rootScope.currentScope.retirementDataProgressBar)) $rootScope.currentScope.retirementDataProgressBar.modelData = tovalue;
                var numberStep = parseInt(playAction.duration / 100);
                var valueChange = fromvalue - tovalue;
                var count = 1;
                var self = this;
                utils.addHighLightClassforProgressbar('expenseAtRetirement');
                for (var i = 1; i <= numberStep; i++) {
                    $timeout(function () {
                        var newValue = tovalue + (valueChange * parseFloat(count / numberStep));
                        $rootScope.currentScope.retirementDataProgressBar.modelData = newValue;
                        $rootScope.PersonaPlan.expense_at_retirement = newValue;
                        count++;
                        if (count >= numberStep) {
                            $rootScope.currentScope.retirementDataProgressBar.modelData = fromvalue;
                            $rootScope.PersonaPlan.expense_at_retirement = newValue;
                            self.reloadCurrentStateWithCalculateData(playAction);
                        }
                    }, (100 / $rootScope.playBackPlayerData.forwardSpeed) * i);
                }
            },
            
            // Current Saving
            actionChangeCurrentSaving: function (playAction) {
                var fromvalue = this.parseStringToFloat(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToFloat(playAction.data[0].tovalue);
                $timeout(function (){utils.addHighLightClassforDirectId('txt-currentSaving');},1);
                
                this.reloadCurrentStateWithCalculateData(playAction);
                $rootScope.PersonaPlan.current_saving = fromvalue;
                $timeout(function () {
                    
                    $rootScope.PersonaPlan.current_saving = tovalue;
                    utils.removeHighLightClassforDirectId('txt-currentSaving');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);
               
            },
            backwardActionChangeCurrentSaving: function (playAction) {
                var fromvalue = this.parseStringToFloat(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToFloat(playAction.data[0].tovalue);
                $timeout(function () { utils.addHighLightClassforDirectId('txt-currentSaving'); }, 1);
                $rootScope.PersonaPlan.current_saving = tovalue;
                var self = this;
                $timeout(function () {
                    $rootScope.PersonaPlan.current_saving = fromvalue;
                    utils.removeHighLightClassforDirectId('txt-currentSaving');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);
            },

            // Trial Number
            actionChangeTrialNumber: function (playAction) {
                var self = this;
                $timeout(function () { utils.addHighLightClassforDirectId('numberOfTrials'); }, 1);
                $rootScope.PersonaPlan.number_trials = parseInt(playAction.data[0].fromvalue);
                $timeout(function () {
                    $rootScope.PersonaPlan.number_trials = parseInt(playAction.data[0].tovalue);
                    self.reloadCurrentStateWithCalculateData(playAction);
                    utils.removeHighLightClassforDirectId('numberOfTrials');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);

            },
            backwardActionChangeTrialNumber: function (playAction) {
                var self = this;
                $timeout(function () { utils.addHighLightClassforDirectId('numberOfTrials'); }, 1);
                $rootScope.PersonaPlan.number_trials = parseInt(playAction.data[0].tovalue);
                $timeout(function () {
                    $rootScope.PersonaPlan.number_trials = parseInt(playAction.data[0].fromvalue);
                    self.reloadPlaybackCurrentStateWithCalculateData();
                    utils.removeHighLightClassforDirectId('numberOfTrials');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);
            },

            // Top Value
            actionChangeTopValue: function (playAction) {
                var self = this;
                $timeout(function () { utils.addHighLightClassforDirectId('MCTopValue'); }, 1);
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                fromvalue = (fromvalue * 100) + '%';
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                tovalue = (tovalue * 100) + '%';
                $rootScope.MCTopValue.selected = fromvalue
                $timeout(function () {
                    $rootScope.MCTopValue.selected = tovalue;
                    self.reloadCurrentStateWithCalculateData(playAction);
                    utils.removeHighLightClassforDirectId('MCTopValue');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);

            },
            backwardActionChangeTopValue: function (playAction) {
                var self = this;
                $timeout(function () { utils.addHighLightClassforDirectId('MCTopValue'); }, 1);
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                fromvalue = (fromvalue * 100) + '%';
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                tovalue = (tovalue * 100) + '%';
                $rootScope.MCTopValue.selected = tovalue
                $timeout(function () {
                    $rootScope.MCTopValue.selected = fromvalue;
                    self.reloadPlaybackCurrentStateWithCalculateData();
                    utils.removeHighLightClassforDirectId('MCTopValue');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);
            },

            // Bottom Value
            actionChangeBottomValue: function (playAction) {
                $timeout(function () { utils.addHighLightClassforDirectId('MCBottomValue'); }, 1);
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                fromvalue = (fromvalue * 100) + '%';
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                tovalue = (tovalue * 100) + '%';
                var self = this;
                $rootScope.MCBottomValue.selected = fromvalue;
                $timeout(function () {
                    $rootScope.MCBottomValue.selected = tovalue;
                    self.reloadCurrentStateWithCalculateData(playAction);
                    utils.removeHighLightClassforDirectId('MCBottomValue');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);

            },
            backwardActionChangeBottomValue: function (playAction) {
                $timeout(function () { utils.addHighLightClassforDirectId('MCBottomValue'); }, 1);
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                fromvalue = (fromvalue * 100) + '%';
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                tovalue = (tovalue * 100) + '%';
                $rootScope.MCBottomValue.selected = tovalue;
                var self = this;
                $timeout(function () {
                    $rootScope.MCBottomValue.selected = fromvalue;
                    self.reloadPlaybackCurrentStateWithCalculateData();
                    utils.removeHighLightClassforDirectId('MCBottomValue');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);
            },
            
            // Inflaction 
            actionChangeInflaction: function (playAction) {

                var self = this;
                $timeout(function () { utils.addHighLightClassforDirectId('inflaction'); }, 1);
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                fromvalue = fromvalue * 100;
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                tovalue = tovalue * 100;
                $rootScope.salaryEvolutionAndInflaction.inflaction = fromvalue;
                $timeout(function () {
                    $rootScope.salaryEvolutionAndInflaction.inflaction = tovalue;
                    self.reloadCurrentStateWithCalculateData(playAction);
                    utils.removeHighLightClassforDirectId('inflaction');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);
            },

            backwardActionChangeInflaction: function (playAction) {
                var self = this;
                $timeout(function () { utils.addHighLightClassforDirectId('inflaction'); }, 1);
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                fromvalue = fromvalue * 100;
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                tovalue = tovalue * 100;
                $rootScope.salaryEvolutionAndInflaction.inflaction = tovalue
                $timeout(function () {
                    $rootScope.salaryEvolutionAndInflaction.inflaction = fromvalue;
                    self.reloadPlaybackCurrentStateWithCalculateData();
                    utils.removeHighLightClassforDirectId('inflaction');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);
            },

            // Salary evolution
            actionChangeSalaryEvolution: function (playAction) {
                $timeout(function () { utils.addHighLightClassforDirectId('salaryEvolution'); }, 1);
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                var self = this;
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                fromvalue = fromvalue * 100;
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                tovalue = tovalue * 100;
                $rootScope.salaryEvolutionAndInflaction.salaryEvolution = fromvalue;
                $timeout(function () {
                    $rootScope.salaryEvolutionAndInflaction.salaryEvolution = tovalue;
                    self.reloadCurrentStateWithCalculateData(playAction);
                    utils.removeHighLightClassforDirectId('salaryEvolution');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);
            },

            backwardActionChangeSalaryEvolution: function (playAction) {
                $timeout(function () { utils.addHighLightClassforDirectId('salaryEvolution'); }, 1);
                var self = this;
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                fromvalue = fromvalue * 100;
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                tovalue = tovalue * 100;
                $rootScope.salaryEvolutionAndInflaction.salaryEvolution = tovalue
                $timeout(function () {
                    $rootScope.salaryEvolutionAndInflaction.salaryEvolution = fromvalue;
                    self.reloadPlaybackCurrentStateWithCalculateData();
                    utils.removeHighLightClassforDirectId('salaryEvolution');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);
            },

            
            // Risk and risk return
            actionRiskAndRiskReturnValue: function (playAction) {
                $timeout(function () { utils.addHighLightClassforDirectId('gauge_chart'); }, 1);
                $timeout(function () { utils.addHighLightClassforDirectId('liquid_gauge_chart'); }, 1);
                var self = this;
                var risk = {
                    fromvalue: this.parseStringToFloat(playAction.data[1].fromvalue) * 100,
                    tovalue: this.parseStringToFloat(playAction.data[1].tovalue) * 100
                };
                var riskReturn = {
                    fromvalue: this.parseStringToFloat(playAction.data[0].fromvalue) * 100,
                    tovalue: this.parseStringToFloat(playAction.data[0].tovalue) * 100
                };
                if (angular.isDefined($rootScope.currentScope.rickValue)) $rootScope.currentScope.rickValue = risk.fromvalue;
                if (angular.isDefined($rootScope.currentScope.rickReturn)) $rootScope.currentScope.rickReturn = riskReturn.fromvalue;
                $timeout(function () {
                    if (angular.isDefined($rootScope.currentScope.rickValue)) $rootScope.currentScope.rickValue = risk.tovalue;
                    if (angular.isDefined($rootScope.currentScope.rickReturn)) $rootScope.currentScope.rickReturn = riskReturn.tovalue;
                    if (angular.isDefined($rootScope.currentScope.isChangeRickReturn)) $rootScope.currentScope.isChangeRickReturn = true;
                    $rootScope.PersonaPlan.risk_return = riskReturn.tovalue / 100;
                    $rootScope.PersonaPlan.volatility = risk.tovalue / 100;
                    self.reloadCurrentStateWithCalculateData(playAction);
                    utils.removeHighLightClassforDirectId('gauge_chart');
                    utils.removeHighLightClassforDirectId('liquid_gauge_chart');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);

            },
            backwardActionRiskAndRiskReturnValue: function (playAction) {
                $timeout(function () { utils.addHighLightClassforDirectId('gauge_chart'); }, 1);
                $timeout(function () { utils.addHighLightClassforDirectId('liquid_gauge_chart'); }, 1);
                var self = this;
                var risk = {
                    fromvalue: this.parseStringToFloat(playAction.data[1].fromvalue) * 100,
                    tovalue: this.parseStringToFloat(playAction.data[1].tovalue) * 100
                };
                var riskReturn = {
                    fromvalue: this.parseStringToFloat(playAction.data[0].fromvalue) * 100,
                    tovalue: this.parseStringToFloat(playAction.data[0].tovalue) * 100
                };
                if (angular.isDefined($rootScope.currentScope.rickValue)) $rootScope.currentScope.rickValue = risk.tovalue;
                if (angular.isDefined($rootScope.currentScope.rickReturn)) $rootScope.currentScope.rickReturn = riskReturn.tovalue;
                if (angular.isDefined($rootScope.currentScope.isChangeRickReturn)) $rootScope.currentScope.isChangeRickReturn = true;
                $timeout(function () {
                    if (angular.isDefined($rootScope.currentScope.rickValue)) $rootScope.currentScope.rickValue = risk.fromvalue;
                    if (angular.isDefined($rootScope.currentScope.rickReturn)) $rootScope.currentScope.rickReturn = riskReturn.fromvalue;
                    $rootScope.PersonaPlan.risk_return = risk.fromvalue / 100;
                    $rootScope.PersonaPlan.volatility = riskReturn.fromvalue / 100;
                    self.reloadPlaybackCurrentStateWithCalculateData();
                    utils.removeHighLightClassforDirectId('gauge_chart');
                    utils.removeHighLightClassforDirectId('liquid_gauge_chart');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);
            },

            // Add new dream
            backwardActionAddDream: function (playAction) {
                $rootScope.actionRemoveDreamEvent(playAction.data);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },
            actionAddDream: function (playAction) {                
                playAction.data.type = 'dream';
                playAction.data.newValue = playAction.data;
                $rootScope.PersonaPlan.dreams.push(playAction.data.newValue);
                $rootScope.addDreamToPlayBack(playAction.data);
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                var self = this;
                $timeout(function () {
                    self.reloadCurrentStateWithCalculateData(playAction);
                }, 500);
            },

            // Remove Dream Event
            actionRemoveDream: function (playAction) {                
                playAction.data.newValue = playAction.data;
                angular.forEach($rootScope.DreamTypes, function (item) {
                    if (item.id == playAction.data.dream_type_id) {
                        playAction.dream_type = angular.copy(item);
                        playAction.data.newValue.dream_type = angular.copy(item);
                    }
                });
                playAction.data.type = 'dream';
                $rootScope.actionRemoveDreamEvent(playAction.data);
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionRemoveDream: function (playAction) {                
                // Add new Dream event
                $rootScope.addDreamToPlayBack(playAction.data);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },

            // Add new life event
            actionAddLifeEventNew: function (playAction) {
                playAction.data.type = 'lifeevent';
                playAction.data.newValue = playAction.data;
                $rootScope.addLifeEventToPlayBack(playAction.data);
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                var self = this;
                $timeout(function () {
                    self.reloadCurrentStateWithCalculateData(playAction);
                }, 500);
            },

            backwardActionAddLifeEventNew: function (playAction) {
                $rootScope.removeLifeEventToPlayBack(playAction.data);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },
            
            // Remove Life Event
            actionRemoveLifEvent: function (playAction) {
                playAction.data.newValue = playAction.data;
                angular.forEach($rootScope.DreamTypes, function (item) {
                    if (item.id == playAction.data.dream_type_id) {
                        playAction.dream_type = angular.copy(item);
                        playAction.data.newValue.dream_type = angular.copy(item);
                    }
                });
                playAction.data.type = 'lifeevent';
                $rootScope.removeLifeEventToPlayBack(playAction.data);
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionRemoveLifEvent: function (playAction) {
                // Add new Life event
                $rootScope.addLifeEventToPlayBack(playAction.data);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },

            // Edit dream
            actionEditDream: function (playAction) {
                var oldValue = null;
                angular.forEach($rootScope.PersonaPlan.dreams, function (item) {
                    if (item.id == playAction.data.id) oldValue = item;
                });
                if (oldValue != null) {
                    var self = this;
                    // Build new value
                    var newValue = angular.copy(oldValue);
                    angular.forEach(playAction.data.listchange, function (item) {
                        var tovalue = self.parseStringToFloat(item.tovalue);
                        newValue[item.fieldname] = tovalue
                    });
                    playAction.newValue = newValue;
                    playAction.oldValue = oldValue;
                    playAction.type = 'dream';
                    playAction.dream_type_id = newValue.dream_type_id;
                    $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                    $timeout(function () {
                        self.reloadCurrentStateWithCalculateData(playAction);
                    }, 500);
                    $rootScope.editDreamToPlayBack(playAction);
                }
            },
            backwardActionEditDream: function (playAction) {
                var oldValue = angular.copy(playAction.oldValue);
                var newValue = angular.copy(playAction.newValue);
                playAction.newValue = oldValue;
                playAction.oldValue = newValue;
                $rootScope.editDreamToPlayBack(playAction);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },

            // Edit life event
            actionEditLifeEventNew: function (playAction) {
                var oldValue = null;
                angular.forEach($rootScope.PersonaPlan.lifeEvent, function (item) {
                    if (item.id == playAction.data.id) oldValue = item;
                });
                if (oldValue != null) {
                    var self = this;
                    var newValue = angular.copy(oldValue);
                    angular.forEach(playAction.data.listchange, function (item) {
                        var tovalue = self.parseStringToFloat(item.tovalue);
                        newValue[item.fieldname] = tovalue
                    });
                    playAction.newValue = newValue;
                    playAction.oldValue = oldValue;
                    playAction.type = 'lifeevent';
                    playAction.dream_type_id = newValue.dream_type_id;
                    $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                    $timeout(function () {
                        self.reloadCurrentStateWithCalculateData(playAction);
                    }, 500);
                    $rootScope.editLifeEventToPlayBack(playAction);
                }
            },
            backwardActionEditLifeEventNew: function (playAction) {
                var oldValue = angular.copy(playAction.oldValue);
                var newValue = angular.copy(playAction.newValue);
                playAction.newValue = oldValue;
                playAction.oldValue = newValue;
                $rootScope.editLifeEventToPlayBack(playAction);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },
        
            actionAddLifeEvent: function (playAction) {
                if (playAction.type == 'dream') {
                    $rootScope.addDreamToPlayBack(playAction);
                    //$rootScope.editDreamToPlayBack(playAction);
                } else if (playAction.type == 'lifeevent') {
                    $rootScope.addLifeEventToPlayBack(playAction);
                }
            },
            actionAddLifeEventBack: function (playAction) {
                if (playAction.type == 'dream') {
                    $rootScope.addDreamToPlayBackward(playAction);
                    //$rootScope.editDreamToPlayBack(playAction);
                } else if (playAction.type == 'lifeevent') {
                    $rootScope.addLifeEventToPlayBackward(playAction);
                }
            },
            actionEditLifeEvent: function (playAction) {
                if (playAction.type == 'dream') {
                    $rootScope.editDreamToPlayBack(playAction);
                }
            },

            actionMoveLifeEvent: function (playAction) {
                if (playAction.type == 'dream') { 
                    $rootScope.moveCanvasObject(playAction.name, playAction.oldValue.purchase_age, playAction.newValue.purchase_age);
                } else if (playAction.type == 'lifeevent') {
                    $rootScope.moveCanvasObject(playAction.name, playAction.oldValue.starting_age, playAction.oldValue.starting_age);
                }
            },

            backwardActionUpdateLifeEvent: function (playAction) {
                if (playAction.type == 'residence') {
                    var name = $rootScope.PersonaPlan.dreams[playAction.dreamIndex].name;
                    $rootScope.moveCanvasObject(name, playAction.newValue.purchase_age, playAction.oldValue.purchase_age);
                }
            },

                
            actionSimulateRankingDream: function (playAction) {
                $timeout(function () { utils.addHighLightClassforDirectId('simulatedreambutton'); }, 1);
                $timeout(function () { utils.addHighLightClassforDirectId('listrankingresult'); }, 1);
                $rootScope.currentScope.listRanking = playAction.data.sort(function (a, b) {
                    return a.index >= b.index;
                });
                $timeout(function () {
                    if (angular.isDefined($rootScope.currentScope.rankingResults)) {
                        var isStill = "";
                        $rootScope.currentScope.rankingResults = [];
                        for (var i = 0; i < playAction.dataCalculate.length; i++) {
                            if (parseInt(playAction.dataCalculate[i]) <= parseInt($rootScope.PersonaPlan.death_age)) {

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
                            $rootScope.currentScope.rankingResults[$rootScope.currentScope.rankingResults.length] = {
                                label: label,
                                year: playAction.dataCalculate[i]
                            }
                        }
                    }
                    utils.removeHighLightClassforDirectId('simulatedreambutton');
                    utils.removeHighLightClassforDirectId('listrankingresult');
                }, (playAction.duration / $rootScope.playBackPlayerData.forwardSpeed) / 2);

            },
            backwardActionSimulateRankingDream: function (playAction) {
                $timeout(function () { utils.addHighLightClassforDirectId('simulatedreambutton'); }, 1);
                $timeout(function () { utils.addHighLightClassforDirectId('listrankingresult'); }, 1);
                var previousActionData = $rootScope.playBackPlayerData.playBackActionList[$rootScope.playBackPlayerData.playBackActionList.length - 1];
                if (previousActionData.action_name == 'SIMULATE_RANKING_DREAM') {
                    this.actionSimulateRankingDream(previousActionData);
                } else {
                    this.reloadPlaybackCurrentStateWithCalculateData();
                }
                utils.removeHighLightClassforDirectId('simulatedreambutton');
                utils.removeHighLightClassforDirectId('listrankingresult');
            },
        
            // Change Retirement age
            actionChangeRetirementAge: function (playAction) {
                if (playAction.data.length == 1) {
                    var fromvalue = this.parseStringToInt(playAction.data[0].fromvalue);
                    var tovalue = this.parseStringToInt(playAction.data[0].tovalue);
                    $rootScope.moveCanvasObject("retirement_age", fromvalue, tovalue);
                    $rootScope.PersonaPlan.retirement_age = tovalue;
                }
                else {
                    $rootScope.actionMoveRetirementAndSocialAge(playAction);
                }
                
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangeRetirementAge: function (playAction) {
                if (playAction.data.length == 1) {
                    var fromvalue = this.parseStringToInt(playAction.data[0].fromvalue);
                    var tovalue = this.parseStringToInt(playAction.data[0].tovalue);
                    $rootScope.moveCanvasObject("retirement_age", tovalue, fromvalue);
                    $rootScope.PersonaPlan.retirement_age = tovalue;
                }
                else {
                    $rootScope.backwardActionMoveRetirementAndSocialAge(playAction);
                }
                this.reloadPlaybackCurrentStateWithCalculateData();
            },
            // Change Social Security Age
            actionChangeSocialSecurityAge: function (playAction) {
                var fromvalue = this.parseStringToInt(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data[0].tovalue);
                $rootScope.moveCanvasObject("social_security_age", fromvalue, tovalue);
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                $rootScope.PersonaPlan.social_security_age = tovalue;
                this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangeSocialSecurityAge: function (playAction) {
                var fromvalue = this.parseStringToInt(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data[0].tovalue);
                $rootScope.moveCanvasObject("social_security_age", tovalue, fromvalue);
                $rootScope.PersonaPlan.social_security_age = tovalue;
                this.reloadPlaybackCurrentStateWithCalculateData();
            },
            
            // Move dream purchase
            actionMoveDreamPurchage: function(playAction){
                var fromvalue = this.parseStringToInt(playAction.data.listchange[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data.listchange[0].tovalue);
                $rootScope.moveCanvasObject("dream_" + playAction.data.id, fromvalue, tovalue);
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                this.reloadCurrentStateWithCalculateData(playAction);
            },
            backwardActionMoveDreamPurchage: function(playAction){
                var fromvalue = this.parseStringToInt(playAction.data.listchange[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data.listchange[0].tovalue);
                $rootScope.moveCanvasObject("dream_"+ playAction.data.id, tovalue, fromvalue);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },

            // Move life event purchase
            actionMoveLifeEventPurchage: function (playAction) {
                var fromvalue = this.parseStringToInt(playAction.data.listchange[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data.listchange[0].tovalue);
                $rootScope.moveCanvasObject("lifeevent_" + playAction.data.id, fromvalue, tovalue);
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                this.reloadCurrentStateWithCalculateData(playAction);
            },
            backwardActionMoveLifeEventPurchage: function (playAction) {
                var fromvalue = this.parseStringToInt(playAction.data.listchange[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data.listchange[0].tovalue);
                $rootScope.moveCanvasObject("lifeevent_" + playAction.data.id, tovalue, fromvalue);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },
            removeLifeEventToPlayBack: function (playAction) { 
                $rootScope.removeLifeEventToPlayBack(playAction);
            },
            editLifeEventToPlayBack: function (playAction) {
                $rootScope.editLifeEventToPlayBack(playAction);
            },
          

            

            

            // change start age
            actionChangeStartAge: function (playAction) {
                $rootScope.actionChangeStartAge(playAction);
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                this.reloadCurrentStateWithCalculateData(playAction);
            },
            backwardActionChangeStartAge: function (playAction) {
                $rootScope.backwardActionChangeStartAge(playAction);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },


            // Current Plan
            actionChangePersonaPlanToCurrent: function (playAction) {
                //console.log(playAction);
                playAction.oldPersonaPlan = angular.copy($rootScope.PersonaPlan);
                $rootScope.PersonaPlan = playAction.data;
                $rootScope.setCurrentActive();
                this.updateCurrency();
                this.renderPlan();
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangePersonaPlanToCurrent: function (playAction) {
                $rootScope.PersonaPlan = angular.copy(playAction.oldPersonaPlan);
                this.updateCurrency();
                $rootScope.setNewButtonActive();
                this.renderPlan();
                this.reloadPlaybackCurrentStateWithCalculateData();
            },

            // New Plan
            actionChangePersonaPlanToNew: function (playAction) {                
                playAction.oldPersonaPlan = angular.copy($rootScope.PersonaPlan);
                $rootScope.PersonaPlan = playAction.data;
                this.updateCurrency();
                $rootScope.setNewButtonActive();
                this.renderPlan();
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangePersonaPlanToNew: function (playAction) {
                $rootScope.PersonaPlan = angular.copy(playAction.oldPersonaPlan);
                $rootScope.setCurrentActive();
                this.updateCurrency();
                this.renderPlan();
                this.reloadPlaybackCurrentStateWithCalculateData();
            },

            // Reset plan
            actionResetPlan: function (playAction) {
                playAction.oldPersonaPlan = angular.copy($rootScope.PersonaPlan);
                $rootScope.PersonaPlan = playAction.data;
                this.renderPlan();
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionResetPlan: function (playAction) {
                $rootScope.PersonaPlan = angular.copy(playAction.oldPersonaPlan);
                this.renderPlan();
                this.reloadPlaybackCurrentStateWithCalculateData();
            },

            // Manage solution
            backwardActionManageSolution: function (playAction) {
                $('#manageSolution').modal('hide');
            },
            actionManageSolution: function (playAction) {
                $rootScope.playBackPlayerData.data = playAction.data;
                $('#manageSolution').modal({ backdrop: 'static', keyboard: false});
                $rootScope.solutionScope.GetSolution();
            },

            // Close solution
            backwardActionCloseSolution: function(playAction) {
                $('#manageSolution').modal({ backdrop: 'static', keyboard: false});
            },
            actionCloseSolution: function (playAction) {
                $('#manageSolution').modal('hide');
                playAction.data = angular.copy($rootScope.solutionScope.rowCollection);
            },            
            
            // Delete solution
            backwardActionDeleteSolution: function (playAction) {
                $rootScope.playBackPlayerData.data = playAction.oldRowColection;
                $rootScope.solutionScope.GetSolution();
                $rootScope.solutionScope.SaveUnitOfWork(playAction.data);
                $timeout(function () {
                    utils.HideRenameDialog();
                }, 2000);
            },

            actionDeleteSolution: function(playAction) {
                
                $rootScope.solutionScope.RemoveUnitWork(playAction.data);
                playAction.oldRowColection = angular.copy($rootScope.solutionScope.rowCollection);
                $timeout(function() {
                    utils.HideDialog();
                }, 2000);
            },
            
            // Rename solution
            backwardActionRenameSolution: function (playAction) {
                /*
                var oldPlayAction = angular.copy(playAction);
                var oldName = oldPlayAction.data.oldName;
                oldPlayAction.data.name = oldName;
                */
                $rootScope.solutionScope.RenameUnitWork(playAction.data);
                $rootScope.playBackPlayerData.data = playAction.oldRowColection;
                $rootScope.solutionScope.GetSolution();
                $timeout(function() {
                    utils.HideRenameDialog();
                }, 2000);
            },
      
            actionRenameSolution: function(playAction) {
                $rootScope.solutionScope.RenameUnitWork(playAction.data);
                playAction.oldRowColection = angular.copy($rootScope.solutionScope.rowCollection);
                $timeout(function() {
                    utils.HideRenameDialog();
                }, 2000);
                
            },

            // Save solution
            backwardActionSaveSolution: function (playAction) {
                $rootScope.solutionScope.RemoveUnitWork(playAction.data);
                $timeout(function () {
                    utils.HideDialog();
                }, 2000);
                $rootScope.playBackPlayerData.data = playAction.oldRowColection;
                $rootScope.solutionScope.GetSolution();
            },

            actionSaveSolution: function (playAction) {
                console.log(playAction);
                $rootScope.solutionScope.SaveUnitOfWork(playAction.data);
                playAction.oldRowColection = angular.copy($rootScope.solutionScope.rowCollection);
                $rootScope.solutionScope.rowCollection.unshift(playAction.data);
                var maxVersion = 1;
                angular.forEach($rootScope.solutionScope.rowCollection, function (solution) {
                    if (angular.isDefined(solution.version)) {
                        if (solution.version > maxVersion) {
                            maxVersion = solution.version + 1;
                        }
                    }
                });
                /*
                if ($rootScope.solutionScope.rowCollection == null || $rootScope.solutionScope.rowCollection.length < 1)
                    $rootScope.solutionScope.rowCollection.unshift(playAction.data);
                */
                /*
                if ($rootScope.solutionScope.rowCollection[0].version == null || $rootScope.solutionScope.rowCollection[0].version == undefined)
                    playAction.data.version = 1;
                else
                    playAction.data.version = parseInt($rootScope.solutionScope.rowCollection[0].version) + 1;
                */
                playAction.data.version = maxVersion;
                $timeout(function () {
                    utils.HideRenameDialog();
                }, 2000);
            },

            // Load solution
            backwardActionLoadSolution: function (playAction) {
                $rootScope.PersonaPlan = playAction.oldPersonaPlan;
                $rootScope.playBackPlayerData.data = playAction.oldCalculateData;
                $state.reload();
            },

            actionLoadSolution: function (playAction) {
                $rootScope.solutionScope.LoadUnitOfWork(playAction.data);
                playAction.oldPersonaPlan = angular.copy($rootScope.PersonaPlan);
                // oldCalculateData
                var oldCalculateData = this.startAction.dataCalculate;
                for (var i = 0 ; i < $rootScope.playBackPlayerData.playBackActionList.length; i++) {
                    if ($rootScope.playBackPlayerData.playBackActionList[i].dataCalculate != null) {
                        oldCalculateData = $rootScope.playBackPlayerData.playBackActionList[i].dataCalculate;
                    }
                }
                playAction.oldCalculateData = angular.copy(oldCalculateData);

                $rootScope.PersonaPlan = playAction.data.currentPlan;
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                $state.reload();
                $timeout(function () {
                    utils.HideDialog();
                }, 2000);
            },

            // Manage solution
            backwardActionManageScenario: function (playAction) {
                utils.HideScenarioDialog();
            },

            actionManageScenario: function (playAction) {
                $('#manageScenario').modal({ backdrop: 'static', keyboard: false });
                $rootScope.scenarioScope.listScenario = playAction.data;
                $rootScope.spinner.off();
            },

            // New Scenario
            backwardActionNewScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                utils.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Do you want to delete {{length}} row(s)", { length: 1 }));
                $timeout(function () {
                    ultilService.showSuccessMessage(ultilService.translate("Deleted {{length}} row(s) successful!", { length: 1 }), 1000);
                    utils.HideDialog();
                }, playAction.duration);
            },

            actionNewScenario: function(playAction) {
                $rootScope.scenarioScope.NewScenario(playAction.data);
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                $rootScope.scenarioScope.listScenario.push(playAction.data);
                $timeout(function () {
                    ultilService.showSuccessMessage(ultilService.translate("Your scenario:  {{name}} was successfully created!", playAction.data), 1000);
                    utils.HideRenameDialog();
                }, playAction.duration);
            },
          
            // Duplicate Scenario
            backwardActionDuplicateScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                utils.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Do you want to delete {{length}} row(s)", { length: playAction.data.length }));
                $timeout(function () {
                    ultilService.showSuccessMessage(ultilService.translate("Deleted {{length}} row(s) successful!", { length: playAction.data.length }), 1000);
                    utils.HideDialog();
                }, playAction.duration);
            },

            actionDuplicateScenario: function (playAction) {
                ultilService.showSuccessMessage(ultilService.translate("Duplicated {{length}} row(s) successful!", {
                    length: playAction.data.length
                }), 500);
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                for (var i = 0; i < playAction.data.length; i++) {
                    $rootScope.scenarioScope.listScenario.push(playAction.data[i]);
                }
            },

            // Rename Scenario
            backwardActionRenameScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
            },
            actionRenameScenario: function (playAction) {
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                $rootScope.scenarioScope.RenameScenario(playAction.data);
                $timeout(function () {
                    ultilService.showSuccessMessage(ultilService.translate("Renamed your scenario {{name}} successful!",playAction.data), 1000);
                    utils.HideRenameDialog();
                }, playAction.duration);
            },

            // Make Current Scenario
            backwardActionMakeCurrentScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                angular.forEach($rootScope.scenarioScope.listScenario, function (item) {
                    if (item.status == 0) {
                        ultilService.showSuccessMessage(ultilService.translate("Your scenario: {{name}} was marked as current scenario!", item), 1000);
                    }
                });
            },

            actionMakeCurrentScenario: function (playAction) {
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                $rootScope.scenarioScope.makeCurrentPlayback(playAction.data);
                $timeout(function () {
                    ultilService.showSuccessMessage(ultilService.translate("Your scenario: {{name}} was marked as current scenario!", playAction.data), 1000);
                }, playAction.duration);
            },

            // Make New Scenario
            backwardActionMakeNewScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                angular.forEach($rootScope.scenarioScope.listScenario, function (item) {
                    if (item.status == 0) {
                        ultilService.showSuccessMessage(ultilService.translate("Your scenario: {{name}} was marked as new scenario!", item), 1000);     
                    }
                });                
            },
            
            actionMakeNewScenario: function (playAction) {
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                $rootScope.scenarioScope.makeNewPlayback(playAction.data);
                $timeout(function () {
                    ultilService.showSuccessMessage(ultilService.translate("Your scenario: {{name}} was marked as new scenario!", playAction.data), 1000);
                }, playAction.duration);
            },

            // Delete Scenario
            backwardActionDeleteScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                $timeout(function () {
                    ultilService.showSuccessMessage(ultilService.translate("Your scenario:  {{name}} was successfully created!", playAction.data), 1000);
                    utils.HideDialog();
                    }, playAction.duration);
            },

            actionDeleteScenario: function (playAction) {
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                utils.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Do you want to delete {{length}} row(s)", { length: playAction.data.length }));
                angular.forEach(playAction.data, function (scenario) {
                    for (var i = 0; i < $rootScope.scenarioScope.listScenario.length; i++) {
                        if (scenario.id == $rootScope.scenarioScope.listScenario[i].id) {
                            $rootScope.scenarioScope.listScenario.splice(i, 1);
                            break;
                        }
                    }
                });
                
                $timeout(function () {
                    ultilService.showSuccessMessage(ultilService.translate("Deleted {{length}} row(s) successful!", { length: playAction.data.length }), 1000);
                    utils.HideDialog();
                }, playAction.duration);
            },

            // Close scenario
            backwardActionCloseScenario: function (playAction) {
                $('#manageScenario').modal({ backdrop: 'static', keyboard: false});
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                $rootScope.spinner.off();
            },
            actionCloseScenario: function (playAction) {
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                playAction.oldPersonaPlan = angular.copy($rootScope.PersonaPlan);
                // oldCalculateData
                var oldCalculateData = this.startAction.dataCalculate;
                for (var i = 0 ; i < $rootScope.playBackPlayerData.playBackActionList.length; i++) {
                    if ($rootScope.playBackPlayerData.playBackActionList[i].dataCalculate != null) {
                        oldCalculateData = $rootScope.playBackPlayerData.playBackActionList[i].dataCalculate;
                    }
                }
                playAction.oldCalculateData = angular.copy(oldCalculateData);
                $rootScope.PersonaPlan = playAction.data;
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                $state.reload();
                $timeout(function () {
                    utils.HideScenarioDialog();
                }, 1500);
            },

            // Change currency
            backwardActionChangeCurrency: function (playAction) {
                $rootScope.PersonaPlan.currency_code = angular.copy(playAction.data[0].fromvalue);
                $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.PersonaPlan.currency_code + ' ';
                $state.reload();
                
                $timeout(function () { utils.addHighLightClassforDirectId('currencyId'); }, 100);
                $timeout(function () {
                    utils.removeHighLightClassforDirectId('currencyId');
                    $rootScope.apply();
                    ultilService.showSuccessMessage(ultilService.translate("Currency has been changed!"));
                }, 1000);
            },

            actionChangeCurrency: function (playAction) {
                $rootScope.PersonaPlan.currency_code = angular.copy(playAction.data[0].tovalue);
                $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.PersonaPlan.currency_code + ' ';
                $state.reload();
                $timeout(function () { utils.addHighLightClassforDirectId('currencyId'); }, 100);
                $timeout(function () {
                    $rootScope.apply();
                    utils.removeHighLightClassforDirectId('currencyId');
                    ultilService.showSuccessMessage(ultilService.translate("Currency has been changed!"));
                }, 1000);
            },

            updateCurrency: function () {
                if (angular.isDefined($rootScope.PersonaPlan.currency_code)) {
                    $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.PersonaPlan.currency_code + ' ';
                }
            },

            parseStringToFloat: function (str) {
                return parseFloat(str.replace(",", "."));  
            },
                parseStringToInt: function (str) {
                return parseInt(str.replace(",", "."));
            },
                reloadCurrentStateWithCalculateData: function (playAction) {
                $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                $state.reload();
            },
                reloadPlaybackCurrentStateWithCalculateData: function () {
                if ($rootScope.playBackPlayerData.playBackActionList.length > 0) {
                    var actionData = $rootScope.playBackPlayerData.playBackActionList[$rootScope.playBackPlayerData.playBackActionList.length - 1];
                    $rootScope.playBackPlayerData.data = actionData.dataCalculate;
                    $state.reload();
                } else {
                    this.reloadSession();
                }
            }
            
        }    
    }
);