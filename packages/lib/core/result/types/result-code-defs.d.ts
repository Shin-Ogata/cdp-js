declare namespace CDP_DECLARE {
    /**
     * @en Constant definition about range of the result code.
     * @ja リザルトコードの範囲に関する定数定義
     *
     * NOTE: TypeScript 3.6+ の不具合より const を解除
     * https://github.com/microsoft/TypeScript/issues/33060
     * TODO: TypeScript 更新の際にチェック. "3.6+" でコード内を検索
     */
    enum RESULT_CODE_RANGE {
        /**
         * @en The assignable range for the client's local result cord by which expansion is possible.
         * @ja クライアントが拡張可能なローカルリザルトコードのアサイン可能領域
         */
        MAX = 1000,
        /**
         * @en Reserved range of framework.
         * @ja フレームワークの予約領域
         */
        RESERVED = 1000
    }
    /**
     * @en The assignment range guideline definition used in the module.
     * @ja モジュール内で使用するアサイン領域ガイドライン定数定義
     *
     * NOTE: TypeScript 3.6+ の不具合より const を解除
     * https://github.com/microsoft/TypeScript/issues/33060
     */
    enum LOCAL_CODE_RANGE_GUIDE {
        /**
         * @en The assignment range guideline per 1 module.
         * @ja 1モジュール当たりに割り当てるアサイン領域ガイドライン
         */
        MODULE = 100,
        /**
         * @en The assignment range guideline per 1 function.
         * @ja 1機能当たりに割り当てるアサイン領域ガイドライン
         */
        FUNCTION = 20
    }
    /**
     * @en Offset value enumeration for [[RESULT_CODE]]. <br>
     *     The client can expand a definition in other module.
     * @ja [[RESULT_CODE]] のオフセット値 <br>
     *     エラーコード対応するモジュール内で 定義を拡張する.
     *
     * @example <br>
     *
     * ```ts
     *  const enum LOCAL_CODE_BASE {
     *      COMMON      = 0,
     *      SOMEMODULE  = 1 * LOCAL_CODE_RANGE_GUIDE.FUNCTION,
     *      SOMEMODULE2 = 2 * LOCAL_CODE_RANGE_GUIDE.FUNCTION,
     *  }
     *
     *  export enum RESULT_CODE {
     *      ERROR_SOMEMODULE_UNEXPECTED  = DECLARE_ERROR_CODE(RESULT_CODE_BASE.SOMEMODULE, LOCAL_CODE_BASE.SOMEMODULE + 1, "error unexpected."),
     *      ERROR_SOMEMODULE_INVALID_ARG = DECLARE_ERROR_CODE(RESULT_CODE_BASE.SOMEMODULE, LOCAL_CODE_BASE.SOMEMODULE + 2, "invalid arguments."),
     *  }
     *  ASSIGN_RESULT_CODE(RESULT_CODE);
     * ```
     *
     * NOTE: TypeScript 3.6+ の不具合より const を解除
     * https://github.com/microsoft/TypeScript/issues/33060
     */
    enum RESULT_CODE_BASE {
        COMMON = 0,
        CDP = 100
    }
    /**
     * @en Common result code for the application.
     * @ja アプリケーション全体で使用する共通エラーコード定義
     */
    enum RESULT_CODE {
        /** `en` general success code             <br> `ja` 汎用成功コード                       */
        SUCCESS = 0,
        /** `en` general cancel code              <br> `ja` 汎用キャンセルコード                 */
        ABORT = 1,
        /** `en` general pending code             <br> `ja` 汎用オペレーション未実行エラーコード */
        PENDING = 2,
        /** `en` general success but noop code    <br> `ja` 汎用実行不要コード                   */
        NOOP = 3,
        /** `en` general error code               <br> `ja` 汎用エラーコード                     */
        FAIL = -1,
        /** `en` general fatal error code         <br> `ja` 汎用致命的エラーコード               */
        FATAL = -2,
        /** `en` general not supported error code <br> `ja` 汎用オペレーションエラーコード       */
        NOT_SUPPORTED = -3
    }
    /**
     * @en Assign declared [[RESULT_CODE]] to root enumeration.
     *     (It's enable to merge enum in the module system environment.)
     * @ja 拡張した [[RESULT_CODE]] を ルート enum にアサイン
     *     モジュールシステム環境においても、enum をマージを可能にする
     */
    function ASSIGN_RESULT_CODE(extend: object): void;
    /**
     * @en Generate success code.
     * @ja 成功コードを生成
     *
     * @param base
     *  - `en` set base offset as [[RESULT_CODE_BASE]]
     *  - `ja` オフセット値を [[RESULT_CODE_BASE]] として指定
     * @param code
     *  - `en` set local code for declaration. ex) '1'
     *  - `ja` 宣言用のローカルコード値を指定  例) '1'
     * @param message
     *  - `en` set error message for help string.
     *  - `ja` ヘルプストリング用エラーメッセージを指定
     */
    function DECLARE_SUCCESS_CODE(base: RESULT_CODE_BASE, code: number, message?: string): number;
    /**
     * @en Generate error code.
     * @ja エラーコード生成
     *
     * @param base
     *  - `en` set base offset as [[RESULT_CODE_BASE]]
     *  - `ja` オフセット値を [[RESULT_CODE_BASE]] として指定
     * @param code
     *  - `en` set local code for declaration. ex) '1'
     *  - `ja` 宣言用のローカルコード値を指定  例) '1'
     * @param message
     *  - `en` set error message for help string.
     *  - `ja` ヘルプストリング用エラーメッセージを指定
     */
    function DECLARE_ERROR_CODE(base: RESULT_CODE_BASE, code: number, message?: string): number;
}
