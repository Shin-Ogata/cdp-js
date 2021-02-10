/*!
 * @cdp/extension-template 0.9.5
 *   Generated by 'cdp-task bundle dts' task.
 *   - built with TypeScript 4.1.4
 *   - includes:
 *     - lit-html
 */
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * The Part interface represents a dynamic part of a template instance rendered
 * by lit-html.
 */
export interface Part {
    readonly value: unknown;
    /**
     * Sets the current part value, but does not write it to the DOM.
     * @param value The value that will be committed.
     */
    setValue(value: unknown): void;
    /**
     * Commits the current part value, causing it to actually be written to the
     * DOM.
     *
     * Directives are run at the start of `commit`, so that if they call
     * `part.setValue(...)` synchronously that value will be used in the current
     * commit, and there's no need to call `part.commit()` within the directive.
     * If directives set a part value asynchronously, then they must call
     * `part.commit()` manually.
     */
    commit(): void;
}
declare class Template {
    readonly parts: TemplatePart[];
    readonly element: HTMLTemplateElement;
    constructor(result: TemplateResult, element: HTMLTemplateElement);
}
/**
 * A placeholder for a dynamic expression in an HTML template.
 *
 * There are two built-in part types: AttributePart and NodePart. NodeParts
 * always represent a single dynamic expression, while AttributeParts may
 * represent as many expressions are contained in the attribute.
 *
 * A Template's parts are mutable, so parts can be replaced or modified
 * (possibly to implement different template semantics). The contract is that
 * parts can only be replaced, not removed, added or reordered, and parts must
 * always consume the correct number of values in their `update()` method.
 *
 * TODO(justinfagnani): That requirement is a little fragile. A
 * TemplateInstance could instead be more careful about which values it gives
 * to Part.update().
 */
export declare type TemplatePart = {
    readonly type: 'node';
    index: number;
} | {
    readonly type: 'attribute';
    index: number;
    readonly name: string;
    readonly strings: ReadonlyArray<string>;
};
/**
 * A function type that creates a Template from a TemplateResult.
 *
 * This is a hook into the template-creation process for rendering that
 * requires some modification of templates before they're used, like ShadyCSS,
 * which must add classes to elements and remove styles.
 *
 * Templates should be cached as aggressively as possible, so that many
 * TemplateResults produced from the same expression only do the work of
 * creating the Template the first time.
 *
 * Templates are usually cached by TemplateResult.strings and
 * TemplateResult.type, but may be cached by other keys if this function
 * modifies the template.
 *
 * Note that currently TemplateFactories must not add, remove, or reorder
 * expressions, because there is no way to describe such a modification
 * to render() so that values are interpolated to the correct place in the
 * template instances.
 */
export declare type TemplateFactory = (result: TemplateResult) => Template;
export interface RenderOptions {
    readonly templateFactory: TemplateFactory;
    readonly eventContext?: EventTarget;
}
declare class NodePart implements Part {
    readonly options: RenderOptions;
    startNode: Node;
    endNode: Node;
    value: unknown;
    private __pendingValue;
    constructor(options: RenderOptions);
    /**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendInto(container: Node): void;
    /**
     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
     * such as those that appear in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterNode(ref: Node): void;
    /**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendIntoPart(part: NodePart): void;
    /**
     * Inserts this part after the `ref` part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterPart(ref: NodePart): void;
    setValue(value: unknown): void;
    commit(): void;
    private __insert;
    private __commitNode;
    private __commitText;
    private __commitTemplateResult;
    private __commitIterable;
    clear(startNode?: Node): void;
}
export interface TemplateProcessor {
    /**
     * Create parts for an attribute-position binding, given the element,
     * attribute name, and string literals.
     *
     * @param element The element containing the binding
     * @param name  The attribute name, including a possible prefix. The name may
     *   be prefixed by `.` (for a property binding), `@` (for an event binding)
     * or
     *   `?` (for a boolean attribute binding).
     * @param strings The array of literal strings that form the static part of
     *     the
     *   attribute value. There are always at least two strings,
     *   even for fully-controlled bindings with a single expression. For example,
     *   for the binding `attr='${e1}-${e2}'`, the `strings` array includes three
     *   strings (`['', '-', '']`)—the text _before_ the first expression (the
     * empty string), the text between the two expressions (`'-'`), and the text
     * after the last expression (another empty string).
     */
    handleAttributeExpressions(element: Element, name: string, strings: ReadonlyArray<string>, options: RenderOptions): ReadonlyArray<Part>;
    /**
     * Create parts for a text-position binding.
     * @param partOptions
     */
    handleTextExpression(options: RenderOptions): NodePart;
}
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
export declare class TemplateResult {
    readonly strings: TemplateStringsArray;
    readonly values: readonly unknown[];
    readonly type: string;
    readonly processor: TemplateProcessor;
    constructor(strings: TemplateStringsArray, values: readonly unknown[], type: string, processor: TemplateProcessor);
    /**
     * Returns a string of HTML used to create a `<template>` element.
     */
    getHTML(): string;
    getTemplateElement(): HTMLTemplateElement;
}
/**
 * A TemplateResult for SVG fragments.
 *
 * This class wraps HTML in an `<svg>` tag in order to parse its contents in the
 * SVG namespace, then modifies the template to remove the `<svg>` tag so that
 * clones only container the original fragment.
 */
