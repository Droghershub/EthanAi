function findDreamTypebyId($rootScope, id) {
    var dream_type_length = $rootScope.DreamTypes == null ? 0 : $rootScope.DreamTypes.length;
    for (i = 0; i < dream_type_length ; i++) {
        if ($rootScope.DreamTypes[i].id == id) {
            $rootScope.DreamTypes[i].existant = false;
            return $rootScope.DreamTypes[i];
        }
    }
    return null;
}

function bindDreamtoModalDialogForDuplicate($rootScope, index, mocData) {
    var dream = $rootScope.PersonaPlan.dreams[index];
    var dream_type_id = dream.dream_type_id == null ? $rootScope.PersonaPlan.start_age : dream.dream_type_id;
    $rootScope.selectedDreamtype = findDreamTypebyId($rootScope, dream_type_id);
    if (typeof mocData != 'undefined')
        dream = mocData;
    var fieldName = '';
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        if (fieldName == 'name') {

        }
        else {
            $rootScope.selectedDreamtype.dreamTypeConfig[i].value = dream[fieldName];
            if (fieldName == 'existant') {
                $rootScope.selectedDream.existant = dream[fieldName];
            }
        }
    }
    $rootScope.selectedDream.photo_path = dream.photo_path;
    $rootScope.selectedDream.residential_type = dream.residential_type;
    if (typeof (dream.photoContent) != undefined && dream.photoContent != null) {
        $rootScope.selectedDream.photo_path = dream.photoContent;
    }


    var fieldName = '', value, dream_rental_value = false;
    if ($('#dream_rental_value').val() == 'true') {
        dream_rental_value = true;
    }
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;

        if (dream_rental_value == false) {
            if (fieldName == 'rental_net_income') {
                $rootScope.selectedDreamtype.dreamTypeConfig[i].value = $rootScope.selectedDreamtype.dreamTypeConfig[i].default_value;
            }
        }

    }
    //console.log($rootScope.selectedDreamtype);
    $rootScope.backUpSelectedDream = angular.copy(dream);
    //console.log($rootScope.backUpSelectedDream);

}

function bindDreamtoModalDialog($rootScope, index, mocData) {
    var dream = $rootScope.PersonaPlan.dreams[index];
    // console.log(dream);
    var dream_type_id = dream.dream_type_id == null ? $rootScope.PersonaPlan.start_age : dream.dream_type_id;
    $rootScope.selectedDreamtype = findDreamTypebyId($rootScope, dream_type_id);
    if (typeof mocData != 'undefined')
        dream = mocData;
    var fieldName = '';
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        $rootScope.selectedDreamtype.dreamTypeConfig[i].value = dream[fieldName];
        // console.log($rootScope.selectedDreamtype.dreamTypeConfig[i].value);
        if (fieldName == 'existant') {
            $rootScope.selectedDream.existant = dream[fieldName];
        }
    }
    $rootScope.selectedDream.photo_path = dream.photo_path;
    $rootScope.selectedDream.residential_type = dream.residential_type;
    if (typeof (dream.photoContent) != undefined && dream.photoContent != null) {
        $rootScope.selectedDream.photo_path = dream.photoContent;
    }


    var fieldName = '', value, dream_rental_value = false;
    if ($('#dream_rental_value').val() == 'true') {
        dream_rental_value = true;
    }
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        if (dream_rental_value == false) {
            if (fieldName == 'rental_net_income') {
                $rootScope.selectedDreamtype.dreamTypeConfig[i].value = $rootScope.selectedDreamtype.dreamTypeConfig[i].default_value;
            }
        }
    }
    //console.log($rootScope.selectedDreamtype);
    $rootScope.backUpSelectedDream = angular.copy(dream);
    //console.log($rootScope.backUpSelectedDream);

}

function bindLifeEventtoModalDialogForDuplicate($rootScope, index, dataObj) {
    var lifeevent = $rootScope.PersonaPlan.lifeEvent[index];

    $rootScope.selectedDreamOrLifeEvent = lifeevent;
    console.log($rootScope.selectedDreamOrLifeEvent);

    if (dataObj != undefined)
        lifeevent = dataObj;
    var dream_type_id = lifeevent.dream_type_id;
    $rootScope.selectedDreamtype = findDreamTypebyId($rootScope, dream_type_id);
    var fieldName = '';
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        if (fieldName == 'selected_residence' || fieldName == 'dependent_reference' || fieldName == 'name') {
            //$rootScope.selectedDreamtype.dreamTypeConfig[i].value = lifeevent.dream_id;
        }
        else {
            $rootScope.selectedDreamtype.dreamTypeConfig[i].value = lifeevent[fieldName];
        }
    }
    $rootScope.selectedLifeEvent.photo_path = lifeevent.photo_path;
    if (typeof (lifeevent.photoContent) != undefined && lifeevent.photoContent != null) {
        $rootScope.selectedLifeEvent.photo_path = lifeevent.photoContent;
    }

    $rootScope.backUpLifeEvent = angular.copy(lifeevent)
    //console.log($rootScope.backUpLifeEvent);
}

