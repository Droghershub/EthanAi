var chartInvestment = null;
btoApp.service('investmentService', function ($rootScope, utilService, $timeout, CONFIG, $filter) {
    $rootScope.ModorateDisplay = {
        Volatility: null,
        ReturnValue: null,
        LossTolerace: null,
        invesmentChoice: null,
        fullDescription: null,
        fullDescription1: null,
        avatar: "fa fa-university",
        yearIndex: 0,
        titleDisplay :''
    }
    $rootScope.investmentCards = [
    {
        name: 'cpf',
        value: 0,
        index: 4,
        key: 'cpf_start',
        fullDescription: "CPF full description",
        Description: "cpf_display",
        avatar: "fa fa-university"

    }, {
        name: 'overall_investments',
        value: 0,
        index: 0,
        fullDescription: utilService.translate(""),
        Description: utilService.translate("Total Investments"),
        avatar: "fa fa-university"
    },
    {
        name: 'contingency_household',
        value: 0,
        index: 1,
        key: 'contingency_household_start',
        fullDescription: utilService.translate("Iron Reserve full description"),
        fullDescription1: "Iron Reserve full description1",
        Description: utilService.translate("Iron Reserve"),
        min: 0,
        max: 24,
        ratio: 0,
        config: {
            lineColor: '#CBCBCB',
            trackColor: '#00C851',
            boxBackgroundColor: '#00C851',
            boxColor: '#0078B1', // #FAFCFD
            min: 0,
            max: 24,
            value: 0
        },
        avatar: "fa fa-university"
    },
    {
        name: 'trading_household',
        value: 0,
        index: 2,
        key: 'trading_household_start',
        fullDescription: utilService.translate("Brokeage Account full description"),
        Description: utilService.translate("Brokeage Account"),
        avatar: "fa fa-university"
    },
    {
        name: 'bank_household',
        value: 0,
        index: 3,
        key: 'bank_household_start',
        fullDescription: utilService.translate("Current Account full description"),
        Description: utilService.translate("Current Account"),
        avatar: "fa fa-university"
    },
    {
        name: 'contingency_ratio',
        value: 0,
        index: 5,
        key: 'contingency_ratio',
        fullDescription: utilService.translate(""),
        Description: utilService.translate(""),
        avatar: "fa fa-university"
    }
    ];
    $rootScope.investmentChoice = 0;
    $rootScope.cpfInvestmentChoice = -1;
    $rootScope.isIndividualInvestment = true;
    $rootScope.investmentTypes = [
        {
            id: "asset_preservation",
            name: utilService.translate("Asset Preservation"),
            description: utilService.translate("Cash accounts, saving accounts."),
            fullDescription: utilService.translate("I’m only prepared to face minimal volatility that may result in low to no losses (e.g. Cash account, Saving account). I understand that my return might be very low"),
            value: 0,
            status: true,
            volatilityMin: 1,
            volatilityMax: 3,
            returnMin: 1,
            returnMax: 3,
            lossToleranceUpTo: 5,
            avatar: "fa fa-university"
        },
        {
            id: "conservative",
            name: utilService.translate("Conservative"),
            description: utilService.translate("Saving accounts, bonds."),
            fullDescription: utilService.translate("I’m only prepared to face low volatility that may result in low to moderate losses (e.g. Saving accounts,bonds). I understand that my return might be low"),
            value: 1,
            status: true,
            volatilityMin: 3,
            volatilityMax: 7,
            returnMin: 3,
            returnMax: 5,
            lossToleranceUpTo: 15,
            avatar: "fa fa-sun-o"
        },
        {
            id: "moderate",
            name: utilService.translate("Moderate"),
            description: utilService.translate("More equities, bonds."),
            fullDescription: utilService.translate("I’m prepared to face average  volatility that may result in moderate losses (e.g. More equities,bonds). I understand that my return might be moderate. My objective is asset appreciation"),
            value: 2,
            status: true,
            volatilityMin: 7,
            volatilityMax: 13,
            returnMin: 5,
            returnMax: 7,
            lossToleranceUpTo: 35,
            avatar: "fa fa-balance-scale"
        },
        {
            id: "aggressive",
            name: utilService.translate("Aggressive"),
            description: utilService.translate("Mainly equities, hedge funds."),
            fullDescription: utilService.translate("I’m prepared to face above average  volatility that may result in considerable losses (e.g. Mainly equities, hedge funds,.. ). I understand that my return might be high. My objective is asset appreciation"),
            value: 3,
            status: true,
            volatilityMin: 13,
            volatilityMax: 20,
            returnMin: 7,
            returnMax: 9,
            lossToleranceUpTo: 50,
            avatar: "fa fa-bolt"
        }
    ];
    $rootScope.cpfInvestment = [
        {
            name: 'CPF Ordinary Account', titleDisplay: 'CPF Ordinary Account Age',
            ret_name: 'cpf_oa',
            value: 0,
            index: 0,
            nativeValue: 0, children: [],key : "CPFOrdinary"
        },
        {
            name: 'CPF Medisave Account', titleDisplay: 'CPF Medisave Account Age',
            ret_name: 'cpf_ms',
            value: 0,
            index: 1, nativeValue: 0, children: [], key: "CPFMedisave"
        },
        {
            name: 'CPF Special Account', titleDisplay: 'CPF Special Account Age',
            ret_name: 'cpf_sa',
            value: 0,
            index: 2, nativeValue: 0, children: [], key: "CPFSpecial"
        },
        {
            name: 'CPF Retirement Account', titleDisplay: 'CPF Retirement Account Age',
            ret_name: 'cpf_ra',
            value: 0,
            index: 3, nativeValue: 0, children: [], key: "CPFRetirement"
        },
    ];
    $rootScope.cpfInvestTable = [
        {
            name: 'Pessimistic',
            value: 0
        } 
    ];
    var zoomStartIndex = null, zoomEndIndex = null, isValidateData = false, zoomedEvent = null;
    var chart = null;
    this.carouselIndex = 0;
    this.boxoptions = '_household';
    this.currentChart = 'investment'; // cpf
    $rootScope.isDisabledInvestmentChoice = true;
    $rootScope.$watch('investment.carouselIndex', function () {
        if ($rootScope.investment.carouselIndex == 0 || $rootScope.investment.carouselIndex == 2) {
            $rootScope.isDisabledInvestmentChoice = false;
        } else
            $rootScope.isDisabledInvestmentChoice = true;
        $rootScope.cpfInvestmentChoice = -1;
        utilService.scopeApply();
        $rootScope.investment.selectChangeInvestmentType($rootScope.investmentChoice);
        $rootScope.investment.updateChart();
        $rootScope.investment.showChart();
        $rootScope.SendingScreenSharingDataObject($rootScope.investment.carouselIndex, 'investment', 'changeCard', 'div_Investment');
    })
    this.selectInvestmentChoice = function (value) {
        if ($rootScope.investmentChoice != value) {
            if ($rootScope.investment.carouselIndex == 0 || $rootScope.investment.carouselIndex == 2) {
                var item = { name: "investment_choice", value: value, type: $rootScope.investment.carouselIndex };
                if (!$rootScope.playBackPlayerData.isPlaying) {
                    utilService.callApi('POST', '/api/cashflow/update_investment_item', '', item, function (response) {
                    });
                }
                $rootScope.investmentChoice = value;
                this.selectChangeInvestmentType(value);
                this.calculatorData();
                $rootScope.investment.updateChart();
                $rootScope.SendingScreenSharingDataObject($rootScope.investmentChoice, 'investment', 'selectInvestmentChoice', 'div_investmentChoise');
            }
        }
    }
    this.selectIndividualType = function (status) {
        if (status) {
            $('#investments-btn1').removeClass("btn-white").addClass("btn-primary");
            $('#investments-btn2').removeClass("btn-primary").addClass("btn-white");
        } else {
            $('#investments-btn2').removeClass("btn-white").addClass("btn-primary");
            $('#investments-btn1').removeClass("btn-primary").addClass("btn-white");
        }
        this.expandOrCollapse('hideall');
        $rootScope.isIndividualInvestment = status;
        this.updateChart();
        chart.validateData();
        this.zoomChart();
        $rootScope.SendingScreenSharingDataObject($rootScope.isIndividualInvestment, 'investment', 'selectIndividualType', 'investments-btn1');
    },
    this.initDataForCpfInvestment = function () {                
        var dataObj = null;
        $rootScope.cpfInvestment[0].children = [
            {
                name: 'cpf_oa_main_start', index: 0,
                ret_name: 'cpf_oa_main',
                titleDisplay: 'CPF Ordinary Account Age main',
                value: this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_oa_main_start').value *1000
            }];
        if($rootScope.profile.client.married_status == 1){
            dataObj = {
                name: 'cpf_oa_spouse_start', index: 0,
                ret_name: 'cpf_oa_spouse',
                titleDisplay: 'CPF Ordinary Account Age spouse',
                value: this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_oa_spouse_start').value * 1000
            };
            $rootScope.cpfInvestment[0].children[$rootScope.cpfInvestment[0].children.length] = dataObj;
            }
        $rootScope.cpfInvestment[0].value = this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_oa_main_start').value * 1000 + this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_oa_spouse_start').value * 1000;
        $rootScope.cpfInvestment[1].children = [
           {
               name: 'cpf_ms_main_start', index: 1,
               ret_name: 'cpf_ms_main',
               titleDisplay: 'CPF Medisave Account Age main',
               value: this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_ms_main_start').value * 1000
           }];
        if ($rootScope.profile.client.married_status == 1) {
            dataObj = {
               name: 'cpf_ms_spouse_start', index: 1,
               ret_name: 'cpf_ms_spouse',
               titleDisplay: 'CPF Medisave Account Age spouse',
               value: this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_ms_spouse_start').value * 1000
            };
            $rootScope.cpfInvestment[1].children[$rootScope.cpfInvestment[1].children.length] = dataObj;
           }
        $rootScope.cpfInvestment[1].value = this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_ms_main_start').value * 1000 + this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_ms_spouse_start').value * 1000;

        $rootScope.cpfInvestment[2].children = [
          {
              name: 'cpf_sa_main_start', index: 2,
              ret_name: 'cpf_sa_main',
              titleDisplay: 'CPF Special Account Age main',
              value: this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_sa_main_start').value * 1000
          }];
        if ($rootScope.profile.client.married_status == 1) {
            dataObj = {
              name: 'cpf_sa_spouse_start', index: 2,
              ret_name: 'cpf_sa_spouse',
              titleDisplay: 'CPF Special Account Age spouse',
              value: this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_sa_spouse_start').value * 1000
            };
            $rootScope.cpfInvestment[2].children[$rootScope.cpfInvestment[2].children.length] = dataObj;
          }
        $rootScope.cpfInvestment[2].value = this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_sa_main_start').value * 1000 + this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_sa_spouse_start').value * 1000;
        if (parseInt($rootScope.cashFlow.parameter._c_age_main) < parseInt($rootScope.cashFlow.parameter.age_min_sum_retirement))
            $rootScope.cpfInvestment[3].nativeValue = true;

        $rootScope.cpfInvestment[3].children = [
         {
             name: 'cpf_ra_main_start', index: 3,
             ret_name: 'cpf_ra_main',
             titleDisplay: 'CPF Retirement Account Age main',
             nativeValue: $rootScope.cpfInvestment[3].nativeValue,             
             value: this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_ra_main_start').value * 1000
         }];
        if ($rootScope.profile.client.married_status == 1) {
            dataObj = {
             name: 'cpf_ra_spouse_start', index: 3,
             ret_name: 'cpf_ra_spouse',
             titleDisplay: 'CPF Retirement Account Age spouse',
             nativeValue: $rootScope.cpfInvestment[3].nativeValue,
             value: this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_ra_spouse_start').value * 1000
         }
            $rootScope.cpfInvestment[3].children[$rootScope.cpfInvestment[3].children.length] = dataObj;
        }
        $rootScope.cpfInvestment[3].value = this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_ra_main_start').value * 1000 + this.getInvestmentCardFromCashFlowHaveChild($rootScope.cashFlow.investment_start, 'cpf_ra_spouse_start').value * 1000;
        this.bindingDataForView(0);
    },

    this.expandCPF = function (key) {
        for (var i = 0; i < $rootScope.cpfInvestment.length; i++) {
            if ($rootScope.cpfInvestment[i].key == key) {
                $rootScope.cpfInvestmentChoice = i;
            }   
        }
        $timeout(function () { 
            var cpf_panel = $('#accordion_cpf .cpf_panel');
            angular.forEach(cpf_panel, function (item) {
                var panel = $(item);
                if (panel.attr('id') == 'cpf_panel_' + key) {
                    panel.addClass('active');
                    var header = $('#investment_header_' + key);
                    header.removeClass('collapsed');
                    header.attr('aria-expanded', 'true');
                    var panel_colllapse = $('#collapse-' + key);
                    panel_colllapse.removeClass('collapse');
                    $timeout(function () {
                        panel_colllapse.addClass('collapse in');
                        panel_colllapse.attr('aria-expanded', 'true');
                        panel_colllapse.attr('style', '');
                    }, 250);
                
                } else {
                    panel.removeClass('active');
                    var header = panel.find('.cpf_header');
                    header.addClass('collapsed');
                    header.attr('aria-expanded', 'false');
                    var panel_colllapse = panel.find('.panel-collapse');
                    panel_colllapse.removeClass('in');
                    panel_colllapse.addClass('collapse');
                    panel_colllapse.attr('aria-expanded', 'false');
                }
            });
        }, 350)
    }
    this.expandOrCollapse = function (key) {
        for (var i = 0; i < $rootScope.cpfInvestment.length; i++) {
            if ($rootScope.cpfInvestment[i].key != key)
                this.collapseAllControl($rootScope.cpfInvestment[i].key);
        } 
        $timeout(function () {
            var obj = $('#investment_header_' + key);
            var parentObj = obj.parent();
            var expended = obj.attr('aria-expanded');
           // parentObj.addClass('active');
            if (obj.attr('aria-expanded') == 'true') {
                parentObj.addClass('active');
            } else {
                parentObj.removeClass('active');
            }
            $rootScope.SendingScreenSharingDataObject(key, 'investment', 'expand_key', 'accordion_cpf');
        }, 300)
    },
      this.collapseAllControl = function (key) {
          var obj = $('#investment_header_' + key);
          var expandOrCollapse = obj.attr('aria-expanded');
          var parentObj = obj.parent();
          if (parentObj.hasClass('panel') && parentObj.hasClass('panel-default')) {
              parentObj.removeClass('active');
          }
          $(obj).addClass('collapsed').attr('aria-expanded', 'false');
          $(obj.children[0]).removeClass('active');
          $('#collapse-' + key).removeClass('active').removeClass('in').attr('aria-expanded', 'false').attr('style', 'height: 0px;');

      }
    this.selectChangeInvestmentType = function (index) {
        if (!$rootScope.isDisabledInvestmentChoice) {
            var outValue = $rootScope.investmentTypes[index];
            if (angular.isDefined(outValue)) {
                $rootScope.ModorateDisplay.Volatility = utilService.translate("Volatility", { value1: outValue.volatilityMin, value2: outValue.volatilityMax });
                $rootScope.ModorateDisplay.ReturnValue = utilService.translate("ReturnValue", { value1: outValue.returnMin, value2: outValue.returnMax });
                $rootScope.ModorateDisplay.LossTolerace = utilService.translate("Loss tolerance", { value: outValue.lossToleranceUpTo });
                $rootScope.ModorateDisplay.invesmentChoice = utilService.translate("Type of Investment") +": " + outValue.name;
                $rootScope.ModorateDisplay.fullDescription = outValue.fullDescription;
                $rootScope.ModorateDisplay.fullDescription1 = null;
                $rootScope.ModorateDisplay.avatar = outValue.avatar;
            }
        } else {
            var cursorIndex = $rootScope.investment.carouselIndex;
            if (cursorIndex == 4) { // cpf 
                this.initDataForCpfInvestment();
            }

            var displayValue = $rootScope.investmentCards[0];
            var GetCardIndex = function (index) {
                for (var i = 0; i < $rootScope.investmentCards.length; i++) {
                    if ($rootScope.investmentCards[i].index == index) {
                        displayValue = $rootScope.investmentCards[i];
                        break;
                    }
                }
            }
            GetCardIndex(cursorIndex);
            if (angular.isDefined(displayValue)) {
                $rootScope.ModorateDisplay.invesmentChoice = displayValue.Description;
                $rootScope.ModorateDisplay.fullDescription = displayValue.fullDescription;
                $rootScope.ModorateDisplay.fullDescription1 = displayValue.fullDescription1;
                $rootScope.ModorateDisplay.avatar = displayValue.avatar;
                $rootScope.ModorateDisplay.Volatility = null;
                $rootScope.ModorateDisplay.ReturnValue = null;
                $rootScope.ModorateDisplay.LossTolerace = null;
            }
        }
        //$rootScope.cpfInvestmentChoice = -1;
        utilService.scopeApply();
    }

    this.saveIronReserve = function () {
        $rootScope.investmentCards[5].value = Math.round($rootScope.investmentCards[2].config.value) / 12;
        var data = { name: $rootScope.investmentCards[5].key, value: $rootScope.investmentCards[5].value, type: $rootScope.investment.carouselIndex };
        if (!$rootScope.playBackPlayerData.isPlaying) {
            utilService.callApi('POST', '/api/cashflow/update_investment_item', '', data, function (response) {
            });
        }
        $rootScope.investment.calculatorData();
        $rootScope.investment.updateChart();
        $timeout(function () {
            $('#SaveIronChange').unbind('click');
            $('#CancelSaveIron').unbind('click');
        }, 100);
        $rootScope.SendingScreenSharingDataObject($rootScope.investmentCards[5].value, 'investment', 'oKDialogIronReserve', 'div_Investment');
    }

    this.showDialogIronReserve = function () {
        var self = this;
        $timeout(function () {
            $('#IronReserveInvesment').modal({ backdrop: 'static', keyboard: false });
            $('#SaveIronChange').bind('click', function () {
                self.saveIronReserve();
            });
            $('#CancelSaveIron').bind('click', function () {
                $('#SaveIronChange').unbind('click');
                $('#CancelSaveIron').unbind('click');
                $rootScope.SendingScreenSharingDataObject($rootScope.investmentCards[2].config.value, 'investment', 'cancelDialogIronReserve', 'div_dialogIronReserve');
            });
            $rootScope.SendingScreenSharingDataObject($rootScope.investmentCards[2].config.value, 'investment', 'showDialogIronReserve', 'div_Investment');
        }, 100);
    }
    this.onChangeSlider = function (key) {
    }
    this.onEndChangeSlider = function (key) {
        var self = this;
        $timeout(function () {
            self.saveIronReserve();
        }, 300);
        
    }
    this.onChangeMonthlyBox = function (key) {
        var self = this;
        $timeout(function () {
            self.saveIronReserve();
        }, 300);
    }
    this.getInvestmentCardFromCashFlow = function (arr, key) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].name == key)
                return arr[i].value;
        }
        return 0;
    }
    this.getInvestmentCardFromCashFlowByKey = function (arr, key) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].key == key)
                return arr[i].value;
        }
        return 0;
    }
    this.getInvestmentCardFromCashFlowHaveChild = function (investment_start, key) {
        var valueReturn = null;
        var getValueFromCashFlow = function (item) {
            if (item.name == key) {
                valueReturn = item;
            }
            if (angular.isDefined(item.children) && item.children.length > 0) {
                for (var i = 0; i < item.children.length; i++) {
                    getValueFromCashFlow(item.children[i]);
                }
            }
        }
        for (var i = 0; i < investment_start.length; i++) {
            getValueFromCashFlow(investment_start[i]);
        } 
        return valueReturn;
    }
    this.initValueForInvestmentCards = function () {
        $rootScope.investmentCards[0].value = this.getInvestmentCardFromCashFlow($rootScope.cashFlow.investment_start, $rootScope.investmentCards[0].key) * 1000;
        $rootScope.investmentCards[2].value = this.getInvestmentCardFromCashFlow($rootScope.cashFlow.investment_start, $rootScope.investmentCards[2].key) * 1000;
        $rootScope.investmentCards[3].value = this.getInvestmentCardFromCashFlow($rootScope.cashFlow.investment_start, $rootScope.investmentCards[3].key) * 1000;
        $rootScope.investmentCards[4].value = this.getInvestmentCardFromCashFlow($rootScope.cashFlow.investment_start, $rootScope.investmentCards[4].key) * 1000;
        $rootScope.investmentCards[1].value = $rootScope.investmentCards[0].value + $rootScope.investmentCards[2].value + $rootScope.investmentCards[3].value + $rootScope.investmentCards[4].value;
        $rootScope.investmentCards[5].value = this.getInvestmentCardFromCashFlow($rootScope.cashFlow.investment_start, 'contingency_ratio');
        $rootScope.investmentCards[2].config.value = Math.round($rootScope.investmentCards[5].value * 12);
        $rootScope.investmentChoice = this.getInvestmentCardFromCashFlow($rootScope.cashFlow.investment_start, 'investment_choice');
        utilService.scopeApply();
    }
    this.bindValueForInvestmentCashflow = function (investment_start, key, value) {
        for (var i = 0; i < investment_start.length; i++) {
            if (investment_start[i].name == key) {
                investment_start[i].value = value;
                break;
            }
        }
        return investment_start;
    }
    this.calculatorData = function () {
        var investment_start = $rootScope.cashFlow.investment_start;
        investment_start = this.bindValueForInvestmentCashflow(investment_start, $rootScope.investmentCards[0].key, parseFloat($rootScope.investmentCards[0].value)/1000);
        investment_start = this.bindValueForInvestmentCashflow(investment_start, $rootScope.investmentCards[2].key, parseFloat($rootScope.investmentCards[2].value)/1000);
        investment_start = this.bindValueForInvestmentCashflow(investment_start, $rootScope.investmentCards[3].key, parseFloat($rootScope.investmentCards[3].value)/1000);
        investment_start = this.bindValueForInvestmentCashflow(investment_start, $rootScope.investmentCards[4].key, parseFloat($rootScope.investmentCards[4].value)/1000);
        investment_start = this.bindValueForInvestmentCashflow(investment_start, 'investment_choice', $rootScope.investmentChoice);
        investment_start = this.bindValueForInvestmentCashflow(investment_start, $rootScope.investmentCards[5].key, $rootScope.investmentCards[5].value);
        $rootScope.cashFlow.investment_start = angular.copy(investment_start);
        $rootScope.PersonaPlan.return_cashFlow = true;
        if (!$rootScope.playBackPlayerData.isPlaying) {
            $rootScope.actionService.updateData();
        }

        $rootScope.actionService.calculateData();
        if (!$rootScope.playBackPlayerData.isPlaying) {
            $rootScope.investment.SavingCashFlowData($rootScope.cashFlow);
        }
    }
    this.updateTotalInvestment = function () {
        $rootScope.investmentCards[1].value = $rootScope.investmentCards[0].value + $rootScope.investmentCards[2].value + $rootScope.investmentCards[3].value + $rootScope.investmentCards[4].value;
    }
    this.savingCashFlowDataTimeout = null;
    this.SavingCashFlowData = function (cashFlowData) {
        var self = this;
        var arrayData = [];
        var GetAllChildData = function (item) {
            if (angular.isDefined(item) && (angular.isDefined(item.children))) {
                if (item.children.length == 0) {
                    arrayData[arrayData.length] = {
                        user_id: user_id,
                        variable: item.name,
                        value: parseFloat(item.default_value) / 1000
                    };
                } else if (item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        GetAllChildData(item.children[i]);
                    }
                }
            } else if (angular.isDefined(item) && !angular.isDefined(item.children)) {
                for (var i = 0; i < item.length; i++) {
                    GetAllChildData(item[i]);
                }
            }
        }
        var GetDataFromArray = function (arrayData) {
            for (var i = 0; i < arrayData.length; i++) {
                GetAllChildData(arrayData[i]);
            }
        }
        arrayData = this.getCashflowDataFromCPFInvestment($rootScope.cpfInvestment);
        for (var i = 0; i < $rootScope.cashFlow.investment_start.length; i++) {
            if ($rootScope.cashFlow.investment_start[i].name != 'contingency_ratio' && $rootScope.cashFlow.investment_start[i].name != 'investment_choice') {
                arrayData[arrayData.length] = {
                    user_id: user_id,
                    variable: $rootScope.cashFlow.investment_start[i].name,
                    value: parseFloat($rootScope.cashFlow.investment_start[i].value) 
                };
                GetDataFromArray($rootScope.cashFlow.investment_start[i]);
            } else {
                arrayData[arrayData.length] = {
                    user_id: user_id,
                    variable: $rootScope.cashFlow.investment_start[i].name,
                    value: parseFloat($rootScope.cashFlow.investment_start[i].value)
                };
            }
        }
        var jsonObj = JSON.stringify(arrayData);
        if (!$rootScope.playBackPlayerData.isPlaying) {
            $timeout.cancel(this.savingCashFlowDataTimeout);
            this.savingCashFlowDataTimeout = $timeout(function () {
                utilService.callApi('POST', '/api/cashflow/update', '', jsonObj, function (response) { });
            }, 500)
            
        }
    }
    this.enterTab = function (name) {
        // this.requestCalculatorData(name);
    }
    this.focusValue = [];
    this.onFocus = function (name, item) {
        if (typeof (item) != 'undefined') { 
            this.focusValue[name] = item.value;
        } else {
            this.focusValue[name] = this.getInvestmentCardFromCashFlowByKey($rootScope.investmentCards, name);
        }
    }
    this.onBlur = function (name, item) {
        if (typeof (item) != 'undefined') {
            this.requestCalculatorForCpfInvestment(name, item);
        } else {
            this.requestCalculatorData(name);
        }
    }
    this.findObjectIn = function (objArray, name) {
        var objReturn = null;
        var GetAllChildData = function (item, name) {
            if (angular.isDefined(item)) {
                if (item.name == name) {
                    objReturn = item;
                } else if (angular.isDefined(item.children) && item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        if (objReturn != null)
                            break;
                        GetAllChildData(item.children[i], name);
                    }
                }
            }
        }
        var GetDataFromArray = function (arrayData, name) {
            for (var i = 0; i < arrayData.length; i++) {
                if (objReturn != null) break;
                GetAllChildData(arrayData[i], name);
            }
        }
        GetDataFromArray(objArray, name);
        return objReturn;
    }
    this.requestCalculatorForCpfInvestment = function (name, item) {
        var value1 = this.findObjectIn($rootScope.cpfInvestment, name);
        var value2 = this.focusValue[name];
        if (value1.value != value2) {
            
            this.updateChangeCashFlowData($rootScope.cashFlow.investment_start, name, value1.value);
            var data = { user_id: user_id, name: value1.name, value: value1.value, type: $rootScope.investment.carouselIndex };
            if (!$rootScope.playBackPlayerData.isPlaying) {
                utilService.callApi('POST', '/api/cashflow/update_investment_item', '', data, function (response) {
                });
            }
            this.calculatorData();
            this.updateTotalInvestment();
            $rootScope.SendingScreenSharingDataObject($rootScope.cpfInvestment, 'investment', 'requestCalculatorForCpfInvestment', 'div_Investment');
        }
    }
    this.updateChangeCashFlowData = function (arrayData,name, value) {
        var GetAllChildData = function (item) {
            if (angular.isDefined(item) && (angular.isDefined(item.children))) {
                if (item.children.length == 0) {
                    if (item.name == name)
                        item.value = parseFloat(value) / 1000; 
                } else if (item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        GetAllChildData(item.children[i]);
                    }
                }
            } else if (angular.isDefined(item) && !angular.isDefined(item.children)) {
                if (item.name == name)
                    item.value = parseFloat(value) / 1000; 
            }
        }
        var GetDataFromArray = function (arrayData) {
            for (var i = 0; i < arrayData.length; i++) {
                GetAllChildData(arrayData[i]);
            }
        }
        GetDataFromArray(arrayData);
    }
    this.resetCashflowData = function () {
        var GetAllChildData = function (item) {
            if (angular.isDefined(item) && (angular.isDefined(item.children))) {
                if (item.children.length == 0) {
                    if (item.name == name)
                        item.value = parseFloat(value) / 1000;
                } else if (item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        GetAllChildData(item.children[i]);
                    }
                }
            } else if (angular.isDefined(item) && !angular.isDefined(item.children)) {
                if (item.name == name)
                    item.value = parseFloat(value) / 1000;
            }
        }
        var GetDataFromArray = function (arrayData) {
            for (var i = 0; i < arrayData.length; i++) {
                GetAllChildData(arrayData[i]);
            }
        }
        GetDataFromArray(arrayData);
    }
    this.getCashflowData = function () {
        var arrayData = [];
        var GetAllChildData = function (item) {
            if (angular.isDefined(item) && (angular.isDefined(item.children))) {
                if (item.children.length == 0) {
                    arrayData[arrayData.length] = {
                        user_id: user_id,
                        variable: item.name,
                        value: parseFloat(item.value)
                    };
                } else if (item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        GetAllChildData(item.children[i]);
                    }
                }
            } else if (angular.isDefined(item) && !angular.isDefined(item.children)) {
                arrayData[arrayData.length] = {
                    user_id: user_id,
                    variable: item.name,
                    value: parseFloat(item.value)
                };
            }
        }
        var GetDataFromArray = function (arrayData) {
            for (var i = 0; i < arrayData.length; i++) {
                GetAllChildData(arrayData[i]);
            }
        }
        var temp = $.grep($rootScope.cashFlow.investment_start, function (e) { return e.name == 'cpf_start'; });
        GetDataFromArray(temp);
        return arrayData;
    }
    this.getCashflowDataFromCPFInvestment = function (cpfInvestment) {
        var arrayData = [];
        var GetAllChildData = function (item) {
            if (angular.isDefined(item) && (angular.isDefined(item.children))) {
                if (item.children.length == 0) {
                    arrayData[arrayData.length] = {
                        user_id: user_id,
                        variable: item.name,
                        value: parseFloat(item.value) / 1000
                    };
                } else if (item.children.length > 0) {
                    for (var i = 0; i < item.children.length; i++) {
                        GetAllChildData(item.children[i]);
                    }
                }
            } else if (angular.isDefined(item) && !angular.isDefined(item.children)) {
                arrayData[arrayData.length] = {
                    user_id: user_id,
                    variable: item.name,
                    value: parseFloat(item.value) / 1000
                };
            }
        }
        var GetDataFromArray = function (arrayData) {
            for (var i = 0; i < arrayData.length; i++) {
                GetAllChildData(arrayData[i]);
            }
        }
        GetDataFromArray(cpfInvestment);
        return arrayData;
    }
    this.requestCalculatorData = function (name, item) {        
        var value1 = this.getInvestmentCardFromCashFlowByKey($rootScope.investmentCards, name);
        var value2 = this.focusValue[name];
        if (value1 != value2) {
            var temp = $.grep($rootScope.investmentCards, function (e) { return e.name == name; });
            var key = '';
            if (temp && temp.length > 0)
                key = temp[0].key;
            var data = { name: name, value: value1, type: $rootScope.investment.carouselIndex };
            if (!$rootScope.playBackPlayerData.isPlaying) {
                utilService.callApi('POST', '/api/cashflow/update_investment_item', '', data, function (response) {
                });
            }
            this.calculatorData();
            this.updateTotalInvestment();
            $rootScope.SendingScreenSharingDataObject($rootScope.investmentCards, 'investment', 'requestCalculatorData', 'investmentSwiperCards');
        }
    },
    this.getIndexSwiperOfCardByCarouselIndex = function (carouselIndex) {
        var indexSwiper = carouselIndex;
        for (var j = 0; j < $rootScope.investmentCards.length; j++) {
            if ($rootScope.investmentCards[j].index == indexSwiper) {
                indexSwiper = j;
                break;
            }
        }
        var swiperData = $rootScope.investmentCards[indexSwiper];
        for (var t = 0; t < $rootScope.investmentData.length; t++) {
            if ($rootScope.investmentData[t].name === swiperData.name) {
                indexSwiper = t;
                break;
            }
        }
        return indexSwiper;
    },
    this.selectBoxOptions = function (option) {
        var self = this;
        if (this.isShowTotalCPF == true) {
            this.isShowTotalCPF = false;
            this.expandOrCollapse('hideall');
            $rootScope.cpfInvestmentChoice = -1;
            this.selectBoxOptions(option);
            $timeout(function () {
                self.isShowTotalCPF = true;
            }, 500);
        }
        this.boxoptions = option;
        this.updateChart();
        $rootScope.SendingScreenSharingDataObject(option, 'investment', 'selectBoxOptions', 'accordion_cpf');
    }

    
    this.updateCashFlowData = function (investment_start) {
        var parseValueForInvestment = function (item) {
            item.value = item.default_value; 
            if (angular.isDefined(item.children) && item.children.length > 0) {
                for (var i = 0; i < item.children.length; i++) {
                    parseValueForInvestment(item.children[i]);
                }
            }
        }
        for (var i = 0; i < investment_start.length; i++) {
            parseValueForInvestment(investment_start[i]);
        }
        
        $rootScope.cashFlow.investment_start = angular.copy(investment_start);
        
        utilService.scopeApply();
        this.initValueForInvestmentCards();
        this.initDataForCpfInvestment();
        
        $rootScope.investment.SavingCashFlowData($rootScope.cashFlow);
        $rootScope.SendingScreenSharingDataObject($rootScope.cashFlow.investment_start, 'investment', 'updateCashFlowData');
    }
    this.bindataByOptions = function (InvestmentCPF, option) {
        var data = [], cpf_oa, cpf_ms, cpf_sa, cpf_ra;
        switch (option) {
            case '_main':
            case '_spouse' :               
                break; 
            default:
                option = '';
                break; 
        }
        cpf_oa = $.grep($rootScope.InvestmentCPF, function (e) { return e.name === ('cpf_oa' + option) });
        cpf_ms = $.grep($rootScope.InvestmentCPF, function (e) { return e.name === ('cpf_ms' + option) });
        cpf_sa = $.grep($rootScope.InvestmentCPF, function (e) { return e.name === ('cpf_sa' + option) });
        cpf_ra = $.grep($rootScope.InvestmentCPF, function (e) { return e.name === ('cpf_ra' + option) });
        for (var i = 0; i < cpf_oa[0].top.length; i++) {
            data[i] = {
                "year": parseInt($rootScope.PersonaPlan.start_age) + i,
                "cpf_oa": parseFloat(Number((cpf_oa[0].bottom[i]* 1000).toFixed(2))),
                "cpf_ms": parseFloat(Number((cpf_ms[0].bottom[i]*1000).toFixed(2))),
                "cpf_sa": parseFloat(Number((cpf_sa[0].bottom[i]*1000).toFixed(2))),
                "cpf_ra": parseFloat(Number((cpf_ra[0].bottom[i] *1000).toFixed(2))),
                "topColor": "#FF00ACFE",
                "averageColor": "#FF019BE5",
                "bottomColor": "#FF0089CA",
                "zeroColor": "#FF0079B2"
            }
        }
        return data;
    },
    this.initDataForProviderForCpfChart = function () {
        var data =this.bindataByOptions($rootScope.InvestmentCPF, $rootScope.investment.boxoptions);
        return data;
    }
    this.initDataForProviderCardValue = function () {
        var data = [], objData;
        if ($rootScope.investment.carouselIndex == 3 || $rootScope.investment.carouselIndex == 1) {
            if ($rootScope.isIndividualInvestment == true) {
                var indexSwiper = this.getIndexSwiperOfCardByCarouselIndex(this.carouselIndex);
                objData = $rootScope.investmentData[indexSwiper];
                for (var i = 0; i < $rootScope.investmentData[indexSwiper].top.length; i++) {
                    data[i] = {
                        "year": parseInt($rootScope.PersonaPlan.start_age) + i,
                        "dataValue":  parseFloat(Number(($rootScope.investmentData[indexSwiper].bottom[i]*1000).toFixed(2))) ,
                        "dataColor": "#FF00ACFE", 
                    }
                }
            }
        }

        return data;
    }
    this.initDataForProviderForCPFInvestment = function () {
        var data = [];
        var temp = $.grep($rootScope.InvestmentCPF, function (e) { return e.name == $rootScope.cpfInvestmentChoiceName });
        if (temp && temp.length > 0) {
            for (var i = 0; i < temp[0].top.length; i++) {
                data[i] = {
                    "year": parseInt($rootScope.PersonaPlan.start_age) + i, 
                    "dataValue": parseFloat(Number((temp[0].top[i] * 1000).toFixed(2))),
                    "dataColor": "#FF00ACFE",
                }
            }
        }
        return data;
    }
    this.initDataForProvider = function () {
        var data = [];
        if (angular.isDefined($rootScope.investmentData)) {
            if ($rootScope.isIndividualInvestment == true) {
                var indexSwiper = this.getIndexSwiperOfCardByCarouselIndex(this.carouselIndex);                
                if ($rootScope.investment.carouselIndex != 4 || ($rootScope.investment.carouselIndex == 4 && $rootScope.cpfInvestmentChoice < 0)) {

                    if ($rootScope.investment.carouselIndex == 4) {
                        data = this.bindataByOptions($rootScope.InvestmentCPF, $rootScope.investment.boxoptions);
                    } else {
                        for (var i = 0; i < $rootScope.investmentData[indexSwiper].top.length; i++) {
                            data[i] = {
                                "year": parseInt($rootScope.PersonaPlan.start_age) + i,
                                "bottom": parseFloat($rootScope.investmentData[indexSwiper].bottom[i]),
                                "average": parseFloat($rootScope.investmentData[indexSwiper].average[i]),
                                "top": parseFloat($rootScope.investmentData[indexSwiper].top[i]),
                                "topColor": "#FF00ACFE",
                                "averageColor": "#FF019BE5",
                                "bottomColor": "#FF0089CA",
                                "zeroColor": "#FF0079B2"
                            }
                        }
                    }

                }
                else {
                    var temp = $.grep($rootScope.InvestmentCPF, function (e) { return e.name == $rootScope.cpfInvestmentChoiceName });
                    if (temp && temp.length > 0) {
                        for (var i = 0; i < temp[0].top.length; i++) {
                            data[i] = {
                                "year": parseInt($rootScope.PersonaPlan.start_age) + i,
                                "bottom": parseFloat(temp[0].top[i]),
                                "average": parseFloat(temp[0].average[i]),
                                "top": parseFloat(temp[0].top[i]),
                                "topColor": "#FF00ACFE",
                                "averageColor": "#FF019BE5",
                                "bottomColor": "#FF0089CA",
                                "zeroColor": "#FF0079B2"
                            }
                        }
                    }
                }
                
            } else {
                var indexSwiper = -1;
                for (var t = 0; t < $rootScope.investmentData.length; t++) {
                    if ($rootScope.investmentData[t].name === 'overall_investments') {
                        indexSwiper = t;
                        break;
                    }
                }
                if (indexSwiper != -1) {
                    for (var i = 0; i < $rootScope.investmentData[indexSwiper].top.length; i++) {
                        data[i] = {
                            "year": parseInt($rootScope.PersonaPlan.start_age) + i,
                            "bottom": parseFloat($rootScope.investmentData[indexSwiper].bottom[i]),
                            "average": parseFloat($rootScope.investmentData[indexSwiper].average[i]),
                            "top": parseFloat($rootScope.investmentData[indexSwiper].top[i]),
                            "topColor": "#FF00ACFE",
                            "averageColor": "#FF019BE5",
                            "bottomColor": "#FF0089CA",
                            "zeroColor": "#FF0079B2"
                        }
                    }
                }
            }
            for (var o = 0; o < data.length; o++) {
                if (data[o].bottom < 0) data[o].bottom = 0;
                data[o].bottom = parseFloat(Number(data[o].bottom * 1000).toFixed(2));
                if (data[o].average < 0) data[o].average = 0;
                data[o].average = parseFloat(Number(data[o].average * 1000).toFixed(2));
                if (data[o].top < 0) data[o].top = 0;
                data[o].top = parseFloat(Number(data[o].top * 1000).toFixed(2));
            }
        }
        return data;
    },
    this.selectCpfInvestment = function (item) {
        $rootScope.cpfInvestmentChoice = item.index;
        $rootScope.cpfInvestmentChoiceName = item.ret_name;
        $rootScope.cpfInvestmentChoiceDisplay = item.titleDisplay;       
        this.bindingDataForView();
        $rootScope.investment.updateChart();
        if (chart) {
            chart.validateData();
        }
        $rootScope.SendingScreenSharingDataObject(item, 'investment', 'selectCpfInvestment', 'div_Investment');
    }
    this.resetPlan = function () {
        $rootScope.isResetPlan = true;
        $rootScope.PersonaPlan.return_cashFlow = true;
        this.updateCashFlowData(cashFlow.investment_start);
    }
    this.isShowTotalCPF = true;
    this.showTotalCPF = function () {
        this.selectBoxOptions('');
    }
    this.initChartForCardValue = function () {
        var self = this;
        var dataProvider = this.initDataForProviderCardValue();
        chart = AmCharts.makeChart("chartInvestment", {
            "type": "serial",
            "theme": "light",
            "marginRight": 15,
            "legend": {
                "fontSize": 10,
                "equalWidths": true,
                "position": "top",
                "valueText": ""

            },
            "colors": ["#00ACFE"],
            "dataProvider": dataProvider,
            "pathToImages": "/Themes/" + version_id + "/Scripts/amcharts/images/",
            "valueAxes": [{
                "stackType": "regular",
                "gridAlpha": 0.07,
                "position": "left",
                "title": utilService.translate("Investments")
            }],
            "graphs": [{
                "balloonText": utilService.translate("Value") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                "fillAlphas": 0.6,
                "lineAlpha": 0.4,
                "stackable": false,
                "title": utilService.capitalise(utilService.translate("Value")),
                "valueField": "dataValue"
            }
            ],
            "plotAreaBorderAlpha": 0,
            "marginTop": 10,
            "marginLeft": 0,
            "marginBottom": 0,
            "chartScrollbar": {},
            "chartCursor": {
                "cursorAlpha": 0
            },
            "legend": {
                "align": "center",
                "position": "top",
                "equalWidths": true,
                "data":
                    [{ title: utilService.translate("Value"), color: "#00ACFE", backgroundColor: "#00ACFE" }]
                    , 
            },
            "categoryField": "year",
            "categoryAxis": {
                "startOnAxis": true,
                "axisColor": "#DADADA",
                "gridAlpha": 0.07,
                "title": utilService.translate("Age"),
                "guides": [{
                    category: $rootScope.PersonaPlan.retirement_age,
                    lineColor: "#CC0000",
                    above: true,
                    lineAlpha: 1,
                    dashLength: 3,
                    inside: true,
                    labelRotation: 90,
                    label: utilService.translate("Retirement Age")
                }]
            }
        });
        zoomedEvent == null;
        chart.addListener("zoomed", function (event) {
            if (!isValidateData || zoomedEvent == null) {
                zoomEndIndex = event.endIndex;
                zoomStartIndex = event.startIndex;
                zoomedEvent = true;
            }
            startIndex = event.startIndex;
            var objsending = { datatype: 'zoomed', objecttype: 'chartInvestment', startIndex: zoomStartIndex, endIndex: zoomEndIndex };
            $rootScope.SendingScreenSharingDataObject(objsending, 'zoomed', 'chartInvestment', 'chartInvestment');
        });
        chartInvestment = chart; 
        chart.addListener("changed", function (event) {
            if (typeof (event.index) != 'undefined') {
                self.bindingDataForView(event.index);
                $rootScope.SendingScreenSharingDataObject(event.index, 'investment', 'bindingDataForView', 'chartInvestment');
            }
        });
        //this.zoomChart();
    }
    this.initChartForCPFTotal = function () {
        var self = this;
        var dataProvider = this.initDataForProviderForCpfChart();
        chart = AmCharts.makeChart("chartInvestment", {
            "type": "serial",
            "theme": "light",
            "marginRight": 15,
            "legend": {
                "fontSize": 10,
                "equalWidths": true,
                "position": "top",
                "valueText": ""

            },  
            "colors": ["#00ACFE", "#019BE5", "#008ACB", "#0079B2" ],
            "dataProvider": dataProvider,
            "pathToImages": "/Themes/" + version_id + "/Scripts/amcharts/images/",
            "valueAxes": [{
                "stackType": "regular",
                "gridAlpha": 0.07,
                "position": "left",
                "title": utilService.translate("Investments")
            }],
            "graphs": [
                {
                    "balloonText": utilService.translate("cpf_oa") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                    "fillAlphas": 1,
                    "lineAlpha": 0.4,
                    "stackable": true,
                    "title": utilService.capitalise(utilService.translate("cpf_oa")),
                    "valueField": "cpf_oa"
                },
                 {
                     "balloonText": utilService.translate("cpf_ms") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                     "fillAlphas": 1,
                     "lineAlpha": 0.4,
                     "stackable": true,
                     "title": utilService.capitalise(utilService.translate("cpf_ms")),
                     "valueField": "cpf_ms"
                 },
                  {
                      "balloonText": utilService.translate("cpf_sa") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                      "fillAlphas": 1,
                      "lineAlpha": 0.4,
                      "stackable": true,
                      "title": utilService.capitalise(utilService.translate("cpf_sa")),
                      "valueField": "cpf_sa"
                  },
                 {
                     "balloonText": utilService.translate("cpf_ra") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                     "fillAlphas":1,
                     "lineAlpha": 0.4,
                     "stackable": true,
                     "title": utilService.capitalise(utilService.translate("cpf_ra")),
                     "valueField": "cpf_ra"
                 },
                 
                 
                    
            ],
            "plotAreaBorderAlpha": 0,
            "marginTop": 10,
            "marginLeft": 0,
            "marginBottom": 0,
            "chartScrollbar": {},
            "chartCursor": {
                "cursorAlpha": 0
            },
            "legend": {
                "align": "center",
                "position": "top",
                "equalWidths": true,
                "data":
                    [
                         { title: utilService.translate("cpf_oa"), color: "#00ACFE", backgroundColor: "#00ACFE" },
                         { title: utilService.translate("cpf_ms"), color: "#019BE5", backgroundColor: "#FF0000" },
                         { title: utilService.translate("cpf_sa"), color: "#019BE5", backgroundColor: "#FF0000" },
                         { title: utilService.translate("cpf_ra"), color: "#0079B2", backgroundColor: "#81F7D8" },                     
                    ]
                    ,
                "listeners": [{
                    "event": "rollOverItem", "method": function () {
                    }
                },
                {
                    "event": "rollOutItem", "method": function () {
                    }
                }

                ]
            },
            "categoryField": "year",
            "categoryAxis": {
                "startOnAxis": true,
                "axisColor": "#DADADA",
                "gridAlpha": 0.07,
                "title": utilService.translate("Age"),
                "guides": [{
                    category: $rootScope.PersonaPlan.retirement_age,
                    lineColor: "#CC0000",
                    above: true,
                    lineAlpha: 1,
                    dashLength: 3,
                    inside: true,
                    labelRotation: 90,
                    label: utilService.translate("Retirement Age")
                }]
            }
        });
        zoomedEvent == null
        chart.addListener("zoomed", function (event) {
            if (!isValidateData || zoomedEvent == null) {
                zoomEndIndex = event.endIndex;
                zoomStartIndex = event.startIndex;
                zoomedEvent = true;
            }
            startIndex = event.startIndex;
            var objsending = { datatype: 'zoomed', objecttype: 'chartInvestment', startIndex: zoomStartIndex, endIndex: zoomEndIndex };
            $rootScope.SendingScreenSharingDataObject(objsending, 'zoomed', 'chartInvestment', 'chartInvestment');
        });
        chartInvestment = chart;
        //this.zoomChart();

        chart.addListener("changed", function (event) {
            if (typeof (event.index) != 'undefined') {
                self.bindingDataForView(event.index);
                $rootScope.SendingScreenSharingDataObject(event.index, 'investment', 'bindingDataForView', 'chartInvestment');
            }
        });
        //this.zoomChart();
    }
    this.init = function () {
        var self = this;
        var dataProvider = this.initDataForProvider();
        if (angular.isUndefined(dataProvider)) {
            dataProvider = [
                {
                    average: 0,
                    averageColor: "#FF019BE5",
                    bottom: 0,
                    bottomColor: "#FF0089CA",
                    top: 0,
                    topColor: "#FF00ACFE",
                    year: $rootScope.PersonaPlan.start_age,
                    zeroColor: "#FF0079B2",
                }
            ];
        }
        chart = AmCharts.makeChart("chartInvestment", {
            "type": "serial",
            "theme": "light",
            "marginRight": 15,
            "legend": {
                "fontSize": 10,
                "equalWidths": true,
                "position": "top",
                "valueText": ""

            },
            "colors": ["#00ACFE", "#019BE5", "#008ACB"],
            "dataProvider": dataProvider,
            "pathToImages": "/Themes/" + version_id + "/Scripts/amcharts/images/",
            "valueAxes": [{
                "stackType": "regular",
                "gridAlpha": 0.07,
                "position": "left",
                "title": utilService.translate("Investments")
            }],
            "graphs": [{
                "balloonText": utilService.translate("Optimistic") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                "fillAlphas": 0.6,
                "lineAlpha": 0.4,
                "stackable": false,
                "title": utilService.capitalise(utilService.translate("Optimistic")),
                "valueField": "top"
            }, {
                "balloonText": utilService.translate("Average") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                "fillAlphas": 1,
                "lineAlpha": 0.4,
                "stackable": false,
                "title": utilService.capitalise(utilService.translate("Average")),
                "valueField": "average"
            }, {
                "balloonText": utilService.translate("Pessimistic") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>",
                "fillAlphas": 1,
                "lineAlpha": 0.4,
                "stackable": false,
                "title": utilService.capitalise(utilService.translate("Pessimistic")),
                "valueField": "bottom"
            }
            ],
            "plotAreaBorderAlpha": 0,
            "marginTop": 10,
            "marginLeft": 0,
            "marginBottom": 0,
            "chartScrollbar": {},
            "chartCursor": {
                "cursorAlpha": 0
            },
            "legend": {
                "align": "center",
                "position": "top",
                "equalWidths": true,
                "data":
                    [{ title: utilService.translate("Optimistic"), color: "#00ACFE", backgroundColor: "#00ACFE" },
                     { title: utilService.translate("Average"), color: "#019BE5", backgroundColor: "#FF0000" },
                    { title: utilService.translate("Pessimistic"), color: "#019BE5", backgroundColor: "#FF0000" }]
                    ,
                "listeners": [{
                    "event": "rollOverItem", "method": function () {
                    }
                },
                {
                    "event": "rollOutItem", "method": function () {
                    }
                }

                ]
            },
            "categoryField": "year",
            "categoryAxis": {
                "startOnAxis": true,
                "axisColor": "#DADADA",
                "gridAlpha": 0.07,
                "title": utilService.translate("Age"),
                "guides": [{
                    category: $rootScope.PersonaPlan.retirement_age,
                    lineColor: "#CC0000",
                    above: true,
                    lineAlpha: 1,
                    dashLength: 3,
                    inside: true,
                    labelRotation: 90,
                    label: utilService.translate("Retirement Age")
                }]
            }
        });
        zoomedEvent == null
        chart.addListener("zoomed", function (event) {
            if (!isValidateData || zoomedEvent == null) {
                zoomEndIndex = event.endIndex;
                zoomStartIndex = event.startIndex;
                zoomedEvent = true;
            }
            startIndex = event.startIndex;
            var objsending = { datatype: 'zoomed', objecttype: 'chartInvestment', startIndex: zoomStartIndex, endIndex: zoomEndIndex };
            $rootScope.SendingScreenSharingDataObject(objsending, 'zoomed', 'chartInvestment', 'chartInvestment');
        });
        chartInvestment = chart; 
        chart.addListener("changed", function (event) {
            if (typeof (event.index) != 'undefined') { 
                self.bindingDataForView(event.index);
                $rootScope.SendingScreenSharingDataObject(event.index, 'investment', 'bindingDataForView', 'chartInvestment');
            } 
        });
    
        this.initDataForCpfInvestment();
        this.zoomChart();
    };
    this.bindingDataForView = function (index) {
        if ($rootScope.investment.carouselIndex == 4) { 
            if (typeof (index) == 'undefined' || index ==  null)
                index = 0;

            if ($rootScope.cpfInvestmentChoice < 0) {
                var indexCarousel = this.getIndexSwiperOfCardByCarouselIndex(this.carouselIndex);
                $rootScope.cpfInvestTable[0].value = parseFloat($rootScope.investmentData[indexCarousel].top[index] *1000); 
                $rootScope.ModorateDisplay.titleDisplay =utilService.translate("CPF balance");
                if ($rootScope.investment.boxoptions != null) {
                    switch ($rootScope.investment.boxoptions) {
                        case '_household':
                            $rootScope.ModorateDisplay.titleDisplay = utilService.translate("CPF balance") + " (" + utilService.translate("Household") + ")";
                            break;
                        case '_main': 
                            $rootScope.ModorateDisplay.titleDisplay = utilService.translate("CPF balance") + " (" + utilService.translate( ($rootScope.profile.client.first_name == null || $rootScope.profile.client.first_name == '') ? "Own" : $rootScope.profile.client.first_name) + ")";
                            break;
                        case '_spouse':
                            $rootScope.ModorateDisplay.titleDisplay = utilService.translate("CPF balance") + " (" + utilService.translate(($rootScope.profile.spouse.first_name == null || $rootScope.profile.spouse.first_name == '') ? "Spouse" : $rootScope.profile.spouse.first_name) + ")";
                            break;
                        default:
                    }
                }
            } else {
                var temp = $.grep($rootScope.InvestmentCPF, function (e) { return e.name == $rootScope.cpfInvestmentChoiceName });                
                if (temp && temp.length > 0) {
                    $rootScope.cpfInvestTable[0].value = parseFloat(temp[0].top[index] * 1000);                                       
                    $rootScope.ModorateDisplay.titleDisplay = $rootScope.cpfInvestmentChoiceName;
                }
            }                        
            $rootScope.utilService.scopeApply();
            $rootScope.ModorateDisplay.yearIndex = parseInt($rootScope.PersonaPlan.start_age) + parseInt(index);           
        }        
    }
    this.zoomChart = function () {
        if (isValidateData && zoomEndIndex != null && zoomStartIndex != null) {
            chart.zoomToIndexes(zoomStartIndex, zoomEndIndex);
            isValidateData = false;
            return;
        }
        if (angular.isDefined(chart.dataProvider) && chart.dataProvider.length > 0) {
            var index = chart.dataProvider.length;
            for (var i = 0; i < index; i++) {
                if (chart.dataProvider[i].year == "80")
                    index = i;
            }
            chart.zoomToIndexes(0, index);
        }
    }
    this.changeZoomToIndex = function (begin, end) {
        chart.zoomToIndexes(begin, end);
    };
    this.changeLanguageOfChart = function () {
        chart.graphs[0].balloonText = utilService.translate("Top") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>";
        chart.graphs[0].title = utilService.capitalise(utilService.translate("Optimistic"));
        chart.graphs[1].balloonText = utilService.translate("Median") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>";
        chart.graphs[1].title = utilService.capitalise(utilService.translate("Average"));
        chart.graphs[2].balloonText = utilService.translate("Bottom") + " <span style='font-size:11px; color:#000000;'><b>[[value]]</b></span>";
        chart.graphs[2].title = utilService.capitalise(utilService.translate("Pessimistic"));
        chart.valueAxes[0].title = utilService.translate("Liquid Assets");
        chart.categoryAxis.title = utilService.translate("Age");
        chart.categoryAxis.guides[0].label = utilService.translate("Retirement Age");
        isValidateData = true;
        chart.validateData();
    }

    this.isBindingDataForChart = false;
    this.updateChart = function () {
        if ($rootScope.isIndividualInvestment == true) {
            if ($rootScope.investment.carouselIndex == 4) {
                
                if ($rootScope.cpfInvestmentChoice < 0) {
                    if (this.currentChart != 'cpf') {
                        this.initChartForCPFTotal();
                        this.currentChart = 'cpf';
                    } else {
                        if (angular.isDefined(chart.dataProvider))
                            chart.dataProvider.shift();
                        chart.dataProvider = this.initDataForProviderForCpfChart();
                    }
                } else {
                    if (this.currentChart != 'irc') {
                        this.initChartForCardValue();
                        this.currentChart = 'irc';
                    }
                    if (angular.isDefined(chart.dataProvider)) {
                        chart.dataProvider.shift();
                    }
                    chart.dataProvider = this.initDataForProviderForCPFInvestment();
                    chart.validateData();
                }
            } else if ($rootScope.investment.carouselIndex == 1 || $rootScope.investment.carouselIndex == 3) {
                if (this.currentChart != 'irc') {
                    this.initChartForCardValue();
                    this.currentChart = 'irc';
                } else {
                    if (angular.isDefined(chart.dataProvider))
                        chart.dataProvider.shift();
                    chart.dataProvider = this.initDataForProviderCardValue();
                }
            } else {
                $rootScope.investment.selectChangeInvestmentType($rootScope.investmentChoice);
                var checkInvestmentChart = ($('#chartInvestment').children().length == 0);
                if (chart == null || checkInvestmentChart || this.currentChart != 'investment') {
                    this.initValueForInvestmentCards();
                    this.currentChart = 'investment';
                    isValidateData = true;
                    this.init();
                }

                if (angular.isDefined(chart.dataProvider)) chart.dataProvider.shift();
                chart.dataProvider = this.initDataForProvider();
            }
        } else {
            if (this.currentChart != 'total_investment') {
                isValidateData = true;
                this.currentChart = 'total_investment';
                this.init();
            }
            if (angular.isDefined(chart.dataProvider)) chart.dataProvider.shift();
            chart.dataProvider = this.initDataForProvider(); 
        }

        this.isBindingDataForChart = true;
        if (angular.isDefined(chart.dataProvider) && chart.dataProvider.length > 0) {
            isValidateData = true;
            if (chart.categoryAxis.guides && chart.categoryAxis.guides.length > 0) {
                chart.categoryAxis.guides[0].category = $rootScope.PersonaPlan.retirement_age;
            }
            chart.validateData();
            this.bindingDataForView(0);
            this.zoomChart();
        }
    },

    this.showChart = function () {
        if (this.isBindingDataForChart) {
            chart.validateData();
            this.zoomChart();
            this.isBindingDataForChart = false;
        }
        }
    this.playBack = function (playAction) {
        var self = this;
        $rootScope.investment.carouselIndex = playAction.data.type;
        if (playAction.data.variable === 'investment_choice') {
            utilService.showInfoMessage(utilService.translate("Play " + ($rootScope.playBackPlayerData.isForward ? "forward" : "backward") + ": {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate('Change investment choice') }));
            $rootScope.hightLightObjectById('div_investmentChoise');
            if ($rootScope.playBackPlayerData.isForward) {
                playAction.data.oldValue = angular.copy($rootScope.investmentChoice);
                this.selectInvestmentChoice(playAction.data.value);
            } else if ($rootScope.playBackPlayerData.isBackward) {
                this.selectInvestmentChoice(playAction.data.oldValue);
            }
            
            $rootScope.investment.carouselIndex = 0;
        } else if (playAction.data.variable === 'contingency_ratio') {
            $rootScope.hightLightObjectById('ironReserveSlide');
            utilService.showInfoMessage(utilService.translate("Play " + ($rootScope.playBackPlayerData.isForward ? "forward" : "backward") + ": {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate('Change contigency ratio') }));
            $rootScope.hightLightObjectById('ironReserveSlide');
           
            angular.forEach($rootScope.cashFlow.investment_start, function (card) {
                if (card.name == 'contingency_ratio') {
                    if ($rootScope.playBackPlayerData.isForward) {
                        playAction.data.oldValue = angular.copy(card.value);
                        card.value = playAction.data.value;
                    } else if ($rootScope.playBackPlayerData.isBackward) {
                        card.value = playAction.data.oldValue;
                    }
                    self.initValueForInvestmentCards();
                }
            });
            $rootScope.investment.carouselIndex = 1;
        } else if (playAction.data.variable == 'bank_household_start' ) {
            $rootScope.hightLightObjectById('curentAccount');
            utilService.showInfoMessage(utilService.translate("Play " + ($rootScope.playBackPlayerData.isForward ? "forward" : "backward") + ": {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate("Change current account balance") }));
            angular.forEach($rootScope.cashFlow.investment_start, function (card) {
                if (card.name == 'bank_household_start') {
                    if ($rootScope.playBackPlayerData.isForward) {
                        playAction.data.oldValue = angular.copy(card.value);
                        card.value = playAction.data.value / 1000;
                    } else if ($rootScope.playBackPlayerData.isBackward) {
                        card.value = playAction.data.oldValue;
                    }
                    self.initValueForInvestmentCards();
                }
            });
            $rootScope.investment.carouselIndex = 3;
        } else if (playAction.data.variable == 'trading_household_start') {
            $rootScope.hightLightObjectById('Brokerage');
            utilService.showInfoMessage(utilService.translate("Play " + ($rootScope.playBackPlayerData.isForward ? "forward" : "backward") + ": {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate("Change Brokeage balance") }));
           
            angular.forEach($rootScope.cashFlow.investment_start, function (card) {
                if (card.name == 'trading_household_start') {
                    if ($rootScope.playBackPlayerData.isForward) {
                        playAction.data.oldValue = angular.copy(card.value);
                        card.value = playAction.data.value / 1000;
                    } else if ($rootScope.playBackPlayerData.isBackward) {
                        card.value = playAction.data.oldValue;
                    }
                    self.initValueForInvestmentCards();
                }
            });
            $rootScope.investment.carouselIndex = 2;
        } else if (playAction.data.variable == 'contingency_household_start') {
            $rootScope.hightLightObjectById('IronReserve');
            utilService.showInfoMessage(utilService.translate("Play " + ($rootScope.playBackPlayerData.isForward ? "forward" : "backward") + ": {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate("Change Iron Reserve balance") }));
            
            angular.forEach($rootScope.cashFlow.investment_start, function (card) {
                if (card.name == 'contingency_household_start') {
                    if ($rootScope.playBackPlayerData.isForward) {
                        playAction.data.oldValue = angular.copy(card.value);
                        card.value = playAction.data.value / 1000;
                    } else if ($rootScope.playBackPlayerData.isBackward) {
                        card.value = playAction.data.oldValue;
                    }
                    self.initValueForInvestmentCards();
                }
            });
            $rootScope.investment.carouselIndex = 1;

        } else if (playAction.data.variable.indexOf('cpf_oa_') == 0) {
            utilService.showInfoMessage(utilService.translate("Play " + ($rootScope.playBackPlayerData.isForward ? "forward" : "backward") + ": {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate("Change Ordinary Account balance") }));
            this.expandCPF('CPFOrdinary');
            this.playbackUpdateCpfInvestment(0);
            this.playbackUpdateCPFInCashFlow(playAction.data);
            $rootScope.investment.carouselIndex = 4;
        } else if (playAction.data.variable.indexOf('cpf_ms_') == 0) {
            utilService.showInfoMessage(utilService.translate("Play " + ($rootScope.playBackPlayerData.isForward ? "forward" : "backward") + ": {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate("Change Medisave Account balance") }));
            this.expandCPF('CPFMedisave');
            this.playbackUpdateCpfInvestment(1);
            this.playbackUpdateCPFInCashFlow(playAction.data);
            $rootScope.investment.carouselIndex = 4;
        } else if (playAction.data.variable.indexOf('cpf_sa_') == 0) {
            utilService.showInfoMessage(utilService.translate("Play " + ($rootScope.playBackPlayerData.isForward ? "forward" : "backward") + ": {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate("Change Special Account balance") }));
            this.expandCPF('CPFSpecial');
            this.playbackUpdateCpfInvestment(2);
            this.playbackUpdateCPFInCashFlow(playAction.data);
            $rootScope.investment.carouselIndex = 4;
        } else if (playAction.data.variable.indexOf('cpf_ra_') == 0) {
            utilService.showInfoMessage(utilService.translate("Play " + ($rootScope.playBackPlayerData.isForward ? "forward" : "backward") + ": {{order}}. {{action_description}}", { order: playAction.order, action_description: utilService.translate("Change Retirement Account balance") }));
            this.expandCPF('CPFRetirement');
            this.playbackUpdateCpfInvestment(3);
            this.playbackUpdateCPFInCashFlow(playAction.data);
            $rootScope.investment.carouselIndex = 4;
        }
        $rootScope.utilService.scopeApply();
    },
    this.playbackUpdateCpfInvestment = function (index) {
        $rootScope.cpfInvestmentChoice = index;
        $rootScope.cpfInvestmentChoiceName = $rootScope.cpfInvestment[index].ret_name;
        $rootScope.cpfInvestmentChoiceDisplay = $rootScope.cpfInvestment[index].titleDisplay;
    }
    this.playbackUpdateCPFInCashFlow = function (playbackData) {
        var cpf_start = null;
        for (var i = 0; i < $rootScope.cashFlow.investment_start.length; i++) {
            if ($rootScope.cashFlow.investment_start[i].name == 'cpf_start') {
                cpf_start = $rootScope.cashFlow.investment_start[i];
            }
        }
        if (cpf_start != null) {
            var main_cpf = cpf_start.children[0];
            angular.forEach(main_cpf.children, function (item) {
                if (item.name == playbackData.variable) {
                    if ($rootScope.playBackPlayerData.isForward) {
                        playbackData.oldValue = item.value * 1000;
                        item.value = playbackData.value / 1000;
                    } else {
                        item.value = playbackData.oldValue / 1000;
                    }
                }
            })
            var spouse_cpf = cpf_start.children[1]
            angular.forEach(spouse_cpf.children, function (item) {
                if (item.name == playbackData.variable) {
                    if ($rootScope.playBackPlayerData.isForward) {
                        playbackData.oldValue = item.value * 1000;
                        item.value = playbackData.value / 1000;
                    } else {
                        item.value = playbackData.oldValue / 1000;
                    }
                }
            });
            $timeout(function () { 
                $rootScope.hightLightObjectById('investment_' + playbackData.variable);
            }, 500)
            this.initInvestmentCardsAndCpf();
        }
        
    }

    this.UpdateControlForShareScreen = function (obj) {
        switch (obj.actionEvent) {
            case 'selectIndividualType':
                if (obj.newValue == true) {
                    $('#investments-btn1').click();
                } else {
                    $('#investments-btn2').click();
                }
                this.selectIndividualType(obj.newValue);
                break;
            case 'changeCard': 
                $rootScope.investment.carouselIndex = obj.newValue;
                utilService.scopeApply();
                break;
            case 'selectInvestmentChoice':
                this.selectInvestmentChoice(obj.newValue);
                break;
            case 'showDialogIronReserve':
                this.showDialogIronReserve();
                break;
            case 'oKDialogIronReserve': 
                $rootScope.investmentCards[5].value = parseFloat(obj.newValue);
                $rootScope.investmentCards[2].config.value = parseFloat(obj.newValue) * 12;
                $timeout(function () {
                    $('#' + obj.controlID).modal('hide');
                }, 2000);
                utilService.scopeApply();
                break;
            case 'cancelDialogIronReserve':
                $rootScope.investmentCards[2].config.value = obj.newValue;
                $timeout(function () {
                    $('#' + obj.controlID).modal('hide');
                }, 2000);
                utilService.scopeApply();
                break;
            case 'requestCalculatorForCpfInvestment':
             //   $rootScope.cpfInvestment = angular.copy(obj.newValue);
              //  utilService.scopeApply(); 
                break;
            case 'requestCalculatorData':
                $rootScope.investmentCards = angular.copy(obj.newValue);
                utilService.scopeApply(); 
                break;
            case 'selectBoxOptions':
                $('#investment_type' + obj.newValue+'').click();
                $('.investment_type_option').removeClass("btn-primary").addClass("btn-white");
                $('#investment_type' + obj.newValue + '').addClass('btn-primary').removeClass('btn-white');
                break;
            case 'expand_key':
                $('#investment_header_' + obj.newValue + '').click();
                this.expandOrCollapse(obj.newValue);
                break;
            case 'selectCpfInvestment': 
                this.selectCpfInvestment(obj.newValue);
                break;
            case 'updateCashFlowData':
                $rootScope.cashFlow.investment_start = angular.copy(obj.newValue);
                this.initValueForInvestmentCards();
                this.initDataForCpfInvestment();
                break;
            case 'bindingDataForView':
                this.bindingDataForView(obj.newValue);
                break;
            default:
        }
    },
    this.recurseUpdateInvestmentStartOfCashFlow = function (item, cashFlowList) {        
        angular.forEach(cashFlowList, function (cash) {
            if (cash.variable == item.name) {                
                item.value = cash.value;
            }
        });
        if (item.children.length > 0) {
            for (var i = 0; i < item.children.length; i++) {
                this.recurseUpdateInvestmentStartOfCashFlow(item.children[i], cashFlowList);
            }
        }
    }
    this.updateInvestmentStartOfCashFlow = function (cashFlowList) {
        if ($rootScope.cashFlow.investment_start.length > 0) {
            for (var i = 0; i < $rootScope.cashFlow.investment_start.length; i++) {
                this.recurseUpdateInvestmentStartOfCashFlow($rootScope.cashFlow.investment_start[i], cashFlowList);
            }
        }
        this.initInvestmentCardsAndCpf();
    }

    this.initInvestmentCardsAndCpf = function () {
        this.initValueForInvestmentCards();
        this.initDataForCpfInvestment();
    }

    return this;
});