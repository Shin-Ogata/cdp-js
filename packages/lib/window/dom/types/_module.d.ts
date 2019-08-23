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
    export type ElementBase         = _Exports.ElementBase;
    export type ElementResult<T>    = _Exports.ElementResult<T>;
    export type ElementifyArgBase   = _Exports.ElementifyArgBase;
    export type ElementifyArg       = _Exports.ElementifyArg;
    export type QueryContext        = _Exports.QueryContext;
    export { dom as default };
}
