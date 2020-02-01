import { ElementBase, SelectorBase, ElementifySeed } from './utils';
import { DOMBase } from './base';
import { DOMAttributes } from './attributes';
import { DOMTraversing } from './traversing';
import { DOMManipulation } from './manipulation';
import { DOMStyles } from './styles';
import { DOMEvents } from './events';
import { DOMScroll } from './scroll';
import { DOMEffects } from './effects';
declare type DOMFeatures<T extends ElementBase> = DOMBase<T> & DOMAttributes<T> & DOMTraversing<T> & DOMManipulation<T> & DOMStyles<T> & DOMEvents<T> & DOMScroll<T> & DOMEffects<T>;
/**
 * @en [[DOM]] plugin method definition.
 * @ja [[DOM]] プラグインメソッド定義
 *
 * @note
 *  - プラグイン拡張定義はこのインターフェイスマージする.
 *  - TypeScript 3.7 時点で, module interface のマージは module の完全なパスを必要とするため,
 *    本レポジトリでは bundle した `dist/dom.d.ts` を提供する.
 *
 * @see
 *  - https://github.com/microsoft/TypeScript/issues/33326
 *  - https://stackoverflow.com/questions/57848134/trouble-updating-an-interface-using-declaration-merging
 */
export interface DOMPlugin {
}
/**
 * @en This interface provides DOM operations like `jQuery` library.
 * @ja `jQuery` のようなDOM 操作を提供するインターフェイス
 */
export interface DOM<T extends ElementBase = HTMLElement> extends DOMFeatures<T>, DOMPlugin {
}
export declare type DOMSelector<T extends SelectorBase = HTMLElement> = ElementifySeed<T> | DOM<T extends ElementBase ? T : never>;
export declare type DOMResult<T extends SelectorBase> = T extends DOM<ElementBase> ? T : (T extends ElementBase ? DOM<T> : DOM<HTMLElement>);
export declare type DOMIterateCallback<T extends ElementBase> = (index: number, element: T) => boolean | void;
declare const DOMClass_base: import("@cdp/core-utils").MixinConstructor<typeof DOMBase, import("@cdp/core-utils").MixinClass & DOMBase<ElementBase> & DOMAttributes<any> & DOMTraversing<any> & DOMManipulation<any> & DOMStyles<any> & DOMEvents<any> & DOMScroll<any> & DOMEffects<any>>;
/**
 * @en This class provides DOM operations like `jQuery` library.
 * @ja `jQuery` のようなDOM 操作を提供
 *
 * UNSUPPORTED METHOD LIST
 *
 * [Traversing]
 *  .addBack()
 *  .end()
 *
 * [Effects]
 * .show()
 * .hide()
 * .toggle()
 * .stop()
 * .clearQueue()
 * .delay()
 * .dequeue()
 * .fadeIn()
 * .fadeOut()
 * .fadeTo()
 * .fadeToggle()
 * .queue()
 * .slideDown()
 * .slideToggle()
 * .slideUp()
 */
export declare class DOMClass extends DOMClass_base {
    /**
     * private constructor
     *
     * @param elements
     *  - `en` operation targets `Element` array.
     *  - `ja` 操作対象の `Element` 配列
     */
    private constructor();
}
export {};
