btoApp.service('newsService', function ($rootScope, utilService, $timeout, CONFIG) {
    //console.log('init');
    utilService.callApi('GET', '/api/news/get_news_list/' + user_id, '', '', function (response) {
        
        angular.forEach(response, function (item) {
            if (item.opening_time_trigger != 0) {
                $timeout(function () {
                    console.log(item.news_content);
                    utilService.updateHeaderMessage(item.news_content, null, 5)
                }, item.opening_time_trigger * 60000);
            }
        });
        var i = 0;
        angular.forEach(response, function (item) {
            if (item.opening_time_trigger == 0) {
                i = i + 1;
                $timeout(function () {
                    console.log(item.news_content);
                    utilService.updateHeaderMessage(item.news_content, null, 5)
                }, i * 10000);
            }
        });
    });
    this.init = function () {
        
    }
    
    this.updateChart = function () {
      //  console.log('update tax optimization chart');
    }

    return this;
});