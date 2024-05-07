btoApp.factory('profileService',
    function ($rootScope, $http, $timeout, $q, $interval, utilService, personalPlanService, timelineService, $filter) {
        var output = [];
        $rootScope.childAgeRange = [];
        for (var i = 0; i < 20; i++) {
            range = [];
            for (var j = 0; j < 25; j++) {
                range.push(j);
            }
            $rootScope.childAgeRange[i] = range;
        }
        $rootScope.isCanEditProfile = isCanEditProfile;
        $rootScope.isReadyShowProfile = false;
        this.getDataFromList = function (arrayList, obj, format) {
            if (angular.isDefined(arrayList)) {
                if (angular.isDefined(format)) {
                    if (format === 'iso_code_3') {
                        return $filter('filter')(arrayList, { iso_code_3: obj })[0];
                    }
                    else if (format === 'dial_code')
                        return $filter('filter')(arrayList, { dial_code: obj })[0];
                } else
                    return $filter('filter')(arrayList, { id: obj })[0];
            } else {
                return { id: "", name: "" };
            }
        },

        this.initForm = function (formObj) {
            var self = this;
            $timeout(function () {
                self.form_profile = formObj.form_profile;
            }, 1000)
        }

        this.submitForm = function (valid) {

            if (valid) {
                this.confirmSaveChangeProfile();
            } else {
                utilService.showErrorMessage(utilService.translate('Some mandatory fields are missing'));
            }
        }
        //this.getListChildren = function (arrayList, obj) {
        //    if (angular.isDefined(arrayList)) {
        //        return $filter('filter')(arrayList, { dial_code: obj })[0];
        //    } else {
        //        return { id: "", name: ""};
        //    }
        //},
        this.showProfileDialog = function () {
            //$rootScope.spinner.active = false;
            $rootScope.profileDialogData = angular.copy($rootScope.profile);
            $rootScope.profileDialogData.client.age = $rootScope.profile.client.age;// angular.copy($rootScope.PersonaPlan.start_age);
            $rootScope.PersonaPlan.start_age = $rootScope.profile.client.age;
            if ($rootScope.profileDialogData.client.avatar != null) {
                if (document.getElementById('imgAvatar') != null) {
                    document.getElementById('imgAvatar').src = $rootScope.profileDialogData.client.avatar;
                }
            }
            else {
                if (document.getElementById('imgAvatar') != null)
                    document.getElementById('imgAvatar').src = "Themes/" + version_id + "/Content/Images/avatar-circle.png";
            }

            if ($rootScope.profileDialogData.client.spouse_avatar != null) {
                if (document.getElementById('imgSpouseAvatar') != null) {
                    document.getElementById('imgSpouseAvatar').src = $rootScope.profileDialogData.client.spouse_avatar;
                }
            }
            else {
                if (document.getElementById('imgSpouseAvatar') != null)
                    document.getElementById('imgSpouseAvatar').src = "Themes/" + version_id + "/Content/Images/avatar-circle.png";
            }

            var childIndependent = [];
            var otherIndependent = [];
            if ($rootScope.PersonaPlan.lifeEvent.length > 0) {
                angular.forEach($rootScope.PersonaPlan.lifeEvent, function (value, i) {
                    var currentAge = value.starting_age - $rootScope.PersonaPlan.start_age;
                    if (value.dream_type_id == 5 && currentAge <= 25) {
                        childIndependent[childIndependent.length] = value;
                    };
                    if (value.dream_type_id == 5 && currentAge > 25 && currentAge <= 81) {
                        otherIndependent[otherIndependent.length] = value;
                    };
                });
            }
            $rootScope.DefaultParameters = $.grep($rootScope.listParameter, function (e) { return e.name.indexOf('user_profile') > -1; });
            if (($rootScope.profileDialogData.client.first_name == null || $rootScope.profileDialogData.client.first_name ==undefined || $rootScope.profileDialogData.client.first_name.length < 1) && $rootScope.DefaultParameters.length > 0) {
                angular.forEach($rootScope.DefaultParameters, function (value, i) {
                    var name = value.name.substring('user_profile.'.length, value.name.length);
                    $rootScope.profileDialogData.client[name] = parseInt(value.default_value);
                    $rootScope.profileDialogData.spouse[name] = parseInt(value.default_value);
                });
            }
            childIndependent.sort(function (obj1, obj2) {
                return (obj1.starting_age - obj2.starting_age);
            });
            otherIndependent.sort(function (obj1, obj2) {
                return (obj1.starting_age - obj2.starting_age);
            });
           /* if ($rootScope.profileDialogData.spouse.age == null || $rootScope.profileDialogData.spouse.age <= 0) {
                $rootScope.profileDialogData.spouse.age = $rootScope.profileDialogData.client.age;
            }*/
            var genderDefault = parseInt(this.getParameterDefaultForProfile('gender'));
            //if (angular.isDefined($rootScope.profileDialogData.client.first_name) && $rootScope.profileDialogData.children.number_of_child == 0) {
            if ($rootScope.profileDialogData.children.number_of_child == null || $rootScope.profileDialogData.children.number_of_child == 0) {
                $rootScope.profileDialogData.children.number_of_child = null;
                //if (childIndependent.length > 0) {
                //    $rootScope.profileDialogData.children.number_of_child = childIndependent.length;
                //} else {
                //    // No remove
                //    $rootScope.profileDialogData.children.number_of_child = null;
                //}
                //angular.forEach(childIndependent, function (child) {
                //    $rootScope.profileDialogData.children.childrens[$rootScope.profileDialogData.children.childrens.length] = {

                //        name: '',
                //        gender: genderDefault,
                //        age: 25 - (child.starting_age - $rootScope.PersonaPlan.start_age),
                //        handicapped: false,
                //        independent: false
                //    }
                //});

            }
            //if (angular.isDefined($rootScope.profileDialogData.client.first_name) && $rootScope.profileDialogData.dependent.number_of_dependent == 0) 
            if ($rootScope.profileDialogData.dependent.number_of_dependent == null || $rootScope.profileDialogData.dependent.number_of_dependent == 0) {

                var relationShipDefault = parseInt(this.getParameterDefaultForProfile('relationship'));
                if (otherIndependent.length > 0) {
                    $rootScope.profileDialogData.dependent.number_of_dependent = otherIndependent.length;
                } else {
                    // No remove
                    $rootScope.profileDialogData.dependent.number_of_dependent = 0;
                }
                angular.forEach(otherIndependent, function (dependent) {
                    $rootScope.profileDialogData.dependent.dependents[$rootScope.profileDialogData.dependent.dependents.length] = {
                        name: '',
                        gender: genderDefault,
                        age: 81 - (dependent.starting_age - $rootScope.PersonaPlan.start_age),
                        relationship: relationShipDefault,
                        handicapped: false
                    }
                });

            }
            $rootScope.listStartAge = $rootScope.utilService.range(18, 54);
            $rootScope.isReadyShowProfile = true;
            $timeout(function () {
                $('#ProfileDialog').modal({ backdrop: 'static', keyboard: false });
                // auto focus
                $timeout(function () {
                    var focusEle = angular.element(document.querySelector('#dialog_profile_client_first_name'));
                    focusEle.focus();
                    $rootScope.spinner.off();
                }, 500);
            }, 1000);

            this.changeAgeRange();

        },
        this.getParameterDefaultForProfile = function (name) {
            for (var i = 0; i < $rootScope.DefaultParameters.length; i++) {
                var val = $rootScope.DefaultParameters[i];
                var paramName = val.name.substring('user_profile.'.length, val.name.length);
                if (name == paramName) {
                    return angular.copy(val.default_value);
                }
            }
            return '';
        },
        this.addSpouseRetirementIcon = function (spouseAge, clientAge) {
            var spouseYear = (60 - spouseAge) + clientAge;
            timelineService.removeSpouseRetirementIcon();
            timelineService.addSpouseRetirementIcon(spouseYear);
        },

        this.removeSpouseRetirementIcon = function () {
            timelineService.removeSpouseRetirementIcon();
        },

        this.changeNationality = function () {
            if ($rootScope.profileDialogData.client.nationality == 'SGP') {
                $rootScope.profileDialogData.client.residency_status = 0;
            }
        },

        this.changeSpouseNationality = function () {
            if ($rootScope.profileDialogData.spouse.nationality == 'SGP') {
                $rootScope.profileDialogData.spouse.residency_status = 0;
            }
        },

        this.changeAgeRange = function (childIndex) {
            
            if (angular.isUndefined(childIndex)) {
                var range_child_0 = [0];
                max_age = Math.min($rootScope.profileDialogData.client.age, $rootScope.profileDialogData.spouse.age) - 18;

                for (var i = 1; i <= max_age; i++) {
                    range_child_0.push(i);
                }

                $rootScope.childAgeRange[0] = range_child_0;
                if (angular.isDefined($rootScope.profileDialogData.children.childrens[0])) {
                    if ($rootScope.profileDialogData.children.childrens[0].age > max_age) {
                        $rootScope.profileDialogData.children.childrens[0].age = Math.max(max_age, 0);
                    }
                    if ($rootScope.profileDialogData.children.childrens[0].gender == 0)
                        $rootScope.profileDialogData.children.childrens[0].gender = $rootScope.cashFlow.parameter._c_gender_child_1;
                }

                if (angular.isDefined($rootScope.profileDialogData.children.childrens[0]) && angular.isDefined($rootScope.profileDialogData.children.childrens[1])) {
                    var range_child_1 = [0];
                    for (var i = 1; i < $rootScope.profileDialogData.children.childrens[0].age; i++) {
                        range_child_1.push(i);
                    }
                    $rootScope.childAgeRange[1] = range_child_1;

                    if ($rootScope.profileDialogData.children.childrens[1].age >= $rootScope.profileDialogData.children.childrens[0].age) {
                        $rootScope.profileDialogData.children.childrens[1].age = Math.max($rootScope.profileDialogData.children.childrens[0].age - 1, 0);
                    }

                    if ($rootScope.profileDialogData.children.childrens[1].gender == 0)
                        $rootScope.profileDialogData.children.childrens[1].gender = $rootScope.cashFlow.parameter._c_gender_child_2;
                }

                if (angular.isDefined($rootScope.profileDialogData.children.childrens[1]) && angular.isDefined($rootScope.profileDialogData.children.childrens[2])) {
                    var range_child_2 = [0];
                    for (var i = 1; i < $rootScope.profileDialogData.children.childrens[1].age; i++) {
                        range_child_2.push(i);
                    }
                    $rootScope.childAgeRange[2] = range_child_2;

                    if ($rootScope.profileDialogData.children.childrens[2].age >= $rootScope.profileDialogData.children.childrens[1].age) {
                        $rootScope.profileDialogData.children.childrens[2].age = Math.max($rootScope.profileDialogData.children.childrens[1].age - 1, 0);
                    }
                    if ($rootScope.profileDialogData.children.childrens[2].gender == 0)
                        $rootScope.profileDialogData.children.childrens[2].gender = $rootScope.cashFlow.parameter._c_gender_child_3 == 0 ? null :$rootScope.cashFlow.parameter._c_gender_child_3 ;
                }

                if (angular.isDefined($rootScope.profileDialogData.children.childrens[2]) && angular.isDefined($rootScope.profileDialogData.children.childrens[3])) {
                    var range_child_3 = [0];
                    for (var i = 1; i < $rootScope.profileDialogData.children.childrens[2].age; i++) {
                        range_child_3.push(i);
                    }
                    $rootScope.childAgeRange[3] = range_child_3;

                    if ($rootScope.profileDialogData.children.childrens[3].age >= $rootScope.profileDialogData.children.childrens[2].age) {
                        $rootScope.profileDialogData.children.childrens[3].age = Math.max($rootScope.profileDialogData.children.childrens[2].age - 1, 0);
                    }

                    if ($rootScope.profileDialogData.children.childrens[3].gender == 0)
                        $rootScope.profileDialogData.children.childrens[3].gender = $rootScope.cashFlow.parameter._c_gender_child_4 == 0 ? null : $rootScope.cashFlow.parameter._c_gender_child_4;
                }
            } else {
                console.log(childIndex);
            }
        },

        this.changeNumberOfChild = function () {
            if ($rootScope.profileDialogData.children.number_of_child > $rootScope.profileDialogData.children.childrens.length) {
                var defaultAge = 1, defaultGender = 1;
                for (var i = $rootScope.profileDialogData.children.childrens.length; i < $rootScope.profileDialogData.children.number_of_child; i++) {
                    defaultGender = $rootScope.cashFlow.parameter['_c_gender_child_' + (i + 1)];
                    defaultAge = $rootScope.cashFlow.parameter['_c_age_child_' + (i + 1)];
                    $rootScope.profileDialogData.children.childrens[$rootScope.profileDialogData.children.childrens.length] = {
                        name: '',
                        gender: defaultGender,
                        age: defaultAge,
                        handicapped: false,
                        independent: false,
                        avatar: null
                    }
                }

            } else if ($rootScope.profileDialogData.children.number_of_child < $rootScope.profileDialogData.children.childrens.length) {
                for (var i = $rootScope.profileDialogData.children.childrens.length; i > $rootScope.profileDialogData.children.number_of_child; i--) {
                    $rootScope.profileDialogData.children.childrens.pop();
                }
            }
            this.changeAgeRange();
        },

        this.changeNumberOfDependent = function () {
            // var genderDefault = parseInt(this.getParameterDefaultForProfile('gender'));
            // var relationShipDefault = parseInt(this.getParameterDefaultForProfile('relationship'));
            if ($rootScope.profileDialogData.dependent.number_of_dependent > $rootScope.profileDialogData.dependent.dependents.length) {
                for (var i = $rootScope.profileDialogData.dependent.dependents.length; i < $rootScope.profileDialogData.dependent.number_of_dependent; i++) {
                    $rootScope.profileDialogData.dependent.dependents[$rootScope.profileDialogData.dependent.dependents.length] = {
                        name: '',
                        gender: null,
                        age: null,
                        relationship: null,
                        handicapped: false
                    }
                }
            } else if ($rootScope.profileDialogData.dependent.number_of_dependent < $rootScope.profileDialogData.dependent.dependents.length) {
                for (var i = $rootScope.profileDialogData.dependent.dependents.length; i > $rootScope.profileDialogData.dependent.number_of_dependent; i--) {
                    $rootScope.profileDialogData.dependent.dependents.pop();
                }
            }

        },

        this.loadCountry = function () {
            if ($rootScope.countries == null) {
                $http({ method: 'GET', url: 'Content/data/country.js' }).success(function (data) {
                    $rootScope.countries = data;
                });
            }
        },

        this.textCountryCode = function (code, name) {
            //return $sce.trustAsHtml( '<b>' + code + '</b>' + ' ' + name);
            return name;
        },
        this.ShowdialogConfirm = function () {
            $timeout(function () {
                utilService.ShowDialog($rootScope, utilService.translate('Confirmation'), utilService.translate('Changes to your profile will be irreversible.') + " <br /> " + utilService.translate("You can't change your age after saving your profile. Are you sure?"), utilService.translate('Yes'), $rootScope.timelineService.ConfirmOKDialogProfile, utilService.translate('No'));
            }, 400);
        }
        // Changes to your profile will be irreversible. Please check that your data are accurate. Do you want to save your profile ?
        this.confirmSaveChangeProfile = function () { 
            if (!$rootScope.profileDialogData.client.isChangedStartAge && $rootScope.isCanEditProfile != 'True') {
                if (parseInt($rootScope.profileDialogData.client.age) > parseInt($rootScope.MaxStartAge)) {
                    $timeout(function () {
                        utilService.ShowDialog($rootScope, utilService.translate('Confirmation'), utilService.translate("All dreams and life events before {{age}} will be changed to existing. Do you want to save?", { age: $rootScope.profileDialogData.client.age }), utilService.translate('Yes'),
                          $rootScope.profileService.ShowdialogConfirm
                            , utilService.translate('No'));
                    }, 1);
                } else {
                    this.ShowdialogConfirm();
                }
            } else {

                this.saveProfile();
            }
        },
        this.saveProfile = function () {
            $rootScope.utilService.UpdateDreamLifeEventToExisting($rootScope, $rootScope.profileDialogData.client.age);
            var profileDialogData = $rootScope.profileDialogData;
            var imageAvatarData = $('#imgAvatar').attr('src');
            if (imageAvatarData != null) {
                profileDialogData.client.avatar = imageAvatarData;
            } 
            var imageSpouseAvatarData = $('#imgSpouseAvatar').attr('src');
            if (imageSpouseAvatarData != null) {
                profileDialogData.client.spouse_avatar = imageSpouseAvatarData;
            } 
            var profileData = {
                id: profileDialogData.id,
                user_login_id: profileDialogData.user_id,
                age: profileDialogData.client.age,
                email: profileDialogData.client.email,
                first_name: profileDialogData.client.first_name,
                last_name: profileDialogData.client.last_name,
                gender: profileDialogData.client.gender,
                married_status: profileDialogData.client.married_status,
                nationality: profileDialogData.client.nationality,
                phone_code: profileDialogData.client.phone_code,
                phone_number: profileDialogData.client.phone_number,
                residency_status: profileDialogData.client.residency_status,
                occupation: profileDialogData.client.occupation,
                spouse_occupation: profileDialogData.spouse.occupation,
                spouse_age: profileDialogData.spouse.age,
                spouse_gender: profileDialogData.spouse.gender,
                spouse_first_name: profileDialogData.spouse.first_name,
                spouse_last_name: profileDialogData.spouse.last_name,
                spouse_nationality: profileDialogData.spouse.nationality,
                spouse_residency_status: profileDialogData.spouse.residency_status,
                dependent: [],
                typeplan: "current",
                avatar: imageAvatarData,
                spouse_avatar: imageSpouseAvatarData,
                isChangedStartAge: true,
                isChanged: true
            }
            if (profileDialogData.children.number_of_child > 0) {
                angular.forEach(profileDialogData.children.childrens, function (child) {
                    var item = {
                        id: child.id,
                        full_name: child.name,
                        gender: child.gender,
                        age: child.age,
                        handicapped: child.handicapped,
                        independent: child.independent,
                        relationship: null,
                        avatar : child.avatar
                    }
                    profileData.dependent[profileData.dependent.length] = item;
                });
            }
            //if (profileDialogData.dependent.number_of_dependent > 0) {
            //    angular.forEach(profileDialogData.dependent.dependents, function (dependent) {
            //        var item = {
            //            id: dependent.id,
            //            full_name: dependent.name,
            //            gender: dependent.gender,
            //            age: dependent.age,
            //            handicapped: dependent.handicapped,
            //            independent: null,
            //            relationship: dependent.relationship,
            //            avatar: dependent.avatar
            //        }
            //        profileData.dependent[profileData.dependent.length] = item;
            //    });
            //}
            var self = this;
            var profileUrl = '';
            profileData.persona_plan_id = $rootScope.PersonaPlan.id;
            //if ($rootScope.PersonaPlan.status == 0) { // Current
            //    profileData.typeplan = 'current';
            //} else if ($rootScope.PersonaPlan.status == 1) { // New
            //    profileData.typeplan = 'new';
            //}
            $rootScope.spinner.on();
            $http({
                method: 'POST',
                url: '/api/user_profile/update_profile',
                data: profileData
            }).then(function (response) {
                $rootScope.spinner.off();
                $('#ProfileDialog').modal('hide');
                $rootScope.profileService.cancelUpdateProfile();
                if (response.data.success == true) {
                                       
                    utilService.showSuccessMessage('Profile was updated successful');

                    // check email was change
                    if ($rootScope.profile.client.email != $rootScope.profileDialogData.client.email) {
                        utilService.showWarningMessage('Email was changed, system will automatically logout');
                        $timeout(function () {
                            window.location = "Account/LogOff";
                            //document.getElementById('logoutForm').submit();
                        }, 5000);
                    } else {
                        if (!utilService.checkEqualProfile($rootScope.profile, $rootScope.profileDialogData)) {
                            personalPlanService.getPersonalPlan($rootScope.profile.user_id, function () {
                                $timeout(function () {
                                    $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan);
                                }, 50);
                                $rootScope.isUpdateCashFlowTree = true;
                                // $rootScope.isFirstLoadProfile = true;
                                $timeout(function () {
                                    $rootScope.planService.updateAgeDependentOfChildIndependent($rootScope.PersonaPlan);
                                    $rootScope.utilService.scopeApply();
                                    $rootScope.timelineService.renderTimeLine();
                                }, 2000);
                                    //var json = JSON.stringify($rootScope.PersonaPlan.lifeEvent);
                                    //console.log(json);
                            });
                            //$rootScope.actionService.calculateData();
                        }
                        $rootScope.profile.client.married_status = parseInt(profileData.married_status);
                        $rootScope.profile.spouse.occupation = parseInt(profileData.occupation);
                        $rootScope.profile.spouse.age = profileData.spouse_age;
                        if (profileData.married_status == 1) {
                            if (profileData.occupation == 1 || profileData.occupation == 2) {
                                self.addSpouseRetirementIcon(profileData.spouse_age, profileData.age);
                            }
                            //else {
                            //    self.removeSpouseRetirementIcon();
                            //    }
                        }
                        //else if (profileData.married_status == 0) {
                        //    self.removeSpouseRetirementIcon();
                        //}
                        // check child or independence
                        //var childIndependent = [];
                        //if ($rootScope.PersonaPlan.lifeEvent.length > 0) {
                        //    angular.forEach($rootScope.PersonaPlan.lifeEvent, function (value, i) {
                        //        if (value.dream_type_id == 5) {
                        //            childIndependent[childIndependent.length] = value;
                        //        };
                        //    });
                        //}

                        //$rootScope.profile = angular.copy($rootScope.profileDialogData);
                        var isChanged = $rootScope.profile.client.isChangedStartAge;
                        $rootScope.profile = self.convertProfileDataFromServerData(response.data.results);
                        $rootScope.profile.user_id = user_id;
                        self.updateFamilyMemberOfEducationDreamAfterChangeProfile();
                        // self.updateChildMemberOfIndependentChildAfterChangeProfile();
                        self.updateListFamilyMember($rootScope.profile);
                        $rootScope.ProfileName = {};
                        $rootScope.ProfileName.main = $rootScope.profileDialogData.client.first_name;
                        if ($rootScope.profileDialogData.client.first_name == null || $rootScope.profileDialogData.client.first_name == '') {
                            $rootScope.ProfileName.main = 'own';
                        }
                        if ($rootScope.profileDialogData.client.married_status == 1) {
                            $rootScope.ProfileName.spouse = $rootScope.profileDialogData.spouse.first_name;
                            if ($rootScope.profileDialogData.spouse.first_name == null || $rootScope.profileDialogData.spouse.first_name == '') {
                                $rootScope.ProfileName.spouse = 'spouse';
                            }
                        }
                        var childList = [];
                        var childIndex = 0;
                        angular.forEach($rootScope.profileDialogData.children.childrens, function (item) {
                            childIndex++;
                            var child_name = "child_" + childIndex;
                            childList.push({
                                key: child_name,
                                value: item.name == null ? 'Child' : item.name
                            })
                            var childIndependentList = $rootScope.PersonaPlan.lifeEvent.filter(function (lifeEvent) {
                                return lifeEvent.dependent_reference == ("child_" + item.id);
                            });
                            //if (childIndependentList.length > 0) {
                            //    var childIndependent = childIndependentList[0];
                            //    if (childIndependent.starting_age <= $rootScope.PersonaPlan.death_age) {
                            //        childIndependent.starting_age = $rootScope.PersonaPlan.start_age + childIndependent.age_dependent - item.age;
                            //    }
                            //}
                            //$rootScope.ProfileName[child_name] = item.name;
                        });
                        // Check child name is duplicate
                        if (childList.length > 0) {
                            for (var i = 0; i < childList.length; i++) {
                                var count = 1;
                                for (var j = 0; j < childList.length; j++) {
                                    if (childList[i].key != childList[j].key && childList[i].value == childList[j].value) {
                                        count++;
                                        //childList[i].value += ' 1';
                                        childList[j].value += ' ' + count;
                                    }
                                }
                                if (count > 1) {
                                    childList[i].value += ' 1';
                                }
                            }
                            angular.forEach(childList, function (item) {
                                $rootScope.ProfileName[item.key] = item.value;
                            });
                        }
                        //if (childIndependent.length == 0) {                            
                        //    if (profileData.typeplan == 'new') {
                        //        $rootScope.PersonaPlan = angular.copy($rootScope.newPlan);
                        //    } else if (profileData.typeplan == 'current') {
                        //        $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
                        //    }
                        //    personalPlanService.updateConvertDataOfPersonalPlan();
                        //    $rootScope.refreshTimelineAfterUpdateProfile();
                        //}
                        /*if (angular.isDefined($rootScope.savingRate)) {
                            $rootScope.savingRate.updateCashFlow();
                        }*/

                        if (profileDialogData.isChangedStartAge)
                            $rootScope.profileDialogData.client.isChangedStartAge = true;
                        if (!isChanged) {
                            $rootScope.PersonaPlan.start_age = parseInt(profileDialogData.client.age);
                            $rootScope.profile.client.age = parseInt(profileDialogData.client.age);
                            $rootScope.profile.client.isChangedStartAge = true;
                            //$rootScope.timelineService.renderTimeLine();
                        }
                        if ($rootScope.isCanEditProfile == 'True') {
                            $rootScope.profileDialogData.client.isChangedStartAge = false;
                            $rootScope.profile.client.isChangedStartAge = false;
                        }                        
                    }
                } else {
                    utilService.showErrorMessage(response.data.errcode);
                }
                
                $rootScope.PersonaPlan.return_cashFlow = true;
                
                
            });
        },
        $rootScope.familyMembers = [];
        $rootScope.childMembers = [];
        this.updateListFamilyMember = function (profileData, playbackProfile) {
            var profileObject = profileData;
            if (angular.isDefined(playbackProfile)) {
                profileObject = {
                    client: {
                        first_name: playbackProfile.first_name,
                        last_name: playbackProfile.last_name,
                        married_status: playbackProfile.married_status
                    },
                    spouse: {
                        first_name: playbackProfile.spouse_first_name,
                        last_name: playbackProfile.spouse_last_name
                    },
                    children: {
                        childrens: []
                    }
                };
                if (playbackProfile.childs.length > 0) {
                    angular.forEach(playbackProfile.childs, function (child) {
                        profileObject.children.childrens.push({
                            id: child.id,
                            age: child.age,
                            name: child.full_name
                        })
                    })
                }
            }
            $rootScope.familyMembers = [];
            $rootScope.childMembers = [];
            // client
            $rootScope.familyMembers.push({
                id: 'client',
                name: 'Me (Personal)',
                //description: profileObject.client.first_name + ' ' + profileObject.client.last_name
                description: 'Me (Personal)'
            });
            // Spouse
            if (profileObject.client.married_status == 1) {
                $rootScope.familyMembers.push({
                    id: 'spouse',
                    name: 'Spouse',
                    description: profileObject.spouse.first_name == null ? '(spouse)' : profileObject.spouse.first_name + ' ' + profileObject.spouse.last_name
                });
            }
            // Children
            var childList = [];
            if (profileObject.children.childrens.length > 0) {
                var k = 1;
                angular.forEach(profileObject.children.childrens, function (item) {

                    childList.push({
                        index: k,
                        id: 'child_' + item.id,
                        name: item.name == null ? 'Child' : item.name,
                        description: item.name == null ? 'Child' : item.name,
                        age: item.age
                    });
                    k++;
                });
            }
            // Check child name is duplicate
            if (childList.length > 0) {
                for (var i = 0; i < childList.length; i++) {
                    var count = 1;
                    for (var j = 0; j < childList.length; j++) {
                        if (childList[i].index != childList[j].index && childList[i].name == childList[j].name) {
                            count++;
                            childList[j].name += ' ' + count;
                            childList[j].description += ' ' + count;
                        }
                    }
                    if (count > 1) {
                        childList[i].name += ' 1';
                        childList[i].description += ' 1';
                    }
                }
                angular.forEach(childList, function (item) {
                    $rootScope.childMembers.push(item);
                    $rootScope.familyMembers.push(item);
                });
            }

            //// Dependent
            //if (profileObject.dependent.dependents.length > 0) {
            //    angular.forEach(profileObject.dependent.dependents, function (item) {
            //        $rootScope.familyMembers.push({
            //            id: 'dependent_' + item.id,
            //            name: item.name,
            //            description: item.name
            //        });
            //    });
            //}
            // Other
            //$rootScope.familyMembers.push({
            //    id: 'other',
            //    name: 'Other Member',
            //    description: 'Other Member'
            //});
            $rootScope.childMembers.push({
                id: 'other',
                name: 'Other Child',
                description: 'Other Child'
            });
        }

        this.initDataOfProfile = function () {
            var profileObject = {
                id: 0,
                user_id: '',
                client: {
                    first_name: '',
                    last_name: '',
                    email: '',
                    gender: null,
                    phone_code: "+65",
                    phone_number: '',
                    age: (cashFlow.parameter != null ? cashFlow.parameter._c_age_main : 0),
                    residency_status: 0,
                    nationality: 'SGP',
                    marital_status: 0,
                },
                spouse: {
                    first_name: '',
                    last_name: '',
                    gender: null,
                    age: null,
                    residency_status: 0,
                    nationality: 'SGP',
                    occupation: 1
                },
                children: {
                    number_of_child: 0,
                    childrens: [
                    ]
                },
                dependent: {
                    number_of_dependent: null,
                    dependents: [

                    ]
                }
            }
            return profileObject;
        }
        this.convertProfileDataFromServerData = function (profileData) {
            var profileObject = this.initDataOfProfile();
            $rootScope.ProfileName = {};
            profileObject.id = profileData.id;
            if (profileData.first_name == null) {
                profileObject.client.email = profileData.email;
            }
            $rootScope.ProfileName.main = profileData.first_name;
            if (profileData.first_name == null || profileData.first_name == '') {
                $rootScope.ProfileName.main = 'own';
            }
            profileObject.client.first_name = profileData.first_name;
            profileObject.client.last_name = profileData.last_name;
            profileObject.client.email = profileData.email;
            profileObject.client.gender = profileData.gender;
            profileObject.client.occupation = profileData.occupation;
            if (profileData.phone_code != null)
                profileObject.client.phone_code = profileData.phone_code;
            profileObject.client.phone_number = profileData.phone_number;

            if (profileData.residency_status != null)
                profileObject.client.residency_status = profileData.residency_status;
            if (profileData.nationality != null)
                profileObject.client.nationality = profileData.nationality;
            profileObject.client.married_status = profileData.married_status;
            profileObject.client.avatar = profileData.avatar;
            profileObject.client.spouse_avatar = profileData.spouse_avatar;
            profileObject.client.isChangedStartAge = profileData.isChangedStartAge;
            profileObject.client.viewed_tutorial = profileData.viewed_tutorial;
            if (profileData.isChangedStartAge)
                profileObject.client.age = profileData.age; 
            profileObject.client.isChanged = profileData.isChanged;
            if ($rootScope.isCanEditProfile == 'True') {
                profileObject.client.isChanged = false;
                profileData.isChangedStartAge = false;
                profileObject.client.isChangedStartAge = false;
            }
            profileObject.client.is_auto_register = profileData.is_auto_register;
            // Spouse info
            if (profileObject.client.married_status == 1) {
                $rootScope.ProfileName.spouse = profileData.spouse_first_name;
                if (profileData.spouse_first_name == null || profileData.spouse_first_name == '') {
                    $rootScope.ProfileName.spouse = 'spouse';
                }
                profileObject.spouse.first_name = profileData.spouse_first_name;
                profileObject.spouse.last_name = profileData.spouse_last_name;
                profileObject.spouse.gender = profileData.spouse_gender
                profileObject.spouse.age = profileData.spouse_age;
                profileObject.spouse.residency_status = profileData.spouse_residency_status;
                profileObject.spouse.nationality = profileData.spouse_nationality;
                profileObject.spouse.occupation = profileData.spouse_occupation;
                if (profileData.occupation == 1 || profileData.occupation == 2) {
                    //self.addSpouseRetirementIcon(profileData.spouse_age, profileData.age);
                }
            }
            // Dependence
            if (angular.isArray(profileData.dependent) && profileData.dependent.length > 0) {
                profileObject.children.number_of_child = null;
                profileObject.children.childrens = [];
                profileObject.dependent.number_of_dependent = 0;
                profileObject.dependent.dependents = [];
                var childList = [];
                angular.forEach(profileData.dependent, function (item) {
                    if (item.relationship == null || item.relationship == 0) { // Child
                        var child = {
                            id: item.id,
                            name: item.full_name,
                            gender: item.gender,
                            age: item.age,
                            handicapped: item.handicapped,
                            independent: item.independent,
                            avatar :  item.avatar
                        }
                        profileObject.children.number_of_child++;
                        var child_name = "child_" + profileObject.children.number_of_child;
                        //$rootScope.ProfileName[child_name] = child.name;
                        childList.push({
                            key: child_name,
                            value: child.name == null ? '(child ' + profileObject.children.number_of_child + ')' : child.name
                        })
                        profileObject.children.childrens[profileObject.children.childrens.length] = child;
                    } else { // Other dependent
                        var dependent = {
                            id: item.id,
                            name: item.full_name,
                            gender: item.gender,
                            age: item.age,
                            relationship: item.relationship,
                            handicapped: item.handicapped
                        }
                        profileObject.dependent.number_of_dependent++;
                        profileObject.dependent.dependents[profileObject.dependent.dependents.length] = dependent;
                    }
                });
                // Check child name is duplicate
                if (childList.length > 0) {
                    for (var i = 0; i < childList.length; i++) {
                        var count = 1;
                        for (var j = 0; j < childList.length; j++) {
                            if (childList[i].key != childList[j].key && childList[i].value == childList[j].value) {
                                count++;
                                childList[j].value += ' ' + count;
                            }
                        }
                        if (count > 1) {
                            childList[i].value += ' 1';
                        }
                    }
                    angular.forEach(childList, function (item) {
                        $rootScope.ProfileName[item.key] = item.value;
                    });
                }
            }
            return profileObject;
        }
        this.checkChildListisDefault = function (profileDialogData) {
            var isDefault = true;
            angular.forEach(profileDialogData.children.childrens, function (item) {
                if (item.name != null && item.name != undefined && item.name.trim().length > 0)
                    isDefault = false;
            });
            return isDefault;
        }
        this.InitShowMaritalStatus = function () {
            var self = this;
            $timeout(function () {                
                if ($rootScope.profileDialogData.client.married_status == 0) {
                    if ($rootScope.profileService.checkChildListisDefault($rootScope.profileDialogData)) {                        
                        $rootScope.profileDialogData.children.number_of_child = 0;
                        $rootScope.profileService.changeNumberOfChild();
                    }
                    
                }
                else if ($rootScope.profileDialogData.client.married_status == 1) {
                    if ($rootScope.profileDialogData.client.gender == 2) {
                        $rootScope.profileDialogData.spouse.gender = $rootScope.genderList[0].id;
                    } else {
                        $rootScope.profileDialogData.spouse.gender = $rootScope.genderList[1].id;
                    }



                    
                    $rootScope.profileDialogData.spouse.age = $rootScope.cashFlow.parameter._c_age_spouse;
                    $rootScope.profileDialogData.spouse.occupation = $rootScope.cashFlow.parameter._c_occupation_spouse;
                    $rootScope.profileDialogData.spouse.nationality = 'SGP';
                    $rootScope.profileDialogData.spouse.residency_status = 0;
                    if ($rootScope.profileService.checkChildListisDefault($rootScope.profileDialogData)) {
                        if ($rootScope.cashFlow.parameter._c_household_size > 2) {
                            $rootScope.profileDialogData.children.number_of_child = $rootScope.cashFlow.parameter._c_household_size - 2;
                        }
                        $rootScope.profileService.changeNumberOfChild();

                        self.changeAgeRange();

                        if ($rootScope.cashFlow.parameter._c_household_size == 3) {
                            $rootScope.profileDialogData.children.childrens[0].age = $rootScope.cashFlow.parameter._c_age_child_1;
                            $rootScope.profileDialogData.children.childrens[0].gender = $rootScope.cashFlow.parameter._c_gender_child_1;
                        }
                        else if ($rootScope.cashFlow.parameter._c_household_size == 4) {
                            $rootScope.profileDialogData.children.childrens[0].age = $rootScope.cashFlow.parameter._c_age_child_1;
                            $rootScope.profileDialogData.children.childrens[1].age = $rootScope.cashFlow.parameter._c_age_child_2;
                            $rootScope.profileDialogData.children.childrens[0].gender = $rootScope.cashFlow.parameter._c_gender_child_1;
                            $rootScope.profileDialogData.children.childrens[1].gender = $rootScope.cashFlow.parameter._c_gender_child_2;
                        }
                        else if ($rootScope.cashFlow.parameter._c_household_size == 5) {
                            $rootScope.profileDialogData.children.childrens[0].age = $rootScope.cashFlow.parameter._c_age_child_1;
                            $rootScope.profileDialogData.children.childrens[1].age = $rootScope.cashFlow.parameter._c_age_child_2;
                            $rootScope.profileDialogData.children.childrens[2].age = $rootScope.cashFlow.parameter._c_age_child_3;
                            $rootScope.profileDialogData.children.childrens[0].gender = $rootScope.cashFlow.parameter._c_gender_child_1;
                            $rootScope.profileDialogData.children.childrens[1].gender = $rootScope.cashFlow.parameter._c_gender_child_2;
                            $rootScope.profileDialogData.children.childrens[2].gender = $rootScope.cashFlow.parameter._c_gender_child_3;
                        }
                        else if ($rootScope.cashFlow.parameter._c_household_size == 6) {
                            $rootScope.profileDialogData.children.childrens[0].age = $rootScope.cashFlow.parameter._c_age_child_1;
                            $rootScope.profileDialogData.children.childrens[1].age = $rootScope.cashFlow.parameter._c_age_child_2;
                            $rootScope.profileDialogData.children.childrens[2].age = $rootScope.cashFlow.parameter._c_age_child_3;
                            $rootScope.profileDialogData.children.childrens[3].age = $rootScope.cashFlow.parameter._c_age_child_4;
                            $rootScope.profileDialogData.children.childrens[0].gender = $rootScope.cashFlow.parameter._c_gender_child_1;
                            $rootScope.profileDialogData.children.childrens[1].gender = $rootScope.cashFlow.parameter._c_gender_child_2;
                            $rootScope.profileDialogData.children.childrens[2].gender = $rootScope.cashFlow.parameter._c_gender_child_3;
                            $rootScope.profileDialogData.children.childrens[3].gender = $rootScope.cashFlow.parameter._c_gender_child_4;

                        }
                    }


                    utilService.scopeApply();
                }
            }, 500);
        },
        this.intervalRunManualInline = null;
        this.initProfile = function (user_id, callbackSuccess) {
            var profileObject = this.initDataOfProfile();
            var self = this;
            profileObject.user_id = user_id;
            $.ajax({
                method: 'GET', async: false, url: '/api/user_profile/get_profile/' + user_id,
                success: function (response) {
                    if (response != null) {
                        profileObject = self.convertProfileDataFromServerData(response);
                        profileObject.user_id = user_id;
                        $rootScope.profile = profileObject;
                        self.updateListFamilyMember(profileObject);
                    }
                }
            });
            $rootScope.profile = profileObject;
            /*
            if (angular.isDefined($rootScope.profile.client.viewed_tutorial) && $rootScope.profile.client.viewed_tutorial == false) {
                !function () { var e = document.createElement("script"), t = document.getElementsByTagName("script")[0]; e.async = 1, e.src = "https://inlinemanual.com/embed/player.bf37df9c5d36a88fe3a5ae9cf1467311.js", e.charset = "UTF-8", t.parentNode.insertBefore(e, t) }();
                
                $interval.cancel(self.intervalRunManualInline);
                self.intervalRunManualInline = $interval(function () {
                    try {
                        inline_manual_player.activateTopic(inlineManualTopicId);
                        $rootScope.backupPersonaPlan = angular.copy($rootScope.PersonaPlan);
                        $rootScope.isShowManual = true;
                        inline_manual_player.setCallbacks({
                            onTopicEnd: function (player, topic_id) {
                                if (topic_id == inlineManualTopicId) {
                                    var obj = {
                                        user_id: profileObject.user_id
                                    };
                                    utilService.callApiByAjax('POST', '/api/user_profile/update_tutorial_profile/', obj, function (pl) {
                                        $rootScope.profile.client.viewed_tutorial = true;
                                    });
                                    $rootScope.isShowManual = false;
                                    $rootScope.PersonaPlan = angular.copy($rootScope.backupPersonaPlan);
                                    $rootScope.utilService.scopeApply();
                                }
                            }
                        });
                        $interval.cancel(self.intervalRunManualInline);
                    } catch (ex) {
                        //console.log(ex);
                    }
                }, 1000);
               
            }
            */
            /*
            // Load inline manual
            window.inlineManualTracking = {
                uid: null,
                email: null,
                username: null,
                name: null,
                created: null,
                last: null
            }
            window.inlineManualTracking.uid = user_id;
            window.inlineManualTracking.email = rootScope.profile.client.email;
            window.inlineManualTracking.username = rootScope.profile.client.email;
            window.inlineManualTracking.name = rootScope.profile.client.first_name == null ? '' : rootScope.profile.client.first_name + ' ' + rootScope.profile.client.last_name;
            !function () { var e = document.createElement("script"), t = document.getElementsByTagName("script")[0]; e.async = 1, e.src = "https://inlinemanual.com/embed/player.bf37df9c5d36a88fe3a5ae9cf1467311.js", e.charset = "UTF-8", t.parentNode.insertBefore(e, t) }();
            $interval.cancel(self.intervalRunManualInline);
            self.intervalRunManualInline = $interval(function () {
                try {
                    $rootScope.backupPersonaPlan = angular.copy($rootScope.PersonaPlan);
                    inline_manual_player.setCallbacks({
                        onTopicStart: function (player, topic_id) {
                            $rootScope.isShowManual = true;
                        },
                        onTopicEnd: function (player, topic_id) {
                            $rootScope.isShowManual = false;
                            $rootScope.PersonaPlan = angular.copy($rootScope.backupPersonaPlan);
                            $rootScope.PersonaPlan.return_cashFlow = true;
                            $rootScope.utilService.scopeApply();
                            $rootScope.actionService.calculateData();
                        }
                    });
                    $interval.cancel(self.intervalRunManualInline);
                } catch (ex) {
                    //console.log(ex);
                }
            }, 1000);
            */
            if (angular.isDefined(callbackSuccess)) callbackSuccess();
        }

        this.updateFamilyMemberOfEducationDreamAfterChangeProfile = function () {
            var dependentReferenceList = [];
            dependentReferenceList.push('client');
            dependentReferenceList.push('other');
            if ($rootScope.profile.client.married_status == 1) {
                dependentReferenceList.push('spouse');
            }
            // Children
            if ($rootScope.profile.children.childrens.length > 0) {
                angular.forEach($rootScope.profile.children.childrens, function (item) {
                    dependentReferenceList.push('child_' + item.id);
                });
            }
            // Dependent
            if ($rootScope.profile.dependent.dependents.length > 0) {
                angular.forEach($rootScope.profile.dependent.dependents, function (item) {
                    dependentReferenceList.push('dependent_' + item.id);
                });
            }
            if ($rootScope.PersonaPlan.dreams.length > 0) {
                var educationChangeFamilyMember = [];
                angular.forEach($rootScope.PersonaPlan.dreams, function (dream) {
                    if (dream.dream_type_id == 2) {
                        var tmp = dependentReferenceList.indexOf(dream.dependent_reference);
                        if (dependentReferenceList.indexOf(dream.dependent_reference) == -1) {
                            educationChangeFamilyMember.push(dream.name);
                            dream.dependent_reference = 'client';
                        }
                    }
                });
                if (educationChangeFamilyMember.length > 0) {
                    var educationName = educationChangeFamilyMember.join(', ');
                    utilService.showInfoMessage(
                        utilService.translate('Education of family member has been changed',
                        {
                            educationName: educationName
                        }
                    ));
                }
            }
        }
        this.updateChildMemberOfIndependentChildAfterChangeProfile = function () {
            var dependentReferenceList = [];

            dependentReferenceList.push('other');
            // Children
            if ($rootScope.profile.children.childrens.length > 0) {
                angular.forEach($rootScope.profile.children.childrens, function (item) {
                    dependentReferenceList.push('child_' + item.id);
                });
            }
            if ($rootScope.PersonaPlan.lifeEvent.length > 0) {
                var childIndependentChangeChildMember = [];
                angular.forEach($rootScope.PersonaPlan.lifeEvent, function (dream) {
                    if (dream.dream_type_id == 5) {
                        var tmp = dependentReferenceList.indexOf(dream.dependent_reference);
                        if (dependentReferenceList.indexOf(dream.dependent_reference) == -1) {
                            childIndependentChangeChildMember.push(dream.name);
                            dream.dependent_reference = 'other';
                        }
                    }
                });
                if (childIndependentChangeChildMember.length > 0) {
                    var childIndependentName = childIndependentChangeChildMember.join(', ');
                    utilService.showInfoMessage(
                        utilService.translate('Independent child has been changed',
                        {
                            childName: childIndependentName
                        }
                    ));
                }
            }
        },
        this.UpdateStartAge = function (start_age) {
            $rootScope.profile.client.age = $rootScope.PersonaPlan.start_age;
            utilService.callApi('POST', '/api/user_profile/update_start_age', '', { user_id: $rootScope.PersonaPlan.user_id, start_age: start_age }, function (response) {
                if ($rootScope.isCanEditProfile == 'True') {
                    $rootScope.profile.client.isChangedStartAge = false;
                } else {
                    $rootScope.profile.client.isChangedStartAge = response;
                }
            });
        }
        this.changePhoneCode = function (obj) {
            $rootScope.profileDialogData.client.phone_number = '';
            this.form_profile.mobile_phone_number.$setDirty(true);
        }

        this.updateChildAvatarTooltip = function (id) {
            $timeout(function () {
                var obj = $('#child_span_' + id);
                obj.tooltip();
            }, 2000);
        }

        this.cancelUpdateProfile = function () {
            // $rootScope.isReadyShowProfile = false;
        }
        return this;
    }
);