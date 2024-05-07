var gauge = null;
btoApp.factory('GaugeChart', ['$document', '$timeout', '$compile', '$window', '$filter', '$rootScope', function ($document, $timeout, $compile, $window, $filter, $rootScope) {
    var GaugeChart = function (scope, gaugeChartElem, attributes) {
        this.scope = scope;
        this.id = attributes.id;
        this.paths = null;
        this.labels = null;
        this.marks = null;
        this.modelData = parseFloat(scope.modelData);
        this.inputValue = null;
        this.options = {
            pathsWidth: 0,
            pathsHeight: 0,
            labelsWidth: 0,
            labelsHeight: 0,
            marksWidth: 0,
            marksHeight: 0
        },
        this.gaugeChartElem = gaugeChartElem;
        this.gaugeNeedle = null;
        this.isMoveNeedle = false;
        this.mousePosition = null;
        this.circlePosition = null;
        this.init();
        gauge = this;
    }

    GaugeChart.prototype = {
        init: function () {
            var self = this;
            this.initHandle();

            angular.element($window).bind('resize', function () {
                while (self.paths.children().length > 0) {
                    self.paths.children().first().remove();
                }
                self.labels.html('');
                self.marks.html('');
                self.draw();
            });

            this.draw();
        },

        draw: function () {
            var self = this;
            this.setSize();
            $timeout(function () {
                self.getSizes();
                self.setGaps();
                self.createPaths();
                self.createSpecialValues();
                self.createArrow();
                self.createStandardValues();
                self.setValue(self.modelData);
            }, 50);

        },
        setSize: function () {
            var width = this.gaugeChartElem.parent().innerWidth() - 60;
            if (width > 250) {
                width = 250;
            }
            this.gaugeChartElem.css({ 'width': width, 'height': width });
        },
        /* Show special value*/
        createSpecialValues: function () {
            var self = this;
            var specialValues = {};


            angular.forEach(this.scope.configData.specialValues, function (value, key) {
                var percentValue = parseFloat(key / self.scope.configData.max) * 100;
                specialValues[percentValue] = { value: parseFloat(key), data: value };
                //specialValues
            });
            var count = 0;
            this.walkPercents(specialValues, function (percent, angle) {
                var data = specialValues[percent];
                var coords = self.getCoordinate(angle, this.options.pathsWidth, this.options.pathsHeight);
                self.createCirle(coords, data, count);
                count++;
            });


        },

        /* Set value */
        setValue: function (value) {
            this.scope.modelDataTemp = angular.copy(value);
            var percentValue = parseFloat(value / this.scope.configData.max) * 100;
            var angle = this.getPercentAngle(percentValue);
            var needleElement = this.gaugeChartElem.find('.bto-gauge__arrow');
            angle = angle - 270;
            var transform = 'rotate(' + angle + ' ' + (this.options.pathsWidth / 2) + ' ' + (this.options.pathsHeight / 2) + ')';
            needleElement.attr('transform', transform);
        },

        callOnChange: function () {           
            this.hideTooltip();
            if (this.scope.changeValue) {
                this.scope.changeValue({ data: { 'isMoveNeedle': this.isMoveNeedle, 'modelData': parseFloat(this.modelData) } });
            }
        },

        createPaths: function () {
            var self = this;
            var color,
                lastAngle = this.scope.configData.angles[0];

            this.paths.html('');
            this.walkPercents(this.scope.configData.colors, function (percent, angle) {

                if (color) {
                    self.createPath(lastAngle, angle, color);
                }
                color = this.scope.configData.colors[percent];
                lastAngle = angle;
            });

            var endAngle = this.scope.configData.angles[1];
            self.createPath(lastAngle, endAngle, color);
        },

        /* Create single semicircle */
        createPath: function (prevAngle, nextAngle, color) {
            var prevCoords = this.getCoordinate(prevAngle, this.options.pathsWidth, this.options.pathsHeight),
                nextCoords = this.getCoordinate(nextAngle, this.options.pathsWidth, this.options.pathsHeight),
                d = 'M ' + prevCoords + ' A ' + this.options.pathsWidth / 2 + ' ' + this.options.pathsHeight / 2 + ' 0 ' + (Math.abs(nextAngle - prevAngle) > 180 ? 1 : 0) + ' ' + ' 1 ' + nextCoords;
            var pathData = {
                'class': 'bto-gauge__path',
                'd': d,
                'stroke': color,
                'stroke-width': this.scope.configData.lineWidth,
                'fill': 'none'
            };
            this.appendSVG('path', pathData);
        },

        hideTooltip: function () {
            var count = 0;
            angular.forEach(this.scope.configData.specialValues, function () {
                var id = '#bto_gauge_special_' + this.id + '_' + count;
                $(id).tooltip('hide');
                count++;
            });
        },

        createCirle: function (coord, data, id) {
            var self = this;
            var circleData = {
                'id': 'bto_gauge_special_' + this.id + '_' + id,
                'class': 'bto-gauge_special_value',
                'cx': coord[0],
                'cy': coord[1],
                'r': this.scope.configData.lineWidth / 2,
                'value': data.value,
                'data_title': data.data.text,
                'fill': data.data.color
            }
            var circleElement = this.appendSVG('circle', circleData);

            // Add Event
            $timeout(function () {
                var element = $('#bto_gauge_special_' + self.id + '_' + id);
                element.tooltip({ 'animation': true, hide: { effect: "explode", duration: 1000 }, delay: { show: 1000, hide: 500 }, placement: 'top', title: function () { return $(this).attr('data_title') }, container: 'body' });
                element.on('mousedown touchstart', function () {
                    var value = parseFloat($(this).attr('value'));
                    self.modelData = value;
                    self.setValue(value);
                    self.callOnChange();
                    self.isMoveNeedle = false;
                    self.scope.$apply();
                });
            }, 300);


        },

        /* Create arrow */
        createArrow: function () {
            var self = this;
            // central circle
            var circleData = {
                'id': 'bto_center_' + this.id,
                'class': 'bto-gauge__center',
                'cx': this.options.pathsWidth / 2,
                'cy': this.options.pathsHeight / 2,
                'r': this.scope.configData.arrowWidth,
                'fill': this.scope.configData.arrowColor
            };
            var circle = this.appendSVG('circle', circleData);


            // arrow
            var points = [
                this.options.pathsWidth / 2 - (this.scope.configData.arrowWidth / 2) + ',' + this.options.pathsHeight / 2,
                this.options.pathsWidth / 2 + (this.scope.configData.arrowWidth / 2) + ',' + this.options.pathsHeight / 2,
                this.options.pathsWidth / 2 + ',' + 0
            ].join(' ');


            var arrow = this.appendSVG('polyline', {
                'id': 'bto_needle_' + this.id,
                'class': 'bto-gauge__arrow',
                'points': points,
                'fill': this.scope.configData.arrowColor
            });
            // Add Event
            $timeout(function () {
                var needleElement = $document.find('#bto_needle_' + self.id);
                self.gaugeNeedle = needleElement

                needleElement.on('mousedown', angular.bind(self, self.onStart, self.gaugeNeedle, 'needle'));
                needleElement.on('touchstart', angular.bind(self, self.onStart, self.gaugeNeedle, 'needle'));

            }, 300);
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

            $timeout(function () {
                var circleElement = $document.find('#bto_center_' + _self.id);
                _self.circlePosition = {
                    X: circleElement.offset().left + _self.scope.configData.arrowWidth,
                    Y: circleElement.offset().top + _self.scope.configData.arrowWidth
                }
            }, 10);

            this.mousePosition = this.getEventXY(event);

            // Register move move event and mouse up event
            ehMove = angular.bind(this, this.onMove, pointer);
            ehEnd = angular.bind(this, this.onEnd, ehMove);

            $document.on(eventNames.moveEvent, ehMove);

            $document.one(eventNames.endEvent, ehEnd);
            this.isMoveNeedle = true;
            this.scope.$apply();

        },

        onEnd: function (ehMove, event) {
            var moveEventName = this.getEventNames(event).moveEvent;
            $document.off(moveEventName, ehMove);
            this.isMoveNeedle = false;
            //var value = this.scope.modelData;
            //this.modelData = value;
            this.callOnChange();
        },

        onMove: function (pointer, event) {
            if (this.scope.btoDisabledEvent) return;
            var currentPosition = this.getEventXY(event);
            var angle = this.calculateAngleOnDocument(this.circlePosition, currentPosition);
            var value = ((angle - this.scope.configData.angles[0]) / (this.scope.configData.angles[1] - this.scope.configData.angles[0])) * this.scope.configData.max;
            if (angle <= 450 && angle >= this.scope.configData.angles[1]) {
                value = this.scope.configData.max;
            } else if (angle <= this.scope.configData.angles[0] && angle >= 90) {
                value = 0;
            }
            value = Math.round(value * 100) / 100
            this.setValue(value);
            this.modelData = value;
            
            this.callOnChange();
            this.scope.$apply();
        },

        calculateAngleOnDocument: function (centerPosition, currentPosition) {
            var x = 0; y = 0;
            if (centerPosition && currentPosition) {
                x = parseFloat(currentPosition.X - centerPosition.X);
                y = parseFloat(currentPosition.Y - centerPosition.Y);
            }
            var beta = Math.atan(y / x) * 180 / Math.PI;

            if (x == 0) {
                return (y >= 0 ? 90 : 270);
            }

            if (x > 0) {
                return beta + 360;
            } else {
                return beta + 180;
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

        /* Create text labels */
        createStandardValues: function () {

            var values = {};
            var loop = parseInt(this.scope.configData.max / 5);
            for (var i = 0 ; i < loop; i++) {
                values[i * (100 / loop)] = (i * 5);
            }
            values[100] = this.scope.configData.max;
            // Add Seprate Values
            this.walkPercents(values, function (percent, angle) {
                var coords = this.getCoordinate(angle, this.options.labelsWidth, this.options.labelsHeight);
                var $label = angular.element('<div/>');
                $label.addClass('bto-gauge__label');
                $label.text(values[percent]);
                this.labels.append($label);
                $label.css({
                    left: coords[0] - $label.width() / 2,
                    top: coords[1] - $label.height() / 2
                });

            });
            this.createMarks(values);
        },

        /* Create text marks */
        createMarks: function (values) {
            this.walkPercents(values, function (percent, angle) {
                var coords = this.getCoordinate(angle, this.options.marksWidth, this.options.marksHeight);
                var $mark = angular.element('<div>');
                $mark.addClass('bto-gauge__mark');

                this.marks.append($mark);
                $mark.css({
                    transform: 'rotate(' + (angle + 90) + 'deg)',
                    left: coords[0] - $mark.width() / 2,
                    top: coords[1] - $mark.height() / 2
                });
            });
        },

        initHandle: function () {
            this.paths = this.gaugeChartElem.find('.bto-gauge__paths');
            this.labels = this.gaugeChartElem.find('.bto-gauge__labels');
            this.marks = this.gaugeChartElem.find('.bto-gauge__marks');
            this.inputValue = this.gaugeChartElem.find('.bto-gauge__value');
        },

        getSizes: function () {
            var isOutside = (this.scope.configData.inset === false);
            this.options.pathsWidth = (isOutside) ? this.paths.innerWidth() - (this.scope.configData.gaps[0][0] * 2) : this.paths.innerWidth();
            this.options.pathsHeight = (isOutside) ? this.paths.innerHeight() - (this.scope.configData.gaps[0][0] * 2) : this.paths.innerHeight();

            this.options.labelsWidth = (isOutside) ? this.labels.innerWidth() : this.labels.innerWidth() - (this.scope.configData.gaps[1][0] * 2);
            this.options.labelsHeight = (isOutside) ? this.labels.innerHeight() : this.labels.innerHeight() - (this.scope.configData.gaps[1][0] * 2);

            this.options.marksWidth = (isOutside) ? this.marks.innerWidth() - (this.scope.configData.gaps[0][1] * 2) : this.marks.innerWidth() - (this.scope.configData.gaps[1][1] * 2);
            this.options.marksHeight = (isOutside) ? this.marks.innerHeight() - (this.scope.configData.gaps[0][1] * 2) : this.marks.innerWidth() - (this.scope.configData.gaps[1][1] * 2);

        },

        setGaps: function () {
            var isOutside = (this.scope.configData.inset === false);

            this.paths.css({
                left: (isOutside) ? this.scope.configData.gaps[0][0] : 0,
                top: (isOutside) ? this.scope.configData.gaps[0][0] : 0
            });
            this.labels.css({
                left: (isOutside) ? 0 : this.scope.configData.gaps[1][0],
                top: (isOutside) ? 0 : this.scope.configData.gaps[1][0]
            });
            this.marks.css({
                left: (isOutside) ? this.scope.configData.gaps[0][1] : this.scope.configData.gaps[1][1],
                top: (isOutside) ? this.scope.configData.gaps[0][1] : this.scope.configData.gaps[1][1]
            });

            this.inputValue.css({
                left: (this.paths.innerWidth() - this.paths.innerWidth() / 3) / 2.2,
                top: (this.paths.innerHeight() / 2) * 1.3,
                width: this.paths.innerWidth() / 2.6
            });
        },

        /**
        * Get coordinates of an angle
        */
        getCoordinate: function (angle, w, h) {
            angle = angle * Math.PI / 180;
            return [
                (Math.cos(angle) * w / 2 + w / 2),
                (Math.sin(angle) * h / 2 + h / 2)
            ];
        },
        /* Append SVG */
        appendSVG: function (type, attributes) {
            var path = document.createElementNS('http://www.w3.org/2000/svg', type);
            angular.forEach(attributes, function (value, key) {
                path.setAttribute(key, value);
            });
            this.paths.append(path);
            return path;
        },
        /** Walk by percents with angles*/
        walkPercents: function (obj, fn) {
            var angle,
                self = this;

            //sort percents
            var percents = Object.keys(obj).map(parseFloat).sort();
            angular.forEach(percents, function (percent, value) {
                angle = self.getPercentAngle(percent);
                fn.call(self, percent, angle);
            });
        },
        /* Get angel according to aperture */
        getPercentAngle: function (percent) {
            return ((percent * 0.01) * (this.scope.configData.angles[1] - this.scope.configData.angles[0]) + this.scope.configData.angles[0]);
        }

    }
    return GaugeChart;
}]);

btoApp.directive('btoGaugeChart', ['GaugeChart', '$compile', function (GaugeChart, $compile) {
    //'use strict';
    return {
        transclude: true,
        restrict: 'E',
        scope: {
            configData: '=',
            modelData: '=',
            changeValue: '&changeValue',
            btoDisabledEvent : '=',
        },
        template: function (elem, attrs) {
            var template = '<div id="' + attrs.id + '" class="bto-gauge">'
                + '<svg class="bto-gauge__paths bto-gauge__block" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'
                + '<div class="bto-gauge__marks bto-gauge__block"></div>'
                + '<div class="bto-gauge__labels bto-gauge__block"></div>'
                + '<div class="bto-gauge__value bto-gauge__block"><input class="form-control" type="number"  ng-model="modelDataTemp" max="configData.max" min="0" ng-disabled ="$root.functionAccess.CHANGE_VOLATILITY_SIMPLE != 1" /></div>'
                + '</div>'
            return template;
        },

        link: function (scope, elem, attr) {

            scope.modelDataTemp = angular.copy(scope.modelData);
            var gaugeChart = new GaugeChart(scope, elem, attr);
            scope.$watch('modelDataTemp', function () {
                watchModelData(scope.modelDataTemp);
            });
            var watchModelData = function (model) {
                try {
                    var modelData = parseFloat(model);                  
                    if (!isNaN(modelData)) {
                        if (modelData >= 0 && modelData <= scope.configData.max) {
                            gaugeChart.setValue(modelData);
                            gaugeChart.modelData = modelData;
                            gaugeChart.callOnChange();
                        } else if (modelData > scope.configData.max) {
                            gaugeChart.modelData = scope.configData.max;
                            gaugeChart.setValue(scope.configData.max);

                            gaugeChart.callOnChange();
                        } else {
                            gaugeChart.modelData = 0;
                            gaugeChart.setValue(0);
                            gaugeChart.callOnChange();
                        }

                    } else {
                        gaugeChart.modelData = 0;
                        gaugeChart.setValue(0);
                        gaugeChart.callOnChange();
                    }
                    $compile(gaugeChart.gaugeChartElem.contents())(gaugeChart.scope);
                } catch (ex) {
                    gaugeChart.modelData = 0;
                    gaugeChart.setValue(0);
                    gaugeChart.callOnChange();
                }
            };
            scope.$watch('modelData', function () {
                watchModelData(scope.modelData);
            });
            return gaugeChart;
        }

    }
}]);

//$compile(this.gaugeChartElem.contents())(this.scope);