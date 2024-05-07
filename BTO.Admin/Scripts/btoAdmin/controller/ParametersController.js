btoApp.controller('ParametersController', ['$scope', 'parameterService', '$rootScope', '$timeout', 'ultilService', '$http',
    function ($scope, parameterService, $rootScope, $timeout, ultilService, $http) {
        $rootScope.scope = $scope;
        $scope.name = 'ParametersController';
        $scope.listProductVersion = null;// parameterService.getListProductVersion();
        $scope.selectedEnvironment = null;
        $scope.listEnvironment = [];
        $scope.listVersion = [];
        $scope.listParameter = [];
        $scope.selectedParameter = null;
        $scope.backupSelectedParameter = null;
        $scope.environmentVersion = null;
        $scope.errorCloneProductVersion = null;
        $scope.variableMultiply1000 = {
            "rule_contingency_household_start": 1,
            "rule_trading_household_start": 1,
            "rule_bank_household_start": 1,
            "rule_cpf_start": 1,
            "rule_cpf_main_start": 1,
            "rule_cpf_spouse_start": 1,
            "rule_cpf_oa_spouse_start": 1,
            "rule_cpf_oa_is_spouse_start": 1,
            "rule_cpf_ms_spouse_start": 1,
            "rule_cpf_sa_spouse_start": 1,
            "rule_cpf_ra_spouse_start": 1,
            "rule_cpf_oa_main_start": 1,
            "rule_cpf_oa_is_main_start": 1,
            "rule_cpf_ms_main_start": 1,
            "rule_cpf_sa_main_start": 1,
            "rule_cpf_ra_main_start": 1,
            "rule_salary_main": 1,
            "rule_salary_spouse": 1,
            "rule_food_beverage": 1,
            "rule_alcohol_tobacco": 1,
            "rule_clothes_footwear": 1,
            "rule_housing_utilities": 1,
            "rule_furniture_equipment": 1,
            "rule_health": 1,
            "rule_transport": 1,
            "rule_communication": 1,
            "rule_entertainment": 1,
            "rule_education": 1,
            "rule_dinning": 1,
            "rule_holidays": 1,
            "rule_miscellaneous": 1,
            "rule_non_assignable": 1,
            "rule_non_assignable_main": 1,
            "rule_non_assignable_spouse": 1,
            "rule_non_assignable_child_1": 1,
            "rule_non_assignable_child_2": 1,
            "rule_non_assignable_child_3": 1,
            "rule_non_assignable_child_4": 1,
            "rule_miscellaneous_main": 1,
            "rule_miscellaneous_spouse": 1,
            "rule_miscellaneous_child_1": 1,
            "rule_miscellaneous_child_2": 1,
            "rule_miscellaneous_child_3": 1,
            "rule_miscellaneous_child_4": 1,
            "rule_holidays_main": 1,
            "rule_holidays_spouse": 1,
            "rule_holidays_child_1": 1,
            "rule_holidays_child_2": 1,
            "rule_holidays_child_3": 1,
            "rule_holidays_child_4": 1,
            "rule_dinning_main": 1,
            "rule_dinning_spouse": 1,
            "rule_dinning_child_1": 1,
            "rule_dinning_child_2": 1,
            "rule_dinning_child_3": 1,
            "rule_dinning_child_4": 1,
            "rule_education_main": 1,
            "rule_education_spouse": 1,
            "rule_education_child_1": 1,
            "rule_education_child_2": 1,
            "rule_education_child_3": 1,
            "rule_education_child_4": 1,
            "rule_entertainment_main": 1,
            "rule_entertainment_spouse": 1,
            "rule_entertainment_child_1": 1,
            "rule_entertainment_child_2": 1,
            "rule_entertainment_child_3": 1,
            "rule_entertainment_child_4": 1,
            "rule_communication_main": 1,
            "rule_communication_spouse": 1,
            "rule_communication_child_1": 1,
            "rule_communication_child_2": 1,
            "rule_communication_child_3": 1,
            "rule_communication_child_4": 1,
            "rule_transport_main": 1,
            "rule_transport_spouse": 1,
            "rule_transport_child_1": 1,
            "rule_transport_child_2": 1,
            "rule_transport_child_3": 1,
            "rule_transport_child_4": 1,
            "rule_health_main": 1,
            "rule_health_spouse": 1,
            "rule_health_child_1": 1,
            "rule_health_child_2": 1,
            "rule_health_child_3": 1,
            "rule_health_child_4": 1,
            "rule_furniture_equipment_main": 1,
            "rule_furniture_equipment_spouse": 1,
            "rule_furniture_equipment_child_1": 1,
            "rule_furniture_equipment_child_2": 1,
            "rule_furniture_equipment_child_3": 1,
            "rule_furniture_equipment_child_4": 1,
            "rule_housing_utilities_main": 1,
            "rule_housing_utilities_spouse": 1,
            "rule_housing_utilities_child_1": 1,
            "rule_housing_utilities_child_2": 1,
            "rule_housing_utilities_child_3": 1,
            "rule_housing_utilities_child_4": 1,
            "rule_clothes_footwear_main": 1,
            "rule_clothes_footwear_spouse": 1,
            "rule_clothes_footwear_child_1": 1,
            "rule_clothes_footwear_child_2": 1,
            "rule_clothes_footwear_child_3": 1,
            "rule_clothes_footwear_child_4": 1,
            "rule_alcohol_tobacco_main": 1,
            "rule_alcohol_tobacco_spouse": 1,
            "rule_alcohol_tobacco_child_1": 1,
            "rule_alcohol_tobacco_child_2": 1,
            "rule_alcohol_tobacco_child_3": 1,
            "rule_alcohol_tobacco_child_4": 1,
            "rule_food_beverage_main": 1,
            "rule_food_beverage_spouse": 1,
            "rule_food_beverage_child_1": 1,
            "rule_food_beverage_child_2": 1,
            "rule_food_beverage_child_3": 1,
            "rule_food_beverage_child_4": 1,
            "rule_cpf_total_contribution": 1,
            "rule_cpf_main": 1,
            "rule_cpf_spouse": 1,
            "rule_cpf_oa_spouse": 1,
            "rule_cpf_ms_spouse": 1,
            "rule_cpf_sa_spouse": 1,
            "rule_cpf_ra_spouse": 1,
            "rule_cpf_oa_main": 1,
            "rule_cpf_ms_main": 1,
            "rule_cpf_sa_main": 1,
            "rule_cpf_ra_main": 1,
            "rule__c_median_salary": 1,
            "rule_cpf_extra_limit": 1,
            "rule_cpf_oa_extra_limit": 1,
            "rule_cpf_oa_is_limit": 1,
            "rule_cpf_ra_extra": 1,
            "rule_cpf_ra_extra_limit": 1,
            "rule_cpf_ra_payout_main": 1,
            "rule_cpf_ra_payout_spouse": 1,
            "rule_mortgage_servicing": 1,
            "rule_srs_main_start": 1,
            "rule_srs_spouse_start": 1,
            "rule_value_limit": 1,
            "rule_withdrawal_limit": 1,
        }
        

        $scope.listType = parameterService.getTypeList();
        $scope.getListProductVersion = function (id) {
            parameterService.getListProductVersion().then(function (obj) {
                if (obj != null) {
                    $scope.listProductVersion = obj.data;
                    angular.forEach($scope.listProductVersion, function (item) {
                        if ($scope.listEnvironment.indexOf(item.name) < 0) {
                            $scope.listEnvironment.push(item.name);
                        }
                        if (id == undefined) {
                            if (item.is_default) {
                                $scope.selectedEnvironment = angular.copy(item);
                                parameterService.getParameters($scope.selectedEnvironment.id).then(function (obj) {
                                    if (obj != null) {
                                        $scope.listParameter = obj.data;
                                    }
                                });
                            }
                        }
                        if ($scope.listVersion.indexOf(item.version) < 0) {
                            if ($scope.selectedEnvironment != null && $scope.selectedEnvironment.name != null && $scope.selectedEnvironment.name == item.name) {
                                $scope.listVersion.push(item.version);
                            }
                        }
                    });
                    if (id != undefined && id != null) {
                        parameterService.getParameters(id).then(function (obj) {
                            if (obj != null) {
                                $scope.listParameter = obj.data;
                            }
                        });
                    }
                }
            });
        }
        $scope.getListProductVersion();
        $scope.getParameters = function () {
            parameterService.getParameters($scope.selectedEnvironment.id).then(function (obj) {
                if (obj != null) {
                    $scope.listParameter = obj.data
                    $scope.selectedParameter = null;
                }
            });
        }
        $scope.onChangeEnvironment = function () {
            if ($scope.selectedParameter != null && angular.isDefined($scope.selectedParameter.showType) && $scope.selectedParameter.showType == 2) {
                $timeout(function () {
                    //  ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Current editing parameter is not saved yet. Do you want to leave the form?"), $scope.cancelCallbackParameter, null, null, null, null);
                    ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Current editing parameter is not saved yet. Do you want to leave the form?"), $scope.cancelCallbackParameter, null, null, null, null);
                }, 100);
                return;
            }
            $scope.listVersion = [];
            angular.forEach($scope.listProductVersion, function (item) {
                if ($scope.listVersion.indexOf(item.version) < 0) {
                    if ($scope.selectedEnvironment.name == item.name) {
                        $scope.listVersion.push(item.version);
                    }
                }
            });
            $scope.selectedEnvironment.version = $scope.listVersion[0];
            if ($scope.selectedEnvironment.version != '') {
                angular.forEach($scope.listProductVersion, function (item) {
                    if (item.name == $scope.selectedEnvironment.name && item.version == $scope.selectedEnvironment.version) {
                        $scope.selectedEnvironment = angular.copy(item);
                    }
                })
                $scope.getParameters();
            }
            $scope.selectedParameter = null;
        }

        $scope.onChangeVersion = function () {
            if ($scope.selectedParameter != null && angular.isDefined($scope.selectedParameter.showType) && $scope.selectedParameter.showType == 2) {
                $timeout(function () {
                    ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Current editing parameter is not saved yet. Do you want to leave the form?"), $scope.cancelCallbackParameter, null, null, null, null);
                }, 100);
                return;
            }
            if ($scope.selectedEnvironment.version != '') {
                angular.forEach($scope.listProductVersion, function (item) {
                    if (item.name == $scope.selectedEnvironment.name && item.version == $scope.selectedEnvironment.version) {
                        $scope.selectedEnvironment = angular.copy(item);
                    }
                })
                $scope.getParameters();
            }
        }
        $scope.selectedParamItem = null;
        $scope.cancelCallbackParameter = function () {
            $timeout(function () {
                $scope.selectedParameter.showType = 1;
                $scope.onSelectParameter($scope.selectedParamItem);
            }, 100);

        }
        $scope.onSelectParameter = function (param) {
            if ($scope.selectedParameter != null && angular.isDefined($scope.selectedParameter.showType) && $scope.selectedParameter.showType == 2) {
                $scope.selectedParamItem = param;
                $timeout(function () {
                    ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Current editing parameter is not saved yet. Do you want to leave the form?"), $scope.cancelCallbackParameter, null, null, null, null);
                }, 100);
                return;
            }
            $scope.selectedParameter = angular.copy(param);
            $scope.selectedParamItem = angular.copy(param);
            if (angular.isDefined(param.default_value) && param.default_value != null) {
                if ($scope.selectedParameter.type == 0) $scope.selectedParameter.default_value = parseFloat(param.default_value);
            }
            if (param.type == 1) {
                parameterService.get_detail_parameter(param.id).then(function (obj) {
                    if (obj != null) {
                        $scope.selectedParameter.listItems = obj.data[0].listItems;
                    }
                    $scope.backupSelectedParameter = angular.copy($scope.selectedParameter);
                });
            }
            if ($scope.selectedParameter.editable != true) {
                ultilService.showWarningMessage(ultilService.translate("Cannot edit this parameter!"));
            }
            $scope.selectedParameter.showType = 1; // Show detail
            if ($scope.selectedParameter.type == 2) {
                parameterService.get_detail_parameter($scope.selectedParameter.id).then(function (obj) {
                    if (obj != null) {
                        $scope.selectedParameter.nodes = [];
                        if (angular.isArray(obj.data) && obj.data.length > 0) {
                            var rootData = obj.data.shift();
                            $scope.selectedParameter.nodes.push(rootData);
                            $scope.selectedParameter.nodes[0].nodes = [];
                            $scope.selectedParameter.nodes[0].level = 0;

                            for (var i in obj.data) {
                                if (obj.data[i].type == 0) {
                                    obj.data[i].is_leaf = true;
                                } else {
                                    obj.data[i].is_leaf = false;
                                }
                                obj.data[i].nodes = [];
                            }

                            $scope.selectedParameter.nodes[0].nodes = $scope.getNestedChildren(obj.data, $scope.selectedParameter.id);

                        }
                    }
                    $timeout(function () {
                        $scope.inValidateTree = false;
                        $scope.updateNodeOnTreeBeforeSaveOnServer($scope.selectedParameter, $scope.selectedParameter.nodes);
                    }, 300)
                    $scope.resetValidateForm();
                    $scope.backupSelectedParameter = angular.copy($scope.selectedParameter);
                });

            }
            $timeout(function () {
                $scope.backupSelectedParameter = angular.copy($scope.selectedParameter);
                $scope.resetValidateForm();
            }, 500)
        }
        $scope.resetValidateForm = function () {
            $scope.parameter_form.$setPristine();
            $scope.paramModalForm.$setPristine();
            $scope.nodeModalForm.$setPristine();
        }
        $scope.getNestedChildren = function (data, id) {
            var out = []
            for (var i in data) {
                if (data[i].parent_id == id) {

                    var nodes = $scope.getNestedChildren(data, data[i].id)
                    if (nodes.length) {
                        data[i].nodes = nodes
                    }
                    out.push(data[i])
                }
            }
            return out
        }

        $scope.typeToName = function (typeId) {
            if (typeId == 0) {
                return 'numeric';
            } else if (typeId == 1) {
                return 'list';
            } else if (typeId == 2) {
                return 'tree';
            }
        }

        $scope.addNewVauleOfListParameter = function () {
            var newValue = {
                name: '',
                value: ''
            }
            if (!angular.isArray($scope.selectedParameter.listItems)) {
                $scope.selectedParameter.listItems = [];
            }

            if ($scope.selectedParameter.listItems.length == 0) {
                $scope.selectedParameter.default_value = null;
            }

            $scope.selectedParameter.listItems.push(newValue);
        }


        $scope.removeItemListParameter = function (item) {
            if ($scope.selectedParameter.default_value == item.value) {
                $scope.selectedParameter.default_value = null;
            }
            var index = -1;
            for (var i = 0; i < $scope.selectedParameter.listItems.length; i++) {
                if (item.name == $scope.selectedParameter.listItems[i].name) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                $scope.selectedParameter.listItems.splice(index, 1);
            }
        }
        $scope.cancelCallbackOpenAddParameter = function () {
            $timeout(function () {
                $scope.selectedParameter.showType = 1;
                $scope.addNewParameter();
            }, 100);
        }
        $scope.addNewParameter = function () {
            if ($scope.selectedParameter != null && angular.isDefined($scope.selectedParameter.showType) && $scope.selectedParameter.showType == 2) {
                //$scope.selectedParamItem = $scope.selectedParamItem;
                $timeout(function () {
                    ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Current editing parameter is not saved yet. Do you want to leave the form?"), $scope.cancelCallbackOpenAddParameter, null, null, null, null);
                }, 100);
                return;
            }
            $scope.selectedParameter = parameterService.initParameter($scope.selectedEnvironment);
            $timeout(function () {
                $('#parameterModal').modal({ backdrop: 'static', keyboard: false });
                $scope.resetValidateForm();
            }, 400);

        }
        $scope.saveNewParameter = function () {
            if ($scope.selectedParameter.type == 0) {
                $rootScope.spinner.on();
                parameterService.saveParam($scope.selectedParameter).then(function (obj) {
                    if (obj != null) {
                        $rootScope.spinner.off();
                        if (obj.data == 'duplicate name') {
                            ultilService.showErrorMessage(ultilService.translate('Failed to add parameter. Parameter name has a duplicate'));
                        } else {
                            ultilService.showSuccessMessage(ultilService.translate('Parameter was added successful!'));
                            $scope.selectedParameter.showType = 1;
                            $scope.selectedParameter.id = obj.data.id;
                            $scope.selectedParameter.deleteable = obj.data.deleteable;
                            $scope.listParameter.push($scope.selectedParameter);
                            $scope.backupSelectedParameter = angular.copy($scope.selectedParameter);
                            $timeout(function () {
                                $('#parameterModal').modal('hide');
                            }, 200);
                        }
                    }
                });
            } else if ($scope.selectedParameter.type == 1) {
                ultilService.showSuccessMessage(ultilService.translate('Please add list value into list parameter'));
                $timeout(function () {
                    $('#parameterModal').modal('hide');
                }, 200);
                $scope.selectedParameter.showType = 2;
                $scope.resetValidateForm();
            } else if ($scope.selectedParameter.type == 2) {
                ultilService.showSuccessMessage(ultilService.translate('Please add node into multi level parameter'));
                $timeout(function () {
                    $('#parameterModal').modal('hide');
                }, 200);
                // Build root node
                $scope.selectedParameter.nodes = [];
                var nodeData = parameterService.initParameter($scope.selectedEnvironment);
                nodeData.level = 0;
                nodeData.is_leaf = false;
                nodeData.description = $scope.selectedParameter.description;
                nodeData.name = $scope.selectedParameter.name;
                nodeData.method = $scope.selectedParameter.method;
                nodeData.type = 2;
                $scope.selectedParameter.nodes.push(nodeData);
                $scope.selectedParameter.showType = 2;

                $scope.resetValidateForm();
            }
        }
        $scope.cancelUpdateParameter = function () {
            if ($scope.backupSelectedParameter != null) {
                $scope.selectedParameter = angular.copy($scope.backupSelectedParameter);
            }
            $scope.selectedParameter.showType = 1;
            $scope.resetValidateForm();

        }
        $scope.enableEditParameter = function () {
            $scope.selectedParameter.showType = 2;

        }
        $scope.inValidateTree = false;
        $scope.updateNodeOnTreeBeforeSaveOnServer = function (currentNode, nodeList) {

            if (angular.isUndefined(nodeList)) return;
            if (!angular.isArray(nodeList)) return;
            if (nodeList.length > 0) {
                for (var i = 0; i < nodeList.length; i++) {
                    var nodeData = nodeList[i];
                    nodeData.parent_id = currentNode.id;
                    nodeData.is_error = false;

                    if (nodeData.type == 2) {

                        if (angular.isDefined(nodeData.nodes) && angular.isArray(nodeData.nodes) && nodeData.nodes.length == 0) {
                            nodeData.is_error = true;
                            $scope.inValidateTree = true;
                        }
                    } else {
                        if (angular.isDefined(nodeData.nodes) && angular.isArray(nodeData.nodes) && nodeData.nodes.length > 0) {
                            nodeData.is_error = true;
                            $scope.inValidateTree = true;
                        }
                    }

                    $scope.updateNodeOnTreeBeforeSaveOnServer(nodeList[i], nodeList[i].nodes)
                }
            }
        }

        function sendParameterNotification() {
            var data = {
                "parameter": $scope.selectedParameter.name,
                "parameterId": $scope.selectedParameter.id,
                "product_version_id": $scope.selectedParameter.product_version_id
            };
            $.connection.hub.start().done(function () {
                hub.server.sendNotify($scope.selectedParameter.name, $scope.selectedParameter.id, $scope.selectedParameter.product_version_id);
            });
        }
        $scope.updateParameter = function () { 
            var isAddNew = false;
            if ($scope.selectedParameter.id == null || $scope.selectedParameter == 0) {
                isAddNew = true;
            }
            // If save tree parameter
            if ($scope.selectedParameter.type == 2) {
                $scope.inValidateTree = false;
                $scope.updateNodeOnTreeBeforeSaveOnServer($scope.selectedParameter, $scope.selectedParameter.nodes);
                if ($scope.inValidateTree) {
                    ultilService.showErrorMessage(ultilService.translate('There are error on tree'));
                    return;
                }                
                parameterService.updateTreeParam($scope.selectedParameter).then(function (obj) {
                    if (obj != null) {
                        if (obj.data == "duplicate name") {
                            $rootScope.spinner.off();                            
                            ultilService.showErrorMessage(ultilService.translate('Parameter was added duplicated'));
                            return;
                        }
                        if (isAddNew) {
                            $rootScope.spinner.off();                           
                            ultilService.showSuccessMessage(ultilService.translate('Parameter was added successful!'));

                            if (angular.isDefined(obj.data[0].id)) {
                                $scope.selectedParameter.id = obj.data[0].id;
                                $scope.selectedParameter.deleteable = obj.data[0].deleteable;
                            }
                            $scope.selectedParameter.showType = 1;

                            $scope.listParameter.push($scope.selectedParameter);
                            $scope.backupSelectedParameter = angular.copy($scope.selectedParameter);
                        } else {
                            $scope.selectedParameter.nodes = [];
                            if (angular.isArray(obj.data) && obj.data.length > 0) {
                                var rootData = obj.data.shift();
                                $scope.selectedParameter.nodes.push(rootData);
                                $scope.selectedParameter.nodes[0].nodes = [];
                                $scope.selectedParameter.nodes[0].level = 0;
                                var para = $.grep($scope.listParameter, function (e) { return e.id == $scope.selectedParameter.id; });
                                if (para && para.length > 0) {
                                    para[0].description = $scope.selectedParameter.description;
                                    para[0].method = $scope.selectedParameter.method;
                                    //$scope.selectedParameter.deleteable = obj.data[0].deleteable;
                                }
                                for (var i in obj.data) {
                                    if (obj.data[i].type == 0) {
                                        obj.data[i].is_leaf = true;
                                    } else {
                                        obj.data[i].is_leaf = false;
                                    }
                                    obj.data[i].nodes = [];
                                }
                                $scope.selectedParameter.nodes[0].nodes = $scope.getNestedChildren(obj.data, $scope.selectedParameter.id);
                            }
                            $rootScope.spinner.off();
                            $scope.selectedParameter.showType = 1;
                            $scope.backupSelectedParameter = angular.copy($scope.selectedParameter);
                            /*
                            var hub = $.connection.controllerHub;
                            hub.server.sendNotify($scope.selectedParameter.name, $scope.selectedParameter.id, $scope.selectedParameter.product_version_id);
                            */
                            sendParameterNotification();
                            ultilService.showSuccessMessage(ultilService.translate('Successfully updated parameter!'));
                        }
                    }
                });
                
            } else {
                $rootScope.spinner.on();
                parameterService.updateParam($scope.selectedParameter).then(function (obj) {
                    if (obj != null) {
                        if (isAddNew) {
                            $rootScope.spinner.off();
                            if (obj.data == 'duplicate name') {
                                ultilService.showErrorMessage(ultilService.translate('Parameter was added duplicated'));
                            } else {                              
                                ultilService.showSuccessMessage(ultilService.translate('Parameter was added successful!'));
                                if (angular.isDefined(obj.data.id)) {
                                    $scope.selectedParameter.id = obj.data.id;
                                    $scope.selectedParameter.deleteable = obj.data.deleteable;
                                }
                                $scope.selectedParameter.showType = 1;

                                $scope.listParameter.push($scope.selectedParameter);
                                $scope.backupSelectedParameter = angular.copy($scope.selectedParameter);
                            }
                        } else {
                            $rootScope.spinner.off();
                            parameterService.getParameters($scope.selectedEnvironment.id).then(function (obj) {
                                if (obj != null) {
                                    $scope.listParameter = obj.data;
                                    //$scope.selectedParameter.deleteable = obj.data.deleteable;
                                }
                            });
                            $scope.selectedParameter.showType = 1;

                            $scope.backupSelectedParameter = angular.copy($scope.selectedParameter);
                            /*
                            var hub = $.connection.controllerHub;
                            hub.server.sendNotify($scope.selectedParameter.name, $scope.selectedParameter.id, $scope.selectedParameter.product_version_id);
                            */
                            sendParameterNotification();
                            ultilService.showSuccessMessage(ultilService.translate('Successfully updated parameter!'));
                        }
                    }
                });
            }
        }
        $scope.DeleteCallback = function () {
            if ($scope.selectedParameter != null) {
                if (angular.isDefined($scope.selectedParameter) && angular.isNumber($scope.selectedParameter.id)) {
                    parameterService.removeParam($scope.selectedParameter.id).then(function (obj) {
                        if (obj != null) {
                            parameterService.getParameters($scope.selectedEnvironment.id).then(function (obj) {
                                if (obj != null) {
                                    $scope.listParameter = obj.data
                                }
                            });
                            $scope.selectedParameter = null;
                            ultilService.showSuccessMessage(ultilService.translate('Successfully deleted!'));
                        }
                    });
                }
            }
        }
        $scope.deleteParameter = function () {
            if ($scope.selectedParameter.deleteable != true) {
                ultilService.showErrorMessage(ultilService.translate("Can't delete this parameter!"));
                return;
            }
            $timeout(function () {
                ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '', ultilService.translate("Do you want to delete this item?"), $scope.DeleteCallback, null);
            }, 100);
        }


        // BEGIN TREE
        $scope.removeNodeOnTree = function (scope) {
            scope.remove();
            $timeout(function () {
                $scope.inValidateTree = false;
                $scope.updateNodeOnTreeBeforeSaveOnServer($scope.selectedParameter, $scope.selectedParameter.nodes);
            }, 300)
        };

        $scope.toggleNode = function (scope) {
            scope.toggle();
        };

        $scope.currentNodeWasEdit = null;
        $scope.edit = function (scope) {
            $scope.currentNodeScope = scope;
            $scope.currentNodeWasEdit = scope.$modelValue;
            $scope.nodeData = parameterService.convertNodeData(scope.$modelValue);
            if ($scope.nodeData.type == 2) {
                if (angular.isUndefined($scope.nodeData.is_leaf)) {
                    //$scope.nodeData.is_leaf = false;
                    //$scope.nodeData.isShowLeaf = true;
                }
                if ($scope.nodeData.is_leaf) {
                    //$scope.nodeData.isShowLeaf = true;
                }
            } else {
                //$scope.nodeData.is_leaf = true;
                //$scope.nodeData.isShowLeaf = true;
                if ($scope.variableMultiply1000[$scope.nodeData.name] == 1) {
                    $scope.nodeData.default_value = parseFloat($scope.nodeData.default_value) * 1000;
                } else {
                    $scope.nodeData.default_value = parseFloat($scope.nodeData.default_value);
                }
                $scope.nodeData.min_value = parseFloat($scope.nodeData.min_value);
                $scope.nodeData.max_value = parseFloat($scope.nodeData.max_value);
            }
            $scope.nodeData.isEdit = true;
            $scope.nodeData.isAdd = false;
            $scope.nodeData.isShowLeaf = true;
            $timeout(function () {
                $('#nodeModal').modal({ backdrop: 'static', keyboard: false });
            }, 400);
            $scope.resetValidateForm();
        };
        $scope.nodeData = null;
        $scope.currentNodeScope = null;
        $scope.newSubItem = function (scope) {

            $scope.currentNodeScope = scope;
            var nodeData = scope.$modelValue;
            $scope.nodeData = parameterService.initNewNodeData(scope.$modelValue);
            $scope.nodeData.isEdit = false;
            $scope.nodeData.isAdd = true;
            $scope.nodeData.is_leaf = false;
            $scope.resetValidateForm();
            $timeout(function () {
                $('#nodeModal').modal({ backdrop: 'static', keyboard: false });
            }, 400);
        };
        $scope.saveNewNode = function () {
            var nodeData = $scope.currentNodeScope.$modelValue;
            if ($scope.nodeData.is_leaf) {
                $scope.nodeData.type = 0;
            } else {
                $scope.nodeData.type = 2;
            }
            if (angular.isUndefined(nodeData.nodes) && !angular.isArray(nodeData.nodes)) {
                nodeData.nodes = [];
            }
            nodeData.nodes.push($scope.nodeData);
            $timeout(function () {
                $scope.inValidateTree = false;
                $scope.updateNodeOnTreeBeforeSaveOnServer($scope.selectedParameter, $scope.selectedParameter.nodes);
            }, 300)
            $('#nodeModal').modal('hide');
        }
        $scope.updateNode = function () {
            if ($scope.variableMultiply1000[$scope.nodeData.name] == 1) {
                $scope.nodeData.default_value = parseFloat($scope.nodeData.default_value) / 1000;
            } else {
                $scope.nodeData.default_value = parseFloat($scope.nodeData.default_value);
            }
            $scope.currentNodeWasEdit.id = $scope.nodeData.id;
            $scope.currentNodeWasEdit.default_value = $scope.nodeData.default_value;
            $scope.currentNodeWasEdit.name = $scope.nodeData.name;
            $scope.currentNodeWasEdit.description = $scope.nodeData.description;
            $scope.currentNodeWasEdit.editable = $scope.nodeData.editable;
            $scope.currentNodeWasEdit.max_value = $scope.nodeData.max_value;
            $scope.currentNodeWasEdit.min_value = $scope.nodeData.min_value;
            $scope.currentNodeWasEdit.format_number = $scope.nodeData.format_number;
            $scope.currentNodeWasEdit.method = $scope.nodeData.method;
            $scope.currentNodeWasEdit.parent_id = $scope.nodeData.parent_id;
            $scope.currentNodeWasEdit.productVersion = $scope.nodeData.productVersion;
            $scope.currentNodeWasEdit.product_version_id = $scope.nodeData.product_version_id;
            $scope.currentNodeWasEdit.type = $scope.nodeData.type;
            $scope.currentNodeWasEdit.is_leaf = $scope.nodeData.is_leaf;
            $scope.currentNodeWasEdit.isSummable = $scope.nodeData.isSummable;
            $scope.currentNodeWasEdit.is_formula = $scope.nodeData.is_formula;
            $scope.currentNodeWasEdit.is_choose_formula = $scope.nodeData.is_choose_formula;
            console.log($scope.currentNodeWasEdit);
            $timeout(function () {
                $scope.inValidateTree = false;
                $scope.updateNodeOnTreeBeforeSaveOnServer($scope.selectedParameter, $scope.selectedParameter.nodes);
            }, 300)
            $('#nodeModal').modal('hide');
        }
        var getRootNodesScope = function () {
            return angular.element(document.getElementById("tree-root")).scope();
        };

        $scope.collapseAll = function () {
            var scope = getRootNodesScope();
            scope.collapseAll();
        };

        $scope.expandAll = function () {
            var scope = getRootNodesScope();
            scope.expandAll();
        };
        // END TREE
        $scope.$watch('selectedParameter.method', function (newValue, oldValue) {
            if ($scope.selectedParameter != null && $scope.selectedParameter.type == 2 && $scope.selectedParameter.showType == 2) {
                $scope.selectedParameter.nodes[0].method = newValue;
            }
        });
        $scope.$watch('selectedParameter.description', function (newValue, oldValue) {
            if ($scope.selectedParameter != null && $scope.selectedParameter.type == 2 && $scope.selectedParameter.showType == 2) {
                $scope.selectedParameter.nodes[0].description = newValue;
            }
        });
        $scope.$watch('selectedParameter.name', function (newValue, oldValue) {
            if ($scope.selectedParameter != null && $scope.selectedParameter.type == 2 && $scope.selectedParameter.showType == 2) {
                $scope.selectedParameter.nodes[0].name = newValue;
            }
        });
        $scope.$watch('nodeData.is_leaf', function (newValue, oldValue) {
            if ($scope.nodeData != null) {
                if (newValue) {
                    $scope.nodeData.type = 0;
                    $scope.nodeData.method = null;
                } else {
                    $scope.nodeData.type = 2;
                }
            }
        });
        $scope.cloneVersionCurrentVersion = function () {
            $scope.errorCloneProductVersion = null;
            $scope.environmentVersion = {
                name: $scope.selectedEnvironment.name,
                version: $scope.selectedEnvironment.version,
                clone_from_id: $scope.selectedEnvironment.id
            };

            $timeout(function () {
                $('#cloneVersionModel').modal({ backdrop: 'static', keyboard: false });
            }, 400);
        };
        $scope.importRuleFileToCurrentVersion = function () {
            $scope.errorCloneProductVersion = null;
            $scope.environmentVersion = {
                name: $scope.selectedEnvironment.name,
                version: $scope.selectedEnvironment.version,
                clone_from_id: $scope.selectedEnvironment.id
            };

            $timeout(function () {
                $('#importRuleFile').modal({ backdrop: 'static', keyboard: false });
            }, 400);
        };

        $scope.saveRuleFileToCurrentVersion = function () {
            console.log('saveRuleFileToCurrentVersion');
            console.log($scope.environmentVersion);
            $rootScope.spinner.on();
            parameterService.saveRuleFileToCurrentVersion($scope.environmentVersion).then(function (obj) {
                if (obj.data != null) {
                    ultilService.showSuccessMessage(ultilService.translate('Imported rule file successful!'));
                    $timeout(function () {
                        parameterService.getParameters($scope.selectedEnvironment.id).then(function (obj) {
                            if (obj != null) {
                                $scope.listParameter = obj.data
                                $scope.selectedParameter = null;
                            }
                        });
                        $rootScope.spinner.off();
                        $('#closeImportRuleForm').click();
                        $('#importRuleFile').hide();

                    }, 100);


                }
                $rootScope.spinner.off();
            });
        }

        $scope.saveCloneNewVersion = function () {
            $rootScope.spinner.on();
            var i = 0;
            if ($scope.listEnvironment.indexOf($scope.environmentVersion.name) > -1) {
                i = i + 1;
            }
            if ($scope.listVersion.indexOf($scope.environmentVersion.version) > -1) {
                i = i + 1;
            }
            if (i != 2) {
                parameterService.saveCloneNewVersion($scope.environmentVersion).then(function (obj) {
                    if (obj.data != null) {
                        ultilService.showSuccessMessage(ultilService.translate('Version was cloned successful!'));
                        if (obj.data.id != null) {
                            $scope.selectedEnvironment = angular.copy(obj.data);
                            console.log($scope.selectedEnvironment);
                            $scope.listVersion = [];
                            $rootScope.spinner.off();
                            $timeout(function () {
                                $('#closeCloneFrom').click();
                                $('#cloneVersionModel').hide();
                                $scope.getListProductVersion(obj.data.id);
                            }, 100);
                            //if ($scope.selectedEnvironment.version != '') {
                            //    angular.forEach($scope.listProductVersion, function (item) {
                            //        if (item.name == $scope.selectedEnvironment.name && item.version == $scope.selectedEnvironment.version) {
                            //            $scope.selectedEnvironment = angular.copy(item);
                            //        }
                            //    })
                            //    $scope.getParameters();
                            //}
                        }
                    }
                    $rootScope.spinner.off();
                });
            } else {
                $scope.errorCloneProductVersion = true;
                $rootScope.spinner.off();
            }

        };
    }]);


