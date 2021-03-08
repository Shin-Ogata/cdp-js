/*!
 * @cdp/lib-worker 0.9.5
 *   worker library collection
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@cdp/lib-core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@cdp/lib-core'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CDP = global.CDP || {}, global.CDP));
}(this, (function (exports, libCore) { 'use strict';

    /*!
     * @cdp/binary 0.9.5
     *   binary utility module
     */

    /** @internal */ const btoa = libCore.safe(globalThis.btoa);
    /** @internal */ const atob = libCore.safe(globalThis.atob);
    /** @internal */ const Blob$1 = libCore.safe(globalThis.Blob);
    /** @internal */ const FileReader = libCore.safe(globalThis.FileReader);
    /** @internal */ const URL$1 = libCore.safe(globalThis.URL);

    /**
     * @en `base64` utility for independent charactor code.
     * @ja 文字コードに依存しない `base64` ユーティリティ
     */
    class Base64 {
        /**
         * @en Encode a base-64 encoded string from a binary string.
         * @ja 文字列を base64 形式でエンコード
         */
        static encode(src) {
            return btoa(unescape(encodeURIComponent(src)));
        }
        /**
         * @en Decodes a string of data which has been encoded using base-64 encoding.
         * @ja base64 形式でエンコードされたデータの文字列をデコード
         */
        static decode(encoded) {
            return decodeURIComponent(escape(atob(encoded)));
        }
    }

    /** @internal execute read blob */
    function exec(methodName, args, options) {
        const { cancel: token, onprogress } = options;
        token && libCore.verify('instanceOf', libCore.CancelToken, token);
        onprogress && libCore.verify('typeOf', 'function', onprogress);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const subscription = token && token.register(() => {
                reader.abort();
            });
            reader.onabort = reader.onerror = () => {
                reject(reader.error);
            };
            reader.onprogress = onprogress; // eslint-disable-line @typescript-eslint/no-non-null-assertion
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onloadend = () => {
                subscription && subscription.unsubscribe();
            };
            reader[methodName](...args);
        }, token);
    }
    /**
     * @en Get the `ArrayBuffer` result from `Blob` or `File`.
     * @ja `Blob` または `File` から `ArrayBuffer` を取得
     *
     * @param blob
     *  - `en` specified reading target object.
     *  - `ja` 読み取り対象のオブジェクトを指定
     * @param options
     *  - `en` reading options.
     *  - `ja` 読み取りオプションを指定
     */
    function readAsArrayBuffer(blob, options) {
        return exec('readAsArrayBuffer', [blob], { ...options });
    }
    /**
     * @en Get the data-URL string from `Blob` or `File`.
     * @ja `Blob` または `File` から `data-url 文字列を取得
     *
     * @param blob
     *  - `en` specified reading target object.
     *  - `ja` 読み取り対象のオブジェクトを指定
     * @param options
     *  - `en` reading options.
     *  - `ja` 読み取りオプションを指定
     */
    function readAsDataURL(blob, options) {
        return exec('readAsDataURL', [blob], { ...options });
    }
    /**
     * @en Get the text content string from `Blob` or `File`.
     * @ja `Blob` または `File` からテキスト文字列を取得
     *
     * @param blob
     *  - `en` specified reading target object.
     *  - `ja` 読み取り対象のオブジェクトを指定
     * @param encoding
     *  - `en` encoding string to use for the returned data. default: `utf-8`
     *  - `ja` エンコーディングを指定する文字列 既定: `utf-8`
     * @param options
     *  - `en` reading options.
     *  - `ja` 読み取りオプションを指定
     */
    function readAsText(blob, encoding, options) {
        return exec('readAsText', [blob, encoding || undefined], { ...options });
    }

    /**
     * @internal
     * data URI 形式の正規表現
     * 参考: https://developer.mozilla.org/ja/docs/data_URIs
     */
    function queryDataURLContext(dataURL) {
        const context = { base64: false };
        /**
         * [match] 1: mime-type
         *         2: ";base64" を含むオプション
         *         3: data 本体
         */
        const result = /^data:(.+?\/.+?)?(;.+?)?,(.*)$/.exec(dataURL);
        if (null == result) {
            throw new Error(`Invalid data-URL: ${dataURL}`);
        }
        context.mimeType = result[1];
        context.base64 = /;base64/.test(result[2]); // eslint-disable-line @typescript-eslint/prefer-includes
        context.data = result[3];
        return context;
    }
    //__________________________________________________________________________________________________//
    /** @internal helper */
    function binaryStringToBinary(bytes) {
        const array = bytes.split('').map(c => c.charCodeAt(0));
        return new Uint8Array(array);
    }
    /** @internal helper */
    function binaryToBinaryString(binary) {
        return Array.prototype.map.call(binary, (i) => String.fromCharCode(i)).join('');
    }
    /**
     * @en Convert string to binary-string. (not human readable string)
     * @ja バイナリ文字列に変換
     *
     * @param text
     */
    function toBinaryString(text) {
        return unescape(encodeURIComponent(text));
    }
    /**
     * @en Convert string from binary-string.
     * @ja バイナリ文字列から変換
     *
     * @param bytes
     */
    function fromBinaryString(bytes) {
        return decodeURIComponent(escape(bytes));
    }
    /**
     * @en Convert binary to hex-string.
     * @ja バイナリを HEX 文字列に変換
     *
     * @param hex
     */
    function fromHexString(hex) {
        const x = hex.match(/.{1,2}/g);
        return new Uint8Array(null != x ? x.map(byte => parseInt(byte, 16)) : []);
    }
    /**
     * @en Convert string from hex-string.
     * @ja HEX 文字列からバイナリに変換
     *
     * @param binary
     */
    function toHexString(binary) {
        return binary.reduce((str, byte) => str + byte.toString(16).toUpperCase().padStart(2, '0'), '');
    }
    //__________________________________________________________________________________________________//
    /**
     * @en Convert `Blob` to `ArrayBuffer`.
     * @ja `Blob` から `ArrayBuffer` へ変換
     *
     * @param blob
     *  - `en` `Blob` instance
     *  - `ja` `Blob` インスタンスを指定
     * @param options
     */
    function blobToBuffer(blob, options) {
        return readAsArrayBuffer(blob, options);
    }
    /**
     * @en Convert `Blob` to `Uint8Array`.
     * @ja `Blob` から `Uint8Array` へ変換
     *
     * @param blob
     *  - `en` `Blob` instance
     *  - `ja` `Blob` インスタンスを指定
     * @param options
     */
    async function blobToBinary(blob, options) {
        return new Uint8Array(await readAsArrayBuffer(blob, options));
    }
    /**
     * @en Convert `Blob` to data-URL string.
     * @ja `Blob` から data-URL 文字列へ変換
     *
     * @param blob
     *  - `en` `Blob` instance
     *  - `ja` `Blob` インスタンスを指定
     * @param options
     */
    function blobToDataURL(blob, options) {
        return readAsDataURL(blob, options);
    }
    /**
     * @en Convert `Blob` to text string.
     * @ja `Blob` からテキストへ変換
     *
     * @param blob
     *  - `en` `Blob` instance
     *  - `ja` `Blob` インスタンスを指定
     * @param options
     */
    function blobToText(blob, options) {
        const opts = options || {};
        const { encoding } = opts;
        return readAsText(blob, encoding, opts);
    }
    /**
     * @en Convert `Blob` to Base64 string.
     * @ja `Blob` から Base64 文字列へ変換
     *
     * @param blob
     *  - `en` `Blob` instance
     *  - `ja` `Blob` インスタンスを指定
     * @param options
     */
    async function blobToBase64(blob, options) {
        return queryDataURLContext(await readAsDataURL(blob, options)).data;
    }
    //__________________________________________________________________________________________________//
    /**
     * @en Convert `ArrayBuffer` to `Blob`.
     * @ja `ArrayBuffer` から `Blob` に変換
     *
     * @param buffer
     *  - `en` `ArrayBuffer` instance
     *  - `ja` `ArrayBuffer` インスタンスを指定
     * @param mimeType
     *  - `en` mime-type string
     *  - `ja` mime-type 文字列
     */
    function bufferToBlob(buffer, mimeType = "application/octet-stream" /* BINARY */) {
        return new Blob$1([buffer], { type: mimeType });
    }
    /**
     * @en Convert `ArrayBuffer` to `Uint8Array`.
     * @ja `ArrayBuffer` から `Uint8Array` に変換
     *
     * @param buffer
     *  - `en` `ArrayBuffer` instance
     *  - `ja` `ArrayBuffer` インスタンスを指定
     */
    function bufferToBinary(buffer) {
        return new Uint8Array(buffer);
    }
    /**
     * @en Convert `ArrayBuffer` to data-URL string.
     * @ja `ArrayBuffer` から data-URL 文字列に変換
     *
     * @param buffer
     *  - `en` `ArrayBuffer` instance
     *  - `ja` `ArrayBuffer` インスタンスを指定
     * @param mimeType
     *  - `en` mime-type string
     *  - `ja` mime-type 文字列
     */
    function bufferToDataURL(buffer, mimeType = "application/octet-stream" /* BINARY */) {
        return binaryToDataURL(new Uint8Array(buffer), mimeType);
    }
    /**
     * @en Convert `ArrayBuffer` to Base64 string.
     * @ja `ArrayBuffer` から Base64 文字列に変換
     *
     * @param buffer
     *  - `en` `ArrayBuffer` instance
     *  - `ja` `ArrayBuffer` インスタンスを指定
     */
    function bufferToBase64(buffer) {
        return binaryToBase64(new Uint8Array(buffer));
    }
    /**
     * @en Convert `ArrayBuffer` to text string.
     * @ja `ArrayBuffer` からテキストに変換
     *
     * @param buffer
     *  - `en` `ArrayBuffer` instance
     *  - `ja` `ArrayBuffer` インスタンスを指定
     */
    function bufferToText(buffer) {
        return binaryToText(new Uint8Array(buffer));
    }
    //__________________________________________________________________________________________________//
    /**
     * @en Convert `Uint8Array` to `Blob`.
     * @ja `Uint8Array` から `Blob` に変換
     *
     * @param binary
     *  - `en` `Uint8Array` instance
     *  - `ja` `Uint8Array` インスタンスを指定
     * @param mimeType
     *  - `en` mime-type string
     *  - `ja` mime-type 文字列
     */
    function binaryToBlob(binary, mimeType = "application/octet-stream" /* BINARY */) {
        return new Blob$1([binary], { type: mimeType });
    }
    /**
     * @en Convert `Uint8Array` to `ArrayBuffer`.
     * @ja `Uint8Array` から `ArrayBuffer` に変換
     *
     * @param binary
     *  - `en` `Uint8Array` instance
     *  - `ja` `Uint8Array` インスタンスを指定
     */
    function binaryToBuffer(binary) {
        return binary.buffer;
    }
    /**
     * @en Convert `Uint8Array` to data-URL string.
     * @ja `Uint8Array` から data-URL 文字列に変換
     *
     * @param binary
     *  - `en` `Uint8Array` instance
     *  - `ja` `Uint8Array` インスタンスを指定
     * @param mimeType
     *  - `en` mime-type string
     *  - `ja` mime-type 文字列
     */
    function binaryToDataURL(binary, mimeType = "application/octet-stream" /* BINARY */) {
        return `data:${mimeType};base64,${binaryToBase64(binary)}`;
    }
    /**
     * @en Convert `Uint8Array` to Base64 string.
     * @ja `Uint8Array` から Base64 文字列に変換
     *
     * @param binary
     *  - `en` `Uint8Array` instance
     *  - `ja` `Uint8Array` インスタンスを指定
     */
    function binaryToBase64(binary) {
        return Base64.encode(binaryToText(binary));
    }
    /**
     * @en Convert `Uint8Array` to text string.
     * @ja `Uint8Array` から テキストに変換
     *
     * @param binary
     *  - `en` `Uint8Array` instance
     *  - `ja` `Uint8Array` インスタンスを指定
     */
    function binaryToText(binary) {
        return fromBinaryString(binaryToBinaryString(binary));
    }
    //__________________________________________________________________________________________________//
    /**
     * @en Convert Base64 string to `Blob`.
     * @ja Base64 文字列から `Blob` に変換
     *
     * @param base64
     *  - `en` Base64 string data
     *  - `ja` Base64 文字列
     * @param mimeType
     *  - `en` mime-type string
     *  - `ja` mime-type 文字列
     */
    function base64ToBlob(base64, mimeType = "application/octet-stream" /* BINARY */) {
        return binaryToBlob(base64ToBinary(base64), mimeType);
    }
    /**
     * @en Convert Base64 string to `ArrayBuffer`.
     * @ja Base64 文字列から `ArrayBuffer` に変換
     *
     * @param base64
     *  - `en` Base64 string data
     *  - `ja` Base64 文字列
     */
    function base64ToBuffer(base64) {
        return base64ToBinary(base64).buffer;
    }
    /**
     * @en Convert Base64 string to `Uint8Array`.
     * @ja Base64 文字列から `Uint8Array` に変換
     *
     * @param base64
     *  - `en` Base64 string data
     *  - `ja` Base64 文字列
     */
    function base64ToBinary(base64) {
        return binaryStringToBinary(toBinaryString(Base64.decode(base64)));
    }
    /**
     * @en Convert Base64 string to data-URL string.
     * @ja Base64 文字列から data-URL 文字列に変換
     *
     * @param base64
     *  - `en` Base64 string data
     *  - `ja` Base64 文字列
     * @param mimeType
     *  - `en` mime-type string
     *  - `ja` mime-type 文字列
     */
    function base64ToDataURL(base64, mimeType = "application/octet-stream" /* BINARY */) {
        return `data:${mimeType};base64,${base64}`;
    }
    /**
     * @en Convert Base64 string to text string.
     * @ja  Base64 文字列から テキストに変換
     *
     * @param base64
     *  - `en` Base64 string data
     *  - `ja` Base64 文字列
     */
    function base64ToText(base64) {
        return Base64.decode(base64);
    }
    //__________________________________________________________________________________________________//
    /**
     * @en Convert text string to `Blob`.
     * @ja テキストから `Blob` に変換
     *
     * @param text
     *  - `en` text string data
     *  - `ja` テキスト文字列
     * @param mimeType
     *  - `en` mime-type string
     *  - `ja` mime-type 文字列
     */
    function textToBlob(text, mimeType = "text/plain" /* TEXT */) {
        return new Blob$1([text], { type: mimeType });
    }
    /**
     * @en Convert text string to `ArrayBuffer`.
     * @ja テキストから `ArrayBuffer` に変換
     *
     * @param text
     *  - `en` text string data
     *  - `ja` テキスト文字列
     */
    function textToBuffer(text) {
        return textToBinary(text).buffer;
    }
    /**
     * @en Convert text string to `Uint8Array`.
     * @ja テキストから `Uint8Array` に変換
     *
     * @param text
     *  - `en` text string data
     *  - `ja` テキスト文字列
     */
    function textToBinary(text) {
        return binaryStringToBinary(toBinaryString(text));
    }
    /**
     * @en Convert text string to data-URL string.
     * @ja テキストから data-URL 文字列に変換
     *
     * @param text
     *  - `en` text string data
     *  - `ja` テキスト文字列
     * @param mimeType
     *  - `en` mime-type string
     *  - `ja` mime-type 文字列
     */
    function textToDataURL(text, mimeType = "text/plain" /* TEXT */) {
        const base64 = textToBase64(text);
        return `data:${mimeType};base64,${base64}`;
    }
    /**
     * @en Convert text string to Base64 string.
     * @ja テキストから Base64 文字列に変換
     *
     * @param text
     *  - `en` text string data
     *  - `ja` テキスト文字列
     */
    function textToBase64(text) {
        return Base64.encode(text);
    }
    //__________________________________________________________________________________________________//
    /**
     * @en Convert data-URL string to `Blob`.
     * @ja data-URL 文字列から `Blob` に変換
     *
     * @param dataURL
     *  - `en` data-URL string data
     *  - `ja` data-URL 文字列
     */
    function dataURLToBlob(dataURL) {
        const context = queryDataURLContext(dataURL);
        if (context.base64) {
            return base64ToBlob(context.data, context.mimeType || "application/octet-stream" /* BINARY */);
        }
        else {
            return textToBlob(decodeURIComponent(context.data), context.mimeType || "text/plain" /* TEXT */);
        }
    }
    /**
     * @en Convert data-URL string to `ArrayBuffer`.
     * @ja data-URL 文字列から `ArrayBuffer` に変換
     *
     * @param dataURL
     *  - `en` data-URL string data
     *  - `ja` data-URL 文字列
     */
    function dataURLToBuffer(dataURL) {
        return dataURLToBinary(dataURL).buffer;
    }
    /**
     * @en Convert data-URL string to `Uint8Array`.
     * @ja data-URL 文字列から `Uint8Array` に変換
     *
     * @param dataURL
     *  - `en` data-URL string data
     *  - `ja` data-URL 文字列
     */
    function dataURLToBinary(dataURL) {
        return base64ToBinary(dataURLToBase64(dataURL));
    }
    /**
     * @en Convert data-URL string to text string.
     * @ja data-URL 文字列からテキストに変換
     *
     * @param dataURL
     *  - `en` data-URL string data
     *  - `ja` data-URL 文字列
     */
    function dataURLToText(dataURL) {
        return Base64.decode(dataURLToBase64(dataURL));
    }
    /**
     * @en Convert data-URL string to Base64 string.
     * @ja data-URL 文字列から Base64 文字列に変換
     *
     * @param dataURL
     *  - `en` data-URL string data
     *  - `ja` data-URL 文字列
     */
    function dataURLToBase64(dataURL) {
        const context = queryDataURLContext(dataURL);
        if (context.base64) {
            return context.data;
        }
        else {
            return Base64.encode(decodeURIComponent(context.data));
        }
    }
    /**
     * @en Serialize data.
     * @ja データシリアライズ
     *
     * @param data input
     * @param options blob convert options
     */
    async function serialize(data, options) {
        const { cancel } = options || {};
        await libCore.checkCanceled(cancel);
        if (null == data) {
            return String(data);
        }
        else if (data instanceof ArrayBuffer) {
            return bufferToDataURL(data);
        }
        else if (data instanceof Uint8Array) {
            return binaryToDataURL(data);
        }
        else if (data instanceof Blob$1) {
            return blobToDataURL(data, options);
        }
        else {
            return libCore.fromTypedData(data);
        }
    }
    async function deserialize(value, options) {
        const { dataType, cancel } = options || {};
        await libCore.checkCanceled(cancel);
        const data = libCore.restoreNil(libCore.toTypedData(value));
        switch (dataType) {
            case 'string':
                return libCore.fromTypedData(data);
            case 'number':
                return Number(data);
            case 'boolean':
                return Boolean(data);
            case 'object':
                return Object(data);
            case 'buffer':
                return dataURLToBuffer(libCore.fromTypedData(data));
            case 'binary':
                return dataURLToBinary(libCore.fromTypedData(data));
            case 'blob':
                return dataURLToBlob(libCore.fromTypedData(data));
            default:
                return data;
        }
    }

    /** @internal */ const _blobMap = new WeakMap();
    /** @internal */ const _urlSet = new Set();
    /**
     * @en `Blob URL` utility for automatic memory manegement.
     * @ja メモリ自動管理を行う `Blob URL` ユーティリティ
     */
    class BlobURL {
        /**
         * @en Create `Blob URL` from instances.
         * @ja インスタンスを指定して `Blob URL` の構築
         */
        static create(...blobs) {
            for (const b of blobs) {
                const cache = _blobMap.get(b);
                if (cache) {
                    continue;
                }
                const url = URL$1.createObjectURL(b);
                _blobMap.set(b, url);
                _urlSet.add(url);
            }
        }
        /**
         * @en Clear all `Blob URL` cache.
         * @ja すべての `Blob URL` キャッシュを破棄
         */
        static clear() {
            for (const url of _urlSet) {
                URL$1.revokeObjectURL(url);
            }
            _urlSet.clear();
        }
        /**
         * @en Get `Blob URL` from instance.
         * @ja インスタンスを指定して `Blob URL` の取得
         */
        static get(blob) {
            const cache = _blobMap.get(blob);
            if (cache) {
                return cache;
            }
            const url = URL$1.createObjectURL(blob);
            _blobMap.set(blob, url);
            _urlSet.add(url);
            return url;
        }
        /**
         * @en Check `Blob URL` is available from instance.
         * @ja インスタンスを指定して `Blob URL` が有効化判定
         */
        static has(blob) {
            return _blobMap.has(blob);
        }
        /**
         * @en Revoke `Blob URL` from instances.
         * @ja インスタンスを指定して `Blob URL` を無効化
         */
        static revoke(...blobs) {
            for (const b of blobs) {
                const url = _blobMap.get(b);
                if (url) {
                    URL$1.revokeObjectURL(url);
                    _blobMap.delete(b);
                    _urlSet.delete(url);
                }
            }
        }
    }

    /*!
     * @cdp/ajax 0.9.5
     *   ajax utility module
     */

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
            RESULT_CODE[RESULT_CODE["AJAX_DECLARE"] = 9007199254740991] = "AJAX_DECLARE";
            RESULT_CODE[RESULT_CODE["ERROR_AJAX_RESPONSE"] = CDP_DECLARE.DECLARE_ERROR_CODE(100 /* CDP */, 20 /* AJAX */ + 1, 'network error.')] = "ERROR_AJAX_RESPONSE";
            RESULT_CODE[RESULT_CODE["ERROR_AJAX_TIMEOUT"] = CDP_DECLARE.DECLARE_ERROR_CODE(100 /* CDP */, 20 /* AJAX */ + 2, 'request timeout.')] = "ERROR_AJAX_TIMEOUT";
        })();
    })();

    /** @internal */ const _FormData = libCore.safe(globalThis.FormData);
    /** @internal */ const _Headers = libCore.safe(globalThis.Headers);
    /** @internal */ const _AbortController = libCore.safe(globalThis.AbortController);
    /** @internal */ const _URLSearchParams = libCore.safe(globalThis.URLSearchParams);
    /** @internal */ const _XMLHttpRequest = libCore.safe(globalThis.XMLHttpRequest);
    /** @internal */ const _fetch = libCore.safe(globalThis.fetch);

    /** @internal */ let _timeout;
    const settings = {
        get timeout() {
            return _timeout;
        },
        set timeout(value) {
            _timeout = (libCore.isNumber(value) && 0 <= value) ? value : undefined;
        },
    };

    /** @internal */
    const _acceptHeaderMap = {
        text: 'text/plain, text/html, application/xml; q=0.8, text/xml; q=0.8, */*; q=0.01',
        json: 'application/json, text/javascript, */*; q=0.01',
    };
    /**
     * @en Setup `headers` from options parameter.
     * @ja オプションから `headers` を設定
     *
     * @internal
     */
    function setupHeaders(options) {
        const headers = new _Headers(options.headers);
        const { method, contentType, dataType, mode, body, username, password } = options;
        // Content-Type
        if ('POST' === method || 'PUT' === method || 'PATCH' === method) {
            /*
             * fetch() の場合, FormData を自動解釈するため, 指定がある場合は削除
             * https://stackoverflow.com/questions/35192841/fetch-post-with-multipart-form-data
             * https://muffinman.io/uploading-files-using-fetch-multipart-form-data/
             */
            if (headers.get('Content-Type') && body instanceof _FormData) {
                headers.delete('Content-Type');
            }
            else if (!headers.get('Content-Type')) {
                if (null == contentType && 'json' === dataType) {
                    headers.set('Content-Type', 'application/json; charset=UTF-8');
                }
                else if (null != contentType) {
                    headers.set('Content-Type', contentType);
                }
            }
        }
        // Accept
        if (!headers.get('Accept')) {
            headers.set('Accept', _acceptHeaderMap[dataType] || '*/*');
        }
        // X-Requested-With
        if ('cors' !== mode && !headers.get('X-Requested-With')) {
            headers.set('X-Requested-With', 'XMLHttpRequest');
        }
        // Basic Authorization
        if (null != username && !headers.get('Authorization')) {
            headers.set('Authorization', `Basic ${Base64.encode(`${username}:${password || ''}`)}`);
        }
        return headers;
    }
    /** @internal ensure string value */
    function ensureParamValue(prop) {
        const value = libCore.isFunction(prop) ? prop() : prop;
        return undefined !== value ? String(value) : '';
    }
    /**
     * @en Convert `PlainObject` to query strings.
     * @ja `PlainObject` をクエリストリングに変換
     */
    function toQueryStrings(data) {
        const params = [];
        for (const key of Object.keys(data)) {
            const value = ensureParamValue(data[key]);
            if (value) {
                params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            }
        }
        return params.join('&');
    }
    /**
     * @en Convert `PlainObject` to Ajax parameters object.
     * @ja `PlainObject` を Ajax パラメータオブジェクトに変換
     */
    function toAjaxParams(data) {
        const params = {};
        for (const key of Object.keys(data)) {
            const value = ensureParamValue(data[key]);
            if (value) {
                params[key] = value;
            }
        }
        return params;
    }
    /**
     * @en Perform an asynchronous HTTP (Ajax) request.
     * @ja HTTP (Ajax)リクエストの送信
     *
     * @param url
     *  - `en` A string containing the URL to which the request is sent.
     *  - `ja` Ajaxリクエストを送信するURLを指定
     * @param options
     *  - `en` Ajax request settings.
     *  - `ja` Ajaxリクエスト設定
     */
    async function ajax(url, options) {
        const controller = new _AbortController();
        const abort = () => controller.abort();
        const opts = Object.assign({
            method: 'GET',
            dataType: 'response',
            timeout: settings.timeout,
        }, options, {
            signal: controller.signal, // force override
        });
        const { cancel: originalToken, timeout } = opts;
        // cancellation
        if (originalToken) {
            if (originalToken.requested) {
                throw originalToken.reason;
            }
            originalToken.register(abort);
        }
        const source = libCore.CancelToken.source(originalToken);
        const { token } = source;
        token.register(abort);
        // timeout
        if (timeout) {
            setTimeout(() => source.cancel(libCore.makeResult(libCore.RESULT_CODE.ERROR_AJAX_TIMEOUT, 'request timeout')), timeout);
        }
        // normalize
        opts.method = opts.method.toUpperCase();
        // header
        opts.headers = setupHeaders(opts);
        // parse param
        const { method, data, dataType } = opts;
        if (null != data) {
            if (('GET' === method || 'HEAD' === method) && !url.includes('?')) {
                url += `?${toQueryStrings(data)}`;
            }
            else if (null == opts.body) {
                opts.body = new _URLSearchParams(toAjaxParams(data));
            }
        }
        // execute
        const response = await Promise.resolve(_fetch(url, opts), token);
        if ('response' === dataType) {
            return response;
        }
        else if (!response.ok) {
            throw libCore.makeResult(libCore.RESULT_CODE.ERROR_AJAX_RESPONSE, response.statusText, response);
        }
        else {
            return Promise.resolve(response[dataType](), token);
        }
    }
    ajax.settings = settings;

    /** @internal */
    function ensureDataType(dataType) {
        return dataType || 'json';
    }
    /**
     * @en `GET` request shortcut.
     * @ja `GET` リクエストショートカット
     *
     * @param url
     *  - `en` A string containing the URL to which the request is sent.
     *  - `ja` Ajaxリクエストを送信するURLを指定
     * @param data
     *  - `en` Data to be sent to the server.
     *  - `ja` サーバーに送信されるデータ.
     * @param dataType
     *  - `en` Data to be sent to the server.
     *  - `ja` サーバーから返される期待するデータの型を指定
     * @param options
     *  - `en` request settings.
     *  - `ja` リクエスト設定
     */
    function get(url, data, dataType, options) {
        return ajax(url, { ...options, method: 'GET', data, dataType: ensureDataType(dataType) });
    }
    /**
     * @en `GET` text request shortcut.
     * @ja `GET` テキストリクエストショートカット
     *
     * @param url
     *  - `en` A string containing the URL to which the request is sent.
     *  - `ja` Ajaxリクエストを送信するURLを指定
     * @param data
     *  - `en` Data to be sent to the server.
     *  - `ja` サーバーに送信されるデータ.
     * @param options
     *  - `en` request settings.
     *  - `ja` リクエスト設定
     */
    function text(url, data, options) {
        return get(url, data, 'text', options);
    }
    /**
     * @en `GET` JSON request shortcut.
     * @ja `GET` JSON リクエストショートカット
     *
     * @param url
     *  - `en` A string containing the URL to which the request is sent.
     *  - `ja` Ajaxリクエストを送信するURLを指定
     * @param data
     *  - `en` Data to be sent to the server.
     *  - `ja` サーバーに送信されるデータ.
     * @param options
     *  - `en` request settings.
     *  - `ja` リクエスト設定
     */
    function json(url, data, options) {
        return get(url, data, 'json', options);
    }
    /**
     * @en `GET` Blob request shortcut.
     * @ja `GET` Blob リクエストショートカット
     *
     * @param url
     *  - `en` A string containing the URL to which the request is sent.
     *  - `ja` Ajaxリクエストを送信するURLを指定
     * @param data
     *  - `en` Data to be sent to the server.
     *  - `ja` サーバーに送信されるデータ.
     * @param options
     *  - `en` request settings.
     *  - `ja` リクエスト設定
     */
    function blob(url, data, options) {
        return get(url, data, 'blob', options);
    }
    /**
     * @en `POST` request shortcut.
     * @ja `POST` リクエストショートカット
     *
     * @param url
     *  - `en` A string containing the URL to which the request is sent.
     *  - `ja` Ajaxリクエストを送信するURLを指定
     * @param data
     *  - `en` Data to be sent to the server.
     *  - `ja` サーバーに送信されるデータ.
     * @param dataType
     *  - `en` The type of data that you're expecting back from the server.
     *  - `ja` Ajaxリクエストを送信するURLを指定
     * @param options
     *  - `en` request settings.
     *  - `ja` リクエスト設定
     */
    function post(url, data, dataType, options) {
        return ajax(url, { ...options, method: 'POST', data, dataType: ensureDataType(dataType) });
    }
    /**
     * @en Synchronous `GET` request for resource access. <br>
     *     Many browsers have deprecated synchronous XHR support on the main thread entirely.
     * @ja リソース取得のための 同期 `GET` リクエスト. <br>
     *     多くのブラウザではメインスレッドにおける同期的な XHR の対応を全面的に非推奨としているので積極使用は避けること.
     *
     * @param url
     *  - `en` A string containing the URL to which the request is sent.
     *  - `ja` Ajaxリクエストを送信するURLを指定
     * @param dataType
     *  - `en` The type of data that you're expecting back from the server.
     *  - `ja` Ajaxリクエストを送信するURLを指定
     * @param data
     *  - `en` Data to be sent to the server.
     *  - `ja` サーバーに送信されるデータ.
     */
    function resource(url, dataType, data) {
        const xhr = new _XMLHttpRequest();
        if (null != data && !url.includes('?')) {
            url += `?${toQueryStrings(data)}`;
        }
        // synchronous
        xhr.open('GET', url, false);
        const type = ensureDataType(dataType);
        const headers = setupHeaders({ method: 'GET', dataType: type });
        headers.forEach((value, key) => {
            xhr.setRequestHeader(key, value);
        });
        xhr.send(null);
        if (!(200 <= xhr.status && xhr.status < 300)) {
            throw libCore.makeResult(libCore.RESULT_CODE.ERROR_AJAX_RESPONSE, xhr.statusText, xhr);
        }
        return 'json' === type ? JSON.parse(xhr.response) : xhr.response;
    }

    const request = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get: get,
        text: text,
        json: json,
        blob: blob,
        post: post,
        resource: resource
    });

    /*!
     * @cdp/inline-worker 0.9.5
     *   inline web worker utility module
     */

    /** @internal */ const URL = libCore.safe(globalThis.URL);
    /** @internal */ const Worker = libCore.safe(globalThis.Worker);
    /** @internal */ const Blob = libCore.safe(globalThis.Blob);
    /** @internal */
    function createWorkerContext(src) {
        if (!(libCore.isFunction(src) || libCore.isString(src))) {
            throw new TypeError(`${libCore.className(src)} is not a function or string.`);
        }
        return URL.createObjectURL(new Blob([libCore.isFunction(src) ? `(${src.toString()})(self);` : src], { type: 'application/javascript' }));
    }
    /**
     * @en Specified `Worker` class which doesn't require a script file.
     * @ja スクリプトファイルを必要としない `Worker` クラス
     */
    class InlineWorker extends Worker {
        /**
         * constructor
         *
         * @param src
         *  - `en` source function or script body.
         *  - `ja` 実行関数またはスクリプト実体
         * @param options
         *  - `en` worker options.
         *  - `ja` Worker オプション
         */
        constructor(src, options) {
            const context = createWorkerContext(src);
            super(context, options);
            this._context = context;
        }
        ///////////////////////////////////////////////////////////////////////
        // override: Worker
        terminate() {
            super.terminate();
            URL.revokeObjectURL(this._context);
        }
    }

    /**
     * @en Ensure execution in worker thread.
     * @ja ワーカースレッド内で実行を保証
     *
     * @example <br>
     *
     * ```ts
     * const exec = () => {
     *    // this scope is worker scope. you cannot use closure access.
     *    const param = {...};
     *    const method = (p) => {...};
     *    :
     *    return method(param);
     * };
     *
     * const result = await thread(exec);
     * ```
     *
     * @param executor
     *  - `en` implement as function scope.
     *  - `ja` 関数スコープとして実装
     * @param options
     *  - `en` thread options
     *  - `ja` スレッドオプション
     */
    function thread(executor, options) {
        const { cancel: originalToken } = options || {};
        // already cancel
        if (originalToken?.requested) {
            throw originalToken.reason;
        }
        const exec = `(async (self) => {
        try {
            const result = await (${executor.toString()})();
            self.postMessage(result);
        } catch (e) {
            setTimeout(function() { throw e; });
        }
    })(self);`;
        const worker = new InlineWorker(exec, options);
        const abort = () => worker.terminate();
        originalToken?.register(abort);
        const { token } = libCore.CancelToken.source(originalToken);
        return new Promise((resolve, reject) => {
            worker.onerror = ev => {
                ev.preventDefault();
                reject(ev);
                worker.terminate();
            };
            worker.onmessage = ev => {
                resolve(ev.data);
                worker.terminate();
            };
        }, token);
    }

    exports.Base64 = Base64;
    exports.BlobURL = BlobURL;
    exports.InlineWorker = InlineWorker;
    exports.ajax = ajax;
    exports.base64ToBinary = base64ToBinary;
    exports.base64ToBlob = base64ToBlob;
    exports.base64ToBuffer = base64ToBuffer;
    exports.base64ToDataURL = base64ToDataURL;
    exports.base64ToText = base64ToText;
    exports.binaryToBase64 = binaryToBase64;
    exports.binaryToBlob = binaryToBlob;
    exports.binaryToBuffer = binaryToBuffer;
    exports.binaryToDataURL = binaryToDataURL;
    exports.binaryToText = binaryToText;
    exports.blobToBase64 = blobToBase64;
    exports.blobToBinary = blobToBinary;
    exports.blobToBuffer = blobToBuffer;
    exports.blobToDataURL = blobToDataURL;
    exports.blobToText = blobToText;
    exports.bufferToBase64 = bufferToBase64;
    exports.bufferToBinary = bufferToBinary;
    exports.bufferToBlob = bufferToBlob;
    exports.bufferToDataURL = bufferToDataURL;
    exports.bufferToText = bufferToText;
    exports.dataURLToBase64 = dataURLToBase64;
    exports.dataURLToBinary = dataURLToBinary;
    exports.dataURLToBlob = dataURLToBlob;
    exports.dataURLToBuffer = dataURLToBuffer;
    exports.dataURLToText = dataURLToText;
    exports.deserialize = deserialize;
    exports.fromBinaryString = fromBinaryString;
    exports.fromHexString = fromHexString;
    exports.readAsArrayBuffer = readAsArrayBuffer;
    exports.readAsDataURL = readAsDataURL;
    exports.readAsText = readAsText;
    exports.request = request;
    exports.serialize = serialize;
    exports.setupHeaders = setupHeaders;
    exports.textToBase64 = textToBase64;
    exports.textToBinary = textToBinary;
    exports.textToBlob = textToBlob;
    exports.textToBuffer = textToBuffer;
    exports.textToDataURL = textToDataURL;
    exports.thread = thread;
    exports.toAjaxParams = toAjaxParams;
    exports.toBinaryString = toBinaryString;
    exports.toHexString = toHexString;
    exports.toQueryStrings = toQueryStrings;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLXdvcmtlci5qcyIsInNvdXJjZXMiOlsiYmluYXJ5L3Nzci50cyIsImJpbmFyeS9iYXNlNjQudHMiLCJiaW5hcnkvYmxvYi1yZWFkZXIudHMiLCJiaW5hcnkvY29udmVydGVyLnRzIiwiYmluYXJ5L2Jsb2ItdXJsLnRzIiwiYWpheC9yZXN1bHQtY29kZS1kZWZzLnRzIiwiYWpheC9zc3IudHMiLCJhamF4L3NldHRpbmdzLnRzIiwiYWpheC9jb3JlLnRzIiwiYWpheC9yZXF1ZXN0LnRzIiwiaW5saW5lLXdvcmtlci9pbmluZS13b3JrZXIudHMiLCJpbmxpbmUtd29ya2VyL3RocmVhZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzYWZlIH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcblxuLyoqIEBpbnRlcm5hbCAqLyBleHBvcnQgY29uc3QgYnRvYSAgICAgICA9IHNhZmUoZ2xvYmFsVGhpcy5idG9hKTtcbi8qKiBAaW50ZXJuYWwgKi8gZXhwb3J0IGNvbnN0IGF0b2IgICAgICAgPSBzYWZlKGdsb2JhbFRoaXMuYXRvYik7XG4vKiogQGludGVybmFsICovIGV4cG9ydCBjb25zdCBCbG9iICAgICAgID0gc2FmZShnbG9iYWxUaGlzLkJsb2IpO1xuLyoqIEBpbnRlcm5hbCAqLyBleHBvcnQgY29uc3QgRmlsZVJlYWRlciA9IHNhZmUoZ2xvYmFsVGhpcy5GaWxlUmVhZGVyKTtcbi8qKiBAaW50ZXJuYWwgKi8gZXhwb3J0IGNvbnN0IFVSTCAgICAgICAgPSBzYWZlKGdsb2JhbFRoaXMuVVJMKTtcbiIsImltcG9ydCB7IGF0b2IsIGJ0b2EgfSBmcm9tICcuL3Nzcic7XG5cbi8qKlxuICogQGVuIGBiYXNlNjRgIHV0aWxpdHkgZm9yIGluZGVwZW5kZW50IGNoYXJhY3RvciBjb2RlLlxuICogQGphIOaWh+Wtl+OCs+ODvOODieOBq+S+neWtmOOBl+OBquOBhCBgYmFzZTY0YCDjg6bjg7zjg4bjgqPjg6rjg4bjgqNcbiAqL1xuZXhwb3J0IGNsYXNzIEJhc2U2NCB7XG4gICAgLyoqXG4gICAgICogQGVuIEVuY29kZSBhIGJhc2UtNjQgZW5jb2RlZCBzdHJpbmcgZnJvbSBhIGJpbmFyeSBzdHJpbmcuXG4gICAgICogQGphIOaWh+Wtl+WIl+OCkiBiYXNlNjQg5b2i5byP44Gn44Ko44Oz44Kz44O844OJXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBlbmNvZGUoc3JjOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoc3JjKSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBEZWNvZGVzIGEgc3RyaW5nIG9mIGRhdGEgd2hpY2ggaGFzIGJlZW4gZW5jb2RlZCB1c2luZyBiYXNlLTY0IGVuY29kaW5nLlxuICAgICAqIEBqYSBiYXNlNjQg5b2i5byP44Gn44Ko44Oz44Kz44O844OJ44GV44KM44Gf44OH44O844K/44Gu5paH5a2X5YiX44KS44OH44Kz44O844OJXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBkZWNvZGUoZW5jb2RlZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoYXRvYihlbmNvZGVkKSkpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFVua25vd25GdW5jdGlvbiwgdmVyaWZ5IH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcbmltcG9ydCB7IENhbmNlbFRva2VuLCBDYW5jZWxhYmxlIH0gZnJvbSAnQGNkcC9wcm9taXNlJztcbmltcG9ydCB7IEZpbGVSZWFkZXIgfSBmcm9tICcuL3Nzcic7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmludGVyZmFjZSBGaWxlUmVhZGVyQXJnc01hcCB7XG4gICAgcmVhZEFzQXJyYXlCdWZmZXI6IFtCbG9iXTtcbiAgICByZWFkQXNEYXRhVVJMOiBbQmxvYl07XG4gICAgcmVhZEFzVGV4dDogW0Jsb2IsIHN0cmluZyB8IHVuZGVmaW5lZF07XG59XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmludGVyZmFjZSBGaWxlUmVhZGVyUmVzdWx0TWFwIHtcbiAgICByZWFkQXNBcnJheUJ1ZmZlcjogQXJyYXlCdWZmZXI7XG4gICAgcmVhZEFzRGF0YVVSTDogc3RyaW5nO1xuICAgIHJlYWRBc1RleHQ6IHN0cmluZztcbn1cblxuLyoqXG4gKiBAZW4gYEJsb2JgIHJlYWQgb3B0aW9uc1xuICogQGphIGBCbG9iYCDoqq3jgb/lj5bjgorjgqrjg5fjgrfjg6fjg7NcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBCbG9iUmVhZE9wdGlvbnMgZXh0ZW5kcyBDYW5jZWxhYmxlIHtcbiAgICAvKipcbiAgICAgKiBAZW4gUHJvZ3Jlc3MgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICogQGphIOmAsuaNl+OCs+ODvOODq+ODkOODg+OCr+mWouaVsFxuICAgICAqXG4gICAgICogQHBhcmFtIHByb2dyZXNzXG4gICAgICogIC0gYGVuYCB3b3JrZXIgcHJvZ3Jlc3MgZXZlbnRcbiAgICAgKiAgLSBgamFgIHdvcmtlciDpgLLmjZfjgqTjg5njg7Pjg4hcbiAgICAgKi9cbiAgICBvbnByb2dyZXNzPzogKHByb2dyZXNzOiBQcm9ncmVzc0V2ZW50KSA9PiB1bmtub3duO1xufVxuXG4vKiogQGludGVybmFsIGV4ZWN1dGUgcmVhZCBibG9iICovXG5mdW5jdGlvbiBleGVjPFQgZXh0ZW5kcyBrZXlvZiBGaWxlUmVhZGVyUmVzdWx0TWFwPihcbiAgICBtZXRob2ROYW1lOiBULFxuICAgIGFyZ3M6IEZpbGVSZWFkZXJBcmdzTWFwW1RdLFxuICAgIG9wdGlvbnM6IEJsb2JSZWFkT3B0aW9ucyxcbik6IFByb21pc2U8RmlsZVJlYWRlclJlc3VsdE1hcFtUXT4ge1xuICAgIHR5cGUgVFJlc3VsdCA9IEZpbGVSZWFkZXJSZXN1bHRNYXBbVF07XG4gICAgY29uc3QgeyBjYW5jZWw6IHRva2VuLCBvbnByb2dyZXNzIH0gPSBvcHRpb25zO1xuICAgIHRva2VuICYmIHZlcmlmeSgnaW5zdGFuY2VPZicsIENhbmNlbFRva2VuLCB0b2tlbik7XG4gICAgb25wcm9ncmVzcyAmJiB2ZXJpZnkoJ3R5cGVPZicsICdmdW5jdGlvbicsIG9ucHJvZ3Jlc3MpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxUUmVzdWx0PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRva2VuICYmIHRva2VuLnJlZ2lzdGVyKCgpID0+IHtcbiAgICAgICAgICAgIHJlYWRlci5hYm9ydCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVhZGVyLm9uYWJvcnQgPSByZWFkZXIub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICByZWFkZXIub25wcm9ncmVzcyA9IG9ucHJvZ3Jlc3MhOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdCBhcyBUUmVzdWx0KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbiAmJiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgKHJlYWRlclttZXRob2ROYW1lXSBhcyBVbmtub3duRnVuY3Rpb24pKC4uLmFyZ3MpO1xuICAgIH0sIHRva2VuKTtcbn1cblxuLyoqXG4gKiBAZW4gR2V0IHRoZSBgQXJyYXlCdWZmZXJgIHJlc3VsdCBmcm9tIGBCbG9iYCBvciBgRmlsZWAuXG4gKiBAamEgYEJsb2JgIOOBvuOBn+OBryBgRmlsZWAg44GL44KJIGBBcnJheUJ1ZmZlcmAg44KS5Y+W5b6XXG4gKlxuICogQHBhcmFtIGJsb2JcbiAqICAtIGBlbmAgc3BlY2lmaWVkIHJlYWRpbmcgdGFyZ2V0IG9iamVjdC5cbiAqICAtIGBqYWAg6Kqt44G/5Y+W44KK5a++6LGh44Gu44Kq44OW44K444Kn44Kv44OI44KS5oyH5a6aXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogIC0gYGVuYCByZWFkaW5nIG9wdGlvbnMuXG4gKiAgLSBgamFgIOiqreOBv+WPluOCiuOCquODl+OCt+ODp+ODs+OCkuaMh+WumlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZEFzQXJyYXlCdWZmZXIoYmxvYjogQmxvYiwgb3B0aW9ucz86IEJsb2JSZWFkT3B0aW9ucyk6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcbiAgICByZXR1cm4gZXhlYygncmVhZEFzQXJyYXlCdWZmZXInLCBbYmxvYl0sIHsgLi4ub3B0aW9ucyB9KTtcbn1cblxuLyoqXG4gKiBAZW4gR2V0IHRoZSBkYXRhLVVSTCBzdHJpbmcgZnJvbSBgQmxvYmAgb3IgYEZpbGVgLlxuICogQGphIGBCbG9iYCDjgb7jgZ/jga8gYEZpbGVgIOOBi+OCiSBgZGF0YS11cmwg5paH5a2X5YiX44KS5Y+W5b6XXG4gKlxuICogQHBhcmFtIGJsb2JcbiAqICAtIGBlbmAgc3BlY2lmaWVkIHJlYWRpbmcgdGFyZ2V0IG9iamVjdC5cbiAqICAtIGBqYWAg6Kqt44G/5Y+W44KK5a++6LGh44Gu44Kq44OW44K444Kn44Kv44OI44KS5oyH5a6aXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogIC0gYGVuYCByZWFkaW5nIG9wdGlvbnMuXG4gKiAgLSBgamFgIOiqreOBv+WPluOCiuOCquODl+OCt+ODp+ODs+OCkuaMh+WumlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZEFzRGF0YVVSTChibG9iOiBCbG9iLCBvcHRpb25zPzogQmxvYlJlYWRPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gZXhlYygncmVhZEFzRGF0YVVSTCcsIFtibG9iXSwgeyAuLi5vcHRpb25zIH0pO1xufVxuXG4vKipcbiAqIEBlbiBHZXQgdGhlIHRleHQgY29udGVudCBzdHJpbmcgZnJvbSBgQmxvYmAgb3IgYEZpbGVgLlxuICogQGphIGBCbG9iYCDjgb7jgZ/jga8gYEZpbGVgIOOBi+OCieODhuOCreOCueODiOaWh+Wtl+WIl+OCkuWPluW+l1xuICpcbiAqIEBwYXJhbSBibG9iXG4gKiAgLSBgZW5gIHNwZWNpZmllZCByZWFkaW5nIHRhcmdldCBvYmplY3QuXG4gKiAgLSBgamFgIOiqreOBv+WPluOCiuWvvuixoeOBruOCquODluOCuOOCp+OCr+ODiOOCkuaMh+WumlxuICogQHBhcmFtIGVuY29kaW5nXG4gKiAgLSBgZW5gIGVuY29kaW5nIHN0cmluZyB0byB1c2UgZm9yIHRoZSByZXR1cm5lZCBkYXRhLiBkZWZhdWx0OiBgdXRmLThgXG4gKiAgLSBgamFgIOOCqOODs+OCs+ODvOODh+OCo+ODs+OCsOOCkuaMh+WumuOBmeOCi+aWh+Wtl+WIlyDml6Llrpo6IGB1dGYtOGBcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiAgLSBgZW5gIHJlYWRpbmcgb3B0aW9ucy5cbiAqICAtIGBqYWAg6Kqt44G/5Y+W44KK44Kq44OX44K344On44Oz44KS5oyH5a6aXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkQXNUZXh0KGJsb2I6IEJsb2IsIGVuY29kaW5nPzogc3RyaW5nIHwgbnVsbCwgb3B0aW9ucz86IEJsb2JSZWFkT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIGV4ZWMoJ3JlYWRBc1RleHQnLCBbYmxvYiwgZW5jb2RpbmcgfHwgdW5kZWZpbmVkXSwgeyAuLi5vcHRpb25zIH0pO1xufVxuIiwiaW1wb3J0IHtcbiAgICBLZXlzLFxuICAgIFR5cGVzLFxuICAgIFR5cGVUb0tleSxcbiAgICB0b1R5cGVkRGF0YSxcbiAgICBmcm9tVHlwZWREYXRhLFxuICAgIHJlc3RvcmVOaWwsXG59IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQge1xuICAgIENhbmNlbGFibGUsXG4gICAgY2hlY2tDYW5jZWxlZCBhcyBjYyxcbn0gZnJvbSAnQGNkcC9wcm9taXNlJztcbmltcG9ydCB7IEJhc2U2NCB9IGZyb20gJy4vYmFzZTY0JztcbmltcG9ydCB7XG4gICAgQmxvYlJlYWRPcHRpb25zLFxuICAgIHJlYWRBc0FycmF5QnVmZmVyLFxuICAgIHJlYWRBc0RhdGFVUkwsXG4gICAgcmVhZEFzVGV4dCxcbn0gZnJvbSAnLi9ibG9iLXJlYWRlcic7XG5pbXBvcnQgeyBCbG9iIH0gZnJvbSAnLi9zc3InO1xuXG4vKiogQGludGVybmFsICovXG5jb25zdCBlbnVtIE1pbWVUeXBlIHtcbiAgICBCSU5BUlkgPSAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyxcbiAgICBURVhUID0gJ3RleHQvcGxhaW4nLFxufVxuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqIEBpbnRlcm5hbCBkYXRhLVVSTCDlsZ7mgKcgKi9cbmludGVyZmFjZSBEYXRhVVJMQ29udGV4dCB7XG4gICAgbWltZVR5cGU6IHN0cmluZztcbiAgICBiYXNlNjQ6IGJvb2xlYW47XG4gICAgZGF0YTogc3RyaW5nO1xufVxuXG4vKipcbiAqIEBpbnRlcm5hbFxuICogZGF0YSBVUkkg5b2i5byP44Gu5q2j6KaP6KGo54++XG4gKiDlj4LogIM6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2phL2RvY3MvZGF0YV9VUklzXG4gKi9cbmZ1bmN0aW9uIHF1ZXJ5RGF0YVVSTENvbnRleHQoZGF0YVVSTDogc3RyaW5nKTogRGF0YVVSTENvbnRleHQge1xuICAgIGNvbnN0IGNvbnRleHQgPSB7IGJhc2U2NDogZmFsc2UgfSBhcyBEYXRhVVJMQ29udGV4dDtcblxuICAgIC8qKlxuICAgICAqIFttYXRjaF0gMTogbWltZS10eXBlXG4gICAgICogICAgICAgICAyOiBcIjtiYXNlNjRcIiDjgpLlkKvjgoDjgqrjg5fjgrfjg6fjg7NcbiAgICAgKiAgICAgICAgIDM6IGRhdGEg5pys5L2TXG4gICAgICovXG4gICAgY29uc3QgcmVzdWx0ID0gL15kYXRhOiguKz9cXC8uKz8pPyg7Lis/KT8sKC4qKSQvLmV4ZWMoZGF0YVVSTCk7XG4gICAgaWYgKG51bGwgPT0gcmVzdWx0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBkYXRhLVVSTDogJHtkYXRhVVJMfWApO1xuICAgIH1cblxuICAgIGNvbnRleHQubWltZVR5cGUgPSByZXN1bHRbMV07XG4gICAgY29udGV4dC5iYXNlNjQgPSAvO2Jhc2U2NC8udGVzdChyZXN1bHRbMl0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItaW5jbHVkZXNcbiAgICBjb250ZXh0LmRhdGEgPSByZXN1bHRbM107XG5cbiAgICByZXR1cm4gY29udGV4dDtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKiBAaW50ZXJuYWwgaGVscGVyICovXG5mdW5jdGlvbiBiaW5hcnlTdHJpbmdUb0JpbmFyeShieXRlczogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgYXJyYXkgPSBieXRlcy5zcGxpdCgnJykubWFwKGMgPT4gYy5jaGFyQ29kZUF0KDApKTtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXJyYXkpO1xufVxuXG4vKiogQGludGVybmFsIGhlbHBlciAqL1xuZnVuY3Rpb24gYmluYXJ5VG9CaW5hcnlTdHJpbmcoYmluYXJ5OiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGJpbmFyeSwgKGk6IG51bWJlcikgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShpKSkuam9pbignJyk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgc3RyaW5nIHRvIGJpbmFyeS1zdHJpbmcuIChub3QgaHVtYW4gcmVhZGFibGUgc3RyaW5nKVxuICogQGphIOODkOOCpOODiuODquaWh+Wtl+WIl+OBq+WkieaPm1xuICpcbiAqIEBwYXJhbSB0ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0JpbmFyeVN0cmluZyh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQodGV4dCkpO1xufVxuXG4vKipcbiAqIEBlbiBDb252ZXJ0IHN0cmluZyBmcm9tIGJpbmFyeS1zdHJpbmcuXG4gKiBAamEg44OQ44Kk44OK44Oq5paH5a2X5YiX44GL44KJ5aSJ5o+bXG4gKlxuICogQHBhcmFtIGJ5dGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tQmluYXJ5U3RyaW5nKGJ5dGVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKGJ5dGVzKSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgYmluYXJ5IHRvIGhleC1zdHJpbmcuXG4gKiBAamEg44OQ44Kk44OK44Oq44KSIEhFWCDmloflrZfliJfjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gaGV4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tSGV4U3RyaW5nKGhleDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgeCA9IGhleC5tYXRjaCgvLnsxLDJ9L2cpO1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShudWxsICE9IHggPyB4Lm1hcChieXRlID0+IHBhcnNlSW50KGJ5dGUsIDE2KSkgOiBbXSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgc3RyaW5nIGZyb20gaGV4LXN0cmluZy5cbiAqIEBqYSBIRVgg5paH5a2X5YiX44GL44KJ44OQ44Kk44OK44Oq44Gr5aSJ5o+bXG4gKlxuICogQHBhcmFtIGJpbmFyeVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9IZXhTdHJpbmcoYmluYXJ5OiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmluYXJ5LnJlZHVjZSgoc3RyLCBieXRlKSA9PiBzdHIgKyBieXRlLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpLnBhZFN0YXJ0KDIsICcwJyksICcnKTtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIENvbnZlcnQgYEJsb2JgIHRvIGBBcnJheUJ1ZmZlcmAuXG4gKiBAamEgYEJsb2JgIOOBi+OCiSBgQXJyYXlCdWZmZXJgIOOBuOWkieaPm1xuICpcbiAqIEBwYXJhbSBibG9iXG4gKiAgLSBgZW5gIGBCbG9iYCBpbnN0YW5jZVxuICogIC0gYGphYCBgQmxvYmAg44Kk44Oz44K544K/44Oz44K544KS5oyH5a6aXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmxvYlRvQnVmZmVyKGJsb2I6IEJsb2IsIG9wdGlvbnM/OiBCbG9iUmVhZE9wdGlvbnMpOiBQcm9taXNlPEFycmF5QnVmZmVyPiB7XG4gICAgcmV0dXJuIHJlYWRBc0FycmF5QnVmZmVyKGJsb2IsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIEBlbiBDb252ZXJ0IGBCbG9iYCB0byBgVWludDhBcnJheWAuXG4gKiBAamEgYEJsb2JgIOOBi+OCiSBgVWludDhBcnJheWAg44G45aSJ5o+bXG4gKlxuICogQHBhcmFtIGJsb2JcbiAqICAtIGBlbmAgYEJsb2JgIGluc3RhbmNlXG4gKiAgLSBgamFgIGBCbG9iYCDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLmjIflrppcbiAqIEBwYXJhbSBvcHRpb25zXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBibG9iVG9CaW5hcnkoYmxvYjogQmxvYiwgb3B0aW9ucz86IEJsb2JSZWFkT3B0aW9ucyk6IFByb21pc2U8VWludDhBcnJheT4ge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCByZWFkQXNBcnJheUJ1ZmZlcihibG9iLCBvcHRpb25zKSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgYEJsb2JgIHRvIGRhdGEtVVJMIHN0cmluZy5cbiAqIEBqYSBgQmxvYmAg44GL44KJIGRhdGEtVVJMIOaWh+Wtl+WIl+OBuOWkieaPm1xuICpcbiAqIEBwYXJhbSBibG9iXG4gKiAgLSBgZW5gIGBCbG9iYCBpbnN0YW5jZVxuICogIC0gYGphYCBgQmxvYmAg44Kk44Oz44K544K/44Oz44K544KS5oyH5a6aXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmxvYlRvRGF0YVVSTChibG9iOiBCbG9iLCBvcHRpb25zPzogQmxvYlJlYWRPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gcmVhZEFzRGF0YVVSTChibG9iLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCBgQmxvYmAgdG8gdGV4dCBzdHJpbmcuXG4gKiBAamEgYEJsb2JgIOOBi+OCieODhuOCreOCueODiOOBuOWkieaPm1xuICpcbiAqIEBwYXJhbSBibG9iXG4gKiAgLSBgZW5gIGBCbG9iYCBpbnN0YW5jZVxuICogIC0gYGphYCBgQmxvYmAg44Kk44Oz44K544K/44Oz44K544KS5oyH5a6aXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmxvYlRvVGV4dChibG9iOiBCbG9iLCBvcHRpb25zPzogQmxvYlJlYWRPcHRpb25zICYgeyBlbmNvZGluZz86IHN0cmluZyB8IG51bGw7IH0pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IG9wdHMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGNvbnN0IHsgZW5jb2RpbmcgfSA9IG9wdHM7XG4gICAgcmV0dXJuIHJlYWRBc1RleHQoYmxvYiwgZW5jb2RpbmcsIG9wdHMpO1xufVxuXG4vKipcbiAqIEBlbiBDb252ZXJ0IGBCbG9iYCB0byBCYXNlNjQgc3RyaW5nLlxuICogQGphIGBCbG9iYCDjgYvjgokgQmFzZTY0IOaWh+Wtl+WIl+OBuOWkieaPm1xuICpcbiAqIEBwYXJhbSBibG9iXG4gKiAgLSBgZW5gIGBCbG9iYCBpbnN0YW5jZVxuICogIC0gYGphYCBgQmxvYmAg44Kk44Oz44K544K/44Oz44K544KS5oyH5a6aXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYmxvYlRvQmFzZTY0KGJsb2I6IEJsb2IsIG9wdGlvbnM/OiBCbG9iUmVhZE9wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBxdWVyeURhdGFVUkxDb250ZXh0KGF3YWl0IHJlYWRBc0RhdGFVUkwoYmxvYiwgb3B0aW9ucykpLmRhdGE7XG59XG5cbi8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xuXG4vKipcbiAqIEBlbiBDb252ZXJ0IGBBcnJheUJ1ZmZlcmAgdG8gYEJsb2JgLlxuICogQGphIGBBcnJheUJ1ZmZlcmAg44GL44KJIGBCbG9iYCDjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gYnVmZmVyXG4gKiAgLSBgZW5gIGBBcnJheUJ1ZmZlcmAgaW5zdGFuY2VcbiAqICAtIGBqYWAgYEFycmF5QnVmZmVyYCDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLmjIflrppcbiAqIEBwYXJhbSBtaW1lVHlwZVxuICogIC0gYGVuYCBtaW1lLXR5cGUgc3RyaW5nXG4gKiAgLSBgamFgIG1pbWUtdHlwZSDmloflrZfliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlclRvQmxvYihidWZmZXI6IEFycmF5QnVmZmVyLCBtaW1lVHlwZTogc3RyaW5nID0gTWltZVR5cGUuQklOQVJZKTogQmxvYiB7XG4gICAgcmV0dXJuIG5ldyBCbG9iKFtidWZmZXJdLCB7IHR5cGU6IG1pbWVUeXBlIH0pO1xufVxuXG4vKipcbiAqIEBlbiBDb252ZXJ0IGBBcnJheUJ1ZmZlcmAgdG8gYFVpbnQ4QXJyYXlgLlxuICogQGphIGBBcnJheUJ1ZmZlcmAg44GL44KJIGBVaW50OEFycmF5YCDjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gYnVmZmVyXG4gKiAgLSBgZW5gIGBBcnJheUJ1ZmZlcmAgaW5zdGFuY2VcbiAqICAtIGBqYWAgYEFycmF5QnVmZmVyYCDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLmjIflrppcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlclRvQmluYXJ5KGJ1ZmZlcjogQXJyYXlCdWZmZXIpOiBVaW50OEFycmF5IHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCBgQXJyYXlCdWZmZXJgIHRvIGRhdGEtVVJMIHN0cmluZy5cbiAqIEBqYSBgQXJyYXlCdWZmZXJgIOOBi+OCiSBkYXRhLVVSTCDmloflrZfliJfjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gYnVmZmVyXG4gKiAgLSBgZW5gIGBBcnJheUJ1ZmZlcmAgaW5zdGFuY2VcbiAqICAtIGBqYWAgYEFycmF5QnVmZmVyYCDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLmjIflrppcbiAqIEBwYXJhbSBtaW1lVHlwZVxuICogIC0gYGVuYCBtaW1lLXR5cGUgc3RyaW5nXG4gKiAgLSBgamFgIG1pbWUtdHlwZSDmloflrZfliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlclRvRGF0YVVSTChidWZmZXI6IEFycmF5QnVmZmVyLCBtaW1lVHlwZTogc3RyaW5nID0gTWltZVR5cGUuQklOQVJZKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmluYXJ5VG9EYXRhVVJMKG5ldyBVaW50OEFycmF5KGJ1ZmZlciksIG1pbWVUeXBlKTtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCBgQXJyYXlCdWZmZXJgIHRvIEJhc2U2NCBzdHJpbmcuXG4gKiBAamEgYEFycmF5QnVmZmVyYCDjgYvjgokgQmFzZTY0IOaWh+Wtl+WIl+OBq+WkieaPm1xuICpcbiAqIEBwYXJhbSBidWZmZXJcbiAqICAtIGBlbmAgYEFycmF5QnVmZmVyYCBpbnN0YW5jZVxuICogIC0gYGphYCBgQXJyYXlCdWZmZXJgIOOCpOODs+OCueOCv+ODs+OCueOCkuaMh+WumlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVmZmVyVG9CYXNlNjQoYnVmZmVyOiBBcnJheUJ1ZmZlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpbmFyeVRvQmFzZTY0KG5ldyBVaW50OEFycmF5KGJ1ZmZlcikpO1xufVxuXG4vKipcbiAqIEBlbiBDb252ZXJ0IGBBcnJheUJ1ZmZlcmAgdG8gdGV4dCBzdHJpbmcuXG4gKiBAamEgYEFycmF5QnVmZmVyYCDjgYvjgonjg4bjgq3jgrnjg4jjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gYnVmZmVyXG4gKiAgLSBgZW5gIGBBcnJheUJ1ZmZlcmAgaW5zdGFuY2VcbiAqICAtIGBqYWAgYEFycmF5QnVmZmVyYCDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLmjIflrppcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlclRvVGV4dChidWZmZXI6IEFycmF5QnVmZmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmluYXJ5VG9UZXh0KG5ldyBVaW50OEFycmF5KGJ1ZmZlcikpO1xufVxuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqXG4gKiBAZW4gQ29udmVydCBgVWludDhBcnJheWAgdG8gYEJsb2JgLlxuICogQGphIGBVaW50OEFycmF5YCDjgYvjgokgYEJsb2JgIOOBq+WkieaPm1xuICpcbiAqIEBwYXJhbSBiaW5hcnlcbiAqICAtIGBlbmAgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gKiAgLSBgamFgIGBVaW50OEFycmF5YCDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLmjIflrppcbiAqIEBwYXJhbSBtaW1lVHlwZVxuICogIC0gYGVuYCBtaW1lLXR5cGUgc3RyaW5nXG4gKiAgLSBgamFgIG1pbWUtdHlwZSDmloflrZfliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmFyeVRvQmxvYihiaW5hcnk6IFVpbnQ4QXJyYXksIG1pbWVUeXBlOiBzdHJpbmcgPSBNaW1lVHlwZS5CSU5BUlkpOiBCbG9iIHtcbiAgICByZXR1cm4gbmV3IEJsb2IoW2JpbmFyeV0sIHsgdHlwZTogbWltZVR5cGUgfSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgYFVpbnQ4QXJyYXlgIHRvIGBBcnJheUJ1ZmZlcmAuXG4gKiBAamEgYFVpbnQ4QXJyYXlgIOOBi+OCiSBgQXJyYXlCdWZmZXJgIOOBq+WkieaPm1xuICpcbiAqIEBwYXJhbSBiaW5hcnlcbiAqICAtIGBlbmAgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gKiAgLSBgamFgIGBVaW50OEFycmF5YCDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLmjIflrppcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmFyeVRvQnVmZmVyKGJpbmFyeTogVWludDhBcnJheSk6IEFycmF5QnVmZmVyIHtcbiAgICByZXR1cm4gYmluYXJ5LmJ1ZmZlcjtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCBgVWludDhBcnJheWAgdG8gZGF0YS1VUkwgc3RyaW5nLlxuICogQGphIGBVaW50OEFycmF5YCDjgYvjgokgZGF0YS1VUkwg5paH5a2X5YiX44Gr5aSJ5o+bXG4gKlxuICogQHBhcmFtIGJpbmFyeVxuICogIC0gYGVuYCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAqICAtIGBqYWAgYFVpbnQ4QXJyYXlgIOOCpOODs+OCueOCv+ODs+OCueOCkuaMh+WumlxuICogQHBhcmFtIG1pbWVUeXBlXG4gKiAgLSBgZW5gIG1pbWUtdHlwZSBzdHJpbmdcbiAqICAtIGBqYWAgbWltZS10eXBlIOaWh+Wtl+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5VG9EYXRhVVJMKGJpbmFyeTogVWludDhBcnJheSwgbWltZVR5cGU6IHN0cmluZyA9IE1pbWVUeXBlLkJJTkFSWSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBkYXRhOiR7bWltZVR5cGV9O2Jhc2U2NCwke2JpbmFyeVRvQmFzZTY0KGJpbmFyeSl9YDtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCBgVWludDhBcnJheWAgdG8gQmFzZTY0IHN0cmluZy5cbiAqIEBqYSBgVWludDhBcnJheWAg44GL44KJIEJhc2U2NCDmloflrZfliJfjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gYmluYXJ5XG4gKiAgLSBgZW5gIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICogIC0gYGphYCBgVWludDhBcnJheWAg44Kk44Oz44K544K/44Oz44K544KS5oyH5a6aXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlUb0Jhc2U2NChiaW5hcnk6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICAgIHJldHVybiBCYXNlNjQuZW5jb2RlKGJpbmFyeVRvVGV4dChiaW5hcnkpKTtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCBgVWludDhBcnJheWAgdG8gdGV4dCBzdHJpbmcuXG4gKiBAamEgYFVpbnQ4QXJyYXlgIOOBi+OCiSDjg4bjgq3jgrnjg4jjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gYmluYXJ5XG4gKiAgLSBgZW5gIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICogIC0gYGphYCBgVWludDhBcnJheWAg44Kk44Oz44K544K/44Oz44K544KS5oyH5a6aXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlUb1RleHQoYmluYXJ5OiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgICByZXR1cm4gZnJvbUJpbmFyeVN0cmluZyhiaW5hcnlUb0JpbmFyeVN0cmluZyhiaW5hcnkpKTtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIENvbnZlcnQgQmFzZTY0IHN0cmluZyB0byBgQmxvYmAuXG4gKiBAamEgQmFzZTY0IOaWh+Wtl+WIl+OBi+OCiSBgQmxvYmAg44Gr5aSJ5o+bXG4gKlxuICogQHBhcmFtIGJhc2U2NFxuICogIC0gYGVuYCBCYXNlNjQgc3RyaW5nIGRhdGFcbiAqICAtIGBqYWAgQmFzZTY0IOaWh+Wtl+WIl1xuICogQHBhcmFtIG1pbWVUeXBlXG4gKiAgLSBgZW5gIG1pbWUtdHlwZSBzdHJpbmdcbiAqICAtIGBqYWAgbWltZS10eXBlIOaWh+Wtl+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CbG9iKGJhc2U2NDogc3RyaW5nLCBtaW1lVHlwZTogc3RyaW5nID0gTWltZVR5cGUuQklOQVJZKTogQmxvYiB7XG4gICAgcmV0dXJuIGJpbmFyeVRvQmxvYihiYXNlNjRUb0JpbmFyeShiYXNlNjQpLCBtaW1lVHlwZSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgQmFzZTY0IHN0cmluZyB0byBgQXJyYXlCdWZmZXJgLlxuICogQGphIEJhc2U2NCDmloflrZfliJfjgYvjgokgYEFycmF5QnVmZmVyYCDjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gYmFzZTY0XG4gKiAgLSBgZW5gIEJhc2U2NCBzdHJpbmcgZGF0YVxuICogIC0gYGphYCBCYXNlNjQg5paH5a2X5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0J1ZmZlcihiYXNlNjQ6IHN0cmluZyk6IEFycmF5QnVmZmVyIHtcbiAgICByZXR1cm4gYmFzZTY0VG9CaW5hcnkoYmFzZTY0KS5idWZmZXI7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgQmFzZTY0IHN0cmluZyB0byBgVWludDhBcnJheWAuXG4gKiBAamEgQmFzZTY0IOaWh+Wtl+WIl+OBi+OCiSBgVWludDhBcnJheWAg44Gr5aSJ5o+bXG4gKlxuICogQHBhcmFtIGJhc2U2NFxuICogIC0gYGVuYCBCYXNlNjQgc3RyaW5nIGRhdGFcbiAqICAtIGBqYWAgQmFzZTY0IOaWh+Wtl+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CaW5hcnkoYmFzZTY0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICByZXR1cm4gYmluYXJ5U3RyaW5nVG9CaW5hcnkodG9CaW5hcnlTdHJpbmcoQmFzZTY0LmRlY29kZShiYXNlNjQpKSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgQmFzZTY0IHN0cmluZyB0byBkYXRhLVVSTCBzdHJpbmcuXG4gKiBAamEgQmFzZTY0IOaWh+Wtl+WIl+OBi+OCiSBkYXRhLVVSTCDmloflrZfliJfjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gYmFzZTY0XG4gKiAgLSBgZW5gIEJhc2U2NCBzdHJpbmcgZGF0YVxuICogIC0gYGphYCBCYXNlNjQg5paH5a2X5YiXXG4gKiBAcGFyYW0gbWltZVR5cGVcbiAqICAtIGBlbmAgbWltZS10eXBlIHN0cmluZ1xuICogIC0gYGphYCBtaW1lLXR5cGUg5paH5a2X5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0RhdGFVUkwoYmFzZTY0OiBzdHJpbmcsIG1pbWVUeXBlOiBzdHJpbmcgPSBNaW1lVHlwZS5CSU5BUlkpOiBzdHJpbmcge1xuICAgIHJldHVybiBgZGF0YToke21pbWVUeXBlfTtiYXNlNjQsJHtiYXNlNjR9YDtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCBCYXNlNjQgc3RyaW5nIHRvIHRleHQgc3RyaW5nLlxuICogQGphICBCYXNlNjQg5paH5a2X5YiX44GL44KJIOODhuOCreOCueODiOOBq+WkieaPm1xuICpcbiAqIEBwYXJhbSBiYXNlNjRcbiAqICAtIGBlbmAgQmFzZTY0IHN0cmluZyBkYXRhXG4gKiAgLSBgamFgIEJhc2U2NCDmloflrZfliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvVGV4dChiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIEJhc2U2NC5kZWNvZGUoYmFzZTY0KTtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIENvbnZlcnQgdGV4dCBzdHJpbmcgdG8gYEJsb2JgLlxuICogQGphIOODhuOCreOCueODiOOBi+OCiSBgQmxvYmAg44Gr5aSJ5o+bXG4gKlxuICogQHBhcmFtIHRleHRcbiAqICAtIGBlbmAgdGV4dCBzdHJpbmcgZGF0YVxuICogIC0gYGphYCDjg4bjgq3jgrnjg4jmloflrZfliJdcbiAqIEBwYXJhbSBtaW1lVHlwZVxuICogIC0gYGVuYCBtaW1lLXR5cGUgc3RyaW5nXG4gKiAgLSBgamFgIG1pbWUtdHlwZSDmloflrZfliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRleHRUb0Jsb2IodGV4dDogc3RyaW5nLCBtaW1lVHlwZTogc3RyaW5nID0gTWltZVR5cGUuVEVYVCk6IEJsb2Ige1xuICAgIHJldHVybiBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogbWltZVR5cGUgfSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgdGV4dCBzdHJpbmcgdG8gYEFycmF5QnVmZmVyYC5cbiAqIEBqYSDjg4bjgq3jgrnjg4jjgYvjgokgYEFycmF5QnVmZmVyYCDjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gdGV4dFxuICogIC0gYGVuYCB0ZXh0IHN0cmluZyBkYXRhXG4gKiAgLSBgamFgIOODhuOCreOCueODiOaWh+Wtl+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gdGV4dFRvQnVmZmVyKHRleHQ6IHN0cmluZyk6IEFycmF5QnVmZmVyIHtcbiAgICByZXR1cm4gdGV4dFRvQmluYXJ5KHRleHQpLmJ1ZmZlcjtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCB0ZXh0IHN0cmluZyB0byBgVWludDhBcnJheWAuXG4gKiBAamEg44OG44Kt44K544OI44GL44KJIGBVaW50OEFycmF5YCDjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gdGV4dFxuICogIC0gYGVuYCB0ZXh0IHN0cmluZyBkYXRhXG4gKiAgLSBgamFgIOODhuOCreOCueODiOaWh+Wtl+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gdGV4dFRvQmluYXJ5KHRleHQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICAgIHJldHVybiBiaW5hcnlTdHJpbmdUb0JpbmFyeSh0b0JpbmFyeVN0cmluZyh0ZXh0KSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgdGV4dCBzdHJpbmcgdG8gZGF0YS1VUkwgc3RyaW5nLlxuICogQGphIOODhuOCreOCueODiOOBi+OCiSBkYXRhLVVSTCDmloflrZfliJfjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gdGV4dFxuICogIC0gYGVuYCB0ZXh0IHN0cmluZyBkYXRhXG4gKiAgLSBgamFgIOODhuOCreOCueODiOaWh+Wtl+WIl1xuICogQHBhcmFtIG1pbWVUeXBlXG4gKiAgLSBgZW5gIG1pbWUtdHlwZSBzdHJpbmdcbiAqICAtIGBqYWAgbWltZS10eXBlIOaWh+Wtl+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gdGV4dFRvRGF0YVVSTCh0ZXh0OiBzdHJpbmcsIG1pbWVUeXBlOiBzdHJpbmcgPSBNaW1lVHlwZS5URVhUKTogc3RyaW5nIHtcbiAgICBjb25zdCBiYXNlNjQgPSB0ZXh0VG9CYXNlNjQodGV4dCk7XG4gICAgcmV0dXJuIGBkYXRhOiR7bWltZVR5cGV9O2Jhc2U2NCwke2Jhc2U2NH1gO1xufVxuXG4vKipcbiAqIEBlbiBDb252ZXJ0IHRleHQgc3RyaW5nIHRvIEJhc2U2NCBzdHJpbmcuXG4gKiBAamEg44OG44Kt44K544OI44GL44KJIEJhc2U2NCDmloflrZfliJfjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gdGV4dFxuICogIC0gYGVuYCB0ZXh0IHN0cmluZyBkYXRhXG4gKiAgLSBgamFgIOODhuOCreOCueODiOaWh+Wtl+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gdGV4dFRvQmFzZTY0KHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIEJhc2U2NC5lbmNvZGUodGV4dCk7XG59XG5cbi8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xuXG4vKipcbiAqIEBlbiBDb252ZXJ0IGRhdGEtVVJMIHN0cmluZyB0byBgQmxvYmAuXG4gKiBAamEgZGF0YS1VUkwg5paH5a2X5YiX44GL44KJIGBCbG9iYCDjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gZGF0YVVSTFxuICogIC0gYGVuYCBkYXRhLVVSTCBzdHJpbmcgZGF0YVxuICogIC0gYGphYCBkYXRhLVVSTCDmloflrZfliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGFVUkxUb0Jsb2IoZGF0YVVSTDogc3RyaW5nKTogQmxvYiB7XG4gICAgY29uc3QgY29udGV4dCA9IHF1ZXJ5RGF0YVVSTENvbnRleHQoZGF0YVVSTCk7XG4gICAgaWYgKGNvbnRleHQuYmFzZTY0KSB7XG4gICAgICAgIHJldHVybiBiYXNlNjRUb0Jsb2IoY29udGV4dC5kYXRhLCBjb250ZXh0Lm1pbWVUeXBlIHx8IE1pbWVUeXBlLkJJTkFSWSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRleHRUb0Jsb2IoZGVjb2RlVVJJQ29tcG9uZW50KGNvbnRleHQuZGF0YSksIGNvbnRleHQubWltZVR5cGUgfHwgTWltZVR5cGUuVEVYVCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBlbiBDb252ZXJ0IGRhdGEtVVJMIHN0cmluZyB0byBgQXJyYXlCdWZmZXJgLlxuICogQGphIGRhdGEtVVJMIOaWh+Wtl+WIl+OBi+OCiSBgQXJyYXlCdWZmZXJgIOOBq+WkieaPm1xuICpcbiAqIEBwYXJhbSBkYXRhVVJMXG4gKiAgLSBgZW5gIGRhdGEtVVJMIHN0cmluZyBkYXRhXG4gKiAgLSBgamFgIGRhdGEtVVJMIOaWh+Wtl+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGF0YVVSTFRvQnVmZmVyKGRhdGFVUkw6IHN0cmluZyk6IEFycmF5QnVmZmVyIHtcbiAgICByZXR1cm4gZGF0YVVSTFRvQmluYXJ5KGRhdGFVUkwpLmJ1ZmZlcjtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCBkYXRhLVVSTCBzdHJpbmcgdG8gYFVpbnQ4QXJyYXlgLlxuICogQGphIGRhdGEtVVJMIOaWh+Wtl+WIl+OBi+OCiSBgVWludDhBcnJheWAg44Gr5aSJ5o+bXG4gKlxuICogQHBhcmFtIGRhdGFVUkxcbiAqICAtIGBlbmAgZGF0YS1VUkwgc3RyaW5nIGRhdGFcbiAqICAtIGBqYWAgZGF0YS1VUkwg5paH5a2X5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXRhVVJMVG9CaW5hcnkoZGF0YVVSTDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgcmV0dXJuIGJhc2U2NFRvQmluYXJ5KGRhdGFVUkxUb0Jhc2U2NChkYXRhVVJMKSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgZGF0YS1VUkwgc3RyaW5nIHRvIHRleHQgc3RyaW5nLlxuICogQGphIGRhdGEtVVJMIOaWh+Wtl+WIl+OBi+OCieODhuOCreOCueODiOOBq+WkieaPm1xuICpcbiAqIEBwYXJhbSBkYXRhVVJMXG4gKiAgLSBgZW5gIGRhdGEtVVJMIHN0cmluZyBkYXRhXG4gKiAgLSBgamFgIGRhdGEtVVJMIOaWh+Wtl+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGF0YVVSTFRvVGV4dChkYXRhVVJMOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBCYXNlNjQuZGVjb2RlKGRhdGFVUkxUb0Jhc2U2NChkYXRhVVJMKSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgZGF0YS1VUkwgc3RyaW5nIHRvIEJhc2U2NCBzdHJpbmcuXG4gKiBAamEgZGF0YS1VUkwg5paH5a2X5YiX44GL44KJIEJhc2U2NCDmloflrZfliJfjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gZGF0YVVSTFxuICogIC0gYGVuYCBkYXRhLVVSTCBzdHJpbmcgZGF0YVxuICogIC0gYGphYCBkYXRhLVVSTCDmloflrZfliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGFVUkxUb0Jhc2U2NChkYXRhVVJMOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNvbnRleHQgPSBxdWVyeURhdGFVUkxDb250ZXh0KGRhdGFVUkwpO1xuICAgIGlmIChjb250ZXh0LmJhc2U2NCkge1xuICAgICAgICByZXR1cm4gY29udGV4dC5kYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBCYXNlNjQuZW5jb2RlKGRlY29kZVVSSUNvbXBvbmVudChjb250ZXh0LmRhdGEpKTtcbiAgICB9XG59XG5cbi8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xuXG4vKipcbiAqIEBlbiBTZXJpYWxpemFibGUgZGF0YSB0eXBlIGxpc3QuXG4gKiBAamEg44K344Oq44Ki44Op44Kk44K65Y+v6IO944Gq44OH44O844K/5Z6L5LiA6KanXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXphYmxlIHtcbiAgICBzdHJpbmc6IHN0cmluZztcbiAgICBudW1iZXI6IG51bWJlcjtcbiAgICBib29sZWFuOiBib29sZWFuO1xuICAgIG9iamVjdDogb2JqZWN0O1xuICAgIGJ1ZmZlcjogQXJyYXlCdWZmZXI7XG4gICAgYmluYXJ5OiBVaW50OEFycmF5O1xuICAgIGJsb2I6IEJsb2I7XG59XG5cbmV4cG9ydCB0eXBlIFNlcmlhbGl6YWJsZURhdGFUeXBlcyA9IFR5cGVzPFNlcmlhbGl6YWJsZT47XG5leHBvcnQgdHlwZSBTZXJpYWxpemFibGVJbnB1dERhdGFUeXBlcyA9IFNlcmlhbGl6YWJsZURhdGFUeXBlcyB8IG51bGwgfCB1bmRlZmluZWQ7XG5leHBvcnQgdHlwZSBTZXJpYWxpemFibGVLZXlzID0gS2V5czxTZXJpYWxpemFibGU+O1xuZXhwb3J0IHR5cGUgU2VyaWFsaXphYmxlQ2FzdGFibGUgPSBPbWl0PFNlcmlhbGl6YWJsZSwgJ2J1ZmZlcicgfCAnYmluYXJ5JyB8ICdibG9iJz47XG5leHBvcnQgdHlwZSBTZXJpYWxpemFibGVDYXN0YWJsZVR5cGVzID0gVHlwZXM8U2VyaWFsaXphYmxlQ2FzdGFibGU+O1xuZXhwb3J0IHR5cGUgU2VyaWFsaXphYmxlUmV0dXJuVHlwZTxUIGV4dGVuZHMgU2VyaWFsaXphYmxlQ2FzdGFibGVUeXBlcz4gPSBUeXBlVG9LZXk8U2VyaWFsaXphYmxlQ2FzdGFibGUsIFQ+IGV4dGVuZHMgbmV2ZXIgPyBuZXZlciA6IFQgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIEBlbiBEZXNlcmlhbGl6YWJsZSBvcHRpb25zIGludGVyZmFjZS5cbiAqIEBqYSDjg4fjgrfjg6rjgqLjg6njgqTjgrrjgavkvb/nlKjjgZnjgovjgqrjg5fjgrfjg6fjg7NcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZXNlcmlhbGl6ZU9wdGlvbnM8VCBleHRlbmRzIFNlcmlhbGl6YWJsZSA9IFNlcmlhbGl6YWJsZSwgSyBleHRlbmRzIEtleXM8VD4gPSBLZXlzPFQ+PiBleHRlbmRzIENhbmNlbGFibGUge1xuICAgIC8qKiBbW1NlcmlhbGl6YWJsZUtleXNdXSAqL1xuICAgIGRhdGFUeXBlPzogSztcbn1cblxuLyoqXG4gKiBAZW4gU2VyaWFsaXplIGRhdGEuXG4gKiBAamEg44OH44O844K/44K344Oq44Ki44Op44Kk44K6XG4gKlxuICogQHBhcmFtIGRhdGEgaW5wdXRcbiAqIEBwYXJhbSBvcHRpb25zIGJsb2IgY29udmVydCBvcHRpb25zXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXJpYWxpemU8VCBleHRlbmRzIFNlcmlhbGl6YWJsZUlucHV0RGF0YVR5cGVzPihkYXRhOiBULCBvcHRpb25zPzogQmxvYlJlYWRPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7IGNhbmNlbCB9ID0gb3B0aW9ucyB8fCB7fTtcbiAgICBhd2FpdCBjYyhjYW5jZWwpO1xuICAgIGlmIChudWxsID09IGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyhkYXRhKTtcbiAgICB9IGVsc2UgaWYgKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gYnVmZmVyVG9EYXRhVVJMKGRhdGEpO1xuICAgIH0gZWxzZSBpZiAoZGF0YSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGJpbmFyeVRvRGF0YVVSTChkYXRhKTtcbiAgICB9IGVsc2UgaWYgKGRhdGEgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICAgIHJldHVybiBibG9iVG9EYXRhVVJMKGRhdGEsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmcm9tVHlwZWREYXRhKGRhdGEpIGFzIHN0cmluZztcbiAgICB9XG59XG5cbi8qKlxuICogQGVuIERlc2VyaWFsaXplIGRhdGEuXG4gKiBAamEg44OH44O844K/44Gu5b6p5YWDXG4gKlxuICogQHBhcmFtIHZhbHVlIGlucHV0IHN0cmluZyBvciB1bmRlZmluZWQuXG4gKiBAcGFyYW0gb3B0aW9ucyBkZXNlcmlhbGl6ZSBvcHRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXNlcmlhbGl6ZTxUIGV4dGVuZHMgU2VyaWFsaXphYmxlQ2FzdGFibGVUeXBlcyA9IFNlcmlhbGl6YWJsZUNhc3RhYmxlVHlwZXM+KFxuICAgIHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQsIG9wdGlvbnM/OiBEZXNlcmlhbGl6ZU9wdGlvbnM8U2VyaWFsaXphYmxlLCBuZXZlcj5cbik6IFByb21pc2U8U2VyaWFsaXphYmxlUmV0dXJuVHlwZTxUPj47XG5cbi8qKlxuICogQGVuIERlc2VyaWFsaXplIGRhdGEuXG4gKiBAamEg44OH44O844K/44Gu5b6p5YWDXG4gKlxuICogQHBhcmFtIHZhbHVlIGlucHV0IHN0cmluZyBvciB1bmRlZmluZWQuXG4gKiBAcGFyYW0gb3B0aW9ucyBkZXNlcmlhbGl6ZSBvcHRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXNlcmlhbGl6ZTxUIGV4dGVuZHMgU2VyaWFsaXphYmxlS2V5cz4odmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgb3B0aW9uczogRGVzZXJpYWxpemVPcHRpb25zPFNlcmlhbGl6YWJsZSwgVD4pOiBQcm9taXNlPFNlcmlhbGl6YWJsZVtUXSB8IG51bGwgfCB1bmRlZmluZWQ+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVzZXJpYWxpemUodmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgb3B0aW9ucz86IERlc2VyaWFsaXplT3B0aW9ucyk6IFByb21pc2U8U2VyaWFsaXphYmxlRGF0YVR5cGVzIHwgbnVsbCB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IHsgZGF0YVR5cGUsIGNhbmNlbCB9ID0gb3B0aW9ucyB8fCB7fTtcbiAgICBhd2FpdCBjYyhjYW5jZWwpO1xuXG4gICAgY29uc3QgZGF0YSA9IHJlc3RvcmVOaWwodG9UeXBlZERhdGEodmFsdWUpKTtcbiAgICBzd2l0Y2ggKGRhdGFUeXBlKSB7XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gZnJvbVR5cGVkRGF0YShkYXRhKTtcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIoZGF0YSk7XG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4oZGF0YSk7XG4gICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0KGRhdGEpO1xuICAgICAgICBjYXNlICdidWZmZXInOlxuICAgICAgICAgICAgcmV0dXJuIGRhdGFVUkxUb0J1ZmZlcihmcm9tVHlwZWREYXRhKGRhdGEpIGFzIHN0cmluZyk7XG4gICAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgICAgICByZXR1cm4gZGF0YVVSTFRvQmluYXJ5KGZyb21UeXBlZERhdGEoZGF0YSkgYXMgc3RyaW5nKTtcbiAgICAgICAgY2FzZSAnYmxvYic6XG4gICAgICAgICAgICByZXR1cm4gZGF0YVVSTFRvQmxvYihmcm9tVHlwZWREYXRhKGRhdGEpIGFzIHN0cmluZyk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBVUkwgfSBmcm9tICcuL3Nzcic7XG5cbi8qKiBAaW50ZXJuYWwgKi8gY29uc3QgX2Jsb2JNYXAgPSBuZXcgV2Vha01hcDxCbG9iLCBzdHJpbmc+KCk7XG4vKiogQGludGVybmFsICovIGNvbnN0IF91cmxTZXQgID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbi8qKlxuICogQGVuIGBCbG9iIFVSTGAgdXRpbGl0eSBmb3IgYXV0b21hdGljIG1lbW9yeSBtYW5lZ2VtZW50LlxuICogQGphIOODoeODouODquiHquWLleeuoeeQhuOCkuihjOOBhiBgQmxvYiBVUkxgIOODpuODvOODhuOCo+ODquODhuOCo1xuICovXG5leHBvcnQgY2xhc3MgQmxvYlVSTCB7XG4gICAgLyoqXG4gICAgICogQGVuIENyZWF0ZSBgQmxvYiBVUkxgIGZyb20gaW5zdGFuY2VzLlxuICAgICAqIEBqYSDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLmjIflrprjgZfjgaYgYEJsb2IgVVJMYCDjga7mp4vnr4lcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSguLi5ibG9iczogQmxvYltdKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgYiBvZiBibG9icykge1xuICAgICAgICAgICAgY29uc3QgY2FjaGUgPSBfYmxvYk1hcC5nZXQoYik7XG4gICAgICAgICAgICBpZiAoY2FjaGUpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYik7XG4gICAgICAgICAgICBfYmxvYk1hcC5zZXQoYiwgdXJsKTtcbiAgICAgICAgICAgIF91cmxTZXQuYWRkKHVybCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2xlYXIgYWxsIGBCbG9iIFVSTGAgY2FjaGUuXG4gICAgICogQGphIOOBmeOBueOBpuOBriBgQmxvYiBVUkxgIOOCreODo+ODg+OCt+ODpeOCkuegtOajhFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgdXJsIG9mIF91cmxTZXQpIHtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICAgICAgfVxuICAgICAgICBfdXJsU2V0LmNsZWFyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIEdldCBgQmxvYiBVUkxgIGZyb20gaW5zdGFuY2UuXG4gICAgICogQGphIOOCpOODs+OCueOCv+ODs+OCueOCkuaMh+WumuOBl+OBpiBgQmxvYiBVUkxgIOOBruWPluW+l1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0KGJsb2I6IEJsb2IpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjYWNoZSA9IF9ibG9iTWFwLmdldChibG9iKTtcbiAgICAgICAgaWYgKGNhY2hlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FjaGU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgX2Jsb2JNYXAuc2V0KGJsb2IsIHVybCk7XG4gICAgICAgIF91cmxTZXQuYWRkKHVybCk7XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIENoZWNrIGBCbG9iIFVSTGAgaXMgYXZhaWxhYmxlIGZyb20gaW5zdGFuY2UuXG4gICAgICogQGphIOOCpOODs+OCueOCv+ODs+OCueOCkuaMh+WumuOBl+OBpiBgQmxvYiBVUkxgIOOBjOacieWKueWMluWIpOWumlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaGFzKGJsb2I6IEJsb2IpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIF9ibG9iTWFwLmhhcyhibG9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gUmV2b2tlIGBCbG9iIFVSTGAgZnJvbSBpbnN0YW5jZXMuXG4gICAgICogQGphIOOCpOODs+OCueOCv+ODs+OCueOCkuaMh+WumuOBl+OBpiBgQmxvYiBVUkxgIOOCkueEoeWKueWMllxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmV2b2tlKC4uLmJsb2JzOiBCbG9iW10pOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBiIG9mIGJsb2JzKSB7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBfYmxvYk1hcC5nZXQoYik7XG4gICAgICAgICAgICBpZiAodXJsKSB7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgICAgICAgICAgICAgIF9ibG9iTWFwLmRlbGV0ZShiKTtcbiAgICAgICAgICAgICAgICBfdXJsU2V0LmRlbGV0ZSh1cmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG4gLCAgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gLCAgQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXBsdXMtb3BlcmFuZHNcbiAqL1xuXG5uYW1lc3BhY2UgQ0RQX0RFQ0xBUkUge1xuXG4gICAgY29uc3QgZW51bSBMT0NBTF9DT0RFX0JBU0Uge1xuICAgICAgICBBSkFYID0gQ0RQX0tOT1dOX01PRFVMRS5BSkFYICogTE9DQUxfQ09ERV9SQU5HRV9HVUlERS5GVU5DVElPTixcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gRXh0ZW5kcyBlcnJvciBjb2RlIGRlZmluaXRpb25zLlxuICAgICAqIEBqYSDmi6HlvLXpgJrjgqjjg6njg7zjgrPjg7zjg4nlrprnvqlcbiAgICAgKi9cbiAgICBleHBvcnQgZW51bSBSRVNVTFRfQ09ERSB7XG4gICAgICAgIEFKQVhfREVDTEFSRSAgICAgICAgPSBSRVNVTFRfQ09ERV9CQVNFLkRFQ0xBUkUsXG4gICAgICAgIEVSUk9SX0FKQVhfUkVTUE9OU0UgPSBERUNMQVJFX0VSUk9SX0NPREUoUkVTVUxUX0NPREVfQkFTRS5DRFAsIExPQ0FMX0NPREVfQkFTRS5BSkFYICsgMSwgJ25ldHdvcmsgZXJyb3IuJyksXG4gICAgICAgIEVSUk9SX0FKQVhfVElNRU9VVCAgPSBERUNMQVJFX0VSUk9SX0NPREUoUkVTVUxUX0NPREVfQkFTRS5DRFAsIExPQ0FMX0NPREVfQkFTRS5BSkFYICsgMiwgJ3JlcXVlc3QgdGltZW91dC4nKSxcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBzYWZlIH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcblxuLyoqIEBpbnRlcm5hbCAqLyBjb25zdCBfRm9ybURhdGEgICAgICAgID0gc2FmZShnbG9iYWxUaGlzLkZvcm1EYXRhKTtcbi8qKiBAaW50ZXJuYWwgKi8gY29uc3QgX0hlYWRlcnMgICAgICAgICA9IHNhZmUoZ2xvYmFsVGhpcy5IZWFkZXJzKTtcbi8qKiBAaW50ZXJuYWwgKi8gY29uc3QgX0Fib3J0Q29udHJvbGxlciA9IHNhZmUoZ2xvYmFsVGhpcy5BYm9ydENvbnRyb2xsZXIpO1xuLyoqIEBpbnRlcm5hbCAqLyBjb25zdCBfVVJMU2VhcmNoUGFyYW1zID0gc2FmZShnbG9iYWxUaGlzLlVSTFNlYXJjaFBhcmFtcyk7XG4vKiogQGludGVybmFsICovIGNvbnN0IF9YTUxIdHRwUmVxdWVzdCAgPSBzYWZlKGdsb2JhbFRoaXMuWE1MSHR0cFJlcXVlc3QpO1xuLyoqIEBpbnRlcm5hbCAqLyBjb25zdCBfZmV0Y2ggICAgICAgICAgID0gc2FmZShnbG9iYWxUaGlzLmZldGNoKTtcblxuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IHtcbiAgICBfRm9ybURhdGEgYXMgRm9ybURhdGEsXG4gICAgX0hlYWRlcnMgYXMgSGVhZGVycyxcbiAgICBfQWJvcnRDb250cm9sbGVyIGFzIEFib3J0Q29udHJvbGxlcixcbiAgICBfVVJMU2VhcmNoUGFyYW1zIGFzIFVSTFNlYXJjaFBhcmFtcyxcbiAgICBfWE1MSHR0cFJlcXVlc3QgYXMgWE1MSHR0cFJlcXVlc3QsXG4gICAgX2ZldGNoIGFzIGZldGNoLFxufTtcbiIsImltcG9ydCB7IGlzTnVtYmVyIH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcblxuLyoqIEBpbnRlcm5hbCAqLyBsZXQgX3RpbWVvdXQ6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuZXhwb3J0IGNvbnN0IHNldHRpbmdzID0ge1xuICAgIGdldCB0aW1lb3V0KCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiBfdGltZW91dDtcbiAgICB9LFxuICAgIHNldCB0aW1lb3V0KHZhbHVlOiBudW1iZXIgfCB1bmRlZmluZWQpIHtcbiAgICAgICAgX3RpbWVvdXQgPSAoaXNOdW1iZXIodmFsdWUpICYmIDAgPD0gdmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG4gICAgfSxcbn07XG4iLCJpbXBvcnQgeyBQbGFpbk9iamVjdCwgaXNGdW5jdGlvbiB9IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQgeyBDYW5jZWxUb2tlbiB9IGZyb20gJ0BjZHAvcHJvbWlzZSc7XG5pbXBvcnQgeyBSRVNVTFRfQ09ERSwgbWFrZVJlc3VsdCB9IGZyb20gJ0BjZHAvcmVzdWx0JztcbmltcG9ydCB7IEJhc2U2NCB9IGZyb20gJ0BjZHAvYmluYXJ5JztcbmltcG9ydCB7XG4gICAgQWpheERhdGFUeXBlcyxcbiAgICBBamF4T3B0aW9ucyxcbiAgICBBamF4UmVzdWx0LFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgICBGb3JtRGF0YSxcbiAgICBIZWFkZXJzLFxuICAgIEFib3J0Q29udHJvbGxlcixcbiAgICBVUkxTZWFyY2hQYXJhbXMsXG4gICAgZmV0Y2gsXG59IGZyb20gJy4vc3NyJztcbmltcG9ydCB7IHNldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCB0eXBlIEFqYXhIZWFkZXJPcHRpb25zID0gUGljazxBamF4T3B0aW9uczxBamF4RGF0YVR5cGVzPiwgJ2hlYWRlcnMnIHwgJ21ldGhvZCcgfCAnY29udGVudFR5cGUnIHwgJ2RhdGFUeXBlJyB8ICdtb2RlJyB8ICdib2R5JyB8ICd1c2VybmFtZScgfCAncGFzc3dvcmQnPjtcblxuLyoqIEBpbnRlcm5hbCAqL1xuY29uc3QgX2FjY2VwdEhlYWRlck1hcCA9IHtcbiAgICB0ZXh0OiAndGV4dC9wbGFpbiwgdGV4dC9odG1sLCBhcHBsaWNhdGlvbi94bWw7IHE9MC44LCB0ZXh0L3htbDsgcT0wLjgsICovKjsgcT0wLjAxJyxcbiAgICBqc29uOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9qYXZhc2NyaXB0LCAqLyo7IHE9MC4wMScsXG59O1xuXG4vKipcbiAqIEBlbiBTZXR1cCBgaGVhZGVyc2AgZnJvbSBvcHRpb25zIHBhcmFtZXRlci5cbiAqIEBqYSDjgqrjg5fjgrfjg6fjg7PjgYvjgokgYGhlYWRlcnNgIOOCkuioreWumlxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBIZWFkZXJzKG9wdGlvbnM6IEFqYXhIZWFkZXJPcHRpb25zKTogSGVhZGVycyB7XG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycyk7XG4gICAgY29uc3QgeyBtZXRob2QsIGNvbnRlbnRUeXBlLCBkYXRhVHlwZSwgbW9kZSwgYm9keSwgdXNlcm5hbWUsIHBhc3N3b3JkIH0gPSBvcHRpb25zO1xuXG4gICAgLy8gQ29udGVudC1UeXBlXG4gICAgaWYgKCdQT1NUJyA9PT0gbWV0aG9kIHx8ICdQVVQnID09PSBtZXRob2QgfHwgJ1BBVENIJyA9PT0gbWV0aG9kKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIGZldGNoKCkg44Gu5aC05ZCILCBGb3JtRGF0YSDjgpLoh6rli5Xop6Pph4jjgZnjgovjgZ/jgoEsIOaMh+WumuOBjOOBguOCi+WgtOWQiOOBr+WJiumZpFxuICAgICAgICAgKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNTE5Mjg0MS9mZXRjaC1wb3N0LXdpdGgtbXVsdGlwYXJ0LWZvcm0tZGF0YVxuICAgICAgICAgKiBodHRwczovL211ZmZpbm1hbi5pby91cGxvYWRpbmctZmlsZXMtdXNpbmctZmV0Y2gtbXVsdGlwYXJ0LWZvcm0tZGF0YS9cbiAgICAgICAgICovXG4gICAgICAgIGlmIChoZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykgJiYgYm9keSBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgICAgICAgICBoZWFkZXJzLmRlbGV0ZSgnQ29udGVudC1UeXBlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gY29udGVudFR5cGUgJiYgJ2pzb24nID09PSBkYXRhVHlwZSBhcyBBamF4RGF0YVR5cGVzKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG51bGwgIT0gY29udGVudFR5cGUpIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgY29udGVudFR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWNjZXB0XG4gICAgaWYgKCFoZWFkZXJzLmdldCgnQWNjZXB0JykpIHtcbiAgICAgICAgaGVhZGVycy5zZXQoJ0FjY2VwdCcsIF9hY2NlcHRIZWFkZXJNYXBbZGF0YVR5cGUgYXMgQWpheERhdGFUeXBlc10gfHwgJyovKicpO1xuICAgIH1cblxuICAgIC8vIFgtUmVxdWVzdGVkLVdpdGhcbiAgICBpZiAoJ2NvcnMnICE9PSBtb2RlICYmICFoZWFkZXJzLmdldCgnWC1SZXF1ZXN0ZWQtV2l0aCcpKSB7XG4gICAgICAgIGhlYWRlcnMuc2V0KCdYLVJlcXVlc3RlZC1XaXRoJywgJ1hNTEh0dHBSZXF1ZXN0Jyk7XG4gICAgfVxuXG4gICAgLy8gQmFzaWMgQXV0aG9yaXphdGlvblxuICAgIGlmIChudWxsICE9IHVzZXJuYW1lICYmICFoZWFkZXJzLmdldCgnQXV0aG9yaXphdGlvbicpKSB7XG4gICAgICAgIGhlYWRlcnMuc2V0KCdBdXRob3JpemF0aW9uJywgYEJhc2ljICR7QmFzZTY0LmVuY29kZShgJHt1c2VybmFtZX06JHtwYXNzd29yZCB8fCAnJ31gKX1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGVhZGVycztcbn1cblxuLyoqIEBpbnRlcm5hbCBlbnN1cmUgc3RyaW5nIHZhbHVlICovXG5mdW5jdGlvbiBlbnN1cmVQYXJhbVZhbHVlKHByb3A6IHVua25vd24pOiBzdHJpbmcge1xuICAgIGNvbnN0IHZhbHVlID0gaXNGdW5jdGlvbihwcm9wKSA/IHByb3AoKSA6IHByb3A7XG4gICAgcmV0dXJuIHVuZGVmaW5lZCAhPT0gdmFsdWUgPyBTdHJpbmcodmFsdWUpIDogJyc7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgYFBsYWluT2JqZWN0YCB0byBxdWVyeSBzdHJpbmdzLlxuICogQGphIGBQbGFpbk9iamVjdGAg44KS44Kv44Ko44Oq44K544OI44Oq44Oz44Kw44Gr5aSJ5o+bXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1F1ZXJ5U3RyaW5ncyhkYXRhOiBQbGFpbk9iamVjdCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGFyYW1zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGRhdGEpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZW5zdXJlUGFyYW1WYWx1ZShkYXRhW2tleV0pO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKGAke2VuY29kZVVSSUNvbXBvbmVudChrZXkpfT0ke2VuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSl9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgYFBsYWluT2JqZWN0YCB0byBBamF4IHBhcmFtZXRlcnMgb2JqZWN0LlxuICogQGphIGBQbGFpbk9iamVjdGAg44KSIEFqYXgg44OR44Op44Oh44O844K/44Kq44OW44K444Kn44Kv44OI44Gr5aSJ5o+bXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0FqYXhQYXJhbXMoZGF0YTogUGxhaW5PYmplY3QpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkYXRhKSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGVuc3VyZVBhcmFtVmFsdWUoZGF0YVtrZXldKTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBwYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXJhbXM7XG59XG5cbi8qKlxuICogQGVuIFBlcmZvcm0gYW4gYXN5bmNocm9ub3VzIEhUVFAgKEFqYXgpIHJlcXVlc3QuXG4gKiBAamEgSFRUUCAoQWpheCnjg6rjgq/jgqjjgrnjg4jjga7pgIHkv6FcbiAqXG4gKiBAcGFyYW0gdXJsXG4gKiAgLSBgZW5gIEEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFVSTCB0byB3aGljaCB0aGUgcmVxdWVzdCBpcyBzZW50LlxuICogIC0gYGphYCBBamF444Oq44Kv44Ko44K544OI44KS6YCB5L+h44GZ44KLVVJM44KS5oyH5a6aXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogIC0gYGVuYCBBamF4IHJlcXVlc3Qgc2V0dGluZ3MuXG4gKiAgLSBgamFgIEFqYXjjg6rjgq/jgqjjgrnjg4joqK3lrppcbiAqL1xuYXN5bmMgZnVuY3Rpb24gYWpheDxUIGV4dGVuZHMgQWpheERhdGFUeXBlcyB8IG9iamVjdCA9ICdyZXNwb25zZSc+KHVybDogc3RyaW5nLCBvcHRpb25zPzogQWpheE9wdGlvbnM8VD4pOiBQcm9taXNlPEFqYXhSZXN1bHQ8VD4+IHtcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IGFib3J0ID0gKCk6IHZvaWQgPT4gY29udHJvbGxlci5hYm9ydCgpO1xuXG4gICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBkYXRhVHlwZTogJ3Jlc3BvbnNlJyxcbiAgICAgICAgdGltZW91dDogc2V0dGluZ3MudGltZW91dCxcbiAgICB9LCBvcHRpb25zLCB7XG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsIC8vIGZvcmNlIG92ZXJyaWRlXG4gICAgfSk7XG5cbiAgICBjb25zdCB7IGNhbmNlbDogb3JpZ2luYWxUb2tlbiwgdGltZW91dCB9ID0gb3B0cztcblxuICAgIC8vIGNhbmNlbGxhdGlvblxuICAgIGlmIChvcmlnaW5hbFRva2VuKSB7XG4gICAgICAgIGlmIChvcmlnaW5hbFRva2VuLnJlcXVlc3RlZCkge1xuICAgICAgICAgICAgdGhyb3cgb3JpZ2luYWxUb2tlbi5yZWFzb247XG4gICAgICAgIH1cbiAgICAgICAgb3JpZ2luYWxUb2tlbi5yZWdpc3RlcihhYm9ydCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc291cmNlID0gQ2FuY2VsVG9rZW4uc291cmNlKG9yaWdpbmFsVG9rZW4gYXMgQ2FuY2VsVG9rZW4pO1xuICAgIGNvbnN0IHsgdG9rZW4gfSA9IHNvdXJjZTtcbiAgICB0b2tlbi5yZWdpc3RlcihhYm9ydCk7XG5cbiAgICAvLyB0aW1lb3V0XG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBzb3VyY2UuY2FuY2VsKG1ha2VSZXN1bHQoUkVTVUxUX0NPREUuRVJST1JfQUpBWF9USU1FT1VULCAncmVxdWVzdCB0aW1lb3V0JykpLCB0aW1lb3V0KTtcbiAgICB9XG5cbiAgICAvLyBub3JtYWxpemVcbiAgICBvcHRzLm1ldGhvZCA9IG9wdHMubWV0aG9kLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAvLyBoZWFkZXJcbiAgICBvcHRzLmhlYWRlcnMgPSBzZXR1cEhlYWRlcnMob3B0cyk7XG5cbiAgICAvLyBwYXJzZSBwYXJhbVxuICAgIGNvbnN0IHsgbWV0aG9kLCBkYXRhLCBkYXRhVHlwZSB9ID0gb3B0cztcbiAgICBpZiAobnVsbCAhPSBkYXRhKSB7XG4gICAgICAgIGlmICgoJ0dFVCcgPT09IG1ldGhvZCB8fCAnSEVBRCcgPT09IG1ldGhvZCkgJiYgIXVybC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgICAgICB1cmwgKz0gYD8ke3RvUXVlcnlTdHJpbmdzKGRhdGEpfWA7XG4gICAgICAgIH0gZWxzZSBpZiAobnVsbCA9PSBvcHRzLmJvZHkpIHtcbiAgICAgICAgICAgIG9wdHMuYm9keSA9IG5ldyBVUkxTZWFyY2hQYXJhbXModG9BamF4UGFyYW1zKGRhdGEpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGV4ZWN1dGVcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShmZXRjaCh1cmwsIG9wdHMpLCB0b2tlbik7XG4gICAgaWYgKCdyZXNwb25zZScgPT09IGRhdGFUeXBlKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZSBhcyBBamF4UmVzdWx0PFQ+O1xuICAgIH0gZWxzZSBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG1ha2VSZXN1bHQoUkVTVUxUX0NPREUuRVJST1JfQUpBWF9SRVNQT05TRSwgcmVzcG9uc2Uuc3RhdHVzVGV4dCwgcmVzcG9uc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2VbZGF0YVR5cGUgYXMgRXhjbHVkZTxBamF4RGF0YVR5cGVzLCAncmVzcG9uc2UnPl0oKSwgdG9rZW4pO1xuICAgIH1cbn1cblxuYWpheC5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG5leHBvcnQgeyBhamF4IH07XG4iLCJpbXBvcnQgeyBQbGFpbk9iamVjdCB9IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQgeyBSRVNVTFRfQ09ERSwgbWFrZVJlc3VsdCB9IGZyb20gJ0BjZHAvcmVzdWx0JztcbmltcG9ydCB7XG4gICAgQWpheERhdGFUeXBlcyxcbiAgICBBamF4T3B0aW9ucyxcbiAgICBBamF4UmVxdWVzdE9wdGlvbnMsXG4gICAgQWpheFJlc3VsdCxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7XG4gICAgYWpheCxcbiAgICB0b1F1ZXJ5U3RyaW5ncyxcbiAgICBzZXR1cEhlYWRlcnMsXG59IGZyb20gJy4vY29yZSc7XG5pbXBvcnQgeyBYTUxIdHRwUmVxdWVzdCB9IGZyb20gJy4vc3NyJztcblxuLyoqIEBpbnRlcm5hbCAqL1xuZnVuY3Rpb24gZW5zdXJlRGF0YVR5cGUoZGF0YVR5cGU/OiBBamF4RGF0YVR5cGVzKTogQWpheERhdGFUeXBlcyB7XG4gICAgcmV0dXJuIGRhdGFUeXBlIHx8ICdqc29uJztcbn1cblxuLyoqXG4gKiBAZW4gYEdFVGAgcmVxdWVzdCBzaG9ydGN1dC5cbiAqIEBqYSBgR0VUYCDjg6rjgq/jgqjjgrnjg4jjgrfjg6fjg7zjg4jjgqvjg4Pjg4hcbiAqXG4gKiBAcGFyYW0gdXJsXG4gKiAgLSBgZW5gIEEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFVSTCB0byB3aGljaCB0aGUgcmVxdWVzdCBpcyBzZW50LlxuICogIC0gYGphYCBBamF444Oq44Kv44Ko44K544OI44KS6YCB5L+h44GZ44KLVVJM44KS5oyH5a6aXG4gKiBAcGFyYW0gZGF0YVxuICogIC0gYGVuYCBEYXRhIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAqICAtIGBqYWAg44K144O844OQ44O844Gr6YCB5L+h44GV44KM44KL44OH44O844K/LlxuICogQHBhcmFtIGRhdGFUeXBlXG4gKiAgLSBgZW5gIERhdGEgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICogIC0gYGphYCDjgrXjg7zjg5Djg7zjgYvjgonov5TjgZXjgozjgovmnJ/lvoXjgZnjgovjg4fjg7zjgr/jga7lnovjgpLmjIflrppcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiAgLSBgZW5gIHJlcXVlc3Qgc2V0dGluZ3MuXG4gKiAgLSBgamFgIOODquOCr+OCqOOCueODiOioreWumlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0PFQgZXh0ZW5kcyBBamF4RGF0YVR5cGVzIHwgb2JqZWN0ID0gJ2pzb24nPihcbiAgICB1cmw6IHN0cmluZyxcbiAgICBkYXRhPzogUGxhaW5PYmplY3QsXG4gICAgZGF0YVR5cGU/OiBUIGV4dGVuZHMgQWpheERhdGFUeXBlcyA/IFQgOiAnanNvbicsXG4gICAgb3B0aW9ucz86IEFqYXhSZXF1ZXN0T3B0aW9uc1xuKTogUHJvbWlzZTxBamF4UmVzdWx0PFQ+PiB7XG4gICAgcmV0dXJuIGFqYXgodXJsLCB7IC4uLm9wdGlvbnMsIG1ldGhvZDogJ0dFVCcsIGRhdGEsIGRhdGFUeXBlOiBlbnN1cmVEYXRhVHlwZShkYXRhVHlwZSkgfSBhcyBBamF4T3B0aW9uczxUPik7XG59XG5cbi8qKlxuICogQGVuIGBHRVRgIHRleHQgcmVxdWVzdCBzaG9ydGN1dC5cbiAqIEBqYSBgR0VUYCDjg4bjgq3jgrnjg4jjg6rjgq/jgqjjgrnjg4jjgrfjg6fjg7zjg4jjgqvjg4Pjg4hcbiAqXG4gKiBAcGFyYW0gdXJsXG4gKiAgLSBgZW5gIEEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFVSTCB0byB3aGljaCB0aGUgcmVxdWVzdCBpcyBzZW50LlxuICogIC0gYGphYCBBamF444Oq44Kv44Ko44K544OI44KS6YCB5L+h44GZ44KLVVJM44KS5oyH5a6aXG4gKiBAcGFyYW0gZGF0YVxuICogIC0gYGVuYCBEYXRhIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAqICAtIGBqYWAg44K144O844OQ44O844Gr6YCB5L+h44GV44KM44KL44OH44O844K/LlxuICogQHBhcmFtIG9wdGlvbnNcbiAqICAtIGBlbmAgcmVxdWVzdCBzZXR0aW5ncy5cbiAqICAtIGBqYWAg44Oq44Kv44Ko44K544OI6Kit5a6aXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZXh0KHVybDogc3RyaW5nLCBkYXRhPzogUGxhaW5PYmplY3QsIG9wdGlvbnM/OiBBamF4UmVxdWVzdE9wdGlvbnMpOiBQcm9taXNlPEFqYXhSZXN1bHQ8J3RleHQnPj4ge1xuICAgIHJldHVybiBnZXQodXJsLCBkYXRhLCAndGV4dCcsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIEBlbiBgR0VUYCBKU09OIHJlcXVlc3Qgc2hvcnRjdXQuXG4gKiBAamEgYEdFVGAgSlNPTiDjg6rjgq/jgqjjgrnjg4jjgrfjg6fjg7zjg4jjgqvjg4Pjg4hcbiAqXG4gKiBAcGFyYW0gdXJsXG4gKiAgLSBgZW5gIEEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFVSTCB0byB3aGljaCB0aGUgcmVxdWVzdCBpcyBzZW50LlxuICogIC0gYGphYCBBamF444Oq44Kv44Ko44K544OI44KS6YCB5L+h44GZ44KLVVJM44KS5oyH5a6aXG4gKiBAcGFyYW0gZGF0YVxuICogIC0gYGVuYCBEYXRhIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAqICAtIGBqYWAg44K144O844OQ44O844Gr6YCB5L+h44GV44KM44KL44OH44O844K/LlxuICogQHBhcmFtIG9wdGlvbnNcbiAqICAtIGBlbmAgcmVxdWVzdCBzZXR0aW5ncy5cbiAqICAtIGBqYWAg44Oq44Kv44Ko44K544OI6Kit5a6aXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqc29uPFQgZXh0ZW5kcyAnanNvbicgfCBvYmplY3QgPSAnanNvbic+KHVybDogc3RyaW5nLCBkYXRhPzogUGxhaW5PYmplY3QsIG9wdGlvbnM/OiBBamF4UmVxdWVzdE9wdGlvbnMpOiBQcm9taXNlPEFqYXhSZXN1bHQ8VD4+IHtcbiAgICByZXR1cm4gZ2V0PFQ+KHVybCwgZGF0YSwgKCdqc29uJyBhcyBUIGV4dGVuZHMgQWpheERhdGFUeXBlcyA/IFQgOiAnanNvbicpLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBAZW4gYEdFVGAgQmxvYiByZXF1ZXN0IHNob3J0Y3V0LlxuICogQGphIGBHRVRgIEJsb2Ig44Oq44Kv44Ko44K544OI44K344On44O844OI44Kr44OD44OIXG4gKlxuICogQHBhcmFtIHVybFxuICogIC0gYGVuYCBBIHN0cmluZyBjb250YWluaW5nIHRoZSBVUkwgdG8gd2hpY2ggdGhlIHJlcXVlc3QgaXMgc2VudC5cbiAqICAtIGBqYWAgQWpheOODquOCr+OCqOOCueODiOOCkumAgeS/oeOBmeOCi1VSTOOCkuaMh+WumlxuICogQHBhcmFtIGRhdGFcbiAqICAtIGBlbmAgRGF0YSB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gKiAgLSBgamFgIOOCteODvOODkOODvOOBq+mAgeS/oeOBleOCjOOCi+ODh+ODvOOCvy5cbiAqIEBwYXJhbSBvcHRpb25zXG4gKiAgLSBgZW5gIHJlcXVlc3Qgc2V0dGluZ3MuXG4gKiAgLSBgamFgIOODquOCr+OCqOOCueODiOioreWumlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmxvYih1cmw6IHN0cmluZywgZGF0YT86IFBsYWluT2JqZWN0LCBvcHRpb25zPzogQWpheFJlcXVlc3RPcHRpb25zKTogUHJvbWlzZTxBamF4UmVzdWx0PCdibG9iJz4+IHtcbiAgICByZXR1cm4gZ2V0KHVybCwgZGF0YSwgJ2Jsb2InLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBAZW4gYFBPU1RgIHJlcXVlc3Qgc2hvcnRjdXQuXG4gKiBAamEgYFBPU1RgIOODquOCr+OCqOOCueODiOOCt+ODp+ODvOODiOOCq+ODg+ODiFxuICpcbiAqIEBwYXJhbSB1cmxcbiAqICAtIGBlbmAgQSBzdHJpbmcgY29udGFpbmluZyB0aGUgVVJMIHRvIHdoaWNoIHRoZSByZXF1ZXN0IGlzIHNlbnQuXG4gKiAgLSBgamFgIEFqYXjjg6rjgq/jgqjjgrnjg4jjgpLpgIHkv6HjgZnjgotVUkzjgpLmjIflrppcbiAqIEBwYXJhbSBkYXRhXG4gKiAgLSBgZW5gIERhdGEgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICogIC0gYGphYCDjgrXjg7zjg5Djg7zjgavpgIHkv6HjgZXjgozjgovjg4fjg7zjgr8uXG4gKiBAcGFyYW0gZGF0YVR5cGVcbiAqICAtIGBlbmAgVGhlIHR5cGUgb2YgZGF0YSB0aGF0IHlvdSdyZSBleHBlY3RpbmcgYmFjayBmcm9tIHRoZSBzZXJ2ZXIuXG4gKiAgLSBgamFgIEFqYXjjg6rjgq/jgqjjgrnjg4jjgpLpgIHkv6HjgZnjgotVUkzjgpLmjIflrppcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiAgLSBgZW5gIHJlcXVlc3Qgc2V0dGluZ3MuXG4gKiAgLSBgamFgIOODquOCr+OCqOOCueODiOioreWumlxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9zdDxUIGV4dGVuZHMgQWpheERhdGFUeXBlcyB8IG9iamVjdCA9ICdqc29uJz4oXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgZGF0YTogUGxhaW5PYmplY3QsXG4gICAgZGF0YVR5cGU/OiBUIGV4dGVuZHMgQWpheERhdGFUeXBlcyA/IFQgOiAnanNvbicsXG4gICAgb3B0aW9ucz86IEFqYXhSZXF1ZXN0T3B0aW9uc1xuKTogUHJvbWlzZTxBamF4UmVzdWx0PFQ+PiB7XG4gICAgcmV0dXJuIGFqYXgodXJsLCB7IC4uLm9wdGlvbnMsIG1ldGhvZDogJ1BPU1QnLCBkYXRhLCBkYXRhVHlwZTogZW5zdXJlRGF0YVR5cGUoZGF0YVR5cGUpIH0gYXMgQWpheE9wdGlvbnM8VD4pO1xufVxuXG4vKipcbiAqIEBlbiBTeW5jaHJvbm91cyBgR0VUYCByZXF1ZXN0IGZvciByZXNvdXJjZSBhY2Nlc3MuIDxicj5cbiAqICAgICBNYW55IGJyb3dzZXJzIGhhdmUgZGVwcmVjYXRlZCBzeW5jaHJvbm91cyBYSFIgc3VwcG9ydCBvbiB0aGUgbWFpbiB0aHJlYWQgZW50aXJlbHkuXG4gKiBAamEg44Oq44K944O844K55Y+W5b6X44Gu44Gf44KB44GuIOWQjOacnyBgR0VUYCDjg6rjgq/jgqjjgrnjg4guIDxicj5cbiAqICAgICDlpJrjgY/jga7jg5bjg6njgqbjgrbjgafjga/jg6HjgqTjg7Pjgrnjg6zjg4Pjg4njgavjgYrjgZHjgovlkIzmnJ/nmoTjgaogWEhSIOOBruWvvuW/nOOCkuWFqOmdoueahOOBq+mdnuaOqOWlqOOBqOOBl+OBpuOBhOOCi+OBruOBp+epjealteS9v+eUqOOBr+mBv+OBkeOCi+OBk+OBqC5cbiAqXG4gKiBAcGFyYW0gdXJsXG4gKiAgLSBgZW5gIEEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFVSTCB0byB3aGljaCB0aGUgcmVxdWVzdCBpcyBzZW50LlxuICogIC0gYGphYCBBamF444Oq44Kv44Ko44K544OI44KS6YCB5L+h44GZ44KLVVJM44KS5oyH5a6aXG4gKiBAcGFyYW0gZGF0YVR5cGVcbiAqICAtIGBlbmAgVGhlIHR5cGUgb2YgZGF0YSB0aGF0IHlvdSdyZSBleHBlY3RpbmcgYmFjayBmcm9tIHRoZSBzZXJ2ZXIuXG4gKiAgLSBgamFgIEFqYXjjg6rjgq/jgqjjgrnjg4jjgpLpgIHkv6HjgZnjgotVUkzjgpLmjIflrppcbiAqIEBwYXJhbSBkYXRhXG4gKiAgLSBgZW5gIERhdGEgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICogIC0gYGphYCDjgrXjg7zjg5Djg7zjgavpgIHkv6HjgZXjgozjgovjg4fjg7zjgr8uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvdXJjZTxUIGV4dGVuZHMgJ3RleHQnIHwgJ2pzb24nIHwgb2JqZWN0ID0gJ2pzb24nPihcbiAgICB1cmw6IHN0cmluZyxcbiAgICBkYXRhVHlwZT86IFQgZXh0ZW5kcyAndGV4dCcgfCAnanNvbicgPyBUIDogJ2pzb24nLFxuICAgIGRhdGE/OiBQbGFpbk9iamVjdCxcbik6IEFqYXhSZXN1bHQ8VD4ge1xuICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgaWYgKG51bGwgIT0gZGF0YSAmJiAhdXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgdXJsICs9IGA/JHt0b1F1ZXJ5U3RyaW5ncyhkYXRhKX1gO1xuICAgIH1cblxuICAgIC8vIHN5bmNocm9ub3VzXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVybCwgZmFsc2UpO1xuXG4gICAgY29uc3QgdHlwZSA9IGVuc3VyZURhdGFUeXBlKGRhdGFUeXBlKTtcbiAgICBjb25zdCBoZWFkZXJzID0gc2V0dXBIZWFkZXJzKHsgbWV0aG9kOiAnR0VUJywgZGF0YVR5cGU6IHR5cGUgfSk7XG4gICAgaGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsdWUpO1xuICAgIH0pO1xuXG4gICAgeGhyLnNlbmQobnVsbCk7XG4gICAgaWYgKCEoMjAwIDw9IHhoci5zdGF0dXMgJiYgeGhyLnN0YXR1cyA8IDMwMCkpIHtcbiAgICAgICAgdGhyb3cgbWFrZVJlc3VsdChSRVNVTFRfQ09ERS5FUlJPUl9BSkFYX1JFU1BPTlNFLCB4aHIuc3RhdHVzVGV4dCwgeGhyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJ2pzb24nID09PSB0eXBlID8gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpIDogeGhyLnJlc3BvbnNlO1xufVxuIiwiaW1wb3J0IHtcbiAgICBpc0Z1bmN0aW9uLFxuICAgIGlzU3RyaW5nLFxuICAgIGNsYXNzTmFtZSxcbiAgICBzYWZlLFxufSBmcm9tICdAY2RwL2NvcmUtdXRpbHMnO1xuXG4vKipcbiAqIEBlbiBbW0lubGluZVdvcmtlcl1dIHNvdXJjZSB0eXBlIGRlZmluaXRpb24uXG4gKiBAamEgW1tJbmxpbmVXb3JrZXJdXSDjgavmjIflrprlj6/og73jgarjgr3jg7zjgrnlnovlrprnvqlcbiAqL1xuZXhwb3J0IHR5cGUgSW5saWVuV29ya2VyU291cmNlID0gKChzZWxmOiBXb3JrZXIpID0+IHVua25vd24pIHwgc3RyaW5nO1xuXG4vKiogQGludGVybmFsICovIGNvbnN0IFVSTCAgICA9IHNhZmUoZ2xvYmFsVGhpcy5VUkwpO1xuLyoqIEBpbnRlcm5hbCAqLyBjb25zdCBXb3JrZXIgPSBzYWZlKGdsb2JhbFRoaXMuV29ya2VyKTtcbi8qKiBAaW50ZXJuYWwgKi8gY29uc3QgQmxvYiAgID0gc2FmZShnbG9iYWxUaGlzLkJsb2IpO1xuXG4vKiogQGludGVybmFsICovXG5mdW5jdGlvbiBjcmVhdGVXb3JrZXJDb250ZXh0KHNyYzogSW5saWVuV29ya2VyU291cmNlKTogc3RyaW5nIHtcbiAgICBpZiAoIShpc0Z1bmN0aW9uKHNyYykgfHwgaXNTdHJpbmcoc3JjKSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHtjbGFzc05hbWUoc3JjKX0gaXMgbm90IGEgZnVuY3Rpb24gb3Igc3RyaW5nLmApO1xuICAgIH1cbiAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbaXNGdW5jdGlvbihzcmMpID8gYCgke3NyYy50b1N0cmluZygpfSkoc2VsZik7YCA6IHNyY10sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnIH0pKTtcbn1cblxuLyoqXG4gKiBAZW4gU3BlY2lmaWVkIGBXb3JrZXJgIGNsYXNzIHdoaWNoIGRvZXNuJ3QgcmVxdWlyZSBhIHNjcmlwdCBmaWxlLlxuICogQGphIOOCueOCr+ODquODl+ODiOODleOCoeOCpOODq+OCkuW/heimgeOBqOOBl+OBquOBhCBgV29ya2VyYCDjgq/jg6njgrlcbiAqL1xuZXhwb3J0IGNsYXNzIElubGluZVdvcmtlciBleHRlbmRzIFdvcmtlciB7XG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByaXZhdGUgX2NvbnRleHQ6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIGNvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3JjXG4gICAgICogIC0gYGVuYCBzb3VyY2UgZnVuY3Rpb24gb3Igc2NyaXB0IGJvZHkuXG4gICAgICogIC0gYGphYCDlrp/ooYzplqLmlbDjgb7jgZ/jga/jgrnjgq/jg6rjg5fjg4jlrp/kvZNcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAtIGBlbmAgd29ya2VyIG9wdGlvbnMuXG4gICAgICogIC0gYGphYCBXb3JrZXIg44Kq44OX44K344On44OzXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc3JjOiBJbmxpZW5Xb3JrZXJTb3VyY2UsIG9wdGlvbnM/OiBXb3JrZXJPcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBjcmVhdGVXb3JrZXJDb250ZXh0KHNyYyk7XG4gICAgICAgIHN1cGVyKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBvdmVycmlkZTogV29ya2VyXG5cbiAgICB0ZXJtaW5hdGUoKTogdm9pZCB7XG4gICAgICAgIHN1cGVyLnRlcm1pbmF0ZSgpO1xuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHRoaXMuX2NvbnRleHQpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENhbmNlbGFibGUsIENhbmNlbFRva2VuIH0gZnJvbSAnQGNkcC9wcm9taXNlJztcbmltcG9ydCB7IElubGluZVdvcmtlciB9IGZyb20gJy4vaW5pbmUtd29ya2VyJztcblxuLyoqXG4gKiBAZW4gVGhyZWFkIG9wdGlvbnNcbiAqIEBlbiDjgrnjg6zjg4Pjg4njgqrjg5fjgrfjg6fjg7NcbiAqL1xuZXhwb3J0IHR5cGUgVGhyZWFkT3B0aW9ucyA9IENhbmNlbGFibGUgJiBXb3JrZXJPcHRpb25zO1xuXG4vKipcbiAqIEBlbiBFbnN1cmUgZXhlY3V0aW9uIGluIHdvcmtlciB0aHJlYWQuXG4gKiBAamEg44Ov44O844Kr44O844K544Os44OD44OJ5YaF44Gn5a6f6KGM44KS5L+d6Ki8XG4gKlxuICogQGV4YW1wbGUgPGJyPlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBleGVjID0gKCkgPT4ge1xuICogICAgLy8gdGhpcyBzY29wZSBpcyB3b3JrZXIgc2NvcGUuIHlvdSBjYW5ub3QgdXNlIGNsb3N1cmUgYWNjZXNzLlxuICogICAgY29uc3QgcGFyYW0gPSB7Li4ufTtcbiAqICAgIGNvbnN0IG1ldGhvZCA9IChwKSA9PiB7Li4ufTtcbiAqICAgIDpcbiAqICAgIHJldHVybiBtZXRob2QocGFyYW0pO1xuICogfTtcbiAqXG4gKiBjb25zdCByZXN1bHQgPSBhd2FpdCB0aHJlYWQoZXhlYyk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gZXhlY3V0b3JcbiAqICAtIGBlbmAgaW1wbGVtZW50IGFzIGZ1bmN0aW9uIHNjb3BlLlxuICogIC0gYGphYCDplqLmlbDjgrnjgrPjg7zjg5fjgajjgZfjgablrp/oo4VcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiAgLSBgZW5gIHRocmVhZCBvcHRpb25zXG4gKiAgLSBgamFgIOOCueODrOODg+ODieOCquODl+OCt+ODp+ODs1xuICovXG5leHBvcnQgZnVuY3Rpb24gdGhyZWFkPFQ+KGV4ZWN1dG9yOiAoKSA9PiBUIHwgUHJvbWlzZTxUPiwgb3B0aW9ucz86IFRocmVhZE9wdGlvbnMpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCB7IGNhbmNlbDogb3JpZ2luYWxUb2tlbiB9ID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8vIGFscmVhZHkgY2FuY2VsXG4gICAgaWYgKG9yaWdpbmFsVG9rZW4/LnJlcXVlc3RlZCkge1xuICAgICAgICB0aHJvdyBvcmlnaW5hbFRva2VuLnJlYXNvbjtcbiAgICB9XG5cbiAgICBjb25zdCBleGVjID0gYChhc3luYyAoc2VsZikgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKCR7ZXhlY3V0b3IudG9TdHJpbmcoKX0pKCk7XG4gICAgICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRocm93IGU7IH0pO1xuICAgICAgICB9XG4gICAgfSkoc2VsZik7YDtcblxuICAgIGNvbnN0IHdvcmtlciA9IG5ldyBJbmxpbmVXb3JrZXIoZXhlYywgb3B0aW9ucyk7XG5cbiAgICBjb25zdCBhYm9ydCA9ICgpOiB2b2lkID0+IHdvcmtlci50ZXJtaW5hdGUoKTtcbiAgICBvcmlnaW5hbFRva2VuPy5yZWdpc3RlcihhYm9ydCk7XG4gICAgY29uc3QgeyB0b2tlbiB9ID0gQ2FuY2VsVG9rZW4uc291cmNlKG9yaWdpbmFsVG9rZW4gYXMgQ2FuY2VsVG9rZW4pO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgd29ya2VyLm9uZXJyb3IgPSBldiA9PiB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmVqZWN0KGV2KTtcbiAgICAgICAgICAgIHdvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgd29ya2VyLm9ubWVzc2FnZSA9IGV2ID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoZXYuZGF0YSk7XG4gICAgICAgICAgICB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgIH07XG4gICAgfSwgdG9rZW4pO1xufVxuIl0sIm5hbWVzIjpbInNhZmUiLCJCbG9iIiwiVVJMIiwidmVyaWZ5IiwiQ2FuY2VsVG9rZW4iLCJjYyIsImZyb21UeXBlZERhdGEiLCJyZXN0b3JlTmlsIiwidG9UeXBlZERhdGEiLCJpc051bWJlciIsIkhlYWRlcnMiLCJGb3JtRGF0YSIsImlzRnVuY3Rpb24iLCJBYm9ydENvbnRyb2xsZXIiLCJtYWtlUmVzdWx0IiwiUkVTVUxUX0NPREUiLCJVUkxTZWFyY2hQYXJhbXMiLCJmZXRjaCIsIlhNTEh0dHBSZXF1ZXN0IiwiaXNT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QUFDUixrQkFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFVLEdBQUcsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckksQ0FBQztJQUVEOzs7O1VBSWEsWUFBYSxTQUFRLE1BQU07Ozs7Ozs7Ozs7O1FBY3BDLFlBQVksR0FBdUIsRUFBRSxPQUF1QjtZQUN4RCxNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QyxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1NBQzNCOzs7UUFLRCxTQUFTO1lBQ0wsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2xCLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3RDOzs7SUM5Q0w7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7YUF5QmdCLE1BQU0sQ0FBSSxRQUE4QixFQUFFLE9BQXVCO1FBQzdFLE1BQU0sRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQzs7UUFHaEQsSUFBSSxhQUFhLEVBQUUsU0FBUyxFQUFFO1lBQzFCLE1BQU0sYUFBYSxDQUFDLE1BQU0sQ0FBQztTQUM5QjtRQUVELE1BQU0sSUFBSSxHQUFHOztvQ0FFbUIsUUFBUSxDQUFDLFFBQVEsRUFBRTs7Ozs7Y0FLekMsQ0FBQztRQUVYLE1BQU0sTUFBTSxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUvQyxNQUFNLEtBQUssR0FBRyxNQUFZLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM3QyxhQUFhLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBR1IsbUJBQVcsQ0FBQyxNQUFNLENBQUMsYUFBNEIsQ0FBQyxDQUFDO1FBRW5FLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2YsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNwQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQ3RCLENBQUM7WUFDRixNQUFNLENBQUMsU0FBUyxHQUFHLEVBQUU7Z0JBQ2pCLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUN0QixDQUFDO1NBQ0wsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNkOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Iiwic291cmNlUm9vdCI6ImNkcDovLy9AY2RwL2xpYi13b3JrZXIvIn0=
