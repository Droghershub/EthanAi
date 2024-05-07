btoApp.factory('sharingService', [
        '$http',
        function ($http) {

            return {
                GetViewers: function (representer_mail) {
                    return $http({
                        method: 'POST',
                        async: false,
                        url: '/api/sharing/LoadViewer/',
                        data: { email: representer_mail }
                    });
                }
            };
        }]);

