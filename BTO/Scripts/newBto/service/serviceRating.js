btoApp.factory('ratingService',
function ($rootScope, $timeout, userService, utilService) {
    $rootScope.ratingData = {
        data: {
            saving_rate: null,
            investment: null,
            retirement_life_style: null,
            illiquid_asset: null
        },
        sectionId: null,
        oldValue: null,
        rating: null,
        contact_me: false,
        feedback: null
    }
    this.rating = function (rating_id) {
        var self = this;
        $timeout(function () {
            $rootScope.ratingData.sectionId = rating_id;
            $rootScope.ratingData.rating = $rootScope.ratingData.data[rating_id];
            $rootScope.ratingData.feedback = null;
            $rootScope.ratingData.contact_me = false;
            $rootScope.utilService.scopeApply();
            self.ratingDiaglog($rootScope.ratingData);
        }, 300)
        
    }
    this.ratingDiaglog = function (ratingdata) {
        $timeout(function () {
            $rootScope.ratingData = ratingdata;
            $rootScope.utilService.scopeApply();
            $rootScope.SendingScreenSharingDataObject($rootScope.ratingData, 'ratingService', 'rating');
            $('#rating-modal').modal('show');
        }, 300)
    }
    this.cancelSavingRating = function () {

        $rootScope.ratingData.data[$rootScope.ratingData.sectionId] = null;//angular.copy($rootScope.ratingData.oldValue);
        //$rootScope.ratingData.oldValue = null;
        $rootScope.utilService.scopeApply();
        $rootScope.SendingScreenSharingDataObject($rootScope.ratingData.data, 'ratingService', 'cancelSavingRating');
    }
    this.savingRating = function () {
        userService.submitRating(function (data) {
            $rootScope.ratingData.data[$rootScope.ratingData.sectionId] = null;// $rootScope.ratingData.rating;
            $rootScope.utilService.scopeApply();
            utilService.showSuccessMessage(utilService.translate('Rating was sent successfully.'))
            $rootScope.SendingScreenSharingDataObject($rootScope.ratingData.data, 'ratingService', 'savingRating');
        })
    }
    this.ratingClickStar = function (rating_id) {
        $rootScope.ratingData.oldValue = $rootScope.ratingData.data[rating_id];
    }
    this.UpdateControlShareScreen = function (obj) {
        switch (obj.actionEvent) {
            case 'rating':
                this.ratingDiaglog(obj.newValue);
                break;
            case 'savingRating':
                $rootScope.ratingData.data = obj.newValue;
                $rootScope.utilService.scopeApply();
                $('#rating-modal').modal('hide');
                break;
            case 'cancelSavingRating':
                $rootScope.ratingData.data = obj.newValue;
                $rootScope.utilService.scopeApply();
                $('#rating-modal').modal('hide');
                break;
            case 'getrating':
                $rootScope.ratingData.data = obj.newValue;
                $rootScope.utilService.scopeApply();              
                break;
        }
    }

    this.feedbackData = { 
        type: null, // 0: is like , 1: dislike, 2: suggestion
        feedback: null,
        contact_me: false
    }
    this.registerClickEvent = false;
    this.showFeedback = function () {
        var self = this;
        /* Feedback */
        if (this.registerClickEvent == false) {
            $("#feedback-btns .btn").click(function () {
                var $thisBtn = $(this);
                $("#feedback-btns .btn").removeClass("btn-primary");
                $thisBtn.removeClass("btn-white").addClass("btn-primary");
                $("#feedback-more").slideUp("fast", function () {
                    if ($thisBtn.hasClass("like")) {
                        $("#feedback-more label[for='feedbacktext']").html(utilService.translate("Tell us what you liked."));
                    }
                    else if ($thisBtn.hasClass("dislike")) {
                        $("#feedback-more label[for='feedbacktext']").html(utilService.translate("What could we do better?"));
                    }
                    else if ($thisBtn.hasClass("suggest")) { 
                        $("#feedback-more label[for='feedbacktext']").html(utilService.translate("What is your suggestion?"));
                    }
                });
                $("#feedback-more").slideDown();
                $("#feedback-text").focus();
            });
            this.registerClickEvent = true;
        }
        $timeout(function () {
            $('#feedback-modal').modal('show');
        }, 300)
    }
    this.changeType = function (type) {
        this.feedbackData.type = type;
    }
    this.submitFeedback = function () {
        var self = this; 
        userService.submitFeedback(this.feedbackData,function (data) { 
            self.feedbackData = {
                type: null, // 0: is like , 1: dislike, 2: suggestion
                feedback: null,
                contact_me: false
            };
            $("#feedback-btns .btn").removeClass("btn-primary");
            $("#feedback-more").slideUp("fast");
            utilService.showSuccessMessage(utilService.translate('Feedback was sent successfully.')) 
        });

    }
    this.cancelFeedback = function () {
        this.feedbackData = {
            type: null, // 0: is like , 1: dislike, 2: suggestion
            feedback: null,
            contact_me: false
        };
        $("#feedback-btns .btn").removeClass("btn-primary");
        $("#feedback-more").slideUp("fast");
    }
    return this;
})

