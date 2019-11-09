/**
 * @en The general null type.
 * @ja 空を示す型定義
 */
export declare type Nil = void | null | undefined;
/**
 * @en The type of object or [[Nil]].
 * @ja [[Nil]] になりえるオブジェクト型定義
 */
export declare type Nillable<T extends {}> = T | Nil;
/**
 * @en Primitive type of JavaScript.
 * @ja JavaScript のプリミティブ型
 */
export declare type Primitive = string | number | boolean | symbol | null | undefined;
/**
 * @en JavaScript type set interface.
 * @ja JavaScript の型の集合
 */
interface TypeList {
    string: string;
    number: number;
    boolean: boolean;
    symbol: symbol;
    undefined: void | undefined;
    object: object | null;
    function(...args: unknown[]): unknown;
}
/**
 * @en The key list of [[TypeList]].
 * @ja [[TypeList]] キー一覧
 */
export declare type TypeKeys = keyof TypeList;
/**
 * @en Type base definition.
 * @ja 型の規定定義
 */
export interface Type<T extends {}> extends Function {
    readonly prototype: T;
}
/**
 * @en Type of constructor.
 * @ja コンストラクタ型
 */
export interface Constructor<T> extends Type<T> {
    new (...args: unknown[]): T;
}
/**
 * @en Type of class.
 * @ja クラス型
 */
export declare type Class<T = any> = Constructor<T>;
/**
 * @en Ensure for function parameters to tuple.
 * @ja 関数パラメータとして tuple を保証
 */
export declare type Arguments<T> = T extends any[] ? T : [T];
/**
 * @en Rmove `readonly` attributes from input type.
 * @ja `readonly` 属性を解除
 */
export declare type Writable<T> = {
    -readonly [K in keyof T]: T[K];
};
/**
 * @en Extract functional property names.
 * @ja 関数プロパティ名の抽出
 */
export declare type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
/**
 * @en Extract functional properties.
 * @ja 関数プロパティの抽出
 */
export declare type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
/**
 * @en Extract non-functional property names.
 * @ja 非関数プロパティ名の抽出
 */
export declare type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
/**
 * @en Extract non-functional properties.
 * @ja 非関数プロパティの抽出
 */
export declare type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
/**
 * @en Extract object key list. (`keyof` alias)
 * @ja オブジェクトのキー一覧を抽出 (`keyof` alias)
 */
export declare type Keys<T extends {}> = keyof T;
/**
 * @en Extract object type list.
 * @ja オブジェクトの型一覧を抽出
 */
export declare type Types<T extends {}> = T[keyof T];
/**
 * @en Convert object key to type.
 * @ja オブジェクトキーから型へ変換
 */
export declare type KeyToType<O extends {}, K extends keyof O> = K extends keyof O ? O[K] : never;
/**
 * @en Convert object type to key.
 * @ja オブジェクト型からキーへ変換
 */
export declare type TypeToKey<O extends {}, T extends Types<O>, K extends keyof O = keyof O> = O[K] extends T ? Extract<Keys<O>, K> : never;
/**
 * @en The [[PlainObject]] type is a JavaScript object containing zero or more key-value pairs. <br>
 *     'Plain' means it from other kinds of JavaScript objects. ex: null, user-defined arrays, and host objects such as `document`.
 * @ja 0 以上の key-value ペアを持つ [[PlainObject]] 定義 <br>The PlainObject type is a JavaScript object containing zero or more key-value pairs. <br>
 *     'Plain' とは他の種類の JavaScript オブジェクトを含まないオブジェクトを意味する. 例:  null, ユーザー定義配列, または `document` のような組み込みオブジェクト
 */
export interface PlainObject<T = any> {
    [key: string]: T;
}
/**
 * @en The data type list by which style compulsion is possible.
 * @ja 型強制可能なデータ型一覧
 */
export declare type TypedData = string | number | boolean | null | object;
/**
 * @en The data type list of TypedArray.
 * @ja TypedArray 一覧
 */
