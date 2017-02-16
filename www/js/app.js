// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('gamers-life', ['ionic', 'gamers-life.controllers', 'gamers-life.analytics', 'templates'])

    .run(function ($timeout, $ionicPlatform, $location, $rootScope, appAnalytics) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }

            if (window.StatusBar) {
                if (ionic.Platform.isAndroid()) {
                    // Android 5 status bar color :D
                    StatusBar.backgroundColorByHexString("#23262b");
                }
            }
            // load app when wee are ready !
            appAnalytics.init();
            $location.path('/app/quotes/gl-last');
            $rootScope.$apply();
            if (navigator.splashscreen) {
                $timeout(function () {
                    navigator.splashscreen.hide();
                }, 1000);
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        //$ionicConfigProvider.views.forwardCache(true);
        if (ionic.Platform.isAndroid()) {
            $ionicConfigProvider.backButton.text('');
            $ionicConfigProvider.scrolling.jsScrolling(false);
        }
        else if (ionic.Platform.isIOS()) {
            $ionicConfigProvider.backButton.text('Retour');
        }

        $stateProvider
            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "menu.html",
                controller: 'AppCtrl'
            })

            // When we load view from menu we rebuild it from scratch (prevent overload issue)
            .state('app.quotes', {
                url: "/quotes/:context",
                views: {
                    'menuContent': {
                        templateUrl: "quotesList.html",
                        controller: 'quotesListCtrl'
                    }
                }
            })

            // Show Comment of cached quote
            .state('app.qcomment', {
                url: "/quote/comment/:quoteId",
                views: {
                    'menuContent': {
                        templateUrl: "quoteComment.html",
                        controller: 'QuoteCommentCtrl'
                    }
                }
            })

            // games
            .state('app.games', {
                url: "/games/",
                cache: true,
                views: {
                    'menuContent': {
                        templateUrl: "gamesList.html",
                        controller: 'GamesListCtrl'
                    }
                }
            })

            // settings
            .state('app.about', {
                url: "/about/",
                views: {
                    'menuContent': {
                        templateUrl: "about.html",
                        controller: 'AboutCtrl'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        //$urlRouterProvider.otherwise('/app/quotes/last');
    });
