btoApp.factory('manageNewService',
function ($rootScope, $timeout, $http) {
    this.initDefaultNew = function () {
        var starting_date = new Date();
        var expiration_date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        var result = {
            "id": null,
            "news_content": "",
            "news_content_en": "",
            "news_content_fr": "",
            "news_content_ma": "",
            "opening_time_trigger": 0,
            "no_activity_time_trigger": 0,
            "prioritization": 1,
            "sequencing": 0,
            "starting_date": starting_date,
            "expiration_date": expiration_date
        };
        return result;
    }

    $rootScope.prioritizationList = [];
    $rootScope.prioritizationList.push({ id: 1, name: "Low Inportance" }, { id: 2, name: "Hight Inportance" });



    this.getAllNew = function () {
        return $http({
            method: 'GET',
            async: false,
            url: '/api/news/getallnews'
        });
    }

    this.saveNew = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/news/addnews',
            data: obj
        });
    }
    this.updateNew = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/news/updatenews',
            data: obj
        });
    }


    this.deleteNew = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/news/deletenews',
            data: obj
        });
    }

    this.getAllOrganizationUnitByNew = function (new_id) {
        console.log('getOrganizationUnitByNew: ' + new_id);
        return $http({
            method: 'GET',
            async: false,
            url: '/api/usermanagement/getall' // Will change later
        });

    }
    
    return this;
})