// reminder to make the file work use   { name: (name that i want it to be), file: "(el html file)" },
<!DOCTYPE html>

<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->


<html lang="en-us">
<head>
<meta charset="utf-8"/>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/bubbls/3dash@76613c9a94533ef9e6ba0e266ae18613700e3d02/style.css"/>
<!-- Yandex Games SDK -->
<script src="https://cdn.jsdelivr.net/gh/bubbls/3dash@76613c9a94533ef9e6ba0e266ae18613700e3d02/v2.02c5b63d689c6bc2f83c.js"></script>
<style>
        /* Убираем выделение по нажатию клавиш */
        canvas:focus {
            outline: none;
        }

        html, body {
            /* Убираем отступы */
            padding: 0;
            margin: 0;
            /* Отключаем скролл и лонгтап на IOS */
            overflow: hidden;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: rgba(0,0,0,0);
            /* Ставим высоту на 100% */
            height: 100%;
        }
    </style>
<!-- Additional head modules -->
</head>
<body class="dark">
<div id="unity-container" class="unity-desktop">
<canvas id="unity-canvas" tabindex="-1"></canvas>
</div>
<div id="loading-cover" style="display:none;">
<div id="unity-loading-bar">
<div id="unity-logo"><img src=""/></div>
<div id="unity-progress-bar-empty" style="display: none;">
<div id="unity-progress-bar-full"></div>
</div>
<div class="spinner"></div>
</div>
</div>
<!-- Additional body modules -->
<script>
        const hideFullScreenButton = "";
        const buildUrl = "";
        const loaderUrl = buildUrl + "https://cdn.jsdelivr.net/gh/bubbls/3dash@76613c9a94533ef9e6ba0e266ae18613700e3d02/Build/GeometryDash.loader.js";
        const config = {
            dataUrl: buildUrl + "https://cdn.jsdelivr.net/gh/bubbls/3dash@76613c9a94533ef9e6ba0e266ae18613700e3d02/Build/GeometryDash.data.unityweb",
            frameworkUrl: buildUrl + "https://cdn.jsdelivr.net/gh/bubbls/3dash@76613c9a94533ef9e6ba0e266ae18613700e3d02/Build/GeometryDash.framework.js.unityweb",
            codeUrl: buildUrl + "https://cdn.jsdelivr.net/gh/bubbls/3dash@76613c9a94533ef9e6ba0e266ae18613700e3d02/Build/GeometryDash.wasm.unityweb",
        streamingAssetsUrl: "StreamingAssets",
            companyName: "DefaultCompany",
            productName: "GeometryDash3d",
            productVersion: "0.1"
        };

        const container = document.querySelector("#unity-container");
        const canvas = document.querySelector("#unity-canvas");
        const loadingCover = document.querySelector("#loading-cover");
        const progressBarEmpty = document.querySelector("#unity-progress-bar-empty");
        const progressBarFull = document.querySelector("#unity-progress-bar-full");
        const spinner = document.querySelector('.spinner');

        const canFullscreen = (function () {
            for (const key of [
                'exitFullscreen',
                'webkitExitFullscreen',
                'webkitCancelFullScreen',
                'mozCancelFullScreen',
                'msExitFullscreen',
            ]) {
                if (key in document) {
                    return true;
                }
            }
            return false;
        }());

        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            container.className = "unity-mobile";
            
        }

        // Фоновое изображение при загрузке игры. При сборке билда код меняется взависимости от настроек проекта.
        
        loadingCover.style.background = "url('https://cdn.jsdelivr.net/gh/bubbls/3dash@76613c9a94533ef9e6ba0e266ae18613700e3d02/logo.png') center / cover";

        loadingCover.style.display = "";

        // Выключаем появление меню при правом клике мыши
        document.addEventListener('contextmenu', event => event.preventDefault());

        // Возвращаем фокус, если кликнули по экрану
        function FocusGame() {
            window.focus();
            canvas.focus();
        }

        window.addEventListener('pointerdown', () => {
            FocusGame();
        });
        window.addEventListener('touchstart', () => {
            FocusGame();
        });

        let StartUnityInstance;
        let myGameInstance = null;
        let ysdk = null;
        let player = null;
        let leaderboard;
        let payments = null;
        let initGame = false;
        let nowFullAdOpen = false;

        const script = document.createElement("script");
        script.src = loaderUrl;
        script.onload = () => {
            StartUnityInstance = function () {
                createUnityInstance(canvas, config, (progress) => {
                    spinner.style.display = "none";
                    progressBarEmpty.style.display = "";
                    progressBarFull.style.width = `${100 * progress}%`;
                }).then((unityInstance) => {
                    myGameInstance = unityInstance;
                    loadingCover.style.display = "none";
                }).catch((message) => {
                    console.error(message);
                });
            };
            if (LocalHost())
                StartUnityInstance_IfUnloaded();
        };

        function StartUnityInstance_IfUnloaded() {
            if (spinner.style.display !== "none")
                StartUnityInstance();
        }

        function LocalHost() {
            var host = window.location.hostname;
            if (host == "localhost" || host == "127.0.0.1")
                return true;
            else return false;
        }

        setTimeout(StartUnityInstance_IfUnloaded, 5000);

        InitYSDK();
        async function InitYSDK() {
            try {
                if (LocalHost()) return;

                console.log('Init Yandex SDK');
                ysdk = await YaGames.init();

                FullAdShow(); // First ad true

                // Additional init modules
cloudSaves = await LoadCloud();
console.log('Init Storage ysdk');

paymentsData = await GetPayments();
console.log('Init Payments ysdk');

environmentData = await RequestingEnvironmentData();
console.log('Init Envir ysdk');

playerData = await InitPlayer();
console.log('Init Player ysdk');


            } catch (e) {
                console.error('CRASH Initialization SDK: ', e);
            }

            StartUnityInstance_IfUnloaded();
        }

        function InitGame() {
            console.log('Init Game Success');
            initGame = true;

            if (nowFullAdOpen == true && myGameInstance != null) {
                myGameInstance.SendMessage('YandexGame', 'OpenFullAd');
            }

            // Additional start modules
        }

        function FullAdShow() {
            try {
                if (nowFullAdOpen !== true && ysdk !== null) {
                    ysdk.adv.showFullscreenAdv(
                        {
                            callbacks: {
                                onOpen: () => {
                                    console.log('Open Ad Interstitial');
                                    nowFullAdOpen = true;
                                    if (initGame === true) {
                                        myGameInstance.SendMessage('YandexGame', 'OpenFullAd');
                                    }
                                },
                                onClose: (wasShown) => {
                                    nowFullAdOpen = false;
                                    if (initGame === true) {
                                        if (wasShown) {
                                            myGameInstance.SendMessage('YandexGame', 'CloseFullAd', 'true');
                                        }
                                        else {
                                            myGameInstance.SendMessage('YandexGame', 'CloseFullAd', 'false');
                                        }
                                    }
                                    FocusGame();
                                },
                                onError: (error) => {
                                    console.error('Error Ad Interstitial', error);
                                    myGameInstance.SendMessage('YandexGame', 'ErrorFullAd');
                                    FocusGame();
                                }
                            }
                        });
                }
            }
            catch (e) {
                console.error('CRASH FullAd Show: ', e.message);
            }
        }

        function RewardedShow(id) {
            try {
                ysdk.adv.showRewardedVideo(
                    {
                        callbacks:
                        {
                            onOpen: () => {
                                console.log('Opened Video Ad. Id: ' + id);
                                myGameInstance.SendMessage('YandexGame', 'OpenVideo');
                            },
                            onClose: () => {
                                console.log('Closed Video Ad. Id: ' + id);
                                myGameInstance.SendMessage('YandexGame', 'CloseVideo');
                                FocusGame();
                            },
                            onRewarded: () => {
                                console.log('Reward Video Ad. Id: ' + id);
                                myGameInstance.SendMessage('YandexGame', 'RewardVideo', id);
                            },
                            onError: (e) => {
                                console.error('Error Video Ad. Id: ' + id, e);
                                myGameInstance.SendMessage('YandexGame', 'ErrorVideo');
                            }
                        }
                    });
            } catch (err) {
                console.error('CRASH Rewarded Video Ad Show: ', err.message);
            }
        }

        function StickyAdActivity(show) {
            try {
                ysdk.adv.getBannerAdvStatus().then(({ stickyAdvIsShowing, reason }) => {
                    if (stickyAdvIsShowing) {
                        if (!show) {
                            ysdk.adv.hideBannerAdv();
                        }
                    }
                    else if (reason) {
                        console.log('Sticky ad are not shown. Reason:', reason);
                    }
                    else if (show) {
                        ysdk.adv.showBannerAdv();
                    }
                })
            } catch (e) {
                console.error('CRASH Sticky Activity: ', e.message);
            }
        }

        function InitLeaderboard() {
            try {
                ysdk.getLeaderboards().then(_lb => {
                    leaderboard = _lb
                    myGameInstance.SendMessage('YandexGame', 'InitializedLB');
                });
            } catch (e) {
                console.error('CRASH Init Leaderboard: ', e.message);
            }
        }

        function SetLeaderboardScores(_name, score) {
            try {
                ysdk.getLeaderboards()
                    .then(leaderboard => {
                        leaderboard.setLeaderboardScore(_name, score);
                    });
            } catch (e) {
                console.error('CRASH Set Leader board Scores: ', e.message);
            }
        }

        function GetLeaderboardScores(nameLB, maxPlayers, quantityTop, quantityAround, photoSize, auth) {
            try {
                var jsonEntries = {
                    technoName: '',
                    isDefault: false,
                    isInvertSortOrder: false,
                    decimalOffset: 0,
                    type: '' // , title: ''
                };

                ysdk.getLeaderboards()
                    .then(leaderboard => leaderboard.getLeaderboardDescription(nameLB))
                    .then(res => {
                        jsonEntries.technoName = nameLB;
                        jsonEntries.isDefault = res.default;
                        jsonEntries.isInvertSortOrder = res.description.invert_sort_order;
                        jsonEntries.decimalOffset = res.description.score_format.options.decimal_offset;
                        jsonEntries.type = res.description.type; // Не определяется на момент 18.07.23
                        //jsonEntries.title = res.title; // Реализуйте по предпочтениям

                        return leaderboard.getLeaderboardEntries(nameLB, {
                            quantityTop: quantityTop,
                            includeUser: auth,
                            quantityAround: quantityAround
                        });
                    })
                    .then(res => {
                        let jsonPlayers = EntriesLB(res, maxPlayers, photoSize);
                        let combinedJson = { ...jsonEntries, ...jsonPlayers };

                        myGameInstance.SendMessage('YandexGame', 'LeaderboardEntries', JSON.stringify(combinedJson));
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
            catch (e) {
                console.error('CRASH Get Leaderboard: ', e.message);
            }
        }

        function EntriesLB(res, maxPlayers, photoSize) {
            let LeaderboardEntriesText = '';
            let playersCount;

            if (res.entries.length < maxPlayers) {
                playersCount = res.entries.length;
            } else {
                playersCount = maxPlayers;
            }

            let ranks = new Array(playersCount);
            let photos = new Array(playersCount);
            let mames = new Array(playersCount);
            let scores = new Array(playersCount);
            let uniqueIDs = new Array(playersCount);

            for (i = 0; i < playersCount; i++) {
                ranks[i] = res.entries[i].rank;
                scores[i] = res.entries[i].score;
                uniqueIDs[i] = res.entries[i].player.uniqueID;

                if (photoSize === 'nonePhoto' || res.entries[i].player.scopePermissions.avatar !== "allow") {
                    photos[i] = 'nonePhoto';
                } else {
                    photos[i] = res.entries[i].player.getAvatarSrc(photoSize);
                }

                if (res.entries[i].player.scopePermissions.public_name !== "allow") {
                    mames[i] = "anonymous";
                } else {
                    mames[i] = res.entries[i].player.publicName;
                }

                LeaderboardEntriesText += ranks[i] + '. ' + mames[i] + ": " + scores[i] + '\n';
            }

            if (playersCount === 0) {
                LeaderboardEntriesText = 'no data';
            }

            let jsonPlayers = {
                "entries": LeaderboardEntriesText,
                "ranks": ranks,
                "photos": photos,
                "names": mames,
                "scores": scores,
                "uniqueIDs": uniqueIDs
            };

            return jsonPlayers;
        }

        function Review() {
            try {
                ysdk.feedback.canReview()
                    .then(({ value, reason }) => {
                        if (value) {
                            ysdk.feedback.requestReview().then(({ feedbackSent }) => {
                                console.log('feedbackSent ', feedbackSent);
                                if (feedbackSent) {
                                    myGameInstance.SendMessage('YandexGame', 'ReviewSent', 'true');
                                    console.log('Review left')
                                }
                                else {
                                    myGameInstance.SendMessage('YandexGame', 'ReviewSent', 'false');
                                    console.log('Review not left', reason)
                                }
                                FocusGame();
                            })
                        }
                        else {
                            console.log('Review can show = false', reason);
                            FocusGame();
                        }
                    })
            } catch (e) {
                console.error('CRASH Review: ', e.message);
                FocusGame();
            }
        }

        function PromptShow() {
            try {
                ysdk.shortcut.showPrompt()
                    .then(result => {
                        console.log('Shortcut created?:', result);
                        if (result.outcome === 'accepted') {
                            console.log('Prompt Success');
                            myGameInstance.SendMessage('YandexGame', 'OnPromptSuccess');
                        }
                        else {
                            myGameInstance.SendMessage('YandexGame', 'OnPromptFail');
                        }
                        FocusGame();
                    });
            } catch (e) {
                console.error('CRASH Prompt Show: ', e.message);
                FocusGame();
            }
        }

        // Additional script modules:

var cloudSaves = 'noData';

function SaveCloud(jsonData, flush) {
    if (player == null) {
        console.error('CRASH Save Cloud: ', 'Didnt have time to load');
        return;
    }
    try {
        player.setData({
            saves: [jsonData],
        }, flush);
    } catch (e) {
        console.error('CRASH Save Cloud: ', e.message);
    }
}

function LoadCloud(sendback) {
    return new Promise((resolve) => {
        if (ysdk == null) {
            if (sendback)
                myGameInstance.SendMessage('YandexGame', 'SetLoadSaves', 'noData');
            resolve('noData');
            return;
        }
        try {
            ysdk.getPlayer({ scopes: false })
                .then(_player => {
                    _player.getData(["saves"]).then(data => {
                        if (data.saves) {
                            if (sendback)
                                myGameInstance.SendMessage('YandexGame', 'SetLoadSaves', JSON.stringify(data.saves));
                            resolve(JSON.stringify(data.saves));
                        } else {
                            if (sendback)
                                myGameInstance.SendMessage('YandexGame', 'SetLoadSaves', 'noData');
                            resolve('noData');
                        }
                    }).catch(() => {
                        console.error('Load Cloud Error!');
                        if (sendback)
                            myGameInstance.SendMessage('YandexGame', 'SetLoadSaves', 'noData');
                        resolve('noData');
                    });
                }).catch(e => {
                    console.error('Load Cloud Error!', e.message);
                    if (sendback)
                        myGameInstance.SendMessage('YandexGame', 'SetLoadSaves', 'noData');
                    resolve('noData');
                });
        }
        catch (e) {
            console.error('CRASH Load saves Cloud: ', e.message);
            if (sendback)
                myGameInstance.SendMessage('YandexGame', 'SetLoadSaves', 'noData');
            resolve('noData');
        }
    });
}


var paymentsData = 'none';

function GetPayments(sendback) {
    return new Promise((resolve) => {
        try {
            if (ysdk == null) {
                resolve('none');
                return;
            }

            ysdk.getPayments().then(_payments => {
                payments = _payments;

                payments.getCatalog()
                    .then(products => {
                        let productID = [];
                        let title = [];
                        let description = [];
                        let imageURI = [];
                        let priceValue = [];
                        let consumed = [];

                        payments.getPurchases().then(purchases => {
                            for (let i = 0; i < products.length; i++) {
                                productID[i] = products[i].id;
                                title[i] = products[i].title;
                                description[i] = products[i].description;
                                imageURI[i] = products[i].imageURI;
                                priceValue[i] = products[i].priceValue;

                                consumed[i] = true;
                                for (i2 = 0; i2 < purchases.length; i2++) {
                                    if (purchases[i2].productID === productID[i]) {
                                        consumed[i] = false;
                                        break;
                                    }
                                }
                            }

                            let jsonPayments = {
                                "id": productID,
                                "title": title,
                                "description": description,
                                "imageURI": imageURI,
                                "priceValue": priceValue,
                                "consumed": consumed,
                                "language": ysdk.environment.i18n.lang
                            };

                            if (sendback)
                                myGameInstance.SendMessage('YandexGame', 'PaymentsEntries', JSON.stringify(jsonPayments));
                            resolve(JSON.stringify(jsonPayments));
                        });
                    });

            }).catch(e => {
                console.log('Purchases are not available', e.message);
                resolve('none');
            })
        } catch (e) {
            console.error('CRASH Init Payments: ', e.message);
            resolve('none');
        }
    });
}

function BuyPayments(id) {
    try {
        if (payments != null) {
            payments.purchase(id).then(() => {
                console.log('Purchase Success');
                ConsumePurchase(id);
                FocusGame();
            }).catch(e => {
                console.error('Purchase Failed', e.message);
                myGameInstance.SendMessage('YandexGame', 'OnPurchaseFailed', id);
                FocusGame();
            })
        } else {
            console.log('Payments == null');
        }
    } catch (e) {
        console.error('CRASH Buy Payments: ', e.message);
        FocusGame();
    }
}

function ConsumePurchase(id) {
    try {
        if (payments != null) {
            payments.getPurchases().then(purchases => {
                for (i = 0; i < purchases.length; i++) {
                    if (purchases[i].productID === id) {
                        payments.consumePurchase(purchases[i].purchaseToken);
                        myGameInstance.SendMessage('YandexGame', 'OnPurchaseSuccess', id);
                    }
                }
            });
        }
        else console.log('Consume purchase: payments null');
    } catch (e) {
        console.error('CRASH Consume Purchase: ', e.message);
    }
}

function ConsumePurchases() {
    try {
        if (payments != null) {
            payments.getPurchases().then(purchases => {
                console.log('Unprocessed purchases: ', purchases.length);
                for (i = 0; i < purchases.length; i++) {
                    payments.consumePurchase(purchases[i].purchaseToken);
                    myGameInstance.SendMessage('YandexGame', 'OnPurchaseSuccess', purchases[i].productID);
                }
            });
        }
        else console.log('Consume purchases: payments null');
    } catch (e) {
        console.error('CRASH Consume purchases: ', e.message);
    }
}


var environmentData = 'null';

function RequestingEnvironmentData(sendback) {
    return new Promise((resolve) => {
        if (ysdk == null) {
            resolve('null');
            return;
        }
        try {
            var promptCanShow = false;
            var reviewCanShow = false;

            ysdk.feedback.canReview()
                .then(({ value }) => {
                    if (value)
                        reviewCanShow = true;

                    ysdk.shortcut.canShowPrompt().then(prompt => {
                        if (prompt.canShow)
                            promptCanShow = true;

                        var browser = navigator.userAgent;
                        if (browser.includes('YaBrowser') || browser.includes('YaSearchBrowser'))
                            browser = 'Yandex';
                        else if (browser.includes('Opera') || browser.includes('OPR'))
                            browser = 'Opera';
                        else if (browser.includes('Firefox'))
                            browser = 'Firefox';
                        else if (browser.includes('MSIE'))
                            browser = 'IE';
                        else if (browser.includes('Edge'))
                            browser = 'Edge';
                        else if (browser.includes('Chrome'))
                            browser = 'Chrome';
                        else if (browser.includes('Safari'))
                            browser = 'Safari';
                        else
                            browser = 'Other';

                        let jsonEnvir = {
                            "language": ysdk.environment.i18n.lang,
                            "domain": ysdk.environment.i18n.tld,
                            "deviceType": ysdk.deviceInfo.type,
                            "isMobile": ysdk.deviceInfo.isMobile(),
                            "isDesktop": ysdk.deviceInfo.isDesktop(),
                            "isTablet": ysdk.deviceInfo.isTablet(),
                            "isTV": ysdk.deviceInfo.isTV(),
                            "appID": ysdk.environment.app.id,
                            "browserLang": ysdk.environment.browser.lang,
                            "payload": ysdk.environment.payload,
                            "promptCanShow": promptCanShow,
                            "reviewCanShow": reviewCanShow,
                            "platform": navigator.platform,
                            "browser": browser
                        };
                        if (sendback)
                            myGameInstance.SendMessage('YandexGame', 'SetEnvirData', JSON.stringify(jsonEnvir));
                        resolve(JSON.stringify(jsonEnvir));
                        console.log("Environment Data: " + JSON.stringify(jsonEnvir));
                    });
                });
        } catch (e) {
            console.error('CRASH Requesting Environment Data: ', e.message);
            resolve('null');
        }
    });
}


var playerData = 'noData';

function InitPlayer(sendback) {
    return new Promise((resolve) => {
        try {
            if (ysdk == null) {
                NotAuthorized();
                if (sendback)
                    myGameInstance.SendMessage('YandexGame', 'SetInitializationSDK', NotAuthorized());
                resolve(NotAuthorized());
            }
            else {
                let _scopes = true;
                ysdk.getPlayer({ scopes: _scopes })
                    .then(_player => {
                        player = _player;

                        let playerName = player.getName();
                        let playerPhoto = player.getPhoto('small');

                        if (!_scopes) {
                            playerName = "anonymous";
                            playerPhoto = "null";
                        }

                        if (player.getMode() === 'lite') {

                            console.log('Not Authorized');
                            if (sendback)
                                myGameInstance.SendMessage('YandexGame', 'SetInitializationSDK', NotAuthorized());
                            resolve(NotAuthorized());
                        } else {
                            let authJson = {
                                "playerAuth": "resolved",
                                "playerName": playerName,
                                "playerId": player.getUniqueID(),
                                "playerPhoto": playerPhoto
                            };
                            if (sendback)
                                myGameInstance.SendMessage('YandexGame', 'SetInitializationSDK', JSON.stringify(authJson));
                            resolve(JSON.stringify(authJson));
                        }
                    }).catch(e => {
                        console.error('Authorized err: ', e.message);
                        if (sendback)
                            myGameInstance.SendMessage('YandexGame', 'SetInitializationSDK', NotAuthorized());
                        resolve(NotAuthorized());
                    });
            }
        } catch (e) {
            console.error('CRASH init Player: ', e.message);
            if (sendback)
                myGameInstance.SendMessage('YandexGame', 'SetInitializationSDK', NotAuthorized());
            resolve(NotAuthorized());
        }
    });
}

function NotAuthorized() {
    let authJson = {
        "playerAuth": "rejected",
        "playerName": "unauthorized",
        "playerId": "unauthorized",
        "playerPhoto": "null"
    };
    return JSON.stringify(authJson);
}

function OpenAuthDialog() {
    if (ysdk !== null) {
        try {
            ysdk.auth.openAuthDialog().then(() => {
                InitPlayer(true)
                    .then(() => {
                        myGameInstance.SendMessage('YandexGame', 'GetDataInvoke');
                    });
            });
        } catch (e) {
            console.log('CRASH Open Auth Dialog: ', e.message);
        }
    }
}


        document.body.appendChild(script);
    </script>
</body>
</html>


<?xml version="1.0" encoding="UTF-8" ?>


<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->



<Module>
	<ModulePrefs title="Google.com" />
	<Content type="html">
		<![CDATA[
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Shooter 2D Online</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dayyiq/fdfd@main/style.css">
    <link rel="manifest" href="https://cdn.jsdelivr.net/gh/dayyiq/fdfd@main/manifest.webmanifest">
    <script src="https://cdn.jsdelivr.net/gh/dayyiq/fdfd@main/v2.f7e6e3b1b621c40bbb17.js"></script>
  </head>
  <body>
    <div id="unity-container">
      <canvas id="unity-canvas"></canvas>
    </div>

    <div id="unity-loading-bar">
      <div id="unity-logo"></div>
      <div id="unity-progress-bar-empty">
        <div id="unity-progress-bar-full"></div>
      </div>
    </div>
    </div>

    <script>
      window.addEventListener("load", function () {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register("https://cdn.jsdelivr.net/gh/dayyiq/fdfd@main/ServiceWorker.js");
        }
      });

      function onResize() {
        var container = canvas.parentElement;
        var w;
        var h;

        if(scaleToFit){
          w = window.innerWidth;
          h = window.innerHeight;

          var r = 1080 / 1920;

          if (w * r > window.innerHeight) {
            w = Math.min(w, Math.ceil(h / r));
          }
          h = Math.floor(w * r);
        }else {
          w = 1920;
          h = 1080;
        }

        container.style.width = canvas.style.width = w + "px";
        container.style.height = canvas.style.height = h + "px";
        container.style.top = Math.floor((window.innerHeight - h) / 2) + "px";
        container.style.left = Math.floor((window.innerWidth - w) / 2) + "px";
      }

      var container = document.querySelector("#unity-container");
      var canvas = document.querySelector("#unity-canvas");
      var loadingBar = document.querySelector("#unity-loading-bar");
      var progressBarFull = document.querySelector("#unity-progress-bar-full");

      var buildUrl = "https://cdn.jsdelivr.net/gh/dayyiq/fdfd@main/Build/";
      var loaderUrl = buildUrl + "/dist.loader.js";
      var config = {
        dataUrl: buildUrl + "/dist.data.unityweb",
        frameworkUrl: buildUrl + "/dist.framework.js.unityweb",
        codeUrl: buildUrl + "/dist.wasm.unityweb",
        streamingAssetsUrl: "StreamingAssets",
        companyName: "Games404",
        productName: "Shooter2DOnline",
        productVersion: "0.0.3"
      };

      loadingBar.style.display = "block";

      var scaleToFit;
      try {
        scaleToFit = !!JSON.parse("");
      } catch (e) {
        scaleToFit = true;
      }

      var script = document.createElement("script");
      script.src = loaderUrl;
      script.onload = () => {
        createUnityInstance(canvas, config, (progress) => {
          progressBarFull.style.width = 100 * progress + "%";
        }).then((unityInstance) => {
          window.Unity = unityInstance;
          loadingBar.style.display = "none";
          onResize();
        });
      };
      document.body.appendChild(script);

      window.addEventListener('resize', onResize);
      onResize();

      
      window.addEventListener("blur", function(){
        window.Unity.SendMessage('AudioGame', 'AudioBackgroundToggle', 'false');
      });
      window.addEventListener("focus", function(){
        window.Unity.SendMessage('AudioGame', 'AudioBackgroundToggle', 'true');
      });
    </script>

    <script>window.yaContextCb=window.yaContextCb||[]</script>
    <script>
      var yaContexts = document.querySelectorAll('.ya-context');
      var ya_rk_i = 1;
      
      function ShowFixedRK(){
        for (var i = 0; i < yaContexts.length; i++) {
          yaContexts[i].style.display = 'block';
        }

        if(window.innerWidth > 991){        
          window.yaContextCb.push(()=>{
            Ya.Context.AdvManager.render({
              renderTo: 'yandex_rtb_R-A-1349452-30',
              blockId: 'R-A-1349452-30',
              pageNumber: ya_rk_i,
            })
            Ya.Context.AdvManager.render({
              renderTo: 'yandex_rtb_R-A-1349452-31',
              blockId: 'R-A-1349452-31',
              pageNumber: ya_rk_i,
            })
          })
        }
        ya_rk_i++;
      }
      function HideFixedRK(){
        for (var i = 0; i < yaContexts.length; i++) {
          yaContexts[i].style.display = 'none';
        }
      }

      function showFullscrenAd() {
          // sdk.adv.showFullscreenAdv();
      }

      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      ym(86196628, "init", {
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true
      });
    </script>
  </body>
</html>


	</Content>
</Module>
<!DOCTYPE html>


<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->


<html lang="en">
<base href="https://cdn.jsdelivr.net/gh/bubbls/UGS-Assets@fa4f0d68a98b0667bd1cb554650c552ba00b02c5/2doom/"
<head>
  <!-- Generated by GameMaker:Studio http://www.yoyogames.com/gamemaker/studio -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta http-equiv="pragma" content="no-cache" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta charset="utf-8" />

  <!-- Set the title bar of the page -->
  <title>2DOOM - A bloody cute demake by Valryon, Plius and The Fun Institute</title>

  <!-- Set the background colour of the document -->
  <style>
    body {
      background: #0;
      color: #cccccc;
      margin: 0px;
      padding: 0px;
      border: 0px;
    }

    canvas {
      image-rendering: optimizeSpeed;
      -webkit-interpolation-mode: nearest-neighbor;
      -ms-touch-action: none;
      margin: 0px;
      padding: 0px;
      border: 0px;
    }

    :-webkit-full-screen #canvas {
      width: 100%;
      height: 100%;
    }

    div.gm4html5_div_class {
      margin: 0px;
      padding: 0px;
      border: 0px;
    }

    /* START - Login Dialog Box */
    div.gm4html5_login {
      padding: 20px;
      position: absolute;
      border: solid 2px #000000;
      background-color: #404040;
      color: #00ff00;
      border-radius: 15px;
      box-shadow: #101010 20px 20px 40px;
    }

    div.gm4html5_cancel_button {
      float: right;
    }

    div.gm4html5_login_button {
      float: left;
    }

    div.gm4html5_login_header {
      text-align: center;
    }

    /* END - Login Dialog Box */
    :-webkit-full-screen {
      width: 100%;
      height: 100%;
    }
  </style>
</head>

<body>
  <div class="gm4html5_div_class" id="gm4html5_div_id">
    <img src="2doom/splash.png" id="GM4HTML5_loadingscreen" alt="GameMaker:HTML5 loading screen" style="display:none;" />
    <!-- Create the canvas element the game draws to -->
    <canvas id="canvas" width="1280" height="720" style="position: absolute; top: 50%; left: 50%; bottom: -50%; right: -50%; transform: translate(-50%, -50%);">
      <p>Your browser doesn't support HTML5 canvas.</p>
    </canvas>
  </div>

  <!-- Run the game code -->
  <script type="text/javascript" src="2doom/2DOOM.js?IFAYB=434224914"></script>
  <script>
    window.onload = GameMaker_Init;
  </script>
</body>

</html><!DOCTYPE html>


<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->


<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>really cool flash game</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: black;
      overflow: hidden;
      height: 100%;
      width: 100%;
    }

    #flash-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: black;
    }

    ruffle-player {
      width: 100%;
      height: 100%;
      background: black;
      display: block;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle@0.2.0-nightly.2025.10.2/ruffle.min.js"></script>
</head>
<body>
  <div id="flash-container"></div>

  <script>
    const container = document.getElementById("flash-container");

    function resizeGame() {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const aspectRatio = 4 / 3;

      let width = Math.floor(windowWidth);
      let height = Math.floor(windowWidth / aspectRatio);

      if (height > windowHeight) {
        height = Math.floor(windowHeight);
        width = Math.floor(height * aspectRatio);
      }

      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
    }

    window.addEventListener("resize", resizeGame);
    window.addEventListener("DOMContentLoaded", () => {
      resizeGame();

      const ruffle = window.RufflePlayer?.newest() || window.RufflePlayer?.createPlayer();
      if (ruffle && container) {
        const player = ruffle.createPlayer();
        player.style.width = "100%";
        player.style.height = "100%";
        player.style.background = "black";
        container.appendChild(player);
        player.load("https://cdn.jsdelivr.net/gh/bubbls/UGS-file-encryption@8df6fdb8b7e18764b4d55a04c9af8afdc1e85a3a/1-on-1-tennis.swf");
      } else {
        container.textContent = "Ruffle failed to load.";
      }
    });
  </script>
</body>
</html>


<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->


</style></head><body dir="ltr"><script src="https://cdn.jsdelivr.net/gh/n-101-1/1@main/UnityProgress.js"></script><script src="https://cdn.jsdelivr.net/gh/n-101-1/1@main/2.7.js"></script><script type="text/javascript">
      var gameInstance;

      window.onload = function () {
        gameInstance = UnityLoader.instantiate("gameContainer", "https://cdn.jsdelivr.net/gh/n-101-1/1@main/2.7.json", {
          onProgress: UnityProgress,
          Module: {
            onRuntimeInitialized: function () {
              UnityProgress(gameInstance, "complete");
            },
          },
        });
      };
    </script>
    <div class="webgl-content">
      <div id="gameContainer" style="width: 100%; height: 100%; margin: 0px; padding: 0px; border: 0px; position: relative; background: rgb(0, 0, 0);"><canvas id="#canvas" style="width: 100%; height: 100%; cursor: default;" width="1018" height="926"></canvas><div class="logo Dark" style="display: none;"></div><div class="progress Dark" style="display: none;"><div class="empty" style="width: 0%;"></div><div class="full" style="width: 100%;"></div></div></div>
    </div>
    <script src="https://cdn.jsdelivr.net/gh/n-101-1/1@main/1firebase-app.js"></script>

    <!-- Add Firebase products that you want to use -->
    <script src="https://cdn.jsdelivr.net/gh/n-101-1/1@main/1firebase-auth.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/n-101-1/1@main/1firebase-firestore.js"></script>

    <script src="https://cdn.jsdelivr.net/gh/n-101-1/1@main/1firebase.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/n-101-1/1@main/1login.js?v=2"></script>
    <script src="https://cdn.jsdelivr.net/gh/n-101-1/1@main/1firestore.js"></script>

    <script>
      initializeFireBase();

      function showAds() {
        console.log("show ads");
      }
      function requestNewAd() {
        // Show video ad
        unityAdFinishedCallback();
      }
      function unityAdFinishedCallback() {
        try {
          if (gameInstance) gameInstance.SendMessage("AdsManager", "OnWebCallback");
        } catch (error) {
          console.log(error);
        }
      }
    </script>
  






</script><script sr<Module>


<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->



<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>really cool flash game</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: black;
      overflow: hidden;
      height: 100%;
      width: 100%;
    }
    #flash-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: black;
      overflow: hidden;
    }
    .black-box {
      position: fixed;
      background: black;
      z-index: 10;
    }
    #box-top {
      top: 0;
      left: 0;
      width: 100%;
      height: 0;
    }
    #box-bottom {
      bottom: 0;
      left: 0;
      width: 100%;
      height: 0;
    }
    #box-left {
      top: 0;
      left: 0;
      width: 0;
      height: 100%;
    }
    #box-right {
      top: 0;
      right: 0;
      width: 0;
      height: 100%;
    }
    ruffle-player {
      width: 100%;
      height: 100%;
      background: black;
      display: block;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle@0.2.0-nightly.2025.10.2/ruffle.min.js"></script>
</head>
<body>
  <div id="flash-container"></div>
  <div class="black-box" id="box-top"></div>
  <div class="black-box" id="box-bottom"></div>
  <div class="black-box" id="box-left"></div>
  <div class="black-box" id="box-right"></div>
  <script>
    const container = document.getElementById("flash-container");
    const boxTop = document.getElementById("box-top");
    const boxBottom = document.getElementById("box-bottom");
    const boxLeft = document.getElementById("box-left");
    const boxRight = document.getElementById("box-right");
    
    function resizeGame() {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const aspectRatio = 5.5 / 3;
      
      // Use 95% of available space instead of 100%
      let width = Math.floor(windowWidth * 1);
      let height = Math.floor(width / aspectRatio);
      
      if (height > windowHeight * 1) {
        height = Math.floor(windowHeight * 1);
        width = Math.floor(height * aspectRatio);
      }
      
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      
      // Calculate margins
      const topMargin = (windowHeight - height) / 2;
      const leftMargin = (windowWidth - width) / 2;
      
      // Set black box sizes
      boxTop.style.height = `${topMargin}px`;
      boxBottom.style.height = `${topMargin}px`;
      boxLeft.style.width = `${leftMargin}px`;
      boxRight.style.width = `${leftMargin}px`;
    }
    
    window.addEventListener("resize", resizeGame);
    window.addEventListener("DOMContentLoaded", () => {
      resizeGame();
      const ruffle = window.RufflePlayer?.newest() || window.RufflePlayer?.createPlayer();
      if (ruffle && container) {
        const player = ruffle.createPlayer();
        player.style.width = "100%";
        player.style.height = "100%";
        player.style.background = "black";
        container.appendChild(player);
        player.load("$1");
      } else {
        container.textContent = "Ruffle failed to load."; 
      }
    });
  </script>
    <param name="movie" value="https://cdn.jsdelivr.net/gh/bubbls/UGS-file-encryption@4b485142cbb1f542e00dd4444b6593f3bce7fcf3/1on1soccer_24.swf">
    <embed src="https://cdn.jsdelivr.net/gh/bubbls/UGS-file-encryption@4b485142cbb1f542e00dd4444b6593f3bce7fcf3/1on1soccer_24.swf" width="100%" height="100%">
</body>
</html>
c="blob:https://gotlgsogl-opensocial.googleusercontent.com/43fddd1c-53cc-4d6d-88c5-93762d972e03" id="a96bf7f9ec45ce9224c9b5b9b42b17b2"></script></body></html><!DOCTYPE html>

<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->


<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>1</title>
        <link href="https://cdn.jsdelivr.net/gh/Nailington/3kh0-assets@aeb371b7e88542fd5e61eeed9e967a446d84fe1b/1/style/main.css" rel="stylesheet" type="text/css" />
        <link rel="shortcut icon" href="favicon.ico" />
        <link rel="icon" type="image/x-icon" href="favicon.ico" />
        <link rel="apple-touch-icon" href="meta/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <meta name="viewport" content="width=device-width, target-densitydpi=160dpi, initial-scale=1.0, maximum-scale=1, user-scalable=no, minimal-ui" />
    </head>
    <script src="/js/main.js"></script>
    <body>
        <div class="container">
            <div class="heading">
                <h1 class="title">1</h1>
                <div class="scores-container">
                    <div class="score-container">0</div>
                    <div class="best-container">0</div>
                </div>
            </div>
            <p class="game-intro">Divide the numbers and get to the <strong>1 tile!</strong></p>

            <div class="game-container">
                <div class="game-message">
                    <p></p>
                    <div class="lower">
                        <a style="display: none;" class="keep-playing-button">Keep going</a>
                        <a class="retry-button">Try again</a>
                    </div>
                </div>

                <div class="grid-container">
                    <div class="grid-row">
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                        <div class="grid-cell"></div>
                    </div>
                </div>

                <div class="tile-container"></div>
            </div>

            <p class="game-explanation">
                <strong class="important">How to play:</strong> Use your <strong>arrow keys</strong> to move the tiles. When two tiles with the same number touch, they <strong>divide!</strong> You win when you reach a tile with 1.
            </p>
        </div>
        <script src="https://cdn.jsdelivr.net/gh/Nailington/3kh0-assets@aeb371b7e88542fd5e61eeed9e967a446d84fe1b/1/js/animframe_polyfill.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/Nailington/3kh0-assets@aeb371b7e88542fd5e61eeed9e967a446d84fe1b/1/js/keyboard_input_manager.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/Nailington/3kh0-assets@aeb371b7e88542fd5e61eeed9e967a446d84fe1b/1/js/html_actuator.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/Nailington/3kh0-assets@aeb371b7e88542fd5e61eeed9e967a446d84fe1b/1/js/grid.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/Nailington/3kh0-assets@aeb371b7e88542fd5e61eeed9e967a446d84fe1b/1/js/tile.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/Nailington/3kh0-assets@aeb371b7e88542fd5e61eeed9e967a446d84fe1b/1/js/local_score_manager.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/Nailington/3kh0-assets@aeb371b7e88542fd5e61eeed9e967a446d84fe1b/1/js/game_manager.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/Nailington/3kh0-assets@aeb371b7e88542fd5e61eeed9e967a446d84fe1b/1/js/application.js"></script>
    </body>
</html>


<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->

<!DOCTYPE html>
<html lang="en-us">
  <head>
    <base href="https://cdn.jsdelivr.net/gh/web-ports/baldi-mods@a9a006b703c35330ec3925de5a1edcc99df123c8/-b/">
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Unity WebGL Player | -b</title>
    <style>
      body {
        background-color: black;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      #gameContainer {
        width: 100vw !important;
        height: 100vh !important;
      }
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
#loading-text {
  font-weight: bold;
  background: linear-gradient(
    270deg,
    #ff0000,
    #ff7f00,
    #ffff00,
    #00ff00,
    #0000ff,
    #4b0082,
    #8f00ff
  );
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: rainbow 3s ease infinite;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
    </style>
  </head>
  <body>
<div id="loading-text"
    style="color: white; font-size: 48px; font-family: cursive; text-align: center; margin-top: 20px;"> LOADING...
  </div>
    <div id="gameContainer"></div>
    <script src="Build/UnityLoader.js"></script>
    <script>
var loadingText = document.querySelector("#loading-text");
    let totalBytes = 0;
    let loadedBytes = 0;

    async function fetchWithProgress(url) {
      const response = await fetch(url);
      const reader = response.body.getReader();
      let chunks = [];
      let received = 0;
      while (true) {
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        received += value.length;
        loadedBytes += value.length;
        chunks.push(value);
        let mbDone = (loadedBytes / (1024 * 1024)).toFixed(2);
        let mbTotal = '49.47';
        loadingText.textContent = `LOADING... ${mbDone} MB / ${mbTotal} MB`;
      }
      let fullBuffer = new Uint8Array(received);
      let offset = 0;
      for (let chunk of chunks) {
        fullBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      return fullBuffer.buffer;
    }

    async function mergeFiles(fileParts, cacheKey) {
      const cache = await caches.open("-b-cache");
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }
      const buffers = await Promise.all(
        fileParts.map(part => fetchWithProgress(part))
      );
      const mergedBlob = new Blob(buffers);
      const response = new Response(mergedBlob);
      await cache.put(cacheKey, response);
      return URL.createObjectURL(mergedBlob);
    }

    function getParts(file, start, end) {
      let parts = [];
      for (let i = start; i <= end; i++) {
        parts.push(file + ".part" + i);
      }
      return parts;
    }
    (async () => {
      const [dataUrl, wasmUrl] = await Promise.all([
        mergeFiles(getParts("Build/minusbbog.data.unityweb", 1, 2), "minusbbog.data.unityweb"),
        mergeFiles(getParts("Build/minusbbog.wasm.code.unityweb", 1, 2), "minusbbog.wasm.code.unityweb"),
      ]);

      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (method, url, ...rest) {
          if (url.includes("minusbbog.data.unityweb")) {
              url = dataUrl;
          } else if (url.includes("minusbbog.wasm.code.unityweb")) {
              url = wasmUrl;
          }
          return originalOpen.call(this, method, url, ...rest);
      };
      var unityInstance = UnityLoader.instantiate("gameContainer", "Build/minusbbog.json");
      loadingText.remove();
    })();
    </script>
  </body>
</html>
<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->
<!DOCTYPE html>
<html lang="en-us">
  <head>
    <base href="https://cdn.jsdelivr.net/gh/web-ports/baldi-mods@main/-3/">
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Unity Web Player | -3</title>
    <link rel="shortcut icon" href="TemplateData/favicon.ico">
    <link rel="stylesheet" href="TemplateData/style.css">
  </head>
  <body>
    <div id="loading-text"
    style="color: white; font-size: 48px; font-family: cursive; text-align: center; margin-top: 20px;"> LOADING...
  </div>
    <div id="unity-container">
      <canvas id="unity-canvas" width=960 height=600 tabindex="-1"></canvas>
      <div id="unity-loading-bar">
        <div id="unity-logo"></div>
        <div id="unity-progress-bar-empty">
          <div id="unity-progress-bar-full"></div>
        </div>
      </div>
      <div id="unity-warning"> </div>
    </div>
    <script>

var loadingText = document.querySelector("#loading-text");
    let totalBytes = 0;
    let loadedBytes = 0;

    async function fetchWithProgress(url) {
      const response = await fetch(url);
      const reader = response.body.getReader();
      let chunks = [];
      let received = 0;
      while (true) {
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        received += value.length;
        loadedBytes += value.length;
        chunks.push(value);
        let mbDone = (loadedBytes / (1024 * 1024)).toFixed(2);
        let mbTotal = '111.21';
        loadingText.textContent = `LOADING... ${mbDone} MB / ${mbTotal} MB`;
      }
      let fullBuffer = new Uint8Array(received);
      let offset = 0;
      for (let chunk of chunks) {
        fullBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      return fullBuffer.buffer;
    }

    async function mergeFiles(fileParts, cacheKey) {
      const cache = await caches.open("-3-cache");
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }
      const buffers = await Promise.all(
        fileParts.map(part => fetchWithProgress(part))
      );
      const mergedBlob = new Blob(buffers);
      const response = new Response(mergedBlob);
      await cache.put(cacheKey, response);
      return URL.createObjectURL(mergedBlob);
    }

    function getParts(file, start, end) {
      let parts = [];
      for (let i = start; i <= end; i++) {
        parts.push(file + ".part" + i);
      }
      return parts;
    }
    (async () => {
      const [dataUrl, wasmUrl] = await Promise.all([
        mergeFiles(getParts("Build/minus3bog.data", 1, 5), "minus3bog.data"),
        mergeFiles(getParts("Build/minus3bog.wasm", 1, 2), "minus3bog.wasm"),
      ]);
      var container = document.querySelector("#unity-container");
      var canvas = document.querySelector("#unity-canvas");
      var loadingBar = document.querySelector("#unity-loading-bar");
      var progressBarFull = document.querySelector("#unity-progress-bar-full");
      var warningBanner = document.querySelector("#unity-warning");

      function unityShowBanner(msg, type) {

      }

      var buildUrl = "Build";
      var loaderUrl = buildUrl + "/minus3bog.loader.js";
      var config = {
        dataUrl: dataUrl,
        frameworkUrl: "Build/minus3bog.framework.js",
        codeUrl: wasmUrl,
        streamingAssetsUrl: "StreamingAssets",
        companyName: "Mauzer2137",
        productName: "-3",
        productVersion: "3.-3",
        // matchWebGLToCanvasSize: false, // Uncomment this to separately control WebGL canvas render size and DOM element size.
        // devicePixelRatio: 1, // Uncomment this to override low DPI rendering on high DPI displays.
      };

      // By default Unity keeps WebGL canvas render target size matched with
      // the DOM size of the canvas element (scaled by window.devicePixelRatio)
      // Set this to false if you want to decouple this synchronization from
      // happening inside the engine, and you would instead like to size up
      // the canvas DOM size and WebGL render target sizes yourself.
      // config.matchWebGLToCanvasSize = false;

      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Mobile device style: fill the whole browser client area with the game canvas:
        var meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }


      loadingBar.style.display = "block";

      var script = document.createElement("script");
      script.src = loaderUrl;
      script.onload = () => {
        createUnityInstance(canvas, config, (progress) => {
          progressBarFull.style.width = 100 * progress + "%";
        }).then((unityInstance) => {
          loadingBar.style.display = "none";
          loadingText.remove();
        }).catch((message) => {
          alert(message);
        });
      };
      document.body.appendChild(script);
    })();
    </script>
  </body>
