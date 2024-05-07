var rootScope;
var btoApp = angular.module('btoApp', ['pascalprecht.translate', 'ngCookies', 'ngStorage', 'ngMessages']);
btoApp.run(function ($rootScope, $translate, $cookies, $localStorage, $interval) {
    delete localStorage['translateData'];
    rootScope = $rootScope;
    $rootScope.isFirstLoadView = false;
    $rootScope.userData = {
        Email: "",
        Password: "",
        ConfirmPassword : ""
    }

    $rootScope.registerUserData = {
        isAccountExisted: false,
        Email: "",
        firstName: null,
        lastName: null,
        gender: null // 0: male, 1: female
    }
    $rootScope.selectedLanguage = {
        "code": "en",
        "name": "English"
    }

    $rootScope.listLanguage = [
        { "code": "en", "name": "English" },
        { "code": "ma", "name": "Mandarin" },
        { "code": "hi", "name": "Hindu" },
        { "code": "ml", "name": "Malay" },
        { "code": "sp", "name": "Spanish" },
        { "code": "fr", "name": "French" },
        { "code": "ge", "name": "German" }
    ];

    $rootScope.changeLanguage = function (language) { 
        $cookies.put('_culture', language.code); 
        $rootScope.selectedLanguage = language;
        $translate.use(language.code);
    }
    $rootScope.changeLanguage($rootScope.selectedLanguage);

    var languageCode = $localStorage.languageCode;
    if (angular.isUndefined(languageCode)) {
        $rootScope.changeLanguage($rootScope.selectedLanguage);
    } else {
        angular.forEach($rootScope.listLanguage, function (item) {
            if (item.code == languageCode) {
                $rootScope.selectedLanguage = item;
            }
        });
        $rootScope.changeLanguage($rootScope.selectedLanguage);
    }

    $rootScope.$on('$translateChangeEnd', function (data, language) {
        $localStorage.languageCode = language.language;
    });
    $rootScope.isFirstLoadView = true;
})
btoApp.config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        url: '',
        prefix: '/Content/translates/',
        suffix: '.json'
    });
});
btoApp.filter('msToTime', function () {
    return function (s) {
        function addZ(n) {
            return (n < 10 ? '0' : '') + n;
        }
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        return addZ(hrs) + ':' + addZ(mins) + ':' + addZ(secs) + '.' + ms;
    }
});