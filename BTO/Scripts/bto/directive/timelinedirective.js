btoApp.run(['$templateCache', '$rootScope', function ($templateCache, $rootScope) {
    var template = '<div class="bto-timeline-bar-wrapper">' +
                   '<canvas id="canvas" class="canvas"></canvas>' +  // Canvas to show progress bar
              '</div>';
    $templateCache.put('btoTimelineBarTpl.html', template);
    $rootScope.timelineConfigData = {
        min: 45,
        max: 89,
        stickyData: {
            'top': '20px',
            'bottom': '20px'
        }
    }
}]);
var testCanvas = null;
btoApp.factory('TimelineBar', ['$document', function ($document) {
    var TimelineBar = function (scope, timelineBarElem, attributes) {
        this.id = attributes.id;
        this.min = 41,
        this.max = 81,
        this.scope = scope;
        this.timelineBarElem = timelineBarElem;
        this.canvasElement = null;
        this.canvas = null;
        this.wrapperElem = null;
        this.stickyData = {
            'top': '10px',
            'bottom': '10px'
        }
        this.init();
        console.log(this);
    }

    TimelineBar.prototype = {
        init: function () {
            self = this;
            this.initElemHandles();
            //this.initSticky();
            this.initCanvas();
        },

        initCanvas: function () {
            // Begin
            var begining = this.initText(this.canvas, this.min, 51, 15, 13);
            this.canvas.addChild(begining);
        },

        initText: function(canvas, text, x, y, width)
        {
            var objyear = canvas.display.text({        
                x:x,
                y:y,
                origin: { x: "center", y: "top" },
                font: "bold 13px sans-serif",
                size: width,
                text: text,
                fill: "red"
            });
            return objyear;
        },

        initElemHandles: function () {
            
            if (angular.isDefined(this.scope.configData.stickyData.top)) {
                this.stickyData.top = this.scope.configData.stickyData.top;
            }
            if (angular.isDefined(this.scope.configData.stickyData.bottom)) {
                this.stickyData.bottom = this.scope.configData.stickyData.bottom;
            }
            if (this.scope.configData.max) {
                this.max = this.scope.configData.max;
            }
            if (this.scope.configData.min) {
                this.min = this.scope.configData.min;
            }

            this.wrapperElem = this.timelineBarElem.children()[0];
            this.wrapperElem = angular.element(this.wrapperElem);
            
            this.canvasElement = this.wrapperElem.children()[0];
            this.canvasElement = angular.element(this.canvasElement);

            this.canvas = oCanvas.create({
                canvas: "#canvas_" + this.id
            });

            testCanvas = this.canvas;
        },

        initSticky: function () {
            // initialize states
            var activeTop = false, offset = {}; scrollOffset = {}; timebarElem = this.timelineBarElem, stickyData = this.stickyData;
            function onscroll() {
                offset = offsetOfElement(timebarElem);
                scrollOffset = getScroll();
                //console.log(offset, scrollOffset);
                if (scrollOffset.sy > offset.top) {
                    activeTop = true;
                } else {
                    activeTop = false;
                }
                
                if (activeTop) {
                    active();
                } else {
                    deactive();
                }
            }

            function active() {                
                timebarElem.attr('style', 'position:fixed;width:99%;transition:none;top: ' + stickyData.top);
            }

            function deactive() {                
                timebarElem.removeAttr('style');
            }
            function offsetOfElement(elm) {
                try { return elm.offset(); } catch (e) { }
                var rawDom = elm[0];
                var _x = 0;
                var _y = 0;
                var body = document.documentElement || document.body;
                var scrollX = window.pageXOffset || body.scrollLeft;
                var scrollY = window.pageYOffset || body.scrollTop;
                _x = rawDom.getBoundingClientRect().left + scrollX;
                _y = rawDom.getBoundingClientRect().top + scrollY;
                return { left: _x, top: _y };
            }

            function getScroll() {
                if (window.pageYOffset != undefined) {
                    return {'sx': pageXOffset, 'sy': pageYOffset};
                }
                else {
                    var sx, sy, d = document, r = d.documentElement, b = d.body;
                    sx = r.scrollLeft || b.scrollLeft || 0;
                    sy = r.scrollTop || b.scrollTop || 0;
                    return { 'sx': sx, 'sy': sy };
                }
            }
            window.addEventListener('scroll', onscroll);           
        }
    }
    return TimelineBar;

}]);
btoApp.directive('btoTimelineBar', ['TimelineBar', function (TimelineBar) {
    //'use strict';
    return {
        transclude: true,
        restrict: 'E',
        scope: {
            modelData: '=',
            configData: '='
        },


       
        template: function (elem, attrs) {
            var template = '<div class="bto-timeline-bar-wrapper">' +
                  '<canvas id="canvas_' + attrs.id + '" class="canvas"></canvas>' +  // Canvas to show progress bar
             '</div>';
            return template;
        },

        link: function (scope, elem, attr) {
            var timelineBar = new TimelineBar(scope, elem, attr);
            return timelineBar;
        }
    }
}]);

