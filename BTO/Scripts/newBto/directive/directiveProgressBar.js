
btoApp.run(['$templateCache', function ($templateCache) {
    var template = '<div class="bto-max"></div>' +  // Max Value
               '<div class="bto-bar-wrapper">' +
                   '<div class="bto-pointer"></div>' +  // Pointer to separate slide
                   '<div class="bto-top"  ></div>' +      // Top
                  '<div class="bto-bottom"  ></div>' +   // Bottom
              '</div>';
    $templateCache.put('btoProgressBarTpl.html', template);
}])
btoApp.factory('ProgressBar', ['$document', '$timeout', '$filter', '$rootScope', 'utilService', function ($document, $timeout, $filter, $rootScope, utilService) {
    //'use strict';
    var eventY, newOffset, newValue;
    var percentOfSeparate, isShowSepElem, valueInTopElem, topHeight, bottomHeight, maxValue, valueInTopElem;
    var ProgressBar = function (scope, progressBarElem, attributes) {

        this.id = 0;
        this.percentOfSeparate = 3;
        this.scope = scope;
        this.attributes = attributes;
        this.progressBarElem = progressBarElem;
        this.wrapperElem = null;
        this.maxValueElem = null;
        this.topElem = null;
        this.sepElem = null;
        this.topColor = '#3d8b3d';
        this.bottomColor = '#ee3c80';
        this.color = '#36A747';
        this.topColorReachMax = '#F11F1F';
        this.bottomElem = null;
        this.tracking = '';
        this.mouseDownY = 0;
        this.modelData = 0;
        this.maxValue = 0;
        this.isReachMax = false;
        this.isReverse = false;
        this.isOnlyChangeModel = true;
        this.CLICK_DELAY = 300;
        this.clickCount = 0;

        this.init();
    };
    ProgressBar.prototype = {
        init: function () {
            self = this;
            this.initElemHandles();
            this.updateTopAndBottomElement();
            this.bindingEvent();

        },

        bindingEvent: function () {

            // Move down event
            this.sepElem.on('mousedown', angular.bind(this, this.onStart, this.sepElem, 'sepparate'));
            this.topElem.on('mousedown', angular.bind(this, this.onStart, this.topElem, 'top'));
            this.bottomElem.on('mousedown', angular.bind(this, this.onStart, this.bottomElem, 'bottom'));

            if (this.scope.btoDisabledEvent) {
                $rootScope.functionAccess.showErrorMessage();
                return;
            }
            // touch start event
            this.sepElem.on('touchstart', angular.bind(this, this.onStart, this.sepElem, 'sepparate'));
            this.topElem.on('touchstart', angular.bind(this, this.onStart, this.topElem, 'top'));
            this.bottomElem.on('touchstart', angular.bind(this, this.onStart, this.bottomElem, 'bottom'));

            // Tooltip event
            $(this.topElem).tooltip({ 'animation': true, hide: { effect: "explode", duration: 1000 }, delay: { show: 1000, hide: 500 }, placement: 'top', title: function () { return utilService.translate($(this).attr('data_title')) } });
            $(this.bottomElem).tooltip({ 'animation': true, hide: { effect: "explode", duration: 1000 }, delay: { show: 1000, hide: 500 }, placement: 'bottom', title: function () { return utilService.translate($(this).attr('data_title')) } });


        },

        getEventNames: function (event) {
            var eventNames = { moveEvent: '', endEvent: '' };

            if (event.touches || (event.originalEvent !== undefined && event.originalEvent.touches)) {
                eventNames.moveEvent = 'touchmove';
                eventNames.endEvent = 'touchend';
            }
            else {
                eventNames.moveEvent = 'mousemove';
                eventNames.endEvent = 'mouseup';
            }

            return eventNames;
        },

        onDoubleClick: function (pointer) {
            if (pointer == this.topElem) {
                if (this.isOnlyChangeModel) {
                    if (this.isReverse) {
                        this.callOnDoubleClickOrDoubleTap(true);
                    }
                } else {
                    if (this.isReverse) {
                        this.callOnDoubleClickOrDoubleTap(true)
                    } else {
                        this.callOnDoubleClickOrDoubleTap(false);
                    }
                }
            } else {
                if (this.isOnlyChangeModel) {
                    if (!this.isReverse) {
                        this.callOnDoubleClickOrDoubleTap(true);
                    }
                } else {
                    if (this.isReverse) {
                        this.callOnDoubleClickOrDoubleTap(false)
                    } else {
                        this.callOnDoubleClickOrDoubleTap(true);
                    }
                }
            }
        },

        onStart: function (pointer, ref, event) {
            if (this.scope.btoDisabledEvent) {
                $rootScope.functionAccess.showErrorMessage();
                return;
            }
            // double click
            this.clickCount++;
            var _self = this;
            $timeout(function () {
                _self.clickCount--;
            }, this.CLICK_DELAY);
            if (this.clickCount >= 2) {
                this.onDoubleClick(pointer);
                return;
            }
            var ehMove, ehEnd;
            var eventNames = this.getEventNames(event);

            //event.stopPropagation();
            event.preventDefault();
            if (this.tracking !== '') { return; }

            this.calcViewDimensions();
            this.tracking = ref;
            this.mouseDownY = this.getEventY(event);
            this.modelData = angular.copy(this.scope.modelData);
            if (this.modelData <= 0) { this.modelData = 1; }
            this.maxValue = angular.copy(this.scope.maxValue);
            if (this.maxValue <= 0) { this.maxValue = 1; }


            pointer.addClass('bto-active');

            // Register move move event and mouse up event
            ehMove = angular.bind(this, this.onMove, pointer);
            ehEnd = angular.bind(this, this.onEnd, ehMove);

            $document.on(eventNames.moveEvent, ehMove);
            $document.one(eventNames.endEvent, ehEnd);
            // Show tooltip
            if (pointer == this.topElem) {
                $(this.topElem).tooltip('show');
            }
            if (pointer == this.bottomElem) {
                $(this.bottomElem).tooltip('show');
            }
        },

        onEnd: function (ehMove, event) {
            var moveEventName = this.getEventNames(event).moveEvent;
            this.sepElem.removeClass('bto-active');
            this.topElem.removeClass('bto-active');
            this.bottomElem.removeClass('bto-active');
            $document.off(moveEventName, ehMove);
            this.tracking = '';
            if (this.isReachMax) {
                this.isReverse = true;
                this.progressBarElem.addClass('bto-reverse');
            } else {
                this.isReverse = false;
                this.progressBarElem.removeClass('bto-reverse');
            }
            this.callOnEnd();
        },

        getEventY: function (event) {
            if ('clientY' in event) {
                return event.clientY;
            }
            else {
                return event.originalEvent === undefined ?
                  event.touches[0].clientY
                  : event.originalEvent.touches[0].clientY;
            }
        },

        onMove: function (pointer, event) {

            eventY = this.getEventY(event);
            $(this.topElem).tooltip('hide');
            $(this.bottomElem).tooltip('hide');
            if (pointer == this.sepElem) {
                if (this.isReverse) {
                    if (this.mouseDownY > eventY) {
                        // Move up -> increase model data
                        newOffset = this.mouseDownY - eventY;
                        newValue = (newOffset / (this.bottomElem.bottom - this.bottomElem.top));
                        newValue = this.modelData + Math.ceil(this.modelData * newValue);
                        if (newValue >= 0) {
                            this.scope.modelData = newValue;
                            this.updateTopAndBottomElement();
                            this.callOnChange();
                        }

                    } else {
                        // Move down -> descrease model data
                        newOffset = eventY - this.mouseDownY;
                        newValue = (newOffset / (this.bottomElem.bottom - this.bottomElem.top));
                        newValue = this.modelData - Math.ceil(this.modelData * newValue);
                        if (newValue <= 0) { newValue = 0; }

                        this.scope.modelData = newValue;
                        this.updateTopAndBottomElement();
                        this.callOnChange();


                    }
                } else {
                    if (this.isOnlyChangeModel) return;
                    if (this.mouseDownY > eventY) {
                        // Move up -> increase max
                        newOffset = this.mouseDownY - eventY;
                        newValue = (newOffset / (this.progressBarElem.bottom - this.progressBarElem.top));
                        newValue = Math.ceil(newValue * this.maxValue);
                        newValue = this.maxValue + newValue;
                        if (newValue >= 0) {
                            this.scope.maxValue = newValue;
                            this.updateTopAndBottomElement();
                            this.callOnChange();
                        }
                    } else {
                        // Move down - descrease max
                        newOffset = eventY - this.mouseDownY;
                        newValue = (newOffset / (this.progressBarElem.bottom - this.progressBarElem.top));
                        newValue = Math.ceil(newValue * this.maxValue);
                        newValue = this.maxValue - newValue;
                        if (newValue <= 0) { newValue = 0; }
                        this.scope.maxValue = newValue;
                        this.updateTopAndBottomElement();
                        this.callOnChange();

                    }
                }
            } else if (pointer == this.bottomElem) {
                if (this.isReverse) {
                    if (this.isOnlyChangeModel) return;
                    if (this.mouseDownY > eventY) {
                        // Move up -> increase max Value
                        newOffset = this.mouseDownY - eventY;
                        newValue = (newOffset / (this.bottomElem.bottom - this.bottomElem.top));
                        newValue = this.maxValue + Math.ceil(this.maxValue * newValue);

                        if (newValue >= 0) {
                            this.scope.maxValue = newValue;
                            this.updateTopAndBottomElement();
                            this.callOnChange();
                        }

                    } else {
                        // Move down -> descrease max Vavlue
                        newOffset = eventY - this.mouseDownY;
                        newValue = (newOffset / (this.bottomElem.bottom - this.bottomElem.top));
                        newValue = this.maxValue - Math.ceil(this.maxValue * newValue);
                        if (newValue <= 0) { newValue = 0; }

                        this.scope.maxValue = newValue;
                        this.updateTopAndBottomElement();
                        this.callOnChange();
                    }
                } else {
                    if (this.mouseDownY > eventY) {
                        // Move up -> increase data model
                        newOffset = this.mouseDownY - eventY;
                        newValue = (newOffset / (this.bottomElem.bottom - this.bottomElem.top));
                        newValue = this.modelData + Math.ceil(this.modelData * newValue);
                        if (newValue >= 0) {
                            this.scope.modelData = newValue;
                            this.updateTopAndBottomElement();
                            this.callOnChange();
                        }
                    } else {
                        // Move down - descrease data model
                        newOffset = eventY - this.mouseDownY;
                        newValue = (newOffset / (this.bottomElem.bottom - this.bottomElem.top));
                        newValue = this.modelData - Math.ceil(this.modelData * newValue);
                        if (newValue <= 0) { newValue = 0; }

                        this.scope.modelData = newValue;
                        this.updateTopAndBottomElement();
                        this.callOnChange();

                    }
                }
            } else if (pointer == this.topElem) {

                if (this.isReverse) {
                    if (this.isOnlyChangeModel) {
                        if (this.mouseDownY > eventY) {                            
                            // Move up -> increase model data
                            newOffset = this.mouseDownY - eventY;
                            newValue = (newOffset / (this.topElem.bottom - this.topElem.top));
                            newValue = this.modelData + Math.ceil(this.modelData * newValue);

                            if (newValue >= 0) {
                                this.scope.modelData = newValue;
                                this.updateTopAndBottomElement();
                                this.callOnChange();
                            }
                        } else {                            
                            // Move down -> descrease model data
                            newOffset = eventY - this.mouseDownY;
                            newValue = (newOffset / (this.topElem.bottom - this.topElem.top));
                            newValue = this.modelData - Math.ceil(this.modelData * newValue);
                            if (newValue <= 0) { newValue = 0; }
                            this.scope.modelData = newValue;
                            this.updateTopAndBottomElement();
                            this.callOnChange();
                        }
                    } else {
                        if (this.mouseDownY > eventY) {                            
                            // Move up -> increase model data
                            newOffset = this.mouseDownY - eventY;
                            newValue = (newOffset / (this.topElem.bottom - this.topElem.top));
                            newValue = this.modelData + Math.ceil(this.modelData * newValue);

                            if (newValue >= 0) {
                                this.scope.modelData = newValue;
                                this.updateTopAndBottomElement();
                                this.callOnChange();
                            }
                        } else {                            
                            // Move down -> descrease model data
                            newOffset = eventY - this.mouseDownY;
                            newValue = (newOffset / (this.topElem.bottom - this.topElem.top));
                            newValue = this.modelData - Math.ceil(this.modelData * newValue);
                            if (newValue <= 0) { newValue = 0; }
                            this.scope.modelData = newValue;
                            this.updateTopAndBottomElement();
                            this.callOnChange();
                        }
                    }
                } else {
                    if (this.isOnlyChangeModel) {
                        return;
                    }
                    if (this.mouseDownY > eventY) {                      
                        // Move up -> increase model
                        newOffset = this.mouseDownY - eventY;
                        newValue = (newOffset / (this.topElem.bottom - this.topElem.top));
                        newValue = this.maxValue + Math.ceil(this.maxValue * newValue);
                        if (newValue >= 0) {
                            this.scope.maxValue = newValue;
                            this.updateTopAndBottomElement();
                            this.callOnChange();
                        }
                    } else {                        
                        // Move down - descrease model
                        newOffset = eventY - this.mouseDownY;
                        newValue = (newOffset / (this.topElem.bottom - this.topElem.top));
                        newValue = this.maxValue - Math.ceil(this.maxValue * newValue);
                        if (newValue <= 0) { newValue = 0; }

                        this.scope.maxValue = newValue;
                        this.updateTopAndBottomElement();
                        this.callOnChange();

                    }
                }
            }

        },

        calcViewDimensions: function () {
            this.progressBarElem.top = this.progressBarElem[0].getBoundingClientRect().top;
            this.progressBarElem.bottom = this.progressBarElem[0].getBoundingClientRect().bottom;
            this.bottomElem.top = this.bottomElem[0].getBoundingClientRect().top;
            this.bottomElem.bottom = this.bottomElem[0].getBoundingClientRect().bottom;
            this.topElem.top = this.topElem[0].getBoundingClientRect().top;
            this.topElem.bottom = this.topElem[0].getBoundingClientRect().bottom;
        },


        initElemHandles: function () {
            this.id = this.scope.id;
            // Color
            if (this.scope.progressData.color) {
                this.color = this.scope.progressData.color;
            }
            if (this.scope.progressData.topColor) {
                this.topColor = this.scope.progressData.topColor;
            }
            if (this.scope.progressData.topColorReachMax) {
                this.topColorReachMax = this.scope.progressData.topColorReachMax;
            }
            if (this.scope.progressData.bottomColor) {
                this.bottomColor = this.scope.progressData.bottomColor;
            }
            // only change data model
            if (this.scope.isOnlyChangeModel) {
                this.isOnlyChangeModel = this.scope.isOnlyChangeModel;
                this.progressBarElem.addClass('bto-only-change-model');
                
            } else {
                this.isOnlyChangeModel = false;
            }

            this.maxValueElem = this.progressBarElem.children()[0];
            this.wrapperElem = this.progressBarElem.children();
            angular.forEach(this.wrapperElem.children(), function (elem, index) {
                var jElem = angular.element(elem);
                switch (index) {
                    case 0:
                        this.sepElem = jElem;
                        var percentOfSeparate = this.percentOfSeparate;
                        if (this.isOnlyChangeModel && this.scope.maxValue > this.scope.modelData) {
                            percentOfSeparate = 0;
                        }
                        //this.setHeight(this.sepElem, percentOfSeparate);
                        this.sepElem.css({ display: 'none' });

                        break;
                    case 1:
                        this.topElem = jElem;
                        break;
                    case 2:
                        this.bottomElem = jElem;
                        break;
                    default: break;
                }
            }, this);

        },

        updateTopAndBottomElement: function () {
            percentOfSeparate = angular.copy(this.percentOfSeparate);
            isShowSepElem = true;
            if (this.scope.maxValue >= this.scope.modelData) {
                if (this.isOnlyChangeModel) {
                    this.setHeight(this.sepElem, 0);
                    percentOfSeparate = 0;
                    isShowSepElem = false;
                }
                this.setHeight(this.sepElem, 0);
                isShowSepElem = false;
                percentOfSeparate = 0;
                this.isReachMax = false;
                this.setBackgroundColor(this.sepElem, this.color);
                // Max Value
                this.maxValueElem.innerHTML = '<div class=\'bto-value\'>' + parseInt(this.scope.maxValue) + '</div>';
                // Top element
                valueInTopElem = this.scope.maxValue - this.scope.modelData;
                if (valueInTopElem >= 0) {
                    this.topElem[0].innerHTML = '<div class=\'bto-value\'>' + parseInt(valueInTopElem) + '</div>';
                }
                topHeight = (valueInTopElem / this.scope.maxValue) * (100 - percentOfSeparate);
                if (topHeight <= this.percentOfSeparate) {
                    topHeight = this.percentOfSeparate;
                }
                if (isShowSepElem) {
                    if (topHeight >= 100 - (2 * this.percentOfSeparate)) {
                        topHeight = 100 - (2 * this.percentOfSeparate);
                    }
                } else {
                    if (topHeight >= 100 - this.percentOfSeparate) {
                        topHeight = 100 - this.percentOfSeparate;
                    }
                }

                this.setHeight(this.topElem, topHeight);
                this.setBackgroundColor(this.topElem, this.topColor);
                this.setTitle(this.topElem, this.scope.progressData.toolTipTopText);
                this.topElem.removeClass('bto-reach');

                // Bottom Element
                if (this.scope.modelData >= 0) {
                    this.bottomElem[0].innerHTML = '<div class=\'bto-value\'>' + parseInt(this.scope.modelData) + '</div>';
                }

                bottomHeight = (this.scope.modelData / this.scope.maxValue) * (100 - percentOfSeparate);
                if (bottomHeight <= this.percentOfSeparate) {
                    bottomHeight = this.percentOfSeparate;
                }
                if (isShowSepElem) {
                    if (bottomHeight >= 100 - (2 * this.percentOfSeparate)) {
                        bottomHeight = 100 - (2 * this.percentOfSeparate);
                    }
                } else {
                    if (bottomHeight >= 100 - this.percentOfSeparate) {
                        bottomHeight = 100 - this.percentOfSeparate;
                    }
                }

                this.setHeight(this.bottomElem, bottomHeight);
                this.setBackgroundColor(this.bottomElem, this.bottomColor);
                this.setTitle(this.bottomElem, this.scope.progressData.toolTipBottomText);
            } else {                
                this.isReachMax = true;
                // Max Value
                maxValue = this.scope.maxValue;
                if (maxValue >= 0) {
                    if (this.isOnlyChangeModel) {
                        this.setHeight(this.sepElem, this.percentOfSeparate);
                        isShowSepElem = true;
                    }
                    this.setHeight(this.sepElem, 0);
                    isShowSepElem = false;
                    percentOfSeparate = 0;
                    this.setBackgroundColor(this.sepElem, this.bottomColor);
                    this.maxValueElem.innerHTML = '<div class=\'bto-value bto-reach-max\'>' + parseInt(this.scope.modelData) + '</div>';
                    // Top element
                    valueInTopElem = this.scope.modelData - maxValue;
                    if (valueInTopElem >= 0) {
                        this.topElem[0].innerHTML = '<div class=\'bto-value\'>' + parseInt(valueInTopElem) + '</div>';
                    }
                    topHeight = (valueInTopElem / (maxValue + valueInTopElem)) * (100 - percentOfSeparate);
                    if (topHeight <= this.percentOfSeparate) {
                        topHeight = this.percentOfSeparate;
                    }
                    if (isShowSepElem) {
                        if (topHeight >= 100 - (2 * this.percentOfSeparate)) {
                            topHeight = 100 - (2 * this.percentOfSeparate);
                        }
                    } else {
                        if (topHeight >= 100 - this.percentOfSeparate) {
                            topHeight = 100 - this.percentOfSeparate;
                        }
                    }
                    this.setHeight(this.topElem, topHeight);
                    this.topElem.addClass('bto-reach');
                    this.setBackgroundColor(this.topElem, this.topColorReachMax);
                    
                    this.setTitle(this.topElem, this.scope.progressData.toolTipTopReverseText);
                    // Bottom Element
                    if (this.scope.modelData >= 0) {
                        this.bottomElem[0].innerHTML = '<div class=\'bto-value\'>' + parseInt(this.scope.modelData - valueInTopElem) + '</div>';
                    }
                    bottomHeight = (maxValue / this.scope.modelData) * (100 - percentOfSeparate);
                    if (bottomHeight <= this.percentOfSeparate) {
                        bottomHeight = this.percentOfSeparate;
                    }
                    if (isShowSepElem) {
                        if (bottomHeight >= 100 - (2 * this.percentOfSeparate)) {
                            bottomHeight = 100 - (2 * this.percentOfSeparate);
                        }
                    } else {
                        if (bottomHeight >= 100 - this.percentOfSeparate) {
                            bottomHeight = 100 - this.percentOfSeparate;
                        }
                    }
                    this.setHeight(this.bottomElem, bottomHeight);
                    this.setBackgroundColor(this.bottomElem, this.color);
                    this.setTitle(this.bottomElem, this.scope.progressData.toolTipBottomReverseText);
                }
            }

        },
        setHeight: function (elem, height) {
            elem.css({ height: height + '%' });
        },

        setTitle: function (elem, text) {
            elem.attr('data_title', text);
        },

        setBackgroundColor: function (elem, color) {
            elem.css({ 'background-color': color });
        },

        callOnChange: function () {
            if (this.scope.changeValue) {
                this.scope.changeValue({ data: { 'isReachMax': this.isReachMax, 'modelData': this.scope.modelData, 'maxValue': this.scope.maxValue, 'progressData': this.scope.progressData } });
            }
        },

        callOnDoubleClickOrDoubleTap: function (isChangeModel) {
            if (isChangeModel) {
                if (this.scope.doubleClick) {
                    this.scope.doubleClick({ data: { isChangeModel: isChangeModel } })
                }
            } else {
                if (this.scope.doubleClick) {
                    this.scope.doubleClick({ data: { isChangeModel: isChangeModel } })
                }
            }
        },

        callOnEnd: function () {
            if (this.scope.onEnd) {
                this.scope.onEnd();
            }
        }
    };

    return ProgressBar;
}]);

btoApp.directive('btoProgressBar', ['ProgressBar', function (ProgressBar) {
    //'use strict';
    return {
        transclude: true,
        restrict: 'E',
        scope: {
            progressData: '=',
            modelData: '=',
            maxValue: '=',
            isOnlyChangeModel: '=',
            changeValue: '&changeValue',
            doubleClick: '&doubleClick',
            onEnd: '&onEnd',
            btoDisabledEvent: '='
        },
        templateUrl: function (elem, attrs) {
            return attrs.btoProgressBarTplUrl || 'btoProgressBarTpl.html';
        },

        link: function (scope, elem, attr) {
            var progressBar = new ProgressBar(scope, elem, attr);
            scope.$watch('maxValue', function () {
                progressBar.updateTopAndBottomElement();
            });
            scope.$watch('modelData', function () {
                progressBar.updateTopAndBottomElement();
            });

            return progressBar;
        }
    }
}]);