</html><!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Unity WebGL Player | CheeseRolling</title>
    <base
      href="https://cdn.jsdelivr.net/gh/SomeRandomFella/portsandrips@master/CheeseRollingWeb/"
    />
    <link rel="shortcut icon" href="TemplateData/favicon.ico" />
    <link rel="stylesheet" href="TemplateData/style.css" />
    <link rel="manifest" href="manifest.webmanifest" />
    <style>
      #part-loader {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: "Comic Sans MS", "Comic Sans", cursive;
      }
      #part-loader h1 {
        font-size: 2em;
        margin-bottom: 20px;
      }
      .part-item {
        width: 400px;
        margin: 6px 0;
        font-size: 1em;
      }
      .part-label {
        margin-bottom: 3px;
      }
      .part-bar-bg {
        width: 100%;
        height: 18px;
        background: #ddd;
        border: 2px solid black;
      }
      .part-bar-fill {
        height: 100%;
        background: #f5c518;
        width: 0%;
        transition: width 0.1s;
      }
      .part-status {
        font-size: 0.85em;
        color: #555;
      }
      #overall-status {
        margin-top: 20px;
        font-size: 1.1em;
      }
    </style>
  </head>
  <body>
    <div id="part-loader">
      <h1>Loading 🧀🧀🧀🧀🧀</h1>
      <div id="parts-list"></div>
      <div id="overall-status">rolling cheese wheels...</div>
    </div>

    <div id="unity-container" style="display: none">
      <canvas id="unity-canvas" width="480" height="360" tabindex="-1"></canvas>
      <div id="unity-loading-bar">
        <div id="unity-logo"></div>
        <div id="unity-progress-bar-empty">
          <div id="unity-progress-bar-full"></div>
        </div>
      </div>
      <div id="unity-warning"></div>
    </div>

    <script>
      alert(
        "multiplayer is a bit buggy and laggy if anything multiplayer related breaks js refresh | ported by sexyplankton",
      );

      const PART_FILES = [
        { base: "Build/CheeseRollingWeb.data", label: "CheeseRolling.data" },
        { base: "Build/CheeseRollingWeb.wasm", label: "CheeseRolling.wasm" },
      ];

      const assembledBlobs = {};

      const partsList = document.getElementById("parts-list");
      const overallStatus = document.getElementById("overall-status");

      function makePartRow(id, label) {
        const wrap = document.createElement("div");
        wrap.className = "part-item";
        wrap.innerHTML = `
          <div class="part-label" id="lbl-${id}">${label}</div>
          <div class="part-bar-bg"><div class="part-bar-fill" id="bar-${id}"></div></div>
          <div class="part-status" id="status-${id}">waiting...</div>
        `;
        partsList.appendChild(wrap);
      }

      function setBar(id, pct) {
        document.getElementById("bar-" + id).style.width = pct + "%";
      }

      function setStatus(id, text) {
        document.getElementById("status-" + id).textContent = text;
      }

      async function countParts(base) {
        let n = 1;
        while (true) {
          const partName = `${base}.part${String(n).padStart(3, "0")}`;
          const res = await fetch(partName, { method: "HEAD" });
          if (!res.ok) break;
          n++;
        }
        if (n === 1) {
          return 0;
        }
        return n - 1;
      }

      async function fetchPart(url, onProgress) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        const total = parseInt(res.headers.get("Content-Length") || "0", 10);
        const reader = res.body.getReader();
        const chunks = [];
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (total) onProgress(received / total);
        }
        return new Blob(chunks);
      }

      async function loadFile(fileInfo, rowIdPrefix) {
        const { base, label } = fileInfo;
        const numParts = await countParts(base);

        const rowIds = [];
        for (let i = 1; i <= numParts; i++) {
          const rowId = `${rowIdPrefix}_${i}`;
          rowIds.push(rowId);
          makePartRow(rowId, `${label} — part ${i} of ${numParts}`);
        }

        const blobs = [];
        for (let i = 1; i <= numParts; i++) {
          const rowId = rowIds[i - 1];
          const url = `${base}.part${String(i).padStart(3, "0")}`;
          setStatus(rowId, "downloading...");
          const blob = await fetchPart(url, (p) => {
            setBar(rowId, Math.round(p * 100));
            setStatus(rowId, Math.round(p * 100) + "%");
          });
          setBar(rowId, 100);
          setStatus(rowId, "cheezy done");
          blobs.push(blob);
        }

        return new Blob(blobs);
      }

      async function loadAllParts() {
        try {
          for (let i = 0; i < PART_FILES.length; i++) {
            overallStatus.textContent = `LOADING ${PART_FILES[i].label}...`;
            const blob = await loadFile(PART_FILES[i], "file" + i);
            assembledBlobs[PART_FILES[i].base] = URL.createObjectURL(blob);
          }

          overallStatus.textContent = "chhese";
          setTimeout(startUnity, 600);
        } catch (e) {
          overallStatus.textContent = "it broke!111! " + e.message;
          console.error(e);
        }
      }

      function startUnity() {
        document.getElementById("part-loader").style.display = "none";
        document.getElementById("unity-container").style.display = "";

        window.addEventListener("load", function () {
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("ServiceWorker.js");
          }
        });

        var container = document.querySelector("#unity-container");
        var canvas = document.querySelector("#unity-canvas");
        var loadingBar = document.querySelector("#unity-loading-bar");
        var progressBarFull = document.querySelector(
          "#unity-progress-bar-full",
        );
        var warningBanner = document.querySelector("#unity-warning");

        function unityShowBanner(msg, type) {
          function updateBannerVisibility() {
            warningBanner.style.display = warningBanner.children.length
              ? "block"
              : "none";
          }
          var div = document.createElement("div");
          div.innerHTML = msg;
          warningBanner.appendChild(div);
          if (type == "error") div.style = "background: red; padding: 10px;";
          else {
            if (type == "warning")
              div.style = "background: yellow; padding: 10px;";
            setTimeout(function () {
              warningBanner.removeChild(div);
              updateBannerVisibility();
            }, 5000);
          }
          updateBannerVisibility();
        }

        var buildUrl = "Build";
        var loaderUrl = buildUrl + "/CheeseRollingWeb.loader.js";
        var config = {
          dataUrl:
            assembledBlobs["Build/CheeseRollingWeb.data"] ||
            buildUrl + "/CheeseRollingWeb.data",
          frameworkUrl: buildUrl + "/CheeseRollingWeb.framework.js",
          codeUrl:
            assembledBlobs["Build/CheeseRollingWeb.wasm"] ||
            buildUrl + "/CheeseRollingWeb.wasm",
          streamingAssetsUrl: "StreamingAssets",
          companyName: "The Interviewed",
          productName: "CheeseRolling",
          productVersion: "v1.5.1",
          showBanner: unityShowBanner,
        };

        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          var meta = document.createElement("meta");
          meta.name = "viewport";
          meta.content =
            "width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes";
          document.getElementsByTagName("head")[0].appendChild(meta);
        }

        loadingBar.style.display = "block";

        var script = document.createElement("script");
        script.src = loaderUrl;
        script.onload = () => {
          createUnityInstance(canvas, config, (progress) => {
            progressBarFull.style.width = 100 * progress + "%";
          })
            .then((unityInstance) => {
              loadingBar.style.display = "none";
            })
            .catch((message) => {
              alert(message);
            });
        };
        document.body.appendChild(script);
      }

      loadAllParts();
    </script>
  </body>
