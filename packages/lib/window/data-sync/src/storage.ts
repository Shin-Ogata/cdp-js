import {
    PlainObject,
    isArray,
    isString,
} from '@cdp/core-utils';
import {
    RESULT_CODE,
    makeResult,
    toResult,
} from '@cdp/result';
import { IStorage, IStorageOptions } from '@cdp/core-storage';
import { webStorage } from '@cdp/web-storage';
import {
    IDataSyncOptions,
    IDataSync,
    SyncMethods,
    SyncContext,
    SyncResult,
} from './interfaces';
import { resolveURL } from './internal';

/** @internal */
const enum Const {
    Separator = '-',
}

/**
 * @en [[IDataSync]] interface for [[IStorage]] accessor.
 * @ja [[IStorage]] アクセッサを備える [[IDataSync]] インターフェイス
 */
export interface IStorageDataSync<T extends object = PlainObject> extends IDataSync<T> {
    /**
     * @en Get current [[IStorage]] instance.
     * @ja 現在対象の [[IStorage]] インスタンスにアクセス
     */
    getStorage(): IStorage;

    /**
     * @en Set new [[IStorage]] instance.
     * @ja 新しい [[IStorage]] インスタンスを設定
     */
    setStorage(newStorage: IStorage): this;
}

/**
 * @en Options interface for [[StorageDataSync]].
 * @ja [[StorageDataSync]] に指定するオプション
 */
export type StorageDataSyncOptions = IDataSyncOptions & IStorageOptions;

//__________________________________________________________________________________________________//

/** @internal check model or not */
function isModel(context: SyncContext): boolean {
    return !!context.constructor['idAttribute'];
}

/** @internal resolve key for localStorage */
function parseContext(context: SyncContext): { model: boolean; key: string; url: string; } {
    const model = isModel(context);
    const url   = resolveURL(context);
    const id    = context.id;
    return {
        model,
        url,
        key: `${url}${(model && id) ? `${Const.Separator}${id}` : ''}`
    };
}

//__________________________________________________________________________________________________//

/**
 * @en The [[IDataSync]] implemant class which target is [[IStorage]]. Default storage is [[WebStorage]].
 * @ja [[IStorage]] を対象とした [[IDataSync]] 実装クラス. 既定値は [[WebStorage]]
 */
class StorageDataSync implements IStorageDataSync {
    private _storage: IStorage;

    /**
     * constructor
     *
     * @param storage
     *  - `en` [[IStorage]] object
     *  - `ja` [[IStorage]] オブジェクト
     */
    constructor(storage: IStorage) {
        this._storage = storage;
    }

///////////////////////////////////////////////////////////////////////
// implements: IStorageDataSync

    /**
     * @en Get current [[IStorage]] instance.
     * @ja 現在対象の [[IStorage]] インスタンスにアクセス
     */
    getStorage(): IStorage {
        return this._storage;
    }

    /**
     * @en Set new [[IStorage]] instance.
     * @ja 新しい [[IStorage]] インスタンスを設定
     */
    setStorage(newStorage: IStorage): this {
        this._storage = newStorage;
        return this;
    }

///////////////////////////////////////////////////////////////////////
// implements: IDataSync

    /**
     * @en [[IDataSync]] kind signature.
     * @ja [[IDataSync]] の種別を表す識別子
     */
    get kind(): string {
        return 'storage';
    }

