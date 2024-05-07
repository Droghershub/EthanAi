btoApp.controller('SharingController', [
       '$scope', 'sharingService', '$timeout', '$rootScope', 'timelineService', '$templateCache', 'ultilService',
       function ($scope, sharingService, $timeout, $rootScope, timelineService, $templateCache, ultilService) {                     
           sharingService.GetViewers($('#userNameKeyId').val()).then(
                        function (obj) {
                            if (obj != null) {
                                $rootScope.viewers = obj.data;
                            }
                        }
                  );
       }]
 );