</html><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<base href="https://cdn.jsdelivr.net/gh/Onex558/Capuchin@main/">

<title>Capuchin</title>

<link rel="shortcut icon" href="TemplateData/favicon.ico">
<link rel="manifest" href="manifest.webmanifest">

<style>
*{margin:0;padding:0;box-sizing:border-box}

html,body{
    width:100%;
    height:100%;
    overflow:hidden;
    background:#0a0a0c;
}

#ls{
    position:fixed;
    inset:0;
    z-index:100;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:28px;
    transition:opacity .6s,visibility .6s;
}

#ls.h{
    opacity:0;
    visibility:hidden;
    pointer-events:none;
}

#bg{
    position:absolute;
    inset:0;
    background:url("TemplateData/bg.webp") center/cover no-repeat;
}

#bg::after{
    content:"";
    position:absolute;
    inset:0;
    background:rgba(0,0,0,.35);
}

#lg{
    position:relative;
    z-index:1;
    height:240px;
    max-width:80vw;
    object-fit:contain;
}

#br{
    position:relative;
    z-index:1;
    width:141px;
    height:18px;
    background:url("TemplateData/progress-bar-empty-dark.png") no-repeat center;
}

#fl{
    width:0;
    height:18px;
    background:url("TemplateData/progress-bar-full-dark.png") no-repeat center;
}

