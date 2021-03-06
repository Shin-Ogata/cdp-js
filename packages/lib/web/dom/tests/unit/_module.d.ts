/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./_export.d.ts" />

declare module '@cdp/dom' {
    /*
     * default export と named export の双方をサポートするにはマニュアル記述する必要がある.
     *
     * なお, TypeScript Deep Drive では ライブラリの `default export` 自体推奨されていない.
     * https://basarat.gitbooks.io/typescript/content/docs/tips/defaultIsBad.html
     * https://typescript-jp.gitbook.io/deep-dive/main-1/defaultisbad
     *
     * default export と同一の named export が存在すると, rollup.js は既定で警告を出す.
     * https://rollupjs.org/guide/en/
     *  - `output.exports` の項目参照
     */
    export const dom: typeof _Exports.dom;
    export const isDOMClass: typeof _Exports.isDOMClass;
    export type ElementBase                                                                  = _Exports.ElementBase;
    export type SelectorBase                                                                 = _Exports.SelectorBase;
    export type QueryContext                                                                 = _Exports.QueryContext;
    export type EvalOptions                                                                  = _Exports.EvalOptions;
    export type DOM<T extends ElementBase = HTMLElement>                                     = _Exports.DOM<T>;
    export type DOMPlugin                                                                    = _Exports.DOMPlugin;
    export type DOMSelector<T extends SelectorBase>                                          = _Exports.DOMSelector<T>;
    export type DOMIterateCallback<T extends ElementBase>                                    = _Exports.DOMIterateCallback<T>;
    export type DOMEventMap<T>                                                               = _Exports.DOMEventMap<T>;
    export type DOMScrollOptions                                                             = _Exports.DOMScrollOptions;
    export type DOMEffectParameters                                                          = _Exports.DOMEffectParameters;
    export type DOMEffectOptions                                                             = _Exports.DOMEffectOptions;
    export type DOMEffectContext<T extends ElementBase>                                      = _Exports.DOMEffectContext<T>;
    export type DOMModificationCallback<T extends ElementBase, U extends ElementBase>        = _Exports.DOMModificationCallback<T, U>;
    export type DOMEventListener<T = HTMLElement, M extends DOMEventMap<T> = DOMEventMap<T>> = _Exports.DOMEventListener<T, M>;
    export type EventWithNamespace<T extends DOMEventMap<unknown>>                           = _Exports.EventWithNamespace<T>;
    export type MakeEventType<T, M>                                                          = _Exports.MakeEventType<T, M>;
    export type EventType<T extends DOMEventMap<unknown>>                                    = _Exports.EventType<T>;
    export type EventTypeOrNamespace<T extends DOMEventMap<unknown>>                         = _Exports.EventTypeOrNamespace<T>;
    export { dom as default };
}
