﻿/*!
 * cdp.ui.jqm.js 2.1.0
 *
 * Date: 2018-04-23T06:45:15.827Z
 */
(function (root, factory) { if (typeof define === "function" && define.amd) { define(["cdp.framework.jqm", "cdp.tools", "cdp.ui.listview"], function () { return factory(root.CDP || (root.CDP = {})); }); } else { factory(root.CDP || (root.CDP = {})); } }(this, function (CDP) { CDP.UI = CDP.UI || {};
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Config = CDP.Config;
        var Framework = CDP.Framework;
        var TAG = "[CDP.UI.Theme] ";
        //__________________________________________________________________________________________________________//
        /**
         * @class Theme
         * @brief UI Theme 設定を行うユーティリティクラス
         */
        var Theme = /** @class */ (function () {
            function Theme() {
            }
            ///////////////////////////////////////////////////////////////////////
            // public static methods:
            /**
             * Theme の初期化
             *
             * @param options オプション指定
             * @returns true: 成功 / false: 失敗
             */
            Theme.initialize = function (options) {
                var opt = $.extend({}, {
                    platform: "auto",
                    reserveScrollbarRegion: true,
                }, options);
                if ("auto" === opt.platform) {
                    return Theme.detectUIPlatform(opt.reserveScrollbarRegion);
                }
                else {
                    if (Theme.setCurrentUIPlatform(opt.platform)) {
                        return opt.platform;
                    }
                    else {
                        console.warn(TAG + "setCurrentUIPlatform(), failed. platform: " + opt.platform);
                    }
                }
            };
            /**
             * 現在指定されている UI Platform を取得
             *
             * @return {String} ex) "ios"
             */
            Theme.getCurrentUIPlatform = function () {
                var $htms = $("html");
                for (var i = 0, n = Theme.s_platforms.length; i < n; i++) {
                    if ($htms.hasClass("ui-platform-" + Theme.s_platforms[i])) {
                        return Theme.s_platforms[i];
                    }
                }
                return null;
            };
            /**
             * UI Platform を設定
             *
             * @return {String} true: 成功 / false: 失敗
             */
            Theme.setCurrentUIPlatform = function (platform) {
                if (null == platform || Theme.s_platforms.indexOf(platform) >= 0) {
                    var $htms_1 = $("html");
                    Theme.s_platforms.forEach(function (target) {
                        $htms_1.removeClass("ui-platform-" + target);
                    });
                    if (platform) {
                        $htms_1.addClass("ui-platform-" + platform);
                    }
                    return true;
                }
                else {
                    return false;
                }
            };
            /**
             * 現在の Platform を判定し最適な platform を自動決定
             *
             * @param reserveScrollbarRegion PC デバッグ環境ではスクロールバーを表示. default: true
             * @returns ex) "ios"
             */
            Theme.detectUIPlatform = function (reserveScrollbarRegion) {
                if (reserveScrollbarRegion === void 0) { reserveScrollbarRegion = true; }
                var platform = "";
                // platform の設定
                if (Framework.Platform.iOS) {
                    $("html").addClass("ui-platform-ios");
                    platform = "ios";
                }
                else {
                    $("html").addClass("ui-platform-android");
                    platform = "android";
                }
                // PC デバッグ環境ではスクロールバーを表示
                if (Config.DEBUG && reserveScrollbarRegion && !Framework.Platform.Mobile) {
                    $("body").css("overflow-y", "scroll");
                }
                return platform;
            };
            /**
             * platform を配列で登録
             * 上書きされる
             *
             * @param {String[]} platforms [in] OS ex): ["ios", "android"]
             */
            Theme.registerUIPlatforms = function (platforms) {
                if (platforms) {
                    Theme.s_platforms = platforms;
                }
            };
            /**
             * page transition を登録
             * 上書きされる
             *
             * @param {TransitionMap} map [in] TransitionMap を指定
             */
            Theme.registerPageTransitionMap = function (map) {
                if (map) {
                    Theme.s_pageTransitionMap = map;
                }
            };
            /**
             * dialog transition を登録
             * 上書きされる
             *
             * @param {TransitionMap} map [in] TransitionMap を指定
             */
            Theme.registerDialogTransitionMap = function (map) {
                if (map) {
                    Theme.s_dialogTransitionMap = map;
                }
            };
            /**
             * page transition を取得
             * TransitionMap にアサインされているものであれば変換
             *
             * @return {String[]} "slide"
             */
            Theme.queryPageTransition = function (original) {
                var convert = Theme.s_pageTransitionMap[original];
                if (convert) {
                    return convert[Theme.getCurrentUIPlatform()] || convert.fallback;
                }
                else {
                    return original;
                }
            };
            /**
             * dialog transition を取得
             * TransitionMap にアサインされているものであれば変換
             *
             * @return {String[]} "slide"
             */
            Theme.queryDialogTransition = function (original) {
                var convert = Theme.s_dialogTransitionMap[original];
                if (convert) {
                    return convert[Theme.getCurrentUIPlatform()] || convert.fallback;
                }
                else {
                    return original;
                }
            };
            Theme.s_platforms = ["ios", "android"];
            Theme.s_pageTransitionMap = {
                "platform-default": {
                    ios: "slide",
                    android: "floatup",
                    fallback: "slide",
                },
                "platform-alternative": {
                    ios: "slideup",
                    android: "floatup",
                    fallback: "slideup",
                },
            };
            Theme.s_dialogTransitionMap = {
                "platform-default": {
                    ios: "popzoom",
                    android: "crosszoom",
                    fallback: "none",
                },
            };
            return Theme;
        }());
        UI.Theme = Theme;
        //__________________________________________________________________________________________________________//
        // jquey.mobile.changePage() の Hook.
        function applyCustomChangePage() {
            var jqmChangePage = $.mobile.changePage.bind($.mobile);
            function customChangePage(to, options) {
                if (_.isString(to)) {
                    if (options && options.transition) {
                        options.transition = Theme.queryPageTransition(options.transition);
                    }
                }
                jqmChangePage(to, options);
            }
            $.mobile.changePage = customChangePage;
        }
        // framework 初期化後に適用
        Framework.waitForInitialize()
            .done(function () {
            applyCustomChangePage();
        });
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        //__________________________________________________________________________________________________________//
        /**
         * @class ExtensionManager
         * @brief 拡張機能を管理するユーティリティクラス
         */
        var ExtensionManager = /** @class */ (function () {
            function ExtensionManager() {
            }
            /**
             * DOM 拡張関数の登録
             *
             * @param {DomExtension} func [in] DOM 拡張関数
             */
            ExtensionManager.registerDomExtension = function (func) {
                this.s_domExtensions.push(func);
            };
            /**
             * DOM 拡張を適用
             *
             * @param {jQuery} $ui       [in] 拡張対象の DOM
             * @param {Object} [options] [in] オプション
             */
            ExtensionManager.applyDomExtension = function ($ui, options) {
                this.s_domExtensions.forEach(function (func) {
                    func($ui, options);
                });
            };
            ExtensionManager.s_domExtensions = [];
            return ExtensionManager;
        }());
        UI.ExtensionManager = ExtensionManager;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
/* tslint:disable:no-bitwise */
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var TAG = "[CDP.UI.Toast] ";
        /**
         * @class Toast
         * @brief Android SDK の Toast クラスのように自動消滅するメッセージ出力ユーティリティ
         *        入れ子の関係を実現するために module で実装
         */
        var Toast;
        (function (Toast) {
            // 表示時間の定義
            Toast.LENGTH_SHORT = 1500; //!< 短い:1500 msec
            Toast.LENGTH_LONG = 4000; //!< 長い:4000 msec
            //! @enum オフセットの基準
            var OffsetX;
            (function (OffsetX) {
                OffsetX[OffsetX["LEFT"] = 1] = "LEFT";
                OffsetX[OffsetX["RIGHT"] = 2] = "RIGHT";
                OffsetX[OffsetX["CENTER"] = 4] = "CENTER";
            })(OffsetX = Toast.OffsetX || (Toast.OffsetX = {}));
            //! @enum オフセットの基準
            var OffsetY;
            (function (OffsetY) {
                OffsetY[OffsetY["TOP"] = 16] = "TOP";
                OffsetY[OffsetY["BOTTOM"] = 32] = "BOTTOM";
                OffsetY[OffsetY["CENTER"] = 64] = "CENTER";
            })(OffsetY = Toast.OffsetY || (Toast.OffsetY = {}));
            /**
             * @class StyleBuilderDefault
             * @brief スタイル変更時に使用する既定の構造体オブジェクト
             */
            var StyleBuilderDefault = /** @class */ (function () {
                function StyleBuilderDefault() {
                }
                //! class attribute に設定する文字列を取得
                StyleBuilderDefault.prototype.getClass = function () {
                    return "ui-loader ui-overlay-shadow ui-corner-all";
                };
                //! style attribute に設定する JSON オブジェクトを取得
                StyleBuilderDefault.prototype.getStyle = function () {
                    var style = {
                        "padding": "7px 25px 7px 25px",
                        "display": "block",
                        "background-color": "#1d1d1d",
                        "border-color": "#1b1b1b",
                        "color": "#fff",
                        "text-shadow": "0 1px 0 #111",
                        "font-weight": "bold",
                        "opacity": 0.8,
                    };
                    return style;
                };
                //! オフセットの基準位置を取得
                StyleBuilderDefault.prototype.getOffsetPoint = function () {
                    return OffsetX.CENTER | OffsetY.BOTTOM;
                };
                //! X 座標のオフセット値を取得
                StyleBuilderDefault.prototype.getOffsetX = function () {
                    return 0;
                };
                //! Y 座標のオフセット値を取得
                StyleBuilderDefault.prototype.getOffsetY = function () {
                    return -75;
                };
                return StyleBuilderDefault;
            }());
            Toast.StyleBuilderDefault = StyleBuilderDefault;
            /**
             * Toast 表示
             *
             * @param message  [in] メッセージ
             * @param duration [in] 表示時間を設定 (msec) default: LENGTH_SHORT
             * @param style    [in] スタイル変更する場合には派生クラスオブジェクトを指定
             */
            function show(message, duration, style) {
                if (duration === void 0) { duration = Toast.LENGTH_SHORT; }
                var $mobile = $.mobile;
                var info = style || new StyleBuilderDefault();
                var setCSS = info.getStyle() ? true : false;
                // 改行コードは <br/> に置換する
                var msg = message.replace(/\n/g, "<br/>");
                // メッセージ element の動的生成
                var html = "<div>" + msg + "</div>";
                var box = $(html).addClass(info.getClass());
                if (setCSS) {
                    box.css(info.getStyle());
                }
                // 自動改行されてもよいように、基点を設定してから追加
                box.css({
                    "top": 0,
                    "left": 0,
                }).appendTo($mobile.pageContainer);
                // 配置位置の決定
                var offsetPoint = info.getOffsetPoint();
                var $window = $(window);
                var posX, posY;
                var box_width = box.width() + parseInt(box.css("padding-left"), 10) + parseInt(box.css("padding-right"), 10);
                var box_height = box.height() + parseInt(box.css("padding-top"), 10) + parseInt(box.css("padding-bottom"), 10);
                switch (offsetPoint & 0x000F) {
                    case OffsetX.LEFT:
                        posX = 0 + info.getOffsetX();
                        break;
                    case OffsetX.RIGHT:
                        posX = $window.width() - box_width + info.getOffsetX();
                        break;
                    case OffsetX.CENTER:
                        posX = ($window.width() / 2) - (box_width / 2) + info.getOffsetX();
                        break;
                    default:
                        console.warn(TAG + "warn. unknown offsetPoint:" + (offsetPoint & 0x000F));
                        posX = ($window.width() / 2) - (box_width / 2) + info.getOffsetX();
                        break;
                }
                switch (offsetPoint & 0x00F0) {
                    case OffsetY.TOP:
                        posY = 0 + info.getOffsetY();
                        break;
                    case OffsetY.BOTTOM:
                        posY = $window.height() - box_height + info.getOffsetY();
                        break;
                    case OffsetY.CENTER:
                        posY = ($window.height() / 2) - (box_height / 2) + info.getOffsetY();
                        break;
                    default:
                        console.warn(TAG + "warn. unknown offsetPoint:" + (offsetPoint & 0x00F0));
                        posY = ($window.height() / 2) - (box_height / 2) + info.getOffsetY();
                        break;
                }
                // 表示
                box.css({
                    "top": posY,
                    "left": posX,
                })
                    .delay(duration)
                    .fadeOut(400, function () {
                    $(this).remove();
                });
            }
            Toast.show = show;
        })(Toast = UI.Toast || (UI.Toast = {}));
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Promise = CDP.Promise;
        var Framework = CDP.Framework;
        var TAG = "[CDP.UI.Dialog] ";
        //___________________________________________________________________________________________________________________//
        /**
         * @class Dialog
         * @brief 汎用ダイアログクラス
         *        jQM の popup widget によって実装
         */
        var Dialog = /** @class */ (function () {
            /**
             * constructor
             *
             * @param id      {String}        [in] ダイアログ DOM ID を指定 ex) #dialog-hoge
             * @param options {DialogOptions} [in] オプション
             */
            function Dialog(id, options) {
                this._template = null;
                this._settings = null;
                this._$dialog = null;
                // Dialog 共通設定の初期化
                Dialog.initCommonCondition();
                // 設定を更新
                this._settings = $.extend({}, Dialog.s_defaultOptions, options);
                // ダイアログテンプレートを作成
                this._template = CDP.Tools.Template.getJST(id, this._settings.src);
            }
            ///////////////////////////////////////////////////////////////////////
            // public methods
            /**
             * 表示
             * 表示をして始めて DOM が有効になる。
             *
             * @param options {DialogOptions} [in] オプション (src は無視される)
             * @return ダイアログの jQuery オブジェクト
             */
            Dialog.prototype.show = function (options) {
                var _this = this;
                var $document = $(document);
                var $body = $("body");
                var $page = $body.pagecontainer("getActivePage");
                var ofcHidden = {
                    "overflow": "hidden",
                    "overflow-x": "hidden",
                    "overflow-y": "hidden",
                };
                var ofcBody = {
                    "overflow": $body.css("overflow"),
                    "overflow-x": $body.css("overflow-x"),
                    "overflow-y": $body.css("overflow-y"),
                };
                var parentScrollPos = $body.scrollTop();
                var ofcPage = {
                    "overflow": $page.css("overflow"),
                    "overflow-x": $page.css("overflow-x"),
                    "overflow-y": $page.css("overflow-y"),
                };
                var scrollEvent = "scroll touchmove mousemove MSPointerMove";
                var scrollHander = function (event) {
                    if ("deny" === _this._settings.scrollEvent) {
                        event.preventDefault();
                    }
                    else if ("adjust" === _this._settings.scrollEvent) {
                        $body.scrollTop(parentScrollPos);
                    }
                };
                // option が指定されていた場合更新
                if (null != options) {
                    this._settings = $.extend({}, this._settings, options);
                }
                // afterclose 処理は Dialog の破棄処理を実装するため基本的に設定禁止 (強制上書きモードを設定使用可)
                if (this._settings.afterclose && !this._settings.forceOverwriteAfterClose) {
                    console.warn(TAG + "cannot accept 'afterclose' option. please instead using 'popupafterclose' event.");
                    delete this._settings.afterclose;
                }
                // title の有無
                this._settings._titleState = this._settings.title ? "ui-has-title" : "ui-no-title";
                /*
                 * template から jQuery オブジェクトを作成し、
                 * <body> 直下に追加.
                 * $page では Backbone event を受けられないことに注意
                 */
                this._$dialog = $(this._template(this._settings));
                this._$dialog.localize();
                $body.append(this._$dialog);
                // theme を解決
                this.resolveTheme();
                this._$dialog
                    .on("popupcreate", function (event) {
                    // スクロールを抑止
                    if ("allow" !== _this._settings.scrollEvent) {
                        $document.on(scrollEvent, scrollHander);
                    }
                    $body.css(ofcHidden);
                    $page.css(ofcHidden);
                    Dialog.register(_this);
                })
                    .enhanceWithin();
                // DOM 拡張
                if (null != this._settings.domExtensionOptions) {
                    UI.ExtensionManager.applyDomExtension(this._$dialog, this._settings.domExtensionOptions);
                }
                this.onBeforeShow()
                    .done(function () {
                    // 表示
                    _this._$dialog
                        .popup($.extend({}, {
                        positionTo: "window",
                        afterclose: function (event, ui) {
                            // スクロール状態を戻す
                            $page.css(ofcPage);
                            $body.css(ofcBody);
                            if ("allow" !== _this._settings.scrollEvent) {
                                $document.off(scrollEvent, scrollHander);
                            }
                            Dialog.register(null);
                            _this._$dialog.remove();
                            _this._$dialog = null;
                        },
                    }, _this._settings))
                        .popup("open").on(_this._settings.event, function (event) {
                        // "data-auto-close='false'" が指定されている要素は dialog を閉じない
                        var autoClose = $(event.target).attr("data-auto-close");
                        if (null == autoClose) {
                            autoClose = _this._settings.defaultAutoClose ? "true" : "false";
                        }
                        if ("false" === autoClose) {
                            return;
                        }
                        _this.close();
                        event.preventDefault();
                    });
                })
                    .fail(function (error) {
                    console.error(TAG + "Dialog.show() failed.");
                    if (_this._$dialog) {
                        _this._$dialog.trigger("error", error);
                    }
                });
                return this._$dialog;
            };
            /**
             * 終了
             * 基本的には自動で閉じるが、
             * 表示中のダイアログをクライアント側から閉じるメソッド
             */
            Dialog.prototype.close = function () {
                if (this._$dialog) {
                    this._$dialog.popup("close");
                }
            };
            Object.defineProperty(Dialog.prototype, "$el", {
                //! ダイアログ element を取得
                get: function () {
                    return this._$dialog;
                },
                enumerable: true,
                configurable: true
            });
            ///////////////////////////////////////////////////////////////////////
            // protected methods: Override
            /**
             * ダイアログ表示の直前
             * DOM を操作できるタイミングで呼び出される.
             *
             * @return {IPromiseBase} promise オブジェクト
             */
            Dialog.prototype.onBeforeShow = function () {
                return Promise.resolve();
            };
            /**
             * ダイアログの使用する Theme を解決
             * 不要な場合はオーバーライドすることも可能
             */
            Dialog.prototype.resolveTheme = function () {
                var queryTheme = function () {
                    return $(".ui-page-active").jqmData("theme");
                };
                var candidateTheme;
                if (!this._settings.theme) {
                    var domTheme = this._$dialog.jqmData("theme");
                    if (!domTheme) {
                        this._settings.theme = candidateTheme = queryTheme();
                    }
                }
                if (!this._settings.overlayTheme) {
                    var domOverlayTheme = this._$dialog.jqmData("overlay-theme");
                    if (!domOverlayTheme) {
                        this._settings.overlayTheme = candidateTheme || queryTheme();
                    }
                }
                // transition の更新
                this._settings.transition = UI.Theme.queryDialogTransition(this._settings.transition);
            };
            ///////////////////////////////////////////////////////////////////////
            // public static methods
            /**
             * Dialog の既定オプションを更新
             * すべての Dialog が使用する共通設定
             *
             * @param options {DialogOptions} [in] ダイアログオプション
             */
            Dialog.setDefaultOptions = function (options) {
                // Dialog 共通設定の初期化
                Dialog.initCommonCondition();
                $.extend(true, Dialog.s_defaultOptions, options);
            };
            ///////////////////////////////////////////////////////////////////////
            // private methods
            // 現在 active なダイアログとして登録する
            Dialog.register = function (dialog) {
                if (null != dialog && null != Dialog.s_activeDialog) {
                    console.warn(TAG + "new dialog proc is called in the past dialog's one. use setTimeout() for post process.");
                }
                Dialog.s_activeDialog = dialog;
            };
            /**
             * Dialog 共通設定の初期化
             */
            Dialog.initCommonCondition = function () {
                // Framework の初期化後に処理する必要がある
                if (!Framework.isInitialized()) {
                    console.warn(TAG + "initCommonCondition() should be called after Framework.initialized.");
                    return;
                }
                if (null == Dialog.s_oldBackKeyHandler) {
                    // Back Button Handler
                    Dialog.s_oldBackKeyHandler = CDP.setBackButtonHandler(null);
                    CDP.setBackButtonHandler(Dialog.customBackKeyHandler);
                    // 既定オプション
                    Dialog.s_defaultOptions = {
                        idPositive: "dlg-btn-positive",
                        idNegative: "dlg-btn-negative",
                        event: Framework.getDefaultClickEvent(),
                        dismissible: false,
                        defaultAutoClose: false,
                        transition: "platform-default",
                        labelPositive: "OK",
                        labelNegative: "Cancel",
                        backKey: "close",
                        scrollEvent: "deny",
                        domExtensionOptions: {},
                    };
                }
            };
            /**
             * H/W Back Button Handler
             */
            Dialog.customBackKeyHandler = function (event) {
                if (null != Dialog.s_activeDialog) {
                    if ("close" === Dialog.s_activeDialog._settings.backKey) {
                        Dialog.s_activeDialog.close();
                    }
                    else if ("function" === typeof Dialog.s_activeDialog._settings.backKey) {
                        Dialog.s_activeDialog._settings.backKey(event);
                    }
                    return; // Dialog が active な場合、常に既定のハンドラには渡さない
                }
                Dialog.s_oldBackKeyHandler(event);
            };
            Dialog.s_activeDialog = null;
            Dialog.s_oldBackKeyHandler = null;
            Dialog.s_defaultOptions = null;
            return Dialog;
        }());
        UI.Dialog = Dialog;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
/* tslint:disable:max-line-length */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var TAG = "[CDP.UI.DialogCommons] ";
        /**
         * Alert
         * alert メッセージ表示
         *
         * @param {String} message   [in] 表示文字列
         * @param {String} [options] [in] ダイアログオプション
         * @return {jQuery} ダイアログの DOM オブジェクト
         */
        function alert(message, options) {
            var template = "\n            <script type=\"text/template\">\n                <section class=\"ui-modal\" data-role=\"popup\" data-corners=\"false\">\n                    <div class=\"ui-content\">\n                        <h1 class=\"ui-title {{_titleState}}\">{{title}}</h1>\n                        <p class=\"ui-message\">{{message}}</p>\n                    </div>\n                    <div class=\"ui-modal-footer ui-grid-solo\">\n                        <button id=\"{{idPositive}}\" class=\"ui-btn ui-block-a ui-text-emphasis\" data-auto-close=\"true\">{{labelPositive}}</button>\n                    </div>\n                </section>\n            </script>\n        ";
            var dlgAlert = new UI.Dialog(template, $.extend({}, {
                src: null,
                message: message,
            }, options));
            return dlgAlert.show();
        }
        UI.alert = alert;
        /**
         * Confirm
         * 確認メッセージ表示
         *
         * @param {String} message   [in] 表示文字列
         * @param {String} [options] [in] ダイアログオプション
         * @return {jQuery} ダイアログの DOM オブジェクト
         */
        function confirm(message, options) {
            var template = "\n            <script type=\"text/template\">\n                <section class=\"ui-modal\" data-role=\"popup\" data-corners=\"false\">\n                    <div class=\"ui-content\">\n                        <h1 class=\"ui-title {{_titleState}}\">{{title}}</h1>\n                        <p class=\"ui-message\">{{message}}</p>\n                    </div>\n                    <div class=\"ui-modal-footer ui-grid-a\">\n                        <button id=\"{{idNegative}}\" class=\"ui-btn ui-block-a\" data-auto-close=\"true\">{{labelNegative}}</button>\n                        <button id=\"{{idPositive}}\" class=\"ui-btn ui-block-b ui-text-emphasis\" data-auto-close=\"true\">{{labelPositive}}</button>\n                    </div>\n                </section>\n            </script>\n        ";
            var dlgConfirm = new UI.Dialog(template, $.extend({}, {
                src: null,
                message: message,
            }, options));
            return dlgConfirm.show();
        }
        UI.confirm = confirm;
        /**
         * @class DialogPrompt
         * @brief prompt ダイアログ (非公開)
         */
        var DialogPrompt = /** @class */ (function (_super) {
            __extends(DialogPrompt, _super);
            /**
             * constructor
             *
             */
            function DialogPrompt(id, options) {
                var _this = _super.call(this, id, options) || this;
                _this._eventOK = options.eventOK || "promptok";
                return _this;
            }
            //! ダイアログ表示の直前
            DialogPrompt.prototype.onBeforeShow = function () {
                var _this = this;
                var onCommit = function (event) {
                    var text = _this.$el.find("#_ui-prompt").val();
                    _this.$el.trigger(_this._eventOK, text);
                    _this.close();
                    event.preventDefault();
                };
                this.$el
                    .on("vclick", ".command-prompt-ok ", function (event) {
                    onCommit(event);
                })
                    .on("keydown", "#_ui-prompt", function (event) {
                    var ENTER_KEY_CODE = 13;
                    if (ENTER_KEY_CODE === event.keyCode) {
                        onCommit(event);
                    }
                });
                return _super.prototype.onBeforeShow.call(this);
            };
            return DialogPrompt;
        }(UI.Dialog));
        /**
         * Prompt
         *
         * @param {String} message   [in] 表示文字列
         * @param {String} [options] [in] ダイアログオプション
         * @return {jQuery} ダイアログの DOM オブジェクト
         */
        function prompt(message, options) {
            var template = "\n            <script type=\"text/template\">\n                <section class=\"ui-modal\" data-role=\"popup\" data-corners=\"false\">\n                    <div class=\"ui-content\">\n                        <h1 class=\"ui-title {{_titleState}}\">{{title}}</h1>\n                        <p class=\"ui-message\">{{message}}</p>\n                        <label for=\"_ui-prompt\" class=\"ui-hidden-accessible\"></label>\n                        <input type=\"text\" name=\"_ui-prompt\" id=\"_ui-prompt\">\n                    </div>\n                    <div class=\"ui-modal-footer ui-grid-a\">\n                        <button id=\"{{idNegative}}\" class=\"ui-btn ui-block-a\" data-auto-close=\"true\">{{labelNegative}}</button>\n                        <button id=\"{{idPositive}}\" class=\"command-prompt-ok ui-btn ui-block-b ui-text-emphasis\" data-auto-close=\"false\">{{labelPositive}}</button>\n                    </div>\n                </section>\n            </script>\n        ";
            var dlgPrompt = new DialogPrompt(template, $.extend({}, {
                src: null,
                message: message,
            }, options));
            return dlgPrompt.show();
        }
        UI.prompt = prompt;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Router = CDP.Framework.Router;
        var View = CDP.Framework.View;
        var Template = CDP.Tools.Template;
        var TAG = "[CDP.UI.BaseHeaderView] ";
        //__________________________________________________________________________________________________________//
        /**
         * @class BaseHeaderView
         * @brief 共通ヘッダを操作するクラス
         */
        var BaseHeaderView = /** @class */ (function (_super) {
            __extends(BaseHeaderView, _super);
            /**
             * constructor
             *
             * @param {IPage} _owner [in] オーナーページインスタンス
             */
            function BaseHeaderView(_owner, _options) {
                var _this = _super.call(this, _options = $.extend({
                    el: _owner.$page.find("[data-role='header']"),
                    backCommandSelector: ".command-back",
                    backCommandKind: "pageback",
                }, _options)) || this;
                _this._owner = _owner;
                _this._options = _options;
                // template 設定
                if (_options.baseTemplate) {
                    _this._template = _options.baseTemplate;
                }
                else {
                    _this._template = Template.getJST("\n                    <script type='text/template'>\n                        <header class='ui-header-base ui-body-{{theme}}'>\n                            <div class='ui-fixed-back-indicator'></div>\n                        </header>\n                    </script>\n                ");
                }
                // Backbone.View 用の初期化
                _this.setElement(_this.$el, true);
                return _this;
            }
            ///////////////////////////////////////////////////////////////////////
            // public methods
            /**
             * 初期化
             */
            BaseHeaderView.prototype.create = function () {
                return this.createHeaderBase();
            };
            /**
             * 有効化
             */
            BaseHeaderView.prototype.activate = function () {
                return this.showIndicator();
            };
            /**
             * 無効化
             */
            BaseHeaderView.prototype.inactivate = function () {
                return this.hideIndicator();
            };
            /**
             * 破棄
             */
            BaseHeaderView.prototype.release = function () {
                return this.releaseHeaderBase();
            };
            ///////////////////////////////////////////////////////////////////////
            // private methods
            //! 共通ヘッダのベースを準備
            BaseHeaderView.prototype.createHeaderBase = function () {
                // 固定ヘッダのときに有効化
                if ("fixed" === this._owner.$header.jqmData("position")) {
                    if (null == BaseHeaderView.s_$headerBase) {
                        BaseHeaderView.s_$headerBase = $(this._template({
                            theme: this._owner.$page.jqmData("theme"),
                        }));
                    }
                    BaseHeaderView.s_refCount++;
                    BaseHeaderView.s_$headerBase.appendTo($(document.body));
                }
                // Back Indicator を持っているか判定
                if (0 < this.$el.find(".ui-back-indicator").length) {
                    this._hasBackIndicator = true;
                }
                return BaseHeaderView.s_$headerBase;
            };
            //! indicator の表示
            BaseHeaderView.prototype.showIndicator = function () {
                // Back Indicator を持っていない場合表示しない
                if (null != BaseHeaderView.s_$headerBase && this._hasBackIndicator) {
                    BaseHeaderView.s_$headerBase.find(".ui-fixed-back-indicator").addClass("show");
                }
                return BaseHeaderView.s_$headerBase;
            };
            //! indicator の非表示
            BaseHeaderView.prototype.hideIndicator = function () {
                if (null != BaseHeaderView.s_$headerBase) {
                    BaseHeaderView.s_$headerBase.find(".ui-fixed-back-indicator").removeClass("show");
                }
                return BaseHeaderView.s_$headerBase;
            };
            //! 共通ヘッダのベースを破棄
            BaseHeaderView.prototype.releaseHeaderBase = function () {
                // 固定ヘッダ時に参照カウントを管理
                if ("fixed" === this._owner.$header.jqmData("position")) {
                    if (null != BaseHeaderView.s_$headerBase) {
                        BaseHeaderView.s_refCount--;
                        if (0 === BaseHeaderView.s_refCount) {
                            BaseHeaderView.s_$headerBase.remove();
                            BaseHeaderView.s_$headerBase = null;
                        }
                    }
                }
                return BaseHeaderView.s_$headerBase;
            };
            ///////////////////////////////////////////////////////////////////////
            // Override: Backbone.View
            //! events binding
            BaseHeaderView.prototype.events = function () {
                var eventMap = {};
                if (this._options) {
                    eventMap["vclick " + this._options.backCommandSelector] = this.onCommandBack;
                }
                return eventMap;
            };
            //! back のハンドラ
            BaseHeaderView.prototype.onCommandBack = function (event) {
                event.preventDefault();
                var handled = false;
                if (this._owner) {
                    handled = this._owner.onCommand(event, this._options.backCommandKind);
                }
                if (!handled) {
                    Router.back();
                }
            };
            BaseHeaderView.s_refCount = 0; //!< 参照カウント
            return BaseHeaderView;
        }(View));
        UI.BaseHeaderView = BaseHeaderView;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
/* tslint:disable:max-line-length */
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Framework = CDP.Framework;
        var TAG = "[CDP.UI.BasePage] ";
        //__________________________________________________________________________________________________________//
        /**
         * @class BasePage
         * @brief Header を備える Page クラス
         */
        var BasePage = /** @class */ (function (_super) {
            __extends(BasePage, _super);
            /**
             * constructor
             *
             * @param {String}          url       [in] ページ URL
             * @param {String}          id        [in] ページ ID
             * @param {BasePageOptions} [options] [in] オプション
             */
            function BasePage(url, id, _options) {
                var _this = _super.call(this, url, id, _options = $.extend({
                    baseHeader: UI.BaseHeaderView,
                    backCommandHandler: "onPageBack",
                    backCommandKind: "pageback",
                    domExtensionOptions: {},
                }, _options)) || this;
                _this._options = _options;
                return _this;
            }
            ///////////////////////////////////////////////////////////////////////
            // Override: Framework Page
            /**
             * jQM event: "pagebeforecreate" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            BasePage.prototype.onPageBeforeCreate = function (event) {
                if (this._options.baseHeader) {
                    this._baseHeader = new this._options.baseHeader(this, this._options);
                    this._baseHeader.create();
                }
                _super.prototype.onPageBeforeCreate.call(this, event);
            };
            /**
             * jQM event: "pagecreate" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            BasePage.prototype.onPageInit = function (event) {
                if (null != this._options.domExtensionOptions) {
                    UI.ExtensionManager.applyDomExtension(this.$page, this._options.domExtensionOptions);
                }
                _super.prototype.onPageInit.call(this, event);
            };
            /**
             * jQM event: "pagebeforeshow" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @param data  {ShowEventData}     [in] 付加情報
             */
            BasePage.prototype.onPageBeforeShow = function (event, data) {
                if (this._baseHeader) {
                    this._baseHeader.activate();
                }
                _super.prototype.onPageBeforeShow.call(this, event, data);
            };
            /**
             * jQM event: "pagebeforehide" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @param data  {HideEventData}     [in] 付加情報
             */
            BasePage.prototype.onPageBeforeHide = function (event, data) {
                if (this._baseHeader) {
                    this._baseHeader.inactivate();
                }
                _super.prototype.onPageBeforeHide.call(this, event, data);
            };
            /**
             * jQM event: "pageremove" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            BasePage.prototype.onPageRemove = function (event) {
                if (this._baseHeader) {
                    this._baseHeader.release();
                    this._baseHeader = null;
                }
                _super.prototype.onPageRemove.call(this, event);
            };
            /**
             * H/W Back Button ハンドラ
             *
             * @param  event {JQuery.Event} [in] event object
             * @return {Boolean} true: 既定の処理を行わない / false: 既定の処理を行う
             */
            BasePage.prototype.onHardwareBackButton = function (event) {
                var retval = _super.prototype.onHardwareBackButton.call(this, event);
                if (!retval) {
                    retval = this.onCommand(event, this._options.backCommandKind);
                }
                return retval;
            };
            ///////////////////////////////////////////////////////////////////////
            // Override: Custom Event
            /**
             * "戻る" event 発行時にコールされる
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @return {Boolean} true: 既定の処理を行わない / false: 既定の処理を行う
             */
            BasePage.prototype.onCommand = function (event, kind) {
                if (this._options.backCommandKind === kind) {
                    if (this._owner && this._owner[this._options.backCommandHandler]) {
                        return this._owner[this._options.backCommandHandler](event);
                    }
                }
                return false;
            };
            return BasePage;
        }(Framework.Page));
        UI.BasePage = BasePage;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
/* tslint:disable:max-line-length */
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Promise = CDP.Promise;
        var Framework = CDP.Framework;
        var TAG = "[CDP.UI.PageView] ";
        /**
         * @class PageView
         * @brief CDP.Framework.Page と Backbone.View の両方の機能を提供するページの基底クラス
         */
        var PageView = /** @class */ (function (_super) {
            __extends(PageView, _super);
            /**
             * constructor
             *
             * @param url     {String}                   [in] ページ URL
             * @param id      {String}                   [in] ページ ID
             * @param options {PageViewConstructOptions} [in] オプション
             */
            function PageView(url, id, options) {
                var _this = _super.call(this, options) || this;
                _this._pageOptions = null;
                _this._basePage = null;
                _this._statusMgr = null;
                // PageView 設定
                _this._pageOptions = $.extend({}, { owner: _this }, options);
                _this._basePage = _this._pageOptions.basePage ? new _this._pageOptions.basePage(url, id, _this._pageOptions) : new UI.BasePage(url, id, _this._pageOptions);
                // StatusManager
                _this._statusMgr = new UI.StatusManager();
                // Backbone.View 用の初期化
                var delegates = _this.events ? true : false;
                _this.setElement(_this.$page, delegates);
                return _this;
            }
            ///////////////////////////////////////////////////////////////////////
            // Implements: IStatusManager 状態管理
            /**
             * 状態変数の参照カウントのインクリメント
             *
             * @param status {String} [in] 状態識別子
             */
            PageView.prototype.statusAddRef = function (status) {
                return this._statusMgr.statusAddRef(status);
            };
            /**
             * 状態変数の参照カウントのデクリメント
             *
             * @param status {String} [in] 状態識別子
             */
            PageView.prototype.statusRelease = function (status) {
                return this._statusMgr.statusRelease(status);
            };
            /**
             * 処理スコープ毎に状態変数を設定
             *
             * @param status   {String}   [in] 状態識別子
             * @param callback {Function} [in] 処理コールバック
             */
            PageView.prototype.statusScope = function (status, callback) {
                this._statusMgr.statusScope(status, callback);
            };
            /**
             * 指定した状態中であるか確認
             *
             * @param status {String}   [in] 状態識別子
             * @return {Boolean} true: 状態内 / false: 状態外
             */
            PageView.prototype.isStatusIn = function (status) {
                return this._statusMgr.isStatusIn(status);
            };
            Object.defineProperty(PageView.prototype, "active", {
                ///////////////////////////////////////////////////////////////////////
                // IPage stub stuff.
                get: function () { return this._basePage.active; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PageView.prototype, "url", {
                get: function () { return this._basePage.url; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PageView.prototype, "id", {
                get: function () { return this._basePage ? this._basePage.id : null; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PageView.prototype, "$page", {
                get: function () { return this._basePage.$page; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PageView.prototype, "$header", {
                get: function () { return this._basePage.$header; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PageView.prototype, "$footer", {
                get: function () { return this._basePage.$footer; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PageView.prototype, "intent", {
                get: function () { return this._basePage.intent; },
                set: function (newIntent) { this._basePage.intent = newIntent; },
                enumerable: true,
                configurable: true
            });
            /**
             * Orientation の変更を受信
             *
             * @param newOrientation {Orientation} [in] new orientation code.
             */
            PageView.prototype.onOrientationChanged = function (newOrientation) {
                this.trigger("pageview:orientation-changed" /* ORIENTATION_CHANGED */, newOrientation);
            };
            /**
             * H/W Back Button ハンドラ
             *
             * @param  event {JQuery.Event} [in] event object
             * @return {Boolean} true: 既定の処理を行わない / false: 既定の処理を行う
             */
            PageView.prototype.onHardwareBackButton = function (event) {
                return false;
            };
            /**
             * Router "before route change" ハンドラ
             * ページ遷移直前に非同期処理を行うことが可能
             *
             * @return {IPromiseBase} Promise オブジェクト
             */
            PageView.prototype.onBeforeRouteChange = function () {
                return Promise.resolve();
            };
            /**
             * 汎用コマンドを受信
             *
             * @param  event {JQuery.Event} [in] event object
             * @param  event {kind}              [in] command kind string
             * @return {Boolean} true: 既定の処理を行わない / false: 既定の処理を行う
             */
            PageView.prototype.onCommand = function (event, kind) {
                return false;
            };
            /**
             * 最初の OnPageInit() のときにのみコールされる
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            PageView.prototype.onInitialize = function (event) {
                this.trigger("pageview:initialize" /* INITIALZSE */, event);
            };
            /**
             * jQM event: "pagebeforecreate" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            PageView.prototype.onPageBeforeCreate = function (event) {
                this.setElement(this.$page, true);
                this.trigger("pageview:before-create" /* PAGE_BEFORE_CREATE */, event);
            };
            /**
             * jQM event: "pagecreate" (旧:"pageinit") に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            PageView.prototype.onPageInit = function (event) {
                this.trigger("pageview:page-init" /* PAGE_INIT */, event);
            };
            /**
             * jQM event: "pagebeforeshow" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @param data  {ShowEventData}     [in] 付加情報
             */
            PageView.prototype.onPageBeforeShow = function (event, data) {
                this.trigger("pageview:before-show" /* PAGE_BEFORE_SHOW */, event, data);
            };
            /**
             * jQM event: "pagecontainershow" (旧:"pageshow") に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @param data  {ShowEventData}     [in] 付加情報
             */
            PageView.prototype.onPageShow = function (event, data) {
                this.trigger("pageview:show" /* PAGE_SHOW */, event, data);
            };
            /**
             * jQM event: "pagebeforehide" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @param data  {HideEventData}     [in] 付加情報
             */
            PageView.prototype.onPageBeforeHide = function (event, data) {
                this.trigger("pageview:before-hide" /* PAGE_BEFORE_HIDE */, event, data);
            };
            /**
             * jQM event: "pagecontainerhide" (旧:"pagehide") に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @param data  {HideEventData}     [in] 付加情報
             */
            PageView.prototype.onPageHide = function (event, data) {
                this.trigger("pageview:hide" /* PAGE_HIDE */, event, data);
            };
            /**
             * jQM event: "pageremove" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            PageView.prototype.onPageRemove = function (event) {
                this.trigger("pageview:remove" /* PAGE_REMOVE */, event);
                this.remove();
                this.el = null;
                this.$el = null;
            };
            return PageView;
        }(Framework.View));
        UI.PageView = PageView;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
/* tslint:disable:max-line-length */
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Framework = CDP.Framework;
        var TAG = "[CDP.UI.PageContainerView] ";
        /**
         * @class PageContainerView
         * @brief PageView と連携可能な コンテナビュークラス
         */
        var PageContainerView = /** @class */ (function (_super) {
            __extends(PageContainerView, _super);
            /**
             * constructor
             */
            function PageContainerView(options) {
                var _this = _super.call(this, options) || this;
                _this._owner = null;
                _this._owner = options.owner;
                if (options.$el) {
                    var delegates = _this.events ? true : false;
                    _this.setElement(options.$el, delegates);
                }
                // set event listener
                _this.listenTo(_this._owner, "pageview:orientation-changed" /* ORIENTATION_CHANGED */, _this.onOrientationChanged.bind(_this));
                _this.listenTo(_this._owner, "pageview:initialize" /* INITIALZSE */, _this.onInitialize.bind(_this));
                _this.listenTo(_this._owner, "pageview:before-create" /* PAGE_BEFORE_CREATE */, _this.onPageBeforeCreate.bind(_this));
                _this.listenTo(_this._owner, "pageview:page-init" /* PAGE_INIT */, _this.onPageInit.bind(_this));
                _this.listenTo(_this._owner, "pageview:before-show" /* PAGE_BEFORE_SHOW */, _this.onPageBeforeShow.bind(_this));
                _this.listenTo(_this._owner, "pageview:show" /* PAGE_SHOW */, _this.onPageShow.bind(_this));
                _this.listenTo(_this._owner, "pageview:before-hide" /* PAGE_BEFORE_HIDE */, _this.onPageBeforeHide.bind(_this));
                _this.listenTo(_this._owner, "pageview:hide" /* PAGE_HIDE */, _this.onPageHide.bind(_this));
                _this.listenTo(_this._owner, "pageview:remove" /* PAGE_REMOVE */, _this.onPageRemove.bind(_this));
                return _this;
            }
            Object.defineProperty(PageContainerView.prototype, "owner", {
                ///////////////////////////////////////////////////////////////////////
                // short cut methods
                //! Owner 取得
                get: function () {
                    return this._owner;
                },
                enumerable: true,
                configurable: true
            });
            ///////////////////////////////////////////////////////////////////////
            // Handle PageView events
            /**
             * Orientation の変更を受信
             *
             * @param newOrientation {Orientation} [in] new orientation code.
             */
            PageContainerView.prototype.onOrientationChanged = function (newOrientation) {
                // Override
            };
            /**
             * 最初の OnPageInit() のときにのみコールされる
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            PageContainerView.prototype.onInitialize = function (event) {
                // Override
            };
            /**
             * jQM event: "pagebeforecreate" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            PageContainerView.prototype.onPageBeforeCreate = function (event) {
                // Override
            };
            /**
             * jQM event: "pagecreate" (旧:"pageinit") に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            PageContainerView.prototype.onPageInit = function (event) {
                // Override
            };
            /**
             * jQM event: "pagebeforeshow" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @param data  {ShowEventData}     [in] 付加情報
             */
            PageContainerView.prototype.onPageBeforeShow = function (event, data) {
                // Override
            };
            /**
             * jQM event: "pagecontainershow" (旧:"pageshow") に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @param data  {ShowEventData}     [in] 付加情報
             */
            PageContainerView.prototype.onPageShow = function (event, data) {
                // Override
            };
            /**
             * jQM event: "pagebeforehide" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @param data  {HideEventData}     [in] 付加情報
             */
            PageContainerView.prototype.onPageBeforeHide = function (event, data) {
                // Override
            };
            /**
             * jQM event: "pagecontainerhide" (旧:"pagehide") に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             * @param data  {HideEventData}     [in] 付加情報
             */
            PageContainerView.prototype.onPageHide = function (event, data) {
                // Override
            };
            /**
             * jQM event: "pageremove" に対応
             *
             * @param event {JQuery.Event} [in] イベントオブジェクト
             */
            PageContainerView.prototype.onPageRemove = function (event) {
                this.stopListening();
            };
            return PageContainerView;
        }(Framework.View));
        UI.PageContainerView = PageContainerView;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var TAG = "[CDP.UI.TabHostView] ";
        var _Config;
        (function (_Config) {
            _Config.TABVIEW_CLASS = "ui-tabview";
            _Config.TABVIEW_SELECTOR = "." + _Config.TABVIEW_CLASS;
            _Config.TABHOST_CLASS = "ui-tabhost";
            _Config.TABHOST_SELECTOR = "." + _Config.TABHOST_CLASS;
            _Config.TABHOST_REFRESH_COEFF = 1.0; // flipsnap 切り替え時に duration に対して更新を行う係数
            _Config.TABHOST_REFRESH_INTERVAL = 200; // flipsnap の更新に使用する間隔 [msec]
        })(_Config || (_Config = {}));
        //___________________________________________________________________________________________________________________//
        /**
         * @class TabHostView
         * @brief タブ切り替え機能を持つ View クラス
         */
        var TabHostView = /** @class */ (function (_super) {
            __extends(TabHostView, _super);
            /**
             * constructor
             *
             * @param options [in] オプション
             */
            function TabHostView(options) {
                var _this = _super.call(this, options) || this;
                _this._tabs = []; // ITabView を格納
                _this._activeTabIndex = 0; // active tab
                _this._flipsnap = null; // flipsnap オブジェクト
                _this._flipEndEventHandler = null; // "fstouchend"
                _this._flipMoveEventHandler = null; // "fstouchmove"
                _this._flipDeltaCache = 0; // "flip 距離のキャッシュ"
                _this._scrollEndEventHandler = null; // tabview "scrollstop"
                _this._scrollMoveEventHandler = null; // tabview "scroll"
                _this._refreshTimerId = null; // refresh() 反映確認用
                // check runtime condition
                if (null == UI.global.Flipsnap) {
                    console.error(TAG + "flipsnap module doesn't load.");
                    return _this;
                }
                _this._settings = $.extend({
                    tabContexts: [],
                    tabMoveHandler: function (delta) { },
                    tabStopHandler: function (newIndex, moved) { }
                }, options);
                // setup event handlers
                _this._flipEndEventHandler = function (event) {
                    var fsEvent = event.originalEvent;
                    _this._flipDeltaCache = 0;
                    _this.onTabChanged(fsEvent.newPoint, fsEvent.moved);
                };
                _this._flipMoveEventHandler = function (event) {
                    var fsEvent = event.originalEvent;
                    _this._flipDeltaCache += fsEvent.delta;
                    // bounce のガード
                    if (!_this._settings.enableBounce && ((-1 === fsEvent.direction && 0 === _this._activeTabIndex && 0 < _this._flipDeltaCache) ||
                        (1 === fsEvent.direction && _this._activeTabIndex === _this._tabs.length - 1 && _this._flipDeltaCache < 0))) {
                        event.preventDefault();
                        _this._flipsnap.moveToPoint(fsEvent.newPoint);
                    }
                    else {
                        _this.onTabMoving(fsEvent.delta);
                        _this._tabs.forEach(function (tabview) {
                            tabview.onTabScrolling(_this._activeTabIndex, fsEvent.delta);
                        });
                        _this.preprocess(_this._activeTabIndex);
                    }
                };
                _this._scrollEndEventHandler = function (event) {
                    _this.onScrollStop();
                };
                _this._scrollMoveEventHandler = function (event) {
                    _this.onScroll();
                };
                // setup tabs
                if (_this._settings.initialWidth) {
                    _this.$el.width(_this._settings.initialWidth);
                }
                if (_this._settings.initialHeight) {
                    _this.$el.height(_this._settings.initialHeight);
                }
                var initialWidth = _this._settings.initialWidth;
                var initialHeight = _this.$el.height();
                var tabContexts = _this._settings.tabContexts.slice();
                if (0 < tabContexts.length) {
                    tabContexts.forEach(function (context) {
                        /* tslint:disable:no-unused-expression */
                        new context.ctor($.extend({
                            initialHeight: initialHeight,
                        }, context.options, { host: _this, delayRegister: false }));
                        /* tslint:enable:no-unused-expression */
                    });
                }
                else {
                    // ITabView インスタンス化要求
                    _this.onTabViewSetupRequest(initialHeight);
                }
                if (_this._settings.initImmediate) {
                    _this.initializeTabViews();
                }
                // Flipsnap
                _this.setFlipsnapCondition($.extend({}, {
                    distance: initialWidth,
                }, _this._settings));
                _this.setActiveTab(_this._activeTabIndex, 0, true);
                return _this;
            }
            /**
             * 配下の TabView を初期化
             */
            TabHostView.prototype.initializeTabViews = function () {
                var _this = this;
                // ITabView に $tabHost をアサインする
                // NOTE: 現在は DOM の順序は固定
                var $tabs = this.$el.find(_Config.TABVIEW_SELECTOR);
                this._tabs.forEach(function (tabview, index) {
                    tabview.onInitialize(_this, $($tabs[index]));
                });
            };
            /**
             * 破棄のヘルパー関数
             * メンバーの破棄のタイミングを変える場合、本メソッドをコールする
             */
            TabHostView.prototype.destroy = function () {
                this.resetFlipsnapCondition();
                this._tabs.forEach(function (tabview) {
                    tabview.onDestroy();
                });
                this._tabs = [];
            };
            ///////////////////////////////////////////////////////////////////////
            // Framework methods:
            // ページの基準値を取得
            TabHostView.prototype.getBaseHeight = function () {
                return this.$el.height();
            };
            /**
             * TabView を登録
             * Framework が使用
             *
             * @param tabview [in] ITabView のインスタンス
             */
            TabHostView.prototype.registerTabView = function (tabview) {
                if (null == this.getTabIndexOf(tabview)) {
                    this._tabs.push(tabview);
                }
                else {
                    console.warn(TAG + "tab instance already registered.");
                }
            };
            /**
             * TabView の Tab index を取得
             * Framework が使用
             *
             * @param tabview [in] ITabView のインスタンス
             * @return 指定インスタンスのインデックス
             */
            TabHostView.prototype.getTabIndexOf = function (tabview) {
                for (var i = 0, n = this._tabs.length; i < n; i++) {
                    if (tabview === this._tabs[i]) {
                        return i;
                    }
                }
                return null;
            };
            // タブポジションの初期化
            TabHostView.prototype.resetTabPosition = function () {
                this._tabs.forEach(function (tabview) {
                    tabview.scrollTo(0, false, 0);
                    tabview.refresh();
                });
                this.setActiveTab(0, 0, true);
            };
            // ITabView 設定リクエスト時にコールされる
            TabHostView.prototype.onTabViewSetupRequest = function (initialHeight) {
                // override
            };
            ///////////////////////////////////////////////////////////////////////
            // Tab control methods:
            // アクティブ Tab を設定
            TabHostView.prototype.setActiveTab = function (index, transitionDuration, initial) {
                var _this = this;
                if (this.validTab(index) && (initial || (this._activeTabIndex !== index))) {
                    // 遷移前に scroll 位置の view を更新
                    this.preprocess(index);
                    var lastActiveTabIndex_1 = this._activeTabIndex;
                    this._activeTabIndex = index;
                    this._flipsnap.moveToPoint(this._activeTabIndex, transitionDuration);
                    { // 遷移後に listview の状態を変更
                        var changeTab_1 = function () {
                            _this.postprocess(lastActiveTabIndex_1);
                            _this.onTabChanged(_this._activeTabIndex, false);
                        };
                        transitionDuration = transitionDuration || parseInt(this._flipsnap.transitionDuration, 10);
                        if (0 === transitionDuration) {
                            changeTab_1();
                        }
                        else {
                            setTimeout(function () {
                                changeTab_1();
                            }, transitionDuration * _Config.TABHOST_REFRESH_COEFF);
                        }
                    }
                    return true;
                }
                else {
                    return false;
                }
            };
            /**
             * タブの数を取得
             *
             * @return {Number} タブ数
             */
            TabHostView.prototype.getTabCount = function () {
                return this._tabs.length;
            };
            // アクティブなタブ Index を取得
            TabHostView.prototype.getActiveTabIndex = function () {
                return this._activeTabIndex;
            };
            // swipe 移動量を取得 (swipe 中に delta の加算値を返却)
            TabHostView.prototype.getSwipeDelta = function () {
                return this._flipDeltaCache;
            };
            // タブ移動イベント
            TabHostView.prototype.onTabMoving = function (delta) {
                this.trigger(TabHostView.EVENT_TAB_MOVE, delta);
            };
            // タブ変更完了イベント
            TabHostView.prototype.onTabChanged = function (newIndex, moved) {
                if (moved) {
                    this.setActiveTab(newIndex);
                }
                this.trigger(TabHostView.EVENT_TAB_STOP, newIndex, moved);
            };
            ///////////////////////////////////////////////////////////////////////
            // Scroll control methods:
            // スクロール位置を取得
            TabHostView.prototype.getScrollPos = function () {
                if (this._activeTabView) {
                    return this._activeTabView.getScrollPos();
                }
                else {
                    return 0;
                }
            };
            // スクロール位置の最大値を取得
            TabHostView.prototype.getScrollPosMax = function () {
                if (this._activeTabView) {
                    return this._activeTabView.getScrollPosMax();
                }
                else {
                    return 0;
                }
            };
            // スクロール位置を指定
            TabHostView.prototype.scrollTo = function (pos, animate, time) {
                if (this._activeTabView) {
                    this._activeTabView.scrollTo(pos, animate, time);
                }
            };
            // スクロールイベント
            TabHostView.prototype.onScroll = function () {
                this.trigger(TabHostView.EVENT_SCROLL_MOVE);
            };
            // スクロール完了イベント
            TabHostView.prototype.onScrollStop = function () {
                this.trigger(TabHostView.EVENT_SCROLL_STOP);
            };
            // スクロールイベントハンドラ設定/解除
            TabHostView.prototype.setScrollHandler = function (handler, on) {
                if (this._activeTabView) {
                    this._activeTabView.setScrollHandler(handler, on);
                }
            };
            // スクロール終了イベントハンドラ設定/解除
            TabHostView.prototype.setScrollStopHandler = function (handler, on) {
                if (this._activeTabView) {
                    this._activeTabView.setScrollStopHandler(handler, on);
                }
            };
            ///////////////////////////////////////////////////////////////////////
            // Host event hooks:
            // Orientation の変更検知
            TabHostView.prototype.onOrientationChanged = function (newOrientation) {
                var _this = this;
                _super.prototype.onOrientationChanged.call(this, newOrientation);
                this._tabs.forEach(function (tabview) {
                    tabview.onOrientationChanged(newOrientation);
                });
                if (null != this._refreshTimerId) {
                    clearTimeout(this._refreshTimerId);
                }
                if (this._flipsnap && 0 < this._tabs.length) {
                    var proc_1 = function () {
                        // リトライ
                        if (_this._flipsnap && _this._flipsnap._maxPoint !== (_this._tabs.length - 1)) {
                            _this._flipsnap.refresh();
                            _this._refreshTimerId = setTimeout(proc_1, _Config.TABHOST_REFRESH_INTERVAL);
                        }
                        else {
                            _this._refreshTimerId = null;
                        }
                    };
                    this._flipsnap.refresh();
                    this._refreshTimerId = setTimeout(proc_1, _Config.TABHOST_REFRESH_INTERVAL);
                }
            };
            // jQM event: "pagecontainershow" (旧:"pageshow") に対応
            TabHostView.prototype.onPageShow = function (event, data) {
                _super.prototype.onPageShow.call(this, event, data);
                this.rebuild();
            };
            ///////////////////////////////////////////////////////////////////////
            // Implements: ScrollManager Profile 管理
            // ページアサインを再構成
            TabHostView.prototype.rebuild = function () {
                this._tabs.forEach(function (tabview) {
                    if (tabview.needRebuild) {
                        tabview.rebuild();
                        tabview.needRebuild = false;
                    }
                });
            };
            ///////////////////////////////////////////////////////////////////////
            // private methods:
            // flipsnap 環境設定
            TabHostView.prototype.setFlipsnapCondition = function (options) {
                this._flipsnap = UI.global.Flipsnap(_Config.TABHOST_SELECTOR, options);
                $(this._flipsnap.element).on("fstouchend", this._flipEndEventHandler.bind(this));
                $(this._flipsnap.element).on("fstouchmove", this._flipMoveEventHandler.bind(this));
            };
            // flipsnap 環境破棄
            TabHostView.prototype.resetFlipsnapCondition = function () {
                if (this._flipsnap) {
                    $(this._flipsnap.element).off("fstouchmove", this._flipMoveEventHandler.bind(this));
                    $(this._flipsnap.element).off("fstouchend", this._flipEndEventHandler.bind(this));
                    this._flipsnap.destroy();
                    this._flipsnap = null;
                }
                this._flipDeltaCache = 0;
            };
            // Tab 切り替えの前処理
            TabHostView.prototype.preprocess = function (toIndex) {
                var _this = this;
                this._tabs.forEach(function (tabview, index) {
                    if (index !== _this._activeTabIndex) {
                        tabview.treatScrollPosition();
                    }
                    // 移動範囲を可視化 NOTE: loop 対応時に条件見直し
                    if ((_this._activeTabIndex < toIndex && (_this._activeTabIndex < index && index <= toIndex)) ||
                        (toIndex < _this._activeTabIndex && (toIndex <= index && index < _this._activeTabIndex))) {
                        tabview.$el.css("visibility", "visible");
                    }
                });
            };
            // Tab 切り替えの後処理
            TabHostView.prototype.postprocess = function (lastActiveTabIndex) {
                var _this = this;
                this._tabs.forEach(function (tabview, index) {
                    if (null != _this._settings.inactiveVisibleTabDistance) {
                        // NOTE: loop 対応時に条件対応
                        var distance = _this._settings.inactiveVisibleTabDistance;
                        if (_this._activeTabIndex - distance <= index && index <= _this._activeTabIndex + distance) {
                            tabview.$el.css("visibility", "visible");
                            tabview.onVisibilityChanged(true);
                        }
                        else {
                            tabview.$el.css("visibility", "hidden");
                            tabview.onVisibilityChanged(false);
                        }
                    }
                    if (index === _this._activeTabIndex) {
                        tabview.onTabSelected();
                        tabview.setScrollHandler(_this._scrollMoveEventHandler, true);
                        tabview.setScrollStopHandler(_this._scrollEndEventHandler, true);
                    }
                    else if (index === lastActiveTabIndex) {
                        tabview.setScrollHandler(_this._scrollMoveEventHandler, false);
                        tabview.setScrollStopHandler(_this._scrollEndEventHandler, false);
                        tabview.onTabReleased();
                    }
                });
            };
            // Tab Index を検証
            TabHostView.prototype.validTab = function (index) {
                if (0 === this._tabs.length) {
                    return false;
                }
                else if (0 <= index && index < this._tabs.length) {
                    return true;
                }
                else {
                    console.error(TAG + "invalid tab index. index: " + index);
                    return false;
                }
            };
            Object.defineProperty(TabHostView.prototype, "_activeTabView", {
                // アクティブなタブ ScrollManager を取得
                get: function () {
                    return this._tabs[this._activeTabIndex];
                },
                enumerable: true,
                configurable: true
            });
            TabHostView.EVENT_SCROLL_MOVE = "tabhost:scrollmove";
            TabHostView.EVENT_SCROLL_STOP = "tabhost:scrollstop";
            TabHostView.EVENT_TAB_MOVE = "tabhost:tabmove";
            TabHostView.EVENT_TAB_STOP = "tabhost:tavstop";
            return TabHostView;
        }(UI.PageContainerView));
        UI.TabHostView = TabHostView;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var TAG = "[CDP.UI.TabView] ";
        var SUPPRESS_WARNING_INITIAL_HEIGHT = 1;
        /**
         * @class TabView
         * @brief TabHostView にアタッチ可能な View クラス
         */
        var TabView = /** @class */ (function (_super) {
            __extends(TabView, _super);
            /**
             * constructor
             *
             */
            function TabView(options) {
                var _this = _super.call(this, $.extend({}, { initialHeight: SUPPRESS_WARNING_INITIAL_HEIGHT }, options)) || this;
                _this._host = null;
                _this._needRebuild = false; // ページ表示時に rebuild() をコールするための内部変数
                _this._host = options.host;
                if (!options.delayRegister) {
                    _this._host.registerTabView(_this);
                }
                return _this;
            }
            Object.defineProperty(TabView.prototype, "host", {
                ///////////////////////////////////////////////////////////////////////
                // Implements: IViewPager properties.
                // BaseTabPageView にアクセス
                get: function () {
                    return this._host;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TabView.prototype, "needRebuild", {
                // rebuild 状態へアクセス
                get: function () {
                    return this._needRebuild;
                },
                // rebuild 状態を設定
                set: function (rebuild) {
                    this._needRebuild = rebuild;
                },
                enumerable: true,
                configurable: true
            });
            ///////////////////////////////////////////////////////////////////////
            // Implements: IViewPager Framework.
            // 状態に応じたスクロール位置の保存/復元
            TabView.prototype.treatScrollPosition = function () {
                this.core.treatScrollPosition();
            };
            ///////////////////////////////////////////////////////////////////////
            // Implements: ITabView Events.
            // Scroller の初期化時にコールされる
            TabView.prototype.onInitialize = function (host, $root) {
                this._host = host;
                this.core.initialize($root, host.getBaseHeight());
                Backbone.View.prototype.setElement.call(this, $root, true);
            };
            // Scroller の破棄時にコールされる
            TabView.prototype.onDestroy = function () {
                this.remove();
                this._host = null;
            };
            // visibility 属性が変更されたときにコールされる
            TabView.prototype.onVisibilityChanged = function (visible) {
                // override
            };
            // ページが表示完了したときにコールされる
            TabView.prototype.onTabSelected = function () {
                this.core.setActiveState(true);
            };
            // ページが非表示に切り替わったときにコールされる
            TabView.prototype.onTabReleased = function () {
                this.core.setActiveState(false);
            };
            // ドラッグ中にコールされる
            TabView.prototype.onTabScrolling = function (position, offset) {
                // override
            };
            ///////////////////////////////////////////////////////////////////////
            // Implements: IOrientationChangedListener events.
            // Orientation の変更を受信
            TabView.prototype.onOrientationChanged = function (newOrientation) {
                // override
            };
            Object.defineProperty(TabView.prototype, "core", {
                ///////////////////////////////////////////////////////////////////////
                // Override: IListView
                // core framework access
                get: function () {
                    return this._scrollMgr;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TabView.prototype, "tabIndex", {
                ///////////////////////////////////////////////////////////////////////
                // protected methods
                // 自身の Tab Index を取得
                get: function () {
                    if (null == this._tabIndex) {
                        this._tabIndex = this._host.getTabIndexOf(this);
                    }
                    return this._tabIndex;
                },
                enumerable: true,
                configurable: true
            });
            // 自身が active か判定
            TabView.prototype.isActive = function () {
                return this.tabIndex === this._host.getActiveTabIndex();
            };
            return TabView;
        }(UI.ListView));
        UI.TabView = TabView;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
/* tslint:disable:max-line-length */
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var TAG = "[CDP.UI.PageListView] ";
        /**
         * @class PageListView
         * @brief 仮想リストビュー機能を持つ PageView クラス
         */
        var PageListView = /** @class */ (function (_super) {
            __extends(PageListView, _super);
            /**
             * constructor
             *
             * @param url     {String}                       [in] page template に使用する URL
             * @param id      {String}                       [in] page に振られた ID
             * @param options {PageListViewConstructOptions} [in] オプション
             */
            function PageListView(url, id, options) {
                var _this = _super.call(this, url, id, $.extend({}, {
                    autoDestoryElement: false,
                }, options)) || this;
                _this._scrollMgr = null; //!< scroll コアロジック
                _this._needRebuild = false; //!< ページ表示時に rebuild() をコールするための内部変数
                _this._scrollMgr = new UI.ScrollManager(options);
                return _this;
            }
            //! rebuild() のスケジューリング
            PageListView.prototype.reserveRebuild = function () {
                this._needRebuild = true;
            };
            ///////////////////////////////////////////////////////////////////////
            // Override: PageView
            //! Orientation の変更検知
            PageListView.prototype.onOrientationChanged = function (newOrientation) {
                this._scrollMgr.setBaseHeight(this.getPageBaseHeight());
            };
            //! ページ遷移直前イベント処理
            PageListView.prototype.onBeforeRouteChange = function () {
                if (this._pageOptions.autoDestoryElement) {
                    this._scrollMgr.destroy();
                }
                return _super.prototype.onBeforeRouteChange.call(this);
            };
            //! jQM event: "pagebeforeshow" に対応
            PageListView.prototype.onPageBeforeShow = function (event, data) {
                _super.prototype.onPageBeforeShow.call(this, event, data);
                this._scrollMgr.initialize(this.$page, this.getPageBaseHeight());
            };
            //! jQM event: "pagecontainershow" (旧:"pageshow") に対応
            PageListView.prototype.onPageShow = function (event, data) {
                _super.prototype.onPageShow.call(this, event, data);
                this._scrollMgr.setBaseHeight(this.getPageBaseHeight());
                if (this._needRebuild) {
                    this.rebuild();
                    this._needRebuild = false;
                }
            };
            //! jQM event: "pageremove" に対応
            PageListView.prototype.onPageRemove = function (event) {
                _super.prototype.onPageRemove.call(this, event);
                this.release();
            };
            ///////////////////////////////////////////////////////////////////////
            // Implements: IListView Profile 管理
            //! 初期化済みか判定
            PageListView.prototype.isInitialized = function () {
                return this._scrollMgr.isInitialized();
            };
            //! プロパティを指定して、ListItem を管理
            PageListView.prototype.addItem = function (height, initializer, info, insertTo) {
                this._addLine(new UI.LineProfile(this._scrollMgr, Math.floor(height), initializer, info), insertTo);
            };
            PageListView.prototype.removeItem = function (index, arg2, arg3) {
                this._scrollMgr.removeItem(index, arg2, arg3);
            };
            PageListView.prototype.getItemInfo = function (target) {
                return this._scrollMgr.getItemInfo(target);
            };
            //! アクティブページを更新
            PageListView.prototype.refresh = function () {
                this._scrollMgr.refresh();
            };
            //! 未アサインページを構築
            PageListView.prototype.update = function () {
                this._scrollMgr.update();
            };
            //! ページアサインを再構成
            PageListView.prototype.rebuild = function () {
                this._scrollMgr.rebuild();
            };
            //! 管轄データを破棄
            PageListView.prototype.release = function () {
                this._scrollMgr.release();
            };
            ///////////////////////////////////////////////////////////////////////
            // Implements: IListView Profile Backup / Restore
            //! 内部データをバックアップ
            PageListView.prototype.backup = function (key) {
                return this._scrollMgr.backup(key);
            };
            //! 内部データをリストア
            PageListView.prototype.restore = function (key, rebuild) {
                if (rebuild === void 0) { rebuild = true; }
                var retval = this._scrollMgr.restore(key, rebuild);
                if (retval && !rebuild) {
                    this.reserveRebuild();
                }
                return retval;
            };
            //! バックアップデータの有無
            PageListView.prototype.hasBackup = function (key) {
                return this._scrollMgr.hasBackup(key);
            };
            //! バックアップデータの破棄
            PageListView.prototype.clearBackup = function (key) {
                return this._scrollMgr.clearBackup(key);
            };
            Object.defineProperty(PageListView.prototype, "backupData", {
                //! バックアップデータにアクセス
                get: function () {
                    return this._scrollMgr.backupData;
                },
                enumerable: true,
                configurable: true
            });
            ///////////////////////////////////////////////////////////////////////
            // Implements: IListView Scroll
            //! スクロールイベントハンドラ設定/解除
            PageListView.prototype.setScrollHandler = function (handler, on) {
                this._scrollMgr.setScrollHandler(handler, on);
            };
            //! スクロール終了イベントハンドラ設定/解除
            PageListView.prototype.setScrollStopHandler = function (handler, on) {
                this._scrollMgr.setScrollStopHandler(handler, on);
            };
            //! スクロール位置を取得
            PageListView.prototype.getScrollPos = function () {
                return this._scrollMgr.getScrollPos();
            };
            //! スクロール位置の最大値を取得
            PageListView.prototype.getScrollPosMax = function () {
                return this._scrollMgr.getScrollPosMax();
            };
            //! スクロール位置を指定
            PageListView.prototype.scrollTo = function (pos, animate, time) {
                this._scrollMgr.scrollTo(pos, animate, time);
            };
            //! 指定された ListItemView の表示を保証
            PageListView.prototype.ensureVisible = function (index, options) {
                this._scrollMgr.ensureVisible(index, options);
            };
            Object.defineProperty(PageListView.prototype, "core", {
                ///////////////////////////////////////////////////////////////////////
                // Implements: IListView Properties
                //! core framework access
                get: function () {
                    return this._scrollMgr;
                },
                enumerable: true,
                configurable: true
            });
            ///////////////////////////////////////////////////////////////////////
            // Implements: IListView Internal I/F
            //! 登録 framework が使用する
            PageListView.prototype._addLine = function (_line, insertTo) {
                this._scrollMgr._addLine(_line, insertTo);
            };
            ///////////////////////////////////////////////////////////////////////
            // private method:
            //! ページの基準値を取得
            PageListView.prototype.getPageBaseHeight = function () {
                return $(window).height() - parseInt(this.$page.css("padding-top"), 10);
            };
            return PageListView;
        }(UI.PageView));
        UI.PageListView = PageListView;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var TAG = "[CDP.UI.PageExpandableListView] ";
        /**
         * @class PageExpandableListView
         * @brief 開閉リストビュー機能を持つ PageView クラス
         */
        var PageExpandableListView = /** @class */ (function (_super) {
            __extends(PageExpandableListView, _super);
            /**
             * constructor
             *
             * @param url     {String}                       [in] page template に使用する URL
             * @param id      {String}                       [in] page に振られた ID
             * @param options {PageListViewConstructOptions} [in] オプション
             */
            function PageExpandableListView(url, id, options) {
                var _this = _super.call(this, url, id, options) || this;
                _this._expandManager = null;
                _this._expandManager = new UI.ExpandManager(_this);
                return _this;
            }
            ///////////////////////////////////////////////////////////////////////
            // Implements: IExpandableListView
            //! 新規 GroupProfile を作成
            PageExpandableListView.prototype.newGroup = function (id) {
                return this._expandManager.newGroup(id);
            };
            //! 登録済み Group を取得
            PageExpandableListView.prototype.getGroup = function (id) {
                return this._expandManager.getGroup(id);
            };
            //! 第1階層の Group 登録
            PageExpandableListView.prototype.registerTopGroup = function (topGroup) {
                this._expandManager.registerTopGroup(topGroup);
            };
            //! 第1階層の Group を取得
            PageExpandableListView.prototype.getTopGroups = function () {
                return this._expandManager.getTopGroups();
            };
            //! すべてのグループを展開 (1階層)
            PageExpandableListView.prototype.expandAll = function () {
                this._expandManager.expandAll();
            };
            //! すべてのグループを収束 (1階層)
            PageExpandableListView.prototype.collapseAll = function (delay) {
                this._expandManager.collapseAll(delay);
            };
            //! 展開中か判定
            PageExpandableListView.prototype.isExpanding = function () {
                return this._expandManager.isExpanding();
            };
            //! 収束中か判定
            PageExpandableListView.prototype.isCollapsing = function () {
                return this._expandManager.isCollapsing();
            };
            //! 開閉中か判定
            PageExpandableListView.prototype.isSwitching = function () {
                return this._expandManager.isSwitching();
            };
            Object.defineProperty(PageExpandableListView.prototype, "layoutKey", {
                //! layout key を取得
                get: function () {
                    return this._expandManager.layoutKey;
                },
                //! layout key を設定
                set: function (key) {
                    this._expandManager.layoutKey = key;
                },
                enumerable: true,
                configurable: true
            });
            ///////////////////////////////////////////////////////////////////////
            // Override: PageListView
            //! データを破棄
            PageExpandableListView.prototype.release = function () {
                _super.prototype.release.call(this);
                this._expandManager.release();
            };
            //! 内部データをバックアップ
            PageExpandableListView.prototype.backup = function (key) {
                return this._expandManager.backup(key);
            };
            //! 内部データをリストア
            PageExpandableListView.prototype.restore = function (key, rebuild) {
                if (rebuild === void 0) { rebuild = true; }
                return this._expandManager.restore(key, rebuild);
            };
            return PageExpandableListView;
        }(UI.PageListView));
        UI.PageExpandableListView = PageExpandableListView;
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Extension;
        (function (Extension) {
            var Framework = CDP.Framework;
            // jQuery plugin
            $.fn.ripple = function (options) {
                var $el = $(this);
                if ($el.length <= 0) {
                    return $el;
                }
                return $el.on(Framework.Patch.s_vclickEvent, function (event) {
                    var surface = $(this);
                    // create surface if it doesn't exist
                    if (surface.find(".ui-ripple-ink").length === 0) {
                        surface.prepend("<div class='ui-ripple-ink'></div>");
                    }
                    var ink = surface.find(".ui-ripple-ink");
                    // stop the previous animation
                    ink.removeClass("ui-ripple-animate");
                    // ink size:
                    if (!ink.height() && !ink.width()) {
                        var d = Math.max(surface.outerWidth(), surface.outerHeight());
                        ink.css({ height: d, width: d });
                    }
                    var x = event.pageX - surface.offset().left - (ink.width() / 2);
                    var y = event.pageY - surface.offset().top - (ink.height() / 2);
                    var rippleColor = surface.data("ripple-color");
                    // animation end handler
                    var ANIMATION_END_EVENT = "animationend webkitAnimationEnd";
                    ink.on(ANIMATION_END_EVENT, function (ev) {
                        ink.off();
                        ink.removeClass("ui-ripple-animate");
                        ink = null;
                    });
                    // set the position and add class .animate
                    ink.css({
                        top: y + "px",
                        left: x + "px",
                        background: rippleColor
                    }).addClass("ui-ripple-animate");
                });
            };
            /**
             * Material Design Ripple 拡張
             *
             * @param {jQuery}              $ui       [in] 検索対象の jQuery オブジェクト
             * @param {DomExtensionOptions} [options] [in] オプション
             */
            function applyDomExtension($ui, options) {
                var NO_RIPPLE_CLASS = [
                    ".ui-ripple-none",
                    ".ui-flipswitch-on",
                    ".ui-slider-handle",
                    ".ui-input-clear",
                ];
                var selector = ".ui-btn";
                if ($ui.hasClass("ui-page")) {
                    selector = ".ui-content .ui-btn"; // header は自動 ripple 化対象外
                }
                $ui.find(selector)
                    .filter(function (index, elem) {
                    var $elem = $(elem);
                    if ($elem.is(NO_RIPPLE_CLASS.join(","))) {
                        return false;
                    }
                    else {
                        return true;
                    }
                })
                    .addClass("ui-ripple");
                // ripplify
                $ui.find(".ui-ripple")
                    .each(function (index, elem) {
                    $(elem).ripple(options);
                });
                return $ui;
            }
            // 登録
            UI.ExtensionManager.registerDomExtension(applyDomExtension);
        })(Extension = UI.Extension || (UI.Extension = {}));
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Extension;
        (function (Extension) {
            var Template = CDP.Tools.Template;
            var _template;
            // jQuery plugin
            $.fn.spinner = function (options) {
                if ("string" === typeof options) {
                    return refresh($(this));
                }
                else {
                    return spinnerify($(this), options);
                }
            };
            function spinnerify($target, options) {
                if ($target.length <= 0) {
                    return $target;
                }
                if (!_template) {
                    _template = Template.getJST("\n                <script type=\"text/template\">\n                    <span class=\"ui-spinner-base\">\n                        <span class=\"ui-spinner-inner\">\n                            <span class=\"ui-spinner-inner-gap\" {{borderTop}}></span>\n                            <span class=\"ui-spinner-inner-left\">\n                                <span class=\"ui-spinner-inner-half-circle\" {{border}}></span>\n                            </span>\n                            <span class=\"ui-spinner-inner-right\">\n                                <span class=\"ui-spinner-inner-half-circle\" {{border}}></span>\n                            </span>\n                        </span>\n                    </span>\n                </script>\n            ");
                }
                var makeTemplateParam = function (clr) {
                    return {
                        borderTop: "style=border-top-color:" + clr + ";",
                        border: "style=border-color:" + clr + ";",
                    };
                };
                var color = $target.data("spinner-color");
                var param = null;
                if (color) {
                    $target.css({ "background-color": color });
                    param = makeTemplateParam(color);
                }
                $target.append(_template(param));
                return refresh($target);
            }
            // iOS 10.2+ SVG SMIL アニメーションが 2回目以降動かない問題の対策
            // data:image/svg+xml;<cache bust string>;base64,... とすることで data-url にも cache busting が有効になる
            function refresh($target) {
                var PREFIX = ["-webkit-", ""];
                var valid = function (prop) {
                    return (prop && "none" !== prop);
                };
                var dataUrl;
                for (var i = 0, n = PREFIX.length; i < n; i++) {
                    if (!valid(dataUrl)) {
                        dataUrl = $target.css(PREFIX[i] + "mask-image");
                        if (valid(dataUrl)) {
                            // iOS では url(data***); 内に '"' は入らない
                            var match = dataUrl.match(/(url\(data:image\/svg\+xml;)([\s\S]*)?(base64,[\s\S]*\))/);
                            if (match) {
                                dataUrl = match[1] + "bust=" + Date.now().toString(36) + ";" + match[3];
                            }
                            else {
                                dataUrl = null;
                            }
                        }
                    }
                    if (valid(dataUrl)) {
                        $target.css(PREFIX[i] + "mask-image", dataUrl);
                    }
                }
                return $target;
            }
            /**
             * Material Design Spinner 拡張
             *
             * @param {jQuery}              $ui       [in] 検索対象の jQuery オブジェクト
             * @param {DomExtensionOptions} [options] [in] オプション
             */
            function applyDomExtension($ui, options) {
                $ui.find(".ui-spinner, .ui-icon-loading")
                    .each(function (index, elem) {
                    $(elem).spinner(options);
                });
                return $ui;
            }
            // 登録
            UI.ExtensionManager.registerDomExtension(applyDomExtension);
        })(Extension = UI.Extension || (UI.Extension = {}));
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Extension;
        (function (Extension) {
            /**
             * Text Input 用 Floating Label 拡張
             *
             * @param {jQuery}              $ui       [in] 検索対象の jQuery オブジェクト
             * @param {DomExtensionOptions} [options] [in] オプション
             */
            function applyDomExtension($ui, options) {
                var update = function (elem, floating) {
                    var $elem = $(elem);
                    if (floating) {
                        $elem.addClass("ui-float-label-floating");
                    }
                    else {
                        $elem.removeClass("ui-float-label-floating");
                    }
                };
                var floatingify = function (elem) {
                    var id = $(elem).attr("for");
                    var $input = $ui.find("#" + id);
                    if ("search" === $input.jqmData("type")) {
                        $(elem).addClass("ui-float-label-has-icon");
                    }
                    update(elem, !!$input.val());
                    $input.on("keyup change input focus blur cut paste", function (event) {
                        update(elem, !!$(event.target).val());
                    });
                };
                $ui.find("label.ui-float-label, .ui-float-label label")
                    .each(function (index, elem) {
                    floatingify(elem);
                });
                return $ui;
            }
            // 登録
            UI.ExtensionManager.registerDomExtension(applyDomExtension);
        })(Extension = UI.Extension || (UI.Extension = {}));
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Extension;
        (function (Extension) {
            var Framework = CDP.Framework;
            /**
             * jQuery Mobile Flip Switch 拡張
             *
             * @param {jQuery}              $ui       [in] 検索対象の jQuery オブジェクト
             * @param {DomExtensionOptions} [options] [in] オプション
             */
            function applyDomExtension($ui, options) {
                /*
                 * flipswitch に紐づく label は OS によって event 発行形式が異なるためフックして独自イベントで対応する.
                 * また flipswitch は内部で click を発行しているが、vclick に変更する.
                 */
                var _getAllSwitches = function () {
                    return $ui.find(".ui-flipswitch");
                };
                var _getInputFromSwitch = function ($switch) {
                    var $input = $switch.find("input");
                    if ($input.length) {
                        return $input;
                    }
                    var $select = $switch.find("select");
                    if ($select.length) {
                        return $select;
                    }
                    return null;
                };
                var _change = function ($input, to) {
                    if ($input) {
                        if ("INPUT" === $input[0].nodeName) {
                            $input.prop("checked", to).flipswitch("refresh");
                        }
                        else if ("SELECT" === $input[0].nodeName) {
                            $input.val(to ? "on" : "off").flipswitch("refresh");
                        }
                    }
                };
                var _getLabelsFromSwitch = function ($switch) {
                    var $input = _getInputFromSwitch($switch);
                    if ($input) {
                        var labels = $input[0].labels;
                        if (labels) {
                            return $(labels);
                        }
                    }
                    return $();
                };
                var _getSwitchFromLabel = function ($label) {
                    var name = $label.attr("for");
                    return _getAllSwitches().find("[name='" + name + "']");
                };
                _getAllSwitches()
                    .on("vclick _change_flipswich", function (event) {
                    var $switch = $(event.currentTarget);
                    var $target = $(event.target);
                    var $input = _getInputFromSwitch($switch);
                    var changeTo = !$switch.hasClass("ui-flipswitch-active");
                    if ($target.hasClass("ui-flipswitch-input")) {
                        _change($input, changeTo);
                    }
                    else if ($target.hasClass("ui-flipswitch-on")) {
                        if (Framework.Platform.Mobile && Framework.Patch.isSupportedVclick()) {
                            _change($input, changeTo);
                            event.preventDefault();
                        }
                    }
                })
                    .each(function (index, flipswitch) {
                    _getLabelsFromSwitch($(flipswitch))
                        .on("vclick", function (event) {
                        var $switch = _getSwitchFromLabel($(event.target));
                        if (!$switch.parent().hasClass("ui-state-disabled")) {
                            $switch.trigger("_change_flipswich");
                        }
                        event.preventDefault();
                    });
                });
                return $ui;
            }
            // 登録
            UI.ExtensionManager.registerDomExtension(applyDomExtension);
        })(Extension = UI.Extension || (UI.Extension = {}));
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Extension;
        (function (Extension) {
            /**
             * jQuery Mobile Slider 拡張
             *
             * @param {jQuery}              $ui       [in] 検索対象の jQuery オブジェクト
             * @param {DomExtensionOptions} [options] [in] オプション
             */
            function applyDomExtension($ui, options) {
                $ui.find(".ui-slider-input")
                    .on("slidestop", function (event) {
                    var $handles = $(event.currentTarget)
                        .parent()
                        .find(".ui-slider-handle");
                    $handles.blur();
                });
                return $ui;
            }
            // 登録
            UI.ExtensionManager.registerDomExtension(applyDomExtension);
        })(Extension = UI.Extension || (UI.Extension = {}));
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var UI;
    (function (UI) {
        var Extension;
        (function (Extension) {
            //! iScroll.click patch
            var patch_IScroll_utils_click = function (event) {
                var target = event.target;
                var e = event;
                var ev;
                // [CDP modified]: set target.clientX.
                if (null == target.clientX || null == target.clientY) {
                    if (null != e.pageX && null != e.pageY) {
                        target.clientX = e.pageX;
                        target.clientY = e.pageY;
                    }
                    else if (e.changedTouches && e.changedTouches[0]) {
                        target.clientX = e.changedTouches[0].pageX;
                        target.clientY = e.changedTouches[0].pageY;
                    }
                }
                if (!(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName)) {
                    ev = document.createEvent("MouseEvents");
                    ev.initMouseEvent("click", true, true, e.view, 1, target.screenX, target.screenY, target.clientX, target.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
                    ev._constructed = true;
                    target.dispatchEvent(ev);
                }
            };
            var s_applied = false;
            /**
             * iScroll Patch 拡張
             *
             * @param {jQuery}              $ui       [in] 検索対象の jQuery オブジェクト
             * @param {DomExtensionOptions} [options] [in] オプション
             */
            function applyPatch($ui, options) {
                if (!s_applied && UI.global.IScroll && UI.global.IScroll.utils) {
                    UI.global.IScroll.utils.click = patch_IScroll_utils_click;
                    s_applied = true;
                }
                return $ui;
            }
            // 登録
            UI.ExtensionManager.registerDomExtension(applyPatch);
        })(Extension = UI.Extension || (UI.Extension = {}));
    })(UI = CDP.UI || (CDP.UI = {}));
})(CDP || (CDP = {}));

return CDP.UI; }));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNkcDovLy9DRFAvVUkvanFtL1RoZW1lLnRzIiwiY2RwOi8vL0NEUC9VSS9qcW0vRXh0ZW5zaW9uTWFuYWdlci50cyIsImNkcDovLy9DRFAvVUkvanFtL1RvYXN0LnRzIiwiY2RwOi8vL0NEUC9VSS9qcW0vRGlhbG9nLnRzIiwiY2RwOi8vL0NEUC9VSS9qcW0vRGlhbG9nQ29tbW9ucy50cyIsImNkcDovLy9DRFAvVUkvanFtL0Jhc2VIZWFkZXJWaWV3LnRzIiwiY2RwOi8vL0NEUC9VSS9qcW0vQmFzZVBhZ2UudHMiLCJjZHA6Ly8vQ0RQL1VJL2pxbS9QYWdlVmlldy50cyIsImNkcDovLy9DRFAvVUkvanFtL1BhZ2VDb250YWluZXJWaWV3LnRzIiwiY2RwOi8vL0NEUC9VSS9qcW0vVGFiSG9zdFZpZXcudHMiLCJjZHA6Ly8vQ0RQL1VJL2pxbS9UYWJWaWV3LnRzIiwiY2RwOi8vL0NEUC9VSS9qcW0vUGFnZUxpc3RWaWV3LnRzIiwiY2RwOi8vL0NEUC9VSS9qcW0vUGFnZUV4cGFuZGFibGVMaXN0Vmlldy50cyIsImNkcDovLy9DRFAvVUkvanFtL0V4dGVuc2lvbi9SaXBwbGUudHMiLCJjZHA6Ly8vQ0RQL1VJL2pxbS9FeHRlbnNpb24vU3Bpbm5lci50cyIsImNkcDovLy9DRFAvVUkvanFtL0V4dGVuc2lvbi9GbG9hdExhYmVsLnRzIiwiY2RwOi8vL0NEUC9VSS9qcW0vRXh0ZW5zaW9uL0ZsaXBTd2l0Y2gudHMiLCJjZHA6Ly8vQ0RQL1VJL2pxbS9FeHRlbnNpb24vU2xpZGVyLnRzIiwiY2RwOi8vL0NEUC9VSS9qcW0vRXh0ZW5zaW9uL0lTY3JvbGwudHMiLCJjZHA6Ly8vQ0RQL1VJL2pxbS9JbnRlcmZhY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQVUsR0FBRyxDQTRPWjtBQTVPRCxXQUFVLEdBQUc7SUFBQyxNQUFFLENBNE9mO0lBNU9hLGFBQUU7UUFFWixJQUFPLE1BQU0sR0FBUyxHQUFHLENBQUMsTUFBTSxDQUFDO1FB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QUFFLEtBQUYsTUFBRSxRQWlEZjtBQUFELENBQUMsRUFqRFMsR0FBRyxLQUFILEdBQUcsUUFpRFoiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgQ0RQLlVJIHtcclxuXHJcbiAgICBpbXBvcnQgQ29uZmlnICAgICAgID0gQ0RQLkNvbmZpZztcclxuICAgIGltcG9ydCBGcmFtZXdvcmsgICAgPSBDRFAuRnJhbWV3b3JrO1xyXG5cclxuICAgIGNvbnN0IFRBRyA9IFwiW0NEUC5VSS5UaGVtZV0gXCI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJmYWNlIFBsYXRmb3JtVHJhbnNpdGlvblxyXG4gICAgICogQGJyaWVmIOODl+ODqeODg+ODiOODleOCqeODvOODoOOBlOOBqOOBriBUcmFuc2l0aW9uIOOCkuagvOe0jVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFBsYXRmb3JtVHJhbnNpdGlvbiB7XHJcbiAgICAgICAgW3BsYXRmb3JtOiBzdHJpbmddOiBzdHJpbmc7ICAgICAvLyBleCkgaW9zOiBcInNsaWRlXCJcclxuICAgICAgICBmYWxsYmFjazogc3RyaW5nOyAgICAgICAgICAgICAgIC8vIGZhbGxiYWNrIHRyYW5zaXRpb24gcHJvcFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGludGVyZmFjZSBUcmFuc2l0aW9uTWFwXHJcbiAgICAgKiBAYnJpZWYg44OI44Op44Oz44K444K344On44Oz44Oe44OD44OXXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVHJhbnNpdGlvbk1hcCB7XHJcbiAgICAgICAgW3RyYW5zaXRpb25OYW1lOiBzdHJpbmddOiBQbGF0Zm9ybVRyYW5zaXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJmYWNlIFRoZW1lSW5pdE9wdGlvbnNcclxuICAgICAqIEBicmllZiDjg4jjg6njg7Pjgrjjgrfjg6fjg7Pjg57jg4Pjg5dcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBUaGVtZUluaXRPcHRpb25zIHtcclxuICAgICAgICBwbGF0Zm9ybT86IHN0cmluZzsgICAgICAgICAgICAgICAgICAvLyBwbGF0Zm9ybSDjgpLmjIflrpouIGRlZmF1bHQ6XCJhdXRvXCJcclxuICAgICAgICByZXNlcnZlU2Nyb2xsYmFyUmVnaW9uPzogYm9vbGVhbjsgICAvLyBQQyDjg4fjg5Djg4PjgrDnkrDlooPjgafjga/jgrnjgq/jg63jg7zjg6vjg5Djg7zjgpLooajnpLouIGRlZmF1bHQ6IFwidHJ1ZVwiXHJcbiAgICB9XHJcblxyXG4gICAgLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBjbGFzcyBUaGVtZVxyXG4gICAgICogQGJyaWVmIFVJIFRoZW1lIOioreWumuOCkuihjOOBhuODpuODvOODhuOCo+ODquODhuOCo+OCr+ODqeOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVGhlbWUge1xyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzX3BsYXRmb3Jtczogc3RyaW5nW10gPSBbXCJpb3NcIiwgXCJhbmRyb2lkXCJdO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHNfcGFnZVRyYW5zaXRpb25NYXA6IFRyYW5zaXRpb25NYXAgPSB7XHJcbiAgICAgICAgICAgIFwicGxhdGZvcm0tZGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgICBpb3M6IFwic2xpZGVcIixcclxuICAgICAgICAgICAgICAgIGFuZHJvaWQ6IFwiZmxvYXR1cFwiLFxyXG4gICAgICAgICAgICAgICAgZmFsbGJhY2s6IFwic2xpZGVcIixcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJwbGF0Zm9ybS1hbHRlcm5hdGl2ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBpb3M6IFwic2xpZGV1cFwiLFxyXG4gICAgICAgICAgICAgICAgYW5kcm9pZDogXCJmbG9hdHVwXCIsXHJcbiAgICAgICAgICAgICAgICBmYWxsYmFjazogXCJzbGlkZXVwXCIsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzX2RpYWxvZ1RyYW5zaXRpb25NYXA6IFRyYW5zaXRpb25NYXAgPSB7XHJcbiAgICAgICAgICAgIFwicGxhdGZvcm0tZGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgICBpb3M6IFwicG9wem9vbVwiLFxyXG4gICAgICAgICAgICAgICAgYW5kcm9pZDogXCJjcm9zc3pvb21cIixcclxuICAgICAgICAgICAgICAgIGZhbGxiYWNrOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIHB1YmxpYyBzdGF0aWMgbWV0aG9kczpcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlbWUg44Gu5Yid5pyf5YyWXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gb3B0aW9ucyDjgqrjg5fjgrfjg6fjg7PmjIflrppcclxuICAgICAgICAgKiBAcmV0dXJucyB0cnVlOiDmiJDlip8gLyBmYWxzZTog5aSx5pWXXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbml0aWFsaXplKG9wdGlvbnM/OiBUaGVtZUluaXRPcHRpb25zKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgY29uc3Qgb3B0ID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgICAgICAgICAgIHBsYXRmb3JtOiBcImF1dG9cIixcclxuICAgICAgICAgICAgICAgIHJlc2VydmVTY3JvbGxiYXJSZWdpb246IHRydWUsXHJcbiAgICAgICAgICAgIH0sIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKFwiYXV0b1wiID09PSBvcHQucGxhdGZvcm0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBUaGVtZS5kZXRlY3RVSVBsYXRmb3JtKG9wdC5yZXNlcnZlU2Nyb2xsYmFyUmVnaW9uKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChUaGVtZS5zZXRDdXJyZW50VUlQbGF0Zm9ybShvcHQucGxhdGZvcm0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdC5wbGF0Zm9ybTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFRBRyArIFwic2V0Q3VycmVudFVJUGxhdGZvcm0oKSwgZmFpbGVkLiBwbGF0Zm9ybTogXCIgKyBvcHQucGxhdGZvcm0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDnj77lnKjmjIflrprjgZXjgozjgabjgYTjgosgVUkgUGxhdGZvcm0g44KS5Y+W5b6XXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IGV4KSBcImlvc1wiXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRDdXJyZW50VUlQbGF0Zm9ybSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBjb25zdCAkaHRtcyA9ICQoXCJodG1sXCIpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbiA9IFRoZW1lLnNfcGxhdGZvcm1zLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCRodG1zLmhhc0NsYXNzKFwidWktcGxhdGZvcm0tXCIgKyBUaGVtZS5zX3BsYXRmb3Jtc1tpXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVGhlbWUuc19wbGF0Zm9ybXNbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVSSBQbGF0Zm9ybSDjgpLoqK3lrppcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gdHJ1ZTog5oiQ5YqfIC8gZmFsc2U6IOWkseaVl1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2V0Q3VycmVudFVJUGxhdGZvcm0ocGxhdGZvcm06IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBpZiAobnVsbCA9PSBwbGF0Zm9ybSB8fCBUaGVtZS5zX3BsYXRmb3Jtcy5pbmRleE9mKHBsYXRmb3JtKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCAkaHRtcyA9ICQoXCJodG1sXCIpO1xyXG4gICAgICAgICAgICAgICAgVGhlbWUuc19wbGF0Zm9ybXMuZm9yRWFjaCgodGFyZ2V0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGh0bXMucmVtb3ZlQ2xhc3MoXCJ1aS1wbGF0Zm9ybS1cIiArIHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmIChwbGF0Zm9ybSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRodG1zLmFkZENsYXNzKFwidWktcGxhdGZvcm0tXCIgKyBwbGF0Zm9ybSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog54++5Zyo44GuIFBsYXRmb3JtIOOCkuWIpOWumuOBl+acgOmBqeOBqiBwbGF0Zm9ybSDjgpLoh6rli5XmsbrlrppcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSByZXNlcnZlU2Nyb2xsYmFyUmVnaW9uIFBDIOODh+ODkOODg+OCsOeSsOWig+OBp+OBr+OCueOCr+ODreODvOODq+ODkOODvOOCkuihqOekui4gZGVmYXVsdDogdHJ1ZVxyXG4gICAgICAgICAqIEByZXR1cm5zIGV4KSBcImlvc1wiXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZXRlY3RVSVBsYXRmb3JtKHJlc2VydmVTY3JvbGxiYXJSZWdpb246IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgbGV0IHBsYXRmb3JtID0gXCJcIjtcclxuICAgICAgICAgICAgLy8gcGxhdGZvcm0g44Gu6Kit5a6aXHJcbiAgICAgICAgICAgIGlmIChGcmFtZXdvcmsuUGxhdGZvcm0uaU9TKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiaHRtbFwiKS5hZGRDbGFzcyhcInVpLXBsYXRmb3JtLWlvc1wiKTtcclxuICAgICAgICAgICAgICAgIHBsYXRmb3JtID0gXCJpb3NcIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoXCJodG1sXCIpLmFkZENsYXNzKFwidWktcGxhdGZvcm0tYW5kcm9pZFwiKTtcclxuICAgICAgICAgICAgICAgIHBsYXRmb3JtID0gXCJhbmRyb2lkXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUEMg44OH44OQ44OD44Kw55Kw5aKD44Gn44Gv44K544Kv44Ot44O844Or44OQ44O844KS6KGo56S6XHJcbiAgICAgICAgICAgIGlmIChDb25maWcuREVCVUcgJiYgcmVzZXJ2ZVNjcm9sbGJhclJlZ2lvbiAmJiAhRnJhbWV3b3JrLlBsYXRmb3JtLk1vYmlsZSkge1xyXG4gICAgICAgICAgICAgICAgJChcImJvZHlcIikuY3NzKFwib3ZlcmZsb3cteVwiLCBcInNjcm9sbFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcGxhdGZvcm07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBwbGF0Zm9ybSDjgpLphY3liJfjgafnmbvpjLJcclxuICAgICAgICAgKiDkuIrmm7jjgY3jgZXjgozjgotcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nW119IHBsYXRmb3JtcyBbaW5dIE9TIGV4KTogW1wiaW9zXCIsIFwiYW5kcm9pZFwiXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVnaXN0ZXJVSVBsYXRmb3JtcyhwbGF0Zm9ybXM6IHN0cmluZ1tdKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChwbGF0Zm9ybXMpIHtcclxuICAgICAgICAgICAgICAgIFRoZW1lLnNfcGxhdGZvcm1zID0gcGxhdGZvcm1zO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBwYWdlIHRyYW5zaXRpb24g44KS55m76YyyXHJcbiAgICAgICAgICog5LiK5pu444GN44GV44KM44KLXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge1RyYW5zaXRpb25NYXB9IG1hcCBbaW5dIFRyYW5zaXRpb25NYXAg44KS5oyH5a6aXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyByZWdpc3RlclBhZ2VUcmFuc2l0aW9uTWFwKG1hcDogVHJhbnNpdGlvbk1hcCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAobWFwKSB7XHJcbiAgICAgICAgICAgICAgICBUaGVtZS5zX3BhZ2VUcmFuc2l0aW9uTWFwID0gbWFwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBkaWFsb2cgdHJhbnNpdGlvbiDjgpLnmbvpjLJcclxuICAgICAgICAgKiDkuIrmm7jjgY3jgZXjgozjgotcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7VHJhbnNpdGlvbk1hcH0gbWFwIFtpbl0gVHJhbnNpdGlvbk1hcCDjgpLmjIflrppcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlZ2lzdGVyRGlhbG9nVHJhbnNpdGlvbk1hcChtYXA6IFRyYW5zaXRpb25NYXApOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKG1hcCkge1xyXG4gICAgICAgICAgICAgICAgVGhlbWUuc19kaWFsb2dUcmFuc2l0aW9uTWFwID0gbWFwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBwYWdlIHRyYW5zaXRpb24g44KS5Y+W5b6XXHJcbiAgICAgICAgICogVHJhbnNpdGlvbk1hcCDjgavjgqLjgrXjgqTjg7PjgZXjgozjgabjgYTjgovjgoLjga7jgafjgYLjgozjgbDlpInmj5tcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ1tdfSBcInNsaWRlXCJcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHF1ZXJ5UGFnZVRyYW5zaXRpb24ob3JpZ2luYWw6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnZlcnQgPSBUaGVtZS5zX3BhZ2VUcmFuc2l0aW9uTWFwW29yaWdpbmFsXTtcclxuICAgICAgICAgICAgaWYgKGNvbnZlcnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb252ZXJ0W1RoZW1lLmdldEN1cnJlbnRVSVBsYXRmb3JtKCldIHx8IGNvbnZlcnQuZmFsbGJhY2s7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGRpYWxvZyB0cmFuc2l0aW9uIOOCkuWPluW+l1xyXG4gICAgICAgICAqIFRyYW5zaXRpb25NYXAg44Gr44Ki44K144Kk44Oz44GV44KM44Gm44GE44KL44KC44Gu44Gn44GC44KM44Gw5aSJ5o+bXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmdbXX0gXCJzbGlkZVwiXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBxdWVyeURpYWxvZ1RyYW5zaXRpb24ob3JpZ2luYWw6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnZlcnQgPSBUaGVtZS5zX2RpYWxvZ1RyYW5zaXRpb25NYXBbb3JpZ2luYWxdO1xyXG4gICAgICAgICAgICBpZiAoY29udmVydCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnZlcnRbVGhlbWUuZ2V0Q3VycmVudFVJUGxhdGZvcm0oKV0gfHwgY29udmVydC5mYWxsYmFjaztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xyXG5cclxuICAgIC8vIGpxdWV5Lm1vYmlsZS5jaGFuZ2VQYWdlKCkg44GuIEhvb2suXHJcbiAgICBmdW5jdGlvbiBhcHBseUN1c3RvbUNoYW5nZVBhZ2UoKSB7XHJcbiAgICAgICAgY29uc3QganFtQ2hhbmdlUGFnZTogKHRvOiBhbnksIG9wdGlvbnM/OiBDaGFuZ2VQYWdlT3B0aW9ucykgPT4gdm9pZCA9ICQubW9iaWxlLmNoYW5nZVBhZ2UuYmluZCgkLm1vYmlsZSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGN1c3RvbUNoYW5nZVBhZ2UodG86IGFueSwgb3B0aW9ucz86IENoYW5nZVBhZ2VPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChfLmlzU3RyaW5nKHRvKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy50cmFuc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50cmFuc2l0aW9uID0gVGhlbWUucXVlcnlQYWdlVHJhbnNpdGlvbihvcHRpb25zLnRyYW5zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGpxbUNoYW5nZVBhZ2UodG8sIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJC5tb2JpbGUuY2hhbmdlUGFnZSA9IGN1c3RvbUNoYW5nZVBhZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZnJhbWV3b3JrIOWIneacn+WMluW+jOOBq+mBqeeUqFxyXG4gICAgRnJhbWV3b3JrLndhaXRGb3JJbml0aWFsaXplKClcclxuICAgICAgICAuZG9uZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIGFwcGx5Q3VzdG9tQ2hhbmdlUGFnZSgpO1xyXG4gICAgICAgIH0pO1xyXG59XHJcbiIsIm5hbWVzcGFjZSBDRFAuVUkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGludGVyZmFjZSBEb21FeHRlbnNpb25PcHRpb25zXHJcbiAgICAgKiBAYnJlaWYgRG9tRXh0ZW5zaW9uIOOBq+a4oeOBmeOCquODl+OCt+ODp+ODs+OCpOODs+OCv+ODvOODleOCp+OCpOOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIERvbUV4dGVuc2lvbk9wdGlvbnMge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEB0eXBlIERvbUV4dGVuc2lvblxyXG4gICAgICogQGJyaWVmIERPTSDmi6HlvLXplqLmlbBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IHR5cGUgRG9tRXh0ZW5zaW9uID0gKCR0YXJnZXQ6IEpRdWVyeSwgRG9tRXh0ZW5zaW9uT3B0aW9ucz86IE9iamVjdCkgPT4gSlF1ZXJ5O1xyXG5cclxuICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2xhc3MgRXh0ZW5zaW9uTWFuYWdlclxyXG4gICAgICogQGJyaWVmIOaLoeW8teapn+iDveOCkueuoeeQhuOBmeOCi+ODpuODvOODhuOCo+ODquODhuOCo+OCr+ODqeOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRXh0ZW5zaW9uTWFuYWdlciB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHNfZG9tRXh0ZW5zaW9uczogRG9tRXh0ZW5zaW9uW10gPSBbXTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRE9NIOaLoeW8temWouaVsOOBrueZu+mMslxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtEb21FeHRlbnNpb259IGZ1bmMgW2luXSBET00g5ouh5by16Zai5pWwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyByZWdpc3RlckRvbUV4dGVuc2lvbihmdW5jOiBEb21FeHRlbnNpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5zX2RvbUV4dGVuc2lvbnMucHVzaChmdW5jKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERPTSDmi6HlvLXjgpLpgannlKhcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkdWkgICAgICAgW2luXSDmi6HlvLXlr77osaHjga4gRE9NXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBbaW5dIOOCquODl+OCt+ODp+ODs1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYXBwbHlEb21FeHRlbnNpb24oJHVpOiBKUXVlcnksIG9wdGlvbnM/OiBEb21FeHRlbnNpb25PcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc19kb21FeHRlbnNpb25zLmZvckVhY2goKGZ1bmM6IERvbUV4dGVuc2lvbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgZnVuYygkdWksIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLyogdHNsaW50OmRpc2FibGU6bm8tYml0d2lzZSAqL1xyXG5cclxubmFtZXNwYWNlIENEUC5VSSB7XHJcblxyXG4gICAgY29uc3QgVEFHID0gXCJbQ0RQLlVJLlRvYXN0XSBcIjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBjbGFzcyBUb2FzdFxyXG4gICAgICogQGJyaWVmIEFuZHJvaWQgU0RLIOOBriBUb2FzdCDjgq/jg6njgrnjga7jgojjgYbjgavoh6rli5Xmtojmu4XjgZnjgovjg6Hjg4Pjgrvjg7zjgrjlh7rlipvjg6bjg7zjg4bjgqPjg6rjg4bjgqNcclxuICAgICAqICAgICAgICDlhaXjgozlrZDjga7plqLkv4LjgpLlrp/nj77jgZnjgovjgZ/jgoHjgasgbW9kdWxlIOOBp+Wun+ijhVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgbW9kdWxlIFRvYXN0IHtcclxuXHJcbiAgICAgICAgLy8g6KGo56S65pmC6ZaT44Gu5a6a576pXHJcbiAgICAgICAgZXhwb3J0IGxldCBMRU5HVEhfU0hPUlQgPSAxNTAwOyAgIC8vITwg55+t44GEOjE1MDAgbXNlY1xyXG4gICAgICAgIGV4cG9ydCBsZXQgTEVOR1RIX0xPTkcgID0gNDAwMDsgICAvLyE8IOmVt+OBhDo0MDAwIG1zZWNcclxuXHJcbiAgICAgICAgLy8hIEBlbnVtIOOCquODleOCu+ODg+ODiOOBruWfuua6llxyXG4gICAgICAgIGV4cG9ydCBlbnVtIE9mZnNldFgge1xyXG4gICAgICAgICAgICBMRUZUICAgID0gMHgwMDAxLFxyXG4gICAgICAgICAgICBSSUdIVCAgID0gMHgwMDAyLFxyXG4gICAgICAgICAgICBDRU5URVIgID0gMHgwMDA0LFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIEBlbnVtIOOCquODleOCu+ODg+ODiOOBruWfuua6llxyXG4gICAgICAgIGV4cG9ydCBlbnVtIE9mZnNldFkge1xyXG4gICAgICAgICAgICBUT1AgICAgID0gMHgwMDEwLFxyXG4gICAgICAgICAgICBCT1RUT00gID0gMHgwMDIwLFxyXG4gICAgICAgICAgICBDRU5URVIgID0gMHgwMDQwLFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQGludGVyZmFjZSBTdHlsZUJ1aWxkZXJcclxuICAgICAgICAgKiBAYnJpZWYgICAgIOOCueOCv+OCpOODq+WkieabtOaZguOBq+S9v+eUqOOBmeOCi+OCpOODs+OCv+ODvOODleOCp+OCpOOCuVxyXG4gICAgICAgICAqICAgICAgICAgICAgY3NzIOOBq+OCueOCv+OCpOODq+OCkumAg+OBjOOBmeWgtOWQiOOAgeeLrOiHquOBriBjbGFzcyDjgpLoqK3lrprjgZfjgIFnZXRTdHlsZSDjga8gbnVsbCDjgpLov5TjgZnjgZPjgajjgIJcclxuICAgICAgICAgKi9cclxuICAgICAgICBleHBvcnQgaW50ZXJmYWNlIFN0eWxlQnVpbGRlciB7XHJcbiAgICAgICAgICAgIC8vISBjbGFzcyBhdHRyaWJ1dGUg44Gr6Kit5a6a44GZ44KL5paH5a2X5YiX44KS5Y+W5b6XXHJcbiAgICAgICAgICAgIGdldENsYXNzKCk6IHN0cmluZztcclxuICAgICAgICAgICAgLy8hIHN0eWxlIGF0dHJpYnV0ZSDjgavoqK3lrprjgZnjgosgSlNPTiDjgqrjg5bjgrjjgqfjgq/jg4jjgpLlj5blvpdcclxuICAgICAgICAgICAgZ2V0U3R5bGUoKTogYW55O1xyXG4gICAgICAgICAgICAvLyEg44Kq44OV44K744OD44OI44Gu5Z+65rqW5L2N572u44KS5Y+W5b6XXHJcbiAgICAgICAgICAgIGdldE9mZnNldFBvaW50KCk6IG51bWJlcjtcclxuICAgICAgICAgICAgLy8hIFgg5bqn5qiZ44Gu44Kq44OV44K744OD44OI5YCk44KS5Y+W5b6XXHJcbiAgICAgICAgICAgIGdldE9mZnNldFgoKTogbnVtYmVyO1xyXG4gICAgICAgICAgICAvLyEgWSDluqfmqJnjga7jgqrjg5Xjgrvjg4Pjg4jlgKTjgpLlj5blvpdcclxuICAgICAgICAgICAgZ2V0T2Zmc2V0WSgpOiBudW1iZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAY2xhc3MgU3R5bGVCdWlsZGVyRGVmYXVsdFxyXG4gICAgICAgICAqIEBicmllZiDjgrnjgr/jgqTjg6vlpInmm7TmmYLjgavkvb/nlKjjgZnjgovml6Llrprjga7mp4vpgKDkvZPjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKi9cclxuICAgICAgICBleHBvcnQgY2xhc3MgU3R5bGVCdWlsZGVyRGVmYXVsdCBpbXBsZW1lbnRzIFN0eWxlQnVpbGRlciB7XHJcblxyXG4gICAgICAgICAgICAvLyEgY2xhc3MgYXR0cmlidXRlIOOBq+ioreWumuOBmeOCi+aWh+Wtl+WIl+OCkuWPluW+l1xyXG4gICAgICAgICAgICBnZXRDbGFzcygpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwidWktbG9hZGVyIHVpLW92ZXJsYXktc2hhZG93IHVpLWNvcm5lci1hbGxcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8hIHN0eWxlIGF0dHJpYnV0ZSDjgavoqK3lrprjgZnjgosgSlNPTiDjgqrjg5bjgrjjgqfjgq/jg4jjgpLlj5blvpdcclxuICAgICAgICAgICAgZ2V0U3R5bGUoKTogYW55IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0eWxlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicGFkZGluZ1wiOiAgICAgICAgICBcIjdweCAyNXB4IDdweCAyNXB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5XCI6ICAgICAgICAgIFwiYmxvY2tcIixcclxuICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtY29sb3JcIjogXCIjMWQxZDFkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJib3JkZXItY29sb3JcIjogICAgIFwiIzFiMWIxYlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29sb3JcIjogICAgICAgICAgICBcIiNmZmZcIixcclxuICAgICAgICAgICAgICAgICAgICBcInRleHQtc2hhZG93XCI6ICAgICAgXCIwIDFweCAwICMxMTFcIixcclxuICAgICAgICAgICAgICAgICAgICBcImZvbnQtd2VpZ2h0XCI6ICAgICAgXCJib2xkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJvcGFjaXR5XCI6ICAgICAgICAgIDAuOCxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3R5bGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vISDjgqrjg5Xjgrvjg4Pjg4jjga7ln7rmupbkvY3nva7jgpLlj5blvpdcclxuICAgICAgICAgICAgZ2V0T2Zmc2V0UG9pbnQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBPZmZzZXRYLkNFTlRFUiB8IE9mZnNldFkuQk9UVE9NO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyEgWCDluqfmqJnjga7jgqrjg5Xjgrvjg4Pjg4jlgKTjgpLlj5blvpdcclxuICAgICAgICAgICAgZ2V0T2Zmc2V0WCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vISBZIOW6p+aomeOBruOCquODleOCu+ODg+ODiOWApOOCkuWPluW+l1xyXG4gICAgICAgICAgICBnZXRPZmZzZXRZKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTc1O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUb2FzdCDooajnpLpcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBtZXNzYWdlICBbaW5dIOODoeODg+OCu+ODvOOCuFxyXG4gICAgICAgICAqIEBwYXJhbSBkdXJhdGlvbiBbaW5dIOihqOekuuaZgumWk+OCkuioreWumiAobXNlYykgZGVmYXVsdDogTEVOR1RIX1NIT1JUXHJcbiAgICAgICAgICogQHBhcmFtIHN0eWxlICAgIFtpbl0g44K544K/44Kk44Or5aSJ5pu044GZ44KL5aC05ZCI44Gr44Gv5rS+55Sf44Kv44Op44K544Kq44OW44K444Kn44Kv44OI44KS5oyH5a6aXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZXhwb3J0IGZ1bmN0aW9uIHNob3cobWVzc2FnZTogc3RyaW5nLCBkdXJhdGlvbjogbnVtYmVyID0gVG9hc3QuTEVOR1RIX1NIT1JULCBzdHlsZT86IFN0eWxlQnVpbGRlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBjb25zdCAkbW9iaWxlID0gJC5tb2JpbGU7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBzdHlsZSB8fCBuZXcgU3R5bGVCdWlsZGVyRGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBjb25zdCBzZXRDU1MgPSBpbmZvLmdldFN0eWxlKCkgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyDmlLnooYzjgrPjg7zjg4njga8gPGJyLz4g44Gr572u5o+b44GZ44KLXHJcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IG1lc3NhZ2UucmVwbGFjZSgvXFxuL2csIFwiPGJyLz5cIik7XHJcblxyXG4gICAgICAgICAgICAvLyDjg6Hjg4Pjgrvjg7zjgrggZWxlbWVudCDjga7li5XnmoTnlJ/miJBcclxuICAgICAgICAgICAgY29uc3QgaHRtbCA9IFwiPGRpdj5cIiArIG1zZyArIFwiPC9kaXY+XCI7XHJcbiAgICAgICAgICAgIGNvbnN0IGJveCA9ICQoaHRtbCkuYWRkQ2xhc3MoaW5mby5nZXRDbGFzcygpKTtcclxuICAgICAgICAgICAgaWYgKHNldENTUykge1xyXG4gICAgICAgICAgICAgICAgYm94LmNzcyhpbmZvLmdldFN0eWxlKCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDoh6rli5XmlLnooYzjgZXjgozjgabjgoLjgojjgYTjgojjgYbjgavjgIHln7rngrnjgpLoqK3lrprjgZfjgabjgYvjgonov73liqBcclxuICAgICAgICAgICAgYm94LmNzcyh7XHJcbiAgICAgICAgICAgICAgICBcInRvcFwiOiAwLFxyXG4gICAgICAgICAgICAgICAgXCJsZWZ0XCI6IDAsXHJcbiAgICAgICAgICAgIH0pLmFwcGVuZFRvKCRtb2JpbGUucGFnZUNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAvLyDphY3nva7kvY3nva7jga7msbrlrppcclxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0UG9pbnQgPSBpbmZvLmdldE9mZnNldFBvaW50KCk7XHJcbiAgICAgICAgICAgIGNvbnN0ICR3aW5kb3cgPSAkKHdpbmRvdyk7XHJcbiAgICAgICAgICAgIGxldCBwb3NYLCBwb3NZO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgYm94X3dpZHRoID0gYm94LndpZHRoKCkgKyBwYXJzZUludChib3guY3NzKFwicGFkZGluZy1sZWZ0XCIpLCAxMCkgKyBwYXJzZUludChib3guY3NzKFwicGFkZGluZy1yaWdodFwiKSwgMTApO1xyXG4gICAgICAgICAgICBjb25zdCBib3hfaGVpZ2h0ID0gYm94LmhlaWdodCgpICsgcGFyc2VJbnQoYm94LmNzcyhcInBhZGRpbmctdG9wXCIpLCAxMCkgKyBwYXJzZUludChib3guY3NzKFwicGFkZGluZy1ib3R0b21cIiksIDEwKTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAob2Zmc2V0UG9pbnQgJiAweDAwMEYpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgT2Zmc2V0WC5MRUZUOlxyXG4gICAgICAgICAgICAgICAgICAgIHBvc1ggPSAwICsgaW5mby5nZXRPZmZzZXRYKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE9mZnNldFguUklHSFQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zWCA9ICR3aW5kb3cud2lkdGgoKSAtIGJveF93aWR0aCArIGluZm8uZ2V0T2Zmc2V0WCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBPZmZzZXRYLkNFTlRFUjpcclxuICAgICAgICAgICAgICAgICAgICBwb3NYID0gKCR3aW5kb3cud2lkdGgoKSAvIDIpIC0gKGJveF93aWR0aCAvIDIpICsgaW5mby5nZXRPZmZzZXRYKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihUQUcgKyBcIndhcm4uIHVua25vd24gb2Zmc2V0UG9pbnQ6XCIgKyAob2Zmc2V0UG9pbnQgJiAweDAwMEYpKTtcclxuICAgICAgICAgICAgICAgICAgICBwb3NYID0gKCR3aW5kb3cud2lkdGgoKSAvIDIpIC0gKGJveF93aWR0aCAvIDIpICsgaW5mby5nZXRPZmZzZXRYKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAob2Zmc2V0UG9pbnQgJiAweDAwRjApIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgT2Zmc2V0WS5UT1A6XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zWSA9IDAgKyBpbmZvLmdldE9mZnNldFkoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgT2Zmc2V0WS5CT1RUT006XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zWSA9ICR3aW5kb3cuaGVpZ2h0KCkgLSBib3hfaGVpZ2h0ICsgaW5mby5nZXRPZmZzZXRZKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE9mZnNldFkuQ0VOVEVSOlxyXG4gICAgICAgICAgICAgICAgICAgIHBvc1kgPSAoJHdpbmRvdy5oZWlnaHQoKSAvIDIpIC0gKGJveF9oZWlnaHQgLyAyKSArIGluZm8uZ2V0T2Zmc2V0WSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oVEFHICsgXCJ3YXJuLiB1bmtub3duIG9mZnNldFBvaW50OlwiICsgKG9mZnNldFBvaW50ICYgMHgwMEYwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zWSA9ICgkd2luZG93LmhlaWdodCgpIC8gMikgLSAoYm94X2hlaWdodCAvIDIpICsgaW5mby5nZXRPZmZzZXRZKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOihqOekulxyXG4gICAgICAgICAgICBib3guY3NzKHtcclxuICAgICAgICAgICAgICAgIFwidG9wXCI6IHBvc1ksXHJcbiAgICAgICAgICAgICAgICBcImxlZnRcIjogcG9zWCxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmRlbGF5KGR1cmF0aW9uKVxyXG4gICAgICAgICAgICAuZmFkZU91dCg0MDAsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgQ0RQLlVJIHtcclxuXHJcbiAgICBpbXBvcnQgUHJvbWlzZSAgICAgID0gQ0RQLlByb21pc2U7XHJcbiAgICBpbXBvcnQgRnJhbWV3b3JrICAgID0gQ0RQLkZyYW1ld29yaztcclxuXHJcbiAgICBjb25zdCBUQUcgPSBcIltDRFAuVUkuRGlhbG9nXSBcIjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEgvVyBCYWNrIEtleSBIb29rIOmWouaVsFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgdHlwZSBEaWFsb2dCYWNrS2V5SGFuZGxlciA9IChldmVudD86IEpRdWVyeS5FdmVudCkgPT4gdm9pZDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBpbnRlcmZhY2UgRGlhbG9nT3B0aW9uc1xyXG4gICAgICogICAgICAgICAgICDjg4DjgqTjgqLjg63jgrDjgqrjg5fjgrfjg6fjg7PjgqTjg7Pjgr/jg7zjg5XjgqfjgqTjgrlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBEaWFsb2dPcHRpb25zIGV4dGVuZHMgUG9wdXBPcHRpb25zIHtcclxuICAgICAgICBzcmM/OiBzdHJpbmc7ICAgICAgICAgICAgICAgICAgIC8vITwge1N0cmluZ30gdGVtcGxhdGUg44OV44Kh44Kk44Or44Gu44OR44K5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXHJcbiAgICAgICAgdGl0bGU/OiBzdHJpbmc7ICAgICAgICAgICAgICAgICAvLyE8IHtTdHJpbmd9IOODgOOCpOOCouODreOCsOOCv+OCpOODiOODqyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXHJcbiAgICAgICAgbWVzc2FnZT86IHN0cmluZzsgICAgICAgICAgICAgICAvLyE8IHtTdHJpbmd9IOODoeOCpOODs+ODoeODg+OCu+ODvOOCuCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiB1bmRlZmluZWRcclxuICAgICAgICBpZFBvc2l0aXZlPzogc3RyaW5nOyAgICAgICAgICAgIC8vITwge1N0cmluZ30gUG9zaXRpdmUg44Oc44K/44Oz44GuSUQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogXCJkbGctYnRuLXBvc2l0aXZlXCJcclxuICAgICAgICBpZE5lZ2F0aXZlPzogc3RyaW5nOyAgICAgICAgICAgIC8vITwge1N0cmluZ30gTmFnYXRpdmUg44Oc44K/44Oz44GuSUQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogXCJkbGctYnRuLW5lZ2F0aXZlXCJcclxuICAgICAgICBldmVudD86IHN0cmluZzsgICAgICAgICAgICAgICAgIC8vITwge1N0cmluZ30gRGlhbG9nIOOCr+ODqeOCueOBjOeuoeeQhuOBmeOCi+OCpOODmeODs+ODiCAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBcInZjbGlja1wiXHJcbiAgICAgICAgZGVmYXVsdEF1dG9DbG9zZT86IGJvb2xlYW47ICAgICAvLyE8IHtCb29sZWFufSBkYXRhLWF1dG8tY2xvc2Ug44GM5oyH5a6a44GV44KM44Gm44GE44Gq44GE5aC05ZCI44Gu5pei5a6a5YCkICAgICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgICBmb3JjZU92ZXJ3cml0ZUFmdGVyQ2xvc2U/OiBib29sZWFuOyAvLyE8IHtCb29sZWFufSBhZnRlcmNsb3NlIOOCquODl+OCt+ODp+ODs+OCkuW8t+WItuS4iuabuOOBjeOBmeOCi+OBn+OCgeOBruioreWumiAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICAgIGxhYmVsUG9zaXRpdmU/OiBzdHJpbmc7ICAgICAgICAgLy8hPCB7U3RyaW5nfSBQb3NpdGl2ZSDjg5zjgr/jg7Pjg6njg5njg6sgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IFwiT0tcIlxyXG4gICAgICAgIGxhYmVsTmVnYXRpdmU/OiBzdHJpbmc7ICAgICAgICAgLy8hPCB7U3RyaW5nfSBOZWdhdGl2ZSDjg5zjgr/jg7Pjg6njg5njg6sgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IFwiQ2FuY2VsXCJcclxuICAgICAgICBiYWNrS2V5PzogXCJjbG9zZVwiIHwgXCJkZW55XCIgfCBEaWFsb2dCYWNrS2V5SGFuZGxlcjsgIC8vITwgSC9XIGJhY2tLZXkg44Gu5oyv44KL6Iie44GEICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBcImNsb3NlXCJcclxuICAgICAgICBzY3JvbGxFdmVudD86IFwiZGVueVwiIHwgXCJhbGxvd1wiIHwgXCJhZGp1c3RcIjsgICAvLyE8IHtTdHJpbmd9IHNjcm9sbOOBruaKkeatouaWueW8jyAgKOKAuyBhZGp1c3Qg44Gv6Kmm6aiT55qEKSAgICAgZGVmYXVsdDogXCJkZW55XCJcclxuICAgICAgICBkb21FeHRlbnNpb25PcHRpb25zPzogRG9tRXh0ZW5zaW9uT3B0aW9uczsgICAvLyE8IERPTeaLoeW8teOCquODl+OCt+ODp+ODsy4gbnVsbHx1bmRlZmluZWQg44Gn5ouh5by144GX44Gq44GEICAgICAgZGVmYXVsdDoge31cclxuICAgICAgICBbeDogc3RyaW5nXTogYW55OyAgICAgICAgICAgICAgIC8vITwgYW55IGRpYWxvZyB0ZW1wbGF0ZSBwYXJhbWV0ZXJzLlxyXG4gICAgfVxyXG5cclxuICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2xhc3MgRGlhbG9nXHJcbiAgICAgKiBAYnJpZWYg5rGO55So44OA44Kk44Ki44Ot44Kw44Kv44Op44K5XHJcbiAgICAgKiAgICAgICAgalFNIOOBriBwb3B1cCB3aWRnZXQg44Gr44KI44Gj44Gm5a6f6KOFXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBEaWFsb2cge1xyXG5cclxuICAgICAgICBwcml2YXRlIF90ZW1wbGF0ZTogVG9vbHMuSlNUID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIF9zZXR0aW5nczogRGlhbG9nT3B0aW9ucyA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBfJGRpYWxvZzogSlF1ZXJ5ID0gbnVsbDtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc19hY3RpdmVEaWFsb2c6IERpYWxvZyA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc19vbGRCYWNrS2V5SGFuZGxlcjogKGV2ZW50PzogSlF1ZXJ5LkV2ZW50KSA9PiB2b2lkID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzX2RlZmF1bHRPcHRpb25zOiBEaWFsb2dPcHRpb25zID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29uc3RydWN0b3JcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBpZCAgICAgIHtTdHJpbmd9ICAgICAgICBbaW5dIOODgOOCpOOCouODreOCsCBET00gSUQg44KS5oyH5a6aIGV4KSAjZGlhbG9nLWhvZ2VcclxuICAgICAgICAgKiBAcGFyYW0gb3B0aW9ucyB7RGlhbG9nT3B0aW9uc30gW2luXSDjgqrjg5fjgrfjg6fjg7NcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBvcHRpb25zPzogRGlhbG9nT3B0aW9ucykge1xyXG4gICAgICAgICAgICAvLyBEaWFsb2cg5YWx6YCa6Kit5a6a44Gu5Yid5pyf5YyWXHJcbiAgICAgICAgICAgIERpYWxvZy5pbml0Q29tbW9uQ29uZGl0aW9uKCk7XHJcbiAgICAgICAgICAgIC8vIOioreWumuOCkuabtOaWsFxyXG4gICAgICAgICAgICB0aGlzLl9zZXR0aW5ncyA9ICQuZXh0ZW5kKHt9LCBEaWFsb2cuc19kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIC8vIOODgOOCpOOCouODreOCsOODhuODs+ODl+ODrOODvOODiOOCkuS9nOaIkFxyXG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZSA9IFRvb2xzLlRlbXBsYXRlLmdldEpTVChpZCwgdGhpcy5fc2V0dGluZ3Muc3JjKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gcHVibGljIG1ldGhvZHNcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6KGo56S6XHJcbiAgICAgICAgICog6KGo56S644KS44GX44Gm5aeL44KB44GmIERPTSDjgYzmnInlirnjgavjgarjgovjgIJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBvcHRpb25zIHtEaWFsb2dPcHRpb25zfSBbaW5dIOOCquODl+OCt+ODp+ODsyAoc3JjIOOBr+eEoeimluOBleOCjOOCiylcclxuICAgICAgICAgKiBAcmV0dXJuIOODgOOCpOOCouODreOCsOOBriBqUXVlcnkg44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNob3cob3B0aW9ucz86IERpYWxvZ09wdGlvbnMpOiBKUXVlcnkge1xyXG4gICAgICAgICAgICBjb25zdCAkZG9jdW1lbnQgPSAkKGRvY3VtZW50KTtcclxuICAgICAgICAgICAgY29uc3QgJGJvZHkgPSAkKFwiYm9keVwiKTtcclxuICAgICAgICAgICAgY29uc3QgJHBhZ2UgPSAoPGFueT4kYm9keSkucGFnZWNvbnRhaW5lcihcImdldEFjdGl2ZVBhZ2VcIik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBvZmNIaWRkZW4gPSB7XHJcbiAgICAgICAgICAgICAgICBcIm92ZXJmbG93XCI6ICAgICBcImhpZGRlblwiLFxyXG4gICAgICAgICAgICAgICAgXCJvdmVyZmxvdy14XCI6ICAgXCJoaWRkZW5cIixcclxuICAgICAgICAgICAgICAgIFwib3ZlcmZsb3cteVwiOiAgIFwiaGlkZGVuXCIsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9mY0JvZHkgPSB7IC8vIGJvZHkgb3ZlcmZsb3cgY29udGV4dFxyXG4gICAgICAgICAgICAgICAgXCJvdmVyZmxvd1wiOiAgICAgJGJvZHkuY3NzKFwib3ZlcmZsb3dcIiksXHJcbiAgICAgICAgICAgICAgICBcIm92ZXJmbG93LXhcIjogICAkYm9keS5jc3MoXCJvdmVyZmxvdy14XCIpLFxyXG4gICAgICAgICAgICAgICAgXCJvdmVyZmxvdy15XCI6ICAgJGJvZHkuY3NzKFwib3ZlcmZsb3cteVwiKSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50U2Nyb2xsUG9zID0gJGJvZHkuc2Nyb2xsVG9wKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG9mY1BhZ2UgPSB7IC8vIHBhZ2Ugb3ZlcmZsb3cgY29udGV4dFxyXG4gICAgICAgICAgICAgICAgXCJvdmVyZmxvd1wiOiAgICAgJHBhZ2UuY3NzKFwib3ZlcmZsb3dcIiksXHJcbiAgICAgICAgICAgICAgICBcIm92ZXJmbG93LXhcIjogICAkcGFnZS5jc3MoXCJvdmVyZmxvdy14XCIpLFxyXG4gICAgICAgICAgICAgICAgXCJvdmVyZmxvdy15XCI6ICAgJHBhZ2UuY3NzKFwib3ZlcmZsb3cteVwiKSxcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbEV2ZW50ID0gXCJzY3JvbGwgdG91Y2htb3ZlIG1vdXNlbW92ZSBNU1BvaW50ZXJNb3ZlXCI7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzY3JvbGxIYW5kZXIgPSAoZXZlbnQ6IEpRdWVyeS5FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKFwiZGVueVwiID09PSB0aGlzLl9zZXR0aW5ncy5zY3JvbGxFdmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFwiYWRqdXN0XCIgPT09IHRoaXMuX3NldHRpbmdzLnNjcm9sbEV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGJvZHkuc2Nyb2xsVG9wKHBhcmVudFNjcm9sbFBvcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBvcHRpb24g44GM5oyH5a6a44GV44KM44Gm44GE44Gf5aC05ZCI5pu05pawXHJcbiAgICAgICAgICAgIGlmIChudWxsICE9IG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldHRpbmdzID0gJC5leHRlbmQoe30sIHRoaXMuX3NldHRpbmdzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gYWZ0ZXJjbG9zZSDlh6bnkIbjga8gRGlhbG9nIOOBruegtOajhOWHpueQhuOCkuWun+ijheOBmeOCi+OBn+OCgeWfuuacrOeahOOBq+ioreWumuemgeatoiAo5by35Yi25LiK5pu444GN44Oi44O844OJ44KS6Kit5a6a5L2/55So5Y+vKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fc2V0dGluZ3MuYWZ0ZXJjbG9zZSAmJiAhdGhpcy5fc2V0dGluZ3MuZm9yY2VPdmVyd3JpdGVBZnRlckNsb3NlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oVEFHICsgXCJjYW5ub3QgYWNjZXB0ICdhZnRlcmNsb3NlJyBvcHRpb24uIHBsZWFzZSBpbnN0ZWFkIHVzaW5nICdwb3B1cGFmdGVyY2xvc2UnIGV2ZW50LlwiKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9zZXR0aW5ncy5hZnRlcmNsb3NlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyB0aXRsZSDjga7mnInnhKFcclxuICAgICAgICAgICAgKDxhbnk+dGhpcy5fc2V0dGluZ3MpLl90aXRsZVN0YXRlID0gdGhpcy5fc2V0dGluZ3MudGl0bGUgPyBcInVpLWhhcy10aXRsZVwiIDogXCJ1aS1uby10aXRsZVwiO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogdGVtcGxhdGUg44GL44KJIGpRdWVyeSDjgqrjg5bjgrjjgqfjgq/jg4jjgpLkvZzmiJDjgZfjgIFcclxuICAgICAgICAgICAgICogPGJvZHk+IOebtOS4i+OBq+i/veWKoC5cclxuICAgICAgICAgICAgICogJHBhZ2Ug44Gn44GvIEJhY2tib25lIGV2ZW50IOOCkuWPl+OBkeOCieOCjOOBquOBhOOBk+OBqOOBq+azqOaEj1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgdGhpcy5fJGRpYWxvZyA9ICQodGhpcy5fdGVtcGxhdGUodGhpcy5fc2V0dGluZ3MpKTtcclxuICAgICAgICAgICAgdGhpcy5fJGRpYWxvZy5sb2NhbGl6ZSgpO1xyXG4gICAgICAgICAgICAkYm9keS5hcHBlbmQodGhpcy5fJGRpYWxvZyk7XHJcblxyXG4gICAgICAgICAgICAvLyB0aGVtZSDjgpLop6PmsbpcclxuICAgICAgICAgICAgdGhpcy5yZXNvbHZlVGhlbWUoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuXyRkaWFsb2dcclxuICAgICAgICAgICAgICAgIC5vbihcInBvcHVwY3JlYXRlXCIsIChldmVudDogSlF1ZXJ5LkV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g44K544Kv44Ot44O844Or44KS5oqR5q2iXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFwiYWxsb3dcIiAhPT0gdGhpcy5fc2V0dGluZ3Muc2Nyb2xsRXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvY3VtZW50Lm9uKHNjcm9sbEV2ZW50LCBzY3JvbGxIYW5kZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAkYm9keS5jc3Mob2ZjSGlkZGVuKTtcclxuICAgICAgICAgICAgICAgICAgICAkcGFnZS5jc3Mob2ZjSGlkZGVuKTtcclxuICAgICAgICAgICAgICAgICAgICBEaWFsb2cucmVnaXN0ZXIodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmVuaGFuY2VXaXRoaW4oKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERPTSDmi6HlvLVcclxuICAgICAgICAgICAgaWYgKG51bGwgIT0gdGhpcy5fc2V0dGluZ3MuZG9tRXh0ZW5zaW9uT3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgRXh0ZW5zaW9uTWFuYWdlci5hcHBseURvbUV4dGVuc2lvbih0aGlzLl8kZGlhbG9nLCB0aGlzLl9zZXR0aW5ncy5kb21FeHRlbnNpb25PcHRpb25zKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZVNob3coKVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOihqOekulxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuXyRkaWFsb2dcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnBvcHVwKCQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblRvOiBcIndpbmRvd1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWZ0ZXJjbG9zZTogKGV2ZW50OiBKUXVlcnkuRXZlbnQsIHVpOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6vnirbmhYvjgpLmiLvjgZlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcGFnZS5jc3Mob2ZjUGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGJvZHkuY3NzKG9mY0JvZHkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcImFsbG93XCIgIT09IHRoaXMuX3NldHRpbmdzLnNjcm9sbEV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb2N1bWVudC5vZmYoc2Nyb2xsRXZlbnQsIHNjcm9sbEhhbmRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIERpYWxvZy5yZWdpc3RlcihudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl8kZGlhbG9nLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuXyRkaWFsb2cgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5fc2V0dGluZ3MpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAucG9wdXAoXCJvcGVuXCIpLm9uKHRoaXMuX3NldHRpbmdzLmV2ZW50LCAoZXZlbnQ6IEpRdWVyeS5FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXCJkYXRhLWF1dG8tY2xvc2U9J2ZhbHNlJ1wiIOOBjOaMh+WumuOBleOCjOOBpuOBhOOCi+imgee0oOOBryBkaWFsb2cg44KS6ZaJ44GY44Gq44GEXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXV0b0Nsb3NlID0gJChldmVudC50YXJnZXQpLmF0dHIoXCJkYXRhLWF1dG8tY2xvc2VcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSBhdXRvQ2xvc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ2xvc2UgPSB0aGlzLl9zZXR0aW5ncy5kZWZhdWx0QXV0b0Nsb3NlID8gXCJ0cnVlXCIgOiBcImZhbHNlXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXCJmYWxzZVwiID09PSBhdXRvQ2xvc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmZhaWwoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihUQUcgKyBcIkRpYWxvZy5zaG93KCkgZmFpbGVkLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fJGRpYWxvZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl8kZGlhbG9nLnRyaWdnZXIoXCJlcnJvclwiLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fJGRpYWxvZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOe1guS6hlxyXG4gICAgICAgICAqIOWfuuacrOeahOOBq+OBr+iHquWLleOBp+mWieOBmOOCi+OBjOOAgVxyXG4gICAgICAgICAqIOihqOekuuS4reOBruODgOOCpOOCouODreOCsOOCkuOCr+ODqeOCpOOCouODs+ODiOWBtOOBi+OCiemWieOBmOOCi+ODoeOCveODg+ODiVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBjbG9zZSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuXyRkaWFsb2cpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuXyRkaWFsb2cucG9wdXAoXCJjbG9zZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOODgOOCpOOCouODreOCsCBlbGVtZW50IOOCkuWPluW+l1xyXG4gICAgICAgIHB1YmxpYyBnZXQgJGVsKCk6IEpRdWVyeSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl8kZGlhbG9nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBwcm90ZWN0ZWQgbWV0aG9kczogT3ZlcnJpZGVcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog44OA44Kk44Ki44Ot44Kw6KGo56S644Gu55u05YmNXHJcbiAgICAgICAgICogRE9NIOOCkuaTjeS9nOOBp+OBjeOCi+OCv+OCpOODn+ODs+OCsOOBp+WRvOOBs+WHuuOBleOCjOOCiy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm4ge0lQcm9taXNlQmFzZX0gcHJvbWlzZSDjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgb25CZWZvcmVTaG93KCk6IElQcm9taXNlQmFzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmU8dm9pZD4oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOODgOOCpOOCouODreOCsOOBruS9v+eUqOOBmeOCiyBUaGVtZSDjgpLop6PmsbpcclxuICAgICAgICAgKiDkuI3opoHjgarloLTlkIjjga/jgqrjg7zjg5Djg7zjg6njgqTjg4njgZnjgovjgZPjgajjgoLlj6/og71cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgcmVzb2x2ZVRoZW1lKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBjb25zdCBxdWVyeVRoZW1lID0gKCk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJChcIi51aS1wYWdlLWFjdGl2ZVwiKS5qcW1EYXRhKFwidGhlbWVcIik7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgY2FuZGlkYXRlVGhlbWU6IHN0cmluZztcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fc2V0dGluZ3MudGhlbWUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRvbVRoZW1lID0gdGhpcy5fJGRpYWxvZy5qcW1EYXRhKFwidGhlbWVcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRvbVRoZW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0dGluZ3MudGhlbWUgPSBjYW5kaWRhdGVUaGVtZSA9IHF1ZXJ5VGhlbWUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9zZXR0aW5ncy5vdmVybGF5VGhlbWUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRvbU92ZXJsYXlUaGVtZSA9IHRoaXMuXyRkaWFsb2cuanFtRGF0YShcIm92ZXJsYXktdGhlbWVcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRvbU92ZXJsYXlUaGVtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldHRpbmdzLm92ZXJsYXlUaGVtZSA9IGNhbmRpZGF0ZVRoZW1lIHx8IHF1ZXJ5VGhlbWUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gdHJhbnNpdGlvbiDjga7mm7TmlrBcclxuICAgICAgICAgICAgdGhpcy5fc2V0dGluZ3MudHJhbnNpdGlvbiA9IFRoZW1lLnF1ZXJ5RGlhbG9nVHJhbnNpdGlvbih0aGlzLl9zZXR0aW5ncy50cmFuc2l0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gcHVibGljIHN0YXRpYyBtZXRob2RzXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERpYWxvZyDjga7ml6Llrprjgqrjg5fjgrfjg6fjg7PjgpLmm7TmlrBcclxuICAgICAgICAgKiDjgZnjgbnjgabjga4gRGlhbG9nIOOBjOS9v+eUqOOBmeOCi+WFsemAmuioreWumlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIG9wdGlvbnMge0RpYWxvZ09wdGlvbnN9IFtpbl0g44OA44Kk44Ki44Ot44Kw44Kq44OX44K344On44OzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXREZWZhdWx0T3B0aW9ucyhvcHRpb25zOiBEaWFsb2dPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIERpYWxvZyDlhbHpgJroqK3lrprjga7liJ3mnJ/ljJZcclxuICAgICAgICAgICAgRGlhbG9nLmluaXRDb21tb25Db25kaXRpb24oKTtcclxuICAgICAgICAgICAgJC5leHRlbmQodHJ1ZSwgRGlhbG9nLnNfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBwcml2YXRlIG1ldGhvZHNcclxuXHJcbiAgICAgICAgLy8g54++5ZyoIGFjdGl2ZSDjgarjg4DjgqTjgqLjg63jgrDjgajjgZfjgabnmbvpjLLjgZnjgotcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZWdpc3RlcihkaWFsb2c6IERpYWxvZyk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAobnVsbCAhPSBkaWFsb2cgJiYgbnVsbCAhPSBEaWFsb2cuc19hY3RpdmVEaWFsb2cpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihUQUcgKyBcIm5ldyBkaWFsb2cgcHJvYyBpcyBjYWxsZWQgaW4gdGhlIHBhc3QgZGlhbG9nJ3Mgb25lLiB1c2Ugc2V0VGltZW91dCgpIGZvciBwb3N0IHByb2Nlc3MuXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIERpYWxvZy5zX2FjdGl2ZURpYWxvZyA9IGRpYWxvZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERpYWxvZyDlhbHpgJroqK3lrprjga7liJ3mnJ/ljJZcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbml0Q29tbW9uQ29uZGl0aW9uKCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBGcmFtZXdvcmsg44Gu5Yid5pyf5YyW5b6M44Gr5Yem55CG44GZ44KL5b+F6KaB44GM44GC44KLXHJcbiAgICAgICAgICAgIGlmICghRnJhbWV3b3JrLmlzSW5pdGlhbGl6ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFRBRyArIFwiaW5pdENvbW1vbkNvbmRpdGlvbigpIHNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgRnJhbWV3b3JrLmluaXRpYWxpemVkLlwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG51bGwgPT0gRGlhbG9nLnNfb2xkQmFja0tleUhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIC8vIEJhY2sgQnV0dG9uIEhhbmRsZXJcclxuICAgICAgICAgICAgICAgIERpYWxvZy5zX29sZEJhY2tLZXlIYW5kbGVyID0gQ0RQLnNldEJhY2tCdXR0b25IYW5kbGVyKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgQ0RQLnNldEJhY2tCdXR0b25IYW5kbGVyKERpYWxvZy5jdXN0b21CYWNrS2V5SGFuZGxlcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8g5pei5a6a44Kq44OX44K344On44OzXHJcbiAgICAgICAgICAgICAgICBEaWFsb2cuc19kZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZFBvc2l0aXZlOiAgICAgICAgICAgICBcImRsZy1idG4tcG9zaXRpdmVcIixcclxuICAgICAgICAgICAgICAgICAgICBpZE5lZ2F0aXZlOiAgICAgICAgICAgICBcImRsZy1idG4tbmVnYXRpdmVcIixcclxuICAgICAgICAgICAgICAgICAgICBldmVudDogICAgICAgICAgICAgICAgICBGcmFtZXdvcmsuZ2V0RGVmYXVsdENsaWNrRXZlbnQoKSxcclxuICAgICAgICAgICAgICAgICAgICBkaXNtaXNzaWJsZTogICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0QXV0b0Nsb3NlOiAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAgICAgICAgICAgICBcInBsYXRmb3JtLWRlZmF1bHRcIixcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aXZlOiAgICAgICAgICBcIk9LXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxOZWdhdGl2ZTogICAgICAgICAgXCJDYW5jZWxcIixcclxuICAgICAgICAgICAgICAgICAgICBiYWNrS2V5OiAgICAgICAgICAgICAgICBcImNsb3NlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRXZlbnQ6ICAgICAgICAgICAgXCJkZW55XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZG9tRXh0ZW5zaW9uT3B0aW9uczogICAge30sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBIL1cgQmFjayBCdXR0b24gSGFuZGxlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGN1c3RvbUJhY2tLZXlIYW5kbGVyKGV2ZW50PzogSlF1ZXJ5LkV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChudWxsICE9IERpYWxvZy5zX2FjdGl2ZURpYWxvZykge1xyXG4gICAgICAgICAgICAgICAgaWYgKFwiY2xvc2VcIiA9PT0gRGlhbG9nLnNfYWN0aXZlRGlhbG9nLl9zZXR0aW5ncy5iYWNrS2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGlhbG9nLnNfYWN0aXZlRGlhbG9nLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFwiZnVuY3Rpb25cIiA9PT0gdHlwZW9mIERpYWxvZy5zX2FjdGl2ZURpYWxvZy5fc2V0dGluZ3MuYmFja0tleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICg8RGlhbG9nQmFja0tleUhhbmRsZXI+RGlhbG9nLnNfYWN0aXZlRGlhbG9nLl9zZXR0aW5ncy5iYWNrS2V5KShldmVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIERpYWxvZyDjgYwgYWN0aXZlIOOBquWgtOWQiOOAgeW4uOOBq+aXouWumuOBruODj+ODs+ODieODqeOBq+OBr+a4oeOBleOBquOBhFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIERpYWxvZy5zX29sZEJhY2tLZXlIYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLyogdHNsaW50OmRpc2FibGU6bWF4LWxpbmUtbGVuZ3RoICovXHJcblxyXG5uYW1lc3BhY2UgQ0RQLlVJIHtcclxuXHJcbiAgICBjb25zdCBUQUcgPSBcIltDRFAuVUkuRGlhbG9nQ29tbW9uc10gXCI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGVydFxyXG4gICAgICogYWxlcnQg44Oh44OD44K744O844K46KGo56S6XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgICBbaW5dIOihqOekuuaWh+Wtl+WIl1xyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zXSBbaW5dIOODgOOCpOOCouODreOCsOOCquODl+OCt+ODp+ODs1xyXG4gICAgICogQHJldHVybiB7alF1ZXJ5fSDjg4DjgqTjgqLjg63jgrDjga4gRE9NIOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gYWxlcnQobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogRGlhbG9nT3B0aW9ucyk6IEpRdWVyeSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgICAgIDxzY3JpcHQgdHlwZT1cInRleHQvdGVtcGxhdGVcIj5cclxuICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwidWktbW9kYWxcIiBkYXRhLXJvbGU9XCJwb3B1cFwiIGRhdGEtY29ybmVycz1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWNvbnRlbnRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGgxIGNsYXNzPVwidWktdGl0bGUge3tfdGl0bGVTdGF0ZX19XCI+e3t0aXRsZX19PC9oMT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ1aS1tZXNzYWdlXCI+e3ttZXNzYWdlfX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLW1vZGFsLWZvb3RlciB1aS1ncmlkLXNvbG9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInt7aWRQb3NpdGl2ZX19XCIgY2xhc3M9XCJ1aS1idG4gdWktYmxvY2stYSB1aS10ZXh0LWVtcGhhc2lzXCIgZGF0YS1hdXRvLWNsb3NlPVwidHJ1ZVwiPnt7bGFiZWxQb3NpdGl2ZX19PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L3NlY3Rpb24+XHJcbiAgICAgICAgICAgIDwvc2NyaXB0PlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIGNvbnN0IGRsZ0FsZXJ0ID0gbmV3IERpYWxvZyh0ZW1wbGF0ZSwgJC5leHRlbmQoe30sIHtcclxuICAgICAgICAgICAgc3JjOiBudWxsLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxyXG4gICAgICAgIH0sIG9wdGlvbnMpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRsZ0FsZXJ0LnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbmZpcm1cclxuICAgICAqIOeiuuiqjeODoeODg+OCu+ODvOOCuOihqOekulxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlICAgW2luXSDooajnpLrmloflrZfliJdcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9uc10gW2luXSDjg4DjgqTjgqLjg63jgrDjgqrjg5fjgrfjg6fjg7NcclxuICAgICAqIEByZXR1cm4ge2pRdWVyeX0g44OA44Kk44Ki44Ot44Kw44GuIERPTSDjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNvbmZpcm0obWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogRGlhbG9nT3B0aW9ucyk6IEpRdWVyeSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgICAgIDxzY3JpcHQgdHlwZT1cInRleHQvdGVtcGxhdGVcIj5cclxuICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwidWktbW9kYWxcIiBkYXRhLXJvbGU9XCJwb3B1cFwiIGRhdGEtY29ybmVycz1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWNvbnRlbnRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGgxIGNsYXNzPVwidWktdGl0bGUge3tfdGl0bGVTdGF0ZX19XCI+e3t0aXRsZX19PC9oMT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ1aS1tZXNzYWdlXCI+e3ttZXNzYWdlfX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLW1vZGFsLWZvb3RlciB1aS1ncmlkLWFcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInt7aWROZWdhdGl2ZX19XCIgY2xhc3M9XCJ1aS1idG4gdWktYmxvY2stYVwiIGRhdGEtYXV0by1jbG9zZT1cInRydWVcIj57e2xhYmVsTmVnYXRpdmV9fTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwie3tpZFBvc2l0aXZlfX1cIiBjbGFzcz1cInVpLWJ0biB1aS1ibG9jay1iIHVpLXRleHQtZW1waGFzaXNcIiBkYXRhLWF1dG8tY2xvc2U9XCJ0cnVlXCI+e3tsYWJlbFBvc2l0aXZlfX08L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgICAgICAgPC9zY3JpcHQ+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgY29uc3QgZGxnQ29uZmlybSA9IG5ldyBEaWFsb2codGVtcGxhdGUsICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgICAgICAgIHNyYzogbnVsbCxcclxuICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcclxuICAgICAgICB9LCBvcHRpb25zKSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkbGdDb25maXJtLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBpbnRlcmZhY2UgRGlhbG9nQ29tbW9uc09wdGlvbnNcclxuICAgICAqIEBicmllZiBwcm9tcHQg44Gu44Kq44OX44K344On44OzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nUHJvbXB0T3B0aW9ucyBleHRlbmRzIERpYWxvZ09wdGlvbnMge1xyXG4gICAgICAgIGV2ZW50T0s/OiBzdHJpbmc7IC8vITwgT0sg44Oc44K/44Oz5oq85LiL5pmC44GuIGV2ZW50OiBkZWZhdWx0OiBwcm9tcHRva1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGNsYXNzIERpYWxvZ1Byb21wdFxyXG4gICAgICogQGJyaWVmIHByb21wdCDjg4DjgqTjgqLjg63jgrAgKOmdnuWFrOmWiylcclxuICAgICAqL1xyXG4gICAgY2xhc3MgRGlhbG9nUHJvbXB0IGV4dGVuZHMgRGlhbG9nIHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBfZXZlbnRPSzogc3RyaW5nO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgb3B0aW9ucz86IERpYWxvZ1Byb21wdE9wdGlvbnMpIHtcclxuICAgICAgICAgICAgc3VwZXIoaWQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB0aGlzLl9ldmVudE9LID0gb3B0aW9ucy5ldmVudE9LIHx8IFwicHJvbXB0b2tcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDjg4DjgqTjgqLjg63jgrDooajnpLrjga7nm7TliY1cclxuICAgICAgICBwcm90ZWN0ZWQgb25CZWZvcmVTaG93KCk6IElQcm9taXNlQmFzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9uQ29tbWl0ID0gKGV2ZW50OiBKUXVlcnkuRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLiRlbC5maW5kKFwiI191aS1wcm9tcHRcIikudmFsKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKHRoaXMuX2V2ZW50T0ssIHRleHQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGVsXHJcbiAgICAgICAgICAgICAgICAub24oXCJ2Y2xpY2tcIiwgXCIuY29tbWFuZC1wcm9tcHQtb2sgXCIsIChldmVudDogSlF1ZXJ5LkV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25Db21taXQoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5vbihcImtleWRvd25cIiwgXCIjX3VpLXByb21wdFwiLCAoZXZlbnQ6IEpRdWVyeS5FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IEVOVEVSX0tFWV9DT0RFID0gMTM7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEVOVEVSX0tFWV9DT0RFID09PSBldmVudC5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ29tbWl0KGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5vbkJlZm9yZVNob3coKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcm9tcHRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSAgIFtpbl0g6KGo56S65paH5a2X5YiXXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnNdIFtpbl0g44OA44Kk44Ki44Ot44Kw44Kq44OX44K344On44OzXHJcbiAgICAgKiBAcmV0dXJuIHtqUXVlcnl9IOODgOOCpOOCouODreOCsOOBriBET00g44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBwcm9tcHQobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogRGlhbG9nUHJvbXB0T3B0aW9ucyk6IEpRdWVyeSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgICAgIDxzY3JpcHQgdHlwZT1cInRleHQvdGVtcGxhdGVcIj5cclxuICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwidWktbW9kYWxcIiBkYXRhLXJvbGU9XCJwb3B1cFwiIGRhdGEtY29ybmVycz1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWNvbnRlbnRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGgxIGNsYXNzPVwidWktdGl0bGUge3tfdGl0bGVTdGF0ZX19XCI+e3t0aXRsZX19PC9oMT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ1aS1tZXNzYWdlXCI+e3ttZXNzYWdlfX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJfdWktcHJvbXB0XCIgY2xhc3M9XCJ1aS1oaWRkZW4tYWNjZXNzaWJsZVwiPjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJfdWktcHJvbXB0XCIgaWQ9XCJfdWktcHJvbXB0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLW1vZGFsLWZvb3RlciB1aS1ncmlkLWFcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInt7aWROZWdhdGl2ZX19XCIgY2xhc3M9XCJ1aS1idG4gdWktYmxvY2stYVwiIGRhdGEtYXV0by1jbG9zZT1cInRydWVcIj57e2xhYmVsTmVnYXRpdmV9fTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwie3tpZFBvc2l0aXZlfX1cIiBjbGFzcz1cImNvbW1hbmQtcHJvbXB0LW9rIHVpLWJ0biB1aS1ibG9jay1iIHVpLXRleHQtZW1waGFzaXNcIiBkYXRhLWF1dG8tY2xvc2U9XCJmYWxzZVwiPnt7bGFiZWxQb3NpdGl2ZX19PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L3NlY3Rpb24+XHJcbiAgICAgICAgICAgIDwvc2NyaXB0PlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIGNvbnN0IGRsZ1Byb21wdCA9IG5ldyBEaWFsb2dQcm9tcHQodGVtcGxhdGUsICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgICAgICAgIHNyYzogbnVsbCxcclxuICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcclxuICAgICAgICB9LCBvcHRpb25zKSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkbGdQcm9tcHQuc2hvdygpO1xyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBDRFAuVUkge1xyXG5cclxuICAgIGltcG9ydCBSb3V0ZXIgICAgICAgPSBDRFAuRnJhbWV3b3JrLlJvdXRlcjtcclxuICAgIGltcG9ydCBJUGFnZSAgICAgICAgPSBDRFAuRnJhbWV3b3JrLklQYWdlO1xyXG4gICAgaW1wb3J0IE1vZGVsICAgICAgICA9IENEUC5GcmFtZXdvcmsuTW9kZWw7XHJcbiAgICBpbXBvcnQgVmlldyAgICAgICAgID0gQ0RQLkZyYW1ld29yay5WaWV3O1xyXG4gICAgaW1wb3J0IFZpZXdPcHRpb25zICA9IENEUC5GcmFtZXdvcmsuVmlld09wdGlvbnM7XHJcbiAgICBpbXBvcnQgVGVtcGxhdGUgICAgID0gQ0RQLlRvb2xzLlRlbXBsYXRlO1xyXG4gICAgaW1wb3J0IEpTVCAgICAgICAgICA9IENEUC5Ub29scy5KU1Q7XHJcblxyXG4gICAgY29uc3QgVEFHOiBzdHJpbmcgPSBcIltDRFAuVUkuQmFzZUhlYWRlclZpZXddIFwiO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGludGVyZmFjZSBCYXNlSGVhZGVyVmlld09wdGlvbnNcclxuICAgICAqIEBicmllZiBCYXNlSGVhZGVyVmlldyDjgavmjIflrprjgZnjgovjgqrjg5fjgrfjg6fjg7PjgqTjg7Pjgr/jg7zjg5XjgqfjgqTjgrlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBCYXNlSGVhZGVyVmlld09wdGlvbnM8VE1vZGVsIGV4dGVuZHMgTW9kZWwgPSBNb2RlbD4gZXh0ZW5kcyBWaWV3T3B0aW9uczxUTW9kZWw+IHtcclxuICAgICAgICBiYXNlVGVtcGxhdGU/OiBKU1Q7ICAgICAgICAgICAgIC8vITwg5Zu65a6a44OY44OD44OA55SoIEphdmFTY3JpcHQg44OG44Oz44OX44Os44O844OILlxyXG4gICAgICAgIGJhY2tDb21tYW5kU2VsZWN0b3I/OiBzdHJpbmc7ICAgLy8hPCBcIuaIu+OCi1wi44Kz44Oe44Oz44OJ44K744Os44Kv44K/LiBkZWZhdWx0OiBcImNvbW1hbmQtYmFja1wiXHJcbiAgICAgICAgYmFja0NvbW1hbmRLaW5kPzogc3RyaW5nOyAgICAgICAvLyE8IFwi5oi744KLXCLjgrPjg57jg7Pjg4nnqK7liKUgKG9uQ29tbWFuZCDnrKwy5byV5pWwKS4gZGVmYXVsdDogXCJwYWdlYmFja1wiXHJcbiAgICB9XHJcblxyXG4gICAgLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBjbGFzcyBCYXNlSGVhZGVyVmlld1xyXG4gICAgICogQGJyaWVmIOWFsemAmuODmOODg+ODgOOCkuaTjeS9nOOBmeOCi+OCr+ODqeOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQmFzZUhlYWRlclZpZXc8VE1vZGVsIGV4dGVuZHMgTW9kZWwgPSBNb2RlbD4gZXh0ZW5kcyBWaWV3PFRNb2RlbD4ge1xyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzXyRoZWFkZXJCYXNlOiBKUXVlcnk7ICAgLy8hPCDjg5rjg7zjgrjlpJbjgavphY3nva7jgZXjgozjgovlhbHpgJrjg5jjg4Pjg4Djga7jg5njg7zjgrnpg6jlk4HnlKggalF1ZXJ5IOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHNfcmVmQ291bnQgPSAwOyAgICAgICAgICAvLyE8IOWPgueFp+OCq+OCpuODs+ODiFxyXG4gICAgICAgIHByaXZhdGUgX3RlbXBsYXRlOiBKU1Q7XHJcbiAgICAgICAgcHJpdmF0ZSBfaGFzQmFja0luZGljYXRvcjogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29uc3RydWN0b3JcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7SVBhZ2V9IF9vd25lciBbaW5dIOOCquODvOODiuODvOODmuODvOOCuOOCpOODs+OCueOCv+ODs+OCuVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX293bmVyOiBJUGFnZSwgcHJpdmF0ZSBfb3B0aW9ucz86IEJhc2VIZWFkZXJWaWV3T3B0aW9uczxUTW9kZWw+KSB7XHJcbiAgICAgICAgICAgIHN1cGVyKF9vcHRpb25zID0gJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgZWw6IF9vd25lci4kcGFnZS5maW5kKFwiW2RhdGEtcm9sZT0naGVhZGVyJ11cIiksXHJcbiAgICAgICAgICAgICAgICBiYWNrQ29tbWFuZFNlbGVjdG9yOiBcIi5jb21tYW5kLWJhY2tcIixcclxuICAgICAgICAgICAgICAgIGJhY2tDb21tYW5kS2luZDogXCJwYWdlYmFja1wiLFxyXG4gICAgICAgICAgICB9LCBfb3B0aW9ucykpO1xyXG5cclxuICAgICAgICAgICAgLy8gdGVtcGxhdGUg6Kit5a6aXHJcbiAgICAgICAgICAgIGlmIChfb3B0aW9ucy5iYXNlVGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlID0gX29wdGlvbnMuYmFzZVRlbXBsYXRlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUgPSBUZW1wbGF0ZS5nZXRKU1QoYFxyXG4gICAgICAgICAgICAgICAgICAgIDxzY3JpcHQgdHlwZT0ndGV4dC90ZW1wbGF0ZSc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9J3VpLWhlYWRlci1iYXNlIHVpLWJvZHkte3t0aGVtZX19Jz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9J3VpLWZpeGVkLWJhY2staW5kaWNhdG9yJz48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9oZWFkZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zY3JpcHQ+XHJcbiAgICAgICAgICAgICAgICBgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQmFja2JvbmUuVmlldyDnlKjjga7liJ3mnJ/ljJZcclxuICAgICAgICAgICAgdGhpcy5zZXRFbGVtZW50KHRoaXMuJGVsLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gcHVibGljIG1ldGhvZHNcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Yid5pyf5YyWXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNyZWF0ZSgpOiBKUXVlcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVIZWFkZXJCYXNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDmnInlirnljJZcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWN0aXZhdGUoKTogSlF1ZXJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hvd0luZGljYXRvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog54Sh5Yq55YyWXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGluYWN0aXZhdGUoKTogSlF1ZXJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGlkZUluZGljYXRvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog56C05qOEXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHJlbGVhc2UoKTogSlF1ZXJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVsZWFzZUhlYWRlckJhc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gcHJpdmF0ZSBtZXRob2RzXHJcblxyXG4gICAgICAgIC8vISDlhbHpgJrjg5jjg4Pjg4Djga7jg5njg7zjgrnjgpLmupblgplcclxuICAgICAgICBwcml2YXRlIGNyZWF0ZUhlYWRlckJhc2UoKTogSlF1ZXJ5IHtcclxuICAgICAgICAgICAgLy8g5Zu65a6a44OY44OD44OA44Gu44Go44GN44Gr5pyJ5Yq55YyWXHJcbiAgICAgICAgICAgIGlmIChcImZpeGVkXCIgPT09IHRoaXMuX293bmVyLiRoZWFkZXIuanFtRGF0YShcInBvc2l0aW9uXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSBCYXNlSGVhZGVyVmlldy5zXyRoZWFkZXJCYXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgQmFzZUhlYWRlclZpZXcuc18kaGVhZGVyQmFzZSA9ICQodGhpcy5fdGVtcGxhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogdGhpcy5fb3duZXIuJHBhZ2UuanFtRGF0YShcInRoZW1lXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIEJhc2VIZWFkZXJWaWV3LnNfcmVmQ291bnQrKztcclxuICAgICAgICAgICAgICAgIEJhc2VIZWFkZXJWaWV3LnNfJGhlYWRlckJhc2UuYXBwZW5kVG8oJChkb2N1bWVudC5ib2R5KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQmFjayBJbmRpY2F0b3Ig44KS5oyB44Gj44Gm44GE44KL44GL5Yik5a6aXHJcbiAgICAgICAgICAgIGlmICgwIDwgdGhpcy4kZWwuZmluZChcIi51aS1iYWNrLWluZGljYXRvclwiKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hhc0JhY2tJbmRpY2F0b3IgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBCYXNlSGVhZGVyVmlldy5zXyRoZWFkZXJCYXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIGluZGljYXRvciDjga7ooajnpLpcclxuICAgICAgICBwcml2YXRlIHNob3dJbmRpY2F0b3IoKTogSlF1ZXJ5IHtcclxuICAgICAgICAgICAgLy8gQmFjayBJbmRpY2F0b3Ig44KS5oyB44Gj44Gm44GE44Gq44GE5aC05ZCI6KGo56S644GX44Gq44GEXHJcbiAgICAgICAgICAgIGlmIChudWxsICE9IEJhc2VIZWFkZXJWaWV3LnNfJGhlYWRlckJhc2UgJiYgdGhpcy5faGFzQmFja0luZGljYXRvcikge1xyXG4gICAgICAgICAgICAgICAgQmFzZUhlYWRlclZpZXcuc18kaGVhZGVyQmFzZS5maW5kKFwiLnVpLWZpeGVkLWJhY2staW5kaWNhdG9yXCIpLmFkZENsYXNzKFwic2hvd1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gQmFzZUhlYWRlclZpZXcuc18kaGVhZGVyQmFzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISBpbmRpY2F0b3Ig44Gu6Z2e6KGo56S6XHJcbiAgICAgICAgcHJpdmF0ZSBoaWRlSW5kaWNhdG9yKCk6IEpRdWVyeSB7XHJcbiAgICAgICAgICAgIGlmIChudWxsICE9IEJhc2VIZWFkZXJWaWV3LnNfJGhlYWRlckJhc2UpIHtcclxuICAgICAgICAgICAgICAgIEJhc2VIZWFkZXJWaWV3LnNfJGhlYWRlckJhc2UuZmluZChcIi51aS1maXhlZC1iYWNrLWluZGljYXRvclwiKS5yZW1vdmVDbGFzcyhcInNob3dcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEJhc2VIZWFkZXJWaWV3LnNfJGhlYWRlckJhc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEg5YWx6YCa44OY44OD44OA44Gu44OZ44O844K544KS56C05qOEXHJcbiAgICAgICAgcHJpdmF0ZSByZWxlYXNlSGVhZGVyQmFzZSgpOiBKUXVlcnkge1xyXG4gICAgICAgICAgICAvLyDlm7rlrprjg5jjg4Pjg4DmmYLjgavlj4Lnhafjgqvjgqbjg7Pjg4jjgpLnrqHnkIZcclxuICAgICAgICAgICAgaWYgKFwiZml4ZWRcIiA9PT0gdGhpcy5fb3duZXIuJGhlYWRlci5qcW1EYXRhKFwicG9zaXRpb25cIikpIHtcclxuICAgICAgICAgICAgICAgIGlmIChudWxsICE9IEJhc2VIZWFkZXJWaWV3LnNfJGhlYWRlckJhc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBCYXNlSGVhZGVyVmlldy5zX3JlZkNvdW50LS07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKDAgPT09IEJhc2VIZWFkZXJWaWV3LnNfcmVmQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQmFzZUhlYWRlclZpZXcuc18kaGVhZGVyQmFzZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQmFzZUhlYWRlclZpZXcuc18kaGVhZGVyQmFzZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBCYXNlSGVhZGVyVmlldy5zXyRoZWFkZXJCYXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBPdmVycmlkZTogQmFja2JvbmUuVmlld1xyXG5cclxuICAgICAgICAvLyEgZXZlbnRzIGJpbmRpbmdcclxuICAgICAgICBldmVudHMoKTogYW55IHtcclxuICAgICAgICAgICAgY29uc3QgZXZlbnRNYXAgPSB7fTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50TWFwW1widmNsaWNrIFwiICsgdGhpcy5fb3B0aW9ucy5iYWNrQ29tbWFuZFNlbGVjdG9yXSA9IHRoaXMub25Db21tYW5kQmFjaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZXZlbnRNYXA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEgYmFjayDjga7jg4/jg7Pjg4njg6lcclxuICAgICAgICBwcml2YXRlIG9uQ29tbWFuZEJhY2soZXZlbnQ6IEpRdWVyeS5FdmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBsZXQgaGFuZGxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fb3duZXIpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0aGlzLl9vd25lci5vbkNvbW1hbmQoZXZlbnQsIHRoaXMuX29wdGlvbnMuYmFja0NvbW1hbmRLaW5kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZWQpIHtcclxuICAgICAgICAgICAgICAgIFJvdXRlci5iYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLyogdHNsaW50OmRpc2FibGU6bWF4LWxpbmUtbGVuZ3RoICovXHJcblxyXG5uYW1lc3BhY2UgQ0RQLlVJIHtcclxuXHJcbiAgICBpbXBvcnQgRnJhbWV3b3JrID0gQ0RQLkZyYW1ld29yaztcclxuXHJcbiAgICBjb25zdCBUQUc6IHN0cmluZyA9IFwiW0NEUC5VSS5CYXNlUGFnZV0gXCI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJmYWNlIEJhc2VQYWdlT3B0aW9uc1xyXG4gICAgICogQGJyaWVmIEJhc2VQYWdlIOOBq+aMh+WumuOBmeOCi+OCquODl+OCt+ODp+ODs+OCpOODs+OCv+ODvOODleOCp+OCpOOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIEJhc2VQYWdlT3B0aW9uczxUTW9kZWwgZXh0ZW5kcyBGcmFtZXdvcmsuTW9kZWwgPSBGcmFtZXdvcmsuTW9kZWw+IGV4dGVuZHMgRnJhbWV3b3JrLlBhZ2VDb25zdHJ1Y3RPcHRpb25zLCBCYXNlSGVhZGVyVmlld09wdGlvbnM8VE1vZGVsPiB7XHJcbiAgICAgICAgYmFzZUhlYWRlcj86IG5ldyAob3duZXI6IEZyYW1ld29yay5JUGFnZSwgb3B0aW9ucz86IEJhc2VIZWFkZXJWaWV3T3B0aW9uczxUTW9kZWw+KSA9PiBCYXNlSGVhZGVyVmlldzxUTW9kZWw+OyAgIC8vITwgSGVhZGVyIOapn+iDveOCkuaPkOS+m+OBmeOCi+WfuuW6leOCpOODs+OCueOCv+ODs+OCuVxyXG4gICAgICAgIGJhY2tDb21tYW5kSGFuZGxlcj86IHN0cmluZzsgICAgICAgICAgICAgICAgLy8hPCBcIuaIu+OCi1wiIOOCs+ODnuODs+ODieODj+ODs+ODieODqeODoeOCveODg+ODieWQjS4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IG9uUGFnZUJhY2tcclxuICAgICAgICBkb21FeHRlbnNpb25PcHRpb25zPzogRG9tRXh0ZW5zaW9uT3B0aW9uczsgIC8vITwgRE9N5ouh5by144Gr5rih44GZ44Kq44OX44K344On44OzLiBudWxsfHVuZGVmaW5lZCDjgpLmjIflrprjgZnjgovjgajmi6HlvLXjgZfjgarjgYQgZGVmYXVsdDoge31cclxuICAgIH1cclxuXHJcbiAgICAvL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGNsYXNzIEJhc2VQYWdlXHJcbiAgICAgKiBAYnJpZWYgSGVhZGVyIOOCkuWCmeOBiOOCiyBQYWdlIOOCr+ODqeOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQmFzZVBhZ2U8VE1vZGVsIGV4dGVuZHMgRnJhbWV3b3JrLk1vZGVsID0gRnJhbWV3b3JrLk1vZGVsPiBleHRlbmRzIEZyYW1ld29yay5QYWdlIHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBfYmFzZUhlYWRlcjogQmFzZUhlYWRlclZpZXc8VE1vZGVsPjsgICAgLy8hPCDjg5jjg4Pjg4Djgq/jg6njgrlcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29uc3RydWN0b3JcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSAgICAgICAgICB1cmwgICAgICAgW2luXSDjg5rjg7zjgrggVVJMXHJcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9ICAgICAgICAgIGlkICAgICAgICBbaW5dIOODmuODvOOCuCBJRFxyXG4gICAgICAgICAqIEBwYXJhbSB7QmFzZVBhZ2VPcHRpb25zfSBbb3B0aW9uc10gW2luXSDjgqrjg5fjgrfjg6fjg7NcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZywgaWQ6IHN0cmluZywgcHJpdmF0ZSBfb3B0aW9ucz86IEJhc2VQYWdlT3B0aW9uczxUTW9kZWw+KSB7XHJcbiAgICAgICAgICAgIHN1cGVyKHVybCwgaWQsIF9vcHRpb25zID0gJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgYmFzZUhlYWRlcjogQmFzZUhlYWRlclZpZXcsXHJcbiAgICAgICAgICAgICAgICBiYWNrQ29tbWFuZEhhbmRsZXI6IFwib25QYWdlQmFja1wiLFxyXG4gICAgICAgICAgICAgICAgYmFja0NvbW1hbmRLaW5kOiBcInBhZ2ViYWNrXCIsXHJcbiAgICAgICAgICAgICAgICBkb21FeHRlbnNpb25PcHRpb25zOiB7fSxcclxuICAgICAgICAgICAgfSwgX29wdGlvbnMpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gT3ZlcnJpZGU6IEZyYW1ld29yayBQYWdlXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGpRTSBldmVudDogXCJwYWdlYmVmb3JlY3JlYXRlXCIg44Gr5a++5b+cXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZXZlbnQge0pRdWVyeS5FdmVudH0gW2luXSDjgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKi9cclxuICAgICAgICBvblBhZ2VCZWZvcmVDcmVhdGUoZXZlbnQ6IEpRdWVyeS5FdmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5iYXNlSGVhZGVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9iYXNlSGVhZGVyID0gbmV3IHRoaXMuX29wdGlvbnMuYmFzZUhlYWRlcih0aGlzLCB0aGlzLl9vcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Jhc2VIZWFkZXIuY3JlYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3VwZXIub25QYWdlQmVmb3JlQ3JlYXRlKGV2ZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGpRTSBldmVudDogXCJwYWdlY3JlYXRlXCIg44Gr5a++5b+cXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZXZlbnQge0pRdWVyeS5FdmVudH0gW2luXSDjgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKi9cclxuICAgICAgICBvblBhZ2VJbml0KGV2ZW50OiBKUXVlcnkuRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKG51bGwgIT0gdGhpcy5fb3B0aW9ucy5kb21FeHRlbnNpb25PcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBFeHRlbnNpb25NYW5hZ2VyLmFwcGx5RG9tRXh0ZW5zaW9uKHRoaXMuJHBhZ2UsIHRoaXMuX29wdGlvbnMuZG9tRXh0ZW5zaW9uT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3VwZXIub25QYWdlSW5pdChldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBqUU0gZXZlbnQ6IFwicGFnZWJlZm9yZXNob3dcIiDjgavlr77lv5xcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudCB7SlF1ZXJ5LkV2ZW50fSBbaW5dIOOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqIEBwYXJhbSBkYXRhICB7U2hvd0V2ZW50RGF0YX0gICAgIFtpbl0g5LuY5Yqg5oOF5aCxXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25QYWdlQmVmb3JlU2hvdyhldmVudDogSlF1ZXJ5LkV2ZW50LCBkYXRhPzogRnJhbWV3b3JrLlNob3dFdmVudERhdGEpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2Jhc2VIZWFkZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Jhc2VIZWFkZXIuYWN0aXZhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdXBlci5vblBhZ2VCZWZvcmVTaG93KGV2ZW50LCBkYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGpRTSBldmVudDogXCJwYWdlYmVmb3JlaGlkZVwiIOOBq+WvvuW/nFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGV2ZW50IHtKUXVlcnkuRXZlbnR9IFtpbl0g44Kk44OZ44Oz44OI44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgICAgICogQHBhcmFtIGRhdGEgIHtIaWRlRXZlbnREYXRhfSAgICAgW2luXSDku5jliqDmg4XloLFcclxuICAgICAgICAgKi9cclxuICAgICAgICBvblBhZ2VCZWZvcmVIaWRlKGV2ZW50OiBKUXVlcnkuRXZlbnQsIGRhdGE/OiBGcmFtZXdvcmsuSGlkZUV2ZW50RGF0YSk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fYmFzZUhlYWRlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYmFzZUhlYWRlci5pbmFjdGl2YXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3VwZXIub25QYWdlQmVmb3JlSGlkZShldmVudCwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBqUU0gZXZlbnQ6IFwicGFnZXJlbW92ZVwiIOOBq+WvvuW/nFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGV2ZW50IHtKUXVlcnkuRXZlbnR9IFtpbl0g44Kk44OZ44Oz44OI44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25QYWdlUmVtb3ZlKGV2ZW50OiBKUXVlcnkuRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2Jhc2VIZWFkZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Jhc2VIZWFkZXIucmVsZWFzZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYmFzZUhlYWRlciA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3VwZXIub25QYWdlUmVtb3ZlKGV2ZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEgvVyBCYWNrIEJ1dHRvbiDjg4/jg7Pjg4njg6lcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSAgZXZlbnQge0pRdWVyeS5FdmVudH0gW2luXSBldmVudCBvYmplY3RcclxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlOiDml6Llrprjga7lh6bnkIbjgpLooYzjgo/jgarjgYQgLyBmYWxzZTog5pei5a6a44Gu5Yem55CG44KS6KGM44GGXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25IYXJkd2FyZUJhY2tCdXR0b24oZXZlbnQ/OiBKUXVlcnkuRXZlbnQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgbGV0IHJldHZhbCA9IHN1cGVyLm9uSGFyZHdhcmVCYWNrQnV0dG9uKGV2ZW50KTtcclxuICAgICAgICAgICAgaWYgKCFyZXR2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHZhbCA9IHRoaXMub25Db21tYW5kKGV2ZW50LCB0aGlzLl9vcHRpb25zLmJhY2tDb21tYW5kS2luZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJldHZhbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gT3ZlcnJpZGU6IEN1c3RvbSBFdmVudFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBcIuaIu+OCi1wiIGV2ZW50IOeZuuihjOaZguOBq+OCs+ODvOODq+OBleOCjOOCi1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGV2ZW50IHtKUXVlcnkuRXZlbnR9IFtpbl0g44Kk44OZ44Oz44OI44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZTog5pei5a6a44Gu5Yem55CG44KS6KGM44KP44Gq44GEIC8gZmFsc2U6IOaXouWumuOBruWHpueQhuOCkuihjOOBhlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uQ29tbWFuZChldmVudDogSlF1ZXJ5LkV2ZW50LCBraW5kOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuYmFja0NvbW1hbmRLaW5kID09PSBraW5kKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb3duZXIgJiYgdGhpcy5fb3duZXJbdGhpcy5fb3B0aW9ucy5iYWNrQ29tbWFuZEhhbmRsZXJdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX293bmVyW3RoaXMuX29wdGlvbnMuYmFja0NvbW1hbmRIYW5kbGVyXShldmVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKiB0c2xpbnQ6ZGlzYWJsZTptYXgtbGluZS1sZW5ndGggKi9cclxuXHJcbm5hbWVzcGFjZSBDRFAuVUkge1xyXG4gICAgaW1wb3J0IFByb21pc2UgICAgICA9IENEUC5Qcm9taXNlO1xyXG4gICAgaW1wb3J0IEZyYW1ld29yayAgICA9IENEUC5GcmFtZXdvcms7XHJcblxyXG4gICAgY29uc3QgVEFHID0gXCJbQ0RQLlVJLlBhZ2VWaWV3XSBcIjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhZ2VWaWV3IOOBjOeZuuihjOOBmeOCi+OCpOODmeODs+ODiOWumue+qVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY29uc3QgZW51bSBQQUdFVklFV19FVkVOVFMge1xyXG4gICAgICAgIE9SSUVOVEFUSU9OX0NIQU5HRUQgPSBcInBhZ2V2aWV3Om9yaWVudGF0aW9uLWNoYW5nZWRcIixcclxuICAgICAgICBJTklUSUFMWlNFICAgICAgICAgID0gXCJwYWdldmlldzppbml0aWFsaXplXCIsXHJcbiAgICAgICAgUEFHRV9CRUZPUkVfQ1JFQVRFICA9IFwicGFnZXZpZXc6YmVmb3JlLWNyZWF0ZVwiLFxyXG4gICAgICAgIFBBR0VfSU5JVCAgICAgICAgICAgPSBcInBhZ2V2aWV3OnBhZ2UtaW5pdFwiLFxyXG4gICAgICAgIFBBR0VfQkVGT1JFX1NIT1cgICAgPSBcInBhZ2V2aWV3OmJlZm9yZS1zaG93XCIsXHJcbiAgICAgICAgUEFHRV9TSE9XICAgICAgICAgICA9IFwicGFnZXZpZXc6c2hvd1wiLFxyXG4gICAgICAgIFBBR0VfQkVGT1JFX0hJREUgICAgPSBcInBhZ2V2aWV3OmJlZm9yZS1oaWRlXCIsXHJcbiAgICAgICAgUEFHRV9ISURFICAgICAgICAgICA9IFwicGFnZXZpZXc6aGlkZVwiLFxyXG4gICAgICAgIFBBR0VfUkVNT1ZFICAgICAgICAgPSBcInBhZ2V2aWV3OnJlbW92ZVwiLFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGludGVyZmFjZSBQYWdlVmlld0NvbnN0cnVjdE9wdGlvbnNcclxuICAgICAqIEBicmllZiBSb3V0ZXIg44G444Gu55m76Yyy5oOF5aCx44GoIEJhY2tib25lLlZpZXcg44G444Gu5Yid5pyf5YyW5oOF5aCx44KS5qC857SN44GZ44KL44Kk44Oz44K/44O844OV44Kn44Kk44K544Kv44Op44K5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUGFnZVZpZXdDb25zdHJ1Y3RPcHRpb25zPFRNb2RlbCBleHRlbmRzIEZyYW1ld29yay5Nb2RlbCA9IEZyYW1ld29yay5Nb2RlbD4gZXh0ZW5kcyBCYXNlUGFnZU9wdGlvbnM8VE1vZGVsPiB7XHJcbiAgICAgICAgYmFzZVBhZ2U/OiBuZXcgKHVybDogc3RyaW5nLCBpZDogc3RyaW5nLCBvcHRpb25zPzogRnJhbWV3b3JrLlBhZ2VDb25zdHJ1Y3RPcHRpb25zKSA9PiBGcmFtZXdvcmsuUGFnZTsgICAgLy8hPCBQYWdlIOapn+iDveOCkuaPkOS+m+OBmeOCi+WfuuW6leOCpOODs+OCueOCv+ODs+OCuVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGNsYXNzIFBhZ2VWaWV3XHJcbiAgICAgKiBAYnJpZWYgQ0RQLkZyYW1ld29yay5QYWdlIOOBqCBCYWNrYm9uZS5WaWV3IOOBruS4oeaWueOBruapn+iDveOCkuaPkOS+m+OBmeOCi+ODmuODvOOCuOOBruWfuuW6leOCr+ODqeOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgUGFnZVZpZXc8VE1vZGVsIGV4dGVuZHMgRnJhbWV3b3JrLk1vZGVsID0gRnJhbWV3b3JrLk1vZGVsPiBleHRlbmRzIEZyYW1ld29yay5WaWV3PFRNb2RlbD4gaW1wbGVtZW50cyBGcmFtZXdvcmsuSVBhZ2UsIElTdGF0dXNNYW5hZ2VyIHtcclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIF9wYWdlT3B0aW9uczogUGFnZVZpZXdDb25zdHJ1Y3RPcHRpb25zPFRNb2RlbD4gPSBudWxsO1xyXG4gICAgICAgIHByb3RlY3RlZCBfYmFzZVBhZ2U6IEZyYW1ld29yay5QYWdlID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIF9zdGF0dXNNZ3I6IFN0YXR1c01hbmFnZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHVybCAgICAge1N0cmluZ30gICAgICAgICAgICAgICAgICAgW2luXSDjg5rjg7zjgrggVVJMXHJcbiAgICAgICAgICogQHBhcmFtIGlkICAgICAge1N0cmluZ30gICAgICAgICAgICAgICAgICAgW2luXSDjg5rjg7zjgrggSURcclxuICAgICAgICAgKiBAcGFyYW0gb3B0aW9ucyB7UGFnZVZpZXdDb25zdHJ1Y3RPcHRpb25zfSBbaW5dIOOCquODl+OCt+ODp+ODs1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHVybDogc3RyaW5nLCBpZDogc3RyaW5nLCBvcHRpb25zPzogUGFnZVZpZXdDb25zdHJ1Y3RPcHRpb25zPFRNb2RlbD4pIHtcclxuICAgICAgICAgICAgc3VwZXIob3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAvLyBQYWdlVmlldyDoqK3lrppcclxuICAgICAgICAgICAgdGhpcy5fcGFnZU9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgeyBvd25lcjogdGhpcyB9LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5fYmFzZVBhZ2UgPSB0aGlzLl9wYWdlT3B0aW9ucy5iYXNlUGFnZSA/IG5ldyB0aGlzLl9wYWdlT3B0aW9ucy5iYXNlUGFnZSh1cmwsIGlkLCB0aGlzLl9wYWdlT3B0aW9ucykgOiBuZXcgQmFzZVBhZ2UodXJsLCBpZCwgdGhpcy5fcGFnZU9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3RhdHVzTWFuYWdlclxyXG4gICAgICAgICAgICB0aGlzLl9zdGF0dXNNZ3IgPSBuZXcgU3RhdHVzTWFuYWdlcigpO1xyXG4gICAgICAgICAgICAvLyBCYWNrYm9uZS5WaWV3IOeUqOOBruWIneacn+WMllxyXG4gICAgICAgICAgICBjb25zdCBkZWxlZ2F0ZXMgPSAoPGFueT50aGlzKS5ldmVudHMgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RWxlbWVudCh0aGlzLiRwYWdlLCBkZWxlZ2F0ZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBJbXBsZW1lbnRzOiBJU3RhdHVzTWFuYWdlciDnirbmhYvnrqHnkIZcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog54q25oWL5aSJ5pWw44Gu5Y+C54Wn44Kr44Km44Oz44OI44Gu44Kk44Oz44Kv44Oq44Oh44Oz44OIXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gc3RhdHVzIHtTdHJpbmd9IFtpbl0g54q25oWL6K2Y5Yil5a2QXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc3RhdHVzQWRkUmVmKHN0YXR1czogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXR1c01nci5zdGF0dXNBZGRSZWYoc3RhdHVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOeKtuaFi+WkieaVsOOBruWPgueFp+OCq+OCpuODs+ODiOOBruODh+OCr+ODquODoeODs+ODiFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHN0YXR1cyB7U3RyaW5nfSBbaW5dIOeKtuaFi+itmOWIpeWtkFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHN0YXR1c1JlbGVhc2Uoc3RhdHVzOiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3RhdHVzTWdyLnN0YXR1c1JlbGVhc2Uoc3RhdHVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWHpueQhuOCueOCs+ODvOODl+avjuOBq+eKtuaFi+WkieaVsOOCkuioreWumlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHN0YXR1cyAgIHtTdHJpbmd9ICAgW2luXSDnirbmhYvorZjliKXlrZBcclxuICAgICAgICAgKiBAcGFyYW0gY2FsbGJhY2sge0Z1bmN0aW9ufSBbaW5dIOWHpueQhuOCs+ODvOODq+ODkOODg+OCr1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHN0YXR1c1Njb3BlKHN0YXR1czogc3RyaW5nLCBjYWxsYmFjazogKCkgPT4gdm9pZCB8IFByb21pc2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLl9zdGF0dXNNZ3Iuc3RhdHVzU2NvcGUoc3RhdHVzLCBjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDmjIflrprjgZfjgZ/nirbmhYvkuK3jgafjgYLjgovjgYvnorroqo1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBzdGF0dXMge1N0cmluZ30gICBbaW5dIOeKtuaFi+itmOWIpeWtkFxyXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWU6IOeKtuaFi+WGhSAvIGZhbHNlOiDnirbmhYvlpJZcclxuICAgICAgICAgKi9cclxuICAgICAgICBpc1N0YXR1c0luKHN0YXR1czogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdGF0dXNNZ3IuaXNTdGF0dXNJbihzdGF0dXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBJUGFnZSBzdHViIHN0dWZmLlxyXG5cclxuICAgICAgICBnZXQgYWN0aXZlKCk6IGJvb2xlYW4gICAgICAgICAgICAgICAgICAgeyByZXR1cm4gdGhpcy5fYmFzZVBhZ2UuYWN0aXZlOyAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBnZXQgdXJsKCk6IHN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgeyByZXR1cm4gdGhpcy5fYmFzZVBhZ2UudXJsOyAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBnZXQgaWQoKTogc3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgeyByZXR1cm4gdGhpcy5fYmFzZVBhZ2UgPyB0aGlzLl9iYXNlUGFnZS5pZCA6IG51bGw7IH1cclxuICAgICAgICBnZXQgJHBhZ2UoKTogSlF1ZXJ5ICAgICAgICAgICAgICAgICAgICAgeyByZXR1cm4gdGhpcy5fYmFzZVBhZ2UuJHBhZ2U7ICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBnZXQgJGhlYWRlcigpOiBKUXVlcnkgICAgICAgICAgICAgICAgICAgeyByZXR1cm4gdGhpcy5fYmFzZVBhZ2UuJGhlYWRlcjsgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBnZXQgJGZvb3RlcigpOiBKUXVlcnkgICAgICAgICAgICAgICAgICAgeyByZXR1cm4gdGhpcy5fYmFzZVBhZ2UuJGZvb3RlcjsgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBnZXQgaW50ZW50KCk6IEZyYW1ld29yay5JbnRlbnQgICAgICAgICAgeyByZXR1cm4gdGhpcy5fYmFzZVBhZ2UuaW50ZW50OyAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBzZXQgaW50ZW50KG5ld0ludGVudDogRnJhbWV3b3JrLkludGVudCkgeyB0aGlzLl9iYXNlUGFnZS5pbnRlbnQgPSBuZXdJbnRlbnQ7ICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT3JpZW50YXRpb24g44Gu5aSJ5pu044KS5Y+X5L+hXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gbmV3T3JpZW50YXRpb24ge09yaWVudGF0aW9ufSBbaW5dIG5ldyBvcmllbnRhdGlvbiBjb2RlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uT3JpZW50YXRpb25DaGFuZ2VkKG5ld09yaWVudGF0aW9uOiBGcmFtZXdvcmsuT3JpZW50YXRpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFBBR0VWSUVXX0VWRU5UUy5PUklFTlRBVElPTl9DSEFOR0VELCBuZXdPcmllbnRhdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBIL1cgQmFjayBCdXR0b24g44OP44Oz44OJ44OpXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gIGV2ZW50IHtKUXVlcnkuRXZlbnR9IFtpbl0gZXZlbnQgb2JqZWN0XHJcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZTog5pei5a6a44Gu5Yem55CG44KS6KGM44KP44Gq44GEIC8gZmFsc2U6IOaXouWumuOBruWHpueQhuOCkuihjOOBhlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uSGFyZHdhcmVCYWNrQnV0dG9uKGV2ZW50PzogSlF1ZXJ5LkV2ZW50KTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJvdXRlciBcImJlZm9yZSByb3V0ZSBjaGFuZ2VcIiDjg4/jg7Pjg4njg6lcclxuICAgICAgICAgKiDjg5rjg7zjgrjpgbfnp7vnm7TliY3jgavpnZ7lkIzmnJ/lh6bnkIbjgpLooYzjgYbjgZPjgajjgYzlj6/og71cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm4ge0lQcm9taXNlQmFzZX0gUHJvbWlzZSDjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKi9cclxuICAgICAgICBvbkJlZm9yZVJvdXRlQ2hhbmdlKCk6IElQcm9taXNlQmFzZTxhbnk+IHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5rGO55So44Kz44Oe44Oz44OJ44KS5Y+X5L+hXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gIGV2ZW50IHtKUXVlcnkuRXZlbnR9IFtpbl0gZXZlbnQgb2JqZWN0XHJcbiAgICAgICAgICogQHBhcmFtICBldmVudCB7a2luZH0gICAgICAgICAgICAgIFtpbl0gY29tbWFuZCBraW5kIHN0cmluZ1xyXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWU6IOaXouWumuOBruWHpueQhuOCkuihjOOCj+OBquOBhCAvIGZhbHNlOiDml6Llrprjga7lh6bnkIbjgpLooYzjgYZcclxuICAgICAgICAgKi9cclxuICAgICAgICBvbkNvbW1hbmQoZXZlbnQ/OiBKUXVlcnkuRXZlbnQsIGtpbmQ/OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5pyA5Yid44GuIE9uUGFnZUluaXQoKSDjga7jgajjgY3jgavjga7jgb/jgrPjg7zjg6vjgZXjgozjgotcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudCB7SlF1ZXJ5LkV2ZW50fSBbaW5dIOOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uSW5pdGlhbGl6ZShldmVudDogSlF1ZXJ5LkV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihQQUdFVklFV19FVkVOVFMuSU5JVElBTFpTRSwgZXZlbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogalFNIGV2ZW50OiBcInBhZ2ViZWZvcmVjcmVhdGVcIiDjgavlr77lv5xcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudCB7SlF1ZXJ5LkV2ZW50fSBbaW5dIOOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uUGFnZUJlZm9yZUNyZWF0ZShldmVudDogSlF1ZXJ5LkV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RWxlbWVudCh0aGlzLiRwYWdlLCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFBBR0VWSUVXX0VWRU5UUy5QQUdFX0JFRk9SRV9DUkVBVEUsIGV2ZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGpRTSBldmVudDogXCJwYWdlY3JlYXRlXCIgKOaXpzpcInBhZ2Vpbml0XCIpIOOBq+WvvuW/nFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGV2ZW50IHtKUXVlcnkuRXZlbnR9IFtpbl0g44Kk44OZ44Oz44OI44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25QYWdlSW5pdChldmVudDogSlF1ZXJ5LkV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihQQUdFVklFV19FVkVOVFMuUEFHRV9JTklULCBldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBqUU0gZXZlbnQ6IFwicGFnZWJlZm9yZXNob3dcIiDjgavlr77lv5xcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudCB7SlF1ZXJ5LkV2ZW50fSBbaW5dIOOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqIEBwYXJhbSBkYXRhICB7U2hvd0V2ZW50RGF0YX0gICAgIFtpbl0g5LuY5Yqg5oOF5aCxXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25QYWdlQmVmb3JlU2hvdyhldmVudDogSlF1ZXJ5LkV2ZW50LCBkYXRhPzogRnJhbWV3b3JrLlNob3dFdmVudERhdGEpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFBBR0VWSUVXX0VWRU5UUy5QQUdFX0JFRk9SRV9TSE9XLCBldmVudCwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBqUU0gZXZlbnQ6IFwicGFnZWNvbnRhaW5lcnNob3dcIiAo5penOlwicGFnZXNob3dcIikg44Gr5a++5b+cXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZXZlbnQge0pRdWVyeS5FdmVudH0gW2luXSDjgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKiBAcGFyYW0gZGF0YSAge1Nob3dFdmVudERhdGF9ICAgICBbaW5dIOS7mOWKoOaDheWgsVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uUGFnZVNob3coZXZlbnQ6IEpRdWVyeS5FdmVudCwgZGF0YT86IEZyYW1ld29yay5TaG93RXZlbnREYXRhKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihQQUdFVklFV19FVkVOVFMuUEFHRV9TSE9XLCBldmVudCwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBqUU0gZXZlbnQ6IFwicGFnZWJlZm9yZWhpZGVcIiDjgavlr77lv5xcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudCB7SlF1ZXJ5LkV2ZW50fSBbaW5dIOOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqIEBwYXJhbSBkYXRhICB7SGlkZUV2ZW50RGF0YX0gICAgIFtpbl0g5LuY5Yqg5oOF5aCxXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25QYWdlQmVmb3JlSGlkZShldmVudDogSlF1ZXJ5LkV2ZW50LCBkYXRhPzogRnJhbWV3b3JrLkhpZGVFdmVudERhdGEpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFBBR0VWSUVXX0VWRU5UUy5QQUdFX0JFRk9SRV9ISURFLCBldmVudCwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBqUU0gZXZlbnQ6IFwicGFnZWNvbnRhaW5lcmhpZGVcIiAo5penOlwicGFnZWhpZGVcIikg44Gr5a++5b+cXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZXZlbnQge0pRdWVyeS5FdmVudH0gW2luXSDjgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKiBAcGFyYW0gZGF0YSAge0hpZGVFdmVudERhdGF9ICAgICBbaW5dIOS7mOWKoOaDheWgsVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uUGFnZUhpZGUoZXZlbnQ6IEpRdWVyeS5FdmVudCwgZGF0YT86IEZyYW1ld29yay5IaWRlRXZlbnREYXRhKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihQQUdFVklFV19FVkVOVFMuUEFHRV9ISURFLCBldmVudCwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBqUU0gZXZlbnQ6IFwicGFnZXJlbW92ZVwiIOOBq+WvvuW/nFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGV2ZW50IHtKUXVlcnkuRXZlbnR9IFtpbl0g44Kk44OZ44Oz44OI44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25QYWdlUmVtb3ZlKGV2ZW50OiBKUXVlcnkuRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFBBR0VWSUVXX0VWRU5UUy5QQUdFX1JFTU9WRSwgZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmVsICA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLyogdHNsaW50OmRpc2FibGU6bWF4LWxpbmUtbGVuZ3RoICovXHJcblxyXG5uYW1lc3BhY2UgQ0RQLlVJIHtcclxuICAgIGltcG9ydCBGcmFtZXdvcmsgPSBDRFAuRnJhbWV3b3JrO1xyXG5cclxuICAgIGNvbnN0IFRBRyA9IFwiW0NEUC5VSS5QYWdlQ29udGFpbmVyVmlld10gXCI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJmYWNlIFBhZ2VDb250YWluZXJWaWV3T3B0aW9uc1xyXG4gICAgICogQGJyaWVmIFBhZ2VDb250YWluZXIg44Gu44Kq44OX44K344On44OzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUGFnZUNvbnRhaW5lclZpZXdPcHRpb25zPFRNb2RlbCBleHRlbmRzIEZyYW1ld29yay5Nb2RlbCA9IEZyYW1ld29yay5Nb2RlbD4gZXh0ZW5kcyBGcmFtZXdvcmsuVmlld09wdGlvbnM8VE1vZGVsPiB7XHJcbiAgICAgICAgb3duZXI6IFBhZ2VWaWV3O1xyXG4gICAgICAgICRlbD86IEpRdWVyeTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBjbGFzcyBQYWdlQ29udGFpbmVyVmlld1xyXG4gICAgICogQGJyaWVmIFBhZ2VWaWV3IOOBqOmAo+aQuuWPr+iDveOBqiDjgrPjg7Pjg4bjg4rjg5Pjg6Xjg7zjgq/jg6njgrlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFBhZ2VDb250YWluZXJWaWV3PFRNb2RlbCBleHRlbmRzIEZyYW1ld29yay5Nb2RlbCA9IEZyYW1ld29yay5Nb2RlbD4gZXh0ZW5kcyBGcmFtZXdvcmsuVmlldzxUTW9kZWw+IHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBfb3duZXI6IFBhZ2VWaWV3ID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29uc3RydWN0b3JcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQYWdlQ29udGFpbmVyVmlld09wdGlvbnM8VE1vZGVsPikge1xyXG4gICAgICAgICAgICBzdXBlcihvcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5fb3duZXIgPSBvcHRpb25zLm93bmVyO1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kZWwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlbGVnYXRlcyA9ICg8YW55PnRoaXMpLmV2ZW50cyA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RWxlbWVudChvcHRpb25zLiRlbCwgZGVsZWdhdGVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBzZXQgZXZlbnQgbGlzdGVuZXJcclxuICAgICAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLl9vd25lciwgUEFHRVZJRVdfRVZFTlRTLk9SSUVOVEFUSU9OX0NIQU5HRUQsIHRoaXMub25PcmllbnRhdGlvbkNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5fb3duZXIsIFBBR0VWSUVXX0VWRU5UUy5JTklUSUFMWlNFLCB0aGlzLm9uSW5pdGlhbGl6ZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLl9vd25lciwgUEFHRVZJRVdfRVZFTlRTLlBBR0VfQkVGT1JFX0NSRUFURSwgdGhpcy5vblBhZ2VCZWZvcmVDcmVhdGUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5fb3duZXIsIFBBR0VWSUVXX0VWRU5UUy5QQUdFX0lOSVQsIHRoaXMub25QYWdlSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLl9vd25lciwgUEFHRVZJRVdfRVZFTlRTLlBBR0VfQkVGT1JFX1NIT1csIHRoaXMub25QYWdlQmVmb3JlU2hvdy5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLl9vd25lciwgUEFHRVZJRVdfRVZFTlRTLlBBR0VfU0hPVywgdGhpcy5vblBhZ2VTaG93LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuX293bmVyLCBQQUdFVklFV19FVkVOVFMuUEFHRV9CRUZPUkVfSElERSwgdGhpcy5vblBhZ2VCZWZvcmVIaWRlLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuX293bmVyLCBQQUdFVklFV19FVkVOVFMuUEFHRV9ISURFLCB0aGlzLm9uUGFnZUhpZGUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5fb3duZXIsIFBBR0VWSUVXX0VWRU5UUy5QQUdFX1JFTU9WRSwgdGhpcy5vblBhZ2VSZW1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIHNob3J0IGN1dCBtZXRob2RzXHJcblxyXG4gICAgICAgIC8vISBPd25lciDlj5blvpdcclxuICAgICAgICBnZXQgb3duZXIoKTogUGFnZVZpZXcge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb3duZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIEhhbmRsZSBQYWdlVmlldyBldmVudHNcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT3JpZW50YXRpb24g44Gu5aSJ5pu044KS5Y+X5L+hXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gbmV3T3JpZW50YXRpb24ge09yaWVudGF0aW9ufSBbaW5dIG5ldyBvcmllbnRhdGlvbiBjb2RlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uT3JpZW50YXRpb25DaGFuZ2VkKG5ld09yaWVudGF0aW9uOiBGcmFtZXdvcmsuT3JpZW50YXRpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gT3ZlcnJpZGVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOacgOWIneOBriBPblBhZ2VJbml0KCkg44Gu44Go44GN44Gr44Gu44G/44Kz44O844Or44GV44KM44KLXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZXZlbnQge0pRdWVyeS5FdmVudH0gW2luXSDjgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKi9cclxuICAgICAgICBvbkluaXRpYWxpemUoZXZlbnQ6IEpRdWVyeS5FdmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBPdmVycmlkZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogalFNIGV2ZW50OiBcInBhZ2ViZWZvcmVjcmVhdGVcIiDjgavlr77lv5xcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudCB7SlF1ZXJ5LkV2ZW50fSBbaW5dIOOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uUGFnZUJlZm9yZUNyZWF0ZShldmVudDogSlF1ZXJ5LkV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIE92ZXJyaWRlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBqUU0gZXZlbnQ6IFwicGFnZWNyZWF0ZVwiICjml6c6XCJwYWdlaW5pdFwiKSDjgavlr77lv5xcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudCB7SlF1ZXJ5LkV2ZW50fSBbaW5dIOOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uUGFnZUluaXQoZXZlbnQ6IEpRdWVyeS5FdmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBPdmVycmlkZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogalFNIGV2ZW50OiBcInBhZ2ViZWZvcmVzaG93XCIg44Gr5a++5b+cXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZXZlbnQge0pRdWVyeS5FdmVudH0gW2luXSDjgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKiBAcGFyYW0gZGF0YSAge1Nob3dFdmVudERhdGF9ICAgICBbaW5dIOS7mOWKoOaDheWgsVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uUGFnZUJlZm9yZVNob3coZXZlbnQ6IEpRdWVyeS5FdmVudCwgZGF0YT86IEZyYW1ld29yay5TaG93RXZlbnREYXRhKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIE92ZXJyaWRlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBqUU0gZXZlbnQ6IFwicGFnZWNvbnRhaW5lcnNob3dcIiAo5penOlwicGFnZXNob3dcIikg44Gr5a++5b+cXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZXZlbnQge0pRdWVyeS5FdmVudH0gW2luXSDjgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKiBAcGFyYW0gZGF0YSAge1Nob3dFdmVudERhdGF9ICAgICBbaW5dIOS7mOWKoOaDheWgsVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uUGFnZVNob3coZXZlbnQ6IEpRdWVyeS5FdmVudCwgZGF0YT86IEZyYW1ld29yay5TaG93RXZlbnREYXRhKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIE92ZXJyaWRlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBqUU0gZXZlbnQ6IFwicGFnZWJlZm9yZWhpZGVcIiDjgavlr77lv5xcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudCB7SlF1ZXJ5LkV2ZW50fSBbaW5dIOOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqIEBwYXJhbSBkYXRhICB7SGlkZUV2ZW50RGF0YX0gICAgIFtpbl0g5LuY5Yqg5oOF5aCxXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25QYWdlQmVmb3JlSGlkZShldmVudDogSlF1ZXJ5LkV2ZW50LCBkYXRhPzogRnJhbWV3b3JrLkhpZGVFdmVudERhdGEpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gT3ZlcnJpZGVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGpRTSBldmVudDogXCJwYWdlY29udGFpbmVyaGlkZVwiICjml6c6XCJwYWdlaGlkZVwiKSDjgavlr77lv5xcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudCB7SlF1ZXJ5LkV2ZW50fSBbaW5dIOOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqIEBwYXJhbSBkYXRhICB7SGlkZUV2ZW50RGF0YX0gICAgIFtpbl0g5LuY5Yqg5oOF5aCxXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25QYWdlSGlkZShldmVudDogSlF1ZXJ5LkV2ZW50LCBkYXRhPzogRnJhbWV3b3JrLkhpZGVFdmVudERhdGEpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gT3ZlcnJpZGVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGpRTSBldmVudDogXCJwYWdlcmVtb3ZlXCIg44Gr5a++5b+cXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZXZlbnQge0pRdWVyeS5FdmVudH0gW2luXSDjgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKi9cclxuICAgICAgICBvblBhZ2VSZW1vdmUoZXZlbnQ6IEpRdWVyeS5FdmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gZm9yIG5vbiBmbGlwc25hcCB1c2VyLlxyXG5pbnRlcmZhY2UgSUZsaXBzbmFwIHtcclxuICAgIFt4OiBzdHJpbmddOiBhbnk7XHJcbn1cclxuaW50ZXJmYWNlIEZsaXBzbmFwT3B0aW9ucyB7XHJcbn1cclxuXHJcbm5hbWVzcGFjZSBDRFAuVUkge1xyXG5cclxuICAgIGltcG9ydCBNb2RlbCAgICAgICAgICAgICAgICAgICAgICAgID0gRnJhbWV3b3JrLk1vZGVsO1xyXG4gICAgaW1wb3J0IElPcmllbnRhdGlvbkNoYW5nZWRMaXN0ZW5lciAgPSBGcmFtZXdvcmsuSU9yaWVudGF0aW9uQ2hhbmdlZExpc3RlbmVyO1xyXG4gICAgaW1wb3J0IE9yaWVudGF0aW9uICAgICAgICAgICAgICAgICAgPSBGcmFtZXdvcmsuT3JpZW50YXRpb247XHJcblxyXG4gICAgY29uc3QgVEFHID0gXCJbQ0RQLlVJLlRhYkhvc3RWaWV3XSBcIjtcclxuXHJcbiAgICBuYW1lc3BhY2UgX0NvbmZpZyB7XHJcbiAgICAgICAgZXhwb3J0IGNvbnN0IFRBQlZJRVdfQ0xBU1MgPSBcInVpLXRhYnZpZXdcIjtcclxuICAgICAgICBleHBvcnQgY29uc3QgVEFCVklFV19TRUxFQ1RPUiA9IFwiLlwiICsgVEFCVklFV19DTEFTUztcclxuICAgICAgICBleHBvcnQgY29uc3QgVEFCSE9TVF9DTEFTUyA9IFwidWktdGFiaG9zdFwiO1xyXG4gICAgICAgIGV4cG9ydCBjb25zdCBUQUJIT1NUX1NFTEVDVE9SID0gXCIuXCIgKyBUQUJIT1NUX0NMQVNTO1xyXG4gICAgICAgIGV4cG9ydCBjb25zdCBUQUJIT1NUX1JFRlJFU0hfQ09FRkYgPSAxLjA7ICAgICAgIC8vIGZsaXBzbmFwIOWIh+OCiuabv+OBiOaZguOBqyBkdXJhdGlvbiDjgavlr77jgZfjgabmm7TmlrDjgpLooYzjgYbkv4LmlbBcclxuICAgICAgICBleHBvcnQgY29uc3QgVEFCSE9TVF9SRUZSRVNIX0lOVEVSVkFMID0gMjAwOyAgICAvLyBmbGlwc25hcCDjga7mm7TmlrDjgavkvb/nlKjjgZnjgovplpPpmpQgW21zZWNdXHJcbiAgICB9XHJcblxyXG4gICAgLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBpbnRlcmZhY2UgSVRhYlZpZXdcclxuICAgICAqIEBicmllZiBUYWJIb3N0VmlldyDjgavjgqLjgr/jg4Pjg4Hlj6/og73jgaogVmlldyDjgqTjg7Pjgr/jg7zjg5XjgqfjgqTjgrlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJVGFiVmlldyBleHRlbmRzIElMaXN0VmlldywgSU9yaWVudGF0aW9uQ2hhbmdlZExpc3RlbmVyIHtcclxuICAgICAgICBob3N0OiBUYWJIb3N0VmlldzsgICAgICAvLyBob3N0IOOBq+OCouOCr+OCu+OCuVxyXG4gICAgICAgICRlbDogSlF1ZXJ5OyAgICAgICAgICAgIC8vIOeuoeeQhiBET00g44Gr44Ki44Kv44K744K5XHJcbiAgICAgICAgbmVlZFJlYnVpbGQ/OiBib29sZWFuOyAgLy8gcmVidWlsZCDnirbmhYvjgavjgqLjgq/jgrvjgrlcclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBwdWJsaWMgbWV0aG9kczogRnJhbWV3b3JrXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOeKtuaFi+OBq+W/nOOBmOOBn+OCueOCr+ODreODvOODq+S9jee9ruOBruS/neWtmC/lvqnlhYNcclxuICAgICAgICAgKiBCcm93c2VyIOOBriBOYXRpdmUgU2Nyb2xsIOaZguOBq+OCs+ODvOODq+OBleOCjOOCi1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRyZWF0U2Nyb2xsUG9zaXRpb24oKTogdm9pZDtcclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBwdWJsaWMgbWV0aG9kczogRXZlbnRcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2Nyb2xsZXIg44Gu5Yid5pyf5YyW5pmC44Gr44Kz44O844Or44GV44KM44KLXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25Jbml0aWFsaXplKGhvc3Q6IFRhYkhvc3RWaWV3LCAkcm9vdDogSlF1ZXJ5KTogdm9pZDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2Nyb2xsZXIg44Gu56C05qOE5pmC44Gr44Kz44O844Or44GV44KM44KLXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25EZXN0cm95KCk6IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHZpc2liaWxpdHkg5bGe5oCn44GM5aSJ5pu044GV44KM44Gf44Go44GN44Gr44Kz44O844Or44GV44KM44KLXHJcbiAgICAgICAgICogYWN0aXZlIOODmuODvOOCuOOBqOOBneOBruS4oeerr+OBruODmuODvOOCuOOBjOWvvuixoVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHZpc2libGUgW2luXSB0cnVlOiDooajnpLogLyBmYWxzZTog6Z2e6KGo56S6XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25WaXNpYmlsaXR5Q2hhbmdlZCh2aXNpYmxlOiBib29sZWFuKTogdm9pZDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog44Oa44O844K444GM6KGo56S65a6M5LqG44GX44Gf44Go44GN44Gr44Kz44O844Or44GV44KM44KLXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25UYWJTZWxlY3RlZCgpOiB2b2lkO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDjg5rjg7zjgrjjgYzpnZ7ooajnpLrjgavliIfjgormm7/jgo/jgaPjgZ/jgajjgY3jgavjgrPjg7zjg6vjgZXjgozjgotcclxuICAgICAgICAgKi9cclxuICAgICAgICBvblRhYlJlbGVhc2VkKCk6IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOODieODqeODg+OCsOS4reOBq+OCs+ODvOODq+OBleOCjOOCi1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHBvc2l0aW9uIFtpbl0g54++5Zyo44GuIHRhYiBpbmRleFxyXG4gICAgICAgICAqIEBwYXJhbSBvZmZzZXQgICBbaW5dIOenu+WLlemHj1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uVGFiU2Nyb2xsaW5nKHBvc2l0aW9uOiBudW1iZXIsIG9mZnNldDogbnVtYmVyKTogdm9pZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBpbnRlcmZhY2UgVGFiVmlld0NvbnRleHRPcHRpb25zXHJcbiAgICAgKiBAYnJpZWYgVGFiVmlld0NvbnRleHQg44Gr5oyH5a6a44GZ44KL44Kq44OX44K344On44OzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGFiVmlld0NvbnRleHRPcHRpb25zPFRNb2RlbCBleHRlbmRzIE1vZGVsID0gTW9kZWw+IGV4dGVuZHMgTGlzdFZpZXdDb25zdHJ1Y3RPcHRpb25zPFRNb2RlbD4ge1xyXG4gICAgICAgIGRlbGF5UmVnaXN0ZXI/OiBib29sZWFuOyAgICAvLyDpgYXlu7bnmbvpjLLjgpLooYzjgYbloLTlkIjjga8gdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGludGVyZmFjZSBUYWJWaWV3Q29uc3RydWN0aW9uT3B0aW9uc1xyXG4gICAgICogQGJyaWVmIFRhYlZpZXcg44Gu44Kq44OX44K344On44OzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGFiVmlld0NvbnN0cnVjdGlvbk9wdGlvbnM8VE1vZGVsIGV4dGVuZHMgTW9kZWwgPSBNb2RlbD4gZXh0ZW5kcyBUYWJWaWV3Q29udGV4dE9wdGlvbnM8VE1vZGVsPiB7XHJcbiAgICAgICAgaG9zdDogVGFiSG9zdFZpZXc7ICAvLyBob3N0IOOCkuaMh+WumlxyXG4gICAgfVxyXG5cclxuICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJmYWNlIFRhYlZpZXdDb250ZXh0XHJcbiAgICAgKiBAYnJpZWYgSVRhYlZpZXcg44KS5Yid5pyf5YyW44GZ44KL44Gf44KB44Gu5oOF5aCx44KS5qC857SNXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGFiVmlld0NvbnRleHQ8VE1vZGVsIGV4dGVuZHMgTW9kZWwgPSBNb2RlbD4ge1xyXG4gICAgICAgIGN0b3I/OiBuZXcgKG9wdGlvbnM/OiBUYWJWaWV3Q29uc3RydWN0aW9uT3B0aW9uczxUTW9kZWw+KSA9PiBJVGFiVmlldzsgIC8vIElUYWJWaWV3IOOBruOCs+ODs+OCueODiOODqeOCr+OCv1xyXG4gICAgICAgIG9wdGlvbnM/OiBUYWJWaWV3Q29udGV4dE9wdGlvbnM8VE1vZGVsPjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOani+evieaZguOBruWfuuW6leOCquODl+OCt+ODp+ODs1xyXG4gICAgfVxyXG5cclxuICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJmYWNlIFRhYkhvc3RWaWV3Q29uc3RydWN0T3B0aW9uc1xyXG4gICAgICogQGJyaWVmIFRhYkhvc3RWaWV3IOOBruWIneacn+WMluaDheWgseOCkuagvOe0jeOBmeOCi+OCpOODs+OCv+ODvOODleOCp+OCpOOCueOCr+ODqeOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFRhYkhvc3RWaWV3Q29uc3RydWN0T3B0aW9uczxUTW9kZWwgZXh0ZW5kcyBNb2RlbCA9IE1vZGVsPiBleHRlbmRzIFBhZ2VDb250YWluZXJWaWV3T3B0aW9uczxUTW9kZWw+LCBGbGlwc25hcE9wdGlvbnMge1xyXG4gICAgICAgIGluYWN0aXZlVmlzaWJsZVRhYkRpc3RhbmNlPzogbnVtYmVyOyAgICAvLyDpnZ7pgbjmip7mmYLjga4gdmlzaWJsZSDjgr/jg5bmlbAgZXgpIDE6IOS4oeOCteOCpOODiVxyXG4gICAgICAgIHRhYkNvbnRleHRzPzogVGFiVmlld0NvbnRleHRbXTsgICAgICAgICAvLyBUYWJWaWV3Q29udGV4dCDjga7phY3liJdcclxuICAgICAgICBlbmFibGVCb3VuY2U/OiBib29sZWFuOyAgICAgICAgICAgICAgICAgLy8g57WC56uv44GnIGJvdW5jZSDjgZnjgovloLTlkIjjgavjga8gdHJ1ZVxyXG4gICAgICAgIGluaXRpYWxXaWR0aD86IG51bWJlcjsgICAgICAgICAgICAgICAgICAvLyB3aWR0aCDjga7liJ3mnJ/lgKRcclxuICAgICAgICBpbml0aWFsSGVpZ2h0PzogbnVtYmVyOyAgICAgICAgICAgICAgICAgLy8gaGVpZ2h0IOOBruWIneacn+WApFxyXG4gICAgICAgIGluaXRJbW1lZGlhdGU/OiBib29sZWFuOyAgICAgICAgICAgICAgICAvLyDjgrPjg7Pjgrnjg4jjg6njgq/jgr/jgacgVGFiVmlldyDjgpLliJ3mnJ/ljJbjgZnjgovloLTlkIggdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2xhc3MgVGFiSG9zdFZpZXdcclxuICAgICAqIEBicmllZiDjgr/jg5bliIfjgormm7/jgYjmqZ/og73jgpLmjIHjgaQgVmlldyDjgq/jg6njgrlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFRhYkhvc3RWaWV3PFRNb2RlbCBleHRlbmRzIE1vZGVsID0gTW9kZWw+IGV4dGVuZHMgUGFnZUNvbnRhaW5lclZpZXc8VE1vZGVsPiBpbXBsZW1lbnRzIElPcmllbnRhdGlvbkNoYW5nZWRMaXN0ZW5lciB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgX3RhYnM6IElUYWJWaWV3W10gPSBbXTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElUYWJWaWV3IOOCkuagvOe0jVxyXG5cclxuICAgICAgICBwcml2YXRlIF9hY3RpdmVUYWJJbmRleDogbnVtYmVyID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhY3RpdmUgdGFiXHJcbiAgICAgICAgcHJpdmF0ZSBfZmxpcHNuYXA6IElGbGlwc25hcCA9IG51bGw7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmxpcHNuYXAg44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgICAgcHJpdmF0ZSBfZmxpcEVuZEV2ZW50SGFuZGxlcjogKGV2ZW50OiBKUXVlcnkuRXZlbnQpID0+IHZvaWQgPSBudWxsOyAgICAgLy8gXCJmc3RvdWNoZW5kXCJcclxuICAgICAgICBwcml2YXRlIF9mbGlwTW92ZUV2ZW50SGFuZGxlcjogKGV2ZW50OiBKUXVlcnkuRXZlbnQpID0+IHZvaWQgPSBudWxsOyAgICAvLyBcImZzdG91Y2htb3ZlXCJcclxuICAgICAgICBwcml2YXRlIF9mbGlwRGVsdGFDYWNoZTogbnVtYmVyID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBcImZsaXAg6Led6Zui44Gu44Kt44Oj44OD44K344OlXCJcclxuICAgICAgICBwcml2YXRlIF9zY3JvbGxFbmRFdmVudEhhbmRsZXI6IChldmVudDogSlF1ZXJ5LkV2ZW50KSA9PiB2b2lkID0gbnVsbDsgICAvLyB0YWJ2aWV3IFwic2Nyb2xsc3RvcFwiXHJcbiAgICAgICAgcHJpdmF0ZSBfc2Nyb2xsTW92ZUV2ZW50SGFuZGxlcjogKGV2ZW50OiBKUXVlcnkuRXZlbnQpID0+IHZvaWQgPSBudWxsOyAgLy8gdGFidmlldyBcInNjcm9sbFwiXHJcbiAgICAgICAgcHJpdmF0ZSBfcmVmcmVzaFRpbWVySWQ6IG51bWJlciA9IG51bGw7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVmcmVzaCgpIOWPjeaYoOeiuuiqjeeUqFxyXG4gICAgICAgIHByaXZhdGUgX3NldHRpbmdzOiBUYWJIb3N0Vmlld0NvbnN0cnVjdE9wdGlvbnM8VE1vZGVsPjsgICAgICAgICAgICAgICAgIC8vIFRhYkhvc3RWaWV3IOioreWumuWApFxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIEVWRU5UX1NDUk9MTF9NT1ZFID0gXCJ0YWJob3N0OnNjcm9sbG1vdmVcIjtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIEVWRU5UX1NDUk9MTF9TVE9QID0gXCJ0YWJob3N0OnNjcm9sbHN0b3BcIjtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIEVWRU5UX1RBQl9NT1ZFICAgID0gXCJ0YWJob3N0OnRhYm1vdmVcIjtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIEVWRU5UX1RBQl9TVE9QICAgID0gXCJ0YWJob3N0OnRhdnN0b3BcIjtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29uc3RydWN0b3JcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBvcHRpb25zIFtpbl0g44Kq44OX44K344On44OzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczogVGFiSG9zdFZpZXdDb25zdHJ1Y3RPcHRpb25zPFRNb2RlbD4pIHtcclxuICAgICAgICAgICAgc3VwZXIob3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAvLyBjaGVjayBydW50aW1lIGNvbmRpdGlvblxyXG4gICAgICAgICAgICBpZiAobnVsbCA9PSBnbG9iYWwuRmxpcHNuYXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoVEFHICsgXCJmbGlwc25hcCBtb2R1bGUgZG9lc24ndCBsb2FkLlwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fc2V0dGluZ3MgPSAkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICAgICB0YWJDb250ZXh0czogW10sXHJcbiAgICAgICAgICAgICAgICB0YWJNb3ZlSGFuZGxlcjogKGRlbHRhOiBudW1iZXIpOiB2b2lkID0+IHsgLyogbm9vcCAqLyB9LFxyXG4gICAgICAgICAgICAgICAgdGFiU3RvcEhhbmRsZXI6IChuZXdJbmRleDogbnVtYmVyLCBtb3ZlZDogYm9vbGVhbik6IHZvaWQgPT4geyAvKiBub29wICovIH1cclxuICAgICAgICAgICAgfSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAvLyBzZXR1cCBldmVudCBoYW5kbGVyc1xyXG4gICAgICAgICAgICB0aGlzLl9mbGlwRW5kRXZlbnRIYW5kbGVyID0gKGV2ZW50OiBKUXVlcnkuRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZzRXZlbnQ6IGFueSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mbGlwRGVsdGFDYWNoZSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uVGFiQ2hhbmdlZChmc0V2ZW50Lm5ld1BvaW50LCBmc0V2ZW50Lm1vdmVkKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2ZsaXBNb3ZlRXZlbnRIYW5kbGVyID0gKGV2ZW50OiBKUXVlcnkuRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZzRXZlbnQ6IGFueSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mbGlwRGVsdGFDYWNoZSArPSBmc0V2ZW50LmRlbHRhO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGJvdW5jZSDjga7jgqzjg7zjg4lcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fc2V0dGluZ3MuZW5hYmxlQm91bmNlICYmIChcclxuICAgICAgICAgICAgICAgICAgICAoLTEgPT09IGZzRXZlbnQuZGlyZWN0aW9uICYmIDAgPT09IHRoaXMuX2FjdGl2ZVRhYkluZGV4ICYmIDAgPCB0aGlzLl9mbGlwRGVsdGFDYWNoZSkgfHxcclxuICAgICAgICAgICAgICAgICAgICAoMSA9PT0gZnNFdmVudC5kaXJlY3Rpb24gJiYgdGhpcy5fYWN0aXZlVGFiSW5kZXggPT09IHRoaXMuX3RhYnMubGVuZ3RoIC0gMSAmJiB0aGlzLl9mbGlwRGVsdGFDYWNoZSA8IDApXHJcbiAgICAgICAgICAgICAgICApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9mbGlwc25hcC5tb3ZlVG9Qb2ludChmc0V2ZW50Lm5ld1BvaW50KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblRhYk1vdmluZyhmc0V2ZW50LmRlbHRhKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl90YWJzLmZvckVhY2goKHRhYnZpZXc6IElUYWJWaWV3KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYnZpZXcub25UYWJTY3JvbGxpbmcodGhpcy5fYWN0aXZlVGFiSW5kZXgsIGZzRXZlbnQuZGVsdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJlcHJvY2Vzcyh0aGlzLl9hY3RpdmVUYWJJbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxFbmRFdmVudEhhbmRsZXIgPSAoZXZlbnQ6IEpRdWVyeS5FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vblNjcm9sbFN0b3AoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbE1vdmVFdmVudEhhbmRsZXIgPSAoZXZlbnQ6IEpRdWVyeS5FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vblNjcm9sbCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gc2V0dXAgdGFic1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fc2V0dGluZ3MuaW5pdGlhbFdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC53aWR0aCh0aGlzLl9zZXR0aW5ncy5pbml0aWFsV2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9zZXR0aW5ncy5pbml0aWFsSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5oZWlnaHQodGhpcy5fc2V0dGluZ3MuaW5pdGlhbEhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWxXaWR0aCAgPSB0aGlzLl9zZXR0aW5ncy5pbml0aWFsV2lkdGg7XHJcbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWxIZWlnaHQgPSB0aGlzLiRlbC5oZWlnaHQoKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHRhYkNvbnRleHRzID0gdGhpcy5fc2V0dGluZ3MudGFiQ29udGV4dHMuc2xpY2UoKTtcclxuICAgICAgICAgICAgaWYgKDAgPCB0YWJDb250ZXh0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRhYkNvbnRleHRzLmZvckVhY2goKGNvbnRleHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby11bnVzZWQtZXhwcmVzc2lvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBjb250ZXh0LmN0b3IoJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsSGVpZ2h0OiBpbml0aWFsSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sIGNvbnRleHQub3B0aW9ucywgeyBob3N0OiB0aGlzLCBkZWxheVJlZ2lzdGVyOiBmYWxzZSB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogdHNsaW50OmVuYWJsZTpuby11bnVzZWQtZXhwcmVzc2lvbiAqL1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJVGFiVmlldyDjgqTjg7Pjgrnjgr/jg7PjgrnljJbopoHmsYJcclxuICAgICAgICAgICAgICAgIHRoaXMub25UYWJWaWV3U2V0dXBSZXF1ZXN0KGluaXRpYWxIZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5fc2V0dGluZ3MuaW5pdEltbWVkaWF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplVGFiVmlld3MoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRmxpcHNuYXBcclxuICAgICAgICAgICAgdGhpcy5zZXRGbGlwc25hcENvbmRpdGlvbigkLmV4dGVuZCh7fSwge1xyXG4gICAgICAgICAgICAgICAgZGlzdGFuY2U6IGluaXRpYWxXaWR0aCxcclxuICAgICAgICAgICAgfSwgdGhpcy5fc2V0dGluZ3MpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVUYWIodGhpcy5fYWN0aXZlVGFiSW5kZXgsIDAsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6YWN5LiL44GuIFRhYlZpZXcg44KS5Yid5pyf5YyWXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGluaXRpYWxpemVUYWJWaWV3cygpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gSVRhYlZpZXcg44GrICR0YWJIb3N0IOOCkuOCouOCteOCpOODs+OBmeOCi1xyXG4gICAgICAgICAgICAvLyBOT1RFOiDnj77lnKjjga8gRE9NIOOBrumghuW6j+OBr+WbuuWumlxyXG4gICAgICAgICAgICBjb25zdCAkdGFicyA9IHRoaXMuJGVsLmZpbmQoX0NvbmZpZy5UQUJWSUVXX1NFTEVDVE9SKTtcclxuICAgICAgICAgICAgdGhpcy5fdGFicy5mb3JFYWNoKCh0YWJ2aWV3OiBJVGFiVmlldywgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRhYnZpZXcub25Jbml0aWFsaXplKHRoaXMsICQoJHRhYnNbaW5kZXhdKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog56C05qOE44Gu44OY44Or44OR44O86Zai5pWwXHJcbiAgICAgICAgICog44Oh44Oz44OQ44O844Gu56C05qOE44Gu44K/44Kk44Of44Oz44Kw44KS5aSJ44GI44KL5aC05ZCI44CB5pys44Oh44K944OD44OJ44KS44Kz44O844Or44GZ44KLXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRGbGlwc25hcENvbmRpdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLl90YWJzLmZvckVhY2goKHRhYnZpZXc6IElUYWJWaWV3KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0YWJ2aWV3Lm9uRGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5fdGFicyA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBGcmFtZXdvcmsgbWV0aG9kczpcclxuXHJcbiAgICAgICAgLy8g44Oa44O844K444Gu5Z+65rqW5YCk44KS5Y+W5b6XXHJcbiAgICAgICAgcHVibGljIGdldEJhc2VIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmhlaWdodCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFiVmlldyDjgpLnmbvpjLJcclxuICAgICAgICAgKiBGcmFtZXdvcmsg44GM5L2/55SoXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gdGFidmlldyBbaW5dIElUYWJWaWV3IOOBruOCpOODs+OCueOCv+ODs+OCuVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyByZWdpc3RlclRhYlZpZXcodGFidmlldzogSVRhYlZpZXcpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5nZXRUYWJJbmRleE9mKHRhYnZpZXcpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90YWJzLnB1c2godGFidmlldyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oVEFHICsgXCJ0YWIgaW5zdGFuY2UgYWxyZWFkeSByZWdpc3RlcmVkLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFiVmlldyDjga4gVGFiIGluZGV4IOOCkuWPluW+l1xyXG4gICAgICAgICAqIEZyYW1ld29yayDjgYzkvb/nlKhcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB0YWJ2aWV3IFtpbl0gSVRhYlZpZXcg44Gu44Kk44Oz44K544K/44Oz44K5XHJcbiAgICAgICAgICogQHJldHVybiDmjIflrprjgqTjg7Pjgrnjgr/jg7Pjgrnjga7jgqTjg7Pjg4fjg4Pjgq/jgrlcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0VGFiSW5kZXhPZih0YWJ2aWV3OiBJVGFiVmlldyk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBuID0gdGhpcy5fdGFicy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YWJ2aWV3ID09PSB0aGlzLl90YWJzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDjgr/jg5bjg53jgrjjgrfjg6fjg7Pjga7liJ3mnJ/ljJZcclxuICAgICAgICBwcm90ZWN0ZWQgcmVzZXRUYWJQb3NpdGlvbigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5fdGFicy5mb3JFYWNoKCh0YWJ2aWV3OiBJVGFiVmlldykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGFidmlldy5zY3JvbGxUbygwLCBmYWxzZSwgMCk7XHJcbiAgICAgICAgICAgICAgICB0YWJ2aWV3LnJlZnJlc2goKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlVGFiKDAsIDAsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSVRhYlZpZXcg6Kit5a6a44Oq44Kv44Ko44K544OI5pmC44Gr44Kz44O844Or44GV44KM44KLXHJcbiAgICAgICAgcHJvdGVjdGVkIG9uVGFiVmlld1NldHVwUmVxdWVzdChpbml0aWFsSGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gb3ZlcnJpZGVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gVGFiIGNvbnRyb2wgbWV0aG9kczpcclxuXHJcbiAgICAgICAgLy8g44Ki44Kv44OG44Kj44OWIFRhYiDjgpLoqK3lrppcclxuICAgICAgICBwdWJsaWMgc2V0QWN0aXZlVGFiKGluZGV4OiBudW1iZXIsIHRyYW5zaXRpb25EdXJhdGlvbj86IG51bWJlciwgaW5pdGlhbD86IGJvb2xlYW4pOiBib29sZWFuIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRUYWIoaW5kZXgpICYmIChpbml0aWFsIHx8ICh0aGlzLl9hY3RpdmVUYWJJbmRleCAhPT0gaW5kZXgpKSkge1xyXG4gICAgICAgICAgICAgICAgLy8g6YG356e75YmN44GrIHNjcm9sbCDkvY3nva7jga4gdmlldyDjgpLmm7TmlrBcclxuICAgICAgICAgICAgICAgIHRoaXMucHJlcHJvY2VzcyhpbmRleCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdEFjdGl2ZVRhYkluZGV4ID0gdGhpcy5fYWN0aXZlVGFiSW5kZXg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmVUYWJJbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZmxpcHNuYXAubW92ZVRvUG9pbnQodGhpcy5fYWN0aXZlVGFiSW5kZXgsIHRyYW5zaXRpb25EdXJhdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgey8vIOmBt+enu+W+jOOBqyBsaXN0dmlldyDjga7nirbmhYvjgpLlpInmm7RcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2VUYWIgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdHByb2Nlc3MobGFzdEFjdGl2ZVRhYkluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblRhYkNoYW5nZWQodGhpcy5fYWN0aXZlVGFiSW5kZXgsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb24gfHwgcGFyc2VJbnQodGhpcy5fZmxpcHNuYXAudHJhbnNpdGlvbkR1cmF0aW9uLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKDAgPT09IHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VUYWIoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZVRhYigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0cmFuc2l0aW9uRHVyYXRpb24gKiBfQ29uZmlnLlRBQkhPU1RfUkVGUkVTSF9DT0VGRik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOOCv+ODluOBruaVsOOCkuWPluW+l1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSDjgr/jg5bmlbBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0VGFiQ291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RhYnMubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g44Ki44Kv44OG44Kj44OW44Gq44K/44OWIEluZGV4IOOCkuWPluW+l1xyXG4gICAgICAgIHB1YmxpYyBnZXRBY3RpdmVUYWJJbmRleCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlVGFiSW5kZXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzd2lwZSDnp7vli5Xph4/jgpLlj5blvpcgKHN3aXBlIOS4reOBqyBkZWx0YSDjga7liqDnrpflgKTjgpLov5TljbQpXHJcbiAgICAgICAgcHVibGljIGdldFN3aXBlRGVsdGEoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZsaXBEZWx0YUNhY2hlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g44K/44OW56e75YuV44Kk44OZ44Oz44OIXHJcbiAgICAgICAgcHJvdGVjdGVkIG9uVGFiTW92aW5nKGRlbHRhOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFRhYkhvc3RWaWV3LkVWRU5UX1RBQl9NT1ZFLCBkZWx0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDjgr/jg5blpInmm7TlrozkuobjgqTjg5njg7Pjg4hcclxuICAgICAgICBwcm90ZWN0ZWQgb25UYWJDaGFuZ2VkKG5ld0luZGV4OiBudW1iZXIsIG1vdmVkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChtb3ZlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVUYWIobmV3SW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihUYWJIb3N0Vmlldy5FVkVOVF9UQUJfU1RPUCwgbmV3SW5kZXgsIG1vdmVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gU2Nyb2xsIGNvbnRyb2wgbWV0aG9kczpcclxuXHJcbiAgICAgICAgLy8g44K544Kv44Ot44O844Or5L2N572u44KS5Y+W5b6XXHJcbiAgICAgICAgZ2V0U2Nyb2xsUG9zKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9hY3RpdmVUYWJWaWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlVGFiVmlldy5nZXRTY3JvbGxQb3MoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6vkvY3nva7jga7mnIDlpKflgKTjgpLlj5blvpdcclxuICAgICAgICBnZXRTY3JvbGxQb3NNYXgoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2FjdGl2ZVRhYlZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY3RpdmVUYWJWaWV3LmdldFNjcm9sbFBvc01heCgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOOCueOCr+ODreODvOODq+S9jee9ruOCkuaMh+WumlxyXG4gICAgICAgIHNjcm9sbFRvKHBvczogbnVtYmVyLCBhbmltYXRlPzogYm9vbGVhbiwgdGltZT86IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fYWN0aXZlVGFiVmlldykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aXZlVGFiVmlldy5zY3JvbGxUbyhwb3MsIGFuaW1hdGUsIHRpbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6vjgqTjg5njg7Pjg4hcclxuICAgICAgICBwcm90ZWN0ZWQgb25TY3JvbGwoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihUYWJIb3N0Vmlldy5FVkVOVF9TQ1JPTExfTU9WRSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6vlrozkuobjgqTjg5njg7Pjg4hcclxuICAgICAgICBwcm90ZWN0ZWQgb25TY3JvbGxTdG9wKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoVGFiSG9zdFZpZXcuRVZFTlRfU0NST0xMX1NUT1ApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g44K544Kv44Ot44O844Or44Kk44OZ44Oz44OI44OP44Oz44OJ44Op6Kit5a6aL+ino+mZpFxyXG4gICAgICAgIHNldFNjcm9sbEhhbmRsZXIoaGFuZGxlcjogKGV2ZW50OiBKUXVlcnkuRXZlbnQpID0+IHZvaWQsIG9uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9hY3RpdmVUYWJWaWV3KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmVUYWJWaWV3LnNldFNjcm9sbEhhbmRsZXIoaGFuZGxlciwgb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6vntYLkuobjgqTjg5njg7Pjg4jjg4/jg7Pjg4njg6noqK3lrpov6Kej6ZmkXHJcbiAgICAgICAgc2V0U2Nyb2xsU3RvcEhhbmRsZXIoaGFuZGxlcjogKGV2ZW50OiBKUXVlcnkuRXZlbnQpID0+IHZvaWQsIG9uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9hY3RpdmVUYWJWaWV3KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmVUYWJWaWV3LnNldFNjcm9sbFN0b3BIYW5kbGVyKGhhbmRsZXIsIG9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gSG9zdCBldmVudCBob29rczpcclxuXHJcbiAgICAgICAgLy8gT3JpZW50YXRpb24g44Gu5aSJ5pu05qSc55+lXHJcbiAgICAgICAgb25PcmllbnRhdGlvbkNoYW5nZWQobmV3T3JpZW50YXRpb246IE9yaWVudGF0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLm9uT3JpZW50YXRpb25DaGFuZ2VkKG5ld09yaWVudGF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3RhYnMuZm9yRWFjaCgodGFidmlldzogSVRhYlZpZXcpID0+IHtcclxuICAgICAgICAgICAgICAgIHRhYnZpZXcub25PcmllbnRhdGlvbkNoYW5nZWQobmV3T3JpZW50YXRpb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMuX3JlZnJlc2hUaW1lcklkKSB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVmcmVzaFRpbWVySWQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5fZmxpcHNuYXAgJiYgMCA8IHRoaXMuX3RhYnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9jID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOODquODiOODqeOCpFxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9mbGlwc25hcCAmJiB0aGlzLl9mbGlwc25hcC5fbWF4UG9pbnQgIT09ICh0aGlzLl90YWJzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZsaXBzbmFwLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVmcmVzaFRpbWVySWQgPSBzZXRUaW1lb3V0KHByb2MsIF9Db25maWcuVEFCSE9TVF9SRUZSRVNIX0lOVEVSVkFMKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWZyZXNoVGltZXJJZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZsaXBzbmFwLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hUaW1lcklkID0gc2V0VGltZW91dChwcm9jLCBfQ29uZmlnLlRBQkhPU1RfUkVGUkVTSF9JTlRFUlZBTCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGpRTSBldmVudDogXCJwYWdlY29udGFpbmVyc2hvd1wiICjml6c6XCJwYWdlc2hvd1wiKSDjgavlr77lv5xcclxuICAgICAgICBvblBhZ2VTaG93KGV2ZW50OiBKUXVlcnkuRXZlbnQsIGRhdGE/OiBGcmFtZXdvcmsuU2hvd0V2ZW50RGF0YSk6IHZvaWQge1xyXG4gICAgICAgICAgICBzdXBlci5vblBhZ2VTaG93KGV2ZW50LCBkYXRhKTtcclxuICAgICAgICAgICAgdGhpcy5yZWJ1aWxkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIEltcGxlbWVudHM6IFNjcm9sbE1hbmFnZXIgUHJvZmlsZSDnrqHnkIZcclxuXHJcbiAgICAgICAgLy8g44Oa44O844K444Ki44K144Kk44Oz44KS5YaN5qeL5oiQXHJcbiAgICAgICAgcmVidWlsZCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5fdGFicy5mb3JFYWNoKCh0YWJ2aWV3OiBJVGFiVmlldykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhYnZpZXcubmVlZFJlYnVpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YWJ2aWV3LnJlYnVpbGQoKTtcclxuICAgICAgICAgICAgICAgICAgICB0YWJ2aWV3Lm5lZWRSZWJ1aWxkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBwcml2YXRlIG1ldGhvZHM6XHJcblxyXG4gICAgICAgIC8vIGZsaXBzbmFwIOeSsOWig+ioreWumlxyXG4gICAgICAgIHByaXZhdGUgc2V0RmxpcHNuYXBDb25kaXRpb24ob3B0aW9uczogRmxpcHNuYXBPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZsaXBzbmFwID0gZ2xvYmFsLkZsaXBzbmFwKF9Db25maWcuVEFCSE9TVF9TRUxFQ1RPUiwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICQodGhpcy5fZmxpcHNuYXAuZWxlbWVudCkub24oXCJmc3RvdWNoZW5kXCIsIHRoaXMuX2ZsaXBFbmRFdmVudEhhbmRsZXIuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgICQodGhpcy5fZmxpcHNuYXAuZWxlbWVudCkub24oXCJmc3RvdWNobW92ZVwiLCB0aGlzLl9mbGlwTW92ZUV2ZW50SGFuZGxlci5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZsaXBzbmFwIOeSsOWig+egtOajhFxyXG4gICAgICAgIHByaXZhdGUgcmVzZXRGbGlwc25hcENvbmRpdGlvbigpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2ZsaXBzbmFwKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMuX2ZsaXBzbmFwLmVsZW1lbnQpLm9mZihcImZzdG91Y2htb3ZlXCIsIHRoaXMuX2ZsaXBNb3ZlRXZlbnRIYW5kbGVyLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzLl9mbGlwc25hcC5lbGVtZW50KS5vZmYoXCJmc3RvdWNoZW5kXCIsIHRoaXMuX2ZsaXBFbmRFdmVudEhhbmRsZXIuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mbGlwc25hcC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mbGlwc25hcCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fZmxpcERlbHRhQ2FjaGUgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVGFiIOWIh+OCiuabv+OBiOOBruWJjeWHpueQhlxyXG4gICAgICAgIHByaXZhdGUgcHJlcHJvY2Vzcyh0b0luZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5fdGFicy5mb3JFYWNoKCh0YWJ2aWV3OiBJVGFiVmlldywgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gdGhpcy5fYWN0aXZlVGFiSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YWJ2aWV3LnRyZWF0U2Nyb2xsUG9zaXRpb24oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOenu+WLleevhOWbsuOCkuWPr+imluWMliBOT1RFOiBsb29wIOWvvuW/nOaZguOBq+adoeS7tuimi+ebtOOBl1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLl9hY3RpdmVUYWJJbmRleCA8IHRvSW5kZXggJiYgKHRoaXMuX2FjdGl2ZVRhYkluZGV4IDwgaW5kZXggJiYgaW5kZXggPD0gdG9JbmRleCkpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgKHRvSW5kZXggPCB0aGlzLl9hY3RpdmVUYWJJbmRleCAmJiAodG9JbmRleCA8PSBpbmRleCAmJiBpbmRleCA8IHRoaXMuX2FjdGl2ZVRhYkluZGV4KSlcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhYnZpZXcuJGVsLmNzcyhcInZpc2liaWxpdHlcIiwgXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRhYiDliIfjgormm7/jgYjjga7lvozlh6bnkIZcclxuICAgICAgICBwcml2YXRlIHBvc3Rwcm9jZXNzKGxhc3RBY3RpdmVUYWJJbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RhYnMuZm9yRWFjaCgodGFidmlldzogSVRhYlZpZXcsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVsbCAhPSB0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZVZpc2libGVUYWJEaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IGxvb3Ag5a++5b+c5pmC44Gr5p2h5Lu25a++5b+cXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLl9zZXR0aW5ncy5pbmFjdGl2ZVZpc2libGVUYWJEaXN0YW5jZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fYWN0aXZlVGFiSW5kZXggLSBkaXN0YW5jZSA8PSBpbmRleCAmJiBpbmRleCA8PSB0aGlzLl9hY3RpdmVUYWJJbmRleCArIGRpc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYnZpZXcuJGVsLmNzcyhcInZpc2liaWxpdHlcIiwgXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJ2aWV3Lm9uVmlzaWJpbGl0eUNoYW5nZWQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFidmlldy4kZWwuY3NzKFwidmlzaWJpbGl0eVwiLCBcImhpZGRlblwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFidmlldy5vblZpc2liaWxpdHlDaGFuZ2VkKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IHRoaXMuX2FjdGl2ZVRhYkluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFidmlldy5vblRhYlNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFidmlldy5zZXRTY3JvbGxIYW5kbGVyKHRoaXMuX3Njcm9sbE1vdmVFdmVudEhhbmRsZXIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRhYnZpZXcuc2V0U2Nyb2xsU3RvcEhhbmRsZXIodGhpcy5fc2Nyb2xsRW5kRXZlbnRIYW5kbGVyLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IGxhc3RBY3RpdmVUYWJJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhYnZpZXcuc2V0U2Nyb2xsSGFuZGxlcih0aGlzLl9zY3JvbGxNb3ZlRXZlbnRIYW5kbGVyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFidmlldy5zZXRTY3JvbGxTdG9wSGFuZGxlcih0aGlzLl9zY3JvbGxFbmRFdmVudEhhbmRsZXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB0YWJ2aWV3Lm9uVGFiUmVsZWFzZWQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUYWIgSW5kZXgg44KS5qSc6Ki8XHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZFRhYihpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmICgwID09PSB0aGlzLl90YWJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKDAgPD0gaW5kZXggJiYgaW5kZXggPCB0aGlzLl90YWJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFRBRyArIFwiaW52YWxpZCB0YWIgaW5kZXguIGluZGV4OiBcIiArIGluZGV4KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g44Ki44Kv44OG44Kj44OW44Gq44K/44OWIFNjcm9sbE1hbmFnZXIg44KS5Y+W5b6XXHJcbiAgICAgICAgcHJpdmF0ZSBnZXQgX2FjdGl2ZVRhYlZpZXcoKTogSVRhYlZpZXcge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGFic1t0aGlzLl9hY3RpdmVUYWJJbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBDRFAuVUkge1xyXG5cclxuICAgIGltcG9ydCBNb2RlbCA9IENEUC5GcmFtZXdvcmsuTW9kZWw7XHJcblxyXG4gICAgY29uc3QgVEFHID0gXCJbQ0RQLlVJLlRhYlZpZXddIFwiO1xyXG4gICAgY29uc3QgU1VQUFJFU1NfV0FSTklOR19JTklUSUFMX0hFSUdIVCA9IDE7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2xhc3MgVGFiVmlld1xyXG4gICAgICogQGJyaWVmIFRhYkhvc3RWaWV3IOOBq+OCouOCv+ODg+ODgeWPr+iDveOBqiBWaWV3IOOCr+ODqeOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVGFiVmlldzxUTW9kZWwgZXh0ZW5kcyBNb2RlbCA9IE1vZGVsPiBleHRlbmRzIExpc3RWaWV3PFRNb2RlbD4gaW1wbGVtZW50cyBJVGFiVmlldyB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgX2hvc3Q6IFRhYkhvc3RWaWV3ID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIF9uZWVkUmVidWlsZDogYm9vbGVhbiA9IGZhbHNlOyAgLy8g44Oa44O844K46KGo56S65pmC44GrIHJlYnVpbGQoKSDjgpLjgrPjg7zjg6vjgZnjgovjgZ/jgoHjga7lhoXpg6jlpInmlbBcclxuICAgICAgICBwcml2YXRlIF90YWJJbmRleDogbnVtYmVyOyAgICAgICAgICAgICAgLy8g6Ieq6Lqr44GuIFRhYiBJbmRleFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczogVGFiVmlld0NvbnN0cnVjdGlvbk9wdGlvbnM8VE1vZGVsPikge1xyXG4gICAgICAgICAgICBzdXBlcigkLmV4dGVuZCh7fSwgeyBpbml0aWFsSGVpZ2h0OiBTVVBQUkVTU19XQVJOSU5HX0lOSVRJQUxfSEVJR0hUIH0sIG9wdGlvbnMpKTtcclxuICAgICAgICAgICAgdGhpcy5faG9zdCA9IG9wdGlvbnMuaG9zdDtcclxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLmRlbGF5UmVnaXN0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hvc3QucmVnaXN0ZXJUYWJWaWV3KHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIEltcGxlbWVudHM6IElWaWV3UGFnZXIgcHJvcGVydGllcy5cclxuXHJcbiAgICAgICAgLy8gQmFzZVRhYlBhZ2VWaWV3IOOBq+OCouOCr+OCu+OCuVxyXG4gICAgICAgIHB1YmxpYyBnZXQgaG9zdCgpOiBUYWJIb3N0VmlldyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ob3N0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVidWlsZCDnirbmhYvjgbjjgqLjgq/jgrvjgrlcclxuICAgICAgICBwdWJsaWMgZ2V0IG5lZWRSZWJ1aWxkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbmVlZFJlYnVpbGQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZWJ1aWxkIOeKtuaFi+OCkuioreWumlxyXG4gICAgICAgIHB1YmxpYyBzZXQgbmVlZFJlYnVpbGQocmVidWlsZDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICB0aGlzLl9uZWVkUmVidWlsZCA9IHJlYnVpbGQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIEltcGxlbWVudHM6IElWaWV3UGFnZXIgRnJhbWV3b3JrLlxyXG5cclxuICAgICAgICAvLyDnirbmhYvjgavlv5zjgZjjgZ/jgrnjgq/jg63jg7zjg6vkvY3nva7jga7kv53lrZgv5b6p5YWDXHJcbiAgICAgICAgdHJlYXRTY3JvbGxQb3NpdGlvbigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5jb3JlLnRyZWF0U2Nyb2xsUG9zaXRpb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gSW1wbGVtZW50czogSVRhYlZpZXcgRXZlbnRzLlxyXG5cclxuICAgICAgICAvLyBTY3JvbGxlciDjga7liJ3mnJ/ljJbmmYLjgavjgrPjg7zjg6vjgZXjgozjgotcclxuICAgICAgICBvbkluaXRpYWxpemUoaG9zdDogVGFiSG9zdFZpZXcsICRyb290OiBKUXVlcnkpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5faG9zdCA9IGhvc3Q7XHJcbiAgICAgICAgICAgIHRoaXMuY29yZS5pbml0aWFsaXplKCRyb290LCBob3N0LmdldEJhc2VIZWlnaHQoKSk7XHJcbiAgICAgICAgICAgIEJhY2tib25lLlZpZXcucHJvdG90eXBlLnNldEVsZW1lbnQuY2FsbCh0aGlzLCAkcm9vdCwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTY3JvbGxlciDjga7noLTmo4TmmYLjgavjgrPjg7zjg6vjgZXjgozjgotcclxuICAgICAgICBvbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hvc3QgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdmlzaWJpbGl0eSDlsZ7mgKfjgYzlpInmm7TjgZXjgozjgZ/jgajjgY3jgavjgrPjg7zjg6vjgZXjgozjgotcclxuICAgICAgICBvblZpc2liaWxpdHlDaGFuZ2VkKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gb3ZlcnJpZGVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOODmuODvOOCuOOBjOihqOekuuWujOS6huOBl+OBn+OBqOOBjeOBq+OCs+ODvOODq+OBleOCjOOCi1xyXG4gICAgICAgIG9uVGFiU2VsZWN0ZWQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuY29yZS5zZXRBY3RpdmVTdGF0ZSh0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOODmuODvOOCuOOBjOmdnuihqOekuuOBq+WIh+OCiuabv+OCj+OBo+OBn+OBqOOBjeOBq+OCs+ODvOODq+OBleOCjOOCi1xyXG4gICAgICAgIG9uVGFiUmVsZWFzZWQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuY29yZS5zZXRBY3RpdmVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDjg4njg6njg4PjgrDkuK3jgavjgrPjg7zjg6vjgZXjgozjgotcclxuICAgICAgICBvblRhYlNjcm9sbGluZyhwb3NpdGlvbjogbnVtYmVyLCBvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBvdmVycmlkZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBJbXBsZW1lbnRzOiBJT3JpZW50YXRpb25DaGFuZ2VkTGlzdGVuZXIgZXZlbnRzLlxyXG5cclxuICAgICAgICAvLyBPcmllbnRhdGlvbiDjga7lpInmm7TjgpLlj5fkv6FcclxuICAgICAgICBvbk9yaWVudGF0aW9uQ2hhbmdlZChuZXdPcmllbnRhdGlvbjogRnJhbWV3b3JrLk9yaWVudGF0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIG92ZXJyaWRlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIE92ZXJyaWRlOiBJTGlzdFZpZXdcclxuXHJcbiAgICAgICAgLy8gY29yZSBmcmFtZXdvcmsgYWNjZXNzXHJcbiAgICAgICAgZ2V0IGNvcmUoKTogU2Nyb2xsTWFuYWdlciB7XHJcbiAgICAgICAgICAgIHJldHVybiAoPGFueT50aGlzKS5fc2Nyb2xsTWdyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBwcm90ZWN0ZWQgbWV0aG9kc1xyXG5cclxuICAgICAgICAvLyDoh6rouqvjga4gVGFiIEluZGV4IOOCkuWPluW+l1xyXG4gICAgICAgIHByb3RlY3RlZCBnZXQgdGFiSW5kZXgoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5fdGFiSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RhYkluZGV4ID0gdGhpcy5faG9zdC5nZXRUYWJJbmRleE9mKHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90YWJJbmRleDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOiHqui6q+OBjCBhY3RpdmUg44GL5Yik5a6aXHJcbiAgICAgICAgcHJvdGVjdGVkIGlzQWN0aXZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50YWJJbmRleCA9PT0gdGhpcy5faG9zdC5nZXRBY3RpdmVUYWJJbmRleCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKiB0c2xpbnQ6ZGlzYWJsZTptYXgtbGluZS1sZW5ndGggKi9cclxuXHJcbm5hbWVzcGFjZSBDRFAuVUkge1xyXG5cclxuICAgIGltcG9ydCBNb2RlbCA9IENEUC5GcmFtZXdvcmsuTW9kZWw7XHJcblxyXG4gICAgY29uc3QgVEFHID0gXCJbQ0RQLlVJLlBhZ2VMaXN0Vmlld10gXCI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJmYWNlIFBhZ2VMaXN0Vmlld0NvbnN0cnVjdE9wdGlvbnNcclxuICAgICAqIEBicmllZiBQYWdlTGlzdFZpZXcg44G444Gu5Yid5pyf5YyW5oOF5aCx44KS5qC857SN44GZ44KL44Kk44Oz44K/44O844OV44Kn44Kk44K544Kv44Op44K5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUGFnZUxpc3RWaWV3Q29uc3RydWN0T3B0aW9uczxUTW9kZWwgZXh0ZW5kcyBNb2RlbCA9IE1vZGVsPiBleHRlbmRzIExpc3RWaWV3T3B0aW9ucywgUGFnZVZpZXdDb25zdHJ1Y3RPcHRpb25zPFRNb2RlbD4ge1xyXG4gICAgICAgIGF1dG9EZXN0b3J5RWxlbWVudD86IGJvb2xlYW47ICAgICAgICAvLyE8IOODmuODvOOCuOmBt+enu+WJjeOBqyBMaXN0IEVsZW1lbnQg44KS56C05qOE44GZ44KL5aC05ZCI44GvIHRydWUg44KS5oyH5a6aXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2xhc3MgUGFnZUxpc3RWaWV3XHJcbiAgICAgKiBAYnJpZWYg5Luu5oOz44Oq44K544OI44OT44Ol44O85qmf6IO944KS5oyB44GkIFBhZ2VWaWV3IOOCr+ODqeOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgUGFnZUxpc3RWaWV3PFRNb2RlbCBleHRlbmRzIE1vZGVsID0gTW9kZWw+IGV4dGVuZHMgUGFnZVZpZXc8VE1vZGVsPiBpbXBsZW1lbnRzIElMaXN0VmlldyB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgX3Njcm9sbE1ncjogU2Nyb2xsTWFuYWdlciA9IG51bGw7ICAgIC8vITwgc2Nyb2xsIOOCs+OCouODreOCuOODg+OCr1xyXG4gICAgICAgIHByaXZhdGUgX25lZWRSZWJ1aWxkOiBib29sZWFuID0gZmFsc2U7ICAgICAgIC8vITwg44Oa44O844K46KGo56S65pmC44GrIHJlYnVpbGQoKSDjgpLjgrPjg7zjg6vjgZnjgovjgZ/jgoHjga7lhoXpg6jlpInmlbBcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29uc3RydWN0b3JcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB1cmwgICAgIHtTdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgICBbaW5dIHBhZ2UgdGVtcGxhdGUg44Gr5L2/55So44GZ44KLIFVSTFxyXG4gICAgICAgICAqIEBwYXJhbSBpZCAgICAgIHtTdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgICBbaW5dIHBhZ2Ug44Gr5oyv44KJ44KM44GfIElEXHJcbiAgICAgICAgICogQHBhcmFtIG9wdGlvbnMge1BhZ2VMaXN0Vmlld0NvbnN0cnVjdE9wdGlvbnN9IFtpbl0g44Kq44OX44K344On44OzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IodXJsOiBzdHJpbmcsIGlkOiBzdHJpbmcsIG9wdGlvbnM/OiBQYWdlTGlzdFZpZXdDb25zdHJ1Y3RPcHRpb25zPFRNb2RlbD4pIHtcclxuICAgICAgICAgICAgc3VwZXIodXJsLCBpZCwgJC5leHRlbmQoe30sIHtcclxuICAgICAgICAgICAgICAgIGF1dG9EZXN0b3J5RWxlbWVudDogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sIG9wdGlvbnMpKTtcclxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsTWdyID0gbmV3IFNjcm9sbE1hbmFnZXIob3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEgcmVidWlsZCgpIOOBruOCueOCseOCuOODpeODvOODquODs+OCsFxyXG4gICAgICAgIHB1YmxpYyByZXNlcnZlUmVidWlsZCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5fbmVlZFJlYnVpbGQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBPdmVycmlkZTogUGFnZVZpZXdcclxuXHJcbiAgICAgICAgLy8hIE9yaWVudGF0aW9uIOOBruWkieabtOaknOefpVxyXG4gICAgICAgIG9uT3JpZW50YXRpb25DaGFuZ2VkKG5ld09yaWVudGF0aW9uOiBGcmFtZXdvcmsuT3JpZW50YXRpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsTWdyLnNldEJhc2VIZWlnaHQodGhpcy5nZXRQYWdlQmFzZUhlaWdodCgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDjg5rjg7zjgrjpgbfnp7vnm7TliY3jgqTjg5njg7Pjg4jlh6bnkIZcclxuICAgICAgICBvbkJlZm9yZVJvdXRlQ2hhbmdlKCk6IElQcm9taXNlQmFzZTxhbnk+IHtcclxuICAgICAgICAgICAgaWYgKCg8UGFnZUxpc3RWaWV3Q29uc3RydWN0T3B0aW9uczxUTW9kZWw+PnRoaXMuX3BhZ2VPcHRpb25zKS5hdXRvRGVzdG9yeUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbE1nci5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLm9uQmVmb3JlUm91dGVDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISBqUU0gZXZlbnQ6IFwicGFnZWJlZm9yZXNob3dcIiDjgavlr77lv5xcclxuICAgICAgICBvblBhZ2VCZWZvcmVTaG93KGV2ZW50OiBKUXVlcnkuRXZlbnQsIGRhdGE/OiBGcmFtZXdvcmsuU2hvd0V2ZW50RGF0YSk6IHZvaWQge1xyXG4gICAgICAgICAgICBzdXBlci5vblBhZ2VCZWZvcmVTaG93KGV2ZW50LCBkYXRhKTtcclxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsTWdyLmluaXRpYWxpemUodGhpcy4kcGFnZSwgdGhpcy5nZXRQYWdlQmFzZUhlaWdodCgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISBqUU0gZXZlbnQ6IFwicGFnZWNvbnRhaW5lcnNob3dcIiAo5penOlwicGFnZXNob3dcIikg44Gr5a++5b+cXHJcbiAgICAgICAgb25QYWdlU2hvdyhldmVudDogSlF1ZXJ5LkV2ZW50LCBkYXRhPzogRnJhbWV3b3JrLlNob3dFdmVudERhdGEpOiB2b2lkIHtcclxuICAgICAgICAgICAgc3VwZXIub25QYWdlU2hvdyhldmVudCwgZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbE1nci5zZXRCYXNlSGVpZ2h0KHRoaXMuZ2V0UGFnZUJhc2VIZWlnaHQoKSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9uZWVkUmVidWlsZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWJ1aWxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9uZWVkUmVidWlsZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEgalFNIGV2ZW50OiBcInBhZ2VyZW1vdmVcIiDjgavlr77lv5xcclxuICAgICAgICBvblBhZ2VSZW1vdmUoZXZlbnQ6IEpRdWVyeS5FdmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICBzdXBlci5vblBhZ2VSZW1vdmUoZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbGVhc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gSW1wbGVtZW50czogSUxpc3RWaWV3IFByb2ZpbGUg566h55CGXHJcblxyXG4gICAgICAgIC8vISDliJ3mnJ/ljJbmuIjjgb/jgYvliKTlrppcclxuICAgICAgICBpc0luaXRpYWxpemVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2Nyb2xsTWdyLmlzSW5pdGlhbGl6ZWQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDjg5fjg63jg5Hjg4bjgqPjgpLmjIflrprjgZfjgabjgIFMaXN0SXRlbSDjgpLnrqHnkIZcclxuICAgICAgICBhZGRJdGVtKFxyXG4gICAgICAgICAgICBoZWlnaHQ6IG51bWJlcixcclxuICAgICAgICAgICAgaW5pdGlhbGl6ZXI6IG5ldyAob3B0aW9ucz86IGFueSkgPT4gQmFzZUxpc3RJdGVtVmlldyxcclxuICAgICAgICAgICAgaW5mbzogYW55LFxyXG4gICAgICAgICAgICBpbnNlcnRUbz86IG51bWJlclxyXG4gICAgICAgICAgICApOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkTGluZShuZXcgTGluZVByb2ZpbGUodGhpcy5fc2Nyb2xsTWdyLCBNYXRoLmZsb29yKGhlaWdodCksIGluaXRpYWxpemVyLCBpbmZvKSwgaW5zZXJ0VG8pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOaMh+WumuOBl+OBnyBJdGVtIOOCkuWJiumZpFxyXG4gICAgICAgIHJlbW92ZUl0ZW0oaW5kZXg6IG51bWJlciwgc2l6ZT86IG51bWJlciwgZGVsYXk/OiBudW1iZXIpOiB2b2lkO1xyXG4gICAgICAgIHJlbW92ZUl0ZW0oaW5kZXg6IG51bWJlcltdLCBkZWxheT86IG51bWJlcik6IHZvaWQ7XHJcbiAgICAgICAgcmVtb3ZlSXRlbShpbmRleDogYW55LCBhcmcyPzogbnVtYmVyLCBhcmczPzogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbE1nci5yZW1vdmVJdGVtKGluZGV4LCBhcmcyLCBhcmczKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDmjIflrprjgZfjgZ8gSXRlbSDjgavoqK3lrprjgZfjgZ/mg4XloLHjgpLlj5blvpdcclxuICAgICAgICBnZXRJdGVtSW5mbyh0YXJnZXQ6IG51bWJlcik6IGFueTtcclxuICAgICAgICBnZXRJdGVtSW5mbyh0YXJnZXQ6IEpRdWVyeS5FdmVudCk6IGFueTtcclxuICAgICAgICBnZXRJdGVtSW5mbyh0YXJnZXQ6IGFueSk6IGFueSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxNZ3IuZ2V0SXRlbUluZm8odGFyZ2V0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDjgqLjgq/jg4bjgqPjg5bjg5rjg7zjgrjjgpLmm7TmlrBcclxuICAgICAgICByZWZyZXNoKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxNZ3IucmVmcmVzaCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOacquOCouOCteOCpOODs+ODmuODvOOCuOOCkuani+eviVxyXG4gICAgICAgIHVwZGF0ZSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsTWdyLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOODmuODvOOCuOOCouOCteOCpOODs+OCkuWGjeani+aIkFxyXG4gICAgICAgIHJlYnVpbGQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbE1nci5yZWJ1aWxkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEg566h6L2E44OH44O844K/44KS56C05qOEXHJcbiAgICAgICAgcmVsZWFzZSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsTWdyLnJlbGVhc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gSW1wbGVtZW50czogSUxpc3RWaWV3IFByb2ZpbGUgQmFja3VwIC8gUmVzdG9yZVxyXG5cclxuICAgICAgICAvLyEg5YaF6YOo44OH44O844K/44KS44OQ44OD44Kv44Ki44OD44OXXHJcbiAgICAgICAgYmFja3VwKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxNZ3IuYmFja3VwKGtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEg5YaF6YOo44OH44O844K/44KS44Oq44K544OI44KiXHJcbiAgICAgICAgcmVzdG9yZShrZXk6IHN0cmluZywgcmVidWlsZDogYm9vbGVhbiA9IHRydWUpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgY29uc3QgcmV0dmFsID0gdGhpcy5fc2Nyb2xsTWdyLnJlc3RvcmUoa2V5LCByZWJ1aWxkKTtcclxuICAgICAgICAgICAgaWYgKHJldHZhbCAmJiAhcmVidWlsZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXNlcnZlUmVidWlsZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXR2YWw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEg44OQ44OD44Kv44Ki44OD44OX44OH44O844K/44Gu5pyJ54ShXHJcbiAgICAgICAgaGFzQmFja3VwKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxNZ3IuaGFzQmFja3VwKGtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEg44OQ44OD44Kv44Ki44OD44OX44OH44O844K/44Gu56C05qOEXHJcbiAgICAgICAgY2xlYXJCYWNrdXAoa2V5Pzogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxNZ3IuY2xlYXJCYWNrdXAoa2V5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDjg5Djg4Pjgq/jgqLjg4Pjg5fjg4fjg7zjgr/jgavjgqLjgq/jgrvjgrlcclxuICAgICAgICBnZXQgYmFja3VwRGF0YSgpOiBhbnkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2Nyb2xsTWdyLmJhY2t1cERhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIEltcGxlbWVudHM6IElMaXN0VmlldyBTY3JvbGxcclxuXHJcbiAgICAgICAgLy8hIOOCueOCr+ODreODvOODq+OCpOODmeODs+ODiOODj+ODs+ODieODqeioreWumi/op6PpmaRcclxuICAgICAgICBzZXRTY3JvbGxIYW5kbGVyKGhhbmRsZXI6IChldmVudDogSlF1ZXJ5LkV2ZW50KSA9PiB2b2lkLCBvbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxNZ3Iuc2V0U2Nyb2xsSGFuZGxlcihoYW5kbGVyLCBvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEg44K544Kv44Ot44O844Or57WC5LqG44Kk44OZ44Oz44OI44OP44Oz44OJ44Op6Kit5a6aL+ino+mZpFxyXG4gICAgICAgIHNldFNjcm9sbFN0b3BIYW5kbGVyKGhhbmRsZXI6IChldmVudDogSlF1ZXJ5LkV2ZW50KSA9PiB2b2lkLCBvbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxNZ3Iuc2V0U2Nyb2xsU3RvcEhhbmRsZXIoaGFuZGxlciwgb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOOCueOCr+ODreODvOODq+S9jee9ruOCkuWPluW+l1xyXG4gICAgICAgIGdldFNjcm9sbFBvcygpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2Nyb2xsTWdyLmdldFNjcm9sbFBvcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOOCueOCr+ODreODvOODq+S9jee9ruOBruacgOWkp+WApOOCkuWPluW+l1xyXG4gICAgICAgIGdldFNjcm9sbFBvc01heCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2Nyb2xsTWdyLmdldFNjcm9sbFBvc01heCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOOCueOCr+ODreODvOODq+S9jee9ruOCkuaMh+WumlxyXG4gICAgICAgIHNjcm9sbFRvKHBvczogbnVtYmVyLCBhbmltYXRlPzogYm9vbGVhbiwgdGltZT86IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxNZ3Iuc2Nyb2xsVG8ocG9zLCBhbmltYXRlLCB0aW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDmjIflrprjgZXjgozjgZ8gTGlzdEl0ZW1WaWV3IOOBruihqOekuuOCkuS/neiovFxyXG4gICAgICAgIGVuc3VyZVZpc2libGUoaW5kZXg6IG51bWJlciwgb3B0aW9ucz86IEVuc3VyZVZpc2libGVPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbE1nci5lbnN1cmVWaXNpYmxlKGluZGV4LCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gSW1wbGVtZW50czogSUxpc3RWaWV3IFByb3BlcnRpZXNcclxuXHJcbiAgICAgICAgLy8hIGNvcmUgZnJhbWV3b3JrIGFjY2Vzc1xyXG4gICAgICAgIGdldCBjb3JlKCk6IElMaXN0Vmlld0ZyYW1ld29yayB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxNZ3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIEltcGxlbWVudHM6IElMaXN0VmlldyBJbnRlcm5hbCBJL0ZcclxuXHJcbiAgICAgICAgLy8hIOeZu+mMsiBmcmFtZXdvcmsg44GM5L2/55So44GZ44KLXHJcbiAgICAgICAgX2FkZExpbmUoX2xpbmU6IGFueSwgaW5zZXJ0VG8/OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsTWdyLl9hZGRMaW5lKF9saW5lLCBpbnNlcnRUbyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIHByaXZhdGUgbWV0aG9kOlxyXG5cclxuICAgICAgICAvLyEg44Oa44O844K444Gu5Z+65rqW5YCk44KS5Y+W5b6XXHJcbiAgICAgICAgcHJpdmF0ZSBnZXRQYWdlQmFzZUhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gJCh3aW5kb3cpLmhlaWdodCgpIC0gcGFyc2VJbnQodGhpcy4kcGFnZS5jc3MoXCJwYWRkaW5nLXRvcFwiKSwgMTApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgQ0RQLlVJIHtcclxuXHJcbiAgICBpbXBvcnQgTW9kZWwgPSBDRFAuRnJhbWV3b3JrLk1vZGVsO1xyXG5cclxuICAgIGNvbnN0IFRBRyA9IFwiW0NEUC5VSS5QYWdlRXhwYW5kYWJsZUxpc3RWaWV3XSBcIjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBjbGFzcyBQYWdlRXhwYW5kYWJsZUxpc3RWaWV3XHJcbiAgICAgKiBAYnJpZWYg6ZaL6ZaJ44Oq44K544OI44OT44Ol44O85qmf6IO944KS5oyB44GkIFBhZ2VWaWV3IOOCr+ODqeOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgUGFnZUV4cGFuZGFibGVMaXN0VmlldzxUTW9kZWwgZXh0ZW5kcyBNb2RlbCA9IE1vZGVsPiBleHRlbmRzIFBhZ2VMaXN0VmlldzxUTW9kZWw+IGltcGxlbWVudHMgSUV4cGFuZGFibGVMaXN0VmlldyB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgX2V4cGFuZE1hbmFnZXI6IEV4cGFuZE1hbmFnZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHVybCAgICAge1N0cmluZ30gICAgICAgICAgICAgICAgICAgICAgIFtpbl0gcGFnZSB0ZW1wbGF0ZSDjgavkvb/nlKjjgZnjgosgVVJMXHJcbiAgICAgICAgICogQHBhcmFtIGlkICAgICAge1N0cmluZ30gICAgICAgICAgICAgICAgICAgICAgIFtpbl0gcGFnZSDjgavmjK/jgonjgozjgZ8gSURcclxuICAgICAgICAgKiBAcGFyYW0gb3B0aW9ucyB7UGFnZUxpc3RWaWV3Q29uc3RydWN0T3B0aW9uc30gW2luXSDjgqrjg5fjgrfjg6fjg7NcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZywgaWQ6IHN0cmluZywgb3B0aW9ucz86IFBhZ2VMaXN0Vmlld0NvbnN0cnVjdE9wdGlvbnM8VE1vZGVsPikge1xyXG4gICAgICAgICAgICBzdXBlcih1cmwsIGlkLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5fZXhwYW5kTWFuYWdlciA9IG5ldyBFeHBhbmRNYW5hZ2VyKHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBJbXBsZW1lbnRzOiBJRXhwYW5kYWJsZUxpc3RWaWV3XHJcblxyXG4gICAgICAgIC8vISDmlrDopo8gR3JvdXBQcm9maWxlIOOCkuS9nOaIkFxyXG4gICAgICAgIG5ld0dyb3VwKGlkPzogc3RyaW5nKTogR3JvdXBQcm9maWxlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2V4cGFuZE1hbmFnZXIubmV3R3JvdXAoaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOeZu+mMsua4iOOBvyBHcm91cCDjgpLlj5blvpdcclxuICAgICAgICBnZXRHcm91cChpZDogc3RyaW5nKTogR3JvdXBQcm9maWxlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2V4cGFuZE1hbmFnZXIuZ2V0R3JvdXAoaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOesrDHpmo7lsaTjga4gR3JvdXAg55m76YyyXHJcbiAgICAgICAgcmVnaXN0ZXJUb3BHcm91cCh0b3BHcm91cDogR3JvdXBQcm9maWxlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuX2V4cGFuZE1hbmFnZXIucmVnaXN0ZXJUb3BHcm91cCh0b3BHcm91cCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEg56ysMemajuWxpOOBriBHcm91cCDjgpLlj5blvpdcclxuICAgICAgICBnZXRUb3BHcm91cHMoKTogR3JvdXBQcm9maWxlW10ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXhwYW5kTWFuYWdlci5nZXRUb3BHcm91cHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDjgZnjgbnjgabjga7jgrDjg6vjg7zjg5fjgpLlsZXplosgKDHpmo7lsaQpXHJcbiAgICAgICAgZXhwYW5kQWxsKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLl9leHBhbmRNYW5hZ2VyLmV4cGFuZEFsbCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOOBmeOBueOBpuOBruOCsOODq+ODvOODl+OCkuWPjuadnyAoMemajuWxpClcclxuICAgICAgICBjb2xsYXBzZUFsbChkZWxheT86IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLl9leHBhbmRNYW5hZ2VyLmNvbGxhcHNlQWxsKGRlbGF5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDlsZXplovkuK3jgYvliKTlrppcclxuICAgICAgICBpc0V4cGFuZGluZygpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2V4cGFuZE1hbmFnZXIuaXNFeHBhbmRpbmcoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDlj47mnZ/kuK3jgYvliKTlrppcclxuICAgICAgICBpc0NvbGxhcHNpbmcoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9leHBhbmRNYW5hZ2VyLmlzQ29sbGFwc2luZygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOmWi+mWieS4reOBi+WIpOWumlxyXG4gICAgICAgIGlzU3dpdGNoaW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXhwYW5kTWFuYWdlci5pc1N3aXRjaGluZygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIGxheW91dCBrZXkg44KS5Y+W5b6XXHJcbiAgICAgICAgZ2V0IGxheW91dEtleSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXhwYW5kTWFuYWdlci5sYXlvdXRLZXk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyEgbGF5b3V0IGtleSDjgpLoqK3lrppcclxuICAgICAgICBzZXQgbGF5b3V0S2V5KGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2V4cGFuZE1hbmFnZXIubGF5b3V0S2V5ID0ga2V5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBPdmVycmlkZTogUGFnZUxpc3RWaWV3XHJcblxyXG4gICAgICAgIC8vISDjg4fjg7zjgr/jgpLnoLTmo4RcclxuICAgICAgICByZWxlYXNlKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBzdXBlci5yZWxlYXNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2V4cGFuZE1hbmFnZXIucmVsZWFzZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8hIOWGhemDqOODh+ODvOOCv+OCkuODkOODg+OCr+OCouODg+ODl1xyXG4gICAgICAgIGJhY2t1cChrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXhwYW5kTWFuYWdlci5iYWNrdXAoa2V5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vISDlhoXpg6jjg4fjg7zjgr/jgpLjg6rjgrnjg4jjgqJcclxuICAgICAgICByZXN0b3JlKGtleTogc3RyaW5nLCByZWJ1aWxkOiBib29sZWFuID0gdHJ1ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXhwYW5kTWFuYWdlci5yZXN0b3JlKGtleSwgcmVidWlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBqUXVlcnkgcGx1Z2luIGRlZmluaXRpb25cclxuICovXHJcbmludGVyZmFjZSBKUXVlcnkge1xyXG4gICAgcmlwcGxlKG9wdGlvbnM/OiBDRFAuVUkuRG9tRXh0ZW5zaW9uT3B0aW9ucyk6IEpRdWVyeTtcclxufVxyXG5cclxubmFtZXNwYWNlIENEUC5VSS5FeHRlbnNpb24ge1xyXG5cclxuICAgIGltcG9ydCBGcmFtZXdvcmsgPSBDRFAuRnJhbWV3b3JrO1xyXG5cclxuICAgIC8vIGpRdWVyeSBwbHVnaW5cclxuICAgICQuZm4ucmlwcGxlID0gZnVuY3Rpb24gKG9wdGlvbnM/OiBEb21FeHRlbnNpb25PcHRpb25zKTogSlF1ZXJ5IHtcclxuICAgICAgICBjb25zdCAkZWwgPSAkKHRoaXMpO1xyXG4gICAgICAgIGlmICgkZWwubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICRlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICRlbC5vbihGcmFtZXdvcmsuUGF0Y2guc192Y2xpY2tFdmVudCwgZnVuY3Rpb24gKGV2ZW50OiBKUXVlcnkuRXZlbnQpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3VyZmFjZSA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAvLyBjcmVhdGUgc3VyZmFjZSBpZiBpdCBkb2Vzbid0IGV4aXN0XHJcbiAgICAgICAgICAgIGlmIChzdXJmYWNlLmZpbmQoXCIudWktcmlwcGxlLWlua1wiKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHN1cmZhY2UucHJlcGVuZChcIjxkaXYgY2xhc3M9J3VpLXJpcHBsZS1pbmsnPjwvZGl2PlwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGluayA9IHN1cmZhY2UuZmluZChcIi51aS1yaXBwbGUtaW5rXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gc3RvcCB0aGUgcHJldmlvdXMgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgIGluay5yZW1vdmVDbGFzcyhcInVpLXJpcHBsZS1hbmltYXRlXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gaW5rIHNpemU6XHJcbiAgICAgICAgICAgIGlmICghaW5rLmhlaWdodCgpICYmICFpbmsud2lkdGgoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IE1hdGgubWF4KHN1cmZhY2Uub3V0ZXJXaWR0aCgpLCBzdXJmYWNlLm91dGVySGVpZ2h0KCkpO1xyXG4gICAgICAgICAgICAgICAgaW5rLmNzcyh7IGhlaWdodDogZCwgd2lkdGg6IGQgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBldmVudC5wYWdlWCAtIHN1cmZhY2Uub2Zmc2V0KCkubGVmdCAtIChpbmsud2lkdGgoKSAvIDIpO1xyXG4gICAgICAgICAgICBjb25zdCB5ID0gZXZlbnQucGFnZVkgLSBzdXJmYWNlLm9mZnNldCgpLnRvcCAtIChpbmsuaGVpZ2h0KCkgLyAyKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJpcHBsZUNvbG9yID0gc3VyZmFjZS5kYXRhKFwicmlwcGxlLWNvbG9yXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gYW5pbWF0aW9uIGVuZCBoYW5kbGVyXHJcbiAgICAgICAgICAgIGNvbnN0IEFOSU1BVElPTl9FTkRfRVZFTlQgPSBcImFuaW1hdGlvbmVuZCB3ZWJraXRBbmltYXRpb25FbmRcIjtcclxuICAgICAgICAgICAgaW5rLm9uKEFOSU1BVElPTl9FTkRfRVZFTlQsIGZ1bmN0aW9uIChldjogSlF1ZXJ5LkV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpbmsub2ZmKCk7XHJcbiAgICAgICAgICAgICAgICBpbmsucmVtb3ZlQ2xhc3MoXCJ1aS1yaXBwbGUtYW5pbWF0ZVwiKTtcclxuICAgICAgICAgICAgICAgIGluayA9IG51bGw7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gc2V0IHRoZSBwb3NpdGlvbiBhbmQgYWRkIGNsYXNzIC5hbmltYXRlXHJcbiAgICAgICAgICAgIGluay5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wOiB5ICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogeCArIFwicHhcIixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHJpcHBsZUNvbG9yXHJcbiAgICAgICAgICAgIH0pLmFkZENsYXNzKFwidWktcmlwcGxlLWFuaW1hdGVcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWF0ZXJpYWwgRGVzaWduIFJpcHBsZSDmi6HlvLVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gICAgICAgICAgICAgICR1aSAgICAgICBbaW5dIOaknOe0ouWvvuixoeOBriBqUXVlcnkg44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgKiBAcGFyYW0ge0RvbUV4dGVuc2lvbk9wdGlvbnN9IFtvcHRpb25zXSBbaW5dIOOCquODl+OCt+ODp+ODs1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBhcHBseURvbUV4dGVuc2lvbigkdWk6IEpRdWVyeSwgb3B0aW9ucz86IERvbUV4dGVuc2lvbk9wdGlvbnMpOiBKUXVlcnkge1xyXG4gICAgICAgIGNvbnN0IE5PX1JJUFBMRV9DTEFTUyA9IFtcclxuICAgICAgICAgICAgXCIudWktcmlwcGxlLW5vbmVcIixcclxuICAgICAgICAgICAgXCIudWktZmxpcHN3aXRjaC1vblwiLFxyXG4gICAgICAgICAgICBcIi51aS1zbGlkZXItaGFuZGxlXCIsXHJcbiAgICAgICAgICAgIFwiLnVpLWlucHV0LWNsZWFyXCIsXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gXCIudWktYnRuXCI7XHJcbiAgICAgICAgaWYgKCR1aS5oYXNDbGFzcyhcInVpLXBhZ2VcIikpIHtcclxuICAgICAgICAgICAgc2VsZWN0b3IgPSBcIi51aS1jb250ZW50IC51aS1idG5cIjsgLy8gaGVhZGVyIOOBr+iHquWLlSByaXBwbGUg5YyW5a++6LGh5aSWXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkdWkuZmluZChzZWxlY3RvcilcclxuICAgICAgICAgICAgLmZpbHRlcigoaW5kZXgsIGVsZW0pID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0ICRlbGVtID0gJChlbGVtKTtcclxuICAgICAgICAgICAgICAgIGlmICgkZWxlbS5pcyhOT19SSVBQTEVfQ0xBU1Muam9pbihcIixcIikpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmFkZENsYXNzKFwidWktcmlwcGxlXCIpO1xyXG5cclxuICAgICAgICAvLyByaXBwbGlmeVxyXG4gICAgICAgICR1aS5maW5kKFwiLnVpLXJpcHBsZVwiKVxyXG4gICAgICAgICAgICAuZWFjaCgoaW5kZXg6IG51bWJlciwgZWxlbTogRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJChlbGVtKS5yaXBwbGUob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiAkdWk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g55m76YyyXHJcbiAgICBFeHRlbnNpb25NYW5hZ2VyLnJlZ2lzdGVyRG9tRXh0ZW5zaW9uKGFwcGx5RG9tRXh0ZW5zaW9uKTtcclxufVxyXG4iLCIvKipcclxuICogalF1ZXJ5IHBsdWdpbiBkZWZpbml0aW9uXHJcbiAqL1xyXG5pbnRlcmZhY2UgSlF1ZXJ5IHtcclxuICAgIHNwaW5uZXIob3B0aW9ucz86IENEUC5VSS5Eb21FeHRlbnNpb25PcHRpb25zIHwgXCJyZWZyZXNoXCIpOiBKUXVlcnk7XHJcbn1cclxuXHJcbm5hbWVzcGFjZSBDRFAuVUkuRXh0ZW5zaW9uIHtcclxuXHJcbiAgICBpbXBvcnQgVGVtcGxhdGUgPSBDRFAuVG9vbHMuVGVtcGxhdGU7XHJcbiAgICBpbXBvcnQgSlNUICAgICAgPSBDRFAuVG9vbHMuSlNUO1xyXG5cclxuICAgIGxldCBfdGVtcGxhdGU6IEpTVDtcclxuXHJcbiAgICAvLyBqUXVlcnkgcGx1Z2luXHJcbiAgICAkLmZuLnNwaW5uZXIgPSBmdW5jdGlvbiAob3B0aW9ucz86IERvbUV4dGVuc2lvbk9wdGlvbnMgfCBcInJlZnJlc2hcIikge1xyXG4gICAgICAgIGlmIChcInN0cmluZ1wiID09PSB0eXBlb2Ygb3B0aW9ucykge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVmcmVzaCgkKHRoaXMpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gc3Bpbm5lcmlmeSgkKHRoaXMpLCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHNwaW5uZXJpZnkoJHRhcmdldDogSlF1ZXJ5LCBvcHRpb25zPzogRG9tRXh0ZW5zaW9uT3B0aW9ucyk6IEpRdWVyeSB7XHJcbiAgICAgICAgaWYgKCR0YXJnZXQubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICR0YXJnZXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIV90ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBfdGVtcGxhdGUgPSBUZW1wbGF0ZS5nZXRKU1QoYFxyXG4gICAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPVwidGV4dC90ZW1wbGF0ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidWktc3Bpbm5lci1iYXNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidWktc3Bpbm5lci1pbm5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1aS1zcGlubmVyLWlubmVyLWdhcFwiIHt7Ym9yZGVyVG9wfX0+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1aS1zcGlubmVyLWlubmVyLWxlZnRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInVpLXNwaW5uZXItaW5uZXItaGFsZi1jaXJjbGVcIiB7e2JvcmRlcn19Pjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidWktc3Bpbm5lci1pbm5lci1yaWdodFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidWktc3Bpbm5lci1pbm5lci1oYWxmLWNpcmNsZVwiIHt7Ym9yZGVyfX0+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9zY3JpcHQ+XHJcbiAgICAgICAgICAgIGApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWFrZVRlbXBsYXRlUGFyYW0gPSAoY2xyOiBzdHJpbmcpOiBvYmplY3QgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYm9yZGVyVG9wOiBcInN0eWxlPWJvcmRlci10b3AtY29sb3I6XCIgKyBjbHIgKyBcIjtcIixcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogXCJzdHlsZT1ib3JkZXItY29sb3I6XCIgKyBjbHIgKyBcIjtcIixcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBjb2xvciA9ICR0YXJnZXQuZGF0YShcInNwaW5uZXItY29sb3JcIik7XHJcbiAgICAgICAgbGV0IHBhcmFtID0gbnVsbDtcclxuICAgICAgICBpZiAoY29sb3IpIHtcclxuICAgICAgICAgICAgJHRhcmdldC5jc3MoeyBcImJhY2tncm91bmQtY29sb3JcIjogY29sb3IgfSk7XHJcbiAgICAgICAgICAgIHBhcmFtID0gbWFrZVRlbXBsYXRlUGFyYW0oY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkdGFyZ2V0LmFwcGVuZChfdGVtcGxhdGUocGFyYW0pKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlZnJlc2goJHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaU9TIDEwLjIrIFNWRyBTTUlMIOOCouODi+ODoeODvOOCt+ODp+ODs+OBjCAy5Zue55uu5Lul6ZmN5YuV44GL44Gq44GE5ZWP6aGM44Gu5a++562WXHJcbiAgICAvLyBkYXRhOmltYWdlL3N2Zyt4bWw7PGNhY2hlIGJ1c3Qgc3RyaW5nPjtiYXNlNjQsLi4uIOOBqOOBmeOCi+OBk+OBqOOBpyBkYXRhLXVybCDjgavjgoIgY2FjaGUgYnVzdGluZyDjgYzmnInlirnjgavjgarjgotcclxuICAgIGZ1bmN0aW9uIHJlZnJlc2goJHRhcmdldDogSlF1ZXJ5KTogSlF1ZXJ5IHtcclxuICAgICAgICBjb25zdCBQUkVGSVggPSBbXCItd2Via2l0LVwiLCBcIlwiXTtcclxuXHJcbiAgICAgICAgY29uc3QgdmFsaWQgPSAocHJvcCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKHByb3AgJiYgXCJub25lXCIgIT09IHByb3ApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBkYXRhVXJsOiBzdHJpbmc7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIG4gPSBQUkVGSVgubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICghdmFsaWQoZGF0YVVybCkpIHtcclxuICAgICAgICAgICAgICAgIGRhdGFVcmwgPSAkdGFyZ2V0LmNzcyhQUkVGSVhbaV0gKyBcIm1hc2staW1hZ2VcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsaWQoZGF0YVVybCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpT1Mg44Gn44GvIHVybChkYXRhKioqKTsg5YaF44GrICdcIicg44Gv5YWl44KJ44Gq44GEXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBkYXRhVXJsLm1hdGNoKC8odXJsXFwoZGF0YTppbWFnZVxcL3N2Z1xcK3htbDspKFtcXHNcXFNdKik/KGJhc2U2NCxbXFxzXFxTXSpcXCkpLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFVcmwgPSBgJHttYXRjaFsxXX1idXN0PSR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9OyR7bWF0Y2hbM119YDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVXJsID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZhbGlkKGRhdGFVcmwpKSB7XHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmNzcyhQUkVGSVhbaV0gKyBcIm1hc2staW1hZ2VcIiwgZGF0YVVybCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAkdGFyZ2V0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWF0ZXJpYWwgRGVzaWduIFNwaW5uZXIg5ouh5by1XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICAgICAgICAgICAgICAkdWkgICAgICAgW2luXSDmpJzntKLlr77osaHjga4galF1ZXJ5IOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICogQHBhcmFtIHtEb21FeHRlbnNpb25PcHRpb25zfSBbb3B0aW9uc10gW2luXSDjgqrjg5fjgrfjg6fjg7NcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYXBwbHlEb21FeHRlbnNpb24oJHVpOiBKUXVlcnksIG9wdGlvbnM/OiBEb21FeHRlbnNpb25PcHRpb25zKTogSlF1ZXJ5IHtcclxuICAgICAgICAkdWkuZmluZChcIi51aS1zcGlubmVyLCAudWktaWNvbi1sb2FkaW5nXCIpXHJcbiAgICAgICAgICAgIC5lYWNoKChpbmRleDogbnVtYmVyLCBlbGVtOiBFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkKGVsZW0pLnNwaW5uZXIob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiAkdWk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g55m76YyyXHJcbiAgICBFeHRlbnNpb25NYW5hZ2VyLnJlZ2lzdGVyRG9tRXh0ZW5zaW9uKGFwcGx5RG9tRXh0ZW5zaW9uKTtcclxufVxyXG4iLCJuYW1lc3BhY2UgQ0RQLlVJLkV4dGVuc2lvbiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXh0IElucHV0IOeUqCBGbG9hdGluZyBMYWJlbCDmi6HlvLVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gICAgICAgICAgICAgICR1aSAgICAgICBbaW5dIOaknOe0ouWvvuixoeOBriBqUXVlcnkg44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgKiBAcGFyYW0ge0RvbUV4dGVuc2lvbk9wdGlvbnN9IFtvcHRpb25zXSBbaW5dIOOCquODl+OCt+ODp+ODs1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBhcHBseURvbUV4dGVuc2lvbigkdWk6IEpRdWVyeSwgb3B0aW9ucz86IERvbUV4dGVuc2lvbk9wdGlvbnMpOiBKUXVlcnkge1xyXG4gICAgICAgIGNvbnN0IHVwZGF0ZSA9IChlbGVtOiBFbGVtZW50LCBmbG9hdGluZzogYm9vbGVhbikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCAkZWxlbSA9ICQoZWxlbSk7XHJcbiAgICAgICAgICAgIGlmIChmbG9hdGluZykge1xyXG4gICAgICAgICAgICAgICAgJGVsZW0uYWRkQ2xhc3MoXCJ1aS1mbG9hdC1sYWJlbC1mbG9hdGluZ1wiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRlbGVtLnJlbW92ZUNsYXNzKFwidWktZmxvYXQtbGFiZWwtZmxvYXRpbmdcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBmbG9hdGluZ2lmeSA9IChlbGVtOiBFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gJChlbGVtKS5hdHRyKFwiZm9yXCIpO1xyXG4gICAgICAgICAgICBjb25zdCAkaW5wdXQgPSAkdWkuZmluZChcIiNcIiArIGlkKTtcclxuICAgICAgICAgICAgaWYgKFwic2VhcmNoXCIgPT09ICRpbnB1dC5qcW1EYXRhKFwidHlwZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgJChlbGVtKS5hZGRDbGFzcyhcInVpLWZsb2F0LWxhYmVsLWhhcy1pY29uXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVwZGF0ZShlbGVtLCAhISRpbnB1dC52YWwoKSk7XHJcbiAgICAgICAgICAgICRpbnB1dC5vbihcImtleXVwIGNoYW5nZSBpbnB1dCBmb2N1cyBibHVyIGN1dCBwYXN0ZVwiLCAoZXZlbnQ6IEpRdWVyeS5FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlKGVsZW0sICEhJChldmVudC50YXJnZXQpLnZhbCgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHVpLmZpbmQoXCJsYWJlbC51aS1mbG9hdC1sYWJlbCwgLnVpLWZsb2F0LWxhYmVsIGxhYmVsXCIpXHJcbiAgICAgICAgICAgIC5lYWNoKChpbmRleDogbnVtYmVyLCBlbGVtOiBFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmbG9hdGluZ2lmeShlbGVtKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiAkdWk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g55m76YyyXHJcbiAgICBFeHRlbnNpb25NYW5hZ2VyLnJlZ2lzdGVyRG9tRXh0ZW5zaW9uKGFwcGx5RG9tRXh0ZW5zaW9uKTtcclxufVxyXG4iLCJuYW1lc3BhY2UgQ0RQLlVJLkV4dGVuc2lvbiB7XHJcblxyXG4gICAgaW1wb3J0IEZyYW1ld29yayA9IENEUC5GcmFtZXdvcms7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBqUXVlcnkgTW9iaWxlIEZsaXAgU3dpdGNoIOaLoeW8tVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAgICAgICAgICAgICAgJHVpICAgICAgIFtpbl0g5qSc57Si5a++6LGh44GuIGpRdWVyeSDjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAqIEBwYXJhbSB7RG9tRXh0ZW5zaW9uT3B0aW9uc30gW29wdGlvbnNdIFtpbl0g44Kq44OX44K344On44OzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGFwcGx5RG9tRXh0ZW5zaW9uKCR1aTogSlF1ZXJ5LCBvcHRpb25zPzogRG9tRXh0ZW5zaW9uT3B0aW9ucyk6IEpRdWVyeSB7XHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBmbGlwc3dpdGNoIOOBq+e0kOOBpeOBjyBsYWJlbCDjga8gT1Mg44Gr44KI44Gj44GmIGV2ZW50IOeZuuihjOW9ouW8j+OBjOeVsOOBquOCi+OBn+OCgeODleODg+OCr+OBl+OBpueLrOiHquOCpOODmeODs+ODiOOBp+WvvuW/nOOBmeOCiy5cclxuICAgICAgICAgKiDjgb7jgZ8gZmxpcHN3aXRjaCDjga/lhoXpg6jjgacgY2xpY2sg44KS55m66KGM44GX44Gm44GE44KL44GM44CBdmNsaWNrIOOBq+WkieabtOOBmeOCiy5cclxuICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgY29uc3QgX2dldEFsbFN3aXRjaGVzID0gKCk6IEpRdWVyeSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAkdWkuZmluZChcIi51aS1mbGlwc3dpdGNoXCIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IF9nZXRJbnB1dEZyb21Td2l0Y2ggPSAoJHN3aXRjaDogSlF1ZXJ5KTogSlF1ZXJ5ID0+IHtcclxuICAgICAgICAgICAgY29uc3QgJGlucHV0ID0gJHN3aXRjaC5maW5kKFwiaW5wdXRcIik7XHJcbiAgICAgICAgICAgIGlmICgkaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGlucHV0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0ICRzZWxlY3QgPSAkc3dpdGNoLmZpbmQoXCJzZWxlY3RcIik7XHJcbiAgICAgICAgICAgIGlmICgkc2VsZWN0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRzZWxlY3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgX2NoYW5nZSA9ICgkaW5wdXQ6IEpRdWVyeSwgdG86IGJvb2xlYW4pOiB2b2lkID0+IHtcclxuICAgICAgICAgICAgaWYgKCRpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKFwiSU5QVVRcIiA9PT0gJGlucHV0WzBdLm5vZGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGlucHV0LnByb3AoXCJjaGVja2VkXCIsIHRvKS5mbGlwc3dpdGNoKFwicmVmcmVzaFwiKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXCJTRUxFQ1RcIiA9PT0gJGlucHV0WzBdLm5vZGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGlucHV0LnZhbCh0byA/IFwib25cIiA6IFwib2ZmXCIpLmZsaXBzd2l0Y2goXCJyZWZyZXNoXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgX2dldExhYmVsc0Zyb21Td2l0Y2ggPSAoJHN3aXRjaDogSlF1ZXJ5KTogSlF1ZXJ5ID0+IHtcclxuICAgICAgICAgICAgY29uc3QgJGlucHV0ID0gX2dldElucHV0RnJvbVN3aXRjaCgkc3dpdGNoKTtcclxuICAgICAgICAgICAgaWYgKCRpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGFiZWxzID0gKDxhbnk+JGlucHV0WzBdKS5sYWJlbHM7XHJcbiAgICAgICAgICAgICAgICBpZiAobGFiZWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQobGFiZWxzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gJCgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IF9nZXRTd2l0Y2hGcm9tTGFiZWwgPSAoJGxhYmVsOiBKUXVlcnkpOiBKUXVlcnkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gJGxhYmVsLmF0dHIoXCJmb3JcIik7XHJcbiAgICAgICAgICAgIHJldHVybiBfZ2V0QWxsU3dpdGNoZXMoKS5maW5kKFwiW25hbWU9J1wiICsgbmFtZSArIFwiJ11cIik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgX2dldEFsbFN3aXRjaGVzKClcclxuICAgICAgICAgICAgLm9uKFwidmNsaWNrIF9jaGFuZ2VfZmxpcHN3aWNoXCIsIChldmVudDogSlF1ZXJ5LkV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCAkc3dpdGNoID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0ICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCAkaW5wdXQgPSBfZ2V0SW5wdXRGcm9tU3dpdGNoKCRzd2l0Y2gpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlVG8gPSAhJHN3aXRjaC5oYXNDbGFzcyhcInVpLWZsaXBzd2l0Y2gtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgkdGFyZ2V0Lmhhc0NsYXNzKFwidWktZmxpcHN3aXRjaC1pbnB1dFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF9jaGFuZ2UoJGlucHV0LCBjaGFuZ2VUbyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCR0YXJnZXQuaGFzQ2xhc3MoXCJ1aS1mbGlwc3dpdGNoLW9uXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEZyYW1ld29yay5QbGF0Zm9ybS5Nb2JpbGUgJiYgRnJhbWV3b3JrLlBhdGNoLmlzU3VwcG9ydGVkVmNsaWNrKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2NoYW5nZSgkaW5wdXQsIGNoYW5nZVRvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5lYWNoKChpbmRleDogbnVtYmVyLCBmbGlwc3dpdGNoOiBFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBfZ2V0TGFiZWxzRnJvbVN3aXRjaCgkKGZsaXBzd2l0Y2gpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcInZjbGlja1wiLCAoZXZlbnQ6IEpRdWVyeS5FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCAkc3dpdGNoID0gX2dldFN3aXRjaEZyb21MYWJlbCgkKGV2ZW50LnRhcmdldCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISRzd2l0Y2gucGFyZW50KCkuaGFzQ2xhc3MoXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHN3aXRjaC50cmlnZ2VyKFwiX2NoYW5nZV9mbGlwc3dpY2hcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiAkdWk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g55m76YyyXHJcbiAgICBFeHRlbnNpb25NYW5hZ2VyLnJlZ2lzdGVyRG9tRXh0ZW5zaW9uKGFwcGx5RG9tRXh0ZW5zaW9uKTtcclxufVxyXG4iLCJuYW1lc3BhY2UgQ0RQLlVJLkV4dGVuc2lvbiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBqUXVlcnkgTW9iaWxlIFNsaWRlciDmi6HlvLVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gICAgICAgICAgICAgICR1aSAgICAgICBbaW5dIOaknOe0ouWvvuixoeOBriBqUXVlcnkg44Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgKiBAcGFyYW0ge0RvbUV4dGVuc2lvbk9wdGlvbnN9IFtvcHRpb25zXSBbaW5dIOOCquODl+OCt+ODp+ODs1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBhcHBseURvbUV4dGVuc2lvbigkdWk6IEpRdWVyeSwgb3B0aW9ucz86IERvbUV4dGVuc2lvbk9wdGlvbnMpOiBKUXVlcnkge1xyXG4gICAgICAgICR1aS5maW5kKFwiLnVpLXNsaWRlci1pbnB1dFwiKVxyXG4gICAgICAgICAgICAub24oXCJzbGlkZXN0b3BcIiwgKGV2ZW50OiBKUXVlcnkuRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0ICRoYW5kbGVzID0gJChldmVudC5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgICAgICAgICAgICAgIC5wYXJlbnQoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKFwiLnVpLXNsaWRlci1oYW5kbGVcIik7XHJcbiAgICAgICAgICAgICAgICAkaGFuZGxlcy5ibHVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiAkdWk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g55m76YyyXHJcbiAgICBFeHRlbnNpb25NYW5hZ2VyLnJlZ2lzdGVyRG9tRXh0ZW5zaW9uKGFwcGx5RG9tRXh0ZW5zaW9uKTtcclxufVxyXG4iLCJuYW1lc3BhY2UgQ0RQLlVJLkV4dGVuc2lvbiB7XHJcblxyXG4gICAgLy8hIGlTY3JvbGwuY2xpY2sgcGF0Y2hcclxuICAgIGNvbnN0IHBhdGNoX0lTY3JvbGxfdXRpbHNfY2xpY2sgPSBmdW5jdGlvbiAoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0OiBhbnkgPSBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgY29uc3QgZTogYW55ID0gZXZlbnQ7XHJcbiAgICAgICAgbGV0IGV2OiBNb3VzZUV2ZW50O1xyXG5cclxuICAgICAgICAvLyBbQ0RQIG1vZGlmaWVkXTogc2V0IHRhcmdldC5jbGllbnRYLlxyXG4gICAgICAgIGlmIChudWxsID09IHRhcmdldC5jbGllbnRYIHx8IG51bGwgPT0gdGFyZ2V0LmNsaWVudFkpIHtcclxuICAgICAgICAgICAgaWYgKG51bGwgIT0gZS5wYWdlWCAmJiBudWxsICE9IGUucGFnZVkpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5jbGllbnRYID0gZS5wYWdlWDtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5jbGllbnRZID0gZS5wYWdlWTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlLmNoYW5nZWRUb3VjaGVzICYmIGUuY2hhbmdlZFRvdWNoZXNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5jbGllbnRYID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWDtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5jbGllbnRZID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCEoLyhTRUxFQ1R8SU5QVVR8VEVYVEFSRUEpL2kpLnRlc3QodGFyZ2V0LnRhZ05hbWUpKSB7XHJcbiAgICAgICAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJNb3VzZUV2ZW50c1wiKTtcclxuICAgICAgICAgICAgZXYuaW5pdE1vdXNlRXZlbnQoXCJjbGlja1wiLCB0cnVlLCB0cnVlLCBlLnZpZXcsIDEsXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuc2NyZWVuWCwgdGFyZ2V0LnNjcmVlblksIHRhcmdldC5jbGllbnRYLCB0YXJnZXQuY2xpZW50WSxcclxuICAgICAgICAgICAgICAgIGUuY3RybEtleSwgZS5hbHRLZXksIGUuc2hpZnRLZXksIGUubWV0YUtleSxcclxuICAgICAgICAgICAgICAgIDAsIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgKDxhbnk+ZXYpLl9jb25zdHJ1Y3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRhcmdldC5kaXNwYXRjaEV2ZW50KGV2KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBzX2FwcGxpZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGlTY3JvbGwgUGF0Y2gg5ouh5by1XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICAgICAgICAgICAgICAkdWkgICAgICAgW2luXSDmpJzntKLlr77osaHjga4galF1ZXJ5IOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICogQHBhcmFtIHtEb21FeHRlbnNpb25PcHRpb25zfSBbb3B0aW9uc10gW2luXSDjgqrjg5fjgrfjg6fjg7NcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYXBwbHlQYXRjaCgkdWk6IEpRdWVyeSwgb3B0aW9ucz86IERvbUV4dGVuc2lvbk9wdGlvbnMpOiBKUXVlcnkge1xyXG4gICAgICAgIGlmICghc19hcHBsaWVkICYmIGdsb2JhbC5JU2Nyb2xsICYmIGdsb2JhbC5JU2Nyb2xsLnV0aWxzKSB7XHJcbiAgICAgICAgICAgIGdsb2JhbC5JU2Nyb2xsLnV0aWxzLmNsaWNrID0gcGF0Y2hfSVNjcm9sbF91dGlsc19jbGljaztcclxuICAgICAgICAgICAgc19hcHBsaWVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICR1aTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDnmbvpjLJcclxuICAgIEV4dGVuc2lvbk1hbmFnZXIucmVnaXN0ZXJEb21FeHRlbnNpb24oYXBwbHlQYXRjaCk7XHJcbn1cclxuIiwiZGVjbGFyZSBtb2R1bGUgXCJjZHAudWkuanFtXCIge1xyXG4gICAgY29uc3QgVUk6IHR5cGVvZiBDRFAuVUk7XHJcbiAgICBleHBvcnQgPSBVSTtcclxufVxyXG4iXX0=
