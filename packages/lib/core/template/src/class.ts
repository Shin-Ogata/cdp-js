import {
    JST,
    TemplateDelimiters,
    ITemplateEngine,
    TemplateScanner,
    TemplateContext,
    TemplateWriter,
    TemplateEscaper,
} from './interfaces';
import { globalSettings } from './internal';
import { CacheLocation, clearCache } from './cache';
import {
    PlainObject,
    isString,
    typeString,
} from './utils';
import { Scanner } from './scanner';
import { Context } from './context';
import { Writer } from './writer';

/** [[TemplateEngine]] common settings */
globalSettings.writer = new Writer();

/**
 * @en [[TemplateEngine]] global settng options
 * @ja [[TemplateEngine]] グローバル設定オプション
 */
export interface TemplateGlobalSettings {
    writer?: TemplateWriter;
    tags?: TemplateDelimiters;
    escape?: TemplateEscaper;
}

/**
 * @en [[TemplateEngine]] compile options
 * @ja [[TemplateEngine]] コンパイルオプション
 */
export interface TemplateCompileOptions {
    tags?: TemplateDelimiters;
}

/**
 * @en TemplateEngine utility class.
 * @ja TemplateEngine ユーティリティクラス
 */
export class TemplateEngine implements ITemplateEngine {

///////////////////////////////////////////////////////////////////////
// public static methods:

    /**
     * @en Get [[JST]] from template source.
     * @ja テンプレート文字列から [[JST]] を取得
     *
     * @param template
     *  - `en` template source string
     *  - `ja` テンプレート文字列
     * @param options
     *  - `en` compile options
     *  - `ja` コンパイルオプション
     */
    public static compile(template: string, options?: TemplateCompileOptions): JST {
        if (!isString(template)) {
            throw new TypeError(`Invalid template! the first argument should be a "string" but "${typeString(template)}" was given for TemplateEngine.compile(template, options)`);
        }

        const { tags } = options || globalSettings;
        const { writer } = globalSettings;

        const jst = (view?: PlainObject, partials?: PlainObject): string => {
            return writer.render(template, view || {}, partials, tags);
        };

        const { tokens, cacheKey } = writer.parse(template, tags);
        jst.tokens        = tokens;
        jst.cacheKey      = cacheKey;
        jst.cacheLocation = [CacheLocation.NAMESPACE, CacheLocation.ROOT];

        return jst;
    }

    /**
     * @en Clears all cached templates in the default [[TemplateWriter]].
     * @ja 既定の [[TemplateWriter]] のすべてのキャッシュを削除
     */
    public static clearCache(): void {
        clearCache();
    }

    /**
     * @en Change [[TemplateEngine]] global settings.
     * @ja [[TemplateEngine]] グローバル設定の更新
     *
     * @param settings
     *  - `en` new settings
     *  - `ja` 新しい設定値
     * @returns
     *  - `en` old settings
     *  - `ja` 古い設定値
     */
    public static setGlobalSettings(setiings: TemplateGlobalSettings): TemplateGlobalSettings {
        const oldSettings = { ...globalSettings };
        const { writer, tags, escape } = setiings;
        writer && (globalSettings.writer = writer);
        tags   && (globalSettings.tags   = tags);
        escape && (globalSettings.escape = escape);
        return oldSettings;
    }

///////////////////////////////////////////////////////////////////////
// public static methods: for debug

    /** @internal Create [[TemplateScanner]] instance */
    public static createScanner(src: string): TemplateScanner {
        return new Scanner(src);
    }

    /** @internal Create [[TemplateContext]] instance */
    public static createContext(view: PlainObject, parentContext?: Context): TemplateContext {
        return new Context(view, parentContext);
    }

    /** @internal Create [[TemplateWriter]] instance */
    public static createWriter(): TemplateWriter {
        return new Writer();
    }
}
