btoApp.service('smallTimelineService', function ($rootScope, personalPlanService, utilService, $timeout, $state, $locale, accountService, CONFIG, savingRateService, illiquidAssetService, $filter) {
    var small_timeline = null;
    this.initDataForTimeLine = function () {
        $rootScope.smalltimelinedata = [];
        $rootScope.smalltimelinedata.push({
            "start": new Date(new Date().getFullYear(), 0, 1).addDays(-1),
            "content": "<img class='timeline_item_pad_small' src='/Themes/" + version_id + "/Content/img/pin-circle-grey.png' />",
            "deleteable": false,
            "name": "start_age",
            'editable': false,
            "start_age": $rootScope.PersonaPlan.start_age
        });
        $rootScope.smalltimelinedata.push({
            "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "content": "<img class='timeline_item_pad_small' src='/Themes/" + version_id + "/Content/img/pin-circle-grey.png' />",
            "deleteable": false,
            "name": "retirement_age"
        });
        $rootScope.smalltimelinedata.push({
            "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.social_security_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "content": "<img class='timeline_item_pad_small' src='/Themes/" + version_id + "/Content/img/pin-circle-grey.png' />",
            "deleteable": false,
            "name": "social_security_age"

        });
        for (var i = 0; i < $rootScope.PersonaPlan.dreams.length; i++) {
            if ($rootScope.PersonaPlan.dreams[i].existant != true) {
                $rootScope.smalltimelinedata.push({
                    "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.dreams[i].purchase_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
                    "content": "<img class='timeline_item_pad_small' src='/Themes/" + version_id + "/Content/img/pin-circle.png' />",
                    "deleteable": true,
                    "name": "dream",
                    "data_id": $rootScope.PersonaPlan.dreams[i].id
                });
            }
        }
        for (var i = 0; i < $rootScope.PersonaPlan.lifeEvent.length; i++) {
            if ($rootScope.PersonaPlan.lifeEvent[i].existant != true) {
                $rootScope.smalltimelinedata.push({
                    "start": new Date(new Date().getFullYear() + $rootScope.PersonaPlan.lifeEvent[i].starting_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
                    "content": "<div><img class='timeline_item_pad_small' src='/Themes/" + version_id + "/Content/img/pin-circle.png' />",
                    "deleteable": true,
                    "name": "life_event",
                    "data_id": $rootScope.PersonaPlan.lifeEvent[i].id,
                    "dream_id": $rootScope.PersonaPlan.lifeEvent[i].dream_id
                });
            }
        }
        var brokenAge = new Date(new Date().getFullYear() + 200, 0, 1);
        if (angular.isDefined($rootScope.MainResult)) {
            brokenAge = new Date(new Date().getFullYear() + $rootScope.MainResult.broken_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1);
        }
        $rootScope.smalltimelinedata.push({
            //"start": new Date(new Date().getFullYear() + $rootScope.MainResult.broken_age - $rootScope.PersonaPlan.start_age, 0, 1).addDays(-1),
            "start": brokenAge,
            "content": "broken Age",
            "deleteable": false,
            "editable": false,
            "selectable": false,
            "className": 'hidden',
            "name": "broken_age",
            "type": 'floatingRange'

        });

    }
    this.renderTimeLine = function () {        
        var steps = $rootScope.PersonaPlan.death_age - $rootScope.PersonaPlan.start_age;
        $rootScope.small_options = {
            'width': '100%',
            'renderBrokentext': true,
            'height': '89px',
            'heightBroken': '65px',
            'editable': false,
            'showCurrentTime': false,
            'showMajorLabels': false,
            'zoomable': false,
            'moveable': false,
            'style': 'box',
            'box': { align: 'left' },
            'cluster': false,            
            'eventMargin': 5,  // minimal margin between events
            'minHeight': 10,
            'eventMarginAxis': 5,
            'zoomMin': 60 * 60 * 24 * 365 * 1000*1000,     // milliseconds
            'zoomMax': 60 * 60 * 24 * 365 * 1000 * 1000*1000,  // milliseconds				
            "min": new Date(new Date().getFullYear() - 1, 1, 1),                // lower limit of visible range
            "max": new Date(new Date().getFullYear() + steps + 1, 0, 0)                // upper limit of visible range

        };
        $rootScope.smallTimelineService.initDataForTimeLine();        
        small_timeline = new links.Timeline(document.getElementById('timeline-img-small'), $rootScope.small_options);        
        small_timeline.setScale(links.Timeline.StepDate.SCALE.YEAR, 1);       
        small_timeline.draw($rootScope.smalltimelinedata);
        if ($('.timeline-broken-text')) {
            $('.timeline-broken-text').html($rootScope.utilService.translate("BROKE"));
        }
        $rootScope.timelineService.renderBrokenAge();
        
    };    
    return this;
});