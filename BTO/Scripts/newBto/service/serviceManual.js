
btoApp.service('manualService', function ($rootScope, $timeout) {
    window.manualService = this;

    $rootScope.isShowManual = false;

    this.scrollToTimeLife = function () {
        $rootScope.scrollToSession('timeline');
    },

    this.swipeMonthlyIncome = function () {
        $rootScope.savingRate.carouselIndex = 0;
        $rootScope.utilService.scopeApply();
        rootScope.scrollToSession('salary_income_today');
    }

    this.inputMonthlyIncome = function (player_id, topic_id, step_id, custom_data) {
        //console.log(custom_data)
        var incomeToday = parseInt(custom_data.monthly_income);
        
        $rootScope.savingRate.onFocus('income_today');
        $timeout(function () {
            $rootScope.PersonaPlan.income_today = incomeToday;
            $rootScope.utilService.scopeApply();
            $rootScope.savingRate.onBlur('income_today');
          
        }, 1000)
    }

    this.swipeMonthlyExpense = function () {
        $rootScope.savingRate.carouselIndex = 2;
        $rootScope.utilService.scopeApply();
        $rootScope.scrollToSession('salary_expense_today');
    }

    this.inputMonthlyExpense = function (player_id, topic_id, step_id, custom_data) {
        var expenseToday = parseInt(custom_data.monthly_expense);
        $rootScope.savingRate.onFocus('expense_today');
        $timeout(function () {
            $rootScope.PersonaPlan.expense_today = expenseToday;
            $rootScope.utilService.scopeApply();
            $rootScope.savingRate.onBlur('expense_today');
        }, 1000)
    }

    this.swipeMonthlySaving = function () {
        $rootScope.savingRate.carouselIndex = 1;
        $rootScope.utilService.scopeApply();
        
    }

    this.inputMonthlySaving = function (player_id, topic_id, step_id, custom_data) {
        var savingToday = parseInt(custom_data.monthly_saving);
        $rootScope.savingRate.onFocus('saving_today');
        $timeout(function () {
            $rootScope.PersonaPlan.saving_today = savingToday;
            $rootScope.utilService.scopeApply();
            $rootScope.savingRate.onBlur('saving_today');
        }, 1000)
    }

    this.scrollToRetirementLifeStyle = function () {
        $rootScope.scrollToSession('div_LifeStyle');
    }

    this.playbackSessionById = function (player_id, topic_id, step_id, custom_data) {
        var session_id = parseInt(custom_data.session_id);
        $rootScope.playbackService.playbackSessionById(session_id);
        $timeout(function () { 
            inline_manual_player.deactivate();
        }, 1000)
    }

    this.scrollToObjectById = function (player_id, topic_id, step_id, custom_data) {
        var object_id = custom_data.object_id;
        //console.log(custom_data);
        $rootScope.scrollToSession(object_id);
    }
    
    this.moveRetirementAge = function (player_id, topic_id, step_id, custom_data) {
        var age = parseInt(custom_data.age);
        $rootScope.moveTimelineObject("retirement_age", $rootScope.PersonaPlan.retirement_age, age);
        $timeout(function () {
            $rootScope.actionService.calculateData();
        }, 1500);
    }
    
    this.chooseRetirementLifeStyle = function (player_id, topic_id, step_id, custom_data) {
        var life_style_id = parseInt(custom_data.life_style_id);
        /*
        $rootScope.selectedretirementLife.id = life_style_id;
        $rootScope.actionService.calculateData();
        */
    }

    this.openSessionV4 = function (player_id, topic_id, step_id, custom_data) {
        var session_id =custom_data.session_id;        
        $timeout(function () {
            $('#' + session_id).trigger('click');
        }, 200);
    }

});

