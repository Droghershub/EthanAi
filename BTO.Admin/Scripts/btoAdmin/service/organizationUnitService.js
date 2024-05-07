btoApp.factory('organizationUnitService',
function ($rootScope, $timeout, $http) {
    this.initOrganizationUnit = function () {
        var result = {
            id: null,
            parent_id: null,
            name: null,
            description: null,
            product_version_id: null
        }
        return result;
    }

    

    this.getAllOrganizationUnit = function () {
        return $http({
            method: 'GET',
            async: false,
            url: '/api/usermanagement/getall'
        });
    }
    this.addOrganizationUnit = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/usermanagement/CreateOrganizationUnit',
            data: obj
        });
    }
    this.updateOrganizationUnit = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/usermanagement/UpdateOrganizationUnit',
            data: obj
        });
    }
    this.getAllRole = function () {
        return $http({
            method: 'GET',
            url: '/api/usermanagement/role'
        });
    }
    this.deletedOrganizationUnit = function (id) {
        return $http({
            method: 'POST',
            url: '/api/usermanagement/DeleteOrganizationUnit/',
            data: id
        });
    }
    this.getRoleByOrganizationUnit = function (id) {
        return $http({
            method: 'POST',
            url: '/api/usermanagement/rolebyorganizationunit',
            data: id
        });
    }
    this.updateRoleByOrganizationUnit = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/usermanagement/updaterolebyorganizationunit',
            data: obj
        });
    }

    this.addUserOfOrganizationUnit = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/usermanagement/AddUsersOfOrganizationUnit',
            data: obj
        });
    }
    this.getRolesOfUsersInOrganizationUnit = function (user_id, organization_unit_id) {
        return $http({
            method: 'POST',
            url: '/api/usermanagement/GetRolesOfUsersInOrganizationUnit',
            data: {
                user_id: user_id,
                organization_unit_id: organization_unit_id
            }
        });
    }
    this.updateRolesOfUsersInOrganizationUnit = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/usermanagement/UpdateRolesOfUsersInOrganizationUnit',
            data: obj
        });
    }
    this.removeUserOfOrganizationUnit = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/usermanagement/RemoveUsersOfOrganizationUnit',
            data: obj
        });
    }
    this.getListUIVersion = function () {
        return $http({
            method: 'GET',
            url: '/api/usermanagement/list_theme'
        });
    }
    return this;
})