var btoApp = angular.module('btoApp', ['ui.router', 'ngMessages', 'pascalprecht.translate', 'ngCookies', 'ngStorage', 'ui.tree', 'treasure-overlay-spinner', 'smart-table', 'pretty-checkable', 'ui.checkbox', 'ng-bootstrap-datepicker']);

btoApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('manage_parameters', {
        url: "/manage_parameters",
        templateUrl: '/Admin/Parameters',
        controller: 'ParametersController'
    }).state('mamange_users', {
        url: "/manage_users",
        templateUrl: '/Admin/ManageUser',
        controller: 'ManageUserController'
    }).state('organization_unit', {
        url: "/organization_unit",
        templateUrl: '/Admin/OrganizationUnit',
        controller: 'OrganizationUnitController'
    })
    .state('other_action', {
        url: "/other_action",
        templateUrl: '/Admin/OtherAction',
        controller: 'OtherActionController'
    })
    .state('manage_role', {
        url: "/manage_role",
        templateUrl: '/Admin/manageRole',
        controller: 'ManageRoleController'
    })
    .state('extractData', {
        url: "/extractData",
        templateUrl: '/Admin/extractData',
        controller: 'ExtractDataController'
    })
    .state('manage_news', {
        url: "/manage_news",
        templateUrl: '/Admin/ManageNews',
        controller: 'ManageNewsController'
    });
    $urlRouterProvider.otherwise("/manage_parameters");
}]);
var rootScope = null;
btoApp.run(function ($rootScope, $translate, $cookies, $localStorage, $filter) {
    $rootScope.successMessage = {
        show: false,
        message: ''
    }
    // warning message
    $rootScope.warningMessage = {
        show: false,
        message: ''
    }
    // error message
    $rootScope.errorMessage = {
        show: false,
        message: ''
    }
    $rootScope.spinner = {
        active: false,
        on: function () {
            this.active = true;
        },
        off: function () {
            this.active = false;
        }
    };
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

    $rootScope.PersonaPlan = {};
    $rootScope.isAdmin = true;
    rootScope = $rootScope;
    $rootScope.showProfileDialog = function () {
        
    }

    $rootScope.translate = function (text, valueObj) {
        return $filter('translate')(text, valueObj);
    }
})
btoApp.config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        url: '',
        prefix: '/Content/translates/',
        suffix: '.json'
    });
});

