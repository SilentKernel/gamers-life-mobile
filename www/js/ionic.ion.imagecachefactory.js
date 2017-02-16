angular.module('ionic.ion.imageCacheFactory', [])

    .factory('$ImageCacheFactory', ['$q', '$timeout', function ($q, $timeout) {
        return {
            Cache: function (urls) {
                var promises = [];

                var onLoadFunc = (function (deferred) {
                    return function () {
                        deferred.resolve();
                    };
                });

                var onErrorFunc = (function (deferred, url) {
                    return function () {
                        deferred.reject(url);
                    };
                });

                for (var i = 0; i < urls.length; i++) {
                    var deferred = $q.defer();
                    var img = new Image();

                    img.onload = onLoadFunc(deferred);
                    img.onerror = onErrorFunc(deferred, urls[i]);

                    promises.push(deferred.promise);
                    img.src = urls[i];
                }
                return $q.all(promises);
            }
        };
    }]);
