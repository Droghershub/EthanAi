function ReUpdateForControlById(controlId) {
    if (document.getElementById(controlId) != undefined)
        angular.element(document.getElementById(controlId)).scope().callfromOutsite();
}
function ReUpdateForControlByIdForSharing(controlId, actionEvent, obj) { 
    if (document.getElementById(controlId) != undefined)
        angular.element(document.getElementById(controlId)).scope().callfromOutsiteForSharing(actionEvent, obj);
}
Date.prototype.addDays = function (num) {
    this.setDate(this.getDate() + parseInt(num));
    return this;
}
var timeline;
btoApp.service('timelineService', function ($rootScope, personalPlanService, utilService, $timeout, $state, $locale, accountService, CONFIG, $filter) {
    this.initTimeline = function () {        
        this.renderTimeLine();       

    }
    this.onchange = function () {
        if (timeline.selection != undefined) {
            var objrelated, year, boundingYear;
            var index = (timeline.selection && timeline.selection.index !== undefined) ? timeline.selection.index : -1,
            item = (timeline.selection && timeline.selection.index !== undefined) ? timeline.items[index] : undefined;
            if (item) {
                $rootScope.SendingScreenSharingDataObject(item, 'move');
            }
            var steptocurrent = $rootScope.timelineService.StepChangeWithCurrentYear(item);
            if (item.name == "start_age" && $rootScope.PersonaPlan.start_age != timeline.items[0].start_age + steptocurrent + 1) {
                $rootScope.PersonaPlan.start_age = timeline.items[0].start_age + steptocurrent + 1;
                var maxStartAge = utilService.getMaxStartAge($rootScope);
                if ($rootScope.PersonaPlan.start_age > maxStartAge) {
                    $rootScope.PersonaPlan.start_age = maxStartAge;
                    $rootScope.timelineMessage = utilService.translate('You have an item on timeline at: ') + ' ' + maxStartAge + '.';
                }
                    //else $rootScope.timelineMessage = '';
                else {
                    if ($rootScope.PersonaPlan.start_age < 18) {
                        $rootScope.PersonaPlan.start_age = 18;
                        $rootScope.timelineMessage = utilService.translate('Current age must be greater than') + ' ' + 18 + '.';
                    }
                    else $rootScope.timelineMessage = '';
                }                
                $rootScope.timelineDataChange = true;
            }
            else if (item.name == "retirement_age" && $rootScope.PersonaPlan.retirement_age != timeline.items[0].start_age + steptocurrent + 1) {

                year = timeline.items[0].start_age + steptocurrent + 1;
                if (year > 70) {
                    $rootScope.timelineMessage = utilService.translate('Retirement age must be below') + ' 70.';
                }
                else $rootScope.timelineMessage = '';
                boundingYear = year < $rootScope.PersonaPlan.start_age ? $rootScope.PersonaPlan.start_age : year;
                boundingYear = boundingYear > 70 ? 70 : boundingYear;

                $rootScope.PersonaPlan.retirement_age = boundingYear;
                if ($rootScope.PersonaPlan.social_security_age < $rootScope.PersonaPlan.retirement_age) {
                    $rootScope.PersonaPlan.social_security_age = $rootScope.PersonaPlan.retirement_age;
                    objrelated = $.grep(timeline.items, function (e) { return e.name == 'social_security_age'; });
                    if (objrelated && objrelated.length > 0) {
                        objrelated[0].start = new Date(new Date().getFullYear() + $rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1);
                        $rootScope.SendingScreenSharingDataObject(objrelated[0], 'move');
                    }
                }                
                $rootScope.timelineDataChange = true;
            }
            else if (item.name == "social_security_age" && $rootScope.PersonaPlan.social_security_age != timeline.items[0].start_age + steptocurrent + 1) {
                year = timeline.items[0].start_age + steptocurrent + 1;
                if (year > 70 || year < 60) {
                    $rootScope.timelineMessage = utilService.translate('CPF Life Payout must be between') + ' 60-70.';
                }
                else $rootScope.timelineMessage = '';
                boundingYear = year < 60 ? 60 : year;
                boundingYear = boundingYear > 70 ? 70 : boundingYear;
                $rootScope.PersonaPlan.social_security_age = boundingYear;
                if ($rootScope.PersonaPlan.social_security_age < $rootScope.PersonaPlan.retirement_age) {
                    $rootScope.PersonaPlan.retirement_age = $rootScope.PersonaPlan.social_security_age;
                    objrelated = $.grep(timeline.items, function (e) { return e.name == 'retirement_age'; });
                    if (objrelated && objrelated.length > 0) {
                        objrelated[0].start = new Date(new Date().getFullYear() + $rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1);
                        $rootScope.SendingScreenSharingDataObject(objrelated[0], 'move');
                    }

                }                
                $rootScope.timelineDataChange = true;
            }
            else if (item.name == "dream") {
                var data_id = item.data_id;
                var life_event_year, life_eventobj;
                life_eventobj = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.dream_id == data_id; });
                if (life_eventobj && life_eventobj.length > 0) {
                    life_event_year = life_eventobj[0].starting_age;
                }
                else
                    life_event_year = $rootScope.PersonaPlan.death_age + 1;

                year = timeline.items[0].start_age + steptocurrent + 1;
                if (year > $rootScope.PersonaPlan.death_age) {
                    year = $rootScope.PersonaPlan.death_age;
                    $rootScope.timelineDataChange = true;
                }
                if (year > life_event_year) {
                    year = life_event_year;
                    $rootScope.timelineDataChange = true;
                    $rootScope.timelineMessage = utilService.translate('You can\'t sell a house that you haven\'t bought yet.');
                }
                else $rootScope.timelineMessage = '';
                if (year < $rootScope.PersonaPlan.start_age)
                    year = $rootScope.PersonaPlan.start_age;
                
                var result = $.grep($rootScope.PersonaPlan.dreams, function (e) { return e.id == data_id; });
                if (result && result.length > 0 && result[0].purchase_age != year) {
                    result[0].purchase_age = year;                   
                    $rootScope.timelineDataChange = true;
                }
            }
            else if (item.name == "life_event") {
                var data_id = item.data_id;
                var dream_id = item.dream_id;
                if (isNaN(dream_id))
                    dream_id = -1;
                var dream_year, dreamobj;
                dreamobj = $.grep($rootScope.PersonaPlan.dreams, function (e) { return e.id == dream_id; });
                if (dreamobj && dreamobj.length > 0) {
                    dream_year = dreamobj[0].purchase_age;
                }
                else
                    dream_year = $rootScope.PersonaPlan.start_age - 1;

                year = timeline.items[0].start_age + steptocurrent + 1;
                if (year < $rootScope.PersonaPlan.start_age) {
                    year = $rootScope.PersonaPlan.start_age;
                    $rootScope.timelineDataChange = true;
                }
                    
                if (year < dream_year) {
                    year = dream_year;                    
                    $rootScope.timelineMessage = utilService.translate('You can\'t sell a house that you haven\'t bought yet.');
                }
                else $rootScope.timelineMessage = '';
                if (year > $rootScope.PersonaPlan.death_age)
                    year = $rootScope.PersonaPlan.death_age;
                var result = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.id == data_id; });
                if (result && result.length > 0 && result[0].purchase_age != year) {
                    result[0].starting_age = year;                    
                    $rootScope.timelineDataChange = true;
                }
            }
            if ($rootScope.timelineDataChange) {                
                $rootScope.actionService.calculateData();                
            }

            return;
        }
    }
    this.onchanged = function () {
        if (timeline.selection != undefined && $rootScope.timelineDataChange) {
            if ($rootScope.timelineMessage.length > 2)
                utilService.showWarningMessage($rootScope.timelineMessage);
            $rootScope.options.max = new Date(new Date().getFullYear() + $rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age + 1, 0, 0);
            $rootScope.timelineService.renderTimeLine();
            $rootScope.actionService.updateData();

            $rootScope.timelineDataChange = false;
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan, 'move_end');
            return;
        }

    }

    this.ondeleted = function () {
        if (item_selected_id != 0) {
            var item = timeline.items[item_selected_id];
            if (item) {
                var sendobj = {};
                sendobj.name = item.name;
                sendobj.data_id = item.data_id;
                sendobj.lifeevent_name = '';
                var message = utilService.translate('Do you want to delete it?');                
                if (item.name == "dream") {
                    var life_eventobj = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.dream_id == item.data_id });
                    if (life_eventobj && life_eventobj.length > 0) {
                        sendobj.lifeevent_name = life_eventobj[0].name;
                        message = utilService.translate("Life Event: {{name}} will be delete too, Are you sure?", { name: life_eventobj[0].name });
                    }
                }
                $timeout(function () { utilService.ShowDialog($rootScope, utilService.translate('Confirmation'), message, utilService.translate('Yes'), $rootScope.timelineService.ondeletedCallback, utilService.translate('No'), $rootScope.timelineService.ondonotdeleteCallback) }, 1);
               
                $rootScope.SendingScreenSharingDataObject(sendobj, 'delete', 'open', 'confirmDeletedialog');
            }
        }
    }
    this.ondonotdeleteCallback = function () {

        if (item_selected_id != 0) {
            var life_eventobj, lvindex, dreamobj, dreamIndex;
            var item = timeline.items[item_selected_id]
            if (item) {
                var steptocurrent = item.startbeforemove.getFullYear() - new Date().getFullYear();
                if (item.name == "dream") {
                    var data_id = item.data_id;
                    var life_event_year, life_eventobj;
                    life_eventobj = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.dream_id == data_id; });
                    if (life_eventobj && life_eventobj.length > 0) {
                        life_event_year = life_eventobj[0].starting_age;
                    }
                    else
                        life_event_year = $rootScope.PersonaPlan.death_age;

                    year = timeline.items[0].start_age + steptocurrent + 1;
                    if (year > life_event_year) {
                        year = life_event_year;
                        $rootScope.timelineMessage = utilService.translate('You can\'t sell a house that you haven\'t bought yet.');
                    }
                    else $rootScope.timelineMessage = '';
                    if (year < $rootScope.PersonaPlan.start_age)
                        year = $rootScope.PersonaPlan.start_age;

                    var result = $.grep($rootScope.PersonaPlan.dreams, function (e) { return e.id == data_id; });
                    if (result && result.length > 0 && result[0].purchase_age != year) {
                        result[0].purchase_age = year;
                        $rootScope.timelineDataChange = true;
                    }
                }
                else if (item.name == "life_event") {
                    var data_id = item.data_id;
                    var dream_id = item.dream_id;
                    if (isNaN(dream_id))
                        dream_id = -1;
                    var dream_year, dreamobj;
                    dreamobj = $.grep($rootScope.PersonaPlan.dreams, function (e) { return e.id == dream_id; });
                    if (dreamobj && dreamobj.length > 0) {
                        dream_year = dreamobj[0].purchase_age;
                    }
                    else
                        dream_year = $rootScope.PersonaPlan.start_age;
                    year = timeline.items[0].start_age + steptocurrent + 1;
                    if (year < dream_year) {
                        year = dream_year;
                        $rootScope.timelineMessage = utilService.translate('You can\'t sell a house that you haven\'t bought yet.');
                    }
                    else $rootScope.timelineMessage = '';
                    if (year > $rootScope.PersonaPlan.death_age)
                        year = $rootScope.PersonaPlan.death_age;
                    var result = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.id == data_id; });
                    if (result && result.length > 0 && result[0].purchase_age != year) {
                        result[0].starting_age = year;
                        $rootScope.timelineDataChange = true;
                    }
                }
            }
        }
        //personalPlanService.getPersonalPlan(user_id);
        $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan, 'delete', 'cancel', 'confirmdialog');
        $rootScope.timelineService.renderTimeLine();
        $rootScope.actionService.calculateData();
    }

    this.ondeletedCallback = function () {

        if (item_selected_id != 0) {
            var life_eventobj, lvindex, dreamobj, dreamIndex;
            var item = timeline.items[item_selected_id]
            if (item) {
                if (item.name == "dream") {
                    life_eventobj = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.dream_id == item.data_id });
                    if (life_eventobj && life_eventobj.length > 0) {
                        lvindex = $rootScope.PersonaPlan.lifeEvent.indexOf(life_eventobj[0]);
                        $rootScope.PersonaPlan.lifeEvent.splice(lvindex, 1);
                        $rootScope.planService.RemoveLifeEvent(life_eventobj[0].id);
                    }
                    dreamobj = $.grep($rootScope.PersonaPlan.dreams, function (e) {
                        return e.id == item.data_id
                    });
                    if (dreamobj && dreamobj.length > 0) {
                        dreamIndex = $rootScope.PersonaPlan.dreams.indexOf(dreamobj[0]);
                        $rootScope.PersonaPlan.dreams.splice(dreamIndex, 1);
                        $rootScope.planService.RemoveDream(dreamobj[0].id);
                    }

                }
                else if (item.name == "life_event") {
                    life_eventobj = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) {
                        return e.id == item.data_id
                    });
                    if (life_eventobj && life_eventobj.length > 0) {
                        lvindex = $rootScope.PersonaPlan.lifeEvent.indexOf(life_eventobj[0]);
                        $rootScope.PersonaPlan.lifeEvent.splice(lvindex, 1);
                        $rootScope.planService.RemoveLifeEvent(life_eventobj[0].id);
                    }

                }
                $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan, 'delete', 'ok', 'confirmdialog');
                $rootScope.timelineService.renderTimeLine();
                $rootScope.actionService.calculateData();
            }
        }        
    }

    this.ondblclick = function (event) {       
        if (timeline.selection != undefined) {
            var indexId;
            var index = (timeline.selection && timeline.selection.index !== undefined) ? timeline.selection.index : -1,
            item = (timeline.selection && timeline.selection.index !== undefined) ? timeline.items[index] : undefined;
            if (item == undefined)
                return;
            if (item.name == "start_age") {
                if ($rootScope.functionAccess.CHANGE_START_AGE == null || $rootScope.functionAccess.CHANGE_START_AGE == undefined) {
                    $rootScope.functionAccess.showErrorMessage();
                    this.dragging = false;
                    return;
                }
                $rootScope.MaxStartAge = getMaxStartAge($rootScope);
                $rootScope.MinStartAge = 18;
                var currentStartAge = $rootScope.PersonaPlan.start_age;
                $rootScope.form_start_age = currentStartAge;
                $rootScope.SendingScreenSharingDataObject(item, 'edit', 'open', 'StartAgeDialog');
                $timeout(function () {
                    $('#StartAgeDialog').modal({ backdrop: 'static', keyboard: false });
                    $('#OkUpdateStartAge').bind('click', function () {
                        $rootScope.PersonaPlan.start_age = $rootScope.form_start_age;
                        $rootScope.timelineService.renderTimeLine();
                        $rootScope.actionService.calculateData();
                        $rootScope.actionService.updateData();
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'ok', 'StartAgeDialog');
                        $('#cancelUpdateStartAge').unbind('click');
                        $('#OkUpdateStartAge').unbind('click');
                    });
                    $('#cancelUpdateStartAge').bind('click', function () {
                        $rootScope.PersonaPlan.start_age = currentStartAge;
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'cancel', 'StartAgeDialog');
                        $('#cancelUpdateStartAge').unbind('click');
                        $('#OkUpdateStartAge').unbind('click');
                    });
                }, 50);
                return;
            }
            if (item.name == "social_security_age") {
                if ($rootScope.functionAccess.CHANGE_RETIREMENT_AGE == null || $rootScope.functionAccess.CHANGE_RETIREMENT_AGE == undefined) {
                    $rootScope.functionAccess.showErrorMessage();
                    return;
                }
                if ($rootScope.functionAccess.CHANGE_RETIREMENT_AGE != 1) {
                    $rootScope.functionAccess.showErrorMessage();
                }
                var backupSocialSecurityAge = angular.copy($rootScope.PersonaPlan.social_security_age);
                $rootScope.MinSocialSecurityAge = $rootScope.PersonaPlan.retirement_age > 60 ? parseInt($rootScope.PersonaPlan.retirement_age) : 60;
                $timeout(function () {
                    $('#SocialSecurityStartAgeDialog').modal({ backdrop: 'static', keyboard: false });
                    $rootScope.SendingScreenSharingDataObject(item, 'edit', 'open', 'SocialSecurityStartAgeDialog');
                    $('#OkUpdateSocialSecurityAge').bind('click tap', function () {
                        $rootScope.timelineService.renderTimeLine();
                        $rootScope.actionService.calculateData();
                        $rootScope.actionService.updateData();
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'ok', 'SocialSecurityStartAgeDialog');
                        $('#OkUpdateSocialSecurityAge').unbind('click tap');
                        $('#cancelUpdateSocialSecurityAge').unbind('click tap');
                    });
                    $('#cancelUpdateSocialSecurityAge').bind('click tap', function () {
                        $rootScope.PersonaPlan.social_security_age = backupSocialSecurityAge;
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'cancel', 'SocialSecurityStartAgeDialog');
                        $('#OkUpdateSocialSecurityAge').unbind('click tap');
                        $('#cancelUpdateSocialSecurityAge').unbind('click tap');
                    });
                }, 50);
                return;
            }
            if (item.name == "dream") {
                if ($rootScope.functionAccess.EDIT_DREAM == null || $rootScope.functionAccess.EDIT_DREAM == undefined) {
                    $rootScope.functionAccess.showDeniedMessage();
                    return;
                }
                $rootScope.timelineDropYear = -1;
                $rootScope.isEditDream = true;
                indexId = getIndexOfDataId($rootScope, 'dream', item.data_id);
                bindDreamtoModalDialog($rootScope, indexId);
                utilService.updateSelectedDreamType('dream', true);
                if ($rootScope.functionAccess.EDIT_DREAM == 0) {
                    $rootScope.functionAccess.showErrorMessage();
                    $rootScope.EditdreamPermission = false;
                }
                else { $rootScope.EditdreamPermission = true; }
                var dream = $rootScope.PersonaPlan.dreams[indexId];
                if (dream.dream_type_id == 1) {
                    $rootScope.saleResidenceEndAge = angular.copy($rootScope.PersonaPlan.death_age);
                    angular.forEach($rootScope.PersonaPlan.lifeEvent, function (lifeEvent) {
                        if (angular.isDefined(lifeEvent.dream_id) && lifeEvent.dream_id == dream.id) {
                            $rootScope.saleResidenceEndAge = angular.copy(lifeEvent.starting_age);
                        }
                    })
                }
                
                utilService.scopeApply();
                $timeout(function () {
                    $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
                    $rootScope.SendingScreenSharingDataObject(item, 'edit', 'open', 'dreamdialog');
                    $('#SaveDream').bind('click', function () {                
                        bindDreamfromModalDialog($rootScope, indexId);
                        $rootScope.timelineService.renderTimeLine();
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'ok', 'dreamdialog');
                        $rootScope.actionService.calculateData();
                        $rootScope.actionService.updateData();
                        $('#SaveDream').unbind('click');
                        $('#CancelSaveDream').unbind('click');
                    });
                    $('#CancelSaveDream').bind('click', function () {
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'cancel', 'dreamdialog');
                        $('#SaveDream').unbind('click');
                        $('#CancelSaveDream').unbind('click');
                    });
                }, 500);
                return;
            }
            if (item.name == "life_event") {
                if ($rootScope.functionAccess.EDIT_LIFE_EVENT == null || $rootScope.functionAccess.EDIT_LIFE_EVENT == undefined) {
                    $rootScope.functionAccess.showDeniedMessage();
                    return;
                }
                $rootScope.timelineDropYear = -1;
                $rootScope.isEditDream = true;
                indexId = getIndexOfDataId($rootScope, 'lifeevent', item.data_id);
                bindLifeEventtoModalDialog($rootScope, indexId);
                utilService.updateSelectedDreamType('life_event', true);
                if ($rootScope.functionAccess.EDIT_LIFE_EVENT == 0) {
                    $rootScope.functionAccess.showErrorMessage();
                    $rootScope.EditLifeeventPermission = false;
                }
                else { $rootScope.EditLifeeventPermission = true; }
                
                utilService.scopeApply();
                $timeout(function () {
                    $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false })
                    $rootScope.SendingScreenSharingDataObject(item, 'edit', 'open', 'lifeeventdialog');
                    $('#SaveLifeEvent').bind('click', function () {                        
                        bindLifeEventfromModalDialog($rootScope, indexId);
                        $rootScope.timelineService.renderTimeLine();
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'ok', 'lifeeventdialog');
                        $rootScope.actionService.calculateData();
                        $rootScope.actionService.updateData();
                        $('#SaveLifeEvent').unbind('click');
                        $('#cancelSaveLifeEvent').unbind('click');
                    });
                    $('#cancelSaveLifeEvent').bind('click', function () {
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'cancel', 'lifeeventdialog');
                        $('#SaveLifeEvent').unbind('click');
                        $('#cancelSaveLifeEvent').unbind('click');
                    });
                }, 500);
                return;
            }
            return;
        }
        timeline.cancelAdd();
    }
    this.StepChangeWithCurrentYear = function (item) {
        return item.start.getFullYear() - new Date().getFullYear();
    }
    this.initDataForTimeLine = function () {
        $rootScope.timelinedata = [];
        $rootScope.timelinedata.push({
            "start": new Date(new Date().getFullYear(), 0, 1).addDays(-1),
            "content": "<img class='timeline_item_pad' src='/Themes/2/Content/Images/blue.png' />" +  utilService.translate('Current Age'),
            "deleteable": false,
            "name": "start_age",
            "start_age": $rootScope.PersonaPlan.start_age
        });
        $rootScope.timelinedata.push({
            "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "content": "<img class='timeline_item_pad' src='/Themes/2/Content/Images/blue.png' />" + utilService.translate('Retirement Age'),
            "deleteable": false,
            "name": "retirement_age"
        });
        $rootScope.timelinedata.push({
            "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "content": "<img class='timeline_item_pad' src='/Themes/2/Content/Images/blue.png' />" + utilService.translate('Social Security Age'),
            "deleteable": false,
            "name": "social_security_age"

        });
        for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
            $rootScope.timelinedata.push({
                "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.dreams[i].purchase_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
                "content": "<img class='timeline_item_pad' src='/Themes/2/Content/Images/red.png' />" + $rootScope.PersonaPlan.dreams[i].name,
                "deleteable": true,
                "name": "dream",
                "data_id": $rootScope.PersonaPlan.dreams[i].id
            });
        }
        for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
            $rootScope.timelinedata.push({
                "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.lifeEvent[i].starting_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
                "content": "<img class='timeline_item_pad' src='/Themes/2/Content/Images/green.png' />" + $rootScope.PersonaPlan.lifeEvent[i].name,
                "deleteable": true,
                "name": "life_event",
                "data_id": $rootScope.PersonaPlan.lifeEvent[i].id,
                "dream_id": $rootScope.PersonaPlan.lifeEvent[i].dream_id
            });
        }
        $rootScope.timelinedata.push({
            "start": new Date(new Date().getFullYear() + $rootScope.MainResult.broken_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "content": "broken Age",
            "deleteable": false,
            "editable": false,
            "selectable": false,
            "className": 'hidden',
            "name": "broken_age",
            "type": 'floatingRange'

        });
        if ($rootScope.profile.client.married_status == 1) {
            var spouseYear = (60 - $rootScope.profile.spouse.age) + $rootScope.PersonaPlan.start_age;
            if ($rootScope.profile.spouse.occupation == 1 || $rootScope.profile.spouse.occupation == 2) {
                $rootScope.timelinedata.push({
                    "start": new Date(new Date().getFullYear() + spouseYear - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
                    "content": "<img class='timeline_item_pad' src='/Themes/2/Content/Images/blue.png' />" + utilService.translate('Spouse Retirement Age'),
                    "deleteable": false,
                    'editable': false,
                    "name": "RetirementAgeOfSpouse"
                });
            }
        }
    }
    this.renderTimeLine = function () {
        var steps = $rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age;
        $rootScope.options = {
            'width': '100%',
            'height': '183px',
            'editable': true,
            'zoomable': true,
            'showCurrentTime': false,
            'showMajorLabels': false,
            'zoomable': true,
            'style': 'box',
            'box': { align: 'left' },
            'cluster': false,
            'clusterMaxItems': 3,
            'eventMargin': 0,  // minimal margin between events
            'eventMarginAxis': 30,
            'zoomMin': 60 * 60 * 24 * 365 * 100000,     // milliseconds
            'zoomMax': 60 * 60 * 24 * 365 * 1000 * 1000,  // milliseconds				
            "min": new Date(new Date().getFullYear() - 1, 1, 1),                // lower limit of visible range
            "max": new Date(new Date().getFullYear() + steps + 1, 0, 0)                // upper limit of visible range

        };

        $rootScope.timelineMessage = '';
        $rootScope.timelineService.initDataForTimeLine();
        $rootScope.MaxStartAge = getMaxStartAge($rootScope);
        $rootScope.MinStartAge = 18;
        $rootScope.MinSocialSecurityAge = $rootScope.PersonaPlan.retirement_age > 60 ? parseInt($rootScope.PersonaPlan.retirement_age) : 60;
        timeline = new links.Timeline(document.getElementById('timeline-canvas'), $rootScope.options);
        timeline.setScale(links.Timeline.StepDate.SCALE.YEAR, 1);
        links.events.addListener(timeline, 'change', $rootScope.timelineService.onchange);
        links.events.addListener(timeline, 'changed', $rootScope.timelineService.onchanged);
        links.events.addListener(timeline, 'delete', $rootScope.timelineService.ondeleted);
        timeline.draw($rootScope.timelinedata);

        $rootScope.timelineService.renderBrokenAge();
        timeline.onDblClick = function (event) {
            $rootScope.timelineService.ondblclick(event);
        };
    }

    this.renderBrokenAge = function () {
        if ($rootScope.old_broken_age == null || $rootScope.old_broken_age == undefined)
            $rootScope.old_broken_age = $rootScope.MainResult.broken_age;
        if ($rootScope.old_broken_age >= $rootScope.PersonaPlan.death_age && $rootScope.MainResult.broken_age <= $rootScope.PersonaPlan.death_age) {
            if ($rootScope.isFirstLastPLayback != true) {
                utilService.showWarningMessage(utilService.translate('You will be broke by the age of') + ' ' + $rootScope.MainResult.broken_age + ".");
            }
            else {
                $rootScope.isFirstLastPLayback = false;
            }
            $rootScope.old_broken_age = angular.copy($rootScope.MainResult.broken_age);
        }
        else if ($rootScope.old_broken_age <= $rootScope.PersonaPlan.death_age && $rootScope.MainResult.broken_age > $rootScope.PersonaPlan.death_age) {
            if ($rootScope.isFirstLastPLayback != true) {
                utilService.showSuccessMessage(utilService.translate('All your goals are achievable'));                
            }
            else {
                $rootScope.isFirstLastPLayback = false;
            }
            $rootScope.old_broken_age = angular.copy($rootScope.MainResult.broken_age);
        }
        var date_from_brokenage = new Date(new Date().getFullYear() + $rootScope.MainResult.broken_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1);
        var broken = $.grep(timeline.items, function (e) { return e.name == 'broken_age'; });
        broken[0].start = date_from_brokenage;
        timeline.repaintAxis();
        var broken_left = timeline.timeToScreen(date_from_brokenage);        
        if ((timeline.dom.content.offsetWidth - broken_left) > 0) {
            if (timeline.eventParams.moved == true) {
                $('#timeline-broken-div').stop();
                $('#timeline-broken-div').animate({ width: timeline.dom.content.offsetWidth - broken_left }, 1000);
            }
            else {
                $('#timeline-broken-div').stop();
                $('#timeline-broken-div').animate({ width: timeline.dom.content.offsetWidth - broken_left }, 0);
            }
        }
        else {
            if (timeline.eventParams.moved == true) {
                $('#timeline-broken-div').stop();
                $('#timeline-broken-div').animate({ width: 0 }, 1000);
            }
            else {
                $('#timeline-broken-div').stop();
                $('#timeline-broken-div').animate({ width: 0 }, 0);
            }
        }
    }
    this.switchToCurrentPlan = function () {
        if ($rootScope.PersonaPlan.status != 0) // not a current plan
        {
            if ($rootScope.functionAccess.SWITCHED_PERSONA_PLAN != 1) {
                $rootScope.functionAccess.showErrorMessage();
                return;
            }
            $rootScope.newPlan = angular.copy($rootScope.PersonaPlan);
            $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
            $rootScope.PersonaPlan.start_age = angular.copy($rootScope.PersonaPlan.start_age);
            personalPlanService.updateConvertDataOfPersonalPlan();
            accountService.changeCurrency($rootScope.PersonaPlan.currency_code);

            $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
            $rootScope.MCTopValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
            }
            $rootScope.MCBottomValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
            }
            $rootScope.timelineService.renderTimeLine();
            $rootScope.actionService.calculateData();
            utilService.showSuccessMessage(utilService.translate('Switched to current plan'));
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan, 'switch', 'currentPlan', 'confirmdialog');
            personalPlanService.changeToCurrentPlan($rootScope.PersonaPlan);
        }

    }
    this.switchToNewPlan = function () {
        if ($rootScope.PersonaPlan.status != 1) // not a new plan
        {
            if ($rootScope.functionAccess.SWITCHED_PERSONA_PLAN != 1) {
                $rootScope.functionAccess.showErrorMessage();
                return;
            }
            $rootScope.currentPlan = angular.copy($rootScope.PersonaPlan);
            $rootScope.PersonaPlan = angular.copy($rootScope.newPlan);
            $rootScope.PersonaPlan.start_age = angular.copy($rootScope.PersonaPlan.start_age);
            personalPlanService.updateConvertDataOfPersonalPlan();
            $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
            $rootScope.MCTopValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
            }
            $rootScope.MCBottomValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
            }
            accountService.changeCurrency($rootScope.PersonaPlan.currency_code);
            $rootScope.timelineService.renderTimeLine();
            $rootScope.actionService.calculateData();
            utilService.showSuccessMessage(utilService.translate('Switched to new plan'));
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan, 'switch', 'newPlan', 'confirmdialog');
            personalPlanService.changeToNewPlan($rootScope.PersonaPlan);
        }

    }
    this.ResetPlan = function () {
        var message;
        if ($rootScope.PersonaPlan.status == 0)
            message = utilService.translate('Do you want to reset current plan?');
        else if ($rootScope.PersonaPlan.status == 1)
            message = utilService.translate('Do you want to reset new plan?');
        $rootScope.SendingScreenSharingDataObject('', 'resetplan', 'open', 'confirmdialog');
        $timeout(function () { utilService.ShowDialog($rootScope, utilService.translate('Reset Plan'), message, utilService.translate('Yes'), $rootScope.timelineService.ResetPlanCallback, utilService.translate('No'),$rootScope.timelineService.ResetPlanCancelCallback) }, 1);
    }
    this.ResetPlanCallback = function () {
        $rootScope.planService.resetPersonalPlan($rootScope.PersonaPlan.user_id, $rootScope.PersonaPlan.status, $rootScope.timelineService.ResetPlanSuccess);
    }
    this.ResetPlanCancelCallback = function () {
        $rootScope.SendingScreenSharingDataObject('', 'resetplan', 'cancel', 'confirmdialog');
    }
    this.ResetPlanSuccess = function (obj) {
        $rootScope.PersonaPlan = obj.plan;
        $rootScope.SendingScreenSharingDataObject(obj, 'resetplan', 'ok', 'confirmdialog');
        personalPlanService.updateConvertDataOfPersonalPlan();
        $rootScope.timelineService.renderTimeLine();
        $rootScope.actionService.calculateData();
        if ($rootScope.PersonaPlan.status == 0)
            utilService.showSuccessMessage(utilService.translate('Current plan has been reset.'));
        else if ($rootScope.PersonaPlan.status == 1)
            utilService.showSuccessMessage(utilService.translate('Resetted new plan'));

    }
    this.changeTextOfTimeline = function () {
        $rootScope.translateText = {
            years: $filter('translate')('years')
        }
    }

    this.removeSpouseRetirementIcon = function () {
        $rootScope.timelineService.renderTimeLine();        
    }

    this.addSpouseRetirementIcon = function (year) {
        $rootScope.timelineService.renderTimeLine();        
    } 
    this.dragControl = function (ev, evtObj) {
        var timeline_left = $('#timeline-addEvent').offset().left;
        var mouse_left = links.Timeline.getPageX(ev);
        if (isNaN(mouse_left))
            mouse_left = window.event.changedTouches[0].clientX;
        var drop_age = timeline.screenToTime(mouse_left - timeline_left);

        var year = drop_age.getFullYear() - new Date().getFullYear() + $rootScope.PersonaPlan.start_age + 1;
        var data = evtObj.clone.context.id;
        utilService.updateDefaultValueOfDream($rootScope);

        $rootScope.isEditDream = false;
        $rootScope.timelineDropYear = parseInt(year);
        var objsending = { datatype: '', objecttype: '', year: $rootScope.timelineDropYear };
        if (data == "btn-dream") {
            utilService.updateSelectedDreamType('dream');            
            $timeout(function () {
                $('#dreamdialog').modal({ backdrop: 'static', keyboard: false })
                objsending.datatype = 'dream';
                objsending.objecttype = 'dream';
                $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'open', 'dreamdialog');
                $('#SaveDream').bind('click', function () {
                    
                    $timeout(function () {
                        bindToSelectedDream($rootScope, year);
                        $rootScope.planService.AddDream($rootScope.selectedDream);
                        if ($rootScope.selectedDream.id != -1) {
                            $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length] = angular.copy($rootScope.selectedDream);
                            $rootScope.timelineService.renderTimeLine();
                            $rootScope.actionService.calculateData();
                        }
                        $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'ok', 'dreamdialog');
                        $('#SaveDream').unbind('click');
                        $('#CancelSaveDream').unbind('click');
                    }, 200);
                });
                $('#CancelSaveDream').bind('click', function () {
                    $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'cancel', 'dreamdialog');
                    $('#SaveDream').unbind('click');
                    $('#CancelSaveDream').unbind('click');
                });
            }, 500);
        } else if (data == 'btn-life-event') {
            utilService.updateSelectedDreamType('life_event');            
            $timeout(function () {
                $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false })
                objsending.datatype = 'lifeevent';
                objsending.objecttype = 'life_event';
                $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'open', 'lifeeventdialog');
                $('#SaveLifeEvent').bind('click', function () {
                    
                    $timeout(function () {
                        bindToSelectedLifeEvent($rootScope, year);
                        $rootScope.planService.AddLifeEvent($rootScope.selectedLifeEvent);
                        if ($rootScope.selectedLifeEvent.id != -1) {
                            $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length] = angular.copy($rootScope.selectedLifeEvent);
                            $rootScope.timelineService.renderTimeLine();
                            $rootScope.actionService.calculateData();
                        }
                        $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'ok', 'lifeeventdialog');
                        $('#SaveLifeEvent').unbind('click');
                        $('#cancelSaveLifeEvent').unbind('click');
                    }, 200);
                });
                $('#cancelSaveLifeEvent').bind('click', function () {
                    $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'cancel', 'lifeeventdialog');
                    $('#SaveLifeEvent').unbind('click');
                    $('#cancelSaveLifeEvent').unbind('click');
                });
            }, 500);

        }

    }
    $rootScope.ChangeSelectListDreamType = function (obj, type) {
        $rootScope.selectedDreamtype = findDreamTypebyId($rootScope, obj);      
    };

    $rootScope.ReloadSolutionWork = function () {
        if ($rootScope.PersonaPlan.status == 1) {
            $('#plan2').removeClass("btn-white").addClass("btn-primary");
            $('#plan1').removeClass("btn-primary").addClass("btn-white");

        } else {
            $('#plan1').removeClass("btn-white").addClass("btn-primary");
            $('#plan2').removeClass("btn-primary").addClass("btn-white");
        }
        $rootScope.timelineService.renderTimeLine();
    };
    $rootScope.refreshTimelineAfterUpdateProfile = function () {
        $rootScope.timelineService.renderTimeLine();
    }
    $rootScope.moveTimelineObject = function (name, fromYear, toYear, moveSpeed) {
        var duration = 2000;
        var tlObject, data_id;

        if (name.indexOf('dream') > -1) {
            data_id = parseInt(name.substring(name.lastIndexOf('_') + 1));
            tlObject = $.grep(timeline.items, function (e) { return e.name == 'dream' && e.data_id == data_id; });
        }
        else if (name.indexOf('lifeevent') > -1) {
            data_id = parseInt(name.substring(name.lastIndexOf('_') + 1));
            tlObject = $.grep(timeline.items, function (e) { return e.name == 'life_event' && e.data_id == data_id; });
        }
        else {
            tlObject = $.grep(timeline.items, function (e) { return e.name == name; });
        }

        if (tlObject && tlObject.length > 0) {
            var indexTl = timeline.items.indexOf(tlObject[0]);
            timeline.selectItem(indexTl);
            var step = fromYear < toYear ? 1 : -1;
            var durationforStep = Math.round(duration / Math.abs(toYear - fromYear));
            var maxstep = Math.abs(toYear - fromYear);
            var year = fromYear;
            for (var i = 0; i < maxstep ; i++) {
                $timeout(function () {
                    year += step;
                    var dt = new Date(new Date().getFullYear() + year - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1);
                    tlObject[0].start = dt;
                    timeline.render();                                        
                }, (i + 1) * durationforStep);
                
            }
            $timeout(function () { timeline.unselectItem(); }, duration);

        }
    }
    $rootScope.addLifeEventToPlayBack_open = function (dataObj) {        
        $rootScope.isEditDream = false;
        utilService.scopeApply();
        utilService.updateDefaultValueOfDream($rootScope);
        utilService.updateSelectedDreamType('life_event');                
        $timeout(function () {
            $('#lifeeventdialog').modal({
                backdrop: 'static', keyboard: false
            });          
        }, 1);
    }
    $rootScope.addLifeEventToPlayBack_ok = function (dataObj) {

        $timeout(function () {
            var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.id);
            bindLifeEventtoModalDialog($rootScope, index, dataObj);
            bindToSelectedLifeEvent($rootScope, (dataObj.starting_age));            
        }, 300);
        $timeout(function () {
            $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length] = dataObj;
            $rootScope.timelineService.renderTimeLine();
        }, 1000);
        $timeout(function () {
            $('#lifeeventdialog').modal('hide');
        }, 3000)
    }
    $rootScope.editDreamToPlayBack_open = function (dataObj) {
        if ($rootScope.functionAccess.EDIT_DREAM == 0) {
            $rootScope.EditdreamPermission = false;
        }
        else { $rootScope.EditdreamPermission = true; }
        $rootScope.isEditDream = true;
        var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);

        utilService.updateSelectedDreamType(dataObj.type, true);
        $timeout(function () {
            bindDreamtoModalDialog($rootScope, index, dataObj.newValue);
            $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });

        }, 1);
    }
    $rootScope.editDreamToPlayBack_ok = function (dataObj) {
        $timeout(function () {
            var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
            $rootScope.PersonaPlan.dreams[index] = dataObj.newValue;
            utilService.updateSelectedDreamType(dataObj.type, true);
            bindDreamtoModalDialog($rootScope, index, dataObj.newValue);            
        }, 1);
        $timeout(function () {
            $rootScope.timelineService.renderTimeLine();
        }, 1000);
        $timeout(function () {
            $('#dreamdialog').modal('hide');
        }, 3000);
    }
    $rootScope.editLifeEventToPlayBack_open = function (dataObj) {
        $rootScope.isEditDream = true;
        if ($rootScope.functionAccess.EDIT_LIFE_EVENT == 0) {            
            $rootScope.EditLifeeventPermission = false;
        }
        else { $rootScope.EditLifeeventPermission = true; }                                
        $timeout(function () {
            $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false });
        }, 10);
    }
    $rootScope.editLifeEventToPlayBack_ok = function (dataObj) {
        $timeout(function () {
            
            var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.id);
            $rootScope.PersonaPlan.lifeEvent[index] = dataObj;
            bindLifeEventtoModalDialog($rootScope, index, dataObj);                                    
        }, 1);
        setTimeout(function () {
            $rootScope.timelineService.renderTimeLine();
            $('#lifeeventdialog').modal('hide');
        }, 2000);
    }
    $rootScope.changeStartAge = function (fromYear, toYear, duration) {
        var tlObject = $.grep(timeline.items, function (e) { return e.name == 'start_age'; });
        if (tlObject && tlObject.length > 0) {
            var step = fromYear < toYear ? 1 : -1;
            var durationforStep = Math.round(duration / Math.abs(toYear - fromYear));
            var maxstep = Math.abs(toYear - fromYear);
            var year = fromYear;
            for (var i = 0; i < maxstep ; i++) {
                $timeout(function () {
                    year += step;
                    $rootScope.PersonaPlan.start_age = year;
                    $rootScope.timelineService.renderTimeLine();
                }, (i + 1) * durationforStep);

            }

        }
    }
    $rootScope.actionChangeStartAge = function (playAction) {
        var fromvalue = parseFloat(playAction.data[0].fromvalue);
        var tovalue = parseFloat(playAction.data[0].tovalue);
        $rootScope.changeStartAge(fromvalue, tovalue, 2000);
    }
    $rootScope.backwardActionChangeStartAge = function (playAction) {
        var fromvalue = parseFloat(playAction.data[0].fromvalue);
        var tovalue = parseFloat(playAction.data[0].tovalue);
        $rootScope.changeStartAge(tovalue, fromvalue, 2000);
    }
    $rootScope.addDreamToPlayBack = function (dataObj) {
        $rootScope.timelineDropYear = dataObj.purchase_age;
        $rootScope.isEditDream = false;
        utilService.scopeApply();
        utilService.updateDefaultValueOfDream($rootScope);
       
        bindDreamtoModalDialog($rootScope, $rootScope.PersonaPlan.dreams.length - 1);        
        $timeout(function () {
            utilService.updateSelectedDreamType('dream');
            $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
        }, 1);
        $timeout(function () {
            $rootScope.timelineService.renderTimeLine();
        }, 1000);
        $timeout(function () {
            $('#dreamdialog').modal('hide');
        }, 3000);
    }
    $rootScope.actionRemoveDreamEvent = function (dataObj) {
        var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.id);
        if ($rootScope.PersonaPlan.dreams[index].id != undefined) {
            $rootScope.PersonaPlan.dreams.splice(index, 1);
            $timeout(function () {
                $rootScope.timelineService.renderTimeLine();
            }, 100);
        }
    }
    $rootScope.addLifeEventToPlayBack = function (dataObj) {
        $rootScope.addLifeEventToPlayBack_open(dataObj);
        $rootScope.addLifeEventToPlayBack_ok(dataObj);
    }
    $rootScope.removeLifeEventToPlayBack = function (dataObj) {        
        var lifeEvent_Index = getIndexOfDataId($rootScope, 'lifeevent', dataObj.id);
        $rootScope.PersonaPlan.lifeEvent.splice(lifeEvent_Index, 1);
        $timeout(function () {
            $rootScope.timelineService.renderTimeLine();
        }, 100);
    }
    $rootScope.editDreamToPlayBack = function (dataObj) {
        $rootScope.editDreamToPlayBack_open(dataObj);
        $rootScope.editDreamToPlayBack_ok(dataObj);
    }
    $rootScope.editLifeEventToPlayBack = function (dataObj) {
        $rootScope.editLifeEventToPlayBack_open(dataObj);
        $rootScope.editLifeEventToPlayBack_ok(dataObj);
    }
    $rootScope.backwardActionMoveRetirementAndSocialAge =function(playAction){

    }
    $rootScope.actionMoveRetirementAndSocialAge = function (playAction) {
        var retirefrom = parseInt(playAction.data[0].fromvalue);
        var retireto = parseInt(playAction.data[0].tovalue);
        var socialfrom = parseInt(playAction.data[1].fromvalue);
        var socialto = parseInt(playAction.data[1].tovalue);

        var retireName = playAction.data[0].fieldname;
        var socialName = playAction.data[1].fieldname;
        if (retirefrom < retireto)
            $rootScope.actionMoveRetirementAndSocialAgeForward(retirefrom, retireto, retireName, socialName);
        else
            $rootScope.actionMoveRetirementAndSocialAgeBackward(retirefrom, retireto, socialfrom, socialto, retireName, socialName);
    }
    $rootScope.backwardActionMoveRetirementAndSocialAge = function (playAction) {
        var retirefrom = parseInt(playAction.data[0].fromvalue);
        var retireto = parseInt(playAction.data[0].tovalue);
        var socialfrom = parseInt(playAction.data[1].fromvalue);
        var socialto = parseInt(playAction.data[1].tovalue);

        var retireName = playAction.data[0].fieldname;
        var socialName = playAction.data[1].fieldname;
        if (retirefrom < retireto)
            $rootScope.actionMoveRetirementAndSocialAgeBackward(retireto, retirefrom, socialto, socialfrom, retireName, socialName);
        else
            $rootScope.actionMoveRetirementAndSocialAgeForward(retireto, retirefrom, retireName, socialName);
    }
    $rootScope.actionMoveRetirementAndSocialAgeForward = function (retirefrom, retireto, retireName, socialName) {
        var duration = 2000;
        retireObject = $.grep(timeline.items, function (e) { return e.name == retireName; });
        socialObject = $.grep(timeline.items, function (e) { return e.name == socialName; });
        var indexTl = timeline.items.indexOf(retireObject[0]);
        timeline.selectItem(indexTl);
        var step = 1;
        var maxstep = Math.abs(retireto - retirefrom);
        var durationforStep = Math.round(duration / maxstep);        
        var year = retirefrom;
        for (var i = 0; i < maxstep ; i++) {
            $timeout(function () {
                year += step;
                var dt = new Date(new Date().getFullYear() + year - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1);
                retireObject[0].start = dt;
                if ($rootScope.PersonaPlan.social_security_age < year) {
                    $rootScope.PersonaPlan.social_security_age = year;
                    socialObject[0].start = dt;
                }
                
                $rootScope.PersonaPlan.retirement_age = year;
                timeline.render();
            }, (i + 1) * durationforStep);

        }
        $timeout(function () { timeline.unselectItem(); }, duration);
    }
    $rootScope.actionMoveRetirementAndSocialAgeBackward = function (retirefrom, retireto, socialfrom, socialto, retireName, socialName) {
        var beginYear = retirefrom > socialfrom ? retirefrom : socialfrom;
        var endYear = retireto < socialto ? retireto : socialto;

        var duration = 2000;
        retireObject = $.grep(timeline.items, function (e) { return e.name == retireName; });
        socialObject = $.grep(timeline.items, function (e) { return e.name == socialName; });
        var indexTl = retirefrom >= socialfrom ? timeline.items.indexOf(retireObject[0]) : timeline.items.indexOf(socialObject[0]);
        timeline.selectItem(indexTl);
        var step = -1;
        var maxstep = Math.abs(endYear - beginYear);
        var durationforStep = Math.round(duration / maxstep);
        var year = beginYear;
        for (var i = 0; i < maxstep ; i++) {
            $timeout(function () {
                year += step;
                var dt = new Date(new Date().getFullYear() + year - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1);
                if ($rootScope.PersonaPlan.retirement_age > year && $rootScope.PersonaPlan.retirement_age > retireto) {
                    $rootScope.PersonaPlan.retirement_age = year;
                    retireObject[0].start = dt;
                }                
                if ($rootScope.PersonaPlan.social_security_age > year && $rootScope.PersonaPlan.social_security_age > socialto) {
                    $rootScope.PersonaPlan.social_security_age = year;
                    socialObject[0].start = dt;
                }


                timeline.render();
            }, (i + 1) * durationforStep);

        }
        $timeout(function () { timeline.unselectItem(); }, duration);
    }
    $rootScope.setCurrentActive = function () {
        $('#plan1').removeClass("btn-white").addClass("btn-primary");
        $('#plan2').removeClass("btn-primary").addClass("btn-white");        
    }
    $rootScope.setNewButtonActive = function () {
        $('#plan2').removeClass("btn-white").addClass("btn-primary");
        $('#plan1').removeClass("btn-primary").addClass("btn-white");
    }
    $rootScope.reRenderTimelineObject = function () {
        $rootScope.timelineService.renderTimeLine();
    }
    
    $rootScope.addDreamAtViewing = function (dataObj) {
        var index;
        $timeout(function () {
            
            if (dataObj.type == 'dream') {
                $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length] = dataObj.newValue;
                index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
                bindDreamtoModalDialog($rootScope, index);                               
            }
            else {
                $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length] = dataObj.newValue;
                index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
                bindLifeEventtoModalDialog($rootScope, index);                
            }            
        }, 1);
        $timeout(function () {            
            $rootScope.timelineService.renderTimeLine();
        }, 1000);
        $timeout(function () {
            $('#' + dataObj.controlID).modal('hide');
        }, 3000);
    }
    $rootScope.editDreamAtViewing = function (dataObj) {
        var index;
        $timeout(function () {

            if (dataObj.name == 'dream') {
                index = getIndexOfDataId($rootScope, dataObj.name, dataObj.newValue.id);
                $rootScope.PersonaPlan.dreams[index] = dataObj.newValue;
                bindDreamtoModalDialog($rootScope, index);                
            }
            else {                
                index = getIndexOfDataId($rootScope, dataObj.name, dataObj.newValue.id);
                $rootScope.PersonaPlan.lifeEvent[index] = dataObj.newValue;
                bindLifeEventtoModalDialog($rootScope, index);                
            }
        }, 1);
        $timeout(function () {
            $rootScope.timelineService.renderTimeLine();
        }, 1000);
        $timeout(function () {
            $('#' + dataObj.controlID).modal('hide');
        }, 3000);
    }
    $rootScope.UpdateControlForShareScreen = function (obj) {
        switch (obj.action) {
            case 'move':
                if ($rootScope.timestampViewing == undefined || $rootScope.timestampViewing < obj.timestamp) {
                    var Scrobj = $.grep(timeline.items, function (e) { return e.name == obj.newValue.name && e.data_id == obj.newValue.data_id; });
                    var timelineIndex;
                    if (Scrobj && Scrobj.length > 0) {
                        Scrobj[0].start = new Date(obj.newValue.start.toString());
                        if (timeline.selection != true) {
                            timelineIndex = timeline.items.indexOf(Scrobj[0]);
                            timeline.selectItem(timelineIndex);
                        }
                        timeline.render();
                    }
                    $rootScope.timestampViewing = obj.timestamp;
                }
                
                break;
            case 'move_end':
                $rootScope.PersonaPlan = angular.copy(obj.newValue);
                $rootScope.options.max = new Date(new Date().getFullYear() + $rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age + 1, 0, 0);
                $rootScope.timelineService.renderTimeLine();                
                break;
            case 'delete':
                switch (obj.actionEvent) {
                    case 'open':
                        var message = utilService.translate('Do you want to delete it?');
                        if (obj.newValue.name == 'dream' && obj.newValue.lifeevent_name.length > 1)
                        {
                            message = utilService.translate("Life Event: {{name}} will be delete too, Are you sure?", { name: obj.newValue.lifeevent_name });
                        }
                        $timeout(function () { utilService.ShowDialog($rootScope, utilService.translate('Confirmation'), message, utilService.translate('Yes'), null, utilService.translate('No'), null) }, 1);
                        break;
                    case 'ok':
                        $rootScope.PersonaPlan = angular.copy(obj.newValue);
                        $timeout(function () { $('#' + obj.controlID).modal('hide'); }, 1);
                        $rootScope.timelineService.renderTimeLine();
                        break;
                    case 'cancel':
                        $rootScope.PersonaPlan = angular.copy(obj.newValue);
                        $('#' + obj.controlID).modal('hide');
                        $rootScope.timelineService.renderTimeLine();
                        break;
                }
                break;
            case 'add':
                switch (obj.actionEvent) {
                    case 'open':
                        $rootScope.isEditDream = false;
                        $rootScope.timelineDropYear = parseInt(obj.newValue.year);
                        utilService.updateDefaultValueOfDream($rootScope);
                        utilService.updateSelectedDreamType(obj.newValue.objecttype);

                        $timeout(function () {                            
                            $('#' + obj.controlID).modal({ backdrop: 'static', keyboard: false });
                        }, 500);
                        break;
                    case 'ok':
                        $rootScope.addDreamAtViewing(obj);                        
                        break;
                    case 'cancel':                       
                        $('#' + obj.controlID).modal('hide');
                        $rootScope.timelineService.renderTimeLine();
                        break;
                }
                break;
            case 'edit':
                switch (obj.actionEvent) {
                    case 'open':
                        if (obj.name == 'start_age') {
                            $rootScope.PersonaPlan.start_age = obj.newValue;
                            $rootScope.MaxStartAge = getMaxStartAge($rootScope);
                            $rootScope.MinStartAge = 18;
                            $rootScope.form_start_age = obj.newValue;
                        }
                        else if (obj.name == 'social_security_age') {
                            $rootScope.PersonaPlan.social_security_age = obj.newValue;
                            $rootScope.MinSocialSecurityAge = $rootScope.PersonaPlan.retirement_age > 60 ? parseInt($rootScope.PersonaPlan.retirement_age) : 60;
                        }
                        else {
                            $rootScope.isEditDream = true;
                            index = getIndexOfDataId($rootScope, obj.name, obj.newValue.id);
                            utilService.updateSelectedDreamType(obj.name, true);
                            if (obj.name == 'dream') {
                                if ($rootScope.functionAccess.EDIT_DREAM == 0) {
                                    $rootScope.EditdreamPermission = false;
                                }
                                else { $rootScope.EditdreamPermission = true; }
                                $rootScope.PersonaPlan.dreams[index] = obj.newValue;
                                bindDreamtoModalDialog($rootScope, index);                                
                            }
                            else {
                                if ($rootScope.functionAccess.EDIT_LIFE_EVENT == 0) {
                                    $rootScope.EditLifeeventPermission = false;
                                }
                                else { $rootScope.EditLifeeventPermission = true; }
                                $rootScope.PersonaPlan.lifeEvent[index] = obj.newValue;
                                bindLifeEventtoModalDialog($rootScope, index);                                
                            }
                        }
                        $timeout(function () { $('#' + obj.controlID).modal({ backdrop: 'static', keyboard: false }); }, 100);
                        break;
                    case 'ok':
                        if (obj.name == 'start_age') {
                            $rootScope.form_start_age = obj.newValue;
                            $rootScope.PersonaPlan.start_age = obj.newValue;
                        }
                        else if (obj.name == 'social_security_age') {
                            $rootScope.PersonaPlan.social_security_age = obj.newValue;
                        }
                        else {
                            $rootScope.editDreamAtViewing(obj);
                            return;
                        }

                        $timeout(function () {
                            $('#' + obj.controlID).modal('hide');
                            $rootScope.timelineService.renderTimeLine();
                        }, 2000);
                        break;
                    case 'cancel':
                        $('#' + obj.controlID).modal('hide');
                        $rootScope.timelineService.renderTimeLine();
                        break;
                }
                break;
            case 'resetplan':
                switch (obj.actionEvent) {
                    case 'open':
                        if ($rootScope.PersonaPlan.status == 0)
                            message = utilService.translate('Do you want to reset current plan?');
                        else if ($rootScope.PersonaPlan.status == 1)
                            message = utilService.translate('Do you want to reset new plan?');
                        $timeout(function () { utilService.ShowDialog($rootScope, utilService.translate('Reset Plan'), message, utilService.translate('Yes'), null, utilService.translate('No'), null) }, 1);
                        break;
                    case 'ok':
                        if ($rootScope.PersonaPlan.status == 0)
                            utilService.showSuccessMessage(utilService.translate('Current plan has been reset.'));
                        else if ($rootScope.PersonaPlan.status == 1)
                            utilService.showSuccessMessage(utilService.translate('Resetted new plan'));
                        $rootScope.PersonaPlan = obj.newValue.plan;
                        $rootScope.timelineService.renderTimeLine();
                        $('#' + obj.controlID).modal('hide');                       
                        break;
                    case 'cancel':
                        $('#' + obj.controlID).modal('hide');
                        break;
                }
                break;
            case 'switch':
                $rootScope.PersonaPlan = angular.copy(obj.newValue);
                $rootScope.timelineService.renderTimeLine();
                if (obj.actionEvent == 'newPlan') {
                    utilService.showSuccessMessage(utilService.translate('Switched to new plan'));
                    $rootScope.setNewButtonActive();
                }
                else {
                     utilService.showSuccessMessage(utilService.translate('Switched to current plan'));
                    $rootScope.setCurrentActive();
                }
                break;
            case 'tab':
                switch (obj.controlID) { 
                   case 'Scenario': 
                        ReUpdateForControlByIdForSharing('manageScenario', obj.actionEvent, obj.newValue); 
                        break;
                    case 'Solution':
                        ReUpdateForControlByIdForSharing('manageSolution', obj.actionEvent, obj.newValue);
                        break;
                    case 'RankingDreams':                        
                        switch (obj.actionEvent) {
                            case 'open':
                                $rootScope.playBackPlayerData.data = obj.newValue;
                                $state.go('ranking_dreams');
                                break;
                            case 'change':
                                $rootScope.MainResult = obj.newValue.basic;
                                $rootScope.PersonaPlan = obj.newValue.PersonaPlan;
                                utilService.scopeApply();
                                $timeout(function () {
                                    $rootScope.MCTopValue.selected = ($rootScope.PersonaPlan.mc_top_value * 100) + '%';
                                    $rootScope.MCBottomValue.selected = (rootScope.PersonaPlan.mc_bottom_value * 100) + '%';
                                    personalPlanService.updateConvertDataOfPersonalPlan();
                                }, 100);
                                $rootScope.IncomeExpenseChart = null;
                                $rootScope.EquityCurveChart = null;
                                utilService.scopeApply();
                                $timeout(function () {
                                    ReUpdateForControlById('RankingDreamTab');
                                }, 200);
                                break;
                            case 'reorder':                                
                                ReUpdateForControlByIdForSharing('RankingDreamTab', obj.actionEvent, obj.newValue);
                                break;
                            case 'result':
                                ReUpdateForControlByIdForSharing('RankingDreamTab', obj.actionEvent, obj.newValue);
                                break;
                        }
                        break;
                    case 'LiquidIlliquidAsset':
                        switch (obj.actionEvent) {
                            case 'open':
                                $rootScope.playBackPlayerData.data = obj.newValue;
                                $state.go('liquid_illiquid_asset');
                                break;
                            case 'change':
                                $rootScope.MainResult = obj.newValue.basic.basic;
                                $rootScope.EquityCurveChart = obj.newValue.basic;
                                $rootScope.PersonaPlan = obj.newValue.PersonaPlan;
                                utilService.scopeApply();
                                $timeout(function () {
                                    $rootScope.MCTopValue.selected = ($rootScope.PersonaPlan.mc_top_value * 100) + '%';
                                    $rootScope.MCBottomValue.selected = (rootScope.PersonaPlan.mc_bottom_value * 100) + '%';
                                    personalPlanService.updateConvertDataOfPersonalPlan();
                                    repaintchartEquid();
                                }, 100);
                                break;
                            case 'select':
                                repaintchartEquidForSelectItem(obj.newValue);
                                break;
                        }

                        break;
                }
                break;
            default:
                break;
        }
    }
    $rootScope.SendingScreenSharingDataObject = function (obj, actionType, actionEvent, controlID) {
        var sendObj = $rootScope.GetChangedObject(obj, 'sharing', actionType, actionEvent, controlID, $rootScope.clientActionObjectId, $rootScope.clientActionObjectEvent);        
        $rootScope.sharingService.dataSend(sendObj);
    }
    $rootScope.GetChangedObject = function (obj, typeObject, actionType, actionEvent, controlID, clientActionObjectId, clientActionObjectEvent) {
        var sharingScreenObj;
        if (typeObject == 'sharing') {
            var newValue;
            switch (actionType) {
                case 'move':
                    newValue = {
                        name: obj.name,
                        data_id: obj.data_id,
                        dream_id:obj.dream_id,
                        start: obj.start
                    }
                    break;
                case 'add':
                    if (actionEvent == 'open')
                        newValue = obj;
                    else if (actionEvent == 'ok')
                        newValue = obj.datatype == 'dream' ? $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length - 1] : $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length - 1];
                    else
                        newValue = '';
                    break;
                case 'edit':
                    switch (obj.name) {
                        case 'start_age':
                            newValue = $rootScope.PersonaPlan.start_age;
                            break;
                        case 'social_security_age':
                            newValue = $rootScope.PersonaPlan.social_security_age;
                            break;
                        case 'dream':
                            var dream = $.grep($rootScope.PersonaPlan.dreams, function (e) { return e.id == obj.data_id; });
                            newValue = dream[0];
                            break;
                        case 'life_event':
                            var lifeEvent = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.id == obj.data_id; });
                            newValue = lifeEvent[0];
                            break;
                    }
                    break;
                default:
                    newValue = obj;
                    break;
            }
            sharingScreenObj = {
                action: actionType,
                actionEvent: actionEvent,
                type: obj.datatype,
                newValue: newValue,
                name: obj.name,
                controlID: controlID,
                timestamp: Date.now()
            }
        }
        return sharingScreenObj;
    }
    // end step
    $rootScope.SetEventActionTypeForShare = function (controlId, event) {
        if ($rootScope.isTakeOver == true) {
            $rootScope.clientActionObjectId = controlId;
            $rootScope.clientActionObjectEvent = event;
        }
    };
    $rootScope.ReloadShareScreen = function () {

    }
});