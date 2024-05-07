function ReUpdateForControlById(controlId) {
    if (document.getElementById(controlId) != undefined)
        angular.element(document.getElementById(controlId)).scope().callfromOutsite();
}
function ReUpdateForControlByIdForSharing(controlId, actionEvent, obj) {
    if (document.getElementById(controlId) != undefined)
        angular.element(document.getElementById(controlId)).scope().callfromOutsiteForSharing(actionEvent, obj);
}
function CalculateAgeObjectList($rootScope) {
    console.log('CalculateAgeObjectList');
    $rootScope.AgeObjectList = [];
    if ($rootScope.profile.client.marital_status ==1 && $rootScope.profile != null && $rootScope.profile.spouse != null && $rootScope.profile.spouse.age != null) {
        if ($rootScope.AgeObjectList['object' + (60 - $rootScope.profile.spouse.age + $rootScope.PersonaPlan.start_age).toString()] === undefined)
            $rootScope.AgeObjectList['object' + (60 - $rootScope.profile.spouse.age + $rootScope.PersonaPlan.start_age).toString()] = [];
        $rootScope.AgeObjectList['object' + (60 - $rootScope.profile.spouse.age + $rootScope.PersonaPlan.start_age).toString()].push('RetirementAgeOfSpouse');
    }
    for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
        if ($rootScope.AgeObjectList['object' + $rootScope.PersonaPlan.dreams[i].purchase_age.toString()] === undefined)
            $rootScope.AgeObjectList['object' + $rootScope.PersonaPlan.dreams[i].purchase_age.toString()] = [];
        $rootScope.AgeObjectList['object' + $rootScope.PersonaPlan.dreams[i].purchase_age.toString()].push('dream_' + $rootScope.PersonaPlan.dreams[i].id);
    }
    for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
        if ($rootScope.AgeObjectList['object' + $rootScope.PersonaPlan.lifeEvent[i].starting_age.toString()] === undefined)
            $rootScope.AgeObjectList['object' + $rootScope.PersonaPlan.lifeEvent[i].starting_age.toString()] = [];
        $rootScope.AgeObjectList['object' + $rootScope.PersonaPlan.lifeEvent[i].starting_age.toString()].push('lifeevent_' + $rootScope.PersonaPlan.lifeEvent[i].id);
    }
    if ($rootScope.AgeObjectList['object' + $rootScope.PersonaPlan.retirement_age.toString()] === undefined)
        $rootScope.AgeObjectList['object' + $rootScope.PersonaPlan.retirement_age.toString()] = [];
    $rootScope.AgeObjectList['object' + $rootScope.PersonaPlan.retirement_age.toString()].push('retirement_age');
    return $rootScope.AgeObjectList;
}
function findIndexOfName($rootScope, key, objectName) {
    var listName = $rootScope.AgeObjectList[key];
    if (listName != null && listName != undefined) {
        for (var i = 0 ; i < listName.length; i++) {
            if (listName[i] == objectName)
                return i;
        }
    }
    return -1;
}
function findCanvasObjectByName(canvas, name) {
    for (var i = 0; i < canvas.children.length; i++) {
        if (canvas.children[i].name && canvas.children[i].name.toString() == name)
            return canvas.children[i];
    }
    return null;
}
function deleteAllArrowButton(canvas) {
    for (var i = canvas.children.length - 1; i >= 0; i--) {
        if (canvas.children[i].datatype == 'arrowdown')
            canvas.removeChild(canvas.children[i]);
    }
}
function OrderCanvasItem($rootScope, canvas) {
    deleteAllArrowButton(canvas);
    CalculateAgeObjectList($rootScope);
    var keys = Object.keys($rootScope.AgeObjectList);
    for (var i = 0 ; i < keys.length ; i++) {
        var year = keys[i].substring('object'.length, keys[i].length);
        HiddenTimeLineObjectByYear($rootScope, canvas, year);
    }    
}
function HiddenTimeLineObjectByYear($rootScope, canvas, year) {
    var key = 'object' + year.toString();
    var listname = $rootScope.AgeObjectList[key];
    if (listname) {
        for (var i = 0; i < listname.length - 1; i++) {
            var obj = findCanvasObjectByName(canvas, listname[i]);
            if (obj != null) {
                obj.y = -100;
            }
        }
        var firstObj = findCanvasObjectByName(canvas, listname[listname.length - 1]);
        if (firstObj) {
            firstObj.y = $rootScope.timelineControl.startY;
            if (firstObj.datatype == 'retireAgeRect')
                firstObj.y = $rootScope.timelineControl.startY + 3;
        }            
    }
    if (listname && listname.length > 1) {
        var arrow = findCanvasTimeLineObject(canvas, 'arrowdown', year);
        if (arrow == null) {
            InitArrowDownButton(year, $rootScope, canvas); 
        }
    }
    if (listname && listname.length < 2) {
        var arrow = findCanvasTimeLineObject(canvas, 'arrowdown', year);        
        if (arrow) {
            canvas.removeChild(arrow);
        }
    }
}
function addObjectToAgeObjectList($rootScope, canvas, year, name) {
    var keydestination = 'object' + year;
    if ($rootScope.AgeObjectList[keydestination] === undefined)
        $rootScope.AgeObjectList[keydestination] = [];
    var isAdd = false;
    for (var i = 0 ; i < $rootScope.AgeObjectList[keydestination].length; i++) {
        if ($rootScope.AgeObjectList[keydestination][i] == name)
            isAdd = true;
    }
    if (!isAdd)
        $rootScope.AgeObjectList[keydestination].push(name);
    HiddenTimeLineObjectByYear($rootScope, canvas, parseInt(year));
    $rootScope.SendingScreenSharingDataObject({ year: year, name: name }, 'arrowdown', 'arrowdownshow');
}

function removeObjectToAge($rootScope,canvas, year, objname) {
    var key = 'object' + year; 
    if (objname != null && objname != undefined) {
        var index = findIndexOfName($rootScope, key, objname);
        var listname = $rootScope.AgeObjectList[key];
        if (listname != null && listname != undefined) {
            $rootScope.AgeObjectList[key].splice(index, 1);
        }
        HiddenTimeLineObjectByYear($rootScope, canvas, year);
        $rootScope.SendingScreenSharingDataObject({ year: year, name: objname }, 'arrowdown', 'arrowdownremove');
    }
}
function InitButtonObject(canvas, x, y, text, fillColor, $rootScope, $timeout) {
    var child = canvas.display.text({
        x: 55,
        y: 15,
        origin: { x: "center", y: "center" },
        font: "bold 13px sans-serif",
        text: text,
        fill: "white"
    });
    var obj = canvas.display.rectangle({
        x: x,
        y: y,
        width: 110,
        height: 30,
        fill: fillColor
    });
    obj.addChild(child);
    return obj;
}
function InitArrowDownButton(year, $rootScope, canvas) {
    var _x = 0;
    if ($rootScope.zoomData.isShow) {
        if (year >= $rootScope.zoomData.minAge && year <= $rootScope.zoomData.maxAge) {
            _x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * (year - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
        }
        else _x = -200;
    }
    else {
        _x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (year - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
    }

    var item = canvas.display.image({
        x: _x,
        y: $rootScope.timelineControl.startY + 61,
        width: 20,
        height: 20,
        pixelBegin: $rootScope.timelineControl.startX,
        pixelEnd: $rootScope.timelineControl.endX,
        strokeWidth: 0,
        strokeColor: 'red',
        datatype: 'arrowdown',
        dataid: year,
        beginingYear: $rootScope.PersonaPlan.start_age,
        pixel: ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age) / ($rootScope.timelineControl.endX - $rootScope.timelineControl.startX),
        origin: {
            x: "center", y: "center"
        },
        image: "Content/images/arrow-down.png"
    });
    canvas.addChild(item);
    item.bind('click tap', function () {   
        var key = 'object' + this.dataid;
        CalculateAgeObjectList($rootScope); 
        displayObjectByKey($rootScope,key,canvas); 
        $rootScope.SendingScreenSharingDataObject(key, 'arrowdown', 'click'); 
    });

}

function displayObjectByKey($rootScope,key,canvas)
{ 
    var listname = $rootScope.AgeObjectList[key];
    var indexActive = 0;
    for (var j = 0; j < listname.length; j++) {
        var obj = findCanvasObjectByName(canvas, listname[j]);
        if (obj != null && obj.y != -100) {
            indexActive = j;
            break;
        }
    }

    var objOld = findCanvasObjectByName(canvas, listname[indexActive]);
    if (objOld != null) {
        objOld.y = -100;
    }

    if (indexActive + 1 < listname.length) {
        indexActive = indexActive + 1;
    }
    else {
        indexActive = 0
    }
    var objNew = findCanvasObjectByName(canvas, listname[indexActive]);
    if (objNew) {
        objNew.y = $rootScope.timelineControl.startY;
        if (objNew.datatype == 'retireAgeRect')
            objNew.y = $rootScope.timelineControl.startY + 3;
    }
}

function displayObjectByName($rootScope, name, canvas) {  
    var item = findCanvasObjectByName(canvas, name);
    var year = item.children[0].text;
    var listname = $rootScope.AgeObjectList['object'+year];
    var indexActive = 0;
    for (var j = 0; j < listname.length; j++) {
        var obj = findCanvasObjectByName(canvas, listname[j]);
        if ((obj.datatype +'_'+ obj.dataid) === name) {
            obj.y = $rootScope.timelineControl.startY;
        }
        else if (name === 'retirement_age' && obj.datatype === 'retirement')
        {
            obj.y = $rootScope.timelineControl.startY;
        }
        else
            obj.y = -100;
    }
    
}

function initStartObject(canvas, $rootScope, $timeout) {
    $rootScope.old_broken_age = 0;

    var obj = canvas.display.rectangle({
        x: 0,
        y: 90,
        width: 70,
        height: 105,
        fill: "transparent",
        name: 'start_age',
        datatype: 'start_age'
    });
    
    var options = {
        start: function () {
            if ($rootScope.functionAccess.CHANGE_START_AGE != 1) {
                $rootScope.functionAccess.showErrorMessage();
                this.dragging = false;                
                return;
            }
                
            $rootScope.x = canvas.mouse.x == 0 ? canvas.touch.x : canvas.mouse.x;
            $rootScope.y = canvas.mouse.y == 0 ? canvas.touch.y : canvas.mouse.y;
        },
        move: function () {           
            $timeout(function () {
                var x = canvas.mouse.x == 0 ? canvas.touch.x : canvas.mouse.x;
                var year = parseInt(canvas.children[0].text);
                if ($rootScope.x > x + 10) {
                    if (year > 18) year--;
                }
                if ($rootScope.x < x + 10) { 
                    if (year < getMaxStartAge($rootScope)) year++; 
                } 
                canvas.children[0].text = year;
                var objBegining = {
                    children: [
                      { text: year },
                    ],
                    datatype: 'begining',
                    name: 'begining'
                };
                $rootScope.PersonaPlan.start_age = year;
                reRenderTimelineObject(canvas, $rootScope);
                OrderCanvasItem($rootScope, canvas);
                $rootScope.SendingScreenSharingDataObject(objBegining, 'move', 'moving');
            }, 10);
        },
        end: function () {            
            $rootScope.PersonaPlan.ClientActionType = 'ChangeStartAge';
            reRenderTimelineObject(canvas, $rootScope);
            OrderCanvasItem($rootScope, canvas);
            $rootScope.Settings.isAjaxInstantRequest = true;
            $rootScope.requestSaveAndUpdateScreen();
            this.x = 0;
            this.y = 90;
            var item = { 
                year: $rootScope.PersonaPlan.start_age,
                children: [
                     { text: $rootScope.PersonaPlan.start_age },
                ]
                 ,
                datatype: 'begining',
                name: 'begining'
            };
            $rootScope.SendingScreenSharingDataObject(item, 'move', 'end');
        }
    }
    
    obj.dragAndDrop(options);
    obj.bind('dblclick dbltap', function () {
        if ($rootScope.functionAccess.CHANGE_START_AGE == null || $rootScope.functionAccess.CHANGE_START_AGE == undefined) {
                $rootScope.functionAccess.showErrorMessage();
                this.dragging = false;
                return;
            }
            $rootScope.PersonaPlan.ClientActionType = 'ChangeStartAge';
            $rootScope.MaxStartAge = getMaxStartAge($rootScope);
            $rootScope.MinStartAge = 18;

            var currentStartAge = $rootScope.PersonaPlan.start_age;
            $rootScope.form_start_age = currentStartAge;
            $timeout(function () {
                $('#StartAgeDialog').modal({ backdrop: 'static', keyboard: false });
                $rootScope.SendingScreenSharingDataObject(obj, 'edit', 'open', 'StartAgeDialog');

                $('#OkUpdateStartAge').bind('click', function () {
                    $rootScope.PersonaPlan.start_age = $rootScope.form_start_age;
                    canvas.children[0].text = $rootScope.PersonaPlan.start_age;
                    reRenderTimelineObject(canvas, $rootScope);
                    OrderCanvasItem($rootScope, canvas);
                    $rootScope.Settings.isAjaxInstantRequest = true;
                    $rootScope.requestSaveAndUpdateScreen();
                    $('#cancelUpdateStartAge').unbind('click');
                    $('#OkUpdateStartAge').unbind('click');
                    $rootScope.SendingScreenSharingDataObject(obj, 'edit', 'ok', 'StartAgeDialog');
                });
                $('#cancelUpdateStartAge').bind('click', function () {
                    $rootScope.PersonaPlan.start_age = currentStartAge;
                    $('#cancelUpdateStartAge').unbind('click');
                    $('#OkUpdateStartAge').unbind('click');
                    $rootScope.SendingScreenSharingDataObject(obj, 'edit', 'cancel', 'StartAgeDialog');
                });
            }, 50);
        });
    
    return obj;
}
function initYear(canvas, $rootScope, year, x, width, color, type) {
    var textType = 'begining';
    if (angular.isDefined(type)) {
        textType = type;
    }
    
    var textColor = "red";

    if (angular.isDefined(color)) {
        textColor = color;
    }
    var objyear = canvas.display.text({
        textType: type,
        x: x,
        y: $rootScope.timelineControl.startY - 60,
        origin: { x: "center", y: "top" },
        font: "bold 13px sans-serif",
        size: width,
        text: year,
        fill: textColor,
        name: textType,
    });
    return objyear;
}

function initTimeLineItem(canvas, $rootScope, year, name, isRetire, isMovable, imagePath, type, index, dataid, utilService, $timeout) {
    $rootScope.clientActionObjectId = null;
    $rootScope.clientActionObjectEvent = null;

    var startNumber = $rootScope.PersonaPlan.start_age;
    var endNumber = $rootScope.PersonaPlan.death_age;
    if ($rootScope.zoomData.isShow) {
        startNumber = $rootScope.zoomData.minAge;
        endNumber = $rootScope.zoomData.maxAge;
    }
    console.log(year);
    var child = canvas.display.text({
        x: 0,
        y: -60,
        origin: { x: "center", y: "top" },
        font: "bold 13px sans-serif",
        text: year,
        fill: "#0aa"
    });
    var item;
    if (type != undefined && type == 'retireAgeRect') {
        child = canvas.display.text({
            x: 0,
            y: -63,
            origin: { x: "center", y: "top" },
            font: "bold 13px sans-serif",
            text: year,
            fill: "#0aa"
        });
        var displayPercent = canvas.display.text({
            x: 8,
            y: 30,
            origin: { x: "left", y: "top" },
            font: "bold 13px sans-serif",
            text: displayPercentSocialSecurity($rootScope),
            fill: "red"
        });
        item = canvas.display.rectangle({
            x: (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / (endNumber - startNumber)) * (year - startNumber) + $rootScope.timelineControl.startX,
            pixelBegin: $rootScope.timelineControl.startX,
            pixelEnd: $rootScope.timelineControl.endX,
            y: $rootScope.timelineControl.startY + 3,
            pixel: (endNumber - startNumber) / ($rootScope.timelineControl.endX - $rootScope.timelineControl.startX),
            beginingYear: startNumber,
            isRetire: isRetire,
            isMovable: isMovable,
            origin: { x: "center", y: "center" },
            width: 10,
            height: 89.5,
            fill: "#66bb6a",
            strokeWidth: 0,
            strokeColor: 'red',
            textType: "retireAgeRect",
            name: name,
            datatype: type
        });
        item.addChild(child);
        item.addChild(displayPercent);
    } else {
        item = canvas.display.image({
            x: (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / (endNumber - startNumber)) * (year - startNumber) + $rootScope.timelineControl.startX,
            y: $rootScope.timelineControl.startY,
            pixelBegin: $rootScope.timelineControl.startX,
            pixelEnd: $rootScope.timelineControl.endX,
            isRetire: isRetire,
            isMovable: isMovable,
            name: name,
            strokeWidth: 0,
            strokeColor: 'red',
            datatype: type,
            dataid: dataid,
            index: index,
            beginingYear: startNumber,
            pixel: (endNumber - startNumber) / ($rootScope.timelineControl.endX - $rootScope.timelineControl.startX),
            origin: { x: "center", y: "center" },
            image: imagePath
        });
        item.addChild(child);
    }    
    
    
    item.bind('dblclick dbltap', function () {
        if (this.datatype == 'dream' && ($rootScope.functionAccess.EDIT_DREAM == null || $rootScope.functionAccess.EDIT_DREAM == undefined)) {
            $rootScope.functionAccess.showDeniedMessage();
            return;
        }
        if (this.datatype == 'lifeevent' && ($rootScope.functionAccess.EDIT_LIFE_EVENT == null || $rootScope.functionAccess.EDIT_LIFE_EVENT == undefined)) {
            $rootScope.functionAccess.showDeniedMessage();
            return;
        }
        $rootScope.timelineDropYear = -1;
        var index = this.index;
        $rootScope.isEditDream = true;
        var obj = this;
        startNumber = $rootScope.PersonaPlan.start_age;
        endNumber = $rootScope.PersonaPlan.death_age;
        if ($rootScope.zoomData.isShow) {
            startNumber = $rootScope.zoomData.minAge;
            endNumber = $rootScope.zoomData.maxAge;
        }
        if (type == 'dream') {
           

            $rootScope.PersonaPlan.ClientActionType = 'ChangeDream';
            index = getIndexOfDataId($rootScope, 'dream', this.dataid);
            bindDreamtoModalDialog($rootScope, index);
            utilService.updateSelectedDreamType('dream', true);
            if ($rootScope.functionAccess.EDIT_DREAM == 0) {
                $rootScope.functionAccess.showErrorMessage();
                $rootScope.EditdreamPermission = false;
            }
            else { $rootScope.EditdreamPermission = true; }
            
            
            var dream = $rootScope.PersonaPlan.dreams[index];
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
                $rootScope.SendingScreenSharingDataObject(obj, 'edit', 'open', 'dreamdialog');
                $('#SaveDream').bind('click', function () {
                    
                    bindDreamfromModalDialog($rootScope, index);
                    var year = $rootScope.PersonaPlan.dreams[index].purchase_age;
                    obj.children[0].text = parseInt(year);
                    obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / (endNumber - startNumber)) * (year - startNumber) + $rootScope.timelineControl.startX;
                    $rootScope.Settings.isAjaxInstantRequest = true;
                    $rootScope.requestSaveAndUpdateScreen();
                    $rootScope.SendingScreenSharingDataObject(obj, 'edit', 'ok', 'dreamdialog');
                    OrderCanvasItem($rootScope, canvas);
                    $('#SaveDream').unbind('click');
                });
                $('#CancelSaveDream').bind('click', function () {
                    $rootScope.SendingScreenSharingDataObject(obj, 'edit', 'cancel', 'dreamdialog');
                });
            }, 500);
        }
        else if (type == 'lifeevent') {
            $rootScope.PersonaPlan.ClientActionType = 'ChangeLifevent';
            index = getIndexOfDataId($rootScope, 'lifeevent', this.dataid);
            bindLifeEventtoModalDialog($rootScope, index);
            utilService.updateSelectedDreamType('life_event', true);
            if ($rootScope.functionAccess.EDIT_LIFE_EVENT == 0) {
                $rootScope.functionAccess.showErrorMessage();
                $rootScope.EditLifeeventPermission = false;
            }
            else { $rootScope.EditLifeeventPermission = true; }
            utilService.scopeApply();
            $timeout(function () {
                $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false })
                $rootScope.SendingScreenSharingDataObject(obj, 'edit', 'open', 'lifeeventdialog');
                $('#SaveLifeEvent').bind('click', function () {                            
                    bindLifeEventfromModalDialog($rootScope, index);
                    var year = $rootScope.PersonaPlan.lifeEvent[index].starting_age;
                    obj.children[0].text = parseInt(year);
                    obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / (endNumber - startNumber)) * (year - startNumber) + $rootScope.timelineControl.startX;
                    $rootScope.Settings.isAjaxInstantRequest = true;
                    $rootScope.requestSaveAndUpdateScreen();
                    $rootScope.SendingScreenSharingDataObject(obj, 'edit', 'ok', 'lifeeventdialog');
                    OrderCanvasItem($rootScope, canvas);
                    $('#SaveLifeEvent').unbind('click');
                });
                $('#cancelSaveLifeEvent').bind('click', function () {
                    $rootScope.SendingScreenSharingDataObject(obj, 'edit', 'cancel', 'lifeeventdialog');
                });
            }, 500);
        }
    });
    
    return item;
}
function initOtherObject(canvas, $rootScope, x, imagePath, kind) {
    var obj = canvas.display.image({
        x: x,
        y: 20,
        pixelBegin: $rootScope.timelineControl.startX,
        pixelEnd: $rootScope.timelineControl.endX,
        pixel: ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age) / ($rootScope.timelineControl.endX - $rootScope.timelineControl.startX),
        beginingYear: $rootScope.PersonaPlan.start_age,
        width: 50,
        height: 50,
        image: imagePath,
        kind: kind
    });
    return obj;
}

