angular.module('gamers-life.utils', ['ionic', 'gamers-life.constant', 'jett.ionic.content.banner'])

    .service("appUtils", function ($ionicActionSheet, $ionicContentBanner, $ionicPopup, appConst) {
        this.isConnected = function () {
            if (window.Connection) {
                return (navigator.connection.type != Connection.NONE);
            }
            else {
                return true;
            }
        };

        this.openLinkInBrowser = function (url) {
            if (window.cordova && cordova.InAppBrowser) {
                cordova.InAppBrowser.open(url, '_system', 'location=yes');
            }
            else {
                window.open(url, "_blank");
            }
        };

        this.SocialMediaLink = function () {
            var title = "Partage";
            var likeFbPageTxt = "Aimer notre page Facebook";
            var followTwitterTxt = "Suivre notre compte Twitter";
            var cancelButtonTxt = 'Fermer';
            var appUtils = this;

            // use native actionSheet
            if (window.cordova && window.plugins.actionsheet) {
                var nativeCallback = function (buttonIndex) {
                    // 1 facebook - 2 Twitter
                    if (buttonIndex == 1) {
                        appUtils.openLinkInBrowser(appConst.fbUrl);
                    }
                    else if (buttonIndex == 2) {
                        appUtils.openLinkInBrowser(appConst.twitterUrl);
                    }
                };

                var options = {
                    'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_DARK, // default is THEME_TRADITIONAL
                    'title': title,
                    'buttonLabels': [likeFbPageTxt, followTwitterTxt],
                    'androidEnableCancelButton': true, // default false
                    'addCancelButtonWithLabel': cancelButtonTxt
                };

                window.plugins.actionsheet.show(options, nativeCallback);
            }
            else // there is no native actionsheet
            {
                var HTMLCallback = function (buttonIndex) {
                    // 1 facebook - 2 Twitter
                    if (buttonIndex === 0) {
                        appUtils.openLinkInBrowser(appConst.fbUrl);
                    }
                    else if (buttonIndex == 1) {
                        appUtils.openLinkInBrowser(appConst.twitterUrl);
                    }
                };
                // use html view
                $ionicActionSheet.show({
                    buttons: [
                        {text: '<i class = "icon ion-social-facebook"></i> ' + likeFbPageTxt},
                        {text: '<i class = "icon ion-social-twitter"></i> ' + followTwitterTxt}
                    ],
                    titleText: title,
                    cancelText: cancelButtonTxt,
                    buttonClicked: HTMLCallback
                });
            }
        };

        this.currentPlatform = null;
        this.platformString = function () {
            if (this.currentPlatform === null) {
                if (ionic.Platform.isIOS()) {
                    this.currentPlatform = "iOS";
                }
                else {
                    this.currentPlatform = "Android";
                }
            }
            return this.currentPlatform;
        };

        this.showShortMessage = function (message, messageType) {
            if (ionic.Platform.isAndroid()) {
                if (window.cordova && typeof window.plugins != "undefined") {
                    window.plugins.toast.showShortBottom(message);
                }
            }
            else {
                $ionicContentBanner.show({
                    text: [message],
                    type: messageType,
                    autoClose: 2000
                });
            }
        };

        this.appVersion = function (callBack) {
            if (window.cordova && cordova.getAppVersion) {
                cordova.getAppVersion.getVersionNumber()
                    .then(function (version) {
                        callBack(version);
                    });
            }
            // if we are not in cordova !
            else {
                callBack(0);
            }
        };

        this.nextPage = function (pageArray) {
            if (typeof pageArray != "undefined") {
                var lengthArray = pageArray.length;

                if (lengthArray < appConst.apiObjectPerPage) {
                    return 1;
                }
                else {
                    return ((lengthArray + appConst.apiObjectPerPage) / appConst.apiObjectPerPage);
                }
            }
            else return 1;
        };

        this.maxItems = [];
        this.moreToShow = function (pageArray, context) {
            if (context == "gl-random") {
                return false;
            }
            else if (typeof pageArray != "undefined" && typeof this.maxItems[context] != "undefined") {
                return (pageArray.length < this.maxItems[context]);
            }
            return false;
        };

        this.setMaxItem = function (itemCount, context) {
            if (context != "gl-random") {
                this.maxItems[context] = itemCount;
            }
        };

        this.getMaxItem = function (context) {
            return this.maxItems[context];
        };

        this.ConnexionErrorQuestion = function (statusCode, callBack) {
            var title = "";
            var question = "";

            if (status === 0) {
                title = "Pas de connexion internet";
                question = "Voulez-vous ré-essayer ? (Activez votre connexion internet avant de cliquer sur Oui)";
            }
            else {
                title = "Réponse incompréhensible";
                question = "La réponse envoyée par le serveur ne peut pas être traitée, voulez-vous ré-essayer ?";
            }

            $ionicPopup.confirm({
                title: title,
                template: question,
                cancelText: "Non",
                okText: "Oui"
            }).then(function (res) {
                if (res) {
                    callBack();
                }
            });
        };
    });
