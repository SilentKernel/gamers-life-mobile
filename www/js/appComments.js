angular.module('gamers-life.comments', ['gamers-life.constant', 'gamers-life.utils'])
    .service("appComments", function ($http, $ionicPopup, appConst, appUtils) {
        this.getQuoteComments = function (callBack, commentArray, quoteID) {
            if (appUtils.isConnected) {
                var PageToLoad = appUtils.nextPage(commentArray);
                var Url = appConst.apiCommentQuote.replace("POSTID", quoteID).replace("PAGEID", PageToLoad);

                $http.get(appConst.apiUrl + Url).then(
                    function (response) // that's ok !
                    {
                        if (typeof response.data.maxItems != "undefined") {
                            // keep how many items to show
                            appUtils.setMaxItem(response.data.maxItems, "QComment-" + quoteID);
                        }
                        callBack(response.data.comments, response.status);
                    }, function (response) // error
                    {
                        var status = response.status;
                        if (status === 0) {
                            status = 404;
                        }
                        callBack([], status);
                    });
            }
            else {
                callBack([], 0);
            }
        };

        this.getReportedComments = function () {
            var ARComment = localStorage.getItem(appConst.reportedComments);
            if (ARComment !== null) {
                return JSON.parse(ARComment);
            }
            else {
                return [];
            }
        };

        this.setReportedComments = function (reportedArray) {
            localStorage.setItem(appConst.reportedComments, JSON.stringify(reportedArray));
        };

        this.reportComment = function (comment) {
            var alreadyReportedComments = this.getReportedComments();
            // Check if report request already sent ?
            if (alreadyReportedComments.indexOf(comment.id) > -1) {
                appUtils.showShortMessage("Commentaire déjà signalé", "error");
            }
            // Are we connected to internet ?
            else if (!appUtils.isConnected()) {
                appUtils.showShortMessage("Aucune connexion internet", "error");
            }
            // then wee can talk to the server !
            else {
                var reportCallBack = function (comment, appComment) {
                    $http.get(appConst.apiUrl + appConst.apiReporteComment.replace("COMMENTID", comment.id))
                        .then(function (response) // Got answer from server
                        {
                            if (response.data.success) {
                                alreadyReportedComments.push(comment.id);
                                appComment.setReportedComments(alreadyReportedComments);
                                appUtils.showShortMessage("Message signalé, merci", "success");
                            }
                            else {
                                appUtils.showShortMessage("Commentaire introuvable", "error");
                            }
                        }, function (response) // Error from server
                        {
                            appUtils.showShortMessage("Erreur inconnu", "error");
                        });
                };

                var appComment = this;
                $ionicPopup.confirm({
                    title: "Signaler un commentaire",
                    template: "Êtes-vous sûr de voulour signaler le commentaire de " + comment.author + " ?",
                    cancelText: "Non",
                    okText: "Oui"
                }).then(function (res) {
                    if (res) {
                        reportCallBack(comment, appComment);
                    }
                });
            }
        };
    });
