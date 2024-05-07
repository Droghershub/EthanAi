function findDreamTypebyId($rootScope, id) {
    var dream_type_length = $rootScope.DreamTypes == null ? 0 : $rootScope.DreamTypes.length;
    for (i = 0; i < dream_type_length ; i++) {
        if ($rootScope.DreamTypes[i].id == id) {
            return $rootScope.DreamTypes[i];
        }
    }
    return null;
}

function bindDreamtoModalDialog($rootScope, index, mocData) {
    var dream = $rootScope.PersonaPlan.dreams[index];
    var dream_type_id = dream.dream_type_id == null ? $rootScope.PersonaPlan.start_age : dream.dream_type_id;
    $rootScope.selectedDreamtype = findDreamTypebyId($rootScope, dream_type_id);
    if (typeof mocData != 'undefined')
        dream = mocData;
    var fieldName = '';
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        $rootScope.selectedDreamtype.dreamTypeConfig[i].value = dream[fieldName];        
    }
}
function bindLifeEventtoModalDialog($rootScope, index, dataObj) {

    var lifeevent = $rootScope.PersonaPlan.lifeEvent[index];
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
}
function bindDreamfromModalDialog($rootScope, index) {
    var fieldName = '';
    var objvalue;
    var value;
    for (i = 0; i < $rootScope.selectedDreamtype.dreamTypeConfig.length; i++) {
        fieldName = $rootScope.selectedDreamtype.dreamTypeConfig[i].field_name;
        objvalue = $rootScope.selectedDreamtype.dreamTypeConfig[i].value;        
        value = objvalue == undefined ? $rootScope.selectedDreamtype.dreamTypeConfig[i].default_value : objvalue;
        $rootScope.PersonaPlan.dreams[index][fieldName] = value;        
    }

}
function bindToSelectedDream($rootScope, year) {

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
        value = objvalue == undefined ? $rootScope.selectedDreamtype.dreamTypeConfig[i].default_value : objvalue;
        $rootScope.selectedDream[fieldName] = value;        
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
}
function bindToSelectedLifeEvent($rootScope, year) {
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
            $rootScope.selectedLifeEvent[fieldName] = value;
        }        
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