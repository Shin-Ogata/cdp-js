import { PlainObject } from '@cdp/core-utils';
import { IStorage, IStorageOptions } from '@cdp/core-storage';
import { IDataSyncOptions, IDataSync } from './interfaces';
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
export declare type StorageDataSyncOptions = IDataSyncOptions & IStorageOptions;
/**
 * @en Create [[IStorageDataSync]] object with [[IStorage]].
 * @ja [[IStorage]] を指定して, [[IStorageDataSync]] オブジェクトを構築
 *
 * @param storage
 *  - `en` [[IStorage]] object
 *  - `ja` [[IStorage]] オブジェクト
 */
export declare const createStorageDataSync: (storage: IStorage) => IStorageDataSync;
export declare const dataSyncSTORAGE: IStorageDataSync<PlainObject<any>>;
