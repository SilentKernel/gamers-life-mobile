/**
 * Created by SilentKernel on 12/07/2015.
 */

angular.module('gamers-life.quotes', ['gamers-life.constant', 'gamers-life.utils', 'ionic.ion.imageCacheFactory'])

    .service("appQuotes", function ($http, appConst, appUtils) {

        this.gamesList = null;

        this.getGameInfoById = function (gId, gamesArray) {
            for (var i = 0; i < gamesArray.length; i++) {
                if (gamesArray[i].id == gId) {
                    var game = [];
                    game.name = gamesArray[i].name;
                    game.slug = gamesArray[i].slug;
                    return game;
                }
            }
            return null;
        };

        this.addGamesToQuotes = function (gamesArray, quotesArray) {
            for (var i = 0; i < quotesArray.length; i++) {
                quotesArray[i].game = this.getGameInfoById(quotesArray[i].gId, gamesArray);
            }
            return quotesArray;
        };

        this.shareQuote = function (quote) {
            var url = appConst.siteUrl + "jeux/" + quote.game.slug + "/" + quote.slug + "/";
            var message = "#GL - Gamer's Life (" + appUtils.platformString() + ") - " + quote.game.name + " - " + quote.title;
            if (window.cordova && window.plugins.socialsharing) {
                window.plugins.socialsharing.share(message, null, null, url, null,
                    function (response) {
                        appUtils.showShortMessage("Erreur lors du partage :(", "error");
                    });
            }
        };

        this.setGames = function (games) {
            this.gamesList = games;
            localStorage.setItem(appConst.gamesDb, JSON.stringify(games));
        };

        this.getGames = function () {
            if (this.gamesList !== null) {
                return this.gamesList;
            }
            else {
                var gamesJson = localStorage.getItem(appConst.gamesDb);
                if (typeof gamesJson != "undefined") {
                    this.gamesList = JSON.parse(gamesJson);
                    return this.gamesList;
                }
                else {
                    // here wee should ask guy to connect to the internet to get last games list
                    return {};
                }
            }
        };

        this.quoteVote = function (quote, value, successCallback) {
            // subFunction used only here
            var getQuotesVoted = function () {
                var votedQuotes = localStorage.getItem(appConst.votedQuote);
                if (votedQuotes === null) {
                    return [];
                }
                else {
                    return JSON.parse(votedQuotes);
                }
            };

            var setQuotesVoted = function (votedQuotesArray) {
                localStorage.setItem(appConst.votedQuote, JSON.stringify(votedQuotesArray));
            };

            var checkQuoteVoted = function (votedArray, quote) {
                return (votedArray.indexOf(quote.id) > -1);
            };

            // real function begin
            var votedQuotes = getQuotesVoted();
            var alreadyVotedTxt = "Vous avez déjà voté pour la GL #";

            if (!checkQuoteVoted(votedQuotes, quote)) {
                // we can send it to the server
                if (!appUtils.isConnected) {
                    appUtils.showShortMessage("Vous devez être connecté à internet pour voter", "error");
                }
                else {
                    var voteUrl = appConst.apiUrl + appConst.apiVoteQuote.replace("QUOTEID", quote.id).replace("VALUE", value);
                    $http.get(voteUrl).then(
                        function (response) // SucessFull sent to server !
                        {
                            if (response.data.success) {
                                votedQuotes.push(quote.id);
                                setQuotesVoted(votedQuotes);
                                appUtils.showShortMessage("Vote enregistré, merci", "success");
                                successCallback();
                            }
                            else {
                                appUtils.showShortMessage(alreadyVotedTxt + quote.id, "error");
                            }
                        }, function (response) // failed to send to server
                        {
                            appUtils.showShortMessage("Connexion au serveur interrompue pendant le vote", "error");
                        });
                }
            }
            else {
                appUtils.showShortMessage(alreadyVotedTxt + quote.id, "error");
            }
        };

        this.getQuotes = function (getResultFunc, pageArray, url, context) {
            var page = appUtils.nextPage(pageArray);
            var apiPage = url.replace("PAGEID", page);

            if (!appUtils.isConnected()) {
                getResultFunc([], 0);
            }
            else {
                var appDataSrv = this;
                $http.get(appConst.apiUrl + apiPage)
                    .then(function (response) {
                        // NOW we know what is the max item showalbe :p :D
                        if (typeof response.data.maxItems != "undefined") {
                            appUtils.setMaxItem(response.data.maxItems, context);
                        }
                        var games = null;
                        if (typeof response.data.games != "undefined") {
                            // keep games in local
                            appDataSrv.setGames(response.data.games);
                            games = response.data.games;
                        }
                        else {
                            games = appDataSrv.getGames();
                        }

                        getResultFunc(appDataSrv.addGamesToQuotes(games, response.data.quotes), response.status);
                    }, function (response) {
                        var status = response.status;
                        if (status === 0) {
                            status = 404;
                        }
                        // Connexion problem :s
                        getResultFunc([], status);
                    });
            }
        };
    })
    .service("quoteCache", function ($timeout, $ImageCacheFactory, appUtils, appConst) {
        this.cachedQuote = null;

        this.get = function () {
            return this.cachedQuote;
        };

        this.preloadPictures = function (sucessCallBack, errorCallBack, useCached, sentQuote) {
            if (appUtils.isConnected()) {
                if (this.cachedQuote.hasPicture) {
                    var picturesUrl = [];

                    for (var i = 0; i < this.cachedQuote.pictures.length; i++) {
                        picturesUrl[i] = appConst.quotesImagesUrl + this.cachedQuote.pictures[i];
                    }
                    $ImageCacheFactory.Cache(picturesUrl).then(sucessCallBack, errorCallBack);
                }
                else {
                    if (errorCallBack !== null)
                        errorCallBack();
                }
            }
            else {
                if (errorCallBack !== null)
                    errorCallBack();
            }
        };

        this.asyncPreloadPictures = function (sucessCallBack, errorCallBack) {
            $timeout(function (params) {
                params.quoteCache.preloadPictures(params.PsucessCallBack, params.PerrorCallBack);
            }, 0, true, {quoteCache: this, PsucessCallBack: sucessCallBack, PerrorCallBack: errorCallBack});
        };

        this.set = function (quote) {
            this.cachedQuote = quote;
            if (this.cachedQuote == quote) {
                return true;
            }
            return false;
        };
    });