function bindLifeEventtoModalDialog($rootScope, index, dataObj) {
    var lifeevent = $rootScope.PersonaPlan.lifeEvent[index];

    $rootScope.selectedDreamOrLifeEvent = lifeevent;
    console.log($rootScope.selectedDreamOrLifeEvent);

    if (dataObj != undefined)
        lifeevent = dataObj;
    var dream_type_id = lifeevent.dream_type_id;
    $rootScope.selectedDreamtype = findDreamTypebyId($rootScope, dream_type_id);
    var fieldName = '';
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        if (fieldName == 'selected_residence') {
            $rootScope.selectedDreamtype.dreamTypeConfig[i].value = lifeevent.dream_id;
        }
        else {
            $rootScope.selectedDreamtype.dreamTypeConfig[i].value = lifeevent[fieldName];
        }
    }
    $rootScope.selectedLifeEvent.photo_path = lifeevent.photo_path;
    if (typeof (lifeevent.photoContent) != undefined && lifeevent.photoContent != null) {
        $rootScope.selectedLifeEvent.photo_path = lifeevent.photoContent;
    }

    $rootScope.backUpLifeEvent = angular.copy(lifeevent)
    //console.log($rootScope.backUpLifeEvent);
}
function bindDreamfromModalDialog($rootScope, index) {
    var fieldName = '', objvalue, value, dream_rental_value = false;
    if ($('#dream_rental_value').val() == 'true') {
        dream_rental_value = true;
    }
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        objvalue = $rootScope.selectedDreamtype.dreamTypeConfig[i].value;
        value = objvalue == undefined ? $rootScope.selectedDreamtype.dreamTypeConfig[i].default_value : objvalue;
        if (dream_rental_value == false) {
            if (fieldName == 'rental_net_income') {
                value = 0.0;
            }
        }
        $rootScope.PersonaPlan.dreams[index][fieldName] = value;
    }
    $rootScope.PersonaPlan.dreams[index]['existant'] = $rootScope.selectedDream.existant;
    $rootScope.PersonaPlan.dreams[index]['photo_path'] = $rootScope.selectedDream.photo_path;
    $rootScope.PersonaPlan.dreams[index]['residential_type'] = $rootScope.selectedDream.residential_type;
    $rootScope.PersonaPlan.dreams[index]['photoContent'] = $rootScope.tempPhotoContent;
    if ($rootScope.selectedDream.existant == true) {
        $rootScope.PersonaPlan.dreams[index]['purchase_age'] = $rootScope.PersonaPlan.start_age;
    }
}
function bindToSelectedDream($rootScope, year) {
    var bkselect = angular.copy($rootScope.selectedDream);    
    $rootScope.selectedDream = null;    
    $rootScope.selectedDream = angular.copy($rootScope.backupselectedDream);
    $rootScope.selectedDream.dream_type = $rootScope.selectedDreamtype;
    $rootScope.selectedDream.dream_type_id = $rootScope.selectedDreamtype.id;
    $rootScope.selectedDream.persona_plan_id = $rootScope.PersonaPlan.id;

    var fieldName = '';
    var objvalue;
    var value;
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        objvalue = $rootScope.selectedDreamtype.dreamTypeConfig[i].value;
        /*if (fieldName == 'down_payment' || fieldName=='transaction_cost' || fieldName=='mortage_interest_rate' || fieldName=='yearly_expenses' || fieldName=='rental_net_income' )
            objvalue = parseFloat(objvalue) / 100;
        */
        value = objvalue == undefined ? $rootScope.selectedDreamtype.dreamTypeConfig[i].default_value : objvalue;
        $rootScope.selectedDream[fieldName] = value;
    }
    if (bkselect.existant != null && bkselect.existant != false) {
        $rootScope.selectedDream.existant = bkselect.existant;

        $rootScope.selectedDream.purchase_age = $rootScope.PersonaPlan.start_age;
    }
    $rootScope.selectedDream.residential_type = bkselect.residential_type;
    $rootScope.selectedDream.photo_path = bkselect.photo_path;
    if ($rootScope.selectedDream.is_rent == false) {
        $rootScope.selectedDream.rental_net_income = 0.0;
    }

}