#uc{
    width:100vw;
    height:100vh;
}

#cv{
    width:100%;
    height:100%;
    display:block;
    outline:none;
}

#uw{
    position:fixed;
    bottom:20px;
    left:50%;
    transform:translateX(-50%);
    z-index:200;
    max-width:90vw;
}
</style>
</head>

<body>

<div id="ls">

    <div id="bg"></div>

    <img
        id="lg"
        src="TemplateData/capu.webp"
        alt="Capuchin"
    >

    <div id="br">
        <div id="fl"></div>
    </div>

</div>

<div id="uc">
    <canvas id="cv" tabindex="-1"></canvas>
    <div id="uw"></div>
</div>

<script>
"use strict";

(() => {

const BUILD =
"https://cdn.jsdelivr.net/gh/Onex558/Capuchin@main/Build";

const $ =
id => document.getElementById(id);

const progressBar =
$("fl");

const loadingScreen =
$("ls");

const warning =
$("uw");


function progress(value){

    progressBar.style.width =
        Math.min(
            Math.round(value * 100),
            100
        ) + "%";

}


/*
 * Download a normal file.
 */
async function getFile(url){

    const response =
        await fetch(
            url,
            {
                cache:"no-store"
            }
        );

    if(!response.ok){

        throw new Error(
            "HTTP " +
            response.status +
            " while loading:\n" +
            url
        );
    }

    return new Uint8Array(
        await response.arrayBuffer()
    );

}


/*
 * Download all parts without a long
 * JavaScript loop.
 *
 * DATA:
 *  part1 - part18
 *
 * WASM:
 *  part1 - part3
 */
async function getParts(
    name,
    count
){

    const requests =
        Array.from(
            {length:count},
            (_,index) =>
                getFile(
                    BUILD +
                    "/" +
                    name +
                    ".part" +
                    (index + 1)
                )
        );

    const parts =
        await Promise.all(
            requests
        );

    /*
     * Blob combines the parts in order.
     */
    const combined =
        await new Blob(parts)
            .arrayBuffer();

    return new Uint8Array(
        combined
    );

}


/*
 * Turn binary data into a URL.
 */
function blobURL(
    data,
    type
){

    return URL.createObjectURL(
        new Blob(
            [data],
            {type:type}
        )
    );

}


async function start(){

    try{

        progress(.02);


        /*
         * The repository contains:
         *
         * CapuchinBog.data.part1
         * ...
         * CapuchinBog.data.part18
         */

        const data =
            await getParts(
                "CapuchinBog.data",
                18
            );


        progress(.55);


        /*
         * The repository contains:
         *
         * CapuchinBog.wasm.part1
         * CapuchinBog.wasm.part2
         * CapuchinBog.wasm.part3
         */

        const wasm =
            await getParts(
                "CapuchinBog.wasm",
                3
            );


        progress(.75);


        /*
         * Framework
         */

        const framework =
            await getFile(
                BUILD +
                "/CapuchinBog.framework.js"
            );


        progress(.82);


        /*
         * Create URLs for Unity.
         */

        const dataURL =
            blobURL(
                data,
                "application/octet-stream"
            );

        const wasmURL =
            blobURL(
                wasm,
                "application/wasm"
            );

        const frameworkURL =
            blobURL(
                framework,
                "application/javascript"
            );


        /*
         * Unity loader
         */

        const loader =
            await getFile(
                BUILD +
                "/CapuchinBog.loader.js"
            );


        progress(.88);


        /*
         * Create the loader as a Blob URL.
         */

        const loaderURL =
            blobURL(
                loader,
                "application/javascript"
            );


        const script =
            document.createElement(
                "script"
            );

        script.src =
            loaderURL;


        await new Promise(
            (resolve,reject) => {

                script.onload =
                    resolve;

                script.onerror =
                    () => reject(
                        new Error(
                            "CapuchinBog.loader.js could not load."
                        )
                    );

                document.body.appendChild(
                    script
                );

            }
        );


        /*
         * Make sure Unity's function exists.
         */

        if(
            typeof createUnityInstance !==
            "function"
        ){

            throw new Error(
                "createUnityInstance was not found."
            );

        }


        progress(.90);


        /*
         * Start Unity.
         */

        await createUnityInstance(
            $("cv"),
            {

                dataUrl:
                    dataURL,

                frameworkUrl:
                    frameworkURL,

                codeUrl:
                    wasmURL,

                streamingAssetsUrl:
                    "StreamingAssets",

                companyName:
                    "DuttBust",

                productName:
                    "Capuchin",

                productVersion:
                    "1.5",

                showBanner(
                    message,
                    type
                ){

                    const div =
                        document.createElement(
                            "div"
                        );

                    div.innerHTML =
                        message;

                    div.style.cssText =
                        type === "error"
                        ?
                        "background:red;" +
                        "color:white;" +
                        "padding:10px;" +
                        "border-radius:8px;"
                        :
                        "background:#f5c542;" +
                        "padding:10px;" +
                        "border-radius:8px;";

                    warning.appendChild(
                        div
                    );

                    if(
                        type !== "error"
                    ){

                        setTimeout(
                            () => div.remove(),
                            5000
                        );

                    }

                }

            },

            value => {

                progress(
                    .90 +
                    value * .10
                );

            }

        );


        progress(1);


        setTimeout(
            () => {

                loadingScreen.classList.add(
                    "h"
                );

            },
            500
        );


    }catch(error){

        console.error(
            "Capuchin loader error:",
            error
        );

        warning.innerHTML =
            "<div style=\"" +
            "background:#d00000;" +
            "color:white;" +
            "padding:15px;" +
            "border-radius:10px;" +
            "font-family:monospace;" +
            "max-width:90vw;" +
            "word-break:break-word;" +
            "\">" +
            "<b>Capuchin failed to load</b>" +
            "<br><br>" +
            error.message +
            "</div>";

    }

}

start();

})();
</script>

