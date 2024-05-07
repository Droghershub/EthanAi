btoApp.directive('duplicate', function ($http, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                var duplicateList = scope.$eval(attrs.duplicateList);
                var duplicateExceptData = scope.$eval(attrs.duplicateExcept);
                var duplicateId = attrs.duplicate;
                var isValidity = false;
                angular.forEach(duplicateList, function (item) { 
                    if (item[duplicateId].toLowerCase() == viewValue.toLowerCase()) {
                        isValidity = true;
                        if (angular.isDefined(duplicateExceptData.value) && duplicateExceptData.value != null && duplicateExceptData.value == item[duplicateExceptData.key]) {
                            isValidity = false;
                        }
                    }
                });
                if (isValidity) {
                    ctrl.$setValidity('duplicate', false);
                    return '';
                } else {
                    ctrl.$setValidity('duplicate', true);
                    return viewValue;
                }
            });
            
        }
    }
});
btoApp.directive('duplicateNode', function ($http, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var checkDuplicate = true;
            var checkDuplicateNode = function (nodeData, nodeName) {
                //console.log(nodeData);
                if (nodeData != undefined && nodeData != null) {
                    if (nodeData.name == nodeName) {
                        checkDuplicate = false;
                        return;
                    } else {
                        if (angular.isArray(nodeData.nodes) && nodeData.nodes.length > 0) {
                            for (var i = 0; i < nodeData.nodes.length; i++) {
                                checkDuplicateNode(nodeData.nodes[i], nodeName);
                            }
                        }
                    }
                } else {
                    return;
                }
            }
            ctrl.$parsers.unshift(function (viewValue) {
                var duplicateNode = scope.$eval(attrs.duplicateNode);
                checkDuplicate = true;
                checkDuplicateNode(duplicateNode, viewValue);
                if (!checkDuplicate) {
                    ctrl.$setValidity('duplicateNode', false);
                    return undefined;
                } else {
                    ctrl.$setValidity('duplicateNode', true);
                    return viewValue;
                }
            });
        }
    }
});
btoApp.directive('maxMinValue', function ($http, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                var maxMinValue = scope.$eval(attrs.maxMinValue); 
                var maxValue = null, minValue = null;
                if (angular.isDefined(maxMinValue.max) && angular.isNumber(maxMinValue.max)) {
                    maxValue = maxMinValue.max;
                }
                if (angular.isDefined(maxMinValue.min) && angular.isNumber(maxMinValue.min)) {
                    minValue = maxMinValue.min;
                }

                // console.log(maxValue, minValue);

                var isValidity = false, viewNumber = parseFloat(viewValue); 
                if (maxValue == null && minValue == null) {
                    isValidity = true;
                } else if ((maxValue == null || isNaN(maxValue)) && angular.isNumber(minValue)) {
                    if (viewNumber >= minValue) {
                        isValidity = true;
                    }
                } else if ((minValue == null || isNaN(minValue)) && angular.isNumber(maxValue)) {
                    if (viewNumber <= maxValue) {
                        isValidity = true;
                    }
                } else if (angular.isNumber(minValue) && angular.isNumber(maxValue)) {
                    if (viewNumber >= minValue && viewNumber <= maxValue) {
                        isValidity = true;
                    }
                }
                
                if (isValidity) {
                    ctrl.$setValidity('maxMinValue', isValidity);
                    return viewNumber;
                } else {
                    ctrl.$setValidity('maxMinValue', isValidity);
                    return undefined;
                }
            })
        }
    }
});
btoApp.directive('isNumber', function ($http, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                viewNumber = parseFloat(viewValue);
                if (isNaN(viewNumber)) {
                    ctrl.$setValidity('isNumber', false);
                    return undefined;
                } else {    
                    ctrl.$setValidity('isNumber', true);
                    return viewNumber;
                }
            })
        }
    }
});

btoApp.directive('isNumberOrEmpty', function ($http, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {              
                if (viewValue==null || viewValue == '') {
                    //console.log('X1');
                    ctrl.$setValidity('isNumberOrEmpty', true);
                    return null;
                } else {
                    viewNumber = parseFloat(viewValue);
                    if (isNaN(viewNumber)) {                       
                        ctrl.$setValidity('isNumberOrEmpty', false);
                        return undefined;
                    } else {                        
                        ctrl.$setValidity('isNumberOrEmpty', true);
                        return viewNumber;
                    }
                }
            })
        }
    }
});

