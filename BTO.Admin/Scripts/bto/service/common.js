btoApp.factory('commonService', [
        '$http',
        function ($http) {

            return {
                calculateResult:function(personaPlan){
                    return $http({
                        method: 'POST',                        
                        url: '/api/common/calculate_basic/',
                        data: personaPlan
                    });
                },
                getListDreamType: function (user_id) {
                    return $http({
                        method: 'GET',
                        url: '/api/dream/GET/' + user_id
                    });
                },
                DeleteDream: function (id) {
                    return $http({
                        method: 'POST',
                        //  async: false,
                        url: '/api/PersonaPlan/deleteDream',
                        data: id
                    });

                },
                 DeleteLifeEvent: function (id) {
                    return $http({
                        method: 'POST',
                        //  async: false,
                        url: '/api/PersonaPlan/deleteLifeEvent',
                        data: id
                    });
                 },
                 ChangePassword: function (obj) {
                     return $http({
                         method: 'POST',
                         url: '/api/ManageUser/ChangePassword',
                         data: obj
                     });
                 },
                 GetExternalLoginProviders: function () {
                     return $http({
                         method: 'GET',
                         url: '/api/ManageUser/ManageExternalLoginProviders'
                     });
                 },
                 DisableLoginProvider: function (obj) {
                     return $http({
                         method: 'POST',
                         url: '/api/ManageUser/DisableLoginProvider',
                         data: obj
                     });
                 },
                 EnableLoginProvider: function (obj) {
                     return $http({
                         method: 'POST',
                         url: '/api/ManageUser/EnableLoginProvider',
                         data: obj
                     });
                 }
            };
        }]);

