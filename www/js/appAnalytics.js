angular.module('gamers-life.analytics', ['gamers-life.constant', 'gamers-life.utils'])
    .service("appAnalytics", function (appConst, appUtils) {
        this.isEnabled = false;

        this.trackE = function (Category, Action, Label, Value) {
            if (this.isEnabled) {
                analytics.trackEvent(Category, Action, Label, Value);
            }
        };

        this.trackAppE = function (Action, Label) {
            this.trackE("App", Action, Label, 100);
        };

        this.trackV = function (Title) {
            if (this.isEnabled) {
                analytics.trackView(Title);
            }
        };

        this.init = function () {
            if (typeof analytics !== "undefined" && typeof ionic !== "undefined" && typeof device !== "undefined") {
                var platform = ionic.Platform.platform();
                var pVersion = ionic.Platform.version();
                analytics.startTrackerWithId(appConst.gaId);
                analytics.setUserId(platform + '-' + device.uuid);
                this.isEnabled = true;
                var appA = this;
                appUtils.appVersion(function (appVersion) {
                    appA.trackAppE("Launch", "Version: " + appVersion + ", OS: " + platform + " " + pVersion + ", Device: " + device.model);
                });
            }
            else {
                this.isEnabled = false;
            }
        };
    });
