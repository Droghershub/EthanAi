btoApp.controller('OrganizationUnitController', ['$scope', 'parameterService', '$rootScope', '$timeout', 'ultilService', '$http',  'organizationUnitService',
function ($scope, parameterService, $rootScope, $timeout, ultilService, $http, organizationUnitService) {
    $rootScope.scope = $scope;
    
    
    $scope.ou_data = [];
    
    $scope.ou_treeOptions = {
        /*
        accept: function (sourceNodeScope, destNodesScope, destIndex) {
            return sourceNodeScope.$modelValue.name != 'root';
        },
        */
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
            if ($scope.ou_MoveData.source.isFirstNode) {
                ultilService.showWarningMessage('Cannot move default organization unit');
                return;
            }
            if (checkIsChangeParent) {
                $timeout(function () {
                    e.dest.nodesScope.$treeScope.nodropEnabled = backupNoDropEnable;
                    ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
                        ultilService.translate("Do you want to move organization unit {{source_name}} to {{destination_name}}",
                        {
                            source_name: $scope.ou_MoveData.source.description,
                            destination_name: $scope.ou_MoveData.dest == undefined ? ultilService.translate("top") : $scope.ou_MoveData.dest.description
                        }),
                        $scope.ou_moveCallback, null);
                }, 300);
            }
        }
    };
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
        
        organizationUnitService.updateOrganizationUnit(ouData).then(function (response) {
            
            if (response.data == true) {
                ultilService.showSuccessMessage(ultilService.translate('Organization unit has been moved!'));
                if (angular.isDefined($scope.ou_MoveData.dest)) {
                    // Remove source
                    $scope.ou_removeNodeOnTree($scope.ou_data);
                    // Add source
                    $scope.ou_addNodeOnTree($scope.ou_data);
                } else {
                    // Remove source
                    $scope.ou_removeNodeOnTree($scope.ou_data);
                    // Add to top
                    $scope.ou_data.splice($scope.ou_MoveData.index, 0, $scope.ou_MoveData.source);
                }
            } else {
                ultilService.showErrorMessage(ultilService.translate('Failed to move organization unit'));
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

    $scope.ou_toggle = function (scope) {
        scope.toggle();
    };
    
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
                    organizationUnitService.deletedOrganizationUnit(ou_selectedOrganizationUnit.id).then(function (response) {
                        if (response.data == null) {
                            ultilService.showErrorMessage(ultilService.translate('Failed to delete organization unit'));
                        } else {
                            ultilService.showSuccessMessage(ultilService.translate('Organization unit has been deleted!'));
                            $scope.ou_list = response.data;
                            $scope.updateFirstNodeOnTree(response.data);
                            $scope.ou_data = $scope.getNestedChildren(response.data, null);
                            $scope.op_isShowDetail = false;
                            $scope.ou_selectedOrganizationUnit = null;
                        }
                    })
                }, null);
        }, 300);
    };

    $scope.ou_removeCallback = function () { 
        organizationUnitService.deletedOrganizationUnit($scope.ou_selectedOrganizationUnit.id).then(function (response) {
            if (response.data == null) {
                ultilService.showErrorMessage(ultilService.translate('Failed to delete organization unit'));
            } else {
                ultilService.showSuccessMessage(ultilService.translate('Organization unit has been deleted!'));
                $scope.ou_list = response.data;
                $scope.updateFirstNodeOnTree(response.data);
                $scope.ou_data = $scope.getNestedChildren(response.data, null);
                
            }
        });
        
    }

    $scope.ou_selectedOrganizationUnit = null;
    $scope.ou_list = [];
    $scope.ou_newSubItem = function (scope) {
        
        $scope.op_isShowDetail = false;
        $scope.ou_selectedScope = scope;
        $scope.ou_selectedOrganizationUnit = organizationUnitService.initOrganizationUnit();
        if ($scope.listVersion.length > 0) {
            $scope.ou_selectedOrganizationUnit.product_version_id = $scope.listVersion[0].id;
        }
        $scope.ou_selectedOrganizationUnit.parent_id = scope.$nodeScope.$modelValue.id;
        
        $timeout(function () {
            $scope.ou_resetValidateForm();
            $('#organizationUnit').modal({ backdrop: 'static', keyboard: false });
        }, 300);
    };
    $scope.ou_resetValidateForm = function () {
        try {$scope.addOrganizationUnitForm.$setPristine();} catch (ex) { }
        try {$scope.editOrganizationUnitForm.$setPristine();} catch (ex) { }
    }
    $scope.ou_saveNewOrganizationUnit = function () { 
        $scope.ou_selectedOrganizationUnit.product_version_id = $scope.getProductVersionId();
        organizationUnitService.addOrganizationUnit($scope.ou_selectedOrganizationUnit).then(function (response) { 
            if (response.data.id != null) { 
                $scope.ou_selectedOrganizationUnit.id = response.data.id;
                $scope.ou_selectedOrganizationUnit.childrens = [];
                if ($scope.ou_selectedOrganizationUnit.parent_id == null) {
                    $scope.ou_data.push($scope.ou_selectedOrganizationUnit);
                } else {
                    $scope.ou_selectedScope.$nodeScope.$modelValue.childrens.push($scope.ou_selectedOrganizationUnit);
                }
                ultilService.showSuccessMessage(ultilService.translate('Organization unit has been added!'));
                
                $scope.ou_list.push(angular.copy($scope.ou_selectedOrganizationUnit));
                $timeout(function () {
                    $scope.ou_selectedOrganizationUnit = null;
                }, 700)
                
                $timeout(function () {
                    $('#organizationUnit').modal('hide');
                }, 200);
            } else {
                ultilService.showErrorMessage(ultilService.translate('Failed to add organization unit'));
            }
        })
    }
    $scope.getNestedChildren = function (data, id) {
        var out = []
        for (var i in data) {
            if (data[i].parent_id == id) {

                var childrens = $scope.getNestedChildren(data, data[i].id)
                if (childrens.length >0) {
                    data[i].childrens = childrens
                } else {
                    data[i].childrens = [];
                }
                out.push(data[i])
            }
        }
        return out
    }

    $scope.updateFirstNodeOnTree = function (data) {
        var itemData = null;
        if (data.length > 0) {
            itemData = data[0];
            angular.forEach(data, function (item) {
                if (item.id < itemData.id) {
                    item = itemData;
                    item.isFirstNode = false;
                }
            })
        }
        if (itemData != null) {
            itemData.isFirstNode = true;
        }
    }

    $scope.buildTree = function (data) {
        $scope.ou_list = data;
        $scope.ou_data = [];
        $scope.updateFirstNodeOnTree(data);
        $scope.ou_data = $scope.getNestedChildren(data, null);
    };

    $scope.ou_addTopNode = function () {
        var newOrganizationUnit = function(){
            $scope.op_isShowDetail = false;
            $scope.ou_selectedOrganizationUnit = organizationUnitService.initOrganizationUnit();
            if ($scope.listVersion.length > 0) {
                $scope.ou_selectedOrganizationUnit.product_version_id = $scope.listVersion[0].id;
            }
            
            $scope.ou_selectedOrganizationUnit.parent_id = null;
            $timeout(function () {
                $scope.ou_resetValidateForm();
                $('#organizationUnit').modal({ backdrop: 'static', keyboard: false });
                $scope.isChangeRoleDataChanged = false;
                $scope.isChangeRoleNameOrDescription = false;
            }, 300);
            
        }

        if ($scope.isChangeRoleDataChanged || $scope.isChangeRoleNameOrDescription) {
            ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
               ultilService.translate("Your data has not saved yet, do you want to add new organization unit"),
               function () {
                   newOrganizationUnit();
               }, null);
        } else {
            newOrganizationUnit();
        }
    }


    $scope.op_isShowDetail = false;
    $scope.op_isShowAssignUser = false;
    $scope.ou_edit = function (node) { 
        var showDetailOfOrganizationUnit = function () {
            $scope.ou_resetValidateForm();
            $scope.op_isShowDetail = true;
            $scope.op_isShowAssignUser = false;
            $scope.ou_selectedOrganizationUnit = angular.copy(node);
            $scope.tabIndex = -1;
            organizationUnitService.getRoleByOrganizationUnit(node.id).then(function (response) {
                $scope.ou_roleData = response.data;
                $scope.ou_changeTab(0, true);
            });
            $scope.isChangeRoleDataChanged = false;
            $scope.isChangeRoleNameOrDescription = false;
           
        }
        if ($scope.ou_selectedOrganizationUnit == null) {
            showDetailOfOrganizationUnit();
        } else {
            if ($scope.ou_selectedOrganizationUnit.id != node.id) {
                if ($scope.isChangeRoleDataChanged || $scope.isChangeRoleNameOrDescription) {
                    ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
                       ultilService.translate("Your data has not saved yet, do you want to view detail of organization unit"),
                       function () {
                           showDetailOfOrganizationUnit();
                       }, null);
                } else {
                    showDetailOfOrganizationUnit();
                }
            } else if ($scope.op_isShowDetail == false) {
                if ($scope.isChangeRoleDataChanged || $scope.isChangeRoleNameOrDescription) {
                    ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
                       ultilService.translate("Your data has not saved yet, do you want to view detail of organization unit"),
                       function () {
                           showDetailOfOrganizationUnit();
                       }, null);
                } else {
                    showDetailOfOrganizationUnit();
                }
            }
        }
    }
    
    $scope.ou_availableUserTable = {
        isLoading: false,
        startIndex: 0,
        number: 10,
        numberOfPages: 0,
        email: '',
        isSelectedAllAvailable: false,
        displayed: [],
        tableState: null,
        callServer: function (tableState) {
            $scope.ou_availableUserTable.displayed = [];
            $scope.ou_availableUserTable.tableState = tableState;
            $scope.ou_availableUserTable.isLoading = true;
            var pagination = tableState.pagination;
            $scope.ou_availableUserTable.startIndex = pagination.start || 0;
            $scope.ou_availableUserTable.number = pagination.number || 10;
            if (angular.isDefined(tableState.search.predicateObject) && angular.isDefined(tableState.search.predicateObject.email)) {
                $scope.ou_availableUserTable.email = tableState.search.predicateObject.email || '';
            }
            //tableState.pagination.numberOfPages = 0;
            $scope.ou_availableUserTable.getSession($scope.ou_selectedOrganizationUnit.id, $scope.ou_availableUserTable.startIndex,
                $scope.ou_availableUserTable.number,
                $scope.ou_availableUserTable.email,
                tableState, function (result) {
                    tableState.pagination.numberOfPages = result.numberOfPages;
                    $scope.ou_availableUserTable.numberOfPages = result.numberOfPages;
                    $scope.ou_availableUserTable.displayed = result.data
                    $scope.ou_availableUserTable.isSelectedAllAvailable = false;
                    $scope.ou_availableUserTable.isLoading = false;
                    angular.forEach($scope.ou_availableUserTable.displayed, function (item) {
                        item.selected = $scope.ou_availableUserTable.isSelectedAllAvailable;
                    });
                });
        },
        getSession: function (organization_unit_id, start, number, email, tableState, callbackSuccess) {
            $http({ method: 'POST', url: '/api/usermanagement/GetAvailableUsersOfOrganizationUnit', data: { organization_unit_id: organization_unit_id, start: start, number: number, email: email } }).then(function (response) {
                if (angular.isDefined(callbackSuccess)) callbackSuccess(response.data);        
            });
        }
    };
    
    $scope.ou_clickAssignUser = function (node) {
        var showAssignUser = function () {
            $scope.ou_selectedOrganizationUnit = node;
            $scope.ou_resetValidateForm();
            $scope.op_isShowDetail = false;
            $scope.reloadAssignUserTable();
            $scope.op_isShowAssignUser = true;
            $scope.isChangeRoleDataChanged = false;
            $scope.isChangeRoleNameOrDescription = false; 
        }

        if ($scope.ou_selectedOrganizationUnit == null) { 
            showAssignUser();
        } else {
            if (($scope.ou_selectedOrganizationUnit.id != node.id) || ($scope.op_isShowAssignUser == false)) {
                if ($scope.isChangeRoleDataChanged || $scope.isChangeRoleNameOrDescription) {
                    ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
                       ultilService.translate("Your data has not saved yet, do you want to view user of organization unit"),
                       function () { 
                           showAssignUser(); 
                           $timeout(function () {
                               $scope.$apply();
                           }, 500)
                       }, null);
                } else { 
                    showAssignUser();
                }
            } 
        }
    }

    $scope.reloadAssignUserTable = function () { 
        if ($scope.ou_availableUserTable.tableState != null && $scope.op_isShowAssignUser) { 
            $scope.ou_availableUserTable.callServer($scope.ou_availableUserTable.tableState);
        }
        if ($scope.ou_assignedUserTable.tableState != null && $scope.op_isShowAssignUser) { 
            $scope.ou_assignedUserTable.callServer($scope.ou_assignedUserTable.tableState);
        }
    }

    $scope.ou_AssignUserCheckAllAvailableUser = function () { 
        angular.forEach($scope.ou_availableUserTable.displayed, function (item) {
            item.selected = $scope.ou_availableUserTable.isSelectedAllAvailable;
        });
    }

    $scope.ou_AssignUserCheckAssignedUser = function () {
        angular.forEach($scope.ou_assignedUserTable.displayed, function (item) {
            item.selected = $scope.ou_assignedUserTable.isSelectedAllAvailable;
        });
    }

    $scope.ou_availableUserTable = {
        isLoading: false,
        startIndex: 0,
        number: 10,
        numberOfPages: 0,
        email: '',
        isSelectedAllAvailable: false,
        displayed: [],
        tableState: null,
        callServer: function (tableState) {
            $scope.ou_availableUserTable.displayed = [];
            $scope.ou_availableUserTable.tableState = tableState;
            $scope.ou_availableUserTable.isLoading = true;
            var pagination = tableState.pagination;
            $scope.ou_availableUserTable.startIndex = pagination.start || 0;
            $scope.ou_availableUserTable.number = pagination.number || 10;
            if (angular.isDefined(tableState.search.predicateObject) && angular.isDefined(tableState.search.predicateObject.email)) {
                $scope.ou_availableUserTable.email = tableState.search.predicateObject.email || '';
            }
            //tableState.pagination.numberOfPages = 0;
            $scope.ou_availableUserTable.getSession($scope.ou_selectedOrganizationUnit.id, $scope.ou_availableUserTable.startIndex,
                $scope.ou_availableUserTable.number,
                $scope.ou_availableUserTable.email,
                tableState, function (result) {
                    tableState.pagination.numberOfPages = result.numberOfPages;
                    $scope.ou_availableUserTable.numberOfPages = result.numberOfPages;
                    $scope.ou_availableUserTable.displayed = result.data
                    $scope.ou_availableUserTable.isSelectedAllAvailable = false;
                    $scope.ou_availableUserTable.isLoading = false;
                    angular.forEach($scope.ou_availableUserTable.displayed, function (item) {
                        item.selected = $scope.ou_availableUserTable.isSelectedAllAvailable;
                    });
                });
        },
        getSession: function (organization_unit_id, start, number, email, tableState, callbackSuccess) {
            $http({ method: 'POST', url: '/api/usermanagement/GetAvailableUsersOfOrganizationUnit', data: { organization_unit_id: organization_unit_id, start: start, number: number, email: email } }).then(function (response) {
                if (angular.isDefined(callbackSuccess)) callbackSuccess(response.data);        
            });
        }
    };

    $scope.ou_assignedUserTable = {
        isLoading: false,
        startIndex: 0,
        number: 10,
        numberOfPages: 0,
        email: '',
        isSelectedAllAvailable: false,
        displayed: [],
        tableState: null,
        callServer: function (tableState) {
            $scope.ou_assignedUserTable.displayed = [];
            $scope.ou_assignedUserTable.tableState = tableState;
            $scope.ou_assignedUserTable.isLoading = true;
            var pagination = tableState.pagination;
            $scope.ou_assignedUserTable.startIndex = pagination.start || 0;
            $scope.ou_assignedUserTable.number = pagination.number || 10;
            if (angular.isDefined(tableState.search.predicateObject) && angular.isDefined(tableState.search.predicateObject.email)) {
                $scope.ou_assignedUserTable.email = tableState.search.predicateObject.email || '';
            }
            //tableState.pagination.numberOfPages = 0;
            $scope.ou_assignedUserTable.getSession($scope.ou_selectedOrganizationUnit.id, $scope.ou_assignedUserTable.startIndex,
                $scope.ou_assignedUserTable.number,
                $scope.ou_assignedUserTable.email,
                tableState, function (result) {
                    tableState.pagination.numberOfPages = result.numberOfPages;
                    $scope.ou_assignedUserTable.numberOfPages = result.numberOfPages;
                    $scope.ou_assignedUserTable.displayed = result.data
                    $scope.ou_assignedUserTable.isSelectedAllAvailable = false;
                    $scope.ou_assignedUserTable.isLoading = false;
                    angular.forEach($scope.ou_assignedUserTable.displayed, function (item) {
                        item.selected = $scope.ou_assignedUserTable.isSelectedAllAvailable;
                    });
                });
        },
        getSession: function (organization_unit_id, start, number, email, tableState, callbackSuccess) {
            $http({ method: 'POST', url: '/api/usermanagement/GetAssignedUsersOfOrganizationUnit', data: { organization_unit_id: organization_unit_id, start: start, number: number, email: email } }).then(function (response) {
                if (angular.isDefined(callbackSuccess)) callbackSuccess(response.data);
            });
        }
    };

    $scope.ou_addUserToRole = function () { 
        var userList = [];
        var emailList = '';
        angular.forEach($scope.ou_availableUserTable.displayed, function (item) {
            if (item.selected == true) {
                userList.push({
                    user_id: item.Id,
                    email: item.Email,
                    organization_unit_id: $scope.ou_selectedOrganizationUnit.id
                });
                if (emailList == '') {
                    emailList = item.Email;
                } else {
                    emailList +=  ', ' + item.Email;
                }
            }
        })
        if (userList.length == 0) return;
        $timeout(function () {
            ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
                ultilService.translate("Do you want to add user {{email_list}} into organization unit {{name}}",
                {
                    email_list: emailList,
                    name: $scope.ou_selectedOrganizationUnit.name
                }),
                function () { 
                    organizationUnitService.addUserOfOrganizationUnit(userList).then(function (response) { 
                        if (response.data == true) {
                            ultilService.showSuccessMessage(ultilService.translate('User has been added to organization unit!'));
                            $scope.reloadAssignUserTable();
                            $scope.ou_availableUserTable.isSelectedAllAvailable = false;
                        } else {
                            ultilService.showErrorMessage(ultilService.translate('Failed to add user to organization unit'));
                        }
                    })
                }, null);
        }, 300);
    }

    $scope.ou_removeUserToRole = function () { 
        var userList = [];
        var emailList = '';
        angular.forEach($scope.ou_assignedUserTable.displayed, function (item) {
            if (item.selected == true) {
                userList.push(item.OrganizationUserId
                );
                if (emailList == '') {
                    emailList = item.Email;
                } else {
                    emailList += ', ' + item.Email;
                }
            }
        });
        if (userList.length == 0) return;
        $timeout(function () {
            ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
                ultilService.translate("Do you want to remove user {{email_list}} of organization unit {{name}}",
                {
                    email_list: emailList,
                    name: $scope.ou_selectedOrganizationUnit.name
                }),
                function () { 
                    organizationUnitService.removeUserOfOrganizationUnit(userList).then(function (response) { 
                        if (response.data == true) {
                            ultilService.showSuccessMessage(ultilService.translate('User has been removed to organization unit!'));
                            $scope.reloadAssignUserTable();
                            $scope.ou_assignedUserTable.isSelectedAllAvailable = false;
                        } else {
                            ultilService.showErrorMessage(ultilService.translate('Failed to remove user of organization unit'));
                        }
                    })
                }, null);
        }, 300);
    }

    $scope.ou_updateOrganizationUnit = function () {
        var ouData = {
            id: $scope.ou_selectedOrganizationUnit.id,
            name: $scope.ou_selectedOrganizationUnit.name,
            description: $scope.ou_selectedOrganizationUnit.description,
            parent_id: $scope.ou_selectedOrganizationUnit.parent_id,
            product_version_id: $scope.ou_selectedOrganizationUnit.product_version_id,
            ui_version : $scope.ou_selectedOrganizationUnit.ui_version
        } 
        organizationUnitService.updateOrganizationUnit(ouData).then(function (response) {
            if (response.data == true) {
                ultilService.showSuccessMessage(ultilService.translate('Organization unit has been moved!'));
                $scope.ou_updateNodeOnTree($scope.ou_data);
                $scope.isChangeRoleNameOrDescription = false;
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
                        node[i].product_version_id = $scope.ou_selectedOrganizationUnit.product_version_id;
                        node[i].ui_version = $scope.ou_selectedOrganizationUnit.ui_version;
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

    $scope.initTree = function () {
        organizationUnitService.getAllOrganizationUnit().then(function (response) {
            $scope.buildTree(response.data);
            
        })
    }

    $scope.initTree();

    $scope.list_role = [
        
    ]

    $scope.getAllAvailableRole = function () {
        organizationUnitService.getAllRole().then(function (response) {
            $scope.list_role = response.data; 
        })
    }

    $scope.getAllAvailableRole();

    $scope.availableRoles = [];
    $scope.ou_roleData = {
        default_roles: [
           
        ],
        mandatory_roles: [
           
        ],
        allowable_roles: [
            
        ]
    }
    $scope.selectedRoles = null;

    $scope.checkBoxChange = function (roleItem, obj) { 
        if (angular.isDefined(roleItem.selected)) {
            if (roleItem.selected == true) { 
                roleItem.selected = false;
            } else { 
                roleItem.selected = true;
            } 
        } else { 
            roleItem.selected = false;
        } 
    }
    $scope.ou_CheckAllAvailableRole = function () {
        $scope.isSelectedAllAvailableRole = !$scope.isSelectedAllAvailableRole;
        angular.forEach($scope.availableRoles, function (item) {
            item.selected = $scope.isSelectedAllAvailableRole;
        });
    }

    $scope.ou_getSelectedRoles = function(isGetAll){
        var roleList = [];
        if (angular.isUndefined(isGetAll) || isGetAll == false) {
            if ($scope.tabIndex == 0) {
                roleList = $scope.selectedRoles.default_roles;
            } else if ($scope.tabIndex == 1) {
                roleList = $scope.selectedRoles.mandatory_roles;
            } else if ($scope.tabIndex == 2) {
                roleList = $scope.selectedRoles.allowable_roles;
            }
        } else if (isGetAll == true) {
            roleList = roleList.concat($scope.selectedRoles.default_roles);
            roleList = roleList.concat($scope.selectedRoles.mandatory_roles);
            roleList = roleList.concat($scope.selectedRoles.allowable_roles);
        }
        return roleList;
    }
    $scope.ou_CheckAllRole = function () {
        
        $scope.isSelectedAllRole = !$scope.isSelectedAllRole;
        
        var roleList =  $scope.ou_getSelectedRoles();
        
        angular.forEach(roleList, function (item) {
            item.selected = $scope.isSelectedAllRole;
        })
    }
    
    $scope.isSelectedAllRole = false;
    $scope.isSelectedAllAvailableRole = false;
    $scope.tabIndex = -1;
    $scope.roleData = [];
    $scope.isChangeRoleDataChanged = false;
    $scope.ou_changeTab = function (index, isNotClickTab) {
        if (angular.isDefined(isNotClickTab) && isNotClickTab == true) { 
            $scope.isChangeRoleDataChanged = false;
        }
        
        if ($scope.tabIndex != index) {
            if ($scope.isChangeRoleDataChanged) {
                ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
                ultilService.translate("Your data has not saved yet, do you want to switch to other tab"),
                function () {
                    $scope.selectedRoles = angular.copy($scope.ou_roleData);
                    $scope.isSelectedAllRole = false;
                    $scope.isSelectedAllAvailableRole = false;
                    $scope.tabIndex = index;
                    $scope.availableRoles = $scope.ou_getAvailableRoles();
                    $scope.roleData = $scope.ou_getSelectedRoles();
                    $scope.isChangeRoleDataChanged = false;
                    
                    $scope.$apply();
                }, null);
            } else {
                $scope.selectedRoles = angular.copy($scope.ou_roleData);
                $scope.isSelectedAllRole = false;
                $scope.isSelectedAllAvailableRole = false;
                $scope.tabIndex = index;
                $scope.availableRoles = $scope.ou_getAvailableRoles();
                $scope.roleData = $scope.ou_getSelectedRoles();
                $scope.isChangeRoleDataChanged = false;
            }
        }
    }
    $scope.ou_getAvailableRoles = function () {
        var result = [];
        var roleList = $scope.ou_getSelectedRoles(true);
        angular.forEach($scope.list_role, function (item) {
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

    $scope.ou_addRole = function () { 
        var roleList = $scope.ou_getSelectedRoles();
        $scope.roleData = [];
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
        if (addedRoleList.length > 0) {
            // Add to selected role
            angular.forEach(addedRoleList, function (item) {
                var addItem = angular.copy(item);
                addItem.selected = false;
                roleList.push(angular.copy(addItem));
            });

            // Remove selected role
            
            $scope.isChangeRoleDataChanged = true;
        }
        $scope.availableRoles = [];
        $timeout(function () {
            $scope.availableRoles = $scope.ou_getAvailableRoles();
            $scope.roleData = roleList;
        }, 500);
        $scope.isSelectedAllAvailableRole = false;
        $scope.isSelectedAllRole = false;
    }
    
    $scope.ou_removeRole = function () {
        $scope.roleData = [];
        $scope.availableRoles = [];
        var roleList = $scope.ou_getSelectedRoles();
        var unCheckedRoles = [];
        var checkedRoles = []
        angular.forEach(roleList, function (item) {
            if (!item.selected) {
                unCheckedRoles.push(item);
            } else {
                checkedRoles.push(item);
            }
        });
        if (checkedRoles.length > 0) {
            $scope.isChangeRoleDataChanged = true;
            roleList = unCheckedRoles;

            if ($scope.tabIndex == 0) {
                $scope.selectedRoles.default_roles = unCheckedRoles;
            } else if ($scope.tabIndex == 1) {
                $scope.selectedRoles.mandatory_roles = unCheckedRoles;
            } else if ($scope.tabIndex == 2) {
                $scope.selectedRoles.allowable_roles = unCheckedRoles;
            }

            

            
        }
        $timeout(function () {
            $scope.roleData = $scope.ou_getSelectedRoles();
            // Remove selected role
            $scope.availableRoles = $scope.ou_getAvailableRoles();
        }, 500)
        $scope.isSelectedAllAvailableRole = false;
        $scope.isSelectedAllRole = false;
        //$scope.$apply();
    }

    $scope.ou_saveRole = function () { 
        var roleList = $scope.ou_getSelectedRoles(); 
        var saveData = [];
        if (roleList.length > 0) {
            angular.forEach(roleList, function (item) {
                saveData.push({
                    role_id: item.id,
                    organization_unit_id: $scope.ou_selectedOrganizationUnit.id,
                    role_status: $scope.tabIndex
                })
            });
        } else {
            saveData.push({
                role_id: 0,
                organization_unit_id: $scope.ou_selectedOrganizationUnit.id,
                role_status: $scope.tabIndex
            });
        }
        organizationUnitService.updateRoleByOrganizationUnit(saveData).then(function (response) {
            if (response.data == true) {
                ultilService.showSuccessMessage(ultilService.translate('Role of organization unit has been updated!'));
                $scope.isChangeRoleDataChanged = false;
                organizationUnitService.getRoleByOrganizationUnit($scope.ou_selectedOrganizationUnit.id).then(function (response) {
                    $scope.ou_roleData = response.data;
                });
            } else {
                ultilService.showErrorMessage(ultilService.translate('Failed to update role of organization unit'));
            }
        });
    }
    $scope.selectedUser = null;
    $scope.roleOfUserData = {
        allowable_roles: [],
        default_roles: []
    };
    $scope.roleOfUserList = [];
    $scope.ou_showRoleOfUser = function (obj) {
        $scope.selectedUser = obj;
        $scope.getRoleOfUserInOrganizationUnit();
           
    }

    $scope.getRoleOfUserInOrganizationUnit = function (index) {
        organizationUnitService.getRolesOfUsersInOrganizationUnit($scope.selectedUser.Id, $scope.ou_selectedOrganizationUnit.id).then(function (response) {
            if (response.data != null) {
                $scope.roleOfUserData = response.data;
                $('#manageRoleModal').modal({ backdrop: 'static', keyboard: false });
                $scope.tabIndex = -1;
                if (angular.isUndefined(index)) {
                    $scope.ou_changeRoleOfTab(0);
                } else {
                    $scope.ou_changeRoleOfTab(index);
                }
            } else {
                ultilService.showErrorMessage(ultilService.translate('Failed to get role of user in organization unit'));
            }
        })
    }

    $scope.ou_changeRoleOfTab = function (index) {
        if ($scope.tabIndex != index) {
            $scope.tabIndex = index;
            if ($scope.tabIndex == 0) {
                $scope.roleOfUserList = $scope.roleOfUserData.default_roles
            } else if ($scope.tabIndex == 2) {
                $scope.roleOfUserList = $scope.roleOfUserData.allowable_roles
            }
            $timeout(function () {
                $scope.$apply();
            }, 300);
        }
    }

    $scope.ou_removeRoleOfUser = function (role) { 
        ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
            ultilService.translate("Do you want to revoke role {{role_name}}", {role_name: role.description}),
            function () {
                var updateData = {
                    user_id: $scope.selectedUser.Id,
                    organization_unit_id: $scope.ou_selectedOrganizationUnit.id,
                    role_id: role.id,
                    status: 0
                }
                organizationUnitService.updateRolesOfUsersInOrganizationUnit(updateData).then(function (response) {
                    if (response.data == true) {
                        ultilService.showSuccessMessage(ultilService.translate('Role of user in organization unit has been revoked!'));
                        $scope.getRoleOfUserInOrganizationUnit($scope.tabIndex);
                    } else {
                        ultilService.showErrorMessage(ultilService.translate('Failed to revoke role of user in organization unit'));
                    }
                });                
            },
            null
        );
    }
    $scope.ou_addRoleOfUser = function (role) { 
        ultilService.ShowDialog($rootScope, ultilService.translate("Confirm"), '',
           ultilService.translate("Do you want to assigned role {{role_name}}", { role_name: role.description }),
           function () {
               var updateData = {
                   user_id: $scope.selectedUser.Id,
                   organization_unit_id: $scope.ou_selectedOrganizationUnit.id,
                   role_id: role.id,
                   status: 1
               }
               organizationUnitService.updateRolesOfUsersInOrganizationUnit(updateData).then(function (response) {
                   if (response.data == true) {
                       ultilService.showSuccessMessage(ultilService.translate('Role of user in organization unit has been assigned!'));
                       $scope.getRoleOfUserInOrganizationUnit($scope.tabIndex);
                   } else {
                       ultilService.showErrorMessage(ultilService.translate('Failed to assign role of user in organization unit'));
                   }
               });
           },
           null
       );
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
    $scope.listVersion = [];
    $scope.selectedEnvironmentVersion = '';
    $scope.listProductVersion = [];
    $scope.getListProductVersion = function () {
        $scope.listVersion = [];
        parameterService.getListProductVersion().then(function (obj) {
            if (obj != null) {

                
                $scope.listProductVersion = obj.data;
                angular.forEach($scope.listProductVersion, function (item) {
                    $scope.listVersion.push({
                        id: item.id,
                        name: item.name + ' - ' + item.version
                    })
                });
            }
        });
    };
    $scope.getListProductVersion();
    $scope.getProductVersionId = function () {
        var versionId = null; 
        for (var i = 0; i < $scope.listProductVersion.length; i++) {
            if (($scope.listProductVersion[i].name + "-" + $scope.listProductVersion[i].version) == $scope.selectedEnvironmentVersion) {
                versionId = $scope.listProductVersion[i].id;
                break;
            }
        }
        return versionId;
    };
    $scope.onChangeVersion = function (obj) {
        $scope.selectedEnvironmentVersion = obj; 
    }
    $scope.list_ui_version = [];
    $scope.getListUiVersion = function () { 
        organizationUnitService.getListUIVersion().then(function (obj) {
            if (obj.data != null) {
                var listUI = obj.data;
                angular.forEach(listUI, function (item) {
                    $scope.list_ui_version.push({
                        id: item,
                        name: item
                    });
                });
            }
        });
    }
    $scope.getListUiVersion();
}]);


