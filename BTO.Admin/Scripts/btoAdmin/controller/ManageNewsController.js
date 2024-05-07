btoApp.controller('ManageNewsController', ['$scope', 'ultilService', 'manageNewService', '$rootScope', '$timeout', '$filter',
function ($scope, ultilService, manageNewService, $rootScope, $timeout, $filter) {
    $rootScope.scope = $scope;
    

    $scope.startingDatePickerOptions = {
        format: 'dd-mm-yyyy',
        language: 'en',
        startDate: "01-01-2015",
        endDate: "01-01-2018",
        autoclose: true,
        weekStart: 0
    }

    $scope.expirationDatePickerOptions = {
        format: 'dd-mm-yyyy',
        language: 'en',
        startDate: "01-01-2015",
        endDate: "01-01-2018",
        autoclose: true,
        weekStart: 0
    }
    

    $scope.listNews = [];
    $scope.selectedNew = null;
    $scope.selectedTab = 1;
    $scope.selectNewToAdd = function () {
        $scope.backupSelectNew = null;
        $scope.selectedTab = 1;
        $scope.selectedNew = manageNewService.initDefaultNew();
        $scope.updateDateRange();
        console.log($scope.selectedNew);
    }
    $scope.backupSelectNew = null;
    $scope.selectNewToEdit = function (item) {
        if ($scope.selectedNew == null || ($scope.selectedNew != null && $scope.selectedNew.id != item.id)) {
            // Check have change data
            if ($scope.selectedNew != null && $scope.selectedNew.id != item.id) {

            }
            //else {
                $scope.backupSelectNew = angular.copy(item);
                $scope.selectedTab = 1;  
                $scope.selectedNew = item;
                $scope.getOrganizationUnitByNew(item.id);
                $scope.updateDateRange();
            //}
                
        }
        
    }

    $scope.updateDateRange = function () {
        if ($scope.selectedNew != null) {
            var starting_date = new Date($scope.selectedNew.starting_date);
            var expiration_date = new Date($scope.selectedNew.expiration_date);
            $scope.selectedNew.starting_date = starting_date;
            $scope.selectedNew.expiration_date = expiration_date;
            $scope.startingDatePickerOptions.endDate = expiration_date;
            $scope.startingDatePickerOptions.startDate = new Date(starting_date);
            $scope.startingDatePickerOptions.startDate.setFullYear(starting_date.getFullYear() - 1);

            $scope.expirationDatePickerOptions.startDate = starting_date;
            $scope.expirationDatePickerOptions.endDate = new Date(expiration_date);
            $scope.expirationDatePickerOptions.endDate.setFullYear(expiration_date.getFullYear() + 1);
        }
    }

    $scope.selectTab = function (index) {
        $scope.selectedTab = index;
        if ($scope.selectedTab == 1) {

        } else if ($scope.selectedTab == 2) {

        } else if ($scope.selectedTab == 3) {

        }
    }

    $scope.ou_treeOptions = {
        dropped: function (e) {
            console.log(e);
        }
    };

    $scope.getOrganizationUnitByNew = function (new_id) {
        manageNewService.getAllOrganizationUnitByNew(new_id).then(function (response) {
            $scope.buildTree(response.data);
        })
    }
    $scope.ou_data = [];
    $scope.buildTree = function (data) {
        $scope.ou_data = [];
        $scope.ou_data = $scope.getNestedChildren(data, null);
    };


    $scope.getNestedChildren = function (data, id) {
        var out = []
        for (var i in data) {
            if (data[i].parent_id == id) {

                var childrens = $scope.getNestedChildren(data, data[i].id)
                if (childrens.length > 0) {
                    data[i].childrens = childrens
                } else {
                    data[i].childrens = [];
                }
                out.push(data[i])
            }
        }
        return out
    }

    $scope.ou_asign = function (item) {
        console.log(item);
    }

    $scope.ou_remove = function (item) {
        console.log(item);
    }
 

    $scope.saveNew = function () {
        
        console.log($scope.selectedNew.starting_date, $scope.selectedNew.expiration_date);
       
        manageNewService.saveNew($scope.selectedNew).then(function () {
            console.log('save new success')
        })
        
    }

    $scope.updateNew = function () {
        
        console.log($scope.selectedNew.starting_date, $scope.selectedNew.expiration_date);
        
        manageNewService.updateNew($scope.selectedNew).then(function () {
            console.log('save new success')
        })
        
    }

    $scope.confirmDelete = function (item) {
        ultilService.ShowDialog(
            $rootScope, ultilService.translate("Confirm"), '',
            ultilService.translate("Do you want to remove news: {{new_name}}",
            {
                new_name: item.news_content
            }),
            function () {
                $scope.deleteNew(item.id);
            }, null);
    }

    $scope.deleteNew = function (id) {
        manageNewService.deleteNew({id:id}).then(function (response) {
            if (response.data == null) {
                ultilService.showErrorMessage(ultilService.translate('Failed to delete new'));
            } else {
                ultilService.showSuccessMessage(ultilService.translate('News has been deleted!'));
                var index = -1;
                for (var i = 0; i < $scope.listNews.length; i++) {
                    if ($scope.listNews[i].id == id) {
                        index = i;
                        break;
                    }
                }
                if (index > 1) {
                    $scope.listNews.splice(index, 1);
                }
            }
        })
    }

    $scope.intManageNews = function () {
        manageNewService.getAllNew().then(function (response) {
            $scope.listNews = response.data;
        });
    }

    $scope.intManageNews();
    console.log('ManageNewsController')
}]);