namespace CDP.NativeBridge {

    import IPromiseBase = CDP.IPromiseBase;
    import IPromise     = CDP.IPromise;

    const TAG = "[CDP.NativeBridge.Utils] ";

    /**
     * @en The utility class for CDP.NativeBridge.
     * @ja CDP.NativeBridge が使用するユーティリティクラス
     */
    export class Utils {

        private static s_pluginReady = false;

        ///////////////////////////////////////////////////////////////////////
        // public static methods

        /**
         * @en Defines error code map from the plugin result to CDP.NativeBridge result code.
         * @ja plugin の Result Code を CDP.NativeBridge にマップする
         *
         * @param errorCode
         *  - `en` set result code string. ex): "SUCCESS_OK"
         *  - `ja` Result Code 文字列を指定 ex): "SUCCESS_OK"
         */
        public static defineResultCode(errorCode: string): void {
            Object.defineProperty(NativeBridge, errorCode, {
                get: function () {
                    if (Utils.s_pluginReady) {
                        return Plugin.NativeBridge[errorCode];
                    } else {
                        return null;
                    }
                },
                enumerable: true,
                configurable: true
            });
        }

        /**
         * @en Wait for cordova "deviceready" event fired.
         * @ja cordova が 使用可能になるまで待機
         */
        public static waitForPluginReady(): IPromiseBase<void> {
            const df = $.Deferred<void>();

            if (Utils.s_pluginReady) {
                return $.Deferred<void>().resolve();
            }

            try {
                const channel = cordova.require("cordova/channel");
                channel.onCordovaReady.subscribe(() => {
                    if (null != CDP.Plugin.NativeBridge) {
                        Utils.s_pluginReady = true;
                        df.resolve();
                    } else {
                        df.reject(makeErrorInfo(
                            RESULT_CODE.ERROR_CDP_NATIVEBRIDGE_CORDOVA_PLUGIN_REQUIRED, TAG
                        ));
                    }
                });
            } catch (error) {
                df.reject(makeErrorInfo(
                    RESULT_CODE.ERROR_CDP_NATIVEBRIDGE_CORDOVA_REQUIRED, TAG
                ));
            }

            return df.promise();
        }

        /**
         * @en Create NativeBridge.Promise object from jQueryDeferred object.
         * @ja Promise オブジェクトの作成
         *     jQueryDeferred オブジェクトから、NativeBridge.Promise オブジェクトを作成する
         *
         * @param df
         *  - `en` set jQueryDeferred instance.
         *  - `ja` jQueryDeferred instance を指定
         * @param useRawPluginResult
         *  - `en` return plugin result or errorinfo
         *  - `ja` plugin result を返すか否か
         * @returns
         *  - `en` NativeBridge.Promise object.
         *  - `ja` NativeBridge.Promise オブジェクト
         */
        public static makePromise(df: JQueryDeferred<IResult>, useRawPluginResult: boolean): IPromise<IResult> {
            return CDP.makePromise(df, {
                _bridge: null,
                _taskId: null,
                abort: function (info?: any): void {
                    const code = useRawPluginResult ? NativeBridge.ERROR_CANCEL : RESULT_CODE.SUCCEEDED;
                    const detail = $.extend({ code: code }, {
                        message: "abort",
                        name: TAG + "method canceled",
                        taskId: this._taskId,
                    }, info);

                    const cancel = () => {
                        if (null != this._bridge && null != this._taskId) {
                            this._bridge.cancel(this._taskId, detail);
                        }
                        df.reject(detail);
                    };

                    if (null != this.dependency) {
                        if (this.dependency.abort) {
                            this.dependency.abort(detail);
                        } else {
                            console.error(TAG + "[call] dependency object doesn't have 'abort()' method.");
                        }
                        if (this.callReject && "pending" === this.state()) {
                            cancel();
                        }
                    } else if ("pending" === this.state()) {
                        cancel();
                    }
                }
            });
        }

        /**
         * @en Helper function to correctly set up the prototype chain, for subclasses.
         *     The function behavior is same as extend() function of Backbone.js.
         * @ja クラス継承のためのヘルパー関数
         *     Backbone.js extend() 関数と同等
         *
         * @param protoProps
         *  - `en` set prototype properties as object.
         *  - `ja` prototype properties をオブジェクトで指定
         * @param staticProps
         *  - `en` set static properties as object.
         *  - `ja` static properties をオブジェクトで指定
         * @returns
         *  - `en` subclass constructor.
         *  - `ja` サブクラスのコンストラクタ
         */
        public static extend(protoProps: object, staticProps?: object): object {
            const parent = this;
            let child;

            if (protoProps && protoProps.hasOwnProperty("constructor")) {
                child = protoProps.constructor;
            } else {
                child = function () {
                    return parent.apply(this, arguments);
                };
            }

            $.extend(child, parent, staticProps);

            const Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate;

            if (protoProps) {
                $.extend(child.prototype, protoProps);
            }

            child.__super__ = parent.prototype;

            return child;
        }
    }
}
