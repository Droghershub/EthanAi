var btoApp = angular.module('btoApp', ['ui.router', 'ngMessages', 'pascalprecht.translate', 'ngStorage', 'ui-rangeSlider', 'ng-currency', 'ngAnimate', 'treasure-overlay-spinner', 'smart-table', 'material.core.gestures', 'ui.sortable', 'ngCookies', 'angular-carousel', 'ngWebsocket','ngImgCrop'
]);
var rootScope = null;
btoApp.run(function ($rootScope, utilService, personalPlanService, startService, accountService, profileService, userService, timelineService, sharingService, playbackService, $localStorage, $translate, $locale, $state, $timeout, CONFIG, actionService, chartService, manualService, ratingService, invitationService) {
    $rootScope.translateData = localStorage['translateData'];
    console.time('btoApp');
    //console.log('Begin run');
    //console.timeEnd('btoApp');
    rootScope = $rootScope;
    $rootScope.scope = null;
    
    $rootScope.residentialType = [];
    $rootScope.planService = personalPlanService;
    $rootScope.accountService = accountService;
    $rootScope.utilService = utilService;
    $rootScope.config = CONFIG;
    $rootScope.userService = userService;
    $rootScope.profileService = profileService;
    
    $rootScope.timelineService = timelineService;
    
    //$rootScope.zoomService = zoomService;

    startService.initData();

    $rootScope.ratingService = ratingService;
    $rootScope.actionService = actionService;
    $rootScope.chartService = chartService;
    $rootScope.playbackService = playbackService;
    $rootScope.sharingService = sharingService;
    $rootScope.invitationService = invitationService;
    window.manualService = manualService;


    $rootScope.spinner = {
        active: false,
        on: function () {
            this.active = true;
        },
        off: function () {
            this.active = false;
        }
    };

    $rootScope.functionAccess.showErrorMessage = function () {
        $timeout(function () {
            utilService.showErrorMessage(utilService.translate($rootScope.functionAccess.errorMessage));
        }, 100);
    };
    $rootScope.functionAccess.showDeniedMessage = function () {
        $timeout(function () {
            utilService.showErrorMessage(utilService.translate($rootScope.functionAccess.deniedMessage));
        }, 100);
    };
    // Register event if change language success
    $rootScope.languageFirstLoad = true;
    $rootScope.$on('$translateChangeSuccess', function (data, language) {
        utilService.changeLanguageSuccess(language)
    });

    utilService.loadCurrentLanguage();
    // Register event if change event success
    $rootScope.$on('$stateChangeSuccess', function (event, toStates) {
        if ($rootScope.playBackPlayerData.isPlayBack) {
            return;
        }
        $timeout(function () {            
            if ($rootScope.StateReload != true) {
                if ($rootScope.scope != null)
                    personalPlanService.ChangeTab($rootScope.scope.name);                
            }
        }, 400);        
    })
    //startService.registerWatchValueEventForTheme();
    startService.registerValueForTheme();

    function scrollToSession(key) {
        if (angular.isDefined($rootScope.componentMap) && angular.isArray($rootScope.componentMap)) {           
            angular.forEach($rootScope.componentMap, function (comMap) {
                if (comMap.components.indexOf(key) >= 0) {                  
                    $rootScope.scrollToSession(comMap.session);
                }
            })
        }
    }
    $rootScope.scrollToSessionTimeout = null;
    $rootScope.scrollToSession = function (sessionId, offsetHeight) {
        var height = 0;
        if (angular.isDefined(offsetHeight) && angular.isNumber(offsetHeight)) {
            height = offsetHeight;
        }
        var session = $('#' + sessionId);
        if (session.length > 0) {
            $timeout.cancel($rootScope.scrollToSessionTimeout);
            $rootScope.scrollToSessionTimeout = $timeout(function () {
                $('html, body').animate({
                    scrollTop: $('#' + sessionId).offset().top - 220 + height
                }, 500);
            }, 300);            
        }
    }

    $rootScope.hightLightFieldNamOfPersonalPlan = function (fieldName) {
        var keys = utilService.findKeyOfParamenter(fieldName);        
        angular.forEach(keys, function (key) {
            var component = utilService.findObjById(key);            
            if (component.length > 0) {
                if ($rootScope.playBackPlayerData.isPlayBack != null && $rootScope.playBackPlayerData.isPlayBack == true)
                    scrollToSession(key);

                component.addClass('play_focus');
                $timeout(function () {
                    component.removeClass('play_focus');
                }, 1700);
            }
        })
    };


    $rootScope.hightLightObjectById = function (id) {
        var component = $('#' + id);
        if (component.length > 0) {
            if ($rootScope.playBackPlayerData.isPlayBack != null && $rootScope.playBackPlayerData.isPlayBack == true) {

            }
            component.addClass('play_focus');
            $timeout(function () {
                $rootScope.scrollToSession(id);
            }, 400);
            $timeout(function () {
                component.removeClass('play_focus');
            }, 3000);
        }
    }
    $rootScope.hightLightSharingObjectById = function (id) {
        var component = $('#' + id);
        if (component.length > 0) {
            component.addClass('play_focus');
            $timeout(function () {
                component.removeClass('play_focus');
            }, 3000);
        }
    }
    
    // Change starting age
    $rootScope.timelineChangeStartingAge = function (age) {
        // update list listResidence
        if ($rootScope.selectedDreamtype.id == 4) {            
            if ($rootScope.timelineDropYear == -1) {
                $rootScope.utilService.updateResidenceSale($rootScope.selectedDreamtype.dreamTypeConfig, age, true);
            } else {
                $rootScope.utilService.updateResidenceSale($rootScope.selectedDreamtype.dreamTypeConfig, age, false);
            }
        }

    }
    $rootScope.setVisibleRangeOfTimeLine = function () {
        var start = new Date(new Date().getFullYear() - 1 + $rootScope.zoomData.minAge - $rootScope.PersonaPlan.start_age, 1, 1);
        var end = new Date(new Date().getFullYear() + $rootScope.zoomData.maxAge - $rootScope.PersonaPlan.start_age + 1, 1, 1);
        if ($rootScope.timeline) {
            
            $rootScope.timeline.setVisibleChartRange(start, end);
            $rootScope.timelineService.renderBrokenAge();
        }
    }

    var checkBroswer = function () {

        var agl = {};
        var ua = navigator.userAgent;

        agl.FF = ua.indexOf('Firefox') != -1;
        agl.OPERA = ua.indexOf('Opera') != -1;
        agl.CHROME = ua.indexOf('Chrome') != -1;
        agl.SAFARI = ua.indexOf('Safari') != -1 && !agl.CHROME;
        agl.WEBKIT = ua.indexOf('WebKit') != -1;

        agl.IE = ua.indexOf('Trident') > 0 || navigator.userAgent.indexOf('MSIE') > 0;
        agl.IE6 = ua.indexOf('MSIE 6') > 0;
        agl.IE7 = ua.indexOf('MSIE 7') > 0;
        agl.IE8 = ua.indexOf('MSIE 8') > 0;
        agl.IE9 = ua.indexOf('MSIE 9') > 0;
        agl.IE10 = ua.indexOf('MSIE 10') > 0;
        agl.OLD = agl.IE6 || agl.IE7 || agl.IE8; // MUST be here

        agl.IE11UP = ua.indexOf('MSIE') == -1 && ua.indexOf('Trident') > 0;
        agl.IE10UP = agl.IE10 || agl.IE11UP;
        agl.IE9UP = agl.IE9 || agl.IE10UP;
        $rootScope.browserClass = '';
        for (key in agl) {
            if (agl[key]) {
                $rootScope.browserClass += ' ' + key;
            }
        }
            
    }
    checkBroswer();

    function isScrolledIntoView(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        var elemBottom = $(elem).offset().top + $(elem).height();
        var result = ((elemTop <= docViewBottom && elemTop >= docViewTop) || (elemBottom >= docViewTop && elemBottom <= docViewBottom));
        //console.log(elem.attr('id') + '-' + result + ' - elemTop:' + elemTop + ' - elemBottom: ' + elemBottom + ' - docViewTop: ' + docViewTop + ' - docViewBottom: ' + docViewBottom);
        return result;
        //return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
    }
    if (version_id == '3') {
        $(window).scroll(function () {
            $rootScope.updateChartWhenScroll();
        })
    }
    
    $rootScope.updateChartWhenScroll = function () {
        try {
            if (isScrolledIntoView($('#chartdiv'))) {
                $rootScope.savingRate.showChart();
            }
            if (isScrolledIntoView($('#savingRateDonut'))) {
                $rootScope.savingRate.showChart();
            }
            if (isScrolledIntoView($('#chartRetirement'))) {
                $rootScope.retirementLifeStyle.showChart();
            }
            if (isScrolledIntoView($('#chartInvestment'))) {
                $rootScope.investment.showChart();
            }
            if (isScrolledIntoView($('#chartIlliquid'))) {
                $rootScope.illiquidAsset.showChart();
            }
        } catch (ex) { }
    }


    $rootScope.showPremiumVersionMessage = function (id) {
        // console.log(id);
        $rootScope.carModalId = id;
        // utilService.showInfoMessage(utilService.translate('Premium version'));
        $rootScope.utilService.scopeApply();
        $timeout(function () {
            $('#car-modal').modal({ backdrop: 'static', keyboard: false });
        }, 800);
    }

    simple_tooltip("a", "tooltip");
    //console.timeEnd('btoApp');
})

