angular.module('gamers-life.quoteImageModal', ['ionic'])

    .service('quoteImageModal', function ($ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate, appConst, appUtils) {
        this.showImageModal = function ($scope, quote) {
            $scope.quoteImageZoomMin = 1;
            $scope.activeQuoteImageSlide = 0;
            $scope.quoteImages = [];

            for (i = 0; i < quote.pictures.length; i++) {
                $scope.quoteImages[i] = [];
                $scope.quoteImages[i].src = appConst.quotesImagesUrl + quote.pictures[i];
            }

            $ionicModal.fromTemplateUrl("imageModal.html", {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.quoteImageModal = modal;
                $scope.quoteImageModal.show();
                $scope.imageModalShowed = true;
            });

            $scope.closeImageModal = function () {
                $scope.quoteImageModal.hide();
                $scope.imageModalShowed = false;
                $scope.quoteImageModal.remove();
            };

            $scope.updateSlideQuoteImageStatus = function (slide) {
                var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
                if (zoomFactor == $scope.quoteImageZoomMin) {
                    $ionicSlideBoxDelegate.enableSlide(true);
                } else {
                    $ionicSlideBoxDelegate.enableSlide(false);
                }
            };

            // iosBugFix
            $scope.reloadImageModal = function () {
                if ($scope.imageModalShowed) {
                    $scope.quoteImageModal.hide().then(function () {
                        $scope.quoteImageModal.show();
                    });
                }
            };
            if (window.cordova && ionic.Platform.isIOS()) {
                if (typeof $scope.trackScreenRotation == "undefined") {
                    $scope.trackScreenRotation = true;
                    $scope.lastScreenOrientation = screen.orientation;
                    window.addEventListener("orientationchange", function () {
                        if ($scope.lastScreenOrientation != screen.orientation) {
                            $scope.lastScreenOrientation = screen.orientation;
                            $scope.reloadImageModal();
                        }
                    });
                }
            }
            // End of ios Bug fix (hope will be removede soon)

        };
    });
