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
var isdoubleClick = false;
var mousedown = false;
btoApp.service('timelineService', function ($rootScope, personalPlanService, utilService, $timeout, $state, $locale, accountService, CONFIG, savingRateService, illiquidAssetService, $filter) {
    $rootScope.totalExisting = 0;
    $rootScope.dreamOrLifeData = {
        residence_purchase_total_cost: 0,
        residence_sale_value: 0
    }
    this.initTimeline = function () {
        this.renderTimeLine();
        $rootScope.renoutProperty = {
            textwillrent: 'I will rent out this property',
            textrentover: 'I am renting out this property'
        };

        // illiquidAssetService.init();
        //console.log('Finished render initTimeline');
        //console.timeEnd('btoApp');
        $timeout(function () {
            //console.log('Start calculateData');
            //console.timeEnd('btoApp');
            $rootScope.actionService.calculateData();
        }, 200);
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
            if (item.name == "start_age") {
                if ($rootScope.profile.client.isChangedStartAge) {
                    $rootScope.timelineDataChange = true;
                    return;
                }
                var maxStartAge = Math.min(54, getMaxStartAge($rootScope));
                year = timeline.items[0].start_age + steptocurrent + 1;
                if (year > maxStartAge) {
                    year = maxStartAge;
                    $rootScope.timelineMessage = utilService.translate('You have an item on timeline at: ') + ' ' + maxStartAge + '.';

                }
                    //else $rootScope.timelineMessage = '';
                else {
                    if (year < 18) {
                        year = 18;
                        $rootScope.timelineMessage = utilService.translate('Current Age must be greater than') + ' ' + 18 + '.';
                    }
                    else $rootScope.timelineMessage = '';
                }
                if (year != $rootScope.form_start_age) {
                    $rootScope.form_start_age = year;
                    $rootScope.timelineDataChange = true;
                }
                $rootScope.timelineDataChange = true;
                //$rootScope.zoomData.minAge = $rootScope.PersonaPlan.start_age;
                return;
            }
            if (item.name == "retirement_age" && $rootScope.PersonaPlan.retirement_age != timeline.items[0].start_age + steptocurrent + 1) {

                year = timeline.items[0].start_age + steptocurrent + 1;
                $rootScope.timelineMessage = '';
                boundingYear = year < $rootScope.PersonaPlan.start_age ? $rootScope.PersonaPlan.start_age : year;
                boundingYear = boundingYear > $rootScope.PersonaPlan.death_age ? $rootScope.PersonaPlan.death_age : boundingYear;

                $rootScope.PersonaPlan.retirement_age = boundingYear;
                $rootScope.timelineDataChange = true;
            }
            else if (item.name == "social_security_age" && $rootScope.PersonaPlan.social_security_age != timeline.items[0].start_age + steptocurrent + 1) {
                year = timeline.items[0].start_age + steptocurrent + 1;
                if (year > $rootScope.cashFlow.parameter.age_max_cpf_life || year < $rootScope.cashFlow.parameter.age_min_cpf_life) {
                    $rootScope.timelineMessage = utilService.translate('CPF Life Payout must be between') + ' ' + $rootScope.cashFlow.parameter.age_min_cpf_life + '-' + $rootScope.cashFlow.parameter.age_max_cpf_life;
                }
                else $rootScope.timelineMessage = '';
                boundingYear = year < $rootScope.cashFlow.parameter.age_min_cpf_life ? $rootScope.cashFlow.parameter.age_min_cpf_life : year;
                boundingYear = boundingYear > $rootScope.cashFlow.parameter.age_max_cpf_life ? $rootScope.cashFlow.parameter.age_max_cpf_life : boundingYear;
                $rootScope.PersonaPlan.social_security_age = boundingYear;
                $rootScope.timelineDataChange = true;
            }
            else if (item.name == "dream") {
                var data_id = item.data_id;
                var result = $.grep($rootScope.PersonaPlan.dreams, function (e) { return e.id == data_id; });
                if (result && result.length > 0 && result[0].existant == true && result[0].purchase_age != year) {
                    $rootScope.timelineDataChange = true;
                    $rootScope.timelineMessage = utilService.translate('You cannot move the existed dreams.');
                    return;
                }
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

                //var result = $.grep($rootScope.PersonaPlan.dreams, function (e) { return e.id == data_id; });
                if (result && result.length > 0 && result[0].purchase_age != year) {
                    result[0].purchase_age = year;
                    $rootScope.timelineDataChange = true;
                }
            }
            else if (item.name == "life_event" && $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.id == item.data_id; })[0].dream_type_id == 5) {
                var data_id = item.data_id;

                var year = timeline.items[0].start_age + steptocurrent + 1;
                var result = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.id == data_id; });


                if (result && result.length > 0 && result[0].starting_age != year) {
                    //if (life_eventobj.length > 0) {
                    var childList = $rootScope.profile.children.childrens.filter(function (child) { return result[0].dependent_reference == 'child_' + child.id; })
                    if (childList.length > 0) {
                        var childObj = childList[0];
                        var age_dependent = year - $rootScope.PersonaPlan.start_age + childObj.age;
                        var obj = $(item.dom);
                        var timeline_item_description = obj.find('.timeline_item_description');
                        timeline_item_description.removeClass('hover');
                        timeline_item_description.css('display', 'block');
                        timeline_item_description.find('div').css('display', 'block');
                        timeline_item_description.find('.age_dependent').html(age_dependent);
                        timeline_item_description.find('.your_age_dependent').html(year);
                        timeline_item_description.find('div').css('display', 'block');
                        timeline_item_description.css('width', '246px');
                        timeline_item_description.css('opacity', 1);
                        timeline_item_description.find('div').css('opacity', 1);
                        timeline_item_description.find('img').css('opacity', 1);
                        //timeline_item_description.html(" " + utilService.translate('Age of independence') + ": " + age_dependent + " &nbsp;");
                        //console.log(age_dependent, obj);

                    }
                    //}
                    result[0].starting_age = year;
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
            return;
        }
    },
    this.onchanged = function () {

        if (timeline.selection != undefined && $rootScope.timelineDataChange) {
            var index = (timeline.selection && timeline.selection.index !== undefined) ? timeline.selection.index : -1;
            var item = (timeline.selection && timeline.selection.index !== undefined) ? timeline.items[index] : undefined;

            if (item && item.name == "start_age") {
                if ($rootScope.profile.client.isChangedStartAge) {
                    var message = "Dear " + ($rootScope.profile.client.first_name == null ? "User" : $rootScope.profile.client.first_name);
                    message += ", after changing your age to " + $rootScope.PersonaPlan.start_age;
                    message += ", it will be locked definitively.";
                    utilService.showWarningMessage(message);
                    $rootScope.timelineDataChange = false;
                    $rootScope.timelineService.renderTimeLine();
                    return;
                }
                if ($rootScope.timelineMessage.length > 2)
                    utilService.showWarningMessage($rootScope.timelineMessage);
                if ($rootScope.form_start_age != $rootScope.PersonaPlan.start_age) {
                    $rootScope.timelineService.ShowdialogConfirmChangeStartAge();
                    $rootScope.timelineDataChange = false;
                }
                else {
                    $rootScope.timelineService.renderTimeLine();
                    $rootScope.timelineDataChange = false;
                }
                return;

            }
            if (item.name == "life_event" || item.name == "dream") {
                var obj = $(item.dom);
                var timeline_item_description = obj.find('.timeline_item_description');
                timeline_item_description.css('display', 'none');
                timeline_item_description.find('div').css('display', 'none');

                timeline_item_description.find('div').css('display', 'none');
                timeline_item_description.css('width', '0px');
                timeline_item_description.css('opacity', 0);
                timeline_item_description.find('div').css('opacity', 0);
                timeline_item_description.find('img').css('opacity', 0);
            }
            if ($rootScope.timelineMessage.length > 2)
                utilService.showWarningMessage($rootScope.timelineMessage);
            $rootScope.options.max = new Date(new Date().getFullYear() + $rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age + 1, 0, 0);

            $rootScope.timelineDataChange = false;
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan, 'move_end');
            $timeout(function () {
                var itemafterchange = $.grep(timeline.items, function (e) { return e.name == item.name && e.data_id == item.data_id; });
                if (itemafterchange && itemafterchange.length > 0 && selectedYear != itemafterchange[0].start.getFullYear()) {
                    $rootScope.timelineService.renderTimeLine();
                    $rootScope.actionService.calculateData();
                    $rootScope.actionService.updateData();
                }
            }, 300);
            return;
        }
    }
    var selectedLifeEventOrDream = null;
    var selectedYear = null;
    this.onmousedownclick = function () {
        mousedown = true;
        if (typeof item_selected_id !== "undefined") {
            var item = timeline.items[item_selected_id];
            selectedYear = angular.copy(item.start.getFullYear())
            if (item.name == "life_event" || item.name == "dream") {
                var index = getIndexOfDataId($rootScope, 'lifeevent', item.data_id);
                selectedLifeEventOrDream = $rootScope.PersonaPlan.lifeEvent[index];
            }
            else
                selectedLifeEventOrDream = null;
            $rootScope.timelineService.cancelHighlight();
            //$('#updateDreamPanel').hide();
            $rootScope.timelineService.hideActionPanel();
        }
    }
    this.onmouseupclick = function () {
        mousedown = false;
        $timeout(function () {
            if (angular.isDefined(selectedLifeEventOrDream) && selectedLifeEventOrDream != null && (selectedLifeEventOrDream.dream_type_id == 5 || selectedLifeEventOrDream.starting_age != 200)) {
                var searchChild = $rootScope.profile.children.childrens.filter(function (child) {
                    return ('child_' + child.id) == selectedLifeEventOrDream.dependent_reference;
                });
                $rootScope.SendingScreenSharingDataObject({ 'selectedLifeEventOrDream': selectedLifeEventOrDream, 'profile': $rootScope.profile }, 'timelineService', 'onmouseupclick', '');
                if (searchChild.length > 0) {
                    var childObj = searchChild[0];
                    // check move above age dependent
                    if (selectedLifeEventOrDream.starting_age - $rootScope.PersonaPlan.start_age < 0) {
                        selectedLifeEventOrDream.age_dependent = childObj.age;
                        selectedLifeEventOrDream.starting_age = $rootScope.PersonaPlan.start_age + selectedLifeEventOrDream.age_dependent - childObj.age;
                    }
                    var age_dependent = selectedLifeEventOrDream.starting_age - $rootScope.PersonaPlan.start_age + childObj.age;
                    if (age_dependent < 16) {
                        utilService.showWarningMessage(utilService.translate('Age of independence of life event {{name}} must greater than 16', { name: selectedLifeEventOrDream.name }));
                        selectedLifeEventOrDream.age_dependent = 16;
                        selectedLifeEventOrDream.starting_age = $rootScope.PersonaPlan.start_age + selectedLifeEventOrDream.age_dependent - childObj.age;
                        $rootScope.timelineService.renderTimeLine();
                    } else if (age_dependent > 25) {
                        utilService.showWarningMessage(utilService.translate('Age of independence of life event {{name}} must less than 25', { name: selectedLifeEventOrDream.name }));
                        selectedLifeEventOrDream.age_dependent = 25;
                        selectedLifeEventOrDream.starting_age = $rootScope.PersonaPlan.start_age + selectedLifeEventOrDream.age_dependent - childObj.age;
                        $rootScope.timelineService.renderTimeLine();
                    } else {
                        selectedLifeEventOrDream.age_dependent = age_dependent;
                    }
                }
            }
            //$rootScope.timelineService.renderTimeLine();
        }, 200);
    }
    this.validateShowDreamRental = function () {
        var existingNotRentYet = 0;
        angular.forEach($rootScope.PersonaPlan.dreams, function (dream) {

            if (dream.existant && !dream.is_rent && ($rootScope.ExisingDreamSelecting == null || dream.id != $rootScope.ExisingDreamSelecting.id)) {
                existingNotRentYet = existingNotRentYet + 1;
            }
        });
        var existingDreams = $filter('filter')($rootScope.PersonaPlan.dreams, { existant: true });
        if (existingNotRentYet == 0 && $rootScope.selectedDream.existant && (existingDreams.length == 0 || (existingDreams.length == 1 && $rootScope.ExisingDreamSelecting != null && $rootScope.ExisingDreamSelecting.id == existingDreams[0].id))) {
            $rootScope.isShowDreamRental = true;
            $rootScope.utilService.scopeApply();

            angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (dreamTypeConfig) {
                if (dreamTypeConfig.field_name == 'is_rent') {
                    dreamTypeConfig.value = false;
                    //$("#dream_rentalPanel").slideUp();

                }
                else if (dreamTypeConfig.field_name == 'is_living') {
                    dreamTypeConfig.value = true;
                }
            });
            $rootScope.utilService.scopeApply();
        }
        else {
            $rootScope.isShowDreamRental = false;
            $rootScope.utilService.scopeApply();
        }
    }

    this.changeResidentialType = function (index) {
        if (this.selectedDream.config_data.is_edit) return;
        var residentialTypeObj = $filter('filter')($rootScope.residentialType, { id: index });
        if (residentialTypeObj.length > 0) {
            residentialTypeObj = residentialTypeObj[0];
            if (angular.isUndefined(this.selectedDream.config_data.is_change_value) || !this.selectedDream.config_data.is_change_value) {
                this.selectedDream.name = utilService.initNameOfDreamOrLifeEvent(this.selectedDream.dream_type_id, residentialTypeObj.name);
                $rootScope.utilService.scopeApply();
            }
        }
    }



    this.checkDreamRental = function (type, only_check) {
        var self = this;
        if (angular.isDefined(this.selectedDream.config_data.is_edit) && this.selectedDream.config_data.is_edit) {
            var existingNotRentYet = 0;
            angular.forEach($rootScope.PersonaPlan.dreams, function (dream) {
                if (dream.existant && !dream.is_rent && (dream.id != self.selectedDream.id)) {
                    existingNotRentYet = existingNotRentYet + 1;
                }
            });
            console.log("existingNotRentYet: " + existingNotRentYet);
            if (existingNotRentYet == 0) {

                if (type == 1) {
                    this.selectedDream.existant = true;
                } else if (type == 2) {
                    this.selectedDream.is_rent = false;
                }
                this.selectedDream.config_data.is_disable_rental = true;
                $rootScope.utilService.scopeApply();
                if (angular.isUndefined(only_check) || !only_check) {
                    utilService.showWarningMessage(utilService.translate('You must own at least one existing property which is not rented out'));
                }
                return;

            }
        }
    }

    this.cancelHighlight = function () {
        $('.dream-item-class').addClass("red");
        $('.dream-item-class').removeClass("highlight-dream");
        $('.lifeevent-item-class').addClass("green");
        $('.lifeevent-item-class').removeClass("highlight-lifeevent");
    }

    this.dreamdeleted = function () {
        this.cancelHighlight();
        //$('#updateDreamPanel').hide();
        $rootScope.timelineService.hideActionPanel();
        item_selected_id = $rootScope.timelineService.item_selected_id;
        $rootScope.timelineService.ondeleted();
    }


    this.dreamDuplicate = function () {
        this.cancelHighlight();
        //$('#updateDreamPanel').hide();
        $rootScope.timelineService.hideActionPanel();
        item_selected_id = $rootScope.timelineService.item_selected_id;

        if (item_selected_id != 0) {
            var item = timeline.items[item_selected_id];
            if (item) {
                if (item && item.name == "dream") {
                    var result = $rootScope.PersonaPlan.dreams.filter(function (obj) {
                        return obj.id == item.data_id;
                    });
                    if (result.length > 0) {
                        this.OpenAddDreamDialog(result[0].dream_type_id, result[0].purchase_age, result[0]);
                    }
                }
                else if (item.name == "life_event") {
                    var result = $rootScope.PersonaPlan.lifeEvent.filter(function (obj) {
                        return obj.id == item.data_id;
                    });
                    if (result.length > 0) {
                        this.OpenAddLifeEventDialog(result[0].dream_type_id, result[0].starting_age, result[0]);
                    }
                }
            }
        }
    }
    this.openAddGroup = function () {
        var objsending = { datatype: 'openAddGroup', objecttype: 'openAddGroup', element: '.btn-triger' };
        $rootScope.SendingScreenSharingDataObject(objsending, 'click', 'openAddGroup', 'btn-triger');
    }

    this.getTotals = function () {
        var count = 0;
        for (var i = $rootScope.PersonaPlan.dreams.length - 1; i >= 0; i--) {
            if ($rootScope.PersonaPlan.dreams[i].existant == true) {
                count += 1;
            }
        }
        for (var i = $rootScope.PersonaPlan.lifeEvent.length - 1; i >= 0; i--) {
            if ($rootScope.PersonaPlan.lifeEvent[i].existant == true) {
                count += 1;
            }
        }
        return count;
    }

    this.exisingdreamdelete = function (item) {
        var existingNotRentYet = 0;
        angular.forEach($rootScope.PersonaPlan.dreams, function (dream) {

            if (dream.existant && !dream.is_rent && (dream.id != item.id)) {
                existingNotRentYet = existingNotRentYet + 1;
            }
        });
        if (existingNotRentYet == 0) {
            utilService.showWarningMessage(utilService.translate('You must own at least one existing property which is not rented out'));
            return;
        }
        var message = utilService.translate('Do you want to delete it?');
        var callbackOK = function () {
            if (item) {
                console.log(item);
                var type = null;
                /*var list = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.dream_id == item.id });
                if (list && list.length > 0) {
                    type = "life_event";
                } else type = "dream";
                */
                if (item.dream_type_id > 3) {
                    type = "life_event";
                } else {
                    type = "dream";
                }
                if (type == "dream") {
                    life_eventobj = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.dream_id == item.id });
                    if (life_eventobj && life_eventobj.length > 0) {
                        lvindex = $rootScope.PersonaPlan.lifeEvent.indexOf(life_eventobj[0]);
                        $rootScope.PersonaPlan.lifeEvent.splice(lvindex, 1);
                        $rootScope.planService.RemoveLifeEvent(life_eventobj[0].id);
                    }
                    dreamobj = $.grep($rootScope.PersonaPlan.dreams, function (e) {
                        return e.id == item.id
                    });
                    if (dreamobj && dreamobj.length > 0) {
                        dreamIndex = $rootScope.PersonaPlan.dreams.indexOf(dreamobj[0]);
                        $rootScope.PersonaPlan.dreams.splice(dreamIndex, 1);
                        $rootScope.illiquidAsset.RemoveSwiperDreams(dreamobj[0]);
                        $rootScope.planService.RemoveDream(dreamobj[0].id);
                    }
                }
                else if (type == "life_event") {
                    life_eventobj = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) {
                        return e.id == item.id
                    });
                    if (life_eventobj && life_eventobj.length > 0) {
                        lvindex = $rootScope.PersonaPlan.lifeEvent.indexOf(life_eventobj[0]);
                        $rootScope.PersonaPlan.lifeEvent.splice(lvindex, 1);
                        $rootScope.planService.RemoveLifeEvent(life_eventobj[0].id);
                    }

                }
                $rootScope.timelineService.renderTimeLine();
                $rootScope.actionService.calculateData();
            }
        };
        $timeout(function () { utilService.ShowDialog($rootScope, utilService.translate('Confirmation'), message, utilService.translate('Yes'), callbackOK, utilService.translate('No')) }, 1);

    },
    this.mangeSlide = function (input) {
        if (typeof (input) != undefined && input != null) {
            if (input == 'false') {
                $("#rental_net_income_panel").hide();
            } else {
                $("#rental_net_income_panel").show();
            }
            return;
        }
        if ($('#dream_rental_value').val() == 'false') {
            $("#rental_net_income_panel").hide();
        } else if ($('#dream_rental_value').val() == 'true') {
            $("#rental_net_income_panel").show();
        } else {
            $("#rental_net_income_panel").hide();
        }
    },

    this.initForm = function (formObj) {
        var self = this;
        $timeout(function () {
            self.form_dream = formObj.form_dream;
        }, 1000)
    },

    this.initFormLifeEvent = function (formObj) {
        var self = this;
        $timeout(function () {
            self.form_life_event = formObj.form_life_event;
        }, 1000)
    },

    this.openEditDreamDialog = function (id) {
        if ($rootScope.functionAccess.EDIT_DREAM == null || $rootScope.functionAccess.EDIT_DREAM == undefined || $rootScope.functionAccess.EDIT_DREAM == 0) {
            $rootScope.functionAccess.showDeniedMessage();
            return;
        }
        if (this.form_dream) {
            if (this.form_dream.modal_title) this.form_dream.modal_title.$dirty = false;
        }
        var list = $rootScope.PersonaPlan.dreams.filter(function (item) { return item.id == id; })
        if (list.length == 0) {
            return;
        } else {
            this.selectedDream = angular.copy(list[0]);
        }
        this.selectedDream.config_data = {
            is_edit: true
        };
        if ($rootScope.timelineService.selectedDream.dream_type_id == 1) {
            var end_age = angular.copy($rootScope.PersonaPlan.death_age);
            angular.forEach($rootScope.PersonaPlan.lifeEvent, function (lifeEvent) {
                if (angular.isDefined(lifeEvent.dream_id) && lifeEvent.dream_id == $rootScope.timelineService.selectedDream.id) {
                    end_age = angular.copy(lifeEvent.starting_age);
                }
            })
            this.selectedDream.config_data.ageRange = $rootScope.utilService.range($rootScope.PersonaPlan.start_age, end_age);
        }
        else {
            this.selectedDream.config_data.ageRange = $rootScope.utilService.range($rootScope.PersonaPlan.start_age, $rootScope.PersonaPlan.death_age);
        }
        if (this.selectedDream.dream_type_id == 1) {
            utilService.updateResidencePurchase(this.selectedDream, true);
            this.checkDreamRental(2, true);
        } else if (this.selectedDream.dream_type_id == 2) {
            utilService.updateEducation(this.selectedDream, true);
        }
        console.log(this.selectedDream);
        $rootScope.utilService.scopeApply();
        this.showDreamDialog();
        $rootScope.SendingScreenSharingDataObject(this.selectedDream, 'edit', 'open', 'dreamdialog');

    }

    this.initResidenceSaleYearRange = function () {
        var minYear = null;
        var isIgnoreFirstHouseExistingAndNotRent = false;
        angular.forEach($rootScope.PersonaPlan.dreams, function (item) {
            if (item.dream_type_id == 1) {
                if (item.existant && !item.is_rent) {
                    if (isIgnoreFirstHouseExistingAndNotRent) {
                        if (minYear == null) {
                            minYear = item.purchase_age;
                        } else {
                            minYear = Math.min(minYear, item.purchase_age);
                        }
                    } else {
                        isIgnoreFirstHouseExistingAndNotRent = true;
                    }
                } else {
                    if (minYear == null) {
                        minYear = item.purchase_age;
                    } else {
                        minYear = Math.min(minYear, item.purchase_age);
                    }
                }
            }
        });
        if (minYear == null) { minYear = $rootScope.PersonaPlan.start_age; }
        return $rootScope.utilService.range(minYear, $rootScope.PersonaPlan.death_age);
    }



    this.selectChildMemberInChildIndependent = function () {
        utilService.selectChildMemberInChildIndependent(this.selectedLifeEvent);
    }

    this.changeAgeDependent = function () {
        if (this.selectedLifeEvent.age_dependent == null) {
            this.selectedLifeEvent.starting_age = 200;
        } else {
            if (this.selectedLifeEvent.config_data.childMembers.length > 0) {
                var self = this;
                angular.forEach(this.selectedLifeEvent.config_data.childMembers, function (child) {
                    if (child.id == self.selectedLifeEvent.dependent_reference) {
                        self.selectedLifeEvent.starting_age = $rootScope.PersonaPlan.start_age + self.selectedLifeEvent.age_dependent - child.age;
                    }
                })
            }
        }
    }

    this.openEditLifeEventDialog = function (id) {
        if ($rootScope.functionAccess.EDIT_LIFE_EVENT == null || $rootScope.functionAccess.EDIT_LIFE_EVENT == undefined) {
            $rootScope.functionAccess.showDeniedMessage();
            return;
        }
        var self = this;
        if (this.form_life_event) {
            if (this.form_life_event.modal_title) this.form_life_event.modal_title.$dirty = false;
            if (this.form_life_event.selected_residence) this.form_life_event.selected_residence.$dirty = false;
        }

        var list = $rootScope.PersonaPlan.lifeEvent.filter(function (item) { return item.id == id; })
        if (list.length == 0) {
            return;
        } else {
            this.selectedLifeEvent = angular.copy(list[0]);
        }
        this.selectedLifeEvent.config_data = {
            is_edit: true
        };
        if (this.selectedLifeEvent.dream_type_id == 4) {
            this.selectedLifeEvent.selected_residence = this.selectedLifeEvent.dream_id;
            utilService.updateResidenceSale(this.selectedLifeEvent, true);
            this.selectedLifeEvent.config_data.ageRange = this.initResidenceSaleYearRange();
        } else if (this.selectedLifeEvent.dream_type_id == 5) {
            utilService.updateChildIndependent(this.selectedLifeEvent, true);
        } else if (this.selectedLifeEvent.dream_type_id == 6) {
            this.selectedLifeEvent.config_data.ageRange = utilService.range($rootScope.PersonaPlan.start_age, $rootScope.PersonaPlan.death_age);
        }

        $rootScope.utilService.scopeApply();
        $rootScope.SendingScreenSharingDataObject(this.selectedLifeEvent, 'edit', 'open', 'lifeeventdialog');
        this.showLifeEventDialog();


    }
    this.exisingdreamupdate = function (item) {
        if ($rootScope.PersonaPlan.dreams.length > 0) {
            for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
                if ($rootScope.PersonaPlan.dreams[i].id == item.id) {
                    $rootScope.timelineService.openEditDreamDialog(item.id);
                    return;
                }
            }
        }
        if ($rootScope.PersonaPlan.lifeEvent.length > 0) {
            for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
                if ($rootScope.PersonaPlan.lifeEvent[i].id == item.id) {
                    $rootScope.timelineService.openEditLifeEventDialog(item.id);
                    return;
                }
            }
        }
    },
    this.dreamupdated = function () {
        this.cancelHighlight();
        $rootScope.timelineService.hideActionPanel();
        //$('#updateDreamPanel').hide();
        $rootScope.ExisingDreamSelecting = null;
        var self = this;
        item_selected_id = $rootScope.timelineService.item_selected_id;
        if (angular.isDefined(item_selected_id) && item_selected_id != 0) {
            var item = timeline.items[item_selected_id];
            if (item && item.name == "dream") {
                $rootScope.timelineService.openEditDreamDialog(item.data_id);
            }
            else if (item && item.name == "life_event") {
                $rootScope.timelineService.openEditLifeEventDialog(item.data_id);
            }
        }
    }
    this.showActionPanelTimeout = null;
    this.showActionPanel = function () {
        $timeout.cancel(this.hideActionPanelTimeout);
        $timeout.cancel(this.showActionPanelTimeout);
        $timeout.cancel(this.hideActionPanelRemoveClassTimeout);
        this.showActionPanelTimeout = null;
        this.hideActionPanelTimeout = null;
        this.hideActionPanelRemoveClassTimeout = null;
        this.showActionPanelTimeout = null;
        this.hideActionPanelTimeout = null;
        $('#updateDreamPanel').hide();
        $('#updateDreamPanel').removeClass('open');
        this.showActionPanelTimeout = $timeout(function () {
            $timeout(function () {
                $('#updateDreamPanel').addClass('open');
            }, 200);
            $('#updateDreamPanel').show();
        }, 400);


    }
    this.hideActionPanelTimeout = null;
    this.hideActionPanelRemoveClassTimeout = null;
    this.hideActionPanel = function () {
        var self = this;
        $timeout.cancel(this.hideActionPanelTimeout);
        $timeout.cancel(this.showActionPanelTimeout);
        $timeout.cancel(this.hideActionPanelRemoveClassTimeout);
        this.showActionPanelTimeout = null;
        this.hideActionPanelTimeout = null;
        this.hideActionPanelRemoveClassTimeout = null;
        this.hideActionPanelTimeout = $timeout(function () {
            self.hideActionPanelRemoveClassTimeout = $timeout(function () {
                $('#updateDreamPanel').hide();
            }, 700);
            $('#updateDreamPanel').removeClass('open');
        }, 400);

    }
    this.onmouseclick = function () {
        var self = this;
        var item = timeline.items[item_selected_id];
        var obj = $(item.dom);
        $timeout(function () {
            if (isdoubleClick == false) {
                if (item_selected_id != 0) {
                    var item = timeline.items[item_selected_id];
                    $rootScope.ExisingDreamSelecting = null;
                    $rootScope.timelineService.item_selected_id = item_selected_id;
                    if (item && item.name == "dream") {
                        if ($rootScope.functionAccess.EDIT_DREAM == null || $rootScope.functionAccess.EDIT_DREAM == undefined) {
                            $rootScope.functionAccess.showDeniedMessage();
                            return;
                        }
                        $rootScope.timelineDropYear = -1;
                        $rootScope.isEditDream = true;
                        indexId = getIndexOfDataId($rootScope, 'dream', item.data_id);

                        var item = timeline.items[item_selected_id];
                        var leftDisplay = item.left - 8;
                        $('#updateDreamPanel').removeClass('show-right');
                        if (leftDisplay < 100) $('#updateDreamPanel').addClass('show-right');
                        $rootScope.timelineService.hideActionPanel();
                        //$('#updateDreamPanel').hide();
                        //$('#updateDreamPanel').removeClass('open');
                        $('#updateDreamPanel').css({ left: leftDisplay, top: item.top + 62 })
                        //$('#updateDreamPanel').show();
                        $rootScope.timelineService.showActionPanel();
                        $timeout(function () {
                            //$('#updateDreamPanel').addClass('open');
                        }, 300);

                        var result = $rootScope.PersonaPlan.dreams.filter(function (obj) {
                            return obj.id == item.data_id;
                        });
                        return;
                    }
                    else if (item && item.name == "life_event") {
                        if ($rootScope.functionAccess.EDIT_LIFE_EVENT == null || $rootScope.functionAccess.EDIT_LIFE_EVENT == undefined) {
                            $rootScope.functionAccess.showDeniedMessage();
                            return;
                        }
                        $rootScope.timelineDropYear = -1;
                        $rootScope.isEditDream = true;
                        indexId = getIndexOfDataId($rootScope, 'lifeevent', item.data_id);


                        var leftDisplay = item.left - 8;
                        $('#updateDreamPanel').removeClass('show-right');
                        if (leftDisplay < 100) $('#updateDreamPanel').addClass('show-right');
                        $rootScope.timelineService.hideActionPanel();
                        // $('#updateDreamPanel').hide();
                        //$('#updateDreamPanel').removeClass('open');
                        $('#updateDreamPanel').css({ left: leftDisplay, top: item.top + 62 })
                        //$('#updateDreamPanel').show();
                        $rootScope.timelineService.showActionPanel();
                        $timeout(function () {
                            //$('#updateDreamPanel').addClass('open');
                        }, 300);

                        var result = $rootScope.PersonaPlan.lifeEvent.filter(function (obj) {
                            return obj.id == item.data_id;
                        });
                        return;
                    }
                }
            }
        }, 500);
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
        $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan, 'delete', 'cancel', 'confirmdialog');
        $rootScope.timelineService.renderTimeLine();
        $rootScope.actionService.calculateData();
    }

    this.ondeletedCallback = function () {
        $rootScope.timelineService.hideActionPanel();
        //$('#updateDreamPanel').hide();
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
                        $rootScope.illiquidAsset.RemoveSwiperDreams(dreamobj[0]);
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
    this.ShowdialogConfirmChangeStartAge = function () {
        $timeout(function () {
            utilService.ShowDialog($rootScope, utilService.translate('Confirmation'), utilService.translate('Are you sure to change your age?') + " <br /> " + utilService.translate("You can't change your age after saving. Are you sure?"), utilService.translate('Yes'), $rootScope.timelineService.SaveChangeStartAge, utilService.translate('No'), $rootScope.timelineService.cancelChangeStartAge);
        }, 400);
    }
    this.cancelChangeStartAge = function () {
        $rootScope.timelineService.renderTimeLine();
    }
    this.SaveChangeStartAge = function () {
        $rootScope.profile.client.isChangedStartAge = true;
        $rootScope.PersonaPlan.start_age = $rootScope.form_start_age;
        $rootScope.zoomData.minAge = $rootScope.PersonaPlan.start_age;
        $rootScope.utilService.UpdatePurchaseAgeExistanceDream($rootScope);
        $rootScope.utilService.UpdateDreamLifeEventToExisting($rootScope, $rootScope.PersonaPlan.start_age);
        $rootScope.profileService.UpdateStartAge($rootScope.PersonaPlan.start_age);
        $rootScope.planService.updateStarAgeOfChildIndependent();
        utilService.scopeApply();
        $rootScope.timelineService.renderTimeLine();
        $rootScope.actionService.calculateData();
        $rootScope.actionService.updateData();
    }

    this.openEditItemOnTimeLine = function (item) {
        var self = this;
        if (item.name == "start_age") {
            if ($rootScope.profile.client.isChangedStartAge) {
                $timeout(function () {
                    utilService.showWarningMessage(utilService.translate("You can't change your age more!"));
                }, 1);
            } else {
                if ($rootScope.functionAccess.CHANGE_START_AGE == null || $rootScope.functionAccess.CHANGE_START_AGE == undefined) {
                    $rootScope.functionAccess.showErrorMessage();
                    this.dragging = false;
                    return;
                }
                $rootScope.MaxStartAge = Math.min(54, getMaxStartAge($rootScope));
                $rootScope.MinStartAge = 18;
                var currentStartAge = $rootScope.PersonaPlan.start_age;
                $rootScope.form_start_age = currentStartAge;
                $rootScope.SendingScreenSharingDataObject(item, 'edit', 'open', 'StartAgeDialog');
                $rootScope.listStartAge = $rootScope.utilService.range($rootScope.MinStartAge, $rootScope.MaxStartAge);
                $timeout(function () {
                    $('#StartAgeDialog').modal({ backdrop: 'static', keyboard: false });
                    $('#OkUpdateStartAge').bind('click', function () {
                        if ($rootScope.PersonaPlan.start_age != $rootScope.form_start_age) {
                            if (parseInt($rootScope.profile.client.isChangedStartAge) > parseInt($rootScope.MaxStartAge)) {
                                $timeout(function () {
                                    utilService.ShowDialog($rootScope, utilService.translate('Confirmation'), utilService.translate("All dreams and life events before {{age}} will be changed to existing. Do you want to save?", { age: $rootScope.form_start_age }), utilService.translate('Yes'),
                                      $rootScope.timelineService.ShowdialogConfirmChangeStartAge
                                        , utilService.translate('No'));
                                }, 1);
                            } else {
                                $rootScope.timelineService.ShowdialogConfirmChangeStartAge();
                            }

                            $rootScope.SendingScreenSharingDataObject(item, 'edit', 'ok', 'StartAgeDialog');
                        }
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
            }
            return;
        }
        else
            if (item.name == "retirement_age") {
                if ($rootScope.functionAccess.CHANGE_RETIREMENT_AGE == null || $rootScope.functionAccess.CHANGE_RETIREMENT_AGE == undefined) {
                    $rootScope.functionAccess.showErrorMessage();
                    this.dragging = false;
                    return;
                }
                var currentRetirementAge = $rootScope.PersonaPlan.retirement_age;
                $rootScope.form_retirement_age = currentRetirementAge;
                $rootScope.SendingScreenSharingDataObject(item, 'edit', 'open', 'RetirementAgeDialog');
                $rootScope.listRetirementAge = $rootScope.utilService.range($rootScope.PersonaPlan.start_age, $rootScope.PersonaPlan.death_age);
                $timeout(function () {
                    $('#RetirementAgeDialog').modal({ backdrop: 'static', keyboard: false });
                    $('#OkUpdateRetirementAge').bind('click', function () {
                        var isChangeRetirement = $rootScope.PersonaPlan.retirement_age != $rootScope.form_retirement_age;
                        if (isChangeRetirement) {
                            $rootScope.PersonaPlan.retirement_age = $rootScope.form_retirement_age;

                            $rootScope.timelineService.renderTimeLine();
                            $rootScope.actionService.calculateData();
                            $rootScope.actionService.updateData();
                            $rootScope.SendingScreenSharingDataObject(item, 'edit', 'ok', 'RetirementAgeDialog');
                        }
                        $('#cancelUpdateRetirementAge').unbind('click');
                        $('#OkUpdateRetirementAge').unbind('click');
                    });
                    $('#cancelUpdateRetirementAge').bind('click', function () {
                        $rootScope.PersonaPlan.retirement_age = currentRetirementAge;
                        $rootScope.SendingScreenSharingDataObject(item, 'edit', 'cancel', 'RetirementAgeDialog');
                        $('#cancelUpdateRetirementAge').unbind('click');
                        $('#OkUpdateRetirementAge').unbind('click');
                    });
                }, 50);
                return;
            }
            else if (item.name == "social_security_age") {
                if ($rootScope.functionAccess.CHANGE_RETIREMENT_AGE == null || $rootScope.functionAccess.CHANGE_RETIREMENT_AGE == undefined) {
                    $rootScope.functionAccess.showErrorMessage();
                    return;
                }
                if ($rootScope.functionAccess.CHANGE_RETIREMENT_AGE != 1) {
                    $rootScope.functionAccess.showErrorMessage();
                }
                var backupSocialSecurityAge = angular.copy($rootScope.PersonaPlan.social_security_age);
                $rootScope.MinSocialSecurityAge = $rootScope.PersonaPlan.retirement_age > 60 ? parseInt($rootScope.PersonaPlan.retirement_age) : 60;
                $rootScope.listSocialAge = $rootScope.utilService.range($rootScope.cashFlow.parameter.age_min_cpf_life, $rootScope.cashFlow.parameter.age_max_cpf_life);
                $timeout(function () {
                    $('#SocialSecurityStartAgeDialog').modal({ backdrop: 'static', keyboard: false });
                    $rootScope.SendingScreenSharingDataObject(item, 'edit', 'open', 'SocialSecurityStartAgeDialog');
                    $('#OkUpdateSocialSecurityAge').bind('click tap', function () {
                        var isChangeSSAge = $rootScope.PersonaPlan.social_security_age != backupSocialSecurityAge;
                        if (isChangeSSAge) {
                            $rootScope.timelineService.renderTimeLine();
                            $rootScope.actionService.calculateData();
                            $rootScope.actionService.updateData();
                            $rootScope.SendingScreenSharingDataObject(item, 'edit', 'ok', 'SocialSecurityStartAgeDialog');
                        }
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
            else if (item.name == "dream") {
                $rootScope.timelineService.openEditDreamDialog(item.data_id);
            }
            else if (item.name == "life_event") {
                $rootScope.timelineService.openEditLifeEventDialog(item.data_id);
                self.childMembersFilter();
                return;
            }
        return;
    }


    this.ondblclick = function (event) {
        var self = this;
        $rootScope.ExisingDreamSelecting = null;
        isdoubleClick = true;
        if (timeline.selection != undefined) {
            var indexId;
            var index = (timeline.selection && timeline.selection.index !== undefined) ? timeline.selection.index : -1;
            var item = (timeline.selection && timeline.selection.index !== undefined) ? timeline.items[index] : undefined;
            if (item == undefined)
                return;
            self.openEditItemOnTimeLine(item);
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
            "content": "<img class='timeline_item_pad' src='/Themes/" + version_id + "/Content/img/pin-circle-grey.png' /><span id='timeline_current_age_text'>" + utilService.translate("Current Age") + "</span>",
            "deleteable": false,
            "name": "start_age",
            'editable': true,
            "start_age": $rootScope.PersonaPlan.start_age
        });
        $rootScope.timelinedata.push({
            "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "content": "<img class='timeline_item_pad' src='/Themes/" + version_id + "/Content/img/pin-circle-grey.png' /><span id='timeline_retirement_age_text'>" + utilService.translate("Retirement Age") + "</span>",
            "deleteable": false,
            "name": "retirement_age"
        });
        $rootScope.timelinedata.push({
            "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "content": "<img class='timeline_item_pad' src='/Themes/" + version_id + "/Content/img/pin-circle-grey.png' /><span id='timeline_social_security_age_text'>" + utilService.translate("Social Annuity Age") + "</span>",
            "deleteable": false,
            "name": "social_security_age"

        });
        var img = null;
        var description = "";
        var generatedescription = "";
        for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
            if ($rootScope.PersonaPlan.dreams[i].existant != true) {
                if ($rootScope.PersonaPlan.dreams[i].photo_path == null || $rootScope.PersonaPlan.dreams[i].photo_path == undefined || $rootScope.PersonaPlan.dreams[i].photo_path == '') {
                    switch ($rootScope.PersonaPlan.dreams[i].dream_type_id) {
                        case 1:
                            img = "/Themes/" + version_id + "/Content/Images/default-residence.jpg";
                            break;
                        case 2:
                            img = "/Themes/" + version_id + "/Content/Images/default-education.jpg";
                            break;
                        default:
                            img = "/Themes/" + version_id + "/Content/Images/default-expenses.jpg";
                            break;
                    }

                }
                else {
                    img = $rootScope.PersonaPlan.dreams[i].photo_path;
                }
                switch ($rootScope.PersonaPlan.dreams[i].dream_type_id) {
                    case 1:
                        var rd_type = $rootScope.residentialType.filter(function (item) { return item.id == $rootScope.PersonaPlan.dreams[i].residential_type; })
                        if (rd_type && rd_type.length > 0) {
                            description = rd_type[0].name;
                        }
                        generatedescription = "<div class='timeline_item_description'><img class='img' src='"
                                + img + "'><div>" + description;

                        generatedescription += "<br><span>" + utilService.translate("Property Value") + ": " + $rootScope.PersonaPlan.currency_code + " " + $filter('number')($rootScope.PersonaPlan.dreams[i].total_cost, 0) + "</span>";
                        generatedescription += "</div></div>";
                        break;
                    case 2:
                        var fm_member = $rootScope.familyMembers.filter(function (item) { return item.id == $rootScope.PersonaPlan.dreams[i].dependent_reference; });
                        if (fm_member && fm_member.length > 0) {
                            description = utilService.translate("Family Member") + ": " + fm_member[0].name;
                            generatedescription = "<div class='timeline_item_description'><img class='img' src='"
                                + img + "'><div>" + description;
                        }
                        generatedescription += "<br><span>" + utilService.translate("Annual Cost") + ": " + $rootScope.PersonaPlan.currency_code + " " + $filter('number')($rootScope.PersonaPlan.dreams[i].total_cost, 0) + "</span>";
                        generatedescription += "</div></div>";
                        break;
                    case 3:
                        description = utilService.translate("Total Cost") + ": " + $rootScope.PersonaPlan.currency_code + " " + $filter('number')($rootScope.PersonaPlan.dreams[i].total_cost, 0);
                        generatedescription = "<div class='timeline_item_description'><img class='img' src='"
                                + img + "'><div>" + utilService.translate("Exceptional expenses") + "<br><span>" + description + "</span>";
                        generatedescription += "</div></div>";
                        break;
                    default:
                        generatedescription = "";
                        break;
                }
                $rootScope.timelinedata.push({
                    "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.dreams[i].purchase_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
                    "content": "<div><img class='timeline_item_pad' src='/Themes/" + version_id + "/Content/img/pin-circle.png' /><span>" + $rootScope.PersonaPlan.dreams[i].name + "</span>"
                        + generatedescription + "</div>",
                    "deleteable": true,
                    "name": "dream",
                    "data_id": $rootScope.PersonaPlan.dreams[i].id
                });
            }
        }
        for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
            if ($rootScope.PersonaPlan.lifeEvent[i].existant != true) {
                if ($rootScope.PersonaPlan.lifeEvent[i].photo_path == null || $rootScope.PersonaPlan.lifeEvent[i].photo_path == undefined || $rootScope.PersonaPlan.lifeEvent[i].photo_path == '') {
                    switch ($rootScope.PersonaPlan.lifeEvent[i].dream_type_id) {
                        case 4:
                            img = "/Themes/" + version_id + "/Content/Images/default-residence.jpg";
                            break;
                        case 5:
                            img = "/Themes/" + version_id + "/Content/Images/default-independent.jpg";
                            break;
                        default:
                            img = "/Themes/" + version_id + "/Content/Images/default-income.jpg";
                            break;
                    }
                }
                else {
                    img = $rootScope.PersonaPlan.lifeEvent[i].photo_path;
                }
                switch ($rootScope.PersonaPlan.lifeEvent[i].dream_type_id) {
                    case 4:
                        generatedescription = "<div class='timeline_item_description'><img class='img' src='"
                                + img + "'><div>" + description;
                        var dream_id = $rootScope.PersonaPlan.lifeEvent[i].dream_id;
                        if (dream_id > 0) {
                            var dream = $rootScope.PersonaPlan.dreams.filter(function (item) { return item.id == dream_id; });
                            var rd_type = $rootScope.residentialType.filter(function (item) { return item.id == dream[0].residential_type; })
                            console.log($rootScope.residentialType, rd_type);
                            if (rd_type && rd_type.length > 0) {
                                description = rd_type[0].name;
                            }
                            generatedescription = "<div class='timeline_item_description'><img class='img' src='"
                                + img + "'><div>" + description;
                        }
                        generatedescription += "<br><span>" + utilService.translate("Property Value") + ": " + $rootScope.PersonaPlan.currency_code + " " + $filter('number')($rootScope.PersonaPlan.lifeEvent[i].value, 0) + "</span>";
                        generatedescription += "</div></div>";
                        break;
                    case 5:
                        var childrens = angular.copy($rootScope.profile.children.childrens);
                        var childList = childrens.filter(function (child, index) {
                            child.index = index;
                            return $rootScope.PersonaPlan.lifeEvent[i].dependent_reference == 'child_' + child.id;
                        });

                        if (childList.length > 0) {
                            var childObj = childList[0];
                            var age_dependent = $rootScope.PersonaPlan.lifeEvent[i].starting_age - $rootScope.PersonaPlan.start_age + childObj.age;
                            var childName = childList[0].name == null ? ('child' + ' ' + (childList[0].index + 1)) : childList[0].name;
                            description = utilService.translate('Child') + ": " + childName;
                            generatedescription = "<div class='timeline_item_description'><img class='img' src='"
                                + img + "'><div>" + description + "<br><span>"
                                + utilService.translate("Age of independence") + ":</span><span class='age_dependent'>" + age_dependent + "</span></div></div>";
                        }
                        break;
                    case 6:
                        description = utilService.translate("Total Cost") + ": " + $rootScope.PersonaPlan.currency_code + " " + $filter('number')($rootScope.PersonaPlan.lifeEvent[i].value, 0);
                        generatedescription = "<div class='timeline_item_description'><img class='img' src='"
                                + img + "'><div>" + utilService.translate("Exceptional Income") + "<br><span>" + description + "</span>";
                        generatedescription += "</div></div>";
                        break;
                    default:
                        generatedescription = "";
                        break;
                }
                $rootScope.timelinedata.push({
                    "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.lifeEvent[i].starting_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
                    "content": "<div><img class='timeline_item_pad' src='/Themes/" + version_id + "/Content/img/pin-circle.png' /><span>" + $rootScope.PersonaPlan.lifeEvent[i].name + "</span>"
                        + generatedescription + "</div>",
                    "deleteable": true,
                    "name": "life_event",
                    "data_id": $rootScope.PersonaPlan.lifeEvent[i].id,
                    "dream_id": $rootScope.PersonaPlan.lifeEvent[i].dream_id
                });
            }
        }
        var brokenAge = new Date(new Date().getFullYear() + 200, 0, 1);
        if (angular.isDefined($rootScope.MainResult)) {
            brokenAge = new Date(new Date().getFullYear() + $rootScope.MainResult.broken_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1);
        }
        $rootScope.timelinedata.push({
            //"start": new Date(new Date().getFullYear() + $rootScope.MainResult.broken_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "start": brokenAge,
            "content": "broken Age",
            "deleteable": false,
            "editable": false,
            "selectable": false,
            "className": 'hidden',
            "name": "broken_age",
            "type": 'floatingRange'
        });
    }

    this.timelineChartTimeout = null;

    this.renderTimeLine = function (isNeedResize) {
        //console.log('this.renderTimeLine');
        /*if (!$rootScope.profile.client.isChangedStartAge) {
            if (cashFlow.parameter != null)
                $rootScope.PersonaPlan.start_age = parseInt(cashFlow.parameter._c_age_main);
            else $rootScope.PersonaPlan.start_age = parseInt($rootScope.profile.client.age);
        }*/
        var steps = $rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age;
        $rootScope.options = {
            'width': '100%',
            'renderBrokentext': true,
            'height': '480px',
            'heightBroken': '480px',
            'editable': true,
            'showCurrentTime': false,
            'showMajorLabels': false,
            'zoomable': false,
            'moveable': false,
            'style': 'box',
            'box': { align: 'left' },
            'cluster': false,
            'clusterMaxItems': 3,
            'eventMargin': 10,  // minimal margin between events
            'minHeight': 10,
            'eventMarginAxis': 50,
            'zoomMin': 60 * 60 * 24 * 365 * 1000,     // milliseconds
            'zoomMax': 60 * 60 * 24 * 365 * 1000 * 1000,  // milliseconds				
            "min": new Date(new Date().getFullYear() - 1, 1, 1),                // lower limit of visible range
            "max": new Date(new Date().getFullYear() + steps + 1, 0, 0)                // upper limit of visible range

        };
        $rootScope.totalExisting = this.getTotals();
        $rootScope.timelineMessage = '';

        $rootScope.timelineService.initDataForTimeLine();

        $rootScope.MaxStartAge = getMaxStartAge($rootScope);
        $rootScope.MinStartAge = 18;
        $rootScope.MinSocialSecurityAge = $rootScope.PersonaPlan.retirement_age > 60 ? parseInt($rootScope.PersonaPlan.retirement_age) : 60;
        timeline = new links.Timeline(document.getElementById('timeline-canvas'), $rootScope.options);
        timeline.setScale(links.Timeline.StepDate.SCALE.YEAR, 1);
        timeline.draw($rootScope.timelinedata);
        links.events.addListener(timeline, 'change', $rootScope.timelineService.onchange);
        links.events.addListener(timeline, 'changed', $rootScope.timelineService.onchanged);
        links.events.addListener(timeline, 'delete', $rootScope.timelineService.ondeleted);
        links.events.addListener(timeline, 'mouseclick', $rootScope.timelineService.onmouseclick);
        links.events.addListener(timeline, 'mousedownclick', $rootScope.timelineService.onmousedownclick);
        links.events.addListener(timeline, 'mouseupclick', $rootScope.timelineService.onmouseupclick);

        //
        $rootScope.timeline = timeline;
        if ($rootScope.setVisibleRangeOfTimeLine) {
            $rootScope.setVisibleRangeOfTimeLine();
        }
        timeline.onDblClick = function (event) {
            $rootScope.timelineService.ondblclick(event);
        };
        if ($('.timeline-broken-text')) {
            $('.timeline-broken-text').html($rootScope.utilService.translate("BROKE"));
        }
        $('.dropdown-totalexisting').html($rootScope.totalExisting + ' ' + utilService.translate('Existing') + '<i class="mdi-navigation-arrow-drop-down right"></i>');
        if ($rootScope.smallTimelineService) {
            $rootScope.smallTimelineService.renderTimeLine();
        }
        this.initChartOnTimeLine(timelineChartData);
        var self = this;
        //   timelineChart = null;
        $timeout.cancel(this.timelineChartTimeout);
        this.timelineChartTimeout = $timeout(function () {
            if (timelineChartData != null) {
                self.initChartOnTimeLine(timelineChartData);
            }
        }, 0);
        //this.initChartOnTimeLine(timelineChartData);
        //if (timelineChartData == null) {
        //    console.log('have timelineChartData');
        //    this.initChartOnTimeLine(timelineChartData);
        //    //timelineChart = null;
        //    //var self = this;
        //    //timelineChart = null;
        //    //$timeout.cancel(this.timelineChartTimeout);
        //    //this.timelineChartTimeout = $timeout(function () {
        //    //    self.initChartOnTimeLine(timelineChartData);
        //    //}, 500);
        //}  
    }
    var timelineChart = null;
    var timelineChartData = null;
    var maxValueDisplayChart = 0;
    $rootScope.timelineChartOriginalData = null;
    this.initChartOnTimeLine = function (chartData) {
        //console.log('Init chart timelineChart');
        timelineChart = AmCharts.makeChart("timeline-canvas-timeline-chart",
				{
				    "type": "serial",
				    "theme": "light",
				    "categoryField": "year",
				    "zoomOutText": "",
				    //"startEffect": "elastic",
				    //"startDuration": 1,
				    //"processCount"  :10,
				    //"processTimeout": 100,
				    "autoTransform": false,
				    "zoomOutOnDataUpdate": false,
				    "legend": {
				        //"fontSize": 10,
				        //"equalWidths": true,
				        "position": "top",
				        "align": "right",
				        "valueText": "",
				        "markerBorderThickness": 2,
				        "markerType": "line",
				        //"markerSize": "4",
				        "color": "#ffffff",
				        "divId": "timeline-canvas-timeline-legend",
				        "data":
                            [{ title: utilService.translate("Wealth Evolution"), color: "#ffffff", backgroundColor: "#ffffff" }]
                    ,

				    },
				    "graphs": [
						{
						    "id": "line-chart",
						    "type": "smoothedLine",
						    "valueField": "value",

						    //"lineAlpha": 1, 
						    //"bullet": "round",
						    //"bulletSize": 3,
						    "bulletColorField": "bulletcolor",
						    "lineThickness": 2,
						    "lineColorField": "bulletcolor",
						    //"fillAlphas": 1,
						    //"lineAlpha": 1

						    //"balloonText": utilService.translate("Wealth evolution") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
						}

				    ],

				    "valueAxes": [{
				        "axisAlpha": 0,
				        "gridAlpha": 0,
				        "position": "right",
				        //"stackType": "regular",
				        "labelsEnabled": false
				        //"autoGridCount": false,
				        //"gridCount": 100,
				        //"labelFrequency": 100,
				        //"minimum": 0,
				        //"maximum": 1000
				    }],
				    "categoryAxis": {
				        //"startOnAxis": true,
				        "axisAlpha": 0,
				        "gridAlpha": 0,
				        "labelsEnabled": false
				    },
				    "dataProvider": chartData
				});
    },
    this.updateDataProviderForChartOnTimeLine = function (chartData) {
        var data = [];
        if (angular.isDefined(chartData)) {
            for (var i = 0; i < chartData.length; i++) {
                if (chartData[i] == 0) {
                    if ($rootScope.timelineChartOriginalData != null && $rootScope.timelineChartOriginalData[i] != null) {
                        data[i] = $rootScope.timelineChartOriginalData[i];
                        data[i].bulletcolor = "#424949";
                    } else {
                        data[i] = {
                            year: i + $rootScope.PersonaPlan.start_age,
                            value: 0,
                            bulletcolor: "#ffffff"
                        };
                    }
                } else
                    if (chartData[i] >= 0) {
                        data[i] = {
                            year: i + $rootScope.PersonaPlan.start_age,
                            value: chartData[i] * 1000,
                            bulletcolor: "#ffffff"
                        };
                    }
                    else {
                        data[i] = {
                            year: i + $rootScope.PersonaPlan.start_age,
                            value: -1,
                            bulletcolor: "#CC0000"
                        };
                    }
            }
        } else {
            data = [];
            for (var i = $rootScope.PersonaPlan.start_age; i < $rootScope.PersonaPlan.death_age  ; i++) {
                data[i] = {
                    year: i + $rootScope.PersonaPlan.start_age,
                    value: 0,
                    bulletcolor: "#ffffff"
                };
            }
        }
        return data;
    },
    this.updateChartOnTimeline = function (chartData, isNeedScale) {
        if (timelineChart == null) {
            timelineChartData = this.updateDataProviderForChartOnTimeLine(chartData);
            this.initChartOnTimeLine(chartData);
        }
        timelineChartData = this.updateDataProviderForChartOnTimeLine(chartData);
        if (maxValueDisplayChart != 0) {
            timelineChart.valueAxes[0].maximum = maxValueDisplayChart;
        }
        timelineChart.dataProvider = timelineChartData;
        timelineChart.validateData();
    }
    this.zoomTimelineChart = function () {
        if (timelineChart != null) {
            var zoomStartIndex = $rootScope.zoomData.minAge - $rootScope.zoomData.min;
            var zoomEndIndex = zoomStartIndex + $rootScope.zoomData.maxAge - $rootScope.zoomData.minAge;
            timelineChart.zoomToIndexes(zoomStartIndex, zoomEndIndex);
        }
    },
    this.updateFinishChartOnTimeline = function (chartData) {
        maxValueDisplayChart = 0;
        for (var i = 0; i < chartData.length; i++) {
            if (chartData[i] != 'NaN' && chartData[i] * 1000 > maxValueDisplayChart)
                maxValueDisplayChart = chartData[i] * 1000;
        }
        this.updateChartOnTimeline(chartData);
        $rootScope.timelineChartOriginalData = this.updateDataProviderForChartOnTimeLine(chartData);
    }
    this.setColorForChartOnTimeLine = function () {
        if ($rootScope.timelineChartOriginalData != null) {
            for (var i = 0; i < $rootScope.timelineChartOriginalData.length; i++) {
                $rootScope.timelineChartOriginalData[i].bulletcolor = "#424949";
            }
            try {
                if (timelineChart != null && timelineChart.dataProvider != null) {
                    timelineChart.dataProvider = $rootScope.timelineChartOriginalData;
                    timelineChart.validateData();
                }
            } catch (e) {
                console.log('exception : ', e);
            }
        }
    }
    this.changeBeforeCalculationOnTimeline = function () {
        this.setColorForChartOnTimeLine();
    }
    this.renderBrokenAge = function () {
        if (angular.isUndefined($rootScope.MainResult) || $rootScope.MainResult.broken_age == null) {
            return;
        }
        if ($rootScope.old_broken_age == null || $rootScope.old_broken_age == undefined)
            $rootScope.old_broken_age = $rootScope.MainResult.broken_age;
        if ($rootScope.old_broken_age >= $rootScope.PersonaPlan.death_age && $rootScope.MainResult.broken_age <= $rootScope.PersonaPlan.death_age) {
            if ($rootScope.isFirstLastPLayback != true) {
                $rootScope.utilService.updateHeaderMessage({ message: utilService.translate('You will be short of cash when you are broken_age year-old', { broken_age: $rootScope.MainResult.broken_age }), jsonObj: null }, 2);
            }
            else {
                $rootScope.isFirstLastPLayback = false;
            }
            $rootScope.old_broken_age = angular.copy($rootScope.MainResult.broken_age);
        }
        else if ($rootScope.old_broken_age <= $rootScope.PersonaPlan.death_age && $rootScope.MainResult.broken_age > $rootScope.PersonaPlan.death_age) {
            if ($rootScope.isFirstLastPLayback != true) {
                $rootScope.utilService.updateHeaderMessage({ message: utilService.translate('All your goals are achievable'), jsonObj: null }, 2);
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
                $('.timeline-broken-div').stop();
                $('.timeline-broken-div').animate({ width: timeline.dom.content.offsetWidth - broken_left }, 1000);
            }
            else {
                $('.timeline-broken-div').stop();
                $('.timeline-broken-div').animate({ width: timeline.dom.content.offsetWidth - broken_left }, 0);
            }
        }
        else {
            if (timeline.eventParams.moved == true) {
                $('.timeline-broken-div').stop();
                $('.timeline-broken-div').animate({ width: 0 }, 1000);
            }
            else {
                $('.timeline-broken-div').stop();
                $('.timeline-broken-div').animate({ width: 0 }, 0);
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
        var title = utilService.translate('Reset Plan');
        $timeout(function () { utilService.ShowDialog($rootScope, title, message, utilService.translate('Yes'), $rootScope.timelineService.ResetPlanCallback, utilService.translate('No'), $rootScope.timelineService.ResetPlanCancelCallback) }, 1);
    }
    this.ResetPlanCallback = function () {
        $rootScope.planService.resetPersonalPlanWithCashFlow($rootScope.PersonaPlan.user_id, $rootScope.cashFlow.parameter._c_retirement_main, $rootScope.cashFlow.parameter.age_payout_main, $rootScope.PersonaPlan.status, $rootScope.timelineService.ResetPlanSuccess);
        $rootScope.illiquidAsset.resetAllSwiper();
    }
    this.ResetPlanCancelCallback = function () {
        $rootScope.SendingScreenSharingDataObject('', 'resetplan', 'cancel', 'confirmdialog');
    }
    this.ResetPlanSuccess = function (obj) {
        if (obj.plan == null) {
            utilService.showErrorMessage(utilService.translate('There is error when reset plan'));

        } else {
            var income_today = angular.copy($rootScope.PersonaPlan.income_today);
            var expense_today = angular.copy($rootScope.PersonaPlan.expense_today);
            var saving_today = angular.copy($rootScope.PersonaPlan.saving_today);
            $rootScope.planService.updateAgeDependentOfChildIndependent(obj.plan);
            $rootScope.PersonaPlan = obj.plan;
            $rootScope.PersonaPlan.income_today = income_today;
            $rootScope.PersonaPlan.expense_today = expense_today;
            $rootScope.PersonaPlan.saving_today = saving_today;
            $rootScope.investment.resetPlan();
            if (angular.isDefined($rootScope.savingRate)) {
                $rootScope.savingRate.resetCashflow();
                $rootScope.savingRate.UpdateChangeCard('PersonaPlan.income_today');
            }
            $rootScope.SendingScreenSharingDataObject(obj, 'resetplan', 'ok', 'confirmdialog');
            personalPlanService.updateConvertDataOfPersonalPlan();
            $rootScope.zoomData.minAge = $rootScope.PersonaPlan.start_age;
            $rootScope.illiquidAsset.InitSwiperDreams();
            $rootScope.timelineService.renderTimeLine();

            $rootScope.selectedretirementLife = null;
            for (var i = 0 ; i < $rootScope.retirementLife.length; i++) {
                if ($rootScope.retirementLife[i].value == $rootScope.PersonaPlan.expense_at_retirement) {
                    $rootScope.selectedretirementLife = $rootScope.retirementLife[i];
                    break;
                }
            };
            if ($rootScope.PersonaPlan.status == 0)
                utilService.showSuccessMessage(utilService.translate('Current plan has been reset.'));
            else if ($rootScope.PersonaPlan.status == 1)
                utilService.showSuccessMessage(utilService.translate('Resetted new plan'));

            $timeout(function () {
                if (angular.isDefined($rootScope.savingRate)) {
                    $rootScope.savingRate.updateYearlyCostReduction();
                }
            }, 3000);
        }

    }
    this.changeTextOfTimeline = function () {
        $('#timeline_spouse_age_text').html(utilService.translate('Spouse Retirement Age'));
        $('#timeline_social_security_age_text').html(utilService.translate('Social Annuity Age'));
        $('#timeline_retirement_age_text').html(utilService.translate('Retirement Age'));
        $('#timeline_current_age_text').html(utilService.translate('Current Age'));
        if ($('#timeline-broken-text')) {
            $('#timeline-broken-text').html($rootScope.utilService.translate("BROKE"));
        }
        $rootScope.translateText = {
            years: $rootScope.utilService.translate('years')
        }
    }

    this.removeSpouseRetirementIcon = function () {
        $rootScope.timelineService.renderTimeLine();

    }

    this.addSpouseRetirementIcon = function (year) {
        $rootScope.timelineService.renderTimeLine();
    }
    this.DuplicateDreamDialog = function (id, data_id) {
        $rootScope.selectedDreamOrLifeEvent = null;
        $rootScope.ExisingDreamSelecting = null;

        $rootScope.SendingScreenSharingDataObject($rootScope.familyMembers, 'familyMembers', 'familyMembers', '');
        $rootScope.SendingScreenSharingDataObject($rootScope.childMembers, 'childMembers', 'childMembers', '');
        utilService.updateDefaultValueOfDream($rootScope);
        $rootScope.isEditDream = false;
        $rootScope.tempPhotoContent = null;
        var year = $rootScope.PersonaPlan.start_age;
        $rootScope.timelineDropYear = $rootScope.PersonaPlan.start_age;
        utilService.updateSelectedDreamType('dream');
        $rootScope.ChangeSelectListDreamType(id, 'dream');
        var objsending = { datatype: '', objecttype: '', year: $rootScope.timelineDropYear, id: id };
        $rootScope.selectedDream.photo_path = null;
        $rootScope.selectedDream.residential_type = 0;

        var indexId = getIndexOfDataId($rootScope, 'dream', data_id);
        bindDreamtoModalDialogForDuplicate($rootScope, indexId);
        if (id == 1) {
            this.changeResidentialType($rootScope.PersonaPlan.dreams[indexId].residential_type);
        }

        var objsending = { datatype: '', objecttype: '', year: $rootScope.timelineDropYear };
        $timeout(function () {
            $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
            $rootScope.timelineService.mangeSlide();
            objsending.datatype = 'dream';
            objsending.objecttype = 'dream';
            //   $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'open', 'dreamdialog');
            $('#SaveDream').bind('click', function () {
                $timeout(function () {
                    bindToSelectedDream($rootScope, year);
                    $rootScope.selectedDream.photoContent = $rootScope.tempPhotoContent;
                    $rootScope.planService.AddDream($rootScope.selectedDream);
                    if ($rootScope.selectedDream.id != -1) {
                        $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length] = angular.copy($rootScope.selectedDream);
                        utilService.scopeApply();
                        $rootScope.illiquidAsset.AddSwiperDreams($rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length - 1]);
                        $rootScope.timelineService.renderTimeLine();
                        $rootScope.actionService.calculateData();
                    }
                    $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'ok', 'dreamdialog');
                    $('#SaveDream').unbind('click');
                    $('#CancelSaveDream').unbind('click');
                }, 100);
            });
            $('#CancelSaveDream').bind('click', function () {
                $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'cancel', 'dreamdialog');
                $('#SaveDream').unbind('click');
                $('#CancelSaveDream').unbind('click');
            });
        }, 500);
        this.validateShowDreamRental();
    }

    this.DuplicateLifeEventDialog = function (id, data_id) {
        $rootScope.selectedDreamOrLifeEvent = null;
        $rootScope.ExisingDreamSelecting = null;
        var self = this;
        var idCount = $filter('filter')($rootScope.PersonaPlan.lifeEvent, { dream_type_id: 5 }).length;
        if (id == 5 && idCount >= 4) {
            utilService.showWarningMessage(utilService.translate("You can't create more 4 childrens !"));
            return;
        }
        utilService.updateDefaultValueOfDream($rootScope);
        $rootScope.isEditDream = false;
        var year = $rootScope.PersonaPlan.start_age;
        $rootScope.timelineDropYear = $rootScope.PersonaPlan.start_age;
        utilService.updateSelectedDreamType('life_event');
        $rootScope.ChangeSelectListDreamType(id, 'lifeevent');
        $rootScope.selectedLifeEvent.existant = false;
        $rootScope.tempPhotoContent = null;
        $rootScope.selectedLifeEvent.photo_path = null;
        if (id == 5) {
            self.childMembersFilter();

            if (!angular.isUndefined($rootScope.childMembersFilter[0]) && $rootScope.childMembersFilter[0].id != 'other') {
                var child = $rootScope.childMembersFilter[0];
                var c_ind_child = null;
                angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
                    if (item.field_name == 'starting_age') {
                        if (child.name != 'other') {

                            if (child.index == 1)
                                c_ind_child = $rootScope.cashFlow.parameter._c_ind_child_1;
                            else if (child.index == 2)
                                c_ind_child = $rootScope.cashFlow.parameter._c_ind_child_2;
                            else if (child.index == 3)
                                c_ind_child = $rootScope.cashFlow.parameter._c_ind_child_3;
                            else if (child.index == 4)
                                c_ind_child = $rootScope.cashFlow.parameter._c_ind_child_4;
                            item.value = $rootScope.PersonaPlan.start_age + c_ind_child - child.age;
                        }
                    }
                    else if (item.field_name == 'name') {
                        if (child.id != 'other') {
                            item.value = child.name + ' independent';
                        }
                    }
                    else if (item.field_name == 'dependent_reference') {
                        item.value = child.id;
                    }
                });
                angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
                    if (item.field_name == 'age_dependent') {
                        item.value = c_ind_child;
                    } else if (item.field_name == 'yearly_cost_reduction') {
                        item.value = utilService.calculateExpenseOfChild(child.index) * 12;
                    }
                });
            }

            else {
                angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
                    if (item.field_name == 'starting_age') {
                        item.value = 200;
                    }
                    else if (item.field_name == 'yearly_cost_reduction') {
                        item.value = 0;
                    }
                    else if (item.field_name == 'age_dependent') {
                        item.value = null;
                    }
                });

            }
        }

        var indexId = getIndexOfDataId($rootScope, 'lifeevent', data_id);
        bindLifeEventtoModalDialogForDuplicate($rootScope, indexId);

        if (id == 5) {
            self.childMembersFilter();

            if (!angular.isUndefined($rootScope.childMembersFilter[0]) && $rootScope.childMembersFilter[0].id != 'other') {
                var child = $rootScope.childMembersFilter[0];
                var c_ind_child = null;
                angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
                    if (item.field_name == 'starting_age') {
                        if (child.name != 'other') {

                            if (child.index == 1)
                                c_ind_child = $rootScope.cashFlow.parameter._c_ind_child_1;
                            else if (child.index == 2)
                                c_ind_child = $rootScope.cashFlow.parameter._c_ind_child_2;
                            else if (child.index == 3)
                                c_ind_child = $rootScope.cashFlow.parameter._c_ind_child_3;
                            else if (child.index == 4)
                                c_ind_child = $rootScope.cashFlow.parameter._c_ind_child_4;
                            item.value = $rootScope.PersonaPlan.start_age + c_ind_child - child.age;
                        }
                    }
                    else if (item.field_name == 'name') {
                        if (child.id != 'other') {
                            item.value = child.name + ' independent';
                        }
                    }
                    else if (item.field_name == 'dependent_reference') {
                        item.value = child.id;
                    }
                });
                angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
                    if (item.field_name == 'age_dependent') {
                        item.value = c_ind_child;
                    } else if (item.field_name == 'yearly_cost_reduction') {
                        item.value = utilService.calculateExpenseOfChild(child.index) * 12;
                    }
                });
            }

            else {
                angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
                    if (item.field_name == 'starting_age') {
                        item.value = 200;
                    }
                    else if (item.field_name == 'yearly_cost_reduction') {
                        item.value = 0;
                    }
                    else if (item.field_name == 'age_dependent') {
                        item.value = null;
                    }
                });

            }
        }

        var objsending = { datatype: '', objecttype: '', year: $rootScope.timelineDropYear, id: id };
        $timeout(function () {
            $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false })
            objsending.datatype = 'lifeevent';
            objsending.objecttype = 'life_event';
            $('#SaveLifeEvent').bind('click', function () {
                $timeout(function () {
                    bindToSelectedLifeEvent($rootScope, year);
                    $rootScope.selectedLifeEvent.photoContent = $rootScope.tempPhotoContent;
                    $rootScope.planService.AddLifeEvent($rootScope.selectedLifeEvent);
                    if ($rootScope.selectedLifeEvent.id != -1) {
                        $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length] = angular.copy($rootScope.selectedLifeEvent);
                        $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'ok', 'lifeeventdialog');
                        $rootScope.timelineService.renderTimeLine();
                        $rootScope.actionService.calculateData();
                    }
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
    this.SelectedResidentValid = function () {
        var existingNotRentYet = 0;
        angular.forEach($rootScope.PersonaPlan.dreams, function (dream) {

            if (dream.existant && !dream.is_rent && (dream.id != $rootScope.timelineService.selectedDream.id)) {
                existingNotRentYet = existingNotRentYet + 1;
            }
        });

        if (existingNotRentYet == 0) {
            if (!$rootScope.timelineService.selectedDream.existant) {
                $rootScope.timelineService.selectedDream.existant = true;
                $rootScope.utilService.scopeApply();
                utilService.showWarningMessage(utilService.translate('You must own at least one existing property which is not rented out'));
                return;
            }
        }
    }
    this.updateConfigdata = function () {
        for (var i = 0; i < $rootScope.DreamTypes.length; i++) {
            if ($rootScope.timelineService.selectedDream.dream_type_id == $rootScope.DreamTypes[i].id) {
                $rootScope.timelineService.selectedDream.config_data.dream_type_name
                self.form_dream.dream_type_name = $rootScope.DreamTypes[i].dream_name;
                angular.forEach(rootScope.DreamTypes[i].dreamTypeConfig, function (config) {
                    self.form_dream.display[config.field_name] = config.description;
                    self.form_dream.display[config.field_name + '_existant'] = config.description_existant;
                });
                break;
            }
        }
    }
    this.changePaymentDuration = function () {
        if ($rootScope.timelineService.selectedDream.payment_duration == 0)
            $rootScope.timelineService.selectedDream.down_payment = 0;
        else {
            for (var i = 0; i < $rootScope.DreamTypes.length; i++) {
                if ($rootScope.timelineService.selectedDream.dream_type_id == $rootScope.DreamTypes[i].id) {
                    var config = $.grep($rootScope.DreamTypes[i].dreamTypeConfig, function (item) { return item.field_name == 'down_payment'; });
                    if (config && config.length > 0) {
                        $rootScope.timelineService.selectedDream.down_payment = parseFloat(config[0].default_value);
                    }
                }
            }
        }
    }
    this.OpenAddDreamDialog = function (id, dropYear, defaultData) {
        this.selectedDream = null;

        if (angular.isDefined(defaultData)) {
            this.selectedDream = angular.copy(defaultData);
            //this.selectedDream.name += ' ';
            if (angular.isDefined(this.selectedDream)) {
                this.selectedDream.config_data = {};
            }
            this.selectedDream.config_data.is_edit = false;
            this.selectedDream.config_data.is_duplicate = true;
        } else {
            this.selectedDream = utilService.initDefaultDataOfDreamOrLifeEvent(id);
        }
        // Calculate stating age
        if (angular.isDefined(dropYear) && angular.isNumber(dropYear)) {
            this.selectedDream['purchase_age'] = dropYear;
        } else {
            this.selectedDream['purchase_age'] = $rootScope.profile.client.age;
        }

        // Calculate name of life event or dream it will select residence purchase or child member
        this.selectedDream.orginal_name = this.selectedDream.name + '';
        this.selectedDream.name = utilService.initNameOfDreamOrLifeEvent(id, this.selectedDream.orginal_name);
        this.selectedDream.config_data.ageRange = $rootScope.utilService.range($rootScope.PersonaPlan.start_age, $rootScope.PersonaPlan.death_age);
        if (this.selectedDream.dream_type_id == 1) {
            utilService.updateResidencePurchase(this.selectedDream);
        } else if (this.selectedDream.dream_type_id == 2) {
            utilService.updateEducation(this.selectedDream);
        }
        console.log(this.selectedDream);
        $timeout(function () {
            $rootScope.SendingScreenSharingDataObject($rootScope.timelineService.selectedDream, 'add', 'open', 'dreamdialog');
        }, 200);
        $rootScope.utilService.scopeApply();
        this.showDreamDialog();
    }

    this.saveDream = function () {
        $('#btnSaveDream').unbind('click');
        var dream = angular.copy(this.selectedDream);
        utilService.extractDreamOrLifeEvent(dream);
        if (this.selectedDream.config_data.is_edit) {
            var oldDream = null;
            var index = null;
            for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
                if ($rootScope.PersonaPlan.dreams[i].id == dream.id) {
                    oldDream = angular.copy($rootScope.PersonaPlan.dreams[i]);
                    utilService.extractDreamOrLifeEvent(oldDream);
                    index = i;
                    break;
                }
            }
            if (index != null) {
                $rootScope.PersonaPlan.dreams[index] = dream;
                $rootScope.actionService.updateData();
                if (!utilService.checkEqualLifeEvent(dream, oldDream)) {
                    $rootScope.actionService.calculateData();
                }
                $rootScope.timelineService.renderTimeLine();
                $rootScope.SendingScreenSharingDataObject(dream, 'edit', 'ok', 'dreamdialog');
                this.hideDreamDialog(true);
            } else {
                this.hideDreamDialog();
            }

        } else {
            $rootScope.planService.AddDream(dream, function (response) {
                console.log(response)
                dream.id = response.id;
                $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length] = dream;
                $rootScope.illiquidAsset.AddSwiperDreams($rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length - 1]);
                $rootScope.timelineService.renderTimeLine();
                $rootScope.actionService.calculateData();
            });
            console.log(dream);
            $rootScope.SendingScreenSharingDataObject(dream, 'add', 'ok', 'dreamdialog');
            this.hideDreamDialog(true);
        }



    }
    this.hideDreamDialog = function (isNotSendSharing) {
        var self = this;
        if (angular.isUndefined(isNotSendSharing) || isNotSendSharing == false) {
            $rootScope.SendingScreenSharingDataObject(this.selectedDream, 'add', 'cancel', 'dreamdialog');
        }
        $timeout(function () {
            $('#dreamdialog').modal('hide');
            self.selectedDream = null;
        }, 300);
    }

    this.showDreamDialog = function () {
        $rootScope.utilService.scopeApply();
        $timeout(function () {
            $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
        }, 500);
    }
    this.showLifeEventDialog = function () {
        $rootScope.utilService.scopeApply();
        $timeout(function () {
            $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false });
        }, 700);
    }

    this.saveLifeEvent = function () {
        $('#btnLifeEvent').unbind('click');
        var lifeEvent = angular.copy(this.selectedLifeEvent);
        utilService.extractDreamOrLifeEvent(lifeEvent);
        if (this.selectedLifeEvent.config_data.is_edit) {
            var oldLifeEvent = null;
            var index = null;
            for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
                if ($rootScope.PersonaPlan.lifeEvent[i].id == lifeEvent.id) {
                    oldLifeEvent = angular.copy($rootScope.PersonaPlan.lifeEvent[i]);
                    utilService.extractDreamOrLifeEvent(oldLifeEvent);
                    index = i;
                    break;
                }
            }
            if (index != null) {
                $rootScope.PersonaPlan.lifeEvent[index] = lifeEvent;
                $rootScope.actionService.updateData();
                if (!utilService.checkEqualLifeEvent(lifeEvent, oldLifeEvent)) {
                    $rootScope.actionService.calculateData();
                }
                $rootScope.timelineService.renderTimeLine();
                $rootScope.SendingScreenSharingDataObject(lifeEvent, 'edit', 'ok', 'lifeeventdialog');
                this.hideLifeEventDialog(true);
            } else {
                this.hideLifeEventDialog();
            }

        } else {
            $rootScope.planService.AddLifeEvent(lifeEvent, function (response) {
                lifeEvent.id = response.id;
                $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length] = lifeEvent;
                $rootScope.timelineService.renderTimeLine();
                $rootScope.actionService.calculateData();
            });
            $rootScope.SendingScreenSharingDataObject(lifeEvent, 'add', 'ok', 'lifeeventdialog');
            this.hideLifeEventDialog(true);
        }
    }
    this.hideLifeEventDialog = function (isNotSendSharing) {
        var self = this;
        if (angular.isUndefined(isNotSendSharing) || isNotSendSharing == false) {
            $rootScope.SendingScreenSharingDataObject(this.selectedLifeEvent, 'add', 'cancel', 'lifeeventdialog');
        }
        $timeout(function () {
            $('#lifeeventdialog').modal('hide');
            self.selectedLifeEvent = null;
        }, 300);
    }
    this.selectedLifeEvent = null;
    this.OpenAddLifeEventDialog = function (id, dropYear, defaultData) {
        // Check If have too much child independent
        var self = this;
        var idCount = $filter('filter')($rootScope.PersonaPlan.lifeEvent, { dream_type_id: 5 }).length;
        if (id == 5 && idCount >= 4) {
            utilService.showWarningMessage(utilService.translate("You can't create more 4 childrens !"));
            return;
        }
        if (angular.isDefined(defaultData)) {
            this.selectedLifeEvent = angular.copy(defaultData);
            //this.selectedLifeEvent.name += ' ';
            if (angular.isDefined(this.selectedLifeEvent)) {
                this.selectedLifeEvent.config_data = {};
            }
            this.selectedLifeEvent.config_data.is_edit = false;
        } else {
            this.selectedLifeEvent = utilService.initDefaultDataOfDreamOrLifeEvent(id);
        }
        if (this.selectedLifeEvent == null) {
            return;
        }
        // Calculate stating age
        if (angular.isDefined(dropYear) && angular.isNumber(dropYear)) {
            this.selectedLifeEvent['starting_age'] = dropYear;
        } else {
            this.selectedLifeEvent['starting_age'] = $rootScope.profile.client.age;
        }
        // Calculate name of life event or dream it will select residence purchase or child member
        this.selectedLifeEvent.orginal_name = this.selectedLifeEvent.name + '';
        this.selectedLifeEvent.name = utilService.initNameOfDreamOrLifeEvent(id, this.selectedLifeEvent.orginal_name);

        // If residence sale, then build list residence purchase and select first item
        if (id == 4) {
            utilService.updateResidenceSale(this.selectedLifeEvent);
            this.selectedLifeEvent.config_data.ageRange = this.initResidenceSaleYearRange();
        }
        else if (id == 5) { // If child independent then update child memmber, age of dependent, yearly cost reduce
            this.selectedLifeEvent.starting_age = 200;
            this.selectedLifeEvent.age_dependent = null;
            utilService.updateChildIndependent(this.selectedLifeEvent);
        } else if (id == 6) {
            this.selectedLifeEvent.config_data.ageRange = utilService.range($rootScope.PersonaPlan.start_age, $rootScope.PersonaPlan.death_age);
        }

        $rootScope.utilService.scopeApply();
        this.showLifeEventDialog();

        $rootScope.SendingScreenSharingDataObject(this.selectedLifeEvent, 'add', 'open', 'lifeeventdialog');

    }

    this.changeDateOfSale = function () {
        utilService.updateResidenceSale(this.selectedLifeEvent, this.selectedLifeEvent.config_data.is_edit);
        $rootScope.utilService.scopeApply();
    }

    this.OpenAddExistingAssetDialog = function () {
        this.OpenAddDreamDialog(1);
        this.selectedDream.existant = true;
        /*
        utilService.updateDefaultValueOfDream($rootScope, true);
        $rootScope.isEditDream = false;
        var year = $rootScope.PersonaPlan.start_age;
        $rootScope.timelineDropYear = $rootScope.PersonaPlan.start_age;
        $rootScope.tempPhotoContent = null;
        utilService.updateSelectedDreamType('dream');
        $rootScope.ChangeSelectListDreamType(1, 'dream');
        $timeout(function () {
            $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
            $rootScope.timelineService.mangeSlide();
            var objsending = { datatype: 'dream', objecttype: 'dream', year: $rootScope.timelineDropYear };
            $rootScope.SendingScreenSharingDataObject(objsending, 'illiquidAsset', 'OpenAddExistingAssetDialog', 'dreamdialog');
            $('#SaveDream').bind('click', function () {
                $timeout(function () {
                    bindToSelectedDream($rootScope, year);
                    $rootScope.selectedDream.photoContent = $rootScope.tempPhotoContent;
                    $rootScope.planService.AddDream($rootScope.selectedDream);
                    if ($rootScope.selectedDream.id != -1) {
                        $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length] = angular.copy($rootScope.selectedDream);
                        utilService.scopeApply();
                        $rootScope.illiquidAsset.AddSwiperDreams($rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length - 1]);
                        $rootScope.timelineService.renderTimeLine();
                        $rootScope.actionService.calculateData();
                    }
                    $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length - 1], 'illiquidAsset', 'OKOpenAddExistingAssetDialog', 'dreamdialog');
                    $('#SaveDream').unbind('click');
                    $('#CancelSaveDream').unbind('click');
                }, 100);
            });
            $('#CancelSaveDream').bind('click', function () {
                $rootScope.SendingScreenSharingDataObject(objsending, 'illiquidAsset', 'cancelOpenAddExistingAssetDialog', 'dreamdialog');
                $('#SaveDream').unbind('click');
                $('#CancelSaveDream').unbind('click');
            });
        }, 100);
        */
    }
    this.showTextCurrentYearDrag = function (ev, evtObj, type) {
        var id, item, obj;
        var year = this.showCurrentYearDrag(ev, evtObj, type);
        obj = utilService.translate("Age") + ":" + year;
        return obj;
    }
    this.showCurrentYearDrag = function (ev, evtObj, type) {
        var timeline_left = $('#timeline').offset().left + 10;
        var mouse_left = links.Timeline.getPageX(ev);
        if (isNaN(mouse_left))
            mouse_left = window.event.changedTouches[0].clientX;
        var drop_age = timeline.screenToTime(mouse_left - timeline_left);
        var year = drop_age.getFullYear() - new Date().getFullYear() + $rootScope.PersonaPlan.start_age + 1;
        if (year > $rootScope.PersonaPlan.death_age)
            year = $rootScope.PersonaPlan.death_age;
        if (year < $rootScope.PersonaPlan.start_age)
            year = $rootScope.PersonaPlan.start_age;
        return year;
    }
    this.dragControl = function (ev, evtObj, type) {

        var self = this;
        var year = this.showCurrentYearDrag(ev, evtObj, type);
        var data = evtObj.clone.context.id;
        if (type == "dream") {
            //utilService.updateSelectedDreamType('dream');
            var id = parseInt(data.replace("dream_", ""));
            if (id == '0') {
                $rootScope.showPremiumVersionMessage(0);
                return;
            }
            this.OpenAddDreamDialog(id, year);
        } else if (type == 'life_event') {
            var id = parseInt(data.replace("lifeevent_", ""));
            if (id == '7') {
                $rootScope.showPremiumVersionMessage(7);
                return;
            }
            this.OpenAddLifeEventDialog(id, year);
        }
    }
    $rootScope.ChangeSelectListDreamType = function (obj, type) {
        $rootScope.selectedDreamtype = findDreamTypebyId($rootScope, obj);
        $rootScope.selectedDream.photo_path = null;
        $rootScope.selectedLifeEvent.photo_path = null;
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
                    if (i == maxstep - 1) {
                        $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan)
                    }
                }, (i + 1) * durationforStep);
            }
            $timeout(function () { timeline.unselectItem(); }, duration);
        }
    }






    $rootScope.editLifeEventToPlayBack = function (dataObj) {
        $rootScope.timelineService.openLifeEventWithData(dataObj);
        $timeout(function () {
            var index = getIndexOfDataId($rootScope, 'lifeevent', dataObj.id);
            $rootScope.PersonaPlan.lifeEvent[index] = dataObj;
            $rootScope.timelineService.renderTimeLine();
        }, 4000);
        $timeout(function () {
            $rootScope.timelineService.hideLifeEventDialog(true);
        }, 5000);
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

    this.openDreamDialogWithData = function (dataObj) {
        $rootScope.timelineService.selectedDream = dataObj;
        $rootScope.timelineService.selectedDream.config_data = {
            is_edit: true
        };
        $rootScope.timelineService.selectedDream.config_data.ageRange = $rootScope.utilService.range($rootScope.PersonaPlan.start_age, $rootScope.PersonaPlan.death_age);
        if ($rootScope.timelineService.selectedDream.dream_type_id == 1) {
            utilService.updateResidencePurchase($rootScope.timelineService.selectedDream, true);
            $rootScope.timelineService.checkDreamRental(2, true);
        } else if ($rootScope.timelineService.selectedDream.dream_type_id == 2) {
            utilService.updateEducation($rootScope.timelineService.selectedDream, true);
        }

        $rootScope.utilService.scopeApply();
        $rootScope.timelineService.showDreamDialog();
    }

    $rootScope.addDreamToPlayBack = function (dataObj) {
        $rootScope.timelineService.openDreamDialogWithData(dataObj)
        $timeout(function () {
            //$rootScope.PersonaPlan.dreams.push($rootScope.timelineService.selectedDream)
            $rootScope.timelineService.renderTimeLine();
        }, 4000);
        $timeout(function () {
            $rootScope.timelineService.hideDreamDialog(true);
        }, 5000);
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

    this.openLifeEventWithData = function (dataObj) {
        $rootScope.timelineService.selectedLifeEvent = dataObj;
        $rootScope.timelineService.selectedLifeEvent.config_data = {
            is_edit: true
        };
        if ($rootScope.timelineService.selectedLifeEvent.dream_type_id == 4) {
            $rootScope.timelineService.selectedLifeEvent.selected_residence = $rootScope.timelineService.selectedLifeEvent.dream_id;
            utilService.updateResidenceSale(this.selectedLifeEvent, true);
            $rootScope.timelineService.selectedLifeEvent.config_data.ageRange = $rootScope.timelineService.initResidenceSaleYearRange();
        } else if ($rootScope.timelineService.selectedLifeEvent.dream_type_id == 5) {
            utilService.updateChildIndependent(this.selectedLifeEvent, true);
        } else if ($rootScope.timelineService.selectedLifeEvent.dream_type_id == 6) {
            $rootScope.timelineService.selectedLifeEvent.config_data.ageRange = utilService.range($rootScope.PersonaPlan.start_age, $rootScope.PersonaPlan.death_age);
        }

        $rootScope.utilService.scopeApply();

        $rootScope.timelineService.showLifeEventDialog();
    }

    $rootScope.addLifeEventToPlayBack = function (dataObj) {
        $rootScope.timelineService.openLifeEventWithData(dataObj);
        $timeout(function () {
            $rootScope.PersonaPlan.lifeEvent.push($rootScope.timelineService.selectedLifeEvent)
            $rootScope.timelineService.renderTimeLine();
        }, 4000);
        $timeout(function () {
            $rootScope.timelineService.hideLifeEventDialog(true);
        }, 5000);
    }
    $rootScope.removeLifeEventToPlayBack = function (dataObj) {
        var lifeEvent_Index = getIndexOfDataId($rootScope, 'lifeevent', dataObj.id);
        $rootScope.PersonaPlan.lifeEvent.splice(lifeEvent_Index, 1);
        $timeout(function () {
            $rootScope.timelineService.renderTimeLine();
        }, 100);
    }
    $rootScope.editDreamToPlayBack = function (dataObj) {
        $rootScope.timelineService.openDreamDialogWithData(dataObj)
        $timeout(function () {
            var index = getIndexOfDataId($rootScope, 'dream', dataObj.id);
            $rootScope.PersonaPlan.dreams[index] = dataObj;
            $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan, $rootScope.playbackService.childList);
            $rootScope.timelineService.renderTimeLine();
        }, 4000);
        $timeout(function () {
            $rootScope.timelineService.hideDreamDialog(true);
        }, 5000);

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
                $rootScope.timelineService.mangeSlide(dataObj.newValue.is_rent);
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
        }, 2000);
    }
    $rootScope.editDreamAtViewing = function (dataObj) {
        var index;
        $timeout(function () {
            if (dataObj.name == 'dream') {
                index = getIndexOfDataId($rootScope, dataObj.name, dataObj.newValue.id);
                $rootScope.PersonaPlan.dreams[index] = angular.copy(dataObj.newValue);
                bindDreamtoModalDialog($rootScope, index);
                $rootScope.timelineService.mangeSlide(obj.newValue.is_rent);
            }
            else {
                index = getIndexOfDataId($rootScope, dataObj.name, dataObj.newValue.id);
                $rootScope.PersonaPlan.lifeEvent[index] = angular.copy(dataObj.newValue);
                bindLifeEventtoModalDialog($rootScope, index);
            }
        }, 1);
        $timeout(function () {
            $rootScope.timelineService.renderTimeLine();
        }, 500);
        $timeout(function () {
            $('#' + dataObj.controlID).modal('hide');
        }, 2000);
    }
    var currentScrollTop = null;
    var isScrolled = false;
    $rootScope.windowsScrollTo = function (scrollTop) {
        if (scrollTop != null && (currentScrollTop != scrollTop) && isScrolled == false && typeof (scrollTop) != undefined) {
            currentScrollTop = scrollTop;
            isScrolled = true;
            $('html, body').animate({
                scrollTop: scrollTop
            }, 100);
            $timeout(function () {
                isScrolled = false;
            }, 500);
        }
    }
    $rootScope.UpdateControlForShareScreen = function (obj) {
        switch (obj.action) {
            case 'familyMembers':
                $rootScope.familyMembers = angular.copy(obj.newValue);
                break;
            case 'childMembersFilterNotOtherChild':
                $rootScope.childMembersFilterNotOtherChild = angular.copy(obj.newValue);
                break;
            case 'childMembers':
                $rootScope.childMembers = angular.copy(obj.newValue);
                break;
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
                utilService.scopeApply();
                $timeout(function () {
                    $rootScope.timelineService.renderTimeLine();
                }, 50);
                break;
            case 'delete':
                switch (obj.actionEvent) {
                    case 'open':
                        var message = utilService.translate('Do you want to delete it?');
                        if (obj.newValue.name == 'dream' && obj.newValue.lifeevent_name.length > 1) {
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
                        if (obj.controlID == 'lifeeventdialog') {
                            $rootScope.timelineService.selectedLifeEvent = obj.newValue;
                            $rootScope.timelineService.showLifeEventDialog();
                        } else if (obj.controlID == 'dreamdialog') {
                            $rootScope.timelineService.selectedDream = obj.newValue;
                            $rootScope.timelineService.showDreamDialog();
                        }
                        break;
                    case 'ok':
                        if (obj.controlID == 'lifeeventdialog') {
                            $rootScope.PersonaPlan.lifeEvent.push(obj.newValue);
                            $rootScope.timelineService.selectedLifeEvent = obj.newValue;
                        } else if (obj.controlID == 'dreamdialog') {
                            $rootScope.PersonaPlan.dreams.push(obj.newValue);
                            $rootScope.timelineService.selectedDream = obj.newValue;
                        }
                        $rootScope.utilService.scopeApply();
                        $rootScope.timelineService.renderTimeLine();
                        $rootScope.actionService.calculateData();
                        $timeout(function () {
                            $rootScope.timelineService.hideLifeEventDialog(true);
                            $rootScope.timelineService.hideDreamDialog(true);
                        }, 1000);
                        break;
                    case 'cancel':
                        $rootScope.timelineService.hideLifeEventDialog(true);
                        $rootScope.timelineService.hideDreamDialog(true);
                        break;
                }
                break;
            case 'click':
                switch (obj.actionEvent) {
                    case 'openAddGroup':
                        $('.btn-triger').click();
                        break;
                    case 'toolbox-panel':
                        $timeout(function () {
                            var item = timeline.items[obj.newValue];
                            $rootScope.timelineService.item_selected_id = obj.newValue;
                            var leftDisplay = item.left - 8;
                            $('#updateDreamPanel').removeClass('show-right');
                            if (leftDisplay < 100) $('#updateDreamPanel').addClass('show-right');
                            $rootScope.timelineService.hideActionPanel();
                            //$('#updateDreamPanel').hide();
                            //$('#updateDreamPanel').removeClass('open');
                            $('#updateDreamPanel').css({ left: leftDisplay, top: item.top + 62 })
                            $rootScope.timelineService.showActionPanel();
                            //$('#updateDreamPanel').show();
                            $timeout(function () {
                                //$('#updateDreamPanel').addClass('open');
                            }, 300);

                            var result = $rootScope.PersonaPlan.dreams.filter(function (obj) {
                                return obj.id == item.data_id;
                            });

                            $('#toolbox-panel').removeClass("float-btn-group");
                            $('#toolbox-panel').addClass("float-btn-group open");

                            $rootScope.timelineService.cancelHighlight();

                            $('#dream_' + result[0].dream_type_id).removeClass("red");
                            $('#dream_' + result[0].dream_type_id).addClass("highlight-dream");

                        }, 100);
                        break;
                    case 'dreamDuplicate':
                        $rootScope.timelineService.dreamDuplicate();
                        break;
                }
                break;
            case 'hover':
                switch (obj.actionEvent) {
                    case 'rollOverGraphItem':
                        switch (obj.controlID) {
                            case 'chartdiv':
                                savingRateService.bingdingDataForSharing(obj.newValue.index);
                                break;
                            case 'dev_detaillifeStype':
                                $rootScope.retirementLifeStyle.bingdingDataForSharing(obj.newValue.index);
                                break;
                            default:
                        }
                        break;
                    case 'leaveItem':
                        switch (obj.controlID) {
                            case 'chartdiv':
                                savingRateService.resetValueForChart();
                                break;
                            case 'dev_detaillifeStype':
                                $rootScope.retirementLifeStyle.resetValueForChart();
                                break;
                            default:
                        }
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
                        else if (obj.name == 'retirement_age') {
                            $rootScope.timelineService.openEditItemOnTimeLine(obj);
                        }
                        else if (obj.name == 'social_security_age') {
                            $rootScope.timelineService.openEditItemOnTimeLine(obj);
                        }
                        else {
                            if (obj.controlID == 'lifeeventdialog') {
                                $rootScope.timelineService.selectedLifeEvent = obj.newValue;
                                $rootScope.timelineService.showLifeEventDialog();
                            } else if (obj.controlID == 'dreamdialog') {
                                $rootScope.timelineService.selectedDream = obj.newValue;
                                $rootScope.timelineService.showDreamDialog();
                            }
                            break;
                        }
                        break;
                    case 'ok':
                        if (obj.name == 'start_age') {
                            $rootScope.form_start_age = obj.newValue;
                            $rootScope.PersonaPlan.start_age = obj.newValue;
                        }
                        else if (obj.name == 'retirement_age') {
                            $rootScope.PersonaPlan.retirement_age = obj.newValue;
                        }
                        else if (obj.name == 'social_security_age') {
                            $rootScope.PersonaPlan.social_security_age = obj.newValue;
                        }
                        else if (obj.controlID == 'lifeeventdialog' || obj.controlID == 'dreamdialog') {
                            if (obj.controlID == 'lifeeventdialog') {
                                for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
                                    if ($rootScope.PersonaPlan.lifeEvent[i].id == obj.newValue.id) {
                                        $rootScope.PersonaPlan.lifeEvent[i] = obj.newValue;
                                        break;
                                    }
                                }
                                $rootScope.timelineService.selectedLifeEvent = obj.newValue;
                            } else if (obj.controlID == 'dreamdialog') {
                                for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
                                    if ($rootScope.PersonaPlan.dreams[i].id == obj.newValue.id) {
                                        $rootScope.PersonaPlan.dreams[i] = obj.newValue;
                                        break;
                                    }
                                }
                                $rootScope.timelineService.selectedDream = obj.newValue;
                            }
                            $rootScope.utilService.scopeApply();
                            $rootScope.timelineService.renderTimeLine();
                            $rootScope.actionService.calculateData();
                            $timeout(function () {
                                $rootScope.timelineService.hideLifeEventDialog(true);
                                $rootScope.timelineService.hideDreamDialog(true);
                            }, 1000);
                            return;
                        }
                        $timeout(function () {
                            $('#' + obj.controlID).modal('hide');
                            $rootScope.timelineService.renderTimeLine();
                        }, 2000);
                        break;
                    case 'cancel':
                        $rootScope.timelineService.hideLifeEventDialog(true);
                        $rootScope.timelineService.hideDreamDialog(true);
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
            case 'AllData':
                $rootScope.ApplyAllData(obj.newValue);
                break;
            case 'zoom':
                switch (obj.actionEvent) {
                    case 'changeMinAge':
                        $rootScope.zoomData.minAge = obj.newValue;
                        $rootScope.timelineService.zoomTimelineChart();
                        break;
                    case 'changeMaxAge':
                        $rootScope.zoomData.maxAge = obj.newValue;
                        $rootScope.timelineService.zoomTimelineChart();
                        break;
                }
                $timeout(function () {
                    utilService.scopeApply();
                }, 100);
                break;
            case 'clickOnSavingRate':
                $("*[parent='" + obj.newValue + "']").slideToggle('slow');
                break;
            case 'changeCard':
                $rootScope.PersonaPlan[obj.controlID] = obj.newValue;
                $rootScope.savingRate.UpdateChangeCard(obj.actionEvent);
                break;
            case 'changeExpenseRetirementCard':
                $rootScope.PersonaPlan[obj.controlID] = obj.newValue;
                for (var i = 0 ; i < $rootScope.retirementLife.length; i++) {
                    if ($rootScope.retirementLife[i].value == $rootScope.PersonaPlan.expense_at_retirement) {
                        $rootScope.selectedretirementLife = $rootScope.retirementLife[i];
                        break;
                    }
                };
                if ($rootScope.selectedretirementLife == null) {
                    $rootScope.selectedretirementLife = $rootScope.retirementLife[1];
                    $rootScope.PersonaPlan.expense_at_retirement = $rootScope.selectedretirementLife.value;
                };
                break;
            case 'changeCardSwiper':
                $rootScope.savingRate.SharingForCardShow(obj.newValue);
                break;
            case 'changeIlliquidAssetCardSwiper':
                switch (obj.actionEvent) {
                    case 'showCard':
                        $rootScope.illiquidAsset.SharingForCardShow(obj.newValue);
                        break;
                    case 'expand_key':
                        $rootScope.illiquidAsset.expandControl(obj.newValue);
                        break;
                    case 'ViewTotal':
                        $('#assets-btn2').trigger('click');
                        break;
                    case 'ViewIndividual':
                        $('#assets-btn1').trigger('click');
                        break;
                    default:
                }
                break;
            case 'zoomed':
                switch (obj.actionEvent) {
                    case 'savingRate':
                        $rootScope.savingRate.changeZoomToIndex(obj.newValue.startIndex, obj.newValue.endIndex);
                        break;
                    case 'chartRetirement':
                        $rootScope.retirementLifeStyle.changeZoomToIndex(obj.newValue.startIndex, obj.newValue.endIndex);
                        break;
                    case 'chartInvestment':
                        $rootScope.investment.changeZoomToIndex(obj.newValue.startIndex, obj.newValue.endIndex);
                        break;
                    case 'chartIlliquid':
                        $rootScope.illiquidAsset.changeZoomToIndex(obj.newValue.startIndex, obj.newValue.endIndex);
                        break;
                    default:
                }
                break;

            default:
                break;
        }
    }
    this.SendingScreenSharingDataObject = function (obj, actionType, actionEvent, controlID) {
        $rootScope.SendingScreenSharingDataObject(obj, actionType, actionEvent, controlID);
    }
    $rootScope.SendingScreenSharingDataObject = function (obj, actionType, actionEvent, controlID) {
        var sendObj = $rootScope.GetChangedObject(obj, 'sharing', actionType, actionEvent, controlID, $rootScope.clientActionObjectId, $rootScope.clientActionObjectEvent);
        $rootScope.sharingService.dataSend(sendObj);
    }
    $rootScope.GetChangedObject = function (obj, typeObject, actionType, actionEvent, controlID, clientActionObjectId, clientActionObjectEvent) {
        var sharingScreenObj, newValue;
        if (typeObject == 'sharing') {
            switch (actionType) {
                case 'move':
                    newValue = {
                        name: obj.name,
                        data_id: obj.data_id,
                        dream_id: obj.dream_id,
                        start: obj.start
                    }
                    break;
                case 'add':
                    if (actionEvent == 'open')
                        newValue = obj;
                    else if (actionEvent == 'ok')
                        newValue = controlID == 'dreamdialog' ? $rootScope.timelineService.selectedDream : $rootScope.timelineService.selectedLifeEvent;
                    else
                        newValue = '';
                    break;
                case 'edit':
                    switch (obj.name) {
                        case 'start_age':
                            newValue = $rootScope.PersonaPlan.start_age;
                            break;
                        case 'retirement_age':
                            newValue = $rootScope.PersonaPlan.retirement_age;
                            break;
                        case 'social_security_age':
                            newValue = $rootScope.PersonaPlan.social_security_age;
                            break;
                            //case 'dream':
                            /*
                            var dream = $.grep($rootScope.PersonaPlan.dreams, function (e) { return e.id == obj.data_id; });
                            newValue = dream[0];
                            */
                            //newValue = obj;
                            //break;
                            //case 'life_event':
                            /*
                            var lifeEvent = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.id == obj.data_id; });
                            newValue = lifeEvent[0];
                            */
                            //newValue = obj;
                            //break;
                        default:
                            newValue = obj;
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
    },
     this.ConfirmOKDialogProfile = function () {
         $rootScope.profileDialogData.client.isChanged = true;
         $rootScope.profileService.saveProfile();
     }
    $rootScope.SetEventActionTypeForShare = function (controlId, event) {
        if ($rootScope.isTakeOver == true) {
            $rootScope.clientActionObjectId = controlId;
            $rootScope.clientActionObjectEvent = event;
        }
    }

    this.childMembersFilter = function () {
        var childMembersFilter = [];
        angular.forEach($rootScope.childMembers, function (child) {
            if (child.name.length > 0) {
                childMembersFilter.push(child);
            }
        });

        var optionme = '';
        angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (dreamTypeConfig) {
            if (dreamTypeConfig.field_name == 'dependent_reference' && dreamTypeConfig.value != null && dreamTypeConfig.value.indexOf('child_') >= 0) {
                optionme = dreamTypeConfig.value;
            }
        });

        angular.forEach($rootScope.PersonaPlan.lifeEvent, function (lifeEvent) {
            if (lifeEvent.dependent_reference != null && lifeEvent.dependent_reference.indexOf('child_') >= 0 && lifeEvent.dependent_reference != optionme) {
                for (var i = childMembersFilter.length - 1 ; i >= 0; i--) {
                    if (childMembersFilter[i].id == lifeEvent.dependent_reference) {
                        childMembersFilter.splice(i, 1);
                    }
                }
            }
        });
        $rootScope.childMembersFilter = childMembersFilter;
        childMembersFilter.splice(childMembersFilter.length - 1, 1);
        $rootScope.childMembersFilterNotOtherChild = childMembersFilter;
    }

    this.changeDreamDuration = function (duration) {
        if (duration == 0) {
            this.selectedDream.config_data.backup_down_payment = angular.copy(this.selectedDream.down_payment);
            this.selectedDream.down_payment = 0;
        } else {
            if (angular.isDefined(this.selectedDream.config_data.backup_down_payment) && angular.isNumber(this.selectedDream.config_data.backup_down_payment)) {
                this.selectedDream.down_payment = angular.copy(this.selectedDream.config_data.backup_down_payment);
            }
        }
    }
    this.UpdateControlShareScreen = function (obj) {
        switch (obj.actionEvent) {
            case 'onmouseupclick':
                $rootScope.profile = angular.copy(obj.newValue.profile);
                selectedLifeEventOrDream = angular.copy(obj.newValue.selectedLifeEventOrDream);
                if (selectedLifeEventOrDream.dream_type.type === 'life_event') {
                    for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
                        if ($rootScope.PersonaPlan.lifeEvent[i].id == selectedLifeEventOrDream.id) {
                            $rootScope.PersonaPlan.lifeEvent[i] = selectedLifeEventOrDream;
                            break;
                        }
                    }
                }
                utilService.scopeApply();
                $rootScope.timelineService.onmouseupclick();
                break;
        }
    }

    this.closeManual = function () {
        var self = this;
        $timeout(function () {
            self.cancelHighlight();
            $rootScope.timelineService.hideActionPanel();
        }, 350);
    }

    this.changeTitleOfDremOrLifeEvent = function (dreamOrLifeEvent) {
        dreamOrLifeEvent.config_data['is_change_value'] = true;
    }
    return this;
});