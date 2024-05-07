btoApp.service('sharingService', function ($rootScope, personalPlanService, utilService, $timeout, $state, $locale, accountService, playbackService, CONFIG, $cookies) {
    $rootScope.viewers = [];
    $rootScope.sharingActionData = {
        action: null,
        data: null,
        result: null,
        isUpdate: true
    }
    this.showSharingService = function () {   
        $('#manageSharing').modal({ backdrop: 'static', keyboard: false });
        $rootScope.sharingService.initSharingOnTabSharing();
    }
    this.sendingSharingActionData = function () {
        try {          
            this.dataSend($rootScope.sharingActionData);
            $rootScope.playBackPlayerData.data = null;
            $rootScope.sharingActionData.action = '';
            delete $rootScope.sharingActionData.current_state;
        } catch (ex) { }
    }
    var hub = $.connection.controllerHub;
    this.dataSend = function (obj) {        
        if (isSharing && isPresenter) {
            console.log('Share Data send :', obj);
            hub.server.sendtransferData(obj)            
        }
    };
    this.checkIsSharing = function () {
        return isSharing;
    }
    this.checkDisableInvite= function () 
    {
        return isSharing || $('#mail_share').val().trim().length == 0;
    }
    this.setReloadSharing = function ()
    {
        $cookies.put('reloadsharing', localStorage.isSharing);
        $cookies.put('themeId', localStorage.version_id);
        $cookies.put('userId', localStorage.user_id);       
        $cookies.put('username', localStorage.user_name.replace('@','((A))'));        
        $cookies.put('user_name_are_taking_overing', localStorage.user_name_are_taking_overing.replace('@', '((A))'));
    }
    this.deleteReloadSharing = function ()
    {       
        $cookies.remove('reloadsharing');
        $cookies.remove('themeId');
        $cookies.remove('userId');
        $cookies.remove('username');
        $cookies.remove('user_name_are_taking_overing');
    }
    this.updateEnviromentForSharing = function () {
        user_id = localStorage.user_id;
        user_name = localStorage.user_name;
        version_id = localStorage.version_id;
        user_name_are_taking_overing = localStorage.user_name_are_taking_overing;
        isSharing = localStorage.isSharing;
        isPresenter = localStorage.isPresenter;        
    }        
    this.setEnviromentForSharing = function (presenterData, _isSharing, _isPresenter) {
        localStorage.user_id = presenterData.user_id;
        localStorage.user_name = presenterData.user_name;
        localStorage.version_id = presenterData.version_id;
        localStorage.user_name_are_taking_overing = presenterData.user_name_are_taking_overing;
        localStorage.isSharing = _isSharing;
        localStorage.isPresenter = _isPresenter;        
    }

    this.updatePresenterInformation = function (presenter) {
        localStorage.user_name_are_taking_overing = presenter;
        user_name_are_taking_overing = presenter;
        $cookies.put('user_name_are_taking_overing', presenter.replace('@', '((A))'));
    }
    this.CheckStillSharingAfterRefresh = function ()
    {
        if (localStorage.isSharing != "undefined" && localStorage.isSharing != null && localStorage.isSharing == 'true') {
            return true;
        }
        else
            return false;
    }
    this.deleteEnviromentForSharing = function () {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        localStorage.removeItem('version_id');
        localStorage.removeItem('isSharing');
        localStorage.removeItem('isPresenter');

        user_id = user_id_before_shared;
        user_name = user_name_before_shared;
        version_id = version_id_before_shared;
        isSharing = false;
        isPresenter = false;
    }
    this.initSharingOnTabSharing = function () {       
        utilService.callApi('POST', '/api/sharing/LoadViewer', '', { email: user_name }, function (response) {
            $rootScope.viewers = response;
        },
        function () {
            // callback failed
        },
        function () {
            // callback error
        })

        $("#mail_share").keyup(function () {           
            if ($(this).val()) {
                $("#invite_share").prop('disabled', false);
            }
            else {
                $("#invite_share").prop('disabled', true);
            }
        });

        $("#begin_share").click(function () {           
            //make user use mode sharing
            localStorage.isSharing = true;            
            localStorage.presenter = $('#userNameKeyId').val();            
          
            rootScope.isTakeOver = true;
            localStorage.user_id_sharing_owner = user_id;

            var dataInitSharing = { user_id: user_id_before_shared, user_name: user_name_before_shared, version_id: version_id_before_shared, user_name_are_taking_overing: user_name_before_shared };
            hub.server.startSharing(dataInitSharing);
            
            $rootScope.sharingService.setEnviromentForSharing(dataInitSharing, true, true);
            $rootScope.sharingService.updateEnviromentForSharing();
            $rootScope.sharingService.showSharingAtPresenter();
            $rootScope.sharingService.setReloadSharing();
            $("#begin_share").prop('disabled', true);
            $rootScope.setCurrentActive();
            $rootScope.timelineService.switchToCurrentPlan();
            utilService.stateGo(CONFIG.TAB.MAIN);
            $('#manageSharing').modal('hide');
        });
       
        $("#invite_share").click(function () {
           
            hub.server.inviteToEmail(user_name, $("#mail_share").val().replace(/\n/g, ";"), '').done(function (result) {
                $("#mail_share").val('');
                $("#invite_share").prop('disabled', true);
                utilService.scopeApply();
               utilService.ShowDialog($rootScope, utilService.translate("Invitation"), result, utilService.translate('Close'));                  
            });
        });
    }
     this.changeThemeForSharing = function () {      
        location.href = location.origin;
    }

    this.startSharing = function () {   
    }

    this.stopSharing = function () {
        hub.server.endSharing();     
        $rootScope.sharingService.deleteEnviromentForSharing();
        $rootScope.sharingService.deleteReloadSharing();
        $rootScope.sharingService.hideSharing();       
        $rootScope.viewers = [];
        utilService.scopeApply();      
    }
    this.stopSharingAndRefresh = function () {
        hub.server.endSharing();
        $rootScope.sharingService.deleteEnviromentForSharing();
        $rootScope.sharingService.hideSharing();
        $rootScope.sharingService.deleteReloadSharing();
        hub.server.refreshAutoAfterStopSharing();
        $timeout(function () {            
            $rootScope.sharingService.changeThemeForSharing();
        }, 2000);
        $rootScope.viewers = [];        
        utilService.scopeApply();
        
    }

    hub.client.autoRefreshAfterStopSharing = function () {
        $rootScope.sharingService.deleteEnviromentForSharing();
        $rootScope.sharingService.hideSharing();
        $rootScope.sharingService.deleteReloadSharing();
        $rootScope.viewers = [];       
        $timeout(function () {
            $rootScope.sharingService.changeThemeForSharing();
        }, 3000);       
    }

    this.requestTakeOver = function () {
        hub.server.requestTakeOver(localStorage.user_name,localStorage.user_name_are_taking_overing);
    }

    this.showSharingAtViewer = function () {
        $('#panelSharing').show();
        $('#sharing_stop').show();
        $('#sharing_take_over').show();
        isSharing = true;
        $rootScope.profileService.initProfile(user_id);
        isPresenter = false;
        $("#sharing_presenter").text(user_name_are_taking_overing);
        $rootScope.playbackService.initOverlay();
    }
    this.hideSharing = function () {
        $('#panelSharing').hide();
        $rootScope.playbackService.hideOverlay();
    }
    this.showSharingAtPresenter = function () {
        $('#panelSharing').show();
        $('#sharing_stop').show();
        $('#sharing_take_over').hide();
        isSharing = true;
        isPresenter = true;
        $("#sharing_presenter").text(user_name_are_taking_overing);
        $rootScope.playbackService.hideOverlay();
    }   
    this.UpdateControlForShareScreen = function (obj) {
        console.log('Send Data :', obj);
        var self = this;
        if (obj.action != null && obj.action.indexOf('CHANGE_COMPONENT_') == 0) {
            switch(obj.action){
                case 'CHANGE_COMPONENT_com_current_income' :
                case 'CHANGE_COMPONENT_com_current_expense' :
                case 'CHANGE_COMPONENT_expense': 
                    $rootScope.scrollToSession('savings');
                    break;
                case 'CHANGE_COMPONENT_riskReturn':
                case 'CHANGE_COMPONENT_risk' :
                    $rootScope.scrollToSession('investment');
                    break; 
            } 
            this.actionComponentChange(obj);
        } else {
            switch (obj.action) {
                case 'zoomed':
                    $rootScope.scrollToSession(obj.controlID);
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'changeCardSwiper':
                    $rootScope.scrollToSession('div_SavingRate');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'changeIlliquidAssetCardSwiper':
                    $rootScope.scrollToSession('div_IlliquidAsset');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'changeCard':
                    $rootScope.scrollToSession('div_SavingRate');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'changeExpenseRetirementCard':
                    $rootScope.scrollToSession('div_LifeStyle');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'clickOnSavingRate':
                    $rootScope.scrollToSession('dev_detailSavingRate');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'AllData':
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'move':
                    $rootScope.scrollToSession('timeline-canvas');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'delete':
                    $rootScope.scrollToSession('timeline-canvas');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'move_end':
                    $rootScope.scrollToSession('timeline-canvas');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'add':
                    $rootScope.scrollToSession('timeline-canvas');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'delete':
                    $rootScope.scrollToSession('timeline-canvas');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'resetplan':
                    $rootScope.scrollToSession('timeline-canvas');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'changedropdownlist':
                    $rootScope.scrollToSession('timeline-canvas');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'zoom':
                    $rootScope.scrollToSession('timeline-canvas');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'click':
                    $rootScope.scrollToSession('timeline-canvas');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'edit':
                    $rootScope.scrollToSession('timeline-canvas');
                    $rootScope.UpdateControlForShareScreen(obj);
                    break; 
                case 'switch':
                case 'tab':  
                case 'hover':
                    $rootScope.scrollToSession(obj.controlID);
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'change_income_or_expense_value':
                    $rootScope.scrollToSession('div_SavingRate'); 
                    if (angular.isDefined($rootScope.savingRate)) {
                        $rootScope.savingRate.UpdateControlForShareScreen(obj);
                    }
                    break;
                case 'savingRate':
                    $rootScope.scrollToSession('div_SavingRate');
                    $rootScope.savingRate.UpdateControlForShareScreen(obj);
                    break;
                case 'investment':                    
                    if (obj.actionEvent != 'updateCashFlowData')
                        $rootScope.scrollToSession(obj.controlID);
                    $rootScope.investment.UpdateControlForShareScreen(obj);
                    break;
                case 'expand_income_or_expense_key':
                    if (angular.isDefined($rootScope.savingRate)) {
                        $rootScope.scrollToSession('income_expense_' + obj.controlID);
                        $rootScope.savingRate.expandControlSharing(obj.controlID);
                    }
                    break;
                case 'SWITCH_TAB':
                    this.actionSwitchTab(obj);
                    break;
                case 'familyMembers':
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'childMembersFilterNotOtherChild':
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'childMembers':
                    $rootScope.UpdateControlForShareScreen(obj);
                    break;
                case 'cashflowData':
                    $rootScope.savingRate.updateCashFlow(obj.newValue);
                    break;
                case 'retirementLifeStyle': 
                    $rootScope.scrollToSession('div_LifeStyle');
                    $rootScope.retirementLifeStyle.UpdateControlForShareScreen(obj);
                    break;
                case 'illiquidAsset':
                    $rootScope.scrollToSession('div_IlliquidAsset');
                    $rootScope.illiquidAsset.UpdateControlForShareScreen(obj);
                    break;
                case 'timelineService':
                    $rootScope.timelineService.UpdateControlShareScreen(obj);
                    break;
                case 'ratingService':
                    $rootScope.ratingService.UpdateControlShareScreen(obj);
                    break;
                default:
                    // check auto switch tab when sharing
                    if (angular.isDefined(obj.current_state) && obj.current_state != '' && obj.current_state != $state.current) {
                        utilService.stateGo(obj.current_state);
                        $timeout(function () {
                            self.reloadCurrentStateWithCalculateData(obj.result);
                        }, 500)
                    } else {
                        this.reloadCurrentStateWithCalculateData(obj.result);
                    }
                    break;
            }
        }
    }

    this.actionComponentChange = function (obj) {
        var keys = Object.keys(obj.data);
        angular.forEach(keys, function (key) {
            if (key != 'dreams' && key != 'ClientActionType' && key != 'lifeEvent' && key != 'user_id' && key != 'id' && key != 'time_create') {
                if (obj.data[key] != $rootScope.PersonaPlan[key]) {
                    $rootScope.PersonaPlan[key] = obj.data[key];
                    $rootScope.hightLightFieldNamOfPersonalPlan(key);
                }
            }
        });
        personalPlanService.updateConvertDataOfPersonalPlan();
        utilService.scopeApply();
        this.reloadCurrentStateWithCalculateData(obj.result);
    }

    this.actionSwitchTab = function (obj) {
        $rootScope.playBackPlayerData.data = obj.result;
        utilService.stateGo(obj.data);        
    }

    this.reloadCurrentStateWithCalculateData = function (dataCalculate) {
        if (dataCalculate != null) {
            $rootScope.playBackPlayerData.data = angular.copy(dataCalculate);
            utilService.scopeApply();
            $rootScope.scope.callfromOutsite();
            $rootScope.sharingActionData.action = '';
        }
    },
    this.initSharing = function () {
        hub.client.takeOverRequested = function (viewer, owner_takeover) {        
            var callbackCancel = function () {
                hub.server.acceptRequestTakeOver(viewer, false, owner_takeover);
            };
            var callbackOK = function () {
                hub.server.acceptRequestTakeOver(viewer, true, owner_takeover);
            };
            $timeout(function () {
                utilService.ShowDialog($rootScope, utilService.translate("Take over"), viewer + ' ' + utilService.translate("wants to take over the sharing session. Do you accept this request?"), utilService.translate("Yes"), callbackOK, utilService.translate("No"), callbackCancel);
            }, 200);
        }
        hub.client.CloseDialog = function (dialogId) {
             $('#'+dialogId).modal('hide');
        }
        hub.client.takeOverAccepted = function (status, isowner, owner_takeover) {
            if (status) {
                var heading = 'Take over';
                var question = '';
                if (isowner) {
                    question = utilService.translate('You can control the session now.');
                } else
                    question = owner_takeover + ' ' + utilService.translate(' has just accepted your request to take over.');
                $rootScope.sharingService.updatePresenterInformation(user_name_before_shared);
                $rootScope.sharingService.showSharingAtPresenter();               
                var callbackOK = function () {
                    hub.server.takeOverSharing(localStorage.user_name);
                    hub.server.dialogHide();
                };
                $timeout(function () {
                    utilService.ShowDialog($rootScope, utilService.translate("Take over"), question, utilService.translate("Ok"), callbackOK);
                    $('.overlay').zIndex = -1;
                }, 200);
            }
            else {                
                utilService.showSuccessMessage(owner_takeover + ' ' + utilService.translate(' does not accept your request to take over.'));
            }
        }
        hub.client.stolenTakeOverBy = function (presenter) {
            $rootScope.sharingService.updatePresenterInformation(presenter);
            $rootScope.sharingService.showSharingAtViewer();
            
            utilService.showSuccessMessage(presenter + ' ' + utilService.translate('has just taken over the sharing session'));
        };
        hub.client.sharingEndedAtPresenter = function () {
            if (isSharing) {
                var callbackOK = function () {                    
                    hub.server.dialogHide();
                    $timeout(function () {
                        $rootScope.sharingService.changeThemeForSharing();
                    }, 1000);
                };
                console.log('this.stopSharing     ');
                $rootScope.sharingService.stopSharing();
                utilService.scopeApply();               
                $timeout(function () {
                    utilService.ShowDialog($rootScope, utilService.translate("Sharing"), utilService.translate("There is nobody in sharing session"), utilService.translate("Ok"), callbackOK);
                }, 200);
            }
        };
        hub.client.viewerChanged = function (mail, userManualStop) { //this instanciate the shapeMoved function receiving x, y
            if (isSharing) {
                hub.server.updateConnectionIdsToSharing(mail, userManualStop);
            }
        };
        hub.client.pageRefreshed = function (isTakeOver, owner_takeover) {
            var reloadsharing = $cookies.get('reloadsharing');
            if (typeof reloadsharing != "undefined") {              
                rootScope.isTakeOver = isTakeOver;
                if (isTakeOver == false) {
                    $rootScope.sharingService.showSharingAtViewer();
                }
                else if (isTakeOver == true) {
                    $rootScope.sharingService.showSharingAtPresenter();
                }                
            }
            else {
                console.log("typeof reloadsharing == undefined");
            }
            $rootScope.setCurrentActive();
            $rootScope.timelineService.switchToCurrentPlan();
            utilService.stateGo(CONFIG.TAB.MAIN);
        };
        hub.client.sharingStarted = function (dataInitSharing) {
            $rootScope.sharingService.setEnviromentForSharing(dataInitSharing, true, false);
            $rootScope.sharingService.updateEnviromentForSharing();
            $rootScope.sharingService.setReloadSharing();
            $rootScope.sharingService.changeThemeForSharing();
        };
        hub.client.sharingEnded = function (presenter) {
            $rootScope.sharingService.stopSharing();
            var callbackOK = function () {
                hub.server.refreshAutoSimple();               
                $timeout(function () {
                    $rootScope.sharingService.changeThemeForSharing();
                }, 2000);                
            };
            utilService.scopeApply();
            $timeout(function () {
                utilService.ShowDialog($rootScope, utilService.translate("Sharing Session"), presenter + ' ' + utilService.translate("stopped the sharing session."), utilService.translate("Ok"), callbackOK);
            }, 200);
        };
        hub.client.invitingRequest = function (_representerId, email) { //this instanciate the shapeMoved function receiving x, y
                var callbackOK = function () {
                    hub.server.acceptInviting(_representerId);
                    hub.server.dialogHide();
                };
                var callbackCancel = function () {
                    hub.server.dialogHide();
                };
                utilService.scopeApply();
                $timeout(function () {
                    utilService.ShowDialog($rootScope, utilService.translate("Invitation"), _representerId + ' ' + utilService.translate("wants to invite you for sharing screen. Do you accept this invitation?"), utilService.translate("Yes"), callbackOK, utilService.translate("No"),callbackCancel);
                }, 200);
        };
        hub.client.hideDialog = function () { 
            $('.modal').modal('hide');
        };
        hub.client.autoRefreshSimple = function () {
            $rootScope.sharingService.stopSharing();
            $timeout(function () {
                $rootScope.sharingService.changeThemeForSharing();
            }, 1000);
        }
        hub.client.addViewerList = function (mail) {
            if ($rootScope.viewers.indexOf(mail) == -1) {
                $rootScope.viewers.push(mail);
                utilService.scopeApply();
            }
        };
        hub.client.deleteViewerList = function (mail) { //this instanciate the shapeMoved function receiving x, y
            if (typeof $rootScope.viewers != 'undefined' && $rootScope.viewers != null) {
                for (var i = $rootScope.viewers.length - 1; i >= 0; i--) {
                    if ($rootScope.viewers[i] === mail) {
                        $rootScope.viewers.splice(i, 1);
                    }
                }
                utilService.scopeApply();
            }            
        };
        hub.client.dataTransfered = function (obj) {             
            if (isSharing == true)
                $rootScope.sharingService.UpdateControlForShareScreen(obj);
        };
        hub.client.newSession = function () {
            $rootScope.sharingService.deleteEnviromentForSharing();
            $rootScope.sharingService.deleteReloadSharing();
        };
        $.connection.hub.start().done(function () {
           
        });
        $.connection.hub.disconnected(function () {
            if ($.connection.hub.lastError)
            { console.log("Disconnected. Reason: " + $.connection.hub.lastError.message); }
            setTimeout(function () {
                $.connection.hub.start();
            }, 1000); // Restart connection after 1 seconds.
        });
    }
});