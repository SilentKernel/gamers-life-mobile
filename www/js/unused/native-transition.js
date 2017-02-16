angular.module('nativeTransition', ['ionic'])

    .service("nativeTransition", [function ($ionicConfigProvider) {
        this.init = function () {
            if (typeof window.activeNativeTransition == "undefined") {
                alert("salut");
                if (window.cordova && window.plugins && window.plugins.nativepagetransitions) {
                    alrt("in");
                    // default plugin var
                    window.plugins.nativepagetransitions.globalOptions.duration = 300;
                    window.plugins.nativepagetransitions.globalOptions.iosdelay = 50;
                    window.plugins.nativepagetransitions.globalOptions.androiddelay = 50;
                    window.plugins.nativepagetransitions.globalOptions.winphonedelay = 50;
                    window.plugins.nativepagetransitions.globalOptions.slowdownfactor = 4;
                    // these are used for slide left/right only currently
                    window.plugins.nativepagetransitions.globalOptions.fixedPixelsTop = 0;
                    window.plugins.nativepagetransitions.globalOptions.fixedPixelsBottom = 0;

                    // the plugin is correctly init so remove ionic animation.
                    $ionicConfigProvider.views.transition('none');
                    window.activeNativeTransition = true;
                }
                else {
                    // we can't init this plugin ...
                    window.activeNativeTransition = false;
                }
            }
        };

    }]);