function reRenderTimelineObject(canvas, $rootScope) {
    $rootScope.timelineControl.endX = 81 * canvas.width / 100;
    if ($rootScope.zoomData.isShow) {
        for (var i = 0; i < canvas.children.length; i++) {
            // update move object
            if (canvas.children[i].isRetire != undefined && canvas.children[i].isMovable != false) {
                
                var year = parseInt(canvas.children[i].children[0].text);
                if (year >= $rootScope.zoomData.minAge && year <= $rootScope.zoomData.maxAge) {
                    canvas.children[i].x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * (year - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                    canvas.children[i].pixel = ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge) / ($rootScope.timelineControl.endX - $rootScope.timelineControl.startX);
                    canvas.children[i].beginingYear = $rootScope.PersonaPlan.start_age;
                } else {
                    canvas.children[i].x = -200;
                }
            } else if (canvas.children[i].isRetire == true) {
                if (year >= $rootScope.zoomData.minAge && year <= $rootScope.zoomData.maxAge) {
                    if (canvas.children[i].datatype == 'retireAgeRect') {
                        canvas.children[i].x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                        canvas.children[i].children[1].text = displayPercentSocialSecurity($rootScope);
                        canvas.children[i].children[0].text = $rootScope.PersonaPlan.social_security_age;
                    }
                    else {
                        canvas.children[i].x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.retirement_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                        canvas.children[i].children[0].text = $rootScope.PersonaPlan.retirement_age;
                    }
                } else {
                    canvas.children[i].x = -200;
                }
            } else if (canvas.children[i].name == 'BrokenAge') {
                var broken_age = $rootScope.MainResult.broken_age;
                var obj = canvas.children[i];
                if (broken_age >= $rootScope.zoomData.minAge && broken_age <= $rootScope.zoomData.maxAge) {
                    
                    
                    if (broken_age <= $rootScope.PersonaPlan.death_age) {
                        obj.children[0].text = broken_age;
                        obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * (broken_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                        obj.children[0].y = -60;
                        obj.image = "Content/images/saving_deleted.png";
                        obj.img.src = "Content/images/saving_deleted.png";
                    }
                    else {
                        obj.children[0].text = utilService.translate('Congratulations {{name}}! \nYour goals are all achievable.', { name: $rootScope.profile.client.first_name });
                        obj.children[0].y = -90;
                        broken_age = 87;
                        obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (broken_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                        obj.image = "Content/images/greenpig.png";
                        obj.img.src = "Content/images/greenpig.png";
                    }
                } else {                    
                    if (broken_age >= $rootScope.PersonaPlan.death_age) {
                        obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - 35)) * (broken_age - 35) + $rootScope.timelineControl.startX;
                    } else if (broken_age > $rootScope.zoomData.maxAge && broken_age <= $rootScope.PersonaPlan.death_age) {
                        obj.x = 1500;
                    }
                    else {
                        obj.x = -200;
                    }
                }
                
            } else if (canvas.children[i].name == 'begining') {
                canvas.children[i].text = $rootScope.zoomData.minAge;
            } else if (canvas.children[i].name == 'start_age_highlight') {
                if ($rootScope.zoomData.minAge <= $rootScope.PersonaPlan.start_age)
                    canvas.children[i].x = $rootScope.timelineControl.startX - 5;
                else canvas.children[i].x = -200;
            } else if (canvas.children[i].name == 'start_age') {
                if ($rootScope.zoomData.minAge <= $rootScope.PersonaPlan.start_age)
                    canvas.children[i].x = 5;
                else canvas.children[i].x = -200;
            } else if (canvas.children[i].name == 'ending') {
                canvas.children[i].text = $rootScope.zoomData.maxAge;
            } else if (canvas.children[i].datatype == 'arrowdown') {
                if (canvas.children[i].dataid >= $rootScope.zoomData.minAge && canvas.children[i].dataid <= $rootScope.zoomData.maxAge) {
                    year = parseInt(canvas.children[i].dataid);
                    canvas.children[i].x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * (year - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
            }
                else canvas.children[i].x = -200;
            }

        }
    } else {
        var retireAge = null;
        //console.clear();
        for (var i = 0; i < canvas.children.length; i++) {

            if (canvas.children[i].isRetire != undefined && canvas.children[i].isMovable != false) {

                var year = parseInt(canvas.children[i].children[0].text);
             
                canvas.children[i].x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (year - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                canvas.children[i].pixel = ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age) / ($rootScope.timelineControl.endX - $rootScope.timelineControl.startX);                
                canvas.children[i].beginingYear = $rootScope.PersonaPlan.start_age;
                if (canvas.children[i].isRetire == true) {
                    if (canvas.children[i].datatype == 'retireAgeRect') {
                        canvas.children[i].x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                        canvas.children[i].children[1].text = displayPercentSocialSecurity($rootScope);
                        canvas.children[i].children[0].text = $rootScope.PersonaPlan.social_security_age;
                    }
                    else {
                        canvas.children[i].x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                        canvas.children[i].children[0].text = $rootScope.PersonaPlan.retirement_age;
                    }

                }

            }
            if ($rootScope.profile.spouse != null) {
                var year = 60 - $rootScope.profile.spouse.age + $rootScope.PersonaPlan.start_age;
                if (year > 81) year = 111;
                //tlService.removeSpouseRetirementIcon();
                //tlService.addSpouseRetirementIcon(year);            
                if (tlService.spouseRetirementPic != null) {
                    tlService.spouseRetirementPic.children[0].text = year;
                    if ($rootScope.zoomData.isShow) {
                        tlService.spouseRetirementPic.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * (year - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                    } else {
                        tlService.spouseRetirementPic.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (year - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                    }
                }
            }
            if (canvas.children[i].datatype == 'arrowdown') {
                year = parseInt(canvas.children[i].dataid);                
                canvas.children[i].x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (year - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
            } 
            if (canvas.children[i].name == 'ending') {
                canvas.children[i].text = $rootScope.PersonaPlan.death_age;
            } else if (canvas.children[i].name == 'begining') {
                canvas.children[i].text = $rootScope.PersonaPlan.start_age;
            } else if (canvas.children[i].name == 'start_age_highlight') {
                canvas.children[i].x = $rootScope.timelineControl.startX - 5;
                
            } else if (canvas.children[i].name == 'start_age') {
                canvas.children[i].x = 5;
            }
        }
        //OrderCanvasItem($rootScope, canvas);
    }
    
}
function findTrashObject(canvas) {
    for (i = 0; i < canvas.children.length ; i++) {
        if (canvas.children[i].kind != null && canvas.children[i].kind != undefined && canvas.children[i].kind == 'trash')
            return canvas.children[i];
    }
    return null;
}
function checkMouseInTrash(canvas) {
    var obj = findTrashObject(canvas);    
    if (obj != null) {
        var x = canvas.mouse.x > 0 ? canvas.mouse.x : canvas.touch.x;
        var y = canvas.mouse.y > 0 ? canvas.mouse.y : canvas.touch.y;
        var origin = obj.getOrigin();
        var stroke = (obj.strokePosition === "outside") ? obj.strokeWidth : ((obj.strokePosition === "center") ? obj.strokeWidth / 2 : 0);
        
        return ((x > obj.abs_x - origin.x - stroke) && (x < obj.abs_x + obj.width - origin.x + stroke) && (y > obj.abs_y - origin.y - stroke) && (y < obj.abs_y + obj.height - origin.y + stroke));
    }
    return false;
}
function checkMousePositionInTimeLineControl(canvas, $rootScope) {
    var x = canvas.mouse.x > 0 ? canvas.mouse.x : canvas.touch.x;
    var y = canvas.mouse.y > 0 ? canvas.mouse.y : canvas.touch.y;
    if (x >= $rootScope.timelineControl.startX && x <= $rootScope.timelineControl.endX && y >= $rootScope.timelineControl.startY - 60)
        return true;
    return false;
}
function callToAddDream($rootScope, personalPlanService) {
    personalPlanService.AddDream( $rootScope.selectedDream);
    if ($rootScope.selectedDream.id != -1)
        $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length] = angular.copy($rootScope.selectedDream);
}
function callToAddLifeEvent($rootScope, personalPlanService) {
    personalPlanService.AddLifeEvent($rootScope.selectedLifeEvent);
    if ($rootScope.selectedLifeEvent.id != -1)
        $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length] = angular.copy($rootScope.selectedLifeEvent);    
}


function findCanvasTimeLineObject(canvas, type, dataid) {
    for (var i = 0; i < canvas.children.length; i++) {
        if (canvas.children[i].datatype == type && canvas.children[i].dataid == dataid)
            return canvas.children[i];
    }
    return null;
}
var timelineObj = null;
var tlService = null;

btoApp.service('timelineService', function ($rootScope, personalPlanService, utilService, $timeout, $state, $locale, zoomService, accountService, CONFIG, $filter) {
    this.timelineObj = null;
    var self = this;
    tlService = this;
    
    this.initTimeline = function() {
        var c = document.getElementById("canvas");
        var panel = document.getElementById("canvaspanel");
        ctx = c.getContext("2d");
        var width = window.orientation == 0 ? window.screen.width : window.screen.height;
        c.width = 1024;//panel.clientWidth;
        c.height = 200;
        $rootScope.timelineControl = {
            startX: c.width * 5 / 100,
            endX: c.width * 81 / 100,
            startY: 130,
            width: c.width,
            isShowItemOnTimeline: false,
            selectedItemOnTimelineId: null,
            timelineItemList: []
        }
        var canvas = oCanvas.create({
            canvas: "#canvas"
        });
        var canvasObj = document.getElementById('canvas');
        canvasObj.onselectstart = function () { return false; }

        timelineObj = canvas;
        if (!canvas.timeline.running) {
            canvas.timeline.start();
        }
        $rootScope.EditdreamPermission = true;
        $rootScope.EditLifeeventPermission = true;
        var dreamsdragOption = {
            changeZindex: true,
            bubble: false,
            start: function () {
                if (this.kind == 'dreamevents' && $rootScope.functionAccess.ADD_DREAM != 1) {
                    $rootScope.functionAccess.showErrorMessage();
                    this.dragging = false;
                    return;
                }
                if (this.kind == 'lifeevents' && $rootScope.functionAccess.ADD_LIFE_EVENT != 1)
                {
                    $rootScope.functionAccess.showErrorMessage();
                    this.dragging = false;
                    return;
                }
                var obj = null;
                if (this.kind == 'dreamevents') {
                    obj = initOtherObject(canvas, $rootScope, c.width * 5 / 100, "Content/images/Dream.jpg", 'dreamevents');                    
                }
                else if (this.kind == 'lifeevents')
                    obj = initOtherObject(canvas, $rootScope, c.width * 12 / 100, "Content/images/Life_events.jpg", 'lifeevents');
                if (obj != null) {
                    obj.dragAndDrop(dreamsdragOption);
                    canvas.addChild(obj);
                }

            },
            
            end: function () {
                if (checkMousePositionInTimeLineControl(canvas, $rootScope)) {
                    utilService.updateDefaultValueOfDream($rootScope);
                    canvas.removeChild(this);
                    $rootScope.isEditDream = false;
                    var xPos = canvas.mouse.x != 0 ? canvas.mouse.x : canvas.touch.x;
                    var pixel = ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age) / ($rootScope.timelineControl.endX - $rootScope.timelineControl.startX);
                    var year = Math.round(((xPos - $rootScope.timelineControl.startX) * pixel) + $rootScope.PersonaPlan.start_age).toString();
                    if ($rootScope.zoomData.isShow) {
                        pixel = ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge) / ($rootScope.timelineControl.endX - $rootScope.timelineControl.startX);
                        year = Math.round(((xPos - $rootScope.timelineControl.startX) * pixel) + $rootScope.zoomData.minAge).toString();
                    }
                    $rootScope.timelineDropYear = parseInt(year);
                    var image = 'Content/images/';
                    if (this.kind == 'dreamevents') {
                        //$rootScope.PersonaPlan.ClientActionType = 'AddDream';
                        utilService.updateSelectedDreamType('dream');
                        $timeout(function () { 
                            $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
                            var obj = {
                                datatype: 'dream',
                            };
                            $rootScope.SendingScreenSharingDataObject(obj, 'add', 'open', 'dreamdialog');
                            $('#SaveDream').bind('click', function () {
                                //.one('click', '#SaveDream', function () {
                                $timeout(function () {
                                    image = image + $rootScope.selectedDreamtype.image_name;
                                    var index = $rootScope.PersonaPlan.dreams.length;
                                
                                    bindToSelectedDream($rootScope, year);
                                    callToAddDream($rootScope, personalPlanService);
                                    if ($rootScope.selectedDream.id == -1) {                                        
                                        return;
                                    }
                                        
                                    var newid = $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length - 1].id;
                                    year = $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length - 1].purchase_age;
                                    var newItem = initTimeLineItem(canvas, $rootScope, year, 'dream_' + newid, false, true, image, 'dream', index, newid, utilService, $timeout);
                                    $rootScope.Settings.isAjaxInstantRequest = false;
                                    requestSaveAndUpdateScreen();
                                    newItem.dragAndDrop(dragOptions);
                                    canvas.addChild(newItem);
                                    $('#SaveDream').unbind('click');
                                    $rootScope.SendingScreenSharingDataObject(newItem, 'add', 'ok', 'dreamdialog');
                                    addObjectToAgeObjectList($rootScope, canvas, year, 'dream_' + newid);
                                    //OrderCanvasItem($rootScope, canvas);
                                }, 200);
                            });
                            $('#CancelSaveDream').bind('click', function () {
                                $rootScope.SendingScreenSharingDataObject(obj, 'add', 'cancel', 'dreamdialog');
                            });
                        }, 500);
                    }
                    else if (this.kind == 'lifeevents') {
                        $rootScope.PersonaPlan.ClientActionType = 'AddLifeEvent';
                        utilService.updateSelectedDreamType('life_event');
                        $timeout(function () { 
                            $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false });
                            var obj = {
                                datatype: 'lifeevent',
                                staring_age: year
                            }
                            $rootScope.SendingScreenSharingDataObject(obj, 'add', 'open', 'lifeeventdialog');

                            $('#SaveLifeEvent').bind('click', function () {
                                //.one('click', '#SaveLifeEvent', function () {
                                $timeout(function () {
                                    image = image + $rootScope.selectedDreamtype.image_name;
                                    var index = $rootScope.PersonaPlan.lifeEvent == null ? 0 : $rootScope.PersonaPlan.lifeEvent.length;
                                
                                    bindToSelectedLifeEvent($rootScope, year);
                                    callToAddLifeEvent($rootScope, personalPlanService);
                                    if ($rootScope.selectedLifeEvent.id == -1) {
                                        return;
                                    }
                                    var newid = $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length - 1].id;
                                    year = $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length - 1].starting_age;
                                    var newItem = initTimeLineItem(canvas, $rootScope, year, 'lifeevent_' + newid, false, true, image, 'lifeevent', index, newid, utilService, $timeout);
                                    $rootScope.Settings.isAjaxInstantRequest = false;
                                    requestSaveAndUpdateScreen();
                                    newItem.dragAndDrop(dragOptions);
                                    canvas.addChild(newItem);
                                    $rootScope.SendingScreenSharingDataObject(newItem, 'add', 'ok', 'lifeeventdialog');
                                    addObjectToAgeObjectList($rootScope, canvas, year, 'lifeevent_' + newid);
                                    $('#SaveLifeEvent').unbind('click');
                                }, 200);
                            });

                            $('#cancelSaveLifeEvent').bind('click', function () {
                                $rootScope.SendingScreenSharingDataObject(obj, 'add', 'cancel', 'lifeeventdialog');
                            });
                        }, 500);
                    }
                    
                }
                else { canvas.removeChild(this); }
            }
        };
        var dragOptions = {
            changeZindex: true,
            bubble: false,
            start: function () {
                if (this.datatype == 'dream' && $rootScope.functionAccess.EDIT_DREAM != 1) {
                    $rootScope.functionAccess.showErrorMessage();
                    this.dragging = false;
                    return;
                }
                if (this.datatype == 'lifeevent' && $rootScope.functionAccess.EDIT_LIFE_EVENT != 1) {
                    $rootScope.functionAccess.showErrorMessage();
                    this.dragging = false;
                    return;
                }
                if (this.isRetire == true && $rootScope.functionAccess.CHANGE_RETIREMENT_AGE != 1) {
                    $rootScope.functionAccess.showErrorMessage();
                    this.dragging = false;
                    return;
                }
                $rootScope.YearStartMove = parseInt(this.children[0].text);
                $rootScope.IsRemoveMoveObject = false;
            },
            move: function () { 
                var year = Math.round(((this.x - $rootScope.timelineControl.startX) * this.pixel) + this.beginingYear).toString();
                if ($rootScope.zoomData.isShow) {
                    year = Math.round(((this.x - $rootScope.timelineControl.startX) * this.pixel) + rootScope.zoomData.minAge).toString();
                }                                
                if (year != $rootScope.YearStartMove && $rootScope.IsRemoveMoveObject == false && this.datatype != 'retireAgeRect') {
                    removeObjectToAge($rootScope, canvas, $rootScope.YearStartMove, this.name);
                    $rootScope.IsRemoveMoveObject = true;
                }
                var index = -1;
                if (this.isRetire == true) {// && $rootScope.PersonaPlan.retirement_age != this.children[0].text) {
                    if (this.datatype == 'retireAgeRect') {
                        this.y = $rootScope.timelineControl.startY + 3;
                        if (year < $rootScope.YearStartMove && year > 59) {
                            if (year < $rootScope.PersonaPlan.retirement_age) {
                                removeObjectToAge($rootScope, canvas, $rootScope.PersonaPlan.retirement_age, "retirement_age");
                                retirementPics.y = $rootScope.timelineControl.startY;
                                $rootScope.IsRemoveMoveObject = true;
                                $rootScope.PersonaPlan.retirement_age = year;
                                if ($rootScope.zoomData.isShow) {
                                    retirementPics.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.retirement_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                                } else {
                                    retirementPics.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                                }
                                retirementPics.children[0].text = $rootScope.PersonaPlan.retirement_age;
                                $rootScope.SendingScreenSharingDataObject(retirementPics, 'move');
                            }
                        }
                        var boundingYear = year < 60 ? 60 : year;
                        boundingYear = boundingYear > 70 ? 70 : boundingYear;
                        $rootScope.PersonaPlan.social_security_age = boundingYear;                        
                        if (year < 60 || year > 70) {
                            if ($rootScope.zoomData.isShow) {
                                this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                            } else {
                                this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                            }
                        }
                        this.children[0].text = $rootScope.PersonaPlan.social_security_age;
                        this.children[1].text = displayPercentSocialSecurity($rootScope);
                        $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;                        
                        $rootScope.SendingScreenSharingDataObject(this, 'move');

                    }
                    else {
                        this.y = $rootScope.timelineControl.startY;
                        if (year > $rootScope.YearStartMove && year < 71) {
                            if (year > $rootScope.PersonaPlan.social_security_age) {
                                $rootScope.PersonaPlan.social_security_age = year;
                                if ($rootScope.zoomData.isShow) {
                                    socialSecurityAgeStart.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                                } else {
                                    socialSecurityAgeStart.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                                }
                                socialSecurityAgeStart.children[0].text = $rootScope.PersonaPlan.social_security_age;
                                socialSecurityAgeStart.children[1].text = displayPercentSocialSecurity($rootScope);
                            }
                        }
                        if (year > 70) {
                            $rootScope.PersonaPlan.retirement_age = 70;
                            if ($rootScope.zoomData.isShow) {
                                this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.retirement_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                            } else {
                                this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                            }

                            this.children[0].text = 70;
                        }
                        else {
                            var MaxReUse = $rootScope.ReuseSocialSecurityAge > 60 ? $rootScope.ReuseSocialSecurityAge : 60;
                            if ($rootScope.PersonaPlan.social_security_age != year && year >= MaxReUse) {
                                $rootScope.PersonaPlan.social_security_age = year;
                                if ($rootScope.zoomData.isShow) {
                                    socialSecurityAgeStart.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                                } else {
                                    socialSecurityAgeStart.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                                }
                                socialSecurityAgeStart.children[0].text = $rootScope.PersonaPlan.social_security_age;
                                socialSecurityAgeStart.children[1].text = displayPercentSocialSecurity($rootScope);
                            }
                            $rootScope.PersonaPlan.retirement_age = parseInt(this.children[0].text);
                            this.children[0].text = year;
                        } 
                        $rootScope.SendingScreenSharingDataObject(socialSecurityAgeStart, 'move'); 
                        
                    }
                    
                    requestSaveAndUpdateScreen();
                }
                else if (this.isRetire == false) {// && $rootScope.PersonaPlan.dreams[0].purchase_age != this.children[0].text) {
                    this.children[0].text = year;
                    var age;
                    if (this.datatype == 'dream') {                    
                        index = getIndexOfDataId($rootScope, 'dream', this.dataid);
                        if (index > -1) {
                            $rootScope.PersonaPlan.dreams[index].purchase_age = parseInt(this.children[0].text);
                            if (year != $rootScope.YearStartMove)
                                requestSaveAndUpdateScreen();
                        }    
                    }
                    else {
                        index = getIndexOfDataId($rootScope, 'lifeevent', this.dataid);
                        if (index > -1) {
                            $rootScope.PersonaPlan.lifeEvent[index].starting_age = parseInt(this.children[0].text);
                            if (year != $rootScope.YearStartMove)
                                requestSaveAndUpdateScreen();
                        }
                        
                    }
                    
                } 
                $rootScope.SendingScreenSharingDataObject(this, 'move', 'moving');
            },
            end: function () {
                if (!checkMouseInTrash(canvas))
                    reRenderTimelineObject(canvas, $rootScope);
                $rootScope.PersonaPlan.ClientActionType = "Change" + this.datatype;
                if (this.datatype == 'retireAgeRect') { 
                    this.y = $rootScope.timelineControl.startY + 3;                  
                }
                $rootScope.Settings.isAjaxInstantRequest = true;                
                if (this.isRetire == true) {// && $rootScope.PersonaPlan.retirement_age != this.children[0].text) {                    
                    if (this.datatype == 'retireAgeRect') {
                        
                        $rootScope.PersonaPlan.social_security_age = parseInt(this.children[0].text);
                        if ($rootScope.PersonaPlan.social_security_age < $rootScope.PersonaPlan.retirement_age) { // fixed when move very fast
                            $rootScope.PersonaPlan.retirement_age = $rootScope.PersonaPlan.social_security_age;
                            if ($rootScope.zoomData.isShow) {
                                retirementPics.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.retirement_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                            } else {
                                retirementPics.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                            }
                            
                            retirementPics.children[0].text = $rootScope.PersonaPlan.retirement_age;
                            
                        }

                        if ($rootScope.IsRemoveMoveObject == true) {
                            addObjectToAgeObjectList($rootScope, canvas, $rootScope.PersonaPlan.retirement_age, "retirement_age");
                        }
                        this.children[1].text = displayPercentSocialSecurity($rootScope);
                    }
                    else {
                        $rootScope.PersonaPlan.retirement_age = parseInt(this.children[0].text);
                        if ($rootScope.PersonaPlan.social_security_age < $rootScope.PersonaPlan.retirement_age) { // fixed when move very fast
                            $rootScope.PersonaPlan.social_security_age = $rootScope.PersonaPlan.retirement_age;
                            if ($rootScope.zoomData.isShow) {
                                socialSecurityAgeStart.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                            } else {
                                socialSecurityAgeStart.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                            }
                            socialSecurityAgeStart.children[0].text = $rootScope.PersonaPlan.social_security_age;
                            socialSecurityAgeStart.children[1].text = displayPercentSocialSecurity($rootScope);
                        }
                        if ($rootScope.PersonaPlan.retirement_age < $rootScope.ReuseSocialSecurityAge) {
                            $rootScope.PersonaPlan.social_security_age = $rootScope.ReuseSocialSecurityAge;
                            if ($rootScope.zoomData.isShow) {
                                socialSecurityAgeStart.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                            } else {
                                socialSecurityAgeStart.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                            }
                            socialSecurityAgeStart.children[0].text = $rootScope.PersonaPlan.social_security_age;
                            socialSecurityAgeStart.children[1].text = displayPercentSocialSecurity($rootScope);
                        }
                        if ($rootScope.zoomData.isShow) {
                            if ($rootScope.PersonaPlan.social_security_age > $rootScope.zoomData.maxAge)
                                socialSecurityAgeStart.x = 1500;
                            if ($rootScope.PersonaPlan.social_security_age < $rootScope.zoomData.minAge)
                                socialSecurityAgeStart.x = -200;
                        }
                        //   $timeout(function () {
                        $rootScope.SendingScreenSharingDataObject(socialSecurityAgeStart, 'move', 'end');
                        //    }, 100);
                    }
                    
                }
                else if (this.isRetire == false) {// && $rootScope.PersonaPlan.dreams[0].purchase_age != this.children[0].text) {
                    var index = -1;
                    if (this.datatype == 'dream') {
                        index = getIndexOfDataId($rootScope, 'dream', this.dataid);
                        if (index > -1) {
                            var lifeevent = findLifeEventByDreamId($rootScope, this.dataid);
                            if (lifeevent == null) {
                                $rootScope.PersonaPlan.dreams[index].purchase_age = parseInt(this.children[0].text);
                            }
                            else {
                                
                                //var obj = findCanvasTimeLineObject(canvas, 'lifeevent', lifeevent.id);
                                if (parseFloat(this.children[0].text) > lifeevent.starting_age) {
                                    utilService.showWarningMessage(utilService.translate('You can\'t sell a house that you haven\'t bought yet.'));
                                    this.children[0].text = lifeevent.starting_age;
                                    if ($rootScope.zoomData.isShow) {
                                        this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * (lifeevent.starting_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                                    } else {
                                        this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (lifeevent.starting_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                                    }
                                    this.y = $rootScope.timelineControl.startY;
                                    $rootScope.PersonaPlan.dreams[index].purchase_age = parseInt(lifeevent.starting_age);
                                }
                            }
                        }
                    }
                    else {
                        index = getIndexOfDataId($rootScope, 'lifeevent', this.dataid);
                        if (index > -1) {
                            if ($rootScope.PersonaPlan.lifeEvent[index].dream_id == null || $rootScope.PersonaPlan.lifeEvent[index].dream_id <= 0)
                                $rootScope.PersonaPlan.lifeEvent[index].starting_age = parseInt(this.children[0].text);
                            else {
                                var dreamIndex = getIndexOfDataId($rootScope, 'dream', $rootScope.PersonaPlan.lifeEvent[index].dream_id);
                                //if (dreamIndex > 0 && this.children[0].text < $rootScope.PersonaPlan.dreams[dreamIndex].purchase_age) {
                                if (dreamIndex >= 0 && parseFloat(this.children[0].text) < $rootScope.PersonaPlan.dreams[dreamIndex].purchase_age) {
                                    utilService.showWarningMessage(utilService.translate('You can\'t sell a house that you haven\'t bought yet.'));
                                    this.children[0].text = $rootScope.PersonaPlan.dreams[dreamIndex].purchase_age;
                                    if ($rootScope.zoomData.isShow) {
                                        this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.PersonaPlan.dreams[dreamIndex].purchase_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                                    } else {
                                        this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.PersonaPlan.dreams[dreamIndex].purchase_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                                    }
                                    this.y = $rootScope.timelineControl.startY;
                                    $rootScope.PersonaPlan.lifeEvent[index].starting_age = parseInt($rootScope.PersonaPlan.dreams[dreamIndex].purchase_age);
                                }
                            }
                        }
                    }
                    if (parseFloat(this.children[0].text) != $rootScope.YearStartMove) {
                        $rootScope.Settings.isAjaxInstantRequest = true;
                        requestSaveAndUpdateScreen();
                    }
                        
                }
                if (this.isRetire) {
                    if (this.datatype == 'retireAgeRect') {
                        if (checkMouseInTrash(canvas)) {
                            $rootScope.PersonaPlan.social_security_age = $rootScope.YearStartMove;
                            this.children[0].text = $rootScope.YearStartMove;
                            if ($rootScope.zoomData.isShow) {
                                this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.YearStartMove - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                            } else {
                                this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.YearStartMove - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                            }
                        }
                    }
                    else {
                        this.y = $rootScope.timelineControl.startY;
                        if (checkMouseInTrash(canvas)) {
                            $rootScope.PersonaPlan.retirement_age = $rootScope.YearStartMove;
                            this.children[0].text = $rootScope.YearStartMove;
                            if ($rootScope.zoomData.isShow) {
                                this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.YearStartMove - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                            } else {
                                this.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.YearStartMove - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                            }
                        }
                    }
                    
                    $rootScope.Settings.isAjaxInstantRequest = true;
                    requestSaveAndUpdateScreen();
                    
                }
                else if (checkMouseInTrash(canvas)) {
                    var datatype = this.datatype;
                    var dataid = this.dataid;
                    var obj = this;                    
                    if ((this.datatype == 'dream' && $rootScope.functionAccess.REMOVE_DREAM != 1) || (this.datatype == 'lifeevent' && $rootScope.functionAccess.REMOVE_LIFE_EVENT != 1))
                    {
                        obj.children[0].text = $rootScope.YearStartMove;
                        if ($rootScope.zoomData.isShow) {
                            obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.YearStartMove - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                        } else {
                            obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.YearStartMove - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                        }
                        obj.y = $rootScope.timelineControl.startY;
                        $rootScope.functionAccess.showErrorMessage();
                        return;
                    }
                    
                    var index = getIndexOfDataId($rootScope, datatype, dataid);
                    var dream_id_delete = null;
                    var lifeevent_id_delete = null;
                    if (index > -1) {
                        if (datatype == 'dream') {
                            dream_id_delete = $rootScope.PersonaPlan.dreams[index].id;
                            
                            if (dream_id_delete != null && dream_id_delete > 0) {//find life event delete also
                                var lifeEvent = findLifeEventByDreamId($rootScope, dream_id_delete);
                                if (lifeEvent == null) {
                                    $rootScope.MessageDelete = null;
                                    lifeevent_id_delete = null;
                                }
                                else {
                                    lifeevent_id_delete = lifeEvent.id;
                                    $rootScope.MessageDelete = utilService.translate("Life Event: {{name}} will be delete too, Are you sure?", { name: lifeEvent.name });
                                }                                
                            }
                        }
                        else {
                            lifeevent_id_delete = $rootScope.PersonaPlan.lifeEvent[index].id;
                        }
                    }
                    $timeout(function () { 
                        $('#confirmDeletedialog').modal({ backdrop: 'static', keyboard: false });
                        var item = {
                            datatype: this.datatype,
                            dataid: this.dataid,
                            index: index,
                            dream_id_delete: dream_id_delete,
                            lifeevent_id_delete: lifeevent_id_delete
                        };
                        $rootScope.SendingScreenSharingDataObject(item, 'delete', 'open', 'confirmDeletedialog');
                        $('#OkDelete').bind('click', function () {
                            if (dream_id_delete != null)//object delete is dream
                            { 
                                if (lifeevent_id_delete != null) {
                                    personalPlanService.RemoveLifeEvent(lifeevent_id_delete);
                                    var lifeEvent_Index = getIndexOfDataId($rootScope, 'lifeevent', lifeevent_id_delete);
                                    $rootScope.PersonaPlan.lifeEvent.splice(lifeEvent_Index, 1);
                                    var lifeEventObject = findCanvasTimeLineObject(canvas, 'lifeevent', lifeevent_id_delete);
                                    canvas.removeChild(lifeEventObject);
                                }
                                personalPlanService.RemoveDream(dream_id_delete);
                                $rootScope.PersonaPlan.dreams.splice(index, 1);
                            }
                            else if (lifeevent_id_delete != null) { 
                                personalPlanService.RemoveLifeEvent(lifeevent_id_delete);
                                $rootScope.PersonaPlan.lifeEvent.splice(index, 1);
                            }
                            canvas.removeChild(obj);
                            $rootScope.Settings.isAjaxInstantRequest = true;
                            requestSaveAndUpdateScreen();
                            $('#OkDelete').unbind('click');
                            item.datatype = obj.datatype;
                            item.dataid = obj.dataid;
                            item.index = index;
                            item.id = obj.id;
                            $rootScope.SendingScreenSharingDataObject(item, 'delete', 'ok', 'confirmDeletedialog');
                        });
                        $('#CancelDelete').bind('click', function () {                            
                            obj.children[0].text = $rootScope.YearStartMove;
                            if ($rootScope.zoomData.isShow) {
                                obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * ($rootScope.YearStartMove - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                            } else {
                                obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * ($rootScope.YearStartMove - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                            }
                            obj.y = $rootScope.timelineControl.startY;
                            var tempname = "";                            
                            if (datatype == 'dream') {
                                index = getIndexOfDataId($rootScope, 'dream', dataid);
                                $rootScope.PersonaPlan.dreams[index].purchase_age = $rootScope.YearStartMove;
                                tempname = 'dream_' + $rootScope.PersonaPlan.dreams[index].id;
                            }
                            else {
                                index = getIndexOfDataId($rootScope, 'lifeevent', dataid);
                                $rootScope.PersonaPlan.lifeEvent[index].starting_age = $rootScope.YearStartMove;
                                tempname = 'lifeevent_' + $rootScope.PersonaPlan.lifeEvent[index].id;
                            }
                            addObjectToAgeObjectList($rootScope, canvas, $rootScope.YearStartMove, tempname);
                            $rootScope.Settings.isAjaxInstantRequest = true;
                            requestSaveAndUpdateScreen();
                            $('#OkDelete').unbind('click');
                            $('#CancelDelete').unbind('click');
                            item.datatype = obj.datatype;
                            item.dataid = obj.dataid;
                            item.index = index;
                            item.id = obj.id;
                            item.YearStartMove = $rootScope.YearStartMove;
                            $rootScope.SendingScreenSharingDataObject(item, 'delete', 'cancel', 'confirmDeletedialog');
                        });
                    }, 1);
                }
                else {                    
                    this.y = $rootScope.timelineControl.startY;
                }
                var year = Math.round(((this.x - $rootScope.timelineControl.startX) * this.pixel) + this.beginingYear).toString();
                if ($rootScope.zoomData.isShow) {
                    year = Math.round(((this.x - $rootScope.timelineControl.startX) * this.pixel) + rootScope.zoomData.minAge).toString();
                }
                if (!checkMouseInTrash(canvas) && $rootScope.IsRemoveMoveObject && this.datatype != 'retireAgeRect') {                    
                    if (this.name != null && this.name != undefined) {
                        addObjectToAgeObjectList($rootScope, canvas, year, this.name);
                    }                    
                }
                $rootScope.SendingScreenSharingDataObject(this, 'move', 'end');
            }
            
        };

        var begining = initYear(canvas, $rootScope, $rootScope.PersonaPlan.start_age, $rootScope.timelineControl.startX, 13 * c.width / 1000);
        canvas.addChild(begining);

        var beginingRect = canvas.display.rectangle({
            x: $rootScope.timelineControl.startX - 5, y: $rootScope.timelineControl.startY - 42, width: 10, height: 90, fill: "green", strokeWidth: 0, strokeColor: 'red', name: 'start_age_highlight'
        });
        canvas.addChild(beginingRect);
        var startObject = initStartObject(canvas, $rootScope, $timeout);
        canvas.addChild(startObject);
        var ending = initYear(canvas, $rootScope, $rootScope.PersonaPlan.death_age, $rootScope.timelineControl.endX, 13 * c.width / 1000, undefined, 'ending');
        canvas.addChild(ending);
 
        var socialSecurityAgeStart = initTimeLineItem(canvas, $rootScope, $rootScope.PersonaPlan.social_security_age, 'social_security_age',true, true, "Content/images/retire.png", 'retireAgeRect');
        socialSecurityAgeStart.dragAndDrop(dragOptions);

        canvas.addChild(socialSecurityAgeStart);
        var socialSecurityDblClick = function (e) {
            if ($rootScope.functionAccess.CHANGE_RETIREMENT_AGE == null || $rootScope.functionAccess.CHANGE_RETIREMENT_AGE == undefined) {
                $rootScope.functionAccess.showErrorMessage();
                return;
            }
            if ($rootScope.functionAccess.CHANGE_RETIREMENT_AGE != 1) {
                $rootScope.functionAccess.showErrorMessage();                
            }
            $rootScope.PersonaPlan.ClientActionType = 'ChangeSocialSecurityStartAge';
            var backupSocialSecurityAge = angular.copy($rootScope.PersonaPlan.social_security_age);
            $rootScope.MinSocialSecurityAge = $rootScope.PersonaPlan.retirement_age > 60 ? parseInt($rootScope.PersonaPlan.retirement_age) : 60;
            $timeout(function () {
                $('#SocialSecurityStartAgeDialog').modal({ backdrop: 'static', keyboard: false });
                $rootScope.SendingScreenSharingDataObject(socialSecurityAgeStart, 'edit', 'open', 'SocialSecurityStartAgeDialog');
                $('#OkUpdateSocialSecurityAge').bind('click tap', function () {
                    $('#OkUpdateSocialSecurityAge').unbind('click tap');
                    $('#cancelUpdateSocialSecurityAge').unbind('click tap');                    
                    socialSecurityAgeStart.children[0].text = $rootScope.PersonaPlan.social_security_age;
                    $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;                                        
                    reRenderTimelineObject(canvas, $rootScope);
                    $rootScope.Settings.isAjaxInstantRequest = true;
                    requestSaveAndUpdateScreen();                    
                    $rootScope.SendingScreenSharingDataObject(socialSecurityAgeStart, 'edit', 'ok', 'SocialSecurityStartAgeDialog');
                });
                $('#cancelUpdateSocialSecurityAge').bind('click tap', function () {
                    $rootScope.PersonaPlan.social_security_age = backupSocialSecurityAge;
                    $('#OkUpdateSocialSecurityAge').unbind('click tap');
                    $('#cancelUpdateSocialSecurityAge').unbind('click tap');
                    $rootScope.SendingScreenSharingDataObject(socialSecurityAgeStart, 'edit', 'cancel', 'SocialSecurityStartAgeDialog');
                });
            }, 50);
        }
        socialSecurityAgeStart.bind('dblclick dbltap', socialSecurityDblClick);
        //socialSecurityAgeRect.bind('dblclick dbltap', socialSecurityDblClick);
        
        var dreamevents = initOtherObject(canvas, $rootScope, c.width * 5 / 100, "Content/images/Dream.jpg", 'dreamevents');
        var lifevents = initOtherObject(canvas, $rootScope, c.width * 12 / 100, "Content/images/Life_events.jpg", 'lifeevents');
        var trash = initOtherObject(canvas, $rootScope, c.width * 70 / 100, "Content/images/trash_lb_big.jpg", 'trash');
        var resetPlan = initOtherObject(canvas, $rootScope, c.width * 64 / 100, "Content/images/reset_plan.png", 'resetplan');        
        resetPlan.bind("click tap", function (event) { 
            $timeout(function () {
                var obj = {
                    datatype: resetPlan.kind,
                }
                if ($rootScope.functionAccess.RESET_PLAN != 1) {
                    $rootScope.functionAccess.showErrorMessage();                    
                    return;
                }
                $rootScope.resetPlanForPlayBack_open(obj); 
                $rootScope.SendingScreenSharingDataObject(obj, 'resetplan', 'open', 'confirmdialog');
                $('#OkConfirm').bind('click', function () { 
                    resetUserPlan(); 
                    $('#OkConfirm').unbind('click');
                    $('#CancelConfirm').unbind('click');
                });
                $('#CancelConfirm').bind('click', function () {  
                    $('#OkConfirm').unbind('click');
                    $('#CancelConfirm').unbind('click'); 
                    $rootScope.SendingScreenSharingDataObject(obj, 'resetplan', 'cancel', 'confirmdialog');
                });
            }, 1);

        });
        dreamevents.dragAndDrop(dreamsdragOption);
        lifevents.dragAndDrop(dreamsdragOption);
        var currentButton = InitButtonObject(canvas, c.width * 20 / 100, 30, utilService.translate('Current Plan'), '#31b0d5', $rootScope, $timeout);
        currentButton.bind('click tap', function () {
            if ($rootScope.PersonaPlan.status != 0) // not a current plan
            {
                if ($rootScope.functionAccess.SWITCHED_PERSONA_PLAN != 1) {
                    $rootScope.functionAccess.showErrorMessage();
                    return;
                }
                self.switchToCurrentPlan();
            }
        });
        canvas.addChild(currentButton);
        this.switchToCurrentPlan = function () {
            $rootScope.newPlan = angular.copy($rootScope.PersonaPlan);
            $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
            $rootScope.PersonaPlan.start_age = angular.copy($rootScope.PersonaPlan.start_age);
            personalPlanService.updateConvertDataOfPersonalPlan();            
            RemoveAllDreamAndEventInTimeline();
            InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout);
            accountService.changeCurrency($rootScope.PersonaPlan.currency_code);
            OrderCanvasItem($rootScope, canvas);
            $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
            $rootScope.MCTopValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
            }
            $rootScope.MCBottomValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
            }

            resetValueForBars($rootScope.currentPlan);
            utilService.scopeApply();
            $rootScope.setCurrentActive();

            $rootScope.Settings.isAjaxInstantRequest = true;
            requestSaveAndUpdateScreen();
            reRenderTimelineObject(canvas, $rootScope);
            utilService.showSuccessMessage(utilService.translate('Switched to current plan'));
            personalPlanService.changeToCurrentPlan($rootScope.PersonaPlan);
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan, 'switch', 'currentPlan', 'confirmdialog');
        }
        $rootScope.renderObject = function () {
            reRenderTimelineObject(canvas, $rootScope);
        }
        $rootScope.switchToCurrentPlanShare = function (dataObj) {
            //    $rootScope.newPlan = angular.copy($rootScope.PersonaPlan);
            $rootScope.PersonaPlan = angular.copy(dataObj.newValue);
            $rootScope.PersonaPlan.start_age = angular.copy($rootScope.PersonaPlan.start_age);
            personalPlanService.updateConvertDataOfPersonalPlan();
            RemoveAllDreamAndEventInTimeline();
            InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout);            
            OrderCanvasItem($rootScope, canvas);
            $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
            $rootScope.MCTopValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
            }
            $rootScope.MCBottomValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
            }

            resetValueForBars($rootScope.currentPlan);
            utilService.scopeApply();
            $rootScope.setCurrentActive();
            reRenderTimelineObject(canvas, $rootScope);
            utilService.showSuccessMessage(utilService.translate('Switched to current plan'));
        };
        $rootScope.switchToNewPlanShare = function (dataObj) {
            //    $rootScope.currentPlan = angular.copy($rootScope.PersonaPlan);
            $rootScope.PersonaPlan = angular.copy(dataObj.newValue);
            personalPlanService.updateConvertDataOfPersonalPlan();
            RemoveAllDreamAndEventInTimeline();
            InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout);
            OrderCanvasItem($rootScope, canvas);
            $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
            $rootScope.MCTopValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
            }
            $rootScope.MCBottomValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
            }

            resetValueForBars($rootScope.newPlan);
            utilService.scopeApply();
            $rootScope.setNewButtonActive();
            reRenderTimelineObject(canvas, $rootScope);
            utilService.showSuccessMessage(utilService.translate('Switched to new plan'));
        };
        $rootScope.switchToNewPlan = function () {
            $rootScope.currentPlan = angular.copy($rootScope.PersonaPlan);
            $rootScope.PersonaPlan = angular.copy($rootScope.newPlan);
            personalPlanService.updateConvertDataOfPersonalPlan();
            RemoveAllDreamAndEventInTimeline();
            InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout);
            OrderCanvasItem($rootScope, canvas);
            $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
            $rootScope.MCTopValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
            }
            $rootScope.MCBottomValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
            }

            resetValueForBars($rootScope.newPlan);
            utilService.scopeApply();
            $rootScope.setNewButtonActive();
            accountService.changeCurrency($rootScope.PersonaPlan.currency_code);
            $rootScope.Settings.isAjaxInstantRequest = true;
            requestSaveAndUpdateScreen();
            reRenderTimelineObject(canvas, $rootScope);
            utilService.showSuccessMessage(utilService.translate('Switched to new plan'));
            personalPlanService.changeToNewPlan($rootScope.PersonaPlan);
            $rootScope.SendingScreenSharingDataObject($rootScope.PersonaPlan, 'switch', 'newPlan', 'confirmdialog');
        };
        var newButton = InitButtonObject(canvas, c.width * 35 / 100, 30, utilService.translate('My New Plan'), '#337ab7', $rootScope, $timeout);
        newButton.bind('click tap', function () {
            if ($rootScope.PersonaPlan.status != 1) // not a new plan
            {
                if ($rootScope.functionAccess.SWITCHED_PERSONA_PLAN != 1) {
                    $rootScope.functionAccess.showErrorMessage();
                    return;
                }
                $rootScope.switchToNewPlan();
            }
        });

        canvas.addChild(newButton);
        var saveScenariosButton = InitButtonObject(canvas, c.width * 50 / 100, 30, utilService.translate('Save Scenario'), '#337ab7', $rootScope, $timeout);
        saveScenariosButton.bind('click tap', function () {
            if ($rootScope.PersonaPlan.status == 0) {
                $rootScope.currentPlan = angular.copy($rootScope.PersonaPlan);                
            }
            else if ($rootScope.PersonaPlan.status == 1) {
                $rootScope.newPlan = angular.copy($rootScope.PersonaPlan);                
            }
            $timeout(function () {
                $rootScope.spinner.on();
                $('#manageScenario').modal({ backdrop: 'static', keyboard: false });
                $rootScope.spinner.off();
                ReUpdateForControlById('manageScenario');
            }, 10);
        });
        canvas.addChild(saveScenariosButton);
        var startPlayButton = initOtherObject(canvas, $rootScope, c.width * 82 / 100, "Content/images/start_playback.png", 'playback');
        startPlayButton.bind('click tap', function () {
            $rootScope.playbackService.initialPlayBack();
            $rootScope.zoomData.isShow = false;
            zoomService.resetZoomData();
            $rootScope.reRenderTimelineObject();
        });
        var zoomButton = initOtherObject(canvas, $rootScope, c.width * 76 / 100, "Content/images/zoom.png", 'zoom');
        zoomButton.bind('click tap', function () {
            if ($rootScope.functionAccess.ZOOM_TIMELINE != 1) {
                $rootScope.functionAccess.showErrorMessage();
                return;
            }
            $rootScope.zoomData.isShow = !$rootScope.zoomData.isShow;
            $timeout(function () {
                utilService.scopeApply();
                $rootScope.SendingScreenSharingDataObject($rootScope.zoomData.isShow, 'zoom', 'open');
            }, 500)
        });
        canvas.addChild(zoomButton);
        canvas.addChild(dreamevents);
        canvas.addChild(lifevents);
        canvas.addChild(trash);
        
        //if ($('#playbackRole').val() === "1") 
        if ($rootScope.functionAccess.PLAYBACK == 1 || $('#playbackRole').val() === "1")
        {            
            canvas.addChild(startPlayButton);
        }
        canvas.addChild(resetPlan);
        InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout);
        
        //InitArrowDownButton(56, $rootScope,canvas, begining, ending);
        $rootScope.RemoveAllDreamAndEventInTimeline = function () {
            RemoveAllDreamAndEventInTimeline();
        }
        $rootScope.RemoveAllItemInTimelineByTypeName = function (obj) {
            RemoveAllItemInTimelineByTypeName(obj);
        }
        $rootScope.InsertDreamAndLifeEvent = function () {
            InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout);
        }
        $rootScope.OrderCanvasItem = function () {
            OrderCanvasItem($rootScope, canvas);
        }
        $rootScope.displayObjectByName = function (key) {
            displayObjectByName($rootScope, key, canvas)
        }
        $rootScope.setCurrentActive = function () {
            newButton.fill = '#337ab7';
            currentButton.fill = '#31b0d5';
        }
        $rootScope.setNewButtonActive = function () {
            currentButton.fill = '#337ab7';
            newButton.fill = '#31b0d5';
        }


         
        /* Begin:PlayBack
         This scope for Play back and Sharing data
        */
        
        $rootScope.changeStartAge = function (fromvalue, tovalue) {
            var step = 1;
            if (fromvalue > tovalue)
                step = -1;
            var cryear = parseFloat(canvas.children[0].text);
            if ((cryear >= tovalue && fromvalue < tovalue) || (cryear <= tovalue && fromvalue > tovalue)) {
                canvas.children[0].text = tovalue;
                $rootScope.PersonaPlan.start_age = parseFloat(tovalue);
                reRenderTimelineObject(canvas, $rootScope);
                clearTimeout($rootScope.tempTimer);
                $rootScope.tempTimer = null;
                $rootScope.removeHighlightCanvasObject('start_age_highlight');
                return;
            }
            cryear += step;
            canvas.children[0].text = cryear;
            $rootScope.PersonaPlan.start_age = parseFloat(cryear);
            reRenderTimelineObject(canvas, $rootScope);
            var str = 'rootScope.changeStartAge(' + fromvalue + ',' + tovalue + ')';
            $rootScope.tempTimer = setTimeout(str, 100 / $rootScope.fastStep);
        },
        $rootScope.backwardActionChangeStartAge = function (playAction) {
            $rootScope.highlightCanvasObject('start_age_highlight');
            var x = canvas.mouse.x == 0 ? canvas.touch.x : canvas.mouse.x;
            var fromvalue = parseFloat(playAction.data[0].fromvalue);
            var tovalue = parseFloat(playAction.data[0].tovalue);
            $rootScope.changeStartAge(tovalue, fromvalue);
        },
        $rootScope.actionChangeStartAge = function (playAction) {
            $rootScope.highlightCanvasObject('start_age_highlight');
            var x = canvas.mouse.x == 0 ? canvas.touch.x : canvas.mouse.x;
            var fromvalue = parseFloat(playAction.data[0].fromvalue);
            var tovalue = parseFloat(playAction.data[0].tovalue);
            $rootScope.changeStartAge(fromvalue, tovalue);
        },
        $rootScope.addLifeEventToPlayBackward = function (dataObj) {
            utilService.updateSelectedDreamType('life_event'); 
            bindLifeEventtoModalDialog($rootScope, 0, dataObj.newValue);
            bindToSelectedLifeEvent($rootScope, dataObj.newValue.starting_age); 
            var image = 'Content/images/';
            image = image + $rootScope.selectedDreamtype.image_name;
            var index = $rootScope.PersonaPlan.lifeEvent == null ? 0 : $rootScope.PersonaPlan.lifeEvent.length;
            $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length] = angular.copy($rootScope.selectedLifeEvent);
            var newid = $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length - 1].id;
            year = $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length - 1].starting_age;
            var newItem = initTimeLineItem(canvas, $rootScope, year, 'lifeevent_' + newid, false, true, image, 'lifeevent', index, newid, utilService, $timeout);
            newItem.dragAndDrop(dragOptions);
            canvas.addChild(newItem);


        },
        $rootScope.actionRemoveLifeEventForAdd = function (dataObj) {

            utilService.updateSelectedDreamType('life_event');
            $timeout(function () {
                $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false })
                bindLifeEventtoModalDialog($rootScope, 0, dataObj.newValue);
                bindToSelectedLifeEvent($rootScope, (dataObj.newValue.starting_age));
            }, 1);
            setTimeout(function () {
                $('#lifeeventdialog').modal('hide');
                var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
                var lifeEvent_Index = getIndexOfDataId($rootScope, 'lifeevent', dataObj.newValue.id);
                $rootScope.PersonaPlan.lifeEvent.splice(lifeEvent_Index, 1);
                var lifeEventObject = findCanvasTimeLineObject(canvas, 'lifeevent', dataObj.newValue.id);
                canvas.removeChild(lifeEventObject);
            }, 2000);

        },
        $rootScope.resetZoomData = function () {
            $rootScope.zoomData.isShow = false;
            zoomService.resetZoomData();
        }
        $rootScope.editSocialSecurityAge_ok = function (dataObj) {
            $rootScope.PersonaPlan.social_security_age = dataObj.newValue; 
            var objcontrol = $rootScope.findCanvasObjectByName('social_security_age');
            $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;      
            objcontrol.children[0].text = $rootScope.PersonaPlan.start_age;
            $timeout(function () { 
                $rootScope.renderObject();
                $('#OkUpdateSocialSecurityAge').unbind('click tap');
                $('#cancelUpdateSocialSecurityAge').unbind('click tap');            
                $('#SocialSecurityStartAgeDialog').modal('hide');
            }, 2000);  
        },
        $rootScope.editSocialSecurityAge_open = function (dataObj) {
            $rootScope.MinSocialSecurityAge = $rootScope.PersonaPlan.retirement_age > 60 ? parseInt($rootScope.PersonaPlan.retirement_age) : 60;
            $timeout(function () {
                $('#SocialSecurityStartAgeDialog').modal({ backdrop: 'static', keyboard: false });
            }, 1);
        },
        $rootScope.editStartAge_ok = function (dataObj) {
            $rootScope.PersonaPlan.start_age = dataObj.newValue; 
            $timeout(function () { 
                canvas.children[0].text = $rootScope.PersonaPlan.start_age;
                $rootScope.renderObject();
                $('#cancelUpdateStartAge').unbind('click');
                $('#OkUpdateStartAge').unbind('click');
                $('#StartAgeDialog').modal('hide');
            }, 2000);
        },
         $rootScope.editStartAge_open = function (dataObj) {
             $rootScope.MaxStartAge = getMaxStartAge($rootScope);
             $rootScope.MinStartAge = 18;
             $timeout(function () {
                 $('#StartAgeDialog').modal({ backdrop: 'static', keyboard: false });
             }, 1);
         },
        
          $rootScope.editLifeEventToPlayBack_open = function (dataObj) {             
              var index = getIndexOfDataId($rootScope, 'lifeevent', dataObj.newValue.id);
              bindLifeEventtoModalDialog($rootScope, index);
              utilService.updateSelectedDreamType('life_event', true);
              bindToSelectedLifeEvent($rootScope, (dataObj.newValue.starting_age));
              bindLifeEventfromModalDialog($rootScope, index);
              utilService.scopeApply();
              $timeout(function () {                 
                  $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false });                 
              }, 10); 
          },
         $rootScope.editLifeEventToPlayBack_ok = function (dataObj) {
             $timeout(function () {
                 var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
                 bindLifeEventtoModalDialog($rootScope, index, dataObj.newValue);
                 bindToSelectedLifeEvent($rootScope, (dataObj.newValue.starting_age));                 
                 bindLifeEventfromModalDialog($rootScope, index);
                 var obj = $rootScope.findCanvasObjectByName(dataObj.type + '_' + dataObj.newValue.id);
                 var year = dataObj.newValue.starting_age;
                 obj.children[0].text = parseInt(year);
                 obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (year - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
             }, 1);
             setTimeout(function () {
                 $('#lifeeventdialog').modal('hide');
             }, 2000);
         },
        $rootScope.editLifeEventToPlayBack = function (dataObj) {
            $rootScope.editLifeEventToPlayBack_open(dataObj);
            $rootScope.editLifeEventToPlayBack_ok(dataObj); 
        },
        $rootScope.addLifeEventToPlayBack_open = function (dataObj) {
            utilService.updateDefaultValueOfDream($rootScope);
            utilService.updateSelectedDreamType('life_event');
            bindToSelectedLifeEvent($rootScope);
            $timeout(function () {
                $('#lifeeventdialog').modal({ backdrop: 'static', keyboard: false });
                
             //   bindToSelectedLifeEvent($rootScope);
                //var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
                //bindLifeEventtoModalDialog($rootScope, index, dataObj.newValue); 
                //// bindLifeEventtoModalDialog($rootScope, $rootScope.PersonaPlan.lifeEvent.length - 1, dataObj.newValue);
                bindToSelectedLifeEvent($rootScope, dataObj.newValue.starting_age);
            }, 10);
        },
        $rootScope.addLifeEventToPlayBack_ok = function (dataObj) {

            $timeout(function () {
                var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
                bindLifeEventtoModalDialog($rootScope, index, dataObj.newValue);
                bindToSelectedLifeEvent($rootScope, (dataObj.newValue.starting_age));
            }, 300);
            $timeout(function () {
                
                var image = 'Content/images/';
                image = image + dataObj.newValue.dream_type.image_name;
                var index = $rootScope.PersonaPlan.lifeEvent == null ? 0 : $rootScope.PersonaPlan.lifeEvent.length;
                $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length] = dataObj.newValue;
                //    if (angular.isDefined(dataObj.id)) $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length - 1].id = dataObj.id
                var newid = dataObj.newValue.id;
                year = dataObj.newValue.starting_age;
                var newItem = initTimeLineItem(canvas, $rootScope, year, 'lifeevent_' + newid, false, true, image, 'lifeevent', index, newid, utilService, $timeout);
                newItem.dragAndDrop(dragOptions);
                canvas.addChild(newItem);
            }, 1000);
            $timeout(function () {
                $('#lifeeventdialog').modal('hide');
            }, 3000)
        },
        $rootScope.addLifeEventToPlayBack = function (dataObj) { 
            $rootScope.addLifeEventToPlayBack_open(dataObj);
            $rootScope.addLifeEventToPlayBack_ok(dataObj);
        },
         $rootScope.resetPlanForPlayBack = function (dataObj) {
             $rootScope.resetPlanForPlayBack_open(dataObj);
             $rootScope.resetPlanForPlayBack_ok(dataObj);
         },
         $rootScope.resetPlanForPlayBack_open = function (dataObj) {
             $timeout(function () {
                 $rootScope.confirmdialog = {};
                 $rootScope.confirmdialog.title = utilService.translate('Reset Plan');
                 $rootScope.confirmdialog.content = '';
                 if ($rootScope.PersonaPlan.status == 0)
                     $rootScope.confirmdialog.content = utilService.translate('Do you want to reset current plan?');
                 else if ($rootScope.PersonaPlan.status == 1)
                     $rootScope.confirmdialog.content = utilService.translate('Do you want to reset new plan?');
                 $('#confirmdialogbodyContent').html($rootScope.confirmdialog.content);
                 $rootScope.confirmdialog.OkText = utilService.translate('Ok');
                 $rootScope.confirmdialog.cancelText = utilService.translate('Cancel');
                 $('#confirmdialog').modal({ backdrop: 'static', keyboard: false });
             }, 100);
         },
        $rootScope.resetPlanForPlayBack_ok = function (dataObj) {
            $timeout(function () {
                $('#confirmdialog').modal('hide');
                $rootScope.old_broken_age = 0;
                $rootScope.PersonaPlan = dataObj.newValue.plan;
                personalPlanService.updateConvertDataOfPersonalPlan();
                resetValueForBars($rootScope.PersonaPlan);
                RemoveAllDreamAndEventInTimeline();
                reRenderTimelineObject(oCanvas.canvasList[0], $rootScope);
                $rootScope.OrderCanvasItem();
                //// $rootScope.Settings.isAjaxInstantRequest = true;
                //// requestSaveAndUpdateScreen();
                $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
                if ($rootScope.PersonaPlan.status == 0)
                    utilService.showSuccessMessage(utilService.translate('Current plan has been reset.'));
                else if ($rootScope.PersonaPlan.status == 1)
                    utilService.showSuccessMessage(utilService.translate('Resetted new plan'));
                // utilService.LoadDataByUserForShareScreen(dataObj.newValue.user_id);

            }, 10);
        },
        $rootScope.resetPlanForPlayBack_cancel = function (dataObj) {
            $timeout(function () {
                $('#confirmdialog').modal('hide');
                $('#OkConfirm').unbind('click');
                $('#CancelConfirm').unbind('click');
            }, 1);
        },
        $rootScope.removeLifeEventToPlayBack = function (dataObj) {

            var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
            var lifeEvent_Index = getIndexOfDataId($rootScope, 'lifeevent', dataObj.newValue.id);
            $rootScope.PersonaPlan.lifeEvent.splice(lifeEvent_Index, 1);
            var lifeEventObject = findCanvasTimeLineObject(canvas, 'lifeevent', dataObj.newValue.id);
            canvas.removeChild(lifeEventObject);
        },
         $rootScope.deleteLifeEventToPlayBack_open = function (dataObj) {
             $timeout(function () {
                 $('#confirmDeletedialog').modal({ backdrop: 'static', keyboard: false });
             }, 1);
         },
         $rootScope.deleteLifeEventToPlayBack_ok = function (dataObj) {
             $timeout(function () {
                 $('#confirmDeletedialog').modal('hide');
                 var dream_id_delete = dataObj.newValue.dream_id_delete;
                 var lifeevent_id_delete = dataObj.newValue.lifeevent_id_delete;

                 if (dream_id_delete != null)//object delete is dream
                 {
                     if (lifeevent_id_delete != null) {
                         //  utilService.RemoveLifeEvent(lifeevent_id_delete);
                         var lifeEvent_Index = getIndexOfDataId($rootScope, 'lifeevent', lifeevent_id_delete);
                         $rootScope.PersonaPlan.lifeEvent.splice(lifeEvent_Index, 1);
                         var lifeEventObject = findCanvasTimeLineObject(canvas, 'lifeevent', lifeevent_id_delete);
                         canvas.removeChild(lifeEventObject);
                     }
                     //  utilService.RemoveDream(dream_id_delete);
                     $rootScope.PersonaPlan.dreams.splice(dataObj.newValue.index, 1);
                 }
                 else if (lifeevent_id_delete != null) {
                     var lifeEvent_Index = getIndexOfDataId($rootScope, 'lifeevent', lifeevent_id_delete);
                     //  utilService.RemoveLifeEvent(lifeevent_id_delete);
                     $rootScope.PersonaPlan.lifeEvent.splice(lifeEvent_Index, 1);
                 }
                 var obj = $rootScope.findCanvasObjectByName(dataObj.type + "_" + dataObj.newValue.dataid);
                 canvas.removeChild(obj);

             }, 1);
         },
         $rootScope.deleteLifeEventToPlayBack_cancel = function (dataObj) {
             $timeout(function () {
                 $('#confirmDeletedialog').modal('hide');
                 var index;
                 var obj = $rootScope.findCanvasObjectByName(dataObj.type + "_" + (dataObj.newValue.dream_id_delete == null ? dataObj.newValue.lifeevent_id_delete : dataObj.newValue.dream_id_delete));
                 //  var obj = findCanvasTimeLineObject(canvas, dataObj.type, dataObj.newValue.dream_id_delete);
                 obj.children[0].text = dataObj.newValue.YearStartMove;
                 obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (dataObj.newValue.YearStartMove - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                 obj.y = $rootScope.timelineControl.startY;
                 if (dataObj.type == 'dream') {
                     index = getIndexOfDataId($rootScope, 'dream', dataObj.newValue.dataid);
                     $rootScope.PersonaPlan.dreams[index].purchase_age = dataObj.newValue.YearStartMove;
                 }
                 else {
                     index = getIndexOfDataId($rootScope, 'lifeevent', dataObj.newValue.dataid);
                     $rootScope.PersonaPlan.lifeEvent[index].starting_age = dataObj.newValue.YearStartMove;
                 } 
                
             }, 1000);
         },
        $rootScope.deleteLifeEventToPlayBack = function (dataObj) {
            $rootScope.deleteLifeEventToPlayBack_open(dataObj);
            $rootScope.deleteLifeEventToPlayBack_ok(dataObj);
        },
        $rootScope.addDreamToPlayBack_open = function (dataObj) {
            $rootScope.timelineDropYear = $rootScope.PersonaPlan.start_age;
            $rootScope.isEditDream = false;
            utilService.scopeApply();
            utilService.updateDefaultValueOfDream($rootScope);
            bindToSelectedDream($rootScope);
            $timeout(function () {
                utilService.updateSelectedDreamType('dream');
                $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
            }, 1)
        },
         $rootScope.addDreamToPlayBack_ok = function (dataObj) {
             $timeout(function () {
                 $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length] = dataObj.newValue;
                 var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
                 bindDreamtoModalDialog($rootScope, index, dataObj.newValue);
             }, 1);
             $timeout(function () {
                 var image = 'Content/images/';
                 var index = dataObj.newValue.index;
                 var newid = dataObj.newValue.id;
                 image = image + dataObj.newValue.dream_type.image_name;
                 year = dataObj.newValue.purchase_age;
                 var newItem = initTimeLineItem(canvas, $rootScope, year, dataObj.type + '_' + newid, false, true, image, dataObj.type, index, newid, utilService, $timeout);
                 canvas.addChild(newItem);
             }, 1000);
             $timeout(function () {
                 $('#dreamdialog').modal('hide');
             }, 3000);
         }
        $rootScope.addDreamToPlayBack = function (dataObj) {
            $rootScope.addDreamToPlayBack_open(dataObj);
            $rootScope.addDreamToPlayBack_ok(dataObj);
        },
        $rootScope.addDreamToPlayBackward = function (dataObj) {
            utilService.updateDefaultValueOfDream($rootScope);
            $rootScope.isEditDream = false;
            utilService.updateSelectedDreamType(dataObj.type);
            $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length] = dataObj.newValue;
            bindDreamtoModalDialog($rootScope, $rootScope.PersonaPlan.dreams.length - 1);
            var image = 'Content/images/';
            var index = dataObj.newValue.index;
            var newid = dataObj.newValue.id;
            image = image + dataObj.newValue.dream_type.image_name;
            year = dataObj.newValue.purchase_age;
            var newItem = initTimeLineItem(canvas, $rootScope, year, dataObj.type + '_' + newid, false, true, image, dataObj.type, index, newid, utilService, $timeout);
            canvas.addChild(newItem);
        },
        $rootScope.editDreamToPlayBack_open = function (dataObj) {
            $rootScope.isEditDream = true;
            var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
            
            utilService.updateSelectedDreamType(dataObj.type, true);
            $timeout(function () {
                bindDreamtoModalDialog($rootScope, index, dataObj.newValue);
                $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
               
            }, 1);
        },
        $rootScope.editDreamToPlayBack_ok = function (dataObj) {
            $timeout(function () {
                var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
                utilService.updateSelectedDreamType(dataObj.type, true);
                bindDreamtoModalDialog($rootScope, index, dataObj.newValue);
            }, 1);
            $timeout(function () {
                
                var obj = $rootScope.findCanvasObjectByName(dataObj.newValue.dream_type.type + '_' + dataObj.newValue.id);
                var year = dataObj.newValue.purchase_age;
                obj.children[0].text = parseInt(year);
                obj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (year - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
            }, 1000);
            $timeout(function () {
                $('#dreamdialog').modal('hide');
            }, 3000);
        }
        $rootScope.editDreamToPlayBack = function (dataObj) {
            $rootScope.editDreamToPlayBack_open(dataObj);
            $rootScope.editDreamToPlayBack_ok(dataObj);
        },
        $rootScope.actionRemoveDreamEventForAdd = function (dataObj) {
            utilService.updateDefaultValueOfDream($rootScope);
            $rootScope.isEditDream = false;
            utilService.updateSelectedDreamType(dataObj.type);
            $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length] = dataObj.newValue;
            bindDreamtoModalDialog($rootScope, $rootScope.PersonaPlan.dreams.length - 1);
            $timeout(function () {
                $('#dreamdialog').modal({ backdrop: 'static', keyboard: false });
            }, 1) 
            
            $timeout(function () { 
                var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
                if ($rootScope.PersonaPlan.dreams[index].id != undefined) {
                    $rootScope.PersonaPlan.dreams.splice(index, 1);
                    var obj = findCanvasTimeLineObject(canvas, dataObj.type, dataObj.newValue.id);
                    canvas.removeChild(obj);
                }
            }, 1000);
            $timeout(function () {
                $('#dreamdialog').modal('hide');
            }, 1000);
        },
        $rootScope.actionRemoveDreamEvent = function (dataObj) {
            var index = getIndexOfDataId($rootScope, dataObj.type, dataObj.newValue.id);
            if ($rootScope.PersonaPlan.dreams[index].id != undefined) {
                $rootScope.PersonaPlan.dreams.splice(index, 1);
                var obj = findCanvasTimeLineObject(canvas, dataObj.type, dataObj.newValue.id);
                canvas.removeChild(obj);
            }
        },


        /* Eend:PlayBack
         This scope for Play back and Sharing data
        */
         
        $rootScope.findCanvasObjectByName = function (name) { 
            for (var i = 0; i < canvas.children.length; i++) {
                if (canvas.children[i].name && canvas.children[i].name.toString() == name) 
                    return canvas.children[i];
            }
            return null;
        }
        $rootScope.highlightCanvasObject = function (name) {
            var obj = $rootScope.findCanvasObjectByName(name);
            if (obj == null || name == 'BrokenAge')
                return;
            obj.strokeWidth = 2;
        }
        $rootScope.removeHighlightCanvasObject = function (name) {
            var obj = $rootScope.findCanvasObjectByName(name);
            if (obj == null)
                return;
            obj.strokeWidth = 0;
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
        },
        $rootScope.actionMoveRetirementAndSocialAgeForward = function (retirefrom, retireto, retireName, socialName) {
            var Step = 5;                        
            var retireObj = $rootScope.findCanvasObjectByName(retireName);            
            var currentRetireYear = parseInt(retireObj.children[0].text);
            
            var socialObj = $rootScope.findCanvasObjectByName(socialName);
            var currentSocialYear = parseInt(socialObj.children[0].text);
            
            $rootScope.highlightCanvasObject(retireName);
            if (currentRetireYear >= retireto) {
                $rootScope.removeHighlightCanvasObject(retireName);
                retireObj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (retireto - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                socialObj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (retireto - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                retireObj.children[0].text = retireto;
                socialObj.children[0].text = retireto;
                $rootScope.PersonaPlan.retirement_age = retireto;
                $rootScope.PersonaPlan.social_security_age = retireto;
                
                return;
            }
            if (currentRetireYear == currentSocialYear) {
                socialObj.x += Step;
            }
            retireObj.x += Step;
            var year = Math.round(((retireObj.x - $rootScope.timelineControl.startX) * retireObj.pixel) + $rootScope.PersonaPlan.start_age).toString();
            retireObj.children[0].text = year;
            var year1 = Math.round(((socialObj.x - $rootScope.timelineControl.startX) * socialObj.pixel) + $rootScope.PersonaPlan.start_age).toString();
            socialObj.children[0].text = year1;
            
            $rootScope.tempTimer = $timeout(function () { $rootScope.actionMoveRetirementAndSocialAgeForward(retirefrom, retireto, retireName, socialName); }, 15 / $rootScope.fastStep);
            
        },
        $rootScope.actionMoveRetirementAndSocialAgeBackward = function (retirefrom, retireto, socialfrom, socialto, retireName, socialName) {
            var Step = -5;
            var retireObj = $rootScope.findCanvasObjectByName(retireName);            
            var currentRetireYear = parseInt(retireObj.children[0].text);
            
            var socialObj = $rootScope.findCanvasObjectByName(socialName);
            var currentSocialYear = parseInt(socialObj.children[0].text);            
            if (socialfrom > retirefrom)
                $rootScope.highlightCanvasObject(socialName);
            else
                $rootScope.highlightCanvasObject(retireName);
            if (currentRetireYear <= retireto) {
                if (socialfrom > retirefrom)
                    $rootScope.removeHighlightCanvasObject(socialName);
                else
                    $rootScope.removeHighlightCanvasObject(retireName);
                retireObj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (retireto - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                socialObj.x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (socialto - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                retireObj.children[0].text = retireto;
                socialObj.children[0].text = socialto;
                $rootScope.PersonaPlan.retirement_age = retireto;
                $rootScope.PersonaPlan.social_security_age = socialto;
                return;
            }
            if (currentSocialYear >= socialto)
                socialObj.x += Step;
            if (currentSocialYear >= socialto && currentRetireYear >= currentSocialYear)
                retireObj.x += Step;
            else if (currentSocialYear <= socialto)
                retireObj.x += Step;
            var year = Math.round(((retireObj.x - $rootScope.timelineControl.startX) * retireObj.pixel) + $rootScope.PersonaPlan.start_age).toString();
            retireObj.children[0].text = year;
            var year1 = Math.round(((socialObj.x - $rootScope.timelineControl.startX) * socialObj.pixel) + $rootScope.PersonaPlan.start_age).toString();
            socialObj.children[0].text = year1;

            $rootScope.tempTimer = $timeout(function () { $rootScope.actionMoveRetirementAndSocialAgeBackward(retirefrom, retireto, socialfrom, socialto, retireName, socialName); }, 15 / $rootScope.fastStep);
        },
        $rootScope.moveTimelineObject = function (name, fromYear, toYear, moveSpeed) {
            var duration = 2000;
            var obj = $rootScope.findCanvasObjectByName(name);
            $rootScope.highlightCanvasObject(name);

            var fromX = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (fromYear - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
            var toX = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (toYear - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
            if ($rootScope.zoomData.isShow) {
                fromX = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * (fromYear - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                toX = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * (toYear - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
            }
            var numberStep = parseInt(duration / 100);
            var steprange = (toX - fromX) / numberStep;
            for (var i = 0 ; i < numberStep; i++) {
                $timeout(function () {
                    obj.x += steprange;
                    var year = Math.round(((obj.x - $rootScope.timelineControl.startX) * obj.pixel) + $rootScope.PersonaPlan.start_age).toString();
                    obj.children[0].text = year;                    
                }, (100 / $rootScope.playBackPlayerData.forwardSpeed) * i);
                $timeout(function () { $rootScope.removeHighlightCanvasObject(name); }, parseInt(duration / 100) * 100);               
            }
        }        
        $rootScope.ReloadSolutionWork = function () {   
            RemoveAllItemInTimelineByTypeName('retirement_spouse');
            RemoveAllDreamAndEventInTimeline();
            InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout);
            if ($rootScope.profile.client.married_status == 1 && $rootScope.profile.spouse != null) {
                if ($rootScope.profile.spouse.occupation == 1 || $rootScope.profile.spouse.occupation == 2) {
                    var year = 60 - $rootScope.profile.spouse.age + $rootScope.PersonaPlan.start_age;
                    if (year > 81) year = 111;
                    tlService.addSpouseRetirementIcon(year);     
                }
            }
            OrderCanvasItem($rootScope, canvas);
            $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
            $rootScope.MCTopValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
            }
            $rootScope.MCBottomValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
            }
            $timeout(function () {
                $rootScope.ReloadShareScreen();
                if ($rootScope.PersonaPlan.status == 1) {
                    $rootScope.setNewButtonActive();

                } else {
                    $rootScope.setCurrentActive();
                }
            }, 100);

            resetValueForBars($rootScope.currentPlan);
            $rootScope.Settings.isAjaxInstantRequest = true;
            requestSaveAndUpdateScreen();
            reRenderTimelineObject(canvas, $rootScope);
        }
        $rootScope.ReloadShareScreen = function () {
            RemoveAllItemInTimelineByTypeName('retirement_spouse');
            RemoveAllDreamAndEventInTimeline();
            InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout);
            OrderCanvasItem($rootScope, canvas);
            $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
            $rootScope.MCTopValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
            }
            $rootScope.MCBottomValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
            }
            resetValueForBars($rootScope.currentPlan);
            $rootScope.Settings.isAjaxInstantRequest = false;
            requestSaveAndUpdateScreen();
            reRenderTimelineObject(canvas, $rootScope);
        }
        $rootScope.ReloadScenarios = function (isSharing) {
            RemoveAllDreamAndEventInTimeline();
            if ($rootScope.PersonaPlan.status == 0) {
                $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
                personalPlanService.updateConvertDataOfPersonalPlan();
                resetValueForBars($rootScope.currentPlan);
            }
            else if ($rootScope.PersonaPlan.status == 1) {
                $rootScope.PersonaPlan = angular.copy($rootScope.newPlan);
                personalPlanService.updateConvertDataOfPersonalPlan();
                resetValueForBars($rootScope.newPlan);
            }
            InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout);
            OrderCanvasItem($rootScope, canvas);
            $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
            $rootScope.MCTopValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_top_value) * 100) + '%' : "1%"
            }
            $rootScope.MCBottomValue = {
                selected: $rootScope.PersonaPlan != undefined ? parseInt(parseFloat($rootScope.PersonaPlan.mc_bottom_value) * 100) + '%' : "1%"
            }
            
            
            $rootScope.Settings.isAjaxInstantRequest = true;
            if (typeof (isSharing) != 'undefined')
                $rootScope.Settings.isAjaxInstantRequest = false;
            requestSaveAndUpdateScreen();
            reRenderTimelineObject(canvas, $rootScope);
        }
       
        $rootScope.refreshTimelineAfterUpdateProfile = function () {
            RemoveAllDreamAndEventInTimeline();
            InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout);
            OrderCanvasItem($rootScope, canvas);
            $rootScope.Settings.isAjaxInstantRequest = true;
            requestSaveAndUpdateScreen();
            reRenderTimelineObject(canvas, $rootScope);
        }



        var retirementPics = initTimeLineItem(canvas, $rootScope, $rootScope.PersonaPlan.retirement_age, 'retirement_age', true, true, "Content/images/retire.png", "retirement");
        retirementPics.dragAndDrop(dragOptions);
        canvas.addChild(retirementPics);
        //console.log($rootScope.MainResult);
        if ($rootScope.MainResult.broken_age == null) $rootScope.MainResult.broken_age = 87;
        var brokenPig = initTimeLineItem(canvas, $rootScope, $rootScope.MainResult.broken_age, 'BrokenAge', false, false, "Content/images/saving_deleted.png");
        canvas.addChild(brokenPig);
        if ($rootScope.profile.client.married_status == 1 && $rootScope.profile.spouse != null) {
            if ($rootScope.profile.spouse.occupation == 1 || $rootScope.profile.spouse.occupation == 2) {
                var spouseYear = (60 - $rootScope.profile.spouse.age) + $rootScope.profile.client.age;                
                var retirementPics1 = initTimeLineItem(canvas, $rootScope, spouseYear, 'RetirementAgeOfSpouse',  true, true, "Content/images/spouse_retire.png", "retirement_spouse");
                canvas.addChild(retirementPics1);
                self.spouseRetirementPic = retirementPics1;
            }
        }
        OrderCanvasItem($rootScope, canvas);
        $rootScope.anotationForBrokenPig = function () {
            var broken_age = $rootScope.MainResult.broken_age;

            var first_name = $rootScope.profile.client.first_name;
            
            if ($rootScope.PersonaPlan.death_age != null && broken_age != null) {
                if ($rootScope.old_broken_age != broken_age) {
                    if (broken_age <= $rootScope.PersonaPlan.death_age) {
                        brokenPig.children[0].text = broken_age.toString();
                        brokenPig.children[0].y = -60;
                        brokenPig.image = "Content/images/saving_deleted.png";
                        brokenPig.img.src = "Content/images/saving_deleted.png";
                    }
                    else {
                        brokenPig.children[0].text = utilService.translate('Congratulations {{name}}! \nYour goals are all achievable.', { name: $rootScope.profile.client.first_name });
                        brokenPig.children[0].y = -131;
                        brokenPig.image = "Content/images/greenpig.png";
                        brokenPig.img.src = "Content/images/greenpig.png";
                    }

                    var move_x = 0;
                    if ($rootScope.zoomData.isShow) {
                        if (broken_age <= $rootScope.PersonaPlan.death_age) {
                            if (broken_age >= $rootScope.zoomData.minAge && broken_age <= $rootScope.zoomData.maxAge) {
                                move_x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.zoomData.maxAge - $rootScope.zoomData.minAge)) * (broken_age - $rootScope.zoomData.minAge) + $rootScope.timelineControl.startX;
                            } else {
                                 if (broken_age >= (($rootScope.zoomData.minAge + $rootScope.zoomData.maxAge) / 2)) {
                                    move_x = 1500;
                                 } else {
                                    move_x = -200;
                                }
                            }
                        }
                        else
                            move_x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - 35)) * (broken_age - 35) + $rootScope.timelineControl.startX;
                    } else {
                        if (broken_age <= $rootScope.PersonaPlan.death_age)
                            move_x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age)) * (broken_age - $rootScope.PersonaPlan.start_age) + $rootScope.timelineControl.startX;
                        else
                            move_x = (($rootScope.timelineControl.endX - $rootScope.timelineControl.startX) / ($rootScope.PersonaPlan.death_age - 35)) * (broken_age - 35) + $rootScope.timelineControl.startX;
                    }

                    
                    $rootScope.old_broken_age = broken_age;
                    
                    brokenPig.stop().animate({
                        x: move_x

                    }, {
                        duration: "short",
                        easing: "linear",
                        callback: function () { 
                            $rootScope.SendingScreenSharingDataObject(brokenPig, 'move');
                        }
                    });
                }
            }
        }
        
        canvas.setLoop(function () {
            $rootScope.anotationForBrokenPig();
            $rootScope.showSelectedDreamOrLifeEvent();
        }).start();
        
        return {
            canvas: canvas,
            begining: begining,
            ending: ending,
            currentButton: currentButton,
            newButton: newButton,
            saveScenariosButton: saveScenariosButton,
            brokenPig: brokenPig
        };
    }

    this.renderTimeLine = function () {
        RemoveAllDreamAndEventInTimeline();
        $rootScope.InsertDreamAndLifeEvent();
        OrderCanvasItem($rootScope, canvas);        
        $rootScope.reRenderTimelineObject();
    }
    this.renderBrokenAge = function () { }
    this.changeTextOfTimeline = function () {
        $rootScope.translateText = {
            years: $filter('translate')('years')
        }
        try {
            $rootScope.timelineObj = this.timelineObj;
            var currentPlanText = utilService.translate("Current Plan");
            this.timelineObj.currentButton.children[0].text = currentPlanText;
            this.timelineObj.currentButton.children[0].x = 5;
            this.timelineObj.currentButton.children[0].origin.x = 'left';
            this.timelineObj.currentButton.width = this.timelineObj.currentButton.children[0].width + 10;

            var myNewPlanText = utilService.translate("My New Plan");
            this.timelineObj.newButton.children[0].text = myNewPlanText;
            this.timelineObj.newButton.children[0].x = 5;
            this.timelineObj.newButton.children[0].origin.x = 'left';
            this.timelineObj.newButton.x = this.timelineObj.currentButton.x + this.timelineObj.currentButton.width + 15;
            this.timelineObj.newButton.width = this.timelineObj.newButton.children[0].width + 10;
            

            var saveScenarioText = utilService.translate("Save Scenario");
            this.timelineObj.saveScenariosButton.children[0].text = saveScenarioText;
            this.timelineObj.saveScenariosButton.children[0].x = 5;
            this.timelineObj.saveScenariosButton.children[0].origin.x = 'left';
            this.timelineObj.saveScenariosButton.x = this.timelineObj.newButton.x + this.timelineObj.newButton.width + 15;
            this.timelineObj.saveScenariosButton.width = this.timelineObj.saveScenariosButton.children[0].width + 10;
            if (angular.isDefined($rootScope.PersonaPlan) && angular.isDefined($rootScope.PersonaPlan.death_age) && angular.isDefined($rootScope.MainResult) && angular.isDefined($rootScope.MainResult.broken_age)) {
                if ($rootScope.MainResult.broken_age > $rootScope.PersonaPlan.death_age) {
                    var goalArchiveText = utilService.translate('Congratulations {{name}}! \nYour goals are all achievable.', { name: $rootScope.profile.client.first_name });
                }
            }
            if (this.timelineObj.brokenPig != null && this.timelineObj.brokenPig.children != null) {
                this.timelineObj.brokenPig.children[0].text = goalArchiveText;
            }
        } catch (ex) { };
        
    }

    function InsertDreamAndLifeEvent(canvas, $rootScope, dragOptions, utilService, $timeout) {
        var items = [];
        var i = 0;
        angular.forEach($rootScope.PersonaPlan.dreams, function (dream) {

            items[i] = initTimeLineItem(canvas, $rootScope, dream.purchase_age, 'dream_' + dream.id, false, true, "Content/images/" + dream.dream_type.image_name, 'dream', i, dream.id, utilService, $timeout);
            items[i].dragAndDrop(dragOptions);

            canvas.addChild(items[i]);
            i = i + 1;
        });
        var j = 0;
        angular.forEach($rootScope.PersonaPlan.lifeEvent, function (lifes) {

            items[i] = initTimeLineItem(canvas, $rootScope, lifes.starting_age, 'lifeevent_' + lifes.id, false, true, "Content/images/" + lifes.dream_type.image_name, 'lifeevent', j, lifes.id, utilService, $timeout);
            items[i].dragAndDrop(dragOptions);

            canvas.addChild(items[i]);
            i = i + 1;
            j = j + 1;
        });
    }
    function RemoveAllItemInTimelineByTypeName(name) {
        var i = 0;
        var childrens;

        while (oCanvas.canvasList[0].children.length > 0) {
            childrens = oCanvas.canvasList[0].children;
            if (childrens[i] == undefined)
                break; 
            if (childrens[i].datatype != undefined && (childrens[i].datatype == name)) {
                oCanvas.canvasList[0].removeChild(oCanvas.canvasList[0].children[i]);
            } else {
                i++;
            }
        }
    }
    function RemoveAllDreamAndEventInTimeline() {
        var i = 0;
        var childrens;
        
        while (oCanvas.canvasList[0].children.length > 0) { 
            childrens = oCanvas.canvasList[0].children;
            if (childrens[i] == undefined)
                break;
            if (childrens[i].datatype != undefined && (childrens[i].datatype == 'dream' || childrens[i].datatype == 'lifeevent')) {
                oCanvas.canvasList[0].removeChild(oCanvas.canvasList[0].children[i]);
            } else {
                i++;
            }
        }        
    }
    function resetUserPlan() {
        abortRequest(); // clear all request before
        personalPlanService.resetPersonalPlan($rootScope.PersonaPlan.user_id, $rootScope.PersonaPlan.status,
                function (obj) {
                    if (obj != null) {
                        $rootScope.old_broken_age = 0;
                        $rootScope.PersonaPlan = obj.plan;  
                        personalPlanService.updateConvertDataOfPersonalPlan();
                        zoomService.resetZoomData();
                        $rootScope.zoomData.isShow = false;
                        resetValueForBars($rootScope.PersonaPlan);
                        RemoveAllDreamAndEventInTimeline();
                        $rootScope.OrderCanvasItem();
                        reRenderTimelineObject(oCanvas.canvasList[0], $rootScope);
                        $rootScope.Settings.isAjaxInstantRequest = true;
                        requestSaveAndUpdateScreen();
                        $rootScope.ReuseSocialSecurityAge = $rootScope.PersonaPlan.social_security_age;
                        if ($rootScope.PersonaPlan.status == 0)
                            utilService.showSuccessMessage(utilService.translate('Current plan has been reset.'));
                        else if ($rootScope.PersonaPlan.status == 1)
                            utilService.showSuccessMessage(utilService.translate('Resetted new plan'));
                        $rootScope.SendingScreenSharingDataObject(obj, 'resetplan', 'ok', 'confirmdialog');
                    }
                }
        ); 
       
    }
    function requestSaveAndUpdateScreen() {
        $rootScope.PersonaPlanOld = $rootScope.PersonaPlan;
        //if ($rootScope.playBackPlayerData.isPlayBack == false) {
        if (canRequestUpdate()) {
            
                //calculateData();
            if ($rootScope.Settings.isAjaxInstantRequest == true) {
                $rootScope.actionService.updateData();
                isCanRequestInstant(false);
            } else {
                $rootScope.actionService.calculateData();
            }
        }
        //}
    }
    function canSaveAndUpdateScreen() {
        if (!angular.equals($rootScope.PersonaPlanOld, $rootScope.PersonaPlan)) {
            $rootScope.PersonaPlanOld = $rootScope.PersonaPlan;
            $rootScope.actionService.calculateData();
            //calculateData();
        }
    } 
    function abortRequest() {
        return (requestToServer && requestToServer.abort());
    }
    function checkCurrentRequest() {
        if ($rootScope.Settings.isAjaxInstantRequest != null && $rootScope.Settings.isAjaxInstantRequest == true) {
            abortRequest();
            return true;
        }
        if (requestToServer == null || requestToServer.$$state.status == 1) {
            return true;
        }
        return false;
    }
    function aboutCalculator() {
        return (requestCalculator && requestCalculator.abort());
    }
    function checkCalculatorCurrentRequest() {
        if ($rootScope.Settings.isAjaxInstantRequest != null && $rootScope.Settings.isAjaxInstantRequest == true) {

            aboutCalculator();
            return true;
        }
        if (requestCalculator == null || requestCalculator.$$state.status == 1) {
            return true;
        }
        return false;
    }
    function isCanRequestInstant(obj) {
        $rootScope.Settings.isAjaxInstantRequest = obj;
    }   
    // for current saving input
    $rootScope.saveCurrentSaving = function (item) {

        if ($rootScope.functionAccess.CHANGE_CURRENT_SAVING  == 0) return;
   
        if (item == true) {
            $rootScope.SetEventActionTypeForShare('txt-currentSaving', 'end');
        } else {
            $rootScope.SetEventActionTypeForShare('txt-currentSaving', 'begin');
        }
        if ($rootScope.PersonaPlan.current_saving != 'undefined' && ($rootScope.oldValue != $rootScope.PersonaPlan.current_saving)) {
            $rootScope.PersonaPlan.current_saving = $rootScope.PersonaPlan.current_saving;
            $rootScope.Settings.isInstantRequest = item;
            requestSaveAndUpdateScreen();
        }
    }
    $rootScope.receiveDataFromDirective = function (obj) {
        if (obj.totalIncome != undefined) {
            $rootScope.PersonaPlan.income_today = obj.totalIncome;
            $rootScope.PersonaPlan.expense_today = obj.totalExpense;
        }
        if (obj.expense_at_retirement != undefined) {
            //$rootScope.PersonaPlan.expense_at_retirement = obj.expense_at_retirement;                    
        }
        $rootScope.Settings.isInstantRequest = obj.isInstantRequest;
        requestSaveAndUpdateScreen();
    }
    function canRequestUpdate(obj) {
        if (obj != undefined) {
            $rootScope.Settings.isInstantRequest = obj;
        }
        $rootScope.Settings.timeNow = new Date();
        if (utilService.compareTimeWithDelay($rootScope.Settings.timeBefore, $rootScope.Settings.timeNow, $rootScope.Settings.timerDelay) || $rootScope.Settings.isInstantRequest == true) {
            $rootScope.Settings.timeBefore = $rootScope.Settings.timeNow;
            if ($rootScope.Settings.isInstantRequest == true) {
                $rootScope.Settings.isInstantRequest = false;
                isCanRequestInstant(true);
            }
            return true;
        }
        return false;
    }
    var requestToServer = null;
    var requestCalculator = null;
    this.initTimeLineBar = function (reqToServ, reqCal) {
        requestToServer = reqToServ, reqCal;
        this.timelineObj = initTimeline();
    }

    $rootScope.requestSaveAndUpdateScreen = function () {
        requestSaveAndUpdateScreen();
    }
    $rootScope.RequestSaveAndUpdateScreenWithClientActionType = function (ActionType) {
        
        $rootScope.PersonaPlan.ClientActionType = ActionType;
        if (ActionType == 'ChangeTopValue')
            $rootScope.PersonaPlan.mc_top_value = parseInt($rootScope.MCTopValue.selected.replace('%', '')) / 100;
        if (ActionType == 'ChangeBottomValue')
            $rootScope.PersonaPlan.mc_bottom_value = parseInt($rootScope.MCBottomValue.selected.replace('%', '')) / 100;
        $rootScope.SetEventActionTypeForShare(ActionType, 'showing');

        $rootScope.Settings.isAjaxInstantRequest = true;
        requestSaveAndUpdateScreen();
        
    }
    this.spouseRetirementPic = null;
    this.addSpouseRetirementIcon = function (year) {
        var retirementPics = initTimeLineItem(oCanvas.canvasList[0], $rootScope, year, 'RetirementAgeOfSpouse', true, true, "Content/images/spouse_retire.png", "retirement");
        //retirementPics.dragAndDrop(dragOptions);
        oCanvas.canvasList[0].addChild(retirementPics);
        this.spouseRetirementPic = retirementPics;
    }

    this.removeSpouseRetirementIcon = function () {
        if (this.spouseRetirementPic) {
            oCanvas.canvasList[0].removeChild(this.spouseRetirementPic)
        }
    }
    this.selectDreamOrLifeEvent = function () {
        if (typeof ($rootScope.timelineControl.selectedItemOnTimelineId) != 'undefined' && $rootScope.timelineControl.selectedItemOnTimelineId != null && $rootScope.timelineControl.selectedItemOnTimelineId != "") {
            $rootScope.displayObjectByName($rootScope.timelineControl.selectedItemOnTimelineId);
            if (typeof ($rootScope.curent_dream_id_selected) != 'undefined' && $rootScope.curent_dream_id_selected != null) {
                $rootScope.removeHighlightCanvasObject($rootScope.curent_dream_id_selected);
            }
            $rootScope.highlightCanvasObject($rootScope.timelineControl.selectedItemOnTimelineId);
            $rootScope.curent_dream_id_selected = $rootScope.timelineControl.selectedItemOnTimelineId;
            var selected = $rootScope.curent_dream_id_selected;
            $rootScope.SendingScreenSharingDataObject($rootScope.timelineControl.selectedItemOnTimelineId, 'changedropdownlist', 'changed');
            $timeout(function () {
                $rootScope.removeHighlightCanvasObject(selected);
            }, 1500);
        }
    }
     
    ////////// Sharing screen
     
    $rootScope.GetChangedObject = function (obj, typeObject, actionType, actionEvent, controlID, clientActionObjectId, clientActionObjectEvent) {
        var sharingScreenObj;
        if (typeObject == 'sharing') {
            var newValue;
            switch (actionType) {
                case 'move': 
                    newValue = {
                        id: obj.id,
                        x: obj.x,
                        text: obj.children[0].text,
                        image: obj.image,
                        actionEvent: actionEvent,
                        controlID: controlID
                    };
                    if (obj.children[1] != null && obj.children[1].text != null)
                        newValue.text1 = obj.children[1].text;

                    break;
                case 'edit': 
                    switch (obj.datatype) {
                        case 'dream':
                            for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
                                if ($rootScope.PersonaPlan.dreams[i].id == obj.dataid)
                                    newValue = $rootScope.PersonaPlan.dreams[i];
                            }
                            break;
                        case 'lifeevent':
                            for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
                                if ($rootScope.PersonaPlan.lifeEvent[i].id == obj.dataid)
                                    newValue = $rootScope.PersonaPlan.lifeEvent[i];
                            }
                            break;
                        case 'start_age':
                            newValue = $rootScope.PersonaPlan.start_age;
                            break;
                        case 'retireAgeRect':
                            if (obj.name == 'social_security_age') {
                                newValue = $rootScope.PersonaPlan.social_security_age;
                            }
                            break;
                        case 'change-value':
                            newValue = obj.newValue;
                            break;  
                    }
                    break;
                case 'add': 
                    if (obj.datatype == 'dream') { 
                        newValue = $rootScope.PersonaPlan.dreams[$rootScope.PersonaPlan.dreams.length - 1];
                    } else if (obj.datatype == 'lifeevent') { 
                        newValue = $rootScope.PersonaPlan.lifeEvent[$rootScope.PersonaPlan.lifeEvent.length - 1];
                    }
                    break;
                case 'delete':
                    newValue = {
                        dream_id_delete: obj.dream_id_delete,
                        lifeevent_id_delete: obj.lifeevent_id_delete,
                        dataid: obj.dataid,
                        index: obj.index,
                        YearStartMove: obj.YearStartMove
                    };
                    break;
                case 'zoom':
                    newValue = obj;
                    break;
                case 'arrowdown':
                    newValue = obj;
                    break;
                case 'changedropdownlist':
                    newValue = obj;
                    break;
                case 'tab':
                    newValue = obj;
                    break;
                case 'resetplan':
                    newValue = obj;
                    break;
                case 'switch':
                    newValue = obj;
                    break;
            } 
            sharingScreenObj = {
                action: actionType,
                type: obj.datatype,
                tabId: obj.tabId,
                time: null,
                duration: null,
                message: actionType + " " + obj.name,
                index: obj.index,
                scope: obj.scope,
                newValue: newValue,
                oldValue: {
                },
                name: obj.name,
                ///
                actionEvent: actionEvent,
                controlID: controlID,
                clientActionObjectId: clientActionObjectId,
                clientActionObjectEvent: clientActionObjectEvent,
            };
        } else {
            // use for playback
            sharingScreenObj = {
                action: obj.action,
                type: obj.type,
                tabId: obj.tabId,
                time: obj.time,
                duration: obj.duration,
                message: obj.message,
                index: obj.index,
                scope: obj.scope,
                //     data: obj.data,
                id: obj.id,
                image_name: obj.image_name,
                purchase_age: obj.purchase_age,
                newValue: obj.newValue, // Use default value
                oldValue: obj.oldValue,
                name: obj.name,
                old_broken_age: obj.old_broken_age,
                new_broken_age: obj.new_broken_age,
                ///
            };
        }
        return sharingScreenObj;
    }
    // first step:
    $rootScope.SendingScreenSharingDataObject = function (obj, actionType, actionEvent, controlID) {       
        if ($rootScope.isTakeOver == true) {
            var tobj = $rootScope.GetChangedObject(obj, 'sharing', actionType, actionEvent, controlID, $rootScope.clientActionObjectId, $rootScope.clientActionObjectEvent);
            $rootScope.SendShareScreenData(tobj);
            $rootScope.clientActionObjectId = null;
            $rootScope.clientActionObjectEvent = null;
        }
    }
    // end step
    $rootScope.SetEventActionTypeForShare = function (controlId, event) {
        if ($rootScope.isTakeOver == true) {
            $rootScope.clientActionObjectId = controlId;
            $rootScope.clientActionObjectEvent = event;
        }
    };
    $rootScope.showSelectedDreamOrLifeEvent = function () {
        try {
            var result = false;
            $rootScope.timelineControl.timelineItemList = [];
            if ($rootScope.PersonaPlan.retirement_age >= $rootScope.zoomData.minAge && $rootScope.PersonaPlan.retirement_age <= $rootScope.zoomData.maxAge) {
                $rootScope.timelineControl.timelineItemList.push({
                    id: 'retirement_age',
                    name: 'Retirement age'
                });
                result = true;
            }
            angular.forEach($rootScope.PersonaPlan.dreams, function (item) {
                if (item.purchase_age >= $rootScope.zoomData.minAge && item.purchase_age <= $rootScope.zoomData.maxAge) {
                    $rootScope.timelineControl.timelineItemList.push({
                        id: 'dream_' + item.id,
                        name: item.name
                    });
                    result = true;
                }
            });
            angular.forEach($rootScope.PersonaPlan.lifeEvent, function (item) {
                if (item.starting_age >= $rootScope.zoomData.minAge && item.starting_age <= $rootScope.zoomData.maxAge) {
                    $rootScope.timelineControl.timelineItemList.push({
                        id: 'lifeevent_' + item.id,
                        name: item.name
                    });
                    result = true;
                }
            });
            var haveTimelineItemInList = false;
            angular.forEach($rootScope.timelineControl.timelineItemList, function (item) {
                if ($rootScope.timelineControl.selectedItemOnTimelineId == item.id) {
                    haveTimelineItemInList = true;
                }
            });
            if (!haveTimelineItemInList) {
                $rootScope.timelineControl.selectedItemOnTimelineId = null;
            }
            $rootScope.timelineControl.isShowItemOnTimeline = result;
        } catch (ex) { };
    }
    $rootScope.SendShareScreenData = function (obj) {
        var hub = $.connection.controllerHub;
        hub.server.sendtransferData(obj);        
    };
    $rootScope.UpdateControlForShareScreen = function (obj) {
        switch (obj.action) {
            case 'move':
                var objcontrol = $rootScope.findCanvasObjectByName(obj.name);
                if (objcontrol == null)
                    return;  
                if (objcontrol.name == 'begining') {
                    if (obj.actionEvent == 'end') {
                        objcontrol.text = obj.newValue.text;
                        $rootScope.PersonaPlan.start_age = obj.newValue.text;
                        $rootScope.renderObject();
                    }
                } else {
                    objcontrol.x = obj.newValue.x;
                    objcontrol.children[0].text = obj.newValue.text;
                    if (obj.newValue.text1 != null)
                        objcontrol.children[1].text = obj.newValue.text1;
                }
                objcontrol.image = obj.image;
                if (obj.img != undefined && obj.img != null && obj.img.src != undefined && obj.img.src != null)
                    objcontrol.img.src = obj.img.src;
                var nameobj = objcontrol.name;
                if (objcontrol.name == 'begining')
                    nameobj = 'start_age_highlight';
                if (obj.actionEvent == 'moving') { 
                    $rootScope.highlightCanvasObject(nameobj);
                } else {
                    $rootScope.removeHighlightCanvasObject(nameobj);
                }
                break;
            case 'edit': 
                switch (obj.type) {
                    case 'dream':
                        if (obj.actionEvent == 'open')
                            $rootScope.editDreamToPlayBack_open(obj);
                        if (obj.actionEvent == 'ok')
                            $rootScope.editDreamToPlayBack_ok(obj);
                        if (obj.actionEvent == 'cancel')
                            $('#dreamdialog').modal('hide');
                        break;
                    case 'lifeevent':
                        if (obj.actionEvent == 'open')
                            $rootScope.editLifeEventToPlayBack_open(obj);
                        if (obj.actionEvent == 'ok')
                            $rootScope.editLifeEventToPlayBack_ok(obj);
                        if (obj.actionEvent == 'cancel')
                            $('#lifeeventdialog').modal('hide');
                        break;
                    case 'start_age':
                        if (obj.actionEvent == 'open')
                            $rootScope.editStartAge_open(obj);
                        if (obj.actionEvent == 'ok')
                            $rootScope.editStartAge_ok(obj);
                        if (obj.actionEvent == 'cancel') { 
                            $('#cancelUpdateStartAge').unbind('click');
                            $('#OkUpdateStartAge').unbind('click');
                            $('#StartAgeDialog').modal('hide');
                        }
                        break;
                    case 'retireAgeRect':
                        if (obj.actionEvent == 'open')
                            $rootScope.editSocialSecurityAge_open(obj);
                        if (obj.actionEvent == 'ok')
                            $rootScope.editSocialSecurityAge_ok(obj);
                        if (obj.actionEvent == 'cancel') { 
                            $('#OkUpdateSocialSecurityAge').unbind('click tap');
                            $('#cancelUpdateSocialSecurityAge').unbind('click tap');
                            $('#SocialSecurityStartAgeDialog').modal('hide');
                        }
                        break;
                    case 'change-value':
                        if (obj.actionEvent == 'open') {
                            $rootScope.progressBarValue.nameWillChange = obj.newValue.nameWillChange;
                            $rootScope.progressBarValue.changeProgressData = obj.newValue.changeProgressData;
                            $('#changeValueDialog').modal({ backdrop: 'static', keyboard: false });
                        } 
                        else if (obj.actionEvent == 'ok') {
                            $rootScope.progressBarValue.nameWillChange = obj.newValue.nameWillChange;
                            $rootScope.progressBarValue.changeProgressData = obj.newValue.changeProgressData;
                            $rootScope.applyDataChangedForChangeValueDialog();
                            $timeout(function () { 
                                $('#cancelChangeValueOfProgressBar').click();  
                            }, 1500); 
                        }
                        else if (obj.actionEvent == 'cancel') {
                            $('#cancelChangeValueOfProgressBar').click();
                        } 
                        break;
                   
                }
                break;
            case 'zoom':
                switch (obj.actionEvent) {
                    case 'open': 
                    case 'changeMax': 
                    case 'changeIsShow':
                        $rootScope.zoomData.isShow = obj.newValue;
                        break;
                    case 'changeMinAge':
                        $rootScope.zoomData.minAge = obj.newValue;
                        break;
                    case 'changeMaxAge':
                        $rootScope.zoomData.maxAge = obj.newValue;
                        break;
                }
                $timeout(function () {
                    utilService.scopeApply();
                }, 100)

                break;
            case 'arrowdown':
                switch (obj.actionEvent) {
                    case 'click':
                        $rootScope.AgeObjectList = CalculateAgeObjectList($rootScope);
                        $timeout(function () {
                            displayObjectByKey($rootScope, obj.newValue, oCanvas.canvasList[0]);
                        }, 200); 
                    break;
                    case 'arrowdownshow':
                        var year = parseInt(obj.newValue.year);
                        addObjectToAgeObjectList($rootScope, oCanvas.canvasList[0], year, obj.newValue.name);
                        break;
                    case 'arrowdownremove': 
                        removeObjectToAge($rootScope, oCanvas.canvasList[0], parseInt(obj.newValue.year), obj.newValue.name);
                        break;
                }
                break;
            case 'changedropdownlist':
                switch (obj.actionEvent) {
                    case 'changed':
                        utilService.addHighLightClassforDirectId('selectDreamOrEvent');
                        $rootScope.timelineControl.selectedItemOnTimelineId = obj.newValue;
                        $rootScope.timelineService.selectDreamOrLifeEvent();
                        $timeout(function () {
                            utilService.removeHighLightClassforDirectId('selectDreamOrEvent');
                        }, 1500);
                        break;
                }
                break;
            case 'add':
                switch (obj.type) {
                    case 'dream':
                        if (obj.actionEvent == 'open')
                            $rootScope.addDreamToPlayBack_open(obj); 
                        if (obj.actionEvent == 'ok')
                            $rootScope.addDreamToPlayBack_ok(obj);
                        if (obj.actionEvent == 'cancel')
                            $('#dreamdialog').modal('hide');
                        break;
                    case 'lifeevent':
                        if (obj.actionEvent == 'open')
                            $rootScope.addLifeEventToPlayBack_open(obj);
                        if (obj.actionEvent == 'ok')
                            $rootScope.addLifeEventToPlayBack_ok(obj);
                        if (obj.actionEvent == 'cancel')
                            $('#lifeeventdialog').modal('hide');
                        break;
                }
                break;
            case 'delete': 
                if (obj.actionEvent == 'open')
                    $rootScope.deleteLifeEventToPlayBack_open(obj);
                if (obj.actionEvent == 'ok')
                    $rootScope.deleteLifeEventToPlayBack_ok(obj);
                if (obj.actionEvent == 'cancel')
                    $rootScope.deleteLifeEventToPlayBack_cancel(obj);
                break;
            case 'tab':
                switch (obj.controlID) {
                    case 'StartShare':
                        $rootScope.playBackPlayerData.data = obj.newValue;
                        $state.go('main');
                        $rootScope.MainResult = obj.newValue.basic.basic;
                        $rootScope.IncomeExpenseChart = obj.newValue.basic;
                        $rootScope.PersonaPlan = obj.newValue.PersonaPlan;
                        utilService.scopeApply();
                        $timeout(function () {
                            $rootScope.MCTopValue.selected = ($rootScope.PersonaPlan.mc_top_value * 100) + '%';
                            $rootScope.MCBottomValue.selected = (rootScope.PersonaPlan.mc_bottom_value * 100) + '%';
                            personalPlanService.updateConvertDataOfPersonalPlan();
                            repaintchart();
                        }, 200);

                        break;
                    case 'Main':
                       
                        switch (obj.actionEvent) {
                            case 'open':
                                $rootScope.playBackPlayerData.data = $rootScope.MainResult;
                                utilService.scopeApply();
                                $state.go('main');
                                break;
                            case 'change':
                                $rootScope.MainResult = obj.newValue.basic;
                                $rootScope.PersonaPlan = obj.newValue.PersonaPlan; 
                                utilService.scopeApply();
                                resetValueForBars(obj.newValue.PersonaPlan);
                                $timeout(function () {
                                    $rootScope.MCTopValue.selected = ($rootScope.PersonaPlan.mc_top_value * 100) + '%';
                                    $rootScope.MCBottomValue.selected = (rootScope.PersonaPlan.mc_bottom_value * 100) + '%';
                                    personalPlanService.updateConvertDataOfPersonalPlan();
                                }, 100);
                                break;
                            default:
                        } 
                        break;
                    case 'IncomeExpenses': 
                        switch (obj.actionEvent) {
                            case 'open':
                                $rootScope.playBackPlayerData.data = obj.newValue;
                                $state.go('income_expenses');
                                break;
                            case 'change':
                                $rootScope.MainResult = obj.newValue.basic.basic;
                                $rootScope.IncomeExpenseChart = obj.newValue.basic;
                                $rootScope.PersonaPlan = obj.newValue.PersonaPlan;
                                utilService.scopeApply();
                                $timeout(function () {
                                    $rootScope.MCTopValue.selected = ($rootScope.PersonaPlan.mc_top_value * 100) + '%';
                                    $rootScope.MCBottomValue.selected = (rootScope.PersonaPlan.mc_bottom_value * 100) + '%';
                                    personalPlanService.updateConvertDataOfPersonalPlan();
                                    repaintchart();
                                }, 200);
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
                    case 'IlliquidAsset':
                        switch (obj.actionEvent) {
                            case 'open':
                                $rootScope.playBackPlayerData.data = obj.newValue;
                                $state.go('illiquid_asset');
                                break;
                            case 'change':
                                $rootScope.MainResult = obj.newValue.basic.basic;
                                $rootScope.IlliquidCurveChart = obj.newValue.basic;
                                $rootScope.PersonaPlan = obj.newValue.PersonaPlan;
                                utilService.scopeApply();
                                $timeout(function () {
                                    $rootScope.MCTopValue.selected = ($rootScope.PersonaPlan.mc_top_value * 100) + '%';
                                    $rootScope.MCBottomValue.selected = (rootScope.PersonaPlan.mc_bottom_value * 100) + '%';
                                    personalPlanService.updateConvertDataOfPersonalPlan();
                                    repaintchartIlliquid();
                                }, 100);
                                break;
                        }
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
                    case 'Scenario': 
                        ReUpdateForControlByIdForSharing('manageScenario', obj.actionEvent, obj.newValue); 
                        break;
                    case 'Solution':
                        ReUpdateForControlByIdForSharing('manageSolution', obj.actionEvent, obj.newValue);
                        break;
                    case 'currency':
                        $rootScope.changeCurrency(obj.newValue);
                        $timeout(function () {
                            utilService.showSuccessMessage(utilService.translate("Currency has been changed!")); 
                        }, 10);
                        break;
                }
                if (obj.clientActionObjectEvent == 'begin') {
                    if (obj.clientActionObjectId == 'incomeExpensebar' || obj.clientActionObjectId == 'expenseAtRetirement') {
                        utilService.addHighLightClassforProgressbar(obj.clientActionObjectId);
                        $timeout(function () {
                          //  utils.removeHighLightClassforDirectId(obj.clientActionObjectId);
                        }, 1000);
                    }
                    else {
                        utils.addHighLightClassforDirectId(obj.clientActionObjectId);
                        $timeout(function () {
                          //  utils.removeHighLightClassforDirectId(obj.clientActionObjectId);
                        }, 1000);
                    }
                } else if (obj.clientActionObjectEvent == 'showing') { 
                    var controlId = obj.clientActionObjectId;
                    if (obj.clientActionObjectId == 'ChangeTrials')
                        controlId = "numberOfTrials";
                    else if (obj.clientActionObjectId == 'ChangeTopValue')
                        controlId = 'MCTopValue';
                    else if (obj.clientActionObjectId == 'ChangeBottomValue')
                        controlId = 'MCBottomValue';

                    utilService.addHighLightClassforDirectId(controlId);
                    $timeout(function () {
                        utilService.removeHighLightClassforDirectId(controlId);
                    }, 2000);

                } else {
                    if (obj.clientActionObjectId == 'incomeExpensebar' || obj.clientActionObjectId == 'expenseAtRetirement') {
                        utilService.removeHighLightClassforProgressbar(obj.clientActionObjectId);
                    }
                    else {
                        utilService.removeHighLightClassforDirectId(obj.clientActionObjectId);
                    }
                }
                break;
            case 'resetplan':
                if (obj.actionEvent == 'open')
                    $rootScope.resetPlanForPlayBack_open(obj);
                if (obj.actionEvent == 'ok')
                    $rootScope.resetPlanForPlayBack_ok(obj);
                if (obj.actionEvent == 'cancel')
                    $rootScope.resetPlanForPlayBack_cancel(obj);
                break;
            case 'switch':
                if (obj.actionEvent == 'newPlan')
                    $rootScope.switchToNewPlanShare(obj);
                if (obj.actionEvent == 'currentPlan')
                    $rootScope.switchToCurrentPlanShare(obj);
                break;
        }
        
    }
    $rootScope.LoadAndFillDataFromShareToView = function (obj) { 
        $rootScope.currentPlan = obj.currentplan;
        $rootScope.newPlan = obj.newplan;
        $rootScope.PersonaPlan = obj.PersonaPlan;
        personalPlanService.updateConvertDataOfPersonalPlan();
        $rootScope.MainResult = obj.result;
        $rootScope.backupprofile = angular.copy($rootScope.profile.spouse);
        $rootScope.profile.spouse = null;
        utilService.scopeApply();
        $timeout(function () { 
            $rootScope.ReloadShareScreen();
            if ($rootScope.PersonaPlan.status == 1) {
                $rootScope.setNewButtonActive();
            } else {
                $rootScope.setCurrentActive();
            }
            accountService.changeCurrency($rootScope.PersonaPlan.currency_code);
            OrderCanvasItem($rootScope, oCanvas.canvasList[0]);
        }, 200);
        $rootScope.setRequestSessionAlive();
    }
    $rootScope.LoadCurrentUserData = function (obj) {
        $rootScope.removeRequestSessionAlive();
        $rootScope.profile.spouse = angular.copy($rootScope.backupprofile);
        $rootScope.isFirstLoadCurrentcyForSharing = true;
        $timeout(function () {
            utilService.LoadByUser(obj);
            OrderCanvasItem($rootScope, oCanvas.canvasList[0]);
        }, 200);
    }
    $rootScope.reRenderTimelineObject = function () {
        reRenderTimelineObject(timelineObj, $rootScope);
    };
});

function LoadAndFillDataFromShareToView(obj) {
    rootScope.LoadAndFillDataFromShareToView(obj);
}
function UpdateControlForShareScreen(obj) {
    rootScope.UpdateControlForShareScreen(obj);
}
function LoadCurrentUserData(obj) {
    rootScope.LoadCurrentUserData(obj);
}
function resetValueForBars(personalPlan) {
    if (document.getElementById('incomeExpensebar') != undefined) {
        angular.element(document.getElementById('incomeExpensebar')).scope().callfromOutsite(personalPlan);
    }
}