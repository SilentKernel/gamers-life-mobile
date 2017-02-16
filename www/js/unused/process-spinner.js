angular.module('ionicProcessSpinner', [])

    .directive('ionViewProcessSpinner',
        function () {
            return {
                scope: {
                    'processing': '=',
                },
                restrict: 'E',
                transclude: true,
                template: '<div ng-transclude="" ng-if="!processing"></div>' +
                '<div ng-if="processing" class = "center-loading">' +
                '<ion-spinner class="loading-spinner"></ion-spinner>' +
                '</div>'
            };
        });