btoApp.directive('lessThan', function ($http, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                var lessThan = scope.$eval(attrs.lessThan);
                var lessThanValue = null;
                if (angular.isDefined(lessThan) && angular.isNumber(lessThan)) {
                    lessThanValue = lessThan;
                }
                var isValidity = false, viewNumber = parseFloat(viewValue);
                if (isNaN(viewNumber)) {
                    isValidity = true;
                } else if (lessThanValue == null) {
                    isValidity = true;
                } else {
                    if (viewNumber <= lessThanValue) {
                        isValidity = true;
                    } else {
                        isValidity = false;
                    }
                }              
                if (isValidity) {
                    ctrl.$setValidity('lessThan', isValidity);
                    if (isNaN(viewNumber)) {
                        return null;
                    } else {
                        return viewNumber;
                    }
                } else {
                    ctrl.$setValidity('lessThan', false);
                    return undefined;
                }
            })
        }
    }
});

btoApp.directive('lessThanOther', function ($http, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                var lessThan = scope.$eval(attrs.lessThanOther);
                var lessThanValue = null;
                if (angular.isDefined(lessThan) && angular.isNumber(lessThan)) {
                    lessThanValue = lessThan;
                }
                var isValidity = false, viewNumber = parseFloat(viewValue);
                if (isNaN(viewNumber)) {
                    isValidity = true;
                } else if (lessThanValue == null) {
                    isValidity = true;
                } else {
                    if (viewNumber <= lessThanValue) {
                        isValidity = true;
                    } else {
                        isValidity = false;
                    }
                }                
               
                if (isValidity) {
                    ctrl.$setValidity('lessThanOther', isValidity);
                    if (isNaN(viewNumber)) {
                        return null;
                    } else {
                        return viewNumber;
                    }
                } else {
                    ctrl.$setValidity('lessThanOther', false);
                    return undefined;
                }
            })
        }
    }
});

btoApp.directive('greaterThan', function ($http, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {

                var greaterThan = scope.$eval(attrs.greaterThan);
                var greaterThanValue = null;
                if (angular.isDefined(greaterThan) && angular.isNumber(greaterThan)) {
                    greaterThanValue = greaterThan;
                }
                var isValidity = false, viewNumber = parseFloat(viewValue);
                if (isNaN(viewNumber)) {
                    isValidity = true;
                } else if (greaterThanValue == null) {
                    isValidity = true;
                } else {
                    if (viewNumber >= greaterThanValue) {
                        isValidity = true;
                    } else {
                        isValidity = false;
                    }
                }                
                
                if (isValidity) {                    
                    ctrl.$setValidity('greaterThan', isValidity);
                    if (isNaN(viewNumber)) {
                        return null;
                    } else {
                        return viewNumber;
                    }
                } else {                    
                    ctrl.$setValidity('greaterThan', false);
                    return undefined;
                }
            })
        }
    }
});

btoApp.directive('greaterThanOther', function ($http, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {

                var greaterThan = scope.$eval(attrs.greaterThanOther);
                var greaterThanValue = null;
                if (angular.isDefined(greaterThan) && angular.isNumber(greaterThan)) {
                    greaterThanValue = greaterThan;
                }
                var isValidity = false, viewNumber = parseFloat(viewValue);
                if (isNaN(viewNumber)) {
                    isValidity = true;
                } else if (greaterThanValue == null) {
                    isValidity = true;
                } else {
                    if (viewNumber >= greaterThanValue) {
                        isValidity = true;
                    } else {
                        isValidity = false;
                    }
                }
                
                if (isValidity) {                   
                    ctrl.$setValidity('greaterThanOther', isValidity);
                    if (isNaN(viewNumber)) {
                        return null;
                    } else {
                        return viewNumber;
                    }
                    
                } else {                    
                    ctrl.$setValidity('greaterThanOther', false);
                    return undefined;
                }
            })
        }
    }
});

btoApp.directive('pageSelect', function () {
    return {
        restrict: 'E',
        template: '<input type="text" class="select-page" ng-model="inputPage" ng-change="selectPage(inputPage)">',
        link: function (scope, element, attrs) {
            scope.$watch('currentPage', function (c) {
                scope.inputPage = c;
            });
        }
    }
});

