﻿namespace CDP {

    const UNKNOWN_ERROR_NAME    = "Unknown Error";
    const ERROR_NAME_SEPARATOR  = ": ";
    const CANCELED_MESSAGE      = "abort";
    const s_code2message: { [resultCode: string]: string } = {
        "0": "operation succeeded.",
        "1": "operation canceled.",
        "-1": "operation failed."
    };

    ///////////////////////////////////////////////////////////////////////
    // error utilities:

    /**
     * @en Common error code for the application.
     * @ja アプリケーション全体で使用する共通エラーコード定義
     */
    export enum RESULT_CODE {
        /** `en` general success code <br> `ja` 汎用成功コード        */
        SUCCEEDED   = 0,
        /** `en` general cancel code  <br> `ja` 汎用キャンセルコード  */
        CANCELED    = 1,
        /** `en` general error code   <br> `ja` 汎用エラーコード      */
        FAILED      = -1,
    }

    /**
     * @en Error communication object.
     * @ja エラー伝達オブジェクト
     */
    export interface ErrorInfo extends Error {
        /**
         * @en The numerical value that is defined the application / internal libraries.
         * @ja アプリケーション/ライブラリで定義する数値型コードを格納
         */
        code: RESULT_CODE;
        /**
         * @en Stock low-level error information.
         * @ja 下位のエラー情報を格納
         */
        cause?: Error;
    }

    /**
     * @en The assignable range for the client's local result cord by which expansion is possible.
     * @ja クライアントが拡張可能なローカルリザルトコードのアサイン可能領域
     */
    export const MODULE_RESULT_CODE_RANGE = 1000;

    /**
     * @en Generate the [[ErrorInfo]] object.
     * @ja [[ErrorInfo]] オブジェクトを生成
     *
     * @example <br>
     *
     * ```ts
     *  someAsyncFunc()
     *      .then((result) => {
     *          outputMessage(result);
     *      })
     *      .catch((reason: Error) => {
     *          throw makeErrorInfo(
     *              RESULT_CODE.FAILED,
     *              TAG,
     *              "error occur.",
     *              reason  // set received error info.
     *          );
     *      });
     * ```
     *
     * @param resultCode
     *  - `en` set [[RESULT_CODE]] defined.
     *  - `ja` 定義した [[RESULT_CODE]] を指定
     * @param tag
     *  - `en` Log tag information
     *  - `ja` 識別情報
     * @param message
     *  - `en` Human readable message
     *  - `ja` メッセージを指定
     * @param cause
     *  - `en` low-level Error object
     *  - `ja` 下位のエラーを指定
     * @returns
     */
    export function makeErrorInfo(resultCode: number, tag?: string, message?: string, cause?: Error): ErrorInfo {
        const canceled = (cause && CANCELED_MESSAGE === cause.message) ? true : false;
        const msg = canceled ? CANCELED_MESSAGE : message;
        const code = canceled ? RESULT_CODE.CANCELED : resultCode;
        const errorInfo = <ErrorInfo>new Error(msg || messageFromResultCode(code));
        errorInfo.name  = buildErrorName(code, tag);
        errorInfo.code  = code;
        errorInfo.cause = cause;
        return errorInfo;
    }

    /**
     * @en Generate canceled error information. <br>
     *     The [[ErrorInfo]] object generated by this function has [[RESULT_CODE.CANCELED]] code.
     * @ja キャンセルエラー情報生成 <br>
     *     この関数で生成された [[ErrorInfo]] は [[RESULT_CODE.CANCELED]] を格納する
     *
     * @param tag
     *  - `en` Log tag information
     *  - `ja` 識別情報
     * @param cause
     *  - `en` low-level Error object
     *  - `ja` 下位のエラーを指定
     * @returns
     */
    export function makeCanceledErrorInfo(tag?: string, cause?: Error): ErrorInfo {
        return makeErrorInfo(RESULT_CODE.CANCELED, tag, CANCELED_MESSAGE, cause);
    }

    /**
     * @es Judge the error is canceled.
     * @ja エラー情報がキャンセルされたものか判定
     *
     * @example <br>
     *
     * ```ts
     *  :
     *  .catch((reason: ErrorInfo) => {
     *      if (!isCanceledError(reason)) {
     *          handleErrorInfo(reason);
     *      }
     *   });
     *  :
     * ```
     *
     * @param error
     * @returns
     *  - `en` true: canceled error / false: others
     *  - `ja` true: キャンセル / false: その他エラー
     */
    export function isCanceledError(error: Error | string): boolean {
        if ("string" === typeof error) {
            return CANCELED_MESSAGE === error;
        } else {
            const errorInfo = <ErrorInfo>error;
            if (errorInfo) {
                if (RESULT_CODE.CANCELED === errorInfo.code || CANCELED_MESSAGE === errorInfo.message) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @es Convert from any type error information to [[ErrorInfo]] object.
     * @jp あらゆるエラー入力を [[ErrorInfo]] に変換
     */
    export function ensureErrorInfo(cause?: any): ErrorInfo {
        const unknown: ErrorInfo = {
            name: UNKNOWN_ERROR_NAME + ERROR_NAME_SEPARATOR,
            code: RESULT_CODE.FAILED,
            message: "unknown error occured.",
        };
        const valid = (error?: any): boolean => {
            if (!error) {
                return false;
            }
            return (
                "number" === typeof error.code &&
                "string" === typeof error.name &&
                "string" === typeof error.message
            );
        };

        if (valid(cause)) {
            return cause;
        } else if (cause instanceof Error) {
            (<ErrorInfo>cause).code = RESULT_CODE.FAILED;
            return <ErrorInfo>cause;
        } else if ("string" === typeof cause) {
            if (isCanceledError(cause)) {
                return makeCanceledErrorInfo();
            } else {
                return { ...unknown, ...{ message: cause } };
            }
        } else if ("number" === typeof cause) {
            return {
                ...unknown,
                ...<any>{
                    cause: {
                        name: UNKNOWN_ERROR_NAME + ERROR_NAME_SEPARATOR,
                        message: "Please check the error code.",
                        code: cause
                    }
                }
            };
        } else if ("object" === typeof cause) {
            return { ...unknown, ...cause };
        }

        return unknown;
    }

    /**
     * @internal for CDP modules assignable range.
     */
    export const MODULE_RESULT_CODE_RANGE_CDP = 100;

    /**
     * @en Offset value enumeration for [[RESULT_CODE]]. <br>
     *     The client can expand a definition in other module.
     * @ja [[RESULT_CODE]] のオフセット値 <br>
     *     エラーコード対応するモジュール内で 定義を拡張する.
     *
     * @example <br>
     *
     * ```ts
     *  export enum RESULT_CODE {
     *      ERROR_SOMEMODULE_UNEXPECTED  = DECLARE_ERROR_CODE(RESULT_CODE_BASE, LOCAL_CODE_BASE.COMMON + 1, "error unexpected."),
     *      ERROR_SOMEMODULE_INVALID_ARG = DECLARE_ERROR_CODE(RESULT_CODE_BASE, LOCAL_CODE_BASE.COMMON + 2, "invalid arguments."),
     *  }
     *  ASSIGN_RESULT_CODE(RESULT_CODE);
     * ```
     */
    export enum RESULT_CODE_BASE {
        CDP_DECLARERATION = 0, // TS2432 対策: 同一 namespace に複数回にわたって同名の enum を宣言する場合に必要.
//      MODULE_A = 1 * MODULE_RESULT_CODE_RANGE,    // ex) moduleA: abs(1001 ～ 1999)
//      MODULE_B = 2 * MODULE_RESULT_CODE_RANGE,    // ex) moduleB: abs(2001 ～ 2999)
//      MODULE_C = 3 * MODULE_RESULT_CODE_RANGE,    // ex) moduleC: abs(3001 ～ 3999)
        CDP = 1 * MODULE_RESULT_CODE_RANGE_CDP,     // cdp reserved. abs(0 ～ 1000)
    }
    // "CDP" 以外の namespace で定義した場合は、ASSIGN ユーティリティをコールする.
//  ASSIGN_RESULT_CODE_BASE(RESULT_CODE_BASE);

    /**
     * @en Generate success code.
     * @ja 成功コードを生成
     *
     * @param base
     * @param localCode
     * @param message
     */
    export function DECLARE_SUCCESS_CODE(base: number | string, localCode: number, message?: string): number {
        if ("string" === typeof base) {
            base = CDP.RESULT_CODE_BASE[base];
        }
        return declareResultCode(<RESULT_CODE_BASE>base, localCode, message, true);
    }

    /**
     * @en Generate error code.
     * @ja エラーコード生成
     *
     * @param base
     * @param localCode
     * @param message
     */
    export function DECLARE_ERROR_CODE(base: number | string, localCode: number, message?: string): number {
        if ("string" === typeof base) {
            base = CDP.RESULT_CODE_BASE[base];
        }
        return declareResultCode(<RESULT_CODE_BASE>base, localCode, message, false);
    }

    /**
     * @en Judge success or not.
     * @ja 成功判定
     *
     * @param code
     */
    export function SUCCEEDED(code: number): boolean {
        return 0 <= code;
    }

    /**
     * @en Judge error or not.
     * @ja 失敗判定
     *
     * @param code
     */
    export function FAILED(code: number): boolean {
        return code < 0;
    }

    /**
     * @en Assign declared [[RESULT_CODE_BASE]] to root enumeration.<br>
     *     (It's necessary also to merge enum in the module system environment.)
     * @ja 拡張した [[RESULT_CODE_BASE]] を ルート enum にアサイン<br>
     *     モジュールシステム環境においても、enum をマージするために必要
     */
    export function ASSIGN_RESULT_CODE_BASE(resultCodeBase: object): void {
        CDP.RESULT_CODE_BASE = <any>{ ...CDP.RESULT_CODE_BASE, ...resultCodeBase };
    }

    /**
     * @en Assign declared [[ASSIGN_RESULT_CODE]] to root enumeration.
     *     (It's necessary also to merge enum in the module system environment.)
     * @ja 拡張した [[ASSIGN_RESULT_CODE]] を ルート enum にアサイン
     *     モジュールシステム環境においても、enum をマージするために必要
     */
    export function ASSIGN_RESULT_CODE(resultCode: object): void {
        CDP.RESULT_CODE = <any>{ ...CDP.RESULT_CODE, ...resultCode };
    }

    ///////////////////////////////////////////////////////////////////////
    // module error declaration:

    const FUNCTION_CODE_RANGE = 10;

    // cdp.core 内のローカルコードオフセット値
    enum LOCAL_CODE_BASE {
        CORE    = 0,
        PATCH   = 1 * FUNCTION_CODE_RANGE,
    }

    // @internal Error code definition of `cdp-core`.
    export enum RESULT_CODE {
        ERROR_CDP_DECLARATION_CDP = 0, // TS2432 対策: 同一 namespace に複数回にわたって同名の enum を宣言する場合に必要.
        /** `en` [[CDP.initialize]]() failer code. <br> `ja` [[CDP.initialize]]() のエラーコード */
        ERROR_CDP_INITIALIZE_FAILED = DECLARE_ERROR_CODE(RESULT_CODE_BASE.CDP, LOCAL_CODE_BASE.CORE + 1, "initialized failed."),
    }
    // "CDP" 以外の namespace で定義した場合は、ASSIGN ユーティリティをコールする.
//  ASSIGN_RESULT_CODE_BASE(RESULT_CODE);

    ///////////////////////////////////////////////////////////////////////
    // private static methods:

    // RESULT_CODE の登録
    function declareResultCode(base: RESULT_CODE_BASE, moduleCode: number, message?: string, succeeded: boolean = false): number {
        if (moduleCode <= 0 || MODULE_RESULT_CODE_RANGE <= moduleCode) {
            console.error(`declareResultCode(), invalid localCode range. [localCode: ${moduleCode}]`);
            return;
        }
        const signed = succeeded ? 1 : -1;
        const resultCode = signed * (base + moduleCode);
        s_code2message[resultCode] = message ? message : (`[RESULT_CODE: ${resultCode}]`);
        return resultCode;
    }

    // RESULT_CODE から登録されているメッセージを取得
    function messageFromResultCode(resultCode: number): string {
        if (s_code2message[resultCode]) {
            return s_code2message[resultCode];
        } else {
            return `unregistered result code. [RESULT_CODE: ${resultCode}]`;
        }
    }

    // RESULT_CODE から登録されている RESULT_CODE 文字列を取得
    function buildErrorName(resultCode: number, tag: string): string {
        const prefix = tag || "";
        if (CDP.RESULT_CODE[resultCode]) {
            return prefix + CDP.RESULT_CODE[resultCode] + ERROR_NAME_SEPARATOR;
        } else {
            return prefix + UNKNOWN_ERROR_NAME + ERROR_NAME_SEPARATOR;
        }
    }
}
