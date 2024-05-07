
btoApp.factory('playbackService',
    function ($rootScope, $http, $timeout, $q, utilService, timelineService, $interval, $state, $locale, personalPlanService, utilService, CONFIG, actionService, $cookies) {
        $rootScope.playBackPlayerData = {
            isPlaying: false,
            isPause: true,
            isPlayAction: false,
            actionSpeed: 4000,
            forwardSpeed: 1,
            playInterval: null,
            currentTime: 0,
            actionCurrentTime: 0,
            //actionPercentProgressBar: 0,
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
            isLoadSession: false, // Load session by playbackSessionById
            session: null
        };
        $rootScope.playbackSessionList = [];
        $rootScope.playbackSessionTable = {
            isLoading: false,
            startIndex: 0,
            number: 10,
            numberOfPages: 0,
            email: '',
            displayed: [],
            tableState: null,
            callServer: function (tableState) {
                $rootScope.playbackSessionTable.tableState = tableState;
                $rootScope.playbackSessionTable.isLoading = true;
                var pagination = tableState.pagination;
                $rootScope.playbackSessionTable.startIndex = pagination.start || 0;
                $rootScope.playbackSessionTable.number = pagination.number || 10;
                if (angular.isDefined(tableState.search.predicateObject) && angular.isDefined(tableState.search.predicateObject.email)) {
                    $rootScope.playbackSessionTable.email = tableState.search.predicateObject.email || '';
                }
                $rootScope.playbackSessionTable.getSession($rootScope.playbackSessionTable.startIndex,
                    $rootScope.playbackSessionTable.number,
                    $rootScope.playbackSessionTable.email,
                    tableState, function (result) {
                        tableState.pagination.numberOfPages = result.numberOfPages;
                        $rootScope.playbackSessionTable.numberOfPages = result.numberOfPages;
                        $rootScope.playbackSessionTable.displayed = result.data
                        $rootScope.playbackSessionTable.isLoading = false;
                    });
            },
            getSession: function (start, number, email, tableState, callbackSuccess) {
                $http({ method: 'POST', url: 'api/clientTracking/getSession', data: { start: start, number: number, email: email } }).then(function (response) {
                    if (angular.isDefined(callbackSuccess)) callbackSuccess(response.data);
                });
            }
        };
        $rootScope.playbackActionListFromServer = [];
        //$rootScope.playbackService = this;
        return {
            getPlaybackData: function (client_profile_id, callbackSuccess) {
                // client_profile_id = 5234;
                // client_profile_id = 5247;
                // client_profile_id = 5250;
                // client_profile_id = 5273;
                console.log(client_profile_id);

                utilService.callApi('POST', '/api/clientTracking/GetUserSession', {}, client_profile_id, function (data) {
                    // console.log(data);
                    if (angular.isDefined(callbackSuccess)) callbackSuccess(data);
                });
            },


            playbackUpdatePercentageProgressBar: function (percent) {
                //console.log(percent);
                var playback_percent_progress_bar = $('#playback_percent_progress_bar');
                //console.log(percent, playback_percent_progress_bar)
                playback_percent_progress_bar.width(percent + '%');
                playback_percent_progress_bar.css('min-width', percent + '%');
                /*
                $timeout(function () {
                    playback_percent_progress_bar.width(percent + '%');
                }, 1000);
                */
            },
            setReloadPlayback: function (dataSession)
            {
                $cookies.put('reloadplayback', 'true');
                $cookies.put('playback_themeId', dataSession.ui_version);
                $cookies.put('playback_id', dataSession.id);
                $cookies.put('playback_user_id', dataSession.user_id);
            },

            deleteReloadPlayback: function ()
            {
                
                $cookies.remove('reloadplayback');
                $cookies.remove('playback_themeId');
                $cookies.remove('playback_id');
                $cookies.remove('playback_user_id');
                
            },

            doPlaybackFromCookie: function () {
                if (isPlayback == 'true') {
                    var playback_id = angular.copy($cookies.get('playback_id'));
                    this.playbackSessionById(playback_id);
                    this.deleteReloadPlayback();
                    $timeout(function () { 
                        $('#tawkchat-iframe-container').hide();
                    }, 7000)
                }
            },

            playbackLoadSession: function (dataSession) {
                var self = this;
                // utilService.showInfoMessage('Started loading session', 2000);
                // data.id 37352 37352 37453
                this.getPlaybackData(dataSession.id, function (data) {
                    $rootScope.playbackActionListFromServer = data;
                    if ($rootScope.playbackActionListFromServer.length > 2) {
                        self.setReloadPlayback(dataSession);
                        utilService.showInfoMessage('System will reload page for running playback', 2000);
                        $timeout(function () {
                            location.href = location.origin;
                        }, 2500);
                    } else {
                        utilService.showErrorMessage('No action by the user', 6000);
                    }
                });
            },

            playbackSessionById: function (session_id) {
                // console.log(session_id);
                utilService.showInfoMessage('Started loading session', 2000);
                var self = this;
                //utilService.showInfoMessage('Started loading session', 2000);
                this.getPlaybackData(session_id, function (data) {
                    $rootScope.playbackActionListFromServer = data;
                    if ($rootScope.playbackActionListFromServer.length > 2) {
                        $('#playbackSessionDialog').modal('hide');
                        $rootScope.playBackPlayerData.isLoadSession = false;
                        self.initialPlaybackSession();
                        //$timeout(function () {
                        //    $rootScope.playbackService.startPlay();
                        //}, 1000);
                    } else {
                        utilService.showErrorMessage('No action by the user', 6000);
                    }
                });
            },

            initialPlayBack: function () {
                $rootScope.playbackSessionTable.callServer($rootScope.playbackSessionTable.tableState);
                $('#playbackSessionDialog').modal({
                    backdrop: 'static', keyboard: false
                });
            },

            initOverlay: function () {
                var current_height = $(document).height();
                $('.overlay').css({ 'height': current_height - 200, 'z-index': '9999' });
                $timeout(function () {
                    var height = $(document).height() + 56;
                    $('.overlay').css({ 'height': $(document).height() + 56, 'z-index': '9999' });
                }, 1000);
            },
            hideOverlay: function() {
                $('.overlay').css({ 'height': 0, 'z-index': '-1'});
            },

            initialPlaybackSession: function () {
                $rootScope.playBackPlayerData.isPlayBack = true;
                $rootScope.playBackPlayerData.isFinishPlayBack = true;
                this.initOverlay();
                this.orignialData = angular.copy($rootScope.PersonaPlan);
                this.orginalMainResult = angular.copy($rootScope.MainResult);
                this.initData();
                // reset zoom
                if (angular.isDefined($rootScope.zoomData)) {
                    $rootScope.zoomData.minAge = $rootScope.zoomData.min;
                    $rootScope.zoomData.maxAge = $rootScope.zoomData.max;
                }
            },

            playBackInitialData: null,
            childList: null,
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
                    $rootScope.playBackPlayerData.tooltipMessage = utilService.translate(actionData.action_description);
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
                
            },

            reloadSession: function () {
                var self = this;
                console.log('reload session', this.playBackInitialData);
                $rootScope.isFirstLastPLayback = true;
                $rootScope.PersonaPlan = angular.copy(this.playBackInitialData.data);
                $rootScope.MainResult = angular.copy(this.playBackInitialMainResult);
                if (this.playBackInitialData.userProfile != null) {
                    $rootScope.profileService.updateListFamilyMember(null, this.playBackInitialData.userProfile)
                }
                personalPlanService.updateConvertDataOfPersonalPlan();
               
                $rootScope.playBackPlayerData.playForwardActionList = angular.copy($rootScope.playBackPlayerData.playBackActionListData);
                $rootScope.playBackPlayerData.currentTime = 0;
                $rootScope.playBackPlayerData.actionCurrentTime = 0;
                this.playbackUpdatePercentageProgressBar(0);
                //$rootScope.playBackPlayerData.actionPercentProgressBar = 0;
                $rootScope.playBackPlayerData.playAction = this.playBackInitialData;
                $rootScope.timelineService.renderTimeLine();
                this.actionSwitchTab(this.startAction);
                
                $rootScope.playBackPlayerData.playBackActionList = [];
                $rootScope.isFirstLastPLayback = false;
                if (version_id != '1' && version_id != '2') {
                    $rootScope.cashFlow.income = [];
                    $rootScope.cashFlow.expense = [];
                    $rootScope.cashFlow.cpf = [];
                    $rootScope.cashFlow.investment_start = [];
                }
                $rootScope.utilService.scopeApply();
                $timeout(function () {
                    if (self.playBackInitialData.userProfile != null) {
                        self.updateCashFlowByProfileAndCashFlow(self.playBackInitialData.listPersona, self.playBackInitialData.userProfile);
                    }
                    $rootScope.actionService.calculateData();
                }, 300);
            },

            updateCashFlowByProfileAndCashFlow: function (cashFlowList, profile) {
                // console.log(cashFlowList, profile);
                //$rootScope.cashFlow.income = [];
                //$rootScope.cashFlow.expense = [];


                // Demo data
                var profileData = angular.copy(profile);
                var cashFlowData = angular.copy(cashFlow);

                if (angular.isDefined(profile)) {
                    if (profileData.married_status == null || profileData.married_status == 0) {
                        $rootScope.savingRate.RemoveSpouseFromCashFlow(cashFlowData.income);
                        $rootScope.savingRate.RemoveSpouseFromCashFlow(cashFlowData.expense);
                    }

                    if (typeof (profileData.occupation) !== "undefined" && profileData.occupation == 0) {
                        $rootScope.savingRate.RemoveSalarySpouseFromCashFlow(cashFlowData.income);
                        $rootScope.savingRate.RemoveSalarySpouseFromCashFlow(cashFlowData.expense);
                    }

                    $rootScope.savingRate.RemoveChildFromCashFlow(cashFlowData.income, profileData.childs.length);
                    $rootScope.savingRate.RemoveChildFromCashFlow(cashFlowData.expense, profileData.childs.length);
                }
               
                
                $rootScope.cashFlow = cashFlowData;

                // Update investment
                $rootScope.investment.updateInvestmentStartOfCashFlow(cashFlowList);
                

                var updateCashflowData = function (item, data) {
                   
                    if (item.name == data.variable) {
                        item.value = data.value * 1000 / 12;
                        item.value = utilService.roundNumber(item.value);
                    }
                    if (item.children.length > 0) {
                        for (var i = 0; i < item.children.length; i++) {
                            updateCashflowData(item.children[i], data);
                        }
                    }
                }

                if (cashFlowList != null && cashFlowList.length > 0) {
                    angular.forEach(cashFlowList, function (data) {
                        
                        for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                            updateCashflowData($rootScope.cashFlow.income[i], data);
                        }
                        for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                            updateCashflowData($rootScope.cashFlow.expense[i], data);
                        }
                    });
                }

                $rootScope.savingRate.updateIncomeExpenseAndSavingFromCashflow();
                // Update $rootScope.ProfileName
                $rootScope.ProfileName.name = profileData.first_name;
                $rootScope.ProfileName.spouse = profileData.spouse_first_name;
                if (profileData.childs.length > 0) {
                    var childIndex = 0;
                    angular.forEach(profileData.childs, function (item) {
                        childIndex++;
                        var child_name = "child_" + childIndex;
                        $rootScope.ProfileName[child_name] = item.full_name;
                    });
                }
            },

            initData: function () {
                
                var loadSessionData = $rootScope.playbackActionListFromServer.shift();
                loadSessionData.order = 0;
                console.log(loadSessionData);
                
                $rootScope.playBackPlayerData.isPlaying = false;                
                $rootScope.playBackPlayerData.isPause = false;
                if (loadSessionData.dataCalculate != null){
                    if (angular.isDefined(loadSessionData.dataCalculate.basic) && (version_id =='1') || version_id == '2') {
                        this.playBackInitialMainResult = angular.copy(loadSessionData.dataCalculate);
                    } else {
                        this.playBackInitialMainResult = angular.copy(loadSessionData.dataCalculate);
                    }
                }
                
                
                this.playBackInitialData = angular.copy(loadSessionData);
                if (this.playBackInitialData.userProfile != null) {
                    this.childList = this.playBackInitialData.userProfile.childs;
                    $rootScope.planService.updateAgeDependentOfChildIndependent(this.playBackInitialData.data, this.playBackInitialData.userProfile.childs);
                }
                console.log(this.playBackInitialData);

                var firstAction = $rootScope.playbackActionListFromServer[0];
                if (firstAction.action_name == 'TAB_CLICK') {
                    this.startAction = $rootScope.playbackActionListFromServer.shift();
                    this.startAction.order = 0;
                } else {
                    this.startAction = {
                        action_description: "Click tab {{name}}",
                        action_name: "TAB_CLICK",
                        data: { Name: CONFIG.TAB.MAIN },
                        start_time: 200,
                        order: 0
                    }
                }

                this.backupCashFlow = angular.copy($rootScope.cashFlow);
                this.backupProfileName = angular.copy($rootScope.ProfileName);

                this.reloadSession();
                //return;
                
                var self = this;
                $rootScope.playBackPlayerData.playBackActionListData = [];
                // Update each session
                var count = 1;
                // var new_broken_age = 0, old_broken_age = 0;
                var startTime = 0;
                angular.forEach($rootScope.playbackActionListFromServer, function (action) {
                    /*
                    // calculate broken age
                    old_broken_age = angular.copy($rootScope.MainResult.broken_age);
                    new_broken_age = angular.copy($rootScope.MainResult.broken_age);
                   
                    try {
                        if (angular.isDefined(action.dataCalculate) && angular.isDefined(action.dataCalculate.broken_age) && action.dataCalculate != null && action.dataCalculate.broken_age != null)
                            new_broken_age = action.dataCalculate.broken_age;
                    } catch (ex) {}
                    */
                    var playAction = angular.copy(action);
                    /*
                    playAction.new_broken_age = new_broken_age;
                    playAction.old_broken_age = old_broken_age;
                    */
                    if (playAction.start_time > 8000) {
                        startTime = startTime + 8000;
                    } else {
                        startTime = startTime + playAction.start_time;
                    }
                    if (playAction.action_name == 'TAB_CLICK') {
                        switch (playAction.data.Name) {
                            case CONFIG.TAB.MAIN:
                                playAction.action_description = 'Switch to main tab';
                                break;
                            case CONFIG.TAB.INCOME_EXPENSE:
                                playAction.action_description = 'Switch to income and expense tab';
                                break;
                            case CONFIG.TAB.LIQUID_ASSET:
                                playAction.action_description = 'Switch to liquid asset tab';
                                break;
                            case CONFIG.TAB.ILLIQUID_ASSET:
                                playAction.action_description = 'Switch to illiquid asset tab';
                                break;
                            case CONFIG.TAB.RANKING_DREAM:
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
                $rootScope.utilService.scopeApply();
                //console.log($rootScope.playBackPlayerData);

            },
            
            swithToMainTab: function () {
                utilService.showSuccessMessage('switch to main tab to start play back');
                utilService.stateGo(CONFIG.TAB.MAIN);
                // $state.go(CONFIG.TAB.MAIN);
            },
            
            renderPlan: function () {
                console.log('render plan')
                $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan, this.childList);
                this.renderTimeLine();
                
                /*
                deleteAllArrowButton(oCanvas.canvasList[0]);
                this.renderInputComponentOfMainTab();
                */
            },

            renderTimeLine: function () {
                /*
                $rootScope.RemoveAllDreamAndEventInTimeline();
                reRenderTimelineObject(timelineService.timelineObj.canvas, $rootScope);
                $rootScope.InsertDreamAndLifeEvent();
                */
                console.log($rootScope.PersonaPlan);
                $rootScope.timelineService.renderTimeLine();
                //$rootScope.reRenderTimelineObject();
                console.log('Render timeline again');
            },
           
            renderInputComponentOfMainTab: function () {
                // Trail - Top - Bottom Value
                /*
                $timeout(function () {
                    $rootScope.MCTopValue.selected = ($rootScope.PersonaPlan.mc_top_value * 100) + '%';
                    $rootScope.MCBottomValue.selected = ($rootScope.PersonaPlan.mc_bottom_value * 100) + '%';
                }, 500);
                */
                
            },
           
            startPlay: function () {
                console.log('startPlay');
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
                location.href = location.origin;
                /*
                var self = this;
                $rootScope.cashFlow.income = [];
                $rootScope.cashFlow.expense = [];
                $timeout(function () {
                    console.log($rootScope.playBackPlayerData, self);
                    $rootScope.cashFlow = angular.copy(self.backupCashFlow);
                    $rootScope.ProfileName = angular.copy(self.backupProfileName);
                    $rootScope.playBackPlayerData.isPlaying = false;
                    $rootScope.playBackPlayerData.isPause = false;
                    $rootScope.playBackPlayerData.isPlayBack = false;
                    $rootScope.playBackPlayerData.isFinishPlayBack = true;
                    $interval.cancel($rootScope.playBackPlayerData.playInterval);
                    //$('#playback').css({ 'z-index': '10000', 'display': 'none' });
                    self.hideOverlay();
                    $('.modal').modal('hide');
                    $rootScope.PersonaPlan = angular.copy(self.orignialData);
                    // reset zoom
                    if (angular.isDefined($rootScope.zoomData)) {
                        $rootScope.zoomData.min = $rootScope.PersonaPlan.start_age;
                        $rootScope.zoomData.max = $rootScope.PersonaPlan.death_age;
                        $rootScope.zoomData.minAge = $rootScope.zoomData.min;
                        $rootScope.zoomData.maxAge = $rootScope.zoomData.max;
                    }
                    personalPlanService.updateConvertDataOfPersonalPlan();
                    $rootScope.playBackPlayerData.data = null;
                    self.renderPlan();
                    utilService.stateGo(CONFIG.TAB.MAIN);
                    if (angular.isDefined($rootScope.investment)) {
                        $rootScope.investment.initInvestmentCardsAndCpf();
                    }
                    $rootScope.isFirstLastPLayback = true;
                    $rootScope.actionService.calculateData();
                }, 1500);
                */
            },

            changeSpeed: function () {                
                $rootScope.playBackPlayerData.forwardSpeed = $rootScope.playBackPlayerData.forwardSpeed * 2;
                if ($rootScope.playBackPlayerData.forwardSpeed > 8) {
                    $rootScope.playBackPlayerData.forwardSpeed = 1;
                }
                utilService.showSuccessMessage(utilService.translate('Play at speed {{speed}}x',{speed: $rootScope.playBackPlayerData.forwardSpeed}));
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
                utilService.showSuccessMessage(utilService.translate('Play backward at speed {{speed}}x', {speed: $rootScope.playBackPlayerData.forwardSpeed }));
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
            timeoutToStopAction: null,
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
                                utilService.showSuccessMessage('Finished play backward action');
                                $rootScope.playBackPlayerData.isFinishPlayBack = true;
                                $rootScope.playBackPlayerData.actionCurrentTime = 0;
                                //$rootScope.playBackPlayerData.actionPercentProgressBar = 0;
                                self.playbackUpdatePercentageProgressBar(0);
                            }, 3000);
                        }
                    } else if ($rootScope.playBackPlayerData.playAction == null && !$rootScope.playBackPlayerData.isPlayAction) {
                        $rootScope.playBackPlayerData.isFinishPlayBack = false;
                        $rootScope.playBackPlayerData.playAction = $rootScope.playBackPlayerData.playBackActionList.pop();
                    } else if ($rootScope.playBackPlayerData.playAction != null && $rootScope.playBackPlayerData.playAction.start_time >= $rootScope.playBackPlayerData.currentTime) {
                        if ($rootScope.playBackPlayerData.isPlayAction == false) {
                            $rootScope.playBackPlayerData.actionCurrentTime = $rootScope.playBackPlayerData.playAction.start_time;
                            
                            self.playbackUpdatePercentageProgressBar(($rootScope.playBackPlayerData.playAction.start_time / $rootScope.playBackPlayerData.timeLength) * 100);

                            self.performBackwardAction($rootScope.playBackPlayerData.playAction);
                            $rootScope.playBackPlayerData.isPlayAction = true;
                            $rootScope.actionService.calculateData();
                            if (version_id == '1' || version_id == '2') {
                                $timeout(function () {
                                    $rootScope.playBackPlayerData.playAction = null;
                                    $rootScope.playBackPlayerData.isPlayAction = false;
                                }, 3000);
                            }
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
                                utilService.showSuccessMessage('Finished playback action');
                                $rootScope.playBackPlayerData.actionCurrentTime = angular.copy($rootScope.playBackPlayerData.timeLength);
                                //$rootScope.playBackPlayerData.actionPercentProgressBar = 100;
                                self.playbackUpdatePercentageProgressBar(100)
                                $rootScope.playBackPlayerData.isFinishPlayBack = true;
                                if ($rootScope.playBackPlayerData.isLoadSession == true) {
                                    self.stopPlayback();
                                }
                                $rootScope.playBackPlayerData.isLoadSession = false;
                            }, 3000);
                        }
                        
                    } else if ($rootScope.playBackPlayerData.playAction == null && !$rootScope.playBackPlayerData.isPlayAction) {
                        $rootScope.playBackPlayerData.isFinishPlayBack = false;
                        $rootScope.playBackPlayerData.playAction = $rootScope.playBackPlayerData.playForwardActionList.shift();
                        
                    } else if ($rootScope.playBackPlayerData.playAction != null && $rootScope.playBackPlayerData.playAction.start_time <= $rootScope.playBackPlayerData.currentTime) {
                        if ($rootScope.playBackPlayerData.isPlayAction == false) {
                            $rootScope.playBackPlayerData.actionCurrentTime = angular.copy($rootScope.playBackPlayerData.playAction.start_time);
                            //$rootScope.playBackPlayerData.actionPercentProgressBar = ($rootScope.playBackPlayerData.playAction.start_time / $rootScope.playBackPlayerData.timeLength) * 100;
                            self.playbackUpdatePercentageProgressBar(($rootScope.playBackPlayerData.playAction.start_time / $rootScope.playBackPlayerData.timeLength) * 100);
                            self.performForwardAction($rootScope.playBackPlayerData.playAction);
                            $rootScope.playBackPlayerData.isPlayAction = true;
                            $rootScope.actionService.calculateData();
                            
                            if (version_id == '1' || version_id == '2') {
                                $timeout(function () {
                                    $rootScope.playBackPlayerData.playAction = null;
                                    $rootScope.playBackPlayerData.isPlayAction = false;
                                }, 3000);
                            }
                            
                        }
                    }
                    
                }, $rootScope.playBackPlayerData.actionSpeed / $rootScope.playBackPlayerData.forwardSpeed);
            },

            showSessionAndCallback: function (id, callback) {
                if (angular.isDefined($rootScope.summaryCardService)) {
                    $rootScope.summaryCardService.selectCardWhenPlayback(id, callback);
                } else {
                    callback();
                }
            },

            performBackwardAction: function (playAction) {
                console.log(playAction);
                try {
                    
                    //console.log(playAction);
                    $('.modal-backdrop').hide();
                    var self = this;
                    

                    //if (playAction.action_name != 'TAB_CLICK') {
                    var action_description = playAction.action_description;
                    if (playAction.action_name != 'CHANGE_CASH_FLOW' && playAction.action_name != 'CHANGE_INVESTMENT_START') {
                        utilService.showInfoMessage(utilService.translate("Play backward: {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate(action_description) }));
                    }
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
                        case "CHANGE_RETIREMENT_LIFESTYLE":
                            this.showSessionAndCallback('aretirement', function () {
                                self.backwardActionChangeRetirementLifeStyle(playAction);
                                $rootScope.scrollToSession('retirement');
                            });
                            break;
                        case "CHANGE_INVESTMENT_START":
                            this.showSessionAndCallback('ainvestments', function () {
                                self.backwardActionChangeInvestmentStart(playAction);
                                $rootScope.scrollToSession('investmentSwiper');
                            });                            
                            break;
                        case "CHANGE_RISK_RETURN":
                            this.backwardActionRiskAndRiskReturnValue(playAction);
                            break;
                        case "SIMULATE_RANKING_DREAM":
                            this.backwardActionSimulateRankingDream(playAction);
                            break;
                        case "CHANGE_RETIREMENT_AGE":
                            this.backwardActionChangeRetirementAge(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "CHANGE_SOCIAL_SECURITY_AGE":
                            this.backwardActionChangeSocialSecurityAge(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "MOVE_DREAM_PURCHAGE":
                            this.backwardActionMoveDreamPurchage(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "MOVE_LIFEEVENT_PURCHAGE":
                            this.backwardActionMoveLifeEventPurchage(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "ADD_DREAM":
                            this.backwardActionAddDream(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "ADD_LIFEEVENT":
                            this.backwardActionAddLifeEventNew(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "EDIT_DREAM":
                            this.backwardActionEditDream(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "EDIT_LIFEEVENT":
                            this.backwardActionEditLifeEventNew(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "CHANGE_START_AGE":
                            this.backwardActionChangeStartAge(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "NEW_SCENARIO_BUTTON":
                            this.backwardActionChangePersonaPlanToNew(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "CURRENT_SCENARIO_BUTTON":
                            this.backwardActionChangePersonaPlanToCurrent(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "RESET_PLAN_BUTTON":
                            this.backwardActionResetPlan(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "REMOVE_LIFEEVENT":
                            this.backwardActionRemoveLifEvent(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "REMOVE_DREAM":
                            this.backwardActionRemoveDream(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "MANAGE_SOLUTION":
                            this.backwardActionManageSolution(playAction);
                            $rootScope.scrollToSession('div_Header');
                            break;
                        case "CLOSE_SOLUTION":
                            this.backwardActionCloseSolution(playAction);
                            $rootScope.scrollToSession('div_Header');
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
                            $rootScope.scrollToSession('div_Header');
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
                            $rootScope.scrollToSession('div_Header');
                            break;
                        case "CHANGE_CURRENCY_CODE":
                            this.backwardActionChangeCurrency(playAction);
                            $rootScope.scrollToSession('div_Header');
                            break;
                        case "CHANGE_CASH_FLOW":
                            this.showSessionAndCallback('asavings', function () {
                                self.backwardActionChangeCashFlow(playAction);
                            });
                            break;
                        case "UPDATE_PROFILE":
                            this.backwardActionUpdateProfile(playAction);
                            break;
                            
                    };
                } catch (ex) {
                    console.log(ex);
                }
                this.initOverlay();
            },

            performForwardAction: function (playAction) {
                
                try {
                    $('.modal-backdrop').hide();
                    var self = this;
                    
                                       
                    $rootScope.playBackPlayerData.data = null;
                    //if (playAction.action_name != 'TAB_CLICK') {
                    var action_description = playAction.action_description;
                    if (playAction.action_name != 'CHANGE_CASH_FLOW' && playAction.action_name != 'CHANGE_INVESTMENT_START') {
                        utilService.showInfoMessage(utilService.translate("Play forward: {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate(action_description) }));
                    }
                    //}
                    //utilService.showWarningMessage(playAction.order +  ". " + playAction.action_description);
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
                        case "CHANGE_RETIREMENT_LIFESTYLE":
                            this.showSessionAndCallback('aretirement', function () {
                                self.actionChangeRetirementLifeStyle(playAction);
                                $rootScope.scrollToSession('retirement');
                            });
                            break;
                        case "CHANGE_INVESTMENT_START":
                            this.showSessionAndCallback('ainvestments', function () {
                                self.actionChangeInvestmentStart(playAction);
                                $rootScope.scrollToSession('investmentSwiper');
                            });
                            
                            break;
                        case "CHANGE_RISK_RETURN":
                            this.actionRiskAndRiskReturnValue(playAction);
                            break;
                        case "SIMULATE_RANKING_DREAM":
                            this.actionSimulateRankingDream(playAction);
                            break;
                        case "CHANGE_RETIREMENT_AGE":
                            this.actionChangeRetirementAge(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "CHANGE_SOCIAL_SECURITY_AGE":
                            this.actionChangeSocialSecurityAge(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "MOVE_DREAM_PURCHAGE":
                            this.actionMoveDreamPurchage(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "MOVE_LIFEEVENT_PURCHAGE":
                            this.actionMoveLifeEventPurchage(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "ADD_DREAM":
                            this.actionAddDream(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "ADD_LIFEEVENT":
                            this.actionAddLifeEventNew(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "CHANGE_START_AGE":
                            this.actionChangeStartAge(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "EDIT_DREAM":
                            this.actionEditDream(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "EDIT_LIFEEVENT":
                            this.actionEditLifeEventNew(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "NEW_SCENARIO_BUTTON":
                            this.actionChangePersonaPlanToNew(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "CURRENT_SCENARIO_BUTTON":
                            this.actionChangePersonaPlanToCurrent(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "RESET_PLAN_BUTTON":
                            this.actionResetPlan(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "REMOVE_LIFEEVENT":
                            this.actionRemoveLifEvent(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "REMOVE_DREAM":
                            this.actionRemoveDream(playAction);
                            $rootScope.scrollToSession('div_Timeline');
                            break;
                        case "MANAGE_SOLUTION":
                            this.actionManageSolution(playAction);
                            $rootScope.scrollToSession('div_Header');
                            break;
                        case "CLOSE_SOLUTION" :
                            this.actionCloseSolution(playAction);
                            $rootScope.scrollToSession('div_Header');
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
                            $rootScope.scrollToSession('div_Header');
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
                            $rootScope.scrollToSession('div_Header');
                            break;
                        case "CHANGE_CURRENCY_CODE":
                            this.actionChangeCurrency(playAction);
                            $rootScope.scrollToSession('div_Header');
                            break;
                        case "CHANGE_CASH_FLOW":
                            this.showSessionAndCallback('asavings', function () {
                                self.actionChangeCashFlow(playAction);
                            });
                            break;
                        case "UPDATE_PROFILE":
                            this.actionUpdateProfile(playAction);
                            break;
                    };
                } catch (ex) { console.log(ex); }
                this.initOverlay();
            }, 
            actionSwitchTab: function (playAction) {
                
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                $rootScope.playBackPlayerData.data = null;
                $timeout(function () {
                    $rootScope.actionService.calculateData();
                }, 1000);
                playAction.oldState = $state.current.name;
                switch (playAction.data.Name) {
                    case CONFIG.TAB.MAIN:
                        try {
                            utilService.stateGo(CONFIG.TAB.MAIN);
                        } catch (ex) { }
                        break;
                    case CONFIG.TAB.INCOME_EXPENSE:
                        utilService.stateGo(CONFIG.TAB.INCOME_EXPENSE);
                        break;
                    case CONFIG.TAB.LIQUID_ASSET:
                        utilService.stateGo(CONFIG.TAB.LIQUID_ASSET);
                        break;
                    case CONFIG.TAB.ILLIQUID_ASSET:
                        utilService.stateGo(CONFIG.TAB.ILLIQUID_ASSET);
                        break;
                    case CONFIG.TAB.RANKING_DREAM:
                        utilService.stateGo(CONFIG.TAB.RANKING_DREAM);
                        break;
                }
                // this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionSwitchTab: function (playAction) {
                if ($rootScope.playBackPlayerData.playBackActionList.length > 0) {
                    var actionData = $rootScope.playBackPlayerData.playBackActionList[$rootScope.playBackPlayerData.playBackActionList.length - 1];
                    //$rootScope.playBackPlayerData.data = actionData.dataCalculate;
                    utilService.stateGo(playAction.oldState);
                } else {
                    this.reloadSession();
                }
                $rootScope.playBackPlayerData.data = null;
                $timeout(function () {
                    $rootScope.actionService.calculateData();
                }, 1000);
                
            },
            // Income today
            actionChangeIncomeToday: function (playAction) {
                if (version_id == 3) {
                    $rootScope.savingRate.carouselIndex = 0;
                    $rootScope.utilService.scopeApply();
                    $rootScope.hightLightObjectById('salary_income_today');
                    var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                    $rootScope.changeFieldValueOfPersonalPlan('income_today', tovalue);
                    var itemParam = {
                        name: 'recurring_income',
                        value: $rootScope.PersonaPlan.income_today
                    };
                    $rootScope.savingRate.updateCashFlowParam(itemParam);
                    //this.reloadCurrentStateWithCalculateData(playAction);
                } else {
                    $rootScope.hightLightFieldNamOfPersonalPlan('income_today')
                    var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                    $rootScope.changeFieldValueOfPersonalPlan('income_today', tovalue);
                    //this.reloadCurrentStateWithCalculateData(playAction);
                }
                
            },
            
            backwardActionChangeIncomeToday: function (playAction) {
                if (version_id == 3) {
                    $rootScope.savingRate.carouselIndex = 0;
                    $rootScope.utilService.scopeApply();
                    $rootScope.hightLightObjectById('salary_income_today');
                    var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                    $rootScope.changeFieldValueOfPersonalPlan('income_today', fromvalue);
                    var itemParam = {
                        name: 'recurring_income',
                        value: $rootScope.PersonaPlan.income_today
                    };
                    $rootScope.savingRate.updateCashFlowParam(itemParam);
                    //this.reloadCurrentStateWithCalculateData(playAction);
                } else {
                    $rootScope.hightLightFieldNamOfPersonalPlan('income_today')
                    var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                    $rootScope.changeFieldValueOfPersonalPlan('income_today', fromvalue);
                    //this.reloadCurrentStateWithCalculateData(playAction);
                }
            },

            // Expense today
            actionChangeExpenseToday: function (playAction) {
                //if (angular.isDefined(swiper)) { swiper.slideTo(2); }
                if (version_id == 3) {
                    $rootScope.savingRate.carouselIndex = 2;
                    $rootScope.utilService.scopeApply();
                    $rootScope.hightLightObjectById('salary_expense_today');
                    var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                    $rootScope.changeFieldValueOfPersonalPlan('expense_today', tovalue);
                    var itemParam = {
                        name: 'recurring_expenses',
                        value: $rootScope.PersonaPlan.expense_today
                    };
                    $rootScope.savingRate.updateCashFlowParam(itemParam);
                    //this.reloadCurrentStateWithCalculateData(playAction);
                } else {
                    $rootScope.hightLightFieldNamOfPersonalPlan('expense_today')
                    var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                    $rootScope.changeFieldValueOfPersonalPlan('expense_today', tovalue);
                    //this.reloadCurrentStateWithCalculateData(playAction);
                }
            },

            backwardActionChangeExpenseToday: function (playAction) {
                if (version_id == 3) {
                    $rootScope.savingRate.carouselIndex = 2;
                    $rootScope.utilService.scopeApply();
                    $rootScope.hightLightObjectById('salary_expense_today');
                    var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                    $rootScope.changeFieldValueOfPersonalPlan('expense_today', fromvalue);
                    var itemParam = {
                        name: 'recurring_expenses',
                        value: $rootScope.PersonaPlan.expense_today
                    };
                    //this.reloadCurrentStateWithCalculateData(playAction);
                } else {
                    $rootScope.hightLightFieldNamOfPersonalPlan('expense_today')
                    var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                    $rootScope.changeFieldValueOfPersonalPlan('expense_today', fromvalue);
                    //this.reloadCurrentStateWithCalculateData(playAction);
                }
            },

            // Expense at retirement
            actionChangeExpenseAtRetirement: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('expense_at_retirement')
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('expense_at_retirement', tovalue);
                for (var i = 0 ; i < $rootScope.retirementLife.length; i++) {
                    if ($rootScope.retirementLife[i].value == $rootScope.PersonaPlan.expense_at_retirement) {
                        $rootScope.selectedretirementLife = angular.copy( $rootScope.retirementLife[i]);
                        break;
                    }
                };
                if ($rootScope.selectedretirementLife == null) {
                    $rootScope.selectedretirementLife = angular.copy( $rootScope.retirementLife[1]);
                    $rootScope.PersonaPlan.expense_at_retirement = $rootScope.selectedretirementLife.value;
                };
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangeExpenseAtRetirement: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('expense_at_retirement')
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('expense_at_retirement', fromvalue);
                for (var i = 0 ; i < $rootScope.retirementLife.length; i++) {
                    if ($rootScope.retirementLife[i].value == $rootScope.PersonaPlan.expense_at_retirement) {
                        $rootScope.selectedretirementLife = angular.copy( $rootScope.retirementLife[i]);
                        break;
                    }
                };
                if ($rootScope.selectedretirementLife == null) {
                    $rootScope.selectedretirementLife = angular.copy( $rootScope.retirementLife[1]);
                    $rootScope.PersonaPlan.expense_at_retirement = $rootScope.selectedretirementLife.value;
                };
                //this.reloadCurrentStateWithCalculateData(playAction);
            },
            // Retirement lifestyle
            actionChangeRetirementLifeStyle: function (playAction) { 
                $rootScope.hightLightObjectById('com_expense_at_retirement');
                $rootScope.changeFieldValueOfPersonalPlan('retirement_lifestyle', parseInt( playAction.data[0].tovalue)); 
                this.reloadCurrentStateWithCalculateData(playAction);
            },
            backwardActionChangeRetirementLifeStyle: function (playAction) {
                $rootScope.hightLightObjectById('com_expense_at_retirement');
                $rootScope.changeFieldValueOfPersonalPlan('retirement_lifestyle', parseInt(playAction.data[0].fromvalue));
                this.reloadCurrentStateWithCalculateData(playAction);
            },
            // change investment
            actionChangeInvestmentStart: function (playAction) {
                $rootScope.investment.playBack(playAction);
                this.reloadCurrentStateWithCalculateData(playAction);
            },
            backwardActionChangeInvestmentStart: function (playAction) {
                $rootScope.investment.playBack(playAction);
                this.reloadCurrentStateWithCalculateData(playAction);
            },
            // Current Saving
            actionChangeCurrentSaving: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('current_saving')
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('current_saving', tovalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangeCurrentSaving: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('current_saving')
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('current_saving', fromvalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            // Trial Number
            actionChangeTrialNumber: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('number_trials')
                var tovalue = parseInt(playAction.data[0].tovalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('number_trials', tovalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },
            backwardActionChangeTrialNumber: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('number_trials')
                var fromvalue = parseInt(playAction.data[0].fromvalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('number_trials', fromvalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            // Top Value
            actionChangeTopValue: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('mc_top_value')
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('mc_top_value', tovalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangeTopValue: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('mc_top_value')
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('mc_top_value', fromvalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            // Bottom Value
            actionChangeBottomValue: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('mc_bottom_value')
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('mc_bottom_value', tovalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangeBottomValue: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('mc_bottom_value')
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('mc_bottom_value', fromvalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },
            
            // Inflaction 
            actionChangeInflaction: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('inflation')
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('inflation', tovalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangeInflaction: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('inflation')
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('inflation', fromvalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            // Salary evolution
            actionChangeSalaryEvolution: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('salary_evolution')
                var tovalue = parseFloat(playAction.data[0].tovalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('salary_evolution', tovalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangeSalaryEvolution: function (playAction) {
                $rootScope.hightLightFieldNamOfPersonalPlan('salary_evolution')
                var fromvalue = parseFloat(playAction.data[0].fromvalue.replace(",", "."));
                $rootScope.changeFieldValueOfPersonalPlan('salary_evolution', fromvalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            
            // Risk and risk return
            actionRiskAndRiskReturnValue: function (playAction) {
                var risk_tovalue = this.parseStringToFloat(playAction.data[1].tovalue);
                var riskReturn_tovalue = this.parseStringToFloat(playAction.data[0].tovalue);
                $rootScope.hightLightFieldNamOfPersonalPlan('volatility')
                $rootScope.changeFieldValueOfPersonalPlan('volatility', risk_tovalue);
                $rootScope.hightLightFieldNamOfPersonalPlan('risk_return')
                $rootScope.changeFieldValueOfPersonalPlan('risk_return', riskReturn_tovalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },
            backwardActionRiskAndRiskReturnValue: function (playAction) {
                var risk_fromvalue = this.parseStringToFloat(playAction.data[1].fromvalue);
                var riskReturn_fromvalue = this.parseStringToFloat(playAction.data[0].fromvalue);
                $rootScope.hightLightFieldNamOfPersonalPlan('volatility')
                $rootScope.changeFieldValueOfPersonalPlan('volatility', risk_fromvalue);
                $rootScope.hightLightFieldNamOfPersonalPlan('risk_return')
                $rootScope.changeFieldValueOfPersonalPlan('risk_return', riskReturn_fromvalue);
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            // Add new dream
            backwardActionAddDream: function (playAction) {
                $rootScope.actionRemoveDreamEvent(playAction.data);
            },
            actionAddDream: function (playAction) {
               
                playAction.data.type = 'dream';
                playAction.newValue = playAction.data;
                $rootScope.PersonaPlan.dreams.push(playAction.newValue);
                $rootScope.addDreamToPlayBack(playAction.data);
            },

            // Remove Dream Event
            actionRemoveDream: function (playAction) {
                //console.log(playAction);
                playAction.newValue = playAction.data;
                angular.forEach($rootScope.DreamTypes, function (item) {
                    if (item.id == playAction.data.dream_type_id) {
                        playAction.dream_type = angular.copy(item);
                        playAction.newValue.dream_type = angular.copy(item);
                    }
                });
                playAction.data.type = 'dream';
                $rootScope.actionRemoveDreamEvent(playAction.data);
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionRemoveDream: function (playAction) {
                //console.log("playBack", playAction);
                // Add new Dream event
                playAction.data.type = 'dream';
                playAction.newValue = playAction.data;
                $rootScope.PersonaPlan.dreams.push(playAction.newValue);
                $rootScope.selectedDreamOrLifeEvent = playAction.newValue;
                $rootScope.addDreamToPlayBack(playAction.data);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },

            // Add new life event
            actionAddLifeEventNew: function (playAction) {
                console.log('actionAddLifeEventNew');
                playAction.data.type = 'lifeevent';
                playAction.newValue = playAction.data;
                $rootScope.selectedDreamOrLifeEvent = playAction.newValue;
                $rootScope.addLifeEventToPlayBack(playAction.data);
            },

            backwardActionAddLifeEventNew: function (playAction) {
                $rootScope.removeLifeEventToPlayBack(playAction.data);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },
            
            // Remove Life Event
            actionRemoveLifEvent: function (playAction) {
                playAction.newValue = playAction.data;
                angular.forEach($rootScope.DreamTypes, function (item) { 
                    if (item.id == playAction.data.dream_type_id) {
                        playAction.dream_type = angular.copy(item);
                        playAction.newValue.dream_type = angular.copy(item);
                    }
                });                
                playAction.data.type = 'lifeevent';
                $rootScope.removeLifeEventToPlayBack(playAction.data);
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                //this.reloadCurrentStateWithCalculateData(playAction);
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
                        var fromvalue = self.parseStringToFloat(item.fromvalue);
                        newValue[item.fieldname] = tovalue;
                        oldValue[item.fieldname] = fromvalue;
                    });
                    playAction.newValue = newValue;
                    playAction.oldValue = oldValue;
                    playAction.type = 'dream';
                    playAction.dream_type_id = newValue.dream_type_id;
                    
                    $rootScope.selectedDreamOrLifeEvent = playAction.newValue;
                    $rootScope.editDreamToPlayBack(playAction.newValue);
                }
            },
            backwardActionEditDream: function (playAction) {
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
                        var fromvalue = self.parseStringToFloat(item.fromvalue);
                        newValue[item.fieldname] = fromvalue;
                        oldValue[item.fieldname] = tovalue;
                    });
                }
                playAction.newValue = newValue;
                playAction.oldValue = oldValue;
                $rootScope.selectedDreamOrLifeEvent = playAction.oldValue;
                $rootScope.editDreamToPlayBack(playAction.oldValue);
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
                        var fromvalue = self.parseStringToFloat(item.fromvalue);
                        newValue[item.fieldname] = tovalue;
                        oldValue[item.fieldname] = fromvalue;
                    });
                    playAction.newValue = newValue;
                    playAction.oldValue = oldValue;
                    playAction.type = 'lifeevent';
                    playAction.dream_type_id = newValue.dream_type_id;
                    
                    $rootScope.selectedDreamOrLifeEvent = playAction.newValue;
                    $rootScope.editLifeEventToPlayBack(playAction.newValue);
                }
            },
            backwardActionEditLifeEventNew: function (playAction) {
                var oldValue = null;
                angular.forEach($rootScope.PersonaPlan.lifeEvent, function (item) {
                    if (item.id == playAction.data.id) oldValue = item;
                });
                if (oldValue != null) {
                    var self = this;
                    var newValue = angular.copy(oldValue);
                    angular.forEach(playAction.data.listchange, function (item) {
                        var tovalue = self.parseStringToFloat(item.tovalue);
                        var fromvalue = self.parseStringToFloat(item.fromvalue);
                        newValue[item.fieldname] = fromvalue;
                        oldValue[item.fieldname] = tovalue;
                    });
                }

                playAction.newValue = newValue;
                playAction.oldValue = oldValue;
                $rootScope.selectedDreamOrLifeEvent = playAction.oldValue;
                $rootScope.editLifeEventToPlayBack(playAction.oldValue);
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
                    $rootScope.moveTimelineObject(playAction.name, playAction.oldValue.purchase_age, playAction.newValue.purchase_age);
                } else if (playAction.type == 'lifeevent') {
                    $rootScope.moveTimelineObject(playAction.name, playAction.oldValue.starting_age, playAction.oldValue.starting_age);
                }
            },

            backwardActionUpdateLifeEvent: function (playAction) {
                if (playAction.type == 'residence') {
                    var name = $rootScope.PersonaPlan.dreams[playAction.dreamIndex].name;
                    $rootScope.moveTimelineObject(name, playAction.newValue.purchase_age, playAction.oldValue.purchase_age);
                }
            },

                
            actionSimulateRankingDream: function (playAction) {
                $rootScope.scope.listRanking = playAction.data.sort(function (a, b) {
                    return a.index >= b.index;
                });
                $timeout(function () {
                    if (angular.isDefined($rootScope.scope.rankingResults)) {
                        var isStill = "";
                        $rootScope.scope.rankingResults = [];
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
                            $rootScope.scope.rankingResults[$rootScope.scope.rankingResults.length] = {
                                label: label,
                                year: playAction.dataCalculate[i]
                            }
                            
                        }
                    }
                }, 1500);

            },
            backwardActionSimulateRankingDream: function (playAction) {
                
                var previousActionData = $rootScope.playBackPlayerData.playBackActionList[$rootScope.playBackPlayerData.playBackActionList.length - 1];
                if (previousActionData.action_name == 'SIMULATE_RANKING_DREAM') {
                    this.actionSimulateRankingDream(previousActionData);
                } else {
                    this.reloadPlaybackCurrentStateWithCalculateData();
                }
            },
        
            // Change Retirement age
            actionChangeRetirementAge: function (playAction) {
                if (playAction.data.length == 1) {
                    var fromvalue = this.parseStringToInt(playAction.data[0].fromvalue);
                    var tovalue = this.parseStringToInt(playAction.data[0].tovalue);
                    $rootScope.moveTimelineObject("retirement_age", fromvalue, tovalue);
                    $rootScope.PersonaPlan.retirement_age = tovalue;
                }
                else {
                    $rootScope.actionMoveRetirementAndSocialAge(playAction);
                }
                
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangeRetirementAge: function (playAction) {
                if (playAction.data.length == 1) {
                    var fromvalue = this.parseStringToInt(playAction.data[0].fromvalue);
                    var tovalue = this.parseStringToInt(playAction.data[0].tovalue);
                    $rootScope.moveTimelineObject("retirement_age", tovalue, fromvalue);
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
                $rootScope.moveTimelineObject("social_security_age", fromvalue, tovalue);
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                $rootScope.PersonaPlan.social_security_age = tovalue;
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangeSocialSecurityAge: function (playAction) {
                var fromvalue = this.parseStringToInt(playAction.data[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data[0].tovalue);
                $rootScope.moveTimelineObject("social_security_age", tovalue, fromvalue);
                $rootScope.PersonaPlan.social_security_age = tovalue;
                this.reloadPlaybackCurrentStateWithCalculateData();
            },
            
            // Move dream purchase
            actionMoveDreamPurchage: function(playAction){
                var fromvalue = this.parseStringToInt(playAction.data.listchange[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data.listchange[0].tovalue);
                $rootScope.moveTimelineObject("dream_" + playAction.data.id, fromvalue, tovalue);
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;                
                var index = getIndexOfDataId($rootScope, 'dream', playAction.data.id);
                $rootScope.PersonaPlan.dreams[index].purchase_age = tovalue;
                //this.reloadCurrentStateWithCalculateData(playAction);
            },
            backwardActionMoveDreamPurchage: function(playAction){
                var fromvalue = this.parseStringToInt(playAction.data.listchange[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data.listchange[0].tovalue);
                $rootScope.moveTimelineObject("dream_" + playAction.data.id, tovalue, fromvalue);
                var index = getIndexOfDataId($rootScope, playAction.type, playAction.data.id);
                $rootScope.PersonaPlan.dreams[index].purchase_age = fromvalue;
                //this.reloadPlaybackCurrentStateWithCalculateData();
            },

            // Move life event purchase
            actionMoveLifeEventPurchage: function (playAction) {
                var fromvalue = this.parseStringToInt(playAction.data.listchange[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data.listchange[0].tovalue);
                $rootScope.moveTimelineObject("lifeevent_" + playAction.data.id, fromvalue, tovalue);
                var index = getIndexOfDataId($rootScope, playAction.type, playAction.data.id);
                $rootScope.PersonaPlan.lifeEvent[index].starting_age = tovalue;
                $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan, this.childList);
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                //this.reloadCurrentStateWithCalculateData(playAction);
            },
            backwardActionMoveLifeEventPurchage: function (playAction) {
                var fromvalue = this.parseStringToInt(playAction.data.listchange[0].fromvalue);
                var tovalue = this.parseStringToInt(playAction.data.listchange[0].tovalue);
                $rootScope.moveTimelineObject("lifeevent_" + playAction.data.id, tovalue, fromvalue);
                var index = getIndexOfDataId($rootScope, playAction.type, playAction.data.id);
                $rootScope.PersonaPlan.lifeEvent[index].starting_age = fromvalue;
                $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan, this.childList);
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
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                //this.reloadCurrentStateWithCalculateData(playAction);
            },
            backwardActionChangeStartAge: function (playAction) {
                $rootScope.backwardActionChangeStartAge(playAction);
                this.reloadPlaybackCurrentStateWithCalculateData();
            },


            // Current Plan
            actionChangePersonaPlanToCurrent: function (playAction) {
                playAction.oldPersonaPlan = angular.copy($rootScope.PersonaPlan);
                $rootScope.PersonaPlan = playAction.data;
                $rootScope.setCurrentActive();
                this.updateCurrency();
                this.renderPlan();
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                //this.reloadCurrentStateWithCalculateData(playAction);
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
                $rootScope.PersonaPlan = angular.copy(playAction.data);                
                this.updateCurrency();
                $rootScope.setNewButtonActive();
                this.renderPlan();
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            backwardActionChangePersonaPlanToNew: function (playAction) {
                $rootScope.PersonaPlan = angular.copy(playAction.oldPersonaPlan);
                $rootScope.setCurrentActive();
                this.updateCurrency();
                this.renderPlan();
                //this.reloadPlaybackCurrentStateWithCalculateData();
            },

            // Reset plan
            actionResetPlan: function (playAction) {
                
                playAction.oldPersonaPlan = angular.copy($rootScope.PersonaPlan);
                playAction.oldCashFlow = angular.copy($rootScope.cashFlow);
                $rootScope.PersonaPlan = playAction.data;
                // Update investment
                if (angular.isDefined($rootScope.investment)) {
                    $rootScope.investment.resetPlan();
                }
                $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan, this.childList);
                this.renderPlan();
                
            },

            backwardActionResetPlan: function (playAction) {
                $rootScope.PersonaPlan = angular.copy(playAction.oldPersonaPlan);
                $rootScope.cashFlow = angular.copy(playAction.oldCashFlow);
                if (angular.isDefined($rootScope.investment)) {
                    $rootScope.investment.updateInvestmentStartOfCashFlow(playAction.listPersona);
                }
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
                    utilService.HideRenameDialog();
                }, 2000);
            },

            actionDeleteSolution: function(playAction) {
                
                $rootScope.solutionScope.RemoveUnitWork(playAction.data);
                playAction.oldRowColection = angular.copy($rootScope.solutionScope.rowCollection);
                $timeout(function() {
                    utilService.HideDialog();
                }, 2000);
            },
            
            // Rename solution
            backwardActionRenameSolution: function (playAction) {
                $rootScope.solutionScope.RenameUnitWork(playAction.data);
                $rootScope.playBackPlayerData.data = playAction.oldRowColection;
                $rootScope.solutionScope.GetSolution();
                $timeout(function() {
                    utilService.HideRenameDialog();
                }, 2000);
            },
      
            actionRenameSolution: function (playAction) {
                
                $rootScope.solutionScope.RenameUnitWork(playAction.data);
                playAction.oldRowColection = angular.copy($rootScope.solutionScope.rowCollection);
                $timeout(function() {
                    utilService.HideRenameDialog();
                }, 2000);
                
            },

            // Save solution
            backwardActionSaveSolution: function (playAction) {
                
                $rootScope.solutionScope.SaveUnitOfWork(playAction.data);
                $timeout(function () {
                    $rootScope.solutionScope.HideDialog();
                }, 2000);
                $rootScope.playBackPlayerData.data = playAction.oldRowColection;
                $rootScope.solutionScope.GetSolution();
                $timeout(function() {
                    $rootScope.solutionScope.HideRenameDialog();
                }, 2000);
            },

            actionSaveSolution: function (playAction) {
                
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
                
                playAction.data.version = maxVersion;
                $timeout(function () {
                    $rootScope.solutionScope.HideRenameDialog();
                }, 2000);
            },

            // Load solution
            backwardActionLoadSolution: function (playAction) {
                $rootScope.PersonaPlan = playAction.oldPersonaPlan;
                $rootScope.playBackPlayerData.data = playAction.oldCalculateData;
                utilService.stateReload();
            },

            actionLoadSolution: function (playAction) {
                $rootScope.solutionScope.LoadUnitOfWork(playAction.data);
                playAction.oldPersonaPlan = angular.copy($rootScope.PersonaPlan);

                // oldCalculateData
                /*
                var oldCalculateData = this.startAction.dataCalculate;
                for (var i = 0 ; i < $rootScope.playBackPlayerData.playBackActionList.length; i++) {
                    if ($rootScope.playBackPlayerData.playBackActionList[i].dataCalculate != null) {
                        oldCalculateData = $rootScope.playBackPlayerData.playBackActionList[i].dataCalculate;
                    }
                }
                playAction.oldCalculateData = angular.copy(oldCalculateData);
                */
                $rootScope.PersonaPlan = playAction.data.currentPlan;
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                utilService.stateReload();
                //$state.reload();
                $timeout(function () {
                    $rootScope.solutionScope.HideDialog();
                }, 2000);
            },

            // Manage solution
            backwardActionManageScenario: function (playAction) {
                utilService.HideScenarioDialog();
            },

            actionManageScenario: function (playAction) {
                $('#manageScenario').modal({ backdrop: 'static', keyboard: false });
                $rootScope.scenarioScope.listScenario = playAction.data;
                $rootScope.spinner.off();
            },

            // New Scenario
            backwardActionNewScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                utilService.ShowDialog($rootScope, utilService.translate("Confirm"), utilService.translate("Do you want to delete {{length}} row(s)", {
                    length: 1
                }), utilService.translate("Ok"));
                $timeout(function () {
                    utilService.showSuccessMessage(utilService.translate("Deleted {{length}} row(s) successful!", { length: 1 }), 1000);
                    utilService.HideDialog();
                }, playAction.duration);
            },

            actionNewScenario: function(playAction) {
                $rootScope.scenarioScope.NewScenario(playAction.data);
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                $rootScope.scenarioScope.listScenario.push(playAction.data);
                $timeout(function () {
                    utilService.showSuccessMessage(utilService.translate("Your scenario:  {{name}} was successfully created!", playAction.data), 1000);
                    utilService.HideRenameDialog();
                }, playAction.duration);
            },
          
            // Duplicate Scenario
            backwardActionDuplicateScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                utilService.ShowDialog($rootScope, utilService.translate("Confirm"),utilService.translate("Do you want to delete {{length}} row(s)", { length: playAction.data.length
                }), utilService.translate("Ok"));
                $timeout(function () {
                    utilService.showSuccessMessage(utilService.translate("Deleted {{length}} row(s) successful!", { length: playAction.data.length }), 1000);
                    utilService.HideDialog();
                }, playAction.duration);
            },

            actionDuplicateScenario: function (playAction) {
                utilService.showSuccessMessage(utilService.translate("Duplicated {{length}} row(s) successful!", {
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
                    utilService.showSuccessMessage(utilService.translate("Renamed your scenario {{name}} successful!",playAction.data), 1000);
                    utilService.HideRenameDialog();
                }, playAction.duration);
            },

            // Make Current Scenario
            backwardActionMakeCurrentScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                angular.forEach($rootScope.scenarioScope.listScenario, function (item) {
                    if (item.status == 0) {
                        utilService.showSuccessMessage(utilService.translate("Your scenario: {{name}} was marked as current scenario!", item), 1000);
                    }
                });
            },

            actionMakeCurrentScenario: function (playAction) {
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                $rootScope.scenarioScope.makeCurrentPlayback(playAction.data);
                $timeout(function () {
                    utilService.showSuccessMessage(utilService.translate("Your scenario: {{name}} was marked as current scenario!", playAction.data), 1000);
                }, playAction.duration);
            },

            // Make New Scenario
            backwardActionMakeNewScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                angular.forEach($rootScope.scenarioScope.listScenario, function (item) {
                    if (item.status == 0) {
                        utilService.showSuccessMessage(utilService.translate("Your scenario: {{name}} was marked as new scenario!", item), 1000);     
                    }
                });                
            },
            
            actionMakeNewScenario: function (playAction) {
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                $rootScope.scenarioScope.makeNewPlayback(playAction.data);
                $timeout(function () {
                    utilService.showSuccessMessage(utilService.translate("Your scenario: {{name}} was marked as new scenario!", playAction.data), 1000);
                }, playAction.duration);
            },

            // Delete Scenario
            backwardActionDeleteScenario: function (playAction) {
                $rootScope.scenarioScope.listScenario = angular.copy(playAction.oldListScenario);
                $timeout(function () {
                    utilService.showSuccessMessage(utilService.translate("Your scenario:  {{name}} was successfully created!", playAction.data), 1000);
                    utilService.HideDialog();
                }, playAction.duration);
            },

            actionDeleteScenario: function (playAction) {
                playAction.oldListScenario = angular.copy($rootScope.scenarioScope.listScenario);
                utilService.ShowDialog($rootScope, utilService.translate("Confirm"),utilService.translate("Do you want to delete {{length}} row(s)", {
                    length: playAction.data.length }),utilService.translate("Ok") );
                angular.forEach(playAction.data, function (scenario) {
                    for (var i = 0; i < $rootScope.scenarioScope.listScenario.length; i++) {
                        if (scenario.id == $rootScope.scenarioScope.listScenario[i].id) {
                            $rootScope.scenarioScope.listScenario.splice(i, 1);
                            break;
                        }
                    }
                });
                
                $timeout(function () {
                    utilService.showSuccessMessage(utilService.translate("Deleted {{length}} row(s) successful!", { length: playAction.data.length }), 1000);
                    utilService.HideDialog();
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
                /*
                var oldCalculateData = this.startAction.dataCalculate;
                for (var i = 0 ; i < $rootScope.playBackPlayerData.playBackActionList.length; i++) {
                    if ($rootScope.playBackPlayerData.playBackActionList[i].dataCalculate != null) {
                        oldCalculateData = $rootScope.playBackPlayerData.playBackActionList[i].dataCalculate;
                    }
                }
                playAction.oldCalculateData = angular.copy(oldCalculateData);
                */
                $rootScope.PersonaPlan = playAction.data;
                //$rootScope.playBackPlayerData.data = playAction.dataCalculate;
                utilService.stateReload();
                //$state.reload();
                $timeout(function () {
                    utilService.HideScenarioDialog();
                }, 1500);
            },

            // Change currency
            backwardActionChangeCurrency: function (playAction) {
                var fromvalue = angular.copy(playAction.data[0].fromvalue);
                $rootScope.hightLightFieldNamOfPersonalPlan('currency_code')
                $rootScope.changeFieldValueOfPersonalPlan('currency_code', fromvalue);
                $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.PersonaPlan.currency_code + ' ';
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            actionChangeCurrency: function (playAction) {
                var tovalue = angular.copy(playAction.data[0].tovalue); 
                $rootScope.hightLightFieldNamOfPersonalPlan('currency_code')
                $rootScope.changeFieldValueOfPersonalPlan('currency_code', tovalue);
                $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.PersonaPlan.currency_code + ' ';
                //this.reloadCurrentStateWithCalculateData(playAction);
            },

            updateCurrency: function () {
                if (angular.isDefined($rootScope.PersonaPlan.currency_code)) {
                    $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.PersonaPlan.currency_code + ' ';
                }
            },

            // Update Profile
            backwardActionUpdateProfile: function (playAction) {
                $rootScope.cashFlow = angular.copy(playAction.oldCashFlow);
                $rootScope.ProfileName = angular.copy(playAction.oldProfileName);
                $rootScope.actionService.calculateData();
            },

            actionUpdateProfile: function (playAction) {
                playAction.oldCashFlow = angular.copy($rootScope.cashFlow);
                playAction.oldProfileName = angular.copy($rootScope.ProfileName);
                playAction.oldChildList = angular.copy(this.childList);
                //this.childList = playAction.data.chi
                this.updateCashFlowByProfileAndCashFlow(null, playAction.data);
                $rootScope.actionService.calculateData();                
            },

            // Change cashflow
            backwardActionChangeCashFlow: function (playAction) {
                $rootScope.PersonaPlan.return_cashFlow = true;
                var itemParam = {
                    name: '',
                    value: null
                };
                if (playAction.data.variable == 'recurring_income') {
                    $rootScope.PersonaPlan.income_today = playAction.data.oldValue;
                    $rootScope.hightLightObjectById('salary_income_today');
                    $rootScope.savingRate.carouselIndex = 0;
                    $rootScope.utilService.scopeApply();
                    itemParam.name = 'recurring_income';
                    itemParam.value = $rootScope.PersonaPlan.income_today;
                    utilService.showInfoMessage(utilService.translate("Play backward: {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate(playAction.action_description) + ': ' + utilService.translate('MONTHLY SALARY') }));
                } else if (playAction.data.variable == 'recurring_expenses') {
                    $rootScope.PersonaPlan.expense_today = playAction.data.oldValue;
                    $rootScope.hightLightObjectById('salary_expense_today');
                    $rootScope.savingRate.carouselIndex = 2;
                    $rootScope.utilService.scopeApply();
                    itemParam.name = 'recurring_expenses';
                    itemParam.value = $rootScope.PersonaPlan.expense_today;
                    utilService.showInfoMessage(utilService.translate("Play backward: {{order}}. {{action_description}}", { order: playAction.order, action_description:utilService.translate(playAction.action_description) + ': ' + utilService.translate('MONTHLY EXPENSE') }));
                } else {
                    var result = this.findCashFlowItem(playAction.data);
                    if (result != null) {
                        result.value = playAction.data.oldValue;
                        $rootScope.hightLightObjectById('income_expense_' + result.name);
                        itemParam.name = playAction.data.name;
                        itemParam.value = playAction.data.value;
                    }                    
                    utilService.showInfoMessage(utilService.translate("Play backward: {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate(playAction.action_description) + ': ' + utilService.translate(playAction.data.variable + '_description', $rootScope.ProfileName) }));
                }
                $rootScope.PersonaPlan.return_cashFlow = true;
                $rootScope.savingRate.updateCashFlowParam(itemParam);
            },

            actionChangeCashFlow: function (playAction) {
                $rootScope.PersonaPlan.return_cashFlow = true;
                var itemParam = {
                    name: '',
                    value: null
                };
                if (playAction.data.variable == 'recurring_income') {
                    playAction.data.oldValue = $rootScope.PersonaPlan.income_today;
                    $rootScope.PersonaPlan.income_today = playAction.data.value;
                    $rootScope.hightLightObjectById('salary_income_today');
                    $rootScope.savingRate.carouselIndex = 0;
                    $rootScope.utilService.scopeApply();
                    itemParam.name = 'recurring_income';
                    itemParam.value = $rootScope.PersonaPlan.income_today;
                    utilService.showInfoMessage(utilService.translate("Play backward: {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate(playAction.action_description) + ': ' + utilService.translate('MONTHLY SALARY') }));
                } else if (playAction.data.variable == 'recurring_expenses') {                    
                    playAction.data.oldValue = $rootScope.PersonaPlan.expense_today;
                    $rootScope.PersonaPlan.expense_today = playAction.data.value;
                    $rootScope.hightLightObjectById('salary_expense_today');
                    $rootScope.savingRate.carouselIndex = 2;
                    $rootScope.utilService.scopeApply();
                    itemParam.name = 'recurring_expenses';
                    itemParam.value = $rootScope.PersonaPlan.expense_today;
                    utilService.showInfoMessage(utilService.translate("Play backward: {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate(playAction.action_description) + ': ' + utilService.translate('MONTHLY EXPENSE') }));
                } else {
                    var result = this.findCashFlowItem(playAction.data);
                    if (result != null) {
                        playAction.data.oldValue = result.value;
                        result.value = playAction.data.value;
                        $rootScope.hightLightObjectById('income_expense_' + result.name);
                        itemParam.name = result.name;
                        itemParam.value = playAction.data.value;
                    }
                    utilService.showInfoMessage(utilService.translate("Play backward: {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate(playAction.action_description) + ': ' + utilService.translate(playAction.data.variable + '_description', $rootScope.ProfileName) }));
                }
                $rootScope.PersonaPlan.return_cashFlow = true;
                $rootScope.savingRate.updateCashFlowParam(itemParam);
            },

            findCashFlowItem: function (cashFlowItem) {
                var result = null;
                var findItem = function (item) {
                    if (item.name == cashFlowItem.variable) {
                        result = item;
                    } else if (item.children.length > 0) {
                        for (var i = 0; i < item.children.length; i++) {
                            findItem(item.children[i]);
                        }
                    }
                }
                for (var i = 0; i < $rootScope.cashFlow.income.length; i++) {
                    findItem($rootScope.cashFlow.income[i]);
                    if (result != null) {
                        $rootScope.savingRate.expandControl($rootScope.cashFlow.income[i].name)
                        break;
                    }
                }
                // find in income
                if (result != null) {
                    $rootScope.savingRate.carouselIndex = 0;
                    $rootScope.utilService.scopeApply();
                    return result;
                } else {
                    for (var i = 0; i < $rootScope.cashFlow.expense.length; i++) {
                        findItem($rootScope.cashFlow.expense[i]);
                        if (result != null) {
                            $rootScope.savingRate.expandControl($rootScope.cashFlow.expense[i].name)
                            break;
                        }
                    }
                    if (result != null) {
                        $rootScope.savingRate.carouselIndex = 2;
                        $rootScope.utilService.scopeApply();
                        return result;
                    }
                }
                return result;
            },
        

            parseStringToFloat: function (str) {
                return parseFloat(str.replace(",", "."));  
            },

            parseStringToInt: function (str) {
                return parseInt(str.replace(",", "."));
            },

            reloadCurrentStateWithCalculateData: function (playAction) {
                /*
                if ($rootScope.scope != null) {
                    $rootScope.playBackPlayerData.data = playAction.dataCalculate;
                    utilService.scopeApply();
                    $rootScope.scope.callfromOutsite();
                } else {
                    console.log(playAction);
                    $rootScope.actionService.calculateData();
                    //this.updateCashFlow(playAction);
                    //$rootScope.ApplyAllData(playAction.dataCalculate);
                    //$rootScope.SendingScreenSharingDataObject(playAction.dataCalculate, 'AllData', 'AllData', '');
                }
                */
            },

            reloadPlaybackCurrentStateWithCalculateData: function () {
                if ($rootScope.playBackPlayerData.playBackActionList.length > 0) {
                    var actionData = $rootScope.playBackPlayerData.playBackActionList[$rootScope.playBackPlayerData.playBackActionList.length - 1];
                    //$rootScope.playBackPlayerData.data = actionData.dataCalculate;
                    utilService.stateReload();
                } else {
                    //this.reloadSession();
                }
            }
        }    
    }
);