btoApp.config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        url: '',
        prefix: '/Content/translates/',
        suffix: '.json'
    });
    $translateProvider.useSanitizeValueStrategy(null);
    $translateProvider.forceAsyncReload(true);

});
btoApp.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });
                element[0].blur();
                event.preventDefault();
            }
        });
    };
});

function simple_tooltip(target_items, name) {
    $('.btn-list .btn-float').each(function (i) {
        $("body").append("<div class='" + name + "' id='" + name + i + "'><p>" + $(this).attr('title') + "</p></div>");
        var my_tooltip = $("#" + name + i);

        if ($(this).attr("title") != "" && $(this).attr("title") != "undefined") {

            $(this).removeAttr("title").mouseover(function () {
                my_tooltip.css({ opacity: 1, display: "none" }).fadeIn(200);
            }).mousemove(function (kmouse) {
                var border_top = $(window).scrollTop();
                var border_right = $(window).width();
                var left_pos;
                var top_pos;
                var voffset = 60;
                var hoffset = 65;
                if (border_right - (-hoffset * 2) >= my_tooltip.width() + kmouse.pageX) {
                    left_pos = kmouse.pageX - hoffset;
                } else {
                    left_pos = border_right - my_tooltip.width() + hoffset;
                }

                if (border_top + (-voffset * 2) >= kmouse.pageY - my_tooltip.height()) {
                    top_pos = border_top + voffset;
                } else {
                    top_pos = kmouse.pageY - my_tooltip.height() + voffset;
                }

                my_tooltip.css({ left: left_pos, top: top_pos });
            }).mouseout(function () {
                my_tooltip.css({ left: "-9999px" });
            });

        }

    });
}