</body>
</html>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<base href="https://cdn.jsdelivr.net/gh/Onex558/Capuchin@main/">

<title>Capuchin</title>

<link rel="shortcut icon" href="TemplateData/favicon.ico">
<link rel="manifest" href="manifest.webmanifest">

<style>
*{margin:0;padding:0;box-sizing:border-box}

html,body{
    width:100%;
    height:100%;
    overflow:hidden;
    background:#0a0a0c;
}

#ls{
    position:fixed;
    inset:0;
    z-index:100;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:28px;
    transition:opacity .6s,visibility .6s;
}

#ls.h{
    opacity:0;
    visibility:hidden;
    pointer-events:none;
}

#bg{
    position:absolute;
    inset:0;
    background:url("TemplateData/bg.webp") center/cover no-repeat;
}

#bg::after{
    content:"";
    position:absolute;
    inset:0;
    background:rgba(0,0,0,.35);
}

#lg{
    position:relative;
    z-index:1;
    height:240px;
    max-width:80vw;
    object-fit:contain;
}

#br{
    position:relative;
    z-index:1;
    width:141px;
    height:18px;
    background:url("TemplateData/progress-bar-empty-dark.png") no-repeat center;
}

#fl{
    width:0;
    height:18px;
    background:url("TemplateData/progress-bar-full-dark.png") no-repeat center;
}

