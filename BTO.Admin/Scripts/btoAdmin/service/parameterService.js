btoApp.factory('parameterService',
function ($rootScope, $timeout, $http) {
    this.getListProductVersion = function () {
        return $http({
            method: 'GET',
            async: false,
            url: '/api/version/get_version'
        }); 
    }

    this.initParameter = function (currentProduct) {
        var result =  {
            id: null,
            product_version_id: null, // angular.copy(currentProduct.id),
            name: null,//'new parameter name',
            description: null,//'new parameter description',
            short_name: null,// 'new parameter short name',
            type: 0,
            default_value: null,
            listItems: null,
            treeData: null,
            min_value: null,
            max_value: null,
            format_number: null,
            method: null,
            parent_id: null,
            editable: true,
            deleteable:  true,
            showType: 0, // 0: add new, 1: view detail, 2: edit,
            nodes:[]
        }
        if (angular.isDefined(currentProduct) && currentProduct != null && angular.isDefined(currentProduct.id)) {
            result.product_version_id = angular.copy(currentProduct.id);
        }
        return result;
    }

    this.getTypeList = function () {
        var result = [
            {
                id: 0,
                name: 'numeric'
            },
            {
                id: 1,
                name: 'list'
            },
            {
                id: 2,
                name: 'tree'
            }
        ];
        return result;
    }, 
    this.getParameters = function (id) {
        return $http({
            method: 'GET',
            async: false,
            url: '/api/parameter/'+id
        }); 
    } 
    this.saveParam = function(obj)
    {        
        return $http({
            method: 'POST',
            url: '/api/parameter/CreateParameter',
            data: obj
        });
    }
    this.removeParam = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/parameter/DeleteParameter',
            data: obj
        });
    }
    this.get_detail_parameter = function(id)
    {
        return $http({
            method: 'GET',
            async: false,
            url: '/api/parameter/get_detail_parameter/' + id
        });
    }
    this.updateParam = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/parameter/UpdateParameter',
            data: obj
        });
    }
    this.updateTreeParam = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/parameter/UpdateTreeParameter',
            data: obj
        });
    }
    this.initNewNodeData = function (parentNode) {
        return {
            id: null,
            default_value: null,
            name: "",
            description: "",
            editable: true,
            max_value: null,
            min_value: null,
            format_number: null,
            method: "",
            parent_id: parentNode.id,
            productVersion: null,
            product_version_id: parentNode.product_version_id,
            type: 2,
            is_formula: false,
            is_choose_formula: false,
            nodes: []
        };
    }

    this.convertNodeData = function (nodeData) {
        var result =  {
            id: nodeData.id,
            default_value: nodeData.default_value,
            name: nodeData.name,
            description: nodeData.description,
            editable: nodeData.editable,
            max_value: nodeData.max_value,
            min_value: nodeData.min_value,
            format_number: nodeData.format_number,
            method: nodeData.method,
            parent_id: nodeData.parent_id,
            productVersion: nodeData.productVersion,
            product_version_id: nodeData.product_version_id,
            type: nodeData.type,
            is_leaf: nodeData.is_leaf,
            is_formula: nodeData.is_formula,
            is_choose_formula: nodeData.is_choose_formula,
            isSummable: nodeData.isSummable
        };
        try { result.default_value = parseFloat(result.default_value); } catch (ex1) { };
        return result;
    }
    this.saveCloneNewVersion = function (data) {
        return $http({
            method: 'POST',
            url: '/api/parameter/CloneProductVersion',
            data: data
        });
    }
    this.saveRuleFileToCurrentVersion = function (data) {
        return $http({
            method: 'POST',
            url: '/api/parameter/SaveRuleFileToCurrentVersion',
            data: data
        });
    }
    return this;
})