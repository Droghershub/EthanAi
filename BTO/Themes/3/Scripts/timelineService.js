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
btoApp.service('timelineService', function ($rootScope, personalPlanService, utilService, $timeout, $state, $locale, accountService, CONFIG, savingRateService, illiquidAssetService, $filter) {
    $rootScope.totalExisting = 0;
    this.initTimeline = function () {
        $rootScope.renoutProperty = {
            textwillrent: 'I will rent out this property',
            textrentover: 'I am renting out this property'
        };
        this.renderTimeLine();
        // illiquidAssetService.init();
        $timeout(function () {
            $rootScope.actionService.calculateData();
        }, 400);
    }
    this.onchange = function () {
        if (timeline.selection != undefined) {
            var objrelated, year, boundingYear;
            var index = (timeline.selection && timeline.selection.index !== undefined) ? timeline.selection.index : -1,
            item = (timeline.selection && timeline.selection.index !== undefined) ? timeline.items[index] : undefined;
            if (item) {
                $rootScope.SendingScreenSharingDataObject(item, 'move');
            }
            if (item.name == "start_age") {
                return;
            }
            var steptocurrent = $rootScope.timelineService.StepChangeWithCurrentYear(item);
            if (item.name == "retirement_age" && $rootScope.PersonaPlan.retirement_age != timeline.items[0].start_age + steptocurrent + 1) {

                year = timeline.items[0].start_age + steptocurrent + 1;
                $rootScope.timelineMessage = '';
                boundingYear = year < $rootScope.PersonaPlan.start_age ? $rootScope.PersonaPlan.start_age : year;
                //boundingYear = boundingYear > 70 ? 70 : boundingYear;

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
                var dependent;
                var dependent_position = 1;
                var life_event_year, life_eventobj;
                life_eventobj = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.id == data_id; });
                if (life_eventobj && life_eventobj.length > 0) {
                    life_event_year = life_eventobj[0].starting_age;
                }
                var year = timeline.items[0].start_age + steptocurrent + 1;
                if (life_eventobj[0].dependent_reference && life_eventobj[0].dependent_reference.length > 0) {
                    var dependent_id = life_eventobj[0].dependent_reference.replace('child_', '');
                    for (var i = 0; i < $rootScope.profile.children.childrens.length; ++i) {
                        if ($rootScope.profile.children.childrens[i].id == dependent_id) {
                            dependent = $rootScope.profile.children.childrens[i];
                            break;
                        }
                        dependent_position = dependent_position + 1;
                    }
                }

                var min = 0, max = 200
                if (dependent && dependent_position == 1) {
                    min = $rootScope.PersonaPlan.start_age + $rootScope.cashFlow.parameter._c_ind_child_1 - dependent.age;
                }
                else if (dependent && dependent_position == 2) {
                    min = $rootScope.PersonaPlan.start_age + $rootScope.cashFlow.parameter._c_ind_child_2 - dependent.age;
                }
                else if (dependent && dependent_position == 3) {
                    min = $rootScope.PersonaPlan.start_age + $rootScope.cashFlow.parameter._c_ind_child_3 - dependent.age;
                }
                else if (dependent && dependent_position == 4) {
                    min = $rootScope.PersonaPlan.start_age + $rootScope.cashFlow.parameter._c_ind_child_4 - dependent.age;
                }
                else {
                    min = $rootScope.PersonaPlan.start_age;
                }

                var result = $.grep($rootScope.PersonaPlan.lifeEvent, function (e) { return e.id == data_id; });

                if (year < min) {
                    if (result[0].dream_type_id != 5) {
                        year = min;
                        $rootScope.timelineMessage = result[0].name + utilService.translate(' must be in range') + ' ' + min + '-' + $rootScope.PersonaPlan.death_age;
                    }
                }

                if (life_eventobj.length > 0) {
                    var childList = $rootScope.profile.children.childrens.filter(function (child) { return life_eventobj[0].dependent_reference == 'child_' + child.id; })
                    if (childList.length > 0) {
                        var childObj = childList[0];
                        var age_dependent = year - $rootScope.PersonaPlan.start_age + childObj.age;
                        var obj = $(item.dom);
                        var timeline_item_description = obj.find('.timeline_item_description');
                        timeline_item_description.css('display', 'block');
                        timeline_item_description.html(" " + utilService.translate('Age of independence') + ": " + age_dependent + " &nbsp;");
                        //console.log(age_dependent, obj);
                    }
                }

                if (result && result.length > 0 && result[0].purchase_age != year) {
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
            if ($rootScope.timelineDataChange) {
                // Only change data if mouse up
                //$rootScope.actionService.calculateData();
            }

            return;
        }
    },
    this.onchanged = function () {
        if (timeline.selection != undefined && $rootScope.timelineDataChange) {
            var index = (timeline.selection && timeline.selection.index !== undefined) ? timeline.selection.index : -1;
            var item = (timeline.selection && timeline.selection.index !== undefined) ? timeline.items[index] : undefined;
            if (item.name == "start_age") {
                return;
            }
            if (item && item.name == "start_age") {
                $rootScope.utilService.UpdatePurchaseAgeExistanceDream($rootScope);
            }
            if ($rootScope.timelineMessage.length > 2)
                utilService.showWarningMessage($rootScope.timelineMessage);
            $rootScope.options.max = new Date(new Date().getFullYear() + $rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age + 1, 0, 0);
            $rootScope.timelineService.renderTimeLine();
            $rootScope.timelineDataChange = false;
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan, 'move_end');
            $timeout(function () {
                var itemafterchange = $.grep(timeline.items, function (e) { return e.name == item.name && e.data_id == item.data_id; });
                if (itemafterchange && itemafterchange.length > 0 && selectedYear != itemafterchange[0].start.getFullYear()) {
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
        if (typeof item_selected_id !== "undefined") {
            var item = timeline.items[item_selected_id];
            selectedYear = angular.copy(item.start.getFullYear())
            if (item.name == "life_event" || item.name == "dream") {
                var index = getIndexOfDataId($rootScope, 'lifeevent', item.data_id);
                selectedLifeEventOrDream = $rootScope.PersonaPlan.lifeEvent[index];
            }
            $rootScope.timelineService.cancelHighlight();
            $('#updateDreamPanel').hide();
        }
    }

    this.onmouseupclick = function () {
        $timeout(function () {
            if (angular.isDefined(selectedLifeEventOrDream) && selectedLifeEventOrDream != null && (selectedLifeEventOrDream.dream_type_id == 5 || selectedLifeEventOrDream.starting_age != 200)) {
                var searchChild = $rootScope.profile.children.childrens.filter(function (child) {
                    return ('child_' + child.id) == selectedLifeEventOrDream.dependent_reference;
                });
                $rootScope.SendingScreenSharingDataObject({ 'selectedLifeEventOrDream': selectedLifeEventOrDream, 'profile': $rootScope.profile }, 'timelineService', 'onmouseupclick', '');
                if (searchChild.length > 0) {
                    var childObj = searchChild[0];
                    // check move above age dependent
                    var age_dependent = selectedLifeEventOrDream.starting_age - $rootScope.PersonaPlan.start_age + childObj.age;
                    if (age_dependent < 16) {
                        utilService.showWarningMessage(utilService.translate('Age of independence of life event {{name}} must greater than 16', { name: selectedLifeEventOrDream.name }));
                        selectedLifeEventOrDream.age_dependent = 16;
                        selectedLifeEventOrDream.starting_age = $rootScope.PersonaPlan.start_age + selectedLifeEventOrDream.age_dependent - childObj.age;
                    } else if (age_dependent > 25) {
                        utilService.showWarningMessage(utilService.translate('Age of independence of life event {{name}} must less than 25', { name: selectedLifeEventOrDream.name }));
                        selectedLifeEventOrDream.age_dependent = 25;
                        selectedLifeEventOrDream.starting_age = $rootScope.PersonaPlan.start_age + selectedLifeEventOrDream.age_dependent - childObj.age;
                    } else {
                        selectedLifeEventOrDream.age_dependent = age_dependent;
                    }
                }
            }
            $rootScope.timelineService.renderTimeLine();
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
        var residentialTypeObj = $filter('filter')($rootScope.residentialType, { id: index });
        angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (dreamTypeConfig) {
            if (dreamTypeConfig.field_name == 'name') {
                var suggestName = residentialTypeObj[0].name;
                var max_id = 0;
                angular.forEach($rootScope.PersonaPlan.dreams, function (item) {
                    var name = item.name;
                    name = name.substr(suggestName.length + 1);
                    try {
                        name = parseInt(name);
                        if (name > max_id) { max_id = name; }
                    } catch (ex) { }
                });

                max_id = max_id + 1;
                if (max_id != 0)
                    dreamTypeConfig.value = suggestName + ' ' + max_id;
                else
                    dreamTypeConfig.value = suggestName;
                $rootScope.utilService.scopeApply();
            }
        });
    }

    this.checkDreamLiving = function () {
        angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (dreamTypeConfig) {
            if (dreamTypeConfig.field_name == 'is_living') {
                console.log(dreamTypeConfig.value);
            }
        });
    }

    this.checkDreamRental = function () {
        var existingDreams = $filter('filter')($rootScope.PersonaPlan.dreams, { existant: true });
        if ($rootScope.selectedDream.existant && (existingDreams.length == 0 || (existingDreams.length == 1 && $rootScope.ExisingDreamSelecting != null && $rootScope.ExisingDreamSelecting.id == existingDreams[0].id))) {
            this.validateShowDreamRental();

        }

        else {
            if (!$rootScope.selectedDream.existant) {
                $rootScope.isShowDreamRental = false;
                $rootScope.utilService.scopeApply();

            }

            var existingNotRentYet = 0;
            angular.forEach($rootScope.PersonaPlan.dreams, function (dream) {

                if (dream.existant && !dream.is_rent && ($rootScope.ExisingDreamSelecting == null || dream.id != $rootScope.ExisingDreamSelecting.id)) {
                    existingNotRentYet = existingNotRentYet + 1;
                }
            });

            if (existingNotRentYet == 0 && $rootScope.selectedDream.existant) {
                angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (dreamTypeConfig) {
                    if (dreamTypeConfig.field_name == 'is_rent') {
                        dreamTypeConfig.value = false;
                        $rootScope.utilService.scopeApply();
                        //$("#dream_rentalPanel").slideUp();
                        $("#rental_net_income_panel").hide();
                        utilService.showWarningMessage(utilService.translate('No rental for this testing version'));
                    }
                });
            }


            angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (dreamTypeConfig) {
                if (dreamTypeConfig.field_name == 'is_rent') {
                    $rootScope.changeRental(dreamTypeConfig.value);
                }
            });
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
        $('#updateDreamPanel').hide();
        item_selected_id = $rootScope.timelineService.item_selected_id;
        $rootScope.timelineService.ondeleted();
    }


    this.dreamDuplicate = function () {
        this.cancelHighlight();
        $('#updateDreamPanel').hide();
        item_selected_id = $rootScope.timelineService.item_selected_id;
        if (item_selected_id != 0) {
            var item = timeline.items[item_selected_id];
            if (item) {
                if (item && item.name == "dream") {
                    var result = $rootScope.PersonaPlan.dreams.filter(function (obj) {
                        return obj.id == item.data_id;
                    });
                    
                    this.DuplicateDreamDialog(result[0].dream_type_id, item.data_id);

                }
                else if (item.name == "life_event") {
                    var result = $rootScope.PersonaPlan.lifeEvent.filter(function (obj) {
                        return obj.id == item.data_id;
                    });
                    
                    this.DuplicateLifeEventDialog(result[0].dream_type_id, item.data_id);
                }
            }
        }
        $rootScope.SendingScreenSharingDataObject(item_selected_id, 'click', 'dreamDuplicate', 'toolbox-panel');
    }


    this.onDuplicateCallback = function () {
        console.log('duplicate dream or life event');
        if (item_selected_id != 0) {
            var item = timeline.items[item_selected_id];
            if (item) {
                console.log(item);
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
                if (item.dream_type.type == "dream") {
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
                else if (item.dream_type.type == "life_event") {
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
                //$("#dream_rentalPanel").slideUp();
                $("#rental_net_income_panel").hide();
            } else {
                //$("#dream_rentalPanel").slideDown();
                $("#rental_net_income_panel").show();
            }
            return;
        }
        if ($('#dream_rental_value').val() == 'false') {
            //$("#dream_rentalPanel").slideUp();
            $("#rental_net_income_panel").hide();
        } else if ($('#dream_rental_value').val() == 'true') {
            //$("#dream_rentalPanel").slideDown();
            $("#rental_net_income_panel").show();
        } else {
            //$("#dream_rentalPanel").slideUp();
            $("#rental_net_income_panel").hide();
        }
    },
    this.openEditDreamDialog = function (id) {
        this.childMembersFilter();
        $rootScope.SendingScreenSharingDataObject($rootScope.childMembersFilterNotOtherChild, 'childMembersFilterNotOtherChild', 'childMembersFilterNotOtherChild', '');
        if ($rootScope.functionAccess.EDIT_DREAM == null || $rootScope.functionAccess.EDIT_DREAM == undefined || $rootScope.functionAccess.EDIT_DREAM == 0) {
            $rootScope.functionAccess.showDeniedMessage();
            $rootScope.EditdreamPermission = false;
            return;
        }
        $rootScope.EditdreamPermission = true;
        $rootScope.tempPhotoContent = null;
        $rootScope.timelineDropYear = -1;
        $rootScope.isEditDream = true;

        indexId = getIndexOfDataId($rootScope, 'dream', id);
        bindDreamtoModalDialog($rootScope, indexId);
        utilService.updateSelectedDreamType('dream', true);

        var dream = $rootScope.PersonaPlan.dreams[indexId];
        if (dream.existant === true)
            $rootScope.ExisingDreamSelecting = dream;
        else
            $rootScope.ExisingDreamSelecting = null;
        
        $rootScope.selectedDreamOrLifeEvent = dream;
        console.log($rootScope.selectedDreamOrLifeEvent);

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
            $rootScope.timelineService.mangeSlide();

            var sendObj = { type: 'dream', datatype: 'dream', name: 'dream', data_id: $rootScope.selectedDreamOrLifeEvent.id };
            $rootScope.SendingScreenSharingDataObject(sendObj, 'edit', 'open', 'dreamdialog');

            $('#SaveDream').bind('click', function () {
                bindDreamfromModalDialog($rootScope, indexId);
                utilService.scopeApply();
                $rootScope.illiquidAsset.UpdateSwiperDreams($rootScope.PersonaPlan.dreams[indexId]);
                var dream = $rootScope.PersonaPlan.dreams[indexId];
                //console.log(dream);
                if (!utilService.checkEqualDream(dream, $rootScope.backUpSelectedDream)) {
                    $rootScope.timelineService.renderTimeLine();
                    $rootScope.actionService.calculateData();
                }
                $rootScope.actionService.updateData();
                $rootScope.SendingScreenSharingDataObject(sendObj, 'edit', 'ok', 'dreamdialog');

                $('#SaveDream').unbind('click');
                $('#CancelSaveDream').unbind('click');
            });
            $('#CancelSaveDream').bind('click', function () {
                $rootScope.SendingScreenSharingDataObject(sendObj, 'edit', 'cancel', 'dreamdialog');
                $('#SaveDream').unbind('click');
                $('#CancelSaveDream').unbind('click');
            });
        }, 500);
        this.validateShowDreamRental();
        return;
    }

    this.openEditLifeEventDialog = function (id) {
        var self = this;
        if ($rootScope.functionAccess.EDIT_LIFE_EVENT == null || $rootScope.functionAccess.EDIT_LIFE_EVENT == undefined) {
            $rootScope.functionAccess.showDeniedMessage();
            return;
        }
        $rootScope.timelineDropYear = -1;
        $rootScope.isEditDream = true;
        indexId = getIndexOfDataId($rootScope, 'lifeevent', id);

        bindLifeEventtoModalDialog($rootScope, indexId);
        utilService.updateSelectedDreamType('life_event', true);
        if ($rootScope.functionAccess.EDIT_LIFE_EVENT == 0) {
            $rootScope.functionAccess.showErrorMessage();
            $rootScope.EditLifeeventPermission = false;
        }
        else { $rootScope.EditLifeeventPermission = true; }

        utilService.scopeApply();
        $timeout(function () {
            var sendObj = {
                type: 'life_event',
                name: 'life_event',
                data_id: id
            };
            $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false })
            $rootScope.SendingScreenSharingDataObject(sendObj, 'edit', 'open', 'lifeeventdialog');
            $('#SaveLifeEvent').bind('click', function () {
                console.log('#SaveLifeEvent');
                bindLifeEventfromModalDialog($rootScope, indexId);
                var lifeEvent = $rootScope.PersonaPlan.lifeEvent[indexId];
                $rootScope.timelineService.renderTimeLine();
                $rootScope.SendingScreenSharingDataObject(sendObj, 'edit', 'ok', 'lifeeventdialog');
                if (!utilService.checkEqualLifeEvent(lifeEvent, $rootScope.backUpLifeEvent)) {
                    $rootScope.actionService.calculateData();
                }
                $rootScope.actionService.updateData();
                $('#SaveLifeEvent').unbind('click');
                $('#cancelSaveLifeEvent').unbind('click');
            });
            $('#cancelSaveLifeEvent').bind('click', function () {
                $('#SaveLifeEvent').unbind('click');
                $rootScope.SendingScreenSharingDataObject(sendObj, 'edit', 'cancel', 'lifeeventdialog');
                $('#cancelSaveLifeEvent').unbind('click');
            });
            self.childMembersFilter();
        }, 500);
        return;
    }
    this.exisingdreamupdate = function (item) {
        var self = this;
        $rootScope.SendingScreenSharingDataObject($rootScope.familyMembers, 'familyMembers', 'familyMembers', '');
        $rootScope.SendingScreenSharingDataObject($rootScope.childMembers, 'childMembers', 'childMembers', '');
        if (item && item.dream_type.type == "dream") {
            $rootScope.timelineService.openEditDreamDialog(item.id);
        }
        else if (item.dream_type.type == "life_event") {
            $rootScope.timelineService.openEditLifeEventDialog(item.id);
        }
    },
    this.dreamupdated = function () {
        this.cancelHighlight();
        $('#updateDreamPanel').hide();
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
    this.onmouseclick = function () {
        var self = this;
        var item = timeline.items[item_selected_id];
        var obj = $(item.dom);
        var timeline_item_description = obj.find('.timeline_item_description');
        //console.log(obj);
        timeline_item_description.css('display', 'none');
        timeline_item_description.html("");
        //return;
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
                        $('#updateDreamPanel').hide();
                        $('#updateDreamPanel').removeClass('open');
                        $('#updateDreamPanel').css({ left: leftDisplay, top: item.top + 62 })
                        $('#updateDreamPanel').show();
                        $timeout(function () {
                            $('#updateDreamPanel').addClass('open');
                        }, 300);

                        var result = $rootScope.PersonaPlan.dreams.filter(function (obj) {
                            return obj.id == item.data_id;
                        });

                        $('#toolbox-panel').removeClass("float-btn-group");
                        $('#toolbox-panel').addClass("float-btn-group open");

                        $rootScope.timelineService.cancelHighlight();

                        $('#dream_' + result[0].dream_type_id).removeClass("red");
                        $('#dream_' + result[0].dream_type_id).addClass("highlight-dream");

                        $rootScope.SendingScreenSharingDataObject(item_selected_id, 'click', 'toolbox-panel', 'toolbox-panel');

                        return;
                    }
                    else if (item.name == "life_event") {
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
                        $('#updateDreamPanel').hide();
                        $('#updateDreamPanel').removeClass('open');
                        $('#updateDreamPanel').css({ left: leftDisplay, top: item.top + 62 })
                        $('#updateDreamPanel').show();
                        $timeout(function () {
                            $('#updateDreamPanel').addClass('open');
                        }, 300);

                        var result = $rootScope.PersonaPlan.lifeEvent.filter(function (obj) {
                            return obj.id == item.data_id;
                        });

                        $('#toolbox-panel').removeClass("float-btn-group");
                        $('#toolbox-panel').addClass("float-btn-group open");

                        $rootScope.timelineService.cancelHighlight();

                        $('#lifeevent_' + result[0].dream_type_id).removeClass("green");
                        $('#lifeevent_' + result[0].dream_type_id).addClass("highlight-lifeevent");
                        $rootScope.SendingScreenSharingDataObject(item_selected_id, 'click', 'toolbox-panel', 'toolbox-panel');
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
        $('#updateDreamPanel').hide();
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
            utilService.ShowDialog($rootScope, utilService.translate('Confirmation'), utilService.translate('Are you sure to change your age?') + " <br /> " + utilService.translate("You can't change your age after saving. Are you sure?"), utilService.translate('Yes'), $rootScope.timelineService.SaveChangeStartAge, utilService.translate('No'));
        }, 400);
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
                $rootScope.MaxStartAge = 54;//getMaxStartAge($rootScope);
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
            "content": "<img class='timeline_item_pad' src='/Themes/" + version_id + "/Content/img/pin-circle.png' /><span id='timeline_current_age_text'>" + utilService.translate("Current Age") + "</span>",
            "deleteable": false,
            "name": "start_age",
            'editable': false,
            "start_age": $rootScope.PersonaPlan.start_age
        });
        $rootScope.timelinedata.push({
            "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "content": "<img class='timeline_item_pad' src='/Themes/" + version_id + "/Content/img/pin-circle.png' /><span id='timeline_retirement_age_text'>" + utilService.translate("Retirement Age") + "</span>",
            "deleteable": false,
            "name": "retirement_age"
        });
        $rootScope.timelinedata.push({
            "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "content": "<img class='timeline_item_pad' src='/Themes/" + version_id + "/Content/img/pin-circle.png' /><span id='timeline_social_security_age_text'>" + utilService.translate("Social Annuity Age") + "</span>",
            "deleteable": false,
            "name": "social_security_age"

        });
        for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
            if ($rootScope.PersonaPlan.dreams[i].existant != true) {
                $rootScope.timelinedata.push({
                    "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.dreams[i].purchase_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
                    "content": "<img class='timeline_item_pad' src='/Themes/" + version_id + "/Content/img/pin-circle.png' /><span>" + $rootScope.PersonaPlan.dreams[i].name + "</span>",
                    "deleteable": true,
                    "name": "dream",
                    "data_id": $rootScope.PersonaPlan.dreams[i].id
                });
            }
        }
        for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
            if ($rootScope.PersonaPlan.lifeEvent[i].existant != true) {
                $rootScope.timelinedata.push({
                    "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.lifeEvent[i].starting_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
                    "content": "<div><img class='timeline_item_pad' src='/Themes/" + version_id + "/Content/img/pin-circle.png' /><span>" + $rootScope.PersonaPlan.lifeEvent[i].name + "</span><div style='display:none' class='timeline_item_description'></div></div>",
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
    this.renderTimeLine = function () {
        if (!$rootScope.profile.client.isChangedStartAge) {
            if (cashFlow.parameter != null)
                $rootScope.PersonaPlan.start_age = parseInt(cashFlow.parameter._c_age_main);
            else $rootScope.PersonaPlan.start_age = parseInt($rootScope.profile.client.age);
        }
        var steps = $rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age;
        $rootScope.options = {
            'width': '100%',
            'height': '373px',
            'heightBroken': '349px',
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
        links.events.addListener(timeline, 'change', $rootScope.timelineService.onchange);
        links.events.addListener(timeline, 'changed', $rootScope.timelineService.onchanged);
        links.events.addListener(timeline, 'delete', $rootScope.timelineService.ondeleted);
        links.events.addListener(timeline, 'mouseclick', $rootScope.timelineService.onmouseclick);
        links.events.addListener(timeline, 'mousedownclick', $rootScope.timelineService.onmousedownclick);
        links.events.addListener(timeline, 'mouseupclick', $rootScope.timelineService.onmouseupclick);
        timeline.draw($rootScope.timelinedata);
        $rootScope.timeline = timeline;
        if ($rootScope.setVisibleRangeOfTimeLine) {
            $rootScope.setVisibleRangeOfTimeLine();
        }
        timeline.onDblClick = function (event) {
            $rootScope.timelineService.ondblclick(event);
        };
        if ($('#timeline-broken-text')) {
            $('#timeline-broken-text').html($rootScope.utilService.translate("BROKE"));
        }
        $('.dropdown-totalexisting').html($rootScope.totalExisting + ' ' + utilService.translate('Existing') + '<i class="mdi-navigation-arrow-drop-down right"></i>');
    }

    this.renderBrokenAge = function () {
        if (angular.isUndefined($rootScope.MainResult)) {
            return;
        }
        //console.log('X here', $rootScope.MainResult);
        if ($rootScope.old_broken_age == null || $rootScope.old_broken_age == undefined)
            $rootScope.old_broken_age = $rootScope.MainResult.broken_age;
        if ($rootScope.old_broken_age >= $rootScope.PersonaPlan.death_age && $rootScope.MainResult.broken_age <= $rootScope.PersonaPlan.death_age) {
            if ($rootScope.isFirstLastPLayback != true) {
                utilService.showWarningMessage(utilService.translate('You will be short of cash when you are broken_age year-old', { broken_age: $rootScope.MainResult.broken_age }));
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
        $timeout(function () { utilService.ShowDialog($rootScope, utilService.translate('Reset Plan'), message, utilService.translate('Yes'), $rootScope.timelineService.ResetPlanCallback, utilService.translate('No'), $rootScope.timelineService.ResetPlanCancelCallback) }, 1);
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
            years: $filter('translate')('years')
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
        //utilService.updateDefaultValueOfDream($rootScope);        
        //utilService.updateSelectedDreamType('life_event');
        bindLifeEventtoModalDialogForDuplicate($rootScope, indexId);
        




        //utilService.updateSelectedDreamType('life_event', true);

        //utilService.updateDefaultValueOfDream($rootScope);
        //$rootScope.isEditDream = false;
        //var year = $rootScope.PersonaPlan.start_age;
        //$rootScope.timelineDropYear = $rootScope.PersonaPlan.start_age;
        
       // $rootScope.ChangeSelectListDreamType(id, 'lifeevent');
        //$rootScope.selectedLifeEvent.existant = false;
        //$rootScope.tempPhotoContent = null;
        //$rootScope.selectedLifeEvent.photo_path = null;

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
          //  $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'open', 'lifeeventdialog');
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



    this.OpenAddDreamDialog = function (id, isPresentSharing) {
        //console.log(id);
        $rootScope.selectedDreamOrLifeEvent = null;
        $rootScope.ExisingDreamSelecting = null;
        if (angular.isUndefined(isPresentSharing)) {
            $rootScope.SendingScreenSharingDataObject($rootScope.familyMembers, 'familyMembers', 'familyMembers', '');
            $rootScope.SendingScreenSharingDataObject($rootScope.childMembers, 'childMembers', 'childMembers', '');
        }
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
        if (id == 1)
            this.changeResidentialType(0);
        $timeout(function () {
            $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
            $rootScope.timelineService.mangeSlide();
            objsending.datatype = 'dream';
            objsending.objecttype = 'dream';
            if (angular.isUndefined(isPresentSharing)) {
                $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'open', 'dreamdialog');
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
            }
        }, 500);
        this.validateShowDreamRental();
    }
    this.OpenAddLifeEventDialog = function (id) {
        console.log(id);
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

        var objsending = { datatype: '', objecttype: '', year: $rootScope.timelineDropYear, id: id };
        $timeout(function () {
            $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false })
            objsending.datatype = 'lifeevent';
            objsending.objecttype = 'life_event';
            $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'open', 'lifeeventdialog');
            $('#SaveLifeEvent').bind('click', function () {
                //console.log('#SaveLifeEvent');
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
    this.OpenAddExistingAssetDialog = function () {
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
                $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
                $rootScope.timelineService.mangeSlide();
                objsending.datatype = 'dream';
                objsending.objecttype = 'dream';
                $rootScope.SendingScreenSharingDataObject(objsending, 'add', 'open', 'dreamdialog');
                $('#SaveDream').bind('click', function () {
                    $timeout(function () {
                        bindToSelectedDream($rootScope, year);
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
                    //console.log('#SaveLifeEvent');
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
        //console.log(obj, type);
        $rootScope.selectedDreamtype = findDreamTypebyId($rootScope, obj);
        $rootScope.selectedDream.photo_path = null;
        $rootScope.selectedLifeEvent.photo_path = null;
        $('#defaultDreamPhoto').removeClass('ng-hide');
        $('#DreamPhoto').parent().addClass('ng-hide');
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
    $rootScope.addLifeEventToPlayBack_open = function (dataObj) {
        $rootScope.isEditDream = false;
        utilService.scopeApply();
        utilService.updateDefaultValueOfDream($rootScope);
        utilService.updateSelectedDreamType('life_event');
        $rootScope.timelineService.childMembersFilter();
        $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length] = dataObj;
        $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan);
        
        $timeout(function () {
            $('#lifeeventdialog').modal({backdrop: 'static', keyboard: false});
        }, 1);
    }
    $rootScope.addLifeEventToPlayBack_ok = function (dataObj) {
        console.log(dataObj);
        $timeout(function () {
            var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.id);
            bindLifeEventtoModalDialog($rootScope, index, dataObj);
            bindToSelectedLifeEvent($rootScope, (dataObj.starting_age));
        }, 300);
        $timeout(function () {
            
            
            $rootScope.utilService.scopeApply();
            $rootScope.timelineService.renderTimeLine();
        }, 1000);
        $timeout(function () {
            $('#lifeeventdialog').modal('hide');
        }, 5000)
    }
    $rootScope.editDreamToPlayBack_open = function (dataObj) {
        console.log('editDreamToPlayBack_open');
        console.log(dataObj);
        if ($rootScope.functionAccess.EDIT_DREAM == 0) {
            $rootScope.EditdreamPermission = false;
        }
        else { $rootScope.EditdreamPermission = true; }
        $rootScope.isEditDream = true;
        var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.id);
        $rootScope.PersonaPlan.dreams[index] = dataObj;
        utilService.updateSelectedDreamType(dataObj.type, true);
        $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan, $rootScope.playbackService.childList);
        $timeout(function () {
            bindDreamtoModalDialog($rootScope, index, dataObj);
            $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
            $rootScope.timelineService.mangeSlide();
        }, 1);
    }

    $rootScope.editDreamToPlayBack_ok = function (dataObj) {
        console.log(dataObj);
        $timeout(function () {
            var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.id);
            
            utilService.updateSelectedDreamType(dataObj.type, true);
            bindDreamtoModalDialog($rootScope, index, dataObj);            
        }, 1);
        $timeout(function () {
            
            $rootScope.utilService.scopeApply();
            $rootScope.timelineService.renderTimeLine();
        }, 1000);
        $timeout(function () {
            $('#dreamdialog').modal('hide');
        }, 5000);
    }

    $rootScope.editLifeEventToPlayBack = function (dataObj) {
        $rootScope.editLifeEventToPlayBack_open(dataObj);
        $rootScope.editLifeEventToPlayBack_ok(dataObj);
    }

    $rootScope.editLifeEventToPlayBack_open = function (dataObj) {
        $rootScope.isEditDream = true;
        if ($rootScope.functionAccess.EDIT_LIFE_EVENT == 0) {
            $rootScope.EditLifeeventPermission = false;
        }
        else { $rootScope.EditLifeeventPermission = true; }
        var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.id);
        $rootScope.PersonaPlan.lifeEvent[index] = dataObj;
        bindLifeEventtoModalDialog($rootScope, index, dataObj);
        $timeout(function () {
            $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false });
        }, 10);
    }
    $rootScope.editLifeEventToPlayBack_ok = function (dataObj) {
        setTimeout(function () {
            $rootScope.timelineService.renderTimeLine();
            $('#lifeeventdialog').modal('hide');
        }, 5000);
        $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan);
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
        console.log(dataObj);
        $rootScope.timelineDropYear = dataObj.purchase_age;
        $rootScope.isEditDream = false;
        utilService.scopeApply();
        utilService.updateDefaultValueOfDream($rootScope);
        bindDreamtoModalDialog($rootScope, $rootScope.PersonaPlan.dreams.length - 1);
        $timeout(function () {
            // utilService.updateSelectedDreamType('dream');
            $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
            $rootScope.timelineService.mangeSlide();
        }, 1);
        $timeout(function () {
            $rootScope.timelineService.renderTimeLine();
        }, 4000);
        $timeout(function () {
            $('#dreamdialog').modal('hide');
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
                        if (obj.type == 'dream') {
                            $rootScope.timelineService.OpenAddDreamDialog(obj.newValue.id, true);
                        } else if (obj.type == 'lifeevent') {
                            $rootScope.tempPhotoContent = null;
                            $rootScope.isEditDream = false;
                            $rootScope.timelineDropYear = parseInt(obj.newValue.year);
                            utilService.updateDefaultValueOfDream($rootScope);
                            utilService.updateSelectedDreamType(obj.newValue.objecttype);
                            $rootScope.ChangeSelectListDreamType(obj.newValue.id, 'dream');
                            $rootScope.selectedLifeEvent.photo_path = null;
                            $timeout(function () {
                                $('#' + obj.controlID).modal({ backdrop: 'static', keyboard: false });
                                $rootScope.timelineService.mangeSlide('false');
                            }, 500);
                        }
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
                            $('#updateDreamPanel').hide();
                            $('#updateDreamPanel').removeClass('open');
                            $('#updateDreamPanel').css({ left: leftDisplay, top: item.top + 62 })
                            $('#updateDreamPanel').show();
                            $timeout(function () {
                                $('#updateDreamPanel').addClass('open');
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
                            $rootScope.isEditDream = true;
                            index = getIndexOfDataId($rootScope, obj.name, obj.newValue.id);
                            utilService.updateSelectedDreamType(obj.name, true);
                            if (obj.name == 'dream') {
                                $rootScope.timelineService.openEditDreamDialog(obj.newValue.id);
                            }
                            else {
                                if ($rootScope.functionAccess.EDIT_LIFE_EVENT == 0) {
                                    $rootScope.EditLifeeventPermission = false;
                                }
                                else { $rootScope.EditLifeeventPermission = true; }
                                $rootScope.timelineService.openEditLifeEventDialog(obj.newValue.id);
                            }
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
                        else {
                            console.log('Ok dialog :', obj);
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
            case 'AllData':
                $rootScope.ApplyAllData(obj.newValue);
                break;
            case 'zoom':
                switch (obj.actionEvent) {
                    case 'changeMinAge':
                        $rootScope.zoomData.minAge = obj.newValue;
                        break;
                    case 'changeMaxAge':
                        $rootScope.zoomData.maxAge = obj.newValue;
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
                        newValue = obj.datatype == 'dream' ? $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length - 1] : $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length - 1];
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
        //console.log('changeDreamDuration', duration);
        if (duration == 0) {
            angular.forEach(rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
                if (item.field_name == "down_payment") {
                    item.backup_value = angular.copy(item.value);
                    item.value = 0;
                }
            });
        } else {
            angular.forEach(rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
                if (item.field_name == "down_payment") {
                    if (angular.isDefined(item.backup_value)) {
                        item.value = angular.copy(item.backup_value);
                        delete item.backup_value;
                    }

                }
            });
        }
    }

    $rootScope.timelineChangeChildMemember = function (child) {
        if (child == null) {
            angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
                // Update age dependent
                if (item.field_name == 'age_dependent') {
                    item.value = null;
                }
                // Update your age
                if (item.field_name == 'starting_age') {
                    item.value = 200;
                }
                // Update cost deduction
                if (item.field_name == 'yearly_cost_reduction') {
                    item.value = 0;
                }
            })
        } else {
            var childObj = null;
            var childIndex = -1;
            if ($rootScope.profile.children.childrens.length > 0) {
                for (var i = 0; i < $rootScope.profile.children.childrens.length; i++) {
                    if (('child_' + $rootScope.profile.children.childrens[i].id) == child) {
                        childObj = $rootScope.profile.children.childrens[i];
                        childIndex = i + 1;
                        break;
                    }
                }
            }

            if (childObj != null) {
                var age_dependent = 0;
                angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
                    // Update age dependent
                    if (item.field_name == 'age_dependent') {
                        if (angular.isDefined($rootScope.cashFlow.parameter['_c_ind_child_' + childIndex])) {
                            age_dependent = parseInt($rootScope.cashFlow.parameter['_c_ind_child_' + childIndex]);
                        }
                        item.value = age_dependent;
                    }
                    // Update your age
                    if (item.field_name == 'starting_age') {
                        item.value = $rootScope.PersonaPlan.start_age + age_dependent - childObj.age;
                    }

                    // Update cost deduction
                    if (item.field_name == 'yearly_cost_reduction') {
                        item.value = utilService.calculateExpenseOfChild(childIndex) * 12;
                    }
                });
            }
        }
    }

    $rootScope.timelineChangeAgeOfDependent = function (age) {
        // Find child and starting age
        var startingAge = null, dependent_reference = null;
        angular.forEach($rootScope.selectedDreamtype.dreamTypeConfig, function (item) {
            // dependent_reference
            if (item.field_name == 'dependent_reference') {
                dependent_reference = item;
            }

            // starting_age
            if (item.field_name == 'starting_age') {
                startingAge = item;
            }
        });
        // Update stating Age
        if (dependent_reference != null && dependent_reference.value != null && dependent_reference.value.indexOf('child') >= 0) {
            var childObj = null;
            if ($rootScope.profile.children.childrens.length > 0) {
                for (var i = 0; i < $rootScope.profile.children.childrens.length; i++) {
                    if (('child_' + $rootScope.profile.children.childrens[i].id) == dependent_reference.value) {
                        childObj = $rootScope.profile.children.childrens[i];
                        break;
                    }
                }
            }
            if (childObj != null) {
                if (age == null) {
                    startingAge.value = 200;
                } else {
                    startingAge.value = $rootScope.PersonaPlan.start_age + age - childObj.age;
                }
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
        //console.log('closeManual');
        $('#updateDreamPanel').removeClass('open');
        var self = this;
        $timeout(function () {
            self.cancelHighlight();
            $('#updateDreamPanel').hide();
        }, 1000);
    }


    return this;
});