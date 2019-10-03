/*!
 * @cdp/ajax 0.9.0
 *   ajax utility module
 */

import { isNumber, safe, isFunction } from '@cdp/core-utils';
import { CancelToken } from '@cdp/promise';
import { makeCanceledResult, makeResult, RESULT_CODE } from '@cdp/result';
import { Base64 } from '@cdp/binary';

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars, @typescript-eslint/restrict-plus-operands */
globalThis.CDP_DECLARE = globalThis.CDP_DECLARE;
(function () {
    /**
     * @en Extends error code definitions.
     * @ja 拡張通エラーコード定義
     */
    let RESULT_CODE = CDP_DECLARE.RESULT_CODE;
    (function () {
        RESULT_CODE[RESULT_CODE["ERROR_AJAX_RESPONSE"] = CDP_DECLARE.DECLARE_ERROR_CODE(100 /* CDP */, 20 /* AJAX */ + 1, 'network error.')] = "ERROR_AJAX_RESPONSE";
        RESULT_CODE[RESULT_CODE["ERROR_AJAX_TIMEOUT"] = CDP_DECLARE.DECLARE_ERROR_CODE(100 /* CDP */, 20 /* AJAX */ + 2, 'request timeout.')] = "ERROR_AJAX_TIMEOUT";
    })();
})();

let _timeout;
const settings = {
    get timeout() {
        return _timeout;
    },
    set timeout(value) {
        _timeout = (isNumber(value) && 0 <= value) ? value : undefined;
    },
};

const _FormData = safe(globalThis.FormData);
const _Headers = safe(globalThis.Headers);
const _AbortController = safe(globalThis.AbortController);
const _URLSearchParams = safe(globalThis.URLSearchParams);
const _XMLHttpRequest = safe(globalThis.XMLHttpRequest);
const _fetch = safe(globalThis.fetch);

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
/** ensure string value */
function ensureParamValue(prop) {
    const value = isFunction(prop) ? prop() : prop;
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
        signal: controller.signal,
    });
    const { cancel: originalToken, timeout } = opts;
    // cancellation
    if (originalToken) {
        if (originalToken.requested) {
            throw makeCanceledResult();
        }
        originalToken.register(abort);
    }
    const source = CancelToken.source(originalToken);
    const { token } = source;
    token.register(abort);
    // timeout
    if (timeout) {
        setTimeout(() => source.cancel(makeResult(RESULT_CODE.ERROR_AJAX_TIMEOUT, 'request timeout')), timeout);
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
        throw makeResult(RESULT_CODE.ERROR_AJAX_RESPONSE, response.statusText, response);
    }
    else {
        return Promise.resolve(response[dataType](), token);
    }
}

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
        throw makeResult(RESULT_CODE.ERROR_AJAX_RESPONSE, xhr.statusText, xhr);
    }
    return 'json' === type ? JSON.parse(xhr.response) : xhr.response;
}

var request = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get: get,
    text: text,
    json: json,
    blob: blob,
    post: post,
    resource: resource
});

