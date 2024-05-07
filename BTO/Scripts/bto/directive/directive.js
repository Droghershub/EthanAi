String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};
btoApp.directive("percent", function ($filter, $locale, $window) {
    var p = function (viewValue) {
        if (viewValue == '') {
            return 0;
        }
        var value = stringToNumber(viewValue);
        return value / 100;
    };

    var stringToNumber = function (value) {
        if (angular.isNumber(parseFloat(value))) {
            if (value.indexOf(',') > 0) {
                var number = angular.copy(value) + '';
                number = number.replaceAll($locale.NUMBER_FORMATS.GROUP_SEP, '');
                number = number.replaceAll($locale.NUMBER_FORMATS.DECIMAL_SEP, '.');
                number = parseFloat(number);
                if (isNaN(number)) {
                    return 0;
                } else {
                    return number;
                }
            } else {
                return value;
            }
        } else {
            var number = angular.copy(value) + '';
            number = number.replaceAll($locale.NUMBER_FORMATS.GROUP_SEP, '');
            number = number.replaceAll($locale.NUMBER_FORMATS.DECIMAL_SEP, '.');
            number = parseFloat(number);
            if (isNaN(number)) {
                return 0;
            } else {
                return number;
            }
        }
    }

    var f = function (modelValue) {
        if (angular.isDefined(modelValue)) {
            return $filter('number')(modelValue * 100, 3) + ' %';
        }
    };
    
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl){
            ctrl.$parsers.unshift(p);
            ctrl.$formatters.unshift(f);
            ele.on('blur', function () {
                if (angular.isDefined(ctrl.$modelValue)) {
                    ele.val($filter('number')(ctrl.$modelValue * 100, 3) + ' %');
                } 
            });
            /*
            ele.on('click', function () {
                if (!$window.getSelection().toString()) {
                    this.setSelectionRange(0, this.value.length)
                }
            });
            */
        }
    };
});
btoApp.directive('uniqueName', function ($http, $rootScope) {
    var toId;
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            //when the scope changes, check the name.
            scope.$watch(attr.ngModel, function (value) {
                if (angular.isUndefined(value)) {
                    ctrl.$setValidity('uniqueName', false);
                    return;
                }
                // if there was a previous attempt, stop it.
                if (toId) clearTimeout(toId);

                toId = setTimeout(function () {
                    
                    $http({ method: 'POST', url: 'api/user_profile/check_email_existing', data: { user_id: $rootScope.PersonaPlan.user_id, email: value } }).success(function (data) {
                        
                        if (data == false) {                            
                            ctrl.$setValidity('uniqueName', true);
                        } else if (data == true) {                            
                            ctrl.$setValidity('uniqueName', false);
                        }
                    }).error(function (data, status, headers, config) {                       
                    });
                }, 200);
            })
        }
    }
});