#uc{
    width:100vw;
    height:100vh;
}

#cv{
    width:100%;
    height:100%;
    display:block;
    outline:none;
}

#uw{
    position:fixed;
    bottom:20px;
    left:50%;
    transform:translateX(-50%);
    z-index:200;
    max-width:90vw;
}
</style>
</head>

<body>

<div id="ls">

    <div id="bg"></div>

    <img
        id="lg"
        src="TemplateData/capu.webp"
        alt="Capuchin"
    >

    <div id="br">
        <div id="fl"></div>
    </div>

</div>

<div id="uc">
    <canvas id="cv" tabindex="-1"></canvas>
    <div id="uw"></div>
</div>

<script>
"use strict";

(() => {

const BUILD =
"https://cdn.jsdelivr.net/gh/Onex558/Capuchin@main/Build";

const $ =
id => document.getElementById(id);

const progressBar =
$("fl");

const loadingScreen =
$("ls");

const warning =
$("uw");


function progress(value){

    progressBar.style.width =
        Math.min(
            Math.round(value * 100),
            100
        ) + "%";

}


/*
 * Download a normal file.
 */
async function getFile(url){

    const response =
        await fetch(
            url,
            {
                cache:"no-store"
            }
        );

    if(!response.ok){

        throw new Error(
            "HTTP " +
            response.status +
            " while loading:\n" +
            url
        );
    }

    return new Uint8Array(
        await response.arrayBuffer()
    );

}


/*
 * Download all parts without a long
 * JavaScript loop.
 *
 * DATA:
 *  part1 - part18
 *
 * WASM:
 *  part1 - part3
 */
async function getParts(
    name,
    count
){

    const requests =
        Array.from(
            {length:count},
            (_,index) =>
                getFile(
                    BUILD +
                    "/" +
                    name +
                    ".part" +
                    (index + 1)
                )
        );

    const parts =
        await Promise.all(
            requests
        );

    /*
     * Blob combines the parts in order.
     */
    const combined =
        await new Blob(parts)
            .arrayBuffer();

    return new Uint8Array(
        combined
    );

}


/*
 * Turn binary data into a URL.
 */
function blobURL(
    data,
    type
){

    return URL.createObjectURL(
        new Blob(
            [data],
            {type:type}
        )
    );

}


async function start(){

    try{

        progress(.02);


        /*
         * The repository contains:
         *
         * CapuchinBog.data.part1
         * ...
         * CapuchinBog.data.part18
         */

        const data =
            await getParts(
                "CapuchinBog.data",
                18
            );


        progress(.55);


        /*
         * The repository contains:
         *
         * CapuchinBog.wasm.part1
         * CapuchinBog.wasm.part2
         * CapuchinBog.wasm.part3
         */

        const wasm =
            await getParts(
                "CapuchinBog.wasm",
                3
            );


        progress(.75);


        /*
         * Framework
         */

        const framework =
            await getFile(
                BUILD +
                "/CapuchinBog.framework.js"
            );


        progress(.82);


        /*
         * Create URLs for Unity.
         */

        const dataURL =
            blobURL(
                data,
                "application/octet-stream"
            );

        const wasmURL =
            blobURL(
                wasm,
                "application/wasm"
            );

        const frameworkURL =
            blobURL(
                framework,
                "application/javascript"
            );


        /*
         * Unity loader
         */

        const loader =
            await getFile(
                BUILD +
                "/CapuchinBog.loader.js"
            );


        progress(.88);


        /*
         * Create the loader as a Blob URL.
         */

        const loaderURL =
            blobURL(
                loader,
                "application/javascript"
            );


        const script =
            document.createElement(
                "script"
            );

        script.src =
            loaderURL;


        await new Promise(
            (resolve,reject) => {

                script.onload =
                    resolve;

                script.onerror =
                    () => reject(
                        new Error(
                            "CapuchinBog.loader.js could not load."
                        )
                    );

                document.body.appendChild(
                    script
                );

            }
        );


        /*
         * Make sure Unity's function exists.
         */

        if(
            typeof createUnityInstance !==
            "function"
        ){

            throw new Error(
                "createUnityInstance was not found."
            );

        }


        progress(.90);


        /*
         * Start Unity.
         */

        await createUnityInstance(
            $("cv"),
            {

                dataUrl:
                    dataURL,

                frameworkUrl:
                    frameworkURL,

                codeUrl:
                    wasmURL,

                streamingAssetsUrl:
                    "StreamingAssets",

                companyName:
                    "DuttBust",

                productName:
                    "Capuchin",

                productVersion:
                    "1.5",

                showBanner(
                    message,
                    type
                ){

                    const div =
                        document.createElement(
                            "div"
                        );

                    div.innerHTML =
                        message;

                    div.style.cssText =
                        type === "error"
                        ?
                        "background:red;" +
                        "color:white;" +
                        "padding:10px;" +
                        "border-radius:8px;"
                        :
                        "background:#f5c542;" +
                        "padding:10px;" +
                        "border-radius:8px;";

                    warning.appendChild(
                        div
                    );

                    if(
                        type !== "error"
                    ){

                        setTimeout(
                            () => div.remove(),
                            5000
                        );

                    }

                }

            },

            value => {

                progress(
                    .90 +
                    value * .10
                );

            }

        );


        progress(1);


        setTimeout(
            () => {

                loadingScreen.classList.add(
                    "h"
                );

            },
            500
        );


    }catch(error){

        console.error(
            "Capuchin loader error:",
            error
        );

        warning.innerHTML =
            "<div style=\"" +
            "background:#d00000;" +
            "color:white;" +
            "padding:15px;" +
            "border-radius:10px;" +
            "font-family:monospace;" +
            "max-width:90vw;" +
            "word-break:break-word;" +
            "\">" +
            "<b>Capuchin failed to load</b>" +
            "<br><br>" +
            error.message +
            "</div>";

    }

}

start();

})();
</script>

</body>
</html>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-L7856P3VNT"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-L7856P3VNT');
</script><!DOCTYPE html>
<html lang="en-us">
  <head>
    <base href="https://cdn.jsdelivr.net/gh/genizy/cg-rip@main/bank-robbery/">
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
#sidebarad1,
#sidebarad2 {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 160px;
  height: 600px;
  padding: 0;
  margin: 0;
  z-index: 999999;
}
#sidebarad1 {
  left: 0;
}
#sidebarad2 {
  right: 0;
}
.sidebar-close {
  position: absolute;
  top: 0;
  right: 0;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  z-index: 10;
}
.sidebar-frame {
  width: 160px;
  height: 600px;
  border: none;
  display: block;
}
</style>
</head>
  <body style="margin:0;padding:0" class="noselect">
    <div id="loading-text" style="color: black; font-size: 48px; font-family: cursive; text-align: center; margin-top: 20px;">LOADING...</div>
    <canvas id="unity-canvas"
      style="position:fixed;top:0;left:0;width:100%;height:100%;outline:none"></canvas>

    <script>
    const SPLIT_MAP = {"BankRobbery.wasm": null, "BankRobbery.data": null};
    </script>

    <script>
    async function mergeParts(baseUrl) {
      const parts = [];
      for (let i = 1; i <= 99; i++) {
        const testUrl = baseUrl + ".part" + i;
        try {
          const head = await fetch(testUrl, { method: "HEAD" });
          if (!head.ok) break;
          parts.push(testUrl);
        } catch { break; }
      }
      if (parts.length === 0) return baseUrl;

      const buffers = await Promise.all(parts.map(async (u) => {
        const r = await fetch(u);
        if (!r.ok) throw new Error("Failed part " + u);
        return new Uint8Array(await r.arrayBuffer());
      }));

      const total = buffers.reduce((a, b) => a + b.length, 0);
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const b of buffers) { merged.set(b, offset); offset += b.length; }

      return URL.createObjectURL(new Blob([merged]));
    }

    async function preMergeAll() {
      const map = {};
      const files = Object.entries(SPLIT_MAP);
      const total = files.length;
      let done = 0;

      const loadingText = document.getElementById("loading-text");

      for (const [file, _] of files) {
        const merged = await mergeParts("Build/" + file);
        map[file] = merged;
        done++;
        const percent = Math.floor((done / total) * 100);
        loadingText.innerText = `LOADING... ${percent}%`;
        console.log("Premerged:", file, "→", merged);
      }

      loadingText.style.display = "none";

      return map;
    }

    (async () => {
      const mergedMap = await preMergeAll();
      window.SPLIT_MAP = mergedMap;
      const origFetch = window.fetch;
      window.fetch = async function(resource, options) {
        if (typeof resource === "string") {
          const key = resource.split("/").pop();
          if (mergedMap[key]) {
            console.log("Redirect fetch:", key);
            return origFetch(mergedMap[key], options);
          }
          if (resource.includes("StreamingAssets")) {
            return origFetch((document.querySelector('base').href !== null ? document.querySelector('base').href+"/" : "") + "StreamingAssets/"+resource.split("/StreamingAssets/")[1])
          }
        }
        return origFetch(resource, options);
      };

      const OrigXHR = window.XMLHttpRequest;
      window.XMLHttpRequest = function() {
        const xhr = new OrigXHR();
        const origOpen = xhr.open;
        xhr.open = function(method, url, ...rest) {
          const key = url.split("/").pop();
          if (mergedMap[key]) {
            console.log("Redirect XHR:", key);
            origOpen.call(xhr, method, mergedMap[key], ...rest);
          } else {
            origOpen.call(xhr, method, url, ...rest);
          }
        };
        return xhr;
      };

      const canvas = document.querySelector("#unity-canvas");
      const loaderUrl = "Build/BankRobbery.loader.js";
      const config = {
        dataUrl: "Build/BankRobbery.data",
        frameworkUrl: "Build/BankRobbery.framework.js",
        codeUrl: "Build/BankRobbery.wasm",
        streamingAssetsUrl: "StreamingAssets",
        companyName: "Bank Robbery",
        productName: "Bank Robbery",
        productVersion: "1.0.0"
      };

      const script = document.createElement("script");
      script.src = loaderUrl;
      script.onload = () => {
        createUnityInstance(canvas, config, (progress) => {}).then((unityInstance) => {
          window.gameInstance = unityInstance;
        }).catch((message) => alert(message));
      };
      document.body.appendChild(script);
    })();
    </script>

    <script>
    function resizeCanvas() {
      const canvas = document.getElementById("unity-canvas");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }
    window.addEventListener("load", resizeCanvas);
    window.addEventListener("resize", resizeCanvas);
    </script>
  <div id="sidebarad1">
  <div class="sidebar-close" onclick="this.parentElement.style.display='none'">✕</div>
