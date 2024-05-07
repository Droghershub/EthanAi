btoApp.service('summaryCardService', function ($rootScope, utilService, $timeout, CONFIG, $filter) {
    this.savingRate = null;
    this.retirementLifeStyle = null;
    this.investment = null;
    this.illiquidAsset = null;
    this.selectedCardId = null;
    this.updateSavingRate = function () {
        this.savingRate = {
            age: $rootScope.MonthlyIncome.age,
            income: $rootScope.MonthlyIncome.income,
            expense: $rootScope.MonthlyExpense.expenses,
            saving: $rootScope.MonthlySaving.saving,
            totalSaved: $rootScope.MonthlySaving.monthlyRate
        }
    }
    this.updateRetirement = function () {
        var self = this, index = 0, isCumulative_inflation = false;
        var distance = parseInt($rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age);
        var total_expense = parseFloat($rootScope.ExpenseData.recurring_expense[index + distance])
                    + $rootScope.savingRate.getMortageRepayment(index + distance)
                    + $rootScope.savingRate.getExpensesFromProperty(index + distance)
                    + parseFloat($rootScope.ExpenseData.insufficient_funds[index + distance]);
        if ($rootScope.IncomeData.income_from_social_security != null) {
            var saving = total_expense > parseFloat($rootScope.IncomeData.income_from_social_security[index + distance]) ? total_expense - parseFloat($rootScope.IncomeData.income_from_social_security[index + distance]) : parseFloat(0);
            saving = saving / (isCumulative_inflation === true ? $rootScope.Cumulative_inflation[index + distance] : 1);
            this.retirementLifeStyle = {
                annualexpense: total_expense / (isCumulative_inflation === true ? $rootScope.Cumulative_inflation[index + distance] : 1),
                incomesource: parseFloat($rootScope.IncomeData.income_from_social_security[index + distance]) / (isCumulative_inflation === true ? $rootScope.Cumulative_inflation[index + distance] : 1) + saving,
            };
        }
    }
    this.updateInvestment = function () {
        var index = $rootScope.PersonaPlan.retirement_age - $rootScope.PersonaPlan.start_age;
        if ($rootScope.investmentData != null && $rootScope.investmentData.length > 0) {
            var total_invest = $.grep($rootScope.investmentData, function (e) { return e.name == 'overall_investments'; });
            var cpf = $.grep($rootScope.investmentData, function (e) { return e.name == 'cpf'; });
            var iron_reserve = $.grep($rootScope.investmentData, function (e) { return e.name == 'contingency_household'; });
            var brokerage = $.grep($rootScope.investmentData, function (e) { return e.name == 'trading_household'; });
            var current_account = $.grep($rootScope.investmentData, function (e) { return e.name == 'bank_household'; });
            this.investment = {
                total: total_invest ? total_invest[0].bottom[index] * 1000 : 0,
                cpf: cpf ? cpf[0].bottom[index] * 1000 : 0,
                iron_reserve: iron_reserve ? iron_reserve[0].bottom[index] * 1000 : 0,
                brokerage: brokerage ? brokerage[0].bottom[index] * 1000 : 0,
                current_account: current_account ? current_account[0].bottom[index] * 1000 : 0,
            }
        }
    }
    this.updateData = function () {
        this.updateSavingRate();
        this.updateRetirement();
        this.updateInvestment();
    }

    this.quickSettingSelectCard = function (id, event) {
        if (this.selectedCardId != id) {
            $timeout(function () {
                $('#' + id).trigger('click');
                $('#side-nav-close').trigger('click');

            }, 200);
        } else {
            $timeout(function () {
                $('#side-nav-close').trigger('click');
                $rootScope.scrollToSession('top_session', 85);
            }, 200);
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    this.updateClassNameOfSummaryCard = function () {
        $('.summary-card').removeClass('selected');
        $('.summary-card').removeClass('unselected');
        if (this.selectedCardId != null) {
            $('.summary-card').addClass('unselected');
        }
    }

    this.selectCard = function (id, cardId) {
        //console.log(id, cardId, this.selectedCardId);
        if (this.selectedCardId != id) {
            this.selectedCardId = id;
            /*
            var thisCard = $('#' + id);
            if (thisCard.find('div.selected').length != 0) {
                $('.panel-group.collapse.in').collapse('hide');
                $('.summary-card').removeClass('selected').removeClass('unselected');
            } else {
                $('.summary-card').removeClass('selected').removeClass('unselected');
                $(thisCard).children().addClass("selected");
                $('.summary-card').not('selected').addClass('unselected');
                $('.panel-group.collapse.in').collapse('hide');
                
                switch (id) {
                    case 'asavings':
                        $rootScope.savingRate.showChart();
                        break;
                    case 'aretirement':
                        $rootScope.retirementLifeStyle.showChart();
                        break;
                    case 'ainvestments':
                        $rootScope.investment.showChart();
                        break;
                    case 'ailliquid':
                        $rootScope.illiquidAsset.showChart();
                        break;
                    default:
                }
            }
            */

            this.updateClassNameOfSummaryCard();
            $rootScope.utilService.scopeApply();
            $timeout(function () {
                $rootScope.scrollToSession('top_session', 85);
                switch (id) {
                    case 'asavings':
                        $rootScope.savingRate.init();
                        $rootScope.savingRate.showChart();
                        break;
                    case 'aretirement':
                        $rootScope.retirementLifeStyle.init();
                        $rootScope.retirementLifeStyle.showChart();
                        break;
                    case 'ainvestments':
                        $rootScope.investment.init();
                        $rootScope.investment.showChart();
                        break;
                    case 'ailliquid':
                        $rootScope.illiquidAsset.InitSwiperDreams();
                        $rootScope.illiquidAsset.makeChart();
                        $rootScope.illiquidAsset.showChart();
                        break;
                    default:
                }

            }, 500)
            $rootScope.SendingScreenSharingDataObject(id, 'summaryCardService', 'selectCard');
        } else {
            this.triggerCloseCard();
        }
    }
    this.closeCard = function (id) {
        this.selectedCardId = null;
        this.updateClassNameOfSummaryCard();
        /*
        $('.summary-card').removeClass('unselected').removeClass('selected');
        $rootScope.SendingScreenSharingDataObject(id, 'summaryCardService', 'closeCard');
        this.selectedCardId = null;
        */
    }

    this.triggerCloseCard = function () {

        var close_card = $('#close_card_' + this.selectedCardId);
        if (this.selectedCardId != null) {
            $timeout(function () {
                close_card.trigger('click');
            }, 100);
        }

        this.selectedCardId = null;
        this.updateClassNameOfSummaryCard();
    }

    this.init = function () {
        this.updateData();
    };

    this.selectCardWhenPlayback = function (id, callback) {
        if (this.selectedCardId != id) {
            try {
                var title = angular.element('#' + id + ' .card-title');
                $timeout(function () {
                    title.trigger('click');
                }, 200);
                $timeout(function () {
                    callback();
                }, 2000);
            } catch (ex) { console.log(ex); }
        } else {
            callback();
        }
    }
    this.UpdateControlShareScreen = function (obj) {
        switch (obj.actionEvent) {
            case 'closeCard':
                $('#' + obj.newValue).click();
                this.closeCard(obj.newValue);
                break;
            case 'selectCard':
                if (obj.newValue == 'asavings')
                    $rootScope.summaryCardService.selectCard('asavings', 'div_SavingRate');
                else if (obj.newValue == 'aretirement')
                    $rootScope.summaryCardService.selectCard('aretirement', 'div_LifeStyle');
                else if (obj.newValue == 'ainvestments')
                    $rootScope.summaryCardService.selectCard('ainvestments', 'div_Investment');
                else if (obj.newValue == 'ailliquid')
                    $rootScope.summaryCardService.selectCard('ailliquid', 'div_IlliquidAsset');
                else if (obj.newValue == 'aaproperty')
                    $rootScope.summaryCardService.selectCard('aaproperty', 'div_PropertyPurchase');
                else if (obj.newValue == 'aeducation')
                    $rootScope.summaryCardService.selectCard('aeducation', 'div_Education');                

                break;
            default:
        }
    }

    this.initCardSummary = function () {
        $timeout(function () {
            $('.card.summary-card').tooltip();
        }, 1000);
    }

    return this;
});