var tutorialElement = null;
btoApp.directive('tutorial', function ($rootScope, $timeout, $http) {
    $rootScope.tutorialBox = {
        position: null,
        boxSize: null,
        isShow: false,
        isContentShow: false,
        hideTimeout: null,
        showContentTimeout: null,
        isReverse: false
    };

    $rootScope.tutorialContent = {
        id: '',
        title: '',
        content: ''
    }
    $rootScope.hideTutorial = function () {
        $rootScope.tutorialBox.isShow = false;
        $rootScope.tutorialBox.isContentShow = false;
        $timeout.cancel($rootScope.tutorialBox.hideTimeout);
        $timeout.cancel($rootScope.tutorialBox.showContentTimeout);
    }
    $rootScope.showEditTutorial = function () {
        $rootScope.tutorialBox.isShow = false;
        $rootScope.tutorialBox.isContentShow = false;
        $timeout.cancel($rootScope.tutorialBox.hideTimeout);
        $timeout.cancel($rootScope.tutorialBox.showContentTimeout);
    }
    
   
    return {
        restrict: 'A',
        scope: {
            configContentData: '=',
            configData: '='
        },
        link: function (scope, elem, attrs) {
            var position, boxSize;
            var showTutorial = function () {
                if ($rootScope.listTutorial.length == 0) {
                    return;
                }
                $rootScope.tutorialBox.isReverse = false;
                $timeout.cancel($rootScope.tutorialBox.hideTimeout);
                $timeout.cancel($rootScope.tutorialBox.showContentTimeout);
                for (var i = 0; i < $rootScope.listTutorial.length; i++) {
                    if ($rootScope.listTutorial[i].keyid == attrs.tutorial) {
                        if (angular.isDefined($rootScope.listTutorial[i].wasShow)) {
                            return;
                        } else {
                            $rootScope.listTutorial[i].wasShow = true;
                            $http({ method: 'POST', url: 'api/tutorial/UpdateUserTutorial', data: { 'user_login_id': $rootScope.PersonaPlan.user_id, 'keyid': attrs.tutorial, 'is_show_tutorial': true } }).then(function (response) { });
                            $rootScope.tutorialContent.title = $rootScope.listTutorial[i].title;
                            $rootScope.tutorialContent.content = $rootScope.listTutorial[i].content;
                        }
                    }
                }
                
                tutorialElement = angular.element(elem);
                position = getCoords(elem[0]);
                if (angular.isDefined(scope.configData) && angular.isDefined(scope.configData.isReverse) && scope.configData.isReverse == true) {
                    $rootScope.tutorialBox.isReverse = true;
                    position.top = position.top;
                } else {
                    position.top = position.top - 60;
                }
                boxSize = {
                    width: elem.width() + 30,
                    height: elem.height() + 60
                }
                
                if (angular.isDefined(scope.configData) && angular.isDefined(scope.configData.left)) {
                    position.left = position.left + scope.configData.left;
                }
                if (angular.isDefined(scope.configData) && angular.isDefined(scope.configData.top)) {
                    position.top = position.top + scope.configData.top;
                }
                if (angular.isDefined(scope.configData) && angular.isDefined(scope.configData.width)) {
                    boxSize.width = boxSize.width + scope.configData.width;
                }
                if (angular.isDefined(scope.configData) && angular.isDefined(scope.configData.height)) {
                    boxSize.height = boxSize.height + scope.configData.height;
                }
                
               
                $rootScope.tutorialBox.position = angular.copy(position);
                $rootScope.tutorialBox.boxSize = angular.copy(boxSize);
                $rootScope.tutorialBox.isShow = true;
                $rootScope.tutorialBox.isContentShow = false;
                $rootScope.tutorialContent.id = attrs.tutorial;
                $rootScope.apply();
                $rootScope.tutorialBox.hideTimeout = $timeout(function () {
                    $rootScope.tutorialBox.isShow = false;
                    $rootScope.tutorialBox.isContentShow = false;
                    $timeout.cancel($rootScope.tutorialBox.hideTimeout);
                }, 90000);
                $rootScope.tutorialBox.showContentTimeout = $timeout(function () {
                    $rootScope.tutorialBox.isContentShow = true;
                    if (angular.isDefined(scope.configContentData) && angular.isDefined(scope.configContentData.height)) {
                        $rootScope.tutorialBox.boxSize.height = $rootScope.tutorialBox.boxSize.height+ scope.configContentData.height + 60;
                    }
                    if (angular.isDefined(scope.configContentData) && angular.isDefined(scope.configContentData.width)) {
                        $rootScope.tutorialBox.boxSize.width = $rootScope.tutorialBox.boxSize.width +  scope.configContentData.width + 60;
                    }
                    $rootScope.apply();
                }, 3000);
                //console.log(position, boxSize);
            }
            function getCoords(elem) { // crossbrowser version
                var box = elem.getBoundingClientRect();

                var body = document.body;
                var docEl = document.documentElement;

                var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
                var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

                var clientTop = docEl.clientTop || body.clientTop || 0;
                var clientLeft = docEl.clientLeft || body.clientLeft || 0;

                var top = box.top + scrollTop - clientTop;
                var left = box.left + scrollLeft - clientLeft;

                return { top: Math.round(top), left: Math.round(left) };
            }
            //elem.on('mousedown touchstart', showTutorial);
        }
    }
});

btoApp.filter('dreamName', function ($rootScope, ultilService) {
    return function (Id) {
        var dreamName = ultilService.translate('Other residence')
        angular.forEach($rootScope.PersonaPlan.dreams, function (dream) {
            if (dream.id == Id) {
                dreamName = angular.copy(dream.name);
            }
        });
        return dreamName;
    };
});
btoApp.filter('msToTime', function () {
    return function (s) {
        function addZ(n) {
            return (n < 10 ? '0' : '') + n;
        }
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        //return ((hrs > 0) ? addZ(hrs) + ':' : '') + ((mins > 0) ? addZ(mins) + ':' : '') + addZ(secs) + '';
        return  ((hrs > 0) ? addZ(hrs) + 'hh:': '') +   ((mins > 0) ? addZ(mins)+ 'mm:': '') + addZ(secs) + 'ss';
    }
});

btoApp.directive('pageSelect', function() {
    return {
        restrict: 'E',
        template: '<input type="text" class="select-page" ng-model="inputPage" ng-change="selectPage(inputPage)">',
        link: function(scope, element, attrs) {
            scope.$watch('currentPage', function(c) {
                scope.inputPage = c;
            });
        }
    }
});

btoApp.directive('equals', function() {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function(scope, elem, attrs, ngModel) {
            if(!ngModel) return; // do nothing if no ng-model

            // watch own value and re-validate on change
            scope.$watch(attrs.ngModel, function() {
                validate();
            });

            // observe the other value and re-validate on change
            attrs.$observe('equals', function (val) {
                validate();
            });

            var validate = function() {
                // values
                var val1 = ngModel.$viewValue;
                var val2 = attrs.equals;

                // set validity
                ngModel.$setValidity('equals', ! val1 || ! val2 || val1 === val2);
            };
        }
    }
});
//btoApp.directive("disableDirective", function () {
//    function compile(el, attr) {
//        var hasDirective = el[0].querySelectorAll("[" + attr.disableDirective + "]");

