btoApp.controller('ManageRoleController', ['$scope', 'parameterService', '$rootScope', '$timeout', 'ultilService', '$http', 'roleService',
function ($scope, parameterService, $rootScope, $timeout, ultilService, $http, roleService) {
    $rootScope.scope = $scope;
    $scope.roleData = [];
    
    $scope.definePermission =
        [
            { action: 0, name: ultilService.translate('Read') },
            { action: 1, name: ultilService.translate('Read & Write') }
        ];
    $scope.role_treeOptions = {

        dropped: function (e) {
            var backupNoDropEnable = e.dest.nodesScope.$treeScope.nodropEnabled;
            e.dest.nodesScope.$treeScope.nodropEnabled = true;
            $scope.ou_MoveData = {
                index: e.dest.index,
                dest: e.dest.nodesScope.$parent.$modelValue,
                source: e.source.nodeScope.$modelValue
            }

            var checkIsChangeParent = false;
            var parentData = e.dest.nodesScope.$parent.$modelValue;
            if (e.source.nodeScope.$parentNodeScope != null && angular.isDefined(e.dest.nodesScope.$parent.$modelValue) && angular.isDefined(e.source.nodeScope.$parentNodeScope.$modelValue)) {
                checkIsChangeParent = e.dest.nodesScope.$parent.$modelValue.id != e.source.nodeScope.$parentNodeScope.$modelValue.id;
            } else if (angular.isUndefined(e.dest.nodesScope.$parent.$modelValue)) {
                if (e.source.nodeScope.$parentNodeScope == null) {
                    if (angular.isDefined(e.dest.nodesScope.$parent.$modelValue)) {
                        checkIsChangeParent = true;
                    }
                } else if (angular.isDefined(e.source.nodeScope.$parentNodeScope.$modelValue)) {
                    checkIsChangeParent = true;
                }
            } else if (e.source.nodeScope.$parentNodeScope == null && angular.isDefined(e.dest.nodesScope.$parent.$modelValue)) {
                checkIsChangeParent = true;
            }

            if (checkIsChangeParent) {
                $timeout(function () {
                    e.dest.nodesScope.$treeScope.nodropEnabled = backupNoDropEnable;
                    ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
                        ultilService.translate("Do you want to move role {{source_name}} to {{destination_name}}",
                        {
                            source_name: $scope.ou_MoveData.source.description,
                            destination_name: $scope.ou_MoveData.dest == undefined ? ultilService.translate("top") : $scope.ou_MoveData.dest.description
                        }),
                        $scope.ou_moveCallback, null);
                }, 300);
            }
        }
    }
    $scope.ou_MoveData = null;
    $scope.ou_moveCallback = function () {
        var ouData = {
            id: $scope.ou_MoveData.source.id,
            name: $scope.ou_MoveData.source.name,
            description: $scope.ou_MoveData.source.description,
            parent_id: null
        }
        if (angular.isDefined($scope.ou_MoveData.dest)) {
            ouData.parent_id = $scope.ou_MoveData.dest.id;
        }
        roleService.updateRole(ouData).then(function (response) {
            if (response.status == 200) {
                ultilService.showSuccessMessage(ultilService.translate('Successfully moved role!'));
                if (angular.isDefined($scope.ou_MoveData.dest)) {
                    // Remove source
                    $scope.ou_removeNodeOnTree($scope.roleData);
                    // Add source
                    $scope.ou_addNodeOnTree($scope.roleData);
                } else {
                    // Remove source
                    $scope.ou_removeNodeOnTree($scope.roleData);
                    // Add to top
                    $scope.roleData.splice($scope.ou_MoveData.index, 0, $scope.ou_MoveData.source);
                }
            } else {
                ultilService.showErrorMessage(ultilService.translate('Failed to move role'));
            }
        });
    }
    $scope.ou_removeNodeOnTree = function (node) {
        if (node.length > 0) {
            var childLength = node.length;
            for (var i = 0; i < childLength; i++) {
                if (angular.isDefined(node[i])) {
                    if (node[i].id == $scope.ou_MoveData.source.id) {

                        node.splice(i, 1);
                    }
                }
                if (angular.isDefined(node[i])) {
                    $scope.ou_removeNodeOnTree(node[i].childrens);
                }
            }
        } else {
            return;
        }
    }
    $scope.ou_toggle = function (scope) {
        scope.toggle();
    };
    $scope.ou_addNodeOnTree = function (node) {
        if (node.length > 0) {
            var childLength = node.length;
            for (var i = 0; i < childLength; i++) {
                if (angular.isDefined(node[i])) {
                    if (node[i].id == $scope.ou_MoveData.dest.id) {
                        node[i].childrens.splice($scope.ou_MoveData.index, 0, $scope.ou_MoveData.source);
                        return;
                    }
                }
                if (angular.isDefined(node[i])) {
                    $scope.ou_addNodeOnTree(node[i].childrens);
                }
            }
        } else {
            return;
        }
    }
    $scope.ou_selectedScope = null;
    $scope.ou_remove = function (scope) {
        var ou_selectedOrganizationUnit = scope.$nodeScope.$modelValue;
        $scope.ou_selectedScope = scope;
        $timeout(function () {
            ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
                ultilService.translate("Do you want to remove organization unit {{source_name}}",
                {
                    source_name: scope.$nodeScope.$modelValue.description
                }),
                function () {
                    roleService.deleteRole(ou_selectedOrganizationUnit.id).then(function (response) {
                        
                        if (response.data == null) {
                            ultilService.showErrorMessage(ultilService.translate('Failed to delete role'));
                        } else {
                            ultilService.showSuccessMessage(ultilService.translate('Role has been deleted!'));
                            $scope.ou_selectedOrganizationUnit = null;
                            $scope.op_isShowDetail = false;
                            $scope.initTree();
                        }
                    });

                }, null);
        }, 300);
    }; 
    $scope.op_isShowDetail = false;
    $scope.ou_selectedOrganizationUnit = null;
    $scope.ou_edit = function (node) {
        if ($scope.ou_selectedOrganizationUnit == null) {
            $scope.switchToOtherRole(node);
        } else {
            if ($scope.ou_selectedOrganizationUnit.id != node.id) {
                if ($scope.isChangeRoleStatus || $scope.isChangeRoleNameOrDescription) {
                    ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
                       ultilService.translate("Your data has not saved yet, do you want to switch to other role?"),
                       function () {
                           $scope.switchToOtherRole(node);
                       }, null);
                } else {
                    $scope.switchToOtherRole(node);
                }
            } else {
                $scope.switchToOtherRole(node);
            }
        }
    }

    $scope.switchToOtherRole = function (node) {
        $scope.ou_selectedOrganizationUnit = angular.copy(node);
        $scope.ou_resetValidateForm();
        $scope.op_isShowDetail = true; 
        $scope.getAllRoleFunction($scope.ou_selectedOrganizationUnit.id);
        $scope.isChangeRoleStatus = false;
        $scope.isChangeRoleNameOrDescription = false;
        $scope.isSelectedAllAvailableRole = false;
        $scope.isSelectedAllRole = false;
    }

    $scope.ou_newSubItem = function (scope) {
        var newRoleAction = function () {
            $scope.op_isShowDetail = false;
            $scope.ou_selectedScope = scope;
            $scope.ou_selectedOrganizationUnit = roleService.initRoleModel();
            $scope.ou_selectedOrganizationUnit.parent_id = scope.$nodeScope.$modelValue.id;
            $timeout(function () {
                $scope.ou_resetValidateForm();
                $('#organizationUnit').modal({ backdrop: 'static', keyboard: false });
                $scope.isChangeRoleStatus = false;
                $scope.isChangeRoleNameOrDescription = false;
            }, 300);
        }
        if ($scope.isChangeRoleStatus || $scope.isChangeRoleNameOrDescription) {
            ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
               ultilService.translate("Your data has not saved yet, do you want to add new role?"),
               function () {
                   newRoleAction();
               }, null);
        } else {
            newRoleAction();
        }
    };
    $scope.getNestedChildren = function (data, id) {
        var out = [];
        for (var i in data) {
            if (data[i].parent_id == id) {
                var childrens = $scope.getNestedChildren(data, data[i].id);
                if (childrens.length > 0) {
                    data[i].childrens = childrens;
                } else {
                    data[i].childrens = [];
                }
                out.push(data[i]);
            }
        }
        return out;
    }
    $scope.roleList = [];
    $scope.buildTree = function (data) {
        $scope.roleList = data;
        $scope.roleData = [];
        $scope.roleData = $scope.getNestedChildren(data, null);
        if ($scope.roleData.length == 0) {
            $scope.roleData = $scope.getNestedChildren(data, data[0].parent_id);
        }
    }

    $scope.initTree = function () {
        roleService.getAllRole().then(function (response) {
            $scope.buildTree(response.data);
        });
    }
    $scope.ou_resetValidateForm = function () {
        try { $scope.addOrganizationUnitForm.$setPristine(); } catch (ex) { }
        try { $scope.editOrganizationUnitForm.$setPristine(); } catch (ex) { }
    }
    $scope.ou_saveNewOrganizationUnit = function () {
        roleService.addRole($scope.ou_selectedOrganizationUnit).then(function (response) {
            if (response.data.id != null) {
                $timeout(function () {
                    $('#organizationUnit').modal('hide');
                    $scope.ou_selectedOrganizationUnit = response.data;
                    $scope.ou_selectedOrganizationUnit.childrens = [];
                    if ($scope.ou_selectedOrganizationUnit.parent_id == null) {
                        $scope.roleData.push($scope.ou_selectedOrganizationUnit);
                    } else {
                        $scope.ou_selectedScope.$nodeScope.$modelValue.childrens.push($scope.ou_selectedOrganizationUnit);
                    }
                    ultilService.showSuccessMessage(ultilService.translate('Role has been added!'));
                    $scope.roleList.push(angular.copy($scope.ou_selectedOrganizationUnit));
                    $scope.ou_edit($scope.ou_selectedOrganizationUnit);
                    //$scope.ou_selectedOrganizationUnit = null;
                }, 100);
            } else {
                ultilService.showErrorMessage(ultilService.translate('Failed to add role'));
            }
        })
    }
    $scope.initTree();
    $scope.addTopNode = function () {
        var newRoleAction = function () {
            $scope.op_isShowDetail = false;
            $scope.ou_selectedOrganizationUnit = roleService.initRoleModel();
            $scope.ou_selectedOrganizationUnit.parent_id = null;
            $timeout(function () {
                $scope.ou_resetValidateForm();
                $('#organizationUnit').modal({ backdrop: 'static', keyboard: false });
                $scope.isChangeRoleStatus = false;
                $scope.isChangeRoleNameOrDescription = false;
            }, 300);
        }
        if ($scope.isChangeRoleStatus || $scope.isChangeRoleNameOrDescription) {
            ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
               ultilService.translate("Your data has not saved yet, do you want to add new role?"),
               function () {
                   newRoleAction();
               }, null);
        } else {
            newRoleAction();
        }
    }
    $scope.ou_updateOrganizationUnit = function () {
        var ouData = {
            id: $scope.ou_selectedOrganizationUnit.id,
            name: $scope.ou_selectedOrganizationUnit.name,
            description: $scope.ou_selectedOrganizationUnit.description,
            parent_id: $scope.ou_selectedOrganizationUnit.parent_id
        }
        roleService.updateRole(ouData).then(function (response) {
            if (response.data == true) {
                ultilService.showSuccessMessage(ultilService.translate('Organization unit has been updated!'));
                $scope.isChangeRoleNameOrDescription = false;
                $scope.ou_updateNodeOnTree($scope.roleData);
            } else {
                ultilService.showErrorMessage(ultilService.translate('Failed to move organization unit'));
            }
        });
    }

    $scope.ou_updateNodeOnTree = function (node) {
        if (node.length > 0) {
            var childLength = node.length;
            for (var i = 0; i < childLength; i++) {
                if (angular.isDefined(node[i])) {
                    if (node[i].id == $scope.ou_selectedOrganizationUnit.id) {
                        node[i].name = $scope.ou_selectedOrganizationUnit.name;
                        node[i].description = $scope.ou_selectedOrganizationUnit.description;
                    }
                }
                if (angular.isDefined(node[i])) {
                    $scope.ou_updateNodeOnTree(node[i].childrens);
                }
            }
        } else {
            return;
        }
    }

    $scope.availableRoles = [];
    $scope.listFunction = [];
    $scope.getListFunction = function () {
        roleService.getAllFunction().then(function (response) {
            $scope.listFunction = response.data;
            angular.forEach($scope.listFunction, function (item) {
                item.action = -1;
            })
        });
    }
    $scope.getListFunction();
    $scope.ou_CheckAllAvailableRole = function () {
        $scope.isSelectedAllAvailableRole = !$scope.isSelectedAllAvailableRole;
        
        angular.forEach($scope.availableRoles, function (item) {
            item.selected = $scope.isSelectedAllAvailableRole;
        });
    }
    $scope.roleFunctionDataModel = [];
    $scope.getAllRoleFunction = function (roleid) {
        $scope.isSelectedAllRole = false;
        roleService.getAllFunctionByRole(roleid).then(function (response) {
            if (response != null) {

                $scope.roleFunctionDataModel = response.data;
                $scope.roleFunctionData = response.data.functions;
                $scope.availableRoles = [];
                var isExisted = false;
                angular.forEach($scope.listFunction, function (item) {
                    item.selected = false;
                    isExisted = false;
                    for (var i = 0; i < $scope.roleFunctionData.length; i++) {
                        if (item.id == $scope.roleFunctionData[i].id) {
                            isExisted = true;
                            break;
                        }
                    }
                    if (!isExisted) {
                        $scope.availableRoles.push(item);
                    }
                });
            }
        });
    }
    $scope.roleFunctionData = [];
    $scope.isSelectedAllRole = true;
    $scope.ou_CheckAllRole = function () {
        $scope.isSelectedAllRole = !$scope.isSelectedAllRole;
        angular.forEach($scope.roleFunctionData, function (item) {
            item.selected = $scope.isSelectedAllRole;
        })
    }
    

    $scope.saveFunctionRoleChanged = function () {
        $scope.roleFunctionDataModel.functions = $scope.roleFunctionData;
        roleService.saveFunctionRole($scope.roleFunctionDataModel).then(function (response) {
            if (response.data != null) {
                ultilService.showSuccessMessage(ultilService.translate('Successfully saved role permission!'));
                $scope.isChangeRoleStatus = false;

            } else {
                ultilService.showErrorMessage(ultilService.translate('Failed to save role permission'));
            }
        });

    }
    $scope.ou_addRole = function () {
        
        var roleList = angular.copy($scope.roleFunctionData);
        var addedRoleList = [];
        var isAdded = false;
        angular.forEach($scope.availableRoles, function (item) {
            if (item.selected) {
                isAdded = false;

                if (roleList.length > 0) {
                    for (var i = 0; i < roleList.length; i++) {
                        if (roleList[i].id == item.id) {
                            isAdded = true;
                            break;
                        }
                    }
                }
                if (!isAdded) {
                    addedRoleList.push(item);
                }
            }
        });
        if (addedRoleList.length == 0) {
            return;
        }
        $scope.roleFunctionData = [];
        $scope.availableRoles = [];
        if (addedRoleList.length > 0) {
        // Add to selected role
        angular.forEach(addedRoleList, function (item) {
            var addItem = angular.copy(item);
            addItem.selected = false;
            addItem.action = 1;
                roleList.push(angular.copy(addItem));
        });
            $scope.isChangeRoleStatus = true;
        }

        // Remove selected role
        $scope.isSelectedAllAvailableRole = false;
        $scope.isSelectedAllRole = false;
        
        $timeout(function () {
            $scope.roleFunctionData = roleList;
            $scope.availableRoles = $scope.ou_getAvailableRoles();
        }, 500)

    }
    $scope.ou_getAvailableRoles = function () {
        var result = [];
        var roleList = $scope.roleFunctionData;
        angular.forEach($scope.listFunction, function (item) {
            if (roleList.length > 0) {
                var isAdded = false;
                for (var i = 0; i < roleList.length; i++) {
                    if (roleList[i].id == item.id) {
                        isAdded = true;
                    }
                }
                if (!isAdded) {
                    item.selected = false;
                    result.push(item);
                }
            } else {
                item.selected = false;
                result.push(item);
            }
        });
        return result;
    }

    $scope.ou_removeRole = function () {
        var roleList = $scope.roleFunctionData;
        var unCheckedRoles = [];
        var checkRoles = []
        angular.forEach(roleList, function (item) {
            if (!item.selected) {
                unCheckedRoles.push(item);
            } else {
                checkRoles.push(item);
            }
        });
        if (checkRoles.length == 0) {
            return;
        }
        if (unCheckedRoles.length > 0) {
            $scope.isChangeRoleStatus = true;
        }
        roleList = unCheckedRoles;
        
        $scope.roleFunctionData = [];
        $scope.availableRoles = [];
        $scope.isSelectedAllAvailableRole = false;
        $scope.isSelectedAllRole = false;

        $timeout(function () {
            $scope.roleFunctionData = roleList;
            // Remove selected role
            $scope.availableRoles = $scope.ou_getAvailableRoles();

            $scope.isSelectedAllAvailableRole = false;
            $scope.isSelectedAllRole = false;
            $scope.isChangeRoleStatus = true;
           
        })
    }

    $scope.isChangeRoleStatus = false;
    $scope.roleStatusChange = function () {
        $scope.isChangeRoleStatus = true;
    }
    $scope.isChangeRoleNameOrDescription = false;
    $scope.changeRoleName = function () {
        if ($scope.op_isShowDetail) {
            $scope.isChangeRoleNameOrDescription = true;
        }
    }

    $scope.changeRoleDescription = function () {
        if ($scope.op_isShowDetail) {
            $scope.isChangeRoleNameOrDescription = true;
        }
    }
}]);