function bindLifeEventfromModalDialog($rootScope, index) {
    var fieldName = '';
    var objvalue;
    var value;
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        objvalue = $rootScope.selectedDreamtype.dreamTypeConfig[i].value;
        value = objvalue == undefined ? $rootScope.selectedDreamtype.dreamTypeConfig[i].default_value : objvalue;
        if (fieldName == 'selected_residence') {
            $rootScope.PersonaPlan.lifeEvent[index].dream_id = value;
        } else {
            $rootScope.PersonaPlan.lifeEvent[index][fieldName] = value;
        }
    }
    $rootScope.PersonaPlan.lifeEvent[index]['photo_path'] = $rootScope.selectedLifeEvent.photo_path;
    if ($rootScope.PersonaPlan.lifeEvent[index].existant == true) {
        $rootScope.PersonaPlan.lifeEvent[index].starting_age = $rootScope.PersonaPlan.start_age;
    }
    $rootScope.PersonaPlan.lifeEvent[index]['photoContent'] = $rootScope.tempPhotoContent;
}
function bindToSelectedLifeEvent($rootScope, year) {
    var bkselect = angular.copy($rootScope.selectedLifeEvent);
    $rootScope.selectedLifeEvent = null;
    $rootScope.selectedLifeEvent = angular.copy($rootScope.backupselectedLifeEvent);
    $rootScope.selectedLifeEvent.dream_type = $rootScope.selectedDreamtype;
    $rootScope.selectedLifeEvent.dream_type_id = $rootScope.selectedDreamtype.id;
    $rootScope.selectedLifeEvent.persona_plan_id = $rootScope.PersonaPlan.id;

    var fieldName = '';
    var objvalue;
    var value;
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        objvalue = $rootScope.selectedDreamtype.dreamTypeConfig[i].value;
        value = objvalue == undefined ? $rootScope.selectedDreamtype.dreamTypeConfig[i].default_value : objvalue;
        if (fieldName == 'selected_residence') {
            $rootScope.selectedLifeEvent.dream_id = value;
        } else {
            /* if (fieldName == 'transaction_tax' || fieldName == 'transaction_cost' || fieldName =='yearly_cost_reduction') {
                 value = parseFloat(value) / 100;
             }*/
            $rootScope.selectedLifeEvent[fieldName] = value;
        }
    }
    rootScope.selectedLifeEvent.photo_path = bkselect.photo_path;
    if ($rootScope.selectedDream.existant != null && $rootScope.selectedDream.existant != false) {
        $rootScope.selectedLifeEvent.existant = $rootScope.selectedDream.existant;
        $rootScope.selectedLifeEvent.starting_age = $rootScope.PersonaPlan.start_age;
    }
}
function getIndexOfDataId($rootScope, type, dataid) {
    if (type == 'dream') {
        if ($rootScope.PersonaPlan.dreams == null || $rootScope.PersonaPlan.dreams.length == 0)
            return -1;
        for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
            if ($rootScope.PersonaPlan.dreams[i].id == dataid)
                return i;

        }
        return $rootScope.PersonaPlan.dreams.length - 1;
    }
    else {
        if ($rootScope.PersonaPlan.lifeEvent == null || $rootScope.PersonaPlan.lifeEvent.length == 0)
            return -1;
        for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
            if ($rootScope.PersonaPlan.lifeEvent[i].id == dataid)
                return i;

        }
        return $rootScope.PersonaPlan.lifeEvent.length - 1;
    }
    return -1;
}
function findLifeEventByDreamId($rootScope, dream_id) {
    var nCount = $rootScope.PersonaPlan.lifeEvent == null ? 0 : $rootScope.PersonaPlan.lifeEvent.length;
    if (nCount <= 0)
        return null;
    for (var i = 0; i < nCount; i++) {
        if ($rootScope.PersonaPlan.lifeEvent[i].dream_id == dream_id)
            return $rootScope.PersonaPlan.lifeEvent[i];
    }
    return null;
}
function getMaxStartAge($rootScope) {
    var max = 70;//default;
    if (max > $rootScope.PersonaPlan.retirement_age)
        max = $rootScope.PersonaPlan.retirement_age;
    if (max > $rootScope.PersonaPlan.social_security_age) {
        max = $rootScope.PersonaPlan.social_security_age;
    }
    for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
        if (max > $rootScope.PersonaPlan.dreams[i].purchase_age)
            max = $rootScope.PersonaPlan.dreams[i].purchase_age;
    }
    for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
        if (max > $rootScope.PersonaPlan.lifeEvent[i].starting_age)
            max = $rootScope.PersonaPlan.lifeEvent[i].starting_age;
    }
    return max;
}
function displayPercentSocialSecurity($rootScope) {
    return 50 + ($rootScope.PersonaPlan.social_security_age - 60) + '%';
}