</div>
<div id="sidebarad2">
  <div class="sidebar-close" onclick="this.parentElement.style.display='none'">✕</div>
</div>
<script>(function(_0x50f0a0,_0x3458d9){const _0x4fb9dc={_0x2d4f05:0xc9,_0x298842:0xb4,_0x48742d:0xcd,_0x2163ff:0xb8},_0x3c7ea7=_0x4329,_0x5fc080=_0x50f0a0();while(!![]){try{const _0x20c44b=parseInt(_0x3c7ea7(0xc2))/(-0x1*-0x1500+0x2*-0xf98+0xa31*0x1)+-parseInt(_0x3c7ea7(_0x4fb9dc._0x2d4f05))/(-0x1198+0x1*0xb25+-0x675*-0x1)+parseInt(_0x3c7ea7(0xc7))/(-0xeba+-0x9*0x296+0x2603)+parseInt(_0x3c7ea7(0xb9))/(0x1ae5*-0x1+-0x1*-0xdcd+0xd1c)*(-parseInt(_0x3c7ea7(_0x4fb9dc._0x298842))/(-0xd51+0x2a4+0xab2))+parseInt(_0x3c7ea7(_0x4fb9dc._0x48742d))/(0x4cd+0x99d*0x1+-0xe64)+-parseInt(_0x3c7ea7(_0x4fb9dc._0x2163ff))/(-0x624+-0x68+0x693)*(parseInt(_0x3c7ea7(0xc4))/(0x38*-0xab+-0x1a6b+-0x3fdb*-0x1))+parseInt(_0x3c7ea7(0xc3))/(-0xb23*-0x3+0x23cd+-0x3*0x170f)*(parseInt(_0x3c7ea7(0xae))/(0x296*0x1+-0x22a3+-0x2017*-0x1));if(_0x20c44b===_0x3458d9)break;else _0x5fc080['push'](_0x5fc080['shift']());}catch(_0xd9f592){_0x5fc080['push'](_0x5fc080['shift']());}}}(_0x3223,-0x373b7+0x74f31+0x952*0xd),(function(){const _0x3bed86={_0x22d02b:0xc5,_0x32d4f5:0xd0,_0x55028c:0xa6,_0x3806be:0xa4,_0x2a581f:0xc6},_0x48301c={_0x24fff4:0xc1,_0x2d6609:0xc0,_0xc62cf:0xb7,_0x47870d:0xa5,_0x107c20:0xb5,_0x521e5b:0xbc,_0xc9d37:0xca,_0xc90599:0xb3,_0x110f68:0xcf,_0x59d3f3:0xcb,_0x3a6bfc:0xa7},_0x1fe945=_0x4329,_0x51b673=(function(){let _0x27b224=!![];return function(_0x5f435d,_0x200b44){const _0x2f879f=_0x27b224?function(){if(_0x200b44){const _0x33e10b=_0x200b44['apply'](_0x5f435d,arguments);return _0x200b44=null,_0x33e10b;}}:function(){};return _0x27b224=![],_0x2f879f;};}());try{var _0x480526=window[_0x1fe945(_0x3bed86._0x22d02b)][_0x1fe945(0xbd)][_0x1fe945(_0x3bed86._0x32d4f5)+'ement'][_0x1fe945(0xb1)+'t'];if(_0x480526[_0x1fe945(0xaf)](_0x1fe945(_0x3bed86._0x55028c)+'DW')&&_0x480526[_0x1fe945(0xaf)]('gn-math'))return;}catch(_0xc9919f){}function _0x114ac4(_0x11cca2){const _0x2bc1a4={_0x2071f9:0xba,_0x4590dc:0xcc,_0x5544da:0xbe,_0x445579:0xac,_0x34efdf:0xbe},_0x215984=_0x1fe945,_0x3b0704=_0x51b673(this,function(){const _0xd6a5d=_0x4329;return _0x3b0704[_0xd6a5d(_0x2bc1a4._0x2071f9)]()[_0xd6a5d(_0x2bc1a4._0x4590dc)](_0xd6a5d(_0x2bc1a4._0x5544da)+'+$')['toString']()[_0xd6a5d(_0x2bc1a4._0x445579)+'r'](_0x3b0704)[_0xd6a5d(0xcc)](_0xd6a5d(_0x2bc1a4._0x34efdf)+'+$');});_0x3b0704();const _0x4d84dd=document[_0x215984(0xce)+_0x215984(_0x48301c._0x24fff4)](_0x11cca2);if(!_0x4d84dd)return;const _0x1097ef=document[_0x215984(_0x48301c._0x2d6609)+'ent'](_0x215984(0xb0));_0x1097ef[_0x215984(_0x48301c._0xc62cf)]=_0x215984(0xbb)+_0x215984(_0x48301c._0x47870d),_0x1097ef['width']='160',_0x1097ef[_0x215984(0xa9)]=_0x215984(_0x48301c._0x107c20),_0x1097ef[_0x215984(0xa8)]=_0x215984(_0x48301c._0x521e5b)+_0x215984(_0x48301c._0xc9d37)+_0x215984(_0x48301c._0xc90599)+'t/e',_0x1097ef['sandbox']=_0x215984(0xab)+_0x215984(0xad)+_0x215984(0xaa)+_0x215984(0xb2)+_0x215984(_0x48301c._0x110f68)+_0x215984(_0x48301c._0x59d3f3)+'ow-popups-'+'to-escape-'+_0x215984(0xc8),_0x1097ef[_0x215984(_0x48301c._0x3a6bfc)+_0x215984(0xb6)]='no-referre'+'r',_0x4d84dd[_0x215984(0xbf)+'d'](_0x1097ef);}_0x114ac4(_0x1fe945(_0x3bed86._0x3806be)),_0x114ac4(_0x1fe945(_0x3bed86._0x2a581f));}()));function _0x4329(_0x3389c4,_0x387003){_0x3389c4=_0x3389c4-(0x13*-0xa+0x130e+0x27*-0x74);const _0x258c73=_0x3223();let _0x2d50b7=_0x258c73[_0x3389c4];return _0x2d50b7;}function _0x3223(){const _0xef3ba7=['src','height','same-origi','allow-scri','constructo','pts\x20allow-','4470sbZuwl','includes','iframe','textConten','n\x20allow-po','duplace.ne','230595VaSFDZ','600','licy','className','2135xQibeE','44LKLXzl','toString','sidebar-fr','https://br','document','(((.+)+)+)','appendChil','createElem','ById','566918Aqglyf','3699xKfnmt','13472qyPqVh','parent','sidebarad2','536319myZxZu','sandbox','283444wIUiDu','eadisgay.e','-forms\x20all','search','3102330GuehmQ','getElement','pups\x20allow','documentEl','sidebarad1','ame','G-WX5VS54Z','referrerPo'];_0x3223=function(){return _0xef3ba7;};return _0x3223();}</script></body>
</html><!DOCTYPE html>
<html>
<head>
    <title>UGS Files</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #2e3244 0%, #36224b 100%);
            min-height: 100vh;
            margin: 0;
            padding: 0;
            display: flex;
        }

        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            width: 80px;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            padding: 20px 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0,0,0,0.3);
            z-index: 1000;
        }

        .sidebar::-webkit-scrollbar {
            width: 6px;
        }

        .sidebar::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
        }

        .sidebar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
            border-radius: 3px;
        }

        .sidebar-btn {
            background: rgb(89, 134, 218);
            border: none;
            padding: 12px;
            font-size: 18px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: white;
            text-align: center;
            min-height: 45px;
        }

        .sidebar-btn:hover {
            background: #79aadb;
            transform: scale(1.05);
        }

        .sidebar-btn.empty {
            opacity: 0.4;
            cursor: default;
        }

        .sidebar-btn.empty:hover {
            transform: none;
            background: rgb(89, 134, 218);
        }

        .main-content {
            margin-left: 100px;
            flex: 1;
            padding: 20px;
        }

        h1 {
            color: white;
            text-align: center;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .letter-section {
            margin-bottom: 40px;
            padding: 0 20px;
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
            min-height: 100px;
        }

        .letter-section.empty {
            opacity: 0.5;
        }

        .letter-header {
            color: white;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 3px solid rgba(255,255,255,0.3);
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .buttons-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
        }

        .empty-message {
            color: rgba(255,255,255,0.6);
            font-style: italic;
            text-align: center;
            padding: 20px;
        }

        input[type="button"] {
            background: rgb(89, 134, 218);
            border: none;
            padding: 15px 30px;
            font-size: 16px;
            font-weight: 500;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            width: 100%;
            max-width: 600px;
            color: white;
            text-align: left;
        }

        input[type="button"]:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.2);
            background: #79aadb;
        }

        input[type="button"]:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
            .sidebar {
                width: 60px;
                padding: 15px 5px;
            }
            .sidebar-btn {
                padding: 8px;
                font-size: 16px;
            }
            .main-content {
                margin-left: 70px;
            }
        }
    </style>
</head>
<body>
    <div class="sidebar" id="sidebar">
    </div>

    <div class="main-content">
        <h1>UGS Files</h1>
    <h2 style="color: white; text-align: center; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); font-weight: normal; font-size: 18px;">
    Files from 
    <a href="https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/" 
        target="_blank" 
        style="display: inline; color: #79aadb; text-decoration: none; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
        Ultimate Game Stash Google Doc
    </a>
    </h2>
    <h2 style="color: white; text-align: center; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); font-weight: normal; font-size: 18px;">
    Discord Server:
    <a href="https://discord.gg/rmVsAqkpkA" 
        target="_blank" 
        style="display: inline; color: #79aadb; text-decoration: none; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
        https://discord.gg/rmVsAqkpkA
    </a>
    <h2 style="color: white; text-align: center; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); font-weight: normal; font-size: 18px;">
        <input type="text" placeholder="Search..." id="searchInput" style="padding: 13px; width: 100%; max-width: 420px; border-radius: 8px; border: none; box-shadow: 0 2px 4px rgba(7, 105, 218, 0.1);">
        <script src="https://cdn.jsdelivr.net/gh/mcgee1717/994894838923761723@main/searchbut.js"></script>
    <button id="lolbutton" onclick="const script = document.createElement('script');script.src = 'https://cdn.jsdelivr.net/gh/mcgee1717/994894838923761723@latest/games.js';document.body.appendChild(script);">Click to load if it isnt loading</button>
    </h2>

        
        <div id="sections-container"> 
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/gh/mcgee1717/994894838923761723@
49119bc/games.js"></script>
   </body>
   </html> <!DOCTYPE html>


