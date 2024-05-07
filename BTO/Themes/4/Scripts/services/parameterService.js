btoApp.service('parameterService', function ($rootScope, utilService, $timeout, CONFIG) {
    //console.log('init');
    
    this.init = function () {
        
    }
    
    this.UpdateParameter = function (product_version_id, parameterId) {
        //console.log('UpdateParameter: ' + product_version_id + ' parameterId: ' + parameterId);
        utilService.callApi('GET', '/api/parameter/get_detail_parameter/' + parameterId, '', '', function (response) {
            angular.forEach(response, function (item) {              
                if (item.type == 0)
                {
                    $rootScope.cashFlow.formula_parameter[item.name.replace("rule_", "")] = item.is_choose_formula;
                }                
            });
           
        });
    }

    return this;
});