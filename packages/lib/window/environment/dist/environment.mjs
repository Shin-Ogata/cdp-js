/*!
 * @cdp/environment 0.9.5
 *   environment resolver module
 */

import { safe, getGlobal } from '@cdp/core-utils';

/*
 * SSR (Server Side Rendering) 環境においてもオブジェクト等の存在を保証する
 */
/** @internal */
const _location = safe(globalThis.location);
/** @internal */
const _navigator = safe(globalThis.navigator);
/** @internal */
const _screen = safe(globalThis.screen);
/** @internal */
const _devicePixelRatio = safe(globalThis.devicePixelRatio);

/**
 * @en Get the directory to which `url` belongs.
 * @ja 指定 `url` の所属するディレクトリを取得
 *
 * @param url
 *  - `en` target URL
 *  - `ja` 対象の URL
 */
const getWebDirectory = (url) => {
    const match = /(.+\/)([^/]*#[^/]+)?/.exec(url);
    return (match && match[1]) || '';
};
/**
 * @en Accsessor for Web root location <br>
 *     Only the browser environment will be an allocating place in index.html, and becomes effective.
 * @ja Web root location へのアクセス <br>
 *     index.html の配置場所となり、ブラウザ環境のみ有効となる.
 */
const webRoot = getWebDirectory(_location.href);
/**
 * @en Converter from relative path to absolute url string. <br>
 *     If you want to access to Assets and in spite of the script location, the function is available.
 * @ja 相対 path を絶対 URL に変換 <br>
 *     js の配置に依存することなく `assets` アクセスしたいときに使用する.
 *
 * @see https://stackoverflow.com/questions/2188218/relative-paths-in-javascript-in-an-external-file
 *
 * @example <br>
 *
 * ```ts
 *  console.log(toUrl('/res/data/collection.json'));
 *  // "http://localhost:8080/app/res/data/collection.json"
 * ```
 *
 * @param path
 *  - `en` set relative path from [[webRoot]].
 *  - `ja` [[webRoot]] からの相対パスを指定
 */
const toUrl = (path) => {
    if (null != path && null != path[0]) {
        return ('/' === path[0]) ? webRoot + path.slice(1) : webRoot + path;
    }
    else {
        return webRoot;
    }
};

//__________________________________________________________________________________________________//
/** @internal */
const maybeTablet = (width, height) => {
    return (600 /* TABLET_MIN_WIDTH */ <= Math.min(width, height));
};
/** @internal */
const supportTouch = () => {
    return !!((_navigator.maxTouchPoints > 0) || ('ontouchstart' in globalThis));
};
/**
 * @internal
 * @see Screen.orientation <br>
 *  - https://developer.mozilla.org/ja/docs/Web/API/Screen/orientation
 */
const supportOrientation = (ua) => {
    return ('orientation' in globalThis) || (0 <= ua.indexOf('Windows Phone'));
};
/**
 * @en Query platform information.
 * @ja プラットフォーム情報の取得
 *
 * @param context
 *  - `en` given `Navigator`, `Screen`, `devicePixelRatio` information.
 *  - `ja` 環境の `Navigator`, `Screen`, `devicePixelRatio` を指定
 */
const queryPlatform = (context) => {
    context = context || { navigator: _navigator, screen: _screen, devicePixelRatio: _devicePixelRatio };
    const info = {
        ios: false,
        android: false,
        androidChrome: false,
        desktop: false,
        mobile: false,
        phone: false,
        tablet: false,
        iphone: false,
        iphoneX: false,
        ipod: false,
        ipad: false,
        edge: false,
        ie: false,
        firefox: false,
        macos: false,
        windows: false,
        cordova: !!(getGlobal()['cordova']),
        electron: false,
    };
    const { userAgent: ua, platform: os, standalone } = context.navigator || _navigator;
    const { width: screenWidth, height: screenHeight } = context.screen || _screen;
    const pixelRatio = context.devicePixelRatio;
    const android = /(Android);?[\s/]+([\d.]+)?/.exec(ua);
    let ipad = /(iPad).*OS\s([\d_]+)/.exec(ua);
    const ipod = /(iPod)(.*OS\s([\d_]+))?/.exec(ua);
    let iphone = !ipad && /(iPhone\sOS|iOS)\s([\d_]+)/.exec(ua);
    const ie = 0 <= ua.indexOf('MSIE ') || 0 <= ua.indexOf('Trident/');
    const edge = 0 <= ua.indexOf('Edge/');
    const firefox = 0 <= ua.indexOf('Gecko/') && 0 <= ua.indexOf('Firefox/');
    const windows = 'Win32' === os;
    let macos = 'MacIntel' === os;
    const electron = ua.toLowerCase().startsWith('electron');
    // iPhone(X) / iPad(Pro)Desktop Mode
    if (!iphone && !ipad
        && macos
        && supportTouch()
        && (undefined !== standalone
        //            (1024 === screenWidth && 1366 === screenHeight) // Pro 12.9 portrait
        //         || (1366 === screenWidth && 1024 === screenHeight) // Pro 12.9 landscape
        //         || ( 834 === screenWidth && 1194 === screenHeight) // Pro 11 portrait
        //         || (1194 === screenWidth &&  834 === screenHeight) // Pro 11 landscape
        //         || ( 834 === screenWidth && 1112 === screenHeight) // Pro 10.5 portrait
        //         || (1112 === screenWidth &&  834 === screenHeight) // Pro 10.5 landscape
        //         || ( 768 === screenWidth && 1024 === screenHeight) // other portrait
        //         || (1024 === screenWidth &&  768 === screenHeight) // other landscape
        )) {
        const regex = /(Version)\/([\d.]+)/.exec(ua);
        if (maybeTablet(screenWidth, screenHeight)) {
            ipad = regex;
        }
        else {
            iphone = regex;
        }
        macos = false;
    }
    info.ie = ie;
    info.edge = edge;
    info.firefox = firefox;
    // Android
    if (android && !windows) {
        info.os = 'android';
        info.osVersion = android[2];
        info.android = true;
        info.androidChrome = 0 <= ua.toLowerCase().indexOf('chrome');
        if (0 <= ua.indexOf('Mobile')) {
            info.phone = true;
        }
        else {
            info.tablet = true;
        }
    }
    if (ipad || iphone || ipod) {
        info.os = 'ios';
        info.ios = true;
    }
    // iOS
    if (iphone && !ipod) {
        info.osVersion = iphone[2].replace(/_/g, '.');
        info.phone = true;
        info.iphone = true;
        // iPhone X
        if ((375 === screenWidth && 812 === screenHeight) // X, XS portrait
            || (812 === screenWidth && 375 === screenHeight) // X, XS landscape
            || (414 === screenWidth && 896 === screenHeight) // XS Max, XR portrait
            || (896 === screenWidth && 414 === screenHeight) // XS Max, XR landscape
        ) {
            info.iphoneX = true;
        }
    }
    if (ipad) {
        info.osVersion = ipad[2].replace(/_/g, '.');
        info.tablet = true;
        info.ipad = true;
    }
    if (ipod) {
        info.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        info.phone = true;
        info.ipod = true;
    }
    // Desktop
    info.desktop = !supportOrientation(ua);
    if (info.desktop) {
        info.electron = electron;
        info.macos = macos;
        info.windows = windows;
        info.macos && (info.os = 'macos');
        info.windows && (info.os = 'windows');
    }
    // Mobile
    info.mobile = !info.desktop;
    if (info.mobile && !info.phone && !info.tablet) {
        if (maybeTablet(screenWidth, screenHeight)) {
            info.tablet = true;
        }
        else {
            info.phone = true;
        }
    }
    // Pixel Ratio
    info.pixelRatio = pixelRatio || 1;
    return info;
};
/**
 * @en Platform information on runtime.
 * @ja ランタイムのプラットフォーム情報
 */
const platform = queryPlatform();

export { getWebDirectory, platform, queryPlatform, toUrl, webRoot };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQubWpzIiwic291cmNlcyI6WyJzc3IudHMiLCJ3ZWIudHMiLCJwbGF0Zm9ybS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzYWZlIH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcblxuLypcbiAqIFNTUiAoU2VydmVyIFNpZGUgUmVuZGVyaW5nKSDnkrDlooPjgavjgYrjgYTjgabjgoLjgqrjg5bjgrjjgqfjgq/jg4jnrYnjga7lrZjlnKjjgpLkv53oqLzjgZnjgotcbiAqL1xuXG4vKiogQGludGVybmFsICovXG5jb25zdCBfbG9jYXRpb24gICAgICAgICA9IHNhZmUoZ2xvYmFsVGhpcy5sb2NhdGlvbik7XG4vKiogQGludGVybmFsICovXG5jb25zdCBfbmF2aWdhdG9yICAgICAgICA9IHNhZmUoZ2xvYmFsVGhpcy5uYXZpZ2F0b3IpO1xuLyoqIEBpbnRlcm5hbCAqL1xuY29uc3QgX3NjcmVlbiAgICAgICAgICAgPSBzYWZlKGdsb2JhbFRoaXMuc2NyZWVuKTtcbi8qKiBAaW50ZXJuYWwgKi9cbmNvbnN0IF9kZXZpY2VQaXhlbFJhdGlvID0gc2FmZShnbG9iYWxUaGlzLmRldmljZVBpeGVsUmF0aW8pO1xuXG4vKiogQGludGVybmFsICovXG5leHBvcnQge1xuICAgIF9sb2NhdGlvbiBhcyBsb2NhdGlvbixcbiAgICBfbmF2aWdhdG9yIGFzIG5hdmlnYXRvcixcbiAgICBfc2NyZWVuIGFzIHNjcmVlbixcbiAgICBfZGV2aWNlUGl4ZWxSYXRpbyBhcyBkZXZpY2VQaXhlbFJhdGlvLFxufTtcbiIsImltcG9ydCB7IGxvY2F0aW9uIH0gZnJvbSAnLi9zc3InO1xuXG4vKipcbiAqIEBlbiBHZXQgdGhlIGRpcmVjdG9yeSB0byB3aGljaCBgdXJsYCBiZWxvbmdzLlxuICogQGphIOaMh+WumiBgdXJsYCDjga7miYDlsZ7jgZnjgovjg4fjgqPjg6zjgq/jg4jjg6rjgpLlj5blvpdcbiAqXG4gKiBAcGFyYW0gdXJsXG4gKiAgLSBgZW5gIHRhcmdldCBVUkxcbiAqICAtIGBqYWAg5a++6LGh44GuIFVSTFxuICovXG5leHBvcnQgY29uc3QgZ2V0V2ViRGlyZWN0b3J5ID0gKHVybDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBtYXRjaCA9IC8oLitcXC8pKFteL10qI1teL10rKT8vLmV4ZWModXJsKTtcbiAgICByZXR1cm4gKG1hdGNoICYmIG1hdGNoWzFdKSB8fCAnJztcbn07XG5cbi8qKlxuICogQGVuIEFjY3Nlc3NvciBmb3IgV2ViIHJvb3QgbG9jYXRpb24gPGJyPlxuICogICAgIE9ubHkgdGhlIGJyb3dzZXIgZW52aXJvbm1lbnQgd2lsbCBiZSBhbiBhbGxvY2F0aW5nIHBsYWNlIGluIGluZGV4Lmh0bWwsIGFuZCBiZWNvbWVzIGVmZmVjdGl2ZS5cbiAqIEBqYSBXZWIgcm9vdCBsb2NhdGlvbiDjgbjjga7jgqLjgq/jgrvjgrkgPGJyPlxuICogICAgIGluZGV4Lmh0bWwg44Gu6YWN572u5aC05omA44Go44Gq44KK44CB44OW44Op44Km44K255Kw5aKD44Gu44G/5pyJ5Yq544Go44Gq44KLLlxuICovXG5leHBvcnQgY29uc3Qgd2ViUm9vdDogc3RyaW5nID0gZ2V0V2ViRGlyZWN0b3J5KGxvY2F0aW9uLmhyZWYpO1xuXG4vKipcbiAqIEBlbiBDb252ZXJ0ZXIgZnJvbSByZWxhdGl2ZSBwYXRoIHRvIGFic29sdXRlIHVybCBzdHJpbmcuIDxicj5cbiAqICAgICBJZiB5b3Ugd2FudCB0byBhY2Nlc3MgdG8gQXNzZXRzIGFuZCBpbiBzcGl0ZSBvZiB0aGUgc2NyaXB0IGxvY2F0aW9uLCB0aGUgZnVuY3Rpb24gaXMgYXZhaWxhYmxlLlxuICogQGphIOebuOWvviBwYXRoIOOCkue1tuWvviBVUkwg44Gr5aSJ5o+bIDxicj5cbiAqICAgICBqcyDjga7phY3nva7jgavkvp3lrZjjgZnjgovjgZPjgajjgarjgY8gYGFzc2V0c2Ag44Ki44Kv44K744K544GX44Gf44GE44Go44GN44Gr5L2/55So44GZ44KLLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjE4ODIxOC9yZWxhdGl2ZS1wYXRocy1pbi1qYXZhc2NyaXB0LWluLWFuLWV4dGVybmFsLWZpbGVcbiAqXG4gKiBAZXhhbXBsZSA8YnI+XG4gKlxuICogYGBgdHNcbiAqICBjb25zb2xlLmxvZyh0b1VybCgnL3Jlcy9kYXRhL2NvbGxlY3Rpb24uanNvbicpKTtcbiAqICAvLyBcImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9hcHAvcmVzL2RhdGEvY29sbGVjdGlvbi5qc29uXCJcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwYXRoXG4gKiAgLSBgZW5gIHNldCByZWxhdGl2ZSBwYXRoIGZyb20gW1t3ZWJSb290XV0uXG4gKiAgLSBgamFgIFtbd2ViUm9vdF1dIOOBi+OCieOBruebuOWvvuODkeOCueOCkuaMh+WumlxuICovXG5leHBvcnQgY29uc3QgdG9VcmwgPSAocGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBpZiAobnVsbCAhPSBwYXRoICYmIG51bGwgIT0gcGF0aFswXSkge1xuICAgICAgICByZXR1cm4gKCcvJyA9PT0gcGF0aFswXSkgPyB3ZWJSb290ICsgcGF0aC5zbGljZSgxKSA6IHdlYlJvb3QgKyBwYXRoO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3ZWJSb290O1xuICAgIH1cbn07XG4iLCJpbXBvcnQgeyBXcml0YWJsZSwgZ2V0R2xvYmFsIH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcbmltcG9ydCB7XG4gICAgbmF2aWdhdG9yLFxuICAgIHNjcmVlbixcbiAgICBkZXZpY2VQaXhlbFJhdGlvLFxufSBmcm9tICcuL3Nzcic7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmNvbnN0IGVudW0gVGhyZXNob2xkIHtcbiAgICBUQUJMRVRfTUlOX1dJRFRIID0gNjAwLCAvLyBmYWxsYmFjayBkZXRlY3Rpb24gdmFsdWVcbn1cblxuLyoqXG4gKiBAZW4gUGxhdGZvcm0gaW5mb3JtYXRpb24uXG4gKiBAamEg44OX44Op44OD44OI44OV44Kp44O844Og5oOF5aCxXG4gKlxuICogQHNlZSBvdGhlciBmcmFtZXdvcmsgaW1wbGVtZW50YXRpb24gPGJyPlxuICogIC0gRnJhbWV3b3JrN1xuICogICAgLSBodHRwczovL2dpdGh1Yi5jb20vZnJhbWV3b3JrN2lvL2ZyYW1ld29yazcvYmxvYi9tYXN0ZXIvc3JjL2NvcmUvc2hhcmVkL2dldC1kZXZpY2UuanNcbiAqICAgIC0gaHR0cHM6Ly9naXRodWIuY29tL2ZyYW1ld29yazdpby9mcmFtZXdvcms3L2Jsb2IvbWFzdGVyL3NyYy9jb3JlL3NoYXJlZC9nZXQtZGV2aWNlLmQudHNcbiAqICAgIC0gaHR0cHM6Ly9naXRodWIuY29tL2ZyYW1ld29yazdpby9mcmFtZXdvcms3L2Jsb2IvbWFzdGVyL3NyYy9jb3JlL3NoYXJlZC9nZXQtc3VwcG9ydC5qc1xuICogICAgLSBodHRwczovL2dpdGh1Yi5jb20vZnJhbWV3b3JrN2lvL2ZyYW1ld29yazcvYmxvYi9tYXN0ZXIvc3JjL2NvcmUvc2hhcmVkL2dldC1zdXBwb3J0LmQudHNcbiAqICAgIC0gaHR0cHM6Ly9naXRodWIuY29tL2ZyYW1ld29yazdpby9mcmFtZXdvcms3L2Jsb2IvdjQvc3JjL2NvcmUvdXRpbHMvZGV2aWNlLmpzICAgIC8vIGNoZWNrIGxlZ2FjeSBkZXZpY2U6IGlQaG9uZVggZXRjXG4gKiAgICAtIGh0dHBzOi8vZ2l0aHViLmNvbS9mcmFtZXdvcms3aW8vZnJhbWV3b3JrNy9ibG9iL3Y0L3NyYy9jb3JlL3V0aWxzL2RldmljZS5kLnRzXG4gKiAgLSBPbnNlblVJXG4gKiAgICAtIGh0dHBzOi8vZ2l0aHViLmNvbS9PbnNlblVJL09uc2VuVUkvYmxvYi9tYXN0ZXIvY29yZS9zcmMvb25zL3BsYXRmb3JtLmpzXG4gKiAgLSBXZWJcbiAqICAgIC0gaHR0cHM6Ly93d3cuYml0LWhpdmUuY29tL2FydGljbGVzLzIwMTkwODIwXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGxhdGZvcm0ge1xuICAgIC8qKiB0cnVlIGZvciBpT1MgaW5mbyAqL1xuICAgIHJlYWRvbmx5IGlvczogYm9vbGVhbjtcbiAgICAvKiogdHJ1ZSBmb3IgQW5kcm9pZCBpbmZvICovXG4gICAgcmVhZG9ubHkgYW5kcm9pZDogYm9vbGVhbjtcbiAgICAvKiogdHJ1ZSBmb3IgQW5kcm9pZCBDaHJvbWUgKi9cbiAgICByZWFkb25seSBhbmRyb2lkQ2hyb21lOiBib29sZWFuO1xuICAgIC8qKiB0cnVlIGZvciBkZXNrdG9wIGJyb3dzZXIgKi9cbiAgICByZWFkb25seSBkZXNrdG9wOiBib29sZWFuO1xuICAgIC8qKiB0cnVlIGZvciBtb2JpbGUgaW5mbyAqL1xuICAgIHJlYWRvbmx5IG1vYmlsZTogYm9vbGVhbjtcbiAgICAvKiogdHJ1ZSBmb3Igc21hcnQgcGhvbmUgKGluY2x1ZGluZyBpUG9kKSBpbmZvICovXG4gICAgcmVhZG9ubHkgcGhvbmU6IGJvb2xlYW47XG4gICAgLyoqIHRydWUgZm9yIHRhYmxldCBpbmZvICovXG4gICAgcmVhZG9ubHkgdGFibGV0OiBib29sZWFuO1xuICAgIC8qKiB0cnVlIGZvciBpUGhvbmUgKi9cbiAgICByZWFkb25seSBpcGhvbmU6IGJvb2xlYW47XG4gICAgLyoqIHRydWUgZm9yIGlQaG9uZVggKi9cbiAgICByZWFkb25seSBpcGhvbmVYOiBib29sZWFuO1xuICAgIC8qKiB0cnVlIGZvciBpUG9kICovXG4gICAgcmVhZG9ubHkgaXBvZDogYm9vbGVhbjtcbiAgICAvKiogdHJ1ZSBmb3IgaVBhZCAqL1xuICAgIHJlYWRvbmx5IGlwYWQ6IGJvb2xlYW47XG4gICAgLyoqIHRydWUgZm9yIE1TIEVkZ2UgYnJvd3NlciAqL1xuICAgIHJlYWRvbmx5IGVkZ2U6IGJvb2xlYW47XG4gICAgLyoqIHRydWUgZm9yIEludGVybmV0IEV4cGxvcmVyIGJyb3dzZXIqL1xuICAgIHJlYWRvbmx5IGllOiBib29sZWFuO1xuICAgIC8qKiB0cnVlIGZvciBGaXJlRm94IGJyb3dzZXIqL1xuICAgIHJlYWRvbmx5IGZpcmVmb3g6IGJvb2xlYW47XG4gICAgLyoqIHRydWUgZm9yIGRlc2t0b3AgTWFjT1MgKi9cbiAgICByZWFkb25seSBtYWNvczogYm9vbGVhbjtcbiAgICAvKiogdHJ1ZSBmb3IgZGVza3RvcCBXaW5kb3dzICovXG4gICAgcmVhZG9ubHkgd2luZG93czogYm9vbGVhbjtcbiAgICAvKiogdHJ1ZSB3aGVuIGFwcCBydW5uaW5nIGluIGNvcmRvdmEgZW52aXJvbm1lbnQgKi9cbiAgICByZWFkb25seSBjb3Jkb3ZhOiBib29sZWFuO1xuICAgIC8qKiB0cnVlIHdoZW4gYXBwIHJ1bm5pbmcgaW4gZWxlY3Ryb24gZW52aXJvbm1lbnQgKi9cbiAgICByZWFkb25seSBlbGVjdHJvbjogYm9vbGVhbjtcbiAgICAvKiogQ29udGFpbnMgT1MgY2FuIGJlIGlvcywgYW5kcm9pZCBvciB3aW5kb3dzIChmb3IgV2luZG93cyBQaG9uZSkgKi9cbiAgICByZWFkb25seSBvczogc3RyaW5nO1xuICAgIC8qKiBDb250YWlucyBPUyB2ZXJzaW9uLCBlLmcuIDExLjIuMCAqL1xuICAgIHJlYWRvbmx5IG9zVmVyc2lvbjogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogRGV2aWNlIHBpeGVsIHJhdGlvICovXG4gICAgcmVhZG9ubHkgcGl4ZWxSYXRpbzogbnVtYmVyO1xufVxuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqIEBpbnRlcm5hbCAqL1xuY29uc3QgbWF5YmVUYWJsZXQgPSAod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gKFRocmVzaG9sZC5UQUJMRVRfTUlOX1dJRFRIIDw9IE1hdGgubWluKHdpZHRoLCBoZWlnaHQpKTtcbn07XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmNvbnN0IHN1cHBvcnRUb3VjaCA9ICgpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gISEoKG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDApIHx8ICgnb250b3VjaHN0YXJ0JyBpbiBnbG9iYWxUaGlzKSk7XG59O1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICogQHNlZSBTY3JlZW4ub3JpZW50YXRpb24gPGJyPlxuICogIC0gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvamEvZG9jcy9XZWIvQVBJL1NjcmVlbi9vcmllbnRhdGlvblxuICovXG5jb25zdCBzdXBwb3J0T3JpZW50YXRpb24gPSAodWE6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiAoJ29yaWVudGF0aW9uJyBpbiBnbG9iYWxUaGlzKSB8fCAoMCA8PSB1YS5pbmRleE9mKCdXaW5kb3dzIFBob25lJykpO1xufTtcblxuLyoqXG4gKiBAZW4gUXVlcnkgcGxhdGZvcm0gaW5mb3JtYXRpb24uXG4gKiBAamEg44OX44Op44OD44OI44OV44Kp44O844Og5oOF5aCx44Gu5Y+W5b6XXG4gKlxuICogQHBhcmFtIGNvbnRleHRcbiAqICAtIGBlbmAgZ2l2ZW4gYE5hdmlnYXRvcmAsIGBTY3JlZW5gLCBgZGV2aWNlUGl4ZWxSYXRpb2AgaW5mb3JtYXRpb24uXG4gKiAgLSBgamFgIOeSsOWig+OBriBgTmF2aWdhdG9yYCwgYFNjcmVlbmAsIGBkZXZpY2VQaXhlbFJhdGlvYCDjgpLmjIflrppcbiAqL1xuZXhwb3J0IGNvbnN0IHF1ZXJ5UGxhdGZvcm0gPSAoXG4gICAgY29udGV4dD86IHtcbiAgICAgICAgbmF2aWdhdG9yPzogeyB1c2VyQWdlbnQ6IHN0cmluZzsgcGxhdGZvcm06IHN0cmluZzsgc3RhbmRhbG9uZT86IGJvb2xlYW47IH07XG4gICAgICAgIHNjcmVlbj86IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXI7IH07XG4gICAgICAgIGRldmljZVBpeGVsUmF0aW8/OiBudW1iZXI7XG4gICAgfVxuKTogUGxhdGZvcm0gPT4ge1xuICAgIGNvbnRleHQgPSBjb250ZXh0IHx8IHsgbmF2aWdhdG9yLCBzY3JlZW4sIGRldmljZVBpeGVsUmF0aW8gfTtcbiAgICBjb25zdCBpbmZvID0ge1xuICAgICAgICBpb3M6IGZhbHNlLFxuICAgICAgICBhbmRyb2lkOiBmYWxzZSxcbiAgICAgICAgYW5kcm9pZENocm9tZTogZmFsc2UsXG4gICAgICAgIGRlc2t0b3A6IGZhbHNlLFxuICAgICAgICBtb2JpbGU6IGZhbHNlLFxuICAgICAgICBwaG9uZTogZmFsc2UsXG4gICAgICAgIHRhYmxldDogZmFsc2UsXG4gICAgICAgIGlwaG9uZTogZmFsc2UsXG4gICAgICAgIGlwaG9uZVg6IGZhbHNlLFxuICAgICAgICBpcG9kOiBmYWxzZSxcbiAgICAgICAgaXBhZDogZmFsc2UsXG4gICAgICAgIGVkZ2U6IGZhbHNlLFxuICAgICAgICBpZTogZmFsc2UsXG4gICAgICAgIGZpcmVmb3g6IGZhbHNlLFxuICAgICAgICBtYWNvczogZmFsc2UsXG4gICAgICAgIHdpbmRvd3M6IGZhbHNlLFxuICAgICAgICBjb3Jkb3ZhOiAhIShnZXRHbG9iYWwoKVsnY29yZG92YSddKSxcbiAgICAgICAgZWxlY3Ryb246IGZhbHNlLFxuICAgIH0gYXMgdW5rbm93biBhcyBXcml0YWJsZTxQbGF0Zm9ybT47XG5cbiAgICBjb25zdCB7IHVzZXJBZ2VudDogdWEsIHBsYXRmb3JtOiBvcywgc3RhbmRhbG9uZSB9ID0gY29udGV4dC5uYXZpZ2F0b3IgfHwgbmF2aWdhdG9yIGFzIHsgdXNlckFnZW50OiBzdHJpbmc7IHBsYXRmb3JtOiBzdHJpbmc7IHN0YW5kYWxvbmU/OiBib29sZWFuOyB9O1xuICAgIGNvbnN0IHsgd2lkdGg6IHNjcmVlbldpZHRoLCBoZWlnaHQ6IHNjcmVlbkhlaWdodCB9ID0gY29udGV4dC5zY3JlZW4gfHwgc2NyZWVuO1xuICAgIGNvbnN0IHBpeGVsUmF0aW8gPSBjb250ZXh0LmRldmljZVBpeGVsUmF0aW87XG5cbiAgICBjb25zdCBhbmRyb2lkICA9IC8oQW5kcm9pZCk7P1tcXHMvXSsoW1xcZC5dKyk/Ly5leGVjKHVhKTtcbiAgICBsZXQgICBpcGFkICAgICA9IC8oaVBhZCkuKk9TXFxzKFtcXGRfXSspLy5leGVjKHVhKTtcbiAgICBjb25zdCBpcG9kICAgICA9IC8oaVBvZCkoLipPU1xccyhbXFxkX10rKSk/Ly5leGVjKHVhKTtcbiAgICBsZXQgICBpcGhvbmUgICA9ICFpcGFkICYmIC8oaVBob25lXFxzT1N8aU9TKVxccyhbXFxkX10rKS8uZXhlYyh1YSk7XG4gICAgY29uc3QgaWUgICAgICAgPSAwIDw9IHVhLmluZGV4T2YoJ01TSUUgJykgfHwgMCA8PSB1YS5pbmRleE9mKCdUcmlkZW50LycpO1xuICAgIGNvbnN0IGVkZ2UgICAgID0gMCA8PSB1YS5pbmRleE9mKCdFZGdlLycpO1xuICAgIGNvbnN0IGZpcmVmb3ggID0gMCA8PSB1YS5pbmRleE9mKCdHZWNrby8nKSAmJiAwIDw9IHVhLmluZGV4T2YoJ0ZpcmVmb3gvJyk7XG4gICAgY29uc3Qgd2luZG93cyAgPSAnV2luMzInID09PSBvcztcbiAgICBsZXQgICBtYWNvcyAgICA9ICdNYWNJbnRlbCcgPT09IG9zO1xuICAgIGNvbnN0IGVsZWN0cm9uID0gdWEudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCdlbGVjdHJvbicpO1xuXG4gICAgLy8gaVBob25lKFgpIC8gaVBhZChQcm8pRGVza3RvcCBNb2RlXG4gICAgaWYgKCFpcGhvbmUgJiYgIWlwYWRcbiAgICAgICAgJiYgbWFjb3NcbiAgICAgICAgJiYgc3VwcG9ydFRvdWNoKClcbiAgICAgICAgJiYgKHVuZGVmaW5lZCAhPT0gc3RhbmRhbG9uZVxuLy8gICAgICAgICAgICAoMTAyNCA9PT0gc2NyZWVuV2lkdGggJiYgMTM2NiA9PT0gc2NyZWVuSGVpZ2h0KSAvLyBQcm8gMTIuOSBwb3J0cmFpdFxuLy8gICAgICAgICB8fCAoMTM2NiA9PT0gc2NyZWVuV2lkdGggJiYgMTAyNCA9PT0gc2NyZWVuSGVpZ2h0KSAvLyBQcm8gMTIuOSBsYW5kc2NhcGVcbi8vICAgICAgICAgfHwgKCA4MzQgPT09IHNjcmVlbldpZHRoICYmIDExOTQgPT09IHNjcmVlbkhlaWdodCkgLy8gUHJvIDExIHBvcnRyYWl0XG4vLyAgICAgICAgIHx8ICgxMTk0ID09PSBzY3JlZW5XaWR0aCAmJiAgODM0ID09PSBzY3JlZW5IZWlnaHQpIC8vIFBybyAxMSBsYW5kc2NhcGVcbi8vICAgICAgICAgfHwgKCA4MzQgPT09IHNjcmVlbldpZHRoICYmIDExMTIgPT09IHNjcmVlbkhlaWdodCkgLy8gUHJvIDEwLjUgcG9ydHJhaXRcbi8vICAgICAgICAgfHwgKDExMTIgPT09IHNjcmVlbldpZHRoICYmICA4MzQgPT09IHNjcmVlbkhlaWdodCkgLy8gUHJvIDEwLjUgbGFuZHNjYXBlXG4vLyAgICAgICAgIHx8ICggNzY4ID09PSBzY3JlZW5XaWR0aCAmJiAxMDI0ID09PSBzY3JlZW5IZWlnaHQpIC8vIG90aGVyIHBvcnRyYWl0XG4vLyAgICAgICAgIHx8ICgxMDI0ID09PSBzY3JlZW5XaWR0aCAmJiAgNzY4ID09PSBzY3JlZW5IZWlnaHQpIC8vIG90aGVyIGxhbmRzY2FwZVxuICAgICAgICApXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gLyhWZXJzaW9uKVxcLyhbXFxkLl0rKS8uZXhlYyh1YSk7XG4gICAgICAgIGlmIChtYXliZVRhYmxldChzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KSkge1xuICAgICAgICAgICAgaXBhZCA9IHJlZ2V4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXBob25lID0gcmVnZXg7XG4gICAgICAgIH1cbiAgICAgICAgbWFjb3MgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpbmZvLmllID0gaWU7XG4gICAgaW5mby5lZGdlID0gZWRnZTtcbiAgICBpbmZvLmZpcmVmb3ggPSBmaXJlZm94O1xuXG4gICAgLy8gQW5kcm9pZFxuICAgIGlmIChhbmRyb2lkICYmICF3aW5kb3dzKSB7XG4gICAgICAgIGluZm8ub3MgPSAnYW5kcm9pZCc7XG4gICAgICAgIGluZm8ub3NWZXJzaW9uID0gYW5kcm9pZFsyXTtcbiAgICAgICAgaW5mby5hbmRyb2lkID0gdHJ1ZTtcbiAgICAgICAgaW5mby5hbmRyb2lkQ2hyb21lID0gMCA8PSB1YS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2Nocm9tZScpO1xuICAgICAgICBpZiAoMCA8PSB1YS5pbmRleE9mKCdNb2JpbGUnKSkge1xuICAgICAgICAgICAgaW5mby5waG9uZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmZvLnRhYmxldCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlwYWQgfHwgaXBob25lIHx8IGlwb2QpIHtcbiAgICAgICAgaW5mby5vcyA9ICdpb3MnO1xuICAgICAgICBpbmZvLmlvcyA9IHRydWU7XG4gICAgfVxuICAgIC8vIGlPU1xuICAgIGlmIChpcGhvbmUgJiYgIWlwb2QpIHtcbiAgICAgICAgaW5mby5vc1ZlcnNpb24gPSBpcGhvbmVbMl0ucmVwbGFjZSgvXy9nLCAnLicpO1xuICAgICAgICBpbmZvLnBob25lID0gdHJ1ZTtcbiAgICAgICAgaW5mby5pcGhvbmUgPSB0cnVlO1xuICAgICAgICAvLyBpUGhvbmUgWFxuICAgICAgICBpZiAoXG4gICAgICAgICAgICAoMzc1ID09PSBzY3JlZW5XaWR0aCAmJiA4MTIgPT09IHNjcmVlbkhlaWdodCkgLy8gWCwgWFMgcG9ydHJhaXRcbiAgICAgICAgIHx8ICg4MTIgPT09IHNjcmVlbldpZHRoICYmIDM3NSA9PT0gc2NyZWVuSGVpZ2h0KSAvLyBYLCBYUyBsYW5kc2NhcGVcbiAgICAgICAgIHx8ICg0MTQgPT09IHNjcmVlbldpZHRoICYmIDg5NiA9PT0gc2NyZWVuSGVpZ2h0KSAvLyBYUyBNYXgsIFhSIHBvcnRyYWl0XG4gICAgICAgICB8fCAoODk2ID09PSBzY3JlZW5XaWR0aCAmJiA0MTQgPT09IHNjcmVlbkhlaWdodCkgLy8gWFMgTWF4LCBYUiBsYW5kc2NhcGVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBpbmZvLmlwaG9uZVggPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpcGFkKSB7XG4gICAgICAgIGluZm8ub3NWZXJzaW9uID0gaXBhZFsyXS5yZXBsYWNlKC9fL2csICcuJyk7XG4gICAgICAgIGluZm8udGFibGV0ID0gdHJ1ZTtcbiAgICAgICAgaW5mby5pcGFkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGlwb2QpIHtcbiAgICAgICAgaW5mby5vc1ZlcnNpb24gPSBpcG9kWzNdID8gaXBvZFszXS5yZXBsYWNlKC9fL2csICcuJykgOiBudWxsO1xuICAgICAgICBpbmZvLnBob25lID0gdHJ1ZTtcbiAgICAgICAgaW5mby5pcG9kID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBEZXNrdG9wXG4gICAgaW5mby5kZXNrdG9wID0gIXN1cHBvcnRPcmllbnRhdGlvbih1YSk7XG4gICAgaWYgKGluZm8uZGVza3RvcCkge1xuICAgICAgICBpbmZvLmVsZWN0cm9uID0gZWxlY3Ryb247XG4gICAgICAgIGluZm8ubWFjb3MgICAgPSBtYWNvcztcbiAgICAgICAgaW5mby53aW5kb3dzICA9IHdpbmRvd3M7XG4gICAgICAgIGluZm8ubWFjb3MgJiYgKGluZm8ub3MgPSAnbWFjb3MnKTtcbiAgICAgICAgaW5mby53aW5kb3dzICYmIChpbmZvLm9zID0gJ3dpbmRvd3MnKTtcbiAgICB9XG5cbiAgICAvLyBNb2JpbGVcbiAgICBpbmZvLm1vYmlsZSA9ICFpbmZvLmRlc2t0b3A7XG4gICAgaWYgKGluZm8ubW9iaWxlICYmICFpbmZvLnBob25lICYmICFpbmZvLnRhYmxldCkge1xuICAgICAgICBpZiAobWF5YmVUYWJsZXQoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpIHtcbiAgICAgICAgICAgIGluZm8udGFibGV0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZm8ucGhvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGl4ZWwgUmF0aW9cbiAgICBpbmZvLnBpeGVsUmF0aW8gPSBwaXhlbFJhdGlvIHx8IDE7XG5cbiAgICByZXR1cm4gaW5mbztcbn07XG5cbi8qKlxuICogQGVuIFBsYXRmb3JtIGluZm9ybWF0aW9uIG9uIHJ1bnRpbWUuXG4gKiBAamEg44Op44Oz44K/44Kk44Og44Gu44OX44Op44OD44OI44OV44Kp44O844Og5oOF5aCxXG4gKi9cbmV4cG9ydCBjb25zdCBwbGF0Zm9ybSA9IHF1ZXJ5UGxhdGZvcm0oKTtcbiJdLCJuYW1lcyI6WyJsb2NhdGlvbiIsIm5hdmlnYXRvciIsInNjcmVlbiIsImRldmljZVBpeGVsUmF0aW8iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7O0FBSUE7QUFDQSxNQUFNLFNBQVMsR0FBVyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BEO0FBQ0EsTUFBTSxVQUFVLEdBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNyRDtBQUNBLE1BQU0sT0FBTyxHQUFhLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEQ7QUFDQSxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7O0FDWDNEOzs7Ozs7OztNQVFhLGVBQWUsR0FBRyxDQUFDLEdBQVc7SUFDdkMsTUFBTSxLQUFLLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxFQUFFO0FBRUY7Ozs7OztNQU1hLE9BQU8sR0FBVyxlQUFlLENBQUNBLFNBQVEsQ0FBQyxJQUFJLEVBQUU7QUFFOUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFtQmEsS0FBSyxHQUFHLENBQUMsSUFBWTtJQUM5QixJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNqQyxPQUFPLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDO0tBQ3ZFO1NBQU07UUFDSCxPQUFPLE9BQU8sQ0FBQztLQUNsQjtBQUNMOztBQzBCQTtBQUVBO0FBQ0EsTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFhLEVBQUUsTUFBYztJQUM5QyxRQUFRLDhCQUE4QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRTtBQUNuRSxDQUFDLENBQUM7QUFFRjtBQUNBLE1BQU0sWUFBWSxHQUFHO0lBQ2pCLE9BQU8sQ0FBQyxFQUFFLENBQUNDLFVBQVMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxNQUFNLGNBQWMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ2hGLENBQUMsQ0FBQztBQUVGOzs7OztBQUtBLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxFQUFVO0lBQ2xDLE9BQU8sQ0FBQyxhQUFhLElBQUksVUFBVSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFDL0UsQ0FBQyxDQUFDO0FBRUY7Ozs7Ozs7O01BUWEsYUFBYSxHQUFHLENBQ3pCLE9BSUM7SUFFRCxPQUFPLEdBQUcsT0FBTyxJQUFJLGFBQUVBLFVBQVMsVUFBRUMsT0FBTSxvQkFBRUMsaUJBQWdCLEVBQUUsQ0FBQztJQUM3RCxNQUFNLElBQUksR0FBRztRQUNULEdBQUcsRUFBRSxLQUFLO1FBQ1YsT0FBTyxFQUFFLEtBQUs7UUFDZCxhQUFhLEVBQUUsS0FBSztRQUNwQixPQUFPLEVBQUUsS0FBSztRQUNkLE1BQU0sRUFBRSxLQUFLO1FBQ2IsS0FBSyxFQUFFLEtBQUs7UUFDWixNQUFNLEVBQUUsS0FBSztRQUNiLE1BQU0sRUFBRSxLQUFLO1FBQ2IsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQUUsS0FBSztRQUNYLElBQUksRUFBRSxLQUFLO1FBQ1gsSUFBSSxFQUFFLEtBQUs7UUFDWCxFQUFFLEVBQUUsS0FBSztRQUNULE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLEtBQUs7UUFDWixPQUFPLEVBQUUsS0FBSztRQUNkLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsUUFBUSxFQUFFLEtBQUs7S0FDZSxDQUFDO0lBRW5DLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSUYsVUFBMkUsQ0FBQztJQUNySixNQUFNLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSUMsT0FBTSxDQUFDO0lBQzlFLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztJQUU1QyxNQUFNLE9BQU8sR0FBSSw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdkQsSUFBTSxJQUFJLEdBQU8sc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sSUFBSSxHQUFPLHlCQUF5QixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRCxJQUFNLE1BQU0sR0FBSyxDQUFDLElBQUksSUFBSSw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEUsTUFBTSxFQUFFLEdBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDekUsTUFBTSxJQUFJLEdBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUMsTUFBTSxPQUFPLEdBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUUsTUFBTSxPQUFPLEdBQUksT0FBTyxLQUFLLEVBQUUsQ0FBQztJQUNoQyxJQUFNLEtBQUssR0FBTSxVQUFVLEtBQUssRUFBRSxDQUFDO0lBQ25DLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7O0lBR3pELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJO1dBQ2IsS0FBSztXQUNMLFlBQVksRUFBRTtZQUNiLFNBQVMsS0FBSyxVQUFVOzs7Ozs7Ozs7U0FTM0IsRUFDSDtRQUNFLE1BQU0sS0FBSyxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QyxJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLEVBQUU7WUFDeEMsSUFBSSxHQUFHLEtBQUssQ0FBQztTQUNoQjthQUFNO1lBQ0gsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUNsQjtRQUNELEtBQUssR0FBRyxLQUFLLENBQUM7S0FDakI7SUFFRCxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNiLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOztJQUd2QixJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNyQixJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7U0FDckI7YUFBTTtZQUNILElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQ3RCO0tBQ0o7SUFDRCxJQUFJLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO1FBQ3hCLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0tBQ25COztJQUVELElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7O1FBRW5CLElBQ0ksQ0FBQyxHQUFHLEtBQUssV0FBVyxJQUFJLEdBQUcsS0FBSyxZQUFZO2dCQUMzQyxHQUFHLEtBQUssV0FBVyxJQUFJLEdBQUcsS0FBSyxZQUFZLENBQUM7Z0JBQzVDLEdBQUcsS0FBSyxXQUFXLElBQUksR0FBRyxLQUFLLFlBQVksQ0FBQztnQkFDNUMsR0FBRyxLQUFLLFdBQVcsSUFBSSxHQUFHLEtBQUssWUFBWSxDQUFDO1VBQy9DO1lBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDdkI7S0FDSjtJQUNELElBQUksSUFBSSxFQUFFO1FBQ04sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztLQUNwQjtJQUNELElBQUksSUFBSSxFQUFFO1FBQ04sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzdELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0tBQ3BCOztJQUdELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDZCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsS0FBSyxHQUFNLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsT0FBTyxHQUFJLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDO0tBQ3pDOztJQUdELElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQzVDLElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBRTtZQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztTQUN0QjthQUFNO1lBQ0gsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7U0FDckI7S0FDSjs7SUFHRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUM7SUFFbEMsT0FBTyxJQUFJLENBQUM7QUFDaEIsRUFBRTtBQUVGOzs7O01BSWEsUUFBUSxHQUFHLGFBQWE7Ozs7Iiwic291cmNlUm9vdCI6ImNkcDovLy9AY2RwL2Vudmlyb25tZW50LyJ9
