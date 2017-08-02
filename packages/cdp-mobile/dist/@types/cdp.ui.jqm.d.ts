﻿/*!
 * cdp.ui.jqm.d.ts
 * This file is generated by the CDP package build process.
 *
 * Date: 2017-08-02T08:32:03.086Z
 */
/// <reference types="jquery" />
declare module "cdp.ui.jqm" {
    const UI: typeof CDP.UI;
    export = UI;
}
declare namespace CDP.UI {
    /**
     * @interface PlatformTransition
     * @brief プラットフォームごとの Transition を格納
     */
    interface PlatformTransition {
        [platform: string]: string;
        fallback: string;
    }
    /**
     * @interface TransitionMap
     * @brief トランジションマップ
     */
    interface TransitionMap {
        [transitionName: string]: PlatformTransition;
    }
    /**
     * @interface ThemeInitOptions
     * @brief トランジションマップ
     */
    interface ThemeInitOptions {
        platform?: string;
        reserveScrollbarRegion?: boolean;
    }
    /**
     * @class Theme
     * @brief UI Theme 設定を行うユーティリティクラス
     */
    class Theme {
        private static s_platforms;
        private static s_pageTransitionMap;
        private static s_dialogTransitionMap;
        /**
         * Theme の初期化
         *
         * @param options オプション指定
         * @returns true: 成功 / false: 失敗
         */
        static initialize(options?: ThemeInitOptions): string;
        /**
         * 現在指定されている UI Platform を取得
         *
         * @return {String} ex) "ios"
         */
        static getCurrentUIPlatform(): string;
        /**
         * UI Platform を設定
         *
         * @return {String} true: 成功 / false: 失敗
         */
        static setCurrentUIPlatform(platform: string): boolean;
        /**
         * 現在の Platform を判定し最適な platform を自動決定
         *
         * @param reserveScrollbarRegion PC デバッグ環境ではスクロールバーを表示. default: true
         * @returns ex) "ios"
         */
        static detectUIPlatform(reserveScrollbarRegion?: boolean): string;
        /**
         * platform を配列で登録
         * 上書きされる
         *
         * @param {String[]} platforms [in] OS ex): ["ios", "android"]
         */
        static registerUIPlatforms(platforms: string[]): void;
        /**
         * page transition を登録
         * 上書きされる
         *
         * @param {TransitionMap} map [in] TransitionMap を指定
         */
        static registerPageTransitionMap(map: TransitionMap): void;
        /**
         * dialog transition を登録
         * 上書きされる
         *
         * @param {TransitionMap} map [in] TransitionMap を指定
         */
        static registerDialogTransitionMap(map: TransitionMap): void;
        /**
         * page transition を取得
         * TransitionMap にアサインされているものであれば変換
         *
         * @return {String[]} "slide"
         */
        static queryPageTransition(original: string): string;
        /**
         * dialog transition を取得
         * TransitionMap にアサインされているものであれば変換
         *
         * @return {String[]} "slide"
         */
        static queryDialogTransition(original: string): string;
    }
}
declare namespace CDP.UI {
    /**
     * @interface DomExtensionOptions
     * @breif DomExtension に渡すオプションインターフェイス
     */
    interface DomExtensionOptions {
        [key: string]: any;
    }
    /**
     * @type DomExtension
     * @brief DOM 拡張関数
     */
    type DomExtension = ($target: JQuery, DomExtensionOptions?: Object) => JQuery;
    /**
     * @class ExtensionManager
     * @brief 拡張機能を管理するユーティリティクラス
     */
    class ExtensionManager {
        private static s_domExtensions;
        /**
         * DOM 拡張関数の登録
         *
         * @param {DomExtension} func [in] DOM 拡張関数
         */
        static registerDomExtension(func: DomExtension): void;
        /**
         * DOM 拡張を適用
         *
         * @param {jQuery} $ui       [in] 拡張対象の DOM
         * @param {Object} [options] [in] オプション
         */
        static applyDomExtension($ui: JQuery, options?: DomExtensionOptions): void;
    }
}
declare namespace CDP.UI {
    /**
     * @class Toast
     * @brief Android SDK の Toast クラスのように自動消滅するメッセージ出力ユーティリティ
     *        入れ子の関係を実現するために module で実装
     */
    module Toast {
        let LENGTH_SHORT: number;
        let LENGTH_LONG: number;
        enum OffsetX {
            LEFT = 1,
            RIGHT = 2,
            CENTER = 4,
        }
        enum OffsetY {
            TOP = 16,
            BOTTOM = 32,
            CENTER = 64,
        }
        /**
         * @interface StyleBuilder
         * @brief     スタイル変更時に使用するインターフェイス
         *            css にスタイルを逃がす場合、独自の class を設定し、getStyle は null を返すこと。
         */
        interface StyleBuilder {
            getClass(): string;
            getStyle(): any;
            getOffsetPoint(): number;
            getOffsetX(): number;
            getOffsetY(): number;
        }
        /**
         * @class StyleBuilderDefault
         * @brief スタイル変更時に使用する既定の構造体オブジェクト
         */
        class StyleBuilderDefault implements StyleBuilder {
            getClass(): string;
            getStyle(): any;
            getOffsetPoint(): number;
            getOffsetX(): number;
            getOffsetY(): number;
        }
        /**
         * Toast 表示
         *
         * @param message  [in] メッセージ
         * @param duration [in] 表示時間を設定 (msec) default: LENGTH_SHORT
         * @param style    [in] スタイル変更する場合には派生クラスオブジェクトを指定
         */
        function show(message: string, duration?: number, style?: StyleBuilder): void;
    }
}
declare namespace CDP.UI {
    /**
     * H/W Back Key Hook 関数
     */
    type DialogBackKeyHandler = (event?: JQuery.Event) => void;
    /**
     * @interface DialogOptions
     *            ダイアログオプションインターフェイス
     */
    interface DialogOptions extends PopupOptions {
        src?: string;
        title?: string;
        message?: string;
        idPositive?: string;
        idNegative?: string;
        event?: string;
        defaultAutoClose?: boolean;
        forceOverwriteAfterClose?: boolean;
        labelPositive?: string;
        labelNegative?: string;
        backKey?: "close" | "deny" | DialogBackKeyHandler;
        scrollEvent?: "deny" | "allow" | "adjust";
        domExtensionOptions?: DomExtensionOptions;
        [x: string]: any;
    }
    /**
     * @class Dialog
     * @brief 汎用ダイアログクラス
     *        jQM の popup widget によって実装
     */
    class Dialog {
        private _template;
        private _settings;
        private _$dialog;
        private static s_activeDialog;
        private static s_oldBackKeyHandler;
        private static s_defaultOptions;
        /**
         * constructor
         *
         * @param id      {String}        [in] ダイアログ DOM ID を指定 ex) #dialog-hoge
         * @param options {DialogOptions} [in] オプション
         */
        constructor(id: string, options?: DialogOptions);
        /**
         * 表示
         * 表示をして始めて DOM が有効になる。
         *
         * @param options {DialogOptions} [in] オプション (src は無視される)
         * @return ダイアログの jQuery オブジェクト
         */
        show(options?: DialogOptions): JQuery;
        /**
         * 終了
         * 基本的には自動で閉じるが、
         * 表示中のダイアログをクライアント側から閉じるメソッド
         */
        close(): void;
        readonly $el: JQuery;
        /**
         * ダイアログ表示の直前
         * DOM を操作できるタイミングで呼び出される.
         *
         * @return {IPromiseBase} promise オブジェクト
         */
        protected onBeforeShow(): IPromiseBase<void>;
        /**
         * ダイアログの使用する Theme を解決
         * 不要な場合はオーバーライドすることも可能
         */
        protected resolveTheme(): void;
        /**
         * Dialog の既定オプションを更新
         * すべての Dialog が使用する共通設定
         *
         * @param options {DialogOptions} [in] ダイアログオプション
         */
        static setDefaultOptions(options: DialogOptions): void;
        private static register(dialog);
        /**
         * Dialog 共通設定の初期化
         */
        private static initCommonCondition();
        /**
         * H/W Back Button Handler
         */
        private static customBackKeyHandler(event?);
    }
}
declare namespace CDP.UI {
    /**
     * Alert
     * alert メッセージ表示
     *
     * @param {String} message   [in] 表示文字列
     * @param {String} [options] [in] ダイアログオプション
     * @return {jQuery} ダイアログの DOM オブジェクト
     */
    function alert(message: string, options?: DialogOptions): JQuery;
    /**
     * Confirm
     * 確認メッセージ表示
     *
     * @param {String} message   [in] 表示文字列
     * @param {String} [options] [in] ダイアログオプション
     * @return {jQuery} ダイアログの DOM オブジェクト
     */
    function confirm(message: string, options?: DialogOptions): JQuery;
    /**
     * @interface DialogCommonsOptions
     * @brief prompt のオプション
     */
    interface DialogPromptOptions extends DialogOptions {
        eventOK?: string;
    }
    /**
     * Prompt
     *
     * @param {String} message   [in] 表示文字列
     * @param {String} [options] [in] ダイアログオプション
     * @return {jQuery} ダイアログの DOM オブジェクト
     */
    function prompt(message: string, options?: DialogPromptOptions): JQuery;
}
declare namespace CDP.UI {
    import IPage = CDP.Framework.IPage;
    import Model = CDP.Framework.Model;
    import View = CDP.Framework.View;
    import ViewOptions = CDP.Framework.ViewOptions;
    import JST = CDP.Tools.JST;
    /**
     * @interface BaseHeaderViewOptions
     * @brief BaseHeaderView に指定するオプションインターフェイス
     */
    interface BaseHeaderViewOptions<TModel extends Model = Model> extends ViewOptions<TModel> {
        baseTemplate?: JST;
        backCommandSelector?: string;
        backCommandKind?: string;
    }
    /**
     * @class BaseHeaderView
     * @brief 共通ヘッダを操作するクラス
     */
    class BaseHeaderView<TModel extends Model = Model> extends View<TModel> {
        private _owner;
        private _options;
        private static s_$headerBase;
        private static s_refCount;
        private _template;
        private _hasBackIndicator;
        /**
         * constructor
         *
         * @param {IPage} _owner [in] オーナーページインスタンス
         */
        constructor(_owner: IPage, _options?: BaseHeaderViewOptions<TModel>);
        /**
         * 初期化
         */
        create(): JQuery;
        /**
         * 有効化
         */
        activate(): JQuery;
        /**
         * 無効化
         */
        inactivate(): JQuery;
        /**
         * 破棄
         */
        release(): JQuery;
        private createHeaderBase();
        private showIndicator();
        private hideIndicator();
        private releaseHeaderBase();
        events(): any;
        private onCommandBack(event);
    }
}
declare namespace CDP.UI {
    import Framework = CDP.Framework;
    /**
     * @interface BasePageOptions
     * @brief BasePage に指定するオプションインターフェイス
     */
    interface BasePageOptions<TModel extends Framework.Model = Framework.Model> extends Framework.PageConstructOptions, BaseHeaderViewOptions<TModel> {
        baseHeader?: new (owner: Framework.IPage, options?: BaseHeaderViewOptions<TModel>) => BaseHeaderView<TModel>;
        backCommandHandler?: string;
        domExtensionOptions?: DomExtensionOptions;
    }
    /**
     * @class BasePage
     * @brief Header を備える Page クラス
     */
    class BasePage<TModel extends Framework.Model = Framework.Model> extends Framework.Page {
        private _options;
        private _baseHeader;
        /**
         * constructor
         *
         * @param {String}          url       [in] ページ URL
         * @param {String}          id        [in] ページ ID
         * @param {BasePageOptions} [options] [in] オプション
         */
        constructor(url: string, id: string, _options?: BasePageOptions<TModel>);
        /**
         * jQM event: "pagebeforecreate" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onPageBeforeCreate(event: JQuery.Event): void;
        /**
         * jQM event: "pagecreate" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onPageInit(event: JQuery.Event): void;
        /**
         * jQM event: "pagebeforeshow" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @param data  {ShowEventData}     [in] 付加情報
         */
        onPageBeforeShow(event: JQuery.Event, data?: Framework.ShowEventData): void;
        /**
         * jQM event: "pagebeforehide" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @param data  {HideEventData}     [in] 付加情報
         */
        onPageBeforeHide(event: JQuery.Event, data?: Framework.HideEventData): void;
        /**
         * jQM event: "pageremove" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onPageRemove(event: JQuery.Event): void;
        /**
         * H/W Back Button ハンドラ
         *
         * @param  event {JQuery.Event} [in] event object
         * @return {Boolean} true: 既定の処理を行わない / false: 既定の処理を行う
         */
        onHardwareBackButton(event?: JQuery.Event): boolean;
        /**
         * "戻る" event 発行時にコールされる
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @return {Boolean} true: 既定の処理を行わない / false: 既定の処理を行う
         */
        onCommand(event: JQuery.Event, kind: string): boolean;
    }
}
declare namespace CDP.UI {
    import Framework = CDP.Framework;
    /**
     * PageView が発行するイベント定義
     */
    const enum PAGEVIEW_EVENTS {
        ORIENTATION_CHANGED = "pageview:orientation-changed",
        INITIALZSE = "pageview:initialize",
        PAGE_BEFORE_CREATE = "pageview:before-create",
        PAGE_INIT = "pageview:page-init",
        PAGE_BEFORE_SHOW = "pageview:before-show",
        PAGE_SHOW = "pageview:show",
        PAGE_BEFORE_HIDE = "pageview:before-hide",
        PAGE_HIDE = "pageview:hide",
        PAGE_REMOVE = "pageview:remove",
    }
    /**
     * @interface PageViewConstructOptions
     * @brief Router への登録情報と Backbone.View への初期化情報を格納するインターフェイスクラス
     */
    interface PageViewConstructOptions<TModel extends Framework.Model = Framework.Model> extends BasePageOptions<TModel> {
        basePage?: new (url: string, id: string, options?: Framework.PageConstructOptions) => Framework.Page;
    }
    /**
     * @class PageView
     * @brief CDP.Framework.Page と Backbone.View の両方の機能を提供するページの基底クラス
     */
    class PageView<TModel extends Framework.Model = Framework.Model> extends Framework.View<TModel> implements Framework.IPage, IStatusManager {
        protected _pageOptions: PageViewConstructOptions<TModel>;
        protected _basePage: Framework.Page;
        private _statusMgr;
        /**
         * constructor
         *
         * @param url     {String}                   [in] ページ URL
         * @param id      {String}                   [in] ページ ID
         * @param options {PageViewConstructOptions} [in] オプション
         */
        constructor(url: string, id: string, options?: PageViewConstructOptions<TModel>);
        /**
         * 状態変数の参照カウントのインクリメント
         *
         * @param status {String} [in] 状態識別子
         */
        statusAddRef(status: string): number;
        /**
         * 状態変数の参照カウントのデクリメント
         *
         * @param status {String} [in] 状態識別子
         */
        statusRelease(status: string): number;
        /**
         * 処理スコープ毎に状態変数を設定
         *
         * @param status   {String}   [in] 状態識別子
         * @param callback {Function} [in] 処理コールバック
         */
        statusScope(status: string, callback: () => void | Promise<any>): void;
        /**
         * 指定した状態中であるか確認
         *
         * @param status {String}   [in] 状態識別子
         * @return {Boolean} true: 状態内 / false: 状態外
         */
        isStatusIn(status: string): boolean;
        readonly active: boolean;
        readonly url: string;
        readonly id: string;
        readonly $page: JQuery;
        readonly $header: JQuery;
        readonly $footer: JQuery;
        intent: Framework.Intent;
        /**
         * Orientation の変更を受信
         *
         * @param newOrientation {Orientation} [in] new orientation code.
         */
        onOrientationChanged(newOrientation: Framework.Orientation): void;
        /**
         * H/W Back Button ハンドラ
         *
         * @param  event {JQuery.Event} [in] event object
         * @return {Boolean} true: 既定の処理を行わない / false: 既定の処理を行う
         */
        onHardwareBackButton(event?: JQuery.Event): boolean;
        /**
         * Router "before route change" ハンドラ
         * ページ遷移直前に非同期処理を行うことが可能
         *
         * @return {IPromiseBase} Promise オブジェクト
         */
        onBeforeRouteChange(): IPromiseBase<any>;
        /**
         * 汎用コマンドを受信
         *
         * @param  event {JQuery.Event} [in] event object
         * @param  event {kind}              [in] command kind string
         * @return {Boolean} true: 既定の処理を行わない / false: 既定の処理を行う
         */
        onCommand(event?: JQuery.Event, kind?: string): boolean;
        /**
         * 最初の OnPageInit() のときにのみコールされる
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onInitialize(event: JQuery.Event): void;
        /**
         * jQM event: "pagebeforecreate" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onPageBeforeCreate(event: JQuery.Event): void;
        /**
         * jQM event: "pagecreate" (旧:"pageinit") に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onPageInit(event: JQuery.Event): void;
        /**
         * jQM event: "pagebeforeshow" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @param data  {ShowEventData}     [in] 付加情報
         */
        onPageBeforeShow(event: JQuery.Event, data?: Framework.ShowEventData): void;
        /**
         * jQM event: "pagecontainershow" (旧:"pageshow") に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @param data  {ShowEventData}     [in] 付加情報
         */
        onPageShow(event: JQuery.Event, data?: Framework.ShowEventData): void;
        /**
         * jQM event: "pagebeforehide" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @param data  {HideEventData}     [in] 付加情報
         */
        onPageBeforeHide(event: JQuery.Event, data?: Framework.HideEventData): void;
        /**
         * jQM event: "pagecontainerhide" (旧:"pagehide") に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @param data  {HideEventData}     [in] 付加情報
         */
        onPageHide(event: JQuery.Event, data?: Framework.HideEventData): void;
        /**
         * jQM event: "pageremove" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onPageRemove(event: JQuery.Event): void;
    }
}
declare namespace CDP.UI {
    import Framework = CDP.Framework;
    /**
     * @interface PageContainerViewOptions
     * @brief PageContainer のオプション
     */
    interface PageContainerViewOptions<TModel extends Framework.Model = Framework.Model> extends Framework.ViewOptions<TModel> {
        owner: PageView;
        $el?: JQuery;
    }
    /**
     * @class PageContainerView
     * @brief PageView と連携可能な コンテナビュークラス
     */
    class PageContainerView<TModel extends Framework.Model = Framework.Model> extends Framework.View<TModel> {
        private _owner;
        /**
         * constructor
         */
        constructor(options: PageContainerViewOptions<TModel>);
        readonly owner: PageView;
        /**
         * Orientation の変更を受信
         *
         * @param newOrientation {Orientation} [in] new orientation code.
         */
        onOrientationChanged(newOrientation: Framework.Orientation): void;
        /**
         * 最初の OnPageInit() のときにのみコールされる
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onInitialize(event: JQuery.Event): void;
        /**
         * jQM event: "pagebeforecreate" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onPageBeforeCreate(event: JQuery.Event): void;
        /**
         * jQM event: "pagecreate" (旧:"pageinit") に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onPageInit(event: JQuery.Event): void;
        /**
         * jQM event: "pagebeforeshow" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @param data  {ShowEventData}     [in] 付加情報
         */
        onPageBeforeShow(event: JQuery.Event, data?: Framework.ShowEventData): void;
        /**
         * jQM event: "pagecontainershow" (旧:"pageshow") に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @param data  {ShowEventData}     [in] 付加情報
         */
        onPageShow(event: JQuery.Event, data?: Framework.ShowEventData): void;
        /**
         * jQM event: "pagebeforehide" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @param data  {HideEventData}     [in] 付加情報
         */
        onPageBeforeHide(event: JQuery.Event, data?: Framework.HideEventData): void;
        /**
         * jQM event: "pagecontainerhide" (旧:"pagehide") に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         * @param data  {HideEventData}     [in] 付加情報
         */
        onPageHide(event: JQuery.Event, data?: Framework.HideEventData): void;
        /**
         * jQM event: "pageremove" に対応
         *
         * @param event {JQuery.Event} [in] イベントオブジェクト
         */
        onPageRemove(event: JQuery.Event): void;
    }
}
interface IFlipsnap {
    [x: string]: any;
}
interface FlipsnapOptions {
}
declare namespace CDP.UI {
    import Model = Framework.Model;
    import IOrientationChangedListener = Framework.IOrientationChangedListener;
    import Orientation = Framework.Orientation;
    /**
     * @interface ITabView
     * @brief TabHostView にアタッチ可能な View インターフェイス
     */
    interface ITabView extends IListView, IOrientationChangedListener {
        host: TabHostView;
        $el: JQuery;
        needRebuild?: boolean;
        /**
         * 状態に応じたスクロール位置の保存/復元
         * Browser の Native Scroll 時にコールされる
         */
        treatScrollPosition(): void;
        /**
         * Scroller の初期化時にコールされる
         */
        onInitialize(host: TabHostView, $root: JQuery): void;
        /**
         * Scroller の破棄時にコールされる
         */
        onDestroy(): void;
        /**
         * visibility 属性が変更されたときにコールされる
         * active ページとその両端のページが対象
         *
         * @param visible [in] true: 表示 / false: 非表示
         */
        onVisibilityChanged(visible: boolean): void;
        /**
         * ページが表示完了したときにコールされる
         */
        onTabSelected(): void;
        /**
         * ページが非表示に切り替わったときにコールされる
         */
        onTabReleased(): void;
        /**
         * ドラッグ中にコールされる
         *
         * @param position [in] 現在の tab index
         * @param offset   [in] 移動量
         */
        onTabScrolling(position: number, offset: number): void;
    }
    /**
     * @interface TabViewContextOptions
     * @brief TabViewContext に指定するオプション
     */
    interface TabViewContextOptions<TModel extends Model = Model> extends ListViewConstructOptions<TModel> {
        delayRegister?: boolean;
    }
    /**
     * @interface TabViewConstructionOptions
     * @brief TabView のオプション
     */
    interface TabViewConstructionOptions<TModel extends Model = Model> extends TabViewContextOptions<TModel> {
        host: TabHostView;
    }
    /**
     * @interface TabViewContext
     * @brief ITabView を初期化するための情報を格納
     */
    interface TabViewContext<TModel extends Model = Model> {
        ctor?: new (options?: TabViewConstructionOptions<TModel>) => ITabView;
        options?: TabViewContextOptions<TModel>;
    }
    /**
     * @interface TabHostViewConstructOptions
     * @brief TabHostView の初期化情報を格納するインターフェイスクラス
     */
    interface TabHostViewConstructOptions<TModel extends Model = Model> extends PageContainerViewOptions<TModel>, FlipsnapOptions {
        inactiveVisibleTabDistance?: number;
        tabContexts?: TabViewContext[];
        enableBounce?: boolean;
        initialWidth?: number;
        initialHeight?: number;
        initImmediate?: boolean;
    }
    /**
     * @class TabHostView
     * @brief タブ切り替え機能を持つ View クラス
     */
    class TabHostView<TModel extends Model = Model> extends PageContainerView<TModel> implements IOrientationChangedListener {
        private _tabs;
        private _activeTabIndex;
        private _flipsnap;
        private _flipEndEventHandler;
        private _flipMoveEventHandler;
        private _flipDeltaCache;
        private _scrollEndEventHandler;
        private _scrollMoveEventHandler;
        private _refreshTimerId;
        private _$contentsHolder;
        private _settings;
        static EVENT_SCROLL_MOVE: string;
        static EVENT_SCROLL_STOP: string;
        static EVENT_TAB_MOVE: string;
        static EVENT_TAB_STOP: string;
        /**
         * constructor
         *
         * @param options [in] オプション
         */
        constructor(options: TabHostViewConstructOptions<TModel>);
        /**
         * 配下の TabView を初期化
         */
        initializeTabViews(): void;
        /**
         * 破棄のヘルパー関数
         * メンバーの破棄のタイミングを変える場合、本メソッドをコールする
         */
        destroy(): void;
        getBaseHeight(): number;
        /**
         * TabView を登録
         * Framework が使用
         *
         * @param tabview [in] ITabView のインスタンス
         */
        registerTabView(tabview: ITabView): void;
        /**
         * TabView の Tab index を取得
         * Framework が使用
         *
         * @param tabview [in] ITabView のインスタンス
         * @return 指定インスタンスのインデックス
         */
        getTabIndexOf(tabview: ITabView): number;
        protected resetTabPosition(): void;
        protected onTabViewSetupRequest(initialHeight: number): void;
        setActiveTab(index: number, transitionDuration?: number, initial?: boolean): boolean;
        /**
         * タブの数を取得
         *
         * @return {Number} タブ数
         */
        getTabCount(): number;
        getActiveTabIndex(): number;
        getSwipeDelta(): number;
        protected onTabMoving(delta: number): void;
        protected onTabChanged(newIndex: number, moved: boolean): void;
        getScrollPos(): number;
        getScrollPosMax(): number;
        scrollTo(pos: number, animate?: boolean, time?: number): void;
        protected onScroll(): void;
        protected onScrollStop(): void;
        setScrollHandler(handler: (event: JQuery.Event) => void, on: boolean): void;
        setScrollStopHandler(handler: (event: JQuery.Event) => void, on: boolean): void;
        onOrientationChanged(newOrientation: Orientation): void;
        onPageShow(event: JQuery.Event, data?: Framework.ShowEventData): void;
        rebuild(): void;
        private setFlipsnapCondition(options);
        private resetFlipsnapCondition();
        private preprocess(toIndex);
        private postprocess(lastActiveTabIndex);
        private validTab(index);
        private readonly _activeTabView;
    }
}
declare namespace CDP.UI {
    import Model = CDP.Framework.Model;
    /**
     * @class TabView
     * @brief TabHostView にアタッチ可能な View クラス
     */
    class TabView<TModel extends Model = Model> extends ListView<TModel> implements ITabView {
        private _host;
        private _needRebuild;
        private _tabIndex;
        /**
         * constructor
         *
         */
        constructor(options: TabViewConstructionOptions<TModel>);
        readonly host: TabHostView;
        needRebuild: boolean;
        treatScrollPosition(): void;
        onInitialize(host: TabHostView, $root: JQuery): void;
        onDestroy(): void;
        onVisibilityChanged(visible: boolean): void;
        onTabSelected(): void;
        onTabReleased(): void;
        onTabScrolling(position: number, offset: number): void;
        onOrientationChanged(newOrientation: Framework.Orientation): void;
        readonly core: ScrollManager;
        protected readonly tabIndex: number;
        protected isActive(): boolean;
    }
}
declare namespace CDP.UI {
    import Model = CDP.Framework.Model;
    /**
     * @interface PageListViewConstructOptions
     * @brief PageListView への初期化情報を格納するインターフェイスクラス
     */
    interface PageListViewConstructOptions<TModel extends Model = Model> extends ListViewOptions, PageViewConstructOptions<TModel> {
        autoDestoryElement?: boolean;
    }
    /**
     * @class PageListView
     * @brief 仮想リストビュー機能を持つ PageView クラス
     */
    class PageListView<TModel extends Model = Model> extends PageView<TModel> implements IListView {
        private _scrollMgr;
        private _needRebuild;
        /**
         * constructor
         *
         * @param url     {String}                       [in] page template に使用する URL
         * @param id      {String}                       [in] page に振られた ID
         * @param options {PageListViewConstructOptions} [in] オプション
         */
        constructor(url: string, id: string, options?: PageListViewConstructOptions<TModel>);
        reserveRebuild(): void;
        onOrientationChanged(newOrientation: Framework.Orientation): void;
        onBeforeRouteChange(): IPromiseBase<any>;
        onPageBeforeShow(event: JQuery.Event, data?: Framework.ShowEventData): void;
        onPageShow(event: JQuery.Event, data?: Framework.ShowEventData): void;
        onPageRemove(event: JQuery.Event): void;
        isInitialized(): boolean;
        addItem(height: number, initializer: new (options?: any) => BaseListItemView, info: any, insertTo?: number): void;
        removeItem(index: number, size?: number, delay?: number): void;
        removeItem(index: number[], delay?: number): void;
        getItemInfo(target: number): any;
        getItemInfo(target: JQuery.Event): any;
        refresh(): void;
        update(): void;
        rebuild(): void;
        release(): void;
        backup(key: string): boolean;
        restore(key: string, rebuild?: boolean): boolean;
        hasBackup(key: string): boolean;
        clearBackup(key?: string): boolean;
        readonly backupData: any;
        setScrollHandler(handler: (event: JQuery.Event) => void, on: boolean): void;
        setScrollStopHandler(handler: (event: JQuery.Event) => void, on: boolean): void;
        getScrollPos(): number;
        getScrollPosMax(): number;
        scrollTo(pos: number, animate?: boolean, time?: number): void;
        ensureVisible(index: number, options?: EnsureVisibleOptions): void;
        readonly core: IListViewFramework;
        _addLine(_line: any, insertTo?: number): void;
        private getPageBaseHeight();
    }
}
declare namespace CDP.UI {
    import Model = CDP.Framework.Model;
    /**
     * @class PageExpandableListView
     * @brief 開閉リストビュー機能を持つ PageView クラス
     */
    class PageExpandableListView<TModel extends Model = Model> extends PageListView<TModel> implements IExpandableListView {
        private _expandManager;
        /**
         * constructor
         *
         * @param url     {String}                       [in] page template に使用する URL
         * @param id      {String}                       [in] page に振られた ID
         * @param options {PageListViewConstructOptions} [in] オプション
         */
        constructor(url: string, id: string, options?: PageListViewConstructOptions<TModel>);
        newGroup(id?: string): GroupProfile;
        getGroup(id: string): GroupProfile;
        registerTopGroup(topGroup: GroupProfile): void;
        getTopGroups(): GroupProfile[];
        expandAll(): void;
        collapseAll(delay?: number): void;
        isExpanding(): boolean;
        isCollapsing(): boolean;
        isSwitching(): boolean;
        layoutKey: string;
        release(): void;
        backup(key: string): boolean;
        restore(key: string, rebuild?: boolean): boolean;
    }
}
/**
 * jQuery plugin definition
 */
interface JQuery {
    ripple(options?: CDP.UI.DomExtensionOptions): JQuery;
}
declare namespace CDP.UI.Extension {
}
/**
 * jQuery plugin definition
 */
interface JQuery {
    spinner(options?: CDP.UI.DomExtensionOptions | "refresh"): JQuery;
}
declare namespace CDP.UI.Extension {
}
declare namespace CDP.UI.Extension {
}
declare namespace CDP.UI.Extension {
}
declare namespace CDP.UI.Extension {
}
declare namespace CDP.UI.Extension {
}