export declare type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
/**
 * @en Check the value exists.
 * @ja 値が存在するか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function exists<O extends {}>(x: Nillable<O>): x is O;
export declare function exists(x: unknown): x is unknown;
/**
 * @en Check the value-type is [[Nil]].
 * @ja [[Nil]] 型であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isNil(x: unknown): x is Nil;
/**
 * @en Check the value-type is String.
 * @ja String 型であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isString(x: unknown): x is string;
/**
 * @en Check the value-type is Number.
 * @ja Number 型であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isNumber(x: unknown): x is number;
/**
 * @en Check the value-type is Boolean.
 * @ja Boolean 型であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isBoolean(x: unknown): x is boolean;
/**
 * @en Check the value-type is Symble.
 * @ja Symbol 型であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isSymbol(x: unknown): x is symbol;
/**
 * @en Check the value-type is primitive type.
 * @ja プリミティブ型であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isPrimitive(x: unknown): x is Primitive;
/**
 * @en Check the value-type is Array.
 * @ja Array 型であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare const isArray: (arg: any) => arg is any[];
/**
 * @en Check the value-type is Object.
 * @ja Object 型であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isObject(x: unknown): x is object;
/**
 * @en Check the value-type is [[PlainObject]].
 * @ja [[PlainObject]] 型であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isPlainObject(x: unknown): x is PlainObject;
/**
 * @en Check the value-type is empty object.
 * @ja 空オブジェクトであるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isEmptyObject(x: unknown): x is object;
/**
 * @en Check the value-type is Function.
 * @ja Function 型であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isFunction(x: unknown): x is TypeList['function'];
/**
 * @en Check the value-type is input.
 * @ja 指定した型であるか判定
 *
 * @param type
 *  - `en` evaluated type
 *  - `ja` 評価する型
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function typeOf<K extends TypeKeys>(type: K, x: unknown): x is TypeList[K];
/**
 * @en Check the value has iterator.
 * @ja iterator を所有しているか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isIterable<T>(x: Nillable<Iterable<T>>): x is Iterable<T>;
export declare function isIterable(x: unknown): x is Iterable<unknown>;
/**
 * @en Check the value is one of [[TypedArray]].
 * @ja 指定したインスタンスが [[TypedArray]] の一種であるか判定
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function isTypedArray(x: unknown): x is TypedArray;
/**
 * @en Check the value instance of input.
 * @ja 指定したインスタンスであるか判定
 *
 * @param ctor
 *  - `en` evaluated constructor
 *  - `ja` 評価するコンストラクタ
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function instanceOf<T extends {}>(ctor: Nillable<Type<T>>, x: unknown): x is T;
/**
 * @en Check the value instance of input constructor (except sub class).
 * @ja 指定コンストラクタのインスタンスであるか判定 (派生クラスは含めない)
 *
 * @param ctor
 *  - `en` evaluated constructor
 *  - `ja` 評価するコンストラクタ
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function ownInstanceOf<T extends {}>(ctor: Nillable<Type<T>>, x: unknown): x is T;
/**
 * @en Get the value's class name.
 * @ja クラス名を取得
 *
 * @param x
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function className(x: any): string;
/**
 * @en Check input values are same value-type.
 * @ja 入力が同一型であるか判定
 *
 * @param lhs
 *  - `en` evaluated value
 *  - `ja` 評価する値
 * @param rhs
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function sameType(lhs: unknown, rhs: unknown): boolean;
/**
 * @en Check input values are same class.
 * @ja 入力が同一クラスであるか判定
 *
 * @param lhs
 *  - `en` evaluated value
 *  - `ja` 評価する値
 * @param rhs
 *  - `en` evaluated value
 *  - `ja` 評価する値
 */
export declare function sameClass(lhs: unknown, rhs: unknown): boolean;
/**
 * @en Get shallow copy of `target` which has only `pickupKeys`.
 * @ja `pickupKeys` で指定されたプロパティのみを持つ `target` の Shallow Copy を取得
 *
 * @param target
 *  - `en` copy source object
 *  - `ja` コピー元オブジェクト
 * @param pickupKeys
 *  - `en` copy target keys
 *  - `ja` コピー対象のキー一覧
 */
export declare function partialize<T extends object, K extends keyof T>(target: T, ...pickupKeys: K[]): Writable<Pick<T, K>>;
export {};
