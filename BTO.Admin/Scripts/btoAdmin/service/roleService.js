btoApp.factory('roleService',
function ($rootScope, $timeout, $http) {
    this.initRoleModel= function () {
        var result = {
            id: null,
            parent_id: null,
            name: null,
            description: null
        }
        return result; 
    }
    this.getAllRole = function () {
        return $http({
            method: 'GET',
            async: false,
            url: '/api/usermanagement/role'
        }); 
    }
    this.updateRole = function(data){
        return $http({
            method: 'POST',
            async: false,
            url: '/api/usermanagement/role',
            data : data
        });
    }
    this.deleteRole = function (data) {
        return $http({
            method: 'POST',
            async: false,
            url: '/api/usermanagement/role/'+data
        });
    }
    this.addRole = function (data) {
        return $http({
            method: 'POST',
            async: false,
            url: '/api/usermanagement/role/add',
            data : data
        });
    }
    this.getAllFunction = function () {
        return $http({
            method: 'GET',
            async: false,
            url: '/api/usermanagement/get_all_functions'
        });
    }
    this.getAllFunctionByRole = function (id) {
        return $http({
            method: 'GET',
            async: false,
            url: '/api/usermanagement/get_all_functions_by_role/'+ id
        });
    }
    this.saveFunctionRole = function (data) {        
        return $http({
            method: "POST",
            async: false,
            url: '/api/usermanagement/update_function_for_role',
            data :  data
        });
        
    }
    return this;
});