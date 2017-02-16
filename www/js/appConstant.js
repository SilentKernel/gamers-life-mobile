// this is the basic informations
angular.module('gamers-life.constant', [])
    .constant('appConst',
        {
            // Api Base URL
            apiUrl: "https://api.gamers-life.fr/",
            // site URLs
            siteUrl: "https://gamers-life.fr/",
            quotesImagesUrl: "https://gamers-life.fr/media/cache/screenshot_mobile/media/",
            avatarUrl: "https://gamers-life.fr/media/cache/avatar_70/media/",
            // Social link
            fbUrl: "https://facebook.com/GamersLifeFR",
            twitterUrl: "https://twitter.com/GamersLife_FR",
            // api get cotent !
            apiGQuote: "global-post-PAGEID.json",
            apiFQuote: "first-post-PAGEID.json",
            apiPQuote: "plus-post-PAGEID.json",
            apiLQuote: "least-post-PAGEID.json",
            apiRQuote: "random-post.json",
            apiGameQuote: "game-post-GAMEID-PAGEID.json",
            apiCommentQuote: "comments-post-POSTID-PAGEID.json",
            // Send content !
            apiVoteQuote: "vote-post-QUOTEID-VALUE.json",
            apiReporteComment: "flag-post-comment-as-reported-COMMENTID.json",
            // Same as server
            apiObjectPerPage: 20,
            // localStorage key
            votedQuote: "voted-quotes",
            reportedComments: "reported-comments",
            //Game keys
            gamesDb: "games",
            // Google Analitycs
            gaId: "UA-69064344-1"
        });