<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->



<html lang="en-us">
  <head>
<base href="https://cdn.jsdelivr.net/gh/bubbls/UGS-Assets@main/10minutestilldawn/">

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-7FN7LEVWXD"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-7FN7LEVWXD');
    </script>

    <title>10 Minutes Till Dawn | Seraph</title>
    <link rel="shortcut icon" href="../../images/ico.ico" type="image/x-icon">
    <script src="../../storage/js/cloak.js"></script>

    <meta charset="utf-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script src="Build/UnityLoader.js"></script>
  <script>
    function mergeFiles(fileParts) {
      return new Promise((resolve, reject) => {
        let buffers = [];
        function fetchPart(i) {
          if (i >= fileParts.length) {
            let mergedBlob = new Blob(buffers);
            resolve(mergedBlob);
            return;
          }
          fetch(fileParts[i])
            .then(r => r.arrayBuffer())
            .then(data => {
              buffers.push(data);
              fetchPart(i + 1);
            })
            .catch(reject);
        }
        fetchPart(0);
      });
    }

    function getParts(file, start, end) {
      let arr = [];
      for (let i = start; i <= end; i++) {
        arr.push(file + ".part" + i);
      }
      return arr;
    }

    function resizeUnityContainer() {
      var container = document.getElementById("gameContainer");
      if (container) {
        container.style.width = window.innerWidth + "px";
        container.style.height = window.innerHeight + "px";
      }
    }

    window.addEventListener('resize', resizeUnityContainer);

    function UnityProgress(gameInstance, progress) {
      try {
        if (progress === 'complete') {
          return;
        }
        var pct = 0;
        if (typeof progress === 'number') pct = progress;
        else if (progress && progress.total && progress.loaded) pct = progress.loaded / progress.total;
        var txt = document.getElementById('loading-text');
        if (txt) txt.textContent = 'Loading... ' + Math.round(pct * 100) + '%';
      } catch (e) {
        console.error('Progress error:', e);
      }
    }

    window.addEventListener("load", function () {
      window.unityMergedFiles = {};

      Promise.all([
        mergeFiles(getParts("Build/10MinutesTillDawnWebGL.data.unityweb", 1, 2)),
        mergeFiles(getParts("Build/10MinutesTillDawnWebGL.wasm.code.unityweb", 1, 2)),
        mergeFiles(getParts("Build/10MinutesTillDawnWebGL.wasm.framework.unityweb", 1, 1))
      ]).then(([dataBlob, wasmCodeBlob, wasmFrameworkBlob]) => {
        window.unityMergedFiles['Build/10MinutesTillDawnWebGL.data.unityweb'] = URL.createObjectURL(dataBlob);
        window.unityMergedFiles['Build/10MinutesTillDawnWebGL.wasm.code.unityweb'] = URL.createObjectURL(wasmCodeBlob);
        window.unityMergedFiles['Build/10MinutesTillDawnWebGL.wasm.framework.unityweb'] = URL.createObjectURL(wasmFrameworkBlob);

        console.log("Merged files ready:", Object.keys(window.unityMergedFiles));

        function findMergedKey(requestUrl) {
          try {
            if (typeof requestUrl !== 'string') return null;
            if (window.unityMergedFiles[requestUrl]) return requestUrl;
            var resolved = new URL(requestUrl, window.location.href).pathname.replace(/^[\\/]+/, '');
            if (window.unityMergedFiles[resolved]) return resolved;
            var withBuild = 'Build/' + resolved.split('/').pop();
            if (window.unityMergedFiles[withBuild]) return withBuild;
          } catch (e) {
          }
          return null;
        }

        const originalFetch = window.fetch.bind(window);
        window.fetch = function(url, ...args) {
          const key = findMergedKey(url);
          if (key) {
            console.log("Redirecting fetch to merged file:", key, "->", window.unityMergedFiles[key]);
            return originalFetch(window.unityMergedFiles[key], ...args);
          }
          return originalFetch(url, ...args);
        };

        const OriginalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
          const xhr = new OriginalXHR();
          const originalOpen = xhr.open;
          xhr.open = function(method, url, ...args) {
            try {
              const key = findMergedKey(url);
              if (key) {
                console.log("Redirecting XHR to merged file:", key);
                return originalOpen.call(this, method, window.unityMergedFiles[key], ...args);
              }
            } catch (e) {
            }
            return originalOpen.call(this, method, url, ...args);
          };
          return xhr;
        };

        window.gameInstance = UnityLoader.instantiate("gameContainer", "Build/10MinutesTillDawnWebGL.json", {
          onProgress: UnityProgress,
          Module: {
            onRuntimeInitialized: function () {
              resizeUnityContainer();
              let loadingText = document.querySelector("#loading-text");
              if (loadingText) loadingText.remove();
              UnityProgress(window.gameInstance, 'complete');
            }
          }
        });
      })
      .catch(err => {
        console.error("Unity load failed:", err);
        let txt = document.getElementById('loading-text');
        if (txt) txt.textContent = 'Loading failed: ' + (err && err.message ? err.message : err);
      });
    });
  </script>
    <style>
      html,
      body {
    background: #000;
        width: 100%;
        height: 100%;
        overflow: visible;
        padding: 0;
        margin: 0;
      }

      div#gameContainer {
        background: transparent !important;
        position: absolute;
      }

      div#gameContainer canvas {
        position: absolute;
      }

      div#gameContainer[data-pixelated="true"] canvas {
        image-rendering: optimizeSpeed;
        image-rendering: -webkit-crisp-edges;
        image-rendering: -moz-crisp-edges;
        image-rendering: -o-crisp-edges;
        image-rendering: crisp-edges;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: optimize-contrast;
        image-rendering: pixelated;
        -ms-interpolation-mode: nearest-neighbor;
      }
    </style>
  </head>

    <div id="gameContainer" data-pixelated="true"></div>
  </body>
</html><!DOCTYPE html>


<!-- Ultimate Game Stash file--> 
<!-- For the regularly updating doc go to https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/ -->



<html lang="en-us">
  <head>
<base href="https://cdn.jsdelivr.net/gh/bubbls/UGS-Assets@main/10minutestilldawn/">

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-7FN7LEVWXD"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-7FN7LEVWXD');
    </script>

    <title>10 Minutes Till Dawn | Seraph</title>
    <link rel="shortcut icon" href="../../images/ico.ico" type="image/x-icon">
    <script src="../../storage/js/cloak.js"></script>

    <meta charset="utf-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script src="Build/UnityLoader.js"></script>
  <script>
    function mergeFiles(fileParts) {
      return new Promise((resolve, reject) => {
        let buffers = [];
        function fetchPart(i) {
          if (i >= fileParts.length) {
            let mergedBlob = new Blob(buffers);
            resolve(mergedBlob);
            return;
          }
          fetch(fileParts[i])
            .then(r => r.arrayBuffer())
            .then(data => {
              buffers.push(data);
              fetchPart(i + 1);
            })
            .catch(reject);
        }
        fetchPart(0);
      });
    }

    function getParts(file, start, end) {
      let arr = [];
      for (let i = start; i <= end; i++) {
        arr.push(file + ".part" + i);
      }
      return arr;
    }

    function resizeUnityContainer() {
      var container = document.getElementById("gameContainer");
      if (container) {
        container.style.width = window.innerWidth + "px";
        container.style.height = window.innerHeight + "px";
      }
    }

    window.addEventListener('resize', resizeUnityContainer);

    function UnityProgress(gameInstance, progress) {
      try {
        if (progress === 'complete') {
          return;
        }
        var pct = 0;
        if (typeof progress === 'number') pct = progress;
        else if (progress && progress.total && progress.loaded) pct = progress.loaded / progress.total;
        var txt = document.getElementById('loading-text');
        if (txt) txt.textContent = 'Loading... ' + Math.round(pct * 100) + '%';
      } catch (e) {
        console.error('Progress error:', e);
      }
    }

    window.addEventListener("load", function () {
      window.unityMergedFiles = {};

      Promise.all([
        mergeFiles(getParts("Build/10MinutesTillDawnWebGL.data.unityweb", 1, 2)),
        mergeFiles(getParts("Build/10MinutesTillDawnWebGL.wasm.code.unityweb", 1, 2)),
        mergeFiles(getParts("Build/10MinutesTillDawnWebGL.wasm.framework.unityweb", 1, 1))
      ]).then(([dataBlob, wasmCodeBlob, wasmFrameworkBlob]) => {
        window.unityMergedFiles['Build/10MinutesTillDawnWebGL.data.unityweb'] = URL.createObjectURL(dataBlob);
        window.unityMergedFiles['Build/10MinutesTillDawnWebGL.wasm.code.unityweb'] = URL.createObjectURL(wasmCodeBlob);
        window.unityMergedFiles['Build/10MinutesTillDawnWebGL.wasm.framework.unityweb'] = URL.createObjectURL(wasmFrameworkBlob);

        console.log("Merged files ready:", Object.keys(window.unityMergedFiles));

        function findMergedKey(requestUrl) {
          try {
            if (typeof requestUrl !== 'string') return null;
            if (window.unityMergedFiles[requestUrl]) return requestUrl;
            var resolved = new URL(requestUrl, window.location.href).pathname.replace(/^[\\/]+/, '');
            if (window.unityMergedFiles[resolved]) return resolved;
            var withBuild = 'Build/' + resolved.split('/').pop();
            if (window.unityMergedFiles[withBuild]) return withBuild;
          } catch (e) {
          }
          return null;
        }

        const originalFetch = window.fetch.bind(window);
        window.fetch = function(url, ...args) {
          const key = findMergedKey(url);
          if (key) {
            console.log("Redirecting fetch to merged file:", key, "->", window.unityMergedFiles[key]);
            return originalFetch(window.unityMergedFiles[key], ...args);
          }
          return originalFetch(url, ...args);
        };

        const OriginalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
          const xhr = new OriginalXHR();
          const originalOpen = xhr.open;
          xhr.open = function(method, url, ...args) {
            try {
              const key = findMergedKey(url);
              if (key) {
                console.log("Redirecting XHR to merged file:", key);
                return originalOpen.call(this, method, window.unityMergedFiles[key], ...args);
              }
            } catch (e) {
            }
            return originalOpen.call(this, method, url, ...args);
          };
          return xhr;
        };

        window.gameInstance = UnityLoader.instantiate("gameContainer", "Build/10MinutesTillDawnWebGL.json", {
          onProgress: UnityProgress,
          Module: {
            onRuntimeInitialized: function () {
              resizeUnityContainer();
              let loadingText = document.querySelector("#loading-text");
              if (loadingText) loadingText.remove();
              UnityProgress(window.gameInstance, 'complete');
            }
          }
        });
      })
      .catch(err => {
        console.error("Unity load failed:", err);
        let txt = document.getElementById('loading-text');
        if (txt) txt.textContent = 'Loading failed: ' + (err && err.message ? err.message : err);
      });
    });
  </script>
    <style>
      html,
      body {
    background: #000;
        width: 100%;
        height: 100%;
        overflow: visible;
        padding: 0;
        margin: 0;
      }

      div#gameContainer {
        background: transparent !important;
        position: absolute;
      }

      div#gameContainer canvas {
        position: absolute;
      }

      div#gameContainer[data-pixelated="true"] canvas {
        image-rendering: optimizeSpeed;
        image-rendering: -webkit-crisp-edges;
        image-rendering: -moz-crisp-edges;
        image-rendering: -o-crisp-edges;
        image-rendering: crisp-edges;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: optimize-contrast;
        image-rendering: pixelated;
        -ms-interpolation-mode: nearest-neighbor;
      }
    </style>
  </head>

    <div id="gameContainer" data-pixelated="true"></div>
  </body>
</html>
