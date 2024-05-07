var chart = null;
btoApp.factory('TableChart', ['$document', '$timeout', '$compile', '$window', '$rootScope', function ($document, $timeout, $compile, $window, $rootScope) {
    var TableChart = function (scope, tableChartElem, attributes) {
        this.scope = scope;
        this.id = attributes.id;
        this.scope = scope;
        this.tableChartElem = tableChartElem;
        this.options = {
            height: 120,
            width: 120
        }
        this.valueElement = null;
        this.valueElementTooltip = null;
        this.modelDataX  = angular.copy(scope.modelDataX);
        this.modelDataY = angular.copy(scope.modelDataY);
        this.paths = null;
        this.isMoveCircle = false;
        this.mousePosition = null;
        this.init();
       // this.scope.btoDisabledEvent = false;
        chart = this;
        
    }

    TableChart.prototype = {
        init: function () {
            var self = this;
            this.initHandle();
            
            angular.element($window).bind('resize', function () {
                while (self.paths.children().length > 0) {
                    self.paths.children().first().remove();
                }
                self.draw();
            });
            
            this.draw();
        },


        draw: function () {
            var self = this;
            self.setSize();
            self.addPaths();
            self.drawLinear();
            self.createSpecialValues();
            self.setValue();
        },

        setValue: function () {
            var self = this;
            var id = 'bto_table_chart_value_' + this.id;
            var circleData = {
                'id': id,
                'cx': 0,
                'cy': 0,
                'x_value': this.modelDataX,
                'y_value': this.modelDataY,
                'r': this.scope.configData.valueData.width / 2,
                'fill': this.scope.configData.valueData.color
            }
            this.appendSVG('circle', circleData);
            $timeout(function () {
                self.valueElement = $('#' + id);
                self.valueElementTooltip = self.valueElement.tooltip({
                    'animation': true, hide: { effect: "explode", duration: 1000 }, delay: { show: 1000, hide: 500 }, placement: 'top',
                    title: function () {
                        var x_value = Math.round(self.modelDataX * 100) / 100;
                        var y_value = Math.round(self.modelDataY * 100) / 100;
                        return self.scope.configData.x_title + ': ' + x_value + '% - ' + self.scope.configData.y_title + ': ' + y_value + '% ';
                    },
                    container: 'body'
                });
                var valueElement = $document.find('#' + id);
                valueElement.on('mousedown', angular.bind(self, self.onStart, valueElement, 'value'));
                valueElement.on('touchstart', angular.bind(self, self.onStart, valueElement, 'value'));
                
                self.updateXValue();
                self.updateYValue();
            }, 100);
        },

        onStart: function (pointer, ref, event) {
            if (this.scope.btoDisabledEvent) {
                $rootScope.functionAccess.showErrorMessage();
                return;
            }
            var _self = this;
            var ehMove, ehEnd;
            var eventNames = this.getEventNames(event);

            //event.stopPropagation();
            event.preventDefault();

            ehMove = angular.bind(this, this.onMove, pointer);
            ehEnd = angular.bind(this, this.onEnd, ehMove);

            $document.on(eventNames.moveEvent, ehMove);
            $document.one(eventNames.endEvent, ehEnd);
            this.isMoveCircle = true;

        },

        onEnd: function (ehMove, event) {
            var moveEventName = this.getEventNames(event).moveEvent;
            $document.off(moveEventName, ehMove);
            this.isMoveCircle = false;
            this.callOnChange();
        },

        onMove: function (pointer, event) {
            if (this.scope.btoDisabledEvent) return;
            this.mousePosition = this.getEventXY(event);
            this.valueElementTooltip.tooltip('hide');
            var x = this.mousePosition.X - this.paths.offset().left;
            var y = this.mousePosition.Y - this.paths.offset().top;
            if (x >= 0 && x <= this.options.width && y >= 0 && y <= this.options.height) {
                this.modelDataX = (x / (this.options.width)) * this.scope.configData.max;
                this.updateXValue();
                this.modelDataY = (1 - (y / (this.options.height))) * this.scope.configData.max;
                this.updateYValue();
                this.callOnChange();
            } else {
                if (x > this.options.width) {
                    this.modelDataX = this.scope.configData.max;
                    this.updateXValue();
                    if (y >= 0 && y <= this.options.height) {
                        this.modelDataY = (1 - (y / (this.options.height))) * this.scope.configData.max;
                        this.updateYValue();
                    }
                    this.callOnChange();
                } else if (x < 0) {
                    this.modelDataX = 0;
                    this.updateXValue();
                    if (y >= 0 && y <= this.options.height) {
                        this.modelDataY = (1 - (y / (this.options.height))) * this.scope.configData.max;
                        this.updateYValue();
                    }
                    this.callOnChange();
                }
                
                if (y > this.options.height) {
                    if (x >= 0 && x <= this.options.width) {
                        this.modelDataX = (x / (this.options.width)) * this.scope.configData.max;
                        this.updateXValue();
                    }
                    this.modelDataY = 0;
                    this.updateYValue();
                    this.callOnChange();
                } else if (y < 0) {
                    if (x >= 0 && x <= this.options.width) {
                        this.modelDataX = (x / (this.options.width)) * this.scope.configData.max;
                        this.updateXValue();
                    }
                    this.modelDataY = this.scope.configData.max;
                    this.updateYValue();
                    this.callOnChange();
                }
                
            }
        },

        getEventXY: function (event) {
            var result = {
                X: 0,
                Y: 0
            };
            if ('clientY' in event) {
                result.Y = event.clientY;
            } else {
                result.Y = event.originalEvent === undefined ?
                  event.touches[0].clientY
                  : event.originalEvent.touches[0].clientY;
            }
            if ('clientX' in event) {
                result.X = event.clientX;
            }
            else {
                result.X = event.originalEvent === undefined ?
                  event.touches[0].clientX
                  : event.originalEvent.touches[0].clientX;
            }
            result.X = result.X + $document.scrollLeft();
            result.Y = result.Y + $document.scrollTop();
            return result;
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
        updateXValue: function () {
            var x = (this.modelDataX / this.scope.configData.max) * this.options.width;
            if (this.valueElement) {
                this.valueElement.attr('x_value', this.modelDataX);
                this.valueElement.attr('cx', x);
            }
        },
        updateYValue: function () {
            var y = (1 - this.modelDataY / this.scope.configData.max) * this.options.height;
            if (this.valueElement) {
                this.valueElement.attr('y_value', this.modelDataY);
                this.valueElement.attr('cy', y);
            }
            
        },
        setSize: function () {
            var width = this.tableChartElem.parent().innerWidth();
            if (width > 200) {
                width = 200;
            }
            this.options.width = width * 0.9;
            this.options.height = width * 0.9;
            this.tableChartElem.css({ 'width': width, 'height': width , 'display': 'block'});
        },
        initHandle: function () {
            this.paths = this.tableChartElem.find('.bto-chart__paths');
        },
        addPaths: function () {
            var self = this;
            this.paths.attr('width', this.options.width);
            this.paths.attr('height', this.options.height);
            var id = 'bto_table_chart_rect_' + this.id;
            var rectData = {
                'id': id,
                'x': 0,
                'y': 0,
                'height': this.options.height ,
                'width': this.options.width ,
                'style': 'fill:' + this.scope.configData.rect.fillColor // + ';stroke-width:' + this.scope.configData.rect.borderWidth + ';stroke:' + this.scope.configData.rect.borderColor
            }
            this.appendSVG('rect', rectData);
            $timeout(function () {
                var rectElement = $('#' + id); 
                rectElement.on('mousedown touchstart', function (event) {
                    if (self.scope.btoDisabledEvent) {
                        $rootScope.functionAccess.showErrorMessage();
                        return;
                    }

                    self.valueElementTooltip.tooltip('hide');
                    var parentOffset = $(this).parent().offset();
                    var relativeXPosition = (event.pageX - parentOffset.left);
                    var relativeYPosition = (event.pageY - parentOffset.top);
                    self.modelDataX = (relativeXPosition / (self.options.width)) * self.scope.configData.max;
                    self.updateXValue();
                    self.modelDataY = (1 -  (relativeYPosition / (self.options.height))) * self.scope.configData.max;
                    self.updateYValue();
                    self.callOnChange();
                });

            }, 100);
        },
        hideTooltip: function () {
            var count = 0;
            angular.forEach(this.scope.configData.specialValues, function () {
                var id = '#bto_table_chart_special_' + this.id + '_' + count;
                $(id).tooltip('hide');
                count++;
            });
        },
        createSpecialValues: function () {
            var self = this;
            var count = 0;
            angular.forEach(this.scope.configData.specialValues, function (item, key) {
                var value = parseFloat(key);
                var x = (value / self.scope.configData.max) * self.options.width;
                var y = self.options.height - (x * self.scope.configData.line.linearPortion);
                var id = 'bto_table_chart_special_' + self.id + '_' + count;
                var circleData = {
                    'id': id,
                    'cx': x,
                    'cy': y,
                    'r': self.scope.configData.line.lineWidth / 2,
                    'value': value,
                    'data_title': item.text,
                    'fill': item.color
                }
                var circleElement = self.appendSVG('circle', circleData);
                $timeout(function () {
                    var element = $('#' + id);
                    element.tooltip({ 'animation': true, hide: { effect: "explode", duration: 1000 }, delay: { show: 1000, hide: 500 }, placement: 'top', title: function () { return $(this).attr('data_title') }, container: 'body' });
                    element.on('mousedown touchstart', function () {
                        var value = parseInt($(this).attr('value'));
                        self.modelDataX = value;
                        self.modelDataY = value * self.scope.configData.line.linearPortion;
                        self.updateXValue();
                        self.updateYValue();
                        self.callOnChange();
                    });
                }, 300);
                count++;
            });
        },

        callOnChange: function () {
            if (this.scope.btoDisabledEvent) {
                $rootScope.functionAccess.showErrorMessage();
                return;
            }
            this.hideTooltip();
            if (this.scope.changeValue) {
                this.scope.changeValue({ data: { 'isMoveCircle': this.isMoveCircle, 'modelDataX': this.roundValue(parseFloat(this.modelDataX)), 'modelDataY': this.roundValue(parseFloat(this.modelDataY)) } });
            }
        },

        roundValue: function (value) {
            return Math.round(value * 100) / 100;
        },
        drawLinear: function () {
            var self = this;
            var id = 'bto_table_chart_line_' + this.id;
            var linearData = {
                'id': id,
                'x1': 0,
                'y1': this.options.height,
                'x2': this.options.width,
                'y2': this.options.height * (1 - this.scope.configData.line.linearPortion),
                'stroke': this.scope.configData.line.lineColor,
                'stroke-width': this.scope.configData.line.lineWidth
            }
            this.appendSVG('line', linearData);
            $timeout(function () {
                var lineElement = $document.find('#' + id);
                lineElement.on('mousedown', angular.bind(self, self.clickOnLine, lineElement, 'line'));
                lineElement.on('touchstart', angular.bind(self, self.clickOnLine, lineElement, 'line'));
                
            }, 300);
        },

        clickOnLine: function (pointer, ref, event) {            
            this.mousePosition = this.getEventXY(event);
            this.valueElementTooltip.tooltip('hide');
            var x = this.mousePosition.X - this.paths.offset().left;
            var y = this.mousePosition.Y - this.paths.offset().top;
            this.modelDataX = (x / (this.options.width)) * this.scope.configData.max;
            this.updateXValue();
            this.modelDataY = (1 - (y / (this.options.height))) * this.scope.configData.max;
            this.updateYValue();
            this.callOnChange();

        },
        appendSVG: function (type, attributes) {
            var path = document.createElementNS('http://www.w3.org/2000/svg', type);
            angular.forEach(attributes, function (value, key) {
                path.setAttribute(key, value);
            });
            this.paths.append(path);
            return path;
        },
        

    }
    return TableChart;
}]);
var tmp = null;
btoApp.directive('btoTableChart', ['TableChart', '$compile', function (TableChart, $compile) {
    //'use strict';
    return {
        transclude: true,
        restrict: 'E',
        scope: {
            configData: '=',
            modelDataX: '=',
            modelDataY: '=',
            changeValue: '&changeValue',
            btoDisabledEvent : '=',
        },
        template: function (elem, attrs) {
            var template = '<div id="' + attrs.id + '" class="bto-chart">'
                + '<table border="0" cellspacing="0" cellpadding="0">'
                + '<tr>'
                + '<td class="bto-chart_td_first">{{configData.max}}</td>'
                + '<td colspan="2" rowspan="2">'
                + '<svg class="bto-chart__paths bto-chart__block" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'
                + '</td>'
                + '</tr>'
                + '<tr><td class="bto-chart_td_y_title"><div class="bto-chart_y_title">{{configData.y_title}}</div></td></tr>'
                + '<tr><td class="bto-chart_td_first">0</td><td> <div class="bto-chart_x_title">{{configData.x_title}}</div></td><td class="bto-chart_td_last">{{configData.max}}</td></tr>'
                + '</table>'
                + '</div>'
            return template;
        },

        link: function (scope, elem, attr) {
            var tableChart = new TableChart(scope, elem, attr);
            $compile(elem.contents())(scope);
            scope.$watch('modelDataX', function () {                
                try {
                    var modelDataX = parseFloat(scope.modelDataX);
                    tableChart.modelDataX = modelDataX;
                    tableChart.updateXValue();
                } catch (ex) {
                    scope.modelDataX = 0;
                    tableChart.updateXValue();
                }
            });
            
            scope.$watch('modelDataY', function () {                
                try {
                    tableChart.modelDataY = parseFloat(scope.modelDataY);
                    tableChart.updateYValue();
                } catch (ex) {
                    scope.modelDataY = 0;
                    tableChart.updateYValue();
                }
            });           
            
            return tableChart;
        }

    }
}]);