//        [].forEach.call(hasDirective, function (el) {
//            el.removeAttribute(attr.disableDirective);
//        });
//    }

//    return {
//        priority: 100000,
//        compile: compile
//    };
//});
/*
btoApp.directive('autofocus', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link : function($scope, $element) {
            $timeout(function () {
                $element[0].focus();
            }, 700);
        }
    }
}]);
*/
function isUpperCase(str) {
    for (var i = 0, len = str.length; i < len; i++) {
        var letter = str.charAt(i);
        var keyCode = letter.charCodeAt(i);
        if (keyCode > 96 && keyCode < 123) {
            return false;
        }
    }

    return true;
}
btoApp.directive('oneUppercase', function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                var check = false;
                var strings = viewValue;
                var i = 0;
                var character = '';
                while (i <= strings.length) {
                    character = strings.charAt(i);
                    if (!isNaN(character * 1)) {
                    } else {
                        if (character == character.toUpperCase()) {
                            check = true;
                        }
                    }
                    i++;
                }                
                ctrl.$setValidity('oneUppercase', check);
                return viewValue;
            })
        }
    }
});

btoApp.directive('oneLowercase', function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                
                var check = false;
                var strings = viewValue;
                var i = 0;
                var character = '';
                while (i <= strings.length) {
                    character = strings.charAt(i);
                    if (!isNaN(character * 1)) {
                    } else {
                        if (character == character.toLowerCase()) {
                            check = true;
                        }
                    }
                    i++;
                }
                ctrl.$setValidity('oneLowercase', check);
                return viewValue;
            })
        }
    }
});
btoApp.directive('oneDigitOrSpecialCharacter', function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                var iChars = "~`!#$%^&*+=-[]\\\';,/{}|\":<>?@";
                var check = false;
                var isSpecialCharacter = false;
                var isDigit = false;
                var strings = viewValue;
                var i = 0;
                var character = '';
                while (i <= strings.length) {
                    character = strings.charAt(i);
                    if (character != '' && !isNaN(character)) {
                        isDigit = true;
                    }
                    
                    if (character != '' && iChars.indexOf(character) != -1) {
                        isSpecialCharacter = true;
                    }
                   
                    i++;
                }
                check = isSpecialCharacter || isDigit;
                ctrl.$setValidity('oneDigitOrSpecialCharacter', check);
                return viewValue;
            })
        }
    }
});
btoApp.directive('match', function ($parse) {
    return {
        require: '?ngModel',
        restrict: 'A',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) {
                return;
            }
            
            var matchGetter = $parse(attrs.match);
            var caselessGetter = $parse(attrs.matchCaseless);
            var noMatchGetter = $parse(attrs.notMatch);
            var matchIgnoreEmptyGetter = $parse(attrs.matchIgnoreEmpty);

            scope.$watch(getMatchValue, function () {
                ctrl.$$parseAndValidate();
            });

            ctrl.$validators.match = function () {
                var match = getMatchValue();
                var notMatch = noMatchGetter(scope);
                var value;
                
                if (matchIgnoreEmptyGetter(scope) && !ctrl.$viewValue) {
                    return true;
                }

                if (caselessGetter(scope)) {
                    value = angular.lowercase(ctrl.$viewValue) === angular.lowercase(match);
                } else {
                    value = ctrl.$viewValue === match;
                }
                /*jslint bitwise: true */
                value ^= notMatch;
                /*jslint bitwise: false */
                return !!value;
            };

            function getMatchValue() {
                var match = matchGetter(scope);
                if (angular.isObject(match) && match.hasOwnProperty('$viewValue')) {
                    match = match.$viewValue;
                }
                return match;
            }
        }
    }
});
btoApp.directive('oneDigit', function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                
                var check = false;
                
                var isDigit = false;
                var strings = viewValue;
                var i = 0;
                var character = '';               
                while (i <= strings.length) {
                    character = strings.charAt(i);                    
                    if (character != '' && !isNaN(character)) {                      
                        isDigit = true;
                    }
                    i++;
                }
                check = isDigit;
                ctrl.$setValidity('oneDigit', check);
                return viewValue;
            })
        }
    }
});
btoApp.directive('oneSpecialCharacter', function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                var iChars = "~`!#$%^&*+=-[]\\\';,/{}|\":<>?@";
                var check = false;
                var isSpecialCharacter = false;
                var strings = viewValue;
                var i = 0;
                var character = '';
                while (i <= strings.length) {
                    character = strings.charAt(i);
                   

                    if (character != '' && iChars.indexOf(character) != -1) {                        
                        isSpecialCharacter = true;
                    }

                    i++;
                }
               
                check = isSpecialCharacter;
                ctrl.$setValidity('oneSpecialCharacter', check);
                return viewValue;
            })
        }
    }
});