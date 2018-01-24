﻿/*!
 * cdp.nativebridge.d.ts
 * This file is generated by the CDP package build process.
 *
 * Date: 2018-01-24T03:48:06.570Z
 */
/// <reference path="cdp.plugin.nativebridge.d.ts" />
/// <reference types="jquery" />
declare namespace CDP.NativeBridge {
    import Plugin = CDP.Plugin.NativeBridge;
    /**
     * @en Cordova feature information.
     * @ja 機能情報
     */
    interface Feature extends Plugin.Feature {
    }
    /**
     * @en NativeBridge class's consrtruction options.
     * @ja 初期化に指定するオプション
     */
    interface ConstructOptions extends Plugin.ConstructOptions {
        /**
         * @en [Backward Compat] if you want to receive IResult instance when exec() called, set the param 'true'. default: false
         * @ja [過去互換用] exec コール時に, IResult で返却する場合 true. default: false
         */
        useRawPluginResult?: boolean;
    }
    /**
     * @en NativeBridge base result information.
     * @ja NativeBridge の基底 Result 情報
     */
    interface IResult extends Plugin.IResult, Error {
        message: string;
        name: string;
    }
    /**
     * @en exec() method options.
     * @ja exec() に渡すオプション
     */
    interface ExecOptions extends Plugin.ExecOptions {
        /**
         * @en [Backward Compat] if you want to receive IResult instance when exec() called, set the param 'true'.
         *     default: use ConstructOptions param
         * @ja [過去互換用] exec コール時に, IResult で返却する場合 true.
         *     default: ConstructOptions param 指定された値を使用
         */
        useRawPluginResult?: boolean;
    }
}
declare module "cdp.nativebridge" {
    const NativeBridge: typeof CDP.NativeBridge;
    export = NativeBridge;
}
declare namespace CDP {
    enum RESULT_CODE_BASE {
        CDP_NATIVEBRIDGE_DECLARERATION = 0,
        CDP_NATIVEBRIDGE,
    }
    enum RESULT_CODE {
        ERROR_CDP_NATIVEBRIDG_DECLARATION = 0,
        ERROR_CDP_NATIVEBRIDGE_INVALID_ARG,
        ERROR_CDP_NATIVEBRIDGE_NOT_IMPLEMENT,
        ERROR_CDP_NATIVEBRIDGE_NOT_SUPPORT,
        ERROR_CDP_NATIVEBRIDGE_INVALID_OPERATION,
        ERROR_CDP_NATIVEBRIDGE_CLASS_NOT_FOUND,
        ERROR_CDP_NATIVEBRIDGE_METHOD_NOT_FOUND,
        ERROR_CDP_NATIVEBRIDGE_CORDOVA_REQUIRED,
        ERROR_CDP_NATIVEBRIDGE_CORDOVA_PLUGIN_REQUIRED,
    }
}
declare namespace CDP.NativeBridge {
    import IPromiseBase = CDP.IPromiseBase;
    import IPromise = CDP.IPromise;
    /**
     * @en The utility class for CDP.NativeBridge.
     * @ja CDP.NativeBridge が使用するユーティリティクラス
     */
    class Utils {
        private static s_pluginReady;
        /**
         * @en Defines error code map from the plugin result to CDP.NativeBridge result code.
         * @ja plugin の Result Code を CDP.NativeBridge にマップする
         *
         * @param errorCode
         *  - `en` set result code string. ex): "SUCCESS_OK"
         *  - `ja` Result Code 文字列を指定 ex): "SUCCESS_OK"
         */
        static defineResultCode(errorCode: string): void;
        /**
         * @en Wait for cordova "deviceready" event fired.
         * @ja cordova が 使用可能になるまで待機
         */
        static waitForPluginReady(): IPromiseBase<void>;
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
        static makePromise(df: JQueryDeferred<IResult>, useRawPluginResult: boolean): IPromise<IResult>;
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
        static extend(protoProps: object, staticProps?: object): object;
    }
}
declare namespace CDP.NativeBridge {
    import IPromise = CDP.IPromise;
    import IPromiseBase = CDP.IPromiseBase;
    let SUCCESS_OK: number;
    let SUCCESS_PROGRESS: number;
    let ERROR_FAIL: number;
    let ERROR_CANCEL: number;
    let ERROR_INVALID_ARG: number;
    let ERROR_NOT_IMPLEMENT: number;
    let ERROR_NOT_SUPPORT: number;
    let ERROR_INVALID_OPERATION: number;
    let ERROR_CLASS_NOT_FOUND: number;
    let ERROR_METHOD_NOT_FOUND: number;
    /**
     * @en The base class for NativeBridge communication.
     *     You can derive any Gate class from this class.
     * @ja NativeBridge と通信するベースクラス
     *     このクラスから任意の Gate クラスを派生して実装可能
     *
     * @example <br>
     *
     * ```ts
     *  import { Gate } from "cdp/bridge";
     *
     *  export class SimpleGate extends Gate {
     *    constructor() {
     *      super({  // set CDP.NativeBridge.Feature object to super constructor. (required)
     *        name: "SimpleGate",
     *        android: {
     *          // the class name used by reflection in Anroid Java.
     *          packageInfo: "com.sony.cdp.sample.SimpleGate",
     *        },
     *        ios: {
     *          // the class name used by reflection in Objective-C.
     *          packageInfo: "SMPSimpleGate",
     *        },
     *      });
     *    }
     *
     *    // an example definition of client method.
     *    //  any type of primitive / JSON is available. (cordova compatible. void is also possible.)
     *    //  default return value is Promise object.
     *    public coolMethod(arg1: number, arg2: boolean, arg3: string, arg4: Object): Promise {
     *      // calling super.exec().
     *      // the first argument is method name set by string.
     *      // the second argument is "arguments" set available. (<any> cast required)
     *      //
     *      // !! Note !!
     *      // When null/undefined passes to arguments,
     *      // you must to set default value to the argument in this layer.
     *      return super.exec("coolMethod", <any>arguments);
     *    }
     *  }
     * ```
     */
    class Gate {
        private _bridge;
        private _options;
        private static extend;
        /**
         * @param feature
         *  - `en` feature information.
         *  - `ja` 初期化情報を指定
         * @param options
         *  - `en` construction options.
         *  - `ja` オプションを指定
         */
        constructor(feature: Feature, options?: ConstructOptions);
        /**
         * @en Execute task.
         *     the function calls the Native class method from correspondent method name.
         * @ja タスクの実行
         *     指定した method 名に対応する Native Class の method を呼び出す。
         *
         * @param method
         *  - `en` method name of Native class
         *  - `ja` Native Class のメソッド名を指定
         * @param args
         *  - `en` set arguments by array type.
         *  - `ja` 引数を配列で指定
         * @param options
         *  - `en` set exec options.
         *  - `ja` 実行オプションを指定
         * @returns
         *  - `en` Promise object.
         *  - `ja` Promise オブジェクト
         */
        exec(method: string, args?: any[], options?: ExecOptions): IPromise<any>;
        /**
         * @en Cancel all tasks.
         * @ja すべてのタスクのキャンセル
         *
         * @param options
         *  - `en` set execute options.
         *  - `ja` 実行オプションを指定
         * @returns
         *  - `en` Promise object.
         *  - `ja` Promise オブジェクト
         */
        cancel(options?: ExecOptions): IPromiseBase<IResult>;
        /**
         * @en Destruction for the instance.
         *     release Native class reference. after that, exec() becomes invalid.
         * @ja インスタンスの破棄
         *     Native の参照を解除する。以降、exec は無効となる。
         *
         * @param options
         *  - `en` set execute options.
         *  - `ja` 実行オプションを指定
         * @returns Promise object.
         *  - `en` Promise object.
         *  - `ja` Promise オブジェクト
         */
        dispose(options?: ExecOptions): IPromiseBase<IResult>;
        /**
         * @en Access to Plugin.NativeBridge object.
         *     If you want to use low level exec(), you can use this accessor.
         * @ja Plugin.NativeBridge オブジェクトへのアクセス
         *     低レベル exec() を使用したい場合に利用可能
         *
         * @returns
         *  - `en` Plugin.NativeBridge instance.
         *  - `ja` Plugin.NativeBridge インスタンス
         */
        protected readonly bridge: Plugin.NativeBridge;
    }
}
