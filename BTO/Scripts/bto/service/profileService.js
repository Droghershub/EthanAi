btoApp.factory('profileService', [ '$rootScope', '$http', '$timeout', '$q', 'ultilService', 'timelineService',
    function ($rootScope, $http, $timeout, $q, ultilService, timelineService) {
        return {
            showProfileDialog: function () {
                $rootScope.spinner.active = false;
                $rootScope.profileDialogData = angular.copy($rootScope.profile);
                $rootScope.profileDialogData.client.age = angular.copy($rootScope.PersonaPlan.start_age);
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
                if ($rootScope.profileDialogData.client.first_name.length < 2 && $rootScope.DefaultParameters.length > 0) {
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
                if ($rootScope.profileDialogData.spouse.age == null || $rootScope.profileDialogData.spouse.age <= 0) {
                    $rootScope.profileDialogData.spouse.age = $rootScope.profileDialogData.client.age;
                }
                var genderDefault = parseInt(this.getParameterDefaultForProfile('gender'));                
                //if (angular.isDefined($rootScope.profileDialogData.client.first_name) && $rootScope.profileDialogData.children.number_of_child == 0) {
                if ($rootScope.profileDialogData.children.number_of_child== null ||  $rootScope.profileDialogData.children.number_of_child == 0) {
                    
                    $rootScope.profileDialogData.children.number_of_child = childIndependent.length;
                    
                    
                    angular.forEach(childIndependent, function (child) {
                        $rootScope.profileDialogData.children.childrens[$rootScope.profileDialogData.children.childrens.length] = {
                            name: '',
                            gender: genderDefault,
                            age: 25 - (child.starting_age - $rootScope.PersonaPlan.start_age),
                            handicapped: false,
                            independent: false
                        }
                    });
                    
                }
                //if (angular.isDefined($rootScope.profileDialogData.client.first_name) && $rootScope.profileDialogData.dependent.number_of_dependent == 0) 
                if ($rootScope.profileDialogData.dependent.number_of_dependent == null ||$rootScope.profileDialogData.dependent.number_of_dependent == 0) {
                    var relationShipDefault = parseInt(this.getParameterDefaultForProfile('relationship'));
                    $rootScope.profileDialogData.dependent.number_of_dependent = otherIndependent.length;
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
                $timeout(function () {
                    $('#ProfileDialog').modal({ backdrop: 'static', keyboard: false });
                    // auto focus
                    $timeout(function () {
                        var focusEle = angular.element(document.querySelector('#dialog_profile_client_first_name'));
                        focusEle.focus();
                        
                    }, 500);
                }, 1000);
            },
            getParameterDefaultForProfile: function (name) {                
                for (var i = 0; i < $rootScope.DefaultParameters.length; i++) {
                    var val = $rootScope.DefaultParameters[i];
                    var paramName = val.name.substring('user_profile.'.length, val.name.length);
                    if (name == paramName) {
                        return angular.copy(val.default_value);
                    }
                }
                return '';
            },
            addSpouseRetirementIcon: function (spouseAge, clientAge) {
                var spouseYear = (60 - spouseAge) + clientAge;
                timelineService.removeSpouseRetirementIcon();
                timelineService.addSpouseRetirementIcon(spouseYear);
            },

            removeSpouseRetirementIcon: function () {
                timelineService.removeSpouseRetirementIcon();
            },

            changeNumberOfChild : function(){
                
                


                if ($rootScope.profileDialogData.children.number_of_child > $rootScope.profileDialogData.children.childrens.length) {
                    var defaultAge = null;
                    var genderDefault = parseInt(this.getParameterDefaultForProfile('gender'));
                    for (var i = $rootScope.profileDialogData.children.childrens.length; i < $rootScope.profileDialogData.children.number_of_child; i++) {
                        $rootScope.profileDialogData.children.childrens[$rootScope.profileDialogData.children.childrens.length] = {
                            name: '',
                            gender: genderDefault,
                            age: defaultAge,
                            handicapped: false,
                            independent: false
                        }
                    }
                } else if ($rootScope.profileDialogData.children.number_of_child < $rootScope.profileDialogData.children.childrens.length) {
                    for (var i = $rootScope.profileDialogData.children.childrens.length; i > $rootScope.profileDialogData.children.number_of_child; i--) {
                        $rootScope.profileDialogData.children.childrens.pop();
                    }
                }
            },

            changeNumberOfDependent: function () {
                var genderDefault = parseInt(this.getParameterDefaultForProfile('gender'));
                var relationShipDefault = parseInt(this.getParameterDefaultForProfile('relationship'));
                if ($rootScope.profileDialogData.dependent.number_of_dependent > $rootScope.profileDialogData.dependent.dependents.length) {
                    for (var i = $rootScope.profileDialogData.dependent.dependents.length; i < $rootScope.profileDialogData.dependent.number_of_dependent; i++) {
                        $rootScope.profileDialogData.dependent.dependents[$rootScope.profileDialogData.dependent.dependents.length] = {
                            name: '',
                            gender: genderDefault,
                            age: null,
                            relationship: relationShipDefault,
                            handicapped: false
                        }
                    }
                } else if ($rootScope.profileDialogData.dependent.number_of_dependent < $rootScope.profileDialogData.dependent.dependents.length) {
                    for (var i = $rootScope.profileDialogData.dependent.dependents.length; i > $rootScope.profileDialogData.dependent.number_of_dependent; i--) {
                        $rootScope.profileDialogData.dependent.dependents.pop();
                    }
                }
            },

            loadCountry: function () {
                if ($rootScope.countries == null) {
                    $http({ method: 'GET', url: 'Scripts/bto/data/country.js' }).success(function (data) {
                        $rootScope.countries = data;
                    });
                }
            },

            saveProfile: function () {

                
                var profileDialogData = $rootScope.profileDialogData;
                // Send data to Server :)
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
                    occupation: profileDialogData.spouse.occupation,
                    spouse_age: profileDialogData.spouse.age,
                    spouse_gender: profileDialogData.spouse.gender,
                    spouse_first_name: profileDialogData.spouse.first_name,
                    spouse_last_name: profileDialogData.spouse.last_name,
                    spouse_nationality: profileDialogData.spouse.nationality,
                    spouse_residency_status: profileDialogData.spouse.residency_status,
                    dependent: [],
                    typeplan: "current"
                }
                
                if (profileDialogData.children.number_of_child > 0) {
                    angular.forEach(profileDialogData.children.childrens, function (child) {
                        var item = {
                            full_name : child.name,
                            gender: child.gender,
                            age: child.age,
                            handicapped: child.handicapped,
                            independent: child.independent,
                            relationship: null
                        }
                        profileData.dependent[profileData.dependent.length] = item;
                    });
                }
                if (profileDialogData.dependent.number_of_dependent > 0) {
                    angular.forEach(profileDialogData.dependent.dependents, function (dependent) {
                        var item = {
                            full_name: dependent.name,
                            gender: dependent.gender,
                            age: dependent.age,
                            handicapped: dependent.handicapped,
                            independent: null,
                            relationship: dependent.relationship
                        }
                        profileData.dependent[profileData.dependent.length] = item;
                    });
                }
                var self = this;
                var profileUrl = '';
                if ($rootScope.PersonaPlan.status == 0) { // Current
                    profileData.typeplan = 'current';
                } else if ($rootScope.PersonaPlan.status == 1) { // New
                    profileData.typeplan = 'new';
                }
                $rootScope.spinner.active = true;
                $http({
                    method: 'POST',
                    url: '/api/user_profile/update_profile',
                    data:  profileData 
                }).then(function (response) {
                    $rootScope.spinner.active = false;
                    $('#ProfileDialog').modal('hide');
                    if (response.data.success == true) {
                        ultilService.showSuccessMessage('Profile was updated successful');
                        
                        // check email was change
                        if ($rootScope.profile.client.email != $rootScope.profileDialogData.client.email) {
                            ultilService.showWarningMessage('Email was changed, system will automatically logout');
                            $timeout(function () {
                                document.getElementById('logoutForm').submit();
                            }, 5000);
                        } else {
                            if (profileData.married_status == 1) {
                                if (profileData.occupation == 1 || profileData.occupation == 2) {
                                    self.addSpouseRetirementIcon(profileData.spouse_age, profileData.age);
                                } else {
                                    self.removeSpouseRetirementIcon();
                                }
                            } else if (profileData.married_status == 0) {
                                self.removeSpouseRetirementIcon();
                            }
                            // check child or independence
                            var childIndependent = [];
                            if ($rootScope.PersonaPlan.lifeEvent.length > 0) {
                                angular.forEach($rootScope.PersonaPlan.lifeEvent, function (value, i) {
                                    if (value.dream_type_id == 5) {
                                        childIndependent[childIndependent.length] = value;
                                    };
                                });
                            }
                            $rootScope.profile = angular.copy($rootScope.profileDialogData);
                            if (childIndependent.length == 0) {
                                ultilService.loadData($rootScope);
                                if (profileData.typeplan == 'new') {
                                    $rootScope.PersonaPlan = angular.copy($rootScope.newPlan);
                                    $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                                    $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                                } else if (profileData.typeplan == 'current') {
                                    $rootScope.PersonaPlan = angular.copy($rootScope.currentPlan);
                                    $rootScope.salaryEvolutionAndInflaction.salaryEvolution = $rootScope.PersonaPlan.salary_evolution * 100;
                                    $rootScope.salaryEvolutionAndInflaction.inflaction = $rootScope.PersonaPlan.inflation * 100;
                                }
                                $rootScope.refreshTimelineAfterUpdateProfile();
                            }                           
                        }
                        
                    } else {
                        ultilService.showErrorMessage(response.data.errcode);                        
                    }
                });
               
            },
           
            initProfile: function () {
                
                var profileObject = {
                    id: 0,
                    user_id: '',
                    client: {
                        first_name: '',
                        last_name: '',
                        email: '',
                        gender: null,
                        phone_code: '',
                        phone_number: '',
                        age: 0,
                        residency_status: null,
                        nationality: '', 
                        marital_status: null,
                    },
                    spouse: {
                        first_name: '',
                        last_name: '',
                        gender: null,
                        age: null,
                        residency_status: '',
                        nationality: '',
                        occupation: ''
                    },
                    children: {
                        number_of_child: 0,
                        childrens: [
                        ]
                    },
                    dependent: {
                        number_of_dependent: 0,
                        dependents: [
                            
                        ]
                    }
                }
                var self = this;
                var userID = document.getElementById('userKeyId').getAttribute('value');
                profileObject.user_id = userID;
                $.ajax({
                    method: 'GET', async: false, url: '/api/user_profile/get_profile/' + userID,
                    success: function (response) {

                        //return;
                        if (response != null) {
                            var profileData = response;
                            profileObject.id = profileData.id;
                            // Client info
                            if (profileData.first_name == null) {
                                profileObject.client.email = profileData.email;
                                return;
                            }
                            profileObject.client.first_name = profileData.first_name;
                            profileObject.client.last_name = profileData.last_name;
                            profileObject.client.email = profileData.email;
                            profileObject.client.gender = profileData.gender;
                            profileObject.client.phone_code = profileData.phone_code;
                            profileObject.client.phone_number = profileData.phone_number;
                            profileObject.client.age = profileData.age;
                            profileObject.client.residency_status = profileData.residency_status;
                            profileObject.client.nationality = profileData.nationality;
                            profileObject.client.married_status = profileData.married_status;                           
                            // Spouse info
                            if (profileObject.client.married_status == 1) {
                                profileObject.spouse.first_name = profileData.spouse_first_name;
                                profileObject.spouse.last_name = profileData.spouse_last_name;
                                profileObject.spouse.gender = profileData.spouse_gender
                                profileObject.spouse.age = profileData.spouse_age;
                                profileObject.spouse.residency_status = profileData.spouse_residency_status;
                                profileObject.spouse.nationality = profileData.spouse_nationality;
                                profileObject.spouse.occupation = profileData.occupation;
                                if (profileData.occupation == 1 || profileData.occupation == 2) {
                                    //self.addSpouseRetirementIcon(profileData.spouse_age, profileData.age);
                                }
                            }
                            // Dependence
                            if (angular.isArray(profileData.dependent) && profileData.dependent.length > 0) {
                                profileObject.children.number_of_child = 0;
                                profileObject.children.childrens = [];
                                profileObject.dependent.number_of_dependent = 0;
                                profileObject.dependent.dependents = [];
                                angular.forEach(profileData.dependent, function (item) {
                                    if (item.relationship == null || item.relationship == 0) { // Child
                                        var child = {
                                            name: item.full_name,
                                            gender: item.gender,
                                            age: item.age,
                                            handicapped: item.handicapped,
                                            independent: item.independent
                                        }
                                        profileObject.children.number_of_child++;
                                        profileObject.children.childrens[profileObject.children.childrens.length] = child;
                                    } else { // Other dependent
                                        var dependent = {
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
                            }
                        }
                    }
                });
                $rootScope.profile = profileObject;
            }
        }
    }
]);