/*!
 * @cdp/dom 0.9.0
 *   dom utility module
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@cdp/core-utils')) :
    typeof define === 'function' && define.amd ? define(['exports', '@cdp/core-utils'], factory) :
    (global = global || self, factory(global.CDP = global.CDP || {}, global.CDP.Utils));
}(this, function (exports, coreUtils) { 'use strict';

    /*
     * SSR (Server Side Rendering) 環境においても
     * `window` オブジェクトと `document` オブジェクトの存在を保証する
     */
    const win = coreUtils.safe(globalThis.window);
    const doc = coreUtils.safe(globalThis.document);

    /**
     * @en Create Element array from seed arg.
     * @ja 指定された Seed から Element 配列を作成
     *
     * @param seed
     *  - `en` Object(s) or the selector string which becomes origin of Element array.
     *  - `ja` Element 配列のもとになるオブジェクト(群)またはセレクタ文字列
     * @param context
     *  - `en` Set using `Document` context. When being un-designating, a fixed value of the environment is used.
     *  - `ja` 使用する `Document` コンテキストを指定. 未指定の場合は環境の既定値が使用される.
     * @returns Element[] based Node or Window object.
     */
    function elementify(seed, context = doc) {
        if (!seed) {
            return [];
        }
        const elements = [];
        try {
            if ('string' === typeof seed) {
                const html = seed.trim();
                if (html.includes('<') && html.includes('>')) {
                    // markup
                    const template = doc.createElement('template');
                    template.innerHTML = html;
                    elements.push(...template.content.children);
                }
                else {
                    const selector = seed.trim();
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    if (coreUtils.isFunction(context.getElementById) && ('#' === selector[0]) && !/[ .<>:~]/.exec(selector)) {
                        // pure ID selector
                        const el = context.getElementById(selector.substring(1));
                        el && elements.push(el);
                    }
                    else if ('body' === selector) {
                        // body
                        elements.push(doc.body);
                    }
                    else {
                        // other selectors
                        elements.push(...context.querySelectorAll(selector));
                    }
                }
            }
            else if (seed.nodeType || window === seed) {
                // Node/element, Window
                elements.push(seed);
            }
            else if (0 < seed.length && (seed[0].nodeType || window === seed[0])) {
                // array of elements or collection of DOM
                elements.push(...seed);
            }
        }
        catch (e) {
            console.warn(`elementify(${coreUtils.className(seed)}, ${coreUtils.className(context)}), failed. [error:${e}]`);
        }
        return elements;
    }

    const utils = /*#__PURE__*/Object.freeze({
        elementify: elementify
    });

    let _factory;
    /**
     * @en Create [[DOMClass]] instance from `selector` arg.
     * @ja 指定された `selector` [[DOMClass]] インスタンスを作成
     *
     * @param selector
     *  - `en` Object(s) or the selector string which becomes origin of [[DOMClass]].
     *  - `ja` [[DOMClass]] のもとになるオブジェクト(群)またはセレクタ文字列
     * @param context
     *  - `en` Set using `Document` context. When being un-designating, a fixed value of the environment is used.
     *  - `ja` 使用する `Document` コンテキストを指定. 未指定の場合は環境の既定値が使用される.
     * @returns [[DOMClass]] instance.
     */
    function dom(selector, context) {
        return _factory(selector, context);
    }
    dom.utils = utils;
    /** @internal 循環参照回避のための遅延コンストラクションメソッド */
    function setup(fn, factory) {
        _factory = factory;
        dom.fn = fn;
    }

    /** @internal */
    const _createIterableIterator = Symbol('createIterableIterator');
    /**
     * @en Base abstraction class of [[DOMClass]]. This class provides iterator methods.
     * @ja [[DOMClass]] の基底抽象クラス. iterator を提供.
     */
    class DOMBase {
        /**
         * constructor
         *
         * @param elements
         *  - `en` operation targets `Element` array.
         *  - `ja` 操作対象の `Element` 配列
         */
        constructor(elements) {
            const self = this;
            for (const [index, elem] of elements.entries()) {
                self[index] = elem;
            }
            this.length = elements.length;
        }
        ///////////////////////////////////////////////////////////////////////
        // implements: Iterable<T>
        /**
         * @en Iterator of [[ElementBase]] values in the array.
         * @ja 格納している [[ElementBase]] にアクセス可能なイテレータオブジェクトを返却
         */
        [Symbol.iterator]() {
            const iterator = {
                base: this,
                pointer: 0,
                next() {
                    if (this.pointer < this.base.length) {
                        return {
                            done: false,
                            value: this.base[this.pointer++],
                        };
                    }
                    else {
                        return {
                            done: true,
                            value: undefined,
                        };
                    }
                },
            };
            return iterator;
        }
        /**
         * @en Returns an iterable of key(index), value([[ElementBase]]) pairs for every entry in the array.
         * @ja key(index), value([[ElementBase]]) 配列にアクセス可能なイテレータオブジェクトを返却
         */
        entries() {
            return this[_createIterableIterator]((key, value) => [key, value]);
        }
        /**
         * @en Returns an iterable of keys(index) in the array.
         * @ja key(index) 配列にアクセス可能なイテレータオブジェクトを返却
         */
        keys() {
            return this[_createIterableIterator]((key) => key);
        }
        /**
         * @en Returns an iterable of values([[ElementBase]]) in the array.
         * @ja values([[ElementBase]]) 配列にアクセス可能なイテレータオブジェクトを返却
         */
        values() {
            return this[_createIterableIterator]((key, value) => value);
        }
        /** @internal common iterator create function */
        [_createIterableIterator](valueGenerator) {
            const context = {
                base: this,
                pointer: 0,
            };
            const iterator = {
                next() {
                    const current = context.pointer;
                    if (current < context.base.length) {
                        context.pointer++;
                        return {
                            done: false,
                            value: valueGenerator(current, context.base[current]),
                        };
                    }
                    else {
                        return {
                            done: true,
                            value: undefined,
                        };
                    }
                },
                [Symbol.iterator]() {
                    return this;
                },
            };
            return iterator;
        }
    }
    /**
     * @en Check the selector type is Nil.
     * @ja Nil セレクタであるか判定
     *
     * @param selector
     *  - `en` evaluated value
     *  - `ja` 評価する値
     */
    function isEmptySelector(selector) {
        return !selector;
    }
    /**
     * @en Check the selector type is String.
     * @ja String セレクタであるか判定
     *
     * @param selector
     *  - `en` evaluated value
     *  - `ja` 評価する値
     */
    function isStringSelector(selector) {
        return 'string' === typeof selector;
    }
    /**
     * @en Check the selector type is Node.
     * @ja Node セレクタであるか判定
     *
     * @param selector
     *  - `en` evaluated value
     *  - `ja` 評価する値
     */
    function isNodeSelector(selector) {
        return null != selector.nodeType;
    }
    /**
     * @en Check the selector type is Document.
     * @ja Document セレクタであるか判定
     *
     * @param selector
     *  - `en` evaluated value
     *  - `ja` 評価する値
     */
    function isDocumentSelector(selector) {
        return doc === selector;
    }
    /**
     * @en Check the selector type is Window.
     * @ja Window セレクタであるか判定
     *
     * @param selector
     *  - `en` evaluated value
     *  - `ja` 評価する値
     */
    function isWindowSelector(selector) {
        return win === selector;
    }
    /**
     * @en Check the selector is able to iterate.
     * @ja 走査可能なセレクタであるか判定
     *
     * @param selector
     *  - `en` evaluated value
     *  - `ja` 評価する値
     */
    function isIterableSelector(selector) {
        return null != selector.length;
    }

    /**
     * @en Mixin base class which concentrated the methods of DOM class.
     * @ja DOM のメソッドを集約した Mixin Base クラス
     */
    class DOMMethods {
        ///////////////////////////////////////////////////////////////////////
        // public:
        /**
         * @en Check the current matched set of elements against a selector, element, or [[DOM]] object.
         * @ja セレクタ, 要素, または [[DOM]] オブジェクトを指定し, 現在の要素のセットと一致するか確認
         *
         * @param selector
         *  - `en` Object(s) or the selector string which becomes origin of [[DOMClass]], test function.
         *  - `ja` [[DOMClass]] のもとになるオブジェクト(群)またはセレクタ文字列, テスト関数
         * @returns
         *  - `en` `true` if at least one of these elements matches the given arguments.
         *  - `ja` 引数に指定した条件が要素の一つでも一致すれば `true` を返却
         */
        is(selector) {
            if (this.length <= 0 || isEmptySelector(selector)) {
                return false;
            }
            for (const [index, el] of this.entries()) {
                if (coreUtils.isFunction(selector)) {
                    if (selector(index, el)) {
                        return true;
                    }
                }
                else if (isStringSelector(selector)) {
                    if (el.matches && el.matches(selector)) {
                        return true;
                    }
                }
                else if (isWindowSelector(selector)) {
                    return win === el;
                }
                else if (isDocumentSelector(selector)) {
                    return doc === el;
                }
                else if (isNodeSelector(selector)) {
                    if (selector === el) {
                        return true;
                    }
                }
                else if (isIterableSelector(selector)) {
                    for (const elem of selector) {
                        if (elem === el) {
                            return true;
                        }
                    }
                }
                else {
                    return false;
                }
            }
            return false;
        }
    }

    /**
     * @en This class provides DOM operations like `jQuery` library.
     * @ja `jQuery` のようなDOM 操作を提供
     */
    class DOMClass extends coreUtils.mixins(DOMBase, DOMMethods) {
        /**
         * private constructor
         *
         * @param elements
         *  - `en` operation targets `Element` array.
         *  - `ja` 操作対象の `Element` 配列
         */
        constructor(elements) {
            super(elements);
            this.super(DOMMethods);
        }
        /**
         * @en Create [[DOM]] instance from `selector` arg.
         * @ja 指定された `selector` [[DOM]] インスタンスを作成
         *
         * @internal
         *
         * @param selector
         *  - `en` Object(s) or the selector string which becomes origin of [[DOMClass]].
         *  - `ja` [[DOMClass]] のもとになるオブジェクト(群)またはセレクタ文字列
         * @param context
         *  - `en` Set using `Document` context. When being un-designating, a fixed value of the environment is used.
         *  - `ja` 使用する `Document` コンテキストを指定. 未指定の場合は環境の既定値が使用される.
         * @returns [[DOMClass]] instance.
         */
        static create(selector, context) {
            if (selector && !context) {
                if (selector instanceof DOMClass) {
                    return selector; // eslint-disable-line @typescript-eslint/no-explicit-any
                }
            }
            return new DOMClass(elementify(selector, context));
        }
    }

    // init for static
    setup(DOMClass.prototype, DOMClass.create);

    exports.default = dom;
    exports.dom = dom;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLmpzIiwic291cmNlcyI6WyJzc3IudHMiLCJ1dGlscy50cyIsInN0YXRpYy50cyIsImJhc2UudHMiLCJtZXRob2RzLnRzIiwiY2xhc3MudHMiLCJpbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzYWZlIH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcblxuLypcbiAqIFNTUiAoU2VydmVyIFNpZGUgUmVuZGVyaW5nKSDnkrDlooPjgavjgYrjgYTjgabjgoJcbiAqIGB3aW5kb3dgIOOCquODluOCuOOCp+OCr+ODiOOBqCBgZG9jdW1lbnRgIOOCquODluOCuOOCp+OCr+ODiOOBruWtmOWcqOOCkuS/neiovOOBmeOCi1xuICovXG5jb25zdCB3aW4gPSBzYWZlKGdsb2JhbFRoaXMud2luZG93KTtcbmNvbnN0IGRvYyA9IHNhZmUoZ2xvYmFsVGhpcy5kb2N1bWVudCk7XG5cbmV4cG9ydCB7XG4gICAgd2luIGFzIHdpbmRvdyxcbiAgICBkb2MgYXMgZG9jdW1lbnQsXG59O1xuIiwiaW1wb3J0IHtcbiAgICBOaWwsXG4gICAgaXNGdW5jdGlvbixcbiAgICBjbGFzc05hbWUsXG59IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQgeyBkb2N1bWVudCB9IGZyb20gJy4vc3NyJztcblxuZXhwb3J0IHR5cGUgRWxlbWVudEJhc2UgPSBOb2RlIHwgV2luZG93O1xuZXhwb3J0IHR5cGUgRWxlbWVudFJlc3VsdDxUPiA9IFQgZXh0ZW5kcyBFbGVtZW50QmFzZSA/IFQgOiBFbGVtZW50O1xuZXhwb3J0IHR5cGUgU2VsZWN0b3JCYXNlID0gTm9kZSB8IFdpbmRvdyB8IHN0cmluZyB8IE5pbDtcbmV4cG9ydCB0eXBlIEVsZW1lbnRpZnlTZWVkPFQgZXh0ZW5kcyBTZWxlY3RvckJhc2UgPSBFbGVtZW50PiA9IFQgfCAoVCBleHRlbmRzIEVsZW1lbnRCYXNlID8gVFtdIDogbmV2ZXIpIHwgTm9kZUxpc3RPZjxUIGV4dGVuZHMgTm9kZSA/IFQgOiBuZXZlcj47XG5leHBvcnQgdHlwZSBRdWVyeUNvbnRleHQgPSBQYXJlbnROb2RlICYgUGFydGlhbDxOb25FbGVtZW50UGFyZW50Tm9kZT47XG5cbi8qKlxuICogQGVuIENyZWF0ZSBFbGVtZW50IGFycmF5IGZyb20gc2VlZCBhcmcuXG4gKiBAamEg5oyH5a6a44GV44KM44GfIFNlZWQg44GL44KJIEVsZW1lbnQg6YWN5YiX44KS5L2c5oiQXG4gKlxuICogQHBhcmFtIHNlZWRcbiAqICAtIGBlbmAgT2JqZWN0KHMpIG9yIHRoZSBzZWxlY3RvciBzdHJpbmcgd2hpY2ggYmVjb21lcyBvcmlnaW4gb2YgRWxlbWVudCBhcnJheS5cbiAqICAtIGBqYWAgRWxlbWVudCDphY3liJfjga7jgoLjgajjgavjgarjgovjgqrjg5bjgrjjgqfjgq/jg4go576kKeOBvuOBn+OBr+OCu+ODrOOCr+OCv+aWh+Wtl+WIl1xuICogQHBhcmFtIGNvbnRleHRcbiAqICAtIGBlbmAgU2V0IHVzaW5nIGBEb2N1bWVudGAgY29udGV4dC4gV2hlbiBiZWluZyB1bi1kZXNpZ25hdGluZywgYSBmaXhlZCB2YWx1ZSBvZiB0aGUgZW52aXJvbm1lbnQgaXMgdXNlZC5cbiAqICAtIGBqYWAg5L2/55So44GZ44KLIGBEb2N1bWVudGAg44Kz44Oz44OG44Kt44K544OI44KS5oyH5a6aLiDmnKrmjIflrprjga7loLTlkIjjga/nkrDlooPjga7ml6LlrprlgKTjgYzkvb/nlKjjgZXjgozjgosuXG4gKiBAcmV0dXJucyBFbGVtZW50W10gYmFzZWQgTm9kZSBvciBXaW5kb3cgb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZWxlbWVudGlmeTxUIGV4dGVuZHMgU2VsZWN0b3JCYXNlPihzZWVkPzogRWxlbWVudGlmeVNlZWQ8VD4sIGNvbnRleHQ6IFF1ZXJ5Q29udGV4dCA9IGRvY3VtZW50KTogRWxlbWVudFJlc3VsdDxUPltdIHtcbiAgICBpZiAoIXNlZWQpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnRzOiBFbGVtZW50W10gPSBbXTtcblxuICAgIHRyeSB7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHNlZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSBzZWVkLnRyaW0oKTtcbiAgICAgICAgICAgIGlmIChodG1sLmluY2x1ZGVzKCc8JykgJiYgaHRtbC5pbmNsdWRlcygnPicpKSB7XG4gICAgICAgICAgICAgICAgLy8gbWFya3VwXG4gICAgICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMucHVzaCguLi50ZW1wbGF0ZS5jb250ZW50LmNoaWxkcmVuKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBzZWVkLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3VuYm91bmQtbWV0aG9kXG4gICAgICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dC5nZXRFbGVtZW50QnlJZCkgJiYgKCcjJyA9PT0gc2VsZWN0b3JbMF0pICYmICEvWyAuPD46fl0vLmV4ZWMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHB1cmUgSUQgc2VsZWN0b3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBjb250ZXh0LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yLnN1YnN0cmluZygxKSk7XG4gICAgICAgICAgICAgICAgICAgIGVsICYmIGVsZW1lbnRzLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoJ2JvZHknID09PSBzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBib2R5XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goZG9jdW1lbnQuYm9keSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gb3RoZXIgc2VsZWN0b3JzXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goLi4uY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKChzZWVkIGFzIE5vZGUpLm5vZGVUeXBlIHx8IHdpbmRvdyA9PT0gc2VlZCkge1xuICAgICAgICAgICAgLy8gTm9kZS9lbGVtZW50LCBXaW5kb3dcbiAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goc2VlZCBhcyBOb2RlIGFzIEVsZW1lbnQpO1xuICAgICAgICB9IGVsc2UgaWYgKDAgPCAoc2VlZCBhcyBUW10pLmxlbmd0aCAmJiAoc2VlZFswXS5ub2RlVHlwZSB8fCB3aW5kb3cgPT09IHNlZWRbMF0pKSB7XG4gICAgICAgICAgICAvLyBhcnJheSBvZiBlbGVtZW50cyBvciBjb2xsZWN0aW9uIG9mIERPTVxuICAgICAgICAgICAgZWxlbWVudHMucHVzaCguLi4oc2VlZCBhcyBOb2RlW10gYXMgRWxlbWVudFtdKSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgZWxlbWVudGlmeSgke2NsYXNzTmFtZShzZWVkKX0sICR7Y2xhc3NOYW1lKGNvbnRleHQpfSksIGZhaWxlZC4gW2Vycm9yOiR7ZX1dYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVsZW1lbnRzIGFzIEVsZW1lbnRSZXN1bHQ8VD5bXTtcbn1cbiIsIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2UsIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbmltcG9ydCB7XG4gICAgRWxlbWVudEJhc2UsXG4gICAgU2VsZWN0b3JCYXNlLFxuICAgIFF1ZXJ5Q29udGV4dCxcbn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7XG4gICAgRE9NLFxuICAgIERPTUNsYXNzLFxuICAgIERPTVNlbGVjdG9yLFxuICAgIERPTVJlc3VsdCxcbiAgICBET01JdGVyYXRlQ2FsbGJhY2ssXG59IGZyb20gJy4vY2xhc3MnO1xuXG5kZWNsYXJlIG5hbWVzcGFjZSBkb20ge1xuICAgIGxldCBmbjogRE9NQ2xhc3M8YW55Pjtcbn1cblxudHlwZSBET01GYWN0b3J5ID0gPFQgZXh0ZW5kcyBTZWxlY3RvckJhc2U+KHNlbGVjdG9yPzogRE9NU2VsZWN0b3I8VD4sIGNvbnRleHQ/OiBRdWVyeUNvbnRleHQpID0+IERPTVJlc3VsdDxUPjtcblxubGV0IF9mYWN0b3J5ITogRE9NRmFjdG9yeTtcblxuLyoqXG4gKiBAZW4gQ3JlYXRlIFtbRE9NQ2xhc3NdXSBpbnN0YW5jZSBmcm9tIGBzZWxlY3RvcmAgYXJnLlxuICogQGphIOaMh+WumuOBleOCjOOBnyBgc2VsZWN0b3JgIFtbRE9NQ2xhc3NdXSDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLkvZzmiJBcbiAqXG4gKiBAcGFyYW0gc2VsZWN0b3JcbiAqICAtIGBlbmAgT2JqZWN0KHMpIG9yIHRoZSBzZWxlY3RvciBzdHJpbmcgd2hpY2ggYmVjb21lcyBvcmlnaW4gb2YgW1tET01DbGFzc11dLlxuICogIC0gYGphYCBbW0RPTUNsYXNzXV0g44Gu44KC44Go44Gr44Gq44KL44Kq44OW44K444Kn44Kv44OIKOe+pCnjgb7jgZ/jga/jgrvjg6zjgq/jgr/mloflrZfliJdcbiAqIEBwYXJhbSBjb250ZXh0XG4gKiAgLSBgZW5gIFNldCB1c2luZyBgRG9jdW1lbnRgIGNvbnRleHQuIFdoZW4gYmVpbmcgdW4tZGVzaWduYXRpbmcsIGEgZml4ZWQgdmFsdWUgb2YgdGhlIGVudmlyb25tZW50IGlzIHVzZWQuXG4gKiAgLSBgamFgIOS9v+eUqOOBmeOCiyBgRG9jdW1lbnRgIOOCs+ODs+ODhuOCreOCueODiOOCkuaMh+Wumi4g5pyq5oyH5a6a44Gu5aC05ZCI44Gv55Kw5aKD44Gu5pei5a6a5YCk44GM5L2/55So44GV44KM44KLLlxuICogQHJldHVybnMgW1tET01DbGFzc11dIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBkb208VCBleHRlbmRzIFNlbGVjdG9yQmFzZT4oc2VsZWN0b3I/OiBET01TZWxlY3RvcjxUPiwgY29udGV4dD86IFF1ZXJ5Q29udGV4dCk6IERPTVJlc3VsdDxUPiB7XG4gICAgcmV0dXJuIF9mYWN0b3J5KHNlbGVjdG9yLCBjb250ZXh0KTtcbn1cblxuZG9tLnV0aWxzID0gdXRpbHM7XG5cbi8qKiBAaW50ZXJuYWwg5b6q55Kw5Y+C54Wn5Zue6YG/44Gu44Gf44KB44Gu6YGF5bu244Kz44Oz44K544OI44Op44Kv44K344On44Oz44Oh44K944OD44OJICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoZm46IERPTUNsYXNzPGFueT4sIGZhY3Rvcnk6IERPTUZhY3RvcnkpOiB2b2lkIHtcbiAgICBfZmFjdG9yeSA9IGZhY3Rvcnk7XG4gICAgZG9tLmZuID0gZm47XG59XG5cbmV4cG9ydCB7XG4gICAgRWxlbWVudEJhc2UsXG4gICAgU2VsZWN0b3JCYXNlLFxuICAgIFF1ZXJ5Q29udGV4dCxcbiAgICBET00sXG4gICAgRE9NU2VsZWN0b3IsXG4gICAgRE9NSXRlcmF0ZUNhbGxiYWNrLFxuICAgIGRvbSxcbn07XG4iLCJpbXBvcnQgeyBOaWwsIFdyaXRhYmxlIH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcbmltcG9ydCB7IHdpbmRvdywgZG9jdW1lbnQgfSBmcm9tICcuL3Nzcic7XG5pbXBvcnQge1xuICAgIEVsZW1lbnRCYXNlLFxuICAgIFNlbGVjdG9yQmFzZSxcbiAgICBET00sXG4gICAgRE9NU2VsZWN0b3IsXG59IGZyb20gJy4vc3RhdGljJztcblxuLyoqIEBpbnRlcm5hbCAqL1xuY29uc3QgX2NyZWF0ZUl0ZXJhYmxlSXRlcmF0b3IgPSBTeW1ib2woJ2NyZWF0ZUl0ZXJhYmxlSXRlcmF0b3InKTtcblxuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IHR5cGUgRWxlbWVudEFjY2VzczxUIGV4dGVuZHMgRWxlbWVudEJhc2UgPSBFbGVtZW50PiA9IFdyaXRhYmxlPERPTUJhc2U8VD4+O1xuXG4vKipcbiAqIEBlbiBCYXNlIGFic3RyYWN0aW9uIGNsYXNzIG9mIFtbRE9NQ2xhc3NdXS4gVGhpcyBjbGFzcyBwcm92aWRlcyBpdGVyYXRvciBtZXRob2RzLlxuICogQGphIFtbRE9NQ2xhc3NdXSDjga7ln7rlupXmir3osaHjgq/jg6njgrkuIGl0ZXJhdG9yIOOCkuaPkOS+my5cbiAqL1xuZXhwb3J0IGNsYXNzIERPTUJhc2U8VCBleHRlbmRzIEVsZW1lbnRCYXNlPiBpbXBsZW1lbnRzIEFycmF5TGlrZTxUPiwgSXRlcmFibGU8VD4ge1xuICAgIC8qKlxuICAgICAqIEBlbiBudW1iZXIgb2YgYEVsZW1lbnRgXG4gICAgICogQGphIOWGheWMheOBmeOCiyBgRWxlbWVudGAg5pWwXG4gICAgICovXG4gICAgcmVhZG9ubHkgbGVuZ3RoOiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gYEVsZW1lbnRgIGFjY2Vzc29yXG4gICAgICogQGphIGBFbGVtZW50YCDjgbjjga7mt7vjgYjlrZfjgqLjgq/jgrvjgrlcbiAgICAgKi9cbiAgICByZWFkb25seSBbbjogbnVtYmVyXTogVDtcblxuICAgIC8qKlxuICAgICAqIGNvbnN0cnVjdG9yXG4gICAgICogXG4gICAgICogQHBhcmFtIGVsZW1lbnRzXG4gICAgICogIC0gYGVuYCBvcGVyYXRpb24gdGFyZ2V0cyBgRWxlbWVudGAgYXJyYXkuXG4gICAgICogIC0gYGphYCDmk43kvZzlr77osaHjga4gYEVsZW1lbnRgIOmFjeWIl1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnRzOiBUW10pIHtcbiAgICAgICAgY29uc3Qgc2VsZjogRWxlbWVudEFjY2VzczxUPiA9IHRoaXM7XG4gICAgICAgIGZvciAoY29uc3QgW2luZGV4LCBlbGVtXSBvZiBlbGVtZW50cy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIHNlbGZbaW5kZXhdID0gZWxlbTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBpbXBsZW1lbnRzOiBJdGVyYWJsZTxUPlxuXG4gICAgLyoqXG4gICAgICogQGVuIEl0ZXJhdG9yIG9mIFtbRWxlbWVudEJhc2VdXSB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICAgICAqIEBqYSDmoLzntI3jgZfjgabjgYTjgosgW1tFbGVtZW50QmFzZV1dIOOBq+OCouOCr+OCu+OCueWPr+iDveOBquOCpOODhuODrOODvOOCv+OCquODluOCuOOCp+OCr+ODiOOCkui/lOWNtFxuICAgICAqL1xuICAgIFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhdG9yPFQ+IHtcbiAgICAgICAgY29uc3QgaXRlcmF0b3IgPSB7XG4gICAgICAgICAgICBiYXNlOiB0aGlzLFxuICAgICAgICAgICAgcG9pbnRlcjogMCxcbiAgICAgICAgICAgIG5leHQoKTogSXRlcmF0b3JSZXN1bHQ8VD4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBvaW50ZXIgPCB0aGlzLmJhc2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLmJhc2VbdGhpcy5wb2ludGVyKytdLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHVuZGVmaW5lZCEsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBpdGVyYXRvciBhcyBJdGVyYXRvcjxUPjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gUmV0dXJucyBhbiBpdGVyYWJsZSBvZiBrZXkoaW5kZXgpLCB2YWx1ZShbW0VsZW1lbnRCYXNlXV0pIHBhaXJzIGZvciBldmVyeSBlbnRyeSBpbiB0aGUgYXJyYXkuXG4gICAgICogQGphIGtleShpbmRleCksIHZhbHVlKFtbRWxlbWVudEJhc2VdXSkg6YWN5YiX44Gr44Ki44Kv44K744K55Y+v6IO944Gq44Kk44OG44Os44O844K/44Kq44OW44K444Kn44Kv44OI44KS6L+U5Y20XG4gICAgICovXG4gICAgZW50cmllcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFtudW1iZXIsIFRdPiB7XG4gICAgICAgIHJldHVybiB0aGlzW19jcmVhdGVJdGVyYWJsZUl0ZXJhdG9yXSgoa2V5OiBudW1iZXIsIHZhbHVlOiBUKSA9PiBba2V5LCB2YWx1ZV0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBSZXR1cm5zIGFuIGl0ZXJhYmxlIG9mIGtleXMoaW5kZXgpIGluIHRoZSBhcnJheS5cbiAgICAgKiBAamEga2V5KGluZGV4KSDphY3liJfjgavjgqLjgq/jgrvjgrnlj6/og73jgarjgqTjg4bjg6zjg7zjgr/jgqrjg5bjgrjjgqfjgq/jg4jjgpLov5TljbRcbiAgICAgKi9cbiAgICBrZXlzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiB0aGlzW19jcmVhdGVJdGVyYWJsZUl0ZXJhdG9yXSgoa2V5OiBudW1iZXIpID0+IGtleSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFJldHVybnMgYW4gaXRlcmFibGUgb2YgdmFsdWVzKFtbRWxlbWVudEJhc2VdXSkgaW4gdGhlIGFycmF5LlxuICAgICAqIEBqYSB2YWx1ZXMoW1tFbGVtZW50QmFzZV1dKSDphY3liJfjgavjgqLjgq/jgrvjgrnlj6/og73jgarjgqTjg4bjg6zjg7zjgr/jgqrjg5bjgrjjgqfjgq/jg4jjgpLov5TljbRcbiAgICAgKi9cbiAgICB2YWx1ZXMoKTogSXRlcmFibGVJdGVyYXRvcjxUPiB7XG4gICAgICAgIHJldHVybiB0aGlzW19jcmVhdGVJdGVyYWJsZUl0ZXJhdG9yXSgoa2V5OiBudW1iZXIsIHZhbHVlOiBUKSA9PiB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCBjb21tb24gaXRlcmF0b3IgY3JlYXRlIGZ1bmN0aW9uICovXG4gICAgcHJpdmF0ZSBbX2NyZWF0ZUl0ZXJhYmxlSXRlcmF0b3JdPFI+KHZhbHVlR2VuZXJhdG9yOiAoa2V5OiBudW1iZXIsIHZhbHVlOiBUKSA9PiBSKTogSXRlcmFibGVJdGVyYXRvcjxSPiB7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgICAgICBiYXNlOiB0aGlzLFxuICAgICAgICAgICAgcG9pbnRlcjogMCxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBpdGVyYXRvcjogSXRlcmFibGVJdGVyYXRvcjxSPiA9IHtcbiAgICAgICAgICAgIG5leHQoKTogSXRlcmF0b3JSZXN1bHQ8Uj4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBjb250ZXh0LnBvaW50ZXI7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgPCBjb250ZXh0LmJhc2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQucG9pbnRlcisrO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVHZW5lcmF0b3IoY3VycmVudCwgY29udGV4dC5iYXNlW2N1cnJlbnRdKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB1bmRlZmluZWQhLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW1N5bWJvbC5pdGVyYXRvcl0oKTogSXRlcmFibGVJdGVyYXRvcjxSPiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBpdGVyYXRvcjtcbiAgICB9XG59XG5cbi8qKlxuICogQGVuIEJhc2UgaW50ZXJmYWNlIGZvciBET00gTWl4aW4gY2xhc3MuXG4gKiBAamEgRE9NIE1peGluIOOCr+ODqeOCueOBruaXouWumuOCpOODs+OCv+ODvOODleOCp+OCpOOCuVxuICovXG5leHBvcnQgaW50ZXJmYWNlIElET008VCBleHRlbmRzIEVsZW1lbnRCYXNlID0gRWxlbWVudD4gZXh0ZW5kcyBQYXJ0aWFsPERPTUJhc2U8VD4+IHsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1lbXB0eS1pbnRlcmZhY2VcblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHNlbGVjdG9yIHR5cGUgaXMgTmlsLlxuICogQGphIE5pbCDjgrvjg6zjgq/jgr/jgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0gc2VsZWN0b3JcbiAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eVNlbGVjdG9yPFQgZXh0ZW5kcyBTZWxlY3RvckJhc2U+KHNlbGVjdG9yOiBET01TZWxlY3RvcjxUPik6IHNlbGVjdG9yIGlzIEV4dHJhY3Q8RE9NU2VsZWN0b3I8VD4sIE5pbD4ge1xuICAgIHJldHVybiAhc2VsZWN0b3I7XG59XG5cbi8qKlxuICogQGVuIENoZWNrIHRoZSBzZWxlY3RvciB0eXBlIGlzIFN0cmluZy5cbiAqIEBqYSBTdHJpbmcg44K744Os44Kv44K/44Gn44GC44KL44GL5Yik5a6aXG4gKlxuICogQHBhcmFtIHNlbGVjdG9yXG4gKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nU2VsZWN0b3I8VCBleHRlbmRzIFNlbGVjdG9yQmFzZT4oc2VsZWN0b3I6IERPTVNlbGVjdG9yPFQ+KTogc2VsZWN0b3IgaXMgRXh0cmFjdDxET01TZWxlY3RvcjxUPiwgc3RyaW5nPiB7XG4gICAgcmV0dXJuICdzdHJpbmcnID09PSB0eXBlb2Ygc2VsZWN0b3I7XG59XG5cbi8qKlxuICogQGVuIENoZWNrIHRoZSBzZWxlY3RvciB0eXBlIGlzIE5vZGUuXG4gKiBAamEgTm9kZSDjgrvjg6zjgq/jgr/jgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0gc2VsZWN0b3JcbiAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb2RlU2VsZWN0b3I8VCBleHRlbmRzIFNlbGVjdG9yQmFzZT4oc2VsZWN0b3I6IERPTVNlbGVjdG9yPFQ+KTogc2VsZWN0b3IgaXMgRXh0cmFjdDxET01TZWxlY3RvcjxUPiwgTm9kZT4ge1xuICAgIHJldHVybiBudWxsICE9IChzZWxlY3RvciBhcyBOb2RlKS5ub2RlVHlwZTtcbn1cblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHNlbGVjdG9yIHR5cGUgaXMgRWxlbWVudC5cbiAqIEBqYSBFbGVtZW50IOOCu+ODrOOCr+OCv+OBp+OBguOCi+OBi+WIpOWumlxuICpcbiAqIEBwYXJhbSBzZWxlY3RvclxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VsZW1lbnRTZWxlY3RvcjxUIGV4dGVuZHMgU2VsZWN0b3JCYXNlPihzZWxlY3RvcjogRE9NU2VsZWN0b3I8VD4pOiBzZWxlY3RvciBpcyBFeHRyYWN0PERPTVNlbGVjdG9yPFQ+LCBFbGVtZW50PiB7XG4gICAgcmV0dXJuIHNlbGVjdG9yIGluc3RhbmNlb2YgRWxlbWVudDtcbn1cblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHNlbGVjdG9yIHR5cGUgaXMgRG9jdW1lbnQuXG4gKiBAamEgRG9jdW1lbnQg44K744Os44Kv44K/44Gn44GC44KL44GL5Yik5a6aXG4gKlxuICogQHBhcmFtIHNlbGVjdG9yXG4gKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRG9jdW1lbnRTZWxlY3RvcjxUIGV4dGVuZHMgU2VsZWN0b3JCYXNlPihzZWxlY3RvcjogRE9NU2VsZWN0b3I8VD4pOiBzZWxlY3RvciBpcyBFeHRyYWN0PERPTVNlbGVjdG9yPFQ+LCBEb2N1bWVudD4ge1xuICAgIHJldHVybiBkb2N1bWVudCA9PT0gc2VsZWN0b3IgYXMgTm9kZSBhcyBEb2N1bWVudDtcbn1cblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHNlbGVjdG9yIHR5cGUgaXMgV2luZG93LlxuICogQGphIFdpbmRvdyDjgrvjg6zjgq/jgr/jgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0gc2VsZWN0b3JcbiAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNXaW5kb3dTZWxlY3RvcjxUIGV4dGVuZHMgU2VsZWN0b3JCYXNlPihzZWxlY3RvcjogRE9NU2VsZWN0b3I8VD4pOiBzZWxlY3RvciBpcyBFeHRyYWN0PERPTVNlbGVjdG9yPFQ+LCBXaW5kb3c+IHtcbiAgICByZXR1cm4gd2luZG93ID09PSBzZWxlY3RvciBhcyBXaW5kb3c7XG59XG5cbi8qKlxuICogQGVuIENoZWNrIHRoZSBzZWxlY3RvciBpcyBhYmxlIHRvIGl0ZXJhdGUuXG4gKiBAamEg6LWw5p+75Y+v6IO944Gq44K744Os44Kv44K/44Gn44GC44KL44GL5Yik5a6aXG4gKlxuICogQHBhcmFtIHNlbGVjdG9yXG4gKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlcmFibGVTZWxlY3RvcjxUIGV4dGVuZHMgU2VsZWN0b3JCYXNlPihzZWxlY3RvcjogRE9NU2VsZWN0b3I8VD4pOiBzZWxlY3RvciBpcyBFeHRyYWN0PERPTVNlbGVjdG9yPFQ+LCBOb2RlTGlzdE9mPE5vZGU+PiB7XG4gICAgcmV0dXJuIG51bGwgIT0gKHNlbGVjdG9yIGFzIFRbXSkubGVuZ3RoO1xufVxuXG4vKipcbiAqIEBlbiBDaGVjayB0aGUgc2VsZWN0b3IgdHlwZSBpcyBbW0RPTV1dLlxuICogQGphIFtbRE9NXV0g44K744Os44Kv44K/44Gn44GC44KL44GL5Yik5a6aXG4gKlxuICogQHBhcmFtIHNlbGVjdG9yXG4gKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRE9NU2VsZWN0b3I8VCBleHRlbmRzIFNlbGVjdG9yQmFzZT4oc2VsZWN0b3I6IERPTVNlbGVjdG9yPFQ+KTogc2VsZWN0b3IgaXMgRXh0cmFjdDxET01TZWxlY3RvcjxUPiwgRE9NPiB7XG4gICAgcmV0dXJuIHNlbGVjdG9yIGluc3RhbmNlb2YgRE9NQmFzZTtcbn1cbiIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICdAY2RwL2NvcmUtdXRpbHMnO1xuaW1wb3J0IHsgd2luZG93LCBkb2N1bWVudCB9IGZyb20gJy4vc3NyJztcbmltcG9ydCB7XG4gICAgRWxlbWVudEJhc2UsXG4gICAgU2VsZWN0b3JCYXNlLFxuICAgIERPTSxcbiAgICBET01TZWxlY3RvcixcbiAgICBET01JdGVyYXRlQ2FsbGJhY2ssXG4gICAgZG9tIGFzICQsXG59IGZyb20gJy4vc3RhdGljJztcbmltcG9ydCB7XG4gICAgSURPTSxcbiAgICBpc0VtcHR5U2VsZWN0b3IsXG4gICAgaXNTdHJpbmdTZWxlY3RvcixcbiAgICBpc0RvY3VtZW50U2VsZWN0b3IsXG4gICAgaXNXaW5kb3dTZWxlY3RvcixcbiAgICBpc05vZGVTZWxlY3RvcixcbiAgICBpc0l0ZXJhYmxlU2VsZWN0b3IsXG59IGZyb20gJy4vYmFzZSc7XG5cbi8qKlxuICogQGVuIE1peGluIGJhc2UgY2xhc3Mgd2hpY2ggY29uY2VudHJhdGVkIHRoZSBtZXRob2RzIG9mIERPTSBjbGFzcy5cbiAqIEBqYSBET00g44Gu44Oh44K944OD44OJ44KS6ZuG57SE44GX44GfIE1peGluIEJhc2Ug44Kv44Op44K5XG4gKi9cbmV4cG9ydCBjbGFzcyBET01NZXRob2RzPFRFbGVtZW50IGV4dGVuZHMgRWxlbWVudEJhc2UgPSBFbGVtZW50PiBpbXBsZW1lbnRzIElET008VEVsZW1lbnQ+IHtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGltcHJlbWVudHM6IElET008VD5cblxuICAgIHJlYWRvbmx5IFtuOiBudW1iZXJdOiBURWxlbWVudDtcbiAgICByZWFkb25seSBsZW5ndGghOiBudW1iZXI7XG4gICAgW1N5bWJvbC5pdGVyYXRvcl06ICgpID0+IEl0ZXJhdG9yPFRFbGVtZW50PjtcbiAgICBlbnRyaWVzITogKCkgPT4gSXRlcmFibGVJdGVyYXRvcjxbbnVtYmVyLCBURWxlbWVudF0+O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcHVibGljOlxuXG4gICAgLyoqXG4gICAgICogQGVuIENoZWNrIHRoZSBjdXJyZW50IG1hdGNoZWQgc2V0IG9mIGVsZW1lbnRzIGFnYWluc3QgYSBzZWxlY3RvciwgZWxlbWVudCwgb3IgW1tET01dXSBvYmplY3QuXG4gICAgICogQGphIOOCu+ODrOOCr+OCvywg6KaB57SgLCDjgb7jgZ/jga8gW1tET01dXSDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZcsIOePvuWcqOOBruimgee0oOOBruOCu+ODg+ODiOOBqOS4gOiHtOOBmeOCi+OBi+eiuuiqjVxuICAgICAqXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICogIC0gYGVuYCBPYmplY3Qocykgb3IgdGhlIHNlbGVjdG9yIHN0cmluZyB3aGljaCBiZWNvbWVzIG9yaWdpbiBvZiBbW0RPTUNsYXNzXV0sIHRlc3QgZnVuY3Rpb24uXG4gICAgICogIC0gYGphYCBbW0RPTUNsYXNzXV0g44Gu44KC44Go44Gr44Gq44KL44Kq44OW44K444Kn44Kv44OIKOe+pCnjgb7jgZ/jga/jgrvjg6zjgq/jgr/mloflrZfliJcsIOODhuOCueODiOmWouaVsFxuICAgICAqIEByZXR1cm5zXG4gICAgICogIC0gYGVuYCBgdHJ1ZWAgaWYgYXQgbGVhc3Qgb25lIG9mIHRoZXNlIGVsZW1lbnRzIG1hdGNoZXMgdGhlIGdpdmVuIGFyZ3VtZW50cy5cbiAgICAgKiAgLSBgamFgIOW8leaVsOOBq+aMh+WumuOBl+OBn+adoeS7tuOBjOimgee0oOOBruS4gOOBpOOBp+OCguS4gOiHtOOBmeOCjOOBsCBgdHJ1ZWAg44KS6L+U5Y20XG4gICAgICovXG4gICAgcHVibGljIGlzPFQgZXh0ZW5kcyBTZWxlY3RvckJhc2U+KHNlbGVjdG9yOiBET01TZWxlY3RvcjxUPiB8IERPTUl0ZXJhdGVDYWxsYmFjazxURWxlbWVudD4pOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoIDw9IDAgfHwgaXNFbXB0eVNlbGVjdG9yKHNlbGVjdG9yIGFzIERPTVNlbGVjdG9yPFQ+KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBbaW5kZXgsIGVsXSBvZiB0aGlzLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24oc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdG9yKGluZGV4LCBlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1N0cmluZ1NlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgIGlmICgoZWwgYXMgTm9kZSBhcyBFbGVtZW50KS5tYXRjaGVzICYmIChlbCBhcyBOb2RlIGFzIEVsZW1lbnQpLm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNXaW5kb3dTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93ID09PSBlbDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNEb2N1bWVudFNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudCA9PT0gZWwgYXMgTm9kZSBhcyBEb2N1bWVudDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNOb2RlU2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdG9yID09PSBlbCBhcyBOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNJdGVyYWJsZVNlbGVjdG9yKHNlbGVjdG9yIGFzIERPTVNlbGVjdG9yPFRFbGVtZW50PikpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGVsZW0gb2Ygc2VsZWN0b3IgYXMgSXRlcmFibGU8VEVsZW1lbnQ+KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtID09PSBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBtaXhpbnMgfSBmcm9tICdAY2RwL2NvcmUtdXRpbHMnO1xuaW1wb3J0IHtcbiAgICBFbGVtZW50QmFzZSxcbiAgICBTZWxlY3RvckJhc2UsXG4gICAgRWxlbWVudGlmeVNlZWQsXG4gICAgUXVlcnlDb250ZXh0LFxuICAgIGVsZW1lbnRpZnksXG59IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgRE9NQmFzZSB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgeyBET01NZXRob2RzIH0gZnJvbSAnLi9tZXRob2RzJztcblxuLyoqXG4gKiBAZW4gVGhpcyBpbnRlcmZhY2UgcHJvdmlkZXMgRE9NIG9wZXJhdGlvbnMgbGlrZSBgalF1ZXJ5YCBsaWJyYXJ5LlxuICogQGphIGBqUXVlcnlgIOOBruOCiOOBhuOBqkRPTSDmk43kvZzjgpLmj5DkvpvjgZnjgovjgqTjg7Pjgr/jg7zjg5XjgqfjgqTjgrlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBET008VCBleHRlbmRzIEVsZW1lbnRCYXNlID0gRWxlbWVudD4gZXh0ZW5kcyBET01DbGFzczxUPiB7IH0gLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZW1wdHktaW50ZXJmYWNlXG5cbmV4cG9ydCB0eXBlIERPTVNlbGVjdG9yPFQgZXh0ZW5kcyBTZWxlY3RvckJhc2UgPSBFbGVtZW50PiA9IEVsZW1lbnRpZnlTZWVkPFQ+IHwgRE9NPFQgZXh0ZW5kcyBFbGVtZW50QmFzZSA/IFQgOiBuZXZlcj47XG5leHBvcnQgdHlwZSBET01SZXN1bHQ8VCBleHRlbmRzIFNlbGVjdG9yQmFzZT4gPSBUIGV4dGVuZHMgRE9NPEVsZW1lbnRCYXNlPiA/IFQgOiAoVCBleHRlbmRzIEVsZW1lbnRCYXNlID8gRE9NPFQ+IDogRE9NPEVsZW1lbnQ+KTtcbmV4cG9ydCB0eXBlIERPTUl0ZXJhdGVDYWxsYmFjazxUIGV4dGVuZHMgRWxlbWVudEJhc2U+ID0gKGluZGV4OiBudW1iZXIsIGVsZW1lbnQ6IFQpID0+IGJvb2xlYW4gfCB2b2lkO1xuXG4vKipcbiAqIEBlbiBUaGlzIGNsYXNzIHByb3ZpZGVzIERPTSBvcGVyYXRpb25zIGxpa2UgYGpRdWVyeWAgbGlicmFyeS5cbiAqIEBqYSBgalF1ZXJ5YCDjga7jgojjgYbjgapET00g5pON5L2c44KS5o+Q5L6bXG4gKi9cbmV4cG9ydCBjbGFzcyBET01DbGFzczxURWxlbWVudCBleHRlbmRzIEVsZW1lbnRCYXNlID0gRWxlbWVudD4gZXh0ZW5kcyBtaXhpbnMoRE9NQmFzZSwgRE9NTWV0aG9kcykge1xuICAgIC8qKlxuICAgICAqIHByaXZhdGUgY29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50c1xuICAgICAqICAtIGBlbmAgb3BlcmF0aW9uIHRhcmdldHMgYEVsZW1lbnRgIGFycmF5LlxuICAgICAqICAtIGBqYWAg5pON5L2c5a++6LGh44GuIGBFbGVtZW50YCDphY3liJdcbiAgICAgKi9cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKGVsZW1lbnRzOiBURWxlbWVudFtdKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnRzKTtcbiAgICAgICAgdGhpcy5zdXBlcihET01NZXRob2RzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ3JlYXRlIFtbRE9NXV0gaW5zdGFuY2UgZnJvbSBgc2VsZWN0b3JgIGFyZy5cbiAgICAgKiBAamEg5oyH5a6a44GV44KM44GfIGBzZWxlY3RvcmAgW1tET01dXSDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLkvZzmiJBcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICogIC0gYGVuYCBPYmplY3Qocykgb3IgdGhlIHNlbGVjdG9yIHN0cmluZyB3aGljaCBiZWNvbWVzIG9yaWdpbiBvZiBbW0RPTUNsYXNzXV0uXG4gICAgICogIC0gYGphYCBbW0RPTUNsYXNzXV0g44Gu44KC44Go44Gr44Gq44KL44Kq44OW44K444Kn44Kv44OIKOe+pCnjgb7jgZ/jga/jgrvjg6zjgq/jgr/mloflrZfliJdcbiAgICAgKiBAcGFyYW0gY29udGV4dFxuICAgICAqICAtIGBlbmAgU2V0IHVzaW5nIGBEb2N1bWVudGAgY29udGV4dC4gV2hlbiBiZWluZyB1bi1kZXNpZ25hdGluZywgYSBmaXhlZCB2YWx1ZSBvZiB0aGUgZW52aXJvbm1lbnQgaXMgdXNlZC5cbiAgICAgKiAgLSBgamFgIOS9v+eUqOOBmeOCiyBgRG9jdW1lbnRgIOOCs+ODs+ODhuOCreOCueODiOOCkuaMh+Wumi4g5pyq5oyH5a6a44Gu5aC05ZCI44Gv55Kw5aKD44Gu5pei5a6a5YCk44GM5L2/55So44GV44KM44KLLlxuICAgICAqIEByZXR1cm5zIFtbRE9NQ2xhc3NdXSBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZTxUIGV4dGVuZHMgU2VsZWN0b3JCYXNlPihzZWxlY3Rvcj86IERPTVNlbGVjdG9yPFQ+LCBjb250ZXh0PzogUXVlcnlDb250ZXh0KTogRE9NUmVzdWx0PFQ+IHtcbiAgICAgICAgaWYgKHNlbGVjdG9yICYmICFjb250ZXh0KSB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBET01DbGFzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3RvciBhcyBhbnk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRE9NQ2xhc3MoKGVsZW1lbnRpZnkoc2VsZWN0b3IgYXMgRWxlbWVudGlmeVNlZWQ8VD4sIGNvbnRleHQpIGFzIEVsZW1lbnRbXSkpIGFzIERPTVJlc3VsdDxUPjtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBzZXR1cCB9IGZyb20gJy4vc3RhdGljJztcbmltcG9ydCB7IERPTUNsYXNzIH0gZnJvbSAnLi9jbGFzcyc7XG5cbi8vIGluaXQgZm9yIHN0YXRpY1xuc2V0dXAoRE9NQ2xhc3MucHJvdG90eXBlLCBET01DbGFzcy5jcmVhdGUpO1xuXG5leHBvcnQgKiBmcm9tICcuL2V4cG9ydHMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBkZWZhdWx0IH0gZnJvbSAnLi9leHBvcnRzJztcbiJdLCJuYW1lcyI6WyJzYWZlIiwiZG9jdW1lbnQiLCJpc0Z1bmN0aW9uIiwiY2xhc3NOYW1lIiwid2luZG93IiwibWl4aW5zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUVBOzs7O0lBSUEsTUFBTSxHQUFHLEdBQUdBLGNBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsTUFBTSxHQUFHLEdBQUdBLGNBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7O0lDTXRDOzs7Ozs7Ozs7Ozs7QUFZQSxhQUFnQixVQUFVLENBQXlCLElBQXdCLEVBQUUsVUFBd0JDLEdBQVE7UUFDekcsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFFRCxNQUFNLFFBQVEsR0FBYyxFQUFFLENB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
