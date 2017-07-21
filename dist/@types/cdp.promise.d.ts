﻿/*!
 * cdp.promise.d.ts
 * This file is generated by the CDP package build process.
 *
 * Date: 2017-07-20T09:55:16.401Z
 */
/// <reference types="jquery" />
declare namespace CDP {
    /**
     * @interface IPromiseBase
     * @brief Native Promise オブジェクトの拡張インターフェイス定義
     *        キャンセルさせたくないが always() など jQuery method を提供したい場合に使用する.
     *        Native オブジェクトの拡張実装は無いため、global には定義しない.
     */
    interface IPromiseBase<T> extends Promise<T> {
        then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): IPromiseBase<TResult1 | TResult2>;
        state: () => string;
        always: (alwaysCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...alwaysCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>) => IPromiseBase<T>;
        done: (doneCallback1?: JQueryPromiseCallback<T> | JQueryPromiseCallback<T>[], ...doneCallbackN: Array<JQueryPromiseCallback<T> | JQueryPromiseCallback<T>[]>) => IPromiseBase<T>;
        fail: (failCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...failCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>) => IPromiseBase<T>;
        progress: (progressCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...progressCallbackN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>) => IPromiseBase<T>;
    }
    /**
     * @interface IPromise
     * @brief キャンセル可能な Promise オブジェクトのインターフェイス定義
     */
    interface IPromise<T> extends IPromiseBase<T> {
        abort(info?: any): void;
        dependency?: IPromise<any>;
        callReject?: boolean;
        dependOn<U>(promise: IPromise<U> | JQueryXHR): IPromise<U>;
        then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): IPromise<TResult1 | TResult2>;
        state: () => string;
        always: (alwaysCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...alwaysCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>) => IPromise<T>;
        done: (doneCallback1?: JQueryPromiseCallback<T> | JQueryPromiseCallback<T>[], ...doneCallbackN: Array<JQueryPromiseCallback<T> | JQueryPromiseCallback<T>[]>) => IPromise<T>;
        fail: (failCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...failCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>) => IPromise<T>;
        progress: (progressCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...progressCallbackN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>) => IPromise<T>;
    }
    /**
     * makePromise に指定可能な cancel callback の alias.
     */
    type cancelCallback = (detail?: any) => void;
    /**
     * @interface MakePromiseOptions
     * @brief     makePromise に渡せるオプション
     */
    interface MakePromiseOptions {
        dependency?: IPromise<any>;
        callReject?: boolean;
        cancelCallback?: cancelCallback;
        [key: string]: any;
    }
    /**
     * Promise オブジェクトの作成
     * jQueryDeferred オブジェクトから、Tools.Promise オブジェクトを作成する
     *
     * @param df       [in] jQueryDeferred instance を指定
     * @param options? [in] jQueryPromise を拡張するオブジェクト or キャンセル時に呼び出される関数を指定
     * @returns IPromise オブジェクト
     */
    function makePromise<T>(df: JQueryDeferred<T>, options?: MakePromiseOptions | cancelCallback): IPromise<T>;
    /**
     * Promise オブジェクトの終了を待つ
     * $.when() は失敗するとすぐに制御を返すのに対し、失敗も含めて待つ Promise オブジェクトを返却
     *
     * @param deferreds [in] Promise オブジェクト(可変引数, 配列)
     * @returns Promise オブジェクト
     */
    function wait<T>(...deferreds: Promise<T>[]): IPromiseBase<T>;
    function wait<T>(...deferreds: JQueryGenericPromise<T>[]): IPromiseBase<T>;
    function wait<T>(...deferreds: T[]): IPromiseBase<T>;
    /**
     * Promise オブジェクトの最初の完了を待つ
     *
     * @param deferreds [in] Promise オブジェクト(可変引数, 配列)
     * @returns Promise オブジェクト
     */
    function race<T>(...deferreds: Promise<T>[]): IPromiseBase<T>;
    function race<T>(...deferreds: JQueryGenericPromise<T>[]): IPromiseBase<T>;
    function race<T>(...deferreds: T[]): IPromiseBase<T>;
    /**
     * @class PromiseManager
     * @brief 複数の DataProvider.Promise を管理するクラス
     */
    class PromiseManager {
        private _pool;
        private _id;
        /**
         * Promise を管理下に追加
         *
         * @param promise [in] 管理対象のオブジェクト
         * @returns 引数に渡したオブジェクト
         */
        add<T>(promise: IPromise<T> | JQueryXHR): IPromise<T>;
        /**
         * 管理対象の Promise に対して abort を発行
         * キャンセル処理に対するキャンセルは不可
         *
         * @returns Promise オブジェクト
         */
        cancel(info?: any): IPromiseBase<any>;
        /**
         * 管理対象の Promise を配列で返す
         *
         * @returns Promise オブジェクト配列
         */
        promises(): IPromise<any>[];
    }
    /**
     * @class PromiseConstructor
     * @brief ES6 Promise 互換の Promise オブジェクトコンストラクタ
     */
    class PromiseConstructor<T> implements IPromise<T> {
        then: <TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null) => IPromise<TResult1 | TResult2>;
        catch: <TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null) => IPromiseBase<TResult>;
        state: () => string;
        always: (alwaysCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...alwaysCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>) => IPromise<T>;
        done: (doneCallback1?: JQueryPromiseCallback<T> | JQueryPromiseCallback<T>[], ...doneCallbackN: Array<JQueryPromiseCallback<T> | JQueryPromiseCallback<T>[]>) => IPromise<T>;
        fail: (failCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...failCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>) => IPromise<T>;
        progress: (progressCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...progressCallbackN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>) => IPromise<T>;
        private notify;
        private notifyWith;
        private reject;
        private rejectWith;
        private resolve;
        private resolveWith;
        abort: (info?: any) => void;
        dependOn: <U>(promise: IPromise<U> | JQueryXHR) => IPromise<U>;
        /**
         * constructor
         *
         * @param executor [in] ES6 Promise 互換引数. (dependOn を第3引数に渡す)
         * @param options? [in] jQueryPromise を拡張するオブジェクト or キャンセル時に呼び出される関数を指定
         * @return IPromise オブジェクト
         */
        constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject?: (reason?: any) => void, dependOn?: <U>(promise: IPromise<U> | JQueryXHR) => IPromise<U>) => void, options?: MakePromiseOptions | cancelCallback);
        static resolve<U>(value?: U | PromiseLike<U>): IPromiseBase<U>;
        static reject<U>(reason?: any): Promise<U>;
        static all<U>(...deferreds: Array<U | IPromise<U> | JQueryPromise<U>>): IPromiseBase<U>;
        static wait<U>(...deferreds: Array<U | IPromise<U> | JQueryPromise<U>>): IPromiseBase<U>;
        static race<U>(...deferreds: Array<U | IPromise<U> | JQueryPromise<U>>): IPromiseBase<U>;
    }
    const Promise: typeof PromiseConstructor;
}
declare module "cdp.promise" {
    export = CDP;
}