export declare class SVGTemplateResult extends TemplateResult {
    getHTML(): string;
    getTemplateElement(): HTMLTemplateElement;
}
export declare type DirectiveFactory = (...args: any[]) => object;
export declare type DirectiveFn = (part: Part) => void;
/**
 * Brands a function as a directive factory function so that lit-html will call
 * the function during template rendering, rather than passing as a value.
 *
 * A _directive_ is a function that takes a Part as an argument. It has the
 * signature: `(part: Part) => void`.
 *
 * A directive _factory_ is a function that takes arguments for data and
 * configuration and returns a directive. Users of directive usually refer to
 * the directive factory as the directive. For example, 'The repeat directive'.
 *
 * Usually a template author will invoke a directive factory in their template
 * with relevant arguments, which will then return a directive function.
 *
 * Here's an example of using the `repeat()` directive factory that takes an
 * array and a function to render an item:
 *
 * ```js
 * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
 * ```
 *
 * When `repeat` is invoked, it returns a directive function that closes over
 * `items` and the template function. When the outer template is rendered, the
 * return directive function is called with the Part for the expression.
 * `repeat` then performs it's custom logic to render multiple items.
 *
 * @param f The directive factory function. Must be a function that returns a
 * function of the signature `(part: Part) => void`. The returned function will
 * be called with the part object.
 *
 * @example
 *
 * import {directive, html} from 'lit-html';
 *
 * const immutable = directive((v) => (part) => {
 *   if (part.value !== v) {
 *     part.setValue(v)
 *   }
 * });
 */
export declare const directive: <F extends DirectiveFactory>(f: F) => F;
export declare const parts: WeakMap<Node, NodePart>;
/**
 * Renders a template result or other value to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result Any value renderable by NodePart - typically a TemplateResult
 *     created by evaluating a template tag like `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */
export declare const render: (result: unknown, container: Element | DocumentFragment, options?: Partial<RenderOptions> | undefined) => void;
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
export declare const html: (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult;
/**
 * Interprets a template literal as an SVG template that can efficiently
 * render to and update a container.
 */
export declare const svg: (strings: TemplateStringsArray, ...values: unknown[]) => SVGTemplateResult;
export interface ClassInfo {
    readonly [name: string]: string | boolean | number;
}
export declare type KeyFn<T> = (item: T, index: number) => unknown;
export declare type ItemTemplate<T> = (item: T, index: number) => unknown;
export interface StyleInfo {
    readonly [name: string]: string;
}
export interface TemplateDirectives {
    asyncAppend: (value: AsyncIterable<unknown>, mapper?: ((v: unknown, index?: number | undefined) => unknown) | undefined) => (part: Part) => Promise<void>;
    asyncReplace: (value: AsyncIterable<unknown>, mapper?: ((v: unknown, index?: number | undefined) => unknown) | undefined) => (part: Part) => Promise<void>;
    cache: (value: unknown) => (part: Part) => void;
    classMap: (classInfo: ClassInfo) => (part: Part) => void;
    guard: (value: unknown, f: () => unknown) => (part: Part) => void;
    ifDefined: (value: unknown) => (part: Part) => void;
    repeat: <T>(items: Iterable<T>, keyFnOrTemplate: KeyFn<T> | ItemTemplate<T>, template?: ItemTemplate<T> | undefined) => DirectiveFn;
    styleMap: (styleInfo: StyleInfo) => (part: Part) => void;
    unsafeHTML: (value: unknown) => (part: Part) => void;
    until: (...args: unknown[]) => (part: Part) => void;
}
export declare const directives: TemplateDirectives;
/**
 * @en Convert from `string` to `TemplateStringsArray`. <br>
 *     This method is helper brigdge for the [[html]] or the [[svg]] are able to received plain string.
 * @ja `string` を `TemplateStringsArray`に変換. <br>
 *     [[html]] や [[svg]] が文字列を受け付けるためのブリッジメソッド
 *
 * @example <br>
 *
 * ```ts
 * import { toTemplateStringsArray as bridge } from '@cdp/extension-template';
 *
 * const raw = '<p>Hello Raw String</p>';
 * render(html(bridge(raw)), document.body);
 * ```
 *
 * @param src
 *  - `en` plain string. ex) [[JST]] returned value.
 *  - `ja` プレーン文字列. ex) [[JST]] の戻り値などを想定
 */
export declare const toTemplateStringsArray: (src: string) => TemplateStringsArray;
