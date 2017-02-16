angular.module('gamers-life.controllers', ["gamers-life.utils", "gamers-life.quotes", "gamers-life.comments", "gamers-life.constant", "gamers-life.utils", "gamers-life.analytics", "gamers-life.quoteImageModal"])

    .controller('AppCtrl', function ($scope, appUtils) {
    })

    .controller('quotesListCtrl', function (quoteImageModal, appAnalytics, appUtils, appConst, appQuotes, quoteCache, $scope, $stateParams, $location, $ionicLoading) {
        // thses var will be used a lot of time !
        var context = $stateParams.context;
        var url = null;
        $scope.isLoadingMore = false;
        $scope.status = 0;
        $scope.disabledPullToRefresh = ionic.Platform.isAndroid();

        // this function can be called at first load and on pull to refresh
        $scope.loadView = function (isRefresh) {
            if (!isRefresh || $scope.disabledPullToRefresh) {
                $ionicLoading.show();
            }

            if (context == "gl-last") {
                $scope.title = "Dernières";
                url = appConst.apiGQuote;
            }
            if (context == "gl-first") {
                $scope.title = "Premières";
                url = appConst.apiFQuote;
            }
            else if (context == "gl-plus") {
                $scope.title = "Les mieux notées";
                url = appConst.apiPQuote;
            }
            else if (context == "gl-least") {
                $scope.title = "Les moins bien notées";
                url = appConst.apiLQuote;
            }
            else if (context == "gl-random") {
                $scope.title = "Au hasard";
                url = appConst.apiRQuote;
            }
            // here games come
            else if (context.slice(0, 2) == "g-") {
                var gameId = parseInt(context.replace("g-", ""));
                $scope.title = appQuotes.getGameInfoById(gameId, appQuotes.getGames()).name;
                url = appConst.apiGameQuote.replace("GAMEID", gameId);
            }

            var loadData = function (isRefresh) {
                appQuotes.getQuotes(function (result, status) {
                    $scope.status = status;
                    $scope.quotes = result;
                    // prevent bug when clicking "Yes when server error"
                    $ionicLoading.hide();

                    if (isRefresh && $scope.disabledPullToRefresh === false) {
                        $scope.$broadcast('scroll.refreshComplete');
                    }

                    if ($scope.status != 200) {
                        appUtils.ConnexionErrorQuestion($scope.status,
                            function () {
                                $ionicLoading.show();
                                $scope.loadView(true);
                            });
                    }

                }, [], url, context);
            };

            // Do not rebind afterEnter event if already done
            if (!isRefresh) {
                appAnalytics.trackV($scope.title);
                $scope.$on("$ionicView.afterEnter", function () {
                    if (typeof $scope.loadedOnce == "undefined") {
                        // Prevent After Event trigger on cached view
                        $scope.loadedOnce = true;
                        loadData(isRefresh);
                    }
                });
            }
            else {
                loadData(isRefresh);
            }
        };
        $scope.loadView(false);

        $scope.moreDataCanBeLoaded = function () {
            return appUtils.moreToShow($scope.quotes, context);
        };

        $scope.loadMore = function () {
            if (!$scope.isLoadingMore) {
                isLoadingMore = true;
                appQuotes.getQuotes(function (result, status) {
                    if (status == 200) {
                        $scope.quotes = $scope.quotes.concat(result);
                    }
                    else {
                        appUtils.showShortMessage("Erreur de l'obtention des GL suivantes", "error");
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.isLoadingMore = false;
                }, $scope.quotes, url, context);
            }
        };

        $scope.shareQuote = function (quote) {
            appQuotes.shareQuote(quote);
        };

        $scope.quoteVote = function (quote, value, index) {
            appQuotes.quoteVote(quote, value, function () {
                if (value == "plus") {
                    $scope.quotes[index].plusOne++;
                }
                else {
                    $scope.quotes[index].leastOne++;
                }
            });
        };

        $scope.quoteComment = function (quote) {
            if (quoteCache.set(quote)) {
                $scope.quotes = $scope.quotes;
                $location.path("/app/quote/comment/" + quote.id);
            }
        };

        $scope.showQuoteImages = function (quote) {
            $ionicLoading.show();
            quoteCache.set(quote);
            quoteCache.asyncPreloadPictures(function () {
                quoteImageModal.showImageModal($scope, quote);
                $ionicLoading.hide();
            }, function () {
                $ionicLoading.hide();
                appUtils.showShortMessage("Erreur lors de l'obtention des images :(", "error");
            });
        };

        // page sharing
        $scope.followSocial = function () {
            appUtils.SocialMediaLink();
        };
    })

    .controller("QuoteCommentCtrl", function ($ionicHistory, $scope, $stateParams,
                                              $ionicModal, $ionicLoading, quoteCache, appComments,
                                              appAnalytics, quoteImageModal, appUtils, appConst) {
        $scope.quote = quoteCache.get();
        var quoteId = $stateParams.quoteId;
        $scope.disabledPullToRefresh = ionic.Platform.isAndroid();
        $scope.avatarDir = appConst.avatarUrl;

        $scope.loadView = function (isRefresh) {
            if (!isRefresh || $scope.disabledPullToRefresh) {
                $ionicLoading.show();
            }

            // this function exist to use same code on pull to refresh
            var loadData = function (isRefresh) {
                appComments.getQuoteComments(function (comments, status) {
                    $scope.comments = comments;
                    $scope.status = status;
                    $scope.nbComments = 1;
                    $ionicLoading.hide();

                    if ($scope.status != 200) {
                        appUtils.ConnexionErrorQuestion($scope.status,
                            function () {
                                $ionicLoading.show();
                                $scope.loadView(true);
                            });
                    }
                    else {
                        $scope.nbComments = appUtils.getMaxItem("QComment-" + $scope.quote.id);
                    }

                    if (isRefresh && $scope.disabledPullToRefresh === false) {
                        $scope.$broadcast('scroll.refreshComplete');
                    }

                }, [], $scope.quote.id);
            };

            if (!isRefresh) {
                appAnalytics.trackV($scope.title);
                $scope.$on("$ionicView.afterEnter", function () {
                    if (typeof $scope.loadedOnce == "undefined") {
                        $scope.loadedOnce = true;
                        quoteCache.asyncPreloadPictures(null, null);
                        loadData(isRefresh);
                    }
                });
            }
            else {
                loadData(isRefresh);
            }
        };

        if ($scope.quote !== null && $scope.quote.id == quoteId) {
            // Here we goo to load comment
            $scope.title = $scope.quote.title;
            appAnalytics.trackV($scope.title + " - commentaires");

            $scope.loadView(false);

            $ionicModal.fromTemplateUrl('quoteModal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.quoteModal = modal;
            });

            $scope.openQuoteModal = function () {
                $scope.quoteModal.show();
            };

            $scope.closeQuoteModal = function () {
                $scope.quoteModal.hide();
            };

            $scope.$on('$destroy', function () {
                $scope.quoteModal.remove();
            });

            $scope.showImages = function () {
                quoteImageModal.showImageModal($scope, $scope.quote);
            };

            $scope.moreDataCanBeLoaded = function () {
                return appUtils.moreToShow($scope.comments, "QComment-" + $scope.quote.id);
            };

            $scope.reportComment = function (comment) {
                appComments.reportComment(comment);
            };

            $scope.isLoadingMore = false;
            $scope.loadMore = function () {
                if (!$scope.isLoadingMore) {
                    $scope.isLoadingMore = true;
                    appComments.getQuoteComments(
                        function (comments, status) {
                            $scope.isLoadingMore = false;
                            if (status == 200) {
                                $scope.comments = $scope.comments.concat(comments);
                            }
                            else {
                                appUtils.showShortMessage("Erreur de l'obtention des commentaires suivants", "error");
                            }
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        }, $scope.comments, $scope.quote.id);
                }
            };
        }
        else {
            $ionicHistory.goBack();
            appUtils.showShortMessage("Commentaire impossible à afficher pour cette GL", "error");
        }
    })

    .controller('GamesListCtrl', function ($scope, $ionicPopup, appUtils, appQuotes, appAnalytics) {
        $scope.title = "Les jeux";

        if (!appUtils.isConnected()) {
            $ionicPopup.alert({
                title: "Pas de connexion internet",
                template: "Pour actualiser la liste des jeux une connexion internet est requise"
            });
        }

        $scope.games = appQuotes.getGames();
        appAnalytics.trackV($scope.title);
    })

    .controller('AboutCtrl', function ($scope, appUtils, appAnalytics) {
        $scope.title = "A propos";
        $scope.platform = appUtils.platformString();
        appUtils.appVersion(function (version) {
            $scope.appVersion = version;
        });
        appAnalytics.trackV($scope.title);
    });
