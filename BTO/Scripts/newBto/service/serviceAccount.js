btoApp.factory('accountService',
function ($rootScope, $filter, $http, utilService, $locale, $timeout, $state) {

    this.loadUserInfo = function () {
        this.User = {};
        this.User.username = user_name;
        this.User.id = user_id;
    }

    this.loadExternalLoginProvider = function () {
        // Get External login

        utilService.callApi('GET', '/api/ManageUser/ManageExternalLoginProviders', '', '', function (response) {
            $rootScope.listLogins = [];
            var check = false;
            var basicLoginData = {
                name: 'Basic Login',
                status: null,
                key: null,
            }
            var googleLoginData = {
                name: 'Google',
                status: true,
                key: null,
            }
            var linkedInLoginData = {
                name: 'LinkedIn',
                status: true,
                key: null,
            }
            var facebookInLoginData = {
                name: 'Facebook',
                status: true,
                key: null,
            }
            var twitterInLoginData = {
                name: 'Twitter',
                status: true,
                key: null,
            }
            
            angular.forEach(response, function (item) {
                if (item.name == 'Basic Login') {
                    check = true;
                    basicLoginData.status = item.status;
                    basicLoginData.key = item.key;
                } else if (item.name == 'Google') {
                    googleLoginData.status = item.status;
                    googleLoginData.key = item.key;
                } else if (item.name == 'LinkedIn') {
                    linkedInLoginData.status = item.status;
                    linkedInLoginData.key = item.key;
                } else if (item.name == 'Facebook') {
                    facebookInLoginData.status = item.status;
                    facebookInLoginData.key = item.key;
                } else if (item.name == 'Twitter') {
                    twitterInLoginData.status = item.status;
                    twitterInLoginData.key = item.key;
                }
            });
            $rootScope.isShowChangePassword = check;
            if ($rootScope.isShowChangePassword) $rootScope.listLogins.push(basicLoginData);
            $rootScope.listLogins.push(linkedInLoginData);
            $rootScope.listLogins.push(googleLoginData);
            $rootScope.listLogins.push(facebookInLoginData);
            $rootScope.listLogins.push(twitterInLoginData);
            
            /*
            $rootScope.listLogins = response;
            // check is show change password
            var check = false;
            angular.forEach($rootScope.listLogins, function (item) {
                if (item.name == 'Basic Login') {
                    check = true;
                }
            });
            $rootScope.isShowChangePassword = check;
            */
        },
        function () {
            // callback failed
        },
        function () {
            // callback error
        })
    }
    this.showMyAccountDialog = function () {        
        $rootScope.isShowChangePassword = false;
        // Reset info of password
        $rootScope.changePasswordData = {
            OldPassword: "",
            NewPassword: "",
            ConfirmPassword: ""
        }
        this.loadExternalLoginProvider();
        $timeout(function () {
            $('#OldPasswordInput').focus();
            $('#manageAccountDialog').modal();
        }, 500)
    }

    this.showUpdateAccountDialog = function () {      
        $rootScope.updateAccountData = {
            Email: "",
            Password: "",
            ConfirmPassword: ""
        }
        this.loadExternalLoginProvider();
        $timeout(function () {          
            $('#updateAccountDialog').modal();
        }, 500)
    }


    this.submitUpdateAccount = function () {
        utilService.callApi('POST', '/api/ManageUser/UpdateAccount', '', $rootScope.updateAccountData, function (response) {
            var data = response;
            if (data.success) {
              
                $rootScope.changePasswordData = {
                    Email: "",
                    Password: "",
                    ConfirmPassword: ""
                }
             
                $timeout(function () {
                    utilService.ShowDialog($rootScope, utilService.translate('Confirmation'), utilService.translate('Account has been registered successfully. <br>Do you want to keep current data?'), utilService.translate('Yes'),
                       function () {                          
                           window.location.href = '/Account/InfoConfirmEmail';
                       }
                        , utilService.translate('No'),
                        
                        function () {
                            $rootScope.planService.resetPersonalPlanWithCashFlow($rootScope.PersonaPlan.user_id, $rootScope.cashFlow.parameter._c_retirement_main, $rootScope.cashFlow.parameter.age_payout_main, $rootScope.PersonaPlan.status, $rootScope.timelineService.ResetPlanSuccess);
                            $rootScope.illiquidAsset.resetAllSwiper();
                            window.location.href = '/Account/InfoConfirmEmail';
                        }
                        
                        );
                }, 400);

                

            } else {
                utilService.showErrorMessage(data.errcode);
            }
        },
        function () {
            // callback failed
        },
        function () {
            // callback error
        })
    }


    this.hideMyAccountDialog = function () {        
    }
  
    this.showLogoffSystem = function () {
        console.log('showLogoffSystem');
        window.location = "Account/LogOff";
    }
    this.getListParameter = function () {
        $rootScope.configParameter = {};
        utilService.callApiByAjax('GET', '/api/parameter/get_list_item_of_parameter', '', function (response) {
            $rootScope.listItemOfParameter = response;
            $rootScope.listCurrency = [];
            $rootScope.configParameter.Mc_Top_Value = [];
            $rootScope.configParameter.Mc_Bottom_value = [];
            $rootScope.configParameter.Trials = [];
            $rootScope.genderList = [];
            $rootScope.residencyStatusList = [];
            $rootScope.maritalStatusList = [];
            $rootScope.occupationList = [];
            $rootScope.relationshipList = [];
            $rootScope.residentialType = [];
            angular.forEach($rootScope.listItemOfParameter, function (item) {
                switch (item.parameter_name) {
                    case 'persona_plan.currency_code':
                        $rootScope.listCurrency.push(item);
                        break;
                    case 'persona_plan.mc_top_value':
                        $rootScope.configParameter.Mc_Top_Value.push(item.name);
                        break;
                    case 'persona_plan.mc_bottom_value':
                        $rootScope.configParameter.Mc_Bottom_value.push(item.name);
                        break;
                    case 'persona_plan.number_trials':
                        $rootScope.configParameter.Trials.push(item.name);
                        break;
                    case 'user_profile.gender':
                        $rootScope.genderList.push({ id: parseInt(item.value), name: item.name });
                        break;
                    case 'user_profile.residency_status':
                        $rootScope.residencyStatusList.push({ id: parseInt(item.value), name: item.name });
                        break;
                    case 'user_profile.married_status':
                        $rootScope.maritalStatusList.push({ id: parseInt(item.value), name: item.name });
                        break;
                    case 'user_profile.occupation':
                        $rootScope.occupationList.push({ id: parseInt(item.value), name: item.name });
                        break;
                    case 'user_profile.relationship':
                        $rootScope.relationshipList.push({ id: parseInt(item.value), name: item.name });
                        break;
                    case 'dream.residence_purchase.property_type':
                        $rootScope.residentialType.push({ id: parseInt(item.value), name: item.name });
                        break;
                }                
            });
        });
    }
    this.initData = function () {
        //this.getListParameter();
        utilService.callApiByAjax('GET', 'api/parameter/get_parameter_profile', '', function (response) {
            $rootScope.listParameter = response;            
        });        
    }

    $rootScope.isFirstLoadCurrentcyForSharing = true;
    this.changeCurrency = function (currency) {        
        var isChangeCurrency = true;
        if ($rootScope.PersonaPlan.currency_code == currency)
            isChangeCurrency = false;
        $rootScope.PersonaPlan.currency_code = angular.copy(currency);
        $locale.NUMBER_FORMATS.CURRENCY_SYM = currency + ' ';
        //$rootScope.SetEventActionTypeForShare('currencyId', 'showing');


        $timeout(function () {            
            $rootScope.StateReload = true;
            //$state.reload();
            //$rootScope.$apply();
            utilService.stateReload();
            utilService.scopeApply();
            if (localStorage.isSharing == "true" && $rootScope.isFirstLoadCurrentcyForSharing == true) {
                $rootScope.isFirstLoadCurrentcyForSharing = false;
            } else if (isChangeCurrency) {
                utilService.showSuccessMessage(utilService.translate("Currency has been changed!"));
            }
            //$rootScope.SendingScreenSharingDataObject(currency, 'tab', 'change', 'currency');
           
        }, 100);
        if (isChangeCurrency) {
            //$rootScope.Settings.isAjaxInstantRequest = true;
            //$rootScope.requestSaveAndUpdateScreen();
        }
    };

    
    this.disableLogin = function (item) {
        var self = this;
        // check can disable account
        var count = 0;
        angular.forEach($rootScope.listLogins, function (item) {
            if (!item.status) {
                count++;
            }
        });
        if (count >= 2) {
            var callbackOK = function () {
                utilService.callApi('POST', '/api/ManageUser/DisableLoginProvider', '', item, function (response) {
                    var data = response
                    if (data.success) {
                        utilService.showSuccessMessage(utilService.translate("Your login was disabled successfully"));
                        self.loadExternalLoginProvider();
                        $timeout(function () {
                            $rootScope.$apply();
                        }, 500);
                    } else {
                        utilService.showErrorMessage(data.errcode);
                    }
                },
                function () {
                    // callback failed
                },
                function () {
                    // callback error
                })
            };

            utilService.ShowDialog($rootScope, utilService.translate("Confirm"),
                utilService.translate("Do you want to disable login {{type}}", { type: item.name }), utilService.translate("Yes"), callbackOK, utilService.translate("No")
               
            );
        } else {
            utilService.showErrorMessage(utilService.translate("You can not disable this login"));
        }
    }
    this.enableLogin = function (item) {
        var self = this;
        if (item.key == null) {
            utilService.ShowDialog($rootScope, utilService.translate("Confirm"), utilService.translate("Do you want to connect login {{type}}", { type: item.name }),
                 utilService.translate("Yes"), function () {
                     if (item.name != 'Basic Login') {
                         $('#social_login_' + item.name.toLowerCase()).trigger('click')
                     }
                 }, utilService.translate("No")
            );
        } else {
            var callbackOK = function () {
                utilService.callApi('POST', '/api/ManageUser/EnableLoginProvider', '', item, function (response) {
                    var data = response;
                    if (data.success) {
                        utilService.showSuccessMessage(utilService.translate("Your login was enabled successfully"));
                        self.loadExternalLoginProvider();
                        $timeout(function () {
                            $rootScope.$apply();
                        }, 500);
                    } else {
                        utilService.showErrorMessage(data.errcode);
                    }
                },
                function () {
                    // callback failed
                },
                function () {
                    // callback error
                })
            };

            utilService.ShowDialog($rootScope, utilService.translate("Confirm"), utilService.translate("Do you want to enable login {{type}}", { type: item.name }),
                 utilService.translate("Yes"), callbackOK, utilService.translate("No")
            );
        }
    }

    this.submitChangePassword = function () {
        utilService.callApi('POST', '/api/ManageUser/ChangePassword', '', $rootScope.changePasswordData, function (response) {
            var data = response;
            if (data.success) {
                utilService.showSuccessMessage(utilService.translate("Password has been changed successfully"));
                $rootScope.changePasswordData = {
                    OldPassword: "",
                    NewPassword: "",
                    ConfirmPassword: ""
                }
                $rootScope.form_change_password.$setPristine();
                $timeout(function () {
                    $rootScope.$apply();
                }, 500);
            } else {
                utilService.showErrorMessage(data.errcode);
            }
        },
        function () {
            // callback failed
        },
        function () {
            // callback error
        })                       
    }

    return this;
})