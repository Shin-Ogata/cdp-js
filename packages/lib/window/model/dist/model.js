/*!
 * @cdp/model 0.9.5
 *   generic model scheme
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@cdp/core-utils'), require('@cdp/events'), require('@cdp/promise'), require('@cdp/observable'), require('@cdp/result'), require('@cdp/data-sync')) :
    typeof define === 'function' && define.amd ? define(['exports', '@cdp/core-utils', '@cdp/events', '@cdp/promise', '@cdp/observable', '@cdp/result', '@cdp/data-sync'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CDP = global.CDP || {}, global.CDP, global.CDP, global.CDP, global.CDP, global.CDP, global.CDP));
}(this, (function (exports, coreUtils, events, promise, observable, result, dataSync) { 'use strict';

    /* eslint-disable
        @typescript-eslint/no-namespace
     ,  @typescript-eslint/no-unused-vars
     ,  @typescript-eslint/restrict-plus-operands
     */
    (function () {
        /**
         * @en Extends error code definitions.
         * @ja 拡張通エラーコード定義
         */
        let RESULT_CODE = CDP_DECLARE.RESULT_CODE;
        (function () {
            RESULT_CODE[RESULT_CODE["MVC_MODEL_DECLARE"] = 9007199254740991] = "MVC_MODEL_DECLARE";
            RESULT_CODE[RESULT_CODE["ERROR_MVC_INVALID_DATA"] = CDP_DECLARE.DECLARE_ERROR_CODE(100 /* CDP */, 65 /* MODEL */ + 1, 'invalid data.')] = "ERROR_MVC_INVALID_DATA";
        })();
    })();

    /* eslint-disable
        @typescript-eslint/no-explicit-any
     */
    /** @internal */ const _defineAttributes = Symbol('define');
    /** @internal */ const _validate = Symbol('validate');
    /** @internal */ const _changeHandler = Symbol('onchange');
    /** @internal */ const _broker = Symbol('broker');
    /** @internal */ const _properties = Symbol('properties');
    /**
     * @en Valid attributes result.
     * @ja 属性検証の有効値
     */
    const RESULT_VALID_ATTRS = Object.freeze(result.makeResult(result.RESULT_CODE.SUCCESS, 'valid attribute.'));
    /** @internal helper for save() */
    function parseSaveArgs(...args) {
        let [key, value, options] = args; // eslint-disable-line prefer-const
        let attrs;
        if (null == key || coreUtils.isObject(key)) {
            attrs = key;
            options = value;
        }
        else {
            (attrs = {})[key] = value;
        }
        if (options && options.data) {
            attrs = Object.assign(attrs || {}, options.data);
        }
        return { attrs, options };
    }
    //__________________________________________________________________________________________________//
    /**
     * @en Base class definition for model that provides a basic set of functionality for managing interaction.
     * @ja インタラクションのための基本機能を提供するモデルの基底クラス定義
     *
     * @example <br>
     *
     * ```ts
     * import { Model, ModelConstructor } from '@cdp/model';
     *
     * interface ContentAttribute {
     *   uri: string;
     *   readonly size: number;
     *   cookie?: string;
     * }
     * ```
     *
     * - Basic Usage
     *
     * ```ts
     * // early cast
     * const ContentBase = Model as ModelConstructor<Model<ContentAttribute>, ContentAttribute>;
     *
     * class Content extends ContentBase {
     *   constructor(attrs: ContentAttribute) {
     *     super(attrs);
     *   }
     * }
     * ```
     *
     * or
     *
     * ```ts
     * // late cast
     * class ContentClass extends Model<ContentAttribute> {
     *   constructor(attrs: ContentAttribute) {
     *     super(attrs);
     *   }
     * }
     *
     * const Content = ContentClass as ModelConstructor<ContentClass, ContentAttribute>;
     * ```
     * then
     *
     * ```ts
     * const content = new Content({
     *   uri: 'aaa.txt',
     *   size: 10,
     *   cookie: undefined, // need explicit assign
     * });
     *
     * console.log(content.uri);    // 'aaa.txt'
     * console.log(content.size);   // '10'
     * console.log(content.cookie); // 'undefined'
     * ```
     *
     * - Using Custom Event
     *
     * ```ts
     * import { ModelEvent } from '@cdp/model';
     *
     * interface CustomEvent extends ModelEvent<ContentAttribute> {
     *   fire: [boolean, number];
     * }
     *
     * :
     *
     * // early cast
     * const ContentBase = Model as ModelConstructor<Model<ContentAttribute, CustomEvent>, ContentAttribute>;
     * class Content extends ContentBase {
     *   :
     * }
     *
     * // late cast
     * class ContentClass extends Model<ContentAttribute, CustomEvent> {
     *   :
     * }
     * const Content = ContentClass as ModelConstructor<ContentClass, ContentAttribute>;
     *
     * const content = new Content({ ... });
     * content.trigger('fire', true, 100);
     * ```
     */
    class Model extends events.EventReceiver {
        /**
         * constructor
         *
         * @param attributes
         *  - `en` initial attribute values
         *  - `ja` 属性の初期値を指定
         */
        constructor(attributes, options) {
            super();
            const opts = Object.assign({}, options);
            const attrs = opts.parse ? this.parse(attributes, opts) : attributes;
            const props = {
                attrs: observable.ObservableObject.from(attrs),
                baseAttrs: { ...attrs },
                prevAttrs: { ...attrs },
                cid: coreUtils.luid('model:', 8),
                options: opts,
            };
            Object.defineProperty(this, _properties, { value: props });
            for (const key of Object.keys(attrs)) {
                this[_defineAttributes](this, key);
            }
            this[_changeHandler] = () => {
                this.trigger('@change', this);
            };
            this[_validate]({}, opts);
        }
        /** @internal attribute bridge def */
        [_defineAttributes](instance, name) {
            const proto = instance.constructor.prototype;
            if (!(name in proto)) {
                Object.defineProperty(proto, name, {
                    get() {
                        return this._attrs[name];
                    },
                    set(val) {
                        if (!coreUtils.deepEqual(this._attrs[name], val)) {
                            delete this[_properties].changedAttrs;
                            this._prevAttrs[name] = this._attrs[name];
                            this._attrs[name] = val;
                        }
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
        }
        ///////////////////////////////////////////////////////////////////////
        // accessor: public properties
        /**
         * @en Get content ID.
         * @ja コンテンツ ID を取得
         */
        get id() {
            const idAttr = idAttribute(this, 'id');
            const { cid, attrs } = this[_properties];
            return (idAttr in attrs) ? attrs[idAttr] : cid;
        }
        ///////////////////////////////////////////////////////////////////////
        // accessor: protected properties
        /**
         * @en Attributes instance
         * @ja 属性を格納するインスタンス
         */
        get _attrs() {
            return this[_properties].attrs;
        }
        /**
         * @en Default attributes instance
         * @ja 既定値属性を格納するインスタンス
         */
        get _baseAttrs() {
            return this[_properties].baseAttrs;
        }
        /**
         * @en Previous attributes instance
         * @ja 変更前の属性を格納するインスタンス
         */
        get _prevAttrs() {
            return this[_properties].prevAttrs;
        }
        /**
         * @en Changed attributes instance
         * @ja 変更のあった属性を格納するインスタンス
         */
        get _changedAttrs() {
            if (null == this[_properties].changedAttrs) {
                this[_properties].changedAttrs = coreUtils.diff(this._baseAttrs, this._attrs);
            }
            return this[_properties].changedAttrs;
        }
        /**
         * @en Get internal content ID.
         * @ja 内部のコンテンツ ID を取得
         */
        get _cid() {
            return this[_properties].cid;
        }
        /**
         * @en Get creating options.
         * @ja 構築時のオプションを取得
         */
        get _options() {
            return this[_properties].options;
        }
        ///////////////////////////////////////////////////////////////////////
        // operations: events
        /** @internal broker access */
        get [_broker]() {
            return this._attrs.getBroker();
        }
        /**
         * @en Check whether this object has clients.
         * @ja クライアントが存在するか判定
         *
         * @param channel
         *  - `en` event channel key. (string | symbol)
         *  - `ja` イベントチャネルキー (string | symbol)
         * @param listener
         *  - `en` callback function of the `channel` corresponding.
         *  - `ja` `channel` に対応したコールバック関数
         */
        hasListener(channel, listener) {
            return this[_broker].hasListener(channel, listener);
        }
        /**
         * @en Returns registered channel keys.
         * @ja 登録されているチャネルキーを返却
         */
        channels() {
            return this[_broker].channels();
        }
        /**
         * @en Notify event to clients.
         * @ja event 発行
         *
         * @param channel
         *  - `en` event channel key. (string | symbol)
         *  - `ja` イベントチャネルキー (string | symbol)
         * @param args
         *  - `en` arguments for callback function of the `channel` corresponding.
         *  - `ja` `channel` に対応したコールバック関数に渡す引数
         */
        trigger(channel, ...args) {
            this[_broker].trigger(channel, ...args);
        }
        /**
         * @en Unsubscribe event(s).
         * @ja イベント購読解除
         *
         * @param channel
         *  - `en` target event channel key. (string | symbol)
         *         When not set this parameter, everything is released.
         *  - `ja` 対象のイベントチャネルキー (string | symbol)
         *         指定しない場合はすべて解除
         * @param listener
         *  - `en` callback function of the `channel` corresponding.
         *         When not set this parameter, all same `channel` listeners are released.
         *  - `ja` `channel` に対応したコールバック関数
         *         指定しない場合は同一 `channel` すべてを解除
         */
        off(channel, listener) {
            this._attrs.off(channel, listener);
        }
        /**
         * @en Subscrive event(s).
         * @ja イベント購読設定
         *
         * @param channel
         *  - `en` target event channel key. (string | symbol)
         *  - `ja` 対象のイベントチャネルキー (string | symbol)
         * @param listener
         *  - `en` callback function of the `channel` corresponding.
         *  - `ja` `channel` に対応したコールバック関数
         */
        on(channel, listener) {
            if ('*' === channel || '@change' === channel || (coreUtils.isArray(channel) && channel.includes('@change'))) {
                this._attrs.on('@', this[_changeHandler]);
            }
            return this._attrs.on(channel, listener);
        }
        /**
         * @en Subscrive event(s) but it causes the bound callback to only fire once before being removed.
         * @ja 一度だけハンドリング可能なイベント購読設定
         *
         * @param channel
         *  - `en` target event channel key. (string | symbol)
         *  - `ja` 対象のイベントチャネルキー (string | symbol)
         * @param listener
         *  - `en` callback function of the `channel` corresponding.
         *  - `ja` `channel` に対応したコールバック関数
         */
        once(channel, listener) {
            const context = this.on(channel, listener);
            const managed = this.on(channel, () => {
                context.unsubscribe();
                managed.unsubscribe();
            });
            return context;
        }
        ///////////////////////////////////////////////////////////////////////
        // operations: validation
        /**
         * @en Check valid or not.
         * @ja 検証の成否を取得
         */
        get isValid() {
            return result.SUCCEEDED(this.validate({ silent: true }).code);
        }
        /**
         * @en Validate result accesser.
         * @ja 検証結果にアクセス
         */
        validate(options) {
            const opts = Object.assign({ validate: true, noThrow: true, extend: false }, options);
            return this[_validate]({}, opts);
        }
        /* eslint-disable @typescript-eslint/no-unused-vars */
        /**
         * @en Validate data method.
         * @ja データ検証
         *
         * @override
         *
         * @param attributes
         *  - `en` validatee attributes
         *  - `ja` 被検証属性
         * @param options
         *  - `en` validate options
         *  - `ja` 検証オプション
         */
        validateAttributes(attributes, options) {
            return RESULT_VALID_ATTRS;
        }
        /* eslint-enable @typescript-eslint/no-unused-vars */
        /** @internal validate */
        [_validate](attributes, options) {
            const { validate, silent, noThrow } = options || {};
            if (validate) {
                const attrs = { ...this._attrs, ...attributes };
                const result$1 = this.validateAttributes(attrs, options);
                if (result.FAILED(result$1.code)) {
                    if (!silent) {
                        this.trigger('@invalid', this, attrs, result$1);
                    }
                    if (!noThrow) {
                        throw result$1;
                    }
                }
                return result$1;
            }
            else {
                return RESULT_VALID_ATTRS;
            }
        }
        ///////////////////////////////////////////////////////////////////////
        // operations: attributes
        /**
         * @en Check the [[Model]] has valid property. (not `null` or `undefined`)
         * @ja [[Model]] が有効なプロパティを持っているか確認 (`null` または `undefined` でない)
         */
        has(attribute) {
            return null != this._attrs[attribute];
        }
        /**
         * @en Get the HTML-escaped value of an attribute.
         * @ja HTML で使用する文字を制御文字に置換した属性値を取得
         */
        escape(attribute) {
            return coreUtils.escapeHTML(this._attrs[attribute]);
        }
        /**
         * @en Update attributes for batch input with options.
         * @ja 属性の一括設定
         *
         * @param attributes
         *  - `en` update attributes
         *  - `ja` 更新属性
         * @param options
         *  - `en` set attributes options
         *  - `ja` 属性更新用オプション
         */
        setAttributes(attributes, options) {
            const { silent, extend } = options || {};
            try {
                if (silent) {
                    this._attrs.suspend(true);
                }
                const result$1 = this[_validate](attributes, options);
                if (result.FAILED(result$1.code)) {
                    return this;
                }
                for (const attr of Object.keys(attributes)) {
                    if (attr in this._attrs) {
                        this._attrs[attr] = attributes[attr];
                    }
                    else if (extend) {
                        this[_defineAttributes](this, attr);
                        this._attrs[attr] = attributes[attr];
                    }
                }
            }
            finally {
                if (silent) {
                    this._attrs.resume();
                }
            }
            return this;
        }
        /**
         * @en Clear all attributes on the [[Model]]. (set `undefined`)
         * @ja [[Model]] からすべての属性を削除 (`undefined` を設定)
         */
        clear(options) {
            const clearAttrs = {};
            for (const attr of Object.keys(this._baseAttrs)) {
                clearAttrs[attr] = undefined;
            }
            return this.setAttributes(clearAttrs, options);
        }
        /**
         * @en Return a copy of the model's `attributes` object.
         * @ja モデル属性値のコピーを返却
         */
        toJSON() {
            return coreUtils.deepCopy({ ...this._attrs });
        }
        /**
         * @es Clone this instance.
         * @ja インスタンスの複製を返却
         *
         * @override
         */
        clone() {
            const { constructor, _attrs, _options } = this;
            return new constructor(_attrs, _options);
        }
        /**
         * @en Check changed attributes.
         * @ja 変更された属性値を持つか判定
         *
         * @param attribute
         *  - `en` checked attribute
         *  - `ja` 検証する属性
         */
        hasChanged(attribute) {
            if (null == attribute) {
                return !coreUtils.isEmptyObject(this._changedAttrs);
            }
            else {
                return attribute in this._changedAttrs;
            }
        }
        /**
         * @en Return an object containing all the attributes that have changed, or `undefined` if there are no changed attributes.
         * @ja 入力した attributes 値の差分に対して変更がある属性値を返却. 差分がない場合は `undefiend` を返却
         *
         * @param attributes
         *  - `en` checked attributes
         *  - `ja` 検証する属性
         */
        changed(attributes) {
            if (!attributes) {
                return this.hasChanged() ? { ...this._changedAttrs } : undefined;
            }
            else {
                const changed = coreUtils.diff(this._attrs, attributes);
                return !coreUtils.isEmptyObject(changed) ? changed : undefined;
            }
        }
        /**
         * @en Get the previous value of an attribute, recorded at the time the last `@change` event was fired.
         * @ja `@change` が発火された前の属性値を取得
         */
        previous(attribute) {
            return this._prevAttrs[attribute];
        }
        ///////////////////////////////////////////////////////////////////////
        // operations: sync
        /**
         * @en Check a [[Model]] is new if it has never been saved to the server, and lacks an id.
         * @ja [[Model]] がまだサーバーに存在しないかチェック. 既定では `idAttribute` の有無で判定
         */
        isNew() {
            const idAttr = idAttribute(this, 'id');
            return !this.has(idAttr);
        }
        /**
         * @en Converts a response into the hash of attributes to be `set` on the model. The default implementation is just to pass the response along.
         * @ja レスポンスの変換メソッド. 既定では何もしない
         *
         * @override
         */
        parse(response, options) {
            return response;
        }
        /**
         * @en Proxy [[IDataSync#sync]] by default -- but override this if you need custom syncing semantics for *this* particular model.
         * @ja データ同期. 必要に応じてオーバーライド可能.
         *
         * @override
         *
         * @param method
         *  - `en` operation string
         *  - `ja` オペレーションを指定
         * @param context
         *  - `en` synchronized context object
         *  - `ja` 同期するコンテキストオブジェクト
         * @param options
         *  - `en` option object
         *  - `ja` オプション
         */
        sync(method, context, options) {
            return dataSync.defaultSync().sync(method, context, options);
        }
        /**
         * @en Fetch the [[Model]] from the server, merging the response with the model's local attributes.
         * @ja [[Model]] 属性のサーバー同期. レスポンスのマージを実行
         */
        async fetch(options) {
            const opts = Object.assign({ parse: true }, options, { syncMethod: 'read' });
            try {
                const resp = await this.sync('read', this, opts);
                this.setAttributes(opts.parse ? this.parse(resp, opts) : resp, opts);
                this.trigger('@sync', this, resp, opts);
                return resp;
            }
            catch (e) {
                this.trigger('@error', this, e, opts);
                throw e;
            }
        }
        async save(...args) {
            const { attrs, options } = parseSaveArgs(...args);
            const opts = Object.assign({ validate: true, parse: true, wait: true }, options);
            try {
                const { wait } = opts;
                const method = opts.syncMethod = this.isNew() ? 'create' : opts.patch ? 'patch' : 'update';
                if (attrs) {
                    if (!wait) {
                        this.setAttributes(attrs, opts);
                        this[_properties].baseAttrs = { ...this._attrs };
                    }
                    else {
                        this[_validate](attrs, opts);
                    }
                    if ('patch' === method) {
                        opts.data = attrs;
                    }
                    else {
                        opts.data = Object.assign(this.toJSON(), attrs);
                    }
                }
                const resp = await this.sync(method, this, opts);
                let serverAttrs = opts.parse ? this.parse(resp, opts) : resp;
                if (attrs && wait) {
                    serverAttrs = Object.assign({}, attrs, serverAttrs);
                }
                if (coreUtils.isObject(serverAttrs) && !coreUtils.isEmptyObject(serverAttrs)) {
                    this.setAttributes(serverAttrs, opts);
                    this[_properties].baseAttrs = { ...this._attrs };
                }
                this.trigger('@sync', this, resp, opts);
                return resp;
            }
            catch (e) {
                this.trigger('@error', this, e, opts);
                throw e;
            }
        }
        /**
         * @en Destroy this [[Model]] on the server if it was already persisted.
         * @ja [[Model]] をサーバーから削除
         *
         * @param options
         *  - `en` destroy options
         *  - `ja` 破棄オプション
         */
        async destroy(options) {
            const opts = Object.assign({ wait: true }, options, { syncMethod: 'delete' });
            try {
                const { wait, cancel } = opts;
                const exists = !this.isNew();
                const destruct = () => {
                    this.stopListening();
                    this.trigger('@destroy', this, opts);
                };
                !wait && destruct();
                let resp;
                if (!exists) {
                    await promise.checkCanceled(cancel);
                }
                else {
                    resp = await this.sync('delete', this, opts);
                }
                wait && destruct();
                exists && this.trigger('@sync', this, resp, opts);
                return resp;
            }
            catch (e) {
                this.trigger('@error', this, e, opts);
                throw e;
            }
        }
    }
    /**
     * @en Get ID attribute name.
     * @ja ID アトリビュート名にアクセス
     *
     * @override
     */
    Model.idAttribute = 'id';
    // mixin による `instanceof` は無効に設定
    coreUtils.setMixClassAttribute(Model, 'instanceOf', null);
    /**
     * @en Check the value-type is [[Model]].
     * @ja [[Model]] 型であるか判定
     *
     * @param x
     *  - `en` evaluated value
     *  - `ja` 評価する値
     */
    function isModel(x) {
        return x instanceof Model;
    }
    /**
     * @en Query [[Model]] `id-attribute`.
     * @ja [[Model]] の `id-attribute` を取得
     */
    function idAttribute(x, fallback = '') {
        return coreUtils.isObject(x) ? (x.constructor['idAttribute'] || fallback) : fallback;
    }

    exports.Model = Model;
    exports.RESULT_VALID_ATTRS = RESULT_VALID_ATTRS;
    exports.idAttribute = idAttribute;
    exports.isModel = isModel;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VzIjpbInJlc3VsdC1jb2RlLWRlZnMudHMiLCJiYXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlXG4gICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5hbWVzcGFjZVxuICwgIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICwgIEB0eXBlc2NyaXB0LWVzbGludC9yZXN0cmljdC1wbHVzLW9wZXJhbmRzXG4gKi9cblxubmFtZXNwYWNlIENEUF9ERUNMQVJFIHtcblxuICAgIGNvbnN0IGVudW0gTE9DQUxfQ09ERV9CQVNFIHtcbiAgICAgICAgTU9ERUwgPSBDRFBfS05PV05fTU9EVUxFLk1WQyAqIExPQ0FMX0NPREVfUkFOR0VfR1VJREUuRlVOQ1RJT04gKyA1LFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBFeHRlbmRzIGVycm9yIGNvZGUgZGVmaW5pdGlvbnMuXG4gICAgICogQGphIOaLoeW8temAmuOCqOODqeODvOOCs+ODvOODieWumue+qVxuICAgICAqL1xuICAgIGV4cG9ydCBlbnVtIFJFU1VMVF9DT0RFIHtcbiAgICAgICAgTVZDX01PREVMX0RFQ0xBUkUgICAgICA9IFJFU1VMVF9DT0RFX0JBU0UuREVDTEFSRSxcbiAgICAgICAgRVJST1JfTVZDX0lOVkFMSURfREFUQSA9IERFQ0xBUkVfRVJST1JfQ09ERShSRVNVTFRfQ09ERV9CQVNFLkNEUCwgTE9DQUxfQ09ERV9CQVNFLk1PREVMICsgMSwgJ2ludmFsaWQgZGF0YS4nKSxcbiAgICB9XG59XG4iLCIvKiBlc2xpbnQtZGlzYWJsZVxuICAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAqL1xuXG5pbXBvcnQge1xuICAgIE5pbCxcbiAgICBQbGFpbk9iamVjdCxcbiAgICBDb25zdHJ1Y3RvcixcbiAgICBDbGFzcyxcbiAgICBBcmd1bWVudHMsXG4gICAgaXNBcnJheSxcbiAgICBpc09iamVjdCxcbiAgICBpc0VtcHR5T2JqZWN0LFxuICAgIGx1aWQsXG4gICAgZXNjYXBlSFRNTCxcbiAgICBkZWVwQ29weSxcbiAgICBkZWVwRXF1YWwsXG4gICAgZGlmZixcbiAgICBzZXRNaXhDbGFzc0F0dHJpYnV0ZSxcbn0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcbmltcG9ydCB7XG4gICAgU3Vic2NyaXB0aW9uLFxuICAgIFNpbGVuY2VhYmxlLFxuICAgIEV2ZW50QnJva2VyLFxuICAgIEV2ZW50UmVjZWl2ZXIsXG4gICAgRXZlbnRTb3VyY2UsXG59IGZyb20gJ0BjZHAvZXZlbnRzJztcbmltcG9ydCB7IGNoZWNrQ2FuY2VsZWQgYXMgY2MgfSBmcm9tICdAY2RwL3Byb21pc2UnO1xuaW1wb3J0IHtcbiAgICBJT2JzZXJ2YWJsZSxcbiAgICBJT2JzZXJ2YWJsZUV2ZW50QnJva2VyQWNjZXNzLFxuICAgIE9ic2VydmFibGVPYmplY3QsXG59IGZyb20gJ0BjZHAvb2JzZXJ2YWJsZSc7XG5pbXBvcnQge1xuICAgIFJFU1VMVF9DT0RFLFxuICAgIFJlc3VsdCxcbiAgICBtYWtlUmVzdWx0LFxuICAgIFNVQ0NFRURFRCxcbiAgICBGQUlMRUQsXG59IGZyb20gJ0BjZHAvcmVzdWx0JztcbmltcG9ydCB7IFN5bmNDb250ZXh0LCBkZWZhdWx0U3luYyB9IGZyb20gJ0BjZHAvZGF0YS1zeW5jJztcbmltcG9ydCB7XG4gICAgTW9kZWxFdmVudCxcbiAgICBNb2RlbFZhbGlkYXRlQXR0cmlidXRlT3B0aW9ucyxcbiAgICBNb2RlbEF0dHJpYnV0ZUlucHV0LFxuICAgIE1vZGVsU2V0T3B0aW9ucyxcbiAgICBNb2RlbENvbnN0cnVjdGlvbk9wdGlvbnMsXG4gICAgTW9kZWxTeW5jTWV0aG9kcyxcbiAgICBNb2RlbFN5bmNSZXN1bHQsXG4gICAgTW9kZWxEYXRhU3luY09wdGlvbnMsXG4gICAgTW9kZWxGZXRjaE9wdGlvbnMsXG4gICAgTW9kZWxTYXZlT3B0aW9ucyxcbiAgICBNb2RlbERlc3Ryb3lPcHRpb25zLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKiogQGludGVybmFsICovIGNvbnN0IF9kZWZpbmVBdHRyaWJ1dGVzID0gU3ltYm9sKCdkZWZpbmUnKTtcbi8qKiBAaW50ZXJuYWwgKi8gY29uc3QgX3ZhbGlkYXRlICAgICAgICAgPSBTeW1ib2woJ3ZhbGlkYXRlJyk7XG4vKiogQGludGVybmFsICovIGNvbnN0IF9jaGFuZ2VIYW5kbGVyICAgID0gU3ltYm9sKCdvbmNoYW5nZScpO1xuLyoqIEBpbnRlcm5hbCAqLyBjb25zdCBfYnJva2VyICAgICAgICAgICA9IFN5bWJvbCgnYnJva2VyJyk7XG4vKiogQGludGVybmFsICovIGNvbnN0IF9wcm9wZXJ0aWVzICAgICAgID0gU3ltYm9sKCdwcm9wZXJ0aWVzJyk7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmludGVyZmFjZSBQcm9wZXJ0eTxUPiB7XG4gICAgYXR0cnM6IE9ic2VydmFibGVPYmplY3Q7XG4gICAgYmFzZUF0dHJzOiBUO1xuICAgIHByZXZBdHRyczogVDtcbiAgICBjaGFuZ2VkQXR0cnM/OiBQYXJ0aWFsPFQ+O1xuICAgIHJlYWRvbmx5IGNpZDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IG9wdGlvbnM6IE1vZGVsU2V0T3B0aW9ucztcbn1cblxuLyoqXG4gKiBAZW4gVmFsaWQgYXR0cmlidXRlcyByZXN1bHQuXG4gKiBAamEg5bGe5oCn5qSc6Ki844Gu5pyJ5Yq55YCkXG4gKi9cbmV4cG9ydCBjb25zdCBSRVNVTFRfVkFMSURfQVRUUlMgPSBPYmplY3QuZnJlZXplKG1ha2VSZXN1bHQoUkVTVUxUX0NPREUuU1VDQ0VTUywgJ3ZhbGlkIGF0dHJpYnV0ZS4nKSk7XG5cbi8qKiBAaW50ZXJuYWwgaGVscGVyIGZvciBzYXZlKCkgKi9cbmZ1bmN0aW9uIHBhcnNlU2F2ZUFyZ3M8QSBleHRlbmRzIG9iamVjdD4oLi4uYXJnczogYW55W10pOiB7IGF0dHJzPzogTW9kZWxBdHRyaWJ1dGVJbnB1dDxBPjsgb3B0aW9ucz86IE1vZGVsU2F2ZU9wdGlvbnM7IH0ge1xuICAgIGxldCBba2V5LCB2YWx1ZSwgb3B0aW9uc10gPSBhcmdzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHByZWZlci1jb25zdFxuICAgIGxldCBhdHRyczogYW55O1xuXG4gICAgaWYgKG51bGwgPT0ga2V5IHx8IGlzT2JqZWN0KGtleSkpIHtcbiAgICAgICAgYXR0cnMgPSBrZXk7XG4gICAgICAgIG9wdGlvbnMgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAoYXR0cnMgPSB7fSlba2V5XSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZGF0YSkge1xuICAgICAgICBhdHRycyA9IE9iamVjdC5hc3NpZ24oYXR0cnMgfHwge30sIG9wdGlvbnMuZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgYXR0cnMsIG9wdGlvbnMgfTtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIEJhc2UgY2xhc3MgZGVmaW5pdGlvbiBmb3IgbW9kZWwgdGhhdCBwcm92aWRlcyBhIGJhc2ljIHNldCBvZiBmdW5jdGlvbmFsaXR5IGZvciBtYW5hZ2luZyBpbnRlcmFjdGlvbi5cbiAqIEBqYSDjgqTjg7Pjgr/jg6njgq/jgrfjg6fjg7Pjga7jgZ/jgoHjga7ln7rmnKzmqZ/og73jgpLmj5DkvpvjgZnjgovjg6Ljg4fjg6vjga7ln7rlupXjgq/jg6njgrnlrprnvqlcbiAqXG4gKiBAZXhhbXBsZSA8YnI+XG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IE1vZGVsLCBNb2RlbENvbnN0cnVjdG9yIH0gZnJvbSAnQGNkcC9tb2RlbCc7XG4gKlxuICogaW50ZXJmYWNlIENvbnRlbnRBdHRyaWJ1dGUge1xuICogICB1cmk6IHN0cmluZztcbiAqICAgcmVhZG9ubHkgc2l6ZTogbnVtYmVyO1xuICogICBjb29raWU/OiBzdHJpbmc7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAtIEJhc2ljIFVzYWdlXG4gKlxuICogYGBgdHNcbiAqIC8vIGVhcmx5IGNhc3RcbiAqIGNvbnN0IENvbnRlbnRCYXNlID0gTW9kZWwgYXMgTW9kZWxDb25zdHJ1Y3RvcjxNb2RlbDxDb250ZW50QXR0cmlidXRlPiwgQ29udGVudEF0dHJpYnV0ZT47XG4gKlxuICogY2xhc3MgQ29udGVudCBleHRlbmRzIENvbnRlbnRCYXNlIHtcbiAqICAgY29uc3RydWN0b3IoYXR0cnM6IENvbnRlbnRBdHRyaWJ1dGUpIHtcbiAqICAgICBzdXBlcihhdHRycyk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIG9yXG4gKlxuICogYGBgdHNcbiAqIC8vIGxhdGUgY2FzdFxuICogY2xhc3MgQ29udGVudENsYXNzIGV4dGVuZHMgTW9kZWw8Q29udGVudEF0dHJpYnV0ZT4ge1xuICogICBjb25zdHJ1Y3RvcihhdHRyczogQ29udGVudEF0dHJpYnV0ZSkge1xuICogICAgIHN1cGVyKGF0dHJzKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGNvbnN0IENvbnRlbnQgPSBDb250ZW50Q2xhc3MgYXMgTW9kZWxDb25zdHJ1Y3RvcjxDb250ZW50Q2xhc3MsIENvbnRlbnRBdHRyaWJ1dGU+O1xuICogYGBgXG4gKiB0aGVuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGNvbnRlbnQgPSBuZXcgQ29udGVudCh7XG4gKiAgIHVyaTogJ2FhYS50eHQnLFxuICogICBzaXplOiAxMCxcbiAqICAgY29va2llOiB1bmRlZmluZWQsIC8vIG5lZWQgZXhwbGljaXQgYXNzaWduXG4gKiB9KTtcbiAqXG4gKiBjb25zb2xlLmxvZyhjb250ZW50LnVyaSk7ICAgIC8vICdhYWEudHh0J1xuICogY29uc29sZS5sb2coY29udGVudC5zaXplKTsgICAvLyAnMTAnXG4gKiBjb25zb2xlLmxvZyhjb250ZW50LmNvb2tpZSk7IC8vICd1bmRlZmluZWQnXG4gKiBgYGBcbiAqXG4gKiAtIFVzaW5nIEN1c3RvbSBFdmVudFxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBNb2RlbEV2ZW50IH0gZnJvbSAnQGNkcC9tb2RlbCc7XG4gKlxuICogaW50ZXJmYWNlIEN1c3RvbUV2ZW50IGV4dGVuZHMgTW9kZWxFdmVudDxDb250ZW50QXR0cmlidXRlPiB7XG4gKiAgIGZpcmU6IFtib29sZWFuLCBudW1iZXJdO1xuICogfVxuICogXG4gKiA6XG4gKlxuICogLy8gZWFybHkgY2FzdFxuICogY29uc3QgQ29udGVudEJhc2UgPSBNb2RlbCBhcyBNb2RlbENvbnN0cnVjdG9yPE1vZGVsPENvbnRlbnRBdHRyaWJ1dGUsIEN1c3RvbUV2ZW50PiwgQ29udGVudEF0dHJpYnV0ZT47XG4gKiBjbGFzcyBDb250ZW50IGV4dGVuZHMgQ29udGVudEJhc2Uge1xuICogICA6XG4gKiB9XG4gKlxuICogLy8gbGF0ZSBjYXN0XG4gKiBjbGFzcyBDb250ZW50Q2xhc3MgZXh0ZW5kcyBNb2RlbDxDb250ZW50QXR0cmlidXRlLCBDdXN0b21FdmVudD4ge1xuICogICA6XG4gKiB9XG4gKiBjb25zdCBDb250ZW50ID0gQ29udGVudENsYXNzIGFzIE1vZGVsQ29uc3RydWN0b3I8Q29udGVudENsYXNzLCBDb250ZW50QXR0cmlidXRlPjtcbiAqXG4gKiBjb25zdCBjb250ZW50ID0gbmV3IENvbnRlbnQoeyAuLi4gfSk7XG4gKiBjb250ZW50LnRyaWdnZXIoJ2ZpcmUnLCB0cnVlLCAxMDApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNb2RlbDxUIGV4dGVuZHMgb2JqZWN0ID0gYW55LCBFdmVudCBleHRlbmRzIE1vZGVsRXZlbnQ8VD4gPSBNb2RlbEV2ZW50PFQ+PiBleHRlbmRzIEV2ZW50UmVjZWl2ZXIgaW1wbGVtZW50cyBFdmVudFNvdXJjZTxFdmVudD4ge1xuICAgIC8qKlxuICAgICAqIEBlbiBHZXQgSUQgYXR0cmlidXRlIG5hbWUuXG4gICAgICogQGphIElEIOOCouODiOODquODk+ODpeODvOODiOWQjeOBq+OCouOCr+OCu+OCuVxuICAgICAqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc3RhdGljIGlkQXR0cmlidXRlID0gJ2lkJztcblxuICAgIC8qKlxuICAgICAqIEBlbiBBdHRyaWJ1dGVzIHBvb2xcbiAgICAgKiBAamEg5bGe5oCn5qC857SN6aCY5Z+fXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlYWRvbmx5IFtfcHJvcGVydGllc106IFByb3BlcnR5PFQ+O1xuXG4gICAgLyoqXG4gICAgICogY29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVzXG4gICAgICogIC0gYGVuYCBpbml0aWFsIGF0dHJpYnV0ZSB2YWx1ZXNcbiAgICAgKiAgLSBgamFgIOWxnuaAp+OBruWIneacn+WApOOCkuaMh+WumlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXM6IFJlcXVpcmVkPFQ+LCBvcHRpb25zPzogTW9kZWxDb25zdHJ1Y3Rpb25PcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgYXR0cnMgPSBvcHRzLnBhcnNlID8gdGhpcy5wYXJzZShhdHRyaWJ1dGVzLCBvcHRzKSBhcyBUIDogYXR0cmlidXRlcztcbiAgICAgICAgY29uc3QgcHJvcHM6IFByb3BlcnR5PFQ+ID0ge1xuICAgICAgICAgICAgYXR0cnM6IE9ic2VydmFibGVPYmplY3QuZnJvbShhdHRycyksXG4gICAgICAgICAgICBiYXNlQXR0cnM6IHsgLi4uYXR0cnMgfSxcbiAgICAgICAgICAgIHByZXZBdHRyczogeyAuLi5hdHRycyB9LFxuICAgICAgICAgICAgY2lkOiBsdWlkKCdtb2RlbDonLCA4KSxcbiAgICAgICAgICAgIG9wdGlvbnM6IG9wdHMsXG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBfcHJvcGVydGllcywgeyB2YWx1ZTogcHJvcHMgfSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoYXR0cnMpKSB7XG4gICAgICAgICAgICB0aGlzW19kZWZpbmVBdHRyaWJ1dGVzXSh0aGlzLCBrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1tfY2hhbmdlSGFuZGxlcl0gPSAoKSA9PiB7XG4gICAgICAgICAgICAodGhpcyBhcyBNb2RlbCkudHJpZ2dlcignQGNoYW5nZScsIHRoaXMgYXMgTW9kZWwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXNbX3ZhbGlkYXRlXSh7fSwgb3B0cyk7XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCBhdHRyaWJ1dGUgYnJpZGdlIGRlZiAqL1xuICAgIHByaXZhdGUgW19kZWZpbmVBdHRyaWJ1dGVzXShpbnN0YW5jZTogb2JqZWN0LCBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcHJvdG8gPSBpbnN0YW5jZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgICAgIGlmICghKG5hbWUgaW4gcHJvdG8pKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sIG5hbWUsIHtcbiAgICAgICAgICAgICAgICBnZXQoKTogdW5rbm93biB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9hdHRyc1tuYW1lXTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldCh2YWw6IHVua25vd24pOiB2b2lkIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZWVwRXF1YWwodGhpcy5fYXR0cnNbbmFtZV0sIHZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW19wcm9wZXJ0aWVzXS5jaGFuZ2VkQXR0cnM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcmV2QXR0cnNbbmFtZV0gPSB0aGlzLl9hdHRyc1tuYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2F0dHJzW25hbWVdICAgICA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFjY2Vzc29yOiBwdWJsaWMgcHJvcGVydGllc1xuXG4gICAgLyoqXG4gICAgICogQGVuIEdldCBjb250ZW50IElELlxuICAgICAqIEBqYSDjgrPjg7Pjg4bjg7Pjg4QgSUQg44KS5Y+W5b6XXG4gICAgICovXG4gICAgZ2V0IGlkKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGlkQXR0ciA9IGlkQXR0cmlidXRlKHRoaXMsICdpZCcpO1xuICAgICAgICBjb25zdCB7IGNpZCwgYXR0cnMgfSA9IHRoaXNbX3Byb3BlcnRpZXNdO1xuICAgICAgICByZXR1cm4gKGlkQXR0ciBpbiBhdHRycykgPyBhdHRyc1tpZEF0dHJdIDogY2lkO1xuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFjY2Vzc29yOiBwcm90ZWN0ZWQgcHJvcGVydGllc1xuXG4gICAgLyoqXG4gICAgICogQGVuIEF0dHJpYnV0ZXMgaW5zdGFuY2VcbiAgICAgKiBAamEg5bGe5oCn44KS5qC857SN44GZ44KL44Kk44Oz44K544K/44Oz44K5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldCBfYXR0cnMoKTogT2JzZXJ2YWJsZU9iamVjdCB7XG4gICAgICAgIHJldHVybiB0aGlzW19wcm9wZXJ0aWVzXS5hdHRycztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gRGVmYXVsdCBhdHRyaWJ1dGVzIGluc3RhbmNlXG4gICAgICogQGphIOaXouWumuWApOWxnuaAp+OCkuagvOe0jeOBmeOCi+OCpOODs+OCueOCv+ODs+OCuVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXQgX2Jhc2VBdHRycygpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbX3Byb3BlcnRpZXNdLmJhc2VBdHRycztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gUHJldmlvdXMgYXR0cmlidXRlcyBpbnN0YW5jZVxuICAgICAqIEBqYSDlpInmm7TliY3jga7lsZ7mgKfjgpLmoLzntI3jgZnjgovjgqTjg7Pjgrnjgr/jg7PjgrlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0IF9wcmV2QXR0cnMoKTogVCB7XG4gICAgICAgIHJldHVybiB0aGlzW19wcm9wZXJ0aWVzXS5wcmV2QXR0cnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIENoYW5nZWQgYXR0cmlidXRlcyBpbnN0YW5jZVxuICAgICAqIEBqYSDlpInmm7Tjga7jgYLjgaPjgZ/lsZ7mgKfjgpLmoLzntI3jgZnjgovjgqTjg7Pjgrnjgr/jg7PjgrlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0IF9jaGFuZ2VkQXR0cnMoKTogUGFydGlhbDxUPiB7XG4gICAgICAgIGlmIChudWxsID09IHRoaXNbX3Byb3BlcnRpZXNdLmNoYW5nZWRBdHRycykge1xuICAgICAgICAgICAgdGhpc1tfcHJvcGVydGllc10uY2hhbmdlZEF0dHJzID0gZGlmZih0aGlzLl9iYXNlQXR0cnMsIHRoaXMuX2F0dHJzIGFzIHVua25vd24gYXMgUGFydGlhbDxUPik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbX3Byb3BlcnRpZXNdLmNoYW5nZWRBdHRycyBhcyBQYXJ0aWFsPFQ+O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBHZXQgaW50ZXJuYWwgY29udGVudCBJRC5cbiAgICAgKiBAamEg5YaF6YOo44Gu44Kz44Oz44OG44Oz44OEIElEIOOCkuWPluW+l1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXQgX2NpZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpc1tfcHJvcGVydGllc10uY2lkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBHZXQgY3JlYXRpbmcgb3B0aW9ucy5cbiAgICAgKiBAamEg5qeL56+J5pmC44Gu44Kq44OX44K344On44Oz44KS5Y+W5b6XXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldCBfb3B0aW9ucygpOiBNb2RlbFNldE9wdGlvbnMge1xuICAgICAgICByZXR1cm4gdGhpc1tfcHJvcGVydGllc10ub3B0aW9ucztcbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBvcGVyYXRpb25zOiBldmVudHNcblxuICAgIC8qKiBAaW50ZXJuYWwgYnJva2VyIGFjY2VzcyAqL1xuICAgIHByaXZhdGUgZ2V0IFtfYnJva2VyXSgpOiBFdmVudEJyb2tlcjxhbnk+IHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRycyBhcyBJT2JzZXJ2YWJsZSBhcyBJT2JzZXJ2YWJsZUV2ZW50QnJva2VyQWNjZXNzKS5nZXRCcm9rZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2hlY2sgd2hldGhlciB0aGlzIG9iamVjdCBoYXMgY2xpZW50cy5cbiAgICAgKiBAamEg44Kv44Op44Kk44Ki44Oz44OI44GM5a2Y5Zyo44GZ44KL44GL5Yik5a6aXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbm5lbFxuICAgICAqICAtIGBlbmAgZXZlbnQgY2hhbm5lbCBrZXkuIChzdHJpbmcgfCBzeW1ib2wpXG4gICAgICogIC0gYGphYCDjgqTjg5njg7Pjg4jjg4Hjg6Pjg43jg6vjgq3jg7wgKHN0cmluZyB8IHN5bWJvbClcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXJcbiAgICAgKiAgLSBgZW5gIGNhbGxiYWNrIGZ1bmN0aW9uIG9mIHRoZSBgY2hhbm5lbGAgY29ycmVzcG9uZGluZy5cbiAgICAgKiAgLSBgamFgIGBjaGFubmVsYCDjgavlr77lv5zjgZfjgZ/jgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgICAgKi9cbiAgICBoYXNMaXN0ZW5lcjxDaGFubmVsIGV4dGVuZHMga2V5b2YgRXZlbnQ+KGNoYW5uZWw/OiBDaGFubmVsLCBsaXN0ZW5lcj86ICguLi5hcmdzOiBBcmd1bWVudHM8RXZlbnRbQ2hhbm5lbF0+KSA9PiB1bmtub3duKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzW19icm9rZXJdLmhhc0xpc3RlbmVyKGNoYW5uZWwsIGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gUmV0dXJucyByZWdpc3RlcmVkIGNoYW5uZWwga2V5cy5cbiAgICAgKiBAamEg55m76Yyy44GV44KM44Gm44GE44KL44OB44Oj44ON44Or44Kt44O844KS6L+U5Y20XG4gICAgICovXG4gICAgY2hhbm5lbHMoKTogKGtleW9mIEV2ZW50KVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbX2Jyb2tlcl0uY2hhbm5lbHMoKSBhcyAoa2V5b2YgRXZlbnQpW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIE5vdGlmeSBldmVudCB0byBjbGllbnRzLlxuICAgICAqIEBqYSBldmVudCDnmbrooYxcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFubmVsXG4gICAgICogIC0gYGVuYCBldmVudCBjaGFubmVsIGtleS4gKHN0cmluZyB8IHN5bWJvbClcbiAgICAgKiAgLSBgamFgIOOCpOODmeODs+ODiOODgeODo+ODjeODq+OCreODvCAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqIEBwYXJhbSBhcmdzXG4gICAgICogIC0gYGVuYCBhcmd1bWVudHMgZm9yIGNhbGxiYWNrIGZ1bmN0aW9uIG9mIHRoZSBgY2hhbm5lbGAgY29ycmVzcG9uZGluZy5cbiAgICAgKiAgLSBgamFgIGBjaGFubmVsYCDjgavlr77lv5zjgZfjgZ/jgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbDjgavmuKHjgZnlvJXmlbBcbiAgICAgKi9cbiAgICBwdWJsaWMgdHJpZ2dlcjxDaGFubmVsIGV4dGVuZHMga2V5b2YgRXZlbnQ+KGNoYW5uZWw6IENoYW5uZWwsIC4uLmFyZ3M6IEFyZ3VtZW50czxQYXJ0aWFsPEV2ZW50W0NoYW5uZWxdPj4pOiB2b2lkIHtcbiAgICAgICAgKHRoaXNbX2Jyb2tlcl0gYXMgYW55KS50cmlnZ2VyKGNoYW5uZWwsIC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBVbnN1YnNjcmliZSBldmVudChzKS5cbiAgICAgKiBAamEg44Kk44OZ44Oz44OI6LO86Kqt6Kej6ZmkXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbm5lbFxuICAgICAqICAtIGBlbmAgdGFyZ2V0IGV2ZW50IGNoYW5uZWwga2V5LiAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqICAgICAgICAgV2hlbiBub3Qgc2V0IHRoaXMgcGFyYW1ldGVyLCBldmVyeXRoaW5nIGlzIHJlbGVhc2VkLlxuICAgICAqICAtIGBqYWAg5a++6LGh44Gu44Kk44OZ44Oz44OI44OB44Oj44ON44Or44Kt44O8IChzdHJpbmcgfCBzeW1ib2wpXG4gICAgICogICAgICAgICDmjIflrprjgZfjgarjgYTloLTlkIjjga/jgZnjgbnjgabop6PpmaRcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXJcbiAgICAgKiAgLSBgZW5gIGNhbGxiYWNrIGZ1bmN0aW9uIG9mIHRoZSBgY2hhbm5lbGAgY29ycmVzcG9uZGluZy5cbiAgICAgKiAgICAgICAgIFdoZW4gbm90IHNldCB0aGlzIHBhcmFtZXRlciwgYWxsIHNhbWUgYGNoYW5uZWxgIGxpc3RlbmVycyBhcmUgcmVsZWFzZWQuXG4gICAgICogIC0gYGphYCBgY2hhbm5lbGAg44Gr5a++5b+c44GX44Gf44Kz44O844Or44OQ44OD44Kv6Zai5pWwXG4gICAgICogICAgICAgICDmjIflrprjgZfjgarjgYTloLTlkIjjga/lkIzkuIAgYGNoYW5uZWxgIOOBmeOBueOBpuOCkuino+mZpFxuICAgICAqL1xuICAgIHB1YmxpYyBvZmY8Q2hhbm5lbCBleHRlbmRzIGtleW9mIEV2ZW50PihjaGFubmVsPzogQ2hhbm5lbCB8IENoYW5uZWxbXSwgbGlzdGVuZXI/OiAoLi4uYXJnczogQXJndW1lbnRzPEV2ZW50W0NoYW5uZWxdPikgPT4gdW5rbm93bik6IHZvaWQge1xuICAgICAgICB0aGlzLl9hdHRycy5vZmYoY2hhbm5lbCBhcyBhbnksIGxpc3RlbmVyIGFzIGFueSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFN1YnNjcml2ZSBldmVudChzKS5cbiAgICAgKiBAamEg44Kk44OZ44Oz44OI6LO86Kqt6Kit5a6aXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbm5lbFxuICAgICAqICAtIGBlbmAgdGFyZ2V0IGV2ZW50IGNoYW5uZWwga2V5LiAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqICAtIGBqYWAg5a++6LGh44Gu44Kk44OZ44Oz44OI44OB44Oj44ON44Or44Kt44O8IChzdHJpbmcgfCBzeW1ib2wpXG4gICAgICogQHBhcmFtIGxpc3RlbmVyXG4gICAgICogIC0gYGVuYCBjYWxsYmFjayBmdW5jdGlvbiBvZiB0aGUgYGNoYW5uZWxgIGNvcnJlc3BvbmRpbmcuXG4gICAgICogIC0gYGphYCBgY2hhbm5lbGAg44Gr5a++5b+c44GX44Gf44Kz44O844Or44OQ44OD44Kv6Zai5pWwXG4gICAgICovXG4gICAgcHVibGljIG9uPENoYW5uZWwgZXh0ZW5kcyBrZXlvZiBFdmVudD4oY2hhbm5lbDogQ2hhbm5lbCB8IENoYW5uZWxbXSwgbGlzdGVuZXI6ICguLi5hcmdzOiBBcmd1bWVudHM8RXZlbnRbQ2hhbm5lbF0+KSA9PiB1bmtub3duKTogU3Vic2NyaXB0aW9uIHtcbiAgICAgICAgaWYgKCcqJyA9PT0gY2hhbm5lbCB8fCAnQGNoYW5nZScgPT09IGNoYW5uZWwgfHwgKGlzQXJyYXkoY2hhbm5lbCkgJiYgY2hhbm5lbC5pbmNsdWRlcygnQGNoYW5nZScgYXMgQ2hhbm5lbCkpKSB7XG4gICAgICAgICAgICB0aGlzLl9hdHRycy5vbignQCcsIHRoaXNbX2NoYW5nZUhhbmRsZXJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fYXR0cnMub24oY2hhbm5lbCBhcyBhbnksIGxpc3RlbmVyIGFzIGFueSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFN1YnNjcml2ZSBldmVudChzKSBidXQgaXQgY2F1c2VzIHRoZSBib3VuZCBjYWxsYmFjayB0byBvbmx5IGZpcmUgb25jZSBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cbiAgICAgKiBAamEg5LiA5bqm44Gg44GR44OP44Oz44OJ44Oq44Oz44Kw5Y+v6IO944Gq44Kk44OZ44Oz44OI6LO86Kqt6Kit5a6aXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbm5lbFxuICAgICAqICAtIGBlbmAgdGFyZ2V0IGV2ZW50IGNoYW5uZWwga2V5LiAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqICAtIGBqYWAg5a++6LGh44Gu44Kk44OZ44Oz44OI44OB44Oj44ON44Or44Kt44O8IChzdHJpbmcgfCBzeW1ib2wpXG4gICAgICogQHBhcmFtIGxpc3RlbmVyXG4gICAgICogIC0gYGVuYCBjYWxsYmFjayBmdW5jdGlvbiBvZiB0aGUgYGNoYW5uZWxgIGNvcnJlc3BvbmRpbmcuXG4gICAgICogIC0gYGphYCBgY2hhbm5lbGAg44Gr5a++5b+c44GX44Gf44Kz44O844Or44OQ44OD44Kv6Zai5pWwXG4gICAgICovXG4gICAgcHVibGljIG9uY2U8Q2hhbm5lbCBleHRlbmRzIGtleW9mIEV2ZW50PihjaGFubmVsOiBDaGFubmVsIHwgQ2hhbm5lbFtdLCBsaXN0ZW5lcjogKC4uLmFyZ3M6IEFyZ3VtZW50czxFdmVudFtDaGFubmVsXT4pID0+IHVua25vd24pOiBTdWJzY3JpcHRpb24ge1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5vbihjaGFubmVsLCBsaXN0ZW5lcik7XG4gICAgICAgIGNvbnN0IG1hbmFnZWQgPSB0aGlzLm9uKGNoYW5uZWwsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnRleHQudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIG1hbmFnZWQudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb250ZXh0O1xuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIG9wZXJhdGlvbnM6IHZhbGlkYXRpb25cblxuICAgIC8qKlxuICAgICAqIEBlbiBDaGVjayB2YWxpZCBvciBub3QuXG4gICAgICogQGphIOaknOiovOOBruaIkOWQpuOCkuWPluW+l1xuICAgICAqL1xuICAgIGdldCBpc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gU1VDQ0VFREVEKHRoaXMudmFsaWRhdGUoeyBzaWxlbnQ6IHRydWUgfSkuY29kZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFZhbGlkYXRlIHJlc3VsdCBhY2Nlc3Nlci5cbiAgICAgKiBAamEg5qSc6Ki857WQ5p6c44Gr44Ki44Kv44K744K5XG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKG9wdGlvbnM/OiBTaWxlbmNlYWJsZSk6IFJlc3VsdCB7XG4gICAgICAgIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKHsgdmFsaWRhdGU6IHRydWUsIG5vVGhyb3c6IHRydWUsIGV4dGVuZDogZmFsc2UgfSwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0aGlzW192YWxpZGF0ZV0oe30sIG9wdHMpO1xuICAgIH1cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFycyAqL1xuXG4gICAgLyoqXG4gICAgICogQGVuIFZhbGlkYXRlIGRhdGEgbWV0aG9kLlxuICAgICAqIEBqYSDjg4fjg7zjgr/mpJzoqLxcbiAgICAgKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZXNcbiAgICAgKiAgLSBgZW5gIHZhbGlkYXRlZSBhdHRyaWJ1dGVzXG4gICAgICogIC0gYGphYCDooqvmpJzoqLzlsZ7mgKdcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAtIGBlbmAgdmFsaWRhdGUgb3B0aW9uc1xuICAgICAqICAtIGBqYWAg5qSc6Ki844Kq44OX44K344On44OzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHZhbGlkYXRlQXR0cmlidXRlczxBIGV4dGVuZHMgVD4oYXR0cmlidXRlczogTW9kZWxBdHRyaWJ1dGVJbnB1dDxBPiwgb3B0aW9ucz86IE1vZGVsVmFsaWRhdGVBdHRyaWJ1dGVPcHRpb25zKTogUmVzdWx0IHtcbiAgICAgICAgcmV0dXJuIFJFU1VMVF9WQUxJRF9BVFRSUztcbiAgICB9XG5cbiAgICAvKiBlc2xpbnQtZW5hYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFycyAqL1xuXG4gICAgLyoqIEBpbnRlcm5hbCB2YWxpZGF0ZSAqL1xuICAgIHByaXZhdGUgW192YWxpZGF0ZV08QSBleHRlbmRzIFQ+KGF0dHJpYnV0ZXM6IE1vZGVsQXR0cmlidXRlSW5wdXQ8QT4sIG9wdGlvbnM/OiBNb2RlbFNldE9wdGlvbnMpOiBSZXN1bHQgfCBuZXZlciB7XG4gICAgICAgIGNvbnN0IHsgdmFsaWRhdGUsIHNpbGVudCwgbm9UaHJvdyB9ID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgaWYgKHZhbGlkYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBhdHRycyA9IHsgLi4udGhpcy5fYXR0cnMsIC4uLmF0dHJpYnV0ZXMgfTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMudmFsaWRhdGVBdHRyaWJ1dGVzKGF0dHJzLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChGQUlMRUQocmVzdWx0LmNvZGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMgYXMgTW9kZWwpLnRyaWdnZXIoJ0BpbnZhbGlkJywgdGhpcyBhcyBNb2RlbCwgYXR0cnMsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghbm9UaHJvdykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBSRVNVTFRfVkFMSURfQVRUUlM7XG4gICAgICAgIH1cbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBvcGVyYXRpb25zOiBhdHRyaWJ1dGVzXG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2hlY2sgdGhlIFtbTW9kZWxdXSBoYXMgdmFsaWQgcHJvcGVydHkuIChub3QgYG51bGxgIG9yIGB1bmRlZmluZWRgKVxuICAgICAqIEBqYSBbW01vZGVsXV0g44GM5pyJ5Yq544Gq44OX44Ot44OR44OG44Kj44KS5oyB44Gj44Gm44GE44KL44GL56K66KqNIChgbnVsbGAg44G+44Gf44GvIGB1bmRlZmluZWRgIOOBp+OBquOBhClcbiAgICAgKi9cbiAgICBwdWJsaWMgaGFzKGF0dHJpYnV0ZToga2V5b2YgVCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gbnVsbCAhPSAodGhpcy5fYXR0cnMgYXMgdW5rbm93biBhcyBUKVthdHRyaWJ1dGVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBHZXQgdGhlIEhUTUwtZXNjYXBlZCB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUuXG4gICAgICogQGphIEhUTUwg44Gn5L2/55So44GZ44KL5paH5a2X44KS5Yi25b6h5paH5a2X44Gr572u5o+b44GX44Gf5bGe5oCn5YCk44KS5Y+W5b6XXG4gICAgICovXG4gICAgcHVibGljIGVzY2FwZShhdHRyaWJ1dGU6IGtleW9mIFQpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gZXNjYXBlSFRNTCgodGhpcy5fYXR0cnMgYXMgYW55KVthdHRyaWJ1dGVdKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gVXBkYXRlIGF0dHJpYnV0ZXMgZm9yIGJhdGNoIGlucHV0IHdpdGggb3B0aW9ucy5cbiAgICAgKiBAamEg5bGe5oCn44Gu5LiA5ous6Kit5a6aXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlc1xuICAgICAqICAtIGBlbmAgdXBkYXRlIGF0dHJpYnV0ZXNcbiAgICAgKiAgLSBgamFgIOabtOaWsOWxnuaAp1xuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCBzZXQgYXR0cmlidXRlcyBvcHRpb25zXG4gICAgICogIC0gYGphYCDlsZ7mgKfmm7TmlrDnlKjjgqrjg5fjgrfjg6fjg7NcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0QXR0cmlidXRlczxBIGV4dGVuZHMgVD4oYXR0cmlidXRlczogTW9kZWxBdHRyaWJ1dGVJbnB1dDxBPiwgb3B0aW9ucz86IE1vZGVsU2V0T3B0aW9ucyk6IHRoaXMge1xuICAgICAgICBjb25zdCB7IHNpbGVudCwgZXh0ZW5kIH0gPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoc2lsZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXR0cnMuc3VzcGVuZCh0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpc1tfdmFsaWRhdGVdKGF0dHJpYnV0ZXMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYgKEZBSUxFRChyZXN1bHQuY29kZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dHIgaW4gdGhpcy5fYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXR0cnNbYXR0cl0gPSBhdHRyaWJ1dGVzW2F0dHJdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXh0ZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNbX2RlZmluZUF0dHJpYnV0ZXNdKHRoaXMsIGF0dHIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hdHRyc1thdHRyXSA9IGF0dHJpYnV0ZXNbYXR0cl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKHNpbGVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2F0dHJzLnJlc3VtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIENsZWFyIGFsbCBhdHRyaWJ1dGVzIG9uIHRoZSBbW01vZGVsXV0uIChzZXQgYHVuZGVmaW5lZGApXG4gICAgICogQGphIFtbTW9kZWxdXSDjgYvjgonjgZnjgbnjgabjga7lsZ7mgKfjgpLliYrpmaQgKGB1bmRlZmluZWRgIOOCkuioreWumilcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xlYXIob3B0aW9ucz86IE1vZGVsU2V0T3B0aW9ucyk6IHRoaXMge1xuICAgICAgICBjb25zdCBjbGVhckF0dHJzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiBPYmplY3Qua2V5cyh0aGlzLl9iYXNlQXR0cnMpKSB7XG4gICAgICAgICAgICBjbGVhckF0dHJzW2F0dHJdID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHJpYnV0ZXMoY2xlYXJBdHRycywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFJldHVybiBhIGNvcHkgb2YgdGhlIG1vZGVsJ3MgYGF0dHJpYnV0ZXNgIG9iamVjdC5cbiAgICAgKiBAamEg44Oi44OH44Or5bGe5oCn5YCk44Gu44Kz44OU44O844KS6L+U5Y20XG4gICAgICovXG4gICAgcHVibGljIHRvSlNPTigpOiBUIHtcbiAgICAgICAgcmV0dXJuIGRlZXBDb3B5KHsgLi4udGhpcy5fYXR0cnMgfSBhcyBUKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZXMgQ2xvbmUgdGhpcyBpbnN0YW5jZS5cbiAgICAgKiBAamEg44Kk44Oz44K544K/44Oz44K544Gu6KSH6KO944KS6L+U5Y20XG4gICAgICpcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xvbmUoKTogdGhpcyB7XG4gICAgICAgIGNvbnN0IHsgY29uc3RydWN0b3IsIF9hdHRycywgX29wdGlvbnMgfSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgKGNvbnN0cnVjdG9yIGFzIENvbnN0cnVjdG9yPHRoaXM+KShfYXR0cnMsIF9vcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2hlY2sgY2hhbmdlZCBhdHRyaWJ1dGVzLlxuICAgICAqIEBqYSDlpInmm7TjgZXjgozjgZ/lsZ7mgKflgKTjgpLmjIHjgaTjgYvliKTlrppcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVcbiAgICAgKiAgLSBgZW5gIGNoZWNrZWQgYXR0cmlidXRlXG4gICAgICogIC0gYGphYCDmpJzoqLzjgZnjgovlsZ7mgKdcbiAgICAgKi9cbiAgICBwdWJsaWMgaGFzQ2hhbmdlZChhdHRyaWJ1dGU/OiBrZXlvZiBUKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChudWxsID09IGF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgcmV0dXJuICFpc0VtcHR5T2JqZWN0KHRoaXMuX2NoYW5nZWRBdHRycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlIGluIHRoaXMuX2NoYW5nZWRBdHRycztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBSZXR1cm4gYW4gb2JqZWN0IGNvbnRhaW5pbmcgYWxsIHRoZSBhdHRyaWJ1dGVzIHRoYXQgaGF2ZSBjaGFuZ2VkLCBvciBgdW5kZWZpbmVkYCBpZiB0aGVyZSBhcmUgbm8gY2hhbmdlZCBhdHRyaWJ1dGVzLlxuICAgICAqIEBqYSDlhaXlipvjgZfjgZ8gYXR0cmlidXRlcyDlgKTjga7lt67liIbjgavlr77jgZfjgablpInmm7TjgYzjgYLjgovlsZ7mgKflgKTjgpLov5TljbQuIOW3ruWIhuOBjOOBquOBhOWgtOWQiOOBryBgdW5kZWZpZW5kYCDjgpLov5TljbRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVzXG4gICAgICogIC0gYGVuYCBjaGVja2VkIGF0dHJpYnV0ZXNcbiAgICAgKiAgLSBgamFgIOaknOiovOOBmeOCi+WxnuaAp1xuICAgICAqL1xuICAgIHB1YmxpYyBjaGFuZ2VkKGF0dHJpYnV0ZXM/OiBQYXJ0aWFsPFQ+KTogUGFydGlhbDxUPiB8IHVuZGVmaW5lZCB7XG4gICAgICAgIGlmICghYXR0cmlidXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFzQ2hhbmdlZCgpID8geyAuLi50aGlzLl9jaGFuZ2VkQXR0cnMgfSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZWQgPSBkaWZmKHRoaXMuX2F0dHJzLCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIHJldHVybiAhaXNFbXB0eU9iamVjdChjaGFuZ2VkKSA/IGNoYW5nZWQgOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gR2V0IHRoZSBwcmV2aW91cyB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUsIHJlY29yZGVkIGF0IHRoZSB0aW1lIHRoZSBsYXN0IGBAY2hhbmdlYCBldmVudCB3YXMgZmlyZWQuXG4gICAgICogQGphIGBAY2hhbmdlYCDjgYznmbrngavjgZXjgozjgZ/liY3jga7lsZ7mgKflgKTjgpLlj5blvpdcbiAgICAgKi9cbiAgICBwdWJsaWMgcHJldmlvdXM8SyBleHRlbmRzIGtleW9mIFQ+KGF0dHJpYnV0ZTogSyk6IFRbS10ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJldkF0dHJzW2F0dHJpYnV0ZV07XG4gICAgfVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gb3BlcmF0aW9uczogc3luY1xuXG4gICAgLyoqXG4gICAgICogQGVuIENoZWNrIGEgW1tNb2RlbF1dIGlzIG5ldyBpZiBpdCBoYXMgbmV2ZXIgYmVlbiBzYXZlZCB0byB0aGUgc2VydmVyLCBhbmQgbGFja3MgYW4gaWQuXG4gICAgICogQGphIFtbTW9kZWxdXSDjgYzjgb7jgaDjgrXjg7zjg5Djg7zjgavlrZjlnKjjgZfjgarjgYTjgYvjg4Hjgqfjg4Pjgq8uIOaXouWumuOBp+OBryBgaWRBdHRyaWJ1dGVgIOOBruacieeEoeOBp+WIpOWumlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBpc05ldygpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgaWRBdHRyID0gaWRBdHRyaWJ1dGUodGhpcywgJ2lkJyk7XG4gICAgICAgIHJldHVybiAhdGhpcy5oYXMoaWRBdHRyIGFzIGtleW9mIFQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBDb252ZXJ0cyBhIHJlc3BvbnNlIGludG8gdGhlIGhhc2ggb2YgYXR0cmlidXRlcyB0byBiZSBgc2V0YCBvbiB0aGUgbW9kZWwuIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGlzIGp1c3QgdG8gcGFzcyB0aGUgcmVzcG9uc2UgYWxvbmcuXG4gICAgICogQGphIOODrOOCueODneODs+OCueOBruWkieaPm+ODoeOCveODg+ODiS4g5pei5a6a44Gn44Gv5L2V44KC44GX44Gq44GEXG4gICAgICpcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcGFyc2UocmVzcG9uc2U6IFBsYWluT2JqZWN0IHwgdm9pZCwgb3B0aW9ucz86IE1vZGVsU2V0T3B0aW9ucyk6IFQgfCB2b2lkIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlIGFzIFQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFByb3h5IFtbSURhdGFTeW5jI3N5bmNdXSBieSBkZWZhdWx0IC0tIGJ1dCBvdmVycmlkZSB0aGlzIGlmIHlvdSBuZWVkIGN1c3RvbSBzeW5jaW5nIHNlbWFudGljcyBmb3IgKnRoaXMqIHBhcnRpY3VsYXIgbW9kZWwuXG4gICAgICogQGphIOODh+ODvOOCv+WQjOacny4g5b+F6KaB44Gr5b+c44GY44Gm44Kq44O844OQ44O844Op44Kk44OJ5Y+v6IO9LlxuICAgICAqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbWV0aG9kXG4gICAgICogIC0gYGVuYCBvcGVyYXRpb24gc3RyaW5nXG4gICAgICogIC0gYGphYCDjgqrjg5rjg6zjg7zjgrfjg6fjg7PjgpLmjIflrppcbiAgICAgKiBAcGFyYW0gY29udGV4dFxuICAgICAqICAtIGBlbmAgc3luY2hyb25pemVkIGNvbnRleHQgb2JqZWN0XG4gICAgICogIC0gYGphYCDlkIzmnJ/jgZnjgovjgrPjg7Pjg4bjgq3jgrnjg4jjgqrjg5bjgrjjgqfjgq/jg4hcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAtIGBlbmAgb3B0aW9uIG9iamVjdFxuICAgICAqICAtIGBqYWAg44Kq44OX44K344On44OzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN5bmM8SyBleHRlbmRzIE1vZGVsU3luY01ldGhvZHM+KG1ldGhvZDogSywgY29udGV4dDogTW9kZWw8VD4sIG9wdGlvbnM/OiBNb2RlbERhdGFTeW5jT3B0aW9ucyk6IFByb21pc2U8TW9kZWxTeW5jUmVzdWx0PEssIFQ+PiB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0U3luYygpLnN5bmMobWV0aG9kLCBjb250ZXh0IGFzIFN5bmNDb250ZXh0PFQ+LCBvcHRpb25zKSBhcyB1bmtub3duIGFzIFByb21pc2U8TW9kZWxTeW5jUmVzdWx0PEssIFQ+PjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gRmV0Y2ggdGhlIFtbTW9kZWxdXSBmcm9tIHRoZSBzZXJ2ZXIsIG1lcmdpbmcgdGhlIHJlc3BvbnNlIHdpdGggdGhlIG1vZGVsJ3MgbG9jYWwgYXR0cmlidXRlcy5cbiAgICAgKiBAamEgW1tNb2RlbF1dIOWxnuaAp+OBruOCteODvOODkOODvOWQjOacny4g44Os44K544Od44Oz44K544Gu44Oe44O844K444KS5a6f6KGMXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGZldGNoKG9wdGlvbnM/OiBNb2RlbEZldGNoT3B0aW9ucyk6IFByb21pc2U8VD4ge1xuICAgICAgICBjb25zdCBvcHRzID0gT2JqZWN0LmFzc2lnbih7IHBhcnNlOiB0cnVlIH0sIG9wdGlvbnMsIHsgc3luY01ldGhvZDogJ3JlYWQnIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgdGhpcy5zeW5jKCdyZWFkJywgdGhpcyBhcyBNb2RlbDxUPiwgb3B0cyk7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZXMob3B0cy5wYXJzZSA/IHRoaXMucGFyc2UocmVzcCwgb3B0cykgYXMgVCA6IHJlc3AsIG9wdHMpO1xuICAgICAgICAgICAgKHRoaXMgYXMgTW9kZWwpLnRyaWdnZXIoJ0BzeW5jJywgdGhpcyBhcyBNb2RlbCwgcmVzcCwgb3B0cyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzcDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgKHRoaXMgYXMgTW9kZWwpLnRyaWdnZXIoJ0BlcnJvcicsIHRoaXMgYXMgTW9kZWwsIGUsIG9wdHMpO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBTZXQgYSBoYXNoIG9mIFtbTW9kZWxdXSBhdHRyaWJ1dGVzLCBhbmQgc3luYyB0aGUgbW9kZWwgdG8gdGhlIHNlcnZlci4gPGJyPlxuICAgICAqICAgICBJZiB0aGUgc2VydmVyIHJldHVybnMgYW4gYXR0cmlidXRlcyBoYXNoIHRoYXQgZGlmZmVycywgdGhlIG1vZGVsJ3Mgc3RhdGUgd2lsbCBiZSBgc2V0YCBhZ2Fpbi5cbiAgICAgKiBAamEgW1tNb2RlbF1dIOWxnuaAp+OCkuOCteODvOODkOODvOOBq+S/neWtmC4gPGJyPlxuICAgICAqICAgICDnlbDjgarjgovlsZ7mgKfjgYzov5TljbTjgZXjgozjgovloLTlkIjjga/lho3oqK3lrppcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiAgLSBgZW5gIHVwZGF0ZSBhdHRyaWJ1dGUga2V5XG4gICAgICogIC0gYGphYCDmm7TmlrDlsZ7mgKfjgq3jg7xcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKiAgLSBgZW5gIHVwZGF0ZSBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgKiAgLSBgamFgIOabtOaWsOWxnuaAp+WApFxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCBzYXZlIG9wdGlvbnNcbiAgICAgKiAgLSBgamFgIOS/neWtmOOCquODl+OCt+ODp+ODs1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBzYXZlPEsgZXh0ZW5kcyBrZXlvZiBUPihrZXk/OiBrZXlvZiBULCB2YWx1ZT86IFRbS10sIG9wdGlvbnM/OiBNb2RlbFNhdmVPcHRpb25zKTogUHJvbWlzZTxQbGFpbk9iamVjdCB8IHZvaWQ+O1xuXG4gICAgLyoqXG4gICAgICogQGVuIFNldCBhIGhhc2ggb2YgW1tNb2RlbF1dIGF0dHJpYnV0ZXMsIGFuZCBzeW5jIHRoZSBtb2RlbCB0byB0aGUgc2VydmVyLiA8YnI+XG4gICAgICogICAgIElmIHRoZSBzZXJ2ZXIgcmV0dXJucyBhbiBhdHRyaWJ1dGVzIGhhc2ggdGhhdCBkaWZmZXJzLCB0aGUgbW9kZWwncyBzdGF0ZSB3aWxsIGJlIGBzZXRgIGFnYWluLlxuICAgICAqIEBqYSBbW01vZGVsXV0g5bGe5oCn44KS44K144O844OQ44O844Gr5L+d5a2YLiA8YnI+XG4gICAgICogICAgIOeVsOOBquOCi+WxnuaAp+OBjOi/lOWNtOOBleOCjOOCi+WgtOWQiOOBr+WGjeioreWumlxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZXNcbiAgICAgKiAgLSBgZW5gIHVwZGF0ZSBhdHRyaWJ1dGVzXG4gICAgICogIC0gYGphYCDmm7TmlrDlsZ7mgKdcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAtIGBlbmAgc2F2ZSBvcHRpb25zXG4gICAgICogIC0gYGphYCDkv53lrZjjgqrjg5fjgrfjg6fjg7NcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgc2F2ZTxBIGV4dGVuZHMgVD4oYXR0cmlidXRlczogTW9kZWxBdHRyaWJ1dGVJbnB1dDxBPiB8IE5pbCwgb3B0aW9ucz86IE1vZGVsU2F2ZU9wdGlvbnMpOiBQcm9taXNlPFBsYWluT2JqZWN0IHwgdm9pZD47XG5cbiAgICBwdWJsaWMgYXN5bmMgc2F2ZSguLi5hcmdzOiB1bmtub3duW10pOiBQcm9taXNlPFBsYWluT2JqZWN0IHwgdm9pZD4ge1xuICAgICAgICBjb25zdCB7IGF0dHJzLCBvcHRpb25zIH0gPSBwYXJzZVNhdmVBcmdzKC4uLmFyZ3MpO1xuICAgICAgICBjb25zdCBvcHRzID0gT2JqZWN0LmFzc2lnbih7IHZhbGlkYXRlOiB0cnVlLCBwYXJzZTogdHJ1ZSwgd2FpdDogdHJ1ZSB9LCBvcHRpb25zKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyB3YWl0IH0gPSBvcHRzO1xuXG4gICAgICAgICAgICBjb25zdCBtZXRob2QgPSBvcHRzLnN5bmNNZXRob2QgPSB0aGlzLmlzTmV3KCkgPyAnY3JlYXRlJyA6IG9wdHMucGF0Y2ggPyAncGF0Y2gnIDogJ3VwZGF0ZSc7XG5cbiAgICAgICAgICAgIGlmIChhdHRycykge1xuICAgICAgICAgICAgICAgIGlmICghd2FpdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZXMoYXR0cnMsIG9wdHMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzW19wcm9wZXJ0aWVzXS5iYXNlQXR0cnMgPSB7IC4uLnRoaXMuX2F0dHJzIH0gYXMgVDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW192YWxpZGF0ZV0oYXR0cnMsIG9wdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoJ3BhdGNoJyA9PT0gbWV0aG9kKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdHMuZGF0YSA9IGF0dHJzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdHMuZGF0YSA9IE9iamVjdC5hc3NpZ24odGhpcy50b0pTT04oKSwgYXR0cnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMuc3luYyhtZXRob2QsIHRoaXMgYXMgTW9kZWw8VD4sIG9wdHMpO1xuXG4gICAgICAgICAgICBsZXQgc2VydmVyQXR0cnMgPSBvcHRzLnBhcnNlID8gdGhpcy5wYXJzZShyZXNwLCBvcHRzKSA6IHJlc3A7XG4gICAgICAgICAgICBpZiAoYXR0cnMgJiYgd2FpdCkge1xuICAgICAgICAgICAgICAgIHNlcnZlckF0dHJzID0gT2JqZWN0LmFzc2lnbih7fSwgYXR0cnMsIHNlcnZlckF0dHJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc09iamVjdChzZXJ2ZXJBdHRycykgJiYgIWlzRW1wdHlPYmplY3Qoc2VydmVyQXR0cnMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVzKHNlcnZlckF0dHJzIGFzIFQsIG9wdHMpO1xuICAgICAgICAgICAgICAgIHRoaXNbX3Byb3BlcnRpZXNdLmJhc2VBdHRycyA9IHsgLi4udGhpcy5fYXR0cnMgfSBhcyBUO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAodGhpcyBhcyBNb2RlbCkudHJpZ2dlcignQHN5bmMnLCB0aGlzIGFzIE1vZGVsLCByZXNwIGFzIFBsYWluT2JqZWN0LCBvcHRzKTtcbiAgICAgICAgICAgIHJldHVybiByZXNwO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAodGhpcyBhcyBNb2RlbCkudHJpZ2dlcignQGVycm9yJywgdGhpcyBhcyBNb2RlbCwgZSwgb3B0cyk7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIERlc3Ryb3kgdGhpcyBbW01vZGVsXV0gb24gdGhlIHNlcnZlciBpZiBpdCB3YXMgYWxyZWFkeSBwZXJzaXN0ZWQuXG4gICAgICogQGphIFtbTW9kZWxdXSDjgpLjgrXjg7zjg5Djg7zjgYvjgonliYrpmaRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCBkZXN0cm95IG9wdGlvbnNcbiAgICAgKiAgLSBgamFgIOegtOajhOOCquODl+OCt+ODp+ODs1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBkZXN0cm95KG9wdGlvbnM/OiBNb2RlbERlc3Ryb3lPcHRpb25zKTogUHJvbWlzZTxQbGFpbk9iamVjdCB8IHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oeyB3YWl0OiB0cnVlIH0sIG9wdGlvbnMsIHsgc3luY01ldGhvZDogJ2RlbGV0ZScgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgd2FpdCwgY2FuY2VsIH0gPSBvcHRzO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RzID0gIXRoaXMuaXNOZXcoKTtcbiAgICAgICAgICAgIGNvbnN0IGRlc3RydWN0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcExpc3RlbmluZygpO1xuICAgICAgICAgICAgICAgICh0aGlzIGFzIE1vZGVsKS50cmlnZ2VyKCdAZGVzdHJveScsIHRoaXMgYXMgTW9kZWwsIG9wdHMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgIXdhaXQgJiYgZGVzdHJ1Y3QoKTtcblxuICAgICAgICAgICAgbGV0IHJlc3A6IFBsYWluT2JqZWN0IHwgdm9pZDtcbiAgICAgICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2MoY2FuY2VsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzcCA9IGF3YWl0IHRoaXMuc3luYygnZGVsZXRlJywgdGhpcyBhcyBNb2RlbDxUPiwgb3B0cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdhaXQgJiYgZGVzdHJ1Y3QoKTtcbiAgICAgICAgICAgIGV4aXN0cyAmJiAodGhpcyBhcyBNb2RlbCkudHJpZ2dlcignQHN5bmMnLCB0aGlzIGFzIE1vZGVsLCByZXNwIGFzIFBsYWluT2JqZWN0LCBvcHRzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3A7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICh0aGlzIGFzIE1vZGVsKS50cmlnZ2VyKCdAZXJyb3InLCB0aGlzIGFzIE1vZGVsLCBlLCBvcHRzKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIG1peGluIOOBq+OCiOOCiyBgaW5zdGFuY2VvZmAg44Gv54Sh5Yq544Gr6Kit5a6aXG5zZXRNaXhDbGFzc0F0dHJpYnV0ZShNb2RlbCBhcyB1bmtub3duIGFzIENsYXNzLCAnaW5zdGFuY2VPZicsIG51bGwpO1xuXG4vKipcbiAqIEBlbiBDaGVjayB0aGUgdmFsdWUtdHlwZSBpcyBbW01vZGVsXV0uXG4gKiBAamEgW1tNb2RlbF1dIOWei+OBp+OBguOCi+OBi+WIpOWumlxuICpcbiAqIEBwYXJhbSB4XG4gKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTW9kZWwoeDogdW5rbm93bik6IHggaXMgTW9kZWwge1xuICAgIHJldHVybiB4IGluc3RhbmNlb2YgTW9kZWw7XG59XG5cbi8qKlxuICogQGVuIFF1ZXJ5IFtbTW9kZWxdXSBgaWQtYXR0cmlidXRlYC5cbiAqIEBqYSBbW01vZGVsXV0g44GuIGBpZC1hdHRyaWJ1dGVgIOOCkuWPluW+l1xuICovXG5leHBvcnQgZnVuY3Rpb24gaWRBdHRyaWJ1dGUoeDogdW5rbm93biwgZmFsbGJhY2sgPSAnJyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KHgpID8gKHguY29uc3RydWN0b3JbJ2lkQXR0cmlidXRlJ10gfHwgZmFsbGJhY2spIDogZmFsbGJhY2s7XG59XG4iXSwibmFtZXMiOlsibWFrZVJlc3VsdCIsIlJFU1VMVF9DT0RFIiwiaXNPYmplY3QiLCJFdmVudFJlY2VpdmVyIiwiT2JzZXJ2YWJsZU9iamVjdCIsImx1aWQiLCJkZWVwRXF1YWwiLCJkaWZmIiwiaXNBcnJheSIsIlNVQ0NFRURFRCIsInJlc3VsdCIsIkZBSUxFRCIsImVzY2FwZUhUTUwiLCJkZWVwQ29weSIsImlzRW1wdHlPYmplY3QiLCJkZWZhdWx0U3luYyIsImNjIiwic2V0TWl4Q2xhc3NBdHRyaWJ1dGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7O0lBTUE7Ozs7O1FBVUk7UUFBQTtZQUNJLHNGQUFpRCxDQUFBO1lBQ2pELG9EQUF5QixZQUFBLGtCQUFrQixnQkFBdUIsaUJBQXdCLENBQUMsRUFBRSxlQUFlLENBQUMs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QUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO2dCQUM5QixNQUFNLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDN0IsTUFBTSxRQUFRLEdBQUc7b0JBQ2IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUNwQixJQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQzVELENBQUM7Z0JBRUYsQ0FBQyxJQUFJLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBRXBCLElBQUksSUFBd0IsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDVCxNQUFNRSxxQkFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNwQjtxQkFBTTtvQkFDSCxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUM1RDtnQkFFRCxJQUFJLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sSUFBSyxJQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFhLEVBQUUsSUFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFckYsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNQLElBQWMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQWEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzFELE1BQU0sQ0FBQyxDQUFDO2FBQ1g7U0FDSjs7SUExbEJEOzs7Ozs7SUFNTyxpQkFBVyxHQUFHLElBQUksQ0FBQztJQXVsQjlCO0FBQ0FDLGtDQUFvQixDQUFDLEtBQXlCLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXBFOzs7Ozs7OzthQVFnQixPQUFPLENBQUMsQ0FBVTtRQUM5QixPQUFPLENBQUMsWUFBWSxLQUFLLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7O2FBSWdCLFdBQVcsQ0FBQyxDQUFVLEVBQUUsUUFBUSxHQUFHLEVBQUU7UUFDakQsT0FBT2Ysa0JBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUM7SUFDL0U7Ozs7Ozs7Ozs7Ozs7Iiwic291cmNlUm9vdCI6ImNkcDovLy9AY2RwL21vZGVsLyJ9
