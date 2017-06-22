/*!
 * cdp.promise.js 2.0.0
 *
 * Date: 2017-06-22T04:54:54.418Z
 */
(function (root, factory) { if (typeof define === "function" && define.amd) { define(["jquery"], function ($) { return factory(root.CDP || (root.CDP = {}), $); }); } else if (typeof exports === "object") { module.exports = factory(root.CDP || (root.CDP = {}), require("jquery")); } else { factory(root.CDP || (root.CDP = {}), root.jQuery || root.$); } }(((this || 0).self || global), function (CDP, $) {
var CDP;
(function (CDP) {
    var TAG = "[CDP.Promise] ";
    /**
     * Cancel 可能オブジェクトの作成
     *
     * @param df       {JQueryDeferred}    [in] jQueryDeferred instance を指定
     * @param options? {Object | Function} [in] jQueryPromise を拡張するオブジェクト or キャンセル時に呼び出される関数を指定
     * @return {Object} Cancelable property
     */
    function makeCancelable(df, options) {
        var extendOptions;
        var cancel;
        if ("function" === typeof options) {
            cancel = options;
        }
        else {
            extendOptions = options;
            if (extendOptions && extendOptions.cancelCallback) {
                cancel = extendOptions.cancelCallback;
            }
            else {
                cancel = function () { };
            }
        }
        var _abort = function (info) {
            var detail = info ? info : { message: "abort" };
            cancel(detail);
            if (null != this.dependency) {
                if (this.dependency.abort) {
                    this.dependency.abort(detail);
                }
                else {
                    console.error(TAG + "[call] dependency object doesn't have 'abort()' method.");
                }
                if (this.callReject && "pending" === this.state()) {
                    df.reject(detail);
                }
            }
            else if ("pending" === this.state()) {
                df.reject(detail);
            }
        };
        var _dependOn = function (promise) {
            var _this = this;
            if (promise.abort) {
                this.dependency = promise;
                promise
                    .always(function () {
                    _this.dependency = null;
                });
            }
            else {
                console.error(TAG + "[set] dependency object doesn't have 'abort()' method.");
            }
            return promise;
        };
        var _target = $.extend({}, {
            dependency: null,
            callReject: false,
        }, extendOptions);
        return {
            df: df,
            target: _target,
            abort: _abort,
            dependOn: _dependOn,
        };
    }
    /**
     * Promise オブジェクトの作成
     * jQueryDeferred オブジェクトから、Tools.Promise オブジェクトを作成する
     *
     * @param df       {JQueryDeferred}    [in] jQueryDeferred instance を指定
     * @param options? {Object | Function} [in] jQueryPromise を拡張するオブジェクト or キャンセル時に呼び出される関数を指定
     * @return {IPromise} IPromise オブジェクト
     */
    function makePromise(df, options) {
        var cancelable = makeCancelable(df, options);
        var promise = df.promise(cancelable.target);
        if (null == promise.abort) {
            promise.abort = cancelable.abort.bind(promise);
        }
        if (null == promise.dependOn) {
            promise.dependOn = cancelable.dependOn.bind(promise);
        }
        return promise;
    }
    CDP.makePromise = makePromise;
    function wait() {
        var deferreds = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            deferreds[_i] = arguments[_i];
        }
        // 投入法が可変引数だった場合は配列に修正する
        var _deferreds = [].concat.apply([], deferreds);
        // 実際の作業
        var df = $.Deferred();
        var results = [];
        var initialized = false;
        var isFinished = function () {
            if (!initialized) {
                return false;
            }
            else {
                return !results.some(function (element) {
                    return "pending" === element.status;
                });
            }
        };
        _deferreds.forEach(function (deferred, index) {
            results.push({
                status: "pending",
                args: null,
            });
            deferred
                .then(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                results[index].status = "resolved";
                results[index].args = args;
            }, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                results[index].status = "rejected";
                results[index].args = args;
            })
                .always(function () {
                if (isFinished()) {
                    df.resolve(results);
                }
            });
        });
        initialized = true;
        if (isFinished()) {
            df.resolve(results);
        }
        return df.promise();
    }
    CDP.wait = wait;
    function race() {
        var deferreds = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            deferreds[_i] = arguments[_i];
        }
        var df = $.Deferred();
        var _deferreds = [].concat.apply([], deferreds);
        _deferreds.forEach(function (deferred, index) {
            deferred
                .then(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if ("pending" === df.state()) {
                    df.resolve(args);
                }
            }, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if ("pending" === df.state()) {
                    df.reject(args);
                }
            });
        });
        return df.promise();
    }
    CDP.race = race;
    //___________________________________________________________________________________________________________________//
    /**
     * @class PromiseManager
     * @brief 複数の DataProvider.Promise を管理するクラス
     */
    var PromiseManager = (function () {
        function PromiseManager() {
            this._pool = [];
            this._id = 0;
        }
        ///////////////////////////////////////////////////////////////////////
        // public method
        /**
         * Promise を管理下に追加
         *
         * @param promise {Promise} [in] 管理対象のオブジェクト
         * @return {Promise} 引数に渡したオブジェクト
         */
        PromiseManager.prototype.add = function (promise) {
            var _this = this;
            if (promise == null) {
                return null;
            }
            // abort() を持っていない場合はエラー
            if (!promise.abort) {
                console.error(TAG + "[add] promise object doesn't have 'abort()' method.");
                return promise;
            }
            var cookie = {
                promise: promise,
                id: this._id++,
            };
            this._pool.push(cookie);
            promise
                .always(function () {
                _this._pool = _this._pool.filter(function (element) {
                    if (element.id !== cookie.id) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
            });
            return promise;
        };
        /**
         * 管理対象の Promise に対して abort を発行
         * キャンセル処理に対するキャンセルは不可
         *
         * @return {IPromiseBase}
         */
        PromiseManager.prototype.cancel = function (info) {
            var promises = this.promises();
            promises.forEach(function (element) {
                if (element.abort) {
                    element.abort(info);
                }
            });
            return wait.apply(null, promises);
        };
        /**
         * 管理対象の Promise を配列で返す
         *
         * @return {Promise[]}
         */
        PromiseManager.prototype.promises = function () {
            return this._pool.map(function (element) {
                return element.promise;
            });
        };
        return PromiseManager;
    }());
    CDP.PromiseManager = PromiseManager;
    //___________________________________________________________________________________________________________________//
    /**
     * @class PromiseConstructor
     * @brief ES6 Promise 互換の Promise オブジェクトコンストラクタ
     */
    var PromiseConstructor = (function () {
        /**
         * constructor
         *
         * @param executor {Object}            [in] ES6 Promise 互換引数. (dependOn を第3引数に渡す)
         * @param options? {Object | Function} [in] jQueryPromise を拡張するオブジェクト or キャンセル時に呼び出される関数を指定
         * @return {IPromise} IPromise オブジェクト
         */
        function PromiseConstructor(executor, options) {
            // apply mixin
            var cancelable = makeCancelable($.Deferred(), options);
            $.extend(true, this, cancelable.df, cancelable.target);
            this.abort = cancelable.abort.bind(this);
            this.dependOn = cancelable.dependOn.bind(this);
            executor(this.resolve, this.reject, this.dependOn);
        }
        ///////////////////////////////////////////////////////////////////////
        // static methods:
        PromiseConstructor.resolve = function (value) {
            return $.Deferred().resolve(value);
        };
        PromiseConstructor.reject = function (reason) {
            return $.Deferred().reject(reason);
        };
        PromiseConstructor.all = function () {
            var deferreds = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                deferreds[_i] = arguments[_i];
            }
            return $.when(deferreds);
        };
        PromiseConstructor.wait = function () {
            var deferreds = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                deferreds[_i] = arguments[_i];
            }
            return wait(deferreds);
        };
        PromiseConstructor.race = function () {
            var deferreds = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                deferreds[_i] = arguments[_i];
            }
            return race(deferreds);
        };
        return PromiseConstructor;
    }());
    CDP.PromiseConstructor = PromiseConstructor;
    CDP.Promise = PromiseConstructor;
})(CDP || (CDP = {}));