    /**
     * @en Do data synchronization.
     * @ja データ同期
     *
     * @param method
     *  - `en` operation string
     *  - `ja` オペレーションを指定
     * @param context
     *  - `en` synchronized context object
     *  - `ja` 同期するコンテキストオブジェクト
     * @param options
     *  - `en` storage option object
     *  - `ja` ストレージオプション
     */
    async sync<K extends SyncMethods>(method: K, context: SyncContext, options?: StorageDataSyncOptions): Promise<SyncResult<K>> {
        const { model, key, url } = parseContext(context);
        if (!url) {
            throw makeResult(RESULT_CODE.ERROR_MVC_INVALID_SYNC_PARAMS, 'A "url" property or function must be specified.');
        }

        let responce: PlainObject | void | null;
        switch (method) {
            case 'create':
            case 'update':
            case 'patch': {
                responce = await this.update(key, context, url, options);
                break;
            }
            case 'delete':
                responce = await this.destroy(key, context, url, options);
                break;
            case 'read':
                responce = await this.find(model, key, url, options);
                if (null == responce) {
                    throw makeResult(RESULT_CODE.ERROR_MVC_INVALID_SYNC_STORAGE_DATA_NOT_FOUND, `method: ${method}`);
                }
                break;
            default:
                throw makeResult(RESULT_CODE.ERROR_MVC_INVALID_SYNC_PARAMS, `unknown method: ${method}`);
        }

        context.trigger('@request', context, responce as Promise<PlainObject>);
        return responce as SyncResult<K>;
    }

///////////////////////////////////////////////////////////////////////
// primate methods:

    /** @internal */
    private async queryEntries(url: string, options?: StorageDataSyncOptions): Promise<{ ids: boolean; items: (PlainObject | string)[]; }> {
        const items = await this._storage.getItem<PlainObject>(url, options);
        if (null == items) {
            return { ids: true, items: [] };
        } else if (isArray(items)) {
            return { ids: isString(items[0]), items };
        } else {
            throw makeResult(RESULT_CODE.ERROR_MVC_INVALID_SYNC_STORAGE_ENTRY, `entry is not Array type.`);
        }
    }

    /** @internal */
    private saveEntries(url: string, entries: string[], options?: StorageDataSyncOptions): Promise<void> {
        return this._storage.setItem(url, entries, options);
    }

    /** @internal */
    private async find(model: boolean, key: string, url: string, options?: StorageDataSyncOptions): Promise<PlainObject | null> {
        if (model) {
            return this._storage.getItem<PlainObject>(key, options);
        } else {
            try {
                // multi-entry
                const { ids, items } = await this.queryEntries(url, options);
                if (ids) {
                    // findAll
                    const entires: PlainObject[] = [];
                    for (const id of items as string[]) {
                        const entry = await this._storage.getItem<PlainObject>(`${url}${Const.Separator}${id}`, options);
                        entry && entires.push(entry);
                    }
                    return entires;
                } else {
                    return items;
                }
            } catch (e) {
                const result = toResult(e);
                if (RESULT_CODE.ERROR_MVC_INVALID_SYNC_STORAGE_ENTRY === result.code) {
                    return this._storage.getItem<PlainObject>(key, options);
                }
                throw e;
            }
        }
    }

    /** @internal */
    private async update(key: string, context: SyncContext, url: string, options?: StorageDataSyncOptions): Promise<PlainObject | null> {
        const { data } = options || {};
        const attrs = Object.assign(context.toJSON(), data);
        await this._storage.setItem(key, attrs, options);
        if (key !== url) {
            const { ids, items } = await this.queryEntries(url, options);
            if (ids && context.id && !items.includes(context.id)) {
                items.push(context.id);
                await this.saveEntries(url, items as string[], options);
            }
        }
        return this.find(true, key, url, options);
    }

    /** @internal */
    private async destroy(key: string, context: SyncContext, url: string, options?: StorageDataSyncOptions): Promise<PlainObject | null> {
        const old = await this._storage.getItem(key, options);
        await this._storage.removeItem(key, options);
        if (key !== url) {
            const { ids, items } = await this.queryEntries(url, options);
            if (ids && context.id) {
                const entries = items.filter(i => i !== context.id);
                await this.saveEntries(url, entries as string[], options);
            }
        }
        return old as PlainObject;
    }
}

/**
 * @en Create [[IStorageDataSync]] object with [[IStorage]].
 * @ja [[IStorage]] を指定して, [[IStorageDataSync]] オブジェクトを構築
 *
 * @param storage
 *  - `en` [[IStorage]] object
 *  - `ja` [[IStorage]] オブジェクト
 */
export const createStorageDataSync = (storage: IStorage): IStorageDataSync => {
    return new StorageDataSync(storage);
};

export const dataSyncSTORAGE = createStorageDataSync(webStorage);