export { ajax, request, settings, setupHeaders, toAjaxParams, toQueryStrings };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheC5tanMiLCJzb3VyY2VzIjpbInJlc3VsdC1jb2RlLWRlZnMudHMiLCJzZXR0aW5ncy50cyIsInNzci50cyIsImNvcmUudHMiLCJyZXF1ZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2UsIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFycywgQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXBsdXMtb3BlcmFuZHMgKi9cblxubmFtZXNwYWNlIENEUF9ERUNMQVJFIHtcblxuICAgIGNvbnN0IGVudW0gTE9DQUxfQ09ERV9CQVNFIHtcbiAgICAgICAgQUpBWCA9IENEUF9LTk9XTl9NT0RVTEUuQUpBWCAqIExPQ0FMX0NPREVfUkFOR0VfR1VJREUuRlVOQ1RJT04sXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIEV4dGVuZHMgZXJyb3IgY29kZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAamEg5ouh5by16YCa44Ko44Op44O844Kz44O844OJ5a6a576pXG4gICAgICovXG4gICAgZXhwb3J0IGVudW0gUkVTVUxUX0NPREUge1xuICAgICAgICBFUlJPUl9BSkFYX1JFU1BPTlNFID0gREVDTEFSRV9FUlJPUl9DT0RFKFJFU1VMVF9DT0RFX0JBU0UuQ0RQLCBMT0NBTF9DT0RFX0JBU0UuQUpBWCArIDEsICduZXR3b3JrIGVycm9yLicpLFxuICAgICAgICBFUlJPUl9BSkFYX1RJTUVPVVQgID0gREVDTEFSRV9FUlJPUl9DT0RFKFJFU1VMVF9DT0RFX0JBU0UuQ0RQLCBMT0NBTF9DT0RFX0JBU0UuQUpBWCArIDIsICdyZXF1ZXN0IHRpbWVvdXQuJyksXG4gICAgfVxufVxuIiwiaW1wb3J0IHsgaXNOdW1iZXIgfSBmcm9tICdAY2RwL2NvcmUtdXRpbHMnO1xuXG5sZXQgX3RpbWVvdXQ6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuZXhwb3J0IGNvbnN0IHNldHRpbmdzID0ge1xuICAgIGdldCB0aW1lb3V0KCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiBfdGltZW91dDtcbiAgICB9LFxuICAgIHNldCB0aW1lb3V0KHZhbHVlOiBudW1iZXIgfCB1bmRlZmluZWQpIHtcbiAgICAgICAgX3RpbWVvdXQgPSAoaXNOdW1iZXIodmFsdWUpICYmIDAgPD0gdmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG4gICAgfSxcbn07XG4iLCJpbXBvcnQgeyBzYWZlIH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcblxuY29uc3QgX0Zvcm1EYXRhID0gc2FmZShnbG9iYWxUaGlzLkZvcm1EYXRhKTtcbmNvbnN0IF9IZWFkZXJzID0gc2FmZShnbG9iYWxUaGlzLkhlYWRlcnMpO1xuY29uc3QgX0Fib3J0Q29udHJvbGxlciA9IHNhZmUoZ2xvYmFsVGhpcy5BYm9ydENvbnRyb2xsZXIpO1xuY29uc3QgX1VSTFNlYXJjaFBhcmFtcyA9IHNhZmUoZ2xvYmFsVGhpcy5VUkxTZWFyY2hQYXJhbXMpO1xuY29uc3QgX1hNTEh0dHBSZXF1ZXN0ID0gc2FmZShnbG9iYWxUaGlzLlhNTEh0dHBSZXF1ZXN0KTtcbmNvbnN0IF9mZXRjaCA9IHNhZmUoZ2xvYmFsVGhpcy5mZXRjaCk7XG5cbmV4cG9ydCB7XG4gICAgX0Zvcm1EYXRhIGFzIEZvcm1EYXRhLFxuICAgIF9IZWFkZXJzIGFzIEhlYWRlcnMsXG4gICAgX0Fib3J0Q29udHJvbGxlciBhcyBBYm9ydENvbnRyb2xsZXIsXG4gICAgX1VSTFNlYXJjaFBhcmFtcyBhcyBVUkxTZWFyY2hQYXJhbXMsXG4gICAgX1hNTEh0dHBSZXF1ZXN0IGFzIFhNTEh0dHBSZXF1ZXN0LFxuICAgIF9mZXRjaCBhcyBmZXRjaCxcbn07XG4iLCJpbXBvcnQgeyBQbGFpbk9iamVjdCwgaXNGdW5jdGlvbiB9IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQgeyBDYW5jZWxUb2tlbiB9IGZyb20gJ0BjZHAvcHJvbWlzZSc7XG5pbXBvcnQge1xuICAgIFJFU1VMVF9DT0RFLFxuICAgIG1ha2VDYW5jZWxlZFJlc3VsdCxcbiAgICBtYWtlUmVzdWx0LFxufSBmcm9tICdAY2RwL3Jlc3VsdCc7XG5pbXBvcnQgeyBCYXNlNjQgfSBmcm9tICdAY2RwL2JpbmFyeSc7XG5pbXBvcnQge1xuICAgIEFqYXhEYXRhVHlwZXMsXG4gICAgQWpheE9wdGlvbnMsXG4gICAgQWpheFJlc3VsdCxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7XG4gICAgRm9ybURhdGEsXG4gICAgSGVhZGVycyxcbiAgICBBYm9ydENvbnRyb2xsZXIsXG4gICAgVVJMU2VhcmNoUGFyYW1zLFxuICAgIGZldGNoLFxufSBmcm9tICcuL3Nzcic7XG5pbXBvcnQgeyBzZXR0aW5ncyB9IGZyb20gJy4vc2V0dGluZ3MnO1xuXG4vKiogQGludGVybmFsICovXG5leHBvcnQgdHlwZSBBamF4SGVhZGVyT3B0aW9ucyA9IFBpY2s8QWpheE9wdGlvbnM8QWpheERhdGFUeXBlcz4sICdoZWFkZXJzJyB8ICdtZXRob2QnIHwgJ2NvbnRlbnRUeXBlJyB8ICdkYXRhVHlwZScgfCAnbW9kZScgfCAnYm9keScgfCAndXNlcm5hbWUnIHwgJ3Bhc3N3b3JkJz47XG5cbmNvbnN0IF9hY2NlcHRIZWFkZXJNYXAgPSB7XG4gICAgdGV4dDogJ3RleHQvcGxhaW4sIHRleHQvaHRtbCwgYXBwbGljYXRpb24veG1sOyBxPTAuOCwgdGV4dC94bWw7IHE9MC44LCAqLyo7IHE9MC4wMScsXG4gICAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvamF2YXNjcmlwdCwgKi8qOyBxPTAuMDEnLFxufTtcblxuLyoqXG4gKiBAZW4gU2V0dXAgYGhlYWRlcnNgIGZyb20gb3B0aW9ucyBwYXJhbWV0ZXIuXG4gKiBAamEg44Kq44OX44K344On44Oz44GL44KJIGBoZWFkZXJzYCDjgpLoqK3lrppcbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwSGVhZGVycyhvcHRpb25zOiBBamF4SGVhZGVyT3B0aW9ucyk6IEhlYWRlcnMge1xuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpO1xuICAgIGNvbnN0IHsgbWV0aG9kLCBjb250ZW50VHlwZSwgZGF0YVR5cGUsIG1vZGUsIGJvZHksIHVzZXJuYW1lLCBwYXNzd29yZCB9ID0gb3B0aW9ucztcblxuICAgIC8vIENvbnRlbnQtVHlwZVxuICAgIGlmICgnUE9TVCcgPT09IG1ldGhvZCB8fCAnUFVUJyA9PT0gbWV0aG9kIHx8ICdQQVRDSCcgPT09IG1ldGhvZCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBmZXRjaCgpIOOBruWgtOWQiCwgRm9ybURhdGEg44KS6Ieq5YuV6Kej6YeI44GZ44KL44Gf44KBLCDmjIflrprjgYzjgYLjgovloLTlkIjjga/liYrpmaRcbiAgICAgICAgICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzUxOTI4NDEvZmV0Y2gtcG9zdC13aXRoLW11bHRpcGFydC1mb3JtLWRhdGFcbiAgICAgICAgICogaHR0cHM6Ly9tdWZmaW5tYW4uaW8vdXBsb2FkaW5nLWZpbGVzLXVzaW5nLWZldGNoLW11bHRpcGFydC1mb3JtLWRhdGEvXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpICYmIGJvZHkgaW5zdGFuY2VvZiBGb3JtRGF0YSkge1xuICAgICAgICAgICAgaGVhZGVycy5kZWxldGUoJ0NvbnRlbnQtVHlwZScpO1xuICAgICAgICB9IGVsc2UgaWYgKCFoZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IGNvbnRlbnRUeXBlICYmICdqc29uJyA9PT0gZGF0YVR5cGUgYXMgQWpheERhdGFUeXBlcykge1xuICAgICAgICAgICAgICAgIGhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChudWxsICE9IGNvbnRlbnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIGNvbnRlbnRUeXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFjY2VwdFxuICAgIGlmICghaGVhZGVycy5nZXQoJ0FjY2VwdCcpKSB7XG4gICAgICAgIGhlYWRlcnMuc2V0KCdBY2NlcHQnLCBfYWNjZXB0SGVhZGVyTWFwW2RhdGFUeXBlIGFzIEFqYXhEYXRhVHlwZXNdIHx8ICcqLyonKTtcbiAgICB9XG5cbiAgICAvLyBYLVJlcXVlc3RlZC1XaXRoXG4gICAgaWYgKCdjb3JzJyAhPT0gbW9kZSAmJiAhaGVhZGVycy5nZXQoJ1gtUmVxdWVzdGVkLVdpdGgnKSkge1xuICAgICAgICBoZWFkZXJzLnNldCgnWC1SZXF1ZXN0ZWQtV2l0aCcsICdYTUxIdHRwUmVxdWVzdCcpO1xuICAgIH1cblxuICAgIC8vIEJhc2ljIEF1dGhvcml6YXRpb25cbiAgICBpZiAobnVsbCAhPSB1c2VybmFtZSAmJiAhaGVhZGVycy5nZXQoJ0F1dGhvcml6YXRpb24nKSkge1xuICAgICAgICBoZWFkZXJzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCYXNpYyAke0Jhc2U2NC5lbmNvZGUoYCR7dXNlcm5hbWV9OiR7cGFzc3dvcmQgfHwgJyd9YCl9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhlYWRlcnM7XG59XG5cbi8qKiBlbnN1cmUgc3RyaW5nIHZhbHVlICovXG5mdW5jdGlvbiBlbnN1cmVQYXJhbVZhbHVlKHByb3A6IHVua25vd24pOiBzdHJpbmcge1xuICAgIGNvbnN0IHZhbHVlID0gaXNGdW5jdGlvbihwcm9wKSA/IHByb3AoKSA6IHByb3A7XG4gICAgcmV0dXJuIHVuZGVmaW5lZCAhPT0gdmFsdWUgPyBTdHJpbmcodmFsdWUpIDogJyc7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgYFBsYWluT2JqZWN0YCB0byBxdWVyeSBzdHJpbmdzLlxuICogQGphIGBQbGFpbk9iamVjdGAg44KS44Kv44Ko44Oq44K544OI44Oq44Oz44Kw44Gr5aSJ5o+bXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1F1ZXJ5U3RyaW5ncyhkYXRhOiBQbGFpbk9iamVjdCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGFyYW1zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGRhdGEpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZW5zdXJlUGFyYW1WYWx1ZShkYXRhW2tleV0pO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKGAke2VuY29kZVVSSUNvbXBvbmVudChrZXkpfT0ke2VuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSl9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgYFBsYWluT2JqZWN0YCB0byBBamF4IHBhcmFtZXRlcnMgb2JqZWN0LlxuICogQGphIGBQbGFpbk9iamVjdGAg44KSIEFqYXgg44OR44Op44Oh44O844K/44Kq44OW44K444Kn44Kv44OI44Gr5aSJ5o+bXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0FqYXhQYXJhbXMoZGF0YTogUGxhaW5PYmplY3QpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkYXRhKSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGVuc3VyZVBhcmFtVmFsdWUoZGF0YVtrZXldKTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBwYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXJhbXM7XG59XG5cbi8qKlxuICogQGVuIFBlcmZvcm0gYW4gYXN5bmNocm9ub3VzIEhUVFAgKEFqYXgpIHJlcXVlc3QuXG4gKiBAamEgSFRUUCAoQWpheCnjg6rjgq/jgqjjgrnjg4jjga7pgIHkv6FcbiAqXG4gKiBAcGFyYW0gdXJsXG4gKiAgLSBgZW5gIEEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFVSTCB0byB3aGljaCB0aGUgcmVxdWVzdCBpcyBzZW50LlxuICogIC0gYGphYCBBamF444Oq44Kv44Ko44K544OI44KS6YCB5L+h44GZ44KLVVJM44KS5oyH5a6aXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogIC0gYGVuYCBBamF4IHJlcXVlc3Qgc2V0dGluZ3MuXG4gKiAgLSBgamFgIEFqYXjjg6rjgq/jgqjjgrnjg4joqK3lrppcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFqYXg8VCBleHRlbmRzIEFqYXhEYXRhVHlwZXMgfCB7fSA9ICdyZXNwb25zZSc+KHVybDogc3RyaW5nLCBvcHRpb25zPzogQWpheE9wdGlvbnM8VD4pOiBQcm9taXNlPEFqYXhSZXN1bHQ8VD4+IHtcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IGFib3J0ID0gKCk6IHZvaWQgPT4gY29udHJvbGxlci5hYm9ydCgpO1xuXG4gICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBkYXRhVHlwZTogJ3Jlc3BvbnNlJyxcbiAgICAgICAgdGltZW91dDogc2V0dGluZ3MudGltZW91dCxcbiAgICB9LCBvcHRpb25zLCB7XG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsIC8vIGZvcmNlIG92ZXJyaWRlXG4gICAgfSk7XG5cbiAgICBjb25zdCB7IGNhbmNlbDogb3JpZ2luYWxUb2tlbiwgdGltZW91dCB9ID0gb3B0cztcblxuICAgIC8vIGNhbmNlbGxhdGlvblxuICAgIGlmIChvcmlnaW5hbFRva2VuKSB7XG4gICAgICAgIGlmIChvcmlnaW5hbFRva2VuLnJlcXVlc3RlZCkge1xuICAgICAgICAgICAgdGhyb3cgbWFrZUNhbmNlbGVkUmVzdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgb3JpZ2luYWxUb2tlbi5yZWdpc3RlcihhYm9ydCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc291cmNlID0gQ2FuY2VsVG9rZW4uc291cmNlKG9yaWdpbmFsVG9rZW4gYXMgQ2FuY2VsVG9rZW4pO1xuICAgIGNvbnN0IHsgdG9rZW4gfSA9IHNvdXJjZTtcbiAgICB0b2tlbi5yZWdpc3RlcihhYm9ydCk7XG5cbiAgICAvLyB0aW1lb3V0XG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBzb3VyY2UuY2FuY2VsKG1ha2VSZXN1bHQoUkVTVUxUX0NPREUuRVJST1JfQUpBWF9USU1FT1VULCAncmVxdWVzdCB0aW1lb3V0JykpLCB0aW1lb3V0KTtcbiAgICB9XG5cbiAgICAvLyBub3JtYWxpemVcbiAgICBvcHRzLm1ldGhvZCA9IG9wdHMubWV0aG9kLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAvLyBoZWFkZXJcbiAgICBvcHRzLmhlYWRlcnMgPSBzZXR1cEhlYWRlcnMob3B0cyk7XG5cbiAgICAvLyBwYXJzZSBwYXJhbVxuICAgIGNvbnN0IHsgbWV0aG9kLCBkYXRhLCBkYXRhVHlwZSB9ID0gb3B0cztcbiAgICBpZiAobnVsbCAhPSBkYXRhKSB7XG4gICAgICAgIGlmICgoJ0dFVCcgPT09IG1ldGhvZCB8fCAnSEVBRCcgPT09IG1ldGhvZCkgJiYgIXVybC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgICAgICB1cmwgKz0gYD8ke3RvUXVlcnlTdHJpbmdzKGRhdGEpfWA7XG4gICAgICAgIH0gZWxzZSBpZiAobnVsbCA9PSBvcHRzLmJvZHkpIHtcbiAgICAgICAgICAgIG9wdHMuYm9keSA9IG5ldyBVUkxTZWFyY2hQYXJhbXModG9BamF4UGFyYW1zKGRhdGEpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGV4ZWN1dGVcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShmZXRjaCh1cmwsIG9wdHMpLCB0b2tlbik7XG4gICAgaWYgKCdyZXNwb25zZScgPT09IGRhdGFUeXBlKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZSBhcyBBamF4UmVzdWx0PFQ+O1xuICAgIH0gZWxzZSBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG1ha2VSZXN1bHQoUkVTVUxUX0NPREUuRVJST1JfQUpBWF9SRVNQT05TRSwgcmVzcG9uc2Uuc3RhdHVzVGV4dCwgcmVzcG9uc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2VbZGF0YVR5cGUgYXMgRXhjbHVkZTxBamF4RGF0YVR5cGVzLCAncmVzcG9uc2UnPl0oKSwgdG9rZW4pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFBsYWluT2JqZWN0IH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcbmltcG9ydCB7IFJFU1VMVF9DT0RFLCBtYWtlUmVzdWx0IH0gZnJvbSAnQGNkcC9yZXN1bHQnO1xuaW1wb3J0IHtcbiAgICBBamF4RGF0YVR5cGVzLFxuICAgIEFqYXhPcHRpb25zLFxuICAgIEFqYXhSZXF1ZXN0T3B0aW9ucyxcbiAgICBBamF4UmVzdWx0LFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgICBhamF4LFxuICAgIHRvUXVlcnlTdHJpbmdzLFxuICAgIHNldHVwSGVhZGVycyxcbn0gZnJvbSAnLi9jb3JlJztcbmltcG9ydCB7IFhNTEh0dHBSZXF1ZXN0IH0gZnJvbSAnLi9zc3InO1xuXG4vKiogQGludGVybmFsICovXG5mdW5jdGlvbiBlbnN1cmVEYXRhVHlwZShkYXRhVHlwZT86IEFqYXhEYXRhVHlwZXMpOiBBamF4RGF0YVR5cGVzIHtcbiAgICByZXR1cm4gZGF0YVR5cGUgfHwgJ2pzb24nO1xufVxuXG4vKipcbiAqIEBlbiBgR0VUYCByZXF1ZXN0IHNob3J0Y3V0LlxuICogQGphIGBHRVRgIOODquOCr+OCqOOCueODiOOCt+ODp+ODvOODiOOCq+ODg+ODiFxuICpcbiAqIEBwYXJhbSB1cmxcbiAqICAtIGBlbmAgQSBzdHJpbmcgY29udGFpbmluZyB0aGUgVVJMIHRvIHdoaWNoIHRoZSByZXF1ZXN0IGlzIHNlbnQuXG4gKiAgLSBgamFgIEFqYXjjg6rjgq/jgqjjgrnjg4jjgpLpgIHkv6HjgZnjgotVUkzjgpLmjIflrppcbiAqIEBwYXJhbSBkYXRhXG4gKiAgLSBgZW5gIERhdGEgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICogIC0gYGphYCDjgrXjg7zjg5Djg7zjgavpgIHkv6HjgZXjgozjgovjg4fjg7zjgr8uXG4gKiBAcGFyYW0gZGF0YVR5cGVcbiAqICAtIGBlbmAgRGF0YSB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gKiAgLSBgamFgIOOCteODvOODkOODvOOBi+OCiei/lOOBleOCjOOCi+acn+W+heOBmeOCi+ODh+ODvOOCv+OBruWei+OCkuaMh+WumlxuICogQHBhcmFtIG9wdGlvbnNcbiAqICAtIGBlbmAgcmVxdWVzdCBzZXR0aW5ncy5cbiAqICAtIGBqYWAg44Oq44Kv44Ko44K544OI6Kit5a6aXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXQ8VCBleHRlbmRzIEFqYXhEYXRhVHlwZXMgfCB7fSA9ICdqc29uJz4oXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgZGF0YT86IFBsYWluT2JqZWN0LFxuICAgIGRhdGFUeXBlPzogVCBleHRlbmRzIEFqYXhEYXRhVHlwZXMgPyBUIDogJ2pzb24nLFxuICAgIG9wdGlvbnM/OiBBamF4UmVxdWVzdE9wdGlvbnNcbik6IFByb21pc2U8QWpheFJlc3VsdDxUPj4ge1xuICAgIHJldHVybiBhamF4KHVybCwgeyAuLi5vcHRpb25zLCBtZXRob2Q6ICdHRVQnLCBkYXRhLCBkYXRhVHlwZTogZW5zdXJlRGF0YVR5cGUoZGF0YVR5cGUpIH0gYXMgQWpheE9wdGlvbnM8VD4pO1xufVxuXG4vKipcbiAqIEBlbiBgR0VUYCB0ZXh0IHJlcXVlc3Qgc2hvcnRjdXQuXG4gKiBAamEgYEdFVGAg44OG44Kt44K544OI44Oq44Kv44Ko44K544OI44K344On44O844OI44Kr44OD44OIXG4gKlxuICogQHBhcmFtIHVybFxuICogIC0gYGVuYCBBIHN0cmluZyBjb250YWluaW5nIHRoZSBVUkwgdG8gd2hpY2ggdGhlIHJlcXVlc3QgaXMgc2VudC5cbiAqICAtIGBqYWAgQWpheOODquOCr+OCqOOCueODiOOCkumAgeS/oeOBmeOCi1VSTOOCkuaMh+WumlxuICogQHBhcmFtIGRhdGFcbiAqICAtIGBlbmAgRGF0YSB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gKiAgLSBgamFgIOOCteODvOODkOODvOOBq+mAgeS/oeOBleOCjOOCi+ODh+ODvOOCvy5cbiAqIEBwYXJhbSBvcHRpb25zXG4gKiAgLSBgZW5gIHJlcXVlc3Qgc2V0dGluZ3MuXG4gKiAgLSBgamFgIOODquOCr+OCqOOCueODiOioreWumlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGV4dCh1cmw6IHN0cmluZywgZGF0YT86IFBsYWluT2JqZWN0LCBvcHRpb25zPzogQWpheFJlcXVlc3RPcHRpb25zKTogUHJvbWlzZTxBamF4UmVzdWx0PCd0ZXh0Jz4+IHtcbiAgICByZXR1cm4gZ2V0KHVybCwgZGF0YSwgJ3RleHQnLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBAZW4gYEdFVGAgSlNPTiByZXF1ZXN0IHNob3J0Y3V0LlxuICogQGphIGBHRVRgIEpTT04g44Oq44Kv44Ko44K544OI44K344On44O844OI44Kr44OD44OIXG4gKlxuICogQHBhcmFtIHVybFxuICogIC0gYGVuYCBBIHN0cmluZyBjb250YWluaW5nIHRoZSBVUkwgdG8gd2hpY2ggdGhlIHJlcXVlc3QgaXMgc2VudC5cbiAqICAtIGBqYWAgQWpheOODquOCr+OCqOOCueODiOOCkumAgeS/oeOBmeOCi1VSTOOCkuaMh+WumlxuICogQHBhcmFtIGRhdGFcbiAqICAtIGBlbmAgRGF0YSB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gKiAgLSBgamFgIOOCteODvOODkOODvOOBq+mAgeS/oeOBleOCjOOCi+ODh+ODvOOCvy5cbiAqIEBwYXJhbSBvcHRpb25zXG4gKiAgLSBgZW5gIHJlcXVlc3Qgc2V0dGluZ3MuXG4gKiAgLSBgamFgIOODquOCr+OCqOOCueODiOioreWumlxuICovXG5leHBvcnQgZnVuY3Rpb24ganNvbjxUIGV4dGVuZHMgJ2pzb24nIHwge30gPSAnanNvbic+KHVybDogc3RyaW5nLCBkYXRhPzogUGxhaW5PYmplY3QsIG9wdGlvbnM/OiBBamF4UmVxdWVzdE9wdGlvbnMpOiBQcm9taXNlPEFqYXhSZXN1bHQ8VD4+IHtcbiAgICByZXR1cm4gZ2V0PFQ+KHVybCwgZGF0YSwgKCdqc29uJyBhcyBUIGV4dGVuZHMgQWpheERhdGFUeXBlcyA/IFQgOiAnanNvbicpLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBAZW4gYEdFVGAgQmxvYiByZXF1ZXN0IHNob3J0Y3V0LlxuICogQGphIGBHRVRgIEJsb2Ig44Oq44Kv44Ko44K544OI44K344On44O844OI44Kr44OD44OIXG4gKlxuICogQHBhcmFtIHVybFxuICogIC0gYGVuYCBBIHN0cmluZyBjb250YWluaW5nIHRoZSBVUkwgdG8gd2hpY2ggdGhlIHJlcXVlc3QgaXMgc2VudC5cbiAqICAtIGBqYWAgQWpheOODquOCr+OCqOOCueODiOOCkumAgeS/oeOBmeOCi1VSTOOCkuaMh+WumlxuICogQHBhcmFtIGRhdGFcbiAqICAtIGBlbmAgRGF0YSB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gKiAgLSBgamFgIOOCteODvOODkOODvOOBq+mAgeS/oeOBleOCjOOCi+ODh+ODvOOCvy5cbiAqIEBwYXJhbSBvcHRpb25zXG4gKiAgLSBgZW5gIHJlcXVlc3Qgc2V0dGluZ3MuXG4gKiAgLSBgamFgIOODquOCr+OCqOOCueODiOioreWumlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmxvYih1cmw6IHN0cmluZywgZGF0YT86IFBsYWluT2JqZWN0LCBvcHRpb25zPzogQWpheFJlcXVlc3RPcHRpb25zKTogUHJvbWlzZTxBamF4UmVzdWx0PCdibG9iJz4+IHtcbiAgICByZXR1cm4gZ2V0KHVybCwgZGF0YSwgJ2Jsb2InLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBAZW4gYFBPU1RgIHJlcXVlc3Qgc2hvcnRjdXQuXG4gKiBAamEgYFBPU1RgIOODquOCr+OCqOOCueODiOOCt+ODp+ODvOODiOOCq+ODg+ODiFxuICpcbiAqIEBwYXJhbSB1cmxcbiAqICAtIGBlbmAgQSBzdHJpbmcgY29udGFpbmluZyB0aGUgVVJMIHRvIHdoaWNoIHRoZSByZXF1ZXN0IGlzIHNlbnQuXG4gKiAgLSBgamFgIEFqYXjjg6rjgq/jgqjjgrnjg4jjgpLpgIHkv6HjgZnjgotVUkzjgpLmjIflrppcbiAqIEBwYXJhbSBkYXRhXG4gKiAgLSBgZW5gIERhdGEgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICogIC0gYGphYCDjgrXjg7zjg5Djg7zjgavpgIHkv6HjgZXjgozjgovjg4fjg7zjgr8uXG4gKiBAcGFyYW0gZGF0YVR5cGVcbiAqICAtIGBlbmAgVGhlIHR5cGUgb2YgZGF0YSB0aGF0IHlvdSdyZSBleHBlY3RpbmcgYmFjayBmcm9tIHRoZSBzZXJ2ZXIuXG4gKiAgLSBgamFgIEFqYXjjg6rjgq/jgqjjgrnjg4jjgpLpgIHkv6HjgZnjgotVUkzjgpLmjIflrppcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiAgLSBgZW5gIHJlcXVlc3Qgc2V0dGluZ3MuXG4gKiAgLSBgamFgIOODquOCr+OCqOOCueODiOioreWumlxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9zdDxUIGV4dGVuZHMgQWpheERhdGFUeXBlcyB8IHt9ID0gJ2pzb24nPihcbiAgICB1cmw6IHN0cmluZyxcbiAgICBkYXRhOiBQbGFpbk9iamVjdCxcbiAgICBkYXRhVHlwZT86IFQgZXh0ZW5kcyBBamF4RGF0YVR5cGVzID8gVCA6ICdqc29uJyxcbiAgICBvcHRpb25zPzogQWpheFJlcXVlc3RPcHRpb25zXG4pOiBQcm9taXNlPEFqYXhSZXN1bHQ8VD4+IHtcbiAgICByZXR1cm4gYWpheCh1cmwsIHsgLi4ub3B0aW9ucywgbWV0aG9kOiAnUE9TVCcsIGRhdGEsIGRhdGFUeXBlOiBlbnN1cmVEYXRhVHlwZShkYXRhVHlwZSkgfSBhcyBBamF4T3B0aW9uczxUPik7XG59XG5cbi8qKlxuICogQGVuIFN5bmNocm9ub3VzIGBHRVRgIHJlcXVlc3QgZm9yIHJlc291cmNlIGFjY2Vzcy4gPGJyPlxuICogICAgIE1hbnkgYnJvd3NlcnMgaGF2ZSBkZXByZWNhdGVkIHN5bmNocm9ub3VzIFhIUiBzdXBwb3J0IG9uIHRoZSBtYWluIHRocmVhZCBlbnRpcmVseS5cbiAqIEBqYSDjg6rjgr3jg7zjgrnlj5blvpfjga7jgZ/jgoHjga4g5ZCM5pyfIGBHRVRgIOODquOCr+OCqOOCueODiC4gPGJyPlxuICogICAgIOWkmuOBj+OBruODluODqeOCpuOCtuOBp+OBr+ODoeOCpOODs+OCueODrOODg+ODieOBq+OBiuOBkeOCi+WQjOacn+eahOOBqiBYSFIg44Gu5a++5b+c44KS5YWo6Z2i55qE44Gr6Z2e5o6o5aWo44Go44GX44Gm44GE44KL44Gu44Gn56mN5qW15L2/55So44Gv6YG/44GR44KL44GT44GoLlxuICpcbiAqIEBwYXJhbSB1cmxcbiAqICAtIGBlbmAgQSBzdHJpbmcgY29udGFpbmluZyB0aGUgVVJMIHRvIHdoaWNoIHRoZSByZXF1ZXN0IGlzIHNlbnQuXG4gKiAgLSBgamFgIEFqYXjjg6rjgq/jgqjjgrnjg4jjgpLpgIHkv6HjgZnjgotVUkzjgpLmjIflrppcbiAqIEBwYXJhbSBkYXRhVHlwZVxuICogIC0gYGVuYCBUaGUgdHlwZSBvZiBkYXRhIHRoYXQgeW91J3JlIGV4cGVjdGluZyBiYWNrIGZyb20gdGhlIHNlcnZlci5cbiAqICAtIGBqYWAgQWpheOODquOCr+OCqOOCueODiOOCkumAgeS/oeOBmeOCi1VSTOOCkuaMh+WumlxuICogQHBhcmFtIGRhdGFcbiAqICAtIGBlbmAgRGF0YSB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gKiAgLSBgamFgIOOCteODvOODkOODvOOBq+mAgeS/oeOBleOCjOOCi+ODh+ODvOOCvy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc291cmNlPFQgZXh0ZW5kcyAndGV4dCcgfCAnanNvbicgfCB7fSA9ICdqc29uJz4oXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgZGF0YVR5cGU/OiBUIGV4dGVuZHMgJ3RleHQnIHwgJ2pzb24nID8gVCA6ICdqc29uJyxcbiAgICBkYXRhPzogUGxhaW5PYmplY3QsXG4pOiBBamF4UmVzdWx0PFQ+IHtcbiAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIGlmIChudWxsICE9IGRhdGEgJiYgIXVybC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgIHVybCArPSBgPyR7dG9RdWVyeVN0cmluZ3MoZGF0YSl9YDtcbiAgICB9XG5cbiAgICAvLyBzeW5jaHJvbm91c1xuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwsIGZhbHNlKTtcblxuICAgIGNvbnN0IHR5cGUgPSBlbnN1cmVEYXRhVHlwZShkYXRhVHlwZSk7XG4gICAgY29uc3QgaGVhZGVycyA9IHNldHVwSGVhZGVycyh7IG1ldGhvZDogJ0dFVCcsIGRhdGFUeXBlOiB0eXBlIH0pO1xuICAgIGhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbHVlKTtcbiAgICB9KTtcblxuICAgIHhoci5zZW5kKG51bGwpO1xuICAgIGlmICghKDIwMCA8PSB4aHIuc3RhdHVzICYmIHhoci5zdGF0dXMgPCAzMDApKSB7XG4gICAgICAgIHRocm93IG1ha2VSZXN1bHQoUkVTVUxUX0NPREUuRVJST1JfQUpBWF9SRVNQT05TRSwgeGhyLnN0YXR1c1RleHQsIHhocik7XG4gICAgfVxuXG4gICAgcmV0dXJuICdqc29uJyA9PT0gdHlwZSA/IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKSA6IHhoci5yZXNwb25zZTtcbn1cbiJdLCJuYW1lcyI6WyJIZWFkZXJzIiwiRm9ybURhdGEiLCJBYm9ydENv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