return CDP; }));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ID0gXCJbQ0RQLlByb21pc2VdIFwiO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGludGVyZmFjZSBJUHJvbWlzZUJhc2VcclxuICAgICAqIEBicmllZiBOYXRpdmUgUHJvbWlzZSDjgqrjg5bjgrjjgqfjgq/jg4jjga7mi6HlvLXjgqTjg7Pjgr/jg7zjg5XjgqfjgqTjgrnlrprnvqlcclxuICAgICAqICAgICAgICDjgq3jg6Pjg7Pjgrvjg6vjgZXjgZvjgZ/jgY/jgarjgYTjgYwgYWx3YXlzKCkg44Gq44GpIGpRdWVyeSBtZXRob2Qg44KS5o+Q5L6b44GX44Gf44GE5aC05ZCI44Gr5L2/55So44GZ44KLLlxyXG4gICAgICogICAgICAgIE5hdGl2ZSDjgqrjg5bjgrjjgqfjgq/jg4jjga7mi6HlvLXlrp/oo4Xjga/nhKHjgYTjgZ/jgoHjgIFnbG9iYWwg44Gr44Gv5a6a576p44GX44Gq44GELlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElQcm9taXNlQmFzZTxUPiBleHRlbmRzIFByb21pc2U8VD4ge1xyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gUHJvbWlzZSBleHRlbmRzOlxyXG5cclxuICAgICAgICB0aGVuOiA8VFJlc3VsdDEsIFRSZXN1bHQyID0gbmV2ZXI+KFxyXG4gICAgICAgICAgICBvbmZ1bGZpbGxlZD86IChcclxuICAgICAgICAgICAgICAgICh2YWx1ZT86IFRSZXN1bHQxLCAuLi52YWx1ZXM6IGFueVtdKSA9PiBUUmVzdWx0MSB8IFByb21pc2VMaWtlPFRSZXN1bHQxPiB8IHZvaWRcclxuICAgICAgICAgICAgKSB8IHVuZGVmaW5lZCB8IG51bGwsXHJcbiAgICAgICAgICAgIG9ucmVqZWN0ZWQ/OiAoXHJcbiAgICAgICAgICAgICAgICAocmVhc29uPzogYW55LCAuLi52YWx1ZXM6IGFueVtdKSA9PiBUUmVzdWx0MiB8IFByb21pc2VMaWtlPFRSZXN1bHQyPiB8IHZvaWRcclxuICAgICAgICAgICAgKSB8IHVuZGVmaW5lZCB8IG51bGxcclxuICAgICAgICApID0+IElQcm9taXNlQmFzZTxUUmVzdWx0MSB8IFRSZXN1bHQyPjtcclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBKUXVlcnlQcm9taXNlIHN0dWZmOlxyXG5cclxuICAgICAgICBzdGF0ZTogKCkgPT4gc3RyaW5nO1xyXG4gICAgICAgIGFsd2F5czogKFxyXG4gICAgICAgICAgICBhbHdheXNDYWxsYmFjazE/OiBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PiB8IEpRdWVyeVByb21pc2VDYWxsYmFjazxhbnk+W10sXHJcbiAgICAgICAgICAgIC4uLmFsd2F5c0NhbGxiYWNrc046IEFycmF5PEpRdWVyeVByb21pc2VDYWxsYmFjazxhbnk+IHwgSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT5bXT5cclxuICAgICAgICApID0+IElQcm9taXNlQmFzZTxUPjtcclxuICAgICAgICBkb25lOiAoXHJcbiAgICAgICAgICAgIGRvbmVDYWxsYmFjazE/OiBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8VD4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8VD5bXSxcclxuICAgICAgICAgICAgLi4uZG9uZUNhbGxiYWNrTjogQXJyYXk8SlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPFQ+IHwgSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPFQ+W10+XHJcbiAgICAgICAgKSA9PiBJUHJvbWlzZUJhc2U8VD47XHJcbiAgICAgICAgZmFpbDogKFxyXG4gICAgICAgICAgICBmYWlsQ2FsbGJhY2sxPzogSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PltdLFxyXG4gICAgICAgICAgICAuLi5mYWlsQ2FsbGJhY2tzTjogQXJyYXk8SlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PltdPlxyXG4gICAgICAgICkgPT4gSVByb21pc2VCYXNlPFQ+O1xyXG4gICAgICAgIHByb2dyZXNzOiAoXHJcbiAgICAgICAgICAgIHByb2dyZXNzQ2FsbGJhY2sxPzogSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PltdLFxyXG4gICAgICAgICAgICAuLi5wcm9ncmVzc0NhbGxiYWNrTjogQXJyYXk8SlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PltdPlxyXG4gICAgICAgICkgPT4gSVByb21pc2VCYXNlPFQ+O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGludGVyZmFjZSBJUHJvbWlzZVxyXG4gICAgICogQGJyaWVmIOOCreODo+ODs+OCu+ODq+WPr+iDveOBqiBQcm9taXNlIOOCquODluOCuOOCp+OCr+ODiOOBruOCpOODs+OCv+ODvOODleOCp+OCpOOCueWumue+qVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElQcm9taXNlPFQ+IGV4dGVuZHMgSVByb21pc2VCYXNlPFQ+IHtcclxuICAgICAgICAvLyEg44Kt44Oj44Oz44K744Or5Yem55CGXHJcbiAgICAgICAgYWJvcnQoaW5mbz86IGFueSk6IHZvaWQ7XHJcbiAgICAgICAgLy8hIOS+neWtmOOBmeOCiyBwcm9taXNlLlxyXG4gICAgICAgIGRlcGVuZGVuY3k/OiBJUHJvbWlzZTxhbnk+O1xyXG4gICAgICAgIC8vISBhYm9ydCDmmYLjgavoh6rouqvjgoIgcmVqZWN0XHJcbiAgICAgICAgY2FsbFJlamVjdD86IGJvb2xlYW47XHJcbiAgICAgICAgLy8hIOS+neWtmOOBmeOCiyBwcm9taXNlIOOCkuioreWumlxyXG4gICAgICAgIGRlcGVuZE9uPFU+KHByb21pc2U6IElQcm9taXNlPFU+IHwgSlF1ZXJ5WEhSKTogSVByb21pc2U8VT47XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gUHJvbWlzZSBleHRlbmRzOlxyXG5cclxuICAgICAgICB0aGVuOiA8VFJlc3VsdDEsIFRSZXN1bHQyID0gbmV2ZXI+KFxyXG4gICAgICAgICAgICBvbmZ1bGZpbGxlZD86IChcclxuICAgICAgICAgICAgICAgICh2YWx1ZT86IFRSZXN1bHQxLCAuLi52YWx1ZXM6IGFueVtdKSA9PiBUUmVzdWx0MSB8IFByb21pc2VMaWtlPFRSZXN1bHQxPiB8IHZvaWRcclxuICAgICAgICAgICAgKSB8IHVuZGVmaW5lZCB8IG51bGwsXHJcbiAgICAgICAgICAgIG9ucmVqZWN0ZWQ/OiAoXHJcbiAgICAgICAgICAgICAgICAocmVhc29uPzogYW55LCAuLi52YWx1ZXM6IGFueVtdKSA9PiBUUmVzdWx0MiB8IFByb21pc2VMaWtlPFRSZXN1bHQyPiB8IHZvaWRcclxuICAgICAgICAgICAgKSB8IHVuZGVmaW5lZCB8IG51bGxcclxuICAgICAgICApID0+IElQcm9taXNlPFRSZXN1bHQxIHwgVFJlc3VsdDI+O1xyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIEpRdWVyeVByb21pc2Ugc3R1ZmY6XHJcblxyXG4gICAgICAgIHN0YXRlOiAoKSA9PiBzdHJpbmc7XHJcbiAgICAgICAgYWx3YXlzOiAoXHJcbiAgICAgICAgICAgIGFsd2F5c0NhbGxiYWNrMT86IEpRdWVyeVByb21pc2VDYWxsYmFjazxhbnk+IHwgSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT5bXSxcclxuICAgICAgICAgICAgLi4uYWx3YXlzQ2FsbGJhY2tzTjogQXJyYXk8SlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PltdPlxyXG4gICAgICAgICkgPT4gSVByb21pc2U8VD47XHJcbiAgICAgICAgZG9uZTogKFxyXG4gICAgICAgICAgICBkb25lQ2FsbGJhY2sxPzogSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPFQ+IHwgSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPFQ+W10sXHJcbiAgICAgICAgICAgIC4uLmRvbmVDYWxsYmFja046IEFycmF5PEpRdWVyeVByb21pc2VDYWxsYmFjazxUPiB8IEpRdWVyeVByb21pc2VDYWxsYmFjazxUPltdPlxyXG4gICAgICAgICkgPT4gSVByb21pc2U8VD47XHJcbiAgICAgICAgZmFpbDogKFxyXG4gICAgICAgICAgICBmYWlsQ2FsbGJhY2sxPzogSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PltdLFxyXG4gICAgICAgICAgICAuLi5mYWlsQ2FsbGJhY2tzTjogQXJyYXk8SlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PltdPlxyXG4gICAgICAgICkgPT4gSVByb21pc2U8VD47XHJcbiAgICAgICAgcHJvZ3Jlc3M6IChcclxuICAgICAgICAgICAgcHJvZ3Jlc3NDYWxsYmFjazE/OiBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PiB8IEpRdWVyeVByb21pc2VDYWxsYmFjazxhbnk+W10sXHJcbiAgICAgICAgICAgIC4uLnByb2dyZXNzQ2FsbGJhY2tOOiBBcnJheTxKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PiB8IEpRdWVyeVByb21pc2VDYWxsYmFjazxhbnk+W10+XHJcbiAgICAgICAgKSA9PiBJUHJvbWlzZTxUPjtcclxuICAgIH1cclxuXHJcbiAgICAvL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWFrZVByb21pc2Ug44Gr5oyH5a6a5Y+v6IO944GqIGNhbmNlbCBjYWxsYmFjayDjga4gYWxpYXMuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCB0eXBlIGNhbmNlbENhbGxiYWNrID0gKGRldGFpbD86IGFueSkgPT4gdm9pZDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBpbnRlcmZhY2UgTWFrZVByb21pc2VPcHRpb25zXHJcbiAgICAgKiBAYnJpZWYgICAgIG1ha2VQcm9taXNlIOOBq+a4oeOBm+OCi+OCquODl+OCt+ODp+ODs1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE1ha2VQcm9taXNlT3B0aW9ucyB7XHJcbiAgICAgICAgZGVwZW5kZW5jeT86IElQcm9taXNlPGFueT47ICAgICAgICAgLy8hPCDkvp3lrZjjgZnjgosgcHJvbWlzZSDjgpLoqK3lrppcclxuICAgICAgICBjYWxsUmVqZWN0PzogYm9vbGVhbjsgICAgICAgICAgICAgICAvLyE8IGFib3J0IOaZguOBq+iHqui6q+OCgiByZWplY3RcclxuICAgICAgICBjYW5jZWxDYWxsYmFjaz86IGNhbmNlbENhbGxiYWNrOyAgICAvLyE8IOOCreODo+ODs+OCu+ODq+aZguOBq+WRvOOBsOOCjOOCi+mWouaVsFxyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTsgICAgICAgICAgICAgICAgIC8vITwg5ouh5by144OR44Op44Oh44O844K/XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYW5jZWwg5Y+v6IO944Kq44OW44K444Kn44Kv44OI44Gu5L2c5oiQXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRmICAgICAgIHtKUXVlcnlEZWZlcnJlZH0gICAgW2luXSBqUXVlcnlEZWZlcnJlZCBpbnN0YW5jZSDjgpLmjIflrppcclxuICAgICAqIEBwYXJhbSBvcHRpb25zPyB7T2JqZWN0IHwgRnVuY3Rpb259IFtpbl0galF1ZXJ5UHJvbWlzZSDjgpLmi6HlvLXjgZnjgovjgqrjg5bjgrjjgqfjgq/jg4ggb3Ig44Kt44Oj44Oz44K744Or5pmC44Gr5ZG844Gz5Ye644GV44KM44KL6Zai5pWw44KS5oyH5a6aXHJcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IENhbmNlbGFibGUgcHJvcGVydHlcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gbWFrZUNhbmNlbGFibGU8VD4oXHJcbiAgICAgICAgZGY6IEpRdWVyeURlZmVycmVkPFQ+LFxyXG4gICAgICAgIG9wdGlvbnM/OiBNYWtlUHJvbWlzZU9wdGlvbnMgfCBjYW5jZWxDYWxsYmFja1xyXG4gICAgKTogeyBkZjogSlF1ZXJ5RGVmZXJyZWQ8VD4sIHRhcmdldDogb2JqZWN0OyBhYm9ydDogKGluZm8/OiBhbnkpID0+IHZvaWQ7IGRlcGVuZE9uOiAocHJvbWlzZTogYW55KSA9PiBKUXVlcnlQcm9taXNlPGFueT4gfSB7XHJcbiAgICAgICAgbGV0IGV4dGVuZE9wdGlvbnM6IE1ha2VQcm9taXNlT3B0aW9ucztcclxuICAgICAgICBsZXQgY2FuY2VsOiBjYW5jZWxDYWxsYmFjaztcclxuXHJcbiAgICAgICAgaWYgKFwiZnVuY3Rpb25cIiA9PT0gdHlwZW9mIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgY2FuY2VsID0gPGNhbmNlbENhbGxiYWNrPm9wdGlvbnM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXh0ZW5kT3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIGlmIChleHRlbmRPcHRpb25zICYmIGV4dGVuZE9wdGlvbnMuY2FuY2VsQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNhbmNlbCA9IGV4dGVuZE9wdGlvbnMuY2FuY2VsQ2FsbGJhY2s7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjYW5jZWwgPSAoKSA9PiB7IC8qIG5vb3AgKi8gfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgX2Fib3J0ID0gZnVuY3Rpb24gKGluZm8/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICAgICAgY29uc3QgZGV0YWlsID0gaW5mbyA/IGluZm8gOiB7IG1lc3NhZ2U6IFwiYWJvcnRcIiB9O1xyXG4gICAgICAgICAgICBjYW5jZWwoZGV0YWlsKTtcclxuICAgICAgICAgICAgaWYgKG51bGwgIT0gdGhpcy5kZXBlbmRlbmN5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kZXBlbmRlbmN5LmFib3J0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBlbmRlbmN5LmFib3J0KGRldGFpbCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoVEFHICsgXCJbY2FsbF0gZGVwZW5kZW5jeSBvYmplY3QgZG9lc24ndCBoYXZlICdhYm9ydCgpJyBtZXRob2QuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2FsbFJlamVjdCAmJiBcInBlbmRpbmdcIiA9PT0gdGhpcy5zdGF0ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGYucmVqZWN0KGRldGFpbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXCJwZW5kaW5nXCIgPT09IHRoaXMuc3RhdGUoKSkge1xyXG4gICAgICAgICAgICAgICAgZGYucmVqZWN0KGRldGFpbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBfZGVwZW5kT24gPSBmdW5jdGlvbiAocHJvbWlzZTogYW55KTogSlF1ZXJ5UHJvbWlzZTxhbnk+IHtcclxuICAgICAgICAgICAgaWYgKHByb21pc2UuYWJvcnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVwZW5kZW5jeSA9IHByb21pc2U7XHJcbiAgICAgICAgICAgICAgICBwcm9taXNlXHJcbiAgICAgICAgICAgICAgICAgICAgLmFsd2F5cygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwZW5kZW5jeSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFRBRyArIFwiW3NldF0gZGVwZW5kZW5jeSBvYmplY3QgZG9lc24ndCBoYXZlICdhYm9ydCgpJyBtZXRob2QuXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IF90YXJnZXQgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICAgICAgICBkZXBlbmRlbmN5OiBudWxsLFxyXG4gICAgICAgICAgICBjYWxsUmVqZWN0OiBmYWxzZSxcclxuICAgICAgICB9LCBleHRlbmRPcHRpb25zKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZGY6IGRmLFxyXG4gICAgICAgICAgICB0YXJnZXQ6IF90YXJnZXQsXHJcbiAgICAgICAgICAgIGFib3J0OiBfYWJvcnQsXHJcbiAgICAgICAgICAgIGRlcGVuZE9uOiBfZGVwZW5kT24sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFByb21pc2Ug44Kq44OW44K444Kn44Kv44OI44Gu5L2c5oiQXHJcbiAgICAgKiBqUXVlcnlEZWZlcnJlZCDjgqrjg5bjgrjjgqfjgq/jg4jjgYvjgonjgIFUb29scy5Qcm9taXNlIOOCquODluOCuOOCp+OCr+ODiOOCkuS9nOaIkOOBmeOCi1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkZiAgICAgICB7SlF1ZXJ5RGVmZXJyZWR9ICAgIFtpbl0galF1ZXJ5RGVmZXJyZWQgaW5zdGFuY2Ug44KS5oyH5a6aXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucz8ge09iamVjdCB8IEZ1bmN0aW9ufSBbaW5dIGpRdWVyeVByb21pc2Ug44KS5ouh5by144GZ44KL44Kq44OW44K444Kn44Kv44OIIG9yIOOCreODo+ODs+OCu+ODq+aZguOBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCkuaMh+WumlxyXG4gICAgICogQHJldHVybiB7SVByb21pc2V9IElQcm9taXNlIOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbWFrZVByb21pc2U8VD4oZGY6IEpRdWVyeURlZmVycmVkPFQ+LCBvcHRpb25zPzogTWFrZVByb21pc2VPcHRpb25zIHwgY2FuY2VsQ2FsbGJhY2spOiBJUHJvbWlzZTxUPiB7XHJcbiAgICAgICAgY29uc3QgY2FuY2VsYWJsZSA9IG1ha2VDYW5jZWxhYmxlKGRmLCBvcHRpb25zKTtcclxuICAgICAgICBjb25zdCBwcm9taXNlID0gPElQcm9taXNlPFQ+Pjxhbnk+ZGYucHJvbWlzZShjYW5jZWxhYmxlLnRhcmdldCk7XHJcbiAgICAgICAgaWYgKG51bGwgPT0gcHJvbWlzZS5hYm9ydCkge1xyXG4gICAgICAgICAgICBwcm9taXNlLmFib3J0ID0gY2FuY2VsYWJsZS5hYm9ydC5iaW5kKHByb21pc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobnVsbCA9PSBwcm9taXNlLmRlcGVuZE9uKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UuZGVwZW5kT24gPSBjYW5jZWxhYmxlLmRlcGVuZE9uLmJpbmQocHJvbWlzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcm9taXNlIOOCquODluOCuOOCp+OCr+ODiOOBrue1guS6huOCkuW+heOBpFxyXG4gICAgICogJC53aGVuKCkg44Gv5aSx5pWX44GZ44KL44Go44GZ44GQ44Gr5Yi25b6h44KS6L+U44GZ44Gu44Gr5a++44GX44CB5aSx5pWX44KC5ZCr44KB44Gm5b6F44GkIFByb21pc2Ug44Kq44OW44K444Kn44Kv44OI44KS6L+U5Y20XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRlZmVycmVkcyB7UHJvbWlzZTxUPnxKUXVlcnlHZW5lcmljUHJvbWlzZTxUPltdfSBbaW5dIFByb21pc2Ug44Kq44OW44K444Kn44Kv44OIKOWPr+WkieW8leaVsCwg6YWN5YiXKVxyXG4gICAgICogQHJldHVybiB7SVByb21pc2VCYXNlPFQ+fSBQcm9taXNlIOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gd2FpdDxUPiguLi5kZWZlcnJlZHM6IFByb21pc2U8VD5bXSk6IElQcm9taXNlQmFzZTxUPjtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB3YWl0PFQ+KC4uLmRlZmVycmVkczogSlF1ZXJ5R2VuZXJpY1Byb21pc2U8VD5bXSk6IElQcm9taXNlQmFzZTxUPjtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB3YWl0PFQ+KC4uLmRlZmVycmVkczogVFtdKTogSVByb21pc2VCYXNlPFQ+O1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHdhaXQ8VD4oLi4uZGVmZXJyZWRzOiBhbnlbXSk6IElQcm9taXNlQmFzZTxUPiB7XHJcblxyXG4gICAgICAgIC8vIOaKleWFpeazleOBjOWPr+WkieW8leaVsOOBoOOBo+OBn+WgtOWQiOOBr+mFjeWIl+OBq+S/ruato+OBmeOCi1xyXG4gICAgICAgIGNvbnN0IF9kZWZlcnJlZHM6IEpRdWVyeVByb21pc2U8VD5bXSA9IFtdLmNvbmNhdC5hcHBseShbXSwgZGVmZXJyZWRzKTtcclxuXHJcbiAgICAgICAgLy8g5a6f6Zqb44Gu5L2c5qWtXHJcbiAgICAgICAgY29uc3QgZGYgPSAkLkRlZmVycmVkKCk7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIGxldCBpbml0aWFsaXplZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zdCBpc0ZpbmlzaGVkID0gKCk6IGJvb2xlYW4gPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIXJlc3VsdHMuc29tZSgoZWxlbWVudDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwicGVuZGluZ1wiID09PSBlbGVtZW50LnN0YXR1cztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgX2RlZmVycmVkcy5mb3JFYWNoKChkZWZlcnJlZCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJwZW5kaW5nXCIsXHJcbiAgICAgICAgICAgICAgICBhcmdzOiBudWxsLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZGVmZXJyZWRcclxuICAgICAgICAgICAgICAgIC50aGVuKCguLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdLnN0YXR1cyA9IFwicmVzb2x2ZWRcIjtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XS5hcmdzID0gYXJncztcclxuICAgICAgICAgICAgICAgIH0sICguLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdLnN0YXR1cyA9IFwicmVqZWN0ZWRcIjtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XS5hcmdzID0gYXJncztcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYWx3YXlzKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNGaW5pc2hlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRmLnJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgICBpZiAoaXNGaW5pc2hlZCgpKSB7XHJcbiAgICAgICAgICAgIGRmLnJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gPGFueT5kZi5wcm9taXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcm9taXNlIOOCquODluOCuOOCp+OCr+ODiOOBruacgOWIneOBruWujOS6huOCkuW+heOBpFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkZWZlcnJlZHMge1Byb21pc2U8VD58SlF1ZXJ5R2VuZXJpY1Byb21pc2U8VD5bXX0gW2luXSBQcm9taXNlIOOCquODluOCuOOCp+OCr+ODiCjlj6/lpInlvJXmlbAsIOmFjeWIlylcclxuICAgICAqIEByZXR1cm4ge0lQcm9taXNlQmFzZTxUPn0gUHJvbWlzZSDjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJhY2U8VD4oLi4uZGVmZXJyZWRzOiBQcm9taXNlPFQ+W10pOiBJUHJvbWlzZUJhc2U8VD47XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcmFjZTxUPiguLi5kZWZlcnJlZHM6IEpRdWVyeUdlbmVyaWNQcm9taXNlPFQ+W10pOiBJUHJvbWlzZUJhc2U8VD47XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcmFjZTxUPiguLi5kZWZlcnJlZHM6IFRbXSk6IElQcm9taXNlQmFzZTxUPjtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiByYWNlPFQ+KC4uLmRlZmVycmVkczogYW55W10pOiBJUHJvbWlzZUJhc2U8VD4ge1xyXG4gICAgICAgIGNvbnN0IGRmID0gJC5EZWZlcnJlZCgpO1xyXG5cclxuICAgICAgICBjb25zdCBfZGVmZXJyZWRzOiBKUXVlcnlQcm9taXNlPFQ+W10gPSBbXS5jb25jYXQuYXBwbHkoW10sIGRlZmVycmVkcyk7XHJcbiAgICAgICAgX2RlZmVycmVkcy5mb3JFYWNoKChkZWZlcnJlZCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgZGVmZXJyZWRcclxuICAgICAgICAgICAgICAgIC50aGVuKCguLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChcInBlbmRpbmdcIiA9PT0gZGYuc3RhdGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZi5yZXNvbHZlKGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sICguLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChcInBlbmRpbmdcIiA9PT0gZGYuc3RhdGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZi5yZWplY3QoYXJncyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiA8YW55PmRmLnByb21pc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGNsYXNzIFByb21pc2VNYW5hZ2VyXHJcbiAgICAgKiBAYnJpZWYg6KSH5pWw44GuIERhdGFQcm92aWRlci5Qcm9taXNlIOOCkueuoeeQhuOBmeOCi+OCr+ODqeOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgUHJvbWlzZU1hbmFnZXIge1xyXG5cclxuICAgICAgICBwcml2YXRlIF9wb29sOiB7IHByb21pc2U6IElQcm9taXNlPGFueT47IGlkOiBudW1iZXI7IH1bXSA9IFtdO1xyXG4gICAgICAgIHByaXZhdGUgX2lkOiBudW1iZXIgPSAwO1xyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIHB1YmxpYyBtZXRob2RcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUHJvbWlzZSDjgpLnrqHnkIbkuIvjgavov73liqBcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBwcm9taXNlIHtQcm9taXNlfSBbaW5dIOeuoeeQhuWvvuixoeOBruOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2V9IOW8leaVsOOBq+a4oeOBl+OBn+OCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhZGQ8VD4ocHJvbWlzZTogSVByb21pc2U8VD4gfCBKUXVlcnlYSFIpOiBJUHJvbWlzZTxUPiB7XHJcbiAgICAgICAgICAgIGlmIChwcm9taXNlID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhYm9ydCgpIOOCkuaMgeOBo+OBpuOBhOOBquOBhOWgtOWQiOOBr+OCqOODqeODvFxyXG4gICAgICAgICAgICBpZiAoIXByb21pc2UuYWJvcnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoVEFHICsgXCJbYWRkXSBwcm9taXNlIG9iamVjdCBkb2Vzbid0IGhhdmUgJ2Fib3J0KCknIG1ldGhvZC5cIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjb29raWUgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9taXNlOiA8YW55PnByb21pc2UsXHJcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5faWQrKyxcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3Bvb2wucHVzaChjb29raWUpO1xyXG5cclxuICAgICAgICAgICAgKDxhbnk+cHJvbWlzZSlcclxuICAgICAgICAgICAgICAgIC5hbHdheXMoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Bvb2wgPSB0aGlzLl9wb29sLmZpbHRlcigoZWxlbWVudDogeyBwcm9taXNlOiBJUHJvbWlzZTxhbnk+OyBpZDogbnVtYmVyOyB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmlkICE9PSBjb29raWUuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiA8YW55PnByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDnrqHnkIblr77osaHjga4gUHJvbWlzZSDjgavlr77jgZfjgaYgYWJvcnQg44KS55m66KGMXHJcbiAgICAgICAgICog44Kt44Oj44Oz44K744Or5Yem55CG44Gr5a++44GZ44KL44Kt44Oj44Oz44K744Or44Gv5LiN5Y+vXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJuIHtJUHJvbWlzZUJhc2V9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNhbmNlbChpbmZvPzogYW55KTogSVByb21pc2VCYXNlPGFueT4ge1xyXG4gICAgICAgICAgICBjb25zdCBwcm9taXNlcyA9IHRoaXMucHJvbWlzZXMoKTtcclxuICAgICAgICAgICAgcHJvbWlzZXMuZm9yRWFjaCgoZWxlbWVudDogSVByb21pc2U8YW55PikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuYWJvcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFib3J0KGluZm8pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHdhaXQuYXBwbHkobnVsbCwgcHJvbWlzZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog566h55CG5a++6LGh44GuIFByb21pc2Ug44KS6YWN5YiX44Gn6L+U44GZXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlW119XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHByb21pc2VzKCk6IElQcm9taXNlPGFueT5bXSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wb29sLm1hcCgoZWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQucHJvbWlzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2xhc3MgUHJvbWlzZUNvbnN0cnVjdG9yXHJcbiAgICAgKiBAYnJpZWYgRVM2IFByb21pc2Ug5LqS5o+b44GuIFByb21pc2Ug44Kq44OW44K444Kn44Kv44OI44Kz44Oz44K544OI44Op44Kv44K/XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBQcm9taXNlQ29uc3RydWN0b3I8VD4gaW1wbGVtZW50cyBJUHJvbWlzZTxUPiB7XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gbWl4aW46IG5hdGl2ZSBQcm9taXNlXHJcblxyXG4gICAgICAgIHRoZW46IDxUUmVzdWx0MSwgVFJlc3VsdDIgPSBuZXZlcj4oXHJcbiAgICAgICAgICAgIG9uZnVsZmlsbGVkPzogKFxyXG4gICAgICAgICAgICAgICAgKHZhbHVlPzogVFJlc3VsdDEsIC4uLnZhbHVlczogYW55W10pID0+IFRSZXN1bHQxIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDE+IHwgdm9pZFxyXG4gICAgICAgICAgICApIHwgdW5kZWZpbmVkIHwgbnVsbCxcclxuICAgICAgICAgICAgb25yZWplY3RlZD86IChcclxuICAgICAgICAgICAgICAgIChyZWFzb24/OiBhbnksIC4uLnZhbHVlczogYW55W10pID0+IFRSZXN1bHQyIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDI+IHwgdm9pZFxyXG4gICAgICAgICAgICApIHwgdW5kZWZpbmVkIHwgbnVsbFxyXG4gICAgICAgICkgPT4gSVByb21pc2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj47XHJcblxyXG4gICAgICAgIGNhdGNoOiA8VFJlc3VsdCA9IG5ldmVyPihcclxuICAgICAgICAgICAgb25yZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQgfCBQcm9taXNlTGlrZTxUUmVzdWx0PikgfCB1bmRlZmluZWQgfCBudWxsXHJcbiAgICAgICAgKSA9PiBJUHJvbWlzZUJhc2U8VFJlc3VsdD47XHJcblxyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gbWl4aW46IG5hdGl2ZSBKUXVlcnlQcm9taXNlXHJcblxyXG4gICAgICAgIHN0YXRlOiAoKSA9PiBzdHJpbmc7XHJcbiAgICAgICAgYWx3YXlzOiAoXHJcbiAgICAgICAgICAgIGFsd2F5c0NhbGxiYWNrMT86IEpRdWVyeVByb21pc2VDYWxsYmFjazxhbnk+IHwgSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT5bXSxcclxuICAgICAgICAgICAgLi4uYWx3YXlzQ2FsbGJhY2tzTjogQXJyYXk8SlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PltdPlxyXG4gICAgICAgICkgPT4gSVByb21pc2U8VD47XHJcbiAgICAgICAgZG9uZTogKFxyXG4gICAgICAgICAgICBkb25lQ2FsbGJhY2sxPzogSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPFQ+IHwgSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPFQ+W10sXHJcbiAgICAgICAgICAgIC4uLmRvbmVDYWxsYmFja046IEFycmF5PEpRdWVyeVByb21pc2VDYWxsYmFjazxUPiB8IEpRdWVyeVByb21pc2VDYWxsYmFjazxUPltdPlxyXG4gICAgICAgICkgPT4gSVByb21pc2U8VD47XHJcbiAgICAgICAgZmFpbDogKFxyXG4gICAgICAgICAgICBmYWlsQ2FsbGJhY2sxPzogSlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PltdLFxyXG4gICAgICAgICAgICAuLi5mYWlsQ2FsbGJhY2tzTjogQXJyYXk8SlF1ZXJ5UHJvbWlzZUNhbGxiYWNrPGFueT4gfCBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PltdPlxyXG4gICAgICAgICkgPT4gSVByb21pc2U8VD47XHJcbiAgICAgICAgcHJvZ3Jlc3M6IChcclxuICAgICAgICAgICAgcHJvZ3Jlc3NDYWxsYmFjazE/OiBKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PiB8IEpRdWVyeVByb21pc2VDYWxsYmFjazxhbnk+W10sXHJcbiAgICAgICAgICAgIC4uLnByb2dyZXNzQ2FsbGJhY2tOOiBBcnJheTxKUXVlcnlQcm9taXNlQ2FsbGJhY2s8YW55PiB8IEpRdWVyeVByb21pc2VDYWxsYmFjazxhbnk+W10+XHJcbiAgICAgICAgKSA9PiBJUHJvbWlzZTxUPjtcclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBtaXhpbjogbmF0aXZlIEpRdWVyeURlZmVycmVkXHJcblxyXG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlOm5vLXVudXNlZC12YXJpYWJsZSAqL1xyXG4gICAgICAgIHByaXZhdGUgbm90aWZ5OiAodmFsdWU/OiBhbnksIC4uLmFyZ3M6IGFueVtdKSA9PiBKUXVlcnlEZWZlcnJlZDxUPjtcclxuICAgICAgICBwcml2YXRlIG5vdGlmeVdpdGg6IChjb250ZXh0OiBhbnksIHZhbHVlPzogYW55W10pID0+IEpRdWVyeURlZmVycmVkPFQ+O1xyXG4gICAgICAgIHByaXZhdGUgcmVqZWN0OiAodmFsdWU/OiBhbnksIC4uLmFyZ3M6IGFueVtdKSA9PiBKUXVlcnlEZWZlcnJlZDxUPjtcclxuICAgICAgICBwcml2YXRlIHJlamVjdFdpdGg6IChjb250ZXh0OiBhbnksIHZhbHVlPzogYW55W10pID0+IEpRdWVyeURlZmVycmVkPFQ+O1xyXG4gICAgICAgIHByaXZhdGUgcmVzb2x2ZTogKHZhbHVlPzogVCwgLi4uYXJnczogYW55W10pID0+IEpRdWVyeURlZmVycmVkPFQ+O1xyXG4gICAgICAgIHByaXZhdGUgcmVzb2x2ZVdpdGg6IChjb250ZXh0OiBhbnksIHZhbHVlPzogVFtdKSA9PiBKUXVlcnlEZWZlcnJlZDxUPjtcclxuICAgICAgICAvKiB0c2xpbnQ6ZW5hYmxlOm5vLXVudXNlZC12YXJpYWJsZSAqL1xyXG5cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIG1peGluOiBuYXRpdmUgSVByb2ltaXNlXHJcblxyXG4gICAgICAgIGFib3J0OiAoaW5mbz86IGFueSkgPT4gdm9pZDtcclxuICAgICAgICBkZXBlbmRPbjogPFU+KHByb21pc2U6IElQcm9taXNlPFU+IHwgSlF1ZXJ5WEhSKSA9PiBJUHJvbWlzZTxVPjtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29uc3RydWN0b3JcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBleGVjdXRvciB7T2JqZWN0fSAgICAgICAgICAgIFtpbl0gRVM2IFByb21pc2Ug5LqS5o+b5byV5pWwLiAoZGVwZW5kT24g44KS56ysM+W8leaVsOOBq+a4oeOBmSlcclxuICAgICAgICAgKiBAcGFyYW0gb3B0aW9ucz8ge09iamVjdCB8IEZ1bmN0aW9ufSBbaW5dIGpRdWVyeVByb21pc2Ug44KS5ouh5by144GZ44KL44Kq44OW44K444Kn44Kv44OIIG9yIOOCreODo+ODs+OCu+ODq+aZguOBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCkuaMh+WumlxyXG4gICAgICAgICAqIEByZXR1cm4ge0lQcm9taXNlfSBJUHJvbWlzZSDjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgZXhlY3V0b3I6IChcclxuICAgICAgICAgICAgICAgIHJlc29sdmU6ICh2YWx1ZT86IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZCxcclxuICAgICAgICAgICAgICAgIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCxcclxuICAgICAgICAgICAgICAgIGRlcGVuZE9uPzogPFU+KHByb21pc2U6IElQcm9taXNlPFU+IHwgSlF1ZXJ5WEhSKSA9PiBJUHJvbWlzZTxVPixcclxuICAgICAgICAgICAgKSA9PiB2b2lkLFxyXG4gICAgICAgICAgICBvcHRpb25zPzogTWFrZVByb21pc2VPcHRpb25zIHwgY2FuY2VsQ2FsbGJhY2tcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgLy8gYXBwbHkgbWl4aW5cclxuICAgICAgICAgICAgY29uc3QgY2FuY2VsYWJsZSA9IG1ha2VDYW5jZWxhYmxlKCQuRGVmZXJyZWQoKSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIHRoaXMsIGNhbmNlbGFibGUuZGYsIGNhbmNlbGFibGUudGFyZ2V0KTtcclxuICAgICAgICAgICAgdGhpcy5hYm9ydCA9IGNhbmNlbGFibGUuYWJvcnQuYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5kZXBlbmRPbiA9IGNhbmNlbGFibGUuZGVwZW5kT24uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIGV4ZWN1dG9yKHRoaXMucmVzb2x2ZSwgdGhpcy5yZWplY3QsIHRoaXMuZGVwZW5kT24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBzdGF0aWMgbWV0aG9kczpcclxuXHJcbiAgICAgICAgc3RhdGljIHJlc29sdmU8VD4odmFsdWU/OiBUIHwgUHJvbWlzZUxpa2U8VD4pOiBJUHJvbWlzZUJhc2U8VD4ge1xyXG4gICAgICAgICAgICByZXR1cm4gPGFueT4kLkRlZmVycmVkKCkucmVzb2x2ZSh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgcmVqZWN0PFQ+KHJlYXNvbj86IGFueSk6IFByb21pc2U8VD4ge1xyXG4gICAgICAgICAgICByZXR1cm4gPGFueT4kLkRlZmVycmVkKCkucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgYWxsPFQ+KC4uLmRlZmVycmVkczogQXJyYXk8VCB8IElQcm9taXNlPFQ+IHwgSlF1ZXJ5UHJvbWlzZTxUPj4pOiBJUHJvbWlzZUJhc2U8VD4ge1xyXG4gICAgICAgICAgICByZXR1cm4gPGFueT4kLndoZW4oZGVmZXJyZWRzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyB3YWl0PFQ+KC4uLmRlZmVycmVkczogQXJyYXk8VCB8IElQcm9taXNlPFQ+IHwgSlF1ZXJ5UHJvbWlzZTxUPj4pOiBJUHJvbWlzZUJhc2U8VD4ge1xyXG4gICAgICAgICAgICByZXR1cm4gPGFueT53YWl0KGRlZmVycmVkcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgcmFjZTxUPiguLi5kZWZlcnJlZHM6IEFycmF5PFQgfCBJUHJvbWlzZTxUPiB8IEpRdWVyeVByb21pc2U8VD4+KTogSVByb21pc2VCYXNlPFQ+IHtcclxuICAgICAgICAgICAgcmV0dXJuIDxhbnk+cmFjZShkZWZlcnJlZHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY29uc3QgUHJvbWlzZSA9IFByb21pc2VDb25zdHJ1Y3RvcjtcclxufVxyXG5cclxuXHJcbmRlY2xhcmUgbW9kdWxlIFwiY2RwLnByb21pc2VcIiB7XHJcbiAgICBleHBvcnQgPSBDRFA7XHJcbn1cclxuIl19