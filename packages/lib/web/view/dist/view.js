/*!
 * @cdp/view 0.9.8
 *   generic view scheme
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@cdp/core-utils'), require('@cdp/events'), require('@cdp/dom')) :
    typeof define === 'function' && define.amd ? define(['exports', '@cdp/core-utils', '@cdp/events', '@cdp/dom'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CDP = global.CDP || {}, global.CDP, global.CDP, global.CDP));
}(this, (function (exports, coreUtils, events, dom) { 'use strict';

    /** @internal */ const document = coreUtils.safe(globalThis.document);

    /* eslint-disable
        @typescript-eslint/no-explicit-any,
     */
    /** @internal */ const _properties = Symbol('properties');
    /** @internal */ const _ensureElement = Symbol('ensure-element');
    /**
     * @en Base class definition for view that manages the layout and a DOM events.
     * @ja レイアウト管理と DOM イベントの監視を行う View の基底クラス定義
     *
     * @example <br>
     *
     * ```ts
     * import { TemplateEngine } from '@cdp/core-template';
     * import { DOM, dom as $ } from '@cdp/dom';
     * import { View, ViewEventsHash } from '@cdp/view';
     * import { ToDo, ToDoEventSource } from './todo';
     *
     * const _template = TemplateEngine.compile($('#item-template').html());
     *
     * export class ToDoView extends View {
     *     private _model: ToDo;
     *     private _$input?: DOM<HTMLInputElement>;
     *
     *     constructor(todo: ToDo) {
     *         super({ tagName: 'li' });
     *         this._model = todo;
     *         this.listenTo(this._model as ToDoEventSource, '@change', this.render.bind(this));
     *         this.listenTo(this._model as ToDoEventSource, '@destroy', this.remove.bind(this));
     *     }
     *
     *     protected events(): ViewEventsHash<HTMLElement> {
     *         return {
     *             'click .toggle':   this.toggleDone,
     *             'dblclick .view':  this.edit,
     *             'click a.destroy': this.clear,
     *             'keypress .edit':  this.updateOnEnter,
     *             'blur .edit':      this.close,
     *         };
     *     }
     *
     *     render(): this {
     *         this.$el.html(_template(this._model.toJSON()));
     *         this.$el.toggleClass('done', this._model.done);
     *         this._$input = this.$('.edit') as DOM<HTMLInputElement>;
     *         return this;
     *     }
     *     :
     * }
     * ```
     */
    class View extends events.EventSource {
        ///////////////////////////////////////////////////////////////////////
        // construction/destruction:
        /**
         * constructor
         *
         * @param options
         *  - `en` construction options.
         *  - `ja` 構築オプション
         */
        constructor(options) {
            super();
            const { el, tagName, id, attributes, className, events } = options || {};
            this[_properties] = {
                cid: coreUtils.luid('view:', 8),
                events,
                id,
                className,
                attributes,
                tagName: tagName || 'div',
            };
            this[_ensureElement](el);
        }
        /**
         * @en Release all listeners.
         * @ja すべてのリスナーを解除
         */
        release() {
            this.undelegateEvents();
            this.stopListening();
            this.off();
            return this;
        }
        /**
         * @en Remove this view by taking the element out of the DOM with release all listeners.
         * @ja View から DOM を切り離し, リスナーを解除
         */
        remove() {
            this.release();
            this.$el.remove();
            return this;
        }
        ///////////////////////////////////////////////////////////////////////
        // accessor: attributes
        /**
         * @en Get content ID.
         * @ja コンテンツ ID を取得
         */
        get id() {
            const { cid, id } = this[_properties];
            return id || cid;
        }
        /**
         * @en Get element.
         * @ja 要素を取得
         */
        get el() {
            return this[_properties].$el[0];
        }
        /**
         * @en Get [[DOM]] object.
         * @ja [[DOM]] オブジェクトを取得
         */
        get $el() {
            return this[_properties].$el;
        }
        /**
         * @en Get internal content ID.
         * @ja 内部のコンテンツ ID を取得
         */
        get _cid() {
            return this[_properties].cid;
        }
        /**
         * @en Get default tag name.
         * @ja 既定のタグ名を取得
         */
        get _tagName() {
            return this[_properties].tagName;
        }
        /**
         * @en Attributes instance
         * @ja 属性を格納するインスタンス
         */
        get _attrs() {
            const { attributes, id, className } = this[_properties];
            return Object.assign(coreUtils.drop({ id, class: className }), attributes);
        }
        ///////////////////////////////////////////////////////////////////////
        // operation:
        /**
         * @en Change the view's element (`this.el` property) and re-delegate the view's events on the new element.
         * @ja View が管轄する要素 (`this.el` property) の変更. イベント再設定も実行
         *
         * @param el
         *  - `en` Object or the selector string which becomes origin of element.
         *  - `ja` 要素のもとになるオブジェクトまたはセレクタ文字列
         */
        setElement(el) {
            this.undelegateEvents();
            this[_properties].$el = dom.dom(el);
            this.delegateEvents();
            return this;
        }
        /**
         * @en Set DOM callbacks from [[ViewEventsHash]] object.
         * @ja [[ViewEventsHash]] オブジェクトから DOM コールバックを設定
         *
         * @param events
         *  - `en` [[ViewEventsHash]] object. `this.events()` is used by default.
         *  - `ja` [[ViewEventsHash]] オブジェクト. 既定値は `this.events()`
         */
        delegateEvents(events) {
            const hash = events || this.events();
            if (coreUtils.isEmptyObject(hash)) {
                return this;
            }
            this.undelegateEvents();
            for (const key of Object.keys(hash)) {
                let method = hash[key];
                if (!coreUtils.isFunction(method)) {
                    method = this[method];
                }
                if (!method) {
                    continue;
                }
                const match = /^(\S+)\s*(.*)$/.exec(key);
                this.delegate(match[1], match[2], method.bind(this));
            }
            return this;
        }
        /**
         * @en Clears all callbacks previously bound to the view by `delegate`.
         * @ja `delegate` されたイベントをすべて削除
         */
        undelegateEvents() {
            this.$el && this.$el.off(`.${this._cid}`);
            return this;
        }
        delegate(type, ...args) {
            this.$el.on(`${type}.${this._cid}`, ...args);
            return this;
        }
        undelegate(type, ...args) {
            this.$el.off(`${type}.${this._cid}`, ...args);
            return this;
        }
        /**
         * @en Get the descendants of each element in the current set of matched elements, filtered by a selector.
         * @ja 配下の要素に対して指定したセレクタに一致する要素を検索
         *
         * @param selector
         *  - `en` Object(s) or the selector string which becomes origin of DOM.
         *  - `ja` DOM のもとになるインスタンス(群)またはセレクタ文字列
         */
        $(selector) {
            return this.$el.find(selector);
        }
        ///////////////////////////////////////////////////////////////////////
        // override:
        /**
         * @en The events hash (or method) can be used to specify a set of DOM events that will be bound to methods on your View through delegateEvents.
         * @ja イベントセレクタとコールバックのハッシュを定義し, ルートエンティティで捕捉する DOM イベントを指定
         *
         *
         * @example <br>
         *
         * ```ts
         * class SampleView extends View {
         *     protected events(): ViewEventsHash {
         *         return {
         *             'mousedown .title':  'edit',
         *             'click .button':     'save',
         *             'click .open':       function(e) { ... },
         *             'click .close':      this.onClose,
         *         };
         *     }
         * }
         * ```
         *
         * @override
         */
        events() {
            return Object.assign({}, this[_properties].events);
        }
        ///////////////////////////////////////////////////////////////////////
        // internal:
        /** @internal */
        [_ensureElement](el) {
            if (!el) {
                const { _attrs, _tagName } = this;
                this.setElement(document.createElement(_tagName));
                this.$el.attr(_attrs);
            }
            else {
                this.setElement(el);
            }
        }
    }

    exports.View = View;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZXMiOlsic3NyLnRzIiwiYmFzZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzYWZlIH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcbi8qKiBAaW50ZXJuYWwgKi8gZXhwb3J0IGNvbnN0IGRvY3VtZW50ID0gc2FmZShnbG9iYWxUaGlzLmRvY3VtZW50KTtcbiIsIi8qIGVzbGludC1kaXNhYmxlXG4gICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSxcbiAqL1xuXG5pbXBvcnQge1xuICAgIE5pbCxcbiAgICBQbGFpbk9iamVjdCxcbiAgICBVbmtub3duRnVuY3Rpb24sXG4gICAgaXNGdW5jdGlvbixcbiAgICBpc0VtcHR5T2JqZWN0LFxuICAgIGx1aWQsXG4gICAgZHJvcCxcbn0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcbmltcG9ydCB7IEV2ZW50U291cmNlIH0gZnJvbSAnQGNkcC9ldmVudHMnO1xuaW1wb3J0IHtcbiAgICBET00sXG4gICAgRE9NU2VsZWN0b3IsXG4gICAgRE9NUmVzdWx0LFxuICAgIERPTUV2ZW50TGlzdGVuZXIsXG4gICAgRE9NRXZlbnRNYXAsXG4gICAgRXZlbnRUeXBlLFxuICAgIEV2ZW50VHlwZU9yTmFtZXNwYWNlLFxuICAgIGRvbSBhcyAkLFxufSBmcm9tICdAY2RwL2RvbSc7XG5pbXBvcnQgeyBWaWV3RXZlbnRzSGFzaCwgVmlld0NvbnN0cnVjdGlvbk9wdGlvbnMgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZG9jdW1lbnQgfSBmcm9tICcuL3Nzcic7XG5cbi8qKiBAaW50ZXJuYWwgKi8gY29uc3QgX3Byb3BlcnRpZXMgICAgPSBTeW1ib2woJ3Byb3BlcnRpZXMnKTtcbi8qKiBAaW50ZXJuYWwgKi8gY29uc3QgX2Vuc3VyZUVsZW1lbnQgPSBTeW1ib2woJ2Vuc3VyZS1lbGVtZW50Jyk7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmludGVyZmFjZSBQcm9wZXJ0eTxUIGV4dGVuZHMgTm9kZT4ge1xuICAgIHJlYWRvbmx5IGNpZDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGV2ZW50cz86IFZpZXdFdmVudHNIYXNoPFQ+O1xuICAgIHJlYWRvbmx5IGlkPzogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGNsYXNzTmFtZT86IHN0cmluZztcbiAgICByZWFkb25seSBhdHRyaWJ1dGVzPzogUGxhaW5PYmplY3Q8c3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGw+O1xuICAgIHJlYWRvbmx5IHRhZ05hbWU6IHN0cmluZztcbiAgICAkZWw6IERPTTxUPjtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbmV4cG9ydCB0eXBlIFZpZXdGaW5kU2VsZWN0b3IgPSBOb2RlIHwgc3RyaW5nIHwgTmlsO1xuXG4vKipcbiAqIEBlbiBCYXNlIGNsYXNzIGRlZmluaXRpb24gZm9yIHZpZXcgdGhhdCBtYW5hZ2VzIHRoZSBsYXlvdXQgYW5kIGEgRE9NIGV2ZW50cy5cbiAqIEBqYSDjg6zjgqTjgqLjgqbjg4jnrqHnkIbjgaggRE9NIOOCpOODmeODs+ODiOOBruebo+imluOCkuihjOOBhiBWaWV3IOOBruWfuuW6leOCr+ODqeOCueWumue+qVxuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgVGVtcGxhdGVFbmdpbmUgfSBmcm9tICdAY2RwL2NvcmUtdGVtcGxhdGUnO1xuICogaW1wb3J0IHsgRE9NLCBkb20gYXMgJCB9IGZyb20gJ0BjZHAvZG9tJztcbiAqIGltcG9ydCB7IFZpZXcsIFZpZXdFdmVudHNIYXNoIH0gZnJvbSAnQGNkcC92aWV3JztcbiAqIGltcG9ydCB7IFRvRG8sIFRvRG9FdmVudFNvdXJjZSB9IGZyb20gJy4vdG9kbyc7XG4gKlxuICogY29uc3QgX3RlbXBsYXRlID0gVGVtcGxhdGVFbmdpbmUuY29tcGlsZSgkKCcjaXRlbS10ZW1wbGF0ZScpLmh0bWwoKSk7XG4gKlxuICogZXhwb3J0IGNsYXNzIFRvRG9WaWV3IGV4dGVuZHMgVmlldyB7XG4gKiAgICAgcHJpdmF0ZSBfbW9kZWw6IFRvRG87XG4gKiAgICAgcHJpdmF0ZSBfJGlucHV0PzogRE9NPEhUTUxJbnB1dEVsZW1lbnQ+O1xuICpcbiAqICAgICBjb25zdHJ1Y3Rvcih0b2RvOiBUb0RvKSB7XG4gKiAgICAgICAgIHN1cGVyKHsgdGFnTmFtZTogJ2xpJyB9KTtcbiAqICAgICAgICAgdGhpcy5fbW9kZWwgPSB0b2RvO1xuICogICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuX21vZGVsIGFzIFRvRG9FdmVudFNvdXJjZSwgJ0BjaGFuZ2UnLCB0aGlzLnJlbmRlci5iaW5kKHRoaXMpKTtcbiAqICAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLl9tb2RlbCBhcyBUb0RvRXZlbnRTb3VyY2UsICdAZGVzdHJveScsIHRoaXMucmVtb3ZlLmJpbmQodGhpcykpO1xuICogICAgIH1cbiAqXG4gKiAgICAgcHJvdGVjdGVkIGV2ZW50cygpOiBWaWV3RXZlbnRzSGFzaDxIVE1MRWxlbWVudD4ge1xuICogICAgICAgICByZXR1cm4ge1xuICogICAgICAgICAgICAgJ2NsaWNrIC50b2dnbGUnOiAgIHRoaXMudG9nZ2xlRG9uZSxcbiAqICAgICAgICAgICAgICdkYmxjbGljayAudmlldyc6ICB0aGlzLmVkaXQsXG4gKiAgICAgICAgICAgICAnY2xpY2sgYS5kZXN0cm95JzogdGhpcy5jbGVhcixcbiAqICAgICAgICAgICAgICdrZXlwcmVzcyAuZWRpdCc6ICB0aGlzLnVwZGF0ZU9uRW50ZXIsXG4gKiAgICAgICAgICAgICAnYmx1ciAuZWRpdCc6ICAgICAgdGhpcy5jbG9zZSxcbiAqICAgICAgICAgfTtcbiAqICAgICB9XG4gKlxuICogICAgIHJlbmRlcigpOiB0aGlzIHtcbiAqICAgICAgICAgdGhpcy4kZWwuaHRtbChfdGVtcGxhdGUodGhpcy5fbW9kZWwudG9KU09OKCkpKTtcbiAqICAgICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ2RvbmUnLCB0aGlzLl9tb2RlbC5kb25lKTtcbiAqICAgICAgICAgdGhpcy5fJGlucHV0ID0gdGhpcy4kKCcuZWRpdCcpIGFzIERPTTxIVE1MSW5wdXRFbGVtZW50PjtcbiAqICAgICAgICAgcmV0dXJuIHRoaXM7XG4gKiAgICAgfVxuICogICAgIDpcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmlldzxURWxlbWVudCBleHRlbmRzIE5vZGUgPSBIVE1MRWxlbWVudCwgVEV2ZW50IGV4dGVuZHMgb2JqZWN0ID0gb2JqZWN0PiBleHRlbmRzIEV2ZW50U291cmNlPFRFdmVudD4ge1xuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgW19wcm9wZXJ0aWVzXTogUHJvcGVydHk8VEVsZW1lbnQ+O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gY29uc3RydWN0aW9uL2Rlc3RydWN0aW9uOlxuXG4gICAgLyoqXG4gICAgICogY29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCBjb25zdHJ1Y3Rpb24gb3B0aW9ucy5cbiAgICAgKiAgLSBgamFgIOani+evieOCquODl+OCt+ODp+ODs1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBWaWV3Q29uc3RydWN0aW9uT3B0aW9uczxURWxlbWVudD4pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBjb25zdCB7IGVsLCB0YWdOYW1lLCBpZCwgYXR0cmlidXRlcywgY2xhc3NOYW1lLCBldmVudHMgfSA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHRoaXNbX3Byb3BlcnRpZXNdID0ge1xuICAgICAgICAgICAgY2lkOiBsdWlkKCd2aWV3OicsIDgpLFxuICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzLFxuICAgICAgICAgICAgdGFnTmFtZTogdGFnTmFtZSB8fCAnZGl2JyxcbiAgICAgICAgfSBhcyBQcm9wZXJ0eTxURWxlbWVudD47XG5cbiAgICAgICAgdGhpc1tfZW5zdXJlRWxlbWVudF0oZWwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBSZWxlYXNlIGFsbCBsaXN0ZW5lcnMuXG4gICAgICogQGphIOOBmeOBueOBpuOBruODquOCueODiuODvOOCkuino+mZpFxuICAgICAqL1xuICAgIHB1YmxpYyByZWxlYXNlKCk6IHRoaXMge1xuICAgICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcbiAgICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKCk7XG4gICAgICAgIHRoaXMub2ZmKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBSZW1vdmUgdGhpcyB2aWV3IGJ5IHRha2luZyB0aGUgZWxlbWVudCBvdXQgb2YgdGhlIERPTSB3aXRoIHJlbGVhc2UgYWxsIGxpc3RlbmVycy5cbiAgICAgKiBAamEgVmlldyDjgYvjgokgRE9NIOOCkuWIh+OCiumbouOBlywg44Oq44K544OK44O844KS6Kej6ZmkXG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZSgpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlKCk7XG4gICAgICAgIHRoaXMuJGVsLnJlbW92ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhY2Nlc3NvcjogYXR0cmlidXRlc1xuXG4gICAgLyoqXG4gICAgICogQGVuIEdldCBjb250ZW50IElELlxuICAgICAqIEBqYSDjgrPjg7Pjg4bjg7Pjg4QgSUQg44KS5Y+W5b6XXG4gICAgICovXG4gICAgZ2V0IGlkKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHsgY2lkLCBpZCB9ID0gdGhpc1tfcHJvcGVydGllc107XG4gICAgICAgIHJldHVybiBpZCB8fCBjaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIEdldCBlbGVtZW50LlxuICAgICAqIEBqYSDopoHntKDjgpLlj5blvpdcbiAgICAgKi9cbiAgICBnZXQgZWwoKTogVEVsZW1lbnQgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpc1tfcHJvcGVydGllc10uJGVsWzBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBHZXQgW1tET01dXSBvYmplY3QuXG4gICAgICogQGphIFtbRE9NXV0g44Kq44OW44K444Kn44Kv44OI44KS5Y+W5b6XXG4gICAgICovXG4gICAgZ2V0ICRlbCgpOiBET008VEVsZW1lbnQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbX3Byb3BlcnRpZXNdLiRlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gR2V0IGludGVybmFsIGNvbnRlbnQgSUQuXG4gICAgICogQGphIOWGhemDqOOBruOCs+ODs+ODhuODs+ODhCBJRCDjgpLlj5blvpdcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0IF9jaWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbX3Byb3BlcnRpZXNdLmNpZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gR2V0IGRlZmF1bHQgdGFnIG5hbWUuXG4gICAgICogQGphIOaXouWumuOBruOCv+OCsOWQjeOCkuWPluW+l1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXQgX3RhZ05hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbX3Byb3BlcnRpZXNdLnRhZ05hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIEF0dHJpYnV0ZXMgaW5zdGFuY2VcbiAgICAgKiBAamEg5bGe5oCn44KS5qC857SN44GZ44KL44Kk44Oz44K544K/44Oz44K5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldCBfYXR0cnMoKTogUGxhaW5PYmplY3Q8c3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGw+IHtcbiAgICAgICAgY29uc3QgeyBhdHRyaWJ1dGVzLCBpZCwgY2xhc3NOYW1lIH0gPSB0aGlzW19wcm9wZXJ0aWVzXTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZHJvcCh7IGlkLCBjbGFzczogY2xhc3NOYW1lIH0pLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBvcGVyYXRpb246XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2hhbmdlIHRoZSB2aWV3J3MgZWxlbWVudCAoYHRoaXMuZWxgIHByb3BlcnR5KSBhbmQgcmUtZGVsZWdhdGUgdGhlIHZpZXcncyBldmVudHMgb24gdGhlIG5ldyBlbGVtZW50LlxuICAgICAqIEBqYSBWaWV3IOOBjOeuoei9hOOBmeOCi+imgee0oCAoYHRoaXMuZWxgIHByb3BlcnR5KSDjga7lpInmm7QuIOOCpOODmeODs+ODiOWGjeioreWumuOCguWun+ihjFxuICAgICAqXG4gICAgICogQHBhcmFtIGVsXG4gICAgICogIC0gYGVuYCBPYmplY3Qgb3IgdGhlIHNlbGVjdG9yIHN0cmluZyB3aGljaCBiZWNvbWVzIG9yaWdpbiBvZiBlbGVtZW50LlxuICAgICAqICAtIGBqYWAg6KaB57Sg44Gu44KC44Go44Gr44Gq44KL44Kq44OW44K444Kn44Kv44OI44G+44Gf44Gv44K744Os44Kv44K/5paH5a2X5YiXXG4gICAgICovXG4gICAgcHVibGljIHNldEVsZW1lbnQoZWw6IERPTVNlbGVjdG9yPFRFbGVtZW50IHwgc3RyaW5nPik6IHRoaXMge1xuICAgICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcbiAgICAgICAgdGhpc1tfcHJvcGVydGllc10uJGVsID0gJChlbCkgYXMgRE9NPFRFbGVtZW50PjtcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZUV2ZW50cygpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gU2V0IERPTSBjYWxsYmFja3MgZnJvbSBbW1ZpZXdFdmVudHNIYXNoXV0gb2JqZWN0LlxuICAgICAqIEBqYSBbW1ZpZXdFdmVudHNIYXNoXV0g44Kq44OW44K444Kn44Kv44OI44GL44KJIERPTSDjgrPjg7zjg6vjg5Djg4Pjgq/jgpLoqK3lrppcbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudHNcbiAgICAgKiAgLSBgZW5gIFtbVmlld0V2ZW50c0hhc2hdXSBvYmplY3QuIGB0aGlzLmV2ZW50cygpYCBpcyB1c2VkIGJ5IGRlZmF1bHQuXG4gICAgICogIC0gYGphYCBbW1ZpZXdFdmVudHNIYXNoXV0g44Kq44OW44K444Kn44Kv44OILiDml6LlrprlgKTjga8gYHRoaXMuZXZlbnRzKClgXG4gICAgICovXG4gICAgcHVibGljIGRlbGVnYXRlRXZlbnRzKGV2ZW50cz86IFZpZXdFdmVudHNIYXNoPFRFbGVtZW50Pik6IHRoaXMge1xuICAgICAgICBjb25zdCBoYXNoID0gZXZlbnRzIHx8IHRoaXMuZXZlbnRzKCk7XG4gICAgICAgIGlmIChpc0VtcHR5T2JqZWN0KGhhc2gpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGhhc2gpKSB7XG4gICAgICAgICAgICBsZXQgbWV0aG9kID0gaGFzaFtrZXldIGFzIFVua25vd25GdW5jdGlvbjtcbiAgICAgICAgICAgIGlmICghaXNGdW5jdGlvbihtZXRob2QpKSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kID0gdGhpc1ttZXRob2RdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFtZXRob2QpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gL14oXFxTKylcXHMqKC4qKSQvLmV4ZWMoa2V5KSBhcyBSZWdFeHBFeGVjQXJyYXk7XG4gICAgICAgICAgICB0aGlzLmRlbGVnYXRlPGFueT4obWF0Y2hbMV0sIG1hdGNoWzJdLCBtZXRob2QuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2xlYXJzIGFsbCBjYWxsYmFja3MgcHJldmlvdXNseSBib3VuZCB0byB0aGUgdmlldyBieSBgZGVsZWdhdGVgLlxuICAgICAqIEBqYSBgZGVsZWdhdGVgIOOBleOCjOOBn+OCpOODmeODs+ODiOOCkuOBmeOBueOBpuWJiumZpFxuICAgICAqL1xuICAgIHB1YmxpYyB1bmRlbGVnYXRlRXZlbnRzKCk6IHRoaXMge1xuICAgICAgICB0aGlzLiRlbCAmJiB0aGlzLiRlbC5vZmY8YW55PihgLiR7dGhpcy5fY2lkfWApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQWRkIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24gdG8gb25lIG9yIG1vcmUgZXZlbnRzIHRvIHRoZSBlbGVtZW50cy4gKGxpdmUgZXZlbnQgYXZhaWxhYmxlKVxuICAgICAqIEBqYSDopoHntKDjgavlr77jgZfjgaYsIDHjgaTjgb7jgZ/jga/opIfmlbDjga7jgqTjg5njg7Pjg4jjg4/jg7Pjg4njg6njgpLoqK3lrpogKOWLleeahOimgee0oOOBq+OCguacieWKuSlcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0eXBlXG4gICAgICogIC0gYGVuYCBldmVudCBuYW1lIG9yIGV2ZW50IG5hbWUgYXJyYXkuXG4gICAgICogIC0gYGphYCDjgqTjg5njg7Pjg4jlkI3jgb7jgZ/jga/jgqTjg5njg7Pjg4jlkI3phY3liJdcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiAgLSBgZW5gIEEgc2VsZWN0b3Igc3RyaW5nIHRvIGZpbHRlciB0aGUgZGVzY2VuZGFudHMgb2YgdGhlIHNlbGVjdGVkIGVsZW1lbnRzIHRoYXQgdHJpZ2dlciB0aGUgZXZlbnQuXG4gICAgICogIC0gYGphYCDjgqTjg5njg7Pjg4jnmbrooYzlhYPjgpLjg5XjgqPjg6vjgr/jg6rjg7PjgrDjgZnjgovjgrvjg6zjgq/jgr/mloflrZfliJdcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXJcbiAgICAgKiAgLSBgZW5gIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICogIC0gYGphYCDjgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAtIGBlbmAgb3B0aW9ucyBmb3IgYGFkZEV2ZW50TGlzbnRlbmVyYFxuICAgICAqICAtIGBqYWAgYGFkZEV2ZW50TGlzbnRlbmVyYCDjgavmjIflrprjgZnjgovjgqrjg5fjgrfjg6fjg7NcbiAgICAgKi9cbiAgICBwdWJsaWMgZGVsZWdhdGU8VEV2ZW50TWFwIGV4dGVuZHMgRE9NRXZlbnRNYXA8VEVsZW1lbnQ+PihcbiAgICAgICAgdHlwZTogRXZlbnRUeXBlPFRFdmVudE1hcD4gfCAoRXZlbnRUeXBlPFRFdmVudE1hcD4pW10sXG4gICAgICAgIHNlbGVjdG9yOiBzdHJpbmcsXG4gICAgICAgIGxpc3RlbmVyOiBET01FdmVudExpc3RlbmVyPFRFbGVtZW50LCBURXZlbnRNYXA+LFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4gICAgKTogdGhpcztcblxuICAgIC8qKlxuICAgICAqIEBlbiBBZGQgZXZlbnQgaGFuZGxlciBmdW5jdGlvbiB0byBvbmUgb3IgbW9yZSBldmVudHMgdG8gdGhlIGVsZW1lbnRzLiAobGl2ZSBldmVudCBhdmFpbGFibGUpXG4gICAgICogQGphIOimgee0oOOBq+WvvuOBl+OBpiwgMeOBpOOBvuOBn+OBr+ikh+aVsOOBruOCpOODmeODs+ODiOODj+ODs+ODieODqeOCkuioreWumiAo5YuV55qE6KaB57Sg44Gr44KC5pyJ5Yq5KVxuICAgICAqXG4gICAgICogQHBhcmFtIHR5cGVcbiAgICAgKiAgLSBgZW5gIGV2ZW50IG5hbWUgb3IgZXZlbnQgbmFtZSBhcnJheS5cbiAgICAgKiAgLSBgamFgIOOCpOODmeODs+ODiOWQjeOBvuOBn+OBr+OCpOODmeODs+ODiOWQjemFjeWIl1xuICAgICAqIEBwYXJhbSBsaXN0ZW5lclxuICAgICAqICAtIGBlbmAgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiAgLSBgamFgIOOCs+ODvOODq+ODkOODg+OCr+mWouaVsFxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCBvcHRpb25zIGZvciBgYWRkRXZlbnRMaXNudGVuZXJgXG4gICAgICogIC0gYGphYCBgYWRkRXZlbnRMaXNudGVuZXJgIOOBq+aMh+WumuOBmeOCi+OCquODl+OCt+ODp+ODs1xuICAgICAqL1xuICAgIHB1YmxpYyBkZWxlZ2F0ZTxURXZlbnRNYXAgZXh0ZW5kcyBET01FdmVudE1hcDxURWxlbWVudD4+KFxuICAgICAgICB0eXBlOiBFdmVudFR5cGU8VEV2ZW50TWFwPiB8IChFdmVudFR5cGU8VEV2ZW50TWFwPilbXSxcbiAgICAgICAgbGlzdGVuZXI6IERPTUV2ZW50TGlzdGVuZXI8VEVsZW1lbnQsIFRFdmVudE1hcD4sXG4gICAgICAgIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnNcbiAgICApOiB0aGlzO1xuXG4gICAgcHVibGljIGRlbGVnYXRlKHR5cGU6IHN0cmluZywgLi4uYXJnczogdW5rbm93bltdKTogdGhpcyB7XG4gICAgICAgICh0aGlzLiRlbCBhcyBhbnkpLm9uKGAke3R5cGV9LiR7dGhpcy5fY2lkfWAsIC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gUmVtb3ZlIGV2ZW50IGhhbmRsZXIuIFRoZSBoYW5kbGVyIGRlc2lnbmF0ZWQgYXQgW1tvbl1dIG9yIFtbb25jZV1dIGFuZCB0aGF0IHNhbWUgY29uZGl0aW9uIGFyZSByZWxlYXNlZC4gPGJyPlxuICAgICAqICAgICBJZiB0aGUgbWV0aG9kIHJlY2VpdmVzIG5vIGFyZ3VtZW50cywgYWxsIGhhbmRsZXJzIGFyZSByZWxlYXNlZC5cbiAgICAgKiBAamEg6Kit5a6a44GV44KM44Gm44GE44KL44Kk44OZ44Oz44OI44OP44Oz44OJ44Op44Gu6Kej6ZmkLiBbW29uXV0g44G+44Gf44GvIFtbb25jZV1dIOOBqOWQjOadoeS7tuOBp+aMh+WumuOBl+OBn+OCguOBruOBjOino+mZpOOBleOCjOOCiyA8YnI+XG4gICAgICogICAgIOW8leaVsOOBjOeEoeOBhOWgtOWQiOOBr+OBmeOBueOBpuOBruODj+ODs+ODieODqeOBjOino+mZpOOBleOCjOOCiy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0eXBlXG4gICAgICogIC0gYGVuYCBldmVudCBuYW1lIG9yIGV2ZW50IG5hbWUgYXJyYXkuXG4gICAgICogIC0gYGphYCDjgqTjg5njg7Pjg4jlkI3jgb7jgZ/jga/jgqTjg5njg7Pjg4jlkI3phY3liJdcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiAgLSBgZW5gIEEgc2VsZWN0b3Igc3RyaW5nIHRvIGZpbHRlciB0aGUgZGVzY2VuZGFudHMgb2YgdGhlIHNlbGVjdGVkIGVsZW1lbnRzIHRoYXQgdHJpZ2dlciB0aGUgZXZlbnQuXG4gICAgICogIC0gYGphYCDjgqTjg5njg7Pjg4jnmbrooYzlhYPjgpLjg5XjgqPjg6vjgr/jg6rjg7PjgrDjgZnjgovjgrvjg6zjgq/jgr/mloflrZfliJdcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXJcbiAgICAgKiAgLSBgZW5gIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICogIC0gYGphYCDjgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAtIGBlbmAgb3B0aW9ucyBmb3IgYGFkZEV2ZW50TGlzbnRlbmVyYFxuICAgICAqICAtIGBqYWAgYGFkZEV2ZW50TGlzbnRlbmVyYCDjgavmjIflrprjgZnjgovjgqrjg5fjgrfjg6fjg7NcbiAgICAgKi9cbiAgICBwdWJsaWMgdW5kZWxlZ2F0ZTxURXZlbnRNYXAgZXh0ZW5kcyBET01FdmVudE1hcDxURWxlbWVudD4+KFxuICAgICAgICB0eXBlOiBFdmVudFR5cGVPck5hbWVzcGFjZTxURXZlbnRNYXA+IHwgKEV2ZW50VHlwZU9yTmFtZXNwYWNlPFRFdmVudE1hcD4pW10sXG4gICAgICAgIHNlbGVjdG9yOiBzdHJpbmcsXG4gICAgICAgIGxpc3RlbmVyPzogRE9NRXZlbnRMaXN0ZW5lcjxURWxlbWVudCwgVEV2ZW50TWFwPixcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IHRoaXM7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gUmVtb3ZlIGV2ZW50IGhhbmRsZXIuIFRoZSBoYW5kbGVyIGRlc2lnbmF0ZWQgYXQgW1tvbl1dIG9yIFtbb25jZV1dIGFuZCB0aGF0IHNhbWUgY29uZGl0aW9uIGFyZSByZWxlYXNlZC4gPGJyPlxuICAgICAqICAgICBJZiB0aGUgbWV0aG9kIHJlY2VpdmVzIG5vIGFyZ3VtZW50cywgYWxsIGhhbmRsZXJzIGFyZSByZWxlYXNlZC5cbiAgICAgKiBAamEg6Kit5a6a44GV44KM44Gm44GE44KL44Kk44OZ44Oz44OI44OP44Oz44OJ44Op44Gu6Kej6ZmkLiBbW29uXV0g44G+44Gf44GvIFtbb25jZV1dIOOBqOWQjOadoeS7tuOBp+aMh+WumuOBl+OBn+OCguOBruOBjOino+mZpOOBleOCjOOCiyA8YnI+XG4gICAgICogICAgIOW8leaVsOOBjOeEoeOBhOWgtOWQiOOBr+OBmeOBueOBpuOBruODj+ODs+ODieODqeOBjOino+mZpOOBleOCjOOCiy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0eXBlXG4gICAgICogIC0gYGVuYCBldmVudCBuYW1lIG9yIGV2ZW50IG5hbWUgYXJyYXkuXG4gICAgICogIC0gYGphYCDjgqTjg5njg7Pjg4jlkI3jgb7jgZ/jga/jgqTjg5njg7Pjg4jlkI3phY3liJdcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXJcbiAgICAgKiAgLSBgZW5gIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICogIC0gYGphYCDjgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAtIGBlbmAgb3B0aW9ucyBmb3IgYGFkZEV2ZW50TGlzbnRlbmVyYFxuICAgICAqICAtIGBqYWAgYGFkZEV2ZW50TGlzbnRlbmVyYCDjgavmjIflrprjgZnjgovjgqrjg5fjgrfjg6fjg7NcbiAgICAgKi9cbiAgICBwdWJsaWMgdW5kZWxlZ2F0ZTxURXZlbnRNYXAgZXh0ZW5kcyBET01FdmVudE1hcDxURWxlbWVudD4+KFxuICAgICAgICB0eXBlOiBFdmVudFR5cGVPck5hbWVzcGFjZTxURXZlbnRNYXA+IHwgKEV2ZW50VHlwZU9yTmFtZXNwYWNlPFRFdmVudE1hcD4pW10sXG4gICAgICAgIGxpc3RlbmVyPzogRE9NRXZlbnRMaXN0ZW5lcjxURWxlbWVudCwgVEV2ZW50TWFwPixcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IHRoaXM7XG5cbiAgICBwdWJsaWMgdW5kZWxlZ2F0ZSh0eXBlOiBzdHJpbmcsIC4uLmFyZ3M6IHVua25vd25bXSk6IHRoaXMge1xuICAgICAgICAodGhpcy4kZWwgYXMgYW55KS5vZmYoYCR7dHlwZX0uJHt0aGlzLl9jaWR9YCwgLi4uYXJncyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBHZXQgdGhlIGRlc2NlbmRhbnRzIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY3VycmVudCBzZXQgb2YgbWF0Y2hlZCBlbGVtZW50cywgZmlsdGVyZWQgYnkgYSBzZWxlY3Rvci5cbiAgICAgKiBAamEg6YWN5LiL44Gu6KaB57Sg44Gr5a++44GX44Gm5oyH5a6a44GX44Gf44K744Os44Kv44K/44Gr5LiA6Ie044GZ44KL6KaB57Sg44KS5qSc57SiXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiAgLSBgZW5gIE9iamVjdChzKSBvciB0aGUgc2VsZWN0b3Igc3RyaW5nIHdoaWNoIGJlY29tZXMgb3JpZ2luIG9mIERPTS5cbiAgICAgKiAgLSBgamFgIERPTSDjga7jgoLjgajjgavjgarjgovjgqTjg7Pjgrnjgr/jg7Pjgrko576kKeOBvuOBn+OBr+OCu+ODrOOCr+OCv+aWh+Wtl+WIl1xuICAgICAqL1xuICAgIHB1YmxpYyAkPFQgZXh0ZW5kcyBWaWV3RmluZFNlbGVjdG9yID0gVmlld0ZpbmRTZWxlY3Rvcj4oc2VsZWN0b3I6IERPTVNlbGVjdG9yPFQ+KTogRE9NUmVzdWx0PFQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoc2VsZWN0b3IpO1xuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIG92ZXJyaWRlOlxuXG4gICAgLyoqXG4gICAgICogQGVuIFRoZSBldmVudHMgaGFzaCAob3IgbWV0aG9kKSBjYW4gYmUgdXNlZCB0byBzcGVjaWZ5IGEgc2V0IG9mIERPTSBldmVudHMgdGhhdCB3aWxsIGJlIGJvdW5kIHRvIG1ldGhvZHMgb24geW91ciBWaWV3IHRocm91Z2ggZGVsZWdhdGVFdmVudHMuXG4gICAgICogQGphIOOCpOODmeODs+ODiOOCu+ODrOOCr+OCv+OBqOOCs+ODvOODq+ODkOODg+OCr+OBruODj+ODg+OCt+ODpeOCkuWumue+qeOBlywg44Or44O844OI44Ko44Oz44OG44Kj44OG44Kj44Gn5o2V5o2J44GZ44KLIERPTSDjgqTjg5njg7Pjg4jjgpLmjIflrppcbiAgICAgKlxuICAgICAqXG4gICAgICogQGV4YW1wbGUgPGJyPlxuICAgICAqXG4gICAgICogYGBgdHNcbiAgICAgKiBjbGFzcyBTYW1wbGVWaWV3IGV4dGVuZHMgVmlldyB7XG4gICAgICogICAgIHByb3RlY3RlZCBldmVudHMoKTogVmlld0V2ZW50c0hhc2gge1xuICAgICAqICAgICAgICAgcmV0dXJuIHtcbiAgICAgKiAgICAgICAgICAgICAnbW91c2Vkb3duIC50aXRsZSc6ICAnZWRpdCcsXG4gICAgICogICAgICAgICAgICAgJ2NsaWNrIC5idXR0b24nOiAgICAgJ3NhdmUnLFxuICAgICAqICAgICAgICAgICAgICdjbGljayAub3Blbic6ICAgICAgIGZ1bmN0aW9uKGUpIHsgLi4uIH0sXG4gICAgICogICAgICAgICAgICAgJ2NsaWNrIC5jbG9zZSc6ICAgICAgdGhpcy5vbkNsb3NlLFxuICAgICAqICAgICAgICAgfTtcbiAgICAgKiAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBldmVudHMoKTogVmlld0V2ZW50c0hhc2g8VEVsZW1lbnQ+IHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHRoaXNbX3Byb3BlcnRpZXNdLmV2ZW50cyk7XG4gICAgfVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYWJzdHJhY3Q6XG5cbiAgICAvKipcbiAgICAgKiBAZW4gSW1wbGVtZW50IHRoaXMgZnVuY3Rpb24gd2l0aCB5b3VyIGNvZGUgdGhhdCByZW5kZXJzIHRoZSB2aWV3IHRlbXBsYXRlIGZyb20gbW9kZWwgZGF0YSwgYW5kIHVwZGF0ZXMgYHRoaXMuZWxgIHdpdGggdGhlIG5ldyBIVE1MLlxuICAgICAqIEBqYSBgdGhpcy5lbGAg5pu05paw5pmC44Gu5paw44GX44GEIEhUTUwg44KS44Os44Oz44OA44Oq44Oz44Kw44Ot44K444OD44Kv44Gu5a6f6KOF6Zai5pWwLiDjg6Ljg4fjg6vmm7TmlrDjgaggVmlldyDjg4bjg7Pjg5fjg6zjg7zjg4jjgpLpgKPli5XjgZXjgZvjgosuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZSA8YnI+XG4gICAgICpcbiAgICAgKiBgYGB0c1xuICAgICAqIGltcG9ydCB7IFRlbXBsYXRlRW5naW5lIH0gZnJvbSAnQGNkcC9jb3JlLXRlbXBsYXRlJztcbiAgICAgKlxuICAgICAqIGNsYXNzIFNhbXBsZVZpZXcgZXh0ZW5kcyBWaWV3IHtcbiAgICAgKiAgICAgcHJpdmF0ZSBfdGVtcGxhdGUgPSBUZW1wbGF0ZUVuZ2luZS5jb21waWxlKCd7e3RpdGxlfX0nKTtcbiAgICAgKiAgICAgcmVuZGVyKCk6IHZvaWQge1xuICAgICAqICAgICAgICAgdGhpcy4kZWwuaHRtbCh0aGlzLl90ZW1wbGF0ZSh0aGlzLm1vZGVsKSk7XG4gICAgICogICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICovXG4gICAgYWJzdHJhY3QgcmVuZGVyKC4uLmFyZ3M6IHVua25vd25bXSk6IFByb21pc2U8dGhpcyB8IHZvaWQ+IHwgdGhpcyB8IHZvaWQ7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBpbnRlcm5hbDpcblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIFtfZW5zdXJlRWxlbWVudF0oZWw/OiBET01TZWxlY3RvcjxURWxlbWVudCB8IHN0cmluZz4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgY29uc3QgeyBfYXR0cnMsIF90YWdOYW1lIH0gPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5zZXRFbGVtZW50KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoX3RhZ05hbWUpIGFzIE5vZGUgYXMgVEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy4kZWwuYXR0cihfYXR0cnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRFbGVtZW50KGVsKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJzYWZlIiwiRXZlbnRTb3VyY2UiLCJsdWlkIiwiZHJvcCIsIiQiLCJpc0VtcHR5T2JqZWN0IiwiaXNGdW5jdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFDQSxpQkFBd0IsTUFBTSxRQUFRLEdBQUdBLGNBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDOztJQ0RsRTs7O0lBMkJBLGlCQUFpQixNQUFNLFdBQVcsR0FBTSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDN0QsaUJBQWlCLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBaUJqRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBNkNzQixJQUEwRSxTQUFRQyxrQkFBbUI7Ozs7Ozs7Ozs7UUFldkgsWUFBWSxPQUEyQztZQUNuRCxLQUFLLEVBQUUsQ0FBQztZQUVSLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7WUFDekUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHO2dCQUNoQixHQUFHLEVBQUVDLGNBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUNyQixNQUFNO2dCQUNOLEVBQUU7Z0JBQ0YsU0FBUztnQkFDVCxVQUFVO2dCQUNWLE9BQU8sRUFBRSxPQUFPLElBQUksS0FBSzthQUNOLENBQUM7WUFFeEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzVCOzs7OztRQU1NLE9BQU87WUFDVixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLEdBQUcsRUFB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
