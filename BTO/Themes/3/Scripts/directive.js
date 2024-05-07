String.prototype.width = function (font) {
    var f = font || '15px Roboto, sans-serif',
        o = $('<div>' + this + '</div>')
              .css({ 'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f })
              .appendTo($('body')),
        w = o.width();

    o.remove();
    return w + 30;
    //return w + 60;
}
// create material select
btoApp.directive('materialSelect', ['$timeout', '$interval', '$rootScope', '$filter', function ($timeout, $interval, $rootScope, $filter) {
    //'use strict';
    var controller = ['$scope',  function ($scope) {
        $scope.items = []
        $scope.selected_item_id = null;
        $scope.selected_item_label = null;
        $scope.selectItem = function (data) { 
            if ($scope.selected_item_id != data.material_item_id) {
                
                $scope.selected_item_id = data.material_item_id;
                $scope.selected_item_label = $filter('translate')(data.material_item_label);
            
                if (angular.isDefined($scope.valueId) && $scope.valueId != '') {
                    if (data.item_data == null) {
                        
                        $scope.modelData = null;
                    } else {
                        
                        $scope.modelData = data.item_data[$scope.valueId];
                    }
                } else {
                    $scope.modelData = data.item_data;
                }
                
            
                if (angular.isDefined($scope.changeValue)) {
                    $timeout(function () {
                        $scope.changeValue();
                    }, 300)
                }
                
            } 
            if (angular.isDefined($scope.nameID)) {
                var validityCtrl = $scope.ctrl[$scope.nameID];
                validityCtrl.$setDirty();
                validityCtrl.$setValidity('required', true);
                if (angular.isDefined($scope.attr.required)) {
                    if ($scope.modelData == null) {
                        validityCtrl.$setValidity('required', false);
                    }
                }
            }
            
        }

        $scope.clickSelectBox = function () { 
            if ($scope.btoDisabledEvent) {
                $rootScope.functionAccess.showErrorMessage();
            }
        }
    }];
    return {
        transclude: true,
        require: '^form',
        restrict: 'E',
        scope: {
            listData: '=',
            modelData: '=',
            search:'=',
            valueId: '=',
            labelId: '=',
            changeValue: '&changeValue',
            notSelectLabel: '=',
            btoDisabledEvent: '='            
        },
        controller: controller,
        template: function (elem, attrs) {
            var validate = '';
            if (angular.isDefined(attrs.name)) {
                validate += 'name="{{nameID}}"'
            }
            if (angular.isDefined(attrs.required)) {
                validate += ' required="true"';
            }
            var styledisplay = 'style="display:none"';
            if (angular.isDefined(attrs.search) && attrs.search == 'true') {
                styledisplay = '';
            }
            var result = '<div id="{{ID}}-material-select"  class="select-wrapper" >';
            result += '<div class="after select-dropdown">&nbsp;</div>';
            result += '<input  type="text"  class="ng-hide" ' + validate + ' ng-model="modelData" />';
            result += '<input id="{{ID}}-select-input" type="text" class="select-dropdown" readonly="true" ng-click="clickSelectBox();"  ng-model="selected_item_label" data-activates="{{ID}}-select-options" />';
            result += '<ul id="{{ID}}-select-options" class="dropdown-content select-dropdown" >';
            result += '<li ' + styledisplay + ' ng-init="textsearch =\'\'  "><span> <input class="form-control input-search-autocomplete" type="text" id="{{ID}}-input-search" ng-model="textsearch"  /> </span></li>';
            result += '<li class="waves-effect" ng-class="{\'active\':selected_item_id==item.material_item_id}" ng-repeat="item in items | filter:textsearch" ng-click="selectItem(item);"><span>{{item.material_item_label | translate}}</span></li>';
            result += '</ul>';
            result += '</div>';
            return result;
        },
        link: function (scope, elem, attr, ctrl) {
            scope.ctrl = ctrl;
            scope.attr = attr;
            $timeout(function () {
                if (angular.isDefined(attr.name)) {
                    scope.nameID = attr.name;
                }
                scope.ID = attr.id;
                scope.attr = attr;

                elem[0].focus();
            }, 300);
          
            scope.material_elem_attr = attr;
            scope.$watch('modelData', function (newValue) {
                //console.log(newValue);
                if (scope.modelData != null) {
                    if (angular.isDefined(scope.valueId) && scope.valueId != '') {
                        if (angular.isDefined(scope.modelData[scope.valueId])) {
                            scope.selected_item_id = scope.modelData[scope.valueId];
                        } else {
                            scope.selected_item_id = scope.modelData;
                        }
                    } else {
                        scope.selected_item_id = scope.modelData;
                    }
                    if (angular.isDefined(scope.labelId) && scope.labelId != '') {
                        if (angular.isDefined(scope.modelData[scope.labelId])) {
                            scope.selected_item_label = scope.modelData[scope.labelId];
                        } else {
                            scope.selected_item_label = $filter('translate')(scope.notSelectLabel);
                            angular.forEach(scope.items, function (item) {
                                if (item.material_item_id == scope.selected_item_id) {
                                    scope.selected_item_label = $filter('translate')(item.material_item_label);
                                }
                            })
                        }
                    } else {
                        scope.selected_item_label = $filter('translate')(scope.modelData);
                    }
                } else {
                    scope.selected_item_label = $filter('translate')(scope.notSelectLabel);
                }
            });
           
            scope.$watch('listData', function (newValue) {
                var text_width = null;
                scope.items = [];
                var count = 0;
                if (scope.notSelectLabel) {
                    var notSelectedItem = {
                        material_item_id: null,
                        material_item_label: scope.notSelectLabel,
                        item_data: null
                    }
                    scope.items.push(notSelectedItem);
                    if (notSelectedItem) {
                        text_width = $filter('translate')(notSelectedItem.material_item_label).width() + 20;
                    }
                }
                var current_text_width = 0;
                angular.forEach(scope.listData, function (item) {
                    
                    var item_label = '';
                    var item_id = count;
                    if (angular.isDefined(scope.labelId) && scope.labelId != '') {
                        item_label = item[scope.labelId];
                    } else {
                        item_label = item;
                    }
                    if (angular.isDefined(scope.valueId) && scope.valueId != '') {
                        item_id = item[scope.valueId];
                    } else {
                        item_id = item
                    }
                    scope.items.push({
                        material_item_id: item_id,
                        material_item_label: item_label,
                        item_data: item
                    });
                    current_text_width = $filter('translate')(item_label).width();
                    if (current_text_width > text_width) text_width = current_text_width;
                    count++;
                });
                angular.forEach(scope.items, function (item) {
                    if (item.material_item_id == scope.selected_item_id) {
                        scope.selected_item_label = $filter('translate')(item.material_item_label);
                    }
                })
                //console.log(scope.items);
                if (scope.btoDisabledEvent) {
                    $('#' + attr.id + '-select-input').off('mouseenter');
                    $('#' + attr.id + '-select-input').unbind('click');
                } else {
                    $timeout(function () { 
                        $timeout(function () { 
                            if (text_width == null) {
                                $('#' + attr.id + '-select-input').dropdown({ "hover": false});
                            } else {
                                $('#' + attr.id + '-select-input').dropdown({ "hover": false, "text_width": text_width });
                            }
                        }, 300)
                    }, 200)
                }
                
            });
        }
    }
}]);

btoApp.run(function ($rootScope) {
    
    $rootScope.rangeSlideData = {
        max: 30,
        min: 0,
        modelData: 10,
        config: {
            lineColor: '#CBCBCB',
            trackColor: '#039BE5',
            reachMaxColor: '#5444DA',
            reachMaxTrackColor: '#E1F15B',
            boxBackgroundColor: '#039BE5',
            boxColor: '#FAFCFD',
            textChangeModelData: 'Drag to change expense',
            textChangeMaxData: 'Drag to change income'
        },
        isShowPercent: false,
        isCanReachMax: true ,
        specialValues: {
            16: { text: 'US STOCKS – 16%', color: '#C62828' },
            18: { text: 'FOREIGN DEVELOPED STOCKS – 18%', color: '#C62828' },
            24: { text: 'EMERGING MARKET STOCKS – 24%', color: '#C62828' },
            14: { text: 'DIVIDEND GROWTH STOCKS – 14%', color: '#C62828' },
            5: { text: 'US GOVERNMENT BONDS – 5%', color: '#C62828' },
            5: { text: 'CORPORATE BONDS – 5%', color: '#C62828' },
            7: { text: 'EMERGING MARKET BONDS– 7%', color: '#C62828' },
            2: { text: 'MUNICIPAL BONDS – 5%', color: '#C62828' },
            6: { text: 'TIPS – 5% (Treasury Inflation Protected Securities)', color: '#C62828' },
            18: { text: 'REAL ESTATE – 18%', color: '#C62828' },
            22: { text: 'NATURAL RESOURCES – 22%', color: '#C62828' }
        }
    }
    $rootScope.changeValueCallback = function () {
        //console.log('changeValueCallback')
        //console.log($rootScope.rangeSlideData)
    }
    $rootScope.endChangeValueCallback = function () {
        //console.log('endChangeValueCallback')
        //console.log($rootScope.rangeSlideData)
    }
    
});

btoApp.directive('mdSlider', function ($timeout, $mdGesture, $filter, $document, $interval) {
    
    var rangeSlideController = ['$scope', '$timeout', function ($scope, $timeout) {
        $scope.sliderDimensions = {};
        
        function refreshSliderDimensions() {
            $scope.sliderDimensions = $scope.component.trackContainer[0].getBoundingClientRect();
        }
        function positionToPercent(x) {
            
            return Math.max(0, Math.min(1, (x - $scope.sliderDimensions.left) / ($scope.sliderDimensions.width)));
        }
        function percentToValue(percent) {
            return ($scope.min + percent * ($scope.max - $scope.min));
        }
        function valueToPercent(val) {
            return ((val - $scope.min) / ($scope.max - $scope.min)) * 100;
        }
        function showThumbText() {
            if ($scope.specialValue) {
                $scope.thumbText = $scope.specialValue.text;
            } else if ($scope.isReachMax) {
                if ($scope.isShowPercent) {
                    $scope.thumbText = $filter('currency')($scope.max, '', $scope.fractionNumber) + '%';
                } else {
                    $scope.thumbText = $filter('currency')($scope.max, '', $scope.fractionNumber);
                }
            } else if ($scope.isShowPercent) {
                $scope.thumbText = $filter('currency')($scope.modelData, '', $scope.fractionNumber) + '%';
            } else {
                $scope.thumbText = $filter('currency')($scope.modelData, '', $scope.fractionNumber);
            }
    
            $scope.component.thumbText[0].innerHTML = $scope.thumbText;
        }
        function doSlide(x) {
    
            if ($scope.isCanReachMax) {
    
                
                var range = x - $scope.sliderDimensions.left;
                if (range < 0) range = 0;
    
                if ($scope.isReachMaxWhenStart) {
                    $scope.isReachMax = range < $scope.sliderDimensions.width;
                } else {
                    $scope.isReachMax = range > $scope.sliderDimensions.width;
                }
    
                if ($scope.isReachMax) {
                    
                    if ($scope.isReachMaxWhenStart) {
                        if ($scope.isCanChangeMax) {
                            
                            $scope.max = (range / $scope.sliderDimensions.width) * ($scope.modelData - $scope.min);
                            if ($scope.max > $scope.modelData) {
                                $scope.isReachMax = false;
                            }
                        } else {
                            $scope.modelData = (range / $scope.sliderDimensions.width) * ($scope.max - $scope.min);
                        }
                        
                    } else {
                        
                        $scope.modelData = (range / $scope.sliderDimensions.width) * ($scope.max - $scope.min);
                    }
                } else {
                    
                    if ($scope.isCanReachMax) {
                        if ($scope.isCanChangeMax) {
                    
                            if ($scope.isReachMaxWhenStart) {
                    
                                $scope.max = (range / $scope.sliderDimensions.width) * ($scope.modelData - $scope.min);
                                if ($scope.max < $scope.modelData) {
                                    $scope.isReachMax = true;
                                }
                    
                            } else {
                    
                                $scope.modelData = (range / $scope.sliderDimensions.width) * ($scope.max - $scope.min);
                            }
                        } else {
                    
                            if ($scope.isReachMaxWhenStart) {
                                /*
                                $scope.max = (range / $scope.sliderDimensions.width) * ($scope.modelData - $scope.min);
                                if ($scope.max < $scope.modelData) {
                                    $scope.isReachMax = true;
                                }
                                */
                            } else {
                                $scope.modelData = (range / $scope.sliderDimensions.width) * ($scope.max - $scope.min);
                            }
                        }
                    } else {
                        $scope.modelData = percentToValue(positionToPercent(x));
                    }
                }
            } else {
                $scope.modelData = percentToValue(positionToPercent(x));   
            }
            $scope.modelData = parseFloat($scope.modelData.toFixed($scope.fractionNumber))
            //console.log($scope.modelData);
            showThumbText();
            $scope.updateSignPosition();
        }
        function setSliderFromEvent(ev) {
            doSlide(ev.clientX);
           
        }
        $scope.trackWidth = 0;
        $scope.signWidth = 0;
        $scope.signAfterLeft = 0;
        $scope.isActive = false;
        $scope.element = {};
        $scope.isDragging = false;
        $scope.thumText = '';
        $scope.specialValue = null;
        $scope.isInSpecialValue = false;
        $scope.isReachMax = false;
        $scope.isReachMaxWhenStart = false;

        $scope.init = function () {
            if (angular.isDefined($scope.specialValues)) {
                $scope.slideSpecialValue = [];
                angular.forEach(Object.keys($scope.specialValues), function (key) {
                    var value = parseFloat(key).toFixed(4);
                    $scope.slideSpecialValue.push({
                        value: value,
                        data: $scope.specialValues[key]
                    });
                })
            }
            refreshSliderDimensions();
            $scope.updateSignPosition();
        }

        $scope.callChangeValue = function () {
            if (angular.isDefined($scope.changeValue)) { $scope.changeValue(); }
        }

        $scope.callEndChangeValue = function () {
            if (angular.isDefined($scope.endChangeValue)) { $scope.endChangeValue(); }
        }

        $scope.updateSignPosition = function () {
            if ($scope.specialValue != null) {
                $scope.component.signContainer.css('left', '-20px');
                $scope.component.signAfter.css('left', '9px');
                $scope.signAfterLeft = 9;
            }
            if (angular.isDefined($scope.specialValues)) {
                $scope.specialValue = null;
                angular.forEach($scope.slideSpecialValue, function (item) {
                    
                    var leftPercent = parseFloat(item.value);
                    leftPercent = valueToPercent(leftPercent);
                    item.left = leftPercent;
                    if (item.value == $scope.modelData.toFixed(4)) {
                        $scope.specialValue = item.data;
                    }
                })
            }
            
            showThumbText();
            if ($scope.isCanReachMax) {
                
                if ($scope.isReachMaxWhenStart) {
                    if ($scope.isCanChangeMax) {
                        if ($scope.isReachMax) {
                            $scope.trackWidth = $scope.max / ($scope.modelData - $scope.min) * 100;
                        } else {
                            $scope.trackWidth = $scope.modelData / ($scope.max - $scope.min) * 100;
                        }
                        
                    }
                } else {
                    if ($scope.isReachMax) {
                        $scope.trackWidth = $scope.max / ($scope.modelData - $scope.min) * 100;
                    } else {
                        $scope.trackWidth = valueToPercent($scope.modelData);
                    }
                }
            } else {
                
                $scope.trackWidth = valueToPercent($scope.modelData);
            }
            $scope.signWidth = $scope.component.signContainer.width();
            if ($scope.signWidth <= 24) $scope.signWidth = 24;
            //console.log($scope.signWidth,  $scope.component.signContainer.width())
            //$scope.signAfterLeft = 0;
            $scope.component.signContainer.css('left', (0 - $scope.signWidth / 2) + 'px');
            $scope.component.signContainer.css('width', $scope.signWidth + 'px');
            $scope.component.signAfter.css('left', $scope.signAfterLeft + 'px');
            $scope.component.activeTrack.css('width', $scope.trackWidth + '%');
            $scope.component.thumbContainer.css('left', $scope.trackWidth + '%');
            $scope.updateSignBackground();
            
        }
        $scope.intervalApply = null;
        $scope.isDraggingModelDataCircle = false;
        $scope.isDraggingMaxDataCircle = false;
        $scope.onPressDown = function (ev) {
            //console.log('onPressDown');
            //$scope.component.signContainer.css('display', 'block');
            $scope.isFocus = true;
            if ($scope.isCanNotDrag == true) {
                ev.stopPropagation();
                return;
            }
            $scope.intervalApply = $interval(function () {
                $scope.$applyAsync();
            }, 150)
            
            if ($scope.isInModelDataCircle) {
                refreshSliderDimensions();
                $scope.currentModelData = angular.copy($scope.modelData);
                $scope.isDraggingModelDataCircle = true;
                return;
            } else if ($scope.isInMaxDataCircle) {
                refreshSliderDimensions();
                $scope.currentMaxData = angular.copy($scope.max);
                $scope.isDraggingMaxDataCircle = true;
                return;
            }
            $scope.isReachMaxWhenStart = angular.copy($scope.isReachMax);
            var newValue = 0;
            refreshSliderDimensions();
            if ($scope.isInSpecialValue) {
                $scope.specialValue = $scope.specialValueData.data;
                newValue = parseFloat($scope.specialValueData.value);
            } else {
                var percent = positionToPercent(ev.clientX);
                if ($scope.isReachMaxWhenStart) {
                    if ($scope.isCanChangeMax) {
                        newValue = percent * ($scope.modelData - $scope.min);
                    } else {
                    }
                } else {
                    newValue = percentToValue(positionToPercent(ev.clientX));
                }
            }
            
            if ($scope.isReachMaxWhenStart) {
                if ($scope.isCanChangeMax) {
                    if (newValue.toFixed(4) != $scope.max.toFixed(4)) {
            
                        $scope.max = newValue;
                        $scope.updateSignPosition();
                        //$scope.callEndChangeValue();
                    }
                } 
            } else {
                try {
                    if (newValue.toFixed(4) != $scope.modelData.toFixed(4)) {
                        $scope.modelData = newValue
                        $scope.updateSignPosition();
                        // $scope.callEndChangeValue();
                    }
                } catch (e) {
                    console.log('error :', e.message);
                }
                
            }
        }

        $scope.onDragStart = function (ev) {
            //console.log('onDragStart');
            if ($scope.isCanNotDrag == true) {
                ev.stopPropagation();
                return;
            }
            if ($scope.isDraggingModelDataCircle || $scope.isDraggingMaxDataCircle) {
                ev.stopPropagation();
                return;
            } else  if ($scope.isReachMaxWhenStart && !$scope.isCanChangeMax) {
                ev.stopPropagation();
                return;
            } else {
                $scope.isDragging = true;
                ev.stopPropagation();
                $scope.$element.addClass('md-dragging');
                setSliderFromEvent(ev);
            }
            
        }
        $scope.currentModelData = 0;
        $scope.currentMaxData = 0;
        $scope.isFocus = false;
        $scope.isCanNotDrag = false;
        $scope.onDrag = function (ev) {
            //console.log('onDrag');
            if ($scope.isCanNotDrag == true) {
                ev.stopPropagation();
                return;
            }
            if ($scope.isDraggingModelDataCircle || $scope.isDraggingMaxDataCircle) {
                //console.log('X1');
                var percent = 0;
                if (ev.clientX > $scope.sliderDimensions.right) {
                    percent = (ev.clientX - $scope.sliderDimensions.right) / $scope.sliderDimensions.width;
                } else {
                    if (ev.clientX >= $scope.sliderDimensions.left) {
                        percent = (ev.clientX - $scope.sliderDimensions.right) / $scope.sliderDimensions.width;
                    } else {
                        percent = -1;
                    }
                }
                if ($scope.isDraggingModelDataCircle) {
                    //console.log('X2');
                    $scope.modelData = (1 + percent) * $scope.currentModelData;
                    
                } else if ($scope.isDraggingMaxDataCircle) {
                    //console.log('X3');
                    $scope.max = (1 + percent) * $scope.currentMaxData;
                }
                if ($scope.modelData > $scope.max) {
                    if ($scope.isReachMax == false) {
                        $scope.$apply();
                    }
                    $scope.isReachMax = true;
                } else {
                    if ($scope.isReachMax == true) {
                        $scope.$apply();
                    }
                    $scope.isReachMax = false;
                }
                $scope.updateSignPosition();
                $scope.callChangeValue();
                ev.stopPropagation();
                return;
            } else if ($scope.isReachMaxWhenStart && !$scope.isCanChangeMax) {
                //console.log('X4');
                ev.stopPropagation();
                return;
            } else {
                //console.log('X5');
                if (!$scope.isDragging) return;
                setSliderFromEvent(ev);
                $scope.callChangeValue();
                ev.stopPropagation();
            }
        }
        $scope.onDragEnd = function (ev) {
            //console.log('drag end');
            //$scope.component.signContainer.css('display', 'none');
            if ($scope.isDragging || $scope.isDraggingModelDataCircle || $scope.isDraggingMaxDataCircle) {
                ev.stopPropagation();
                $scope.isDragging = false;
                $scope.isDraggingModelDataCircle = false;
                $scope.isDraggingMaxDataCircle = false;
                $scope.callEndChangeValue();
            }
            
        }
        $scope.onPressUp = function (ev) {
            //console.log('press up');
            $interval.cancel($scope.intervalApply);
            if (!$scope.isDragging) {
                $timeout(function () {
                    $scope.callEndChangeValue();
                }, 300);                
            }
        }
        $scope.signBackground = '#fff';
        $scope.updateSignBackground = function () {
            $scope.signBackground = getTheColor($scope.modelData);
        }

        function getTheColor(colorVal) {
            var theColor = "";
            if (colorVal < 12) {
                myRed = 255;
                myGreen = parseInt(((colorVal * 8.34) * 255) / 100);
            }
            else {
                myRed = parseInt(((24 - colorVal) * 8.34) * 255 / 100);
                myGreen = 255;
            }
            theColor = "rgb(" + myRed + "," + myGreen + ",0)";
            return (theColor);
        }
        function addClassname(obj, className) {
            if (obj.className.indexOf(className) == -1) {
                obj.className += ' ' + className;
            }
        }
        function removeClassname(obj, className) {
            if (obj.className.indexOf(className) > -1) {
                obj.className = obj.className.replace(className, '');
            }
        }
        $scope.specialValueData = null;
        $scope.isInModelDataCircle = false;
        $scope.isInMaxDataCircle = false;
        $scope.specialValueHoverIn = function (event, data) {
            
            addClassname(event.currentTarget, 'show-tooltip');
            var left = (0 - event.currentTarget.firstChild.clientWidth / 2) + 5;
            var myEl = angular.element(event.currentTarget.firstChild);
            myEl.css('left', left + 'px');
            if (data == 'modelData') {
                $scope.isInModelDataCircle = true;
                return;
            } else if (data == 'maxData') {
                $scope.isInMaxDataCircle = true;
                return;
            }
            $scope.specialValueData = data;
            $scope.isInSpecialValue = true;    
            
            
        }

        $scope.specialValueHoverOut = function (event, data) {
            removeClassname(event.currentTarget, 'show-tooltip');
            $scope.isInSpecialValue = false;
            $scope.isInModelDataCircle = false;
            $scope.isInMaxDataCircle = false;
            $scope.specialValueData = null;
           
        }
    }];
    return {
        transclude: true,
        restrict: 'E',
        scope: {
            max: '=',
            min: '=',
            modelData: '=',
            btoDisabledEvent: '=',
            isShowPercent: '=',
            isCanReachMax: '=',
            isCanChangeMax: '=',
            config: '=',
            changeValue: '&changeValue',
            endChangeValue: '&endChangeValue',
            specialValues: '=',
            isCanNotDrag: '=',
            isnumber: '=',
            fractionNumber: '='

        },
        controller: rangeSlideController,
        template: function (elem, attrs) {
            
            var template = '<div class="md-slider-wrapper">' +
                '<div class="md-track-container">' +
                  '<div class="md-track" ng-if="!isReachMax" ng-style="{\'background-color\':config.lineColor}"></div>' +
                  '<div class="md-track" ng-if="isReachMax" ng-style="{\'background-color\':config.reachMaxColor}"></div>' +
                  '<div class="md-track md-track-fill" ng-style="{\'background-color\':isReachMax ? config.reachMaxTrackColor : config.trackColor}"></div>' +
                  '<div class="md-track-ticks"><ul>' +
                    '<li ng-if="isCanNotDrag==false" ng-show="isReachMax" class="reach_max_circle" ng-style="{left: \'100%\', \'background-color\': config.boxBackgroundColor}" ng-mouseover="specialValueHoverIn($event, \'modelData\')" ng-mouseleave="specialValueHoverOut($event, \'modelData\')"><div class="tooltip fade in top" role="tooltip"  >{{config.textChangeModelData | translate}}</div></li>' +
                    '<li ng-if="isCanNotDrag==false" ng-show="!isReachMax && isCanChangeMax" class="reach_max_circle" ng-style="{left: \'100%\', \'background-color\': config.reachMaxTrackColor}" ng-mouseover="specialValueHoverIn($event, \'maxData\')" ng-mouseleave="specialValueHoverOut($event, \'maxData\')"><div class="tooltip fade in top" role="tooltip"  >{{config.textChangeMaxData | translate}}</div></li>' +
                    '<li ng-repeat="item in slideSpecialValue" ng-mouseover="specialValueHoverIn($event, item)" ng-mouseleave="specialValueHoverOut($event, item)" ng-style="{left: item.left + \'%\', \'background-color\': item.data.color }"><div class="tooltip fade in top" role="tooltip" >{{item.data.text | translate}}</div></li></ul></div>' +
                '</div>' +
                '<div class="md-thumb-container" >' +
                  '<div class="md-thumb" ng-hide="isCanNotDrag"><div class="after_thumb" ng-style="{\'background-color\': isReachMax? config.reachMaxTrackColor: config.boxBackgroundColor }"></div></div>' +
                  '<div class="md-focus-thumb"></div>' +
                  '<div class="md-focus-ring"></div>' +
                  '<div class="md-sign" ng-style="{\'background-color\': signBackground, \'color\': isReachMax? config.reachMaxColor : config.boxColor}">' +
                    '<span class="md-thumb-text"></span>' +
                    '<div class="after" ng-style="{\'color\': signBackground}" ></div>' +
                  '</div>' +
                  '<div class="md-disabled-thumb"></div>' +
                '</div>' +

                '<div ng-if="isnumber==true" class="min">{{min | number:0 }}<span ng-if="isShowPercent">%</span></div>' +
                '<div ng-if="isnumber==true" class="max" ng-if="!isReachMax" ng-style="{\'background-color\':config.reachMaxTrackColor , \'color\': config.reachMaxColor}">{{max | number:0 }}<span ng-if="isShowPercent">%</span></div>' +

                '<div ng-if="isCanNotDrag==false && isnumber !=true " class="min">{{min | currency:\'\'}}<span ng-if="isShowPercent">%</span></div>' +
                '<div ng-if="isCanNotDrag==false && isnumber !=true " class="max" ng-if="!isReachMax" ng-style="{\'background-color\':config.reachMaxTrackColor , \'color\': config.reachMaxColor}">{{max | currency:\'\'}}<span ng-if="isShowPercent">%</span></div>' +

                '<div ng-if="false" ng-style="{\'background-color\':config.boxBackgroundColor, \'color\': config.boxColor}">{{modelData | currency:\'\'}}<span ng-if="isShowPercent">%</span></div>' +
              '</div><style>#' + attrs.id + ' .md-thumb:after {background-color: {{config.trackColor}}</style>';
            return template;
        },
        link: function (scope, element, attr, ctrl) {
            scope.ID = attr.id;
            scope.component = {
                thumb: angular.element(element[0].querySelector('.md-thumb')),
                thumbText: angular.element(element[0].querySelector('.md-thumb-text')),
                thumbContainer: angular.element(element[0].querySelector('.md-thumb-container')),
                trackContainer: angular.element(element[0].querySelector('.md-track-container')),
                activeTrack: angular.element(element[0].querySelector('.md-track-fill')),
                tickContainer: angular.element(element[0].querySelector('.md-track-ticks')),
                signContainer: angular.element(element[0].querySelector('.md-sign')),
                signAfter: angular.element(element[0].querySelector('.after'))
            };
            if (angular.isDefined(scope.fraction)) {
                scope.fraction = 2;
            }
            scope.component.thumbContainer = scope.component.thumb.parent();
            
            scope.$element = element;
            $mdGesture.register(scope.$element, 'drag');
            scope.$element.on('$md.pressdown', scope.onPressDown);
            scope.$element.on('$md.pressup', scope.onPressUp);
            scope.$element.on('$md.dragstart', scope.onDragStart);
            scope.$element.on('$md.drag', scope.onDrag);
            scope.$element.on('$md.dragend', scope.onDragEnd);
            scope.$element.addClass('md-active');
            
            $timeout(function () {
                scope.init();
            }, 300);
            
            scope.$watch('modelData', function (newData) {
                scope.isReachMax = false;
                if (isNaN(newData) || newData == null || newData < scope.min) {
                    scope.modelData = scope.min;
                } else if (newData > scope.max) {
                    if (scope.isCanReachMax) {
                        scope.isReachMax = true;
                        scope.modelData = newData;
                    } else {
                        scope.modelData = scope.max;
                    }
                } else if (newData < scope.min) {
                    scope.modelData = scope.min;
                } 
                $timeout(function () {
                    scope.updateSignPosition();
                }, 300);
            });
            scope.$watch('max', function (newData, oldData) {
                scope.isReachMax = false;
                if (isNaN(newData) || newData == null || newData < scope.min) {
                    scope.max = scope.min;
                } else if (newData < scope.modelData) {
                    if (scope.isCanReachMax) {
                        scope.isReachMax = true;
                    } else {
                        scope.max = oldData;
                    }
                }
                $timeout(function () {
                    scope.updateSignPosition();
                }, 300);
            });
            
        }
    }
})