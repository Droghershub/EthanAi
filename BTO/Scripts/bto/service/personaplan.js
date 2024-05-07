
btoApp.factory('personaplanService', [
        '$http', '$q',
        function ($http, $q) {
            return {
                managerRequest: function (request, deferredAbort)
                { 
                    var promise = request.then(
                       function (response) { 
                           return (response.data);
                       },
                       function (response) {
                           return ($q.reject("Something went wrong"));
                       }
                   );

                    promise.abort = function () {
                        deferredAbort.resolve();
                    };
                    promise.finally(
                        function () {
                         //   console.info("Cleaning up object references.");
                            promise.abort = angular.noop;
                            deferredAbort = request = promise = null;
                        }
                    );
                    return (promise);
                },
                getPersonaPlan: function (user_id) {
                    return $http({
                        method: 'GET',
                        async:   false,
                        url: '/api/PersonaPlan/GET/' + user_id
                    });
                },
                calculatePersonaPlan: function (user) {
                    var deferredAbort = $q.defer();
                    var request = $http({
                        method: 'POST',
                        async: false,
                        url: '/api/PersonaPlan/calculate/',
                        data: user,
                        timeout: deferredAbort.promise
                    });
                    return this.managerRequest(request, deferredAbort);
                  
                },
                calculateResult: function (personaPlan) {
                    var deferredAbort = $q.defer();
                    var request = $http({
                        method: 'POST',
                        url: '/api/common/calculate_basic/',
                        data: personaPlan,
                        timeout: deferredAbort.promise
                    });
                    return this.managerRequest(request, deferredAbort);
                },
                updatePersonaPlan: function (user) {
                    var deferredAbort = $q.defer();
                    var request  = $http({
                        type: 'POST',
                        method: 'POST',
                        url: '/api/PersonaPlan',
                        data: user,
                        timeout: deferredAbort.promise
                    });
                    return this.managerRequest(request, deferredAbort); 
                },
                changeToCurrentPlan: function (personaPlan) {
                    return $http({
                        type: 'POST',
                        method: 'POST',
                        url: '/api/PersonaPlan/changeToCurrentPlan/',
                        data: personaPlan
                    });
                },
                changeToNewPlan: function (personaPlan) {
                    return $http({
                        type: 'POST',
                        method: 'POST',
                        url: '/api/PersonaPlan/changeToNewPlan/',
                        data: personaPlan
                    });
                },
                calculateIncomeAndExpense: function (personaPlan) {
                    var deferredAbort = $q.defer();
                    var request = $http({
                        method: 'POST',
                        url: '/api/common/calculate_income_expense/',
                        data: personaPlan,
                        timeout: deferredAbort.promise
                    });
                    return this.managerRequest(request, deferredAbort);
                },
                calculateEquityCurve : function (personaPlan) {
                    var deferredAbort = $q.defer();
                    var request = $http({
                        method: 'POST',
                        url: '/api/common/calculate_equity_curve/',
                        data: personaPlan,
                        timeout: deferredAbort.promise
                    });
                    return this.managerRequest(request, deferredAbort);
                },
                calculateIlliquidCurve: function (personaPlan) {
                    var deferredAbort = $q.defer();
                    var request = $http({
                        method: 'POST',
                        url: '/api/common/calculate_illiquid_curve/',
                        data: personaPlan,
                        timeout: deferredAbort.promise
                    });
                    return this.managerRequest(request, deferredAbort);
                },              
                calculateIncomeAndExpenseAsyncFalse: function (personaPlan) { 
                    return $http({
                        method: 'POST',
                        url: '/api/common/calculate_income_expense/',
                        data: personaPlan, 
                    }); 
                },
                CalculateEquityCurveAsyncFalse: function (personaPlan) {
                    return $http({
                        method: 'POST', 
                        url: '/api/common/calculate_equity_curve',
                        data: personaPlan
                    }); 
                },
                CalculateIlliquidCurveAsyncFalse: function (personaPlan) {
                    return $http({
                        method: 'POST',
                        url: '/api/common/calculate_illiquid_curve',
                        data: personaPlan
                    });
                },
                resetUserPlan: function (user_id,status) {
                    var user = { user_id: user_id, status: status };
                    return $http({
                        method: 'POST', 
                        data: user,
                        url: '/api/PersonaPlan/resetplan'
                    });
                },
                CalculateRanking: function (personaPlan) {
                    return $http({
                        method: 'POST',
                        url: '/api/common/calculate_ranking',
                        data: personaPlan
                    });
                },
                GetAllSolution : function (user_id)
                {
                    return $http({
                        method: 'GET',
                        async: false,
                        url: '/api/Solution/GET/' + user_id
                    });
                },
                DeleteSolution : function(list)
                { 
                    return $http({
                        method: 'POST',
                        url: '/api/Solution/DeleteList',
                        data: list
                    });
                },
                UpdateNameSolution : function(item)
                {
                    return $http({
                        method: 'POST',
                        url: '/api/Solution/UpdateName',
                        data: item
                    });
                },
                GetScenario: function (user_id)
                {
                    return $http({
                        method: 'GET',
                        async: false,
                        url: '/api/PersonaPlan/GetScenario/' + user_id
                    });
                },
                UpdateScenario: function (item) {
                    return $http({
                        method: 'POST',                        
                        url: '/api/PersonaPlan/UpdateScenario/',
                        data: item
                    });
                },
                UpdateStatusScenario: function (item) {
                    return $http({
                        method: 'POST',
                        url: '/api/PersonaPlan/UpdateStatusScenario/',
                        data: item
                    });
                },
                CreateNewScenario: function (item) {
                    return $http({
                        method: 'POST',
                        url: '/api/PersonaPlan/CreateNewScenario/',
                        data: item
                    });
                },
                DuplicateScenarios: function (item) {
                    return $http({
                        method: 'POST',
                        url: '/api/PersonaPlan/DuplicateScenarios/',
                        data: item
                    });
                },
                DeleteScenarios: function (item) {
                    return $http({
                        method: 'POST',
                        url: '/api/PersonaPlan/DeleteScenarios/',
                        data: item
                    });
                },
                CloseScenario: function (personaPlan) {
                    return $http({
                        method: 'POST',
                        url: '/api/PersonaPlan/CloseScenario/',
                        data: personaPlan
                    });
                },
                SaveCurrentSolution : function(item)
                {
                    return $http({
                        method: 'POST',
                        url: '/api/Solution/Savesolution',
                        data: item
                    });
                },
                LoadSolution : function(item)
                {
                    return $http({
                        method: 'POST',
                        url: '/api/Solution/Loadsolution',
                        data : item
                    });
                },
                CloseSolution: function () {
                    return $http({
                        method: 'POST',
                        url: '/api/Solution/CloseSolution'
                    });
                },
                SaveAutomatic: function (item) {
                    return $http({
                        method: 'POST',
                        url: '/api/Solution/SaveAutomatic',
                        data: item
                    });
                }, 
            };
        }]);

